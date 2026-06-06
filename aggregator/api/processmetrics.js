const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {

    const response = await axios.get(
      "http://localhost:5005/api/group"
    );

    const groupedCases = response.data.cases;

    const metrics = [];

    Object.keys(groupedCases).forEach(caseId => {

      const events = groupedCases[caseId];

      const startTime = new Date(events[0].timestamp);
      const endTime = new Date(
        events[events.length - 1].timestamp
      );

      const leadTime =
        (endTime - startTime) /
        (1000 * 60 * 60 * 24);

      metrics.push({
        caseId,
        startActivity: events[0].activity,
        endActivity:
          events[events.length - 1].activity,
        leadTimeDays: leadTime
      });

    });

    res.json({
      success: true,
      totalCases: metrics.length,
      metrics
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

module.exports = router;