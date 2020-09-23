/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.TableCell.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./thirdparty/ui5-wc-bundles/TableCell"
], function(WebComponent) {
	"use strict";

	/**
	 * Constructor for a new <code>TableCell</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.84
	 * @alias sap.ui.webcomponents.TableCell
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TableCell = WebComponent.extend("sap.ui.webcomponents.TableCell", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-table-cell",
			properties: {

			},
			defaultAggregation: "content",
			aggregations: {
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		}
	});

	return TableCell;
});
