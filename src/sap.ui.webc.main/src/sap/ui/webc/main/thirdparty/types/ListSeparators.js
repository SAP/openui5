sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const ListSeparatorsTypes = {
		All: "All",
		Inner: "Inner",
		None: "None",
	};
	class ListSeparators extends DataType__default {
		static isValid(value) {
			return !!ListSeparatorsTypes[value];
		}
	}
	ListSeparators.generateTypeAccessors(ListSeparatorsTypes);

	return ListSeparators;

});
