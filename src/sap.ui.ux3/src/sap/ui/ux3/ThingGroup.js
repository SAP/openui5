/*!
 * ${copyright}
 */

// Provides control sap.ui.ux3.ThingGroup.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element) {
	"use strict";



	/**
	 * Constructor for a new ThingGroup.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Thing Group Area
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38.
	 * @alias sap.ui.ux3.ThingGroup
	 */
	var ThingGroup = Element.extend("sap.ui.ux3.ThingGroup", /** @lends sap.ui.ux3.ThingGroup.prototype */ { metadata : {

		deprecated: true,
		library : "sap.ui.ux3",
		properties : {

			/**
			 * Title of Group
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * If Group is used in a column layout the groups spans the all columns if set to true.
			 */
			colspan : {type : "boolean", group : "Misc", defaultValue : false}
		},
		defaultAggregation : "content",
		aggregations : {

			/**
			 * Content of Group
			 */
			content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"},

			/**
			 * Actions of the groups content
			 */
			actions : {type : "sap.ui.ux3.ThingGroup", multiple : true, singularName : "action"}
		}
	}});

	return ThingGroup;

});
