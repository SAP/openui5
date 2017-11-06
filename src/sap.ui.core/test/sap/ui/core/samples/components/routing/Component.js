/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './RouterExtension', 'sap/ui/commons/Button', 'sap/ui/core/UIComponent', 'sap/ui/core/mvc/Controller', 'sap/ui/core/mvc/JSView'],
	function(jQuery, RouterExtension, Button, UIComponent, Controller, JSView) {
	"use strict";


	// new Component
	var Component = UIComponent.extend("samples.components.routing.Component", {

		metadata : {
			routing : {
				config : {
					routerClass : RouterExtension,
					async: true
				},
				routes : [
					{
						name : "firstRoute",
						pattern : "first/{firstMandatoryParameter}"
					}
				],
				targets: {
					myTarget: {
						viewType : "XML"
					}
				}
			}
		},

		init: function () {
			UIComponent.prototype.init.apply(this, arguments);
			this._oViewWhileInit = this.getRootControl();
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

			this._oViewWhileCeateContent = this.getRootControl();
			this.oView = sap.ui.jsview("samples.components.routing.TestView");
			return this.oView;
		}
	});


	return Component;

});
