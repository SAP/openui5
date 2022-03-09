sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/rhombus-milestone', './v4/rhombus-milestone'], function (Theme, rhombusMilestone$2, rhombusMilestone$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? rhombusMilestone$1 : rhombusMilestone$2;
	var rhombusMilestone = { pathData };

	return rhombusMilestone;

});
