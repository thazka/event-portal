<script setup lang="ts">
import { ref } from 'vue'
import { useNotyf } from '/@src/composables/notyf'

const props = withDefaults(defineProps(), {
    open: false
})

const emit = defineEmits(['close', 'upload'])
const notyf = useNotyf()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const showProgress = ref(false)

const closeModal = () => {
    emit('close')
    selectedFile.value = null
    isDragging.value = false
    uploadProgress.value = 0
    isUploading.value = false
    showProgress.value = false
}

const handleDragEnter = () => {
    isDragging.value = true
}

const handleDragLeave = () => {
    isDragging.value = false
}

const handleDrop = async (event: DragEvent) => {
    isDragging.value = false
    const files = event.dataTransfer?.files

    if (files && files.length > 0) {
        const file = files[0]
        if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
            selectedFile.value = file
            showFileProgress(file)
            await startUpload()
        } else {
            notyf.error('Unsupported file format. Please upload a file in PNG, JPG, or JPEG format.')
        }
    }
}

const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

// Jika ingin menonaktifkan unggah lewat klik, bisa dihapus:
const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
        const file = input.files[0]
        if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) {
            selectedFile.value = file
            showFileProgress(file)
            await startUpload()
        } else {
            notyf.error('Unsupported file format. Please upload a file in PNG, JPG, or JPEG format.')
        }
    }
}

const showFileProgress = (file: File) => {
    showProgress.value = true
    uploadProgress.value = 0 // Reset progress
}

const startUpload = async () => {
    if (!selectedFile.value) return

    isUploading.value = true
    showProgress.value = true
    uploadProgress.value = 0

    // Simulasi upload progress
    for (let i = 0; i <= 100; i += 10) {
        uploadProgress.value = i
        await new Promise(resolve => setTimeout(resolve, 200))
    }

    // Selesai upload
    uploadProgress.value = 100
    await new Promise(resolve => setTimeout(resolve, 500))

    // Emit event 'upload'
    emit('upload', selectedFile.value)

    // Reset state
    isUploading.value = false
}

const cancelUpload = () => {
    selectedFile.value = null
    isUploading.value = false
    showProgress.value = false
    uploadProgress.value = 0
}

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = 2; 
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']; 

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

</script>

<template>
    <VModal :open="props.open" title="Upload event seat layout" class="modal-dataset" size="medium" actions="center" middletitle @close="closeModal">
        <template #content>
            <div class="file-drop-zone" 
                :class="{ 'is-dragover': isDragging }" 
                @click="triggerFileInput"
                @dragenter.prevent="handleDragEnter" 
                @dragleave.prevent="handleDragLeave" 
                @dragover.prevent 
                @drop.prevent="handleDrop">
                <input 
                    ref="fileInput" 
                    type="file" 
                    accept=".jpg,.png,.jpeg" 
                    class="file-input" 
                    @change="handleFileChange" 
                />
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
                Accepted file type <strong>only .png or .jpg</strong>
            </p>

            <div v-if="showProgress" class="file-progress-container mt-5">
                <div class="file-name mb-0">{{ selectedFile?.name }}</div>
                <div class="progress-wrapper is-flex is-align-items-center  ">
                    <div class="progress-row has-fullwidth mr-5">
                        <div class="file-size">
                            {{ selectedFile ? formatFileSize(selectedFile.size) : '' }}
                        </div>
                        <VProgress size="tiny" :value="uploadProgress" />
                    </div>
                    <VIcon icon="lucide:trash-2" class="delete-btn" @click="cancelUpload"></VIcon>
                </div>
            </div>
        </template>

        <template #action>
            <VButton color="primary" raised :loading="isUploading" :disabled="!selectedFile">
                Upload File
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
