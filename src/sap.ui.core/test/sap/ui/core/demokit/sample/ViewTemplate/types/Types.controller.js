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
	], function(jQuery, Controller, MessageBox, MessageToast/*, jQuerySapEncoder, jQuerySapXML*/) {
	"use strict";

	var TypesController = Controller.extend("sap.ui.core.sample.ViewTemplate.types.Types", {
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
					that.showError("Error resetting EDM types");
				}
			});
		},

		onSave: function () {
			var that = this;
			this.getView().getModel().attachEventOnce("requestCompleted", this, function(oEvent) {
				if (oEvent.getParameter("success")) {
					MessageToast.show("Data successfully saved");
				} else {
					that.showError("Error saving EDM types");
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
				oView.getModel("ui").setProperty("/code",
					"<pre><code>" + jQuery.sap.encodeHTML(sSource) + "</code></pre>");
			}
		},

		showError: function(sTitle) {
			var oMessageManager = sap.ui.getCore().getMessageManager(),
				aData = oMessageManager.getMessageModel().getData() ?
					oMessageManager.getMessageModel().getData() : [],
				aMessages = [],
				sMessage;

			aData.forEach( function (oData) {
				aMessages.push({type: oData.type,
					description: oData.description,
					message: oData.message,
					code: oData.code
				});
			});
			sMessage = JSON.stringify(aMessages);
			jQuery.sap.log.error(sTitle + ": " + sMessage,
				"sap.ui.core.sample.ViewTemplate.types.Types");
			MessageBox.show(sMessage, {icon: MessageBox.Icon.ERROR, title: sTitle});
			oMessageManager.removeAllMessages();
		}
	});

	return TypesController;

});
