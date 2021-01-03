<template>
    <section class="section content">
        <h1 class="has-text-centered">Password Reset</h1>

        <b-notification :type="noteType" :active.sync="noteActive" auto-close :duration="10000">
            {{noteMessage}}
        </b-notification>

        <div v-if="step === 'email'">
            <b-field horizontal label="Username">
                <b-input id="username" type="text" v-model="username"></b-input>
            </b-field>

            <b-field horizontal label="Email">
                <b-input id="email" type="email" v-model="email"></b-input>
            </b-field>

            <div class="buttons is-centered">
                <b-button @click="$router.push('/')">Cancel</b-button>
                <b-button @click="checkEmail()" type="is-primary">Continue</b-button>
            </div>
        </div>

        <div v-if="step==='code'">

            <h3 class="has-text-centered">A reset code has been emailed to {{email}}. Please enter it below to continue.</h3>

            <b-field>
                <b-input id="code" type="text" v-model="code" size="is-large"></b-input>
            </b-field>

            <div class="buttons is-centered">
                <b-button @click="$router.push('/')">Cancel</b-button>
                <b-button @click="checkEmail()">Resend Email</b-button>
                <b-button @click="checkCode()" type="is-primary">Continue</b-button>
            </div>
        </div>

        <div v-if="step==='newPass'">
            <b-field horizontal label="New Password">
                <b-input id="password1" type="password" v-model="newPass1" minlength="6" maxlength="100"></b-input>
            </b-field>

            <b-field horizontal label="Repeat Password">
                <b-input id="password2" type="password" v-model="newPass2" minlength="6" maxlength="100"></b-input>
            </b-field>

            <div class="buttons is-centered">
                <button class="button" type="button" @click="$router.push('/')">Cancel</button>
                <button class="button is-primary" @click="newPass()">Continue</button>
            </div>
        </div>
    </section>
</template>

<script>
export default {

    data() {
        return {
            username: "",
            email: "",
            userId: -1,
            newPass1: "",
            newPass2: "",

            noteActive: false,
            noteType: "",
            noteMessage: "",

            step: 'email'
        }
    },

    methods: {
        checkEmail() {
            this.noteActive = false;
            this.$http.post(this.$api+'/resetPass/checkEmail', {email: this.email, username: this.username}).then(response => {
                this.noteActive = true;
                this.noteType = 'is-success';
                this.noteMessage = "Success! You should receive an email with a password reset code.";
                this.step = 'code';
                this.userId = parseInt(response.data.userId);
            }).catch(() => {
                this.noteActive = true;
                this.noteType = 'is-danger';
                this.noteMessage = "Username/email not found. Please try again.";
            });
        }, 

        checkCode() {
            this.noteActive = false;
            this.$http.post(this.$api+'/resetPass/checkCode', {code: this.code, userId: this.userId}).then(() => {
                this.noteActive = true;
                this.noteType = 'is-success';
                this.noteMessage = "Success! You can now enter a new password.";
                this.step = 'newPass';
            }).catch(() => {
                this.noteActive = true;
                this.noteType = 'is-danger';
                this.noteMessage = "Error: The code did not match or was expired.";
            });
        },

        newPass() {
            if (this.newPass1.length < 6 || this.newPass1.length > 100) {
                this.noteActive = true;
                this.noteType = 'is-danger';
                this.noteMessage = 'Password must be between 6 and 100 characters.';
                return;
            }
            
            if(this.newPass1 !== this.newPass2) {
                this.noteActive = true;
                this.noteType = 'is-danger';
                this.noteMessage = "Error: The passwords do not match.";
                return;
            }

            this.noteActive = false;
            this.$http.post(this.$api+'/resetPass/saveNewPass', {newPass: this.newPass1, userId: this.userId}).then(() => {
                this.noteActive = true;
                this.noteType = 'is-success';
                this.noteMessage = "Success! Your password has been changed";
                this.$router.push("/");
            }).catch(() => {
                this.noteActive = true;
                this.noteType = 'is-danger';
                this.noteMessage = "Error saving password. Please try again.";
            });
        }
    }

}
</script>