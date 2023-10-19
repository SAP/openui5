sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "./types/SideContentPosition", "./types/SideContentVisibility", "./types/SideContentFallDown", "./generated/templates/DynamicSideContentTemplate.lit", "./generated/themes/DynamicSideContent.css", "./generated/i18n/i18n-defaults"], function (_exports, _UI5Element, _customElement, _event, _property, _slot, _i18nBundle, _LitRenderer, _ResizeHandler, _SideContentPosition, _SideContentVisibility, _SideContentFallDown, _DynamicSideContentTemplate, _DynamicSideContent, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _SideContentPosition = _interopRequireDefault(_SideContentPosition);
  _SideContentVisibility = _interopRequireDefault(_SideContentVisibility);
  _SideContentFallDown = _interopRequireDefault(_SideContentFallDown);
  _DynamicSideContentTemplate = _interopRequireDefault(_DynamicSideContentTemplate);
  _DynamicSideContent = _interopRequireDefault(_DynamicSideContent);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var DynamicSideContent_1;

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
   * @alias sap.ui.webc.fiori.DynamicSideContent
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-dynamic-side-content
   * @public
   * @since 1.1.0
   */
  let DynamicSideContent = DynamicSideContent_1 = class DynamicSideContent extends _UI5Element.default {
    constructor() {
      super();
      this._handleResizeBound = this.handleResize.bind(this);
    }
    static async onDefine() {
      DynamicSideContent_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
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
     * @method
     * @name sap.ui.webc.fiori.DynamicSideContent#toggleContents
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
          "height": mcSpan === this.span12 ? contentHeight : "100%"
        },
        side: {
          "height": scSpan === this.span12 ? contentHeight : "100%"
        }
      };
    }
    get accInfo() {
      return {
        "label": DynamicSideContent_1.i18nBundle.getText(_i18nDefaults.DSC_SIDE_ARIA_LABEL)
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
    get _isSideContentFirst() {
      return this.sideContentPosition === _SideContentPosition.default.Start;
    }
    handleResize() {
      this._resizeContents();
    }
    _resizeContents() {
      let mainSize, sideSize, sideVisible;
      // initial set contents sizes
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
      }
      // modify sizes of the contents depending on hideMainContent and hideSideContent properties
      if (this.hideSideContent) {
        mainSize = this.hideMainContent ? this.span0 : this.span12;
        sideSize = this.span0;
        sideVisible = false;
      }
      if (this.hideMainContent) {
        mainSize = this.span0;
        sideSize = this.hideSideContent ? this.span0 : this.span12;
        sideVisible = true;
      }
      // set final sizes of the contents
      if (!sideVisible) {
        mainSize = this.span12;
        sideSize = this.span0;
      }
      // fire "layout-change" event
      if (this._currentBreakpoint !== this.breakpoint) {
        const eventParams = {
          currentBreakpoint: this.breakpoint,
          previousBreakpoint: this._currentBreakpoint,
          mainContentVisible: mainSize !== this.span0,
          sideContentVisible: sideSize !== this.span0
        };
        this.fireEvent("layout-change", eventParams);
        this._currentBreakpoint = this.breakpoint;
      }
      // update contents sizes
      this._setSpanSizes(mainSize, sideSize);
    }
    _setSpanSizes(mainSize, sideSize) {
      this._mcSpan = mainSize;
      this._scSpan = sideSize;
      if (this.breakpoint !== this.sizeS) {
        this._toggled = false;
      }
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], DynamicSideContent.prototype, "hideMainContent", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], DynamicSideContent.prototype, "hideSideContent", void 0);
  __decorate([(0, _property.default)({
    type: _SideContentPosition.default,
    defaultValue: _SideContentPosition.default.End
  })], DynamicSideContent.prototype, "sideContentPosition", void 0);
  __decorate([(0, _property.default)({
    type: _SideContentVisibility.default,
    defaultValue: _SideContentVisibility.default.ShowAboveS
  })], DynamicSideContent.prototype, "sideContentVisibility", void 0);
  __decorate([(0, _property.default)({
    type: _SideContentFallDown.default,
    defaultValue: _SideContentFallDown.default.OnMinimumWidth
  })], DynamicSideContent.prototype, "sideContentFallDown", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], DynamicSideContent.prototype, "equalSplit", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "0",
    noAttribute: true
  })], DynamicSideContent.prototype, "_mcSpan", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "0",
    noAttribute: true
  })], DynamicSideContent.prototype, "_scSpan", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], DynamicSideContent.prototype, "_toggled", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], DynamicSideContent.prototype, "_currentBreakpoint", void 0);
  __decorate([(0, _slot.default)()], DynamicSideContent.prototype, "sideContent", void 0);
  DynamicSideContent = DynamicSideContent_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-dynamic-side-content",
    renderer: _LitRenderer.default,
    styles: _DynamicSideContent.default,
    template: _DynamicSideContentTemplate.default
  })
  /**
   * Fires when the current breakpoint has been changed.
   * @event sap.ui.webc.fiori.DynamicSideContent#layout-change
   * @param {string} currentBreakpoint the current breakpoint.
   * @param {string} previousBreakpoint the breakpoint that was active before change to current breakpoint.
   * @param {boolean} mainContentVisible visibility of the main content.
   * @param {boolean} sideContentVisible visibility of the side content.
   * @public
   */, (0, _event.default)("layout-change", {
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
  })], DynamicSideContent);
  DynamicSideContent.define();
  var _default = DynamicSideContent;
  _exports.default = _default;
});