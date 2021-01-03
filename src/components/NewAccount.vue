<template>
    <div class="content section">
        <h2 class="has-text-centered">New Account</h2>

            <b-notification type="is-danger" v-if="errors.length > 0">
                Please fix the following errors to continue:
                <ul>
                    <li v-for="(msg,i) in errors" :key="i">{{ msg }}</li>
                </ul>
            </b-notification>

            <form action="" method="post" @submit.prevent="submitNewAccount()">
                <b-field label="Username" horizontal :message="usernameErrorMsg" :type="usernameStatus">
                    <b-input id="username"
                        minlength="3"
                        maxlength="15" 
                        v-model="info.username" 
                        required 
                        @change.native="checkUsername()">
                    </b-input>
                </b-field>

                <b-field label="Password" horizontal :type="passwordStatus">
                    <b-input id="password1" type="password" required password-reveal
                        v-model="info.password1"
                        placeholder="password"
                        minlength="6"
                        maxlength="100">
                    </b-input>
                </b-field>

                <b-field label="Repeat Password" horizontal :message="passwordErrorMsg" :type="passwordStatus">
                    <b-input id="password2" type="password" required password-reveal
                        v-model="info.password2"
                        placeholder="repeat password"
                        minlength="6"
                        maxlength="100">
                    </b-input>
                </b-field>

                <b-field label="Email" horizontal message="required for password recovery">
                    <b-input id="email" type="email" required
                        v-model="info.email"
                        placeholder="email"
                        minlength="6"
                        maxlength="100">
                    </b-input>
                </b-field>

                <b-field label="Color Group" horizontal>
                    <b-select id="colorGroup" placeholder="Select a Color Group" v-model="info.selectedGroup">
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
                    <button class="button" type="button" @click="$router.push('/')">Cancel</button>
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
            usernameExists: null,
            isPasswordValid: null,
            errors: []
        }
    },

    computed: {
        groupList() {
            return this.groupList2.filter(item => {
                return item.name !== 'All';
            });
        },

        usernameErrorMsg() {
            if (this.usernameExists === null) {
                return '';
            } else if (this.usernameExists) {
                return 'This username has already been taken!';
            } else if (this.info.username.length <= 3 || this.info.username.length > 15) {
                return 'Username is required and must be between 4 and 15 characters';
            } else {
                return '';
            }
        },

        usernameStatus() {
            if (this.usernameExists === null) return '';
            if (this.usernameErrorMsg.length === 0) return 'is-success';
            if (this.usernameErrorMsg.length > 0) return 'is-danger';
        },

        passwordErrorMsg() {
            if (this.info.password1.length === 0 && this.info.password2.length === 0) {
                return '';
            } else if (this.info.password1.length <= 5 || this.info.password1.length > 100) {
                return 'Password is required and must be between 6 and 100 characters';
            } else if (this.info.password1 !== this.info.password2) {
                return 'Passwords do not match!';
            } else {
                return '';
            }
        },

        passwordStatus() {
            if (this.info.password1.length === 0 && this.info.password2.length === 0) return '';
            if (this.passwordErrorMsg.length === 0) return 'is-success';
            if (this.passwordErrorMsg.length > 0) return 'is-danger';
        }
    },

    methods: {
        submitNewAccount() {
            this.errors = [];

            if (this.passwordErrorMsg.length > 0) {
                this.errors.push(this.passwordErrorMsg);
            }

            if (this.info.password1.length === 0 || this.info.password2.length === 0) {
                this.errors.push('Password is required');
            }

            if (this.usernameErrorMsg.length > 0) {
                this.errors.push(this.usernameErrorMsg);
            }

            if (this.errors.length > 0) return;

            this.$http.post(this.$api+'/newAccount', {info: this.info}).then(response => {
                this.$buefy.toast.open({
                    duration: 3000,
                    message: 'Your account was created!',
                    type: 'is-success'
                });
                this.$router.push('/');
            }).catch((error) => {
                this.$root.$emit('handle-error', error, 'Sorry, there was an error creating your account. Please try again.');
                this.isLoading = false;
            });
        },

        checkUsername() {
            this.$http.post(`${this.$api}/usernameExists`, { username: this.info.username }).then((response) => {
                this.usernameExists = response.data.usernameExists;
            }).catch((error) => {
                this.$root.$emit('handleError', error);
            });
        }
    },

    mounted() {
        this.groupList2 = Object.values(this.$groups);
    }
}
</script>

<style>

</style>