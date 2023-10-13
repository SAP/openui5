sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "./generated/i18n/i18n-defaults", "./Input", "./generated/templates/MultiInputTemplate.lit", "./generated/themes/MultiInput.css", "./Token", "./Tokenizer", "./Icon", "sap/ui/webc/common/thirdparty/icons/value-help"], function (_exports, _property, _slot, _event, _customElement, _LitRenderer, _Keys, _CustomElementsScope, _i18nDefaults, _Input, _MultiInputTemplate, _MultiInput, _Token, _Tokenizer, _Icon, _valueHelp) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Input = _interopRequireDefault(_Input);
  _MultiInputTemplate = _interopRequireDefault(_MultiInputTemplate);
  _MultiInput = _interopRequireDefault(_MultiInput);
  _Token = _interopRequireDefault(_Token);
  _Tokenizer = _interopRequireWildcard(_Tokenizer);
  _Icon = _interopRequireDefault(_Icon);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var MultiInput_1;
  /**
   * @class
   * <h3>Overview</h3>
   * A <code>ui5-multi-input</code> field allows the user to enter multiple values, which are displayed as <code>ui5-token</code>.
   *
   * User can choose interaction for creating tokens.
   * Fiori Guidelines say that user should create tokens when:
   * <ul>
   * <li>Type a value in the input and press enter or focus out the input field (<code>change</code> event is fired)</li>
   * <li>Select a value from the suggestion list (<code>suggestion-item-select</code> event is fired)</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/MultiInput";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.MultiInput
   * @extends sap.ui.webc.main.Input
   * @tagname ui5-multi-input
   * @appenddocs sap.ui.webc.main.Token
   * @since 1.0.0-rc.9
   * @public
   */
  let MultiInput = MultiInput_1 = class MultiInput extends _Input.default {
    constructor() {
      super();
      // Prevent suggestions' opening.
      this._skipOpenSuggestions = false;
      this._valueHelpIconPressed = false;
    }
    valueHelpPress() {
      this.closePopover();
      this.fireEvent("value-help-trigger");
    }
    showMorePress() {
      this.expandedTokenizer = false;
      this.focus();
    }
    tokenDelete(e) {
      const focusedToken = e.detail.ref;
      const selectedTokens = this.tokens.filter(token => token.selected);
      const shouldFocusInput = this.tokens.length - 1 === 0 || this.tokens.length === selectedTokens.length;
      if (this._readonly) {
        return;
      }
      if (focusedToken) {
        this.fireEvent("token-delete", {
          token: focusedToken
        });
        if (shouldFocusInput) {
          this.focus();
        }
        return;
      }
      if (selectedTokens.indexOf(focusedToken) === -1) {
        selectedTokens.push(focusedToken);
      }
      selectedTokens.forEach(token => {
        this.fireEvent("token-delete", {
          token
        });
      });
    }
    valueHelpMouseDown(e) {
      const target = e.target;
      this.closePopover();
      this.tokenizer.closeMorePopover();
      this._valueHelpIconPressed = true;
      target.focus();
    }
    _tokenizerFocusOut(e) {
      const isFocusingMorePopover = e.relatedTarget === this.tokenizer.staticAreaItem;
      if (!this.contains(e.relatedTarget) && !isFocusingMorePopover) {
        this.tokenizer._tokens.forEach(token => {
          token.selected = false;
        });
        this.tokenizer.scrollToStart();
      }
      if (e.relatedTarget === this.nativeInput) {
        this.tokenizer.closeMorePopover();
      }
    }
    valueHelpMouseUp() {
      setTimeout(() => {
        this._valueHelpIconPressed = false;
      }, 0);
    }
    innerFocusIn() {
      this.expandedTokenizer = true;
      this.focused = true;
      this.tokenizer.scrollToEnd();
      this.tokenizer._getTokens().forEach(token => {
        token.selected = false;
      });
    }
    _onkeydown(e) {
      super._onkeydown(e);
      const target = e.target;
      const isHomeInBeginning = (0, _Keys.isHome)(e) && target.selectionStart === 0;
      const isCtrl = e.metaKey || e.ctrlKey;
      const tokens = this.tokens;
      if (isHomeInBeginning) {
        this._skipOpenSuggestions = true; // Prevent input focus when navigating through the tokens
        return this._focusFirstToken(e);
      }
      if ((0, _Keys.isLeft)(e) || (0, _Keys.isBackSpace)(e)) {
        this._skipOpenSuggestions = true;
        return this._handleLeft(e);
      }
      this._skipOpenSuggestions = false;
      if ((0, _Keys.isShow)(e)) {
        this.valueHelpPress();
      }
      if (isCtrl && e.key.toLowerCase() === "i" && tokens.length > 0) {
        e.preventDefault();
        this.tokenizer.openMorePopover();
      }
    }
    _onTokenizerKeydown(e) {
      const rightCtrl = (0, _Keys.isRightCtrl)(e);
      const isCtrl = !!(e.metaKey || e.ctrlKey);
      const tokens = this.tokens;
      if ((0, _Keys.isRight)(e) || (0, _Keys.isEnd)(e) || rightCtrl) {
        e.preventDefault();
        const lastTokenIndex = this.tokens.length - 1;
        if (e.target === this.tokens[lastTokenIndex] && this.tokens[lastTokenIndex] === document.activeElement) {
          setTimeout(() => {
            this.focus();
          }, 0);
        } else if (rightCtrl) {
          e.preventDefault();
          return this.tokenizer._handleArrowCtrl(e, e.target, this.tokens, true);
        }
      }
      if (isCtrl && ["c", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        const isCut = e.key.toLowerCase() === "x";
        const selectedTokens = tokens.filter(token => token.selected);
        if (isCut) {
          const cutResult = this.tokenizer._fillClipboard(_Tokenizer.ClipboardDataOperation.cut, selectedTokens);
          selectedTokens.forEach(token => {
            this.fireEvent("token-delete", {
              token
            });
          });
          this.focus();
          return cutResult;
        }
        return this.tokenizer._fillClipboard(_Tokenizer.ClipboardDataOperation.copy, selectedTokens);
      }
      if (isCtrl && e.key.toLowerCase() === "i" && tokens.length > 0) {
        e.preventDefault();
        this.tokenizer.openMorePopover();
      }
    }
    _handleLeft(e) {
      const cursorPosition = this.getDomRef().querySelector(`input`).selectionStart;
      const tokens = this.tokens;
      const lastToken = tokens.length && tokens[tokens.length - 1];
      if (cursorPosition === 0 && lastToken) {
        e.preventDefault();
        lastToken.focus();
        this.tokenizer._itemNav.setCurrentItem(lastToken);
      }
    }
    _focusFirstToken(e) {
      const tokens = this.tokens;
      const firstToken = tokens.length && tokens[0];
      if (firstToken) {
        e.preventDefault();
        firstToken.focus();
        this.tokenizer._itemNav.setCurrentItem(firstToken);
      }
    }
    _onfocusout(e) {
      super._onfocusout(e);
      const relatedTarget = e.relatedTarget;
      const insideDOM = this.contains(relatedTarget);
      const insideShadowDom = this.shadowRoot.contains(relatedTarget);
      if (!insideDOM && !insideShadowDom) {
        this.expandedTokenizer = false;
        // we need to reset tabindex setting by tokenizer
        this.tokenizer._itemNav._currentIndex = -1;
      }
    }
    /**
     * @override
     */
    async _onfocusin(e) {
      const inputDomRef = await this.getInputDOMRef();
      if (e.target === inputDomRef) {
        await super._onfocusin(e);
      }
    }
    lastItemDeleted() {
      setTimeout(() => {
        this.focus();
      }, 0);
    }
    onBeforeRendering() {
      super.onBeforeRendering();
      this.style.setProperty((0, _CustomElementsScope.getScopedVarName)("--_ui5-input-icons-count"), `${this.iconsCount}`);
      this.tokenizerAvailable = this.tokens && this.tokens.length > 0;
    }
    get iconsCount() {
      return super.iconsCount + (this.showValueHelpIcon ? 1 : 0);
    }
    get tokenizer() {
      return this.shadowRoot.querySelector("[ui5-tokenizer]");
    }
    get _tokensCountText() {
      if (!this.tokenizer) {
        return;
      }
      return this.tokenizer._tokensCountText();
    }
    get _tokensCountTextId() {
      return `${this._id}-hiddenText-nMore`;
    }
    /**
     * Returns the placeholder value when there are no tokens.
     * @protected
     */
    get _placeholder() {
      if (this.tokenizer && this.tokenizer._tokens.length) {
        return "";
      }
      return this.placeholder;
    }
    get accInfo() {
      const ariaDescribedBy = `${this._tokensCountTextId} ${this.suggestionsTextId} ${this.valueStateTextId}`.trim();
      return {
        "input": {
          ...super.accInfo.input,
          "ariaRoledescription": this.ariaRoleDescription,
          "ariaDescribedBy": ariaDescribedBy
        }
      };
    }
    get ariaRoleDescription() {
      return MultiInput_1.i18nBundle.getText(_i18nDefaults.MULTIINPUT_ROLEDESCRIPTION_TEXT);
    }
    get morePopoverOpener() {
      if (this.tokens.length === 1 && this.tokens[0].isTruncatable) {
        return this.tokens[0];
      }
      return this;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiInput.prototype, "showValueHelpIcon", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiInput.prototype, "expandedTokenizer", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiInput.prototype, "tokenizerAvailable", void 0);
  __decorate([(0, _slot.default)()], MultiInput.prototype, "tokens", void 0);
  MultiInput = MultiInput_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-multi-input",
    renderer: _LitRenderer.default,
    template: _MultiInputTemplate.default,
    styles: [_Input.default.styles, _MultiInput.default],
    dependencies: [..._Input.default.dependencies, _Tokenizer.default, _Token.default, _Icon.default]
  })
  /**
   * Fired when the value help icon is pressed
   * and F4 or ALT/OPTION + ARROW_UP/ARROW_DOWN keyboard keys are used.
   *
   * @event sap.ui.webc.main.MultiInput#value-help-trigger
   * @public
   */, (0, _event.default)("value-help-trigger")
  /**
   * Fired when a token is about to be deleted.
   *
   * @event sap.ui.webc.main.MultiInput#token-delete
   * @param {HTMLElement} token deleted token.
   * @public
   */, (0, _event.default)("token-delete", {
    detail: {
      token: {
        type: HTMLElement
      }
    }
  })], MultiInput);
  MultiInput.define();
  var _default = MultiInput;
  _exports.default = _default;
});