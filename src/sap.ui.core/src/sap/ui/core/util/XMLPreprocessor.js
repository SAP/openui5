/*!
 * ${copyright}
 */

// Provides object sap.ui.core.util.XMLPreprocessor
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject'],
	function(jQuery, ManagedObject) {
		'use strict';

		var sNAMESPACE = "sap.ui.core.template",
			// <template:if> control
			If = ManagedObject.extend("sap.ui.core.util._if", {
				metadata: {
					properties: {
						test: "any"
					}
				}
			});

		/**
		 * Returns the index of the next child element in the parent node after the given
		 * index (not a text or comment node).
		 * @param {Node} oParentNode
		 *   The parent DOM node
		 * @param {int} i
		 *   The child node index to start search
		 * @returns {int}
		 *   The index of the next DOM Element or -1 if not found
		 */
		function getNextChildElementIndex(oParentNode, i) {
			var oNodeList = oParentNode.childNodes;

			while (i < oNodeList.length) {
				if (oNodeList.item(i).nodeType === 1 /*ELEMENT_NODE*/) {
					return i;
				}
				i += 1;
			}
			return -1;
		}

		/**
		 * Returns <code>true</code> if the given element has the template namespace and the
		 * given local name.
		 * @param {Element} oElement the DOM element
		 * @param {string} sLocalName the local name
		 * @returns {boolean} if the element has the given name
		 */
		function isTemplateElement(oElement, sLocalName) {
			return oElement.namespaceURI === sNAMESPACE
				&& localName(oElement) === sLocalName;
		}

		/**
		 * Returns the local name of the given DOM node, taking care of IE8.
		 * @param {Node} oNode any DOM node
		 * @returns {string} the local name
		 * @private
		 */
		function localName(oNode) {
			return oNode.localName || oNode.baseName; // IE8
		}

		/**
		 * The XML pre-processor for template instructions in XML views.
		 *
		 * @name sap.ui.core.util.XMLPreprocessor
		 * @private
		 */
		return {
			/**
			 * Performs template pre-processing on the given XML DOM element.
			 *
			 * @param {Element} oContent
			 *   the DOM element to process
			 * @param {object} mSettings
			 * 	 map/JSON-object with initial property values, etc.
			 * @private
			 */
			process: function(oContent, mSettings) {
				var oChild,
					oIfControl,
					oIfElement,
					//TODO getElementsByTagNameNS does not work in IE8
					oIfElementList = oContent.getElementsByTagNameNS(sNAMESPACE, "if"),
					sTest;

				/**
				 * Throws an error that the element represents an unexpected tag.
				 * @param {Element} oElement the DOM element
				 */
				function unexpectedTag(oElement) {
					throw new Error("Unexpected tag " + oElement.namespaceURI + ":"
						+ localName(oElement)
						+ " in sap.ui.core.template:if in view " + mSettings.viewName);
				}

				/**
				 * Get the XML element for given <template:if> element which has to be part of the output.
				 * Throws an error if syntax of <template:if> element is not valid
				 * @param {Element} oIfElement
				 *   <template:if> element
				 * @param {boolean} bThen
				 *   if true return the <template:then> element if available or <template:if> element itself
				 *   if false return the <template:else> element if available or undefined
				 * @returns {Element}
				 *   the DOM element which has to be part of the output
				 * @private
				 */
				function getThenOrElse(oIfElement, bThen) {
					var oChildNodeList = oIfElement.childNodes,
						oElement,
						oThenElement = oIfElement,
						oElseElement,
						iElementIndex = getNextChildElementIndex(oIfElement, 0);

					if (iElementIndex >= 0) {
						oElement = oChildNodeList.item(iElementIndex);
						if (isTemplateElement(oElement, "then")) {
							// <then> found, look for <else> and expect nothing else
							oThenElement = oElement;
							iElementIndex = getNextChildElementIndex(oIfElement, iElementIndex + 1);
							if (iElementIndex > 0) {
								oElseElement = oChildNodeList.item(iElementIndex);
								if (!isTemplateElement(oElseElement, "else")) {
									unexpectedTag(oElseElement);
								}
								iElementIndex = getNextChildElementIndex(oIfElement, iElementIndex + 1);
								if (iElementIndex > 0) {
									unexpectedTag(oChildNodeList.item(iElementIndex));
								}
							}
						} else if (isTemplateElement(oElement, "else")) {
							// TODO remove this test then when visiting all nodes
							unexpectedTag(oElement);
						}
					}
					return bThen ? oThenElement : oElseElement;
				}

				while (oIfElementList.length > 0) {
					oIfElement = oIfElementList.item(0);
					sTest = oIfElement.getAttribute("test");
					oIfControl = new If({
						models: mSettings.models,
						bindingContexts: mSettings.bindingContexts,
						test: sTest
					});

					oChild = getThenOrElse(oIfElement,
						oIfControl.getTest() && oIfControl.getTest() !== "false");

					if (oChild) {
						while (oChild.firstChild) {
							oIfElement.parentNode.insertBefore(oChild.firstChild, oIfElement);
						}
					}
					oIfElement.parentNode.removeChild(oIfElement);
				}
			}
		};
	}, /* bExport= */ true);
