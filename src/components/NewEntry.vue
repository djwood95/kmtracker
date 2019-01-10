<template>
    <div>
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
                </b-tabs>
            </div>

            <div class="column content" id="homeSidebar2" v-if="$mq==='desktop'">
                <p class="sidebarHeader">Submit Your Entry!</p>
                <NewEntrySubmit :trailsList.sync="trailsList" :system="selectedSystem"></NewEntrySubmit>
            </div>
        </div>

        <nav class="navbar is-fixed-bottom" v-if="$mq==='mobile'">
            <div class="navbar-brand">
                <div class="button is-primary is-fullwidth">3 Trails Added (10.5km)</div>
            </div>
        </nav>
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
            trailsList: []
        }
    },

    watch: {
        selectedSystem() {
            this.activeDivision = 0;
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