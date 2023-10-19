/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component to display information on entities from the TEA_BUSI
 *   OData service.
 * @version @version@
 */
sap.ui.define([
	"sap/ui/core/sample/common/Component",
	'sap/chart/library' // In here as chart lib cannot be loaded in manifest due to interference with sinon - workarround
], function (
	CommonComponent,
	chartLib // In here as chart lib cannot be loaded in manifest due to interference with sinon - workarround
) {
	"use strict";

	return CommonComponent.extend("appUnderTestChart.Component", {
		metadata: {
			manifest: "json"
		}
	});
});
