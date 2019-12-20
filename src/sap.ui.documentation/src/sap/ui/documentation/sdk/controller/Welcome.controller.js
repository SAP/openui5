/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/Device",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/resource/ResourceModel",
		"sap/base/Log"
	], function (BaseController, Device, JSONModel, ResourceModel, Log) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.Welcome", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				// set i18n model on view
				var	i18nModel = new ResourceModel({
						bundleName: "sap.ui.documentation.sdk.i18n.i18n"
					});

				this.getView().setModel(i18nModel, "i18n");

				this.getRouter().getRoute("welcome").attachPatternMatched(this._onMatched, this);

				sap.ui.getVersionInfo({async: true}).then(function (oVersionInfo) {
					var oModel = new JSONModel({
						isOpenUI5: oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav)
					});
					this.getView().setModel(oModel, "welcomeView");
				}.bind(this));

				// manually call the handler once at startup as device API won't do this for us
				this._onOrientationChange({
					landscape: Device.orientation.landscape
				});
			},

			/**
			 * Called before the view is rendered.
			 * @public
			 */
			onBeforeRendering: function() {
				this._deregisterOrientationChange();
			},

			/**
			 * Called after the view is rendered.
			 * @public
			 */
			onAfterRendering: function() {
				this._registerOrientationChange();
			},

			/**
			 * Called when the controller is destroyed.
			 * @public
			 */
			onExit: function() {
				this._deregisterOrientationChange();
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
			 * Navigates to the tutorial overview
			 */
			onGetStarted: function () {
				this.getRouter().parse("topic/8b49fc198bf04b2d9800fc37fecbb218");
			},

			/**
			 * Redirects to the UI5 download page
			 * @param {sap.ui.base.Event} oEvent the Button press event
			 * @public
			 */
			onDownloadButtonPress: function (oEvent) {
				var isOpenUI5 = this.getView().getModel("welcomeView").getProperty("/isOpenUI5"),
					sUrl = isOpenUI5 ? "http://openui5.org/download.html" : "https://tools.hana.ondemand.com/#sapui5";
				window.open(sUrl, "_blank");
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
					Log.error(e);
				}
			}
		});
	}
);