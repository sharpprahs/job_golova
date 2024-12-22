<template>
  <button
    :class="['ui-button', { disabled }]"
    :style="buttonStyles"
    :disabled="disabled"
    v-on="$attrs"
  >
  <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// Пропсы
const props = defineProps({
  textColor: {
    type: String,
    default: '#ffffff', // Цвет текста по умолчанию
  },
  backgroundColor: {
    type: String,
    default: '#007bff', // Цвет фона по умолчанию
  },
  width: {
    type: String,
    default: 'auto', // Ширина кнопки по умолчанию
  },
  padding: String
  ,
  fontSize: String,
  borderRadius: {
    type: String,
    default: '0.5rem', // Радиус скругления по умолчанию
  },
  disabled: {
    type: Boolean,
    default: false, // Отключена ли кнопка
  },
});

// Вычисляем стили кнопки
const buttonStyles = computed(() => ({
  color: props.textColor,
  backgroundColor: props.backgroundColor,
  width: props.width,
  padding: props.padding,
  fontSize: props.fontSize,
  borderRadius: props.borderRadius,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  opacity: props.disabled ? 0.6 : 1,
}));
</script>

<style scoped>
/* Базовые стили кнопки */
.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-weight: 400;
  border: none;
  transition: all 0.3s ease;
}

/* Состояние hover */
.ui-button:not(.disabled):hover {
  filter: brightness(90%);
}

/* Отключённая кнопка */
.ui-button.disabled {
  pointer-events: none;
}
</style>
