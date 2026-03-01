import express from "express";
import { getHealthStatus } from "./health";

export const app = express();

app.get("/health", (_req, res) => {
  res.json(getHealthStatus());
});
