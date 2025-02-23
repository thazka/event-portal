<script setup lang="ts">
const pageTitle = useVueroContext<string>('page-title')

onMounted(() => {
    pageTitle.value = 'Doorprize'
})

useHead({
    title: 'Eventhook - Doorprize',
})

const doorprizeData = [
    {
        no: 1,
        image: "/prizes/iphone.jpg",
        doorprize_name: "iPhone 15 Pro Max",
        winner: "John Anderson",
        company: "Tech Solutions Inc."
    },
    {
        no: 2,
        image: "/prizes/laptop.jpg",
        doorprize_name: "MacBook Pro M2",
        winner: "Sarah Martinez",
        company: "Digital Innovations Ltd."
    },
    {
        no: 3,
        image: "/prizes/tv.jpg",
        doorprize_name: "Samsung 65\" QLED TV",
        winner: "Michael Chang",
        company: "Global Systems Corp"
    },
    {
        no: 4,
        image: "/prizes/watch.jpg",
        doorprize_name: "Apple Watch Series 9",
        winner: "Emily Wilson",
        company: "Creative Design Studio"
    },
    {
        no: 5,
        image: "/prizes/camera.jpg",
        doorprize_name: "Sony A7 IV Camera",
        winner: "David Thompson",
        company: "Media Productions"
    },
    {
        no: 6,
        image: "/prizes/console.jpg",
        doorprize_name: "PlayStation 5",
        winner: "Lisa Rodriguez",
        company: "Gaming Solutions"
    },
    {
        no: 7,
        image: "/prizes/tablet.jpg",
        doorprize_name: "iPad Pro 12.9\"",
        winner: "Robert Kim",
        company: "Innovation Hub"
    },
    {
        no: 8,
        image: "/prizes/headphones.jpg",
        doorprize_name: "Sony WH-1000XM5",
        winner: "Jennifer Lee",
        company: "Audio Excellence"
    },
    {
        no: 9,
        image: "/prizes/drone.jpg",
        doorprize_name: "DJI Mavic 3 Pro",
        winner: "Thomas Wright",
        company: "Aerial Solutions"
    },
    {
        no: 10,
        image: "/prizes/speaker.jpg",
        doorprize_name: "Sonos Arc Soundbar",
        winner: "Amanda Parker",
        company: "Sound Systems Inc."
    }
];
</script>

<template>
    <div>
        <VTableDoorprize :data="doorprizeData" />
    </div>
</template>