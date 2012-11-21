/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.BusyIndicator.
jQuery.sap.declare("sap.m.BusyIndicator");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new BusyIndicator.
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
 * <li>{@link #getTextDirection textDirection} : sap.ui.core.TextDirection (default: sap.ui.core.TextDirection.Inherit)</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getCustomIcon customIcon} : sap.ui.core.URI</li>
 * <li>{@link #getCustomIconRotationSpeed customIconRotationSpeed} : int (default: 1000)</li>
 * <li>{@link #getCustomIconDensityAware customIconDensityAware} : boolean (default: true)</li>
 * <li>{@link #getCustomIconWidth customIconWidth} : sap.ui.core.CSSSize</li>
 * <li>{@link #getCustomIconHeight customIconHeight} : sap.ui.core.CSSSize</li>
 * <li>{@link #getSize size} : sap.ui.core.CSSSize</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
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
 * Control to indicate that the system is busy with some task and the user has to wait. When no image or gif is provided, the control renders the platforms native indicator using css.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.BusyIndicator
 */
sap.ui.core.Control.extend("sap.m.BusyIndicator", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"text" : {type : "string", group : "Data", defaultValue : null},
		"textDirection" : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"customIcon" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
		"customIconRotationSpeed" : {type : "int", group : "Appearance", defaultValue : 1000},
		"customIconDensityAware" : {type : "boolean", group : "", defaultValue : true},
		"customIconWidth" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"customIconHeight" : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},
		"size" : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.m.BusyIndicator with name <code>sClassName</code> 
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
 * @name sap.m.BusyIndicator.extend
 * @function
 */


/**
 * Getter for property <code>text</code>.
 * Defines the text displayed next to the busy indicator (optional)
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.m.BusyIndicator#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setText
 * @function
 */

/**
 * Getter for property <code>textDirection</code>.
 * Options for the text direction are RTL and LTR. Alternatively, the control can inherit the text direction from its parent container.
 *
 * Default value is <code>sap.ui.core.TextDirection.Inherit</code>
 *
 * @return {sap.ui.core.TextDirection} the value of property <code>textDirection</code>
 * @public
 * @name sap.m.BusyIndicator#getTextDirection
 * @function
 */


/**
 * Setter for property <code>textDirection</code>.
 *
 * Default value is <code>sap.ui.core.TextDirection.Inherit</code> 
 *
 * @param {sap.ui.core.TextDirection} oTextDirection  new value for property <code>textDirection</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setTextDirection
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Invisible control is not rendered
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.BusyIndicator#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setVisible
 * @function
 */

/**
 * Getter for property <code>customIcon</code>.
 * Icon url if an icon is used as the busy indicator.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>customIcon</code>
 * @public
 * @name sap.m.BusyIndicator#getCustomIcon
 * @function
 */


/**
 * Setter for property <code>customIcon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sCustomIcon  new value for property <code>customIcon</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setCustomIcon
 * @function
 */

/**
 * Getter for property <code>customIconRotationSpeed</code>.
 * Defines the rotation speed of the given image. If a .gif is used, the speed has to be set to 0. The unit is in ms.
 *
 * Default value is <code>1000</code>
 *
 * @return {int} the value of property <code>customIconRotationSpeed</code>
 * @public
 * @name sap.m.BusyIndicator#getCustomIconRotationSpeed
 * @function
 */


/**
 * Setter for property <code>customIconRotationSpeed</code>.
 *
 * Default value is <code>1000</code> 
 *
 * @param {int} iCustomIconRotationSpeed  new value for property <code>customIconRotationSpeed</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setCustomIconRotationSpeed
 * @function
 */

/**
 * Getter for property <code>customIconDensityAware</code>.
 * If this is set to false, the src image will be loaded directly without attempting to fetch the density perfect image for high density device.
 * 
 * By default, this is set to true but then one or more requests are sent trying to get the density perfect version of image if this version of image doesn't exist on the server.
 * 
 * If bandwidth is the key for the application, set this value to false.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>customIconDensityAware</code>
 * @public
 * @name sap.m.BusyIndicator#getCustomIconDensityAware
 * @function
 */


/**
 * Setter for property <code>customIconDensityAware</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bCustomIconDensityAware  new value for property <code>customIconDensityAware</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setCustomIconDensityAware
 * @function
 */

/**
 * Getter for property <code>customIconWidth</code>.
 * Width of the provided icon. By default 44px are used.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>customIconWidth</code>
 * @public
 * @name sap.m.BusyIndicator#getCustomIconWidth
 * @function
 */


/**
 * Setter for property <code>customIconWidth</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sCustomIconWidth  new value for property <code>customIconWidth</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setCustomIconWidth
 * @function
 */

/**
 * Getter for property <code>customIconHeight</code>.
 * Height of the provided icon. By default 44px are used.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>customIconHeight</code>
 * @public
 * @name sap.m.BusyIndicator#getCustomIconHeight
 * @function
 */


/**
 * Setter for property <code>customIconHeight</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sCustomIconHeight  new value for property <code>customIconHeight</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setCustomIconHeight
 * @function
 */

/**
 * Getter for property <code>size</code>.
 * Defines the size of the busy indicator.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>size</code>
 * @public
 * @name sap.m.BusyIndicator#getSize
 * @function
 */


/**
 * Setter for property <code>size</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.CSSSize} sSize  new value for property <code>size</code>
 * @return {sap.m.BusyIndicator} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.BusyIndicator#setSize
 * @function
 */

// Start of sap\m\BusyIndicator.js
///**
// * This file defines behavior for the control,
// */


/**
 * Initializes the dialog control
 *
 * @private
 *
 */

sap.m.BusyIndicator.prototype.onAfterRendering = function(){
	if(this.getCustomIconRotationSpeed()){
		this.$().children('img').css("-webkit-animation-duration", this.getCustomIconRotationSpeed() + "ms");
	}
	var $_elem = this.$();
	
	var parentElement = this.getParent() ? this.getParent()._context : '';
	//Set the color to the first parents color which is not transparent. Skip this when inside Dialog or Bar.
	if(!jQuery.os.ios) {
		if(!this.getCustomIcon() && this.$().parent('.sapMBusyDialog').length === 0 && parentElement !== 'header') {
			
			var bFoundCss = true;
			while( $_elem.css('background-color') === "rgba(0, 0, 0, 0)" ) {
				$_elem = $_elem.parent();
				
				//Do not ask '#document' for its css. this will cause trouble. Therefore
				//'$_elem.parent().length' is checked
				if($_elem.parent().length == 0) {
					bFoundCss = false;
					break;
				}
			}
			//This is the default color
			var sBColor = "rgba(0, 0, 0, 0)";
			if(bFoundCss) {
				sBColor = $_elem.css('background-color');
			}
			this.$().children().children('.sapMSpinBar3').children('.sapMSpinBar4').css('background-color', sBColor);
		}
	}
};

sap.m.BusyIndicator.prototype.setCustomIconRotationSpeed = function(iSpeed){
	if(iSpeed){
		if(iSpeed !== this.getCustomIconRotationSpeed()) {
			this.setProperty("customIconRotationSpeed", iSpeed, true);
		}
	}
	return this;
}