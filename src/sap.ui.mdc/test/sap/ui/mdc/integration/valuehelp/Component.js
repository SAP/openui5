sap.ui.define([
	"sap/ui/core/UIComponent", "sap/base/util/LoaderExtensions"
], function (UIComponent, LoaderExtensions) {

	"use strict";

	const fnLoadManifest = function() {
		const oDefaultManifest = LoaderExtensions.loadResource("sap/ui/v4demo/templateManifest.json");
		if (self['sap-ui-mdc-config'] && self['sap-ui-mdc-config'].tenantBaseUrl) {
			oDefaultManifest["sap.app"].dataSources.default.uri = self['sap-ui-mdc-config'].tenantBaseUrl + "catalog-test/";
		}
		return oDefaultManifest;
	};

	return UIComponent.extend("sap.ui.v4demo.Component", {

		metadata : {
			manifest: fnLoadManifest()
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});