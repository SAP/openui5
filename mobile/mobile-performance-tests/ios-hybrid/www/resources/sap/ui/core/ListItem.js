/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.ListItem.
jQuery.sap.declare("sap.ui.core.ListItem");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Item");

/**
 * Constructor for a new ListItem.
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
 * <li>{@link #getIcon icon} : string</li>
 * <li>{@link #getAdditionalText additionalText} : string</li></ul>
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
 * In addition, all settings applicable to the base type {@link sap.ui.core.Item#constructor sap.ui.core.Item}
 * can be used as well.
 *
 * @param {string} [sId] id for the new control, generated automatically if no id is given 
 * @param {object} [mSettings] initial settings for the new control
 *
 * @class
 * An item that is used in lists or list-similar controls such as DropdownBox, for example.
 * The element foresees the usage of additional texts displayed in a second column.
 * 
 * @extends sap.ui.core.Item
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.ListItem
 */
sap.ui.core.Item.extend("sap.ui.core.ListItem", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.ui.core",
	properties : {
		"icon" : {type : "string", group : "Appearance", defaultValue : null},
		"additionalText" : {type : "string", group : "Data", defaultValue : null}
	}
}});


/**
 * Creates a new subclass of class sap.ui.core.ListItem with name <code>sClassName</code> 
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
 * @name sap.ui.core.ListItem.extend
 * @function
 */


/**
 * Getter for property <code>icon</code>.
 * The icon belonging to this list item instance.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>icon</code>
 * @public
 * @name sap.ui.core.ListItem#getIcon
 * @function
 */


/**
 * Setter for property <code>icon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sIcon  new value for property <code>icon</code>
 * @return {sap.ui.core.ListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ListItem#setIcon
 * @function
 */

/**
 * Getter for property <code>additionalText</code>.
 * Some additional text of type string, optionally to be displayed along with this item.
 * 
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>additionalText</code>
 * @public
 * @name sap.ui.core.ListItem#getAdditionalText
 * @function
 */


/**
 * Setter for property <code>additionalText</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sAdditionalText  new value for property <code>additionalText</code>
 * @return {sap.ui.core.ListItem} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.ListItem#setAdditionalText
 * @function
 */

// Start of sap\ui\core\ListItem.js
