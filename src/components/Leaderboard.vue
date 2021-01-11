<template>
    <div>
        <b-loading :is-full-page="$mq==='mobile'" :active.sync="isLoading"></b-loading>
        <div id="leaderboardSettings" v-if="header">
            <b-field grouped group-multiline v-if="!groupStandingsMode">
                <b-field label="Filter By Group:">
                    <b-select id="group-filter" v-model="selectedGroup">
                        <option value='All'>All</option>
                        <option v-for="(group,i) in groupList" :value="group.abbr" :key="i">{{group.name}}</option>
                    </b-select>
                </b-field>

                <b-field id="start-date-field" label="Start Date:">
                    <b-datepicker id="start-date" icon="calendar" v-model="startDate" :disabled="dateMode==='lifetime' || dateMode === 'allSeasons'"></b-datepicker>
                </b-field>

                <b-field id="end-date-field" label="End Date:">
                    <b-datepicker id="end-date" icon="calendar" v-model="endDate" :disabled="dateMode==='lifetime' || dateMode === 'allSeasons'"></b-datepicker>
                    <b-button id="go-button" type="is-primary" :disabled="!dateChanged" @click="customDates()">
                        <span class="icon is-small">
                            <i class="fas fa-chevron-right"></i>
                        </span>
                    </b-button>
                </b-field>                  

            </b-field>

            <br/>

            <div class="buttons">
                <div class="button is-primary" :class="{'is-outlined': dateMode!=='thisSeason'}" v-if="!groupStandingsMode" @click="regStandings()">This Season</div>
                <div class="button is-primary" :class="{'is-outlined': dateMode!=='thisWeek'}" v-if="!groupStandingsMode" @click="thisWeek()">This Week</div>
                <div class="button is-primary" :class="{'is-outlined': dateMode!=='lifetime'}" v-if="!groupStandingsMode" @click="lifetime()">Lifetime</div>
                <div class="button is-primary" :class="{'is-outlined': dateMode!=='allSeasons'}" v-if="!groupStandingsMode" @click="allSeasons()">All Seasons</div>
                <div class="button is-primary" @click="groupStandings()" v-if="!groupStandingsMode">
                    <span>Group Standings</span>
                    <span class="icon is-small">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                </div>
                <div class="button is-primary" @click="regStandings()" v-if="groupStandingsMode">
                    <span class="icon is-small">
                        <i class="fas fa-chevron-left"></i>
                    </span>
                    <span>Individual Standings</span>
                </div>
            </div>
        </div>

        <div class="content p-3 has-text-centered" v-if="!header">
            <b-button type="is-primary" icon-right="chevron-right" @click="openInNewTab()">KMTracker.org</b-button>
        </div>

        <div>
            <b-table :data="filteredList" :mobile-cards="false" v-if="$mq!=='mobile'" narrowed>
                    <b-table-column field="place" label="Place" width="40" :visible="$mq!=='mobile' && !groupStandingsMode" v-slot="props">
                        {{props.row.place}}
                    </b-table-column>

                    <b-table-column field="username" label="Name" width="200" :visible="!groupStandingsMode" v-slot="props">
                        <span v-html="props.row.username"></span>
                    </b-table-column>

                    <b-table-column field="colorgroup" label="Group" width="100" :visible="$mq!=='mobile'" v-slot="props">
                        {{props.row.colorgroup}}
                    </b-table-column>

                    <b-table-column field="kms" label="Kilometers" v-slot="props">
                        <progress-bar style="display:block;" :colorgroup="props.row.colorgroup" :value="props.row.kms" :max="filteredList[0].kms"></progress-bar>
                    </b-table-column>

                    <b-table-column class="has-text-right" v-slot="props">
                        <span style="margin-right:3px;">{{props.row.kms}} km</span>
                        <span class="is-size-7" v-if="!groupStandingsMode">({{props.row.lastUpdate}})</span>
                    </b-table-column>

                <template slot="footer">
                    <div class="has-text-right">
                        <strong>Total: </strong>{{total}} km
                    </div>
                </template>
            </b-table>

            <div v-if="$mq==='mobile'">
                <progress-bar-mobile v-for="(row, i) in filteredList" :key="i" :rowData="row" :max="filteredList[0].kms"></progress-bar-mobile>
            </div>
        </div>
    </div>
</template>

