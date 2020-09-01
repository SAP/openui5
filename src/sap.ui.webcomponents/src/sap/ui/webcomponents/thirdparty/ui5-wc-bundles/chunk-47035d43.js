sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-35c756ba'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_24) { 'use strict';

	/**
	 * @lends sap.ui.webcomponents.main.types.PopoverPlacementType.prototype
	 * @public
	 */

	var PopoverPlacementTypes = {
	  /**
	   * Popover will be placed at the left side of the reference element.
	   * @public
	   * @type {Left}
	   */
	  Left: "Left",

	  /**
	   * Popover will be placed at the right side of the reference element.
	   * @public
	   * @type {Right}
	   */
	  Right: "Right",

	  /**
	   * Popover will be placed at the top of the reference element.
	   * @public
	   * @type {Bottom}
	   */
	  Top: "Top",

	  /**
	   * Popover will be placed at the bottom of the reference element.
	   * @public
	   * @type {Bottom}
	   */
	  Bottom: "Bottom"
	};
	/**
	 * @class
	 * Types for the placement of Popover control.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.PopoverPlacementType
	 * @public
	 * @enum {string}
	 */

	var PopoverPlacementType =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(PopoverPlacementType, _DataType);

	  function PopoverPlacementType() {
	    __chunk_1._classCallCheck(this, PopoverPlacementType);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(PopoverPlacementType).apply(this, arguments));
	  }

	  __chunk_1._createClass(PopoverPlacementType, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!PopoverPlacementTypes[value];
	    }
	  }]);

	  return PopoverPlacementType;
	}(__chunk_1.DataType);

	PopoverPlacementType.generataTypeAcessors(PopoverPlacementTypes);

	/**
	 * @lends sap.ui.webcomponents.main.types.PopoverVerticalAlign.prototype
	 * @public
	 */

	var PopoverVerticalAligns = {
	  /**
	   *
	   * @public
	   * @type {Center}
	   */
	  Center: "Center",

	  /**
	   * Popover will be placed at the top of the reference control.
	   * @public
	   * @type {Top}
	   */
	  Top: "Top",

	  /**
	   * Popover will be placed at the bottom of the reference control.
	   * @public
	   * @type {Bottom}
	   */
	  Bottom: "Bottom",

	  /**
	   * Popover will be streched
	   * @public
	   * @type {Stretch}
	   */
	  Stretch: "Stretch"
	};
	/**
	 * @class
	 * Types for the placement of message Popover control.
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.PopoverVerticalAlign
	 * @public
	 * @enum {string}
	 */

	var PopoverVerticalAlign =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(PopoverVerticalAlign, _DataType);

	  function PopoverVerticalAlign() {
	    __chunk_1._classCallCheck(this, PopoverVerticalAlign);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(PopoverVerticalAlign).apply(this, arguments));
	  }

	  __chunk_1._createClass(PopoverVerticalAlign, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!PopoverVerticalAligns[value];
	    }
	  }]);

	  return PopoverVerticalAlign;
	}(__chunk_1.DataType);

	PopoverVerticalAlign.generataTypeAcessors(PopoverVerticalAligns);

	/**
	 * @lends sap.ui.webcomponents.main.types.PopoverHorizontalAlign.prototype
	 * @public
	 */

	var PopoverHorizontalAligns = {
	  /**
	   * Popover is centered
	   * @public
	   * @type {Center}
	   */
	  Center: "Center",

	  /**
	   * Popover opens on the left side of the target
	   * @public
	   * @type {Left}
	   */
	  Left: "Left",

	  /**
	   * Popover opens on the right side of the target
	   * @public
	   * @type {Right}
	   */
	  Right: "Right",

	  /**
	   * Popover is stretched
	   * @public
	   * @type {Stretch}
	   */
	  Stretch: "Stretch"
	};
	/**
	 * @class
	 * Defines the horizontal alignment of <code>ui5-popover</code>
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.types.PopoverHorizontalAlign
	 * @public
	 * @enum {string}
	 */

	var PopoverHorizontalAlign =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(PopoverHorizontalAlign, _DataType);

	  function PopoverHorizontalAlign() {
	    __chunk_1._classCallCheck(this, PopoverHorizontalAlign);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(PopoverHorizontalAlign).apply(this, arguments));
	  }

	  __chunk_1._createClass(PopoverHorizontalAlign, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!PopoverHorizontalAligns[value];
	    }
	  }]);

	  return PopoverHorizontalAlign;
	}(__chunk_1.DataType);

	PopoverHorizontalAlign.generataTypeAcessors(PopoverHorizontalAligns);

	var updateInterval = null;
	var intervalTimeout = 300;
	var openedRegistry = [];

	var repositionPopovers = function repositionPopovers(event) {
	  openedRegistry.forEach(function (popover) {
	    popover.instance.reposition();
	  });
	};

	var attachGlobalScrollHandler = function attachGlobalScrollHandler() {
	  document.body.addEventListener("scroll", repositionPopovers, true);
	};

	var detachGlobalScrollHandler = function detachGlobalScrollHandler() {
	  document.body.removeEventListener("scroll", repositionPopovers, true);
	};

	var runUpdateInterval = function runUpdateInterval() {
	  updateInterval = setInterval(function () {
	    repositionPopovers();
	  }, intervalTimeout);
	};

	var stopUpdateInterval = function stopUpdateInterval() {
	  clearInterval(updateInterval);
	};

	var attachGlobalClickHandler = function attachGlobalClickHandler() {
	  document.addEventListener("mousedown", clickHandler);
	};

	var detachGlobalClickHandler = function detachGlobalClickHandler() {
	  document.removeEventListener("mousedown", clickHandler);
	};

	var clickHandler = function clickHandler(event) {
	  var openedPopups = __chunk_24.getOpenedPopups();
	  var isTopPopupPopover = openedPopups[openedPopups.length - 1].instance.openBy;

	  if (openedPopups.length === 0 || !isTopPopupPopover) {
	    return;
	  } // loop all open popovers


	  for (var i = openedPopups.length - 1; i !== -1; i--) {
	    var popup = openedPopups[i].instance; // if popup is modal, opener is clicked, popup is dialog skip closing

	    if (popup.isModal || popup.isOpenerClicked(event)) {
	      return;
	    }

	    if (__chunk_24.isClickInRect(event, popup.getBoundingClientRect())) {
	      break;
	    }

	    popup.close();
	  }
	};

	var attachScrollHandler = function attachScrollHandler(popover) {
	  popover && popover.shadowRoot.addEventListener("scroll", repositionPopovers, true);
	};

	var detachScrollHandler = function detachScrollHandler(popover) {
	  popover && popover.shadowRoot.removeEventListener("scroll", repositionPopovers);
	};

	var addOpenedPopover = function addOpenedPopover(instance) {
	  var parentPopovers = getParentPopoversIfNested(instance);
	  __chunk_24.addOpenedPopup(instance, parentPopovers);
	  openedRegistry.push({
	    instance: instance,
	    parentPopovers: parentPopovers
	  });
	  attachScrollHandler(instance);

	  if (openedRegistry.length === 1) {
	    attachGlobalScrollHandler();
	    attachGlobalClickHandler();
	    runUpdateInterval();
	  }
	};

	var removeOpenedPopover = function removeOpenedPopover(instance) {
	  var popoversToClose = [instance];

	  for (var i = 0; i < openedRegistry.length; i++) {
	    var indexOfCurrentInstance = openedRegistry[i].parentPopovers.indexOf(instance);

	    if (openedRegistry[i].parentPopovers.length > 0 && indexOfCurrentInstance > -1) {
	      popoversToClose.push(openedRegistry[i].instance);
	    }
	  }

	  for (var _i = popoversToClose.length - 1; _i >= 0; _i--) {
	    for (var j = 0; j < openedRegistry.length; j++) {
	      var indexOfItemToRemove = void 0;

	      if (popoversToClose[_i] === openedRegistry[j].instance) {
	        indexOfItemToRemove = j;
	      }

	      if (indexOfItemToRemove >= 0) {
	        __chunk_24.removeOpenedPopup(openedRegistry[indexOfItemToRemove].instance);
	        detachScrollHandler(openedRegistry[indexOfItemToRemove].instance);
	        var itemToClose = openedRegistry.splice(indexOfItemToRemove, 1);
	        itemToClose[0].instance.close(false, true);
	      }
	    }
	  }

	  if (!openedRegistry.length) {
	    detachGlobalScrollHandler();
	    detachGlobalClickHandler();
	    stopUpdateInterval();
	  }
	};

	var getParentPopoversIfNested = function getParentPopoversIfNested(instance) {
	  var currentElement = instance.parentNode;
	  var parentPopovers = [];

	  while (currentElement.parentNode) {
	    for (var i = 0; i < openedRegistry.length; i++) {
	      if (currentElement && currentElement === openedRegistry[i].instance) {
	        parentPopovers.push(currentElement);
	      }
	    }

	    currentElement = currentElement.parentNode;
	  }

	  return parentPopovers;
	};

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<footer class=\"ui5-popup-footer-root\"><slot name=\"footer\"></slot></footer>"]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<h2 class=\"ui5-popup-header-text\">", "</h2>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"header\"></slot>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<header class=\"ui5-popup-header-root\" id=\"ui5-popup-header\">", "</header>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<section style=\"", "\" class=\"", "\" role=\"dialog\" aria-modal=\"", "\" aria-label=\"", "\" aria-labelledby=\"", "\"><span class=\"first-fe\" data-ui5-focus-trap tabindex=\"0\" @focusin=", "></span><span class=\"ui5-popover-arrow\" style=\"", "\"></span>", "<div style=\"", "\" class=\"", "\"  @scroll=\"", "\"><slot></slot></div>", "<span class=\"last-fe\" data-ui5-focus-trap tabindex=\"0\" @focusin=", "></span></section> "]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.styleMap(context.styles.root), __chunk_2.classMap(context.classes.root), __chunk_2.ifDefined(context._ariaModal), __chunk_2.ifDefined(context._ariaLabel), __chunk_2.ifDefined(context._ariaLabelledBy), context.forwardToLast, __chunk_2.styleMap(context.styles.arrow), context._displayHeader ? block1(context) : undefined, __chunk_2.styleMap(context.styles.content), __chunk_2.classMap(context.classes.content), context._scroll, context._displayFooter ? block4(context) : undefined, context.forwardToFirst);
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), context.header.length ? block2(context) : block3(context));
	};

	var block2 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3());
	};

	var block3 = function block3(context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(context.headerText));
	};

	var block4 = function block4(context) {
	  return __chunk_2.scopedHtml(_templateObject5(), context.footer.length ? block5(context) : undefined);
	};

	var block5 = function block5(context) {
	  return __chunk_2.scopedHtml(_templateObject6());
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var PopoverCss = ".ui5-popover-arrow{pointer-events:none;display:block;width:1rem;height:1rem;position:absolute;overflow:hidden}.ui5-popover-arrow:after{content:\"\";display:block;width:.7rem;height:.7rem;background-color:var(--sapGroup_ContentBackground);box-shadow:var(--sapContent_Shadow3);transform:rotate(-45deg)}:host([actual-placement-type=Bottom]) .ui5-popover-arrow{left:calc(50% - .5625rem);top:-.5rem;height:.5625rem}:host([actual-placement-type=Bottom]) .ui5-popover-arrow:after{margin:.1875rem 0 0 .1875rem}:host([actual-placement-type=Left]) .ui5-popover-arrow{top:calc(50% - .5625rem);right:-.5625rem;width:.5625rem}:host([actual-placement-type=Left]) .ui5-popover-arrow:after{margin:.1875rem 0 0 -.375rem}:host([actual-placement-type=Top]) .ui5-popover-arrow{left:calc(50% - .5625rem);height:.5625rem;bottom:calc(-1*(var(--_ui5_popup_content_padding) + 2px))}:host([actual-placement-type=Top]) .ui5-popover-arrow:after{margin:-.375rem 0 0 .125rem}:host(:not([actual-placement-type])) .ui5-popover-arrow,:host([actual-placement-type=Right]) .ui5-popover-arrow{left:-.5625rem;top:calc(50% - .5625rem);width:.5625rem;height:1rem}:host(:not([actual-placement-type])) .ui5-popover-arrow:after,:host([actual-placement-type=Right]) .ui5-popover-arrow:after{margin:.125rem 0 0 .25rem}:host([no-arrow]) .ui5-popover-arrow{display:none}";

	var arrowSize = 8;
	/**
	 * @public
	 */

	var metadata = {
	  tag: "ui5-popover",
	  properties:
	  /** @lends sap.ui.webcomponents.main.Popover.prototype */
	  {
	    /**
	     * Defines the header text.
	     * <br><br>
	     * <b>Note:</b> If <code>header</code> slot is provided, the <code>headerText</code> is ignored.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    headerText: {
	      type: String
	    },

	    /**
	     * Determines on which side the <code>ui5-popover</code> is placed at.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>Left</code></li>
	     * <li><code>Right</code></li>
	     * <li><code>Top</code></li>
	     * <li><code>Bottom</code></li>
	     * </ul>
	     *
	     * @type {PopoverPlacementType}
	     * @defaultvalue "Right"
	     * @public
	     */
	    placementType: {
	      type: PopoverPlacementType,
	      defaultValue: PopoverPlacementType.Right
	    },

	    /**
	     * Determines the horizontal alignment of the <code>ui5-popover</code>.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>Center</code></li>
	     * <li><code>Left</code></li>
	     * <li><code>Right</code></li>
	     * <li><code>Stretch</code></li>
	     * </ul>
	     *
	     * @type {PopoverHorizontalAlign}
	     * @defaultvalue "Center"
	     * @public
	     */
	    horizontalAlign: {
	      type: PopoverHorizontalAlign,
	      defaultValue: PopoverHorizontalAlign.Center
	    },

	    /**
	     * Determines the vertical alignment of the <code>ui5-popover</code>.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>Center</code></li>
	     * <li><code>Top</code></li>
	     * <li><code>Bottom</code></li>
	     * <li><code>Stretch</code></li>
	     * </ul>
	     *
	     * @type {PopoverVerticalAlign}
	     * @defaultvalue "Center"
	     * @public
	     */
	    verticalAlign: {
	      type: PopoverVerticalAlign,
	      defaultValue: PopoverVerticalAlign.Center
	    },

	    /**
	     * Defines whether the <code>ui5-popover</code> should close when
	     * clicking/tapping outside of the popover.
	     * If enabled, it blocks any interaction with the background.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    modal: {
	      type: Boolean
	    },

	    /**
	     * Determines whether the <code>ui5-popover</code> arrow is hidden.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    noArrow: {
	      type: Boolean
	    },

	    /**
	     * Determines if there is no enough space, the <code>ui5-popover</code> can be placed
	     * over the target.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    allowTargetOverlap: {
	      type: Boolean
	    },

	    /**
	     * Defines whether the content is scrollable.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @private
	     */
	    disableScrolling: {
	      type: Boolean
	    },

	    /**
	     * Sets the X translation of the arrow
	     *
	     * @private
	     */
	    arrowTranslateX: {
	      type: __chunk_1.Integer,
	      defaultValue: 0,
	      noAttribute: true
	    },

	    /**
	     * Sets the Y translation of the arrow
	     *
	     * @private
	     */
	    arrowTranslateY: {
	      type: __chunk_1.Integer,
	      defaultValue: 0,
	      noAttribute: true
	    },

	    /**
	     * Returns the calculated placement depending on the free space
	     *
	     * @private
	     */
	    actualPlacementType: {
	      type: PopoverPlacementType,
	      defaultValue: PopoverPlacementType.Right
	    },
	    _maxContentHeight: {
	      type: __chunk_1.Integer
	    }
	  },
	  managedSlots: true,
	  slots:
	  /** @lends sap.ui.webcomponents.main.Popover.prototype */
	  {
	    /**
	     * Defines the header HTML Element.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    header: {
	      type: HTMLElement
	    },

	    /**
	     * Defines the footer HTML Element.
	     *
	     * @type {HTMLElement[]}
	     * @slot
	     * @public
	     */
	    footer: {
	      type: HTMLElement
	    }
	  },
	  events:
	  /** @lends sap.ui.webcomponents.main.Popover.prototype */
	  {}
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-popover</code> component displays additional information for an object
	 * in a compact way and without leaving the page.
	 * The Popover can contain various UI elements, such as fields, tables, images, and charts.
	 * It can also include actions in the footer.
	 *
	 * <h3>Structure</h3>
	 *
	 * The popover has three main areas:
	 * <ul>
	 * <li>Header (optional)</li>
	 * <li>Content</li>
	 * <li>Footer (optional)</li>
	 * </ul>
	 *
	 * <b>Note:</b> The <code>ui5-popover</code> is closed when the user clicks
	 * or taps outside the popover
	 * or selects an action within the popover. You can prevent this with the
	 * <code>modal</code> property.
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/Popover.js";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Popover
	 * @extends Popup
	 * @tagname ui5-popover
	 * @since 1.0.0-rc.6
	 * @public
	 */

	var Popover =
	/*#__PURE__*/
	function (_Popup) {
	  __chunk_1._inherits(Popover, _Popup);

	  function Popover() {
	    __chunk_1._classCallCheck(this, Popover);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Popover).apply(this, arguments));
	  }

	  __chunk_1._createClass(Popover, [{
	    key: "isOpenerClicked",
	    value: function isOpenerClicked(event) {
	      var target = event.target;
	      return target === this._opener || target.getFocusDomRef && target.getFocusDomRef() === this._opener || event.composedPath().indexOf(this._opener) > -1;
	    }
	    /**
	     * Opens the popover.
	     * @param {HTMLElement} opener the element that the popover is opened by
	     * @param {boolean} preventInitialFocus prevents applying the focus inside the popover
	     * @public
	     */

	  }, {
	    key: "openBy",
	    value: function openBy(opener) {
	      var preventInitialFocus = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	      if (!opener || this.opened) {
	        return;
	      }

	      this._opener = opener;

	      __chunk_1._get(__chunk_1._getPrototypeOf(Popover.prototype), "open", this).call(this, preventInitialFocus);
	    }
	    /**
	     * Override for the _addOpenedPopup hook, which would otherwise just call addOpenedPopup(this)
	     * @private
	     */

	  }, {
	    key: "_addOpenedPopup",
	    value: function _addOpenedPopup() {
	      addOpenedPopover(this);
	    }
	    /**
	     * Override for the _removeOpenedPopup hook, which would otherwise just call removeOpenedPopup(this)
	     * @private
	     */

	  }, {
	    key: "_removeOpenedPopup",
	    value: function _removeOpenedPopup() {
	      removeOpenedPopover(this);
	    }
	  }, {
	    key: "shouldCloseDueToOverflow",
	    value: function shouldCloseDueToOverflow(placement, openerRect) {
	      var threshold = 32;
	      var limits = {
	        "Right": openerRect.right,
	        "Left": openerRect.left,
	        "Top": openerRect.top,
	        "Bottom": openerRect.bottom
	      };
	      var closedPopupParent = __chunk_24.getClosedPopupParent(this._opener);
	      var overflowsBottom = false;
	      var overflowsTop = false;

	      if (closedPopupParent.openBy) {
	        var contentRect = closedPopupParent.contentDOM.getBoundingClientRect();
	        overflowsBottom = openerRect.top > contentRect.top + contentRect.height;
	        overflowsTop = openerRect.top + openerRect.height < contentRect.top;
	      }

	      return limits[placement] < 0 || limits[placement] + threshold > closedPopupParent.innerHeight || overflowsBottom || overflowsTop;
	    }
	  }, {
	    key: "shouldCloseDueToNoOpener",
	    value: function shouldCloseDueToNoOpener(openerRect) {
	      return openerRect.top === 0 && openerRect.bottom === 0 && openerRect.left === 0 && openerRect.right === 0;
	    }
	  }, {
	    key: "reposition",
	    value: function reposition() {
	      this.show();
	    }
	  }, {
	    key: "show",
	    value: function show() {
	      var placement;
	      var popoverSize = this.popoverSize;

	      var openerRect = this._opener.getBoundingClientRect();

	      if (this.shouldCloseDueToNoOpener(openerRect) && this.isFocusWithin()) {
	        // reuse the old placement as the opener is not available,
	        // but keep the popover open as the focus is within
	        placement = this._oldPlacement;
	      } else {
	        placement = this.calcPlacement(openerRect, popoverSize);
	      }

	      var stretching = this.horizontalAlign === PopoverHorizontalAlign.Stretch;

	      if (this._preventRepositionAndClose) {
	        return this.close();
	      }

	      if (this._oldPlacement && this._oldPlacement.left === placement.left && this._oldPlacement.top === placement.top && stretching) {
	        __chunk_1._get(__chunk_1._getPrototypeOf(Popover.prototype), "show", this).call(this);

	        this.style.width = this._width;
	        return;
	      }

	      this._oldPlacement = placement;
	      var popoverOnLeftBorder = this._left === 0;
	      var popoverOnTopBorder = this._top === 0;
	      this.actualPlacementType = placement.placementType;
	      this.arrowTranslateX = popoverOnLeftBorder ? placement.arrowX - Popover.MIN_OFFSET : placement.arrowX;
	      this.arrowTranslateY = popoverOnTopBorder ? placement.arrowY - Popover.MIN_OFFSET : placement.arrowY;
	      this.style.left = "".concat(popoverOnLeftBorder ? Popover.MIN_OFFSET : this._left, "px");
	      this.style.top = "".concat(popoverOnTopBorder ? Popover.MIN_OFFSET : this._top, "px");

	      __chunk_1._get(__chunk_1._getPrototypeOf(Popover.prototype), "show", this).call(this);

	      if (stretching && this._width) {
	        this.style.width = this._width;
	      }
	    }
	  }, {
	    key: "calcPlacement",
	    value: function calcPlacement(targetRect, popoverSize) {
	      var left = 0;
	      var top = 0;
	      var allowTargetOverlap = this.allowTargetOverlap;
	      var clientWidth = document.documentElement.clientWidth;
	      var clientHeight = document.documentElement.clientHeight;
	      var maxHeight = clientHeight;
	      var width = "";
	      var height = "";
	      var placementType = this.getActualPlacementType(targetRect, popoverSize);
	      this._preventRepositionAndClose = this.shouldCloseDueToNoOpener(targetRect) || this.shouldCloseDueToOverflow(placementType, targetRect);
	      var isVertical = placementType === PopoverPlacementType.Top || placementType === PopoverPlacementType.Bottom;

	      if (this.horizontalAlign === PopoverHorizontalAlign.Stretch && isVertical) {
	        popoverSize.width = targetRect.width;
	        width = "".concat(targetRect.width, "px");
	      } else if (this.verticalAlign === PopoverVerticalAlign.Stretch && !isVertical) {
	        popoverSize.height = targetRect.height;
	        height = "".concat(targetRect.height, "px");
	      }

	      this._width = width;
	      this._height = height;
	      var arrowOffset = this.noArrow ? 0 : arrowSize; // calc popover positions

	      switch (placementType) {
	        case PopoverPlacementType.Top:
	          left = this.getVerticalLeft(targetRect, popoverSize);
	          top = Math.max(targetRect.top - popoverSize.height - arrowOffset, 0);

	          if (!allowTargetOverlap) {
	            maxHeight = targetRect.top - arrowOffset;
	          }

	          break;

	        case PopoverPlacementType.Bottom:
	          left = this.getVerticalLeft(targetRect, popoverSize);

	          if (allowTargetOverlap) {
	            top = Math.max(Math.min(targetRect.bottom + arrowOffset, clientHeight - popoverSize.height), 0);
	          } else {
	            top = targetRect.bottom + arrowOffset;
	            maxHeight = clientHeight - targetRect.bottom - arrowOffset;
	          }

	          break;

	        case PopoverPlacementType.Left:
	          left = Math.max(targetRect.left - popoverSize.width - arrowOffset, 0);
	          top = this.getHorizontalTop(targetRect, popoverSize);
	          break;

	        case PopoverPlacementType.Right:
	          if (allowTargetOverlap) {
	            left = Math.max(Math.min(targetRect.left + targetRect.width + arrowOffset, clientWidth - popoverSize.width), 0);
	          } else {
	            left = targetRect.left + targetRect.width + arrowOffset;
	          }

	          top = this.getHorizontalTop(targetRect, popoverSize);
	          break;
	      } // correct popover positions


	      if (isVertical) {
	        if (popoverSize.width > clientWidth || left < 0) {
	          left = 0;
	        } else if (left + popoverSize.width > clientWidth) {
	          left -= left + popoverSize.width - clientWidth;
	        }
	      } else {
	        if (popoverSize.height > clientHeight || top < 0) {
	          // eslint-disable-line
	          top = 0;
	        } else if (top + popoverSize.height > clientHeight) {
	          top -= top + popoverSize.height - clientHeight;
	        }
	      }

	      var maxContentHeight = Math.round(maxHeight);
	      var hasHeader = this.header.length || this.headerText;

	      if (hasHeader) {
	        var headerDomRef = this.shadowRoot.querySelector(".ui5-popup-header-root") || this.shadowRoot.querySelector(".ui5-popup-header-text");

	        if (headerDomRef) {
	          maxContentHeight = Math.round(maxHeight - headerDomRef.offsetHeight);
	        }
	      }

	      this._maxContentHeight = maxContentHeight;
	      var arrowXCentered = this.horizontalAlign === PopoverHorizontalAlign.Center || this.horizontalAlign === PopoverHorizontalAlign.Stretch;
	      var arrowTranslateX = isVertical && arrowXCentered ? targetRect.left + targetRect.width / 2 - left - popoverSize.width / 2 : 0;
	      var arrowTranslateY = !isVertical ? targetRect.top + targetRect.height / 2 - top - popoverSize.height / 2 : 0;

	      if (this._left === undefined || Math.abs(this._left - left) > 1.5) {
	        this._left = Math.round(left);
	      }

	      if (this._top === undefined || Math.abs(this._top - top) > 1.5) {
	        this._top = Math.round(top);
	      }

	      return {
	        arrowX: Math.round(arrowTranslateX),
	        arrowY: Math.round(arrowTranslateY),
	        top: this._top,
	        left: this._left,
	        placementType: placementType
	      };
	    }
	    /**
	     * Fallbacks to new placement, prioritizing <code>Left</code> and <code>Right</code> placements.
	     * @private
	     */

	  }, {
	    key: "fallbackPlacement",
	    value: function fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) {
	      if (targetRect.left > popoverSize.width) {
	        return PopoverPlacementType.Left;
	      }

	      if (clientWidth - targetRect.right > targetRect.left) {
	        return PopoverPlacementType.Right;
	      }

	      if (clientHeight - targetRect.bottom > popoverSize.height) {
	        return PopoverPlacementType.Bottom;
	      }

	      if (clientHeight - targetRect.bottom < targetRect.top) {
	        return PopoverPlacementType.Top;
	      }
	    }
	  }, {
	    key: "getActualPlacementType",
	    value: function getActualPlacementType(targetRect, popoverSize) {
	      var placementType = this.placementType;
	      var actualPlacementType = placementType;
	      var clientWidth = document.documentElement.clientWidth;
	      var clientHeight = document.documentElement.clientHeight;

	      switch (placementType) {
	        case PopoverPlacementType.Top:
	          if (targetRect.top < popoverSize.height && targetRect.top < clientHeight - targetRect.bottom) {
	            actualPlacementType = PopoverPlacementType.Bottom;
	          }

	          break;

	        case PopoverPlacementType.Bottom:
	          if (clientHeight - targetRect.bottom < popoverSize.height && clientHeight - targetRect.bottom < targetRect.top) {
	            actualPlacementType = PopoverPlacementType.Top;
	          }

	          break;

	        case PopoverPlacementType.Left:
	          if (targetRect.left < popoverSize.width) {
	            actualPlacementType = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placementType;
	          }

	          break;

	        case PopoverPlacementType.Right:
	          if (clientWidth - targetRect.right < popoverSize.width) {
	            actualPlacementType = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placementType;
	          }

	          break;
	      }

	      return actualPlacementType;
	    }
	  }, {
	    key: "getVerticalLeft",
	    value: function getVerticalLeft(targetRect, popoverSize) {
	      var left;

	      switch (this.horizontalAlign) {
	        case PopoverHorizontalAlign.Center:
	        case PopoverHorizontalAlign.Stretch:
	          left = targetRect.left - (popoverSize.width - targetRect.width) / 2;
	          break;

	        case PopoverHorizontalAlign.Left:
	          left = targetRect.left;
	          break;

	        case PopoverHorizontalAlign.Right:
	          left = targetRect.right - popoverSize.width;
	          break;
	      }

	      return left;
	    }
	  }, {
	    key: "getHorizontalTop",
	    value: function getHorizontalTop(targetRect, popoverSize) {
	      var top;

	      switch (this.verticalAlign) {
	        case PopoverVerticalAlign.Center:
	        case PopoverVerticalAlign.Stretch:
	          top = targetRect.top - (popoverSize.height - targetRect.height) / 2;
	          break;

	        case PopoverVerticalAlign.Top:
	          top = targetRect.top;
	          break;

	        case PopoverVerticalAlign.Bottom:
	          top = targetRect.bottom - popoverSize.height;
	          break;
	      }

	      return top;
	    }
	  }, {
	    key: "popoverSize",
	    get: function get() {
	      var width, height;
	      var rect = this.getBoundingClientRect();

	      if (this.opened) {
	        width = rect.width;
	        height = rect.height;
	        return {
	          width: width,
	          height: height
	        };
	      }

	      this.style.visibility = "hidden";
	      this.style.display = "block";
	      rect = this.getBoundingClientRect();
	      width = rect.width;
	      height = rect.height;
	      this.hide();
	      this.style.visibility = "visible";
	      return {
	        width: width,
	        height: height
	      };
	    }
	  }, {
	    key: "contentDOM",
	    get: function get() {
	      return this.shadowRoot.querySelector(".ui5-popup-content");
	    }
	  }, {
	    key: "arrowDOM",
	    get: function get() {
	      return this.shadowRoot.querySelector(".ui5-popover-arrow");
	    }
	  }, {
	    key: "isModal",
	    get: function get() {
	      // Required by Popup.js
	      return this.modal;
	    }
	  }, {
	    key: "_ariaLabelledBy",
	    get: function get() {
	      // Required by Popup.js
	      return this.ariaLabel ? undefined : "ui5-popup-header";
	    }
	  }, {
	    key: "_ariaModal",
	    get: function get() {
	      // Required by Popup.js
	      return true;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return __chunk_1._objectSpread2({}, __chunk_1._get(__chunk_1._getPrototypeOf(Popover.prototype), "styles", this), {
	        content: {
	          "max-height": "".concat(this._maxContentHeight, "px")
	        },
	        arrow: {
	          transform: "translate(".concat(this.arrowTranslateX, "px, ").concat(this.arrowTranslateY, "px)")
	        }
	      });
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        root: {
	          "ui5-popup-root": true
	        },
	        content: {
	          "ui5-popup-content": true
	        }
	      };
	    }
	    /**
	     * Hook for descendants to hide header.
	     */

	  }, {
	    key: "_displayHeader",
	    get: function get() {
	      return true;
	    }
	    /**
	     * Hook for descendants to hide footer.
	     */

	  }, {
	    key: "_displayFooter",
	    get: function get() {
	      return true;
	    }
	  }], [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return [__chunk_24.PopupsCommonCss, PopoverCss];
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }, {
	    key: "MIN_OFFSET",
	    get: function get() {
	      return 10; // px
	    }
	  }]);

	  return Popover;
	}(__chunk_24.Popup);

	Popover.define();

	exports.Popover = Popover;

});
//# sourceMappingURL=chunk-47035d43.js.map
