const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  try {

    // Get grouped cases
    const response = await axios.get(
      "http://localhost:5005/api/group"
    );

    const groupedCases = response.data.cases;

    const events = [];
    const objects = [];
    const relations = [];

    let eventCounter = 1;

    const objectSet = new Set();

    Object.keys(groupedCases).forEach((caseId) => {

      groupedCases[caseId].forEach((event) => {

        const eventId = `E${eventCounter++}`;

        // Event
        events.push({
          id: eventId,
          activity: event.activity,
          timestamp: event.timestamp
        });

        // Purchase Order Object
        if (event.orderId) {

          const poId = `PO${event.orderId}`;

          if (!objectSet.has(poId)) {

            objectSet.add(poId);

            objects.push({
              id: poId,
              type: "PurchaseOrder"
            });
          }

          relations.push({
            event: eventId,
            object: poId
          });
        }

        // Product Object
        if (event.productId) {

          const productId = `P${event.productId}`;

          if (!objectSet.has(productId)) {

            objectSet.add(productId);

            objects.push({
              id: productId,
              type: "Product"
            });
          }

          relations.push({
            event: eventId,
            object: productId
          });
        }

        // Invoice Object
        if (event.invoiceId) {

          const invoiceId = `INV${event.invoiceId}`;

          if (!objectSet.has(invoiceId)) {

            objectSet.add(invoiceId);

            objects.push({
              id: invoiceId,
              type: "Invoice"
            });
          }

          relations.push({
            event: eventId,
            object: invoiceId
          });
        }

      });

    });

    res.json({
      success: true,
      totalEvents: events.length,
      totalObjects: objects.length,
      totalRelations: relations.length,
      events,
      objects,
      relations
    });

  } catch (error) {

    console.error("OCEL Error:", error.message);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

module.exports = router;