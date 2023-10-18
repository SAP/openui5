sap.ui.define(["sap/ui/core/mvc/Controller"], function(Controller) {
	"use strict";

	return Controller.extend("testdata.xml-require.view.XMLTemplateProcessorAsync_require_expression", {
		format: function(sText) {
			// call another method in this controller to ensure that the "this"
			// scope is set correctly
			return this._format(sText);
		},
		_format: function(sText) {
			return sText.toUpperCase();
		},
		onButtonPress: function() {}
	});
});
