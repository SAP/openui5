/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor",
	"sap/ui/core/format/DateFormat"
], function (
	BasePropertyEditor,
	DateEditor,
	DateFormat
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>DateTimeEditor</code>.
	 * This allows to set datetime values for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.DateTimePicker}.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.dateEditor.DateEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.dateTimeEditor.DateTimeEditor
	 * @author SAP SE
	 * @since 1.76
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.76
	 * @ui5-restricted
	 */
	var DateTimeEditor = DateEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.dateTimeEditor.DateTimeEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.dateTimeEditor.DateTimeEditor",
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	DateTimeEditor.prototype.getFormatterInstance = function (sDate) {
		return DateFormat.getDateTimeInstance();
	};

	return DateTimeEditor;
});
