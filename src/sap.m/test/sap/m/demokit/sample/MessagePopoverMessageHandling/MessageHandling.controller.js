sap.ui.define([
	'sap/m/MessagePopover',
	'sap/m/MessageItem',
	'sap/m/Link',
	'sap/m/MessageToast',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(MessagePopover, MessageItem, Link, MessageToast, Controller, JSONModel) {
	"use strict";
	return Controller.extend("sap.m.sample.MessagePopoverMessageHandling.MessageHandling", {
		onInit: function () {
			var oModel = new JSONModel("./test-resources/sap/m/demokit/sample/MessagePopoverMessageHandling/FormsModel.json");

			this.oView = this.getView();
			this._MessageManager = sap.ui.getCore().getMessageManager();
			this.oView.setModel(oModel);

			this._MessageManager.registerObject(this.oView.byId("formContainer"), true);
			this.oView.setModel(this._MessageManager.getMessageModel(),"message");

			MessageToast.show('Press "Save" to trigger validation.');
		},

		handleMessagePopoverPress: function (oEvent) {
			if (!this.oMP) {
				this.createMessagePopover();
			}
			this.oMP.toggle(oEvent.getSource());
		},

		createMessagePopover: function () {
			var that = this;
			this.oMP = new sap.m.MessagePopover({
				activeTitlePress: function (oEvent) {
					var oItem = oEvent.getParameter("item"),
						oPage = that.oView.byId("messageHandlingPage"),
						oMessage = oItem.getBindingContext("message").getObject(),
						oControl = sap.ui.getCore().byId(oMessage.getControlId());

					if (oControl && oControl.getDomRef()) {
						oPage.scrollToElement(oControl.getDomRef(), 200, [0, -100]);
						setTimeout(function(){
							oControl.focus();
						}, 300);
					}
				},
				items: {
					path:"message>/",
					template: new sap.m.MessageItem(
						{
							title: "{message>message}",
							subtitle: "{message>additionalText}",
							groupName: {parts: [{path: 'message>controlId'}], formatter: this.getGroupName},
							activeTitle: {parts: [{path: 'message>controlId'}], formatter: this.isPositionable},
							type: "{message>type}",
							description: "{message>message}"
						})
				}
			});

			this.oMP._oMessageView.setGroupItems(true);
			this.getView().byId("messagePopoverBtn").addDependent(this.oMP);
		},

		getGroupName : function (sControlId) {
			// the group name is generated based on the current layout
			// and is specific for each use case
			var oControl = sap.ui.getCore().byId(sControlId);

			if (oControl) {
				var sFormSubtitle = oControl.getParent().getParent().getTitle().getText(),
					sFormTitle = oControl.getParent().getParent().getParent().getTitle();

				return sFormTitle + ", " + sFormSubtitle;
			}
		},

		isPositionable : function (sControlId) {
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
				this._MessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: "A mandatory field is required",
						type: sap.ui.core.MessageType.Error,
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
				this._MessageManager.addMessages(
					new sap.ui.core.message.Message({
						message: "The value should not exceed 40",
						type: sap.ui.core.MessageType.Warning,
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
			this._MessageManager.getMessageModel().getData().forEach(function(oMessage){
				if (oMessage.target === sTarget) {
					this._MessageManager.removeMessages(oMessage);
				}
			}.bind(this));
		},

		_generateInvalidUserInput: function () {
			var oRequiredNameInput = this.oView.byId("formContainer").getItems()[4].getContent()[2],
				oNumericZipInput = this.oView.byId("formContainer").getItems()[5].getContent()[7],
				oEmailInput = this.oView.byId("formContainer").getItems()[6].getContent()[13],
				iWeeklyHours = this.oView.byId("formContainerEmployment").getItems()[0].getContent()[13];

			oRequiredNameInput.setValue(undefined);
			oNumericZipInput.setValue("AAA");
			oEmailInput.setValue("MariaFontes.com");
			iWeeklyHours.setValue(400);

			this.handleRequiredField(oRequiredNameInput);
			this.checkInputConstraints(iWeeklyHours);
		}
	});

});