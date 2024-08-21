/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/Device",
	"sap/ui/core/Control",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/util/PasteHelper",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/BindingMode",
	"./Column",
	"./Row",
	"./library",
	"./utils/TableUtils",
	"./extensions/ExtensionBase",
	"./extensions/Accessibility",
	"./extensions/Keyboard",
	"./extensions/Pointer",
	"./extensions/Scrolling",
	"./extensions/DragAndDrop",
	"./TableRenderer",
	"./rowmodes/Type",
	"./rowmodes/Fixed",
	"./rowmodes/Interactive",
	"./rowmodes/Auto",
	"./plugins/SelectionModelSelection",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/ui/core/AnimationMode",
	"sap/ui/core/library"
], function(
	Localization,
	Device,
	Control,
	ControlBehavior,
	PasteHelper,
	ChangeReason,
	Filter,
	Sorter,
	BindingMode,
	Column,
	Row,
	library,
	TableUtils,
	ExtensionBase,
	AccExtension,
	KeyboardExtension,
	PointerExtension,
	ScrollExtension,
	DragAndDropExtension,
	TableRenderer,
	RowModeType,
	FixedRowMode,
	InteractiveRowMode,
	AutoRowMode,
	SelectionModelSelectionPlugin,
	jQuery,
	Log,
	AnimationMode,
	CoreLibrary
) {
	"use strict";

	const SelectionMode = library.SelectionMode;
	const SelectionBehavior = library.SelectionBehavior;
	const SortOrder = CoreLibrary.SortOrder;
	const Hook = TableUtils.Hook.Keys.Table;
	const _private = TableUtils.createWeakMapFacade();

	/**
	 * Constructor for a new Table.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * <p>
	 *     Provides a comprehensive set of features for displaying and dealing with vast amounts of data. The Table control supports
	 *     desktop PCs and tablet devices. On tablets, special consideration should be given to the number of visible columns
	 *     and rows due to the limited performance of some devices.
	 * </p>
	 * <p>
	 *     In order to keep the document DOM as lean as possible, the Table control reuses its DOM elements of the rows.
	 *     When the user scrolls, only the row contexts are changed but the rendered controls remain the same. This allows
	 *     the Table control to handle huge amounts of data. Nevertheless, restrictions apply regarding the number of displayed
	 *     columns. Keep the number as low as possible to improve performance. Due to the nature of tables, the used
	 *     control for column templates also has a big influence on the performance.
	 *     Because of the described reuse of the controls during scrolling, all data-related changes must be based on bindings. Static changes, such as
	 *     calling mutator functions or defining a one-time binding, must be avoided.
	 * </p>
	 * <p>
	 *     The Table control relies completely on data binding, and its supported feature set is tightly coupled to
	 *     the data model and binding being used.
	 * </p>
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.Table
	 * @see {@link topic:08197fa68e4f479cbe30f639cc1cd22c sap.ui.table}
	 * @see {@link topic:148892ff9aea4a18b912829791e38f3e Tables: Which One Should I Choose?}
	 * @see {@link fiori:/grid-table/ Grid Table}
	 */
	const Table = Control.extend("sap.ui.table.Table", /** @lends sap.ui.table.Table.prototype */ {metadata: {
		library: "sap.ui.table",
		dnd: true,
		properties: {
			/**
			 * Width of the Table.
			 */
			width: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: 'auto'},

			/**
			 * Header row height in pixel. If a value greater than 0 is set, it overrides the height defined in the <code>rowHeight</code> property
			 * for the rows in the table's header. The value defines the minimum height, but it cannot be less than the default height based on the
			 * content density configuration. The actual height can increase based on the content.
			 *
			 * <b>Note</b>: In a {@link sap.ui.table.Column#getMultiLabels MultiLabel} scenario, the height is applied to each individual row of the
			 * table's header.
			 */
			columnHeaderHeight: {type: "int", group: "Appearance", defaultValue: null},

			/**
			 * Flag whether the column header is visible or not.
			 *
			 * <b>Caution:</b> Please be aware that when setting this property to <code>false</code>,
			 * a 100% accessibility of the table can't be guaranteed any more.
			 */
			columnHeaderVisible: {type: "boolean", group: "Appearance", defaultValue: true},

			/**
			 * First visible row.
			 */
			firstVisibleRow: {type: "int", group: "Appearance", defaultValue: 0},

			/**
			 * Selection mode of the Table. This property controls whether single or multiple rows can be selected and
			 * how the selection can be extended. It may also influence the visual appearance.
			 * When the selection mode is changed, the current selection is removed.
			 * <b>Note:</b> Since the group header visualization relies on the row selectors, the row selectors are always shown if the grouping
			 * functionality (depends on table type) is enabled, even if <code>sap.ui.table.SelectionMode.None</code> is set.
			 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
			 * it is recommended to use a selection plugin instead.
			 * <b>Note:</b> If a selection plugin is used with the table, the selection mode is controlled by the plugin.
			 */
			selectionMode: {type: "sap.ui.table.SelectionMode", group: "Behavior", defaultValue: SelectionMode.MultiToggle},

			/**
			 * Selection behavior of the Table. This property defines whether the row selector is displayed and whether the row, the row selector or
			 * both can be clicked to select a row.
			 * <b>Note:</b> Since the group header visualization relies on the row selectors, the row selectors are always shown if the grouping
			 * functionality (depends on table type) is enabled, even if <code>sap.ui.table.SelectionBehavior.RowOnly</code> is set.
			 */
			selectionBehavior: {type: "sap.ui.table.SelectionBehavior", group: "Behavior", defaultValue: SelectionBehavior.RowSelector},

			/**
			 * Defines how many additional (not yet visible) data records from the back-end system are pre-fetched to enable
			 * smooth scrolling. The threshold is always added to the number of rows. If the number of rows is 10 and the
			 * <code>threshold</code> is 100, 110 records will be fetched with the initial load. This property affects
			 * requests triggered by changes in the binding, for example, initial loading, sorting, filtering, etc. The
			 * threshold that is applied during scrolling can be configured with the <code>scrollThreshold</code> property.
			 * If the <code>threshold</code> is lower than the number of rows in the scrollable area (<code>visibleRowCount</code>
			 * minus number of fixed rows), this number is used as the <code>threshold</code>. If the value is 0, thresholding
			 * is disabled.
			 */
			threshold: {type: "int", group: "Behavior", defaultValue: 100},

			/**
			 * Defines how many additional data records are requested from the back-end system when the user scrolls vertically
			 * in the table. The <code>scrollThreshold</code> is always added to the number of rows. If the number of rows is 10
			 * and the <code>scrollThreshold</code> is 100, 110 records will be fetched during scrolling. The threshold that is
			 * applied to requests that are not initiated by scrolling can be configured with the <code>threshold</code> property.
			 * If the <code>scrollThreshold</code> is lower than the number of rows in the scrollable area (number of rows minus
			 * number of fixed rows), this number is used as the <code>scrollThreshold</code>. If the value is 0, no threshold is
			 * applied during scrolling. The value -1 applies the same value as the <code>threshold</code> property.
			 *
			 * <b>Note:</b> This property only takes effect if it is set to a positive integer value.
			 *
			 * For <code>AnalyticalTable</code> and <code>TreeTable</code>, the <code>scrollThreshold</code> property must be
			 * higher than the <code>threshold</code> property to take effect.
			 *
			 * @since 1.128
			 */
			scrollThreshold: {type: "int", group: "Behavior", defaultValue: -1},

			/**
			 * Flag to enable or disable column reordering
			 *
			 * <b>Note</b>: Column reordering is possible via drag&drop and keyboard shortcuts. Single-pointer alternative is not provided
			 * out-of-the-box and should be implemented on application side. For example the {@link sap.m.p13n.Engine} can be used, see the following
			 * sample:
			 * {@link https://ui5.sap.com/#/entity/sap.ui.table.Table/sample/sap.m.sample.p13n.EngineGridTable Personalization for grid table}.
			 */
			enableColumnReordering: {type: "boolean", group: "Behavior", defaultValue: true},

			/**
			 * Flag whether to show the no data overlay or not once the table is empty. If set to false
			 * the table will just show a grid of empty cells
			 */
			showNoData: {type: "boolean", group: "Appearance", defaultValue: true},

			/**
			 * Number of columns that are fixed on the left. Only columns which are not fixed can be scrolled horizontally.
			 *
			 * <b>Note</b>
			 * <ul>
			 *   <li>Fixed columns need a defined width for the feature to work.</li>
			 *   <li>The aggregated width of all fixed columns must not exceed the table width. Otherwise the table ignores the value of the
			 *       property and adapts the behavior in an appropriate way to ensure that the user is still able to scroll horizontally.</li>
			 * </ul>
			 */
			fixedColumnCount: {type: "int", group: "Appearance", defaultValue: 0},

			/**
			 * Flag whether to show or hide the column menu item to freeze or unfreeze a column.
			 * @since 1.21.0
			 */
			enableColumnFreeze: {type: "boolean", group: "Behavior", defaultValue: false},

			/**
			 * Flag whether to enable or disable the context menu on cells to trigger a filtering with the cell value.
			 * @since 1.21.0
			 */
			enableCellFilter: {type: "boolean", group: "Behavior", defaultValue: false},

			/**
			 * Setting this property to true will show an overlay on top of the Table content and users cannot click anymore on the Table content.
			 * @since 1.21.2
			 */
			showOverlay: {type: "boolean", group: "Appearance", defaultValue: false},

			/**
			 * Specifies if a select all button should be displayed in the top left corner. This button is only displayed
			 * if the row selector is visible and the selection mode is set to any kind of multi selection.
			 * @since 1.23.0
			 */
			enableSelectAll: {type: "boolean", group: "Behavior", defaultValue: true},

			/**
			 * Set this parameter to true to implement your own filter behaviour. Instead of the filter input box a button
			 * will be rendered for which' press event (customFilter) you can register an event handler.
			 * @since 1.23.0
			 */
			enableCustomFilter: {type: "boolean", group: "Behavior", defaultValue: false},

			/**
			 * If set to <code>true</code>, the table changes its busy state, resulting in showing or hiding the busy indicator.
			 * The table will switch to busy as soon as data is retrieved to be displayed in the currently visible rows. This happens,
			 * for example, during scrolling, filtering, or sorting. As soon as the data has been retrieved, the table switches back to not busy.
			 * The busy state of the table can still be set manually by calling {@link sap.ui.core.Control#setBusy}.
			 * @since 1.27.0
			 */
			enableBusyIndicator: {type: "boolean", group: "Behavior", defaultValue: false},

			/**
			 * Number of row actions made visible which determines the width of the row action column.
			 * The values <code>0</code>, <code>1</code> and <code>2</code> are possible.
			 * @since 1.45.0
			 */
			rowActionCount: {type: "int", group: "Appearance", defaultValue: 0},

			/**
			 * Enables alternating table row colors.
			 * Alternate row coloring is not available for the tree mode.
			 * @since 1.52
			 */
			alternateRowColors: {type: "boolean", group: "Appearance", defaultValue: false},

			/**
			 * Constraints on the row counts of the table. May impact the result of the row count computation in the row modes.
			 * This hidden property may only be used indirectly by row modes and may not be used otherwise.
			 *
			 * @see sap.ui.table.plugins.PluginBase#setRowCountConstraints
			 * @see sap.ui.table.rowmodes.RowMode#getRowCountConstraints
			 * @private
			 */
			rowCountConstraints: {type: "object", visibility: "hidden"}
		},
		defaultAggregation: "columns",
		aggregations: {
			/**
			 * Control or text of footer section of the Table (if not set it will be hidden).
			 *
			 * <b>Note:</b> The <code>altType</code> string is deprecated as of version 1.118. Use a <code>Control</code> instead.
			 */
			footer: {type: "sap.ui.core.Control", altTypes: ["string"], multiple: false},

			/**
			 * Extension section of the Table.
			 * If not set, no extension area will be rendered.
			 * Note: In case a <code>sap.m.Toolbar</code> is used as header the CSS class sapMTBHeader-CTX should be applied on this toolbar.
			 */
			extension: {type: "sap.ui.core.Control", multiple: true, singularName: "extension"},

			/**
			 * Columns of the Table
			 */
			columns: {type: "sap.ui.table.Column", defaultClass: Column, multiple: true, singularName: "column", bindable: "bindable", dnd: {layout: "Horizontal"}},

			/**
			 * This aggregation is managed by the table itself. It can only be used with data binding, is read-only, and does not support templates or
			 * factories.
			 *
			 * Rows are created and rendered only for a subset of the available data and reused for performance reasons. When scrolling, only the
			 * binding contexts are updated to show the correct section of the data. This makes it possible to bind the rows to large data sets.
			 * But you must not change rows and their children programmatically, as these changes might get lost when the table updates the rows
			 * the next time. Also, properties must not be set to static values, as these would not change when scrolling.
			 *
			 * The cells of rows can be defined with the {@link sap.ui.table.Column#setTemplate template} aggregation of the columns in the
			 * {@link sap.ui.table.Table#getColumns columns} aggregation of the table.
			 * The actions of rows can be defined with the {@link sap.ui.table.Table#setRowActionTemplate rowActionTemplate} aggregation of the table.
			 * Furthermore, row-specific settings can be defined with the {@link sap.ui.table.Table#setRowSettingsTemplate rowSettingsTemplate}
			 * aggregation of the table.
			 *
			 * <b>Note:</b> During the binding of rows, the (exact) count needs to be available in the table and has to be requested.
			 * If the count is not requested, this may lead to unexpected behavior in the table, such as scrolling, accessibility, or keyboard issues.
			 * Please refer to the documentation of the used model for information on requesting the count, for example, {@link sap.ui.model.odata.v2.ODataModel}
			 * or {@link sap.ui.model.odata.v4.ODataModel}.
			 */
			rows: {type: "sap.ui.table.Row", multiple: true, singularName: "row", bindable: "bindable", selector: "#{id}-tableCCnt", dnd: true},

			/**
			 * Defines how the table handles the rows. By default, the table operates in {@link sap.ui.table.rowmodes.Type Fixed} mode.
			 *
			 * @since 1.119
			 */
			rowMode: {
				type: "sap.ui.table.rowmodes.RowMode",
				multiple: false,
				altTypes: ["sap.ui.table.rowmodes.Type"]
			},

			/**
			 * This row can be used for user input to create new data.
			 * Like in any other row, the cells of this row are also managed by the table and must not be modified. The cell content is defined
			 * via the <code>creationTemplate</code> aggregation of the {@link sap.ui.table.Column}.
			 * If the creation row is set, the busy indicator will no longer cover the horizontal scrollbar, even if the creation row is invisible.
			 *
			 * @private
			 * @ui5-private sap.ui.mdc
			 */
			creationRow: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

			/**
			 * The value for the noData aggregation can be either a string value or a control instance.
			 * The control is shown, in case there is no data for the Table available. In case of a string
			 * value this will simply replace the no data text.
			 */
			noData: {type: "sap.ui.core.Control", altTypes: ["string"], multiple: false},

			/**
			 * The control that is shown in case the Table has no visible columns.
			 *
			 * @private
			 * @ui5-private sap.ui.mdc, sap.ui.comp
			 */
			_noColumnsMessage: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

			/**
			 * Template for row actions. A template is decoupled from the row or table. Each time
			 * the template's properties or aggregations are changed, the template has to be applied again via
			 * <code>setRowActionTemplate</code> for the changes to take effect.
			 */
			rowActionTemplate: {type: "sap.ui.table.RowAction", multiple: false},

			/**
			 * Template for row settings. A template is decoupled from the row or table. Each time
			 * the template's properties or aggregations are changed, the template has to be applied again via
			 * <code>setRowSettingsTemplate</code> for the changes to take effect.
			 */
			rowSettingsTemplate: {type: "sap.ui.table.RowSettings", multiple: false},

			/**
			 * Defines the context menu for the table.
			 *
			 * <b>Note:</b> The context menu will also be available for the row selectors as well as in the row actions cell of the table control.
			 *
			 * The custom context menu will not be shown in group header and summary rows.
			 *
			 * If this aggregation is set, then the <code>enableCellFilter</code> property will have no effect.
			 *
			 * @since 1.54
			 */
			contextMenu: {type: "sap.ui.core.IContextMenu", multiple: false},

			/**
			 * Defines the message strip to display binding-related messages.
			 * @since 1.73
			 */
			_messageStrip: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

			/**
			 * Hidden dependents are dependents that are not cloned. But like for normal dependents, their data binding context and
			 * lifecycle are bound to the table.
			 *
			 * @since 1.75
			 */
			_hiddenDependents: {type: "sap.ui.core.Element", multiple: true, visibility: "hidden"}
		},
		associations: {
			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		},
		events: {
			/**
			 * Fired if the row selection of the table has been changed.
			 *
			 * The event parameters can be used to determine selection changes. To find the selected rows, you should
			 * use {@link sap.ui.table.Table#getSelectedIndices} or the related function of the used selection plugin
			 * if it exists.
			 *
			 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
			 * it is recommended to use a selection plugin instead.
			 * <b>Note:</b> If a selection plugin is used with the table, this event won't be fired.
			 */
			rowSelectionChange: {
				parameters: {

					/**
					 * row index which has been clicked so that the selection has been changed (either selected or deselected)
					 */
					rowIndex: {type: "int"},

					/**
					 * binding context of the row which has been clicked so that selection has been changed
					 */
					rowContext: {type: "sap.ui.model.Context"},

					/**
					 * array of row indices which selection has been changed (either selected or deselected)
					 */
					rowIndices: {type: "int[]"},

					/**
					 * indicator if "select all" function is used to select rows
					 */
					selectAll: {type: "boolean"},

					/**
					 * indicates that the event was fired due to an explicit user interaction like clicking the row header
					 * or using the keyboard (SPACE or ENTER) to select a row or a range of rows.
					 */
					userInteraction: {type: "boolean"}
				}
			},

			/**
			 * fired when a table column is resized.
			 */
			columnResize: {
				allowPreventDefault: true,
				parameters: {

					/**
					 * resized column.
					 */
					column: {type: "sap.ui.table.Column"},

					/**
					 * new width of the table column as CSS Size definition.
					 */
					width: {type: "sap.ui.core.CSSSize"}
				}
			},

			/**
			 * fired when a table column is moved.
			 */
			columnMove: {
				allowPreventDefault: true,
				parameters: {

					/**
					 * moved column.
					 */
					column: {type: "sap.ui.table.Column"},

					/**
					 * new position of the column.
					 */
					newPos: {type: "int"}
				}
			},

			/**
			 * This event is fired before a sort order is
			 * applied to a column, if the table is sorted
			 * via {@link sap.ui.table.Table#sort} call or
			 * user interaction with the column header.
			 *
			 * Sorters that are directly applied to the table
			 * binding will not fire this event.
			 */
			sort: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * The column for which the sorting is changed
					 */
					column: {type: "sap.ui.table.Column"},

					/**
					 * The new sort order
					 */
					sortOrder: {type: "sap.ui.core.SortOrder"},

					/**
					 * Indicates that the column is added to the list of sorted columns
					 */
					columnAdded: {type: "boolean"}
				}
			},

			/**
			 * This event is fired before a filter is applied
			 * to a column, if the table is filtered via
			 * {@link sap.ui.table.Table#filter} call or user
			 * interaction with the column header.
			 *
			 * Filters that are directly applied to the table
			 * binding will not fire this event.
			 */
			filter: {
				allowPreventDefault: true,
				parameters: {

					/**
					 * filtered column.
					 */
					column: {type: "sap.ui.table.Column"},

					/**
					 * filter value.
					 */
					value: {type: "string"}
				}
			},

			/**
			 * fired when the user clicks a cell of the table (experimental!).
			 * @since 1.21.0
			 */
			cellClick: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * The control of the cell.
					 */
					cellControl: {type: "sap.ui.core.Control"},

					/**
					 * DOM reference of the clicked cell. Can be used to position the context menu.
					 */
					cellDomRef: {type: "Object"},

					/**
					 * Row index of the selected cell.
					 */
					rowIndex: {type: "int"},

					/**
					 * Column index of the selected cell. This is the index of visible columns and might differ from
					 * the index maintained in the column aggregation.
					 */
					columnIndex: {type: "int"},

					/**
					 * Column ID of the selected cell.
					 */
					columnId: {type: "string"},

					/**
					 * Row binding context of the selected cell.
					 */
					rowBindingContext: {type: "sap.ui.model.Context"}
				}
			},

			/**
			 * Fired when the {@link sap.ui.table.Table#setContextMenu context menu} is opened.
			 * When the context menu is opened, the binding context of the row is set to the context menu.
			 *
			 * @since 1.54
			 */
			beforeOpenContextMenu: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * Row index where the context menu opens.
					 */
					rowIndex: {type: "int"},

					/**
					 * Column index where the context menu opens.
					 * This is the index of the column in the <code>columns</code> aggregation.
					 */
					columnIndex: {type: "int"},

					/**
					 * Context menu
					 */
					contextMenu: {type: "sap.ui.core.IContextMenu"}
				}
			},

			/**
			 * fired when a column of the table should be freezed
			 * @since 1.21.0
			 */
			columnFreeze: {
				allowPreventDefault: true,
				parameters: {

					/**
					 * reference to the column to freeze
					 */
					column: {type: "sap.ui.table.Column"}
				}
			},

			/**
			 * This event is triggered when the custom filter item of the column menu is pressed. The column on which the event was triggered is
			 * passed as parameter.
			 * @since 1.23.0
			 */
			customFilter: {
				parameters: {
					/**
					 * The column instance on which the custom filter button was pressed.
					 */
					column: {type: "sap.ui.table.Column"},

					/**
					 * Filter value.
					 */
					value: {type: "string"}
				}
			},

			/**
			 * This event gets fired when the first visible row is changed. It should only be used by composite controls.
			 * The event even is fired when setFirstVisibleRow is called programmatically.
			 * @since 1.37.0
			 * @protected
			 */
			firstVisibleRowChanged: {
				parameters: {
					/**
					 * First visible row
					 */
					firstVisibleRow: {type: "int"}
				}
			},

			/**
			 * This event gets fired when the busy state of the table changes. It should only be used by composite controls.
			 * @since 1.37.0
			 * @protected
			 */
			busyStateChanged: {
				parameters: {
					/**
					 * busy state
					 */
					busy: {type: "boolean"}
				}
			},

			/**
			 * This event gets fired when the user pastes content from the clipboard to the table.
			 * Pasting can be done with the standard keyboard shortcut, if the focus is inside the table.
			 * @since 1.60
			 */
			paste: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * 2D array of strings with data from the clipboard. The first dimension represents the rows, and the
					 * second dimension represents the cells of the tabular data.
					 */
					data: {type: "string[][]"}
				}
			},

			/**
			 * This event is fired after the table rows have been updated due to rendering, a model update, or a user
			 * interaction, for example.
			 *
			 * <b>Note</b>: This event is fired often and must not be used for performance-critical tasks.
			 *
			 * @since 1.86
			 */
			rowsUpdated: {

			}
		},
		designtime: "sap/ui/table/designtime/Table.designtime"
	}, renderer: TableRenderer});

	/**
	 * Gets content of aggregation <code>dragDropConfig</code> which defines the drag-and-drop configuration.
	 *
	 * The following restrictions apply:
	 * <ul>
	 *   <li>Columns cannot be configured to be draggable.</li>
	 *   <li>The following rows are not draggable:
	 *     <ul>
	 *       <li>Empty rows</li>
	 *       <li>Group header rows</li>
	 *       <li>Sum rows</li>
	 *     </ul>
	 *   </li>
	 *   <li>Columns cannot be configured to be droppable.</li>
	 *   <li>The following rows are not droppable:
	 *     <ul>
	 *       <li>The dragged row itself</li>
	 *       <li>Empty rows</li>
	 *       <li>Group header rows</li>
	 *       <li>Sum rows</li>
	 *     </ul>
	 *   </li>
	 * </ul>
	 *
	 * @name sap.ui.table.Table#getDragDropConfig
	 * @returns {sap.ui.core.dnd.DragDropBase[]}
	 * @function
	 * @public
	 * @since 1.52
	 */

	// =============================================================================
	// BASIC CONTROL API
	// =============================================================================

	/**
	 * Initialization of the Table control
	 * @private
	 */
	Table.prototype.init = function() {
		// Skip propagation of properties (models and bindingContexts).
		this.mSkipPropagation = {
			rowActionTemplate: true,
			rowSettingsTemplate: true
		};

		/*
		 * The binding length that the table currently knows and that is not affected by a rebind or refresh where the actual binding length is 0.
		 */
		_private(this).iCachedBindingLength = 0;

		_private(this).iFirstRenderedRowIndex = 0;
		_private(this).iComputedFixedColumnCount = null;

		// Extensions are part of the core of the table must be initialized first, for example for correct delegate order.
		this._attachExtensions();

		/*
		 * Flag indicating whether the text direction is RTL. If <code>false</code>, the text direction is LTR.
		 */
		this._bRtlMode = Localization.getRTL();

		/*
		 * Flag indicating whether the rows are currently being bound. This is the time between #bindRows and the actual instantiation of the
		 * binding object in #_bindAggregation.
		 *
		 * @type {boolean}
		 */
		this._bRowsBeingBound = false;

		/*
		 * Flag indicating whether the binding contexts are available.
		 * Is <code>false</code> if there is no binding, or the binding is being initialized or refreshed. Is set to <code>true</code>
		 * in {@link sap.ui.table.Table#updateRows}.
		 *
		 * @type {boolean}
		 */
		this._bContextsAvailable = false;

		/*
		 * Flag that indicates whether the user scrolled through the table.
		 * It is <code>false</code> if the current scroll position was set via API or the binding has been initialized or refreshed.
		 * It is set in {@link sap.ui.table.Table#_setFirstVisibleRowIndex} and {@link sap.ui.table.Table#updateRows}.
		 *
		 * @type {boolean}
		 */
		this._bScrolled = false;

		this._aRowClones = [];
		this._bRowAggregationInvalid = true;
		this._mTimeouts = {};
		this._mAnimationFrames = {};
		this._aRowHeights = [];
		this._aSortedColumns = [];
		this._aTableHeaders = [];

		// text selection for column headers?
		this._bAllowColumnHeaderTextSelection = false;

		_private(this).iPendingRequests = 0;
		this._iBindingLength = null;

		this._bFirstRendering = true;

		this._nDevicePixelRatio = window.devicePixelRatio;

		if (TableUtils.isThemeApplied()) {
			TableUtils.readThemeParameters();
		}

		this._bInvalid = true;
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.applySettings = function(mSettings, oScope) {
		// The threshold and firstVisibleRow must be set before the OData binding for the "rows" aggregation is initialized. If the metadata is
		// already loaded, a getContexts call may be triggered immediately with the default values instead of the one in the settings.
		// Some settings might rely on the existence of a row mode.
		if (mSettings) {
			const aEarlySettings = ["threshold", "firstVisibleRow", "rowMode"];
			const mEarlySettings = {};

			for (let i = 0; i < aEarlySettings.length; i++) {
				const sSetting = aEarlySettings[i];

				if (sSetting in mSettings) {
					mEarlySettings[sSetting] = mSettings[sSetting];
					delete mSettings[sSetting]; // Avoid applying it twice.
				}
			}

			if (Object.keys(mEarlySettings).length > 0) {
				Control.prototype.applySettings.call(this, mEarlySettings, oScope);
			}
		}

		this._initLegacySelectionPlugin(); // Doing it at the end can eliminate the need to create a legacy selection plugin.
		initDefaultRowMode(this);
		Control.prototype.applySettings.call(this, mSettings, oScope);
	};

	/**
	 * Attach table extensions
	 * @private
	 */
	Table.prototype._attachExtensions = function() {
		if (this._bExtensionsInitialized) {
			return;
		}

		ExtensionBase.enrich(this, PointerExtension);
		ExtensionBase.enrich(this, ScrollExtension);
		ExtensionBase.enrich(this, KeyboardExtension);
		ExtensionBase.enrich(this, AccExtension); // Must be registered after keyboard to reach correct delegate order
		ExtensionBase.enrich(this, DragAndDropExtension);

		if (Device.os.ios) {
			sap.ui.require(["sap/ui/table/extensions/ScrollingIOS"], function(ScrollingIOSExtension) {
				if (!this.bIsDestroyed) {
					ExtensionBase.enrich(this, ScrollingIOSExtension);
				}
			}.bind(this));
		}

		this._bExtensionsInitialized = true;
	};

	/**
	 * Termination of the Table control
	 * @private
	 */
	Table.prototype.exit = function() {
		this.invalidateRowsAggregation();
		this._detachExtensions();
		this._cleanUpTimers();
		this._detachEvents();
		TableUtils.Menu.cleanupDefaultContentCellContextMenu(this);
		clearHideBusyIndicatorTimeout(this);
		delete this._aTableHeaders;
	};

	/**
	 * Detach table extensions
	 * @private
	 */
	Table.prototype._detachExtensions = function() {
		ExtensionBase.cleanup(this);
	};

	/**
	 * Handles paste event and fires Paste event of the Table , so that it can be used in the application
	 * @private
	 * @param oEvent - browser paste event that occurs when a user pastes the data from the clipboard into the table
	 */
	Table.prototype.onpaste = function(oEvent) {

		// Check whether the paste event is already handled by input enabled control and avoid pasting into this input-enabled control when focus is in there.
		if (oEvent.isMarked() || /^(input|textarea)$/i.test(document.activeElement.tagName) /*see DINC0096526*/) {
			return;
		}

		// Get the data from the PasteHelper utility in format of 2D Array
		const aData = PasteHelper.getPastedDataAs2DArray(oEvent.originalEvent);

		if (aData.length === 0 /* no rows pasted */ || aData[0].length === 0 /* no columns pasted */) {
			return; // no pasted data
		}

		this.firePaste({data: aData});
	};

	/**
	 * Theme changed
	 * @private
	 */
	Table.prototype.onThemeChanged = function() {
		TableUtils.readThemeParameters();
		if (this.getDomRef()) {
			this.invalidate();
		}
	};

	/**
	 * Localization changed
	 * @private
	 */
	Table.prototype.onLocalizationChanged = function(oEvent) {
		const oChanges = oEvent.changes || {};
		const bRtlChanged = oChanges.hasOwnProperty("rtl");
		const bLangChanged = oChanges.hasOwnProperty("language");
		this._adaptLocalization(bRtlChanged, bLangChanged).then(function() {
			this.invalidate();
		}.bind(this)).catch(function() {});
	};

	/**
	 * Adapts the table to localization changes. Re-rendering or invalidation of the table needs to be taken care of by the caller.
	 *
	 * @param {boolean} bRtlChanged Whether the text direction changed.
	 * @param {boolean} bLangChanged Whether the language changed.
	 * @returns {Promise} A promise on the adaptation. If no adaptation is required, because text direction and language did not change, the
	 * promise will be rejected.
	 * @private
	 */
	Table.prototype._adaptLocalization = function(bRtlChanged, bLangChanged) {
		if (!bRtlChanged && !bLangChanged) {
			return Promise.reject();
		}

		let pUpdateLocalizationInfo = Promise.resolve();

		if (bRtlChanged) {
			this._bRtlMode = Localization.getRTL();
		}

		if (bLangChanged) {
			pUpdateLocalizationInfo = TableUtils.getResourceBundle({async: true, reload: true});
		}

		return pUpdateLocalizationInfo.then(function() {
			if (bLangChanged) {
				// Clear the cell context menu.
				TableUtils.Menu.cleanupDefaultContentCellContextMenu(this);
			}
		}.bind(this));
	};

	/**
	 * Determines the row heights. For every row in the table the maximum height of all <code>tr</code> elements in the fixed and
	 * scrollable column areas is returned.
	 *
	 * @param {boolean} bHeader If set to <code>true</code>, only the heights of the rows in the column header will be returned
	 * @returns {int[]} The row heights
	 * @private
	 */
	Table.prototype._collectRowHeights = function(bHeader) {
		const oDomRef = this.getDomRef();
		if (!oDomRef) {
			return [];
		}

		let iBaseRowHeight = this._getBaseRowHeight();
		const sRowCSSClass = bHeader ? ".sapUiTableColHdrTr" : ".sapUiTableTr";
		const aRowsInFixedColumnsArea = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr" + sRowCSSClass);
		const aRowsInScrollableColumnsArea = oDomRef.querySelectorAll(".sapUiTableCtrlScroll > tbody > tr" + sRowCSSClass);
		const iRowCount = bHeader ? TableUtils.getHeaderRowCount(this) : this.getRows().length;
		let aRowHeights = [];
		const bIsZoomedInChrome = Device.browser.chrome && window.devicePixelRatio !== 1;

		if (bHeader) {
			if (this.getColumnHeaderHeight() > 0) {
				iBaseRowHeight = this.getColumnHeaderHeight();
			} else if (this.getRowMode()) {
				iBaseRowHeight = this._getDefaultRowHeight();
			}
		}

		for (let i = 0; i < iRowCount; i++) {
			const nFixedColumnsAreaRowHeight = aRowsInFixedColumnsArea[i] ? aRowsInFixedColumnsArea[i].getBoundingClientRect().height : 0;
			const nScrollableColumnsAreaRowHeight = aRowsInScrollableColumnsArea[i] ? aRowsInScrollableColumnsArea[i].getBoundingClientRect().height : 0;
			const nRowHeight = Math.max(nFixedColumnsAreaRowHeight, nScrollableColumnsAreaRowHeight);

			if (bIsZoomedInChrome) {
				const nHeightDeviation = iBaseRowHeight - nRowHeight;

				// In Chrome with zoom != 100% the height of table rows can slightly differ from the height of divs (row selectors).
				// See https://bugs.chromium.org/p/chromium/issues/detail?id=661991

				// Allow the row height to be slightly smaller than the default row height.
				if (nHeightDeviation > 0 && nHeightDeviation < 1) {
					aRowHeights.push(Math.max(nRowHeight, iBaseRowHeight - 1));
					continue;
				}
			}

			aRowHeights.push(Math.max(nRowHeight, iBaseRowHeight));
		}

		if (aRowHeights.length > 0 && !bHeader) {
			TableUtils.dynamicCall(this._getSyncExtension, function(oSyncExtension) {
				const aModifiedHeights = oSyncExtension.syncRowHeights(aRowHeights.slice());
				if (aModifiedHeights && aModifiedHeights.length === aRowHeights.length) {
					aRowHeights = aModifiedHeights.slice();
				}
			});
		}

		return aRowHeights;
	};

	/**
	 * Resets the height style property of all TR elements of the table body
	 * @private
	 */
	Table.prototype._resetRowHeights = function() {
		const iRowHeight = this._getBaseRowHeight();

		let sRowHeight = "";
		if (iRowHeight) {
			sRowHeight = iRowHeight + "px";
		}

		const oDomRef = this.getDomRef("tableCCnt");
		if (oDomRef) {
			const aRowItems = oDomRef.querySelectorAll(".sapUiTableTr");
			for (let i = 0; i < aRowItems.length; i++) {
				aRowItems[i].style.height = sRowHeight;
			}
		}
	};

	/**
	 * Resets the height style property of all TR elements of the table header
	 * @private
	 */
	Table.prototype._resetColumnHeaderHeights = function() {
		const oDomRef = this.getDomRef();
		if (oDomRef) {
			const aRowItems = oDomRef.querySelectorAll(".sapUiTableColHdrTr");
			for (let i = 0; i < aRowItems.length; i++) {
				aRowItems[i].style.height = null;
			}
		}
	};

	/**
	 * Determines all needed table size at one dedicated point,
	 * for avoiding layout thrashing through read/write UI operations.
	 * @private
	 */
	Table.prototype._collectTableSizes = function() {
		const oSizes = {
			tableCtrlScrollWidth: 0,
			tableRowHdrScrWidth: 0,
			tableCtrlScrWidth: 0,
			tableCtrlFixedWidth: 0,
			tableCntHeight: 0,
			tableCntWidth: 0
		};

		const oDomRef = this.getDomRef();
		if (!oDomRef) {
			return oSizes;
		}

		const oSapUiTableCnt = oDomRef.querySelector(".sapUiTableCnt");
		if (oSapUiTableCnt) {
			oSizes.tableCntHeight = oSapUiTableCnt.clientHeight;
			oSizes.tableCntWidth = oSapUiTableCnt.clientWidth;
		}

		const oSapUiTableCtrlScroll = oDomRef.querySelector(".sapUiTableCtrlScroll:not(.sapUiTableCHT)");
		if (oSapUiTableCtrlScroll) {
			oSizes.tableCtrlScrollWidth = oSapUiTableCtrlScroll.getBoundingClientRect().width;
		}

		const oSapUiTableRowHdrScr = oDomRef.querySelector(".sapUiTableRowHdrScr");
		if (oSapUiTableRowHdrScr) {
			oSizes.tableRowHdrScrWidth = oSapUiTableRowHdrScr.clientWidth;
		}

		const oCtrlScrDomRef = oDomRef.querySelector(".sapUiTableCtrlScr:not(.sapUiTableCHA)");
		if (oCtrlScrDomRef) {
			oSizes.tableCtrlScrWidth = oCtrlScrDomRef.getBoundingClientRect().width;
		}

		const oCtrlFixed = oDomRef.querySelector(".sapUiTableCtrlScrFixed:not(.sapUiTableCHA) > .sapUiTableCtrlFixed");
		if (oCtrlFixed) {
			oSizes.tableCtrlFixedWidth = oCtrlFixed.clientWidth;
		}

		const iFixedColumnCount = this._getSpanBasedComputedFixedColumnCount();
		let iFixedHeaderWidthSum = 0;

		if (iFixedColumnCount) {
			const aColumns = this.getColumns();
			const aHeaderElements = oDomRef.querySelectorAll(".sapUiTableCtrlFirstCol:not(.sapUiTableCHTHR) > th");

			for (let i = 0; i < aHeaderElements.length; i++) {
				const iColIndex = parseInt(aHeaderElements[i].getAttribute("data-sap-ui-headcolindex"));

				if (!isNaN(iColIndex) && (iColIndex < iFixedColumnCount)) {
					const oColumn = aColumns[iColIndex];
					let iWidth;

					if (oColumn._iFixWidth != null) {
						iWidth = oColumn._iFixWidth;
					} else {
						iWidth = aHeaderElements[i].getBoundingClientRect().width;
					}

					iFixedHeaderWidthSum += iWidth;
				}
			}
		}

		if (iFixedHeaderWidthSum > 0) {
			const oScrollExtension = this._getScrollExtension();
			let iUsedHorizontalTableSpace = oSizes.tableRowHdrScrWidth;

			const oVSb = oScrollExtension.getVerticalScrollbar();
			if (oVSb && !oScrollExtension.isVerticalScrollbarExternal()) {
				iUsedHorizontalTableSpace += oVSb.offsetWidth;
			}

			if (TableUtils.hasRowActions(this)) {
				const oRowActions = this.getDomRef("sapUiTableRowActionScr");
				if (oRowActions) {
					iUsedHorizontalTableSpace += oRowActions.offsetWidth;
				}
			}

			iUsedHorizontalTableSpace += TableUtils.Column.getMinColumnWidth();

			const iAvailableSpace = oSizes.tableCntWidth - iUsedHorizontalTableSpace;
			const bFixedColumnsFitIntoTable = iAvailableSpace > iFixedHeaderWidthSum;
			const bIgnoreFixedColumnCountCandidate = !bFixedColumnsFitIntoTable;

			if (this._bIgnoreFixedColumnCount !== bIgnoreFixedColumnCountCandidate) {
				this._bIgnoreFixedColumnCount = bIgnoreFixedColumnCountCandidate;
				this.invalidate();
			}
		}

		return oSizes;
	};

	/**
	 * Synchronizes the row heights.
	 * @param {float[]} aRowItemHeights
	 * @param {boolean} bHeader update of column headers if true, otherwise update data rows.
	 * @private
	 */
	Table.prototype._updateRowHeights = function(aRowItemHeights, bHeader) {
		const oDomRef = this.getDomRef();
		if (!oDomRef) {
			return;
		}

		function updateRow(row, index) {
			const rowHeight = aRowItemHeights[index];
			if (rowHeight) {
				row.style.height = rowHeight + "px";
			}
		}

		// select rows
		const cssClass = bHeader ? ".sapUiTableColHdrTr" : ".sapUiTableTr";
		const aRowHeaderItems = bHeader ? [] : oDomRef.querySelectorAll(".sapUiTableRowSelectionCell");
		const aRowActionItems = bHeader ? [] : oDomRef.querySelectorAll(".sapUiTableRowActionCell");
		const aFixedRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr" + cssClass);
		const aScrollRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlScroll > tbody > tr" + cssClass);

		Array.prototype.forEach.call(aRowHeaderItems, updateRow);
		Array.prototype.forEach.call(aRowActionItems, updateRow);
		Array.prototype.forEach.call(aFixedRowItems, updateRow);
		Array.prototype.forEach.call(aScrollRowItems, updateRow);
	};

	Table.prototype.onBeforeRendering = function(oEvent) {
		// The table can be re-rendered as part of the rendering of its parent, without being invalidated before.
		this._bInvalid = true;

		this._detachEvents();

		if (oEvent && oEvent.isMarked("renderRows")) {
			return;
		}

		this._cleanUpTimers();
		this._aTableHeaders = []; // free references to DOM elements
	};

	Table.prototype.onAfterRendering = function(oEvent) {
		const bRenderedRows = oEvent && oEvent.isMarked("renderRows");

		this._bInvalid = false;

		this._attachEvents();

		// since the row is an element it has no own renderer. Anyway, logically it has a domref. Let the rows
		// update their domrefs after the rendering is done. This is required to allow performant access to row domrefs
		this._initRowDomRefs();

		// enable/disable text selection for column headers
		if (!this._bAllowColumnHeaderTextSelection && !bRenderedRows) {
			this._disableTextSelection(this.$().find(".sapUiTableColHdrCnt"));
		}

		// If only the rows are rendered, the css flag is not removed while the positioning of the actions is reset. Therefore, the flag must be
		// manually removed so that the actions are later correctly positioned.
		this.getDomRef().classList.remove("sapUiTableRActFlexible");

		if (!bRenderedRows) {
			// needed for the column resize ruler
			this._aTableHeaders = this.$().find(".sapUiTableColHdrCnt th");
		}

		this._updateTableSizes(TableUtils.RowsUpdateReason.Render, true);
		TableUtils.registerResizeHandler(this, "Table", this._onTableResize.bind(this));

		this._bFirstRendering = false;
	};

	Table.prototype.invalidate = function() {
		this._bInvalid = true;
		TableUtils.Column.invalidateColumnUtils(this);
		return Control.prototype.invalidate.call(this);
	};

	Table.prototype._initRowDomRefs = function() {
		const aRows = this.getRows();
		for (let i = 0; i < aRows.length; i++) {
			aRows[i].initDomRefs();
		}
	};

	/**
	 * First collects all table sizes, then synchronizes row/column heights, updates scrollbars and selection.
	 * @private
	 */
	Table.prototype._updateTableSizes = function(sReason, bSkipResetRowHeights) {
		bSkipResetRowHeights = bSkipResetRowHeights === true;

		const oDomRef = this.getDomRef();

		if (this._bInvalid || !oDomRef || !TableUtils.isThemeApplied() || oDomRef.offsetWidth === 0) {
			return;
		}

		if (!bSkipResetRowHeights) {
			this._resetRowHeights();
			this._resetColumnHeaderHeights();
		}

		this._aRowHeights = this._collectRowHeights(false);
		const aColumnHeaderRowHeights = this._collectRowHeights(true);

		// the only place to fix the minimum column width
		function setMinColWidths(oTable) {
			const oTableRef = oTable.getDomRef();
			const iAbsoluteMinWidth = TableUtils.Column.getMinColumnWidth();
			const aNotFixedVariableColumns = [];
			const bColumnHeaderVisible = oTable.getColumnHeaderVisible();

			function calcNewWidth(iDomWidth, iMinWidth) {
				if (iDomWidth <= iMinWidth) {
					// tolerance of -5px to make the resizing smooother
					return Math.max(iDomWidth, iMinWidth - 5, iAbsoluteMinWidth) + "px";
				}
				return -1;
			}

			function isFixNeeded(col) {
				const minWidth = Math.max(col._minWidth || 0, iAbsoluteMinWidth, col.getMinWidth());
				const colWidth = col.getWidth();
				let aColHeaders;
				let colHeader;
				let domWidth;
				// if a column has variable width, check if its current width of the
				// first corresponding <th> element in less than minimum and store it;
				// do not change freezed columns
				if (TableUtils.isVariableWidth(colWidth) && !TableUtils.isFixedColumn(oTable, col.getIndex())) {
					aColHeaders = oTableRef.querySelectorAll('th[data-sap-ui-colid="' + col.getId() + '"]');
					colHeader = aColHeaders[bColumnHeaderVisible ? 0 : 1]; // if column headers have display:none, use data table
					domWidth = colHeader ? colHeader.offsetWidth : null;
					if (domWidth !== null) {
						if (domWidth <= minWidth) {
							return {headers: aColHeaders, newWidth: calcNewWidth(domWidth, minWidth)};
						} else if (colHeader && colHeader.style.width !== colWidth) {
							aNotFixedVariableColumns.push({col: col, header: colHeader, minWidth: minWidth, headers: aColHeaders});
							// reset the minimum style width that was set previously
							return {headers: aColHeaders, newWidth: colWidth};
						}
						aNotFixedVariableColumns.push({col: col, header: colHeader, minWidth: minWidth, headers: aColHeaders});
					}
				}
				return null;
			}

			function adaptColWidth(oColInfo) {
				if (oColInfo) {
					Array.prototype.forEach.call(oColInfo.headers, function(header) {
						header.style.width = oColInfo.newWidth;
					});
				}
			}

			// adjust widths of all found column headers
			oTable._getVisibleColumns().map(isFixNeeded).forEach(adaptColWidth);

			//Check the rest of the flexible non-adapted columns
			//Due to adaptations they could be smaller now.
			if (aNotFixedVariableColumns.length) {
				let iDomWidth;
				for (let i = 0; i < aNotFixedVariableColumns.length; i++) {
					iDomWidth = aNotFixedVariableColumns[i].header && aNotFixedVariableColumns[i].header.offsetWidth;
					aNotFixedVariableColumns[i].newWidth = calcNewWidth(iDomWidth, aNotFixedVariableColumns[i].minWidth);
					if (parseInt(aNotFixedVariableColumns[i].newWidth) >= 0) {
						adaptColWidth(aNotFixedVariableColumns[i]);
					}
				}
			}
		}
		setMinColWidths(this);

		const oTableSizes = this._collectTableSizes();

		// Manipulation of UI Sizes
		this._updateRowHeights(this._aRowHeights, false);
		this._updateRowHeights(aColumnHeaderRowHeights, true);

		TableUtils.dynamicCall(this._getSyncExtension, function(oSyncExtension) {
			oSyncExtension.syncLayout({
				top: this.getDomRef("sapUiTableCnt").offsetTop,
				headerHeight: this.getDomRef().querySelector(".sapUiTableColHdrCnt").getBoundingClientRect().height,
				contentHeight: this.getDomRef("tableCCnt").getBoundingClientRect().height
			});
		}, this);

		const $this = this.$();

		if (TableUtils.hasRowActions(this) || TableUtils.hasRowNavigationIndicators(this)) {
			const bHasFlexibleRowActions = $this.hasClass("sapUiTableRActFlexible");
			const oDummyColumn = this.getDomRef("dummycolhdr");

			if (oDummyColumn) {
				const bDummyColumnHasWidth = oDummyColumn.clientWidth > 2;

				if (!bHasFlexibleRowActions && bDummyColumnHasWidth) {
					const iColumnsWidth = this.getColumns().reduce(function(iColumnsWidth, oColumn) {
						const oDomRef = oColumn.getDomRef();
						if (oDomRef && oColumn.getIndex() >= this.getComputedFixedColumnCount()) {
							iColumnsWidth += oDomRef.offsetWidth;
						}
						return iColumnsWidth;
					}.bind(this), 0);
					let iRowActionPos = iColumnsWidth + oTableSizes.tableRowHdrScrWidth + oTableSizes.tableCtrlFixedWidth;
					const oRowActionStyles = {};
					if (!TableUtils.hasRowActions(this)) {
						iRowActionPos = iRowActionPos - TableUtils.ThemeParameters.navIndicatorWidth + TableUtils.BaseBorderWidth;
					}
					oRowActionStyles[this._bRtlMode ? "right" : "left"] = iRowActionPos;
					this.$("sapUiTableRowActionScr").css(oRowActionStyles);
					this.$("rowacthdr").css(oRowActionStyles);
					$this.toggleClass("sapUiTableRActFlexible", true);
				} else if (bHasFlexibleRowActions && !bDummyColumnHasWidth) {
					this.$("sapUiTableRowActionScr").removeAttr("style");
					this.$("rowacthdr").removeAttr("style");
					$this.toggleClass("sapUiTableRActFlexible", false);
				}
			}
		}

		$this.find(".sapUiTableNoOpacity").addBack().removeClass("sapUiTableNoOpacity");

		TableUtils.Hook.call(this, Hook.UpdateSizes, sReason);
	};

	Table.prototype.setShowOverlay = function(bShow) {
		this.setProperty("showOverlay", bShow, true);

		if (this.getDomRef()) {
			this.$().toggleClass("sapUiTableOverlay", this.getShowOverlay());
			this._getAccExtension().updateAriaStateForOverlayAndNoData();
			this._getKeyboardExtension().updateNoDataAndOverlayFocus();
		}

		return this;
	};

	Table.prototype._updateFixedBottomRows = function() {
		const oDomRef = this.getDomRef();

		if (!oDomRef || this._getRowCounts().fixedBottom === 0) {
			return;
		}

		const iFirstFixedButtomRowIndex = TableUtils.getFirstFixedBottomRowIndex(this);
		const aRows = this.getRows();
		let $rowDomRefs;

		jQuery(oDomRef).find(".sapUiTableRowLastScrollable").removeClass("sapUiTableRowLastScrollable");
		jQuery(oDomRef).find(".sapUiTableRowFirstFixedBottom").removeClass("sapUiTableRowFirstFixedBottom");

		if (iFirstFixedButtomRowIndex >= 0 && iFirstFixedButtomRowIndex < aRows.length) {
			$rowDomRefs = aRows[iFirstFixedButtomRowIndex].getDomRefs(true);
			$rowDomRefs.row.addClass("sapUiTableRowFirstFixedBottom", true);
		}

		if (iFirstFixedButtomRowIndex >= 1 && iFirstFixedButtomRowIndex < aRows.length) {
			$rowDomRefs = aRows[iFirstFixedButtomRowIndex - 1].getDomRefs(true);
			$rowDomRefs.row.addClass("sapUiTableRowLastScrollable", true);
		}
	};

	// =============================================================================
	// FOCUS
	// =============================================================================

	/**
	 * Sets the focus to the stored focus DOM reference.
	 *
	 * If <code>oFocusInfo.targetInfo</code> is of type {@link sap.ui.core.message.Message},
	 * the focus will be set as accurately as possible according to the information provided by {@link sap.ui.core.message.Message}.
	 *
	 * @param {object} [oFocusInfo={}] Options for setting the focus
	 * @param {boolean} [oFocusInfo.preventScroll=false] @since 1.60 If set to <code>true</code>, the focused
	 *   element won't be moved into the viewport if it's not completely visible before the focus is set
	 * @param {any} [oFocusInfo.targetInfo] @since 1.98 Further control-specific setting of the focus target within the control
	 * @public
	 */
	Table.prototype.focus = function(oFocusInfo) {
		this._oFocusInfo = oFocusInfo;
		Control.prototype.focus.apply(this, arguments);
		delete this._oFocusInfo;
	};

	Table.prototype.getFocusInfo = function() {
		const sId = this.$().find(":focus").attr("id");
		if (sId) {
			return {customId: sId};
		} else {
			return Control.prototype.getFocusInfo.apply(this, arguments);
		}
	};

	Table.prototype.applyFocusInfo = function(mFocusInfo) {
		delete this._bApplyFocusInfoFailed;
		if (mFocusInfo && mFocusInfo.customId) {
			if (document.getElementById(mFocusInfo.customId)) {
				jQuery(document.getElementById(mFocusInfo.customId)).trigger("focus");
			} else {
				this._bApplyFocusInfoFailed = true;
			}
		} else {
			Control.prototype.applyFocusInfo.apply(this, arguments);
		}
		return this;
	};

	Table.prototype.setFooter = function(vFooter) {
		let oFooter = vFooter;
		if (typeof (vFooter) === "string" || vFooter instanceof String) {
			oFooter = TableUtils._getTableTemplateHelper().createTextView({
				text: vFooter
			});
		}
		this.setAggregation("footer", oFooter);
		return this;
	};

	/**
	 * Sets the selection mode. The current selection is lost.
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @param {sap.ui.table.SelectionMode} sSelectionMode the selection mode, see sap.ui.table.SelectionMode
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Table.prototype.setSelectionMode = function(sSelectionMode) {
		if (this._hasSelectionPlugin()) {
			Log.error("If a selection plugin is applied to the table, the selection mode is controlled by the plugin.", this);
		} else {
			this.setProperty("selectionMode", sSelectionMode);
			this._getSelectionPlugin().setSelectionMode(sSelectionMode);
		}

		return this;
	};

	Table.prototype.setFirstVisibleRow = function(iRowIndex) {
		if (iRowIndex == null) {
			iRowIndex = 0;
		} else if (iRowIndex < 0) {
			Log.error("The index of the first visible row must be greater than or equal to 0. The value has been set to 0.", this);
			iRowIndex = 0;
		} else if (this._bContextsAvailable) {
			const iMaxRowIndex = this._getMaxFirstVisibleRowIndex();

			if (iMaxRowIndex < iRowIndex) {
				Log.warning("The index of the first visible row is too high. The value has been set to " + iMaxRowIndex + ".", this);
				iRowIndex = iMaxRowIndex;
			}
		}

		this._setFirstVisibleRowIndex(iRowIndex);

		return this;
	};

	/**
	 * Sets the <code>firstVisibleRow</code> property of the table, updates the rows, and fires the <code>firstVisibleRowChanged</code> event.
	 *
	 * @param {int} iRowIndex
	 *     The new first visible row index.
	 * @param {Object} [mOptions]
	 *     Config options.
	 * @param {boolean} [mOptions.onScroll=false]
	 *     Whether the first visible row is changed by scrolling. Any scroll-related updates are suppressed. The
	 *     setting <code>suppressScrolling</code> is ignored.
	 * @param {boolean} [mOptions.suppressScrolling=false]
	 *     Whether to suppress any scroll-related updates.
	 * @param {boolean} [mOptions.suppressEvent=false]
	 *     Whether to suppress the <code>firstVisibleRowChanged</code> event.
	 * @param {boolean} [mOptions.forceEvent=false]
	 *     Whether to force the <code>firstVisibleRowChanged</code> event. Ignored if <code>suppressEvent=true</code>.
	 * @param {boolean} [mOptions.suppressRendering=false]
	 *     Whether the first visible row should only be set, without re-rendering the rows.
	 * @param {boolean} [mOptions.onlySetProperty=false]
	 *     Shortcut for <code>suppressScrolling=true</code>, <code>suppressEvent=true</code>, and <code>suppressRendering=true</code>.
	 *     Overrules other settings.
	 * @returns {boolean}
	 *     Whether the <code>rowsUpdated</code> event will be fired.
	 * @private
	 */
	Table.prototype._setFirstVisibleRowIndex = function(iRowIndex, mOptions) {
		mOptions = Object.assign({
			onScroll: false,
			suppressScrolling: false,
			suppressEvent: false,
			forceEvent: false,
			suppressRendering: false,
			onlySetProperty: false
		}, mOptions);

		if (this._bContextsAvailable) {
			iRowIndex = Math.min(iRowIndex, this._getMaxFirstVisibleRowIndex());
		}
		iRowIndex = Math.max(0, iRowIndex);

		const bFirstVisibleRowChanged = this.getFirstVisibleRow() !== iRowIndex;
		const iOldFirstRenderedRowIndex = this._getFirstRenderedRowIndex();
		const iNewFirstRenderedRowIndex = this._bContextsAvailable ? Math.min(iRowIndex, this._getMaxFirstRenderedRowIndex()) : iRowIndex;
		const oScrollExtension = this._getScrollExtension();

		this.setProperty("firstVisibleRow", iRowIndex, true);

		if (!mOptions.suppressRendering) {
			_private(this).iFirstRenderedRowIndex = iNewFirstRenderedRowIndex;
		}

		if (mOptions.onlySetProperty) {
			return false;
		}

		if ((bFirstVisibleRowChanged || mOptions.forceEvent) && !mOptions.suppressEvent) {
			this.fireFirstVisibleRowChanged({
				firstVisibleRow: iRowIndex
			});
		}

		if (!this.getBinding()) {
			oScrollExtension.updateVerticalScrollPosition();
			return false;
		}

		let bExpectRowsUpdatedEvent = false;
		const bRowsUpdateRequired = this.getBinding() != null && iNewFirstRenderedRowIndex !== iOldFirstRenderedRowIndex;

		if (bRowsUpdateRequired) {
			if (!mOptions.suppressRendering) {
				this._bScrolled = mOptions.onScroll;
				triggerRowsUpdate(this, mOptions.onScroll
										? TableUtils.RowsUpdateReason.VerticalScroll
										: TableUtils.RowsUpdateReason.FirstVisibleRowChange);
				bExpectRowsUpdatedEvent = true;
			}

			// If changing the first visible row was initiated by a scroll action, the scroll position is already accurate.
			// If the first visible row is set to the maximum row index, the table is scrolled to the bottom including the overflow.
			if (!mOptions.onScroll && !mOptions.suppressScrolling) {
				oScrollExtension.updateVerticalScrollPosition(bExpectRowsUpdatedEvent);
			}
		} else if (!mOptions.onScroll && !mOptions.suppressScrolling) {
			// Even if the first visible row was not changed, this row may not be fully visible because of the inner scroll position. Therefore, the
			// scroll position is adjusted to make it fully visible.
			oScrollExtension.updateVerticalScrollPosition(!this._bContextsAvailable);
		}

		return bExpectRowsUpdatedEvent;
	};

	/**
	 * Sets the focus on the row. If <code>bFirstInteractiveElement</code> is <code>true</code> and there are
	 * interactive elements in the row, sets the focus on the first interactive element. Otherwise sets the
	 * focus on the first data cell.
	 *
	 * If the given index is not in the visible area, it scrolls it into view and then sets the focus.
	 *
	 * @param {number} iIndex The index of the row that is to be focused
	 * @param {boolean} [bFirstInteractiveElement=false] Indicates whether to set the focus on the first
	 * interactive element
	 *
	 * @private
	 * @returns {Promise} A <code>Promise</code> that resolves after the focus has been set
	 */
	Table.prototype._setFocus = function(iIndex, bFirstInteractiveElement) {
		return new Promise(function(resolve) {
			if (iIndex === -1) {
				iIndex = this._getTotalRowCount() - 1;
			}

			if (typeof iIndex !== 'number' || iIndex < -1) {
				iIndex = 0;
			}

			const iFirstVisibleRow = this.getFirstVisibleRow();
			const iRowCount = this._getRowCounts().count;

			if (iIndex > iFirstVisibleRow && iIndex < iFirstVisibleRow + iRowCount) {
				this.getRows()[iIndex - iFirstVisibleRow]._setFocus(bFirstInteractiveElement);
				return resolve();
			}

			if (this._setFirstVisibleRowIndex(iIndex)) {
				this.attachEventOnce("_rowsUpdated", function() {
					setFocus(this, iIndex, bFirstInteractiveElement);
					return resolve();
				});
			} else {
				setFocus(this, iIndex, bFirstInteractiveElement);
				return resolve();
			}
		}.bind(this));
	};

	function setFocus(oTable, iIndex, bFirstInteractiveElement) {
		const iTotalRowCount = oTable._getTotalRowCount();
		const iFirstRenderedRowIndex = oTable._getFirstRenderedRowIndex();
		oTable.getRows()[Math.min(iIndex, iTotalRowCount - 1) - iFirstRenderedRowIndex]._setFocus(bFirstInteractiveElement);
	}

	// enable calling 'bindAggregation("rows")' without a factory
	Table.getMetadata().getAggregation("rows")._doesNotRequireFactory = true;

	Table.prototype.bindAggregation = function(sName, oBindingInfo) {
		if (sName === "rows") {
			this._bindRows(getSanitizedBindingInfo(Array.prototype.slice.call(arguments, 1)));
			return this;
		}

		return Control.prototype.bindAggregation.apply(this, arguments);
	};

	Table.prototype.bindRows = function(oBindingInfo) {
		this._bindRows(getSanitizedBindingInfo(arguments));
		return this;
	};

	Table.prototype._bindRows = function(oBindingInfo) {
		resetBindingFlags(this);
		this._bRowsBeingBound = true;
		destroyVirtualRow(this);
		updateAutomaticBusyIndicator(this);

		// Temporary fix for the Support Assistant hacks. Support Assistant should implement a selection plugin.
		// TODO: Before we recommend to implement a selection plugin -> Complete BLI CPOUIFTEAMB-1464
		// TODO: Delete binding change listener after hacks are removed from Support Assistant
		Table._addBindingListener(oBindingInfo, "change", function() {
			this._onBindingChange.apply(this, arguments);
		}.bind(this));
		Table._addBindingListener(oBindingInfo, "dataRequested", function() {
			this._onBindingDataRequested.apply(this, arguments);
		}.bind(this));
		Table._addBindingListener(oBindingInfo, "dataReceived", function() {
			this._onBindingDataReceived.apply(this, arguments);
		}.bind(this));
		//Table._addBindingListener(oBindingInfo, "change", this._onBindingChange, this);
		//Table._addBindingListener(oBindingInfo, "dataRequested", this._onBindingDataRequested, this);
		//Table._addBindingListener(oBindingInfo, "dataReceived", this._onBindingDataReceived, this);

		TableUtils.Hook.call(this, Hook.BindRows, oBindingInfo);
		Control.prototype.bindAggregation.call(this, "rows", oBindingInfo);
		this._bRowsBeingBound = false;
	};

	/*
	 * This function will be called either by {@link sap.ui.base.ManagedObject#bindAggregation} or {@link sap.ui.base.ManagedObject#setModel}.
	 * If only the model has been changed, ManagedObject only calls _bindAggregation, while bindAggregation / bindRows is not called.
	 * @see sap.ui.base.ManagedObject#_bindAggregation
	 */
	Table.prototype._bindAggregation = function(sName, oBindingInfo) {
		if (sName === "rows") {
			resetBindingFlags(this);
			this._bRowsBeingBound = true;
		}

		// Create the binding.
		Control.prototype._bindAggregation.call(this, sName, oBindingInfo);

		if (sName === "rows") {
			const oBinding = this.getBinding();
			const oModel = oBinding ? oBinding.getModel() : null;

			this._bRowsBeingBound = false;
			TableUtils.Hook.call(this, Hook.RowsBound, oBinding);

			if (oModel && oModel.getDefaultBindingMode() === BindingMode.OneTime) {
				Log.error("The binding mode of the model is set to \"OneTime\"."
						  + " This binding mode is not supported for the \"rows\" aggregation!"
						  + " Scrolling can not be performed.", this);
			}
		}
	};

	Table.prototype.unbindAggregation = function(sName, bSuppressReset) {
		if (sName === "rows") {
			this._unbindRows();
			return this;
		}

		return Control.prototype.unbindAggregation.apply(this, arguments);
	};

	Table.prototype.unbindRows = function() {
		this._unbindRows();
		return this;
	};

	Table.prototype._unbindRows = function() {
		const oBindingInfo = this.getBindingInfo("rows");

		if (oBindingInfo) {
			TableUtils.Hook.call(this, Hook.UnbindRows, oBindingInfo);
		}

		Control.prototype.unbindAggregation.call(this, "rows", true);

		// We don't further react to unbind operations that are part of rebind and destruction
		// to avoid unnecessary DOM updates and UI flickering.
		if (this._bRowsBeingBound || this.bIsDestroyed || this._bIsBeingDestroyed) {
			return;
		}

		this._adjustToTotalRowCount();

		if (oBindingInfo) {
			TableUtils.Hook.call(this, Hook.RowsUnbound);
		}

		resetBindingFlags(this);
		updateAutomaticBusyIndicator(this);
	};

	function resetBindingFlags(oTable) {
		oTable._bRowsBeingBound = false;
		oTable._bContextsAvailable = false;
		_private(oTable).iPendingRequests = 0;
		oTable._iBindingLength = null;
	}

	/**
	 * Converts old binding configuration APIs to the new API.
	 *
	 * @param {...*} [args] Binding configuration arguments.
	 * @returns {object|null} The binding info object or null.
	 * @private
	 */
	function getSanitizedBindingInfo(args) {
		let oBindingInfo;

		if (args == null || args[0] == null) {
			oBindingInfo = {};
		} else if (typeof args[0] === "string") {
			/* Old API compatibility */

			// (sPath, vTemplate, oSorter, aFilters)
			const sPath = args[0];
			let oTemplate = args[1];
			let oSorter = args[2];
			let aFilters = args[3];

			// (sPath, [oSorter], [aFilters])
			if (oTemplate instanceof Sorter || Array.isArray(oSorter) && oSorter[0] instanceof Filter) {
				aFilters = oSorter;
				oSorter = oTemplate;
				oTemplate = undefined;
			}

			oBindingInfo = {
				path: sPath,
				sorter: oSorter,
				filters: aFilters,
				template: oTemplate
			};
		} else {
			// The first (and only) argument should be a valid binding info object.
			oBindingInfo = args[0];
		}

		return oBindingInfo;
	}

	Table._addBindingListener = function(oBindingInfo, sEventName, fHandler, oThis) {
		if (!oBindingInfo.events) {
			oBindingInfo.events = {};
		}

		// Wrap the event handler of the other party to add our handler.
		const fOriginalHandler = oBindingInfo.events[sEventName];

		oBindingInfo.events[sEventName] = function() {
			fHandler.apply(oThis, arguments);

			if (fOriginalHandler) {
				fOriginalHandler.apply(this, arguments);
			}
		};
	};

	/**
	 * Handler for change events of the binding.
	 * @param {sap.ui.base.Event} oEvent change event
	 * @private
	 */
	Table.prototype._onBindingChange = function(oEvent) {};

	Table.prototype.setRowMode = function(vRowMode) {
		destroyDefaultRowMode(this);
		this.setAggregation("rowMode", vRowMode);
		initDefaultRowMode(this);
		return this;
	};

	Table.prototype.destroyRowMode = function() {
		this.destroyAggregation("rowMode");

		if (!_private(this).oDefaultRowMode) {
			initDefaultRowMode(this);
		}

		return this;
	};

	/**
	 * Gets the row mode of the table. This is either the applied row mode instance, or the default row mode instance if it was already created.
	 *
	 * @param {sap.ui.table.Table} oTable The table from which to get the row mode.
	 * @returns {sap.ui.table.rowmodes.RowMode | undefined} The row mode of the table.
	 */
	function getRowMode(oTable) {
		const vRowMode = oTable.getRowMode();

		return TableUtils.isA(vRowMode, "sap.ui.table.rowmodes.RowMode") ? vRowMode : _private(oTable).oDefaultRowMode;
	}

	/**
	 * Initializes a row mode instance with default settings if no row mode instance exists.
	 *
	 * @param {sap.ui.table.Table} oTable The table for which to create a default row mode instance.
	 */
	function initDefaultRowMode(oTable) {
		const vRowMode = oTable.getRowMode();
		const sRowMode = TableUtils.isA(vRowMode, "sap.ui.table.rowmodes.RowMode") ? undefined : vRowMode || RowModeType.Fixed;

		// If row mode is an instance, a default is not needed.
		if (sRowMode === undefined || _private(oTable).oDefaultRowMode) {
			return;
		}

		switch (sRowMode) {
			case RowModeType.Fixed:
				_private(oTable).oDefaultRowMode = new FixedRowMode();
				break;
			case RowModeType.Interactive:
				_private(oTable).oDefaultRowMode = new InteractiveRowMode();
				break;
			case RowModeType.Auto:
				_private(oTable).oDefaultRowMode = new AutoRowMode();
				break;
			default:
				throw new Error("Default row mode could not be created");
		}

		oTable.addAggregation("_hiddenDependents", _private(oTable).oDefaultRowMode);
	}

	/**
	 * Destroys the default row mode instance.
	 *
	 * @param {sap.ui.table.Table} oTable The table whose default row mode instance to destroy.
	 */
	function destroyDefaultRowMode(oTable) {
		if (_private(oTable).oDefaultRowMode) {
			_private(oTable).oDefaultRowMode.destroy();
			delete _private(oTable).oDefaultRowMode;
		}
	}

	/**
	 * Gets the numbers of scrollable and fixed rows as they are currently computed by the row mode that is applied to the table.
	 *
	 * @returns {{count: int, scrollable: int, fixedTop: int, fixedBottom: int}} The numbers of scrollable and fixed rows.
	 * @private
	 */
	Table.prototype._getRowCounts = function() {
		const mRowCounts = getRowMode(this).getComputedRowCounts();

		// TODO: Enhance the RowMode interface and move these calculations to the row modes that support variable row heights.
		// TableUtils.isVariableRowHeightEnabled can't be used because it calls this method, which causes infinite recursion.
		const bVariableRowHeightEnabled = this._bVariableRowHeightEnabled && !mRowCounts.fixedTop && !mRowCounts.fixedBottom;
		mRowCounts._fullsize = mRowCounts.count;
		mRowCounts._scrollSize = mRowCounts.scrollable;
		if (mRowCounts.count > 0 && bVariableRowHeightEnabled) {
			mRowCounts.count++;
			mRowCounts.scrollable++;
		}

		return mRowCounts;
	};

	/**
	 * Returns whether showing the NoData element is disabled. It can, for example, be disabled with the <code>showNoData</code> property.
	 *
	 * @returns {boolean} Whether showing the NoData element is disabled.
	 */
	Table.prototype._isNoDataDisabled = function() {
		return !this.getShowNoData() || (getRowMode(this)?.isNoDataDisabled() ?? false);
	};

	/**
	 * Sets a new tooltip for this object. The tooltip can either be a simple string
	 * (which in most cases will be rendered as the <code>title</code> attribute of this
	 * Element) or an instance of {@link sap.ui.core.TooltipBase}.
	 *
	 * If a new tooltip is set, any previously set tooltip is deactivated.
	 *
	 * Please note that tooltips are not rendered for the table. The tooltip property will be set
	 * but it won't effect the DOM.
	 *
	 * @param {string|sap.ui.core.TooltipBase} vTooltip The tooltip
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @override
	 */
	Table.prototype.setTooltip = function(vTooltip) {
		Log.warning("The aggregation tooltip is not supported for sap.ui.table.Table", this);
		return this.setAggregation("tooltip", vTooltip, true);
	};

	/**
	 * Requests all contexts from the binding which are required to display the data in the current viewport.
	 *
	 * @param {int} [iRequestLength]
	 *     The amount of contexts to request.
	 *     The default is the row count computed by the row mode, see {@link sap.ui.table.rowmodes.RowMode#getComputedRowCounts}.
	 *     The minimum request length is determined by the row mode, see {@link sap.ui.table.rowmodes.RowMode#getMinRequestLength}.
	 * @returns {sap.ui.model.Context[]} Array of row contexts.
	 * @private
	 */
	Table.prototype._getRowContexts = function(iRequestLength) {
		const oBinding = this.getBinding();
		const mRowCounts = this._getRowCounts();
		let iThreshold = this._bScrolled ? this._getScrollThreshold() : this.getThreshold();

		iRequestLength = iRequestLength == null ? mRowCounts.count : iRequestLength;

		// If the threshold is not explicitly disabled by setting it to 0, the threshold should be at least the number of scrollable rows.
		if (iThreshold !== 0) {
			iThreshold = Math.max(iRequestLength - mRowCounts.fixedTop - mRowCounts.fixedBottom, iThreshold);
		}

		iRequestLength = Math.max(iRequestLength, getRowMode(this).getMinRequestLength(), 0);

		if (!oBinding || iRequestLength === 0) {
			return [];
		}

		// Data can be requested with a single getContexts call if the fixed and the scrollable rows overlap.
		// Because of the AnalyticalTable, the fixed bottom rows can only be requested separately.

		const iFirstRenderedRowIndex = this._getFirstRenderedRowIndex();
		const aContexts = [];

		if (mRowCounts.fixedTop > 0 && iFirstRenderedRowIndex > 0) {
			// If there is a gap between the first visible row and fixed top rows, the fixed top rows need to be requested separately.
			// The first visible row always starts at index 0 in the scrollable part, no matter how many fixed top rows there are.
			mergeContextArrays(aContexts, this._getFixedTopRowContexts(), 0);
			mergeContextArrays(aContexts, this._getContexts(iFirstRenderedRowIndex + mRowCounts.fixedTop, iRequestLength - mRowCounts.fixedBottom - mRowCounts.fixedTop, iThreshold), mRowCounts.fixedTop);
		} else {
			mergeContextArrays(aContexts, this._getContexts(iFirstRenderedRowIndex, iRequestLength - mRowCounts.fixedBottom, iThreshold), 0);
		}

		if (mRowCounts.fixedBottom > 0) {
			mergeContextArrays(aContexts, this._getFixedBottomRowContexts(),
				Math.min(mRowCounts.fixedTop + mRowCounts.scrollable, Math.max(this._getTotalRowCount() - mRowCounts.fixedBottom, 0)));
		}

		return aContexts;
	};

	function mergeContextArrays(aTarget, aSource, iStartIndex) {
		for (let i = 0; i < aSource.length; i++) {
			aTarget[iStartIndex + i] = aSource[i];
		}
	}

	/**
	 * Gets contexts for the fixed top rows from the binding.
	 *
	 * @returns {sap.ui.model.Context[]} Array of contexts.
	 * @private
	 */
	Table.prototype._getFixedTopRowContexts = function() {
		const mRowCounts = this._getRowCounts();
		return mRowCounts.fixedTop > 0 ? this._getContexts(0, mRowCounts.fixedTop, 0, true) : [];
	};

	/**
	 * Gets contexts for the fixed bottom rows from the binding.
	 *
	 * @returns {sap.ui.model.Context[]} Array of contexts.
	 * @private
	 */
	Table.prototype._getFixedBottomRowContexts = function() {
		const mRowCounts = this._getRowCounts();
		const iTotalRowCount = getTotalRowCount(this, true);

		if (mRowCounts.fixedBottom > 0 && mRowCounts.count - mRowCounts.fixedBottom < iTotalRowCount) {
			return this._getContexts(iTotalRowCount - mRowCounts.fixedBottom, mRowCounts.fixedBottom, 0, true);
		} else {
			return [];
		}
	};

	/**
	 * Gets contexts from the binding.
	 *
	 * @param {int} iStartIndex Start of the index range.
	 * @param {int} iLength Length of the index range.
	 * @param {int} iThreshold The number of contexts to load in addition to the requested range.
	 * @param {boolean} [bKeepCurrent] Whether this call keeps the result of {@link sap.ui.model.ListBinding#getCurrentContexts} untouched.
	 * @returns {sap.ui.model.Context[]} Array of contexts.
	 * @private
	 * @see sap.ui.model.ListBinding#getContexts
	 */
	Table.prototype._getContexts = function(iStartIndex, iLength, iThreshold, bKeepCurrent) {
		const oBinding = this.getBinding();
		return oBinding ? oBinding.getContexts(iStartIndex, iLength, iThreshold, bKeepCurrent) : [];
	};

	/**
	 * Updates the UI according to the current total row count.
	 *
	 * @private
	 */
	Table.prototype._adjustToTotalRowCount = function() {
		const iTotalRowCount = this._getTotalRowCount();

		if (this._iBindingLength !== iTotalRowCount) {
			this._iBindingLength = iTotalRowCount;
			this._updateFixedBottomRows();
			this._adjustFirstVisibleRowToTotalRowCount();
			TableUtils.Hook.call(this, Hook.TotalRowCountChanged);
		}
	};

	Table.prototype._adjustFirstVisibleRowToTotalRowCount = function() {
		const iCurrentIndex = this.getFirstVisibleRow();
		const iMaxIndex = this._getMaxFirstVisibleRowIndex();

		if (iMaxIndex < iCurrentIndex && this._bContextsAvailable) {
			this._setFirstVisibleRowIndex(iMaxIndex, {onlySetProperty: true});
		}
	};

	/**
	 * Notifies about a binding refresh - called internally by the <code>ManagedObject</code> when the binding fires a "refresh" event.
	 * Only relevant for server-side bindings. The table is expected to call <code>Binding#getContexts</code>, which triggers a data request. The
	 * table can expect {@link sap.ui.table.Table#updateRows} to be called after the response is successfully received.
	 *
	 * <b>Must not be called manually!</b>
	 *
	 * @param {sap.ui.model.ChangeReason} sReason The reason for the refresh.
	 * @private
	 */
	Table.prototype.refreshRows = function(sReason) {
		this._bContextsAvailable = false;
		this._bScrolled = false;

		if (sReason === ChangeReason.Sort || sReason === ChangeReason.Filter) {
			this.setFirstVisibleRow(0);
		}

		TableUtils.Hook.call(this, Hook.RefreshRows, sReason || TableUtils.RowsUpdateReason.Unknown);
	};

	/**
	 * Updates the rows - called internally by the ManagedObject when the binding fires a "change" event.
	 *
	 * <b>Must not be called manually!</b>
	 *
	 * @param {sap.ui.model.ChangeReason} sReason The reason for the update.
	 * @param {object} oEventInfo Additional information about the update.
	 * @param {string} [oEventInfo.detailedReason] A non-standardized string that further classifies the change event.
	 * @private
	 */
	Table.prototype.updateRows = function(sReason, oEventInfo) {
		// Called during destruction with reason "Unbind". In general, rows of a destroyed table should not be updated.
		if (this.bIsDestroyed || this._bIsBeingDestroyed) {
			return;
		}

		this._bScrolled = false;

		if (oEventInfo.detailedReason === "AddVirtualContext") {
			createVirtualRow(this);
			return;
		} else if (oEventInfo.detailedReason === "RemoveVirtualContext") {
			destroyVirtualRow(this);
			return;
		}

		this._bContextsAvailable = true;

		if (sReason === ChangeReason.Sort || sReason === ChangeReason.Filter) {
			this.setFirstVisibleRow(0);
		}

		this._adjustToTotalRowCount();
		triggerRowsUpdate(this, sReason);
	};

	function createVirtualRow(oTable) {
		const oVirtualContext = oTable._getRowContexts()[0];

		destroyVirtualRow(oTable);
		oTable._oVirtualRow = oTable._getRowClone("virtual");
		oTable._oVirtualRow.setBindingContext(oVirtualContext, oTable.getBindingInfo("rows").model);
		oTable.addAggregation("_hiddenDependents", oTable._oVirtualRow);
	}

	function destroyVirtualRow(oTable) {
		if (oTable._oVirtualRow) {
			oTable._oVirtualRow.destroy();
			delete oTable._oVirtualRow;
		}
	}

	/**
	 * Triggers an update of the rows.
	 *
	 * @param {sap.ui.table.Table} oTable
	 *     Instance of the table.
	 * @param {sap.ui.table.utils.TableUtils.RowsUpdateReason} [sReason=sap.ui.table.utils.TableUtils.RowsUpdateReason.Unknown]
	 *     The reason for the update.
	 * @private
	 */
	function triggerRowsUpdate(oTable, sReason) {
		if (oTable._bContextsAvailable) {
			TableUtils.Hook.call(oTable, Hook.UpdateRows, sReason || TableUtils.RowsUpdateReason.Unknown);
		}
	}

	Table.prototype.insertRow = function() {
		Log.error("The control manages the rows aggregation. The method \"insertRow\" cannot be used programmatically!", this);
		return this;
	};

	Table.prototype.addRow = function() {
		Log.error("The control manages the rows aggregation. The method \"addRow\" cannot be used programmatically!", this);
		return this;
	};

	Table.prototype.removeRow = function() {
		Log.error("The control manages the rows aggregation. The method \"removeRow\" cannot be used programmatically!", this);
		return null;
	};

	Table.prototype.removeAllRows = function() {
		Log.error("The control manages the rows aggregation. The method \"removeAllRows\" cannot be used programmatically!", this);
		return [];
	};

	Table.prototype.destroyRows = function() {
		Log.error("The control manages the rows aggregation. The method \"destroyRows\" cannot be used programmatically!", this);
		return this;
	};

	/**
	 * Sets the creation row.
	 *
	 * @param {sap.ui.table.CreationRow} oCreationRow Instance of the creation row
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Table.prototype.setCreationRow = function(oCreationRow) {
		if (!TableUtils.isA(oCreationRow, "sap.ui.table.CreationRow")) {
			oCreationRow = null;
		}

		return this.setAggregation("creationRow", oCreationRow);
	};

	/**
	 * Gets the creation row.
	 *
	 * @returns {sap.ui.table.CreationRow} oCreationRow Instance of the creation row
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Table.prototype.getCreationRow = function() {
		return this.getAggregation("creationRow");
	};

	/**
	 * Triggers automatic resizing of a column to the widest content.
	 *
	 * @experimental Experimental! Presently implemented to only work with a very limited set of controls (e.g. sap.m.Text).
	 * @param {int} iColIndex The index of the column in the list of visible columns.
	 * @function
	 * @public
	 * @deprecated As of version 1.125, replaced by {@link sap.ui.table.Column#autoResize}
	 */
	Table.prototype.autoResizeColumn = function(iColIndex) {
		const aVisibleColumns = this._getVisibleColumns();
		const oColumn = aVisibleColumns[iColIndex];

		if (oColumn?.getResizable() && oColumn?.getAutoResizable()) {
			oColumn.autoResize();
		}
	};

	// =============================================================================
	// EVENT HANDLING & CLEANUP
	// =============================================================================

	/**
	 * Attaches the required native event handlers.
	 * @private
	 */
	Table.prototype._attachEvents = function() {
		const $this = this.$();
		const sTableId = this.getId();

		if (ControlBehavior.getAnimationMode() !== AnimationMode.none) {
			jQuery(document.body).on("webkitTransitionEnd." + sTableId + " transitionend." + sTableId,
				function(oEvent) {
					if (jQuery(oEvent.target).has($this).length > 0) {
						this._updateTableSizes(TableUtils.RowsUpdateReason.Animation);
					}
				}.bind(this)
			);
		}

		Device.resize.attachHandler(this._onWindowResize, this);
		ExtensionBase.attachEvents(this);
	};

	/**
	 * Detaches the required native event handlers.
	 * @private
	 */
	Table.prototype._detachEvents = function() {
		const sTableId = this.getId();
		jQuery(document.body).off('webkitTransitionEnd.' + sTableId + ' transitionend.' + sTableId);
		TableUtils.deregisterResizeHandler(this, "Table");
		Device.resize.detachHandler(this._onWindowResize, this);
		ExtensionBase.detachEvents(this);
	};

	/**
	 * cleanup the timers and animation frames when not required anymore
	 * @private
	 */
	Table.prototype._cleanUpTimers = function() {
		let sKey;

		for (sKey in this._mTimeouts) {
			if (this._mTimeouts[sKey]) {
				window.clearTimeout(this._mTimeouts[sKey]);
				delete this._mTimeouts[sKey];
			}
		}

		for (sKey in this._mAnimationFrames) {
			if (this._mAnimationFrames[sKey]) {
				window.cancelAnimationFrame(this._mAnimationFrames[sKey]);
				delete this._mAnimationFrames[sKey];
			}
		}
	};

	// =============================================================================
	// PRIVATE TABLE STUFF :)
	// =============================================================================

	/**
	 * Show or hide the NoData container.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @private
	 */
	function updateNoData(oTable) {
		const oDomRef = oTable.getDomRef();

		if (oDomRef) {
			oTable.getDomRef().classList.toggle("sapUiTableEmpty", TableUtils.isNoDataVisible(oTable));
			oTable._getAccExtension().updateAriaStateForOverlayAndNoData();
			oTable._getKeyboardExtension().updateNoDataAndOverlayFocus();
		}
	}

	Table.prototype.removeColumn = function(oColumn) {
		oColumn = this.removeAggregation("columns", oColumn);

		if (oColumn === null) {
			return oColumn;
		}

		if (!this._bReorderInProcess) {
			this._removeSortedColumn(oColumn);
		}

		onColumnsAggregationChange(this);

		return oColumn;
	};

	Table.prototype.removeAllColumns = function() {
		const oResult = this.removeAllAggregation("columns");
		this._aSortedColumns = [];
		onColumnsAggregationChange(this);
		return oResult;
	};

	Table.prototype.destroyColumns = function() {
		const oResult = this.destroyAggregation("columns");
		this._aSortedColumns = [];
		onColumnsAggregationChange(this);
		return oResult;
	};

	Table.prototype.addColumn = function(oColumn) {
		this.addAggregation("columns", oColumn);
		onColumnsAggregationChange(this);
		return this;
	};

	Table.prototype.insertColumn = function(oColumn, iIndex) {
		this.insertAggregation("columns", oColumn, iIndex);
		onColumnsAggregationChange(this);
		return this;
	};

	function onColumnsAggregationChange(oTable) {
		oTable.invalidateRowsAggregation();
		oTable._invalidateComputedFixedColumnCount();

		const oCreationRow = oTable.getCreationRow();
		if (oCreationRow) {
			oCreationRow._update();
		}
	}

	/**
	 * Returns the number of rows the <code>rows</code> aggregation is bound to.
	 *
	 * <b>Note: Returns a cached binding length if the binding is being refreshed.</b>
	 *
	 * @returns {int} The total number of rows.
	 * @private
	 */
	Table.prototype._getTotalRowCount = function() {
		return getTotalRowCount(this);
	};

	/**
	 * Returns the number of rows the <code>rows</code> aggregation is bound to.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {boolean} [bIgnoreCache=false] Whether to ignore the cached binding length.
	 * @returns {int} The total number of rows. Returns 0 if the <code>rows</code> aggregation is not bound.
	 * @private
	 */
	function getTotalRowCount(oTable, bIgnoreCache) {
		const oBinding = oTable.getBinding();
		const oBindingInfo = oTable.getBindingInfo("rows");

		if (!oBinding) {
			return 0;
		}

		if (oBindingInfo.length != null) {
			return oBindingInfo.length;
		}

		if (bIgnoreCache === true) {
			return oBinding.getLength();
		}

		if (!oTable._bContextsAvailable) {
			return _private(oTable).iCachedBindingLength;
		}

		_private(oTable).iCachedBindingLength = oBinding.getLength();

		return _private(oTable).iCachedBindingLength;
	}

	/**
	 * Returns the maximum row index to which can be scrolled to.
	 *
	 * @returns {int} The maximum first visible row index.
	 * @private
	 */
	Table.prototype._getMaxFirstVisibleRowIndex = function() {
		let iMaxRowIndex;

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			iMaxRowIndex = this._getTotalRowCount() - 1;
		} else {
			iMaxRowIndex = this._getTotalRowCount() - this._getRowCounts().count;
		}

		return Math.max(0, iMaxRowIndex);
	};

	/**
	 * Gets the maximum row index where rendering of scrollable rows can start from.
	 *
	 * @returns {int} The maximum index of the first scrollable row.
	 * @private
	 */
	Table.prototype._getMaxFirstRenderedRowIndex = function() {
		const iMaxRowIndex = this._getTotalRowCount() - this._getRowCounts().count;
		return Math.max(0, iMaxRowIndex);
	};

	/**
	 * Gets the index of the first rendered scrollable row. Rows do not need to exist or be rendered for the index to be available. It shows the
	 * current status. The table may still be updated.
	 *
	 * @returns {int} The index of the first scrollable row.
	 * @private
	 */
	Table.prototype._getFirstRenderedRowIndex = function() {
		return _private(this).iFirstRenderedRowIndex;
	};

	/**
	 * Returns the count of visible columns.
	 * @private
	 */
	Table.prototype._getVisibleColumns = function() {
		const aColumns = [];
		const aCols = this.getColumns();
		for (let i = 0, l = aCols.length; i < l; i++) {
			if (aCols[i].shouldRender()) {
				aColumns.push(aCols[i]);
			}
		}
		return aColumns;
	};

	/**
	 * Returns the summed width of all rendered columns
	 * @private
	 * @param {int} iStartColumn starting column for calculating the width
	 * @param {int} iEndColumn ending column for calculating the width
	 * @returns {number} the summed column width
	 */
	Table.prototype._getColumnsWidth = function(iStartColumn, iEndColumn) {
		// first calculate the min width of the table for all columns
		const aCols = this.getColumns();
		let iColsWidth = 0;

		if (iStartColumn !== 0 && !iStartColumn) {
			iStartColumn = 0;
		}
		if (iEndColumn !== 0 && !iEndColumn) {
			iEndColumn = aCols.length;
		}

		for (let i = iStartColumn, l = iEndColumn; i < l; i++) {
			if (aCols[i] && aCols[i].shouldRender()) {
				let iColumnWidth = TableUtils.convertCSSSizeToPixel(aCols[i].getWidth());

				if (iColumnWidth == null) {
					iColumnWidth = TableUtils.Column.getMinColumnWidth();
				}

				iColsWidth += iColumnWidth;
			}
		}

		return iColsWidth;

	};

	/**
	 * Triggered by the ResizeHandler if width/height changed.
	 * @private
	 */
	Table.prototype._onTableResize = function(oEvent) {
		const iOldWidth = oEvent.oldSize.width;
		const iNewWidth = oEvent.size.width;

		if (this._bInvalid || !this.getDomRef() || iOldWidth === iNewWidth) {
			return;
		}

		this._updateTableSizes(TableUtils.RowsUpdateReason.Resize);
	};

	Table.prototype._onWindowResize = function() {
		if (this._bInvalid || !this.getDomRef()) {
			return;
		}

		if (Device.browser.chrome && window.devicePixelRatio !== this._nDevicePixelRatio) {
			this._nDevicePixelRatio = window.devicePixelRatio;
			this._updateTableSizes(TableUtils.RowsUpdateReason.Zoom);
			this._adjustOutlineOffset();
		}
	};

	Table.prototype._adjustOutlineOffset = function() {
		if (window.devicePixelRatio < 1) {
			this.addStyleClass("sapUiTableZoomout");
		} else {
			this.removeStyleClass("sapUiTableZoomout");
		}
	};

	/**
	 * disables text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._disableTextSelection = function(oElement) {
		// prevent text selection
		jQuery(oElement || document.body).
			attr("unselectable", "on").
			css({
				"-moz-user-select": "none",
				"-webkit-user-select": "none",
				"user-select": "none"
			}).
			on("selectstart", function(oEvent) {
				oEvent.preventDefault();
				return false;
			});
	};

	/**
	 * enables text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._enableTextSelection = function(oElement) {
		jQuery(oElement || document.body).
			attr("unselectable", "off").
			css({
				"-moz-user-select": "",
				"-webkit-user-select": "",
				"user-select": ""
			}).
			off("selectstart");
	};

	// =============================================================================
	// CONTROL EVENT HANDLING
	// =============================================================================

	/**
	 * Finds the cell on which the click or contextmenu event is executed and
	 * notifies the listener which control has been clicked or the contextmenu
	 * should be openend.
	 * @param {function} fnFire function to fire the event
	 * @param {jQuery.Event} oEvent event object
	 * @returns {boolean} cancelled or not
	 * @private
	 */
	Table.prototype._findAndfireCellEvent = function(fnFire, oEvent, fnContextMenu) {
		const $target = jQuery(oEvent.target);
		// find out which cell has been clicked
		const $cell = $target.closest(".sapUiTableDataCell");
		const sId = $cell.attr("id");
		const aMatches = /.*-row(\d*)-col(\d*)/i.exec(sId);
		let bCancel = false;
		// TBD: cellClick event is currently not fired on row action cells.
		// If this should be enabled in future we need to consider a different set of event parameters.
		if (aMatches) {
			const iRow = aMatches[1];
			const iCol = aMatches[2];
			const oRow = this.getRows()[iRow];
			const oCell = oRow && oRow.getCells()[iCol];
			const iRealRowIndex = oRow && oRow.getIndex();
			const sColId = Column.ofCell(oCell).getId();
			const oRowBindingContext = oRow.getRowBindingContext();
			const mParams = {
				rowIndex: iRealRowIndex,
				columnIndex: iCol,
				columnId: sColId,
				cellControl: oCell,
				rowBindingContext: oRowBindingContext,
				cellDomRef: $cell.get(0)
			};
			bCancel = !fnFire.call(this, mParams);
			if (!bCancel && typeof fnContextMenu === "function") {
				mParams.cellDomRef = $cell[0];
				bCancel = fnContextMenu.call(this, mParams);
			}
		}
		return bCancel;
	};

	Table.prototype.getFocusDomRef = function() {
		this._getKeyboardExtension().initItemNavigation();

		// The element that should get the focus is not the root element of the table, but the last focused column header or cell, the overlay, or
		// the NoData element.

		if (this.getShowOverlay()) {
			return this.getDomRef("overlay");
		}

		if (TableUtils.isNoDataVisible(this)) {
			return this.getDomRef("noDataCnt");
		}

		const bHasMessage = this._oFocusInfo && this._oFocusInfo.targetInfo && TableUtils.isA(this._oFocusInfo.targetInfo, "sap.ui.core.message.Message");
		if (bHasMessage && this.getColumnHeaderVisible()) {
			const oFirstVisibleColumn = this._getVisibleColumns()[0];

			if (oFirstVisibleColumn) {
				return oFirstVisibleColumn.getDomRef();
			}
		}

		const oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
		if (oFocusedItemInfo && oFocusedItemInfo.domRef) {
			return oFocusedItemInfo.domRef;
		}

		return Control.prototype.getFocusDomRef.apply(this, arguments);
	};

	// =============================================================================
	// SORTING & FILTERING
	// =============================================================================

	/**
	 * Pushes the sorted column to array.
	 *
	 * @param {sap.ui.table.Column} oColumn Column to be sorted
	 * @param {boolean} [bAdd = false] Set to true to add the new sort criterion to the existing sort criteria
	 * @private
	 */
	Table.prototype.pushSortedColumn = function(oColumn, bAdd) {
		if (!bAdd) {
			this._aSortedColumns = [];
		}
		if (this._aSortedColumns.indexOf(oColumn) === -1) {
			this._aSortedColumns.push(oColumn);
		}
	};

	Table.prototype._removeSortedColumn = function(oColumn) {
		const iIndex = this._aSortedColumns.indexOf(oColumn);

		if (iIndex > -1) {
			this._aSortedColumns.splice(iIndex, 1);
		}
	};

	/**
	 * Gets the sorted columns in the order in which sorting was performed through the {@link sap.ui.table.Table#sort} method and menus.
	 * Does not reflect sorting at binding level or the columns sort visualization set with {@link sap.ui.table.Column#setSortOrder}.
	 *
	 * @see sap.ui.table.Table#sort
	 * @returns {sap.ui.table.Column[]} Array of sorted columns
	 * @public
	 */
	Table.prototype.getSortedColumns = function() {
		// ensure that _aSortedColumns can't be altered by accident
		return this._aSortedColumns.slice();
	};

	/**
	 * Changes or removes sorting from the table.
	 *
	 * @param {sap.ui.table.Column} [oColumn] Column to be sorted or undefined to clear sorting
	 * @param {sap.ui.core.SortOrder} [sSortOrder = sap.ui.core.SortOrder.Ascending] Sort order of the column
	 * @param {boolean} [bAdd = false]
	 *     Set to <code>true</code> to add the new sort criterion to the existing sort criteria, otherwise to replace it. If the sort order is
	 *     <code>sap.ui.core.SortOrder.None</code>, this parameter has no effect, and only the sort criterion for this column is removed from the
	 *     sort criteria.
	 * @public
	 */
	Table.prototype.sort = function(oColumn, sSortOrder, bAdd) {
		if (!oColumn) {
			// Mimic the list binding sort API. If no column is provided, restore the default sorting.
			// Make sure to also update the "sortOrder" property to correctly indicate sorted columns.
			this._aSortedColumns.forEach((oColumn) => {
				oColumn.setSortOrder(SortOrder.None);
			});
			this.getBinding()?.sort();
			this._aSortedColumns = [];
		}

		if (this.getColumns().indexOf(oColumn) >= 0) {
			oColumn._sort(sSortOrder ?? SortOrder.Ascending, bAdd);
		}
	};

	/**
	 * Filters a column by a value.
	 * If no filter value is passed, the filter value equals an empty string, and the filter for this column is removed.
	 *
	 * @param {sap.ui.table.Column} oColumn Column to be filtered
	 * @param {string} [sValue] Filter value as string (will be converted)
	 * @throws {Error} If the filter value is not a string
	 * @public
	 */
	Table.prototype.filter = function(oColumn, sValue) {
		if (this.getColumns().indexOf(oColumn) >= 0) {
			if (sValue == null) {
				sValue = "";
			} else if (typeof sValue !== "string") {
				throw new Error("The filter value is not a string");
			}
			oColumn.filter(sValue);
		}
	};

	// =============================================================================
	// SELECTION HANDLING
	// =============================================================================

	/**
	 * Updates the visual selection in the HTML markup.
	 * @private
	 */
	Table.prototype._updateSelection = function() {
		const oSelMode = this.getSelectionMode();
		if (oSelMode === SelectionMode.None) {
			// there is no selection which needs to be updated. With the switch of the
			// selection mode the selection was cleared (and updated within that step)
			return;
		}

		const mRenderConfig = this._getSelectionPlugin().getRenderConfig();

		const $SelectAll = this.$("selall");

		// trigger the rows to update their selection
		const aRows = this.getRows();

		for (let i = 0; i < aRows.length; i++) {
			const oRow = aRows[i];
			oRow._updateSelection();
		}

		if (!mRenderConfig.headerSelector.visible) {
			return;
		}

		// update the DOM without going through the whole table rendering
		if (mRenderConfig.headerSelector.type === "toggle") {
			const bAllRowsSelected = mRenderConfig.headerSelector.selected;

			$SelectAll.toggleClass("sapUiTableSelAll", !bAllRowsSelected);
			this._getAccExtension().setSelectAllState(bAllRowsSelected);
		} else if (mRenderConfig.headerSelector.type === "custom") {
			$SelectAll.toggleClass("sapUiTableSelAllDisabled", !mRenderConfig.headerSelector.enabled);

			if (mRenderConfig.headerSelector.enabled) {
				$SelectAll.removeAttr("aria-disabled");
			} else {
				$SelectAll.attr("aria-disabled", "true");
			}
			const sTitle = mRenderConfig.headerSelector.tooltip;
			$SelectAll.attr('title', sTitle);
		}
	};

	/**
	 * Notifies the selection listeners about the changed rows.
	 * @private
	 */
	Table.prototype._onSelectionChanged = function(oEvent) {
		this._updateSelection();

		// If a selection plugin is applied to the table, the "rowSelectionChange" event should not be fired.
		if (this._hasSelectionPlugin()) {
			return;
		}

		const oSelectionPlugin = this._getSelectionPlugin();
		const aRowIndices = oEvent.getParameter("rowIndices");
		const bSelectAll = oEvent.getParameter("selectAll");
		const iRowIndex = this._iSourceRowIndex !== undefined ? this._iSourceRowIndex : oSelectionPlugin.getSelectedIndex();

		this.fireRowSelectionChange({
			rowIndex: iRowIndex,
			rowContext: this.getContextByIndex(iRowIndex),
			rowIndices: aRowIndices,
			selectAll: bSelectAll,
			userInteraction: this._iSourceRowIndex !== undefined
		});
	};

	/**
	 * Returns the context of a row by its index. Please note that for server-based models like OData,
	 * the supplied index might not have been loaded yet. If the context is not available at the client,
	 * the binding may trigger a backend request and request this single context. Although this API
	 * looks synchronous it may not return a context but load it and fire a change event on the binding.
	 *
	 * For server-based models you should consider to only make this API call when the index is within
	 * the currently visible scroll area.
	 *
	 * @param {int} iIndex Index of the row to return the context from.
	 * @returns {sap.ui.model.Context | null} The context at this index if available
	 * @public
	 */
	Table.prototype.getContextByIndex = function(iIndex) {
		const oBinding = this.getBinding();
		let oContext = null;

		if (!oBinding || iIndex < 0) {
			return oContext;
		}

		if (oBinding.getContextByIndex) {
			oContext = oBinding.getContextByIndex(iIndex);
		} else {
			oContext = oBinding.getContexts(iIndex, 1, 0, true)[0];
		}

		return oContext || null;
	};

	/**
	 * Sets the selected index. The previous selection is removed.
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @param {int} iIndex The index to select
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 */
	Table.prototype.setSelectedIndex = function(iIndex) {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#setSelectedIndex must not be called if a selection plugin is applied.");
		}

		this._getSelectionPlugin().setSelectedIndex(iIndex);
		return this;
	};

	/**
	 * Removes complete selection.
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 */
	Table.prototype.clearSelection = function() {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#clearSelection must not be called if a selection plugin is applied.");
		}

		this._getSelectionPlugin().clearSelection();
		return this;
	};

	/**
	 * Adds all rows to the selection.
	 * Please note that for server based models like OData the indices which are considered to be selected might not
	 * be available at the client yet. Calling getContextByIndex might not return a result but trigger a roundtrip
	 * to request this single entity.
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 */
	Table.prototype.selectAll = function() {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#selectAll must not be called if a selection plugin is applied.");
		}

		if (TableUtils.hasSelectAll(this)) {
			this._getSelectionPlugin().selectAll();
		}

		return this;
	};

	/**
	 * Zero-based indices of selected items, wrapped in an array. An empty array means "no selection".
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @returns {int[]} Selected indices
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 */
	Table.prototype.getSelectedIndices = function() {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#getSelectedIndices must not be called if a selection plugin is applied.");
		}

		return this._getSelectionPlugin().getSelectedIndices();
	};

	/**
	 * Adds the given selection interval to the selection. In case of a single selection, only <code>iIndexTo</code> is added to the selection.
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 */
	Table.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#addSelectionInterval must not be called if a selection plugin is applied.");
		}

		this._getSelectionPlugin().addSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Sets the given selection interval as selection. In case of a single selection, only <code>iIndexTo</code> is selected.
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 */
	Table.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#setSelectionInterval must not be called if a selection plugin is applied.");
		}

		this._getSelectionPlugin().setSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Removes the given selection interval from the selection. In case of single selection, only <code>iIndexTo</code> is removed from the selection.
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @param {int} iIndexFrom Index from which the deselection should start
	 * @param {int} iIndexTo Index up to which to deselect
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 */
	Table.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#removeSelectionInterval must not be called if a selection plugin is applied.");
		}

		this._getSelectionPlugin().removeSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Checks whether an index is selected.
	 *
	 * <b>Note:</b> The built-in selection API has limited functionality, especially when it is combined with paging (e.g. OData). Therefore,
	 * it is recommended to use a selection plugin instead.
	 *
	 * @param {int} iIndex Index to check for selection
	 * @returns {boolean} Whether the index is selected
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 */
	Table.prototype.isIndexSelected = function(iIndex) {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#isIndexSelected must not be called if a selection plugin is applied.");
		}

		return this._getSelectionPlugin().isIndexSelected(iIndex);
	};

	/**
	 * Get the binding object for a specific aggregation/property.
	 *
	 * @param {string} [sName="rows"] Name of the property or aggregation
	 * @return {sap.ui.model.Binding} The binding for the given name
	 * @public
	 */
	Table.prototype.getBinding = function(sName) {
		return Control.prototype.getBinding.call(this, sName == null ? "rows" : sName);
	};

	/**
	 * In contrast to the function <code>getFixedColumnCount</code> which returns the value of the property
	 * <code>fixedColumnCount</code>, this function returns the actual fixed column count computed based on the column
	 * spans of the header, the width of the table and the width of the columns.
	 *
	 * @returns {int} The actual fixed column count computed based on the column spans of the header, the width of the
	 * table and the width of the columns.
	 * @private
	 */
	Table.prototype.getComputedFixedColumnCount = function() {
		if (this._bIgnoreFixedColumnCount) {
			return 0;
		}

		return this._getSpanBasedComputedFixedColumnCount();
	};

	/**
	 * Returns the fixed column count computed based on the column spans of the header.
	 *
	 * @returns {int} The fixed column count computed based on the column spans of the header.
	 * @private
	 */
	Table.prototype._getSpanBasedComputedFixedColumnCount = function() {
		if (_private(this).iComputedFixedColumnCount === null) {
			const aCols = this.getColumns();
			let oColumn;
			let iFixedColumnCount = this.getFixedColumnCount();

			for (let i = iFixedColumnCount - 1; i >= 0; i--) {
				oColumn = aCols[i];
				if (oColumn) {
					iFixedColumnCount = Math.max(iFixedColumnCount, oColumn.getIndex() + TableUtils.Column.getHeaderSpan(oColumn));
					break;
				}
			}
			_private(this).iComputedFixedColumnCount = Math.min(iFixedColumnCount, aCols.length);
		}

		return _private(this).iComputedFixedColumnCount;
	};

	Table.prototype.setFixedColumnCount = function(iFixedColumnCount) {
		this.setProperty("fixedColumnCount", iFixedColumnCount);
		this._invalidateComputedFixedColumnCount();

		const aCols = this.getColumns();
		let oColumn;
		//Set current width as fixed width for cols
		const $ths = this.$().find(".sapUiTableCtrlFirstCol > th");

		for (let i = this._getSpanBasedComputedFixedColumnCount() - 1; i >= 0; i--) {
			oColumn = aCols[i];
			if (oColumn && TableUtils.isVariableWidth(oColumn.getWidth())) {
				// remember the current column width for the next rendering
				oColumn._iFixWidth = $ths.filter("[data-sap-ui-headcolindex='" + oColumn.getIndex() + "']").width();
			}
		}

		this._collectTableSizes(); // Avoid double rendering if the fixed column count needs to be adjusted.

		return this;
	};

	/**
	 * Sets the threshold value, which will be added to all data requests in case the Table is bound against an OData service.
	 *
	 * @param {int} iThreshold The threshold
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Table.prototype.setThreshold = function(iThreshold) {
		this.setProperty("threshold", iThreshold, true);
		return this;
	};

	/**
	 * Sets the threshold value, which will be added to all data requests
	 * initiated by scrolling if the <code>Table</code> is bound against
	 * an OData service.
	 *
	 * @param {int} iThreshold The threshold for scrolling
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Table.prototype.setScrollThreshold = function(iThreshold) {
		this.setProperty("scrollThreshold", iThreshold, true);
		return this;
	};

	/**
	 * Checks whether the event is a touch event.
	 *
	 * @param {jQuery.Event} oEvent The event to check
	 * @returns {boolean} Returns <code>true</code>, if <code>oEvent</code> is a touch event
	 * @private
	 */
	Table.prototype._isTouchEvent = function(oEvent) {
		return !!(oEvent && oEvent.originalEvent && oEvent.originalEvent.touches);
	};

	Table.prototype._getRowClone = function(vIndex) {
		const bIndexIsNumber = typeof vIndex === "number";
		const bRowIsPoolable = bIndexIsNumber;
		let oRowClone = bRowIsPoolable ? this._aRowClones[vIndex] : null;

		if (oRowClone && !oRowClone.bIsDestroyed) {
			return oRowClone;
		}

		// No intact row clone at this index exists. Therefore, create a new row clone.
		oRowClone = new Row(this.getId() + "-rows" + "-row" + (bIndexIsNumber ? vIndex : "-" + vIndex));

		if (bRowIsPoolable) {
			this._aRowClones[vIndex] = oRowClone;
		}

		// Add cells to the row clone.
		const aColumns = this.getColumns();
		for (let i = 0, l = aColumns.length; i < l; i++) {
			if (aColumns[i].getVisible()) {
				const oColumnTemplateClone = aColumns[i].getTemplateClone(i);
				if (oColumnTemplateClone) {
					oRowClone.addCell(oColumnTemplateClone);
				}
			}
		}

		// Add the row actions to the row clone.
		if (TableUtils.hasRowActions(this)) {
			const oRowAction = this.getRowActionTemplate().clone();
			oRowClone.setAggregation("_rowAction", oRowAction, true);
		}

		// Add the row settings to the row clone.
		const oRowSettingsTemplate = this.getRowSettingsTemplate();
		if (oRowSettingsTemplate) {
			const oRowSettings = oRowSettingsTemplate.clone();
			oRowClone.setAggregation("_settings", oRowSettings, true);
		}

		return oRowClone;
	};

	/**
	 * Sets a marker to indicate that the rows aggregation is invalid and should be destroyed within the next cycle
	 *
	 * @private
	 */
	Table.prototype.invalidateRowsAggregation = function() {
		this._bRowAggregationInvalid = true;
	};

	/**
	 * Invalidates the cached computed fixed column count.
	 *
	 * @private
	 */
	Table.prototype._invalidateComputedFixedColumnCount = function() {
		_private(this).iComputedFixedColumnCount = null;
	};

	/**
	 * Gets the base row height. This number is a pixel value and is used, for example, for layout and scrolling calculations.
	 *
	 * @returns {int} The base row height.
	 * @private
	 */
	Table.prototype._getBaseRowHeight = function() {
		const iBaseRowContentHeight = getRowMode(this).getBaseRowContentHeight();

		if (iBaseRowContentHeight > 0) {
			return iBaseRowContentHeight + TableUtils.RowHorizontalFrameSize;
		} else {
			return this._getDefaultRowHeight();
		}
	};

	/**
	 * Gets the default row height in. This number is a pixel value.
	 *
	 * @returns {int} The default row height.
	 * @private
	 */
	Table.prototype._getDefaultRowHeight = function() {
		const sContentDensity = TableUtils.getContentDensity(this);
		return TableUtils.DefaultRowHeight[sContentDensity];
	};

	/**
	 * Gets the default row content height. This number is a pixel value.
	 *
	 * @returns {int} The default row content height.
	 * @private
	 */
	Table.prototype._getDefaultRowContentHeight = function() {
		const sContentDensity = TableUtils.getContentDensity(this);
		return TableUtils.BaseSize[sContentDensity];
	};

	Table.prototype.setNoData = function(vNoData) {
		const vOldNoContentMessage = TableUtils.getNoContentMessage(this);
		this.setAggregation("noData", vNoData, true);
		const vNewNoContentMessage = TableUtils.getNoContentMessage(this);

		if (TableUtils.isA(vNoData, "sap.m.IllustratedMessage")) {
			insertNoColumnsIllustratedMessage(this);
		} else {
			this.destroyAggregation("_noColumnsMessage", true);
		}

		if (typeof vOldNoContentMessage === "string" && typeof vNewNoContentMessage === "string") {
			// Old and new NoData texts are plain strings, therefore we are able to directly update the DOM in case of a text change.
			if (vOldNoContentMessage !== vNewNoContentMessage) {
				this.$("noDataMsg").text(vNewNoContentMessage);
			}
		} else {
			this.invalidate();
		}

		return this;
	};

	function insertNoColumnsIllustratedMessage(oTable) {
		if (oTable.getAggregation("_noColumnsMessage") || _private(oTable).bIsLoadingNoColumnsMessage) {
			return;
		}

		_private(oTable).bIsLoadingNoColumnsMessage = true;

		sap.ui.require(["sap/m/table/Util"], function(MTableUtil) {
			if (!TableUtils.isA(oTable.getNoData(), "sap.m.IllustratedMessage")) {
				return;
			}

			const oNoColumnsMessage = MTableUtil.getNoColumnsIllustratedMessage();
			oNoColumnsMessage.setEnableVerticalResponsiveness(true);
			oTable.setAggregation("_noColumnsMessage", oNoColumnsMessage, TableUtils.getVisibleColumnCount(oTable) > 0);
			delete _private(oTable).bIsLoadingNoColumnsMessage;
		});
	}

	Table.prototype.setBusy = function(bBusy) {
		const bOldBusyState = this.getBusy();
		const vReturn = Control.prototype.setBusy.call(this, bBusy, "sapUiTableGridCnt");
		const bNewBusyState = this.getBusy();

		if (bOldBusyState !== bNewBusyState) {
			this.fireBusyStateChanged({busy: bNewBusyState});
		}

		return vReturn;
	};

	Table.prototype.setEnableBusyIndicator = function(bValue) {
		this.setProperty("enableBusyIndicator", bValue, true);

		if (this.getEnableBusyIndicator()) {
			updateAutomaticBusyIndicator(this);
		} else {
			this.setBusy(false);
			clearHideBusyIndicatorTimeout(this);
		}

		return this;
	};

	/**
	 * @private
	 */
	Table.prototype._onBindingDataRequested = function() {
		_private(this).iPendingRequests++;
		updateAutomaticBusyIndicator(this);
	};

	/**
	 * @private
	 */
	Table.prototype._onBindingDataReceived = function() {
		_private(this).iPendingRequests--;
		updateAutomaticBusyIndicator(this);
	};

	/**
	 * @private
	 */
	Table.prototype._hasPendingRequests = function() {
		return _private(this).iPendingRequests > 0;
	};

	function updateAutomaticBusyIndicator(oTable) {
		if (!oTable.getEnableBusyIndicator()) {
			return;
		}

		clearHideBusyIndicatorTimeout(oTable);

		if (oTable._hasPendingRequests()) {
			oTable.setBusy(true);
		} else {
			// This timer should avoid flickering of the busy indicator and unnecessary updates of NoData in case a request will be sent
			// (dataRequested) immediately after the last response was received (dataReceived).
			_private(oTable).hideBusyIndicatorTimeoutId = setTimeout(function() {
				oTable.setBusy(false);
				clearHideBusyIndicatorTimeout(oTable);
			}, 10); // BCP: 2270133571 - In V4 there can be asynchronous sequential requests where a timeout of 0 is insufficient to avoid flickering.
		}
	}

	function clearHideBusyIndicatorTimeout(oTable) {
		clearTimeout(_private(oTable).hideBusyIndicatorTimeoutId);
		delete _private(oTable).hideBusyIndicatorTimeoutId;
	}

	/**
	 * Lets you control in which situation the <code>Scrollbar</code> fires scroll events.
	 *
	 * @param {boolean} bLargeDataScrolling Set to true to let the <code>Scrollbar</code> only fire scroll events when
	 * the scroll handle is released. No matter what the setting is, the <code>Scrollbar</code> keeps on firing scroll events
	 * when the user scrolls with the mouse wheel or using touch.
	 * @private
	 */
	Table.prototype._setLargeDataScrolling = function(bLargeDataScrolling) {
		this._bLargeDataScrolling = !!bLargeDataScrolling;
	};

	Table.prototype.setRowActionTemplate = function(oTemplate) {
		this.setAggregation("rowActionTemplate", oTemplate);
		this.invalidateRowsAggregation();
		return this;
	};

	Table.prototype.setRowActionCount = function(iCount) {
		if (typeof iCount === "number") {
			iCount = Math.max(0, Math.min(iCount, 2));
		}

		return this.setProperty("rowActionCount", iCount);
	};

	Table.prototype.setRowSettingsTemplate = function(oTemplate) {
		this.setAggregation("rowSettingsTemplate", oTemplate);
		this.invalidateRowsAggregation();
		return this;
	};

	/**
	 * Gets the selection plugin. If no selection plugin is applied to the table, a legacy selection plugin is returned.
	 *
	 * @return {sap.ui.table.plugins.SelectionPlugin} The selection plugin.
	 * @private
	 */
	Table.prototype._getSelectionPlugin = function() {
		const oSelectionPlugin = this._oSelectionPlugin || this._oLegacySelectionPlugin;

		// Temporary fix for the Support Assistant hacks. Support Assistant should implement a selection plugin.
		// TODO: Before we recommend to implement a selection plugin -> Complete BLI CPOUIFTEAMB-1464
		if (typeof this._getSelectedIndicesCount === "function" && oSelectionPlugin.getSelectedCount !== this._getSelectedIndicesCount) {
			oSelectionPlugin.getSelectedCount = this._getSelectedIndicesCount;
			["isIndexSelected", "setSelectedIndex", "getSelectedIndex", "getSelectedIndices", "setSelectionInterval", "addSelectionInterval",
			 "removeSelectionInterval", "selectAll", "clearSelection"].forEach(function(sMethodName) {
				oSelectionPlugin[sMethodName] = this[sMethodName];
			}.bind(this));
		}

		return oSelectionPlugin;
	};

	/**
	 * Checks whether a selection plugin is applied to the table. Returns <code>false</code> if no selection plugin is applied to the table and a
	 * legacy selection plugin is used.
	 *
	 * @return {boolean} Whether a selection plugin is applied.
	 * @private
	 */
	Table.prototype._hasSelectionPlugin = function() {
		return this._oSelectionPlugin != null;
	};

	function getMainSelectionPlugin(oTable) {
		const aSelectionPlugins = oTable.getDependents().filter((oPlugin) => oPlugin.isA("sap.ui.table.plugins.SelectionPlugin"));

		return aSelectionPlugins[0];
	}

	/**
	 * Initializes the selection plugin used by the table. Attaches event listeners.
	 * The first plugin of type <code>sap.ui.table.plugins.SelectionPlugin</code> in the <code>plugins</code> aggregation is used by the table. If no
	 * selection plugin is applied, a legacy selection plugin is created.
	 *
	 * @private
	 */
	Table.prototype._initSelectionPlugin = function() {
		const oSelectionPlugin = getMainSelectionPlugin(this);

		if (this.isDestroyed() || this.isDestroyStarted()) {
			return;
		}

		if (oSelectionPlugin) {
			this._destroyLegacySelectionPlugin();
			detachSelectionPlugin(this, this._oSelectionPlugin);
			attachSelectionPlugin(this, oSelectionPlugin);
			this._oSelectionPlugin = oSelectionPlugin;
		} else {
			this._initLegacySelectionPlugin();
			detachSelectionPlugin(this, this._oSelectionPlugin);
			delete this._oSelectionPlugin;
		}
	};

	/**
	 * Initializes a legacy selection plugin, if no selection plugin is set.
	 *
	 * @private
	 */
	Table.prototype._initLegacySelectionPlugin = function() {
		if (this._oLegacySelectionPlugin || getMainSelectionPlugin(this)) {
			// No legacy selection plugin needs to be created if it already exists, or if a selection plugin is set.
			return;
		}

		this._oLegacySelectionPlugin = this._createLegacySelectionPlugin();
		this.addAggregation("_hiddenDependents", this._oLegacySelectionPlugin);
		attachSelectionPlugin(this, this._oLegacySelectionPlugin);
	};

	Table.prototype._destroyLegacySelectionPlugin = function() {
		if (this._oLegacySelectionPlugin && !this._oLegacySelectionPlugin.isDestroyStarted()) {
			this._oLegacySelectionPlugin.destroy();
			delete this._oLegacySelectionPlugin;
		}
	};

	Table.prototype._createLegacySelectionPlugin = function() {
		return new SelectionModelSelectionPlugin();
	};

	function attachSelectionPlugin(oTable, oSelectionPlugin) {
		if (oSelectionPlugin && oSelectionPlugin.getMetadata().hasEvent("selectionChange")) {
			oSelectionPlugin.attachSelectionChange(oTable._onSelectionChanged, oTable);
		}
	}

	function detachSelectionPlugin(oTable, oSelectionPlugin) {
		if (oSelectionPlugin && oSelectionPlugin.getMetadata().hasEvent("selectionChange")) {
			oSelectionPlugin.detachSelectionChange(oTable._onSelectionChanged, oTable);
		}
	}

	/**
	 * @inheritDoc
	 */
	Table.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (sAggregationName === "_hiddenDependents") {
			return Control.prototype.insertAggregation.call(this, sAggregationName, oObject, iIndex, true);
		}
		return Control.prototype.insertAggregation.apply(this, arguments);
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		if (sAggregationName === "_hiddenDependents") {
			return Control.prototype.addAggregation.call(this, sAggregationName, oObject, true);
		}
		return Control.prototype.addAggregation.apply(this, arguments);
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.removeAggregation = function(sAggregationName, vObject, bSuppressInvalidate) {
		if (sAggregationName === "_hiddenDependents") {
			return Control.prototype.removeAggregation.call(this, sAggregationName, vObject, true);
		}
		return Control.prototype.removeAggregation.apply(this, arguments);
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.removeAllAggregation = function(sAggregationName, bSuppressInvalidate) {
		if (sAggregationName === "_hiddenDependents") {
			return Control.prototype.removeAllAggregation.call(this, sAggregationName, true);
		}
		return Control.prototype.removeAllAggregation.apply(this, arguments);
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.destroyAggregation = function(sAggregationName, bSuppressInvalidate) {
		if (sAggregationName === "_hiddenDependents") {
			return Control.prototype.destroyAggregation.call(this, sAggregationName, true);
		}

		Control.prototype.destroyAggregation.apply(this, arguments);

		if (sAggregationName === "rows") {
			// Rows that are not in the aggregation must be destroyed manually.
			this._aRowClones.forEach(function(oRowClone) {
				oRowClone.destroy();
			});
			this._aRowClones = [];
		}

		return this;
	};

	/**
	 * Returns the control inside the cell with the given row index (in the <code>rows</code> aggregation)
	 * and column index (in the <code>columns</code> aggregation or in the list of visible columns only, depending on
	 * parameter <code>bVisibleColumnIndex</code>).
	 *
	 * The use of this method outside the sap.ui.table library is only allowed for test purposes!
	 *
	 * @param {int} iRowIndex Index of row in the table's <code>rows</code> aggregation
	 * @param {int} iColumnIndex Index of column in the list of visible columns or in the <code>columns</code> aggregation, as indicated with
	 *                           <code>bVisibleColumnIndex</code>
	 * @param {boolean} bVisibleColumnIndex If set to <code>true</code>, the given column index is interpreted as index in the list of visible
	 *                                      columns, otherwise as index in the <code>columns</code> aggregation
	 * @returns {sap.ui.core.Control} Control inside the cell with the given row and column index or <code>null</code> if no such control exists
	 * @private
	 * @ui5-restricted
	 */
	Table.prototype.getCellControl = function(iRowIndex, iColumnIndex, bVisibleColumnIndex) {
		const oInfo = TableUtils.getRowColCell(this, iRowIndex, iColumnIndex, !bVisibleColumnIndex);
		return oInfo.cell;
	};

	/**
	 * Fires the <code>rowsUpdated</code> event asynchronously.
	 *
	 * @param {sap.ui.table.utils.TableUtils.RowsUpdateReason} [sReason=sap.ui.table.utils.TableUtils.RowsUpdateReason.Unknown]
	 * The reason why the rows have been updated.
	 * @fires Table#rowsUpdated
	 * @private
	 */
	Table.prototype._fireRowsUpdated = function(sReason) {
		const mParameters = {
			reason: sReason || TableUtils.RowsUpdateReason.Unknown
		};

		this.onRowsUpdated(mParameters);

		clearTimeout(this._mTimeouts.fireRowsUpdated);
		this._mTimeouts.fireRowsUpdated = setTimeout(function() {
			// If the rows are updated by setting new binding contexts, the cell contents are updated asynchronously (re-rendering).
			// This has to be waited for before the update process of the rows can be completed.
			this.onRowsContentUpdated(mParameters);

			/**
			 * This event is fired after the rows have been updated.
			 *
			 * @event Table#_rowsUpdated
			 * @type {Object}
			 * @property {sap.ui.table.utils.TableUtils.RowsUpdateReason} reason - The reason why the rows have been updated.
			 * @private
			 */
			this.fireEvent("_rowsUpdated", mParameters);
			this.fireRowsUpdated();
		}.bind(this), 0);
	};

	Table.prototype.onRowsUpdated = function(mParameters) {
		TableUtils.Grouping.updateGroups(this);
		TableUtils.Menu.closeContentCellContextMenu(this);
		this._getAccExtension()._updateAriaRowIndices();
		this._updateSelection();
		updateNoData(this);

		// TODO: Move somewhere else. Row or GroupingUtils
		this.getRows().forEach(function(oRow) {
			oRow.getCells().forEach(function(oCell) {
				const oColumn = Column.ofCell(oCell);
				const oCellContentVisibilitySettings = oColumn._getCellContentVisibilitySettings();
				const $Cell = oRow.getDomRefs(true).row.find("td[data-sap-ui-colid=\"" + oColumn.getId() + "\"]");
				let bShowCellContent = true;

				if (!$Cell) {
					return;
				}

				if (oRow.isGroupHeader()) {
					if (!oRow.isExpandable()) {
						bShowCellContent = oCellContentVisibilitySettings.groupHeader.nonExpandable;
					} else if (oRow.isExpanded()) {
						bShowCellContent = oCellContentVisibilitySettings.groupHeader.expanded;
					} else {
						bShowCellContent = oCellContentVisibilitySettings.groupHeader.collapsed;
					}
				} else if (oRow.isTotalSummary()) {
					bShowCellContent = oCellContentVisibilitySettings.summary.total;
				} else if (oRow.isGroupSummary()) {
					bShowCellContent = oCellContentVisibilitySettings.summary.group;
				} else {
					bShowCellContent = oCellContentVisibilitySettings.standard;
				}

				$Cell.toggleClass("sapUiTableCellHidden", !bShowCellContent);
			});
		});
	};

	Table.prototype.onRowsContentUpdated = function(mParameters) {
		if (this.getRows().length > 0) {
			this._resetRowHeights();
			this._aRowHeights = this._collectRowHeights(false);
			this._updateRowHeights(this._aRowHeights, false);
			this._getAccExtension().updateAccForCurrentCell(mParameters.reason);
		}
	};

	/**
	 * Enriches the table with synchronization capabilities exposed through an interface of the SyncExtension applied to the table.
	 * <b>Do not call this method more than once on the same table!</b>
	 *
	 * @see sap.ui.table.extensions.Synchronization#getInterface
	 * @returns {Promise} Returns a promise that resolves with the synchronization interface, and rejects with an error object.
	 * @private
	 * @ui5-restricted sap.gantt
	 */
	Table.prototype._enableSynchronization = function() {
		const that = this;
		return new Promise(function(resolve, reject) {
			sap.ui.require(["sap/ui/table/extensions/Synchronization"], function(SyncExtension) {
				resolve(ExtensionBase.enrich(that, SyncExtension).getInterface());
			}, function(oError) {
				reject(oError);
			});
		});
	};

	/**
	 * Sets constraints on the row counts of the table. May impact the result of the row count computation in the row modes.
	 * The setter for the hidden property may only be used indirectly by plugins and may not be used otherwise.
	 *
	 * @see sap.ui.table.plugins.PluginBase#setRowCountConstraints
	 * @param {object} mConstraints Row count constraints
	 * @private
	 */
	Table.prototype._setRowCountConstraints = function(mConstraints) {
		this.setProperty("rowCountConstraints", mConstraints);
	};

	function excludeHiddenDepdendents(oTable, aAggregatedObjects) {
		const aHiddenDependents = oTable.getAggregation("_hiddenDependents") || [];
		return aAggregatedObjects.filter((oObject) => !aHiddenDependents.includes(oObject));
	}

	/**
	 * @inheritDoc
	 */
	Table.prototype.findAggregatedObjects = function() {
		return excludeHiddenDepdendents(this, Control.prototype.findAggregatedObjects.apply(this, arguments));
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.findElements = function() {
		return excludeHiddenDepdendents(this, Control.prototype.findElements.apply(this, arguments));
	};

	/**
	 * Returns the threshold that is applied during scrolling. The returned
	 * integer is based on the <code>scrollThreshold</code> property in combination
	 * with the <code>threshold</code> property.
	 *
	 * @returns {number} The threshold that is applied during scrolling
	 */
	Table.prototype._getScrollThreshold = function() {
		const iScrollThreshold = this.getScrollThreshold();

		if (iScrollThreshold === -1) {
			return this.getThreshold();

		}
		return iScrollThreshold;
	};

	return Table;
});