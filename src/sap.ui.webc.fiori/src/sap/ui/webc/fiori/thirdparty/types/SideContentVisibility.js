sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const SideContentVisibilityTypes = {
		AlwaysShow: "AlwaysShow",
		ShowAboveL: "ShowAboveL",
		ShowAboveM: "ShowAboveM",
		ShowAboveS: "ShowAboveS",
		NeverShow: "NeverShow",
	};
	class SideContentVisibility extends DataType__default {
		static isValid(value) {
			return !!SideContentVisibilityTypes[value];
		}
	}
	SideContentVisibility.generateTypeAccessors(SideContentVisibilityTypes);

	return SideContentVisibility;

});
