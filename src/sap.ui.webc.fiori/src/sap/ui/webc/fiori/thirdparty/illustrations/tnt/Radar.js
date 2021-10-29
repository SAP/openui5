sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Radar', './tnt-Scene-Radar', './tnt-Spot-Radar'], function (exports, Illustrations, tntDialogRadar, tntSceneRadar, tntSpotRadar) { 'use strict';

	const name = "Radar";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogRadar,
		sceneSvg: tntSceneRadar,
		spotSvg: tntSpotRadar,
		set,
	});

	exports.dialogSvg = tntDialogRadar;
	exports.sceneSvg = tntSceneRadar;
	exports.spotSvg = tntSpotRadar;

	Object.defineProperty(exports, '__esModule', { value: true });

});