<script>
import ProgressBar from './ProgressBar.vue'
import ProgressBarMobile from './ProgressBarMobile.vue'
export default {

    props: ['header'],

    components: {
        ProgressBar,
        ProgressBarMobile
    },

    data() {
        return {
            groupList: this.$groups,
            selectedGroup: 'All',
            dateMode: 'thisSeason',
            startDate: new Date(),
            endDate: new Date(),
            list: [],
            total: 0,
            groupStandingsMode: false,
            isLoading: true,
            dateChanged: false
        }
    },

    computed: {
        filteredList() {
            if(this.selectedGroup == 'All') return this.list;

            return this.list.filter(item => {
                return item.colorgroup.toLowerCase() == this.selectedGroup.toLowerCase();
            });
        }
    },

    mounted() {
        this.regStandings();
    },

    watch: {
        filteredList() {
            this.updateTotal();
        },

        startDate() {
            this.dateMode = 'none';
            this.dateChanged = true;
        },

        endDate() {
            this.dateMode = 'none';
            this.dateChanged = true;
        }
    },

    methods: {
        groupStandings() {
            this.isLoading = true;
            this.$http.get(this.$api+'/leaderboard/groupStandings').then(response => {
                this.list = response.data.list;
                this.total = response.data.total;
                this.groupStandingsMode = true;
                this.selectedGroup = 'All';
                this.isLoading = false;
            }).catch(error => {
                this.isLoading = false;
                this.$root.$emit('handle-error', error, 'Error loading group standings');
            });
        },

        regStandings() {
            this.isLoading = true;
            this.$http.get(this.$api+'/leaderboard').then(response => {
                this.startDate = this.$moment(response.data.startDate).toDate();
                this.endDate = this.$moment(response.data.endDate).toDate();
                this.list = response.data.list;
                this.groupStandingsMode = false;
                this.isLoading = false;

                // v delayed to make sure date watchers execute first
                setTimeout(() => {
                    this.dateChanged = false;
                    this.dateMode = 'thisSeason';
                },500);
            }).catch(error => {
                this.isLoading = false;
                this.$root.$emit('handle-error', error, 'Error loading leaderboard');
            });
        },

        updateTotal() {
            let sum = 0;
            for(var key in this.filteredList) {
                sum += parseFloat(this.filteredList[key].kms);
            }
            this.total = this._.round(sum, 1);
        },

        thisWeek() {
            this.isLoading = true;
            this.startDate = this.$moment().subtract(7, 'days').toDate();
            this.endDate = this.$moment().toDate();

            let startDate = this.$moment(this.startDate).format("YYYY-MM-DD");
            let endDate = this.$moment(this.endDate).format("YYYY-MM-DD");
            this.$http.get(this.$api+'/leaderboard/'+startDate+'/'+endDate).then(response => {
                this.list = response.data.list;
                this.groupStandingsMode = false;
                this.isLoading = false;
                this.dateChanged = false;
                this.dateMode = 'thisWeek';
            }).catch(error => {
                this.isLoading = false;
                this.$root.$emit('handle-error', error, 'Error loading this week\'s leaderboard');
            });
        },

        customDates() {
            this.isLoading = true;

            let startDate = this.$moment(this.startDate).format("YYYY-MM-DD");
            let endDate = this.$moment(this.endDate).format("YYYY-MM-DD");
            this.$http.get(this.$api+'/leaderboard/'+startDate+'/'+endDate).then(response => {
                this.list = response.data.list;
                this.groupStandingsMode = false;
                this.isLoading = false;
                this.dateChanged = false;
            }).catch(error => {
                this.isLoading = false;
                this.$root.$emit('handle-error', error, 'Error loading leaderboard');
            });
        },

        lifetime() {
            this.isLoading = true;
            this.$http.get(this.$api+'/leaderboard/lifetime').then(response => {
                this.list = response.data.list;
                this.groupStandingsMode = false;
                this.isLoading = false;
                this.dateMode = 'lifetime';
            }).catch(error => {
                this.isLoading = false;
                this.$root.$emit('handle-error', error, 'Error loading lifetime leaderboard');
            });
        },

        allSeasons() {
            this.isLoading = true;
            this.$http.get(this.$api+'/leaderboard/allSeasons').then(response => {
                this.list = response.data.list;
                this.groupStandingsMode = false;
                this.isLoading = false;
                this.dateMode = 'allSeasons';
            }).catch(error => {
                this.isLoading = false;
                this.$root.$emit('handle-error', error, 'Error loading all seasons leaderboard');
            });
        },

        openInNewTab() {
            window.open('https://kmtracker.org', '_new');
        }
    }
}
</script>

<style>
    #leaderboardSettings {
        display:block;
        margin-top:10px;
        border-bottom:2px solid #0249C1;
        margin-bottom:10px;
        padding:10px;
    }
</style>