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
      const cleanPass = process.env.SMTP_PASS.replace(/\s+/g, '');
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: cleanPass,
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
    childName,
    childGrade,
    city,
    schoolName,
  } = bookingDetails;

  const sender = process.env.SMTP_FROM || '"Codeyoung Admissions" <admissions@codeyoung.com>';

  try {
    const transporter = await getTransporter();

    // Generate Google Calendar Link for the parent
    let googleCalendarUrl = '';
    try {
      const startDateTime = bookingDetails.bookingDateUTC ? new Date(bookingDetails.bookingDateUTC) : new Date();
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      const fmtGCal = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const datesParam = `${fmtGCal(startDateTime)}/${fmtGCal(endDateTime)}`;
      const title = encodeURIComponent(`Codeyoung 1:1 Trial Class - ${course}${childName ? ` (${childName})` : ''}`);
      const details = encodeURIComponent(
        `Your 1:1 ${course} Trial Class with Codeyoung.\n\n` +
        `Child: ${childName || 'N/A'}\n` +
        `Mentor: ${mentor.name}\n` +
        `Meeting Link: ${meetingLink}\n` +
        `Booking ID: ${bookingId}\n\n` +
        `Please join 5 minutes early using Google Chrome.`
      );
      const location = encodeURIComponent(meetingLink);
      googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${datesParam}&details=${details}&location=${location}`;
    } catch (_) {}

    // 1. Parent Confirmation Email
    const parentHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2563eb, #6366f1); padding: 22px 28px; text-align: center;">
          <h2 style="margin: 0; color: #fff; font-size: 22px;">🎉 Trial Class Confirmed!</h2>
          <p style="margin: 6px 0 0; color: #bfdbfe; font-size: 13px;">Your child's free 1:1 session is all set</p>
        </div>
        <div style="padding: 28px;">
          <p>Dear <strong>${parent.name}</strong>,</p>
          <p>Wonderful news! We've confirmed your child's free 1:1 trial class with Codeyoung. An expert mentor has been assigned and your meeting link is ready.</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e2e8f0; width: 42%; color: #64748b; font-size: 13px;">Course</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; color: #2563eb; font-weight: bold;">${course}</td>
            </tr>
            ${childName ? `<tr>
              <td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Child's Name</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">${childName}</td>
            </tr>` : ''}
            ${childGrade ? `<tr>
              <td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Grade</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">${childGrade}</td>
            </tr>` : ''}
            ${schoolName ? `<tr>
              <td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">School</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">${schoolName}${city ? `, ${city}` : ''}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Your Local Time</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${parent.formattedTime}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">Assigned Mentor</td>
              <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">${mentor.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; font-weight: bold; color: #64748b; font-size: 13px;">Booking ID</td>
              <td style="padding: 10px 14px;"><code style="background:#eff6ff;color:#2563eb;padding:2px 6px;border-radius:4px;font-size:12px;">${bookingId}</code></td>
            </tr>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${meetingLink}" style="background: linear-gradient(135deg, #2563eb, #6366f1); color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; margin-bottom: 12px;">
              🚀 Join Your 1:1 Live Class
            </a>
            ${googleCalendarUrl ? `
            <div>
              <a href="${googleCalendarUrl}" target="_blank" style="background-color: #ffffff; color: #1e293b; border: 1.5px solid #cbd5e1; padding: 10px 22px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; margin-top: 6px;">
                📅 Add Event to Google Calendar
              </a>
            </div>` : ''}
            <p style="margin-top: 10px; font-size: 12px; color: #94a3b8;">Meeting URL: <a href="${meetingLink}" style="color: #2563eb;">${meetingLink}</a></p>
          </div>

          <div style="background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #78350f; margin-bottom: 16px;">
            💡 <strong>Tip:</strong> Use a laptop or desktop with Google Chrome and a working webcam for the best experience.
          </div>

          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 14px; margin: 0;">
            If you have any questions, reply directly to this email. — The Codeyoung Team
          </p>
        </div>
      </div>
    `;

    const parentMailOptions = {
      from: sender,
      to: parent.email,
      subject: `✅ Confirmed: ${childName ? childName + "'s " : ''}Free 1:1 ${course} Trial Class — Codeyoung`,
      text: `Dear ${parent.name},\n\nYour 1:1 ${course} trial class is confirmed!\n\nChild: ${childName || 'N/A'} | Grade: ${childGrade || 'N/A'}\nSchool: ${schoolName || 'N/A'}, ${city || 'N/A'}\nTiming: ${parent.formattedTime}\nAssigned Mentor: ${mentor.name}\nMeeting Link: ${meetingLink}\nBooking ID: ${bookingId}\n\nBest regards,\nCodeyoung Team`,
      html: parentHtml,
    };

    const parentInfo = await transporter.sendMail(parentMailOptions);
    const parentPreviewUrl = nodemailer.getTestMessageUrl(parentInfo) || null;
    if (parentPreviewUrl) {
      console.log(`✉️ Parent Confirmation Email sent! Preview: ${parentPreviewUrl}`);
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
