sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (UI5Element, litRender) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-shellbar-item",
		properties:  {
			icon: {
				type: String,
			},
			text: {
				type: String,
			},
			count: {
				type: String,
			},
		},
		events:  {
			"click": {
				detail: {
					targetRef: { type: HTMLElement },
				},
			},
		},
	};
	class ShellBarItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		get stableDomRef() {
			return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
		}
	}
	ShellBarItem.define();

	return ShellBarItem;

});
