/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Popover.
jQuery.sap.declare("sap.m.Popover");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Popover.
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
 * <li>{@link #getPlacement placement} : sap.m.PlacementType (default: sap.m.PlacementType.Right)</li>
 * <li>{@link #getShowHeader showHeader} : boolean (default: true)</li>
 * <li>{@link #getTitle title} : string</li>
 * <li>{@link #getModal modal} : boolean (default: false)</li>
 * <li>{@link #getOffsetX offsetX} : int (default: 0)</li>
 * <li>{@link #getOffsetY offsetY} : int (default: 0)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getContent content} : sap.ui.core.Control[]</li>
 * <li>{@link #getCustomHeader customHeader} : sap.ui.core.Control</li>
 * <li>{@link #getFooter footer} : sap.ui.core.Control</li></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getLeftButton leftButton} : string | sap.m.Button</li>
 * <li>{@link #getRightButton rightButton} : string | sap.m.Button</li></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.Popover#event:afterOpen afterOpen} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.Popover#event:afterClose afterClose} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.Popover#event:beforeOpen beforeOpen} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li>
 * <li>{@link sap.m.Popover#event:beforeClose beforeClose} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Popover is to present information temporarily but in a way that does not take over the entire screen. The popover content is layered on top of your existing content and it remains visible until the user taps outside of the popover when modal is set to false or you explicitly dismiss it when modal is set to true. The switching between modal and non-modal can also be done when the popover is already opened.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.Popover
 */
sap.ui.core.Control.extend("sap.m.Popover", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"close", "openBy"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"placement" : {type : "sap.m.PlacementType", group : "Behavior", defaultValue : sap.m.PlacementType.Right},
		"showHeader" : {type : "boolean", group : "Appearance", defaultValue : true},
		"title" : {type : "string", group : "Appearance", defaultValue : null},
		"modal" : {type : "boolean", group : "Behavior", defaultValue : false},
		"offsetX" : {type : "int", group : "Appearance", defaultValue : 0},
		"offsetY" : {type : "int", group : "Appearance", defaultValue : 0}
	},
	defaultAggregation : "content",
	aggregations : {
    	"content" : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}, 
    	"customHeader" : {type : "sap.ui.core.Control", multiple : false}, 
    	"footer" : {type : "sap.ui.core.Control", multiple : false}
	},
	associations : {
		"leftButton" : {type : "sap.m.Button", multiple : false}, 
		"rightButton" : {type : "sap.m.Button", multiple : false}
	},
	events : {
		"afterOpen" : {}, 
		"afterClose" : {}, 
		"beforeOpen" : {}, 
		"beforeClose" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.Popover with name <code>sClassName</code> 
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
 * @name sap.m.Popover.extend
 * @function
 */

sap.m.Popover.M_EVENTS = {'afterOpen':'afterOpen','afterClose':'afterClose','beforeOpen':'beforeOpen','beforeClose':'beforeClose'};


/**
 * Getter for property <code>placement</code>.
 * This is the information about on which side will the popover be placed at. Possible values are sap.m.PlacementType.Left, sap.m.PlacementType.Right, sap.m.PlacementType.Top, sap.m.PlacementType.Bottom. The default value is sap.m.PlacementType.Right.
 *
 * Default value is <code>Right</code>
 *
 * @return {sap.m.PlacementType} the value of property <code>placement</code>
 * @public
 * @name sap.m.Popover#getPlacement
 * @function
 */


/**
 * Setter for property <code>placement</code>.
 *
 * Default value is <code>Right</code> 
 *
 * @param {sap.m.PlacementType} oPlacement  new value for property <code>placement</code>
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setPlacement
 * @function
 */

/**
 * Getter for property <code>showHeader</code>.
 * If a header should be shown at the top of the popover.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showHeader</code>
 * @public
 * @name sap.m.Popover#getShowHeader
 * @function
 */


/**
 * Setter for property <code>showHeader</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowHeader  new value for property <code>showHeader</code>
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setShowHeader
 * @function
 */

/**
 * Getter for property <code>title</code>.
 * Title text appears in the header. This property will be ignored when showHeader is set to false.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>title</code>
 * @public
 * @name sap.m.Popover#getTitle
 * @function
 */


/**
 * Setter for property <code>title</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTitle  new value for property <code>title</code>
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setTitle
 * @function
 */

/**
 * Getter for property <code>modal</code>.
 * If the popover will not be closed when tapping outside the popover. It also blocks any interaction with the background. The default value is false.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>modal</code>
 * @public
 * @name sap.m.Popover#getModal
 * @function
 */


/**
 * Setter for property <code>modal</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bModal  new value for property <code>modal</code>
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setModal
 * @function
 */

/**
 * Getter for property <code>offsetX</code>.
 * The offset for the popover placement in the x axis. It's with unit pixel.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>offsetX</code>
 * @public
 * @name sap.m.Popover#getOffsetX
 * @function
 */


/**
 * Setter for property <code>offsetX</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iOffsetX  new value for property <code>offsetX</code>
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setOffsetX
 * @function
 */

/**
 * Getter for property <code>offsetY</code>.
 * The offset for the popover placement in the y axis. It's with unit pixel.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>offsetY</code>
 * @public
 * @name sap.m.Popover#getOffsetY
 * @function
 */


/**
 * Setter for property <code>offsetY</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iOffsetY  new value for property <code>offsetY</code>
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setOffsetY
 * @function
 */
	
/**
 * Getter for aggregation <code>content</code>.<br/>
 * The content inside the popover.
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.Popover#getContent
 * @function
 */

/**
 * Inserts a content into the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *          oContent the content to insert; if empty, nothing is inserted
 * @param {int}
 *             iIndex the <code>0</code>-based index the content should be inserted at; for 
 *             a negative value of <code>iIndex</code>, the content is inserted at position 0; for a value 
 *             greater than the current size of the aggregation, the content is inserted at 
 *             the last position        
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#insertContent
 * @function
 */


/**
 * Adds some content <code>oContent</code> 
 * to the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content to add; if empty, nothing is inserted
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#addContent
 * @function
 */


/**
 * Removes an content from the aggregation named <code>content</code>.
 *
 * @param {int | string | sap.ui.core.Control} vContent the content to remove or its index or id
 * @return {sap.ui.core.Control} the removed content or null
 * @public
 * @name sap.m.Popover#removeContent
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>content</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.Popover#removeAllContent
 * @function
 */


/**
 * Checks for the provided <code>sap.ui.core.Control</code> in the aggregation named <code>content</code> 
 * and returns its index if found or -1 otherwise.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content whose index is looked for.
 * @return {int} the index of the provided control in the aggregation if found, or -1 otherwise
 * @public
 * @name sap.m.Popover#indexOfContent
 * @function
 */


/**
 * Destroys all the content in the aggregation 
 * named <code>content</code>.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#destroyContent
 * @function
 */
	
/**
 * Getter for aggregation <code>customHeader</code>.<br/>
 * Any control that needed to be displayed in the header area. When this is set, the showHeader property is ignored, and only this customHeader is shown on the top of popover.
 * 
 * @return {sap.ui.core.Control}
 * @public
 * @name sap.m.Popover#getCustomHeader
 * @function
 */

/**
 * Setter for the aggregated <code>customHeader</code>.
 * @param oCustomHeader {sap.ui.core.Control}
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setCustomHeader
 * @function
 */


/**
 * Destroys the customHeader in the aggregation 
 * named <code>customHeader</code>.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#destroyCustomHeader
 * @function
 */
	
/**
 * Getter for aggregation <code>footer</code>.<br/>
 * This is optional footer which is shown on the bottom of the popover.
 * 
 * @return {sap.ui.core.Control}
 * @public
 * @name sap.m.Popover#getFooter
 * @function
 */

/**
 * Setter for the aggregated <code>footer</code>.
 * @param oFooter {sap.ui.core.Control}
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setFooter
 * @function
 */


/**
 * Destroys the footer in the aggregation 
 * named <code>footer</code>.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#destroyFooter
 * @function
 */

/**
 * LeftButton is shown at the left edge of the bar in iOS, and at the right side of the bar for the other platforms. Please set this to null if you want to remove the left button from the bar. And the button is only removed from the bar, not destroyed. When showHeader is set to false, this property will be ignored.
 *
 * @return {string} Id of the element which is the current target of the <code>leftButton</code> association, or null
 * @public
 * @name sap.m.Popover#getLeftButton
 * @function
 */


/**
 * LeftButton is shown at the left edge of the bar in iOS, and at the right side of the bar for the other platforms. Please set this to null if you want to remove the left button from the bar. And the button is only removed from the bar, not destroyed. When showHeader is set to false, this property will be ignored.
 *
 * @param {string | sap.m.Button} vLeftButton 
 *    Id of an element which becomes the new target of this <code>leftButton</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setLeftButton
 * @function
 */

/**
 * RightButton is always shown at the right edge of the bar. Please set this to null if you want to remove the right button from the bar. And the button is only removed from the bar, not destroyed. When showHeader is set to false, this property will be ignored.
 *
 * @return {string} Id of the element which is the current target of the <code>rightButton</code> association, or null
 * @public
 * @name sap.m.Popover#getRightButton
 * @function
 */


/**
 * RightButton is always shown at the right edge of the bar. Please set this to null if you want to remove the right button from the bar. And the button is only removed from the bar, not destroyed. When showHeader is set to false, this property will be ignored.
 *
 * @param {string | sap.m.Button} vRightButton 
 *    Id of an element which becomes the new target of this <code>rightButton</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#setRightButton
 * @function
 */

/**
 * This event will be fired after the popover is opened. 
 *
 * @name sap.m.Popover#afterOpen
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Control} oControlEvent.getParameters.openBy This refers to the control which opens the popover.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterOpen' event of this <code>sap.m.Popover</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Popover</code>.<br/> itself. 
 *  
 * This event will be fired after the popover is opened. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Popover</code>.<br/> itself.
 *
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#attachAfterOpen
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'afterOpen' event of this <code>sap.m.Popover</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#detachAfterOpen
 * @function
 */


/**
 * Fire event afterOpen to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'openBy' of type <code>sap.ui.core.Control</code> This refers to the control which opens the popover.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Popover#fireAfterOpen
 * @function
 */

/**
 * This event will be fired after the popover is closed. 
 *
 * @name sap.m.Popover#afterClose
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Control} oControlEvent.getParameters.openBy This refers to the control which opens the popover.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'afterClose' event of this <code>sap.m.Popover</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Popover</code>.<br/> itself. 
 *  
 * This event will be fired after the popover is closed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Popover</code>.<br/> itself.
 *
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#attachAfterClose
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'afterClose' event of this <code>sap.m.Popover</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#detachAfterClose
 * @function
 */


/**
 * Fire event afterClose to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'openBy' of type <code>sap.ui.core.Control</code> This refers to the control which opens the popover.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Popover#fireAfterClose
 * @function
 */

/**
 * This event will be fired before the popover is opened. 
 *
 * @name sap.m.Popover#beforeOpen
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Control} oControlEvent.getParameters.openBy This refers to the control which opens the popover.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'beforeOpen' event of this <code>sap.m.Popover</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Popover</code>.<br/> itself. 
 *  
 * This event will be fired before the popover is opened. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Popover</code>.<br/> itself.
 *
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#attachBeforeOpen
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'beforeOpen' event of this <code>sap.m.Popover</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#detachBeforeOpen
 * @function
 */


/**
 * Fire event beforeOpen to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'openBy' of type <code>sap.ui.core.Control</code> This refers to the control which opens the popover.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Popover#fireBeforeOpen
 * @function
 */

/**
 * This event will be fired before the popover is closed. 
 *
 * @name sap.m.Popover#beforeClose
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @param {sap.ui.core.Control} oControlEvent.getParameters.openBy This refers to the control which opens the popover.
 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'beforeClose' event of this <code>sap.m.Popover</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Popover</code>.<br/> itself. 
 *  
 * This event will be fired before the popover is closed. 
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Popover</code>.<br/> itself.
 *
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#attachBeforeClose
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'beforeClose' event of this <code>sap.m.Popover</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Popover#detachBeforeClose
 * @function
 */


/**
 * Fire event beforeClose to attached listeners.
 * 
 * Expects following event parameters:
 * <ul>
 * <li>'openBy' of type <code>sap.ui.core.Control</code> This refers to the control which opens the popover.</li>
 * </ul>
 *
 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Popover} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Popover#fireBeforeClose
 * @function
 */

/**
 * Close the popover
 *
 * @name sap.m.Popover.prototype.close
 * @function

 * @type void
 * @public
 */


/**
 * Open the popover.
 *
 * @name sap.m.Popover.prototype.openBy
 * @function
 * @param {object} 
 *         oControl
 *         This is the control to which the popover will be placed. It can be not only a UI5 control, but also an existing dom reference. The side of the placement depends on the placement property set in the popover.

 * @type void
 * @public
 */


// Start of sap\m\Popover.js
jQuery.sap.require("sap.ui.core.Popup");
jQuery.sap.require("sap.m.Bar");

/* =========================================================== */
/*                   begin: lifecycle methods                  */
/* =========================================================== */
/**
 * Initializes the popover control
 * @private
 */
sap.m.Popover.prototype.init = function(){
	// The offset of the arrow must be more than _arrowOffsetThreshold from the border of the popover content
	this._arrowOffsetThreshold = 15; // 10 (rounded corner) + 5 (rotate)
	
	this._marginTopInit = false;
	// The following 4 values are the margins which are used to avoid making the popover very near to the border of the screen
	this._marginTop = jQuery.os.ios ? 44 : 48; //This is the default value, and dynamic calculation will be done in afterRendering
	this._marginLeft = 10;
	this._marginRight = 10;
	this._marginBottom = 10;
	
	this._$window = jQuery(window);

	this.oPopup = new sap.ui.core.Popup();
	this.oPopup.setShadow(true);
	this.oPopup.setAutoClose(true);
	this.oPopup.setAnimations(this._openAnimation, this._closeAnimation);
	
	// This is data used to position the popover depending on the placement property
	this._placements = [sap.m.PlacementType.Top, sap.m.PlacementType.Right, sap.m.PlacementType.Bottom, sap.m.PlacementType.Left];
	this._myPositions = ["center bottom", "begin center", "center top", "end center"];
	this._atPositions = ["center top", "end center", "center bottom", "begin center"];
	this._offsets = ["0 -18", "18 0", "0 18", "-18 0"];
	
	this._arrowOffset = 18;
	
	
	// Make this.oPopup call this._setArrowPosition each time after its position is changed
	this._fSetArrowPosition = jQuery.proxy(this._setArrowPosition, this);
	
	//the orientationchange event listener
	this._fOrientationChange = jQuery.proxy(this._onOrientationChange, this);
	
	var that = this;
	this.oPopup._applyPosition = function(oPosition){
		sap.ui.core.Popup.prototype._applyPosition.call(this, oPosition);
		that._fSetArrowPosition();
	}
};

sap.m.Popover.prototype.onBeforeRendering = function() {
	if (this._sResizeListenerId) {
		sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
		this._sResizeListenerId = null;
	}
};	

sap.m.Popover.prototype.onAfterRendering = function(){
	var $openedBy, $page, $header;
	
	//calculate the height of the header in the current page
	//only for the first time calling after rendering
	if(!this._marginTopInit){
		this._marginTop = 2;
		if(this._oOpenBy){
			$openedBy = (this._oOpenBy instanceof sap.ui.core.Control) ? this._oOpenBy.$() : jQuery(this._oOpenBy);
			
			//first check if the openedBy isn't inside a header
			if(!($openedBy.closest("header.sapMBar").length > 0)){
				$page = $openedBy.closest(".sapMPage");
				if($page.length > 0){
					$header = $page.children("header.sapMBar");
					if($header.length > 0){
						this._marginTop += $header.outerHeight();
					}
				}
			}
			this._marginTopInit = true;
		}
	}
};

/**
 * Destroys the popover control
 * @private
 */
sap.m.Popover.prototype.exit = function(){
	this.oPopup.close();
	this.oPopup.destroy();
	this.oPopup = null;
	
	if(this._internalHeader){
		this._internalHeader.destroy();
		this._internalHeader = null;
	}
	
	if(this._headerTitle){
		this._headerTitle.destroy();
	}
	
	if (this._sResizeListenerId) {
		sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
		this._sResizeListenerId = null;
	}
	
	this._$window.unbind("resize", this._fOrientationChange);
};
/* =========================================================== */
/*                   end: lifecycle methods                    */
/* =========================================================== */



/* =========================================================== */
/*                   begin: API method                         */
/* =========================================================== */
/**
 * Opens the popover and set the popover position according to the {placement} property
 * around the {oControl} parameter.
 *
 * @param {object} oControl The control to which the popover is aligned based on the {placement} property
 * @public
 *
 */
sap.m.Popover.prototype.openBy = function(oControl){
	// If already opened with the needed content then return
	var oPopup = this.oPopup,
		oParentDomRef, iPlacePos;
		
	if (oPopup.isOpen()){
		if(this._oOpenBy === oControl) {
			//if the popover is open, and is opening by the same control again, just return
			return;
		}else{
			//if the popover is open, and is opening by another control, then first close it and open later.
			this.close();
			this.$().css("visibility", "hidden");
		}
	}
	
	if(!oControl){
		return;
	}
	
	if(!this._oOpenBy || oControl !== this._oOpenBy){
		this._oOpenBy = oControl;
	}

	this.fireBeforeOpen({openBy: this._oOpenBy});
	
	oPopup.attachEvent("opened", this._handleOpened, this);
	
	// Open popup
	iPlacePos = jQuery.inArray(this.getPlacement(), this._placements);
	if(iPlacePos > -1){
		oParentDomRef = (this._oOpenBy instanceof sap.ui.core.Control) ? this._oOpenBy.getDomRef() : this._oOpenBy;
		oPopup.setContent(this);
		oPopup.setPosition(this._myPositions[iPlacePos], this._atPositions[iPlacePos], oParentDomRef, this._calcOffset(this._offsets[iPlacePos]), "fit");
		var that = this;
		var fCheckAndOpen = function(){
			if(oPopup.getOpenState() === sap.ui.core.OpenState.CLOSING){
				setTimeout(fCheckAndOpen, 150);
			}else{
				oPopup.open();
				//bind the resize event to window
				that._$window.bind("resize", that._fOrientationChange);
			}
		}
		fCheckAndOpen();
	}else{
		jQuery.sap.log.error(this.getPlacement() + "is not a valid value! It can only be top, right, bottom or left");
	}
	
};

/**
 * Closes the popover when it's already opened.
 * @public
 */
sap.m.Popover.prototype.close = function(){
	var eOpenState = this.oPopup.getOpenState();
	if(!(eOpenState === sap.ui.core.OpenState.CLOSED || eOpenState === sap.ui.core.OpenState.CLOSING)){
		this.fireBeforeClose({openBy: this._oOpenBy});
		this.oPopup.close();
	}
};
/* =========================================================== */
/*                     end: API method                         */
/* =========================================================== */


/* =========================================================== */
/*                      begin: event handlers                  */
/* =========================================================== */
sap.m.Popover.prototype._onOrientationChange = function(){
	var ePopupState = this.oPopup.getOpenState();
	if(!(ePopupState === sap.ui.core.OpenState.OPEN)){
		return;
	}
	this.oPopup._applyPosition(this.oPopup._oLastPosition);
};

/**
 * Register the listener to close the popover when user taps outside both of the popover and the control that opens the popover.
 * @private
 */
sap.m.Popover.prototype._handleOpened = function(){
	this.oPopup.detachEvent("opened", this._handleOpened, this);
	this.oPopup.attachEvent("closed", this._handleClosed, this);
	
	//recalculate the arrow position when the size of the popover changes.
	this._sResizeListenerId = sap.ui.core.ResizeHandler.register(this.getDomRef(),  this._fSetArrowPosition);
	
	this.fireAfterOpen({openBy: this._oOpenBy});
};

sap.m.Popover.prototype._handleClosed = function(){
	this.oPopup.detachEvent("closed", this._handleClosed, this);

	if (this._sResizeListenerId) {
		sap.ui.core.ResizeHandler.deregister(this._sResizeListenerId);
		this._sResizeListenerId = null;
	}
	this.fireAfterClose({openBy: this._oOpenBy});
};
/* =========================================================== */
/*                      end: event handlers                  */
/* =========================================================== */



/* =========================================================== */
/*                      begin: internal methods                  */
/* =========================================================== */
sap.m.Popover.prototype._hasNavContent = function(){
	var aContent = this.getAggregation("content");
	if(jQuery.isArray(aContent) && aContent.length === 1 && aContent[0] instanceof sap.m.NavContainer){
		return true;
	}else{
		return false;
	}
};


sap.m.Popover.prototype._calcOffset = function(sOffset){
	var iOffsetX = this.getOffsetX(),
		iOffsetY = this.getOffsetY();
	
	var aParts = sOffset.split(" ");
	return  (parseInt(aParts[0], 10) + iOffsetX) + " " + (parseInt(aParts[1], 10) + iOffsetY);
};

/**
 * Rearrange the arrow and the popover position.
 * @private
 */
sap.m.Popover.prototype._setArrowPosition = function(){
	var ePopupState = this.oPopup.getOpenState();
	if(!(ePopupState === sap.ui.core.OpenState.OPEN || ePopupState === sap.ui.core.OpenState.OPENING)){
		return;
	}

	var $parent = (this._oOpenBy instanceof sap.ui.core.Control) ? this._oOpenBy.$() : jQuery(this._oOpenBy),
		$this = this.$(),
		sPlacement = this.getPlacement(),
		$arrow = jQuery.sap.byId(this.getId() + "-arrow"),
		$offset = $this.offset(),
		iOffsetX = this.getOffsetX(),
		iOffsetY = this.getOffsetY(),
		iWidth = $this.outerWidth(),
		iHeight = $this.outerHeight(),
		iPosArrow;
		
	//calculates the current window borders
	var iWindowLeft = this._$window.scrollLeft(),
		iWindowTop = this._$window.scrollTop(),
		iWindowRight = this._$window.width(),
		iWindowBottom = this._$window.height();
	
	var iMarginLeft = this._marginLeft,
		iMarginRight = this._marginRight,
		iMarginTop = this._marginTop,
		iMarginBottom = this._marginBottom;
	
	//make the popover never cover the control or dom node that opens the popvoer
	switch(sPlacement){
		case sap.m.PlacementType.Left:
			iMarginRight = this._$window.width() - $parent.offset().left + this._arrowOffset - this.getOffsetX();
			break;
		case sap.m.PlacementType.Right:
			iMarginLeft = $parent.offset().left + $parent.outerWidth() + this._arrowOffset + this.getOffsetX();
			break;
		case sap.m.PlacementType.Top:
			iMarginBottom = this._$window.height() - $parent.offset().top + this._arrowOffset - this.getOffsetY();
			break;
		case sap.m.PlacementType.Bottom:
			iMarginTop = $parent.offset().top + $parent.outerHeight() + this._arrowOffset + this.getOffsetY();
			break;
	}
	
	//determines if the popover is crossed the margin along the borders in each direction	
	var bOverLeft = ($offset.left - iWindowLeft) <= iMarginLeft,
		bOverRight = (iWindowRight - $offset.left - iWidth) <= iMarginRight,
		bOverTop = ($offset.top - iWindowTop) <= iMarginTop,
		bOverBottom = (iWindowBottom - $offset.top - iHeight) <= iMarginBottom;
	
	function applyOffset(left, right, top, bottom){
//		var iWidth = $this.outerWidth(),
//			iHeight = $this.outerHeight();
		
		if(sPlacement === sap.m.PlacementType.Left || sPlacement === sap.m.PlacementType.Right){
			if(left){
				$this.css("left", iMarginLeft).css("right", "");
			}
			if(right){
				$this.css("right", iMarginRight).css("left", "");
			}
			if(top && bottom){
				$this.css("top", iMarginTop).css("bottom", "");
			}else{
				if(top){
					$this.css("top", iMarginTop).css("bottom", "");
				}
				if(bottom){
					$this.css("bottom", iMarginBottom).css("top", "");
				}
			}
		}
		if(sPlacement === sap.m.PlacementType.Top || sPlacement === sap.m.PlacementType.Bottom){
			if(top){
				$this.css("top", iMarginTop).css("bottom", "");
			}
			if(bottom){
				$this.css("bottom", iMarginBottom).css("top", "");
			}
			
			if(left && right){
				if(($parent.offset().left + $parent.outerWidth() / 2) < (jQuery(window).width() / 2)){
					$this.css("left", iMarginLeft).css("right", "");
				}else{
					$this.css("right", iMarginRight).css("left", "");
				}
			}else{
				if(left){
					$this.css("left", iMarginLeft).css("right", "");
				}
				if(right){
					$this.css("right", iMarginRight).css("left", "");
				}
			}
		}
	}
		
	switch(sPlacement){
		case sap.m.PlacementType.Left:
			applyOffset(false, bOverRight, bOverTop, bOverBottom);
			break;
		case sap.m.PlacementType.Right:
			applyOffset(bOverLeft, false, bOverTop, bOverBottom);
			break;
		case sap.m.PlacementType.Top:
			applyOffset(bOverLeft, bOverRight, false, bOverBottom);
			break;
		case sap.m.PlacementType.Bottom:
			applyOffset(bOverLeft, bOverRight, bOverTop, false);
			break;
	}
	
	//set arrow offset
	if(sPlacement === sap.m.PlacementType.Left || sPlacement === sap.m.PlacementType.Right){
		iPosArrow = $parent.offset().top - $this.offset().top - parseInt($this.css("border-top-width"))  + iOffsetY + 0.5 * ($parent.outerHeight(false) - $arrow.outerHeight(false));
		iPosArrow = Math.max(iPosArrow, this._arrowOffsetThreshold);
		iPosArrow = Math.min(iPosArrow, iHeight - this._arrowOffsetThreshold - $arrow.outerHeight());
		$arrow.css("top", iPosArrow);
	}else if(sPlacement === sap.m.PlacementType.Top || sPlacement === sap.m.PlacementType.Bottom){
		iPosArrow = $parent.offset().left - $this.offset().left - parseInt($this.css("border-left-width")) + iOffsetX + 0.5 * ($parent.outerWidth(false) - $arrow.outerWidth(false));
		iPosArrow = Math.max(iPosArrow, this._arrowOffsetThreshold);
		iPosArrow = Math.min(iPosArrow, iWidth - this._arrowOffsetThreshold - $arrow.outerWidth());
		$arrow.css("left", iPosArrow);
	}
	
	//set arrow style
	switch(sPlacement){
		case sap.m.PlacementType.Left:
//			$arrow.css("right", parseInt($arrow.css("right"), 10) - parseInt($this.css("border-right-width"), 10));
			$arrow.addClass("sapMPopoverArrRight");
			break;
			
		case sap.m.PlacementType.Right:
//			$arrow.css("left", parseInt($arrow.css("left"), 10) - parseInt($this.css("border-left-width"), 10));
			$arrow.addClass("sapMPopoverArrLeft");
			break;
			
		case sap.m.PlacementType.Top:
//			$arrow.css("bottom", parseInt($arrow.css("bottom"), 10) - parseInt($this.css("border-bottom-width"), 10));
			$arrow.addClass("sapMPopoverArrDown");
			break;
			
		case sap.m.PlacementType.Bottom:
//			$arrow.css("top", parseInt($arrow.css("top"), 10) - parseInt($this.css("border-top-width"), 10));
			$arrow.addClass("sapMPopoverArrUp");
			break;
	}
};


/**
 * Determine if the {oDomNode} is inside the popover or inside the control that opens the popover
 * @private
 */
sap.m.Popover.prototype._isPopupElement = function(oDOMNode) {
	var oParentDomRef = (this._oOpenBy instanceof sap.ui.core.Control) ? this._oOpenBy.getDomRef() : this._oOpenBy;
	return !!(jQuery(oDOMNode).closest(sap.ui.getCore().getStaticAreaRef()).length) || !!(jQuery(oDOMNode).closest(oParentDomRef).length);
};

/**
 * If customHeader is set, this will return the customHeaer. Otherwise it creates a header and put the
 * title and buttons if needed inside, and finally return this newly create header.
 * @private
 */
sap.m.Popover.prototype._getAnyHeader = function(){
	if(this.getCustomHeader()){
		return this.getCustomHeader().addStyleClass("sapMHeader-CTX", true);
	}else{
		if(this.getShowHeader()){
			this._createInternalHeader();
			return this._internalHeader.addStyleClass("sapMHeader-CTX", true);
		}
	}
};

sap.m.Popover.prototype._createInternalHeader = function(){
	if(!this._internalHeader){
		this._internalHeader = new sap.m.Bar(this.getId() + "-intHeader");
		this._internalHeader.setParent(this, "internalHeader", false);
		return true;
	}else{
		return false;
	}
};

sap.m.Popover.prototype._openAnimation = function($Ref, iRealDuration, fnOpened){
	setTimeout(function(){
		$Ref.addClass("sapMPopoverAnimation sapMPopoverTransparent");
		$Ref.css("display", "block");
		// has to be done in a timeout to ensure transition properties are set
		setTimeout(function(){
			$Ref.bind("webkitTransitionEnd", function(){
				$Ref.unbind("webkitTransitionEnd");
				$Ref.removeClass("sapMPopoverAnimation sapMPopoverOpaque");
				fnOpened();
			});
			$Ref.addClass("sapMPopoverOpaque").removeClass("sapMPopoverTransparent");
		}, 0);
	}, 0);
};

sap.m.Popover.prototype._closeAnimation = function($Ref, iRealDuration, fnClose){
	$Ref.addClass("sapMPopoverAnimation sapMPopoverOpaque");
	//// has to be done in a timeout to ensure transition properties are set
	setTimeout(function(){
		$Ref.bind("webkitTransitionEnd", function(){
			$Ref.unbind("webkitTransitionEnd");
			$Ref.removeClass("sapMPopoverAnimation sapMPopoverTransparent");
			fnClose();
		}).addClass("sapMPopoverTransparent").removeClass("sapMPopoverOpaque");
	}, 0);
};
/* =========================================================== */
/*                      end: internal methods                  */
/* =========================================================== */


/* ==================================================== */
/*                      begin: Setters                  */
/* ==================================================== */
/**
 * Set the placement of the popover.
 * @public
 *
 */
sap.m.Popover.prototype.setPlacement = function(sPlacement){
	this.setProperty("placement", sPlacement, true);
	return this;
};

/**
 * The setter of the title property. If you want to show a header in the popover, don't forget to
 * set the {showHeader} to true.
 * @public
 */
sap.m.Popover.prototype.setTitle = function(sTitle){
	if(sTitle){
		this.setProperty("title", sTitle, true);
		if(this._headerTitle){
			this._headerTitle.setText(sTitle);
		}else{
			this._headerTitle = new sap.m.Label(this.getId() + "-title", {
				text: this.getTitle()
			});
			
			this._createInternalHeader();
			
			if(jQuery.os.ios){
				this._internalHeader.addContentMiddle(this._headerTitle);
			}else{
				this._internalHeader.addContentLeft(this._headerTitle);
			}
		}
	}
	
	return this;
};


/**
 * The setter of the cancelButton. If you want to show a cancel button in the popover, don't forget to
 * set the {showHeader} to true.
 * @public
 */
sap.m.Popover.prototype.setLeftButton = function(oButton){
	if(typeof(oButton) === "string"){
		oButton = sap.ui.getCore().byId(oButton);
	}

	var oOldLeftButton = sap.ui.getCore().byId(this.getLeftButton());

	if(oOldLeftButton === oButton){
		return this;
	}
	
	this._createInternalHeader();
	
	if(oButton){
		if(jQuery.os.ios){
			if(oOldLeftButton){
				this._internalHeader.removeAggregation("contentLeft", oOldLeftButton, true);
			}
			this._internalHeader.addAggregation("contentLeft", oButton, true);
		}else{
			if(oOldLeftButton){
				this._internalHeader.removeAggregation("contentRight", oOldLeftButton, true);
			}
			this._internalHeader.insertAggregation("contentRight", oButton, 0, true);
		}
		this._internalHeader.invalidate();
	}else{
		if(jQuery.os.ios){
			this._internalHeader.removeContentLeft(oOldLeftButton);
		}else{
			this._internalHeader.removeContentRight(oOldLeftButton);
		}
	}
	
	this.setAssociation("leftButton", oButton, true);
	return this;
};

/**
 * The setter of the doneButton. If you want to show a done button in the popover, don't forget to
 * set the {showHeader} to true.
 * @public
 */
sap.m.Popover.prototype.setRightButton = function(oButton){
	if(typeof(oButton) === "string"){
		oButton = sap.ui.getCore().byId(oButton);
	}
	
	var oOldRightButton = sap.ui.getCore().byId(this.getRightButton());

	if(oOldRightButton === oButton){
		return this;
	}
	
	this._createInternalHeader();
	
	if(oButton){
		if(oOldRightButton){
			this._internalHeader.removeAggregation("contentRight", oOldRightButton, true);
		}
		this._internalHeader.insertAggregation("contentRight", oButton, 1, true);
		this._internalHeader.invalidate();
	}else{
		this._internalHeader.removeContentRight(oOldRightButton);
	}
	
	this.setAssociation("rightButton", oButton, true);
	return this;
};


sap.m.Popover.prototype.setShowHeader = function(bValue){
	if(bValue === this.getShowHeader() || this.getCustomHeader()){
		return this;
	}
	
	if(bValue){
		//when internal header is created, show header
		//if not, the header will be created when setting title, leftButton, or rightButton
		//the latest time of the header creation before it's rendered is in the renderer, calling get any header.
		if(this._internalHeader){
			this._internalHeader.$().show();
		}
	}else{
		if(this._internalHeader){
			this._internalHeader.$().hide();
		}
	}
	
	//skip the rerendering
	this.setProperty("showHeader", bValue, true);
	
	return this;
};
/**
 * This overwrites the default setter of the property modal to avoid rerendering the whole popover control.
 */
sap.m.Popover.prototype.setModal = function(bModal){
	if(bModal === this.getModal()){
		return this;
	}
	
	this.oPopup.setModal(bModal, "sapMPopoverBLayer");
	this.setProperty("modal", bModal, true);
	
	return this;
};



sap.m.Popover.prototype.setOffsetX = function(iValue){
	var ePopupState = this.oPopup.getOpenState(),
		oLastPosition, iPlacePos;
	
	this.setProperty("offsetX", iValue, true);
	
	if(!(ePopupState === sap.ui.core.OpenState.OPEN)){
		return this;
	}
	
	oLastPosition = this.oPopup._oLastPosition;
	iPlacePos = jQuery.inArray(this.getPlacement(), this._placements);	
	
	if(iPlacePos > -1){
		oLastPosition.offset = this._calcOffset(this._offsets[iPlacePos]);
		this.oPopup._applyPosition(oLastPosition);
	}
	
	return this;
};

sap.m.Popover.prototype.setOffsetY = function(iValue){
	var ePopupState = this.oPopup.getOpenState(),
		oLastPosition, iPlacePos;
	
	this.setProperty("offsetY", iValue, true);
	
	if(!(ePopupState === sap.ui.core.OpenState.OPEN)){
		return this;
	}
	
	oLastPosition = this.oPopup._oLastPosition;
	iPlacePos = jQuery.inArray(this.getPlacement(), this._placements);
	
	if(iPlacePos > -1){
		oLastPosition.offset = this._calcOffset(this._offsets[iPlacePos]);
		this.oPopup._applyPosition(oLastPosition);
	}
	
	return this;
};
/* ==================================================== */
/*                      end: Setters                  */
/* ==================================================== */