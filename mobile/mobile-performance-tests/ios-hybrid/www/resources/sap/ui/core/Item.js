/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.Item.
jQuery.sap.declare("sap.ui.core.Item");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Element");

/**
 * Constructor for a new Item.
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
 * <li>{@link #getText text} : string (default: "")</li>
 * <li>{@link #getEnabled enabled} : boolean (default: true)</li>
 * <li>{@link #getTextDirection textDirection} : sap.ui.core.TextDirection (default: sap.ui.core.TextDirection.Inherit)</li>
 * <li>{@link #getKey key} : string</li></ul>
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
 * In addition, all settings applicable to the base type {@link sap.ui.core.Element#constructor sap.ui.core.Element}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * A control base type.
 * 
 * @extends sap.ui.core.Element
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.Item
 */
sap.ui.core.Element.extend("sap.ui.core.Item", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.ui.core",
	properties : {
		"text" : {type : "string", group : "Misc", defaultValue : ""},
		"enabled" : {type : "boolean", group : "Misc", defaultValue : true},
		"textDirection" : {type : "sap.ui.core.TextDirection", group : "Misc", defaultValue : sap.ui.core.TextDirection.Inherit},
		"key" : {type : "string", group : "Data", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.ui.core.Item with name <code>sClassName</code> 
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
 * @name sap.ui.core.Item.extend
 * @function
 */


/**
 * Getter for property <code>text</code>.
 * The text to be displayed for the item.
 *
 * Default value is <code>""</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.ui.core.Item#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is <code>""</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.ui.core.Item} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.Item#setText
 * @function
 */

/**
 * Getter for property <code>enabled</code>.
 * Enabled items can be selected.
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>enabled</code>
 * @public
 * @name sap.ui.core.Item#getEnabled
 * @function
 */


/**
 * Setter for property <code>enabled</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bEnabled  new value for property <code>enabled</code>
 * @return {sap.ui.core.Item} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.Item#setEnabled
 * @function
 */

/**
 * Getter for property <code>textDirection</code>.
 * Options are RTL and LTR. Alternatively, an item can inherit its text direction from its parent control.
 *
 * Default value is <code>Inherit</code>
 *
 * @return {sap.ui.core.TextDirection} the value of property <code>textDirection</code>
 * @public
 * @name sap.ui.core.Item#getTextDirection
 * @function
 */


/**
 * Setter for property <code>textDirection</code>.
 *
 * Default value is <code>Inherit</code> 
 *
 * @param {sap.ui.core.TextDirection} oTextDirection  new value for property <code>textDirection</code>
 * @return {sap.ui.core.Item} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.Item#setTextDirection
 * @function
 */

/**
 * Getter for property <code>key</code>.
 * Can be used as input for subsequent actions.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>key</code>
 * @public
 * @name sap.ui.core.Item#getKey
 * @function
 */


/**
 * Setter for property <code>key</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sKey  new value for property <code>key</code>
 * @return {sap.ui.core.Item} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.Item#setKey
 * @function
 */

// Start of sap\ui\core\Item.js
