/*!
 * ${copyright}
 */
sap.ui.define(['sap/m/TreeItemBaseRenderer', 'sap/ui/core/Renderer'],
function(TreeItemBaseRenderer, Renderer) {
	"use strict";

	var DemokitTreeItemRender = Renderer.extend(TreeItemBaseRenderer);

	DemokitTreeItemRender.renderEntityType = function (oRm, oControl) {
		var sType = oControl.getEntityType(),
			sTypeAbbreviation = sType ? sType[0].toUpperCase() : "";

		if (!sType) {
			return;
		}

		oRm.write('<span');
		oRm.addClass("sapUiDemoKitTreeItemIcon");
		oRm.addClass("sapUiDemoKitTreeItem" + sTypeAbbreviation);
		oRm.writeClasses();
		oRm.write('>');

		oRm.write(sTypeAbbreviation);

		oRm.write('</span>');
	};

	DemokitTreeItemRender.renderTooltip = function(oRm, oControl) {
		var sType = oControl.getEntityType(),
			sTarget = oControl.getTarget();

		if (sType && sTarget) {
			oRm.writeAttributeEscaped("title", sType + " " + sTarget);
		}
	};

	DemokitTreeItemRender.renderLIContent = function (oRm, oControl) {

		this.renderEntityType(oRm, oControl);

		oRm.write('<a');
		oRm.writeAttributeEscaped("href", oControl.getHref());
		oRm.write('>');
		oRm.write('<span');
		oRm.addClass("sapDemokitTreeItemTitle");
		oRm.addClass("sapUiTinyMarginEnd");
		oRm.writeClasses();
		oRm.write('>');
		oRm.writeEscaped(oControl.getTitle());
		oRm.write('</span>');

		oRm.write('</a>');

		if (oControl.getDeprecated()) {
			oRm.write('<span');
			oRm.addClass("sapDemokitTreeItemLabel");
			oRm.writeClasses();
			oRm.write('>');
			oRm.write("Deprecated");
			oRm.write('</span>');
		}
	};

	return DemokitTreeItemRender;
}, /* bExport= */ true);
