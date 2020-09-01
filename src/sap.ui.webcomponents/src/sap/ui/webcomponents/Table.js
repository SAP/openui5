/*!
 * ${copyright}
 */

// Provides control sap.ui.webcomponents.Table.
sap.ui.define([
	"sap/ui/core/webcomp/WebComponent",
	"./thirdparty/ui5-wc-bundles/Table"
], function(WebComponent, WC) {
	"use strict";

	/**
	 * Constructor for a new <code>Table</code>.
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
	 * @alias sap.ui.webcomponents.Table
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Table = WebComponent.extend("sap.ui.webcomponents.Table", {
		metadata: {
			library: "sap.ui.webcomponents",
			tag: "ui5-table",
			properties: {

				width : {
					type : "sap.ui.core.CSSSize",
					group : "Misc",
					defaultValue : null,
					mapping: "style"
				},

				/**
				 * Defines the text that will be displayed when there is no data and <code>showNoData</code> is present.
				 *
				 * @type {string}
				 * @defaultvalue ""
				 * @public
				 */
				noDataText: {
					type: "string"
				},

				/**
				 * Defines if the value of <code>noDataText</code> will be diplayed when there is no rows present in the table.
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				showNoData: {
					type: "boolean"
				},
				/**
				 * Determines whether the column headers remain fixed at the top of the page during
				 * vertical scrolling as long as the Web Component is in the viewport.
				 * <br><br>
				 * <b>Limitations:</b>
				 * <ul>
				 * <li>Browsers that do not support this feature:
				 * <ul>
				 * <li>Internet Explorer</li>
				 * <li>Microsoft Edge lower than version 41 (EdgeHTML 16)</li>
				 * <li>Mozilla Firefox lower than version 59</li>
				 * </ul>
				 * </li>
				 * <li>Scrolling behavior:
				 * <ul>
				 * <li>If the Web Component is placed in layout containers that have the <code>overflow: hidden</code>
				 * or <code>overflow: auto</code> style definition, this can
				 * prevent the sticky elements of the Web Component from becoming fixed at the top of the viewport.</li>
				 * </ul>
				 * </li>
				 * </ul>
				 *
				 * @type {boolean}
				 * @defaultvalue false
				 * @public
				 */
				stickyColumnHeader: {
					type: "boolean"
				}
			},
			defaultAggregation: "rows",
			aggregations: {
				rows: {
					type: "sap.ui.webcomponents.TableRow",
					multiple: true
				},
				columns: {
					type: "sap.ui.webcomponents.TableColumn",
					multiple: true,
					slot: "columns"
				}
			},
			events: {
				rowClick: {},
				popinChange: {}
			}
		}
	});

	return Table;
});
