<template>
    <div>
        <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
        <div class="columns">
            <div class="column is-three-quarters section">

                <b-field label="Select Trail System" horizontal>
                    <b-select id="trail-system" placeholder="Select a Trail System" v-model="selectedSystem">
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
                        <b-notification v-if="customTrailErrors.length > 0" type="is-danger">
                            Please fix the following errors to continue:
                            <ul>
                                <li v-for="(msg,i) in customTrailErrors" :key="i">{{ msg }}</li>
                            </ul>
                        </b-notification>

                        <b-field label="Trail Name" horizontal>
                            <b-input id="custom-trail-name" minlength="2" maxlength="200" v-model="customTrailName"></b-input>
                        </b-field>
                        <b-field label="Distance (km)" horizontal>
                            <b-input id="custom-trail-dist" type="number" max="1000" min="-1000" v-model="customTrailDist"></b-input>
                        </b-field>
                        <div class="button is-primary" style="justify-content:center;" @click="addCustomTrail()">Add Trail</div>
                    </b-tab-item>
                </b-tabs>
            </div>

            <div class="column content" id="homeSidebar2" v-if="$mq==='desktop'">
                <p class="sidebarHeader">Submit Your Entry!</p>
                <new-entry-submit
                    :trailsList.sync="trailsList"
                    :system="selectedSystem"
                    :entry-id="entryId"
                    :entry-info="info"
                    @saved="entrySaved()"
                    @info-changed="infoChanged()"
                />
            </div>
        </div>

        <nav class="navbar is-fixed-bottom" v-if="$mq!=='desktop'" style="margin-bottom:-10px;">
            <div class="navbar-brand">
                <div class="button is-primary is-fullwidth is-medium" @click="mobileSubmitBoxActive=true">
                    {{trailsList.length}} Trails Added ({{totalDist}} km) - tap to submit
                </div>
            </div>
        </nav>

        <b-modal :active.sync="mobileSubmitBoxActive" has-modal-card full-screen :canCancel="false">
            <div class="modal-card">

                <header class="modal-card-head">
                    <p class="modal-card-title">Submit Entry</p>
                    <div class="delete is-pulled-right" @click="mobileSubmitBoxActive=false"></div>
                </header>

                <div class="modal-card-body" ref="modal-card-body">
                    <new-entry-submit
                        :entry-id="entryId"
                        :trails-list.sync="trailsList"
                        :system="selectedSystem" 
                        :entry-info="info"
                        @saved="entrySaved()"
                        @info-changed="isUnsaved = true"
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
            customTrailErrors: [],

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

    mounted() {

        //check login before doing anything else
        this.$root.$emit('checkLogin');

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
    },

    destroyed() {
        window.removeEventListener("beforeunload", this.beforeunloadEvent);
    },

    beforeRouteLeave (to, from, next) {
        if (this.isUnsaved) {
            this.$buefy.dialog.confirm({
                title: 'Are you sure?',
                message: 'If you leave this page, your entry will not be saved.',
                onConfirm: () => {
                    next();

                    window.removeEventListener("beforeunload", this.beforeunloadEvent);
                }
            });
        } else {
            next();
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
            if (this.isUnsaved) {
                event.preventDefault();
                event.returnValue = '';
            }
        },

        infoChanged() {
            console.log('test');
            this.isUnsaved = true;
        },

        addCustomTrail() {
            this.customTrailErrors = [];
            if (this.customTrailDist < -1000 || this.customTrailDist > 1000) {
                this.customTrailErrors.push('Custom trail distance must be between -1000 and 1000 km');
            }

            if (this.customTrailName.length < 5 || this.customTrailName.length > 100) {
                this.customTrailErrors.push('Custom trail name must be between 5 and 100 characters');
            }

            if (this.customTrailErrors.length > 0) {
                return;
            }

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
                response.data.technique === null ?
                    this.info.technique = '' : this.info.technique = response.data.technique;
                response.data.selectedSystem === null ?
                    this.info.selectedSystem = '' : this.info.selectedSystem = response.data.selectedSystem;
                response.data.comments === null ?
                    this.info.comments = '' : this.info.comments = response.data.comments;
                response.data.trailsList === null ?
                    this.trailsList = [] : this.trailsList = response.data.trailsList;
                this.isLoading = false;
            }).catch(() => {
                this.$buefy.toast.open({
                    duration: 2000,
                    message: 'Error loading entry',
                    type: 'is-danger'
                });
                this.isLoading = false;
            });
        },

        entrySaved() {
            this.isUnsaved = false;
            this.$router.push('/leaderboard');
            this.$buefy.toast.open({
                duration: 2000,
                message: 'Your entry has been saved!',
                type: 'is-success'
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