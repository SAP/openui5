sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartArea2', './tnt-Scene-ChartArea2', './tnt-Spot-ChartArea2'], function (exports, Illustrations, tntDialogChartArea2, tntSceneChartArea2, tntSpotChartArea2) { 'use strict';

	const name = "ChartArea2";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartArea2,
		sceneSvg: tntSceneChartArea2,
		spotSvg: tntSpotChartArea2,
		set,
	});

	exports.dialogSvg = tntDialogChartArea2;
	exports.sceneSvg = tntSceneChartArea2;
	exports.spotSvg = tntSpotChartArea2;

	Object.defineProperty(exports, '__esModule', { value: true });

});
