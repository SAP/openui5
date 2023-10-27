sap.ui.define([
		"sap/ui/demo/iconexplorer/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("sap.ui.demo.iconexplorer.controller.NotFound", {

			/**
			 * Navigates to the worklist when the button is pressed
			 * @public
			 */
			onButtonPressed : function () {
				this.getRouter().navTo("overview");
			}

		});

	}
);