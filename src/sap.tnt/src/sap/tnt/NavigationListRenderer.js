/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.tnt.NavigationList
sap.ui.define([],
	function() {
		"use strict";

		/**
		 * NavigationListRenderer renderer.
		 *
		 * @author SAP SE
		 * @namespace
		 */
		var NavigationListRenderer = {
			apiVersion: 2
		};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the renderer output buffer
		 * @param {sap.ui.core.Control} control An object representation of the control that should be rendered
		 */
		NavigationListRenderer.render = function (rm, control) {
			var role,
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

			rm.openStart("ul", control);

			var width = control.getWidth();
			if (width && expanded) {
				rm.style("width", width);
			}

			rm.class("sapTntNavLI");

			if (!expanded) {
				rm.class("sapTntNavLICollapsed");
			}

			if (!hasGroupWithIcon) {
				rm.class("sapTntNavLINoIcons");
			}

			// ARIA
			role = !expanded || control.hasStyleClass("sapTntNavLIPopup") ? 'menubar' : 'tree';

			rm.attr("role", role);
			rm.openEnd();

			// Rendering visible groups
			visibleGroups.forEach(function(group) {
				group.render(rm, control);
			});


			rm.close("ul");
		};

		return NavigationListRenderer;

	}, /* bExport= */ true);