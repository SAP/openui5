sap.ui.define([
	"./localService/mockserver",
	"sap/ui/core/Element",
	"sap/ui/core/message/ControlMessageProcessor",
	"sap/ui/core/Messaging",
	"sap/ui/core/message/Message",
	"sap/ui/core/message/MessageType",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/date/UI5Date",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/enums/ConditionValidated",
	"sap/ui/mdc/enums/OperatorName"
], function(
	mockserver,
	Element,
	ControlMessageProcessor,
	Messaging,
	Message,
	MessageType,
	Controller,
	UI5Date,
	ODataModel,
	JSONModel,
	Condition,
	ConditionModel,
	ConditionValidated,
	OperatorName
) {
	"use strict";

	let oControlMessageProcessor;

	return Controller.extend("sap.ui.mdc.sample.field.MessageHandling.Controller", {

		onInit() {
			const oView = this.getView();

			// set message model
			oView.setModel(Messaging.getMessageModel(), "message");

			// activate automatic message generation for complete view
			Messaging.registerObject(this.getView(), true);

			const sODataServiceUrl = "/here/goes/your/odata/service/url/";

			// init our mock server
			mockserver.init(sODataServiceUrl);

			// data service
			oView.setModel(
				new ODataModel(sODataServiceUrl, {
					defaultBindingMode : "TwoWay"
				})
			);

			oView.bindElement("/Employees(1)");

			var oViewModel = new JSONModel({
				ODataUnitCodeList: {
					"D" : {Text : "Days", UnitSpecificScale : 2},
					"H" : {Text : "Hours", UnitSpecificScale : 2}
				}
			});
			oView.setModel(oViewModel, "view");

			var oCM = new ConditionModel();
			oCM.addCondition("FirstName", Condition.createCondition(OperatorName.EQ, ["Nancy"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("LastName", Condition.createCondition(OperatorName.EQ, ["Davolio"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Address", Condition.createCondition(OperatorName.EQ, ["507 - 20th Ave. E. Apt. 2A"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("City", Condition.createCondition(OperatorName.EQ, ["Seattle"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Region", Condition.createCondition(OperatorName.EQ, ["WA"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("PostalCode", Condition.createCondition(OperatorName.EQ, ["98122"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Country", Condition.createCondition(OperatorName.EQ, ["USA"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("HomePhone", Condition.createCondition(OperatorName.EQ, ["(206) 555-9857"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("DateOfHire", Condition.createCondition(OperatorName.EQ, [UI5Date.getInstance(1397520000000)], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Vacation", Condition.createCondition(OperatorName.EQ, [30], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("VacationUnit", Condition.createCondition(OperatorName.EQ, ["D"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Tags", Condition.createCondition(OperatorName.EQ, [1, "Tag 1"], undefined, undefined, ConditionValidated.Validated));
			oCM.addCondition("Tags", Condition.createCondition(OperatorName.EQ, [2, "Tag 2"], undefined, undefined, ConditionValidated.Validated));
			oView.setModel(oCM, "cm");

			oControlMessageProcessor = new ControlMessageProcessor();
		},

		async onMessagePopoverPress(oEvent) {
			const oSourceControl = oEvent.getSource();
			const oMessagePopover = await this._getMessagePopover();
			oMessagePopover.openBy(oSourceControl);
		},

		onDelete() {
			const sPath = this.getView().getBindingContext().getPath();
			this.getView().getModel().remove(sPath);
		},

		onClearPress() {
			Messaging.removeAllMessages();
		},

		addWarning(oEvent) {
			const oButton = oEvent.getSource();
			let sId = oButton.getId();

			sId = sId.slice(0, sId.indexOf("-AddWarning"));
			const oField = Element.getElementById(sId);
			let sTarget;

			if (oField.isA("sap.ui.mdc.Field")) {
				sTarget = sId + "/value";
			} else if (oField.isA("sap.ui.mdc.MultiValueField")) {
				sTarget = sId + "/items";
			} else if (oField.isA("sap.ui.mdc.FilterField")) {
				sTarget = sId + "/conditions";
			}

			const oMessage = new Message({
				message: "My warning message",
				type: MessageType.Warning,
				target: sTarget,
				fullTarget: sTarget,
				processor: oControlMessageProcessor
			});
			Messaging.addMessages(oMessage);
		},

		addError(oEvent) {
			const oButton = oEvent.getSource();
			let sId = oButton.getId();

			sId = sId.slice(0, sId.indexOf("-AddError"));
			const oField = Element.getElementById(sId);
			let oModel;
			let oBinding;

			if (oField.isA("sap.ui.mdc.Field")) {
				oBinding = oField.getBinding("value");
				if (oBinding.isA("sap.ui.model.CompositeBinding")) {
					oBinding = oBinding.getBindings()[0];
				}
				oModel = this.getView().getModel();
			} else if (oField.isA("sap.ui.mdc.MultiValueField")) {
				oBinding = oField.getBinding("items");
				oModel = this.getView().getModel();
			} else if (oField.isA("sap.ui.mdc.FilterField")) {
				oBinding = oField.getBinding("conditions");
				oModel = this.getView().getModel("cm");
			}

			const sPath = oBinding?.getResolvedPath();
			const oMessage = new Message({
				message: "My error message",
				type: MessageType.Error,
				target: sPath,
				fullTarget: sPath,
				processor: oModel
			});
			Messaging.addMessages(oMessage);
		},

		handleMessagePress(oEvent) {
			const oItem = oEvent.getParameter("item");
			const oMessage = oItem.getBinding("title")?.getContext()?.getObject(); // title is bound to message
			const aControlIds = oMessage?.getControlIds();
			if (aControlIds?.[0]) {
				const oControl = Element.getElementById(aControlIds[0]);
				oControl.focus();
			}
		},

		//################ Private APIs ###################

		_getMessagePopover() {
			return this.loadFragment({
				name: "sap.ui.mdc.sample.field.MessageHandling.MessagePopover"
			});
		}

	});

});
