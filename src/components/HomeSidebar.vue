<template>
    <div>
        <login-box v-if="!loggedIn"></login-box>
        <div>
            <p class="sidebarHeader">Trail Conditions</p>
            <p>Want to get out skiing, but don't know if the trails are groomed? Check out the sites below for trail conditions:</p>
            <ul>
                <li><a href="https://keweenawtrails.com/trail-reports/" target="_new">keweenawtrails.com</a> - local groomer reports</li>
                <li><a href="http://www.skinnyski.com/trails/reports.asp" target="_new">skinnyski.com</a> - user submitted reports covering the entire midwest</li>
            </ul>
        </div>
    </div>
</template>

<script>
import LoginBox from './LoginBox.vue'
export default {
    components: {
        LoginBox
    },

    computed: {
        loggedIn() {
            return this.$root.$data.loggedIn;
        }
    }
}
</script>

<style>
    .sidebarHeader {
        font-size:1.2em;
        background-color:#0249C1;
        color:white;
        margin-left:-5px;
        width:calc(100% + 10px);
        text-align:center;
    }
</style>