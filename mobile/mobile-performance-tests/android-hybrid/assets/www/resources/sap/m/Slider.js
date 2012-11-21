/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Slider.
jQuery.sap.declare("sap.m.Slider");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Slider.
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
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: "100%")</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getName name} : string (default: "")</li>
 * <li>{@link #getMin min} : int (default: 0)</li>
 * <li>{@link #getMax max} : int (default: 100)</li>
 * <li>{@link #getStep step} : int (default: 1)</li>
 * <li>{@link #getProgress progress} : boolean (default: true)</li>
 * <li>{@link #getValue value} : int (default: 0)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.Slider#event:change change} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.Slider#event:liveChange liveChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A slider is a user interface control that enables the user to adjust values in a specified numerical range.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.Slider
 */
sap.ui.core.Control.extend("sap.m.Slider", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"stepUp", "stepDown"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"width" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : "100%"},
		"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"name" : {type : "string", group : "Misc", defaultValue : ""},
		"min" : {type : "int", group : "Data", defaultValue : 0},
		"max" : {type : "int", group : "Data", defaultValue : 100},
		"step" : {type : "int", group : "Data", defaultValue : 1},
		"progress" : {type : "boolean", group : "Misc", defaultValue : true},
		"value" : {type : "int", group : "Data", defaultValue : 0}
	},
	events : {
		"change" : {}, 
		"liveChange" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.Slider with name <code>sClassName</code> 
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
 * @name sap.m.Slider.extend
 * @function
 */

sap.m.Slider.M_EVENTS = {'change':'change','liveChange':'liveChange'};


/**
 * Getter for property <code>width</code>.
 * Defines the width of the slider element, this value can be provided in %, em, px… and all possible CSS measures.
 *
 * Default value is <code>"100%"</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.Slider#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>"100%"</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setWidth
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Boolean property to enable the slider.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.m.Slider#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setEnabled
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Defines the visibility for the slider.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.Slider#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setVisible
 * @function
 */

/**
 * Getter for property <code>name</code>.
 * The name property to be used in the HTML code for the slider (e.g. for HTML forms that send data to the server via submit).
 *
 * Default value is <code>""</code>
 *
 * @return {string} the value of property <code>name</code>
 * @public
 * @name sap.m.Slider#getName
 * @function
 */


/**
 * Setter for property <code>name</code>.
 *
 * Default value is <code>""</code> 
 *
 * @param {string} sName  new value for property <code>name</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setName
 * @function
 */

/**
 * Getter for property <code>min</code>.
 * The minimum value of the slider.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>min</code>
 * @public
 * @name sap.m.Slider#getMin
 * @function
 */


/**
 * Setter for property <code>min</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iMin  new value for property <code>min</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setMin
 * @function
 */

/**
 * Getter for property <code>max</code>.
 * The maximum value of the slider.
 *
 * Default value is <code>100</code>
 *
 * @return {int} the value of property <code>max</code>
 * @public
 * @name sap.m.Slider#getMax
 * @function
 */


/**
 * Setter for property <code>max</code>.
 *
 * Default value is <code>100</code> 
 *
 * @param {int} iMax  new value for property <code>max</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setMax
 * @function
 */

/**
 * Getter for property <code>step</code>.
 * Define the size of every one step the slider takes between min and max.
 * 
 * The step needs to be a positive integer; if a negative number is provider, the default value will take place.
 * 
 * If the width of the slider converted to pixels is less than the range (max – min), the value will be rounded to multiples of the step size.
 *
 * Default value is <code>1</code>
 *
 * @return {int} the value of property <code>step</code>
 * @public
 * @name sap.m.Slider#getStep
 * @function
 */


/**
 * Setter for property <code>step</code>.
 *
 * Default value is <code>1</code> 
 *
 * @param {int} iStep  new value for property <code>step</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setStep
 * @function
 */

/**
 * Getter for property <code>progress</code>.
 * Show a progress bar for the slider.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>progress</code>
 * @public
 * @name sap.m.Slider#getProgress
 * @function
 */


/**
 * Setter for property <code>progress</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bProgress  new value for property <code>progress</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setProgress
 * @function
 */

/**
 * Getter for property <code>value</code>.
 * Define the value of the slider. If this value is lower than the minimum permited, the minimum will be override the value, or if the value is higher than maximun, the maximum will be override the value.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>value</code>
 * @public
 * @name sap.m.Slider#getValue
 * @function
 */


/**
 * Setter for property <code>value</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iValue  new value for property <code>value</code>
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#setValue
 * @function
 */

/**
 * This event is triggered after the end user finishes interacting, if there is any change. 
 *
 * @name sap.m.Slider#change
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {int} oControlEvent.getParameters.value The current value of the slider after a change.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'change' event of this <code>sap.m.Slider</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Slider</code>.<br/> itself. 
 *  
 * This event is triggered after the end user finishes interacting, if there is any change. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Slider</code>.<br/> itself.
 *
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#attachChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'change' event of this <code>sap.m.Slider</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#detachChange
 * @function
 */


/**
 * Fire event change to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'value' of type <code>int</code> The current value of the slider after a change.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Slider#fireChange
 * @function
 */

/**
 * This event is triggered during the dragging period, each time the slider value changes. 
 *
 * @name sap.m.Slider#liveChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {int} oControlEvent.getParameters.value The current value of the slider after a live change.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'liveChange' event of this <code>sap.m.Slider</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Slider</code>.<br/> itself. 
 *  
 * This event is triggered during the dragging period, each time the slider value changes. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Slider</code>.<br/> itself.
 *
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#attachLiveChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'liveChange' event of this <code>sap.m.Slider</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Slider#detachLiveChange
 * @function
 */


/**
 * Fire event liveChange to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'value' of type <code>int</code> The current value of the slider after a live change.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Slider#fireLiveChange
 * @function
 */

/**
 * Changes the slider’s value by the value given in the step attribute, multiplied by n.
 * 
 * The default value for n is 1.
 *
 * @name sap.m.Slider.prototype.stepUp
 * @function
 * @param {int} 
 *         iN
 *         The number of steps the slider goes up.

 * @type void
 * @public
 */


/**
 * Changes the slider’s value by the value given in the step attribute, multiplied by n.
 * 
 * The default value for n is 1.
 *
 * @name sap.m.Slider.prototype.stepDown
 * @function
 * @param {int} 
 *         iN
 *         The number of steps the slider goes down.

 * @type void
 * @public
 */


// Start of sap\m\Slider.js
jQuery.sap.require("sap.ui.core.EnabledPropagator");

sap.m.Slider.prototype._aVEvents = ["_ontouchstart", "_ontouchmove", "_ontouchend"];
sap.m.Slider.prototype._aEvents = ["ontouchstart", "ontouchmove", "ontouchend"];

/* =========================================================== */
/*                   begin: lifecycle methods                  */
/* =========================================================== */

/**
 * Required adaptations before rendering.
 *
 * @private
 */
sap.m.Slider.prototype.onBeforeRendering = function() {
	var iMax = this.getMax(),
		iMin = this.getMin(),
		iStep = this.getStep(),
		bMinbiggerThanMax = false,
		bError = false;

	/**
	 *	functional dependencies:
	 *
	 *	min				-> max
	 *	max				-> min
	 *
	 *	max, min		-> step
	 *	max, min, step	-> value
	 *
	 */

	// if the minimum is lower than or equal to the maximum, log a warning
	if (iMin >= iMax) {
		bMinbiggerThanMax = true;
		bError = true;
		jQuery.sap.log.warning("Property wrong min: " + iMin + " >= max: " + iMax + " on " + this);
	}

	// if the step is negative set to 1 and log a warning
	if (iStep < 1) {
		jQuery.sap.log.warning("The step could not be negative on " + this);
		iStep = 1;

		// update the step to 1 and suppress re-rendering
		this.setProperty("step", iStep, true);
	}

	// the step can't be bigger than slider range, log a warning
	if ((iStep > (iMax - iMin)) && !bMinbiggerThanMax) {
		bError = true;
		jQuery.sap.log.warning("Property wrong step: " + iStep + " > max: " + iMax + " - " + "min: " + iMin + " on " + this);
	}

	// update the value only if there aren't errors
	if (!bError) {
		this.setValue(this.getValue());

		// this is the current % value for the slider progress bar
		this.iProgressValue = this._getPercentageFromValue(this.getValue());
	}
};

/**
 * Required adaptations after rendering.
 *
 * @private
 * @param {jQuery.EventObject} oEvent The event object
 */
sap.m.Slider.prototype.onAfterRendering = function() {

	// bind only if the slider is enabled
	(this.getEnabled()) ? this._bindEvents() : this._unbindEvents();

	// slider control container jQuery selector
	this._$SldContainer = this.$();

	// slider jQuery selector
	this._$Sld = this._$SldContainer.children(".sapMSld");

	// thumb jQuery selector
	this._$Thumb = this._$Sld.children(".sapMSldThumb");

	// native input type range jQuery selector
	this._$Input = this._$SldContainer.children("input[type=range]");
};

/* =========================================================== */
/*                   end: lifecycle methods                    */
/* =========================================================== */


/* =========================================================== */
/*                      begin: event handlers                  */
/* =========================================================== */

/**
 * Handle the touch start event happening on the slider.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Slider.prototype._ontouchstart = function(oEvent) {
	var $Target = jQuery(oEvent.target),
		iMin = this.getMin(),
		iValue;

	//	for control who need to know if they should handle events from the slider control
	oEvent.originalEvent._sapui_handledByControl = true;

	if (oEvent.targetTouches.length > 1) {		// suppress multiTouch events
		return;
	}

	// update the slider measures, those values may change in orientation change
	this._calcMeasures();

	// initialization
	this._iDiffX = this._fSldPaddingRight;
	this._iStartValue = this.getValue();

	// add active state
	this._$Sld.addClass("sapMSldPressed");

	if ($Target.is(this._$Thumb) || $Target.parent().is(this._$Thumb)) {	// if the target is the slider thumb

		/*  This property is needed only by the ontouchmove handle.
			When a touch start event occurs, its value is calculated
			by subtracting the thumb position left from the slider
			control target pageX.
			This is the necessary amount to be subtracted when the
			ontouchmove	event handle is fired.
			The result is a better dragging experience that behaves
			much more in the way that the user expects. */
		this._iDiffX = oEvent.targetTouches[0].pageX - this._$Thumb.offset().left;
	} else {
		iValue = Math.round((((oEvent.targetTouches[0].pageX - this._fSldPaddingRight - this._iSldOffsetLeft) / this._iSldWidth) * (this.getMax() - iMin)) +  iMin);

		// update the slider value
		this.setValue(iValue);
	}
};

/**
 * Handle the touch move event on the slider.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Slider.prototype._ontouchmove = function(oEvent) {
	var iMin = this.getMin(),
		iValue = this.getValue(),
		iNewValue = Math.round((((oEvent.targetTouches[0].pageX - this._iDiffX - this._iSldOffsetLeft) / this._iSldWidth) * (this.getMax() - iMin)) +  iMin);

	// validate, update the the slider value and the UI
	this.setValue(iNewValue);

	// new value validated
	iNewValue = this.getValue();

	if (iValue !== iNewValue) {
		this.fireLiveChange({value:iNewValue});
	}
};

/**
 * Handle the touch end event on the slider.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Slider.prototype._ontouchend = function() {

	// remove active state
	this._$Sld.removeClass("sapMSldPressed");

	if (this._iStartValue !== this.getValue()) {	// if the value if not the same
		this.fireChange({value:this.getValue()});
	}

	// remove unused properties
	delete this._iDiffX;
	delete this._iStartValue;
};

/* ============================================================ */
/*                      end: event handlers                  	*/
/* ============================================================ */


/* =========================================================== */
/*                      begin: internal methods                */
/* =========================================================== */

// configuration data
sap.m.Slider.prototype._sBackgroundSizeRemainder = (function() {
	switch (jQuery.os.os) {
	case "ios":
		return "% 0.4375em, 100%";
		break;
	case "android":
	case "blackberry":
		return "% 0.1875em";
		break;

	// no default
	};
})();

/**
 * Calculate slider measures.
 *
 * @private
 */
sap.m.Slider.prototype._calcMeasures = function() {

	// slider width
	this._iSldWidth = this._$SldContainer.width();

	// slider padding right
	this._fSldPaddingRight = parseFloat(this._$SldContainer.css("padding-right"), 10);

	// slider offset left
	this._iSldOffsetLeft = this._$SldContainer.offset().left;

	// thumb width
	this._iThumbWidth = this._$Thumb.width();
};

/**
 * Bind events.
 *
 * @private
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 */
sap.m.Slider.prototype._bindEvents = function() {
	var i;

	for (i = 0; i < this._aVEvents.length; i++) {
		this[this._aEvents[i]] = this[this._aVEvents[i]];
	}

	return this;
};

/**
 * Unbind events.
 *
 * @private
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 */
sap.m.Slider.prototype._unbindEvents = function() {
	var i;

	for (i = 0; i < this._aVEvents.length; i++) {
		this[this._aEvents[i]] = null;
	}

	return this;
};

/**
 * Calculate percentage.
 *
 * @param {int} iValue the value from the slider
 * @private
 * @returns {int} percent
 */
sap.m.Slider.prototype._getPercentageFromValue = function(iValue) {
	var iMin = this.getMin();
	// never round this number
	return ((iValue - iMin) / (this.getMax() - iMin)) * 100;
};

sap.m.Slider.prototype._validateStep = function(n) {
	return (typeof n === "undefined") ? 1 : this.validateProperty("value", n);
};

/* =========================================================== */
/*                      end: internal methods                  */
/* =========================================================== */


/* =========================================================== */
/*                   begin: API method                         */
/* =========================================================== */

sap.m.Slider.prototype.stepUp = function(n) {
	return this.setValue(this.getValue() + (this._validateStep(n) * this.getStep()));
};

sap.m.Slider.prototype.stepDown = function(n) {
	return this.setValue(this.getValue() - (this._validateStep(n) * this.getStep()));
};

/**
 * Change the slider value.
 *
 * @param {float} value
 * @public
 * @return {sap.m.Slider} <code>this</code> to allow method chaining
 */
sap.m.Slider.prototype.setValue = function(iValue) {
	var iMax = this.getMax(),
		iMin = this.getMin(),
		iStep = this.getStep(),
		iCurrentVal = this.getValue(),
		iRemainder = Math.abs(iValue % iStep),
		iPerValue;

	iValue = this.validateProperty("value", iValue);

	// round the value to the nearest step
	iValue = (iRemainder >= iStep / 2) ? iValue + iStep - iRemainder : iValue - iRemainder;

	// validate that the value is between maximum and minimum
	iValue = (iValue > iMax) ? iMax : (iValue < iMin) ? iMin : iValue;

	// update the value and suppress re-rendering
	this.setProperty("value", iValue, true);

	// if the value if the same, suppress DOM modifications and event fire
	if (iCurrentVal === this.getValue()) {
		return this;
	}

	if (this._$Sld instanceof jQuery) {

		// update the input type range value
		this._$Input.attr("value", iValue);

		iPerValue = this._getPercentageFromValue(iValue);

		if (this.getProgress()) {

			// update the progress bar value
			this._$Sld.css("-webkit-background-size", iPerValue + this._sBackgroundSizeRemainder);
		}

		// update the thumb position
		this._$Thumb.css("left", iPerValue + "%");
	}

	return this;
};

/* =========================================================== */
/*                     end: API method                         */
/* =========================================================== */