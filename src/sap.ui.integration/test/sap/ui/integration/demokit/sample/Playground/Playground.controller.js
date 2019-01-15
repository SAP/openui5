sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function (jQuery, Controller, JSONModel) {
	"use strict";
	var ListCardController = Controller.extend("sap.ui.integration.sample.Playground.Playground", {
		onInit: function () {
			//check whether there is a manifest json given with the URL
			var sHash = document.location.hash;
			if (sHash.indexOf("#manifest=") === 0) {
				this._sHash = decodeURI(sHash).substring("#manifest=".length);
				this._oHashManifest = JSON.parse(this._sHash);
			}
			var sampleModel = new JSONModel();
			this.getView().setModel(sampleModel, "samples");
			var jsonDataModel = new JSONModel();
			this.getView().setModel(jsonDataModel, "jsonData");
			var that = this;
			if (!this._oHashManifest) {
				sampleModel.attachRequestCompleted(function () {
					jQuery.ajax(jQuery.sap.getModulePath("sap.ui.integration.sample.Playground") + "/" + sampleModel.getData()[0].url, {
						async: true,
						dataType: "text",
						success: function (sValue) {
							this.byId("editor").setValue(sValue);
							this.getView().getModel("jsonData").setData(JSON.parse(sValue));
						}.bind(that)
					});
				});
			} else {
				this.byId("editor").setValue(JSON.stringify(this._oHashManifest, null, "\t"));
				this.getView().getModel("jsonData").setData(this._oHashManifest);
			}
			sampleModel.loadData(jQuery.sap.getModulePath("sap.ui.integration.sample.Playground") + "/samples.json");
		},
		onAfterRendering: function () {
			this.byId("outersplitter").setHeight(this.getView().getDomRef().offsetHeight + "px");
		},
		onMenuAction: function (oEvent) {
			var sUrl = oEvent.getParameter("item").getBinding("text").getContext().getProperty("url");
			jQuery.ajax(jQuery.sap.getModulePath("sap.ui.integration.sample.Playground") + "/" + sUrl, {
				async: true,
				dataType: "text",
				success: function (sValue) {
					this.byId("editor").setValue(sValue);
				}.bind(this)
			});
		},
		onSchemaEditorLiveChange: function (oEvent) {
			var sPath = oEvent.getParameter("path");
			this.getView().getModel("jsonData").setProperty(sPath, oEvent.getParameter("value"));
			this.byId("editor").setValue(JSON.stringify(this.getView().getModel("jsonData").getData(), null, "\t"));
		},
		onManifestEdited: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			try {
				var oData = JSON.parse(sValue);
				this.byId("cardSample").setManifest(oData);
				this.getView().getModel("jsonData").setData(oData);
			} catch (ex) {
				this.byId("cardSample").setManifest(null);
				this.getView().getModel("jsonData").setData(null);
			}
		}
	});

	return ListCardController;

});