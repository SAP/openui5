sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Mission', './tnt-Scene-Mission', './tnt-Spot-Mission'], function (exports, Illustrations, tntDialogMission, tntSceneMission, tntSpotMission) { 'use strict';

	const name = "Mission";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogMission,
		sceneSvg: tntSceneMission,
		spotSvg: tntSpotMission,
		set,
	});

	exports.dialogSvg = tntDialogMission;
	exports.sceneSvg = tntSceneMission;
	exports.spotSvg = tntSpotMission;

	Object.defineProperty(exports, '__esModule', { value: true });

});
