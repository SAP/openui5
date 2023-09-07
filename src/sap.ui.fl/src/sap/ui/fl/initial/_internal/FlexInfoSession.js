/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/ManifestUtils"
], function(
	ManifestUtils
) {
	"use strict";

	var FlexInfoSession = {};

	var PARAMETER_PREFIX = "sap.ui.fl.info.";

	function getSessionStorageKey(sReference) {
		return PARAMETER_PREFIX + (sReference || "true");
	}

	FlexInfoSession.get = function(oControl) {
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		return FlexInfoSession.getByReference(sReference);
	};

	FlexInfoSession.getByReference = function(sReference) {
		return JSON.parse(window.sessionStorage.getItem(getSessionStorageKey(sReference)));
	};

	FlexInfoSession.set = function(oInfo, oControl) {
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		FlexInfoSession.setByReference(oInfo, sReference);
	};

	FlexInfoSession.setByReference = function(oInfo, sReference) {
		window.sessionStorage.setItem(getSessionStorageKey(sReference), JSON.stringify(oInfo));
	};

	FlexInfoSession.remove = function(oControl) {
		var sReference = ManifestUtils.getFlexReferenceForControl(oControl);
		window.sessionStorage.removeItem(getSessionStorageKey(sReference));
	};

	return FlexInfoSession;
});
