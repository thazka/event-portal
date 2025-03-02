<script setup lang="ts">
import { computed } from 'vue';

interface Participant {
    id: number
    name: string
    selected?: boolean
}

interface Doorprize {
    id: number
    name: string
    photo: string
    total_winner: number
    participants: Participant[]
    created_at: string
    updated_at: string
    deleted_at: null | string
    created_by: number
}

const props = defineProps<{
    isOpen: boolean
    winner: Participant | null
    doorprize: Doorprize | null
}>();

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'confirm-winner'): void
    (e: 'eliminate'): void
    (e: 'next-doorprize'): void
}>();

const remainingWinners = computed(() => {
    if (!props.doorprize) return 0;

    const currentWinners = props.doorprize.participants ?
        props.doorprize.participants.length : 0;
    const maxWinners = props.doorprize.total_winner || 0;

    return Math.max(0, maxWinners - currentWinners - 1); // -1 because we're about to add one
});

const confirmWinner = () => {
    emit('confirm-winner');
};

const eliminateWinner = () => {
    emit('eliminate');
};

const moveToNextDoorprize = () => {
    emit('next-doorprize');
};

const close = () => {
    emit('close');
};
</script>

<template>
    <div class="modal-overlay" v-if="isOpen">
        <div class="modal-container">
            <div class="modal-header">
                <h2>Winner Selected!</h2>
                <button class="close-button" @click="close">×</button>
            </div>

            <div class="modal-body" v-if="winner && doorprize">
                <div class="winner-info">
                    <div class="winner-badge">WINNER</div>
                    <div class="winner-name">{{ winner.name }}</div>
                    <div class="prize-name">wins: {{ doorprize.name }}</div>

                    <div class="winner-count">
                        <div class="winner-counter">
                            <span class="current">{{ doorprize.participants?.length ?? 0 }}</span>
                            <span class="divider">/</span>
                            <span class="total">{{ doorprize.total_winner }}</span>
                        </div>
                        <div class="winner-label">
                            Winner{{ doorprize.participants?.length !== 1 ? 's' : '' }} Selected
                        </div>

                        <div class="remaining-info" v-if="remainingWinners > 0">
                            {{ remainingWinners }} more winner{{ remainingWinners !== 1 ? 's' : '' }} to select
                        </div>
                    </div>
                </div>

                <div class="modal-actions">
                    <button class="btn confirm" @click="confirmWinner">
                        Confirm Winner
                    </button>
                    <button class="btn eliminate" @click="eliminateWinner">
                        Choose Again
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-container {
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    width: 90%;
    max-width: 500px;
    overflow: hidden;
    animation: modal-appear 0.3s ease-out;
}

.modal-header {
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }

    .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 1.8rem;
        cursor: pointer;
        padding: 0;
        margin: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;

        &:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
    }
}

.modal-body {
    padding: 30px;

    .winner-info {
        text-align: center;
        margin-bottom: 30px;

        .winner-badge {
            display: inline-block;
            background-color: #ffc107;
            color: #000;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 4px;
            margin-bottom: 10px;
            font-size: 0.9rem;
        }

        .winner-name {
            font-size: 2.2rem;
            font-weight: 700;
            margin-bottom: 5px;
            color: #333;
        }

        .prize-name {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 20px;
        }

        .winner-count {
            margin-top: 25px;

            .winner-counter {
                font-size: 20px;
                font-weight: 600;
                color: #3b82f6;
                display: flex;
                justify-content: center;
                gap: 8px;

                .divider {
                    font-size: 20px;
                }
            }

            .winner-label {
                font-size: 0.9rem;
                color: #666;
                margin-top: 4px;
            }

            .remaining-info {
                margin-top: 10px;
                padding: 8px;
                background-color: #f3f4f6;
                border-radius: 4px;
                display: inline-block;
                font-size: 0.9rem;
                color: #4b5563;
            }
        }
    }
}

.modal-actions {
    display: flex;
    gap: 15px;
    justify-content: center;

    .btn {
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-size: 1rem;

        &.confirm {
            background-color: #3b82f6;
            color: white;
            flex: 3;

            &:hover {
                background-color: #2563eb;
            }
        }

        &.eliminate {
            background-color: #f3f4f6;
            color: #4b5563;
            flex: 2;

            &:hover {
                background-color: #e5e7eb;
            }
        }
    }
}

@keyframes modal-appear {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>