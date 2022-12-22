sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel'
], function(UIComponent, JSONModel) {
	"use strict";

	var Component = UIComponent.extend("qunit.router.component.eventOrder.Child.Component", {
		metadata : {
			manifest: "json"
		},
		init : function() {
			UIComponent.prototype.init.apply(this, arguments);
			this.setModel(new JSONModel({
				titleComponent1: "Title defined in model"
			}));
			this.getRouter().initialize();
		}
	});

	return Component;

});
