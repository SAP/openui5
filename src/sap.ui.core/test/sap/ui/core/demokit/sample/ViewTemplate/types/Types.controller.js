/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/ui/core/ValueState',
		'sap/m/MessageBox',
		'sap/m/MessagePopover',
		'sap/m/MessagePopoverItem',
		'sap/m/MessageToast',
		'jquery.sap.encoder',
		'jquery.sap.xml'
	], function(jQuery, Controller, ValueState, MessageBox, MessagePopover, MessagePopoverItem,
		MessageToast) {
	"use strict";

	function showSuccessMessage(sContext) {
		MessageToast.show("Data successfully " + sContext);
	}

	return Controller.extend("sap.ui.core.sample.ViewTemplate.types.Types", {
		showErrorPopover : function (sButtonID) {
			this.messagePopover.openBy(this.getView().byId(sButtonID));
		},

		onInit : function () {

			this.messagePopover = new MessagePopover({
				items : {
					path :"message>/",
					template : new MessagePopoverItem({description : "{message>description}",
						type : "{message>type}", title :"{message>message}"})
				}
			});
			this.messagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),
				"message");
			this.getView().bindObject("/EdmTypesCollection(ID='1')");
			this.getView().bindObject("v2>/EdmTypesCollection(ID='1')");
			this.getView().bindObject("v4>/EdmTypesCollection(ID='1')");
		},

		onReset : function () {
			var i,
				aObjects = this.getView().findAggregatedObjects(true),
				that = this,
				oView = this.getView();

			if (oView.getModel("ui").getProperty("/v2")) {

				for (i = 0; i < aObjects.length; i += 1) {
					if (aObjects[i].setValueState) {
						aObjects[i].setValueState(ValueState.None);
					}
				}
				this.getView().getModel().resetChanges();
				this.getView().getModel().callFunction("/ResetEdmTypes", {
					method : "POST",
					success : function () {
						showSuccessMessage("reset");
					},
					error : function (oError) {
						that.showErrorPopover("resetButton");
					}
				});
			} else {
				oView.byId("resetButton").getObjectBinding("v4").execute()
					.then(function () {
						var oModel = oView.getModel();

						//TODO: refresh needed as long there is no synchronisation
						oModel.refresh();
						showSuccessMessage("reset");
					}, function () {
						that.showErrorPopover("resetButton");
					});
			}
		},

		onSave : function () {
			var that = this,
				oView = this.getView(),
				oModel = oView.getModel();

			if (oView.getModel("ui").getProperty("/v2")) {
				oModel.attachEventOnce("requestCompleted", this, function(oEvent) {
					if (oEvent.getParameter("success")) {
						showSuccessMessage("saved");
					} else {
						that.showErrorPopover("saveButton");
					}
				});
				oModel.submitChanges();
			} else {
				oModel.submitBatch("EDMTypes").then(function () {
					showSuccessMessage("saved");
				},
				function () {
					that.showErrorPopover("saveButton");
				});
			}
		},

		onSourceCode : function (oEvent) {
			var sSource,
				oView = this.getView(),
				bVisible = oView.byId("toggleSourceCode").getPressed();

			oView.getModel("ui").setProperty("/codeVisible", bVisible);
			if (bVisible) {
				sSource = jQuery.sap.serializeXML(oView._xContent)
					.replace(/<!--.*-->/g, "") // remove comments
					.replace(/\t/g, "  ") // indent by just 2 spaces
					.replace(/\n\s*\n/g, "\n") // remove empty lines
					.replace("<HBox id=\"identificationBox\"/>",
						jQuery.sap.serializeXML(
							oView.getViewData()[oView.getModel("ui").getProperty("/v4")]._xContent)
						)
					.replace("</mvc:View>", "      </mvc:View>") // indent by just 6 spaces
					.replace(/\t/g, "    ") // indent by just 4 spaces
					.replace(/\n\s*\n/g, "\n");

				oView.getModel("ui").setProperty("/code", "<div style='"
					+ "font-family: monospace; white-space: pre-wrap;"
					+ "margin: 1em 0; display: block;'>"
					+ "<code>" + jQuery.sap.encodeHTML(sSource) + "</code></div>");
			}
		},

		onV4 : function (oEvent) {
			var oView = this.getView(),
				oIdentificationBox = oView.byId("identificationBox"),
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
