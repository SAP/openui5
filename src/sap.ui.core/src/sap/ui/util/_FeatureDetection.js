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
        div.innerHTML = '<div dir="rtl" style="width: 1px; height: 1px; position: fixed; top: 0px; left: 0px; overflow: hidden"><div style="width: 2px"><span style="display: inline-block; width: 1px"></span><span style="display: inline-block; width: 1px"></span></div></div>';
        document.documentElement.appendChild(div);
        var definer = div.firstChild;
        //check initial value
        detectedFeatures.initialZero = definer.scrollLeft == 0;
        //check if scrolling left goes negative
        definer.scrollLeft = -1;
        detectedFeatures.canNegative = definer.scrollLeft < 0;
        document.documentElement.removeChild(div);
        /* detect scrolling behavior - End */
    }

    detectFeatures();

    var _FeatureDetection = {
        canScrollToNegative: function() {
            return detectedFeatures.canNegative;
        },
        initialScrollPositionIsZero: function() {
            return detectedFeatures.initialZero;
        }
    };

    return _FeatureDetection;
});