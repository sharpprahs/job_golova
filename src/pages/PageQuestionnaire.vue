<template>
  <div class="questionnaire_container">
  <component-header-reg-steps/>
    <main>
      <nav aria-label="progress" class="steps_progress">
        <ol>
          <li aria-current="step">Шаг {{ currentStep }}</li>
        </ol>
      </nav>
      <div class="steps_container">
      <component :is="currentStepComponent" />
      <div class="switch_container">
        <UIBackQuest v-if="currentStep < 6" @click="decrementStep">Назад</UIBackQuest>
        <UIOnwardQuest v-if="currentStep < 6"  @click="incrementStep">Далее</UIOnwardQuest>
        <UIOnwardQuest v-if="currentStep == 6" class="exit_quest">Завершить регистрацию</UIOnwardQuest>
      </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
</style>
<script setup lang="ts">
import '@/assets/css/questionnaire.css'
import ComponentHeaderRegSteps from '@/components/ComponentHeaderQuestionnaire.vue'
import { type Component, computed, ref } from 'vue'
// Импортируем наши компоненты шагов
import QuestionnaireStep1 from '@/components/QuestionnaireSteps/QuestionnaireStep1.vue'
import QuestionnaireStep2 from '@/components/QuestionnaireSteps/QuestionnaireStep2.vue'
import QuestionnaireStep3 from '@/components/QuestionnaireSteps/QuestionnaireStep3.vue'
import QuestionnaireStep4 from '@/components/QuestionnaireSteps/QuestionnaireStep4.vue'
import QuestionnaireStep5 from '@/components/QuestionnaireSteps/QuestionnaireStep5.vue'
import QuestionnaireStep6 from '@/components/QuestionnaireSteps/QuestionnaireStep6.vue'
import UIBackQuest from '@/components/UI/UIBackQuest.vue'
import UIOnwardQuest from '@/components/UI/UIOnwardQuest.vue'
import router from '@/router'
// Текущий шаг
const currentStep = ref<number>(1)
const stepComponents: Record<number, Component> = {
  1: QuestionnaireStep1,
  2: QuestionnaireStep2,
  3: QuestionnaireStep3,
  4: QuestionnaireStep4,
  5: QuestionnaireStep5,
  6: QuestionnaireStep6,
}
const currentStepComponent = computed(() => {
  return stepComponents[currentStep.value]
})
function decrementStep(){
  currentStep.value--;
  if (currentStep.value === 0) {
    router.push('/');
  }
}
function incrementStep(){
  currentStep.value++;
}

</script>
