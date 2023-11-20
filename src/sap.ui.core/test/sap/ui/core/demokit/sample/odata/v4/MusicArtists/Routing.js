sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	var mEntityContexts = {},
		Routing;

	Routing = {
		/**
		 * Gets and deletes the entity context used in the latest navigation to the given target.
		 *
		 * @param {string} sTarget
		 *   The navigation target used in {@link #navigateTo}
		 * @returns {sap.ui.model.odata.v4.Context}
		 *   The context or <code>undefined</code>
		 */
		getAndRemoveEntityContext : function (sTarget) {
			var oContext = mEntityContexts[sTarget];

			delete mEntityContexts[sTarget];
			return oContext;
		},

		/**
		 * Navigates to the given target passing the entity context.
		 *
		 * @param {sap.ui.core.mvc.Controller} oController
		 *   The controller in which the navigation starts
		 * @param {string} sTarget
		 *   The navigation target in the routing table
		 * @param {object} mParameters
		 *   The map of navigation parameters for the route
		 * @param {boolean} bReplace
		 *   Whether the router shall replace the current history entry instead of creating a new
		 *   one
		 * @param {sap.ui.model.odata.v4.Context} [oEntityContext]
		 *   The context of the entity in the current view
		 */
		navigateTo : function (oController, sTarget, mParameters, bReplace, oEntityContext) {
			mEntityContexts[sTarget] = oEntityContext;

			UIComponent.getRouterFor(oController).navTo(sTarget, mParameters, bReplace);
		},

		/**
		 * Navigates to the given artist.
		 *
		 * @param {sap.ui.core.mvc.Controller} oController
		 *   The controller in which the navigation starts
		 * @param {sap.ui.model.odata.v4.Context} oArtistContext
		 *   The context pointing to the artist to navigate to
		 * @param {boolean} [bReplace]
		 *   Whether the router shall replace the current history entry instead of creating a new
		 *   one
		 */
		navigateToArtist : function (oController, oArtistContext, bReplace) {
			Routing.navigateTo(oController, "objectPage",
				{artistPath : oArtistContext.getPath().slice(1)}, bReplace, oArtistContext);
		}
	};

	return Routing;
});
