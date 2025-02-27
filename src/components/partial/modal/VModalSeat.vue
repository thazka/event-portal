<script setup lang="ts">
import { storeSeat, updateSeat } from '/@src/composables/event/useSeats';

interface SeatType {
    type: 'create' | 'file' | 'edit' | undefined
}

const props = withDefaults(defineProps<{
    open?: boolean;
    type?: SeatType['type'];
    seatData?: any;
}>(), {
    open: false,
    type: '' as SeatType['type'],
    seatData: null
})

const emit = defineEmits(['close', 'upload', 'submit'])
const notyf = useNotyf()

const form = reactive({
    id: 0,
    name: ''
})

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const showProgress = ref(false)

const isCreateMode = computed(() => props.type === 'create')
const isEditMode = computed(() => props.type === 'edit')
const isFileMode = computed(() => props.type === 'file')
const isDisabled = computed(() => isFileMode.value ? false : !form.name)
const acceptedFormats = ['.xls', '.xlsx']

const isValidFileFormat = (filename: string): boolean =>
    acceptedFormats.some(format => filename.endsWith(format))

const closeModal = () => emit('close')

const handleDragEnter = () => { isDragging.value = true }
const handleDragLeave = () => { isDragging.value = false }
const triggerFileInput = () => fileInput.value?.click()

const processFile = async (file: File) => {
    if (isValidFileFormat(file.name)) {
        selectedFile.value = file
        showFileProgress()
        await startUpload()
    } else {
        notyf.error(`Unsupported file format. Please upload a file in ${acceptedFormats.join(' or ')} format.`)
    }
}

const handleDrop = async (event: DragEvent) => {
    isDragging.value = false
    const file = event.dataTransfer?.files?.[0]
    if (file) await processFile(file)
}

const handleFileChange = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) await processFile(file)
}

const showFileProgress = () => {
    showProgress.value = true
    uploadProgress.value = 0
}

const startUpload = async () => {
    if (!selectedFile.value) return

    isUploading.value = true
    showProgress.value = true
    uploadProgress.value = 0

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
        uploadProgress.value = i
        await new Promise(resolve => setTimeout(resolve, 200))
    }

    uploadProgress.value = 100
    await new Promise(resolve => setTimeout(resolve, 500))

    emit('upload', selectedFile.value)
    isUploading.value = false
}

const cancelUpload = () => {
    selectedFile.value = null
    isUploading.value = false
    showProgress.value = false
    uploadProgress.value = 0
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const submit = async () => {
    if (isCreateMode.value) {
        storeSeat({ name: form.name }).then(() => {
            notyf.success('Seat created successfully')
            emit('submit')
            closeModal()
        }).catch(() => {
            notyf.error('Failed to create seat')
        })
    } else if (isEditMode.value) {
        updateSeat(form.id, { name: form.name }).then(() => {
            notyf.success('Seat updated successfully')
            emit('submit')
            closeModal()
        }).catch(() => {
            notyf.error('Failed to update seat')
        })
    } else if (isFileMode.value) {
        if (selectedFile.value) {
            await startUpload()
            emit('submit')
            closeModal()
        }
    }
}

const getModalTitle = computed(() => {
    if (isCreateMode.value) return 'Create new seat'
    if (isEditMode.value) return 'Edit seat'
    return 'Upload your seat database'
})

const getSubmitButtonText = computed(() => {
    if (isCreateMode.value) return 'Create'
    if (isEditMode.value) return 'Update'
    return 'Upload'
})

const resetForm = () => {
    form.id = 0
    form.name = ''
    selectedFile.value = null
    isUploading.value = false
    showProgress.value = false
    uploadProgress.value = 0
}

// Watch for changes in seatData to update the form
watch(() => props.seatData, (newValue) => {
    if (newValue) {
        form.id = newValue.id
        form.name = newValue.name
    } else {
        resetForm()
    }
}, { immediate: true })


watch(() => props.open, (isOpen) => {
    if (!isOpen) {
        resetForm()
    }
})

</script>

<template>
    <VModal :open="props.open" :title="getModalTitle" class="modal-broadcast" size="medium" actions="center" middletitle
        noborder @close="closeModal">
        <template #content>
            <template v-if="isCreateMode || isEditMode">
                <VField label="Seat Name">
                    <VControl>
                        <VInput v-model="form.name" type="text" placeholder="Example: LEFT - A1" />
                    </VControl>
                </VField>
            </template>
            <template v-else>
                <div class="file-drop-zone" :class="{ 'is-dragover': isDragging }" @dragenter.prevent="handleDragEnter"
                    @dragleave.prevent="handleDragLeave" @dragover.prevent @drop.prevent="handleDrop"
                    @click="triggerFileInput">
                    <input ref="fileInput" type="file" :accept="acceptedFormats.join(',')" class="file-input"
                        @change="handleFileChange" />
                    <div class="upload-content">
                        <span class="icon is-large">
                            <VIcon icon="lucide:upload-cloud" size="48" />
                        </span>
                        <p class="notes-upload mt-2">
                            Select or drag file here
                        </p>
                    </div>
                </div>

                <p class="notes mt-2">
                    Accepted file type <strong>only {{ acceptedFormats.join(' or ') }}</strong>
                </p>

                <div v-if="showProgress" class="file-progress-container mt-5">
                    <div class="file-name mb-0">{{ selectedFile?.name }}</div>
                    <div class="progress-wrapper is-flex is-align-items-center">
                        <div class="progress-row has-fullwidth mr-5">
                            <div class="file-size">
                                {{ selectedFile ? formatFileSize(selectedFile.size) : '' }}
                            </div>
                            <VProgress size="tiny" :value="uploadProgress" />
                        </div>
                        <VIcon icon="lucide:trash-2" class="delete-btn" @click="cancelUpload" />
                    </div>
                </div>
            </template>
        </template>
        <template #action>
            <VButton color="primary" raised :loading="isUploading" :disabled="isDisabled" @click="submit">
                {{ getSubmitButtonText }}
            </VButton>
        </template>
    </VModal>
</template>

<style lang="scss" scoped>
.help {
    color: #999999;
}

.file-drop-zone {
    border: 2px dashed #dbdbdb;
    border-radius: 6px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;

    &.is-dragover {
        border-color: #3273dc;
        background-color: rgba(#3273dc, 0.05);
    }

    &:hover {
        border-color: #b5b5b5;
    }
}

.file-input {
    display: none;
}

.upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    .icon {
        color: #dbdbdb;
        font-size: 35px;
    }

    .notes-upload {
        font-family: Roboto;
        font-weight: 400;
        font-size: 14px;
        line-height: 21px;
        color: #a2a5b9;
    }
}

.file-progress-container {
    border: 1px solid #dbdbdb;
    border-radius: 6px;
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 80px;

    .progress-wrapper {
        width: 180px;
    }
}

.file-name {
    margin-bottom: 0.25rem;
    font-family: Roboto;
    font-weight: 400;
    font-size: 15.4px;
    line-height: 23.1px;
    border: none !important;
}

.file-size {
    font-size: 14px;
    color: #666;
}

.delete-btn {
    border: none;
    color: #666;
    cursor: pointer;
    margin: 0 10px;

    &:hover {
        color: #ff3860;
    }
}

.notes {
    font-family: Roboto;
    font-weight: 400;
    font-style: italic;
    font-size: 12px;
    line-height: 18px;
}
</style>