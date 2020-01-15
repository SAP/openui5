/*!
 * ${copyright}
 */

// Provides control sap.ui.table.Table.
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/Control',
	'sap/ui/core/Element',
	'sap/ui/core/IconPool',
	'sap/ui/core/util/PasteHelper',
	'sap/ui/model/ChangeReason',
	'sap/ui/model/Filter',
	'sap/ui/model/Sorter',
	'sap/ui/model/BindingMode',
	'./Column',
	'./Row',
	'./library',
	'./utils/TableUtils',
	'./extensions/ExtensionBase',
	'./extensions/Accessibility',
	'./extensions/Keyboard',
	'./extensions/Pointer',
	'./extensions/Scrolling',
	'./extensions/DragAndDrop',
	"./TableRenderer",
	"./rowmodes/FixedRowMode",
	"./rowmodes/InteractiveRowMode",
	"./rowmodes/AutoRowMode",
	"./plugins/SelectionModelPlugin",
	"sap/ui/thirdparty/jquery",
	"sap/base/Log"
],
	function(
		Device,
		Control,
		Element,
		IconPool,
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
		FixedRowMode,
		InteractiveRowMode,
		AutoRowMode,
		SelectionModelPlugin,
		jQuery,
		Log
	) {
	"use strict";

	// shortcuts
	var GroupEventType = library.GroupEventType,
		NavigationMode = library.NavigationMode,
		SelectionMode = library.SelectionMode,
		SelectionBehavior = library.SelectionBehavior,
		SortOrder = library.SortOrder,
		VisibleRowCountMode = library.VisibleRowCountMode,
		Hook = TableUtils.Hook.Keys.Table;

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
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.Table
	 * @see {@link topic:08197fa68e4f479cbe30f639cc1cd22c sap.ui.table}
	 * @see {@link topic:148892ff9aea4a18b912829791e38f3e Tables: Which One Should I Choose?}
	 * @see {@link fiori:/grid-table/ Grid Table}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Table = Control.extend("sap.ui.table.Table", /** @lends sap.ui.table.Table.prototype */ { metadata : {

		library : "sap.ui.table",
		dnd : true,
		properties : {

			/**
			 * Width of the Table.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : 'auto'},

			/**
			 * Row height in pixel.
			 *
			 * In the table's header, it defines the minimum height of the row, but it cannot be less than the default height based on the
			 * content density configuration. The actual height can increase based on the content.
			 *
			 * In the table's body, it defines the height of the row content. The actual row height is also influenced by other factors, such as
			 * the border width. If the <code>visibleRowCountMode</code> property is set to {@link sap.ui.table.VisibleRowCountMode Fixed} or
			 * {@link sap.ui.table.VisibleRowCountMode Interactive}, the value defines the minimum height, and the actual height can
			 * increase based on the content. If the mode is {@link sap.ui.table.VisibleRowCountMode Auto}, the value defines the actual
			 * height, and any content that doesn't fit is cut off.
			 *
			 * If no value is set (includes 0), a default height is applied based on the content density configuration. In any
			 * <code>visibleRowCountMode</code>, the actual height can increase based on the content.
			 */
			rowHeight : {type : "int", group : "Appearance", defaultValue : null},

			/**
			 * Header row height in pixel. If a value greater than 0 is set, it overrides the height defined in the <code>rowHeight</code> property
			 * for the rows in the table's header. The value defines the minimum height, but it cannot be less than the default height based on the
			 * content density configuration. The actual height can increase based on the content.
			 *
			 * <b>Note</b>: In a {@link sap.ui.table.Column#getMultiLabels MultiLabel} scenario, the height is applied to each individual row of the
			 * table's header.
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
			 * <b>Note:</b> If a selection plugin is applied to the table, the selection mode is controlled by the plugin.
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
			 * <b>Note:</b> If the rows of the table are bound, the value of the property is reset to -1.
			 * If a selection plugin is applied to the table, the property is not bindable.
			 *
			 * @deprecated As of version 1.69, replaced by {@link sap.ui.table.Table#getSelectedIndices} and
			 * {@link sap.ui.table.Table#setSelectedIndex}
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
			navigationMode : {type : "sap.ui.table.NavigationMode", group : "Behavior", defaultValue : NavigationMode.Scrollbar, deprecated: true},

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
			 *  <li>For the grouping to work correctly, {@link sap.ui.table.Column#getSortProperty sortProperty} must be set for the grouped
			 *      column.</li>
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
			 * Defines how the table handles the visible rows in the table.
			 *
			 * In the <code>"Fixed"</code> mode, the table always has as many rows as defined in the <code>visibleRowCount</code> property.
			 *
			 * In the <code>"Auto"</code> mode, the <code>visibleRowCount</code> property is changed by the table automatically. It will then
			 * adjust its row count to the space it is allowed to cover (limited by the surrounding container), but it cannot have less than
			 * defined in the <code>minAutoRowCount</code> property. The <code>visibleRowCount</code> property cannot be set manually.
			 * <h3>Limitations</h3>
			 * <ul>
			 *   <li>All rows need to have the same height.</li>
			 *   <li>The table must be rendered without siblings in its parent DOM element. The only exception is if the parent element is a CSS flex
			 *       container, and the table is a CSS flex item allowed to grow and shrink.</li>
			 * </ul>
			 *
			 * In the <code>"Interactive"</code> mode, the table has as many rows as defined in the <code>visibleRowCount</code> property after
			 * rendering. The user can change the <code>visibleRowCount</code> by dragging a resizer.
			 *
			 * @since 1.9.2
			 */
			visibleRowCountMode : {type : "sap.ui.table.VisibleRowCountMode", group : "Appearance", defaultValue : VisibleRowCountMode.Fixed},

			/**
			 * This property is used to set the minimum count of visible rows when the property visibleRowCountMode is set to Auto or Interactive.
			 * For any other visibleRowCountMode, it is ignored.
			 */
			minAutoRowCount : {type : "int", group : "Appearance", defaultValue : 5},

			/**
			 * Number of columns that are fixed on the left. Only columns which are not fixed can be scrolled horizontally.
			 *
			 * <b>Note</b>
			 * <ul>
			 *  <li>Fixed columns need a defined width for the feature to work.</li>
			 *  <li>The aggregated width of all fixed columns must not exceed the table width. Otherwise the table ignores the value of the
			 *  property and adapts the behavior in an appropriate way to ensure that the user is still able to scroll horizontally.</li>
			 * </ul>
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
			 *
			 * @deprecated As of 1.72. Use the <code>extension</code> aggregation instead.
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
			 * Note: In case a <code>sap.m.Toolbar</code> is used as header the CSS class sapMTBHeader-CTX should be applied on this toolbar.
			 */
			extension : {type : "sap.ui.core.Control", multiple : true, singularName : "extension"},

			/**
			 * Columns of the Table
			 */
			columns : {type : "sap.ui.table.Column", multiple : true, singularName : "column", bindable : "bindable", dnd : { layout: "Horizontal" } },

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
			 * {@link sap.ui.table.Table#setColumns columns} aggregation of the table.
			 * The actions of rows can be defined with the {@link sap.ui.table.Table#setRowActionTemplate rowActionTemplate} aggregation of the table.
			 * Furthermore, row-specific settings can be defined with the {@link sap.ui.table.Table#setRowSettingsTemplate rowSettingsTemplate}
			 * aggregation of the table.
			 */
			rows : {type : "sap.ui.table.Row", multiple : true, singularName : "row", bindable : "bindable", selector : "#{id}-tableCCnt", dnd : true},

			// TODO: should row modes be implemented as plugins?
			// TODO: The type should be sap.ui.table.rowmodes.RowMode, but then the build fails because RowMode is a private class.
			/**
			 * Row mode
			 *
			 * @private
			 * @ui5-restricted sap.ui.mdc
			 */
			rowMode : {type : "sap.ui.core.Element", multiple : false, visibility : "hidden"},

			/**
			 * This row can be used for user input to create new data.
			 * Like in any other row, the cells of this row are also managed by the table and must not be modified. The cell content is defined
			 * via the <code>creationTemplate</code> aggregation of the {@link sap.ui.table.Column}.
			 * If the creation row is set, the busy indicator will no longer cover the horizontal scrollbar, even if the creation row is invisible.
			 *
			 * @private
			 * @ui5-restricted sap.ui.mdc
			 */
			creationRow : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

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
			contextMenu : {type : "sap.ui.core.IContextMenu", multiple : false},

			/**
			 * Plugin section of the table. Multiple plugins are possible, but always only <b>one</b> of a certain type.
			 *
			 * The following restrictions apply:
			 * <ul>
			 *  <li>If a selection plugin is applied to the table, the table's selection API must not be used. Instead, use the API of the
			 *      plugin.</li>
			 *  <li>Only one MultiSelectionPlugin can be applied. No other plugins can be applied.</li>
			 * </ul>
			 *
			 * @since 1.64
			 */
			plugins : {type : "sap.ui.table.plugins.SelectionPlugin", multiple : true, singularName : "plugin"},

			/**
			 * Defines the message strip to display binding-related messages.
			 * @since 1.73
			 */
			_messageStrip: {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

			/**
			 * Hidden dependents are dependents that are not cloned. But like for normal dependents, their databinding context and
			 * lifecycle are bound to the table.
			 * @since 1.75
			 */
			_hiddenDependents : {type : "sap.ui.core.Element", multiple : true, visibility : "hidden"}
		},
		associations : {

			/**
			 * The column by which the table is grouped. Grouping will only be performed if <code>enableGrouping</code> is set to <code>true</code>.
			 * Setting <code>groupBy</code> in the view does not work and throws an error. It can only be set if the column by which the table
			 * is grouped is already part of the <code>columns</code> aggregation of the table.
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
			 *
			 * <b>Note:</b> If a selection plugin is applied to the table, this event won't be fired.
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
					newVisible : {type : "boolean"}
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
				},
				deprecated: true
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
			},

			/**
			 * This event gets fired when the user pastes content from the clipboard to the table.
			 * Pasting can be done via the context menu or the standard paste keyboard shortcut, if the focus is inside the table.
			 * @since 1.60
			 */
			paste : {
				allowPreventDefault: true,
				parameters : {
					/**
					 * 2D array of strings with data from the clipboard. The first dimension represents the rows, and the
					 * second dimension represents the cells of the tabular data.
					 */
					data : {type : "string[][]"}
				}
			}
		},
		designtime:  "sap/ui/table/designtime/Table.designtime"
	}});

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
	 * @returns sap.ui.core.dnd.DragDropBase[]
	 * @function
	 * @public
	 * @since 1.52
	 */


	// =============================================================================
	// BASIC CONTROL API
	// =============================================================================

	IconPool.insertFontFaceStyle();

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

		this._attachExtensions(); // Extensions are an inner part of the table must be initialized first, e.g. for correct delegate order.

		// create an information object which contains always required infos
		this._bRtlMode = sap.ui.getCore().getConfiguration().getRTL();

		// Will be set to true in updateTableSizes, if the table is in a flex container (parent has "display: flex").
		this._bIsFlexItem = false;

		/*
		 * Flag indicating whether the rows are currently being bound. This is the time between #bindRows and the actual instantiation of the
		 * binding object in #_bindAggregation.
		 *
		 * @type {boolean}
		 */
		this._bRowsBeingBound = false;

		/*
		 * Flag indicating whether the binding is ready. Will be set to <code>true</code> on <code>refreshRows</code> for OData bindings, and on
		 * <code>updateRows</code> for client bindings, before any <code>refreshRows</code> or <code>updateRows</code> hooks are called.
		 *
		 * @type {boolean}
		 */
		this._bBindingReady = false;

		/*
		 * Flag indicating whether the binding context are available. Will be set to <code>true</code> on <code>updateRows</code>, if the binding
		 * is ready, before any <code>updateRows</code> hooks are called.
		 *
		 * @type {boolean}
		 */
		this._bContextsAvailable = false;

		this._aRowClones = [];
		this._bRowAggregationInvalid = true;
		this._mTimeouts = {};
		this._mAnimationFrames = {};

		// TBD: Tooltips are not desired by Visual Design, discuss whether to switch it off by default
		this._bHideStandardTooltips = false;

		this._aRowHeights = [];
		this._iRenderedFirstVisibleRow = 0;
		this._aSortedColumns = [];
		this._aTableHeaders = [];

		// text selection for column headers?
		this._bAllowColumnHeaderTextSelection = false;

		this._iPendingRequests = 0;
		this._bPendingRequest = false; // Fallback in case a counter is not applicable.
		this._iBindingLength = null;

		this._bFirstRendering = true;

		this._nDevicePixelRatio = window.devicePixelRatio;

		if (sap.ui.getCore().isThemeApplied()) {
			TableUtils.readThemeParameters();
		}

		this._bInvalid = true;
	};

	/**
	 * @inheritDoc
	 */
	Table.prototype.applySettings = function(mSettings, oScope) {
		// Some settings might rely on the existence of a row mode or plugin. If row modes and plugins are in the settings and applied before
		// other settings, initialization of legacy row modes and plugins can be avoided.
		if (mSettings) {
			var aEarlySettings = ["rowMode", "plugins"];
			var mEarlySettings = {};

			for (var i = 0; i < aEarlySettings.length; i++) {
				var sSetting = aEarlySettings[i];

				if (sSetting in mSettings) {
					mEarlySettings[sSetting] = mSettings[sSetting];
					delete mSettings[sSetting]; // Avoid applying it twice.
				}
			}

			if (Object.keys(mEarlySettings).length > 0) {
				Control.prototype.applySettings.call(this, mEarlySettings, oScope);
			}
		}

		this._initLegacyRowMode();
		this._initLegacySelectionPlugin();

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
		this._bExtensionsInitialized = true;
	};


	/**
	 * Termination of the Table control
	 * @private
	 */
	Table.prototype.exit = function() {
		this.invalidateRowsAggregation();
		this._detachExtensions();

		if (this._dataReceivedHandlerId) {
			clearTimeout(this._dataReceivedHandlerId);
			delete this._dataReceivedHandlerId;
		}
		this._cleanUpTimers();
		this._detachEvents();

		TableUtils.Menu.cleanupDefaultContentCellContextMenu(this);

		delete this._aTableHeaders;
	};


	/**
	 * Detach table extensions
	 * @private
	 */
	Table.prototype._detachExtensions = function(){
		ExtensionBase.cleanup(this);
	};

	/**
	 * Handles paste event and fires Paste event of the Table , so that it can be used in the application
	 * @private
	 * @param oEvent - browser paste event that occurs when a user pastes the data from the clipboard into the table
	 */
	Table.prototype.onpaste = function(oEvent) {

		// Check whether the paste event is already handled by input enabled control and avoid pasting into this input-enabled control when focus is in there.
		if (oEvent.isMarked() || /^(input|textarea)$/i.test(oEvent.target.tagName) || !this.getDomRef("sapUiTableCnt").contains(oEvent.target)) {
			return;
		}

		// Get the data from the PasteHelper utility in format of 2D Array
		var aData = PasteHelper.getPastedDataAs2DArray(oEvent.originalEvent);

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
	Table.prototype.onlocalizationChanged = function(oEvent) {
		var oChanges = oEvent.changes || {};
		var bRtlChanged = oChanges.hasOwnProperty("rtl");
		var bLangChanged = oChanges.hasOwnProperty("language");
		this._adaptLocalization(bRtlChanged, bLangChanged).then(function() {
			this.invalidate();
		}.bind(this));
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

		var pUpdateLocalizationInfo = Promise.resolve();

		if (bRtlChanged) {
			this._bRtlMode = sap.ui.getCore().getConfiguration().getRTL();
		}

		if (bLangChanged) {
			pUpdateLocalizationInfo = TableUtils.getResourceBundle({async: true, reload: true});
		}

		return pUpdateLocalizationInfo.then(function() {
			if (bLangChanged) {
				// Clear the cell context menu.
				TableUtils.Menu.cleanupDefaultContentCellContextMenu(this);

				// Update the column menus.
				this._invalidateColumnMenus();
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
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return [];
		}

		var iBaseRowHeight = this._getBaseRowHeight();
		var sRowCSSClass = bHeader ? ".sapUiTableColHdrTr" : ".sapUiTableTr";
		var aRowsInFixedColumnsArea = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr" + sRowCSSClass);
		var aRowsInScrollableColumnsArea = oDomRef.querySelectorAll(".sapUiTableCtrlScroll > tbody > tr" + sRowCSSClass);
		var iRowCount = bHeader ? TableUtils.getHeaderRowCount(this) : this.getRows().length;
		var aRowHeights = [];
		var bIsZoomedInChrome = Device.browser.chrome && window.devicePixelRatio != 1;

		if (bHeader) {
			if (this.getColumnHeaderHeight() > 0) {
				iBaseRowHeight = this.getColumnHeaderHeight();
			} else if (this.getRowMode()) {
				iBaseRowHeight = this._getDefaultRowHeight();
			}
		}

		for (var i = 0; i < iRowCount; i++) {
			var nFixedColumnsAreaRowHeight = aRowsInFixedColumnsArea[i] ? aRowsInFixedColumnsArea[i].getBoundingClientRect().height : 0;
			var nScrollableColumnsAreaRowHeight = aRowsInScrollableColumnsArea[i] ? aRowsInScrollableColumnsArea[i].getBoundingClientRect().height : 0;
			var nRowHeight = Math.max(nFixedColumnsAreaRowHeight, nScrollableColumnsAreaRowHeight);

			if (bIsZoomedInChrome) {
				var nHeightDeviation = iBaseRowHeight - nRowHeight;

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
				var aModifiedHeights = oSyncExtension.syncRowHeights(aRowHeights.slice());
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
		var iRowHeight = this._getBaseRowHeight();

		var sRowHeight = "";
		if (iRowHeight) {
			sRowHeight = iRowHeight + "px";
		}

		var oDomRef = this.getDomRef("tableCCnt");
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
		var oDomRef = this.getDomRef();
		if (oDomRef) {
			var aRowItems = oDomRef.querySelectorAll(".sapUiTableColHdrTr");
			for (var i = 0; i < aRowItems.length; i++) {
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

		var iFixedColumnCount = this.getFixedColumnCount();
		var iFixedHeaderWidthSum = 0;

		if (iFixedColumnCount) {
			var aColumns = this.getColumns();
			var aHeaderElements = oDomRef.querySelectorAll(".sapUiTableCtrlFirstCol:not(.sapUiTableCHTHR) > th");

			for (var i = 0; i < aHeaderElements.length; i++) {
				var iColIndex = parseInt(aHeaderElements[i].getAttribute("data-sap-ui-headcolindex"));

				if (!isNaN(iColIndex) && (iColIndex < iFixedColumnCount)) {
					var oColumn = aColumns[iColIndex];
					var iWidth;

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
			var oScrollExtension = this._getScrollExtension();
			var iUsedHorizontalTableSpace = oSizes.tableRowHdrScrWidth;

			var oVSb = oScrollExtension.getVerticalScrollbar();
			if (oVSb && !oScrollExtension.isVerticalScrollbarExternal()) {
				iUsedHorizontalTableSpace += oVSb.offsetWidth;
			}

			if (TableUtils.hasRowActions(this)) {
				var oRowActions = this.getDomRef("sapUiTableRowActionScr");
				if (oRowActions) {
					iUsedHorizontalTableSpace += oRowActions.offsetWidth;
				}
			}

			iUsedHorizontalTableSpace += TableUtils.Column.getMinColumnWidth();

			var iAvailableSpace = oSizes.tableCntWidth - iUsedHorizontalTableSpace;
			var bFixedColumnsFitIntoTable = iAvailableSpace > iFixedHeaderWidthSum;
			var bIgnoreFixedColumnCountCandidate = !bFixedColumnsFitIntoTable;

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
	 * Synchronizes the row heights.
	 * @param {boolean} bHeader update of column headers if true, otherwise update data rows.
	 * @private
	 */
	Table.prototype._updateRowHeights = function(aRowItemHeights, bHeader) {
		var oDomRef = this.getDomRef();
		if (!oDomRef) {
			return;
		}

		function updateRow(row, index) {
			var rowHeight = aRowItemHeights[index];
			if (rowHeight) {
				row.style.height = rowHeight + "px";
			}
		}

		// select rows
		var cssClass = bHeader ? ".sapUiTableColHdrTr" : ".sapUiTableTr";
		var aRowHeaderItems = bHeader ? [] : oDomRef.querySelectorAll(".sapUiTableRowSelectionCell");
		var aRowActionItems = bHeader ? [] : oDomRef.querySelectorAll(".sapUiTableRowActionCell");
		var aFixedRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlFixed > tbody > tr" + cssClass);
		var aScrollRowItems = oDomRef.querySelectorAll(".sapUiTableCtrlScroll > tbody > tr" + cssClass);

		Array.prototype.forEach.call(aRowHeaderItems, updateRow);
		Array.prototype.forEach.call(aRowActionItems, updateRow);
		Array.prototype.forEach.call(aFixedRowItems, updateRow);
		Array.prototype.forEach.call(aScrollRowItems, updateRow);
	};

	/**
	 * Rerendering handling
	 * @private
	 */
	Table.prototype.onBeforeRendering = function(oEvent) {
		// The table can be re-rendered as part of the rendering of its parent, without being invalidated before.
		this._bInvalid = true;

		this._detachEvents();

		if (oEvent && oEvent.isMarked("renderRows")) {
			return;
		}

		this._cleanUpTimers();
		this.getBinding("rows"); // Initializes the experimental grouping functionality (just in case it is required).
		this._aTableHeaders = []; // free references to DOM elements
	};

	/**
	 * Rerendering handling
	 * @private
	 */
	Table.prototype.onAfterRendering = function(oEvent) {
		var bRenderedRows = oEvent && oEvent.isMarked("renderRows");

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
		var aRows = this.getRows();
		for (var i = 0; i < aRows.length; i++) {
			aRows[i].initDomRefs();
		}
	};

	/**
	 * First collects all table sizes, then synchronizes row/column heights, updates scrollbars and selection.
	 * @private
	 */
	Table.prototype._updateTableSizes = function(sReason, bSkipResetRowHeights) {
		bSkipResetRowHeights = bSkipResetRowHeights === true;

		var oDomRef = this.getDomRef();

		if (this._bInvalid || !oDomRef || !sap.ui.getCore().isThemeApplied() || oDomRef.offsetWidth === 0) {
			return;
		}

		if (!bSkipResetRowHeights) {
			this._resetRowHeights();
			this._resetColumnHeaderHeights();
		}

		this._aRowHeights = this._collectRowHeights(false);
		var aColumnHeaderRowHeights = this._collectRowHeights(true);

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
				var iDomWidth;
				for (var i = 0; i < aNotFixedVariableColumns.length; i++) {
					iDomWidth = aNotFixedVariableColumns[i].header && aNotFixedVariableColumns[i].header.offsetWidth;
					aNotFixedVariableColumns[i].newWidth = calcNewWidth(iDomWidth, aNotFixedVariableColumns[i].minWidth);
					if (parseInt(aNotFixedVariableColumns[i].newWidth) >= 0) {
						adaptColWidth(aNotFixedVariableColumns[i]);
					}
				}
			}
		}
		setMinColWidths(this);

		var oTableSizes = this._collectTableSizes();

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

		var oScrollExtension = this._getScrollExtension();
		oScrollExtension.updateHorizontalScrollbar(oTableSizes);
		oScrollExtension.updateVerticalScrollbarPosition();
		oScrollExtension.updateVerticalScrollbarVisibility();

		var $this = this.$();

		if (TableUtils.hasRowActions(this) || TableUtils.hasRowNavigationIndicators(this)) {
			var bHasFlexibleRowActions = $this.hasClass("sapUiTableRActFlexible");
			var oDummyColumn = this.getDomRef("dummycolhdr");

			if (oDummyColumn) {
				// This complexity is required because of Chrome's zoom math.
				var oTableElement = this.getDomRef("header");
				var iTableWidth = oTableElement.clientWidth;
				var iColumnsWidth = this.getColumns().reduce(function(iColumnsWidth, oColumn) {
					if (oColumn.getDomRef() && oColumn.getIndex() >= this.getComputedFixedColumnCount()) {
						return iColumnsWidth + TableUtils.convertCSSSizeToPixel(oColumn.getWidth());
					}
					return iColumnsWidth;
				}.bind(this), 0);
				var iDummyColWidth = oDummyColumn.clientWidth;
				var bDummyColumnHasWidth = iTableWidth > iColumnsWidth;

				if (!bHasFlexibleRowActions && bDummyColumnHasWidth) {
					var iRowActionPos = oTableSizes.tableCtrlScrWidth + oTableSizes.tableRowHdrScrWidth + oTableSizes.tableCtrlFixedWidth - iDummyColWidth;
					var oRowActionStyles = {};
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
		var oDomRef = this.getDomRef();

		if (!oDomRef || this._getRowCounts().fixedBottom === 0) {
			return;
		}

		var iFirstFixedButtomRowIndex = TableUtils.getFirstFixedBottomRowIndex(this);
		var aRows = this.getRows();
		var $rowDomRefs;

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
			jQuery(document.getElementById(mFocusInfo.customId)).focus();
		} else {
			Element.prototype.applyFocusInfo.apply(this, arguments);
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
	 *
	 * @param {sap.ui.table.SelectionMode} sSelectionMode the selection mode, see sap.ui.table.SelectionMode
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Table.prototype.setSelectionMode = function(sSelectionMode) {
		if (sSelectionMode === SelectionMode.Multi) {
			sSelectionMode = SelectionMode.MultiToggle;
			Log.warning("The selection mode 'Multi' is deprecated and must not be used anymore."
						+ " Your setting was defaulted to selection mode 'MultiToggle'", this);
		}

		if (this._hasSelectionPlugin()) {
			Log.error("If a selection plugin is applied to the table, the selection mode is controlled by the plugin.", this);
		} else {
			this.setProperty("selectionMode", sSelectionMode);
			this._oLegacySelectionPlugin.setSelectionMode(sSelectionMode);
		}

		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFirstVisibleRow = function(iRowIndex) {
		this.setFirstVisibleRowIndex(iRowIndex);
		return this;
	};

	/**
	 * Sets the first visible row property of the table, updates the rows, and fires the <code>firstVisibleRowChanged</code> event.
	 *
	 * @param {int} iRowIndex The new first visible row index.
	 * @param {boolean} [bOnScroll=false] Whether the first visible row is changed by scrolling.
	 * @param {boolean} [bSuppressEvent=false] Whether the <code>firstVisibleRowChanged</code> event should be fired.
	 * @param {boolean} [bSuppressRendering=false] Whether the first visible row should only be set, without re-rendering the rows.
	 * @returns {boolean} Whether the <code>_rowsUpdated</code> event will be fired.
	 * @private
	 */
	Table.prototype.setFirstVisibleRowIndex = function(iRowIndex, bOnScroll, bSuppressEvent, bSuppressRendering) {
		bOnScroll = bOnScroll === true;
		bSuppressEvent = bSuppressEvent === true;
		bSuppressRendering = bSuppressRendering === true;

		if (parseInt(iRowIndex) < 0) {
			Log.error("The index of the first visible row must be greater than or equal to 0. The value has been set to 0.", this);
			iRowIndex = 0;
		}

		if (this._getTotalRowCount() > 0) {
			var iMaxRowIndex = this._getMaxFirstVisibleRowIndex();

			if (iMaxRowIndex < iRowIndex) {
				if (!bOnScroll) {
					Log.warning(
						"The index of the first visible row must be lesser or equal than the scrollable row count minus the visible row count." +
						" The value has been set to " + iMaxRowIndex + ".", this);
				}

				iRowIndex = iMaxRowIndex;
			}
		}

		var bFirstVisibleRowChanged = this.getFirstVisibleRow() != iRowIndex;
		var oScrollExtension = this._getScrollExtension();
		var bExpectRowsUpdatedEvent = false;

		if (bFirstVisibleRowChanged) {
			var iOldFirstRenderedRowIndex = this._getFirstRenderedRowIndex();

			// Prevent re-rendering of the table, just update the rows.
			this.setProperty("firstVisibleRow", iRowIndex, true);

			if (this.getBinding("rows")) {
				var bFirstRenderedRowChanged = this._getFirstRenderedRowIndex() !== iOldFirstRenderedRowIndex;

				if (bFirstRenderedRowChanged && !bSuppressRendering) {
					var sReason = bOnScroll ? TableUtils.RowsUpdateReason.VerticalScroll : TableUtils.RowsUpdateReason.FirstVisibleRowChange;
					this.updateRows(sReason);
					bExpectRowsUpdatedEvent = true;
				}

				// If changing the first visible row was initiated by a scroll action, the scroll position is already accurate.
				// If the first visible row is set to the maximum row index, the table is scrolled to the bottom including the overflow.
				if (!bOnScroll) {
					oScrollExtension.updateVerticalScrollPosition(bFirstRenderedRowChanged);
				}
			}

			if (!bSuppressEvent) {
				this.fireFirstVisibleRowChanged({
					firstVisibleRow: iRowIndex
				});
			}
		} else if (!bOnScroll) {
			// Even if the first visible row was not changed, this row may not be visible because of the inner scroll position. Therefore, the
			// scroll position is adjusted to make it visible (by resetting the inner scroll position).
			oScrollExtension.updateVerticalScrollPosition();
		}

		return bExpectRowsUpdatedEvent;
	};

	// enable calling 'bindAggregation("rows")' without a factory
	Table.getMetadata().getAggregation("rows")._doesNotRequireFactory = true;

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.bindAggregation = function(sName, oBindingInfo) {
		if (sName === "rows") {
			this._bindRows(getSanitizedBindingInfo(Array.prototype.slice.call(arguments, 1)));
			return this;
		}

		return Control.prototype.bindAggregation.apply(this, arguments);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.bindRows = function(oBindingInfo) {
		this._bindRows(getSanitizedBindingInfo(arguments));
		return this;
	};

	Table.prototype._bindRows = function(oBindingInfo) {
		initBindingFlags(this);

		// Temporary fix for the Support Assistant hacks. Support Assistant should implement a selection plugin.
		// TODO: Before we recommend to implement a selection plugin -> Complete BLI CPOUIFTEAMB-1464
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

		if (this.getEnableBusyIndicator()) {
			this.setBusy(false);
		}

		TableUtils.Hook.call(this, Hook.BindRows, oBindingInfo);
		Control.prototype.bindAggregation.call(this, "rows", oBindingInfo);
		this._bRowsBeingBound = false;
	};

	/**
	 * This function will be called by either by {@link sap.ui.base.ManagedObject#bindAggregation} or {@link sap.ui.base.ManagedObject#setModel}.
	 *
	 * @override {@link sap.ui.base.ManagedObject#_bindAggregation}
	 */
	Table.prototype._bindAggregation = function(sName, oBindingInfo) {
		if (sName === "rows") {
			// If only the model has been changed, the ManagedObject only calls _bindAggregation while bindAggregation / bindRows is not called.
			initBindingFlags(this);
		}

		// Create the binding.
		Control.prototype._bindAggregation.call(this, sName, oBindingInfo);

		if (sName === "rows") {
			var oBinding = this.getBinding("rows");
			var oModel = oBinding ? oBinding.getModel() : null;

			this._bRowsBeingBound = false;
			TableUtils.Hook.call(this, Hook.RowsBound, oBinding);
			this._getSelectionPlugin()._setBinding(oBinding);

			if (oModel && oModel.getDefaultBindingMode() === BindingMode.OneTime) {
				Log.error("The binding mode of the model is set to \"OneTime\"."
						  + " This binding mode is not supported for the \"rows\" aggregation!"
						  + " Scrolling can not be performed.", this);
			}
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.unbindAggregation = function(sName, bSuppressReset) {
		if (sName === "rows") {
			this._unbindRows();
			return this;
		}

		return Control.prototype.unbindAggregation.apply(this, arguments);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.unbindRows = function() {
		this._unbindRows();
		return this;
	};

	Table.prototype._unbindRows = function() {
		TableUtils.Hook.call(this, Hook.UnbindRows, this.getBinding("rows"));
		Control.prototype.unbindAggregation.call(this, "rows", true);
		this._getSelectionPlugin()._setBinding(null);

		// We don't further react to unbind operations that are part of rebind and destruction
		// to avoid unnecessary DOM updates and UI flickering.
		if (this._bRowsBeingBound || this.bIsDestroyed || this._bIsBeingDestroyed) {
			return;
		}

		this._adjustToTotalRowCount();
		TableUtils.Hook.call(this, Hook.RowsUnbound);
	};

	function initBindingFlags(oTable) {
		oTable._bRowsBeingBound = true;
		oTable._bBindingReady = false;
		oTable._bContextsAvailable = false;
		oTable._iPendingRequests = 0;
		oTable._bPendingRequest = false;
		oTable._iBindingLength = null;
	}

	/**
	 * Converts old binding configuration APIs to the new API.
	 *
	 * @param {...*} [args] Binding configuration arguments.
	 * @returns {Object|null} The binding info object or null.
	 * @private
	 */
	function getSanitizedBindingInfo(args) {
		var oBindingInfo;

		if (args == null || args[0] == null) {
			oBindingInfo = {};
		} else if (typeof args[0] === "string") {
			/* Old API compatibility */

			// (sPath, vTemplate, oSorter, aFilters)
			var sPath = args[0];
			var oTemplate = args[1];
			var oSorter = args[2];
			var aFilters = args[3];

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
		var fOriginalHandler = oBindingInfo.events[sEventName];

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
	Table.prototype._onBindingChange = function(oEvent) {
		var sReason = oEvent.getParameter("reason");

		if (sReason === ChangeReason.Sort || sReason === ChangeReason.Filter) {
			this.setFirstVisibleRow(0);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setRowMode = function(oRowMode) {
		this._destroyLegacyRowMode();
		this.setAggregation("rowMode", oRowMode);
		this._initLegacyRowMode();
	};

	// this method can be removed when the aggregation is made public
	Table.prototype.getRowMode = function() {
		return this.getAggregation("rowMode");
	};

	/**
	 * Gets the row mode of the table. If no row mode is set, a legacy row mode is returned.
	 *
	 * @returns {sap.ui.table.rowmodes.RowMode} The row mode of the table.
	 * @private
	 */
	Table.prototype._getRowMode = function() {
		var oRowMode = this.getRowMode() || this._oLegacyRowMode;

		if (!oRowMode) {
			// To avoid null checks everywhere if the row mode is accessed after destroying the table.
			this._initLegacyRowMode();
			oRowMode = this._oLegacyRowMode;
		}

		return oRowMode;
	};

	/**
	 * Initializes a legacy row mode based on the <code>visibleRowCountMode</code> property, if no row mode is set in the <code>rowMode</code>
	 * aggregation.
	 *
	 * @private
	 */
	Table.prototype._initLegacyRowMode = function() {
		if (this._oLegacyRowMode || this.getRowMode()) {
			// No legacy row mode needs to be created if it already exists, or if a row mode is set.
			return;
		}

		this._oLegacyRowMode = createLegacyRowMode(this);
		this.addAggregation("_hiddenDependents", this._oLegacyRowMode);
	};

	Table.prototype._destroyLegacyRowMode = function() {
		if (this._oLegacyRowMode) {
			this._oLegacyRowMode.destroy();
			delete this._oLegacyRowMode;
		}
	};

	function createLegacyRowMode(oTable) {
		var oRowMode;

		switch (oTable.getVisibleRowCountMode()) {
			case VisibleRowCountMode.Fixed:
				oRowMode = new FixedRowMode(true);
				break;
			case VisibleRowCountMode.Interactive:
				oRowMode = new InteractiveRowMode(true);
				break;
			case VisibleRowCountMode.Auto:
				oRowMode = new AutoRowMode(true);
				break;
			default:
		}

		return oRowMode;
	}

	/**
	 * Gets the numbers of scrollable and fixed rows as they are currently computed by the row mode that is applied to the table.
	 *
	 * @returns {{count: int, scrollable: int, fixedTop: int, fixedBottom: int}} The numbers of scrollable and fixed rows.
	 * @private
	 */
	Table.prototype._getRowCounts = function() {
		return this._getRowMode().getComputedRowCounts();
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setVisibleRowCountMode = function(sVisibleRowCountMode) {
		if (this.getRowMode()) {
			Log.warning("If the \"rowMode\" aggregation is set, setting the \"visibleRowCountMode\" has no effect");
			return this.setProperty("visibleRowCountMode", sVisibleRowCountMode, true);
		}

		var sOldVisibleRowCountMode = this.getVisibleRowCountMode();
		this.setProperty("visibleRowCountMode", sVisibleRowCountMode);
		var sNewVisibleRowCountMode = this.getVisibleRowCountMode();

		if (sNewVisibleRowCountMode !== sOldVisibleRowCountMode) {
			this._destroyLegacyRowMode();
			this._initLegacyRowMode();
		}

		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setVisibleRowCount = function(iVisibleRowCount) {
		var sVisibleRowCountMode = this.getVisibleRowCountMode();
		if (sVisibleRowCountMode == VisibleRowCountMode.Auto) {
			Log.error("VisibleRowCount will be ignored since VisibleRowCountMode is set to Auto", this);
			return this;
		}

		if (iVisibleRowCount != null && !isFinite(iVisibleRowCount)) {
			return this;
		}

		var iFixedRowsCount = this.getFixedRowCount() + this.getFixedBottomRowCount();
		if (iVisibleRowCount <= iFixedRowsCount && iFixedRowsCount > 0) {
			Log.error("Table: " + this.getId() + " visibleRowCount('" + iVisibleRowCount + "') must be bigger than number of"
					  + " fixed rows('" + (this.getFixedRowCount() + this.getFixedBottomRowCount()) + "')", this);
			return this;
		}

		if (this.getRowMode()) {
			Log.warning("If the \"rowMode\" aggregation is set, setting the \"visibleRowCount\" has no effect");
			return this.setProperty("visibleRowCount", iVisibleRowCount, true);
		}

		iVisibleRowCount = this.validateProperty("visibleRowCount", iVisibleRowCount);
		if (this.getBinding("rows") && this._getTotalRowCount() <= iVisibleRowCount) {
			this.setProperty("firstVisibleRow", 0);
		}
		this.setProperty("visibleRowCount", iVisibleRowCount);

		TableUtils.dynamicCall(this._getSyncExtension, function(oSyncExtension) {
			oSyncExtension.syncRowCount(iVisibleRowCount);
		});

		return this;
	};

	Table.prototype.setMinAutoRowCount = function(iMinAutoRowCount) {
		if (parseInt(iMinAutoRowCount) < 1) {
			Log.error("The minAutoRowCount property must be greater than 0. The value has been set to 1.", this);
			iMinAutoRowCount = 1;
		}

		if (this.getRowMode()) {
			Log.warning("If the \"rowMode\" aggregation is set, setting the \"minAutoRowCount\" has no effect");
			return this.setProperty("minAutoRowCount", iMinAutoRowCount, true);
		}

		return this.setProperty("minAutoRowCount", iMinAutoRowCount);
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
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @override
	 */
	Table.prototype.setTooltip = function(vTooltip) {
		Log.warning("The aggregation tooltip is not supported for sap.ui.table.Table", this);
		return this.setAggregation("tooltip", vTooltip, true);
	};

	Table.prototype.setNavigationMode = function() {
		this.setProperty("navigationMode", NavigationMode.Scrollbar, true);
		Log.error("The navigationMode property is deprecated and must not be used anymore. Your setting was defaulted to 'Scrollbar'", this);
		return this;
	};

	/**
	 * Requests fixed bottom row contexts from the binding.
	 * @returns {sap.ui.model.Context[]} Array of fixed bottom row context
	 * @private
	 */
	Table.prototype._getFixedBottomRowContexts = function() {
		var mRowCounts = this._getRowCounts();
		var iTotalRowCount = this._getTotalRowCount();

		if (mRowCounts.fixedBottom > 0 && mRowCounts.count - mRowCounts.fixedBottom < iTotalRowCount) {
			return this._getContexts(iTotalRowCount - mRowCounts.fixedBottom, mRowCounts.fixedBottom);
		} else {
			return [];
		}
	};

	/**
	 * Requests fixed top row contexts from the binding.
	 * @returns {sap.ui.model.Context[]} Array of fixed top row context
	 * @private
	 */
	Table.prototype._getFixedRowContexts = function() {
		var mRowCounts = this._getRowCounts();

		if (mRowCounts.fixedTop > 0) {
			return this._getContexts(0, mRowCounts.fixedTop);
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
	 * @param {int} [iRequestLength=undefined] The amount of contexts to request. The default value is the number of rows in the rows aggregation.
	 * @param {boolean} [bSuppressAdjustToBindingLength=false] If set to <code>true</code>, no UI updates will be performed.
	 * @param {boolean} [bSecondCall=false] If this parameter is set to <code>true</code>, it means that the function called itself recursively.
	 * 										In this case some parts of the function will be skipped.
	 * @returns {Object[]} Array of row contexts returned from the binding.
	 * @private
	 */
	Table.prototype._getRowContexts = function(iRequestLength, bSuppressAdjustToBindingLength, bSecondCall) {
		var oBinding = this.getBinding("rows");
		var iRowCount = this.getRows().length;

		iRequestLength = iRequestLength == null ? iRowCount : iRequestLength;
		iRequestLength = Math.max(iRequestLength, this._getRowMode().getMinRequestLength());

		if (!oBinding || iRequestLength <= 0) {
			// Without binding there are no contexts to be retrieved.
			return [];
		}

		bSuppressAdjustToBindingLength = bSuppressAdjustToBindingLength === true;
		bSecondCall = bSecondCall === true;

		var iFirstVisibleRow = this._getFirstRenderedRowIndex();
		var mRowCounts = this._getRowCounts();
		var aContexts = [];
		var aTmpContexts;

		// because of the analytical table the fixed bottom row must always be requested separately as it is the grand
		// total row for the table.
		var iLength = iRequestLength - mRowCounts.fixedBottom;
		var iMergeOffsetScrollRows = 0;
		var iMergeOffsetBottomRow = iLength;

		// If the threshold is not explicitly disabled by setting it to 0, the default threshold should be the number of rows.
		var iThreshold = this.getThreshold();
		iThreshold = iThreshold ? Math.max(iRowCount, iThreshold) : 0;

		// data can be requested with a single getContexts call if the fixed rows and the scrollable rows overlap.
		var iStartIndex = iFirstVisibleRow;

		var fnMergeArrays = function(aTarget, aSource, iStartIndex) {
			for (var i = 0; i < aSource.length; i++) {
				aTarget[iStartIndex + i] = aSource[i];
			}
		};

		if (mRowCounts.fixedTop > 0 && iFirstVisibleRow > 0) {
			// since there is a gap between first visible row and fixed rows it must be requested separately
			// the first visible row always starts counting with 0 in the scroll part of the table no matter
			// how many fixed rows there are.
			iStartIndex = iFirstVisibleRow + mRowCounts.fixedTop;
			// length must be reduced by number of fixed rows since they were just requested separately
			iLength -= mRowCounts.fixedTop;
			iMergeOffsetScrollRows = mRowCounts.fixedTop;
			// retrieve fixed rows separately
			aTmpContexts = this._getFixedRowContexts();
			aContexts = aContexts.concat(aTmpContexts);
		}

		// request scroll part contexts but may include fixed rows depending on scroll and length settings
		// if this is done before requesting fixed bottom rows, it saves some performance for the analytical table
		// since the tree gets only build once (as result of getContexts call). If first the fixed bottom row would
		// be requested the analytical binding would build the tree twice.
		aTmpContexts = this._getContexts(iStartIndex, iLength, iThreshold);

		if (!bSuppressAdjustToBindingLength) {
			this._adjustToTotalRowCount();
		}

		var iTotalRowCount = this._getTotalRowCount();

		// get the binding length after getContext call to make sure that for TreeBindings the client tree was correctly rebuilt
		// this step can be moved to an earlier point when the TreeBindingAdapters all implement tree invalidation in case of getLength calls
		fnMergeArrays(aContexts, aTmpContexts, iMergeOffsetScrollRows);

		// request binding length after getContexts call to make sure that in case of tree binding and analytical binding
		// the tree gets only built once (by getContexts call).
		iMergeOffsetBottomRow = Math.min(iMergeOffsetBottomRow, Math.max(iTotalRowCount - mRowCounts.fixedBottom, 0));
		if (mRowCounts.fixedBottom > 0) {
			// retrieve fixed bottom rows separately
			// instead of just concatenating them to the existing contexts it must be made sure that they are put
			// to the correct row index otherwise they would flip into the scroll area in case data gets requested for
			// the scroll part.
			aTmpContexts = this._getFixedBottomRowContexts();
			fnMergeArrays(aContexts, aTmpContexts, iMergeOffsetBottomRow);
		}

		var iMaxRowIndex = this._getMaxFirstRenderedRowIndex();
		if (iMaxRowIndex < iFirstVisibleRow && this._bContextsAvailable && !bSecondCall) {
			// Get the contexts again, this time with the maximum possible value for the first visible row.
			this.setProperty("firstVisibleRow", iMaxRowIndex, true);
			aContexts = this._getRowContexts(iRequestLength, bSuppressAdjustToBindingLength, true);
		}

		return aContexts;
	};

	/**
	 * Updates the UI according to the current total row count.
	 *
	 * @private
	 */
	Table.prototype._adjustToTotalRowCount = function() {
		var oBinding = this.getBinding("rows");
		var iTotalRowCount = this._getTotalRowCount();
		var oScrollExtension = this._getScrollExtension();

		if (this._iBindingLength !== iTotalRowCount) {
			this._iBindingLength = iTotalRowCount;
			this._updateFixedBottomRows();
			oScrollExtension.adjustToTotalRowCount();

			if (!oBinding || !TableUtils.hasPendingRequests(this)) {
				// A client binding -or- an $expand filled list binding does not fire dataReceived events. Therefore we need to update the no data area here.
				// When the binding has been removed, the table might not be completely re-rendered (just the content). But the cached binding
				// length changes. In this case the no data area needs to be updated.
				this._updateNoData();
			}
		}
	};

	/**
	 * Refresh rows
	 * @private
	 */
	Table.prototype.refreshRows = function(sReason) {
		var oBinding = this.getBinding("rows");

		if (!oBinding) {
			Log.error("RefreshRows must not be called without a binding", this);
			return;
		}

		this._bBindingReady = true;
		this._bContextsAvailable = false;

		if (sReason === ChangeReason.Sort || sReason === ChangeReason.Filter) {
			this.setFirstVisibleRow(0);
		}

		TableUtils.Hook.call(this, Hook.RefreshRows, sReason);
	};

	/**
	 * Updates the rows - called internally by the updateAggregation function when
	 * anything in the model has been changed.
	 * @private
	 */
	Table.prototype.updateRows = function(sReason) {
		if (this.bIsDestroyed || this._bIsBeingDestroyed) {
			// During destruction, updateRows is called with reason "Unbind". In general, rows of a destroyed table should not be updated.
			return;
		}

		var oBinding = this.getBinding("rows");

		/*
		 * Special handling for client bindings. For OData bindings, the flag is set to "true" in refreshRows.
		 * - Client bindings do not fire a refresh event, but their length is final immediately.
		 * - If the length is final, we can consider the binding to be ready.
		 * - Client tree bindings do not implement #isLengthFinal. In this case we always consider the binding to be ready.
		 */
		if (!this._bBindingReady && (typeof oBinding.isLengthFinal !== "function" || oBinding.isLengthFinal())) {
			this._bBindingReady = true;
		}

		// The contexts cannot be available if updateRows is called while the binding is not ready.
		this._bContextsAvailable = this._bBindingReady;

		TableUtils.Hook.call(this, Hook.UpdateRows, sReason);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.insertRow = function() {
		Log.error("The control manages the rows aggregation. The method \"insertRow\" cannot be used programmatically!", this);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.addRow = function() {
		Log.error("The control manages the rows aggregation. The method \"addRow\" cannot be used programmatically!", this);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeRow = function() {
		Log.error("The control manages the rows aggregation. The method \"removeRow\" cannot be used programmatically!", this);
		return null;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeAllRows = function() {
		Log.error("The control manages the rows aggregation. The method \"removeAllRows\" cannot be used programmatically!", this);
		return [];
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.destroyRows = function() {
		Log.error("The control manages the rows aggregation. The method \"destroyRows\" cannot be used programmatically!", this);
		return this;
	};

	/**
	 * Sets the creation row.
	 *
	 * @param {sap.ui.table.CreationRow} oCreationRow Instance of the creation row
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
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
	 * Destroys the creation row.
	 *
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Table.prototype.destroyCreationRow = function() {
		return this.destroyAggregation("creationRow");
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
		ExtensionBase.attachEvents(this);
	};

	/**
	 * Detaches the required native event handlers.
	 * @private
	 */
	Table.prototype._detachEvents = function() {
		jQuery(document.body).off('webkitTransitionEnd transitionend');
		TableUtils.deregisterResizeHandler(this, "Table");
		Device.resize.detachHandler(this._onWindowResize, this);
		ExtensionBase.detachEvents(this);
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
	 * Show or hide the no data container.
	 * @private
	 */
	Table.prototype._updateNoData = function() {
		if (!this.getDomRef()) {
			return;
		}

		var oFocusRef = document.activeElement;
		this.$().toggleClass("sapUiTableEmpty", TableUtils.isNoColumnsVisible(this) || TableUtils.isNoDataVisible(this));
		this._getAccExtension().updateAriaStateForOverlayAndNoData();
		this._getKeyboardExtension().updateNoDataAndOverlayFocus(oFocusRef);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeColumn = function(oColumn, bSuppressInvalidate) {
		var oResult = this.removeAggregation('columns', oColumn, bSuppressInvalidate);

		if (typeof oColumn === "number" && oColumn > -1) {
			oColumn = this.getColumns()[oColumn];
		}

		var iIndex = this._aSortedColumns.indexOf(oColumn);
		if (!this._bReorderInProcess && iIndex >= 0) {
			this._aSortedColumns.splice(iIndex, 1);
		}
		this.invalidateRowsAggregation();

		var oCreationRow = this.getCreationRow();
		if (oCreationRow) {
			oCreationRow._update();
		}

		return oResult;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeAllColumns = function() {
		var oResult = this.removeAllAggregation('columns');
		this._aSortedColumns = [];
		this.invalidateRowsAggregation();

		var oCreationRow = this.getCreationRow();
		if (oCreationRow) {
			oCreationRow._update();
		}

		return oResult;
	};

	/*
	 * @see JSDoc generated by SAPUI5 contdrol API generator
	 */
	Table.prototype.destroyColumns = function() {
		var oResult = this.destroyAggregation('columns');
		this._aSortedColumns = [];
		this.invalidateRowsAggregation();

		var oCreationRow = this.getCreationRow();
		if (oCreationRow) {
			oCreationRow._update();
		}

		return oResult;
	};


	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.addColumn = function(oColumn, bSuppressInvalidate) {
		this.addAggregation('columns', oColumn, bSuppressInvalidate);
		this.invalidateRowsAggregation();

		var oCreationRow = this.getCreationRow();
		if (oCreationRow) {
			oCreationRow._update();
		}

		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.insertColumn = function(oColumn, iIndex, bSuppressInvalidate) {
		this.insertAggregation('columns', oColumn, iIndex, bSuppressInvalidate);
		this.invalidateRowsAggregation();

		var oCreationRow = this.getCreationRow();
		if (oCreationRow) {
			oCreationRow._update();
		}

		return this;
	};

	/**
	 * Returns the number of rows the <code>rows</code> aggregation is bound to.
	 *
	 * @returns {int} The total number of rows. Returns 0 if the <code>rows</code> aggregation is not bound.
	 * @private
	 */
	Table.prototype._getTotalRowCount = function() {
		var oBinding = this.getBinding("rows");
		var oBindingInfo = this.getBindingInfo("rows");

		if (!oBinding) {
			return 0;
		}

		if (oBindingInfo.length != null) {
			return oBindingInfo.length;
		}

		return oBinding.getLength();
	};

	/**
	 * Returns the maximum row index to which can be scrolled to
	 * @private
	 */
	Table.prototype._getMaxFirstVisibleRowIndex = function() {
		var iMaxRowIndex;

		if (TableUtils.isVariableRowHeightEnabled(this)) {
			iMaxRowIndex = this._getTotalRowCount() - 1;
		} else {
			iMaxRowIndex = this._getTotalRowCount() - this._getRowCounts().count;
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
			iMaxRowIndex = this._getTotalRowCount() - this._getRowCounts().count - 1;
		} else {
			iMaxRowIndex = this._getTotalRowCount() - this._getRowCounts().count;
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
				var iColumnWidth = TableUtils.convertCSSSizeToPixel(aCols[i].getWidth());

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
		var iOldWidth = oEvent.oldSize.width;
		var iNewWidth = oEvent.size.width;

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

	Table.prototype._adjustOutlineOffset = function(){
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
			bind("selectstart", function(oEvent) {
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
			unbind("selectstart");
	};

	/**
	 * clears the text selection on the document (disabled fro Dnd)
	 * @private
	 */
	Table.prototype._clearTextSelection = function() {
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
		var $cell = $target.closest(".sapUiTableDataCell");
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
			var sColId = Column.ofCell(oCell).getId();
			var oRowBindingContext = oRow.getRowBindingContext();
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
		if (oFocusedItemInfo) {
			return oFocusedItemInfo.domRef || Control.prototype.getFocusDomRef.apply(this, arguments);
		}

		return null;
	};

	// =============================================================================
	// SORTING & FILTERING
	// =============================================================================

	/**
	 * Pushes the sorted column to array.
	 *
	 * @param {sap.ui.table.Column} oColumn Column to be sorted
	 * @param {Boolean} bAdd Set to true to add the new sort criterion to the existing sort criteria
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
	 * Gets the sorted columns in the order in which sorting was performed through the {@link sap.ui.table.Table#sort} method and menus.
	 * Does not reflect sorting at binding level or the columns sort visualization set with {@link sap.ui.table.Column#setSorted} and
	 * {@link sap.ui.table.Column#setSortOrder}.
	 *
	 * @see sap.ui.table.Table#sort
	 * @returns {sap.ui.table.Column[]} Array of sorted columns
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
	 * @param {sap.ui.table.Column | undefined} oColumn Column to be sorted or undefined to clear sorting
	 * @param {sap.ui.table.SortOrder} oSortOrder Sort order of the column (if undefined the default will be ascending)
	 * @param {Boolean} bAdd Set to true to add the new sort criterion to the existing sort criteria
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

		if (this.getColumns().indexOf(oColumn) >= 0) {
			oColumn.sort(oSortOrder === SortOrder.Descending, bAdd);
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
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
		var oSelMode = this.getSelectionMode();
		if (oSelMode === SelectionMode.None) {
			// there is no selection which needs to be updated. With the switch of the
			// selection mode the selection was cleared (and updated within that step)
			return;
		}

		var mRenderConfig = this._getSelectionPlugin().getRenderConfig();
		var sSelectAllResourceTextID;
		var sSelectAllText;
		var $SelectAll = this.$("selall");

		// trigger the rows to update their selection
		var aRows = this.getRows();

		for (var i = 0; i < aRows.length; i++) {
			var oRow = aRows[i];
			oRow._updateSelection();
		}

		if (!mRenderConfig.headerSelector.visible) {
			return;
		}

		if (mRenderConfig.headerSelector.type === "toggle") {
			var bAllRowsSelected = TableUtils.areAllRowsSelected(this);

			$SelectAll.toggleClass("sapUiTableSelAll", !bAllRowsSelected);
			this._getAccExtension().setSelectAllState(bAllRowsSelected);

			sSelectAllResourceTextID = bAllRowsSelected ? "TBL_DESELECT_ALL" : "TBL_SELECT_ALL";
		} else if (mRenderConfig.headerSelector.type === "clear") {
			$SelectAll.toggleClass("sapUiTableSelAllDisabled", !mRenderConfig.headerSelector.enabled);
			sSelectAllResourceTextID = "TBL_DESELECT_ALL";

			if (mRenderConfig.headerSelector.enabled) {
				$SelectAll.removeAttr("aria-disabled");
			} else {
				$SelectAll.attr("aria-disabled", "true");
			}
		}

		if (sSelectAllResourceTextID) {
			sSelectAllText = TableUtils.getResourceText(sSelectAllResourceTextID);
			if (this._getShowStandardTooltips()) {
				$SelectAll.attr('title', sSelectAllText);
			} else if (mRenderConfig.headerSelector.type === "toggle") {
				this.getDomRef("ariaselectall").innerText = sSelectAllText;
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
		var oSelectionPlugin = this._getSelectionPlugin();
		var aRowIndices = oEvent.getParameter("rowIndices");
		var bSelectAll = oEvent.getParameter("selectAll");
		var iRowIndex = this._iSourceRowIndex !== undefined ? this._iSourceRowIndex : oSelectionPlugin.getSelectedIndex();

		this._updateSelection();

		// If a selection plugin is applied to the table, the "rowSelectionChange" event should not be fired.
		if (!this._hasSelectionPlugin()) {
			this.setProperty("selectedIndex", oSelectionPlugin.getSelectedIndex(), true);
			this.fireRowSelectionChange({
				rowIndex: iRowIndex,
				rowContext: this.getContextByIndex(iRowIndex),
				rowIndices: aRowIndices,
				selectAll: bSelectAll,
				userInteraction: this._iSourceRowIndex !== undefined
			});
		}
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
	 * @returns {sap.ui.model.Context | null} The context at this index or null
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.getContextByIndex = function(iIndex) {
		// TODO: ODataListBinding needs to make sure to prevent loading multiple times
		// index must not be smaller than 0! otherwise the ODataModel fails
		var oBinding = this.getBinding("rows");
		return iIndex >= 0 && oBinding ? oBinding.getContexts(iIndex, 1)[0] : null;
	};

	// =============================================================================
	// SELECTION API
	// =============================================================================

	/**
	 * @inheritDoc
	 * @throws {Error} If a selection plugin is applied
	 */
	Table.prototype.getSelectedIndex = function() {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#getSelectedIndex must not be called if a selection plugin is applied.");
		}

		return this._getSelectionPlugin().getSelectedIndex();
	};

	/**
	 * Sets the selected index. The previous selection is removed.
	 *
	 * @param {int} iIndex The index to select
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @returns {int[]} Selected indices
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @param {int} iIndexFrom Index from which the selection starts
	 * @param {int} iIndexTo Index up to which to select
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @param {int} iIndexFrom Index from which the deselection should start
	 * @param {int} iIndexTo Index up to which to deselect
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
	 * @param {int} iIndex Index to check for selection
	 * @returns {boolean} Whether the index is selected
	 * @throws {Error} If a selection plugin is applied
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Table.prototype.isIndexSelected = function(iIndex) {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#isIndexSelected must not be called if a selection plugin is applied.");
		}

		return this._getSelectionPlugin().isIndexSelected(iIndex);
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
		if (oGroupByColumn instanceof Column && oGroupByColumn !== oOldGroupByColumn) {

			// check for column being part of the columns aggregation
			if (this.getColumns().indexOf(oGroupByColumn) === -1) {
				throw new Error("Column has to be part of the columns aggregation!");
			}

			// fire the event (to allow to cancel the event)
			var bExecuteDefault = this.fireGroup({column: oGroupByColumn, groupedColumns: [oGroupByColumn.getId()], type: GroupEventType.group});

			// first we reset the grouping indicator of the old column (will show the column)
			if (oOldGroupByColumn) {
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
		if (!oGroupByColumn || bReset) {
			if (oOldGroupByColumn) {
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

		if (oGroupedByColumn) {
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

	/**
	 * In contrast to the function <code>getFixedColumnCount</code> which returns the value of the property <code>fixedColumnCount</code>, this
	 * function returns the actual fixed column count computed based on the table width.
	 *
	 * <b>Note:</b> The computed column count is only available after the table is fully rendered.
	 *
	 * @returns {int} The actual fixed column count computed based on the table width.
	 * @protected
	 */
	Table.prototype.getComputedFixedColumnCount = function() {
		if (this._bIgnoreFixedColumnCount) {
			return 0;
		}

		return this.getFixedColumnCount();
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
		if (!(parseInt(iFixedRowCount) >= 0)) {
			Log.error("Number of fixed rows must be greater or equal 0", this);
			return this;
		}

		if ((iFixedRowCount + this.getFixedBottomRowCount()) >= this.getVisibleRowCount()) {
			Log.error("Table '" + this.getId() + "' fixed rows('" + (iFixedRowCount + this.getFixedBottomRowCount()) + "') must be smaller than"
					  + " numberOfVisibleRows('" + this.getVisibleRowCount() + "')", this);
			return this;
		}

		if (this.getRowMode()) {
			Log.warning("If the \"rowMode\" aggregation is set, setting the \"fixedRowCount\" has no effect");
			return this.setProperty("fixedRowCount", iFixedRowCount, true);
		}

		return this.setProperty("fixedRowCount", iFixedRowCount);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.setFixedBottomRowCount = function(iFixedRowCount) {
		if (!(parseInt(iFixedRowCount) >= 0)) {
			Log.error("Number of fixed bottom rows must be greater or equal 0", this);
			return this;
		}

		if ((iFixedRowCount + this.getFixedRowCount()) >= this.getVisibleRowCount()) {
			Log.error("Table '" + this.getId() + "' fixed rows('" + (iFixedRowCount + this.getFixedRowCount()) + "') must be smaller than"
					  + " numberOfVisibleRows('" + this.getVisibleRowCount() + "')", this);
			return this;
		}

		if (this.getRowMode()) {
			Log.warning("If the \"rowMode\" aggregation is set, setting the \"iFixedBottomRowCount\" has no effect");
			return this.setProperty("fixedBottomRowCount", iFixedRowCount, true);
		}

		return this.setProperty("fixedBottomRowCount", iFixedRowCount);
	};

	/**
	 * Sets the threshold value, which will be added to all data requests in case the Table is bound against an OData service.
	 *
	 * @param {int} iThreshold The threshold
	 * @returns {sap.ui.table.Table} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	Table.prototype.setThreshold = function(iThreshold) {
		this.setProperty("threshold", iThreshold, true);
		return this;
	};

	/**
	 * Invalidates all column menus.
	 * @private
	 */
	Table.prototype._invalidateColumnMenus = function() {
		var aCols = this.getColumns();
		for (var i = 0, l = aCols.length; i < l; i++) {
			aCols[i].invalidateMenu();
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
		return !!(oEvent && oEvent.originalEvent && oEvent.originalEvent.touches);
	};

	Table.prototype._getRowClone = function(vIndex) {
		var bGetRowFromPool = typeof vIndex === "number";
		var oRowClone = bGetRowFromPool ? this._aRowClones[vIndex] : null;

		if (oRowClone && !oRowClone.bIsDestroyed) {
			return oRowClone;
		}

		// No intact row clone at this index exists. Therefore, create a new row clone.
		oRowClone = new Row(this.getId() + "-rows" + "-row" + vIndex);

		if (bGetRowFromPool) {
			this._aRowClones[vIndex] = oRowClone;
		}

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
	 * Gets the base row height. This number is a pixel value and is used, for example, for layout and scrolling calculations.
	 *
	 * @returns {int} The base row height.
	 * @private
	 */
	Table.prototype._getBaseRowHeight = function() {
		var iBaseRowContentHeight = this._getRowMode().getBaseRowContentHeight();

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
		var sContentDensity = TableUtils.getContentDensity(this);
		return TableUtils.DefaultRowHeight[sContentDensity];
	};

	/**
	 * Gets the default row content height. This number is a pixel value.
	 *
	 * @returns {int} The default row content height.
	 * @private
	 */
	Table.prototype._getDefaultRowContentHeight = function() {
		var sContentDensity = TableUtils.getContentDensity(this);
		return TableUtils.BaseSize[sContentDensity];
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
		var sOldNoDataText = TableUtils.getNoDataText(this);
		this.setAggregation("noData", vNoData, true);
		var sNewNoDataText = TableUtils.getNoDataText(this);

		// Avoid table re-rendering if only the text is changed. If the NoData text was, or will be a control, the table must be re-rendered.
		if (sOldNoDataText != null && sNewNoDataText != null) {
			// Old and new NoData texts are plain strings, therefore we are able to directly update the DOM in case of a text change.
			if (sOldNoDataText !== sNewNoDataText) {
				this.$("noDataMsg").text(sNewNoDataText);
			}
		} else {
			this.invalidate();
		}

		return this;
	};

	/**
	 * Creates a new {@link sap.ui.core.util.Export} object and fills row/column information from the table if not provided. For the cell content,
	 * the column's "sortProperty" will be used (experimental!)
	 *
	 * <p><b>Please note: This method uses synchronous requests. Support and functioning ends with the support for synchronous requests in
	 * browsers.</b></p>
	 *
	 * @param {object} [mSettings] settings for the new Export, see {@link sap.ui.core.util.Export} <code>constructor</code>
	 * @returns {sap.ui.core.util.Export} Export object
	 * @experimental Experimental because the property for the column/cell definitions (sortProperty) could change in future.
	 * @deprecated As of 1.56, replaced by the <code>sap.ui.export</code> library.
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
		if (!TableUtils.hasData(this) || this.getSelectionMode() !== SelectionMode.MultiToggle) {
			return;
		}

		var oSelectionPlugin = this._getSelectionPlugin();

		// in order to fire the rowSelectionChanged event, the SourceRowIndex mus be set to -1
		// to indicate that the selection was changed by user interaction
		if (TableUtils.areAllRowsSelected(this)) {
			this._iSourceRowIndex = -1;
			oSelectionPlugin.clearSelection();
		} else {
			this._iSourceRowIndex = 0;
			oSelectionPlugin.selectAll();
		}
		this._iSourceRowIndex = undefined;
	};

	Table.prototype.setBusy = function(bBusy, sBusySection) {
		var bBusyChanged = this.getBusy() != bBusy;

		sBusySection = "sapUiTableGridCnt";
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
	Table.prototype.setEnableBusyIndicator = function(bValue) {
		this.setProperty("enableBusyIndicator", bValue, true);
		if (!bValue) {
			this.setBusy(false);
		}
		return this;
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onBindingDataRequested = function(oEvent) {
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
			clearTimeout(this._dataReceivedHandlerId);
			delete this._dataReceivedHandlerId;
		}
	};

	/**
	 *
	 * @private
	 */
	Table.prototype._onBindingDataReceived = function(oEvent) {
		if (oEvent.getSource() != this.getBinding("rows") || oEvent.getParameter("__simulateAsyncAnalyticalBinding")) {
			return;
		}

		this._iPendingRequests--;
		this._bPendingRequest = false;

		// The AnalyticalBinding updates the length after it fires dataReceived, therefore the total row count will not change here. Later,
		// when the contexts are retrieved in Table#_getRowContexts, the AnalyticalBinding updates the length and Table#_adjustToTotalRowCount
		// will be called again and actually perform the update.
		this._adjustToTotalRowCount();

		if (!TableUtils.hasPendingRequests(this)) {
			// This timer should avoid flickering of the busy indicator and unnecessary updates of NoData in case a request will be sent
			// (dataRequested) immediately after the last response was received (dataReceived).
			this._dataReceivedHandlerId = setTimeout(function() {
				if (this.getEnableBusyIndicator()) {
					this.setBusy(false);
				}
				this._updateNoData();
				delete this._dataReceivedHandlerId;
			}.bind(this), 0);
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
		for (var i = 0; i < this._aRowClones.length; i++) {
			oRowAction = this._aRowClones[i].getRowAction();
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

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.addPlugin = function(oPlugin) {
		this.addAggregation("plugins", oPlugin);

		if (TableUtils.isA(oPlugin, "sap.ui.table.plugins.SelectionPlugin")) {
			this._initSelectionPlugin();
		}

		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.insertPlugin = function(oPlugin, iIndex) {
		this.insertAggregation("plugins", oPlugin, iIndex);

		if (TableUtils.isA(oPlugin, "sap.ui.table.plugins.SelectionPlugin")) {
			this._initSelectionPlugin();
		}

		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removePlugin = function(oPlugin) {
		var oRemovedPlugin = this.removeAggregation("plugins", oPlugin);

		if (TableUtils.isA(oRemovedPlugin, "sap.ui.table.plugins.SelectionPlugin")) {
			this._initSelectionPlugin();
		}

		return oRemovedPlugin;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.removeAllPlugins = function() {
		var aPlugins = this.removeAllAggregation("plugins");
		this._initSelectionPlugin();
		return aPlugins;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Table.prototype.destroyPlugins = function() {
		this.destroyAggregation('plugins');
		this._initSelectionPlugin();
		return this;
	};

	/**
	 * Gets the first plugin of a certain type.
	 *
	 * @param {string} sType The type of the plugin.
	 * @returns {sap.ui.table.plugins.SelectionPlugin|null} The first plugin of a certain type, or <code>null</code> if no plugin of this type exists.
	 * @private
	 */
	Table.prototype.getPlugin = function(sType) {
		if (typeof sType !== "string") {
			return null;
		}

		var aPlugins = this.getPlugins();

		for (var i = 0; i < aPlugins.length; i++) {
			if (aPlugins[i].isA(sType)) {
				return aPlugins[i];
			}
		}

		return null;
	};

	/**
	 * Gets the selection plugin. If no selection plugin is applied to the table, a legacy selection plugin is returned.
	 *
	 * @return {sap.ui.table.plugins.SelectionPlugin} The selection plugin.
	 * @private
	 */
	Table.prototype._getSelectionPlugin = function() {
		var oSelectionPlugin = this._oSelectionPlugin || this._oLegacySelectionPlugin;

		if (!oSelectionPlugin) {
			// To avoid null checks everywhere if the selection plugin is accessed after destroying the table.
			this._initLegacySelectionPlugin();
			oSelectionPlugin = this._oLegacySelectionPlugin;
		}

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

	/**
	 * Initializes the selection plugin used by the table. Attaches event listeners and forwards binding information to the plugin.
	 * The first plugin of type <code>sap.ui.table.plugins.SelectionPlugin</code> in the <code>plugins</code> aggregation is used by the table. If no
	 * selection plugin is applied, a legacy selection plugin is created.
	 *
	 * @private
	 */
	Table.prototype._initSelectionPlugin = function() {
		var oSelectionPlugin = this.getPlugin("sap.ui.table.plugins.SelectionPlugin");

		if (oSelectionPlugin) {
			this._destroyLegacySelectionPlugin();

			if (oSelectionPlugin !== this._oSelectionPlugin) {
				detachSelectionPlugin(this, this._oSelectionPlugin);
				attachSelectionPlugin(this, oSelectionPlugin);
				this._oSelectionPlugin = oSelectionPlugin;
			}
		} else {
			this._initLegacySelectionPlugin();
			detachSelectionPlugin(this, this._oSelectionPlugin);
			delete this._oSelectionPlugin;
		}
	};

	/**
	 * Initializes a legacy selection plugin, if no selection plugin is set in the <code>plugins</code> aggregation.
	 *
	 * @private
	 */
	Table.prototype._initLegacySelectionPlugin = function() {
		if (this._oLegacySelectionPlugin || this.getPlugin("sap.ui.table.plugins.SelectionPlugin")) {
			// No legacy selection plugin needs to be created if it already exists, or if a selection plugin is set.
			return;
		}

		this._oLegacySelectionPlugin = this._createLegacySelectionPlugin();
		this.addAggregation("_hiddenDependents", this._oLegacySelectionPlugin);
		attachSelectionPlugin(this, this._oLegacySelectionPlugin);
	};

	Table.prototype._destroyLegacySelectionPlugin = function() {
		if (this._oLegacySelectionPlugin) {
			this._oLegacySelectionPlugin.destroy();
			delete this._oLegacySelectionPlugin;
		}
	};

	Table.prototype._createLegacySelectionPlugin = function() {
		return new SelectionModelPlugin();
	};

	function attachSelectionPlugin(oTable, oSelectionPlugin) {
		if (oSelectionPlugin && oSelectionPlugin.getMetadata().hasEvent("selectionChange")) {
			oSelectionPlugin.attachSelectionChange(oTable._onSelectionChanged, oTable);
			oSelectionPlugin._setBinding(oTable.getBinding("rows"));
		}
	}

	function detachSelectionPlugin(oTable, oSelectionPlugin) {
		if (oSelectionPlugin && oSelectionPlugin.getMetadata().hasEvent("selectionChange")) {
			oSelectionPlugin.detachSelectionChange(oTable._onSelectionChanged, oTable);
			oSelectionPlugin._setBinding();
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
		var oInfo = TableUtils.getRowColCell(this, iRowIndex, iColumnIndex, !bVisibleColumnIndex);
		return oInfo.cell;
	};

	/**
	 * Fires the <code>_rowsUpdated</code> event asynchronously.
	 *
	 * @param {sap.ui.table.utils.TableUtils.RowsUpdateReason} [sReason=sap.ui.table.utils.TableUtils.RowsUpdateReason.Unknown]
	 * The reason why the rows have been updated.
	 * @fires Table#_rowsUpdated
	 * @private
	 */
	Table.prototype._fireRowsUpdated = function(sReason) {
		if (sReason == null) {
			sReason = TableUtils.RowsUpdateReason.Unknown;
		}

		var mParameters = {
			reason: sReason
		};

		// It must be ensured that the table's own "_rowsUpdated" event handler is always executed first.
		this.onRowsUpdated(mParameters);

		clearTimeout(this._mTimeouts.fireRowsUpdated);
		this._mTimeouts.fireRowsUpdated = setTimeout(function() {
			/**
			 * This event is fired after the rows have been updated.
			 *
			 * @event Table#_rowsUpdated
			 * @type {Object}
			 * @property {sap.ui.table.utils.TableUtils.RowsUpdateReason} reason - The reason why the rows have been updated.
			 * @private
			 */
			this.fireEvent("_rowsUpdated", mParameters);
		}.bind(this), 0);
	};

	Table.prototype.onRowsUpdated = function(mParameters) {
		if (this.getRows().length > 0) {
			TableUtils.Grouping.updateGroups(this);
			this._getAccExtension().updateAccForCurrentCell(mParameters.reason);

			this._resetRowHeights();
			this._aRowHeights = this._collectRowHeights(false);
			this._updateRowHeights(this._aRowHeights, false);
		}

		this._updateSelection();
		this._iRenderedFirstVisibleRow = this._getFirstRenderedRowIndex();
		this._getScrollExtension().updateVerticalScrollbarVisibility();
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
		var that = this;
		return new Promise(function(resolve, reject) {
			sap.ui.require(["sap/ui/table/extensions/Synchronization"], function(SyncExtension) {
				resolve(ExtensionBase.enrich(that, SyncExtension).getInterface());
			}, function(oError) {
				reject(oError);
			});
		});
	};

	/**
	 * Enables the legacy multi selection behavior for mouse interaction.
	 *
	 * @throws {Error} If a selection plugin is applied
	 * @private
	 * @ui5-restricted sap.watt.hanaplugins.editor.plugin.hdbcalculationview
	 */
	Table.prototype._enableLegacyMultiSelection = function() {
		if (this._hasSelectionPlugin()) {
			throw new Error("Unsupported operation: sap.ui.table.Table#_enableLegacyMultiSelection must not be called"
							+ " if a selection plugin is applied.");
		}

		this._legacyMultiSelection = function(iIndex, oEvent) {
			if (this._hasSelectionPlugin()) {
				throw new Error("Unsupported operation: The legacy multi selection is not supported if a selection plugin is applied");
			}

			var bAdd = !!(oEvent.metaKey || oEvent.ctrlKey);

			if (!this.isIndexSelected(iIndex)) {
				if (bAdd) {
					this.addSelectionInterval(iIndex, iIndex);
				} else {
					this.setSelectedIndex(iIndex);
				}
			} else if (bAdd || this._getSelectionPlugin().getSelectedCount() === 1) {
				this.removeSelectionInterval(iIndex, iIndex);
			} else {
				this.setSelectedIndex(iIndex);
			}
		}.bind(this);
	};

	return Table;

});