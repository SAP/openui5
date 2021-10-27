sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './tnt-Dialog-SessionExpired', './tnt-Scene-SessionExpired', './tnt-Spot-SessionExpired'], function (exports, Illustrations, tntDialogSessionExpired, tntSceneSessionExpired, tntSpotSessionExpired) { 'use strict';

	const name = "SessionExpired";
	const set = "tnt";
	Illustrations.registerIllustration(name, {
		dialogSvg: tntDialogSessionExpired,
		sceneSvg: tntSceneSessionExpired,
		spotSvg: tntSpotSessionExpired,
		set,
	});

	exports.dialogSvg = tntDialogSessionExpired;
	exports.sceneSvg = tntSceneSessionExpired;
	exports.spotSvg = tntSpotSessionExpired;

	Object.defineProperty(exports, '__esModule', { value: true });

});
