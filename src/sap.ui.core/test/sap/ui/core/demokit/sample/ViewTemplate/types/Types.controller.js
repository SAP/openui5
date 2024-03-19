/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/library",
	"sap/ui/core/sample/common/Controller",
	"sap/ui/model/odata/type/DateTimeOffset",
	"sap/ui/util/XMLHelper"
], function (MessageToast, library, Controller, DateTimeOffset, XMLHelper) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = library.ValueState;

	function showSuccessMessage(sContext) {
		MessageToast.show("Data successfully " + sContext);
	}

	return Controller.extend("sap.ui.core.sample.ViewTemplate.types.Types", {
		/**
		 * Function is called by <code>onSourceCode</code> before the source code is pretty printed.
		 * It replaces <code>identificationBox</code> control by the corresponding XML.
		 *
		 * @param {string} sSourceCode The source code
		 * @returns {string} The modified source code
		 */
		beforePrettyPrinting : function (sSourceCode) {
			var oView = this.getView(),
				bV4 = oView.getModel("ui").getProperty("/v4"),
				sIdentification = XMLHelper.serialize(oView.getViewData()[bV4]._xContent);

			// adjust indentation
			sIdentification = sIdentification.replace(/\n/g, "\n\t\t");

			return sSourceCode.replace("<HBox id=\"identificationBox\"/>", sIdentification);
		},

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
					urlParameters : {ID : "1"},
					method : "POST",
					success : function () {
						showSuccessMessage("reset");
					}
				});
			} else {
				this.byId("resetButton").getObjectBinding("v4").invoke()
					.then(function () {
						//TODO: refresh needed as long there is no synchronisation
						oModel.refresh();
						showSuccessMessage("reset");
					});
			}
		},

		onResetContextBinding : function () {
			this.getView().getElementBinding().resetChanges();
			this.getView().getElementBinding("v4").resetChanges();
		},

		onResetModel : function () {
			this.getView().getModel().resetChanges();
		},

		onSave : function () {
			var oModel = this.getView().getModel();

			if (this.getView().getModel("ui").getProperty("/v2")) {
				oModel.attachEventOnce("requestCompleted", this, function (oEvent) {
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

		onV4 : function () {
			var oView = this.getView(),
				oIdentificationBox = this.byId("identificationBox"),
				bV4 = oView.getModel("ui").getProperty("/v4");

			oIdentificationBox.removeAllItems();
			oView.getModel("ui").setProperty("/v2", !bV4);
			oView.unbindObject();
			oView.setModel(oView.getModel(bV4 ? "v4" : "v2"));
			oView.bindObject("/EdmTypesCollection(ID='1')"); // switch implementation v2 <--> v4
			oIdentificationBox.addItem(oView.getViewData()[bV4]);
			if (!bV4) {
				// After V4 has been displayed the type is marked as bV4; type is reused when
				// switching back to V2 but in this case the internal value is null -> reset the
				// type when switching back to V2
				oView.byId("I67").getBinding("value").getBindings()[0]
					.setType(new DateTimeOffset());
				oView.byId("I69").getBinding("value").getBindings()[0]
					.setType(new DateTimeOffset());
				oView.byId("I74").getBinding("value").getBindings()[0]
					.setType(new DateTimeOffset());
				oView.byId("I75").getBinding("dateValue").getBindings()[0]
					.setType(new DateTimeOffset());
				oView.byId("I79").getBinding("value").getBindings()[0]
					.setType(new DateTimeOffset());
				oView.byId("I80").getBinding("value").getBindings()[0]
					.setType(new DateTimeOffset());
			}
		}
	});
});
