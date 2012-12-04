/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.makit.CategoryAxis.
jQuery.sap.declare("sap.makit.CategoryAxis");
jQuery.sap.require("sap.makit.library");
jQuery.sap.require("sap.makit.Axis");

/**
 * Constructor for a new CategoryAxis.
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
 * <li>{@link #getSortOrder sortOrder} : sap.makit.SortOrder (default: sap.makit.SortOrder.None)</li>
 * <li>{@link #getDisplayLastLabel displayLastLabel} : boolean (default: false)</li></ul>
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
 * Contains the properties of the Category's Axis.
 * @extends sap.makit.Axis
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @experimental Since version 1.8. 
 * API is not yet finished and might change completely
 * @name sap.makit.CategoryAxis
 */
sap.makit.Axis.extend("sap.makit.CategoryAxis", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.makit",
	properties : {
		"sortOrder" : {type : "sap.makit.SortOrder", group : "Misc", defaultValue : sap.makit.SortOrder.None},
		"displayLastLabel" : {type : "boolean", group : "Misc", defaultValue : false}
	}
}});


/**
 * Creates a new subclass of class sap.makit.CategoryAxis with name <code>sClassName</code> 
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
 * @name sap.makit.CategoryAxis.extend
 * @function
 */


/**
 * Getter for property <code>sortOrder</code>.
 * Sort order of the chart
 *
 * Default value is <code>None</code>
 *
 * @return {sap.makit.SortOrder} the value of property <code>sortOrder</code>
 * @public
 * @name sap.makit.CategoryAxis#getSortOrder
 * @function
 */


/**
 * Setter for property <code>sortOrder</code>.
 *
 * Default value is <code>None</code> 
 *
 * @param {sap.makit.SortOrder} oSortOrder  new value for property <code>sortOrder</code>
 * @return {sap.makit.CategoryAxis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.CategoryAxis#setSortOrder
 * @function
 */

/**
 * Getter for property <code>displayLastLabel</code>.
 * Whether to always display the last label on the axis regardless of the automatic resize
 *
 * Default value is <code>false</code>
 *
 * @return {boolean} the value of property <code>displayLastLabel</code>
 * @public
 * @name sap.makit.CategoryAxis#getDisplayLastLabel
 * @function
 */


/**
 * Setter for property <code>displayLastLabel</code>.
 *
 * Default value is <code>false</code> 
 *
 * @param {boolean} bDisplayLastLabel  new value for property <code>displayLastLabel</code>
 * @return {sap.makit.CategoryAxis} <code>this</code> to allow method chaining
 * @public
 * @name sap.makit.CategoryAxis#setDisplayLastLabel
 * @function
 */

// Start of sap\makit\CategoryAxis.js
/*!
 * @copyright@
 */

sap.makit.CategoryAxis.prototype.init = function(){
	this.setShowGrid(false);
	this.setShowPrimaryLine(true);
};
