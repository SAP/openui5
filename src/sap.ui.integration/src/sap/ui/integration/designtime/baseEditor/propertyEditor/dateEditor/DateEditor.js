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
					type: "isDate",
					config: {
						formatterInstance: function() {
							var sDatePattern = (this.getConfig() || {}).pattern;
							var oConfig = sDatePattern
								? {
									pattern: sDatePattern
								}
								: undefined;
							return this.getFormatterInstance(oConfig);
						}.bind(this)
					}
				}
			}
		);
	};

	DateEditor.prototype.formatValue = function (sValue) {
		var oDate = this._parse(sValue);
		return this._format(oDate, true) || sValue;
	};

	DateEditor.configMetadata = Object.assign({}, BasePropertyEditor.configMetadata, {
		allowBindings: {
			defaultValue: true
		},
		typeLabel: {
			defaultValue: "BASE_EDITOR.TYPES.DATE"
		},
		pattern: {
			defaultValue: "YYYY-MM-dd'T'HH:mm:ss.SSS'Z'"
		},
		utc: {
			defaultValue: false
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
		var oDate = this._parse(sValue, true);
		var sDateString = this._format(oDate) || sValue;
		this.setValue(sDateString);
	};

	DateEditor.prototype._parse = function (sValue, bUseDefaultPattern) {
		if (sValue == null || sValue === "") {
			return sValue;
		}
		var bUTC = (this.getConfig() || {}).utc !== false;
		if (bUseDefaultPattern) {
			return this.getFormatterInstance().parse(sValue, bUTC);
		}
		var sDatePattern = (this.getConfig() || {}).pattern;
		if (sDatePattern) {
			var oDateFormatterInstance = this.getFormatterInstance({
				pattern: sDatePattern
			});
			return oDateFormatterInstance.parse(sValue, bUTC);
		}
		return undefined;
	};

	DateEditor.prototype._format = function (oDate, bUseDefaultPattern) {
		if (!this._isValidDate(oDate)) {
			return undefined;
		}
		var bUTC = (this.getConfig() || {}).utc !== false;
		if (bUseDefaultPattern) {
			return this.getFormatterInstance().format(oDate, bUTC);
		}
		var sDatePattern = (this.getConfig() || {}).pattern;
		if (sDatePattern) {
			var oDateFormatterInstance = this.getFormatterInstance({
				pattern: sDatePattern
			});
			return oDateFormatterInstance.format(oDate, bUTC);
		}
		return undefined;
	};

	DateEditor.prototype._isValidDate = function (oDate) {
		return oDate && !isNaN(oDate.getTime());
	};

	DateEditor.prototype.getFormatterInstance = function (mOptions) {
		return DateFormat.getDateInstance(mOptions || {
			pattern: "YYYY-MM-dd"
		});
	};

	return DateEditor;
});
