<template>
    <div class="sidebar-box">
        <p class="sidebarHeader">Login</p>
        <b-notification type="is-danger" :auto-close="true" :duration="5000" :active.sync="badPassMsgActive">Incorrect username or password!</b-notification>
        <b-field label="Username" label-position="on-border">
            <b-input id="username" name="username" v-model="username" expanded></b-input>
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
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: "",
            password: "",
            loginLoading: false,
            badPassMsgActive: false
        }
    },

    methods: {
        checkLogin() {
            this.$http.post(this.$api+'/checkLogin', {username: this.username, password: this.password}).then(response => {
                localStorage.setItem('authToken', response.data.token.token);
                this.$http.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.token.token;
                this.$root.$data.loggedIn = true;
                this.$root.$data.username = response.data.username;
            }).catch(() => {
                this.badPassMsgActive = true;
            });
        }
    }
}
</script>

<style scoped>
    .sidebar-box {
        margin-bottom: 15px;
    }
</style>