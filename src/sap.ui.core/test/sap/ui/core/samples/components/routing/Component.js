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
			],
			targets: {
				myTarget: {
					viewType : "XML"
				}
			}
		}
	},

	init: function () {
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		this._oViewWhileInit = this.getAggregation("rootControl");
	},

	createContent : function () {
		sap.ui.controller("samples.components.routing.TestController", {});
		sap.ui.jsview("samples.components.routing.TestView", {
			createContent : function() {
				return new sap.ui.commons.Button();
			},
			getController : function() {
				return sap.ui.controller("samples.components.routing.TestController");
			}
		});

		this._oViewWhileCeateContent = this.getAggregation("rootControl");
		this.oView = sap.ui.jsview("samples.components.routing.TestView");
		return this.oView;
	}
});
