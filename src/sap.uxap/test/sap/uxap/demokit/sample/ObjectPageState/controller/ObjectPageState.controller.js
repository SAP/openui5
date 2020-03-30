sap.ui.define([
	"jquery.sap.global",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller"
], function (jQuery, JSONModel, Controller) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageState.controller.ObjectPageState", {
		onInit: function () {
			var oJsonModel = new JSONModel("./test-resources/sap/uxap/demokit/sample/SharedJSONData/HRData.json"),
				oTableModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock") + "/products.json");

			this.getView().setModel(oJsonModel, "ObjectPageModel");
			this.getView().setModel(oTableModel, "TableModel");

			this._oObjectPage = this.getView().byId("ObjectPageLayout");
			this._oObjectPage.attachEvent("subSectionVisibilityChange", this.onSectionVisibilityChanged, this);
		},

		onSectionVisibilityChanged: function(oEvent) {
			var oVisibleSubSections = oEvent.getParameter("visibleSubSections"),
				aSubSectionsIds = Object.keys(oVisibleSubSections);

			if (aSubSectionsIds.length === 1) {
				oVisibleSubSections[aSubSectionsIds[0]].addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
			} else {
				aSubSectionsIds.forEach(function(sKey) {
					oVisibleSubSections[sKey].removeStyleClass("sapUxAPObjectPageSubSectionFitContainer");
				});
			}
		}
	});
}, true);
