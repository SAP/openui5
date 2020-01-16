/*!
 * ${copyright}
 */

// Provides control sap.ui.table.Column.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/library',
	'sap/ui/core/Popup',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/FilterType',
	'sap/ui/model/Sorter',
	'sap/ui/model/Type',
	'sap/ui/model/type/String',
	'./utils/TableUtils',
	'./library',
	'./ColumnMenu',
	'sap/base/util/ObjectPath',
	"sap/base/util/JSTokenizer",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
],
function(
	Element,
	coreLibrary,
	Popup,
	Filter,
	FilterOperator,
	FilterType,
	Sorter,
	Type,
	StringType,
	TableUtils,
	library,
	ColumnMenu,
	ObjectPath,
	JSTokenizer,
	Log,
	jQuery
) {
	"use strict";

	// shortcuts
	var HorizontalAlign = coreLibrary.HorizontalAlign,
		SortOrder = library.SortOrder,
		ValueState = coreLibrary.ValueState;

	var TemplateType = {
		Standard: "Standard",
		Creation: "Creation"
	};

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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Column = Element.extend("sap.ui.table.Column", /** @lends sap.ui.table.Column.prototype */ { metadata : {

		library : "sap.ui.table",
		properties : {

			/**
			 * Width of the column in CSS units.
			 * Default value is <code>auto</code>, see <a href="https://www.w3.org/TR/CSS2/tables.html#width-layout"></a>
			 * <p>Minimal column width is device-dependent, for example on desktop devices the column will not be smaller than 48px.
			 * <p>This property can be changed by the user or by the application configuration/personalization.
			 * <p>If a user adjusts the column width manually, the resulting value is always set in pixels.
			 * In addition, other columns with width <code>auto</code> get a fixed minimum width and do not shrink after the resizing.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Defines the minimum width of a column in pixels.
			 * <p>This property only has an effect if the given column width is flexible, for example with width <code>auto</code>.
			 * <p>This property only influences the automatic behavior. If a user adjusts the column width manually, the column width can become
			 * smaller.
			 * <p>Minimal column width is device-dependent, for example on desktop devices the column will not be smaller than 48px.
			 *
			 * @since 1.44.1
			 */
			minWidth : {type : "int", group : "Dimension", defaultValue : 0},

			/**
			 * If the table is wider than the sum of widths of the visible columns, the columns will be
			 * resized proportionally to their widths that were set originally. If set to false, the column will be displayed in the
			 * original width. If all columns are set to not be flexible, an extra "dummy" column will be
			 * created at the end of the table.
			 * @deprecated As of version 1.44 this property has no effect. Use the property <code>minWidth</code> in combination with the property
			 * <code>width="auto"</code> instead.
			 */
			flexible : {type : "boolean", group : "Behavior", defaultValue : true, deprecated: true},

			/**
			 * If set to true, the column can be resized either using the resize bar (by mouse) or using
			 * the keyboard (SHIFT + Left/Right Arrow keys)
			 */
			resizable : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Horizontal alignment of the column content. Controls with a text align do not inherit
			 * the horizontal alignment. You have to set the text align directly on the template.
			 */
			hAlign : {type : "sap.ui.core.HorizontalAlign", group : "Appearance", defaultValue : HorizontalAlign.Begin},

			/**
			 * Indicates if the column is sorted. This property only controls if a sort indicator is displayed in the
			 * column header - it does not trigger the sort function. The column can be sorted using {@link sap.ui.table.Table#sort}.
			 */
			sorted : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * This property indicates the sort direction (Ascending or Descending). The corresponding icon will be
			 * rendered if the property <code>sorted</code> is <code>true</code>
			 * @see sap.ui.table.SortOrder (default value: "Ascending")
			 */
			sortOrder : {type : "sap.ui.table.SortOrder", group : "Appearance", defaultValue : SortOrder.Ascending},

			/**
			 * Specifies the binding property on which the column will sort.
			 * Since the column template may have composite bindings, it's not possible to figure out on which binding
			 * property the sort shall be applied. Therefore the binding property for sorting must be specified.
			 * For example, if the first name and last name are displayed in the same column, only one of the two can be defined as
			 * <code>sortProperty</code>.
			 *
			 * A column menu entry for sorting can only be generated if the <code>sortProperty</code> is set.
			 */
			sortProperty : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * Indicates if the column is filtered. This property only controls if a filter indicator is displayed in the
			 * column header - it does not trigger the filter function. The column can be filtered using {@link sap.ui.table.Table#filter}.
			 */
			filtered : {type : "boolean", group : "Appearance", defaultValue : false},

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
			filterProperty : {type : "string", group : "Behavior", defaultValue : null},

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
			filterValue : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * Filter operator to use when filtering this column.
			 * @see sap.ui.model.FilterOperator (default value: "Contains")
			 */
			filterOperator : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * If this property is set, the default filter operator of the column is overridden.
			 * By default <code>Contains</code> is used for string and <code>EQ</code> for other types. A valid
			 * <code>sap.ui.model.FilterOperator</code> needs to be passed.
			 */
			defaultFilterOperator : {type : "string", group : "Behavior", defaultValue : null},

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
			 * @since 1.9.2
			 */
			filterType : {type : "any", group : "Misc", defaultValue : null},

			/**
			 * Indicates if the column is grouped.
			 */
			grouped : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Invisible controls are not rendered.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * The name of the column which is used for the text representation of this column, for example, in menus.
			 * If not set, the text from the multiLabels aggregation or the label aggregation (in that order) is used as a fallback option.
			 * @since 1.11.1
			 */
			name : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Defines if the filter menu entry is displayed
			 * @since 1.13.0
			 */
			showFilterMenuEntry : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Defines if the sort menu entries are displayed
			 * @since 1.13.0
			 */
			showSortMenuEntry : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If this property is set, a span is applied for the header. When moving columns, all columns
			 * which are part of the header will be moved. The <code>headerSpan</code> can be either an integer or an array of
			 * integers (if you use the multi header feature of the table). If you only specify an integer, this span is
			 * applied for all header rows, with multiple integers you can specify a separate span for each header row.
			 * <b>Note:</b> Only columns with a span equal to 1 can have a column menu. When setting a column to fixed, all
			 * columns which are part of the header with the greatest span will be set to fixed.
			 */
			headerSpan : {type : "any", group : "Behavior", defaultValue : 1},

			/**
			 * Enables auto-resizing of the column on double clicking the resize bar. The width is determined on the widest
			 * currently displayed content. It does not consider rows which are currently not scrolled into view.
			 * Currently only implemented to work with the following controls:
			 * <code>sap.m.Text, sap.m.Label, sap.m.Link, sap.m.Input,
			 * sap.ui.commons.TextView, sap.ui.commons.Label, sap.ui.commons.Link and sap.ui.commons.TextField,
			 * sap.ui.commons.Checkbox, sap.m.CheckBox</code>
			 * @since 1.21.1
			 */
			autoResizable : {type : "boolean", group : "Behavior", defaultValue : false}
		},
		defaultAggregation : "label",
		aggregations : {

			/**
			 * Label of the column which is displayed in the column header. This aggregation is for the standard behavior,
			 * where you only want to display one single row header. If a string is supplied, a default label control will be
			 * created. Which control this is depends on the loaded libraries.
			 */
			label : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false},

			/**
			 * Labels of the column which are displayed in the column header. Define a control for
			 * each header row in the table. Use this aggregation if you want to use multiple headers per column.
			 * @since 1.13.1
			 */
			multiLabels : {type : "sap.ui.core.Control", multiple : true, singularName : "multiLabel"},

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
			 */
			template : {type : "sap.ui.core.Control", altTypes : ["string"], multiple : false},

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
			creationTemplate : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},

			/**
			 * The menu used by the column. By default the {@link sap.ui.table.ColumnMenu} is used.
			 *
			 * <b>Note:</b> Applications must not use or change the default <code>sap.ui.table.ColumnMenu</code> of
			 * a column in any way or create own instances of <code>sap.ui.table.ColumnMenu</code>.
			 * To add a custom menu to a column, use the aggregation <code>menu</code> with a new instance of
			 * <code>sap.ui.unified.Menu</code>.
			 */
			menu : {type : "sap.ui.unified.Menu", multiple : false}
		},

		events : {
			/**
			 * Fires before the column menu is opened.
			 * @since 1.33.0
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

		this._oSorter = null;

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
		ColumnMenu._destroyColumnVisibilityMenuItem(this.oParent);
	};

	/**
	 * called when the column's parent is set
	 */
	Column.prototype.setParent = function(oParent, sAggregationName, bSuppressRerendering) {
		ColumnMenu._destroyColumnVisibilityMenuItem(this.oParent);
		var vReturn = Element.prototype.setParent.apply(this, arguments);
		var oMenu = this.getAggregation("menu");
		if (oMenu && typeof oMenu._updateReferences === "function") {
			//if menu is set update menus internal references
			oMenu._updateReferences(this);
		}
		return vReturn;
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
		if (typeof (vLabel) === "string") {
			oLabel = library.TableHelper.createLabel({text: vLabel});
		}
		this.setAggregation("label", oLabel);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setTemplate = function(vTemplate) {
		var oTemplate = vTemplate;
		var oTable = this._getTable();
		var oOldTemplate = this.getTemplate();

		if (typeof vTemplate === "string") {
			oTemplate = library.TableHelper.createTextView().bindProperty("text", vTemplate);
		}

		this.setAggregation("template", oTemplate, true);

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
	 * @returns {sap.ui.table.Column} Reference to <code>this</code> in order to allow method chaining
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
	 * @returns {sap.ui.table.Column} Reference to <code>this</code> in order to allow method chaining
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Column.prototype.destroyCreationTemplate = function() {
		this.destroyAggregation("creationTemplate", true);
		this._destroyTemplateClones("Creation");
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.getMenu = function() {
		var oMenu = this.getAggregation("menu");
		if (!oMenu) {
			oMenu = this._createMenu();
			this.setMenu(oMenu);
		}
		return oMenu;
	};

	/**
	 * This function invalidates the column's menu. All items will be re-created the next time the menu opens. This only
	 * happens for generated menus.
	 * @private
	 */
	Column.prototype.invalidateMenu = function() {
		var oMenu = this.getAggregation("menu");

		if (this._bMenuIsColumnMenu) {
			oMenu._invalidate();
		}
	};

	/**
	 * Checks whether or not the menu has items. This function considers table and column
	 * properties to determine whether the column menu would have items. If there is a menu set,
	 * it will just check whether there are items in the item aggregation.
	 * @returns {Boolean} True if the menu has or could have items.
	 * @private
	 */
	Column.prototype._menuHasItems = function() {
		var oMenu = this.getAggregation("menu");
		var oTable = this._getTable();
		var bHasOwnItems = this.isSortableByMenu()
						   || this.isFilterableByMenu()
						   || this.isGroupable()
						   || (oTable && oTable.getEnableColumnFreeze())
						   || (oTable && oTable.getShowColumnVisibilityMenu());

		var bNotificationExpired = false;
		var bHooksProvideMenuItems = false;
		var fnNotifyAboutMenuItems = function() {
			if (bNotificationExpired) {
				throw new Error(TableUtils.Hook.Keys.Column.MenuItemNotification + " hook:"
								+ " The notification function cannot be called asynchronously.");
			}
			bHooksProvideMenuItems = true;
		};
		TableUtils.Hook.call(oTable, TableUtils.Hook.Keys.Column.MenuItemNotification, this, fnNotifyAboutMenuItems);
		bNotificationExpired = true;

		return !!((oMenu && oMenu.getItems().length > 0) || bHasOwnItems || bHooksProvideMenuItems);
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
	 * @returns {boolean}
	 */
	Column.prototype.isGroupable = function() {
		var oTable = this.getParent();
		return !!(oTable && oTable.getEnableGrouping && oTable.getEnableGrouping() && this.getSortProperty());
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setMenu = function(oMenu) {
		this.setAggregation("menu", oMenu, true);
		this._bMenuIsColumnMenu = TableUtils.isA(oMenu, "sap.ui.table.ColumnMenu");
		return this;
	};

	/*
	 * Factory method. Creates the column menu.
	 *
	 * @returns {sap.ui.table.ColumnMenu} The created column menu.
	 */
	Column.prototype._createMenu = function() {
		if (!this._defaultMenu) {
			this._defaultMenu = new ColumnMenu(this.getId() + "-menu", {ariaLabelledBy: this});
		}
		return this._defaultMenu;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setSortProperty = function(sValue) {
		this.setProperty("sortProperty", sValue);
		this.invalidateMenu();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setSorted = function(bFlag) {
		this.setProperty("sorted", bFlag, true);
		this._updateIcons();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setSortOrder = function(tSortOrder) {
		this.setProperty("sortOrder", tSortOrder, true);
		this._updateIcons();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setFilterProperty = function(sValue) {
		this.invalidateMenu();
		return this.setProperty("filterProperty", sValue);
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
	Column.prototype.setFilterValue = function(sValue) {
		this.setProperty("filterValue", sValue, true);

		var oMenu = this.getMenu();
		if (this._bMenuIsColumnMenu) {
			oMenu._setFilterValue(sValue);
		}

		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setFilterOperator = function(sValue) {
		return this.setProperty("filterOperator", sValue, true);
	};

	/**
	 * Open the column menu.
	 * @param {Object} [oDomRef] DOM reference of the element to which the menu should be visually attached. Fallback is the focused DOM reference.
	 * @returns {boolean} Whether the menu was opened.
	 * @private
	 */
	Column.prototype._openMenu = function(oDomRef) {
		var oMenu = this.getMenu();

		if (!this._menuHasItems()) {
			return false;
		}

		var bExecuteDefault = this.fireColumnMenuOpen({
			menu: oMenu
		});

		if (bExecuteDefault) {
			var eDock = Popup.Dock;
			var oFocusDomRef = oDomRef;
			if (!oDomRef) {
				oDomRef = this.getDomRef();
				oFocusDomRef = this.getFocusDomRef();
			}
			oMenu.open(null, oFocusDomRef, eDock.BeginTop, eDock.BeginBottom, oDomRef);
			return true;
		} else {
			return true; // We do not know whether the event handler opens a context menu or not, so we just assume it is done.
		}
	};


	/**
	 * Toggles the sort order of the column.
	 *
	 * @public
	 * @deprecated Since version 1.5.1.
	 * Please use the function "sap.ui.Table.prototype.sort".
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Column.prototype.toggleSort = function() {
		// by default we sort ascending / only if already is sorted ascending then we toggle
		this.sort(this.getSorted() && this.getSortOrder() === SortOrder.Ascending);
	};


	/**
	 * Sorts the current column ascending or descending.
	 *
	 * @param {boolean} bDescending Sort order of the column (if undefined the default will be ascending)
	 * @returns {sap.ui.table.Column} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 * @deprecated Since version 1.5.1. Please use the function "sap.ui.Table.prototype.sort".
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Column.prototype.sort = function(bDescending, bAdd) {
		var oTable = this.getParent();
		if (oTable) {
			// add current column to list of sorted columns
			oTable.pushSortedColumn(this, bAdd);
			// get the sort order type
			var sNewSortOrder = bDescending ? SortOrder.Descending : SortOrder.Ascending;

			// notify the event listeners
			var bExecuteDefault = oTable.fireSort({
				column: this,
				sortOrder: sNewSortOrder,
				columnAdded: bAdd
			});

			if (bExecuteDefault) {
				var aSortedCols = oTable.getSortedColumns();
				var aColumns = oTable.getColumns();

				// reset the sorting status of all columns which are not sorted anymore
				for (var i = 0, l = aColumns.length; i < l; i++) {
					if (aSortedCols.indexOf(aColumns[i]) < 0) {
						// column is not sorted anymore -> reset default and remove sorter
						aColumns[i].setProperty("sorted", false, true);
						aColumns[i].setProperty("sortOrder", SortOrder.Ascending, true);
						aColumns[i]._updateIcons(true);
						delete aColumns[i]._oSorter;
					}
				}

				// update properties of current column
				this.setProperty("sorted", true, true);
				this.setProperty("sortOrder", sNewSortOrder, true);
				this._oSorter = new Sorter(this.getSortProperty(), this.getSortOrder() === SortOrder.Descending);

				// add sorters of all sorted columns to one sorter-array and update sort icon rendering for sorted columns
				var aSorters = [];
				for (var i = 0, l = aSortedCols.length; i < l; i++) {
					aSortedCols[i]._updateIcons(true);
					aSorters.push(aSortedCols[i]._oSorter);
				}

				oTable._resetColumnHeaderHeights();
				oTable._updateRowHeights(oTable._collectRowHeights(true), true);

				var oBinding = oTable.getBinding("rows");
				if (oBinding) {
					// For the AnalyticalTable with an AnalyticalColumn.
					if (this._updateTableAnalyticalInfo) {
						// The analytical info must be updated before sorting via the binding. The request will still be correct, but the binding
						// will create its internal data structure based on the analytical info. We also do not need to get the contexts right
						// now (therefore "true" is passed"), this will be done later in refreshRows.
						this._updateTableAnalyticalInfo(true);
					}

					// sort the binding
					oBinding.sort(aSorters);

				} else {
					Log.warning("Sorting not performed because no binding present", this);
				}
			}
		}
		return this;
	};

	Column.prototype._updateIcons = function(bSkipUpdateRowHeights) {
		var oTable = this.getParent(),
			bSorted = this.getSorted(),
			bFiltered = this.getFiltered();

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
					} else {
						if (bIsString) {
							// Due to compatibility reason we need to use Contains for Strings instead of EQ as default!!
							sOperator = FilterOperator.Contains;
						} else {
							sOperator = FilterOperator.EQ;
						}
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
		var oTable = this.getParent();

		if (oTable && oTable.isBound("rows")) {

			// notify the event listeners
			var bExecuteDefault = oTable.fireFilter({
				column: this,
				value: sValue
			});

			if (bExecuteDefault) {
				this.setProperty("filtered", !!sValue, true);
				this.setProperty("filterValue", sValue, true);

				var oMenu = this.getMenu();
				if (this._bMenuIsColumnMenu) {
					// update column menu input field
					oMenu._setFilterValue(sValue);
				}

				var aFilters = [];
				var aCols = oTable.getColumns();
				for (var i = 0, l = aCols.length; i < l; i++) {
					var oCol = aCols[i],
						oFilter;

					oMenu = oCol.getMenu();
					try {
						oFilter = oCol._getFilter();
						if (oCol._bMenuIsColumnMenu) {
							oMenu._setFilterState(ValueState.None);
						}
					} catch (e) {
						if (oCol._bMenuIsColumnMenu) {
							oMenu._setFilterState(ValueState.Error);
						}
						continue;
					}
					if (oFilter) {
						aFilters.push(oFilter);
					}
				}
				oTable.getBinding("rows").filter(aFilters, FilterType.Control);

				this._updateIcons();
			}
		}

		return this;
	};

	Column.prototype._parseFilterValue = function(sValue) {
		var oFilterType = this.getFilterType();

		if (oFilterType) {
			if (jQuery.isFunction(oFilterType)) {
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
		return this.getVisible() && !this.getGrouped() && this.getTemplate() != null;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setProperty = function(sName, vValue) {
		var oTable = this._getTable();
		var bNeedRowsUpdate = oTable && sName === "visible" && this.getProperty(sName) != vValue;
		var vReturn = Element.prototype.setProperty.apply(this, arguments);

		if (bNeedRowsUpdate) {
			oTable.invalidateRowsAggregation();

			var oCreationRow = oTable.getCreationRow();
			if (oCreationRow) {
				oCreationRow._update();
			}
		}

		return vReturn;
	};

	/**
	 * The filter type can be the class name of a type, an expression similar to the binding syntax, or a function.
	 * A function receives the entered filter value as a parameter and should return the appropriate value for the filter expression.
	 *
	 * @param {any} vType The filter type
	 * @returns {sap.ui.table.Column} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 *
	 * @example <caption>Class name of a type.</caption>
	 * oColumn.setFilterType("sap.ui.model.type.Date");
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
					var fnType = ObjectPath.get(mConfig.type);
					oType = fnType && new fnType(mConfig.formatOptions, mConfig.constraints);
				}
			} catch (ex) {
				var fnType = ObjectPath.get(vType);
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
		var oTable = this.getParent();
		if (oTable) {
			return oTable.indexOfColumn(this);
		} else {
			return -1;
		}
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

			var oTable = this.getParent();
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

	Column.prototype._closeMenu = function() {
		var oMenu = this.getAggregation("menu");
		if (oMenu) {
			oMenu.close();
		}
	};

	Column.prototype.setVisible = function(bVisible) {
		this.setProperty("visible", bVisible);
		ColumnMenu._updateVisibilityIcon(this.getParent(), this.getIndex(), bVisible);
		return this;
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