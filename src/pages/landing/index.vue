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
          <div class="column">
            <div class="is-flex is-justify-content-space-between is-flex-direction-column is-align-items-center">
              <div class="ornate-box">{{ layout.participant_name }}</div>
              <div class="box table">TABLE {{ layout.seat_name }}</div>
              <div class="box date">4 Maret 2025</div>
              <img
                :src="
                  layout.event_id === 1
                    ? '/images/event/layout/text-meeting.png'
                    : '/images/event/layout/text-gala-dinner.png'
                "
                alt=""
              />
            </div>
          </div>
          <div class="column">
            <img :src="layout.layout" alt="" style="width: 90%" />
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
  height: 100vh;

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
      width: 340px;
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
  height: 100vh;

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
    height: 100%;
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

  &.table {
    padding: 60px 120px;
    min-height: 100px; /* Adjust as needed */
    font-weight: 600;
    font-size: 56px;
  }

  &.date {
    padding: 10px 40px;
    min-height: 60px; /* Adjust as needed */
    font-weight: 600;
    font-size: 32px;
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
  min-width: 450px;
  font-weight: 600;
  font-size: 45px;
  color: #351715;
  text-align: center;
}
</style>
