const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {

    const response = await axios.get(
      "http://localhost:5005/api/group"
    );

    const groupedCases = response.data.cases;

    let totalPoToShip = 0;
    let totalShipToInvoice = 0;
    let totalCases = 0;

    const caseAnalysis = [];

    Object.keys(groupedCases).forEach(caseId => {

      const events = groupedCases[caseId];

      if (events.length < 3) return;

      const poDate = new Date(events[0].timestamp);
      const shipDate = new Date(events[1].timestamp);
      const invoiceDate = new Date(events[2].timestamp);

      const poToShip =
        (shipDate - poDate) / (1000 * 60 * 60 * 24);

      const shipToInvoice =
        (invoiceDate - shipDate) / (1000 * 60 * 60 * 24);

      totalPoToShip += poToShip;
      totalShipToInvoice += shipToInvoice;
      totalCases++;

      caseAnalysis.push({
        caseId,
        poToShipDays: poToShip,
        shipToInvoiceDays: shipToInvoice,
        bottleneck:
          poToShip > shipToInvoice
            ? "PO → Ship"
            : "Ship → Invoice"
      });

    });

    const avgPoToShip =
      totalPoToShip / totalCases;

    const avgShipToInvoice =
      totalShipToInvoice / totalCases;

    const overallBottleneck =
      avgPoToShip > avgShipToInvoice
        ? "Create Purchase Order → Ship Goods"
        : "Ship Goods → Generate Invoice";

    res.json({
      success: true,
      totalCases,
      avgPoToShip,
      avgShipToInvoice,
      overallBottleneck,
      caseAnalysis
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

module.exports = router;