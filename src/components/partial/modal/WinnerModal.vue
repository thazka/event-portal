<script setup lang="ts">
import confetti from 'canvas-confetti'
import { onMounted, watch } from 'vue'

interface Props {
    isOpen: boolean
    winner: {
        name: string
    } | null
    doorprize: {
        name: string
        image: string
    } | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    (e: 'close'): void
}>()

const fireConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const colors = ['#ffd700', '#ff0000', '#00ff00', '#0000ff', '#ff00ff']

        ; (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            })

            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            })

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }())
}

watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        nextTick(() => {
            fireConfetti()
        })
    }
})
</script>

<template>
    <VModal :open="props.isOpen" title="Congratulations!" size="small" actions="center" cancel-label="Close" noborder @close="emit('close')" >
        <template #content>
            <div class="winner-modal p-4 text-center">
                <div class="prize-image mb-4" v-if="doorprize?.image">
                    <img :src="doorprize.image" :alt="doorprize.name" class="mx-auto h-32 w-auto" />
                </div>

                <h2 class="text-2xl font-bold mb-2">🎉 Winner! 🎉</h2>

                <div class="winner-name text-xl mb-4">
                    {{ winner?.name }}
                </div>

                <div class="prize-name text-lg text-primary">
                    has won a<br />
                    <span class="font-bold">{{ doorprize?.name }}</span>
                </div>
            </div>
        </template>
    </VModal>
</template>

<style lang="scss" scoped>
.winner-modal {
    .prize-image img {
        object-fit: contain;
    }

    .winner-name {
        color: #1a1a1a;
    }

    .prize-name {
        line-height: 1.5;
    }
}
</style>