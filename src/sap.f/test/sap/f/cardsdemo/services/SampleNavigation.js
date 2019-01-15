sap.ui.define(["sap/ui/integration/services/Navigation"], function (Navigation) {
	"use strict";

	var SampleNavigation = Navigation.extend();

	SampleNavigation.prototype.enabled = function (oDataContext) {
		return Promise.resolve(true);
	};

	SampleNavigation.prototype.navigate = function (oDataContext) {
		window.open("http://www.sap.com", "_blank");
	};

	return SampleNavigation;
});