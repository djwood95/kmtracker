<template>
    <div>
        <b-tabs v-model="activeDivision" v-if="system.length > 0 && system !== 'other'">
            <b-tab-item 
                v-for="(trailsObj, name, i) in trails[system].trails" :key="i" 
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
                            @click="addTrail(trail.name,trail.distance)"
                        >
                            {{trail.name}}
                        </div>
                    </div>
                </div>
            </b-tab-item>
            <b-tab-item label="Custom Trail" class="has-text-centered">
                <custom-trail @addTrail="(name,dist) => addTrail(name,dist)" />
            </b-tab-item>
        </b-tabs>

        <div class="content has-text-centered" v-if="system === 'other'">
            <hr/>
            <custom-trail @addTrail="(name,dist) => addTrail(name,dist)" />
        </div>
    </div>
</template>

<script>
import trailsJson from './../assets/trails.json';
import CustomTrail from './CustomTrail';
export default {
    props: ['system'],
    components: { CustomTrail },

    data() {
        return {
            trails: trailsJson,
            customSystemName: '',
            activeDivision: 0,
        }
    },

    watch: {
        system() {
            this.activeDivision = 0;
        }
    },

    methods: {
        addTrail(name,dist) {
            this.$emit('addTrail', name, dist);
        }
    }
}
</script>