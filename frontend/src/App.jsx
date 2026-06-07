import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [eventLog, setEventLog] = useState(null);
  const [variants, setVariants] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [ocel, setOcel] = useState(null);
  const [bottleneck, setBottleneck] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          eventRes,
          variantRes,
          metricsRes,
          ocelRes,
          bottleneckRes,
        ] = await Promise.all([
          fetch("http://localhost:5005/aggregate"),
          fetch("http://localhost:5005/process"),
          fetch("http://localhost:5005/metrices"),
          fetch("http://localhost:5005/ocel"),
          fetch("http://localhost:5005/bottleneck"),
        ]);

        setEventLog(await eventRes.json());
        setVariants(await variantRes.json());
        setMetrics(await metricsRes.json());
        setOcel(await ocelRes.json());
        setBottleneck(await bottleneckRes.json());

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <h1 className="loading">Loading Dashboard...</h1>;
  }

  const caseCPI =
  metrics?.metrics?.map((metric) => {
    const bottleneckCase =
      bottleneck?.caseAnalysis?.find(
        (c) => c.caseId === metric.caseId
      );

    const leadTime = metric.leadTimeDays;

    const poToShip =
      bottleneckCase?.poToShipDays || 0;

    const efficiency =
      1 - poToShip / leadTime;

    const compliance = 1;

    const timeliness = Math.min(
      4 / leadTime,
      1
    );

    const cpi = (
      efficiency *
      compliance *
      timeliness
    ).toFixed(2);

    let status = "Average";

    if (cpi >= 0.8) {
      status = "Excellent";
    } else if (cpi >= 0.5) {
      status = "Good";
    }

    return {
      caseId: metric.caseId,
      efficiency: efficiency.toFixed(2),
      compliance: compliance.toFixed(2),
      timeliness: timeliness.toFixed(2),
      cpi,
      status,
    };
  }) || [];

const averageCPI =
  caseCPI.length > 0
    ? (
        caseCPI.reduce(
          (sum, item) =>
            sum + Number(item.cpi),
          0
        ) / caseCPI.length
      ).toFixed(2)
    : 0;

  return (
    <div className="container">
      <h1>Federated OCPM Dashboard</h1>

      {/* Summary Cards */}

      <div className="summary-grid">
        <div className="summary-card">
          <h3>Total Events</h3>
          <p>{eventLog?.totalEvents}</p>
        </div>

        <div className="summary-card">
          <h3>Total Cases</h3>
          <p>{metrics?.totalCases}</p>
        </div>

        <div className="summary-card">
          <h3>Total Objects</h3>
          <p>{ocel?.totalObjects}</p>
        </div>

        <div className="summary-card">
          <h3>Total Variants</h3>
          <p>{variants?.totalVariants}</p>
        </div>
      </div>

     
      <div className="summary-card">
  <h3>Average CPI</h3>
  <p>{averageCPI}</p>
</div>
<div className="card">
  <h2>Composite Process Index (CPI)</h2>

  <table>
    <thead>
      <tr>
        <th>Case ID</th>
        <th>Efficiency</th>
        <th>Compliance</th>
        <th>Timeliness</th>
        <th>CPI</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {caseCPI.map((item) => (
        <tr key={item.caseId}>
          <td>{item.caseId}</td>
          <td>{item.efficiency}</td>
          <td>{item.compliance}</td>
          <td>{item.timeliness}</td>
          <td>{item.cpi}</td>
          <td>
            <span
              className={
                item.status === "Excellent"
                  ? "excellent"
                  : item.status === "Good"
                  ? "good"
                  : "average"
              }
            >
              {item.status}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
 {/* OCEL */}
      <div className="card">
        <h2>OCEL Summary</h2>

        <p>Total Events: {ocel?.totalEvents}</p>
        <p>Total Objects: {ocel?.totalObjects}</p>
        <p>Total Relations: {ocel?.totalRelations}</p>
      </div>

      {/* Variants */}

      <div className="card">
        <h2>Process Variants</h2>

        {Object.entries(variants?.variants || {}).map(
          ([variant, count], index) => (
            <div className="variant" key={index}>
              <strong>{variant}</strong>
              <span>{count} Cases</span>
            </div>
          )
        )}
      </div>

      {/* Metrics */}

      <div className="card">
        <h2>Process Metrics</h2>

        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Start</th>
              <th>End</th>
              <th>Lead Time</th>
            </tr>
          </thead>

          <tbody>
            {metrics?.metrics?.map((item) => (
              <tr key={item.caseId}>
                <td>{item.caseId}</td>
                <td>{item.startActivity}</td>
                <td>{item.endActivity}</td>
                <td>{item.leadTimeDays} Days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottleneck */}

      <div className="card">
        <h2>Bottleneck Analysis</h2>

        <p>
          <strong>Overall Bottleneck:</strong>{" "}
          {bottleneck?.overallBottleneck}
        </p>

        <p>
          Average PO → Ship Delay :
          <strong> {bottleneck?.avgPoToShip} Days</strong>
        </p>

        <p>
          Average Ship → Invoice Delay :
          <strong> {bottleneck?.avgShipToInvoice} Days</strong>
        </p>
      </div>

      {/* Event Log */}

      <div className="card">
        <h2>Recent Event Log</h2>

        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Activity</th>
              <th>Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {eventLog?.events?.map((event, index) => (
              <tr key={index}>
                <td>{event.caseId}</td>
                <td>{event.activity}</td>
                <td>
                  {new Date(event.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;