<script setup lang="ts">
import { ref } from 'vue';
import type { Doorprize } from '/@src/interface/DoorprizeInterface';

const doorprizes = ref<Doorprize[]>([]);
const editingDoorprize = ref<Doorprize | null>(null);
const isModalActive = ref(false);

const handleSave = (data: Doorprize) => {
    if (editingDoorprize.value) {
        const index = doorprizes.value.findIndex(d => d.id === data.id);
        if (index !== -1) {
            doorprizes.value[index] = data;
        }
        editingDoorprize.value = null;
    } else {
        doorprizes.value.push(data);
    }
    isModalActive.value = false;
};

const handleEdit = (doorprize: Doorprize) => {
    editingDoorprize.value = doorprize;
    isModalActive.value = true;
};

const handleDelete = async (doorprize: Doorprize) => {
    const confirmed = await new Promise((resolve) => {
        if (confirm('Are you sure you want to delete this doorprize?')) {
            resolve(true);
        } else {
            resolve(false);
        }
    });

    if (confirmed) {
        doorprizes.value = doorprizes.value.filter(d => d.id !== doorprize.id);
    }
};
</script>

<template>
    <div class="container">
        <button class="button is-primary my-4" @click="isModalActive = true">
            Add New Doorprize
        </button>

        <div class="table-container">
            <table class="table is-fullwidth">
                <thead>
                    <tr>
                        <th>Urutan</th>
                        <th>Name</th>
                        <th>Doorprize</th>
                        <th>Gambar</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="doorprize in doorprizes" :key="doorprize.id">
                        <td>{{ doorprize.urutan }}</td>
                        <td>{{ doorprize.name }}</td>
                        <td>{{ doorprize.doorprize }}</td>
                        <td>
                            <img :src="doorprize.gambar" alt="Doorprize image"
                                style="max-width: 50px; max-height: 50px;" />
                        </td>
                        <td>
                            <div class="buttons">
                                <button class="button is-info is-small" @click="handleEdit(doorprize)">
                                    Edit
                                </button>
                                <button class="button is-danger is-small" @click="handleDelete(doorprize)">
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="modal" :class="{ 'is-active': isModalActive }">
            <div class="modal-background" @click="isModalActive = false"></div>
            <div class="modal-content">
                <DoorprizeForm :edit-data="editingDoorprize" @save="handleSave" />
            </div>
            <button class="modal-close is-large" @click="isModalActive = false"></button>
        </div>
    </div>
</template>