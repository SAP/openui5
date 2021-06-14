sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Device', './types/WrappingType', './generated/templates/LabelTemplate.lit', './generated/themes/Label.css'], function (UI5Element, litRender, Device, WrappingType, LabelTemplate_lit, Label_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-label",
		properties:   {
			required: {
				type: Boolean,
			},
			 wrappingType: {
				type: WrappingType,
				defaultValue: WrappingType.None,
			},
			showColon: {
				type: Boolean,
			},
			"for": {
				type: String,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
	};
	class Label extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return LabelTemplate_lit;
		}
		static get styles() {
			return Label_css;
		}
		get classes() {
			return {
				textWrapper: {
					"ui5-label-text-wrapper": true,
					"ui5-label-text-wrapper-safari": Device.isSafari(),
				},
			};
		}
		_onclick() {
			const elementToFocus = document.getElementById(this.for);
			if (elementToFocus) {
				elementToFocus.focus();
			}
		}
	}
	Label.define();

	return Label;

});
