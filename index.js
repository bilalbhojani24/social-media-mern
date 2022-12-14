// Third Party Library
// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const cors = require('cors');
// const app = express();

// // Routes Import
// const userRoutes = require('./routes/users');
// const authRoutes = require('./routes/auth');
// const postRoutes = require('./routes/posts');

// // Global configs
// dotenv.config();

// app.use('/images', express.static(path.join(__dirname, 'public/images')));

// // middleware
// app.use(cors());
// app.use(express.json()); // This will parse the body while request
// app.use(helmet());
// app.use(morgan('common'));

// app.use('/user', userRoutes);
// app.use('/auth', authRoutes);
// app.use('/posts', postRoutes);

// mongoose
//   .connect(process.env.MONGODB_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     app.listen(process.env.PORT, () => {
//       console.log(`Server running on port : ${process.env.PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.log('CONNECTION ERROR =>', error);
//   });

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');
const router = express.Router();
const path = require('path');
const cors = require('cors');

dotenv.config();

mongoose.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log('Connected to MongoDB');
  }
);
app.use('/images', express.static(path.join(__dirname, 'public/images')));

//middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

const upload = multer({ storage: storage });
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    return res.status(200).json('File uploded successfully');
  } catch (error) {
    console.error(error);
  }
});

app.use('/auth', authRoute);
app.use('/users', userRoute);
app.use('/posts', postRoute);

app.listen(process.env.PORT, () => {
  console.log('Backend server is running!');
});
