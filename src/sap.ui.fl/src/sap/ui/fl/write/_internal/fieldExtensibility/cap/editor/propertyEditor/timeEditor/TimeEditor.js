/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/dateEditor/DateEditor",
	"sap/ui/core/format/DateFormat"
], function(
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
	 * @ui5-restricted sap.ui.fl
	 */
	const TimeEditor = DateEditor.extend("sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.timeEditor.TimeEditor", {
		xmlFragment: "sap.ui.fl.write._internal.fieldExtensibility.cap.editor.propertyEditor.timeEditor.TimeEditor",
		metadata: {
			library: "sap.ui.fl"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	TimeEditor.configMetadata = {
		...DateEditor.configMetadata,
		pattern: {
			defaultValue: "HH:mm:ss"
		},
		// By default, ignore timezones due to winter/summer time etc. as 1st Jan 1970 is set as date
		utc: {
			defaultValue: false
		}
	};

	TimeEditor.prototype.getDefaultValidators = function() {
		return { ...DateEditor.prototype.getDefaultValidators.call(this) };
	};

	TimeEditor.prototype.getFormatterInstance = function(mOptions) {
		return DateFormat.getTimeInstance(mOptions || {
			pattern: "HH:mm:ss.SSSS"
		});
	};

	return TimeEditor;
});
