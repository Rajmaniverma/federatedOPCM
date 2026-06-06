const express = require("express");
const router = express.Router();

const db = require("../db");

router.get("/", (req, res) => {
  db.query("SELECT * FROM shipments", (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

module.exports = router;