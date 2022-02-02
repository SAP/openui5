sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const PopupTypes = {
		Dialog: "Dialog",
		Grid: "Grid",
		ListBox: "ListBox",
		Menu: "Menu",
		Tree: "Tree",
	};
	class HasPopup extends DataType__default {
		static isValid(value) {
			return !!PopupTypes[value];
		}
	}
	HasPopup.generateTypeAccessors(PopupTypes);

	return HasPopup;

});
