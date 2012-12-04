/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.FlexItemData.
jQuery.sap.declare("sap.m.FlexItemData");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.LayoutData");

/**
 * Constructor for a new FlexItemData.
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
 * <li>{@link #getAlignSelf alignSelf} : sap.m.FlexAlignSelf (default: sap.m.FlexAlignSelf.Auto)</li>
 * <li>{@link #getOrder order} : int (default: 0)</li>
 * <li>{@link #getGrowFactor growFactor} : float (default: 0)</li>
 * <li>{@link #getStyleClass styleClass} : string (default: '')</li></ul>
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
 * 
 * In addition, all settings applicable to the base type {@link sap.ui.core.LayoutData#constructor sap.ui.core.LayoutData}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Holds layout data for a FlexBox
 * @extends sap.ui.core.LayoutData
 *
 * @author  
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.FlexItemData
 */
sap.ui.core.LayoutData.extend("sap.m.FlexItemData", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"alignSelf" : {type : "sap.m.FlexAlignSelf", group : "Misc", defaultValue : sap.m.FlexAlignSelf.Auto},
		"order" : {type : "int", group : "Misc", defaultValue : 0},
		"growFactor" : {type : "float", group : "Misc", defaultValue : 0},
		"styleClass" : {type : "string", group : "Misc", defaultValue : ''}
	}
}});


/**
 * Creates a new subclass of class sap.m.FlexItemData with name <code>sClassName</code> 
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
 * @name sap.m.FlexItemData.extend
 * @function
 */


/**
 * Getter for property <code>alignSelf</code>.
 * Determines cross-axis alignment of individual element
 *
 * Default value is <code>Auto</code>
 *
 * @return {sap.m.FlexAlignSelf} the value of property <code>alignSelf</code>
 * @public
 * @name sap.m.FlexItemData#getAlignSelf
 * @function
 */


/**
 * Setter for property <code>alignSelf</code>.
 *
 * Default value is <code>Auto</code> 
 *
 * @param {sap.m.FlexAlignSelf} oAlignSelf  new value for property <code>alignSelf</code>
 * @return {sap.m.FlexItemData} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexItemData#setAlignSelf
 * @function
 */

/**
 * Getter for property <code>order</code>.
 * Determines the display order of flex items independent of their source code order.
 *
 * Default value is <code>0</code>
 *
 * @return {int} the value of property <code>order</code>
 * @public
 * @name sap.m.FlexItemData#getOrder
 * @function
 */


/**
 * Setter for property <code>order</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {int} iOrder  new value for property <code>order</code>
 * @return {sap.m.FlexItemData} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexItemData#setOrder
 * @function
 */

/**
 * Getter for property <code>growFactor</code>.
 * Determines the flexibility of the flex item when allocatable space is remaining.
 *
 * Default value is <code>0</code>
 *
 * @return {float} the value of property <code>growFactor</code>
 * @public
 * @name sap.m.FlexItemData#getGrowFactor
 * @function
 */


/**
 * Setter for property <code>growFactor</code>.
 *
 * Default value is <code>0</code> 
 *
 * @param {float} fGrowFactor  new value for property <code>growFactor</code>
 * @return {sap.m.FlexItemData} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexItemData#setGrowFactor
 * @function
 */

/**
 * Getter for property <code>styleClass</code>.
 * The style class will be applied to the flex item and can be used for CSS selectors
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>styleClass</code>
 * @public
 * @name sap.m.FlexItemData#getStyleClass
 * @function
 */


/**
 * Setter for property <code>styleClass</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sStyleClass  new value for property <code>styleClass</code>
 * @return {sap.m.FlexItemData} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.FlexItemData#setStyleClass
 * @function
 */

// Start of sap\m\FlexItemData.js
jQuery.sap.require("sap.ui.core.EnabledPropagator");
jQuery.sap.require("sap.m.FlexBoxStylingHelper");

sap.ui.core.EnabledPropagator.apply(sap.m.FlexItemData.prototype, [true]);

sap.m.FlexItemData.prototype.setAlignSelf = function(sValue) {
	this.setProperty("alignSelf", sValue, true);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "align-self", sValue);
	return this;
};

sap.m.FlexItemData.prototype.setOrder = function(sValue) {
	this.setProperty("order", sValue, true);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "order", sValue);
	return this;
};

sap.m.FlexItemData.prototype.setGrowFactor = function(sValue) {
	this.setProperty("growFactor", sValue, true);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "flex-grow", sValue);
	return this;
};

//TODO Uncomment when property is supported by any browser
/*sap.m.FlexItemData.prototype.setShrinkFactor = function(sValue) {
	this.setProperty("shrinkFactor", sValue, true);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "flex-shrink", sValue);
	return this;
};*/

//TODO Uncomment when property is supported by any browser
/*sap.m.FlexItemData.prototype.setBaseSize = function(sValue) {
	this.setProperty("baseSize", sValue, true);
	sap.m.FlexBoxStylingHelper.setStyle(null, this, "flex-basis", sValue);
	return this;
};*/

//TODO Implement a setter for the class property