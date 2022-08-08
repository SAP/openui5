sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "./types/SideContentPosition", "./types/SideContentVisibility", "./types/SideContentFallDown", "./generated/templates/DynamicSideContentTemplate.lit", "./generated/themes/DynamicSideContent.css", "./generated/i18n/i18n-defaults"], function (_exports, _UI5Element, _i18nBundle, _LitRenderer, _ResizeHandler, _SideContentPosition, _SideContentVisibility, _SideContentFallDown, _DynamicSideContentTemplate, _DynamicSideContent, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _SideContentPosition = _interopRequireDefault(_SideContentPosition);
  _SideContentVisibility = _interopRequireDefault(_SideContentVisibility);
  _SideContentFallDown = _interopRequireDefault(_SideContentFallDown);
  _DynamicSideContentTemplate = _interopRequireDefault(_DynamicSideContentTemplate);
  _DynamicSideContent = _interopRequireDefault(_DynamicSideContent);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles
  // Texts
  // Breakpoint-related constants
  const S_M_BREAKPOINT = 720,
        // Breakpoint between S and M screen sizes
  M_L_BREAKPOINT = 1024,
        // Breakpoint between M and L screen sizes
  L_XL_BREAKPOINT = 1440,
        // Breakpoint between L and XL screen sizes
  MINIMUM_WIDTH_BREAKPOINT = 960; // Minimum width of the control where main and side contents are side by side

  /**
   * @public
   */

  const metadata = {
    tag: "ui5-dynamic-side-content",
    managedSlots: true,
    properties:
    /** @lends sap.ui.webcomponents.fiori.DynamicSideContent.prototype */
    {
      /**
       * Defines the visibility of the main content.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       *
       */
      hideMainContent: {
        type: Boolean
      },

      /**
       * Defines the visibility of the side content.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       *
       */
      hideSideContent: {
        type: Boolean
      },

      /**
       * Defines whether the side content is positioned before the main content (left side
       * in LTR mode), or after the the main content (right side in LTR mode).
       *
       * <br><br>
       * <b>The available values are:</b>
       *
       * <ul>
       * <li><code>Start</code></li>
       * <li><code>End</code></li>
       * </ul>
       *
       * @type {SideContentPosition}
       * @defaultvalue "End"
       * @public
       *
       */
      sideContentPosition: {
        type: _SideContentPosition.default,
        defaultValue: _SideContentPosition.default.End
      },

      /**
       * Defines on which breakpoints the side content is visible.
       *
       * <br><br>
       * <b>The available values are:</b>
       *
       * <ul>
       * <li><code>AlwaysShow</code></li>
       * <li><code>ShowAboveL</code></li>
       * <li><code>ShowAboveM</code></li>
       * <li><code>ShowAboveS</code></li>
       * <li><code>NeverShow</code></li>
       * </ul>
       *
       * @type {SideContentVisibility}
       * @defaultvalue "ShowAboveS"
       * @public
       *
       */
      sideContentVisibility: {
        type: _SideContentVisibility.default,
        defaultValue: _SideContentVisibility.default.ShowAboveS
      },

      /**
       * Defines on which breakpoints the side content falls down below the main content.
       *
       * <br><br>
       * <b>The available values are:</b>
       *
       * <ul>
       * <li><code>BelowXL</code></li>
       * <li><code>BelowL</code></li>
       * <li><code>BelowM</code></li>
       * <li><code>OnMinimumWidth</code></li>
       * </ul>
       *
       * @type {SideContentFallDown}
       * @defaultvalue "OnMinimumWidth"
       * @public
       *
       */
      sideContentFallDown: {
        type: _SideContentFallDown.default,
        defaultValue: _SideContentFallDown.default.OnMinimumWidth
      },

      /**
       * Defines whether the component is in equal split mode. In this mode, the side and
       * the main content take 50:50 percent of the container on all screen sizes
       * except for phone, where the main and side contents are switching visibility
       * using the toggle method.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       *
       */
      equalSplit: {
        type: Boolean
      },

      /**
      	 * @private
       */
      _mcSpan: {
        type: String,
        defaultValue: "0",
        noAttribute: true
      },

      /**
      	 * @private
       */
      _scSpan: {
        type: String,
        defaultValue: "0",
        noAttribute: true
      },

      /**
      	 * @private
       */
      _toggled: {
        type: Boolean,
        noAttribute: true
      },

      /**
      	 * @private
       */
      _currentBreakpoint: {
        type: String,
        noAttribute: true
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.fiori.DynamicSideContent.prototype */
    {
      /**
       * Defines the main content.
       *
       * @type {HTMLElement[]}
       * @slot
       * @public
       */
      "default": {
        type: HTMLElement
      },

      /**
       * Defines the side content.
       *
       * @type {HTMLElement[]}
       * @slot
       * @public
       */
      "sideContent": {
        type: HTMLElement
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.DynamicSideContent.prototype */
    {
      /**
       * Fires when the current breakpoint has been changed.
       * @event sap.ui.webcomponents.fiori.DynamicSideContent#layout-change
       * @param {string} currentBreakpoint the current breakpoint.
       * @param {string} previousBreakpoint the breakpoint that was active before change to current breakpoint.
       * @param {boolean} mainContentVisible visibility of the main content.
       * @param {boolean} sideContentVisible visibility of the side content.
       * @public
       */
      "layout-change": {
        detail: {
          currentBreakpoint: {
            type: String
          },
          previousBreakpoint: {
            type: String
          },
          mainContentVisible: {
            type: Boolean
          },
          sideContentVisible: {
            type: Boolean
          }
        }
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The DynamicSideContent (<code>ui5-dynamic-side-content</code>) is a layout component that allows additional content
   * to be displayed in a way that flexibly adapts to different screen sizes. The side
   * content appears in a container next to or directly below the main content
   * (it doesn't overlay). When the side content is triggered, the main content becomes
   * narrower (if appearing side-by-side). The side content contains a separate scrollbar
   * when appearing next to the main content.
   *
   *
   * <h3>Usage</h3>
   *
   * <i>When to use?</i>
   *
   * Use this component if you want to display relevant information that is not critical
   * for users to complete a task. Users should have access to all the key functions and
   * critical information in the app even if they do not see the side content. This is
   * important because on smaller screen sizes it may be difficult to display the side
   * content in a way that is easily accessible for the user.
   *
   * <i>When not to use?</i>
   *
   * Don't use it if you want to display navigation or critical information that prevents
   * users from completing a task when they have no access to the side content.
   *
   *
   * <h3>Responsive Behavior</h3>
   *
   * Screen width > 1440px
   *
   * <ul><li>Main vs. side content ratio is 75 vs. 25 percent (with a minimum of 320px
   * each).</li>
   * <li>If the application defines a trigger, the side content can be hidden.</li></ul>
   *
   * Screen width <= 1440px and > 1024px
   *
   * <ul><li>Main vs. side content ratio is 66.666 vs. 33.333 percent (with a minimum of
   * 320px each). If the side content width falls below 320 px, it automatically slides
   * under the main content, unless the app development team specifies that it should
   * disappear.</li></ul>
   *
   * Screen width <= 1024px and > 720px
   *
   * <ul><li>The side content ratio is fixed to 340px, and the main content takes the rest
   * of the width. Only if the <code>sideContentFallDown</code> is set to <code>OnMinimumWidth</code>
   * and screen width is <= 960px and > 720px the side content falls below the main content.</li></ul>
   *
   * Screen width <= 720px (for example on a mobile device)
   *
   * <ul><li>In this case, the side content automatically disappears from the screen (unless
   * specified to stay under the content by setting of <code>sideContentVisibility</code>
   * property to <code>AlwaysShow</code>) and can be triggered from a pre-set trigger
   * (specified within the app). When the side content is triggered, it replaces the main
   * content. We recommend that you always place the trigger for the side content in the
   * same location, such as in the app footer.</li></ul>
   *
   * A special case allows switching the comparison mode between the main and side content.
   * In this case, the screen is split into 50:50 percent for main vs. side content. The
   * responsive behavior of the equal split is the same as in the standard view - the
   * side content disappears on screen widths of less than 720 px and can only be
   * viewed by triggering it.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/DynamicSideContent";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.DynamicSideContent
   * @extends UI5Element
   * @tagname ui5-dynamic-side-content
   * @public
   * @since 1.1.0
   */

  class DynamicSideContent extends _UI5Element.default {
    constructor() {
      super();
      this._handleResizeBound = this.handleResize.bind(this);
    }

    static get metadata() {
      return metadata;
    }

    static get styles() {
      return _DynamicSideContent.default;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _DynamicSideContentTemplate.default;
    }

    static async onDefine() {
      DynamicSideContent.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }

    onAfterRendering() {
      this._resizeContents();
    }

    onEnterDOM() {
      _ResizeHandler.default.register(this, this._handleResizeBound);
    }

    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._handleResizeBound);
    }
    /**
     * Toggles visibility of main and side contents on S screen size (mobile device).
     * @public
     */


    toggleContents() {
      if (this.breakpoint === this.sizeS && this.sideContentVisibility !== _SideContentVisibility.default.AlwaysShow) {
        this._toggled = !this._toggled;
      }
    }

    get classes() {
      const gridPrefix = "ui5-dsc-span",
            mcSpan = this._toggled ? this._scSpan : this._mcSpan,
            scSpan = this._toggled ? this._mcSpan : this._scSpan,
            classes = {
        main: {
          "ui5-dsc-main": true
        },
        side: {
          "ui5-dsc-side": true
        }
      };
      classes.main[`${gridPrefix}-${mcSpan}`] = true;
      classes.side[`${gridPrefix}-${scSpan}`] = true;
      return classes;
    }

    get styles() {
      const isToggled = this.breakpoint === this.sizeS && this._toggled,
            mcSpan = isToggled ? this._scSpan : this._mcSpan,
            scSpan = isToggled ? this._mcSpan : this._scSpan,
            contentHeight = this.breakpoint === this.sizeS && this.sideContentVisibility !== _SideContentVisibility.default.AlwaysShow ? "100%" : "auto";
      return {
        root: {
          "flex-wrap": this._mcSpan === "12" ? "wrap" : "nowrap"
        },
        main: {
          "height": mcSpan === this.span12 ? contentHeight : "100%",
          "order": this.sideContentPosition === _SideContentPosition.default.Start ? 2 : 1
        },
        side: {
          "height": scSpan === this.span12 ? contentHeight : "100%",
          "order": this.sideContentPosition === _SideContentPosition.default.Start ? 1 : 2
        }
      };
    }

    get accInfo() {
      return {
        "label": DynamicSideContent.i18nBundle.getText(_i18nDefaults.DSC_SIDE_ARIA_LABEL)
      };
    }

    get sizeS() {
      return "S";
    }

    get sizeM() {
      return "M";
    }

    get sizeL() {
      return "L";
    }

    get sizeXL() {
      return "XL";
    }

    get span0() {
      return "0";
    }

    get span3() {
      return "3";
    }

    get span4() {
      return "4";
    }

    get span6() {
      return "6";
    }

    get span8() {
      return "8";
    }

    get span9() {
      return "9";
    }

    get span12() {
      return "12";
    }

    get spanFixed() {
      return "fixed";
    }

    get containerWidth() {
      return this.parentElement.clientWidth;
    }

    get breakpoint() {
      let size;

      if (this.containerWidth <= S_M_BREAKPOINT) {
        size = this.sizeS;
      } else if (this.containerWidth > S_M_BREAKPOINT && this.containerWidth <= M_L_BREAKPOINT) {
        size = this.sizeM;
      } else if (this.containerWidth > M_L_BREAKPOINT && this.containerWidth <= L_XL_BREAKPOINT) {
        size = this.sizeL;
      } else {
        size = this.sizeXL;
      }

      return size;
    }

    handleResize() {
      this._resizeContents();
    }

    _resizeContents() {
      let mainSize, sideSize, sideVisible; // initial set contents sizes

      switch (this.breakpoint) {
        case this.sizeS:
          mainSize = this.span12;
          sideSize = this.span12;
          break;

        case this.sizeM:
          if (this.sideContentFallDown === _SideContentFallDown.default.BelowXL || this.sideContentFallDown === _SideContentFallDown.default.BelowL || this.containerWidth <= MINIMUM_WIDTH_BREAKPOINT && this.sideContentFallDown === _SideContentFallDown.default.OnMinimumWidth) {
            mainSize = this.span12;
            sideSize = this.span12;
          } else {
            mainSize = this.equalSplit ? this.span6 : this.spanFixed;
            sideSize = this.equalSplit ? this.span6 : this.spanFixed;
          }

          sideVisible = this.sideContentVisibility === _SideContentVisibility.default.ShowAboveS || this.sideContentVisibility === _SideContentVisibility.default.AlwaysShow;
          break;

        case this.sizeL:
          if (this.sideContentFallDown === _SideContentFallDown.default.BelowXL) {
            mainSize = this.span12;
            sideSize = this.span12;
          } else {
            mainSize = this.equalSplit ? this.span6 : this.span8;
            sideSize = this.equalSplit ? this.span6 : this.span4;
          }

          sideVisible = this.sideContentVisibility === _SideContentVisibility.default.ShowAboveS || this.sideContentVisibility === _SideContentVisibility.default.ShowAboveM || this.sideContentVisibility === _SideContentVisibility.default.AlwaysShow;
          break;

        case this.sizeXL:
          mainSize = this.equalSplit ? this.span6 : this.span9;
          sideSize = this.equalSplit ? this.span6 : this.span3;
          sideVisible = this.sideContentVisibility !== _SideContentVisibility.default.NeverShow;
      }

      if (this.sideContentVisibility === _SideContentVisibility.default.AlwaysShow) {
        sideVisible = true;
      } // modify sizes of the contents depending on hideMainContent and hideSideContent properties


      if (this.hideSideContent) {
        mainSize = this.hideMainContent ? this.span0 : this.span12;
        sideSize = this.span0;
        sideVisible = false;
      }

      if (this.hideMainContent) {
        mainSize = this.span0;
        sideSize = this.hideSideContent ? this.span0 : this.span12;
        sideVisible = true;
      } // set final sizes of the contents


      if (!sideVisible) {
        mainSize = this.span12;
        sideSize = this.span0;
      } // fire "layout-change" event


      if (this._currentBreakpoint !== this.breakpoint) {
        const eventParams = {
          currentBreakpoint: this.breakpoint,
          previousBreakpoint: this._currentBreakpoint,
          mainContentVisible: mainSize !== this.span0,
          sideContentVisible: sideSize !== this.span0
        };
        this.fireEvent("layout-change", eventParams);
        this._currentBreakpoint = this.breakpoint;
      } // update contents sizes


      this._setSpanSizes(mainSize, sideSize);
    }

    _setSpanSizes(mainSize, sideSize) {
      this._mcSpan = mainSize;
      this._scSpan = sideSize;

      if (this.breakpoint !== this.sizeS) {
        this._toggled = false;
      }
    }

  }

  DynamicSideContent.define();
  var _default = DynamicSideContent;
  _exports.default = _default;
});