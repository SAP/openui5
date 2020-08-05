/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.commons.MenuButton
sap.ui.define(['./ButtonRenderer', 'sap/ui/core/Renderer'],
	function(ButtonRenderer, Renderer) {
	"use strict";


	/**
	 * MenuButton renderer.
	 * For a common look&feel, the MenuButton extends the Button control,
	 * just like the TextField ComboBox works.
	 * @namespace
	 */
	var MenuButtonRenderer = Renderer.extend(ButtonRenderer);

	/**
	 * Hint: "renderButtonAttributes" is a reserved/hard-coded Button extending function!
	 *       It is used to allow extensions to display content after the actual button content.
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager currently rendering this control
	 * @param {sap.ui.commons.MenuButton}
	 *            oControl the MenuButton that should be rendered
	 * @private
	 */
	MenuButtonRenderer.renderButtonAttributes = function(rm, oControl) {
		//Add specific ARIA information for MenuButton
		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			rm.writeAttribute("aria-haspopup", "true");
		}
	};

	/**
	 * Hint: "renderButtonContentAfter" is a reserved/hard-coded Button extending function!
	 *       It is used to allow extensions to display content after the actual button content.
	 * @param {sap.ui.core.RenderManager}
	 *            rm the RenderManager currently rendering this control
	 * @param {sap.ui.commons.MenuButton}
	 *            oControl the MenuButton that should be rendered
	 * @private
	 */
	MenuButtonRenderer.renderButtonContentAfter = function(rm, oControl) {
		rm.write("<span class=\"sapUiMenuButtonIco\"></span>");
	};

	return MenuButtonRenderer;

}, /* bExport= */ true);
