<script setup lang="ts">
const props = withDefaults(defineProps(), {
    open: false
})

const emit = defineEmits(['close', 'upload'])
const notyf = useNotyf()

const form = reactive({
    title: '',
    message: ''
})

const loadingForm = ref(false)

const isDisabled = computed(() => {
    return !form.title && !form.message
})

const closeModal = () => {
    emit('close')
}

</script>

<template>
    <VModal :open="props.open" title="Write a message here to send to selected participants" class="modal-broadcast"
        size="medium" actions="between" middletitle noborder @close="closeModal">
        <template #content>
            <VField label="Broadcast Title">
                <VControl>
                    <VInput v-model="form.title" type="text" placeholder="Input Broadcast Title" />
                </VControl>
            </VField>
            <VField label="Message">
                <VControl>
                    <VTextarea v-model="form.message" class="is-primary-focus" rows="5" placeholder="Input Message Message" />
                </VControl>
                <span class="help is-italic">
                    It will be sent to <strong>170</strong> selected participants
                </span>
            </VField>
        </template>
        <template #action>
            <VButtons>
                <VButton color="primary" raised outlined :loading="loadingForm" :disabled="isDisabled">
                    Schedule
                </VButton>
                <VButton color="primary" raised :loading="loadingForm" :disabled="isDisabled">
                    Send Now
                </VButton>
            </VButtons>
        </template>
    </VModal>
</template>

<style lang="scss"scoped>
.help {
    color: #999999;
}
</style>