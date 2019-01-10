<template>
    <div>
        <b-modal :active.sync="loginModalActive">
            <login-box-modal></login-box-modal>
        </b-modal>
    </div>
</template>

<script>
import LoginBoxModal from './LoginBoxModal.vue'
export default {
    components: {
        LoginBoxModal
    },

    data() {
        return {
            loginModalActive: true
        }
    },

    watch: {
        loginModalActive() {
            if(!this.loginModalActive) {
                if(localStorage.getItem('loggedIn')=='true') this.$router.go(-1);
                else this.$router.push('/');
            }
        }
    }
}
</script>