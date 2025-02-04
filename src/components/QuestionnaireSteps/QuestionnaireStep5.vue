<template>
  <h1>Загрузите фото профиля</h1>
  <p>
    Клиенты чаще выбирают специалистов с фото. Его можно будет поменять в профиле.
  </p>

  <div class="upload-container">
    <!-- photo_container -->
      <!-- Пустая иконка -->
      <div
        ref="downloadFile"
        class="download-file-container"
        @mousemove="handleMouseMove"
        @mouseleave="resetTilt"
        v-if="!photoUrl"
        @click="triggerFileInput"
      >
        <DownloadFile class="wait_photo" />
      </div>
      <div
        v-if="photoUrl"
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
        <img ref="image" :src="photoUrl" alt="Editable" draggable="false" />
      </div>



    <!-- Ползунок для изменения масштаба -->
    <div v-if="photoUrl" class="resize-controls">
      <input
        type="range"
        v-model="zoomValue"
        :min="zoomMin"
        class="styled-range"
        :style="rangeStyle"
        :max="zoomMax"
        step="1"
        @input="updateZoomFromSlider"
      />
      <button class="saved_data_quest" @click="downloadImage">
        <SavedImg />
      </button>
    </div>

    <div class="choice_container">
      <button @click="triggerFileInput">Загрузить фото</button>
      или
      <button @click="openCamera">Сделать селфи</button>
    </div>

    <!-- Скрытый input для загрузки -->
    <input
      type="file"
      class="file-input"
      accept="image/jpeg, image/png"
      ref="fileInput"
      @change="loadImage"
    />

    <!-- Модальное окно камеры -->
    <div v-if="isCameraOpen" class="camera_overlay" @click.self="closeCamera">
      <div class="camera_view">
        <video ref="video" autoplay></video>
        <div class="camera_view_buttons">
          <button @click="capturePhoto" class="make_photo">
            <Make_photo />
          </button>
          <button @click="closeCamera" class="close_camera">
            <CloseItem />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onUnmounted, nextTick, computed } from 'vue'
import '@/assets/css/QuestionnaireSteps/questionnaire_step5.css';

// Ваши компоненты
import DownloadFile from '@/components/icons/downloadFile.vue';
import Make_photo from '@/components/icons/make_photo.vue';
import CloseItem from '@/components/icons/CloseItem.vue';
import SavedImg from '@/components/icons/savedImg.vue';

// =========== Состояния ===========
const fileName = ref<string | null>(null);
const photoUrl = ref<string | undefined>(undefined);
const isCameraOpen = ref(false);
const video = ref<HTMLVideoElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const downloadFile = ref<HTMLElement | null>(null);
// Текущее значение зума (в процентах)
const zoomValue = ref(100);
// Диапазон зума, будем вычислять динамически
const zoomMin = ref(10);
const zoomMax = ref(300);
// const dragOffset = reactive({ x: 0, y: 0 });
const imageContainer = ref<HTMLDivElement | null>(null);
const image = ref<HTMLImageElement | null>(null);
const isDragging = ref(false);
const dragOffset = reactive({ x: 0, y: 0 });
const dragStart = reactive({ x: 0, y: 0 });
const isMouseDown = ref(false);
// Вычисляем «прогресс» от 0% до 100%
const rangeStyle = computed(() => {
  const percent = ((zoomValue.value - zoomMin.value) / (zoomMax.value - zoomMin.value)) * 100;
  return {
    background: `
      linear-gradient(to right,
        red 0%,
        red ${percent}%,
        #ccc ${percent}%,
        #ccc 100%
      )
    `
  };
});
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
    photoUrl.value = e.target?.result as string;

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
const updateZoomFromSlider = () => {
  updateImageTransform();
};

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
    if (!blob) return;

    // Прежде чем скачивать, преобразуем blob в base64
    const reader = new FileReader();
    reader.onload = () => {
      // Здесь reader.result будет содержать dataURL (base64)
      const base64Data = reader.result;
      console.log('Base64:', base64Data);
    };
    // Запускаем чтение
    reader.readAsDataURL(blob);

    // Ваша логика для скачивания
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'edited-image.png';
    link.click();
  });
};

// =========== ЭФФЕКТ НАКЛОНА ИКОНКИ ===========
const handleMouseMove = (event: MouseEvent) => {
  if (!downloadFile.value) return;
  const { left, top, width, height } = downloadFile.value.getBoundingClientRect();
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const deltaX = event.clientX - centerX;
  const deltaY = event.clientY - centerY;
  const rotateX = (deltaY / height) * -60;
  const rotateY = (deltaX / width) * 60;
  downloadFile.value.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
};

const resetTilt = () => {
  if (downloadFile.value) {
    downloadFile.value.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  }
};

// =========== ЗАГРУЗКА ФАЙЛА (png/jpg) ===========
/** Сброс (drag + zoomValue) */
const resetImageTransformations = () => {
  dragOffset.x = 0;
  dragOffset.y = 0;
  zoomValue.value = 100;
  updateImageTransform();
};
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
const triggerFileInput = () => {
  fileInput.value?.click();
};

// =========== КАМЕРА ===========
const openCamera = async () => {
  isCameraOpen.value = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (video.value) {
      video.value.srcObject = stream;
    }
  } catch (error) {
    console.error('Ошибка открытия камеры:', error);
  }
};

const closeCamera = () => {
  if (video.value?.srcObject) {
    const stream = video.value.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  }
  isCameraOpen.value = false;
};

const capturePhoto = async () => {
  if (!video.value) return;

  // Берём текущий кадр из <video>
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = video.value.videoWidth;
  canvas.height = video.value.videoHeight;

  ctx?.drawImage(video.value, 0, 0, canvas.width, canvas.height);

  // Генерируем Blob (PNG)
  canvas.toBlob(async (blob) => {
    if (blob) {
      // Создаём файл (по аналогии с "image/jpeg" / "image/png")
      const file = new File([blob], 'selfie.png', { type: 'image/png' });
      fileName.value = file.name;

      // Превращаем файл в local URL
      photoUrl.value = URL.createObjectURL(blob);

      // Сбрасываем трансформации (drag + zoom) перед тем,
      // как подождать, пока <img> загрузится
      resetImageTransformations();

      // Закрываем камеру
      closeCamera();

      // Делаем nextTick(), чтобы Vue успел отрендерить <img :src="photoUrl">
      await nextTick();

      // Если <img> уже успела загрузиться
      if (image.value && image.value.complete) {
        recalcZoomRange();
        zoomValue.value = zoomMin.value;
        updateImageTransform();
      } else if (image.value) {
        // Если не успела — ставим обработчик onload
        image.value.onload = () => {
          recalcZoomRange();
          zoomValue.value = zoomMin.value;
          updateImageTransform();
        };
      }
    } else {
      // Если blob не создался — теоретически не должно случаться
      console.warn('Не удалось создать Blob для селфи.');
      closeCamera();
    }
  }, 'image/png');
};






// =========== Применяем transform (translate + scale) ===========
watch(zoomValue, () => {
  updateImageTransform();
});

/** Применение transform (drag + scale) */
const updateImageTransform = () => {
  if (image.value) {
    image.value.style.transform = `
      translate(${dragOffset.x}px, ${dragOffset.y}px)
      scale(${zoomValue.value / 100})
    `;
  }
};

// =========== LOCK BODY SCROLL WHEN CAMERA IS OPEN ===========
watch(isCameraOpen, (val) => {
  if (val) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
});

// Убираем stream при размонтировании
onUnmounted(() => {
  if (video.value?.srcObject) {
    const stream = video.value.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  }
});
</script>

<style scoped>

</style>
