/*!
 * ${copyright}
 */

// Provides element sap.m.ImageCustomData.
sap.ui.define([
	"sap/ui/core/CustomData"
], function (CustomData) {
	"use strict";

	/**
	 * Constructor for a new <code>ImageCustomData</code> element.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 *
	 * @class
	 * Contains a single key/value pair of custom data attached to an <code>Element</code>.
	 *
	 * For more information, see {@link sap.ui.core.Element#data Element.prototype.data}
	 * and {@link topic:91f0c3ee6f4d1014b6dd926db0e91070 Custom Data - Attaching Data Objects to Controls}.
	 *
	 * @extends sap.ui.core.CustomData
	 * @since 1.115
	 *
	 * @private
	 * @alias sap.m.ImageCustomData
	 */

	var ImageCustomData = CustomData.extend("sap.m.ImageCustomData", {
		metadata: {
			properties: {
				/**
				 * The name of the parameter to be used for cache busting.
				 * @since 1.115
				 */
				paramName: { type: "string", group: "Misc" }
			}
		}
	});

	return ImageCustomData;
});