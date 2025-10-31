import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
const DATA_FILE = path.join(__dirname, "data.txt");

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Hola Microservicio 2" });
});

// guardar datos nombre - valor
app.post("/api/data", (req, res) => {
  const { nombre, valor } = req.body;
  if (!nombre || !valor) {
    return res.status(400).json({ 
      error: "Falta de campos" 
    });
  }
  const registro = {
    nombre,
    valor,
    timestamp: new Date().toISOString()
  };
  try {
    // append mode (agregar)
    fs.appendFileSync(DATA_FILE, JSON.stringify(registro) + "\n", "utf-8");
    res.status(201).json({ 
      message: "Datos guardado",
      data: registro
    });
  } catch (error) {
    res.status(500).json({ 
      error: "Error",
      details: error.message
    });
  }
});

// Leer los datos guardados
app.get("/api/data", (_req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.json({ message: "No hay datos guardados", data: [] });
    }
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    const lines = content.trim().split("\n").filter(line => line);
    const data = lines.map(line => JSON.parse(line));
    res.json({ 
      message: "Datos recuperados",
      count: data.length,
      data 
    });
  } catch (error) {
    res.status(500).json({ error: "Error al leer datos", details: error.message });
  }
});

export default app;
