/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/controller/BaseController",
		"sap/ui/model/json/JSONModel", "sap/ui/core/ComponentContainer",
		"sap/ui/documentation/controller/util/ControlsInfo"
	], function (BaseController, JSONModel, ComponentContainer, ControlsInfo) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.controller.Group", {

			/* =========================================================== */
			/* lifecycle methods										   */
			/* =========================================================== */

			onInit: function () {
				this.getRouter().getRoute("group").attachPatternMatched(this._onGroupMatched, this);

				//ControlsInfo.loaded = function () {
				//	that._loadSample();
				//};
			},

			onBeforeRendering: function() {
				sap.ui.Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onAfterRendering: function() {
				sap.ui.Device.orientation.attachHandler(jQuery.proxy(this._fnOrientationChange, this));
			},

			onExit: function() {
				sap.ui.Device.orientation.detachHandler(jQuery.proxy(this._fnOrientationChange, this));
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