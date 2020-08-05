sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.f.cardsdemo.controller.Manifest", {

		onInit: function () {
			this._createCardExample("card1", {
				xmlUsage: "<f:Card manifest='./cardsdemo/model/manifests/manifest_card1.json' width='500px' height='auto'/>"
			});
			this._createCardExample("card2", {
				xmlUsage: "<f:Card manifest='{manifests>/manifestTests/manifest}' width='500px' height='auto'/>"
			});
		},

		_createCardExample: function (sCardId, oData) {
			setTimeout(function () {
				var oView = this.getView(),
					oCard = oView.byId(sCardId),
					oManifest = oCard._oCardManifest.oJson,
					oEditorXmlUsage = oView.byId(sCardId + "-editorXmlUsage"),
					oEditorManifest = oView.byId(sCardId + "-editorManifest");

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