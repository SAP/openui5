/*!
 * ${copyright}
 */

// Provides control sap.ui.table.Column.
sap.ui.define([
	"./utils/TableUtils",
	"./menus/ColumnHeaderMenuAdapter",
	"sap/ui/core/Core",
	"sap/ui/core/Element",
	"sap/ui/core/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/model/Sorter",
	"sap/ui/model/Type",
	"sap/ui/model/type/String",
	"sap/base/util/ObjectPath", // TODO: Remove in UI5 2.0
	"sap/base/util/JSTokenizer",
	"sap/base/Log"
], function(
	TableUtils,
	ColumnHeaderMenuAdapter,
	Core,
	Element,
	CoreLibrary,
	Filter,
	FilterOperator,
	FilterType,
	Sorter,
	Type,
	StringType,
	ObjectPath, // TODO: Remove in UI5 2.0
	JSTokenizer,
	Log
) {
	"use strict";

	var HorizontalAlign = CoreLibrary.HorizontalAlign;
	var SortOrder = CoreLibrary.SortOrder;
	var ValueState = CoreLibrary.ValueState;
	var TemplateType = {
		Standard: "Standard",
		Creation: "Creation"
	};
	var _private = TableUtils.createWeakMapFacade();

	/**
	 * Map from cell to column.
	 *
	 * @type {WeakMapConstructor}
	 */
	var CellMap = new window.WeakMap();

	/**
	 * Constructor for a new Column.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The column allows you to define column specific properties that will be applied when rendering the table.
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.table.Column
	 */
	var Column = Element.extend("sap.ui.table.Column", /** @lends sap.ui.table.Column.prototype */ {metadata: {

		library: "sap.ui.table",
		properties: {

			/**
			 * Width of the column in CSS units.
			 * Default value is <code>auto</code>, see <a href="https://www.w3.org/TR/CSS2/tables.html#width-layout"></a>
			 * <p>Minimal column width is device-dependent, for example on desktop devices the column will not be smaller than 48px.
			 * <p>This property can be changed by the user or by the application configuration/personalization.
			 * <p>If a user adjusts the column width manually, the resulting value is always set in pixels.
			 * In addition, other columns with width <code>auto</code> get a fixed minimum width and do not shrink after the resizing.
			 */
			width: {type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null},

			/**
			 * Defines the minimum width of a column in pixels.
			 * <p>This property only has an effect if the given column width is flexible, for example with width <code>auto</code>.
			 * <p>This property only influences the automatic behavior. If a user adjusts the column width manually, the column width can become
			 * smaller.
			 * <p>Minimal column width is device-dependent, for example on desktop devices the column will not be smaller than 48px.
			 *
			 * @since 1.44.1
			 */
			minWidth: {type: "int", group: "Dimension", defaultValue: 0},

			/**
			 * If the table is wider than the sum of widths of the visible columns, the columns will be
			 * resized proportionally to their widths that were set originally. If set to false, the column will be displayed in the
			 * original width. If all columns are set to not be flexible, an extra "dummy" column will be
			 * created at the end of the table.
			 * @deprecated As of version 1.44 this property has no effect. Use the property <code>minWidth</code> in combination with the property
			 * <code>width="auto"</code> instead.
			 */
			flexible: {type: "boolean", group: "Behavior", defaultValue: true, deprecated: true},

			/**
			 * If set to true, the column can be resized either using the resize bar (by mouse) or using
			 * the keyboard (SHIFT + Left/Right Arrow keys)
			 */
			resizable: {type: "boolean", group: "Behavior", defaultValue: true},

			/**
			 * Horizontal alignment of the column content. Controls with a text align do not inherit
			 * the horizontal alignment. You have to set the text align directly on the template.
			 */
			hAlign: {type: "sap.ui.core.HorizontalAlign", group: "Appearance", defaultValue: HorizontalAlign.Begin},

			/**
			 * Indicates if the column is sorted. This property only controls if a sort indicator is displayed in the
			 * column header - it does not trigger the sort function. The column can be sorted using {@link sap.ui.table.Table#sort}.
			 *
			 * If this property is set to <code>true</code> and the <code>sortOrder</code> property is <code>None</code>, <code>sortOrder</code> is
			 * automatically set to <code>Ascending</code>.
			 * If this property is <code>true</code> and <code>sortOrder</code> is <code>None</code>, the sort indicator is not shown.
			 *
			 * @deprecated As of version 1.120, replaced by {@link sap.ui.core.SortOrder SortOrder.None} for the <code>sortOrder</code> property
			 */
			sorted: {type: "boolean", group: "Appearance", defaultValue: false, deprecated: true},

			/**
			 * Controls whether a sort indicator is displayed in the column header.
			 * <b>Note:</b> Setting this property does not sort the table. The column can be sorted using {@link sap.ui.table.Table#sort}.
			 */
			sortOrder: {type: "sap.ui.core.SortOrder", group: "Appearance", defaultValue: SortOrder.None},

			/**
			 * Specifies the binding property on which the column will sort.
			 * Since the column template may have composite bindings, it's not possible to figure out on which binding
			 * property the sort shall be applied. Therefore the binding property for sorting must be specified.
			 * For example, if the first name and last name are displayed in the same column, only one of the two can be defined as
			 * <code>sortProperty</code>.
			 *
			 * A column menu entry for sorting can only be generated if the <code>sortProperty</code> is set.
			 */
			sortProperty: {type: "string", group: "Behavior", defaultValue: null},

			/**
			 * Indicates if the column is filtered. This property only controls if a filter indicator is displayed in the
			 * column header - it does not trigger the filter function. The column can be filtered using {@link sap.ui.table.Table#filter}.
			 */
			filtered: {type: "boolean", group: "Appearance", defaultValue: false},

			/**
			 * Specifies the binding property on which the column shall be filtered.
			 * Since the column template may have composite bindings, it's not possible to figure out on which binding
			 * property the filter shall be applied. Therefore the binding property for filtering must be specified.
			 * For example, if the first name and last name are displayed in the same column, only one of the two can be defined as
			 * <code>filterProperty</code>.
			 *
			 * A column menu entry for filtering can only be generated if the <code>filterProperty</code> is set. The
			 * default menu entry is a text input field.
			 */
			filterProperty: {type: "string", group: "Behavior", defaultValue: null},

			/**
			 * Specifies the value of the filter as string (will be converted into the proper data type). It is possible
			 * to provide a filterOperator as string, as shown here:
			 * <pre>
			 * &gt; 50
			 * &lt; 100
			 * &gt;= 150
			 * &lt;= 200
			 * = 250
			 * != 300
			 * *something    ends with
			 * something*    starts with
			 * *something*   contains
			 * some..thing   between
			 * 50..100       between
			 * </pre>
			 */
			filterValue: {type: "string", group: "Behavior", defaultValue: null},

			/**
			 * Filter operator to use when filtering this column.
			 * @see sap.ui.model.FilterOperator (default value: "Contains")
			 */
			filterOperator: {type: "string", group: "Behavior", defaultValue: null},

			/**
			 * If this property is set, the default filter operator of the column is overridden.
			 * By default <code>Contains</code> is used for string and <code>EQ</code> for other types. A valid
			 * <code>sap.ui.model.FilterOperator</code> needs to be passed.
			 */
			defaultFilterOperator: {type: "string", group: "Behavior", defaultValue: null},

			/**
			 * Type of filter. It is used to transform the search term into the specified type and should be the same as
			 * defined in the binding for the column template.
			 * Default value is <code>sap.ui.model.type.String</code>.
			 * It can be set to the class name of the type,
			 * e.g.: <code>sap.ui.model.type.Date</code>,
			 * or an expression similar to the binding syntax,
			 * e.g.: <code>"\{type: 'sap.ui.model.type.Date', formatOptions: \{UTC: true\}, constraints: \{\} \}"</code>.
			 * Here the escaping is mandatory to avoid handling by the binding parser.
			 * As an alternative, a function can be passed that takes over the conversion. This cannot be done in the
			 * XMLView, use {@link #setFilterType} instead.
			 *
			 * <b>Note:</b> The usage of string-based type definitions without explicitly loading these types (<code>sap.ui.require</code>)
			 * in the controller has been deprecated and might no longer work in future releases.
			 * Please ensure that the types are requested correctly before setting this property.
			 *
			 * @since 1.9.2
			 */
			filterType: {type: "any", group: "Misc", defaultValue: null},

			/**
			 * Indicates if the column is grouped.
			 * @deprecated As of version 1.118.
			 */
			grouped: {type: "boolean", group: "Appearance", defaultValue: false, deprecated: true},

			/**
			 * Invisible controls are not rendered.
			 */
			visible: {type: "boolean", group: "Appearance", defaultValue: true},

			/**
			 * The name of the column which is used for the text representation of this column, for example, in menus.
			 * If not set, the text from the multiLabels aggregation or the label aggregation (in that order) is used as a fallback option.
			 * @since 1.11.1
			 */
			name: {type: "string", group: "Appearance", defaultValue: null},

			/**
			 * Defines if the filter menu entry is displayed
			 * @since 1.13.0
			 */
			showFilterMenuEntry: {type: "boolean", group: "Appearance", defaultValue: true},

			/**
			 * Defines if the sort menu entries are displayed
			 * @since 1.13.0
			 */
			showSortMenuEntry: {type: "boolean", group: "Appearance", defaultValue: true},

			/**
			 * If this property is set, a span is applied for the header. When moving columns, all columns
			 * which are part of the header will be moved. The <code>headerSpan</code> can be either an integer or an array of
			 * integers (if you use the multi header feature of the table). If you only specify an integer, this span is
			 * applied for all header rows, with multiple integers you can specify a separate span for each header row.
			 * <b>Note:</b> Only columns with a span equal to 1 can have a column menu. When setting a column to fixed, all
			 * columns which are part of the header with the greatest span will be set to fixed.
			 * @example <caption>Example of usage: header with 3 subheaders, each of them with span = 1</caption>
			 * <code>headerSpan = [3, 1] // for the first column
			 * headerSpan = [2, 1] // for the second column
			 * headerSpan = [1, 1] // or not set for the third column</code>
			 */
			headerSpan: {type: "any", group: "Behavior", defaultValue: 1},

			/**
			 * Enables auto-resizing of the column on double clicking the resize bar. The width is determined on the widest
			 * currently displayed content. It does not consider rows which are currently not scrolled into view.
			 * Currently only implemented to work with the following controls:
			 * <code>sap.m.Text, sap.m.Label, sap.m.Link, sap.m.Input,
			 * sap.ui.commons.TextView, sap.ui.commons.Label, sap.ui.commons.Link and sap.ui.commons.TextField,
			 * sap.ui.commons.Checkbox, sap.m.CheckBox</code>
			 * @since 1.21.1
			 */
			autoResizable: {type: "boolean", group: "Behavior", defaultValue: false}
		},
		defaultAggregation: "label",
		aggregations: {

			/**
			 * Label of the column which is displayed in the column header. This aggregation is for the standard behavior,
			 * where you only want to display one single row header. If a string is supplied, a default label control will be
			 * created. Which control this is depends on the loaded libraries.
			 *
			 * <b>Note:</b> The <code>altType</code> string is deprecated as of version 1.118. Use a <code>Control</code> instead.
			 */
			label: {type: "sap.ui.core.Control", altTypes: ["string"], multiple: false},

			/**
			 * Labels of the column which are displayed in the column header. Define a control for
			 * each header row in the table. Use this aggregation if you want to use multiple headers per column.
			 * @since 1.13.1
			 */
			multiLabels: {type: "sap.ui.core.Control", multiple: true, singularName: "multiLabel"},

			/**
			 * Template (cell renderer) of this column.
			 * A template is decoupled from the column. Each time the template's properties or aggregations have been changed, the template has to be
			 * applied again via <code>setTemplate</code> for the changes to take effect.
			 * If a string is defined, a default text control will be created with its text property bound to the value of the string. The default
			 * template depends on the libraries loaded.
			 * If there is no template, the column will not be rendered in the table.
			 * The set of supported controls is limited. See section "{@link topic:148892ff9aea4a18b912829791e38f3e Tables: Which One Should I
			 * Choose?}" in the documentation for more details. While it is technically possible to also use other controls, doing so might lead to
			 * issues with regards to scrolling, alignment, condensed mode, screen reader support, and keyboard support.
			 *
			 * <b>Note:</b> The <code>altType</code> string is deprecated as of version 1.118. Use a <code>Control</code> instead.
			 */
			template: {type: "sap.ui.core.Control", altTypes: ["string"], multiple: false},

			/*
			 * Creation template (cell renderer) of this column. This template is used only to create the cells
			 * of the {@link sap.ui.table.CreationRow} that is added to the table.
			 * A template is decoupled from the column. Each time the template's properties or aggregations have been changed, the template has to
			 * be applied again via <code>setCreationTemplate</code> for the changes to take effect.
			 * The set of supported controls is limited. See section "{@link topic:148892ff9aea4a18b912829791e38f3e Tables: Which One Should I
			 * Choose?}" in the documentation for more details. While it is technically possible to also use other controls, doing so might lead to
			 * issues with regards to scrolling, alignment, condensed mode, screen reader support, and keyboard support.
			 *
			 * @private
			 * @ui5-restricted sap.ui.mdc
			 */
			creationTemplate: {type: "sap.ui.core.Control", multiple: false, visibility: "hidden"},

			/**
			 * The menu used by the column. By default the {@link sap.ui.table.ColumnMenu} is used.
			 *
			 * <b>Note:</b> Applications must not use or change the default <code>sap.ui.table.ColumnMenu</code> of
			 * a column in any way or create own instances of <code>sap.ui.table.ColumnMenu</code>.
			 * To add a custom menu to a column, use the aggregation <code>menu</code> with a new instance of
			 * <code>sap.ui.unified.Menu</code>.
			 *
			 * @deprecated As of version 1.117, use the <code>headerMenu</code> association instead.
			 */
			menu: {type: "sap.ui.unified.Menu", multiple: false}
		},
		associations: {
			/**
			 * The menu that can be opened by the header element of this column.
			 *
			 * @since 1.110
			 */
			headerMenu: {type: "sap.ui.core.IColumnHeaderMenu", multiple: false}
		},
		events: {
			/**
			 * Fires before the column menu is opened.
			 * @since 1.33.0
			 *
			 * @deprecated As of version 1.117.
			 */
			columnMenuOpen: {
				allowPreventDefault: true,
				parameters: {
					/**
					 * Refence to the selected <code>menu</code> instance to be opened.
					 */
					menu: {type: "sap.ui.unified.Menu"}
				}
			}
		}
	}});

	/** default filter type for the columns */
	Column._DEFAULT_FILTER_TYPE = new StringType();

	/**
	 * called when the column is initialized
	 */
	Column.prototype.init = function() {
		// Skip propagation of properties (models and bindingContexts).
		this.mSkipPropagation = {
			template: true,
			creationTemplate: true
		};

		_private(this).oSorter = null;
		_private(this).mCellContentVisibilitySettings = normalizeCellContentVisibilitySettings(this);
		_private(this).bHasDefaultLabel = false;
		_private(this).bHasDefaultTemplate = false;

		// for performance reasons, the cloned column templates shall be stored for later reuse
		this._initTemplateClonePool();
	};

	/**
	 * Initializes the template clone pool where clones of every template type are stored for reuse.
	 *
	 * @private
	 */
	Column.prototype._initTemplateClonePool = function() {
		this._mTemplateClones = Object.keys(TemplateType).reduce(function(oTemplatePool, sTemplateType) {
			oTemplatePool[sTemplateType] = [];
			return oTemplatePool;
		}, {});
	};

	/**
	 * called when the column is destroyed
	 */
	Column.prototype.exit = function() {
		this._destroyTemplateClones();
		ColumnHeaderMenuAdapter.unlink(this);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.invalidate = function(oOrigin) {
		// prevent changes in the template (especially the databinding ones)
		//  - what about exchanging the template? => implemented in setTemplate
		//  - what about modifying properties? => developer must call invalidate!
		// The problem is that we just need to prevent databinding changes. The
		// problem here is that the databinding bindings are created ones the template
		// is created and has its own model. If now changes are done in the model
		// this directly affects the template which invalidates the column invalidating
		// the complete Table.
		/*
		 * PART1: When you create the Tooltip (deferred) then it establishes the
		 * connection to its data (also for the template of the column!) and this
		 * finally invalidates the Table which triggers the re-rendering. One
		 * option is to complete decouple the template from the Table by
		 * suppressing the invalidate. But this finally also decouples the Table
		 * from any changes on the template after the template has been applied
		 * to the Column. But when re-rendering it would update the column cells.
		 * To notify the Table on proper changes one has to call the method
		 * invalidate on the Table.
		 */
		/*
		 * PART2: we also suppress the re-rendering in case of the column menu is
		 * rerendered. This is a popup and we use the instance check because of the
		 * menu behind the getMenu function is lazy created when first accessed.
		 */
		if (oOrigin !== this.getTemplate()
			&& oOrigin !== this.getCreationTemplate()
			&& !TableUtils.isA(oOrigin, "sap.ui.table.ColumnMenu")) {

			// changes on the templates require to call invalidate on the column or table
			Element.prototype.invalidate.apply(this, arguments);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setLabel = function(vLabel) {
		var oLabel = vLabel;

		if (typeof vLabel === "string") {
			if (_private(this).bHasDefaultLabel) {
				this.getLabel().setText(vLabel);
				return this;
			}
			oLabel = TableUtils._getTableTemplateHelper().createLabel({text: vLabel});
			_private(this).bHasDefaultLabel = true;
		} else if (_private(this).bHasDefaultLabel) {
			this.destroyLabel();
			_private(this).bHasDefaultLabel = false;
		}

		if (oLabel && oLabel.setIsInColumnHeaderContext) {
			oLabel.setIsInColumnHeaderContext(true);
		}
		var oCurrLabel = this.getLabel();
		if (oCurrLabel && oLabel !== oCurrLabel && oCurrLabel.setIsInColumnHeaderContext) {
			oCurrLabel.setIsInColumnHeaderContext(false);
		}

		return this.setAggregation("label", oLabel);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setTemplate = function(vTemplate) {
		var oTemplate = vTemplate;
		var oTable = this._getTable();
		var oOldTemplate = this.getTemplate();
		var bNewTemplate = true;

		if (typeof vTemplate === "string") {
			if (_private(this).bHasDefaulTemplate) {
				this.getTemplate().bindProperty("text", vTemplate);
				bNewTemplate = false;
			} else {
				oTemplate = TableUtils._getTableTemplateHelper().createTextView().bindProperty("text", vTemplate);
				_private(this).bHasDefaulTemplate = true;
			}
		} else if (_private(this).bHasDefaulTemplate) {
			this.destroyTemplate();
			_private(this).bHasDefaulTemplate = false;
		}

		if (bNewTemplate) {
			this.setAggregation("template", oTemplate, true);
		}

		// manually invalidate the Column (because of the invalidate decoupling to
		// prevent invalidations from the databinding part)
		if (this.getVisible()) {
			this.invalidate();
		}

		// The clones are removed from the cells aggregation of the rows when destroyed.
		this._destroyTemplateClones("Standard");

		if (oTable && this.getVisible()) {
			if (oTemplate) {
				oTable.invalidateRowsAggregation();
			}

			if (!oOldTemplate || !oTemplate) {
				var oCreationRow = oTable.getCreationRow();
				if (oCreationRow) {
					oCreationRow._update();
				}
			}
		}

		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.destroyTemplate = function() {
		this.destroyAggregation("template");
		this._destroyTemplateClones("Standard");

		var oTable = this._getTable();
		var oCreationRow = oTable ? oTable.getCreationRow() : null;

		if (oCreationRow) {
			oCreationRow._update();
		}

		return this;
	};

	/**
	 * Sets the creation template.
	 *
	 * @param {sap.ui.core.Control} oCreationTemplate Instance of the creation template control
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Column.prototype.setCreationTemplate = function(oCreationTemplate) {
		var oTable = this._getTable();

		this.setAggregation("creationTemplate", oCreationTemplate, true);
		this._destroyTemplateClones("Creation");

		if (oCreationTemplate && oTable && this.getVisible()) {
			var oCreationRow = oTable.getCreationRow();
			if (oCreationRow) {
				oCreationRow._update();
			}
		}

		return this;
	};

	/**
	 * Gets the creation template.
	 *
	 * @returns {sap.ui.core.Control} Instance of the creation template control
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Column.prototype.getCreationTemplate = function() {
		return this.getAggregation("creationTemplate");
	};

	/**
	 * Destroys the creation template.
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Column.prototype.destroyCreationTemplate = function() {
		this.destroyAggregation("creationTemplate", true);
		this._destroyTemplateClones("Creation");
		return this;
	};

	/**
	 * Checks whether the menu has items. This function considers table and column
	 * properties to determine whether the column menu would have items.
	 * @returns {boolean} True if the menu has or could have items.
	 * @private
	 * @deprecated As of Version 1.117
	 */
	Column.prototype._menuHasItems = function() {
		var oTable = this._getTable();
		var bHasOwnItems = (oTable ? oTable.getEnableColumnFreeze() : false)
			|| (oTable ? oTable.getShowColumnVisibilityMenu() : false)
			|| this.isSortableByMenu()
			|| this.isFilterableByMenu()
			|| this.isGroupableByMenu();

		if (bHasOwnItems) {
			return true;
		}

		return TableUtils.Hook.call(oTable, TableUtils.Hook.Keys.Column.MenuItemNotification, this).some(function(bValue) {
			return bValue;
		});
	};

	/**
	 * This function checks whether a filter column menu item will be created. Although it evaluates some column
	 * properties, it does not check the metadata.
	 *
	 * For Columns the following applies:
	 * - filterProperty must be defined
	 * - showFilterMenuEntry must be true (which is the default)
	 *
	 * @returns {boolean}
	 */
	Column.prototype.isFilterableByMenu = function() {
		return !!(this.getFilterProperty() && this.getShowFilterMenuEntry());
	};

	/**
	 * This function checks whether sort column menu items will be created. Although it evaluates some column
	 * properties, it does not check the metadata.
	 *
	 * For Columns the following applies:
	 * - sortProperty must be defined
	 * - showSortMenuEntry must be true (which is the default)
	 *
	 * @returns {boolean}
	 */
	Column.prototype.isSortableByMenu = function() {
		return !!(this.getSortProperty() && this.getShowSortMenuEntry());
	};

	/**
	 * This function checks whether a grouping column menu item will be created. Although it evaluates some column
	 * properties, it does not check the metadata. Since a property of the table must be checked, this function will
	 * return false when the column is not a child of a table.
	 *
	 * For Columns the following applies:
	 * - sortProperty must be defined
	 * - showFilterMenuEntry must be true (which is the default)
	 *
	 * @deprecated As of version 1.118.
	 * @returns {boolean}
	 */
	Column.prototype.isGroupableByMenu = function() {
		var oTable = this._getTable();
		return !!(oTable && oTable.getEnableGrouping && oTable.getEnableGrouping() && this.getSortProperty());
	};

	Column.prototype._isGroupableByMenu = function() {
		var bIsGroupableByMenu = false;
		/**
		 *  @deprecated As of version 1.119.
		 */
		bIsGroupableByMenu = this.isGroupableByMenu();

		return bIsGroupableByMenu;
	};

	Column.prototype.setSorted = function(bSorted) {
		this.setProperty("sorted", bSorted, true);

		if (bSorted && this.getSortOrder() === SortOrder.None) {
			this.setSortOrder(SortOrder.Ascending); // "Ascending" was the default value of "sortOrder" before "sorted" was deprecated.
		}

		this._updateIcons();
		return this;
	};

	Column.prototype.setSortOrder = function(sSortOrder) {
		this.setProperty("sortOrder", sSortOrder, true);
		this._updateIcons();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setFiltered = function(bFlag) {
		this.setProperty("filtered", bFlag, true);
		this._updateIcons();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setFilterOperator = function(sValue) {
		return this.setProperty("filterOperator", sValue, true);
	};

	Column.prototype._openHeaderMenu = function(oDomRef) {
		var oHeaderMenu = this.getHeaderMenuInstance();
		/**
		 * @deprecated As of Version 1.117
		 */
		this._cellPressed = oDomRef;
		ColumnHeaderMenuAdapter.activateFor(this).then(function() {
			if (oHeaderMenu) {
				oHeaderMenu.openBy(oDomRef);
			}
		});
	};

	Column.prototype._isHeaderMenuOpen = function() {
		var oHeaderMenu = this.getHeaderMenuInstance();
		if (oHeaderMenu) {
			return oHeaderMenu.isOpen();
		}
	};

	/**
	 * @deprecated As of version 1.118.
	 * @private
	*/
	Column.prototype._setGrouped = function(bGrouped) {
		var oTable = this._getTable();
		oTable.setGroupBy(bGrouped ? this : null);
	};

	Column.prototype._isAggregatableByMenu = function() {
		return false;
	};

	/**
	 * Toggles the sort order of the column.
	 *
	 * @public
	 * @deprecated Since version 1.5.1.
	 * Please use the function "sap.ui.Table.prototype.sort".
	 */
	Column.prototype.toggleSort = function() {
		// by default we sort ascending / only if already is sorted ascending then we toggle
		this.sort(this.getSorted() && this.getSortOrder() === SortOrder.Ascending);
	};

	/**
	 * Sorts the current column ascending or descending.
	 *
	 * @param {boolean} bDescending Sort order of the column (if undefined the default will be ascending)
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @deprecated Since version 1.5.1. Please use the function "sap.ui.Table.prototype.sort".
	 */
	Column.prototype.sort = function(bDescending, bAdd) {
		this._sort(bDescending ? SortOrder.Descending : SortOrder.Ascending, bAdd);
		return this;
	};

	/**
	 * Changes the sort order of this column. Sorts the binding and updates properties.
	 *
	 * @param {sap.ui.core.SortOrder} sSortOrder The new sort order
	 * @param {boolean} [bAdd=false]
	 *     Determines whether to append this column to the list of sorted columns. By default, previously sorted columns are unsorted. This parameter
	 *     has no effect if the column is unsorted.
	 */
	Column.prototype._sort = function(sSortOrder, bAdd) {
		var oTable = this._getTable();

		if (!oTable) {
			return;
		}

		if (sSortOrder === SortOrder.None) {
			oTable._removeSortedColumn(this);
		} else {
			oTable.pushSortedColumn(this, bAdd);
		}

		var bExecuteDefault = oTable.fireSort({
			column: this,
			sortOrder: sSortOrder,
			columnAdded: sSortOrder !== SortOrder.None && bAdd === true
		});

		if (!bExecuteDefault) {
			return;
		}

		/** @deprecated As of version 1.120 */
		this.setProperty("sorted", sSortOrder !== SortOrder.None, true);
		this.setProperty("sortOrder", sSortOrder, true);
		this._updateSorters();
	};

	Column.prototype._updateSorters = function() {
		var oTable = this._getTable();
		var aSortedColumns = oTable.getSortedColumns();
		var aColumns = oTable.getColumns();
		var sSortOrder = this.getSortOrder();

		// Reset the sorting status of all columns which are not sorted anymore.
		for (let i = 0, l = aColumns.length; i < l; i++) {
			if (aSortedColumns.indexOf(aColumns[i]) < 0) {
				// Column is not sorted anymore. Reset to default and remove sorter.
				/** @deprecated As of version 1.120 */
				aColumns[i].setProperty("sorted", false, true);
				aColumns[i].setProperty("sortOrder", SortOrder.None, true);
				aColumns[i]._updateIcons(true);
				delete _private(aColumns[i]).oSorter;
			}
		}

		// Update the sorter of this column. If the sorter needs to be removed, this was already done above.
		if (sSortOrder !== SortOrder.None) {
			_private(this).oSorter = new Sorter(this.getSortProperty(), sSortOrder === SortOrder.Descending);
		}

		// Make sure sorted columns show the sort icon.
		for (let i = 0, l = aSortedColumns.length; i < l; i++) {
			aSortedColumns[i]._updateIcons(true);
		}

		oTable._resetColumnHeaderHeights();
		oTable._updateRowHeights(oTable._collectRowHeights(true), true);
		this._applySorters();
	};

	Column.prototype._applySorters = function() {
		const oTable = this._getTable();
		const oBinding = oTable.getBinding();

		if (!oBinding) {
			Log.warning("Sorting not performed because no binding present", this);
			return;
		}

		const aSortedColumns = oTable.getSortedColumns();
		const aSorters = aSortedColumns.map((oSortedColumn) => {
			return _private(oSortedColumn).oSorter;
		});

		oBinding.sort(aSorters);
	};

	Column.prototype._updateIcons = function(bSkipUpdateRowHeights) {
		var oTable = this._getTable();
		var bSorted = this.getSortOrder() !== SortOrder.None;
		var bFiltered = this.getFiltered();

		/** @deprecated As of version 1.120 */
		if (!this.getSorted()) {
			bSorted = false;
		}

		if (!oTable || !oTable.getDomRef()) {
			return;
		}

		this.$()
			.parents(".sapUiTableCHT")
			.find('td[data-sap-ui-colindex="' + this.getIndex() + '"]:not([colspan]):not(.sapUiTableHidden):first')
			.toggleClass("sapUiTableColFiltered", bFiltered)
			.toggleClass("sapUiTableColSorted", bSorted)
			.toggleClass("sapUiTableColSortedD", bSorted && this.getSortOrder() === SortOrder.Descending);

		oTable._getAccExtension().updateAriaStateOfColumn(this);

		if (!bSkipUpdateRowHeights) {
			oTable._resetColumnHeaderHeights();
			oTable._updateRowHeights(oTable._collectRowHeights(true), true);
		}
	};

	Column.prototype._renderSortIcon = function() {
		this._updateIcons();
	};

	Column.prototype._getFilterState = function() {
		try {
			this._getFilter();
			return ValueState.None;
		} catch (e) {
			return ValueState.Error;
		}
	};

	Column.prototype._getFilter = function() {

		var oFilter,
			sPath = this.getFilterProperty(),
			sValue = this.getFilterValue(),
			sOperator = this.getFilterOperator(),
			sParsedValue,
			sSecondaryParsedValue,
			oType = this.getFilterType() || Column._DEFAULT_FILTER_TYPE,
			bIsString = oType instanceof StringType,
			aBetween;

		if (sValue) {

			// determine the operator
			if (!sOperator) {

				aBetween = sValue.match(/(.*)\s*\.\.\s*(.*)/);

				// determine the filter operator depending on the
				if (sValue.indexOf("=") == 0) {
					sOperator = FilterOperator.EQ;
					sParsedValue = sValue.substr(1);
				} else if (sValue.indexOf("!=") == 0) {
					sOperator = FilterOperator.NE;
					sParsedValue = sValue.substr(2);
				} else if (sValue.indexOf("<=") == 0) {
					sOperator = FilterOperator.LE;
					sParsedValue = sValue.substr(2);
				} else if (sValue.indexOf("<") == 0) {
					sOperator = FilterOperator.LT;
					sParsedValue = sValue.substr(1);
				} else if (sValue.indexOf(">=") == 0) {
					sOperator = FilterOperator.GE;
					sParsedValue = sValue.substr(2);
				} else if (sValue.indexOf(">") == 0) {
					sOperator = FilterOperator.GT;
					sParsedValue = sValue.substr(1);
				} else if (aBetween) {
					if (aBetween[1] && aBetween[2]) {
						sOperator = FilterOperator.BT;
						sParsedValue = aBetween[1];
						sSecondaryParsedValue = aBetween[2];
					} else if (aBetween[1] && !aBetween[2]) {
						sOperator = FilterOperator.GE;
						sParsedValue = aBetween[1];
					} else {
						sOperator = FilterOperator.LE;
						sParsedValue = aBetween[2];
					}
				} else if (bIsString && sValue.indexOf("*") == 0 && sValue.lastIndexOf("*") == sValue.length - 1) {
					sOperator = FilterOperator.Contains;
					sParsedValue = sValue.substr(1, sValue.length - 2);
				} else if (bIsString && sValue.indexOf("*") == 0) {
					sOperator = FilterOperator.EndsWith;
					sParsedValue = sValue.substr(1);
				} else if (bIsString && sValue.lastIndexOf("*") == sValue.length - 1) {
					sOperator = FilterOperator.StartsWith;
					sParsedValue = sValue.substr(0, sValue.length - 1);
				} else {
					if (this.getDefaultFilterOperator()) {
						sOperator = this.getDefaultFilterOperator();
					} else if (bIsString) {
							// Due to compatibility reason we need to use Contains for Strings instead of EQ as default!!
							sOperator = FilterOperator.Contains;
						} else {
							sOperator = FilterOperator.EQ;
						}
					sParsedValue = sValue.substr(0);
				}
				if (!sSecondaryParsedValue) {
					oFilter = new Filter(sPath, sOperator, this._parseFilterValue(sParsedValue));
				} else {
					oFilter = new Filter(sPath, sOperator, this._parseFilterValue(sParsedValue), this._parseFilterValue(sSecondaryParsedValue));
				}
			} else {
				oFilter = new Filter(sPath, sOperator, this._parseFilterValue(sValue));
			}

		}

		return oFilter;

	};

	Column.prototype.filter = function(sValue) {
		var oTable = this._getTable();

		if (oTable && oTable.isBound("rows")) {

			// notify the event listeners
			var bExecuteDefault = oTable.fireFilter({
				column: this,
				value: sValue
			});

			if (bExecuteDefault) {
				this.setProperty("filtered", !!sValue, true);
				this.setProperty("filterValue", sValue, true);

				var aFilters = [];
				var aCols = oTable.getColumns();
				for (var i = 0, l = aCols.length; i < l; i++) {
					var oCol = aCols[i],
						oFilter,
						sState;

					try {
						oFilter = oCol._getFilter();
						sState = ValueState.None;
					} catch (e) {
						sState = ValueState.Error;
					}
					if (oFilter) {
						aFilters.push(oFilter);
					}

					/**
					* @deprecated As of Version 1.117
					*/
					TableUtils.Hook.call(this._getTable(), TableUtils.Hook.Keys.Column.SetFilterState, oCol, sState);
				}
				oTable.getBinding().filter(aFilters, FilterType.Control);

				this._updateIcons();
			}
		}

		return this;
	};

	Column.prototype._parseFilterValue = function(sValue) {
		var oFilterType = this.getFilterType();

		if (oFilterType) {
			if (typeof oFilterType === "function") {
				sValue = oFilterType(sValue);
			} else {
				sValue = oFilterType.parseValue(sValue, "string");
			}
		}

		return sValue;
	};

	/**
	 * Returns whether the column should be rendered.
	 * @returns {boolean} Returns <code>true</code>, if the column should be rendered
	 * @protected
	 */
	Column.prototype.shouldRender = function() {
		var bShouldRender = this.getVisible() && this.getTemplate() != null;

		/**
		 * @deprecated As of Version 1.118
		 */
		bShouldRender = bShouldRender && !this.getGrouped();

		return bShouldRender;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setProperty = function(sName, vValue) {
		var oTable = this._getTable();
		var bValueChanged = oTable && this.getProperty(sName) != vValue;
		var bNeedRowsUpdate = bValueChanged && sName === "visible";
		var bInvalidateFixedColCount = bValueChanged && (sName === "visible" || sName === "headerSpan");
		var vReturn = Element.prototype.setProperty.apply(this, arguments);

		if (bNeedRowsUpdate) {
			oTable.invalidateRowsAggregation();

			var oCreationRow = oTable.getCreationRow();
			if (oCreationRow) {
				oCreationRow._update();
			}
		}

		if (bInvalidateFixedColCount) {
			oTable._invalidateComputedFixedColumnCount();
		}

		return vReturn;
	};

	/**
	 * The filter type can be the class name of a type, an expression similar to the binding syntax, or a function.
	 * A function receives the entered filter value as a parameter and should return the appropriate value for the filter expression.
	 *
	 * @param {any} vType The filter type
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 *
	 * @example <caption>Class name of a type.</caption>
	 * // The usage of string-based type definitions without explicitly loading these types (<code>sap.ui.require</code>) in the controller has been deprecated and might no longer work in future releases.
	 * // Please ensure that the types are requested correctly before setting this property.
	 * oColumn.setFilterType("sap.ui.model.type.Date");
	 *
	 * @example <caption>Module path of a type.</caption>
	 * // The type needs to be loaded in advance by the application.
	 * oColumn.setFilterType("sap/ui/model/type/Date");
	 *
	 * @example <caption>Binding expression similar to the binding syntax.</caption>
	 * // The escaping is mandatory to avoid handling by the binding parser.
	 * oColumn.setFilterType("\{type: 'sap.ui.model.type.Date', formatOptions: \{UTC: true\}, constraints: \{\} \}");
	 *
	 * @example <caption>A function that takes over the conversion.</caption>
	 * // Converts the entered filter value to type Boolean.
	 * oColumn.setFilterType(function(oValue) {
	 *   return oValue == 1
	 * });
	 */
	Column.prototype.setFilterType = function(vType) {
		var oType = vType;
		if (typeof (vType) === "string") {
			try {
				// similar to BindingParser allow to specify formatOptions and constraints for types
				var mConfig = JSTokenizer.parseJS(vType);
				if (typeof (mConfig.type) === "string") {
					var fnType = sap.ui.require(mConfig.type.replaceAll(".", "/"));

					/** @deprecated As of version 1.120 */
					if (!fnType) {
						fnType = ObjectPath.get(vType);
					}

					oType = fnType && new fnType(mConfig.formatOptions, mConfig.constraints);
				}
			} catch (ex) {
				var fnType = sap.ui.require(vType.replaceAll(".", "/"));

				/** @deprecated As of version 1.120 */
				if (!fnType) {
					fnType = ObjectPath.get(vType);
				}

				oType = fnType && new fnType();
			}
			// check for a valid type
			if (!(oType instanceof Type)) {
				Log.error("The filter type is not an instance of sap.ui.model.Type! Ignoring the filter type!");
				oType = undefined;
			}
		}
		this.setProperty("filterType", oType, true);
		return this;
	};

	/**
	 * Determines the column index based upon the order in its aggregation.
	 * Invisible columns are taken in account of order.
	 * @returns {int} the column index.
	 */
	Column.prototype.getIndex = function() {
		var oTable = this._getTable();
		if (oTable) {
			return oTable.indexOfColumn(this);
		} else {
			return -1;
		}
	};

	/**
	 * A hook getting called by the DragInfo to determine whether the column allows dragging.
	 * @param {sap.ui.core.dnd.IDragInfo} oDragInfo drag information
	 * @private
	 */
	Column.prototype.isDragAllowed = function(oDragInfo) {
		return TableUtils.Column.isColumnMovable(this, true);
	};

	/**
	 * Returns an unused column template clone. Unused means, it does not have a parent.
	 *
	 * @param {string} sTemplateType The template type for which a free clone should be retrieved from the clone pool.
	 * @returns {sap.ui.core.Control|null} Column template clone, or <code>null</code> if all clones have parents.
	 * @private
	 */
	Column.prototype._getFreeTemplateClone = function(sTemplateType) {
		var aTemplateClones = this._mTemplateClones[sTemplateType];
		var oFreeTemplateClone = null;

		if (!aTemplateClones) {
			return null;
		}

		for (var i = 0; i < aTemplateClones.length; i++) {
			if (!aTemplateClones[i] || aTemplateClones[i].bIsDestroyed) {
				aTemplateClones.splice(i, 1); // Remove the reference to a destroyed clone.
				i--;
			} else if (!oFreeTemplateClone && !aTemplateClones[i].getParent()) {
				oFreeTemplateClone = aTemplateClones[i];
			}
		}

		return oFreeTemplateClone;
	};

	/**
	 * Returns a template clone. It either finds an unused clone or clones a new one from the template.
	 *
	 * @param {int} iIndex Index of the column in the columns aggregation of the table
	 * @returns {sap.ui.core.Control|null} Clone of the template, or <code>null</code> if no template is defined
	 * @protected
	 */
	Column.prototype.getTemplateClone = function(iIndex, sPreferredTemplateType) {
		// For performance reasons, the index of the column in the column aggregation must be provided by the caller.
		// Otherwise the columns aggregation would be looped over and over again to figure out the index.
		if (typeof iIndex !== "number" || this.getTemplate() == null) {
			return null;
		}

		var sTemplateType = sPreferredTemplateType == null ? "Standard" : sPreferredTemplateType;
		var oClone = this._getFreeTemplateClone(sTemplateType);

		if (!oClone && TemplateType.hasOwnProperty(sTemplateType)) {
			// No free template clone available, create one.
			var fnGetTemplate = this["get" + (sTemplateType === "Standard" ? "" : sTemplateType) + "Template"];
			var oTemplate = fnGetTemplate.call(this);

			if (oTemplate) {
				oClone = oTemplate.clone();
				this._mTemplateClones[sTemplateType].push(oClone);
			}
		}

		if (oClone) {
			CellMap.set(oClone, this);

			var oTable = this._getTable();
			if (oTable) {
				oTable._getAccExtension().addColumnHeaderLabel(this, oClone);
			}
		}

		return oClone;
	};

	function destroyClones(aClones) {
		for (var i = 0; i < aClones.length; i++) {
			if (aClones[i] != null && !aClones[i].bIsDestroyed) {
				aClones[i].destroy();
			}
		}
	}

	/**
	 * Destroys all column template clones and clears the clone stack.
	 *
	 * @param {string} [sTemplateType] The template type of clones to destroy. If not defined, all clones are destroyed.
	 * @private
	 */
	Column.prototype._destroyTemplateClones = function(sTemplateType) {
		if (sTemplateType == null) {
			for (var sType in TemplateType) {
				destroyClones(this._mTemplateClones[sType]);
			}
			this._initTemplateClonePool();
		} else {
			destroyClones(this._mTemplateClones[sTemplateType]);
			this._mTemplateClones[sTemplateType] = [];
		}
	};

	/**
	 * Gets the table this column is inside.
	 *
	 * @returns {sap.ui.table.Table|null} The instance of the table or <code>null</code>, if this column is not inside a table.
	 * @private
	 */
	Column.prototype._getTable = function() {
		var oParent = this.getParent();
		return TableUtils.isA(oParent, "sap.ui.table.Table") ? oParent : null;
	};

	/**
	 * Sets the cell content visibility settings.
	 *
	 * @param {object} [mSettings] The cell content visibility settings. If not defined, the settings are reset.
	 * @param {boolean} [mSettings.standard=true] Whether cell content in standard rows is visible.
	 * @param {object | boolean} [mSettings.groupHeader=true] Whether cell content in group header rows is visible.
	 * @param {boolean} [mSettings.groupHeader.nonExpandable=true] Whether cell content in non-expandable group header rows is visible.
	 * @param {boolean} [mSettings.groupHeader.expanded=true] Whether cell content in expanded group header rows is visible.
	 * @param {boolean} [mSettings.groupHeader.collapsed=true] Whether cell content in collapsed group header rows is visible.
	 * @param {object | boolean} [mSettings.summary=true] Whether cell content in summary rows is visible.
	 * @param {boolean} [mSettings.summary.group=true] Whether cell content in group summary rows is visible.
	 * @param {boolean} [mSettings.summary.total=true] Whether cell content in total summary rows is visible.
	 * @private
	 */
	Column.prototype._setCellContentVisibilitySettings = function(mSettings) {
		validateCellContentVisibilitySettings(mSettings);
		_private(this).mCellContentVisibilitySettings = normalizeCellContentVisibilitySettings(this, mSettings);
	};

	/**
	 * Gets the cell content visibility settings.
	 *
	 * @returns {{standard: boolean,
	 *            summary: {total: boolean, group: boolean},
	 *            groupHeader: {expanded: boolean, collapsed: boolean, nonExpandable: boolean}}}
	 *     The cell content visibility settings.
	 * @private
	 */
	Column.prototype._getCellContentVisibilitySettings = function() {
		return _private(this).mCellContentVisibilitySettings;
	};

	/**
	 * Returns the column header menu instance that this column is associated with via the <code>headerMenu</code> association.
	 *
	 * @returns {sap.ui.core.IColumnHeaderMenu | undefined} The column header menu instance
	 * @private
	 */
	Column.prototype.getHeaderMenuInstance = function() {
		return Core.byId(this.getHeaderMenu());
	};

	function validateCellContentVisibilitySettings(mSettings) {
		if (mSettings == null) {
			return;
		}

		validateCellContentVisibilitySetting(mSettings, null, false, ["standard", "groupHeader", "summary"]);
		validateCellContentVisibilitySetting(mSettings.standard, "standard", true);
		validateCellContentVisibilitySetting(mSettings.groupHeader, "groupHeader", true, ["nonExpandable", "expanded", "collapsed"]);
		validateCellContentVisibilitySetting(mSettings.summary, "summary", true, ["group", "total"]);
	}

	function validateCellContentVisibilitySetting(vValue, sSettingName, bAllowBoolean, aAllowedObjectKeys) {
		if (vValue != null && !(bAllowBoolean && typeof vValue === "boolean" || aAllowedObjectKeys && typeof vValue === "object")) {
			throw new Error("Invalid value" + (sSettingName ? " for '" + sSettingName + "'" : ""));
		}

		if (aAllowedObjectKeys && vValue != null && typeof vValue === "object") {
			Object.keys(vValue).forEach(function(sSetting) {
				if (aAllowedObjectKeys.includes(sSetting)) {
					if (sSettingName != null) {
						validateCellContentVisibilitySetting(vValue[sSetting], sSettingName + "." + sSetting, true);
					}
				} else {
					throw new Error("Unsupported setting '" + (sSettingName ? sSettingName + "." : "") + sSetting + "'");
				}
			});
		}
	}

	function normalizeCellContentVisibilitySettings(oColumn, mSettings) {
		mSettings = mSettings ? mSettings : {};

		return {
			standard: normalizeCellContentVisibilitySetting(mSettings.standard),
			groupHeader: {
				nonExpandable: normalizeCellContentVisibilitySetting(mSettings.groupHeader, "nonExpandable"),
				expanded: normalizeCellContentVisibilitySetting(mSettings.groupHeader, "expanded"),
				collapsed: normalizeCellContentVisibilitySetting(mSettings.groupHeader, "collapsed")
			},
			summary: {
				group: normalizeCellContentVisibilitySetting(mSettings.summary, "group"),
				total: normalizeCellContentVisibilitySetting(mSettings.summary, "total")
			}
		};
	}

	function normalizeCellContentVisibilitySetting(mSetting, sKey) {
		if (typeof mSetting === "boolean") {
			return mSetting;
		} else if (sKey && mSetting) {
			return mSetting[sKey] !== false;
		} else {
			return true;
		}
	}

	/**
	 * Returns the corresponding column of a table cell.
	 *
	 * @param {sap.ui.core.Control} oCell The table cell
	 * @returns {sap.ui.table.Column | null} The column
	 * @private
	 * @static
	 */
	Column.ofCell = function(oCell) {
		return CellMap.get(oCell) || null;
	};

	return Column;

});