import express from "express";


import authRotes from "./Routes.js";

const app = express();

app.use(express.json());
app.use('/auth', authRotes);

export default app;