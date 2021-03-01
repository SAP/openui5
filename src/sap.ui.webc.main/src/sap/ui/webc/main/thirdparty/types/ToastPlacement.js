sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/DataType'], function (DataType) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var DataType__default = /*#__PURE__*/_interopDefaultLegacy(DataType);

	const ToastPlacements = {
		TopStart: "TopStart",
		TopCenter: "TopCenter",
		TopEnd: "TopEnd",
		MiddleStart: "MiddleStart",
		MiddleCenter: "MiddleCenter",
		MiddleEnd: "MiddleEnd",
		BottomStart: "BottomStart",
		BottomCenter: "BottomCenter",
		BottomEnd: "BottomEnd",
	};
	class ToastPlacement extends DataType__default {
		static isValid(value) {
			return !!ToastPlacements[value];
		}
	}
	ToastPlacement.generateTypeAccessors(ToastPlacements);

	return ToastPlacement;

});
