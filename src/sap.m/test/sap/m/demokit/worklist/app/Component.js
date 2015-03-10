sap.ui.define([
		"sap/ui/core/UIComponent",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/demo/worklist/model/Device",
		"sap/ui/demo/worklist/model/AppModel",
		"sap/ui/demo/worklist/model/formatter"
	], function (UIComponent, ResourceModel, DeviceModel, AppModel) {
	"use strict";

	return UIComponent.extend("sap.ui.demo.worklist.Component", {

		metadata : {
			name : "worklist Template",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},

			rootView : "sap.ui.demo.worklist.view.App",

			config : {
				messageBundle : "sap.ui.demo.worklist.i18n.messageBundle",
				// always use absolute paths relative to our own component
				// (relative paths will fail if running in the Fiori Launchpad)
				rootPath: jQuery.sap.getModulePath("sap.ui.demo.worklist"),
				serviceUrl: "here/goes/your/serviceUrl/"
			},

			routing : {
				config : {
					routerClass : "sap.m.routing.Router",
					viewType : "XML",
					viewPath : "sap.ui.demo.worklist.view",
					controlId: "app",
					controlAggregation: "pages",
					bypassed: {
						target: "notFound"
					}
				},
				routes : [
					{
						pattern: "",
						name: "worklist",
						target: "worklist"
					},
					{
						pattern : "object/{objectId}",
						name : "object",
						target: "object"
					}
				],
				targets: {
					worklist : {
						viewName: "Worklist",
						viewId: "worklist",
						viewLevel: 1
					},
					object : {
						viewName: "Object",
						viewId: "object",
						viewLevel: 2
					},
					// not found targets
					objectNotFound : {
						viewName: "ObjectNotFound",
						viewId: "objectNotFound",
						viewLevel: 2
					},
					notFound : {
						viewName: "NotFound",
						viewId: "notFound",
						viewLevel: 2
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
				bundleName : mConfig.messageBundle
			}), "i18n");


			// set the device model
			this.setModel(new DeviceModel(), "device");

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
			var oAppModel = new AppModel(this.getMetadata().getConfig().serviceUrl);
			this.setModel(oAppModel);
			this._createMetadataPromise(oAppModel);

			// call the base component's createContent function
			return UIComponent.prototype.createContent.apply(this, arguments);
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
