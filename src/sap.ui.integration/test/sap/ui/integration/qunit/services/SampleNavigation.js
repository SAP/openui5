sap.ui.define(["sap/ui/integration/services/Navigation", "sap/base/Log"], function (Navigation, Log) {
	"use strict";

	var SampleNavigation = Navigation.extend();

	var _sBaseUrl = "https://www.sap.com";

	function getUrl(oContext) {
		var sUrl = "";

		if (oContext.parameters.intentSemanticObject) {
			if (oContext.parameters.name.indexOf("15") > -1 ) {
				return _sBaseUrl;
			} else {
				return false;
			}
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

		Log.error("Navigate successfully");
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