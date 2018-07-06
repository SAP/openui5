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

	return UIComponent.extend("sap.ui.rta.test.embeddedComponent.mockManifest.Component", {

		metadata: {
			manifest: "json"
		},

		constructor: function () {
			UIComponent.prototype.constructor.apply(this, arguments);
		},

		init : function() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
		},

		destroy: function() {
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}

	});
});
