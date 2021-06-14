sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const ListModes = {
		None: "None",
		SingleSelect: "SingleSelect",
		SingleSelectBegin: "SingleSelectBegin",
		SingleSelectEnd: "SingleSelectEnd",
		SingleSelectAuto: "SingleSelectAuto",
		MultiSelect: "MultiSelect",
		Delete: "Delete",
	};
	class ListMode extends DataType__default {
		static isValid(value) {
			return !!ListModes[value];
		}
	}
	ListMode.generateTypeAccessors(ListModes);

	return ListMode;

});
