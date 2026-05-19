const ResultCard = ({ result }) => {
  if (!result) return null;

  const isAlert = result.anomaly;

  return (
    <div className="result-container">
      
      {/* Status Section */}
      <div className={`status-card ${isAlert ? "alert" : "normal"}`}>
        <div className={`status-card ${isAnomaly ? "danger" : "safe"}`}>
        <h3>
          {isAnomaly ? "⚠ Anomaly Detected - Maintenance Required!" : "✔ System Normal"}
        </h3>
</div>
      </div>

      {/* Score Cards */}
      <div className="score-grid">
        <div className="score-card">
          <h4>Autoencoder Error</h4>
          <p>{result.autoencoder_error?.toFixed(5)}</p>
        </div>

        <div className="score-card">
          <h4>Isolation Forest Score</h4>
          <p>{result.isolation_forest_score?.toFixed(5)}</p>
        </div>

        <div className="score-card">
          <h4>Ensemble Score</h4>
          <p>{result.ensemble_score?.toFixed(5)}</p>
        </div>
      </div>

    </div>
  );
};

export default ResultCard;