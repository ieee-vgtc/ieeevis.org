import style from "./styles/index.css";

import Vue from 'vue'

document.addEventListener('DOMContentLoaded', () => {
    new Vue({
        el: '#navigation',
        data: function() {
          return {
            bodyElement: null,
            isCollapsed: false,
            isCollapsedPrevious: false,
            isExpanded: false,
            hasMenuItemExpanded: false,
            isAriaHidden: true,
            isAriaExpanded: false,
            menu: {}
          };
        },
        mounted: function () {
          this.isCollapsed = window.innerWidth < 768;
          this.isCollapsedPrevious = window.innerWidth < 768;
          this.bodyElement = document.getElementsByTagName('BODY')[0];
          window.addEventListener('resize', this.debounce(this.handleResize, 25));
        },
        destroyed: function () {
          window.removeEventListener('resize', this.debounce(this.handleResize, 25));
        },
        methods: {
          debounce: function (fn, delay) {
            let timeoutID = null;
            return function () {
              clearTimeout(timeoutID);
              const args = arguments;
              const that = this;
              timeoutID = setTimeout(function () {
                fn.apply(that, args);
              }, delay);
            };
          },

          handleResize: function () {
            this.isCollapsed = window.innerWidth < 768;
            const hasMenuItemsOpen = this.hasMenuItemsOpen();

            // Check if the browser resize caused a change in layout for the menu
            if (this.isCollapsedPrevious !== this.isCollapsed) {
              this.isExpanded = hasMenuItemsOpen;

              if (this.isCollapsed && hasMenuItemsOpen) {
                this.bodyElement.classList.add('overflow-hidden');
              } else {
                this.bodyElement.classList.remove('overflow-hidden');
              }

              this.isCollapsedPrevious = window.innerWidth < 768;
              this.$forceUpdate();
            }
          },

          toggleMenu: function () {
            this.isExpanded = !this.isExpanded;
            this.togglePreventBodyScroll();
            this.resetMenuItems();
            this.$forceUpdate();
          },

          toggleMenuItems: function (menuId) {
            if (this.menu[menuId]) {
              this.menu[menuId] = false;
              this.isAriaHidden = true;
              this.isAriaExpanded = false;
              this.hasMenuItemExpanded = false;
            } else {
              this.resetMenuItems();
              this.menu[menuId] = true;
              this.isAriaHidden = false;
              this.isAriaExpanded= true;
              this.hasMenuItemExpanded = true;
            }
            this.$forceUpdate();
          },

          resetMenuItems: function () {
            for (let key in this.menu) {
              if (this.menu.hasOwnProperty(key)) {
                this.menu[key] = false;
              }
            }
            this.hasMenuItemExpanded = false;
          },

          hasMenuItemsOpen: function () {
            for (let key in this.menu) {
              if (this.menu.hasOwnProperty(key)) {
                if (this.menu[key]) {
                  return true;
                }
              }
            }
            return false;
          },

          togglePreventBodyScroll: function () {
            const body = document.getElementsByTagName('BODY')[0];
            body.classList.toggle('overflow-hidden');
          }
        }
    });

    // automatically highlight TOC sidebar entries
    const navItems = Array.from(document.querySelectorAll('.sidebar-toc li a'));
    if (navItems.length !== 0) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = "#" + entry.target.getAttribute('id');
            const navItemIndex = navItems.findIndex(nav_item => nav_item.getAttribute('href') === id);
            if (navItemIndex !== -1) {
              for (let i in navItems) {
                if (i == navItemIndex)
                  navItems[i].classList.add('sidebar__link--active');
                else
                  navItems[i].classList.remove('sidebar__link--active');
              }
            }
          }
          // OR, can use the following code to show all active, but it's annoying if no header is currently in scroll-view
          // const id = entry.target.getAttribute('id');
          // const selector = ".sidebar-toc li a[href='#" + id + "']";
          // if (entry.intersectionRatio > 0)
          //   document.querySelector(selector).classList.add('sidebar__link--active');
          // else
          //   document.querySelector(selector).classList.remove('sidebar__link--active');
        });
      });

      document.querySelectorAll('article h2, article h3').forEach(section => observer.observe(section));
    }
});
