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

		var SearchRenderer = {
			apiVersion: 2
		};

		SearchRenderer.render = function (oRm, oSearch) {
			var oSearchField = oSearch._getSearchField(),
				oCancelButton = oSearch._getCancelButton(),
				oSearchButton = oSearch._getSearchButton(),
				bIsOpen = oSearch.getIsOpen(),
				bPhoneMode = oSearch.getPhoneMode(),
				iSearchWidth = oSearch.getWidth();

			oRm.openStart("div", oSearch);
			if (bIsOpen) {
				oRm.class("sapFShellBarSearch");
			}
			if (bPhoneMode) {
				oRm.class("sapFShellBarSearchFullWidth");
			}
			if (iSearchWidth && bIsOpen && !bPhoneMode) {
				oRm.style("width", iSearchWidth);
			}
			oRm.openEnd();

			if (bIsOpen) {
				oRm.renderControl(oSearchField);
			}
			oRm.renderControl(oSearchButton);
			if (bIsOpen && bPhoneMode) {
				oRm.renderControl(oCancelButton);
			}

			oRm.close("div");
		};

		return SearchRenderer;

	}, /* bExport= */ true);
