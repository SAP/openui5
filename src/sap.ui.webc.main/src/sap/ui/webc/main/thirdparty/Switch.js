sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/icons/accept", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/less", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "./Icon", "./types/SwitchDesign", "./generated/templates/SwitchTemplate.lit", "./generated/themes/Switch.css"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _LitRenderer, _Keys, _Device, _i18nBundle, _AriaLabelHelper, _accept, _decline, _less, _FeaturesRegistry, _Icon, _SwitchDesign, _SwitchTemplate, _Switch) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Icon = _interopRequireDefault(_Icon);
  _SwitchDesign = _interopRequireDefault(_SwitchDesign);
  _SwitchTemplate = _interopRequireDefault(_SwitchTemplate);
  _Switch = _interopRequireDefault(_Switch);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Switch_1;

  // Template

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-switch</code> component is used for changing between binary states.
   * <br>
   * The component can display texts, that will be switched, based on the component state, via the <code>textOn</code> and <code>textOff</code> properties,
   * but texts longer than 3 letters will be cutted off.
   * <br>
   * However, users are able to customize the width of <code>ui5-switch</code> with pure CSS (<code>&lt;ui5-switch style="width: 200px"></code>), and set widths, depending on the texts they would use.
   * <br>
   * Note: the component would not automatically stretch to fit the whole text width.
   *
   * <h3>Keyboard Handling</h3>
   * The state can be changed by pressing the Space and Enter keys.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-switch</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>slider - Used to style the track, where the handle is being slid</li>
   * <li>text-on - Used to style the <code>textOn</code> property text</li>
   * <li>text-off - Used to style the <code>textOff</code> property text</li>
   * <li>handle - Used to style the handle of the switch</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Switch";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Switch
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-switch
   * @public
   * @since 0.8.0
   */
  let Switch = Switch_1 = class Switch extends _UI5Element.default {
    onBeforeRendering() {
      this._enableFormSupport();
    }
    _enableFormSupport() {
      const formSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (formSupport) {
        formSupport.syncNativeHiddenInput(this, (element, nativeInput) => {
          const switchComponent = element;
          nativeInput.checked = !!switchComponent.checked;
          nativeInput.disabled = !!switchComponent.disabled;
          nativeInput.value = switchComponent.checked ? "on" : "";
        });
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    get sapNextIcon() {
      return this.checked ? "accept" : "less";
    }
    _onclick() {
      this.toggle();
    }
    _onkeydown(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      }
      if ((0, _Keys.isEnter)(e)) {
        this._onclick();
      }
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._onclick();
      }
    }
    toggle() {
      if (!this.disabled) {
        this.checked = !this.checked;
        const changePrevented = !this.fireEvent("change", null, true);
        // Angular two way data binding;
        const valueChangePrevented = !this.fireEvent("value-changed", null, true);
        if (changePrevented || valueChangePrevented) {
          this.checked = !this.checked;
        }
      }
    }
    get graphical() {
      return this.design === _SwitchDesign.default.Graphical;
    }
    get hasNoLabel() {
      return !(this.graphical || this.textOn || this.textOff);
    }
    get _textOn() {
      return this.graphical ? "" : this.textOn;
    }
    get _textOff() {
      return this.graphical ? "" : this.textOff;
    }
    get effectiveTabIndex() {
      return this.disabled ? undefined : "0";
    }
    get classes() {
      const hasLabel = this.graphical || this.textOn || this.textOff;
      return {
        main: {
          "ui5-switch-desktop": (0, _Device.isDesktop)(),
          "ui5-switch--disabled": this.disabled,
          "ui5-switch--checked": this.checked,
          "ui5-switch--semantic": this.graphical,
          "ui5-switch--no-label": !hasLabel
        }
      };
    }
    get effectiveAriaDisabled() {
      return this.disabled ? "true" : undefined;
    }
    get accessibilityOnText() {
      return this._textOn;
    }
    get accessibilityOffText() {
      return this._textOff;
    }
    get hiddenText() {
      return this.checked ? this.accessibilityOnText : this.accessibilityOffText;
    }
    get ariaLabelText() {
      return [(0, _AriaLabelHelper.getEffectiveAriaLabelText)(this), this.hiddenText].join(" ").trim();
    }
    static async onDefine() {
      Switch_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    type: _SwitchDesign.default,
    defaultValue: _SwitchDesign.default.Textual
  })], Switch.prototype, "design", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Switch.prototype, "checked", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Switch.prototype, "disabled", void 0);
  __decorate([(0, _property.default)()], Switch.prototype, "textOn", void 0);
  __decorate([(0, _property.default)()], Switch.prototype, "textOff", void 0);
  __decorate([(0, _property.default)()], Switch.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], Switch.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)()], Switch.prototype, "tooltip", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Switch.prototype, "required", void 0);
  __decorate([(0, _property.default)()], Switch.prototype, "name", void 0);
  __decorate([(0, _slot.default)()], Switch.prototype, "formSupport", void 0);
  Switch = Switch_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-switch",
    languageAware: true,
    styles: _Switch.default,
    renderer: _LitRenderer.default,
    template: _SwitchTemplate.default,
    dependencies: [_Icon.default]
  })
  /**
   * Fired when the component checked state changes.
   *
   * @public
   * @event sap.ui.webc.main.Switch#change
   */, (0, _event.default)("change")], Switch);
  Switch.define();
  var _default = Switch;
  _exports.default = _default;
});