sap.ui.define([
	"sap/ui/generic/app/AppComponent",
	"sap/ui/fl/FakeLrepConnectorLocalStorage",
	"sap/ui/rta/util/UrlParser"
], function(AppComponent, FakeLrepConnectorLocalStorage, UrlParser){

	"use strict";

	return AppComponent.extend("sap.ui.rta.test.performance.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function(){
			AppComponent.prototype.init.apply(this, arguments);
			this._createFakeLrep();
		},

		/**
		 * Create the FakeLrep with localStorage
		 * @private
		 */
		_createFakeLrep: function() {
			if (UrlParser.getParam('sap-rta-mock-lrep')) {
				var mAppManifest = this.getManifestEntry("sap.app");
				FakeLrepConnectorLocalStorage.enableFakeConnector(
					null,
					mAppManifest.id + '.Component',
					mAppManifest.applicationVersion.version
				);
			}
		}
	});
});




