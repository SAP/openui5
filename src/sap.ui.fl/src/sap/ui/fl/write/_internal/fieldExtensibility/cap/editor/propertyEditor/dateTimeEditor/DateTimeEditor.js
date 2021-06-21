/*!
 * ${copyright}
 */

// Customization of the default datetime editor to support custom output formats
// To be implemented in base class

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/dateTimeEditor/DateTimeEditor"
], function (
	BaseDateTimeEditor
) {
	"use strict";

	var DateTimeEditor = BaseDateTimeEditor.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.dateTimeEditor.DateTimeEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.dateTimeEditor.DateTimeEditor",
		metadata: {
			library: "sap.ui.fl"
		},
		renderer: BaseDateTimeEditor.getMetadata().getRenderer().render
	});

	DateTimeEditor.prototype._parse = function (sValue) {
		if (sValue === "") {
			return undefined;
		}
		var sParsedDate = new Date(sValue);

		// TODO: For now use a hardcoded format, move to default config later
		return this._isValidDate(sParsedDate)
			? sParsedDate.toISOString().split(".")[0] + "Z" // Cut ms
			: sValue;
	};

	return DateTimeEditor;
});
