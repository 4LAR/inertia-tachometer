void indexPage() {
    String message = R"rawliteral(
    <!DOCTYPE HTML>
    <html>
    <head>
      <title>GYRO</title>
    </head>
    <body>
      <p id="data"></p>
      <script>
        const update = setInterval(function() {
          fetch('/mpu_get')
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            console.log(data);
            document.getElementById("data").innerHTML = 
              "velocityX: " + data.velocityX + "<br>" +
              "velocityY: " + data.velocityY + "<br>" +
              "positionX: " + data.positionX + "<br>" +
              "positionY: " + data.positionY + "<br>" +
              "<br>" +
              "AcX: " + data.AcX + "<br>" +
              "AcY: " + data.AcY + "<br>" +
              "AcZ: " + data.AcZ + "<br>" +
              "GyX: " + data.GyX + "<br>" +
              "GyY: " + data.GyY + "<br>" +
              "GyZ: " + data.GyZ;
          })
          .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
          });
        }, 100);
      </script>
    </body>
    </html>
    )rawliteral";
    server.send(200, "text/html", message);
}