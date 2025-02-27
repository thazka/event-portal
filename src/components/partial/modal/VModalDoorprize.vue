<script setup lang="ts">
import { storeDoorprize } from '/@src/composables/event/useDoorprize'

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'upload'])
const notyf = useNotyf()

const form = reactive({
    title: '',
    message: '',
    total: 1, // Default value untuk total
    image: null as File | null,
    imageName: ''
})

const loadingForm = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const isDisabled = computed(() => !form.title || !form.image)

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const resetForm = () => {
    form.title = ''
    form.message = ''
    form.total = 1
    form.image = null
    form.imageName = ''

    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const closeModal = () => {
    resetForm()
    emit('close')
}

const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        notyf.error('Please upload only .jpg or .png files')
        input.value = ''
        return
    }

    if (file.size > MAX_FILE_SIZE) {
        notyf.error('File size should not exceed 5MB')
        input.value = ''
        return
    }

    form.image = file
    form.imageName = file.name
}

const handleSubmit = async (immediate: boolean = false) => {
    if (isDisabled.value) return

    try {
        loadingForm.value = true

        const formData = new FormData()
        formData.append('name', form.title)
        formData.append('total', form.total.toString())

        if (form.image) {
            formData.append('photo', form.image)
        }

        await storeDoorprize(formData)
        notyf.success('Doorprize created successfully')
        closeModal()
    } catch (error) {
        notyf.error('Failed to submit doorprize. Please try again.')
        console.error('Error submitting doorprize:', error)
    } finally {
        loadingForm.value = false
    }
}

const clearFile = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()

    form.image = null
    form.imageName = ''

    if (fileInput.value) {
        fileInput.value.value = ''
    }
}
</script>

<template>
    <VModal :open="props.open" title="Create new doorprize" class="modal-broadcast" size="medium" actions="center"
        middletitle noborder @close="closeModal">
        <template #content>
            <div class="columns">
                <div class="column">
                    <VField label="Doorprize Name">
                        <VControl>
                            <VInput v-model="form.title" type="text" placeholder="Example: Honda Civic Turbo" />
                        </VControl>
                    </VField>
                </div>
                <div class="column">
                    <VField label="Total Winner" addons>
                        <VControl expanded>
                            <VInput v-model="form.total" type="number" min="1" placeholder="Number of winners" />
                        </VControl>
                        <VControl>
                            <VButton static>
                                People
                            </VButton>
                        </VControl>
                    </VField>
                </div>
            </div>

            <VField grouped label="Select Image" class="is-flex-direction-column">
                <VControl>
                    <div class="file has-name has-fullwidth">
                        <label class="file-label has-fullwidth">
                            <input ref="fileInput" class="file-input" type="file" accept=".jpg,.jpeg,.png"
                                @change="handleFileUpload">
                            <span class="file-cta">
                                <span class="file-label">Upload image</span>
                            </span>
                            <span class="file-name light-text has-fullwidth">
                                {{ form.imageName || 'No file selected' }}
                                <VIcon v-if="form.image" icon="lucide:x" class="clear-icon" @click.stop="clearFile" />
                            </span>
                        </label>
                    </div>
                    <span class="help">Accepted file type is .png or .jpg</span>
                </VControl>
            </VField>
        </template>

        <template #action>
            <VButton color="primary" raised :loading="loadingForm" :disabled="isDisabled" @click="handleSubmit(true)">
                Create
            </VButton>
        </template>
    </VModal>
</template>

<style lang="scss" scoped>
.help {
    color: #999999;
}

.file-name {
    max-width: unset;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.clear-icon {
    cursor: pointer;
    margin-left: 8px;
}
</style>