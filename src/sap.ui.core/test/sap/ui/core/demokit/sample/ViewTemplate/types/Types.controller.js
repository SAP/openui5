/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/ValueState",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/util/XMLHelper"
], function (MessageToast, ValueState, Controller, XMLHelper) {
	"use strict";

	function showSuccessMessage(sContext) {
		MessageToast.show("Data successfully " + sContext);
	}

	return Controller.extend("sap.ui.core.sample.ViewTemplate.types.Types", {
		onInit : function () {
			this.initMessagePopover("messagesButton");
			this.getView().bindObject("/EdmTypesCollection(ID='1')");
			this.getView().bindObject("v2>/EdmTypesCollection(ID='1')");
			this.getView().bindObject("v4>/EdmTypesCollection(ID='1')");
		},

		onReset : function () {
			var i,
				oModel = this.getView().getModel(),
				aObjects = this.getView().findAggregatedObjects(true);

			if (this.getView().getModel("ui").getProperty("/v2")) {
				for (i = 0; i < aObjects.length; i += 1) {
					if (aObjects[i].setValueState) {
						aObjects[i].setValueState(ValueState.None);
					}
				}
				oModel.resetChanges();
				oModel.callFunction("/ResetEdmTypes", {
					urlParameters : {ID : '1'},
					method : "POST",
					success : function () {
						showSuccessMessage("reset");
					}
				});
			} else {
				this.byId("resetButton").getObjectBinding("v4").execute()
					.then(function () {
						//TODO: refresh needed as long there is no synchronisation
						oModel.refresh();
						showSuccessMessage("reset");
					});
			}
		},

		onResetContextBinding: function (oEvent) {
			this.getView().getElementBinding().resetChanges();
			this.getView().getElementBinding("v4").resetChanges();
		},

		onResetModel: function (oEvent) {
			this.getView().getModel().resetChanges();
		},

		onSave : function () {
			var oModel = this.getView().getModel();

			if (this.getView().getModel("ui").getProperty("/v2")) {
				oModel.attachEventOnce("requestCompleted", this, function(oEvent) {
					if (oEvent.getParameter("success")) {
						showSuccessMessage("saved");
					}
				});
				oModel.submitChanges();
			} else {
				oModel.submitBatch("EDMTypes").then(function () {
					showSuccessMessage("saved");
				});
			}
		},

		onSourceCode : function (oEvent) {
			var oView = this.getView(),
				bVisible = this.byId("toggleSourceCodeButton").getPressed(),
				sSource;

			oView.getModel("ui").setProperty("/codeVisible", bVisible);
			if (bVisible) {
				sSource = XMLHelper.serializeXML(oView._xContent)
					.replace(/<!--.*-->/g, "") // remove comments
					.replace(/\t/g, "  ") // indent by just 2 spaces
					.replace(/\n\s*\n/g, "\n") // remove empty lines
					.replace("<HBox id=\"identificationBox\"/>",
						XMLHelper.serializeXML(
							oView.getViewData()[oView.getModel("ui").getProperty("/v4")]._xContent)
						)
					.replace("</mvc:View>", "      </mvc:View>") // indent by just 6 spaces
					.replace(/\t/g, "    ") // indent by just 4 spaces
					.replace(/\n\s*\n/g, "\n");

				oView.getModel("ui").setProperty("/code", sSource);
			}
		},

		onV4 : function (oEvent) {
			var oView = this.getView(),
				oIdentificationBox = this.byId("identificationBox"),
				bV4 = oView.getModel("ui").getProperty("/v4");

			oIdentificationBox.removeAllItems();
			oView.getModel("ui").setProperty("/v2", !bV4);
			oView.unbindObject();
			oView.setModel(oView.getModel(bV4 ? "v4" : "v2"));
			oView.bindObject("/EdmTypesCollection(ID='1')"); // switch implementation v2 <--> v4
			oIdentificationBox.addItem(oView.getViewData()[bV4]);
		}
	});
});
