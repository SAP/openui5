sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/demo/worklist/model/models",
		"sap/ui/demo/worklist/controller/ErrorHandler",
		"sap/ui/demo/worklist/model/formatter"
	], function (UIComponent, ResourceModel, models, ErrorHandler) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.worklist.Component", {

		metadata : {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the resource and application models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init : function () {
			var mConfig = this.getMetadata().getConfig();

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * In this function, the rootView is initialized and stored.
		 * @public
		 * @override
		 * @returns {sap.ui.mvc.View} the root view of the component
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
			var oRootView = UIComponent.prototype.createContent.apply(this, arguments);

			if (!sap.ui.Device.support.touch) { // apply compact mode if touch is not supported; this could me made configurable on "combi" devices with touch AND mouse
				oRootView.addStyleClass("sapUiSizeCompact");
			}

			return oRootView;
		},

		/**
		 * Creates a promise which is resolved when the metadata is loaded.
		 * @param {sap.ui.core.Model} oModel the app model
		 * @private
		 */
		_createMetadataPromise : function(oModel) {
			this.oWhenMetadataIsLoaded = new Promise(function (fnResolve, fnReject) {
				oModel.attachEventOnce("metadataLoaded", fnResolve);
				oModel.attachEventOnce("metadataFailed", fnReject);
			});
		}

	});

}, /* bExport= */ true);
