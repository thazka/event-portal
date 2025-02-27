<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { DatePicker } from 'v-calendar';
import 'v-calendar/style.css';

/**
 * Define props with proper types and defaults
 */
const props = defineProps({
    modelValue: {
        type: Date,
        default: () => new Date()
    },
    initialView: {
        type: String,
        default: 'month'
    }
});

/**
 * Define emits with validation
 */
const emit = defineEmits({
    'update:modelValue': (value: Date) => value instanceof Date,
    'schedule': (value: { date: Date, time: string, format: string }) =>
        value && value.date instanceof Date && typeof value.time === 'string' && ['AM', 'PM'].includes(value.format)
});

/**
 * Reactive state with proper validation
 */
const selectedDate = ref(new Date(props.modelValue));
const hours = ref('01');
const minutes = ref('00');
const timeFormat = ref('AM');

/**
 * Initial setup and watches
 */
onMounted(() => {
    validateAndSetTime();
});

watch(() => props.modelValue, (newValue) => {
    if (newValue && newValue instanceof Date) {
        selectedDate.value = new Date(newValue);
    }
}, { deep: true });

/**
 * Time validation and formatting
 */
const validateAndSetTime = () => {
    // Extract time from model value
    const date = new Date(props.modelValue);
    let hrs = date.getHours();
    const mins = date.getMinutes();

    // Format for 12-hour clock
    if (hrs >= 12) {
        timeFormat.value = 'PM';
        hrs = hrs === 12 ? 12 : hrs - 12;
    } else {
        timeFormat.value = 'AM';
        hrs = hrs === 0 ? 12 : hrs;
    }

    // Format with leading zeros
    hours.value = hrs.toString().padStart(2, '0');
    minutes.value = mins.toString().padStart(2, '0');
};

/**
 * Input validation for hours
 */
const validateHours = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
        value = '01';
    } else if (numValue < 1) {
        value = '01';
    } else if (numValue > 12) {
        value = '12';
    }

    hours.value = value.padStart(2, '0');
};

/**
 * Input validation for minutes
 */
const validateMinutes = (event: Event) => {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');

    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
        value = '00';
    } else if (numValue < 0) {
        value = '00';
    } else if (numValue > 59) {
        value = '59';
    }

    minutes.value = value.padStart(2, '0');
};

/**
 * Compute and emit full date time
 */
const updateDateTime = () => {
    const dateTime = new Date(selectedDate.value);
    let hrs = parseInt(hours.value, 10);

    // Convert to 24-hour format
    if (timeFormat.value === 'PM' && hrs < 12) {
        hrs += 12;
    } else if (timeFormat.value === 'AM' && hrs === 12) {
        hrs = 0;
    }

    dateTime.setHours(hrs, parseInt(minutes.value, 10), 0, 0);
    emit('update:modelValue', dateTime);

    return dateTime;
};

/**
 * Handle date selection
 */
const onDateSelected = (newDate: Date) => {
    selectedDate.value = newDate;
    console.log(newDate)
    updateDateTime();
};

/**
 * Toggle time format between AM/PM
 */
const toggleTimeFormat = (format: 'AM' | 'PM') => {
    timeFormat.value = format;
    updateDateTime();
};

/**
 * Emit schedule event with complete data
 */
const handleSchedule = () => {
    const finalDateTime = updateDateTime();
    emit('schedule', {
        date: finalDateTime,
        time: `${hours.value}:${minutes.value}`,
        format: timeFormat.value
    });
};

/**
 * Computed attributes for calendar
 */
const calendarAttributes = computed(() => {
    return [
        {
            key: 'today',
            dot: true,
            dates: new Date()
        },
        {
            key: 'selected',
            highlight: true,
            dates: selectedDate.value
        }
    ];
});
</script>

