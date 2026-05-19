import { useState, useEffect, useMemo } from "react";
import SensorForm from "../components/SensorForm";
import ResultSection from "../components/ResultSection";
import RecentAnomalies from "../components/RecentAnomalies";
import { analyzeCsv } from "../services/api";
import CsvUpload from "../components/CsvUpload";
import RealTimeProcessing from "../components/RealTimeProcessing";
import ScoreDistributionChart from "../components/ScoreDistributionChart";
import ModelContribution from "../components/ModelContribution";
import SystemHealth from "../components/SystemHealth";
import { FaDatabase, FaExclamationTriangle, FaCheckCircle, FaBullseye, FaShieldAlt } from "react-icons/fa";
import "../styles/dashboard.css";
import "../styles/csv-analysis.css";
import "../styles/live-sensor.css";
import "../styles/real-time-processing.css";

const Dashboard = () => {
  const [mode, setMode] = useState("live");
  // State for Live Mode
  const [liveResult, setLiveResult] = useState(null);
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("anomalyHistory")) || [];
  });

  const [file, setFile] = useState(null);
  const [csvResult, setCsvResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvContent, setCsvContent] = useState(""); // New state for CSV content
  const [showCsvPreview, setShowCsvPreview] = useState(false); // New state to control CSV preview visibility
  
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState("All");
  // useEffect(() => {
  //   localStorage.removeItem("anomalyHistory");
  //   setHistory([]);
  // }, []);
  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a CSV file.");
    setLoading(true);
    setCsvResult(null);
    setCurrentPage(1);
    setStatusFilter("All");
    try {
      const data = await analyzeCsv(file);
      setCsvResult(data);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze the CSV file.");
    }
    setLoading(false);
  };
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const resultsWithStatusAndIndex = useMemo(() => {
    if (!csvResult || typeof csvResult.summary?.threshold === 'undefined') {
      return [];
    }
    const { threshold } = csvResult.summary;
    return csvResult.results.map((row, index) => ({
      ...row,
      originalIndex: index,
      isAnomaly: row.ensemble_score >= threshold,
    }));
  }, [csvResult]);
  const filteredResults = useMemo(() => {
    if (statusFilter === "All") {
      // When showing all, we still need to determine anomaly status for rendering
      return resultsWithStatusAndIndex;
    }
    return resultsWithStatusAndIndex.filter((row) => {
      if (statusFilter === "Anomaly") {
        return row.isAnomaly;
      }
      if (statusFilter === "Normal") {
        return !row.isAnomaly;
      }
      return false; // Should not be reached
    });
  }, [resultsWithStatusAndIndex, statusFilter]);
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
     setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvContent(event.target.result);
      };
      reader.readAsText(selectedFile);
      setShowCsvPreview(false);
    }
  };

  const handleDownloadResults = () => {
  if (!csvResult || !csvResult.results) return;

  const headers = [
      "Row",
      "Temperature",
      "Vibration",
      "Humidity",
      "Pressure",
      "Energy",
      "Machine ID",
      "Machine Status",
      "Ensemble Score",
      "Status"
    ];

  const rows = csvResult.results.map((row, index) => {
    const isAnomaly = row.ensemble_score >= csvResult.summary.threshold;

    return [
      index + 1,
      row.temperature,
      row.vibration,
      row.humidity,
      row.pressure,
      row.energy,
      row.machine_id,
      row.machine_status,
      row.ensemble_score,
      isAnomaly ? "Anomaly" : "Normal"
    ];
  });

  const csvContent = [headers, ...rows]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "anomaly_results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
  return (
    <div className="dashboard">

      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${mode === "live" ? "active" : ""}`}
          onClick={() => setMode("live")}
        >
          Sensor Data Simulator
        </div>

        <div
          className={`tab ${mode === "csv" ? "active" : ""}`}
          onClick={() => setMode("csv")}
        >
          CSV File Analysis
        </div>

        <div
          className={`tab ${mode === "realtime" ? "active" : ""}`}
          onClick={() => setMode("realtime")}
        >
          Simulated Sensor Stream
        </div>
      </div>

     

      {mode === "live" && (
        <div className="live-sensor-container full-report">
          <div className="main-grid">

            <SensorForm
              setResult={(res, data) => {
                setLiveResult(res);
                // formData not used; keeping UI minimal

                const newEntry = {
                  timestamp: new Date().toLocaleString(),
                  machine_id: data.machine_id,
                  temperature: data.temperature,
                  vibration: data.vibration,
                  ensemble_score: res.ensemble_score,
                  autoencoder_error: res.autoencoder_error,
                  isolation_forest_score: res.isolation_forest_score,
                  threshold: res.threshold,

                  anomaly: res.anomaly,
                };

                setHistory((prevHistory) => {
                  const updatedHistory = [newEntry, ...prevHistory].slice(0, 10);
                  localStorage.setItem(
                    "anomalyHistory",
                    JSON.stringify(updatedHistory)
                  );
                  return updatedHistory;
                });
              }}
            />

            <div className="card">
               <ResultSection result={liveResult} />
            </div>

          </div>

          <RecentAnomalies history={history} />

        </div>
      )}

      {mode === "csv" && (
        <div className="csv-analysis-container">
          <div className="csv-grid">
            {/* Left Panel: Upload */}
            <div className="card upload-panel">
              <h3>Upload IoT Dataset</h3>
              <p className="upload-description">
                Upload a CSV file containing multivariate sensor data for
                anomaly detection.
              </p>
              <div className="upload-box">
                <div className="uploada_icon">
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <p>{file ? file.name : "smart_manufacturing_data.csv"}</p>
                <input
                  type="file"
                  id="csv-upload"
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="csv-upload" className="upload-button">
                  Choose File
                </label>
              </div>
              <button onClick={handleAnalyze} disabled={loading || !file}>
                {loading ? "Analyzing..." : "Analyze Dataset"}
              </button>
              {file && ( // Only show "View CSV Content" button if a file is selected
                <button
                  onClick={() => setShowCsvPreview(!showCsvPreview)}
                  className="view-csv-button"
                >
                  {showCsvPreview ? "Hide CSV Content" : "View CSV Content"}
                </button>
               )}
             </div>
             {csvContent && showCsvPreview && (
               <div className="card csv-preview-card">
                 <h3>CSV Content Preview</h3>
                 <pre className="csv-preview">{csvContent}</pre>
               </div>
             )}
            {/* Right Panel: Analysis Results */}
            <div className="results-panel">
              {loading && (
                <div className="card">
                  <p>Analyzing, please wait...</p>
                </div>
              )}
              {csvResult && (
                <>
                 
                  <div className="stats-row">
                    <div className="card stat">
                       <h4><FaDatabase className="icon fa-database" /> Records Processed</h4>
                      <p>{csvResult.total_records}</p>
                    </div>
                    <div className="card stat anomaly">
                      <h4><FaExclamationTriangle className="icon" /> Anomalies Detected</h4>
                      <p>
                        {csvResult.anomalies} [
                        {(
                          (csvResult.anomalies / csvResult.total_records) *
                          100
                        ).toFixed(1)}
                        %]
                      </p>
                    </div>
                    <div className="card stat">
                      <h4><FaCheckCircle className="icon fa-check-circle" /> Normal Records</h4>
                      <p>{csvResult.normal}</p>
                    </div>
                    <div className="card stat">
                      <h4><FaBullseye className="icon fa-bullseye" /> Detection Accuracy</h4>
                      <p>{csvResult.accuracy}%</p>
                    </div>
                  </div>
                  <div className="card charts-card">
                    <h3>Anomaly Score Distribution</h3>
                    <ScoreDistributionChart
                      results={csvResult.results}
                      threshold={csvResult.summary?.threshold}
                    />
                    <div className="download-button-container">
                     <button onClick={handleDownloadResults}>
  Download Results (CSV)
</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Bottom Panel: Results Table */}
          {csvResult && (
            <div className="card table-panel">
              <div className="table-header">
                <h3>Anomaly Detection Results</h3>
                <select
                  className="table-filter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="All">All Status</option>
                  <option value="Normal">Normal</option>
                  <option value="Anomaly">Anomaly</option>
                </select>
              </div>
              <table className="results-table">
                <thead>
                  <tr>
                  <th>Row #</th>
                  <th>Temperature (°C)</th>
                  <th>Vibration</th>
                  <th>Humidity</th>
                  <th>Pressure</th>
                  <th>Energy</th>
                  <th>Machine ID</th>
                  <th>Machine Status</th>
                  <th>Ensemble Score</th>
                  <th>Status</th>
                  </tr>
                  </thead>
                <tbody>
              {filteredResults
              .slice(
              (currentPage - 1) * recordsPerPage,
              currentPage * recordsPerPage
              )
              .map((row) => {
              return (
              <tr key={row.originalIndex}>
              <td># {row.originalIndex + 1}</td>

              <td>{row.temperature?.toFixed(2)}</td>
              <td>{row.vibration?.toFixed(4)}</td>
              <td>{row.humidity?.toFixed(2)}</td>
              <td>{row.pressure?.toFixed(2)}</td>
              <td>{row.energy?.toFixed(2)}</td>

              <td>{row.machine_id}</td>
              <td>{row.machine_status || "Running"}</td>

              <td>{row.ensemble_score?.toFixed(2)}</td>

              <td>
              <span
              className={`status ${row.isAnomaly ? "anomaly" : "normal"}`}
              >
              {row.isAnomaly ? <FaExclamationTriangle /> : <FaShieldAlt />}
              {row.isAnomaly ? " Anomaly" : " Normal"}
              </span>
              </td>

              </tr>
              );
              })}
              </tbody>
              </table>
              {csvResult && filteredResults.length > 0 && (
                <div className="pagination">
                  
                  <button
                    className="pagination-button"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of{" "}
                    {Math.ceil(filteredResults.length / recordsPerPage) || 1}
                  </span>
                  <button
                    className="pagination-button"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={
                      currentPage * recordsPerPage >= filteredResults.length
                    }
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {mode === "realtime" && (
        <div className="real-time-container csv-page">
          <div className="csv-grid">
            <div>
              <RealTimeProcessing setMode={setMode} />
            </div>
            <div className="right-col">
              {/* Reserved for future charts/controls */}
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};


export default Dashboard;