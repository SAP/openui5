/*!
 * ${copyright}
 */

sap.ui.define([
	'./library', 'sap/ui/core/Element'
], function(library, Element) {
	"use strict";

	/**
	 * Constructor for a new UploadCollectionParameter.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Defines a structure of the element of the 'parameters' aggregation.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.88
	 * @alias sap.m.UploadCollectionParameter
	 */
	var UploadCollectionParameter = Element.extend("sap.m.UploadCollectionParameter", /** @lends sap.m.UploadCollectionParameter.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Specifies the name of the parameter.
				 * @since 1.12.2
				 */
				name: {type: "string", group: "Data", defaultValue: null},

				/**
				 * Specifies the value of the parameter.
				 * @since 1.12.2
				 */
				value: {type: "string", group: "Data", defaultValue: null}
			}
		}
	});

	return UploadCollectionParameter;

});
