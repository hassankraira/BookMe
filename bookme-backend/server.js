
const express = require('express');
const fs = require('fs');
const https = require('https');
const cors = require('cors');
const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
process.env.TNS_ADMIN = path.join(__dirname, 'oracle', 'wallet'); // folder with wallet
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};
async function init() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Connected to Oracle DB');
    connection.release();
  } catch (err) {
    console.error('DB connection error:', err);
  }
}
init();
app.get('/test-db', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    res.send('✅ DB connection successful!');
    connection.release();
  } catch (err) {
    console.error('DB test error:', err);
    res.status(500).send('❌ DB connection failed!');
  }
});
app.get('/tables', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`SELECT table_name FROM user_tables`);
    const tables = result.rows.map(row => row[0]);
    await connection.close();
    res.json({ tables });
  } catch (err) {
    console.error('Error fetching tables:', err);
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/services/add', async (req, res) => {
  const {
    service_name,
    description,
    provider_id,
    provider_name,
    provider_number,
    category,
    days_available,
    img_url
  } = req.body;

  console.log('📥 Received new service:', req.body);

  if (!service_name || !provider_id || !provider_name || !provider_number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `INSERT INTO services (
         id, service_name, description, provider_id, provider_name,
         provider_number, category, days_available, img_url
       ) VALUES (
         SERVICES_SEQ.NEXTVAL, :service_name, :description, :provider_id, :provider_name,
         :provider_number, :category, :days_available, :img_url
       )`,
      {
        service_name,
        description: description || null,
        provider_id,
        provider_name,
        provider_number,
        category: category || null,
        days_available: days_available || null,
        img_url: img_url || null
      },
      { autoCommit: true }
    );

    await connection.close();

    res.status(200).json({
      message: '✅ Service added successfully',
      inserted: {
        service_name,
        description,
        provider_id,
        provider_name,
        provider_number,
        category,
        days_available,
        img_url
      },
      result
    });

  } catch (err) {
    console.error('❌ Service insert error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/service/:category', async (req, res) => {
  const category = req.params.category;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT * FROM SERVICES WHERE CATEGORY = :category`,
      [category]
    );

    await connection.close();

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/service', async (req, res) => {

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT * FROM SERVICES `,
    );

    await connection.close();

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/APPOINTMENTS', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`SELECT * FROM APPOINTMENTS`);
    await connection.close();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/Categorys', async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`SELECT * FROM categories`);
    await connection.close();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/APPOINTMENTS/add', async (req, res) => {
  const { SERVICE_ID, CUSTOMER_NAME, TIME_BOOKED, COSTMER_NUMBER, NOTE } = req.body;

  console.log('📥 Received new appointment:', req.body);

  if (!SERVICE_ID || !CUSTOMER_NAME || !TIME_BOOKED || !COSTMER_NUMBER) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `INSERT INTO APPOINTMENTS 
       (ID, SERVICE_ID, CUSTOMER_NAME, TIME_BOOKED, COSTMER_NUMBER, NOTE)
       VALUES (APPOINTMENTS_seq.NEXTVAL, :service_id, :customer_name, :time_booked, :costmer_number, :note)`,
      {
        service_id: SERVICE_ID,
        customer_name: CUSTOMER_NAME,
        time_booked: TIME_BOOKED,
        costmer_number: COSTMER_NUMBER,
        note: NOTE || null
      },
      { autoCommit: true }
    );
    await connection.close();
    res.status(200).json({
      message: '✅ Appointment added successfully',
      inserted: {
        SERVICE_ID,
        CUSTOMER_NAME,
        TIME_BOOKED,
        COSTMER_NUMBER,
        NOTE
      },
      result
    });

  } catch (err) {
    console.error('❌ Insert error:', err);
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/categories/search', async (req, res) => {
  const searchTerm = req.query.q;
  try {
    const connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT * FROM categories
      WHERE REPLACE(LOWER(NAME), ' ', '%') LIKE REPLACE(LOWER(:term), ' ', '%')`,
      { term: `%${searchTerm.toLowerCase()}%` },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await connection.close();
    res.json(result.rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Error executing search query');
  }
});
const bcrypt = require('bcrypt');
app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  if (!firstName || !email || !password ) {
    return res.status(400).json({ error: 'الاسم الأول، البريد الإلكتروني، كلمة المرور، والدور مطلوبة' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `INSERT INTO users 
        (id, user_firstName, user_lastName, user_email, user_password, user_phone) 
       VALUES 
        (users_seq.NEXTVAL, :firstName, :lastName, :email, :password, :phone)`,
      {
        firstName,
        lastName: lastName || null, 
        email,
        password: hashedPassword,
        phone: phone || null,      
      },
      { autoCommit: true }
    );
    await connection.close();
    res.status(201).json({ message: 'تم إنشاء الحساب بنجاح' });

  } catch (err) {
    console.error('❌ Error in signup:', err);
    res.status(500).json({ error: 'خطأ أثناء التسجيل: ' + err.message });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM users WHERE user_email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'البريد غير موجود' });
    }
    const match = await bcrypt.compare(password, user.USER_PASSWORD);
    if (!match) {
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }
    await connection.close();
    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: {
        id: user.ID,
        firstName: user.USER_FIRSTNAME,
        lastName: user.USER_LASTNAME,
        email: user.USER_EMAIL,
        image:user.USER_IMAGE,
        phone: user.USER_PHONE,
        type: user.USER_TYPE
      }
    });
  } catch (err) {
    console.error('❌ Error in login:', err);
    res.status(500).json({ error: 'خطأ أثناء تسجيل الدخول: ' + err.message });
  }
});
app.post('/api/change_password', async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT USER_PASSWORD FROM users WHERE ID = :id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const currentPassword = result.rows[0][0];
    const match = await bcrypt.compare(oldPassword, currentPassword);
    if (!match) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10); 
    await connection.execute(
      `UPDATE users SET USER_PASSWORD = :newPassword WHERE ID = :id`,
      [hashedNewPassword, id],
      { autoCommit: true }
    );
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
const nodemailer = require('nodemailer');
app.use(cors());
app.use(bodyParser.json());
const otpStore = {};
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS  
  }
});
app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'رمز التحقق - BookMe',
    text: `رمز التحقق الخاص بك هو: ${otp}`
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) return res.status(500).send({ success: false });
    res.send({ success: true });
  });
});
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    delete otpStore[email];
    return res.send({ success: true });
  }
  res.send({ success: false });
});
app.post('/check-email', async (req, res) => {
  const { email } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM users WHERE user_email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length > 0) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    console.error('❌ Error checking email:', err);
    res.status(500).json({ error: 'Error checking email: ' + err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('❌ Error closing DB connection:', err);
      }
    }
  }
});
app.post('/api/subscribe-provider', async (req, res) => {
  const { userId } = req.body;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE users
       SET user_type = 'provider',
           subscription_end_date = SYSDATE + 30,
           SUBSCRIPTION_ACTIVE = 1
       WHERE ID = :id`,
      [userId],
      { autoCommit: true }
    );
    await connection.close();
    res.json({ success: true, message: "User upgraded to provider." });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
});
app.post('/api/remove-subscribe', async (req, res) => {
  const { userId } = req.body;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `UPDATE users
       SET user_type = 'customer',
           subscription_end_date = SYSDATE ,
           SUBSCRIPTION_ACTIVE = 0
       WHERE ID = :id`,
      [userId],
      { autoCommit: true }
    );
    await connection.close();
    res.json({ success: true, message: "User upgraded to provider." });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error });
  }
});
app.get('/api/check-subscription/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await oracledb.getConnection();
  const result = await connection.execute(
    `SELECT user_type, subscription_end_date
     FROM users
     WHERE id = :id`,
    [id],
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const user = result.rows[0];
  if (user && user.USER_TYPE === 'provider') {
    const now = new Date();
    const endDate = new Date(user.SUBSCRIPTION_END_DATE);

    if (now > endDate) {
      await connection.execute(
        `UPDATE users SET user_type = 'customer' WHERE id = :id`,
        [id],
        { autoCommit: true }
      );
      return res.json({ expired: true });
    }
  }
  res.json({ expired: false });
});
const multer = require('multer');


