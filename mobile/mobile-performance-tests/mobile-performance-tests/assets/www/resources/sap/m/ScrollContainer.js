/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.ScrollContainer.
jQuery.sap.declare("sap.m.ScrollContainer");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new ScrollContainer.
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
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: 'auto')</li>
 * <li>{@link #getHeight height} : sap.ui.core.CSSSize (default: 'auto')</li>
 * <li>{@link #getHorizontal horizontal} : boolean (default: true)</li>
 * <li>{@link #getVertical vertical} : boolean (default: false)</li></ul>
 * </li>
 * <li>Aggregations
 * <ul>
 * <li>{@link #getContent content} : sap.ui.core.Control[]</li></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * The ScrollContainer is a control that can display arbitrary content within a limited screen area and provides touch scrolling to make all content accessible.
 * 
 * Note that it is not recommended to have nested scrolling areas that scroll into the same direction (e.g. a ScrollContainer that scrolls vertically inside a Page control with scrolling enabled). This is currently not considered a valid use-case of a good UI and the behavior will feel wrong.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.ScrollContainer
 */
sap.ui.core.Control.extend("sap.m.ScrollContainer", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"scrollTo"
	],

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'},
		"height" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'},
		"horizontal" : {type : "boolean", group : "Behavior", defaultValue : true},
		"vertical" : {type : "boolean", group : "Behavior", defaultValue : false}
	},
	defaultAggregation : "content",
	aggregations : {
    	"content" : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
	}
}});


/**
 * Creates a new subclass of class sap.m.ScrollContainer with name <code>sClassName</code> 
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
 * @name sap.m.ScrollContainer.extend
 * @function
 */


/**
 * Getter for property <code>visible</code>.
 * Invisible scroll containers are not rendered
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.ScrollContainer#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.ScrollContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ScrollContainer#setVisible
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * The width of the ScrollContainer.
 * If not set, it consumes the complete available width, behaving like normal HTML block elements. If only vertical scrolling is enabled, make sure the content always fits or wraps.
 *
 * Default value is <code>auto</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.ScrollContainer#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>auto</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.ScrollContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ScrollContainer#setWidth
 * @function
 */

/**
 * Getter for property <code>height</code>.
 * The height of the ScrollContainer.
 * By default the height equals the content height. If only horizontal scrolling is used, do not set the height or make sure the height is always larger than the height of the content.
 * 
 * Note that when a percentage is given, for the height to work as expected, the height of the surrounding container must be defined.
 *
 * Default value is <code>auto</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>height</code>
 * @public
 * @name sap.m.ScrollContainer#getHeight
 * @function
 */


/**
 * Setter for property <code>height</code>.
 *
 * Default value is <code>auto</code> 
 *
 * @param {sap.ui.core.CSSSize} sHeight  new value for property <code>height</code>
 * @return {sap.m.ScrollContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ScrollContainer#setHeight
 * @function
 */

/**
 * Getter for property <code>horizontal</code>.
 * Whether horizontal scrolling should be possible.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>horizontal</code>
 * @public
 * @name sap.m.ScrollContainer#getHorizontal
 * @function
 */


/**
 * Setter for property <code>horizontal</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bHorizontal  new value for property <code>horizontal</code>
 * @return {sap.m.ScrollContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ScrollContainer#setHorizontal
 * @function
 */

/**
 * Getter for property <code>vertical</code>.
 * Whether vertical scrolling should be possible.
 * 
 * Note that this is off by default because typically a Page is used as fullscreen element which can handle vertical scrolling. If this is not the case and vertical scrolling is required, this flag needs to be set to "true".
 * Important: it is not supported to have nested controls that both enable scrolling into the same dimension.
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>vertical</code>
 * @public
 * @name sap.m.ScrollContainer#getVertical
 * @function
 */


/**
 * Setter for property <code>vertical</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bVertical  new value for property <code>vertical</code>
 * @return {sap.m.ScrollContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ScrollContainer#setVertical
 * @function
 */
	
/**
 * Getter for aggregation <code>content</code>.<br/>
 * The content of the ScrollContainer.
 * 
 * @return {sap.ui.core.Control[]}
 * @public
 * @name sap.m.ScrollContainer#getContent
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
 * @return {sap.m.ScrollContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ScrollContainer#insertContent
 * @function
 */


