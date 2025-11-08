
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ✅ تحميل مكتبة Oracle Instant Client

// ✅ إعداد الاتصال

process.env.TNS_ADMIN = path.join(__dirname, 'oracle', 'wallet'); // folder with wallet

// تعريف dbConfig مرة واحدة
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING
};

// اختبار الاتصال عند بدء السيرفر
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

// اختبار الاتصال عبر API
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
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|gif|webp/;
    const isValid = types.test(file.mimetype);
    if (isValid) cb(null, true);
    else cb(new Error('Unsupported file type'), false);
  }
});

app.use('/uploads', express.static('uploads')); 
app.post('/api/services/upload', upload.single('image'), async (req, res) => {
  const {
    service_name,
    description,
    provider_id,
    provider_name,
    provider_number,
    category,
    days_off,
    session_length,
    start_time,
    end_time
  } = req.body;

  const img_url = req.file
    ? `http://192.168.1.27:3000/uploads/${req.file.filename}`
    : 'assets/bookme.png';

  // Ensure days_off is always a string
  const Daysoff = Array.isArray(days_off)
    ? days_off.join(',')
    : (days_off || '');

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
        days_off: Daysoff, // ✅ correct bind
        session_length,
        start_time,
        end_time,
        img_url,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const newServiceId = result.outBinds.id[0];

    const newService = {
      id: newServiceId,
      service_name,
      description,
      provider_id,
      provider_name,
      provider_number,
      category,
      days_off: Daysoff,  // ✅ fixed
      session_length,
      start_time,
      end_time,
      img_url
    };

    res.status(201).json({
      message: '✅ Service added successfully',
      service: newService
    });

  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Database insert error' });
  }
});





app.post('/api/services/upload-update', upload.single('image'), async (req, res) => {
  try {
    const {
      id, service_name, description, provider_id,
      provider_name, provider_number, category,
      days_off, start_time, end_time,
      session_length, oldImageUrl
    } = req.body;

    const newImageUrl = req.file
      ? `http://192.168.1.27:3000/uploads/${req.file.filename}`
      : oldImageUrl;

    const serviceId = Number(id);
    const providerId = Number(provider_id);
    const sessionLength = Number(session_length);
   
    
    

    const Daysoff = Array.isArray(days_off)
    ? days_off.join(',')
    : (days_off || '');
    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(
      `UPDATE SERVICES 
       SET SERVICE_NAME   = :SERVICE_NAME,
           DESCRIPTION    = :DESCRIPTION,
           PROVIDER_ID    = :PROVIDER_ID,
           PROVIDER_NAME  = :PROVIDER_NAME,
           PROVIDER_NUMBER= :PROVIDER_NUMBER,
           CATEGORY       = :CATEGORY,
           DAYS_OFF        = :DAYS_OFF,
           START_TIME     = :START_TIME,
           END_TIME       = :END_TIME,
           SESSION_LENGTH = :SESSION_LENGTH,
           IMG_URL        = :IMG_URL
       WHERE ID = :ID`,
      {
        SERVICE_NAME: service_name,
        DESCRIPTION: description,
        PROVIDER_ID: providerId,
        PROVIDER_NAME: provider_name,
        PROVIDER_NUMBER: provider_number,
        CATEGORY: category,
        DAYS_OFF: Daysoff,
        
        START_TIME: start_time,
        END_TIME: end_time,
        SESSION_LENGTH: sessionLength,
        IMG_URL: newImageUrl,
        ID: serviceId
      },
      { autoCommit: true }
    );

    // delete old image if new one uploaded
    if (req.file && oldImageUrl) {
      try {
        const filename = oldImageUrl.split('/').pop();
        fs.unlinkSync(path.join(__dirname, 'uploads', filename));
      } catch (err) {
        console.warn('Failed to delete old image:', err.message);
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});



app.post('/api/remove-service', async (req, res) => {
  const ID = req.body.ID;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    const selectResult = await connection.execute(
      `SELECT IMG_URL FROM SERVICES WHERE ID = :id`,
      { id: ID }
    );

    const imgUrl = selectResult.rows.length ? selectResult.rows[0][0] : null;

    const sql = `DELETE FROM SERVICES WHERE ID = :id`;
    const result = await connection.execute(sql, { id: ID }, { autoCommit: true });

    console.log('Service removed successfully:', result.rowsAffected);

    if (imgUrl && !imgUrl.includes('assets/bookme.png')) {
      try {
        const filename = imgUrl.split('/').pop(); 
        const filePath = path.join(__dirname, '', 'uploads', filename);
        fs.unlinkSync(filePath);
        console.log('Image file deleted:', filename);
      } catch (err) {
        console.warn('Failed to delete image file:', err.message);
      }
    }

    res.json({ message: 'Service removed successfully' });

  } catch (err) {
    console.error('Error removing service:', err);
    res.status(500).json({ error: 'Database error' });

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

app.post('/api/updateUser', upload.single('image'), async (req, res) => {
  const { id, firstName, lastName, phone } = req.body;
  const newName = firstName + ' ' + lastName;
  const PROVIDER_ID = id;
  const PROVIDER_NUMBER = phone;

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // جلب الصورة القديمة
    const result = await connection.execute(
      `SELECT USER_IMAGE FROM USERS WHERE ID = :id`,
      { id }
    );

    const oldImageUrl = result.rows[0]?.[0];
    let image = oldImageUrl; // افتراضياً خليك على القديمة

    // لو فيه صورة جديدة مرفوعة
    if (req.file) {
      image = `http://192.168.1.27:3000/uploads/${req.file.filename}`;

      // حذف الصورة القديمة إذا كانت من uploads
      if (
        oldImageUrl &&
        oldImageUrl.startsWith('http://192.168.1.27:3000/uploads/')
      ) {
        const oldFileName = oldImageUrl.split('/').pop();
        const oldFilePath = path.join(__dirname, 'uploads', oldFileName);

        fs.unlink(oldFilePath, (err) => {
          if (err) {
            if (err.code === 'ENOENT') {
              console.warn('⚠️ Old image not found:', oldFilePath);
            } else {
              console.error('❌ Failed to delete old image:', err);
            }
          } else {
            console.log('🗑️ Old image deleted:', oldFilePath);
          }
        });
      }
    }

    // تحديث جدول الخدمات
    const sql2 = `
      UPDATE SERVICES SET 
      PROVIDER_NAME = :name,
      PROVIDER_NUMBER = :phone 
      WHERE PROVIDER_ID = :id`;

    await connection.execute(sql2, {
      name: newName,
      phone: PROVIDER_NUMBER,
      id: PROVIDER_ID
    }, { autoCommit: true });

    // تحديث جدول المستخدم
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
      image,
      id
    }, { autoCommit: true });

    res.json({ message: 'User updated successfully', image });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
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
        .filter(t => t && t.trim() !== ''); // استبعد الفارغ/null
      
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
  




app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://192.168.1.27:${PORT}`);
});







