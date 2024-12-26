
var save_data_process_flag = false;
function save_data_process(data) {
  console.log(data);
  var csvRows = [];
  csvRows.push(Object.keys(data[0]).join(','));
  for (const el of data) {
    csvRows.push(Object.values(el).join(','))
  }

  save_data_process_flag = false;

  ipcRenderer.send('save-dialog', {
    name: "data.csv",
    title: "Save csv data",
    data: csvRows.join('\n')
  });
}

function start_save_data() {
  collecting = true;
  save_data_process_flag = true;
}
