<template>
    <div>
        <form action="" method="post" @submit.prevent="submit()">
            <b-field label="Date" horizontal>
                <b-datepicker placeholder="Select Date..."
                    icon="calendar-today"
                    v-model="info.date"
                    required
                    :max-date="new Date()"
                ></b-datepicker>
            </b-field>
            
            <div class="trailsList">
                <p v-if="trailsList.length==0">Select the trails you skied and they will appear here!</p>
                <div v-for="(trail, i) in trailsList" :key="i" style="padding:5px;">
                    <span class="trailName" :title="trail.name">{{trail.name}}</span>
                    <div class="is-pulled-right" style="width:100px;">
                        <span class="is-pulled-left">{{trail.distance}} km</span>
                        <span class="is-pulled-right delete" @click="trailsList.splice(i,1)"></span>
                    </div>
                </div>
            </div>

            <p class="has-text-right"><b>{{totalDist}} km</b></p>

            <b-field label="Technique" horizontal>
                <b-select v-model="info.technique" required>
                    <option value='skate'>Skate</option>
                    <option value='classic'>Classic</option>
                    <option value='backcountry'>Backcountry</option>
                </b-select>
            </b-field>

            <b-field label="Trail System">
                <b-autocomplete
                    v-model="info.system"
                    :data="filteredDataArray"
                    placeholder="e.g. mtu"
                    icon="magnify"
                    @select="option => selected = option"
                    required
                >
                </b-autocomplete>
            </b-field>

            <b-field label="Comments">
                <b-input maxlength="200" type="textarea" v-model="info.comments"></b-input>
            </b-field>

            <button class="button is-primary is-fullwidth" :disabled="isLoading" :class="{'is-loading': isLoading}">Submit!</button>
        </form>
    </div>
</template>

<script>
export default {

    props: {
        trailsList: {
            type: Array,
            required: true,
            default: []
        },

        system: {
            type: String,
            required: true,
            default: ""
        },

        entryId: {
            type: Number,
            required: true,
            default: -1
        },

        entryInfo: {
            type: Object,
            required: true
        }
    },

    data() {
        return {
            date: new Date(),
            info: {
                date: new Date(),
                date2: new Date(),
                system: '',
                technique: '',
                comments: ''
            },

            trailSystems: [],
            isLoading: false
        }
    },

    computed: {
        totalDist() {
            let sum = 0;
            for(var key in this.trailsList) {
                sum += parseFloat(this.trailsList[key].distance);
            }
            
            return Math.round(sum*100)/100;
        },

        filteredDataArray() {
            if(this.trailSystems.length == 0) return [];
            if(this.trailSystems == undefined) return [];
            return this.trailSystems.filter((option) => {
                return option
                    .toLowerCase()
                    .indexOf(this.system.toLowerCase()) >= 0
            })
        }
    },

    watch: {
        system(newVal, oldVal) {
            this.info.system = this.system;
        }
    },

    mounted() {
        //get list of trail systems
        this.$http.get(this.$api+'/getTrailSystems').then(response => {
            this.trailSystems = response.data;
        }).catch(() => {
            this.$toast.open({
                duration: 2000,
                message: 'Error loading trail systems',
                type: 'is-danger'
            });
        });

        //load entryInfo
        this.info = this.entryInfo;
    },

    methods: {
        submit() {
            //must have at least 1 trail
            if(this.trailsList.length == 0) {
                this.$toast.open({
                    duration: 3000,
                    message: 'You must have at least 1 trail',
                    type: 'is-danger'
                });
                return;
            }

            this.info.date2 = this.$moment(this.info.date).format("YYYY-MM-DD");

            var editMode;
            if(this.entryId > -1) editMode = 'editEntry';
            else editMode = 'newEntry';

            this.isLoading = true;
            this.$http.post(this.$api+'/api/'+editMode, {info: this.info, trails: this.trailsList, entryId: this.entryId}).then(response => {
                
                this.$emit('saved');
                this.$router.push('/leaderboard');
                this.$toast.open({
                    duration: 2000,
                    message: 'Your entry has been saved!',
                    type: 'is-success'
                });
                this.isLoading = false;

            }).catch(() => {
                this.$toast.open({
                    duration: 2000,
                    message: 'Error saving entry',
                    type: 'is-danger'
                });
                this.isLoading = false;
            });
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