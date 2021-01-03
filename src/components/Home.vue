<template>
  <section class="section">

    <!-- MOBILE LOGIN Buttons -->
    <div class="buttons is-centered" v-if="$mq !== 'desktop' && !loggedIn">
      <b-button type="is-light" :expanded="$mq === 'mobile'" @click="$router.push('/newAccount')">New Account</b-button>
      <b-button type="is-primary is-light" :expanded="$mq === 'mobile'" size="is-large" @click="openLoginModal()">Login</b-button>
      <b-button type="is-light" :expanded="$mq === 'mobile'" @click="$router.push('/forgotPassword')">Forgot Password?</b-button>
    </div>

    <!-- Main page content - all sizes -->
    <div class="columns content">
      <div class="column is-three-quarters-widescreen">
        <h3 class="has-text-centered">Welcome to the Ski Tigers Kilometer Club!</h3>
        <p>
          The goal of the Kilometer Club is to encourage kids (and parents) to get out and ski. 
          As an incentive the top three Ski Tigers who log the most kilometers in each group (including the race teams) will receive a special award at the Picnic in the Snow. 
          All skiers who participate will receive a certificate with the number of kilometers they skied. 
          Ski Tigers can start logging kilometers as soon as the snow flies all the way up to the week before the Picnic in the Snow.
          <br/><br/>
          This website provides a quick and easy way to track kilometers and see how you compare to other Tigers. To get started, use the New Account button at right - all you
          need is a username, email, and password!
        </p>

        <div v-if="$mq !== 'desktop'">
          <h3 class="has-text-centered">Trail Conditions</h3>
          <p>Want to get out skiing, but don't know if the trails are groomed? Check out the sites below for trail conditions:</p>
            <ul>
                <li><a href="https://keweenawtrails.com/trail-reports/" target="_new">keweenawtrails.com</a> - local groomer reports</li>
                <li><a href="http://www.skinnyski.com/trails/reports.asp" target="_new">skinnyski.com</a> - user submitted reports covering the entire midwest</li>
            </ul>
        </div>

        <h3 class="has-text-centered">Questions/Comments?</h3>
        Please send any questions or comments regarding this website to <a href="mailto:kmtracker@skitigers.org">kmtracker@skitigers.org</a>
      </div>

      <!-- Sidebar content - moved to bottom on mobile -->
      <div class="column" id="homeSidebar" v-if="$mq === 'desktop'">
        <sidebar></sidebar>
      </div>
    </div>

  </section>
</template>

<script>

import Sidebar from './HomeSidebar.vue'
import LoginBoxModal from './LoginBoxModal.vue'

export default {
  name: 'Home',
  components: {
    Sidebar,
    LoginBoxModal
  },

  data() {
    return {
      loggedIn: localStorage.getItem('loggedIn')=='true',
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
    openLoginModal() {
      this.$buefy.modal.open({
        parent: this,
        component: LoginBoxModal,
        hasModalCard: true,
        trapFocus: true
      });
    }
  }
}
</script>

<style>
  #homeSidebar {
    border:2px solid #0249C1;
    border-right:none;
    border-bottom-left-radius:10px;
    padding:5px;
    padding-top:0px;
    position: relative;
    top: -36px;
    right: -12px;
  }
</style>
