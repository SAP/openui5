/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.TableRow.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/TableRow"
], function(WebComponent, library) {
	"use strict";

	var TableRowType = library.TableRowType;

	/**
	 * Constructor for a new <code>TableRow</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.TableRow</code> component represents a row in the <code>sap.ui.webc.main.Table</code>.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.TableRow</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>row - Used to style the native <code>tr</code> element</li>
	 *     <li>popin-row - Used to style the <code>tr</code> element when a row pops in</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.TableRow
	 * @implements sap.ui.webc.main.ITableRow
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var TableRow = WebComponent.extend("sap.ui.webc.main.TableRow", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-table-row-ui5",
			interfaces: [
				"sap.ui.webc.main.ITableRow"
			],
			properties: {

				/**
				 * Defines the row's selected state.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the visual indication and behavior of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>Active</code></li>
				 *     <li><code>Inactive</code></li>
				 * </ul> <br>
				 * <br>
				 * <b>Note:</b> When set to <code>Active</code>, the item will provide visual response upon press, while with type <code>Inactive</code> - will not.
				 */
				type: {
					type: "sap.ui.webc.main.TableRowType",
					defaultValue: TableRowType.Inactive
				}
			},
			defaultAggregation: "cells",
			aggregations: {

				/**
				 * Defines the cells of the component. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.TableCell</code> for the intended design.
				 */
				cells: {
					type: "sap.ui.webc.main.ITableCell",
					multiple: true
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return TableRow;
});