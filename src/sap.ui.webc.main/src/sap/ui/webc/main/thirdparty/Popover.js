sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/util/PopupUtils", "sap/ui/webc/common/thirdparty/base/util/clamp", "./Popup", "./types/PopoverPlacementType", "./types/PopoverVerticalAlign", "./types/PopoverHorizontalAlign", "./popup-utils/PopoverRegistry", "./generated/templates/PopoverTemplate.lit", "./generated/themes/BrowserScrollbar.css", "./generated/themes/PopupsCommon.css", "./generated/themes/Popover.css"], function (_exports, _Integer, _Device, _PopupUtils, _clamp, _Popup, _PopoverPlacementType, _PopoverVerticalAlign, _PopoverHorizontalAlign, _PopoverRegistry, _PopoverTemplate, _BrowserScrollbar, _PopupsCommon, _Popover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Integer = _interopRequireDefault(_Integer);
  _clamp = _interopRequireDefault(_clamp);
  _Popup = _interopRequireDefault(_Popup);
  _PopoverPlacementType = _interopRequireDefault(_PopoverPlacementType);
  _PopoverVerticalAlign = _interopRequireDefault(_PopoverVerticalAlign);
  _PopoverHorizontalAlign = _interopRequireDefault(_PopoverHorizontalAlign);
  _PopoverTemplate = _interopRequireDefault(_PopoverTemplate);
  _BrowserScrollbar = _interopRequireDefault(_BrowserScrollbar);
  _PopupsCommon = _interopRequireDefault(_PopupsCommon);
  _Popover = _interopRequireDefault(_Popover);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Template
  // Styles
  const ARROW_SIZE = 8;
  /**
   * @public
   */

  const metadata = {
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
       * Determines on which side the component is placed at.
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
        type: _PopoverPlacementType.default,
        defaultValue: _PopoverPlacementType.default.Right
      },

      /**
       * Determines the horizontal alignment of the component.
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
        type: _PopoverHorizontalAlign.default,
        defaultValue: _PopoverHorizontalAlign.default.Center
      },

      /**
       * Determines the vertical alignment of the component.
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
        type: _PopoverVerticalAlign.default,
        defaultValue: _PopoverVerticalAlign.default.Center
      },

      /**
       * Defines whether the component should close when
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
       * Defines whether the block layer will be shown if modal property is set to true.
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.10
       */
      hideBackdrop: {
        type: Boolean
      },

      /**
       * Determines whether the component arrow is hidden.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.15
       */
      hideArrow: {
        type: Boolean
      },

      /**
       * Determines if there is no enough space, the component can be placed
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
       * Defines the opener id of the element that the popover is shown at
       * @public
       * @type {String}
       * @defaultvalue ""
       * @since 1.2.0
       */
      opener: {
        type: String
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
        type: _Integer.default,
        defaultValue: 0,
        noAttribute: true
      },

      /**
       * Sets the Y translation of the arrow
       *
       * @private
       */
      arrowTranslateY: {
        type: _Integer.default,
        defaultValue: 0,
        noAttribute: true
      },

      /**
       * Returns the calculated placement depending on the free space
       *
       * @private
       */
      actualPlacementType: {
        type: _PopoverPlacementType.default,
        defaultValue: _PopoverPlacementType.default.Right
      },
      _maxHeight: {
        type: _Integer.default,
        noAttribute: true
      },
      _maxWidth: {
        type: _Integer.default,
        noAttribute: true
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
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-popover</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>header - Used to style the header of the component</li>
   * <li>content - Used to style the content of the component</li>
   * <li>footer - Used to style the footer of the component</li>
   * </ul>
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

  class Popover extends _Popup.default {
    constructor() {
      super();
    }

    static get metadata() {
      return metadata;
    }

    static get styles() {
      return [_BrowserScrollbar.default, _PopupsCommon.default, _Popover.default];
    }

    static get template() {
      return _PopoverTemplate.default;
    }

    static get VIEWPORT_MARGIN() {
      return 10; // px
    }

    onAfterRendering() {
      if (!this.isOpen() && this.open) {
        const opener = document.getElementById(this.opener);

        if (!opener) {
          console.warn("Valid opener id is required."); // eslint-disable-line

          return;
        }

        this.showAt(opener);
      } else if (this.isOpen() && !this.open) {
        this.close();
      }
    }

    isOpenerClicked(event) {
      const target = event.target;
      return target === this._opener || target.getFocusDomRef && target.getFocusDomRef() === this._opener || event.composedPath().indexOf(this._opener) > -1;
    }
    /**
     * Shows the popover.
     * @param {HTMLElement} opener the element that the popover is shown at
     * @param {boolean} preventInitialFocus prevents applying the focus inside the popover
     * @public
     * @async
     * @returns {Promise} Resolved when the popover is open
     */


    async showAt(opener, preventInitialFocus = false) {
      if (!opener || this.opened) {
        return;
      }

      this._opener = opener;
      this._openerRect = opener.getBoundingClientRect();
      await super._open(preventInitialFocus);
    }
    /**
     * Override for the _addOpenedPopup hook, which would otherwise just call addOpenedPopup(this)
     * @private
     */


    _addOpenedPopup() {
      (0, _PopoverRegistry.addOpenedPopover)(this);
    }
    /**
     * Override for the _removeOpenedPopup hook, which would otherwise just call removeOpenedPopup(this)
     * @private
     */


    _removeOpenedPopup() {
      (0, _PopoverRegistry.removeOpenedPopover)(this);
    }

    shouldCloseDueToOverflow(placement, openerRect) {
      const threshold = 32;
      const limits = {
        "Right": openerRect.right,
        "Left": openerRect.left,
        "Top": openerRect.top,
        "Bottom": openerRect.bottom
      };
      const closedPopupParent = (0, _PopupUtils.getClosedPopupParent)(this._opener);
      let overflowsBottom = false;
      let overflowsTop = false;

      if (closedPopupParent.showAt) {
        const contentRect = closedPopupParent.contentDOM.getBoundingClientRect();
        overflowsBottom = openerRect.top > contentRect.top + contentRect.height;
        overflowsTop = openerRect.top + openerRect.height < contentRect.top;
      }

      return limits[placement] < 0 || limits[placement] + threshold > closedPopupParent.innerHeight || overflowsBottom || overflowsTop;
    }

    shouldCloseDueToNoOpener(openerRect) {
      return openerRect.top === 0 && openerRect.bottom === 0 && openerRect.left === 0 && openerRect.right === 0;
    }

    isOpenerOutsideViewport(openerRect) {
      return openerRect.bottom < 0 || openerRect.top > window.innerHeight || openerRect.right < 0 || openerRect.left > window.innerWidth;
    }
    /**
     * @override
     */


    _resize() {
      super._resize();

      if (this.opened) {
        this.reposition();
      }
    }

    reposition() {
      this._show();
    }

    _show() {
      let placement;
      const popoverSize = this.getPopoverSize();

      if (popoverSize.width === 0 || popoverSize.height === 0) {
        // size can not be determined properly at this point, popover will be shown with the next reposition
        return;
      }

      if (this.isOpen()) {
        // update opener rect if it was changed during the popover being opened
        this._openerRect = this._opener.getBoundingClientRect();
      }

      if (this.shouldCloseDueToNoOpener(this._openerRect) && this.isFocusWithin()) {
        // reuse the old placement as the opener is not available,
        // but keep the popover open as the focus is within
        placement = this._oldPlacement;
      } else {
        placement = this.calcPlacement(this._openerRect, popoverSize);
      }

      const stretching = this.horizontalAlign === _PopoverHorizontalAlign.default.Stretch;

      if (this._preventRepositionAndClose || this.isOpenerOutsideViewport(this._openerRect)) {
        return this.close();
      }

      this._oldPlacement = placement;
      this.actualPlacementType = placement.placementType;
      let left = (0, _clamp.default)(this._left, Popover.VIEWPORT_MARGIN, document.documentElement.clientWidth - popoverSize.width - Popover.VIEWPORT_MARGIN);

      if (this.actualPlacementType === _PopoverPlacementType.default.Right) {
        left = Math.max(left, this._left);
      }

      let top = (0, _clamp.default)(this._top, Popover.VIEWPORT_MARGIN, document.documentElement.clientHeight - popoverSize.height - Popover.VIEWPORT_MARGIN);

      if (this.actualPlacementType === _PopoverPlacementType.default.Bottom) {
        top = Math.max(top, this._top);
      }

      this.arrowTranslateX = placement.arrow.x;
      this.arrowTranslateY = placement.arrow.y;
      top = this._adjustForIOSKeyboard(top);
      Object.assign(this.style, {
        top: `${top}px`,
        left: `${left}px`
      });

      super._show();

      if (stretching && this._width) {
        this.style.width = this._width;
      }
    }
    /**
     * Adjust the desired top position to compensate for shift of the screen
     * caused by opened keyboard on iOS which affects all elements with position:fixed.
     * @private
     * @param {int} top The target top in px.
     * @returns {int} The adjusted top in px.
     */


    _adjustForIOSKeyboard(top) {
      if (!(0, _Device.isIOS)()) {
        return top;
      }

      const actualTop = Math.ceil(this.getBoundingClientRect().top);
      return top + (Number.parseInt(this.style.top || "0") - actualTop);
    }

    getPopoverSize() {
      if (!this.opened) {
        Object.assign(this.style, {
          display: "block",
          top: "-10000px",
          left: "-10000px"
        });
      }

      const rect = this.getBoundingClientRect(),
            width = rect.width,
            height = rect.height;
      return {
        width,
        height
      };
    }

    get arrowDOM() {
      return this.shadowRoot.querySelector(".ui5-popover-arrow");
    }
    /**
     * @private
     */


    calcPlacement(targetRect, popoverSize) {
      let left = 0;
      let top = 0;
      const allowTargetOverlap = this.allowTargetOverlap;
      const clientWidth = document.documentElement.clientWidth;
      const clientHeight = document.documentElement.clientHeight;
      let maxHeight = clientHeight;
      let maxWidth = clientWidth;
      const placementType = this.getActualPlacementType(targetRect, popoverSize);
      this._preventRepositionAndClose = this.shouldCloseDueToNoOpener(targetRect) || this.shouldCloseDueToOverflow(placementType, targetRect);
      const isVertical = placementType === _PopoverPlacementType.default.Top || placementType === _PopoverPlacementType.default.Bottom;

      if (this.horizontalAlign === _PopoverHorizontalAlign.default.Stretch && isVertical) {
        popoverSize.width = targetRect.width;
        this._width = `${targetRect.width}px`;
      } else if (this.verticalAlign === _PopoverVerticalAlign.default.Stretch && !isVertical) {
        popoverSize.height = targetRect.height;
      }

      const arrowOffset = this.hideArrow ? 0 : ARROW_SIZE; // calc popover positions

      switch (placementType) {
        case _PopoverPlacementType.default.Top:
          left = this.getVerticalLeft(targetRect, popoverSize);
          top = Math.max(targetRect.top - popoverSize.height - arrowOffset, 0);

          if (!allowTargetOverlap) {
            maxHeight = targetRect.top - arrowOffset;
          }

          break;

        case _PopoverPlacementType.default.Bottom:
          left = this.getVerticalLeft(targetRect, popoverSize);
          top = targetRect.bottom + arrowOffset;

          if (allowTargetOverlap) {
            top = Math.max(Math.min(top, clientHeight - popoverSize.height), 0);
          } else {
            maxHeight = clientHeight - targetRect.bottom - arrowOffset;
          }

          break;

        case _PopoverPlacementType.default.Left:
          left = Math.max(targetRect.left - popoverSize.width - arrowOffset, 0);
          top = this.getHorizontalTop(targetRect, popoverSize);

          if (!allowTargetOverlap) {
            maxWidth = targetRect.left - arrowOffset;
          }

          break;

        case _PopoverPlacementType.default.Right:
          left = targetRect.left + targetRect.width + arrowOffset;
          top = this.getHorizontalTop(targetRect, popoverSize);

          if (allowTargetOverlap) {
            left = Math.max(Math.min(left, clientWidth - popoverSize.width), 0);
          } else {
            maxWidth = clientWidth - targetRect.right - arrowOffset;
          }

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

      this._maxHeight = Math.round(maxHeight - Popover.VIEWPORT_MARGIN);
      this._maxWidth = Math.round(maxWidth - Popover.VIEWPORT_MARGIN);

      if (this._left === undefined || Math.abs(this._left - left) > 1.5) {
        this._left = Math.round(left);
      }

      if (this._top === undefined || Math.abs(this._top - top) > 1.5) {
        this._top = Math.round(top);
      }

      const borderRadius = Number.parseInt(window.getComputedStyle(this).getPropertyValue("border-radius"));
      const arrowPos = this.getArrowPosition(targetRect, popoverSize, left, top, isVertical, borderRadius);
      return {
        arrow: arrowPos,
        top: this._top,
        left: this._left,
        placementType
      };
    }
    /**
     * Calculates the position for the arrow.
     * @private
     * @param targetRect BoundingClientRect of the target element
     * @param {{width: number, height: number}} popoverSize Width and height of the popover
     * @param left Left offset of the popover
     * @param top Top offset of the popover
     * @param isVertical If the popover is positioned vertically to the target element
     * @param {number} borderRadius Value of the border-radius property
     * @returns {{x: number, y: number}} Arrow's coordinates
     */


    getArrowPosition(targetRect, {
      width,
      height
    }, left, top, isVertical, borderRadius) {
      let arrowXCentered = this.horizontalAlign === _PopoverHorizontalAlign.default.Center || this.horizontalAlign === _PopoverHorizontalAlign.default.Stretch;

      if (this.horizontalAlign === _PopoverHorizontalAlign.default.Right && left <= targetRect.left) {
        arrowXCentered = true;
      }

      if (this.horizontalAlign === _PopoverHorizontalAlign.default.Left && left + width >= targetRect.left + targetRect.width) {
        arrowXCentered = true;
      }

      let arrowTranslateX = 0;

      if (isVertical && arrowXCentered) {
        arrowTranslateX = targetRect.left + targetRect.width / 2 - left - width / 2;
      }

      let arrowTranslateY = 0;

      if (!isVertical) {
        arrowTranslateY = targetRect.top + targetRect.height / 2 - top - height / 2;
      } // Restricts the arrow's translate value along each dimension,
      // so that the arrow does not clip over the popover's rounded borders.


      const safeRangeForArrowY = height / 2 - borderRadius - ARROW_SIZE / 2;
      arrowTranslateY = (0, _clamp.default)(arrowTranslateY, -safeRangeForArrowY, safeRangeForArrowY);
      const safeRangeForArrowX = width / 2 - borderRadius - ARROW_SIZE / 2;
      arrowTranslateX = (0, _clamp.default)(arrowTranslateX, -safeRangeForArrowX, safeRangeForArrowX);
      return {
        x: Math.round(arrowTranslateX),
        y: Math.round(arrowTranslateY)
      };
    }
    /**
     * Fallbacks to new placement, prioritizing <code>Left</code> and <code>Right</code> placements.
     * @private
     */


    fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) {
      if (targetRect.left > popoverSize.width) {
        return _PopoverPlacementType.default.Left;
      }

      if (clientWidth - targetRect.right > targetRect.left) {
        return _PopoverPlacementType.default.Right;
      }

      if (clientHeight - targetRect.bottom > popoverSize.height) {
        return _PopoverPlacementType.default.Bottom;
      }

      if (clientHeight - targetRect.bottom < targetRect.top) {
        return _PopoverPlacementType.default.Top;
      }
    }

    getActualPlacementType(targetRect, popoverSize) {
      const placementType = this.placementType;
      let actualPlacementType = placementType;
      const clientWidth = document.documentElement.clientWidth;
      const clientHeight = document.documentElement.clientHeight;

      switch (placementType) {
        case _PopoverPlacementType.default.Top:
          if (targetRect.top < popoverSize.height && targetRect.top < clientHeight - targetRect.bottom) {
            actualPlacementType = _PopoverPlacementType.default.Bottom;
          }

          break;

        case _PopoverPlacementType.default.Bottom:
          if (clientHeight - targetRect.bottom < popoverSize.height && clientHeight - targetRect.bottom < targetRect.top) {
            actualPlacementType = _PopoverPlacementType.default.Top;
          }

          break;

        case _PopoverPlacementType.default.Left:
          if (targetRect.left < popoverSize.width) {
            actualPlacementType = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placementType;
          }

          break;

        case _PopoverPlacementType.default.Right:
          if (clientWidth - targetRect.right < popoverSize.width) {
            actualPlacementType = this.fallbackPlacement(clientWidth, clientHeight, targetRect, popoverSize) || placementType;
          }

          break;
      }

      return actualPlacementType;
    }

    getVerticalLeft(targetRect, popoverSize) {
      let left;

      switch (this.horizontalAlign) {
        case _PopoverHorizontalAlign.default.Center:
        case _PopoverHorizontalAlign.default.Stretch:
          left = targetRect.left - (popoverSize.width - targetRect.width) / 2;
          break;

        case _PopoverHorizontalAlign.default.Left:
          left = targetRect.left;
          break;

        case _PopoverHorizontalAlign.default.Right:
          left = targetRect.right - popoverSize.width;
          break;
      }

      return left;
    }

    getHorizontalTop(targetRect, popoverSize) {
      let top;

      switch (this.verticalAlign) {
        case _PopoverVerticalAlign.default.Center:
        case _PopoverVerticalAlign.default.Stretch:
          top = targetRect.top - (popoverSize.height - targetRect.height) / 2;
          break;

        case _PopoverVerticalAlign.default.Top:
          top = targetRect.top;
          break;

        case _PopoverVerticalAlign.default.Bottom:
          top = targetRect.bottom - popoverSize.height;
          break;
      }

      return top;
    }

    get isModal() {
      // Required by Popup.js
      return this.modal;
    }

    get shouldHideBackdrop() {
      // Required by Popup.js
      return this.hideBackdrop;
    }

    get _ariaLabelledBy() {
      // Required by Popup.js
      if (!this._ariaLabel && this._displayHeader) {
        return "ui5-popup-header";
      }

      return undefined;
    }

    get _ariaModal() {
      // Required by Popup.js
      return true;
    }

    get styles() {
      return { ...super.styles,
        root: {
          "max-height": `${this._maxHeight}px`,
          "max-width": `${this._maxWidth}px`
        },
        arrow: {
          transform: `translate(${this.arrowTranslateX}px, ${this.arrowTranslateY}px)`
        }
      };
    }

    get classes() {
      const allClasses = super.classes;
      allClasses.root["ui5-popover-root"] = true;
      return allClasses;
    }
    /**
     * Hook for descendants to hide header.
     */


    get _displayHeader() {
      return this.header.length || this.headerText;
    }
    /**
     * Hook for descendants to hide footer.
     */


    get _displayFooter() {
      return true;
    }

  }

  Popover.define();
  var _default = Popover;
  _exports.default = _default;
});