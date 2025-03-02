<script setup lang="ts">
import { ref, withDefaults, defineEmits, defineProps, computed } from 'vue'
import { useNotyf } from '/@src/composables/notyf'
import { fetchEventParticipants, importParticipant } from '/@src/composables/event/useParticipants'
import { fetchEventAnalytics, fetchLayoutEvent } from '/@src/composables/event/useAnalytics'
import { fetchSeatList } from '/@src/composables/event/useSeats'

interface FileUploadProps {
    open: boolean
    maxFileSize?: number // in bytes
    allowedFileTypes?: string[]
    onSuccess?: (data: any) => void
    onError?: (error: any) => void
    filter?: any
}

const props = withDefaults(defineProps<FileUploadProps>(), {
    open: false,
    maxFileSize: 10 * 1024 * 1024,
    allowedFileTypes: () => ['.xls', '.xlsx'],
    onSuccess: undefined,
    onError: undefined,
    filter: () => {}
})

const emit = defineEmits<{
    (e: 'close'): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const isImporting = ref(false)
const uploadProgress = ref(0)
const showProgress = ref(false)
const errorMessage = ref('')
const notyf = useNotyf()

const resetState = () => {
    selectedFile.value = null
    isDragging.value = false
    uploadProgress.value = 0
    isUploading.value = false
    isImporting.value = false
    showProgress.value = false
    errorMessage.value = ''

    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const closeModal = () => {
    resetState()
    emit('close')
}

const handleDragEnter = () => {
    isDragging.value = true
}

const handleDragLeave = () => {
    isDragging.value = false
}

const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

const isValidFileType = (file: File): boolean => {
    return props.allowedFileTypes.some(type =>
        file.name.toLowerCase().endsWith(type.toLowerCase())
    )
}

const isValidFileSize = (file: File): boolean => {
    return file.size <= props.maxFileSize
}

const processSelectedFile = async (file: File) => {
    errorMessage.value = ''

    if (!isValidFileType(file)) {
        const allowedTypes = props.allowedFileTypes.join(', ')
        errorMessage.value = `Unsupported file format. Please upload ${allowedTypes} file.`
        notyf.error(errorMessage.value)
        return
    }

    if (!isValidFileSize(file)) {
        errorMessage.value = `File is too large. Maximum size is ${formatFileSize(props.maxFileSize)}.`
        notyf.error(errorMessage.value)
        return
    }

    selectedFile.value = file
    showProgress.value = true
    uploadProgress.value = 0

    try {
        await startUpload()
    } catch (error) {
        handleUploadError(error)
    }
}

const handleDrop = async (event: DragEvent) => {
    isDragging.value = false
    event.preventDefault()

    const files = event.dataTransfer?.files

    if (files && files.length > 0) {
        await processSelectedFile(files[0])
    }
}

const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement

    if (input.files && input.files.length > 0) {
        await processSelectedFile(input.files[0])
    }
}

const startUpload = async () => {
    if (!selectedFile.value) return

    isUploading.value = true
    showProgress.value = true
    uploadProgress.value = 0

    try {
        uploadProgress.value = 30

        await new Promise(resolve => setTimeout(resolve, 100))
        uploadProgress.value = 100

    } catch (error) {
        handleUploadError(error)
    } finally {
        isUploading.value = false
    }
}

const importParticipants = async () => {
    if (!selectedFile.value) return

    isImporting.value = true
    uploadProgress.value = 0

    try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)

        uploadProgress.value = 30

        const result = await importParticipant(formData)

        uploadProgress.value = 100

        if (result.success === false || result.message?.includes('error')) {
            throw new Error(result.message || 'Failed to import participants')
        }

        notyf.success('Participants imported successfully!')

        if (props.onSuccess) {
            props.onSuccess(result)
        }

        setTimeout(() => {
            Promise.all([
                fetchEventParticipants(props.filter),
                fetchEventAnalytics(props.filter?.event_id),
                fetchSeatList({
                    offset: 99
                }),
                fetchLayoutEvent(props.filter.event_id)
            ])
            closeModal()
        }, 1000)

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to import participants'
        notyf.error(errorMsg)

        if (props.onError) {
            props.onError(error)
        }

        errorMessage.value = errorMsg
    } finally {
        isImporting.value = false
    }
}

