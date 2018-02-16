/*!
 * ${copyright}
 */

// Provides control sap.m.DateTimeInput.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'./library',
	'sap/ui/model/type/Date',
	'sap/ui/model/type/Time',
	'sap/ui/model/type/DateTime',
	'sap/ui/model/odata/type/ODataType',
	'sap/ui/core/library',
	'sap/ui/Device',
	'./DateTimeInputRenderer'
],
function(
	jQuery,
	Control,
	library,
	Date1,
	Time,
	DateTime,
	ODataType,
	coreLibrary,
	Device,
	DateTimeInputRenderer
	) {
	"use strict";

	// shortcut for sap.m.DateTimeInputType
	var DateTimeInputType = library.DateTimeInputType;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new DateTimeInput.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Allows end users to interact with date and/or time and select from a date and/or time pad.
	 *
	 * <b>Note:</b> This control should not be used any longer, instead please use the dedicated <code>sap.m.DatePicker</code>, <code>sap.m.TimePicker</code> or <code>sap.m.DateTimePicker</code> control.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @deprecated as of version 1.32.8, replaced by {@link sap.m.DatePicker}, {@link sap.m.TimePicker} or {@link sap.m.DateTimePicker}
	 * @alias sap.m.DateTimeInput
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var DateTimeInput = Control.extend("sap.m.DateTimeInput", /** @lends sap.m.DateTimeInput.prototype */ { metadata : {

		library : "sap.m",
		designtime: "sap/m/designtime/DateTimeInput.designtime",
		properties : {

			/**
			 * Defines the value of the control.
			 *
			 * The new value must be in the format set by <code>valueFormat</code>.
			 *
			 * The "Now" literal can also be assigned as a parameter to show the current date and/or time.
			 */
			value: { type: "string", group: "Data", defaultValue: null, bindable: "bindable" },

			/**
			 * Defines the width of the control.
			 */
			width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: "100%" },

			/**
			 * Indicates whether the user can interact with the control or not.
			 * <b>Note:</b> Disabled controls cannot be focused and they are out of the tab-chain.
			 */
			enabled: { type: "boolean", group: "Behavior", defaultValue: true },

			/**
			 * Defines whether the control can be modified by the user or not.
			 * <b>Note:</b> A user can tab to non-editable control, highlight it, and copy the text from it.
			 * @since 1.12.0
			 */
			editable: { type: "boolean", group: "Behavior", defaultValue: true },

			/**
			 * Visualizes the validation state of the control, e.g. <code>Error</code>, <code>Warning</code>, <code>Success</code>.
			 */
			valueState: { type: "sap.ui.core.ValueState", group: "Appearance", defaultValue: ValueState.None },

			/**
			 * Defines the text that appears in the value state message pop-up. If this is not specified, a default text is shown from the resource bundle.
			 * @since 1.26.0
			 */
			valueStateText: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Indicates whether the value state message should be shown or not.
			 * @since 1.26.0
			 */
			showValueStateMessage: { type: "boolean", group: "Misc", defaultValue: true },

			/**
			 * Defines the name of the control for the purposes of form submission.
			 */
			name: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Defines a short hint intended to aid the user with data entry when the control has no value.
			 */
			placeholder: { type: "string", group: "Misc", defaultValue: null },

			/**
			 * Defines the horizontal alignment of the text that is shown inside the input field.
			 * @since 1.26.0
			 */
			textAlign: { type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: TextAlign.Initial },

			/**
			 * Defines the text directionality of the input field, e.g. <code>RTL</code>, <code>LTR</code>
			 * @since 1.28.0
			 */
			textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

			/**
			 * Type of DateTimeInput (e.g. Date, Time, DateTime)
			 */
			type : {type : "sap.m.DateTimeInputType", group : "Data", defaultValue : DateTimeInputType.Date},

			/**
			 * Displays date value in this given format in text field. Default value is taken from locale settings.
			 * If you use data-binding on value property with type sap.ui.model.type.Date then you can ignore this property or the latter wins.
			 * If the user's browser supports native picker then this property is overwritten by browser with locale settings.
			 */
			displayFormat : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Given value property should match with valueFormat to parse date. Default value is taken from locale settings.
			 * You can only set and get value in this format.
			 * If you use data-binding on value property with type sap.ui.model.type.Date you can ignore this property or the latter wins.
			 */
			valueFormat : {type : "string", group : "Data", defaultValue : null},

			/**
			 * This property as JavaScript Date Object can be used to assign a new value which is independent from valueFormat.
			 */
			dateValue : {type : "object", group : "Data", defaultValue : null}
		},
		aggregations: {

			_picker: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"}

		},
		associations: {

			/**
			 * Association to controls / IDs that label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.27.0
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
		},
		events : {

			/**
			 * This event gets fired when the selection has finished and the value has changed.
			 */
			change : {
				parameters : {

					/**
					 * The string value of the control in given valueFormat (or locale format).
					 */
					value : {type : "string"},

					/**
					 * The value of control as JavaScript Date Object or null if value is empty.
					 */
					dateValue : {type : "object"},

					/**
					 * if set, the entered value is a valid date.
					 * If not set the entered value cannot be converted to a date.
					 * @since 1.38.0
					 */
					valid : {type : "boolean"}

				}
			}
		}
	}});


	!(function(oPrototype, $, oDevice) {

		var oi18n = library.getLocaleData();

		$.extend(oPrototype, {
			_types : {
				Date : {
					valueFormat : oi18n.getDatePattern("short"),
					displayFormat : oi18n.getDatePattern("medium")
				},
				Time : {
					valueFormat : oi18n.getTimePattern("short"),
					displayFormat : oi18n.getTimePattern("short")
				},
				DateTime : {
					valueFormat : oi18n.getDateTimePattern("short"),	// does not include pattern but e.g "{1} {0}"
					displayFormat : oi18n.getDateTimePattern("short")	// does not include pattern but e.g "{1} {0}"
				}
			}
		});

		// build DateTime formats from Date And Time values
		["Time", "Date"].forEach(function(sType, nIndex) {
			["valueFormat", "displayFormat"].forEach(function(sFormat) {
				var oTypes = oPrototype._types;
				oTypes.DateTime[sFormat] = oTypes.DateTime[sFormat].replace("{" + nIndex + "}", oTypes[sType][sFormat]);
			});
		});

	}(DateTimeInput.prototype, jQuery, Device));

	DateTimeInput.prototype.init = function(){

		// as date is the default type - > initialize with DatePicker
		this.setType(DateTimeInputType.Date);

	};

	DateTimeInput.prototype.onBeforeRendering = function() {

		_updateFormatFromBinding.call(this);

	};

	DateTimeInput.prototype.getFocusDomRef = function() {

		var oPicker = _getPicker.call(this);
		return oPicker.getFocusDomRef();

	};

	DateTimeInput.prototype.getIdForLabel = function() {

		var oPicker = _getPicker.call(this);
		return oPicker.getIdForLabel();

	};

	/**
	 * Creates an instance of picker depending of the given property type
	 * @param {sap.m.DateTimeInputType} type the type
	 * @returns {sap.ui.core.Control} picker implementation, that may be one of <code>sap.m.DatePicker</code>,
	 * <code>sap.m.TimePicker</code> or <code>sap.m.DateTimePicker</code>.
	 */
	function buildPickerByType(type){
		var oPicker;

		switch (type) {
			case DateTimeInputType.DateTime:
				jQuery.sap.require("sap.m.DateTimePicker");
				oPicker = new sap.m.DateTimePicker(this.getId() + "-Picker");
				break;

			case DateTimeInputType.Time:
				jQuery.sap.require("sap.m.TimePicker");
				oPicker = new sap.m.TimePicker(this.getId() + "-Picker",
					{localeId: sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString()});
				break;

			default: // default is date
				jQuery.sap.require("sap.m.DatePicker");
				oPicker = new sap.m.DatePicker(this.getId() + "-Picker");
				break;
		}

		// forward properties (also set default, may be different)
		oPicker.setDisplayFormat(this.getDisplayFormat() || this._types[type].displayFormat);
		oPicker.setValueFormat(this.getValueFormat() || this._types[type].valueFormat);
		if (this.getDateValue()) {
			oPicker.setDateValue(this.getDateValue()); // don't set Value -> as by switching type information can be lost
		}
		oPicker.setEnabled(this.getEnabled());
		oPicker.setEditable(this.getEditable());
		oPicker.setValueState(this.getValueState());
		oPicker.setValueStateText(this.getValueStateText());
		oPicker.setShowValueStateMessage(this.getShowValueStateMessage());
		oPicker.setName(this.getName());
		oPicker.setPlaceholder(this.getPlaceholder());
		oPicker.setTextAlign(this.getTextAlign());
		oPicker.setTextDirection(this.getTextDirection());
		oPicker.setWidth("100%");
		oPicker.attachChange(_handleChange, this);

		var aAriaLabelledBy = this.getAriaLabelledBy();
		for (var i = 0; i < aAriaLabelledBy.length; i++) {
			oPicker.addAriaLabelledBy(aAriaLabelledBy[i]);
		}
		return oPicker;
	}

	DateTimeInput.prototype.setType = function(sType){

		if (sType == this.getType() && _getPicker.call(this)) {
			return this;
		}

		this.destroyAggregation("_picker");
		var oPicker = buildPickerByType.call(this, sType);

		this.setAggregation("_picker", oPicker);
		this.setProperty("type", sType); // re-render because picker control changes

		return this;

	};

	DateTimeInput.prototype.setWidth = function(sWidth) {

		this.setProperty("width", sWidth);

		if (this.getDomRef()) {
			sWidth = this.getWidth(); // to use validator
			this.$().css("width", sWidth);
		}

		return this;

	};

	DateTimeInput.prototype.setValue = function(sValue) {

		_updateFormatFromBinding.call(this); // to be sure to have the right format

		sValue = this.validateProperty("value", sValue);
		if (sValue.toLowerCase() == "now") {
			return this.setDateValue(new Date());
		}

		if (sValue === this.getValue()) {
			return this;
		}

		this.setProperty("value", sValue, true);

		var oPicker = _getPicker.call(this);
		oPicker.setValue(sValue);

		var oDate = oPicker.getDateValue();
		this.setProperty("dateValue", oDate, true);

		return this;

	};

	DateTimeInput.prototype.setDateValue = function(oDate) {

		if (this._isValidDate(oDate)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		_updateFormatFromBinding.call(this); // to be sure to have the right format

		this.setProperty("dateValue", oDate, true);

		var oPicker = _getPicker.call(this);
		oPicker.setDateValue(oDate);

		var sValue = oPicker.getValue();
		this.setProperty("value", sValue, true);

		return this;

	};

	DateTimeInput.prototype.setDisplayFormat = function(sDisplayFormat) {

		this.setProperty("displayFormat", sDisplayFormat, true);

		var oPicker = _getPicker.call(this);
		oPicker.setDisplayFormat(sDisplayFormat || this._types[this.getType()].displayFormat);

		return this;

	};

	DateTimeInput.prototype.setValueFormat = function(sValueFormat) {

		this.setProperty("valueFormat", sValueFormat, true);

		var oPicker = _getPicker.call(this);
		oPicker.setValueFormat(sValueFormat || this._types[this.getType()].ValueFormat);

		return this;

	};

	DateTimeInput.prototype.setEnabled = function(bEnabled) {

		this.setProperty("enabled", bEnabled, true);

		var oPicker = _getPicker.call(this);
		oPicker.setEnabled(bEnabled);

		return this;

	};

	DateTimeInput.prototype.setEditable = function(bEditable) {

		this.setProperty("editable", bEditable, true);

		var oPicker = _getPicker.call(this);
		oPicker.setEditable(bEditable);

		return this;

	};

	DateTimeInput.prototype.setValueState = function(sValueState) {

		this.setProperty("valueState", sValueState, true);

		var oPicker = _getPicker.call(this);
		oPicker.setValueState(sValueState);

		return this;

	};

	DateTimeInput.prototype.setValueStateText = function(sValueStateText) {

		this.setProperty("valueStateText", sValueStateText, true);

		var oPicker = _getPicker.call(this);
		oPicker.setValueStateText(sValueStateText);

		return this;

	};

	DateTimeInput.prototype.setShowValueStateMessage = function(bShowValueStateMessage) {

		this.setProperty("showValueStateMessage", bShowValueStateMessage, true);

		var oPicker = _getPicker.call(this);
		oPicker.setShowValueStateMessage(bShowValueStateMessage);

		return this;

	};

	DateTimeInput.prototype.setName = function(sName) {

		this.setProperty("name", sName, true);

		var oPicker = _getPicker.call(this);
		oPicker.setName(sName);

		return this;

	};

	DateTimeInput.prototype.setPlaceholder = function(sPlaceholder) {

		this.setProperty("placeholder", sPlaceholder, true);

		var oPicker = _getPicker.call(this);
		oPicker.setPlaceholder(sPlaceholder);

		return this;

	};

	DateTimeInput.prototype.setTextAlign = function(sTextAlign) {

		this.setProperty("textAlign", sTextAlign, true);

		var oPicker = _getPicker.call(this);
		oPicker.setTextAlign(sTextAlign);

		return this;

	};

	DateTimeInput.prototype.setTextDirection = function(sTextDirection) {

		this.setProperty("textDirection", sTextDirection, true);

		var oPicker = _getPicker.call(this);
		oPicker.setTextDirection(sTextDirection);

		return this;

	};

	DateTimeInput.prototype.addAriaLabelledBy = function(sID) {

		this.addAssociation("ariaLabelledBy", sID, true);

		var oPicker = _getPicker.call(this);
		oPicker.addAriaLabelledBy(sID);

		return this;

	};

	DateTimeInput.prototype.removeAriaLabelledBy = function(sID) {

		this.removeAssociation("ariaLabelledBy", sID, true);

		var oPicker = _getPicker.call(this);
		oPicker.removeAriaLabelledBy(sID);

		return this;

	};

	DateTimeInput.prototype.removeAllAriaLabelledBy = function() {

		this.removeAssociation("ariaLabelledBy", true);

		var oPicker = _getPicker.call(this);
		oPicker.removeAllAriaLabelledBy();

		return this;

	};

	/**
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 * @returns {Object} Current accessibility state of the control
	 * @protected
	 */
	DateTimeInput.prototype.getAccessibilityInfo = function() {
		var oPicker = _getPicker.call(this);
		return oPicker && oPicker.getAccessibilityInfo ? oPicker.getAccessibilityInfo() : null;
	};

	/**
	 * Checks if the given <code>DateTimeInput</code>'s type mismatches the pattern and if so,
	 * instantiate the picker that corresponds to the pattern.
	 *
	 * @param {sap.m.DateTimeInputType} type the <code>DateTimeInput</code>'s type
	 * @param {sap.ui.core.Control} picker the current picker implementation, that may be one of <code>sap.m.DatePicker</code>,
	 * <code>sap.m.TimePicker</code>, <code>sap.m.DateTimePicker</code>
	 * @returns {sap.ui.core.Control} picker implementation, that may be one of <code>sap.m.DatePicker</code>,
	 * <code>sap.m.TimePicker</code> or <code>sap.m.DateTimePicker</code>. Example type=DateTime and pattern "DD MM YYY".
	 * In this case the method will return an instance of sap.m.DatePicker if <picker> is empty or is currently not of this type.
	 */
	DateTimeInput.prototype._getPickerByTypeAndPattern = function(type, picker, pattern) {
		var sRegexDates = /[DdYyMLWwGQUur]/,
			sRegexTime = /[HhKkmsa]/,
			bTimePattern = sRegexTime.test(pattern),
			bDatePattern = sRegexDates.test(pattern),
			bTimeOnlyPattern = bTimePattern && !bDatePattern,
			bDateOnlyPattern = bDatePattern && !bTimePattern,
			bDateTimePattern = bDatePattern && bTimePattern,
			sNewPickerType,
			oNewPicker;

		switch  (type) {
			case DateTimeInputType.Time:
			case DateTimeInputType.Date:
			case DateTimeInputType.DateTime:
				if (bTimeOnlyPattern && picker.getMetadata().getName() !== "sap.m.TimePicker") {
					sNewPickerType = DateTimeInputType.Time;
				} else if (bDateOnlyPattern && picker.getMetadata().getName() !== "sap.m.DatePicker") {
					sNewPickerType = DateTimeInputType.Date;
				} else if (bDateTimePattern && picker.getMetadata().getName() !== "sap.m.DateTimePicker") {
					sNewPickerType = DateTimeInputType.DateTime;
				}
				break;
			default: {
				throw "Invalid type: " + type + ". Expected is one of the sap.m.DateTimeInputType";
			}
		}
		if (sNewPickerType) {
			this.destroyAggregation("_picker");
			oNewPicker = buildPickerByType.call(this, sNewPickerType);
			this.setAggregation("_picker", oNewPicker);
		}

		return oNewPicker || picker;
	};


	/**
	 * Returns the binding type pattern of 'value' property if such.
	 * @return {*}
	 * @private
	 **/
	DateTimeInput.prototype._getBoundValueTypePattern = function() {
		var oBinding = this.getBinding("value"),
			oBindingType = oBinding && oBinding.getType() && oBinding.getType();

		if (oBindingType instanceof Date1 || oBindingType instanceof  Time || oBindingType  instanceof DateTime) {
			return oBindingType.getOutputPattern();
		}

		if (oBindingType instanceof ODataType && oBindingType.oFormat) {
			return oBindingType.oFormat.oFormatOptions.pattern;
		}

		return undefined;
	};

	function _getPicker(){

		return this.getAggregation("_picker");

	}

	// Cross frame check for a date should be performed here otherwise setDateValue would fail in OPA tests
	// because Date object in the test is different than the Date object in the application (due to the iframe).
	// We can use jQuery.type or this method:
	// function isValidDate (date) {
	//	return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date);
	//}
	DateTimeInput.prototype._isValidDate = function (oDate) {
		return oDate && jQuery.type(oDate) !== "date";
	};

	function _updateFormatFromBinding(){

		if (this._getBoundValueTypePattern()) {
			var sPattern = this._getBoundValueTypePattern();
			var oPicker = _getPicker.call(this);
			oPicker = this._getPickerByTypeAndPattern(this.getType(), oPicker, sPattern);

			if (oPicker.getValueFormat() != sPattern) {
				oPicker.setValueFormat(sPattern);
			}
			if (oPicker.getDisplayFormat() != sPattern) {
				oPicker.setDisplayFormat(sPattern);
			}
		}

	}

	function _handleChange(oEvent) {

		var sValue = oEvent.getParameter("value");
		var oDateValue;
		var bValid = oEvent.getParameter("valid");

		this.setProperty("value", sValue, true);

		if (bValid) {
			oDateValue = oEvent.oSource.getDateValue();
			this.setProperty("dateValue", oDateValue, true);
		}

		// newValue and newDateValue for compatibility reasons
		this.fireChange({value: sValue, newValue: sValue, valid: bValid, dateValue: oDateValue, newDateValue: oDateValue});

	}

	return DateTimeInput;

});
