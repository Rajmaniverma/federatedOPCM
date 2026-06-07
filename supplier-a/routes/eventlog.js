


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

        let eventLog = [];

        // Purchase Order Events
        orders.forEach((order) => {
          eventLog.push({
            caseId: order.po_id,
            activity: "Create Purchase Order",
            timestamp: order.order_date,
            orderId: order.po_id,
            productId: order.product_id,
            source: "purchase_orders"
          });
        });

        // Shipment Events
        shipments.forEach((shipment) => {
          eventLog.push({
            caseId: shipment.po_id,
            activity: "Ship Goods",
            timestamp: shipment.shipment_date,
            shipmentId: shipment.shipment_id,
            source: "shipments"
          });
        });

        // Invoice Events
        invoices.forEach((invoice) => {
          eventLog.push({
            caseId: invoice.po_id,
            activity: "Generate Invoice",
            timestamp: invoice.invoice_date,
            invoiceId: invoice.invoice_id,
            source: "invoices"
          });
        });

        // Sort by timestamp
        eventLog.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );

        res.json({
          totalEvents: eventLog.length,
          events: eventLog
        });
      });
    });
  });
});

module.exports = router;


