/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/Device",
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/base/Log",
	"sap/ui/documentation/sdk/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/documentation/sdk/controller/util/ToolsInfo"
], function (Device, BaseController, Log, formatter, JSONModel, ToolsInfo) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.Tools", {

		/* =========================================================== */
		/* lifecycle methods										   */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */

		formatter: formatter,

		onInit: function () {
			BaseController.prototype.onInit.call(this);

			// manually call the handler once at startup as device API won't do this for us
			this._onOrientationChange({
				landscape: Device.orientation.landscape
			});

			this._oModel = new JSONModel();
			this.getView().setModel(this._oModel);

			ToolsInfo.getToolsConfig()
				.then(this._onToolConfigLoaded.bind(this));

			this.getRouter().getRoute("tools").attachPatternMatched(this._onMatched, this);
		},

		/**
		 * Provides tools config data
		 * @private
		 */
		_onToolConfigLoaded: function (oResult) {
			var oData = {};

			oResult.forEach(function (oEntry) {
				oData[oEntry.id] = oEntry;
			}, this);

			this._oModel.setData(oData);

			this.setModel(new JSONModel({
				inspectorHomeLink: "topic/b24e72443eb34d0fb7bf6940f2d697eb",
				supportAssistantHomeLink: oData.supportAssistant.href,
				iconExplorerHomeLink: "topic/21ea0ea94614480d9a910b2e93431291"
				// etc
			}), "newWindowLinks");
		},

		/**
		 * Called before the view is rendered.
		 * @public
		 */
		onBeforeRendering: function () {
			this._deregisterOrientationChange();
		},

		/**
		 * Called after the view is rendered.
		 * @public
		 */
		onAfterRendering: function () {
			this._registerOrientationChange();
		},

		/**
		 * Called when the controller is destroyed.
		 * @public
		 */
		onExit: function () {
			this._deregisterOrientationChange();
		},

		/**
		 * Handles "Tools" routing
		 * @function
		 * @private
		 */
		_onMatched: function () {
			try {
				this.hideMasterSide();
			} catch (e) {
				// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
				Log.error(e);
			}
		}
	});
});