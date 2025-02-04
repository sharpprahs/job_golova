<template>
  <h1>Укажите минимальный выход за смену</h1>
  <p>
    Это поможет вашему работодателю оценить стоимость услуг.
  </p>
  <table class="styled-table">
    <thead>
    <tr>
      <th class="col-name">Наименование</th>
      <th class="col-wage">Минимальный выход за смену</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>
        <label>
          Техник по обслуживанию звукового оборудования
        </label>
      </td>
      <td>
        <div class="input-container-quest">
          <input type="checkbox" name="sound_engineer" class="custom-checkbox-quest" />
          <input
            type="number"
            name="min_wage"
            placeholder="000000000"
            min="0"
            step="1"
            class="input-with-currency"
          />
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <label>
          Монтажник
        </label>
      </td>
      <td>
        <div class="input-container-quest">
          <input type="checkbox" name="montaznik" class="custom-checkbox-quest"  />
          <input
            type="number"
            name="min_wage_montaznik"
            placeholder="000000000"
            min="0"
            step="1"
            class="input-with-currency"
          />
        </div>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import '@/assets/css/QuestionnaireSteps/questionnaire_step3.css'
import '@/assets/css/QuestionnaireSteps/multiselect-quest-total.css'
import '@/assets/css/QuestionnaireSteps/chips-quest-total.css'
</script>

<style scoped>

</style>
