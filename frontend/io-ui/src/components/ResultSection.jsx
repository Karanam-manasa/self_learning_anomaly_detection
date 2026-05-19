import ModelContribution from "./ModelContribution";
import SystemHealth from "./SystemHealth";
import AnomalyReason from "./AnomalyReason";
import EnsembleResults from "./EnsembleResults";
import { FaMicrochip, FaLeaf, FaChartPie, FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import "../styles/live-sensor.css";

const ResultSection = ({ result }) => {
  // const placeholder = {
  //   autoencoder_error: 0.005,
  //   isolation_forest_score: 0.732,
  //   ensemble_score: 0.612,
  //   threshold: 0.54,
  //   anomaly: true
  // };
  const placeholder = {
  autoencoder_error: 0.005,
  isolation_forest_score: 0.732,
  ensemble_score: 0.612,
  threshold: 0.54,
  anomaly: true,

  // 🔥 Add these for EnsembleResults
  ae_score: 0.6,
  if_score: 0.7,
  and_result: true,
  or_result: true
};

  const dataResult = result || placeholder;

  const isAnomaly = dataResult.anomaly;

 

  return (
    <div className="result-section" style={{ position: "relative" }}>

      

      {/* STATUS CARD */}
      <div className={`status-card ${isAnomaly ? "danger" : "safe"}`}>
        <div className="status-content">
          <span className="status-title">
            {isAnomaly ? <span className="status-icon"><FaExclamationTriangle /></span> : <span className="status-icon"><FaShieldAlt /></span>}
            {isAnomaly ? "ANOMALY DETECTED" : "SYSTEM NORMAL"}
          </span>
          <span className="status-sub">
            {isAnomaly ? "Maintenance Required" : "Operating within normal conditions"}
          </span>
        </div>
      </div>

      {/* SCORE ROW */}
      <div className="score-row">
        <div className="score-card">
          <div className="score-left">
            <div className="score-icon blue"><FaMicrochip /></div>
            <div>
              <div className="score-title">Autoencoder Error</div>
              <div className="score-value">{dataResult.autoencoder_error?.toFixed(4)}</div>
            </div>
          </div>
        </div>

        <div className="score-card">
          <div className="score-left">
            <div className="score-icon green"><FaLeaf /></div>
            <div>
              <div className="score-title">Isolation Forest Score</div>
              <div className="score-value">{dataResult.isolation_forest_score?.toFixed(4)}</div>
            </div>
          </div>
        </div>

        <div className="score-card">
          <div className="score-left">
            <div className="score-icon amber"><FaChartPie /></div>
            <div>
              <div className="score-title">Ensemble Anomaly Score</div>
              <div className="score-value">{dataResult.ensemble_score?.toFixed(4)}</div>
            </div>
          </div>
        </div>
      </div>



      {/* CHART SECTION */}
      <div className="middle-grid">
        <ModelContribution result={dataResult} />
        <SystemHealth result={dataResult} />
        <AnomalyReason result={dataResult} />
      </div>

      <div className="card">
  <h3>Ensemble Analysis</h3>
  <EnsembleResults result={dataResult} />
</div>

    </div>
  );
};

export default ResultSection;