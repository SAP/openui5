/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   music artist OData service.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
	"sap/ui/test/TestUtils"
], function (jQuery, UIComponent, TestUtils) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.MusicArtists.Component", {
		metadata : {
			manifest : "json"
		},

		exit : function () {
			TestUtils.retrieveData("sap.ui.core.sample.odata.v4.MusicArtists.sandbox").restore();
			// ensure the sandbox module is unloaded so that sandbox initialization takes place
			// again the next time the component used
			jQuery.sap.unloadResources(
				"sap/ui/core/sample/odata/v4/MusicArtists/MusicArtistsSandbox.js",
				false /*bPreloadGroup*/, true /*bUnloadAll*/, true /*bDeleteExports*/);
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});