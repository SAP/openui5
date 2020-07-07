/*!
 * ${copyright}
 */

sap.ui.define(["./overlay/Overlay", "./Tooltip"], function (Overlay, Tooltip) {
    "use strict";

	var TOOLTIP_POINTER_OFFSET = 30;

	var ResponsiveImageMap = function (oMap, oImg) {
        this.oImg = oImg;
        this.oOverlay = new Overlay(this.oImg.parentNode);
        this.oToolTip = new Tooltip(this.oImg.parentNode);

        this.iOriginalWidth = oImg.naturalWidth;
        this.areas = Array.prototype.map.call(oMap.getElementsByTagName('area'), function (oArea) {
	        // when we attach the handler on the map, event.target does
	        // not propagate from the area element, but from the map
	        oArea.addEventListener("mouseenter", this.onmouseenter.bind(this));
	        oArea.addEventListener("mouseleave", this.onmouseleave.bind(this));

            return  {
                element: oArea,
                originalCoords: oArea.getAttribute('originalCoords').split(',')
            };
        }, this);

        this.resize();
    };

    ResponsiveImageMap.prototype.resize = function() {
        var aNewCoords,
            iRatio = this.oImg.offsetWidth / this.iOriginalWidth;

        this.areas.forEach(function (oArea) {
            aNewCoords = [];
            oArea.originalCoords.forEach(function (originalCoords) {
                aNewCoords.push(Math.round(originalCoords * iRatio));
            });
            oArea.element.coords = aNewCoords.join(',');
        });

        return true;
    };

    ResponsiveImageMap.prototype.onmouseenter = function(oEvent) {
	    var sCoords = oEvent.target.coords,
		    sShape = oEvent.target.getAttribute("shape"),
	        oRect = this.oImg.getBoundingClientRect();

	    this.sTitle = oEvent.target.getAttribute('title');
	    oEvent.target.setAttribute('title', ''); // prevent browser showing the title as tooltip

	    this.oOverlay.setShape(sShape, sCoords);
	    this.oOverlay.show();

	    if (this.sTitle) {
		    this.oToolTip.setText(this.sTitle);
		    this.oToolTip.setPosition({
			    top: (oEvent.clientY - oRect.top) - (this.oToolTip.getBounds().offsetHeight + TOOLTIP_POINTER_OFFSET),
			    left: (oEvent.clientX - oRect.left) - (this.oToolTip.getBounds().offsetWidth / 2)
		    });
		    this.oToolTip.show();
	    }
    };

    ResponsiveImageMap.prototype.onmouseleave = function(oEvent) {
	    oEvent.target.setAttribute('title', this.sTitle); // restore title attribute to be used for next tooltip show

	    this.oOverlay.hide();
	    this.oToolTip.hide();
    };

    return ResponsiveImageMap;
});