sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CurrencyInTable.Component", {

		metadata : {
		    publicMethods : [
				"getTable"
			],

		    manifest: "json"
		},

		getTable : function () {
			return this._rootView.getContent()[0];
		}
	});

	Component.prototype.createContent = function () {
		this._rootView = sap.ui.xmlview({ viewName : "sap.ui.unified.sample.CurrencyInTable.View" });
		return this._rootView;
	};

	return Component;

});
