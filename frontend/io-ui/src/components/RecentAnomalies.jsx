import { FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import "../styles/live-sensor.css";

const RecentAnomalies = ({ history }) => {
  return (
    <div className="card history-card">
      <h3>Recent Anomalies</h3>

      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Machine ID</th>
            <th>Autoencoder</th>
            <th>Isolation Forest</th>
            <th>Threshold</th>
            <th>Ensemble Score</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {history && history.length > 0 ? (
            history.slice(0, 8).map((item, index) => {
              const isAnomaly = !!item.anomaly;
              return (
                <tr key={index}>
                  <td>{item.timestamp}</td>
                  <td>{item.machine_id}</td>
                   <td>{Number(item.autoencoder_error)?.toFixed(4)}</td>
                  <td>{Number(item.isolation_forest_score)?.toFixed(4)}</td>
                  <td>{Number(item.threshold)?.toFixed(2)}</td>
                  <td>{Number(item.ensemble_score)?.toFixed(2)}</td>
                  <td>
                    <span
                      className={`status-badge ${isAnomaly ? "danger" : "safe"}`}
                    >
                      {isAnomaly ? <FaExclamationTriangle /> : <FaShieldAlt />} {isAnomaly ? "Anomaly" : "Normal"}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7">No recent anomalies</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecentAnomalies;