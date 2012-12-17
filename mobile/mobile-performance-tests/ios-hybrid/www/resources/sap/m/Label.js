/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.m.Label.
jQuery.sap.declare("sap.m.Label");
jQuery.sap.require("sap.m.library");
jQuery.sap.require("sap.ui.core.Control");

/**
 * Constructor for a new Label.
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
 * <li>{@link #getDesign design} : sap.m.LabelDesign (default: sap.m.LabelDesign.Standard)</li>
 * <li>{@link #getText text} : string</li>
 * <li>{@link #getVisible visible} : boolean (default: true)</li>
 * <li>{@link #getTextAlign textAlign} : sap.ui.core.TextAlign (default: sap.ui.core.TextAlign.Begin)</li>
 * <li>{@link #getTextDirection textDirection} : sap.ui.core.TextDirection (default: sap.ui.core.TextDirection.Inherit)</li>
 * <li>{@link #getWidth width} : sap.ui.core.CSSSize (default: '')</li></ul>
 * </li>
 * <li>Aggregations
 * <ul></ul>
 * </li>
 * <li>Associations
 * <ul>
 * <li>{@link #getLabelFor labelFor} : string | sap.ui.core.Control</li></ul>
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
 * Label control is used in a UI5 mobile application to provide label text for other controls. Design such as bold, and text alignment can be specified.
 * @extends sap.ui.core.Control
 *
 * @author SAP AG 
 * @version 1.9.1-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.m.Label
 */
sap.ui.core.Control.extend("sap.m.Label", { metadata : {

	// ---- object ----

	// ---- control specific ----
	library : "sap.m",
	properties : {
		"design" : {type : "sap.m.LabelDesign", group : "Appearance", defaultValue : sap.m.LabelDesign.Standard},
		"text" : {type : "string", group : "Misc", defaultValue : null},
		"visible" : {type : "boolean", group : "Appearance", defaultValue : true},
		"textAlign" : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : sap.ui.core.TextAlign.Begin},
		"textDirection" : {type : "sap.ui.core.TextDirection", group : "Appearance", defaultValue : sap.ui.core.TextDirection.Inherit},
		"width" : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : ''}
	},
	associations : {
		"labelFor" : {type : "sap.ui.core.Control", multiple : false}
	}
}});


/**
 * Creates a new subclass of class sap.m.Label with name <code>sClassName</code> 
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
 * @name sap.m.Label.extend
 * @function
 */


/**
 * Getter for property <code>design</code>.
 * set design of a label to either Standard or Bold
 *
 * Default value is <code>sap.m.LabelDesign.Standard</code>
 *
 * @return {sap.m.LabelDesign} the value of property <code>design</code>
 * @public
 * @name sap.m.Label#getDesign
 * @function
 */


/**
 * Setter for property <code>design</code>.
 *
 * Default value is <code>sap.m.LabelDesign.Standard</code> 
 *
 * @param {sap.m.LabelDesign} oDesign  new value for property <code>design</code>
 * @return {sap.m.Label} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Label#setDesign
 * @function
 */

/**
 * Getter for property <code>text</code>.
 * Label Text to be displayed
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.m.Label#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.m.Label} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Label#setText
 * @function
 */

/**
 * Getter for property <code>visible</code>.
 * Invisible labels are not rendered
 *
 * Default value is <code>true</code>
 *
 * @return {boolean} the value of property <code>visible</code>
 * @public
 * @name sap.m.Label#getVisible
 * @function
 */


/**
 * Setter for property <code>visible</code>.
 *
 * Default value is <code>true</code> 
 *
 * @param {boolean} bVisible  new value for property <code>visible</code>
 * @return {sap.m.Label} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Label#setVisible
 * @function
 */

/**
 * Getter for property <code>textAlign</code>.
 * Available alignment settings are "Begin", "Center", "End", "Left", and "Right".
 *
 * Default value is <code>sap.ui.core.TextAlign.Begin</code>
 *
 * @return {sap.ui.core.TextAlign} the value of property <code>textAlign</code>
 * @public
 * @name sap.m.Label#getTextAlign
 * @function
 */


/**
 * Setter for property <code>textAlign</code>.
 *
 * Default value is <code>sap.ui.core.TextAlign.Begin</code> 
 *
 * @param {sap.ui.core.TextAlign} oTextAlign  new value for property <code>textAlign</code>
 * @return {sap.m.Label} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Label#setTextAlign
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
 * @name sap.m.Label#getTextDirection
 * @function
 */


/**
 * Setter for property <code>textDirection</code>.
 *
 * Default value is <code>sap.ui.core.TextDirection.Inherit</code> 
 *
 * @param {sap.ui.core.TextDirection} oTextDirection  new value for property <code>textDirection</code>
 * @return {sap.m.Label} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Label#setTextDirection
 * @function
 */

/**
 * Getter for property <code>width</code>.
 * Width of Label
 *
 * Default value is <code>''</code>
 *
 * @return {sap.ui.core.CSSSize} the value of property <code>width</code>
 * @public
 * @name sap.m.Label#getWidth
 * @function
 */


/**
 * Setter for property <code>width</code>.
 *
 * Default value is <code>''</code> 
 *
 * @param {sap.ui.core.CSSSize} sWidth  new value for property <code>width</code>
 * @return {sap.m.Label} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Label#setWidth
 * @function
 */

/**
 * Association to the labeled control.
 * By default the label set the for attribute to the ID of the labeled control. This can be changed implementing function getIdForLabel on the labelled control.
 *
 * @return {string} Id of the element which is the current target of the <code>labelFor</code> association, or null
 * @public
 * @name sap.m.Label#getLabelFor
 * @function
 */


/**
 * Association to the labeled control.
 * By default the label set the for attribute to the ID of the labeled control. This can be changed implementing function getIdForLabel on the labelled control.
 *
 * @param {string | sap.ui.core.Control} vLabelFor 
 *    Id of an element which becomes the new target of this <code>labelFor</code> association.
 *    Alternatively, an element instance may be given.
 * @return {sap.m.Label} <code>this</code> to allow method chaining
 * @public
 * @name sap.m.Label#setLabelFor
 * @function
 */

// Start of sap\m\Label.js

