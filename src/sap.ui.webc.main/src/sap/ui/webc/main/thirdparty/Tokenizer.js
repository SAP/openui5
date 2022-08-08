sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/delegate/ScrollEnablement", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/types/ValueState", "./ResponsivePopover", "./List", "./Title", "./Button", "./StandardListItem", "./generated/templates/TokenizerTemplate.lit", "./generated/templates/TokenizerPopoverTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Tokenizer.css", "./generated/themes/TokenizerPopover.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/Suggestions.css"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _ItemNavigation, _ScrollEnablement, _Integer, _i18nBundle, _Keys, _Device, _ValueState, _ResponsivePopover, _List, _Title, _Button, _StandardListItem, _TokenizerTemplate, _TokenizerPopoverTemplate, _i18nDefaults, _Tokenizer, _TokenizerPopover, _ResponsivePopoverCommon, _ValueStateMessage, _Suggestions) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
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

  // Styles
  // reuse suggestions focus styling for NMore popup

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-tokenizer",
    languageAware: true,
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Tokenizer.prototype */
    {
      "default": {
        propertyName: "tokens",
        type: HTMLElement,
        individualSlots: true
      },
      "valueStateMessage": {
        propertyName: "valueStateMessage",
        type: HTMLElement
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.main.Tokenizer.prototype */
    {
      showMore: {
        type: Boolean
      },
      disabled: {
        type: Boolean
      },

      /**
       * Indicates if the tokenizer should show all tokens or n more label instead
       *
       * @private
       */
      expanded: {
        type: Boolean
      },
      morePopoverOpener: {
        type: Object
      },
      popoverMinWidth: {
        type: _Integer.default
      },

      /**
       * Indicates the value state of the related input component.
       *
       * @type {ValueState}
       * @defaultvalue "None"
       * @private
       */
      valueState: {
        type: _ValueState.default,
        defaultValue: _ValueState.default.None
      },
      _nMoreCount: {
        type: _Integer.default
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Tokenizer.prototype */
    {
      "token-delete": {
        detail: {
          ref: {
            type: HTMLElement
          }
        }
      },
      "show-more-items-press": {
        detail: {
          ref: {
            type: HTMLElement
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
   * A container for tokens.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Tokenizer
   * @extends UI5Element
   * @tagname ui5-tokenizer
   * @usestextcontent
   * @private
   */

  class Tokenizer extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _TokenizerTemplate.default;
    }

    static get styles() {
      return _Tokenizer.default;
    }

    static get staticAreaStyles() {
      return [_ResponsivePopoverCommon.default, _ValueStateMessage.default, _Suggestions.default, _TokenizerPopover.default];
    }

    static get staticAreaTemplate() {
      return _TokenizerPopoverTemplate.default;
    }

    _handleResize() {
      this._nMoreCount = this.overflownTokens.length;
    }

    constructor() {
      super();
      this._resizeHandler = this._handleResize.bind(this);
      this._itemNav = new _ItemNavigation.default(this, {
        currentIndex: "-1",
        getItemsCallback: this._getVisibleTokens.bind(this)
      });
      this._scrollEnablement = new _ScrollEnablement.default(this);
    }

    async onBeforeRendering() {
      if (this.showPopover && !this._getTokens().length) {
        const popover = await this.getPopover();
        popover.close();
      }

      this._nMoreCount = this.overflownTokens.length;
    }

    onEnterDOM() {
      _ResizeHandler.default.register(this.shadowRoot.querySelector(".ui5-tokenizer--content"), this._resizeHandler);
    }

    onExitDOM() {
      _ResizeHandler.default.deregister(this.shadowRoot.querySelector(".ui5-tokenizer--content"), this._resizeHandler);
    }

    async _openOverflowPopover() {
      if (this.showPopover) {
        const popover = await this.getPopover();
        popover.showAt(this.morePopoverOpener || this);
      }

      this.fireEvent("show-more-items-press");
    }

    _getTokens() {
      return this.getSlottedNodes("tokens");
    }

    get _tokens() {
      return this.getSlottedNodes("tokens");
    }

    get showPopover() {
      return Object.keys(this.morePopoverOpener).length;
    }

    _getVisibleTokens() {
      if (this.disabled) {
        return [];
      }

      return this._tokens.filter((token, index) => {
        return index < this._tokens.length - this._nMoreCount;
      });
    }

    onAfterRendering() {
      this._scrollEnablement.scrollContainer = this.expanded ? this.contentDom : this;
    }

    _delete(event) {
      if (this._selectedTokens.length) {
        this._selectedTokens.forEach(token => this._tokenDelete(event, token));
      } else {
        this._tokenDelete(event);
      }
    }

    _tokenDelete(event, token) {
      let nextTokenIndex; // The index of the next token that needs to be focused next due to the deletion

      const tokens = this._getVisibleTokens();

      const deletedTokenIndex = token ? tokens.indexOf(token) : tokens.indexOf(event.target); // The index of the token that just got deleted

      const notSelectedTokens = tokens.filter(t => !t.selected);

      if (event.detail && event.detail.backSpace) {
        // on backspace key select the previous item (unless deleting the first)
        nextTokenIndex = deletedTokenIndex === 0 ? deletedTokenIndex + 1 : deletedTokenIndex - 1;
      } else {
        // on delete key or mouse click on the "x" select the next item (unless deleting the last)
        nextTokenIndex = deletedTokenIndex === tokens.length - 1 ? deletedTokenIndex - 1 : deletedTokenIndex + 1;
      }

      let nextToken = tokens[nextTokenIndex]; // if the last item was deleted this will be undefined

      if (notSelectedTokens.length > 1) {
        while (nextToken && nextToken.selected) {
          nextToken = event.detail.backSpace ? tokens[--nextTokenIndex] : tokens[++nextTokenIndex];
        }
      } else {
        nextToken = notSelectedTokens[0];
      }

      if (nextToken && !(0, _Device.isPhone)()) {
        this._itemNav.setCurrentItem(nextToken); // update the item navigation with the new token or undefined, if the last was deleted


        setTimeout(() => {
          nextToken.focus();
        }, 0);
      }

      this.fireEvent("token-delete", {
        ref: token || event.target
      });
    }

    itemDelete(event) {
      const token = event.detail.item.tokenRef;
      this.fireEvent("token-delete", {
        ref: token
      });
    }

    _onkeydown(event) {
      if ((0, _Keys.isSpaceShift)(event)) {
        event.preventDefault();
      }

      if ((0, _Keys.isSpace)(event) || (0, _Keys.isSpaceCtrl)(event)) {
        event.preventDefault();
        return this._handleTokenSelection(event, false);
      }

      if ((0, _Keys.isHomeShift)(event)) {
        this._handleHomeShift(event);
      }

      if ((0, _Keys.isEndShift)(event)) {
        this._handleEndShift(event);
      }

      this._handleItemNavigation(event, this._tokens);
    }

    _handleItemNavigation(event, tokens) {
      const isCtrl = !!(event.metaKey || event.ctrlKey);

      if ((0, _Keys.isLeftCtrl)(event) || (0, _Keys.isRightCtrl)(event) || (0, _Keys.isDownCtrl)(event) || (0, _Keys.isUpCtrl)(event)) {
        return this._handleArrowCtrl(event, event.target, tokens, (0, _Keys.isRightCtrl)(event) || (0, _Keys.isDownCtrl)(event));
      }

      if ((0, _Keys.isLeftShift)(event) || (0, _Keys.isRightShift)(event) || (0, _Keys.isUpShift)(event) || (0, _Keys.isDownShift)(event) || (0, _Keys.isLeftShiftCtrl)(event) || (0, _Keys.isRightShiftCtrl)(event)) {
        event.preventDefault();
        return this._handleArrowShift(event.target, tokens, (0, _Keys.isRightShift)(event) || (0, _Keys.isRightShiftCtrl)(event) || (0, _Keys.isDownShift)(event));
      }

      if ((0, _Keys.isHome)(event) || (0, _Keys.isEnd)(event) || (0, _Keys.isHomeCtrl)(event) || (0, _Keys.isEndCtrl)(event)) {
        event.preventDefault();
        return this._handleHome(tokens, (0, _Keys.isEnd)(event) || (0, _Keys.isEndCtrl)(event));
      }

      if (isCtrl && event.key.toLowerCase() === "a") {
        event.preventDefault();
        return this._toggleTokenSelection(tokens);
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

    _handleHomeShift(event) {
      const tokens = this.tokens;
      const currentTokenIdx = tokens.indexOf(event.target);
      tokens.filter((token, index) => index <= currentTokenIdx).forEach(token => {
        token.selected = true;
      });
      tokens[0].focus();

      this._itemNav.setCurrentItem(tokens[0]);
    }

    _handleEndShift(event) {
      const tokens = this.tokens;
      const currentTokenIdx = tokens.indexOf(event.target);
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

    _handleArrowCtrl(event, focusedToken, tokens, backwards) {
      const nextIndex = this._calcNextTokenIndex(focusedToken, tokens, backwards);

      event.preventDefault();

      if (nextIndex === -1) {
        return;
      }

      setTimeout(() => tokens[nextIndex].focus(), 0);

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
      setTimeout(() => tokens[nextIndex].focus(), 0);

      this._itemNav.setCurrentItem(tokens[nextIndex]);
    }

    _click(event) {
      this._handleTokenSelection(event);
    }

    _onmousedown(event) {
      this._itemNav.setCurrentItem(event.target);
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

    _handleTokenSelection(event, deselectAll = true) {
      if (event.target.hasAttribute("ui5-token")) {
        const deselectTokens = deselectAll ? this._tokens : [event.target];
        deselectTokens.forEach(token => {
          if (token !== event.target) {
            token.selected = false;
          }
        });
      }
    }

    _fillClipboard(shortcutName, tokens) {
      const tokensTexts = tokens.filter(token => token.selected).map(token => token.text).join("\r\n");
      /* fill clipboard with tokens' texts so parent can handle creation */

      const cutToClipboard = event => {
        if (event.clipboardData) {
          event.clipboardData.setData("text/plain", tokensTexts);
        } else {
          event.originalEvent.clipboardData.setData("text/plain", tokensTexts);
        }

        event.preventDefault();
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
      this.contentDom.scrollLeft = 0;
    }

    async closeMorePopover() {
      const popover = await this.getPopover();
      popover.close();
    }

    get _nMoreText() {
      return Tokenizer.i18nBundle.getText(_i18nDefaults.MULTIINPUT_SHOW_MORE_TOKENS, this._nMoreCount);
    }

    get showNMore() {
      return !this.expanded && this.showMore && this.overflownTokens.length;
    }

    get contentDom() {
      return this.shadowRoot.querySelector(".ui5-tokenizer--content");
    }

    get tokenizerLabel() {
      return Tokenizer.i18nBundle.getText(_i18nDefaults.TOKENIZER_ARIA_LABEL);
    }

    get morePopoverTitle() {
      return Tokenizer.i18nBundle.getText(_i18nDefaults.TOKENIZER_POPOVER_REMOVE);
    }

    get overflownTokens() {
      if (!this.contentDom) {
        return [];
      } // Reset the overflow prop of the tokens first in order
      // to use their dimensions for calculation because already
      // hidden tokens are set to 'display: none'


      this._getTokens().forEach(token => {
        token.overflows = false;
      });

      return this._getTokens().filter(token => {
        const isRTL = this.effectiveDir === "rtl";
        const elementEnd = isRTL ? "left" : "right";
        const parentRect = this.contentDom.getBoundingClientRect();
        const tokenRect = token.getBoundingClientRect();
        const tokenEnd = parseInt(tokenRect[elementEnd]);
        const parentEnd = parseInt(parentRect[elementEnd]);
        token.overflows = isRTL ? tokenEnd < parentEnd && !this.expanded : tokenEnd > parentEnd && !this.expanded;
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
          "ui5-tokenizer-nmore--content": this.showMore
        },
        popoverValueState: {
          "ui5-valuestatemessage-root": true,
          "ui5-responsive-popover-header": this.showPopover,
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
          "min-width": `${this.popoverMinWidth}px`
        },
        popoverValueStateMessage: {
          "width": (0, _Device.isPhone)() ? "100%" : `${this.popoverMinWidth}px`,
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
        return Tokenizer.i18nBundle.getText(_i18nDefaults.TOKENIZER_ARIA_CONTAIN_TOKEN);
      }

      if (iTokenCount === 1) {
        return Tokenizer.i18nBundle.getText(_i18nDefaults.TOKENIZER_ARIA_CONTAIN_ONE_TOKEN);
      }

      return Tokenizer.i18nBundle.getText(_i18nDefaults.TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS, iTokenCount);
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

    static get dependencies() {
      return [_ResponsivePopover.default, _List.default, _StandardListItem.default, _Title.default, _Button.default];
    }

    static async onDefine() {
      Tokenizer.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

    async getPopover() {
      return (await this.getStaticAreaItemDomRef()).querySelector("[ui5-responsive-popover]");
    }

  }

  Tokenizer.define();
  var _default = Tokenizer;
  _exports.default = _default;
});