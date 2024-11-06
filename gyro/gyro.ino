#include <Wire.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const int MPU_addr = 0x68;  // I2C адрес модуля MPU-6050

const char* ssid = "TEST_GYRO";
const char* password = "40404040";

ESP8266WebServer server(80);



void setup() {
  Serial.begin(115200);
  Wire.begin();

  // Инициализация MPU-6050
  Wire.beginTransmission(MPU_addr);
  Wire.write(0x6B);  // PWR_MGMT_1 register
  Wire.write(0);     // "пробуждаем" модуль MPU-6050
  Wire.endTransmission(true);
  Serial.println("Wrote to IMU");

  // Настройка точки доступа
  WiFi.softAP(ssid, password);
  Serial.println("Точка доступа создана");
  Serial.print("IP адрес: ");
  Serial.println(WiFi.softAPIP()); // Вывод IP адреса точки доступа

  server.on("/", indexPage);
  server.on("/mpu_get", mpu_get);

  server.begin(); // Запуск сервера
  Serial.println("Сервер запущен");
}

void loop() {
  // mpu_read(); // Чтение данных с MPU-6050
  server.handleClient();

  // WiFiClient client = server.available();
  // if (client) {
  //   Serial.println("Новый клиент");
  //   String currentLine = ""; // Сохраняем поступающие данные в строке
  //   while (client.connected()) {
  //     if (client.available()) { // Если от клиента поступают данные
  //       char c = client.read(); // Считываем байт
  //       if (c == '\n') { // Проверяем на символ перевода строки
  //         if (currentLine.length() == 0) { // Конец HTTP запроса
  //           // Отправка HTML-страницы с данными
  //           client.print("<html><title>ESP32 WebServer</title></html>");
  //           client.print("<body bgcolor=\"#E6E6FA\"><h1 style=\"text-align: center; color: blue\">ESP32 WebServer</h1>");
  //           client.print("<p style=\"text-align: left; color: red; font-size:150%\">Accelerometer Values:</p>");
  //           client.print("<p style=\"text-align: left; font-size:150%\">AcX: ");
  //            client.print(AcX);
  //           client.print("<br/>AcY: ");
  //           client.print(AcY);
  //           client.print("<br/>AcZ: ");
  //           client.print(AcZ);
  //           client.print("</p><p style=\"text-align: left; color: red; font-size:150%\">Gyroscope Values:</p>");
  //           client.print("<p style=\"text-align: left; font-size:150%\">GyX: ");
  //           client.print(GyX);
  //           client.print("<br/>GyY: ");
  //           client.print(GyY);
  //           client.print("<br/>GyZ: ");
  //           client.print(GyZ);
  //           client.print("</p></body>");
  //           break; // Выход из цикла
  //         } else {
  //           currentLine = ""; // Очистка текущей строки
  //         }
  //       } else if (c != '\r') {
  //         currentLine += c; // Добавляем символ в текущую строку
  //       }
  //     }
  //   }
  //   client.stop(); // Закрываем соединение с клиентом
  //   Serial.println("Клиент отключен");
  // }
}



