sap.ui.define([
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/MessageToast',
	"sap/ui/core/Messaging",
	'sap/ui/core/message/Message',
	'sap/ui/core/message/MessageType',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
	'sap/ui/core/Element'
], function (MessagePopover, MessageItem, MessageToast, Messaging, Message, MessageType, Controller, JSONModel, Element) {
	"use strict";

	return Controller.extend("sap.m.sample.DialogWithMessagePopover.C", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/ui/demo/mock/forms.json"));

			this.oView = this.getView();
			this._oMessageManager = Messaging;

			// Clear the old messages
			this._oMessageManager.removeAllMessages();
			this.oView.setModel(oModel);
			this.oView.setModel(this._oMessageManager.getMessageModel(), "message");
		},

		onOpenPopoverDialog: function () {
			// create dialog lazily
			if (!this.oMPDialog) {
				this.oMPDialog = this.loadFragment({
					name: "sap.m.sample.DialogWithMessagePopover.MPDialog"
				});
			}
			this.oMPDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
				this._oMessageManager.registerObject(this.oView.byId("formContainer"), true);

				MessageToast.show('Press "Save" to trigger validation.');
				this.createMessagePopover();
			}.bind(this));
		},

		handleMessagePopoverPress: function (oEvent) {
			if (!this.oMP) {
				this.createMessagePopover();
			}
			this.oMP.toggle(oEvent.getSource());
		},

		createMessagePopover: function () {
			var that = this;

			this.oMP = new MessagePopover({
				activeTitlePress: function (oEvent) {
					var oItem = oEvent.getParameter("item"),
						oPage = that.getView().byId("messageHandlingPage"),
						oMessage = oItem.getBindingContext("message").getObject(),
						oControl = Element.registry.get(oMessage.getControlId());

					if (oControl) {
						oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
						setTimeout(function () {
							oControl.focus();
						}, 300);
					}
				},
				items: {
					path: "message>/",
					template: new MessageItem({
						title: "{message>message}",
						subtitle: "{message>additionalText}",
						groupName: {
							parts: [{
								path: 'message>controlIds'
							}],
							formatter: this.getGroupName
						},
						activeTitle: {
							parts: [{
								path: 'message>controlIds'
							}],
							formatter: this.isReachable
						},
						type: "{message>type}",
						description: "{message>message}"
					})
				},
				groupItems: true
			});

			this.getView().byId("messagePopoverBtn").addDependent(this.oMP);
		},

		getGroupName: function (sControlId) {
			// the group name is generated based on the current layout
			// and is specific for each use case
			var oControl = Element.registry.get(sControlId[0]);

			if (oControl) {
				var sFormSubtitle = oControl.getParent().getParent().getTitle().getText(),
					sFormTitle = oControl.getParent().getParent().getParent().getTitle();

				return sFormTitle + ", " + sFormSubtitle;
			}
		},

		isReachable: function (sControlId) {
			// Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
			return sControlId ? true : true;
		},

		onChange: function (oEvent) {
			var oInput = oEvent.getSource();

			if (oInput.getRequired()) {
				this.handleRequiredField(oInput);
			}

			if (oInput.getLabels()[0].getText() === "Standard Weekly Hours") {
				this.checkInputConstraints(oInput);
			}
		},

		handleRequiredField: function (oInput) {
			var sTarget = oInput.getBindingContext().getPath() + "/" + oInput.getBindingPath("value");

			this.removeMessageFromTarget(sTarget);

			if (!oInput.getValue()) {
				this._oMessageManager.addMessages(
					new Message({
						message: "A mandatory field is required",
						type: MessageType.Error,
						additionalText: oInput.getLabels()[0].getText(),
						target: sTarget,
						processor: this.getView().getModel()
					})
				);
			}
		},

		checkInputConstraints: function (oInput) {
			var oBinding = oInput.getBinding("value"),
				sValueState = "None",
				sTarget = oInput.getBindingContext().getPath() + "/" + oInput.getBindingPath("value");

			this.removeMessageFromTarget(sTarget);

			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Warning";
				this._oMessageManager.addMessages(
					new Message({
						message: "The value should not exceed 40",
						type: MessageType.Warning,
						additionalText: oInput.getLabels()[0].getText(),
						description: "The value of the working hours field should not exceed 40 hours.",
						target: sTarget,
						processor: this.getView().getModel()
					})
				);
			}

			oInput.setValueState(sValueState);
		},

		removeMessageFromTarget: function (sTarget) {
			this._oMessageManager.getMessageModel().getData().forEach(function (oMessage) {
				if (oMessage.target === sTarget) {
					this._oMessageManager.removeMessages(oMessage);
				}
			}.bind(this));
		},

		// Display the button type according to the message with the highest severity
		// The priority of the message types are as follows: Error > Warning > Success > Info
		buttonTypeFormatter: function () {
			var sHighestSeverity;
			var aMessages = this._oMessageManager.getMessageModel().oData;
			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sHighestSeverity = "Negative";
						break;
					case "Warning":
						sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
						break;
					case "Success":
						sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ? "Success" : sHighestSeverity;
						break;
					default:
						sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
						break;
				}
			});

			return sHighestSeverity;
		},

		// Display the number of messages with the highest severity
		highestSeverityMessages: function () {
			var sHighestSeverityIconType = this.buttonTypeFormatter();
			var sHighestSeverityMessageType;

			switch (sHighestSeverityIconType) {
				case "Negative":
					sHighestSeverityMessageType = "Error";
					break;
				case "Critical":
					sHighestSeverityMessageType = "Warning";
					break;
				case "Success":
					sHighestSeverityMessageType = "Success";
					break;
				default:
					sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
					break;
			}

			return this._oMessageManager.getMessageModel().oData.reduce(function (iNumberOfMessages, oMessageItem) {
				return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
			}, 0) || "";
		},

		// Set the button icon according to the message with the highest severity
		buttonIconFormatter: function () {
			var sIcon;
			var aMessages = this._oMessageManager.getMessageModel().oData;

			aMessages.forEach(function (sMessage) {
				switch (sMessage.type) {
					case "Error":
						sIcon = "sap-icon://error";
						break;
					case "Warning":
						sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
						break;
					case "Success":
						sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
						break;
					default:
						sIcon = !sIcon ? "sap-icon://information" : sIcon;
						break;
				}
			});

			return sIcon;
		},

		_generateInvalidUserInput: function () {
			var oButton = this.getView().byId("messagePopoverBtn"),
				oRequiredNameInput = this.oView.byId("formContainer").getItems()[4].getContent()[2],
				oNumericZipInput = this.oView.byId("formContainer").getItems()[5].getContent()[7],
				oEmailInput = this.oView.byId("formContainer").getItems()[6].getContent()[13],
				iWeeklyHours = this.oView.byId("formContainerEmployment").getItems()[0].getContent()[13];

			oButton.setVisible(true);
			oRequiredNameInput.setValue("");
			oNumericZipInput.setValue("AAA");
			oEmailInput.setValue("MariaFontes.com");
			iWeeklyHours.setValue(400);

			this.handleRequiredField(oRequiredNameInput);
			this.checkInputConstraints(iWeeklyHours);

			this.oMP.getBinding("items").attachChange(function (oEvent) {
				this.oMP.navigateBack();
				oButton.setType(this.buttonTypeFormatter());
				oButton.setIcon(this.buttonIconFormatter());
				oButton.setText(this.highestSeverityMessages());
			}.bind(this));

			setTimeout(function () {
				this.oMP.openBy(oButton);
			}.bind(this), 100);
		},

		_closeDialog: function () {
			this.oDialog.close();
		}
	});
});