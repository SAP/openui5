sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	var oEditor;
	var example1 = "function loadDoc() {\n\treturn 'bar';\n}";
	var example2 = "function myFunction(p1, p2) {\n\treturn 'foo';\n}";

	return Controller.extend("sap.ui.codeeditor.sample.CodeEditorIconTabHeader.CodeEditor", {

		onInit: function () {
			oEditor = this.byId("aCodeEditor");
			oEditor.setValue("// select tabs to see value of CodeEditor changing");
		},

		onSelectTab: function (oEvent) {
			var sFilterId = oEvent.getParameter("selectedKey");
			switch (sFilterId) {
				case "A":
					oEditor.setValue(example2);
					break;
				case "B":
					oEditor.setValue(example1);
					break;
				default:
					oEditor.setValue();
					break;
			}
		}

	});
});