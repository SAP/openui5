/*!
 * ${copyright}
 */

// Provides acustomized router class for the 'explored' app.
sap.ui.define([
	'jquery.sap.global',
	'sap/m/routing/Router',
	'sap/ui/core/routing/History'
], function (jQuery, Router, History) {
	"use strict";

	var DocumentationRouter = Router.extend("sap.ui.documentation.sdk.util.DocumentationRouter", {

		/**
		 * mobile nav back handling
		 */
		myNavBack: function (sRoute, oData) {
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				var bReplace = true; // otherwise we go backwards with a forward history
				this.navTo(sRoute, oData, bReplace);
			}
		},

		/**
		 * a nav to method that does not write hashes but load the views properly
		 */
		myNavToWithoutHash: function (viewName, viewType, master, data) {
			var app = sap.ui.getCore().byId("splitApp");
			var view = this.getView(viewName, viewType);
			app.addPage(view, master);
			app.toDetail(view.getId(), "show", data);
		}
	});

	return DocumentationRouter;

}, /* bExport= */ true);
