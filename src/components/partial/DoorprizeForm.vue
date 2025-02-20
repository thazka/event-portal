<script setup lang="ts">
import { ref } from 'vue';
import type { Doorprize } from '/@src/interface/DoorprizeInterface';

const emit = defineEmits(['save']);
const props = defineProps<{
    editData?: Doorprize;
}>();

const urutan = ref(props.editData?.urutan || 0);
const name = ref(props.editData?.name || '');
const doorprize = ref(props.editData?.doorprize || '');
const gambar = ref(props.editData?.gambar || '');
const dragActive = ref(false);

const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    dragActive.value = false;

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        handleImage(file);
    }
};

const handleImage = async (file: File) => {
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            gambar.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    }
};

const handleSubmit = () => {
    emit('save', {
        id: props.editData?.id || Date.now(),
        urutan: urutan.value,
        name: name.value,
        doorprize: doorprize.value,
        gambar: gambar.value
    });

    // Reset form if not editing
    if (!props.editData) {
        urutan.value = 0;
        name.value = '';
        doorprize.value = '';
        gambar.value = '';
    }
};
</script>

<template>
    <form @submit.prevent="handleSubmit" class="box">
        <div class="field">
            <label class="label">Urutan</label>
            <div class="control">
                <input v-model="urutan" type="number" class="input" required />
            </div>
        </div>

        <div class="field">
            <label class="label">Name</label>
            <div class="control">
                <input v-model="name" type="text" class="input" required />
            </div>
        </div>

        <div class="field">
            <label class="label">Doorprize</label>
            <div class="control">
                <input v-model="doorprize" type="text" class="input" required />
            </div>
        </div>

        <div class="field">
            <label class="label">Gambar</label>
            <div class="control dropzone" :class="{ 'is-active': dragActive }" @dragenter.prevent="dragActive = true"
                @dragleave.prevent="dragActive = false" @dragover.prevent @drop="handleDrop">
                <input type="file" accept="image/*" class="file-input"
                    @change="(e) => handleImage((e.target as HTMLInputElement).files?.[0])" />
                <div class="dropzone-content">
                    <span v-if="!gambar">Drag and drop image here or click to upload</span>
                    <img v-else :src="gambar" alt="Preview" class="preview-image" />
                </div>
            </div>
        </div>

        <div class="field">
            <div class="control">
                <button type="submit" class="button is-primary">
                    {{ props.editData ? 'Update' : 'Save' }}
                </button>
            </div>
        </div>
    </form>
</template>

<style lang="scss" scoped>
.dropzone {
    border: 2px dashed #dbdbdb;
    border-radius: 4px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &.is-active {
        border-color: #3273dc;
        background-color: rgba(50, 115, 220, 0.1);
    }

    .file-input {
        display: none;
    }

    .preview-image {
        max-width: 200px;
        max-height: 200px;
    }
}
</style>
