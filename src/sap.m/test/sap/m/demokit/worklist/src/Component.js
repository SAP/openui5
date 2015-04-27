/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/demo/worklist/model/models",
		"sap/ui/Device",
		"sap/ui/demo/worklist/controller/ErrorHandler",
		"jquery.sap.global"
	], function (UIComponent, ResourceModel, models, Device, ErrorHandler, jQuery) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.worklist.Component", {

		metadata : {
			"rootView": "sap.ui.demo.worklist.view.App",
			"dependencies": {
				"minUI5Version": "1.28.0",
				"libs": [ "sap.ui.core", "sap.m", "sap.ui.layout" ]
			},

			"config": {
				"i18nBundle": "sap.ui.demo.worklist.i18n.i18n",
				"serviceUrl": "here/goes/your/serviceUrl/"
			},

			"routing": {
				"config": {
					"routerClass": "sap.m.routing.Router",
					"viewType": "XML",
					"viewPath": "sap.ui.demo.worklist.view",
					"controlId": "app",
					"controlAggregation": "pages",
					"bypassed": {
						"target": "notFound"
					}
				},

				"routes": [
					{
						"pattern": "",
						"name": "worklist",
						"target": "worklist"
					},
					{
						"pattern": "object/{objectId}",
						"name": "object",
						"target": "object"
					}
				],

				"targets": {
					"worklist": {
						"viewName": "Worklist",
						"viewId": "worklist",
						"viewLevel": 1
					},
					"object": {
						"viewName": "Object",
						"viewId": "object",
						"viewLevel": 2
					},
					"objectNotFound": {
						"viewName": "ObjectNotFound",
						"viewId": "objectNotFound",
						"viewLevel": 2
					},
					"notFound": {
						"viewName": "NotFound",
						"viewId": "notFound"
					}
				}
			}
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

			// set the internationalization model
			this.setModel(new ResourceModel({
				bundleName : mConfig.i18nBundle
			}), "i18n");


			// initialize the error handler with the component
			this._oErrorHandler = new ErrorHandler(this);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ErrorHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy : function () {
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
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
			oRootView.addStyleClass(this.getCompactCozyClass());
			return oRootView;
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact design mode class should be set, which influences the size appearance of some controls.
		 * @return {string}
		 * @public
		 */
		getCompactCozyClass : function() { // in 1.28 "Cozy" mode class does not exist yet, but keep the method name in sync with 1.30
			if (!this._sCompactCozyClass) {
				if (!Device.support.touch) { // apply compact mode if touch is not supported; this could me made configurable for the user on "combi" devices with touch AND mouse
					this._sCompactCozyClass = "sapUiSizeCompact";
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
				oModel.attachEventOnce("metadataLoaded", fnResolve);
				oModel.attachEventOnce("metadataFailed", fnReject);
			});
		}

	});

});
