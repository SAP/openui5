sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/rta/util/UrlParser"
], function (UIComponent, FakeLrepConnectorLocalStorage, UrlParser) {
	"use strict";
	return UIComponent.extend("sap.ui.rta.dttool.Component", {
		metadata: {
			manifest: "json"
		},

		constructor: function() {
			UIComponent.prototype.constructor.apply(this, arguments);
			this._createFakeLrep();
		},

		init: function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		_createFakeLrep: function () {
			if (UrlParser.getParam('sap-rta-mock-lrep') !== false) {
				var mAppManifest = this.getManifestEntry("sap.app");
				var mSettings = {};
				FakeLrepConnectorLocalStorage.enableFakeConnector(
					mSettings,
					mAppManifest.id + '.Component',
					mAppManifest.applicationVersion.version);
			}
		}
	});
});