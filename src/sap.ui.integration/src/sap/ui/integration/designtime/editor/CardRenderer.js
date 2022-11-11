/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/integration/widgets/CardRenderer",
	"sap/f/library"
], function (WidgetsCardRenderer, library) {
	"use strict";
	var HeaderPosition = library.cards.HeaderPosition;

	return WidgetsCardRenderer.extend("sap.ui.integration.designtime.editor.CardRenderer", {
		apiVersion: 2,

		/**
		 * @override
		 */
		render: function (oRm, oCard) {
			var oHeader = oCard.getCardHeader(),
				bHeaderTop = oHeader && oCard.getCardHeaderPosition() === HeaderPosition.Top;

			oRm.openStart("div", oCard);
			this.renderContainerAttributes(oRm, oCard);
			oRm.openEnd();

			// add readonly
			if (oCard.getReadonly()) {
				oRm.openStart("div", oCard.getId() + "-readonly");
				oRm.attr("tabindex", "-1");
				oRm.style("z-index", oCard.getReadonlyZIndex());
				oRm.style("position", "absolute");
				oRm.style("width", "100%");
				oRm.style("height", "100%");
				oRm.style("opacity", "0.01");
				oRm.style("background-color", "rgba(222, 222, 222, 0.5)");
				oRm.openEnd();
				oRm.close("div");
			}

			// header at the top
			if (bHeaderTop) {
				oRm.renderControl(oHeader);
			}

			// content
			this.renderContentSection(oRm, oCard);

			// header at the bottom
			if (!bHeaderTop) {
				oRm.renderControl(oHeader);
			}

			// footer
			this.renderFooterSection(oRm, oCard);

			oRm.renderControl(oCard._ariaText);
			oRm.renderControl(oCard._ariaContentText);

			oRm.close("div");
		}
	});

});