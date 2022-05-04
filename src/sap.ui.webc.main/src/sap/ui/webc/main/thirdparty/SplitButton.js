sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './generated/templates/SplitButtonTemplate.lit', './types/ButtonDesign', './Button', './generated/i18n/i18n-defaults', './generated/themes/SplitButton.css'], function (UI5Element, Keys, i18nBundle, litRender, SplitButtonTemplate_lit, ButtonDesign, Button, i18nDefaults, SplitButton_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-split-button",
		managedSlots: true,
		properties:  {
			icon: {
				type: String,
			},
			activeIcon: {
				type: String,
			},
			design: {
				type: ButtonDesign,
				defaultValue: ButtonDesign.Default,
			},
			disabled: {
				type: Boolean,
			},
			 accessibleName: {
				type: String,
				defaultValue: undefined,
			},
			 focused: {
				type: Boolean,
			},
			_splitButtonAccInfo: {
				type: Object,
			},
			_tabIndex: {
				type: String,
				defaultValue: "0",
				noAttribute: true,
			},
			_spacePressed: {
				type: Boolean,
				noAttribute: true,
			},
			_shiftOrEscapePressed: {
				type: Boolean,
				noAttribute: true,
			},
			 _textButtonActive: {
				type: Boolean,
				noAttribute: true,
			},
			 _textButtonIcon: {
				type: String,
				noAttribute: true,
			},
			 _arrowButtonActive: {
				type: Boolean,
				noAttribute: true,
			},
		},
		slots:  {
			"default": {
				type: Node,
				propertyName: "text",
			},
		},
		events:  {
			"click": {},
			"arrow-click": {},
		 },
	};
	class SplitButton extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return SplitButton_css;
		}
		static get template() {
			return SplitButtonTemplate_lit;
		}
		static get dependencies() {
			return [Button];
		}
		static async onDefine() {
			SplitButton.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		constructor() {
			super();
			this._textButtonPress = {
				handleEvent(event) {
					this._textButtonActive = true;
					this.focused = false;
					this._setTabIndexValue();
				},
				passive: true,
			};
		}
		onBeforeRendering() {
			this._textButtonIcon = this.textButton && this.activeIcon !== "" && (this._textButtonActive) && !this._shiftOrEscapePressed ? this.activeIcon : this.icon;
			if (this.disabled) {
				this._tabIndex = "-1";
			}
		}
		_onFocusOut(event) {
			if (this.disabled || event.isMarked) {
				return;
			}
			this._shiftOrEscapePressed = false;
			this.focused = false;
			this._setTabIndexValue();
		}
		_onFocusIn(event) {
			if (this.disabled || event.isMarked) {
				return;
			}
			this._shiftOrEscapePressed = false;
			this.focused = true;
		}
		_onKeyDown(event) {
			if (Keys.isDown(event) || Keys.isUp(event) || Keys.isDownAlt(event) || Keys.isUpAlt(event) || Keys.isF4(event)) {
				event.preventDefault();
				this._arrowButtonActive = true;
				this._fireArrowClick();
			} else if (Keys.isSpace(event) || Keys.isEnter(event)) {
				event.preventDefault();
				this._textButtonActive = true;
				if (Keys.isEnter(event)) {
					this._fireClick();
				} else {
					this._spacePressed = true;
				}
			}
			if (this._spacePressed && (Keys.isEscape(event) || Keys.isShift(event))) {
				this._shiftOrEscapePressed = true;
				this._textButtonActive = false;
			}
			this._setTabIndexValue();
		}
		_onKeyUp(event) {
			if (Keys.isDown(event) || Keys.isUp(event) || Keys.isDownAlt(event) || Keys.isUpAlt(event) || Keys.isF4(event)) {
				this._arrowButtonActive = false;
			} else if (Keys.isSpace(event) || Keys.isEnter(event)) {
				this._textButtonActive = false;
				if (Keys.isSpace(event)) {
					event.preventDefault();
					event.stopPropagation();
					this._fireClick();
					this._spacePressed = false;
				}
			}
			this._setTabIndexValue();
		}
		_fireClick(event) {
			event && event.stopPropagation();
			if (!this._shiftOrEscapePressed) {
				this.fireEvent("click");
			}
			this._shiftOrEscapePressed = false;
		}
		_fireArrowClick(event) {
			event && event.stopPropagation();
			this.fireEvent("arrow-click");
		}
		_textButtonRelease() {
			this._textButtonActive = false;
			this._textButtonIcon = this.textButton && this.activeIcon !== "" && (this._textButtonActive) && !this._shiftOrEscapePressed ? this.activeIcon : this.icon;
			this._setTabIndexValue();
		}
		_setTabIndexValue() {
			const textButton = this.textButton,
				arrowButton = this.arrowButton,
				buttonsAction = (textButton && (textButton.focused || textButton.active))
							 || (arrowButton && (arrowButton.focused || arrowButton.active));
			this._tabIndex = this.disabled || buttonsAction ? "-1" : "0";
		}
		get textButtonAccText() {
			return this.textContent;
		}
		get textButton() {
			return this.getDomRef() && this.getDomRef().querySelector(".ui5-split-text-button");
		}
		get arrowButton() {
			return this.getDomRef() && this.getDomRef().querySelector(".ui5-split-arrow-button");
		}
		get accessibilityInfo() {
			return {
				ariaExpanded: this._splitButtonAccInfo && this._splitButtonAccInfo.ariaExpanded,
				ariaHaspopup: this._splitButtonAccInfo && this._splitButtonAccInfo.ariaHaspopup,
				description: SplitButton.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_DESCRIPTION),
				keyboardHint: SplitButton.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_KEYBOARD_HINT),
			};
		}
		get ariaLabelText() {
			return [SplitButton.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_DESCRIPTION), SplitButton.i18nBundle.getText(i18nDefaults.SPLIT_BUTTON_KEYBOARD_HINT)].join(" ");
		}
	}
	SplitButton.define();

	return SplitButton;

});
