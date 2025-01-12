<template>
  <header ref="headerRef" class="header_home">
    <a href="/" id="link_to_home">job.golova</a>
    <button
      class="menu_icon"
      :class="{ _active: isMenuOpen }"
      aria-label="Toggle menu"
      @click="toggleMenu"
    >
      <span></span>
    </button>
    <ul :class="{ _active: isMenuOpen }">
      <li>
        <a @click.prevent="emitRegisterClick">Зарегистрироваться</a>
      </li>
      <li>
        <a>Личный кабинет</a>
      </li>
      <li>
        <Listbox v-model="selectedPerson" >
          <ListboxButton class="lang_select"> <lang-world/>{{ selectedPerson.name }} <arrow-down/></ListboxButton>
          <ListboxOptions class="lang_select__options">
            <ListboxOption
              v-for="person in people"
              :key="person.id"
              :value="person"
              :disabled="person.unavailable"
            >
              {{ person.name }}
            </ListboxOption>
          </ListboxOptions>
        </Listbox>
      </li>
    </ul>
  </header>
</template>

<script setup lang="ts">
import '@/assets/css/header.css'
import { onUnmounted, ref } from 'vue'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import LangWorld from '@/components/icons/LangWorld.vue'
import ArrowDown from '@/components/icons/ArrowDown.vue'

const people = [
  { id: 1, name: 'ru', unavailable: false },
  { id: 2, name: 'eng', unavailable: false },
]
const selectedPerson = ref(people[0])
// Состояние для отображения/скрытия меню
const isMenuOpen = ref(false)

// Функция переключения меню
// Функция переключения меню
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  if (isMenuOpen.value) {
    document.body.classList.add('_lock') // Блокируем прокрутку
  } else {
    document.body.classList.remove('_lock') // Разблокируем прокрутку
  }
}

// Удаляем класс `_lock` при размонтировании компонента
onUnmounted(() => {
  document.body.classList.remove('_lock')
})
// Локальная ссылка на <header>
const headerRef = ref<HTMLElement | null>(null)

// "Экспортируем" ссылку наружу
defineExpose({
  headerRef,
})
// Определяем событие, которое будем эмитить
const emit = defineEmits(["registerClick"])

// Функция-обработчик клика
function emitRegisterClick() {
  // Эмитим событие "registerClick" наверх
  emit("registerClick")
}
</script>

<style scoped>

</style>
