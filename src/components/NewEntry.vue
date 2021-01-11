<template>
    <div>
        <b-loading :is-full-page="true" :active.sync="isLoading"></b-loading>
        <div class="columns">
            <div class="column is-three-quarters-desktop section">

                <b-field grouped group-multiline position="is-centered">
                    <b-field label="Select Trail System" label-position="on-border" class="mb-5">
                        <b-select id="trail-system" placeholder="Select a Trail System" v-model="selectedSystem">
                            <option
                                v-for="(obj, i) in trails"
                                :value="obj.abbr"
                                :key="i">
                                {{ obj.fullName }}
                            </option>
                            <option value="other">Other</option>
                        </b-select>
                    </b-field>
                    
                    <b-field v-if="selectedSystem === 'other'"
                        label="Trail System Name" label-position="on-border"
                    >
                        <b-input type="text" maxlength="255" :has-counter="false" v-model="customSystemName" id="custom-trail-system" />
                    </b-field>
                </b-field>

                <trail-selection-box
                    :system="selectedSystem"
                    @addTrail="(name,dist) => addTrail(name,dist)"
                />
            </div>

            <div class="column content" id="homeSidebar2" v-if="$mq==='desktop'">
                <p class="sidebarHeader">Submit Your Entry!</p>
                <new-entry-info
                    :trailsList="_.cloneDeep(trailsList)"
                    :entryInfo="info"
                    @removeTrail="(id) => removeTrail(id)"
                    @save="(info) => saveEntry(info)"
                    @infoChanged="infoChanged()"
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
                    <new-entry-info
                        :trailsList="_.cloneDeep(trailsList)"
                        :entryInfo="info"
                        @removeTrail="(id) => removeTrail(id)"
                        @save="(info) => saveEntry(info)"
                        @infoChanged="infoChanged()"
                    />
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import trailsJson from './../assets/trails.json'
import TrailSelectionBox from './TrailSelectionBox'
import NewEntryInfo from './NewEntryInfo'
export default {

    components: {
        NewEntryInfo,
        TrailSelectionBox
    },

    data() {
        return {
            trails: trailsJson,
            selectedSystem: '',
            customSystemName: '',
            activeDivision: 0,
            dataLoaded: false,

            info: {
                date: new Date(),
                technique: '',
                selectedSystem: '',
                comments: ''
            },
            trailsList: [],

            mobileSubmitBoxActive: false,
            entryId: -1,

            isLoading: false,
            isUnsaved: false
        }
    },

    mounted() {

        //check login before doing anything else
        this.$root.$emit('checkLogin');

        window.addEventListener("beforeunload", this.beforeunloadEvent);

        if (this.$route.params.entryId !== undefined) {
            this.entryId = parseInt(this.$route.params.entryId);
            this.loadEntry();
        }
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
            
            return this._.round(sum,1);
        }
    },

    watch: {
        trailsList() {
            this.infoChanged();
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
            if (this.entryId === -1 || this.dataLoaded) {
                this.isUnsaved = true;
            }
        },

        addTrail(name,dist) {
            this.trailsList.push({ name, distance: dist });
        },

        removeTrail(i) {
            this.trailsList.splice(i, 1);
        },

        loadEntry() {
            this.isLoading = true;
            this.$http.get(this.$api+'/api/loadEntry/'+this.entryId).then(response => {
                this.info.date = this.$moment(response.data.date).toDate();
                
                const systems = Object.keys(this.trails);
                if (systems.includes(response.data.system)) {
                    this.selectedSystem = response.data.system;
                    this.info.selectedSystem = response.data.system;
                } else {
                    this.selectedSystem = 'other';
                    this.info.selectedSystem = 'other';
                    this.customSystemName = response.data.system === 'other' ? '' : response.data.system;
                }

                this.info.technique = response.data.technique;
                this.info.comments = response.data.comments;
                this.trailsList = response.data.trailsList;
                this.isLoading = false;
                this.$nextTick(() => this.dataLoaded = true);
            }).catch((error) => {
                this.$root.$emit('handle-error', error, 'There was an error loading your entry');
                this.isLoading = false;
            });
        },

        saveEntry(info) {
            this.isLoading = true;
            const mode = this.entryId === -1 ? 'newEntry' : 'editEntry';
            info.date = this.$moment(info.date).format('YYYY-MM-DD');

            let system = this.selectedSystem;
            if (this.selectedSystem === 'other') {
                system = this.customSystemName.length === 0 ?
                    this.selectedSystem : this.customSystemName;
            }

            const data = {
                info: {
                    date: this.$moment(info.date).format('YYYY-MM-DD'),
                    system,
                    technique: info.technique,
                    comments: info.comments
                },
                trails: this.trailsList,
                entryId: this.entryId
            };

            this.$http.post(`${this.$api}/api/${mode}`, data).then(() => {
                this.isUnsaved = false;
                this.isLoading = false;
                this.$router.push('/leaderboard');
                this.$buefy.toast.open({
                    duration: 3000,
                    message: 'Your entry has been saved!',
                    type: 'is-success'
                });
            }).catch((error) => {
                this.$root.$emit('handle-error', error, 'There was an error saving your entry');
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