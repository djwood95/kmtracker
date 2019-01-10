<template>
    <div id="progressBar" :style="{'width': `${this.width}%`, 'background-color': this.bgColor, 'color': this.bgColor}">
        .
    </div>
</template>

<script>
export default {

    props: {
        colorgroup: {
            type: String,
            required: true
        },

        value: {
            required: true
        },

        max: {
            required: true
        }
    },

    data() {
        return {
            width: 0,
            bgColor: this.$groups[this.colorgroup].bgColor
        }
    },

    watch: {
        max() {
            this.updateWidth();
        },

        colorgroup() {
            this.updateColor();
        }
    },

    mounted() {
        this.updateWidth();
    },

    methods: {
        updateWidth() {
            setTimeout(() => {
                this.width = (this.value / this.max) * 100;
            }, 100);
        },

        updateColor() {
            this.bgColor = this.$groups[this.colorgroup].bgColor;
        }
    }
}
</script>

<style>
    #progressBar {
        display:block;
        width: 0px;
        transition: width 1s;
        min-width: 20px;
    }
</style>