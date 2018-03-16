/*!
 * ${copyright}
 */

// Root component for the 'explored' app.
sap.ui.define(['jquery.sap.global', 'sap/ui/Device',
	'sap/ui/core/UIComponent', 'sap/ui/core/mvc/View',
	'sap/ui/model/json/JSONModel', 'sap/ui/model/resource/ResourceModel',
	'sap/m/routing/RouteMatchedHandler',
	'./util/MyRouter', './util/ToggleFullScreenHandler', './data'],
	function(jQuery, Device, UIComponent, View, JSONModel, ResourceModel, RouteMatchedHandler, MyRouter, ToggleFullScreenHandler, data) {
	"use strict";


	var Component = UIComponent.extend("sap.ui.demokit.explored.Component", {

		metadata : {
			includes : [
				"css/style.css"
			],
			routing : {
				config : {
					routerClass : MyRouter,
					viewType : "XML",
					viewPath : "sap.ui.demokit.explored.view",
					targetControl : "splitApp",
					clearTarget : false,
					async: true
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

			// 1. call overridden init (calls createContent)
			UIComponent.prototype.init.apply(this, arguments);

			// 2. nav to initial pages
			var router = this.getRouter();
			if (!Device.system.phone) {
				router.myNavToWithoutHash("sap.ui.demokit.explored.view.master", "XML", true);
				router.myNavToWithoutHash("sap.ui.demokit.explored.view.welcome", "XML", false);
			}

			// 3. initialize the router
			this.routeHandler = new RouteMatchedHandler(router);
			router.initialize();
		},

		destroy : function () {

			if (this.routeHandler) {
				this.routeHandler.destroy();
			}
			ToggleFullScreenHandler.cleanUp();

			// call overridden destroy
			UIComponent.prototype.destroy.apply(this, arguments);
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
			var i18nModel = new ResourceModel({
				bundleUrl : sPath + "/i18n/messageBundle.properties"
			});
			oView.setModel(i18nModel, "i18n");

			// set entity model
			var oEntData = {
				entityCount : data.entityCount,
				entities : data.entities
			};
			var oEntModel = new JSONModel(oEntData);
			oEntModel.setSizeLimit(100000);
			oView.setModel(oEntModel, "entity");

			// set filter model
			var oFilterData = data.filter;
			var oFilterModel = new JSONModel(oFilterData);
			oFilterModel.setSizeLimit(100000);
			this.setModel(oFilterModel, "filter");

			// set device model
			var deviceModel = new JSONModel({
				isTouch : Device.support.touch,
				isNoTouch : !Device.support.touch,
				isPhone : Device.system.phone,
				isNoPhone : !Device.system.phone,
				listMode : (Device.system.phone) ? "None" : "SingleSelectMaster",
				listItemType : (Device.system.phone) ? "Active" : "Inactive"
			});
			deviceModel.setDefaultBindingMode("OneWay");
			oView.setModel(deviceModel, "device");

			// done
			return oView;
		}
	});

	return Component;

});
