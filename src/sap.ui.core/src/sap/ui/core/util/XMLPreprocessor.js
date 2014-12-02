/*!
 * ${copyright}
 */

// Provides object sap.ui.core.util.XMLPreprocessor
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject'],
	function(jQuery, ManagedObject) {
		'use strict';

		var oUNBOUND = {}, // @see getAny
			sNAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1",
			/**
			 * <template:with> control holding the models and the bindings. Also used as substitute
			 * for any control during template processing in order to resolve property bindings.
			 * Supports nesting of template instructions.
			 */
			With = ManagedObject.extend("sap.ui.core.util._with", {
				metadata: {
					properties: {
						any: "any"
					},
					aggregations: {
						child: {multiple: false, type: "sap.ui.core.util._with"}
					}
				},
				/**
				 * Returns the binding related to the current formatter call, especially the path,
				 * context, and model. This is meant as a public API for any formatter used during
				 * XML template processing.
				 *
				 * @returns {sap.ui.model.Binding}
				 *   the binding related to the current formatter call
				 */
				currentBinding: function () {
					return this.getBinding("any");
				}
			}),
			/**
			 * <template:repeat> control extending the "with" control by an aggregation which is
			 * used to get the list binding.
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
		 *
		 * @param {sap.ui.core.util._with} oWithControl the "with" control
		 * @param {object} oBindingInfo the binding info
		 * @returns {any} the property value or <code>oUNBOUND</code> in case the binding is
		 * not ready (because it refers to a model which is not available)
		 * @throws Error
		 */
		function getAny(oWithControl, oBindingInfo) {
			try {
				oBindingInfo.mode = sap.ui.model.BindingMode.OneTime;
				oWithControl.bindProperty("any", oBindingInfo);
				return oWithControl.getBinding("any")
					? oWithControl.getAny()
					: oUNBOUND;
			} finally {
				oWithControl.unbindProperty("any", true);
			}
		}

		/**
		 * Returns the index of the next child element in the given parent element after the given
		 * index (not a text or comment node).
		 *
		 * @param {Element} oParent
		 *   The parent DOM node
		 * @param {int} i
		 *   The child node index to start search
		 * @returns {int}
		 *   The index of the next DOM Element or -1 if not found
		 */
		function getNextChildElementIndex(oParent, i) {
			var oNodeList = oParent.childNodes;

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
		 *
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
		 *
		 * @param {Node} oNode any DOM node
		 * @returns {string} the local name
		 */
		function localName(oNode) {
			return oNode.localName || oNode.baseName; // IE8
		}

		/**
		 * Serializes the element with its attributes.
		 * <p>
		 * BEWARE: makes no attempt at encoding, DO NOT use in a security critical manner!
		 *
		 * @param {Element} oElement a DOM element
		 * @returns {string} the serialization
		 */
		function serializeSingleElement(oElement) {
			var sText = "<" + oElement.nodeName;
			jQuery.each(oElement.attributes, function (i, oAttribute) {
				sText += " " + oAttribute.name + '="' + oAttribute.value + '"';
			});
			return sText + (oElement.childNodes.length ? ">" : "/>");
		}

		/**
		 * The XML pre-processor for template instructions in XML views.
		 *
		 * @alias sap.ui.core.util.XMLPreprocessor
		 * @private
		 */
		return {
			/**
			 * Performs template pre-processing on the given XML DOM element.
			 *
			 * @param {Element} oRootElement
			 *   the DOM element to process
			 * @param {object} mSettings
			 *   map/JSON-object with initial property values, etc.
			 * @param {object} mSettings.bindingContexts
			 *   binding contexts relevant for template pre-processing
			 * @param {object} mSettings.models
			 *   models relevant for template pre-processing
			 * @param {string} sCaller
			 *   identifies the caller of this preprocessor; used as a prefix for log or
			 *   exception messages
			 * @returns {Element}
			 *   <code>oRootElement</code>
			 *
			 * @private
			 */
			process: function(oRootElement, mSettings, sCaller) {
				/**
				 * Get the XML element for given <template:if> element which has to be part of the
				 * output.
				 *
				 * @param {Element} oIfElement
				 *   <template:if> element
				 * @param {boolean} bCondition
				 *   the evaluated condition of the <template:if>
				 * @returns {Element}
				 *   the DOM element whose children will be part of the output, or
				 *   <code>undefined</code> in case there is no such element (i.e. <template:else>
				 *   is missing)
				 * @throws Error if the syntax of <template:if> element is not valid.
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
						}
					}
					return bCondition ? oThenElement : oElseElement;
				}

				/**
				 * Visits the child nodes of the given parent element. Lifts them up by inserting
				 * them before the target element.
				 *
				 * @param {Element} oParent the DOM element
				 * @param {sap.ui.core.util._with} oWithControl the "with" control
				 * @param {Element} [oTarget=oParent] the target DOM element
				 */
				function liftChildNodes(oParent, oWithControl, oTarget) {
					oTarget = oTarget || oParent;
					visitChildNodes(oParent, oWithControl);
					while (oParent.firstChild) {
						oTarget.parentNode.insertBefore(oParent.firstChild, oTarget);
					}
				}

				/**
				 * Visit the given DOM attribute which represents any attribute of any control
				 * (other than template instructions). If the attribute value represents a binding
				 * expression, we try to resolve it using the "with" control instance.
				 *
				 * @param {Element} oElement
				 *   the owning element
				 * @param {Attribute} oAttribute
				 *   any attribute of any control (a DOM Attribute)
				 * @param {sap.ui.core.util._with} oWithControl the "with" control
				 */
				function resolveAttributeBinding(oElement, oAttribute, oWithControl) {
					var vAny,
						oBindingInfo = sap.ui.base.BindingParser.complexParser(oAttribute.value);

					if (oBindingInfo) {
						try {
							vAny = getAny(oWithControl, oBindingInfo);
							if (vAny !== oUNBOUND) {
								oAttribute.value = vAny;
							}
						} catch (ex) {
							// just don't replace XML attribute value
							if (jQuery.sap.log.isLoggable(jQuery.sap.log.Level.DEBUG)) {
								jQuery.sap.log.debug(
									sCaller + ': Error in formatter of '
										+ serializeSingleElement(oElement),
									ex, "sap.ui.core.util.XMLPreprocessor");
							}
						}
					}
				}

				/**
				 * Processes a <template:if> instruction.
				 *
				 * @param {Element} oElement
				 *   the <template:if> element
				 * @param {sap.ui.core.util._with} oWithControl the "with" control
				 */
				function templateIf(oElement, oWithControl) {
					var vTest = oElement.getAttribute("test"),
						oBindingInfo = sap.ui.base.BindingParser.complexParser(vTest),
						oChild;

					/**
					 * Outputs a warning; takes care not to serialize XML in vain.
					 *
					 * @param {string} sText
					 *   the main text of the warning
					 * @param {string} sDetails
					 *   the details of the warning
					 */
					function warn(sText, sDetails) {
						if (jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING)) {
							jQuery.sap.log.warning(
								sCaller + sText + serializeSingleElement(oElement),
								sDetails, "sap.ui.core.util.XMLPreprocessor");
						}
					}

					if (oBindingInfo) {
						try {
							vTest = getAny(oWithControl, oBindingInfo);
							if (vTest === oUNBOUND) {
								warn(': Binding not ready in ', null);
								vTest = false;
							}
						} catch (ex) {
							warn(': Error in formatter of ', ex);
							vTest = false;
						}
					}
					oChild = getThenOrElse(oElement, vTest && vTest !== "false");
					if (oChild) {
						liftChildNodes(oChild, oWithControl, oElement);
					}
					oElement.parentNode.removeChild(oElement);
				}

				/**
				 * Processes a <template:repeat> instruction.
				 *
				 * @param {Element} oElement
				 *   the <template:repeat> element
				 * @param {sap.ui.core.template._with} oWithControl
				 *   the parent's "with" control
				 */
				function templateRepeat(oElement, oWithControl) {
					var sList = oElement.getAttribute("list") || "",
						oBindingInfo = sap.ui.base.BindingParser.complexParser(sList),
						aContexts,
						oListBinding,
						sModelName,
						oNewWithControl,
						sVar = oElement.getAttribute("var");

					if (!oBindingInfo) {
						throw new Error(sCaller + ': Missing binding for '
							+ serializeSingleElement(oElement));
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
						throw new Error(sCaller + ": Missing model '" + sModelName + "' in "
							+ serializeSingleElement(oElement));
					}
					aContexts = oListBinding.getContexts();

					// set up the model for the loop variable
					sVar = sVar || sModelName; // default loop variable is to keep the same model
					oNewWithControl.setModel(oListBinding.getModel(), sVar);

					// the actual loop
					jQuery.each(aContexts, function (i, oContext) {
						var oSourceNode = (i === aContexts.length - 1) ?
							oElement : oElement.cloneNode(true);
						// Note: because sVar and sModelName refer to the same model instance, it
						// is OK to use sModelName's context for sVar as well (the name is not part
						// of the context!)
						oNewWithControl.setBindingContext(oContext, sVar);
						liftChildNodes(oSourceNode, oNewWithControl, oElement);
					});

					oElement.parentNode.removeChild(oElement);
				}

				/**
				 * Processes a <template:with> instruction.
				 *
				 * @param {Element} oElement
				 *   the <template:with> element
				 * @param {sap.ui.core.util._with} oWithControl
				 *   the parent's "with" control
				 */
				function templateWith(oElement, oWithControl) {
					var oBindingInfo,
						oModel,
						oNewWithControl,
						sPath = oElement.getAttribute("path"),
						sResolvedPath,
						sVar = oElement.getAttribute("var");

					oNewWithControl = new With();
					oWithControl.setChild(oNewWithControl);

					//TODO Simplify code once named contexts are supported by the core
					if (sVar) { // create a "named context"
						//TODO how to improve on this hack? makeSimpleBindingInfo() is not visible
						oBindingInfo = sap.ui.base.BindingParser.simpleParser("{" + sPath + "}");
						oModel = oWithControl.getModel(oBindingInfo.model);
						if (!oModel) {
							throw new Error(sCaller + ": Missing model '" + oBindingInfo.model
								+ "' in " + serializeSingleElement(oElement));
						}
						//TODO any trick to avoid explicit resolution of relative paths here?
						sResolvedPath = oModel.resolve(oBindingInfo.path,
							oWithControl.getBindingContext(oBindingInfo.model));
						if (!sResolvedPath) {
							throw new Error(sCaller + ': Cannot resolve path for '
								+ serializeSingleElement(oElement));
						}
						oNewWithControl.setModel(oModel, sVar);
						oNewWithControl.bindObject({
							model: sVar,
							path: sResolvedPath
						});
					} else {
						oNewWithControl.bindObject(sPath);
					}

					liftChildNodes(oElement, oNewWithControl);
					oElement.parentNode.removeChild(oElement);
				}

				/**
				 * Throws an error that the element represents an unexpected tag.
				 *
				 * @param {Element} oElement the DOM element
				 */
				function unexpectedTag(oElement) {
					throw new Error(sCaller + ": Unexpected tag "
						+ serializeSingleElement(oElement));
				}

				/**
				 * Visits the attributes of the given node.
				 *
				 * @param {Node} oNode the DOM Node
				 * @param {sap.ui.core.template._with} oWithControl the "with" control
				 */
				function visitAttributes(oNode, oWithControl) {
					var i;

					if (oNode.attributes) {
						for (i = 0; i < oNode.attributes.length; i += 1) {
							resolveAttributeBinding(oNode, oNode.attributes.item(i), oWithControl);
						}
					}
				}

				/**
				 * Visits the child nodes of the given node.
				 *
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
				 *
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
							unexpectedTag(oNode);
						}
					}

					visitAttributes(oNode, oWithControl);
					visitChildNodes(oNode, oWithControl);
				}

				visitNode(oRootElement, new With({
					models: mSettings.models,
					bindingContexts: mSettings.bindingContexts
				}));
				return oRootElement;
			}
		};
	}, /* bExport= */ true);
