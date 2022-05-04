sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/delegate/ScrollEnablement', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/types/ValueState', './ResponsivePopover', './List', './Title', './Button', './StandardListItem', './generated/templates/TokenizerTemplate.lit', './generated/templates/TokenizerPopoverTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Tokenizer.css', './generated/themes/TokenizerPopover.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css', './generated/themes/Suggestions.css'], function (UI5Element, litRender, ResizeHandler, ItemNavigation, ScrollEnablement, Integer, i18nBundle, Keys, Device, ValueState, ResponsivePopover, List, Title, Button, StandardListItem, TokenizerTemplate_lit, TokenizerPopoverTemplate_lit, i18nDefaults, Tokenizer_css, TokenizerPopover_css, ResponsivePopoverCommon_css, ValueStateMessage_css, Suggestions_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var ScrollEnablement__default = /*#__PURE__*/_interopDefaultLegacy(ScrollEnablement);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-tokenizer",
		languageAware: true,
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "tokens",
				type: HTMLElement,
				individualSlots: true,
			},
			"valueStateMessage": {
				propertyName: "valueStateMessage",
				type: HTMLElement,
			},
		},
		properties:  {
			showMore: { type: Boolean },
			disabled: { type: Boolean },
			expanded: { type: Boolean },
			morePopoverOpener: { type: Object },
			popoverMinWidth: {
				type: Integer__default,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			_nMoreCount: { type: Integer__default },
		},
		events:  {
			"token-delete": {
				detail: {
					ref: { type: HTMLElement },
				},
			},
			"show-more-items-press": {
				detail: {
					ref: { type: HTMLElement },
				},
			},
		},
	};
	class Tokenizer extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TokenizerTemplate_lit;
		}
		static get styles() {
			return Tokenizer_css;
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, ValueStateMessage_css, Suggestions_css, TokenizerPopover_css];
		}
		static get staticAreaTemplate() {
			return TokenizerPopoverTemplate_lit;
		}
		_handleResize() {
			this._nMoreCount = this.overflownTokens.length;
		}
		constructor() {
			super();
			this._resizeHandler = this._handleResize.bind(this);
			this._itemNav = new ItemNavigation__default(this, {
				currentIndex: "-1",
				getItemsCallback: this._getVisibleTokens.bind(this),
			});
			this._scrollEnablement = new ScrollEnablement__default(this);
		}
		async onBeforeRendering() {
			if (this.showPopover && !this._getTokens().length) {
				const popover = await this.getPopover();
				popover.close();
			}
			this._nMoreCount = this.overflownTokens.length;
		}
		onEnterDOM() {
			ResizeHandler__default.register(this.shadowRoot.querySelector(".ui5-tokenizer--content"), this._resizeHandler);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this.shadowRoot.querySelector(".ui5-tokenizer--content"), this._resizeHandler);
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
				return index < (this._tokens.length - this._nMoreCount);
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
			let nextTokenIndex;
			const tokens = this._getVisibleTokens();
			const deletedTokenIndex = token ? tokens.indexOf(token) : tokens.indexOf(event.target);
			const notSelectedTokens = tokens.filter(t => !t.selected);
			if (event.detail && event.detail.backSpace) {
				nextTokenIndex = deletedTokenIndex === 0 ? deletedTokenIndex + 1 : deletedTokenIndex - 1;
			} else {
				nextTokenIndex = deletedTokenIndex === tokens.length - 1 ? deletedTokenIndex - 1 : deletedTokenIndex + 1;
			}
			let nextToken = tokens[nextTokenIndex];
			if (notSelectedTokens.length > 1) {
				while (nextToken && nextToken.selected) {
					nextToken = event.detail.backSpace ? tokens[--nextTokenIndex] : tokens[++nextTokenIndex];
				}
			} else {
				nextToken = notSelectedTokens[0];
			}
			if (nextToken && !Device.isPhone()) {
				this._itemNav.setCurrentItem(nextToken);
				setTimeout(() => {
					nextToken.focus();
				}, 0);
			}
			this.fireEvent("token-delete", { ref: token || event.target });
		}
		itemDelete(event) {
			const token = event.detail.item.tokenRef;
			this.fireEvent("token-delete", { ref: token });
		}
		_onkeydown(event) {
			if (Keys.isSpaceShift(event)) {
				event.preventDefault();
			}
			if (Keys.isSpace(event) || Keys.isSpaceCtrl(event)) {
				event.preventDefault();
				return this._handleTokenSelection(event, false);
			}
			if (Keys.isHomeShift(event)) {
				this._handleHomeShift(event);
			}
			if (Keys.isEndShift(event)) {
				this._handleEndShift(event);
			}
			this._handleItemNavigation(event, this._tokens);
		}
		_handleItemNavigation(event, tokens) {
			const isCtrl = !!(event.metaKey || event.ctrlKey);
			if (Keys.isLeftCtrl(event) || Keys.isRightCtrl(event) || Keys.isDownCtrl(event) || Keys.isUpCtrl(event)) {
				return this._handleArrowCtrl(event, event.target, tokens, Keys.isRightCtrl(event) || Keys.isDownCtrl(event));
			}
			if (Keys.isLeftShift(event) || Keys.isRightShift(event) || Keys.isUpShift(event) || Keys.isDownShift(event) || Keys.isLeftShiftCtrl(event) || Keys.isRightShiftCtrl(event)) {
				event.preventDefault();
				return this._handleArrowShift(event.target, tokens, (Keys.isRightShift(event) || Keys.isRightShiftCtrl(event) || Keys.isDownShift(event)));
			}
			if (Keys.isHome(event) || Keys.isEnd(event) || Keys.isHomeCtrl(event) || Keys.isEndCtrl(event)) {
				event.preventDefault();
				return this._handleHome(tokens, Keys.isEnd(event) || Keys.isEndCtrl(event));
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
			let nextIndex = backwards ? (focusedTokenIndex + 1) : (focusedTokenIndex - 1);
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
			const nextIndex = backwards ? (focusedTokenIndex + 1) : (focusedTokenIndex - 1);
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
			tokens.forEach(token => { token.selected = !tokensAreSelected; });
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
		scrollToStart() {
			this.contentDom.scrollLeft = 0;
		}
		async closeMorePopover() {
			const popover = await this.getPopover();
			popover.close();
		}
		get _nMoreText() {
			return Tokenizer.i18nBundle.getText(i18nDefaults.MULTIINPUT_SHOW_MORE_TOKENS, this._nMoreCount);
		}
		get showNMore() {
			return !this.expanded && this.showMore && this.overflownTokens.length;
		}
		get contentDom() {
			return this.shadowRoot.querySelector(".ui5-tokenizer--content");
		}
		get tokenizerLabel() {
			return Tokenizer.i18nBundle.getText(i18nDefaults.TOKENIZER_ARIA_LABEL);
		}
		get morePopoverTitle() {
			return Tokenizer.i18nBundle.getText(i18nDefaults.TOKENIZER_POPOVER_REMOVE);
		}
		get overflownTokens() {
			if (!this.contentDom) {
				return [];
			}
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
				token.overflows = isRTL ? ((tokenEnd < parentEnd) && !this.expanded) : ((tokenEnd > parentEnd) && !this.expanded);
				return token.overflows;
			});
		}
		get hasValueState() {
			return this.valueState === ValueState__default.None || this.valueState === ValueState__default.Success;
		}
		get valueStateMessageText() {
			return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
		}
		 get _valueStateMessageIcon() {
			const iconPerValueState = {
				Error: "error",
				Warning: "alert",
				Success: "sys-enter-2",
				Information: "information",
			};
			return this.valueState !== ValueState__default.None ? iconPerValueState[this.valueState] : "";
		}
		get _isPhone() {
			return Device.isPhone();
		}
		get _selectedTokens() {
			return this._getTokens().filter(token => token.selected);
		}
		get classes() {
			return {
				wrapper: {
					"ui5-tokenizer-root": true,
					"ui5-tokenizer-nmore--wrapper": this.showMore,
					"ui5-tokenizer-no-padding": !this._getTokens().length,
				},
				content: {
					"ui5-tokenizer--content": true,
					"ui5-tokenizer-nmore--content": this.showMore,
				},
				popoverValueState: {
					"ui5-valuestatemessage-root": true,
					"ui5-responsive-popover-header": this.showPopover,
					"ui5-valuestatemessage--success": this.valueState === ValueState__default.Success,
					"ui5-valuestatemessage--error": this.valueState === ValueState__default.Error,
					"ui5-valuestatemessage--warning": this.valueState === ValueState__default.Warning,
					"ui5-valuestatemessage--information": this.valueState === ValueState__default.Information,
				},
			};
		}
		get styles() {
			return {
				popover: {
					"min-width": `${this.popoverMinWidth}px`,
				},
				popoverValueStateMessage: {
					"width": Device.isPhone() ? "100%" : `${this.popoverMinWidth}px`,
					"min-height": "2rem",
				},
				popoverHeader: {
					"min-height": "2rem",
				},
				popoverHeaderTitle: {
					"justify-content": "left",
				},
			};
		}
		_tokensCountText() {
			const iTokenCount = this._getTokens().length;
			if (iTokenCount === 0) {
				return Tokenizer.i18nBundle.getText(i18nDefaults.TOKENIZER_ARIA_CONTAIN_TOKEN);
			}
			if (iTokenCount === 1) {
				return Tokenizer.i18nBundle.getText(i18nDefaults.TOKENIZER_ARIA_CONTAIN_ONE_TOKEN);
			}
			return Tokenizer.i18nBundle.getText(i18nDefaults.TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS, iTokenCount);
		}
		_focusLastToken() {
			if (this.tokens.length === 0) {
				return;
			}
			const lastToken = this.tokens[this.tokens.length - 1];
			lastToken.focus();
			this._itemNav.setCurrentItem(lastToken);
		}
		static get dependencies() {
			return [
				ResponsivePopover,
				List,
				StandardListItem,
				Title,
				Button,
			];
		}
		static async onDefine() {
			Tokenizer.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		async getPopover() {
			return (await this.getStaticAreaItemDomRef()).querySelector("[ui5-responsive-popover]");
		}
	}
	Tokenizer.define();

	return Tokenizer;

});
