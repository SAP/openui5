sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const Priorities = {
		High: "High",
		Medium: "Medium",
		Low: "Low",
		None: "None",
	};
	class Priority extends DataType__default {
		static isValid(value) {
			return !!Priorities[value];
		}
	}
	Priority.generateTypeAccessors(Priorities);

	return Priority;

});
