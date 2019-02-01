sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/core/mvc/XMLView"],
	function(UIComponent, XMLView) {
	'use strict';

	var Component = UIComponent.extend("sap.tnt.sample.InfoLabelInTable.Component", {
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
			this._rootView = sap.ui.xmlview({ viewName : "sap.tnt.sample.InfoLabelInTable.V" });
			return this._rootView;
		};

		return Component;
	});