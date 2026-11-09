
const express = require("express");
const pool = require("../db");

const router = express.Router();

const validText = (value, maxLength) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  (!maxLength || value.length <= maxLength);

const validId = (value) =>
  Number.isSafeInteger(Number(value)) && Number(value) > 0;

const validStatus = ["diajukan", "diproses", "selesai", "ditolak"];

function handleError(error, res) {
  console.error("Database Error:", error);

  if (error.code === "23503") {
    return res.status(400).json({
      message: "User ID atau Category ID tidak ditemukan"
    });
  }

  return res.status(500).json({
    message: "Terjadi kesalahan pada server"
  });
}

// 1. GET - Semua laporan
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reports ORDER BY id ASC"
    );

    res.status(200).json({
      message: "Berhasil mengambil semua laporan",
      data: result.rows
    });
  } catch (error) {
    handleError(error, res);
  }
});

// 2. GET - Laporan berdasarkan ID
router.get("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM reports WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Laporan tidak ditemukan"
      });
    }

    res.status(200).json({
      message: "Berhasil mengambil laporan",
      data: result.rows[0]
    });
  } catch (error) {
    handleError(error, res);
  }
});

// 3. POST - Tambah laporan
router.post("/", async (req, res) => {
  const {
    user_id, category_id, title,
    description, location, status = "diajukan"
  } = req.body || {};

  if (
    !validId(user_id) ||
    !validId(category_id) ||
    !validText(title, 200) ||
    !validText(description) ||
    !validText(location) ||
    !validStatus.includes(status)
  ) {
    return res.status(400).json({
      message: "Data laporan tidak valid atau tidak lengkap"
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reports
        (user_id, category_id, title, description, location, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        user_id, category_id, title.trim(),
        description.trim(), location.trim(), status
      ]
    );

    res.status(201).json({
      message: "Laporan berhasil dibuat",
      data: result.rows[0]
    });
  } catch (error) {
    handleError(error, res);
  }
});

// 4. PUT - Update laporan
router.put("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  const {
    user_id, category_id, title,
    description, location, status
  } = req.body || {};

  if (
    !validId(user_id) ||
    !validId(category_id) ||
    !validText(title, 200) ||
    !validText(description) ||
    !validText(location) ||
    !validStatus.includes(status)
  ) {
    return res.status(400).json({
      message: "Data laporan tidak valid atau tidak lengkap"
    });
  }

  try {
    const result = await pool.query(
      `UPDATE reports SET
        user_id = $1,
        category_id = $2,
        title = $3,
        description = $4,
        location = $5,
        status = $6,
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        user_id, category_id, title.trim(),
        description.trim(), location.trim(),
        status, req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Laporan tidak ditemukan"
      });
    }

    res.status(200).json({
      message: "Laporan berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    handleError(error, res);
  }
});

// 5. DELETE - Hapus laporan
router.delete("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM reports WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Laporan tidak ditemukan"
      });
    }

    res.status(200).json({
      message: "Laporan berhasil dihapus",
      data: result.rows[0]
    });
  } catch (error) {
    handleError(error, res);
  }
});

module.exports = router;
