/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/support/apps/contentbrowser/utils/ErrorUtils",
	"sap/ui/core/UIComponent"
], function (Controller, ErrorUtils, UIComponent) {
	"use strict";

	/**
	 * Controller for layers list in the browser.
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.apps.contentbrowser.controller.Layers
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.45
	 */
	return Controller.extend("sap.ui.fl.support.apps.contentbrowser.controller.Layers", {
		/**
		 * Handler for triggering the navigation to a selected layer.
		 * @param {object} oEvent - Event object
		 * @public
		 */
		onLayerSelected: function (oEvent) {
			var oSource = oEvent.getSource();
			var sLayerBindingPath = oSource.getBindingContextPath().substring(1);
			var oLayerModelData = this.getView().getModel("layers").getData();
			var sLayerName = oLayerModelData[sLayerBindingPath].name;

			var oRouter = UIComponent.getRouterFor(this);
			oRouter.navTo("LayerContentMaster", {layer: sLayerName});
		},

		/**
		 * Handler for displaying the stored error messages.
		 * @param {object} oEvent - Event object
		 * @public
		 */
		handleMessagePopoverPress: function (oEvent) {
			var oSource = oEvent.getSource();
			ErrorUtils.handleMessagePopoverPress(oSource);
		}
	});
});
