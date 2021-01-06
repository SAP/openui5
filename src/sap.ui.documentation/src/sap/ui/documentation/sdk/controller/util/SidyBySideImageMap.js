/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/documentation/sdk/controller/util/ResponsiveImageMap"], function (ResponsiveImageMap) {
	"use strict";

	var SidyBySideImageMap = function (oData) {
		var oMap = oData.querySelector('map'),
			oImg = oData.querySelector('img');

		this.oResponsiveImageMap = new ResponsiveImageMap(oMap, oImg, this.showSection.bind(this));
		this.aSections = [].slice.call(oData.querySelectorAll("section"));

		this.showSection(this.aSections[0].getAttribute("id"));
	};

	SidyBySideImageMap.prototype.showSection = function (sSectionId) {
		this.aSections.forEach(function (oSection) {
			oSection.toggleAttribute("hidden", oSection.getAttribute("id") !== sSectionId);
		});
	};

	SidyBySideImageMap.prototype.resize = function () {
		this.oResponsiveImageMap.resize();
	};

	return SidyBySideImageMap;
});