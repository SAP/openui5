sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const FCLLayouts = {
		OneColumn: "OneColumn",
		TwoColumnsStartExpanded: "TwoColumnsStartExpanded",
		TwoColumnsMidExpanded: "TwoColumnsMidExpanded",
		ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",
		ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",
		ThreeColumnsStartExpandedEndHidden: "ThreeColumnsStartExpandedEndHidden",
		ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",
		MidColumnFullScreen: "MidColumnFullScreen",
		EndColumnFullScreen: "EndColumnFullScreen",
	};
	class FCLLayout extends DataType__default {
		static isValid(value) {
			return !!FCLLayouts[value];
		}
	}
	FCLLayout.generateTypeAccessors(FCLLayouts);

	return FCLLayout;

});
