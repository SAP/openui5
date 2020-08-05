sap.ui.define([
		"sap/ui/demo/cardExplorer/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("sap.ui.demo.cardExplorer.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("");
			}
		});

	}
);