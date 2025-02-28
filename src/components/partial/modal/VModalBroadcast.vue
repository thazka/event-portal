//file VModalBroadcast
<script setup lang="ts">
import { storeBroadcast } from "/@src/composables/event/useBroadcast"

interface Participant {
    id?: number
    no: number
    name: string
    phone: string
    [key: string]: any
}

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    selectedParticipants: {
        type: Array as () => Participant[],
        default: () => []
    },
    isAllSelected: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'upload', 'open-schedule'])
const notyf = useNotyf()

const form = reactive({
    title: '',
    message: ''
})

const loadingForm = ref(false)

// Computed properties for better readability
const selectedParticipantsCount = computed(() => props.selectedParticipants.length)

const selectedParticipantIds = computed(() => {
    // If all participants are selected, return "all" string
    if (props.isAllSelected) {
        return "all"
    }

    // Otherwise return array of IDs
    return props.selectedParticipants
        .filter(participant => participant.id !== undefined)
        .map(participant => participant.id)
})

// Check if form is ready to submit
const isFormValid = computed(() => {
    return form.title.trim() !== '' && form.message.trim() !== ''
})

// Check if button should be disabled
const isDisabled = computed(() => {
    return !isFormValid.value || selectedParticipantsCount.value === 0
})

const openModalSchedule = () => {
    emit('open-schedule')
}

const closeModal = () => {
    resetForm()
    emit('close')
}

const resetForm = () => {
    form.title = ''
    form.message = ''
}

const sendBroadcast = async () => {
    if (isDisabled.value) return

    try {
        loadingForm.value = true

        const params = {
            title: form.title.trim(),
            message: form.message.trim(),
            participants: selectedParticipantIds.value,
            // scheduled_at: ""  // Empty string for immediate sending
        }

        // Validate before sending - only needed for array case since "all" is always valid
        if (params.participants !== "all" && Array.isArray(params.participants) && params.participants.length === 0) {
            notyf.error('No participants selected')
            loadingForm.value = false
            return
        }

        const response = await storeBroadcast(params)

        if (response.status) {
            notyf.success('Broadcast message sent successfully')
            resetForm()
            emit('close')
        } else {
            notyf.error(response.message || 'Failed to send broadcast message')
        }
    } catch (error) {
        console.error('Error sending broadcast:', error)
        notyf.error('An error occurred while sending the broadcast')
    } finally {
        loadingForm.value = false
    }
}
</script>

<template>
    <VModal id="modal-broadcast" :open="props.open" title="Write a message here to send to selected participants"
        class="modal-broadcast" size="medium" actions="between" middletitle noborder @close="closeModal">
        <template #content>
            <VField label="Broadcast Title">
                <VControl>
                    <VInput v-model="form.title" type="text" placeholder="Input Broadcast Title" />
                </VControl>
            </VField>
            <VField label="Message">
                <VControl>
                    <VTextarea v-model="form.message" class="is-primary-focus" rows="5" placeholder="Input Message" />
                </VControl>
                <div class="help is-italic">
                    <p v-if="props.isAllSelected">
                        It will be sent to <strong>all</strong> participants
                    </p>
                    <p v-else>
                        It will be sent to <strong>{{ selectedParticipantsCount }}</strong> selected participants
                    </p>
                </div>
            </VField>
        </template>
        <template #action>
            <VButtons>
                <!-- <VButton color="primary" raised outlined :loading="loadingForm" :disabled="isDisabled" @click="openModalSchedule">
                    Schedule
                </VButton> -->
                <VButton color="primary" raised :loading="loadingForm" :disabled="isDisabled" @click="sendBroadcast">
                    Send Now
                </VButton>
            </VButtons>
        </template>
    </VModal>
</template>

<style lang="scss" scoped>
.help {
    color: #999999;
}
</style>