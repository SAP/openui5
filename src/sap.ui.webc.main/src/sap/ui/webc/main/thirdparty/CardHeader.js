sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/templates/CardHeaderTemplate.lit', './Icon', './generated/i18n/i18n-defaults', './generated/themes/CardHeader.css'], function (UI5Element, litRender, i18nBundle, Keys, CardHeaderTemplate_lit, Icon, i18nDefaults, CardHeader_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

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
		get ariaHeaderRole() {
			return this.interactive ? "button" : "heading";
		}
		get ariaLevel() {
			return this.interactive ? undefined : "3";
		}
		get ariaCardHeaderRoleDescription() {
			return this.interactive ? this.i18nBundle.getText(i18nDefaults.ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER) : this.i18nBundle.getText(i18nDefaults.ARIA_ROLEDESCRIPTION_CARD_HEADER);
		}
		get ariaCardAvatarLabel() {
			return this.i18nBundle.getText(i18nDefaults.AVATAR_TOOLTIP);
		}
		get ariaLabelledByHeader() {
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
		static get dependencies() {
			return [Icon];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		_headerClick() {
			if (this.interactive) {
				this.fireEvent("click");
			}
		}
		_headerKeydown(event) {
			if (!this.interactive) {
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
		_headerKeyup(event) {
			if (!this.interactive) {
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
