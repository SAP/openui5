sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/rta/util/UrlParser"
], function(
	UIComponent,
	FakeLrepConnectorLocalStorage,
	UrlParser
) {
	"use strict";

	return UIComponent.extend("sap.ui.rta.dttool.sample.Component", {
		metadata: {
			manifest: "json",
			config: {
				sample: {
					files: [
						"Main.view.xml"
					]
				}
			}
		},

		constructor: function () {
			UIComponent.prototype.constructor.apply(this, arguments);
			this._createFakeLrep();
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
