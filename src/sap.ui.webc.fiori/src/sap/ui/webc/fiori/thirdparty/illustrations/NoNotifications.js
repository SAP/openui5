sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-NoNotifications', './sapIllus-Scene-NoNotifications', './sapIllus-Spot-NoNotifications', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogNoNotifications, sapIllusSceneNoNotifications, sapIllusSpotNoNotifications, i18nDefaults) { 'use strict';

	const name = "NoNotifications";
	const title = i18nDefaults.IM_TITLE_NONOTIFICATIONS;
	const subtitle = i18nDefaults.IM_SUBTITLE_NONOTIFICATIONS;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogNoNotifications,
		sceneSvg: sapIllusSceneNoNotifications,
		spotSvg: sapIllusSpotNoNotifications,
		title,
		subtitle,
	});

	exports.dialogSvg = sapIllusDialogNoNotifications;
	exports.sceneSvg = sapIllusSceneNoNotifications;
	exports.spotSvg = sapIllusSpotNoNotifications;

	Object.defineProperty(exports, '__esModule', { value: true });

});
