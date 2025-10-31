import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import app from "../app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data.txt");

// Helper para hacer requests HTTP
function makeRequest(method, port, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port,
      path,
      method,
      headers: data ? { "Content-Type": "application/json" } : {}
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, body }));
    });

    req.on("error", reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

test("GET / responde con el JSON esperado", async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const { body } = await makeRequest("GET", port, "/");
  await new Promise((r) => server.close(r));

  const parsed = JSON.parse(body);
  assert.equal(parsed.status, "ok");
  assert.equal(parsed.service, "Hola Microservicio 2");
});

test("GET /api/data devuelve array vacío si no hay datos", async () => {
  // Limpiar archivo antes del test
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }

  const server = app.listen(0);
  const { port } = server.address();

  const { statusCode, body } = await makeRequest("GET", port, "/api/data");
  await new Promise((r) => server.close(r));

  assert.equal(statusCode, 200);
  const parsed = JSON.parse(body);
  assert.equal(parsed.message, "No hay datos guardados");
  assert.deepEqual(parsed.data, []);
});

test("POST /api/data guarda datos correctamente", async () => {
  // Limpiar archivo antes del test
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }

  const server = app.listen(0);
  const { port } = server.address();

  const testData = { nombre: "test", valor: "123" };
  const { statusCode, body } = await makeRequest("POST", port, "/api/data", testData);
  
  await new Promise((r) => server.close(r));

  assert.equal(statusCode, 201);
  const parsed = JSON.parse(body);
  assert.equal(parsed.message, "Datos guardado");
  assert.equal(parsed.data.nombre, "test");
  assert.equal(parsed.data.valor, "123");
  assert.ok(parsed.data.timestamp);

  // Verificar que se guardó en el archivo
  const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
  assert.ok(fileContent.includes("test"));
  assert.ok(fileContent.includes("123"));
});

test("POST /api/data valida campos requeridos", async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const { statusCode, body } = await makeRequest("POST", port, "/api/data", {});
  await new Promise((r) => server.close(r));

  assert.equal(statusCode, 400);
  const parsed = JSON.parse(body);
  assert.equal(parsed.error, "Falta de campos");
});

test("GET /api/data devuelve datos guardados", async () => {
  // Limpiar y preparar archivo con datos de prueba
  const testData1 = { nombre: "user1", valor: "100", timestamp: new Date().toISOString() };
  const testData2 = { nombre: "user2", valor: "200", timestamp: new Date().toISOString() };
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(testData1) + "\n" + JSON.stringify(testData2) + "\n", "utf-8");

  const server = app.listen(0);
  const { port } = server.address();

  const { statusCode, body } = await makeRequest("GET", port, "/api/data");
  await new Promise((r) => server.close(r));

  assert.equal(statusCode, 200);
  const parsed = JSON.parse(body);
  assert.equal(parsed.message, "Datos recuperados");
  assert.equal(parsed.count, 2);
  assert.equal(parsed.data.length, 2);
  assert.equal(parsed.data[0].nombre, "user1");
  assert.equal(parsed.data[1].nombre, "user2");
  
  // Limpiar después del test
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
});
