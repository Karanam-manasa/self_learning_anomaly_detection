

# Self Learning Anomaly Detection for IoT Sensors
It focuses on detecting anomalies in IoT sensor data using Machine Learning and Deep Learning techniques. The system continuously monitors sensor readings, identifies abnormal behavior in real time, and visualizes the results through an interactive web dashboard.

Traditional cloud-based anomaly detection systems suffer from latency, bandwidth usage, and delayed response. To overcome these limitations,it implements lightweight self-learning models such as Autoencoder and Isolation Forest for efficient anomaly detection in IoT environments.


## 🚀 Features
- Real-time IoT sensor monitoring
- Anomaly detection using Machine Learning
- Autoencoder-based anomaly prediction
- Isolation Forest-based anomaly detection
- Self-learning adaptive system
- Interactive React dashboard
- CSV dataset upload and analysis
- Real-time visualization of anomalies
- Detection logs and detailed reports


## 🛠️ Technologies Used
### Frontend
- React.js
- HTML
- CSS
- JavaScript

### Backend
- Python
- Flask

### Machine Learning Libraries
- Scikit-learn
- TensorFlow / Keras
- Pandas
- NumPy
- Matplotlib


## 🧠 Machine Learning Models Used
### 1. Isolation Forest
- Detects anomalies using tree isolation methods
- Works well for unsupervised anomaly detection
- Efficient for large IoT datasets

### 2. Autoencoder
- Learns normal sensor behavior
- Uses reconstruction error to identify anomalies
- Suitable for complex sensor patterns

### 3. Hybrid Fusion Model
- Combines Isolation Forest and Autoencoder scores
- Improves anomaly detection accuracy
- Reduces false alarms


## 📂 Project Modules
### 1. IoT Sensor Data Acquisition
Collects real-time data from:
- Temperature reading
- Pressure
- Energy Consumption
- Humidity
- Vibration

### 2. Preprocessing Module
- Removes missing values
- Cleans noisy data
- Performs normalization and feature extraction

### 3. Model Training Module
- Trains anomaly detection models
- Evaluates performance using metrics

### 4. Self-Learning Module
- Continuously adapts to new normal patterns
- Updates anomaly thresholds dynamically

### 5. Deployment Module
- Integrates trained models with web interface
- Provides real-time monitoring and visualization

## 📊 Methodology

1. Dataset Collection  
2. Data Preprocessing  
3. Feature Extraction  
4. Model Training  
5. Model Evaluation  
6. Deployment  
7. Self-Learning Updates  

## 📷 Dashboard Functionalities

- Live Sensor Configuration Panel
- Real-Time Sensor Monitoring
- Anomaly Detection Results
- CSV Upload and Preview
- Detection Result Logs
- Detailed Detection Reports


## 📁 Project Structure
<img width="522" height="655" alt="image" src="https://github.com/user-attachments/assets/46aaa7c3-75b0-42b2-b4f1-ad22ed0399dc" />


## ⚙️ Installation and Setup
### 1. Clone the Repository

```bash
git clone https://github.com/Karanam-manasa/self_learning_anomaly_detection.git
```

### 2. Navigate to Project Folder

```bash
cd self_learning_anomaly_detection
```

### 3. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run Backend Server

```bash
cd backend
python -m uvicorn api:app --reload
```

### 5. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📌 Output

The system:
- Continuously monitors IoT sensor data
- Detects anomalies in real time
- Displays anomaly alerts visually
- Maintains logs and reports for analysis

<img width="1891" height="916" alt="image" src="https://github.com/user-attachments/assets/d49b974e-3e95-40ff-b74f-5f4d89d9ac64" />
<img width="1891" height="904" alt="image" src="https://github.com/user-attachments/assets/cda3db94-eb94-4569-8535-4b6bbc5f4191" />
<img width="1465" height="364" alt="image" src="https://github.com/user-attachments/assets/e2bd228d-af93-4385-a1e6-c6c519ec2945" />
<img width="1913" height="906" alt="image" src="https://github.com/user-attachments/assets/49b10c5b-3223-4b55-aa63-308c4e2064b9" />
<img width="1908" height="736" alt="image" src="https://github.com/user-attachments/assets/d8f946b8-5336-405e-92b5-019829158df2" />
<img width="1897" height="892" alt="image" src="https://github.com/user-attachments/assets/422ec95c-aeaa-4df0-96ee-1bdfb1b56cc9" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e3336871-b74b-4080-b29c-a5cb6ec2c459" />


## Demo

[▶️ Demo Video](https://youtu.be/EzPzC7xLOPE)


