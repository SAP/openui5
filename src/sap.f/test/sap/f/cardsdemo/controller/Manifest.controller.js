sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (Controller, JSONModel, Fragment) {
	"use strict";
	return Controller.extend("sap.f.cardsdemo.controller.Manifest", {
		onInit: function () {
			this._createCardExample("card1", {
				xmlUsage: "<f:Card manifest='./model/manifests/manifest_card1.json' width='500px' height='auto'/>"
			});
			this._createCardExample("card2", {
				xmlUsage: "<f:Card manifest='{manifests>/manifestTests/manifest}' width='500px' height='auto'/>"
			});
		},
		_createCardExample: function (sCardId, oData) {
			setTimeout(function () {
				var oCard = this.getView().byId(sCardId);
				var oEditorXmlUsage = this.getView().byId(sCardId + "-editorXmlUsage");
				var oEditorManifest = this.getView().byId(sCardId + "-editorManifest");
				var oManifest = oCard._oCardManifest.oJson;
				oEditorManifest.setValue(JSON.stringify(oManifest, null, '\t'));
				oEditorXmlUsage.setValue(oData.xmlUsage);
				oEditorManifest._oEditor.resize();
				oEditorXmlUsage._oEditor.resize();
				oEditorManifest.setBusy(false);
				oEditorXmlUsage.setBusy(false);
			}.bind(this), 2000);
		}
    });
});