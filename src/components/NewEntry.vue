<template>
    <div>
        <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
        <div class="columns">
            <div class="column is-three-quarters section">

                <b-field label="Select Trail System" horizontal>
                    <b-select placeholder="Select a Trail System" v-model="selectedSystem">
                        <option
                            v-for="(obj, i) in trails"
                            :value="obj.abbr"
                            :key="i">
                            {{ obj.fullName }}
                        </option>
                    </b-select>
                </b-field>


                <b-tabs v-model="activeDivision" v-if="selectedSystem.length > 0">
                    <b-tab-item 
                        v-for="(trailsObj, name, i) in trails[selectedSystem].trails" :key="i" 
                        :label="name"
                    >
                        <div class="columns">
                            <div class="column is-two-thirds">
                                <figure class="image">
                                    <img :src="require('@/assets/maps/'+trailsObj.mapFile)">
                                </figure>
                            </div>
                            
                            <div class="column">
                                <div v-for="(trail, i) in trailsObj.trails"
                                    :key="i"
                                    class="trailButton"
                                    :style="{'color': trail.color}"
                                    @click="trailsList.push(trail)"
                                >
                                    {{trail.name}}
                                </div>
                            </div>
                        </div>
                    </b-tab-item>
                    <b-tab-item label="Custom Trail" class="has-text-centered">
                        <b-field label="Trail Name" horizontal>
                            <b-input minlength="2" maxlength="200" v-model="customTrailName"></b-input>
                        </b-field>
                        <b-field label="Distance (km)" horizontal>
                            <b-input type="number" max="1000" min="-1000" v-model="customTrailDist"></b-input>
                        </b-field>
                        <div class="button is-primary" style="justify-content:center;" @click="addCustomTrail()">Add Trail</div>
                    </b-tab-item>
                </b-tabs>
            </div>

            <div class="column content" id="homeSidebar2" v-if="$mq==='widescreen'">
                <p class="sidebarHeader">Submit Your Entry!</p>
                <NewEntrySubmit :trailsList.sync="trailsList" :system="selectedSystem" :entry-id="entryId" :entry-info="info" @saved="this.isUnsaved=false"></NewEntrySubmit>
            </div>
        </div>

        <nav class="navbar is-fixed-bottom" v-if="$mq!=='widescreen'" style="margin-bottom:-10px;">
            <div class="navbar-brand">
                <div class="button is-primary is-fullwidth is-medium" @click="mobileSubmitBoxActive=true">
                    {{trailsList.length}} Trails Added ({{totalDist}} km) - tap to submit
                </div>
            </div>
        </nav>

        <b-modal :active.sync="mobileSubmitBoxActive" has-modal-card :canCancel="false">
            <div class="modal-card">

                <header class="modal-card-head">
                    <p class="modal-card-title">Submit Entry</p>
                    <div class="delete is-pulled-right" @click="mobileSubmitBoxActive=false"></div>
                </header>

                <div class="modal-card-body">
                    <new-entry-submit
                        :entry-id="entryId"
                        :trails-list.sync="trailsList"
                        :system="selectedSystem" 
                        :entry-info="info"
                        @saved="isUnsaved=false"
                    >
                    </new-entry-submit>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import trailsJson from './../assets/trails.json'
import NewEntrySubmit from './NewEntrySubmit.vue'
export default {

    components: {
        NewEntrySubmit
    },

    data() {
        return {
            trails: trailsJson,
            selectedSystem: '',
            activeDivision: 0,
            trailsList: [],

            customTrailName: "",
            customTrailDist: 0,

            mobileSubmitBoxActive: false,
            entryId: -1,

            info: {
                date: new Date(),
                technique: "",
                comments: "",
                system: ""
            },

            isLoading: false,
            isUnsaved: false
        }
    },
/*
    created() {
        window.addEventListener('beforeunload', function (event) {
            console.log('leaving') // logs to my logger
        }, false);
    },
*/
    mounted() {

        //check login before doing anything else
        this.$root.$emit('checkLogin');

        //prompt on refresh/leave page
        window.addEventListener("beforeunload", this.beforeunloadEvent);

        if(this.$route.params.entryId !== undefined) {
            this.entryId = parseInt(this.$route.params.entryId);
            this.loadEntry();
        }

        //make sure data is reset
        this.selectedSystem = "";
        this.customTrailName = "";
        this.customTrailDist = 0;
        this.info.date = new Date();
        this.info.technique = "";
        this.info.comments = "";
        this.trailsList = [];
        this.isUnsaved = true;
    },

    destroyed() {
        window.removeEventListener("beforeunload", this.beforeunloadEvent);
    },

    beforeRouteLeave (to, from, next) {
        if(to.path == "/login") next();
        else if(!this.isUnsaved) next();
        else {
            this.$dialog.confirm({
                title: 'Are you sure?',
                message: 'If you leave this page, your entry will not be saved.',
                onConfirm: () => {
                    next();

                    window.removeEventListener("beforeunload", this.beforeunloadEvent);
                }
            });
        }
    },

    computed: {
        totalDist() {
            let sum = 0;
            for(var key in this.trailsList) {
                sum += parseFloat(this.trailsList[key].distance);
            }
            
            return Math.round(sum*100)/100;
        }
    },

    watch: {
        selectedSystem() {
            this.activeDivision = 0;
            this.info.system = this.selectedSystem;
        }
    },

    methods: {

        beforeunloadEvent(event) {
            // Cancel the event as stated by the standard.
            event.preventDefault();
            // Chrome requires returnValue to be set.
            event.returnValue = '';
        },

        addCustomTrail() {
            this.trailsList.push({
                name: this.customTrailName,
                distance: parseFloat(this.customTrailDist)
            });

            this.customTrailName = "";
            this.customTrailDist = 0;
        },

        loadEntry() {
            this.isLoading = true;
            this.$http.get(this.$api+'/api/loadEntry/'+this.entryId).then(response => {
                this.info.date = this.$moment(response.data.date).toDate();
                this.info.technique = response.data.technique;
                this.selectedSystem = response.data.system;
                this.info.comments = response.data.comments;
                this.trailsList = response.data.trailsList;
                this.isLoading = false;
            }).catch(() => {
                this.$toast.open({
                    duration: 2000,
                    message: 'Error loading entry',
                    type: 'is-danger'
                });
                this.isLoading = false;
            });
        }
    }

}
</script>

<style>
#homeSidebar2 {
    border:2px solid #0249C1;
    border-right:none;
    margin-top:10px;
    margin-bottom:10px;
    margin-right:11px;
    border-bottom-left-radius:10px;
    padding:5px;
    padding-top:0px;
}

.trailButton {
    padding:5px;
}

.trailButton:hover {
    cursor:pointer;
    text-decoration: underline;
}
</style>