/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/mvc/View"
], function(UIComponent, View) {
	"use strict";

	// new Component
	var Component = UIComponent.extend("testdata.routing.targets.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			routing: {
				config: {
					targetsClass: "sap.m.routing.Targets",
					async: true
				},
				targets: {
					myTarget: {
						viewType: "XML"
					}
				}
			}
		},

		createContent : function () {
			this.pView = View.create({
				viewName: "module:testdata/routing/TestView"
			});

			return this.pView;
		}
	});

	return Component;

});
