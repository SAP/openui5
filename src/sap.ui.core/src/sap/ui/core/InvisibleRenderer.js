/*!
 * ${copyright}
 */

sap.ui.define([], function() {

	"use strict";

	/**
	 * Provides the default renderer for the controls that have set their <code>visible</code> property to <code>false</code>.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias module:sap/ui/core/InvisibleRenderer
	 * @since 1.66.0
	 * @protected
	 * @namespace
	 */
	var InvisibleRenderer = {
		apiVersion: 2
	};

	/**
	 * The prefix of the invisible placeholder.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core.RenderManager
	 */
	InvisibleRenderer.PlaceholderPrefix = "sap-ui-invisible-";

	/**
	 * Creates the ID to be used for the invisible placeholder DOM element.
	 * This method can be used to get direct access to the placeholder DOM element.
	 *
	 * @param {sap.ui.core.Element} oElement The <code>element</code> instance for which to create the placeholder ID
	 * @returns {string} The ID used for the invisible placeholder of this element
	 * @static
	 * @protected
	 */
	InvisibleRenderer.createInvisiblePlaceholderId = function(oElement) {
		return this.PlaceholderPrefix + oElement.getId();
	};

	/**
	 * Renders an invisible placeholder to identify the location of the invisible control within the DOM tree.
	 *
	 * The standard implementation renders an invisible &lt;span&gt; element for controls with <code>visible:false</code> to improve
	 * re-rendering performance. Due to the fault tolerance of the HTML5 standard, such &lt;span&gt; elements are accepted in many
	 * scenarios and won't appear in the render tree of the browser. However, in some cases, controls might need to write a different
	 * element if &lt;span&gt; is not an allowed element (for example, within the &lt;tr&gt; or &lt;li&gt; group). In this case,
	 * the caller can require this module and use the third parameter to define the HTML tag.
	 *
	 * @param {sap.ui.core.RenderManager} [oRm] The <code>RenderManager</code> instance
	 * @param {sap.ui.core.Element} [oElement] The instance of the invisible element
	 * @param {string} [sTagName="span"] HTML tag of the invisible placeholder; void tags are not allowed.
	 * @static
	 * @protected
	 */
	InvisibleRenderer.render = function(oRm, oElement, sTagName) {
		var sPlaceholderId = this.createInvisiblePlaceholderId(oElement);
		sTagName = sTagName || "span";

		oRm.openStart(sTagName, sPlaceholderId);
		oRm.attr("data-sap-ui", sPlaceholderId);
		oRm.attr("aria-hidden", "true");
		oRm.class("sapUiHiddenPlaceholder");
		oRm.openEnd(true /* bExludeStyleClasses */);
		oRm.close(sTagName);
	};

	return InvisibleRenderer;

});
