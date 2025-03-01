<script setup lang="ts">
export type VCardAdvancedRadius = 'regular' | 'smooth' | 'rounded'
export interface VCardAdvancedProps {
  radius?: VCardAdvancedRadius
  nofooter?: boolean
  selectedEvent?: number | null
}

const props = withDefaults(defineProps<VCardAdvancedProps>(), {
  radius: 'regular',
  nofooter: false,
  selectedEvent: null
})
</script>

<template>
  <div :class="[
    props.radius === 'regular' && 's-card-advanced',
    props.radius === 'smooth' && 'r-card-advanced',
    props.radius === 'rounded' && 'l-card-advanced',
  ]">
    <div class="card-head">
      <div class="left">
        <slot name="header-left" />
      </div>
      <div class="right">
        <slot name="header-right" />
      </div>
    </div>
    <div class="card-body" :class="`event-bg-${props.selectedEvent}`">
      <slot name="content" />
    </div>
    <div v-if="!props.nofooter" class="card-foot">
      <div class="left">
        <slot name="footer-left" />
      </div>
      <div class="right">
        <slot name="footer-right" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-body {  
  // Event-specific background classes
  &.event-bg-1 {
    background-image: url('/images/event/layout/layout-meeting.jpg');
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    min-height: 700px;
    position: relative;
    
    // Default styles for card body
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover; // Changed from contain to cover to fill the entire area
    transition: background-image 0.3s ease;
  }
  
  &.event-bg-2 {
    background-image: url('/images/event/seating-color-b.svg');
    height: 100%;
    min-height: 700px;
    position: relative;
    
    // Default styles for card body
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover; // Changed from contain to cover to fill the entire area
    transition: background-image 0.3s ease;

  }
  
  &.event-bg-3 {
    background-image: url('/images/event/layout/gala-dinner.jpg');
    height: 100%;
    min-height: 700px;
    position: relative;
    
    // Default styles for card body
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover; // Changed from contain to cover to fill the entire area
    transition: background-image 0.3s ease;

  }
  
  // Fullscreen specific styles
  :deep(.is-fullscreen) & {
    background-size: cover;
    height: 100%;
    width: 100%;
  }
}

// Additional styles to ensure the card-body takes up the full height in fullscreen mode
:global(.is-fullscreen) .card-body {
  height: 100vh;
  max-height: 100vh;
}
</style>