sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel'
], function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.m.sample.MessageStripWithEnableFormattedText.C", {
		onInit: function () {
			this.getView().setModel(new JSONModel({
				"default": "Default <em>(Information)</em> with default icon and <strong>close button</strong>:",
				"error": '<strong>Error</strong> with link to ' +
				'<a target="_blank" href="http://www.sap.com">SAP Homepage</a> <em>(For more info)</em>',
				"warning": "<strong>Warning</strong> with default icon and close button:",
				"success": "<strong>Success</strong> with default icon and close button:"
			}));
		}
	});

});