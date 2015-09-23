/*!
 * ${copyright}
 */

// Root component for the 'explored' app.
sap.ui.define(['jquery.sap.global', './util/MyRouter'],
	function(jQuery, MyRouter) {
	"use strict";


	var Component = sap.ui.core.UIComponent.extend("sap.ui.demokit.explored.Component", {

		metadata : {
			includes : [
				"css/style.css",
				"css/titles.css"
			],
			routing : {
				config : {
					routerClass : MyRouter,
					viewType : "XML",
					viewPath : "sap.ui.demokit.explored.view",
					targetControl : "splitApp",
					clearTarget : false
				},
				routes : [
					{
						pattern : "entity/{id}/{part}",
						name : "entity",
						view : "entity",
						viewLevel : 3,
						targetAggregation : "detailPages"
					},
					{
						pattern : "sample/{id}/preview",
						name : "sample",
						view : "sample",
						viewLevel : 4,
						targetAggregation : "detailPages"
					},
					{
						pattern : "sample/{id}/code/{fileName}",
						name : "code_file",
						view : "code",
						viewLevel : 6,
						targetAggregation : "detailPages",
						transition: "flip"
					},
					{
						pattern : "sample/{id}/code",
						name : "code",
						view : "code",
						viewLevel : 5,
						targetAggregation : "detailPages",
						transition: "flip"
					},
					{
						pattern : "",
						name : "home",
						view : "master",
						viewLevel : 1,
						targetAggregation : "masterPages",
						subroutes : [
							{
								pattern : "{all*}",
								name : "notFound",
								view : "notFound",
								viewLevel : 2,
								targetAggregation : "detailPages"
							}
						]
					}
				]
			}
		},

		/**
		 * !!! The steps in here are sequence dependent !!!
		 */
		init : function () {

			// 1. some very generic requires
			jQuery.sap.require("sap.ui.demokit.explored.util.ObjectSearch");
			jQuery.sap.require("sap.ui.demokit.explored.util.ToggleFullScreenHandler");
					jQuery.sap.require("sap.ui.core.routing.History");
			jQuery.sap.require("sap.m.InstanceManager");
			jQuery.sap.require("sap.m.routing.RouteMatchedHandler");

			// 2. call overridden init (calls createContent)
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

			// 3. nav to initial pages
			var router = this.getRouter();
			if (!sap.ui.Device.system.phone) {
				router.myNavToWithoutHash("sap.ui.demokit.explored.view.master", "XML", true);
				router.myNavToWithoutHash("sap.ui.demokit.explored.view.welcome", "XML", false);
			}

			// 4. initialize the router
			this.routeHandler = new sap.m.routing.RouteMatchedHandler(router);
			router.initialize();
		},

		destroy : function () {

			if (this.routeHandler) {
				this.routeHandler.destroy();
			}
			sap.ui.demokit.explored.util.ToggleFullScreenHandler.cleanUp();

			// call overridden destroy
			sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 *
		 */
		createContent : function () {

			// create root view
			var oView = sap.ui.view({
				id : "app",
				viewName : "sap.ui.demokit.explored.view.app",
				type : "JS",
				viewData : { component : this }
			});

			// set i18n model (must be done before data)
			var sPath = jQuery.sap.getModulePath("sap.ui.demokit.explored");
			var i18nModel = new sap.ui.model.resource.ResourceModel({
				bundleUrl : sPath + "/i18n/messageBundle.properties"
			});
			oView.setModel(i18nModel, "i18n");

			// set entity model
			var oEntData = {
				entityCount : sap.ui.demokit.explored.data.entityCount,
				entities : sap.ui.demokit.explored.data.entities
			};
			var oEntModel = new sap.ui.model.json.JSONModel(oEntData);
			oEntModel.setSizeLimit(100000);
			oView.setModel(oEntModel, "entity");

			// set filter model
			var oFilterData = sap.ui.demokit.explored.data.filter;
			var oFilterModel = new sap.ui.model.json.JSONModel(oFilterData);
			oFilterModel.setSizeLimit(100000);
			oView.setModel(oFilterModel, "filter");

			// set device model
			var deviceModel = new sap.ui.model.json.JSONModel({
				isTouch : sap.ui.Device.support.touch,
				isNoTouch : !sap.ui.Device.support.touch,
				isPhone : sap.ui.Device.system.phone,
				isNoPhone : !sap.ui.Device.system.phone,
				listMode : (sap.ui.Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType : (sap.ui.Device.system.phone) ? "Active" : "Inactive"
			});
			deviceModel.setDefaultBindingMode("OneWay");
			oView.setModel(deviceModel, "device");

			// done
			return oView;
		}
	});

	return Component;

}, /* bExport= */ true);
