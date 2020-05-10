/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/core/format/DateFormat"
], function (
	BasePropertyEditor,
	DateFormat
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>DateEditor</code>.
	 * This allows to set date values or binding strings for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.DatePicker}.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.BasePropertyEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.dateEditor.DateEditor
	 * @author SAP SE
	 * @since 1.76
	 * @version ${version}
	 *
	 * @private
	 * @experimental 1.76
	 * @ui5-restricted
	 */
	var DateEditor = BasePropertyEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.dateEditor.DateEditor", {
		xmlFragment: "sap.ui.integration.designtime.baseEditor.propertyEditor.dateEditor.DateEditor",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	DateEditor.prototype.getDefaultValidators = function () {
		var oConfig = this.getConfig();
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this),
			{
				isValidBinding: {
					type: "isValidBinding",
					isEnabled: oConfig.allowBindings
				},
				notABinding: {
					type: "notABinding",
					isEnabled: !oConfig.allowBindings
				},
				isDate: {
					type: "isDate"
				}
			}
		);
	};

	DateEditor.prototype.formatValue = function (sValue) {
		var oDate = new Date(sValue);
		if (!this._isValidDate(oDate)) {
			return sValue;
		}
		return this.getFormatterInstance().format(oDate);
	};

	DateEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowBindings: {
			defaultValue: true
		}
	});

	DateEditor.prototype.onFragmentReady = function () {
		var oDatePicker = this.getContent();
		// Override to allow binding string input
		oDatePicker.onkeypress = function(oEvent){
			if (!oEvent.charCode || oEvent.metaKey || oEvent.ctrlKey) {
				return;
			}
		};
	};

	DateEditor.prototype._onChange = function (oEvent) {
		var sValue = oEvent.getParameter("newValue");
		var sParsedValue = this._parse(sValue);
		this.setValue(sParsedValue);
	};

	DateEditor.prototype._parse = function (sValue) {
		if (sValue === "") {
			return undefined;
		}
		var sParsedDate = new Date(sValue);
		return this._isValidDate(sParsedDate) ? sParsedDate.toISOString() : sValue;
	};

	DateEditor.prototype._isValidDate = function (sDate) {
		return sDate && !isNaN(sDate.getTime());
	};

	DateEditor.prototype.getFormatterInstance = function () {
		return DateFormat.getDateInstance();
	};

	return DateEditor;
});
