 /*
* @${copyright}
*/

sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer"
], function(
	UIComponent,
	ComponentContainer
) {
	"use strict";
	return UIComponent.extend("sap.ui.fl.qunit.integration.testComponentComplex.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		},
		createContent: function () {
			var oEmbedded = this.createComponent({
				usage: "myUsage",
				id: this.createId("sap.ui.fl.qunit.integration.testComponentReuse"),
				metadata: {
					manifest: "json"
				},
				async: false
			});
			var oComponentContainer = new ComponentContainer(this.createId("myContainer"), {
				propagateModel: true,
				component: oEmbedded
			});

			return oComponentContainer;
		}
	});
});
