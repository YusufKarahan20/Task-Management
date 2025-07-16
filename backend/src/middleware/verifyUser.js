const admin = require("../config/firebase");
const pool = require("../config/db");

const verifyUser = async (req, res, next) => {
  const idToken = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!idToken) {
    return res.status(401).json({ message: "Token bulunamadı." });
  }

  try {
    // Firebase token doğrula
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;

    // Veritabanından kullanıcıyı bul
    const userQuery = await pool.query(
      `SELECT u.id, u.email, r.name as role
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Kullanıcıyı req.user içine koy
    req.user = userQuery.rows[0];
    next();
  } catch (err) {
    console.error("verifyUser hatası:", err);
    res.status(403).json({ message: "Geçersiz token." });
  }
};

module.exports = verifyUser;
