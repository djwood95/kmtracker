<template>
    <div class="section content has-text-centered">
        <h2 class="has-text-centered">Past Entries</h2>

        <b-field label="Season" horizontal>
            <b-select placeholder="Select a Season" v-model="selectedSeason" :loading="isLoading">
                <option
                    v-for="(season,i) in seasonList"
                    :value="season"
                    :key="i">
                    {{ season.name }}
                </option>
            </b-select>
        </b-field>

        <b-table :data="data">
            <b-table-column field="date" label="Date" v-slot="props">
                {{props.row.date | moment("MMM D, YYYY")}}
            </b-table-column>

            <b-table-column field="location" label="Location" v-slot="props">
                {{props.row.system}}
            </b-table-column>

            <b-table-column field="distance" label="Distance" v-slot="props">
                {{parseFloat(props.row.distance).toFixed(1)}}
            </b-table-column>

            <b-table-column field="technique" label="Technique" v-slot="props">
                {{props.row.technique}}
            </b-table-column>

            <b-table-column field="comments" label="Comments" v-slot="props">
                {{props.row.comments}}
            </b-table-column>

            <b-table-column field="edit" v-slot="props">
                <div class="buttons">
                    <div class="button" @click="$router.push('/newEntry/'+props.row.entryId)">EDIT</div>
                    <div class="button is-danger" @click="deleteEntry(props.row.entryId)">DELETE</div>
                </div>
            </b-table-column>

            <template slot="footer">
                <div class="has-text-centered">
                    <strong>Total Distance: </strong>{{total}} km
                </div>
            </template>
        </b-table>

        <p v-if="data.length==0">No Data</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            seasonList: [],
            selectedSeason: '',
            data: [],
            isLoading: true,
            total: 0
        }
    },

    mounted() {
        // create list of seasons since 2013-14
        let seasonStart = this.$moment("2013-09-01").format("YYYY-MM-DD");
        let seasonEnd = this.$moment("2014-06-01").format("YYYY-MM-DD");

        while(this.$moment(seasonStart).isBefore(new Date())) {
            let startYear = this.$moment(seasonStart).format("YYYY");
            let endYear = this.$moment(seasonEnd).format("YYYY");

            let newSeason = {
                start: seasonStart,
                end: seasonEnd,
                name: startYear+'-'+endYear
            };

            this.seasonList.push(newSeason);
            seasonStart = this.$moment(seasonStart).add(1, 'year');
            seasonEnd = this.$moment(seasonEnd).add(1, 'year');
        }

        this.selectedSeason = this.seasonList[this.seasonList.length-1];
    },

    watch: {
        selectedSeason() {
            this.loadHistoryList();
        }
    },

    methods: {
        calcTotal() {
            let sum = 0;
            for(var key in this.data) {
                sum += parseFloat(this.data[key].distance);
            }
            this.total = Math.round(sum);
        },

        loadHistoryList() {
            this.isLoading = true;
            let startDate = this.$moment(this.selectedSeason.start).format("YYYY-MM-DD");
            let endDate = this.$moment(this.selectedSeason.end).format("YYYY-MM-DD");
            this.$http.get(this.$api+'/api/history/'+startDate+'/'+endDate).then(response => {
                this.data = response.data;
                this.calcTotal();
                this.isLoading = false;
            }).catch(() => {
                this.$buefy.toast.open({
                    duration: 2000,
                    message: 'Error loading history data.',
                    type: 'is-danger'
                });
            });
        },

        deleteEntry(entryId) {
            this.$buefy.dialog.confirm({
                title: 'Are you sure?',
                message: 'If you press ok, this entry will be permanently deleted!',
                onConfirm: () => {
                    this.$http.get(this.$api+'/api/deleteEntry/'+entryId).then(() => {
                        this.$buefy.toast.open({
                            duration: 2000,
                            message: 'Entry deleted!',
                            type: 'is-success'
                        });
                        this.loadHistoryList();
                    }).catch(() => {
                        this.$buefy.toast.open({
                            duration: 2000,
                            message: 'Error deleting entry.',
                            type: 'is-danger'
                        });
                    })
                }
            });
        }
    }
}
</script>