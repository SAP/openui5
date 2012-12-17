/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.makit.Column.
jQuery.sap.declare("sap.makit.Column");
jQuery.sap.require("sap.makit.library");
jQuery.sap.require("sap.ui.core.Element");

/**
 * Constructor for a new Column.
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
 * <li>{@link #getName name} : string</li>
 * <li>{@link #getValue value} : any</li>
 * <li>{@link #getType type} : string (default: 'string')</li></ul>
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
 * The data column of the Chart's data table
 * @extends sap.ui.core.Element
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.makit.Column
 */
sap.ui.core.Element.extend("sap.makit.Column", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.makit",
	properties : {
		"name" : {type : "string", group : "Identification", defaultValue : null},
		"value" : {type : "any", group : "Data", defaultValue : null},
		"type" : {type : "string", group : "Misc", defaultValue : 'string'}
	}
}});


/**
 * Creates a new subclass of class sap.makit.Column with name <code>sClassName</code> 
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
 * @name sap.makit.Column.extend
 * @function
 */


/**
 * Getter for property <code>name</code>.
 * The name representing the Column
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>name</code>
 * @public
 * @name sap.makit.Column#getName
 * @function
 */


/**
 * Setter for property <code>name</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sName  new value for property <code>name</code>
 * @return {sap.makit.Column} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Column#setName
 * @function
 */

/**
 * Getter for property <code>value</code>.
 * The value mapped to this Column (User should map this using data binding)
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {any} the value of property <code>value</code>
 * @public
 * @name sap.makit.Column#getValue
 * @function
 */


/**
 * Setter for property <code>value</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {any} oValue  new value for property <code>value</code>
 * @return {sap.makit.Column} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Column#setValue
 * @function
 */

/**
 * Getter for property <code>type</code>.
 * The data type of the Column:
 * number
 * string
 * datetime
 *
 * Default value is <code>string</code>
 *
 * @return {string} the value of property <code>type</code>
 * @public
 * @name sap.makit.Column#getType
 * @function
 */


/**
 * Setter for property <code>type</code>.
 *
 * Default value is <code>string</code> 
 *
 * @param {string} sType  new value for property <code>type</code>
 * @return {sap.makit.Column} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Column#setType
 * @function
 */

// Start of sap\makit\Column.js
/*!
 * @copyright@
 */
