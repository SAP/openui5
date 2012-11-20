/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Button.
jQuery.sap.declare("sap.m.Button");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Button.
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
 * <li>{@link #getText text} : string</li>
 * <li>{@link #getType type} : sap.m.ButtonType (default: sap.m.ButtonType.Default)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getIcon icon} : sap.ui.core.URI</li>
 * <li>{@link #getIconFirst iconFirst} : boolean (default: true)</li>
 * <li>{@link #getActiveIcon activeIcon} : sap.ui.core.URI</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul></ul>
 * </li>
 * <li>Events
 * <ul>
 * <li>{@link sap.m.Button#event:tap tap} : fnListenerFunction or [fnListenerFunction, oListenerObject] or [oData, fnListenerFunction, oListenerObject]</li></ul>
 * </li>
 * </ul> 

 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Enables users to trigger actions. For the button UI, you can define some text or an icon, or both.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.Button
 */
sap.ui.core.Control.extend("sap.m.Button", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"text" : {type : "string", group : "Misc", defaultValue : null},
		"type" : {type : "sap.m.ButtonType", group : "Appearance", defaultValue : sap.m.ButtonType.Default},
		"width" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},
		"enabled" : {type : "boolean", group : "Behavior", defaultValue : true},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"icon" : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : null},
		"iconFirst" : {type : "boolean", group : "Appearance", defaultValue : true},
		"activeIcon" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null}
	},
	events : {
		"tap" : {}
	}
}});


/**
 * Creates a new subclass of class sap.m.Button with name <code>sClassName</code> 
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
 * @name sap.m.Button.extend
 * @function
 */

sap.m.Button.M_EVENTS = {'tap':'tap'};


/**
 * Getter for property <code>text</code>.
 * Button text
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.m.Button#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#setText
 * @function
 */

/**
 * Getter for property <code>type</code>.
 * Type of a button (e.g. default, accept, reject, back, icon, etc.)
 *
 * Default value is <code>Default</code>
 *
 * @return {sap.m.ButtonType} the value of property <code>type</code>
 * @public
 * @name sap.m.Button#getType
 * @function
 */


/**
 * Setter for property <code>type</code>.
 *
 * Default value is <code>Default</code> 
 *
 * @param {sap.m.ButtonType} oType  new value for property <code>type</code>
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#setType
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * Defines the width of the button.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.Button#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#setWidth
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Boolean property to enable the control (default is true). Buttons that are disabled have other colors than enabled ones, depending on custom settings
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.m.Button#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#setEnabled
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Invisible buttons are not rendered
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.Button#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#setVisible
 * @function
 */

/**
 * Getter for property <code>icon</code>.
 * Icon to be displayed as graphical element within the button.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>icon</code>
 * @public
 * @name sap.m.Button#getIcon
 * @function
 */


/**
 * Setter for property <code>icon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sIcon  new value for property <code>icon</code>
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#setIcon
 * @function
 */

/**
 * Getter for property <code>iconFirst</code>.
 * If set to true (default), the display sequence is 1. icon 2. control text
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>iconFirst</code>
 * @public
 * @name sap.m.Button#getIconFirst
 * @function
 */


/**
 * Setter for property <code>iconFirst</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bIconFirst  new value for property <code>iconFirst</code>
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#setIconFirst
 * @function
 */

/**
 * Getter for property <code>activeIcon</code>.
 * The source property when this icon is tapped. Graphical element is changed to the new source as long as the icon is tapped.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>activeIcon</code>
 * @public
 * @name sap.m.Button#getActiveIcon
 * @function
 */


/**
 * Setter for property <code>activeIcon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sActiveIcon  new value for property <code>activeIcon</code>
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#setActiveIcon
 * @function
 */

/**
 * Event is fired when the user taps the control.
 *  
 *
 * @name sap.m.Button#tap
 * @event
 * @param {sap.ui.base.Event} oControlEvent
 * @param {sap.ui.base.EventProvider} oControlEvent.getSource
 * @param {object} oControlEvent.getParameters

 * @public
 */
 
