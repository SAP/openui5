sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', 'sap/ui/webc/common/thirdparty/base/types/NavigationMode', './generated/templates/TimelineTemplate.lit', './generated/i18n/i18n-defaults', './TimelineItem', './generated/themes/Timeline.css', './types/TimelineLayout'], function (UI5Element, i18nBundle, litRender, Keys, ItemNavigation, NavigationMode, TimelineTemplate_lit, i18nDefaults, TimelineItem, Timeline_css, TimelineLayout) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);
	var NavigationMode__default = /*#__PURE__*/_interopDefaultLegacy(NavigationMode);

	const SHORT_LINE_WIDTH = "ShortLineWidth";
	const LARGE_LINE_WIDTH = "LargeLineWidth";
	const metadata = {
		tag: "ui5-timeline",
		languageAware: true,
		managedSlots: true,
		properties:  {
			layout: {
				type: TimelineLayout,
				defaultValue: TimelineLayout.Vertical,
			},
		},
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
				individualSlots: true,
			},
		},
	};
	class Timeline extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return Timeline_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TimelineTemplate_lit;
		}
		constructor() {
			super();
			this._itemNavigation = new ItemNavigation__default(this, {
				getItemsCallback: () => this.items,
			});
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
		}
		static get dependencies() {
			return [TimelineItem];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		get ariaLabel() {
			return this.i18nBundle.getText(i18nDefaults.TIMELINE_ARIA_LABEL);
		}
		_onfocusin(event) {
			const target = event.target;
			this._itemNavigation.setCurrentItem(target);
		}
		onBeforeRendering() {
			this._itemNavigation.navigationMode = this.layout === TimelineLayout.Horizontal ? NavigationMode__default.Horizontal : NavigationMode__default.Vertical;
			for (let i = 0; i < this.items.length; i++) {
				this.items[i].layout = this.layout;
				if (this.items[i + 1] && !!this.items[i + 1].icon) {
					this.items[i]._lineWidth = SHORT_LINE_WIDTH;
				} else if (this.items[i].icon && this.items[i + 1] && !this.items[i + 1].icon) {
					this.items[i]._lineWidth = LARGE_LINE_WIDTH;
				}
			}
		}
		_onkeydown(event) {
			if (Keys.isTabNext(event)) {
				if (!event.target.nameClickable || event.isMarked === "link") {
					this._handleTabNextOrPrevious(event, Keys.isTabNext(event));
				}
			} else if (Keys.isTabPrevious(event)) {
				this._handleTabNextOrPrevious(event);
			}
		}
		_handleTabNextOrPrevious(event, isNext) {
			const nextTargetIndex = isNext ? this.items.indexOf(event.target) + 1 : this.items.indexOf(event.target) - 1;
			const nextTarget = this.items[nextTargetIndex];
			if (!nextTarget) {
				return;
			}
			if (nextTarget.nameClickable && !isNext) {
				event.preventDefault();
				nextTarget.shadowRoot.querySelector("[ui5-link]").focus();
				return;
			}
			event.preventDefault();
			nextTarget.focus();
			this._itemNavigation.setCurrentItem(nextTarget);
		}
	}
	Timeline.define();

	return Timeline;

});
