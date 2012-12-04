/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.makit.ValueAxis.
jQuery.sap.declare("sap.makit.ValueAxis");
jQuery.sap.require("sap.makit.library");
jQuery.sap.require("sap.makit.Axis");

/**
 * Constructor for a new ValueAxis.
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
 * <li>{@link #getMin min} : string</li>
 * <li>{@link #getMax max} : string</li></ul>
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
 * In addition, all settings applicable to the base type {@link sap.makit.Axis#constructor sap.makit.Axis}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * Contains the properties of the Value's Axis.
 * @extends sap.makit.Axis
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 * @name sap.makit.ValueAxis
 */
sap.makit.Axis.extend("sap.makit.ValueAxis", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.makit",
	properties : {
		"min" : {type : "string", group : "Misc", defaultValue : null},
		"max" : {type : "string", group : "Misc", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.makit.ValueAxis with name <code>sClassName</code> 
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
 * @name sap.makit.ValueAxis.extend
 * @function
 */


/**
 * Getter for property <code>min</code>.
 * Highest displayed value on the Value Axis (this value will be automatically adjusted to nearest major tick value depending on the value's range)
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>min</code>
 * @public
 * @name sap.makit.ValueAxis#getMin
 * @function
 */


/**
 * Setter for property <code>min</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sMin  new value for property <code>min</code>
 * @return {sap.makit.ValueAxis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueAxis#setMin
 * @function
 */

/**
 * Getter for property <code>max</code>.
 * Highest displayed value on the Value Axis (this value will be automatically adjusted to nearest major tick value depending on the value's range)
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>max</code>
 * @public
 * @name sap.makit.ValueAxis#getMax
 * @function
 */


/**
 * Setter for property <code>max</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sMax  new value for property <code>max</code>
 * @return {sap.makit.ValueAxis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.ValueAxis#setMax
 * @function
 */

// Start of sap\makit\ValueAxis.js
/*!
 * @copyright@
 */

sap.makit.ValueAxis.prototype.init = function(){
	this.setShowGrid(true);
	this.setShowPrimaryLine(false);
};
