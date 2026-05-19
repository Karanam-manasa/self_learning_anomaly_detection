import React from "react";
import { FaCheckCircle, FaExclamationTriangle, FaPlusSquare, FaWindowRestore, FaWeightHanging } from "react-icons/fa";

const EnsembleResults = ({ result }) => {
  if (!result) return null;

  const threshold = result.threshold || 0.5;
//   const ae_norm = result.ae_norm || 0;
//   const if_norm = result.if_norm || 0;

  const ae_norm = result.ae_score || 0;
  const if_norm = result.if_score || 0;
  
  // Calculate results for the 3 ensemble methods
//   const andEnsemble = ae_norm >= threshold && if_norm >= threshold;
//   const orEnsemble = ae_norm >= threshold || if_norm >= threshold;
//   const weightedEnsemble = result.anomaly; // Backend already calculates (ae_norm + if_norm) / 2 >= threshold


    const andEnsemble = result.and_result;
    const orEnsemble = result.or_result;
    const weightedEnsemble = result.anomaly;
  const ensembles = [
    {
      name: "AND Ensemble",
      status: andEnsemble ? "Anomaly" : "Normal",
      isAnomaly: andEnsemble,
      icon: <FaPlusSquare />,
      description: "Flags if BOTH models detect anomaly",
      score: Math.min(ae_norm, if_norm)
    },
    {
      name: "OR Ensemble",
      status: orEnsemble ? "Anomaly" : "Normal",
      isAnomaly: orEnsemble,
      icon: <FaWindowRestore />,
      description: "Flags if EITHER model detects anomaly",
      score: Math.max(ae_norm, if_norm)
    },
    {
      name: "Weighted Ensemble",
      status: weightedEnsemble ? "Anomaly" : "Normal",
      isAnomaly: weightedEnsemble,
      icon: <FaWeightHanging />,
      description: "Flags based on combined model confidence",
      score: (ae_norm + if_norm) / 2
    }
  ];

  return (
    <div className="ensemble-results-container">
      <div className="ensemble-grid">
        {ensembles.map((ensemble, index) => (
          <div key={index} className={`ensemble-card ${ensemble.isAnomaly ? "anomaly" : "normal"}`}>
            <div className="ensemble-icon-wrap">
              <span className="ensemble-icon">{ensemble.icon}</span>
            </div>
            <div className="ensemble-info">
              <h4 className="ensemble-name">{ensemble.name}</h4>
              <p className="ensemble-desc">{ensemble.description}</p>
              <div className="ensemble-status-badge">
                {ensemble.isAnomaly ? (
                  <><FaExclamationTriangle className="status-icon" /> ANOMALY</>
                ) : (
                  <><FaCheckCircle className="status-icon" /> NORMAL</>
                )}
              </div>
            </div>
            <div className="ensemble-score-indicator">
              <div className="score-label">Confidence</div>
              <div className="score-bar-bg">
                <div 
                  className="score-bar-fill" 
                  style={{ width: `${Math.min(100, ensemble.score * 100)}%` }}
                ></div>
              </div>
              <div className="score-value">{(ensemble.score * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnsembleResults;
