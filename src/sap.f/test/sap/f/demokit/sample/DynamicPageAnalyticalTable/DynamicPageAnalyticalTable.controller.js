sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem"
], function (jQuery, Controller, Filter, JSONModel, MessagePopover, MessagePopoverItem) {
	"use strict";


	return Controller.extend("sap.f.sample.DynamicPageAnalyticalTable.DynamicPageAnalyticalTable", {
		onInit: function () {
			this.oModel = new JSONModel();
			this.oModel.loadData(jQuery.sap.getModulePath("sap.f.sample.DynamicPageListReport", "/model.json"), null, false);
			this.getView().setModel(this.oModel);

			this.aKeys = ["Name", "Category", "SupplierName"];
			this.oSelectName = this.getSelect("slName");
			this.oSelectCategory = this.getSelect("slCategory");
			this.oSelectSupplierName = this.getSelect("slSupplierName");

			this._oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			this._oMessageManager = sap.ui.getCore().getMessageManager();
			this._oMessageManager.registerMessageProcessor(this._oMessageProcessor);

			// Initializing popover
			this.initializePopover();
		},
		onExit: function () {
			this.aKeys = [];
			this.aFilters = [];
			this.oModel = null;
		},
		onToggleFooter: function () {
			this.getPage().setShowFooter(!this.getPage().getShowFooter());
		},
		formatToggleButtonText: function (bValue) {
			return bValue ? "Collapse Header" : "Expand Header";
		},
		updateFilterCriteria: function (aFilterCriteria) {
			if (aFilterCriteria.length > 0) { /* We can`t use a single label and change only the model data, */
				this.removeSnappedLabel();
				/* because in case of label with an empty text, */
				this.addSnappedLabel();
				/* a space for the snapped content will be allocated and can lead to title misalignment */
				this.oModel.setProperty("/Filter/text", this.getFormattedSummaryText(aFilterCriteria));
			} else {
				this.removeSnappedLabel();
			}
		},
		addSnappedLabel: function () {
			this.getPageTitle().addSnappedContent(this.getSnappedLabel());
		},
		removeSnappedLabel: function () {
			this.getPageTitle().destroySnappedContent();
		},
		getFilters: function (aCurrentFilterValues) {
			this.aFilters = [];

			this.aFilters = this.aKeys.map(function (sCriteria, i) {
				return new sap.ui.model.Filter(sCriteria, sap.ui.model.FilterOperator.Contains, aCurrentFilterValues[i]);
			});

			return this.aFilters;
		},
		getFilterCriteria: function (aCurrentFilterValues) {
			return this.aKeys.filter(function (el, i) {
				if (aCurrentFilterValues[i] !== "") return el;
			});
		},
		getFormattedSummaryText: function (aFilterCriterias) {
			return "Filtered by: " + aFilterCriterias.join(", ");
		},
		getSelect: function (sId) {
			return this.getView().byId(sId);
		},
		getSelectedItemText: function (oSelect) {
			return oSelect.getSelectedItem() ? oSelect.getSelectedItem().getKey() : "";
		},
		getPage: function () {
			return this.getView().byId("dynamicPageId");
		},
		getPageTitle: function () {
			return this.getPage().getTitle();
		},
		getSnappedLabel: function () {
			return new sap.m.Label({text: "{/Filter/text}"});
		},
		// Function returning random message each time it is called
		getRandomMessage: function () {
			// Creating several options for messages, to make sure that different messages are added
			var messageOptions = [{
				message: "Error message",
				description: "Error message description",
				type: sap.ui.core.MessageType.Error,
				processor: this._oMessageProcessor
			}, {
				message: "Information message",
				description: "Information message description",
				type: sap.ui.core.MessageType.Information,
				processor: this._oMessageProcessor
			}, {
				message: "Success message",
				description: "Success message description",
				type: sap.ui.core.MessageType.Success,
				processor: this._oMessageProcessor
			}, {
				message: "Warning message",
				description: "Warning message description",
				type: sap.ui.core.MessageType.Warning,
				processor: this._oMessageProcessor
			}];
			return messageOptions[Math.floor(Math.random() * 4)]
		},
		initializePopover: function (oControl) {
			this._messagePopover = new MessagePopover({
				models: {message: this._oMessageManager.getMessageModel()},
				items: {
					path: "message>/",
					template: new MessagePopoverItem({
						type: "{message>type}",
						title: "{message>message}",
						description: "{message>description}"
					})
				}
			});
		},
		onMessageButtonPress: function (oEvent) {
			var oMessagesButton = oEvent.getSource();
			// Either open the created popover if it isn't opened, or close it
			this._messagePopover.toggle(oMessagesButton);
		},
		onAddMessage: function (oEvent) {
			// Show footer if this is the first message
			if (!this.oModel.getProperty("/messagesLength")) {
				this.getPage().setShowFooter(true);
			}
			// Add a random message
			this._oMessageManager.addMessages(
				new sap.ui.core.message.Message(this.getRandomMessage())
			);
			// Update messages' length
			this.oModel.setProperty("/messagesLength", this._oMessageManager.getMessageModel().getData().length);
		},
		onDeleteMessages: function () {
			// Removing current messages
			this._oMessageManager.removeAllMessages();
			// Update messages' length
			this.oModel.setProperty("/messagesLength", this._oMessageManager.getMessageModel().getData().length);
			// Close both the popover and the footer, since there are no messages left
			if (this._messagePopover) {
				this._messagePopover.close();
			}
			this.getPage().setShowFooter(false);
		}
	});
});