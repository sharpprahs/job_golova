<template>
  <div class="home_container">
  <div class="container_main">
    <ComponentHeader ref="componentHeaderRef" @registerClick="scrollToSection" />
    <main>
      <div class="general_info">
        <h1>
          ИЩЕМ СПЕЦИАЛИСТОВ <br />
          ДЛЯ РАБОТЫ <br />
          НА МЕРОПРИЯТИЯ<span>Х:</span>
        </h1>
        <div class="lottie_people">
          <Vue3Lottie :animationData="PeopleJSON" />
        </div>
      </div>
      <!-- Анимация текста -->
      <div class="wrapper">
        <div class="marquee">
          <p v-for="(item, index) in events" :key="index">
            <Ellipse />
            {{ item }}
            <Ellipse />
          </p>
          <p v-for="(item, index) in events" :key="'duplicate-' + index">
            <Ellipse />
            {{ item }}
            <Ellipse />
          </p>
        </div>
      </div>
    </main>
      <section class="questionnaire_filling">
        <div class="lottie_text">
          <Vue3Lottie :animationData="currentTextLottieJSON" />
        </div>
        <router-link to="/questionnaire">Заполнить анкету</router-link>
      </section>
      <section class="what_is_job_golova">
           <job-element/>
        <h2 class="title_job">Добро пожаловать в сервис поиска вакансий <span>job.golova</span>!</h2>
        <p class="text_job">Это место, где профессионалы из индустрии проката и ивентов могут найти работу в соответствии со своими навыками. </p>
      </section>
      <section class="about_job_golova">
       <div class="swap_flex_container">
         <div class="swap_flex_container_content">
               <h2 class="title_job">О НАС</h2>
           <p class="text_job"><span>Golova.io</span> — это софт для прокатчиков, где сотни зарегистрированных компаний управляют своим бизнесом и ведут проекты. С  запуском проекта <span>job.golova.io</span> они могут находить сотрудников и назначать исполнителей прямо из проекта, прямо в интерфейсе основной системы. </p>
         </div>
         <about-us-first/>
       </div>
        <div class="swap_flex_container">
          <div class="swap_flex_container_content">
            <p class="text_job">Компания на своей стороне формирует заявку на поиск сотрудника
              (от грузчика и водителя до техника, звукорежиссера и т.д.).
              Вы в <span>личном кабинете job</span> получаете приглашение и откликаетесь на него. По окончанию проекта заказчик и исполнитель оценивают взаимодействие, формируя таким образом рейтинг. </p>
          </div>
          <about-us-two/>
        </div>
      </section>
      <section  ref="registrationSection"  class="registration_job_golova">
        <h2>Зарегистрироваться</h2>
        <p>Пожалуйста, укажите ваши ФИО как в паспорте,<br> это важно для проверки.</p>
        <div
          v-for="(input, index) in inputs"
          :key="`input-${input.id}`"
          class="input-container"
        >
          <!-- Label -->
          <label :for="`input-${input.id}`" class="input-label">
            <span class="required-marker">*</span> {{ input.label }}
          </label>

          <!-- Input для пароля -->
          <template v-if="input.type === 'password'">
            <input
              :id="`input-${input.id}`"
              type="text"
              class="custom-input"
              :placeholder="input.placeholder"
              :value="getPasswordMask(input.value)"
              @input="(event) => onPasswordInput(event, index)"
              @blur="() => validateInput(index)"
            />
          </template>

          <!-- Остальные типы -->
          <template v-else>
            <input
              :id="`input-${input.id}`"
              v-model="input.value"
              :type="input.type"
              class="custom-input"
              :placeholder="input.placeholder"
              @blur="() => validateInput(index)"
            />
          </template>

          <!-- Ошибка -->
          <p v-if="input.error" class="error-text">{{ input.errorText }}</p>

          <!-- Кнопка очистки -->
          <button @click="clearInputField(index)" class="close-button">✕</button>
        </div>
        <div class="registration_job_golova_form_group">
          <input type="checkbox" id="terms" name="terms" class="custom-checkbox" required checked>
          <label for="terms" class="custom-label">
            Принимаю <a href="/public-offer" class="link"><span>публичную оферту</span></a><span>,</span>
            <a href="/terms-of-use" class="link"> <span>условия использования</span></a>
          </label>
        </div>
        <a href="" id="already_registered">Уже зарегистрированы ?</a>
        <button id="further"  @click="handleClick">Далее
        </button>
      </section>
    <component-footer/>
  </div>
  </div>
