
const express = require("express");
const { randomUUID } = require("node:crypto");
const pool = require("../db");

const router = express.Router();

const allowedStatuses = [
  "diterima",
  "diverifikasi",
  "diproses",
  "selesai",
  "ditolak",
];

const validText = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validId = (value) =>
  /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM complaints ORDER BY created_at DESC, id DESC"
    );

    res.json({
      message: "Daftar pengaduan berhasil diambil",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

router.get("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM complaints WHERE id = $1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Pengaduan tidak ditemukan",
      });
    }

    res.json({
      message: "Detail pengaduan berhasil diambil",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

router.post("/", async (req, res) => {
  const { category, description, location } = req.body || {};

  if (
    !validText(category) ||
    !validText(description) ||
    !validText(location) ||
    category.length > 100 ||
    location.length > 255
  ) {
    return res.status(400).json({
      message: "Data pengaduan tidak valid atau tidak lengkap",
    });
  }

  try {
    const ticketNumber =
      "ADU-" + randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase();

    const result = await pool.query(
      `INSERT INTO complaints
        (ticket_number, category, description, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        ticketNumber,
        category.trim(),
        description.trim(),
        location.trim(),
      ]
    );

    res.status(201).json({
      message: "Pengaduan berhasil dibuat",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat pengaduan" });
  }
});

router.put("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  const { category, description, location, status } = req.body || {};

  if (
    !validText(category) ||
    !validText(description) ||
    !validText(location) ||
    category.length > 100 ||
    location.length > 255 ||
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      message: "Data pembaruan tidak valid atau tidak lengkap",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE complaints
       SET category = $1,
           description = $2,
           location = $3,
           status = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        category.trim(),
        description.trim(),
        location.trim(),
        status,
        req.params.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Pengaduan tidak ditemukan",
      });
    }

    res.json({
      message: "Pengaduan berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui pengaduan" });
  }
});

router.delete("/:id", async (req, res) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM complaints WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Pengaduan tidak ditemukan",
      });
    }

    res.json({
      message: "Pengaduan berhasil dihapus",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus pengaduan" });
  }
});

module.exports = router;
