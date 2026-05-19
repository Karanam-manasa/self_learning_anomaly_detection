import { useEffect, useMemo, useRef, useState } from "react";
import { uploadCsv, API_URL } from "../services/api";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { FaPlay, FaPause, FaExclamationTriangle, FaArrowLeft, FaArrowRight, FaShieldAlt, FaExpand, FaCompress } from "react-icons/fa";
import "../styles/real-time-processing.css";


const CustomizedDot = (props) => {
  const { cx, cy, stroke, payload } = props;
  if (payload.isAnomaly) {
    return (
      <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="red" viewBox="0 0 1024 1024">
        <path d="M512 0C229.25 0 0 229.25 0 512s229.25 512 512 512 512-229.25 512-512S794.75 0 512 0zM512 928c-229.75 0-416-186.25-416-416S282.25 96 512 96s416 186.25 416 416-186.25 416-416 416zM480 256h64v384h-64V256zM480 704h64v64h-64V704z" />
      </svg>
    );
  }
  return null;
};
const RealTimeProcessing = ({ setMode }) => {
  const [file, setFile] = useState(null);
  const [job, setJob] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const [records, setRecords] = useState([]);
  const [latest, setLatest] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const esRef = useRef(null);
  const anomalyStatusRef = useRef(false);
  const timesRef = useRef([]);
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  useEffect(() => {
    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, []);

  const start = async () => {
    if (!file) {
      alert("Pick a CSV file first");
      return;
    }
    try {
      const res = await uploadCsv(file);
      setJob(res);
      setErrorMsg("");
      const es = new EventSource(`${API_URL}/realtime/${res.job_id}`);
      es.onmessage = (evt) => {
        try {
          const item = JSON.parse(evt.data);
          if (item.anomaly && !latest?.anomaly) {
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
          }
          setLatest(item);
          setRecords((prev) => {
            const updated = [item, ...prev].slice(0, 200);
            try {
              localStorage.setItem("realtimeHistory", JSON.stringify(updated));
            } catch {}
            return updated;
          });
          timesRef.current = [...timesRef.current, Date.now()].slice(-200);
        } catch {}
      };
      es.addEventListener("done", () => {
        setStreaming(false);
        es.close();
      });
      es.onerror = () => {
        setErrorMsg("Streaming connection closed or failed");
        setStreaming(false);
        es.close();
      };
      esRef.current = es;
      setStreaming(true);
    } catch (e) {
      setErrorMsg(e?.message || "Upload or stream error");
    }
  };

  const stop = () => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    setStreaming(false);
  };

  const anomaliesCount = useMemo(
    () => records.reduce((acc, r) => acc + (r?.anomaly ? 1 : 0), 0),
    [records]
  );

  const speed = useMemo(() => {
    const t = timesRef.current;
    if (t.length < 2) return 0;
    const windowMs = 5000;
    const now = Date.now();
    const recent = t.filter((x) => now - x <= windowMs);
    const elapsed = Math.max((Math.min(windowMs, now - (recent[0] || now))) / 1000, 1);
    return +(recent.length / elapsed).toFixed(1);
  }, [records]);

  const chartData = useMemo(() => {
    const arr = records.slice(0, 100).reverse();
    return arr.map((r, i) => ({
      i,
      score: Number(r.ensemble_score || 0),
      thr: Number(r.threshold || 0),
      isAnomaly: r.anomaly,
    }));
  }, [records]);

  const statusBadge = latest?.anomaly ? "danger" : "safe";

  const handleDownloadReport = () => {
    if (records.length === 0) return;

    const headers = [
      "Time",
      "Machine ID",
      "Temperature",
      "Vibration",
      "Humidity",
      "Pressure",
      "Energy",
      "Ensemble Score",
      "Threshold",
      "Status"
    ];

    const rows = records.map((r) => [
  new Date((r.timestamp || Date.now()) * 1000).toLocaleTimeString(),
  r.machine_id,
  r.features?.temperature,
  r.features?.vibration,
  r.features?.humidity,
  r.features?.pressure,
  r.features?.energy_consumption,
  r.ensemble_score,
  r.threshold,
  r.anomaly ? "Anomaly" : "Normal"
]);

    const csvContent = [headers, ...rows]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `realtime_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="real-time-container card">
      <div className="rt-header">
        <div className="rt-nav">
          <h2 className="rt-title">Self-Adaptive IoT Anomaly Detection Dashboard</h2>
        </div>
        <div className="rt-live">
          <button 
            className="download-btn" 
            onClick={handleDownloadReport} 
            disabled={records.length === 0}
          >
            Download Report
          </button>
          <span className={`live-dot ${streaming ? "on" : "off"}`}></span>
          <span>{streaming ? "LIVE STREAMING" : "DISCONNECTED"}</span>
        </div>
      </div>

      {errorMsg ? (
        <div className="alert-banner" style={{ marginBottom: 10 }}>
          {errorMsg}
        </div>
      ) : null}

      <div className="file-banner">
        <input
          type="file"
          id="csv-upload-realtime"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ display: "none" }}
          disabled={streaming}
        />
        <label htmlFor="csv-upload-realtime" className="upload-button">
          Choose File
        </label>
        <div className="file-name">
          {file ? file.name : "No file chosen"}
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Current Score</div>
          <div className="kpi-value">{latest ? Number(latest.ensemble_score).toFixed(2) : "--"}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Current Threshold</div>
          <div className="kpi-value">{latest ? Number(latest.threshold).toFixed(2) : "--"}</div>
        </div>
        <div className={`kpi-card ${statusBadge}`}>
          <div className="kpi-title">Current Status</div>
          <div className="kpi-value">
            {latest ? (
              latest.anomaly ? (
                <><FaExclamationTriangle /> ANOMALY DETECTED!</>
              ) : (
                <><FaShieldAlt /> NORMAL</>
              )
            ) : (
              "--"
            )}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Total Records</div>
          <div className="kpi-value">{records.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Total Anomalies</div>
          <div className="kpi-value">{anomaliesCount}</div>
        </div>
      </div>

      <div className={`rt-main ${isChartExpanded ? "expanded" : ""}`}>
        <div className="rt-chart">
          <div className="rt-chart-header">
            <div className="rt-chart-title">Anomaly Score vs Threshold (Real-Time)</div>
            
              <div className="rt-chart-controls">
              <button onClick={() => setIsChartExpanded(!isChartExpanded)} className="expand-btn">
                {isChartExpanded ? <FaCompress /> : <FaExpand />}
              </button>
              <button onClick={streaming ? stop : start} className="pause-btn">
                {streaming ? <FaPause /> : <FaPlay />} {streaming ? "Pause" : "Start"}
              </button>
            </div>
            
          </div>
          <div className="rt-chart-wrap">
            {showAlert && (
              <div className="anomaly-overlay">
                <FaExclamationTriangle /> Anomaly Detected!
              </div>
            )}
            <ResponsiveContainer width="100%" height={isChartExpanded ? 600 : 280}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1f2937" />
                <XAxis dataKey="i" stroke="#93c5fd" />
                <YAxis stroke="#93c5fd" domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" name="Anomaly Score" stroke="#f59e0b" dot={<CustomizedDot />} strokeWidth={2} />
                <Line type="monotone" dataKey="thr" name="Adaptive Threshold" stroke="#60a5fa" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {!isChartExpanded && (
          <div className="rt-side">
            <div className="side-card">
              <div className="side-title">Risk Level</div>
              <div className="risk-bar">
                <div
                  className="risk-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, latest ? (latest.ensemble_score / (latest.threshold || 1)) * 50 : 0))}%`,
                    background: latest && latest.anomaly ? "linear-gradient(90deg, #ef4444, #f59e0b)" : "linear-gradient(90deg, #22c55e, #60a5fa)",
                  }}
                />
              </div>
              <div className="risk-labels">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
            <div className="side-card">
              <div className="side-title">Live Data Stream</div>
              <div className="mini-stats">
                <div className="mini-row"><span>Time</span><span>{records.length}</span></div>
                <div className="mini-row"><span>Anomalies</span><span>{anomaliesCount}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="live-data-stream">
        <div className="stream-header">
          <h4>Live Data Stream</h4>
          <div className="stream-speed">Speed: {speed} record / sec</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Machine ID</th>
                <th>Temp</th>
                <th>Vib</th>
                <th>Hum</th>
                <th>Pressure</th>
                <th>Energy</th>
                <th>Anomaly Score</th>
                <th>Threshold</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="8">No records streamed yet</td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={`${r.index}-${i}`}>
                    <td>{new Date((r.timestamp || Date.now()) * 1000).toLocaleTimeString()}</td>
                    <td>{r.machine_id}</td>
                    <td>{Number(r.features?.temperature).toFixed(2)}</td>
                    <td>{Number(r.features?.vibration).toFixed(2)}</td>
                    <td>{Number(r.features?.humidity).toFixed(2)}</td>
                    <td>{Number(r.features?.pressure).toFixed(2)}</td>
                    <td>{Number(r.features?.energy_consumption).toFixed(2)}</td>
                    <td>{Number(r.ensemble_score).toFixed(3)}</td>
                    <td>{Number(r.threshold).toFixed(3)}</td>
                    <td>
                      <span className={`status-badge ${r.anomaly ? "danger" : "safe"}`}>
                        {r.anomaly ? <FaExclamationTriangle /> : <FaShieldAlt />} {r.anomaly ? "Anomaly" : "Normal"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="stream-footer">
          <button onClick={streaming ? stop : start} className="pause-btn-bottom">
            {streaming ? <FaPause /> : <FaPlay />} {streaming ? "Pause" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeProcessing;
