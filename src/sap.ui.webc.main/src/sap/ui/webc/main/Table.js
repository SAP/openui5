/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.Table.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/Table"
], function(WebComponent, library) {
	"use strict";

	var TableGrowingMode = library.TableGrowingMode;
	var TableMode = library.TableMode;

	/**
	 * Constructor for a new <code>Table</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.Table</code> component provides a set of sophisticated and convenient functions for responsive table design. It provides a comprehensive set of features for displaying and dealing with vast amounts of data. <br>
	 * <br>
	 * To render the <code>Table</code> properly, the order of the <code>columns</code> should match with the order of the item <code>cells</code> in the <code>rows</code>. <br>
	 * <br>
	 * Desktop and tablet devices are supported. On tablets, special consideration should be given to the number of visible columns and rows due to the limited performance of some devices.
	 *
	 * <h3>Selection</h3> To benefit from the selection mechanism of <code>sap.ui.webc.main.Table</code> component, you can use the available selection modes: <code>SingleSelect</code> and <code>MultiSelect</code>. <br>
	 * In additition to the used mode, you can also specify the <code>sap.ui.webc.main.TableRow</code> type choosing between <code>Active</code> or <code>Inactive</code>. <br>
	 * <br>
	 * In <code>SingleSelect</code> mode, you can select both an <code>Active</code> and <code>Inactive</code> row via mouse or by pressing the <code>Space</code> or <code>Enter</code> keys. <br>
	 * In <code>MultiSelect</code> mode, you can select both an <code>Active</code> and <code>Inactive</code> row by pressing the <code>Space</code> key when a row is on focus or via mouse click over the selection checkbox of the row. In order to select all the available rows at once, you can use the selection checkbox presented in the table's header. <br>
	 * <br>
	 * <b>Note:</b> Currently, when a column is shown as a pop-in, the visual indication for selection is not presented over it.
	 *
	 * <h3>Keyboard Handling</h3>
	 *
	 *
	 *
	 * <ul>
	 *     <li>[F7] - If focus is on an interactive control inside an item, moves focus to the corresponding item.</li>
	 *     <li>[CTRL]+[A] - Selects all items, if MultiSelect mode is enabled.</li>
	 *     <li>[HOME]/[END] - Focuses the first/last item.</li>
	 *     <li>[PAGEUP]/[PAGEDOWN] - Moves focus up/down by page size (20 items by default).</li>
	 *     <li>[ALT]+[DOWN]/[UP] - Switches focus between header, last focused item, and More button (if applies) in either direction.</li>
	 *     <li>[SHIFT]+[DOWN]/[UP] - Selects the next/previous item in a MultiSelect table, if the current item is selected (Range selection). Otherwise, deselects them (Range deselection).</li>
	 *     <li>[SHIFT]+[HOME]/[END] - Range selection to the first/last item of the List.</li>
	 *     <li>[CTRL]+[HOME]/[END] - Same behavior as HOME & END.</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.Table
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Table = WebComponent.extend("sap.ui.webc.main.Table", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-table-ui5",
			properties: {

				/**
				 * Defines the accessible aria name of the component.
				 */
				accessibleName: {
					type: "string"
				},

				/**
				 * Defines if the table is in busy state. <b>
				 *
				 *     In this state the component's opacity is reduced and busy indicator is displayed at the bottom of the table.
				 */
				busy: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the delay in milliseconds, after which the busy indicator will show up for this component.
				 */
				busyDelay: {
					type: "int",
					defaultValue: 1000
				},

				/**
				 * Defines whether the table will have growing capability either by pressing a <code>More</code> button, or via user scroll. In both cases <code>load-more</code> event is fired. <br>
				 * <br>
				 *
				 *
				 * Available options: <br>
				 * <br>
				 * <code>Button</code> - Shows a <code>More</code> button at the bottom of the table, pressing of which triggers the <code>load-more</code> event. <br>
				 * <code>Scroll</code> - The <code>load-more</code> event is triggered when the user scrolls to the bottom of the table; <br>
				 * <code>None</code> (default) - The growing is off. <br>
				 * <br>
				 *
				 *
				 * <b>Restrictions:</b> <code>growing="Scroll"</code> is not supported for Internet Explorer, and the component will fallback to <code>growing="Button"</code>.
				 */
				growing: {
					type: "sap.ui.webc.main.TableGrowingMode",
					defaultValue: TableGrowingMode.None
				},

				/**
				 * Defines the subtext that will be displayed under the <code>growingButtonText</code>.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> This property takes effect if <code>growing</code> is set to <code>Button</code>.
				 */
				growingButtonSubtext: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the text that will be displayed inside the growing button at the bottom of the table, meant for loading more rows upon press.
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> If not specified a built-in text will be displayed. <br>
				 * <b>Note:</b> This property takes effect if <code>growing</code> is set to <code>Button</code>.
				 */
				growingButtonText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the height of the control
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				},

				/**
				 * Defines if the value of <code>noDataText</code> will be diplayed when there is no rows present in the table.
				 */
				hideNoData: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the mode of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>MultiSelect</code></li>
				 *     <li><code>SingleSelect</code></li>
				 *     <li><code>None</code></li>
				 *     <ul>
				 */
				mode: {
					type: "sap.ui.webc.main.TableMode",
					defaultValue: TableMode.None
				},

				/**
				 * Defines the text that will be displayed when there is no data and <code>hideNoData</code> is not present.
				 */
				noDataText: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Determines whether the column headers remain fixed at the top of the page during vertical scrolling as long as the Web Component is in the viewport. <br>
				 * <br>
				 * <b>Restrictions:</b>
				 * <ul>
				 *     <li>Browsers that do not support this feature:
				 *         <ul>
				 *             <li>Internet Explorer</li>
				 *             <li>Microsoft Edge lower than version 41 (EdgeHTML 16)</li>
				 *             <li>Mozilla Firefox lower than version 59</li>
				 *         </ul>
				 *     </li>
				 *     <li>Scrolling behavior:
				 *         <ul>
				 *             <li>If the Web Component is placed in layout containers that have the <code>overflow: hidden</code> or <code>overflow: auto</code> style definition, this can prevent the sticky elements of the Web Component from becoming fixed at the top of the viewport.</li>
				 *         </ul>
				 *     </li>
				 * </ul>
				 */
				stickyColumnHeader: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "rows",
			aggregations: {

				/**
				 * Defines the configuration for the columns of the component. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.TableColumn</code> for the intended design.
				 */
				columns: {
					type: "sap.ui.webc.main.ITableColumn",
					multiple: true,
					slot: "columns"
				},

				/**
				 * Defines the component rows. <br>
				 * <br>
				 * <b>Note:</b> Use <code>sap.ui.webc.main.TableRow</code> for the intended design.
				 */
				rows: {
					type: "sap.ui.webc.main.ITableRow",
					multiple: true
				}
			},
			associations: {

				/**
				 * Receives id(or many ids) of the controls that label this control.
				 */
				ariaLabelledBy: {
					type: "sap.ui.core.Control",
					multiple: true,
					mapping: {
						type: "property",
						to: "accessibleNameRef",
						formatter: "_getAriaLabelledByForRendering"
					}
				}
			},
			events: {

				/**
				 * Fired when the user presses the <code>More</code> button or scrolls to the table's end. <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> The event will be fired if <code>growing</code> is set to <code>Button</code> or <code>Scroll</code>.
				 */
				loadMore: {
					parameters: {}
				},

				/**
				 * Fired when <code>sap.ui.webc.main.TableColumn</code> is shown as a pop-in instead of hiding it.
				 */
				popinChange: {
					parameters: {
						/**
						 * popped-in columns.
						 */
						poppedColumns: {
							type: "Array"
						}
					}
				},

				/**
				 * Fired when a row in <code>Active</code> mode is clicked or <code>Enter</code> key is pressed.
				 */
				rowClick: {
					parameters: {
						/**
						 * the activated row.
						 */
						row: {
							type: "HTMLElement"
						}
					}
				},

				/**
				 * Fired when selection is changed by user interaction in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
				 */
				selectionChange: {
					parameters: {
						/**
						 * An array of the selected rows.
						 */
						selectedRows: {
							type: "Array"
						},

						/**
						 * An array of the previously selected rows.
						 */
						previouslySelectedRows: {
							type: "Array"
						}
					}
				}
			},
			designtime: "sap/ui/webc/main/designtime/Table.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return Table;
});