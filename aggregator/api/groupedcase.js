const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {
    // Fetch event logs from all suppliers
    const supplierA = await axios.get(
      "http://localhost:5001/api/eventlog"
    );

    const supplierB = await axios.get(
      "http://localhost:5002/api/eventlog"
    );

    const supplierC = await axios.get(
      "http://localhost:5003/api/eventlog"
    );

    // Merge all events
    const allEvents = [
      ...supplierA.data.events,
      ...supplierB.data.events,
      ...supplierC.data.events,
    ];

    // Remove duplicates
    const cleanedEvents = [
      ...new Map(
        allEvents.map(event => [
          `${event.caseId}-${event.activity}-${event.timestamp}`,
          event,
        ])
      ).values(),
    ];

    // Sort by timestamp
    cleanedEvents.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Group by caseId
    const groupedCases = {};

    cleanedEvents.forEach((event) => {
      if (!groupedCases[event.caseId]) {
        groupedCases[event.caseId] = [];
      }

      groupedCases[event.caseId].push(event);
    });

    res.json({
      success: true,
      totalCases: Object.keys(groupedCases).length,
      cases: groupedCases,
    });

  } catch (error) {
    console.error("Grouping Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;