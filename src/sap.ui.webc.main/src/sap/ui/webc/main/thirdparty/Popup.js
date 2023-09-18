sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/util/FocusableElements", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/util/getEffectiveScrollbarStyle", "sap/ui/webc/common/thirdparty/base/ManagedStyles", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/PopupUtils", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/MediaRange", "./generated/templates/PopupTemplate.lit", "./generated/templates/PopupBlockLayerTemplate.lit", "./types/PopupAccessibleRole", "./popup-utils/OpenedPopupsRegistry", "./generated/themes/Popup.css", "./generated/themes/PopupStaticAreaStyles.css", "./generated/themes/PopupGlobal.css"], function (_exports, _customElement, _Render, _event, _slot, _property, _LitRenderer, _UI5Element, _Device, _FocusableElements, _AriaLabelHelper, _getEffectiveScrollbarStyle, _ManagedStyles, _Keys, _PopupUtils, _ResizeHandler, _MediaRange, _PopupTemplate, _PopupBlockLayerTemplate, _PopupAccessibleRole, _OpenedPopupsRegistry, _Popup, _PopupStaticAreaStyles, _PopupGlobal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
  _property = _interopRequireDefault(_property);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _UI5Element = _interopRequireDefault(_UI5Element);
  _getEffectiveScrollbarStyle = _interopRequireDefault(_getEffectiveScrollbarStyle);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _MediaRange = _interopRequireDefault(_MediaRange);
  _PopupTemplate = _interopRequireDefault(_PopupTemplate);
  _PopupBlockLayerTemplate = _interopRequireDefault(_PopupBlockLayerTemplate);
  _PopupAccessibleRole = _interopRequireDefault(_PopupAccessibleRole);
  _Popup = _interopRequireDefault(_Popup);
  _PopupStaticAreaStyles = _interopRequireDefault(_PopupStaticAreaStyles);
  _PopupGlobal = _interopRequireDefault(_PopupGlobal);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Popup_1;

  // Styles

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
   * @alias sap.ui.webc.main.Popup
   * @extends sap.ui.webc.base.UI5Element
   * @public
   */
  let Popup = Popup_1 = class Popup extends _UI5Element.default {
    constructor() {
      super();
      this._resizeHandler = this._resize.bind(this);
    }
    onBeforeRendering() {
      this._blockLayerHidden = !this.isOpen() || !this.isTopModalPopup;
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._resizeHandler);
    }
    onExitDOM() {
      if (this.isOpen()) {
        Popup_1.unblockPageScrolling(this);
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
    _preventBlockLayerFocus(e) {
      e.preventDefault();
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
      const isTabOutAttempt = e.target === this._root && (0, _Keys.isTabPrevious)(e);
      // if the popup is closed, focus is already moved, so Enter keydown may result in click on the newly focused element
      const isEnterOnClosedPopupChild = (0, _Keys.isEnter)(e) && !this.isOpen();
      if (isTabOutAttempt || isEnterOnClosedPopupChild) {
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
      if (!(0, _Device.isSafari)()) {
        // Remove when adopting native dialog
        this._root.removeAttribute("tabindex");
      }
      if (this.shadowRoot.contains(e.target)) {
        this._shouldFocusRoot = true;
      } else {
        this._shouldFocusRoot = false;
      }
    }
    _onmouseup() {
      if (!(0, _Device.isSafari)()) {
        // Remove when adopting native dialog
        this._root.tabIndex = -1;
      }
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
     * @method
     * @name sap.ui.webc.main.Popup#applyFocus
     * @async
     * @returns {Promise} Promise that resolves when the focus is applied
     */
    async applyFocus() {
      await this._waitForDomRef();
      if (this.getRootNode() === this) {
        return;
      }
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
     * @method
     * @name sap.ui.webc.main.Popup#isOpen
     * @returns {boolean}
     */
    isOpen() {
      return this.opened;
    }
    isFocusWithin() {
      return (0, _PopupUtils.isFocusedElementWithinNode)(this._root);
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
        Popup_1.blockPageScrolling(this);
      }
      this._zIndex = (0, _PopupUtils.getNextZIndex)();
      this.style.zIndex = this._zIndex?.toString() || "";
      this._focusedElementBeforeOpen = (0, _PopupUtils.getFocusedElement)();
      this._show();
      this._addOpenedPopup();
      this.opened = true;
      this.open = true;
      await (0, _Render.renderFinished)();
      if (!this._disableInitialFocus && !preventInitialFocus) {
        await this.applyInitialFocus();
      }
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
     * Closes the popup.
     * @public
     * @method
     * @name sap.ui.webc.main.Popup#close
     * @returns {void}
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
        Popup_1.unblockPageScrolling(this);
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
     * Ensures ariaLabel is never null or empty string
     * @returns {string | undefined}
     * @protected
     */
    get _ariaLabel() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get _root() {
      return this.shadowRoot.querySelector(".ui5-popup-root");
    }
    get _role() {
      return this.accessibleRole === _PopupAccessibleRole.default.None ? undefined : this.accessibleRole.toLowerCase();
    }
    get _ariaModal() {
      return this.accessibleRole === _PopupAccessibleRole.default.None ? undefined : "true";
    }
    get contentDOM() {
      return this.shadowRoot.querySelector(".ui5-popup-content");
    }
    get styles() {
      return {
        root: {},
        content: {},
        blockLayer: {
          "zIndex": this._zIndex ? this._zIndex - 1 : ""
        }
      };
    }
    get classes() {
      return {
        root: {
          "ui5-popup-root": true,
          "ui5-content-native-scrollbars": (0, _getEffectiveScrollbarStyle.default)()
        },
        content: {
          "ui5-popup-content": true
        }
      };
    }
  };
  __decorate([(0, _property.default)()], Popup.prototype, "initialFocus", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Popup.prototype, "preventFocusRestore", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Popup.prototype, "open", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], Popup.prototype, "opened", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], Popup.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], Popup.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: _PopupAccessibleRole.default,
    defaultValue: _PopupAccessibleRole.default.Dialog
  })], Popup.prototype, "accessibleRole", void 0);
  __decorate([(0, _property.default)()], Popup.prototype, "mediaRange", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Popup.prototype, "_disableInitialFocus", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Popup.prototype, "_blockLayerHidden", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], Popup.prototype, "isTopModalPopup", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], Popup.prototype, "content", void 0);
  Popup = Popup_1 = __decorate([(0, _customElement.default)({
    renderer: _LitRenderer.default,
    styles: _Popup.default,
    template: _PopupTemplate.default,
    staticAreaTemplate: _PopupBlockLayerTemplate.default,
    staticAreaStyles: _PopupStaticAreaStyles.default
  })
  /**
   * Fired before the component is opened. This event can be cancelled, which will prevent the popup from opening. <b>This event does not bubble.</b>
   *
   * @public
   * @event sap.ui.webc.main.Popup#before-open
   * @allowPreventDefault
   */, (0, _event.default)("before-open")
  /**
   * Fired after the component is opened. <b>This event does not bubble.</b>
   *
   * @public
   * @event sap.ui.webc.main.Popup#after-open
   */, (0, _event.default)("after-open")
  /**
   * Fired before the component is closed. This event can be cancelled, which will prevent the popup from closing. <b>This event does not bubble.</b>
   *
   * @public
   * @event sap.ui.webc.main.Popup#before-close
   * @allowPreventDefault
   * @param {boolean} escPressed Indicates that <code>ESC</code> key has triggered the event.
   */, (0, _event.default)("before-close", {
    escPressed: {
      type: Boolean
    }
  })
  /**
   * Fired after the component is closed. <b>This event does not bubble.</b>
   *
   * @public
   * @event sap.ui.webc.main.Popup#after-close
   */, (0, _event.default)("after-close")
  /**
   * Fired whenever the popup content area is scrolled
   *
   * @private
   * @event sap.ui.webc.main.Popup#scroll
   */, (0, _event.default)("scroll")], Popup);
  var _default = Popup;
  _exports.default = _default;
});