/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.tnt.NavigationList
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer'],
	function(jQuery, Renderer) {
		"use strict";

		/**
		 * NavigationListRenderer renderer.
		 *
		 * @author SAP SE
		 * @namespace
		 */
		var NavigationListRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the renderer output buffer
		 * @param {sap.ui.core.Control} control An object representation of the control that should be rendered
		 */
		NavigationListRenderer.render = function (rm, control) {
			var group,
				role,
				groups = control.getItems(),
				expanded = control.getExpanded();

			rm.write("<ul");
			rm.writeControlData(control);

			var width = control.getWidth();
			if (width) {
				rm.addStyle("width", width);
			}
			rm.writeStyles();

			rm.addClass("sapMNavLI");

			if (!expanded) {
				rm.addClass("sapMNavLICollapsed");
			}

			rm.writeClasses();

			// ARIA
			if (control.getHasListBoxRole()) {
				role = 'listbox';
			} else {
				role = expanded ? 'tree' : 'toolbar';
			}

			rm.writeAttribute("role", role);

			rm.write(">");

			for (var i = 0; i < groups.length; i++) {
				group = groups[i];
				group.render(rm, control);
			}

			rm.write("</ul>");
		};

		return NavigationListRenderer;

	}, /* bExport= */ true);
