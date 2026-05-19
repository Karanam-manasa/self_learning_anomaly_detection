import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaDownload, FaLightbulb, FaWrench } from "react-icons/fa";

const AnomalyReason = ({ result }) => {
  const downloadPDF = async () => {
    const input = document.querySelector(".full-report");
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save("Complete_Anomaly_Report.pdf");
  };

  return (
    <div className="card explanation-card">
      {result.anomaly && result.explanation ? (
        <>
            <div>
            <h4>
              <span className="icon"><FaLightbulb /></span>
              Reason
            </h4>
            <p><strong>{result.explanation.reason}</strong></p>
            {result.explanation.details && result.explanation.details.length > 0 && (
              <ul>
                {result.explanation.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h4>
              <span className="icon"><FaWrench /></span>
              Suggested Actions
            </h4>
            <ul>
              {result.explanation.suggested_actions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        
        <p>
          {result.explanation
            ? result.explanation.reason
            : "System operating within normal learned patterns."}
        </p>
      )}
      <button className="download-btn" onClick={downloadPDF}>
        <FaDownload size={14} style={{ marginRight: 8 }} />
        Download Report (PDF)
      </button>
    </div>
  );
};

export default AnomalyReason;