sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const AvatarColorSchemes = {
		Accent1: "Accent1",
		Accent2: "Accent2",
		Accent3: "Accent3",
		Accent4: "Accent4",
		Accent5: "Accent5",
		Accent6: "Accent6",
		Accent7: "Accent7",
		Accent8: "Accent8",
		Accent9: "Accent9",
		Accent10: "Accent10",
		Placeholder: "Placeholder",
	};
	class AvatarColorScheme extends DataType__default {
		static isValid(value) {
			return !!AvatarColorSchemes[value];
		}
	}
	AvatarColorScheme.generateTypeAccessors(AvatarColorSchemes);

	return AvatarColorScheme;

});
