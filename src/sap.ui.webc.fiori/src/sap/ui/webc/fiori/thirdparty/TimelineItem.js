sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/main/thirdparty/Icon', 'sap/ui/webc/main/thirdparty/Link', './generated/templates/TimelineItemTemplate.lit', './types/TimelineLayout', './generated/themes/TimelineItem.css'], function (UI5Element, litRender, Icon, Link, TimelineItemTemplate_lit, TimelineLayout, TimelineItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);
	var Link__default = /*#__PURE__*/_interopDefaultLegacy(Link);

	const SHORT_LINE_WIDTH = "ShortLineWidth";
	const LARGE_LINE_WIDTH = "LargeLineWidth";
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
			name: {
				type: String,
			},
			nameClickable: {
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
			layout: {
				type: TimelineLayout,
				defaultvalue: TimelineLayout.Vertical,
			},
			_lineWidth: {
				type: String,
			},
		},
		events:  {
			"name-click": {},
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
		onNamePress() {
			this.fireEvent("name-click", {});
		}
		static get dependencies() {
			return [
				Icon__default,
				Link__default,
			];
		}
		get classes() {
			return {
				indicator: {
					"ui5-tli-indicator": true,
					"ui5-tli-indicator-short-line": this._lineWidth === SHORT_LINE_WIDTH,
					"ui5-tli-indicator-large-line": this._lineWidth === LARGE_LINE_WIDTH,
				},
				bubbleArrowPosition: {
					"ui5-tli-bubble-arrow": true,
					"ui5-tli-bubble-arrow--left": this.layout === TimelineLayout.Vertical,
					"ui5-tli-bubble-arrow--top": this.layout === TimelineLayout.Horizontal,
				},
			};
		}
	}
	TimelineItem.define();

	return TimelineItem;

});
