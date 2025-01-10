sap.ui.define([
	'sap/ui/base/ManagedObject',
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"testutils/link/FakeUShellConnector",
	"sap/base/util/LoaderExtensions",
	"sap/m/routing/Router", // make sure Router is loaded
	"sap/ui/Device"
], function(
	ManagedObject,
	UIComponent,
	JSONModel,
	FakeUShellConnector,
	LoaderExtensions,
	Router,
	Device
) {
	"use strict";

	var fnLoadManifest = function() {
		var oDefaultManifest = LoaderExtensions.loadResource("sap/ui/v4demo/templateManifest.json");
		if (self['sap-ui-mdc-config'] && self['sap-ui-mdc-config'].tenantBaseUrl) {
			oDefaultManifest["sap.app"].dataSources.default.uri = self['sap-ui-mdc-config'].tenantBaseUrl + "catalog-test/";
		}
		return oDefaultManifest;
	};

	return UIComponent.extend("sap.ui.v4demo.Component", {

		metadata: {
			manifest: fnLoadManifest()
		},

		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// set device model
			const oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			this.getRouter().initialize();
			this.__initFakeUShellConnector();
		},
		__initFakeUShellConnector: function() {
			FakeUShellConnector.enableFakeConnector({
				'FakeFlpSemanticObject_book': {
					links: [
						{
							action: "action_01",
							intent: self.location.pathname + (self.location.search && self.location.search) + "#/Books/{path: 'ID', targetType: 'raw'}",
							text: "Manage book",
							icon: "/testsuite/test-resources/sap/ui/documentation/sdk/images/HT-1031.jpg",
							description: "{title}",
							tags: [
								"superiorAction"
							]
						}
					]
				},
				'FakeFlpSemanticObject_author': {
					links: [
						{
							action: "action_02",
							intent: self.location.pathname + (self.location.search && self.location.search) + "#/Authors/{path: 'author_ID', targetType: 'raw'}",
							text: "Manage author",
							description: "{author/name}",
							tags: [
								"superiorAction"
							]
						}
					]
				}
			});
		}

	});
});
