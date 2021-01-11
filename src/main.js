import Vue from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import VueRouter from 'vue-router'

import Home from './components/Home.vue'
import Leaderboard from './components/Leaderboard.vue'
import NewAccount from './components/NewAccount.vue'
import Settings from './components/Settings.vue'
import History from './components/History.vue'
import Login from './components/Login.vue'
import NewEntry from './components/NewEntry.vue'
import ForgotPass from './components/ForgotPass.vue'

import 'buefy/dist/buefy.css'

Vue.use(Buefy, {
  defaultIconPack: 'fas'
})
Vue.use(VueRouter)

Vue.config.productionTip = false

const routes = [
  { path: '/', component: Home, meta: {name: 'home', public: true} },
  { path: '/home', component: Home, meta: {name: 'home', public: true} },
  { path: '/leaderboard', component: Leaderboard, props: {header: true}, meta: {name: 'leaderboard', public: true} },
  { path: '/leaderboard/noHeader', component: Leaderboard, props: {header: false}, meta: {name: 'leaderboard-NH', public: true, header: false} },
  { path: '/newAccount', component: NewAccount, meta: {name: 'newAccount', public: true} },
  { path: '/settings', component: Settings, meta: {name: 'settings', public: false} },
  { path: '/history', component: History, meta: {name: 'history', public: false} },
  { path: '/login', component: Login, meta: {name: 'login', public: true} },
  { path: '/newEntry', component: NewEntry, meta: {name: 'newEntry', public: false} },
  { path: '/newEntry/:entryId', component: NewEntry, meta: {name: 'editEntry', public: false} },
  { path: '/forgotPassword', component: ForgotPass, meta: {name: 'forgotPass', public: true} }
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

import VueMq from 'vue-mq'
Vue.use(VueMq, {
  breakpoints: {
    mobile: 768,
    tablet: 1216,
    desktop: Infinity
  }
})

import VueMoment from 'vue-moment'
Vue.use(VueMoment)

import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(axios, VueAxios)

import VueLodash from 'vue-lodash'
import cloneDeep from 'lodash/cloneDeep'
import round from 'lodash/round'
Vue.use(VueLodash, { name: 'custom', lodash: { cloneDeep, round } })

if(process.env.NODE_ENV == "production") {
  Vue.prototype.$api = "/kmtracker/api/public"
} else {
  Vue.prototype.$api = "http://localhost:8081"
}

axios.interceptors.response.use(
  response => response,
  error => {
      const {status} = error.response;
      if (status === 401 && !router.currentRoute.meta.public ) {
        router.push('/login');
      }
      return Promise.reject(error);
 }
);

Vue.prototype.$http = axios
Vue.prototype.$groups = {
  green: {name: 'Green', abbr: 'green', bgColor: 'green', txtColor: 'white'},
  blue: {name: 'Blue', abbr: 'blue', bgColor: 'blue', txtColor: 'white'},
  gray: {name: 'Gray', abbr: 'gray', bgColor: 'lightblue', txtColor: 'black'},
  red: {name: 'Red', abbr: 'red', bgColor: 'red', txtColor: 'black'},
  yellow: {name: 'Yellow', abbr: 'yellow', bgColor: 'yellow', txtColor: 'black'},
  purple: {name: 'Purple', abbr: 'purple', bgColor: 'purple', txtColor: 'white'},
  adventure: {name: 'Adventure', abbr: 'adventure', bgColor: 'brown', txtColor: 'white'},
  devo: {name: 'Development Team (Devo)', abbr: 'devo', bgColor: 'gray', txtColor: 'black'},
  comp: {name: 'Competition Team (Comp)', abbr: 'comp', bgColor: 'orange', txtColor: 'black'},
  parent: {name: 'Parents/Coaches/Other', abbr: 'parent', bgColor: 'black', txtColor: 'white'},
  other: {name: 'Other', abbr: 'other', bgColor: 'black', txtColor: 'white'},
}

new Vue({
  data: {
    loggedIn: false,
    username: ''
  },
  router,
  render: h => h(App),
}).$mount('#app')
