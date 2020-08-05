/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the
 *   music artist OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.MusicArtists.Component", {
		metadata : {
			manifest : "json"
		},

		init : function () {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
			// create the views based on the url/hash
			this.getRouter().initialize();
		}
	});
});