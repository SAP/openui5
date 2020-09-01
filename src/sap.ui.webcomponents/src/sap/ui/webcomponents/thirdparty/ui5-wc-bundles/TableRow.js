sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5'], function (__chunk_1, __chunk_2, __chunk_6, __chunk_7) { 'use strict';

	function _templateObject8() {
	  var data = __chunk_1._taggedTemplateLiteral(["<span class=\"ui5-table-row-popin-title\">", ":</span>"]);

	  _templateObject8 = function _templateObject8() {
	    return data;
	  };

	  return data;
	}

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["<tr part=\"popin-row\" class=\"", "\" @click=\"", "\"><td colspan=\"", "\">", "<div><slot name=\"", "\"></slot></div></td></tr>"]);

	  _templateObject7 = function _templateObject7() {
	    return data;
	  };

	  return data;
	}

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"", "\"></slot>"]);

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
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<tr class=\"ui5-table-row-root\" tabindex=\"", "\" @focusin=\"", "\" @click=\"", "\" aria-label=\"", "\" data-sap-focus-ref part=\"row\">", "</tr>", " "]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context._tabIndex), context._onfocusin, context._onrowclick, __chunk_2.ifDefined(context.ariaLabelText), context.shouldPopin ? block1(context) : block3(context), context.shouldPopin ? block5(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.repeat(context.visibleCells, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block2(item, index, context);
	  }));
	};

	var block2 = function block2(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(item._individualSlot));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.repeat(context.cells, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block4(item, index, context);
	  }));
	};

	var block4 = function block4(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(item._individualSlot));
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), __chunk_2.repeat(context.popinCells, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block6(item, index, context);
	  }));
	};

	var block6 = function block6(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject7(), __chunk_2.ifDefined(item.classes), context._onrowclick, __chunk_2.ifDefined(context.visibleCellsCount), item.popinText ? block7(item, index, context) : undefined, __chunk_2.ifDefined(item.cell._individualSlot));
	};

	var block7 = function block7(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject8(), __chunk_2.ifDefined(item.popinText));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles = ":host{display:contents}.ui5-table-row-root{background-color:var(--sapList_Background);border-top:1px solid var(--sapList_BorderColor)}.ui5-table-row-root:focus{outline:var(--ui5_table_row_outline_width) dotted var(--sapContent_FocusColor);outline-offset:-.125rem}.ui5-table-popin-row{background-color:var(--sapList_Background)}.ui5-table-popin-row.all-columns-popped-in.popin-header{border-top:1px solid var(--sapList_BorderColor)}.ui5-table-popin-row td{padding:.25rem;padding-left:1rem}.ui5-table-row-popin-title{color:var(--sapContent_LabelColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize)}";

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-table-row",
	  managedSlots: true,
	  slots:
	  /** @lends sap.ui.webcomponents.main.TableRow.prototype */
	  {
	    /**
	     * Defines the cells of the <code>ui5-table-row</code>.
	     * <br><br>
	     * <b>Note:</b> Use <code>ui5-table-cell</code> for the intended design.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      propertyName: "cells",
	      type: HTMLElement,
	      individualSlots: true
	    }
	  },
	  properties:
	  /** @lends sap.ui.webcomponents.main.TableRow.prototype */
	  {
	    _columnsInfo: {
	      type: Object,
	      multiple: true
	    },
	    _tabIndex: {
	      type: String,
	      defaultValue: "-1"
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.TableRow.prototype */
	  {
	    "row-click": {},
	    _focused: {}
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-table-row</code> component represents a row in the <code>ui5-table</code>.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.TableRow
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-table-row
	 * @public
	 */

	var TableRow =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(TableRow, _UI5Element);

	  function TableRow() {
	    __chunk_1._classCallCheck(this, TableRow);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TableRow).apply(this, arguments));
	  }

	  __chunk_1._createClass(TableRow, [{
	    key: "_onfocusin",
	    value: function _onfocusin(event) {
	      var forceSelfFocus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	      if (forceSelfFocus || this._getActiveElementTagName() === "ui5-table-cell") {
	        this.getDomRef().focus();
	      }

	      this.fireEvent("_focused", event);
	    }
	  }, {
	    key: "_onrowclick",
	    value: function _onrowclick(event) {
	      if (this._getActiveElementTagName() === "body") {
	        // If the user clickes on non-focusable element within the ui5-table-cell,
	        // the focus goes to the body, se we have to bring it back to the row.
	        // If the user clicks on input, button or similar clickable element,
	        // the focus remains on that element.
	        this._onfocusin(event, true
	        /* force row focus */
	        );
	      }

	      this.fireEvent("row-click", {
	        row: this
	      });
	    }
	  }, {
	    key: "_getActiveElementTagName",
	    value: function _getActiveElementTagName() {
	      return document.activeElement.localName.toLocaleLowerCase();
	    }
	  }, {
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      var _this = this;

	      if (!this.shouldPopin) {
	        return;
	      }

	      this.visibleCells = [];
	      this.popinCells = [];

	      if (this.cells.length === 0) {
	        return;
	      }

	      var allColumnsPoppedInClass = this.allColumnsPoppedIn ? "all-columns-popped-in" : "";

	      this._columnsInfo.forEach(function (info, index) {
	        var cell = _this.cells[index];

	        if (!cell) {
	          return;
	        }

	        if (info.visible) {
	          _this.visibleCells.push(cell);

	          cell.firstInRow = index === 0;
	          cell.popined = false;
	        } else if (info.demandPopin) {
	          var popinHeaderClass = _this.popinCells.length === 0 ? "popin-header" : "";

	          _this.popinCells.push({
	            cell: cell,
	            popinText: info.popinText,
	            classes: "ui5-table-popin-row ".concat(allColumnsPoppedInClass, " ").concat(popinHeaderClass)
	          });

	          cell.popined = true;
	        } else {
	          cell.popined = false;
	        }
	      }, this);

	      var lastVisibleCell = this.visibleCells[this.visibleCells.length - 1];

	      if (lastVisibleCell) {
	        lastVisibleCell.lastInRow = true;
	      }
	    }
	  }, {
	    key: "getCellText",
	    value: function getCellText(cell) {
	      return this.getNormilzedTextContent(cell.textContent);
	    }
	  }, {
	    key: "getColumnTextByIdx",
	    value: function getColumnTextByIdx(index) {
	      var columnInfo = this._columnsInfo[index];

	      if (!columnInfo) {
	        return "";
	      }

	      return this.getNormilzedTextContent(columnInfo.text);
	    }
	  }, {
	    key: "getNormilzedTextContent",
	    value: function getNormilzedTextContent(textContent) {
	      return textContent.replace(/[\n\r\t]/g, "").trim();
	    }
	  }, {
	    key: "shouldPopin",
	    get: function get() {
	      return this._columnsInfo.filter(function (el) {
	        return el.demandPopin;
	      }).length;
	    }
	  }, {
	    key: "allColumnsPoppedIn",
	    get: function get() {
	      return this._columnsInfo.every(function (el) {
	        return el.demandPopin && !el.visible;
	      });
	    }
	  }, {
	    key: "visibleCellsCount",
	    get: function get() {
	      return this.visibleCells.length;
	    }
	  }, {
	    key: "ariaLabelText",
	    get: function get() {
	      var _this2 = this;

	      return this.cells.map(function (cell, index) {
	        var columText = _this2.getColumnTextByIdx(index);

	        var cellText = _this2.getCellText(cell);

	        return "".concat(columText, " ").concat(cellText);
	      }).join(" ");
	    }
	  }], [{
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

	  return TableRow;
	}(__chunk_1.UI5Element);

	TableRow.define();

	return TableRow;

});
//# sourceMappingURL=TableRow.js.map
