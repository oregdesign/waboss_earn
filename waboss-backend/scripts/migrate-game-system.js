// scripts/migrate-game-system.js
const { pool } = require("../src/db/database");
const fs = require("fs");
const path = require("path");

const log = {
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`), // cyan
  success: (msg) => console.log(`\x1b[32m${msg}\x1b[0m`), // green
  warn: (msg) => console.log(`\x1b[33m${msg}\x1b[0m`), // yellow
  error: (msg) => console.log(`\x1b[31m${msg}\x1b[0m`), // red
};

async function checkExistingTables(client) {
  const res = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public';
  `);
  return res.rows.map((r) => r.table_name);
}

async function checkExistingInserts(client) {
  const checks = {
    ranks: "SELECT COUNT(*) FROM ranks;",
    achievements: "SELECT COUNT(*) FROM achievements;",
    missions: "SELECT COUNT(*) FROM missions;",
    referral_rewards: "SELECT COUNT(*) FROM referral_rewards;",
    level_config: "SELECT COUNT(*) FROM level_config;",
  };
  const result = {};
  for (const [key, sql] of Object.entries(checks)) {
    try {
      const res = await client.query(sql);
      result[key] = parseInt(res.rows[0].count, 10);
    } catch {
      result[key] = 0;
    }
  }
  return result;
}

async function runMigration() {
  const client = await pool.connect();
  try {
    log.info("\n🚀 Starting WaBoss gamification migration...\n");

    const sqlPath =
      process.env.GAME_SCHEMA_PATH ||
      path.join(__dirname, "gamification_schema.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    const beforeTables = await checkExistingTables(client);
    const beforeData = await checkExistingInserts(client);

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    const afterTables = await checkExistingTables(client);
    const afterData = await checkExistingInserts(client);

    const newTables = afterTables.filter((t) => !beforeTables.includes(t));
    const totalTables = afterTables.length;
    const dataDiff = {};

    for (const key of Object.keys(afterData)) {
      const diff = afterData[key] - (beforeData[key] || 0);
      dataDiff[key] = diff;
    }

    log.success("\n✅ Migration completed successfully.\n");
    log.info("──────────────────────────────────────────");
    log.info("📊 TABLE SUMMARY:");
    log.info(`Total tables in schema: ${totalTables}`);
    if (newTables.length > 0) {
      log.success(`Created: ${newTables.join(", ")}`);
    } else {
      log.warn("No new tables created (all existed)");
    }

    log.info("\n🏅 DEFAULT DATA INSERT SUMMARY:");
    Object.entries(dataDiff).forEach(([table, diff]) => {
      if (diff > 0)
        log.success(`${table.padEnd(20)} +${diff} inserted/added`);
      else log.warn(`${table.padEnd(20)} no new records`);
    });

    log.info("\n🧠 FUNCTION STATUS: Updated or Created");
    log.success("Functions: generate_referral_code, process_referral_reward, get_xp_for_next_level, update_user_rank, add_xp_to_user");
    log.info("──────────────────────────────────────────\n");
  } catch (error) {
    await client.query("ROLLBACK");

    if (
      error.message.includes("already exists") ||
      error.message.includes("duplicate key value")
    ) {
      log.warn(
        "⚠️  Some tables or records already existed — migration skipped safely."
      );
    } else {
      log.error("❌ Migration failed:");
      console.error(error.message);
      console.error(error.stack);
      process.exit(1);
    }
  } finally {
    client.release();
    await pool.end();
    log.info("🧩 Database connection closed.\n");
  }
}

runMigration();
