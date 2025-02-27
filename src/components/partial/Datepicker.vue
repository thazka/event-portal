<script setup lang="ts">
import { ref, computed } from "vue";
// Change the import statement - v-calendar needs to be imported correctly
import 'v-calendar/dist/style.css';
// Either import the entire library
import VCalendar from 'v-calendar';
// Or destructure specific components if your setup supports it
// import { DatePicker } from 'v-calendar';

// Props dan emits
interface DatepickerEmits {
    (e: "update:date", value: Date): void;
    (e: "schedule", value: { date: Date; time: string; format: string }): void;
}

interface DatepickerProps {
    date?: Date;
    minDate?: Date;
    maxDate?: Date;
}

const emit = defineEmits<DatepickerEmits>();
const props = withDefaults(defineProps<DatepickerProps>(), {
    date: () => new Date(),
    minDate: undefined,
    maxDate: undefined,
});

// State
const range = ref(props.date);
const selectedTime = ref("01:00");
const timeFormat = ref<"AM" | "PM">("AM");
const locale = ref("id-ID");

// Computed properties
const computedMinDate = computed(() => {
    if (props.minDate) return props.minDate;

    const today = new Date();
    return new Date(today.setDate(today.getDate() - 1));
});

const computedMaxDate = computed(() => {
    if (props.maxDate) return props.maxDate;

    const today = new Date();
    return new Date(today.setMonth(today.getMonth() + 3));
});

// Format tanggal untuk Indonesia
const masks = {
    input: "DD MMMM YYYY",
    title: "MMMM YYYY",
};

// Methods
const onDateChange = () => {
    emit("update:date", selectedDate.value);
};

const scheduleNow = () => {
    // Gabungkan tanggal dan waktu
    const dateTime = new Date(selectedDate.value);
    const [hours, minutes] = selectedTime.value.split(":");

    dateTime.setHours(
        timeFormat.value === "PM" ? parseInt(hours) + 12 : parseInt(hours),
        parseInt(minutes)
    );

    // Emit event dengan data tanggal dan waktu
    emit("schedule", {
        date: dateTime,
        time: selectedTime.value,
        format: timeFormat.value,
    });
};
</script>

<template>
    <div class="datepicker-container">
        <!-- VCalendar DatePicker -->
        <div class="calendar-wrapper">
            <ClientOnly>
                <VDatePicker v-model="date" color="green" trim-weeks>
                    <template #default="{ inputValue, inputEvents }">
                        <VField>
                            <VControl icon="lucide:calendar">
                                <input class="input v-input" type="text" :value="inputValue" v-on="inputEvents">
                            </VControl>
                        </VField>
                    </template>
                </VDatePicker>
            </ClientOnly>
        </div>

        <!-- Time Picker -->
        <div class="time-picker-wrapper">
            <div class="field has-addons">
                <div class="control is-expanded">
                    <input type="time" v-model="selectedTime" class="input" />
                </div>
                <div class="control">
                    <div class="buttons has-addons">
                        <button class="button" :class="{ 'is-primary': timeFormat === 'AM' }"
                            @click="timeFormat = 'AM'">
                            AM
                        </button>
                        <button class="button" :class="{ 'is-primary': timeFormat === 'PM' }"
                            @click="timeFormat = 'PM'">
                            PM
                        </button>
                    </div>
                </div>
            </div>

            <div class="selected-datetime">
                <p class="has-text-weight-bold">
                    Jadwal dipilih:
                    {{
                        new Date(selectedDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                        })
                    }}, Pukul {{ selectedTime }} {{ timeFormat }}
                </p>
            </div>

            <div class="schedule-button mt-4">
                <button class="button is-primary is-fullwidth" @click="scheduleNow">
                    Jadwalkan Sekarang
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.datepicker-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @media screen and (min-width: 769px) {
        flex-direction: row;
    }

    .calendar-wrapper {
        flex: 1;
        min-width: 0;

        :deep(.vc-container) {
            border: 1px solid hsl(0, 0%, 86%);
            border-radius: 4px;

            .vc-header {
                padding: 10px 0;
            }

            .vc-weeks {
                padding: 0 10px 10px;
            }

            .vc-day {
                &.vc-day-box-center-center {
                    font-size: 0.9rem;
                }

                &:hover {
                    background-color: hsl(219, 70%, 96%);
                    border-radius: 4px;
                    transition: background-color 0.2s ease;
                }
            }

            .vc-highlight {

                &.vc-highlight-base-start,
                &.vc-highlight-base-end {
                    border-radius: 4px;
                }
            }

            .vc-day-content {
                &.is-selected {
                    color: white;
                    border-radius: 4px;
                }
            }
        }
    }

    .time-picker-wrapper {
        flex: 0 0 250px;

        @media screen and (min-width: 769px) {
            padding-left: 1rem;
            border-left: 1px solid hsl(0, 0%, 86%);
        }

        .selected-datetime {
            margin-top: 1rem;
            padding: 0.75rem;
            background-color: hsl(0, 0%, 96%);
            border-radius: 4px;

            p {
                font-size: 0.9rem;
            }
        }
    }
}
</style>