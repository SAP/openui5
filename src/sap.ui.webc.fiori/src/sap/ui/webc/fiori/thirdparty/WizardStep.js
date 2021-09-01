sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element'], function (UI5Element) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		tag: "ui5-wizard-step",
		properties:  {
			titleText: {
				type: String,
			},
			subtitleText: {
				type: String,
			},
			icon: {
				type: String,
			},
			disabled: {
				type: Boolean,
			},
			selected: {
				type: Boolean,
			},
			branching: {
				type: Boolean,
			},
			accessibleName: {
				type: String,
			},
			accessibleNameRef: {
				type: String,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
		events:  {
		},
	};
	class WizardStep extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
	}
	WizardStep.define();

	return WizardStep;

});
