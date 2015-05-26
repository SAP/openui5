/*!
 * ${copyright}
 */

// Provides control sap.m.QuickViewGroup
sap.ui.define([
		'jquery.sap.global', './library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
		"use strict";

		/**
		 * Constructor for a new QuickViewGroup.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 * @class QuickViewGroup consists of a title (optional) and an entity of group elements.
		 * @extends sap.ui.core.Element
		 * @author SAP SE
		 * @constructor
		 * @public
		 * @alias sap.m.QuickViewGroup
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Group = Element.extend("sap.m.QuickViewGroup",
			{
				metadata: {

					library: "sap.m",
					properties: {

						/**
						 * Whether the group should be visible on the screen.
						 */
						visible : {
							type: "boolean",
							group : "Appearance",
							defaultValue: true
						},

						/**
						 * The title of the group
						 */
						heading: {
							type: "string",
							group: "Misc",
							defaultValue: ""
						}
					},
					defaultAggregation: "elements",
					aggregations: {

						/**
						 * A combination of one label and another control (Link or Text) associated to this label.
						 */
						elements: {
							type: "sap.m.QuickViewGroupElement",
							multiple: true,
							singularName: "element",
							bindable: "bindable"
						}
					}
				}
			});

		return Group;

	}, /* bExport= */true);
