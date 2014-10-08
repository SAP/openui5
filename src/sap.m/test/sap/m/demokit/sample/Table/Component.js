jQuery.sap.declare("sap.m.sample.Table.Component");

sap.ui.core.UIComponent.extend("sap.m.sample.Table.Component", {

	metadata : {
		publicMethods : [
			"getTable"
		],
		dependencies : {
			libs : [
				"sap.m",
				"sap.ui.layout"
			]
		},
		config : {
			sample : {
				files : [
					"Table.view.xml",
					"Table.controller.js",
					"Formatter.js"
				]
			}
		}
	},
	
	getTable : function () {
		return this._rootView.getContent()[0];
	}
});

sap.m.sample.Table.Component.prototype.createContent = function () {
	this._rootView = sap.ui.xmlview({ viewName : "sap.m.sample.Table.Table" });
	return this._rootView;
};