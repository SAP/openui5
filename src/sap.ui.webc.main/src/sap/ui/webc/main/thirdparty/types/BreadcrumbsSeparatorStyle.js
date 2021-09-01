sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const SeparatorTypes = {
		Slash: "Slash",
		BackSlash: "BackSlash",
		DoubleBackSlash: "DoubleBackSlash",
		DoubleGreaterThan: "DoubleGreaterThan",
		DoubleSlash: "DoubleSlash",
		GreaterThan: "GreaterThan",
	};
	class BreadcrumbsSeparatorStyle extends DataType__default {
		static isValid(value) {
			return !!SeparatorTypes[value];
		}
	}
	BreadcrumbsSeparatorStyle.generateTypeAccessors(SeparatorTypes);

	return BreadcrumbsSeparatorStyle;

});
