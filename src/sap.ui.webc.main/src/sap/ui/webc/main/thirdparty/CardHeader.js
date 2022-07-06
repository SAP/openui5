sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', './generated/templates/CardHeaderTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/CardHeader.css'], function (UI5Element, litRender, i18nBundle, Keys, Integer, CardHeaderTemplate_lit, i18nDefaults, CardHeader_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);

	const metadata = {
		tag: "ui5-card-header",
		languageAware: true,
		managedSlots: true,
		slots:  {
			avatar: {
				type: HTMLElement,
			},
			action: {
				type: HTMLElement,
			},
		},
		properties:  {
			titleText: {
				type: String,
			},
			subtitleText: {
				type: String,
			},
			status: {
				type: String,
			},
			interactive: {
				type: Boolean,
			},
			ariaLevel: {
				type: Integer__default,
				defaultValue: 3,
			},
			_headerActive: {
				type: Boolean,
				noAttribute: true,
			},
		},
		events:  {
			"click": {},
		},
	};
	class CardHeader extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return CardHeaderTemplate_lit;
		}
		static get styles() {
			return CardHeader_css;
		}
		get classes() {
			return {
				"ui5-card-header": true,
				"ui5-card-header--interactive": this.interactive,
				"ui5-card-header--active": this.interactive && this._headerActive,
			};
		}
		get _root() {
			return this.shadowRoot.querySelector(".ui5-card-header");
		}
		get ariaRoleDescription() {
			return this.interactive ? CardHeader.i18nBundle.getText(i18nDefaults.ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER) : CardHeader.i18nBundle.getText(i18nDefaults.ARIA_ROLEDESCRIPTION_CARD_HEADER);
		}
		get ariaRoleFocusableElement() {
			return this.interactive ? "button" : null;
		}
		get ariaCardAvatarLabel() {
			return CardHeader.i18nBundle.getText(i18nDefaults.AVATAR_TOOLTIP);
		}
		get ariaLabelledBy() {
			const labels = [];
			if (this.titleText) {
				labels.push(`${this._id}-title`);
			}
			if (this.subtitleText) {
				labels.push(`${this._id}-subtitle`);
			}
			if (this.status) {
				labels.push(`${this._id}-status`);
			}
			if (this.hasAvatar) {
				labels.push(`${this._id}-avatar`);
			}
			return labels.length !== 0 ? labels.join(" ") : undefined;
		}
		get hasAvatar() {
			return !!this.avatar.length;
		}
		get hasAction() {
			return !!this.action.length;
		}
		static async onDefine() {
			CardHeader.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		_actionsFocusin() {
			this._root.classList.add("ui5-card-header-hide-focus");
		}
		_actionsFocusout() {
			this._root.classList.remove("ui5-card-header-hide-focus");
		}
		_click(event) {
			event.stopImmediatePropagation();
			if (this.interactive && this._root.contains(event.target)) {
				this.fireEvent("click");
			}
		}
		_keydown(event) {
			if (!this.interactive || !this._root.contains(event.target)) {
				return;
			}
			const enter = Keys.isEnter(event);
			const space = Keys.isSpace(event);
			this._headerActive = enter || space;
			if (enter) {
				this.fireEvent("click");
				return;
			}
			if (space) {
				event.preventDefault();
			}
		}
		_keyup(event) {
			if (!this.interactive || !this._root.contains(event.target)) {
				return;
			}
			const space = Keys.isSpace(event);
			this._headerActive = false;
			if (space) {
				this.fireEvent("click");
			}
		}
	}
	CardHeader.define();

	return CardHeader;

});
