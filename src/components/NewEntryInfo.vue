<template>
    <div>
        <b-notification v-if="errors.length > 0" type="is-danger" ref="errorBox">
            Please fix the following errors to continue:
            <ul>
                <li v-for="(msg,i) in errors" :key="i">{{ msg }}</li>
            </ul>
        </b-notification>

        <div v-if="info !== null">
            <b-field label="Date" horizontal>
                <b-datepicker placeholder="Select Date..."
                    id="date-picker"
                    icon="calendar"
                    v-model="info.date"
                    required
                    :max-date="new Date()"
                ></b-datepicker>
            </b-field>
            
            <div class="trailsList">
                <p v-if="trailsList.length === 0">Select the trails you skied and they will appear here!</p>
                <div v-for="(trail, i) in trailsList" :key="i" style="padding:5px;" class="trail-list-item">
                    <span class="trailName" :title="trail.name">{{trail.name}}</span>
                    <div class="is-pulled-right" style="width:100px;">
                        <span class="trailDist is-pulled-left">{{trail.distance}} km</span>
                        <span class="is-pulled-right delete" @click="removeTrail(i)"></span>
                    </div>
                </div>
            </div>

            <p class="has-text-right"><b>{{totalDist}} km</b></p>

            <b-field label="Technique" horizontal>
                <b-select id="technique" v-model="info.technique" required>
                    <option value='skate'>Skate</option>
                    <option value='classic'>Classic</option>
                    <option value='backcountry'>Backcountry</option>
                </b-select>
            </b-field>

            <b-field label="Comments">
                <b-input id="comments" maxlength="200" type="textarea" v-model="info.comments"></b-input>
            </b-field>

            <b-button @click="submit()" type="is-primary" expanded>Submit!</b-button>
        </div>
    </div>
</template>

<script>
export default {

    props: {
        trailsList: {
            type: Array,
            required: true,
            default: () => []
        },

        entryInfo: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            info: null,
            isLoading: false,
            errors: []
        }
    },

    mounted() {
        this.info = this._.cloneDeep(this.entryInfo);
    },

    computed: {
        totalDist() {
            let sum = 0;
            for (var key in this.trailsList) {
                sum += parseFloat(this.trailsList[key].distance);
            }
            
            return Math.round(sum*100)/100;
        }
    },

    watch: {
        info: {
            handler(newVal, oldVal) {
                if (oldVal !== null) {
                    this.$emit('infoChanged');
                }
            },
            deep: true
        },

        entryInfo: {
            handler() {
                this.info = this._.cloneDeep(this.entryInfo);
            },
            deep: true
        }
    },

    methods: {
        removeTrail(i) {
            this.$emit('removeTrail', i);
        },

        submit() {
            this.errors = [];
            if (!this.$moment(this.info.date).isValid()) {
                this.errors.push('Date format is invalid');
            }

            if (this.trailsList.length === 0) {
               this.errors.push('You must have at least one trail'); 
            }

            if (this.info.technique === '') {
                this.errors.push('Technique is a required field');
            }

            if (this.info.comments.length > 200) {
                this.errors.push('Comments must be less than 200 characters');
            }

            if (this.errors.length > 0) {
                this.$nextTick(() => this.$refs.errorBox.$el.scrollIntoView());
                return;
            }

            this.$emit('save', this._.cloneDeep(this.info));
        }
    }
}
</script>

<style>
.trailsList {
    border-top:2px solid black;
    border-bottom:2px solid black;
    padding:5px;
    max-height:250px;
    overflow-y:auto;
}

.trailName {
    display: inline-block;
    width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>