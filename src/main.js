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

import 'buefy/dist/buefy.css'

Vue.use(Buefy)
Vue.use(VueRouter)

Vue.config.productionTip = false

const routes = [
  { path: '/', component: Home },
  { path: '/home', component: Home },
  { path: '/leaderboard', component: Leaderboard },
  { path: '/newAccount', component: NewAccount },
  { path: '/settings', component: Settings },
  { path: '/history', component: History },
  { path: '/login', component: Login },
  { path: '/newEntry', component: NewEntry }
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

import VueMq from 'vue-mq'
Vue.use(VueMq, {
  breakpoints: {
    mobile: 768,
    desktop: Infinity
  }
})

import VueMoment from 'vue-moment'
Vue.use(VueMoment)

import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(axios, VueAxios)

if(process.env.NODE_ENV == "production") {
  Vue.prototype.$api = "/shine3/api/public/api"
  Vue.prototype.$publicAPI = "/shine3/api/public/public"
} else {
  Vue.prototype.$api = "http://localhost:8081"
  Vue.prototype.$publicAPI = "http://localhost:8080/public"
}

axios.interceptors.response.use(
  response => response,
  error => {
      const {status} = error.response;
      if (status === 401) {
        router.push('/login');
      }
      return Promise.reject(error);
 }
);

Vue.prototype.$http = axios
Vue.prototype.$groups = {
  All: {name: 'All', abbr: 'All', bgColor: 'black', txtColor: 'white'},
  green: {name: 'Green', abbr: 'green', bgColor: 'green', txtColor: 'white'},
  blue: {name: 'Blue', abbr: 'blue', bgColor: 'blue', txtColor: 'white'},
  red: {name: 'Red', abbr: 'red', bgColor: 'red', txtColor: 'black'},
  yellow: {name: 'Yellow', abbr: 'yellow', bgColor: 'yellow', txtColor: 'black'},
  purple: {name: 'Purple', abbr: 'purple', bgColor: 'purple', txtColor: 'white'},
  adventure: {name: 'Adventure', abbr: 'adventure', bgColor: 'brown', txtColor: 'white'},
  devo: {name: 'Development Team (Devo)', abbr: 'devo', bgColor: 'gray', txtColor: 'black'},
  comp: {name: 'Competition Team (Comp)', abbr: 'comp', bgColor: 'orange', txtColor: 'black'},
  parent: {name: 'Parents/Coaches/Other', abbr: 'parent', bgColor: 'black', txtColor: 'white'},
  other: {name: 'Other', abbr: 'other', bgColor: 'black', txtColor: 'white'}
}

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
