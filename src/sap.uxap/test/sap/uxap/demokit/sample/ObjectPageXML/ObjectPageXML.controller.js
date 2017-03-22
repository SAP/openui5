sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/MessageToast"
], function (JSONModel, Controller, MessageToast) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageXML.ObjectPageXML", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/ObjectPageOnJSON/HRData.json");

			//initial state for this object page
			this.oObjectPageStateModel = new JSONModel({
				scrollingSectionId: "",   //the only property that is not really bindable
				sections: [
					{
						title: "my first section",
						subsections: [
							{
								title: "general info",
								mode: "Collapsed"
							},
							{
								title: "my detail info",
								mode: "Collapsed"
							}
						]
					},
					{
						title: "my second section",
						subsections: [
							{
								title: "compensation",
								mode: "Collapsed"
							},
							{
								title: "compensation details",
								mode: "Expanded"
							}
						]
					}
				]
			});

			this.getView().setModel(oJsonModel, "ObjectPageModel");
			this.getView().setModel(this.oObjectPageStateModel, "ObjectPageState");

			this.oObjectPage = this.getView().byId("ObjectPageLayout");
		},
		onActionPress: function (oEvent) {
			MessageToast.show("action pressed !");
		},
		showCurrentSection: function (oEvent) {
			MessageToast.show("you are currently scrolling " + this.oObjectPage.getScrollingSectionId());
		},
		showObjectPageState: function (oEvent) {
			this.oObjectPageStateModel.setProperty("/scrollingSectionId", this.oObjectPage.getScrollingSectionId());  //the only property that is not really bindable
			MessageToast.show("ObjectPageLayout current state:\r\n" + JSON.stringify(this.oObjectPageStateModel.getData(), null, 4));
		}
	});
}, true);
