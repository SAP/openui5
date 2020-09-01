sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-2ca5b205', './chunk-b4193b36'], function (__chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_8, __chunk_31, __chunk_32) { 'use strict';

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<tr class=\"ui5-table-no-data-row-root\"><td colspan=\"", "\"><div class=\"ui5-table-no-data-row\"><span>", "</span></div></td></tr>"]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"", "\"></slot>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"", "\"></slot>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<table border=\"0\" cellspacing=\"0\" cellpadding=\"0\" @keydown=\"", "\"><thead><tr id=\"", "-columnHeader\" class=\"ui5-table-header-row\" tabindex=\"0\" style=\"height: 48px\" @click=\"", "\">", "</tr></thead><tbody>", "", "</tbody></table>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), context._onkeydown, __chunk_2.ifDefined(context._id), context._onColumnHeaderClick, __chunk_2.repeat(context.visibleColumns, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block1(item, index, context);
	  }), __chunk_2.repeat(context.rows, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block2(item, index, context);
	  }), !context.rows.length ? block3(context) : undefined);
	};

	var block1 = function block1(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.ifDefined(item._individualSlot));
	};

	var block2 = function block2(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(item._individualSlot));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), context.showNoData ? block4(context) : undefined);
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(context.visibleColumnsCount), __chunk_2.ifDefined(context.noDataText));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles = ":host(:not([hidden])){display:inline-block;width:100%}table{width:100%;border-spacing:0;border-collapse:collapse}.ui5-table-header-row{color:var(--sapTextColor);height:3rem;font-family:var(--sapFontFamily);font-size:var(--sapFontSize)}.ui5-table-header-row:focus{outline:var(--ui5_table_header_row_outline_width) dotted var(--sapContent_FocusColor);outline-offset:-.125rem}tr{height:3rem}.ui5-table-no-data-row{display:flex;align-items:center;width:100%;height:auto;justify-content:center;text-align:center;padding:.5rem 1rem;font-family:var(--sapFontFamily);font-size:.875rem;box-sizing:border-box;color:var(--sapTextColor);min-height:3rem;background-color:var(--sapList_Background);border-top:1px solid var(--sapList_BorderColor)}:host([_no-data-displayed]){border-bottom:1px solid var(--sapList_TableGroupHeaderBorderColor)}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-table",
	  managedSlots: true,
	  slots:
	  /** @lends sap.ui.webcomponents.main.Table.prototype */
	  {
	    /**
	     * Defines the <code>ui5-table</code> rows.
	     * <br><br>
	     * <b>Note:</b> Use <code>ui5-table-row</code> for the intended design.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      propertyName: "rows",
	      type: HTMLElement,
	      individualSlots: true
	    },

	    /**
	     * Defines the configuration for the columns of the <code>ui5-table</code>.
	     * <br><br>
	     * <b>Note:</b> Use <code>ui5-table-column</code> for the intended design.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    columns: {
	      type: HTMLElement,
	      individualSlots: true,
	      listenFor: {
	        include: ["*"]
	      }
	    }
	  },
	  properties:
	  /** @lends sap.ui.webcomponents.main.Table.prototype */
	  {
	    /**
	     * Defines the text that will be displayed when there is no data and <code>showNoData</code> is present.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    noDataText: {
	      type: String
	    },

	    /**
	     * Defines if the value of <code>noDataText</code> will be diplayed when there is no rows present in the table.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    showNoData: {
	      type: Boolean
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
	      type: Boolean
	    },
	    _hiddenColumns: {
	      type: Object,
	      multiple: true
	    },
	    _noDataDisplayed: {
	      type: Boolean
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.Table.prototype */
	  {
	    /**
	     * Fired when a row is clicked.
	     *
	     * @event sap.ui.webcomponents.main.Table#row-click
	     * @param {HTMLElement} row the clicked row.
	     * @public
	     */
	    "row-click": {
	      detail: {
	        row: {
	          type: HTMLElement
	        }
	      }
	    },

	    /**
	     * Fired when the <code>ui5-table-column</code> is shown as a pop-in instead of hiding it.
	     *
	     * @event sap.ui.webcomponents.main.Table#popin-change
	     * @param {Array} poppedColumns popped-in columns.
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    "popin-change": {
	      detail: {
	        poppedColumns: {}
	      }
	    }
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-table</code> component provides a set of sophisticated and convenient functions for responsive table design.
	 * It provides a comprehensive set of features for displaying and dealing with vast amounts of data.
	 * <br><br>
	 * To render the <code>Table</code> properly, the order of the <code>columns</code> should match with the
	 * order of the item <code>cells</code> in the <code>rows</code>.
	 * <br><br>
	 * Desktop and tablet devices are supported.
	 * On tablets, special consideration should be given to the number of visible columns
	 * and rows due to the limited performance of some devices.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Table.js";</code>
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/TableColumn.js";</code> (for <code>ui5-table-column</code>)
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/TableRow.js";</code> (for <code>ui5-table-row</code>)
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/TableCell.js";</code> (for <code>ui5-table-cell</code>)
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Table
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-table
	 * @appenddocs TableColumn TableRow TableCell
	 * @public
	 */

	var Table =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Table, _UI5Element);

	  __chunk_1._createClass(Table, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return styles;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }]);

	  function Table() {
	    var _this;

	    __chunk_1._classCallCheck(this, Table);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Table).call(this));
	    _this._itemNavigation = new __chunk_31.ItemNavigation(__chunk_1._assertThisInitialized(_this), {
	      navigationMode: __chunk_31.NavigationMode.Vertical
	    });

	    _this._itemNavigation.getItemsCallback = function getItemsCallback() {
	      var columnHeader = this.getColumnHeader();
	      return columnHeader ? [columnHeader].concat(__chunk_1._toConsumableArray(this.rows)) : this.rows;
	    }.bind(__chunk_1._assertThisInitialized(_this));

	    _this.fnOnRowFocused = _this.onRowFocused.bind(__chunk_1._assertThisInitialized(_this));
	    _this._handleResize = _this.popinContent.bind(__chunk_1._assertThisInitialized(_this));
	    return _this;
	  }

	  __chunk_1._createClass(Table, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      var _this2 = this;

	      var columnSettings = this.getColumnPropagationSettings();
	      var columnSettingsString = JSON.stringify(columnSettings);
	      this.rows.forEach(function (row) {
	        if (row._columnsInfoString !== columnSettingsString) {
	          row._columnsInfo = columnSettings;
	          row._columnsInfoString = JSON.stringify(row._columnsInfo);
	        }

	        row.removeEventListener("ui5-_focused", _this2.fnOnRowFocused);
	        row.addEventListener("ui5-_focused", _this2.fnOnRowFocused);
	      });
	      this.visibleColumns = this.columns.filter(function (column, index) {
	        column.sticky = _this2.stickyColumnHeader;
	        return !_this2._hiddenColumns[index];
	      });
	      this._noDataDisplayed = !this.rows.length && this.showNoData;
	      this.visibleColumnsCount = this.visibleColumns.length;
	    }
	  }, {
	    key: "onEnterDOM",
	    value: function onEnterDOM() {
	      __chunk_32.ResizeHandler.register(this.getDomRef(), this._handleResize);
	    }
	  }, {
	    key: "onExitDOM",
	    value: function onExitDOM() {
	      __chunk_32.ResizeHandler.deregister(this.getDomRef(), this._handleResize);
	    }
	  }, {
	    key: "onRowFocused",
	    value: function onRowFocused(event) {
	      this._itemNavigation.update(event.target);
	    }
	  }, {
	    key: "_onColumnHeaderClick",
	    value: function _onColumnHeaderClick(event) {
	      this.getColumnHeader().focus();

	      this._itemNavigation.update(event.target);
	    }
	  }, {
	    key: "getColumnHeader",
	    value: function getColumnHeader() {
	      return this.getDomRef() && this.getDomRef().querySelector("#".concat(this._id, "-columnHeader"));
	    }
	  }, {
	    key: "popinContent",
	    value: function popinContent(_event) {
	      var clientRect = this.getDomRef().getBoundingClientRect();
	      var tableWidth = clientRect.width;
	      var hiddenColumns = [];
	      var visibleColumnsIndexes = []; // store the hidden columns

	      this.columns.forEach(function (column, index) {
	        if (tableWidth < column.minWidth && column.minWidth !== Infinity) {
	          hiddenColumns[index] = {
	            index: index,
	            popinText: column.popinText,
	            demandPopin: column.demandPopin
	          };
	        } else {
	          visibleColumnsIndexes.push(index);
	        }
	      });

	      if (visibleColumnsIndexes.length) {
	        this.columns[visibleColumnsIndexes[0]].first = true;
	        this.columns[visibleColumnsIndexes[visibleColumnsIndexes.length - 1]].last = true;
	      } // invalidate only if hidden columns count has changed


	      if (this._hiddenColumns.length !== hiddenColumns.length) {
	        this._hiddenColumns = hiddenColumns;

	        if (hiddenColumns.length) {
	          this.fireEvent("popin-change", {
	            poppedColumns: this._hiddenColumns
	          });
	        }
	      }
	    }
	    /**
	     * Gets settings to be propagated from columns to rows.
	     *
	     * @returns {object}
	     * @memberof Table
	     */

	  }, {
	    key: "getColumnPropagationSettings",
	    value: function getColumnPropagationSettings() {
	      var _this3 = this;

	      return this.columns.map(function (column, index) {
	        return {
	          index: index,
	          minWidth: column.minWidth,
	          demandPopin: column.demandPopin,
	          text: column.textContent,
	          popinText: column.popinText,
	          visible: !_this3._hiddenColumns[index]
	        };
	      }, this);
	    }
	  }]);

	  return Table;
	}(__chunk_1.UI5Element);

	Table.define();

	return Table;

});
//# sourceMappingURL=Table.js.map
