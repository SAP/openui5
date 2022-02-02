sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Illustrations', './sapIllus-Dialog-SortColumn', './sapIllus-Scene-SortColumn', './sapIllus-Spot-SortColumn', '../generated/i18n/i18n-defaults'], function (exports, Illustrations, sapIllusDialogSortColumn, sapIllusSceneSortColumn, sapIllusSpotSortColumn, i18nDefaults) { 'use strict';

	const name = "SortColumn";
	const set = "fiori";
	const title = i18nDefaults.IM_TITLE_SORTCOLUMN;
	const subtitle = i18nDefaults.IM_SUBTITLE_SORTCOLUMN;
	Illustrations.registerIllustration(name, {
		dialogSvg: sapIllusDialogSortColumn,
		sceneSvg: sapIllusSceneSortColumn,
		spotSvg: sapIllusSpotSortColumn,
		title,
		subtitle,
		set,
	});

	exports.dialogSvg = sapIllusDialogSortColumn;
	exports.sceneSvg = sapIllusSceneSortColumn;
	exports.spotSvg = sapIllusSpotSortColumn;

	Object.defineProperty(exports, '__esModule', { value: true });

});
