<template>
    <div class="section content">
        <h2 class="has-text-centered">Settings</h2>
        <h3 class="has-text-centered">Change Password</h3>
        
        <b-field label="New Password" horizontal>
            <b-input
                id="password1"
                type="password"
                password-reveal
                minlength="6" maxlength="100"
                placeholder="password"
                v-model="password1"
            />
            <b-input
                id="password2"
                type="password"
                password-reveal
                minlength="6" maxlength="100"
                placeholder="repeat password"
                v-model="password2"
                @keypress.native.enter="saveNewPass()"
            />
            <div id="save-pass-button" class="button is-primary" @click="saveNewPass()">Go!</div>
        </b-field>

        <h3 class="has-text-centered">Change Colorgroup</h3>

        <b-field label="New Color Group" horizontal>
            <b-select id="color-group" placeholder="Select a Color Group" v-model="selectedGroup" expanded :loading="groupListLoading">
                <option
                    v-for="(group,i) in groupList"
                    :value="group.abbr"
                    :key="i">
                    {{ group.name }}
                </option>
            </b-select>
            <div id="save-group-button" class="button is-primary" @click="saveNewGroup()">Go!</div>
        </b-field>
    </div>
</template>


<script>
export default {
    data() {
        return {
            selectedGroup: '',
            groupList: this.$groups,
            groupListLoading: true,
            password1: '',
            password2: ''
        }
    },

    mounted() {
        this.$http.get(this.$api+'/api/settings/getColorGroup').then(response => {
            this.groupListLoading = false;
            this.selectedGroup = response.data;
        }).catch(() => {
            this.$buefy.toast.open({
                duration: 2000,
                message: 'Error loading color group.',
                type: 'is-danger'
            });
        });
    },

    methods: {
        saveNewGroup() {
            this.$http.post(this.$api+'/api/settings/saveColorGroup', {colorgroup: this.selectedGroup}).then(() => {
                this.$buefy.toast.open({
                    duration: 2000,
                    message: 'New color group saved!',
                    type: 'is-success'
                });
            }).catch(() => {
                this.$buefy.toast.open({
                    duration: 2000,
                    message: 'Error saving color group.',
                    type: 'is-danger'
                });
            });
        },

        saveNewPass() {
            //check that passwords match
            if(this.password1 !== this.password2) {
                this.$buefy.toast.open({
                    duration: 2000,
                    message: 'Passwords do not match.',
                    type: 'is-danger'
                });
                return;
            }

            //check length requirement
            if(this.password1.length < 6 || this.password1.length > 100) {
                this.$buefy.toast.open({
                    duration: 2000,
                    message: 'Password must be between 6 and 100 characters.',
                    type: 'is-danger'
                });
                return;
            }

            this.$http.post(this.$api+'/api/settings/saveNewPass', {newPass: this.password1}).then(() => {
                this.password1 = '';
                this.password2 = '';
                this.$buefy.toast.open({
                    duration: 2000,
                    message: 'New password saved!',
                    type: 'is-success'
                });
            }).catch(() => {
                this.$buefy.toast.open({
                    duration: 2000,
                    message: 'Error saving password.',
                    type: 'is-danger'
                });
            });
        }
    }
}
</script>