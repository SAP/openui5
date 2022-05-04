sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/isLegacyBrowser', 'sap/ui/webc/common/thirdparty/base/Device', './types/ButtonDesign', './generated/templates/ButtonTemplate.lit', './Icon', './generated/i18n/i18n-defaults', './generated/themes/Button.css', './generated/themes/Button.ie11.css'], function (UI5Element, litRender, Keys, AriaLabelHelper, FeaturesRegistry, i18nBundle, isLegacyBrowser, Device, ButtonDesign, ButtonTemplate_lit, Icon, i18nDefaults, Button_css, Button_ie11_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var isLegacyBrowser__default = /*#__PURE__*/_interopDefaultLegacy(isLegacyBrowser);

	let isGlobalHandlerAttached = false;
	let activeButton = null;
	const metadata = {
		tag: "ui5-button",
		languageAware: true,
		properties:  {
			design: {
				type: ButtonDesign,
				defaultValue: ButtonDesign.Default,
			},
			disabled: {
				type: Boolean,
			},
			icon: {
				type: String,
			},
			iconEnd: {
				type: Boolean,
			},
			submits: {
				type: Boolean,
			},
			tooltip: {
				type: String,
			},
			active: {
				type: Boolean,
			},
			iconOnly: {
				type: Boolean,
			},
			focused: {
				type: Boolean,
			},
			hasIcon: {
				type: Boolean,
			},
			accessibleName: {
				type: String,
				defaultValue: undefined,
			},
			 accessibleNameRef: {
				type: String,
				defaultValue: "",
			},
			accessibilityAttributes: {
				type: Object,
			},
			nonInteractive: {
				type: Boolean,
			},
			_iconSettings: {
				type: Object,
			},
			_tabIndex: {
				type: String,
				defaultValue: "0",
				noAttribute: true,
			},
			_isTouch: {
				type: Boolean,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				type: Node,
			},
		},
		events:  {
			click: {},
		},
	};
	class Button extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [Button_css, isLegacyBrowser__default() && Button_ie11_css];
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return ButtonTemplate_lit;
		}
		static get dependencies() {
			return [Icon];
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
			this._ontouchstart = {
				handleEvent(event) {
					event.isMarked = "button";
					if (this.nonInteractive) {
						return;
					}
					this.active = true;
				},
				passive: true,
			};
		}
		onEnterDOM() {
			this._isTouch = (Device.isPhone() || Device.isTablet()) && !Device.isCombi();
		}
		onBeforeRendering() {
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (this.submits && !FormSupport) {
				console.warn(`In order for the "submits" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
			this.iconOnly = this.isIconOnly;
			this.hasIcon = !!this.icon;
		}
		_onclick(event) {
			if (this.nonInteractive) {
				return;
			}
			event.isMarked = "button";
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (FormSupport && this.submits) {
				FormSupport.triggerFormSubmit(this);
			}
			if (Device.isSafari()) {
				this.getDomRef().focus();
			}
		}
		_onmousedown(event) {
			if (this.nonInteractive || this._isTouch) {
				return;
			}
			event.isMarked = "button";
			this.active = true;
			activeButton = this;
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
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				this.active = true;
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				this.active = false;
			}
		}
		_onfocusout(_event) {
			if (this.nonInteractive) {
				return;
			}
			this.active = false;
			if (Device.isDesktop()) {
				this.focused = false;
			}
		}
		_onfocusin(event) {
			if (this.nonInteractive) {
				return;
			}
			event.isMarked = "button";
			if (Device.isDesktop()) {
				this.focused = true;
			}
		}
		get hasButtonType() {
			return this.design !== ButtonDesign.Default && this.design !== ButtonDesign.Transparent;
		}
		get isIconOnly() {
			return !Array.from(this.childNodes).filter(node => {
				return node.nodeType !== Node.COMMENT_NODE
				&& (node.nodeType !== Node.TEXT_NODE || node.nodeValue.trim().length !== 0);
			}).length;
		}
		static typeTextMappings() {
			return {
				"Positive": i18nDefaults.BUTTON_ARIA_TYPE_ACCEPT,
				"Negative": i18nDefaults.BUTTON_ARIA_TYPE_REJECT,
				"Emphasized": i18nDefaults.BUTTON_ARIA_TYPE_EMPHASIZED,
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
			return AriaLabelHelper.getEffectiveAriaLabelText(this);
		}
		static async onDefine() {
			Button.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
	}
	Button.define();

	return Button;

});
