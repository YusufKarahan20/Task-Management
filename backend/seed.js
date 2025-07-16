const pool = require("./src/config/db");
require("dotenv").config();

const seedData = async () => {
  try {
    // 1. Rolleri ekle
    const roles = ["developer", "tester", "analyst", "product_owner"];
    for (const role of roles) {
      await pool.query(`INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [role]);
    }

    // 2. Statüleri ekle
    const statuses = ["to_do", "in_progress", "done"];
    for (const status of statuses) {
      await pool.query(`INSERT INTO statuses (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [status]);
    }

    console.log("✅ Seed data inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error inserting seed data:", err);
    process.exit(1);
  }
};

seedData();
