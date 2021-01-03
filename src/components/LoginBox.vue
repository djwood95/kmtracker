<template>
    <div class="sidebar-box">
        <p class="sidebarHeader">Login</p>
        <b-notification type="is-danger" :auto-close="true" :duration="5000" :active.sync="badPassMsgActive">Incorrect username or password!</b-notification>
        <b-field label="Username" label-position="on-border">
            <b-input id="username" name="username" v-model="username" expanded @keypress.enter="checkLogin()"></b-input>
        </b-field>
        <b-field label="Password" label-position="on-border">
            <b-input id="password" type="password" v-model="password" @keypress.enter.native="checkLogin()"></b-input>
        </b-field>

        <b-button type="is-primary is-light" expanded id="login-btn" @click="checkLogin()">Login</b-button>
        <div class="columns is-variable is-2 mt-1">
            <div class="column">
                <b-button size="is-small" type="is-light" expanded @click="$router.push('/newAccount')">New Account</b-button>
            </div>
            <div class="column">
                <b-button size="is-small" type="is-light" expanded @click="$router.push('/forgotPassword')">Forgot Password</b-button>
            </div>
        </div>

        <b-modal :active.sync="newAccountBoxActive" has-modal-card>
            <new-account></new-account>
        </b-modal>
    </div>
</template>

<script>
import NewAccount from './NewAccount.vue'
export default {

    components: {
        NewAccount
    },

    data() {
        return {
            username: "",
            password: "",
            loginLoading: false,
            badPassMsgActive: false,
            loggedIn: false,
            newAccountBoxActive: false
        }
    },

    mounted() {
        this.loggedIn = localStorage.getItem('loggedIn')=='true';

        this.$root.$on('loggedInEvent', () => {
            this.loggedIn = localStorage.getItem('loggedIn')=='true';
        });
    },

    methods: {
        checkLogin() {
            this.$http.post(this.$api+'/checkLogin', {username: this.username, password: this.password}).then(response => {
                localStorage.setItem('loggedIn', true);
                localStorage.setItem('authToken', response.data.token.token);
                localStorage.setItem('expires', new Date(response.data.token.expires*1000));
                localStorage.setItem('username', response.data.username);
                this.$http.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token.token;
                this.$root.$emit('loggedInEvent');
            }).catch(error => {
                this.badPassMsgActive = true;
            });
        },

        newAccount() {

        },

        forgotPass() {
            this.$buefy.dialog.alert('Coming soon! For now, please email djwood@mtu.edu with your current username using the email associated with your account.');
        }
    }
}
</script>

<style scoped>
    .sidebar-box {
        margin-bottom: 15px;
    }
</style>