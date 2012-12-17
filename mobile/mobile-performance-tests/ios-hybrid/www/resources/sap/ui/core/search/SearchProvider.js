/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.search.SearchProvider.
jQuery.sap.declare("sap.ui.core.search.SearchProvider");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Element");

/**
 * Constructor for a new search/SearchProvider.
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
 * <li>{@link #getIcon icon} : string</li></ul>
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
 * Abstract base class for all SearchProviders which can be e.g. attached to a SearchField. Do not create instances of this class, but use a concrete sub class instead.
 * @extends sap.ui.core.Element
 *
 * @author  
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.search.SearchProvider
 */
sap.ui.core.Element.extend("sap.ui.core.search.SearchProvider", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"suggest"
	],

	// ---- control specific ----
	library : "sap.ui.core",
	properties : {
		"icon" : {type : "string", group : "Misc", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.ui.core.search.SearchProvider with name <code>sClassName</code> 
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
 * @name sap.ui.core.search.SearchProvider.extend
 * @function
 */


/**
 * Getter for property <code>icon</code>.
 * Icon of the Search Provider
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>icon</code>
 * @public
 * @name sap.ui.core.search.SearchProvider#getIcon
 * @function
 */


/**
 * Setter for property <code>icon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sIcon  new value for property <code>icon</code>
 * @return {sap.ui.core.search.SearchProvider} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.search.SearchProvider#setIcon
 * @function
 */

/**
 * Call this function to get suggest values from the search provider. The given callback function is called with the suggest value (type 'string', 1st parameter) and an array of the suggestions (type '[string]', 2nd parameter).
 *
 * @name sap.ui.core.search.SearchProvider.prototype.suggest
 * @function
 * @param {string} 
 *         sSValue
 *         The value for which suggestions are requested.
 * @param {any} 
 *         oFCallBack
 *         The callback function which is called when the suggestions are available.

 * @type void
 * @public
 */


// Start of sap\ui\core\search\SearchProvider.js
/**
 * Call this function to get suggest values from the search provider.
 * The given callback function is called with the suggest value (type 'string', 1st parameter)
 * and an array of the suggestions (type '[string]', 2nd parameter).
 *
 * @name sap.ui.core.search.SearchProvider.prototype.suggest
 * @function
 * @param {string} sValue The value for which suggestions are requested.
 * @param {function} fCallBack The callback function which is called when the suggestions are available.
 * @type void
 * @public
 */
sap.ui.core.search.SearchProvider.prototype.suggest = function(sValue, fCallback) {
	jQuery.sap.log.warning("sap.ui.core.search.SearchProvider is the abstract base class for all SearchProviders. Do not create instances of this class, but use a concrete sub class instead.");
};
