sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-04be579f', './chunk-b83f2514', './chunk-390485da', './chunk-7e1c675d', './chunk-2ca5b205', './chunk-b4193b36', './chunk-9a9fd291', './chunk-a1b7ce0b', './chunk-eb92f29a'], function (exports, __chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_10, __chunk_14, __chunk_25, __chunk_30, __chunk_31, __chunk_32, __chunk_36, __chunk_40, __chunk_43) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.TabLayout.prototype
	 * @public
	 */

	var TabLayouts = {
	  /**
	   * Inline type, the tab <code>main text</code> and <code>additionalText</code> are displayed horizotally.
	   * @public
	   * @type {Inline}
	   */
	  Inline: "Inline",

	  /**
	   * Standard type, the tab <code>main text</code> and <code>additionalText</code> are displayed vertically.
	   * @public
	   * @type {Standard}
	   */
	  Standard: "Standard"
	};
	/**
	 * @class
	 * Different types of Tab layouts.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.TabLayout
	 * @public
	 * @enum {string}
	 */

	var TabLayout =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(TabLayout, _DataType);

	  function TabLayout() {
	    __chunk_1._classCallCheck(this, TabLayout);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TabLayout).apply(this, arguments));
	  }

	  __chunk_1._createClass(TabLayout, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!TabLayouts[value];
	    }
	  }]);

	  return TabLayout;
	}(__chunk_1.DataType);

	TabLayout.generataTypeAcessors(TabLayouts);

	var scroll = (function (_ref) {
	  var _ref$element = _ref.element,
	      element = _ref$element === void 0 ? __chunk_40.animationConfig.element : _ref$element,
	      _ref$duration = _ref.duration,
	      duration = _ref$duration === void 0 ? __chunk_40.animationConfig.duration : _ref$duration,
	      _ref$progress = _ref.progress,
	      progressCallback = _ref$progress === void 0 ? __chunk_40.animationConfig.identity : _ref$progress,
	      _ref$dx = _ref.dx,
	      dx = _ref$dx === void 0 ? 0 : _ref$dx,
	      _ref$dy = _ref.dy,
	      dy = _ref$dy === void 0 ? 0 : _ref$dy;
	  var scrollLeft;
	  var scrollTop;
	  return __chunk_40.animate({
	    beforeStart: function beforeStart() {
	      scrollLeft = element.scrollLeft;
	      scrollTop = element.scrollTop;
	    },
	    duration: duration,
	    element: element,
	    progress: function progress(_progress) {
	      progressCallback(_progress);
	      element.scrollLeft = scrollLeft + _progress * dx; // easing - linear

	      element.scrollTop = scrollTop + _progress * dy; // easing - linear
	    }
	  });
	});

	var scrollEventName = "scroll";
	var touchEndEventName = __chunk_10.isPhone() ? "touchend" : "mouseup";

	var ScrollEnablement =
	/*#__PURE__*/
	function (_EventProvider) {
	  __chunk_1._inherits(ScrollEnablement, _EventProvider);

	  function ScrollEnablement(containerComponent) {
	    var _this;

	    __chunk_1._classCallCheck(this, ScrollEnablement);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(ScrollEnablement).call(this));
	    _this.containerComponent = containerComponent;
	    _this.mouseMove = _this.ontouchmove.bind(__chunk_1._assertThisInitialized(_this));
	    _this.mouseUp = _this.ontouchend.bind(__chunk_1._assertThisInitialized(_this));
	    _this.touchStart = _this.ontouchstart.bind(__chunk_1._assertThisInitialized(_this));
	    _this.isPhone = __chunk_10.isPhone(); // On Android devices touchmove is thrown one more time than neccessary (together with touchend)
	    // so we have to cache the previus coordinates in order to provide correct parameters in the
	    // event for Android

	    _this.cachedValue = {}; // In components like Carousel you need to know if the user has clicked on something or swiped
	    // in order to throw the needed event or not

	    _this.startX = 0;
	    _this.startY = 0;

	    if (_this.isPhone) {
	      containerComponent.addEventListener("touchstart", _this.touchStart, {
	        passive: true
	      });
	      containerComponent.addEventListener("touchmove", _this.mouseMove, {
	        passive: true
	      });
	      containerComponent.addEventListener("touchend", _this.mouseUp, {
	        passive: true
	      });
	    } else {
	      containerComponent.addEventListener("mousedown", _this.touchStart, {
	        passive: true
	      });
	    }

	    return _this;
	  }

	  __chunk_1._createClass(ScrollEnablement, [{
	    key: "scrollTo",
	    value: function scrollTo(left, top) {
	      this._container.scrollLeft = left;
	      this._container.scrollTop = top;
	    }
	  }, {
	    key: "move",
	    value: function move(dx, dy) {
	      return scroll({
	        element: this._container,
	        dx: dx,
	        dy: dy
	      });
	    }
	  }, {
	    key: "getScrollLeft",
	    value: function getScrollLeft() {
	      return this._container.scrollLeft;
	    }
	  }, {
	    key: "getScrollTop",
	    value: function getScrollTop() {
	      return this._container.scrollTop;
	    }
	  }, {
	    key: "_isTouchInside",
	    value: function _isTouchInside(touch) {
	      var rect = this._container.getBoundingClientRect();

	      var x = this.isPhone ? touch.clientX : touch.x;
	      var y = this.isPhone ? touch.clientY : touch.y;
	      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
	    }
	  }, {
	    key: "ontouchstart",
	    value: function ontouchstart(event) {
	      var touch = this.isPhone ? event.touches[0] : null;

	      if (!this.isPhone) {
	        document.addEventListener("mouseup", this.mouseUp, {
	          passive: true
	        });
	        document.addEventListener("mousemove", this.mouseMove, {
	          passive: true
	        });
	      } else {
	        // Needed only on mobile
	        this.startX = touch.pageX;
	        this.startY = touch.pageY;
	      }

	      this._prevDragX = this.isPhone ? touch.pageX : event.x;
	      this._prevDragY = this.isPhone ? touch.pageY : event.y;
	      this._canScroll = this._isTouchInside(this.isPhone ? touch : event);
	    }
	  }, {
	    key: "ontouchmove",
	    value: function ontouchmove(event) {
	      if (!this._canScroll) {
	        return;
	      }

	      var container = this._container;
	      var touch = this.isPhone ? event.touches[0] : null;
	      var dragX = this.isPhone ? touch.pageX : event.x;
	      var dragY = this.isPhone ? touch.pageY : event.y;
	      container.scrollLeft += this._prevDragX - dragX;
	      container.scrollTop += this._prevDragY - dragY;
	      this.fireEvent(scrollEventName, {
	        isLeft: dragX > this._prevDragX,
	        isRight: dragX < this._prevDragX
	      });
	      this.cachedValue.dragX = this._prevDragX;
	      this.cachedValue.dragY = this._prevDragY;
	      this._prevDragX = dragX;
	      this._prevDragY = dragY;
	    }
	  }, {
	    key: "ontouchend",
	    value: function ontouchend(event) {
	      if (this.isPhone) {
	        var deltaX = Math.abs(event.changedTouches[0].pageX - this.startX);
	        var deltaY = Math.abs(event.changedTouches[0].pageY - this.startY);

	        if (deltaX < 10 && deltaY < 10) {
	          return;
	        }
	      }

	      if (!this._canScroll) {
	        return;
	      }

	      var container = this._container;
	      var dragX = this.isPhone ? event.changedTouches[0].pageX : event.x;
	      var dragY = this.isPhone ? event.changedTouches[0].pageY : event.y;
	      container.scrollLeft += this._prevDragX - dragX;
	      container.scrollTop += this._prevDragY - dragY;
	      var useCachedValues = dragX === this._prevDragX;

	      var _dragX = useCachedValues ? this.cachedValue.dragX : dragX; // const _dragY = useCachedValues ? this.cachedValue.dragY : dragY; add if needed


	      this.fireEvent(touchEndEventName, {
	        isLeft: _dragX < this._prevDragX,
	        isRight: _dragX > this._prevDragX
	      });
	      this._prevDragX = dragX;
	      this._prevDragY = dragY;

	      if (!this.isPhone) {
	        document.removeEventListener("mousemove", this.mouseMove, {
	          passive: true
	        });
	        document.removeEventListener("mouseup", this.mouseUp);
	      }
	    }
	  }, {
	    key: "scrollContainer",
	    set: function set(container) {
	      this._container = container;
	    },
	    get: function get() {
	      return this._container;
	    }
	  }]);

	  return ScrollEnablement;
	}(__chunk_1.EventProvider);

	var name = "slim-arrow-up";
	var pathData = "M261.5 197q-6-6-11 0l-160 160q-5 5-11.5 5t-11.5-5-5-11.5 5-11.5l166-165q9-9 22-9t23 9l165 165q5 5 5 11t-5 11q-12 12-23 0z";
	var ltr = false;
	__chunk_1.registerIcon(name, {
	  pathData: pathData,
	  ltr: ltr
	});

	/**
	 * @lends sap.ui.webcomponents.main.types.TabContainerTabsPlacement.prototype
	 * @public
	 */

	var TabContainerTabsPlacements = {
	  /**
	   * The tab strip is displayed above the tab content (Default)
	   * @public
	   * @type {Top}
	   */
	  Top: "Top",

	  /**
	   * The tab strip is displayed below the tab content
	   * @public
	   * @type {Bottom}
	   */
	  Bottom: "Bottom"
	};
	/**
	 * @class
	 * Different options for the position of the tab strip relative to the tab content area.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.TabContainerTabsPlacement
	 * @public
	 * @enum {string}
	 */

	var TabContainerTabsPlacement =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(TabContainerTabsPlacement, _DataType);

	  function TabContainerTabsPlacement() {
	    __chunk_1._classCallCheck(this, TabContainerTabsPlacement);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TabContainerTabsPlacement).apply(this, arguments));
	  }

	  __chunk_1._createClass(TabContainerTabsPlacement, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!TabContainerTabsPlacements[value];
	    }
	  }]);

	  return TabContainerTabsPlacement;
	}(__chunk_1.DataType);

	TabContainerTabsPlacement.generataTypeAcessors(TabContainerTabsPlacements);

	function _templateObject13() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-tc__contentItem\" id=\"ui5-tc-contentItem-", "\" ?hidden=\"", "\" role=\"tabpanel\" aria-labelledby=\"", "\"><slot name=\"", "\"></slot></div>"]);

	  _templateObject13 = function _templateObject13() {
	    return data;
	  };

	  return data;
	}

	function _templateObject12() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject12 = function _templateObject12() {
	    return data;
	  };

	  return data;
	}

	function _templateObject11() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"", "\">", "</div>"]);

	  _templateObject11 = function _templateObject11() {
	    return data;
	  };

	  return data;
	}

	function _templateObject10() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-button icon=\"", "\" design=\"Transparent\" aria-label=\"", "\" aria-haspopup=\"true\"></ui5-button>"]);

	  _templateObject10 = function _templateObject10() {
	    return data;
	  };

	  return data;
	}

	function _templateObject9() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"overflowButton\"></slot>"]);

	  _templateObject9 = function _templateObject9() {
	    return data;
	  };

	  return data;
	}

	function _templateObject8() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui-tc__overflowButton\" @click=\"", "\">", "</div>"]);

	  _templateObject8 = function _templateObject8() {
	    return data;
	  };

	  return data;
	}

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["<li id=\"", "\" role=\"separator\" class=\"", "\" style=\"list-style-type: none;\"></li>"]);

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
	  var data = __chunk_1._taggedTemplateLiteral(["", "", ""]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-tc__contentItem\" id=\"ui5-tc-contentItem-", "\" ?hidden=\"", "\" role=\"tabpanel\" aria-labelledby=\"", "\"><slot name=\"", "\"></slot></div>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"", "\">", "</div>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"", "\" dir=\"", "\">", "<div class=\"", "\" id=\"", "-header\"><ui5-icon @click=\"", "\" class=\"", "\" name=\"slim-arrow-left\" tabindex=\"-1\" accessible-name=\"", "\" show-tooltip></ui5-icon><!-- tab items --><div class=\"", "\" id=\"", "-headerScrollContainer\"><ul role=\"tablist\" class=\"", "\" @click=\"", "\" @keydown=\"", "\" @keyup=\"", "\">", "</ul></div><ui5-icon @click=\"", "\" class=\"", "\" name=\"slim-arrow-right\" tabindex=\"-1\" accessible-name=\"", "\" show-tooltip></ui5-icon><!-- overflow button -->", "</div>", "</div> "]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.classMap(context.classes.root), __chunk_2.ifDefined(context.effectiveDir), context.tabsAtTheBottom ? block1(context) : undefined, __chunk_2.classMap(context.classes.header), __chunk_2.ifDefined(context._id), context._onHeaderBackArrowClick, __chunk_2.classMap(context.classes.headerBackArrow), __chunk_2.ifDefined(context.previousIconACCName), __chunk_2.classMap(context.classes.headerScrollContainer), __chunk_2.ifDefined(context._id), __chunk_2.classMap(context.classes.headerList), context._onHeaderClick, context._onHeaderKeyDown, context._onHeaderKeyUp, __chunk_2.repeat(context.items, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block4(item, index, context);
	  }), context._onHeaderForwardArrowClick, __chunk_2.classMap(context.classes.headerForwardArrow), __chunk_2.ifDefined(context.nextIconACCName), context.shouldShowOverflow ? block7(context) : undefined, !context.tabsAtTheBottom ? block10(context) : undefined);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.classMap(context.classes.content), __chunk_2.repeat(context.items, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block2(item, index, context);
	  }));
	};

	var block2 = function block2(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject3(), !item.isSeparator ? block3(item, index, context) : undefined);
	};

	var block3 = function block3(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(item._posinset), item.effectiveHidden, __chunk_2.ifDefined(item._id), __chunk_2.ifDefined(item._individualSlot));
	};

	var block4 = function block4(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject5(), !item.isSeparator ? block5(item, index, context) : undefined, item.isSeparator ? block6(item, index, context) : undefined);
	};

	var block5 = function block5(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject6(), __chunk_2.ifDefined(item.stripPresentation));
	};

	var block6 = function block6(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject7(), __chunk_2.ifDefined(item._id), __chunk_2.classMap(context.classes.separator));
	};

	var block7 = function block7(context) {
	  return __chunk_2.scopedHtml(_templateObject8(), context._onOverflowButtonClick, context.overflowButton.length ? block8(context) : block9(context));
	};

	var block8 = function block8(context) {
	  return __chunk_2.scopedHtml(_templateObject9());
	};

	var block9 = function block9(context) {
	  return __chunk_2.scopedHtml(_templateObject10(), __chunk_2.ifDefined(context.overflowMenuIcon), __chunk_2.ifDefined(context.overflowMenuTitle));
	};

	var block10 = function block10(context) {
	  return __chunk_2.scopedHtml(_templateObject11(), __chunk_2.classMap(context.classes.content), __chunk_2.repeat(context.items, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block11(item, index, context);
	  }));
	};

	var block11 = function block11(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject12(), !item.isSeparator ? block12(item, index, context) : undefined);
	};

	var block12 = function block12(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject13(), __chunk_2.ifDefined(item._posinset), item.effectiveHidden, __chunk_2.ifDefined(item._id), __chunk_2.ifDefined(item._individualSlot));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	function _templateObject3$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject3$1 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject2$1 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-responsive-popover id=\"", "-overflowMenu\" horizontal-align=\"Right\" placement-type=\"Bottom\" content-only-on-desktop with-padding no-arrow _hide-header><ui5-list @ui5-item-press=\"", "\">", "</ui5-list><div slot=\"footer\" class=\"ui5-responsive-popover-footer\"><ui5-button design=\"Transparent\" @click=\"", "\">Cancel</ui5-button></div></ui5-responsive-popover>"]);

	  _templateObject$1 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$1 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$1(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._onOverflowListItemSelect), __chunk_2.repeat(context.items, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block1$1(item, index, context);
	  }), context._closeRespPopover);
	};

	var block1$1 = function block1(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject2$1(), !item.isSeparator ? block2$1(item, index, context) : undefined);
	};

	var block2$1 = function block2(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject3$1(), __chunk_2.ifDefined(item.overflowPresentation));
	};

	var main$1 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$1(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var tabContainerCss = ":host(:not([hidden])){display:inline-block;width:100%}.ui5-tc-root{display:flex;flex-direction:column;width:100%;height:100%;font-family:var(--sapFontFamily);font-size:1rem}.ui5-tc__header{display:flex;align-items:center;height:var(--_ui5_tc_header_height);background-color:var(--sapObjectHeader_Background);box-shadow:var(--sapContent_HeaderShadow);box-sizing:border-box}:host([tabs-placement=Bottom]) .ui5-tc__header{border-top:var(--_ui5_tc_header_border_bottom)}.ui5-tc-root.ui5-tc--textOnly .ui5-tc__header{height:var(--_ui5_tc_header_height_text_only)}.ui-tc__headerScrollContainer{box-sizing:border-box;overflow:hidden;flex:1}.ui5-tc__headerList{display:flex;margin:0;padding:0;list-style:none}.ui5-tc__separator{width:0;border-left:2px solid var(--sapList_BorderColor);margin:.5rem .25rem}.ui5-tc__separator:focus{outline:none}.ui5-tc__headerArrow{cursor:pointer;color:var(--sapContent_IconColor);padding:0 .25rem;visibility:hidden}.ui5-tc__headerArrow:active,.ui5-tc__headerArrow:hover{color:var(--sapHighlightColor)}.ui5-tc__headerArrow--visible{visibility:visible}.ui-tc__overflowButton{margin-left:auto;margin-right:.25rem}.ui5-tc-root.ui5-tc--textOnly .ui5-tc__content{height:calc(100% - var(--_ui5_tc_header_height_text_only))}.ui5-tc__content{position:relative;height:calc(100% - var(--_ui5_tc_header_height));padding:1rem;background-color:var(--sapGroup_ContentBackground);border-bottom:var(--_ui5_tc_content_border_bottom);box-sizing:border-box}:host([tabs-placement=Bottom]) .ui5-tc__content{border-top:var(--_ui5_tc_content_border_bottom)}.ui5-tc__content--collapsed{display:none}.ui5-tc--transparent .ui5-tc__content{background-color:transparent}.ui5-tc__contentItem{max-height:100%;display:flex;overflow:auto}.ui5-tc__contentItem[hidden]{display:none}[dir=rtl] .ui-tc__overflowButton{margin-right:auto;margin-left:.25rem}";

	var SCROLL_STEP = 128;
	var tabStyles = [];
	var staticAreaTabStyles = [];
	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-tabcontainer",
	  languageAware: true,
	  managedSlots: true,
	  slots:
	  /** @lends  sap.ui.webcomponents.main.TabContainer.prototype */
	  {
	    /**
	     * Defines the tabs.
	     * <br><br>
	     * <b>Note:</b> Use <code>ui5-tab</code> and <code>ui5-tab-separator</code> for the intended design.
	     *
	     * @type {HTMLElement[]}
	     * @public
	     * @slot
	     */
	    "default": {
	      propertyName: "items",
	      type: HTMLElement,
	      individualSlots: true,
	      listenFor: {
	        include: ["*"]
	      }
	    },

	    /**
	     * Defines the button which will open the overflow menu. If nothing is provided to this slot, the default button will be used.
	     *
	     * @type {HTMLElement[]}
	     * @public
	     * @slot
	     * @since 1.0.0-rc.9
	     */
	    overflowButton: {
	      type: HTMLElement
	    }
	  },
	  properties:
	  /** @lends  sap.ui.webcomponents.main.TabContainer.prototype */
	  {
	    /**
	     * Defines whether the tabs are in a fixed state that is not
	     * expandable/collapsible by user interaction.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    fixed: {
	      type: Boolean
	    },

	    /**
	     * Defines whether the tab content is collapsed.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    collapsed: {
	      type: Boolean
	    },

	    /**
	     * Defines the placement of the tab strip (tab buttons area) relative to the actual tabs' content.
	     * <br><br>
	     * <b>Note:</b> By default the tab strip is displayed above the tabs' content area and this is the recommended
	     * layout for most scenarios. Set to <code>Bottom</code> only when the <code>ui5-tabcontainer</code> is at the
	     * bottom of the page and you want the tab strip to act as a menu.
	     *
	     * @type {TabContainerTabsPlacement}
	     * @defaultvalue "Top"
	     * @since 1.0.0-rc.7
	     * @public
	     */
	    tabsPlacement: {
	      type: TabContainerTabsPlacement,
	      defaultValue: TabContainerTabsPlacement.Top
	    },

	    /**
	     * Defines whether the overflow select list is displayed.
	     * <br><br>
	     * The overflow select list represents a list, where all tab filters are displayed
	     * so that it's easier for the user to select a specific tab filter.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    showOverflow: {
	      type: Boolean
	    },

	    /**
	     * Defines the alignment of the <code>main text</code> and the <code>additionalText</code> of a tab.
	     *
	     * <br><br>
	     * <b>Note:</b>
	     * The <code>main text</code> and the <code>additionalText</code> would be displayed vertically by defualt,
	     * but when set to <code>Inline</code>, they would be displayed horizontally.
	     *
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>Standard</code></li>
	     * <li><code>Inline</code></li>
	     * <ul>
	     *
	     * @type {TabLayout}
	     * @defaultvalue "Standard"
	     * @public
	     */
	    tabLayout: {
	      type: String,
	      defaultValue: TabLayout.Standard
	    },
	    _selectedTab: {
	      type: Object
	    },
	    _scrollable: {
	      type: Boolean,
	      noAttribute: true
	    },
	    _scrollableBack: {
	      type: Boolean,
	      noAttribute: true
	    },
	    _scrollableForward: {
	      type: Boolean,
	      noAttribute: true
	    },
	    _animationRunning: {
	      type: Boolean,
	      noAttribute: true
	    },
	    _contentCollapsed: {
	      type: Boolean,
	      noAttribute: true
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.TabContainer.prototype */
	  {
	    /**
	     * Fired when a tab is selected.
	     *
	     * @event sap.ui.webcomponents.main.TabContainer#tab-select
	     * @param {HTMLElement} tab The selected <code>tab</code>.
	     * @param {Number} tabIndex The selected <code>tab</code> index.
	     * @public
	     */
	    "tab-select": {
	      tab: {
	        type: HTMLElement
	      },
	      tabIndex: {
	        type: Number
	      }
	    }
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-tabcontainer</code> represents a collection of tabs with associated content.
	 * Navigation through the tabs changes the content display of the currently active content area.
	 * A tab can be labeled with text only, or icons with text.
	 *
	 * <h3>Structure</h3>
	 *
	 * The <code>ui5-tabcontainer</code> can hold two types of entities:
	 * <ul>
	 * <li><code>ui5-tab</code> - contains all the information on an item (text and icon)</li>
	 * <li><code>ui5-tab-separator</code> - used to separate tabs with a vertical line</li>
	 * </ul>
	 *
	 * <h3>ES6 import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/TabContainer";</code>
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/Tab";</code> (for <code>ui5-tab</code>)
	 * <br>
	 * <code>import "@ui5/webcomponents/dist/TabSeparator";</code> (for <code>ui5-tab-separator</code>)
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.TabContainer
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @appenddocs Tab TabSeparator
	 * @tagname ui5-tabcontainer
	 * @public
	 */

	var TabContainer =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(TabContainer, _UI5Element);

	  __chunk_1._createClass(TabContainer, null, [{
	    key: "registerTabStyles",
	    value: function registerTabStyles(styles) {
	      tabStyles.push(styles);
	    }
	  }, {
	    key: "registerStaticAreaTabStyles",
	    value: function registerStaticAreaTabStyles(styles) {
	      staticAreaTabStyles.push(styles);
	    }
	  }, {
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return [tabStyles, tabContainerCss];
	    }
	  }, {
	    key: "staticAreaStyles",
	    get: function get() {
	      return [__chunk_25.ResponsivePopoverCommonCss, staticAreaTabStyles];
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
	    key: "staticAreaTemplate",
	    get: function get() {
	      return main$1;
	    }
	  }]);

	  function TabContainer() {
	    var _this;

	    __chunk_1._classCallCheck(this, TabContainer);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(TabContainer).call(this));
	    _this._handleHeaderResize = _this._handleHeaderResize.bind(__chunk_1._assertThisInitialized(_this)); // Init ScrollEnablement

	    _this._scrollEnablement = new ScrollEnablement(__chunk_1._assertThisInitialized(_this));

	    _this._scrollEnablement.attachEvent("scroll", _this._updateScrolling.bind(__chunk_1._assertThisInitialized(_this))); // Init ItemNavigation


	    _this._initItemNavigation();

	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(TabContainer, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      var _this2 = this;

	      // Set external properties to items
	      this.items.filter(function (item) {
	        return !item.isSeparator;
	      }).forEach(function (item, index, arr) {
	        item._isInline = _this2.tabLayout === TabLayout.Inline;
	        item._mixedMode = _this2.mixedMode;
	        item._posinset = index + 1;
	        item._setsize = arr.length;

	        item._getTabContainerHeaderItemCallback = function (_) {
	          return _this2.getDomRef().querySelector("#".concat(item._id));
	        };

	        item._itemSelectCallback = _this2._onItemSelect.bind(_this2);
	      });

	      if (!this._animationRunning) {
	        this._contentCollapsed = this.collapsed;
	      }
	    }
	  }, {
	    key: "onAfterRendering",
	    value: function onAfterRendering() {
	      this._scrollEnablement.scrollContainer = this._getHeaderScrollContainer();

	      this._updateScrolling();
	    }
	  }, {
	    key: "onEnterDOM",
	    value: function onEnterDOM() {
	      __chunk_32.ResizeHandler.register(this._getHeader(), this._handleHeaderResize);
	    }
	  }, {
	    key: "onExitDOM",
	    value: function onExitDOM() {
	      __chunk_32.ResizeHandler.deregister(this._getHeader(), this._handleHeaderResize);
	    }
	  }, {
	    key: "_onHeaderClick",
	    value: function _onHeaderClick(event) {
	      var tab = getTab(event.target);

	      if (!tab) {
	        return;
	      }

	      this._onHeaderItemSelect(tab);
	    }
	  }, {
	    key: "_onHeaderKeyDown",
	    value: function _onHeaderKeyDown(event) {
	      var tab = getTab(event.target);

	      if (!tab) {
	        return;
	      }

	      if (__chunk_8.isEnter(event)) {
	        this._onHeaderItemSelect(tab);
	      } // Prevent Scrolling


	      if (__chunk_8.isSpace(event)) {
	        event.preventDefault();
	      }
	    }
	  }, {
	    key: "_onHeaderKeyUp",
	    value: function _onHeaderKeyUp(event) {
	      var tab = getTab(event.target);

	      if (!tab) {
	        return;
	      }

	      if (__chunk_8.isSpace(event)) {
	        this._onHeaderItemSelect(tab);
	      }
	    }
	  }, {
	    key: "_initItemNavigation",
	    value: function _initItemNavigation() {
	      var _this3 = this;

	      this._itemNavigation = new __chunk_31.ItemNavigation(this);

	      this._itemNavigation.getItemsCallback = function () {
	        return _this3._getTabs();
	      };
	    }
	  }, {
	    key: "_onHeaderItemSelect",
	    value: function _onHeaderItemSelect(tab) {
	      if (!tab.hasAttribute("disabled")) {
	        this._onItemSelect(tab);
	      }
	    }
	  }, {
	    key: "_onOverflowListItemSelect",
	    value: function _onOverflowListItemSelect(event) {
	      this._onItemSelect(event.detail.item);

	      this.responsivePopover.close();
	      this.shadowRoot.querySelector("#".concat(event.detail.item.id)).focus();
	    }
	  }, {
	    key: "_onItemSelect",
	    value: function _onItemSelect(target) {
	      var _this4 = this;

	      var selectedIndex = findIndex(this.items, function (item) {
	        return item._id === target.id;
	      });
	      var selectedTabIndex = findIndex(this._getTabs(), function (item) {
	        return item._id === target.id;
	      });
	      var selectedTab = this.items[selectedIndex]; // update selected items

	      this.items.forEach(function (item, index) {
	        if (!item.isSeparator) {
	          var selected = selectedIndex === index;
	          item.selected = selected;

	          if (selected) {
	            _this4._itemNavigation.current = selectedTabIndex;
	          }
	        }
	      }, this);

	      if (this.fixed) {
	        this.selectTab(selectedTab, selectedTabIndex);
	        return;
	      }

	      if (!this.animate) {
	        this.toggle(selectedTab);
	        this.selectTab(selectedTab, selectedTabIndex);
	        return;
	      }

	      this.toggleAnimated(selectedTab);
	      this.selectTab(selectedTab, selectedTabIndex);
	    }
	  }, {
	    key: "toggleAnimated",
	    value: function () {
	      var _toggleAnimated = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee(selectedTab) {
	        var content, animationPromise;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                content = this.shadowRoot.querySelector(".ui5-tc__content");
	                animationPromise = null;
	                this._animationRunning = true;

	                if (selectedTab === this._selectedTab) {
	                  // click on already selected tab - animate both directions
	                  this.collapsed = !this.collapsed;
	                  animationPromise = this.collapsed ? this.slideContentUp(content) : this.slideContentDown(content);
	                } else {
	                  // click on new tab - animate if the content is currently collapsed
	                  animationPromise = this.collapsed ? this.slideContentDown(content) : Promise.resolve();
	                  this.collapsed = false;
	                }

	                _context.next = 6;
	                return animationPromise;

	              case 6:
	                this._contentCollapsed = this.collapsed;
	                this._animationRunning = false;

	              case 8:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function toggleAnimated(_x) {
	        return _toggleAnimated.apply(this, arguments);
	      }

	      return toggleAnimated;
	    }()
	  }, {
	    key: "toggle",
	    value: function toggle(selectedTab) {
	      if (selectedTab === this._selectedTab) {
	        this.collapsed = !this.collapsed;
	      } else {
	        this.collapsed = false;
	      }
	    }
	  }, {
	    key: "selectTab",
	    value: function selectTab(selectedTab, selectedTabIndex) {
	      // select the tab
	      this._selectedTab = selectedTab;
	      this.fireEvent("tab-select", {
	        tab: selectedTab,
	        tabIndex: selectedTabIndex
	      });
	    }
	  }, {
	    key: "slideContentDown",
	    value: function slideContentDown(element) {
	      return __chunk_40.slideDown({
	        element: element
	      }).promise();
	    }
	  }, {
	    key: "slideContentUp",
	    value: function slideContentUp(element) {
	      return __chunk_40.slideUp({
	        element: element
	      }).promise();
	    }
	  }, {
	    key: "_onOverflowButtonClick",
	    value: function () {
	      var _onOverflowButtonClick2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee2(event) {
	        var button;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                button = this.overflowButton[0] || this.getDomRef().querySelector(".ui-tc__overflowButton > ui5-button");

	                if (!(event.target !== button)) {
	                  _context2.next = 3;
	                  break;
	                }

	                return _context2.abrupt("return");

	              case 3:
	                _context2.next = 5;
	                return this._respPopover();

	              case 5:
	                this.responsivePopover = _context2.sent;
	                this.updateStaticAreaItemContentDensity();

	                if (this.responsivePopover.opened) {
	                  this.responsivePopover.close();
	                } else {
	                  this.responsivePopover.open(button);
	                }

	              case 8:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function _onOverflowButtonClick(_x2) {
	        return _onOverflowButtonClick2.apply(this, arguments);
	      }

	      return _onOverflowButtonClick;
	    }()
	  }, {
	    key: "_onHeaderBackArrowClick",
	    value: function _onHeaderBackArrowClick() {
	      var _this5 = this;

	      this._scrollEnablement.move(-SCROLL_STEP, 0).promise().then(function (_) {
	        return _this5._updateScrolling();
	      });
	    }
	  }, {
	    key: "_onHeaderForwardArrowClick",
	    value: function _onHeaderForwardArrowClick() {
	      var _this6 = this;

	      this._scrollEnablement.move(SCROLL_STEP, 0).promise().then(function (_) {
	        return _this6._updateScrolling();
	      });
	    }
	  }, {
	    key: "_handleHeaderResize",
	    value: function _handleHeaderResize() {
	      this._updateScrolling();
	    }
	  }, {
	    key: "_closeRespPopover",
	    value: function () {
	      var _closeRespPopover2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee3() {
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return this._respPopover();

	              case 2:
	                this.responsivePopover = _context3.sent;
	                this.responsivePopover.close();

	              case 4:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function _closeRespPopover() {
	        return _closeRespPopover2.apply(this, arguments);
	      }

	      return _closeRespPopover;
	    }()
	  }, {
	    key: "_updateScrolling",
	    value: function _updateScrolling() {
	      var headerScrollContainer = this._getHeaderScrollContainer();

	      this._scrollable = headerScrollContainer.offsetWidth < headerScrollContainer.scrollWidth;
	      this._scrollableBack = headerScrollContainer.scrollLeft > 0;
	      this._scrollableForward = Math.ceil(headerScrollContainer.scrollLeft) < headerScrollContainer.scrollWidth - headerScrollContainer.offsetWidth;

	      if (!this._scrollable) {
	        this._closeRespPopover();
	      }
	    }
	  }, {
	    key: "_getHeader",
	    value: function _getHeader() {
	      return this.shadowRoot.querySelector("#".concat(this._id, "-header"));
	    }
	  }, {
	    key: "_getTabs",
	    value: function _getTabs() {
	      return this.items.filter(function (item) {
	        return !item.isSeparator;
	      });
	    }
	  }, {
	    key: "_getHeaderScrollContainer",
	    value: function _getHeaderScrollContainer() {
	      return this.shadowRoot.querySelector("#".concat(this._id, "-headerScrollContainer"));
	    }
	  }, {
	    key: "_respPopover",
	    value: function () {
	      var _respPopover2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee4() {
	        var staticAreaItem;
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                _context4.next = 2;
	                return this.getStaticAreaItemDomRef();

	              case 2:
	                staticAreaItem = _context4.sent;
	                return _context4.abrupt("return", staticAreaItem.querySelector("#".concat(this._id, "-overflowMenu")));

	              case 4:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function _respPopover() {
	        return _respPopover2.apply(this, arguments);
	      }

	      return _respPopover;
	    }()
	  }, {
	    key: "shouldShowOverflow",
	    get: function get() {
	      return this.showOverflow && this._scrollable;
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        root: {
	          "ui5-tc-root": true,
	          "ui5-tc--textOnly": this.textOnly
	        },
	        header: {
	          "ui5-tc__header": true,
	          "ui5-tc__header--scrollable": this._scrollable
	        },
	        headerScrollContainer: {
	          "ui-tc__headerScrollContainer": true
	        },
	        headerList: {
	          "ui5-tc__headerList": true
	        },
	        separator: {
	          "ui5-tc__separator": true
	        },
	        headerBackArrow: {
	          "ui5-tc__headerArrow": true,
	          "ui5-tc__headerArrowLeft": true,
	          "ui5-tc__headerArrow--visible": this._scrollableBack
	        },
	        headerForwardArrow: {
	          "ui5-tc__headerArrow": true,
	          "ui5-tc__headerArrowRight": true,
	          "ui5-tc__headerArrow--visible": this._scrollableForward
	        },
	        content: {
	          "ui5-tc__content": true,
	          "ui5-tc__content--collapsed": this._contentCollapsed
	        }
	      };
	    }
	  }, {
	    key: "mixedMode",
	    get: function get() {
	      return this.items.some(function (item) {
	        return item.icon;
	      }) && this.items.some(function (item) {
	        return item.text;
	      });
	    }
	  }, {
	    key: "textOnly",
	    get: function get() {
	      return this.items.every(function (item) {
	        return !item.icon;
	      });
	    }
	  }, {
	    key: "previousIconACCName",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.TABCONTAINER_PREVIOUS_ICON_ACC_NAME);
	    }
	  }, {
	    key: "nextIconACCName",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.TABCONTAINER_NEXT_ICON_ACC_NAME);
	    }
	  }, {
	    key: "overflowMenuTitle",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.TABCONTAINER_OVERFLOW_MENU_TITLE);
	    }
	  }, {
	    key: "tabsAtTheBottom",
	    get: function get() {
	      return this.tabsPlacement === TabContainerTabsPlacement.Bottom;
	    }
	  }, {
	    key: "overflowMenuIcon",
	    get: function get() {
	      return this.tabsAtTheBottom ? "slim-arrow-up" : "slim-arrow-down";
	    }
	  }, {
	    key: "animate",
	    get: function get() {
	      return __chunk_40.getAnimationMode() !== __chunk_40.AnimationMode.None;
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee5() {
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                _context5.next = 2;
	                return __chunk_1.fetchI18nBundle("@ui5/webcomponents");

	              case 2:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_14.Button, __chunk_9.Icon, __chunk_36.List, __chunk_25.ResponsivePopover];
	    }
	  }]);

	  return TabContainer;
	}(__chunk_1.UI5Element);

	var isTabLi = function isTabLi(el) {
	  return el.localName === "li" && el.getAttribute("role") === "tab";
	};

	var getTab = function getTab(el) {
	  while (el) {
	    if (isTabLi(el)) {
	      return el;
	    }

	    el = el.parentElement;
	  }

	  return false;
	};

	var findIndex = function findIndex(arr, predicate) {
	  for (var i = 0; i < arr.length; i++) {
	    var result = predicate(arr[i]);

	    if (result) {
	      return i;
	    }
	  }

	  return -1;
	};

	TabContainer.define();

	exports.TabLayout = TabLayout;
	exports.TabContainer = TabContainer;

});
//# sourceMappingURL=chunk-c724d191.js.map
