/*!
 * ${copyright}
 */

// A renderer for the DOM element control
sap.ui.define(["sap/base/Log", "sap/base/security/encodeXML"],
	function(Log, encodeXML) {
	"use strict";


	/**
	 * DOM element renderer.
	 * @namespace
	 * @alias sap.ui.core.tmpl.DOMElementRenderer
	 */
	var DOMElementRenderer = {
		apiVersion: 2
	};

	/**
	 * Pattern that matches the names of all HTML void tags.
	 * @private
	 */
	var rVoidTags = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;

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
	 * @deprecated since 1.56
	 */
	DOMElementRenderer.render = function(oRM, oElement) {

		// opening tag incl. control data
		var sEncodedTagName = encodeXML(oElement.getTag()),
			bIsVoid = rVoidTags.test(sEncodedTagName);

		if ( bIsVoid ) {
			oRM.voidStart(sEncodedTagName, oElement);
		} else {
			oRM.openStart(sEncodedTagName, oElement);
		}

		// add the attributes of the DOM element
		oElement.getAttributes().forEach(function(oAttribute) {
			var sName = oAttribute.getName().toLowerCase();
			if (sName === "class") {
				// the class attribute will be split and added separately
				var aClasses = oAttribute.getValue().split(" ");
				aClasses.forEach(function(sClass) {
					var sClass = sClass.trim();
					if (sClass) {
						oRM.class(sClass);
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
						oRM.style(encodeXML(sKey), sValue);
					}
				});
			} else if (oAttribute.getName()) {
				oRM.attr(encodeXML(oAttribute.getName()), oAttribute.getValue());
			} else {
				Log.error("Attributes must have a non-empty name");
			}
		});
		if ( bIsVoid ) {
			oRM.voidEnd();
		} else {
			oRM.openEnd();
		}

		// create the nested structure (if required)
		var aElements = oElement.getElements(),
			bHasChildren = !!oElement.getText() || aElements.length > 0;

		if (bHasChildren) {
			if ( bIsVoid ) {
				Log.error("Void element '" + sEncodedTagName + "' is rendered with children");
			}

			// append the text (do escaping)
			if (oElement.getText()) {
				oRM.text(oElement.getText());
			}

			// append the nested DOM elements
			aElements.forEach(function(iIndex, oChildElement) {
				oRM.renderControl(oChildElement);
			});
		}

		if ( !bIsVoid ) {
			// closing tag
			oRM.close(sEncodedTagName);
		}
	};

	return DOMElementRenderer;

}, /* bExport= */ true);