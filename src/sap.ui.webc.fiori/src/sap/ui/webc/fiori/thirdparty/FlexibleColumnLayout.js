sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/types/Float', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/AnimationMode', 'sap/ui/webc/common/thirdparty/base/config/AnimationMode', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-left', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-right', './types/FCLLayout', './fcl-utils/FCLLayout', './generated/i18n/i18n-defaults', './generated/templates/FlexibleColumnLayoutTemplate.lit', './generated/themes/FlexibleColumnLayout.css'], function (UI5Element, litRender, ResizeHandler, Float, Integer, i18nBundle, AnimationMode$1, AnimationMode, Device, Button, slimArrowLeft, slimArrowRight, FCLLayout, FCLLayout$1, i18nDefaults, FlexibleColumnLayoutTemplate_lit, FlexibleColumnLayout_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var Float__default = /*#__PURE__*/_interopDefaultLegacy(Float);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var AnimationMode__default = /*#__PURE__*/_interopDefaultLegacy(AnimationMode$1);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);

	const metadata = {
		tag: "ui5-flexible-column-layout",
		properties:  {
			layout: {
				type: FCLLayout,
				defaultValue: FCLLayout.OneColumn,
			},
			hideArrows: {
				type: Boolean,
			},
			accessibilityTexts: {
				type: Object,
			},
			_width: {
				type: Float__default,
				defaultValue: 0,
			},
			_columnLayout: {
				type: Object,
				defaultValue: undefined,
			},
			_visibleColumns: {
				type: Integer__default,
				defaultValue: 0,
			},
			_layoutsConfiguration: {
				type: Object,
				defaultValue: undefined,
			},
		},
		slots:  {
			startColumn: {
				type: HTMLElement,
			},
			midColumn: {
				type: HTMLElement,
			},
			endColumn: {
				type: HTMLElement,
			},
		},
		events:  {
			"layout-change": {
				detail: {
					layout: { type: FCLLayout },
					columnLayout: { type: Array },
					startColumnVisible: { type: Boolean },
					midColumnVisible: { type: Boolean },
					endColumnVisible: { type: Boolean },
					arrowsUsed: { type: Boolean },
					resize: { type: Boolean },
				},
			},
		},
	};
	class FlexibleColumnLayout extends UI5Element__default {
		constructor() {
			super();
			this._prevLayout = null;
			this.initialRendering = true;
			this._handleResize = this.handleResize.bind(this);
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return FlexibleColumnLayout_css;
		}
		static get template() {
			return FlexibleColumnLayoutTemplate_lit;
		}
		static get dependencies() {
			return [Button__default];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		static get BREAKPOINTS() {
			return {
				"PHONE": 599,
				"TABLET": 1023,
			};
		}
		static get MEDIA() {
			return {
				PHONE: "phone",
				TABLET: "tablet",
				DESKTOP: "desktop",
			};
		}
		static get ANIMATION_DURATION() {
			return AnimationMode.getAnimationMode() !== AnimationMode__default.None ? 560 : 0;
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._handleResize);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._handleResize);
			["start", "mid", "end"].forEach(column => {
				this[`${column}ColumnDOM`].removeEventListener("transitionend", this.columnResizeHandler);
			});
		}
		onAfterRendering() {
			if (this.initialRendering) {
				this.handleInitialRendering();
				return;
			}
			this.syncLayout();
		}
		handleInitialRendering() {
			this._prevLayout = this.layout;
			this.updateLayout();
			this.initialRendering = false;
		}
		handleResize() {
			if (this.initialRendering) {
				return;
			}
			const prevLayoutHash = this.columnLayout.join();
			this.updateLayout();
			if (prevLayoutHash !== this.columnLayout.join()) {
				this.fireLayoutChange(false, true);
			}
		}
		startArrowClick() {
			this.arrowClick({ start: true, end: false });
		}
		endArrowClick() {
			this.arrowClick({ start: false, end: true });
		}
		arrowClick({ start, end }) {
			this.layout = this.nextLayout(this.layout, { start, end });
			this.updateLayout();
			this.fireLayoutChange(true, false);
		}
		updateLayout() {
			this._width = this.widthDOM;
			this._columnLayout = this.nextColumnLayout(this.layout);
			this._visibleColumns = this.calcVisibleColumns(this._columnLayout);
			this.toggleColumns();
		}
		syncLayout() {
			if (this._prevLayout !== this.layout) {
				this.updateLayout();
				this._prevLayout = this.layout;
			}
		}
		toggleColumns() {
			this.toggleColumn("start");
			this.toggleColumn("mid");
			this.toggleColumn("end");
		}
		toggleColumn(column) {
			const columnWidth = this[`${column}ColumnWidth`];
			const columnDOM = this[`${column}ColumnDOM`];
			const currentlyHidden = columnWidth === 0;
			const previouslyHidden = columnDOM.style.width === "0px";
			if (currentlyHidden && previouslyHidden) {
				return;
			}
			if (!currentlyHidden && !previouslyHidden) {
				columnDOM.style.width = columnWidth;
				return;
			}
			if (currentlyHidden) {
				columnDOM.style.width = columnWidth;
				columnDOM.addEventListener("transitionend", this.columnResizeHandler);
				return;
			}
			if (previouslyHidden) {
				columnDOM.removeEventListener("transitionend", this.columnResizeHandler);
				columnDOM.classList.remove("ui5-fcl-column--hidden");
				columnDOM.style.width = columnWidth;
			}
		}
		columnResizeHandler(event) {
			event.target.classList.add("ui5-fcl-column--hidden");
		}
		nextLayout(layout, arrowsInfo = {}) {
			if (arrowsInfo.start) {
				return FCLLayout$1.getNextLayoutByStartArrow()[layout];
			}
			if (arrowsInfo.end) {
				return FCLLayout$1.getNextLayoutByEndArrow()[layout];
			}
		}
		nextColumnLayout(layout) {
			return this._effectiveLayoutsByMedia[this.media][layout].layout;
		}
		calcVisibleColumns(colLayot) {
			return colLayot.filter(col => col !== 0).length;
		}
		fireLayoutChange(arrowUsed, resize) {
			this.fireEvent("layout-change", {
				layout: this.layout,
				columnLayout: this._columnLayout,
				startColumnVisible: this.startColumnVisible,
				midColumnVisible: this.midColumnVisible,
				endColumnVisible: this.endColumnVisible,
				arrowUsed,
				resize,
			});
		}
		get columnLayout() {
			return this._columnLayout;
		}
		get startColumnVisible() {
			if (this._columnLayout) {
				return this._columnLayout[0] !== 0;
			}
			return false;
		}
		get midColumnVisible() {
			if (this._columnLayout) {
				return this._columnLayout[1] !== 0;
			}
			return false;
		}
		get endColumnVisible() {
			if (this._columnLayout) {
				return this._columnLayout[2] !== 0;
			}
			return false;
		}
		get visibleColumns() {
			return this._visibleColumns;
		}
		get classes() {
			const hasAnimation = AnimationMode.getAnimationMode() !== AnimationMode__default.None;
			return {
				root: {
					"ui5-fcl-root": true,
					"ui5-fcl--ie": Device.isIE(),
				},
				columns: {
					start: {
						"ui5-fcl-column": true,
						"ui5-fcl-column-animation": hasAnimation,
						"ui5-fcl-column--start": true,
					},
					middle: {
						"ui5-fcl-column": true,
						"ui5-fcl-column-animation": hasAnimation,
						"ui5-fcl-column--middle": true,
					},
					end: {
						"ui5-fcl-column": true,
						"ui5-fcl-column-animation": hasAnimation,
						"ui5-fcl-column--end": true,
					},
				},
			};
		}
		get styles() {
			return {
				arrowsContainer: {
					start: {
						display: this.showStartSeparator ? "flex" : "none",
					},
					end: {
						display: this.showEndSeparator ? "flex" : "none",
					},
				},
				arrows: {
					start: {
						display: this.showStartArrow ? "inline-block" : "none",
						transform: this.startArrowDirection === "mirror" ? "rotate(180deg)" : "",
					},
					end: {
						display: this.showEndArrow ? "inline-block" : "none",
						transform: this.endArrowDirection === "mirror" ? "rotate(180deg)" : "",
					},
				},
			};
		}
		get startColumnWidth() {
			return this._columnLayout ? this._columnLayout[0] : "100%";
		}
		get midColumnWidth() {
			return this._columnLayout ? this._columnLayout[1] : 0;
		}
		get endColumnWidth() {
			return this._columnLayout ? this._columnLayout[2] : 0;
		}
		get showStartSeparator() {
			return this.effectiveArrowsInfo[0].separator || this.startArrowVisibility;
		}
		get showEndSeparator() {
			return this.effectiveArrowsInfo[1].separator || this.endArrowVisibility;
		}
		get showStartArrow() {
			return this.hideArrows ? false : this.startArrowVisibility;
		}
		get showEndArrow() {
			return this.hideArrows ? false : this.endArrowVisibility;
		}
		get startArrowVisibility() {
			return this.effectiveArrowsInfo[0].visible;
		}
		get endArrowVisibility() {
			return this.effectiveArrowsInfo[1].visible;
		}
		get startArrowDirection() {
			return this.effectiveArrowsInfo[0].dir;
		}
		get endArrowDirection() {
			return this.effectiveArrowsInfo[1].dir;
		}
		get effectiveArrowsInfo() {
			return this._effectiveLayoutsByMedia[this.media][this.layout].arrows;
		}
		get media() {
			if (this._width <= FlexibleColumnLayout.BREAKPOINTS.PHONE) {
				return FlexibleColumnLayout.MEDIA.PHONE;
			}
			if (this._width <= FlexibleColumnLayout.BREAKPOINTS.TABLET) {
				return FlexibleColumnLayout.MEDIA.TABLET;
			}
			return FlexibleColumnLayout.MEDIA.DESKTOP;
		}
		get widthDOM() {
			return this.getBoundingClientRect().width;
		}
		get startColumnDOM() {
			return this.shadowRoot.querySelector(".ui5-fcl-column--start");
		}
		get midColumnDOM() {
			return this.shadowRoot.querySelector(".ui5-fcl-column--middle");
		}
		get endColumnDOM() {
			return this.shadowRoot.querySelector(".ui5-fcl-column--end");
		}
		get accStartColumnText() {
			return this.accessibilityTexts.startColumnAccessibleName || this.i18nBundle.getText(i18nDefaults.FCL_START_COLUMN_TXT);
		}
		get accMiddleColumnText() {
			return this.accessibilityTexts.midColumnAccessibleName || this.i18nBundle.getText(i18nDefaults.FCL_MIDDLE_COLUMN_TXT);
		}
		get accEndColumnText() {
			return this.accessibilityTexts.endColumnAccessibleName || this.i18nBundle.getText(i18nDefaults.FCL_END_COLUMN_TXT);
		}
		get _effectiveLayoutsByMedia() {
			return this._layoutsConfiguration || FCLLayout$1.getLayoutsByMedia();
		}
		get accStartArrowText() {
			const customTexts = this.accessibilityTexts;
			if (this.startArrowDirection === "mirror") {
				return customTexts.startArrowLeftText || this.i18nBundle.getText(i18nDefaults.FCL_START_COLUMN_COLLAPSE_BUTTON_TOOLTIP);
			}
			return customTexts.startArrowRightText || this.i18nBundle.getText(i18nDefaults.FCL_START_COLUMN_EXPAND_BUTTON_TOOLTIP);
		}
		get accEndArrowText() {
			const customTexts = this.accessibilityTexts;
			if (this.endArrowDirection === "mirror") {
				return customTexts.endArrowRightText || this.i18nBundle.getText(i18nDefaults.FCL_END_COLUMN_COLLAPSE_BUTTON_TOOLTIP);
			}
			return customTexts.endArrowLeftText || this.i18nBundle.getText(i18nDefaults.FCL_END_COLUMN_EXPAND_BUTTON_TOOLTIP);
		}
	}
	FlexibleColumnLayout.define();

	return FlexibleColumnLayout;

});
