sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/i18nBundle', './types/LinkDesign', './types/WrappingType', './generated/templates/LinkTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Link.css'], function (UI5Element, litRender, Keys, AriaLabelHelper, i18nBundle, LinkDesign, WrappingType, LinkTemplate_lit, i18nDefaults, Link_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-link",
		languageAware: true,
		properties:   {
			disabled: {
				type: Boolean,
			},
			href: {
				type: String,
			},
			target: {
				type: String,
			},
			design: {
				type: LinkDesign,
				defaultValue: LinkDesign.Default,
			},
			wrappingType: {
				type: WrappingType,
				defaultValue: WrappingType.None,
			},
			accessibleName: {
				type: String,
			},
			accessibleNameRef: {
				type: String,
			},
			 accessibleRole: {
				type: String,
			},
			 accessibilityAttributes: {
				type: Object,
			},
			_rel: {
				type: String,
				noAttribute: true,
			},
			_tabIndex: {
				type: String,
				noAttribute: true,
			},
			 focused: {
				type: Boolean,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
		events:  {
			click: {
				detail: {
					altKey: { type: Boolean	},
					ctrlKey: { type: Boolean },
					metaKey: { type: Boolean },
					shiftKey: { type: Boolean },
				},
			},
		},
	};
	class Link extends UI5Element__default {
		constructor() {
			super();
			this._dummyAnchor = document.createElement("a");
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return LinkTemplate_lit;
		}
		static get styles() {
			return Link_css;
		}
		onBeforeRendering() {
			const needsNoReferrer = this.target !== "_self"
				&& this.href
				&& this._isCrossOrigin();
			this._rel = needsNoReferrer ? "noreferrer noopener" : undefined;
		}
		_isCrossOrigin() {
			const loc = window.location;
			this._dummyAnchor.href = this.href;
			return !(this._dummyAnchor.hostname === loc.hostname
				&& this._dummyAnchor.port === loc.port
				&& this._dummyAnchor.protocol === loc.protocol);
		}
		get tabIndex() {
			if (this._tabIndex) {
				return this._tabIndex;
			}
			return (this.disabled || !this.textContent.length) ? "-1" : "0";
		}
		get ariaLabelText() {
			return AriaLabelHelper.getEffectiveAriaLabelText(this);
		}
		get hasLinkType() {
			return this.design !== LinkDesign.Default;
		}
		static typeTextMappings() {
			return {
				"Subtle": i18nDefaults.LINK_SUBTLE,
				"Emphasized": i18nDefaults.LINK_EMPHASIZED,
			};
		}
		get linkTypeText() {
			return Link.i18nBundle.getText(Link.typeTextMappings()[this.design]);
		}
		get parsedRef() {
			return (this.href && this.href.length > 0) ? this.href : undefined;
		}
		get effectiveAccRole() {
			return this.accessibleRole || "link";
		}
		static async onDefine() {
			Link.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		_onclick(event) {
			const {
				altKey,
				ctrlKey,
				metaKey,
				shiftKey,
			} = event;
			event.isMarked = "link";
			const executeEvent = this.fireEvent("click", {
				altKey,
				ctrlKey,
				metaKey,
				shiftKey,
			}, true);
			if (!executeEvent) {
				event.preventDefault();
			}
		}
		_onfocusin(event) {
			event.isMarked = "link";
			this.focused = true;
		}
		_onfocusout(event) {
			this.focused = false;
		}
		_onkeydown(event) {
			if (Keys.isEnter(event)) {
				this._onclick(event);
			} else if (Keys.isSpace(event)) {
				event.preventDefault();
			}
			event.isMarked = "link";
		}
		_onkeyup(event) {
			if (!Keys.isSpace(event)) {
				event.isMarked = "link";
				return;
			}
			this._onclick(event);
			if (this.href && !event.defaultPrevented) {
				const customEvent = new MouseEvent("click");
				this.getDomRef().dispatchEvent(customEvent);
			}
		}
	}
	Link.define();

	return Link;

});
