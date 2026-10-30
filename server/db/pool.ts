import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface DetectedObjectRecord {
  id: number;
  inspection_id: number;
  label: string;
  confidence: number;
  box_2d_ymin: number;
  box_2d_xmin: number;
  box_2d_ymax: number;
  box_2d_xmax: number;
  details: string;
}

export interface InspectionRecord {
  id: number;
  user_id: number;
  image_url: string;
  domain: string;
  status: string;
  summary: string;
  raw_ai_response: any;
  confidence_score: number;
  created_at: string;
  detected_objects?: DetectedObjectRecord[];
}

interface LocalDB {
  users: User[];
  inspections: InspectionRecord[];
  detected_objects: DetectedObjectRecord[];
  nextUserId: number;
  nextInspectionId: number;
  nextObjectId: number;
}

const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_FILE = path.join(DATA_DIR, "vision_db.json");

let pgPool: pg.Pool | null = null;
let usePostgres = false;

// Fallback in-memory/file storage
let localDb: LocalDB = {
  users: [],
  inspections: [],
  detected_objects: [],
  nextUserId: 1,
  nextInspectionId: 1,
  nextObjectId: 1,
};

function loadLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      localDb = JSON.parse(data);
    } else {
      seedLocalDb();
      saveLocalDb();
    }
  } catch (err) {
    console.error("Error loading local database fallback:", err);
    seedLocalDb();
  }
}

function saveLocalDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving local database fallback:", err);
  }
}

