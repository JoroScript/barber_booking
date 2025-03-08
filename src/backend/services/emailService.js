import nodemailer from 'nodemailer';
import { DateTime } from 'luxon';

// Optimize the email service by creating a single transporter instance
let transporter = null;

// Initialize the transporter lazily
const getTransporter = () => {
  if (!transporter) {
    console.log('Creating email transporter');
    
    // For Gmail, we need to remove spaces from the app password
    const password = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : '';
    
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: password
      },
      pool: true, // Use connection pooling for better performance
      maxConnections: 5, // Limit to 5 concurrent connections
      maxMessages: 100, // Limit to 100 messages per connection
      rateLimit: 10, // Limit to 10 messages per second
    });
  }
  
  return transporter;
};

/**
 * Formats a date in Bulgarian format
 * @param {string} dateStr - Date string in ISO format
 * @returns {string} Formatted date in Bulgarian
 */
const formatDateBG = (dateStr) => {
  const date = DateTime.fromISO(dateStr, { zone: 'Europe/Sofia' });
  
  const monthsBG = [
    'януари', 'февруари', 'март', 'април', 'май', 'юни',
    'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'
  ];
  
  const daysBG = [
    'неделя', 'понеделник', 'вторник', 'сряда', 
    'четвъртък', 'петък', 'събота'
  ];
  
  return `${date.day} ${monthsBG[date.month - 1]} ${date.year} г. (${daysBG[date.weekday % 7]})`;
};

// Simplified email template for better performance
const createEmailTemplate = (bookingDetails) => {
  const {
    customerName,
    barberName,
    serviceName,
    formattedDate,
    formattedTime,
    duration,
    price
  } = bookingDetails;
  
  return `
    <!DOCTYPE html>
    <html lang="bg">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Потвърждение за резервация</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
        <div style="background: linear-gradient(135deg, #8B0000, #5D0000); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Потвърждение за резервация</h1>
        </div>
        <div style="padding: 30px;">
          <div style="font-size: 18px; margin-bottom: 20px;">
            Здравейте, <span style="color: #8B0000; font-weight: 600;">${customerName}</span>!
          </div>
          
          <div style="margin-bottom: 25px;">
            Вашата резервация беше успешно създадена. По-долу можете да намерите детайли за вашия час:
          </div>
          
          <div style="background-color: #f5f5f5; border-left: 4px solid #8B0000; padding: 20px; border-radius: 4px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">
              <span style="font-weight: 600; color: #555;">Бръснар:</span>
              <span style="color: #333; text-align: right;">${barberName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">
              <span style="font-weight: 600; color: #555;">Услуга:</span>
              <span style="color: #333; text-align: right;">${serviceName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">
              <span style="font-weight: 600; color: #555;">Дата:</span>
              <span style="color: #333; text-align: right;">${formattedDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">
              <span style="font-weight: 600; color: #555;">Час:</span>
              <span style="color: #333; text-align: right;">${formattedTime}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 12px;">
              <span style="font-weight: 600; color: #555;">Времетраене:</span>
              <span style="color: #333; text-align: right;">${duration} минути</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600; color: #555;">Цена:</span>
              <span style="color: #333; text-align: right;">${price} лв.</span>
            </div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="margin-top: 0;">Моля, пристигнете 5-10 минути преди уговорения час. Ако се налага да отмените или промените резервацията си, моля свържете се с нас поне 24 часа предварително.</p>
            <p style="margin-bottom: 0;">Очакваме ви и ви благодарим, че избрахте нашите услуги!</p>
          </div>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 14px; color: #666;">
          <div style="margin-bottom: 10px;">© 2023 Barber Booking. Всички права запазени.</div>
          <div style="margin-top: 15px;">
            <div style="margin-bottom: 5px;">Телефон: <strong>+359 88 888 8888</strong></div>
            <div style="margin-bottom: 5px;">Имейл: <strong>info@barber-booking.com</strong></div>
            <div>Адрес: <strong>ул. "Примерна" 123, София</strong></div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Create plain text version of the email
const createPlainTextEmail = (bookingDetails) => {
  const {
    customerName,
    barberName,
    serviceName,
    formattedDate,
    formattedTime,
    duration,
    price
  } = bookingDetails;
  
  return `
ПОТВЪРЖДЕНИЕ ЗА РЕЗЕРВАЦИЯ
===========================

Здравейте, ${customerName}!

Вашата резервация беше успешно създадена. По-долу можете да намерите детайли за вашия час:

ДЕТАЙЛИ ЗА РЕЗЕРВАЦИЯТА:
------------------------
Бръснар: ${barberName}
Услуга: ${serviceName}
Дата: ${formattedDate}
Час: ${formattedTime}
Времетраене: ${duration} минути
Цена: ${price} лв.

Моля, пристигнете 5-10 минути преди уговорения час. Ако се налага да отмените или промените резервацията си, моля свържете се с нас поне 24 часа предварително.

Очакваме ви и ви благодарим, че избрахте нашите услуги!

===========================
© 2023 Barber Booking. Всички права запазени.

КОНТАКТИ:
Телефон: +359 88 888 8888
Имейл: info@barber-booking.com
Адрес: ул. "Примерна" 123, София
  `;
};

/**
 * Sends a booking confirmation email to the customer
 * @param {Object} bookingDetails - Booking details
 * @returns {Promise} Email sending result
 */
const sendBookingConfirmationEmail = async (bookingDetails) => {
  const {
    customerName,
    customerEmail,
    barberName,
    serviceName,
    date,
    time,
    duration,
    price
  } = bookingDetails;
  
  // Format date and time for display
  const formattedDate = formatDateBG(date);
  const formattedTime = time.substring(0, 5); // Remove seconds if present
  
  // Prepare email content
  const emailData = {
    customerName,
    barberName,
    serviceName,
    formattedDate,
    formattedTime,
    duration,
    price
  };
  
  // Create HTML and plain text content
  const htmlContent = createEmailTemplate(emailData);
  const textContent = createPlainTextEmail(emailData);
  
  // Configure email options
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: customerEmail,
    subject: 'Потвърждение на резервация - Barber Booking',
    html: htmlContent,
    text: textContent
  };
  
  try {
    // Get the transporter
    const emailTransporter = getTransporter();
    
    // Send email
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export { sendBookingConfirmationEmail, formatDateBG }; 