sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], (
	Messaging,
	Controller,
	JSONModel
) => {
	"use strict";

	return Controller.extend("mdc.sample.controller.MultiValueField", {

		onInit: function() {
			const oViewModel = new JSONModel({
				editMode: true
			});
			this.getView().setModel(oViewModel, "view");

			Messaging.registerObject(this.getView(), true);
		}

	});
});
