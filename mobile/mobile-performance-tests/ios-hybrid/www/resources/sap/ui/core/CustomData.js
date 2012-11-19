/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.CustomData.
jQuery.sap.declare("sap.ui.core.CustomData");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Element");

/**
 * Constructor for a new CustomData.
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
 * <li>{@link #getKey key} : string</li>
 * <li>{@link #getValue value} : any</li></ul>
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
 * Contains a single key/value pair of custom data attached to an Element. See method data().
 * @extends sap.ui.core.Element
 *
 * @author  
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.CustomData
 */
sap.ui.core.Element.extend("sap.ui.core.CustomData", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.ui.core",
	properties : {
		"key" : {type : "string", group : "Data", defaultValue : null},
		"value" : {type : "any", group : "Data", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.ui.core.CustomData with name <code>sClassName</code> 
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
 * @name sap.ui.core.CustomData.extend
 * @function
 */


/**
 * Getter for property <code>key</code>.
 * The key of the data in this CustomData object
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>key</code>
 * @public
 * @name sap.ui.core.CustomData#getKey
 * @function
 */


/**
 * Setter for property <code>key</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sKey  new value for property <code>key</code>
 * @return {sap.ui.core.CustomData} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.CustomData#setKey
 * @function
 */

/**
 * Getter for property <code>value</code>.
 * The data stored in this CustomData object
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>value</code>
 * @public
 * @name sap.ui.core.CustomData#getValue
 * @function
 */


/**
 * Setter for property <code>value</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oValue  new value for property <code>value</code>
 * @return {sap.ui.core.CustomData} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.CustomData#setValue
 * @function
 */

// Start of sap\ui\core\CustomData.js
