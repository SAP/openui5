sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './generated/templates/IllustratedMessageTemplate.lit', './types/IllustrationMessageType', './illustrations/BeforeSearch', './generated/themes/IllustratedMessage.css'], function (UI5Element, ResizeHandler, Illustrations, i18nBundle, litRender, IllustratedMessageTemplate_lit, IllustrationMessageType, BeforeSearch, IllustratedMessage_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const ILLUSTRATION_NOT_FOUND = "ILLUSTRATION_NOT_FOUND";
	const metadata = {
		tag: "ui5-illustrated-message",
		managedSlots: true,
		properties:  {
			titleText: {
				type: String,
			},
			subtitleText: {
				type: String,
			},
			media: {
				type: String,
			},
			invalid: {
				type: Boolean,
			},
			name: {
				type: IllustrationMessageType,
				defaultValue: IllustrationMessageType.BeforeSearch,
			},
		},
		slots:  {
			"default": {
				propertyName: "actions",
				type: HTMLElement,
			},
			subtitle: {
				type: HTMLElement,
			},
		},
		events:  {
		},
	};
	class IllustratedMessage extends UI5Element__default {
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
			this._handleResize = this.handleResize.bind(this);
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return IllustratedMessage_css;
		}
		static get template() {
			return IllustratedMessageTemplate_lit;
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		static get BREAKPOINTS() {
			return {
				DIALOG: 679,
				SPOT: 319,
				BASE: 259,
			};
		}
		static get MEDIA() {
			return {
				BASE: "base",
				SPOT: "spot",
				DIALOG: "dialog",
				SCENE: "scene",
			};
		}
		onBeforeRendering() {
			const illustrationData = Illustrations.getIllustrationDataSync(this.name);
			if (illustrationData === ILLUSTRATION_NOT_FOUND) {
				this.invalid = true;
				return console.warn(`Required illustration is not registered. You can either import the illustration as a module in order to use it e.g. "@ui5/webcomponents-fiori/dist/illustrations/${this.name}.js".`);
			}
			this.invalid = false;
			this.spotSvg = illustrationData.spotSvg;
			this.dialogSvg = illustrationData.dialogSvg;
			this.sceneSvg = illustrationData.sceneSvg;
			this.illustrationTitle = this.i18nBundle.getText(illustrationData.title);
			this.illustrationSubtitle = this.i18nBundle.getText(illustrationData.subtitle);
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._handleResize);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._handleResize);
		}
		handleResize() {
			if (this.offsetWidth <= IllustratedMessage.BREAKPOINTS.BASE) {
				this.media = IllustratedMessage.MEDIA.BASE;
			} else if (this.offsetWidth <= IllustratedMessage.BREAKPOINTS.SPOT) {
				this.media = IllustratedMessage.MEDIA.SPOT;
			} else if (this.offsetWidth <= IllustratedMessage.BREAKPOINTS.DIALOG) {
				this.media = IllustratedMessage.MEDIA.DIALOG;
			} else {
				this.media = IllustratedMessage.MEDIA.SCENE;
			}
		}
		get effectiveIllustration() {
			switch (this.media) {
			case IllustratedMessage.MEDIA.SPOT:
				return this.spotSvg;
			case IllustratedMessage.MEDIA.DIALOG:
				return this.dialogSvg;
			case IllustratedMessage.MEDIA.SCENE:
				return this.sceneSvg;
			default:
				return "";
			}
		}
		get hasFormattedSubtitle() {
			return !!this.subtitle.length;
		}
		get effectiveTitleText() {
			return this.titleText ? this.titleText : this.illustrationTitle;
		}
		get effectiveSubitleText() {
			return this.subtitleText ? this.subtitleText : this.illustrationSubtitle;
		}
		get hasActions() {
			return !!this.actions.length && this.media !== IllustratedMessage.MEDIA.BASE;
		}
	}
	IllustratedMessage.define();

	return IllustratedMessage;

});
