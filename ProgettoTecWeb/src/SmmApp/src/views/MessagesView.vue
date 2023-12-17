<template>
    <h1>Message</h1>
</template>

<script lang="ts">

export default {
    props: {
        user: {
            type: Object,
            required: true
        },
        vip: {
            type: Object,
            required: true
        }
    },
}

</script>