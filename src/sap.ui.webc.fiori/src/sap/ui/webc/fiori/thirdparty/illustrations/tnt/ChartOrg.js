sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartOrg', './tnt-Scene-ChartOrg', './tnt-Spot-ChartOrg'], function (exports, Illustrations, tntDialogChartOrg, tntSceneChartOrg, tntSpotChartOrg) { 'use strict';

	const name = "ChartOrg";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartOrg,
		sceneSvg: tntSceneChartOrg,
		spotSvg: tntSpotChartOrg,
		set,
	});

	exports.dialogSvg = tntDialogChartOrg;
	exports.sceneSvg = tntSceneChartOrg;
	exports.spotSvg = tntSpotChartOrg;

	Object.defineProperty(exports, '__esModule', { value: true });

});
