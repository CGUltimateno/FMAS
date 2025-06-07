const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const LOGS_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const logEmailAttempt = (type, to, success, error = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type} to ${to}: ${success ? 'SUCCESS' : 'FAILED'} ${error ? '- ' + error.message : ''}\n`;
    fs.appendFileSync(path.join(LOGS_DIR, 'email.log'), logEntry);
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'footballmas5412@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    }
});

class EmailService {
    static async sendVerificationEmail(to, token) {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

        const mailOptions = {
            from: '"FMAS Admin" <footballmas5412@gmail.com>',
            to,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">Email Verification</h2>
                    <p>Thank you for registering. Please click the button below to verify your email address:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${verificationLink}" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                    </div>
                    <p>If the button doesn't work, you can also use this link: <a href="${verificationLink}">${verificationLink}</a></p>
                    <p>This link will expire in 24 hours.</p>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Verification email sent:', info.messageId);
            logEmailAttempt('VERIFICATION', to, true);
            return info;
        } catch (error) {
            console.error('Error sending verification email:', error);
            logEmailAttempt('VERIFICATION', to, false, error);
            return {
                status: 'error',
                message: 'Verification email could not be sent. Please contact support.'
            };
        }
    }

    static async sendPasswordResetEmail(to, token) {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        const mailOptions = {
            from: '"FMAS Admin" <footballmas5412@gmail.com>',
            to,
            subject: 'Reset Your Password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333;">Password Reset</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetLink}" style="background-color: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    </div>
                    <p>If the button doesn't work, you can also use this link: <a href="${resetLink}">${resetLink}</a></p>
                    <p>This link will expire in 1 hour.</p>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Password reset email sent:', info.messageId);
            logEmailAttempt('PASSWORD_RESET', to, true);
            return info;
        } catch (error) {
            console.error('Error sending password reset email:', error);
            logEmailAttempt('PASSWORD_RESET', to, false, error);

            return {
                status: 'error',
                message: 'Password reset email could not be sent. Please contact support.'
            };
        }
    }
}

module.exports = EmailService;