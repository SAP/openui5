sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', './types/SideContentPosition', './types/SideContentVisibility', './types/SideContentFallDown', './generated/templates/DynamicSideContentTemplate.lit', './generated/themes/DynamicSideContent.css', './generated/i18n/i18n-defaults'], function (UI5Element, i18nBundle, litRender, ResizeHandler, SideContentPosition, SideContentVisibility, SideContentFallDown, DynamicSideContentTemplate_lit, DynamicSideContent_css, i18nDefaults) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);

	const S_M_BREAKPOINT = 720,
		M_L_BREAKPOINT = 1024,
		L_XL_BREAKPOINT = 1440,
		MINIMUM_WIDTH_BREAKPOINT = 960;
	const metadata = {
		tag: "ui5-dynamic-side-content",
		managedSlots: true,
		properties:  {
			 hideMainContent: {
				type: Boolean,
			},
			hideSideContent: {
				type: Boolean,
			},
			 sideContentPosition: {
				type: SideContentPosition,
				defaultValue: SideContentPosition.End,
			},
			sideContentVisibility: {
				type: SideContentVisibility,
				defaultValue: SideContentVisibility.ShowAboveS,
			},
			sideContentFallDown: {
				type: SideContentFallDown,
				defaultValue: SideContentFallDown.OnMinimumWidth,
			},
			equalSplit: {
				type: Boolean,
			},
			_mcSpan: {
				type: String,
				defaultValue: "0",
				noAttribute: true,
			},
			 _scSpan: {
				type: String,
				defaultValue: "0",
				noAttribute: true,
			},
			 _toggled: {
				type: Boolean,
				noAttribute: true,
			},
			 _currentBreakpoint: {
				type: String,
				noAttribute: true,
			},
		},
		slots:  {
			"default": {
				type: HTMLElement,
			},
			 "sideContent": {
				type: HTMLElement,
			},
		},
		events:  {
			"layout-change": {
				detail: {
					currentBreakpoint: {
						type: String,
					},
					previousBreakpoint: {
						type: String,
					},
					mainContentVisible: {
						type: Boolean,
					},
					sideContentVisible: {
						type: Boolean,
					},
				},
			},
		},
	};
	class DynamicSideContent extends UI5Element__default {
		constructor() {
			super();
			this._handleResizeBound = this.handleResize.bind(this);
		}
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return DynamicSideContent_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return DynamicSideContentTemplate_lit;
		}
		static async onDefine() {
			DynamicSideContent.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
		}
		onAfterRendering() {
			this._resizeContents();
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._handleResizeBound);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._handleResizeBound);
		}
		 toggleContents() {
			if (this.breakpoint === this.sizeS && this.sideContentVisibility !== SideContentVisibility.AlwaysShow) {
				this._toggled = !this._toggled;
			}
		}
		get classes() {
			const gridPrefix = "ui5-dsc-span",
				mcSpan = this._toggled ? this._scSpan : this._mcSpan,
				scSpan = this._toggled ? this._mcSpan : this._scSpan,
				classes = {
					main: {
						"ui5-dsc-main": true,
					},
					side: {
						"ui5-dsc-side": true,
					},
				};
			classes.main[`${gridPrefix}-${mcSpan}`] = true;
			classes.side[`${gridPrefix}-${scSpan}`] = true;
			return classes;
		}
		get styles() {
			const isToggled = this.breakpoint === this.sizeS && this._toggled,
				mcSpan = isToggled ? this._scSpan : this._mcSpan,
				scSpan = isToggled ? this._mcSpan : this._scSpan,
				contentHeight = this.breakpoint === this.sizeS && this.sideContentVisibility !== SideContentVisibility.AlwaysShow ? "100%" : "auto";
			return {
				root: {
					"flex-wrap": this._mcSpan === "12" ? "wrap" : "nowrap",
				},
				main: {
					"height": mcSpan === this.span12 ? contentHeight : "100%",
					"order": this.sideContentPosition === SideContentPosition.Start ? 2 : 1,
				},
				side: {
					"height": scSpan === this.span12 ? contentHeight : "100%",
					"order": this.sideContentPosition === SideContentPosition.Start ? 1 : 2,
				},
			};
		}
		get accInfo() {
			return {
				"label": DynamicSideContent.i18nBundle.getText(i18nDefaults.DSC_SIDE_ARIA_LABEL),
			};
		}
		get sizeS() {
			return "S";
		}
		get sizeM() {
			return "M";
		}
		get sizeL() {
			return "L";
		}
		get sizeXL() {
			return "XL";
		}
		get span0() {
			return "0";
		}
		get span3() {
			return "3";
		}
		get span4() {
			return "4";
		}
		get span6() {
			return "6";
		}
		get span8() {
			return "8";
		}
		get span9() {
			return "9";
		}
		get span12() {
			return "12";
		}
		get spanFixed() {
			return "fixed";
		}
		get containerWidth() {
			return this.parentElement.clientWidth;
		}
		get breakpoint() {
			let size;
			if (this.containerWidth <= S_M_BREAKPOINT) {
				size = this.sizeS;
			} else if (this.containerWidth > S_M_BREAKPOINT && this.containerWidth <= M_L_BREAKPOINT) {
				size = this.sizeM;
			} else if (this.containerWidth > M_L_BREAKPOINT && this.containerWidth <= L_XL_BREAKPOINT) {
				size = this.sizeL;
			} else {
				size = this.sizeXL;
			}
			return size;
		}
		handleResize() {
			this._resizeContents();
		}
		_resizeContents() {
			let mainSize,
				sideSize,
				sideVisible;
			switch (this.breakpoint) {
			case this.sizeS:
				mainSize = this.span12;
				sideSize = this.span12;
				break;
			case this.sizeM:
				if (this.sideContentFallDown === SideContentFallDown.BelowXL
					|| this.sideContentFallDown === SideContentFallDown.BelowL
					|| (this.containerWidth <= MINIMUM_WIDTH_BREAKPOINT && this.sideContentFallDown === SideContentFallDown.OnMinimumWidth)) {
					mainSize = this.span12;
					sideSize = this.span12;
				} else {
					mainSize = this.equalSplit ? this.span6 : this.spanFixed;
					sideSize = this.equalSplit ? this.span6 : this.spanFixed;
				}
				sideVisible = this.sideContentVisibility === SideContentVisibility.ShowAboveS
					|| this.sideContentVisibility === SideContentVisibility.AlwaysShow;
				break;
			case this.sizeL:
				if (this.sideContentFallDown === SideContentFallDown.BelowXL) {
					mainSize = this.span12;
					sideSize = this.span12;
				} else {
					mainSize = this.equalSplit ? this.span6 : this.span8;
					sideSize = this.equalSplit ? this.span6 : this.span4;
				}
				sideVisible = this.sideContentVisibility === SideContentVisibility.ShowAboveS
					|| this.sideContentVisibility === SideContentVisibility.ShowAboveM
					|| this.sideContentVisibility === SideContentVisibility.AlwaysShow;
				break;
			case this.sizeXL:
				mainSize = this.equalSplit ? this.span6 : this.span9;
				sideSize = this.equalSplit ? this.span6 : this.span3;
				sideVisible = this.sideContentVisibility !== SideContentVisibility.NeverShow;
			}
			if (this.sideContentVisibility === SideContentVisibility.AlwaysShow) {
				sideVisible = true;
			}
			if (this.hideSideContent) {
				mainSize = this.hideMainContent ? this.span0 : this.span12;
				sideSize = this.span0;
				sideVisible = false;
			}
			if (this.hideMainContent) {
				mainSize = this.span0;
				sideSize = this.hideSideContent ? this.span0 : this.span12;
				sideVisible = true;
			}
			if (!sideVisible) {
				mainSize = this.span12;
				sideSize = this.span0;
			}
			if (this._currentBreakpoint !== this.breakpoint) {
				const eventParams = {
					currentBreakpoint: this.breakpoint,
					previousBreakpoint: this._currentBreakpoint,
					mainContentVisible: mainSize !== this.span0,
					sideContentVisible: sideSize !== this.span0,
				};
				this.fireEvent("layout-change", eventParams);
				this._currentBreakpoint = this.breakpoint;
			}
			this._setSpanSizes(mainSize, sideSize);
		}
		_setSpanSizes(mainSize, sideSize) {
			this._mcSpan = mainSize;
			this._scSpan = sideSize;
			if (this.breakpoint !== this.sizeS) {
				this._toggled = false;
			}
		}
	}
	DynamicSideContent.define();

	return DynamicSideContent;

});
