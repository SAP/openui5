sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/add-equipment', './v4/add-equipment'], function (Theme, addEquipment$2, addEquipment$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addEquipment$1 : addEquipment$2;
	var addEquipment = { pathData };

	return addEquipment;

});
