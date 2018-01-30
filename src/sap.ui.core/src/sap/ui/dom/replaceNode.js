/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the OpenUI5 libraries must not introduce dependencies to this module.
 */
sap.ui.define([], function() {
	"use strict";

	/**
	 * This method tries to patch two HTML elements according to changed attributes.
	 *
	 * @param {HTMLElement} oOldDom Existing element to be patched
	 * @param {HTMLElement} oNewDom The new node to patch old dom
	 * @return {boolean} true when patch is applied correctly or false when nodes are replaced.
	 * @author SAP SE
	 * @private
	 */
	function patchDOM(oOldDom, oNewDom) {

		// start checking with most common use case and backwards compatible
		if (oOldDom.childElementCount != oNewDom.childElementCount ||
			oOldDom.tagName != oNewDom.tagName) {
			oOldDom.parentNode.replaceChild(oNewDom, oOldDom);
			return false;
		}

		// go with native... if nodes are equal there is nothing to do
		// http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-isEqualNode
		if (oOldDom.isEqualNode(oNewDom)) {
			return true;
		}

		// remove outdated attributes from old dom
		var aOldAttributes = oOldDom.attributes;
		for (var i = 0, ii = aOldAttributes.length; i < ii; i++) {
			var sAttrName = aOldAttributes[i].name;
			if (oNewDom.getAttribute(sAttrName) === null) {
				oOldDom.removeAttribute(sAttrName);
				ii = ii - 1;
				i = i - 1;
			}
		}

		// patch new or changed attributes to the old dom
		var aNewAttributes = oNewDom.attributes;
		for (var i = 0, ii = aNewAttributes.length; i < ii; i++) {
			var sAttrName = aNewAttributes[i].name,
				vOldAttrValue = oOldDom.getAttribute(sAttrName),
				vNewAttrValue = oNewDom.getAttribute(sAttrName);

			if (vOldAttrValue === null || vOldAttrValue !== vNewAttrValue) {
				oOldDom.setAttribute(sAttrName, vNewAttrValue);
			}
		}

		// check whether more child nodes to continue or not
		var iNewChildNodesCount = oNewDom.childNodes.length;
		if (!iNewChildNodesCount && !oOldDom.hasChildNodes()) {
			return true;
		}

		// maybe no more child elements
		if (!oNewDom.childElementCount) {
			// but child nodes(e.g. Text Nodes) still needs to be replaced
			if (!iNewChildNodesCount) {
				// new dom does not have any child node, so we can clean the old one
				oOldDom.textContent = "";
			} else if (iNewChildNodesCount == 1 && oNewDom.firstChild.nodeType == 3 /* TEXT_NODE */) {
				// update the text content for the first text node
				oOldDom.textContent = oNewDom.textContent;
			} else {
				// in case of comments or other node types are used
				oOldDom.innerHTML = oNewDom.innerHTML;
			}
			return true;
		}

		// patch child nodes
		for (var i = 0, r = 0, ii = iNewChildNodesCount; i < ii; i++) {
			var oOldDomChildNode = oOldDom.childNodes[i],
				oNewDomChildNode = oNewDom.childNodes[i - r];

			if (oNewDomChildNode.nodeType == 1 /* ELEMENT_NODE */) {
				// recursively patch child elements
				if (!patchDOM(oOldDomChildNode, oNewDomChildNode)) {
					// if patch is not possible we replace nodes
					// in this case replaced node is removed
					r = r + 1;
				}
			} else {
				// when not element update only node values
				oOldDomChildNode.nodeValue = oNewDomChildNode.nodeValue;
			}
		}

		return true;
	}

	/**
	 * This method tries to replace two HTML elements according to changed attributes.
	 * As a fallback it replaces DOM nodes.
	 *
	 * @function
	 * @param {HTMLElement} oOldDom Existing element to be patched
	 * @param {HTMLElement|String} vNewDom The new node to patch old dom
	 * @param {boolean} bCleanData Whether jQuery data should be removed or not
	 * @return {boolean} true when patch is applied correctly or false when nodes are replaced.
	 * @author SAP SE
	 * @private
	 * @exports sap/ui/dom/replaceNode
	 */
	var fnReplaceNode = function(oOldDom, vNewDom, bCleanData) {
		var oNewDom;
		if (typeof vNewDom === "string") {
			oNewDom = jQuery.parseHTML(vNewDom)[0];
		} else {
			oNewDom = vNewDom;
		}

		if (bCleanData) {
			jQuery.cleanData([oOldDom]);
			jQuery.cleanData(oOldDom.getElementsByTagName("*"));
		}

		return patchDOM(oOldDom, oNewDom);
	};

	return fnReplaceNode;

});

