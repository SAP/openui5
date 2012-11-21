/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Switch.
jQuery.sap.declare("sap.m.Switch");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Switch.
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
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getState state} : boolean (default: false)</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getName name} : string (default: "")</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.Switch#event:change change} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A switch is a user interface control on mobile devices that is used for change between binary states. The user can also drag the button handle or tap to change the state.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.Switch
 */
sap.ui.core.Control.extend("sap.m.Switch", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"state" : {type : "boolean", group : "Misc", defaultValue : false},
		"enabled" : {type : "boolean", group : "Data", defaultValue : true},
		"name" : {type : "string", group : "Misc", defaultValue : ""}
	},
	events : {
		"change" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.Switch with name <code>sClassName</code> 
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
 * @name sap.m.Switch.extend
 * @function
 */

sap.m.Switch.M_EVENTS = {'change':'change'};


/**
 * Getter for property <code>visible</code>.
 * Invisible switches are not rendered
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.Switch#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Switch#setVisible
 * @function
 */

/**
 * Getter for property <code>state</code>.
 * The state of the switch true is "on" or false is "off".
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>state</code>
 * @public
 * @name sap.m.Switch#getState
 * @function
 */


/**
 * Setter for property <code>state</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bState  new value for property <code>state</code>
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Switch#setState
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Whether the switch is enabled.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.m.Switch#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Switch#setEnabled
 * @function
 */

/**
 * Getter for property <code>name</code>.
 * The name to be used in the HTML code for the switch (e.g. for HTML forms that send data to the server via submit).
 *
 * Default value is <code>""</code>
 *
 * @return {string} the value of property <code>name</code>
 * @public
 * @name sap.m.Switch#getName
 * @function
 */


/**
 * Setter for property <code>name</code>.
 *
 * Default value is <code>""</code> 
 *
 * @param {string} sName  new value for property <code>name</code>
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Switch#setName
 * @function
 */

/**
 * Triggered when a switch changes the state. 
 *
 * @name sap.m.Switch#change
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {boolean} oControlEvent.getParameters.state The new state of the switch.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'change' event of this <code>sap.m.Switch</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Switch</code>.<br/> itself. 
 *  
 * Triggered when a switch changes the state. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Switch</code>.<br/> itself.
 *
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Switch#attachChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'change' event of this <code>sap.m.Switch</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Switch#detachChange
 * @function
 */


/**
 * Fire event change to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'state' of type <code>boolean</code> The new state of the switch.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Switch#fireChange
 * @function
 */

// Start of sap\m\Switch.js
sap.m.Switch.prototype._aVEvents = ["_ontouchstart", "_ontouchmove", "_ontouchend", "_ontouchcancel"];
sap.m.Switch.prototype._aEvents = ["ontouchstart", "ontouchmove", "ontouchend", "ontouchcancel"];

// the milliseconds it takes the transition from one state to another
sap.m.Switch.prototype._iTransitionTime = 175;

// a boolean property to indicate android and blackberry style.
sap.m.Switch.prototype._bAndroidStyle = !!(jQuery.os.android || jQuery.os.blackberry);

// a boolean property to indicate if transition or not.
sap.m.Switch.prototype._bTransition = !!(jQuery.os.ios);

/* =========================================================== */
/*                   begin: lifecycle methods                  */
/* =========================================================== */

/**
 * Initialization hook for the switch.
 *
 * @private
 */
sap.m.Switch.prototype.init = function() {
	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	//	switch text translated
	this._sOn = oRb.getText("SWITCH_ON");
	this._sOff = oRb.getText("SWITCH_OFF");

	if (this._bAndroidStyle) {
		this._aVEvents.push("_onswiperight", "_onswipeleft");
		this._aEvents.push("onswiperight", "onswipeleft");
	}
};

/**
 * Required adaptations after rendering.
 *
 * @private
 * @param {jQuery.EventObject} oEvent The event object
 */
sap.m.Switch.prototype.onAfterRendering = function() {

	// bind only if the switch is enabled
	if (this.getEnabled()) {
		this._bindEvents();
	}

	// switch jQuery DOM reference
	this._$Swt = this.$();

	// the maximum offset in x-axis for the switch children elements
	this._iOffsetX = (jQuery.os.ios) ? 1 : (this._bAndroidStyle) ? 7 : 0;

	// switch width
	this._iSwtWidth = this._$Swt.width();

	// switch midpoint
	this._iSwtMp = Math.round(this._iSwtWidth / 2);

	// switch button jQuery DOM reference
	this._$Btn = this._$Swt.children(".sapMSwtBtn");

	// switch button outerWidth
	this._iBtnOuterWidth = this._$Btn.outerWidth(true);

	// switch button width
	this._iBtnWidth = this._$Btn.width();

	// switch button midpoint
	this._iBtnMp = Math.round(this._iBtnOuterWidth / 2);

	// the maximum left position for the switch button
	this._iBtnMaxLeft = (this._iSwtWidth - this._iBtnOuterWidth) + this._iOffsetX;

	// the minimum left position for the switch button
	this._iBtnMinLeft = -this._iOffsetX;

	// checkbox jQuery DOM reference
	this._$Checkbox = this._$Swt.children("input[type=checkbox]");

	if (jQuery.os.ios) {

		// switch text ON jQuery DOM reference
		this._$TextOn = this._$Swt.children('.sapMSwtTextOn');

		// the maximum text indent for the "ON" state
		this._iTextOnIndentMax = 13;

		// the minimum text indent for the "OFF" state
		this._iTextOnIndentMin = -37;

		// switch text OFF jQuery DOM reference
		this._$TextOff = this._$Swt.children('.sapMSwtTextOff');
	}
};

/* =========================================================== */
/*                   end: lifecycle methods                    */
/* =========================================================== */


/* =========================================================== */
/*                      begin: event handlers                  */
/* =========================================================== */

/**
 * Handle the swipe right event happening on the switch.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Switch.prototype._onswiperight = function(oEvent) {
	this.setState(true, true);
};

/**
 * Handle the swipe left event happening on the switch.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Switch.prototype._onswipeleft = function(oEvent) {
	this.setState(false, true);
};

/**
 * Handle the touch start event happening on the switch.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Switch.prototype._ontouchstart = function(oEvent) {
	var oTargetTouch = oEvent.targetTouches[0];

	//	For control who need to know if they should handle
	//	events from the switch control.
	oEvent.originalEvent._sapui_handledByControl = true;

	//	Only process single touches. If there is already a touch
	//	happening or two simultaneous touches, then just ignore them.
	//
	//	Important to note that oEvent.targetTouches.length is related
	//	to the current target DOM element, it could be the control
	//	container or its children elements.
	//
	//	Also note that oEvent.touches.length is related to
	//	the UI-Area because event delegation.
	if (sap.m.touch.countContained(oEvent.touches, this.getId()) > 1) {
		return;
	}

	this._iActiveTouch = oTargetTouch.identifier;

	//	add active state
	this._$Swt.addClass("sapMSwtPressed");

	this._bTempState = this.getState();
	this._iStarTouchPageX = oTargetTouch.pageX;
	this._iCurrentTouchPageX = this._iStarTouchPageX;
	this._iDiffX = this._iStarTouchPageX - this._$Btn.position().left;
	this._bTargetBtn = jQuery(oEvent.target).is(this._$Btn);
	this._bDrag = false;

	if (this._bTransition) {
		this._$Swt.removeClass("sapMSwtTrans");
	}
};

/**
 * Handle the touch move event on the switch.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Switch.prototype._ontouchmove = function(oEvent) {
	var oTouch,
		iTextIndent,
		iTouchPageX,
		iDragDistance,
		iLeftPos,
		iBtnCenter,
		fnTouch = sap.m.touch;

	//	the active touch should always be in the list of touches
	jQuery.sap.assert(fnTouch.find(oEvent.touches, this._iActiveTouch), 'sap.m.Switch.prototype._ontouchmove(): missing touchEnd');

	//	find the active touch
	oTouch = fnTouch.find(oEvent.changedTouches, this._iActiveTouch);

	//	Only respond to the active touch.
	//
	//	In android, only the handle is draggable, not the whole switch inner area.
	if (!oTouch || (this._bAndroidStyle && !this._bTargetBtn)) {
		return;
	}

	iTouchPageX = oTouch.pageX;
	iDragDistance = iTouchPageX - this._iCurrentTouchPageX;
	iLeftPos = (this._bTargetBtn && this._bAndroidStyle) ? iTouchPageX - this._iDiffX : iDragDistance + this._$Btn.position().left;
	iBtnCenter = iLeftPos + this._iBtnMp;

	//	restrict the switch handle button to a maximal and minimal left position during the dragging
	iLeftPos = (iLeftPos > this._iBtnMaxLeft) ? this._iBtnMaxLeft : (iLeftPos < this._iBtnMinLeft) ? this._iBtnMinLeft : iLeftPos;

	this._bDrag = true;
	this._iCurrentTouchPageX = iTouchPageX;

	/* **************************************************************** */
	/* the code below update the switch UI during the dragging process	*/
	/* **************************************************************** */

	if (this._iCurrentLeft === iLeftPos) {
		return;
	}

	this._iCurrentLeft = iLeftPos;

	this._$Btn.css("left", iLeftPos + "px");

	if (iBtnCenter >= this._iSwtMp) {

		if (!this._bTempState) {

			if (this._bAndroidStyle) {
				this._$Btn.attr("data-sap-ui-swt", this._sOn);
			}

			this._bTempState = true;
		}

	} else if (this._bTempState) {

		if (this._bAndroidStyle) {
			this._$Btn.attr("data-sap-ui-swt", this._sOff);
		}

		this._bTempState = false;
	}

	/* iOS require some additional UI changes */

	if (jQuery.os.ios) {
		iTextIndent = parseInt(this._$TextOn.css("text-indent"), 10) + iDragDistance;

		// restrict the switch text "ON" to a maximal and minimal text indent during the dragging
		iTextIndent = (iTextIndent > this._iTextOnIndentMax) ? this._iTextOnIndentMax : (iTextIndent < this._iTextOnIndentMin) ? this._iTextOnIndentMin : iTextIndent;

		this._$TextOn.css({
			width: iLeftPos + this._iBtnWidth + this._iOffsetX,
			textIndent: iTextIndent
		});

		this._$TextOff.width(this._iSwtWidth - (iLeftPos + this._iOffsetX));
	}
};

