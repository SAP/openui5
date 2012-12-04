/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Input.
jQuery.sap.declare("sap.m.Input");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Input.
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
 * <li>{@link #getType type} : sap.m.InputType (default: sap.m.InputType.Text)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getMaxLength maxLength} : int (default: 0)</li>
 * <li>{@link #getValueState valueState} : sap.ui.core.ValueState (default: sap.ui.core.ValueState.None)</li>
 * <li>{@link #getName name} : string</li>
 * <li>{@link #getPlaceholder placeholder} : string</li>
 * <li>{@link #getDateFormat dateFormat} : string (default: 'YYYY-MM-dd')</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.Input#event:change change} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.Input#event:liveChange liveChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Enables users to input data.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @experimental Since version 1.2. 
 * API is not yet finished and might change completely
 * @name sap.m.Input
 */
sap.ui.core.Control.extend("sap.m.Input", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"value" : {type : "string", group : "Data", defaultValue : null, bindable : "bindable"},
		"type" : {type : "sap.m.InputType", group : "Data", defaultValue : sap.m.InputType.Text},
		"width" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"maxLength" : {type : "int", group : "Behavior", defaultValue : 0},
		"valueState" : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : sap.ui.core.ValueState.None},
		"name" : {type : "string", group : "Misc", defaultValue : null},
		"placeholder" : {type : "string", group : "Misc", defaultValue : null},
		"dateFormat" : {type : "string", group : "Misc", defaultValue : 'YYYY-MM-dd'}
	},
	events : {
		"change" : {}, 
		"liveChange" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.Input with name <code>sClassName</code> 
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
 * @name sap.m.Input.extend
 * @function
 */

sap.m.Input.M_EVENTS = {'change':'change','liveChange':'liveChange'};


/**
 * Getter for property <code>value</code>.
 * Input Value
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>value</code>
 * @public
 * @name sap.m.Input#getValue
 * @function
 */


/**
 * Setter for property <code>value</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sValue  new value for property <code>value</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setValue
 * @function
 */

/**
 * Binder for property <code>value</code>.
 *
 * @param {string} sPath path to a property in the model 
 * @param {function} [fnFormatter=null] the formatter function
 * @param {sap.ui.model.BindingMode} [sMode=Default] the binding mode to be used for this property binding (e.g. one way) 
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#bindValue
 * @function
 */


/**
 * Unbinder for property <code>value</code>.
 *
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#unbindValue
 * @function

 */

/**
 * Getter for property <code>type</code>.
 * Type of input (e.g. Text, Number, Email, Phone)
 *
 * Default value is <code>Text</code>
 *
 * @return {sap.m.InputType} the value of property <code>type</code>
 * @public
 * @name sap.m.Input#getType
 * @function
 */


/**
 * Setter for property <code>type</code>.
 *
 * Default value is <code>Text</code> 
 *
 * @param {sap.m.InputType} oType  new value for property <code>type</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setType
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
 * @name sap.m.Input#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setWidth
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Boolean property to enable the control (default is true).
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.m.Input#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setEnabled
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Invisible inputs are not rendered
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.Input#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setVisible
 * @function
 */

/**
 * Getter for property <code>maxLength</code>.
 * Maximum number of characters. Value '0' means the feature is switched off.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>maxLength</code>
 * @public
 * @name sap.m.Input#getMaxLength
 * @function
 */


/**
 * Setter for property <code>maxLength</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iMaxLength  new value for property <code>maxLength</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setMaxLength
 * @function
 */

/**
 * Getter for property <code>valueState</code>.
 * Visualizes warnings or errors related to the text field. Possible values: Warning, Error, Success.
 *
 * Default value is <code>None</code>
 *
 * @return {sap.ui.core.ValueState} the value of property <code>valueState</code>
 * @public
 * @name sap.m.Input#getValueState
 * @function
 */


/**
 * Setter for property <code>valueState</code>.
 *
 * Default value is <code>None</code> 
 *
 * @param {sap.ui.core.ValueState} oValueState  new value for property <code>valueState</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setValueState
 * @function
 */

/**
 * Getter for property <code>name</code>.
 * The 'name' property to be used in the HTML code (e.g. for HTML forms that send data to the server via 'submit').
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>name</code>
 * @public
 * @name sap.m.Input#getName
 * @function
 */


/**
 * Setter for property <code>name</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sName  new value for property <code>name</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setName
 * @function
 */

/**
 * Getter for property <code>placeholder</code>.
 * text shown when no value available
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>placeholder</code>
 * @public
 * @name sap.m.Input#getPlaceholder
 * @function
 */


/**
 * Setter for property <code>placeholder</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sPlaceholder  new value for property <code>placeholder</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setPlaceholder
 * @function
 */

/**
 * Getter for property <code>dateFormat</code>.
 * Only used if type=date and no datepicker is available.
 * The data is displayed and the user input is parsed according to this format.
 * NOTE: The value property is always of the form RFC 3339 (YYYY-MM-dd).
 * 
 *
 * Default value is <code>YYYY-MM-dd</code>
 *
 * @return {string} the value of property <code>dateFormat</code>
 * @public
 * @name sap.m.Input#getDateFormat
 * @function
 */


/**
 * Setter for property <code>dateFormat</code>.
 *
 * Default value is <code>YYYY-MM-dd</code> 
 *
 * @param {string} sDateFormat  new value for property <code>dateFormat</code>
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#setDateFormat
 * @function
 */

/**
 * This event gets fired when the input operation has finished and the value has changed. 
 *
 * @name sap.m.Input#change
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.newValue the new value of the input
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'change' event of this <code>sap.m.Input</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Input</code>.<br/> itself. 
 *  
 * This event gets fired when the input operation has finished and the value has changed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Input</code>.<br/> itself.
 *
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#attachChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'change' event of this <code>sap.m.Input</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#detachChange
 * @function
 */


/**
 * Fire event change to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'newValue' of type <code>string</code> the new value of the input</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Input#fireChange
 * @function
 */

/**
 * This event is fired when the value of the input is changed - e.g. at each keypress 
 *
 * @name sap.m.Input#liveChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.newValue the new value of the input
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'liveChange' event of this <code>sap.m.Input</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Input</code>.<br/> itself. 
 *  
 * This event is fired when the value of the input is changed - e.g. at each keypress 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Input</code>.<br/> itself.
 *
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#attachLiveChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'liveChange' event of this <code>sap.m.Input</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Input#detachLiveChange
 * @function
 */


/**
 * Fire event liveChange to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'newValue' of type <code>string</code> the new value of the input</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Input} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Input#fireLiveChange
 * @function
 */

// Start of sap\m\Input.js
jQuery.sap.require("sap.ui.core.EnabledPropagator");
jQuery.sap.require("sap.ui.core.format.DateFormat");

// input types which have picker
sap.m.Input.prototype._pickers = ['Date', 'Month', 'Datetime', 'DatetimeLocal', 'Week', 'Time'];

// use labels as placeholder configuration
sap.m.Input.prototype._showLabelAsPlaceholder = (function() {
	var useLabel = (jQuery.sap.touchEventMode == "ON");

	if (useLabel && ((jQuery.os.ios && jQuery.os.fVersion >= 6) || (jQuery.os.android && jQuery.browser.chrome))) {
		useLabel = null;	//this means we should check type that we need self-made placeholder
	}

	return useLabel;
}());


sap.m.Input.prototype.init = function() {
	this._hasChangeEvent = true;
};

sap.m.Input.prototype.onBeforeRendering = function() {
	this._unbindEvents();
};

sap.m.Input.prototype.onAfterRendering = function() {
	this._$input = this.$().find('input');
	if (this._showLabelAsPlaceholder) {
		this._$label = this.$().find('label');
	}

	this._setLabelVisibility();
	if (this._hasChangeEvent) {
		this._$input.bind("change.input input.input", jQuery.proxy(this.onchange, this));
	} else {
		this._$input.bind("blur.input focus.input", jQuery.proxy(this.onchange, this));
	}
};

//In iOS5 some input types do not fire change/input events
//TODO : check if blackberry has the same change event issue
//http://supportforums.blackberry.com/t5/Web-and-WebWorks-Development/input-type-date-change-event/td-p/1275165
sap.m.Input.prototype.setType = function(sType) {
	this.setProperty("type", sType, false);
	this._hasChangeEvent = !(jQuery.sap.touchEventMode == "ON" &&
							jQuery.os.ios &&
							jQuery.os.fVersion < 6 &&
							this._pickers.indexOf(sType) + 1);

	// we can show native placeholder but we still need self-made placeholder for date/time...
	if (sap.m.Input.prototype._showLabelAsPlaceholder == null && this._pickers.indexOf(sType) + 1) {
		this._showLabelAsPlaceholder = true;
	}
	return this;
};


sap.m.Input.prototype.exit = function() {
	this._unbindEvents();
	delete this._$input;
	delete this._$label;
};

sap.m.Input.prototype.getFocusDomRef = function() {
	return jQuery.sap.domById(this.getId() + '-inner');
};

sap.m.Input.prototype.ontouchstart = function(oEvent) {
	//for control who need to know if they should handle events from the input control
	oEvent.originalEvent._sapui_handledByControl = true;
};

sap.m.Input.prototype.onchange = function(oEvent) {
	var oldValue = this.getValue(),
		newValue = this._formatForGetter(this._$input.val());

	if (oEvent.type != "change" && oldValue == newValue) {
		return;
	}

	this.setProperty("value", newValue, true);
	this._setLabelVisibility();

	if (oEvent.type == "input") {
		//TODO: discuss firing live change event for !this._hasChangeEvent
		this.fireLiveChange({
			newValue : newValue
		});
	} else {
		this.fireChange({
			newValue : newValue
		});
	}
};


sap.m.Input.prototype._setLabelVisibility = function() {
	// maybe we don't have label e.g on desktop mode
	if (this._showLabelAsPlaceholder) {
		this._$label.css("display", this.getValue() ? "none" : "inline");
	}
};

sap.m.Input.prototype._unbindEvents = function() {
	if (this._$input instanceof jQuery) {
		this._$input.unbind(".input");
	}
};

// TODO: Why do we only check date picker? for formatting
// What about time picker am/pm
sap.m.Input.prototype._datePickerAvailable = (function() {
	var test = document.createElement("input");
	test.setAttribute("type", "date");
	return (test.type == "date");
})();

// only samsung galaxy android 4.1 has picker but it hangs after selection
sap.m.Input.prototype._hasPickerBug = (function() {
	return jQuery.os.android &&
			!jQuery.browser.chrome &&
			jQuery.os.fVersion == 4.1 &&
			/samsung/i.test(window.navigator.userAgent);
})();

sap.m.Input.prototype._formatForGetter = function(value){
	var oUserDateFormat,
		oStandardDateFormat,
		oDate;
	if ((this.getType() == "Date") && (!this._datePickerAvailable)) {

		oUserDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: this.getDateFormat()});
		oStandardDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "YYYY-MM-dd"});

		oDate = oUserDateFormat.parse(value);
		return oStandardDateFormat.format(oDate);
	}
	return value;
};

sap.m.Input.prototype._formatForRendering = function(value){
	var oUserDateFormat,
		oStandardDateFormat,
		oDate;

	if ((this.getType() == "Date") && (!this._datePickerAvailable))  {

		oUserDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: this.getDateFormat()});
		oStandardDateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern: "YYYY-MM-dd"});

		oDate = oStandardDateFormat.parse(value);
		return oUserDateFormat.format(oDate);
	} else {
		return value;
	}
};