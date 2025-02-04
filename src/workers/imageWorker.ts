self.onmessage = async (event) => {
  try {
    const { arrayBuffer, heightPercent, dragPosition } = event.data;
    const blob = new Blob([arrayBuffer], { type: "image/png" });

    // Попытка создать ImageBitmap
    const imageBitmap = await createImageBitmap(blob);

    // Проверка на нулевые размеры
    if (imageBitmap.width === 0 || imageBitmap.height === 0) {
      console.error("❌ Изображение имеет нулевые размеры, прерываем обработку");
      return;
    }

    // Дальше ваша логика
    const scale = heightPercent / 100;
    const newWidth = Math.round(imageBitmap.width * scale);
    const newHeight = Math.round(imageBitmap.height * scale);

    // Дополнительно можно проверить, что итоговые размеры не 0
    if (newWidth === 0 || newHeight === 0) {
      console.error("❌ Масштабирование дало нулевой размер, прерываем обработку");
      return;
    }

    const canvas = new OffscreenCanvas(newWidth, newHeight);
    const context = canvas.getContext("2d");
    if (!context) {
      console.error("❌ Ошибка: контекст OffscreenCanvas не найден");
      return;
    }

    // Рисуем (учитываем смещение dragPosition)
    context.drawImage(imageBitmap, dragPosition.x, dragPosition.y, newWidth, newHeight);

    // Преобразуем в Blob
    const newBlob = await canvas.convertToBlob({ type: "image/png", quality: 1 });
    if (newBlob) {
      self.postMessage(newBlob);
    } else {
      console.error("❌ Ошибка: convertToBlob() вернул null");
    }
  } catch (error) {
    console.error("Ошибка в Web Worker:", error);
  }
};