/**
 * Handle the touch end event on the switch.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Switch.prototype._ontouchend = function(oEvent) {
	var aProp = ["_bTempState", "_iStarTouchPageX", "_iCurrentTouchPageX", "_iDiffX", "_bTargetBtn", "_bDrag", "_iActiveTouch"],
		iLen = aProp.length,
		fnTouch = sap.m.touch,
		i;

	jQuery.sap.assert(typeof this._iActiveTouch !== "undefined", 'sap.m.Switch.prototype._ontouchend(): expect to already be touching');

	// if the touch we're tracking isn't changing here, ignore this touch end event
	if (!fnTouch.find(oEvent.changedTouches, this._iActiveTouch)) {

		// In most cases, our active touch will be in the touches collection,
		// but we can't assert that because occasionally two touch end events can
		// occur at almost the same time with both having empty touches lists.
		return;
	}

	// this is touch end for the touch we're monitoring
	jQuery.sap.assert(!fnTouch.find(oEvent.touches, this._iActiveTouch), 'sap.m.Switch.prototype._ontouchend(): touch ended also still active');

	// remove active state
	this._$Swt.removeClass("sapMSwtPressed");

	// change the state
	(this._bDrag) ? this.setState(this._bTempState, true) :	this.setState(!this._bTempState, true);

	// remove unused properties
	for (i = 0; i < iLen; i++) {
		if (this.hasOwnProperty(aProp[i])) {
			delete this[aProp[i]];
		}
	}
};

/**
 * Handle the touch cancel event on the switch.
 *
 * @param {jQuery.EventObject} oEvent The event object
 * @private
 */
