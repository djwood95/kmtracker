<template>
  <div>

    <!-- MOBILE LOGIN Buttons -->
    <div class="buttons is-centered" v-if="$mq==='mobile' && !loggedIn" style="margin:20px;">
      <div class="button is-primary is-fullwidth" @click="loginModal=true">Login</div>
      <div class="button is-primary" @click="$router.push('/newAccount')">New Account</div>
      <div class="button is-primary" @click="$router.push('/forgotPassword')">Forgot Password?</div>
    </div>

    <!-- Main page content - all sizes -->
    <div class="columns content" style="width:calc(100% - 10px);">
      <div class="column is-three-quarters" style="margin-left:10px;margin-top:10px;">
        <h3 class="has-text-centered" style="padding:10px;">Welcome to the Ski Tigers Kilometer Club!</h3>
        <p>
          The goal of the Kilometer Club is to encourage kids (and parents) to get out and ski. 
          As an incentive the top three Ski Tigers who log the most kilometers in each group (including the race teams) will receive a special award at the Picnic in the Snow. 
          All skiers who participate will receive a certificate with the number of kilometers they skied. 
          Ski Tigers can start logging kilometers as soon as the snow flies all the way up to the week before the Picnic in the Snow.
          <br/><br/>
          This website provides a quick and easy way to track kilometers and see how you compare to other Tigers. To get started, use the New Account button at right - all you
          need is a username, email, and password!
        </p>

        <h3>Questions/Comments?</h3>
        Please send any questions or comments regarding this website to djwood@mtu.edu
      </div>

      <!-- Sidebar content - moved to bottom on mobile -->
      <div class="column" id="homeSidebar">
        <sidebar></sidebar>
      </div>
    </div>

    <!-- Login pop-up box (for mobile) -->
    <b-modal :active.sync="loginModal" has-modal-card>
      <login-box-modal></login-box-modal>
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
  },

  methods: {
    forgotPass() {
      alert('test');
      this.$buefy.dialog.alert('Coming soon! For now, please email djwood@mtu.edu with your current username using the email associated with your account.');
    }
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
