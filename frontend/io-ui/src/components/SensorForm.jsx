import { useState } from "react";
import { FaThermometerHalf, FaWater, FaCompressArrowsAlt, FaBolt, FaCogs, FaHashtag } from "react-icons/fa";
import { detectAnomaly } from "../services/api";
import "../styles/live-sensor.css";

const SensorForm = ({ setResult }) => {
  const [formData, setFormData] = useState({
    temperature: 78,
    vibration: 55,
    humidity: 62,
    pressure: 3.2,
    energy_consumption: 2.5,
    machine_status: 1,
    machine_id: 101,
  });

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData({
    ...formData,
    [name]: name === "machine_id" || name === "machine_status"
      ? Number(value)
      : parseFloat(value),
  });
};

  const handleSubmit = async () => {
  try {
    const payload = {
      ...formData,
      machine_status: Number(formData.machine_status),
    };

    console.log("Sending payload to backend:", payload);
    const res = await detectAnomaly(payload);
    console.log("Received response from backend:", res);
    setResult(res, formData);
   } catch (error) {
    console.error("API call failed:", error);
    alert("Backend not running or API error. Check console for details.");
  }
};

    

  return (
    <div className="card sensor-card">
      <h3>Sensor Configuration</h3>

      {/* Temperature */}
      <label className="sensor-label"><span className="sensor-icon temp"><FaThermometerHalf /></span>Temperature: {formData.temperature} °C</label>
      
      <input
      type="range"
      min="0"
      max="500"
      step="0.1"
      name="temperature"
      value={formData.temperature}
      onChange={handleChange}
    />

      {/* Vibration */}
      <label className="sensor-label"><span className="sensor-icon vib"><FaCompressArrowsAlt /></span>Vibration: {formData.vibration}</label>
      <input
        type="range"
        min="0"
        max="300"
        step="0.1"
        name="vibration"
        value={formData.vibration}
        onChange={handleChange}
      />

      {/* Humidity */}
      <label className="sensor-label"><span className="sensor-icon humidity"><FaWater /></span>Humidity: {formData.humidity} %</label>
      <input
        type="range"
        min="0"
        max="300"
        step="0.1"
        name="humidity"
        value={formData.humidity}
        onChange={handleChange}
      />

      {/* Pressure */}
      <label className="sensor-label"><span className="sensor-icon pressure"><FaCompressArrowsAlt /></span>Pressure: {formData.pressure} bar</label>
      <input
        type="range"
        min="0"
        max="30"
        step="0.1"
        name="pressure"
        value={formData.pressure}
        onChange={handleChange}
      />

      {/* Energy */}
      <label className="sensor-label"><span className="sensor-icon energy"><FaBolt /></span>Energy Consumption: {formData.energy_consumption} kWh</label>
      <input
        type="range"
        min="0"
        max="30"
        step="0.1"
        name="energy_consumption"
        value={formData.energy_consumption}
        onChange={handleChange}
      />

      {/* Machine Status */}
      <label className="sensor-label"><span className="sensor-icon status"><FaCogs /></span>Machine Status</label>
        <select
          name="machine_status"
          value={formData.machine_status}
          onChange={handleChange}
        >
          <option value={1}>Normal</option>
          <option value={0}>Alert</option>
        </select>

      {/* Machine ID */}
      <label className="sensor-label"><span className="sensor-icon machine"><FaHashtag /></span>Machine ID</label>
      <input
        type="number"
        name="machine_id"
        value={formData.machine_id}
        onChange={handleChange}
      />

      <button onClick={handleSubmit}>Run Anomaly Detection</button>
    </div>
  );
};

export default SensorForm;