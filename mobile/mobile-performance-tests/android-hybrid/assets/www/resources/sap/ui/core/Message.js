/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* ----------------------------------------------------------------------------------
 * Hint: This is a derived (generated) file. Changes should be done in the underlying 
 * source files only (*.control, *.js) or they will be lost after the next generation.
 * ---------------------------------------------------------------------------------- */

// Provides control sap.ui.core.Message.
jQuery.sap.declare("sap.ui.core.Message");
jQuery.sap.require("sap.ui.core.library");
jQuery.sap.require("sap.ui.core.Element");

/**
 * Constructor for a new Message.
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
 * <li>{@link #getText text} : string</li>
 * <li>{@link #getTimestamp timestamp} : string</li>
 * <li>{@link #getIcon icon} : sap.ui.core.URI</li>
 * <li>{@link #getLevel level} : sap.ui.core.MessageType (default: sap.ui.core.MessageType.None)</li></ul>
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
 * This element used to provide messages. Rendering must be done within the control that uses this kind of element.
 * 
 * Its default level is none.
 * @extends sap.ui.core.Element
 *
 * @author SAP 
 * @version 1.9.0-SNAPSHOT
 *
 * @constructor   
 * @public
 * @name sap.ui.core.Message
 */
sap.ui.core.Element.extend("sap.ui.core.Message", { metadata : {

	// ---- object ----
	publicMethods : [
		// methods
		"getDefaultIcon"
	],

	// ---- control specific ----
	library : "sap.ui.core",
	properties : {
		"text" : {type : "string", group : "Misc", defaultValue : null},
		"timestamp" : {type : "string", group : "Misc", defaultValue : null},
		"icon" : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},
		"level" : {type : "sap.ui.core.MessageType", group : "Misc", defaultValue : sap.ui.core.MessageType.None}
	}
}});


/**
 * Creates a new subclass of class sap.ui.core.Message with name <code>sClassName</code> 
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
 * @name sap.ui.core.Message.extend
 * @function
 */


/**
 * Getter for property <code>text</code>.
 * Message text
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>text</code>
 * @public
 * @name sap.ui.core.Message#getText
 * @function
 */


/**
 * Setter for property <code>text</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sText  new value for property <code>text</code>
 * @return {sap.ui.core.Message} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.Message#setText
 * @function
 */

/**
 * Getter for property <code>timestamp</code>.
 * Message's timestamp. It is just a simple String that will be used without any transformation. So the application that uses messages needs to format the timestamp to its own needs.
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {string} the value of property <code>timestamp</code>
 * @public
 * @name sap.ui.core.Message#getTimestamp
 * @function
 */


/**
 * Setter for property <code>timestamp</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {string} sTimestamp  new value for property <code>timestamp</code>
 * @return {sap.ui.core.Message} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.Message#setTimestamp
 * @function
 */

/**
 * Getter for property <code>icon</code>.
 * A possible icon URI of the message
 *
 * Default value is empty/<code>undefined</code>
 *
 * @return {sap.ui.core.URI} the value of property <code>icon</code>
 * @public
 * @name sap.ui.core.Message#getIcon
 * @function
 */


/**
 * Setter for property <code>icon</code>.
 *
 * Default value is empty/<code>undefined</code> 
 *
 * @param {sap.ui.core.URI} sIcon  new value for property <code>icon</code>
 * @return {sap.ui.core.Message} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.Message#setIcon
 * @function
 */

/**
 * Getter for property <code>level</code>.
 * Setting the message's level.
 *
 * Default value is <code>sap.ui.core.MessageType.None</code>
 *
 * @return {sap.ui.core.MessageType} the value of property <code>level</code>
 * @public
 * @name sap.ui.core.Message#getLevel
 * @function
 */


/**
 * Setter for property <code>level</code>.
 *
 * Default value is <code>sap.ui.core.MessageType.None</code> 
 *
 * @param {sap.ui.core.MessageType} oLevel  new value for property <code>level</code>
 * @return {sap.ui.core.Message} <code>this</code> to allow method chaining
 * @public
 * @name sap.ui.core.Message#setLevel
 * @function
 */

/**
 * Returns the icon's default URI depending on given size. There are default icons for messages available that can be used this way. If no parameter is given the size will be 16x16 per default. If larger icons are needed the parameter "32x32" might be given.
 *
 * @name sap.ui.core.Message.prototype.getDefaultIcon
 * @function
 * @param {string} 
 *         sSize
 *         If parameter is not set the default icon's size will be 16x16. If parameter is set to "32x32" the icon size will be 32x32.

 * @type sap.ui.core.URI
 * @public
 */


// Start of sap\ui\core\Message.js
jQuery.sap.require("sap.ui.core.theming.Parameters");
/**
 * This file defines behavior for the control,
 */
sap.ui.core.Message.prototype.getDefaultIcon = function(sSize) {
	var sModulePath = jQuery.sap.getModulePath("sap.ui.core", '/');
	var sTheme = "themes/" + sap.ui.getCore().getConfiguration().getTheme();

	var sImagesPath = "/img/message/";
	if (sSize && sSize == "32x32") {
		sImagesPath += "32x32/";
	} else {
		sImagesPath += "16x16/";
	}
	var sUrl = "";

	switch (this.getProperty("level")) {
	case sap.ui.core.MessageType.Error:
		sUrl = sModulePath + sTheme + sImagesPath + "Message_Icon_Error.png";
		break;

	case sap.ui.core.MessageType.Information:
		sUrl = sModulePath + sTheme + sImagesPath
				+ "Message_Icon_Information.png";
		break;

	case sap.ui.core.MessageType.Warning:
		sUrl = sModulePath + sTheme + sImagesPath + "Message_Icon_Warning.png";
		break;

	case sap.ui.core.MessageType.Success:
		sUrl = sModulePath + sTheme + sImagesPath + "Message_Icon_Success.png";
		break;

	case sap.ui.core.MessageType.None:
	default:
		sUrl = this.getProperty("icon");
		break;
	}

	return sUrl;
};