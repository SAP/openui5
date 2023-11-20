/*!
 * ${copyright}
 */

sap.ui.define(["./overlay/Overlay", "sap/ui/documentation/sdk/controller/util/ResponsiveImageMap"], function (Overlay, ResponsiveImageMap) {
	"use strict";

	var COLLAPSED_IMAGE_WIDTH = "200",
		rgxTargetTemplate = /.+\/(.+)/;

	var fnToggleAttribute = function(attr, $element, toggle) {
		if (toggle) {
			$element.setAttribute(attr, true);
		} else {
			$element.removeAttribute(attr);
		}
	};

	var SidyBySideImageMap = function (oData) {
		var oMap = oData.querySelector('map'),
			oMapWrapper = oData.querySelector(".imagemap");

		ResponsiveImageMap.call(this, oData);

		this.oHighlighter = new Overlay(this.oImg.parentNode); // used to mark the active area with permanent overlay
		this.oMapWrapper = oMapWrapper;
		this.aSections = [].slice.call(oData.querySelectorAll(":scope > section"));
		this.bStatic = oData.dataset.staticType === "true";
		this.bRestoreSize = false;
		this.oMap = oMap;
		this.fnHandlers = Object.assign(this.fnHandlers, {
			click: this.onclick.bind(this),
			imgTransitionend: this.ontransitionendImage.bind(this),
			imgTransitionstart: this.ontransitionstartImage.bind(this),
			imgMouseenter: this.onmouseenterImage.bind(this),
			imgMouseleave: this.onmouseleaveImage.bind(this)
		});

		this.areas.forEach(function (oArea) {
			oArea.element.addEventListener("click", this.fnHandlers.click);
		}, this);

		if (!this.bStatic) {
			// first run of transition is only working if the width value is in px initially
			this.setWidth(this.iOriginalWidth);

			this.oMapWrapper.addEventListener("transitionstart", this.fnHandlers.imgTransitionstart);
			this.oMapWrapper.addEventListener("transitionend", this.fnHandlers.imgTransitionend);
			this.oMapWrapper.addEventListener("mouseenter", this.fnHandlers.imgMouseenter);
			this.oMapWrapper.addEventListener("mouseleave", this.fnHandlers.imgMouseleave);
		}

		this.showSection(this.aSections[0].getAttribute("id"));
	};

	SidyBySideImageMap.prototype = Object.create(ResponsiveImageMap.prototype);
	SidyBySideImageMap.prototype.constructor = SidyBySideImageMap;

	SidyBySideImageMap.prototype.showSection = function (sSectionId) {
		this.aSections.forEach(function (oSection) {
			fnToggleAttribute("hidden", oSection, oSection.getAttribute("id") !== sSectionId);
		});
	};

	SidyBySideImageMap.prototype.onmouseenterImage = function () {
		if (this.bRestoreSize) {
			this.setWidth(this.iOriginalWidth);
			this.bRestoreSize = false;
		}
	};

	SidyBySideImageMap.prototype.onmouseleaveImage = function (oEvent) {
		if (this.oMap.contains(oEvent.relatedTarget) || this.oImg.contains(oEvent.relatedTarget)) {
			return;
		}

		this.bRestoreSize = true;
	};

	SidyBySideImageMap.prototype.ontransitionendImage = function (oEvent) {
		if (oEvent.propertyName === "width") {
			this.bAreasDisabled = false;
			this.resize();
		}
	};
	SidyBySideImageMap.prototype.ontransitionstartImage = function (oEvent) {
		if (oEvent.propertyName === "width") {
			this.bAreasDisabled = true;
		}
	};

	SidyBySideImageMap.prototype.highlightArea = function (oAreaTarget) {
		var sCoords = oAreaTarget.coords,
			sShape = oAreaTarget.getAttribute("shape");

		this.oHighlighter.setShape(sShape, sCoords);
		this.oHighlighter.show();
	};

	SidyBySideImageMap.prototype.resizeHighlighter = function () {
		var oRect = this.oMapWrapper.getBoundingClientRect(),
			fWidth = oRect.width,
			fHeight = oRect.height;

		this.oHighlighter.setSize(fWidth, fHeight);
	};

	SidyBySideImageMap.prototype.onclick = function (oEvent) {
		if (this.bAreasDisabled) {
			return;
		}
		var sTargetId = oEvent.target.alt.match(rgxTargetTemplate)[1];

		oEvent.preventDefault();
		this.showSection(sTargetId);

		this.resizeHighlighter();
		this.highlightArea(oEvent.target);

		if (!this.bStatic) {
			this.setWidth(COLLAPSED_IMAGE_WIDTH);
		}
	};

	SidyBySideImageMap.prototype.removeEventListeners = function () {
		ResponsiveImageMap.prototype.removeEventListeners.call(this);

		this.areas.forEach(function (oArea) {
			oArea.element.removeEventListener("click", this.fnHandlers.click);
		}, this);

		if (!this.bStatic) {
			this.oImg.removeEventListener("transitionend", this.fnHandlers.imgTransitionend);
			this.oImg.removeEventListener("mouseenter", this.fnHandlers.imgMouseenter);
			this.oImg.removeEventListener("mouseleave", this.fnHandlers.imgMouseleave);
		}
	};

	SidyBySideImageMap.prototype.getTooltipText = function (oEvent) {
		var sTitle = oEvent.target.getAttribute('title'),
			sTargetId,
			oSection,
			oSectionTitle;

		if (!sTitle) {
			// if no title attribute - get the corresponding section title text as tooltip
			sTargetId = oEvent.target.alt.match(rgxTargetTemplate)[1];

			oSection = this.getSection(sTargetId);

			if (oSection) {
				oSectionTitle = oSection.querySelector(".title");
				sTitle = oSectionTitle && oSectionTitle.textContent;
			}
		}

		return sTitle;
	};

	SidyBySideImageMap.prototype.setWidth = function (fWidth) {
		this.oMapWrapper.style.width = fWidth + "px";
	};

	SidyBySideImageMap.prototype.getSection = function (sSectionId) {
		return this.aSections.find(function (oSection) {
			return oSection.id === sSectionId;
		});
	};

	return SidyBySideImageMap;
});