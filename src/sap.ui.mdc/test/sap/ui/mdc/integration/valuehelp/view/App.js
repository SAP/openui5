sap.ui.define(["sap/ui/core/mvc/View", "sap/ui/core/mvc/XMLView", "../model/State"], (View, XMLView, oStateModel) => {
	"use strict";

	oStateModel.getProperty("/activeView");

	return View.extend("sap.ui.v4demo.view.App", {
		createContent : function () {
			return XMLView.create({
				id: "appView",
				preprocessors : {
					xml: {
						models: {
							tplState: oStateModel
						}
					}
				},
				viewName : "sap.ui.v4demo.view.AppTemplate"
			}).then(function (oView) {
				oView.setModel(oStateModel, "runtimeState");
				return oView;
			});
		}
	});
});