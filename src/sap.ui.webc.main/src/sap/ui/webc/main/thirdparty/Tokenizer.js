sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/delegate/ScrollEnablement", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/types/ValueState", "./ResponsivePopover", "./List", "./Title", "./Button", "./StandardListItem", "./generated/templates/TokenizerTemplate.lit", "./generated/templates/TokenizerPopoverTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Tokenizer.css", "./generated/themes/TokenizerPopover.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/Suggestions.css"], function (_exports, _UI5Element, _property, _slot, _event, _customElement, _LitRenderer, _ResizeHandler, _ItemNavigation, _ScrollEnablement, _Integer, _i18nBundle, _Keys, _Device, _ValueState, _ResponsivePopover, _List, _Title, _Button, _StandardListItem, _TokenizerTemplate, _TokenizerPopoverTemplate, _i18nDefaults, _Tokenizer, _TokenizerPopover, _ResponsivePopoverCommon, _ValueStateMessage, _Suggestions) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _exports.ClipboardDataOperation = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _ScrollEnablement = _interopRequireDefault(_ScrollEnablement);
  _Integer = _interopRequireDefault(_Integer);
  _ValueState = _interopRequireDefault(_ValueState);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _List = _interopRequireDefault(_List);
  _Title = _interopRequireDefault(_Title);
  _Button = _interopRequireDefault(_Button);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _TokenizerTemplate = _interopRequireDefault(_TokenizerTemplate);
  _TokenizerPopoverTemplate = _interopRequireDefault(_TokenizerPopoverTemplate);
  _Tokenizer = _interopRequireDefault(_Tokenizer);
  _TokenizerPopover = _interopRequireDefault(_TokenizerPopover);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  _ValueStateMessage = _interopRequireDefault(_ValueStateMessage);
  _Suggestions = _interopRequireDefault(_Suggestions);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Tokenizer_1;

  // Styles

  // reuse suggestions focus styling for NMore popup

  var ClipboardDataOperation;
  _exports.ClipboardDataOperation = ClipboardDataOperation;
  (function (ClipboardDataOperation) {
    ClipboardDataOperation["cut"] = "cut";
    ClipboardDataOperation["copy"] = "copy";
  })(ClipboardDataOperation || (_exports.ClipboardDataOperation = ClipboardDataOperation = {}));
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * A container for tokens.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Tokenizer
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-tokenizer
   * @usestextcontent
   * @private
   */
  let Tokenizer = Tokenizer_1 = class Tokenizer extends _UI5Element.default {
    _handleResize() {
      this._nMoreCount = this.overflownTokens.length;
    }
    constructor() {
      super();
      this._resizeHandler = this._handleResize.bind(this);
      this._itemNav = new _ItemNavigation.default(this, {
        currentIndex: -1,
        getItemsCallback: this._getVisibleTokens.bind(this)
      });
      this._scrollEnablement = new _ScrollEnablement.default(this);
    }
    onBeforeRendering() {
      this._nMoreCount = this.overflownTokens.length;
      this._tokensCount = this._getTokens().length;
      this._tokens.forEach(token => {
        token.singleToken = this._tokens.length === 1;
      });
      if (!this._tokens.length) {
        this.closeMorePopover();
      }
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this.contentDom, this._resizeHandler);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this.contentDom, this._resizeHandler);
    }
    async _openMorePopoverAndFireEvent() {
      if (!this.preventPopoverOpen) {
        await this.openMorePopover();
      }
      this.fireEvent("show-more-items-press");
    }
    async openMorePopover() {
      (await this.getPopover()).showAt(this.morePopoverOpener || this);
    }
    _getTokens() {
      return this.getSlottedNodes("tokens");
    }
    get _tokens() {
      return this.getSlottedNodes("tokens");
    }
    _onmousedown(e) {
      if (e.target.hasAttribute("ui5-token")) {
        const target = e.target;
        if (!target.toBeDeleted) {
          this._itemNav.setCurrentItem(target);
        }
      }
    }
    onTokenSelect() {
      const tokens = this._getTokens();
      if (tokens.length === 1 && tokens[0].isTruncatable) {
        if (tokens[0].selected) {
          this.openMorePopover();
        } else {
          this.closeMorePopover();
        }
      }
    }
    _getVisibleTokens() {
      if (this.disabled) {
        return [];
      }
      return this._tokens.filter((token, index) => {
        return index < this._tokens.length - this._nMoreCount;
      });
    }
    async onAfterRendering() {
      if (!this._getTokens().length) {
        const popover = await this.getPopover();
        popover.close();
      }
      this._scrollEnablement.scrollContainer = this.expanded || !this.narrowContentDom ? this.expandedContentDom : this.narrowContentDom;
      if (this.expanded) {
        this._expandedScrollWidth = this.expandedContentDom.scrollWidth;
        this.scrollToEnd();
      }
      if (!this.expanded) {
        this.scrollToStart();
      }
    }
    _delete(e) {
      const target = e.target;
      if (!e.detail) {
        // if there are no details, the event is triggered by a click
        this._tokenClickDelete(e, target);
        if (this._getTokens().length) {
          this.closeMorePopover();
        }
        return;
      }
      if (this._selectedTokens.length) {
        this._selectedTokens.forEach(token => this.deleteToken(token, e.detail.backSpace));
      } else {
        this.deleteToken(target, e.detail.backSpace);
      }
    }
    _tokenClickDelete(e, token) {
      const tokens = this._getVisibleTokens();
      const target = e.target;
      const deletedTokenIndex = token ? tokens.indexOf(token) : tokens.indexOf(target); // The index of the token that just got deleted
      const nextTokenIndex = deletedTokenIndex === tokens.length - 1 ? deletedTokenIndex - 1 : deletedTokenIndex + 1; // The index of the next token that needs to be focused next due to the deletion
      const nextToken = tokens[nextTokenIndex]; // if the last item was deleted this will be undefined
      this._handleCurrentItemAfterDeletion(nextToken);
      this.fireEvent("token-delete", {
        ref: token || target
      });
    }
    _handleCurrentItemAfterDeletion(nextToken) {
      if (nextToken && !(0, _Device.isPhone)()) {
        this._itemNav.setCurrentItem(nextToken); // update the item navigation with the new token or undefined, if the last was deleted
        setTimeout(() => {
          nextToken.focus();
        }, 0);
      }
    }
    /**
     * Removes a token from the Tokenizer.
     * This method should only be used by ui5-multi-combobox and ui5-multi-input
     *
     * @protected
     * @param token Token to be focused.
     * @param forwardFocusToPrevious Indicates whether the focus will be forwarded to previous or next token after deletion.
     */
    deleteToken(token, forwardFocusToPrevious) {
      const tokens = this._getVisibleTokens();
      const deletedTokenIndex = tokens.indexOf(token);
      let nextTokenIndex = deletedTokenIndex === tokens.length - 1 ? deletedTokenIndex - 1 : deletedTokenIndex + 1;
      const notSelectedTokens = tokens.filter(t => !t.selected);
      if (forwardFocusToPrevious) {
        // on backspace key select the previous item (unless deleting the first)
        nextTokenIndex = deletedTokenIndex === 0 ? deletedTokenIndex + 1 : deletedTokenIndex - 1;
      } else {
        // on delete key or mouse click on the "x" select the next item (unless deleting the last)
        nextTokenIndex = deletedTokenIndex === tokens.length - 1 ? deletedTokenIndex - 1 : deletedTokenIndex + 1;
      }
      let nextToken = tokens[nextTokenIndex];
      if (notSelectedTokens.length > 1) {
        while (nextToken && nextToken.selected) {
          nextToken = forwardFocusToPrevious ? tokens[--nextTokenIndex] : tokens[++nextTokenIndex];
        }
      } else {
        nextToken = notSelectedTokens[0];
      }
      this._handleCurrentItemAfterDeletion(nextToken);
      this.fireEvent("token-delete", {
        ref: token
      });
    }
    async itemDelete(e) {
      const token = e.detail.item.tokenRef;
      // delay the token deletion in order to close the popover before removing token of the DOM
      if (this._getTokens().length === 1 && this._getTokens()[0].isTruncatable) {
        const morePopover = await this.getPopover();
        morePopover.addEventListener("ui5-after-close", () => {
          this.fireEvent("token-delete", {
            ref: token
          });
        }, {
          once: true
        });
        morePopover.close();
      } else {
        this.fireEvent("token-delete", {
          ref: token
        });
      }
    }
    handleBeforeClose() {
      if ((0, _Device.isPhone)()) {
        this._getTokens().forEach(token => {
          token.selected = false;
        });
      }
    }
    handleBeforeOpen() {
      this.fireEvent("before-more-popover-open");
    }
    _onkeydown(e) {
      if ((0, _Keys.isSpaceShift)(e)) {
        e.preventDefault();
      }
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isSpaceCtrl)(e)) {
        e.preventDefault();
        return this._handleTokenSelection(e, false);
      }
      if ((0, _Keys.isHomeShift)(e)) {
        this._handleHomeShift(e);
      }
      if ((0, _Keys.isEndShift)(e)) {
        this._handleEndShift(e);
      }
      this._handleItemNavigation(e, this._tokens);
    }
    _handleItemNavigation(e, tokens) {
      const isCtrl = !!(e.metaKey || e.ctrlKey);
      const target = e.target;
      if ((0, _Keys.isLeftCtrl)(e) || (0, _Keys.isRightCtrl)(e) || (0, _Keys.isDownCtrl)(e) || (0, _Keys.isUpCtrl)(e)) {
        return this._handleArrowCtrl(e, target, tokens, (0, _Keys.isRightCtrl)(e) || (0, _Keys.isDownCtrl)(e));
      }
      if ((0, _Keys.isLeftShift)(e) || (0, _Keys.isRightShift)(e) || (0, _Keys.isUpShift)(e) || (0, _Keys.isDownShift)(e) || (0, _Keys.isLeftShiftCtrl)(e) || (0, _Keys.isRightShiftCtrl)(e)) {
        e.preventDefault();
        return this._handleArrowShift(target, tokens, (0, _Keys.isRightShift)(e) || (0, _Keys.isRightShiftCtrl)(e) || (0, _Keys.isDownShift)(e));
      }
      if ((0, _Keys.isHome)(e) || (0, _Keys.isEnd)(e) || (0, _Keys.isHomeCtrl)(e) || (0, _Keys.isEndCtrl)(e)) {
        e.preventDefault();
        return this._handleHome(tokens, (0, _Keys.isEnd)(e) || (0, _Keys.isEndCtrl)(e));
      }
      if (isCtrl && e.key.toLowerCase() === "a") {
        e.preventDefault();
        return this._toggleTokenSelection(tokens);
      }
      if ((0, _Keys.isLeft)(e) || (0, _Keys.isRight)(e) || (0, _Keys.isUp)(e) || (0, _Keys.isDown)(e)) {
        const nextTokenIdx = this._calcNextTokenIndex(this._tokens.find(token => token.focused), tokens, (0, _Keys.isRight)(e) || (0, _Keys.isDown)(e));
        this._scrollToToken(tokens[nextTokenIdx]);
      }
    }
    _handleHome(tokens, endKeyPressed) {
      if (!tokens || !tokens.length) {
        return -1;
      }
      const index = endKeyPressed ? tokens.length - 1 : 0;
      tokens[index].focus();
      this._itemNav.setCurrentItem(tokens[index]);
    }
    _handleHomeShift(e) {
      const tokens = this.tokens;
      const target = e.target;
      const currentTokenIdx = tokens.indexOf(target);
      tokens.filter((token, index) => index <= currentTokenIdx).forEach(token => {
        token.selected = true;
      });
      tokens[0].focus();
      this._itemNav.setCurrentItem(tokens[0]);
    }
    _handleEndShift(e) {
      const tokens = this.tokens;
      const target = e.target;
      const currentTokenIdx = tokens.indexOf(target);
      tokens.filter((token, index) => index >= currentTokenIdx).forEach(token => {
        token.selected = true;
      });
      tokens[tokens.length - 1].focus();
      this._itemNav.setCurrentItem(tokens[tokens.length - 1]);
    }
    _calcNextTokenIndex(focusedToken, tokens, backwards) {
      if (!tokens.length) {
        return -1;
      }
      const focusedTokenIndex = tokens.indexOf(focusedToken);
      let nextIndex = backwards ? focusedTokenIndex + 1 : focusedTokenIndex - 1;
      if (nextIndex >= tokens.length) {
        nextIndex = tokens.length - 1;
      }
      if (nextIndex < 0) {
        nextIndex = 0;
      }
      return nextIndex;
    }
    _handleArrowCtrl(e, focusedToken, tokens, backwards) {
      const nextIndex = this._calcNextTokenIndex(focusedToken, tokens, backwards);
      e.preventDefault();
      if (nextIndex === -1) {
        return;
      }
      setTimeout(() => {
        tokens[nextIndex].focus();
      }, 0);
      this._scrollToToken(tokens[nextIndex]);
      this._itemNav.setCurrentItem(tokens[nextIndex]);
    }
    _handleArrowShift(focusedToken, tokens, backwards) {
      const focusedTokenIndex = tokens.indexOf(focusedToken);
      const nextIndex = backwards ? focusedTokenIndex + 1 : focusedTokenIndex - 1;
      if (nextIndex === -1 || nextIndex === tokens.length) {
        return;
      }
      focusedToken.selected = true;
      tokens[nextIndex].selected = true;
      setTimeout(() => {
        tokens[nextIndex].focus();
      }, 0);
      this._scrollToToken(tokens[nextIndex]);
      this._itemNav.setCurrentItem(tokens[nextIndex]);
    }
    _click(e) {
      this._handleTokenSelection(e);
    }
    _toggleTokenSelection(tokens) {
      if (!tokens || !tokens.length) {
        return;
      }
      const tokensAreSelected = tokens.every(token => token.selected);
      tokens.forEach(token => {
        token.selected = !tokensAreSelected;
      });
    }
    _handleTokenSelection(e, deselectAll = true) {
      const target = e.target;
      if (target.hasAttribute("ui5-token")) {
        const deselectTokens = deselectAll ? this._tokens : [];
        deselectTokens.forEach(token => {
          if (token !== target) {
            token.selected = false;
          }
        });
      }
    }
    _fillClipboard(shortcutName, tokens) {
      const tokensTexts = tokens.filter(token => token.selected).map(token => token.text).join("\r\n");
      /* fill clipboard with tokens' texts so parent can handle creation */
      const cutToClipboard = e => {
        if (e.clipboardData) {
          e.clipboardData.setData("text/plain", tokensTexts);
        }
        e.preventDefault();
      };
      document.addEventListener(shortcutName, cutToClipboard);
      document.execCommand(shortcutName);
      document.removeEventListener(shortcutName, cutToClipboard);
    }
    /**
     * Scrolls the container of the tokens to its beginning.
     * This method is used by MultiInput and MultiComboBox.
     * @private
     */
    scrollToStart() {
      if (this._scrollEnablement.scrollContainer) {
        this._scrollEnablement.scrollTo(0, 0);
      }
    }
    /**
     * Scrolls the container of the tokens to its end when expanded.
     * This method is used by MultiInput and MultiComboBox.
     * @private
     */
    scrollToEnd() {
      const expandedTokenizerScrollWidth = this.expandedContentDom && (this.effectiveDir !== "rtl" ? this.expandedContentDom.scrollWidth : -this.expandedContentDom.scrollWidth);
      if (this._scrollEnablement.scrollContainer) {
        this._scrollEnablement.scrollTo(expandedTokenizerScrollWidth, 0, 5, 10);
      }
    }
    /**
     * Scrolls token to the visible area of the container.
     * Adds 4 pixels to the scroll position to ensure padding and border visibility on both ends
     * @private
     */
    _scrollToToken(token) {
      if (!this.expandedContentDom) {
        return;
      }
      const tokenRect = token.getBoundingClientRect();
      const tokenContainerRect = this.expandedContentDom.getBoundingClientRect();
      if (tokenRect.left < tokenContainerRect.left) {
        this._scrollEnablement.scrollTo(this.expandedContentDom.scrollLeft - (tokenContainerRect.left - tokenRect.left + 5), 0);
      } else if (tokenRect.right > tokenContainerRect.right) {
        this._scrollEnablement.scrollTo(this.expandedContentDom.scrollLeft + (tokenRect.right - tokenContainerRect.right + 5), 0);
      }
    }
    async closeMorePopover() {
      (await this.getPopover()).close(false, false, true);
    }
    get _nMoreText() {
      if (this._getVisibleTokens().length) {
        return Tokenizer_1.i18nBundle.getText(_i18nDefaults.MULTIINPUT_SHOW_MORE_TOKENS, this._nMoreCount);
      }
      return Tokenizer_1.i18nBundle.getText(_i18nDefaults.TOKENIZER_SHOW_ALL_ITEMS, this._nMoreCount);
    }
    get showNMore() {
      return !this.expanded && this.showMore && !!this.overflownTokens.length;
    }
    get contentDom() {
      return this.shadowRoot.querySelector(".ui5-tokenizer--content");
    }
    get expandedContentDom() {
      return this.shadowRoot.querySelector(".ui5-tokenizer-expanded--content");
    }
    get narrowContentDom() {
      return this.shadowRoot.querySelector(".ui5-tokenizer-nmore--content");
    }
    get tokenizerLabel() {
      return Tokenizer_1.i18nBundle.getText(_i18nDefaults.TOKENIZER_ARIA_LABEL);
    }
    get morePopoverTitle() {
      return Tokenizer_1.i18nBundle.getText(_i18nDefaults.TOKENIZER_POPOVER_REMOVE);
    }
    get overflownTokens() {
      if (!this.contentDom) {
        return [];
      }
      // Reset the overflow prop of the tokens first in order
      // to use their dimensions for calculation because already
      // hidden tokens are set to 'display: none'
      this._getTokens().forEach(token => {
        token.overflows = false;
      });
      return this._getTokens().filter(token => {
        const parentRect = this.contentDom.getBoundingClientRect();
        const tokenRect = token.getBoundingClientRect();
        const tokenEnd = Number(tokenRect.right.toFixed(2));
        const parentEnd = Number(parentRect.right.toFixed(2));
        const tokenStart = Number(tokenRect.left.toFixed(2));
        const parentStart = Number(parentRect.left.toFixed(2));
        token.overflows = !this.expanded && (tokenStart < parentStart || tokenEnd > parentEnd);
        return token.overflows;
      });
    }
    get hasValueState() {
      return this.valueState === _ValueState.default.None || this.valueState === _ValueState.default.Success;
    }
    get valueStateMessageText() {
      return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
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
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
    get _selectedTokens() {
      return this._getTokens().filter(token => token.selected);
    }
    get classes() {
      return {
        wrapper: {
          "ui5-tokenizer-root": true,
          "ui5-tokenizer-nmore--wrapper": this.showMore,
          "ui5-tokenizer-no-padding": !this._getTokens().length
        },
        content: {
          "ui5-tokenizer--content": true,
          "ui5-tokenizer-expanded--content": !this.showNMore,
          "ui5-tokenizer-nmore--content": this.showNMore
        },
        popoverValueState: {
          "ui5-valuestatemessage-root": true,
          "ui5-responsive-popover-header": true,
          "ui5-valuestatemessage--success": this.valueState === _ValueState.default.Success,
          "ui5-valuestatemessage--error": this.valueState === _ValueState.default.Error,
          "ui5-valuestatemessage--warning": this.valueState === _ValueState.default.Warning,
          "ui5-valuestatemessage--information": this.valueState === _ValueState.default.Information
        }
      };
    }
    get styles() {
      return {
        popover: {
          "min-width": this.popoverMinWidth ? `${this.popoverMinWidth}px` : ""
        },
        popoverValueStateMessage: {
          "width": this.popoverMinWidth && !(0, _Device.isPhone)() ? `${this.popoverMinWidth}px` : "100%",
          "min-height": "2rem"
        },
        popoverHeader: {
          "min-height": "2rem"
        },
        popoverHeaderTitle: {
          "justify-content": "left"
        }
      };
    }
    _tokensCountText() {
      const iTokenCount = this._getTokens().length;
      if (iTokenCount === 0) {
        return Tokenizer_1.i18nBundle.getText(_i18nDefaults.TOKENIZER_ARIA_CONTAIN_TOKEN);
      }
      if (iTokenCount === 1) {
        return Tokenizer_1.i18nBundle.getText(_i18nDefaults.TOKENIZER_ARIA_CONTAIN_ONE_TOKEN);
      }
      return Tokenizer_1.i18nBundle.getText(_i18nDefaults.TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS, iTokenCount);
    }
    /**
     * @protected
     */
    _focusLastToken() {
      if (this.tokens.length === 0) {
        return;
      }
      const lastToken = this.tokens[this.tokens.length - 1];
      lastToken.focus();
      this._itemNav.setCurrentItem(lastToken);
    }
    static async onDefine() {
      Tokenizer_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    async getPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tokenizer.prototype, "showMore", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tokenizer.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tokenizer.prototype, "preventPopoverOpen", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Tokenizer.prototype, "expanded", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], Tokenizer.prototype, "morePopoverOpener", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], Tokenizer.prototype, "popoverMinWidth", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], Tokenizer.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], Tokenizer.prototype, "_nMoreCount", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default
  })], Tokenizer.prototype, "_tokensCount", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true,
    individualSlots: true
  })], Tokenizer.prototype, "tokens", void 0);
  __decorate([(0, _slot.default)()], Tokenizer.prototype, "valueStateMessage", void 0);
  Tokenizer = Tokenizer_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-tokenizer",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _TokenizerTemplate.default,
    styles: _Tokenizer.default,
    staticAreaStyles: [_ResponsivePopoverCommon.default, _ValueStateMessage.default, _Suggestions.default, _TokenizerPopover.default],
    staticAreaTemplate: _TokenizerPopoverTemplate.default,
    dependencies: [_ResponsivePopover.default, _List.default, _StandardListItem.default, _Title.default, _Button.default]
  }), (0, _event.default)("token-delete", {
    detail: {
      ref: {
        type: HTMLElement
      }
    }
  }), (0, _event.default)("show-more-items-press", {
    detail: {
      ref: {
        type: HTMLElement
      }
    }
  }), (0, _event.default)("before-more-popover-open", {
    detail: {}
  })], Tokenizer);
  Tokenizer.define();
  var _default = Tokenizer;
  _exports.default = _default;
});