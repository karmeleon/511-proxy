import express, { type Express, type Request, type Response } from "express";

const app: Express = express();
const port = process.env.PORT ?? 42424;

app.get("/transit/StopMonitoring", (req, res) => {
    res.send("henlo!");
});

app.listen(port, () => {
    console.log(`server running at port ${port}`);
});
