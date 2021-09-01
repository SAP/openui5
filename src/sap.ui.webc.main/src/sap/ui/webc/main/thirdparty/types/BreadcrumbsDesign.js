sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const BreadcrumbsTypes = {
		Standard: "Standard",
		NoCurrentPage: "NoCurrentPage",
	};
	class BreadcrumbsDesign extends DataType__default {
		static isValid(value) {
			return !!BreadcrumbsTypes[value];
		}
	}
	BreadcrumbsDesign.generateTypeAccessors(BreadcrumbsTypes);

	return BreadcrumbsDesign;

});
