import express from 'express';
import cookieParser from 'cookie-parser';
import { logger } from './utils/index.js';
import { PORT } from './config/config.js';
import routes from './routes/index.js';

const app = express();
// const allowedOrigins = ['http://localhost:5173', 'http://localhost', 'http://192.168.100.35'];

app.use((req, res, next) => {
  // const origin = req.headers.origin;

  // if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  // }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(cookieParser());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {

    logger.error({caller: 'middleware errores/index.js'}, err.message);
    return res.status(400).json({ message: 'JSON mal formado' });
  }
  next();
});

app.use('/', routes);


app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});

