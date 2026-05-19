// import { useState } from "react";
// import { analyzeCsv } from "../services/api";
// import ModelContribution from "../components/ModelContribution";
// import SystemHealth from "../components/SystemHealth";
// import "../styles/upload-csv.css";

// const UploadCsv = () => {
//   const [file, setFile] = useState(null);
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleAnalyze = async () => {
//     if (!file) return alert("Please upload CSV file");

//     setLoading(true);
//     const data = await analyzeCsv(file);
//     setResult(data);
//     setLoading(false);
//   };

//   return (
//     <div className="csv-page">

//       {/* Upload Card */}
//       <div className="card">
//         <h3>CSV Anomaly Analysis</h3>

//         <input
//           type="file"
//           accept=".csv"
//           onChange={(e) => setFile(e.target.files[0])}
//         />

//         <button onClick={handleAnalyze}>
//           {loading ? "Analyzing..." : "Run CSV Analysis"}
//         </button>
//       </div>

//       {/* SHOW RESULTS AFTER ANALYSIS */}
//       {result && (
//         <>
//           {/* Stats Row */}
//           <div className="stats-row">
//             <div className="card stat">
//               <h4>Records Processed</h4>
//               <p>{result.total_records}</p>
//             </div>

//             <div className="card stat">
//               <h4>Anomalies</h4>
//               <p>{result.anomalies}</p>
//             </div>

//             <div className="card stat">
//               <h4>Normal</h4>
//               <p>{result.normal}</p>
//             </div>

//             <div className="card stat">
//               <h4>Accuracy</h4>
//               <p>{result.accuracy}%</p>
//             </div>
//           </div>

//           {/* Charts */}
//           <div className="main-grid">
//             <ModelContribution result={result.summary} />
//             <SystemHealth result={result.summary} />
//           </div>

//           {/* Results Table */}
//           <div className="card">
//             <h3>Anomaly Detection Results</h3>

//             <table className="results-table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Temperature</th>
//                   <th>Vibration</th>
//                   <th>Score</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {result.results.slice(0, 50).map((row, i) => (
//                   <tr key={i}>
//                     <td>{i + 1}</td>
//                     <td>{row.temperature}</td>
//                     <td>{row.vibration}</td>
//                     <td>{row.ensemble_score.toFixed(2)}</td>
//                     <td className={row.anomaly ? "bad" : "good"}>
//                       {row.anomaly ? "Anomaly" : "Normal"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <button style={{ marginTop: "15px" }}>
//               Download Results (CSV)
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default UploadCsv;