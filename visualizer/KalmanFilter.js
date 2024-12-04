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
