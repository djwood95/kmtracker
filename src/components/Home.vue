<template>
  <div>
    <div class="buttons is-centered" v-if="$mq==='mobile' && !loggedIn" style="margin:20px;">
      <div class="button is-primary is-fullwidth" @click="loginModal=true">Login</div>
      <div class="button is-primary" @click="$router.push('/newAccount')">New Account</div>
      <div class="button is-primary">Forgot Password?</div>
    </div>
    <div class="columns content" style="width:calc(100% - 10px);">
      <div class="column is-three-quarters" style="margin-left:10px;margin-top:10px;">
        <h3 class="has-text-centered" style="padding:10px;">Welcome to the Ski Tigers Kilometer Club!</h3>
        <p>
          The Ski Tigers Kilometer Club program is a long-time tradition that encourages the kids to ski more through competition with their fellow skiers, as well as to get the awards at the end of the year. Each skier keeps track of their "K's" througout the ski season, then they are all tallied up for season-ending and monthly awards in some groups.
          This website is designed to make it easier for skiers, coaches, and parents to keep track of their kilometers. The intent is that it will also drive up competition among skiers by giving them real-time results for themselves and their friends. Thank you for checking this site out, and please let us know how you liked it so we can improve it in the future! 
        </p>
      </div>

      <div class="column" id="homeSidebar">
        <sidebar></sidebar>
      </div>
    </div>

    <b-modal :active.sync="loginModal" has-modal-card>
      <login-box-modal></login-box-modal>
    </b-modal>

    <b-modal :active.sync="newAcctModal" has-modal-card>
      <new-account></new-account>
    </b-modal>
  </div>
</template>

<script>

import Sidebar from './HomeSidebar.vue'
import LoginBoxModal from './LoginBoxModal.vue'
import NewAccount from './NewAccount.vue'

export default {
  name: 'Home',
  components: {
    Sidebar,
    LoginBoxModal,
    NewAccount
  },

  data() {
    return {
      loggedIn: localStorage.getItem('loggedIn')=='true',
      newAccountBoxActive: false,
      newAcctModal: false,
      loginModal: false
    }
  },

  mounted() {
    this.$root.$on('loggedInEvent', () => {
        this.loggedIn = localStorage.getItem('loggedIn')=='true';
    });

    this.$root.$on('showLoginBox', () => {
      this.loginModal = true;
    });
  }
}
</script>

<style>
  #homeSidebar {
    border:2px solid #0249C1;
    border-right:none;
    margin-top:10px;
    margin-bottom:10px;
    margin-right:-22px;
    border-bottom-left-radius:10px;
    padding:5px;
    padding-top:0px;
  }

  @media only screen and (max-width: 768px) {
    #homeSidebar {
      border-right:2px solid #0249C1;
      margin-left:20px;
      margin-right:0px;
      border-radius:0px;

    }
  }
</style>
