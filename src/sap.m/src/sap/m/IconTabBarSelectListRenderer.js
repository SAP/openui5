/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.Image
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', 'sap/ui/core/IconPool', 'sap/ui/core/InvisibleText'],
	function(jQuery, Renderer, IconPool, InvisibleText) {
	"use strict";

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
			items = control.getItems(),
			iconTabHeader = control._iconTabHeader,
			isTextOnly = true,
			isIconOnly,
			isRtl = sap.ui.getCore().getConfiguration().getRTL(),
			length = items.length;

		if (iconTabHeader) {
			isTextOnly = iconTabHeader._bTextOnly;
			isIconOnly = this.checkIconOnly(items);
		}

		var options = {
			isTextOnly:isTextOnly,
			isIconOnly: isIconOnly,
			isRtl: isRtl,
			length: length,
			resourceBundle: sap.ui.getCore().getLibraryResourceBundle('sap.m')
		};

		rm.write("<ul");

		rm.writeAttribute('role', 'listbox');

		rm.writeControlData(control);

		rm.addClass("sapMITBSelectList");

		if (isTextOnly) {
			rm.addClass("sapMITBSelectListTextOnly");
		}

		rm.writeClasses();

		rm.write(">");

		for (i = 0; i < items.length; i++) {
			item = items[i];
			options.index = i;

			this.renderItem(rm, control, item, options);
		}

		rm.write("</ul>");
	};

	IconTabBarSelectListRenderer.checkIconOnly = function (items) {

		var item;

		for (var i = 0; i < items.length; i++) {

			item = items[i];

			if (item.getText() || item.getCount()) {
				return false;
			}
		}

		return true;
	};

	IconTabBarSelectListRenderer.renderItem = function(rm, control, item, options) {

		if (!item.getVisible()) {
			return;
		}

		rm.write('<li');
		rm.writeElementData(item);

		rm.writeAttribute('tabindex', '-1');
		rm.writeAttribute('role', 'option');
		rm.writeAttribute('aria-posinset', options.index + 1);
		rm.writeAttribute('aria-setsize', options.length);

		var tooltip = item.getTooltip_AsString();
		if (tooltip) {
			rm.writeAttributeEscaped("title", tooltip);
		}

		if (!item.getEnabled()) {
			rm.addClass("sapMITBDisabled");
			rm.writeAttribute("aria-disabled", true);
		}

		rm.addClass("sapMITBSelectItem");

		if (control.getSelectedItem() == item) {
			rm.addClass("sapMITBSelectItemSelected");
			rm.writeAttribute('aria-selected', true);
		}

		var iconColor = item.getIconColor();
		rm.addClass("sapMITBFilter" + iconColor);

		rm.writeClasses();

		var itemId = item.getId(),
			invisibleText,
			isIconColorRead = iconColor == 'Positive' || iconColor == 'Critical' || iconColor == 'Negative';

		var labelledBy = ' aria-labelledby="';

		if (!options.isIconOnly) {
			labelledBy += itemId + '-text ';
		}

		if (!options.isTextOnly && item.getIcon()) {
			labelledBy += itemId + '-icon ';
		}

		if (isIconColorRead) {

			invisibleText = new InvisibleText({
				text: options.resourceBundle.getText('ICONTABBAR_ICONCOLOR_' + iconColor.toUpperCase())
			});

			labelledBy += invisibleText.getId();
		}

		labelledBy += '"';

		rm.write(labelledBy + '>');

		if (invisibleText) {
			rm.renderControl(invisibleText);
		}

		if (!options.isTextOnly) {
			this._renderIcon(rm, item);
		}

		if (!options.isIconOnly) {
			this._renderText(rm, item, options.isRtl);
		}

		rm.write("</li>");
	};

	/**
	 * Renders an icon.
	 * @private
	 */
	IconTabBarSelectListRenderer._renderIcon =  function(rm, item) {

		var icon = item.getIcon();

		if (icon) {
			var iconInfo = IconPool.getIconInfo(icon);
			var classes = ["sapMITBSelectItemIcon"];

			if (iconInfo && !iconInfo.suppressMirroring) {
				classes.push("sapUiIconMirrorInRTL");
			}

			rm.writeIcon(icon, classes, {
				id: item.getId() + '-icon',
				"aria-hidden": true
			});
		} else {
			rm.write('<span class="sapUiIcon"></span>');
		}
	};

	/**
	 * Renders a text.
	 * @private
	 */
	IconTabBarSelectListRenderer._renderText =  function(rm, item, isRtl) {
		rm.write('<span');

		rm.writeAttribute("id", item.getId() + '-text');
		rm.writeAttribute("dir", "ltr");

		rm.addClass("sapMText");
		rm.addClass("sapMTextNoWrap");
		rm.addClass("sapMITBText");

		rm.writeClasses();

		var textDir = item.getTextDirection();
		if (textDir !== sap.ui.core.TextDirection.Inherit){
			rm.writeAttribute("dir", textDir.toLowerCase());
		}

		var textAlign = Renderer.getTextAlign(sap.ui.core.TextAlign.Begin, textDir);
		if (textAlign) {
			rm.addStyle("text-align", textAlign);
			rm.writeStyles();
		}

		var text = item.getText();
		var count = item.getCount();
		if (count) {
			if (isRtl) {
				text = '(' + count + ') ' + text;
			} else {
				text += ' (' + count + ')';
			}
		}

		rm.write(">");
		rm.writeEscaped(text);
		rm.write("</span>");
	};

	return IconTabBarSelectListRenderer;

}, /* bExport= */ true);
