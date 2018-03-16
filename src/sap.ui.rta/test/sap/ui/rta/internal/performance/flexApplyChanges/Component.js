sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/rta/util/UrlParser",
	"sap/ui/fl/FakeLrepConnector",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/Utils"
], function(
	UIComponent,
	FakeLrepConnectorLocalStorage,
	UrlParser,
	FakeLrepConnector,
	MockServer,
	ResourceModel,
	ODataModel,
	JSONModel,
	Utils
) {

	"use strict";

	return UIComponent.extend("rta.performance.flexApplyChanges.Component", {

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
			mSettings.sInitialComponentJsonPath = jQuery.sap.getModulePath("sap.ui.rta.internal.performance.flexData").replace('resources', 'test-resources') + "/FakeLrepMassiveChanges.json";
			FakeLrepConnectorLocalStorage.enableFakeConnector(
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
