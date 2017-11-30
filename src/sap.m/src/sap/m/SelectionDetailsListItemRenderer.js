/*!
 * ${copyright}
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/Renderer",
	"sap/m/ListItemBaseRenderer"
], function(jQuery, Renderer, ListItemBaseRenderer) {
	"use strict";

	var TAG_WHITELIST = {
		"svg": {
			attributes: ["width", "height", "focusable", "preserveAspectRatio"]
		},
		"path": {
			attributes: ["d", "fill", "transform", "stroke", "stroke-width"]
		},
		"line": {
			attributes: ["x1", "x2", "y1", "y2", "stroke-width", "stroke", "stroke-dasharray", "stroke-linecap"]
		}
	},
		bIsDOMParserSupported;

	try {
		var oParser = new DOMParser();
		bIsDOMParserSupported = oParser.parseFromString("<svg />", "text/html") !== null;
	} catch (ex) {
		bIsDOMParserSupported = false;
	}

	var fnParseSvgString;

	// Most browsers support DOMParser for text/html. Sadly our voter job uses phantomjs. This is a fix for phantomjs.
	if (bIsDOMParserSupported) {
		fnParseSvgString = function (sString) {
			var oParser = new DOMParser(),
				oDocument = oParser.parseFromString(sString, "text/html");
			return oDocument.body.childNodes;
		};
	} else {
		fnParseSvgString = function (sString) {
			var oDocument = document.implementation.createHTMLDocument("");
			oDocument.body.innerHTML = sString;
			return oDocument.body.childNodes;
		};
	}

	function every(aDomArray, fnCallback) {
		var i;
		if (!aDomArray) {
			return true;
		}
		for (i = 0; i < aDomArray.length; i++) {
			if (!fnCallback(aDomArray[i])) {
				return false;
			}
		}
		return true;
	}

	function isValidSvgNode(oNode) {
		if (oNode.nodeType !== window.Node.ELEMENT_NODE) {
			return true;
		}
		var sTagName = oNode.tagName.toLowerCase(),
			oTag = TAG_WHITELIST[sTagName],
			bTagsValid;
		if (!oTag) {
			return false;
		}
		bTagsValid = every(oNode.attributes, function (attribute) {
			if (attribute.value === "") {
				return true;
			}
			var sAttributeName = attribute.name.toLowerCase();
			return oTag.attributes.indexOf(sAttributeName) >= 0;
		});
		if (!bTagsValid) {
			return false;
		}
		if (!oTag.allowTextContenet && oNode.textContent.trim().length > 0) {
			return false;
		}
		return every(oNode.childNodes, isValidSvgNode);
	}

	/**
	 * SelectionDetailsItemRenderer renderer.
	 * @namespace
	 */
	var SelectionDetailsListItemRenderer = Renderer.extend(ListItemBaseRenderer);

	SelectionDetailsListItemRenderer.renderLIAttributes = function(oRm, oControl) {
		oRm.addClass("sapMSDItem");
		oRm.writeClasses();
	};

	SelectionDetailsListItemRenderer.renderLIContent = function(oRm, oControl) {
		var aLines = oControl._getParentElement().getLines();

		oRm.write("<div");
		oRm.addClass("sapMSDItemLines");
		oRm.writeClasses();
		oRm.write(">");

		for (var i = 0; i < aLines.length; i++) {
			this.renderLine(oRm, oControl, aLines[i]);
		}

		oRm.write("</div>");

		ListItemBaseRenderer.renderType(oRm, oControl);
	};

	SelectionDetailsListItemRenderer._isValidSvg = function (data) {
		try {
			var aNodes = fnParseSvgString(data);
			if (aNodes.length === 0) {
				return false;
			}
			return every(aNodes, isValidSvgNode);
		} catch (ex) {
			return false;
		}
	};

	SelectionDetailsListItemRenderer.renderLine = function(oRm, oControl, line) {
		var sUnit = line.getUnit().trim(),
			sValue = line._getValueToRender(),
			sDisplayValue = line.getDisplayValue(),
			sLineMarker = line.getLineMarker();

		oRm.write("<div");
		oRm.addClass("sapMSDItemLine");
		oRm.writeClasses();
		oRm.write(">");

		oRm.write("<div");
		oRm.addClass("sapMSDItemLineMarkerContainer");
		oRm.writeClasses();
		oRm.write(">");
		if (sLineMarker && SelectionDetailsListItemRenderer._isValidSvg(sLineMarker)) {
			oRm.write(sLineMarker);
		}
		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapMSDItemLineLabel");
		oRm.writeClasses();
		oRm.write(">");

		oRm.writeEscaped(line.getLabel());

		oRm.write("</div>");

		oRm.write("<div");
		oRm.addClass("sapMSDItemLineValue");
		if (sUnit) {
			oRm.addClass("sapMSDItemLineBold");
		}
		oRm.writeClasses();
		oRm.write(">");

		if (sDisplayValue) {
			oRm.writeEscaped(sDisplayValue);
		} else {
			oRm.writeEscaped(sValue);
		}

		if (sUnit) {
			oRm.write("<span");
			oRm.addClass("sapMSDItemLineUnit");
			oRm.writeClasses();
			oRm.write(">");

			oRm.write("&nbsp;");
			oRm.writeEscaped(sUnit);

			oRm.write("</span>");
		}

		oRm.write("</div>");

		oRm.write("</div>");
	};

	SelectionDetailsListItemRenderer.renderType = function(oRm, oControl) {
		var oToolbar = oControl._getParentElement().getAggregation("_overflowToolbar");
		if (oToolbar) {
			oRm.write("<div");
			oRm.addClass("sapMSDItemActions");
			oRm.writeClasses();
			oRm.write(">");
			oRm.renderControl(oToolbar);
			oRm.write("</div>");
		}
	};

	return SelectionDetailsListItemRenderer;

}, /* bExport= */ true);
