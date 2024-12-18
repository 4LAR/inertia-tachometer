const { Chart, registerables } = require('chart.js');

Chart.register(...registerables);

let combinedChart;
let gyroXData = [];
let gyroYData = [];
let gyroZData = [];
let accelXData = [];
let accelYData = [];
let accelZData = [];
const maxMeasurementsChart = 100; // Ограничение на количество записей
const updateInterval = 100;

function initChart() {
  const ctx = document.getElementById('combinedChart').getContext('2d');

  combinedChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Gyro X',
          data: gyroXData,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y1'
        },
        {
          label: 'Gyro Y',
          data: gyroYData,
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y1'
        },
        {
          label: 'Gyro Z',
          data: gyroZData,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y1'
        },
        {
          label: 'Accel X',
          data: accelXData,
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y2'
        },
        {
          label: 'Accel Y',
          data: accelYData,
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y2'
        },
        {
          label: 'Accel Z',
          data: accelZData,
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y1: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Gyro'
          }
        },
        y2: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          title: {
            display: true,
            text: 'Accel'
          },
          grid: {
            drawOnChartArea: false // Не рисуем сетку для второго графика
          }
        }
      },
      animation: false // Отключаем анимацию
    }
  });
}

let lastUpdate = 0;
function update_chart(data) {
  const currentTime = performance.now();
  if (currentTime - lastUpdate < updateInterval) return;
  lastUpdate = currentTime;
  const currentTimestamp = performance.now() / 1000; // Время в секундах

  // Добавляем данные в массивы
  gyroXData.push({ x: currentTimestamp, y: data.gyroX });
  gyroYData.push({ x: currentTimestamp, y: data.gyroY });
  gyroZData.push({ x: currentTimestamp, y: data.gyroZ });
  accelXData.push({ x: currentTimestamp, y: data.accelX });
  accelYData.push({ x: currentTimestamp, y: data.accelY });
  accelZData.push({ x: currentTimestamp, y: data.accelZ });

  // Ограничиваем количество точек на графиках
  if (gyroXData.length > maxMeasurementsChart) gyroXData.shift();
  if (gyroYData.length > maxMeasurementsChart) gyroYData.shift();
  if (gyroZData.length > maxMeasurementsChart) gyroZData.shift();
  if (accelXData.length > maxMeasurementsChart) accelXData.shift();
if (accelYData.length > maxMeasurementsChart) accelYData.shift();
if (accelZData.length > maxMeasurementsChart) accelZData.shift();

// Обновляем график
combinedChart.update();
}

function resizeChart() {
  const canvas = document.getElementById('combinedChart');
  const container = document.getElementById('chartsContainer');

  // Устанавливаем ширину и высоту canvas в соответствии с размерами контейнера
  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
}

// Инициализация графика при загрузке страницы
window.onload = function() {
  initChart();
};

window.addEventListener('resize', resizeChart);
