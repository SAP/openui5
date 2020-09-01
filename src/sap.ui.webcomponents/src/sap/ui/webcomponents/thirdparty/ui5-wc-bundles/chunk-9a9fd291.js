sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-6d950724', './chunk-2e860beb', './chunk-5daccaed', './chunk-124ca1de', './chunk-2ca5b205'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_8, __chunk_11, __chunk_13, __chunk_17, __chunk_19, __chunk_31) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.ListSeparators.prototype
	 * @public
	 */

	var ListSeparatorsTypes = {
	  /**
	   * Separators between the items including the last and the first one.
	   * @public
	   * @type {All}
	   */
	  All: "All",

	  /**
	   * Separators between the items.
	   * <b>Note:</b> This enumeration depends on the theme.
	   * @public
	   * @type {Inner}
	   */
	  Inner: "Inner",

	  /**
	   * No item separators.
	   * @public
	   * @type {None}
	   */
	  None: "None"
	};
	/**
	 * @class
	 * Defines which separator style will be applied for the list items.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.ListSeparators
	 * @public
	 * @enum {string}
	 */

	var ListSeparators =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(ListSeparators, _DataType);

	  function ListSeparators() {
	    __chunk_1._classCallCheck(this, ListSeparators);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ListSeparators).apply(this, arguments));
	  }

	  __chunk_1._createClass(ListSeparators, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!ListSeparatorsTypes[value];
	    }
	  }]);

	  return ListSeparators;
	}(__chunk_1.DataType);

	ListSeparators.generataTypeAcessors(ListSeparatorsTypes);

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-list-busy-row\"><ui5-busyindicator ?active=\"", "\" size=\"Medium\" class=\"ui5-list-busy-ind\"></ui5-busyindicator></div>"]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<footer id=\"", "-footer\" class=\"ui5-list-footer\">", "</footer>"]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<li id=\"", "-nodata\" class=\"ui5-list-nodata\" tabindex=\"", "\" style=\"list-style-type: none;\"><div id=\"", "-nodata-text\" class=\"ui5-list-nodata-text\">", "</div></li>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<header id=\"", "\" class=\"ui5-list-header\">", "</header>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"header\" />"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-list-root\" @focusin=\"", "\" @keydown=\"", "\" @scroll=\"", "\"><!-- header -->", "", "<div id=\"", "-before\" tabindex=\"0\" class=\"ui5-list-focusarea\"></div><ul id=\"", "-listUl\" class=\"ui5-list-ul\" role=\"", "\" aria-label=\"", "\" aria-labelledby=\"", "\" aria-multiselectable=\"", "\"><slot></slot>", "</ul>", "", "<div id=\"", "-after\" tabindex=\"0\" class=\"ui5-list-focusarea\"></div></div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), context._onfocusin, context._onkeydown, context._onScroll, context.header.length ? block1(context) : undefined, context.shouldRenderH1 ? block2(context) : undefined, __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._role), __chunk_2.ifDefined(context.ariaLabelТxt), __chunk_2.ifDefined(context.ariaLabelledBy), __chunk_2.ifDefined(context.isMultiSelect), context.showNoDataText ? block3(context) : undefined, context.footerText ? block4(context) : undefined, context.showBusy ? block5(context) : undefined, __chunk_2.ifDefined(context._id));
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2());
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(context.headerID), __chunk_2.ifDefined(context.headerText));
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.noDataTabIndex), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.noDataText));
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context.footerText));
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6(), context.busy);
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var listCss = ":host(:not([hidden])){display:block;max-width:100%;width:100%}:host([inset]) .ui5-list-root{padding:2rem}:host([separators=None]) .ui5-list-nodata{border-bottom:0}.ui5-list-root{width:100%;height:100%;position:relative;box-sizing:border-box;overflow:auto}.ui5-list-ul{list-style-type:none;padding:0;margin:0}.ui5-list-ul:focus{outline:none}.ui5-list-focusarea{position:fixed}.ui5-list-header{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;box-sizing:border-box;font-size:var(--sapMFontHeader4Size);font-family:var(--sapFontFamily);color:var(--sapGroup_TitleTextColor);height:3rem;line-height:3rem;padding:0 1rem;background-color:var(--sapGroup_TitleBackground);border-bottom:1px solid var(--sapGroup_TitleBorderColor)}.ui5-list-footer{height:2rem;box-sizing:border-box;-webkit-text-size-adjust:none;font-size:var(--sapFontSize);font-family:var(--sapFontFamily);line-height:2rem;background-color:var(--sapList_FooterBackground);color:var(--ui5_list_footer_text_color);padding:0 1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-list-nodata{list-style-type:none;display:-webkit-box;display:flex;-webkit-box-align:center;align-items:center;-webkit-box-pack:center;justify-content:center;color:var(--sapTextColor);background-color:var(--sapList_Background);border-bottom:1px solid var(--sapList_BorderColor);padding:0 1rem!important;height:var(--_ui5_list_no_data_height);font-size:var(--sapFontSize)}.ui5-list-nodata-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-list-busy-row{display:flex;align-items:center;height:var(--_ui5_list_busy_row_height);justify-content:center}";

	var BUSYINDICATOR_HEIGHT = 48; // px

	var INFINITE_SCROLL_DEBOUNCE_RATE = 250; // ms

	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-list",
	  managedSlots: true,
	  slots:
	  /** @lends sap.ui.webcomponents.main.List.prototype */
	  {
	    /**
	     * Defines the <code>ui5-list</code> header.
	     * <br><br>
	     * <b>Note:</b> When <code>header</code> is set, the
	     * <code>headerText</code> property is ignored.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    header: {
	      type: HTMLElement
	    },

	    /**
	     * Defines the items of the <code>ui5-list</code>.
	     * <br><br>
	     * <b>Note:</b> Use <code>ui5-li</code>, <code>ui5-li-custom</code>, and <code>ui5-li-groupheader</code> for the intended design.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      propertyName: "items",
	      type: HTMLElement
	    }
	  },
	  properties:
	  /** @lends  sap.ui.webcomponents.main.List.prototype */
	  {
	    /**
	     * Defines the <code>ui5-list</code> header text.
	     * <br><br>
	     * <b>Note:</b> If <code>header</code> is set this property is ignored.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    headerText: {
	      type: String
	    },

	    /**
	     * Defines the footer text.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    footerText: {
	      type: String
	    },

	    /**
	     * Determines whether the list items are indented.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    inset: {
	      type: Boolean
	    },

	    /**
	     * Defines the mode of the <code>ui5-list</code>.
	     * <br><br>
	     * <b>Note:</b> Available options are <code>None</code>, <code>SingleSelect</code>, <code>SingleSelectBegin</code>,
	     * <code>SingleSelectEnd</code>, <code>MultiSelect</code>, and <code>Delete</code>.
	     *
	     * @type {ListMode}
	     * @defaultvalue "None"
	     * @public
	     */
	    mode: {
	      type: __chunk_17.ListMode,
	      defaultValue: __chunk_17.ListMode.None
	    },

	    /**
	     * Defines the text that is displayed when the <code>ui5-list</code> contains no items.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    noDataText: {
	      type: String
	    },

	    /**
	     * Defines the item separator style that is used.
	     * <br><br>
	     * <b>Notes:</b>
	     * <ul>
	     * <li>Avalaible options are <code>All</code>, <code>Inner</code>, and <code>None</code>.</li>
	     * <li>When set to <code>None</code>, none of the items are separated by horizontal lines.</li>
	     * <li>When set to <code>Inner</code>, the first item doesn't have a top separator and the last
	     * item doesn't have a bottom separator.</li>
	     * </ul>
	     *
	     * @type {ListSeparators}
	     * @defaultvalue "All"
	     * @public
	     */
	    separators: {
	      type: ListSeparators,
	      defaultValue: ListSeparators.All
	    },

	    /**
	     * Defines if the component would fire the <code>load-more</code> event
	     * when the user scrolls to the bottom of the list, and helps achieving an "infinite scroll" effect
	     * by adding new items each time.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @since 1.0.0-rc.6
	     */
	    infiniteScroll: {
	      type: Boolean
	    },

	    /**
	     * Defines if the component would display a loading indicator at the bottom of the list.
	     * It's especially useful, when combined with <code>infiniteScroll</code>.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @since 1.0.0-rc.6
	     */
	    busy: {
	      type: Boolean
	    },

	    /**
	     * @type {String}
	     * @defaultvalue ""
	     * @private
	     * @since 1.0.0-rc.8
	     */
	    ariaLabel: {
	      type: String
	    },

	    /**
	     * Receives id(or many ids) of the elements that label the input
	     *
	     * @type {String}
	     * @defaultvalue ""
	     * @private
	     * @since 1.0.0-rc.8
	     */
	    ariaLabelledby: {
	      type: String,
	      defaultValue: ""
	    },

	    /**
	     * Used to externally manipulate the role of the list
	     *
	     * @private
	     */
	    _role: {
	      type: String,
	      defaultValue: "listbox",
	      noAttribute: true
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.List.prototype */
	  {
	    /**
	     * Fired when an item is activated, unless the item's <code>type</code> property
	     * is set to <code>Inactive</code>.
	     *
	     * @event sap.ui.webcomponents.main.List#item-click
	     * @param {HTMLElement} item the clicked item.
	     * @public
	     */
	    "item-click": {
	      detail: {
	        item: {
	          type: HTMLElement
	        }
	      }
	    },

	    /**
	     * Fired when the <code>Close</code> button of any item is clicked
	     * <br><br>
	     * <b>Note:</b> This event is applicable to <code>ui5-li-notification</code> items only,
	     * not to be confused with <code>item-delete</code>.
	     *
	     * @event sap.ui.webcomponents.main.List#item-close
	     * @param {HTMLElement} item the item about to be closed.
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    "item-close": {
	      detail: {
	        item: {
	          type: HTMLElement
	        }
	      }
	    },

	    /**
	     * Fired when the <code>Toggle</code> button of any item is clicked.
	     * <br><br>
	     * <b>Note:</b> This event is applicable to <code>ui5-li-notification-group</code> items only.
	     *
	     * @event sap.ui.webcomponents.main.List#item-toggle
	     * @param {HTMLElement} item the toggled item.
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    "item-toggle": {
	      detail: {
	        item: {
	          type: HTMLElement
	        }
	      }
	    },

	    /**
	     * Fired when the Delete button of any item is pressed.
	     * <br><br>
	     * <b>Note:</b> A Delete button is displayed on each item,
	     * when the <code>ui5-list</code> <code>mode</code> property is set to <code>Delete</code>.
	     *
	     * @event sap.ui.webcomponents.main.List#item-delete
	     * @param {HTMLElement} item the deleted item.
	     * @public
	     */
	    "item-delete": {
	      detail: {
	        item: {
	          type: HTMLElement
	        }
	      }
	    },

	    /**
	     * Fired when selection is changed by user interaction
	     * in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code> modes.
	     *
	     * @event sap.ui.webcomponents.main.List#selection-change
	     * @param {Array} selectedItems An array of the selected items.
	     * @param {Array} previouslySelectedItems An array of the previously selected items.
	     * @public
	     */
	    "selection-change": {
	      detail: {
	        selectedItems: {
	          type: Array
	        },
	        previouslySelectedItems: {
	          type: Array
	        },
	        selectionComponentPressed: {
	          type: Boolean
	        } // protected, indicates if the user used the selection components to change the selection

	      }
	    },

	    /**
	     * Fired when the user scrolls to the bottom of the list.
	     * <br><br>
	     * <b>Note:</b> The event is fired when the <code>infiniteScroll</code> property is enabled.
	     *
	     * @event sap.ui.webcomponents.main.List#load-more
	     * @public
	     * @since 1.0.0-rc.6
	     */
	    "load-more": {}
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-list</code> component allows displaying a list of items, advanced keyboard
	 * handling support for navigating between items, and predefined modes to improve the development efficiency.
	 * <br><br>
	 * The <code>ui5-list</code> is а container for the available list items:
	 * <ul>
	 * <li><code>ui5-li</code></li>
	 * <li><code>ui5-li-custom</code></li>
	 * <li><code>ui5-li-group-header</code></li>
	 * </ul>
	 * <br><br>
	 * To benefit from the built-in selection mechanism, you can use the available
	 * selection modes, such as
	 * <code>SingleSelect</code>, <code>MultiSelect</code> and <code>Delete</code>.
	 * <br><br>
	 * Additionally, the <code>ui5-list</code> provides header, footer, and customization for the list item separators.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/List.js";</code>
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/StandardListItem.js";</code> (for <code>ui5-li</code>)
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/CustomListItem.js";</code> (for <code>ui5-li-custom</code>)
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/GroupHeaderListItem.js";</code> (for <code>ui5-li-group-header</code>)
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.List
	 * @extends UI5Element
	 * @tagname ui5-list
	 * @appenddocs StandardListItem CustomListItem GroupHeaderListItem
	 * @public
	 */

	var List =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(List, _UI5Element);

	  __chunk_1._createClass(List, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
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
	  }, {
	    key: "styles",
	    get: function get() {
	      return listCss;
	    }
	  }]);

	  function List() {
	    var _this;

	    __chunk_1._classCallCheck(this, List);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(List).call(this));

	    _this.initItemNavigation(); // Stores the last focused item within the internal ul element.


	    _this._previouslyFocusedItem = null; // Indicates that the List is forwarding the focus before or after the internal ul.

	    _this._forwardingFocus = false;
	    _this._previouslySelectedItem = null;

	    _this.addEventListener("ui5-_press", _this.onItemPress.bind(__chunk_1._assertThisInitialized(_this)));

	    _this.addEventListener("ui5-close", _this.onItemClose.bind(__chunk_1._assertThisInitialized(_this)));

	    _this.addEventListener("ui5-toggle", _this.onItemToggle.bind(__chunk_1._assertThisInitialized(_this)));

	    _this.addEventListener("ui5-_focused", _this.onItemFocused.bind(__chunk_1._assertThisInitialized(_this)));

	    _this.addEventListener("ui5-_forward-after", _this.onForwardAfter.bind(__chunk_1._assertThisInitialized(_this)));

	    _this.addEventListener("ui5-_forward-before", _this.onForwardBefore.bind(__chunk_1._assertThisInitialized(_this)));

	    _this.addEventListener("ui5-_selection-requested", _this.onSelectionRequested.bind(__chunk_1._assertThisInitialized(_this)));

	    _this.addEventListener("ui5-_focus-requested", _this.focusUploadCollectionItem.bind(__chunk_1._assertThisInitialized(_this)));

	    return _this;
	  }

	  __chunk_1._createClass(List, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      this.prepareListItems();
	    }
	  }, {
	    key: "initItemNavigation",
	    value: function initItemNavigation() {
	      var _this2 = this;

	      this._itemNavigation = new __chunk_31.ItemNavigation(this, {
	        navigationMode: __chunk_31.NavigationMode.Vertical
	      });

	      this._itemNavigation.getItemsCallback = function () {
	        return _this2.getSlottedNodes("items");
	      };
	    }
	  }, {
	    key: "prepareListItems",
	    value: function prepareListItems() {
	      var _this3 = this;

	      var slottedItems = this.getSlottedNodes("items");
	      slottedItems.forEach(function (item, key) {
	        var isLastChild = key === slottedItems.length - 1;
	        var showBottomBorder = _this3.separators === ListSeparators.All || _this3.separators === ListSeparators.Inner && !isLastChild;
	        item._mode = _this3.mode;
	        item.hasBorder = showBottomBorder;
	      });
	      this._previouslySelectedItem = null;
	    }
	    /*
	    * ITEM SELECTION BASED ON THE CURRENT MODE
	    */

	  }, {
	    key: "onSelectionRequested",
	    value: function onSelectionRequested(event) {
	      var previouslySelectedItems = this.getSelectedItems();
	      var selectionChange = false;
	      this._selectionRequested = true;

	      if (this["handle".concat(this.mode)]) {
	        selectionChange = this["handle".concat(this.mode)](event.detail.item, event.detail.selected);
	      }

	      if (selectionChange) {
	        this.fireEvent("selection-change", {
	          selectedItems: this.getSelectedItems(),
	          previouslySelectedItems: previouslySelectedItems,
	          selectionComponentPressed: event.detail.selectionComponentPressed,
	          key: event.detail.key
	        });
	      }
	    }
	  }, {
	    key: "handleSingleSelect",
	    value: function handleSingleSelect(item) {
	      if (item.selected) {
	        return false;
	      }

	      this.deselectSelectedItems();
	      item.selected = true;
	      return true;
	    }
	  }, {
	    key: "handleSingleSelectBegin",
	    value: function handleSingleSelectBegin(item) {
	      return this.handleSingleSelect(item);
	    }
	  }, {
	    key: "handleSingleSelectEnd",
	    value: function handleSingleSelectEnd(item) {
	      return this.handleSingleSelect(item);
	    }
	  }, {
	    key: "handleSingleSelectAuto",
	    value: function handleSingleSelectAuto(item) {
	      return this.handleSingleSelect(item);
	    }
	  }, {
	    key: "handleMultiSelect",
	    value: function handleMultiSelect(item, selected) {
	      item.selected = selected;
	      return true;
	    }
	  }, {
	    key: "handleDelete",
	    value: function handleDelete(item) {
	      this.fireEvent("item-delete", {
	        item: item
	      });
	    }
	  }, {
	    key: "deselectSelectedItems",
	    value: function deselectSelectedItems() {
	      this.getSelectedItems().forEach(function (item) {
	        item.selected = false;
	      });
	    }
	  }, {
	    key: "getSelectedItems",
	    value: function getSelectedItems() {
	      return this.getSlottedNodes("items").filter(function (item) {
	        return item.selected;
	      });
	    }
	  }, {
	    key: "getFirstSelectedItem",
	    value: function getFirstSelectedItem() {
	      var slottedItems = this.getSlottedNodes("items");
	      var firstSelectedItem = null;

	      for (var i = 0; i < slottedItems.length; i++) {
	        if (slottedItems[i].selected) {
	          firstSelectedItem = slottedItems[i];
	          break;
	        }
	      }

	      return firstSelectedItem;
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isTabNext(event)) {
	        this._handleTabNext(event);
	      }
	    }
	    /*
	    * KEYBOARD SUPPORT
	    */

	  }, {
	    key: "_handleTabNext",
	    value: function _handleTabNext(event) {
	      // If forward navigation is performed, we check if the List has headerToolbar.
	      // If yes - we check if the target is at the last tabbable element of the headerToolbar
	      // to forward correctly the focus to the selected, previously focused or to the first list item.
	      var lastTabbableEl;
	      var target = this.getNormalizedTarget(event.target);

	      if (this.headerToolbar) {
	        lastTabbableEl = this.getHeaderToolbarLastTabbableElement();
	      }

	      if (!lastTabbableEl) {
	        return;
	      }

	      if (lastTabbableEl === target) {
	        if (this.getFirstSelectedItem()) {
	          this.focusFirstSelectedItem();
	        } else if (this.getPreviouslyFocusedItem()) {
	          this.focusPreviouslyFocusedItem();
	        } else {
	          this.focusFirstItem();
	        }

	        event.stopImmediatePropagation();
	        event.preventDefault();
	      }
	    }
	  }, {
	    key: "_onScroll",
	    value: function _onScroll(event) {
	      if (!this.infiniteScroll) {
	        return;
	      }

	      this.debounce(this.loadMore.bind(this, event.target), INFINITE_SCROLL_DEBOUNCE_RATE);
	    }
	  }, {
	    key: "_onfocusin",
	    value: function _onfocusin(event) {
	      // If the focusin event does not origin from one of the 'triggers' - ignore it.
	      if (!this.isForwardElement(this.getNormalizedTarget(event.target))) {
	        event.stopImmediatePropagation();
	        return;
	      } // The focus arrives in the List for the first time.
	      // If there is selected item - focus it or focus the first item.


	      if (!this.getPreviouslyFocusedItem()) {
	        if (this.getFirstSelectedItem()) {
	          this.focusFirstSelectedItem();
	        } else {
	          this.focusFirstItem();
	        }

	        event.stopImmediatePropagation();
	        return;
	      } // The focus returns to the List,
	      // focus the first selected item or the previously focused element.


	      if (!this.getForwardingFocus()) {
	        if (this.getFirstSelectedItem()) {
	          this.focusFirstSelectedItem();
	        } else {
	          this.focusPreviouslyFocusedItem();
	        }
	      }

	      this.setForwardingFocus(false);
	    }
	  }, {
	    key: "isForwardElement",
	    value: function isForwardElement(node) {
	      var nodeId = node.id;

	      if (this._id === nodeId || this.getBeforeElement().id === nodeId) {
	        return true;
	      }

	      return this.getAfterElement().id === nodeId;
	    }
	  }, {
	    key: "onItemFocused",
	    value: function onItemFocused(event) {
	      var target = event.target;

	      this._itemNavigation.update(target);

	      this.fireEvent("item-focused", {
	        item: target
	      });

	      if (this.mode === __chunk_17.ListMode.SingleSelectAuto) {
	        this.onSelectionRequested({
	          detail: {
	            item: target,
	            selectionComponentPressed: false,
	            selected: true,
	            key: event.detail.key
	          }
	        });
	      }
	    }
	  }, {
	    key: "onItemPress",
	    value: function onItemPress(event) {
	      var pressedItem = event.detail.item;

	      if (!this._selectionRequested && this.mode !== __chunk_17.ListMode.Delete) {
	        this._selectionRequested = true;
	        this.onSelectionRequested({
	          detail: {
	            item: pressedItem,
	            selectionComponentPressed: false,
	            selected: !pressedItem.selected,
	            key: event.detail.key
	          }
	        });
	      }

	      this.fireEvent("item-press", {
	        item: pressedItem
	      });
	      this.fireEvent("item-click", {
	        item: pressedItem
	      });
	      this._selectionRequested = false;
	    } // This is applicable to NoficationListItem

	  }, {
	    key: "onItemClose",
	    value: function onItemClose(event) {
	      this.fireEvent("item-close", {
	        item: event.detail.item
	      });
	    }
	  }, {
	    key: "onItemToggle",
	    value: function onItemToggle(event) {
	      this.fireEvent("item-toggle", {
	        item: event.detail.item
	      });
	    }
	  }, {
	    key: "onForwardBefore",
	    value: function onForwardBefore(event) {
	      this.setPreviouslyFocusedItem(event.target);
	      this.focusBeforeElement();
	    }
	  }, {
	    key: "onForwardAfter",
	    value: function onForwardAfter(event) {
	      this.setPreviouslyFocusedItem(event.target);
	      this.focusAfterElement();
	    }
	  }, {
	    key: "focusBeforeElement",
	    value: function focusBeforeElement() {
	      this.setForwardingFocus(true);
	      this.getBeforeElement().focus();
	    }
	  }, {
	    key: "focusAfterElement",
	    value: function focusAfterElement() {
	      this.setForwardingFocus(true);
	      this.getAfterElement().focus();
	    }
	  }, {
	    key: "focusFirstItem",
	    value: function focusFirstItem() {
	      var firstItem = this.getFirstItem();

	      if (firstItem) {
	        firstItem.focus();
	      }
	    }
	  }, {
	    key: "focusPreviouslyFocusedItem",
	    value: function focusPreviouslyFocusedItem() {
	      var previouslyFocusedItem = this.getPreviouslyFocusedItem();

	      if (previouslyFocusedItem) {
	        previouslyFocusedItem.focus();
	      }
	    }
	  }, {
	    key: "focusFirstSelectedItem",
	    value: function focusFirstSelectedItem() {
	      var firstSelectedItem = this.getFirstSelectedItem();

	      if (firstSelectedItem) {
	        firstSelectedItem.focus();
	      }
	    }
	  }, {
	    key: "focusItem",
	    value: function focusItem(item) {
	      item.focus();
	    }
	  }, {
	    key: "focusUploadCollectionItem",
	    value: function focusUploadCollectionItem(event) {
	      var _this4 = this;

	      setTimeout(function () {
	        _this4.setPreviouslyFocusedItem(event.target);

	        _this4.focusPreviouslyFocusedItem();
	      }, 0);
	    }
	  }, {
	    key: "setForwardingFocus",
	    value: function setForwardingFocus(forwardingFocus) {
	      this._forwardingFocus = forwardingFocus;
	    }
	  }, {
	    key: "getForwardingFocus",
	    value: function getForwardingFocus() {
	      return this._forwardingFocus;
	    }
	  }, {
	    key: "setPreviouslyFocusedItem",
	    value: function setPreviouslyFocusedItem(item) {
	      this._previouslyFocusedItem = item;
	    }
	  }, {
	    key: "getPreviouslyFocusedItem",
	    value: function getPreviouslyFocusedItem() {
	      return this._previouslyFocusedItem;
	    }
	  }, {
	    key: "getFirstItem",
	    value: function getFirstItem() {
	      var slottedItems = this.getSlottedNodes("items");
	      return !!slottedItems.length && slottedItems[0];
	    }
	  }, {
	    key: "getAfterElement",
	    value: function getAfterElement() {
	      if (!this._afterElement) {
	        this._afterElement = this.shadowRoot.querySelector("#".concat(this._id, "-after"));
	      }

	      return this._afterElement;
	    }
	  }, {
	    key: "getBeforeElement",
	    value: function getBeforeElement() {
	      if (!this._beforeElement) {
	        this._beforeElement = this.shadowRoot.querySelector("#".concat(this._id, "-before"));
	      }

	      return this._beforeElement;
	    }
	  }, {
	    key: "getHeaderToolbarLastTabbableElement",
	    value: function getHeaderToolbarLastTabbableElement() {
	      return __chunk_19.getLastTabbableElement(this.headerToolbar.getDomRef()) || this.headerToolbar.getDomRef();
	    }
	  }, {
	    key: "getNormalizedTarget",
	    value: function getNormalizedTarget(target) {
	      var focused = target;

	      if (target.shadowRoot && target.shadowRoot.activeElement) {
	        focused = target.shadowRoot.activeElement;
	      }

	      return focused;
	    }
	  }, {
	    key: "loadMore",
	    value: function loadMore(el) {
	      var scrollTop = el.scrollTop;
	      var height = el.offsetHeight;
	      var scrollHeight = el.scrollHeight;

	      if (this.previousScrollPosition > scrollTop) {
	        // skip scrolling upwards
	        this.previousScrollPosition = scrollTop;
	        return;
	      }

	      this.previousScrollPosition = scrollTop;

	      if (scrollHeight - BUSYINDICATOR_HEIGHT <= height + scrollTop) {
	        this.fireEvent("load-more");
	      }
	    }
	  }, {
	    key: "debounce",
	    value: function debounce(fn, delay) {
	      var _this5 = this;

	      clearTimeout(this.debounceInterval);
	      this.debounceInterval = setTimeout(function () {
	        _this5.debounceInterval = null;
	        fn();
	      }, delay);
	    }
	  }, {
	    key: "shouldRenderH1",
	    get: function get() {
	      return !this.header.length && this.headerText;
	    }
	  }, {
	    key: "headerID",
	    get: function get() {
	      return "".concat(this._id, "-header");
	    }
	  }, {
	    key: "showNoDataText",
	    get: function get() {
	      return this.items.length === 0 && this.noDataText;
	    }
	  }, {
	    key: "showBusy",
	    get: function get() {
	      return this.busy || this.infiniteScroll;
	    }
	  }, {
	    key: "isMultiSelect",
	    get: function get() {
	      return this.mode === __chunk_17.ListMode.MultiSelect;
	    }
	  }, {
	    key: "ariaLabelledBy",
	    get: function get() {
	      if (this.ariaLabelledby || this.ariaLabel) {
	        return undefined;
	      }

	      return this.shouldRenderH1 ? this.headerID : undefined;
	    }
	  }, {
	    key: "ariaLabel\u0422xt",
	    get: function get() {
	      return __chunk_13.getEffectiveAriaLabelText(this);
	    }
	  }], [{
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_11.BusyIndicator];
	    }
	  }]);

	  return List;
	}(__chunk_1.UI5Element);

	List.define();

	exports.List = List;

});
//# sourceMappingURL=chunk-9a9fd291.js.map
