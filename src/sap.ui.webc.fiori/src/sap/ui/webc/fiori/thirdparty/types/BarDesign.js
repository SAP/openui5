sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const BarTypes = {
		Header: "Header",
		Subheader: "Subheader",
		Footer: "Footer",
		FloatingFooter: "FloatingFooter",
	};
	class BarDesign extends DataType__default {
		static isValid(value) {
			return !!BarTypes[value];
		}
	}
	BarDesign.generateTypeAccessors(BarTypes);

	return BarDesign;

});
