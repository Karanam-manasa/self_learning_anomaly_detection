import "../styles/csv-analysis.css";

const CsvUpload = () => {
  return (
    <div className="card">
      <h3>CSV Anomaly Analysis</h3>

      <input type="file" accept=".csv" />

      <button style={{ marginTop: "10px" }}>
        Run CSV Analysis
      </button>

      <p style={{ marginTop: "10px", color: "#64748b" }}>
        Upload sensor CSV file to detect anomalies and generate report.
      </p>
    </div>
  );
};

export default CsvUpload;