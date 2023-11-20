/*!
 * ${copyright}
 */

// A renderer for the HTML control
sap.ui.define(['./RenderManager'], function(RenderManager) {
	"use strict";


	// local shortcut
	var RenderPrefixes = RenderManager.RenderPrefixes;

	var HTMLRenderer = {

		apiVersion: 2,

		/**
		 * Renders either the configured content or a dummy div that will be replaced after rendering
		 *
		 * @param {sap.ui.core.RenderManager} [oRM] The RenderManager instance
		 * @param {sap.ui.core.HTML} [oControl] The instance of the invisible control
		 */
		render : function(oRM, oControl) {
			// render an invisible, but easily identifiable placeholder for the content
			oRM.openStart("div", RenderPrefixes.Dummy + oControl.getId());
			oRM.style("display", "none");
			oRM.openEnd();

			// Note: we do not render the content string here, but only in onAfterRendering
			// This has the advantage that syntax errors don't affect the whole control tree
			// but only this control...

			oRM.close("div");
		}

	};

	return HTMLRenderer;

}, /* bExport= */ true);
