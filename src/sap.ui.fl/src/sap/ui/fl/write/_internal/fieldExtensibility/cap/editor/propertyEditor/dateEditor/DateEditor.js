/*!
 * ${copyright}
 */

// Customization of the default date editor to support custom output formats
// To be implemented in base class

sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor",
	"sap/ui/core/format/DateFormat"
], function (
	BaseDateEditor,
	DateFormat
) {
	"use strict";

	var DateEditor = BaseDateEditor.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.dateEditor.DateEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.dateEditor.DateEditor",
		metadata: {
			library: "sap.ui.fl"
		},
		renderer: BaseDateEditor.getMetadata().getRenderer().render
	});

	DateEditor.prototype._parse = function (sValue) {
		if (sValue === "") {
			return undefined;
		}
		var sParsedDate = new Date(sValue);

		// TODO: For now use a hardcoded format, move to default config later
		var oDateFormatterInstance = DateFormat.getDateInstance({
			pattern: "yyyy-MM-dd"
		});
		return this._isValidDate(sParsedDate)
			? oDateFormatterInstance.format(sParsedDate)
			: sValue;
	};

	return DateEditor;
});
