sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/util/clamp", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./Popup", "./Icon", "sap/ui/webc/common/thirdparty/icons/resize-corner", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/information", "./generated/i18n/i18n-defaults", "./generated/templates/DialogTemplate.lit", "./generated/themes/BrowserScrollbar.css", "./generated/themes/PopupsCommon.css", "./generated/themes/Dialog.css", "./types/PopupAccessibleRole"], function (_exports, _Device, _customElement, _slot, _property, _clamp, _Keys, _ValueState, _i18nBundle, _Popup, _Icon, _resizeCorner, _error, _alert, _sysEnter, _information, _i18nDefaults, _DialogTemplate, _BrowserScrollbar, _PopupsCommon, _Dialog, _PopupAccessibleRole) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _slot = _interopRequireDefault(_slot);
  _property = _interopRequireDefault(_property);
  _clamp = _interopRequireDefault(_clamp);
  _ValueState = _interopRequireDefault(_ValueState);
  _Popup = _interopRequireDefault(_Popup);
  _Icon = _interopRequireDefault(_Icon);
  _DialogTemplate = _interopRequireDefault(_DialogTemplate);
  _BrowserScrollbar = _interopRequireDefault(_BrowserScrollbar);
  _PopupsCommon = _interopRequireDefault(_PopupsCommon);
  _Dialog = _interopRequireDefault(_Dialog);
  _PopupAccessibleRole = _interopRequireDefault(_PopupAccessibleRole);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Dialog_1;

  // Template

  // Styles

  /**
   * Defines the step size at which this component would change by when being dragged or resized with the keyboard.
   */
  const STEP_SIZE = 16;
  /**
   * Defines the icons corresponding to the dialog's state.
   */
  const ICON_PER_STATE = {
    [_ValueState.default.Error]: "error",
    [_ValueState.default.Warning]: "alert",
    [_ValueState.default.Success]: "sys-enter-2",
    [_ValueState.default.Information]: "information"
  };
  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-dialog</code> component is used to temporarily display some information in a
   * size-limited window in front of the regular app screen.
   * It is used to prompt the user for an action or a confirmation.
   * The <code>ui5-dialog</code> interrupts the current app processing as it is the only focused UI element and
   * the main screen is dimmed/blocked.
   * The dialog combines concepts known from other technologies where the windows have
   * names such as dialog box, dialog window, pop-up, pop-up window, alert box, or message box.
   * <br><br>
   * The <code>ui5-dialog</code> is modal, which means that an user action is required before it is possible to return to the parent window.
   * To open multiple dialogs, each dialog element should be separate in the markup. This will ensure the correct modal behavior. Avoid nesting dialogs within each other.
   * The content of the <code>ui5-dialog</code> is fully customizable.
   *
   * <h3>Structure</h3>
   * A <code>ui5-dialog</code> consists of a header, content, and a footer for action buttons.
   * The <code>ui5-dialog</code> is usually displayed at the center of the screen.
   * Its position can be changed by the user. To enable this, you need to set the property <code>draggable</code> accordingly.
  
   *
   * <h3>Responsive Behavior</h3>
   * The <code>stretch</code> property can be used to stretch the
   * <code>ui5-dialog</code> on full screen.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-dialog</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>header - Used to style the header of the component</li>
   * <li>content - Used to style the content of the component</li>
   * <li>footer - Used to style the footer of the component</li>
   * </ul>
   * <b>Note:</b> When a <code>ui5-bar</code> is used in the header or in the footer, you should remove the default dialog's paddings.
   * <br>
   * For more information see the sample "Bar in Header/Footer".
  
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Dialog";</code>
   *
   * <b>Note:</b> We don't recommend nesting popup-like components (<code>ui5-dialog</code>, <code>ui5-popover</code>) inside <code>ui5-dialog</code>.
   * Ideally you should create all popups on the same level inside your HTML page and just open them from one another, rather than nesting them.
   *
   * <b>Note:</b> We don't recommend nesting popup-like components (<code>ui5-dialog</code>, <code>ui5-popover</code>) inside other components containing z-index.
   * This might break z-index management.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Dialog
   * @extends sap.ui.webc.main.Popup
   * @tagname ui5-dialog
   * @public
   */
  let Dialog = Dialog_1 = class Dialog extends _Popup.default {
    constructor() {
      super();
      this._draggedOrResized = false;
      this._revertSize = () => {
        Object.assign(this.style, {
          top: "",
          left: "",
          width: "",
          height: ""
        });
      };
      this._screenResizeHandler = this._screenResize.bind(this);
      this._dragMouseMoveHandler = this._onDragMouseMove.bind(this);
      this._dragMouseUpHandler = this._onDragMouseUp.bind(this);
      this._resizeMouseMoveHandler = this._onResizeMouseMove.bind(this);
      this._resizeMouseUpHandler = this._onResizeMouseUp.bind(this);
      this._dragStartHandler = this._handleDragStart.bind(this);
    }
    static async onDefine() {
      Dialog_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    static _isHeader(element) {
      return element.classList.contains("ui5-popup-header-root") || element.getAttribute("slot") === "header";
    }
    /**
     * Shows the dialog.
     *
     * @param {boolean} [preventInitialFocus=false] Prevents applying the focus inside the popup
     * @public
     * @method
     * @name sap.ui.webc.main.Dialog#show
     * @async
     * @returns {Promise} Resolves when the dialog is open
     */
    async show(preventInitialFocus = false) {
      await super._open(preventInitialFocus);
    }
    get isModal() {
      return true;
    }
    get shouldHideBackdrop() {
      return false;
    }
    get _ariaLabelledBy() {
      let ariaLabelledById;
      if (this.headerText !== "" && !this._ariaLabel) {
        ariaLabelledById = "ui5-popup-header-text";
      }
      return ariaLabelledById;
    }
    get ariaRoleDescriptionHeaderText() {
      return this.resizable || this.draggable ? Dialog_1.i18nBundle.getText(_i18nDefaults.DIALOG_HEADER_ARIA_ROLE_DESCRIPTION) : undefined;
    }
    get effectiveAriaDescribedBy() {
      return this.resizable || this.draggable ? `${this._id}-descr` : undefined;
    }
    get ariaDescribedByHeaderTextResizable() {
      return Dialog_1.i18nBundle.getText(_i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_RESIZABLE);
    }
    get ariaDescribedByHeaderTextDraggable() {
      return Dialog_1.i18nBundle.getText(_i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE);
    }
    get ariaDescribedByHeaderTextDraggableAndResizable() {
      return Dialog_1.i18nBundle.getText(_i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE_RESIZABLE);
    }
    get _displayProp() {
      return "flex";
    }
    /**
     * Determines if the header should be shown.
     */
    get _displayHeader() {
      return this.header.length || this.headerText || this.draggable || this.resizable;
    }
    get _movable() {
      return !this.stretch && this.onDesktop && (this.draggable || this.resizable);
    }
    get _headerTabIndex() {
      return this._movable ? "0" : undefined;
    }
    get _showResizeHandle() {
      return this.resizable && this.onDesktop;
    }
    get _minHeight() {
      let minHeight = Number.parseInt(window.getComputedStyle(this.contentDOM).minHeight);
      const header = this._root.querySelector(".ui5-popup-header-root");
      if (header) {
        minHeight += header.offsetHeight;
      }
      const footer = this._root.querySelector(".ui5-popup-footer-root");
      if (footer) {
        minHeight += footer.offsetHeight;
      }
      return minHeight;
    }
    get hasValueState() {
      return this.state !== _ValueState.default.None;
    }
    get _dialogStateIcon() {
      return ICON_PER_STATE[this.state];
    }
    get _role() {
      if (this.accessibleRole === _PopupAccessibleRole.default.None) {
        return undefined;
      }
      if (this.state === _ValueState.default.Error || this.state === _ValueState.default.Warning) {
        return _PopupAccessibleRole.default.AlertDialog.toLowerCase();
      }
      return this.accessibleRole.toLowerCase();
    }
    _show() {
      super._show();
      this._center();
    }
    onBeforeRendering() {
      super.onBeforeRendering();
      this._isRTL = this.effectiveDir === "rtl";
      this.onPhone = (0, _Device.isPhone)();
      this.onDesktop = (0, _Device.isDesktop)();
    }
    onAfterRendering() {
      if (!this.isOpen() && this.open) {
        this.show();
      } else if (this.isOpen() && !this.open) {
        this.close();
      }
    }
    onEnterDOM() {
      super.onEnterDOM();
      this._attachScreenResizeHandler();
      this.addEventListener("dragstart", this._dragStartHandler);
    }
    onExitDOM() {
      super.onExitDOM();
      this._detachScreenResizeHandler();
      this.removeEventListener("dragstart", this._dragStartHandler);
    }
    /**
     * @override
     */
    _resize() {
      super._resize();
      if (!this._draggedOrResized) {
        this._center();
      }
    }
    _screenResize() {
      this._center();
    }
    _attachScreenResizeHandler() {
      if (!this._screenResizeHandlerAttached) {
        window.addEventListener("resize", this._screenResizeHandler);
        this._screenResizeHandlerAttached = true;
      }
    }
    _detachScreenResizeHandler() {
      if (this._screenResizeHandlerAttached) {
        window.removeEventListener("resize", this._screenResizeHandler);
        this._screenResizeHandlerAttached = false; // prevent dialog from repositioning during resizing
      }
    }

    _center() {
      const height = window.innerHeight - this.offsetHeight,
        width = window.innerWidth - this.offsetWidth;
      Object.assign(this.style, {
        top: `${Math.round(height / 2)}px`,
        left: `${Math.round(width / 2)}px`
      });
    }
    /**
     * Event handlers
     */
    _onDragMouseDown(e) {
      // allow dragging only on the header
      if (!this._movable || !this.draggable || !Dialog_1._isHeader(e.target)) {
        return;
      }
      e.preventDefault();
      const {
        top,
        left
      } = this.getBoundingClientRect();
      const {
        width,
        height
      } = window.getComputedStyle(this);
      Object.assign(this.style, {
        top: `${top}px`,
        left: `${left}px`,
        width: `${Math.round(Number.parseFloat(width) * 100) / 100}px`,
        height: `${Math.round(Number.parseFloat(height) * 100) / 100}px`
      });
      this._x = e.clientX;
      this._y = e.clientY;
      this._draggedOrResized = true;
      this._attachMouseDragHandlers();
    }
    _onDragMouseMove(e) {
      e.preventDefault();
      const {
        clientX,
        clientY
      } = e;
      const calcX = this._x - clientX;
      const calcY = this._y - clientY;
      const {
        left,
        top
      } = this.getBoundingClientRect();
      Object.assign(this.style, {
        left: `${Math.floor(left - calcX)}px`,
        top: `${Math.floor(top - calcY)}px`
      });
      this._x = clientX;
      this._y = clientY;
    }
    _onDragMouseUp() {
      delete this._x;
      delete this._y;
      this._detachMouseDragHandlers();
    }
    _onDragOrResizeKeyDown(e) {
      if (!this._movable || !Dialog_1._isHeader(e.target)) {
        return;
      }
      if (this.draggable && [_Keys.isUp, _Keys.isDown, _Keys.isLeft, _Keys.isRight].some(key => key(e))) {
        this._dragWithEvent(e);
        return;
      }
      if (this.resizable && [_Keys.isUpShift, _Keys.isDownShift, _Keys.isLeftShift, _Keys.isRightShift].some(key => key(e))) {
        this._resizeWithEvent(e);
      }
    }
    _dragWithEvent(e) {
      const {
        top,
        left,
        width,
        height
      } = this.getBoundingClientRect();
      let newPos = 0;
      let posDirection = "top";
      switch (true) {
        case (0, _Keys.isUp)(e):
          newPos = top - STEP_SIZE;
          posDirection = "top";
          break;
        case (0, _Keys.isDown)(e):
          newPos = top + STEP_SIZE;
          posDirection = "top";
          break;
        case (0, _Keys.isLeft)(e):
          newPos = left - STEP_SIZE;
          posDirection = "left";
          break;
        case (0, _Keys.isRight)(e):
          newPos = left + STEP_SIZE;
          posDirection = "left";
          break;
      }
      newPos = (0, _clamp.default)(newPos, 0, posDirection === "left" ? window.innerWidth - width : window.innerHeight - height);
      this.style[posDirection] = `${newPos}px`;
    }
    _resizeWithEvent(e) {
      this._draggedOrResized = true;
      this.addEventListener("ui5-before-close", this._revertSize, {
        once: true
      });
      const {
          top,
          left
        } = this.getBoundingClientRect(),
        style = window.getComputedStyle(this),
        minWidth = Number.parseFloat(style.minWidth),
        maxWidth = window.innerWidth - left,
        maxHeight = window.innerHeight - top;
      let width = Number.parseFloat(style.width),
        height = Number.parseFloat(style.height);
      switch (true) {
        case (0, _Keys.isUpShift)(e):
          height -= STEP_SIZE;
          break;
        case (0, _Keys.isDownShift)(e):
          height += STEP_SIZE;
          break;
        case (0, _Keys.isLeftShift)(e):
          width -= STEP_SIZE;
          break;
        case (0, _Keys.isRightShift)(e):
          width += STEP_SIZE;
          break;
      }
      width = (0, _clamp.default)(width, minWidth, maxWidth);
      height = (0, _clamp.default)(height, this._minHeight, maxHeight);
      Object.assign(this.style, {
        width: `${width}px`,
        height: `${height}px`
      });
    }
    _attachMouseDragHandlers() {
      window.addEventListener("mousemove", this._dragMouseMoveHandler);
      window.addEventListener("mouseup", this._dragMouseUpHandler);
    }
    _detachMouseDragHandlers() {
      window.removeEventListener("mousemove", this._dragMouseMoveHandler);
      window.removeEventListener("mouseup", this._dragMouseUpHandler);
    }
    _onResizeMouseDown(e) {
      if (!this._movable || !this.resizable) {
        return;
      }
      e.preventDefault();
      const {
        top,
        left
      } = this.getBoundingClientRect();
      const {
        width,
        height,
        minWidth
      } = window.getComputedStyle(this);
      this._initialX = e.clientX;
      this._initialY = e.clientY;
      this._initialWidth = Number.parseFloat(width);
      this._initialHeight = Number.parseFloat(height);
      this._initialTop = top;
      this._initialLeft = left;
      this._minWidth = Number.parseFloat(minWidth);
      this._cachedMinHeight = this._minHeight;
      Object.assign(this.style, {
        top: `${top}px`,
        left: `${left}px`
      });
      this._draggedOrResized = true;
      this._attachMouseResizeHandlers();
    }
    _onResizeMouseMove(e) {
      const {
        clientX,
        clientY
      } = e;
      let newWidth, newLeft;
      if (this._isRTL) {
        newWidth = (0, _clamp.default)(this._initialWidth - (clientX - this._initialX), this._minWidth, this._initialLeft + this._initialWidth);
        newLeft = (0, _clamp.default)(this._initialLeft + (clientX - this._initialX), 0, this._initialX + this._initialWidth - this._minWidth);
      } else {
        newWidth = (0, _clamp.default)(this._initialWidth + (clientX - this._initialX), this._minWidth, window.innerWidth - this._initialLeft);
      }
      const newHeight = (0, _clamp.default)(this._initialHeight + (clientY - this._initialY), this._cachedMinHeight, window.innerHeight - this._initialTop);
      Object.assign(this.style, {
        height: `${newHeight}px`,
        width: `${newWidth}px`,
        left: newLeft ? `${newLeft}px` : undefined
      });
    }
    _onResizeMouseUp() {
      delete this._initialX;
      delete this._initialY;
      delete this._initialWidth;
      delete this._initialHeight;
      delete this._initialTop;
      delete this._initialLeft;
      delete this._minWidth;
      delete this._cachedMinHeight;
      this._detachMouseResizeHandlers();
    }
    _handleDragStart(e) {
      if (this.draggable) {
        e.preventDefault();
      }
    }
    _attachMouseResizeHandlers() {
      window.addEventListener("mousemove", this._resizeMouseMoveHandler);
      window.addEventListener("mouseup", this._resizeMouseUpHandler);
      this.addEventListener("ui5-before-close", this._revertSize, {
        once: true
      });
    }
    _detachMouseResizeHandlers() {
      window.removeEventListener("mousemove", this._resizeMouseMoveHandler);
      window.removeEventListener("mouseup", this._resizeMouseUpHandler);
    }
  };
  __decorate([(0, _property.default)()], Dialog.prototype, "headerText", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Dialog.prototype, "stretch", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Dialog.prototype, "draggable", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Dialog.prototype, "resizable", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], Dialog.prototype, "state", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Dialog.prototype, "onPhone", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Dialog.prototype, "onDesktop", void 0);
  __decorate([(0, _slot.default)()], Dialog.prototype, "header", void 0);
  __decorate([(0, _slot.default)()], Dialog.prototype, "footer", void 0);
  Dialog = Dialog_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-dialog",
    template: _DialogTemplate.default,
    styles: [_BrowserScrollbar.default, _PopupsCommon.default, _Dialog.default],
    dependencies: [_Icon.default]
  })], Dialog);
  Dialog.define();
  var _default = Dialog;
  _exports.default = _default;
});