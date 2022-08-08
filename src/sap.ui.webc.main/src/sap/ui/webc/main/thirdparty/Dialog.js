sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/util/clamp", "sap/ui/webc/common/thirdparty/base/Keys", "./Popup", "sap/ui/webc/common/thirdparty/icons/resize-corner", "./Icon", "./generated/templates/DialogTemplate.lit", "./generated/themes/BrowserScrollbar.css", "./generated/themes/PopupsCommon.css", "./generated/themes/Dialog.css"], function (_exports, _Device, _clamp, _Keys, _Popup, _resizeCorner, _Icon, _DialogTemplate, _BrowserScrollbar, _PopupsCommon, _Dialog) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _clamp = _interopRequireDefault(_clamp);
  _Popup = _interopRequireDefault(_Popup);
  _Icon = _interopRequireDefault(_Icon);
  _DialogTemplate = _interopRequireDefault(_DialogTemplate);
  _BrowserScrollbar = _interopRequireDefault(_BrowserScrollbar);
  _PopupsCommon = _interopRequireDefault(_PopupsCommon);
  _Dialog = _interopRequireDefault(_Dialog);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles

  /**
   * Defines the step size at which this component would change by when being dragged or resized with the keyboard.
   */
  const STEP_SIZE = 16;
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-dialog",
    slots:
    /** @lends sap.ui.webcomponents.main.Dialog.prototype */
    {
      /**
       * Defines the header HTML Element.
       * <br><br>
       * <b>Note:</b> If <code>header</code> slot is provided, the labelling of the dialog is a responsibility of the application developer.
       * <code>accessibleName</code> should be used.
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
    properties:
    /** @lends sap.ui.webcomponents.main.Dialog.prototype */
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
       * Determines whether the component should be stretched to fullscreen.
       * <br><br>
       * <b>Note:</b> The component will be stretched to approximately
       * 90% of the viewport.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      stretch: {
        type: Boolean
      },

      /**
       * Determines whether the component is draggable.
       * If this property is set to true, the Dialog will be draggable by its header.
       * <br><br>
       * <b>Note:</b> The component can be draggable only in desktop mode.
       * @type {boolean}
       * @defaultvalue false
       * @since 1.0.0-rc.9
       * @public
       */
      draggable: {
        type: Boolean
      },

      /**
       * Configures the component to be resizable.
       * If this property is set to true, the Dialog will have a resize handle in its bottom right corner in LTR languages.
       * In RTL languages, the resize handle will be placed in the bottom left corner.
       * <br><br>
       * <b>Note:</b> The component can be resizable only in desktop mode.
       * <br>
       * <b>Note:</b> Upon resizing, externally defined height and width styling will be ignored.
       * @type {boolean}
       * @defaultvalue false
       * @since 1.0.0-rc.10
       * @public
       */
      resizable: {
        type: Boolean
      },

      /**
       * @private
       */
      onPhone: {
        type: Boolean
      },

      /**
       * @private
       */
      onDesktop: {
        type: Boolean
      }
    }
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
   * The <code>ui5-dialog</code> is modal, which means that user action is required before returning to the parent window is possible.
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
   * @alias sap.ui.webcomponents.main.Dialog
   * @extends Popup
   * @tagname ui5-dialog
   * @public
   */

  class Dialog extends _Popup.default {
    constructor() {
      super();
      this._screenResizeHandler = this._center.bind(this);
      this._dragMouseMoveHandler = this._onDragMouseMove.bind(this);
      this._dragMouseUpHandler = this._onDragMouseUp.bind(this);
      this._resizeMouseMoveHandler = this._onResizeMouseMove.bind(this);
      this._resizeMouseUpHandler = this._onResizeMouseUp.bind(this);
    }

    static get metadata() {
      return metadata;
    }

    static get dependencies() {
      return [_Icon.default];
    }

    static get template() {
      return _DialogTemplate.default;
    }

    static get styles() {
      return [_BrowserScrollbar.default, _PopupsCommon.default, _Dialog.default];
    }

    static _isHeader(element) {
      return element.classList.contains("ui5-popup-header-root") || element.getAttribute("slot") === "header";
    }
    /**
     * Shows the dialog.
     *
     * @param {boolean} preventInitialFocus Prevents applying the focus inside the popup
     * @async
     * @returns {Promise} Resolves when the dialog is open
     * @public
     */


    async show(preventInitialFocus = false) {
      await super._open(preventInitialFocus);
    }

    get isModal() {
      // Required by Popup.js
      return true;
    }

    get shouldHideBackdrop() {
      // Required by Popup.js
      return false;
    }

    get _ariaLabelledBy() {
      // Required by Popup.js
      let ariaLabelledById;

      if (this.headerText !== "" && !this._ariaLabel) {
        ariaLabelledById = "ui5-popup-header-text";
      }

      return ariaLabelledById;
    }

    get _ariaModal() {
      // Required by Popup.js
      return true;
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

    _show() {
      super._show();

      this._center();
    }

    onBeforeRendering() {
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
    }

    onExitDOM() {
      super.onExitDOM();

      this._detachScreenResizeHandler();
    }
    /**
     * @override
     */


    _resize() {
      super._resize();

      if (this._screenResizeHandlerAttached) {
        this._center();
      }
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

    _revertSize() {
      Object.assign(this.style, {
        top: "",
        left: "",
        width: "",
        height: ""
      });
      this.removeEventListener("ui5-before-close", this._revertSize);
    }
    /**
     * Event handlers
     */


    _onDragMouseDown(event) {
      // allow dragging only on the header
      if (!this._movable || !this.draggable || !Dialog._isHeader(event.target)) {
        return;
      }

      event.preventDefault();
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
      this._x = event.clientX;
      this._y = event.clientY;

      this._attachMouseDragHandlers();
    }

    _onDragMouseMove(event) {
      event.preventDefault();
      const calcX = this._x - event.clientX;
      const calcY = this._y - event.clientY;
      const {
        left,
        top
      } = this.getBoundingClientRect();
      Object.assign(this.style, {
        left: `${Math.floor(left - calcX)}px`,
        top: `${Math.floor(top - calcY)}px`
      });
      this._x = event.clientX;
      this._y = event.clientY;
    }

    _onDragMouseUp() {
      this._x = null;
      this._y = null;

      this._detachMouseDragHandlers();
    }

    _onDragOrResizeKeyDown(event) {
      if (!this._movable || !Dialog._isHeader(event.target)) {
        return;
      }

      if (this.draggable && [_Keys.isUp, _Keys.isDown, _Keys.isLeft, _Keys.isRight].some(key => key(event))) {
        this._dragWithEvent(event);

        return;
      }

      if (this.resizable && [_Keys.isUpShift, _Keys.isDownShift, _Keys.isLeftShift, _Keys.isRightShift].some(key => key(event))) {
        this._resizeWithEvent(event);
      }
    }

    _dragWithEvent(event) {
      const {
        top,
        left,
        width,
        height
      } = this.getBoundingClientRect();
      let newPos, posDirection;

      switch (true) {
        case (0, _Keys.isUp)(event):
          newPos = top - STEP_SIZE;
          posDirection = "top";
          break;

        case (0, _Keys.isDown)(event):
          newPos = top + STEP_SIZE;
          posDirection = "top";
          break;

        case (0, _Keys.isLeft)(event):
          newPos = left - STEP_SIZE;
          posDirection = "left";
          break;

        case (0, _Keys.isRight)(event):
          newPos = left + STEP_SIZE;
          posDirection = "left";
          break;
      }

      newPos = (0, _clamp.default)(newPos, 0, posDirection === "left" ? window.innerWidth - width : window.innerHeight - height);
      this.style[posDirection] = `${newPos}px`;
    }

    _resizeWithEvent(event) {
      this._detachScreenResizeHandler();

      this.addEventListener("ui5-before-close", this._revertSize);
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
        case (0, _Keys.isUpShift)(event):
          height -= STEP_SIZE;
          break;

        case (0, _Keys.isDownShift)(event):
          height += STEP_SIZE;
          break;

        case (0, _Keys.isLeftShift)(event):
          width -= STEP_SIZE;
          break;

        case (0, _Keys.isRightShift)(event):
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
      this._detachScreenResizeHandler();

      window.addEventListener("mousemove", this._dragMouseMoveHandler);
      window.addEventListener("mouseup", this._dragMouseUpHandler);
    }

    _detachMouseDragHandlers() {
      window.removeEventListener("mousemove", this._dragMouseMoveHandler);
      window.removeEventListener("mouseup", this._dragMouseUpHandler);
    }

    _onResizeMouseDown(event) {
      if (!this._movable || !this.resizable) {
        return;
      }

      event.preventDefault();
      const {
        top,
        left
      } = this.getBoundingClientRect();
      const {
        width,
        height,
        minWidth
      } = window.getComputedStyle(this);
      this._initialX = event.clientX;
      this._initialY = event.clientY;
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

      this._attachMouseResizeHandlers();
    }

    _onResizeMouseMove(event) {
      const {
        clientX,
        clientY
      } = event;
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

    _attachMouseResizeHandlers() {
      this._detachScreenResizeHandler();

      window.addEventListener("mousemove", this._resizeMouseMoveHandler);
      window.addEventListener("mouseup", this._resizeMouseUpHandler);
      this.addEventListener("ui5-before-close", this._revertSize);
    }

    _detachMouseResizeHandlers() {
      window.removeEventListener("mousemove", this._resizeMouseMoveHandler);
      window.removeEventListener("mouseup", this._resizeMouseUpHandler);
    }

  }

  Dialog.define();
  var _default = Dialog;
  _exports.default = _default;
});