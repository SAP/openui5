/*!
 * ${copyright}
 */

// Provides default renderer for JSView
sap.ui.define(['./ViewRenderer'],
	function(ViewRenderer) {
	"use strict";


	/**
	 * HTMLView renderer.
	 * @namespace
	 * @alias sap.ui.core.mvc.HTMLViewRenderer
	 */
	var HTMLViewRenderer = {
		apiVersion: 1 // DOM patching fails if HTMLView contains trailing text content
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for rendering the view content
	 * @param {sap.ui.core.mvc.HTMLView} oControl an object representation of the control that should be rendered
	 */
	HTMLViewRenderer.render = function(rm, oControl){
		// write the HTML into the render manager
		rm.openStart("div", oControl);
		rm.class("sapUiView");
		rm.class("sapUiHTMLView");
		ViewRenderer.addDisplayClass(rm, oControl);
		rm.style("width", oControl.getWidth());
		rm.style("height", oControl.getHeight());
		rm.openEnd();

		// check if the template has been loaded in async view case
		if (oControl._oTemplate) {
			var sHTML = oControl._oTemplate.innerHTML;

			var content = oControl.getContent();
			var aDeferred = [];

			// helper method to render the controls
			var renderControl = function(oControl) {
				var sTemp = HTMLViewRenderer._getHTML(rm, oControl, sHTML);
				if (sTemp) {
					sHTML = sTemp;
				} else {
					aDeferred.push(oControl);
				}
			};

			if (content) {
				if (Array.isArray(content)) {
					// looks like an Array
					for (var i = 0; i < content.length; i++) {
						renderControl(content[i]);
					}

				} else if (content) {
					// should be a Control
					renderControl(content);
				}
			}

			rm.unsafeHtml(sHTML);

			// all controls that are not found in the template will be added at the end
			for (var k = 0; k < aDeferred.length; k++) {
				rm.renderControl(aDeferred[k]);
			}
		}

		rm.close("div");
	};


	/**
	 * Replaces the control placeholder in the given HTML template. Returns the new HTML template if the control was found in the template.
	 *
	 * @param {sap.ui.core.RenderManager} oRenderManager the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 * @param {string} sHTML the HTML to replace with the control HTML
	 * @return {string} the replaced HTML. Empty string "" when the control ID was not found in the given HTML string.
	 * @private
	 */
	HTMLViewRenderer._getHTML = function (oRenderManager, oControl, sHTML) {
		var sId = oControl.getId();
		// First add new lines before any div, so that we can use an easy regexp
		sHTML = sHTML.replace(/(<div)/gi, "\n$1");
		// Simple replace the placeholder with control html
		var regExp = new RegExp('<div.*?data-sap-ui-id="' + sId + '".*?></div>', "gi");
		var aMatches = regExp.exec(sHTML);
		if (aMatches) {
			sHTML = sHTML.replace(aMatches[0], oRenderManager.getHTML(oControl));
			return sHTML;
		} else {
			return "";
		}
	};

	return HTMLViewRenderer;

}, /* bExport= */ true);
