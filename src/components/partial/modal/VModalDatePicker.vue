<script setup lang="ts">
const props = withDefaults(defineProps(), {
    open: false,
});

const emit = defineEmits(["close", "upload"]);
const notyf = useNotyf();

const selectedDateTime = ref(new Date());

const handleSchedule = (scheduleData: any) => {
  console.log('Jadwal yang dipilih:', scheduleData);
};

const closeModal = () => {
    emit("close");
};
</script>

<template>
    <VModal id="modal-date" :open="props.open" title="" size="small" actions="between" middletitle noborder noheader @close="closeModal">
        <template #content>
            <DateComponent v-model="selectedDateTime" @schedule="handleSchedule" />
        </template>
    </VModal>
</template>

<style lang="scss" scoped>
.help {
    color: #999999;
}
</style>
