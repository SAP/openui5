sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-equipment', './v4/add-equipment'], function (exports, Theme, addEquipment$1, addEquipment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addEquipment$1.pathData : addEquipment$2.pathData;
	var addEquipment = "add-equipment";

	exports.accData = addEquipment$1.accData;
	exports.ltr = addEquipment$1.ltr;
	exports.default = addEquipment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
