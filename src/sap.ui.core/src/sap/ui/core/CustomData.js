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

	return CustomData;

});