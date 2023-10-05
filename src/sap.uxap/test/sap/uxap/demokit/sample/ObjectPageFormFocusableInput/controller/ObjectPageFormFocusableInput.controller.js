sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Core",
	"sap/ui/dom/getFirstEditableInput",
	"sap/ui/core/Element"
], function(JSONModel, Controller, Core, getFirstEditableInput, Element) {
	"use strict";

	return Controller.extend("sap.uxap.sample.ObjectPageFormFocusableInput.controller.ObjectPageFormFocusableInput", {
		handleFocusBtnPress: function () {
			var oObjectPageLayout = this.byId("ObjectPageLayout"),
				oSection = Element.registry.get(oObjectPageLayout.getSelectedSection()),
				oFirstEditableInput = getFirstEditableInput(oSection.getDomRef());

			if (oFirstEditableInput) {
				oFirstEditableInput.focus();
			}
		}
	});
});
