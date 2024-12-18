
let previousGyroX = 0;
let previousGyroY = 0;
let previousGyroZ = 0;
let previousAccelX = 0;
let previousAccelY = 0;
let previousAccelZ = 0;
let lowPassFilter_flag = false;
let lowPassFilter_alpha = 0.1;

function lowPassFilter(currentValue, previousValue, alpha) {
  return alpha * currentValue + (1 - alpha) * previousValue;
}

document.getElementById('lowPassFilter').addEventListener('change', function() {
  lowPassFilter_flag = this.checked;
});

document.getElementById('lowPassFilter_alpha').addEventListener('change', function() {
  lowPassFilter_alpha = this.value;
});
