/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.controller.Welcome", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				this.getRouter().getRoute("welcome").attachPatternMatched(this._onMatched, this);
			},

			/**
			 * Opens the control's details page
			 * @param event
			 */
			navigateToDetails: function (event) {
				var href = event.oSource.getHref() || event.oSource.getTarget();
				href = href.replace("#/", "").split('/');
				/** @type string */
				var page = href[0];
				/** @type string */
				var parameter = href[1];

				event.preventDefault();
				this.getRouter().navTo(page, {id: parameter}, true);
			},

			/**
			 * Handles "welcome" routing
			 * @function
			 * @private
			 */
			_onMatched: function () {
				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					jQuery.sap.log.error(e);
				}
			}
		});
	}
);