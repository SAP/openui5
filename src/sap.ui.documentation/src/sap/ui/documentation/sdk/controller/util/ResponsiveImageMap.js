/*!
 * ${copyright}
 */

sap.ui.define(["./overlay/Overlay"], function (Overlay) {
    "use strict";

	var ResponsiveImageMap = function (oMap, oImg) {
        this.oImg = oImg;
        this.oOverlay = new Overlay(this.oImg.parentNode);

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
		    sShape = oEvent.target.getAttribute("shape");

	    this.oOverlay.setShape(sShape, sCoords);
	    this.oOverlay.show();
    };

    ResponsiveImageMap.prototype.onmouseleave = function() {
	    this.oOverlay.hide();
    };

    return ResponsiveImageMap;
});