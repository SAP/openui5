sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/delegate/ScrollEnablement', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/types/ValueState', './ResponsivePopover', './List', './StandardListItem', './generated/templates/TokenizerTemplate.lit', './generated/templates/TokenizerPopoverTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Tokenizer.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css'], function (UI5Element, litRender, ResizeHandler, ItemNavigation, ScrollEnablement, Integer, i18nBundle, Keys, Device, ValueState, ResponsivePopover, List, StandardListItem, TokenizerTemplate_lit, TokenizerPopoverTemplate_lit, i18nDefaults, Tokenizer_css, ResponsivePopoverCommon_css, ValueStateMessage_css) { 'use strict';

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
			return [ResponsivePopoverCommon_css, ValueStateMessage_css];
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
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		async onBeforeRendering() {
			if (this.showPopover && !this._getTokens().length) {
				const popover = await this.getPopover();
				popover.close();
			}
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
			this._nMoreCount = this.overflownTokens.length;
			this._scrollEnablement.scrollContainer = this.expanded ? this.contentDom : this;
		}
		_tokenDelete(event) {
			let nextTokenIndex;
			const deletedTokenIndex = this._getVisibleTokens().indexOf(event.target);
			if (event.detail && event.detail.backSpace) {
				nextTokenIndex = deletedTokenIndex === 0 ? deletedTokenIndex + 1 : deletedTokenIndex - 1;
			} else {
				nextTokenIndex = deletedTokenIndex === this._getVisibleTokens().length - 1 ? deletedTokenIndex - 1 : deletedTokenIndex + 1;
			}
			const nextToken = this._getVisibleTokens()[nextTokenIndex];
			this._itemNav.setCurrentItem(nextToken);
			if (nextToken) {
				setTimeout(() => {
					nextToken.focus();
				}, 0);
			}
			this.fireEvent("token-delete", { ref: event.target });
		}
		itemDelete(event) {
			const token = event.detail.item.tokenRef;
			this.fireEvent("token-delete", { ref: token });
		}
		_onkeydown(event) {
			if (Keys.isSpace(event)) {
				event.preventDefault();
				this._handleTokenSelection(event);
			}
		}
		_click(event) {
			this._handleTokenSelection(event);
		}
		_onmousedown(event) {
			this._itemNav.setCurrentItem(event.target);
		}
		_handleTokenSelection(event) {
			if (event.target.localName === "ui5-token") {
				this._tokens.forEach(token => {
					if (token !== event.target) {
						token.selected = false;
					}
				});
			}
		}
		scrollToStart() {
			this.contentDom.scrollLeft = 0;
		}
		async closeMorePopover() {
			const popover = await this.getPopover();
			popover.close();
		}
		get _nMoreText() {
			return this.i18nBundle.getText(i18nDefaults.MULTIINPUT_SHOW_MORE_TOKENS, [this._nMoreCount]);
		}
		get showNMore() {
			return !this.expanded && this.showMore && this.overflownTokens.length;
		}
		get contentDom() {
			return this.shadowRoot.querySelector(".ui5-tokenizer--content");
		}
		get tokenizerLabel() {
			return this.i18nBundle.getText(i18nDefaults.TOKENIZER_ARIA_LABEL);
		}
		get morePopoverTitle() {
			return this.i18nBundle.getText(i18nDefaults.TOKENIZER_POPOVER_REMOVE);
		}
		get overflownTokens() {
			if (!this.contentDom) {
				return [];
			}
			return this._getTokens().filter(token => {
				const isRTL = this.effectiveDir === "rtl";
				const elementEnd = isRTL ? "left" : "right";
				const parentRect = this.contentDom.getBoundingClientRect();
				const tokenRect = token.getBoundingClientRect();
				const tokenEnd = tokenRect[elementEnd];
				const parentEnd = parentRect[elementEnd];
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
		get _isPhone() {
			return Device.isPhone();
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
					"padding": Device.isPhone() ? "0.25rem 1rem" : "0.3rem 0.625rem",
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
				return this.i18nBundle.getText(i18nDefaults.TOKENIZER_ARIA_CONTAIN_TOKEN);
			}
			if (iTokenCount === 1) {
				return this.i18nBundle.getText(i18nDefaults.TOKENIZER_ARIA_CONTAIN_ONE_TOKEN);
			}
			return this.i18nBundle.getText(i18nDefaults.TOKENIZER_ARIA_CONTAIN_SEVERAL_TOKENS, iTokenCount);
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
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		async getPopover() {
			return (await this.getStaticAreaItemDomRef()).querySelector("[ui5-responsive-popover]");
		}
	}
	Tokenizer.define();

	return Tokenizer;

});
