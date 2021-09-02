sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const ButtonTypes = {
		Default: "Default",
		Positive: "Positive",
		Negative: "Negative",
		Transparent: "Transparent",
		Emphasized: "Emphasized",
		Attention: "Attention",
	};
	class ButtonDesign extends DataType__default {
		static isValid(value) {
			return !!ButtonTypes[value];
		}
	}
	ButtonDesign.generateTypeAccessors(ButtonTypes);

	return ButtonDesign;

});
