sap.ui.controller("sap.m.sample.InputChecked.C", {

	onInit : function () {
		this.getView().setModel(new sap.ui.model.json.JSONModel({
			name : "",
			email : ""
		}));

		// attach handlers for validation errors
		sap.ui.getCore().attachValidationError(function (evt) {
			var control = evt.getParameter("element");
			if (control && control.setValueState) {
				control.setValueState("Error");
			}
		});
		sap.ui.getCore().attachValidationSuccess(function (evt) {
			var control = evt.getParameter("element");
			if (control && control.setValueState) {
				control.setValueState("None");
			}
		});
	},

	handleContinue : function (evt) {

		// collect input controls
		var view = this.getView();
		var inputs = [
			view.byId("nameInput"),
			view.byId("emailInput")
		];

		// check that inputs are not empty
		// this does not happen during data binding as this is only triggered by changes
		jQuery.each(inputs, function (i, input) {
			if (!input.getValue()) {
				input.setValueState("Error");
			}
		});

		// check states of inputs
		var canContinue = true;
		jQuery.each(inputs, function (i, input) {
			if ("Error" === input.getValueState()) {
				canContinue = false;
				return false;
			}
		});

		// output result
		if (canContinue) {
			sap.m.MessageToast.show("The input is correct. You could now continue to the next screen.");
		} else {
			jQuery.sap.require("sap.m.MessageBox");
			sap.m.MessageBox.alert("Complete your input first.");
		}
	},
	
	/**
	 * This is a custom model type for validating email
	 */
	typeEMail : sap.ui.model.SimpleType.extend("email", {
		formatValue: function (oValue) {
			return oValue;
		},
		parseValue: function (oValue) {
			//parsing step takes place before validating step, value can be altered
			return oValue;
		},
		validateValue: function (oValue) {
			// The following Regex is NOT a completely correct one and only used for demonstration purposes.
			// RFC 5322 cannot even checked by a Regex and the Regex for RFC 822 is very long and complex.
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (!oValue.match(mailregex)) {
				throw new sap.ui.model.ValidateException("'" + oValue + "' is not a valid email address");
			}
		}
	})
});