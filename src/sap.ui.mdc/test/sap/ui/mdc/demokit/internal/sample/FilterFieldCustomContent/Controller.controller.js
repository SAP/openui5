sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/mdc/enums/FieldEditMode",
	'sap/ui/mdc/enums/ConditionValidated',
	"sap/m/MessageToast"
], function(
	Controller,
	oCore,
	ConditionModel,
	Condition,
	FieldEditMode,
	ConditionValidated,
	MessageToast
	) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.FilterFieldCustomContent.Controller", {

		onInit: function() {
			const oView = this.getView();
			oCore.getMessageManager().registerObject(oView, true);

			const oCM = new ConditionModel();
			oCM.addCondition("title", Condition.createCondition("EQ", ["4711"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("metricsWords", Condition.createCondition("EQ", [4711], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("descr", Condition.createCondition("GT", ["A"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("descr", Condition.createCondition("BT", ["B", "C"], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("number", Condition.createCondition("EQ", [1], undefined, undefined, ConditionValidated.NotValidated));
			oCM.addCondition("number", Condition.createCondition("EQ", [3], undefined, undefined, ConditionValidated.NotValidated));

			//set the model on Form just to have it somehow local
			const oForm = this.byId("Form1");
			oForm.setModel(oCM, "cm");
		},

		handleChange: function(oEvent) {
			const oFilterField = oEvent.getSource();
			const oPromise = oEvent.getParameter("promise");

			if (oPromise) {
				oPromise.then(function(aConditions) {
					let sText = "[";
					for (let i = 0; i < aConditions.length; i++) {
						sText = sText + JSON.stringify(aConditions[i]) + " ;";
					}
					sText = sText + "]";
					MessageToast.show("Change " + oFilterField.getId() + "; conditions: " + sText);
				}).catch(function(oError) {
					MessageToast.show(oError.message);
				});
			}
		}

	});
});
