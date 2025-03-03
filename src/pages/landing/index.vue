<script setup lang="ts">
import { fetchLayoutParticipant } from "/@src/composables/event/useLayout";

definePage({
  meta: {
    requiresAuth: false,
  },
});

const phone = ref("");
const dataLayouts = ref([]);
const layouts = computed(() => {
  return dataLayouts.value.filter((data) => data.layout);
});

const getLayout = () => {
  if (phone.value !== "") {
    fetchLayoutParticipant(phone.value)
      .then((result) => {
        if (result.status) {
          dataLayouts.value = result.data;

          document.getElementById("layout").scrollIntoView();
        } else {
          dataLayouts.value = [];
        }
      })
      .catch((err) => {
        dataLayouts.value = [];
      });
  }
};
</script>

<template>
  <div>
    <div class="banner-container">
      <span class="calendar"> St.Regis - Jakarta | 3-5 Maret 2025 </span>
      <div class="banner-image"></div>
      <div class="input-container">
        <span>Masukkan nomor telepon</span>
        <input v-model="phone" type="text" id="scrollInput" @keyup.enter="getLayout" />
      </div>
    </div>

    <div id="layout">
      <div class="content" v-for="(layout, index) in layouts" :key="index">
        <div class="background-image"></div>
        <div class="columns is-vcentered">
          <div class="column is-flex is-flex-direction-column is-align-items-center p-4">
            <div class="ornate-box mb-4 mb-md-5">{{ layout.participant_name }}</div>
            <div class="box table mb-4 mb-md-5">TABLE {{ layout.seat_name }}</div>
            <div class="box date mb-4 mb-md-5">4 Maret 2025</div>
            <img
              class="event-type-img"
              :src="
                layout.event_id == 1
                  ? '/images/event/layout/text-meeting.png'
                  : '/images/event/layout/text-gala-dinner.png'
              "
              alt=""
            />
          </div>
          <div class="column is-flex is-justify-content-center p-4">
            <img :src="layout.layout" alt="" class="layout-img" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner-container {
  position: relative;
  padding: 0;
  color: #ffffff;
  background-position: center top;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;

  .banner-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    position: absolute;
    background-image: url("/images/event/layout/Homepage.jpg");
  }

  .calendar {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    color: #b5473f;
    font-weight: 600;
    z-index: 1;
    width: 100%;
    text-align: center;
  }

  .input-container {
    position: absolute;
    top: 39%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255);
    padding: 5px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 360px;

    span {
      font-size: 16px;
      color: #351715;
      padding: 10px;
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      text-align: center;
      font-weight: 600;
    }

    input {
      padding: 10px;
      font-size: 16px;
      border: none;
      border-radius: 5px;
      background: #fbefd9;
      color: black;
      outline: none;
      width: 100%;
      text-align: center;
    }

    input::placeholder {
      color: rgba(0, 0, 0, 0.5);
    }
  }
}

.content {
  position: relative;
  padding: 0;
  color: #ffffff;
  background-position: center top;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
  display: flex;
  align-items: center;

  .background-image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    position: absolute;
    background-image: url("/images/event/layout/layout.jpg");
  }

  .columns {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 2rem 0;
  }
  
  .layout-img {
    max-width: 100%;
    height: auto;
  }
  
  .event-type-img {
    max-width: 50%;
    height: auto;
  }
}

.box {
  background: #fbefd9; /* Cream/beige color */
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  box-sizing: border-box;
  border: 4px solid white;
  color: #351715;
  text-align: center;
  width: 100%;
  max-width: 450px;

  &.table {
    padding: 2rem;
    font-weight: 600;
    font-size: clamp(2rem, 5vw, 3.5rem);
  }

  &.date {
    padding: 0.75rem 2rem;
    font-weight: 600;
    font-size: clamp(1.25rem, 3vw, 2rem);
  }
}

.ornate-box {
  border: 40px solid transparent;
  border-image-source: url("/images/event/layout/box.png");
  border-image-slice: 40 fill;
  border-image-width: 40px;
  border-image-repeat: stretch;
  background-color: transparent;
  box-sizing: border-box;
  width: 100%;
  max-width: 450px;
  font-weight: 600;
  font-size: clamp(1.5rem, 4vw, 2.8rem);
  color: #351715;
  text-align: center;
  padding: 0.5rem;
}

/* Base styles remain as they are in your original code */

