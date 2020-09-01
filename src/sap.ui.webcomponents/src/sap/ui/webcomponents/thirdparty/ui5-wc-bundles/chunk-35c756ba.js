sap.ui.define(['exports', './chunk-7ceb84db', './chunk-52e7820d', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-fd3246cd'], function (exports, __chunk_1, __chunk_2, __chunk_6, __chunk_7, __chunk_8, __chunk_18) { 'use strict';

	var currentZIndex = 100;

	var getFocusedElement = function getFocusedElement() {
	  var element = document.activeElement;

	  while (element && element.shadowRoot && element.shadowRoot.activeElement) {
	    element = element.shadowRoot.activeElement;
	  }

	  return element && typeof element.focus === "function" ? element : null;
	};

	var isFocusedElementWithinNode = function isFocusedElementWithinNode(node) {
	  var fe = getFocusedElement();

	  if (fe) {
	    return isNodeContainedWithin(node, fe);
	  }

	  return false;
	};

	var isNodeContainedWithin = function isNodeContainedWithin(parent, child) {
	  var currentNode = parent;

	  if (currentNode.shadowRoot) {
	    currentNode = Array.from(currentNode.shadowRoot.children).find(function (n) {
	      return n.localName !== "style";
	    });
	  }

	  if (currentNode === child) {
	    return true;
	  }

	  var childNodes = currentNode.localName === "slot" ? currentNode.assignedNodes() : currentNode.children;

	  if (childNodes) {
	    return Array.from(childNodes).some(function (n) {
	      return isNodeContainedWithin(n, child);
	    });
	  }
	};

	var isPointInRect = function isPointInRect(x, y, rect) {
	  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
	};

	var isClickInRect = function isClickInRect(event, rect) {
	  var x;
	  var y;

	  if (event.touches) {
	    var touch = event.touches[0];
	    x = touch.clientX;
	    y = touch.clientY;
	  } else {
	    x = event.clientX;
	    y = event.clientY;
	  }

	  return isPointInRect(x, y, rect);
	};

	var getClosedPopupParent = function getClosedPopupParent(el) {
	  var parent = el.parentElement || el.getRootNode && el.getRootNode().host;

	  if (parent && (parent.openBy && parent.isUI5Element || parent.open && parent.isUI5Element || parent === document.documentElement)) {
	    return parent;
	  }

	  return getClosedPopupParent(parent);
	};

	var getNextZIndex = function getNextZIndex() {
	  currentZIndex += 2;
	  return currentZIndex;
	};

	var rClickable = /^(?:a|area)$/i;
	var rFocusable = /^(?:input|select|textarea|button)$/i;

	var isNodeClickable = function isNodeClickable(node) {
	  if (node.disabled) {
	    return false;
	  }

	  var tabIndex = node.getAttribute("tabindex");

	  if (tabIndex !== null && tabIndex !== undefined) {
	    return parseInt(tabIndex) >= 0;
	  }

	  return rFocusable.test(node.nodeName) || rClickable.test(node.nodeName) && node.href;
	};

	var isFocusTrap = function isFocusTrap(el) {
	  return el.hasAttribute("data-ui5-focus-trap");
	};

	var getFirstFocusableElement = function getFirstFocusableElement(container) {
	  if (!container || __chunk_18.isNodeHidden(container)) {
	    return null;
	  }

	  return findFocusableElement(container, true);
	};

	var getLastFocusableElement = function getLastFocusableElement(container) {
	  if (!container || __chunk_18.isNodeHidden(container)) {
	    return null;
	  }

	  return findFocusableElement(container, false);
	};

	var findFocusableElement = function findFocusableElement(container, forward) {
	  var child;

	  if (container.shadowRoot) {
	    child = forward ? container.shadowRoot.firstChild : container.shadowRoot.lastChild;
	  } else if (container.assignedNodes && container.assignedNodes()) {
	    var assignedElements = container.assignedNodes();
	    child = forward ? assignedElements[0] : assignedElements[assignedElements.length - 1];
	  } else {
	    child = forward ? container.firstChild : container.lastChild;
	  }

	  var focusableDescendant;

	  while (child) {
	    var originalChild = child;
	    child = child.isUI5Element ? child.getFocusDomRef() : child;

	    if (!child) {
	      return null;
	    }

	    if (child.nodeType === 1 && !__chunk_18.isNodeHidden(child) && !isFocusTrap(child)) {
	      if (isNodeClickable(child)) {
	        return child && typeof child.focus === "function" ? child : null;
	      }

	      focusableDescendant = findFocusableElement(child, forward);

	      if (focusableDescendant) {
	        return focusableDescendant && typeof focusableDescendant.focus === "function" ? focusableDescendant : null;
	      }
	    }

	    child = forward ? originalChild.nextSibling : originalChild.previousSibling;
	  }

	  return null;
	};

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<section style=\"", "\" class=\"", "\" role=\"dialog\" aria-modal=\"", "\" aria-label=\"", "\" aria-labelledby=\"", "\"><span class=\"first-fe\" data-ui5-focus-trap tabindex=\"0\" @focusin=", "></span><div style=\"", "\" class=\"", "\"  @scroll=\"", "\"><slot></slot></div><span class=\"last-fe\" data-ui5-focus-trap tabindex=\"0\" @focusin=", "></span></section> "]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.styleMap(context.styles.root), __chunk_2.classMap(context.classes.root), __chunk_2.ifDefined(context._ariaModal), __chunk_2.ifDefined(context._ariaLabel), __chunk_2.ifDefined(context._ariaLabelledBy), context.forwardToLast, __chunk_2.styleMap(context.styles.content), __chunk_2.classMap(context.classes.content), context._scroll, context.forwardToFirst);
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	function _templateObject$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-block-layer\" ?hidden=", " tabindex=\"1\" style=\"", "\" @keydown=\"", "\" @mousedown=\"", "\"></div>"]);

	  _templateObject$1 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$1 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$1(), context._blockLayerHidden, __chunk_2.styleMap(context.styles.blockLayer), context._preventBlockLayerFocus, context._preventBlockLayerFocus);
	};

	var main$1 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$1(context);
	};

	var openedRegistry = [];

	var addOpenedPopup = function addOpenedPopup(instance) {
	  var parentPopovers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

	  if (!openedRegistry.includes(instance)) {
	    openedRegistry.push({
	      instance: instance,
	      parentPopovers: parentPopovers
	    });
	  }

	  if (openedRegistry.length === 1) {
	    attachGlobalListener();
	  }
	};

	var removeOpenedPopup = function removeOpenedPopup(instance) {
	  openedRegistry = openedRegistry.filter(function (el) {
	    return el !== instance.instance;
	  });

	  if (!openedRegistry.length) {
	    detachGlobalListener();
	  }
	};

	var getOpenedPopups = function getOpenedPopups() {
	  return __chunk_1._toConsumableArray(openedRegistry);
	};

	var _keydownListener = function _keydownListener(event) {
	  if (!openedRegistry.length) {
	    return;
	  }

	  if (__chunk_8.isEscape(event)) {
	    openedRegistry.pop().instance.close(true);
	  }
	};

	var attachGlobalListener = function attachGlobalListener() {
	  document.addEventListener("keydown", _keydownListener);
	};

	var detachGlobalListener = function detachGlobalListener() {
	  document.removeEventListener("keydown", _keydownListener);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles = ":host{min-width:1px;display:none;position:fixed}";

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var staticAreaStyles = ".ui5-block-layer{display:none;position:fixed;background-color:var(--sapBlockLayer_Background);opacity:.6;top:-500px;left:-500px;right:-500px;bottom:-500px;outline:none;pointer-events:all;z-index:-1}.ui5-block-layer:not([hidden]){display:inline-block}";

	/**
	 * @public
	 */

	var metadata = {
	  managedSlots: true,
	  slots:
	  /** @lends  sap.ui.webcomponents.main.Popup.prototype */
	  {
	    /**
	     * Defines the content of the Popup.
	     * @type {Node[]}
	     * @slot
	     * @public
	     */
	    "default": {
	      type: HTMLElement
	    }
	  },
	  properties:
	  /** @lends  sap.ui.webcomponents.main.Popup.prototype */
	  {
	    /**
	     * Defines the ID of the HTML Element, which will get the initial focus.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    initialFocus: {
	      type: String
	    },

	    /**
	     * Defines if the focus should be returned to the previously focused element,
	     * when the popup closes.
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @since 1.0.0-rc.8
	    */
	    preventFocusRestore: {
	      type: Boolean
	    },

	    /**
	     * Indicates if the elements is open
	     * @private
	     * @type {boolean}
	     * @defaultvalue false
	     */
	    opened: {
	      type: Boolean
	    },

	    /**
	     * Defines the aria-label attribute for the popup
	     *
	     * @type {String}
	     * @defaultvalue: ""
	     * @private
	     * @since 1.0.0-rc.8
	     */
	    ariaLabel: {
	      type: String,
	      defaultValue: undefined
	    },

	    /**
	     * @private
	     */
	    _disableInitialFocus: {
	      type: Boolean
	    },
	    _blockLayerHidden: {
	      type: Boolean
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.Popup.prototype */
	  {
	    /**
	     * Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening. This event does not bubble.
	     *
	     * @public
	     * @event sap.ui.webcomponents.main.Popup#before-open
	     */
	    "before-open": {},

	    /**
	     * Fired after the component is opened. This event does not bubble.
	     *
	     * @public
	     * @event sap.ui.webcomponents.main.Popup#after-open
	     */
	    "after-open": {},

	    /**
	     * Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing. This event does not bubble.
	     *
	     * @public
	     * @event sap.ui.webcomponents.main.Popup#before-close
	     * @param {Boolean} escPressed Indicates that <code>ESC</code> key has triggered the event.
	     */
	    "before-close": {
	      escPressed: {
	        type: Boolean
	      }
	    },

	    /**
	     * Fired after the component is closed. This event does not bubble.
	     *
	     * @public
	     * @event sap.ui.webcomponents.main.Popup#after-close
	     */
	    "after-close": {}
	  }
	};
	var customBlockingStyleInserted = false;

	var createBlockingStyle = function createBlockingStyle() {
	  if (customBlockingStyleInserted) {
	    return;
	  }

	  __chunk_1.createStyleInHead("\n\t\t.ui5-popup-scroll-blocker {\n\t\t\twidth: 100%;\n\t\t\theight: 100%;\n\t\t\tposition: fixed;\n\t\t\toverflow: hidden;\n\t\t}\n\t", {
	    "data-ui5-popup-scroll-blocker": ""
	  });
	  customBlockingStyleInserted = true;
	};

	createBlockingStyle();
	/**
	 * @class
	 * <h3 class="comment-api-title">Overview</h3>
	 * Base class for all popup Web Components.
	 *
	 * If you need to create your own popup-like custom UI5 Web Components, it is highly recommended that you extend
	 * at least Popup in order to have consistency with other popups in terms of modal behavior and z-index management.
	 *
	 * 1. The Popup class handles modality:
	 *  - The "isModal" getter can be overridden by derivatives to provide their own conditions when they are modal or not
	 *  - Derivatives may call the "blockBodyScrolling" and "unblockBodyScrolling" static methods to temporarily remove scrollbars on the body
	 *  - Derivatives may call the "open" and "close" methods which handle focus, manage the popup registry and for modal popups, manage the blocking layer
	 *
	 *  2. Provides blocking layer (relevant for modal popups only):
	 *   - It is in the static area
	 *   - Controlled by the "open" and "close" methods
	 *
	 * 3. The Popup class "traps" focus:
	 *  - Derivatives may call the "applyInitialFocus" method (usually when opening, to transfer focus inside the popup)
	 *
	 * 4. The Popup class automatically assigns "z-index"
	 *  - Each time a popup is opened, it gets a higher than the previously opened popup z-index
	 *
	 * 5. The template of this component exposes two inline partials you can override in derivatives:
	 *  - beforeContent (upper part of the box, useful for header/title/close button)
	 *  - afterContent (lower part, useful for footer/action buttons)
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Popup
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @public
	 */

	var Popup =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Popup, _UI5Element);

	  function Popup() {
	    __chunk_1._classCallCheck(this, Popup);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Popup).apply(this, arguments));
	  }

	  __chunk_1._createClass(Popup, [{
	    key: "_preventBlockLayerFocus",

	    /**
	     * Prevents the user from interacting with the content under the block layer
	     */
	    value: function _preventBlockLayerFocus(event) {
	      event.preventDefault();
	    }
	    /**
	     * Temporarily removes scrollbars from the body
	     * @protected
	     */

	  }, {
	    key: "_scroll",
	    value: function _scroll(e) {
	      this.fireEvent("scroll", {
	        scrollTop: e.target.scrollTop,
	        targetRef: e.target
	      });
	    }
	    /**
	     * Focus trapping
	     * @private
	     */

	  }, {
	    key: "forwardToFirst",
	    value: function forwardToFirst() {
	      var firstFocusable = getFirstFocusableElement(this);

	      if (firstFocusable) {
	        firstFocusable.focus();
	      }
	    }
	    /**
	     * Focus trapping
	     * @private
	     */

	  }, {
	    key: "forwardToLast",
	    value: function forwardToLast() {
	      var lastFocusable = getLastFocusableElement(this);

	      if (lastFocusable) {
	        lastFocusable.focus();
	      }
	    }
	    /**
	     * Use this method to focus the element denoted by "initialFocus", if provided, or the first focusable element otherwise.
	     * @protected
	     */

	  }, {
	    key: "applyInitialFocus",
	    value: function applyInitialFocus() {
	      this.applyFocus();
	    }
	    /**
	     * Focuses the element denoted by <code>initialFocus</code>, if provided,
	     * or the first focusable element otherwise.
	     * @public
	     */

	  }, {
	    key: "applyFocus",
	    value: function applyFocus() {
	      var element = this.getRootNode().getElementById(this.initialFocus) || document.getElementById(this.initialFocus) || getFirstFocusableElement(this);

	      if (element) {
	        element.focus();
	      }
	    }
	    /**
	     * Override this method to provide custom logic for the popup's open/closed state. Maps to the "opened" property by default.
	     * @public
	     * @returns {boolean}
	     */

	  }, {
	    key: "isOpen",
	    value: function isOpen() {
	      return this.opened;
	    }
	  }, {
	    key: "isFocusWithin",
	    value: function isFocusWithin() {
	      return isFocusedElementWithinNode(this.shadowRoot.querySelector(".ui5-popup-root"));
	    }
	    /**
	     * Shows the block layer (for modal popups only) and sets the correct z-index for the purpose of popup stacking
	     * @param {boolean} preventInitialFocus prevents applying the focus inside the popup
	     * @public
	     */

	  }, {
	    key: "open",
	    value: function open(preventInitialFocus) {
	      var prevented = !this.fireEvent("before-open", {}, true, false);

	      if (prevented) {
	        return;
	      }

	      if (this.isModal) {
	        // create static area item ref for block layer
	        this.getStaticAreaItemDomRef();
	        this._blockLayerHidden = false;
	        Popup.blockBodyScrolling();
	      }

	      this._zIndex = getNextZIndex();
	      this.style.zIndex = this._zIndex;
	      this._focusedElementBeforeOpen = getFocusedElement();
	      this.show();

	      if (!this._disableInitialFocus && !preventInitialFocus) {
	        this.applyInitialFocus();
	      }

	      this._addOpenedPopup();

	      this.opened = true;
	      this.fireEvent("after-open", {}, false, false);
	    }
	    /**
	     * Adds the popup to the "opened popups registry"
	     * @protected
	     */

	  }, {
	    key: "_addOpenedPopup",
	    value: function _addOpenedPopup() {
	      addOpenedPopup(this);
	    }
	    /**
	     * Hides the block layer (for modal popups only)
	     * @public
	     */

	  }, {
	    key: "close",
	    value: function close() {
	      var escPressed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	      var preventRegistryUpdate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	      var preventFocusRestore = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	      if (!this.opened) {
	        return;
	      }

	      var prevented = !this.fireEvent("before-close", {
	        escPressed: escPressed
	      }, true, false);

	      if (prevented) {
	        return;
	      }

	      if (this.isModal) {
	        this._blockLayerHidden = true;
	        Popup.unblockBodyScrolling();
	      }

	      this.hide();
	      this.opened = false;

	      if (!preventRegistryUpdate) {
	        this._removeOpenedPopup();
	      }

	      if (!this.preventFocusRestore && !preventFocusRestore) {
	        this.resetFocus();
	      }

	      this.fireEvent("after-close", {}, false, false);
	    }
	    /**
	     * Removes the popup from the "opened popups registry"
	     * @protected
	     */

	  }, {
	    key: "_removeOpenedPopup",
	    value: function _removeOpenedPopup() {
	      removeOpenedPopup(this);
	    }
	    /**
	     * Returns the focus to the previously focused element
	     * @protected
	     */

	  }, {
	    key: "resetFocus",
	    value: function resetFocus() {
	      if (!this._focusedElementBeforeOpen) {
	        return;
	      }

	      this._focusedElementBeforeOpen.focus();

	      this._focusedElementBeforeOpen = null;
	    }
	    /**
	     * Sets "block" display to the popup
	     * @protected
	     */

	  }, {
	    key: "show",
	    value: function show() {
	      this.style.display = "block";
	    }
	    /**
	     * Sets "none" display to the popup
	     * @protected
	     */

	  }, {
	    key: "hide",
	    value: function hide() {
	      this.style.display = "none";
	    }
	  }, {
	    key: "onExitDOM",
	    value: function onExitDOM() {
	      if (this.isOpen()) {
	        Popup.unblockBodyScrolling();

	        this._removeOpenedPopup();
	      }
	    }
	    /**
	     * Implement this getter with relevant logic regarding the modality of the popup (f.e. based on a public property)
	     *
	     * @protected
	     * @abstract
	     * @returns {boolean}
	     */

	  }, {
	    key: "isModal",
	    get: function get() {} // eslint-disable-line

	    /**
	     * Return the ID of an element in the shadow DOM that is going to label this popup
	     *
	     * @protected
	     * @abstract
	     * @returns {String}
	     */

	  }, {
	    key: "_ariaLabelledBy",
	    get: function get() {} // eslint-disable-line

	    /**
	     * Return the value for aria-modal for this popup
	     *
	     * @protected
	     * @abstract
	     * @returns {String}
	     */

	  }, {
	    key: "_ariaModal",
	    get: function get() {} // eslint-disable-line

	    /**
	     * Ensures ariaLabel is never null or empty string
	     * @returns {String|undefined}
	     * @protected
	     */

	  }, {
	    key: "_ariaLabel",
	    get: function get() {
	      return this.ariaLabel || undefined;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        root: {},
	        content: {},
	        blockLayer: {
	          "zIndex": this._zIndex - 1
	        }
	      };
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        root: {},
	        content: {}
	      };
	    }
	  }], [{
	    key: "blockBodyScrolling",
	    value: function blockBodyScrolling() {
	      document.body.style.top = "-".concat(window.pageYOffset, "px");
	      document.body.classList.add("ui5-popup-scroll-blocker");
	    }
	    /**
	     * Restores scrollbars on the body, if needed
	     * @protected
	     */

	  }, {
	    key: "unblockBodyScrolling",
	    value: function unblockBodyScrolling() {
	      document.body.classList.remove("ui5-popup-scroll-blocker");
	      window.scrollTo(0, -parseFloat(document.body.style.top));
	      document.body.style.top = "";
	    }
	  }, {
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
	    key: "styles",
	    get: function get() {
	      return styles;
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
	  }, {
	    key: "staticAreaStyles",
	    get: function get() {
	      return staticAreaStyles;
	    }
	  }]);

	  return Popup;
	}(__chunk_1.UI5Element);

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var PopupsCommonCss = ":host{display:none;position:fixed;min-width:6.25rem;background:var(--sapGroup_ContentBackground);box-shadow:var(--sapContent_Shadow2);border-radius:.25rem;min-height:2rem;box-sizing:border-box}.ui5-popup-root{background:inherit;border-radius:inherit;width:100%;height:100%;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;max-height:94vh;max-width:90vw}@media screen and (-ms-high-contrast:active){.ui5-popup-root{border:1px solid var(--sapPageFooter_BorderColor)}}.ui5-popup-root .ui5-popup-header-root{box-shadow:var(--sapContent_Shadow0);margin-bottom:.125rem}.ui5-popup-footer-root{background:var(--sapPageFooter_Background);border-top:1px solid var(--sapPageFooter_BorderColor);color:var(--sapPageFooter_TextColor)}.ui5-popup-footer-root,.ui5-popup-header-root,:host([header-text]) .ui5-popup-header-text{margin:0;color:var(--sapPageHeader_TextColor);font-size:1rem;font-weight:400;font-family:var(--sapFontFamily);display:flex;justify-content:center;align-items:center}.ui5-popup-content{overflow:auto;padding:var(--_ui5_popup_content_padding);box-sizing:border-box}:host([no-padding]) .ui5-popup-content{padding:0}:host([header-text]) .ui5-popup-header-text{padding:0 .25rem;text-align:center;min-height:3rem;max-height:3rem;line-height:3rem;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;max-width:100%;display:inline-block}:host(:not([header-text])) .ui5-popup-header-text{display:none}:host([disable-scrolling]) .ui5-popup-content{overflow:hidden}";

	exports.getNextZIndex = getNextZIndex;
	exports.addOpenedPopup = addOpenedPopup;
	exports.removeOpenedPopup = removeOpenedPopup;
	exports.getOpenedPopups = getOpenedPopups;
	exports.isClickInRect = isClickInRect;
	exports.getClosedPopupParent = getClosedPopupParent;
	exports.PopupsCommonCss = PopupsCommonCss;
	exports.Popup = Popup;

});
//# sourceMappingURL=chunk-35c756ba.js.map
