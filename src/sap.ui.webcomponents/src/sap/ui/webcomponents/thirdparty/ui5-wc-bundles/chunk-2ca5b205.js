sap.ui.define(['exports', './chunk-7ceb84db', './chunk-57e79e7c'], function (exports, __chunk_1, __chunk_8) { 'use strict';

	var NavigationMode = {
	  Auto: "Auto",
	  Vertical: "Vertical",
	  Horizontal: "Horizontal",
	  Paging: "Paging"
	};

	/**
	 * @private
	 * Different behavior for ItemNavigation.
	 */
	var ItemNavigationBehavior = {
	  /**
	  * Static behavior: when border of the items is reached, you can't go out of the cage.
	  	*/
	  Static: "Static",

	  /**
	  * Cycling behavior: when border of the items is reached, you can cycle through the items.
	  	*/
	  Cyclic: "Cyclic",

	  /**
	  * Paging behavior: when border of the items is reached, tou can go up/down based on the rowsize(e.g. DayPicker)
	  	*/
	  Paging: "Paging"
	};

	var ItemNavigation =
	/*#__PURE__*/
	function (_EventProvider) {
	  __chunk_1._inherits(ItemNavigation, _EventProvider);

	  function ItemNavigation(rootWebComponent) {
	    var _this;

	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    __chunk_1._classCallCheck(this, ItemNavigation);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ItemNavigation).call(this));
	    _this.currentIndex = options.currentIndex || 0;
	    _this.rowSize = options.rowSize || 1;
	    _this.behavior = options.behavior || ItemNavigationBehavior.Static;
	    _this.hasNextPage = true; // used in Paging mode and controlled from the rootWebComponent

	    _this.hasPrevPage = true; // used in Paging mode and controlled from the rootWebComponent

	    var navigationMode = options.navigationMode;
	    var autoNavigation = !navigationMode || navigationMode === NavigationMode.Auto;
	    _this.horizontalNavigationOn = autoNavigation || navigationMode === NavigationMode.Horizontal;
	    _this.verticalNavigationOn = autoNavigation || navigationMode === NavigationMode.Vertical;
	    _this.pageSize = options.pageSize;
	    _this.rootWebComponent = rootWebComponent;

	    _this.rootWebComponent.addEventListener("keydown", _this.onkeydown.bind(__chunk_1._assertThisInitialized(_this)));

	    _this.rootWebComponent._onComponentStateFinalized = function () {
	      _this._init();
	    };

	    return _this;
	  }

	  __chunk_1._createClass(ItemNavigation, [{
	    key: "_init",
	    value: function _init() {
	      var _this2 = this;

	      this._getItems().forEach(function (item, idx) {
	        item._tabIndex = idx === _this2.currentIndex ? "0" : "-1";
	      });
	    }
	  }, {
	    key: "_horizontalNavigationOn",
	    value: function _horizontalNavigationOn() {
	      return this.horizontalNavigationOn;
	    }
	  }, {
	    key: "_verticalNavigationOn",
	    value: function _verticalNavigationOn() {
	      return this.verticalNavigationOn;
	    }
	  }, {
	    key: "_onKeyPress",
	    value: function () {
	      var _onKeyPress2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee(event) {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                if (this.currentIndex >= this._getItems().length) {
	                  this.onOverflowBottomEdge();
	                } else if (this.currentIndex < 0) {
	                  this.onOverflowTopEdge();
	                }

	                event.preventDefault();
	                _context.next = 4;
	                return __chunk_1.RenderScheduler.whenFinished();

	              case 4:
	                this.update();
	                this.focusCurrent();

	              case 6:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function _onKeyPress(_x) {
	        return _onKeyPress2.apply(this, arguments);
	      }

	      return _onKeyPress;
	    }()
	  }, {
	    key: "onkeydown",
	    value: function onkeydown(event) {
	      if (__chunk_8.isUp(event) && this._verticalNavigationOn()) {
	        return this._handleUp(event);
	      }

	      if (__chunk_8.isDown(event) && this._verticalNavigationOn()) {
	        return this._handleDown(event);
	      }

	      if (__chunk_8.isLeft(event) && this._horizontalNavigationOn()) {
	        return this._handleLeft(event);
	      }

	      if (__chunk_8.isRight(event) && this._horizontalNavigationOn()) {
	        return this._handleRight(event);
	      }

	      if (__chunk_8.isHome(event)) {
	        return this._handleHome(event);
	      }

	      if (__chunk_8.isEnd(event)) {
	        return this._handleEnd(event);
	      }
	    }
	  }, {
	    key: "_handleUp",
	    value: function _handleUp(event) {
	      if (this._canNavigate()) {
	        this.currentIndex -= this.rowSize;

	        this._onKeyPress(event);
	      }
	    }
	  }, {
	    key: "_handleDown",
	    value: function _handleDown(event) {
	      if (this._canNavigate()) {
	        this.currentIndex += this.rowSize;

	        this._onKeyPress(event);
	      }
	    }
	  }, {
	    key: "_handleLeft",
	    value: function _handleLeft(event) {
	      if (this._canNavigate()) {
	        this.currentIndex -= 1;

	        this._onKeyPress(event);
	      }
	    }
	  }, {
	    key: "_handleRight",
	    value: function _handleRight(event) {
	      if (this._canNavigate()) {
	        this.currentIndex += 1;

	        this._onKeyPress(event);
	      }
	    }
	  }, {
	    key: "_handleHome",
	    value: function _handleHome(event) {
	      if (this._canNavigate()) {
	        var homeEndRange = this.rowSize > 1 ? this.rowSize : this._getItems().length;
	        this.currentIndex -= this.currentIndex % homeEndRange;

	        this._onKeyPress(event);
	      }
	    }
	  }, {
	    key: "_handleEnd",
	    value: function _handleEnd(event) {
	      if (this._canNavigate()) {
	        var homeEndRange = this.rowSize > 1 ? this.rowSize : this._getItems().length;
	        this.currentIndex += homeEndRange - 1 - this.currentIndex % homeEndRange; // eslint-disable-line

	        this._onKeyPress(event);
	      }
	    }
	  }, {
	    key: "update",
	    value: function update(current) {
	      var origItems = this._getItems();

	      if (current) {
	        this.currentIndex = this._getItems().indexOf(current);
	      }

	      if (!origItems[this.currentIndex] || origItems[this.currentIndex]._tabIndex && origItems[this.currentIndex]._tabIndex === "0") {
	        return;
	      }

	      var items = origItems.slice(0);

	      for (var i = 0; i < items.length; i++) {
	        items[i]._tabIndex = i === this.currentIndex ? "0" : "-1";
	      }

	      this.rootWebComponent._invalidate();
	    }
	  }, {
	    key: "focusCurrent",
	    value: function focusCurrent() {
	      var currentItem = this._getCurrentItem();

	      if (currentItem) {
	        currentItem.focus();
	      }
	    }
	  }, {
	    key: "_canNavigate",
	    value: function _canNavigate() {
	      var currentItem = this._getCurrentItem();

	      var activeElement = document.activeElement;

	      while (activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
	        activeElement = activeElement.shadowRoot.activeElement;
	      }

	      return currentItem && currentItem === activeElement;
	    }
	  }, {
	    key: "_getCurrentItem",
	    value: function _getCurrentItem() {
	      var items = this._getItems();

	      if (!items.length) {
	        return null;
	      } // normalize the index


	      while (this.currentIndex >= items.length) {
	        this.currentIndex -= this.rowSize;
	      }

	      if (this.currentIndex < 0) {
	        this.currentIndex = 0;
	      }

	      var currentItem = items[this.currentIndex];

	      if (!currentItem) {
	        return;
	      }

	      if (currentItem.isUI5Element) {
	        return currentItem.getFocusDomRef();
	      }

	      if (!this.rootWebComponent.getDomRef()) {
	        return;
	      }

	      return this.rootWebComponent.getDomRef().querySelector("#".concat(currentItem.id));
	    }
	  }, {
	    key: "onOverflowBottomEdge",
	    value: function onOverflowBottomEdge() {
	      var items = this._getItems();

	      var offset = this.currentIndex - items.length;

	      if (this.behavior === ItemNavigationBehavior.Cyclic) {
	        this.currentIndex = 0;
	        return;
	      }

	      if (this.behavior === ItemNavigationBehavior.Paging) {
	        this._handleNextPage();
	      } else {
	        this.currentIndex = items.length - 1;
	      }

	      this.fireEvent(ItemNavigation.BORDER_REACH, {
	        start: false,
	        end: true,
	        offset: offset
	      });
	    }
	  }, {
	    key: "onOverflowTopEdge",
	    value: function onOverflowTopEdge() {
	      var items = this._getItems();

	      var offset = this.currentIndex + this.rowSize;

	      if (this.behavior === ItemNavigationBehavior.Cyclic) {
	        this.currentIndex = items.length - 1;
	        return;
	      }

	      if (this.behavior === ItemNavigationBehavior.Paging) {
	        this._handlePrevPage();
	      } else {
	        this.currentIndex = 0;
	      }

	      this.fireEvent(ItemNavigation.BORDER_REACH, {
	        start: true,
	        end: false,
	        offset: offset
	      });
	    }
	  }, {
	    key: "_handleNextPage",
	    value: function _handleNextPage() {
	      this.fireEvent(ItemNavigation.PAGE_BOTTOM);

	      var items = this._getItems();

	      if (!this.hasNextPage) {
	        this.currentIndex = items.length - 1;
	      } else {
	        this.currentIndex -= this.pageSize;
	      }
	    }
	  }, {
	    key: "_handlePrevPage",
	    value: function _handlePrevPage() {
	      this.fireEvent(ItemNavigation.PAGE_TOP);

	      if (!this.hasPrevPage) {
	        this.currentIndex = 0;
	      } else {
	        this.currentIndex = this.pageSize + this.currentIndex;
	      }
	    }
	  }, {
	    key: "getItemsCallback",
	    set: function set(fn) {
	      this._getItems = fn;
	    }
	  }, {
	    key: "current",
	    set: function set(val) {
	      this.currentIndex = val;
	    }
	  }]);

	  return ItemNavigation;
	}(__chunk_1.EventProvider);

	ItemNavigation.PAGE_TOP = "PageTop";
	ItemNavigation.PAGE_BOTTOM = "PageBottom";
	ItemNavigation.BORDER_REACH = "_borderReach";

	exports.ItemNavigation = ItemNavigation;
	exports.ItemNavigationBehavior = ItemNavigationBehavior;
	exports.NavigationMode = NavigationMode;

});
//# sourceMappingURL=chunk-2ca5b205.js.map
