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

    console.log("Before Cleaning:", allEvents.length);

    // Remove duplicate events
    const cleanedEvents = [
      ...new Map(
        allEvents.map(event => [
          `${event.caseId}-${event.activity}-${event.timestamp}`,
          event
        ])
      ).values()
    ];

    console.log("After Cleaning:", cleanedEvents.length);

    // Sort events by timestamp
    cleanedEvents.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Return cleaned and sorted event log
    res.json({
      success: true,
      totalEvents: cleanedEvents.length,
      events: cleanedEvents,
    });

  } catch (error) {
    console.error("Aggregation Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;