/**
 * Adds some content <code>oContent</code> 
 * to the aggregation named <code>content</code>.
 *
 * @param {sap.ui.core.Control}
 *            oContent the content to add; if empty, nothing is inserted
 * @return {sap.m.ScrollContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ScrollContainer#addContent
 * @function
 */


/**
 * Removes an content from the aggregation named <code>content</code>.
 *
 * @param {int | string | sap.ui.core.Control} vContent the content to remove or its index or id
 * @return {sap.ui.core.Control} the removed content or null
 * @public
 * @name sap.m.ScrollContainer#removeContent
 * @function
 */


/**
 * Removes all the controls in the aggregation named <code>content</code>.<br/>
 * Additionally unregisters them from the hosting UIArea.
 * @return {sap.ui.core.Control[]} an array of the removed elements (might be empty)
 * @public
 * @name sap.m.ScrollContainer#removeAllContent
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
 * @name sap.m.ScrollContainer#indexOfContent
 * @function
 */


/**
 * Destroys all the content in the aggregation 
 * named <code>content</code>.
 * @return {sap.m.ScrollContainer} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.ScrollContainer#destroyContent
 * @function
 */

/**
 * Scrolls to the given position.
 * When called while the control is not rendered (yet), the scrolling position is still applied, but there is no animation.
 *
 * @name sap.m.ScrollContainer.prototype.scrollTo
 * @function
 * @param {int} 
 *         iX
 *         The horizontal pixel position to scroll to.
 * Scrolling to the right happens with positive values.
 * If only vertical scrolling is enabled, give 0 as value.
 * @param {int} 
 *         iY
 *         The vertical pixel position to scroll to.
 * Scrolling down happens with positive values.
 * If only horizontal scrolling is enabled, give 0 as value.
 * @param {int} 
 *         iTime
 *         The duration of animated scrolling.
 * To scroll immediately without animation, give 0 as value. 0 is also the default value, when this optional parameter is omitted.

 * @type sap.m.ScrollContainer
 * @public
 */


// Start of sap\m\ScrollContainer.js

/*
 * Better nested scrolling capabilities can be added to iScroll like this (in the _move method).
 * eDir is the direction into which scrolling is handled (if locked) and bOutside is true when we are outside the scolling boundary already; both
 * need to be initialized a couple of lines before this code.
 * 
 * 		e._handled = e._handled || {};
 *		if (e._handled[eDir]) { // current direction already handled
 *			return;
 *		}
 *		
 *		// add information about what this handler handles
 *		e._handled.x = e._handled.x || ((eDir == "x") && !bOutside);
 *		e._handled.y = e._handled.y || ((eDir == "y") && !bOutside);
 *		
 */

/*
 * TODO:
 * - events when scrolling is ongoing
 */


sap.m.ScrollContainer.prototype.init = function() {
	jQuery.sap.require("sap.ui.core.delegate.ScrollEnablement");
	this._oScroller = new sap.ui.core.delegate.ScrollEnablement(this, this.getId() + "-scroll", {
		horizontal: true,
		vertical: false,
		zynga: false,
		preventDefault: false,
		nonTouchScrolling: true
	});
	// TODO: do the resize listening only when ScrollContainer becomes visible and unbind when getting visible
};

sap.m.ScrollContainer.prototype.onBeforeRendering = function() {
	// properties are not known during init
	this._oScroller.setHorizontal(this.getHorizontal());
	this._oScroller.setVertical(this.getVertical());
};


/**
 * Called when the control is destroyed.
 *
 * @private
 */
sap.m.ScrollContainer.prototype.exit = function() {
	if(this._oScroller){
		this._oScroller.destroy();
		this._oScroller = null;
	}
};



//*** API Methods ***

sap.m.ScrollContainer.prototype.scrollTo = function(x, y, time) {
	if (this._oScroller){
		if(this.getDomRef()) { // only if rendered
			this._oScroller.scrollTo(x, y, time);
		} else {
			this._oScroller._scrollX = x; // remember for later rendering
			this._oScroller._scrollY = y;
		}
	}
	return this;
};


sap.m.ScrollContainer.prototype.setHorizontal = function(horizontal) {
	this._oScroller.setHorizontal(horizontal);
	this.setProperty("horizontal", horizontal, true); // no rerendering
};

sap.m.ScrollContainer.prototype.setVertical = function(vertical) {
	this._oScroller.setVertical(vertical);
	this.setProperty("vertical", vertical, true); // no rerendering
};
