const admin = require("../config/firebase");
const pool = require("../config/db");

// ✅ REGISTER
const register = async (req, res) => {
  const { idToken, role, code } = req.body;

  try {
    // 1. Firebase token'ını doğrula
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    // 2. Rolü normalize et (örnek: "Product Owner" → "product_owner")
    const normalizedRole = role.toLowerCase().replace(/\s+/g, "_");

    // 3. Eğer Product Owner ise özel kod kontrolü yap
    if (normalizedRole === "product_owner") {
      if (code !== process.env.PRODUCT_OWNER_SECRET) {
        return res.status(403).json({ message: "Güvenlik kodu hatalı." });
      }
    }

    // 4. Kullanıcı zaten var mı kontrol et
    const userCheck = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı." });
    }

    // 5. Kullanıcıyı ekle (şifre Firebase'de tutulduğu için dummy string)
    const newUser = await pool.query(
      `INSERT INTO users (email, password, created_at) VALUES ($1, $2, NOW()) RETURNING id`,
      [email, "firebase"]
    );
    const userId = newUser.rows[0].id;

    // 6. Rol ID'sini bul
    const roleData = await pool.query(`SELECT id FROM roles WHERE name = $1`, [normalizedRole]);
    if (roleData.rows.length === 0) {
      console.error("Rol bulunamadı:", normalizedRole);
      return res.status(400).json({ message: "Geçersiz rol." });
    }
    const roleId = roleData.rows[0].id;

    // 7. user_roles tablosuna ilişkiyi kaydet
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
      [userId, roleId]
    );

    return res.status(201).json({ message: "✅ Kullanıcı başarıyla kaydedildi." });
  } catch (err) {
    console.error("❌ Register error:", err);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
};

// ✅ ME
const me = (req, res) => {
  const user = req.user;
  return res.status(200).json({
    id: user.id,
    email: user.email,
    role: user.role,
  });
};

module.exports = {
  register,
  me,
};
