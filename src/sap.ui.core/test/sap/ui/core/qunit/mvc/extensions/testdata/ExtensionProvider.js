sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/ControllerExtension"
], function(Log, ControllerExtension) {
	"use strict";
	//this is just an example, normally they would be a lookup in the component settings and flex changes for the component
	//ideally the code of the controller would be outsourced to
	var ExtensionProvider = function() {};
	ExtensionProvider.prototype.getControllerExtensions = function(sControllerName, sComponentId, bAsync) {
		if (bAsync) {
			return new Promise(function(fnResolve, fnReject) {
				sap.ui.require(["my/test/AnotherExtension"], function(AppExtension) {
					fnResolve([
						AppExtension
					]);
				});
			});
		} else {
			Log.error("Never do sync stuff!!");
		}
	};
	return ExtensionProvider;
});