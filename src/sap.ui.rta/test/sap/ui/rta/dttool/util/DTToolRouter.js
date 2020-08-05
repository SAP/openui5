/*!
 * ${copyright}
 */

// Provides a customized router class for the 'DT Tool' app.
sap.ui.define([
	'sap/m/routing/Router'
], function(Router) {
	"use strict";

	var DTToolRouter = Router.extend("sap.ui.rta.dttool.util.DTToolRouter", {

		myNavToWithoutHash: function (viewName, viewType, master, data) {
			var oComponent = this._getOwnerComponent();
			var oRootView = oComponent.byId(oComponent.getManifestEntry("/sap.ui5/rootView").id);
			var oApp = oRootView.byId("splitApp");
			var oView = this.getView(viewName, viewType);

			oApp.addPage(oView, master);
			oApp.toDetail(oView.getId(), "show", data);
		},

		_getOwnerComponent: function () {
			return this._oOwner;
		}
	});

	return DTToolRouter;
});
