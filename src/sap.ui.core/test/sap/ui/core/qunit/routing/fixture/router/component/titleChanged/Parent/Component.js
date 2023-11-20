sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel'
], function(UIComponent, JSONModel) {
	"use strict";

	var Component = UIComponent.extend("qunit.router.component.titleChanged.Parent.Component", {
		metadata : {
			manifest: "json"
		},
		init : function() {
			UIComponent.prototype.init.apply(this, arguments);
			this.setModel(new JSONModel({}));
		}
	});

	return Component;

});
