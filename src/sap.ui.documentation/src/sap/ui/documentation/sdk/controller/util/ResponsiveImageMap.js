/*!
 * ${copyright}
 */

sap.ui.define(["./overlay/Overlay", "./Tooltip"], function (Overlay, Tooltip) {
	"use strict";

	var ResponsiveImageMap = function (oData) {
		var oMap = oData.querySelector('map'),
			oImg = oData.querySelector('img');

		this.oImg = oImg;
		this.oMapWrapper = this.oImg.parentNode;
		this.oOverlay = new Overlay(this.oImg.parentNode);
		this.oToolTip = new Tooltip();
		this.fnHandlers = {
			areaMouseenter: this.onmouseenter.bind(this),
			areaMouseleave: this.onmouseleave.bind(this)
		};

		this.iOriginalWidth = oImg.naturalWidth;
		this.areas = Array.prototype.map.call(oMap.getElementsByTagName('area'), function (oArea) {
			// when we attach the handler on the map, event.target does
			// not propagate from the area element, but from the map
			oArea.addEventListener("mouseenter", this.fnHandlers.areaMouseenter);
			oArea.addEventListener("mouseleave", this.fnHandlers.areaMouseleave);

			return {
				element: oArea,
				originalCoords: oArea.getAttribute('originalCoords').split(',')
			};
		}, this);

		this.resize();
	};

	ResponsiveImageMap.prototype.resize = function () {
		var aNewCoords,
			iRatio = this.oImg.offsetWidth / this.iOriginalWidth;

		this.areas.forEach(function (oArea) {
			aNewCoords = [];
			oArea.originalCoords.forEach(function (originalCoords) {
				aNewCoords.push(Math.round(originalCoords * iRatio));
			});
			oArea.element.coords = aNewCoords.join(',');
		});

		this.resizeOverlay();

		return true;
	};

	ResponsiveImageMap.prototype.resizeOverlay = function () {
		var oRect = this.oMapWrapper.getBoundingClientRect(),
			fWidth = oRect.width,
			fHeight = oRect.height;

		this.oOverlay.setSize(fWidth, fHeight);
	};

	ResponsiveImageMap.prototype.onmouseenter = function (oEvent) {
		if (this.bAreasDisabled) {
			return;
		}

		var sCoords = oEvent.target.coords,
			sShape = oEvent.target.getAttribute("shape");

		this.oOverlay.setShape(sShape, sCoords);
		this.oOverlay.show();

		this.sTitle = this.getTooltipText(oEvent);

		if (this.sTitle) {
			oEvent.target.setAttribute('title', ''); // prevent browser showing the title as tooltip

			this.oToolTip.setText(this.sTitle);
			this.oToolTip.show(this.oOverlay.getCurrentShape().oContainer);
		}
	};

	ResponsiveImageMap.prototype.getTooltipText = function (oEvent) {
		return oEvent.target.getAttribute('title');
	};

	ResponsiveImageMap.prototype.onmouseleave = function (oEvent) {
		if (this.sTitle) {
			oEvent.target.setAttribute('title', this.sTitle); // restore title attribute to be used for next tooltip show
		}

		this.oOverlay.hide();
		this.oToolTip.hide();
	};

	ResponsiveImageMap.prototype.removeEventListeners = function () {
		this.areas.forEach(function (oArea) {
			oArea.element.removeEventListener("mouseenter", this.fnHandlers.areaMouseenter);
			oArea.element.removeEventListener("mouseleave", this.fnHandlers.areaMouseleave);
		}, this);
	};

	return ResponsiveImageMap;
});