sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/util/getEffectiveScrollbarStyle", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/Keys", "./Popover", "./Icon", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/information", "./generated/templates/TextAreaTemplate.lit", "./generated/templates/TextAreaPopoverTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/TextArea.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/BrowserScrollbar.css"], function (_exports, _UI5Element, _property, _ValueState, _slot, _event, _customElement, _LitRenderer, _ResizeHandler, _Integer, _AriaLabelHelper, _getEffectiveScrollbarStyle, _i18nBundle, _FeaturesRegistry, _Keys, _Popover, _Icon, _error, _alert, _sysEnter, _information, _TextAreaTemplate, _TextAreaPopoverTemplate, _i18nDefaults, _TextArea, _ValueStateMessage, _BrowserScrollbar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _ValueState = _interopRequireDefault(_ValueState);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _Integer = _interopRequireDefault(_Integer);
  _getEffectiveScrollbarStyle = _interopRequireDefault(_getEffectiveScrollbarStyle);
  _Popover = _interopRequireDefault(_Popover);
  _Icon = _interopRequireDefault(_Icon);
  _TextAreaTemplate = _interopRequireDefault(_TextAreaTemplate);
  _TextAreaPopoverTemplate = _interopRequireDefault(_TextAreaPopoverTemplate);
  _TextArea = _interopRequireDefault(_TextArea);
  _ValueStateMessage = _interopRequireDefault(_ValueStateMessage);
  _BrowserScrollbar = _interopRequireDefault(_BrowserScrollbar);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TextArea_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-textarea</code> component is used to enter multiple lines of text.
   * <br><br>
   * When empty, it can hold a placeholder similar to a <code>ui5-input</code>.
   * You can define the rows of the <code>ui5-textarea</code> and also determine specific behavior when handling long texts.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-textarea</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>textarea - Used to style the native textarea</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/TextArea";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TextArea
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-textarea
   * @public
   */
  let TextArea = TextArea_1 = class TextArea extends _UI5Element.default {
    static async onDefine() {
      TextArea_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
      this._firstRendering = true;
      this._openValueStateMsgPopover = false;
      this._fnOnResize = this._onResize.bind(this);
      this.previousValue = "";
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._fnOnResize);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._fnOnResize);
    }
    onBeforeRendering() {
      if (!this.value) {
        // fallback to default value
        this.value = "";
      }
      this._exceededTextProps = this._calcExceededText();
      this._mirrorText = this._tokenizeText(this.value);
      this.exceeding = !!this._exceededTextProps.leftCharactersCount && this._exceededTextProps.leftCharactersCount < 0;
      this._setCSSParams();
      const FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (FormSupport) {
        FormSupport.syncNativeHiddenInput(this);
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    onAfterRendering() {
      const nativeTextArea = this.getInputDomRef();
      if (this.rows === 1) {
        nativeTextArea.setAttribute("rows", "1");
      } else {
        nativeTextArea.removeAttribute("rows");
      }
      this.toggleValueStateMessage(this.openValueStateMsgPopover);
      this._firstRendering = false;
    }
    getInputDomRef() {
      return this.getDomRef().querySelector("textarea");
    }
    _onkeydown(e) {
      this._keyDown = true;
      if ((0, _Keys.isEscape)(e)) {
        const nativeTextArea = this.getInputDomRef();
        this.value = this.previousValue;
        nativeTextArea.value = this.value;
        this.fireEvent("input");
      }
    }
    _onkeyup() {
      this._keyDown = false;
    }
    _onfocusin() {
      this.focused = true;
      this._openValueStateMsgPopover = true;
      this.previousValue = this.getInputDomRef().value;
    }
    _onfocusout(e) {
      const eTarget = e.relatedTarget;
      const focusedOutToValueStateMessage = eTarget?.shadowRoot?.querySelector(".ui5-valuestatemessage-root");
      this.focused = false;
      if (!focusedOutToValueStateMessage) {
        this._openValueStateMsgPopover = false;
      }
    }
    _onchange() {
      this.fireEvent("change", {});
    }
    _oninput(e) {
      const nativeTextArea = this.getInputDomRef();
      if (e.target === nativeTextArea) {
        // stop the native event, as the semantic "input" would be fired.
        e.stopImmediatePropagation();
      }
      this.value = nativeTextArea.value;
      this.fireEvent("input", {});
      // Angular two way data binding
      this.fireEvent("value-changed");
    }
    _onResize() {
      if (this.displayValueStateMessagePopover) {
        this._width = this.offsetWidth;
      }
    }
    _setCSSParams() {
      this.style.setProperty("--_textarea_rows", this.rows ? String(this.rows) : "2");
      this.style.setProperty("--_textarea_growing_max_lines", String(this.growingMaxLines));
    }
    toggleValueStateMessage(toggle) {
      if (toggle) {
        this.openPopover();
      } else {
        this.closePopover();
      }
    }
    async openPopover() {
      this.valueStatePopover = await this._getPopover();
      this.valueStatePopover && (await this.valueStatePopover.showAt(this.shadowRoot.querySelector(".ui5-textarea-root .ui5-textarea-wrapper")));
    }
    async closePopover() {
      this.valueStatePopover = await this._getPopover();
      this.valueStatePopover && this.valueStatePopover.close();
    }
    async _getPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-popover]");
    }
    _tokenizeText(value) {
      const tokenizedText = value.replace(/&/gm, "&amp;").replace(/"/gm, "&quot;").replace(/'/gm, "&apos;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").split("\n");
      if (tokenizedText.length < this.rows) {
        return this._mapTokenizedTextToObject([...tokenizedText, ...Array(this.rows - tokenizedText.length).fill("")]);
      }
      return this._mapTokenizedTextToObject(tokenizedText);
    }
    _mapTokenizedTextToObject(tokenizedText) {
      return tokenizedText.map((token, index) => {
        return {
          text: token,
          last: index === tokenizedText.length - 1
        };
      });
    }
    _calcExceededText() {
      let calcedMaxLength, exceededText, leftCharactersCount;
      if (this.showExceededText) {
        const maxLength = this.maxlength;
        if (maxLength !== null && maxLength !== undefined) {
          leftCharactersCount = maxLength - this.value.length;
          if (leftCharactersCount >= 0) {
            exceededText = TextArea_1.i18nBundle.getText(_i18nDefaults.TEXTAREA_CHARACTERS_LEFT, leftCharactersCount);
          } else {
            exceededText = TextArea_1.i18nBundle.getText(_i18nDefaults.TEXTAREA_CHARACTERS_EXCEEDED, Math.abs(leftCharactersCount));
          }
        }
      } else {
        calcedMaxLength = this.maxlength;
      }
      return {
        exceededText,
        leftCharactersCount,
        calcedMaxLength
      };
    }
    get classes() {
      return {
        root: {
          "ui5-textarea-root": true,
          "ui5-content-native-scrollbars": (0, _getEffectiveScrollbarStyle.default)()
        },
        valueStateMsg: {
          "ui5-valuestatemessage--error": this.valueState === _ValueState.default.Error,
          "ui5-valuestatemessage--warning": this.valueState === _ValueState.default.Warning,
          "ui5-valuestatemessage--information": this.valueState === _ValueState.default.Information
        }
      };
    }
    get styles() {
      return {
        valueStateMsgPopover: {
          "max-width": `${this._width}px`
        }
      };
    }
    get tabIndex() {
      return this.disabled ? -1 : 0;
    }
    get ariaLabelText() {
      const effectiveAriaLabelText = (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this) || (0, _AriaLabelHelper.getAssociatedLabelForTexts)(this);
      if (this.showExceededText) {
        if (effectiveAriaLabelText) {
          return effectiveAriaLabelText.concat(" ", this._exceededTextProps.exceededText);
        }
        return this._exceededTextProps.exceededText;
      }
      return effectiveAriaLabelText;
    }
    get ariaDescribedBy() {
      return this.hasValueState ? `${this._id}-valueStateDesc` : undefined;
    }
    get ariaValueStateHiddenText() {
      if (!this.hasValueState) {
        return;
      }
      if (this.valueState === _ValueState.default.None) {
        return;
      }
      if (this.hasCustomValueState) {
        return `${this.valueStateTypeMappings[this.valueState]}`.concat(" ", this.valueStateMessageText.map(el => el.textContent).join(" "));
      }
      return `${this.valueStateTypeMappings[this.valueState]} ${this.valueStateDefaultText}`;
    }
    get valueStateDefaultText() {
      if (this.valueState !== _ValueState.default.None) {
        return this.valueStateTextMappings[this.valueState];
      }
      return "";
    }
    get ariaInvalid() {
      return this.valueState === "Error" ? "true" : null;
    }
    get openValueStateMsgPopover() {
      return !this._firstRendering && this._openValueStateMsgPopover && this.displayValueStateMessagePopover;
    }
    get displayValueStateMessagePopover() {
      return !this.readonly && (this.hasCustomValueState || this.hasValueState);
    }
    get hasCustomValueState() {
      return !!this.valueStateMessage.length && this.hasValueState;
    }
    get hasValueState() {
      return this.valueState === _ValueState.default.Error || this.valueState === _ValueState.default.Warning || this.valueState === _ValueState.default.Information;
    }
    get valueStateMessageText() {
      return this.valueStateMessage.map(x => x.cloneNode(true));
    }
    get _valueStatePopoverHorizontalAlign() {
      return this.effectiveDir !== "rtl" ? "Left" : "Right";
    }
    /**
     * This method is relevant for sap_horizon theme only
     */
    get _valueStateMessageIcon() {
      const iconPerValueState = {
        Error: "error",
        Warning: "alert",
        Success: "sys-enter-2",
        Information: "information"
      };
      return this.valueState !== _ValueState.default.None ? iconPerValueState[this.valueState] : "";
    }
    get valueStateTextMappings() {
      return {
        "Success": TextArea_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Information": TextArea_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION),
        "Error": TextArea_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": TextArea_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING)
      };
    }
    get valueStateTypeMappings() {
      return {
        "Success": TextArea_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_SUCCESS),
        "Information": TextArea_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_INFORMATION),
        "Error": TextArea_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_ERROR),
        "Warning": TextArea_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_WARNING)
      };
    }
  };
  __decorate([(0, _property.default)()], TextArea.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TextArea.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TextArea.prototype, "readonly", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TextArea.prototype, "required", void 0);
  __decorate([(0, _property.default)()], TextArea.prototype, "placeholder", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], TextArea.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], TextArea.prototype, "rows", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: null
  })], TextArea.prototype, "maxlength", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TextArea.prototype, "showExceededText", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TextArea.prototype, "growing", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], TextArea.prototype, "growingMaxLines", void 0);
  __decorate([(0, _property.default)()], TextArea.prototype, "name", void 0);
  __decorate([(0, _property.default)()], TextArea.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], TextArea.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TextArea.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TextArea.prototype, "exceeding", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], TextArea.prototype, "_mirrorText", void 0);
  __decorate([(0, _property.default)({
    noAttribute: true
  })], TextArea.prototype, "_maxHeight", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], TextArea.prototype, "_width", void 0);
  __decorate([(0, _slot.default)()], TextArea.prototype, "valueStateMessage", void 0);
  __decorate([(0, _slot.default)()], TextArea.prototype, "formSupport", void 0);
  TextArea = TextArea_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-textarea",
    languageAware: true,
    styles: [_BrowserScrollbar.default, _TextArea.default],
    renderer: _LitRenderer.default,
    template: _TextAreaTemplate.default,
    staticAreaTemplate: _TextAreaPopoverTemplate.default,
    staticAreaStyles: _ValueStateMessage.default,
    dependencies: [_Popover.default, _Icon.default]
  })
  /**
   * Fired when the text has changed and the focus leaves the component.
   *
   * @event sap.ui.webc.main.TextArea#change
   * @public
   */, (0, _event.default)("change")
  /**
   * Fired when the value of the component changes at each keystroke or when
   * something is pasted.
   *
   * @event sap.ui.webc.main.TextArea#input
   * @since 1.0.0-rc.5
   * @public
   */, (0, _event.default)("input")], TextArea);
  TextArea.define();
  var _default = TextArea;
  _exports.default = _default;
});