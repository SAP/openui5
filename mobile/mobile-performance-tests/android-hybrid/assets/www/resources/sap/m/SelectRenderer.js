/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

jQuery.sap.declare("sap.m.SelectRenderer");

/**
 * @class Select renderer.
 * @static
 */
sap.m.SelectRenderer = {};

/**
 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
 * @param {sap.ui.core.Control} oSlt an object representation of the select that should be rendered
 */
sap.m.SelectRenderer.render = function(oRm, oSlt) {
	var	sName = oSlt.getName(),
		sTitle = oSlt.getTitle(),
		aItems = oSlt.getItems(),
		sSelectedItemId = oSlt.getAssociation("selectedItem"),
		oSelectedItem = oSlt.getSelectedItem(),
		aItemsLength = aItems.length,
		i;

	// suppress rendering if not visible
	if (!oSlt.getVisible()) {
		return;
	}

	oRm.write("<div");
	oRm.addClass("sapMSlt");

	if (!oSlt.getEnabled()) {
		oRm.addClass("sapMSltDisabled");
	}

	oRm.addStyle("width", oSlt.getWidth());
	oRm.addStyle("max-width", oSlt.getMaxWidth());

	oRm.writeControlData(oSlt);

	oRm.writeStyles();
	oRm.writeClasses();

	oRm.write(">");
		oRm.write('<span class="sapMSltText">');
		oRm.writeEscaped(oSelectedItem.getText());
		oRm.write('</span>');

		oRm.write('<span class="sapMSltIcon"></span>');

		oRm.write("<select");

		if (sName !== "") {
			oRm.writeAttributeEscaped("name", sName);
		}

		if (sTitle !== "") {
			oRm.writeAttributeEscaped("title", sTitle);
		}

		if (!oSlt.getEnabled()) {
			oRm.write(" disabled");
		}

		oRm.write(">");

			// rendering select items
			for (i = 0; i < aItemsLength; i++) {
				oRm.write("<option");
					oRm.writeAttribute("id", aItems[i].getId());
					oRm.writeAttributeEscaped("value", aItems[i].getKey());

					if (aItems[i].getId() === sSelectedItemId) {
						oRm.write(" selected");
					}

					if (!aItems[i].getEnabled()) {
						oRm.write(" disabled");
					}

					oRm.write(">");
					oRm.writeEscaped(aItems[i].getText());
				oRm.write("</option>");
			}

		oRm.write("</select>");

	oRm.write("</div>");
};