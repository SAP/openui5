/*!
 * ${copyright}
 */

// Provides a customized router class for the 'documentation' app.
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
			var oComponent = this._getOwnerComponent(),
				oRootView = oComponent.byId(oComponent.getManifestEntry("/sap.ui5/rootView").id),
				oApp = oRootView.byId("splitApp"),
				oView = this.getView(viewName, viewType);

			oApp.addPage(oView, master);
			oApp.toDetail(oView.getId(), "show", data);
		},

		/**
		 * Getter for the owner component
		 *
		 * <b>Note:</b> In the router we have no getter to retrieve the owner component. This should be improved in the
		 * future.
		 * @returns {sap.ui.core.UIComponent} Owner component of the router instance
		 * @private
		 */
		_getOwnerComponent: function () {
			return this._oOwner; // Accessing owner component from reference on the instance object.
		}
	});

	return DocumentationRouter;

}, /* bExport= */ true);
