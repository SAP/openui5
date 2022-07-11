sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/util/FocusableElements", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/ManagedStyles", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/PopupUtils", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/MediaRange", "./generated/templates/PopupTemplate.lit", "./generated/templates/PopupBlockLayerTemplate.lit", "./popup-utils/OpenedPopupsRegistry", "./generated/themes/Popup.css", "./generated/themes/PopupStaticAreaStyles.css", "./generated/themes/PopupGlobal.css"], function (_exports, _Render, _LitRenderer, _UI5Element, _Device, _FocusableElements, _AriaLabelHelper, _ManagedStyles, _Keys, _PopupUtils, _ResizeHandler, _MediaRange, _PopupTemplate, _PopupBlockLayerTemplate, _OpenedPopupsRegistry, _Popup, _PopupStaticAreaStyles, _PopupGlobal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _UI5Element = _interopRequireDefault(_UI5Element);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _MediaRange = _interopRequireDefault(_MediaRange);
  _PopupTemplate = _interopRequireDefault(_PopupTemplate);
  _PopupBlockLayerTemplate = _interopRequireDefault(_PopupBlockLayerTemplate);
  _Popup = _interopRequireDefault(_Popup);
  _PopupStaticAreaStyles = _interopRequireDefault(_PopupStaticAreaStyles);
  _PopupGlobal = _interopRequireDefault(_PopupGlobal);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles

  /**
   * @public
   */
  const metadata = {
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Popup.prototype */
    {
      /**
       * Defines the content of the Popup.
       * @type {HTMLElement[]}
       * @slot content
       * @public
       */
      "default": {
        type: HTMLElement,
        propertyName: "content"
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.main.Popup.prototype */
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
       * Indicates if the element is open
       * @public
       * @type {boolean}
       * @defaultvalue false
       * @since 1.2.0
       */
      open: {
        type: Boolean
      },

      /**
       * Indicates if the element is already open
       * @private
       * @type {boolean}
       * @defaultvalue false
       */
      opened: {
        type: Boolean,
        noAttribute: true
      },

      /**
       * Defines the accessible name of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleName: {
        type: String,
        defaultValue: undefined
      },

      /**
       * Defines the IDs of the elements that label the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.1.0
       */
      accessibleNameRef: {
        type: String,
        defaultValue: ""
      },

      /**
       * Defines the current media query size.
       *
       * @type {string}
       * @private
       */
      mediaRange: {
        type: String
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
    /** @lends sap.ui.webcomponents.main.Popup.prototype */
    {
      /**
       * Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening. <b>This event does not bubble.</b>
       *
       * @public
       * @event sap.ui.webcomponents.main.Popup#before-open
       * @allowPreventDefault
       */
      "before-open": {},

      /**
       * Fired after the component is opened. <b>This event does not bubble.</b>
       *
       * @public
       * @event sap.ui.webcomponents.main.Popup#after-open
       */
      "after-open": {},

      /**
       * Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing. <b>This event does not bubble.</b>
       *
       * @public
       * @event sap.ui.webcomponents.main.Popup#before-close
       * @allowPreventDefault
       * @param {boolean} escPressed Indicates that <code>ESC</code> key has triggered the event.
       */
      "before-close": {
        detail: {
          escPressed: {
            type: Boolean
          }
        }
      },

      /**
       * Fired after the component is closed. <b>This event does not bubble.</b>
       *
       * @public
       * @event sap.ui.webcomponents.main.Popup#after-close
       */
      "after-close": {},

      /**
       * Fired whenever the popup content area is scrolled
       *
       * @private
       * @event sap.ui.webcomponents.main.Popup#scroll
       */
      "scroll": {}
    }
  };

  const createBlockingStyle = () => {
    if (!(0, _ManagedStyles.hasStyle)("data-ui5-popup-scroll-blocker")) {
      (0, _ManagedStyles.createStyle)(_PopupGlobal.default, "data-ui5-popup-scroll-blocker");
    }
  };

  createBlockingStyle();
  const pageScrollingBlockers = new Set();
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
   *  - Derivatives may call the "blockPageScrolling" and "unblockPageScrolling" static methods to temporarily remove scrollbars on the html element
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

  class Popup extends _UI5Element.default {
    constructor() {
      super();
      this._resizeHandler = this._resize.bind(this);
    }

    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get styles() {
      return _Popup.default;
    }

    static get template() {
      return _PopupTemplate.default;
    }

    static get staticAreaTemplate() {
      return _PopupBlockLayerTemplate.default;
    }

    static get staticAreaStyles() {
      return _PopupStaticAreaStyles.default;
    }

    onEnterDOM() {
      if (!this.isOpen()) {
        this._blockLayerHidden = true;
      }

      _ResizeHandler.default.register(this, this._resizeHandler);
    }

    onExitDOM() {
      if (this.isOpen()) {
        Popup.unblockPageScrolling(this);

        this._removeOpenedPopup();
      }

      _ResizeHandler.default.deregister(this, this._resizeHandler);
    }

    get _displayProp() {
      return "block";
    }

    _resize() {
      this.mediaRange = _MediaRange.default.getCurrentRange(_MediaRange.default.RANGESETS.RANGE_4STEPS, this.getDomRef().offsetWidth);
    }
    /**
     * Prevents the user from interacting with the content under the block layer
     */


    _preventBlockLayerFocus(event) {
      event.preventDefault();
    }
    /**
     * Temporarily removes scrollbars from the html element
     * @protected
     */


    static blockPageScrolling(popup) {
      pageScrollingBlockers.add(popup);

      if (pageScrollingBlockers.size !== 1) {
        return;
      }

      document.documentElement.classList.add("ui5-popup-scroll-blocker");
    }
    /**
     * Restores scrollbars on the html element, if needed
     * @protected
     */


    static unblockPageScrolling(popup) {
      pageScrollingBlockers.delete(popup);

      if (pageScrollingBlockers.size !== 0) {
        return;
      }

      document.documentElement.classList.remove("ui5-popup-scroll-blocker");
    }

    _scroll(e) {
      this.fireEvent("scroll", {
        scrollTop: e.target.scrollTop,
        targetRef: e.target
      });
    }

    _onkeydown(e) {
      if (e.target === this._root && (0, _Keys.isTabPrevious)(e)) {
        e.preventDefault();
      }
    }

    _onfocusout(e) {
      // relatedTarget is the element, which will get focus. If no such element exists, focus the root.
      // This happens after the mouse is released in order to not interrupt text selection.
      if (!e.relatedTarget) {
        this._shouldFocusRoot = true;
      }
    }

    _onmousedown(e) {
      this._root.removeAttribute("tabindex");

      if (this.shadowRoot.contains(e.target)) {
        this._shouldFocusRoot = true;
      } else {
        this._shouldFocusRoot = false;
      }
    }

    _onmouseup() {
      this._root.tabIndex = -1;

      if (this._shouldFocusRoot) {
        if ((0, _Device.isChrome)()) {
          this._root.focus();
        }

        this._shouldFocusRoot = false;
      }
    }
    /**
     * Focus trapping
     * @private
     */


    async forwardToFirst() {
      const firstFocusable = await (0, _FocusableElements.getFirstFocusableElement)(this);

      if (firstFocusable) {
        firstFocusable.focus();
      } else {
        this._root.focus();
      }
    }
    /**
     * Focus trapping
     * @private
     */


    async forwardToLast() {
      const lastFocusable = await (0, _FocusableElements.getLastFocusableElement)(this);

      if (lastFocusable) {
        lastFocusable.focus();
      } else {
        this._root.focus();
      }
    }
    /**
     * Use this method to focus the element denoted by "initialFocus", if provided, or the first focusable element otherwise.
     * @protected
     */


    async applyInitialFocus() {
      await this.applyFocus();
    }
    /**
     * Focuses the element denoted by <code>initialFocus</code>, if provided,
     * or the first focusable element otherwise.
     * @public
     * @async
     * @returns {Promise} Promise that resolves when the focus is applied
     */


    async applyFocus() {
      await this._waitForDomRef();

      const element = this.getRootNode().getElementById(this.initialFocus) || document.getElementById(this.initialFocus) || (await (0, _FocusableElements.getFirstFocusableElement)(this)) || this._root; // in case of no focusable content focus the root


      if (element) {
        if (element === this._root) {
          element.tabIndex = -1;
        }

        element.focus();
      }
    }
    /**
     * Tells if the component is opened
     * @public
     * @returns {boolean}
     */


    isOpen() {
      return this.opened;
    }

    isFocusWithin() {
      return (0, _PopupUtils.isFocusedElementWithinNode)(this.shadowRoot.querySelector(".ui5-popup-root"));
    }
    /**
     * Shows the block layer (for modal popups only) and sets the correct z-index for the purpose of popup stacking
     * @protected
     */


    async _open(preventInitialFocus) {
      const prevented = !this.fireEvent("before-open", {}, true, false);

      if (prevented) {
        return;
      }

      if (this.isModal && !this.shouldHideBackdrop) {
        // create static area item ref for block layer
        this.getStaticAreaItemDomRef();
        this._blockLayerHidden = false;
        Popup.blockPageScrolling(this);
      }

      this._zIndex = (0, _PopupUtils.getNextZIndex)();
      this.style.zIndex = this._zIndex;
      this._focusedElementBeforeOpen = (0, _PopupUtils.getFocusedElement)();

      this._show();

      if (!this._disableInitialFocus && !preventInitialFocus) {
        this.applyInitialFocus();
      }

      this._addOpenedPopup();

      this.opened = true;
      this.open = true;
      await (0, _Render.renderFinished)();
      this.fireEvent("after-open", {}, false, false);
    }
    /**
     * Adds the popup to the "opened popups registry"
     * @protected
     */


    _addOpenedPopup() {
      (0, _OpenedPopupsRegistry.addOpenedPopup)(this);
    }
    /**
     * Hides the block layer (for modal popups only)
     * @public
     */


    close(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
      if (!this.opened) {
        return;
      }

      const prevented = !this.fireEvent("before-close", {
        escPressed
      }, true, false);

      if (prevented) {
        return;
      }

      if (this.isModal) {
        this._blockLayerHidden = true;
        Popup.unblockPageScrolling(this);
      }

      this.hide();
      this.opened = false;
      this.open = false;

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


    _removeOpenedPopup() {
      (0, _OpenedPopupsRegistry.removeOpenedPopup)(this);
    }
    /**
     * Returns the focus to the previously focused element
     * @protected
     */


    resetFocus() {
      if (!this._focusedElementBeforeOpen) {
        return;
      }

      this._focusedElementBeforeOpen.focus();

      this._focusedElementBeforeOpen = null;
    }
    /**
     * Sets "block" display to the popup. The property can be overriden by derivatives of Popup.
     * @protected
     */


    _show() {
      this.style.display = this._displayProp;
    }
    /**
     * Sets "none" display to the popup
     * @protected
     */


    hide() {
      this.style.display = "none";
    }
    /**
     * Implement this getter with relevant logic regarding the modality of the popup (e.g. based on a public property)
     *
     * @protected
     * @abstract
     * @returns {boolean}
     */


    get isModal() {} // eslint-disable-line

    /**
     * Implement this getter with relevant logic in order to hide the block layer (f.e. based on a public property)
     *
     * @protected
     * @abstract
     * @returns {boolean}
     */


    get shouldHideBackdrop() {} // eslint-disable-line

    /**
     * Return the ID of an element in the shadow DOM that is going to label this popup
     *
     * @protected
     * @abstract
     * @returns {string}
     */


    get _ariaLabelledBy() {} // eslint-disable-line

    /**
     * Return the value for aria-modal for this popup
     *
     * @protected
     * @abstract
     * @returns {string}
     */


    get _ariaModal() {} // eslint-disable-line

    /**
     * Ensures ariaLabel is never null or empty string
     * @returns {string|undefined}
     * @protected
     */


    get _ariaLabel() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }

    get _root() {
      return this.shadowRoot.querySelector(".ui5-popup-root");
    }

    get contentDOM() {
      return this.shadowRoot.querySelector(".ui5-popup-content");
    }

    get styles() {
      return {
        root: {},
        content: {},
        blockLayer: {
          "zIndex": this._zIndex - 1
        }
      };
    }

    get classes() {
      return {
        root: {
          "ui5-popup-root": true
        },
        content: {
          "ui5-popup-content": true
        }
      };
    }

  }

  var _default = Popup;
  _exports.default = _default;
});