const upload = require('./middlewares/multer-cloudinary');

app.post('/api/services/upload', upload.single('image'), async (req, res) => {
  const {
    service_name, description, provider_id,
    provider_name, provider_number, category,
    days_off, session_length, start_time, end_time
  } = req.body;

  const img_url = req.file ? req.file.path : 'assets/bookme.png';
  const Daysoff = Array.isArray(days_off) ? days_off.join(',') : (days_off || '');

  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `INSERT INTO services (
         id, service_name, description, provider_id, provider_name,
         provider_number, category, days_off,
         session_length, start_time, end_time, img_url
       ) VALUES (
         SERVICES_SEQ.NEXTVAL, :service_name, :description, :provider_id, :provider_name,
         :provider_number, :category, :days_off,
         :session_length, :start_time, :end_time, :img_url
       )
       RETURNING id INTO :id`,
      {
        service_name,
        description,
        provider_id,
        provider_name,
        provider_number,
        category,
        days_off: Daysoff,
        session_length,
        start_time,
        end_time,
        img_url,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const newServiceId = result.outBinds.id[0];

    res.status(201).json({
      message: '✅ Service added successfully',
      service: {
        id: newServiceId,
        service_name, description, provider_id, provider_name,
        provider_number, category, days_off: Daysoff,
        session_length, start_time, end_time, img_url
      }
    });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Database insert error' });
  }
});

