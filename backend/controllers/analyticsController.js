const Order = require('../models/order')
const User = require('../models/user')
const Product = require('../models/product')

const getAnalytics = async (req, res) => {
    try {
        const { from, to } = req.query

        const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const endDate = to ? new Date(to) : new Date()
        endDate.setHours(23, 59, 59, 999)

        const dateFilter = { createdAt: { $gte: startDate, $lte: endDate } }

        // ── Previous period window (same duration, directly before) ──────
        const periodMs = endDate - startDate
        const previousStart = new Date(startDate.getTime() - periodMs)
        const previousEnd = new Date(startDate.getTime() - 1)

        // ── Parallel data fetch ───────────────────────────────────────────
        const [allOrders, allUsers, allProducts, previousOrders, previousUsersCount] = await Promise.all([
            Order.find(dateFilter).populate('items.product', 'name category gender'),
            User.find(dateFilter),
            Product.find(),
            Order.find({ createdAt: { $gte: previousStart, $lte: previousEnd } }),
            User.countDocuments({ createdAt: { $gte: previousStart, $lte: previousEnd } })
        ])

        // ── Revenue totals ────────────────────────────────────────────────
        const totalRevenue = allOrders
            .filter(o => o.paymentStatus !== 'pending' || o.deliveryType === 'cod' || o.deliveryType === 'pickup')
            .reduce((s, o) => s + (o.grandTotal || 0), 0)

        const totalAdvanceCollected = allOrders.reduce((s, o) => s + (o.advancePaid || 0), 0)

        const previousRevenue = previousOrders
            .filter(o => o.paymentStatus !== 'pending' || o.deliveryType === 'cod' || o.deliveryType === 'pickup')
            .reduce((s, o) => s + (o.grandTotal || 0), 0)

        // ── Revenue by day (current + previous aligned by day offset) ─────
        const totalDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000)) + 1

        const currentRevByOffset = {}
        const currentOrdersByOffset = {}
        allOrders.forEach(o => {
            const offset = Math.floor((new Date(o.createdAt) - startDate) / (24 * 60 * 60 * 1000))
            currentRevByOffset[offset] = (currentRevByOffset[offset] || 0) + (o.grandTotal || 0)
            currentOrdersByOffset[offset] = (currentOrdersByOffset[offset] || 0) + 1
        })

        const prevRevByOffset = {}
        const prevOrdersByOffset = {}
        previousOrders.forEach(o => {
            const offset = Math.floor((new Date(o.createdAt) - previousStart) / (24 * 60 * 60 * 1000))
            prevRevByOffset[offset] = (prevRevByOffset[offset] || 0) + (o.grandTotal || 0)
            prevOrdersByOffset[offset] = (prevOrdersByOffset[offset] || 0) + 1
        })

        const revenueByDay = []
        const ordersByDay = []
        const dailyComparison = []

        for (let i = 0; i < totalDays; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
            const revenue = currentRevByOffset[i] || 0
            const count = currentOrdersByOffset[i] || 0
            revenueByDay.push({ date, revenue })
            ordersByDay.push({ date, count })
            dailyComparison.push({
                date,
                revenue,
                prevRevenue: prevRevByOffset[i] || 0,
                orders: count,
                prevOrders: prevOrdersByOffset[i] || 0,
            })
        }

        // ── Users by day ──────────────────────────────────────────────────
        const usersMap = {}
        allUsers.forEach(u => {
            const day = new Date(u.createdAt).toISOString().slice(0, 10)
            usersMap[day] = (usersMap[day] || 0) + 1
        })
        const usersByDay = Object.entries(usersMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }))

        // ── Order status breakdown ────────────────────────────────────────
        const statusCount = {}
        allOrders.forEach(o => {
            statusCount[o.status] = (statusCount[o.status] || 0) + 1
        })
        const ordersByStatus = Object.entries(statusCount).map(([status, count]) => ({ status, count }))

        // ── Category breakdown ────────────────────────────────────────────
        const categoryRevMap = {}
        const categoryOrderMap = {}
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.product?.category || 'unknown'
                categoryRevMap[cat] = (categoryRevMap[cat] || 0) + (item.itemTotal || 0)
                categoryOrderMap[cat] = (categoryOrderMap[cat] || 0) + 1
            })
        })
        const revenueByCategory = Object.entries(categoryRevMap).map(([category, revenue]) => ({
            category, revenue, orders: categoryOrderMap[category] || 0
        })).sort((a, b) => b.revenue - a.revenue)

        // ── Payment method breakdown (count + revenue) ────────────────────
        const paymentRevMap = {}
        allOrders.forEach(o => {
            const m = o.paymentMethod || 'unknown'
            if (!paymentRevMap[m]) paymentRevMap[m] = { method: m, count: 0, revenue: 0 }
            paymentRevMap[m].count += 1
            paymentRevMap[m].revenue += o.grandTotal || 0
        })
        const ordersByPayment = Object.values(paymentRevMap)
        // Also keep simple format for backward compatibility
        const revenueByPaymentMethod = Object.values(paymentRevMap)

        // ── Delivery type breakdown ───────────────────────────────────────
        const deliveryMap = {}
        allOrders.forEach(o => {
            deliveryMap[o.deliveryType] = (deliveryMap[o.deliveryType] || 0) + 1
        })
        const ordersByDelivery = Object.entries(deliveryMap).map(([type, count]) => ({ type, count }))

        // ── Top products ──────────────────────────────────────────────────
        const productSalesMap = {}
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const id = item.product?._id?.toString()
                const name = item.product?.name || 'Unknown'
                if (!id) return
                if (!productSalesMap[id]) productSalesMap[id] = { name, revenue: 0, orders: 0 }
                productSalesMap[id].revenue += item.itemTotal || 0
                productSalesMap[id].orders += item.quantity || 1
            })
        })
        const topProducts = Object.values(productSalesMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)

        // ── Metal popularity ──────────────────────────────────────────────
        const metalMap = {}
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const metal = item.selectedMetal || 'unknown'
                metalMap[metal] = (metalMap[metal] || 0) + 1
            })
        })
        const metalBreakdown = Object.entries(metalMap).map(([metal, count]) => ({ metal, count }))

        // ── Purity breakdown ──────────────────────────────────────────────
        const purityMap = {}
        allOrders.forEach(order => {
            order.items.forEach(item => {
                const purity = item.selectedPurity || 'unknown'
                const metal = item.selectedMetal || 'unknown'
                const key = purity
                if (!purityMap[key]) purityMap[key] = { purity, metal, count: 0, revenue: 0 }
                purityMap[key].count += 1
                purityMap[key].revenue += item.itemTotal || 0
            })
        })
        const purityBreakdown = Object.values(purityMap).sort((a, b) => b.count - a.count)

        // ── Gender breakdown from orders ──────────────────────────────────
        const genderMap = {}
        allOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.product?.gender) {
                    const g = item.product.gender
                    genderMap[g] = (genderMap[g] || 0) + 1
                }
            })
        })
        const ordersByGender = Object.entries(genderMap).map(([gender, count]) => ({ gender, count }))

        // ── Fulfillment & payment stats ───────────────────────────────────
        const cancelledCount = allOrders.filter(o => o.status === 'cancelled').length
        const deliveredCount = allOrders.filter(o => o.status === 'delivered').length
        const fullyPaidCount = allOrders.filter(o => o.paymentStatus === 'fully_paid').length
        const advancePaidCount = allOrders.filter(o => o.paymentStatus === 'advance_paid').length
        const pendingCount = allOrders.filter(o => o.paymentStatus === 'pending').length
        const totalItems = allOrders.reduce((s, o) => s + (o.items?.length || 0), 0)

        const fulfillmentStats = {
            cancelledCount,
            cancelRate: allOrders.length > 0 ? Math.round((cancelledCount / allOrders.length) * 100) : 0,
            deliveredCount,
            deliveryRate: allOrders.length > 0 ? Math.round((deliveredCount / allOrders.length) * 100) : 0,
            fullyPaidCount,
            advancePaidCount,
            pendingCount,
            avgItemsPerOrder: allOrders.length > 0 ? Math.round((totalItems / allOrders.length) * 10) / 10 : 0,
        }

        // Payment status pie data
        const paymentStatusData = [
            { status: 'Fully Paid', count: fullyPaidCount },
            { status: 'Advance Paid', count: advancePaidCount },
            { status: 'Pending', count: pendingCount },
        ].filter(d => d.count > 0)

        // ── Summary stats ─────────────────────────────────────────────────
        res.json({
            summary: {
                totalOrders: allOrders.length,
                totalRevenue,
                totalAdvanceCollected,
                totalUsers: allUsers.length,
                totalProducts: allProducts.length,
                avgOrderValue: allOrders.length > 0 ? Math.round(totalRevenue / allOrders.length) : 0,
                previousRevenue,
                previousOrders: previousOrders.length,
                previousUsers: previousUsersCount,
            },
            revenueByDay,
            ordersByDay,
            usersByDay,
            dailyComparison,
            ordersByStatus,
            revenueByCategory,
            ordersByPayment,
            revenueByPaymentMethod,
            ordersByDelivery,
            topProducts,
            metalBreakdown,
            purityBreakdown,
            ordersByGender,
            fulfillmentStats,
            paymentStatusData,
        })
    } catch (error) {
        console.error(error)
        res.json({ error: 'Failed to load analytics' })
    }
}

module.exports = { getAnalytics }
