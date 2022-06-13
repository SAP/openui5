sap.ui.define([
	"test/designmode/Button",
	"test/designmode/TextField"
], function(Button, TextField) {
	"use strict";

	var oButton = new Button();
	var oButtonMetadata = oButton.getMetadata();
	oButtonMetadata.loadDesignTime().then(function(oDesignTime) {
	});

	var oTextField = new TextField();
	var oTextFieldMetadata = oTextField.getMetadata();
	oTextFieldMetadata.loadDesignTime().then(function(oDesignTime) {
	});
});
