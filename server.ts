import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to save results via Google Apps Script
  app.post("/api/save-results", async (req, res) => {
    try {
      const gasUrl = process.env.GAS_WEBAPP_URL || "https://script.google.com/macros/s/AKfycbyqS22AsBj0Idx84NleCOL2q3S9e0QrCcZOVtkv6ufksoUVpbOYOrLuBK1vq5iT4nQq/exec";
      
      const response = await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      
      if (data.status === "success") {
        res.json({ success: true, message: "Đã gửi báo cáo" });
      } else {
        throw new Error(data.message || "Lỗi từ Google Apps Script");
      }
    } catch (error: any) {
      console.error("Lỗi khi lưu vào Google Sheets:", error);
      res.status(500).json({ 
        success: false, 
        message: "Không thể lưu kết quả. Vui lòng kiểm tra cấu hình GAS Web App.",
        error: error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
