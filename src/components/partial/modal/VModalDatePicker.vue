<script setup lang="ts">
const props = withDefaults(defineProps(), {
    open: false,
});

const emit = defineEmits(["close", "upload"]);
const notyf = useNotyf();
const selectedDate = ref(new Date())

const handleSchedule = (data: { date: Date, time: string, format: string }) => {
  console.log('Jadwal dipilih:', data)  
}

const closeModal = () => {
    emit("close");
};
</script>

<template>
    <Modal id="modal-date" :open="props.open" title="" size="medium" actions="between" middletitle noborder noheader nofooter @close="closeModal">
        <template #content>
            
            <DatePicker
                v-model:date="selectedDate"
                @schedule="handleSchedule"
            />
        </template>
    </Modal>
</template>

<style lang="scss" scoped>
.help {
    color: #999999;
}
</style>
