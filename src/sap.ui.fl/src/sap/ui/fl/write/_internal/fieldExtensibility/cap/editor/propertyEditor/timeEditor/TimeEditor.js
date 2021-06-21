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
	 * Constructor for a new <code>TimeEditor</code>.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.dateEditor.DateEditor
	 * @alias sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.timeEditor.TimeEditor
	 * @author SAP SE
	 * @since 1.93
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.93
	 * @ui5-restricted sap.ui.fl
	 */
	var TimeEditor = DateEditor.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.timeEditor.TimeEditor", {
		xmlFragment: "sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.timeEditor.TimeEditor",
		metadata: {
			library: "sap.ui.fl"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	TimeEditor.prototype.getDefaultValidators = function () {
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this)
		);
	};

	TimeEditor.prototype.formatValue = function (sValue) {
		return sValue;
	};

	TimeEditor.prototype._parse = function (sValue) {
		if (sValue === "") {
			return undefined;
		}

		// For now use a hardcoded format, move to default config later
		var oTimeFormatterInstance = DateFormat.getTimeInstance({
			pattern: "HH:mm:ss"
		});
		var oParsedDate = oTimeFormatterInstance.parse(sValue);
		return this._isValidDate(oParsedDate)
			? oTimeFormatterInstance.format(oParsedDate)
			: sValue;
	};

	TimeEditor.prototype.getFormatterInstance = function () {
		return DateFormat.getTimeInstance();
	};

	return TimeEditor;
});