app.post('/api/services/upload-update', upload.single('image'), async (req, res) => {
  const {
    id,
    oldImageUrl,
    service_name,
    description,
    provider_id,
    provider_name,
    provider_number,
    category
  } = req.body;

  let newImageUrl = oldImageUrl;

  try {
    // If new file uploaded, get its Cloudinary URL
    if (req.file) {
      newImageUrl = req.file.path;

      // Delete old image if exists and not default
      if (oldImageUrl && !oldImageUrl.includes('assets/bookme.png')) {
        try {
          const parts = oldImageUrl.split('/');
          const filename = parts[parts.length - 1].split('.')[0]; // remove extension
          const publicId = `bookme/${filename}`;
          console.log(publicId)
          await cloudinary.uploader.destroy(publicId);
          console.log('Old image deleted:', publicId);
        } catch (err) {
          console.warn('Failed to delete old image from Cloudinary:', err.message);
        }
      }
    }

    // Update DB
    const connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `UPDATE SERVICES SET 
         SERVICE_NAME   = :service_name,
         DESCRIPTION    = :description,
         PROVIDER_ID    = :provider_id,
         PROVIDER_NAME  = :provider_name,
         PROVIDER_NUMBER= :provider_number,
         CATEGORY       = :category,
         IMG_URL        = :img_url
       WHERE ID = :id`,
      {
        service_name,
        description,
        provider_id: Number(provider_id),
        provider_name,
        provider_number,
        category,
        img_url: newImageUrl,
        id: Number(id)
      },
      { autoCommit: true }
    );

    res.json({ success: true, img_url: newImageUrl });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


const cloudinary = require('./config/cloudinary'); // استدعاء Cloudinary config
const { v2: cloudinaryV2 } = require('cloudinary');

app.post('/api/remove-service', async (req, res) => {
  const ID = req.body.ID;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1️⃣ Get the image URL first
    const selectResult = await connection.execute(
      `SELECT IMG_URL FROM SERVICES WHERE ID = :id`,
      { id: ID }
    );
    const imgUrl = selectResult.rows.length ? selectResult.rows[0][0] : null;

    // 2️⃣ Delete all appointments linked to this service
    await connection.execute(
      `DELETE FROM APPOINTMENTS WHERE SERVICE_ID = :id`,
      { id: ID },
      { autoCommit: true }
    );

    // 3️⃣ Delete the service itself
    await connection.execute(
      `DELETE FROM SERVICES WHERE ID = :id`,
      { id: ID },
      { autoCommit: true }
    );
    console.log('Service and related appointments removed successfully');

    // 4️⃣ Delete image from Cloudinary if exists and not default
    if (imgUrl && !imgUrl.includes('assets/bookme.png')) {
      try {
        const publicId = imgUrl.split('/').pop().split('.')[0]; 
        await cloudinaryV2.uploader.destroy(`bookme/${publicId}`);
        console.log('Image deleted from Cloudinary:', publicId);
      } catch (err) {
        console.warn('Failed to delete image from Cloudinary:', err.message);
      }
    }

    res.json({ message: 'Service and related appointments removed successfully' });

  } catch (err) {
    console.error('Error removing service:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) {
      try { await connection.close(); } 
      catch (err) { console.error('Error closing connection:', err); }
    }
  }
});


app.post('/api/updateUser', upload.single('image'), async (req, res) => {
  const { id, firstName, lastName, phone } = req.body;
  const newName = firstName + ' ' + lastName;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    // 1️⃣ Get current image URL
    const result = await connection.execute(
      `SELECT USER_IMAGE FROM USERS WHERE ID = :id`,
      { id }
    );
    const oldImageUrl = result.rows.length ? result.rows[0][0] : null;

    // 2️⃣ Handle new uploaded image
    let img_url = oldImageUrl; // default to old image
    if (req.file) {
      img_url = req.file.path;

      // Delete old image from Cloudinary if exists and not default
      if (oldImageUrl && !oldImageUrl.includes('assets/bookme.png')) {
        try {
          const publicId = oldImageUrl.split('/').pop().split('.')[0];
          await cloudinaryV2.uploader.destroy(`bookme/${publicId}`);
          console.log('Old user image deleted:', publicId);
        } catch (err) {
          console.warn('Failed to delete old user image from Cloudinary:', err.message);
        }
      }
    }

    // 3️⃣ Update user data
    const sql = `
      UPDATE USERS SET 
      USER_FIRSTNAME = :firstName, 
      USER_LASTNAME = :lastName, 
      USER_PHONE = :phone,
      USER_IMAGE = :image
      WHERE ID = :id`;

    await connection.execute(sql, {
      firstName,
      lastName,
      phone,
      image: img_url,
      id
    }, { autoCommit: true });

    // 4️⃣ Update services table if user is a provider
    const sql2 = `
      UPDATE SERVICES SET 
      PROVIDER_NAME = :name,
      PROVIDER_NUMBER = :phone 
      WHERE PROVIDER_ID = :id`;

    await connection.execute(sql2, { name: newName, phone, id }, { autoCommit: true });

    res.json({ message: 'User updated successfully', image: img_url });

  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Database error' });

  } finally {
    if (connection) {
      try { await connection.close(); } 
      catch (err) { console.error('Error closing connection:', err); }
    }
  }
});



  app.post('/api/appointments', async (req, res) => {
    try {
      const {
        user_id,
        service_id,
        provider_id,
        appointment_date, 
        appointment_time,   
        duration_minutes,
        notes
      } = req.body;
      const providerId=Number(provider_id)
      const userId = Number(user_id);
      const serviceId = Number(service_id);
      const duration = duration_minutes ? Number(duration_minutes) : null;
      const connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(
        `INSERT INTO APPOINTMENTS (
            ID, USER_ID, SERVICE_ID, APPOINTMENT_DATE, APPOINTMENT_TIME, DURATION_MINUTES, NOTES, PROVIDER_ID	
         ) VALUES (
            APPOINTMENTS_SEQ.NEXTVAL, :USER_ID, :SERVICE_ID,
            TO_DATE(:APPOINTMENT_DATE, 'YYYY-MM-DD'),
            :APPOINTMENT_TIME, :DURATION_MINUTES, :NOTES, :PROVIDER_ID
         )
         RETURNING ID INTO :NEW_ID`,
        {
          USER_ID: userId,
          SERVICE_ID: serviceId,
          APPOINTMENT_DATE: appointment_date,
          APPOINTMENT_TIME: appointment_time,
          DURATION_MINUTES: duration,
          NOTES: notes || null,
          PROVIDER_ID	:providerId,
          NEW_ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      const newId = result.outBinds.NEW_ID[0];  
      res.status(201).json({
        message: 'Appointment booked successfully',
        appointmentId: newId
      });  
      await connection.close();
    } catch (err) {
      console.error('Error inserting appointment:', err);
      res.status(500).json({ error: 'Failed to book appointment', details: err.message });
    }
  });
  app.get('/api/GetAppointments/:userid', async (req, res) => {
    const { userid } = req.params;
    try {
      const connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(
        `
        SELECT 
          a.ID,
          a.USER_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.DURATION_MINUTES,
          a.NOTES,
          s.SERVICE_NAME AS SERVICE_NAME,
          u.USER_FIRSTNAME || ' ' || u.USER_LASTNAME AS PROVIDER_NAME
        FROM Appointments a
        JOIN Services s ON a.SERVICE_ID = s.ID
        JOIN Users u ON a.PROVIDER_ID = u.ID
        WHERE a.USER_ID = :userId
        `,
        [userid],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
        await connection.close();
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Fetch error:', err);
      res.status(500).json({ error: err.message });
    }
  });
   app.get('/api/GetBookedTimes/:serviceId/:date', async (req, res) => {
    const { serviceId, date } = req.params;  
    try {
      const connection = await oracledb.getConnection(dbConfig);  
      const result = await connection.execute(
        `
        SELECT a.APPOINTMENT_TIME
        FROM Appointments a
        WHERE a.SERVICE_ID = :serviceId
          AND a.APPOINTMENT_DATE = TO_DATE(:appointmentDate, 'YYYY-MM-DD')
        `,
        {
          serviceId: serviceId,
          appointmentDate: date
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );      
      const bookedTimes = result.rows
        .map(r => r.APPOINTMENT_TIME)
        .filter(t => t && t.trim() !== '');      
      res.json({ bookedTimes });
          } catch (err) {
      console.error("❌ Error fetching booked times:", err);
      res.status(500).json({ error: "Database error" });
    }
  });
  app.get('/api/GetAppointmentsForProvider/:providerId', async (req, res) => {
    const { providerId } = req.params;
      try {
      const connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(
        `
        SELECT 
          a.ID,
          a.USER_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.DURATION_MINUTES,
          a.NOTES,
          s.SERVICE_NAME,
          u.USER_FIRSTNAME || ' ' || u.USER_LASTNAME AS CUSTOMER_NAME
        FROM Appointments a
        JOIN Services s ON a.SERVICE_ID = s.ID
        JOIN Users u ON a.USER_ID = u.ID
        WHERE a.PROVIDER_ID = :providerId
        ORDER BY a.APPOINTMENT_DATE DESC, a.APPOINTMENT_TIME DESC
        `,
        [providerId],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      await connection.close();
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Provider Fetch error:', err);
      res.status(500).json({ error: err.message });
    }
  });
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
  };

  https.createServer(sslOptions, app).listen(3000, '0.0.0.0', () => {
    console.log('✅ Node.js server running on HTTPS port 3000');
  });