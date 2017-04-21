sap.ui.define([
		'jquery.sap.global',
		'sap/m/MessageBox',
		'sap/m/MessageToast',
		'sap/ui/core/mvc/Controller',
		'sap/ui/model/SimpleType',
		'sap/ui/model/ValidateException',
		'sap/ui/model/json/JSONModel'
	], function(jQuery, MessageBox, MessageToast, Controller, SimpleType, ValidateException, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.InputChecked.C", {

		/**
		 * Lifecycle hook that is called when the controller is instantiated
		 */
		onInit : function () {
			var oView = this.getView();

			oView.setModel(new JSONModel({
				name : "",
				email : ""
			}));

			// attach handlers for validation errors
			sap.ui.getCore().getMessageManager().registerObject(oView.byId("nameInput"), true);
			sap.ui.getCore().getMessageManager().registerObject(oView.byId("emailInput"), true);
		},

		/**
		 * Event handler for the continue button
		 */
		onContinue : function () {
			// collect input controls
			var oView = this.getView();
			var aInputs = [
				oView.byId("nameInput"),
				oView.byId("emailInput")
			];
			var bValidationError = false;

			// check that inputs are not empty
			// this does not happen during data binding as this is only triggered by changes
			jQuery.each(aInputs, function (i, oInput) {
				var oBinding = oInput.getBinding("value");
				try {
					oBinding.getType().validateValue(oInput.getValue());
				} catch (oException) {
					oInput.setValueState("Error");
					bValidationError = true;
				}
			});

			// output result
			if (!bValidationError) {
				MessageToast.show("The input is validated. You could now continue to the next screen");
			} else {
				MessageBox.alert("A validation error has occured. Complete your input first");
			}
		},

		/**
		 * Custom model type for validating an E-Mail address
		 * @class
		 * @extends sap.ui.model.SimpleType
		 */
		customEMailType : SimpleType.extend("email", {
			formatValue: function (oValue) {
				return oValue;
			},
			parseValue: function (oValue) {
				//parsing step takes place before validating step, value could be altered here
				return oValue;
			},
			validateValue: function (oValue) {
				// The following Regex is NOT a completely correct one and only used for demonstration purposes.
				// RFC 5322 cannot even checked by a Regex and the Regex for RFC 822 is very long and complex.
				var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (!oValue.match(rexMail)) {
					throw new ValidateException("'" + oValue + "' is not a valid email address");
				}
			}
		})
	});

});
