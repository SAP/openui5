sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const TitleLevels = {
		H1: "H1",
		H2: "H2",
		H3: "H3",
		H4: "H4",
		H5: "H5",
		H6: "H6",
	};
	class TitleLevel extends DataType__default {
		static isValid(value) {
			return !!TitleLevels[value];
		}
	}
	TitleLevel.generateTypeAccessors(TitleLevels);

	return TitleLevel;

});
