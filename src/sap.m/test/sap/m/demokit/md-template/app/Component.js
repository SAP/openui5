sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/demo/mdtemplate/model/Device",
		"sap/ui/demo/mdtemplate/model/AppModel",
		"sap/ui/demo/mdtemplate/controller/ListSelector",
		"sap/ui/demo/mdtemplate/controller/BusyHandler",
		"sap/ui/demo/mdtemplate/Router",
		"sap/ui/demo/mdtemplate/model/formatter",
		"sap/ui/demo/mdtemplate/model/grouper"
	], function (UIComponent, ResourceModel, DeviceModel, AppModel, ListSelector, BusyHandler, Router) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.mdtemplate.Component", {

		metadata : {
			name : "MD Template",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},

			rootView : "sap.ui.demo.mdtemplate.view.App",

			config : {
				messageBundle : "sap.ui.demo.mdtemplate.i18n.messageBundle",
				// always use absolute paths relative to our own component
				// (relative paths will fail if running in the Fiori Launchpad)
				rootPath: jQuery.sap.getModulePath("sap.ui.demo.mdtemplate"),
				serviceUrl: "here/goes/your/serviceUrl/"
			},

			routing : {
				config : {
					// bugfix: right now there is a bug in the routing/targets, the prefixing for xml views is not working
					// therefore the controlId "idAppControl" cannot be found
					// Tobias is fixing this at the moment
					rootView : "__xmlview0",
					// end bugfix
					routerClass : Router,
					viewType : "XML",
					viewPath : "sap.ui.demo.mdtemplate.view",
					controlId: "idAppControl",
					controlAggregation: "detailPages",
					bypassed: {
						target: ["master", "notFound"]
					}
				},
				routes : [
					{
						pattern: "",
						name: "master",
						target: ["object", "master"]
					},
					{
						pattern : "object/{objectId}",
						name : "object",
						target: ["master", "object"]
					},
					{
						pattern : "object/{objectId}/lineitem/{lineItemId}",
						name: "lineItem",
						target: ["master", "lineItem"]
					}
				],
				targets: {
					master : {
						viewName: "Master",
						viewLevel: 1,
						controlAggregation: "masterPages"
					},
					object : {
						viewName: "Detail",
						viewLevel: 2
					},
					lineItem : {
						viewName: "LineItem",
						viewLevel: 3
					},
					// not found targets
					detailObjectNotFound : {
						viewName: "DetailObjectNotFound",
						viewLevel: 3
					},
					detailNoObjectsAvailable: {
						viewName: "DetailNoObjectsAvailable",
						viewLevel: 3
					},
					lineItemNotFound : {
						viewName: "LineItemNotFound",
						viewLevel: 3
					},
					notFound : {
						viewName: "NotFound",
						viewLevel: 3
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
			var mConfig = this.getMetadata().getConfig();

			// call the base component's init function
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

			// set the internationalization model
			this.setModel(new ResourceModel({
				bundleName : mConfig.messageBundle
			}), "i18n");

			this.oListSelector = new ListSelector();

			// set the app data model
			this.setModel(new AppModel(mConfig.serviceUrl));
			this._createMetadataPromise(this.getModel());

			// initialize the busy handler with the component
			this._oBusyHandler = new BusyHandler(this);

			// set the device model
			this.setModel(new DeviceModel(), "device");

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

			// call the base component's destroy function
			sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * In this method, the rootView is initialized and stored.
		 * @public
		 * @override
		 */
		createContent : function() {
			// call the base component's createContent function
			this._oRootView = sap.ui.core.UIComponent.prototype.createContent.apply(this, arguments);

			return this._oRootView;
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
