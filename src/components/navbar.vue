<template>
<div>
    <nav class="bg-accent">
        <span class="text-lg text-blue-700">VIS 2019</span>
        <span>
            <i class="material-icons align-middle">menu</i> Menu
        </span>
    </nav>

    <hr class="mb-24">

    <nav class="md:bg-accent bg-white flex items-center mb-8 relative">
      <span class="text-lg text-blue-700">VIS 2019</span>
      <div class="block mr-4 md:hidden text-blue-700 font-display">
        <button onclick="showMobileNav(event);" aria-haspopup="true" aria-expanded="false"
          class="flex items-center p-3 hover:bg-teal-200">
          <svg aria-hidden="true" class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
          <span class="font-bold text-2xs ml-2">Menu</span>
        </button>
      </div>

      <div class="">
        <ul class="flex-grow font-display md:flex hidden md:flex-row flex-col items-center text-blue-700 text-sm">
          <li>
            <span tabindex='0' class="p-4 tab" role="menuitem" aria-haspopup="true" aria-expanded="false" data-nav='attend'>Attend</span>
            <div class="submenu absolute hidden" role="menu" aria-label="attend submenu" aria-hidden="true" data-nav='attend'>
              <div class="submenu__column">

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--blue">
                    <a href="">Attending vis 2019
                      <i class="material-icons align-middle">
                        arrow_right_alt
                      </i>
                    </a>
                  </p>
                  <p class="submenu__description">TK TK TK Why attend this premier forum for advances in visualization</p>
                  <div class="submenu__subcolumn-container">
                    <ul class="submenu__subcolumn">
                      <li class="submenu__heading submenu__heading--gray">Attend</li>
                      <li><a href="">Registration</a></li>
                      <li><a href="">Conference Venue</a></li>
                      <li><a href="">Newcomer’s Guide</a></li>
                    </ul>
                    <ul class="submenu__subcolumn">
                      <li class="submenu__heading submenu__heading--gray">Travel</li>
                      <li><a href="">Accomodations</a></li>
                      <li><a href="">Visa & Travel</a></li>
                      <li><a href="">Things to do in City</a></li>
                    </ul>
                  </div>
                </div>

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--blue">
                    <a href="">Code Of Conduct
                      <i class="material-icons align-middle">
                        arrow_right_alt
                      </i>
                    </a>
                  </p>
                </div>
              </div>

              <div class="submenu__column">

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--blue">
                    <a href="">Equality, Inclusion & Diversity
                      <i class="material-icons align-middle">
                        arrow_right_alt
                      </i>
                    </a>
                  </p>
                  <div class="submenu__detailed-link">
                    <a href="">Inclusivity & Diversity Scholarship</a>
                    <p class="submenu__description">TK TK TK Offering need-based scholarships for conference attendance</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">VisKids Childcare Grants</a>
                    <p class="submenu__description">TK TK TK Grants to support our VISKids and young families</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">VisKids</a>
                    <p class="submenu__description">TK TK TK Space provided for discussions, play, and personal considerations</p>
                  </div>
                </div>

              </div>
            </div>
          </li>
          <li>
            <button class="p-4 tab" onclick="showNav(event);" role="menuitem" aria-haspopup="true" aria-expanded="false" data-nav="contribute">Contribute</button>
            <div class="submenu absolute hidden" role="menu" aria-label="contribute submenu" aria-hidden="true" data-nav='contribute'>
              <div class="submenu__column">

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--blue">
                    <a href="">Call for Participation
                      <i class="material-icons align-middle">
                        arrow_right_alt
                      </i>
                    </a>
                  </p>
                  <p class="submenu__description">TK TK TK Submit research contributions, innovative applications, and more</p>
                  <div class="submenu__subcolumn-container">
                    <ul class="submenu__subcolumn">
                      <li class="submenu__heading submenu__heading--gray">Submit a session</li>
                      <li><a href="">Papers</a></li>
                      <li><a href="">Short Papers</a></li>
                      <li><a href="">Posters</a></li>
                      <li><a href="">Tutorials</a></li>
                      <li><a href="">Workshops</a></li>
                      <li><a href="">Panels</a></li>
                      <li><a href="">Doctorial Colloqium</a></li>
                      <li><a href="">Posters</a></li>
                      <li><a href="">Application Spotlights</a></li>
                    </ul>
                    <ul class="submenu__subcolumn">
                      <li class="submenu__heading submenu__heading--gray">Info for presenters</li>
                      <li><a href="">Important Dates</a></li>
                      <li><a href="">Open Practices</a></li>
                    </ul>
                  </div>
                </div>

              </div>

              <div class="submenu__column">

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--dark-gray">Get involved</p>
                  <div class="submenu__detailed-link">
                    <a href="">Organize a meetup</a>
                    <p class="submenu__description">TTK TK Meet people, discuss topics, and share experiences</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Student volunteers</a>
                    <p class="submenu__description">TK TK Apply to become a volunteer and attend VIS at a discount</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Become a peer reviewers</a>
                    <p class="submenu__description">TK TK TK Review papers [TBD]</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Become an organizer</a>
                    <p class="submenu__description">TK TK TK Join the committees and help organize VIS</p>
                  </div>
                </div>

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--blue">
                    <a href="">Supportor and exhibitors
                      <i class="material-icons align-middle">
                        arrow_right_alt
                      </i>
                    </a>
                  </p>
                  <p class="submenu__description">TK TK TK Your support makes this conference possible</p>
                </div>

              </div>
            </div>
          </li>
          <li>
            <button class="p-4 tab" onclick="showNav(event);" role="menuitem" aria-haspopup="true" aria-expanded="false" data-nav='program'>Program</button>
            <div class="submenu absolute hidden" role="menu" aria-label="program submenu" aria-hidden="true" data-nav='program'>
              <div class="submenu__column">

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--blue">
                    <a href="">VIS Program
                      <i class="material-icons align-middle">
                        arrow_right_alt
                      </i>
                    </a>
                  </p>
                  <div class="submenu__detailed-link">
                    <a href="">Paper Sessions</a>
                    <p class="submenu__description">TK TK TK description of paper sessions</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Posters</a>
                    <p class="submenu__description">TK TK TK description of posters</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Tutorials</a>
                    <p class="submenu__description">TK TK TK description of tutorials</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Workshops</a>
                    <p class="submenu__description">TK TK TK description of workshops</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Panels</a>
                    <p class="submenu__description">TK TK TK description of panels</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Doctorial Colloquim</a>
                    <p class="submenu__description">TK TK TK description of doctorial colloqium</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">Application Spotlights</a>
                    <p class="submenu__description">TK TK TK description of application spotlights</p>
                  </div>
                </div>

              </div>

              <div class="submenu__column">

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--dark-gray">Program Guide</p>
                  <p class="submenu__description">TK TK TK Get an overview of what’s happening at VIS 2019</p>

                  <div class="submenu__subcolumn-container">
                    <ul class="submenu__subcolumn">
                      <li><a href="">Download the App</a></li>
                      <li><a href="">Pocket Program (PDF)</a></li>
                      <li><a href="">Practioner Guide</a></li>
                    </ul>
                    <ul class="submenu__subcolumn">
                      <li><a href="">Keynote Address</a></li>
                      <li><a href="">Capstone Address</a></li>
                    </ul>
                  </div>
                </div>

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--blue">
                    <a href="">Awards And Recognitions
                      <i class="material-icons align-middle">
                        arrow_right_alt
                      </i>
                    </a>
                  </p>
                  <p class="submenu__description">TK TK TK Recognizing outstanding work from the conference</p>
                  <ul class="submenu__subcolumn">
                    <li><a href="">Best Paper Awards</a></li>
                    <li><a href="">Best Poster Awards</a></li>
                    <li><a href="">Service Awards</a></li>
                    <li><a href="">VGTC VIS Awards</a></li>
                    <li><a href="">Test Of Time Awards</a></li>
                  </ul>
                </div>

              </div>

            </div>
          </li>
          <li>
            <button class="p-4 tab" onclick="showNav(event);" role="menuitem" aria-haspopup="true" aria-expanded="false" data-nav='events'>Events & Community</button>
            <div class="submenu absolute hidden" role="menu" aria-label="events and community submenu" aria-hidden="true" data-nav='events'>
              <div class="submenu__column">

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--dark-gray">Associated events</p>
                  <div class="submenu__detailed-link">
                    <a href="">VIS Arts Programs</a>
                    <p class="submenu__description">TK TK TK Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">VisInPractice</a>
                    <p class="submenu__description">TK TK TK Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">VizSec</a>
                    <p class="submenu__description">TK TK TK Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">VAHC: Visual Analytics in Healthcare</a>
                    <p class="submenu__description">TK TK TK Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">VDS: Vis in Data Science</a>
                    <p class="submenu__description">TK TK TK Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">VIS4DH: Vis for the Digital Humanities</a>
                    <p class="submenu__description">TK TK TK Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                  <div class="submenu__detailed-link">
                    <a href="">LDAV: Large Data Analysis & Vis</a>
                    <p class="submenu__description">TK TK TK Lorem ipsum dolor sit amet, consectetur</p>
                  </div>
                </div>

              </div>

              <div class="submenu__column">

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--dark-gray">Competitions</p>
                  <p class="submenu__description">TK TK TK Lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                  <ul class="submenu__subcolumn">
                    <li><a href="">VAST Challenge</a></li>
                    <li><a href="">SciVis Contest</a></li>
                    <li><a href="">BioViz Challenges</a></li>
                  </ul>
                </div>

                <div class="submenu__section">
                  <p class="submenu__heading submenu__heading--blue">
                    <a href="">Community
                      <i class="material-icons align-middle">
                        arrow_right_alt
                      </i>
                    </a>
                  </p>
                  <p class="submenu__description">TK TK TK TK Lorem ipsum dolor sit amet, consectetur</p>
                  <div class="submenu__subcolumn-container">
                    <ul class="submenu__subcolumn">
                      <li class="submenu__heading submenu__heading--gray">Connect</li>
                      <li><a href="">Vis Buddies</a></li>
                      <li><a href="">Meetups</a></li>
                      <li><a href="">Job Fair</a></li>
                    </ul>
                    <ul class="submenu__subcolumn">
                      <li class="submenu__heading submenu__heading--gray">Social groups</li>
                      <li><a href="">Velo Club de VIs</a></li>
                      <li><a href="">Vis Pioneers Group</a></li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </li>
        </ul>
        <!-- <button class="button button-blue inline">
          Register
          <i class="material-icons">arrow_right_alt</i>
        </button> -->
      </div>

    </nav>

</div>
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
