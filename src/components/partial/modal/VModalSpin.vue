<script setup lang="ts">
import mainLogo from '/@src/images/illustrations/login/logo-main.svg'

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
    <VModal :open="props.open" title="Modal Spin" is-spin use-custom-header size="medium" nofooter actions="center" middletitle
        noborder @close="closeModal">
        <template #header>
            <VButton icon="lucide:arrow-left" color="primary" raised outlined class="mr-auto button-back"
                @click="emit('close')">
                Back
            </VButton>

            <img :src="mainLogo" alt="" />

        </template>
        <template #content>
            <div class="drawing-wrapper">
                <VCard radius="smooth" class="participants-area">
                    <h3 class="title is-5 mb-2">
                        Iam an S-Card
                    </h3>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quibusnam praeteritis? At
                        multis se probavit. Quoniam, si dis placet, ab Epicuro loqui discimus. Et ille
                        ridens.
                    </p>
                </VCard>
                <VCard radius="smooth" class="doorprize-area">
                    <h3 class="title is-5 mb-2">
                        Iam an S-Card
                    </h3>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quibusnam praeteritis? At
                        multis se probavit. Quoniam, si dis placet, ab Epicuro loqui discimus. Et ille
                        ridens.
                    </p>
                </VCard>
            </div>
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

.button-back {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);

    :deep(.icon) {
        display: flex;
        align-items: center;
    }
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

.drawing-wrapper {
    display: flex;
    width: 100%;
    justify-content: space-between;

    .participants-area {
        max-width: 400px;
    }

    .doorprize-area {
        max-width: 302px;
    }
}
</style>