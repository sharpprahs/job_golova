<template>
  <div class="image-editor">
    <div
      class="image-container"
      ref="imageContainer"
      @mousedown="startDragging"
      @mouseup="stopDragging"
      @mouseleave="stopDragging"
      @mousemove="dragImage"
      @touchstart="startTouchDragging"
      @touchmove="touchDragImage"
      @touchend="stopDragging"
    >
      <img ref="image" :src="imageSrc" alt="Editable" draggable="false" />
    </div>

    <div class="controls">
      <!-- Слайдер зума -->
      <input
        type="range"
        v-model="zoomValue"
        :min="zoomMin"
        :max="zoomMax"
        step="1"
        @input="updateZoomFromSlider"
      />

      <button @click="downloadImage">Download Img</button>
      <button @click="triggerFileInput">Upload Img</button>
      <button>Make Selfies</button>
    </div>

    <!-- Скрытый input для загрузки (только JPG/PNG) -->
    <input
      type="file"
      accept="image/jpeg, image/png"
      @change="loadImage"
      style="display: none"
      ref="fileInput"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';

const imageSrc = ref<string | undefined>(undefined);

// Текущее значение зума (в процентах)
const zoomValue = ref(100);

// Диапазон зума, будем вычислять динамически
const zoomMin = ref(10);
const zoomMax = ref(300);

// Логика перетаскивания
const isDragging = ref(false);
const dragOffset = reactive({ x: 0, y: 0 });
const dragStart = reactive({ x: 0, y: 0 });
const isMouseDown = ref(false);

const imageContainer = ref<HTMLDivElement | null>(null);
const image = ref<HTMLImageElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

/**
 * Функция загрузки файла (JPG/PNG).
 */
const loadImage = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  // Проверка типа
  if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
    alert('Можно загружать только JPG или PNG!');
    input.value = ''; // сброс input
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    imageSrc.value = e.target?.result as string;

    // Сбрасываем смещения/зум
    resetImageTransformations();

    // Ждём, пока <img> появится в DOM
    await nextTick();

    if (image.value) {
      // Если <img> уже загружено, событие onload может не сработать
      if (image.value.complete) {
        recalcZoomRange();
        // Однократно ставим ползунок в минимум, чтобы картинка была «почти по высоте»
        zoomValue.value = zoomMin.value;
        updateImageTransform();
      } else {
        // Если не успела загрузиться — ставим в onload
        image.value.onload = () => {
          recalcZoomRange();
          zoomValue.value = zoomMin.value;
          updateImageTransform();
        };
      }
    }
  };
  reader.readAsDataURL(file);
};

/** Клик по кнопке "Upload" — триггерим скрытый input */
const triggerFileInput = () => {
  fileInput.value?.click();
};

/** Сброс (drag + zoomValue) */
const resetImageTransformations = () => {
  dragOffset.x = 0;
  dragOffset.y = 0;
  zoomValue.value = 100;
  updateImageTransform();
};

/**
 * Пересчитываем границы зума (zoomMin/zoomMax),
 * чтобы при min картинка была на 5% меньше контейнера по высоте.
 */
const recalcZoomRange = () => {
  if (!image.value || !imageContainer.value) return;

  const { height: containerHeight } = imageContainer.value.getBoundingClientRect();
  const imgHeight = image.value.naturalHeight;
  if (!imgHeight) return;

  // Масштаб, при котором картинка ровно по высоте контейнера:
  const scaleToFitPercent = (containerHeight / imgHeight) * 100;

  // Пусть картинка при min будет ~ 95% высоты контейнера
  const scaleToFitMargin = scaleToFitPercent * 0.95;

  // Но не меньше 10
  zoomMin.value = Math.max(10, Math.floor(scaleToFitMargin));

  // max = 300% (пример)
  zoomMax.value = 300;

  // Зажимаем текущее значение зума в новые границы, но НЕ устанавливаем
  // zoomValue.value = zoomMin.value здесь, чтобы всё не сбрасывать каждый раз.
  if (zoomValue.value < zoomMin.value) zoomValue.value = zoomMin.value;
  if (zoomValue.value > zoomMax.value) zoomValue.value = zoomMax.value;
};

