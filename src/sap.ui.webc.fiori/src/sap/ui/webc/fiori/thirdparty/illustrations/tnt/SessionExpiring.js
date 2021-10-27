sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-SessionExpiring', './tnt-Scene-SessionExpiring', './tnt-Spot-SessionExpiring'], function (exports, Illustrations, tntDialogSessionExpiring, tntSceneSessionExpiring, tntSpotSessionExpiring) { 'use strict';

	const name = "SessionExpiring";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogSessionExpiring,
		sceneSvg: tntSceneSessionExpiring,
		spotSvg: tntSpotSessionExpiring,
		set,
	});

	exports.dialogSvg = tntDialogSessionExpiring;
	exports.sceneSvg = tntSceneSessionExpiring;
	exports.spotSvg = tntSpotSessionExpiring;

	Object.defineProperty(exports, '__esModule', { value: true });

});
