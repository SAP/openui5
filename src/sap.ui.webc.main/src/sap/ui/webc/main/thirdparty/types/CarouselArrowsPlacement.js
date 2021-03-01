sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const CarouselArrowsPlacementTypes = {
		Content: "Content",
		Navigation: "Navigation",
	};
	class CarouselArrowsPlacement extends DataType__default {
		static isValid(value) {
			return !!CarouselArrowsPlacementTypes[value];
		}
	}
	CarouselArrowsPlacement.generateTypeAccessors(CarouselArrowsPlacementTypes);

	return CarouselArrowsPlacement;

});
