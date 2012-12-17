/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.TextArea.
jQuery.sap.declare("sap.m.TextArea");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new TextArea.
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
 * <li>{@link #getRows rows} : int (default: 2)</li>
 * <li>{@link #getCols cols} : int (default: 20)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize</li>
 * <li>{@link #getValue value} : string (default: '')</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getMaxLength maxLength} : int (default: 0)</li>
 * <li>{@link #getValueState valueState} : sap.ui.core.ValueState (default: sap.ui.core.ValueState.None)</li>
 * <li>{@link #getPlaceholder placeholder} : string</li>
 * <li>{@link #getWrapping wrapping} : sap.ui.core.Wrapping</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.TextArea#event:change change} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.TextArea#event:liveChange liveChange} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Enable users to input multi-line text.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.TextArea
 */
sap.ui.core.Control.extend("sap.m.TextArea", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"rows" : {type : "int", group : "Appearance", defaultValue : 2},
		"cols" : {type : "int", group : "Appearance", defaultValue : 20},
		"width" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"height" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"value" : {type : "string", group : "Data", defaultValue : '', bindable : "bindable"},
		"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"maxLength" : {type : "int", group : "Behavior", defaultValue : 0},
		"valueState" : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : sap.ui.core.ValueState.None},
		"placeholder" : {type : "string", group : "Appearance", defaultValue : null},
		"wrapping" : {type : "sap.ui.core.Wrapping", group : "Behavior", defaultValue : null}
	},
	events : {
		"change" : {}, 
		"liveChange" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.TextArea with name <code>sClassName</code> 
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
 * @name sap.m.TextArea.extend
 * @function
 */

sap.m.TextArea.M_EVENTS = {'change':'change','liveChange':'liveChange'};


/**
 * Getter for property <code>rows</code>.
 * Specifies the height of the text area (in lines).
 *
 * Default value is <code>2</code>
 *
 * @return {int} the value of property <code>rows</code>
 * @public
 * @name sap.m.TextArea#getRows
 * @function
 */


/**
 * Setter for property <code>rows</code>.
 *
 * Default value is <code>2</code> 
 *
 * @param {int} iRows  new value for property <code>rows</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setRows
 * @function
 */

/**
 * Getter for property <code>cols</code>.
 * Specifies the width of the textarea (in average character width).
 *
 * Default value is <code>20</code>
 *
 * @return {int} the value of property <code>cols</code>
 * @public
 * @name sap.m.TextArea#getCols
 * @function
 */


/**
 * Setter for property <code>cols</code>.
 *
 * Default value is <code>20</code> 
 *
 * @param {int} iCols  new value for property <code>cols</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setCols
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * Defines the width of the textarea with CSS. This property can overwrite the cols property.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.TextArea#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setWidth
 * @function
 */

/**
 * Getter for property <code>height</code>.
 * Defines the height of the textarea with CSS. This property can overwrite the rows property.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.m.TextArea#getHeight
 * @function
 */


/**
 * Setter for property <code>height</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setHeight
 * @function
 */

/**
 * Getter for property <code>value</code>.
 * Value of the textarea
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>value</code>
 * @public
 * @name sap.m.TextArea#getValue
 * @function
 */


/**
 * Setter for property <code>value</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sValue  new value for property <code>value</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setValue
 * @function
 */

/**
 * Binder for property <code>value</code>.
 *
 * @param {string} sPath path to a property in the model 
 * @param {function} [fnFormatter=null] the formatter function
 * @param {sap.ui.model.BindingMode} [sMode=Default] the binding mode to be used for this property binding (e.g. one way) 
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#bindValue
 * @function
 */


/**
 * Unbinder for property <code>value</code>.
 *
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#unbindValue
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
 * @name sap.m.TextArea#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setEnabled
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Specifies whether or not an element is visible. Invisible textareas are not rendered.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.TextArea#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setVisible
 * @function
 */

/**
 * Getter for property <code>maxLength</code>.
 * Maximum number of characters that user can input. If your value property's length bigger than maxLength then value is not truncated and user can see whole value property but cannot write anymore.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>maxLength</code>
 * @public
 * @name sap.m.TextArea#getMaxLength
 * @function
 */


/**
 * Setter for property <code>maxLength</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iMaxLength  new value for property <code>maxLength</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setMaxLength
 * @function
 */

/**
 * Getter for property <code>valueState</code>.
 * Visualizes warnings or errors related to the textarea field. Possible values: Warning, Error, Success.
 *
 * Default value is <code>None</code>
 *
 * @return {sap.ui.core.ValueState} the value of property <code>valueState</code>
 * @public
 * @name sap.m.TextArea#getValueState
 * @function
 */


/**
 * Setter for property <code>valueState</code>.
 *
 * Default value is <code>None</code> 
 *
 * @param {sap.ui.core.ValueState} oValueState  new value for property <code>valueState</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setValueState
 * @function
 */

/**
 * Getter for property <code>placeholder</code>.
 * Specifies a short hint that describes the expected value of an textarea field.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>placeholder</code>
 * @public
 * @name sap.m.TextArea#getPlaceholder
 * @function
 */


/**
 * Setter for property <code>placeholder</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sPlaceholder  new value for property <code>placeholder</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setPlaceholder
 * @function
 */

/**
 * Getter for property <code>wrapping</code>.
 * The wrap attribute specifies how the text in a text area is to be wrapped when submitted in a form. Possible values are: Soft, Hard, Off.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.Wrapping} the value of property <code>wrapping</code>
 * @public
 * @name sap.m.TextArea#getWrapping
 * @function
 */


/**
 * Setter for property <code>wrapping</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.Wrapping} oWrapping  new value for property <code>wrapping</code>
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#setWrapping
 * @function
 */

/**
 * This event gets fired when the input operation has finished and the value has changed. 
 *
 * @name sap.m.TextArea#change
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.value The new value of the textarea.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'change' event of this <code>sap.m.TextArea</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.TextArea</code>.<br/> itself. 
 *  
 * This event gets fired when the input operation has finished and the value has changed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.TextArea</code>.<br/> itself.
 *
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#attachChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'change' event of this <code>sap.m.TextArea</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#detachChange
 * @function
 */


/**
 * Fire event change to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'value' of type <code>string</code> The new value of the textarea.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.TextArea#fireChange
 * @function
 */

/**
 * This event is fired when the value of the input is changed - e.g. at each keypress 
 *
 * @name sap.m.TextArea#liveChange
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {string} oControlEvent.getParameters.value The new value of the textarea.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'liveChange' event of this <code>sap.m.TextArea</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.TextArea</code>.<br/> itself. 
 *  
 * This event is fired when the value of the input is changed - e.g. at each keypress 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.TextArea</code>.<br/> itself.
 *
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#attachLiveChange
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'liveChange' event of this <code>sap.m.TextArea</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.TextArea#detachLiveChange
 * @function
 */


/**
 * Fire event liveChange to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'value' of type <code>string</code> The new value of the textarea.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.TextArea} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.TextArea#fireLiveChange
 * @function
 */

// Start of sap\m\TextArea.js
/**
 * Detach textarea events if already bounded on before rendering.
 *
 * @private
 */
sap.m.TextArea.prototype.onBeforeRendering = function() {
	this._unbindEvents();
};


/**
 * Attach listeners on after rendering and find iscroll
 *
 * @private
 */
sap.m.TextArea.prototype.onAfterRendering = function() {
	// get reference
	this._$textarea = this.$();

	// bind events
	this._$textarea.on("change input", jQuery.proxy(this._onChange, this));
	if (jQuery.sap.touchEventMode == "ON") {
		if (this._behaviour.INSIDE_SCROLLABLE_WITHOUT_FOCUS) {
			delete this._oIScroll;	// delete iScroll reference
			this._oIScroll = null;	// set null to find iScroll
			this._$textarea.on("touchstart", jQuery.proxy(this._onTouchStart, this));
			this._$textarea.on("touchmove", jQuery.proxy(this._onTouchMove, this));
		}
		else if (this._behaviour.PAGE_NON_SCROLLABLE_AFTER_FOCUS) {
			// stop bubbling to disable iscroll
			this._$textarea.on("touchmove", function(e) {
				if (jQuery(this).is(":focus")) {
					e.stopPropagation();
				}
			});
		}
	} else {
		// in desktop let browser scroll
		this._$textarea.on("mousedown", function(e) {
			e.stopPropagation();
		});
	}
};


/**
 * Detach all the event that we bind onAfterRendering
 *
 * @private
 */
sap.m.TextArea.prototype.exit = function() {
	this._unbindEvents();
};


/**
 * Some browsers let us to scroll inside of the textarea without focusing.
 * Android is very buggy and no touch event is publishing after focus.
 * Android 4.1+ has touch events but page scroll is not possible after
 * we reached the edge(bottom, top) of the textarea
 *
 * @private
 */
sap.m.TextArea.prototype._behaviour = (function() {
	return {
		INSIDE_SCROLLABLE_WITHOUT_FOCUS : jQuery.os.ios || jQuery.os.blackberry || jQuery.browser.chrome,
		PAGE_NON_SCROLLABLE_AFTER_FOCUS : jQuery.os.android && parseFloat(jQuery.os.version) >= 4.1
	};
}());


/**
 * Change listener fires Change or LiveChange event
 *
 * @private
 * @param {jQuery.EventObject} oEvent The event object
 */
sap.m.TextArea.prototype._onChange = function(oEvent) {
	var value = this._$textarea.val();
	this.setProperty("value", value, true);
	if (oEvent.type == "change") {
		this.fireChange({
			value : value
		});
	} else {
		this.fireLiveChange({
			value : value
		});
	}
};


/**
 * On touch start get iscroll and save starting point
 *
 * @private
 * @param {jQuery.EventObject} oEvent The event object
 */
sap.m.TextArea.prototype._onTouchStart = function(oEvent) {
	if (this._oIScroll === null) {
		this._oIScroll = this._getIScroll();
	}
	this._startY = oEvent.touches[0].pageY;
	this._iDirection = 0;
};


/**
 * Touch move listener doing native scroll workaround
 * TODO: Two dimensional scrolling??
 *
 * @private
 * @param {jQuery.EventObject} e The event object
 */
sap.m.TextArea.prototype._onTouchMove = function(oEvent) {
	var textarea = this._$textarea[0],	// dom reference
		pageY = oEvent.touches[0].pageY,
		isTop = textarea.scrollTop <= 0,
		isBottom = textarea.scrollTop + textarea.clientHeight >= textarea.scrollHeight,
		isGoingUp = this._startY > pageY,
		isGoingDown =  this._startY < pageY;
	// update position
	this._startY = pageY;

	// if we reached the edges of textarea then enable page scrolling
	if ((isTop && isGoingDown) || (isBottom && isGoingUp)) {
		var iDirection = (isGoingDown) ? -1 : 1;
		if (!(this._iDirection == iDirection) && this._oIScroll) {
			// set current touch point as iscroll last point
			this._oIScroll.pointY = pageY;
			this._iDirection = iDirection;
		}

		// let page scroll happen
		oEvent.preventDefault();
		return;
	}

	// do not let event bubbling needed for textarea scrolling
	oEvent.stopPropagation();
};


/**
 * Unbind textarea events which are bounded on after rendering
 *
 * @private
 */
sap.m.TextArea.prototype._unbindEvents = function() {
	if (this._$textarea) {
		// remove all possible events, jquery take care unnecessary ones
		this._$textarea.off("change input touchstart touchmove mousedown");
	}
};


/**
 * Search parents and try to find iScroll
 *
 * @private
 * @return {iScroll} iScroll reference or undefined if cannot find
 */
sap.m.TextArea.prototype._getIScroll = function() {
	// is iScroll loaded?
	if (typeof window.iScroll != "function") {
		return;
	}

	// loop the parents and check if any has iscroll
	for (var parent = this; parent = parent.oParent;) {
		var oScroller = parent.getScrollDelegate ? parent.getScrollDelegate()._scroller : null;
		if(oScroller && oScroller instanceof window.iScroll){
			return oScroller;
		}
	}
};
