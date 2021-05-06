/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/core/Renderer", "sap/m/ListItemBaseRenderer"], function(Renderer, ListItemBaseRenderer) {
	"use strict";

	var TAG_INCLUDELIST = {
		"svg": {
			attributes: ["width", "height", "focusable", "preserveAspectRatio"]
		},
		"path": {
			attributes: ["d", "fill", "transform", "stroke", "stroke-width"]
		},
		"line": {
			attributes: ["x1", "x2", "y1", "y2", "stroke-width", "stroke", "stroke-dasharray", "stroke-linecap"]
		}
	};

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
			oTag = TAG_INCLUDELIST[sTagName],
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
	SelectionDetailsListItemRenderer.apiVersion = 2;

	SelectionDetailsListItemRenderer.renderLIAttributes = function(oRm, oControl) {
		oRm.class("sapMSDItem");
	};

	SelectionDetailsListItemRenderer.renderLIContent = function(oRm, oControl) {
		var aLines = oControl._getParentElement().getLines();

		oRm.openStart("div");
		oRm.class("sapMSDItemLines");
		oRm.openEnd();

		for (var i = 0; i < aLines.length; i++) {
			this.renderLine(oRm, oControl, aLines[i]);
		}

		oRm.close("div");

		ListItemBaseRenderer.renderType(oRm, oControl);
	};

	SelectionDetailsListItemRenderer._isValidSvg = function (data) {
		try {
			var oParser = new DOMParser(),
				oDocument = oParser.parseFromString(data, "text/html");
			var aNodes = oDocument.body.childNodes;
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

		oRm.openStart("div");
		oRm.class("sapMSDItemLine");
		oRm.openEnd();

		oRm.openStart("div");
		oRm.class("sapMSDItemLineMarkerContainer");
		oRm.openEnd();
		if (sLineMarker && SelectionDetailsListItemRenderer._isValidSvg(sLineMarker)) {
			oRm.unsafeHtml(sLineMarker);
		}
		oRm.close("div");

		oRm.openStart("div");
		oRm.class("sapMSDItemLineLabel");
		oRm.openEnd();

		oRm.text(line.getLabel());

		oRm.close("div");

		oRm.openStart("div");
		oRm.class("sapMSDItemLineValue");
		if (sUnit) {
			oRm.class("sapMSDItemLineBold");
		}
		oRm.openEnd();

		if (sDisplayValue) {
			oRm.text(sDisplayValue);
		} else {
			oRm.text(sValue);
		}

		if (sUnit) {
			oRm.openStart("span");
			oRm.class("sapMSDItemLineUnit");
			oRm.openEnd();

			oRm.text("\u00a0");
			oRm.text(sUnit);

			oRm.close("span");
		}

		oRm.close("div");

		oRm.close("div");
	};

	SelectionDetailsListItemRenderer.renderType = function(oRm, oControl) {
		var oToolbar = oControl._getParentElement().getAggregation("_overflowToolbar");
		if (oToolbar) {
			oRm.openStart("div");
			oRm.class("sapMSDItemActions");
			oRm.openEnd();
			oRm.renderControl(oToolbar);
			oRm.close("div");
		}
	};

	return SelectionDetailsListItemRenderer;

}, /* bExport= */ true);