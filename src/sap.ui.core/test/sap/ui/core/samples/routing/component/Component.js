// define a root UIComponent which exposes the main view
sap.ui.define([
		'sap/ui/core/library',
		'sap/ui/core/UIComponent',
		'sap/ui/core/mvc/View',
		'sap/ui/core/routing/Router'
	], function(coreLibrary, UIComponent, View, Router) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	// new Component
	var Component = UIComponent.extend("NavigationWithoutMasterDetailPattern.Component", {

		// TBC: use inline declaration to save roundtrip?
		metadata : {

			"library" : "NavigationWithRoutes",

			"version" : "1.0",

			"includes" : [

			],

			"dependencies" : {
				"libs" : [ "sap.m" ],
				"components" : [],
				"ui5version" : "1.13.1"
			},

			"routing": {

				"config": {

					"viewType" : "XML",
					"viewPath" : "NavigationWithoutMasterDetailPattern.view",
					"targetControl" : "app",
					"targetAggregation" : "pages",
					"clearTarget" : false

				},

				"routes": [{
					"name" : "view1", // name used for listening or navigating to this route
					"pattern" : "FirstView/{from}", // will be the url and from has to be provided in the data
					"view" : "View1"
				},
				{
					"name" : "view2", // name used for listening or navigating to this route
					"pattern" : "SecondView/{from}:?query:", // will be the url and from has to be provided in the data
					"view" : "View2"
				},
				{
					"name" : "catchall", // name used for listening or navigating to this route
					"pattern" : ":all*:", // catchall
					"view" : "List",
					"subroutes": [{
						"name" : "detail", // name used for listening or navigating to this route
						"pattern" : "Detail/{from}", // will be the url and from has to be provided in the data
						"targetControl" : "split",
						"targetAggregation" : "detailPages",
						"view" : "Detail",
						"subroutes" : [{
							"name" : "detaildetail", // name used for listening or navigating to this route
							"pattern" : "Detail/Detail/{from}", // will be the url  and from has to be provided in the data
							"targetControl" : "split",
							"targetAggregation" : "detailPages",
							"view" : "DetailDetail"
						}]
					}]
				}]

			}

		},

		getAutoPrefixId : function() {
			return true;
		},

		createContent : function() {

			var oView = sap.ui.view({
				type : ViewType.XML,
				viewName : "NavigationWithoutMasterDetailPattern.MainXML"
			});
			return oView;

		},

		init : function() {
			UIComponent.prototype.init.apply(this, arguments);

			// this component should automatically initialize the router!
			this.getRouter().initialize();
		}

	});


	return Component;

});
