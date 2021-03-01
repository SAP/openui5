sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/decline', 'sap/ui/webc/common/thirdparty/icons/information', 'sap/ui/webc/common/thirdparty/icons/sys-enter-2', 'sap/ui/webc/common/thirdparty/icons/error', 'sap/ui/webc/common/thirdparty/icons/alert', './types/MessageStripDesign', './generated/templates/MessageStripTemplate.lit', './Icon', './Button', './generated/i18n/i18n-defaults', './generated/themes/MessageStrip.css'], function (UI5Element, litRender, i18nBundle, decline, information, sysEnter2, error, alert, MessageStripDesign, MessageStripTemplate_lit, Icon, Button, i18nDefaults, MessageStrip_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-messagestrip",
		languageAware: true,
		properties:  {
			design: {
				type: MessageStripDesign,
				defaultValue: MessageStripDesign.Information,
			},
			hideIcon: {
				type: Boolean,
			},
			hideCloseButton: {
				type: Boolean,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				type: Node,
			},
			"icon": {
				type: HTMLElement,
			},
		},
		events:  {
			close: {},
		},
	};
	class MessageStrip extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return MessageStripTemplate_lit;
		}
		static get styles() {
			return MessageStrip_css;
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		_closeClick() {
			this.fireEvent("close", {});
		}
		static get dependencies() {
			return [
				Icon,
				Button,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		static designClassesMappings() {
			return {
				"Information": "ui5-messagestrip-root--info",
				"Positive": "ui5-messagestrip-root--positive",
				"Negative": "ui5-messagestrip-root--negative",
				"Warning": "ui5-messagestrip-root--warning",
			};
		}
		static iconMappings() {
			return {
				"Information": "information",
				"Positive": "sys-enter-2",
				"Negative": "error",
				"Warning": "alert",
			};
		}
		get hiddenText() {
			return `Message Strip ${this.design} ${this.hideCloseButton ? "" : "closable"}`;
		}
		get _closeButtonText() {
			return this.i18nBundle.getText(i18nDefaults.MESSAGE_STRIP_CLOSE_BUTTON);
		}
		get classes() {
			return {
				root: {
					"ui5-messagestrip-root": true,
					"ui5-messagestrip-root-hide-icon": this.hideIcon,
					"ui5-messagestrip-root-hide-close-button": this.hideCloseButton,
					[this.designClasses]: true,
				},
			};
		}
		get iconProvided() {
			return this.icon.length > 0;
		}
		get standardIconName() {
			return MessageStrip.iconMappings()[this.design];
		}
		get designClasses() {
			return MessageStrip.designClassesMappings()[this.design];
		}
	}
	MessageStrip.define();

	return MessageStrip;

});
