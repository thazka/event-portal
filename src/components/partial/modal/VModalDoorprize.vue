<script setup lang="ts">
const props = withDefaults(defineProps(), {
    open: false
})

const emit = defineEmits(['close', 'upload'])
const notyf = useNotyf()

const form = reactive({
    title: '',
    message: '',
    image: null as File | null,
    imageName: ''
})

const loadingForm = ref(false)

const isDisabled = computed(() => {
    return !form.title || !form.image
})

const closeModal = () => {
    form.title = ''
    form.message = ''
    form.image = null
    form.imageName = ''
    emit('close')
}

const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
        const file = input.files[0]

        // Validate file type
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            notyf.error('Please upload only .jpg or .png files')
            return
        }

        // Validate file size (e.g., max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            notyf.error('File size should not exceed 5MB')
            return
        }

        form.image = file
        form.imageName = file.name
    }
}

const handleSubmit = async (immediate: boolean = false) => {
    try {
        loadingForm.value = true

        // Create FormData for file upload
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('message', form.message)
        if (form.image) {
            formData.append('image', form.image)
        }
        formData.append('immediate', immediate.toString())

        // Emit upload event with form data
        emit('upload', formData)

        notyf.success(`Doorprize ${immediate ? 'sent' : 'scheduled'} successfully`)
        closeModal()
    } catch (error) {
        notyf.error('Failed to submit doorprize. Please try again.')
        console.error('Error submitting doorprize:', error)
    } finally {
        loadingForm.value = false
    }
}

const clearFile = (event: Event) => {
    // Prevent event from bubbling up to parent elements
    event.preventDefault()
    event.stopPropagation()
    
    form.image = null
    form.imageName = ''
    // Reset the file input
    const fileInput = document.querySelector('.file-input') as HTMLInputElement
    if (fileInput) {
        fileInput.value = ''
    }
}
</script>

<template>
    <VModal :open="props.open" title="Create new doorprize" class="modal-broadcast" size="medium" actions="center"
        middletitle noborder @close="closeModal">
        <template #content>
            <VField label="Doorprize Name">
                <VControl>
                    <VInput v-model="form.title" type="text" placeholder="Example: Honda Civic Turbo" />
                </VControl>
            </VField>
            <VField grouped label="Select Image" class="is-flex-direction-column">
                <VControl>
                    <div class="file has-name has-fullwidth">
                        <label class="file-label has-fullwidth">
                            <input class="file-input" type="file" accept=".jpg,.jpeg,.png" @change="handleFileUpload">
                            <span class="file-cta">
                                <span class="file-label">Upload image</span>
                            </span>
                            <span class="file-name light-text has-fullwidth">
                                {{ form.imageName || 'No file selected' }}

                                <VIcon 
                                    v-if="form.image"
                                    icon="lucide:x" 
                                    class="clear-icon"
                                    @click.stop="clearFile"
                                />
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