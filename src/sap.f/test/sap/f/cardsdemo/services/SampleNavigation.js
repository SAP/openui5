sap.ui.define(["sap/ui/integration/services/Navigation"], function (Navigation) {
	"use strict";

	var SampleNavigation = Navigation.extend();

	var _sBaseUrl = "https://www.sap.com";

	function getUrl(oContext) {
		var sUrl = "";

		if (oContext.parameters.intentSemanticObject) {
			return _sBaseUrl;
		}

		if (oContext.parameters && oContext.parameters.url && typeof oContext.parameters.url === "string") {
			sUrl = oContext.parameters.url;
		}

		return sUrl;
	}

	SampleNavigation.prototype.enabled = function (oContext) {

		if (!oContext) {
			return Promise.resolve(true);
		}

		var sUrl = getUrl(oContext);
		if (sUrl) {
			return Promise.resolve(true);
		} else {
			return Promise.resolve(false);
		}
	};

	SampleNavigation.prototype.navigate = function (oContext) {
		if (!oContext) {
			return;
		}

		var sUrl = getUrl(oContext);
		if (sUrl) {
			window.open(sUrl, "_blank");
		}
	};

	SampleNavigation.prototype.hidden = function (oContext) {
		if (!oContext) {
			return Promise.resolve(false);
		}

		var bHidden = !!oContext.parameters.hidden;
		if (bHidden) {
			return Promise.resolve(true);
		} else {
			return Promise.resolve(false);
		}
	};
	return SampleNavigation;
});