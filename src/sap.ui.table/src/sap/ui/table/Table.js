/*!
 * ${copyright}
 */

// Provides control sap.ui.table.Table.
sap.ui.define([
    'jquery.sap.global',
    'sap/ui/Device',
    'sap/ui/core/Control',
    'sap/ui/core/Element',
    'sap/ui/core/IconPool',
    'sap/ui/model/ChangeReason',
    'sap/ui/model/Filter',
    'sap/ui/model/SelectionModel',
    'sap/ui/model/Sorter',
    'sap/ui/model/BindingMode',
    './Column',
    './Row',
    './library',
    './TableUtils',
    './TableExtension',
    './TableAccExtension',
    './TableKeyboardExtension',
    './TablePointerExtension',
    './TableScrollExtension',
    './TableDragAndDropExtension',
    "./TableRenderer",
    'jquery.sap.dom',
    'jquery.sap.trace',
    'jquery.sap.events'
],
	function(
	    jQuery,
		Device,
		Control,
		Element,
		IconPool,
		ChangeReason,
		Filter,
		SelectionModel,
		Sorter,
		BindingMode,
		Column,
		Row,
		library,
		TableUtils,
		TableExtension,
		TableAccExtension,
		TableKeyboardExtension,
		TablePointerExtension,
		TableScrollExtension,
		TableDragAndDropExtension /*, jQuerySapPlugin,jQuerySAPTrace */,
		TableRenderer
	) {
	"use strict";


	// shortcuts
	var GroupEventType = library.GroupEventType,
		NavigationMode = library.NavigationMode,
		SelectionMode = library.SelectionMode,
		SelectionBehavior = library.SelectionBehavior,
		SortOrder = library.SortOrder,
		VisibleRowCountMode = library.VisibleRowCountMode;

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
	 * </p>
	 * <p>
	 *     The Table control relies completely on data binding, and its supported feature set is tightly coupled to
	 *     the data model and binding being used.
	 * </p>
	 *
	 *
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.Table
	 * @see {@link topic:08197fa68e4f479cbe30f639cc1cd22c sap.ui.table}
	 * @see {@link topic:148892ff9aea4a18b912829791e38f3e Tables: Which One Should I Choose?}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Table = Control.extend("sap.ui.table.Table", /** @lends sap.ui.table.Table.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {

			/**
			 * Width of the Table.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'},

			/**
			 * The height of the row content in pixel. The actual row height is also influenced by other factors, such as the border width.
			 * If no value is set, a default height is applied based on the content density configuration.
			 */
			rowHeight : {type : "int", group : "Appearance", defaultValue : null},

			/**
			 * Height of the column header of the Table in pixel.
			 */
			columnHeaderHeight : {type : "int", group : "Appearance", defaultValue : null},

			/**
			 * Flag whether the column header is visible or not.
			 */
			columnHeaderVisible : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Number of visible rows of the table.
			 */
			visibleRowCount : {type : "int", group : "Appearance", defaultValue : 10},

			/**
			 * First visible row.
			 */
			firstVisibleRow : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Selection mode of the Table. This property controls whether single or multiple rows can be selected and
			 * how the selection can be extended. It may also influence the visual appearance.
			 * When the selection mode is changed, the current selection is removed.
			 * <b>Note:</b> Since the group header visualization relies on the row selectors, the row selectors are always shown if the grouping
			 * functionality (depends on table type) is enabled, even if <code>sap.ui.table.SelectionMode.None</code> is set.
			 */
			selectionMode : {type : "sap.ui.table.SelectionMode", group : "Behavior", defaultValue : SelectionMode.MultiToggle},

			/**
			 * Selection behavior of the Table. This property defines whether the row selector is displayed and whether the row, the row selector or
			 * both can be clicked to select a row.
			 * <b>Note:</b> Since the group header visualization relies on the row selectors, the row selectors are always shown if the grouping
			 * functionality (depends on table type) is enabled, even if <code>sap.ui.table.SelectionBehavior.RowOnly</code> is set.
			 */
			selectionBehavior : {type : "sap.ui.table.SelectionBehavior", group : "Behavior", defaultValue : SelectionBehavior.RowSelector},

			/**
			 * Zero-based index of selected item. Index value for no selection is -1.
			 * When multi-selection is enabled and multiple items are selected, the method returns
			 * the lead selected item. Sets the zero-based index of the currently selected item. This method
			 * removes any previous selections. When the given index is invalid, the call is ignored.
			 */
			selectedIndex : {type : "int", group : "Appearance", defaultValue : -1},

			/**
			 * Flag whether the controls of the Table are editable or not (currently this only controls the background color in certain themes!)
			 */
			editable : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * This property has been deprecated and must not be used anymore, since <code>Scrollbar</code> is the only supported option.
			 *
			 * @deprecated As of version 1.38
			 */
			navigationMode : {type : "sap.ui.table.NavigationMode", group : "Behavior", defaultValue : NavigationMode.Scrollbar},

			/**
			 * The <code>threshold</code> defines how many additional (not yet visible records) shall be pre-fetched to enable smooth
			 * scrolling. The threshold is always added to the <code>visibleRowCount</code>. If the <code>visibleRowCount</code> is 10 and the
			 * <code>threshold</code> is 100, there will be 110 records fetched with the initial load.
			 * If the <code>threshold</code> is lower than the <code>visibleRowCount</code>, the <code>visibleRowCount</code> will be used as
			 * the <code>threshold</code>. If the value is 0 then the thresholding is disabled.
			 */
			threshold : {type : "int", group : "Appearance", defaultValue : 100},

			/**
			 * Flag to enable or disable column reordering
			 */
			enableColumnReordering : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Enables or disables grouping. If grouping is enabled, the table is grouped by the column which is defined
			 * in the <code>groupBy</code> association.
			 *
			 * The following restrictions apply:
			 * <ul>
			 *  <li>Only client models are supported (e.g. {@link sap.ui.model.json.JSONModel}). Grouping does not work with OData models.</li>
			 *  <li>The table can only be grouped by <b>one</b> column at a time. Grouping by another column will remove the current grouping.</li>
			 *  <li>If grouping has been done, sorting and filtering is not possible. Any existing sorting and filtering rules do no longer apply.
			 *      The UI is not updated accordingly (e.g. menu items, sort and filter icons).</li>
			 *  <li>The column, by which the table is grouped, is not visible. It will become visible again only if the table is grouped by another
			 *      column or grouping is disabled.</li>
			 * </ul>
			 *
			 * @experimental As of 1.28. This feature has a limited functionality.
			 * @see sap.ui.table.Table#setGroupBy
			 */
			enableGrouping : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Flag to show or hide the column visibility menu. This menu will get displayed in each
			 * generated column header menu. It allows to show or hide columns
			 */
			showColumnVisibilityMenu : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Flag whether to show the no data overlay or not once the table is empty. If set to false
			 * the table will just show a grid of empty cells
			 */
			showNoData : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * This defines how the table handles the visible rows in the table. The default behavior is,
			 * that a fixed row count is defined. If you change it to auto the visibleRowCount property is
			 * changed by the table automatically. It will then adjust its maximum row count to the space it is
			 * allowed to cover (limited by the surrounding container) and its minimum row count to the value of
			 * the property minAutoRowCount (default value : 5) In manual mode the user can change
			 * the visibleRowCount interactively.
			 * @since 1.9.2
			 */
			visibleRowCountMode : {type : "sap.ui.table.VisibleRowCountMode", group : "Appearance", defaultValue : VisibleRowCountMode.Fixed},

			/**
			 * This property is used to set the minimum count of visible rows when the property visibleRowCountMode is set to Auto or Interactive.
			 * For any other visibleRowCountMode, it is ignored.
			 */
			minAutoRowCount : {type : "int", group : "Appearance", defaultValue : 5},

			/**
			 * Number of columns that are fix on the left. When you use a horizontal scrollbar, only
			 * the columns which are not fixed, will scroll. Fixed columns need a defined width for the feature to work.
			 * Please note that the aggregated width of all fixed columns must not exceed the table width since there
			 * will be no scrollbar for fixed columns.
			 */
			fixedColumnCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Number of rows that are fix on the top. When you use a vertical scrollbar, only the rows which are not fixed, will scroll.
			 */
			fixedRowCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Number of rows that are fix on the bottom. When you use a vertical scrollbar, only the rows which are not fixed, will scroll.
			 * @since 1.18.7
			 */
			fixedBottomRowCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Flag whether to show or hide the column menu item to freeze or unfreeze a column.
			 * @since 1.21.0
			 */
			enableColumnFreeze : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Flag whether to enable or disable the context menu on cells to trigger a filtering with the cell value.
			 * @since 1.21.0
			 */
			enableCellFilter : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Setting this property to true will show an overlay on top of the Table content and users cannot click anymore on the Table content.
			 * @since 1.21.2
			 */
			showOverlay : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Specifies if a select all button should be displayed in the top left corner. This button is only displayed
			 * if the row selector is visible and the selection mode is set to any kind of multi selection.
			 * @since 1.23.0
			 */
			enableSelectAll : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Set this parameter to true to implement your own filter behaviour. Instead of the filter input box a button
			 * will be rendered for which' press event (customFilter) you can register an event handler.
			 * @since 1.23.0
			 */
			enableCustomFilter : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If set to <code>true</code>, the table changes its busy state, resulting in showing or hiding the busy indicator.
			 * The table will switch to busy as soon as data is retrieved to be displayed in the currently visible rows. This happens,
			 * for example, during scrolling, filtering, or sorting. As soon as the data has been retrieved, the table switches back to not busy.
			 * The busy state of the table can still be set manually by calling {@link sap.ui.core.Control#setBusy}.
			 * @since 1.27.0
			 */
			enableBusyIndicator : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Number of row actions made visible which determines the width of the row action column.
			 * The values <code>0</code>, <code>1</code> and <code>2</code> are possible.
			 * @since 1.45.0
			 */
			rowActionCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Enables alternating table row colors.
			 * Alternate row coloring is not available for the tree mode.
			 * @since 1.52
			 */
			alternateRowColors : {type : "boolean", group : "Appearance", defaultValue : false}
		},
		defaultAggregation : "columns",
		aggregations : {

			/**
			 * Control or text of title section of the Table (if not set it will be hidden)
			 */
			title : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false},

			/**
			 * Control or text of footer section of the Table (if not set it will be hidden)
			 */
			footer : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false},

			/**
			 * Toolbar of the Table
			 * If not set, no toolbar area will be rendered.
			 * Note: The CSS class sapMTBHeader-CTX is applied on the given toolbar.
			 * @deprecated Since version 1.38. This aggregation is deprecated, use the <code>extension</code> aggregation instead.
			 */
			toolbar : {type : "sap.ui.core.Toolbar", multiple : false, deprecated: true},

			/**
			 * Extension section of the Table.
			 * If not set, no extension area will be rendered.
			 * Note: In case a <code>sap.m.Toolbar</code> is used as header the CSS class sapMTBHeader-CTX should be applied on this toolbar via <code>addStyleClass</code>.
			 */
			extension : {type : "sap.ui.core.Control", multiple : true, singularName : "extension"},

			/**
			 * Columns of the Table
			 */
			columns : {type : "sap.ui.table.Column", multiple : true, singularName : "column", bindable : "bindable"},

			/**
			 * Rows of the Table
			 */
			rows : {type : "sap.ui.table.Row", multiple : true, singularName : "row", bindable : "bindable"},

			/**
			 * The value for the noData aggregation can be either a string value or a control instance.
			 * The control is shown, in case there is no data for the Table available. In case of a string
			 * value this will simply replace the no data text.
			 */
			noData : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false},

			/**
			 * Template for row actions. A template is decoupled from the row or table. Each time
			 * the template's properties or aggregations are changed, the template has to be applied again via
			 * <code>setRowActionTemplate</code> for the changes to take effect.
			 */
			rowActionTemplate : {type : "sap.ui.table.RowAction", multiple : false},

			/**
			 * Template for row settings. A template is decoupled from the row or table. Each time
			 * the template's properties or aggregations are changed, the template has to be applied again via
			 * <code>setRowSettingsTemplate</code> for the changes to take effect.
			 */
			rowSettingsTemplate : {type : "sap.ui.table.RowSettings", multiple : false},

			/**
			 * Defines the drag-and-drop configuration via {@link sap.ui.core.dnd.DragDropInfo}
			 *
			 * The following restrictions apply:
			 * <ul>
			 *   <li>Drag and drop is not supported on mobile devices and there is no accessible alternative.</li>
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
			 *   <li>Texts in draggable rows cannot be selected.</li>
			 *   <li>The text of input fields in draggable rows can be selected, but not dragged.</li>
			 * </ul>
			 *
			 * @since 1.52
			 */
			dragDropConfig : {name : "dragDropConfig", type : "sap.ui.core.dnd.DragDropBase", multiple : true, singularName : "dragDropConfig"},

			/**
			 * Defines the context menu for the table.
			 *
			 * <b>Note:</b> The context menu will also be available for the row selectors as well as in the row actions cell of the table control.
			 *
			 * The custom context menu will not be shown in the group header rows and the sum row of the <code>AnalyticalTable</code> control.
			 *
			 * If this aggregation is set, then the <code>enableCellFilter</code> property will have no effect.
			 *
			 * @since 1.54
			 */
			contextMenu : {type : "sap.ui.core.IContextMenu", multiple : false}
		},
		associations : {

			/**
			 * The column by which the table is grouped. Grouping will only be performed if <code>enableGrouping</code> is set to <code>true</code>.
			 *
			 * @experimental Since 1.28. This feature has a limited functionality.
			 * @see sap.ui.table.Table#setEnableGrouping
			 */
			groupBy : {type : "sap.ui.table.Column", multiple : false},

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy : {type : "sap.ui.core.Control", multiple : true, singularName : "ariaLabelledBy"}
		},
		events : {

			/**
			 * fired when the row selection of the table has been changed (the event parameters can be used to determine
			 * selection changes - to find out the selected rows you should better use the table selection API)
			 */
			rowSelectionChange : {
				parameters : {

					/**
					 * row index which has been clicked so that the selection has been changed (either selected or deselected)
					 */
					rowIndex : {type : "int"},

					/**
					 * binding context of the row which has been clicked so that selection has been changed
					 */
					rowContext : {type : "object"},

					/**
					 * array of row indices which selection has been changed (either selected or deselected)
					 */
					rowIndices : {type : "int[]"},

					/**
					 * indicator if "select all" function is used to select rows
					 */
					selectAll : {type : "boolean"},

					/**
					 * indicates that the event was fired due to an explicit user interaction like clicking the row header
					 * or using the keyboard (SPACE or ENTER) to select a row or a range of rows.
					 */
					userInteraction: {type: "boolean"}
				}
			},

			/**
			 * fired when a column of the table has been selected
			 */
			columnSelect : {allowPreventDefault : true,
				parameters : {

					/**
					 * reference to the selected column
					 */
					column : {type : "sap.ui.table.Column"}
				}
			},

			/**
			 * fired when a table column is resized.
			 */
			columnResize : {allowPreventDefault : true,
				parameters : {

					/**
					 * resized column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * new width of the table column as CSS Size definition.
					 */
					width : {type : "sap.ui.core.CSSSize"}
				}
			},

			/**
			 * fired when a table column is moved.
			 */
			columnMove : {allowPreventDefault : true,
				parameters : {

					/**
					 * moved column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * new position of the column.
					 */
					newPos : {type : "int"}
				}
			},

			/**
			 * fired when the table is sorted.
			 */
			sort : {allowPreventDefault : true,
				parameters : {

					/**
					 * sorted column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * Sort Order
					 */
					sortOrder : {type : "sap.ui.table.SortOrder"},

					/**
					 * If column was added to sorter this is true. If new sort is started this is set to false
					 */
					columnAdded : {type : "boolean"}
				}
			},

			/**
			 * fired when the table is filtered.
			 */
			filter : {allowPreventDefault : true,
				parameters : {

					/**
					 * filtered column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * filter value.
					 */
					value : {type : "string"}
				}
			},

			/**
			 * fired when the table is grouped (experimental!).
			 */
			group : {allowPreventDefault : true,
				parameters : {
					/**
					 * grouped column.
					 */
					column : {type : "sap.ui.table.Column"}
				}
			},

			/**
			 * fired when the visibility of a table column is changed.
			 */
			columnVisibility : {allowPreventDefault : true,
				parameters : {

					/**
					 * affected column.
					 */
					column : {type : "sap.ui.table.Column"},

					/**
					 * new value of the visible property.
					 */
					visible : {type : "boolean"}
				}
			},

			/**
			 * fired when the user clicks a cell of the table (experimental!).
			 * @since 1.21.0
			 */
			cellClick : {allowPreventDefault : true,
				parameters : {
					/**
					 * The control of the cell.
					 */
					cellControl : {type : "sap.ui.core.Control"},

					/**
					 * DOM reference of the clicked cell. Can be used to position the context menu.
					 */
					cellDomRef : {type : "Object"},

					/**
					 * Row index of the selected cell.
					 */
					rowIndex : {type : "int"},

					/**
					 * Column index of the selected cell. This is the index of visible columns and might differ from
					 * the index maintained in the column aggregation.
					 */
					columnIndex : {type : "int"},

					/**
					 * Column ID of the selected cell.
					 */
					columnId : {type : "string"},

					/**
					 * Row binding context of the selected cell.
					 */
					rowBindingContext : {type : "sap.ui.model.Context"}
				}
			},

			/**
			 * fired when the user clicks a cell of the table.
			 * @since 1.21.0
			 * @deprecated As of 1.54, replaced by <code>beforeOpenContextMenu</code>.
			 */
			cellContextmenu : {allowPreventDefault : true,
				parameters : {
					/**
					 * The control of the cell.
					 */
					cellControl : {type : "sap.ui.core.Control"},

					/**
					 * DOM reference of the clicked cell. Can be used to position the context menu.
					 */
					cellDomRef : {type : "Object"},

					/**
					 * Row index of the selected cell.
					 */
					rowIndex : {type : "int"},

					/**
					 * Column index of the selected cell. This is the index of visible columns and might differ from
					 * the index maintained in the column aggregation.
					 */
					columnIndex : {type : "int"},

					/**
					 * Column ID of the selected cell.
					 */
					columnId : {type : "string"},

					/**
					 * Row binding context of the selected cell.
					 */
					rowBindingContext : {type : "sap.ui.model.Context"}
				}
			},

			/**
			 * Fired when the user requests the context menu for a table cell.
			 * @since 1.54
			 */
			beforeOpenContextMenu : {
				allowPreventDefault : true,
				parameters: {
					/**
					 * Row index where the context menu opens.
					 */
					rowIndex : {type : "int"},

					/**
					 * Column index where the context menu opens.
					 * This is the index of the column in the <code>columns</code> aggregation.
					 */
					columnIndex : {type : "int"},

					/**
					 * Context menu
					 */
					contextMenu : {type : "sap.ui.core.IContextMenu"}
				}
			},

			/**
			 * fired when a column of the table should be freezed
			 * @since 1.21.0
			 */
			columnFreeze : {allowPreventDefault : true,
				parameters : {

					/**
					 * reference to the column to freeze
					 */
					column : {type : "sap.ui.table.Column"}
				}
			},

			/**
			 * This event is triggered when the custom filter item of the column menu is pressed. The column on which the event was triggered is
			 * passed as parameter.
			 * @since 1.23.0
			 */
			customFilter : {
				/**
				 * The column instance on which the custom filter button was pressed.
				 */
				column : {type : "sap.ui.table.Column"},

				/**
				 * Filter value.
				 */
				value : {type : "string"}
			},

			/**
			 * This event gets fired when the first visible row is changed. It should only be used by composite controls.
			 * The event even is fired when setFirstVisibleRow is called programmatically.
			 * @since 1.37.0
			 * @protected
			 */
			firstVisibleRowChanged : {
				/**
				 * First visible row
				 */
				firstVisibleRow : {type : "int"}
			},

			/**
			 * This event gets fired when the busy state of the table changes. It should only be used by composite controls.
			 * @since 1.37.0
			 * @protected
			 */
			busyStateChanged : {
				/**
				 * busy state
				 */
				busy : {type : "boolean"}
			}
		},
		designtime:  "sap/ui/table/designtime/Table.designtime"
	}});


	// =============================================================================
	// BASIC CONTROL API
	// =============================================================================

	IconPool.insertFontFaceStyle();

	/**
	 * Initialization of the Table control
	 * @private
	 */
	Table.prototype.init = function() {
		this._iBaseFontSize = parseFloat(jQuery("body").css("font-size")) || 16;
		// create an information object which contains always required infos
		this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");
		this._bRtlMode = sap.ui.getCore().getConfiguration().getRTL();

		this._attachExtensions();

		this._bRowAggregationInvalid = true;
		this._mTimeouts = {};
		this._mAnimationFrames = {};

		// TBD: Tooltips are not desired by Visual Design, discuss whether to switch it off by default
		this._bHideStandardTooltips = false;

		/**
		 * Updates the row binding contexts and synchronizes the row heights. This function will be called by updateRows
		 */
		this._lastCalledUpdateRows = 0;
		this._iBindingTimerDelay = 50;
		this._aRowHeights = [];
		this._iRenderedFirstVisibleRow = 0;

		this._aSortedColumns = [];

		var that = this;

		this._performUpdateRows = function(sReason) {
			// update only if control not marked as destroyed (could happen because updateRows is called during destroying the table)
			if (!that.bIsDestroyed) {
				that._lastCalledUpdateRows = Date.now();
				that._updateBindingContexts();

				if (!that._bInvalid) {
					// subsequent DOM updates are only required if there is no rendering to be expected
					that._updateTableContent();

					that._getAccExtension().updateAccForCurrentCell(false);
					that._updateSelection();

					// TODO: check if this can be removed:
					that._collectTableSizes();

					// row heights
					that._aRowHeights = that._collectRowHeights(false);
					that._updateRowHeights(that._collectRowHeights(true), true); // column header rows
					that._updateRowHeights(that._aRowHeights, false); // table body rows

					if (TableUtils.isVariableRowHeightEnabled(that)) {
						that._iRenderedFirstVisibleRow = this._getFirstRenderedRowIndex();
					}
					that._getScrollExtension().updateVerticalScrollbarVisibility();
				}

				that._mTimeouts.bindingTimer = undefined;
				// Helper event for testing
				that._fireRowsUpdated(sReason);
			}
		};

		// basic selection model (by default the table uses multi selection)
		this._initSelectionModel(SelectionModel.MULTI_SELECTION);

		this._aTableHeaders = [];

		// columns to cells map
		this._aIdxCols2Cells = [];

		// flag whether the editable property should be inherited or not
		this._bInheritEditableToControls = false;

		// text selection for column headers?
		this._bAllowColumnHeaderTextSelection = false;

		this._iPendingRequests = 0;
		this._bPendingRequest = false; // Fallback in case a counter is not applicable.
		this._iBindingLength = null;

		this._iTableRowContentHeight = 0;
		this._bFirstRendering = true;

		// F6 Handling is done in TableRenderer to make sure the table content gets the focus. The
		// Toolbar has its own F6 stop.
		// this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		this._nDevicePixelRatio = window.devicePixelRatio;

		this._bInvalid = true;
	};


	/**
	 * Attach table extensions
	 * @private
	 */
	Table.prototype._attachExtensions = function() {
		if (this._bExtensionsInitialized) {
			return;
		}
		TableExtension.enrich(this, TablePointerExtension);
		TableExtension.enrich(this, TableScrollExtension);
		TableExtension.enrich(this, TableKeyboardExtension);
		TableExtension.enrich(this, TableAccExtension); // Must be registered after keyboard to reach correct delegate order
		TableExtension.enrich(this, TableDragAndDropExtension);
		this._bExtensionsInitialized = true;
	};


	/**
	 * Termination of the Table control
	 * @private
	 */
	Table.prototype.exit = function() {
		// destroy the child controls
		this._bExitCalled = true;

		this.invalidateRowsAggregation();

		// destroy helpers
		this._detachExtensions();

		// cleanup
		if (this._dataReceivedHandlerId != null) {
			jQuery.sap.clearDelayedCall(this._dataReceivedHandlerId);
			delete this._dataReceivedHandlerId;
		}
		this._cleanUpTimers();
		this._detachEvents();

		// selection model
		if (this._oSelection) {
			this._oSelection.destroy(); // deregisters all the handler(s)
			//Note: _oSelection is not nulled to avoid checks everywhere (in case table functions are called after the table destroy, see 1670448195)
		}
		delete this._aTableHeaders;
	};


	/**
	 * Detach table extensions
	 * @private
	 */
	Table.prototype._detachExtensions = function(){
		TableExtension.cleanup(this);
	};


	/**
	 * Theme changed
	 * @private
	 */
	Table.prototype.onThemeChanged = function() {
		if (this.getDomRef()) {
			this.invalidate();
		}
	};


	/**
	 * Localization changed
	 * @private
	 */
	Table.prototype.onlocalizationChanged = function(oEvent) {
		var oChanges = oEvent.changes || {};
		var bRtlChanged = oChanges.hasOwnProperty("rtl");
		var bLangChanged = oChanges.hasOwnProperty("language");
		if (bRtlChanged || bLangChanged) {
			this._adaptLocalization(bRtlChanged, bLangChanged);
			// Trigger rerendering of whole table
			this.invalidate();
		}
	};

	/**
	 * Localization changed
	 * @private
	 */
	Table.prototype._adaptLocalization = function(bRtlChanged, bLangChanged) {
		if (bRtlChanged) {
			this._bRtlMode = sap.ui.getCore().getConfiguration().getRTL();
		}

		if (bLangChanged) {
			var aRows = this.getRows();
			var i;

			// Update the resource bundle.
			this._oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");

			// Update the resource bundle of row actions.
			var oRowAction;
			for (i = 0; i < aRows.length; i++) {
				oRowAction = aRows[i].getAggregation("_rowAction");
				if (oRowAction) {
					oRowAction._oResBundle = this._oResBundle;
				}
			}

			// Update the resource bundle of row settings.
			var oRowSettings;
			for (i = 0; i < aRows.length; i++) {
				oRowSettings = aRows[i].getAggregation("_settings");
				if (oRowSettings) {
					oRowSettings._oResBundle = this._oResBundle;
				}
			}

			// Clear the cell context menu.
			TableUtils.Menu.cleanupDataCellContextMenu(this);

			// Update the column menus.
			this._invalidateColumnMenus(true);
		}
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
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return [];
		}

		if (bHeader && this.getColumnHeaderHeight()) {
			return []; // column headers are set fix in the renderer
		}

		var iDefaultRowHeight = this._getDefaultRowHeight();
		var sRowCSSClass = bHeader ? ".sapUiTableColHdrTr" : ".sapUiTableTr";
		var aRowsInFixedColumnsArea = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr" + sRowCSSClass);
		var aRowsInScrollableColumnsArea = oDomRef.querySelectorAll(".sapUiTableCtrlScroll > tbody > tr" + sRowCSSClass);
		var iRowCount = this.getRows().length;
		var aRowHeights = [];
		var bIsZoomedInChrome = Device.browser.chrome && window.devicePixelRatio != 1;

		for (var i = 0; i < iRowCount; i++) {
			var nFixedColumnsAreaRowHeight = aRowsInFixedColumnsArea[i] == null ? 0 : aRowsInFixedColumnsArea[i].getBoundingClientRect().height;
			var nScrollableColumnsAreaRowHeight = aRowsInScrollableColumnsArea[i] == null ? 0 : aRowsInScrollableColumnsArea[i].getBoundingClientRect().height;
			var nRowHeight = Math.max(nFixedColumnsAreaRowHeight, nScrollableColumnsAreaRowHeight);

			if (bIsZoomedInChrome) {
				var nHeightDeviation = iDefaultRowHeight - nRowHeight;

				// In Chrome with zoom != 100% the height of table rows can slightly differ from the height of divs (row selectors).
				// See https://bugs.chromium.org/p/chromium/issues/detail?id=661991

				// Allow the row height to be slightly smaller than the default row height.
				if (nHeightDeviation > 0 && nHeightDeviation < 1) {
					aRowHeights.push(Math.max(nRowHeight, iDefaultRowHeight - 1));
					continue;
				}
			}

			aRowHeights.push(Math.max(nRowHeight, iDefaultRowHeight));
		}

		return aRowHeights;
	};

	/**
	 * Resets the height style property of all TR elements of the table body
	 * @private
	 */
	Table.prototype._resetRowHeights = function() {
		var iRowHeight = this._getDefaultRowHeight();

		var sRowHeight = "";
		if (iRowHeight) {
			sRowHeight = iRowHeight + "px";
		}

		var oDomRef = this.getDomRef();
		if (oDomRef) {
			var aRowItems = oDomRef.querySelectorAll(".sapUiTableTr");
			for (var i = 0; i < aRowItems.length; i++) {
				aRowItems[i].style.height = sRowHeight;
			}
		}
	};

	/**
	 * Resets the height style property of all TR elements of the table header
	 * @private
	 */
	Table.prototype._resetColumnHeaderHeights = function() {
		if (this.getColumnHeaderHeight()) {
			return; // height is set fixed in renderer
		}

		var oDomRef = this.getDomRef();
		if (oDomRef) {
			var aRowItems = oDomRef.querySelectorAll(".sapUiTableColHdrTr");
			for (var i = 0; i < aRowItems.length; i++) {
				aRowItems[i].style.height = null;
			}
		}
	};

	/**
	 * Determines the space available for the rows.
	 *
	 * @returns {int} The available space in pixels.
	 * @private
	 */
	Table.prototype._determineAvailableSpace = function() {
		var oDomRef = this.getDomRef();

		if (oDomRef && oDomRef.parentNode) {
			var oCCnt = oDomRef.querySelector(".sapUiTableCCnt");

			if (oCCnt) {
				var iUsedHeight = oDomRef.scrollHeight - oCCnt.clientHeight;

				// take into account controls above the table in the container
				var iTableTop = 0;
				if (oDomRef.parentNode.firstChild !== oDomRef) {
					var iParentPadding = parseFloat(window.getComputedStyle(oDomRef.parentNode).paddingTop);
					if (isNaN(iParentPadding)) {
						iParentPadding = 0;
					}
					iTableTop = oDomRef.offsetTop - iParentPadding;
				}

				// For simplicity always add the default height of the horizontal scrollbar to the used height, even if it will not be visible.
				var oScrollExtension = this._getScrollExtension();
				var oHSb = oScrollExtension.getHorizontalScrollbar();

				if (oHSb == null || !oScrollExtension.isHorizontalScrollbarVisible()) {
					var mDefaultScrollbarHeight = {};
					mDefaultScrollbarHeight[Device.browser.BROWSER.CHROME] = 16;
					mDefaultScrollbarHeight[Device.browser.BROWSER.FIREFOX] = 16;
					mDefaultScrollbarHeight[Device.browser.BROWSER.INTERNET_EXPLORER] = 18;
					mDefaultScrollbarHeight[Device.browser.BROWSER.EDGE] = 12;
					mDefaultScrollbarHeight[Device.browser.BROWSER.SAFARI] = 16;
					mDefaultScrollbarHeight[Device.browser.BROWSER.ANDROID] = 8;
					iUsedHeight += mDefaultScrollbarHeight[Device.browser.name];
				}

				if (this._iLastAvailableSpace == null) {
					this._iLastAvailableSpace = 0;
				}

				var iNewAvailableSpace = Math.floor(jQuery(oDomRef.parentNode).height() - iUsedHeight - iTableTop);
				var iAvailableSpaceDifference = Math.abs(iNewAvailableSpace - this._iLastAvailableSpace);

				if (iAvailableSpaceDifference >= 5) {
					this._iLastAvailableSpace = Math.floor(iNewAvailableSpace);
				}

				return this._iLastAvailableSpace;
			}
		}

		return 0;
	};

	/**
	 * Determines all needed table size at one dedicated point,
	 * for avoiding layout thrashing through read/write UI operations.
	 * @private
	 */
	Table.prototype._collectTableSizes = function() {
		var oSizes = {
			tableCtrlScrollWidth: 0,
			tableRowHdrScrWidth: 0,
			tableCtrlScrWidth: 0,
			tableHSbScrollLeft: 0,
			tableCtrlFixedWidth: 0,
			tableCntHeight: 0,
			tableCntWidth: 0
		};

		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return oSizes;
		}

		var oSapUiTableCnt = oDomRef.querySelector(".sapUiTableCnt");
		if (oSapUiTableCnt) {
			oSizes.tableCntHeight = oSapUiTableCnt.clientHeight;
			oSizes.tableCntWidth = oSapUiTableCnt.clientWidth;
		}

		var oSapUiTableCtrlScroll = oDomRef.querySelector(".sapUiTableCtrlScroll:not(.sapUiTableCHT)");
		if (oSapUiTableCtrlScroll) {
			oSizes.tableCtrlScrollWidth = oSapUiTableCtrlScroll.clientWidth;
		}

		var oSapUiTableRowHdrScr = oDomRef.querySelector(".sapUiTableRowHdrScr");
		if (oSapUiTableRowHdrScr) {
			oSizes.tableRowHdrScrWidth = oSapUiTableRowHdrScr.clientWidth;
		}

		var oCtrlScrDomRef = oDomRef.querySelector(".sapUiTableCtrlScr:not(.sapUiTableCHA)");
		if (oCtrlScrDomRef) {
			oSizes.tableCtrlScrWidth = oCtrlScrDomRef.clientWidth;
		}

		var oHsb = this._getScrollExtension().getHorizontalScrollbar();
		if (oHsb) {
			oSizes.tableHSbScrollLeft = oHsb.scrollLeft;
		}

		var oCtrlFixed = oDomRef.querySelector(".sapUiTableCtrlScrFixed:not(.sapUiTableCHA) > .sapUiTableCtrlFixed");
		if (oCtrlFixed) {
			oSizes.tableCtrlFixedWidth = oCtrlFixed.clientWidth;
		}

		var iFixedColumnCount = this.getProperty("fixedColumnCount");
		var iFixedHeaderWidthSum = 0;
		if (iFixedColumnCount) {
			var aHeaderElements = oDomRef.querySelectorAll(".sapUiTableCtrlFirstCol:not(.sapUiTableCHTHR) > th");
			for (var i = 0; i < aHeaderElements.length; i++) {
				var iColIndex = parseInt(aHeaderElements[i].getAttribute("data-sap-ui-headcolindex"), 10);
				if (!isNaN(iColIndex) && (iColIndex < iFixedColumnCount)) {
					iFixedHeaderWidthSum += aHeaderElements[i].getBoundingClientRect().width;
				}
			}
		}

		if (iFixedHeaderWidthSum > 0) {
			var iUsedHorizontalTableSpace = oSizes.tableRowHdrScrWidth;

			var oVsb = this.getDomRef("vsb");
			if (oVsb) {
				iUsedHorizontalTableSpace += oVsb.offsetWidth;
			}

			if (TableUtils.hasRowActions(this)) {
				var oRowActions = this.getDomRef("sapUiTableRowActionScr");
				if (oRowActions) {
					iUsedHorizontalTableSpace += oRowActions.offsetWidth;
				}
			}

			// If the columns fit into the table, we do not need to ignore the fixed column count.
			// Otherwise, check if the new fixed columns fit into the table. If they don't, the fixed column count setting will be ignored.
			var bNonFixedColumnsFitIntoTable = oSizes.tableCtrlScrollWidth === oSizes.tableCtrlScrWidth; // Also true if no non-fixed columns exist.

			if (!bNonFixedColumnsFitIntoTable) { // horizontal scrollbar should be at least 48px wide
				iUsedHorizontalTableSpace += TableUtils.Column.getMinColumnWidth();
			}

			var bFixedColumnsFitIntoTable = oSizes.tableCtrlFixedWidth + iUsedHorizontalTableSpace <= oSizes.tableCntWidth; // Also true if no fixed columns exist.
			var bIgnoreFixedColumnCountCandidate = false;

			if (!bNonFixedColumnsFitIntoTable || !bFixedColumnsFitIntoTable) {
				bIgnoreFixedColumnCountCandidate = (oSizes.tableCntWidth - iUsedHorizontalTableSpace < iFixedHeaderWidthSum);
			}

			if (this._bIgnoreFixedColumnCount !== bIgnoreFixedColumnCountCandidate) {
				this._bIgnoreFixedColumnCount = bIgnoreFixedColumnCountCandidate;
				if (this.getEnableColumnFreeze()) {
					this._invalidateColumnMenus();
				}
				this.invalidate();
			}
		}

		return oSizes;
	};

	/**
	 * Returns the aggregation containers DOM reference.
	 * @private
	 */
	Table.prototype.getAggregationDomRef = function(sAggregationName) {
		if (sAggregationName == "rows") {
			return this.getDomRef("tableCCnt");
		}
	};

	/**
	 * Synchronizes the row heights.
	 * @param {boolean} bHeader update of column headers if true, otherwise update data rows.
	 * @private
	 */
	Table.prototype._updateRowHeights = function(aRowItemHeights, bHeader) {
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return;
		}

		if (bHeader && this.getColumnHeaderHeight()) {
			return; // column headers are set fix in the renderer
		}

		function updateRow (row, index) {
			var rowHeight = aRowItemHeights[index];
			if (rowHeight) {
				row.style.height = rowHeight + "px";
			}
		}

		// select rows
		var cssClass = bHeader ? ".sapUiTableColHdrTr" : ".sapUiTableTr";
		var aRowHeaderItems = bHeader ? [] : oDomRef.querySelectorAll(".sapUiTableRowHdr");
		var aRowActionItems = bHeader ? [] : oDomRef.querySelectorAll(".sapUiTableRowAction");
		var aFixedRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr" + cssClass);
		var aScrollRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlScroll > tbody > tr" + cssClass);

		var a = [];

		a.forEach.call(aRowHeaderItems, updateRow);
		a.forEach.call(aRowActionItems, updateRow);
		a.forEach.call(aFixedRowItems, updateRow);
		a.forEach.call(aScrollRowItems, updateRow);

	};

	/**
	 * Rerendering handling
	 * @private
	 */
	Table.prototype.onBeforeRendering = function(oEvent) {
		if (oEvent && oEvent.isMarked("renderRows")) {
			return;
		}

		if (this._mTimeouts.bindingTimer) {
			this._updateBindingContexts();
		}

		this._cleanUpTimers();
		this._detachEvents();

		var sVisibleRowCountMode = this.getVisibleRowCountMode();

		var aRows = this.getRows();
		if (sVisibleRowCountMode == VisibleRowCountMode.Interactive ||
			sVisibleRowCountMode == VisibleRowCountMode.Fixed ||
			(sVisibleRowCountMode == VisibleRowCountMode.Auto && this._iTableRowContentHeight && aRows.length == 0)) {

			// Necessary due to the fact that getBinding initializes the grouping functionality
			this.getBinding("rows");

			this._updateRows(this._calculateRowsToDisplay(), TableUtils.RowsUpdateReason.Render);
		} else if (this._bRowAggregationInvalid && aRows.length > 0) {
			// Rows got invalidated, recreate rows with new template
			this._updateRows(aRows.length, TableUtils.RowsUpdateReason.Render);
		}
		this._aTableHeaders = []; // free references to DOM elements
	};

	/**
	 * Rerendering handling
	 * @private
	 */
	Table.prototype.onAfterRendering = function(oEvent) {
		var bRenderedRows = oEvent && oEvent.isMarked("renderRows");

		this._bInvalid = false;
		this._bOnAfterRendering = true;
		var $this = this.$();

		this._attachEvents();

		// since the row is an element it has no own renderer. Anyway, logically it has a domref. Let the rows
		// update their domrefs after the rendering is done. This is required to allow performant access to row domrefs
		this._initRowDomRefs();

		// restore the column icons
		var aCols = this.getColumns();
		for (var i = 0, l = aCols.length; i < l; i++) {
			if (aCols[i].getVisible()) {
				aCols[i]._restoreIcons();
			}
		}

		// enable/disable text selection for column headers
		if (!this._bAllowColumnHeaderTextSelection && !bRenderedRows) {
			this._disableTextSelection($this.find(".sapUiTableColHdrCnt"));
		}

		this._bOnAfterRendering = false;

		// invalidate item navigation
		this._getKeyboardExtension().invalidateItemNavigation();

		this._updateTableContent();

		if (this._bFirstRendering && this.getVisibleRowCountMode() == VisibleRowCountMode.Auto) {
			this._bFirstRendering = false;
			// Wait until everything is rendered (parent height!) before reading/updating sizes. Use a promise to make sure
			// to be executed before timeouts may be executed.
			Promise.resolve().then(this._updateTableSizes.bind(this, TableUtils.RowsUpdateReason.Render, true));
		} else {
			this._updateTableSizes(TableUtils.RowsUpdateReason.Render, null, bRenderedRows,
				bRenderedRows && TableUtils.isVariableRowHeightEnabled(this));
		}

		if (!bRenderedRows) {
			// needed for the column resize ruler
			this._aTableHeaders = this.$().find(".sapUiTableColHdrCnt th");

			if (this.getBinding("rows")) {
				this._fireRowsUpdated(TableUtils.RowsUpdateReason.Render);
			}
		}
	};

	Table.prototype.invalidate = function() {
		if (!this._ignoreInvalidateOfChildControls) {
			this._bInvalid = true;
			var vReturn = Control.prototype.invalidate.call(this);
			TableUtils.Column.invalidateColumnUtils(this);
		}

		return vReturn;
	};

	Table.prototype._initRowDomRefs = function() {
		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			aRows[i].initDomRefs();
		}
	};

	/**
	 * First collects all table sizes, then synchronizes row/column heights, updates scrollbars and selection.
	 * @private
	 */
	Table.prototype._updateTableSizes = function(sReason, bForceUpdateTableSizes, bSkipHandleRowCountMode, bForceSetRowContentHeight) {
		var oDomRef = this.getDomRef();
		var that = this;

		if (this._bInvalid || !oDomRef) {
			return;
		}

		if (!oDomRef.offsetWidth) { // do not update sizes of an invisible table
			TableUtils.deregisterResizeHandler(this, "");
			registerResizeHandler();
			return;
		}

		this._resetRowHeights();
		this._resetColumnHeaderHeights();
		this._aRowHeights = this._collectRowHeights(false);
		var aColumnHeaderRowHeights = this._collectRowHeights(true);

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			// Necessary in case the visible row count does not change after a resize (for example, this is always the case
			// if visibleRowCountMode is set to "Fixed"). The row heights might change due to decreased column widths, so the inner scroll position
			// must be adjusted.
			this._getScrollExtension().updateInnerVerticalScrollPosition();
		}

		var iRowContentSpace = null;
		if (!bSkipHandleRowCountMode && this.getVisibleRowCountMode() == VisibleRowCountMode.Auto) {
			iRowContentSpace = this._determineAvailableSpace();
			// if no height is granted we do not need to do any further row adjustment or layout sync.
			// Saves time on initial start up and reduces flickering on rendering.
			if (this._handleRowCountModeAuto(iRowContentSpace, sReason) && !bForceUpdateTableSizes) {
				// updateTableSizes was already called by _renderRows, therefore skip the rest of this function execution
				return;
			}
		}

		TableUtils.deregisterResizeHandler(this, "");

		// the only place to fix the minimum column width
		function setMinColWidths(oTable) {
			var oTableRef = oTable.getDomRef();
			var iAbsoluteMinWidth = TableUtils.Column.getMinColumnWidth();
			var aNotFixedVariableColumns = [];
			var bColumnHeaderVisible = oTable.getColumnHeaderVisible();

			function calcNewWidth(iDomWidth, iMinWidth) {
				if (iDomWidth <= iMinWidth) {
					// tolerance of -5px to make the resizing smooother
					return Math.max(iDomWidth, iMinWidth - 5, iAbsoluteMinWidth) + "px";
				}
				return -1;
			}

			function isFixNeeded(col) {
				var minWidth = Math.max(col._minWidth || 0, iAbsoluteMinWidth, col.getMinWidth());
				var colWidth = col.getWidth();
				var aColHeaders;
				var colHeader;
				var domWidth;
				// if a column has variable width, check if its current width of the
				// first corresponding <th> element in less than minimum and store it;
				// do not change freezed columns
				if (TableUtils.isVariableWidth(colWidth) && !TableUtils.isFixedColumn(oTable, col.getIndex())) {
					aColHeaders = oTableRef.querySelectorAll('th[data-sap-ui-colid="' + col.getId() + '"]');
					colHeader = aColHeaders[bColumnHeaderVisible ? 0 : 1]; // if column headers have display:none, use data table
					domWidth = colHeader ? colHeader.offsetWidth : null;
					if (domWidth !== null) {
						if (domWidth <= minWidth) {
							return {headers : aColHeaders, newWidth: calcNewWidth(domWidth, minWidth)};
						} else if (colHeader && colHeader.style.width != colWidth) {
							aNotFixedVariableColumns.push({col: col, header: colHeader, minWidth: minWidth, headers: aColHeaders});
							// reset the minimum style width that was set previously
							return {headers : aColHeaders, newWidth: colWidth};
						}
						aNotFixedVariableColumns.push({col: col, header: colHeader, minWidth: minWidth, headers: aColHeaders});
					}
				}
				return null;
			}

			function adaptColWidth(oColInfo) {
				if (oColInfo) {
					Array.prototype.forEach.call(oColInfo.headers, function (header) {
							header.style.width = oColInfo.newWidth;
					});
				}
			}

			// adjust widths of all found column headers
			oTable._getVisibleColumns().map(isFixNeeded).forEach(adaptColWidth);

			//Check the rest of the flexible non-adapted columns
			//Due to adaptations they could be smaller now.
			if (aNotFixedVariableColumns.length) {
				var iDomWidth;
				for (var i = 0; i < aNotFixedVariableColumns.length; i++) {
					iDomWidth = aNotFixedVariableColumns[i].header && aNotFixedVariableColumns[i].header.offsetWidth;
					aNotFixedVariableColumns[i].newWidth = calcNewWidth(iDomWidth, aNotFixedVariableColumns[i].minWidth);
					if (parseInt(aNotFixedVariableColumns[i].newWidth, 10) >= 0) {
						adaptColWidth(aNotFixedVariableColumns[i]);
					}
				}
			}
		}
		setMinColWidths(this);

		var oTableSizes = this._collectTableSizes();

		if (oTableSizes.tableCntHeight == 0 && oTableSizes.tableCntWidth == 0) {
			// the table has no size at all. This may be due to one of the parents has display:none. In order to
			// recognize when the parent size changes, the resize handler must be registered synchronously, otherwise
			// the browser may finish painting before the resize handler is registered
			TableUtils.registerResizeHandler(this, "", this._onTableResize.bind(this), true);

			return;
		}

		// Manipulation of UI Sizes
		this._updateRowHeights(this._aRowHeights, false);
		this._updateRowHeights(aColumnHeaderRowHeights, true);

		this._determineVisibleCols(oTableSizes);
		if (!bSkipHandleRowCountMode || bForceSetRowContentHeight) {
			this._setRowContentHeight(iRowContentSpace);
		}

		if (this.getVisibleRowCountMode() == VisibleRowCountMode.Auto) {
			//if visibleRowCountMode is auto change the visibleRowCount according to the parents container height
			var iRows = this._calculateRowsToDisplay(iRowContentSpace != null ? iRowContentSpace : this._determineAvailableSpace());
			// if minAutoRowCount has reached, table should use block this height.
			// In case row > minAutoRowCount, the table height is 0, because ResizeTrigger must detect any changes of the table parent.
			if (iRows == this._determineMinAutoRowCount()) {
				this.$().height("auto");
			} else {
				this.$().height("0px");
			}
		}

		var oScrollExtension = this._getScrollExtension();
		oScrollExtension.updateHorizontalScrollbar(oTableSizes);
		oScrollExtension.updateVerticalScrollbarPosition();
		oScrollExtension.updateVerticalScrollbarVisibility();

		var $this = this.$();

		if (TableUtils.hasRowActions(this)) {
			var bHasFlexibleRowActions = $this.hasClass("sapUiTableRActFlexible");
			var oDummyCol = this.getDomRef("dummycolhdr");
			var iDummyColWidth = oDummyCol ? oDummyCol.clientWidth : 0;
			if (!bHasFlexibleRowActions && iDummyColWidth > 0) {
				var iRowActionPos = oTableSizes.tableCtrlScrWidth + oTableSizes.tableRowHdrScrWidth + oTableSizes.tableCtrlFixedWidth - iDummyColWidth;
				var oRowActionStyles = {width: "auto"};
				oRowActionStyles[this._bRtlMode ? "right" : "left"] = iRowActionPos;
				this.$("sapUiTableRowActionScr").css(oRowActionStyles);
				this.$("rowacthdr").css(oRowActionStyles);
				$this.toggleClass("sapUiTableRActFlexible", true);
			} else if (bHasFlexibleRowActions && iDummyColWidth <= 0) {
				this.$("sapUiTableRowActionScr").removeAttr("style");
				this.$("rowacthdr").removeAttr("style");
				$this.toggleClass("sapUiTableRActFlexible", false);
			}
		}

		$this.find(".sapUiTableNoOpacity").addBack().removeClass("sapUiTableNoOpacity");

		function registerResizeHandler() {
			TableUtils.registerResizeHandler(that, "", that._onTableResize.bind(that), true);
		}

		if ($this.closest(".sapUiLoSplitter").length) {
			// a special workaround for the splitter control due to concurrence issues
			registerResizeHandler();
		} else {
			// Size changes of the parent happen due to adaptations of the table sizes. In order to first let the
			// browser finish painting, the resize handler is registered in a promise. If this would be done synchronously,
			// updateTableSizes would always run twice.
			Promise.resolve().then(registerResizeHandler);
		}
	};

	Table.prototype.setShowOverlay = function(bShow) {
		bShow = !!bShow;
		this.setProperty("showOverlay", bShow, true);

		if (this.getDomRef()) {
			var oFocusRef = document.activeElement;
			this.$().toggleClass("sapUiTableOverlay", bShow);
			this._getAccExtension().updateAriaStateForOverlayAndNoData();
			this._getKeyboardExtension().updateNoDataAndOverlayFocus(oFocusRef);
		}

		return this;
	};

	Table.prototype._updateFixedBottomRows = function() {
		var iFixedBottomRows = this.getFixedBottomRowCount();

		var oDomRef = this.getDomRef();
		if (oDomRef && iFixedBottomRows > 0) {
			var $sapUiTableFixedPreBottomRow = jQuery(oDomRef).find(".sapUiTableFixedPreBottomRow");
			$sapUiTableFixedPreBottomRow.removeClass("sapUiTableFixedPreBottomRow");
			var $sapUiTableFixedFirstBottomRow = jQuery(oDomRef).find(".sapUiTableFixedFirstBottomRow");
			$sapUiTableFixedFirstBottomRow.removeClass("sapUiTableFixedFirstBottomRow");

			var iFirstFixedButtomRowIndex = TableUtils.getFirstFixedButtomRowIndex(this);
			var aRows = this.getRows();
			var $rowDomRefs;

			if (iFirstFixedButtomRowIndex >= 0 && iFirstFixedButtomRowIndex < aRows.length) {
				$rowDomRefs = aRows[iFirstFixedButtomRowIndex].getDomRefs(true);
				$rowDomRefs.row.addClass("sapUiTableFixedFirstBottomRow", true);
			}
			if (iFirstFixedButtomRowIndex >= 1 && iFirstFixedButtomRowIndex < aRows.length) {
				$rowDomRefs = aRows[iFirstFixedButtomRowIndex - 1].getDomRefs(true);
				$rowDomRefs.row.addClass("sapUiTableFixedPreBottomRow", true);
			}
		}
	};


	// =============================================================================
	// FOCUS
	// =============================================================================

	/*
	 * @see JSDoc generated by SAPUI5 control
	 */
	Table.prototype.getFocusInfo = function() {
		var sId = this.$().find(":focus").attr("id");
		if (sId) {
			return {customId: sId};
		} else {
			return Element.prototype.getFocusInfo.apply(this, arguments);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control
	 */
	Table.prototype.applyFocusInfo = function(mFocusInfo) {
		if (mFocusInfo && mFocusInfo.customId) {
			this.$().find("#" + mFocusInfo.customId).focus();
		} else {
			//TBD: should be applyFocusInfo but changing it breaks the unit tests
			Element.prototype.getFocusInfo.apply(this, arguments);
		}
		return this;
	};


	// =============================================================================
	// PUBLIC TABLE API
	// =============================================================================


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setTitle = function(vTitle) {
		var oTitle = vTitle;
		if (typeof (vTitle) === "string" || vTitle instanceof String) {
			oTitle = library.TableHelper.createTextView({
				text: vTitle,
				width: "100%"
			});
			oTitle.addStyleClass("sapUiTableHdrTitle");
		}
		this.setAggregation("title", oTitle);
		return this;
	};


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFooter = function(vFooter) {
		var oFooter = vFooter;
		if (typeof (vFooter) === "string" || vFooter instanceof String) {
			oFooter = library.TableHelper.createTextView({
				text: vFooter,
				width: "100%"
			});
		}
		this.setAggregation("footer", oFooter);
		return this;
	};


	/**
	 * Sets the selection mode. The current selection is lost.
	 * @param {string} sSelectionMode the selection mode, see sap.ui.table.SelectionMode
	 * @public
	 * @returns a reference on the table for chaining
	 */
	Table.prototype.setSelectionMode = function(sSelectionMode) {
		this.clearSelection();
		if (sSelectionMode === SelectionMode.Single) {
			this._oSelection.setSelectionMode(SelectionModel.SINGLE_SELECTION);
		} else {
			this._oSelection.setSelectionMode(SelectionModel.MULTI_SELECTION);
		}

		// Check for valid selection modes (e.g. change deprecated mode "Multi" to "MultiToggle")
		sSelectionMode = TableUtils.sanitizeSelectionMode(this, sSelectionMode);

		this.setProperty("selectionMode", sSelectionMode);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFirstVisibleRow = function(iRowIndex, bOnScroll, bSuppressEvent) {
		if (parseInt(iRowIndex, 10) < 0) {
			jQuery.sap.log.error("The index of the first visible row must be greater than or equal to 0." +
								 " The value has been set to 0.", this);
			iRowIndex = 0;
		}
		if (this._getTotalRowCount() > 0) {
			var iMaxRowIndex = this._getMaxFirstVisibleRowIndex();

			if (iMaxRowIndex < iRowIndex) {
				jQuery.sap.log.warning("The index of the first visible row must be lesser or equal than the scrollable row count minus the visible row count." +
									   " The value has been set to " + iMaxRowIndex + ".", this);
				iRowIndex = iMaxRowIndex;
			}
		}

		var bFirstVisibleRowChanged = this.getFirstVisibleRow() != iRowIndex;
		var oScrollExtension = this._getScrollExtension();

		if (bFirstVisibleRowChanged) {
			var iOldFirstRenderedRowIndex = this._getFirstRenderedRowIndex();
			// Prevent re-rendering of the table, just update the rows.
			this.setProperty("firstVisibleRow", iRowIndex, true);
			var bFirstRenderedRowChanged = this._getFirstRenderedRowIndex() !== iOldFirstRenderedRowIndex;

			if (this.getBinding("rows")) {
				if (bFirstRenderedRowChanged) {
					var sReason = bOnScroll === true ? TableUtils.RowsUpdateReason.VerticalScroll : TableUtils.RowsUpdateReason.FirstVisibleRowChange;
					this.updateRows(sReason);
				}

				// If changing the first visible row was initiated by a scroll action, the scroll position is already accurate.
				// If the first visible row is set to the maximum row index, the table is scrolled to the bottom including the overflow.
				if (!bOnScroll) {
					oScrollExtension.updateVerticalScrollPosition();
				}
			}

			if (!bSuppressEvent) {
				this.fireFirstVisibleRowChanged({
					firstVisibleRow: iRowIndex
				});
			}
		} else if (!bOnScroll) {
			// Even if the first visible row was not changed, this row may not be visible because of the inner scroll position. Therefore the
			// scroll position is adjusted to make it visible (by resetting the inner scroll position).
			oScrollExtension.updateVerticalScrollPosition();
		}

		return this;
	};

	// enable calling 'bindAggregation("rows")' without a factory
	Table.getMetadata().getAggregation("rows")._doesNotRequireFactory = true;

	Table.prototype.bindAggregation = function(sName) {
		if (sName === "rows") {
			return this.bindRows.apply(this, [].slice.call(arguments, 1));
		}

		return Control.prototype.bindAggregation.apply(this, arguments);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.bindRows = function(oBindingInfo) {
		if (this.getEnableBusyIndicator()) {
			this.setBusy(false);
		}
		this._iPendingRequests = 0;
		this._bPendingRequest = false;
		return Control.prototype.bindAggregation.call(this, "rows", Table._getSanitizedBindingInfo(arguments));
	};

	/**
	 * This function will be called by either by {@link sap.ui.base.ManagedObject#bindAggregation} or {@link sap.ui.base.ManagedObject#setModel}.
	 *
	 * @override {@link sap.ui.base.ManagedObject#_bindAggregation}
	 */
	Table.prototype._bindAggregation = function(sName, oBindingInfo) {
		if (sName === "rows") {
			Table._addBindingListener(oBindingInfo, "change", this._onBindingChange.bind(this));
			Table._addBindingListener(oBindingInfo, "dataRequested", this._onBindingDataRequested.bind(this));
			Table._addBindingListener(oBindingInfo, "dataReceived", this._onBindingDataReceived.bind(this));
		}

		// Create the binding.
		Element.prototype._bindAggregation.call(this, sName, oBindingInfo);

		var oBinding = this.getBinding("rows");

		if (sName === "rows" && oBinding != null) {
			var oModel = oBinding.getModel();
			if (oModel != null && oModel.getDefaultBindingMode() === BindingMode.OneTime) {
				jQuery.sap.log.error("The binding mode of the model is set to \"OneTime\"."
									 + " This binding mode is not supported for the \"rows\" aggregation!"
									 + " Scrolling can not be performed.", this);
			}
		}

		// Re-initialize the selection model. Might be necessary in case the table gets "rebound".
		this._initSelectionModel(SelectionModel.MULTI_SELECTION);
	};

	/**
	 * Converts old binding configuration APIs to the new API.
	 *
	 * @param {...*} [args] Binding configuration arguments.
	 * @returns {Object|null} The binding info object or null.
	 * @static
	 * @private
	 */
	Table._getSanitizedBindingInfo = function(args) {
		var oBindingInfo;

		if (args == null || args[0] == null) {
			oBindingInfo = null;
		} else if (typeof args[0] === "string") {
			/* Old API compatibility */

			// (sPath, vTemplate, oSorter, aFilters)
			var sPath = args[0];
			var oTemplate = args[1];
			var oSorter = args[2];
			var aFilters = args[3];

			// (sPath, [oSorter], [aFilters])
			if (oTemplate instanceof Sorter || jQuery.isArray(oSorter) && oSorter[0] instanceof Filter) {
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
	};

	Table._addBindingListener = function(oBindingInfo, sEventName, fHandler) {
		if (oBindingInfo.events == null) {
			oBindingInfo.events = {};
		}

		if (oBindingInfo.events[sEventName] == null) {
			oBindingInfo.events[sEventName] = fHandler;
		} else {
			// Wrap the event handler of the other party to add our handler.
			var fOriginalHandler = oBindingInfo.events[sEventName];
			oBindingInfo.events[sEventName] = function() {
				fHandler.apply(this, arguments);
				fOriginalHandler.apply(this, arguments);
			};
		}
	};

	/**
	 * Initialises a new selection model for the Table instance.
	 * @param {sap.ui.model.SelectionModel.MULTI_SELECTION|sap.ui.model.SelectionModel.SINGLE_SELECTION} sSelectionMode the selection mode of the
	 *     selection model
	 * @returns {sap.ui.table.Table} the table instance for chaining
	 * @private
	 */
	Table.prototype._initSelectionModel = function (sSelectionMode) {
		// detach old selection model event handler
		if (this._oSelection) {
			this._oSelection.detachSelectionChanged(this._onSelectionChanged, this);
		}
		//new selection model with the currently set selection mode
		this._oSelection = new SelectionModel(sSelectionMode);
		this._oSelection.attachSelectionChanged(this._onSelectionChanged, this);

		return this;
	};

	/**
	 * Handler for change events of the binding.
	 * @param {sap.ui.base.Event} oEvent change event
	 * @private
	 */
	Table.prototype._onBindingChange = function(oEvent) {
		var sReason = typeof (oEvent) === "object" ? oEvent.getParameter("reason") : oEvent;
		if (sReason === "sort" || sReason === "filter") {
			this.clearSelection();
			this.setFirstVisibleRow(0);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.unbindAggregation = function(sName, bSuppressReset) {
		var oBinding = this.getBinding("rows");
		if (sName === "rows" && this.isBound("rows")) {
			bSuppressReset = true;
		}

		var vReturn = Element.prototype.unbindAggregation.apply(this, [sName, bSuppressReset]);

		if (sName === "rows" && oBinding) {
			//Reset needs to be resetted, else destroyRows is called, which is not allowed to be called
			this._restoreAppDefaultsColumnHeaderSortFilter();
			// metadata might have changed
			this._invalidateColumnMenus();
			this._updateTotalRowCount(true);
			this.updateRows(TableUtils.RowsUpdateReason.Unbind);
		}

		return vReturn;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setVisibleRowCount = function(iVisibleRowCount) {
		if (iVisibleRowCount != null && !isFinite(iVisibleRowCount)) {
			return this;
		}

		var sVisibleRowCountMode = this.getVisibleRowCountMode();
		if (sVisibleRowCountMode == VisibleRowCountMode.Auto) {
			jQuery.sap.log.error("VisibleRowCount will be ignored since VisibleRowCountMode is set to Auto", this);
			return this;
		}

		var iFixedRowsCount = this.getFixedRowCount() + this.getFixedBottomRowCount();
		if (iVisibleRowCount <= iFixedRowsCount && iFixedRowsCount > 0) {
			jQuery.sap.log.error("Table: " + this.getId() + " visibleRowCount('" + iVisibleRowCount + "') must be bigger than number of fixed rows('" + (this.getFixedRowCount() + this.getFixedBottomRowCount()) + "')", this);
			return this;
		}

		iVisibleRowCount = this.validateProperty("visibleRowCount", iVisibleRowCount);
		if (this.getBinding("rows") != null && this._getTotalRowCount() <= iVisibleRowCount) {
			this.setProperty("firstVisibleRow", 0);
		}
		this.setProperty("visibleRowCount", iVisibleRowCount);
		this._setRowContentHeight(iVisibleRowCount * this._getDefaultRowHeight());
		return this;
	};

	Table.prototype.setMinAutoRowCount = function(iMinAutoRowCount) {
		if (parseInt(iMinAutoRowCount, 10) < 1) {
			jQuery.sap.log.error("The minAutoRowCount property must be greater than 0. The value has been set to 1.", this);
			iMinAutoRowCount = 1;
		}
		this.setProperty("minAutoRowCount", iMinAutoRowCount);
	};

	Table.prototype.setRowHeight = function(iRowHeight) {
		this.setProperty("rowHeight", iRowHeight);
		this._iTableRowContentHeight = undefined;
		return this;
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
	 * @param {string|sap.ui.core.TooltipBase} vTooltip
	 * @returns {sap.ui.table.Table} This-reference for chaining
	 * @public
	 * @override
	 */
	Table.prototype.setTooltip = function(vTooltip) {
		jQuery.sap.log.warning("The aggregation tooltip is not supported for sap.ui.table.Table");
		return this.setAggregation("tooltip", vTooltip, true);
	};

	Table.prototype.setNavigationMode = function() {
		this.setProperty("navigationMode", NavigationMode.Scrollbar, true);
		jQuery.sap.log.error("The navigationMode property is deprecated and must not be used anymore. Your setting was defaulted to 'Scrollbar'", this);
	};

	/**
	 * Requests fixed bottom row contexts from the binding.
	 * @returns {sap.ui.model.Context[]} Array of fixed bottom row context
	 * @private
	 */
	Table.prototype._getFixedBottomRowContexts = function (iFixedBottomRowCount, iBindingLength) {
		var oBinding = this.getBinding("rows");
		var aContexts = [];
		if (!oBinding) {
			return aContexts;
		}

		iFixedBottomRowCount = iFixedBottomRowCount || this.getFixedBottomRowCount();
		iBindingLength = iBindingLength || this._getTotalRowCount();

		var iVisibleRowCount = this.getVisibleRowCount();
		if (iFixedBottomRowCount > 0 && (iVisibleRowCount - iFixedBottomRowCount) < iBindingLength) {
			aContexts = this._getContexts(iBindingLength - iFixedBottomRowCount, iFixedBottomRowCount, 1);
		}

		return aContexts;
	};

	/**
	 * Requests fixed top row contexts from the binding.
	 * @returns {sap.ui.model.Context[]} Array of fixed top row context
	 * @private
	 */
	Table.prototype._getFixedRowContexts = function(iFixedRowCount) {
		iFixedRowCount = iFixedRowCount || this.getFixedRowCount();
		if (iFixedRowCount > 0) {
			return this._getContexts(0, iFixedRowCount);
		} else {
			return [];
		}
	};

	Table.prototype._getContexts = function(iStartIndex, iLength, iThreshold) {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			return oBinding.getContexts(iStartIndex, iLength, iThreshold);
		} else {
			return [];
		}
	};

	/**
	 * Requests all contexts from the binding which are required to display the data in the current viewport.
	 *
	 * @param {int} [iVisibleRows=undefined] The amount of rows to display. Default value is the number of rows in the rows aggregation.
	 * @param {boolean} [bSuppressUpdate=false] If set to <code>true</code>, no UI updates will be performed.
	 * @param {boolean} [bSecondCall=false] If this parameter is set to <code>true</code>, it means that the function called itself recursively.
	 * 										In this case some parts of the function will be skipped.
	 * @returns {Object[]} Array of row contexts returned from the binding.
	 * @private
	 */
	Table.prototype._getRowContexts = function (iVisibleRows, bSuppressUpdate, bSecondCall) {
		var oBinding = this.getBinding("rows");
		var iVisibleRowCount = iVisibleRows == null ? this.getRows().length : iVisibleRows;

		if (!oBinding || iVisibleRowCount <= 0) {
			// Without binding there are no contexts to be retrieved.
			return [];
		}

		bSuppressUpdate = bSuppressUpdate === true;
		bSecondCall = bSecondCall === true;

		var iFirstVisibleRow = this._getFirstRenderedRowIndex();
		var iFixedRowCount = this.getFixedRowCount();
		var iFixedBottomRowCount = this.getFixedBottomRowCount();
		var iReceivedLength = 0;
		var bReceivedLessThanRequested;
		var aContexts = [];
		var aTmpContexts;

		// because of the analytical table the fixed bottom row must always be requested separately as it is the grand
		// total row for the table.
		var iLength = iVisibleRowCount - iFixedBottomRowCount;
		var iMergeOffsetScrollRows = 0;
		var iMergeOffsetBottomRow = iLength;

		// if the threshold is not explicitly disabled by setting it to 0,
		// the default threshold should be at the visibleRowCount.
		var iThreshold = this.getThreshold();
		iThreshold = iThreshold ? Math.max(iVisibleRowCount, iThreshold) : 0;

		// data can be requested with a single getContexts call if the fixed rows and the scrollable rows overlap.
		var iStartIndex = iFirstVisibleRow;

		var fnMergeArrays = function (aTarget, aSource, iStartIndex) {
			for (var i = 0; i < aSource.length; i++) {
				aTarget[iStartIndex + i] = aSource[i];
			}
		};

		if (iFixedRowCount > 0 && iFirstVisibleRow > 0) {
			// since there is a gap between first visible row and fixed rows it must be requested separately
			// the first visible row always starts counting with 0 in the scroll part of the table no matter
			// how many fixed rows there are.
			iStartIndex = iFirstVisibleRow + iFixedRowCount;
			// length must be reduced by number of fixed rows since they were just requested separately
			iLength -= iFixedRowCount;
			iMergeOffsetScrollRows = iFixedRowCount;
			// retrieve fixed rows separately
			aTmpContexts = this._getFixedRowContexts(iFixedRowCount);
			iReceivedLength += aTmpContexts.length;
			aContexts = aContexts.concat(aTmpContexts);
		}

		// request scroll part contexts but may include fixed rows depending on scroll and length settings
		// if this is done before requesting fixed bottom rows, it saves some performance for the analytical table
		// since the tree gets only build once (as result of getContexts call). If first the fixed bottom row would
		// be requested the analytical binding would build the tree twice.
		aTmpContexts = this._getContexts(iStartIndex, iLength, iThreshold);
		var iBindingLength = this._updateTotalRowCount(!bSuppressUpdate);

		// iLength is the number of rows which shall get filled. It might be more than the binding actually has data.
		// Therefore Math.min is required to make sure to not request data again from the binding.
		bReceivedLessThanRequested = aTmpContexts.length < Math.min(iLength, iBindingLength - iFixedBottomRowCount);

		// get the binding length after getContext call to make sure that for TreeBindings the client tree was correctly rebuilt
		// this step can be moved to an earlier point when the TreeBindingAdapters all implement tree invalidation in case of getLength calls
		iReceivedLength += aTmpContexts.length;
		fnMergeArrays(aContexts, aTmpContexts, iMergeOffsetScrollRows);

		// request binding length after getContexts call to make sure that in case of tree binding and analytical binding
		// the tree gets only built once (by getContexts call).
		iMergeOffsetBottomRow = Math.min(iMergeOffsetBottomRow, Math.max(iBindingLength - iFixedBottomRowCount, 0));
		if (iFixedBottomRowCount > 0) {
			// retrieve fixed bottom rows separately
			// instead of just concatenating them to the existing contexts it must be made sure that they are put
			// to the correct row index otherwise they would flip into the scroll area in case data gets requested for
			// the scroll part.
			aTmpContexts = this._getFixedBottomRowContexts(iFixedBottomRowCount, iBindingLength);
			iReceivedLength += aTmpContexts.length;
			fnMergeArrays(aContexts, aTmpContexts, iMergeOffsetBottomRow);
		}

		var iMaxRowIndex = this._getMaxFirstRenderedRowIndex();

		if (bReceivedLessThanRequested
			&& iBindingLength > 0
			&& iMaxRowIndex < iFirstVisibleRow
			&& !bSecondCall) {

			iFirstVisibleRow = iMaxRowIndex;
			this.setProperty("firstVisibleRow", iFirstVisibleRow, true);

			// Get the contexts again, this time with the maximum possible value for the first visible row.
			aContexts = this._getRowContexts(iVisibleRowCount, bSuppressUpdate, true);
		}

		return aContexts;
	};

	/**
	 * Updates the cached total number of rows (binding length) and stores it in <code>Table._iBindingLength</code>.
	 *
	 * @param {boolean} [bUpdateUI=true] If set to <code>true</code>, the parts of the UI which are dependent on the total row count will
	 *                                   be updated, if the total row count has changed.
	 * @returns {int} The updated total row count.
	 * @private
	 */
	Table.prototype._updateTotalRowCount = function(bUpdateUI) {
		// If the binding length changes it must call updateAggregation (updateRows).
		// Therefore it should be save to buffer the binding length here. This gives some performance advantage,
		// especially for tree bindings using the TreeBindingAdapter, where a tree structure must be created to
		// calculate the correct length.
		if (this._iBindingLength === null) {
			this._iBindingLength = 0; // Initialize the binding length. From now on always the cached version should be used.
		}

		var oBinding = this.getBinding("rows");
		var iCurrentTotalRowCount = this._getTotalRowCount();
		var iNewTotalRowCount = oBinding == null ? 0 : oBinding.getLength();

		if (iCurrentTotalRowCount !== iNewTotalRowCount) {
			this._iBindingLength = iNewTotalRowCount;

			// If the binding length changes, some parts of the UI need to be updated.
			if (bUpdateUI !== false) {
				var oScrollExtension = this._getScrollExtension();
				var bClientBinding = TableUtils.isInstanceOf(oBinding, "sap/ui/model/ClientListBinding")
									 || TableUtils.isInstanceOf(oBinding, "sap/ui/model/ClientTreeBinding");

				this._updateFixedBottomRows();
				oScrollExtension.updateVerticalScrollbarVisibility();
				oScrollExtension.updateVerticalScrollHeight();

				if (oBinding == null || bClientBinding) {
					// A client binding does not fire dataReceived events. Therefore we need to update the no data area here.
					// When the binding has been removed, the table might not be completely re-rendered (just the content). But the cached binding
					// length changes. In this case the no data area needs to be updated.
					this._updateNoData();
				}
			}
		}

		return iNewTotalRowCount;
	};

	/**
	 * Refresh rows
	 * @private
	 */
	Table.prototype.refreshRows = function(vEvent) {
		var oBinding = this.getBinding("rows");
		if (!oBinding) {
			jQuery.sap.log.error("RefreshRows must not be called without a binding", this);
			return;
		}

		var that = this;
		var sReason = typeof (vEvent) === "object" ? vEvent.getParameter("reason") : vEvent;

		// make getContexts call to force data load
		var sVisibleRowCountMode = this.getVisibleRowCountMode();
		if ((this.bOutput && sVisibleRowCountMode === VisibleRowCountMode.Auto) || sVisibleRowCountMode !== VisibleRowCountMode.Auto) {
			// the correct number of records to be requested can only be determined when the table row content height is known or if the
			// visible row count mode is not Auto
			var iRowsToDisplay = this._calculateRowsToDisplay();
			if (this.bOutput) {
				oBinding.attachEventOnce("dataRequested", function() {
					// doing it in a timeout will allow the data request to be sent before the rows get created
					if (that._mTimeouts.refreshRowsAdjustRows) {
						window.clearTimeout(that._mTimeouts.refreshRowsAdjustRows);
					}
					that._mTimeouts.refreshRowsAdjustRows = window.setTimeout(function() {
						that._updateRows(iRowsToDisplay, sReason, false);
					}, 0);
				});
			}
			// request contexts from binding
			if (sReason === ChangeReason.Filter || sReason === ChangeReason.Sort) {
				this.setFirstVisibleRow(0);
			}
			this._updateBindingContexts(iRowsToDisplay, true);
		}
	};

	/**
	 * Updates the rows - called internally by the updateAggregation function when
	 * anything in the model has been changed.
	 * @private
	 */
	Table.prototype.updateRows = function(sReason) {
		if (this._bExitCalled) {
			return;
		}

		// Rows should only be created/cloned when the number of rows can be determined. For the VisibleRowCountMode: Auto
		// this can only happen after the table control was rendered one. At this point in time we know how much space is
		// consumed by the table header, toolbar, footer... and we can calculate how much space is left for the table rows.
		var sVisibleRowCountMode = this.getVisibleRowCountMode();
		if ((this.getRows().length <= 0 || this._bRowAggregationInvalid) && ((sVisibleRowCountMode == VisibleRowCountMode.Auto && this.bOutput) || sVisibleRowCountMode != VisibleRowCountMode.Auto)) {
			if (this._iTableRowContentHeight) {
				this._updateRows(this._calculateRowsToDisplay(), sReason);
			}
		}

		// update the bindings only once the table is rendered
		if (!this.bIsDestroyed) {
			// update the bindings by using a delayed mechanism to avoid to many update
			// requests: by using the mechanism below it will trigger an update each 50ms
			// except if the reason is coming from the binding with reason "change" then
			// we do an immediate update instead of a delayed one

			var iBindingTimerDelay = (sReason === ChangeReason.Change
									  || (!this._mTimeouts.bindingTimer && Date.now() - this._lastCalledUpdateRows > this._iBindingTimerDelay)
									  || sReason === TableUtils.RowsUpdateReason.Unbind ?
									  0 : this._iBindingTimerDelay);
			var that = this;

			if (iBindingTimerDelay === 0 && sReason) {
				Promise.resolve().then(function() {
					that._performUpdateRows(sReason);
				});
			} else {
				this._mTimeouts.bindingTimer = this._mTimeouts.bindingTimer || window.setTimeout(function() {
						that._performUpdateRows(sReason);
					}, iBindingTimerDelay);
			}
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.insertRow = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"insertRow\" cannot be used programmatically!", this);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.addRow = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"addRow\" cannot be used programmatically!", this);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeRow = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"removeRow\" cannot be used programmatically!", this);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeAllRows = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"removeAllRows\" cannot be used programmatically!", this);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.destroyRows = function() {
		jQuery.sap.log.error("The control manages the rows aggregation. The method \"destroyRows\" cannot be used programmatically!", this);
	};

	/**
	 * Triggers automatic resizing of a column to the widest content.
	 *
	 * @experimental Experimental! Presently implemented to only work with a very limited set of controls (e.g. sap.m.Text).
	 * @param {int} iColIndex The index of the column in the list of visible columns.
	 * @function
	 * @public
	 */
	Table.prototype.autoResizeColumn = function(iColIndex) {
		this._getPointerExtension().doAutoResizeColumn(iColIndex);
	};


	// =============================================================================
	// EVENT HANDLING & CLEANUP
	// =============================================================================

	/**
	 * Attaches the required native event handlers.
	 * @private
	 */
	Table.prototype._attachEvents = function() {
		var $this = this.$();

		if (sap.ui.getCore().getConfiguration().getAnimation()) {
			jQuery(document.body).on("webkitTransitionEnd transitionend",
				function(oEvent) {
					if (jQuery(oEvent.target).has($this).length > 0) {
						this._updateTableSizes(TableUtils.RowsUpdateReason.Animation);
					}
				}.bind(this)
			);
		}

		Device.resize.attachHandler(this._onWindowResize, this);
		TableExtension.attachEvents(this);
	};

	/**
	 * Detaches the required native event handlers.
	 * @private
	 */
	Table.prototype._detachEvents = function() {
		jQuery(document.body).off('webkitTransitionEnd transitionend');

		TableUtils.deregisterResizeHandler(this);
		Device.resize.detachHandler(this._onWindowResize, this);
		TableExtension.detachEvents(this);
	};

	/**
	 * cleanup the timers and animation frames when not required anymore
	 * @private
	 */
	Table.prototype._cleanUpTimers = function() {
		var sKey;

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
	 * Updates the binding contexts of the cells (column template clones).
	 *
	 * @param {int} [iRowCount=undefined] The number of rows to be updated and number of contexts to be requested from binding.
	 * @param {boolean} [bSuppressUpdate=false] If set to <code>true</code>, the contexts will only be requested, but not assigned to the cells.
	 * @private
	 */
	Table.prototype._updateBindingContexts = function(iRowCount, bSuppressUpdate) {
		var oBinding = this.getBinding("rows");
		var aContexts;

		bSuppressUpdate = bSuppressUpdate === true;

		// Get the contexts from the binding.
		if (oBinding != null) {
			aContexts = this._getRowContexts(iRowCount, bSuppressUpdate);
		}

		if (!bSuppressUpdate) {
			// Row heights must be reset to make sure that rows can shrink if they may have smaller content. The content
			// shall control the row height.
			this._resetRowHeights();

			var aRows = this.getRows(),
				oBindingInfo = this.mBindingInfos["rows"],
				sModelName = oBindingInfo && oBindingInfo.model;

			for (var iIndex = aRows.length - 1; iIndex >= 0; iIndex--) {
				var oContext = aContexts ? aContexts[iIndex] : undefined;
				var oRow = aRows[iIndex];
				if (oRow) {
					oRow.setRowBindingContext(oContext, sModelName, oBinding);
				}
			}
		}
	};

	/**
	 * Show or hide the no data container.
	 * @private
	 */
	Table.prototype._updateNoData = function() {
		if (!this.getDomRef()) {
			return;
		}

		var oFocusRef = document.activeElement;
		this.$().toggleClass("sapUiTableEmpty", TableUtils.isNoDataVisible(this));
		this._getAccExtension().updateAriaStateForOverlayAndNoData();
		this._getKeyboardExtension().updateNoDataAndOverlayFocus(oFocusRef);
	};

	/**
	 * Determines the currently visible columns (used for simply updating only the
	 * controls of the visible columns instead of the complete row!).
	 * @private
	 */
	Table.prototype._determineVisibleCols = function(oTableSizes) {
		// TODO: to be implemented; currently, all columns are counted
		var aColumns = [];
		this.getColumns().forEach(function(column, i){
			if (column.shouldRender()) {
				aColumns.push(i);
			}
		});
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeColumn = function (oColumn, bSuppressInvalidate) {
		var oResult = this.removeAggregation('columns', oColumn, bSuppressInvalidate);

		if (typeof oColumn === "number" && oColumn > -1) {
			oColumn = this.getColumns()[oColumn];
		}

		var iIndex = jQuery.inArray(oColumn, this._aSortedColumns);
		if (!this._bReorderInProcess && iIndex >= 0) {
			this._aSortedColumns.splice(iIndex, 1);
		}
		this.invalidateRowsAggregation();
		return oResult;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeAllColumns = function() {
		var oResult = this.removeAllAggregation('columns');
		this._aSortedColumns = [];
		this.invalidateRowsAggregation();
		return oResult;
	};

	/*
	 * @see JSDoc generated by SAPUI5 contdrol API generator
	 */
	Table.prototype.destroyColumns = function() {
		var oResult = this.destroyAggregation('columns');
		this._aSortedColumns = [];
		this.invalidateRowsAggregation();
		return oResult;
	};


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.addColumn = function (oColumn, bSuppressInvalidate) {
		this.addAggregation('columns', oColumn, bSuppressInvalidate);
		this.invalidateRowsAggregation();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.insertColumn = function (oColumn, iIndex, bSuppressInvalidate) {
		this.insertAggregation('columns', oColumn, iIndex, bSuppressInvalidate);
		this.invalidateRowsAggregation();
		return this;
	};

	/**
	 * Returns the number of rows the <code>rows</code> aggregation is bound to. The return value of this function is cached for performance
	 * reasons. If the <code>rows</code> aggregation is not bound, always 0 is returned.
	 *
	 * @param {boolean} [bIgnoreCache=false] If set to <code>true</code>, the length will be requested from the binding, ignoring any cached value.
	 * @returns {int} The total number of rows.
	 * @see sap.ui.table.Table#_updateTotalRowCount
	 * @private
	 */
	Table.prototype._getTotalRowCount = function(bIgnoreCache) {
		if (this._iBindingLength === null || bIgnoreCache === true) {
			var oBinding = this.getBinding("rows");
			return oBinding == null ? 0 : oBinding.getLength();
		} else {
			return this._iBindingLength;
		}
	};

	/**
	 * Returns the number of rows which can be selected.
	 *
	 * @returns {int} The number of rows which can be selected.
	 * @private
	 */
	Table.prototype._getSelectableRowCount = function() {
		return this._getTotalRowCount();
	};

	/**
	 * Returns the maximum row index to which can be scrolled to
	 * @private
	 */
	Table.prototype._getMaxFirstVisibleRowIndex = function() {
		var iMaxRowIndex;

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			iMaxRowIndex = this._getTotalRowCount(true) - 1;
		} else {
			iMaxRowIndex = this._getTotalRowCount(true) - this.getVisibleRowCount();
		}

		return Math.max(0, iMaxRowIndex);
	};

	/**
	 * Gets the maximum row index where rendering can start from.
	 *
	 * @returns {int} The maximum first rendered row index
	 * @private
	 */
	Table.prototype._getMaxFirstRenderedRowIndex = function() {
		var iMaxRowIndex;

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			iMaxRowIndex = this._getTotalRowCount(true) - this.getVisibleRowCount() - 1;
		} else {
			iMaxRowIndex = this._getTotalRowCount(true) - this.getVisibleRowCount();
		}

		return Math.max(0, iMaxRowIndex);
	};

	/**
	 * Gets the index of the first rendered row.
	 *
	 * @returns {int} The first rendered row index
	 * @private
	 */
	Table.prototype._getFirstRenderedRowIndex = function() {
		var iFirstVisibleRowIndex = this.getFirstVisibleRow();

		if (TableUtils.isVariableRowHeightEnabled(this) && iFirstVisibleRowIndex > this._getMaxFirstRenderedRowIndex()) {
			return this._getMaxFirstRenderedRowIndex();
		} else {
			return iFirstVisibleRowIndex;
		}
	};

	/**
	 * Returns the count of visible columns.
	 * @private
	 */
	Table.prototype._getVisibleColumns = function() {
		var aColumns = [];
		var aCols = this.getColumns();
		for (var i = 0, l = aCols.length; i < l; i++) {
			if (aCols[i].shouldRender()) {
				aColumns.push(aCols[i]);
			}
		}
		return aColumns;
	};

	/**
	 * Returns the summed width of all rendered columns
	 * @private
	 * @param {Number} iStartColumn starting column for calculating the width
	 * @param {Number} iEndColumn ending column for calculating the width
	 * @returns {Number} the summed column width
	 */
	Table.prototype._getColumnsWidth = function(iStartColumn, iEndColumn) {
		// first calculate the min width of the table for all columns
		var aCols = this.getColumns();
		var iColsWidth = 0;

		if (iStartColumn !== 0 && !iStartColumn) {
			iStartColumn = 0;
		}
		if (iEndColumn !== 0 && !iEndColumn) {
			iEndColumn = aCols.length;
		}

		for (var i = iStartColumn, l = iEndColumn; i < l; i++) {
			if (aCols[i] && aCols[i].shouldRender()) {
				iColsWidth += this._CSSSizeToPixel(aCols[i].getWidth());
			}
		}

		return iColsWidth;

	};

	/**
	 * Calculates the pixel value from a given CSS size and returns it with or without unit.
	 * @param {string} sCSSSize
	 * @param {boolean} bReturnWithUnit
	 * @returns {string|number} Converted CSS value in pixel
	 * @private
	 */
	Table.prototype._CSSSizeToPixel = function(sCSSSize, bReturnWithUnit) {
		var sPixelValue = TableUtils.Column.getMinColumnWidth();

		if (sCSSSize) {
			if (jQuery.sap.endsWith(sCSSSize, "px")) {
				sPixelValue = parseInt(sCSSSize, 10);
			} else if (jQuery.sap.endsWith(sCSSSize, "em") || jQuery.sap.endsWith(sCSSSize, "rem")) {
				sPixelValue = Math.ceil(parseFloat(sCSSSize) * this._getBaseFontSize());
			}
		}

		if (bReturnWithUnit) {
			return sPixelValue + "px";
		} else {
			return parseInt(sPixelValue, 10);
		}
	};

	Table.prototype._getBaseFontSize = function() {
		return this._iBaseFontSize;
	};

	/**
	 * Triggered by the ResizeHandler if width/height changed.
	 * @private
	 */
	Table.prototype._onTableResize = function() {
		if (this._bInvalid || !this.getDomRef()) {
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
		}
	};

	Table.prototype._handleRowCountModeAuto = function(iTableAvailableSpace, sReason) {
		iTableAvailableSpace = iTableAvailableSpace || this._determineAvailableSpace();

		var oBinding = this.getBinding("rows");
		var iRows = this._calculateRowsToDisplay(iTableAvailableSpace);

		if (oBinding && this.getRows().length > 0) {
			return this._updateRows(iRows, sReason);
		} else {
			var bReturn = !this._mTimeouts.handleRowCountModeAutoAdjustRows;
			var iBusyIndicatorDelay = this.getBusyIndicatorDelay();
			var bBusyIndicatorEnabled = this.getEnableBusyIndicator();
			var that = this;

			if (oBinding && bBusyIndicatorEnabled) {
				this.setBusyIndicatorDelay(0);
				this.setBusy(true);
			}

			if (iTableAvailableSpace) {
				this._setRowContentHeight(iTableAvailableSpace);
			}

			this._mTimeouts.handleRowCountModeAutoAdjustRows = this._mTimeouts.handleRowCountModeAutoAdjustRows || window.setTimeout(function() {
				if (!that._updateRows(iRows, sReason)) {
					// table sizes were not updated by AdjustRows
					that._updateTableSizes(sReason, false, true);
				}

				delete that._mTimeouts.handleRowCountModeAutoAdjustRows;

				if (oBinding && bBusyIndicatorEnabled) {
					that.setBusyIndicatorDelay(iBusyIndicatorDelay);
					that.setBusy(false);
				}
			}, 0);

			return bReturn;
		}
	};

	/**
	 * disables text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._disableTextSelection = function (oElement) {
		// prevent text selection
		jQuery(oElement || document.body).
			attr("unselectable", "on").
			css({
				"-moz-user-select": "none",
				"-webkit-user-select": "none",
				"user-select": "none"
			}).
			bind("selectstart", function(oEvent) {
				oEvent.preventDefault();
				return false;
			});
	};

	/**
	 * enables text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._enableTextSelection = function (oElement) {
		jQuery(oElement || document.body).
			attr("unselectable", "off").
			css({
				"-moz-user-select": "",
				"-webkit-user-select": "",
				"user-select": ""
			}).
			unbind("selectstart");
	};

	/**
	 * clears the text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._clearTextSelection = function () {
		if (window.getSelection) {
		  if (window.getSelection().empty) {  // Chrome
			window.getSelection().empty();
		  } else if (window.getSelection().removeAllRanges) {  // Firefox
			window.getSelection().removeAllRanges();
		  }
		} else if (document.selection && document.selection.empty) {  // IE?
			try {
				document.selection.empty();
			} catch (ex) {
				// ignore error to as a workaround for bug in IE8
			}
		}
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
		var $target = jQuery(oEvent.target);
		// find out which cell has been clicked
		var $cell = $target.closest("td.sapUiTableTd");
		var sId = $cell.attr("id");
		var aMatches = /.*-row(\d*)-col(\d*)/i.exec(sId);
		var bCancel = false;
		// TBD: cellClick event is currently not fired on row action cells.
		// If this should be enabled in future we need to consider a different set of event parameters.
		if (aMatches) {
			var iRow = aMatches[1];
			var iCol = aMatches[2];
			var oRow = this.getRows()[iRow];
			var oCell = oRow && oRow.getCells()[iCol];
			var iRealRowIndex = oRow && oRow.getIndex();
			var sColId = oCell.data("sap-ui-colid");

			var oRowBindingContext;
			if (this.getBindingInfo("rows")) {
				oRowBindingContext = oRow.getBindingContext(this.getBindingInfo("rows").model);
			}

			var mParams = {
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

		// Focus is handled by the item navigation. It's not the root element of the table which may get the focus but
		// the last focused column header or cell.
		var oFocusedItemInfo = TableUtils.getFocusedItemInfo(this);
		if (oFocusedItemInfo !== null) {
			return oFocusedItemInfo.domRef || Control.prototype.getFocusDomRef.apply(this, arguments);
		}

		return null;
	};


	// =============================================================================
	// ROW SELECTION
	// =============================================================================

	/**
	 *
	 * @param {int} iRowIndex
	 * @returns {boolean}
	 * @private
	 */
	Table.prototype._isRowSelectable = function(iRowIndex) {
		return iRowIndex >= 0 && iRowIndex < this._getTotalRowCount();
	};

	// =============================================================================
	// SORTING & FILTERING
	// =============================================================================

	/**
	 * Pushes the sorted column to array.
	 *
	 * @param {sap.ui.table.Column} oColumn
	 *         column to be sorted
	 * @param {Boolean} bAdd Set to true to add the new sort criterion to the existing sort criteria
	 * @type sap.ui.table.Table
	 * @private
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	Table.prototype.pushSortedColumn = function(oColumn, bAdd) {

		if (!bAdd) {
			this._aSortedColumns = [];
		}

		this._aSortedColumns.push(oColumn);

	};

	/**
	 * Gets sorted columns in the order of which the sort API at the table or column was called.
	 * Sorting on binding level is not reflected here.
	 *
	 * @returns Array of sorted columns
	 * @see sap.ui.table.Table#sort
	 * @see sap.ui.table.Column#sort
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getSortedColumns = function() {
		// ensure that _aSortedColumns can't be altered by accident
		return this._aSortedColumns.slice();
	};

	/**
	 * Sorts the given column ascending or descending.
	 *
	 * @param {sap.ui.table.Column | undefined} oColumn
	 *         column to be sorted or undefined to clear sorting
	 * @param {sap.ui.table.SortOrder} oSortOrder
	 *         sort order of the column (if undefined the default will be ascending)
	 * @param {Boolean} bAdd Set to true to add the new sort criterion to the existing sort criteria
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.sort = function(oColumn, oSortOrder, bAdd) {
		if (!oColumn) {
			// mimic the list binding sort API, if no column is provided, just restore the default sorting
			// make sure to also update the sorted property to correctly indicate sorted columns
			for (var i = 0; i < this._aSortedColumns.length; i++) {
				this._aSortedColumns[i].setSorted(false);
			}

			var oBinding = this.getBinding("rows");
			if (oBinding) {
				oBinding.sort();
			}

			this._aSortedColumns = [];
		}

		if (jQuery.inArray(oColumn, this.getColumns()) >= 0) {
			oColumn.sort(oSortOrder === SortOrder.Descending, bAdd);
		}
	};


	/**
	 * Filter the given column by the given value.
	 *
	 * @param {sap.ui.table.Column} oColumn
	 *         column to be filtered
	 * @param {string} sValue
	 *         filter value as string (will be converted)
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.filter = function(oColumn, sValue) {
		if (jQuery.inArray(oColumn, this.getColumns()) >= 0) {
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
		var oSelMode = this.getSelectionMode();
		if (oSelMode === SelectionMode.None) {
			// there is no selection which needs to be updated. With the switch of the
			// selection mode the selection was cleared (and updated within that step)
			return;
		}

		// retrieve tooltip and aria texts only once and pass them to the rows _updateSelection function
		var mTooltipTexts = this._getAccExtension().getAriaTextsForSelectionMode(true);

		// check whether the row can be clicked to change the selection
		var bSelectOnCellsAllowed = TableUtils.isRowSelectionAllowed(this);

		// trigger the rows to update their selection
		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow._updateSelection(this, mTooltipTexts, bSelectOnCellsAllowed);
		}
		// update internal property to reflect the correct index
		this.setProperty("selectedIndex", this.getSelectedIndex(), true);

		if (TableUtils.hasSelectAll(this)) {
			var $SelectAll = this.$("selall");
			var bAllRowsSelected = TableUtils.areAllRowsSelected(this);

			$SelectAll.toggleClass("sapUiTableSelAll", !bAllRowsSelected);
			this._getAccExtension().setSelectAllState(bAllRowsSelected);

			if (this._getShowStandardTooltips()) {
				var sSelectAllResourceTextID = bAllRowsSelected ? "TBL_DESELECT_ALL" : "TBL_SELECT_ALL";
				$SelectAll.attr('title', this._oResBundle.getText(sSelectAllResourceTextID));
			}
		}
	};

	/**
	 * Returns <code>true</code>, if the standard tooltips (e.g. for selection should be shown).
	 * @private
	 */
	Table.prototype._getShowStandardTooltips = function() {
		return !this._bHideStandardTooltips;
	};


	/**
	 * Notifies the selection listeners about the changed rows.
	 * @private
	 */
	Table.prototype._onSelectionChanged = function(oEvent) {
		var aRowIndices = oEvent.getParameter("rowIndices");
		var bSelectAll = oEvent.getParameter("selectAll");
		var iRowIndex = this._iSourceRowIndex !== undefined ? this._iSourceRowIndex : this.getSelectedIndex();
		this._updateSelection();

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
	 * the binding will trigger a backend request and request this single context. Although this API
	 * looks synchronous it may not return a context but load it and fire a change event on the binding.
	 *
	 * For server-based models you should consider to only make this API call when the index is within
	 * the currently visible scroll area.
	 *
	 * @param {int} iIndex Index of the row to return the context from.
	 * @type object
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getContextByIndex = function(iIndex) {
		// TODO: ODataListBinding needs to make sure to prevent loading multiple times
		// index must not be smaller than 0! otherwise the ODataModel fails
		var oBinding = this.getBinding("rows");
		return iIndex >= 0 && oBinding ? oBinding.getContexts(iIndex, 1)[0] : null;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.getSelectedIndex = function() {
		return this._oSelection.getLeadSelectedIndex();
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setSelectedIndex = function(iIndex) {
		if (iIndex === -1) {
			//If Index eq -1 no item is selected, therefore clear selection is called
			//SelectionModel doesn't know that -1 means no selection
			this.clearSelection();
		} else {
			this._oSelection.setSelectionInterval(iIndex, iIndex);
		}
		return this;
	};

	/**
	 * Removes complete selection.
	 *
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.clearSelection = function() {
		this._oSelection.clearSelection();
		return this;
	};

	/**
	 * Add all rows to the selection.
	 * Please note that for server based models like OData the indices which are considered to be selected might not
	 * be available at the client yet. Calling getContextByIndex might not return a result but trigger a roundtrip
	 * to request this single entity.
	 *
	 * @returns sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.selectAll = function() {
		if (!TableUtils.hasSelectAll(this)) {
			return this;
		}

		var oBinding = this.getBinding("rows");
		if (oBinding) {
			this._oSelection.selectAll(this._getTotalRowCount() - 1);
		}

		return this;
	};

	/**
	 * Zero-based indices of selected items, wrapped in an array. An empty array means "no selection".
	 *
	 * @returns int[]
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getSelectedIndices = function() {
		return this._oSelection.getSelectedIndices();
	};

	/**
	 * Adds the given selection interval to the selection. In case of single selection the "indexTo" value will be used for as selected index.
	 *
	 * @param {int} iIndexFrom
	 *         Index from which .
	 * @param {int} iIndexTo
	 *         Indices of the items that shall additionally be selected.
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.addSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.getSelectionMode() === library.SelectionMode.None) {
			return this;
		}

		this._oSelection.addSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Sets the given selection interval as selection. In case of single selection the "indexTo" value will be used for as selected index.
	 *
	 * @param {int} iIndexFrom
	 *         Index from which .
	 * @param {int} iIndexTo
	 *         Indices of the items that shall additionally be selected.
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.setSelectionInterval = function(iIndexFrom, iIndexTo) {
		if (this.getSelectionMode() === library.SelectionMode.None) {
			return this;
		}

		this._oSelection.setSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Removes the given selection interval from the selection. In case of single selection this call removeSelectedIndex with the "indexTo" value.
	 *
	 * @param {int} iIndexFrom
	 *         Index from which .
	 * @param {int} iIndexTo
	 *         Indices of the items that shall additionally be selected.
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.removeSelectionInterval = function(iIndexFrom, iIndexTo) {
		this._oSelection.removeSelectionInterval(iIndexFrom, iIndexTo);
		return this;
	};

	/**
	 * Returns whether the given index is selected.
	 *
	 * @param {int} iIndex
	 *         Index which is checked for selection state.
	 * @type boolean
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.isIndexSelected = function(iIndex) {
		return this._oSelection.isSelectedIndex(iIndex);
	};

	// =============================================================================
	// GROUPING
	// =============================================================================

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setGroupBy = function(vValue) {
		var oGroupByColumn = vValue;
		var oOldGroupByColumn = sap.ui.getCore().byId(this.getGroupBy());

		if (typeof oGroupByColumn === "string") {
			oGroupByColumn = sap.ui.getCore().byId(oGroupByColumn);
		}

		// only for columns we do the full handling here - otherwise the method
		// setAssociation will fail below with a specific fwk error message
		var bReset = false;
		if (oGroupByColumn != null && oGroupByColumn instanceof Column && oGroupByColumn !== oOldGroupByColumn) {

			// check for column being part of the columns aggregation
			if (jQuery.inArray(oGroupByColumn, this.getColumns()) === -1) {
				throw new Error("Column has to be part of the columns aggregation!");
			}

			// fire the event (to allow to cancel the event)
			var bExecuteDefault = this.fireGroup({column: oGroupByColumn, groupedColumns: [oGroupByColumn.getId()], type: GroupEventType.group});

			// first we reset the grouping indicator of the old column (will show the column)
			if (oOldGroupByColumn != null) {
				oOldGroupByColumn.setGrouped(false);
				bReset = true;
			}

			// then we set the grouping indicator of the new column (will hide the column)
			// ==> only if the default behavior is not prevented
			if (bExecuteDefault && this.getEnableGrouping()) {
				oGroupByColumn.setGrouped(true);
			}
		}

		// reset the binding when no value is given or the binding needs to be reseted
		// TODO: think about a better handling to recreate the group binding
		if (oGroupByColumn == null || bReset) {
			if (oOldGroupByColumn != null) {
				oOldGroupByColumn.setGrouped(false);
			}

			TableUtils.Grouping.resetExperimentalGrouping(this);
		}

		// set the new group by column (TODO: undefined doesn't work!)
		return this.setAssociation("groupBy", oGroupByColumn);
	};

	Table.prototype.getBinding = function(sName) {
		TableUtils.Grouping.setupExperimentalGrouping(this);
		return Element.prototype.getBinding.call(this, [sName || "rows"]);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setEnableGrouping = function(bEnableGrouping) {
		var oGroupedByColumn = sap.ui.getCore().byId(this.getGroupBy());

		this.setProperty("enableGrouping", bEnableGrouping);

		if (oGroupedByColumn != null) {
			oGroupedByColumn.setGrouped(bEnableGrouping);
		}

		TableUtils.Grouping.resetExperimentalGrouping(this);

		// update the column headers
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setEnableCustomFilter = function(bEnableCustomFilter) {
		this.setProperty("enableCustomFilter", bEnableCustomFilter);
		// update the column headers
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setEnableColumnFreeze = function(bEnableColumnFreeze) {
		this.setProperty("enableColumnFreeze", bEnableColumnFreeze);
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setShowColumnVisibilityMenu = function(bShowColumnVisibilityMenu) {
		this.setProperty("showColumnVisibilityMenu", bShowColumnVisibilityMenu);
		this._invalidateColumnMenus();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.getFixedColumnCount = function() {
		if (this._bIgnoreFixedColumnCount) {
			return 0;
		} else {
			return this.getProperty("fixedColumnCount");
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFixedColumnCount = function(iFixedColumnCount, bSuppressInvalidate) {

		var aCols = this.getColumns();

		// There may be invisible columns and the last visible fixed column may have a colspan
		// 1. Find the last visible fixed column
		// 2. Check if it has a column span
		// 3. Adjust iFixedColumnCount, if needed
		var oColumn,
			i;

		for (i = iFixedColumnCount - 1; i >= 0; i--) {
			oColumn = aCols[i];
			if (oColumn && oColumn.getVisible()) {
				iFixedColumnCount = Math.max(iFixedColumnCount, oColumn.getIndex() + TableUtils.Column.getHeaderSpan(oColumn));
				break;
			}
		}

		//Set current width as fixed width for cols
		var $ths = this.$().find(".sapUiTableCtrlFirstCol > th");
		for (i = iFixedColumnCount - 1; i >= 0; i--) {
			oColumn = aCols[i];
			if (oColumn && TableUtils.isVariableWidth(oColumn.getWidth())) {
				// remember the current column width for the next rendering
				oColumn._iFixWidth = $ths.filter("[data-sap-ui-headcolindex='" + oColumn.getIndex() + "']").width();
			}
		}
		this.setProperty("fixedColumnCount", iFixedColumnCount, bSuppressInvalidate);

		// call collectTableSizes to determine whether the number of fixed columns can be displayed at all
		// this is required to avoid flickering of the table in IE if the fixedColumnCount must be adjusted
		this._collectTableSizes();
		if (this.getEnableColumnFreeze()) {
			this._invalidateColumnMenus();
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFixedRowCount = function(iFixedRowCount) {
		if (!(parseInt(iFixedRowCount, 10) >= 0)) {
			jQuery.sap.log.error("Number of fixed rows must be greater or equal 0", this);
			return this;
		}

		if ((iFixedRowCount + this.getFixedBottomRowCount()) < this.getVisibleRowCount()) {
			this.setProperty("fixedRowCount", iFixedRowCount);
			this._updateBindingContexts();
		} else {
			jQuery.sap.log.error("Table '" + this.getId() + "' fixed rows('" + (iFixedRowCount + this.getFixedBottomRowCount()) + "') must be smaller than numberOfVisibleRows('" + this.getVisibleRowCount() + "')", this);
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFixedBottomRowCount = function(iFixedRowCount) {
		if (!(parseInt(iFixedRowCount, 10) >= 0)) {
			jQuery.sap.log.error("Number of fixed bottom rows must be greater or equal 0", this);
			return this;
		}

		if ((iFixedRowCount + this.getFixedRowCount()) < this.getVisibleRowCount()) {
			this.setProperty("fixedBottomRowCount", iFixedRowCount);
			this._updateBindingContexts();
		} else {
			jQuery.sap.log.error("Table '" + this.getId() + "' fixed rows('" + (iFixedRowCount + this.getFixedRowCount()) + "') must be smaller than numberOfVisibleRows('" + this.getVisibleRowCount() + "')", this);
		}
		return this;
	};

	/**
	 * Sets the threshold value, which will be added to all data requests in
	 * case the Table is bound against an OData service.
	 * @public
	 */
	Table.prototype.setThreshold = function (iThreshold) {
		this.setProperty("threshold", iThreshold, true);
	};

	/**
	 * Invalidates all column menus.
	 * @param {boolean} bUpdateLocalization Whether the texts of the menu should be updated too.
	 * @private
	 */
	Table.prototype._invalidateColumnMenus = function(bUpdateLocalization) {
		var aCols = this.getColumns();
		for (var i = 0, l = aCols.length; i < l; i++) {
			aCols[i].invalidateMenu(bUpdateLocalization);
		}
	};

	/**
	 * Checks whether the event is a touch event.
	 *
	 * @param {jQuery.Event} oEvent The event to check
	 * @returns {boolean} Returns <code>true</code>, if <code>oEvent</code> is a touch event
	 * @private
	 */
	Table.prototype._isTouchEvent = function(oEvent) {
		return oEvent != null && oEvent.originalEvent != null && oEvent.originalEvent.touches != null;
	};

	Table.prototype._getRowClone = function(iIndex) {
		var oRowClone = new Row(this.getId() + "-rows" + "-row" + iIndex);

		// Add cells to the row clone.
		var aColumns = this.getColumns();
		for (var i = 0, l = aColumns.length; i < l; i++) {
			if (aColumns[i].getVisible()) {
				var oColumnTemplateClone = aColumns[i].getTemplateClone(i);
				if (oColumnTemplateClone) {
					oRowClone.addCell(oColumnTemplateClone);
				}
			}
		}

		// Add the row actions to the row clone.
		if (TableUtils.hasRowActions(this)) {
			var oRowAction = this.getRowActionTemplate().clone();
			oRowAction._setFixedLayout(true);
			oRowAction._setCount(this.getRowActionCount());
			oRowAction._setIconLabel(this.getId() + "-rowacthdr");
			oRowClone.setAggregation("_rowAction", oRowAction, true);
		}

		// Add the row settings to the row clone.
		var oRowSettingsTemplate = this.getRowSettingsTemplate();
		if (oRowSettingsTemplate) {
			var oRowSettings = oRowSettingsTemplate.clone();
			oRowClone.setAggregation("_settings", oRowSettings, true);
		}

		return oRowClone;
	};

	/**
	 * Sets a marker to indicate that the rows aggregation is invalid and should be destroyed within the next cycle
	 * @private
	 */
	Table.prototype.invalidateRowsAggregation = function() {
		this._bRowAggregationInvalid = true;
	};

	/**
	 * Updates the rows aggregation and renders the rows.
	 * As specified by <code>bUpdateUI</code>, also the row binding contexts and the table cells are updated.
	 *
	 * @param {int} iNumberOfRows The number of rows to be updated.
	 * @param {sap.ui.table.TableUtils.RowsUpdateReason|undefined} [sReason=undefined] The reason for updating the rows.
	 * @param {boolean} [bUpdateUI=true] Whether the contexts and the cells should be updated.
	 * @returns {boolean} Returns <code>true</code>, if the UI was updated.
	 * @private
	 */
	Table.prototype._updateRows = function(iNumberOfRows, sReason, bUpdateUI) {
		if (isNaN(iNumberOfRows)) {
			return false;
		}

		if (bUpdateUI == null) {
			bUpdateUI = true;
		}

		// Create one additional row, for half-scrolled rows at the bottom.
		if (TableUtils.isVariableRowHeightEnabled(this)) {
			iNumberOfRows = iNumberOfRows + 1;
		}

		var i;
		var aRows = this.getRows();
		if (this._bRowAggregationInvalid && aRows.length > 0) {
			this.destroyAggregation("rows", true);
			aRows = [];
		}

		if (iNumberOfRows == aRows.length) {
			return false;
		}

		// Remove rows from the aggregation if they are no longer required.
		for (i = aRows.length - 1; i >= iNumberOfRows; i--) {
			this.removeAggregation("rows", i, true).destroy();
		}

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			// One additional row was created for half-scrolled rows at the bottom.,
			// this should not lead to an increase of the visibleRowCount defined by the user.
			this.setProperty("visibleRowCount", iNumberOfRows - 1, true);
		} else {
			this.setProperty("visibleRowCount", iNumberOfRows, true);
		}

		// this call might cause the cell (controls) to invalidate themselves and therefore also the table. It should be
		// avoided to rerender the complete table since rendering of the rows is handled here. All child controls get
		// rendered.
		this._ignoreInvalidateOfChildControls = true;
		var aContexts;
		var oBindingInfo;
		var sModelName;
		var oBinding = this.getBinding("rows");

		if (bUpdateUI) {
			// set binding contexts for known rows
			oBindingInfo = this.getBindingInfo("rows");
			sModelName = oBindingInfo && oBindingInfo.model;
			aContexts = this._getRowContexts(iNumberOfRows);

			for (i = 0; i < aRows.length; i++) {
				aRows[i].setRowBindingContext(aContexts[i], sModelName, oBinding);
			}
		}

		if (aRows.length < iNumberOfRows) {
			// clone rows and set binding context for them
			for (i = aRows.length; i < iNumberOfRows; i++) {
				// add new rows and set their binding contexts in the same run in order to avoid unnecessary context
				// propagations.
				var oClone = this._getRowClone(i);
				if (bUpdateUI) {
					oClone.setRowBindingContext(aContexts[i], sModelName, oBinding);
				}
				this.addAggregation("rows", oClone, true);
				this._bRowAggregationInvalid = false;
				if (bUpdateUI) {
					// As long the clone is not yet in the aggregation setRowBindingContext will not process the following,
					// therefore call it manually here.
					oClone._updateTableCells(aContexts[i]);
				}
			}
		}
		this._ignoreInvalidateOfChildControls = false;

		var bFireRowsUpdated = bUpdateUI && aContexts.length > 0;
		return this._renderRows(sReason, bFireRowsUpdated);
	};

	/**
	 * Renders the rows and their containers and writes the HTML to the DOM.
	 *
	 * @param {sap.ui.table.TableUtils.RowsUpdateReason|undefined} [sReason=undefined] The reason why the rows need to be rendered.
	 * @param {boolean} [bFireRowsUpdated=false] Whether the <code>_rowsUpdated</code> event should be fired after the HTML has been written.
	 * @returns {boolean} Returns <code>true</code>, if rendering and writing to the DOM was performed.
	 * @private
	 */
	Table.prototype._renderRows = function(sReason, bFireRowsUpdated) {
		var bReturn = false;

		bFireRowsUpdated = bFireRowsUpdated === true;

		if (!this._bInvalid) {
			var oTBody = this.getDomRef("tableCCnt");

			if (this.getRows().length === 0 || !oTBody) {
				return false;
			}

			this._detachEvents();

			if (this.getVisibleRowCountMode() === VisibleRowCountMode.Auto) {
				var oDomRef = this.getDomRef();
				if (oDomRef) {
					oDomRef.style.height = "0px";
				}
			}

			// make sure to call rendering event delegates even in case of DOM patching
			var oEvent = jQuery.Event("BeforeRendering");
			oEvent.setMarked("renderRows");
			oEvent.srcControl = this;
			this._handleEvent(oEvent);

			var oRM = new sap.ui.getCore().createRenderManager(),
				oRenderer = this.getRenderer();

			oRenderer.renderTableCCnt(oRM, this);
			oRM.flush(oTBody, false, false);
			oRM.destroy();

			// make sure to call rendering event delegates even in case of DOM patching
			oEvent = jQuery.Event("AfterRendering");
			oEvent.setMarked("renderRows");
			oEvent.srcControl = this;
			this._handleEvent(oEvent);
			bReturn = true;
		}

		if (bFireRowsUpdated && !this._bInvalid && this.getBinding("rows")) {
			var that = this;
			if (this._mTimeouts._rowsUpdated) {
				window.clearTimeout(this._mTimeouts._rowsUpdated);
			}
			this._mTimeouts._rowsUpdated = window.setTimeout(function() {
				that._fireRowsUpdated(sReason);
			}, 0);
		}

		return bReturn;
	};

	/**
	 * Determines the default row height.
	 * @private
	 */
	Table.prototype._getDefaultRowHeight = function() {
		var iRowContentHeight = this.getRowHeight();

		if (iRowContentHeight > 0) {
			return iRowContentHeight + TableUtils.ROW_HORIZONTAL_FRAME_SIZE;
		} else {
			var sContentDensity = TableUtils.getContentDensity(this);
			return TableUtils.DEFAULT_ROW_HEIGHT[sContentDensity];
		}
	};

	/**
	 * Determines and sets the height of tableCtrlCnt based upon the VisibleRowCountMode and other conditions.
	 * @param {int} iHeight
	 * @private
	 */
	Table.prototype._setRowContentHeight = function(iHeight) {
		iHeight = iHeight || 0;
		var sVisibleRowCountMode = this.getVisibleRowCountMode();
		var iVisibleRowCount = this.getVisibleRowCount();
		var iDefaultRowHeight = this._getDefaultRowHeight();
		var iMinVisibleRowCount = this.getMinAutoRowCount();
		var iMinHeight;


		if (sVisibleRowCountMode == VisibleRowCountMode.Interactive || sVisibleRowCountMode == VisibleRowCountMode.Fixed) {
			if (this._iTableRowContentHeight && sVisibleRowCountMode == VisibleRowCountMode.Interactive) {
				iMinHeight = iMinVisibleRowCount * iDefaultRowHeight;
				if (!iHeight) {
					iHeight = this._iTableRowContentHeight;
				}
			} else {
				// Fixed or Interactive without RowContentHeight (Height was not yet adjusted by user)
				iMinHeight = iVisibleRowCount * iDefaultRowHeight;
				iHeight = iMinHeight;
			}
		} else if (sVisibleRowCountMode == VisibleRowCountMode.Auto) {
			iMinHeight = iMinVisibleRowCount * iDefaultRowHeight;
		}

		var iRowContentHeight = Math.max(iHeight, iMinHeight);
		if ((sVisibleRowCountMode == VisibleRowCountMode.Fixed && this.getRows().length == 0) || sVisibleRowCountMode != VisibleRowCountMode.Fixed) {
			// when visibleRowCountMode is fixed, the content height is only required to be set if there are no rows. If rows are already created, the height
			// is implicitly controlled by the total of row heights
			this._iTableRowContentHeight = Math.floor(iRowContentHeight / iDefaultRowHeight) * iDefaultRowHeight;
		} else {
			this._iTableRowContentHeight = undefined;
		}

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			jQuery(this.getDomRef("tableCCnt")).css("height", iDefaultRowHeight * iVisibleRowCount + "px");
		} else {
			if ((sVisibleRowCountMode == VisibleRowCountMode.Fixed || sVisibleRowCountMode == VisibleRowCountMode.Interactive) && this.getRows().length > 0) {
				jQuery(this.getDomRef("tableCtrlCnt")).css("height", "auto");
			} else {
				jQuery(this.getDomRef("tableCtrlCnt")).css("height", this._iTableRowContentHeight + "px");
			}
		}
	};

	/**
	 * Determines the minimal row count for rowCountMode "auto".
	 * @private
	 */
	Table.prototype._determineMinAutoRowCount = function() {
		var iMinRowCount = this.getMinAutoRowCount();
		if (this.getVisibleRowCountMode() == VisibleRowCountMode.Interactive && !this.bOutput) {
			iMinRowCount = this.getVisibleRowCount() || iMinRowCount;
		}
		return iMinRowCount;
	};

	/**
	 * Calculates the maximum rows to display within the table.
	 * @private
	 */
	Table.prototype._calculateRowsToDisplay = function(iTableRowContentHeight) {
		// Remember the last used value for the case when this function is called with undefined iTableRowContentHeight
		// _iTableRowContentHeight is not updated during resize and can be used as a last resort only
		this._iRowsToDisplayHeight = iTableRowContentHeight || this._iRowsToDisplayHeight || this._iTableRowContentHeight;
		iTableRowContentHeight = this._iRowsToDisplayHeight;
		var sVisibleRowCountMode = this.getVisibleRowCountMode();
		var iCalculatedRowsToDisplay = 0;
		if (sVisibleRowCountMode == VisibleRowCountMode.Fixed) {
			// at least one row must be rendered in a table
			iCalculatedRowsToDisplay = this.getVisibleRowCount() || 0;
		} else if (sVisibleRowCountMode == VisibleRowCountMode.Interactive || sVisibleRowCountMode == VisibleRowCountMode.Auto) {
			var iMinAutoRowCount = this._determineMinAutoRowCount();
			var iDefaultRowHeight = this._getDefaultRowHeight();
			if (!iDefaultRowHeight || !iTableRowContentHeight) {
				iCalculatedRowsToDisplay = iMinAutoRowCount;
			} else {
				// Make sure that table does not grow to infinity
				// Maximum height of the table is the height of the window minus two row height, reserved for header and footer.
				var iAvailableSpace = Math.min(iTableRowContentHeight, 50000);
				// the last content row height is iRowHeight - 1, therefore + 1 in the formula below:
				// to avoid issues with having more fixed rows than visible row count, the number of visible rows must be
				// adjusted.
				var iRowCount = Math.floor(iAvailableSpace / iDefaultRowHeight);
				iCalculatedRowsToDisplay = Math.max((this.getFixedRowCount() + this.getFixedBottomRowCount() + 1), Math.max(iMinAutoRowCount, iRowCount));
			}
		}

		return Math.max(iCalculatedRowsToDisplay, 0);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setShowNoData = function(bShowNoData) {
		this.setProperty('showNoData', bShowNoData, true);
		this._updateNoData();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setNoData = function(vNoData) {
		var sNoDataText_Old = TableUtils.getNoDataText(this);
		this.setAggregation("noData", vNoData, true);
		var sNoDataText_New = TableUtils.getNoDataText(this);
		// Avoid full table rerendering when only the text is changed
		if (sNoDataText_Old != null && sNoDataText_New != null && sNoDataText_Old != sNoDataText_New) {
			this.$("noDataMsg").text(sNoDataText_New);
		} else {
			this.invalidate();
		}
		return this;
	};

	/**
	 * Creates a new {@link sap.ui.core.util.Export} object and fills row/column information from the table if not provided. For the cell content,
	 * the column's "sortProperty" will be used (experimental!)
	 *
	 * <p><b>Please note: The return value was changed from jQuery Promises to standard ES6 Promises.
	 * jQuery specific Promise methods ('done', 'fail', 'always', 'pipe' and 'state') are still available but should not be used.
	 * Please use only the standard methods 'then' and 'catch'!</b></p>
	 *
	 * @param {object} [mSettings] settings for the new Export, see {@link sap.ui.core.util.Export} <code>constructor</code>
	 * @returns {Promise} Promise object
	 *
	 * @experimental Experimental because the property for the column/cell definitions (sortProperty) could change in future.
	 * @public
	 */
	Table.prototype.exportData = function(mSettings) {
		//TBD: Use async APIs instead (should be possible because anyhow a Promise is returned)
		var Export = sap.ui.requireSync("sap/ui/core/util/Export");

		mSettings = mSettings || {};

		if (!mSettings.rows) {
			var oBinding = this.getBinding("rows"),
				oBindingInfo = this.getBindingInfo("rows");

			var aFilters = oBinding.aFilters.concat(oBinding.aApplicationFilters);

			mSettings.rows = {
				path: oBindingInfo.path,
				model: oBindingInfo.model,
				sorter: oBinding.aSorters,
				filters: aFilters,
				parameters: oBindingInfo.parameters
			};
		}

		// by default we choose the export type CSV
		if (!mSettings.exportType) {
			var ExportTypeCSV = sap.ui.requireSync("sap/ui/core/util/ExportTypeCSV");
			mSettings.exportType = new ExportTypeCSV();
		}

		var sModelName = mSettings.rows.model;
		if (!sModelName) {
			// if a model separator is found in the path, extract model name from there
			var sPath = mSettings.rows.path;
			var iSeparatorPos = sPath.indexOf(">");
			if (iSeparatorPos > 0) {
				sModelName = sPath.substr(0, iSeparatorPos);
			}
		}

		if (!mSettings.columns) {
			mSettings.columns = [];

			var aColumns = this.getColumns();
			for (var i = 0, l = aColumns.length; i < l; i++) {
				var oColumn = aColumns[i];
				if (oColumn.getSortProperty()) {
					mSettings.columns.push({
						name: oColumn.getLabel().getText(),
						template: {
							content: {
								path: oColumn.getSortProperty(),
								model: sModelName
							}
						}
					});
				}
			}
		}

		var oExport = new Export(mSettings);
		this.addDependent(oExport);

		return oExport;
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onPersoApplied = function() {

		// apply the sorter and filter again (right now only the first sorter is applied)
		var aColumns = this.getColumns();
		var aSorters = [];//, aFilters = [];
		for (var i = 0, l = aColumns.length; i < l; i++) {
			var oColumn = aColumns[i];
			if (oColumn.getSorted()) {
				aSorters.push(new Sorter(oColumn.getSortProperty(), oColumn.getSortOrder() === SortOrder.Descending));
			}
		}

		var oBinding = this.getBinding("rows");
		if (oBinding) {
			if (aSorters.length > 0) {
				oBinding.sort(aSorters);
			}
			this.refreshRows();
		}
	};

	/**
	 * Toggles the selection state of all cells.
	 * @private
	 */
	Table.prototype._toggleSelectAll = function() {
		if (!TableUtils.hasData(this)) {
			return;
		}

		// in order to fire the rowSelectionChanged event, the SourceRowIndex mus be set to -1
		// to indicate that the selection was changed by user interaction
		if (TableUtils.areAllRowsSelected(this)) {
			this._iSourceRowIndex = -1;
			this.clearSelection();
		} else {
			this._iSourceRowIndex = 0;
			this.selectAll();
		}
		this._iSourceRowIndex = undefined;
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._restoreAppDefaultsColumnHeaderSortFilter = function () {
		var aColumns = this.getColumns();
		jQuery.each(aColumns, function(iIndex, oColumn){
			oColumn._restoreAppDefaults();
		});
	};

	Table.prototype.setBusy = function (bBusy, sBusySection) {
		var bBusyChanged = this.getBusy() != bBusy;

		sBusySection = "sapUiTableCnt";
		var vReturn = Control.prototype.setBusy.call(this, bBusy, sBusySection);
		if (bBusyChanged) {
			this.fireBusyStateChanged({busy: bBusy});
		}
		return vReturn;
	};

	/*
	 * Prevents re-rendering, when enabling/disabling busy indicator.
	 * Avoids the request delays.
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setEnableBusyIndicator = function (bValue) {
		this.setProperty("enableBusyIndicator", bValue, true);
		if (!bValue) {
			this.setBusy(false);
		}
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onBindingDataRequested = function (oEvent) {
		if (oEvent.getSource() != this.getBinding("rows") || oEvent.getParameter("__simulateAsyncAnalyticalBinding")) {
			return;
		}

		this._iPendingRequests++;
		this._bPendingRequest = true;

		var bCanUsePendingRequestsCounter = TableUtils.canUsePendingRequestsCounter(this);

		if (this.getEnableBusyIndicator()
			&& (bCanUsePendingRequestsCounter && this._iPendingRequests === 1
				|| !bCanUsePendingRequestsCounter)) {
			this.setBusy(true);
		}

		if (this._dataReceivedHandlerId != null) {
			jQuery.sap.clearDelayedCall(this._dataReceivedHandlerId);
			delete this._dataReceivedHandlerId;
		}
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onBindingDataReceived = function (oEvent) {
		if (oEvent.getSource() != this.getBinding("rows") || oEvent.getParameter("__simulateAsyncAnalyticalBinding")) {
			return;
		}

		this._iPendingRequests--;
		this._bPendingRequest = false;

		// The AnalyticalBinding updates the length after it fires dataReceived, therefore the total row count will not change here. Later,
		// when the contexts are retrieved in Table#_getRowContexts, the AnalyticalBinding updates the length and Table#_updateTotalRowCount
		// will be called again and actually perform the update.
		this._updateTotalRowCount(true);

		if (!TableUtils.hasPendingRequests(this)) {
			// This timer should avoid flickering of the busy indicator and unnecessary updates of NoData in case a request will be sent
			// (dataRequested) immediately after the last response was received (dataReceived).
			this._dataReceivedHandlerId = jQuery.sap.delayedCall(0, this, function() {
				if (this.getEnableBusyIndicator()) {
					this.setBusy(false);
				}
				this._updateNoData();
				delete this._dataReceivedHandlerId;
			});
		}
	};

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

	/**
	 * Retrieves the number of selected entries.
	 * @private
	 */
	Table.prototype._getSelectedIndicesCount = function () {
		return this.getSelectedIndices().length;
	};

	Table.prototype._updateTableContent = function() {
		TableUtils.Grouping.updateGroups(this);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setRowActionTemplate = function(oTemplate) {
		this.setAggregation("rowActionTemplate", oTemplate);

		oTemplate = this.getRowActionTemplate();
		if (oTemplate) {
			oTemplate._setCount(this.getRowActionCount());
		}

		this.invalidateRowsAggregation();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setRowActionCount = function(iCount) {
		this.setProperty("rowActionCount", iCount);

		iCount = this.getRowActionCount();
		var oRowAction = this.getRowActionTemplate();
		if (oRowAction) {
			oRowAction._setCount(iCount);
		}
		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			oRowAction = aRows[i].getAggregation("_rowAction");
			if (oRowAction) {
				oRowAction._setCount(iCount);
			}
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setRowSettingsTemplate = function(oTemplate) {
		this.setAggregation("rowSettingsTemplate", oTemplate);
		this.invalidateRowsAggregation();
		return this;
	};

	Table.prototype._validateRow = function(oRow) {
		return oRow && oRow instanceof Row && oRow.getParent() === this;
	};

	/**
	 * Returns the row to which the given cell belongs or <code>null</code>
	 * if the given control is no direct child of a row of the table.
	 *
	 * @param {sap.ui.core.Control} oCell The cell control
	 * @returns {sap.ui.table.Row} The row to which the given cell belongs
	 * @private
	 */
	Table.prototype.getRowForCell = function(oCell) { //TBD: Make it public if needed
		if (oCell) {
			var oRow = oCell.getParent();
			if (this._validateRow(oRow)) {
				return oRow;
			}
		}
		return null;
	};

	/**
	 * Returns the column to which the given cell belongs or <code>null</code>
	 * if the given control is not connected with a visible column of the table.
	 *
	 * @param {sap.ui.core.Control} oCell The cell control
	 * @returns {sap.ui.table.Column} The column to which the given cell belongs
	 * @private
	 */
	Table.prototype.getColumnForCell = function(oCell) { //TBD: Make it public if needed
		if (this.getRowForCell(oCell)) { // Ensures cell is part of some row of this table
			var iIndex = oCell.data("sap-ui-colindex");
			var aColumns = this.getColumns();
			if (iIndex >= 0 && iIndex < aColumns.length) {
				return aColumns[iIndex];
			}
		}
		return null;
	};

	/**
	 * Returns the control inside the cell with the given row index (in the <code>rows</code> aggregation)
	 * and column index (in the <code>columns</code> aggregation or in the list of visible columns only, depending on
	 * parameter <code>bVisibleColumnIndex</code>).
	 *
	 * @param {int} iRowIndex Index of row in the table's <code>rows</code> aggregation
	 * @param {int} iColumnIndex Index of column in the list of visible columns or in the <code>columns</code> aggregation, as indicated with
	 *     <code>bVisibleColumnIndex</code>
	 * @param {boolean} bVisibleColumnIndex If set to <code>true</code>, the given column index is interpreted as index in the list of visible
	 *     columns, otherwise as index in the <code>columns</code> aggregation
	 * @returns {sap.ui.core.Control} Control inside the cell with the given row and column index or <code>null</code> if no such control exists
	 * @protected
	 */
	Table.prototype.getCellControl = function(iRowIndex, iColumnIndex, bVisibleColumnIndex) {
		var oInfo = TableUtils.getRowColCell(this, iRowIndex, iColumnIndex, !bVisibleColumnIndex);
		return oInfo.cell;
	};

	/**
	 * Fires the <code>_rowsUpdated</code> event.
	 *
	 * @param {sap.ui.table.TableUtils.RowsUpdateReason} [sReason=sap.ui.table.TableUtils.RowsUpdateReason.Unknown]
	 * The reason why the rows have been updated.
	 * @fires Table#_rowsUpdated
	 * @private
	 */
	Table.prototype._fireRowsUpdated = function(sReason) {
		if (sReason == null) {
			sReason = TableUtils.RowsUpdateReason.Unknown;
		}

		/**
		 * This event is fired after the rows have been updated.
		 *
		 * @event Table#_rowsUpdated
		 * @type {Object}
		 * @property {sap.ui.table.TableUtils.RowsUpdateReason} reason - The reason why the rows have been updated.
		 * @protected
		 */
		this.fireEvent("_rowsUpdated", {
			reason: sReason
		});
	};

	return Table;

});
