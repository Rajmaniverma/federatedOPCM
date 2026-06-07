const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const aggregateRoutes = require("./routes/aggregate");
const groupedCases = require("./api/groupedcase");
const processvariant = require("./routes/Processvariant");
const processmatrics = require("./api/processmetrics");
const ocel = require("./routes/ocel");
const bottleneck = require("./routes/Bottleneck")
app.use("/aggregate", aggregateRoutes);
app.use("/api/group", groupedCases);
app.use("/process", processvariant);
app.use("/metrices", processmatrics);
app.use("/ocel", ocel);
app.use("/bottleneck", bottleneck);

app.get("/", (req, res) => {
  res.send("Aggregator Server is Running");
});

const PORT = 5005;

app.listen(PORT, () => {
  console.log(`Aggregator Server running on port ${PORT}`);
});