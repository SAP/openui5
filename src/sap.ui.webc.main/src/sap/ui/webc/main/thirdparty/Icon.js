sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/templates/IconTemplate.lit', './generated/themes/Icon.css'], function (UI5Element, litRender, Icons, i18nBundle, Keys, IconTemplate_lit, Icon_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const ICON_NOT_FOUND = "ICON_NOT_FOUND";
	const PRESENTATION_ROLE = "presentation";
	const metadata = {
		tag: "ui5-icon",
		languageAware: true,
		themeAware: true,
		properties:  {
			interactive: {
				type: Boolean,
			},
			name: {
				type: String,
			},
			accessibleName: {
				type: String,
			},
			showTooltip: {
				type: Boolean,
			},
			accessibleRole: {
				type: String,
			},
			ariaHidden: {
				type: String,
			},
			pathData: {
				type: String,
				noAttribute: true,
			},
			accData: {
				type: Object,
				noAttribute: true,
			},
			focused: {
				type: Boolean,
			},
			invalid: {
				type: Boolean,
			},
			effectiveAccessibleName: {
				type: String,
				defaultValue: undefined,
				noAttribute: true,
			},
		},
		events:  {
			click: {},
		},
	};
	class Icon extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return IconTemplate_lit;
		}
		static get styles() {
			return Icon_css;
		}
		_onFocusInHandler(event) {
			if (this.interactive) {
				this.focused = true;
			}
		}
		_onFocusOutHandler(event) {
			this.focused = false;
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
			if (this.interactive && Keys.isSpace(event)) {
				this.fireEvent("click");
			}
		}
		_onClickHandler(event) {
			event.stopPropagation();
			this.fireEvent("click");
		}
		get _dir() {
			return this.ltr ? "ltr" : undefined;
		}
		get effectiveAriaHidden() {
			if (this.ariaHidden === "") {
				if (this.isDecorative) {
					return true;
				}
				return;
			}
			return this.ariaHidden;
		}
		get tabIndex() {
			return this.interactive ? "0" : undefined;
		}
		get isDecorative() {
			return this.effectiveAccessibleRole === PRESENTATION_ROLE;
		}
		get effectiveAccessibleRole() {
			if (this.accessibleRole) {
				return this.accessibleRole;
			}
			if (this.interactive) {
				return "button";
			}
			return this.effectiveAccessibleName ? "img" : PRESENTATION_ROLE;
		}
		async onBeforeRendering() {
			const name = this.name;
			if (!name) {
				return console.warn("Icon name property is required", this);
			}
			let iconData = Icons.getIconDataSync(name);
			if (!iconData) {
				iconData = await Icons.getIconData(name);
			}
			if (iconData === ICON_NOT_FOUND) {
				this.invalid = true;
				return console.warn(`Required icon is not registered. You can either import the icon as a module in order to use it e.g. "@ui5/webcomponents-icons/dist/${name.replace("sap-icon://", "")}.js", or setup a JSON build step and import "@ui5/webcomponents-icons/dist/AllIcons.js".`);
			}
			if (!iconData) {
				this.invalid = true;
				return console.warn(`Required icon is not registered. Invalid icon name: ${this.name}`);
			}
			this.invalid = false;
			this.pathData = iconData.pathData;
			this.accData = iconData.accData;
			this.ltr = iconData.ltr;
			this.packageName = iconData.packageName;
			this._onclick = this.interactive ? this._onClickHandler.bind(this) : undefined;
			this._onfocusout = this.interactive ? this._onFocusOutHandler.bind(this) : undefined;
			this._onfocusin = this.interactive ? this._onFocusInHandler.bind(this) : undefined;
			if (this.accessibleName) {
				this.effectiveAccessibleName = this.accessibleName;
			} else if (this.accData) {
				const i18nBundle$1 = await i18nBundle.getI18nBundle(this.packageName);
				this.effectiveAccessibleName = i18nBundle$1.getText(this.accData) || undefined;
			}
		}
		get hasIconTooltip() {
			return this.showTooltip && this.effectiveAccessibleName;
		}
	}
	Icon.define();

	return Icon;

});