/* Media queries for responsive design */

/* Large desktops and high-resolution displays */
@media screen and (min-width: 1921px) {
  .banner-container {
    .calendar {
      font-size: 24px;
      top: 22%;
    }
    
    .input-container {
      max-width: 480px;
      
      span {
        font-size: 20px;
        top: -40px;
      }
      
      input {
        font-size: 20px;
        padding: 15px;
      }
    }
  }
  
  .ornate-box {
    max-width: 600px;
    font-size: 3.5rem;
    border-image-width: 50px;
    border-width: 50px;
  }
  
  .box {
    max-width: 600px;
    
    &.table {
      padding: 80px 160px;
      font-size: 4rem;
    }
    
    &.date {
      padding: 15px 60px;
      font-size: 2.5rem;
    }
  }

  .content {
    .event-type-img {
      max-width: 30%;
      height: auto;
    }
  }
}

/* Standard desktops and laptops */
@media screen and (max-width: 1440px) {
  .ornate-box {
    max-width: 400px;
    font-size: 2.5rem;
  }
  
  .box {
    max-width: 400px;
    
    &.table {
      padding: 50px 100px;
      font-size: 3rem;
    }
    
    &.date {
      padding: 10px 35px;
      font-size: 1.8rem;
    }
  }

  .content {
    .event-type-img {
      max-width: 50%;
      height: auto;
    }
  }
}

/* Small desktops and laptops */
@media screen and (max-width: 1200px) {
  .ornate-box {
    max-width: 350px;
    font-size: 2.2rem;
    border-image-width: 35px;
    border-width: 35px;
  }
  
  .box {
    max-width: 350px;
    
    &.table {
      padding: 40px 80px;
      font-size: 2.7rem;
    }
    
    &.date {
      padding: 8px 30px;
      font-size: 1.6rem;
    }
  }
  
  .content .layout-img {
    max-width: 90%;
  }

  .content {
    .event-type-img {
      max-width: 50%;
      height: auto;
    }
  }
}

/* Tablets and small laptops */
@media screen and (max-width: 992px) {
  .banner-container {
    .calendar {
      font-size: 16px;
    }
    
    .input-container {
      max-width: 320px;
      
      span {
        font-size: 14px;
        top: -25px;
      }
    }
  }
  
  .ornate-box {
    max-width: 300px;
    font-size: 2rem;
    border-image-width: 30px;
    border-width: 30px;
  }
  
  .box {
    max-width: 300px;
    
    &.table {
      padding: 30px 60px;
      font-size: 2.3rem;
    }
    
    &.date {
      padding: 7px 25px;
      font-size: 1.4rem;
    }
  }

  .content {
    .event-type-img {
      max-width: 50%;
      height: auto;
    }
  }
}

/* Tablets and large phones in landscape */
@media screen and (max-width: 768px) {
  .content .columns {
    flex-direction: column;
  }
  
  .banner-container {
    .calendar {
      width: 90%;
      font-size: 16px;
    }
    
    .input-container {
      width: 85%;
      max-width: 300px;
      
      input {
        font-size: 14px;
      }
    }
  }
  
  .ornate-box {
    max-width: 280px;
    font-size: 1.8rem;
    border-image-width: 25px;
    border-width: 25px;
    margin-top: 2rem;
  }
  
  .box {
    max-width: 280px;
    
    &.table {
      padding: 25px 50px;
      font-size: 2rem;
    }
    
    &.date {
      padding: 6px 20px;
      font-size: 1.3rem;
    }
  }
  
  .content {
    .columns {
      padding: 1.5rem 0;
    }
    
    .layout-img {
      max-width: 85%;
      margin: 1.5rem 0;
    }
    
    .event-type-img {
      max-width: 55%;
      margin-bottom: 1.5rem;
    }
  }
}

/* Medium-sized phones */
@media screen and (max-width: 576px) {
  .banner-container {
    .calendar {
      top: 20%;
      font-size: 14px;
    }
    
    .input-container {
      top: 35%;
      max-width: 280px;
      
      span {
        font-size: 13px;
        top: -22px;
      }
      
      input {
        padding: 8px;
        font-size: 13px;
      }
    }
  }
  
  .ornate-box {
    max-width: 250px;
    font-size: 1.5rem;
    border-image-width: 20px;
    border-width: 20px;
  }
  
  .box {
    max-width: 250px;
    
    &.table {
      padding: 20px 40px;
      font-size: 1.7rem;
    }
    
    &.date {
      padding: 5px 15px;
      font-size: 1.1rem;
    }
  }
  
  .content {
    .columns {
      padding: 1rem 0;
    }
    
    .column {
      padding: 0.5rem 1rem;
    }
    
    .mb-4 {
      margin-bottom: 0.75rem !important;
    }
  }
}

