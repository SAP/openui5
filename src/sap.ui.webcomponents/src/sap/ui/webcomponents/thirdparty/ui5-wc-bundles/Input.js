sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-e3dd4c80', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-04be579f', './chunk-6d950724', './chunk-928b5964', './chunk-2e860beb', './chunk-b83f2514', './chunk-1b10f44e', './chunk-e8d699d1', './chunk-5daccaed', './chunk-fd3246cd', './chunk-124ca1de', './chunk-35c39de2', './chunk-02a372c1', './chunk-39e0e4ab', './chunk-35c756ba', './chunk-390485da', './chunk-47035d43', './chunk-81e00f35', './chunk-8b7daeae', './chunk-c52baa5e', './chunk-2ca5b205', './chunk-b4193b36', './chunk-f9a0bf68', './chunk-b051469f', './chunk-3ec67c16', './chunk-9a9fd291', './chunk-abade0ac', './chunk-04429568'], function (__chunk_1, __chunk_2, __chunk_3, __chunk_4, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_10, __chunk_11, __chunk_12, __chunk_13, __chunk_14, __chunk_15, __chunk_16, __chunk_17, __chunk_18, __chunk_19, __chunk_20, __chunk_21, __chunk_22, __chunk_24, __chunk_25, __chunk_26, __chunk_27, __chunk_28, __chunk_29, __chunk_31, __chunk_32, __chunk_33, __chunk_34, __chunk_35, __chunk_36, __chunk_37, __chunk_38) { 'use strict';

	/**
	 * A class to manage the <code>Input</code suggestion items.
	 *
	 * @class
	 * @private
	 * @author SAP SE
	 */

	var Suggestions =
	/*#__PURE__*/
	function () {
	  function Suggestions(component, slotName, highlight, handleFocus) {
	    __chunk_1._classCallCheck(this, Suggestions);

	    // The component, that the suggestion would plug into.
	    this.component = component; // Defines the items` slot name.

	    this.slotName = slotName; // Defines, if the focus will be moved via the arrow keys.

	    this.handleFocus = handleFocus; // Defines, if the suggestions should highlight.

	    this.highlight = highlight; // Press and Focus handlers

	    this.fnOnSuggestionItemPress = this.onItemPress.bind(this);
	    this.fnOnSuggestionItemFocus = this.onItemFocused.bind(this);
	    this.fnOnSuggestionItemMouseOver = this.onItemMouseOver.bind(this);
	    this.fnOnSuggestionItemMouseOut = this.onItemMouseOut.bind(this); // An integer value to store the currently selected item position,
	    // that changes due to user interaction.

	    this.selectedItemIndex = null;
	    this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    this.accInfo = {};
	  }
	  /* Public methods */


	  __chunk_1._createClass(Suggestions, [{
	    key: "defaultSlotProperties",
	    value: function defaultSlotProperties(hightlightValue) {
	      var _this = this;

	      var inputSuggestionItems = this._getComponent().suggestionItems;

	      var highlight = this.highlight && !!hightlightValue;
	      var suggestions = [];
	      inputSuggestionItems.map(function (suggestion, idx) {
	        var text = highlight ? _this.getHighlightedText(suggestion, hightlightValue) : _this.getRowText(suggestion);
	        var description = highlight ? _this.getHighlightedDesc(suggestion, hightlightValue) : _this.getRowDesc(suggestion);
	        return suggestions.push({
	          text: text,
	          description: description,
	          image: suggestion.image || undefined,
	          icon: suggestion.icon || undefined,
	          type: suggestion.type || undefined,
	          info: suggestion.info || undefined,
	          infoState: suggestion.infoState,
	          group: suggestion.group,
	          key: idx
	        });
	      });
	      return suggestions;
	    }
	  }, {
	    key: "onUp",
	    value: function onUp(event) {
	      event.preventDefault();

	      this._handleItemNavigation(false
	      /* forward */
	      );

	      return true;
	    }
	  }, {
	    key: "onDown",
	    value: function onDown(event) {
	      event.preventDefault();

	      this._handleItemNavigation(true
	      /* forward */
	      );

	      return true;
	    }
	  }, {
	    key: "onSpace",
	    value: function onSpace(event) {
	      if (this._isItemOnTarget()) {
	        event.preventDefault();
	        this.onItemSelected(null, true
	        /* keyboardUsed */
	        );
	        return true;
	      }

	      return false;
	    }
	  }, {
	    key: "onEnter",
	    value: function onEnter(event) {
	      if (this._isItemOnTarget()) {
	        this.onItemSelected(null, true
	        /* keyboardUsed */
	        );
	        return true;
	      }

	      return false;
	    }
	  }, {
	    key: "toggle",
	    value: function toggle(bToggle, _ref) {
	      var preventFocusRestore = _ref.preventFocusRestore;
	      var toggle = bToggle !== undefined ? bToggle : !this.isOpened();

	      if (toggle) {
	        this.open();
	      } else {
	        this.close(preventFocusRestore);
	      }
	    }
	  }, {
	    key: "_isScrollable",
	    value: function () {
	      var _isScrollable2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        var sc;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return this._getScrollContainer();

	              case 2:
	                sc = _context.sent;
	                return _context.abrupt("return", sc.offsetHeight < sc.scrollHeight);

	              case 4:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function _isScrollable() {
	        return _isScrollable2.apply(this, arguments);
	      }

	      return _isScrollable;
	    }()
	  }, {
	    key: "open",
	    value: function () {
	      var _open = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee2() {
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return this._respPopover();

	              case 2:
	                this.responsivePopover = _context2.sent;

	                this._beforeOpen();

	                if (this._getItems().length) {
	                  this.responsivePopover.open(this._getComponent());
	                }

	              case 5:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function open() {
	        return _open.apply(this, arguments);
	      }

	      return open;
	    }()
	  }, {
	    key: "close",
	    value: function () {
	      var _close = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee3() {
	        var preventFocusRestore,
	            _args3 = arguments;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                preventFocusRestore = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : false;
	                _context3.next = 3;
	                return this._respPopover();

	              case 3:
	                this.responsivePopover = _context3.sent;
	                this.responsivePopover.close(false, false, preventFocusRestore);

	              case 5:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function close() {
	        return _close.apply(this, arguments);
	      }

	      return close;
	    }()
	  }, {
	    key: "updateSelectedItemPosition",
	    value: function updateSelectedItemPosition(pos) {
	      this.selectedItemIndex = pos;
	    }
	    /* Interface methods */

	  }, {
	    key: "onItemFocused",
	    value: function onItemFocused() {
	      this._getComponent().onItemFocused();
	    }
	  }, {
	    key: "onItemMouseOver",
	    value: function onItemMouseOver(event) {
	      this._getComponent().onItemMouseOver(event);
	    }
	  }, {
	    key: "onItemMouseOut",
	    value: function onItemMouseOut(event) {
	      this._getComponent().onItemMouseOut(event);
	    }
	  }, {
	    key: "onItemSelected",
	    value: function onItemSelected(selectedItem, keyboardUsed) {
	      var allItems = this._getItems();

	      var item = selectedItem || allItems[this.selectedItemIndex];
	      this.selectedItemIndex = allItems.indexOf(item);
	      this.accInfo = {
	        currentPos: this.selectedItemIndex + 1,
	        listSize: allItems.length,
	        itemText: item.textContent
	      }; // If the item is "Inactive", prevent selection with SPACE or ENTER
	      // to have consistency with the way "Inactive" items behave in the ui5-list

	      if (item.type === "Inactive") {
	        return;
	      }

	      this._getComponent().onItemSelected(this._getRealItems()[this.selectedItemIndex], keyboardUsed);

	      item.selected = false;
	      this.close();
	    }
	  }, {
	    key: "onItemPreviewed",
	    value: function onItemPreviewed(item) {
	      this._getComponent().onItemPreviewed(item);
	    }
	    /* Private methods */

	  }, {
	    key: "onItemPress",
	    value: function onItemPress(oEvent) {
	      this.onItemSelected(oEvent.detail.item, false
	      /* keyboardUsed */
	      );
	    }
	  }, {
	    key: "_beforeOpen",
	    value: function _beforeOpen() {
	      this._attachItemsListeners();

	      this._attachPopupListeners();
	    }
	  }, {
	    key: "_attachItemsListeners",
	    value: function () {
	      var _attachItemsListeners2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee4() {
	        var list;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this._getList();

	              case 2:
	                list = _context4.sent;
	                list.removeEventListener("ui5-item-press", this.fnOnSuggestionItemPress);
	                list.addEventListener("ui5-item-press", this.fnOnSuggestionItemPress);
	                list.removeEventListener("ui5-item-focused", this.fnOnSuggestionItemFocus);
	                list.addEventListener("ui5-item-focused", this.fnOnSuggestionItemFocus);
	                list.removeEventListener("mouseover", this.fnOnSuggestionItemMouseOver);
	                list.addEventListener("mouseover", this.fnOnSuggestionItemMouseOver);
	                list.removeEventListener("mouseout", this.fnOnSuggestionItemMouseOut);
	                list.addEventListener("mouseout", this.fnOnSuggestionItemMouseOut);

	              case 11:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function _attachItemsListeners() {
	        return _attachItemsListeners2.apply(this, arguments);
	      }

	      return _attachItemsListeners;
	    }()
	  }, {
	    key: "_attachPopupListeners",
	    value: function _attachPopupListeners() {
	      if (!this.handleFocus) {
	        return;
	      }

	      if (!this.attachedAfterOpened) {
	        this._respPopover.addEventListener("ui5-after-open", this._onOpen.bind(this));

	        this.attachedAfterOpened = true;
	      }

	      if (!this.attachedAfterClose) {
	        this._respPopover.addEventListener("ui5-after-close", this._onClose.bind(this));

	        this.attachedAfterClose = true;
	      }
	    }
	  }, {
	    key: "_onOpen",
	    value: function _onOpen() {
	      this._applyFocus();

	      this._getComponent().onOpen();
	    }
	  }, {
	    key: "_onClose",
	    value: function _onClose() {
	      this._getComponent().onClose();
	    }
	  }, {
	    key: "_applyFocus",
	    value: function _applyFocus() {
	      if (this.selectedItemIndex) {
	        this._getItems()[this.selectedItemIndex].focus();
	      }
	    }
	  }, {
	    key: "_isItemOnTarget",
	    value: function _isItemOnTarget() {
	      return this.isOpened() && this.selectedItemIndex !== null;
	    }
	  }, {
	    key: "isOpened",
	    value: function isOpened() {
	      return !!(this.responsivePopover && this.responsivePopover.opened);
	    }
	  }, {
	    key: "_handleItemNavigation",
	    value: function _handleItemNavigation(forward) {
	      if (!this._getItems().length) {
	        return;
	      }

	      if (forward) {
	        this._selectNextItem();
	      } else {
	        this._selectPreviousItem();
	      }
	    }
	  }, {
	    key: "_selectNextItem",
	    value: function _selectNextItem() {
	      var itemsCount = this._getItems().length;

	      var previousSelectedIdx = this.selectedItemIndex;

	      if (this.selectedItemIndex === null || ++this.selectedItemIndex > itemsCount - 1) {
	        this.selectedItemIndex = 0;
	      }

	      this._moveItemSelection(previousSelectedIdx, this.selectedItemIndex);
	    }
	  }, {
	    key: "_selectPreviousItem",
	    value: function _selectPreviousItem() {
	      var itemsCount = this._getItems().length;

	      var previousSelectedIdx = this.selectedItemIndex;

	      if (this.selectedItemIndex === null || --this.selectedItemIndex < 0) {
	        this.selectedItemIndex = itemsCount - 1;
	      }

	      this._moveItemSelection(previousSelectedIdx, this.selectedItemIndex);
	    }
	  }, {
	    key: "_moveItemSelection",
	    value: function _moveItemSelection(previousIdx, nextIdx) {
	      var items = this._getItems();

	      var currentItem = items[nextIdx];
	      var previousItem = items[previousIdx];
	      this.accInfo = {
	        currentPos: nextIdx + 1,
	        listSize: items.length,
	        itemText: currentItem.textContent
	      };

	      if (previousItem) {
	        previousItem.selected = false;
	      }

	      if (currentItem) {
	        currentItem.selected = true;

	        if (this.handleFocus) {
	          currentItem.focus();
	        }
	      }

	      this.onItemPreviewed(currentItem);

	      if (!this._isItemIntoView(currentItem)) {
	        this._scrollItemIntoView(currentItem);
	      }
	    }
	  }, {
	    key: "_isItemIntoView",
	    value: function _isItemIntoView(item) {
	      var rectItem = item.getDomRef().getBoundingClientRect();

	      var rectInput = this._getComponent().getDomRef().getBoundingClientRect();

	      var windowHeight = window.innerHeight || document.documentElement.clientHeight;
	      return rectItem.top + Suggestions.SCROLL_STEP <= windowHeight && rectItem.top >= rectInput.top;
	    }
	  }, {
	    key: "_scrollItemIntoView",
	    value: function () {
	      var _scrollItemIntoView2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee5(item) {
	        var pos, scrollContainer;
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                pos = item.getDomRef().offsetTop;
	                _context5.next = 3;
	                return this._getScrollContainer();

	              case 3:
	                scrollContainer = _context5.sent;
	                scrollContainer.scrollTop = pos;

	              case 5:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5, this);
	      }));

	      function _scrollItemIntoView(_x) {
	        return _scrollItemIntoView2.apply(this, arguments);
	      }

	      return _scrollItemIntoView;
	    }()
	  }, {
	    key: "_getScrollContainer",
	    value: function () {
	      var _getScrollContainer2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee6() {
	        return regeneratorRuntime.wrap(function _callee6$(_context6) {
	          while (1) {
	            switch (_context6.prev = _context6.next) {
	              case 0:
	                if (this._scrollContainer) {
	                  _context6.next = 4;
	                  break;
	                }

	                _context6.next = 3;
	                return this._respPopover();

	              case 3:
	                this._scrollContainer = this.responsivePopover.shadowRoot.querySelector(".ui5-popup-content");

	              case 4:
	                return _context6.abrupt("return", this._scrollContainer);

	              case 5:
	              case "end":
	                return _context6.stop();
	            }
	          }
	        }, _callee6, this);
	      }));

	      function _getScrollContainer() {
	        return _getScrollContainer2.apply(this, arguments);
	      }

	      return _getScrollContainer;
	    }()
	  }, {
	    key: "_getItems",
	    value: function _getItems() {
	      return __chunk_1._toConsumableArray(this.responsivePopover.querySelector("[ui5-list]").children);
	    }
	  }, {
	    key: "_getComponent",
	    value: function _getComponent() {
	      return this.component;
	    }
	  }, {
	    key: "_getList",
	    value: function () {
	      var _getList2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee7() {
	        return regeneratorRuntime.wrap(function _callee7$(_context7) {
	          while (1) {
	            switch (_context7.prev = _context7.next) {
	              case 0:
	                _context7.next = 2;
	                return this._respPopover();

	              case 2:
	                this.responsivePopover = _context7.sent;
	                return _context7.abrupt("return", this.responsivePopover.querySelector("[ui5-list]"));

	              case 4:
	              case "end":
	                return _context7.stop();
	            }
	          }
	        }, _callee7, this);
	      }));

	      function _getList() {
	        return _getList2.apply(this, arguments);
	      }

	      return _getList;
	    }()
	  }, {
	    key: "_getListWidth",
	    value: function () {
	      var _getListWidth2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee8() {
	        var list;
	        return regeneratorRuntime.wrap(function _callee8$(_context8) {
	          while (1) {
	            switch (_context8.prev = _context8.next) {
	              case 0:
	                _context8.next = 2;
	                return this._getList();

	              case 2:
	                list = _context8.sent;
	                return _context8.abrupt("return", list.offsetWidth);

	              case 4:
	              case "end":
	                return _context8.stop();
	            }
	          }
	        }, _callee8, this);
	      }));

	      function _getListWidth() {
	        return _getListWidth2.apply(this, arguments);
	      }

	      return _getListWidth;
	    }()
	  }, {
	    key: "_getRealItems",
	    value: function _getRealItems() {
	      return this._getComponent().getSlottedNodes(this.slotName);
	    }
	  }, {
	    key: "_respPopover",
	    value: function () {
	      var _respPopover2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee9() {
	        var staticAreaItem;
	        return regeneratorRuntime.wrap(function _callee9$(_context9) {
	          while (1) {
	            switch (_context9.prev = _context9.next) {
	              case 0:
	                if (!this.responsivePopover) {
	                  _context9.next = 2;
	                  break;
	                }

	                return _context9.abrupt("return", this.responsivePopover);

	              case 2:
	                _context9.next = 4;
	                return this._getComponent().getStaticAreaItemDomRef();

	              case 4:
	                staticAreaItem = _context9.sent;
	                this.responsivePopover = staticAreaItem.querySelector("[ui5-responsive-popover]");
	                return _context9.abrupt("return", this.responsivePopover);

	              case 7:
	              case "end":
	                return _context9.stop();
	            }
	          }
	        }, _callee9, this);
	      }));

	      function _respPopover() {
	        return _respPopover2.apply(this, arguments);
	      }

	      return _respPopover;
	    }()
	  }, {
	    key: "getRowText",
	    value: function getRowText(suggestion) {
	      return this.sanitizeText(suggestion.text || suggestion.textContent);
	    }
	  }, {
	    key: "getRowDesc",
	    value: function getRowDesc(suggestion) {
	      if (suggestion.description) {
	        return this.sanitizeText(suggestion.description);
	      }
	    }
	  }, {
	    key: "getHighlightedText",
	    value: function getHighlightedText(suggestion, input) {
	      var text = suggestion.text || suggestion.textContent;
	      text = this.sanitizeText(text);
	      return this.hightlightInput(text, input);
	    }
	  }, {
	    key: "getHighlightedDesc",
	    value: function getHighlightedDesc(suggestion, input) {
	      var text = suggestion.description;
	      text = this.sanitizeText(text);
	      return this.hightlightInput(text, input);
	    }
	  }, {
	    key: "hightlightInput",
	    value: function hightlightInput(text, input) {
	      if (!text) {
	        return text;
	      }

	      var inputEscaped = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	      var regEx = new RegExp(inputEscaped, "ig");
	      return text.replace(regEx, function (match) {
	        return "<b>".concat(match, "</b>");
	      });
	    }
	  }, {
	    key: "sanitizeText",
	    value: function sanitizeText(text) {
	      return text && text.replace("<", "&lt");
	    }
	  }, {
	    key: "itemSelectionAnnounce",
	    get: function get() {
	      var i18nBundle = this.i18nBundle,
	          itemPositionText = i18nBundle.getText(__chunk_5.LIST_ITEM_POSITION, [this.accInfo.currentPos], [this.accInfo.listSize]),
	          itemSelectionText = i18nBundle.getText(__chunk_5.LIST_ITEM_SELECTED);
	      return "".concat(itemPositionText, " ").concat(this.accInfo.itemText, " ").concat(itemSelectionText);
	    }
	  }], [{
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_38.SuggestionItem, __chunk_25.ResponsivePopover, __chunk_36.List, __chunk_38.SuggestionListItem, __chunk_35.GroupHeaderListItem, __chunk_14.Button];
	    }
	  }]);

	  return Suggestions;
	}();

	Suggestions.SCROLL_STEP = 60; // Add suggestions support to the global features registry so that Input.js can use it

	__chunk_1.registerFeature("InputSuggestions", Suggestions);

	var FormSupport =
	/*#__PURE__*/
	function () {
	  function FormSupport() {
	    __chunk_1._classCallCheck(this, FormSupport);
	  }

	  __chunk_1._createClass(FormSupport, null, [{
	    key: "syncNativeHiddenInput",

	    /**
	     *
	     * @param element - the WebComponent that needs form support
	     * @param nativeInputUpdateCallback - determines how the native input's disabled and value properties are calculated
	     */
	    value: function syncNativeHiddenInput(element, nativeInputUpdateCallback) {
	      var needsNativeInput = !!element.name;
	      var nativeInput = element.querySelector("input[type=hidden][data-ui5-form-support]");

	      if (needsNativeInput && !nativeInput) {
	        nativeInput = document.createElement("input");
	        nativeInput.type = "hidden";
	        nativeInput.setAttribute("data-ui5-form-support", "");
	        nativeInput.slot = "formSupport"; // Needed for IE - otherwise input elements are not part of the real DOM tree and are not detected by forms

	        element.appendChild(nativeInput);
	      }

	      if (!needsNativeInput && nativeInput) {
	        element.removeChild(nativeInput);
	      }

	      if (needsNativeInput) {
	        nativeInput.name = element.name;
	        (nativeInputUpdateCallback || copyDefaultProperties)(element, nativeInput);
	      }
	    }
	  }, {
	    key: "syncNativeFileInput",
	    value: function syncNativeFileInput(element, nativeInputUpdateCallback, nativeInputChangeCallback) {
	      var needsNativeInput = !!element.name;
	      var nativeInput = element.querySelector("input[type=".concat(element._type || "hidden", "][data-ui5-form-support]"));

	      if (needsNativeInput && !nativeInput) {
	        nativeInput = document.createElement("input");
	        nativeInput.type = element._type;
	        nativeInput.setAttribute("data-ui5-form-support", "");
	        nativeInput.slot = "formSupport"; // Needed to visualize the input in the light dom

	        nativeInput.style.position = "absolute";
	        nativeInput.style.top = "0";
	        nativeInput.style.left = "0";
	        nativeInput.style.width = "100%";
	        nativeInput.style.height = "100%";
	        nativeInput.style.opacity = "0";

	        if (element.multiple) {
	          nativeInput.multiple = true;
	        }

	        nativeInput.addEventListener("change", nativeInputChangeCallback);
	        element.appendChild(nativeInput);
	      }

	      if (!needsNativeInput && nativeInput) {
	        element.removeChild(nativeInput);
	      }

	      if (needsNativeInput) {
	        nativeInput.name = element.name;
	        (nativeInputUpdateCallback || copyDefaultProperties)(element, nativeInput);
	      }
	    }
	  }, {
	    key: "triggerFormSubmit",
	    value: function triggerFormSubmit(element) {
	      if (!element.submits) {
	        return;
	      }

	      var currentElement = element.parentElement;

	      while (currentElement && currentElement.tagName.toLowerCase() !== "form") {
	        currentElement = currentElement.parentElement;
	      }

	      if (currentElement) {
	        currentElement.submit();
	      } else {
	        console.error("".concat(element, " is not within a form. Please add it in a form.")); // eslint-disable-line
	      }
	    }
	  }]);

	  return FormSupport;
	}();

	var copyDefaultProperties = function copyDefaultProperties(element, nativeInput) {
	  nativeInput.disabled = element.disabled;
	  nativeInput.value = element.value;
	}; // Add form support to the global features registry so that Web Components can find and use it


	__chunk_1.registerFeature("FormSupport", FormSupport);

	return __chunk_33.Input;

});
//# sourceMappingURL=Input.js.map
