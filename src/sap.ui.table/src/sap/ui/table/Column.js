/*!
* ${copyright}
*/

// Provides control sap.ui.table.Column.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Element', 'sap/ui/core/RenderManager', 'sap/ui/model/Filter', 'sap/ui/model/Sorter', 'sap/ui/model/Type', 'sap/ui/model/type/String', './library'],
function(jQuery, Element, RenderManager, Filter, Sorter, Type, String, library) {
	"use strict";


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
			 * Width of the column. Works only with px/em/rem values. Em are handled like rem values.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * If the table is wider than the sum of widths of the visible columns, the columns will be
			 * resized proportionally to their widths that were set originally. If set to false, the column will be displayed in the
			 * original width. If all columns are set to not be flexible, an extra "dummy" column will be
			 * created at the end of the table.
			 */
			flexible : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set to true, the column can be resized either using the resize-handle (by mouse) or using
			 * the keyboard (SHIFT + Left/Right Arrow keys)
			 */
			resizable : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Horizontal alignment of the column content. Controls with a text align do not inherit
			 * the horizontal alignment. You have to set the text align directly on the template.
			 */
			hAlign : {type : "sap.ui.core.HorizontalAlign", group : "Appearance", defaultValue : sap.ui.core.HorizontalAlign.Begin},

			/**
			 * Indicates if the column is sorted. This property only controls if a sort indicator is displayed in the
			 * column header - it does not trigger the sort function. The column has to be sorted by calling <code>Column.sort()</code>
			 */
			sorted : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * This property indicates the sort direction (Ascending or Descending). The corresponding icon will be
			 * rendered if the property <code>sorted</code> is <code>true</code>
			 * @see sap.ui.table.SortOrder (default value: "Ascending")
			 */
			sortOrder : {type : "sap.ui.table.SortOrder", group : "Appearance", defaultValue : sap.ui.table.SortOrder.Ascending},

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
			 * column header - it does not trigger the filter function. The column has to be filtered by calling <code>Column.sort()</code>
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
			 * By default <code>Contains</code> is used for string and <code>EQ</code> for other types. A valid <code>sap.ui.model.FilterOperator</code> needs to be passed.
			 */
			defaultFilterOperator : {type : "string", group : "Behavior", defaultValue : null},

			/**
			 * Type of Filter. This is used to transform the search term to the specified type,
			 * to make sure that the right columns are displayed. This should be the same as defined
			 * in binding for this column. As an alternative you can pass a function which does the conversion.
			 * The function receives the entered filter value as parameter and returns the proper
			 * value for the filter expression. Another option is to pass the class name of the type,
			 * e.g.: <code>sap.ui.model.type.Date</code> or an expression similar to the binding syntax,
			 * e.g.: <code>"\{type: 'sap.ui.model.type.Date', formatOptions: \{UTC: true\}, constraints: {} \}"</code>.
			 * Here the escaping is mandatory to avoid handling by the binding parser.
			 * By default the filter type is <code>sap.ui.model.type.String</code>.
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
			 * The name of the column which is used in the column visibility menu item as text.
			 * If not set as a fallback the column menu tries to get the text from the nested Label.
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
			 */
			headerSpan : {type : "any", group : "Behavior", defaultValue : 1},

			/**
			 * Enables auto-resizing of the column on double-clicking the resizer. The width is determined on the widest
			 * currently displayed content. It does not consider rows which are currently not scrolled into view.
			 * Currently only implemented to work with the following controls:
			 * <code>sap.m.Text, sap.m.Label, sap.m.Link, sap.m.Input,
			 * sap.ui.commons.TextView, sap.ui.commons.Label, sap.ui.commons.Link and sap.ui.commons.TextField,
			 * sap.ui.commons.Checkbox, sap.m.Checkbox</code>
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
			 * Template (cell renderer) of this column. A template is decoupled from the column, which means after
			 * changing the templates' properties or aggregations an explicit invalidation of the column or table is
			 * required. The default depends on the loaded libraries.
			 */
			template : {type : "sap.ui.core.Control", multiple : false},

			/**
			 * The menu used by the column. By default the {@see sap.ui.table.ColumnMenu} is used.
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
	Column._DEFAULT_FILTER_TYPE = new String();

	/**
	 * called when the column is initialized
	 */
	Column.prototype.init = function() {

		this.oResBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.table");
		this._oSorter = null;

		// Skip proppagation of databinding properties to the template
		this.mSkipPropagation = {template: true};

	};

	/**
	 * called when the column is destroyed
	 */
	Column.prototype.exit = function() {

		// destroy the sort image
		var oSortImage = sap.ui.getCore().byId(this.getId() + "-sortIcon");
		if (oSortImage) {
			oSortImage.destroy();
		}

		// destroy the filter image
		var oFilterImage = sap.ui.getCore().byId(this.getId() + "-filterIcon");
		if (oFilterImage) {
			oFilterImage.destroy();
		}

	};

	/**
	 * called when the column's parent is set
	 */
	Column.prototype.setParent = function(oParent, sAggregationName, bSuppressRerendering) {
		Element.prototype.setParent.apply(this, arguments);
		var oMenu = this.getAggregation("menu");
		if (oMenu && typeof oMenu._updateReferences === "function") {
			//if menu is set update menus internal references
			oMenu._updateReferences(this);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.invalidate = function(oOrigin) {
		// prevent changes in the template (especially the databinding ones)
		//  - what about exchanging the template? => implemented in setTemplate
		//  - what about modifiying properties? => developer must call invalidate!
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
		 * supressing the invalidate. But this finally also decouples the Table
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
		if (oOrigin !== this.getTemplate() && !(oOrigin instanceof sap.ui.table.ColumnMenu)) {
			// changes on the template require to call invalidate on the column or table
			Element.prototype.invalidate.apply(this, arguments);
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setLabel = function(vLabel) {
		var oLabel = vLabel;
		if (typeof (vLabel) === "string") {
			oLabel = sap.ui.table.TableHelper.createLabel({text: vLabel});
		}
		this.setAggregation("label", oLabel);
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setTemplate = function(vTemplate) {
		var oTemplate = vTemplate;
		if (typeof (vTemplate) === "string") {
			oTemplate = sap.ui.table.TableHelper.createTextView().bindProperty("text", vTemplate);
		}
		this.setAggregation("template", oTemplate);
		// manually invalidate the Column (because of the invalidate decoupling to
		// prevent invalidations from the databinding part)
		this.invalidate();
		var oTable = this.getParent();
		if (oTable && oTable._resetRowTemplate) {
			oTable._resetRowTemplate();
		}
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
		if (oMenu && oMenu._invalidate) {
			oMenu._invalidate();
		}
	};

	/**
	 * Checks whether or not the menu has items. This function considers table and column
	 * properties to determine whether the column menu would have items. If there is a menu set,
	 * it will just check whether there are items in the item aggregation.
	 * @return {Boolean} True if the menu has or could have items.
	 * @private
	 */
	Column.prototype._menuHasItems = function() {
		var oMenu = this.getAggregation("menu");
		var oTable = this.getParent();
		var fnMenuHasItems = function() {
			return (
				this.isSortableByMenu() || // Sorter
				this.isFilterableByMenu() || // Filter
				this.isGroupableByMenu() || // Grouping
				(oTable && oTable.getEnableColumnFreeze()) || // Column Freeze
				(oTable && oTable.getShowColumnVisibilityMenu()) // Column Visibility Menu
			);

		}.bind(this);

		return !!((oMenu && oMenu.getItems().length > 0) || fnMenuHasItems());
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
	Column.prototype.isGroupableByMenu = function() {
		var oTable = this.getParent();
		return !!(oTable && oTable.getEnableGrouping && oTable.getEnableGrouping() && this.getSortProperty());
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setMenu = function(oMenu) {
		this.setAggregation("menu", oMenu, true);
		return this;
	};

	/*
	 * Factory method. Creates the column menu.
	 *
	 * @return {sap.ui.table.ColumnMenu} The created column menu.
	 */
	Column.prototype._createMenu = function() {
		jQuery.sap.require("sap.ui.table.ColumnMenu");

		if (!this._defaultMenu) {
			this._defaultMenu =  new sap.ui.table.ColumnMenu(this.getId() + "-menu", {ariaLabelledBy: this});
		}

		return this._defaultMenu;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setWidth = function(sWidth, bSuppressInvalidate) {
		this.setProperty("width", sWidth, bSuppressInvalidate);
		this.fireEvent('_widthChanged', { newWidth: sWidth });
		return this;
	};

	Column.prototype._setAppDefault = function(sProperty, mValue) {
		if (!this._appDefaults) {
			this._appDefaults = {};
		}

		if (sProperty == "sorted") {
			this._appDefaults.sorted = mValue;
		} else if (sProperty == "sortOrder") {
			this._appDefaults.sortOrder = mValue;
		} else if (sProperty == "filtered") {
			this._appDefaults.filtered = mValue;
		} else if (sProperty == "filterValue") {
			this._appDefaults.filterValue = mValue;
		} else if (sProperty == "filterOperator") {
			this._appDefaults.filterOperator = mValue;
		}
	};

	Column.prototype._restoreAppDefaults = function() {
		if (this._appDefaults) {
			this.setProperty("sorted", this._appDefaults.sorted, true);
			this.setProperty("sortOrder", this._appDefaults.sortOrder, true);
			this.setProperty("filtered", this._appDefaults.filtered, true);
			this.setProperty("filterValue", this._appDefaults.filterValue, true);
			this.setProperty("filterOperator", this._appDefaults.filterOperator, true);
			this._renderSortIcon();
			this._renderFilterIcon();
		}
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setSorted = function(bFlag) {
		this.setProperty("sorted", bFlag, true);
		this._setAppDefault("sorted", bFlag);
		this._renderSortIcon();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setSortOrder = function(tSortOrder) {
		this.setProperty("sortOrder", tSortOrder, true);
		this._setAppDefault("sortOrder", tSortOrder);
		this._renderSortIcon();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setFiltered = function(bFlag) {
		this.setProperty("filtered", bFlag, true);
		this._setAppDefault("filtered", bFlag);
		this._renderFilterIcon();
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setFilterValue = function(sValue) {
		this.setProperty("filterValue", sValue, true);
		this._setAppDefault("filterValue", sValue);
		var oMenu = this.getMenu();
		if (oMenu && oMenu instanceof sap.ui.table.ColumnMenu) {
			oMenu._setFilterValue(sValue);
		}
		return this;
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setFilterOperator = function(sValue) {
		this.setProperty("filterOperator", sValue, true);
		this._setAppDefault("filterOperator", sValue);
		return this;
	};


	/**
	 * Function is called when mouse button is pressed.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Column.prototype.onmousedown = function(oEvent) {
		var oMenu = this.getAggregation("menu");
		this._bSkipOpen = oMenu && oMenu.bOpen;
	};


	/**
	 * Function is called when mouse leaves the control.
	 *
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Column.prototype.onmouseout = function(oEvent) {
		if (this._bSkipOpen && jQuery.sap.checkMouseEnterOrLeave(oEvent, this.getDomRef())){
			this._bSkipOpen = false;
		}
	};

	/**
	 * Open the column menu
	 * @param [{Object}] oDomRef Optional DOM reference of the element to which the menu should be visually attached. Fallback is the focused DOM reference
	 * @private
	 */
	Column.prototype._openMenu = function(oDomRef, bWithKeyboard) {
		if (this._bSkipOpen){
			this._bSkipOpen = false;
			return;
		}

		var oMenu = this.getMenu();
		var bExecuteDefault = this.fireColumnMenuOpen({
			menu: oMenu
		});

		if (bExecuteDefault) {
			var eDock = sap.ui.core.Popup.Dock;
			var oFocusDomRef = oDomRef;
			if (!oDomRef) {
				oDomRef = this.getDomRef();
				oFocusDomRef = this.getFocusDomRef();
			}
			oMenu.open(!!bWithKeyboard, oFocusDomRef, eDock.BeginTop, eDock.BeginBottom, oDomRef, "none none");
		}
	};


	/**
	 * Toggles the sort order of the column.
	 *
	 * @type sap.ui.table.Column
	 * @public
	 * @deprecated Since version 1.5.1.
	 * Please use the function "sap.ui.Table.prototype.sort".
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Column.prototype.toggleSort = function() {
		// by default we sort ascending / only if already is sorted ascending then we toggle
		this.sort(this.getSorted() && this.getSortOrder() === sap.ui.table.SortOrder.Ascending);
	};


	/**
	 * sorts the current column ascending or descending
	 *
	 * @param {boolean} bDescending
	 *         sort order of the column (if undefined the default will be ascending)
	 * @type sap.ui.table.Column
	 * @public
	 * @deprecated Since version 1.5.1.
	 * Please use the function "sap.ui.Table.prototype.sort".
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Column.prototype.sort = function(bDescending, bAdd) {
		var oTable = this.getParent();
		if (oTable) {
			// add current column to list of sorted columns
			oTable.pushSortedColumn(this, bAdd);
			// get the sort order type
			var sNewSortOrder = bDescending ? sap.ui.table.SortOrder.Descending : sap.ui.table.SortOrder.Ascending;

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
					if (jQuery.inArray(aColumns[i], aSortedCols) < 0) {
						// column is not sorted anymore -> reset default and remove sorter
						aColumns[i].setProperty("sorted", false, true);
						aColumns[i].setProperty("sortOrder", sap.ui.table.SortOrder.Ascending, true);
						aColumns[i]._renderSortIcon();
						delete aColumns[i]._oSorter;
					}
				}

				// update properties of current column
				this.setProperty("sorted", true, true);
				this.setProperty("sortOrder", sNewSortOrder, true);
				this._oSorter = new Sorter(this.getSortProperty(), this.getSortOrder() === sap.ui.table.SortOrder.Descending);

				// add sorters of all sorted columns to one sorter-array and update sort icon rendering for sorted columns
				var aSorters = [];
				for (var i = 0, l = aSortedCols.length; i < l; i++) {
					aSortedCols[i]._renderSortIcon();
					aSorters.push(aSortedCols[i]._oSorter);
				}

				if (oTable.isBound("rows")) {
					// sort the binding
					oTable.getBinding("rows").sort(aSorters);

					if (this._afterSort) {
						this._afterSort();
					}
				}
			}
		}
		return this;
	};

	function getHTML(oImage) {
		var oRenderManager = sap.ui.getCore().createRenderManager(),
			sHTML = oRenderManager.getHTML(oImage);
		oRenderManager.destroy();
		return sHTML;
	}

	Column.prototype._renderSortIcon = function() {

		var oTable = this.getParent();
		if (oTable && oTable.getDomRef()) {
			if (this.getSorted()) {

				// create the image for the sort order visualization
				var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
				var oImage = sap.ui.getCore().byId(this.getId() + "-sortIcon") || sap.ui.table.TableHelper.createImage(this.getId() + "-sortIcon");
				oImage.addStyleClass("sapUiTableColIconsOrder");
				if (this.getSortOrder() === sap.ui.table.SortOrder.Ascending) {
					oImage.setSrc(sap.ui.resource("sap.ui.table", "themes/" + sCurrentTheme + "/img/ico12_sort_asc.gif"));
				} else {
					oImage.setSrc(sap.ui.resource("sap.ui.table", "themes/" + sCurrentTheme + "/img/ico12_sort_desc.gif"));
				}

				// apply the image to the column
				var htmlImage = getHTML(oImage);
				this.$().find(".sapUiTableColIconsOrder").remove();
				jQuery(htmlImage).prependTo(this.getDomRef("icons"));
				this.$().find(".sapUiTableColCell").addClass("sapUiTableColSorted");

			} else {

				// remove the sort indicators
				this.$().find(".sapUiTableColIconsOrder").remove();
				this.$().find(".sapUiTableColCell").removeClass("sapUiTableColSorted");

			}
			oTable._getAccExtension().updateAriaStateOfColumn(this);
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
			bIsString = oType instanceof String,
			aBetween;

		if (sValue) {

			// determine the operator
			if (!sOperator) {

				aBetween = sValue.match(/(.*)\s*\.\.\s*(.*)/);

				// determine the filter operator depending on the
				if (sValue.indexOf("=") == 0) {
					sOperator = sap.ui.model.FilterOperator.EQ;
					sParsedValue = sValue.substr(1);
				} else if (sValue.indexOf("!=") == 0) {
					sOperator = sap.ui.model.FilterOperator.NE;
					sParsedValue = sValue.substr(2);
				} else if (sValue.indexOf("<=") == 0) {
					sOperator = sap.ui.model.FilterOperator.LE;
					sParsedValue = sValue.substr(2);
				} else if (sValue.indexOf("<") == 0) {
					sOperator = sap.ui.model.FilterOperator.LT;
					sParsedValue = sValue.substr(1);
				} else if (sValue.indexOf(">=") == 0) {
					sOperator = sap.ui.model.FilterOperator.GE;
					sParsedValue = sValue.substr(2);
				} else if (sValue.indexOf(">") == 0) {
					sOperator = sap.ui.model.FilterOperator.GT;
					sParsedValue = sValue.substr(1);
				} else if (aBetween) {
					if (aBetween[1] && aBetween[2]) {
						sOperator = sap.ui.model.FilterOperator.BT;
						sParsedValue = aBetween[1];
						sSecondaryParsedValue = aBetween[2];
					} else if (aBetween[1] && !aBetween[2]) {
						sOperator = sap.ui.model.FilterOperator.GE;
						sParsedValue = aBetween[1];
					} else {
						sOperator = sap.ui.model.FilterOperator.LE;
						sParsedValue = aBetween[2];
					}
				} else if (bIsString && sValue.indexOf("*") == 0 && sValue.lastIndexOf("*") == sValue.length - 1) {
					sOperator = sap.ui.model.FilterOperator.Contains;
					sParsedValue = sValue.substr(1, sValue.length - 2);
				} else if (bIsString && sValue.indexOf("*") == 0) {
					sOperator = sap.ui.model.FilterOperator.EndsWith;
					sParsedValue = sValue.substr(1);
				} else if (bIsString && sValue.lastIndexOf("*") == sValue.length - 1) {
					sOperator = sap.ui.model.FilterOperator.StartsWith;
					sParsedValue = sValue.substr(0, sValue.length - 1);
				} else {
					if (this.getDefaultFilterOperator()) {
						sOperator = this.getDefaultFilterOperator();
					} else {
						if (bIsString) {
							// Due to compatibility reason we need to use Contains for Strings instead of EQ as default!!
							sOperator = sap.ui.model.FilterOperator.Contains;
						} else {
							sOperator = sap.ui.model.FilterOperator.EQ;
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
				if (oMenu && oMenu instanceof sap.ui.table.ColumnMenu) {
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
						if (oMenu && oMenu instanceof sap.ui.table.ColumnMenu) {
							oMenu._setFilterState(sap.ui.core.ValueState.None);
						}
					} catch (e) {
						if (oMenu && oMenu instanceof sap.ui.table.ColumnMenu) {
							oMenu._setFilterState(sap.ui.core.ValueState.Error);
						}
						continue;
					}
					if (oFilter) {
						aFilters.push(oFilter);
					}
				}
				oTable.getBinding("rows").filter(aFilters, sap.ui.model.FilterType.Control);

				this._renderFilterIcon();

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

	Column.prototype._renderFilterIcon = function() {
		var oTable = this.getParent();
		if (oTable && oTable.getDomRef()) {
			var sCurrentTheme = sap.ui.getCore().getConfiguration().getTheme();
			var oImage = sap.ui.getCore().byId(this.getId() + "-filterIcon") ||
				sap.ui.table.TableHelper.createImage({
					id: this.getId() + "-filterIcon",
					decorative: false,
					alt: oTable._oResBundle.getText("TBL_FILTER_ICON_TEXT")
				});
			oImage.$().remove();
			oImage.addStyleClass("sapUiTableColIconsFilter");
			if (this.getFiltered()) {
				oImage.setSrc(sap.ui.resource("sap.ui.table", "themes/" + sCurrentTheme + "/img/ico12_filter.gif"));
				var htmlImage = getHTML(oImage);
				jQuery(htmlImage).prependTo(this.getDomRef("icons"));
				this.$().find(".sapUiTableColCell").addClass("sapUiTableColFiltered");
			} else {
				this.$().find(".sapUiTableColCell").removeClass("sapUiTableColFiltered");
			}
			oTable._getAccExtension().updateAriaStateOfColumn(this);
		}
	};

	Column.prototype._restoreIcons = function() {

		if (this.getSorted()) {
			this._renderSortIcon();
		}

		if (this.getFiltered()) {
			this._renderFilterIcon();
		}

	};

	/**
	 * Returns whether the column should be rendered or not.
	 * @return {boolean} true, if the column should be rendered
	 * @protected
	 */
	Column.prototype.shouldRender = function() {
		return this.getVisible() && !this.getGrouped();
	};

	Column.PROPERTIES_FOR_ROW_INVALIDATION = {visible: true, flexible: true, headerSpan: true};
	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setProperty = function(sName, vValue) {
		var oTable = this.getParent();

		if (oTable && oTable._resetRowTemplate && this.getProperty(sName) != vValue && Column.PROPERTIES_FOR_ROW_INVALIDATION[sName]) {
			oTable._resetRowTemplate();
		}

		return Element.prototype.setProperty.apply(this, arguments);
	};

	/*
	 * support the declarative usage of the filter type
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	Column.prototype.setFilterType = function(vType) {
		var oType = vType;
		if (typeof (vType) === "string") {
			try {
				// similar to BindingParser allow to specify formatOptions and constraints for types
				var mConfig = jQuery.sap.parseJS(vType);
				if (typeof (mConfig.type) === "string") {
					var fnType = jQuery.sap.getObject(mConfig.type);
					oType = fnType && new fnType(mConfig.formatOptions, mConfig.constraints);
				}
			} catch (ex) {
				var fnType = jQuery.sap.getObject(vType);
				oType = fnType && new fnType();
			}
			// check for a valid type
			if (!(oType instanceof Type)) {
				jQuery.sap.log.error("The filter type is not an instance of sap.ui.model.Type! Ignoring the filter type!");
				oType = undefined;
			}
		}
		this.setProperty("filterType", oType, true);
		return this;
	};

	/**
	 * Determines the column index based upon the order in its aggregation.
	 * Invisible columns are taken in account of order.
	 * @see JSDoc generated by SAPUI5 control API generator
	 * @return {int} the column index.
	 */
	Column.prototype.getIndex = function() {
		var oTable = this.getParent();
		if (oTable) {
			return oTable.indexOfColumn(this);
		} else {
			return -1;
		}
	};

	return Column;

}, /* bExport= */ true);
