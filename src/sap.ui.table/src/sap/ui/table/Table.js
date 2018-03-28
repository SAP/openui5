/*!
 * ${copyright}
 */

// Provides control sap.ui.table.Table.
sap.ui.define(['jquery.sap.global', 'sap/ui/Device',
		'sap/ui/core/Control', 'sap/ui/core/Element', 'sap/ui/core/IconPool', 'sap/ui/core/IntervalTrigger', 'sap/ui/core/library', 'sap/ui/core/Popup',
		'sap/ui/core/ResizeHandler', 'sap/ui/core/ScrollBar', 'sap/ui/core/delegate/ItemNavigation', 'sap/ui/core/theming/Parameters',
		'sap/ui/model/ChangeReason', 'sap/ui/model/Context', 'sap/ui/model/Filter', 'sap/ui/model/SelectionModel', 'sap/ui/model/Sorter',
		'./Column', './Row', './library', './TableUtils', './TableExtension', './TableAccExtension', './TableKeyboardExtension', './TablePointerExtension',
		'./TableScrollExtension', 'jquery.sap.dom', 'jquery.sap.trace'],
	function(jQuery, Device,
		Control, Element, IconPool, IntervalTrigger, coreLibrary, Popup,
		ResizeHandler, ScrollBar, ItemNavigation, Parameters,
		ChangeReason, Context, Filter, SelectionModel, Sorter,
		Column, Row, library, TableUtils, TableExtension, TableAccExtension, TableKeyboardExtension,
		TablePointerExtension, TableScrollExtension /*, jQuerySapPlugin,jQuerySAPTrace */) {
	"use strict";


	// shortcuts
	var GroupEventType = library.GroupEventType,
		NavigationMode = library.NavigationMode,
		SelectionBehavior = library.SelectionBehavior,
		SelectionMode = library.SelectionMode,
		SharedDomRef = library.SharedDomRef,
		SortOrder = library.SortOrder,
		VisibleRowCountMode = library.VisibleRowCountMode;

	// lazy dependencies
	var Menu,
		MenuItem;

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
			 * Height of a row of the Table in pixel.
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
			 */
			selectionMode : {type : "sap.ui.table.SelectionMode", group : "Behavior", defaultValue : SelectionMode.MultiToggle},

			/**
			 * Selection behavior of the Table. This property defines whether the row selector is displayed and whether the row, the row selector or both
			 * can be clicked to select a row.
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
			 * Determines whether a scrollbar or a paginator is used for navigation inside the table.
			 * If the paginator mode is used, it requires the <code>sap.ui.commons</code> library.
			 *
			 * This renders a scrollbar as a navigation element. Data fetched from an OData service is still
			 * loaded page-wise no matter which visual representation is used for navigation inside the table.
			 * @deprecated As of version 1.38, there is no replacement, since <code>Scrollbar</code> is the only supported option
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
			 * Flag to enable or disable column grouping. (experimental!)
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
			 * @see sap.ui.table.VisibleRowCountMode
			 */
			visibleRowCountMode : {type : "sap.ui.table.VisibleRowCountMode", group : "Appearance", defaultValue : VisibleRowCountMode.Fixed},

			/**
			 * This property is used to set the minimum count of visible rows when the property visibleRowCountMode is set to Auto or Interactive.
			 * For any other visibleRowCountMode, it is ignored.
			 */
			minAutoRowCount : {type : "int", group : "Appearance", defaultValue : 5},

			/**
			 * Number of columns that are fix on the left. When you use a horizontal scroll bar, only
			 * the columns which are not fixed, will scroll. Fixed columns need a defined width for the feature to work.
			 * Please note that the aggregated width of all fixed columns must not exceed the table width since there
			 * will be no scrollbar for fixed columns.
			 */
			fixedColumnCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Number of rows that are fix on the top. When you use a vertical scroll bar, only the rows which are not fixed, will scroll.
			 */
			fixedRowCount : {type : "int", group : "Appearance", defaultValue : 0},

			/**
			 * Number of rows that are fix on the bottom. When you use a vertical scroll bar, only the rows which are not fixed, will scroll.
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
			 * Set this parameter to true to make the table handle the busy indicator by its own.
			 * The table will switch to busy as soon as it scrolls into an unpaged area. This feature can only
			 * be used when the navigation mode is set to scrolling.
			 * @since 1.27.0
			 */
			enableBusyIndicator : {type : "boolean", group : "Behavior", defaultValue : false}
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
			 * Toolbar of the Table (if not set it will be hidden)
			 */
			toolbar : {type : "sap.ui.core.Toolbar", multiple : false},

			/**
			 * Extension section of the Table (if not set it will be hidden)
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
			noData : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false}
		},
		associations : {

			/**
			 * Group By Column (experimental!)
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
			 * This event is triggered when the custom filter item of the column menu is pressed. The column on which the event was triggered is passed as parameter.
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
		designTime : true
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

		this._bBindingLengthChanged = false;
		this._mTimeouts = {};

		//Provide setter for old removed noDataText property to avoid crashes
		this.setNoDataText = function(sText) {
			if (!(this.getNoData() instanceof Control)) {
				this.setNoData(sText);
			}
			jQuery.sap.log.error("Function setNoDataText of control sap.ui.table.Table must not be used!");
			return this;
		};

		/**
		 * Updates the row binding contexts and synchronizes the row heights. This function will be called by updateRows
		 */
		this._lastCalledUpdateRows = 0;
		this._iBindingTimerDelay = 50;
		this._iMaxScrollbarHeight = 1000000; // maximum px height of an DOM element in FF/IE/Chrome
		this._iRowHeightsDelta = 0;
		this._iRenderedFirstVisibleRow = 0;

		var that = this;

		this._performUpdateRows = function(sReason) {
			// update only if control not marked as destroyed (could happen because updateRows is called during destroying the table)
			if (!that.bIsDestroyed) {
				that._lastCalledUpdateRows = Date.now();
				that._updateBindingContexts(undefined, undefined, sReason);

				if (!that._bInvalid) {
					// subsequent DOM updates are only required if there is no rendering to be expected

					// for TreeTable and AnalyticalTable
					if (that._updateTableContent) {
						that._updateTableContent();
					}

					that._getAccExtension().updateAccForCurrentCell(false);
					that._updateSelection();
					that._updateGroupHeader();

					var oTableSizes = that._collectTableSizes();
					that._updateRowHeader(oTableSizes.tableRowHeights);
					that._syncColumnHeaders(oTableSizes);

					if (TableUtils.isVariableRowHeightEnabled(that)) {
						that._iRowHeightsDelta = this._getRowHeightsDelta(oTableSizes.tableRowHeights);
						that._iRenderedFirstVisibleRow = this.getFirstVisibleRow();
					}

					if (that._bBindingLengthChanged) {
						that._updateVSb();
					}
					that._toggleVSb();

					if (TableUtils.isVariableRowHeightEnabled(that)) {
						var iScrollTop = 0;
						var oVSb = this.getDomRef(SharedDomRef.VerticalScrollBar);
						if (oVSb) {
							iScrollTop = oVSb.scrollTop;
						}
						that._adjustTablePosition(iScrollTop, oTableSizes.tableRowHeights);
					}
				}

				that._mTimeouts.bindingTimer = undefined;
				// Helper event for testing
				that.fireEvent("_rowsUpdated");
			}

			that._bBindingLengthChanged = false;
		};

		// basic selection model (by default the table uses multi selection)
		this._initSelectionModel(SelectionModel.MULTI_SELECTION);

		// minimum width of a table column in pixel:
		// should at least be larger than the paddings for cols and cells!
		this._iColMinWidth = 20;
		if ('ontouchstart' in document) {
			this._iColMinWidth = 88;
		}

		this._aTableHeaders = [];

		// columns to cells map
		this._aIdxCols2Cells = [];

		// flag whether the editable property should be inherited or not
		this._bInheritEditableToControls = false;

		// text selection for column headers?
		this._bAllowColumnHeaderTextSelection = false;

		// determine whether jQuery version is less than 1.8 (height and width behaves different!!)
		this._bjQueryLess18 = jQuery.sap.Version(jQuery.fn.jquery).compareTo("1.8") < 0;
		this._iDataRequestedCounter = 0;

		this._iBindingLength = 0;
		this._iTableRowContentHeight = 0;
		this._bFirstRendering = true;

		// F6 Handling is done in TableRenderer to make sure the table content gets the focus. The
		// Toolbar has its own F6 stop.
		// this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		this._bInvalid = true;

		this._bIsScrollVertical = null;
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
		TableExtension.enrich(this, TableAccExtension); //Must be registered after keyboard to reach correct delegate order
		this._bExtensionsInitialized = true;
	};


	/**
	 * Termination of the Table control
	 * @private
	 */
	Table.prototype.exit = function() {
		// destroy the child controls
		this._bExitCalled = true;

		if (this._oPaginator) {
			this._oPaginator.destroy();
		}

		this._resetRowTemplate();

		// destroy helpers
		this._detachExtensions();

		// cleanup
		this._cleanUpTimers();
		this._detachEvents();

		// selection model
		if (this._oSelection) {
			this._oSelection.destroy(); // deregisters all the handler(s)
			//Note: _oSelection is not nulled to avoid checks everywhere (in case table functions are called after the table destroy, see 1670448195)
		}
	};


	/**
	 * Detach table extensions
	 * @private
	 */
	Table.prototype._detachExtensions = function(){
		TableExtension.cleanup(this);
	};


	/**
	 * theme changed
	 * @private
	 */
	Table.prototype.onThemeChanged = function() {
		if (this.getDomRef()) {
			this.invalidate();
		}
	};

	/**
	 * Determines the row heights. For every row in the table the maximum height of all <code>tr</code> elements in the fixed and
	 * scrollable column areas is returned.
	 *
	 * @return {int[]} The row heights
	 * @private
	 */
	Table.prototype._collectRowHeights = function() {
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return [];
		}

		var iDefaultRowHeight = this._getDefaultRowHeight();
		var aRowsInFixedColumnsArea = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr");
		var aRowsInScrollableColumnsArea = oDomRef.querySelectorAll(".sapUiTableCtrlScroll > tbody > tr");
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
	 * Resets the height style property of all TR elements of the table
	 * @private
	 */
	Table.prototype._resetRowHeights = function() {
		var iRowHeight = this.getRowHeight();

		var sRowHeight = "";
		if (iRowHeight) {
			sRowHeight = iRowHeight + "px";
		}

		var oDomRef = this.getDomRef();
		if (oDomRef) {
			var aRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr, .sapUiTableCtrlScroll > tbody > tr");
			for (var i = 0; i < aRowItems.length; i++) {
				aRowItems[i].style.height = sRowHeight;
			}
		}
	};

	/**
	 * Determines the space available for the rows.
	 *
	 * @return {int} The available space in pixels.
	 * @private
	 */
	Table.prototype._determineAvailableSpace = function() {
		var oDomRef = this.getDomRef();

		if (oDomRef && oDomRef.parentNode) {
			var oCCnt = oDomRef.querySelector(".sapUiTableCCnt");

			if (oCCnt) {
				var iUsedHeight = oDomRef.scrollHeight - oCCnt.clientHeight;

				// For simplicity always add the default height of the horizontal scrollbar to the used height, even if it will not be visible.
				iUsedHeight += 18;

				return jQuery(oDomRef.parentNode).height() - iUsedHeight;
			}
		}

		return 0;
	};

	/**
	 * Determines all needed table size at one dedicated point,
	 * for avoiding layout thrashing through read/write UI operations.
	 * @private
	 */
	Table.prototype._collectTableSizes = function(aTableRowHeights) {
		var oSizes = {
			tableCtrlScrollWidth: 0,
			tableRowHdrScrWidth: 0,
			tableCtrlScrWidth: 0,
			tableHSbScrollLeft: 0,
			tableCtrlFixedWidth: 0,
			tableCntHeight: 0,
			tableCntWidth: 0,
			columnRowHeight: 0,
			columnRowOuterHeight: 0,
			invisibleColWidth: 0
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

		var oSapUiTableCtrlScroll = oDomRef.querySelector(".sapUiTableCtrlScroll");
		if (oSapUiTableCtrlScroll) {
			oSizes.tableCtrlScrollWidth = oSapUiTableCtrlScroll.clientWidth;
		}

		var oSapUiTableRowHdrScr = oDomRef.querySelector(".sapUiTableRowHdrScr");
		if (oSapUiTableRowHdrScr) {
			oSizes.tableRowHdrScrWidth = oSapUiTableRowHdrScr.clientWidth;
		}

		var oCtrlScrDomRef = oDomRef.querySelector(".sapUiTableCtrlScr");
		if (oCtrlScrDomRef) {
			oSizes.tableCtrlScrWidth = oCtrlScrDomRef.clientWidth;
		}

		var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
		if (oHsb) {
			oSizes.tableHSbScrollLeft = oHsb.scrollLeft;
		}

		var oCtrlFixed = oDomRef.querySelector(".sapUiTableCtrlFixed");
		if (oCtrlFixed) {
			oSizes.tableCtrlFixedWidth = oCtrlFixed.clientWidth;
		}

		var iFixedColumnCount = this.getProperty("fixedColumnCount");
		var aHeaderWidths = [];
		var iFixedHeaderWidthSum = 0;
		var aHeaderElements = oDomRef.querySelectorAll(".sapUiTableCtrlFirstCol > th:not(.sapUiTableColSel)");
		if (aHeaderElements) {
			var aColumns = this.getColumns();
			for (var i = 0; i < aHeaderElements.length; i++) {
				var iHeaderWidth = aHeaderElements[i].getBoundingClientRect().width;
				aHeaderWidths.push(iHeaderWidth);

				if (i < aColumns.length && aColumns[i] && !aColumns[i].getVisible()) {
					// the fixedColumnCount does not consider the visibility of the column, whereas the DOM only represents
					// the visible columns. In order to match both, the fixedColumnCount (aggregation) and fixedColumnCount
					// of the DOM, for each invisible column, 1 must be deducted from the fixedColumnCount (aggregation).
					iFixedColumnCount--;
				}

				if (i < iFixedColumnCount) {
					iFixedHeaderWidthSum += iHeaderWidth;
				}
			}
		}

		if (iFixedColumnCount > 0) {
			var iUsedHorizontalTableSpace = 0;
			var oRowHdrScr = this.getDomRef("sapUiTableRowHdrScr");
			if (oRowHdrScr) {
				iUsedHorizontalTableSpace += oRowHdrScr.clientWidth;
			}

			var oVsb = this.getDomRef("vsb");
			if (oVsb) {
				iUsedHorizontalTableSpace += oVsb.offsetWidth;
			}

			var bIgnoreFixedColumnCountCandidate = (oDomRef.clientWidth - iUsedHorizontalTableSpace < iFixedHeaderWidthSum);
			if (this._bIgnoreFixedColumnCount != bIgnoreFixedColumnCountCandidate) {
				this._bIgnoreFixedColumnCount = bIgnoreFixedColumnCountCandidate;
				this.invalidate();
			}
		}

		oSizes.headerWidths = aHeaderWidths;

		if (this.getSelectionMode() !== SelectionMode.None && this.getSelectionBehavior() !== SelectionBehavior.RowOnly) {
			var oFirstInvisibleColumn = oDomRef.querySelector(".sapUiTableCtrlFirstCol > th:first-child");
			if (oFirstInvisibleColumn) {
				oSizes.invisibleColWidth = oFirstInvisibleColumn.clientWidth;
			}
		}

		function getColumnSize(oColumn) {
			oSizes.columnRowHeight = Math.max(oColumn.clientHeight || 0, oSizes.columnRowHeight);
			oSizes.columnRowOuterHeight = Math.max(oColumn.offsetHeight || 0, oSizes.columnRowOuterHeight);
		}
		Array.prototype.forEach.call(oDomRef.querySelectorAll(".sapUiTableCol"), getColumnSize);

		if (!aTableRowHeights) {
			oSizes.tableRowHeights = this._collectRowHeights();
		} else {
			oSizes.tableRowHeights = aTableRowHeights;
		}


		return oSizes;
	};

	/**
	 * Synchronizes the row heights with the row header heights.
	 * @private
	 */
	Table.prototype._updateRowHeader = function(aRowItemHeights) {
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return;
		}
		var aRowHeaderItems = oDomRef.querySelectorAll(".sapUiTableRowHdr");

		var aFixedRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr");
		var aScrollRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlScroll > tbody > tr");

		var iLength = Math.max(aRowHeaderItems.length, aScrollRowItems.length, 0);
		for (var i = 0; i < iLength; i++) {
			var iRowItemHeight = aRowItemHeights[i];
			if (iRowItemHeight) {
				if (aRowHeaderItems[i]) {
					aRowHeaderItems[i].style.height = iRowItemHeight + "px";
				}

				if (aFixedRowItems[i]) {
					aFixedRowItems[i].style.height = iRowItemHeight + "px";
				}

				if (aScrollRowItems[i]) {
					aScrollRowItems[i].style.height = iRowItemHeight + "px";
				}
			}
		}
	};

	/**
	 * Rerendering handling
	 * @private
	 */
	Table.prototype.onBeforeRendering = function(oEvent) {
		if (oEvent && oEvent.isMarked("insertTableRows")) {
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
			if (this.getBinding("rows")) {
				this._adjustRows(this._calculateRowsToDisplay());
			} else {
				var that = this;
				this._mTimeouts.onBeforeRenderingAdjustRows = this._mTimeouts.onBeforeRenderingAdjustRows || window.setTimeout(function() {
						that._adjustRows(that._calculateRowsToDisplay());
						that._mTimeouts.onBeforeRenderingAdjustRows = undefined;
					}, 0);
			}
		} else if (!this._oRowTemplate && aRows.length > 0) {
			// Rows got invalidated, recreate rows with new template
			this._adjustRows(aRows.length);
		}
	};

	/**
	 * Rerendering handling
	 * @private
	 */
	Table.prototype.onAfterRendering = function(oEvent) {
		if (oEvent && oEvent.isMarked("insertTableRows")) {
			this.getDomRef(SharedDomRef.VerticalScrollBar).style.maxHeight = this._getVSbHeight() + "px";
			this._updateVSbRange();
			return;
		}

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
		if (!this._bAllowColumnHeaderTextSelection) {
			this._disableTextSelection($this.find(".sapUiTableColHdrCnt"));
		}

		this._bOnAfterRendering = false;

		// invalidate item navigation
		this._getKeyboardExtension().invalidateItemNavigation();

		if (this._bFirstRendering && this.getVisibleRowCountMode() == VisibleRowCountMode.Auto) {
			this._bFirstRendering = false;
			// Wait until everything is rendered (parent height!) before reading/updating sizes. Use a promise to make sure
			// to be executed before timeouts may be executed.
			Promise.resolve().then(this._updateTableSizes.bind(this, true));
		} else if (!this._mTimeouts.onAfterRenderingUpdateTableSizes) {
			this._updateTableSizes();
		}

		this._updateVSb(this._iScrollTop);
		if (this._iScrollLeft) {
			this.getDomRef(SharedDomRef.HorizontalScrollBar).scrollLeft = this._iScrollLeft;
		}
		this.getDomRef(SharedDomRef.VerticalScrollBar).style.maxHeight = this._getVSbHeight() + "px";
		this._updateVSbRange();

		this._updateGroupHeader();

		// for TreeTable and AnalyticalTable
		if (this._updateTableContent) {
			this._updateTableContent();
		}

		if (this.getBinding("rows")) {
			this.fireEvent("_rowsUpdated");
		}
	};

	Table.prototype.invalidate = function() {
		if (!this._ignoreInvalidateOfChildControls) {
			this._bInvalid = true;
			var vReturn = Control.prototype.invalidate.call(this);
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
	Table.prototype._updateTableSizes = function(bForceUpdateTableSizes, bSkipHandleRowCountMode) {
		this._mTimeouts.onAfterRenderingUpdateTableSizes = undefined;
		var oDomRef = this.getDomRef();

		if (this._bInvalid || !oDomRef) {
			return;
		}

		this._resetRowHeights();
		var aRowHeights = this._collectRowHeights();

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			this._iRowHeightsDelta = this._getRowHeightsDelta(aRowHeights);
		}

		var iRowContentSpace = 0;
		if (!bSkipHandleRowCountMode && this.getVisibleRowCountMode() == VisibleRowCountMode.Auto) {
			iRowContentSpace = this._determineAvailableSpace();
			// if no height is granted we do not need to do any further row adjustment or layout sync.
			// Saves time on initial start up and reduces flickering on rendering.
			if (this._handleRowCountModeAuto(iRowContentSpace) && !bForceUpdateTableSizes) {
				// updateTableSizes was already called by insertTableRows, therefore skip the rest of this function execution
				return;
			}
		}

		TableUtils.deregisterResizeHandler(this, "");

		// update Vertical Scrollbar before collection because it changes sizes
		this._toggleVSb();
		this._updateVSbTop();

		var oTableSizes = this._collectTableSizes(aRowHeights);

		if (this._mTimeouts.afterUpdateTableSizes) {
			window.clearTimeout(this._mTimeouts.afterUpdateTableSizes);
		}

		if (oTableSizes.tableCntHeight == 0 && oTableSizes.tableCntWidth == 0) {
			// the table has no size at all. This may be due to one of the parents has display:none. In order to
			// recognize when the parent size changes, the resize handler must be registered synchronously, otherwise
			// the browser may finish painting before the resize handler is registered
			TableUtils.registerResizeHandler(this, "", this._onTableResize.bind(this), true);

			return;
		}

		// Manipulation of UI Sizes
		this._updateRowHeader(oTableSizes.tableRowHeights);
		this._syncColumnHeaders(oTableSizes);
		this._determineVisibleCols(oTableSizes);
		if (!bSkipHandleRowCountMode) {
			this._setRowContentHeight(iRowContentSpace);
		}
		this._updateHSb(oTableSizes);

		var $this = this.$();
		$this.find(".sapUiTableNoOpacity").addBack().removeClass("sapUiTableNoOpacity");

		if (this._mTimeouts.afterUpdateTableSizes) {
			window.clearTimeout(this._mTimeouts.afterUpdateTableSizes);
		}

		var that = this;
		function registerResizeHandler() {
			TableUtils.registerResizeHandler(that, "", that._onTableResize.bind(that), true);
		}

		if ($this.closest(".sapUiLoSplitter").length) {
			// a special workaround for the splitter control due to concurrence issues
			registerResizeHandler();
		} else {
			// size changes of the parent happen due to adaptations of the table sizes. In order to first let the
			// browser finish painting, the resize handler is registered in a timeout. If this would be done synchronously,
			// updateTableSizes would always run twice.
			this._mTimeouts.afterUpdateTableSizes = window.setTimeout( registerResizeHandler, 0);
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

	/**
	 * update the table content (scrollbar, no data overlay, selection, row header, ...)
	 * @private
	 */
	Table.prototype._updateGroupHeader = function() {
		var that = this;
		// update the rows (TODO: generalize this for 1.6)
		if (this._modifyRow) {
			jQuery.each(this.getRows(), function(iIndex, oRow) {
				that._modifyRow(iIndex + that.getFirstVisibleRow(), oRow.$());
				that._modifyRow(iIndex + that.getFirstVisibleRow(), oRow.$("fixed"));
			});
		}
	};

	Table.prototype._updateFixedBottomRows = function() {
		var iFixedBottomRows = this.getFixedBottomRowCount();

		var oDomRef = this.getDomRef();
		if (oDomRef && iFixedBottomRows > 0) {
			var $sapUiTableFixedPreBottomRow = jQuery(oDomRef).find(".sapUiTableFixedPreBottomRow");
			$sapUiTableFixedPreBottomRow.removeClass("sapUiTableFixedPreBottomRow");

			var oBinding = this.getBinding("rows");

			if (oBinding) {
				var iVisibleRowCount = this.getVisibleRowCount();
				var bIsPreBottomRow = false;
				var aRows = this.getRows();
				var iFirstVisibleRow = this._getSanitizedFirstVisibleRow();
				for (var i = 0; i < aRows.length; i++) {
					var $rowDomRefs = aRows[i].getDomRefs(true);
					if (this._iBindingLength >= iVisibleRowCount) {
						bIsPreBottomRow = (i == iVisibleRowCount - iFixedBottomRows - 1);
					} else {
						bIsPreBottomRow = (iFirstVisibleRow + i) == (this._iBindingLength - iFixedBottomRows - 1) && (iFirstVisibleRow + i) < this._iBindingLength;
					}

					$rowDomRefs.row.toggleClass("sapUiTableFixedPreBottomRow", bIsPreBottomRow);
				}
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
	 * @return a reference on the table for chaining
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

	/**
	 * Shifts the vertical table position according to the delta of the estimated row heights to actual row heights.
	 * The table simulates the pixel-based scrolling by adjusting the vertical position of the scrolling areas.
	 * Additionally when there are rows inside which have a larger height than estimated, this will also be corrected
	 * and leads to a bigger vertical shift.
	 * @private
	 */
	Table.prototype._adjustTablePosition = function(iScrollTop, aRowHeights) {
		var bScrollPositionAtVirtualRange = iScrollTop < this._getVirtualScrollRange();
		var bVirtualScrollingNeeded = this._getRowCount() > this.getVisibleRowCount();

		// Only update table scroll simulation when table is not waiting for an update of rows
		if (bScrollPositionAtVirtualRange && this.getFirstVisibleRow() != this._iRenderedFirstVisibleRow) {
			return;
		}

		var iRowCorrection = null;
		if (bScrollPositionAtVirtualRange && bVirtualScrollingNeeded) {
			var iFirstRowHeight = aRowHeights[0];
			var iScrollingPixelsForRow = this._getScrollingPixelsForRow();
			var iPixelOnCurrentRow = iScrollTop - (this.getFirstVisibleRow() * iScrollingPixelsForRow);
			var iPercentOfFirstRowReached = iPixelOnCurrentRow / iScrollingPixelsForRow;
			iRowCorrection = Math.ceil(iPercentOfFirstRowReached * iFirstRowHeight);
			// Is scroll position over the first row height >> do nothing until performUpdateRows()
			if (iRowCorrection > iFirstRowHeight) {
				iRowCorrection = null;
			}
		} else if (this._iRowHeightsDelta >= 0) {
			// Correct the total amount of RowHeightsDelta over the overflow scroll area.
			var iScrollPositionAtOverflowRange = bVirtualScrollingNeeded ? iScrollTop - this._getVirtualScrollRange() : iScrollTop;
			iRowCorrection = (this._iRowHeightsDelta / this._getRowCorrectionScrollRange()) * iScrollPositionAtOverflowRange;
		}

		if (iRowCorrection != null && iRowCorrection > -1) {
			this.$().find(".sapUiTableCCnt").scrollTop(iRowCorrection);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFirstVisibleRow = function(iRowIndex, bOnScroll, bSupressEvent) {
		if (parseInt(iRowIndex, 10) < 0) {
			jQuery.sap.log.error("The index of the first visible row must be greater than or equal to 0."
								 + " The value has been set to 0.", this);
			iRowIndex = 0;
		}

		if (this.getNavigationMode() == sap.ui.table.NavigationMode.Paginator) {
			var iVisibleRowCount = this.getVisibleRowCount();
			// calculate page to display according to firstVisibleRow
			var iNewPage = this._paginatorCalculateTargetPage(iRowIndex, iVisibleRowCount);

			// check whether first visibleRow matches the first row on current page
			var iFirstVisibleRow = (iNewPage - 1) * iVisibleRowCount;
			if (iRowIndex != iFirstVisibleRow) {
				iRowIndex = iFirstVisibleRow;
				iNewPage = this._paginatorCalculateTargetPage(iRowIndex, iVisibleRowCount);
			}

			this._paginatorUpdate(iNewPage);
		}

		var bFirstVisibleRowChanged = this.getFirstVisibleRow() != iRowIndex;

		this.setProperty("firstVisibleRow", iRowIndex, true);

		// update the bindings:
		//  - prevent the rerendering
		//  - use the databinding fwk to update the content of the rows
		if (bFirstVisibleRowChanged && this.getBinding("rows") && !this._bRefreshing) {
			this.updateRows();
			if (!bOnScroll) {
				this._updateVSb();
			}
		}

		if (bFirstVisibleRowChanged && !bSupressEvent) {
			this.fireFirstVisibleRowChanged({firstVisibleRow: iRowIndex});
		}
		return this;
	};


	// enable calling 'bindAggregation("rows")' without a factory
	Table.getMetadata().getAggregation("rows")._doesNotRequireFactory = true;

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.bindRows = function(oBindingInfo, vTemplate, oSorter, aFilters) {
		// ensure old Table API compatibility (sPath, [oSorter], [aFilters])
		if (typeof oBindingInfo === "string" &&
			  (vTemplate instanceof Sorter || jQuery.isArray(oSorter) && oSorter[0] instanceof Filter) ) {
			aFilters = oSorter;
			oSorter = vTemplate;
			vTemplate = undefined;
		}

		return this.bindAggregation("rows", oBindingInfo, vTemplate, oSorter, aFilters);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype._bindAggregation = function(sName, sPath, oTemplate, oSorter, aFilters) {
		Element.prototype._bindAggregation.apply(this, arguments);
		var oBinding = this.getBinding("rows");
		if (sName === "rows" && oBinding) {
			oBinding.attachChange(this._onBindingChange, this);
		}

		// re-initialize the selection model, might be necessary in case the table gets "rebound"
		this._initSelectionModel(SelectionModel.MULTI_SELECTION);

		// currently only required for TreeBindings, will be relevant for ListBindings later
		if (oBinding && this.isTreeBinding("rows") && !oBinding.hasListeners("selectionChanged")) {
			oBinding.attachSelectionChanged(this._onSelectionChanged, this);
		}
		return this;
	};

	/**
	 * Initialises a new selection model for the Table instance.
	 * @param {sap.ui.model.SelectionModel.MULTI_SELECTION|sap.ui.model.SelectionModel.SINGLE_SELECTION} sSelectionMode the selection mode of the selection model
	 * @return {sap.ui.table.Table} the table instance for chaining
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
	 * handler for change events of the binding
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
			this._updateBindingLength();
			this.updateRows("unbindAggregation");
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
		if (this.getBinding("rows") && this.getBinding("rows").getLength() <= iVisibleRowCount) {
			this.setProperty("firstVisibleRow", 0);
		}
		this.setProperty("visibleRowCount", iVisibleRowCount);
		this._setRowContentHeight(iVisibleRowCount * this._getDefaultRowHeight());
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
		iBindingLength = iBindingLength || oBinding.getLength();

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
	 * Requests all required contexts for visibleRowCount from the binding
	 * @returns {sap.ui.model.Context[]} Array of row contexts
	 * @private
	 */
	Table.prototype._getRowContexts = function (iVisibleRows, bSkipSecondCall, sReason) {
		var bRecievedLessThanRequested = false;
		var aContexts = [];
		var oBinding = this.getBinding("rows");
		var iVisibleRowCount = iVisibleRows || this.getRows().length;
		if (!oBinding || iVisibleRowCount <= 0) {
			// without binding there are no contexts to be retrieved
			return [];
		}

		var iFirstVisibleRow = this.getFirstVisibleRow();

		var iFixedRowCount = this.getFixedRowCount();
		var iFixedBottomRowCount = this.getFixedBottomRowCount();
		var iReceivedLength = 0;
		var aTmpContexts;

		// because of the analytical table the fixed bottom row must always be requested separately as it is the grand
		// total row for the table.
		var iLength = iVisibleRowCount - iFixedBottomRowCount;
		var iMergeOffsetScrollRows = 0;
		var iMergeOffsetBottomRow = iLength;

		// if the threshold is not explicitly disabled by setting it to 0,
		// the default threshold should be at the the visibleRowCount.
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
		var iBindingLength = this._updateBindingLength(sReason);
		// iLength is the number of rows which shall get filled. It might be more than the binding actually has data.
		// Therefore Math.min is required to make sure to not request data again from the binding.
		bRecievedLessThanRequested = aTmpContexts.length < Math.min(iLength, iBindingLength - iFixedBottomRowCount);

		// if a paginator is used as navigation mode there may be a gap between the fixed bottom rows and the scrollable
		// rows of the table. This must be considered when requesting contexts to make sure the fixed bottom row contexts
		// are not requested twice. For scroll scenarios however it's not applicable and will brake when using TreeBindings
		// as the TreeBindingAdapters rely on larger getContexts calls in order to fully build up the tree structure
		if (this.getNavigationMode === NavigationMode.Paginator) {

			// only relevant for the very last page
			var iAdjustedLength = Math.min(iLength, (Math.max(iBindingLength - iFirstVisibleRow - iFixedBottomRowCount, 0)));

			if (iAdjustedLength < iLength) {
				iLength = iAdjustedLength;
				aTmpContexts = aTmpContexts.slice(0, iLength);
			}
		}

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

		if (bRecievedLessThanRequested && !bSkipSecondCall) {
			// check of binding length required
			var iFirstVisibleRowSanitized = this._getSanitizedFirstVisibleRow(true);
			if (iFirstVisibleRow != iFirstVisibleRowSanitized) {
				// get contexts again, this time with adjusted scroll position
				aContexts = this._getRowContexts(iVisibleRowCount, true);
				iReceivedLength = aContexts.length;
			}
		}

		if (!bSkipSecondCall) {
			var that = this;
			if (this._mTimeouts.getContextsSetBusy) {
				window.clearTimeout(this._mTimeouts.getContextsSetBusy);
			}
			this._mTimeouts.getContextsSetBusy = window.setTimeout(function() {
				that._setBusy({
					requestedLength: iFixedRowCount + iLength + iFixedBottomRowCount,
					receivedLength: iReceivedLength,
					contexts: aContexts,
					reason: sReason});
			}, 0);
		}

		return aContexts;
	};

	Table.prototype._getSanitizedFirstVisibleRow = function(bUpdate) {
		var sNavigationMode = this.getNavigationMode();
		var iVisibleRowCount = this.getVisibleRowCount();
		var iFirstVisibleRow = this.getFirstVisibleRow();
		// calculate the boundaries (at least 0 - max the row count - visible row count)
		iFirstVisibleRow = Math.max(iFirstVisibleRow, 0);
		if (sNavigationMode === NavigationMode.Scrollbar && this._iBindingLength > 0 && !TableUtils.isVariableRowHeightEnabled(this)) {
			iFirstVisibleRow = Math.min(iFirstVisibleRow, Math.max(this._iBindingLength - iVisibleRowCount, 0));
		} else if (sNavigationMode === NavigationMode.Paginator && this._oPaginator) {
			var iNewPage = this._paginatorCalculateTargetPage(iFirstVisibleRow, iVisibleRowCount);
			iFirstVisibleRow = (iNewPage - 1) * iVisibleRowCount;
			if (bUpdate) {
				this._paginatorUpdate(iNewPage);
			}
		}

		if (bUpdate) {
			this.setProperty("firstVisibleRow", iFirstVisibleRow, true);
		}

		return iFirstVisibleRow;
	};

	Table.prototype._paginatorCalculateTargetPage = function(iFirstVisibleRow, iVisibleRowCount) {
		if (this._oPaginator) {
			var iNewPage = 1;
			if (iFirstVisibleRow < this._iBindingLength) {
				iNewPage = Math.ceil((iFirstVisibleRow + 1) / iVisibleRowCount);
			}

			return iNewPage;
		}
	};

	Table.prototype._paginatorUpdate = function(iNewPage) {
		if (this._oPaginator && iNewPage !== this._oPaginator.getCurrentPage()) {
			this._oPaginator.setCurrentPage(iNewPage);
			if (this._oPaginator.getDomRef()) {
				this._oPaginator.rerender();
			}
		}
	};

	Table.prototype._updateBindingLength = function(sReason) {
		// get current binding length. If the binding length changes it must call updateAggregation (updateRows)
		// therefore it should be save to buffer the binding lenght here. This gives some performance advantage
		// especially for tree bindings using the TreeBindingAdapter where a tree structure must be created to
		// calculate the correct length.
		var oBinding = this.getBinding("rows");
		var iBindingLength = 0;
		if (oBinding) {
			iBindingLength = oBinding.getLength();
		}

		if (iBindingLength != this._iBindingLength) {
			this._iBindingLength = iBindingLength;
			this._onBindingLengthChange(sReason);
		}

		return iBindingLength;
	};

	Table.prototype._onBindingLengthChange = function(sReason) {
		// update visualization of fixed bottom row
		this._updateFixedBottomRows();
		this._toggleVSb();
		this._updateVSbRange();
		this._bBindingLengthChanged = true;
		// show or hide the no data container
		if (sReason != "skipNoDataUpdate") {
			// in order to have less UI updates, the NoData text should not be updated when the reason is refresh. When
			// refreshRows was called, the table will request data and later get another change event. In that turn, the
			// noData text gets updated.
			this._updateNoData();
		}
	};

	/**
	 * refresh rows
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
		if (sReason == ChangeReason.Refresh) {
			this._attachBindingListener();
		}
		this._bBusyIndicatorAllowed = true;
		// make getContexts call to force data load
		var sVisibleRowCountMode = this.getVisibleRowCountMode();
		if ((this.bOutput && sVisibleRowCountMode === VisibleRowCountMode.Auto) || sVisibleRowCountMode !== VisibleRowCountMode.Auto) {
			// the correct number of records to be requested can only be determined when the table row content height is known or if the
			// visible row count mode is not Auto
			var iRowsToDisplay = this._calculateRowsToDisplay();
			if (this.bOutput) {
				this.getBinding("rows").attachEventOnce("dataRequested", function() {
					// doing it in a timeout will allow the data request to be sent before the rows get created
					if (that._mTimeouts.refreshRowsAdjustRows) {
						window.clearTimeout(that._mTimeouts.refreshRowsAdjustRows);
					}
					that._mTimeouts.refreshRowsAdjustRows = window.setTimeout(function() {
						that._adjustRows(iRowsToDisplay, true);
					}, 0);
				});
			}
			// request contexts from binding
			var sUpdateReason;
			if (sReason == ChangeReason.Filter || sReason == ChangeReason.Sort) {
				sUpdateReason = "skipNoDataUpdate";
				this.setFirstVisibleRow(0);
			}
			this._updateBindingContexts(true, iRowsToDisplay, sUpdateReason);
		}
	};

	/**
	 * updates the rows - called internally by the updateAggregation function when
	 * anything in the model has been changed.
	 * @private
	 */
	Table.prototype.updateRows = function(sReason) {
		if (this._bExitCalled) {
			return;
		}

		// update busy indicator state
		this._setBusy(sReason ? {changeReason: sReason} : false);

		// if the binding length has changed due to filter or sorter, it may happened that the noData text was not updated in order
		// to avoid flickering of the table.
		// therefore we need to update the noData text here
		if (this._bBindingLengthChanged) {
			this._updateNoData();
		}

		// Rows should only be created/cloned when the number of rows can be determined. For the VisibleRowCountMode: Auto
		// this can only happen after the table control was rendered one. At this point in time we know how much space is
		// consumed by the table header, toolbar, footer... and we can calculate how much space is left for the table rows.
		var sVisibleRowCountMode = this.getVisibleRowCountMode();
		if ((this.getRows().length <= 0 || !this._oRowTemplate) && ((sVisibleRowCountMode == VisibleRowCountMode.Auto && this.bOutput) || sVisibleRowCountMode != VisibleRowCountMode.Auto)) {
			if (this._iTableRowContentHeight) {
				this._adjustRows(this._calculateRowsToDisplay());
			}
		}

		// when not scrolling we update also the scroll position of the scrollbar
		//if (this._oVSb.getScrollPosition() !== iStartIndex) {
			// TODO
			//this._updateAriaRowOfRowsText(true);
		//}

		// update the bindings only once the table is rendered
		if (!this.bIsDestroyed) {
			// update the bindings by using a delayed mechanism to avoid to many update
			// requests: by using the mechanism below it will trigger an update each 50ms
			// except if the reason is coming from the binding with reason "change" then
			// we do an immediate update instead of a delayed one

			var iBindingTimerDelay = (sReason == ChangeReason.Change || (!this._mTimeouts.bindingTimer && Date.now() - this._lastCalledUpdateRows > this._iBindingTimerDelay) || sReason == "unbindAggregation" ? 0 : this._iBindingTimerDelay);
			var that = this;
			if (iBindingTimerDelay == 0 && sReason) {
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
	 * attaches the required native event handlers
	 * @private
	 */
	Table.prototype._attachEvents = function() {
		var $this = this.$();

		// listen to the scroll events of the containers (for keyboard navigation)
		$this.find(".sapUiTableColHdrScr").scroll(jQuery.proxy(this._oncolscroll, this));
		$this.find(".sapUiTableCtrlScr").scroll(jQuery.proxy(this._oncntscroll, this));
		$this.find(".sapUiTableCtrlScrFixed").scroll(jQuery.proxy(this._oncntscroll, this));

		$this.find(".sapUiTableCtrlScrFixed, .sapUiTableColHdrFixed").on("scroll.sapUiTablePreventFixedAreaScroll", function(oEvent) {oEvent.target.scrollLeft = 0;});
		if (TableUtils.isVariableRowHeightEnabled(this)) {
			var oInnerScrollContainer = $this.find(".sapUiTableCtrlScr, .sapUiTableCtrlScrFixed, .sapUiTableRowHdrScr");
			oInnerScrollContainer.on("scroll.sapUiTableSyncScrollPosition", function(oEvent) {
				oInnerScrollContainer.scrollTop(oEvent.target.scrollTop);
			});
		}

		// sync row header > content (hover effect)
		$this.find(".sapUiTableRowHdr").hover(function() {
			jQuery(this).addClass("sapUiTableRowHvr");
			var iIndex = $this.find(".sapUiTableRowHdr").index(this);
			$this.find(".sapUiTableCtrlFixed > tbody > tr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlScroll > tbody > tr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
		}, function() {
			jQuery(this).removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlFixed > tbody > tr").removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlScroll > tbody > tr").removeClass("sapUiTableRowHvr");
		});

		// sync content fixed > row header (hover effect)
		$this.find(".sapUiTableCtrlFixed > tbody > tr").hover(function() {
			jQuery(this).addClass("sapUiTableRowHvr");
			var iIndex = $this.find(".sapUiTableCtrlFixed > tbody > tr").index(this);
			$this.find(".sapUiTableRowHdr").filter(":eq(" + (iIndex) + ")").addClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlScroll > tbody > tr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
		}, function() {
			jQuery(this).removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableRowHdr").removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlScroll > tbody > tr").removeClass("sapUiTableRowHvr");
		});

		// sync content scroll > row header (hover effect)
		$this.find(".sapUiTableCtrlScroll > tbody > tr").hover(function() {
			jQuery(this).addClass("sapUiTableRowHvr");
			var iIndex = $this.find(".sapUiTableCtrlScroll > tbody > tr").index(this);
			$this.find(".sapUiTableRowHdr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlFixed > tbody > tr").filter(":eq(" + iIndex + ")").addClass("sapUiTableRowHvr");
		}, function() {
			jQuery(this).removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableRowHdr").removeClass("sapUiTableRowHvr");
			$this.find(".sapUiTableCtrlFixed > tbody > tr").removeClass("sapUiTableRowHvr");
		});

		var $vsb = jQuery(this.getDomRef(SharedDomRef.VerticalScrollBar));
		var $hsb = jQuery(this.getDomRef(SharedDomRef.HorizontalScrollBar));
		$vsb.bind("scroll.sapUiTableVScroll", this.onvscroll.bind(this));
		$hsb.bind("scroll.sapUiTableHScroll", this.onhscroll.bind(this));
		$vsb.on("mousedown.sapUiTableVScrollClick", this.onVerticalScrollbarMouseDown.bind(this));

		if (Device.browser.firefox) {
			this._getScrollTargets().bind("MozMousePixelScroll.sapUiTableMouseWheel", this._onMouseWheel.bind(this));
		} else {
			this._getScrollTargets().bind("wheel.sapUiTableMouseWheel", this._onMouseWheel.bind(this));
		}

		if (sap.ui.getCore().getConfiguration().getAnimation()) {
			jQuery("body").bind('webkitTransitionEnd transitionend',
				jQuery.proxy(function(oEvent) {
					if (jQuery(oEvent.target).has($this).length > 0) {
						this._iDefaultRowHeight = undefined;
						this._updateTableSizes();
					}
			}, this));
		}

		TableExtension.attachEvents(this);
	};

	/**
	 * detaches the required native event handlers
	 * @private
	 */
	Table.prototype._detachEvents = function() {
		var $this = this.$();

		$this.find(".sapUiTableRowHdrScr").unbind();
		$this.find(".sapUiTableCtrl > tbody > tr").unbind();
		$this.find(".sapUiTableRowHdr").unbind();
		$this.find(".sapUiTableCtrlScrFixed, .sapUiTableColHdrFixed").unbind("scroll.sapUiTablePreventFixedAreaScroll");

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			$this.find(".sapUiTableCtrlScr, .sapUiTableCtrlScrFixed, .sapUiTableRowHdrScr").unbind("scroll.sapUiTableSyncScrollPosition");
		}

		var $vsb = jQuery(this.getDomRef(SharedDomRef.VerticalScrollBar));
		$vsb.unbind("scroll.sapUiTableVScroll");
		$vsb.off("mousedown.sapUiTableVScrollClick");

		var $hsb = jQuery(this.getDomRef(SharedDomRef.HorizontalScrollBar));
		$hsb.unbind("scroll.sapUiTableHScroll");

		var $scrollTargets = this._getScrollTargets();
		$scrollTargets.unbind("MozMousePixelScroll.sapUiTableMouseWheel");
		$scrollTargets.unbind("wheel.sapUiTableMouseWheel");

		var $body = jQuery(document.body);
		$body.unbind('webkitTransitionEnd transitionend');

		TableUtils.deregisterResizeHandler(this);
		TableExtension.detachEvents(this);
	};

	/**
	 * Collect the scroll wheel/touch targets needed for scrolling the table.
	 * @returns {*}
	 * @private
	 */
	Table.prototype._getScrollTargets = function() {
		var $ctrlScr = jQuery(this.getDomRef("sapUiTableCtrlScr"));
		var $rsz = jQuery(this.getDomRef("rsz"));
		var $ctrlScrFixed = jQuery(this.getDomRef("sapUiTableCtrlScrFixed"));
		var $rowHdrScr = jQuery(this.getDomRef("sapUiTableRowHdrScr"));
		return $ctrlScr.add($ctrlScrFixed).add($rowHdrScr).add($rsz);
	};

	/**
	 * cleanup the timers when not required anymore
	 * @private
	 */
	Table.prototype._cleanUpTimers = function() {

		for (var sKey in this._mTimeouts) {
			if (this._mTimeouts[sKey]) {
				clearTimeout(this._mTimeouts[sKey]);
				this._mTimeouts[sKey] = undefined;
			}
		}
	};

	// =============================================================================
	// PRIVATE TABLE STUFF :)
	// =============================================================================
	/**
	 * updates the horizontal scrollbar
	 * @private
	 */
	Table.prototype._updateHSb = function(oTableSizes) {
		// get the width of the container
		var $this = this.$();
		var iColsWidth = oTableSizes.tableCtrlScrollWidth;
		if (!!Device.browser.safari) {
			iColsWidth = Math.max(iColsWidth, this._getColumnsWidth(this.getFixedColumnCount()));
		}

		// add the horizontal scrollbar
		if (iColsWidth > oTableSizes.tableCtrlScrWidth) {
			// show the scrollbar
			if (!$this.hasClass("sapUiTableHScr")) {
				$this.addClass("sapUiTableHScr");

				if (!!Device.browser.safari) {
					var $sapUiTableColHdr = $this.find(".sapUiTableCtrlScroll, .sapUiTableColHdrScr > .sapUiTableColHdr");
					// min-width on table elements does not work for safari
					if (this._bjQueryLess18) {
						$sapUiTableColHdr.width(iColsWidth);
					} else {
						$sapUiTableColHdr.outerWidth(iColsWidth);
					}
				}
			}

			var iScrollPadding = oTableSizes.tableCtrlFixedWidth;
			if ($this.find(".sapUiTableRowHdrScr").length > 0) {
				iScrollPadding += oTableSizes.tableRowHdrScrWidth;
			}

			if (this.getRows().length > 0) {
				var $sapUiTableHSb = $this.find(".sapUiTableHSb");
				if (this._bRtlMode) {
					$sapUiTableHSb.css('margin-right', iScrollPadding + 'px');
				} else {
					$sapUiTableHSb.css('margin-left', iScrollPadding + 'px');
				}
			}

			var oHSbContent = this.getDomRef("hsb-content");
			if (oHSbContent) {
				oHSbContent.style.width = iColsWidth + "px";
			}
		} else {
			// hide the scrollbar
			if ($this.hasClass("sapUiTableHScr")) {
				$this.removeClass("sapUiTableHScr");
				if (!!Device.browser.safari) {
					// min-width on table elements does not work for safari
					$this.find(".sapUiTableCtrlScroll, .sapUiTableColHdr").css("width", "");
				}
			}
		}
	};

	/**
	 * Update the vertical scrollbar position
	 * @private
	 */
	Table.prototype._updateVSb = function(iScrollTop) {
		// move the vertical scrollbar to the scrolling table only
		var oVSb = this.getDomRef(SharedDomRef.VerticalScrollBar);
		if (!oVSb) {
			return;
		}

		if (iScrollTop === undefined) {
			iScrollTop = Math.ceil(this.getFirstVisibleRow() * this._getScrollingPixelsForRow());
		}

		this._updateVSbTop();

		oVSb.scrollTop = iScrollTop;
	};

	Table.prototype._updateVSbTop = function() {
		var oVSb = this.getDomRef(SharedDomRef.VerticalScrollBar);
		var oTableCCnt = this.getDomRef("tableCCnt");

		if (oVSb && oTableCCnt) {
			var iTop = oTableCCnt.offsetTop;
			var iFixedRows = this.getFixedRowCount();
			if (iFixedRows > 0) {
				iTop += this._iVsbTop;
			}
			oVSb.style.top = iTop + "px";
		}
	};

	/**
	 * Updates the vertical scroll bar range (inner element height)
	 * @private
	 */
	Table.prototype._updateVSbRange = function() {
		var oVSb = this.getDomRef(SharedDomRef.VerticalScrollBar);
		if (!oVSb) {
			return;
		}

		jQuery(this.getDomRef("vsb-content")).height(this._getTotalScrollRange());
	};

	/**
	 * Toggles the visibility of the Vertical Scroll Bar.
	 * @private
	 */
	Table.prototype._toggleVSb = function() {
		var $this = this.$();
		var oBinding = this.getBinding("rows");
		if (this._oPaginator && this.getNavigationMode() === NavigationMode.Paginator) {
			var iNumberOfPages = 0;
			var iCurrentPage = 0;

			if (oBinding) {
				// update the paginator (set the first visible row property)
				var iVisibleRowCount = this.getVisibleRowCount();
				iNumberOfPages = Math.ceil((this._iBindingLength || 0) / iVisibleRowCount);
				var iPage = Math.min(iNumberOfPages, Math.ceil((this.getFirstVisibleRow() + 1) / iVisibleRowCount));
				this.setProperty("firstVisibleRow", (Math.max(iPage,1) - 1) * iVisibleRowCount, true);
				iCurrentPage = iPage;
			}

			this._oPaginator.setNumberOfPages(iNumberOfPages);
			this._oPaginator.setCurrentPage(iCurrentPage);

			if (this._oPaginator.getDomRef()) {
				this._oPaginator.rerender();
			}

			if (this.getDomRef()) {
				$this.removeClass("sapUiTableVScr");
			}
		} else if (this.getDomRef()) {
			// in case of Scrollbar Mode show/hide the scrollbar depending whether it is needed.
			var isVSbRequired = this._isVSbRequired();
			if (!isVSbRequired) {
				// reset scroll position to zero when Scroll Bar disappears
				this._updateVSb(0);
			}
			$this.toggleClass("sapUiTableVScr", isVSbRequired);
		}
	};

	/**
	 * Indicates whether a Vertical Scroll Bar is needed.
	 * @private
	 * @returns {Boolean} true/false when Vertical Scroll Bar is required
	 */
	Table.prototype._isVSbRequired = function() {
		if (this.getNavigationMode() === NavigationMode.Scrollbar) {
			if (this._iRowHeightsDelta > 0 || (this.getBinding("rows") && this._iBindingLength > this.getVisibleRowCount())) {
				return true;
			}
		}

		return false;
	};

	/**
	 * updates the binding contexts of the currently visible controls
	 * @param {boolean} bSuppressUpdate if true, only context will be requested but no binding context set
	 * @param {int} iRowCount number of rows to be updated and number of contexts to be requested from binding
	 * @param {String} sReason reason for the update; used to control further lifecycle
	 * @private
	 */
	Table.prototype._updateBindingContexts = function(bSuppressUpdate, iRowCount, sReason) {
		var aRows = this.getRows(),
			oBinding = this.getBinding("rows"),
			oBindingInfo = this.mBindingInfos["rows"],
			aContexts;

		// fetch the contexts from the binding
		if (oBinding) {
			aContexts = this._getRowContexts(iRowCount, false, sReason);
		}

		if (!bSuppressUpdate) {
			var iFirstVisibleRow = this.getFirstVisibleRow();
			var bExecuteCallback = typeof this._updateTableCell === "function";
			// row heights must be reset to make sure that rows can shrink if they may have smaller content. The content
			// shall control the row height.
			this._resetRowHeights();
			for (var iIndex = aRows.length - 1; iIndex >= 0; iIndex--) {
				var oContext = aContexts ? aContexts[iIndex] : undefined;
				var oRow = aRows[iIndex];
				if (oRow) {
					//calculate the absolute row index, used by the Tree/AnalyticalTable to find the rendering infos for this row
					var iAbsoluteRowIndex = iFirstVisibleRow + iIndex;
					this._updateRowBindingContext(oRow, oContext, oBindingInfo && oBindingInfo.model, iAbsoluteRowIndex, bExecuteCallback, oBinding);
				}
			}
		}
	};

	/**
	 * updates the binding context a row
	 * @param {sap.ui.table.Row} oRow row to update
	 * @param {sap.ui.model.Context} oContext binding context of the row
	 * @param {String} sModelName name of the model
	 * @param {int} iAbsoluteRowIndex index of row considering the scroll position
	 * @param {boolean} bExecuteCallback if true this._updateTableCell must be implemented and will be executed
	 * @private
	 */
	Table.prototype._updateRowBindingContext = function(oRow, oContext, sModelName, iAbsoluteRowIndex, bExecuteCallback, oBinding) {
		// check for a context object (in case of grouping there could be custom context objects)
		oRow.setRowBindingContext(oContext, sModelName, oBinding);

		if (bExecuteCallback) {
			// call _updateTableCell on table control. _updateTableCell will be called on cell controls inside Row.setBindingContext
			var aCells = oRow.getCells();
			for (var i = 0, l = aCells.length; i < l; i++) {
				if (aCells[i]) {
					this._updateTableCell(aCells[i], oContext, aCells[i].$().closest("td"), iAbsoluteRowIndex);
				}
			}
		}
	};

	/**
	 * show or hide the no data container
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
	 * determines the currently visible columns (used for simply updating only the
	 * controls of the visible columns instead of the complete row!)
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
		if (this._iNewColPos === undefined && iIndex >= 0) {
			this._aSortedColumns.splice(iIndex, 1);
		}
		this._resetRowTemplate();
		return oResult;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeAllColumns = function() {
		var oResult = this.removeAllAggregation('columns');
		this._aSortedColumns = [];
		this._resetRowTemplate();
		return oResult;
	};

	/*
	 * @see JSDoc generated by SAPUI5 contdrol API generator
	 */
	Table.prototype.destroyColumns = function() {
		var oResult = this.destroyAggregation('columns');
		this._aSortedColumns = [];
		this._resetRowTemplate();
		return oResult;
	};


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.addColumn = function (oColumn, bSuppressInvalidate) {
		this.addAggregation('columns', oColumn, bSuppressInvalidate);
		this._resetRowTemplate();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.insertColumn = function (oColumn, iIndex, bSuppressInvalidate) {
		this.insertAggregation('columns', oColumn, iIndex, bSuppressInvalidate);
		this._resetRowTemplate();
		return this;
	};

	/**
	 * returns the count of rows when bound or 0
	 * @private
	 */
	Table.prototype._getRowCount = function() {
		return this._iBindingLength;
	};

	/**
	 * returns the count of rows which can ca selected when bound or 0
	 * @private
	 */
	Table.prototype._getSelectableRowCount = function() {
		var oBinding = this.getBinding("rows");
		return this._iBindingLength || (oBinding ? oBinding.getLength() : 0);
	};


	/**
	 * Returns the current top scroll position of the scrollbar (row number)
	 * @private
	 */
	Table.prototype._getFirstVisibleRowByScrollTop = function(iScrollTop) {
		if (TableUtils.isVariableRowHeightEnabled(this) && this._getRowCount() < this.getVisibleRowCount()) {
			return 0;
		} else {
			// If there are 2 scrollable rows of 50 pixels height, the scrollbar should have a scroll range of 100 pixels. If zoomed in Chrome,
			// the heights of elements can be slightly lower (below 1 pixel) than their original value, so the scroll range could be only 99.2 pixels.
			// In this case the scrolling logic would not determine that the rows should be scrolled to the end.
			// Therefore we need to check if the scroll position is at its maximum by reading the DOM.
			if (Device.browser.chrome && window.devicePixelRatio != 1) {
				var oVSb = this.getDomRef(SharedDomRef.VerticalScrollBar);

				if (oVSb != null) {
					var nDeviationFromMaximumScrollPosition = this._getVirtualScrollRange() - oVSb.scrollTop;

					// When there is less than 1 pixel left until the calculated value for the maximum scroll position is reached, we can
					// consider the table to be scrolled to the end.
					if (nDeviationFromMaximumScrollPosition < 1) {
						return this._getMaxRowIndex();
					}
				}
			}

			var iFirstVisibleRow = Math.floor(iScrollTop / this._getScrollingPixelsForRow());
			return Math.min(this._getMaxRowIndex(), iFirstVisibleRow);
		}
		return 0;
	};

	/**
	 * Returns the amount of pixels which are to needed to scroll one data row
	 * @private
	 */
	Table.prototype._getScrollingPixelsForRow = function() {
		return this._getVirtualScrollRange() / Math.max(1, this._getMaxRowIndex());
	};

	/**
	 * Returns the vertical scroll bar height
	 * @private
	 */
	Table.prototype._getVSbHeight = function() {
		return this._getScrollableRowCount() * this._getDefaultRowHeight();
	};

	/**
	 * Returns the amount of scrollable rows
	 * @private
	 */
	Table.prototype._getScrollableRowCount = function() {
		return Math.max(1, this.getVisibleRowCount() - this.getFixedRowCount() - this.getFixedBottomRowCount());
	};

	/**
	 * Returns the delta of the sum of the actual height of all rows, compared with sum of estimated row heights
	 * @private
	 */
	Table.prototype._getRowHeightsDelta = function(aRowHeights) {
		var iEstimatedViewportHeight = this._getDefaultRowHeight() * this.getVisibleRowCount();
		// Case: Not enough data to fill all available rows, only sum used rows.
		if (this.getVisibleRowCount() >= this._getRowCount()) {
			aRowHeights = aRowHeights.slice(0, this._getRowCount());
		}
		var iRowHeightsDelta = aRowHeights.reduce(function(a, b) { return a + b; }, 0) - iEstimatedViewportHeight;
		if (iRowHeightsDelta > 0) {
			iRowHeightsDelta = Math.ceil(iRowHeightsDelta);
		}
		return Math.max(0, iRowHeightsDelta);
	};

	/**
	 * Calculates the total scroll range for the vertical scroll bar
	 * @private
	 */
	Table.prototype._getTotalScrollRange = function() {
		var iRowCount = Math.max(this._getRowCount(), this.getVisibleRowCount() + 1);
		var iScrollbarRange = this._getDefaultRowHeight() * iRowCount;
		return Math.min(this._iMaxScrollbarHeight, iScrollbarRange);
	};

	/**
	 * Returns the amount of pixels which are used for virtual scrolling (from the total scroll range)
	 * @private
	 */
	Table.prototype._getVirtualScrollRange = function() {
		var iMaxScrollRange = this._getTotalScrollRange() - this._getVSbHeight();
		if (TableUtils.isVariableRowHeightEnabled(this)) {
			iMaxScrollRange = iMaxScrollRange - this._iRowHeightsDelta;
		}
		return Math.max(1, iMaxScrollRange);
	};

	/**
	 * Returns the amount of pixels which are used for the correction of the row heights delta (from total  scroll range)
	 * @private
	 */
	Table.prototype._getRowCorrectionScrollRange = function() {
		var iScrollOverflowRange = this._getTotalScrollRange() - this._getVSbHeight();
		if (this._getRowCount() > this.getVisibleRowCount()) {
			iScrollOverflowRange -= this._getVirtualScrollRange();
		}
		return Math.max(1, iScrollOverflowRange);
	};

	/**
	 * Returns the maximum row index to which can be scrolled to
	 * @private
	 */
	Table.prototype._getMaxRowIndex = function() {
		if (TableUtils.isVariableRowHeightEnabled(this)) {
			if (this.getVisibleRowCount() > this._getRowCount()) {
				return this._getRowCount();
			} else {
				return Math.max(0, this._getRowCount() - this.getVisibleRowCount() - 1);
			}
		} else {
			return Math.max(0, this._getRowCount() - this.getVisibleRowCount());
		}
	};

	/**
	 * returns the count of visible columns
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
	 * @param sCSSSize
	 * @param bReturnWithUnit
	 * @returns {string|number} Converted CSS value in pixel
	 * @private
	 */
	Table.prototype._CSSSizeToPixel = function(sCSSSize, bReturnWithUnit) {
		var sPixelValue = this._iColMinWidth;

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

		this._updateTableSizes();
	};

	Table.prototype._handleRowCountModeAuto = function(iTableAvailableSpace) {
		var oBinding = this.getBinding("rows");
		if (oBinding && this.getRows().length > 0) {
			return this._executeAdjustRows(iTableAvailableSpace);
		} else {
			var that = this;
			var bReturn = !this._mTimeouts.handleRowCountModeAutoAdjustRows;
			var iBusyIndicatorDelay = that.getBusyIndicatorDelay();
			var bEnableBusyIndicator = this.getEnableBusyIndicator();
			if (oBinding && bEnableBusyIndicator) {
				that.setBusyIndicatorDelay(0);
				that.setBusy(true);
			}

			if (iTableAvailableSpace) {
				this._setRowContentHeight(iTableAvailableSpace);
			}

			this._mTimeouts.handleRowCountModeAutoAdjustRows = this._mTimeouts.handleRowCountModeAutoAdjustRows || window.setTimeout(function() {
					if (!that._executeAdjustRows()) {
						// table sizes were not updated by AdjustRows
						that._updateTableSizes(false, true);
					}
					that._mTimeouts.handleRowCountModeAutoAdjustRows = undefined;
					if (bEnableBusyIndicator) {
						that.setBusy(false);
						that.setBusyIndicatorDelay(iBusyIndicatorDelay);
					}
				}, 0);
			return bReturn;
		}
	};

	Table.prototype._executeAdjustRows = function(iTableAvailableSpace) {
		iTableAvailableSpace = iTableAvailableSpace || this._determineAvailableSpace();

		//if visibleRowCountMode is auto change the visibleRowCount according to the parents container height
		var iRows = this._calculateRowsToDisplay(iTableAvailableSpace);
		// if minAutoRowCount has reached, table should use block this height.
		// In case row > minAutoRowCount, the table height is 0, because ResizeTrigger must detect any changes of the table parent.
		if (iRows == this._determineMinAutoRowCount()) {
			this.$().height("auto");
		} else {
			this.$().height("0px");
		}

		return this._adjustRows(iRows);
	};

	/**
	 * Synchronizes the <th> width of the table, with the rendered header divs.
	 * @private
	 */
	Table.prototype._syncColumnHeaders = function(oTableSizes) {
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			// _syncColumnHeaders gets called async, there might be no DomRef anymore
			return;
		}
		var $this = this.$();

		var aHeaderWidths = oTableSizes.headerWidths;
		var iFixedColumns = this.getFixedColumnCount();
		var aVisibleColumns = this._getVisibleColumns();
		if (aVisibleColumns.length == 0) {
			return;
		}

		// Select only table headers (identified by data-sap-ui-headcolindex attribute). Not the row header.
		var $colHeaderContainer = $this.find(".sapUiTableColHdr");
		var $colHdrScr = $this.find(".sapUiTableColHdrScr");
		var $cols = $colHeaderContainer.find(".sapUiTableCol");
		var $tableHeaders = $this.find(".sapUiTableCtrlFirstCol > th:not(.sapUiTableColSel)");
		this._aTableHeaders = $tableHeaders;

		// Create map with source table headers and their corresponding resizers.
		var mHeaders = {};

		// Traverse the source table headers, which are needed to determine the column head width
		$tableHeaders.each(function(iIndex, oElement) {
			var iHeadColIndex = oElement.getAttribute("data-sap-ui-headcolindex");
			var iHeaderWidth = aHeaderWidths[iIndex];

			// set width of target column div
			var iTargetWidth;
			var oVisibleColumn = aVisibleColumns[iIndex];
			if (oVisibleColumn) {
				iTargetWidth = iHeaderWidth;
			}

			// for the first column also calculate the width of the hidden column
			if (iIndex == 0 || iIndex == iFixedColumns) {
				iTargetWidth += Math.max(0, oTableSizes.invisibleColWidth);
			}

			// apply the width of the column
			var	vHeaderSpan = aVisibleColumns[iIndex] ? aVisibleColumns[iIndex].getHeaderSpan() : 1,
				aHeaderData = [],
				aSpans;

			if (vHeaderSpan) {
				// vHeaderSpan can be an array for multi column header rows purpose.
				if (!jQuery.isArray(vHeaderSpan)) {
					vHeaderSpan = [vHeaderSpan];
				}
				jQuery.each(vHeaderSpan, function(iSpanIndex, iSpan) {
					vHeaderSpan[iSpanIndex] = Math.max(iSpan, 1);
				});
				aSpans = vHeaderSpan;
			} else {
				aSpans = [1];
			}

			for (var i = 0; i < aSpans.length; i++) {
				aHeaderData[i] = {
					width: iTargetWidth,
					span: 1
				};

				for (var j = 1; j < aSpans[i]; j++) {
					var oHeader = $tableHeaders[iIndex + j];
					if (oHeader) {
						aHeaderData[i].width += aHeaderWidths[iIndex + j];
						aHeaderData[i].span = aSpans[i];
					}
				}
			}

			if (oVisibleColumn) {
				mHeaders[iHeadColIndex] = {
					domRefColumnTh: oElement,
					domRefColumnDivs: [],
					aHeaderData: aHeaderData
				};
			}
		});

		var that = this;
		// Map target column header divs to corresponding source table header.
		$cols.each(function(iIndex, oElement) {
			var iColIndex = parseInt(oElement.getAttribute("data-sap-ui-colindex"), 10);
			var mHeader = mHeaders[iColIndex];
			if (mHeader) {
				mHeader.domRefColumnDivs.push(oElement);
			} else {
				jQuery.sap.log.error("Inconsistent DOM / Control Tree combination", that);
			}
		});

		jQuery.each(mHeaders, function(iIndex, mHeader) {
			for (var i = 0; i < mHeader.domRefColumnDivs.length; i++) {
				var oHeaderData = mHeader.aHeaderData[0];
				if (mHeader.aHeaderData[i]) {
					oHeaderData = mHeader.aHeaderData[i];
				}
				if (mHeader.domRefColumnDivs[i]) {
					mHeader.domRefColumnDivs[i].style.width = oHeaderData.width + "px";
					mHeader.domRefColumnDivs[i].setAttribute("data-sap-ui-colspan", oHeaderData.span);
				} else {
					jQuery.sap.log.error("Inconsistent DOM / Control Tree combination", that);
				}
			}
		});

		// Table Column Height Calculation
		// we change the height of the cols, col header and the row header to auto to
		// find out whether to use the height of a cell or the min height of the col header.
		var bHasColHdrHeight = this.getColumnHeaderHeight() > 0;
		if (!bHasColHdrHeight) {
			// Height of one row within the header
			// avoid half pixels
			$cols.each(function(index, item) {
				item.style.height = oTableSizes.columnRowOuterHeight + "px";
			});

			var oColHdrCnt = oDomRef.querySelector(".sapUiTableColHdrCnt");
			if (oColHdrCnt) {
				oColHdrCnt.style.height = Math.floor(oTableSizes.columnRowHeight * TableUtils.getHeaderRowCount(this)) + "px";
			}
		}

		// Sync width of content scroll area to header scroll area
		$colHdrScr.each(function(index, item) {
			item.style.width = oTableSizes.tableCtrlScrWidth + "px";
		});
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
	 * will be called by the vertical scrollbar. updates the visualized data by
	 * applying the first visible (scrollpos) row from the vertical scrollbar
	 * @private
	 */
	Table.prototype.onvscroll = function(oEvent) {
		var that = this;
		// for interaction detection
		jQuery.sap.interaction.notifyScrollEvent && jQuery.sap.interaction.notifyScrollEvent(oEvent);

		if (this._bIsScrolledByKeyboard) {
			return;
		}

		// do not scroll in action mode!
		this._getKeyboardExtension().setActionMode(false);

		/**
		 * Adjusts the first visible row to the new horizontal scroll position.
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		function updateVisibleRow(oTable) {
			var oVSb = oTable.getDomRef(SharedDomRef.VerticalScrollBar);

			if (!oVSb) {
				return;
			}

			var iScrollTop = oVSb.scrollTop;

			if (TableUtils.isVariableRowHeightEnabled(oTable)) {
				oTable._iScrollTop = iScrollTop;
				oTable._adjustTablePosition(iScrollTop, oTable._collectRowHeights());
			}

			oTable.setFirstVisibleRow(oTable._getFirstVisibleRowByScrollTop(iScrollTop), true);
		}

		if (this._bLargeDataScrolling && !this._bIsScrolledByWheel) {
			window.clearTimeout(this._mTimeouts.scrollUpdateTimerId);
			this._mTimeouts.scrollUpdateTimerId = window.setTimeout(function() {
				updateVisibleRow(that);
				that._mTimeouts._sScrollUpdateTimerId = null;
			}, 300);
		} else {
			updateVisibleRow(this);
		}
		this._bIsScrolledByWheel = false;
	};

	/**
	 * will be called by the paginator. updates the visualized data by
	 * applying the first visible (scrollpos) row from the vertical scrollbar
	 * @private
	 */
	Table.prototype.onpscroll = function(oEvent) {
		// for interaction detection
		jQuery.sap.interaction.notifyScrollEvent && jQuery.sap.interaction.notifyScrollEvent(oEvent);
		// do not scroll in action mode!
		this._getKeyboardExtension().setActionMode(false);

		var iFirstVisibleRow = 0;
		if (this.getNavigationMode() === NavigationMode.Paginator) {
			iFirstVisibleRow = (((this._oPaginator.getCurrentPage() || 1) - 1) * this.getVisibleRowCount());
		}

		this.setFirstVisibleRow(iFirstVisibleRow, true);
	};

	/**
	 * Handler for mousewheel event on scroll areas.
	 * @private
	 */
	Table.prototype._onMouseWheel = function(oEvent) {
		var oOriginalEvent = oEvent.originalEvent;
		var bIsHorizontal = oOriginalEvent.shiftKey;
		var iScrollDelta = 0;
		if (Device.browser.firefox) {
			iScrollDelta = oOriginalEvent.detail;
		} else {
			if (bIsHorizontal) {
				iScrollDelta = oOriginalEvent.deltaX;
			} else {
				iScrollDelta = oOriginalEvent.deltaY;
			}
		}

		if (bIsHorizontal) {
			var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
			if (oHsb) {
				oHsb.scrollLeft = oHsb.scrollLeft + iScrollDelta;
			}
		} else {
			var oVsb = this.getDomRef(SharedDomRef.VerticalScrollBar);
			if (oVsb) {
				this._bIsScrolledByWheel = true;
				this._bIsScrolledByKeyboard = false;
				oVsb.scrollTop = oVsb.scrollTop + iScrollDelta;
			}
		}

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	/**
	 * Will be called when the vertical scrollbar is clicked.
	 * @param {MouseEvent} oEvent The event object.
	 */
	Table.prototype.onVerticalScrollbarMouseDown = function(oEvent) {
		this._bIsScrolledByWheel = false;
		this._bIsScrolledByKeyboard = false;
	};

	/**
	 * sync the column header and content
	 * @private
	 */
	Table.prototype._syncHeaderAndContent = function(oTableSizes) {
		if (!this._bSyncScrollLeft) {
			this._bSyncScrollLeft = true;
			// synchronize the scroll areas
			var $this = this.$();
			var iHSbScrollLeft = oTableSizes.tableHSbScrollLeft;
			$this.find(".sapUiTableColHdrScr").scrollLeft(iHSbScrollLeft);
			$this.find(".sapUiTableCtrlScr").scrollLeft(iHSbScrollLeft);
			this._bSyncScrollLeft = false;
		}
	};

	/**
	 * Will be called when the horizontal scrollbar is used. Since the table does
	 * not render/update the data of all columns (only the visible ones) in case
	 * of scrolling horizontally we need to update the content of the columns which
	 * became visible.
	 * @private
	 */
	Table.prototype.onhscroll = function(oEvent) {
		jQuery.sap.interaction.notifyScrollEvent && jQuery.sap.interaction.notifyScrollEvent(oEvent);

		if (!this._bOnAfterRendering) {
			// The scroll event is fired multiple times from start to end of one horizontal scrolling action. The event is fired
			// the first time right after scrolling was started.
			// Scrolling is interrupted when syncing header and content and is therefore performed only over a short distance.
			// The timeout is used to overcome this issue, so syncing is performed only after the last occurrence of a scroll event.
			if (this._mTimeouts.hScrollUpdateTimer) {
				window.clearTimeout(this._mTimeouts.hScrollUpdateTimer);
			}
			this._mTimeouts.hScrollUpdateTimer = window.setTimeout(function() {
				this._iScrollLeft = this.getDomRef(SharedDomRef.HorizontalScrollBar).scrollLeft;
				var oTableSizes = this._collectTableSizes();
				this._syncHeaderAndContent(oTableSizes);
				this._determineVisibleCols(oTableSizes);
			}.bind(this), 50);
		}
	};

	/**
	 * when navigating within the column header we need to synchronize the content
	 * area with the position (scrollLeft) of the column header.
	 * @private
	 */
	Table.prototype._oncolscroll = function() {
		if (!this._bSyncScrollLeft) {
			var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
			if (oHsb) {
				var oColHdrScr = this.getDomRef().querySelector(".sapUiTableColHdrScr");
				var iScrollLeft = 0;
				if (oColHdrScr) {
					iScrollLeft = oColHdrScr.scrollLeft;
				}
				oHsb.scrollLeft = iScrollLeft;
			}
		}
	};

	/**
	 * when navigating within the content area we need to synchronize the column
	 * header with the position (scrollLeft) of the content area.
	 * @private
	 */
	Table.prototype._oncntscroll = function() {
		if (!this._bSyncScrollLeft) {
			var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
			if (oHsb) {
				var oColHdrScr = this.getDomRef().querySelector(".sapUiTableCtrlScr");
				oHsb.scrollLeft = oColHdrScr.scrollLeft;
			}
		}
	};

	/**
	 * handles the cell contextmenu eventing of the table, open the menus for cell, group header and column header
	 * @private
	 */
	Table.prototype.oncontextmenu = function(oEvent) {
		var $Target = jQuery(oEvent.target);
		var $Header = $Target.closest('.sapUiTableCol');
		if ($Header.length > 0) {
			var oColumn = sap.ui.getCore().byId($Header.attr("data-sap-ui-colid"));
			if (oColumn) {
				oColumn._openMenu($Header[0], false);
			}
			oEvent.preventDefault();
		} else {
			if (this._findAndfireCellEvent(this.fireCellContextmenu, oEvent, this._oncellcontextmenu)) {
				oEvent.preventDefault();
			}
		}
	};

	/**
	 * handles the default cell contextmenu
	 * @private
	 */
	Table.prototype._oncellcontextmenu = function(mParams) {
		if (this.getEnableCellFilter()) {
			// create the contextmenu instance the first time it is needed
			if (!this._oContextMenu) {
				if ( !Menu ) {
					// retrieve lazy dependencies
					// TODO consider to load them async (should be possible as this method ends with an "open" call which is async by nature
					Menu = sap.ui.requireSync("sap/ui/unified/Menu");
					MenuItem = sap.ui.requireSync("sap/ui/unified/MenuItem");
				}
				this._oContextMenu = new Menu(this.getId() + "-contextmenu");
				this.addDependent(this._oContextMenu);
			}

			// does the column support filtering?
			var oColumn = sap.ui.getCore().byId(mParams.columnId);
			var sProperty = oColumn.getFilterProperty();
			// currently only filter is possible by default cell context menu, if filtering is not allowed by
			// menu, don't open the context menu at all.
			if (oColumn && oColumn.isFilterableByMenu() && mParams.rowBindingContext) {
				// destroy all items of the menu and recreate
				this._oContextMenu.destroyItems();
				this._oContextMenu.addItem(new MenuItem({
					text: this._oResBundle.getText("TBL_FILTER"),
					select: [function() {
						var oContext = this.getContextByIndex(mParams.rowIndex);
						var sValue = oContext.getProperty(sProperty);
						if (this.getEnableCustomFilter()) {
							// only fire custom filter event
							this.fireCustomFilter({
								column: oColumn,
								value: sValue
							});
						} else {
							this.filter(oColumn, sValue);
						}

					}, this]
				}));

				// open the popup below the cell
				var eDock = Popup.Dock;
				this._oContextMenu.open(false, mParams.cellDomRef, eDock.BeginTop, eDock.BeginBottom, mParams.cellDomRef, "none none");
				return true;
			}
		}
	};

	/**
	 * finds the cell on which the click or contextmenu event is executed and
	 * notifies the listener which control has been clicked or the contextmenu
	 * should be openend.
	 * @param {function} fnFire function to fire the event
	 * @param {DOMEvent} oEvent event object
	 * @return {boolean} cancelled or not
	 * @private
	 */
	Table.prototype._findAndfireCellEvent = function(fnFire, oEvent, fnContextMenu) {
		var $target = jQuery(oEvent.target);
		// find out which cell has been clicked
		var $cell = $target.closest("td.sapUiTableTd");
		var sId = $cell.attr("id");
		var aMatches = /.*-row(\d*)-col(\d*)/i.exec(sId);
		var bCancel = false;
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
		// focus is handled by item navigation. It's  not the root element of the table which may get the focus but
		// the last focused column header or cell.
		return TableUtils.getFocusedItemInfo(this).domRef || Control.prototype.getFocusDomRef.apply(this, arguments);
	};

	/**
	 * handles the focus in to reposition the focus or prevent default handling for
	 * column resizing
	 * @private
	 */
	Table.prototype.onfocusin = function(oEvent) {
		var $ctrlScr;
		var $FocusedDomRef = jQuery(oEvent.target);
		if ($FocusedDomRef.parent('.sapUiTableTr').length > 0) {
			$ctrlScr = jQuery(this.getDomRef("sapUiTableCtrlScr"));
		} else if ($FocusedDomRef.parent('.sapUiTableColHdr').length > 0) {
			$ctrlScr = jQuery(this.getDomRef("sapUiTableColHdrScr"));
		}

		if ((Device.browser.firefox || Device.browser.chrome) && $ctrlScr && $ctrlScr.length > 0) {
			var iCtrlScrScrollLeft = $ctrlScr.scrollLeft();
			var iCtrlScrWidth = $ctrlScr.width();
			var iCellLeft = $FocusedDomRef.position().left;
			var iCellRight = iCellLeft + $FocusedDomRef.width();
			var iOffsetLeft = iCellLeft - iCtrlScrScrollLeft;
			var iOffsetRight = iCellRight - iCtrlScrWidth - iCtrlScrScrollLeft;

			var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
			if (iOffsetRight > 0) {
				oHsb.scrollLeft = oHsb.scrollLeft + iOffsetRight + 2;
			} else if (iOffsetLeft < 0) {
				oHsb.scrollLeft = oHsb.scrollLeft + iOffsetLeft - 1;
			}
		}
	};

	// =============================================================================
	// SELECTION HANDLING
	// =============================================================================

		/**
	 * handles the row selection and the column header menu
	 * @private
	 */
	Table.prototype._onSelect = function(oEvent) {

		// trigger column menu
		var $target = jQuery(oEvent.target);

		// determine modifier keys
		var bShift = oEvent.shiftKey;
		var bCtrl = !!(oEvent.metaKey || oEvent.ctrlKey);

		// column header?
		var $col = $target.closest(".sapUiTableCol");
		if (this._bShowMenu && $col.length === 1) {
			var iIndex = parseInt($col.attr("data-sap-ui-colindex"), 10);
			var oColumn = this.getColumns()[iIndex];

			if ($target.hasClass("sapUiTableColDropDown")) {
				var bExecuteDefault = this.fireColumnSelect({
					column: oColumn
				});

				if (bExecuteDefault) {
					oColumn._openMenu($col[0], oEvent.type == "keyup");
				}
			} else {
				this._onColumnSelect(oColumn, $col[0], this._isTouchMode(oEvent), oEvent.type == "keyup");
			}

			return;
		}

		// row header?
		var $row = $target.closest(".sapUiTableRowHdr");
		if ($row.length === 1) {
			var iIndex = parseInt($row.attr("data-sap-ui-rowindex"), 10);
			this._onRowSelect(this.getRows()[iIndex].getIndex(), bShift, bCtrl);
			return;
		}

		// table control? (only if the selection behavior is set to row)
		var oClosestTd, $ClosestTd;
		if (oEvent.target) {
			$ClosestTd = jQuery(oEvent.target).closest(".sapUiTableCtrl > tbody > tr > td");
			if ($ClosestTd.length > 0) {
				oClosestTd = $ClosestTd[0];
			}
		}


		if (oClosestTd && ($ClosestTd.hasClass("sapUiTableTd") || $ClosestTd.hasClass("sapUiTableTDDummy")) && (
		    this.getSelectionBehavior() === SelectionBehavior.Row ||
		    this.getSelectionBehavior() === SelectionBehavior.RowOnly)) {
			var $row = $target.closest(".sapUiTableCtrl > tbody > tr");
			if ($row.length === 1) {
				var iIndex = parseInt($row.attr("data-sap-ui-rowindex"), 10);
				this._onRowSelect(this.getRows()[iIndex].getIndex(), bShift, bCtrl);
				return;
			}
		}

		// select all?
		if (jQuery.sap.containsOrEquals(this.getDomRef("selall"), oEvent.target)) {
			this._toggleSelectAll();
			return;
		}

	};


	// =============================================================================
	// ROW EVENT HANDLING
	// =============================================================================

	/**
	 *
	 * @param iRowIndex
	 * @returns {boolean}
	 * @private
	 */
	Table.prototype._isRowSelectable = function(iRowIndex) {
		return true;
	};

	/**
	 * handles the row selection (depending on the mode)
	 * @private
	 */
	Table.prototype._onRowSelect = function(iRowIndex, bShift, bCtrl) {

		// in case of IE and SHIFT we clear the text selection
		if (!!Device.browser.internet_explorer && bShift) {
			this._clearTextSelection();
		}

		// is the table bound?
		var oBinding = this.getBinding("rows");
		if (!oBinding) {
			return;
		}

		//var iRowIndex = Math.min(Math.max(0, iRowIndex), this.getBinding("rows").getLength() - 1);
		if (iRowIndex < 0 || iRowIndex >= (oBinding.getLength() || 0)) {
			return;
		}

		// Make sure that group headers, which represents a tree node in AnalyticalTable, are not selectable.
		if (!this._isRowSelectable(iRowIndex)) {
			return;
		}

		this._iSourceRowIndex = iRowIndex;

		var oSelMode = this.getSelectionMode();
		if (oSelMode !== SelectionMode.None) {
			if (oSelMode === SelectionMode.Single) {
				if (!this.isIndexSelected(iRowIndex)) {
					this.setSelectedIndex(iRowIndex);
				} else {
					this.clearSelection();
				}
			} else {
				// in case of multi toggle behavior a click on the row selection
				// header adds or removes the selected row and the previous seleciton
				// will not be removed
				if (oSelMode === SelectionMode.MultiToggle) {
					bCtrl = true;
				}
				if (bShift) {
					// If no row is selected getSelectedIndex returns -1 - then we simply
					// select the clicked row:
					var iSelectedIndex = this.getSelectedIndex();
					if (iSelectedIndex >= 0) {
						this.addSelectionInterval(iSelectedIndex, iRowIndex);
					} else {
						this.setSelectedIndex(iRowIndex);
					}
				} else {
					if (!this.isIndexSelected(iRowIndex)) {
						if (bCtrl) {
							this.addSelectionInterval(iRowIndex, iRowIndex);
						} else {
							this.setSelectedIndex(iRowIndex);
						}
					} else {
						if (bCtrl) {
							this.removeSelectionInterval(iRowIndex, iRowIndex);
						} else {
							if (this._getSelectedIndicesCount() === 1) {
								this.clearSelection();
							} else {
								this.setSelectedIndex(iRowIndex);
							}
						}
					}
				}
			}
		}

		this._iSourceRowIndex = undefined;

	};


	// =============================================================================
	// COLUMN EVENT HANDLING
	// =============================================================================

	/**
	 * column select event => opens the column menu
	 * @private
	 */
	Table.prototype._onColumnSelect = function(oColumn, oDomRef, bIsTouchMode, bWithKeyboard) {
		// On tablet open special column header menu
		if (bIsTouchMode && (oColumn.getResizable() || oColumn._menuHasItems())) {
			var $ColumnHeader = jQuery(oDomRef);
			var $ColumnCell = $ColumnHeader.find(".sapUiTableColCell");

			if ($ColumnHeader.find(".sapUiTableColCellMenu").length < 1) {
				$ColumnCell.hide();

				var sColumnDropDownButton = "";
				if (oColumn._menuHasItems()) {
					sColumnDropDownButton = "<div class='sapUiTableColDropDown'></div>";
				}

				var sColumnResizerButton = "";
				if (oColumn.getResizable()) {
					sColumnResizerButton = "<div class='sapUiTableColResizer''></div>";
				}

				var $ColumnHeaderMenu = jQuery("<div class='sapUiTableColCellMenu'>" + sColumnDropDownButton + sColumnResizerButton + "</div>");
				$ColumnHeader.append($ColumnHeaderMenu);
				$ColumnHeader.bind("focusout", function() {
					this.cell.show();
					this.menu.remove();
					this.self.unbind("focusout");
				}.bind({
					cell: $ColumnCell,
					menu: $ColumnHeaderMenu,
					self: $ColumnHeader
				}));
			}

			return;
		}

		// forward the event
		var bExecuteDefault = this.fireColumnSelect({
			column: oColumn
		});

		// if the default behavior should be prevented we suppress to open
		// the column menu!
		if (bExecuteDefault) {
			oColumn._openMenu(oDomRef, bWithKeyboard);
		}
	};

	/**
	 * Handler for touchstart on the table, needed for scrolling.
	 * @param oEvent
	 */
	Table.prototype.ontouchstart = function(oEvent) {
		if (this._isTouchMode(oEvent)) {
			this._aTouchStartPosition = null;
			this._bIsScrollVertical = null;
			var $scrollTargets = this._getScrollTargets();
			var bDoScroll = jQuery(oEvent.target).closest($scrollTargets).length > 0;
			if (bDoScroll) {
				var oTouch = oEvent.targetTouches[0];
				this._aTouchStartPosition = [oTouch.pageX, oTouch.pageY];
				var oVsb = this.getDomRef(SharedDomRef.VerticalScrollBar);
				if (oVsb) {
					this._iTouchScrollTop = oVsb.scrollTop;
				}

				var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
				if (oHsb) {
					this._iTouchScrollLeft = oHsb.scrollLeft;
				}
			}
		}
	};

	/**
	 * Handler for touchmove on the table, needed for scrolling.
	 * @param oEvent
	 */
	Table.prototype.ontouchmove = function(oEvent) {
		if (this._isTouchMode(oEvent) && this._aTouchStartPosition) {
			var oTouch = oEvent.targetTouches[0];
			var iDeltaX = (oTouch.pageX - this._aTouchStartPosition[0]);
			var iDeltaY = (oTouch.pageY - this._aTouchStartPosition[1]);
			if (this._bIsScrollVertical == null) {
				this._bIsScrollVertical = Math.abs(iDeltaY) > Math.abs(iDeltaX);
			}

			if (this._bIsScrollVertical) {
				var oVsb = this.getDomRef(SharedDomRef.VerticalScrollBar);
				if (oVsb) {
					var iScrollTop = this._iTouchScrollTop - iDeltaY;

					if (iScrollTop > 0 && iScrollTop < (this.getDomRef("vsb-content").clientHeight - oVsb.clientHeight) - 1) {
						oEvent.preventDefault();
						oEvent.stopPropagation();
					}
					oVsb.scrollTop = iScrollTop;
				}
			} else {
				var oHsb = this.getDomRef(SharedDomRef.HorizontalScrollBar);
				if (oHsb) {
					var iScrollLeft = this._iTouchScrollLeft - iDeltaX;

					if (iScrollLeft > 0 && iScrollLeft < (this.getDomRef("hsb-content").clientWidth - oHsb.clientWidth) - 1) {
						oEvent.preventDefault();
						oEvent.stopPropagation();
					}
					oHsb.scrollLeft = iScrollLeft;
				}
			}
		}
	};

	/**
	 *
	 * @param oColumn
	 * @param sWidth
	 * @private
	 */
	Table.prototype._resizeDependentColumns = function(oColumn, sWidth) {
		var that = this;
		// Adjust columns only if the columns have percentage values
		if (this._checkPercentageColumnWidth()) {
			var aVisibleColumns = this._getVisibleColumns();
			//var oLastVisibleColumn = aVisibleColumns[aVisibleColumns.length - 1]; // NOT USED!
			//var bAllFollowingColumnsFlexible = true; // NOT USED!

			var iColumnIndex;
			jQuery.each(aVisibleColumns, function(iIndex, oCurrentColumn) {
				if (oColumn === oCurrentColumn) {
					iColumnIndex = iIndex;
				//} else if (iColumnIndex !== undefined && !oCurrentColumn.getFlexible()) { // NOT REQUIRED?
					//bAllFollowingColumnsFlexible = false;
				}
			});

			var iOthersWidth = 0;
			var iLastIndex = aVisibleColumns.length - 1;
			var iTotalPercentage;
			if (iColumnIndex === undefined) {
				iTotalPercentage = 0;
			} else {
				iTotalPercentage = parseInt(sWidth,10);
			}
			var iPercentages = 0;
			var aOtherColumns = [];

			jQuery.each(aVisibleColumns, function(iIndex, oCurrentColumn) {
				var iColumnPercentage = that._getColumnPercentageWidth(oCurrentColumn);
				if ((((iColumnIndex === iLastIndex && iIndex < iColumnIndex) || ((iColumnIndex !== iLastIndex) && iIndex > iColumnIndex)) && oCurrentColumn.getFlexible()) || iColumnIndex === undefined) {
					iOthersWidth += oCurrentColumn.$().outerWidth();
					iPercentages += iColumnPercentage;
					aOtherColumns.push(oCurrentColumn);
				} else if (iIndex !== iColumnIndex) {
					iTotalPercentage += iColumnPercentage;
				}
			});

			var iCalcPercentage = iTotalPercentage;
			jQuery.each(aOtherColumns, function(iIndex, oCurrentColumn){
				var iColumnPercentage = that._getColumnPercentageWidth(oCurrentColumn);
				var iNewWidth = Math.round((100 - iCalcPercentage) / iPercentages * iColumnPercentage);
				if (iIndex === aOtherColumns.length - 1) {
					iNewWidth = 100 - iTotalPercentage;
				} else {
					iTotalPercentage += iNewWidth;
				}
				// foolproof the above calculation logic
				if (!isFinite(iNewWidth) || iNewWidth <= 0) {
					iNewWidth = 1;
				}
				that._updateColumnWidth(oCurrentColumn, iNewWidth + "%");
			});
		} else if (!this._hasOnlyFixColumnWidths()) {

			var aVisibleColumns = this._getVisibleColumns(),
				iAvailableSpace = this.$().find(".sapUiTableCtrlScr").width(),
				iColumnIndex,
				iRightColumns = 0,
				iLeftWidth = 0,
				iRightWidth = 0,
				iFixedColumnCount = this.getFixedColumnCount(),
				iNonFixedColumns = 0;

			if (oColumn.getIndex() < iFixedColumnCount) {
				return; // ignore frozen columns
			}

			jQuery.each(aVisibleColumns, function(iIndex, oCurrentColumn) {
				if (iIndex < iFixedColumnCount) {
					return; // ignore frozen columns
				}
				//Check columns if they are fixed = they have a pixel width
				if (!jQuery.sap.endsWith(oCurrentColumn.getWidth(), "px")
					&& !jQuery.sap.endsWith(oCurrentColumn.getWidth(), "em")
					&& !jQuery.sap.endsWith(oCurrentColumn.getWidth(), "rem")) {
					iNonFixedColumns++;
					return false;
				}
				//if iColumnIndex is defined we already found our column and all other columns are right of that one
				if (iColumnIndex != undefined) {
					iRightWidth += that._CSSSizeToPixel(oCurrentColumn.getWidth());
					iRightColumns++;
				} else if (oColumn !== oCurrentColumn) {
					iLeftWidth += that._CSSSizeToPixel(oCurrentColumn.getWidth());
				}
				if (oColumn === oCurrentColumn) {
					iColumnIndex = iIndex;
					//Use new width of column
					iLeftWidth += that._CSSSizeToPixel(sWidth);
				}
			});
			//If there are non fixed columns we don't do this
			if (iNonFixedColumns > 0 || (iLeftWidth + iRightWidth > iAvailableSpace)) {
				return;
			}
			//Available space is all space right of the modified columns
			iAvailableSpace -= iLeftWidth;
			for (var i = iColumnIndex + 1; i < aVisibleColumns.length; i++) {
				//Calculate new column width based on previous percentage width
				var oColumn = aVisibleColumns[i],
					iColWidth = this._CSSSizeToPixel(oColumn.getWidth()),
					iPercent = iColWidth / iRightWidth * 100,
					iNewWidth = iAvailableSpace / 100 * iPercent;
				this._updateColumnWidth(oColumn, Math.round(iNewWidth) + 'px');
			}
		}
	};

	/**
	 *
	 * @param oColumn
	 * @returns {*}
	 * @private
	 */
	Table.prototype._getColumnPercentageWidth = function(oColumn) {
		var sColumnWidth = oColumn.getWidth();
		var iColumnPercentage = parseInt(oColumn.getWidth(),10);
		var iTotalWidth = this.$().find(".sapUiTableCtrl").width();
		if (jQuery.sap.endsWith(sColumnWidth, "px") || jQuery.sap.endsWith(sColumnWidth, "em") || jQuery.sap.endsWith(sColumnWidth, "rem")) {
			iColumnPercentage = Math.round(100 / iTotalWidth * iColumnPercentage);
		} else if (!jQuery.sap.endsWith(sColumnWidth, "%")) {
			iColumnPercentage = Math.round(100 / iTotalWidth * oColumn.$().width());
		}
		return iColumnPercentage;
	};

	/**
	 *
	 * @param oColumn
	 * @param sWidth
	 * @private
	 */
	Table.prototype._updateColumnWidth = function(oColumn, sWidth, bFireEvent) {
		// forward the event
		var bExecuteDefault = true;
		if (bFireEvent) {
			bExecuteDefault = this.fireColumnResize({
				column: oColumn,
				width: sWidth
			});
		}

		// set the width of the column (when not cancelled)
		if (bExecuteDefault) {
			oColumn.setProperty("width", sWidth, true);
			this.$().find('th[data-sap-ui-colid="' + oColumn.getId() + '"]').css('width', sWidth);
		}

		return bExecuteDefault;
	};

	/**
	 * Check if at least one column has a percentage value
	 * @private
	 */
	Table.prototype._checkPercentageColumnWidth = function() {
		var aColumns = this.getColumns();
		var bHasPercentageColumns = false;
		jQuery.each(aColumns, function(iIndex, oColumn) {
			if (jQuery.sap.endsWith(oColumn.getWidth(), "%")) {
				bHasPercentageColumns = true;
				return false;
			}
		});
		return bHasPercentageColumns;
	};

	/**
	 * Check if table has only non flexible columns with fixed widths and only then
	 * the table adds a dummy column to fill the rest of the width instead of resizing
	 * the columns to fit the complete table width
	 * @private
	 */
	Table.prototype._hasOnlyFixColumnWidths = function() {
		var bOnlyFixColumnWidths = true;
		jQuery.each(this.getColumns(), function(iIndex, oColumn) {
			var sWidth = oColumn.getWidth();
			if (oColumn.getFlexible() || !sWidth || sWidth.substr(-2) !== "px") {
				bOnlyFixColumnWidths = false;
				return false;
			}
		});
		return bOnlyFixColumnWidths;
	};


	// =============================================================================
	// SORTING & FILTERING
	// =============================================================================

	/**
	 * pushes the sorted column to array
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
	 * gets sorted columns
	 *
	 * @return Array of sorted columns
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getSortedColumns = function() {

		return this._aSortedColumns;

	};

	/**
	 * sorts the given column ascending or descending
	 *
	 * @param {sap.ui.table.Column} oColumn
	 *         column to be sorted
	 * @param {sap.ui.table.SortOrder} oSortOrder
	 *         sort order of the column (if undefined the default will be ascending)
	 * @param {Boolean} bAdd Set to true to add the new sort criterion to the existing sort criteria
	 * @type sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.sort = function(oColumn, oSortOrder, bAdd) {
		if (jQuery.inArray(oColumn, this.getColumns()) >= 0) {
			oColumn.sort(oSortOrder === SortOrder.Descending, bAdd);
		}
	};


	/**
	 * filter the given column by the given value
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

	Table.prototype._getSelectOnCellsAllowed = function () {
		var sSelectionBehavior = this.getSelectionBehavior();
		var sSelectionMode = this.getSelectionMode();
		return sSelectionMode !== SelectionMode.None && (sSelectionBehavior === SelectionBehavior.Row || sSelectionBehavior === SelectionBehavior.RowOnly);
	};

	/**
	 * updates the visual selection in the HTML markup
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
		var bSelectOnCellsAllowed = this._getSelectOnCellsAllowed();

		// trigger the rows to update their selection
		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow._updateSelection(this, mTooltipTexts, bSelectOnCellsAllowed);
		}
		// update internal property to reflect the correct index
		this.setProperty("selectedIndex", this.getSelectedIndex(), true);

		if ((oSelMode == SelectionMode.Multi || oSelMode == SelectionMode.MultiToggle) && this.getEnableSelectAll()) {
			var $SelAll = this.$("selall");
			var iSelectedIndicesCount = this._getSelectedIndicesCount();
			var iSelectableRowCount = this._getSelectableRowCount();
			var bAllRowsSelected = iSelectableRowCount > 0 && iSelectableRowCount === iSelectedIndicesCount;

			$SelAll.toggleClass("sapUiTableSelAll", !bAllRowsSelected);
		}
	};


	/**
	 * notifies the selection listeners about the changed rows
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


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

	/**
	 * Returns the context of a row by its index. Please note that for server-based models like OData,
	 * the supplied index might not have been loaded yet. If the context is not available at the client,
	 * the binding will trigger a backend request and request this single context. Although this API
	 * looks synchronous it may not return a context but load it and fire a change event on the binding.
	 *
	 * For server-based models you should consider to only make this API call when the index is within
	 * the currently visible scroll area.
	 *
	 * @param {int} iIndex
	 *         Index of the row to return the context from.
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

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

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

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

	/**
	 * Add all rows to the selection.
	 * Please note that for server based models like OData the indices which are considered to be selected might not
	 * be available at the client yet. Calling getContextByIndex might not return a result but trigger a roundtrip
	 * to request this single entity.
	 *
	 * @return sap.ui.table.Table
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.selectAll = function() {
		var oSelMode = this.getSelectionMode();
		if (!this.getEnableSelectAll() || (oSelMode != "Multi" && oSelMode != "MultiToggle")) {
			return this;
		}
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			this.$("selall").attr('title', this._oResBundle.getText("TBL_DESELECT_ALL")).removeClass("sapUiTableSelAll");
			this._oSelection.selectAll((oBinding.getLength() || 0) - 1);
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

	/**
	 * Zero-based indices of selected items, wrapped in an array. An empty array means "no selection".
	 *
	 * @return int[]
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getSelectedIndices = function() {
		return this._oSelection.getSelectedIndices();
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */

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
	 * overridden to hide the group by column when set
	 */
	Table.prototype.setGroupBy = function(vValue) {
		// determine the group by column
		var oGroupBy = vValue;
		if (typeof oGroupBy === "string") {
			oGroupBy = sap.ui.getCore().byId(oGroupBy);
		}

		// only for columns we do the full handling here - otherwise the method
		// setAssociation will fail below with a specific fwk error message
		var bReset = false;
		if (oGroupBy && oGroupBy instanceof Column) {

			// check for column being part of the columns aggregation
			if (jQuery.inArray(oGroupBy, this.getColumns()) === -1) {
				throw new Error("Column has to be part of the columns aggregation!");
			}

			// fire the event (to allow to cancel the event)
			var bExecuteDefault = this.fireGroup({column: oGroupBy, groupedColumns: [oGroupBy.getId()], type: GroupEventType.group});

			// first we reset the grouping indicator of the old column (will show the column)
			var oOldGroupBy = sap.ui.getCore().byId(this.getGroupBy());
			if (oOldGroupBy) {
				oOldGroupBy.setGrouped(false);
				bReset = true;
			}

			// then we set the grouping indicator of the new column (will hide the column)
			// ==> only if the default behavior is not prevented
			if (bExecuteDefault && oGroupBy instanceof Column) {
				oGroupBy.setGrouped(true);
			}

		}

		// reset the binding when no value is given or the binding needs to be reseted
		// TODO: think about a better handling to recreate the group binding
		if (!oGroupBy || bReset) {
			var oBindingInfo = this.getBindingInfo("rows");
			delete oBindingInfo.binding;
			this._bindAggregation("rows", oBindingInfo);
		}

		// set the new group by column (TODO: undefined doesn't work!)
		return this.setAssociation("groupBy", oGroupBy);
	};

	/*
	 * override the getBinding to inject the grouping information into the JSON model.
	 *
	 * !!EXPERIMENTAL FEATURE!!
	 *
	 * TODO:
	 *   - Grouping is not really possible for models based on OData:
	 *     - it works when loading data from the beginning because in this case the
	 *       model has the relevant information (distinct values) to determine the
	 *       count of rows and add them properly in the scrollbar as well as adding
	 *       the group information to the contexts array which is used by the
	 *       _modifyRow to display the group headers
	 *     - it doesn't work when not knowing how many groups are available before
	 *       and on which position the group header has to be added - e.g. when
	 *       displaying a snapshot in the middle of the model.
	 *   - For OData it might be a server-side feature?
	 */
	Table.prototype.getBinding = function(sName) {

		// default binding is the "rows" binding
		sName = sName || "rows";
		var oBinding = Element.prototype.getBinding.call(this, sName);

		// we do all the extended stuff only when grouping is enabled
		if (this.getEnableGrouping()) {

			// require the binding types (think about loading them only if required)
			var ClientListBinding = sap.ui.requireSync("sap/ui/model/ClientListBinding");

			// check for grouping being supported or not (only for client ListBindings!!)
			var oGroupBy = sap.ui.getCore().byId(this.getGroupBy());
			var bIsSupported = oGroupBy && oGroupBy.getGrouped() &&
			                   sName === "rows" && oBinding &&
			                   oBinding instanceof ClientListBinding;

			// only enhance the binding if it has not been done yet and supported!
			if (bIsSupported && !oBinding._modified) {

				// once the binding is modified we always return the modified binding
				// and don't wanna modifiy the binding once again
				oBinding._modified = true;

				// hook into the row modification and add the grouping specifics
				this._modifyRow = function(iRowIndex, $row) {

					// we add the style override to display the row header
					this.$().find(".sapUiTableRowHdrScr").css("display", "block");

					// modify the rows
					var $rowHdr = this.$().find("div[data-sap-ui-rowindex='" + $row.attr("data-sap-ui-rowindex") + "']");
					if (oBinding.isGroupHeader(iRowIndex)) {
						$row.addClass("sapUiTableGroupHeader sapUiTableRowHidden");
						var sClass = oBinding.isExpanded(iRowIndex) ? "sapUiTableGroupIconOpen" : "sapUiTableGroupIconClosed";
						$rowHdr.html("<div class=\"sapUiTableGroupIcon " + sClass + "\" tabindex=\"-1\">" + oBinding.getTitle(iRowIndex) + "</div>");
						$rowHdr.addClass("sapUiTableGroupHeader").removeAttr("title");
					} else {
						$row.removeClass("sapUiTableGroupHeader");
						$rowHdr.html("");
						$rowHdr.removeClass("sapUiTableGroupHeader");
					}

				};

				// we use sorting finally to sort the values and afterwards group them
				var sPropertyName = oGroupBy.getSortProperty();
				oBinding.sort(new Sorter(sPropertyName));

				// fetch the contexts from the original binding
				var iLength = oBinding.getLength(),
					aContexts = oBinding.getContexts(0, iLength);

				// add the context information for the group headers which are later on
				// used for displaying the grouping information of each group
				var sKey;
				var iCounter = 0;
				for (var i = iLength - 1; i >= 0; i--) {
					var sNewKey = aContexts[i].getProperty(sPropertyName);
					if (!sKey) {
						sKey = sNewKey;
					}
					if (sKey !== sNewKey) {
						var oGroupContext = aContexts[i + 1].getModel().getContext("/sap.ui.table.GroupInfo" + i);
						oGroupContext.__groupInfo = {
							oContext: aContexts[i + 1],
							name: sKey,
							count: iCounter,
							groupHeader: true,
							expanded: true
						};
						aContexts.splice(i + 1, 0,
							oGroupContext
						);
						sKey = sNewKey;
						iCounter = 0;
					}
					iCounter++;
				}
				var oGroupContext = aContexts[0].getModel().getContext("/sap.ui.table.GroupInfo");
				oGroupContext.__groupInfo =	{
					oContext: aContexts[0],
					name: sKey,
					count: iCounter,
					groupHeader: true,
					expanded: true
				};
				aContexts.splice(0, 0,
					oGroupContext
				);

				// extend the binding and hook into the relevant functions to provide
				// access to the grouping information for the _modifyRow function
				jQuery.extend(oBinding, {
					getLength: function() {
						return aContexts.length;
					},
					getContexts: function(iStartIndex, iLength) {
						return aContexts.slice(iStartIndex, iStartIndex + iLength);
					},
					isGroupHeader: function(iIndex) {
						var oContext = aContexts[iIndex];
						return oContext && oContext.__groupInfo && oContext.__groupInfo.groupHeader;
					},
					getTitle: function(iIndex) {
						var oContext = aContexts[iIndex];
						return oContext && oContext.__groupInfo && oContext.__groupInfo.name + " - " + oContext.__groupInfo.count;
					},
					isExpanded: function(iIndex) {
						var oContext = aContexts[iIndex];
						return this.isGroupHeader(iIndex) && oContext.__groupInfo && oContext.__groupInfo.expanded;
					},
					expand: function(iIndex) {
						if (this.isGroupHeader(iIndex) && !aContexts[iIndex].__groupInfo.expanded) {
							for (var i = 0; i < aContexts[iIndex].__childs.length; i++) {
								aContexts.splice(iIndex + 1 + i, 0, aContexts[iIndex].__childs[i]);
							}
							delete aContexts[iIndex].__childs;
							aContexts[iIndex].__groupInfo.expanded = true;
							this._fireChange();
						}
					},
					collapse: function(iIndex) {
						if (this.isGroupHeader(iIndex) && aContexts[iIndex].__groupInfo.expanded) {
							aContexts[iIndex].__childs = aContexts.splice(iIndex + 1, aContexts[iIndex].__groupInfo.count);
							aContexts[iIndex].__groupInfo.expanded = false;
							this._fireChange();
						}
					},
					toggleIndex: function(iIndex) {
						if (this.isExpanded(iIndex)) {
							this.collapse(iIndex);
						} else {
							this.expand(iIndex);
						}
					}

				});

				// the table need to fetch the updated/changed contexts again, therefore requires the binding to fire a change event
				this._mTimeouts.groupingFireBindingChange = this._mTimeouts.groupingFireBindingChange || window.setTimeout(function() {oBinding._fireChange();}, 0);
			}

		}

		return oBinding;

	};

	/**
	 * @private
	 */
	Table.prototype.resetGrouping = function() {
		// reset the group binding only when enhanced
		var oBinding = this.getBinding("rows");
		if (oBinding && oBinding._modified) {

			// we remove the style override to display the row header
			this.$().find(".sapUiTableRowHdrScr").css("display", "");

			// if the grouping is not supported we remove the hacks we did
			// and simply return the binding finally
			this._modifyRow = undefined;

			// reset the binding
			var oBindingInfo = this.getBindingInfo("rows");
			this.unbindRows();
			this.bindRows(oBindingInfo);
		}
	};

	/**
	 * @private
	 */
	Table.prototype.setEnableGrouping = function(bEnableGrouping) {
		// set the property
		this.setProperty("enableGrouping", bEnableGrouping);
		// reset the grouping
		if (!bEnableGrouping) {
			this.resetGrouping();
		}
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
		var aCols = this._getVisibleColumns();
		var vHeaderSpan = aCols[iFixedColumnCount - 1] && aCols[iFixedColumnCount - 1].getHeaderSpan();
		if (vHeaderSpan) {
			var iHeaderSpan;
			if (jQuery.isArray(vHeaderSpan)) {
				iHeaderSpan = parseInt(vHeaderSpan[0], 10);
			} else {
				iHeaderSpan = parseInt(vHeaderSpan, 10);
			}
			iFixedColumnCount += iHeaderSpan - 1;
		}
		//Set current width as fixed width for cols
		var $ths = this.$().find(".sapUiTableCtrlFirstCol > th");
		for (var i = 0; i < iFixedColumnCount; i++) {
			var oColumn = aCols[i];
			if (oColumn) {
				var iColumnIndex = jQuery.inArray(oColumn, this.getColumns());
				if (!oColumn.getWidth()) {
					oColumn.setWidth($ths.filter("[data-sap-ui-headcolindex='" + iColumnIndex + "']").width() + "px");
				}
			}
		}
		this.setProperty("fixedColumnCount", iFixedColumnCount, bSuppressInvalidate);

		// call collectTableSizes to determine whether the number of fixed columns can be displayed at all
		// this is required to avoid flickering of the table in IE if the fixedColumnCount must be adjusted
		this._collectTableSizes();
		this._invalidateColumnMenus();
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
	 *
	 * @private
	 */
	Table.prototype._invalidateColumnMenus = function() {
		var aCols = this.getColumns();
		for (var i = 0, l = aCols.length; i < l; i++) {
			aCols[i].invalidateMenu();
		}
	};

	/**
	 * Checks whether the passed oEvent is a touch event.
	 * @private
	 * @param {event} oEvent The event to check
	 * @return {boolean} false
	 */
	Table.prototype._isTouchMode = function(oEvent) {
		return !!oEvent.originalEvent["touches"];
	};

	Table.prototype._determineParent = function() {
		var oParent = this.getParent();

		if (oParent) {
			var oParentDomRef;
			if (oParent.getDomRef) {
				// for Controls
				oParentDomRef = oParent.getDomRef();
			} else if (oParent.getRootNode) {
				// for UIArea
				oParentDomRef = oParent.getRootNode();
			}

			if (oParentDomRef) {
				return jQuery(oParentDomRef);
			}
		}
		return jQuery();
	};

	Table.prototype._getRowTemplate = function() {
		if (!this._oRowTemplate) {
			// create the new template
			this._oRowTemplate = new Row(this.getId() + "-rows");
			var aColumns = this.getColumns();
			for (var i = 0, l = aColumns.length; i < l; i++) {
				if (aColumns[i].getVisible()) {
					var oColumnTemplate = aColumns[i].getTemplate();
					if (oColumnTemplate) {
						var oColumnTemplateClone = oColumnTemplate.clone("col" + i);
						oColumnTemplateClone.data("sap-ui-colindex", i);
						oColumnTemplateClone.data("sap-ui-colid", aColumns[i].getId());
						this._oRowTemplate.addCell(oColumnTemplateClone);
					}
				}
			}
		}

		return this._oRowTemplate;
	};

	Table.prototype._getDummyRow = function() {
		if (!this._oDummyRow) {
			this._oDummyRow = this._getRowTemplate().clone("dummy");
			this._oDummyRow._bDummyRow = true;
			this._oDummyRow._bHidden = true;
		}

		return this._oDummyRow;
	};

	Table.prototype._resetRowTemplate = function() {
		if (this._oRowTemplate) {
			this._oRowTemplate.destroy();
			this._oRowTemplate = undefined;
		}
		if (this._oDummyRow) {
			this._oDummyRow.destroy();
			this._oDummyRow = undefined;
		}
	};

	/**
	 * creates the rows for the rows aggregation
	 * @private
	 */
	Table.prototype._adjustRows = function(iNumberOfRows, bNoUpdate) {
		if (isNaN(iNumberOfRows)) {
			return false;
		}

		// Create one additional row, for half-scrolled rows at the bottom.
		if (TableUtils.isVariableRowHeightEnabled(this)) {
			iNumberOfRows = iNumberOfRows + 1;
		}

		var i;
		var aRows = this.getRows();
		if (!this._oRowTemplate && aRows.length > 0) {
			this.destroyAggregation("rows", true);
			aRows = [];
		}

		if (iNumberOfRows == aRows.length) {
			return false;
		}

		// remove rows from aggregation if they are not needed anymore required
		for (i = aRows.length - 1; i >= iNumberOfRows; i--) {
			this.removeAggregation("rows", i, true).destroy();
		}

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			// One additional row was created for half-scrolled rows at the bottom.,
			// this should not lead to a increase of the visibleRowCount defined by the user.
			this.setProperty("visibleRowCount", iNumberOfRows - 1, true);
		} else {
			this.setProperty("visibleRowCount", iNumberOfRows, true);
		}

		// this call might cause the cell (controls) to invalidate theirself and therefore also the table. It should be
		// avoided to rerender the complete table since rendering of the rows is handled here. All child controls get
		// rendered.
		this._ignoreInvalidateOfChildControls = true;
		var aContexts;
		var iFirstVisibleRow = this.getFirstVisibleRow();
		var iAbsoluteRowIndex = 0;
		var bExecuteCallback = false;
		var oBindingInfo;
		var oBinding = this.getBinding("rows");

		if (!bNoUpdate) {
			// set binding contexts for known rows
			oBindingInfo = this.getBindingInfo("rows");
			bExecuteCallback = typeof this._updateTableCell === "function";
			aContexts = this._getRowContexts(iNumberOfRows);

			for (i = 0; i < aRows.length; i++) {
				iAbsoluteRowIndex = iFirstVisibleRow + i;
				this._updateRowBindingContext(aRows[i], aContexts[i], oBindingInfo && oBindingInfo.model, iAbsoluteRowIndex, bExecuteCallback, oBinding);
			}
		}

		if (aRows.length < iNumberOfRows) {
			// clone rows and set binding context for them
			var oRowTemplate = this._getRowTemplate();

			for (i = aRows.length; i < iNumberOfRows; i++) {
				// add new rows and set their binding contexts in the same run in order to avoid unnecessary context
				// propagations.
				var oClone = oRowTemplate.clone("row" + i);
				if (!bNoUpdate) {
					iAbsoluteRowIndex = iFirstVisibleRow + i;
					this._updateRowBindingContext(oClone, aContexts[i], oBindingInfo && oBindingInfo.model, iAbsoluteRowIndex, bExecuteCallback, oBinding);
				}
				this.addAggregation("rows", oClone, true);
			}
		}
		this._ignoreInvalidateOfChildControls = false;

		aRows = this.getRows();
		bNoUpdate = bNoUpdate || aContexts.length == 0;
		return this._insertTableRows(aRows, bNoUpdate);
	};

	/**
	 * Insert table rows into DOM.
	 *
	 * @param {sap.ui.table.Row[]} [aRows] Rows aggregation to be rendered.
	 * @param {Number} [iMaxRowCount] Maximum amount of row to be rendered.
	 * @private
	 */
	Table.prototype._insertTableRows = function(aRows, bNoUpdate) {
		var bReturn = false;
		if (!this._bInvalid) {
			this._detachEvents();

			var oTBody = this.getDomRef("tableCCnt");
			aRows = aRows || this.getRows();
			if (!aRows.length || !oTBody) {
				return;
			}

			if (this.getVisibleRowCountMode() == VisibleRowCountMode.Auto) {
				var oDomRef = this.getDomRef();
				if (oDomRef) {
					oDomRef.style.height = "0px";
				}
			}

			// make sure to call rendering event delegates even in case of DOM patching
			var oEvent = jQuery.Event("BeforeRendering");
			oEvent.setMarked("insertTableRows");
			oEvent.srcControl = this;
			this._handleEvent(oEvent);

			var oRM = new sap.ui.getCore().createRenderManager(),
				oRenderer = this.getRenderer();

			oRenderer.renderTableCCnt(oRM, this);
			oRM.flush(oTBody, false, false);
			oRM.destroy();

			// make sure to call rendering event delegates even in case of DOM patching
			oEvent = jQuery.Event("AfterRendering");
			oEvent.setMarked("insertTableRows");
			oEvent.srcControl = this;
			this._handleEvent(oEvent);

			// since the row is an element it has no own renderer. Anyway, logically it has a domref. Let the rows
			// update their domrefs after the rendering is done. This is required to allow performant access to row domrefs
			this._initRowDomRefs();
			this._getKeyboardExtension().invalidateItemNavigation();

			// restore the column icons
			var aCols = this.getColumns();
			for (var i = 0, l = aCols.length; i < l; i++) {
				if (aCols[i].getVisible()) {
					aCols[i]._restoreIcons();
				}
			}

			this._updateTableSizes();

			this._updateGroupHeader();

			bReturn = true;
			// for TreeTable and AnalyticalTable
			if (this._updateTableContent) {
				this._updateTableContent();
			}
			this._attachEvents();
		}

		if (!bNoUpdate && !this._bInvalid && this.getBinding("rows")) {
			var that = this;
			if (this._mTimeouts._rowsUpdated) {
				window.clearTimeout(this._mTimeouts._rowsUpdated);
			}
			this._mTimeouts._rowsUpdated = window.setTimeout(function() {
				that.fireEvent("_rowsUpdated");
			}, 0);
		}

		return bReturn;
	};

	/**
	 * Determines the default row height, based upon the height of the row template.
	 * @private
	 */
	Table.prototype._getDefaultRowHeight = function() {
		var iRowHeight = this.getRowHeight();

		if (iRowHeight > 0) {
			return iRowHeight;
		} else {
			var sContentDensity = TableUtils.getContentDensity(this);
			return TableUtils.CONTENT_DENSITY_ROW_HEIGHTS[sContentDensity];
		}
	};

	/**
	 * Determines and sets the height of tableCtrlCnt based upon the VisibleRowCountMode and other conditions.
	 * @param iHeight
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
			jQuery(this.getDomRef("tableCCnt")).css("height", iDefaultRowHeight * this.getVisibleRowCount() + "px");
		} else {
			if ((sVisibleRowCountMode == VisibleRowCountMode.Fixed || sVisibleRowCountMode == VisibleRowCountMode.Interactive) && this.getRows().length > 0) {
				jQuery(this.getDomRef("tableCtrlCnt")).css("height", "auto");
			} else {
				jQuery(this.getDomRef("tableCtrlCnt")).css("height", this._iTableRowContentHeight + "px");
			}
		}

		this._toggleVSb();
	};

	/**
	 * Determines the minimal row count for rowCountMode "auto".
	 * @private
	 */
	Table.prototype._determineMinAutoRowCount = function() {
		var iVisibleRowCount = this.getVisibleRowCount();
		var iMinAutoRowCount = this.getMinAutoRowCount();
		var iMinRowCount = iMinAutoRowCount || iVisibleRowCount || 5;
		if (this.getVisibleRowCountMode() == VisibleRowCountMode.Interactive && !this.bOutput) {
			iMinRowCount = iVisibleRowCount || iMinAutoRowCount || 5;
		}
		return iMinRowCount;
	};

	/**
	 * Calculates the maximum rows to display within the table.
	 * @private
	 */
	Table.prototype._calculateRowsToDisplay = function(iTableRowContentHeight) {
		iTableRowContentHeight = iTableRowContentHeight || this._iTableRowContentHeight;
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

	/**
	 * Creates a new {@link sap.ui.core.util.Export} object and fills row/column information from the table if not provided. For the cell content, the column's "sortProperty" will be used (experimental!)
	 *
	 * <p><b>Please note: The return value was changed from jQuery Promises to standard ES6 Promises.
	 * jQuery specific Promise methods ('done', 'fail', 'always', 'pipe' and 'state') are still available but should not be used.
	 * Please use only the standard methods 'then' and 'catch'!</b></p>
	 *
	 * @param {object} [mSettings] settings for the new Export, see {@link sap.ui.core.util.Export} <code>constructor</code>
	 * @return {Promise} Promise object
	 *
	 * @experimental Experimental because the property for the column/cell definitions (sortProperty) could change in future.
	 * @public
	 */
	Table.prototype.exportData = function(mSettings) {
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
		// in order to fire the rowSelectionChanged event, the SourceRowIndex mus be set to -1
		// to indicate that the selection was changed by user interaction
		if (!this.$("selall").hasClass("sapUiTableSelAll")) {
			this._iSourceRowIndex = -1;
			this.clearSelection();
		} else if (this._getSelectableRowCount() > 0) {
			this._iSourceRowIndex = 0;
			this.selectAll();
		}
		if (!!Device.browser.internet_explorer) {
			this.$("selall").focus();
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

	/**
	 *
	 * @param mParameters
	 * @private
	 */
	Table.prototype._setBusy = function (mParameters) {
		var oBinding,
			i,
			bSetBusy;

		if (!this.getEnableBusyIndicator() || !this._bBusyIndicatorAllowed) {
			return;
		}

		oBinding = this.getBinding("rows");
		if (!oBinding) {
			return;
		}

		this.setBusy(false);
		if (mParameters && this._iDataRequestedCounter > 0) {
			var sReason = mParameters.reason;
			if (mParameters.contexts && mParameters.contexts.length !== undefined) {
				// TreeBinding and AnalyticalBinding always return a contexts array with the
				// requested length. Both put undefined in it for contexts which need to be loaded
				// Check for undefined in the contexts array.
				bSetBusy = false;
				for (i = 0; i < mParameters.contexts.length; i++) {
					if (mParameters.contexts[i] === undefined) {
						bSetBusy = true;
						break;
					}
				}
			} else if (mParameters.changeReason === ChangeReason.Expand) {
				this.setBusy(true);
			}

			var iLength = oBinding.getLength();
			if ((sReason == ChangeReason.Expand && this._iDataRequestedCounter !== 0) || bSetBusy || (oBinding.isInitial()) || (mParameters.receivedLength === 0 && this._iDataRequestedCounter !== 0) ||
				(mParameters.receivedLength < mParameters.requestedLength && mParameters.receivedLength !== iLength &&
				 mParameters.receivedLength !== iLength - this.getFirstVisibleRow())) {
				this.setBusy(true);
			}
		}
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
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._attachDataRequestedListeners = function () {
		var oBinding = this.getBinding("rows");
		if (oBinding) {
			oBinding.detachDataRequested(this._onBindingDataRequestedListener, this);
			oBinding.detachDataReceived(this._onBindingDataReceivedListener, this);
			this._iDataRequestedCounter = 0;
			oBinding.attachDataRequested(this._onBindingDataRequestedListener, this);
			oBinding.attachDataReceived(this._onBindingDataReceivedListener, this);
		}
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onBindingDataRequestedListener = function (oEvent) {
		if (oEvent.getSource() == this.getBinding("rows") && !oEvent.getParameter("__simulateAsyncAnalyticalBinding")) {
			this._iDataRequestedCounter++;
		}
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onBindingDataReceivedListener = function (oEvent) {
		if (oEvent.getSource() == this.getBinding("rows") && !oEvent.getParameter("__simulateAsyncAnalyticalBinding")) {
			this._iDataRequestedCounter--;
		}
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._attachBindingListener = function() {
		this._attachDataRequestedListeners();
	};

	/**
	 * Lets you control in which situation the <code>ScrollBar</code> fires scroll events.
	 *
	 * @param {boolean} bLargeDataScrolling Set to true to let the <code>ScrollBar</code> only fires scroll events when
	 * the scroll handle is released. No matter what the setting is, the <code>ScrollBar</code> keeps on fireing scroll events
	 * when the user scroll with the mousewheel or using touch
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

	return Table;

});
