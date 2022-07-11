sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/animations/slideDown", "sap/ui/webc/common/thirdparty/base/animations/slideUp", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right", "./Button", "./Icon", "./types/TitleLevel", "./types/PanelAccessibleRole", "./generated/templates/PanelTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Panel.css"], function (_exports, _UI5Element, _LitRenderer, _slideDown, _slideUp, _Keys, _AnimationMode, _AnimationMode2, _i18nBundle, _slimArrowRight, _Button, _Icon, _TitleLevel, _PanelAccessibleRole, _PanelTemplate, _i18nDefaults, _Panel) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
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

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-panel",
    languageAware: true,
    managedSlots: true,
    fastNavigation: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Panel.prototype */
    {
      /**
       * Defines the component header area.
       * <br><br>
       * <b>Note:</b> When a header is provided, the <code>headerText</code> property is ignored.
       *
       * @type {HTMLElement[]}
       * @slot
       * @public
       */
      header: {
        type: HTMLElement
      },

      /**
       * Defines the content of the component.
       * The content is visible only when the component is expanded.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: HTMLElement
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.main.Panel.prototype */
    {
      /**
       * This property is used to set the header text of the component.
       * The text is visible in both expanded and collapsed states.
       * <br><br>
       * <b>Note:</b> This property is overridden by the <code>header</code> slot.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      headerText: {
        type: String
      },

      /**
       * Determines whether the component is in a fixed state that is not
       * expandable/collapsible by user interaction.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      fixed: {
        type: Boolean
      },

      /**
       * Indicates whether the component is collapsed and only the header is displayed.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      collapsed: {
        type: Boolean
      },

      /**
       * Indicates whether the transition between the expanded and the collapsed state of the component is animated. By default the animation is enabled.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.16
       */
      noAnimation: {
        type: Boolean
      },

      /**
       * Sets the accessible aria role of the component.
       * Depending on the usage, you can change the role from the default <code>Form</code>
       * to <code>Region</code> or <code>Complementary</code>.
       *
       * @type {PanelAccessibleRole}
       * @defaultvalue "Form"
       * @public
       */
      accessibleRole: {
        type: _PanelAccessibleRole.default,
        defaultValue: _PanelAccessibleRole.default.Form
      },

      /**
       * Defines the "aria-level" of component heading,
       * set by the <code>headerText</code>.
       * <br><br>
       * Available options are: <code>"H6"</code> to <code>"H1"</code>.
       * @type {TitleLevel}
       * @defaultvalue "H2"
       * @public
      */
      headerLevel: {
        type: _TitleLevel.default,
        defaultValue: _TitleLevel.default.H2
      },

      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleName: {
        type: String
      },

      /**
       * When set to <code>true</code>, the <code>accessibleName</code> property will be
       * applied not only on the panel root itself, but on its toggle button too.
       * <b>Note:</b> This property only has effect if <code>accessibleName</code> is set and a header slot is provided.
       * @type {boolean}
       * @defaultvalue false
       * @private
      	 */
      useAccessibleNameForToggleButton: {
        type: Boolean
      },

      /**
       * @private
       */
      _hasHeader: {
        type: Boolean
      },
      _header: {
        type: Object
      },
      _contentExpanded: {
        type: Boolean,
        noAttribute: true
      },
      _animationRunning: {
        type: Boolean,
        noAttribute: true
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Panel.prototype */
    {
      /**
       * Fired when the component is expanded/collapsed by user interaction.
       *
       * @event
       * @public
       */
      toggle: {}
    }
  };
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
   * @alias sap.ui.webcomponents.main.Panel
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-panel
   * @public
   */

  class Panel extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _PanelTemplate.default;
    }

    static get styles() {
      return _Panel.default;
    }

    constructor() {
      super();
      this._header = {};
    }

    onBeforeRendering() {
      // If the animation is running, it will set the content expanded state at the end
      if (!this._animationRunning) {
        this._contentExpanded = !this.collapsed;
      }

      this._hasHeader = !!this.header.length;
    }

    shouldToggle(node) {
      const customContent = this.header.length;

      if (customContent) {
        return node.classList.contains("ui5-panel-header-button");
      }

      return true;
    }

    shouldNotAnimate() {
      return this.noAnimation || (0, _AnimationMode2.getAnimationMode)() === _AnimationMode.default.None;
    }

    _headerClick(event) {
      if (!this.shouldToggle(event.target)) {
        return;
      }

      this._toggleOpen();
    }

    _toggleButtonClick(event) {
      if (event.x === 0 && event.y === 0) {
        event.stopImmediatePropagation();
      }
    }

    _headerKeyDown(event) {
      if (!this.shouldToggle(event.target)) {
        return;
      }

      if ((0, _Keys.isEnter)(event)) {
        this._toggleOpen();
      }

      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      }
    }

    _headerKeyUp(event) {
      if (!this.shouldToggle(event.target)) {
        return;
      }

      if ((0, _Keys.isSpace)(event)) {
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
          animations.push((0, _slideUp.default)({
            element: oElement
          }).promise());
        } else {
          animations.push((0, _slideDown.default)({
            element: oElement
          }).promise());
        }
      });
      Promise.all(animations).then(_ => {
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
        }
      };
    }

    get toggleButtonTitle() {
      return Panel.i18nBundle.getText(_i18nDefaults.PANEL_ICON);
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
            "expanded": this.expanded,
            "controls": `${this._id}-content`
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
      return this.nonFocusableButton && this.headerText ? `${this._id}-header-title` : undefined;
    }

    get header() {
      return this.getDomRef().querySelector(`#${this._id}-header-title`);
    }

    get headerAriaLevel() {
      return this.headerLevel.slice(1);
    }

    get headerTabIndex() {
      return this.header.length || this.fixed ? "-1" : "0";
    }

    get nonFixedInternalHeader() {
      return !this._hasHeader && !this.fixed;
    }

    get nonFocusableButton() {
      return !this.header.length;
    }

    get shouldRenderH1() {
      return !this.header.length && (this.headerText || !this.fixed);
    }

    get styles() {
      return {
        content: {
          display: this._contentExpanded ? "block" : "none"
        }
      };
    }

    static get dependencies() {
      return [_Button.default, _Icon.default];
    }

    static async onDefine() {
      Panel.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

  }

  Panel.define();
  var _default = Panel;
  _exports.default = _default;
});