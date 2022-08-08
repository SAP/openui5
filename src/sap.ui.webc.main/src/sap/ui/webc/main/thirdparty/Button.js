sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/util/isDefaultSlotProvided", "./types/ButtonDesign", "./generated/templates/ButtonTemplate.lit", "./Icon", "./generated/i18n/i18n-defaults", "./generated/themes/Button.css"], function (_exports, _UI5Element, _LitRenderer, _Keys, _AriaLabelHelper, _FeaturesRegistry, _i18nBundle, _Device, _isDefaultSlotProvided, _ButtonDesign, _ButtonTemplate, _Icon, _i18nDefaults, _Button) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _isDefaultSlotProvided = _interopRequireDefault(_isDefaultSlotProvided);
  _ButtonDesign = _interopRequireDefault(_ButtonDesign);
  _ButtonTemplate = _interopRequireDefault(_ButtonTemplate);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // Styles
  let isGlobalHandlerAttached = false;
  let activeButton = null;
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-button",
    languageAware: true,
    properties:
    /** @lends sap.ui.webcomponents.main.Button.prototype */
    {
      /**
       * Defines the component design.
       *
       * <br><br>
       * <b>The available values are:</b>
       *
       * <ul>
       * <li><code>Default</code></li>
       * <li><code>Emphasized</code></li>
       * <li><code>Positive</code></li>
       * <li><code>Negative</code></li>
       * <li><code>Transparent</code></li>
       * <li><code>Attention</code></li>
       * </ul>
       *
       * @type {ButtonDesign}
       * @defaultvalue "Default"
       * @public
       */
      design: {
        type: _ButtonDesign.default,
        defaultValue: _ButtonDesign.default.Default
      },

      /**
       * Defines whether the component is disabled.
       * A disabled component can't be pressed or
       * focused, and it is not in the tab chain.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Defines the icon, displayed as graphical element within the component.
       * The SAP-icons font provides numerous options.
       * <br><br>
       * Example:
       *
       * See all the available icons within the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      icon: {
        type: String
      },

      /**
       * Defines whether the icon should be displayed after the component text.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      iconEnd: {
        type: Boolean
      },

      /**
       * When set to <code>true</code>, the component will
       * automatically submit the nearest HTML form element on <code>press</code>.
       * <br><br>
       * <b>Note:</b> For the <code>submits</code> property to have effect, you must add the following import to your project:
       * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      submits: {
        type: Boolean
      },

      /**
       * Defines the tooltip of the component.
       * <br>
       * <b>Note:</b> We recommend setting tooltip to icon-only components.
       * @type {string}
       * @defaultvalue: ""
       * @public
       * @since 1.2.0
       */
      tooltip: {
        type: String
      },

      /**
       * Used to switch the active state (pressed or not) of the component.
       * @private
       */
      active: {
        type: Boolean
      },

      /**
       * Defines if a content has been added to the default slot
       * @private
       */
      iconOnly: {
        type: Boolean
      },

      /**
       * Indicates if the elements is on focus
       * @private
       */
      focused: {
        type: Boolean
      },

      /**
       * Indicates if the elements has a slotted icon
       * @private
       */
      hasIcon: {
        type: Boolean
      },

      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue: ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleName: {
        type: String,
        defaultValue: undefined
      },

      /**
       * Receives id(or many ids) of the elements that label the component.
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
       * An object of strings that defines several additional accessibility attribute values
       * for customization depending on the use case.
       *
       * It supports the following fields:
       *
       * <ul>
       * 		<li><code>expanded</code>: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed. Accepts the following string values:
       *			<ul>
       *				<li><code>true</code></li>
       *				<li><code>false</code></li>
       *			</ul>
       * 		</li>
       * 		<li><code>hasPopup</code>: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button. Accepts the following string values:
       * 			<ul>
       *				<li><code>Dialog</code></li>
       *				<li><code>Grid</code></li>
       *				<li><code>ListBox</code></li>
       *				<li><code>Menu</code></li>
       *				<li><code>Tree</code></li>
       * 			</ul>
       * 		</li>
       * 		<li><code>controls</code>: Identifies the element (or elements) whose contents or presence are controlled by the button element. Accepts a string value.</li>
       * </ul>
       * @type {object}
       * @public
       * @since 1.2.0
       */
      accessibilityAttributes: {
        type: Object
      },

      /**
       * Indicates if the element if focusable
       * @private
       */
      nonInteractive: {
        type: Boolean
      },
      _iconSettings: {
        type: Object
      },

      /**
       * Defines the tabIndex of the component.
       * @private
       */
      _tabIndex: {
        type: String,
        defaultValue: "0",
        noAttribute: true
      },

      /**
       * @since 1.0.0-rc.13
       * @private
       */
      _isTouch: {
        type: Boolean
      }
    },
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Button.prototype */
    {
      /**
       * Defines the text of the component.
       * <br><br>
       * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Button.prototype */
    {
      /**
       * Fired when the component is activated either with a
       * mouse/tap or by using the Enter or Space key.
       * <br><br>
       * <b>Note:</b> The event will not be fired if the <code>disabled</code>
       * property is set to <code>true</code>.
       *
       * @event
       * @public
       * @native
       */
      click: {}
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-button</code> component represents a simple push button.
   * It enables users to trigger actions by clicking or tapping the <code>ui5-button</code>, or by pressing
   * certain keyboard keys, such as Enter.
   *
   *
   * <h3>Usage</h3>
   *
   * For the <code>ui5-button</code> UI, you can define text, icon, or both. You can also specify
   * whether the text or the icon is displayed first.
   * <br><br>
   * You can choose from a set of predefined types that offer different
   * styling to correspond to the triggered action.
   * <br><br>
   * You can set the <code>ui5-button</code> as enabled or disabled. An enabled
   * <code>ui5-button</code> can be pressed by clicking or tapping it. The button changes
   * its style to provide visual feedback to the user that it is pressed or hovered over with
   * the mouse cursor. A disabled <code>ui5-button</code> appears inactive and cannot be pressed.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-button</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>button - Used to style the native button element</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Button";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Button
   * @extends UI5Element
   * @tagname ui5-button
   * @implements sap.ui.webcomponents.main.IButton
   * @public
   */

  class Button extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get styles() {
      return _Button.default;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _ButtonTemplate.default;
    }

    static get dependencies() {
      return [_Icon.default];
    }

    constructor() {
      super();

      this._deactivate = () => {
        if (activeButton) {
          activeButton.active = false;
        }
      };

      if (!isGlobalHandlerAttached) {
        document.addEventListener("mouseup", this._deactivate);
        isGlobalHandlerAttached = true;
      }

      const handleTouchStartEvent = event => {
        event.isMarked = "button";

        if (this.nonInteractive) {
          return;
        }

        this.active = true;
      };

      this._ontouchstart = {
        handleEvent: handleTouchStartEvent,
        passive: true
      };
    }

    onEnterDOM() {
      this._isTouch = ((0, _Device.isPhone)() || (0, _Device.isTablet)()) && !(0, _Device.isCombi)();
    }

    onBeforeRendering() {
      const FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");

      if (this.submits && !FormSupport) {
        console.warn(`In order for the "submits" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }

      this.iconOnly = this.isIconOnly;
      this.hasIcon = !!this.icon;
    }

    _onclick(event) {
      if (this.nonInteractive) {
        return;
      }

      event.isMarked = "button";
      const FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");

      if (FormSupport && this.submits) {
        FormSupport.triggerFormSubmit(this);
      }

      if ((0, _Device.isSafari)()) {
        this.getDomRef().focus();
      }
    }

    _onmousedown(event) {
      if (this.nonInteractive || this._isTouch) {
        return;
      }

      event.isMarked = "button";
      this.active = true;
      activeButton = this; // eslint-disable-line
    }

    _ontouchend(event) {
      this.active = false;

      if (activeButton) {
        activeButton.active = false;
      }
    }

    _onmouseup(event) {
      event.isMarked = "button";
    }

    _onkeydown(event) {
      event.isMarked = "button";

      if ((0, _Keys.isSpace)(event) || (0, _Keys.isEnter)(event)) {
        this.active = true;
      }
    }

    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event) || (0, _Keys.isEnter)(event)) {
        this.active = false;
      }
    }

    _onfocusout(_event) {
      if (this.nonInteractive) {
        return;
      }

      this.active = false;

      if ((0, _Device.isDesktop)()) {
        this.focused = false;
      }
    }

    _onfocusin(event) {
      if (this.nonInteractive) {
        return;
      }

      event.isMarked = "button";

      if ((0, _Device.isDesktop)()) {
        this.focused = true;
      }
    }

    get hasButtonType() {
      return this.design !== _ButtonDesign.default.Default && this.design !== _ButtonDesign.default.Transparent;
    }

    get iconRole() {
      if (!this.icon) {
        return "";
      }

      return this.isIconOnly ? "img" : "presentation";
    }

    get isIconOnly() {
      return !(0, _isDefaultSlotProvided.default)(this);
    }

    static typeTextMappings() {
      return {
        "Positive": _i18nDefaults.BUTTON_ARIA_TYPE_ACCEPT,
        "Negative": _i18nDefaults.BUTTON_ARIA_TYPE_REJECT,
        "Emphasized": _i18nDefaults.BUTTON_ARIA_TYPE_EMPHASIZED
      };
    }

    get buttonTypeText() {
      return Button.i18nBundle.getText(Button.typeTextMappings()[this.design]);
    }

    get tabIndexValue() {
      const tabindex = this.getAttribute("tabindex");

      if (tabindex) {
        return tabindex;
      }

      return this.nonInteractive ? "-1" : this._tabIndex;
    }

    get showIconTooltip() {
      return this.iconOnly && !this.tooltip;
    }

    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }

    static async onDefine() {
      Button.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

  }

  Button.define();
  var _default = Button;
  _exports.default = _default;
});