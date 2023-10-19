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
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},
		init(...aArgs) {
			UIComponent.prototype.init.apply(this, aArgs);
		},
		createContent() {
			return this.createComponent({
				usage: "myUsage",
				id: this.createId("sap.ui.fl.qunit.integration.testComponentReuse"),
				metadata: {
					manifest: "json"
				},
				async: true
			}).then(function(oEmbedded) {
				var oComponentContainer = new ComponentContainer(this.createId("myContainer"), {
					propagateModel: true,
					component: oEmbedded
				});

				return oComponentContainer;
			}.bind(this));
		}
	});
});
