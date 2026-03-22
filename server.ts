import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import db from "./server/db.ts";

dotenv.config();

// Ensure NODE_ENV is set
const isProduction = process.env.NODE_ENV === 'production' || process.env.ENV === 'production' || process.env.VITE_USER_NODE_ENV === 'production';
console.log(`[Server] Environment: NODE_ENV=${process.env.NODE_ENV}, ENV=${process.env.ENV}, VITE_USER_NODE_ENV=${process.env.VITE_USER_NODE_ENV}`);
console.log(`[Server] Initializing in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode...`);

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

export const app = express();

async function startServer() {
  try {
    const PORT = process.env.PORT || 3000; 

    console.log("[Server] Initializing middleware...");

    // Middlewares
    app.use(cors({
      origin: true, // Allow all origins in development/preview
      credentials: true
    }));
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
    app.use(express.json());

    // Logging
    app.use((req, res, next) => {
      console.log(`[Request] ${new Date().toISOString()} - ${req.method} ${req.url}`);
      next();
    });

    // Auth Middleware
    const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.sendStatus(401);

      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
      });
    };

    // Simple health check (no DB dependency)
    app.get("/health", (req, res) => {
      res.status(200).send("OK");
    });

    // API Routes
    console.log("[Server] Registering API routes...");
    app.get("/api/test", (req, res) => {
      res.json({ message: "API is reachable" });
    });

    // Health check and debug route
    app.get("/api/health", (req, res) => {
      try {
        const tables = [
          'notices', 'gallery', 'enquiries', 'faculty', 'about_sections', 
          'infrastructure', 'academic_streams', 'academic_levels', 
          'admission_steps', 'admission_documents', 'home_highlights', 
          'subscriptions', 'users'
        ];
        
        const counts: Record<string, number> = {};
        tables.forEach(table => {
          try {
            const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
            counts[table] = result.count;
          } catch {
            counts[table] = -1; // Table might not exist
          }
        });

        const downloadsPath = path.resolve(process.cwd(), 'public', 'downloads');
        const distPath = path.resolve(process.cwd(), 'dist');
        const downloadsExists = fs.existsSync(downloadsPath);
        const distExists = fs.existsSync(distPath);
        
        res.json({ 
          status: "ok", 
          message: "K N Singh Inter College API is running",
          environment: {
            NODE_ENV: process.env.NODE_ENV,
            ENV: process.env.ENV,
            isProduction,
            PORT
          },
          database: "sqlite",
          tableCounts: counts,
          cwd: process.cwd(), 
          distPath,
          distExists,
          downloadsPath, 
          downloadsExists,
          downloadsFiles: downloadsExists ? fs.readdirSync(downloadsPath) : []
        });
      } catch (error) {
        res.status(500).json({ status: "error", message: String(error) });
      }
    });

    // Auth Routes
    app.post("/api/auth/login", (req, res) => {
      const { email, password } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as { id: number, email: string, password: string } | undefined;
      
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { email: user.email } });
    });

    // Notices Routes
    app.get("/api/notices", (req, res) => {
      try {
        console.log("[API] GET /api/notices hit");
        const notices = db.prepare("SELECT * FROM notices ORDER BY createdAt DESC").all() as { id: number, title: string, content: string, isImportant: number, createdAt: string }[];
        res.json(notices.map((n) => ({ ...n, isImportant: !!n.isImportant })));
      } catch (error) {
        console.error("Error in GET /api/notices:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/notices", authenticateToken, (req, res) => {
      try {
        const { title, content, isImportant } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO notices (title, content, isImportant, createdAt) VALUES (?, ?, ?, ?)")
          .run(title, content, isImportant ? 1 : 0, createdAt);
        res.json({ id: result.lastInsertRowid, title, content, isImportant, createdAt });
      } catch (error) {
        console.error("Error in POST /api/notices:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/notices/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM notices WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/notices:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Gallery Routes
    app.get("/api/gallery", (req, res) => {
      try {
        const items = db.prepare("SELECT * FROM gallery ORDER BY createdAt DESC").all();
        res.json(items);
      } catch (error) {
        console.error("Error in GET /api/gallery:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/gallery", authenticateToken, (req, res) => {
      try {
        const { imageUrl, caption, category } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO gallery (imageUrl, caption, category, createdAt) VALUES (?, ?, ?, ?)")
          .run(imageUrl, caption, category, createdAt);
        res.json({ id: result.lastInsertRowid, imageUrl, caption, category, createdAt });
      } catch (error) {
        console.error("Error in POST /api/gallery:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/gallery/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM gallery WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/gallery:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Enquiries Routes
    app.get("/api/enquiries", authenticateToken, (req, res) => {
      try {
        const enquiries = db.prepare("SELECT * FROM enquiries ORDER BY createdAt DESC").all();
        res.json(enquiries);
      } catch (error) {
        console.error("Error in GET /api/enquiries:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.get("/api/enquiries/export", authenticateToken, (req, res) => {
      try {
        const enquiries = db.prepare("SELECT * FROM enquiries ORDER BY createdAt DESC").all();
        
        if (!enquiries || enquiries.length === 0) {
          return res.status(404).json({ message: "No enquiries found to export" });
        }

        const worksheet = XLSX.utils.json_to_sheet(enquiries);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Enquiries");
        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
        
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=enquiries.xlsx");
        res.send(buffer);
      } catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ message: "Failed to generate export file" });
      }
    });

    // Generic Download Route for static files in /public/downloads
    app.get("/api/download/:filename", (req, res) => {
      try {
        const filename = req.params.filename;
        // Security: prevent directory traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
          return res.status(400).json({ message: "Invalid filename" });
        }

        const filePath = path.resolve(process.cwd(), 'public', 'downloads', filename);
        
        // Check if file exists
        if (fs.existsSync(filePath)) {
          res.download(filePath, filename, (err) => {
            if (err) {
              console.error("Download error:", err);
              if (!res.headersSent) {
                res.status(500).json({ message: "Error during file download" });
              }
            }
          });
        } else {
          console.error(`File not found: ${filePath}`);
          res.status(404).json({ message: "File not found on server" });
        }
      } catch (error) {
        console.error("Error in GET /api/download/:filename:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/enquiries", (req, res) => {
      try {
        const { name, email, phone, subject, message } = req.body;
        const createdAt = new Date().toISOString();
        db.prepare("INSERT INTO enquiries (name, email, phone, subject, message, createdAt) VALUES (?, ?, ?, ?, ?, ?)")
          .run(name, email, phone, subject, message, createdAt);
        res.sendStatus(201);
      } catch (error) {
        console.error("Error in POST /api/enquiries:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/enquiries/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM enquiries WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/enquiries/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Faculty Routes
    app.get("/api/faculty", (req, res) => {
      try {
        const faculty = db.prepare("SELECT * FROM faculty ORDER BY id ASC").all();
        res.json(faculty);
      } catch (error) {
        console.error("Error in GET /api/faculty:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/faculty", authenticateToken, (req, res) => {
      try {
        const { name, subject, qualification, photo } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO faculty (name, subject, qualification, photo, createdAt) VALUES (?, ?, ?, ?, ?)")
          .run(name, subject, qualification, photo, createdAt);
        res.json({ id: result.lastInsertRowid, name, subject, qualification, photo, createdAt });
      } catch (error) {
        console.error("Error in POST /api/faculty:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/faculty/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM faculty WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/faculty/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // About Sections Routes
    app.get("/api/about-sections", (req, res) => {
      try {
        const sections = db.prepare("SELECT * FROM about_sections ORDER BY id ASC").all();
        res.json(sections);
      } catch (error) {
        console.error("Error in GET /api/about-sections:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/about-sections", authenticateToken, (req, res) => {
      try {
        const { title, content, iconName } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO about_sections (title, content, iconName, createdAt) VALUES (?, ?, ?, ?)")
          .run(title, content, iconName, createdAt);
        res.json({ id: result.lastInsertRowid, title, content, iconName, createdAt });
      } catch (error) {
        console.error("Error in POST /api/about-sections:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/about-sections/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM about_sections WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/about-sections/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Infrastructure Routes
    app.get("/api/infrastructure", (req, res) => {
      try {
        const items = db.prepare("SELECT * FROM infrastructure ORDER BY id ASC").all();
        res.json(items);
      } catch (error) {
        console.error("Error in GET /api/infrastructure:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/infrastructure", authenticateToken, (req, res) => {
      try {
        const { title, description } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO infrastructure (title, description, createdAt) VALUES (?, ?, ?)")
          .run(title, description, createdAt);
        res.json({ id: result.lastInsertRowid, title, description, createdAt });
      } catch (error) {
        console.error("Error in POST /api/infrastructure:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/infrastructure/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM infrastructure WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/infrastructure/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Academic Streams Routes
    app.get("/api/academic-streams", (req, res) => {
      try {
        const streams = db.prepare("SELECT * FROM academic_streams ORDER BY id ASC").all() as { id: number, title: string, description: string, subjects: string, createdAt: string }[];
        res.json(streams.map(s => ({ ...s, subjects: JSON.parse(s.subjects) })));
      } catch (error) {
        console.error("Error in GET /api/academic-streams:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/academic-streams", authenticateToken, (req, res) => {
      try {
        const { title, description, subjects } = req.body;
        const createdAt = new Date().toISOString();
        const subjectsJson = JSON.stringify(subjects);
        const result = db.prepare("INSERT INTO academic_streams (title, description, subjects, createdAt) VALUES (?, ?, ?, ?)")
          .run(title, description, subjectsJson, createdAt);
        res.json({ id: result.lastInsertRowid, title, description, subjects, createdAt });
      } catch (error) {
        console.error("Error in POST /api/academic-streams:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/academic-streams/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM academic_streams WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/academic-streams/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Academic Levels Routes
    app.get("/api/academic-levels", (req, res) => {
      try {
        const levels = db.prepare("SELECT * FROM academic_levels ORDER BY id ASC").all();
        res.json(levels);
      } catch (error) {
        console.error("Error in GET /api/academic-levels:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/academic-levels", authenticateToken, (req, res) => {
      try {
        const { title, classes, focus } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO academic_levels (title, classes, focus, createdAt) VALUES (?, ?, ?, ?)")
          .run(title, classes, focus, createdAt);
        res.json({ id: result.lastInsertRowid, title, classes, focus, createdAt });
      } catch (error) {
        console.error("Error in POST /api/academic-levels:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/academic-levels/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM academic_levels WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/academic-levels/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Admission Steps Routes
    app.get("/api/admission-steps", (req, res) => {
      try {
        const steps = db.prepare("SELECT * FROM admission_steps ORDER BY orderIndex ASC").all();
        res.json(steps);
      } catch (error) {
        console.error("Error in GET /api/admission-steps:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/admission-steps", authenticateToken, (req, res) => {
      try {
        const { title, description, orderIndex } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO admission_steps (title, description, orderIndex, createdAt) VALUES (?, ?, ?, ?)")
          .run(title, description, orderIndex || 0, createdAt);
        res.json({ id: result.lastInsertRowid, title, description, orderIndex, createdAt });
      } catch (error) {
        console.error("Error in POST /api/admission-steps:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/admission-steps/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM admission_steps WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/admission-steps/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Admission Documents Routes
    app.get("/api/admission-documents", (req, res) => {
      try {
        const docs = db.prepare("SELECT * FROM admission_documents ORDER BY id ASC").all();
        res.json(docs);
      } catch (error) {
        console.error("Error in GET /api/admission-documents:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/admission-documents", authenticateToken, (req, res) => {
      try {
        const { name } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO admission_documents (name, createdAt) VALUES (?, ?)")
          .run(name, createdAt);
        res.json({ id: result.lastInsertRowid, name, createdAt });
      } catch (error) {
        console.error("Error in POST /api/admission-documents:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/admission-documents/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM admission_documents WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/admission-documents/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Home Highlights Routes
    app.get("/api/home-highlights", (req, res) => {
      try {
        console.log("[API] GET /api/home-highlights hit");
        const highlights = db.prepare("SELECT * FROM home_highlights ORDER BY id ASC").all();
        console.log("DEBUG: Found highlights:", highlights.length);
        res.json(highlights);
      } catch (error) {
        console.error("Error in GET /api/home-highlights:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/home-highlights", authenticateToken, (req, res) => {
      try {
        const { title, description, iconName } = req.body;
        const createdAt = new Date().toISOString();
        const result = db.prepare("INSERT INTO home_highlights (title, description, iconName, createdAt) VALUES (?, ?, ?, ?)")
          .run(title, description, iconName, createdAt);
        res.json({ id: result.lastInsertRowid, title, description, iconName, createdAt });
      } catch (error) {
        console.error("Error in POST /api/home-highlights:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/home-highlights/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM home_highlights WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/home-highlights/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.post("/api/subscriptions", (req, res) => {
      try {
        const { email } = req.body;
        const createdAt = new Date().toISOString();
        db.prepare("INSERT INTO subscriptions (email, createdAt) VALUES (?, ?)").run(email, createdAt);
        res.sendStatus(201);
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (error.code === 'SQLITE_CONSTRAINT') {
          res.status(400).json({ message: "Already subscribed" });
        } else {
          console.error("Error in POST /api/subscriptions:", err);
          res.sendStatus(500);
        }
      }
    });

    app.get("/api/subscriptions", authenticateToken, (req, res) => {
      try {
        const subs = db.prepare("SELECT * FROM subscriptions ORDER BY createdAt DESC").all();
        res.json(subs);
      } catch (error) {
        console.error("Error in GET /api/subscriptions:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    app.delete("/api/subscriptions/:id", authenticateToken, (req, res) => {
      try {
        db.prepare("DELETE FROM subscriptions WHERE id = ?").run(req.params.id);
        res.sendStatus(204);
      } catch (error) {
        console.error("Error in DELETE /api/subscriptions/:id:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // Catch-all for unmatched API routes
    app.all("/api/*", (req, res) => {
      console.log(`[API] 404 - Unmatched route: ${req.method} ${req.url}`);
      res.status(404).json({ message: `API endpoint ${req.method} ${req.url} not found` });
    });

    // Frontend Serving
    if (isProduction) {
      const distPath = path.resolve(process.cwd(), "dist");
      console.log(`[Server] Production mode: Serving static files from ${distPath}`);
      
      if (fs.existsSync(distPath)) {
        // Serve static files with caching
        app.use(express.static(distPath, {
          index: false, // Don't serve index.html automatically, we'll handle it below
          maxAge: '1h'
        }));

        // Handle relative asset requests from subpaths (fix for base: './')
        app.get("*/assets/:file", (req, res) => {
          const filePath = path.join(distPath, "assets", req.params.file);
          if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
          }
          res.status(404).send("Asset not found");
        });
        
        // SPA fallback: serve index.html for all non-API routes
        app.get("*", (req, res) => {
          // Double check it's not an API request that leaked through
          if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: `API endpoint ${req.method} ${req.url} not found` });
          }
          
          const indexPath = path.join(distPath, "index.html");
          if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
          } else {
            res.status(500).send("index.html not found in dist folder. Please rebuild.");
          }
        });
        console.log("[Server] Production static routes and SPA fallback configured.");
      } else {
        console.error(`[Server] ERROR: dist folder not found at ${distPath}. Build might have failed.`);
        app.get("*", (req, res) => {
          res.status(500).send("Application is not built. Please run 'npm run build'.");
        });
      }
    } else {
      console.log("[Server] Development mode: Initializing Vite middleware...");
      try {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
          root: process.cwd(),
        });
        app.use(vite.middlewares);
        console.log("[Server] Vite middleware attached.");
        
        // SPA fallback for development (if Vite middleware doesn't handle it)
        app.get("*", (req, res, next) => {
          if (req.path.startsWith('/api')) {
            return next();
          }
          res.sendFile(path.join(process.cwd(), "index.html"));
        });
      } catch (viteError) {
        console.error("[Server] Failed to initialize Vite middleware:", viteError);
        app.get("*", (req, res) => {
          res.status(500).send("Vite middleware failed to load. Check server logs.");
        });
      }
    }

    // Global Error Handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error("[Server] Unhandled Error:", err);
      res.status(500).json({ 
        message: "Internal server error", 
        error: !isProduction ? String(err) : undefined 
      });
    });

    if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
      app.listen(Number(PORT), "0.0.0.0", () => {
        console.log(`[Server] SUCCESS: Server is listening on http://0.0.0.0:${PORT}`);
        console.log(`[Server] Ready to handle requests.`);
      });
    }
  } catch (error) {
    console.error("CRITICAL: Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
