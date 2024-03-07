sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller"
], (
	Messaging,
	Controller
) => {
	"use strict";

	return Controller.extend("sap.ui.mdc.demokit.sample.FieldValueHelpTypes.Controller", {

		onInit: function() {
			Messaging.registerObject(this.getView(), true);
		}

	});
});
