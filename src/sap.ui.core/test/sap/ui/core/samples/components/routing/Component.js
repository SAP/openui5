/*!
 * ${copyright}
 */

jQuery.sap.declare("samples.components.routing.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.commons.Button");
jQuery.sap.require("samples.components.routing.RouterExtension");

// new Component
sap.ui.core.UIComponent.extend("samples.components.routing.Component", {

	metadata : {
		routing : {
			config : {
				routerClass : samples.components.routing.RouterExtension
			},
			routes : [
				{
					name : "firstRoute",
					pattern : "first/{firstMandatoryParameter}"
				}
			]
		}
	},

	createContent : function () {
		sap.ui.controller("samples.components.routing.TestController", {});
		return sap.ui.jsview("samples.components.routing.TestView", {
			createContent : function() {
				return new sap.ui.commons.Button();
			},
			getController : function() {
				return sap.ui.controller("samples.components.routing.TestController");
			}
		});
	}
});