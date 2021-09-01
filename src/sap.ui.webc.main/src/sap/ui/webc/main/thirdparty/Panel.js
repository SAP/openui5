sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/animations/slideDown', 'sap/ui/webc/common/thirdparty/base/animations/slideUp', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/AnimationMode', 'sap/ui/webc/common/thirdparty/base/config/AnimationMode', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-right', './Button', './types/TitleLevel', './types/PanelAccessibleRole', './generated/templates/PanelTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Panel.css'], function (UI5Element, litRender, slideDown, slideUp, Keys, AnimationMode$1, AnimationMode, i18nBundle, slimArrowRight, Button, TitleLevel, PanelAccessibleRole, PanelTemplate_lit, i18nDefaults, Panel_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var slideDown__default = /*#__PURE__*/_interopDefaultLegacy(slideDown);
	var slideUp__default = /*#__PURE__*/_interopDefaultLegacy(slideUp);
	var AnimationMode__default = /*#__PURE__*/_interopDefaultLegacy(AnimationMode$1);

	const metadata = {
		tag: "ui5-panel",
		languageAware: true,
		managedSlots: true,
		slots:  {
			header: {
				type: HTMLElement,
			},
			"default": {
				type: HTMLElement,
			},
		},
		properties:  {
			headerText: {
				type: String,
			},
			fixed: {
				type: Boolean,
			},
			collapsed: {
				type: Boolean,
			},
			 noAnimation: {
				type: Boolean,
			},
			accessibleRole: {
				type: PanelAccessibleRole,
				defaultValue: PanelAccessibleRole.Form,
			},
			headerLevel: {
				type: TitleLevel,
				defaultValue: TitleLevel.H2,
			},
			accessibleName: {
				type: String,
			},
			useAccessibleNameForToggleButton: {
				type: Boolean,
			},
			_hasHeader: {
				type: Boolean,
			},
			_header: {
				type: Object,
			},
			_contentExpanded: {
				type: Boolean,
				noAttribute: true,
			},
			_animationRunning: {
				type: Boolean,
				noAttribute: true,
			},
			_buttonAccInfo: {
				type: Object,
			},
		},
		events:  {
			toggle: {},
		},
	};
	class Panel extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return PanelTemplate_lit;
		}
		static get styles() {
			return Panel_css;
		}
		constructor() {
			super();
			this._header = {};
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			if (!this._animationRunning) {
				this._contentExpanded = !this.collapsed;
			}
			this._hasHeader = !!this.header.length;
		}
		shouldToggle(node) {
			const customContent = this.header.length;
			if (customContent) {
				return node.classList.contains("ui5-panel-header-button");
			}
			return true;
		}
		shouldNotAnimate() {
			return this.noAnimation || AnimationMode.getAnimationMode() === AnimationMode__default.None;
		}
		_headerClick(event) {
			if (!this.shouldToggle(event.target)) {
				return;
			}
			this._toggleOpen();
		}
		_toggleButtonClick(event) {
			if (event.x === 0 && event.y === 0) {
				event.stopImmediatePropagation();
			}
		}
		_headerKeyDown(event) {
			if (!this.shouldToggle(event.target)) {
				return;
			}
			if (Keys.isEnter(event)) {
				this._toggleOpen();
			}
			if (Keys.isSpace(event)) {
				event.preventDefault();
			}
		}
		_headerKeyUp(event) {
			if (!this.shouldToggle(event.target)) {
				return;
			}
			if (Keys.isSpace(event)) {
				this._toggleOpen();
			}
		}
		_toggleOpen() {
			if (this.fixed) {
				return;
			}
			this.collapsed = !this.collapsed;
			if (this.shouldNotAnimate()) {
				this.fireEvent("toggle");
				return;
			}
			this._animationRunning = true;
			const elements = this.getDomRef().querySelectorAll(".ui5-panel-content");
			const animations = [];
			[].forEach.call(elements, oElement => {
				if (this.collapsed) {
					animations.push(slideUp__default({
						element: oElement,
					}).promise());
				} else {
					animations.push(slideDown__default({
						element: oElement,
					}).promise());
				}
			});
			Promise.all(animations).then(_ => {
				this._animationRunning = false;
				this._contentExpanded = !this.collapsed;
				this.fireEvent("toggle");
			});
		}
		_headerOnTarget(target) {
			return target.classList.contains("sapMPanelWrappingDiv");
		}
		get classes() {
			return {
				headerBtn: {
					"ui5-panel-header-button-animated": !this.shouldNotAnimate(),
				},
			};
		}
		get toggleButtonTitle() {
			return this.i18nBundle.getText(i18nDefaults.PANEL_ICON);
		}
		get expanded() {
			return !this.collapsed;
		}
		get accRole() {
			return this.accessibleRole.toLowerCase();
		}
		get effectiveAccessibleName() {
			return typeof this.accessibleName === "string" && this.accessibleName.length ? this.accessibleName : undefined;
		}
		get accInfo() {
			return {
				"button": {
					"ariaExpanded": this.expanded,
					"ariaControls": `${this._id}-content`,
					"title": this.toggleButtonTitle,
					"ariaLabelButton": !this.nonFocusableButton && this.useAccessibleNameForToggleButton ? this.effectiveAccessibleName : undefined,
				},
				"ariaExpanded": this.nonFixedInternalHeader ? this.expanded : undefined,
				"ariaControls": this.nonFixedInternalHeader ? `${this._id}-content` : undefined,
				"ariaLabelledby": this.nonFocusableButton ? this.ariaLabelledbyReference : undefined,
				"role": this.nonFixedInternalHeader ? "button" : undefined,
			};
		}
		get ariaLabelledbyReference() {
			return (this.nonFocusableButton && this.headerText) ? `${this._id}-header-title` : undefined;
		}
		get header() {
			return this.getDomRef().querySelector(`#${this._id}-header-title`);
		}
		get headerAriaLevel() {
			return this.headerLevel.slice(1);
		}
		get headerTabIndex() {
			return (this.header.length || this.fixed) ? "-1" : "0";
		}
		get nonFixedInternalHeader() {
			return !this._hasHeader && !this.fixed;
		}
		get nonFocusableButton() {
			return !this.header.length;
		}
		get shouldRenderH1() {
			return !this.header.length && (this.headerText || !this.fixed);
		}
		get styles() {
			return {
				content: {
					display: this._contentExpanded ? "block" : "none",
				},
			};
		}
		static get dependencies() {
			return [Button];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	Panel.define();

	return Panel;

});
