import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import * as kvHelpers from "./kv_helpers.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ec49694e/health", (c) => {
  return c.json({ status: "ok" });
});

// Save a bill to history
app.post("/make-server-ec49694e/bills", async (c) => {
  try {
    const body = await c.req.json();
    const billId = `bill_${Date.now()}`;
    
    await kv.set(billId, {
      ...body,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ success: true, billId });
  } catch (error) {
    console.log(`Error saving bill: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all bills from history
app.get("/make-server-ec49694e/bills", async (c) => {
  try {
    const bills = await kvHelpers.getByPrefixWithKeys("bill_");
    
    return c.json({ success: true, bills });
  } catch (error) {
    console.log(`Error fetching bills: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get a specific bill by ID
app.get("/make-server-ec49694e/bills/:id", async (c) => {
  try {
    const billId = c.req.param("id");
    const bill = await kv.get(billId);
    
    if (!bill) {
      return c.json({ success: false, error: "Bill not found" }, 404);
    }
    
    return c.json({ success: true, bill });
  } catch (error) {
    console.log(`Error fetching bill: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete a bill from history
app.delete("/make-server-ec49694e/bills/:id", async (c) => {
  try {
    const billId = c.req.param("id");
    await kv.del(billId);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting bill: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);