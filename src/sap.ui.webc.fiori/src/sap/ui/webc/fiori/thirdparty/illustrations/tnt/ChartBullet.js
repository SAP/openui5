sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-ChartBullet', './tnt-Scene-ChartBullet', './tnt-Spot-ChartBullet'], function (exports, Illustrations, tntDialogChartBullet, tntSceneChartBullet, tntSpotChartBullet) { 'use strict';

	const name = "ChartBullet";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogChartBullet,
		sceneSvg: tntSceneChartBullet,
		spotSvg: tntSpotChartBullet,
		set,
	});

	exports.dialogSvg = tntDialogChartBullet;
	exports.sceneSvg = tntSceneChartBullet;
	exports.spotSvg = tntSpotChartBullet;

	Object.defineProperty(exports, '__esModule', { value: true });

});
