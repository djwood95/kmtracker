<template>
<div id="scrollContainer">
  <div id="mainContainer">
    
        <nav class="navbar" v-if="showNavBar" :class="{'is-fixed-top': $mq==='mobile'}">
          <div class="navbar-brand">
            <router-link to="/home" class="navbar-item topLevel">Home</router-link>
            <router-link to="/leaderboard" class="navbar-item topLevel">Leaderboard</router-link>
            <router-link to="/newEntry" class="navbar-item topLevel" v-if="loggedIn">New Entry</router-link>

            <div class="navbar-item has-dropdown is-hoverable" v-if="loggedIn && $mq === 'desktop'">
              <a class="navbar-link topLevel">{{username}}</a>
              <div class="navbar-dropdown">
                <router-link to="/settings" class="navbar-item">Settings</router-link>
                <!--<router-link to="/stats" class="navbar-item">Stats</router-link>-->
                <router-link to="/history" class="navbar-item">Past Entries</router-link>
                <a class="navbar-item" @click="logout()">Logout</a>
              </div>
            </div>

            <div class="navbar-burger" :class="{'is-active': mobileMenuActive}" @click="mobileMenuActive=!mobileMenuActive" v-if="loggedIn">
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </div>
          </div>

          <div class="navbar-menu" :class="{'is-active': mobileMenuActive}" v-if="$mq !== 'desktop'">
            <div v-if="loggedIn && mobileMenuActive">
              <router-link to="/settings" class="navbar-item">Settings</router-link>
              <!--<router-link to="/stats" class="navbar-item">Stats</router-link>-->
              <router-link to="/history" class="navbar-item">Past Entries</router-link>
              <a class="navbar-item" @click="logout()">Logout</a>
            </div>
          </div>
        </nav>

        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>

         <b-modal :active.sync="loginModal" has-modal-card>
          <login-box-modal></login-box-modal>
        </b-modal>

  </div>
</div>
</template>

<script>

export default {
  name: 'app',
  components: {
  },

  data() {
    return {
      mobileMenuActive: false,
      loginModal: false
    }
  },

  computed: {
    loggedIn() {
      return this.$root.$data.loggedIn;
    },

    username() {
      return this.$root.$data.username;
    },

    showNavBar() {
      if (this.$route.meta.header === undefined) return true;
      return this.$route.meta.header;
    }
  },

  watch: {

    //triggered everytime page changes
    $route (to, from) {
      this.mobileMenuActive = false;
      this.trackPageLoad(to, from);
    }

  },

  created() {
    const authToken = localStorage.getItem('authToken');
    this.$http.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    this.$http.get(`${this.$api}/api/getUsername`).then(response => {
      this.$root.$data.username = response.data;
      this.$root.$data.loggedIn = true;
    }).catch(() => {
      this.$root.$data.loggedIn = false;
      localStorage.removeItem('authToken');
    });
  },

  mounted() {
    this.$root.$on('showLoginBox', () => {
        this.loginModal = true;
    });

    this.$root.$on('checkLogin', () => {
      this.$http.get(this.$api+'/api/testLogin').then(() => {
      }).catch(() => {
          this.$router.push('/login');
      });
    });

    this.$root.$on('handle-error', (error, msg = '') => {
      if (msg.length === 0) msg = 'Sorry, there was an error.';
      this.$buefy.toast.open({
        duration: 5000,
        message: msg,
        type: 'is-danger'
      });

      if (this.$env != "production") {
        // eslint-disable-next-line no-console
        console.log(error);
      }
    });
  },

  methods: {
    logout() {
      localStorage.removeItem('authToken');
      this.$http.defaults.headers.common['Authorization'] = null;
      this.$router.push('/');
      this.$root.$data.loggedIn = false;
      this.$root.$data.username = '';
    },

    trackPageLoad(toRoute, fromRoute) {
      let isLoggedIn = localStorage.getItem('loggedIn') == 'true';
      this.$http.post(this.$api+'/trackPageLoad', {
        toPage: toRoute.meta.name,
        fromPage: fromRoute.meta.name,
        loggedIn: isLoggedIn,
        deviceWidth: screen.width,
        deviceHeight: screen.height
      });
    }
  }
}
</script>

<style>

#mainContainer {
  box-shadow:0px 0px 10px black;
  max-width:1216px;
  margin:0 auto;

  border-radius:10px;
  position:relative;
  top:10px;

  margin-bottom:10px;
  min-height:calc(100% - 25px);

  background-color:white;

}

#scrollContainer {
  overflow:auto;
  height:100%;
}

#mainContainer .navbar {
  border-top-left-radius:10px;
  border-top-right-radius:10px;
  text-align:center;
  border-bottom:2px solid #0249C1;
}

.navbar-brand,.navbar-menu,.navbar {
  justify-content: center;
}

.nav-link {
  border-bottom: 1px solid transparent;
}

.navbar-item.topLevel:hover {
  color:#0249C1 !important;
  border-bottom:1px solid #0249C1;
}

/* override styles for mobile view */
@media only screen and (max-width: 1216px) {
  #mainContainer {
    box-shadow:none;
    top:0px;
    border-radius:0px;
  }
}

/* page transitions */
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}
</style>
