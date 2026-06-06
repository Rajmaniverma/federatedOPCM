const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {

  db.query("SELECT * FROM purchase_orders", (err, orders) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.query("SELECT * FROM shipments", (err, shipments) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.query("SELECT * FROM invoices", (err, invoices) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        const events = [];
        const objects = [];
        const relations = [];

        let eventCounter = 1;

        // PURCHASE ORDER EVENTS
        orders.forEach((order) => {

          const eventId = `E${eventCounter++}`;

          events.push({
            event_id: eventId,
            activity: "Create Purchase Order",
            timestamp: order.order_date
          });

          objects.push({
            object_id: `PO${order.po_id}`,
            object_type: "PurchaseOrder"
          });

          objects.push({
            object_id: `P${order.product_id}`,
            object_type: "Product"
          });

          relations.push({
            event_id: eventId,
            object_id: `PO${order.po_id}`
          });

          relations.push({
            event_id: eventId,
            object_id: `P${order.product_id}`
          });

        });

        // SHIPMENT EVENTS
        shipments.forEach((shipment) => {

          const eventId = `E${eventCounter++}`;

          events.push({
            event_id: eventId,
            activity: "Ship Goods",
            timestamp: shipment.shipment_date
          });

          objects.push({
            object_id: `SH${shipment.Shipment_id}`,
            object_type: "Shipment"
          });

          relations.push({
            event_id: eventId,
            object_id: `PO${shipment.po_id}`
          });

          relations.push({
            event_id: eventId,
            object_id: `SH${shipment.Shipment_id}`
          });

        });

        // INVOICE EVENTS
        invoices.forEach((invoice) => {

          const eventId = `E${eventCounter++}`;

          events.push({
            event_id: eventId,
            activity: "Generate Invoice",
            timestamp: invoice.invoice_date
          });

          objects.push({
            object_id: `INV${invoice.invoice_id}`,
            object_type: "Invoice"
          });

          relations.push({
            event_id: eventId,
            object_id: `PO${invoice.po_id}`
          });

          relations.push({
            event_id: eventId,
            object_id: `INV${invoice.invoice_id}`
          });

        });

        // Remove duplicate objects
        const uniqueObjects = [];
        const seen = new Set();

        objects.forEach(obj => {
          const key = `${obj.object_id}-${obj.object_type}`;

          if (!seen.has(key)) {
            seen.add(key);
            uniqueObjects.push(obj);
          }
        });

        res.json({
          supplier: "Supplier A",
          totalEvents: events.length,
          totalObjects: uniqueObjects.length,
          totalRelations: relations.length,
          events,
          objects: uniqueObjects,
          relations
        });

      });
    });
  });

});

module.exports = router;