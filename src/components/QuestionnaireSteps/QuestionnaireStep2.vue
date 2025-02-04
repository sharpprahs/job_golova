<template>
    <h1>Укажите устройства, с которыми есть опыт работы</h1>
    <p>
      Укажите все устройства
    </p>
  <Multiselect
    v-model="selectedSpecializationItems"
    :options="specializationItems"
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
          :checked="selectedSpecializationItems.includes(option.value)"
          @change="toggleSelection(option)"
        />
        {{ (option as SpecializationItem).label}}
      </label>
    </template>
  </Multiselect>

  <div class="chips-container">
    <span
      v-for="opt in specializationItems"
      :key="opt.value"
      class="chip"
      :class="{ 'chip--selected': selectedSpecializationItems.includes(opt.value) }"
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

interface SpecializationItem {
  value: string
  label: string
}
// Данные для мультиселекта
const specializationItems = ref<SpecializationItem[]>([
  { value: 'pc', label: 'ПК' },
  { value: 'mobile', label: 'Мобильный телефон' },
  { value: 'laptop', label: 'Ноутбук' },
])
const selectedSpecializationItems = ref<string[]>([])

// Функция для синхронизации выбора с чекбоксами и чипсами
const toggleSelection = (option: { value: string }) => {
  if (selectedSpecializationItems.value.includes(option.value)) {
    selectedSpecializationItems.value = selectedSpecializationItems.value.filter(
      (val) => val !== option.value
    )
  } else {
    selectedSpecializationItems.value.push(option.value)
  }
}
</script>

<style scoped>

</style>