/** Применение transform (drag + scale) */
const updateImageTransform = () => {
  if (image.value) {
    image.value.style.transform = `
      translate(${dragOffset.x}px, ${dragOffset.y}px)
      scale(${zoomValue.value / 100})
    `;
  }
};

/** Начало перетаскивания (mouse) */
const startDragging = (event: MouseEvent) => {
  isDragging.value = true;
  isMouseDown.value = true;
  dragStart.x = event.clientX - dragOffset.x;
  dragStart.y = event.clientY - dragOffset.y;
};

/** Начало перетаскивания (touch) */
const startTouchDragging = (event: TouchEvent) => {
  isDragging.value = true;
  const touch = event.touches[0];
  dragStart.x = touch.clientX - dragOffset.x;
  dragStart.y = touch.clientY - dragOffset.y;
};

/** Окончание перетаскивания */
const stopDragging = () => {
  isDragging.value = false;
  isMouseDown.value = false;
};

/** Перетаскивание (mouse) */
const dragImage = (event: MouseEvent) => {
  if (isDragging.value && isMouseDown.value) {
    dragOffset.x = event.clientX - dragStart.x;
    dragOffset.y = event.clientY - dragStart.y;
    updateImageTransform();
  }
};

/** Перетаскивание (touch) */
const touchDragImage = (event: TouchEvent) => {
  if (isDragging.value) {
    const touch = event.touches[0];
    dragOffset.x = touch.clientX - dragStart.x;
    dragOffset.y = touch.clientY - dragStart.y;
    updateImageTransform();
  }
};

/** Изменение зума только через слайдер */
const updateZoomFromSlider = () => {
  updateImageTransform();
};

/** Сохранение текущего вида в PNG */
const downloadImage = () => {
  if (!image.value || !imageContainer.value) return;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Размер контейнера
  const { width, height } = imageContainer.value.getBoundingClientRect();
  canvas.width = width;
  canvas.height = height;

  // Текущий масштаб
  const scale = zoomValue.value / 100;

  // Смещение
  const img = image.value;
  const x = (dragOffset.x + width / 2) - (img.naturalWidth * scale) / 2;
  const y = (dragOffset.y + height / 2) - (img.naturalHeight * scale) / 2;

  // Рисуем
  ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);

  // Генерим PNG
  canvas.toBlob((blob) => {
    if (blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'edited-image.png';
      link.click();
    }
  });
};

/** onMounted — ничего лишнего не делаем, колесо мыши для зума отключено. */
onMounted(() => {
  // Если где-то хотите что-то сделать — пожалуйста,
  // но логику колеса мы убрали, так как вы просили.
});
</script>

<style scoped>
.image-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: #eaf6ff;
  padding: 20px;
  border-radius: 10px;
}

/* Контейнер для изображения */
.image-container {
  width: 300px;
  height: 300px;
  overflow: hidden;
  border: 2px solid #ddd;
  border-radius: 10px;
  position: relative;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: grab;
  touch-action: none; /* Отключает жесты браузера, позволяет тач-перетаскивание */
}

.image-container img {
  position: absolute;
  will-change: transform;
  user-select: none;
  pointer-events: none; /* убираем события с картинки, т.к. перетаскиваем контейнер */
}

.image-container img:active {
  cursor: grabbing;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

/* Слайдер */
input[type="range"] {
  width: 200px;
}

/* Кнопки */
button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

button:first-of-type {
  background-color: #28a745;
  color: white;
}

button:nth-of-type(2) {
  background-color: #007bff;
  color: white;
}

button:last-of-type {
  background-color: #6c757d;
  color: white;
}
</style>
