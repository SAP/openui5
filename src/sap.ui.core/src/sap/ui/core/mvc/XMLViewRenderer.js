/*!
 * ${copyright}
 */

// Provides default renderer for XMLView
sap.ui.define([
	'./ViewRenderer',
	'../RenderManager',
	"sap/ui/thirdparty/jquery"
], function(ViewRenderer, RenderManager, jQuery) {
	"use strict";

	// shortcut
	var PREFIX_DUMMY = RenderManager.RenderPrefixes.Dummy,
		PREFIX_INVISIBLE = RenderManager.RenderPrefixes.Invisible,
		PREFIX_TEMPORARY = RenderManager.RenderPrefixes.Temporary;

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
	 * represent any static HTML/SVG. The individual strings in the sequence are not wellformed HTML/SVG but usually
	 * only represent a prefix or postfix of a bigger DOM tree.
	 *
	 * During string based rendering, the sequence is rendered into the RenderManager's buffer step by step.
	 * Strings are rendered 1:1 whereas controls are rendered by {@link sap.ui.core.RenderManager#renderControl RenderManager#renderControl}.
	 * The output is wrapped with an additional &lt;div&gt; element which is marked as 'to-be-preserved' by adding
	 * the <code>data-sap-ui-preserve</code> attribute.
	 *
	 * The resulting string is converted to a tree of DOM elements as usual and injected into the desired location.
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
		apiVersion: 1 // HTML fragments still require write (fragments are explicitly not wellformed HTML)
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.mvc.XMLView} oControl an object representation of the control that should be rendered
	 */
	XMLViewRenderer.render = function(rm, oControl) {
		// write the HTML into the render manager
		var vFragment,
		 $oldContent = oControl._$oldContent = RenderManager.findPreservedContent(oControl.getId());

		if ( $oldContent.length === 0) {
			// Log.debug("rendering " + oControl + " anew");
			var bSubView = oControl.isSubView();
			if (!bSubView) {
				rm.openStart("div", oControl);
				rm.class("sapUiView");
				rm.class("sapUiXMLView");
				ViewRenderer.addDisplayClass(rm, oControl);
				if (!oControl.oAsyncState || !oControl.oAsyncState.suppressPreserve) {
					// do not preserve when rendering initially in async mode
					rm.attr("data-sap-ui-preserve", oControl.getId());
				}
				rm.style("width", oControl.getWidth());
				rm.style("height", oControl.getHeight());
				rm.openEnd();
			}
			if (oControl._aParsedContent) {
				for (var i = 0; i < oControl._aParsedContent.length; i++) {
					vFragment = oControl._aParsedContent[i];
					if (vFragment && typeof (vFragment) === "string") {
						// Due to the possibility of mixing (X)HTML and UI5 controls in the XML content,
						// the XMLViewRenderer cannot be migrated fully to API version 2 yet.
						// Here we need to pass the raw strings to the RenderManager as it was written in the *.view.xml.
						rm.write(vFragment);
					} else {
						rm.renderControl(vFragment);
						// when the child control did not render anything (e.g. visible=false), we add a placeholder to know where to render the child later
						if ( !vFragment.bOutput ) {
							rm.openStart("div", PREFIX_DUMMY + vFragment.getId());
							rm.class("sapUiHidden");
							rm.openEnd();
						}
					}
				}
			}
			if (!bSubView) {
				rm.close("div");
			}

		} else {

			// render dummy control for early after rendering notification
			rm.renderControl(oControl.oAfterRenderingNotifier);

			// preserve mode: render a temporary element and all child controls
			rm.openStart("div", PREFIX_TEMPORARY + oControl.getId());
			rm.class("sapUiHidden");
			rm.openEnd();
			for (var k = 0; k < oControl._aParsedContent.length; k++) {
				vFragment = oControl._aParsedContent[k];
				if ( typeof (vFragment) !== "string") {

					// render DOM string for child control
					rm.renderControl(vFragment);

					// replace any old DOM (or invisible placeholder) for a child control with a dummy placeholder
					var sFragmentId = vFragment.getId(),
						$fragment = jQuery(document.getElementById(sFragmentId));
					if ($fragment.length == 0) {
						$fragment = jQuery(document.getElementById(PREFIX_INVISIBLE + sFragmentId));
					}
					if ( !RenderManager.isPreservedContent($fragment[0]) ) {
						$fragment.replaceWith('<div id="' + PREFIX_DUMMY + sFragmentId + '" class="sapUiHidden"></div>');
					}
				}
			}
			rm.close("div");

		}
	};

	return XMLViewRenderer;

}, /* bExport= */ true);