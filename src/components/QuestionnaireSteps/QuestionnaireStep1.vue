<template>

<h1>Выберите вашу специализацию</h1>
  <p>
    Укажите все ваши специальности — так подходящих заказов найдётся больше.
  </p>
    <!-- Мультиселект -->
  <Multiselect
    v-model="selectedSpecializations"
    :options="specializations"
    :searchable="true"
    mode="tags"
    placeholder="Поиск..."
    :hide-selected="false"
  >
    <!-- Кастомный рендеринг каждой опции -->
    <template v-slot:option="{ option }">
      <label class="checkbox-option">
        <input
          type="checkbox"
          class="custom-checkbox-quest"
          :checked="selectedSpecializations.includes(option.value)"
          @change="toggleSelection(option)"
        />
        {{ (option as Specialization).label}}
      </label>
    </template>
  </Multiselect>

  <div class="chips-container">
    <span
      v-for="opt in specializations"
      :key="opt.value"
      class="chip"
      :class="{ 'chip--selected': selectedSpecializations.includes(opt.value) }"
      @click="toggleSelection(opt)"
    >
      {{ opt.label }}
    </span>
  </div>

</template>

<script setup lang="ts">
import '@vueform/multiselect/themes/default.css'
import '@/assets/css/QuestionnaireSteps/multiselect-quest-total.css'
import '@/assets/css/checkbox/custom-checkbox.css'
import '@/assets/css/QuestionnaireSteps/chips-quest-total.css'
import Multiselect from '@vueform/multiselect'
import { ref } from 'vue'
// 🏷 Определяем интерфейс для option
interface Specialization {
  value: string
  label: string
}
// Данные для мультиселекта
const specializations = ref<Specialization[]>([
  { value: 'web-developer', label: 'Веб-разработчик' },
  { value: 'graphic-designer', label: 'Графический дизайнер' },
  { value: 'copywriter', label: 'Копирайтер' },
])
const selectedSpecializations = ref<string[]>([])

// Функция для синхронизации выбора с чекбоксами и чипсами
const toggleSelection = (option: { value: string }) => {
  if (selectedSpecializations.value.includes(option.value)) {
    selectedSpecializations.value = selectedSpecializations.value.filter(
      (val) => val !== option.value
    )
  } else {
    selectedSpecializations.value.push(option.value)
  }
}
</script>

<style scoped>

</style>