const cancelUpload = () => {
    resetState()
}

const handleUploadError = (error: unknown) => {
    const errorMsg = error instanceof Error ? error.message : 'Failed to upload file'
    notyf.error(errorMsg)
    errorMessage.value = errorMsg
    isUploading.value = false
    isImporting.value = false
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = 2
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const allowedTypesText = computed(() => {
    return props.allowedFileTypes.join(' or ')
})
</script>

<template>
    <VModal :open="props.open" title="Import Participants Dataset" class="modal-dataset" size="medium" actions="center"
        middletitle noborder @close="closeModal">
        <template #content>
            <!-- File Drop Zone -->
            <div class="file-drop-zone" :class="{ 'is-dragover': isDragging, 'has-error': errorMessage }"
                @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave" @dragover.prevent
                @drop.prevent="handleDrop" @click="triggerFileInput">
                <input ref="fileInput" type="file" :accept="props.allowedFileTypes.join(',')" class="file-input"
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

            <!-- File Type Notes -->
            <p class="notes mt-2">
                Accepted file type <strong>{{ allowedTypesText }}</strong>
                <span v-if="props.maxFileSize"> • Max file size: {{ formatFileSize(props.maxFileSize) }}</span>
            </p>

            <!-- Error Message -->
            <p v-if="errorMessage" class="error-message mt-2">
                {{ errorMessage }}
            </p>

            <!-- File Progress -->
            <div v-if="showProgress" class="file-progress-container mt-5">
                <div class="file-details">
                    <div class="file-name has-borderless p-0">{{ selectedFile?.name }}</div>
                    <div class="file-size">
                        {{ selectedFile ? formatFileSize(selectedFile.size) : '' }}
                    </div>
                </div>

                <div class="progress-wrapper is-flex is-align-items-center">
                    <div class="progress-row has-fullwidth mr-5">
                        <VProgress size="tiny" :value="uploadProgress"
                            :class="{ 'is-primary': !isImporting, 'is-info': isImporting }" />
                        <p v-if="isImporting" class="upload-status-text">Processing file...</p>
                    </div>
                    <VIcon v-if="!isImporting" icon="lucide:trash-2" class="delete-btn" @click.stop="cancelUpload" />
                </div>
            </div>
        </template>

        <template #action>
            <VButton color="primary" raised :loading="isImporting"
                :disabled="!selectedFile || isImporting || !!errorMessage" @click="importParticipants">
                {{ isImporting ? 'Importing...' : 'Import Participants' }}
            </VButton>
        </template>
    </VModal>
</template>

<style lang="scss" scoped>
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

    &.has-error {
        border-color: #ff3860;
        background-color: rgba(#ff3860, 0.05);
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
        transition: color 0.3s ease;
    }

    .notes-upload {
        font-family: Roboto, sans-serif;
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
    flex-direction: column;
    gap: 0.5rem;

    .file-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .progress-wrapper {
        width: 100%;
    }
}

.file-name {
    font-family: Roboto, sans-serif;
    font-weight: 500;
    font-size: 15px;
    line-height: 23px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 70%;
}

.file-size {
    font-size: 14px;
    color: #666;
}

.progress-row {
    flex: 1;
}

.delete-btn {
    color: #666;
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
        color: #ff3860;
    }
}

.notes {
    font-family: Roboto, sans-serif;
    font-weight: 400;
    font-style: italic;
    font-size: 12px;
    line-height: 18px;
    color: #666;
}

.error-message {
    color: #ff3860;
    font-size: 13px;
    margin-top: 0.5rem;
}

.upload-status-text {
    font-size: 12px;
    color: #3273dc;
    margin-top: 0.25rem;
    text-align: center;
}
</style>