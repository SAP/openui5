/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.makit.Axis.
jQuery.sap.declare("sap.makit.Axis");
jQuery.sap.require("sap.makit.library");
jQuery.sap.require("sap.ui.core.Element");

/**
 * Constructor for a new Axis.
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
 * <li>{@link #getShowLabel showLabel} : boolean (default: true)</li>
 * <li>{@link #getShowPrimaryLine showPrimaryLine} : boolean (default: true)</li>
 * <li>{@link #getShowGrid showGrid} : boolean (default: false)</li>
 * <li>{@link #getThickness thickness} : float (default: 0.5)</li>
 * <li>{@link #getColor color} : string (default: 'gray')</li></ul>
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
 * Base element for the Axis object for the Chart.
 * @extends sap.ui.core.Element
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 * @name sap.makit.Axis
 */
sap.ui.core.Element.extend("sap.makit.Axis", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.makit",
	properties : {
		"showLabel" : {type : "boolean", group : "Appearance", defaultValue : true},
		"showPrimaryLine" : {type : "boolean", group : "Appearance", defaultValue : true},
		"showGrid" : {type : "boolean", group : "Appearance", defaultValue : false},
		"thickness" : {type : "float", group : "Appearance", defaultValue : 0.5},
		"color" : {type : "string", group : "Appearance", defaultValue : 'gray'}
	}
}});


/**
 * Creates a new subclass of class sap.makit.Axis with name <code>sClassName</code> 
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
 * @name sap.makit.Axis.extend
 * @function
 */


/**
 * Getter for property <code>showLabel</code>.
 * Indicates whether to show label of the Axis by the primary line
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showLabel</code>
 * @public
 * @name sap.makit.Axis#getShowLabel
 * @function
 */


/**
 * Setter for property <code>showLabel</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowLabel  new value for property <code>showLabel</code>
 * @return {sap.makit.Axis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Axis#setShowLabel
 * @function
 */

/**
 * Getter for property <code>showPrimaryLine</code>.
 * Indicates whether to show the primary line of the Axis on the chart area
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>showPrimaryLine</code>
 * @public
 * @name sap.makit.Axis#getShowPrimaryLine
 * @function
 */


/**
 * Setter for property <code>showPrimaryLine</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bShowPrimaryLine  new value for property <code>showPrimaryLine</code>
 * @return {sap.makit.Axis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Axis#setShowPrimaryLine
 * @function
 */

/**
 * Getter for property <code>showGrid</code>.
 * Indicates whether to show grid of the Axis in the chart area
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>showGrid</code>
 * @public
 * @name sap.makit.Axis#getShowGrid
 * @function
 */


/**
 * Setter for property <code>showGrid</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bShowGrid  new value for property <code>showGrid</code>
 * @return {sap.makit.Axis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Axis#setShowGrid
 * @function
 */

/**
 * Getter for property <code>thickness</code>.
 * The line thickness of the primary line
 *
 * Default value is <code>0.5</code>
 *
 * @return {float} the value of property <code>thickness</code>
 * @public
 * @name sap.makit.Axis#getThickness
 * @function
 */


/**
 * Setter for property <code>thickness</code>.
 *
 * Default value is <code>0.5</code> 
 *
 * @param {float} fThickness  new value for property <code>thickness</code>
 * @return {sap.makit.Axis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Axis#setThickness
 * @function
 */

/**
 * Getter for property <code>color</code>.
 * Color of the primary line. Accept the following format:
 * standard name format: gray, red, black, etc
 * hex format: #ff00ff
 * rgb format: rgb(256, 0, 256)
 *
 * Default value is <code>gray</code>
 *
 * @return {string} the value of property <code>color</code>
 * @public
 * @name sap.makit.Axis#getColor
 * @function
 */


/**
 * Setter for property <code>color</code>.
 *
 * Default value is <code>gray</code> 
 *
 * @param {string} sColor  new value for property <code>color</code>
 * @return {sap.makit.Axis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.Axis#setColor
 * @function
 */

// Start of sap\makit\Axis.js
/*!
 * @copyright@
 */