function seedLocalDb() {
  localDb.users = [
    {
      id: 1,
      username: "lead_qa_engineer",
      email: "qa.lead@visionai.internal",
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];
  localDb.nextUserId = 2;

  // Sample inspection 1: Manufacturing PCB
  const insp1Id = 1;
  const insp1: InspectionRecord = {
    id: insp1Id,
    user_id: 1,
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
    domain: "Manufacturing & Industrial",
    status: "completed",
    summary: "High-density PCB inspection detected 2 micro-solder bridges between IC pin header traces and 1 trace discoloration anomaly.",
    confidence_score: 96.5,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    raw_ai_response: {
      summary: "High-density PCB inspection detected 2 micro-solder bridges between IC pin header traces and 1 trace discoloration anomaly.",
      overallConfidence: 96.5,
      anomaliesDetected: true,
      inspectionVerdict: "FAIL",
      domainInsights: [
        "IPC-A-610 Class 3 standard breached due to conductive solder bridging.",
        "Reflow zone thermal ramp may exceed 2.8°C/s causing paste slump.",
      ],
      detectedObjects: [
        {
          label: "Solder Bridge Anomaly",
          confidence: 97.8,
          box_2d: [310, 420, 480, 610],
          details: "Unintended solder bridge short-circuiting pin 14 and pin 15.",
        },
        {
          label: "Trace Oxidation",
          confidence: 94.2,
          box_2d: [620, 240, 750, 390],
          details: "Localized oxidation on ground copper plane.",
        },
        {
          label: "SMD Capacitor Align",
          confidence: 98.4,
          box_2d: [180, 670, 290, 780],
          details: "Optimal component placement within ±0.02mm tolerance.",
        },
      ],
    },
  };

  const objs1: DetectedObjectRecord[] = [
    {
      id: 1,
      inspection_id: insp1Id,
      label: "Solder Bridge Anomaly",
      confidence: 97.8,
      box_2d_ymin: 310,
      box_2d_xmin: 420,
      box_2d_ymax: 480,
      box_2d_xmax: 610,
      details: "Unintended solder bridge short-circuiting pin 14 and pin 15.",
    },
    {
      id: 2,
      inspection_id: insp1Id,
      label: "Trace Oxidation",
      confidence: 94.2,
      box_2d_ymin: 620,
      box_2d_xmin: 240,
      box_2d_ymax: 750,
      box_2d_xmax: 390,
      details: "Localized oxidation on ground copper plane.",
    },
    {
      id: 3,
      inspection_id: insp1Id,
      label: "SMD Capacitor Align",
      confidence: 98.4,
      box_2d_ymin: 180,
      box_2d_xmin: 670,
      box_2d_ymax: 290,
      box_2d_xmax: 780,
      details: "Optimal component placement within ±0.02mm tolerance.",
    },
  ];

  // Sample inspection 2: Retail Shelf
  const insp2Id = 2;
  const insp2: InspectionRecord = {
    id: insp2Id,
    user_id: 1,
    image_url: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1000&q=80",
    domain: "Retail & Inventory",
    status: "completed",
    summary: "Automated shelf audit identified 8 product facings with 2 out-of-stock void gaps in middle tier merchandising.",
    confidence_score: 93.8,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    raw_ai_response: {
      summary: "Automated shelf audit identified 8 product facings with 2 out-of-stock void gaps in middle tier merchandising.",
      overallConfidence: 93.8,
      anomaliesDetected: true,
      inspectionVerdict: "WARN",
      domainInsights: [
        "Planogram compliance: 78% (Target: 95%).",
        "Estimated restocking priority: Immediate for SKU #8812.",
      ],
      detectedObjects: [
        {
          label: "Out-of-Stock Void",
          confidence: 95.0,
          box_2d: [380, 290, 580, 480],
          details: "Empty shelf segment with missing shelf tag alignment.",
        },
        {
          label: "Misplaced Inventory SKU",
          confidence: 91.5,
          box_2d: [410, 620, 610, 790],
          details: "Beverage bottle stored in breakfast cereal display area.",
        },
      ],
    },
  };

  const objs2: DetectedObjectRecord[] = [
    {
      id: 4,
      inspection_id: insp2Id,
      label: "Out-of-Stock Void",
      confidence: 95.0,
      box_2d_ymin: 380,
      box_2d_xmin: 290,
      box_2d_ymax: 580,
      box_2d_xmax: 480,
      details: "Empty shelf segment with missing shelf tag alignment.",
    },
    {
      id: 5,
      inspection_id: insp2Id,
      label: "Misplaced Inventory SKU",
      confidence: 91.5,
      box_2d_ymin: 410,
      box_2d_xmin: 620,
      box_2d_ymax: 610,
      box_2d_xmax: 790,
      details: "Beverage bottle stored in breakfast cereal display area.",
    },
  ];

  // Sample inspection 3: General Scene Understanding
  const insp3Id = 3;
  const insp3: InspectionRecord = {
    id: insp3Id,
    user_id: 1,
    image_url: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1000&q=80",
    domain: "General Scene Understanding",
    status: "completed",
    summary: "Urban street scene parsing segmented pedestrians, moving vehicles, and traffic light signage with high precision.",
    confidence_score: 98.1,
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    raw_ai_response: {
      summary: "Urban street scene parsing segmented pedestrians, moving vehicles, and traffic light signage with high precision.",
      overallConfidence: 98.1,
      anomaliesDetected: false,
      inspectionVerdict: "PASS",
      domainInsights: [
        "Dynamic object tracking: 4 vehicles, 2 pedestrians in crosswalk.",
        "Signage state: Traffic light green in lane 1.",
      ],
      detectedObjects: [
        {
          label: "Commercial Vehicle",
          confidence: 98.9,
          box_2d: [460, 480, 810, 890],
          details: "Passenger SUV traveling west at estimated 32 km/h.",
        },
        {
          label: "Pedestrian Crosswalk",
          confidence: 96.2,
          box_2d: [680, 120, 840, 240],
          details: "Adult pedestrian inside zebra crossing boundary.",
        },
      ],
    },
  };

  const objs3: DetectedObjectRecord[] = [
    {
      id: 6,
      inspection_id: insp3Id,
      label: "Commercial Vehicle",
      confidence: 98.9,
      box_2d_ymin: 460,
      box_2d_xmin: 480,
      box_2d_ymax: 810,
      box_2d_xmax: 890,
      details: "Passenger SUV traveling west at estimated 32 km/h.",
    },
    {
      id: 7,
      inspection_id: insp3Id,
      label: "Pedestrian Crosswalk",
      confidence: 96.2,
      box_2d_ymin: 680,
      box_2d_xmin: 120,
      box_2d_ymax: 840,
      box_2d_xmax: 240,
      details: "Adult pedestrian inside zebra crossing boundary.",
    },
  ];

  localDb.inspections = [insp1, insp2, insp3];
  localDb.detected_objects = [...objs1, ...objs2, ...objs3];
  localDb.nextInspectionId = 4;
  localDb.nextObjectId = 8;
}

export async function initDatabase(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL || process.env.PGURL;
  if (dbUrl) {
    try {
      pgPool = new pg.Pool({
        connectionString: dbUrl,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
      });
      // Test connection
      const client = await pgPool.connect();
      console.log("Connected to PostgreSQL database successfully.");

      // Run migrations
      const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
      await client.query(schemaSql);

      // Check users table
      const userRes = await client.query("SELECT * FROM users LIMIT 1");
      if (userRes.rows.length === 0) {
        await client.query(
          "INSERT INTO users (id, username, email) VALUES (1, 'lead_qa_engineer', 'qa.lead@visionai.internal') ON CONFLICT DO NOTHING"
        );
      }
      client.release();
      usePostgres = true;
      return;
    } catch (err) {
      console.warn("PostgreSQL connection failed. Falling back to local persistent store.", err);
      usePostgres = false;
    }
  }

  loadLocalDb();
  console.log("Using robust local persistent database adapter.");
}

export const db = {
  async getCurrentUser(userId = 1): Promise<User> {
    if (usePostgres && pgPool) {
      const res = await pgPool.query("SELECT * FROM users WHERE id = $1", [userId]);
      if (res.rows[0]) return res.rows[0];
    }
    const user = localDb.users.find((u) => u.id === userId) || localDb.users[0];
    if (!user) {
      const newUser: User = {
        id: 1,
        username: "lead_qa_engineer",
        email: "qa.lead@visionai.internal",
        created_at: new Date().toISOString(),
      };
      localDb.users.push(newUser);
      saveLocalDb();
      return newUser;
    }
    return user;
  },

  async getInspections(params: {
    userId?: number;
    domain?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: InspectionRecord[]; total: number; page: number; totalPages: number }> {
    const { userId = 1, domain, search, page = 1, limit = 10 } = params;

    if (usePostgres && pgPool) {
      let query = "SELECT i.* FROM inspections i WHERE i.user_id = $1";
      const values: any[] = [userId];
      let valIdx = 2;

      if (domain && domain !== "All") {
        query += ` AND i.domain = $${valIdx++}`;
        values.push(domain);
      }
      if (search && search.trim()) {
        query += ` AND (i.summary ILIKE $${valIdx} OR i.domain ILIKE $${valIdx})`;
        values.push(`%${search.trim()}%`);
        valIdx++;
      }

      // Count total
      const countRes = await pgPool.query(`SELECT COUNT(*) as count FROM (${query}) q`, values);
      const total = parseInt(countRes.rows[0].count, 10);

      // Paged
      const offset = (page - 1) * limit;
      query += ` ORDER BY i.created_at DESC LIMIT $${valIdx++} OFFSET $${valIdx++}`;
      values.push(limit, offset);

      const itemsRes = await pgPool.query(query, values);

      // Attach detected objects
      const items = await Promise.all(
        itemsRes.rows.map(async (row) => {
          const objs = await pgPool!.query(
            "SELECT * FROM detected_objects WHERE inspection_id = $1 ORDER BY confidence DESC",
            [row.id]
          );
          return { ...row, detected_objects: objs.rows };
        })
      );

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      };
    }

    // Local DB implementation
    let filtered = localDb.inspections.filter((i) => i.user_id === userId);

    if (domain && domain !== "All") {
      filtered = filtered.filter((i) => i.domain.toLowerCase() === domain.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (i) =>
          (i.summary && i.summary.toLowerCase().includes(q)) ||
          i.domain.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paged = filtered.slice(startIndex, startIndex + limit);

    const items = paged.map((insp) => {
      const objs = localDb.detected_objects.filter((o) => o.inspection_id === insp.id);
      return {
        ...insp,
        detected_objects: objs,
      };
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getInspectionById(id: number, userId = 1): Promise<InspectionRecord | null> {
    if (usePostgres && pgPool) {
      const res = await pgPool.query("SELECT * FROM inspections WHERE id = $1 AND user_id = $2", [
        id,
        userId,
      ]);
      if (res.rows.length === 0) return null;
      const insp = res.rows[0];
      const objs = await pgPool.query(
        "SELECT * FROM detected_objects WHERE inspection_id = $1 ORDER BY confidence DESC",
        [id]
      );
      return { ...insp, detected_objects: objs.rows };
    }

    const insp = localDb.inspections.find((i) => i.id === id && i.user_id === userId);
    if (!insp) return null;
    const objs = localDb.detected_objects.filter((o) => o.inspection_id === id);
    return { ...insp, detected_objects: objs };
  },

  async createInspection(data: {
    userId: number;
    imageUrl: string;
    domain: string;
    summary: string;
    rawAiResponse: any;
    confidenceScore: number;
    detectedObjects: Array<{
      label: string;
      confidence: number;
      box_2d: number[];
      details: string;
    }>;
  }): Promise<InspectionRecord> {
    const { userId, imageUrl, domain, summary, rawAiResponse, confidenceScore, detectedObjects } =
      data;

    if (usePostgres && pgPool) {
      const client = await pgPool.connect();
      try {
        await client.query("BEGIN");
        const insRes = await client.query(
          `INSERT INTO inspections (user_id, image_url, domain, status, summary, raw_ai_response, confidence_score)
           VALUES ($1, $2, $3, 'completed', $4, $5, $6)
           RETURNING *`,
          [userId, imageUrl, domain, summary, JSON.stringify(rawAiResponse), confidenceScore]
        );
        const inspection = insRes.rows[0];

        const insertedObjs: DetectedObjectRecord[] = [];
        for (const obj of detectedObjects) {
          const [ymin, xmin, ymax, xmax] = obj.box_2d;
          const objRes = await client.query(
            `INSERT INTO detected_objects (inspection_id, label, confidence, box_2d_ymin, box_2d_xmin, box_2d_ymax, box_2d_xmax, details)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [inspection.id, obj.label, obj.confidence, ymin, xmin, ymax, xmax, obj.details || ""]
          );
          insertedObjs.push(objRes.rows[0]);
        }
        await client.query("COMMIT");
        return { ...inspection, detected_objects: insertedObjs };
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    }

    // Local DB
    const newId = localDb.nextInspectionId++;
    const newInspection: InspectionRecord = {
      id: newId,
      user_id: userId,
      image_url: imageUrl,
      domain,
      status: "completed",
      summary,
      raw_ai_response: rawAiResponse,
      confidence_score: confidenceScore,
      created_at: new Date().toISOString(),
    };
    localDb.inspections.unshift(newInspection);

    const insertedObjs: DetectedObjectRecord[] = [];
    for (const obj of detectedObjects) {
      const [ymin, xmin, ymax, xmax] = obj.box_2d;
      const newObj: DetectedObjectRecord = {
        id: localDb.nextObjectId++,
        inspection_id: newId,
        label: obj.label,
        confidence: obj.confidence,
        box_2d_ymin: ymin,
        box_2d_xmin: xmin,
        box_2d_ymax: ymax,
        box_2d_xmax: xmax,
        details: obj.details || "",
      };
      localDb.detected_objects.push(newObj);
      insertedObjs.push(newObj);
    }

    saveLocalDb();
    return { ...newInspection, detected_objects: insertedObjs };
  },

  async deleteInspection(id: number, userId = 1): Promise<boolean> {
    if (usePostgres && pgPool) {
      const res = await pgPool.query(
        "DELETE FROM inspections WHERE id = $1 AND user_id = $2 RETURNING id",
        [id, userId]
      );
      return (res.rowCount ?? 0) > 0;
    }

    const index = localDb.inspections.findIndex((i) => i.id === id && i.user_id === userId);
    if (index === -1) return false;
    localDb.inspections.splice(index, 1);
    localDb.detected_objects = localDb.detected_objects.filter((o) => o.inspection_id !== id);
    saveLocalDb();
    return true;
  },

  async getAnalyticsSummary(userId = 1) {
    if (usePostgres && pgPool) {
      const totalRes = await pgPool.query(
        "SELECT COUNT(*) as total, AVG(confidence_score) as avg_conf FROM inspections WHERE user_id = $1",
        [userId]
      );
      const total = parseInt(totalRes.rows[0].total || "0", 10);
      const avgConfidence = parseFloat(totalRes.rows[0].avg_conf || "0");

      const domainRes = await pgPool.query(
        "SELECT domain, COUNT(*) as count, AVG(confidence_score) as avg_conf FROM inspections WHERE user_id = $1 GROUP BY domain",
        [userId]
      );

      const objectsRes = await pgPool.query(
        `SELECT do.label, COUNT(*) as count 
         FROM detected_objects do 
         JOIN inspections i ON do.inspection_id = i.id 
         WHERE i.user_id = $1 
         GROUP BY do.label 
         ORDER BY count DESC 
         LIMIT 10`,
        [userId]
      );

      const recentRes = await pgPool.query(
        "SELECT id, domain, status, confidence_score, created_at, summary FROM inspections WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5",
        [userId]
      );

      return {
        totalInspections: total,
        averageConfidence: Number(avgConfidence.toFixed(1)),
        domainBreakdown: domainRes.rows.map((r) => ({
          domain: r.domain,
          count: parseInt(r.count, 10),
          avgConfidence: Number(parseFloat(r.avg_conf).toFixed(1)),
        })),
        topDetections: objectsRes.rows.map((r) => ({
          label: r.label,
          count: parseInt(r.count, 10),
        })),
        recentActivity: recentRes.rows,
        engineStatus: "online",
      };
    }

    // Local DB analytics calculation
    const userInspections = localDb.inspections.filter((i) => i.user_id === userId);
    const total = userInspections.length;
    const avgConfidence =
      total > 0
        ? userInspections.reduce((acc, i) => acc + (Number(i.confidence_score) || 0), 0) / total
        : 0;

    const domainMap: Record<string, { count: number; totalConf: number }> = {};
    for (const insp of userInspections) {
      if (!domainMap[insp.domain]) {
        domainMap[insp.domain] = { count: 0, totalConf: 0 };
      }
      domainMap[insp.domain].count++;
      domainMap[insp.domain].totalConf += Number(insp.confidence_score) || 0;
    }

    const domainBreakdown = Object.entries(domainMap).map(([domain, data]) => ({
      domain,
      count: data.count,
      avgConfidence: Number((data.totalConf / data.count).toFixed(1)),
    }));

    const inspectionIds = new Set(userInspections.map((i) => i.id));
    const userObjects = localDb.detected_objects.filter((o) => inspectionIds.has(o.inspection_id));

    const objMap: Record<string, number> = {};
    for (const obj of userObjects) {
      objMap[obj.label] = (objMap[obj.label] || 0) + 1;
    }

    const topDetections = Object.entries(objMap)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const recentActivity = userInspections.slice(0, 5).map((i) => ({
      id: i.id,
      domain: i.domain,
      status: i.status,
      confidence_score: i.confidence_score,
      created_at: i.created_at,
      summary: i.summary,
    }));

    return {
      totalInspections: total,
      averageConfidence: Number(avgConfidence.toFixed(1)),
      domainBreakdown,
      topDetections,
      recentActivity,
      engineStatus: "online",
    };
  },
};
