<template>
    <div>
        <p class="sidebarHeader">Login</p>
        <b-notification type="is-danger" :auto-close="true" :duration="3500" :active.sync="badPassMsgActive">Incorrect username or password!</b-notification>
        <b-field>
            <b-input name="username" v-model="username" placeholder="Username/Email" expanded @keypress.enter="checkLogin()"></b-input>
        </b-field>
        <b-field>
            <b-input type="password" v-model="password" placeholder="Password" @keypress.enter.native="checkLogin()"></b-input>
        </b-field>

        <div class="buttons has-addons" style="width:100%;margin-bottom:10px;">
            <div class="button is-primary is-fullwidth" @click="checkLogin()">Login</div>
            <div class="button is-small is-info is-outlined is-expanded" @click="$router.push('/newAccount')">New Account</div>
            <div class="button is-small is-info is-outlined is-expanded" @click="forgotPass()">Forgot Password</div>
        </div>

        <b-modal :active.sync="newAccountBoxActive" has-modal-card>
            <NewAccount></NewAccount>
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

        }
    }
}
</script>