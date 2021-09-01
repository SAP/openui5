sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/templates/AvatarTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Avatar.css', './Icon', './types/AvatarSize', './types/AvatarShape', './types/AvatarColorScheme'], function (UI5Element, litRender, i18nBundle, Keys, AvatarTemplate_lit, i18nDefaults, Avatar_css, Icon, AvatarSize, AvatarShape, AvatarColorScheme) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-avatar",
		languageAware: true,
		managedSlots: true,
		properties:  {
			interactive: {
				type: Boolean,
			},
			focused: {
				type: Boolean,
			},
			icon: {
				type: String,
			},
			initials: {
				type: String,
			},
			shape: {
				type: AvatarShape,
				defaultValue: AvatarShape.Circle,
			},
			size: {
				type: AvatarSize,
				defaultValue: AvatarSize.S,
			},
			_size: {
				type: String,
				defaultValue: AvatarSize.S,
			},
			colorScheme: {
				type: AvatarColorScheme,
				defaultValue: AvatarColorScheme.Accent6,
			},
			_colorScheme: {
				type: String,
				defaultValue: AvatarColorScheme.Accent6,
			},
			accessibleName: {
				type: String,
			},
			ariaHaspopup: {
				type: String,
			},
			_tabIndex: {
				type: String,
				noAttribute: true,
			},
			_hasImage: {
				type: Boolean,
			},
		},
		slots:  {
			"default": {
				propertyName: "image",
				type: HTMLElement,
			},
		},
		events:  {
			click: {},
		},
	};
	class Avatar extends UI5Element__default {
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return Avatar_css;
		}
		static get template() {
			return AvatarTemplate_lit;
		}
		static get dependencies() {
			return [Icon];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		get tabindex() {
			return this._tabIndex || (this.interactive ? "0" : "-1");
		}
		get _effectiveSize() {
			return this.getAttribute("size") || this._size;
		}
		get _effectiveBackgroundColor() {
			return this.getAttribute("_color-scheme") || this._colorScheme;
		}
		get _role() {
			return this.interactive ? "button" : undefined;
		}
		get _ariaHasPopup() {
			return this._getAriaHasPopup();
		}
		get validInitials() {
			const validInitials = /^[a-zA-Z]{1,2}$/;
			if (this.initials && validInitials.test(this.initials)) {
				return this.initials;
			}
			return null;
		}
		get accessibleNameText() {
			if (this.accessibleName) {
				return this.accessibleName;
			}
			return this.i18nBundle.getText(i18nDefaults.AVATAR_TOOLTIP) || undefined;
		}
		get hasImage() {
			this._hasImage = !!this.image.length;
			return this._hasImage;
		}
		_onclick(event) {
			if (this.interactive) {
				event.stopPropagation();
				this.fireEvent("click");
			}
		}
		_onkeydown(event) {
			if (!this.interactive) {
				return;
			}
			if (Keys.isEnter(event)) {
				this.fireEvent("click");
			}
			if (Keys.isSpace(event)) {
				event.preventDefault();
			}
		}
		_onkeyup(event) {
			if (this.interactive && !event.shiftKey && Keys.isSpace(event)) {
				this.fireEvent("click");
			}
		}
		_onfocusout() {
			this.focused = false;
		}
		_onfocusin() {
			if (this.interactive) {
				this.focused = true;
			}
		}
		_getAriaHasPopup() {
			if (!this.interactive || this.ariaHaspopup === "") {
				return;
			}
			return this.ariaHaspopup;
		}
	}
	Avatar.define();

	return Avatar;

});
