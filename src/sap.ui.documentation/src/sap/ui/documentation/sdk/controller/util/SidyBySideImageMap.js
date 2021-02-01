/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/documentation/sdk/controller/util/ResponsiveImageMap"], function (ResponsiveImageMap) {
	"use strict";

	var COLLAPSED_IMAGE_WIDTH = "200px",
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
			oImg = oData.querySelector('img');

		ResponsiveImageMap.call(this, oMap, oImg);

		this.aSections = [].slice.call(oData.querySelectorAll("section"));
		this.bStatic = oData.dataset.staticType === "true";
		this.bRestoreSize = false;
		this.oMap = oMap;
		this.fnHandlers = Object.assign(this.fnHandlers, {
			click: this.onclick.bind(this),
			resize: this.resize.bind(this),
			imgMouseenter: this.onmouseenterImage.bind(this),
			imgMouseleave: this.onmouseleaveImage.bind(this)
		});

		this.areas.forEach(function (oArea) {
			oArea.element.addEventListener("click", this.fnHandlers.click);
		}, this);

		if (!this.bStatic) {
			this.oImg.addEventListener("transitionend", this.fnHandlers.resize);
			this.oImg.addEventListener("mouseenter", this.fnHandlers.imgMouseenter);
			this.oImg.addEventListener("mouseleave", this.fnHandlers.imgMouseleave);
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
			this.oImg.style.width = this.iOriginalWidth + "px";
			this.bRestoreSize = false;
			this.resize();
		}
	};

	SidyBySideImageMap.prototype.onmouseleaveImage = function (oEvent) {
		if (this.oMap.contains(oEvent.relatedTarget) || this.oImg.contains(oEvent.relatedTarget)) {
			return;
		}

		this.bRestoreSize = true;
	};

	SidyBySideImageMap.prototype.onclick = function (oEvent) {
		var sTargetId = oEvent.target.alt.match(rgxTargetTemplate)[1];

		oEvent.preventDefault();
		this.showSection(sTargetId);

		if (!this.bStatic) {
			this.oImg.style.width = COLLAPSED_IMAGE_WIDTH;
		}
	};

	SidyBySideImageMap.prototype.removeEventListeners = function () {
		ResponsiveImageMap.prototype.exit.call(this);

		this.areas.forEach(function (oArea) {
			oArea.element.removeEventListener("click", this.fnHandlers.click);
		}, this);

		if (!this.bStatic) {
			this.oImg.removeEventListener("transitionend", this.fnHandlers.resize);
			this.oImg.removeEventListener("mouseenter", this.fnHandlers.imgMouseenter);
			this.oImg.removeEventListener("mouseleave", this.fnHandlers.imgMouseleave);
		}
	};

	return SidyBySideImageMap;
});