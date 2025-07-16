const pool = require("./src/config/db");

const createTables = async () => {
  try {
    await pool.query(`DROP TABLE IF EXISTS todos, tasks, user_roles, statuses, roles, users CASCADE`);

    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      );
    `);

    await pool.query(`
      CREATE TABLE user_roles (
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      );
    `);

    await pool.query(`
      CREATE TABLE statuses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
      );
    `);

    await pool.query(`
      CREATE TABLE tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status_id INTEGER NOT NULL REFERENCES statuses(id),
        deadline DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        assigned_to INTEGER NOT NULL REFERENCES users(id),
        created_by INTEGER NOT NULL REFERENCES users(id)
      );
    `);

    await pool.query(`
      CREATE TABLE todos (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        order_index INTEGER,
        is_done BOOLEAN DEFAULT FALSE
      );
    `);

    console.log("✅ All tables created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating tables:", err);
    process.exit(1);
  }
};

createTables();