/* Small phones */
@media screen and (max-width: 480px) {
  .banner-container {
    .calendar {
      font-size: 12px;
    }
    
    .input-container {
      max-width: 250px;
      
      span {
        font-size: 12px;
        top: -20px;
      }
      
      input {
        padding: 6px;
        font-size: 12px;
      }
    }
  }
  
  .ornate-box {
    max-width: 220px;
    font-size: 1.2rem;
    border-image-width: 15px;
    border-width: 15px;
  }
  
  .box {
    max-width: 220px;
    
    &.table {
      padding: 15px 30px;
      font-size: 1.4rem;
    }
    
    &.date {
      padding: 4px 12px;
      font-size: 1rem;
    }
  }
  
  .content {
    .layout-img {
      max-width: 90%;
    }
  }
}

/* Extra small phones */
@media screen and (max-width: 375px) {
  .banner-container {
    .calendar {
      font-size: 11px;
    }
    
    .input-container {
      max-width: 220px;
    }
  }
  
  .ornate-box {
    max-width: 200px;
    font-size: 1rem;
    border-image-width: 12px;
    border-width: 12px;
  }
  
  .box {
    max-width: 200px;
    
    &.table {
      padding: 12px 25px;
      font-size: 1.2rem;
    }
    
    &.date {
      padding: 3px 10px;
      font-size: 0.9rem;
    }
  }
}

/* Height-based media queries for shorter screens */
@media screen and (max-height: 700px) {
  .banner-container {
    .calendar {
      top: 20%;
    }
    
    .input-container {
      top: 35%;
    }
  }
  
  .content {
    padding: 1rem 0;
  }
}

@media screen and (max-height: 500px) and (orientation: landscape) {
  .banner-container {
    min-height: 120vh;
    
    .calendar {
      top: 30%;
    }
    
    .input-container {
      top: 50%;
    }
  }
  
  .content {
    min-height: 120vh;
    
    .columns {
      flex-direction: row;
    }
    
    .column {
      padding: 0.5rem;
    }
  }
  
  .ornate-box, .box {
    transform: scale(0.8);
    margin: 0 auto;
  }
}

/* Large desktops and high-resolution displays */
@media screen and (min-width: 1921px) {
  .banner-container .calendar {
    top: 22%;
    font-size: 24px;
  }
}

/* Standard desktops and laptops */
@media screen and (max-width: 1440px) {
  .banner-container .calendar {
    top: 27%;
  }
}

/* Small desktops and laptops */
@media screen and (max-width: 1200px) {
  .banner-container .calendar {
    top: 23%;
  }
}

/* Tablets and small laptops */
@media screen and (max-width: 992px) {
  .banner-container .calendar {
    top: 27%;
    font-size: 16px;
  }
}

/* Tablets and large phones in landscape */
@media screen and (max-width: 768px) {
  .banner-container .calendar {
    top: 27%;
    width: 90%;
    font-size: 16px;
  }
}

/* Medium-sized phones */
@media screen and (max-width: 576px) {
  .banner-container .calendar {
    top: 18%;
    font-size: 14px;
  }
}

/* Small phones */
@media screen and (max-width: 480px) {
  .banner-container .calendar {
    top: 16%;
    font-size: 12px;
  }
}

/* Extra small phones */
@media screen and (max-width: 375px) {
  .banner-container .calendar {
    top: 15%;
    font-size: 11px;
  }
}

/* Height-based media queries for shorter screens */
@media screen and (max-height: 700px) {
  .banner-container .calendar {
    top: 27%;
  }
}

@media screen and (max-height: 500px) and (orientation: landscape) {
  .banner-container .calendar {
    top: 30%;
  }
}

/* iPhone SE and very small devices */
@media screen and (max-width: 320px) {
  .banner-container .calendar {
    top: 14%;
    font-size: 10px;
  }
}

/* Tall mobile devices */
@media screen and (min-height: 800px) and (max-width: 480px) {
  .banner-container .calendar {
    top: 27%;
  }
}
</style>
