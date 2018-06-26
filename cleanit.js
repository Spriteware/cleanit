console.log("Started cleanit extension");

window.addEventListener("DOMContentLoaded", function(){
    // document.body.style.border = "5px solid blue"; // debug loading addon
    addon.init()
});

const SHIFT = 16;
const CTRL = 17;
const ALT = 18;
const DEL = 46;

let addon = {

    key1: CTRL, 
    key2: ALT,
    key1Active: false,
    key2Active: false,
    mouseOverOn: null,
    focusOn: null,
    savedStyle: "",

    init: function() {

        console.log("Loaded cleanit extension");
        addon.events();
    },

    events: function() {

        window.addEventListener("keydown", function(e)
        {
            // Correct ALTGR bas behavior if ALT is use
            if (e.keyCode === ALT && e.location === 2)
                return;

            if (e.keyCode === addon.key1)
                addon.key1Active = true;
            else if (e.keyCode === addon.key2)
                addon.key2Active = true;
            else if (e.keyCode !== DEL)
                return;

            // Clean when DEL is pressed instead of a click
            if (e.keyCode === DEL && addon.key1Active && addon.key2Active) {
                e.stopPropagation();
                e.preventDefault();
                addon.clean()
            }

            // Check on first key combination
            if (addon.key1Active && addon.key2Active) {
                e.stopPropagation();
                e.preventDefault();
                addon.overlay(addon.focusElement(addon.mouseOverOn));
            }
        });

        window.addEventListener("keyup", function(e)
        {
            if (e.keyCode === addon.key1)
                addon.key1Active = false;
            else if (e.keyCode === addon.key2)
                addon.key2Active = false;

            // Reset overlay if releasing one key
            if (!addon.key1Active || !addon.key2Active) 
                addon.overlay(null); 
        });

        window.addEventListener("mouseover", function(e)
        {
            addon.mouseOverOn = e.target;

            // For performance, mouseover is better than mouseenter and mouseleave
            if (addon.key1Active && addon.key2Active) {
                e.stopPropagation();
                e.preventDefault();

                addon.overlay(addon.focusElement(addon.mouseOverOn));
            }
        });

        window.addEventListener("click", function(e)
        {
            if (addon.key1Active && addon.key2Active) {
                e.stopPropagation();
                e.preventDefault();
                addon.clean()
            }
        });

        window.addEventListener("blur", function(e){   
            addon.reset(true);
        });
    },

    focusElement: function(target) {
        /* 
            This functions extracts the right element from the fired event. 
            It checks if the current element must have the focus:
                If it has no parents, then this element needs the focus.
                If it isn't the only child of its parent, it also needs focus.
            Else if check its parent. Recursively.
        */

        let parent = target.parentNode;
        if (!parent || parent.childNodes.length != 1)
            return target;

        return addon.focusElement(parent);
    },

    overlay: function(target) {

        if (target != addon.focusOn)
        {
            if (addon.focusOn)
                addon.focusOn.style.outline = addon.savedStyle; // restore old style
            
            addon.focusOn = target;                             // update focusOn element

            if (target) {
                addon.savedStyle = target.style.outline;        // save current style
                target.style.outline = "2px solid #f00c"        // apply style
            }
        }
    },

    clean: function() {
        addon.focusOn.remove();
        addon.reset();
    },

    reset: function(hard) {
        addon.focusOn = null;
        addon.savedStyle = "";
        addon.mouseOverOn = null;

        if (hard) {
            addon.key1Active = false;
            addon.key2Active = false;
        }
    }
};

