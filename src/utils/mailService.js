import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.ethereal.email',
            port: process.env.MAIL_PORT || 587,
            secure: process.env.MAIL_PORT == 465,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendMail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.MAIL_FROM || '"Opti-Reserve" <no-reply@optireserve.com>',
                to,
                subject,
                html,
            });
            console.log("Email sent: %s", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            return null;
        }
    }

    async sendBookingConfirmation(user, booking, resource, timeSlot) {
        const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0d41eb; text-align: center;">Booking Request Received!</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your booking request for <strong>${resource.name}</strong> has been received and is currently <strong>PENDING</strong> approval.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${timeSlot.startTime} - ${timeSlot.endTime}</p>
        </div>
        <p>We will notify you once the admin reviews your request.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Opti-Reserve System</p>
      </div>
    `;
        return this.sendMail(user.email, `Booking Received: ${resource.name}`, html);
    }

    async sendStatusUpdate(user, booking, resource, timeSlot, status) {
        const color = status === "confirmed" ? "#28a745" : "#dc3545";
        const statusText = status.toUpperCase();

        const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: ${color}; text-align: center;">Booking ${statusText}!</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Your booking for <strong>${resource.name}</strong> on <strong>${new Date(booking.bookingDate).toLocaleDateString()}</strong> has been <strong>${statusText}</strong>.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Resource:</strong> ${resource.name}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${timeSlot.startTime} - ${timeSlot.endTime}</p>
        </div>
        ${status === "confirmed" ? '<p>You are all set! Please arrive on time.</p>' : '<p>We apologize for the inconvenience. You can try booking another slot.</p>'}
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Opti-Reserve System</p>
      </div>
    `;
        return this.sendMail(user.email, `Booking ${statusText}: ${resource.name}`, html);
    }

    async sendWaitlistJoinConfirmation(user, resource, timeSlot, bookingDate) {
        const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #6c757d; text-align: center;">Waitlist Joined! ⏳</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>You've successfully joined the waitlist for <strong>${resource.name}</strong> on <strong>${new Date(bookingDate).toLocaleDateString()}</strong>.</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Time Slot:</strong> ${timeSlot.startTime} - ${timeSlot.endTime}</p>
        </div>
        <p>We will automatically email you if this slot becomes available!</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Opti-Reserve System</p>
      </div>
    `;
        return this.sendMail(user.email, `Added to Waitlist: ${resource.name}`, html);
    }

    async sendWaitlistPromotion(user, resource, timeSlot, bookingDate) {
        const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #ffc107; text-align: center;">Good News! You've been Promoted! 🎊</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>A slot has become available for <strong>${resource.name}</strong>, and you've been automatically promoted from the waitlist!</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Resource:</strong> ${resource.name}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${timeSlot.startTime} - ${timeSlot.endTime}</p>
        </div>
        <p>Your booking is now <strong>PENDING</strong> admin approval. We will notify you once it's confirmed.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Opti-Reserve System</p>
      </div>
    `;
        return this.sendMail(user.email, `Waitlist Promotion: ${resource.name} is now available!`, html);
    }
}

export default new MailService();
