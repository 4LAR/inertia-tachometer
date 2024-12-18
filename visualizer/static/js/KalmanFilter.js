class KalmanFilter {
  constructor(processNoise, measurementNoise, estimatedError, initialValue) {
    this.Q = processNoise;       // Шум процесса
    this.R = measurementNoise;   // Шум измерений
    this.P = estimatedError;     // Оценочная ошибка
    this.X = initialValue;       // Начальная оценка
  }

  update(measurement) {
    // Шаг 1: Прогнозируем
    this.P = this.P + this.Q;
    // Шаг 2: Вычисляем "Калмановский коэффициент"
    const K = this.P / (this.P + this.R);
    // Шаг 3: Обновляем оценку с учетом измерения
    this.X = this.X + K * (measurement - this.X);
    // Шаг 4: Обновляем ошибку
    this.P = (1 - K) * this.P;
    return this.X;
  }
}

let useKalmanFilter = false;
let kalmanFilterGyroX = new KalmanFilter(0.1, 0.1, 1, 0);
let kalmanFilterGyroY = new KalmanFilter(0.1, 0.1, 1, 0);
let kalmanFilterGyroZ = new KalmanFilter(0.1, 0.1, 1, 0);
let kalmanFilterAccelX = new KalmanFilter(0.1, 0.1, 1, 0);
let kalmanFilterAccelY = new KalmanFilter(0.1, 0.1, 1, 0);
let kalmanFilterAccelZ = new KalmanFilter(0.1, 0.1, 1, 0);

document.getElementById('kalman_filter').addEventListener('change', function() {
  useKalmanFilter = this.checked;
});

function updateKalmanFilters() {
  const processNoise = parseFloat(document.getElementById('process_noise').value);
  const measurementNoise = parseFloat(document.getElementById('measurement_noise').value);
  const estimatedError = parseFloat(document.getElementById('estimated_error').value);
  const initialValue = parseFloat(document.getElementById('initial_value').value);

  kalmanFilterGyroX = new KalmanFilter(processNoise, measurementNoise, estimatedError, initialValue);
  kalmanFilterGyroY = new KalmanFilter(processNoise, measurementNoise, estimatedError, initialValue);
  kalmanFilterGyroZ = new KalmanFilter(processNoise, measurementNoise, estimatedError, initialValue);
  kalmanFilterAccelX = new KalmanFilter(processNoise, measurementNoise, estimatedError, initialValue);
  kalmanFilterAccelY = new KalmanFilter(processNoise, measurementNoise, estimatedError, initialValue);
  kalmanFilterAccelZ = new KalmanFilter(processNoise, measurementNoise, estimatedError, initialValue);
}

document.getElementById('process_noise').addEventListener('change', updateKalmanFilters);
document.getElementById('measurement_noise').addEventListener('change', updateKalmanFilters);
document.getElementById('estimated_error').addEventListener('change', updateKalmanFilters);
document.getElementById('initial_value').addEventListener('change', updateKalmanFilters);
