import style from "./styles/index.css";

import Navbar from './components/navbar'
import Vue from 'vue'

document.addEventListener('DOMContentLoaded', () => {
    new Vue({
        el: '#app',
        components: {
            Navbar
        }
    });
});
