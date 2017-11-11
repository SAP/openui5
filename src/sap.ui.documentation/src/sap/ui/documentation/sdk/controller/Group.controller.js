/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.Group", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.getRouter().getRoute("group").attachPatternMatched(this._onGroupMatched, this);
			},

			/* =========================================================== */
			/* begin: internal methods									 */
			/* =========================================================== */

			_onGroupMatched: function (event) {
				this._id = event.getParameter("arguments").id;
			}
		});
	}
);