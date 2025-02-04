<template>
  <h1>Загрузите фото профиля</h1>
  <p>
    Клиенты чаще выбирают специалистов с фото. Его можно будет поменять в профиле.
  </p>
  <div class="upload-container">
    <div class="photo_container" :class="{ 'photo-container--hidden': photoUrl }">
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
      <!-- Отображение текущего изображения с Drag & Drop -->
      <img
        v-if="photoUrl"
        :src="photoUrl"
        alt="Фото профиля"
        class="profile-photo"
        draggable="false"
        :style="{
          transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(${heightPercent / 100})`,
        }"
        @mousedown="startDrag"
        @touchstart="startDrag"
        @mousemove="moveDrag"
        @touchmove="moveDrag"
        @mouseup="endDrag"
        @touchend="endDrag"
        @mouseleave="endDrag"
      />
    </div>

    <!-- Ползунок для изменения высоты -->
    <div v-if="photoUrl" class="resize-controls">
      <input
        type="range"
        min="100"
        max="200"
        step="5"
        class="styled-slider"
        v-model="heightPercent"
      />
      <button class="saved_data_quest" @click="debouncedSaveImage"><saved-img/></button>
    </div>

    <div class="choice_container">
      <button @click="triggerFileInput">Загрузить фото</button>
      или
      <button @click="openCamera">Сделать селфи</button>
    </div>

    <input
      type="file"
      id="fileInput"
      ref="fileInput"
      class="file-input"
      accept="image/jpeg, image/png"
      @change="onFileChange"
    />
    <div v-if="isCameraOpen" class="camera_overlay" @click.self="closeCamera">
      <div class="camera_view">
        <video ref="video" autoplay></video>
        <div class="camera_view_buttons">
          <button @click="capturePhoto" class="make_photo">
            <make_photo />
          </button>
          <button @click="closeCamera" class="close_camera">
            <close-item />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/assets/css/QuestionnaireSteps/questionnaire_step5.css'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import DownloadFile from '@/components/icons/downloadFile.vue'
import Make_photo from '@/components/icons/make_photo.vue'
import CloseItem from '@/components/icons/CloseItem.vue'
import SavedImg from '@/components/icons/savedImg.vue'
import { useDebounceFn } from '@vueuse/shared'
import ImageWorker from '@/workers/imageWorker.ts?worker';
// const worker = new Worker(new URL('../imageWorker.js', import.meta.url), { type: 'module' });
const worker = new ImageWorker();
// let lastObjectURL: string | null = null;

// const worker = new Worker(new URL("../imageWorker.js", import.meta.url), { type: "module" });
let lastObjectURL: string | null = null;

// ✅ Дебаунс-функция для предотвращения частых вызовов Web Worker
const debouncedSaveImage = useDebounceFn(() => {
  if (!photoUrl.value) return;

  fetch(photoUrl.value)
    .then(res => {
      if (!res.ok) {
        throw new Error('Не удалось загрузить изображение');
      }
      return res.blob();
    })
    .then(blob => {
      if (blob.size === 0) {
        throw new Error('Пустой Blob: изображение не удалось прочитать');
      }
      return blob.arrayBuffer();
    })
    .then((arrayBuffer) => {
      worker.postMessage({
        arrayBuffer,
        heightPercent: heightPercent.value,
        dragPosition: { x: dragPosition.value.x, y: dragPosition.value.y },
      }, [arrayBuffer]);
    })
    .catch((error) => {
      console.error("Ошибка загрузки изображения:", error);
    });
}, 500);

// ✅ Обработка ответа от Web Worker
worker.onmessage = (event) => {
  if (lastObjectURL) URL.revokeObjectURL(lastObjectURL); // ✅ Очищаем старый URL
  lastObjectURL = URL.createObjectURL(event.data); // ✅ event.data теперь сам Blob
  photoUrl.value = lastObjectURL;
  console.log("✅ Изображение обработано!");
};

// ✅ Ловим ошибки Web Worker
worker.onerror = (error) => {
  console.error("❌ Ошибка в Web Worker:", error.message);
};

const fileName = ref<string | null>(null); // Название текущего изображения
const photoUrl = ref<string | null>(null); // URL текущего изображения
const isCameraOpen = ref(false); // Флаг состояния камеры
const video = ref<HTMLVideoElement | null>(null); // Видео с камеры
const fileInput = ref<HTMLInputElement | null>(null); // Ссылка на <input type="file">
// Ссылка на контейнер
const downloadFile = ref<HTMLElement | null>(null);

const handleMouseMove = (event: MouseEvent) => {
  if (!downloadFile.value) return;

  const { left, top, width, height } = downloadFile.value.getBoundingClientRect();
  const centerX = left + width / 2;  // Центр блока X
  const centerY = top + height / 2;  // Центр блока Y

  const deltaX = event.clientX - centerX; // Смещение по X
  const deltaY = event.clientY - centerY; // Смещение по Y

  const rotateX = (deltaY / height) * -60; // Инвертируем наклон
  const rotateY = (deltaX / width) * 60;

  downloadFile.value.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
};

// Функция сброса эффекта
const resetTilt = () => {
  if (downloadFile.value) {
    downloadFile.value.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
  }
};
// Текущее смещение изображения
const dragPosition = ref({ x: 0, y: 0 });
const heightPercent = ref(100);


// **Функции Drag & Drop**
// Функции перетаскивания
const isDragging = ref(false);
const startMousePosition = ref({ x: 0, y: 0 });

function startDrag(event: MouseEvent | TouchEvent) {
  isDragging.value = true;
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

  startMousePosition.value = { x: clientX - dragPosition.value.x, y: clientY - dragPosition.value.y };
}

function moveDrag(event: MouseEvent | TouchEvent) {
  if (!isDragging.value) return;

  requestAnimationFrame(() => {
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    dragPosition.value = { x: clientX - startMousePosition.value.x, y: clientY - startMousePosition.value.y };
  });
}

function endDrag() {
  isDragging.value = false;
}

onMounted(() => {
  document.addEventListener('touchstart', startDrag as EventListener, { passive: false });
  document.addEventListener('touchmove', moveDrag as EventListener, { passive: false });
});

onUnmounted(() => {
  document.removeEventListener('touchstart', startDrag as EventListener);
  document.removeEventListener('touchmove', moveDrag as EventListener);
});

// Обработчик загрузки файла
function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];

    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      fileName.value = file.name;
      const reader = new FileReader();

      reader.onload = (e) => {
        photoUrl.value = e.target!.result as string;
        heightPercent.value = 100;
        dragPosition.value = { x: 0, y: 0 };
        debouncedSaveImage();
      };
      reader.readAsDataURL(file);
    } else {
      alert('Можно загружать только JPG или PNG!');
      fileInput.value!.value = '';
    }
  }
}

// Триггер для скрытого инпута
function triggerFileInput() {
  fileInput.value?.click();
}

// Работа с камерой
async function openCamera() {
  isCameraOpen.value = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (video.value) {
      video.value.srcObject = stream;
    }
  } catch (error) {
    console.error('Ошибка открытия камеры:', error);
  }
}

function closeCamera() {
  if (video.value?.srcObject) {
    const stream = video.value.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
  }
  isCameraOpen.value = false;
}

function capturePhoto() {
  if (!video.value) return;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = video.value.videoWidth;
  canvas.height = video.value.videoHeight;

  context?.drawImage(video.value, 0, 0, canvas.width, canvas.height);

  canvas.toBlob((blob) => {
    if (blob) {
      const file = new File([blob], 'selfie.png', { type: 'image/png' });
      fileName.value = file.name;
      photoUrl.value = URL.createObjectURL(blob);

      // Сбрасываем масштаб и позицию
      heightPercent.value = 100;
      dragPosition.value = { x: 0, y: 0 };

    }
  });

  closeCamera();
}
watch(isCameraOpen, (newValue) => {
  if (newValue) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }
});
// Обновление градиента ползунка
watch(heightPercent, (newValue) => {
  const slider = document.querySelector('.styled-slider') as HTMLInputElement;
  const percentage = ((newValue - +slider.min) / (+slider.max - +slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, red ${percentage}%, #ccc ${percentage}%)`;
});

</script>

<style scoped>
.download-file-container {
  display: inline-block;
  transition: transform 0.50s ease-out;
  transform-origin: center;
  perspective: 1000px; /* Эффект глубины */
}
.photo-container--hidden{
  overflow: hidden;
}
.styled-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 80%;
  height: 8px;
  border-radius: 10px;
  outline: none;
  background: linear-gradient(to right, red 0%, #ccc 0%);
  transition: background 0.3s ease;
  position: relative;
}

.styled-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #ddd;
  border: 2px solid #ccc;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}
.styled-slider::-webkit-slider-thumb:hover {
  background: #bbb;
  transform: scale(1.1);
}

</style>
