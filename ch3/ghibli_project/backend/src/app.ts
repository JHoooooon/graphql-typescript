import express from 'express';

const app = express();
app.set('PORT', process.env.PORT || 8000);
app.use(express.json());

export default app;
