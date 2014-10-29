/*!
 * ${copyright}
 */

// Provides object sap.ui.core.util.XMLPreprocessor
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject'],
	function(jQuery, ManagedObject) {
		'use strict';

		var sNAMESPACE = "sap.ui.core.template",
			/**
			 * <template:with> control holding the models and the bindings. Also used as substitute
			 * for any control during template processing in order to resolve property bindings.
			 * Supports nesting of template instructions.
			 *
			 * @private
			 */
			With = ManagedObject.extend("sap.ui.core.util._with", {
				metadata: {
					properties: {
						any: "any"
					},
					aggregations: {
						child: {multiple: false, type: "sap.ui.core.util._with"}
					}
				}
			}),
			/**
			 * <template:repeat> control extending the "with" control by an aggregation which is
			 * used to get the list binding.
			 *
			 * @private
			 */
			Repeat = With.extend("sap.ui.core.util._repeat", {
				metadata: {
					aggregations: {
						list: {multiple: true, type: "n/a", _doesNotRequireFactory: true}
					}
				},

				updateList: function () {
					// Override sap.ui.base.ManagedObject#updateAggregation for "list" and do
					// nothing to avoid that any child objects are created
				}
			});

		/**
		 * Gets the value of the control's "any" property via the given binding info.
		 * @param {sap.ui.core.util._with} oWithControl the "with" control
		 * @param {object} oBindingInfo the binding info
		 * @returns {any} the property value
		 * @throws Error
		 */
		function getAny(oWithControl, oBindingInfo) {
			var vValue;

			oBindingInfo.mode = sap.ui.model.BindingMode.OneTime;
			oWithControl.bindProperty("any", oBindingInfo);
			vValue = oWithControl.getAny();
			oWithControl.unbindProperty("any", true);
			return vValue;
		}

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
		 * Creates a binding info object with the given path.
		 * See BindingParser.js
		 * @param {string} sPath the path
		 * @returns {object} with model and path property
		 */
		function makeSimpleBindingInfo(sPath) {
			//TODO how to improve on this hack? makeSimpleBindingInfo() is not visible
			return sap.ui.base.BindingParser.simpleParser("{" + sPath + "}");
		}

		/**
		 * Visit the given DOM attribute which represents any attribute of any control (other than
		 * template instructions). If the attribute value represents a binding expression, we try
		 * to resolve it using the "with" control instance.
		 *
		 * @param {Attribute} oAttribute
		 *   any attribute of any control (a DOM Attribute)
		 * @param {sap.ui.core.util._with} oWithControl the "with" control
		 * @private
		 */
		function resolveAttributeBinding(oAttribute, oWithControl) {
			var oBindingInfo = sap.ui.base.BindingParser.complexParser(oAttribute.value);

			if (oBindingInfo) {
				try {
					oAttribute.value = getAny(oWithControl, oBindingInfo);
				} catch (ex) {
					// just don't replace XML attribute value
				}
			}
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
			 * @param {Element} oRootElement
			 *   the DOM element to process
			 * @param {object} mSettings
			 * 	 map/JSON-object with initial property values, etc.
			 * @param {object} mSettings.bindingContexts
			 * @param {object} mSettings.models
			 * @param {string} [mSettings.viewName]
			 * @private
			 */
			process: function(oRootElement, mSettings) {
				/**
				 * Get the XML element for given <template:if> element which has to be part of the
				 * output.
				 * @param {Element} oIfElement
				 *   <template:if> element
				 * @param {boolean} bCondition
				 *   the evaluated condition of the <template:if>
				 * @returns {Element}
				 *   the DOM element which has to be part of the output
				 * @throws Error if the syntax of <template:if> element is not valid.
				 * @private
				 */
				function getThenOrElse(oIfElement, bCondition) {
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
							iElementIndex
								= getNextChildElementIndex(oIfElement, iElementIndex + 1);
							if (iElementIndex > 0) {
								oElseElement = oChildNodeList.item(iElementIndex);
								if (!isTemplateElement(oElseElement, "else")) {
									unexpectedTag(oElseElement);
								}
								iElementIndex
									= getNextChildElementIndex(oIfElement, iElementIndex + 1);
								if (iElementIndex > 0) {
									unexpectedTag(oChildNodeList.item(iElementIndex));
								}
							}
						} else if (isTemplateElement(oElement, "else")) {
							// TODO remove this test then when visiting all nodes
							unexpectedTag(oElement);
						}
					}
					return bCondition ? oThenElement : oElseElement;
				}

				/**
				 * Visits the child nodes of the given node. Lifts them up by inserting them before
				 * the target node.
				 * @param {Node} oNode the DOM node
				 * @param {sap.ui.core.util._with} oWithControl the "with" control
				 * @param {Node} [oTargetNode=oNode] the target DOM node
				 */
				function liftChildNodes(oNode, oWithControl, oTargetNode) {
					oTargetNode = oTargetNode || oNode;
					visitChildNodes(oNode, oWithControl);
					while (oNode.firstChild) {
						oTargetNode.parentNode.insertBefore(oNode.firstChild, oTargetNode);
					}
				}

				/**
				 * Processes a <template:if> node.
				 * @param {Node} oNode
				 *   the <template:if> node
				 * @param {sap.ui.core.util._with} oWithControl the "with" control
				 */
				function templateIf(oNode, oWithControl) {
					var vTest = oNode.getAttribute("test"),
						oBindingInfo = sap.ui.base.BindingParser.complexParser(vTest),
						oChild;

					if (oBindingInfo) {
						try {
							vTest = getAny(oWithControl, oBindingInfo);
						} catch (ex) {
							jQuery.sap.log.warning(
								'Error in formatter of sap.ui.core.template:if test="' + vTest
									+ '" in view ' + mSettings.viewName,
								ex, "sap.ui.core.mvc.XMLView");
							vTest = false;
						}
					}
					oChild = getThenOrElse(oNode, vTest && vTest !== "false");
					if (oChild) {
						liftChildNodes(oChild, oWithControl, oNode);
					}
					oNode.parentNode.removeChild(oNode);
				}

				/**
				 * Processes a <template:repeat> node.
				 * @param {Node} oNode
				 *   the <template:repeat> node
				 * @param {sap.ui.core.template._with} oWithControl
				 *   the parent's "with" control
				 */
				function templateRepeat(oNode, oWithControl) {
					var sList = oNode.getAttribute("list") || "",
						oBindingInfo = sap.ui.base.BindingParser.complexParser(sList),
						aContexts,
						oListBinding,
						sModelName,
						oNewWithControl,
						sVar = oNode.getAttribute("var");

					if (!oBindingInfo) {
						throw new Error('Missing binding for sap.ui.core.template:repeat list="'
							+ sList + '" in view ' + mSettings.viewName);
					}

					// set up a scope for the loop variable, so to say
					oNewWithControl = new Repeat();
					oWithControl.setChild(oNewWithControl);

					// use a list binding to get an array of contexts
					oBindingInfo.mode = sap.ui.model.BindingMode.OneTime;
					oNewWithControl.bindAggregation("list", oBindingInfo);
					oListBinding = oNewWithControl.getBinding("list");
					oNewWithControl.unbindAggregation("list", true);
					sModelName = oBindingInfo.model; // added by bindAggregation
					if (!oListBinding) {
						throw new Error('Missing model "' + sModelName
							+ '" in sap.ui.core.template:repeat in view ' + mSettings.viewName);
					}
					aContexts = oListBinding.getContexts();

					// set up the model for the loop variable
					sVar = sVar || sModelName; // default loop variable is to keep the same model
					oNewWithControl.setModel(oListBinding.getModel(), sVar);

					// the actual loop
					jQuery.each(aContexts, function (i, oContext) {
						var oSourceNode = (i === aContexts.length - 1) ?
							oNode : oNode.cloneNode(true);
						// Note: because sVar and sModelName refer to the same model instance, it
						// is OK to use sModelName's context for sVar as well (the name is not part
						// of the context!)
						oNewWithControl.setBindingContext(oContext, sVar);
						liftChildNodes(oSourceNode, oNewWithControl, oNode);
					});

					oNode.parentNode.removeChild(oNode);
				}

				/**
				 * Processes a <template:with> node.
				 * @param {Node} oNode
				 *   the <template:with> node
				 * @param {sap.ui.core.util._with} oWithControl
				 *   the parent's "with" control
				 */
				function templateWith(oNode, oWithControl) {
					var oBindingInfo,
						oModel,
						oNewWithControl,
						sPath = oNode.getAttribute("path"),
						sResolvedPath,
						sVar = oNode.getAttribute("var");

					oNewWithControl = new With();
					oWithControl.setChild(oNewWithControl);

					//TODO/FIX4MASTER Simplify code once named contexts are supported by the core
					if (sVar) { // create a "named context"
						oBindingInfo = makeSimpleBindingInfo(sPath);
						oModel = oWithControl.getModel(oBindingInfo.model);
						if (!oModel) {
							throw new Error("Missing model '" + oBindingInfo.model
								+ "' in sap.ui.core.template:with in view " + mSettings.viewName);
						}
						//TODO any trick to avoid explicit resolution of relative paths here?
						sResolvedPath = oModel.resolve(oBindingInfo.path,
							oWithControl.getBindingContext(oBindingInfo.model));
						if (!sResolvedPath) {
							throw new Error(
								'Cannot resolve path for sap.ui.core.template:with var="'
								+ sVar + '" in view ' + mSettings.viewName
							);
						}
						oNewWithControl.setModel(oModel, sVar);
						oNewWithControl.bindObject({
							model: sVar,
							path: sResolvedPath
						});
					} else {
						oNewWithControl.bindObject(sPath);
					}

					liftChildNodes(oNode, oNewWithControl);
					oNode.parentNode.removeChild(oNode);
				}

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
				 * Visits the attributes of the given node.
				 * @param {Node} oNode the DOM Node
				 * @param {sap.ui.core.template._with} oWithControl the "with" control
				 */
				function visitAttributes(oNode, oWithControl) {
					var i;

					if (oNode.attributes) {
						for (i = 0; i < oNode.attributes.length; i += 1) {
							resolveAttributeBinding(oNode.attributes.item(i), oWithControl);
						}
					}
				}

				/**
				 * Visits the child nodes of the given node.
				 * @param {Node} oNode the DOM Node
				 * @param {sap.ui.core.util._with} oWithControl the "with" control
				 */
				function visitChildNodes(oNode, oWithControl) {
					var i,
						oNodeList = oNode.childNodes;

					// iterate from the end so that removing a template node does not hurt
					for (i = oNodeList.length - 1; i >= 0; i -= 1) {
						visitNode(oNodeList.item(i), oWithControl);
					}
				}

				/**
				 * Visits the given node.
				 * @param {Node} oNode the DOM Node
				 * @param {sap.ui.core.template._with} oWithControl the "with" control
				 */
				function visitNode(oNode, oWithControl) {
					if (oNode.namespaceURI === sNAMESPACE) {
						switch (localName(oNode)) {
						case "if":
							templateIf(oNode, oWithControl);
							return;

						case "repeat":
							templateRepeat(oNode, oWithControl);
							return;

						case "with":
							templateWith(oNode, oWithControl);
							return;

						default:
							//TODO Error?
						}
					}

					visitAttributes(oNode, oWithControl);
					visitChildNodes(oNode, oWithControl);
				}

				if (oRootElement.getAttribute("isTemplate") !== "true") {
					return;
				}
				mSettings = mSettings || {};
				visitNode(oRootElement, new With({
					models: mSettings.models,
					bindingContexts: mSettings.bindingContexts
				}));
				oRootElement.setAttribute("isTemplate", "false");
			}
		};
	}, /* bExport= */ true);
