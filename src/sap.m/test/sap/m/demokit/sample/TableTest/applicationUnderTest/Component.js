sap.ui.define(['sap/ui/core/UIComponent','sap/ui/core/mvc/XMLView'],
	function(UIComponent, XMLView) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TableTest.applicationUnderTest.Component", {

		metadata : {
			manifest: "json"
		},

		getTable : function () {
			return this._rootView.getContent()[0];
		}
	});

	Component.prototype.createContent = function () {
		XMLView.create({ viewName : "view.Table" }).then(function(oView) {
			return oView;
		});
	};

	return Component;

});
