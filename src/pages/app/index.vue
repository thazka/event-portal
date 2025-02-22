<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'

interface ExcelData {
    [key: string]: any
}

const tableData = ref<ExcelData[]>([])
const headers = ref<string[]>([])
const fileName = ref<string>('')
const error = ref<string>('')
const isDragging = ref<boolean>(false)
const pageTitle = useVueroContext<string>('page-title')

onMounted(() => {
  pageTitle.value = 'Dashboard Analytics'
})


const processExcelFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        error.value = 'Please upload only Excel files (.xlsx or .xls)'
        return
    }

    fileName.value = file.name

    const reader = new FileReader()
    reader.onload = (e) => {
        try {
            const data = e.target?.result
            const workbook = XLSX.read(data, { type: 'binary' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]

            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            if (jsonData.length === 0) {
                error.value = 'No data found in the Excel file'
                return
            }

            // Get headers from the first row
            // headers.value = Object.keys(jsonData[0])
            // tableData.value = jsonData
            error.value = ''
        } catch (err) {
            error.value = 'Error processing the Excel file'
            console.error(err)
        }
    }

    reader.onerror = () => {
        error.value = 'Error reading the file'
    }

    reader.readAsBinaryString(file)
}

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return
    processExcelFile(target.files[0])
}

const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false
}

const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
}

const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDragging.value = false

    const files = e.dataTransfer?.files
    if (!files?.length) return

    processExcelFile(files[0])
}

const clearData = () => {
    tableData.value = []
    headers.value = []
    fileName.value = ''
    error.value = ''
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) input.value = ''
}
</script>

<template>
    <div class="container">
        <div class="section">
            <div class="drop-zone" :class="{ 'is-dragging': isDragging }" @dragenter="handleDragEnter"
                @dragleave="handleDragLeave" @dragover="handleDragOver" @drop="handleDrop">
                <div class="field">
                    <div class="file has-name is-fullwidth">
                        <label class="file-label">
                            <input class="file-input" type="file" accept=".xlsx,.xls" @change="handleFileUpload">
                            <span class="file-cta">
                                <span class="file-icon">
                                    <i class="fas fa-upload"></i>
                                </span>
                                <span class="file-label">
                                    Choose Excel file...
                                </span>
                            </span>
                            <span class="file-name" v-if="fileName">
                                {{ fileName }}
                            </span>
                        </label>
                    </div>
                </div>

                <div class="drop-message">
                    <p class="has-text-centered">
                        <i class="fas fa-file-excel fa-2x mb-2"></i>
                        <br>
                        Drag and drop your Excel file here
                    </p>
                </div>
            </div>

            <div v-if="error" class="notification is-danger">
                {{ error }}
            </div>

            <div v-if="tableData.length" class="box">
                <div class="is-flex is-justify-content-space-between mb-4">
                    <h2 class="title is-4">Excel Data</h2>
                    <button class="button is-light" @click="clearData">
                        Clear Data
                    </button>
                </div>

                <div class="table-container">
                    <table class="table is-bordered is-striped is-hoverable is-fullwidth">
                        <thead>
                            <tr>
                                <th v-for="header in headers" :key="header">{{ header }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, index) in tableData" :key="index">
                                <td v-for="header in headers" :key="header">
                                    {{ row[header] }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.drop-zone {
    position: relative;
    padding: 2rem;
    border: 2px dashed #dbdbdb;
    border-radius: 4px;
    background-color: #fafafa;
    transition: all 0.3s ease;

    &.is-dragging {
        background-color: #f0f0f0;
        border-color: #b5b5b5;
    }

    .drop-message {
        margin-top: 1.5rem;
        color: #7a7a7a;

        i {
            color: #4a4a4a;
        }
    }
}

.table-container {
    max-height: 500px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
}

.file-label {
    width: 100%;
}
</style>