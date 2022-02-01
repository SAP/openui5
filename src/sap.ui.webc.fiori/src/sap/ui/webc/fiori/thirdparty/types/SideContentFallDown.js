sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const SideContentFallDownTypes = {
		BelowXL: "BelowXL",
		BelowL: "BelowL",
		BelowM: "BelowM",
		OnMinimumWidth: "OnMinimumWidth",
	};
	class SideContentFallDown extends DataType__default {
		static isValid(value) {
			return !!SideContentFallDownTypes[value];
		}
	}
	SideContentFallDown.generateTypeAccessors(SideContentFallDownTypes);

	return SideContentFallDown;

});
