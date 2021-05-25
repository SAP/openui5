/*!
 * ${copyright}
 */

/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
    "use strict";
    var detectedFeatures = {};

    function detectFeatures() {
        /* detect scrolling behavior - Begin */
        // inspired by jQuery.rtl-scroll-type
        var div = document.createElement("div");
        div.innerHTML = '<div dir="rtl"><div><span></span><span></span></div></div>';
        div.firstChild.style = 'width: 1px; height: 1px; position: fixed; top: 0px; left: 0px; overflow: hidden';
        div.firstChild.firstChild.style = 'width: 2px';
        div.firstChild.firstChild.firstChild.style = 'display: inline-block; width: 1px';
        div.firstChild.firstChild.lastChild.style = 'display: inline-block; width: 1px';
        document.documentElement.appendChild(div);
        var definer = div.firstChild;
        //check initial value
        detectedFeatures.initialZero = definer.scrollLeft == 0;
        document.documentElement.removeChild(div);
        /* detect scrolling behavior - End */
    }

    detectFeatures();

    var _FeatureDetection = {
        initialScrollPositionIsZero: function() {
            return detectedFeatures.initialZero;
        }
    };

    return _FeatureDetection;
});
