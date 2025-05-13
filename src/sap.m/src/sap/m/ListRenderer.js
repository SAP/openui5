/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Renderer", "./ListBaseRenderer", "sap/ui/core/InvisibleText"],
	function(Renderer, ListBaseRenderer, InvisibleText) {
	"use strict";


	/**
	 * List renderer.
	 *
	 * ListRenderer extends the ListBaseRenderer
	 * @namespace
	 * @alias sap.m.ListRenderer
	 */
	var ListRenderer = Renderer.extend(ListBaseRenderer);
	ListRenderer.apiVersion = 2;

	ListRenderer.getNoDataAriaRole = function(oControl) {
		return oControl.getAriaRole() === "listbox" ? "option" : "listitem";
	};

	ListRenderer.getAriaDescribedBy = function(oControl) {
		const aDescribedBy = [];

		if (oControl.getAriaRole() === "list" && oControl._sAriaRoleDescriptionKey) {
			aDescribedBy.push(InvisibleText.getStaticId("sap.m", oControl._sAriaRoleDescriptionKey));
		}

		const sBaseDescribedBy = ListBaseRenderer.getAriaDescribedBy(oControl);
		if (sBaseDescribedBy) {
			aDescribedBy.push(sBaseDescribedBy);
		}

		return aDescribedBy.length ? aDescribedBy.join(" ") : null;
	};

	return ListRenderer;

}, /* bExport= */ true);
