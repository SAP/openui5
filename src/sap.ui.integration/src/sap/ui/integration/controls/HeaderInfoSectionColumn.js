/*!
* ${copyright}
*/

sap.ui.define([
	"sap/ui/core/Control",
	"./HeaderInfoSectionColumnRenderer"
], function (
	Control,
	HeaderInfoSectionColumnRenderer
) {
	"use strict";
	/**
	 * Constructor for a new HeaderInfoSectionColumn.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.integration.controls.HeaderInfoSectionColumn
	 */
	var HeaderInfoSectionColumn = Control.extend("sap.ui.integration.controls.HeaderInfoSectionColumn", {
		metadata: {
			library: "sap.ui.integration",
			properties: {
			},
			defaultAggregation : "items",
			aggregations: {
				rows: {
					type: "sap.ui.core.Control",
					multiple: true
				},
				items: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		},
		renderer: HeaderInfoSectionColumnRenderer
	});
	return HeaderInfoSectionColumn;
});