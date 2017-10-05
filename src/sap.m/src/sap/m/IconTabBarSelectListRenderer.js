/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Image
sap.ui.define([],
	function() {
	'use strict';

	/**
	 * IconTabBarSelectList renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var IconTabBarSelectListRenderer = {
	};


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} control an object representation of the control that should be rendered
	 */
	IconTabBarSelectListRenderer.render = function(rm, control) {
		var i,
			item,
			items = control.getVisibleItems(),
			itemsCount = items.length,
			iconTabHeader = control._iconTabHeader,
			isTextOnly = true;

		if (iconTabHeader) {
			iconTabHeader._checkTextOnly(items);
			isTextOnly = iconTabHeader._bTextOnly;
			control._bIconOnly = control.checkIconOnly(items);
		}

		rm.write('<ul');
		rm.writeAttribute('role', 'listbox');
		rm.writeControlData(control);
		rm.addClass('sapMITBSelectList');

		if (isTextOnly) {
			rm.addClass('sapMITBSelectListTextOnly');
		}

		rm.writeClasses();

		rm.write('>');

		for (i = 0; i < itemsCount; i++) {
			item = items[i];
			item.renderInSelectList(rm, control, i, itemsCount);
		}

		rm.write('</ul>');
	};

	return IconTabBarSelectListRenderer;

}, /* bExport= */ true);
