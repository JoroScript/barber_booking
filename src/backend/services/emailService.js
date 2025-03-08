import nodemailer from 'nodemailer';
import { DateTime } from 'luxon';

// Configure email transporter with better error handling
const createTransporter = () => {
  console.log('Creating email transporter with credentials:');
  console.log('Email user:', process.env.EMAIL_USER);
  console.log('Password length:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
  
  // For Gmail, we need to remove spaces from the app password
  const password = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : '';
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: password
    },
    debug: true // Enable debug output
  });
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
  
  // Create HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="bg">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Потвърждение за резервация</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .email-header {
          background: linear-gradient(135deg, #8B0000, #5D0000);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .email-body {
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .booking-details {
          background-color: #f5f5f5;
          border-left: 4px solid #8B0000;
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 25px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 12px;
        }
        .detail-row:last-child {
          margin-bottom: 0;
          border-bottom: none;
          padding-bottom: 0;
        }
        .detail-label {
          font-weight: 600;
          color: #555;
        }
        .detail-value {
          color: #333;
          text-align: right;
        }
        .message {
          margin-bottom: 25px;
        }
        .email-footer {
          background-color: #f5f5f5;
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: #666;
        }
        .contact-info {
          margin-top: 15px;
        }
        .highlight {
          color: #8B0000;
          font-weight: 600;
        }
        .button {
          display: inline-block;
          background-color: #8B0000;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: 600;
          margin-top: 15px;
        }
        @media only screen and (max-width: 600px) {
          .email-header {
            padding: 20px;
          }
          .email-body {
            padding: 20px;
          }
          .detail-row {
            flex-direction: column;
          }
          .detail-value {
            text-align: left;
            margin-top: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Потвърждение за резервация</h1>
        </div>
        <div class="email-body">
          <div class="greeting">
            Здравейте, <span class="highlight">${customerName}</span>!
          </div>
          
          <div class="message">
            Вашата резервация беше успешно създадена. По-долу можете да намерите детайли за вашия час:
          </div>
          
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">Бръснар:</span>
              <span class="detail-value">${barberName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Услуга:</span>
              <span class="detail-value">${serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Дата:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Час:</span>
              <span class="detail-value">${formattedTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Времетраене:</span>
              <span class="detail-value">${duration} минути</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Цена:</span>
              <span class="detail-value">${price} лв.</span>
            </div>
          </div>
          
          <div class="message">
            <p>Моля, пристигнете 5-10 минути преди уговорения час. Ако се налага да отмените или промените резервацията си, моля свържете се с нас поне 24 часа предварително.</p>
            <p>Очакваме ви и ви благодарим, че избрахте нашите услуги!</p>
          </div>
            </div>
        
        <div class="email-footer">
          <div class="contact-info">
            <div>Телефон: +359 88 888 8888</div>
            <div>Имейл: имейл на студиото</div>
            <div>Адрес: адрес на студиото</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Configure email options
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: customerEmail,
    subject: 'Потвърждение на резервация - Barber Booking',
    html: htmlContent,
    // Add a plain text version for email clients that don't support HTML
    text: `
      Здравейте, ${customerName}!
      
      Вашата резервация беше успешно създадена. По-долу можете да намерите детайли за вашия час:
      
      Бръснар: ${barberName}
      Услуга: ${serviceName}
      Дата: ${formattedDate}
      Час: ${formattedTime}
      Времетраене: ${duration} минути
      Цена: ${price} лв.
      
      Моля, пристигнете 5-10 минути преди уговорения час. Ако се налага да отмените или промените резервацията си, моля свържете се с нас поне 24 часа предварително.
      
      Очакваме ви и ви благодарим, че избрахте нашите услуги!
      
      © 2023 Barber Booking. Всички права запазени.
      Телефон: +359 88 888 8888
      Имейл: info@barber-booking.com
      Адрес: ул. "Примерна" 123, София
    `
  };
  
  try {
    // Create a new transporter for each email
    const transporter = createTransporter();
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export { sendBookingConfirmationEmail, formatDateBG }; 