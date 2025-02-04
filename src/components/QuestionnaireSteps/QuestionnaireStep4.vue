<template>
  <h1>Ваш город</h1>
  <p>
    Укажите свой город, чтобы получить предложения от работодателей в вашем регионе.
  </p>
  <Multiselect
    v-model="selectedCity"
    :options="cities"
    :searchable="true"
    :can-deselect="false"
    :clear-on-select="false"
    :can-clear="false"
    mode="single"
    placeholder="Выберите город..."
  >
    <!-- Кастомный рендеринг каждой опции -->
    <template v-slot:option="{ option }">
      <label class="checkbox-option">
        <input
          type="radio"
          class="custom-checkbox-quest"
          :checked="selectedCity === option.value"
          @change="toggleSelection(option)"
        />
        {{ (option as CityInterface).label }}
      </label>
    </template>
  </Multiselect>
</template>

<script setup lang="ts">
import '@vueform/multiselect/themes/default.css'
import '@/assets/css/QuestionnaireSteps/multiselect-quest-total.css'
import '@/assets/css/checkbox/custom-checkbox.css'
import '@/assets/css/QuestionnaireSteps/chips-quest-total.css'
import Multiselect from '@vueform/multiselect'
import { ref } from 'vue'

interface CityInterface {
  value: string
  label: string
}

// Данные для селекта
const cities = ref<CityInterface[]>([
  { value: 'msk', label: 'Москва' },
  { value: 'kras', label: 'Красноярск' },
  { value: 'kaliningrad', label: 'Калининград' },
])

const selectedCity = ref<string | null>(null)

const toggleSelection = (option: CityInterface) => {
  selectedCity.value = option.value
}
</script>

<style scoped>

</style>
