import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Загрузка данных из CSV-файла
file_path = 'data_10k.csv'  # Замените на путь к вашему файлу
df = pd.read_csv(file_path)

# Список осей гироскопа
gyro_axes = ['gyroX', 'gyroY', 'gyroZ']

# Создание подграфиков для каждой оси
plt.figure(figsize=(15, 10))

for i, axis in enumerate(gyro_axes):
    gyro_data = df[axis]

    # Разделение данных на 50 частей и вычисление среднего
    arr_splited = np.array_split(gyro_data, 50)
    arr_splited_mean = np.array([np.mean(el) for el in arr_splited])

    # Создание подграфика
    plt.subplot(len(gyro_axes), 1, i + 1)
    plt.plot(arr_splited_mean, marker='o', linestyle='-', color='b', label='Mean Values')
    plt.title(f'{axis}')
    plt.xlabel('Segment')
    plt.ylabel('Mean Value')
    plt.xticks(np.arange(len(arr_splited_mean)), [f'{j+1}' for j in range(len(arr_splited_mean))])

    # Добавление гистограммы на отдельную ось
    ax_hist = plt.twinx()

    # Определение границ для гистограммы
    # bin_edges = np.linspace(gyro_data.min(), gyro_data.max(), 51)  # 50 бинов
    # ax_hist.hist(gyro_data, bins=bin_edges, alpha=0.3, color='gray', density=True, label='Histogram')
    # ax_hist.set_ylabel('Density')

    # Легенда
    # plt.legend(loc='upper right')

plt.tight_layout()  # Автоматическая настройка отступов
plt.show()
