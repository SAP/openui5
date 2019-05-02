/*!
 * ${copyright}
 */

sap.ui.define([],
	function () {
		"use strict";
		/**
		 * Search renderer.
		 * @namespace
		 */

		var SearchRenderer = {};

		SearchRenderer.render = function (oRm, oSearch) {
			var oSearchField = oSearch._getSearchField(),
				oCancelButton = oSearch._getCancelButton(),
				oSearchButton = oSearch._getSearchButton(),
				bIsOpen = oSearch.getIsOpen(),
				bPhoneMode = oSearch.getPhoneMode(),
				iSearchWidth = oSearch.getWidth();

			oRm.write("<div");
			oRm.writeControlData(oSearch);
			if (bIsOpen) {
				oRm.addClass("sapFShellBarSearch");
			}
			if (bPhoneMode) {
				oRm.addClass("sapFShellBarSearchFullWidth");
			}
			if (iSearchWidth && bIsOpen && !bPhoneMode) {
				oRm.addStyle("width", iSearchWidth);
			}
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
			if (bIsOpen) {
				oRm.renderControl(oSearchField);
			}
			oRm.renderControl(oSearchButton);
			if (bIsOpen && bPhoneMode) {
				oRm.renderControl(oCancelButton);
			}
			oRm.write("</div>");
		};

		return SearchRenderer;

	}, /* bExport= */ true);
