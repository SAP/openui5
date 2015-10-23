/*!
 * ${copyright}
 */

sap.ui.define([
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'sap/m/MessageBox',
		'sap/m/MessageToast',
		'jquery.sap.encoder',
		'jquery.sap.xml'
	], function(jQuery, Controller, MessageBox, MessageToast) {
	"use strict";
	var TypesController = Controller.extend("sap.ui.core.sample.ViewTemplate.types.Types", {
		onInit: function () {

			this.messagePopover = new sap.m.MessagePopover({
				items: {
					path:"message>/",
					template: new sap.m.MessagePopoverItem({description: "{message>description}",
						type: "{message>type}", title:"{message>message}"})
				}
			});
			this.messagePopover.setModel(sap.ui.getCore().getMessageManager().getMessageModel(),
				"message");
		},

		onReset: function () {
			var that = this,
				aObjects = this.getView().findAggregatedObjects(true),
				i;

			for (i = 0; i < aObjects.length; i += 1) {
				if (aObjects[i].setValueState) {
					aObjects[i].setValueState(sap.ui.core.ValueState.None);
				}
			}
			this.getView().getModel().resetChanges();
			this.getView().getModel().callFunction("/ResetEdmTypes", {
				method: "POST",
				success: function () {
					MessageToast.show("Data successfully reset");
				},
				error: function (oError) {
					that.messagePopover.openBy(that.getView().byId("onResetID"));
				}
			});
		},

		onSave: function () {
			var that = this;
			this.getView().getModel().attachEventOnce("requestCompleted", this, function(oEvent) {
				if (oEvent.getParameter("success")) {
					MessageToast.show("Data successfully saved");
				} else {
					that.messagePopover.openBy(that.getView().byId("onSaveID"));
				}
			});
			this.getView().getModel().submitChanges();
		},

		onSourceCode: function (oEvent) {
			var oView = this.getView(),
				sSource,
				bVisible = oView.byId("toggleSourceCode").getPressed();

			oView.getModel("ui").setProperty("/codeVisible", bVisible);
			if (bVisible) {
				sSource = jQuery.sap.serializeXML(oView._xContent)
					.replace(/<!--.*-->/g, "") // remove comments
					.replace(/\t/g, "  ") // indent by just 2 spaces
					.replace(/\n\s*\n/g, "\n"); // remove empty lines
				oView.getModel("ui").setProperty("/code", "<div style='"
					+ "font-family: monospace; white-space: pre-wrap;"
					+ "margin: 1em 0; display: block;'>"
					+ "<code>" + jQuery.sap.encodeHTML(sSource) + "</code></div>");
			}
		}
	});

	return TypesController;
});
