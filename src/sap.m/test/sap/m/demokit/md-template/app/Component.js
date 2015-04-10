/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/demo/mdtemplate/model/models",
		"sap/ui/demo/mdtemplate/controller/ListSelector",
		"sap/ui/demo/mdtemplate/controller/BusyHandler",
		"sap/ui/demo/mdtemplate/controller/ErrorHandler",
		"sap/ui/demo/mdtemplate/model/formatter",
		"sap/ui/demo/mdtemplate/model/grouper"
	], function (UIComponent, models, ListSelector, BusyHandler, ErrorHandler) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.mdtemplate.Component", {

		metadata : {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the resource and application models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init : function () {
			var mConfig = this.getMetadata().getConfig();

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			this.oListSelector = new ListSelector();

			this._oErrorHandler = new ErrorHandler(this);
			// initialize the busy handler with the component
			this._oBusyHandler = new BusyHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ListSelector and BusyHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy : function () {
			this.oListSelector.destroy();
			this._oBusyHandler.destroy();
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * In this method, the rootView is initialized and stored.
		 * @public
		 * @return {sap.ui.core.mvc.View} the app's root view.
		 * @override
		 */
		createContent : function() {
			// set the app data model since the app controller needs it, we create this model very early
			var oAppModel = models.createODataModel({
				urlParametersForEveryRequest: [
					"sap-server",
					"sap-host",
					"sap-host-http",
					"sap-client",
					"sap-language"
				],
				url : this.getMetadata().getConfig().serviceUrl,
				config: {
					metadataUrlParams: {
						"sap-documentation": "heading"
					}
				}
			});

			this.setModel(oAppModel);
			this._createMetadataPromise(oAppModel);

			// call the base component's createContent function
			this._oRootView = UIComponent.prototype.createContent.apply(this, arguments);
			this._oRootView.addStyleClass(this.getCompactCozyClass());
			return this._oRootView;
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 *
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy'
		 */
		getCompactCozyClass : function() {
			if (!this._sCompactCozyClass) {
				if (!sap.ui.Device.support.touch) { // apply compact mode if touch is not supported; this could me made configurable for the user on "combi" devices with touch AND mouse
					this._sCompactCozyClass = "sapUiSizeCompact";
				} else {
					this._sCompactCozyClass = "sapUiSizeCozy"; // needed for desktop-first controls like sap.ui.table.Table
				}
			}
			return this._sCompactCozyClass;
		},

		/**
		 * Creates a promise which is resolved when the metadata is loaded.
		 * @param {sap.ui.core.Model} oModel the app model
		 * @private
		 */
		_createMetadataPromise : function(oModel) {
			this.oWhenMetadataIsLoaded = new Promise(function (fnResolve, fnReject) {
				oModel.attachEventOnce("metadataLoaded", function() {
					fnResolve();
				});
				oModel.attachEventOnce("metadataFailed", function() {
					fnReject();
				});
			});
		}

	});

}, /* bExport= */ true);
