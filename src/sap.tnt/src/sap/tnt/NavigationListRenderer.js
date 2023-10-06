/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.tnt.NavigationList
sap.ui.define([
	"sap/ui/core/Core"
], function (Core) {
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

	var oRB = Core.getLibraryResourceBundle("sap.tnt");

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the renderer output buffer
	 * @param {sap.tnt.NavigationList} control An object representation of the control that should be rendered
	 */
	NavigationListRenderer.render = function (rm, control) {
		var role,
			groups = control.getItems(),
			expanded = control.getExpanded(),
			visibleGroups = [],
			hasGroupWithIcon = false,
			overflowItem = control._getOverflowItem();

		//Checking which groups should render
		groups.forEach(function (group) {
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
		role = !expanded && !control.hasStyleClass("sapTntNavLIPopup") ? 'menubar' : 'tree';

		rm.attr("role", role);

		if (role === 'menubar') {
			rm.attr("aria-orientation", "vertical");
			rm.attr("aria-roledescription", oRB.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUBAR"));
		} else {
			rm.attr("aria-roledescription", oRB.getText("NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE"));
		}
		rm.openEnd();

		// Rendering visible groups
		visibleGroups.forEach(function (group) {
			group.render(rm, control);
		});

		if (!expanded) {
			overflowItem.render(rm, control);
		}

		rm.close("ul");
	};

	return NavigationListRenderer;

}, /* bExport= */ true);