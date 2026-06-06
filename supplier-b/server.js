require("dotenv").config();

const express = require("express");
const cors = require("cors");

const productsRoute = require("./routes/products");
const suppliersRoute = require("./routes/suppliers");
const purchaseOrdersRoute = require("./routes/purchaseOrders");
const shipmentsRoute = require("./routes/shipments");
const invoicesRoute = require("./routes/invoices");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/products", productsRoute);
app.use("/api/suppliers", suppliersRoute);
app.use("/api/purchase-orders", purchaseOrdersRoute);
app.use("/api/shipments", shipmentsRoute);
app.use("/api/invoices", invoicesRoute);

app.get("/", (req, res) => {
  res.send("Supplier B ERP Backend Running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});