<template>
    <div>
        <b-notification v-if="errors.length > 0" type="is-danger">
            Please fix the following errors to continue:
            <ul>
                <li v-for="(msg,i) in errors" :key="i">{{ msg }}</li>
            </ul>
        </b-notification>

        <b-field label="Trail Name" horizontal>
            <b-input id="custom-trail-name" minlength="2" maxlength="200" v-model="trailName"></b-input>
        </b-field>
        <b-field label="Distance (km)" horizontal>
            <b-input id="custom-trail-dist" type="number" max="1000" min="-1000" v-model="trailDist"></b-input>
        </b-field>
        <div class="button is-primary" style="justify-content:center;" @click="addCustomTrail()">Add Trail</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            trailName: '',
            trailDist: 0,
            errors: []
        }
    },

    methods: {
        addCustomTrail() {
            this.errors = [];
            if (this.trailDist < -1000 || this.trailDist > 1000) {
                this.errors.push('Custom trail distance must be between -1000 and 1000 km');
            }

            if (this.trailName.length < 1 || this.trailName.length > 100) {
                this.errors.push('Custom trail name must be between 1 and 100 characters');
            }

            if (this.errors.length > 0) {
                return;
            }

            this.$emit('addTrail', this.trailName, this.trailDist);
            this.trailName = "";
            this.trailDist = 0;
        }
    }
}
</script>