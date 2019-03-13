<template>
    <div class="content section">
        <h2 class="has-text-centered">New Account</h2>

            <form action="" method="post" @submit.prevent="submitNewAccount()">
                <b-field label="Username" horizontal :message="usernameErrorMsg" :type="usernameStatus">
                    <b-input 
                        minlength="3"
                        maxlength="15" 
                        v-model="info.username" 
                        required 
                        @change.native="checkUsername()">
                    </b-input>
                </b-field>

                <b-field label="Password" horizontal :type="passwordStatus">
                    <b-input type="password" required password-reveal
                        v-model="info.password1"
                        placeholder="password"
                        minlength="6"
                        maxlength="100"
                        @change.native="checkPasswords()">
                    </b-input>
                </b-field>

                <b-field label="Repeat Password" horizontal :message="passwordErrorMsg" :type="passwordStatus">
                    <b-input type="password" required password-reveal
                        v-model="info.password2"
                        placeholder="repeat password"
                        minlength="6"
                        maxlength="100"
                        @change.native="checkPasswords()">
                    </b-input>
                </b-field>

                <b-field label="Email" horizontal message="required for password recovery">
                    <b-input type="email" required
                        v-model="info.email"
                        placeholder="email"
                        minlength="6"
                        maxlength="100">
                    </b-input>
                </b-field>

                <b-field label="Color Group" horizontal>
                    <b-select placeholder="Select a Color Group" v-model="info.selectedGroup">
                        <option
                            v-for="(group,i) in groupList"
                            :value="group.abbr"
                            :key="i">
                            {{ group.name }}
                        </option>
                    </b-select>
                </b-field>

                <br/>

                <div class="buttons is-centered">
                    <button class="button" type="button" @click="$router.go(-1)">Cancel</button>
                    <button class="button is-primary">Create Account</button>
                </div>
            </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            info: {
                username: '',
                password1: '',
                password2: '',
                email: '',
                selectedGroup: ''
            },

            groupList2: Object.values(this.$groups),
            usernameList: [],
            usernameErrorMsg: '',
            usernameStatus: '',
            passwordErrorMsg: '',
            passwordStatus: ''
        }
    },

    computed: {
        groupList() {
            return this.groupList2.filter(item => {
                return item.name !== 'All';
            });
        }
    },

    methods: {
        submitNewAccount() {
            //check that passwords match
            if(this.info.password1 !== this.info.password2) {
                this.$toast.open({
                    duration: 3000,
                    message: 'Passwords do not match. Please try again.',
                    type: 'is-danger'
                });
                return;
            }

            //check that this isn't a duplicate account
            if(this.usernameList.includes(this.username)) {
                this.$toast.open({
                    duration: 3000,
                    message: 'This username is already taken. Please try again',
                    type: 'is-danger'
                });
                return;
            }

            this.$http.post(this.$api+'/newAccount', {info: this.info}).then(response => {
                this.$toast.open({
                    duration: 3000,
                    message: 'Your account was created!',
                    type: 'is-success'
                });
                this.$router.push('/');
            }).catch(() => {
                this.isLoading = false;
                this.$toast.open({
                    duration: 2000,
                    message: 'Error creating account. Please try again.',
                    type: 'is-danger'
                });
            });
        },

        getUsernameList() {
            this.$http.get(this.$api+'/getUsernameList').then(response => {
                this.usernameList = response.data;
            }).catch(() => {
                this.$toast.open({
                    duration: 2000,
                    message: 'Error loading new account page. Please try again',
                    type: 'is-danger'
                });
            })
        },

        checkUsername() {
            if(this.usernameList.includes(this.info.username)) {
                this.usernameErrorMsg = "This username has already been taken.";
                this.usernameStatus = 'is-danger';
                return false;
            } else {
                this.usernameErrorMsg = "";
                this.usernameStatus = 'is-success';
                return true;
            }
        },

        checkPasswords() {
            if(this.info.password1 != this.info.password2) {
                this.passwordErrorMsg = "Passwords do not match";
                this.passwordStatus = 'is-danger';
            } else {
                this.passwordErrorMsg = "";
                this.passwordStatus = 'is-success';
            }
        }
    },

    mounted() {
        this.groupList2 = Object.values(this.$groups);
        this.getUsernameList();
    }
}
</script>

<style>

</style>