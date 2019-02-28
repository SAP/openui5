sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorSessionStorage",
	"sap/ui/fl/FakeLrepConnector"
], function(
	UIComponent,
	FakeLrepConnectorSessionStorage,
	FakeLrepConnector
) {

	"use strict";

	return UIComponent.extend("fl.performance.flexApplyChanges.Component", {

		metadata: {
			manifest: "json"
		},

		constructor: function () {
			this._createFakeLrep();
			UIComponent.prototype.constructor.apply(this, arguments);
		},

		createContent: function () {
			var oApp = new sap.m.App();
			var oView = sap.ui.view("idMain1", {type:sap.ui.core.mvc.ViewType.JS, viewName:"my.own.view"});
			oApp.addPage(oView);
			return oApp;
		},

		_createFakeLrep: function () {
			var mAppManifest = this.getManifestEntry("sap.app");
			var mSettings = {};
			mSettings.sInitialComponentJsonPath = jQuery.sap.getModulePath("sap.ui.fl.internal.performance.flexData").replace('resources', 'test-resources') + "/FakeLrepMassiveChanges.json";
			FakeLrepConnectorSessionStorage.enableFakeConnector(
				mSettings,
				mAppManifest.id + '.Component',
				mAppManifest.applicationVersion.version);
		},

		destroy: function() {
			var mAppManifest = this.getManifestEntry("sap.app");
			FakeLrepConnector.disableFakeConnector(
				mAppManifest.id + '.Component',
				mAppManifest.applicationVersion.version
			);
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}

	});
});
