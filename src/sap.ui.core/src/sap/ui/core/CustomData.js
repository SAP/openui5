/*!
 * ${copyright}
 */

// Provides element sap.ui.core.CustomData.
sap.ui.define([
	'./Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new <code>CustomData</code> element.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new element
	 *
	 * @class
	 * Contains a single key/value pair of custom data attached to an <code>Element</code>.
	 *
	 * See method {@link sap.ui.core.Element#data Element.prototype.data} and the chapter
	 * {@link topic:91f0c3ee6f4d1014b6dd926db0e91070 Custom Data - Attaching Data Objects to Controls}
	 * in the documentation.
	 *
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.CustomData
	 */
	var CustomData = Element._CustomData;

	/**
	 * Creates a new subclass of <code>CustomData</code> with name <code>sClassName</code>
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 *
	 * <code>oClassInfo</code> might contain the same kind of information as described in
	 * {@link sap.ui.core.Element.extend Element.extend}.
	 *
	 * @param {string} sClassName Name of the class being created
	 * @param {object} [oClassInfo] Object literal with information about the class
	 * @param {function} [FNMetaImpl] Constructor function for the metadata object; if not given,
	 *   it defaults to <code>sap.ui.core.ElementMetadata</code>
	 * @returns {function} Created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.core.CustomData.extend
	 * @function
	 */

	/**
	 * Returns a metadata object for class <code>sap.ui.core.CustomData</code>.
	 *
	 * @returns {sap.ui.core.ElementMetadata} Metadata object describing this class
	 * @public
	 * @static
	 * @name sap.ui.core.CustomData.getMetadata
	 * @function
	 */
	return CustomData;

});