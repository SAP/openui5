sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element'], function (UI5Element) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-breadcrumbs-item",
		managedSlots: true,
		properties:  {
			 href: {
				type: String,
			},
			 target: {
				type: String,
				defaultValue: undefined,
			},
			 accessibleName: {
				type: String,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
		events:  {},
	};
	class BreadcrumbsItem extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		get stableDomRef() {
			return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
		}
	}
	BreadcrumbsItem.define();

	return BreadcrumbsItem;

});
