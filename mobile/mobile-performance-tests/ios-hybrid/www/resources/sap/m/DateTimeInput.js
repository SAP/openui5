/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.DateTimeInput.
jQuery.sap.declare("sap.m.DateTimeInput");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new DateTimeInput.
 * 
 * Accepts an object literal <code>mSettings</code> that defines initial 
 * property values, aggregated and associated objects as well as event handlers. 
 * 
 * If the name of a setting is ambiguous (e.g. a property has the same name as an event), 
 * then the framework assumes property, aggregation, association, event in that order. 
 * To override this automatic resolution, one of the prefixes "aggregation:", "association:" 
 * or "event:" can be added to the name of the setting (such a prefixed name must be
 * enclosed in single or double quotes).
 *
 * The supported settings are:
 * <ul>
 * <li>Properties
 * <ul>
 * <li>{@link #getValue value} : string</li>
 * <li>{@link #getType type} : sap.m.DateTimeInputType (default: sap.m.DateTimeInputType.Date)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getValueState valueState} : sap.ui.core.ValueState (default: sap.ui.core.ValueState.None)</li>
 * <li>{@link #getPlaceholder placeholder} : string</li>
 * <li>{@link #getDisplayFormat displayFormat} : string</li>
 * <li>{@link #getValueFormat valueFormat} : string</li>
 * <li>{@link #getDateValue dateValue} : object</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.DateTimeInput#event:change change} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Allows end users to interact with date and/or time and select from a date and/or time pad.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @since 1.9.1
 * @name sap.m.DateTimeInput
 */
sap.ui.core.Control.extend("sap.m.DateTimeInput", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"value" : {type : "string", group : "Data", defaultValue : null, bindable : "bindable"},
		"type" : {type : "sap.m.DateTimeInputType", group : "Data", defaultValue : sap.m.DateTimeInputType.Date},
		"width" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"valueState" : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : sap.ui.core.ValueState.None},
		"placeholder" : {type : "string", group : "Misc", defaultValue : null},
		"displayFormat" : {type : "string", group : "Appearance", defaultValue : null},
		"valueFormat" : {type : "string", group : "Data", defaultValue : null},
		"dateValue" : {type : "object", group : "Data", defaultValue : null}
	},
	events : {
		"change" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.DateTimeInput with name <code>sClassName</code> 
 * and enriches it with the information contained in <code>oClassInfo</code>.
 * 
 * <code>oClassInfo</code> might contain the same kind of informations as described in {@link sap.ui.core.Element.extend Element.extend}.
 *   
 * @param {string} sClassName name of the class to be created
 * @param {object} [oClassInfo] object literal with informations about the class  
 * @param {function} [FNMetaImpl] constructor function for the metadata object. If not given, it defaults to sap.ui.core.ElementMetadata.
 * @return {function} the created class / constructor function
 * @public
 * @static
 * @name sap.m.DateTimeInput.extend
 * @function
 */

sap.m.DateTimeInput.M_EVENTS = {'change':'change'};


/**
 * Getter for property <code>value</code>.
 * This property can be used as string to assign new value and this is relevant with valueFormat property(see valueFormat) but independent from what is going to display on the field(see displayFormat).
 * Another way to assign new value is using dateValue property(see dateVaue).
 * If you use both at the same time, latter wins.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>value</code>
 * @public
 * @name sap.m.DateTimeInput#getValue
 * @function
 */


/**
 * Setter for property <code>value</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sValue  new value for property <code>value</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setValue
 * @function
 */

/**
 * Binder for property <code>value</code>.
 *
 * @param {string} sPath path to a property in the model 
 * @param {function} [fnFormatter=null] the formatter function
 * @param {sap.ui.model.BindingMode} [sMode=Default] the binding mode to be used for this property binding (e.g. one way) 
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#bindValue
 * @function
 */


/**
 * Unbinder for property <code>value</code>.
 *
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#unbindValue
 * @function

 */

/**
 * Getter for property <code>type</code>.
 * Type of DateTimeInput (e.g. Date, Time, DateTime)
 *
 * Default value is <code>Date</code>
 *
 * @return {sap.m.DateTimeInputType} the value of property <code>type</code>
 * @public
 * @name sap.m.DateTimeInput#getType
 * @function
 */


/**
 * Setter for property <code>type</code>.
 *
 * Default value is <code>Date</code> 
 *
 * @param {sap.m.DateTimeInputType} oType  new value for property <code>type</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setType
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * Defines the width of the input.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.DateTimeInput#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setWidth
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Boolean property to enable the control.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.m.DateTimeInput#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setEnabled
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Invisible controls are not rendered.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.DateTimeInput#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setVisible
 * @function
 */

/**
 * Getter for property <code>valueState</code>.
 * Visualizes warnings or errors related to the field. Possible values: Warning, Error, Success.
 *
 * Default value is <code>None</code>
 *
 * @return {sap.ui.core.ValueState} the value of property <code>valueState</code>
 * @public
 * @name sap.m.DateTimeInput#getValueState
 * @function
 */


/**
 * Setter for property <code>valueState</code>.
 *
 * Default value is <code>None</code> 
 *
 * @param {sap.ui.core.ValueState} oValueState  new value for property <code>valueState</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setValueState
 * @function
 */

/**
 * Getter for property <code>placeholder</code>.
 * Text shown when no value is available
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>placeholder</code>
 * @public
 * @name sap.m.DateTimeInput#getPlaceholder
 * @function
 */


/**
 * Setter for property <code>placeholder</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sPlaceholder  new value for property <code>placeholder</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setPlaceholder
 * @function
 */

/**
 * Getter for property <code>displayFormat</code>.
 * Displays date value in this given format in text field. Default value is taken from locale settings.
 * If you use data-binding on value property with type sap.ui.model.type.Date then you can ignore this property or latter wins.
 * If user browser supports native picker then this property is overwritten by browser with locale settings.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>displayFormat</code>
 * @public
 * @name sap.m.DateTimeInput#getDisplayFormat
 * @function
 */


/**
 * Setter for property <code>displayFormat</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sDisplayFormat  new value for property <code>displayFormat</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setDisplayFormat
 * @function
 */

/**
 * Getter for property <code>valueFormat</code>.
 * Given value property should match with valueFormat to parse date. Default value is taken from locale settings.
 * You can set and get value in this format.
 * If you use data-binding on value property with type sap.ui.model.type.Date you can ignore this property or latter wins.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>valueFormat</code>
 * @public
 * @name sap.m.DateTimeInput#getValueFormat
 * @function
 */


/**
 * Setter for property <code>valueFormat</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sValueFormat  new value for property <code>valueFormat</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setValueFormat
 * @function
 */

/**
 * Getter for property <code>dateValue</code>.
 * This property as JavaScript Date Object can be used to assign a new value which is independent from valueFormat.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {object} the value of property <code>dateValue</code>
 * @public
 * @name sap.m.DateTimeInput#getDateValue
 * @function
 */


/**
 * Setter for property <code>dateValue</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {object} oDateValue  new value for property <code>dateValue</code>
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#setDateValue
 * @function
 */

/**
 * This event gets fired when the selection has finished and the value has changed. 
 *
 * @name sap.m.DateTimeInput#change
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.newValue The new string value of the control in given valueFormat(or locale format).
 * @param {object} oControlEvent.getParameters.newDateValue The new value of control as JavaScript Date Object or null if value is empty.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'change' event of this <code>sap.m.DateTimeInput</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.DateTimeInput</code>.<br/> itself. 
 *  
 * This event gets fired when the selection has finished and the value has changed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.DateTimeInput</code>.<br/> itself.
 *
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#attachChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'change' event of this <code>sap.m.DateTimeInput</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.DateTimeInput#detachChange
 * @function
 */


/**
 * Fire event change to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'newValue' of type <code>string</code> The new string value of the control in given valueFormat(or locale format).</li>
 * <li>'newDateValue' of type <code>object</code> The new value of control as JavaScript Date Object or null if value is empty.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.DateTimeInput} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.DateTimeInput#fireChange
 * @function
 */

// Start of sap\m\DateTimeInput.js
jQuery.sap.require("sap.ui.model.type.Date");
jQuery.sap.require("sap.m.Input");

!function(oPrototype) {

	var sKey,
		oInheriteds = {},
		oSuper = sap.m.Input.prototype,
		oi18n = sap.m.getLocaleData(),
		hasPickerBug = (function() {
			// samsung galaxy android 4.1 has picker but it hangs after selection
			if (jQuery.os.android &&
				jQuery.os.fVersion == 4.1 &&
				!jQuery.browser.chrome &&
				/samsung/i.test(window.navigator.userAgent)) {
				return true;
			}
		}());

	for (sKey in oSuper) {
		// only inherit input controls own methods
		if (oSuper.hasOwnProperty(sKey)) {
			oInheriteds[sKey] = oSuper[sKey];
		}
	}

	// do not inherit meta-data
	delete oInheriteds.getMetadata;

	jQuery.extend(oPrototype, oInheriteds, {
		//In iOS5 date-time fields do not fire change/input events
		_hasChangeEventBug: jQuery.sap.touchEventMode == "ON" &&
							jQuery.os.ios &&
							jQuery.os.fVersion < 6,

		_hasChangeEvent : true,
		_origin : "value",
		_super : oSuper,
		_types : {
			Date : {
				isNative : hasPickerBug,
				valueFormat : oi18n.getDatePattern("short"),
				displayFormat : oi18n.getDatePattern("medium"),
				nativeFormat : "yyyy-MM-dd",
				nativeType : "date"
			},
			Time : {
				isNative : hasPickerBug,
				valueFormat : oi18n.getTimePattern("short"),
				displayFormat : oi18n.getTimePattern("short"),
				nativeFormat : "HH:mm:ss",
				nativeType : "time"
			},
			DateTime : {
				isNative : hasPickerBug,
				valueFormat : oi18n.getDateTimePattern("short"),	//includes not pattern but e.g "{1} {0}"
				displayFormat : oi18n.getDateTimePattern("short"),	//includes not pattern but e.g "{1} {0}"
				nativeFormat : "yyyy-MM-ddTHH:mm:ss" + (jQuery.os.ios ? ".S" : ""), //ios uses milliseconds
				nativeType : "datetime-local"	// without time-zone
			}
		}
	});

	//build DateTime formats from Date And Time values
	jQuery.each(["Time", "Date"], function(nIndex, sType) {
		jQuery.each(["valueFormat", "displayFormat"], function() {
			var oTypes = oPrototype._types;
			oTypes.DateTime[this] = oTypes.DateTime[this].replace("{" + nIndex + "}", oTypes[sType][this]);
		});
	});

}(sap.m.DateTimeInput.prototype);

/**
 * Overwrite sap.m.Input::onBeforeRendering
 */
sap.m.DateTimeInput.prototype.onBeforeRendering = function() {
	this._super.onBeforeRendering.call(this);
	if (!this.mProperties.hasOwnProperty("type")) {
		this.setType("Date");
	}
};

/**
 * Overwrite sap.m.Input::onAfterRendering
 */
sap.m.DateTimeInput.prototype.onAfterRendering = function() {

	this._super.onAfterRendering.call(this);

	// we do not need input event
	this._$input.unbind("input.input");

	if (!this._hasChangeEvent) {
		this._$input.bind("blur.input focus.input", jQuery.proxy(this._onChange, this));
	}

	if (!this.isNative()) {
		jQuery.sap.require("sap.m.DateTimeCustom");
		var oScroller = this._getScrollerConfig();
		this._$input[0].type = "text";
		this._$input.scroller(oScroller);
	} else {
		this._$input[0].type = this._types[this.getType()].nativeType;
	}

	this._showValue();
};

sap.m.DateTimeInput.prototype.setValue = function(sValue) {
	this._origin = "value";
	this._getFormatFromBinding();
	return this.setProperty("value", sValue);
};


/**
 * Check given dateValue is JS Date Object
 */
sap.m.DateTimeInput.prototype.setDateValue = function(oValue) {
	this._isDate(oValue);
	this._origin = "dateValue";
	return this.setProperty("dateValue", oValue);
};


/**
 * Convert value to JS Date Object
 * returns null for empty values
 */
sap.m.DateTimeInput.prototype.getDateValue = function() {
	var sValue = this.getProperty("value");
	if (!sValue) {
		return null;
	}

	return sap.ui.core.format.DateFormat.getDateInstance({
		pattern : this.getValueFormat()
	}).parse(this.getProperty("value"));
};

sap.m.DateTimeInput.prototype.getDisplayFormat = function() {
	return this.getProperty("displayFormat") || this._types[this.getType()].displayFormat;
};

sap.m.DateTimeInput.prototype.getValueFormat = function() {
	return this.getProperty("valueFormat") || this._types[this.getType()].valueFormat;
};

sap.m.DateTimeInput.prototype.getNativeFormat = function() {
	return this._types[this.getType()].nativeFormat;
};

sap.m.DateTimeInput.prototype.isNative = function(sType) {
	var oType = this._types[sType || this.getType()];
	if (typeof oType.isNative == "undefined") {
		oType.isNative = this._hasNativeSupport();
	}

	return oType.isNative;
};


/**
 * Check native elements on new type set
 */
sap.m.DateTimeInput.prototype.setType = function(sType) {
	this.setProperty("type", sType);

	// reach prototype values
	delete this._hasChangeEvent;
	delete this._showLabelAsPlaceholder;

	if (this.isNative()) {
		if (this._hasChangeEventBug) {
			this._hasChangeEvent = false;
		}
		if (this._showLabelAsPlaceholder === null) {
			this._showLabelAsPlaceholder = true;	//native pickers still need self-made placeholder
		}
	}

	return this;
};

/**
 * Overwrite sap.m.Input::setMaxLength
 * @private
 */
sap.m.DateTimeInput.prototype.setMaxLength = function() {
	return this;
};

/**
 * Overwrite sap.m.Input::getMaxLength
 * @private
 */
sap.m.DateTimeInput.prototype.getMaxLength = function() {
	return 0;
};

/**
 * Check given is JS Date Object and throw error if not
 */
sap.m.DateTimeInput.prototype._isDate = function(oValue) {
	if (!sap.m.isDate(oValue)) {
		throw new Error("Type Error: Expected JavaScript Date Object for property dateValue of " + this);
	}
	return true;
};

/**
 * Overwrite sap.m.Input::_onChange
 * Change/Input or Focus/Blur event handler
 */
sap.m.DateTimeInput.prototype._onChange = function(oEvent) {
	var oDate,
		sNewValue = this._$input.val(),
		sOldValue = this.getProperty("value");

	if (sNewValue) {
		if (!this.isNative()) {
			oDate = this._$input.scroller("getDate");

			// reformat for CLDR
			oEvent && this._$input.val(
				sap.ui.core.format.DateFormat.getDateInstance({
					pattern : this.getDisplayFormat()
				}).format(oDate)
			);
		} else {
			sNewValue = this._$input.val();
			oDate = sap.ui.core.format.DateFormat.getDateInstance({
				pattern : this.getNativeFormat()
			}).parse(sNewValue);
		}

		if (!isNaN(oDate)) {
			sNewValue = sap.ui.core.format.DateFormat.getDateInstance({
				pattern : this.getValueFormat()
			}).format(oDate);
		} else {
			sNewValue = "";
			oDate = null;
		}
	}

	if (oEvent && oEvent.type != "change" && sOldValue == sNewValue) {
		return;
	}

	this.setProperty("value", sNewValue, true);
	this._setLabelVisibility();

	//TODO: should we fire dateValue
	if (oEvent && oEvent.type != "focus") {
		this.fireChange({
			newValue : sNewValue,
			newDateValue : oDate
		});
	}
};

/**
 * Overwrite sap.m.Input::_unbind
 */
sap.m.DateTimeInput.prototype._unbind = function() {
	this._super._unbind.call(this);
	if (this._$input instanceof jQuery && !this.isNative()) {
		this._$input.scroller("destroy");
	}
};


/**
 * Checks if new HTML5 types are supported by browser
 *
 * This method only checks what the name is saying
 * So, does not cache the result for you
 * Do not call too often
 */
sap.m.DateTimeInput.prototype._hasNativeSupport = function(sType) {
	var bSupported, sUnSupportedValue = ":)",
		oElem = document.createElement("input");

	sType = sType || this._types[this.getType()].nativeType;
	oElem.setAttribute("type", sType);

	// If browser doesn't support, it will ignore the type and set to "text".
	bSupported = (oElem.type !== "text");

	// in android, type is still correct even if it is not supported
	// lets set unsupported value to force validation.
	if (bSupported) {
		oElem.value = sUnSupportedValue;
		bSupported = (oElem.value != sUnSupportedValue);
	}
	return bSupported;
};

/**
 * Date-time conversion for mobiscroll configuration
 * TODO: Title has to be reformatted, mobiscroll does not support all cldr formats
 * TODO: If screen is too small datetime field maybe does not fit to screen
 * TODO: mode : mixed has sometimes overlap problem(AND 3.2)
 */
sap.m.DateTimeInput.prototype._getScrollerConfig = function() {
	var sType = this.getType(),
		sFormat = this.getDisplayFormat(),
		oConfig = {
			preset : sType.toLowerCase()
		};

	if (sType == "Date") {
		sFormat = this._convertDatePattern(sFormat);
		jQuery.extend(oConfig, {
			dateFormat : sFormat,
			dateOrder : this._getLongDatePattern(sFormat)
		});
	} else if (sType == "Time") {
		sFormat = this._convertTimePattern(sFormat);
		jQuery.extend(oConfig, {
			timeWheels : sFormat,
			timeFormat : sFormat
		});
	} else if (sType == "DateTime") {
		sFormat = this._convertDatePattern(this._convertTimePattern(sFormat));

		// date-time hack
		jQuery.extend(oConfig, {
			dateFormat : sFormat,
			dateOrder : sFormat.replace(/[^ymd]/ig, ""),
			timeWheels : sFormat,
			timeFormat : " "
		});
	}

	return oConfig;
};

sap.m.DateTimeInput.prototype._setInputValue = function(sValue) {
	this._$input.val(sValue);
	this._onChange();
};

/**
 * Do the required conversion and set input value
 */
sap.m.DateTimeInput.prototype._showValue = function() {
	var date = this.getProperty(this._origin);
	if (!date) {
		return;
	}

	if (this._origin == "value") {
		date = sap.ui.core.format.DateFormat.getDateInstance({
			pattern : this.getValueFormat()
		}).parse(date);

		if (+date == +sap.m.getInvalidDate()) {
			jQuery.sap.log.error( "Format Error: value property " + this.getValue()
								+ " does not match with valueFormat " + this.getValueFormat()
								+ " of " + this );
			this._setInputValue("");
			return;
		}
	} else {
		this._isDate(date);
	}

	if (!this.isNative()) {
		this._$input.scroller("setDate", date, false);
	}

	this._setInputValue(
		sap.ui.core.format.DateFormat.getDateInstance({
			pattern : this.isNative() ? this.getNativeFormat() : this.getDisplayFormat()
		}).format(date)
	);
};

/**
 * Check data-binding for value property
 * Get according pattern from type settings
 */
sap.m.DateTimeInput.prototype._getFormatFromBinding = function() {
	var oBindingInfo = this.getBindingInfo("value");
	if (!oBindingInfo) {
		return;
	}

	var oBindingType = oBindingInfo.type;
	if (!oBindingType || !(oBindingType instanceof sap.ui.model.type.Date)) {
		return;
	}

	var sFormat = oBindingType.getOutputPattern();
	this.setProperty("valueFormat", sFormat, true);
	this.setProperty("displayFormat", sFormat, true);
	return sFormat;
};


/**
 * Convert date pattern to long month name, 4 digit year, 2 digit day
 */
sap.m.DateTimeInput.prototype._getLongDatePattern = function(sPattern) {
	sPattern = sPattern || this.getDisplayFormat();
	return sPattern.replace(/y+/i, "YY").replace(/m+/i, "MM").replace(/d+/i, "dd");
};


/**
 * Converts the time pattern from CLDR to the mobiscroll time picker
 * m is short month name, i = minute
 */
sap.m.DateTimeInput.prototype._convertTimePattern = function(sPattern) {
	sPattern = sPattern || this.getDisplayFormat();
	return sPattern.replace(/m/g, "i").replace("a", "A");
};


/**
 * Converts the date pattern from CLDR to the one of the jQuery datePicker
 * Month is coded in the different way
 * TODO: Copied from core talk with core team to call method from somewhere else shared
 */
sap.m.DateTimeInput.prototype._convertDatePattern = function(sPattern) {
	sPattern = sPattern || this.getDisplayFormat();

	var iIndex1 = sPattern.indexOf('M'),
		iIndex2 = sPattern.lastIndexOf('M'),
		sFormat = sPattern,
		sNewMonth;

	if (iIndex1 == -1) {
		// no month defined with M, maybe using L (standalone)
		iIndex1 = sPattern.indexOf('L');
		iIndex2 = sPattern.lastIndexOf('L');
	}

	if (iIndex1 > -1) {
		switch (iIndex2-iIndex1) {
		case 0:
			sNewMonth = 'm';
			break;
		case 1:
			sNewMonth = 'mm';
			break;
		case 2:
			sNewMonth = 'M';
			break;
		case 5:
			//narrow state not available in jQuery DatePicker -> use shortest one
			sNewMonth = 'm';
			break;
		default:
			sNewMonth = 'MM';
		break;
		}
		sFormat = sPattern.substring(0, iIndex1) + sNewMonth + sPattern.substring(iIndex2 + 1);
	}

	var sNewYear;
	iIndex1 = sFormat.indexOf('y');
	if (iIndex1 > -1) {
		iIndex2 = sFormat.lastIndexOf('y');
		if (iIndex2-iIndex1 == 1) {
			// two chanrs
			sNewYear = 'y';
		}else{
			sNewYear = 'yy';
		}
		var sFormat = sFormat.substring(0, iIndex1) + sNewYear + sFormat.substring(iIndex2 + 1);
	}

	var sNewYearDay;
	iIndex1 = sFormat.indexOf('D');
	if (iIndex1 > -1) {
		iIndex2 = sFormat.lastIndexOf('D');

		if (iIndex2-iIndex1 == 1) {
			// two chanrs
			sNewYearDay = 'o';
		}else{
			sNewYearDay = 'oo';
		}
		var sFormat = sFormat.substring(0, iIndex1) + sNewYearDay + sFormat.substring(iIndex2 + 1);
	}

	// EEEE = DD = day of week(long)
	// EEE, EE, E = D = day of week(short)
	sFormat = sFormat.replace(/EEEE/g, "DD").replace(/E+/g, "D");

	return sFormat;
};