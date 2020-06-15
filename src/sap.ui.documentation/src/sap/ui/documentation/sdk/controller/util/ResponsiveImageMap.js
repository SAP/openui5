/*!
 * ${copyright}
 */

sap.ui.define([], function () {
    "use strict";

	function Overlay () {
		this.container = document.createElement('div');
		this.container.className = 'overlay';
	}

	Overlay.prototype.setPosition = function (position) {
		this.container.style.top = position.top + 'px';
		this.container.style.left = position.left + 'px';
		this.container.style.width = position.width + 'px';
		this.container.style.height = position.height + 'px';
	};

	Overlay.prototype.show = function () {
		this.container.style.opacity = '1';
	};

	Overlay.prototype.hide = function () {
		this.container.style.opacity = '0';
	};

	var ResponsiveImageMap = function (oMap, oImg) {
        this.oImg = oImg;
        this.oOverlay = new Overlay();
	    this.oImg.parentNode.appendChild(this.oOverlay.container);

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
	    var coords = oEvent.target.coords.split(","),
		    position = {
			    top: coords[1],
			    left: coords[0],
			    width: coords[2] - coords[0],
			    height: coords[3] - coords[1]
		    };

	    this.oOverlay.setPosition(position);
	    this.oOverlay.show();
    };

    ResponsiveImageMap.prototype.onmouseleave = function() {
	    this.oOverlay.hide();
    };

    return ResponsiveImageMap;
});