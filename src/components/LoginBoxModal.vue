<template>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Login</p>
        </header>
        <section class="modal-card-body">
            <b-notification type="is-danger" :auto-close="true" :duration="3500" :active.sync="badPassMsgActive">Incorrect username or password!</b-notification>
            <b-field label="Username">
                <b-input id="username" v-model="username" required></b-input>
            </b-field>

            <b-field label="Password">
                <b-input id="password" type="password" required password-reveal
                    v-model="password"
                    placeholder="password">
                </b-input>
            </b-field>
        </section>
        <footer class="modal-card-foot">
            <button class="button" type="button" @click="$parent.close()">Close</button>
            <button class="button is-primary" @click="checkLogin()">Login</button>
        </footer>
    </div>
</template>

<script>
export default {

    components: {
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
                this.$parent.close();
            }).catch(() => {
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