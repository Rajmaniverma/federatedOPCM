const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {

    const response = await axios.get(
      "http://localhost:5005/api/group"
    );

    const groupedCases = response.data.cases;

    const variants = {};

    Object.keys(groupedCases).forEach(caseId => {

      const path = groupedCases[caseId]
        .map(event => event.activity)
        .join(" → ");

      variants[path] = (variants[path] || 0) + 1;

    });

    res.json({
      success: true,
      totalVariants: Object.keys(variants).length,
      variants
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

module.exports = router;