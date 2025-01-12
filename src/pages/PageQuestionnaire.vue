<template>
  <div class="questionnaire_container">
  <component-header-reg-steps/>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
<script setup lang="ts">
import '@/assets/css/questionnaire.css'
import ComponentHeaderRegSteps from '@/components/ComponentHeaderQuestionnaire.vue'
</script>
