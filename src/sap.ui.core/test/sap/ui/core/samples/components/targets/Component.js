/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'samples/components/routing/RouterExtension', 'sap/ui/commons/Button', 'sap/ui/core/UIComponent', 'sap/ui/core/mvc/Controller', 'sap/ui/core/mvc/JSView'],
	function(jQuery, RouterExtension, Button, UIComponent, Controller, JSView) {
	"use strict";


	// new Component
	var Component = UIComponent.extend("samples.components.targets.Component", {

		metadata : {
			routing : {
				config : {
					targetsClass : "sap.m.routing.Targets",
					async: true
				},
				targets: {
					myTarget: {
						viewType : "XML"
					}
				}
			}
		},

		createContent : function () {
			Controller.extend("samples.components.routing.TestController", {});
			sap.ui.jsview("samples.components.routing.TestView", {
				createContent : function() {
					return new Button();
				},
				getController : function() {
					return sap.ui.controller("samples.components.routing.TestController");
				}
			});

			this.oView = sap.ui.jsview("samples.components.routing.TestView");
			return this.oView;
		}
	});


	return Component;

});
