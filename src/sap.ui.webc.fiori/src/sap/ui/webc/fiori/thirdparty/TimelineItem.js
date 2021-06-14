sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/main/thirdparty/Icon', 'sap/ui/webc/main/thirdparty/Link', './generated/templates/TimelineItemTemplate.lit', './generated/themes/TimelineItem.css'], function (UI5Element, litRender, Icon, Link, TimelineItemTemplate_lit, TimelineItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);
	var Link__default = /*#__PURE__*/_interopDefaultLegacy(Link);

	const metadata = {
		tag: "ui5-timeline-item",
		slots:  {
			"default": {
				type: Node,
			},
		},
		properties:  {
			icon: {
				type: String,
			},
			itemName: {
				type: String,
			},
			itemNameClickable: {
				type: Boolean,
			},
			titleText: {
				type: String,
			},
			subtitleText: {
				type: String,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
				noAttribute: true,
			},
		},
		events:  {
			"item-name-click": {},
		},
	};
	class TimelineItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TimelineItemTemplate_lit;
		}
		static get styles() {
			return TimelineItem_css;
		}
		constructor() {
			super();
		}
		onItemNamePress() {
			this.fireEvent("item-name-click", {});
		}
		static get dependencies() {
			return [
				Icon__default,
				Link__default,
			];
		}
	}
	TimelineItem.define();

	return TimelineItem;

});
