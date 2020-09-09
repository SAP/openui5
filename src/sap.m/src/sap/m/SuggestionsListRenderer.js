/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Core"], function (Core) {
	"use strict";

	/**
	 * SuggestionsList renderer.
	 * @namespace
	 */
	var SuggestionsListRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the Render-Output-Buffer.
	 * @param {sap.m.SuggestionsList} oSL An object representation of the control that should be rendered.
	 */
	SuggestionsListRenderer.render = function (oRM, oSL) {
		oRM.openStart("ul", oSL)
			.class("sapMSuL")
			.class("sapMSelectList")
			.style("width", oSL.getWidth())
			.style("max-width", oSL.getMaxWidth());

		oRM.accessibilityState({
			role: "listbox",
			multiselectable: false
		});

		oRM.openEnd();

		this.renderItems(oRM, oSL);

		oRM.close("ul");
	};

	SuggestionsListRenderer.renderItems = function (oRM, oList) {
		var searchValue;
		var selectedIndex = oList.getSelectedItemIndex();
		try {
			searchValue = Core.byId(oList.getParentInput()).getValue();
		} catch (e) {
			searchValue = "";
		}
		oList.getItems().forEach(function(item, index) {
			item.render(oRM, item, searchValue, index === selectedIndex);
		});
	};

	return SuggestionsListRenderer;
});