/**
 * Attach event handler <code>fnFunction</code> to the 'tap' event of this <code>sap.m.Button</code>.<br/>.
 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener<code> if specified
 * otherwise to this <code>sap.m.Button</code>.<br/> itself. 
 *  
 * Event is fired when the user taps the control.
 *  
 *
 * @param {object}
 *            [oData] An application specific payload object, that will be passed to the event handler along with the event object when firing the event.
 * @param {function}
 *            fnFunction The function to call, when the event occurs.  
 * @param {object}
 *            [oListener=this] Context object to call the event handler with. Defaults to this <code>sap.m.Button</code>.<br/> itself.
 *
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#attachTap
 * @function
 */


/**
 * Detach event handler <code>fnFunction</code> from the 'tap' event of this <code>sap.m.Button</code>.<br/>
 *
 * The passed function and listener object must match the ones used for event registration.
 *
 * @param {function}
 *            fnFunction The function to call, when the event occurs.
 * @param {object}
 *            oListener Context object on which the given function had to be called.
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Button#detachTap
 * @function
 */


/**
 * Fire event tap to attached listeners.

 * @param {Map} [mArguments] the arguments to pass along with the event.
 * @return {sap.m.Button} <code>this</code> to allow method chaining
 * @protected
 * @name sap.m.Button#fireTap
 * @function
 */

// Start of sap\m\Button.js
jQuery.sap.require("sap.ui.core.EnabledPropagator");


/**
 * Function is called to define the behavior for the control.
 * 
 * @private
 */
/*
 * sap.m.Button.prototype.init = function() { };
 */


/**
 * Function is called when exiting the control.
 * 
 * @private
 */
sap.m.Button.prototype.exit = function(oEvent) {
	// destroy image controls if initialized
	if (this._image) {
		this._image.destroy();
	}
	if (this._imageBtn) {
		this._imageBtn.destroy();
	}
};


/**
 * Function is called when touchstart occurs on button .
 * 
 * @private
 */
sap.m.Button.prototype.ontouchstart = function(oEvent) {
	// for control who need to know if they should handle events from the button control
	oEvent.originalEvent._sapui_handledByControl = true;
	// active handling for android/blackberry
	if (jQuery.os.android || jQuery.os.blackberry) {
		this.$().addClass("sapMBtnActive");
	}
	// handling active icon
	if (this.getEnabled()) {
		if (this.getIcon() && this.getActiveIcon()) {
			this._image.setSrc(this.getActiveIcon());
		}
	}
};


/**
 * Function is called when touchend occurs on button .
 * 
 * @private
 */
sap.m.Button.prototype.ontouchend = function(oEvent) {
	// active handling for android/blackberry
	if (jQuery.os.android|| jQuery.os.blackberry) {
		this.$().removeClass("sapMBtnActive");
	}
	// handling active icon
	if (this.getEnabled()) {
		if (this.getIcon() && this.getActiveIcon()) {
			this._image.setSrc(this.getIcon());
		}
	}
	// fire tap event
	if (this.getEnabled()) {
		this.fireTap({/* no parameters */});
	}	
};


/**
 * Function is called when image control needs to be loaded.
 * 
 * @private
 */
sap.m.Button.prototype._getImage = function(sImgId, sSrc, sActiveSrc) {
	var oImage = this._image;
	if(oImage) {
		oImage.setSrc(sSrc);
		oImage.setActiveSrc(sActiveSrc);
	} else {
		oImage = new sap.m.Image(sImgId, {
			src : sSrc,
			activeSrc: sActiveSrc
		}).addStyleClass("sapMBtnCustomIcon").setParent(this, null, true);
	}
	return this._image = oImage;
};


/**
 * Function is called when internal image control needs to be loaded.
 * 
 * @private
 */
sap.m.Button.prototype._getImageBtn = function(sImgId, sSrc, sHeight, sWidth) {
	var oImage = this._imageBtn;
	if(oImage) {
		oImage.setSrc(sSrc);
		oImage.setHeight(sHeight);
		oImage.setWidth(sWidth);
	} else {
		oImage = new sap.m.Image(sImgId, {
			src : sSrc,
			height : sHeight,
			width : sWidth		
		}).setParent(this, null, true);;		
	}
	return this._imageBtn = oImage;
};