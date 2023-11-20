sap.ui.define([], function() {
	"use strict";

	//this is just an example, normally they would be a lookup in the component settings and flex changes for the component
	//ideally the code of the controller would be outsourced to
	var ExtensionProvider = function() {};
	ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
		if (sControllerName == "sample.Main") {
			if (bAsync) {
				return new Promise(function(fnResolve, fnReject) {
					sap.ui.require(["sample/Oil.extension", "sample/Retail.extension"], function(oOilExtension, oRetailExtension) {
						fnResolve([
							oOilExtension,
							oRetailExtension
						]);
					});
				});
			} else {
				return [
					sap.ui.requireSync("sample/Oil.extension"),   // legacy-relevant: intentional sync path test
					sap.ui.requireSync("sample/Retail.extension") // legacy-relevant: intentional sync path test
				];
			}
		}
	};
	return ExtensionProvider;
}, true);