<template>
    <div class="vc-date-component">
        <!-- Calendar component with proper accessibility -->
        <DatePicker v-model="selectedDate" :attributes="calendarAttributes"
            :initial-view="initialView" @dayclick="onDateSelected" :is-required="false" />

        <!-- Time selector with improved accessibility -->
        <div class="vc-time-selector">
            <label for="time-input" class="vc-time-label">Time</label>

            <div class="vc-time-input-container">
                <!-- Time input with validation -->
                <div class="vc-time-inputs">
                    <input id="time-hours" type="text" class="vc-hours-input" v-model="hours" maxlength="2"
                        aria-label="Hours" @blur="validateHours($event); updateDateTime()" />
                    <span class="vc-time-separator">:</span>
                    <input id="time-minutes" type="text" class="vc-minutes-input" v-model="minutes" maxlength="2"
                        aria-label="Minutes" @blur="validateMinutes($event); updateDateTime()" />
                </div>

                <!-- AM/PM selector -->
                <div class="vc-time-format-selector" role="radiogroup" aria-label="Time format">
                    <button type="button" class="vc-format-button" :class="{ 'vc-active': timeFormat === 'AM' }"
                        @click="toggleTimeFormat('AM')" aria-pressed="timeFormat === 'AM'" role="radio">
                        AM
                    </button>
                    <button type="button" class="vc-format-button" :class="{ 'vc-active': timeFormat === 'PM' }"
                        @click="toggleTimeFormat('PM')" aria-pressed="timeFormat === 'PM'" role="radio">
                        PM
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.vc-date-component {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    max-width: 380px;
    margin: 0 auto;

    .vc-container {
        width: 100%;
        border: none;
    }
}

/* Calendar styling overrides with CSS variables for theming */
:deep(.vc-container) {
    --vc-accent-50: #ebf5fa;
    --vc-accent-100: #cbe6f3;
    --vc-accent-200: #a8d5ec;
    --vc-accent-300: #77bde0;
    --vc-accent-400: #4da3d4;
    --vc-accent-500: #2b95d6;
    --vc-accent-600: #1e7ab7;
    --vc-accent-700: #1a5c8c;
    --vc-accent-800: #134263;
    --vc-accent-900: #0d2e45;

    border: none !important;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    width: 100%;
}

:deep(.vc-header) {
    padding: 10px;
}

:deep(.vc-weeks) {
    padding: 0 8px 8px;
}

:deep(.vc-day) {
    border-radius: 50%;
}

:deep(.vc-day-content) {
    border-radius: 50%;
    width: 36px;
    height: 36px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.vc-highlight) {
    background-color: var(--vc-accent-500);
    color: white;
    border-radius: 50%;
}

:deep(.vc-title) {
    font-weight: 500;
    font-size: 16px;
}

:deep(.vc-nav-title) {
    color: var(--vc-accent-900);
}

:deep(.vc-arrow) {
    color: var(--vc-accent-700);
}

/* Time selector styling */
.vc-time-selector {
    margin-top: 16px;
    padding: 0 16px 16px;
}

.vc-time-label {
    font-size: 14px;
    margin-bottom: 8px;
    color: #555;
    display: block;
}

.vc-time-input-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.vc-time-inputs {
    display: flex;
    align-items: center;
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.vc-hours-input,
.vc-minutes-input {
    width: 24px;
    border: none;
    outline: none;
    text-align: center;
    font-size: 14px;
}

.vc-time-separator {
    margin: 0 4px;
    color: #555;
}

.vc-time-format-selector {
    display: flex;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
}

.vc-format-button {
    padding: 8px 12px;
    border: none;
    background: white;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.vc-format-button.vc-active {
    background-color: var(--vc-accent-500);
    color: white;
}

/* Focus states for accessibility */
.vc-format-button:focus,
.vc-hours-input:focus,
.vc-minutes-input:focus {
    outline: 2px solid var(--vc-accent-400);
    outline-offset: 1px;
}

/* Responsive styles */
@media (max-width: 480px) {
    .vc-date-component {
        max-width: 100%;
    }

    :deep(.vc-container) {
        width: 100%;
    }
}
</style>