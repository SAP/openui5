/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.TableRow.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./thirdparty/ui5-wc-bundles/TableRow"
], function(WebComponent) {
	"use strict";

	/**
	 * Constructor for a new <code>TableRow</code>.
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
	 * @alias sap.ui.webcomponents.TableRow
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TableRow = WebComponent.extend("sap.ui.webcomponents.TableRow", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-table-row",
			properties: {

			},
			defaultAggregation: "cells",
			aggregations: {
				cells: {
					type: "sap.ui.webcomponents.TableCell",
					multiple: true
				}
			}
		}
	});

	return TableRow;
});
