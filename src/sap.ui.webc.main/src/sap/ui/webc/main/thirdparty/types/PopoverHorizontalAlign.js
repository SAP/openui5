sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const PopoverHorizontalAligns = {
		Center: "Center",
		Left: "Left",
		Right: "Right",
		Stretch: "Stretch",
	};
	class PopoverHorizontalAlign extends DataType__default {
		static isValid(value) {
			return !!PopoverHorizontalAligns[value];
		}
	}
	PopoverHorizontalAlign.generateTypeAccessors(PopoverHorizontalAligns);

	return PopoverHorizontalAlign;

});
