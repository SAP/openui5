sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Systems', './tnt-Scene-Systems', './tnt-Spot-Systems'], function (exports, Illustrations, tntDialogSystems, tntSceneSystems, tntSpotSystems) { 'use strict';

	const name = "Systems";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogSystems,
		sceneSvg: tntSceneSystems,
		spotSvg: tntSpotSystems,
		set,
	});

	exports.dialogSvg = tntDialogSystems;
	exports.sceneSvg = tntSceneSystems;
	exports.spotSvg = tntSpotSystems;

	Object.defineProperty(exports, '__esModule', { value: true });

});
