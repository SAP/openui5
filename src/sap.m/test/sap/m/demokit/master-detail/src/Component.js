/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/demo/masterdetail/model/models",
		"sap/ui/demo/masterdetail/controller/ListSelector",
		"sap/ui/demo/masterdetail/controller/ErrorHandler",
		"sap/ui/demo/masterdetail/model/formatter",
		"sap/ui/demo/masterdetail/model/grouper"
], function (UIComponent, ResourceModel, models, ListSelector, ErrorHandler) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.masterdetail.Component", {

		metadata : {
			"rootView": "sap.ui.demo.masterdetail.view.App",
			"dependencies": {
				"minUI5Version": "1.28.0",
				"libs": [ "sap.ui.core", "sap.m", "sap.ui.layout" ]
			},

			"config": {
				"i18nBundle": "sap.ui.demo.masterdetail.i18n.i18n",
				"serviceUrl": "here/goes/your/serviceUrl/"
			},

			"routing": {
				"config": {
					"routerClass": "sap.m.routing.Router",
					"viewType": "XML",
					"viewPath": "sap.ui.demo.masterdetail.view",
					"controlId": "idAppControl",
					"controlAggregation": "detailPages",
					"bypassed": {
						"target": ["master", "notFound"]
					}
				},
				"routes": [
					{
						"pattern": "",
						"name": "master",
						"target": ["object", "master"]
					},
					{
						"pattern": "object/{objectId}",
						"name": "object",
						"target": ["master", "object"]
					}
				],
				"targets": {
					"master": {
						"viewName": "Master",
						"viewLevel": 1,
						"viewId": "master",
						"controlAggregation": "masterPages"
					},
					"object": {
						"viewName": "Detail",
						"viewId": "detail",
						"viewLevel": 2
					},
					"detailObjectNotFound": {
						"viewName": "DetailObjectNotFound",
						"viewId": "detailObjectNotFound",
						"viewLevel": 3
					},
					"detailNoObjectsAvailable": {
						"viewName": "DetailNoObjectsAvailable",
						"viewId": "detailNoObjectsAvailable",
						"viewLevel": 3
					},
					"notFound": {
						"viewName": "NotFound",
						"viewId": "notFound",
						"viewLevel": 3
					}
				}
			}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this method, the resource and application models are set and the router is initialized.
		 * @public
		 * @override
		 */
		init : function () {
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

			var mConfig = this.getMetadata().getConfig();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// set the internationalization model
			this.setModel(new ResourceModel({
				bundleName : mConfig.i18nBundle
			}), "i18n");

			this.oListSelector = new ListSelector();

			this._oErrorHandler = new ErrorHandler(this);

			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);

			this._oRootView = this.getAggregation("rootControl").addStyleClass(this.getCompactCozyClass());

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ListSelector and ErrorHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy : function () {
			this.oListSelector.destroy();
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact design mode class should be set, which influences the size appearance of some controls.
		 * @return {string} the currently active 'cozy' mode class
		 * @public
		 */
		getCompactCozyClass : function() { // in 1.28 "Cozy" mode class does not exist yet, but keep the method name in sync with 1.30
			if (!this._sCompactCozyClass) {
				if (!sap.ui.Device.support.touch) { // apply compact mode if touch is not supported; this could me made configurable for the user on "combi" devices with touch AND mouse
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
				oModel.attachEventOnce("metadataLoaded", function() {
					fnResolve();
				});
				oModel.attachEventOnce("metadataFailed", function() {
					fnReject();
				});
			});
		}

	});

});
