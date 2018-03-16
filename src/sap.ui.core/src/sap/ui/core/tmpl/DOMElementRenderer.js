/*!
 * ${copyright}
 */

// A renderer for the DOM element control
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * DOM element renderer.
	 * @namespace
	 * @alias sap.ui.core.tmpl.DOMElementRenderer
	 */
	var DOMElementRenderer = {};

	/**
	 * Renders the DOM element for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRM RenderManager that can be used for writing to the
	 *            Render-Output-Buffer
	 * @param {sap.ui.core.Control}
	 *            oElement Object representation of the DOM element that should be
	 *            rendered
	 */
	DOMElementRenderer.render = function(oRM, oElement) {

		// opening tag incl. control data
		oRM.write("<");
		oRM.writeEscaped(oElement.getTag());
		oRM.writeControlData(oElement);

		// add the attributes of the DOM element
		oElement.getAttributes().forEach(function(oAttribute) {
			var sName = oAttribute.getName().toLowerCase();
			if (sName === "class") {
				// the class attribute will be split and added separately
				var aClasses = oAttribute.getValue().split(" ");
				aClasses.forEach(function(sClass) {
					var sClass = sClass.trim();
					if (sClass) {
						oRM.addClass(jQuery.sap.encodeHTML(sClass));
					}
				});
			} else if (sName === "style") {
				// the style attribute will be split and added separately
				var aStyles = oAttribute.getValue().split(";");
				aStyles.forEach(function(sStyle) {
					var iIndex = sStyle.indexOf(":");
					if (iIndex != -1) {
						var sKey = sStyle.substring(0, iIndex).trim();
						var sValue = sStyle.substring(iIndex + 1).trim();
						oRM.addStyle(jQuery.sap.encodeHTML(sKey), jQuery.sap.encodeHTML(sValue));
					}
				});
			} else {
				oRM.writeAttributeEscaped(jQuery.sap.encodeHTML(oAttribute.getName()), oAttribute.getValue());
			}
		});

		// support for custom classes and styles
		oRM.writeClasses();
		oRM.writeStyles();

		// create the nested structure (if required)
		var aElements = oElement.getElements(),
			bHasChildren = !!oElement.getText() || aElements.length > 0;

		if (!bHasChildren) {
			oRM.write("/>");
		} else {
			oRM.write(">");

			// append the text (do escaping)
			if (oElement.getText()) {
				oRM.writeEscaped(oElement.getText());
			}

			// append the nested DOM elements
			aElements.forEach(function(iIndex, oChildElement) {
				oRM.renderControl(oChildElement);
			});

			// closing tag
			oRM.write("</");
			oRM.writeEscaped(oElement.getTag());
			oRM.write(">");
		}
	};

	return DOMElementRenderer;

}, /* bExport= */ true);