</template>

<script setup lang="ts">
import '@/assets/css/home.css'
import Ellipse from '@/components/icons/EllipseCircle.vue'
import { Vue3Lottie } from 'vue3-lottie'
import PeopleJSON from '@/assets/lottie/golova-job.json'
import HorizontalJSON from '@/assets/lottie/job-horizontally.json'
import VerticalJSON from '@/assets/lottie/job-vertically.json'
import ComponentHeader from '@/components/ComponentHeader.vue'
// import UIButton from '@/components/UI/UIButton.vue'
import JobElement from '@/components/icons/jobElement.vue'
import AboutUsFirst from '@/components/icons/aboutUsFirst.vue'
import AboutUsTwo from '@/components/icons/aboutUsTwo.vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import ComponentFooter from '@/components/ComponentFooter.vue'

function handleClick(event: object) {
  console.log('Кнопка нажата!', event)
}

// Тексты для прокрутки
const events = ['Концерты', 'Вечеринки', 'Фестивали', 'Показы', 'Презентации']


interface InputField {
  id: number;
  label: string;
  placeholder: string;
  type: string;
  value: string;
  error: boolean; // Статус ошибки
  errorText: string; // Текст ошибки
}

const inputs = reactive<InputField[]>([
  { id: 1, label: "ФИО", placeholder: "Введите ФИО", type: "text", value: "Иван Иванов Иванович", error: false, errorText: "Пожалуйста, введите корректное ФИО" },
  { id: 2, label: "Телефон", placeholder: "+7 (___) ___ __ __", type: "tel", value: "+7 (926) 632 90 63", error: false, errorText: "Неверный формат телефона" },
  { id: 3, label: "Email", placeholder: "Введите email", type: "email", value: "hello@golova.eu", error: false, errorText: "Некорректный email" },
  { id: 4, label: "Пароль", placeholder: "Введите пароль", type: "password", value: "олролрол", error: false, errorText: "Пароль слишком короткий" },
]);

// Проверка ошибок
const validateInput = (index: number) => {
  const input = inputs[index];

  if (!input.value) {
    input.error = true;
    input.errorText = "Поле обязательно для заполнения";
  } else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    input.error = true;
    input.errorText = "Введите корректный email";
  } else if (input.type === "tel" && !/^\+7 \(\d{3}\) \d{3} \d{2} \d{2}$/.test(input.value)) {
    input.error = true;
    input.errorText = "Введите корректный номер телефона";
  } else {
    input.error = false; // Сбрасываем ошибку
  }
};

// Очистка инпута
const clearInputField = (index: number) => {
  inputs[index].value = "";
  inputs[index].error = false; // Сбрасываем ошибку при очистке
};

// Возвращаем строку из звёздочек, равную длине пароля
const getPasswordMask = (value: string): string => {
  return "*".repeat(value.length);
};

// Обработка ввода пароля
const onPasswordInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;

  // Добавляем новый символ к реальному паролю
  const currentValue = inputs[index].value;
  const newValue = target.value;

  // Определяем, был ли удалён символ (если длина стала меньше)
  if (newValue.length < currentValue.length) {
    inputs[index].value = currentValue.slice(0, -1); // Удаляем последний символ
  } else {
    // Добавляем новый символ
    inputs[index].value += newValue.slice(currentValue.length);
  }
  console.log(inputs[index].value);
};

// Текущее состояние ширины экрана
const screenWidth = ref(window.innerWidth)

// Выбор Lottie-анимации в зависимости от ширины экрана
const currentTextLottieJSON = computed(() => {
  return screenWidth.value <= 450 ? VerticalJSON : HorizontalJSON
})

// Обновляем ширину экрана при изменении размеров окна
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

// Добавляем и удаляем слушатель события "resize"
onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
const registrationSection = ref<HTMLElement | null>(null)
// Ссылка на компонент хедера
const componentHeaderRef = ref<InstanceType<typeof ComponentHeader> | null>(null)

function scrollToSection() {
  if (!registrationSection.value) return

  // Получаем координату секции
  const elementTop = registrationSection.value.getBoundingClientRect().top + window.pageYOffset

  // Узнаём высоту <header>
  // благодаря defineExpose() в дочернем компоненте:
  const headerHeight = componentHeaderRef.value?.headerRef?.offsetHeight ?? 0

  // Скроллим с учётом реальной высоты шапки
  window.scrollTo({
    top: elementTop - headerHeight,
    behavior: 'smooth'
  })
}
</script>

<style scoped>

</style>