sap.m.Switch.prototype._ontouchcancel = function(oEvent) {
	this._ontouchend(oEvent);
};

/* ============================================================ */
/*                      end: event handlers						*/
/* ============================================================ */


/* =========================================================== */
/*                      begin: internal methods                */
/* =========================================================== */

/**
 * Bind events.
 *
 * @private
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 */
sap.m.Switch.prototype._bindEvents = function() {
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
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 */
sap.m.Switch.prototype._unbindEvents = function() {
	var i;

	for (i = 0; i < this._aVEvents.length; i++) {
		this[this._aEvents[i]] = null;
	}

	return this;
};

/* =========================================================== */
/*                      end: internal methods                  */
/* =========================================================== */


/* =========================================================== */
/*                   begin: API method                         */
/* =========================================================== */

/**
 * Change the switch state between on and off.
 *
 * @param {boolean} bState
 * @public
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 */
sap.m.Switch.prototype.setState = function(bState, bTriggerEvent) {
	var bState,
		sState,
		bNewState,
		a,
		i;

	if (!this.getEnabled() && bTriggerEvent) {
		return this;
	}

	bNewState = !(this.getState() === bState);

	if (bNewState) {
		this.setProperty("state", bState, true); // validation and suppress re-rendering
	}

	if (!(this._$Swt instanceof jQuery)) {
		return this;
	}

	bState = this.getState();
	sState = bState ? this._sOn : this._sOff;

	if (bNewState) {
		if (this._bAndroidStyle) {
			this._$Btn.attr("data-sap-ui-swt", sState);
		}

		this._$Checkbox.attr({
			checked: bState,
			value: sState
		});

		(bState) ? this._$Swt.removeClass("sapMSwtOff").addClass("sapMSwtOn") :	this._$Swt.removeClass("sapMSwtOn").addClass("sapMSwtOff");

		if (bTriggerEvent) {
			if (this._bTransition) {
				jQuery.sap.delayedCall(this._iTransitionTime, this, function _fireChangeDelay(bState) {
					this.fireChange({state:bState});
				}, [bState]);
			} else {
				this.fireChange({state:bState});
			}
		}
	}

	if (this._bTransition) {
		this._$Swt.addClass("sapMSwtTrans");
	}

	// remove all inline style on the switch
	a = [this._$Btn];
	if (jQuery.os.ios) {
		a.push(this._$TextOn, this._$TextOff);
	}

	for (i = 0; i < a.length; i++) {
		a[i].removeAttr("style");
	}

	return this;
};

/**
 * Disable or enable the switch.
 *
 * @param {boolean} bValue
 * @public
 * @return {sap.m.Switch} <code>this</code> to allow method chaining
 */
sap.m.Switch.prototype.setEnabled = function(bValue) {
	if (this.getEnabled() === bValue) {
		return this;
	}

	this.setProperty("enabled", bValue, true);	// validation and suppress re-rendering

	if (this._$Swt instanceof jQuery) {
		(bValue) ? this._bindEvents()._$Swt.removeClass("sapMSwtDisabled") : this._unbindEvents()._$Swt.addClass("sapMSwtDisabled");
		this._$Checkbox.attr("disabled", !bValue);
	}

	return this;
};

/* =========================================================== */
/*                     end: API method                         */
/* =========================================================== */