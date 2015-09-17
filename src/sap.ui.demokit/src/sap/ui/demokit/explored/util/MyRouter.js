/*!
 * ${copyright}
 */

// Provides acustomized router class for the 'explored' app.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/routing/Router'],
	function(jQuery, Router) {
	"use strict";


	
	var MyRouter = Router.extend("sap.ui.demokit.explored.util.MyRouter", {
	
		/**
		 * mobile nav back handling
		 */
		myNavBack : function (sRoute, oData) {
			var oHistory = sap.ui.core.routing.History.getInstance();
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
		myNavToWithoutHash : function (viewName, viewType, master, data) {
			var app = sap.ui.getCore().byId("splitApp");
			var view = this.getView(viewName, viewType);
			app.addPage(view, master);
			app.toDetail(view.getId(), "show", data);
		}
	});

	return MyRouter;

}, /* bExport= */ true);
