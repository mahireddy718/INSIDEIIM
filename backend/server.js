import "dotenv/config";
import express from "express";
import cors from "cors";
import researchRouter from "./src/routes/research.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", researchRouter);

app.listen(PORT, () => {
  console.log(`Dossier backend running on http://localhost:${PORT}`);
});
