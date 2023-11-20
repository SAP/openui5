sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/animations/slideDown", "sap/ui/webc/common/thirdparty/base/animations/slideUp", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right", "./Button", "./Icon", "./types/TitleLevel", "./types/PanelAccessibleRole", "./generated/templates/PanelTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Panel.css"], function (_exports, _UI5Element, _customElement, _event, _property, _slot, _LitRenderer, _slideDown, _slideUp, _Keys, _AnimationMode, _AnimationMode2, _i18nBundle, _slimArrowRight, _Button, _Icon, _TitleLevel, _PanelAccessibleRole, _PanelTemplate, _i18nDefaults, _Panel) {
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
  _slideDown = _interopRequireDefault(_slideDown);
  _slideUp = _interopRequireDefault(_slideUp);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  _Button = _interopRequireDefault(_Button);
  _Icon = _interopRequireDefault(_Icon);
  _TitleLevel = _interopRequireDefault(_TitleLevel);
  _PanelAccessibleRole = _interopRequireDefault(_PanelAccessibleRole);
  _PanelTemplate = _interopRequireDefault(_PanelTemplate);
  _Panel = _interopRequireDefault(_Panel);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Panel_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-panel</code> component is a container which has a header and a
   * content area and is used
   * for grouping and displaying information. It can be collapsed to save space on the screen.
   *
   * <h3>Guidelines:</h3>
   * <ul>
   * <li>Nesting two or more panels is not recommended.</li>
   * <li>Do not stack too many panels on one page.</li>
   * </ul>
   *
   * <h3>Structure</h3>
   * The panel's header area consists of a title bar with a header text or custom header.
   * <br>
   * The header is clickable and can be used to toggle between the expanded and collapsed state. It includes an icon which rotates depending on the state.
   * <br>
   * The custom header can be set through the <code>header</code> slot and it may contain arbitraray content, such as: title, buttons or any other HTML elements.
   * <br>
   * The content area can contain an arbitrary set of controls.
   * <br><b>Note:</b> The custom header is not clickable out of the box, but in this case the icon is interactive and allows to show/hide the content area.
   *
   * <h3>Responsive Behavior</h3>
   * <ul>
   * <li>If the width of the panel is set to 100% (default), the panel and its children are
   * resized responsively,
   * depending on its parent container.</li>
   * <li>If the panel has a fixed height, it will take up the space even if the panel is
   * collapsed.</li>
   * <li>When the panel is expandable (the <code>fixed</code> property is set to <code>false</code>),
   * an arrow icon (pointing to the right) appears in front of the header.</li>
   * <li>When the animation is activated, expand/collapse uses a smooth animation to open or
   * close the content area.</li>
   * <li>When the panel expands/collapses, the arrow icon rotates 90 degrees
   * clockwise/counter-clockwise.</li>
   * </ul>
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-panel</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>header - Used to style the wrapper of the header</li>
   * <li>content - Used to style the wrapper of the content</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Panel";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Panel
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-panel
   * @public
   */
  let Panel = Panel_1 = class Panel extends _UI5Element.default {
    onBeforeRendering() {
      // If the animation is running, it will set the content expanded state at the end
      if (!this._animationRunning) {
        this._contentExpanded = !this.collapsed;
      }
      this._hasHeader = !!this.header.length;
    }
    shouldToggle(element) {
      const customContent = this.header.length;
      if (customContent) {
        return element.classList.contains("ui5-panel-header-button");
      }
      return true;
    }
    shouldNotAnimate() {
      return this.noAnimation || (0, _AnimationMode2.getAnimationMode)() === _AnimationMode.default.None;
    }
    _headerClick(e) {
      if (!this.shouldToggle(e.target)) {
        return;
      }
      this._toggleOpen();
    }
    _toggleButtonClick(e) {
      if (e.x === 0 && e.y === 0) {
        e.stopImmediatePropagation();
      }
    }
    _headerKeyDown(e) {
      if (!this.shouldToggle(e.target)) {
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        e.preventDefault();
      }
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
    }
    _headerKeyUp(e) {
      if (!this.shouldToggle(e.target)) {
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        this._toggleOpen();
      }
      if ((0, _Keys.isSpace)(e)) {
        this._toggleOpen();
      }
    }
    _toggleOpen() {
      if (this.fixed) {
        return;
      }
      this.collapsed = !this.collapsed;
      if (this.shouldNotAnimate()) {
        this.fireEvent("toggle");
        return;
      }
      this._animationRunning = true;
      const elements = this.getDomRef().querySelectorAll(".ui5-panel-content");
      const animations = [];
      [].forEach.call(elements, oElement => {
        if (this.collapsed) {
          animations.push((0, _slideUp.default)(oElement).promise());
        } else {
          animations.push((0, _slideDown.default)(oElement).promise());
        }
      });
      Promise.all(animations).then(() => {
        this._animationRunning = false;
        this._contentExpanded = !this.collapsed;
        this.fireEvent("toggle");
      });
    }
    _headerOnTarget(target) {
      return target.classList.contains("sapMPanelWrappingDiv");
    }
    get classes() {
      return {
        headerBtn: {
          "ui5-panel-header-button-animated": !this.shouldNotAnimate()
        },
        stickyHeaderClass: {
          "ui5-panel-heading-wrapper-sticky": this.stickyHeader
        }
      };
    }
    get toggleButtonTitle() {
      return Panel_1.i18nBundle.getText(_i18nDefaults.PANEL_ICON);
    }
    get expanded() {
      return !this.collapsed;
    }
    get accRole() {
      return this.accessibleRole.toLowerCase();
    }
    get effectiveAccessibleName() {
      return typeof this.accessibleName === "string" && this.accessibleName.length ? this.accessibleName : undefined;
    }
    get accInfo() {
      return {
        "button": {
          "accessibilityAttributes": {
            "expanded": this.expanded
          },
          "title": this.toggleButtonTitle,
          "ariaLabelButton": !this.nonFocusableButton && this.useAccessibleNameForToggleButton ? this.effectiveAccessibleName : undefined
        },
        "ariaExpanded": this.nonFixedInternalHeader ? this.expanded : undefined,
        "ariaControls": this.nonFixedInternalHeader ? `${this._id}-content` : undefined,
        "ariaLabelledby": this.nonFocusableButton ? this.ariaLabelledbyReference : undefined,
        "role": this.nonFixedInternalHeader ? "button" : undefined
      };
    }
    get ariaLabelledbyReference() {
      return this.nonFocusableButton && this.headerText && !this.fixed ? `${this._id}-header-title` : undefined;
    }
    get fixedPanelAriaLabelledbyReference() {
      return this.fixed && !this.effectiveAccessibleName ? `${this._id}-header-title` : undefined;
    }
    get headerAriaLevel() {
      return this.headerLevel.slice(1);
    }
    get headerTabIndex() {
      return this.header.length || this.fixed ? "-1" : "0";
    }
    get headingWrapperAriaLevel() {
      return !this._hasHeader ? this.headerAriaLevel : undefined;
    }
    get headingWrapperRole() {
      return !this._hasHeader ? "heading" : undefined;
    }
    get nonFixedInternalHeader() {
      return !this._hasHeader && !this.fixed;
    }
    get hasHeaderOrHeaderText() {
      return this._hasHeader || this.headerText;
    }
    get nonFocusableButton() {
      return !this.header.length;
    }
    get styles() {
      return {
        content: {
          display: this._contentExpanded ? "block" : "none"
        }
      };
    }
    static async onDefine() {
      Panel_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)()], Panel.prototype, "headerText", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Panel.prototype, "fixed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Panel.prototype, "collapsed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Panel.prototype, "noAnimation", void 0);
  __decorate([(0, _property.default)({
    type: _PanelAccessibleRole.default,
    defaultValue: _PanelAccessibleRole.default.Form
  })], Panel.prototype, "accessibleRole", void 0);
  __decorate([(0, _property.default)({
    type: _TitleLevel.default,
    defaultValue: _TitleLevel.default.H2
  })], Panel.prototype, "headerLevel", void 0);
  __decorate([(0, _property.default)()], Panel.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Panel.prototype, "stickyHeader", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Panel.prototype, "useAccessibleNameForToggleButton", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Panel.prototype, "_hasHeader", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], Panel.prototype, "_contentExpanded", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], Panel.prototype, "_animationRunning", void 0);
  __decorate([(0, _slot.default)()], Panel.prototype, "header", void 0);
  Panel = Panel_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-panel",
    fastNavigation: true,
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _PanelTemplate.default,
    styles: _Panel.default,
    dependencies: [_Button.default, _Icon.default]
  })
  /**
   * Fired when the component is expanded/collapsed by user interaction.
   *
   * @event sap.ui.webc.main.Panel#toggle
   * @public
   */, (0, _event.default)("toggle")], Panel);
  Panel.define();
  var _default = Panel;
  _exports.default = _default;
});