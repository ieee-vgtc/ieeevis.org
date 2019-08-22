<template>
    <nav class="bg-primary text-white m-4">
        <ul class="flex justify-around items-center relative">
            <li class="font-bold">VIS 2019</li>
            <li>
                <span id="tab1" class="tab block p-4 hover:bg-primary-700" v-on:click="toggleMenu('attend')">Attend <i class="material-icons text-lg inline align-bottom">arrow_drop_down</i></span>
                <div id="item1" class="item absolute bg-primary-700 p-6 w-full left-0" v-if="menu.attend">
                    <div class="flex justify-around">
                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Register</span></li>
                            <li class="my-4"><a href="">Registration</a></li>
                            <li class="my-4"><a href="">Important Dates</a></li>
                            <li class="my-4"><a href="">Student Volunteers</a></li>
                        </ul>

                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Travel</span></li>
                            <li class="my-4"><a href="">Accommodations</a></li>
                            <li class="my-4"><a href="">Visa & Travel</a></li>
                            <li class="my-4"><a href="">Things to do in City</a></li>
                        </ul>

                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Equity, Inclusion, & Diversity</span></li>
                            <li class="my-4"><a href="">Inclusivity Programs</a></li>
                            <li class="my-4"><a href="">VisKids</a></li>
                            <li class="my-4"><a>VisKids Childcare Grants</a></li>
                            <li class="my-4"><a href="">Inclusivity & Diversity Scholarship</a></li>
                            <li class="my-4">&nbsp;</li>
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Code of Conduct</span></li>
                            <li class="my-4"><a href="">IEEE VIS Code of Conduct</a></li>
                            <li class="my-4"><a href="">IEEE Computer Society Open Conference Statement</a></li>
                            <li class="my-4"><a href="">IEEE Event Conduct and Safety</a></li>
                        </ul>

                    </div>
                </div>
            </li>

            <li>
        <span id="tab2" class="tab block p-4 hover:bg-primary-700" onclick="showMenu(event, 'item2');">Contribute <i class="material-icons text-lg inline align-bottom">
          arrow_drop_down
          </i></span>
                <div id="item2" class="item absolute hidden bg-primary-700 p-6">
                    <ul>
                        <li class="my-4"><span class="text-xs uppercase opacity-75">Call for Participation</span></li>
                        <li class="my-4"><a href="">Papers</a></li>
                        <li class="my-4"><a href="">Short Papers</a></li>
                        <li class="my-4"><a href="">Posters</a></li>
                        <li class="my-4"><a href="">Tutorials</a></li>
                        <li class="my-4"><a href="">Workshops</a></li>
                        <li class="my-4"><a href="">Panels</a></li>
                        <li class="my-4"><a href="">Doctorial Colloqium</a></li>
                        <li class="my-4"><a href="">Application Spotlights</a></li>
                    </ul>
                </div>
            </li>

            <li>
        <span id="tab3" class="tab block p-4 hover:bg-primary-700" onclick="showMenu(event, 'item3');">Program <i class="material-icons text-lg inline align-bottom">
          arrow_drop_down
          </i></span>
                <div id="item3" class="item absolute hidden bg-primary-700 p-6 w-full left-0">
                    <div class="flex justify-around">
                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Guides</span></li>
                            <li class="my-4"><a href="">Pocket Program (PDF)</a></li>
                            <li class="my-4"><a href="">Full Program (PDF)</a></li>
                            <li class="my-4"><a href="">Practitioner Guide</a></li>
                            <li class="my-4">&nbsp;</li>
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Talks</span></li>
                            <li class="my-4"><a href="">Keynote Address</a></li>
                            <li class="my-4"><a href="">Capstone Address</a></li>
                        </ul>
                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Sessions</span></li>
                            <li class="my-4"><a href="">Workshops</a></li>
                            <li class="my-4"><a href="">Posters</a></li>
                            <li class="my-4"><a href="">Tutorials</a></li>
                            <li class="my-4"><a href="">Panels</a></li>
                            <li class="my-4"><a href="">Paper Sessions</a></li>
                            <li class="my-4"><a href="">Doctorial Colloqium</a></li>
                            <li class="my-4"><a href="">Application Spotlights</a></li>
                        </ul>
                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Awards and Recognitions</span>
                            <li class="my-4"><a href="">Best Paper Awards</a></li>
                            <li class="my-4"><a href="">Best Poster Awards</a></li>
                            <li class="my-4"><a href="">Service Awards</a></li>
                            <li class="my-4"><a href="">VGTC VIS Awards</a></li>
                            <li class="my-4"><a href="">Test of Time Awards</a></li>
                        </ul>
                    </div>
                </div>
            </li>

            <li>
        <span id="tab4" class="tab block p-4 hover:bg-primary-700" onclick="showMenu(event, 'item4');">Events&nbsp;&&nbsp;Community <i class="material-icons text-lg inline align-bottom">
          arrow_drop_down
          </i></span>
                <div id="item4" class="item absolute hidden bg-primary-700 p-6 w-full left-0">
                    <div class="flex justify-around">
                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Associated Events</span></li>
                            <li class="my-4"><a href="">VAHC: Visual Analytics in Healthcare</a></li>
                            <li class="my-4"><a href="">VDS: Vis in Data Science</a></li>
                            <li class="my-4"><a href="">VIS4DH: Vis for the Digital Humanities</a></li>
                            <li class="my-4"><a href="">LDAV: Large Data Analysis & Vis</a></li>
                            <li class="my-4"><a href="">VisInPractice</a></li>
                            <li class="my-4"><a href="">VizSec</a></li>
                            <li class="my-4"><a href="">VIS Arts Program</a></li>
                            <li class="my-4"><a href="">Velo Club de VIS</a></li>
                            <li class="my-4"><a href="">Vis Pioneers Group</a></li>
                        </ul>

                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Challenges</span></li>
                            <li class="my-4"><a href="">VAST Challenge</a></li>
                            <li class="my-4"><a href="">SciVis Contest</a></li>
                            <li class="my-4"><a href="">BioViz Challenges</a></li>
                        </ul>
                        <ul class="inline-block align-top">
                            <li class="my-4"><span class="text-xs uppercase opacity-75">Connect</span></li>
                            <li class="my-4"><a href="">Community</a></li>
                            <li class="my-4"><a href="">Vis Buddies</a></li>
                            <li class="my-4"><a href="">Meetups</a></li>
                            <li class="my-4"><a href="">Job Fair</a></li>
                        </ul>
                    </div>
                </div>
            </li>

            <li>
                <a href="" class="block p-4 hover:bg-primary-700">Register</a>
            </li>

        </ul>
    </nav>
</template>

<script>
module.exports = {
    data: function() {
        return {
            menu: {
                attend: false,
                contribute: false,
                program: false,
                events: false
            }
        };
    },
    methods: {
        toggleMenu: function (menuItem) {
            this.menu[menuItem] = !this.menu[menuItem];
        }
    }
}
</script>
