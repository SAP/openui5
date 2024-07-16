/*!
 * ${copyright}
 */

// Provides default renderer for XMLView
sap.ui.define([
	'./ViewRenderer'
], function(ViewRenderer) {
	"use strict";

	/**
	 * Renderer for an XMLView.
	 *
	 * XMLViews implement <i>DOM preservation</i>. Any DOM that is not created by rendering a UI5 control
	 * will be preserved (re-used) during re-rendering of the XMLView. Child UI5 controls will be re-rendered
	 * as usual, their old DOM will be replaced with newly rendered DOM. So the only preserved parts are the
	 * native HTML or SVG parts in an XMLView.
	 *
	 * <h3>Initial Rendering</h3>
	 *
	 * The XMLView parses its XML representation into a sequence of strings and controls, where the strings
	 * represent any static HTML/SVG. The individual strings in the sequence are not well-formed HTML/SVG but usually
	 * only represent a prefix or postfix of a bigger DOM tree.
	 *
	 * During string based rendering, the sequence is rendered into the RenderManager's buffer step by step.
	 * Strings are rendered 1:1 whereas controls are rendered by {@link sap.ui.core.RenderManager#renderControl RenderManager#renderControl}.
	 * The output is wrapped with an additional &lt;div&gt; element which is marked as 'to-be-preserved' by adding
	 * the <code>data-sap-ui-preserve</code> attribute.
	 *
	 * The resulting string is converted to a tree of DOM elements as usual and injected into the desired location.
	 *
	 * <b>Note:</b> The support of using HTML and SVG tags in XML Views is deprecated since version 1.120. There
	 * will be no preserved content anymore without HTML and SVG tags.
	 *
	 * <h3>Re-rendering</h3>
	 * Before the DOM of any UI5 control is removed from the page, it will be scanned for 'to-be-preserved' subtrees.
	 * If any are found, they are moved to the <code>sap-ui-preserve</code> area for later re-use. Because of the marker
	 * attribute, this is also done for the complete DOM of an XMLView.
	 *
	 * If such an XMLView is (string-)rendered again, it will not render the parsed fragment sequence as in the initial
	 * rendering. Instead, in a first step it only renders a dummy &lt;div&gt; and all its child controls. Before a child
	 * control is (string-)rendered, any old DOM for the child (which might exist in the preserved DOM of the XMLView)
	 * is replaced by a dummy placeholder. That placeholder identifies the location in the preserved DOM where the newly
	 * rendered DOM for the child must be injected. If a child control was or is invisible, the invisible placeholders
	 * must be taken into account the same way as normal DOM.
	 *
	 * In the onAfterRendering phase, the newly rendered DOM for all the children is injected into the preserved DOM
	 * of the XMLView by replacing the dummy placeholders with the new DOM. Here as well, newly rendered invisible
	 * placeholders must be treated the same way as normal DOM. Finally, the preserved DOM replaces the newly rendered
	 * dummy wrapper for the XMLView.
	 *
	 * @namespace
	 * @alias sap.ui.core.mvc.XMLViewRenderer
	 * @private
	 */
	var XMLViewRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.mvc.XMLView} oControl an object representation of the control that should be rendered
	 */
	XMLViewRenderer.render = function(rm, oControl) {
		/**
				 * Create the root open tag.
				 *
				 */
		function writeRootOpenTag() {
			rm.openStart("div", oControl);
			rm.class("sapUiView");
			rm.class("sapUiXMLView");
			ViewRenderer.addDisplayClass(rm, oControl);
			rm.style("width", oControl.getWidth());
			rm.style("height", oControl.getHeight());
			rm.openEnd();
		}

		function writeRootCloseTag() {
			rm.close("div");
		}

		// write the HTML into the render manager
		var aParsedContent = oControl._aParsedContent, i;

		if (oControl.isBound("content")) {
			writeRootOpenTag();

			var aContent = oControl.getContent();
			for (i = 0; i < aContent.length; i++) {
				rm.renderControl(aContent[i]);
			}

			writeRootCloseTag();
		} else {
			// Log.debug("rendering " + oControl + " anew");
			var bSubView = oControl.isSubView();
			if (!bSubView) {
				writeRootOpenTag();
			}
			if (aParsedContent) {
				for (i = 0; i < aParsedContent.length; i++) {
					var vRmInfo = aParsedContent[i];
					if (!vRmInfo._isExtensionPoint) {
						// XMLView ExtensionPoint placeholder
						// we need to ignore these placeholders during rendering, they will be resolved asynchronously later by the flexibility provider
						// plain UI5 Control
						rm.renderControl(vRmInfo);
					}
				}
			}
			if (!bSubView) {
				writeRootCloseTag();
			}
		}
	};

	return XMLViewRenderer;
});