sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/Chart-Tree-Map', './v4/Chart-Tree-Map'], function (Theme, ChartTreeMap$2, ChartTreeMap$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? ChartTreeMap$1 : ChartTreeMap$2;
	var ChartTreeMap = { pathData };

	return ChartTreeMap;

});
