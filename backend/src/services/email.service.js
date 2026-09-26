import nodemailer from 'nodemailer';

let transporterPromise = null;

/**
 * Initializes and caches the Nodemailer transporter.
 * If SMTP credentials are provided in env, uses them.
 * Otherwise, creates an Ethereal test account automatically.
 */
const getTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    if (
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    ) {
      console.log('📧 Using custom SMTP configuration for emails.');
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // Otherwise, generate an Ethereal test account for development
    console.log('📧 Initializing Ethereal test email account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log(`✉️ Ethereal Email Account Ready: ${testAccount.user}`);

    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();

  return transporterPromise;
};

/**
 * Sends booking confirmation emails to both the parent and the assigned mentor.
 * 
 * @param {Object} bookingDetails
 * @returns {Promise<{ parentEmailSent: boolean, mentorEmailSent: boolean, parentPreviewUrl: string|null, mentorPreviewUrl: string|null }>}
 */
export const sendBookingConfirmationEmails = async (bookingDetails) => {
  const {
    course,
    meetingLink,
    parent,
    mentor,
    bookingId,
  } = bookingDetails;

  const sender = process.env.SMTP_FROM || '"Codeyoung Admissions" <admissions@codeyoung.com>';

  try {
    const transporter = await getTransporter();

    // 1. Parent Confirmation Email
    const parentHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <div style="background-color: #2563eb; color: #ffffff; padding: 16px; border-radius: 6px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">🎉 Your Free 1:1 Trial Class is Confirmed!</h2>
        </div>
        <p style="margin-top: 20px;">Dear <strong>${parent.name}</strong>,</p>
        <p>Thank you for scheduling a free 1:1 trial class with Codeyoung. Your personalized session has been booked with our expert mentor.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc; border-radius: 6px;">
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0; width: 40%;">Course:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-weight: bold;">${course}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Your Local Timing:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${parent.formattedTime}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Assigned Mentor:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${mentor.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Booking Reference:</td>
            <td style="padding: 10px;"><code>${bookingId}</code></td>
          </tr>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Join 1:1 Live Class 🚀
          </a>
          <p style="margin-top: 8px; font-size: 13px; color: #64748b;">Direct Link: <a href="${meetingLink}" style="color: #2563eb;">${meetingLink}</a></p>
        </div>

        <p style="font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Please join via laptop/desktop with Google Chrome for the best coding experience. If you have any questions, reply directly to this email.
        </p>
      </div>
    `;

    const parentMailOptions = {
      from: sender,
      to: parent.email,
      subject: `Booking Confirmed: 1:1 ${course} Trial Class with Codeyoung`,
      text: `Dear ${parent.name},\n\nYour 1:1 ${course} trial class is confirmed!\n\nTiming: ${parent.formattedTime}\nAssigned Mentor: ${mentor.name}\nMeeting Link: ${meetingLink}\nBooking ID: ${bookingId}\n\nBest regards,\nCodeyoung Team`,
      html: parentHtml,
    };

    const parentInfo = await transporter.sendMail(parentMailOptions);
    const parentPreviewUrl = nodemailer.getTestMessageUrl(parentInfo) || null;
    if (parentPreviewUrl) {
      console.log(`✉️ Parent Confirmation Email sent! Ethereal Preview: ${parentPreviewUrl}`);
    }

    // 2. Mentor Notification Email
    const mentorHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
        <div style="background-color: #059669; color: #ffffff; padding: 16px; border-radius: 6px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">📅 New Trial Class Assigned</h2>
        </div>
        <p style="margin-top: 20px;">Hello <strong>${mentor.name}</strong>,</p>
        <p>A new 1:1 trial class has been scheduled and assigned to you.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f8fafc; border-radius: 6px;">
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0; width: 40%;">Course:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #059669; font-weight: bold;">${course}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Student/Parent:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${parent.name} (${parent.email})</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Parent Country / TZ:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${parent.country} (${parent.timezone})</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e2e8f0;">Your IST Class Time:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${mentor.formattedTime}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Booking Reference:</td>
            <td style="padding: 10px;"><code>${bookingId}</code></td>
          </tr>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetingLink}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Launch Class Session 👨‍🏫
          </a>
          <p style="margin-top: 8px; font-size: 13px; color: #64748b;">Meeting URL: <a href="${meetingLink}" style="color: #059669;">${meetingLink}</a></p>
        </div>
      </div>
    `;

    const mentorMailOptions = {
      from: sender,
      to: mentor.email,
      subject: `New Trial Class Assigned: ${course} with ${parent.name}`,
      text: `Hello ${mentor.name},\n\nA new 1:1 trial class has been assigned to you.\n\nCourse: ${course}\nParent: ${parent.name} (${parent.email})\nTiming (IST): ${mentor.formattedTime}\nMeeting Link: ${meetingLink}\nBooking ID: ${bookingId}\n\nHappy Teaching!`,
      html: mentorHtml,
    };

    const mentorInfo = await transporter.sendMail(mentorMailOptions);
    const mentorPreviewUrl = nodemailer.getTestMessageUrl(mentorInfo) || null;
    if (mentorPreviewUrl) {
      console.log(`✉️ Mentor Notification Email sent! Ethereal Preview: ${mentorPreviewUrl}`);
    }

    return {
      parentEmailSent: true,
      mentorEmailSent: true,
      parentPreviewUrl,
      mentorPreviewUrl,
    };
  } catch (error) {
    console.error('⚠️ Failed to send confirmation email(s):', error.message);
    // Non-blocking: We don't fail the whole booking if email dispatch encounters an issue
    return {
      parentEmailSent: false,
      mentorEmailSent: false,
      parentPreviewUrl: null,
      mentorPreviewUrl: null,
      error: error.message,
    };
  }
};
