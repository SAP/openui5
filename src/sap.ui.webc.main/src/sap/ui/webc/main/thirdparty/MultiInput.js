sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/i18n/i18n-defaults', './Input', './generated/templates/MultiInputTemplate.lit', './generated/themes/MultiInput.css', './Token', './Tokenizer', './Icon'], function (litRender, Keys, i18nDefaults, Input, MultiInputTemplate_lit, MultiInput_css, Token, Tokenizer, Icon) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-multi-input",
		properties:  {
			showValueHelpIcon: {
				type: Boolean,
			},
			expandedTokenizer: {
				type: Boolean,
			},
		},
		slots:  {
			tokens: {
				type: HTMLElement,
			},
		},
		events:  {
			"value-help-trigger": {},
			"token-delete": {
				detail: {
					token: { type: HTMLElement },
				},
			},
		},
	};
	class MultiInput extends Input {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return MultiInputTemplate_lit;
		}
		static get styles() {
			return [Input.styles, MultiInput_css];
		}
		constructor() {
			super();
			this._skipOpenSuggestions = false;
		}
		valueHelpPress(event) {
			this.closePopover();
			this.fireEvent("value-help-trigger", {});
		}
		showMorePress(event) {
			this.expandedTokenizer = false;
			this.focus();
		}
		tokenDelete(event) {
			this.fireEvent("token-delete", {
				token: event.detail.ref,
			});
			this.focus();
		}
		valueHelpMouseDown(event) {
			this.closePopover();
			this.tokenizer.closeMorePopover();
			this._valueHelpIconPressed = true;
			event.target.focus();
		}
		_tokenizerFocusOut(event) {
			if (!this.contains(event.relatedTarget)) {
				this.tokenizer._tokens.forEach(token => { token.selected = false; });
				this.tokenizer.scrollToStart();
			}
		}
		valueHelpMouseUp(event) {
			setTimeout(() => {
				this._valueHelpIconPressed = false;
			}, 0);
		}
		innerFocusIn() {
			this.expandedTokenizer = true;
		}
		_onkeydown(event) {
			super._onkeydown(event);
			if (Keys.isLeft(event)) {
				this._skipOpenSuggestions = true;
				return this._handleLeft(event);
			}
			this._skipOpenSuggestions = false;
			if (Keys.isBackSpace(event) && event.target.value === "") {
				event.preventDefault();
				this.tokenizer._focusLastToken();
			}
			if (Keys.isShow(event)) {
				this.valueHelpPress();
			}
		}
		_onTokenizerKeydown(event) {
			if (Keys.isRight(event)) {
				const lastTokenIndex = this.tokenizer._tokens.length - 1;
				if (this.tokenizer._tokens[lastTokenIndex] === document.activeElement) {
					setTimeout(() => {
						this.focus();
					}, 0);
				}
			}
		}
		_handleLeft() {
			const cursorPosition = this.getDomRef().querySelector(`input`).selectionStart;
			if (cursorPosition === 0) {
				this.tokenizer._focusLastToken();
			}
		}
		_onfocusout(event) {
			super._onfocusout(event);
			const relatedTarget = event.relatedTarget;
			const insideDOM = this.contains(relatedTarget);
			const insideShadowDom = this.shadowRoot.contains(relatedTarget);
			if (!insideDOM && !insideShadowDom) {
				this.expandedTokenizer = false;
			}
		}
		async _onfocusin(event) {
			const inputDomRef = await this.getInputDOMRef();
			if (event.target === inputDomRef) {
				await super._onfocusin(event);
			}
		}
		shouldOpenSuggestions() {
			const parent = super.shouldOpenSuggestions();
			const valueHelpPressed = this._valueHelpIconPressed;
			const nonEmptyValue = this.value !== "";
			return parent && nonEmptyValue && !valueHelpPressed && !this._skipOpenSuggestions;
		}
		lastItemDeleted() {
			setTimeout(() => {
				this.focus();
			}, 0);
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
					"ariaDescribedBy": ariaDescribedBy,
				},
			};
		}
		get ariaRoleDescription() {
			return this.i18nBundle.getText(i18nDefaults.MULTIINPUT_ROLEDESCRIPTION_TEXT);
		}
		static get dependencies() {
			return [
				...Input.dependencies,
				Tokenizer,
				Token,
				Icon,
			];
		}
	}
	MultiInput.define();

	return MultiInput;

});
