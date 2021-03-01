sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation', './generated/templates/TimelineTemplate.lit', './generated/i18n/i18n-defaults', './TimelineItem', './generated/themes/Timeline.css'], function (UI5Element, i18nBundle, litRender, ItemNavigation, TimelineTemplate_lit, i18nDefaults, TimelineItem, Timeline_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ItemNavigation__default = /*#__PURE__*/_interopDefaultLegacy(ItemNavigation);

	const metadata = {
		tag: "ui5-timeline",
		languageAware: true,
		managedSlots: true,
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
	}
	Timeline.define();

	return Timeline;

});
