sap.ui.define([
	'sap/ui/core/mvc/Controller',
	"sap/ui/mdc/condition/ConditionModel",
	"sap/ui/mdc/condition/Condition",
	"sap/ui/core/Core"
], function(Controller, ConditionModel, Condition, oCore) {
	"use strict";

	return Controller.extend("sap.ui.mdc.sample.ValueHelp.Controller", {

		onInit: function() {
			this.getView().bindElement("/Books(1)");

			oCore.getMessageManager().registerObject(this.getView(), true);

			// create a ConditionModel for the listbinding
			var oCM = new ConditionModel();
			// var oConditionChangeBinding = oCM.bindProperty("/conditions", oCM.getContext("/"));
			// oConditionChangeBinding.attachChange(this.handleConditionModelChange.bind(this));

			// oCM.addCondition("title", Condition.createCondition("EQ", ["4711"], undefined, undefined, ConditionValidated.Validated));
			// oCM.addCondition("title", Condition.createCondition("EQ", ["4711"]));

			//set the model on Form just to have it somehow local
			var oForm = this.byId("Form1");
			oForm.setModel(oCM, "cm");
		}

	});
});
