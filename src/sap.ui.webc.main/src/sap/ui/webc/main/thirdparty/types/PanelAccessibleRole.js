sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const PanelAccessibleRoles = {
		Complementary: "Complementary",
		Form: "Form",
		Region: "Region",
	};
	class PanelAccessibleRole extends DataType__default {
		static isValid(value) {
			return !!PanelAccessibleRoles[value];
		}
	}
	PanelAccessibleRole.generateTypeAccessors(PanelAccessibleRoles);

	return PanelAccessibleRole;

});
