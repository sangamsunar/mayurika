# Test Case Documentation

## TC-001: User Login Form Validation

### Table 1: Test Case 1

| Field | Details |
|-------|---------|
| **Objective** | To test if user login form validates correctly when email and password fields are empty. |
| **Action** | Click on login button with empty email and password fields. |
| **Expected Result** | Warning messages must be displayed for empty email and password fields. |
| **Actual Result** | Warning messages for empty email and password fields are displayed. |
| **Test Result** | **Successful** |

---

## TC-002: User Registration with Valid Data

### Table 2: Test Case 2

| Field | Details |
|-------|---------|
| **Objective** | To test if user can successfully register with valid credentials. |
| **Action** | Enter valid name, email, password and click "Register" button. |
| **Expected Result** | User account is created and success message "Registration successful!" is displayed. Redirect to email verification page. |
| **Actual Result** | User account created successfully. Success message displayed and redirected to verify email page. |
| **Test Result** | **Successful** |

---

## TC-003: Add Product to Cart

### Table 3: Test Case 3

| Field | Details |
|-------|---------|
| **Objective** | To test if user can add a product to shopping cart from product detail page. |
| **Action** | Navigate to product detail page, select quantity, and click "Add to Cart" button. |
| **Expected Result** | Product is added to cart. Toast notification "Added to Cart" appears. Cart count increments. |
| **Actual Result** | Product successfully added to cart. Toast notification displayed. Cart icon shows updated count. |
| **Test Result** | **Successful** |

---

## TC-004: Checkout Process

### Table 4: Test Case 4

| Field | Details |
|-------|---------|
| **Objective** | To test if user can proceed through checkout and place an order. |
| **Action** | Navigate to cart, proceed to checkout, enter shipping address, and click "Place Order". |
| **Expected Result** | Order is placed successfully. Order confirmation page displayed with order ID. Confirmation email sent to user. |
| **Actual Result** | Order placed successfully. Order ID: #12345 displayed. Confirmation email received. |
| **Test Result** | **Successful** |

---

## TC-005: Admin Dashboard - Add Product

### Table 5: Test Case 5

| Field | Details |
|-------|---------|
| **Objective** | To test if admin can add a new product to inventory. |
| **Action** | Login as admin, go to Admin Dashboard, click "Add Product", fill form with product details and upload image. |
| **Expected Result** | Product is saved to database. Product appears in product list. Success notification shown. |
| **Actual Result** | Product saved successfully. New product visible in inventory list. Notification: "Product added successfully". |
| **Test Result** | **Successful** |

---
