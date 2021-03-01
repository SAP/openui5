sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const AvatarSizes = {
		XS: "XS",
		S: "S",
		M: "M",
		L: "L",
		XL: "XL",
	};
	class AvatarSize extends DataType__default {
		static isValid(value) {
			return !!AvatarSizes[value];
		}
	}
	AvatarSize.generateTypeAccessors(AvatarSizes);

	return AvatarSize;

});
