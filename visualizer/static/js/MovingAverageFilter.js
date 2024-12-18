class MovingAverageFilter {
  constructor(size) {
    this.size = size; // Размер окна
    this.values = []; // Массив для хранения значений
  }

  update(value) {
    value = parseFloat(value);
    if (!isNaN(value))
      this.values.push(value); // Добавляем новое значение в массив
    if (this.values.length > this.size) {
      this.values.shift(); // Удаляем старое значение, если превышен размер окна
    }
    console.log(this.values);
    const sum = this.values.reduce((a, b) => a + b, 0); // Суммируем значения в окне
    console.log(sum);
    return sum / this.values.length; // Возвращаем среднее значение
  }
}

let useMovingAverageFilter = false;

document.getElementById('MovingAverageFilter').addEventListener('change', function() {
  useMovingAverageFilter = this.checked;
});

let gyroFilterX = new MovingAverageFilter(5);
let gyroFilterY = new MovingAverageFilter(5);
let gyroFilterZ = new MovingAverageFilter(5);
let accelFilterX = new MovingAverageFilter(5);
let accelFilterY = new MovingAverageFilter(5);
let accelFilterZ = new MovingAverageFilter(5);

document.getElementById('MovingAverageFilter_size').addEventListener('change', function() {
  movingAverageFilterSize = parseInt(this.value);
  gyroFilterX = new MovingAverageFilter(movingAverageFilterSize);
  gyroFilterY = new MovingAverageFilter(movingAverageFilterSize);
  gyroFilterZ = new MovingAverageFilter(movingAverageFilterSize);
  accelFilterX = new MovingAverageFilter(movingAverageFilterSize);
  accelFilterY = new MovingAverageFilter(movingAverageFilterSize);
  accelFilterZ = new MovingAverageFilter(movingAverageFilterSize);
});
