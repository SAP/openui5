 /*
* @${copyright}
*/

sap.ui.define([ "sap/ui/core/UIComponent"], function(UIComponent) {
	"use strict";
	return UIComponent.extend("sap.ui.fl.qunit.integration.testComponentComplex.Component", {
		init : function() {
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		},

		createContent: function() {
			var oEmbeddedComponent = this.runAsOwner( function () {
				return sap.ui.component({
					name: "sap.ui.fl.qunit.integration.testComponentReuse",
					id: this.createId("sap.ui.fl.qunit.integration.testComponentReuse"),
					manifestFirst: true,
					"metadata": {
						"manifest": "json"
					}
				});
			}.bind( this ) );

			var oComponentContainer = new sap.ui.core.ComponentContainer(this.createId("myContainer"), {
				propagateModel: true
			});
			oComponentContainer.setComponent(oEmbeddedComponent);

			return oComponentContainer;
		}
	});
});
