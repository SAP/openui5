/*!
 * ${copyright}
 */

sap.ui.controller("sap.ui.core.sample.ViewTemplate.types.Types", {
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
				sap.m.MessageToast.show("Data successfully reset");
			},
			error: function (oError) {
				that.showError("Error resetting EDM types", oError);
			}
		});
	},

	onSave: function () {
		var that = this;
		this.getView().getModel().submitChanges({
			success: function () {
				sap.m.MessageToast.show("Data successfully saved");
			},
			error: function (oError) {
				that.showError("Error saving EDM types", oError);
			}
		});
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

	showError: function(sTitle, oError) {
		jQuery.sap.log.error(sTitle + ": " + oError.message, oError.stack,
			"sap.ui.core.sample.ViewTemplate.types.Types");
		jQuery.sap.require("sap.m.MessageBox");
		sap.m.MessageBox.show(oError.message, {
			icon: sap.m.MessageBox.Icon.ERROR,
			title: sTitle
		});
	}
});