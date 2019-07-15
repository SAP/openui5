/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.tnt.NavigationList
sap.ui.define(['sap/ui/core/Renderer'],
	function(Renderer) {
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
			var role,
				visibleGroupsCount,
				groups = control.getItems(),
				expanded = control.getExpanded(),
				visibleGroups = [],
				hasGroupWithIcon = false;

			//Checking which groups should render
			groups.forEach(function(group) {
				if (group.getVisible()) {
					visibleGroups.push(group);

					if (group.getIcon()) {
						hasGroupWithIcon = true;
					}
				}
			});

			rm.write("<ul");
			rm.writeControlData(control);

			var width = control.getWidth();
			if (width && expanded) {
				rm.addStyle("width", width);
			}
			rm.writeStyles();

			rm.addClass("sapTntNavLI");

			if (!expanded) {
				rm.addClass("sapTntNavLICollapsed");
			}

			if (!hasGroupWithIcon) {
				rm.addClass("sapTntNavLINoIcons");
			}

			rm.writeClasses();

			// ARIA
			role = !expanded || control.hasStyleClass("sapTntNavLIPopup") ? 'menubar' : 'tree';

			rm.writeAttribute("role", role);

			rm.write(">");

			// Rendering the visible groups
			visibleGroups.forEach(function(group, index) {
				group.render(rm, control, index, visibleGroupsCount);
			});

			rm.write("</ul>");
		};

		return NavigationListRenderer;

	}, /* bExport= */ true);