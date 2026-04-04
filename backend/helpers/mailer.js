const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS  // Gmail App Password, not your real password
    }
})

const sendOtpEmail = async (email, otp, type = 'reset') => {
    const subject = type === 'verify' ? 'Verify Your Email' : 'Password Reset OTP'
    const heading = type === 'verify' ? 'Email Verification' : 'Password Reset Request'
    const note = type === 'verify'
        ? 'Please verify your email to complete registration.'
        : 'You requested a password reset.'

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: `
            <h2>${heading}</h2>
            <p>${note}</p>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This OTP expires in 10 minutes.</p>
            <p>If you didn't request this, ignore this email.</p>
        `
    })
}

module.exports = { sendOtpEmail }