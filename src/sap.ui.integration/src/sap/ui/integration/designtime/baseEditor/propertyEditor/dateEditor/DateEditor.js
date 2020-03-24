/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/util/isValidBindingString",
	"sap/ui/core/format/DateFormat"
], function (
	BasePropertyEditor,
	isValidBindingString,
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
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	DateEditor.prototype.formatValue = function (sValue) {
		if (!sValue || isValidBindingString(sValue, false)) {
			return sValue;
		}
		return this._formatDate(sValue);
	};

	DateEditor.prototype.asyncInit = function () {
		var oDatePicker = this.getContent();
		// Override to allow binding string input
		oDatePicker.onkeypress = function(oEvent){
			if (!oEvent.charCode || oEvent.metaKey || oEvent.ctrlKey) {
				return;
			}
		};
		return Promise.resolve();
	};

	DateEditor.prototype._onChange = function (oEvent) {
		var sValue = oEvent.getParameter("newValue");
		var sParsedValue = this._parse(sValue);
		if (this._validate(sValue, sParsedValue)) {
			this._setInputState(true);
			this.setValue(sParsedValue);
		} else {
			this._setInputState(false, this.getI18nProperty("BASE_EDITOR.DATE.INVALID_BINDING_OR_DATE"));
		}
	};

	DateEditor.prototype._parse = function (sValue) {
		if (isValidBindingString(sValue, false)) {
			return sValue;
		}
		var sParsedDate = new Date(sValue);
		return this._isValidDate(sParsedDate) ? sParsedDate.toISOString() : undefined;
	};

	DateEditor.prototype._isValidDate = function (sDate) {
		return sDate && !isNaN(sDate.getTime());
	};

	DateEditor.prototype.getFormatterInstance = function () {
		return DateFormat.getDateInstance();
	};

	DateEditor.prototype._formatDate = function (sDate) {
		var oDate = new Date(sDate);
		if (!this._isValidDate(oDate)) {
			this._setInputState(false, this.getI18nProperty("BASE_EDITOR.DATE.INVALID_BINDING_OR_DATE"));
			return sDate;
		}
		this._setInputState(true);
		return this.getFormatterInstance().format(oDate);
	};

	DateEditor.prototype._validate = function (sValue, sParsedValue) {
		return typeof sValue === "undefined" || typeof sParsedValue !== "undefined";
	};

	DateEditor.prototype._setInputState = function (bIsValid, sErrorMessage) {
		var oInput = this.getContent();
		if (bIsValid) {
			oInput.setValueState("None");
		} else {
			oInput.setValueState("Error");
			oInput.setValueStateText(sErrorMessage || "Unknown Error");
		}
	};

	return DateEditor;
});
