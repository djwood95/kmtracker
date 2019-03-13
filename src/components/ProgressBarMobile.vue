<template>
    <div id="progressBarM" :style="{'width': `${this.width}%`, 'background-color': this.bgColor, 'color': this.bgColor}">
        <span class="is-size-2 placeLabel">{{rowData.place}}</span>
        <span :style="{'color': this.textColor}" class="rightLabel">
            <p v-if="rowData.username !== undefined" v-html="rowData.username"></p>
            <p v-else>{{rowData.colorgroup}}</p>
            <p>{{rowData.kms}} km</p>
        </span>
    </div>
</template>

<script>
export default {

    props: {
        rowData: {
            type: Object,
            required: true
        },

        max: {
            type: String,
            required: true
        }
    },

    data() {
        return {
            width: 0,
            bgColor: this.$groups[this.rowData.colorgroup].bgColor,
            textColor: this.$groups[this.rowData.colorgroup].txtColor
        }
    },

    watch: {
        max() {
            this.updateWidth();
        },

        rowData: {
            handler() {
                this.updateColor();
            },
            deep: true
        }
    },

    mounted() {
        this.updateWidth();
    },

    methods: {
        updateWidth() {
            setTimeout(() => {
                this.width = (this.rowData.kms / this.max) * 100;
            }, 100);
        },

        updateColor() {
            this.bgColor = this.$groups[this.rowData.colorgroup].bgColor;
            this.textColor = this.$groups[this.rowData.colorgroup].txtColor;
        }
    }
}
</script>

<style>
    #progressBarM {
        min-width:200px;
        display:block;
        width: 0px;
        transition: width 1s;
    }

    .placeLabel {
        background-color:rgba(255,255,255,.75);
        color:black;
        text-shadow: 1px 1px 2px black;
        text-align: center;
        display:inline-block;
        border-top:3px solid rgba(255,255,255,.75);        
        width:50px;
    }

    .rightLabel {
        display:inline-block;
        margin-left:10px;
        padding-top:5px;
    }
</style>