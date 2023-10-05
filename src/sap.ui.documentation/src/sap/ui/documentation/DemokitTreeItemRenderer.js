/*!
 * ${copyright}
 */
sap.ui.define(['sap/m/TreeItemBaseRenderer', 'sap/ui/core/Core', 'sap/ui/core/Renderer', "sap/ui/core/Lib"],
function(TreeItemBaseRenderer, Core, Renderer, Lib) {
	"use strict";

	var DemokitTreeItemRender = Renderer.extend(TreeItemBaseRenderer);

	DemokitTreeItemRender.apiVersion = 2;

	DemokitTreeItemRender.renderEntityType = function (oRm, oControl) {
		var sType = oControl.getEntityType(),
			sTypeAbbreviation = sType ? sType[0].toUpperCase() : "";

		if (!sType) {
			return;
		}

		oRm.openStart('span')
			.class("sapUiDemoKitTreeItemIcon")
			.class("sapUiDemoKitTreeItem" + sTypeAbbreviation)
			.openEnd()
			.text(sTypeAbbreviation)
			.close('span');
	};

	DemokitTreeItemRender.renderTooltip = function(oRm, oControl) {
		var sType = oControl.getEntityType(),
			sTarget = oControl.getTarget();

		if (sType && sTarget) {
			oRm.attr("title", sType + " " + sTarget);
		}
	};

	DemokitTreeItemRender.renderLIContent = function (oRm, oControl) {
		var oResourceBundle;

		this.renderEntityType(oRm, oControl);

		oRm.openStart('a')
			.attr("href", oControl.getHref())
			.openEnd();

			oRm.openStart('span')
				.class("sapDemokitTreeItemTitle")
				.class("sapUiTinyMarginEnd")
				.openEnd()
				.text(oControl.getTitle())
				.close('span');

		oRm.close('a');

		if (oControl.getDeprecated()) {
			oResourceBundle = Lib.getResourceBundleFor("sap.ui.documentation");

			oRm.openStart('span')
				.class("sapDemokitTreeItemLabel")
				.openEnd()
				.text(oResourceBundle.getText("API_MASTER_DEPRECATED"))
				.close('span');
		}
	};

	return DemokitTreeItemRender;
}, /* bExport= */ true);
