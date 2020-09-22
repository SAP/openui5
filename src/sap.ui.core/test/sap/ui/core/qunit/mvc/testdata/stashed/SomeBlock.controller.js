sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (JSONModel, Controller) {
	"use strict";

	return Controller.extend("testdata.mvc.stashed.SomeBlock", {
		onInit: function () {
			this.oJsonConfigModel = new JSONModel({subSectionLayout: "TitleOnTop"});
			this.getView().setModel(this.oJsonConfigModel, "ConfigModel");
			this.isTitleOnTop = true;
		},

		toggleTitle: function () {
			this.isTitleOnTop = !(this.isTitleOnTop);
			this.oJsonConfigModel.setProperty("/subSectionLayout", this.isTitleOnTop ? "TitleOnTop" : "TitleOnLeft");
		}
	});
});
