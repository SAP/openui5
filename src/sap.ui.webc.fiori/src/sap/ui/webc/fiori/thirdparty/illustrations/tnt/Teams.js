sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-Teams', './tnt-Scene-Teams', './tnt-Spot-Teams'], function (exports, Illustrations, tntDialogTeams, tntSceneTeams, tntSpotTeams) { 'use strict';

	const name = "Teams";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogTeams,
		sceneSvg: tntSceneTeams,
		spotSvg: tntSpotTeams,
		set,
	});

	exports.dialogSvg = tntDialogTeams;
	exports.sceneSvg = tntSceneTeams;
	exports.spotSvg = tntSpotTeams;

	Object.defineProperty(exports, '__esModule', { value: true });

});
