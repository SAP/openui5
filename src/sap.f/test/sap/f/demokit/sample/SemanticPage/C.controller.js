sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	'sap/m/MessagePopover',
	'sap/m/MessagePopoverItem',
	'sap/m/MessageBox'
], function(jQuery, Controller, Filter, JSONModel, MessagePopover, MessagePopoverItem, MessageBox) {
	"use strict";

	return Controller.extend("sap.f.sample.SemanticPage.C", {
		onInit: function () {
			var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor(),
				oMessageManager = sap.ui.getCore().getMessageManager();

			this.oModel = new JSONModel();
			this.oModel.loadData(jQuery.sap.getModulePath("sap.f.sample.SemanticPage", "/model.json"), null, false);
			this.oSemanticPage = this.byId("mySemanticPage");
			this.oEditAction = this.byId("editAction");
			this.oSemanticPage.setModel(this.oModel);

			oMessageManager.registerMessageProcessor(oMessageProcessor);
			oMessageManager.addMessages(
				new sap.ui.core.message.Message({
					message: "Something wrong happened",
					type: sap.ui.core.MessageType.Error,
					processor: oMessageProcessor
				})
			);
		},

		onMessagesButtonPress: function(oEvent) {
			var oMessagesButton = oEvent.getSource();

			if (!this._messagePopover) {
				this._messagePopover = new MessagePopover({
					items: {
						path: "message>/",
						template: new MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});
				oMessagesButton.addDependent(this._messagePopover);
			}
			this._messagePopover.toggle(oMessagesButton);
		},

		onEdit : function() {
			this.showFooter(true);
			this.oEditAction.setVisible(false);
		},

		onSave: function() {
			this.showFooter(false);
			this.oEditAction.setVisible(true);
			MessageBox.alert("Successfully saved!");
		},

		onCancel: function() {
			this.showFooter(false);
			this.oEditAction.setVisible(true);
		},

		showFooter: function(bShow) {
			this.oSemanticPage.setShowFooter(bShow);
		}
	});
});