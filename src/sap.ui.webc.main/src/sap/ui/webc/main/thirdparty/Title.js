sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './types/TitleLevel', './types/WrappingType', './generated/templates/TitleTemplate.lit', './generated/themes/Title.css'], function (UI5Element, litRender, TitleLevel, WrappingType, TitleTemplate_lit, Title_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-title",
		properties:  {
			wrappingType: {
				type: WrappingType,
				defaultValue: WrappingType.None,
			},
			level: {
				type: TitleLevel,
				defaultValue: TitleLevel.H2,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
		},
	};
	class Title extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TitleTemplate_lit;
		}
		static get styles() {
			return Title_css;
		}
		get normalizedLevel() {
			return this.level.toLowerCase();
		}
		get h1() {
			return this.normalizedLevel === "h1";
		}
		get h2() {
			return this.normalizedLevel === "h2";
		}
		get h3() {
			return this.normalizedLevel === "h3";
		}
		get h4() {
			return this.normalizedLevel === "h4";
		}
		get h5() {
			return this.normalizedLevel === "h5";
		}
		get h6() {
			return this.normalizedLevel === "h6";
		}
	}
	Title.define();

	return Title;

});
