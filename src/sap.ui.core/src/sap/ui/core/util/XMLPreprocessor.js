/*!
 * ${copyright}
 */

// Provides object sap.ui.core.util.XMLPreprocessor
sap.ui.define(['jquery.sap.global', 'sap/ui/base/BindingParser', 'sap/ui/base/ManagedObject',
	'sap/ui/core/XMLTemplateProcessor', 'sap/ui/model/BindingMode',
	'sap/ui/model/CompositeBinding', 'sap/ui/model/Context'],
	function(jQuery, BindingParser, ManagedObject, XMLTemplateProcessor, BindingMode,
		CompositeBinding, Context) {
		'use strict';

		var oUNBOUND = {}, // @see getAny
			sNAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1",
			/**
			 * <template:with> control holding the models and the bindings. Also used as substitute
			 * for any control during template processing in order to resolve property bindings.
			 * Supports nesting of template instructions.
			 */
			With = ManagedObject.extend("sap.ui.core.util._with", {
				metadata : {
					properties : {
						any : "any"
					},
					aggregations : {
						child : {multiple : false, type : "sap.ui.core.util._with"}
					}
				}
			}),
			/**
			 * <template:repeat> control extending the "with" control by an aggregation which is
			 * used to get the list binding.
			 */
			Repeat = With.extend("sap.ui.core.util._repeat", {
				metadata : {
					aggregations : {
						list : {multiple : true, type : "n/a", _doesNotRequireFactory : true}
					}
				},

				updateList : function () {
					// Override sap.ui.base.ManagedObject#updateAggregation for "list" and do
					// nothing to avoid that any child objects are created
				}
			});

		/**
		 * Returns the callback interface for a call to the given control's formatter of the
		 * binding part with given index.
		 *
		 * @param {sap.ui.core.util._with} oWithControl
		 *   the "with" control
		 * @param {object} mSettings
		 *   map/JSON-object with initial property values, etc.
		 * @param {number} [i]
		 *   index of part inside a composite binding
		 * @returns {object}
		 *   the callback interface
		 */
		function getInterface(oWithControl, mSettings, i) {
			/*
			 * Returns the binding related to the current formatter call.
			 * @param {number} [iPart]
			 *   index of part in case of a root formatter for a composite binding
			 * @returns {sap.ui.model.PropertyBinding}
			 */
			function getBinding(iPart) {
				var oBinding = oWithControl.getBinding("any");
				return oBinding instanceof CompositeBinding
					? oBinding.getBindings()[i === undefined/*root formatter*/ ? iPart : i]
					: oBinding;
			}

			/**
			 * Context interface provided by XML template processing as an additional first
			 * argument to any formatter function which opts in to this mechanism. Candidates for
			 * such formatter functions are all those used in binding expressions which are
			 * evaluated during XML template processing, including those used inside template
			 * instructions like <code>&lt;template:if></code>. The formatter function needs to be
			 * marked with a property <code>requiresIContext = true</code> to express that it
			 * requires this extended signature (compared to ordinary formatter functions). The
			 * usual arguments are provided after the first one (currently: the raw value from the
			 * model).
			 *
			 * This interface provides callback functions to access the model and path  which are
			 * needed to process OData v4 annotations. It initially offers a subset of methods
			 * from {@link sap.ui.model.Context} so that formatters might also be called with a
			 * context object for convenience, e.g. outside of XML template processing (see below
			 * for an exception to this rule).
			 *
			 * <b>Example:</b> Suppose you have a formatter function called "foo" like below
			 * and it is used within an XML template like
			 * <code>&lt;template:if test="{path: '...', formatter: 'foo'}"></code>.
			 * In this case <code>foo</code> is called with arguments
			 * <code>oInterface, vRawValue</code> such that
			 * <code>oInterface.getModel().getObject(oInterface.getPath()) === vRawValue</code>
			 * holds.
			 * <pre>
			 * window.foo = function (oInterface, vRawValue) {
			 *     //TODO ...
			 * };
			 * window.foo.requiresIContext = true;
			 * </pre>
			 *
			 * <b>Composite Binding Examples:</b> Suppose you have the same formatter function and
			 * it is used in a composite binding like <code>&lt;Text text="{path: 'Label',
			 * formatter: 'foo'}: {path: 'Value', formatter: 'foo'}"/></code>.
			 * In this case <code>oInterface.getPath()</code> refers to ".../Label" in the 1st call
			 * and ".../Value" in the 2nd call. This means each formatter call knows which part of
			 * the composite binding it belongs to and behaves just as if it was an ordinary
			 * binding.
			 *
			 * Suppose your formatter is not used within a part of the composite binding, but at
			 * the root of the composite binding in order to aggregate all parts like <code>
			 * &lt;Text text="{parts: [{path: 'Label'}, {path: 'Value'}], formatter: 'foo'}"/>
			 * </code>. In this case <code>oInterface.getPath(0)</code> refers to ".../Label" and
			 * <code>oInterface.getPath(1)</code> refers to ".../Value". This means a root
			 * formatter can access the ith part of the composite binding at will (since 1.31.0).
			 * The function <code>foo</code> is called with arguments such that <code>
			 * oInterface.getModel(i).getObject(oInterface.getPath(i)) === arguments[i + 1]</code>
			 * holds.
			 *
			 * To distinguish those two use cases, just check whether
			 * <code>oInterface.getModel() === undefined</code>, in which case the formatter is
			 * called on root level. To find out the number of parts, probe for the smallest
			 * non-negative integer where <code>oInterface.getModel(i) === undefined</code>.
			 * This additional functionality is, of course, not available from
			 * {@link sap.ui.model.Context}, i.e. such formatters MUST be called with an instance
			 * of this context interface.
			 *
			 * @interface
			 * @name sap.ui.core.util.XMLPreprocessor.IContext
			 * @public
			 * @since 1.27.1
			 */
			return /** @lends sap.ui.core.util.XMLPreprocessor.IContext */ {
				/**
				 * Returns the model related to the current formatter call.
				 *
				 * @param {number} [i]
				 *   index of part in case of a root formatter for a composite binding
				 *   (since 1.31.0)
				 * @returns {sap.ui.model.Model}
				 *   the model related to the current formatter call, or (since 1.31.0)
				 *   <code>undefined</code> in case of a root formatter if no <code>i</code> is
				 *   given or if <code>i</code> is out of range
				 * @public
				 */
				getModel : function (i) {
					var oBinding = getBinding(i);
					return oBinding && oBinding.getModel();
				},

				/**
				 * Returns the absolute path related to the current formatter call.
				 *
				 * @param {number} [i]
				 *   index of part in case of a root formatter for a composite binding
				 *   (since 1.31.0)
				 * @returns {string}
				 *   the absolute path related to the current formatter call, or (since 1.31.0)
				 *   <code>undefined</code> in case of a root formatter if no <code>i</code> is
				 *   given or if <code>i</code> is out of range
				 * @public
				 */
				getPath : function (i) {
					var oBinding = getBinding(i);
					return oBinding
						&& oBinding.getModel().resolve(oBinding.getPath(), oBinding.getContext());
				},

				/**
				 * Returns the value of the setting with the given name which was provided to the
				 * XML template processing.
				 *
				 * @param {string} sName
				 *   the name of the setting
				 * @returns {any}
				 *   the value of the setting
				 * @throws {Error}
				 *   if the name is one of the reserved names: "bindingContexts", "models"
				 * @public
				 */
				getSetting : function (sName) {
					if (sName === "bindingContexts" || sName === "models") {
						throw new Error("Illegal argument: " + sName);
					}
					return mSettings[sName];
				}
			};
		}

		/**
		 * Gets the value of the control's "any" property via the given binding info.
		 *
		 * @param {sap.ui.core.util._with} oWithControl
		 *   the "with" control
		 * @param {object} oBindingInfo
		 *   the binding info
		 * @param {object} mSettings
		 *   map/JSON-object with initial property values, etc.
		 * @returns {any}
		 *   the property value or <code>oUNBOUND</code> in case the binding is not ready (because
		 *   it refers to a model which is not available)
		 * @throws Error
		 */
		function getAny(oWithControl, oBindingInfo, mSettings) {
			/*
			 * Prepares the given binding info or part of it; makes it "one time" and binds its
			 * formatter function (if opted in) to an interface object.
			 *
			 * @param {object} oInfo
			 *   a binding info or a part of it
			 * @param {number} i
			 *   index of binding info's part (if applicable)
			 */
			function prepare(oInfo, i) {
				var fnFormatter = oInfo.formatter;

				oInfo.mode = BindingMode.OneTime;
				if (fnFormatter && fnFormatter.requiresIContext === true) {
					oInfo.formatter
					= fnFormatter.bind(null, getInterface(oWithControl, mSettings, i));
				}
			}

			try {
				prepare(oBindingInfo);
				if (oBindingInfo.parts) {
					oBindingInfo.parts.forEach(prepare);
				}

				oWithControl.bindProperty("any", oBindingInfo);
				return oWithControl.getBinding("any")
					? oWithControl.getAny()
					: oUNBOUND;
			} finally {
				oWithControl.unbindProperty("any", true);
			}
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
			var oAttribute,
				oAttributesList = oElement.attributes,
				sText = "<" + oElement.nodeName,
				i, n;

			for (i = 0, n = oAttributesList.length; i < n; i += 1) {
				oAttribute = oAttributesList.item(i);
				sText += " " + oAttribute.name + '="' + oAttribute.value + '"';
			}
			return sText + (oElement.childNodes.length ? ">" : "/>");
		}

		/**
		 * @classdesc
		 * The XML pre-processor for template instructions in XML views.
		 *
		 * @namespace sap.ui.core.util.XMLPreprocessor
		 * @public
		 * @since 1.27.1
		 */
		return {
			/**
			 * Performs template pre-processing on the given XML DOM element.
			 *
			 * @param {Element} oRootElement
			 *   the DOM element to process
			 * @param {object} oViewInfo
			 *   info object of the calling instance
			 * @param {string} oViewInfo.caller
			 *   identifies the caller of this preprocessor; used as a prefix for log or
			 *   exception messages
			 * @param {string} oViewInfo.componentId
			 *   ID of the owning component (since 1.31; needed for extension point support)
			 * @param {string} oViewInfo.name
			 *   the view name (since 1.31; needed for extension point support)
			 * @param {object} [mSettings={}]
			 *   map/JSON-object with initial property values, etc.
			 * @param {object} mSettings.bindingContexts
			 *   binding contexts relevant for template pre-processing
			 * @param {object} mSettings.models
			 *   models relevant for template pre-processing
			 * @returns {Element}
			 *   <code>oRootElement</code>
			 *
			 * @private
			 */
			process : function(oRootElement, oViewInfo, mSettings) {
				var sCaller,
					bDebug = jQuery.sap.log.isLoggable(jQuery.sap.log.Level.DEBUG),
					aFragmentNames = [], // stack of view and fragment names
					iNestingLevel = 0,
					sName;

				/*
				 * Outputs a debug message with the given nesting level; takes care not to
				 * construct the message or serialize XML in vain.
				 *
				 * @param {Element} [oElement]
				 *   a DOM element which is serialized to the details
				 * @param {...string} aTexts
				 *   the main text of the message is constructed from the rest of the arguments by
				 *   joining them separated by single spaces
				 */
				function debug(oElement) {
					if (bDebug) {
						jQuery.sap.log.debug((iNestingLevel < 10 ? "[ " : "[") + iNestingLevel
							+ "] " + Array.prototype.slice.call(arguments, 1).join(" "),
							oElement && serializeSingleElement(oElement),
							"sap.ui.core.util.XMLPreprocessor");
					}
				}

				/**
				 * Outputs a debug message "Finished" with the given nesting level; takes care not
				 * to serialize XML in vain.
				 *
				 * @param {Element} oElement
				 *   a DOM element which is serialized to the details
				 */
				function debugFinished(oElement) {
					if (bDebug) {
						jQuery.sap.log.debug((iNestingLevel < 10 ? "[ " : "[") + iNestingLevel
							+ "] Finished", "</" + oElement.nodeName + ">",
							"sap.ui.core.util.XMLPreprocessor");
					}
				}

				/**
				 * Throws an error with the given message, prefixing it with the caller
				 * identification (separated by a colon) and appending the serialization of the
				 * given DOM element.
				 *
				 * @param {string} sMessage
				 *   some error message which must end with a space (and take into account, that
				 *   the serialized XML is appended)
				 * @param {Element} oElement
				 *   the DOM element
				 */
				function error(sMessage, oElement) {
					throw new Error(sCaller + ": " + sMessage + serializeSingleElement(oElement));
				}

				/**
				 * Determines the relevant children for the <template:if> element.
				 *
				 * @param {Element} oIfElement
				 *   the <template:if> element
				 * @returns {Element[]}
				 *   the children (a <then>, zero or more <elseif> and poss. an <else>) or null if
				 *   there is no <then>
				 * @throws Error
				 *   if there is an unexpected child element
				 */
				function getIfChildren(oIfElement) {
					var oNodeList = oIfElement.childNodes,
						oChild,
						aChildren = [],
						i, n,
						bFoundElse = false;

					for (i = 0, n = oNodeList.length; i < n; i += 1) {
						oChild = oNodeList.item(i);
						if (oChild.nodeType === 1 /*ELEMENT_NODE*/) {
							aChildren.push(oChild);
						}
					}
					if (!aChildren.length || !isTemplateElement(aChildren[0], "then")) {
						return null;
					}
					for (i = 1, n = aChildren.length; i < n; i += 1) {
						oChild = aChildren[i];
						if (bFoundElse) {
							error("Expected </" + oIfElement.prefix + ":if>, but instead saw ",
								oChild);
						}
						if (isTemplateElement(oChild, "else")) {
							bFoundElse = true;
						} else if (!isTemplateElement(oChild, "elseif")) {
							error("Expected <" + oIfElement.prefix + ":elseif> or <"
								+ oIfElement.prefix + ":else>, but instead saw ", aChildren[i]);
						}
					}
					return aChildren;
				}

				/**
				 * Interprets the given value as a binding and returns the resulting value; takes
				 * care of unescaping and thus also of constant expressions.
				 *
				 * @param {string} sValue
				 *   an XML attribute value
				 * @param {Element} oElement
				 *   the element
				 * @param {sap.ui.core.util._with} oWithControl
				 *   the "with" control
				 * @param {boolean} bMandatory
				 *   whether a binding is actually required (e.g. by a <code>template:if</code>)
				 *   and not optional (e.g. for {@link resolveAttributeBinding}); if so, the
				 *   binding parser unescapes the given value (which is a prerequisite for
				 *   constant expressions) and warnings are logged for functions not found
				 * @param {function} [fnCallIfConstant]
				 *   optional function to be called in case the return value is obviously a
				 *   constant, not influenced by any binding
				 * @returns {string|object}
				 *   the resulting value or <code>oUNBOUND</code> in case the binding is not ready
				 *   (because it refers to a model which is not available)
				 * @throws Error
				 */
				function getResolvedBinding(sValue, oElement, oWithControl, bMandatory,
					fnCallIfConstant) {
					var vBindingInfo
						= BindingParser.complexParser(sValue, null, bMandatory, true)
						|| sValue; // in case there is no binding and nothing to unescape

					if (vBindingInfo.functionsNotFound) {
						if (bMandatory) {
							warn('Function name(s) ' + vBindingInfo.functionsNotFound.join(", ")
								+ ' not found in ', oElement, null);
						}
						return oUNBOUND; // treat incomplete bindings as unrelated
					}

					if (typeof vBindingInfo === "object") {
						vBindingInfo = getAny(oWithControl, vBindingInfo, mSettings);
						if (bMandatory && vBindingInfo === oUNBOUND) {
							warn('Binding not ready in ', oElement, null);
						}
					} else if (fnCallIfConstant) { // string
						fnCallIfConstant();
					}
					return vBindingInfo;
				}

				/**
				 * Inserts the fragment with the given name in place of the given <core:Fragment>
				 * or <core:ExtensionPoint> element.
				 *
				 * @param {string} sFragmentName
				 *   the fragment's resolved name
				 * @param {Element} oElement
				 *   the <sap.ui.core:Fragment> or <core:ExtensionPoint> element
				 * @param {sap.ui.core.util._with} oWithControl
				 *   the parent's "with" control
				 */
				function insertFragment(sFragmentName, oElement, oWithControl) {
					var oFragmentElement;

					// Note: It is perfectly valid to include the very same fragment again, as
					// long as the context is changed. So we check for cycles at the current
					// "with" control. A context change will create a new one.
					oWithControl.$mFragmentContexts = oWithControl.$mFragmentContexts || {};
					if (oWithControl.$mFragmentContexts[sFragmentName]) {
						oElement.appendChild(oElement.ownerDocument.createTextNode(
							"Error: Stopped due to cyclic fragment reference"));
						jQuery.sap.log.error(
							'Stopped due to cyclic reference in fragment: ' + sFragmentName,
							jQuery.sap.serializeXML(oElement.ownerDocument.documentElement),
							"sap.ui.core.util.XMLPreprocessor");
						return;
					}

					iNestingLevel++;
					debug(oElement, "fragmentName =", sFragmentName);
					oWithControl.$mFragmentContexts[sFragmentName] = true;
					aFragmentNames.push(sFragmentName);

					oFragmentElement
						= XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
					if (oFragmentElement.namespaceURI === "sap.ui.core"
							&& localName(oFragmentElement) === "FragmentDefinition") {
						liftChildNodes(oFragmentElement, oWithControl, oElement);
					} else {
						oElement.parentNode.insertBefore(oFragmentElement, oElement);
						visitNode(oFragmentElement, oWithControl);
					}
					oElement.parentNode.removeChild(oElement);

					aFragmentNames.pop();
					oWithControl.$mFragmentContexts[sFragmentName] = false;
					debugFinished(oElement);
					iNestingLevel--;
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
					var oChild;

					oTarget = oTarget || oParent;
					visitChildNodes(oParent, oWithControl);
					while ((oChild = oParent.firstChild)) {
						oTarget.parentNode.insertBefore(oChild, oTarget);
					}
				}

				/**
				 * Performs the test in the given element.
				 *
				 * @param {Element} oElement
				 *   the test element (either <if> or <elseif>)
				 * @param {sap.ui.core.util._with} oWithControl
				 *   the "with" control
				 * @returns {boolean}
				 *   the test result
				 */
				function performTest(oElement, oWithControl) {
					// constant test conditions are suspicious, but useful during development
					var fnCallIfConstant
							= warn.bind(null, 'Constant test condition in ', oElement, null),
						bResult,
						sTest = oElement.getAttribute("test"),
						vTest;

					try {
						vTest = getResolvedBinding(sTest, oElement, oWithControl, true,
							fnCallIfConstant);
						if (vTest === oUNBOUND) {
							vTest = false;
						}
					} catch (ex) {
						warn('Error in formatter of ', oElement, ex);
						vTest = false;
					}
					bResult = !!vTest && vTest !== "false";
					if (bDebug) {
						if (typeof vTest === "string") {
							vTest = JSON.stringify(vTest);
						} else if (vTest === undefined) {
							vTest = "undefined";
						} else if (Array.isArray(vTest)) {
							vTest = "[object Array]";
						}
						debug(oElement, "test ==", vTest, "-->", bResult);
					}
					return bResult;
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
					var sValue = oAttribute.value,
						vValue;

					try {
						vValue = getResolvedBinding(sValue, oElement, oWithControl, false);
						if (vValue === oUNBOUND) {
							debug(oElement, 'Binding not ready for attribute', oAttribute.name);
						} else if (vValue === undefined) {
							// if the formatter returns null, the value becomes undefined
							// (the default value of _With.any)
							debug(oElement, "Removed attribute", oAttribute.name);
							oElement.removeAttribute(oAttribute.name);
						} else {
							if (bDebug && vValue !== oAttribute.value) {
								debug(oElement, oAttribute.name, "=", vValue);
							}
							oAttribute.value = vValue;
						}
					} catch (ex) {
						// just don't replace XML attribute value
						if (bDebug) {
							jQuery.sap.log.debug(
								sCaller + ': Error in formatter of '
									+ serializeSingleElement(oElement),
								ex, "sap.ui.core.util.XMLPreprocessor");
						}
					}
				}

				/**
				 * Replaces a <sap.ui.core:ExtensionPoint> element with the content of an XML
				 * fragment configured as a replacement (via component meta data, "customizing" and
				 * "sap.ui.viewExtensions"), or leaves it untouched in case no such replacement is
				 * currently configured.
				 *
				 * @param {Element} oElement
				 *   the <sap.ui.core:ExtensionPoint> element
				 * @param {sap.ui.core.util._with} oWithControl
				 *   the parent's "with" control
				 * @returns {boolean}
				 *   whether the <sap.ui.core:ExtensionPoint> element has been replaced
				 */
				function templateExtensionPoint(oElement, oWithControl) {
					var sName = oElement.getAttribute("name"),
						vName = oUNBOUND,
						oViewExtension;

					try {
						// resolve name, no matter if CustomizingConfiguration is present!
						vName = getResolvedBinding(sName, oElement, oWithControl, true);
						if (vName !== oUNBOUND && vName !== sName) {
							// debug trace for dynamic names only
							debug(oElement, "name =", vName);
						}
					} catch (ex) {
						warn('Error in formatter of ', oElement, ex);
					}

					if (oViewInfo && vName !== oUNBOUND && sap.ui.core.CustomizingConfiguration) {
						oViewExtension = sap.ui.core.CustomizingConfiguration.getViewExtension(
							aFragmentNames[aFragmentNames.length - 1], vName,
							oViewInfo.componentId);
						if (oViewExtension && oViewExtension.className === "sap.ui.core.Fragment"
								&& oViewExtension.type === "XML") {
							insertFragment(oViewExtension.fragmentName, oElement, oWithControl);
							return true;
						}
					}
					return false;
				}

				/**
				 * Loads and inlines the content of a <sap.ui.core:Fragment> element.
				 *
				 * @param {Element} oElement
				 *   the <sap.ui.core:Fragment> element
				 * @param {sap.ui.core.util._with} oWithControl
				 *   the parent's "with" control
				 */
				function templateFragment(oElement, oWithControl) {
					var sFragmentName = oElement.getAttribute("fragmentName"),
						vFragmentName;

					try {
						vFragmentName
							= getResolvedBinding(sFragmentName, oElement, oWithControl, true);
						if (vFragmentName !== oUNBOUND) {
							insertFragment(vFragmentName, oElement, oWithControl);
						}
					} catch (ex) {
						warn('Error in formatter of ', oElement, ex);
					}
				}

				/**
				 * Processes a <template:if> instruction.
				 *
				 * @param {Element} oIfElement
				 *   the <template:if> element
				 * @param {sap.ui.core.util._with} oWithControl
				 *   the "with" control
				 */
				function templateIf(oIfElement, oWithControl) {
					var aChildren = getIfChildren(oIfElement),
						// the selected element; iterates over aChildren; it is chosen if
						// oTestElement evaluates to true or if the <else> has been reached
						oSelectedElement,
						// the element to run the test on (may be <if> or <elseif>)
						oTestElement;

					iNestingLevel++;
					if (aChildren) {
						oTestElement = oIfElement; // initially the <if>
						oSelectedElement = aChildren.shift(); // initially the <then>
						do {
							if (performTest(oTestElement, oWithControl)) {
								break;
							}
							oTestElement = oSelectedElement = aChildren.shift();
							// repeat as long as we're on an <elseif>
						} while (oTestElement && localName(oTestElement) === "elseif");
					} else if (performTest(oIfElement, oWithControl)) {
						// no <if>-specific children and <if> test is true -> select the <if>
						oSelectedElement = oIfElement;
					}
					if (oSelectedElement) {
						liftChildNodes(oSelectedElement, oWithControl, oIfElement);
					}
					oIfElement.parentNode.removeChild(oIfElement);
					debugFinished(oIfElement);
					iNestingLevel--;
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
						oBindingInfo = BindingParser.complexParser(sList),
						aContexts,
						oListBinding,
						sModelName,
						oNewWithControl,
						sVar = oElement.getAttribute("var");

					if (sVar === "") {
						error("Missing variable name for ", oElement);
					}
					if (!oBindingInfo) {
						error("Missing binding for ", oElement);
					}

					// set up a scope for the loop variable, so to say
					oNewWithControl = new Repeat();
					oWithControl.setChild(oNewWithControl);

					// use a list binding to get an array of contexts
					oBindingInfo.mode = BindingMode.OneTime;
					oNewWithControl.bindAggregation("list", oBindingInfo);
					oListBinding = oNewWithControl.getBinding("list");
					oNewWithControl.unbindAggregation("list", true);
					sModelName = oBindingInfo.model; // added by bindAggregation
					if (!oListBinding) {
						error("Missing model '" + sModelName + "' in ", oElement);
					}
					aContexts
						= oListBinding.getContexts(oBindingInfo.startIndex, oBindingInfo.length);

					// set up the model for the loop variable
					sVar = sVar || sModelName; // default loop variable is to keep the same model
					oNewWithControl.setModel(oListBinding.getModel(), sVar);

					// the actual loop
					iNestingLevel++;
					debug(oElement, "Starting");
					aContexts.forEach(function (oContext, i) {
						var oSourceNode = (i === aContexts.length - 1) ?
							oElement : oElement.cloneNode(true);
						// Note: because sVar and sModelName refer to the same model instance, it
						// is OK to use sModelName's context for sVar as well (the name is not part
						// of the context!)
						oNewWithControl.setBindingContext(oContext, sVar);
						debug(oElement, sVar, "=", oContext.getPath());
						liftChildNodes(oSourceNode, oNewWithControl, oElement);
					});
					debugFinished(oElement);
					iNestingLevel--;

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
						fnHelper,
						sHelper = oElement.getAttribute("helper"),
						vHelperResult,
						sPath = oElement.getAttribute("path"),
						sResolvedPath,
						sVar = oElement.getAttribute("var");

					if (sVar === "") {
						error("Missing variable name for ", oElement);
					}
					oNewWithControl = new With();
					oWithControl.setChild(oNewWithControl);

					oBindingInfo = BindingParser.simpleParser("{" + sPath + "}");
					sVar = sVar || oBindingInfo.model; // default variable is same model name

					if (sHelper || sVar) { // create a "named context"
						oModel = oWithControl.getModel(oBindingInfo.model);
						if (!oModel) {
							error("Missing model '" + oBindingInfo.model + "' in ", oElement);
						}
						sResolvedPath = oModel.resolve(oBindingInfo.path,
							oWithControl.getBindingContext(oBindingInfo.model));
						if (!sResolvedPath) {
							error("Cannot resolve path for ", oElement);
						}
						if (sHelper) {
							fnHelper = jQuery.sap.getObject(sHelper);
							if (typeof fnHelper !== "function") {
								error("Cannot resolve helper for ", oElement);
							}
							vHelperResult = fnHelper(oModel.createBindingContext(sResolvedPath));
							if (vHelperResult instanceof Context) {
								oModel = vHelperResult.getModel();
								sResolvedPath = vHelperResult.getPath();
							} else if (vHelperResult !== undefined) {
								if (typeof vHelperResult !== "string" || vHelperResult === "") {
									error("Illegal helper result '" + vHelperResult + "' in ",
										oElement);
								}
								sResolvedPath = vHelperResult;
							}
						}
						oNewWithControl.setModel(oModel, sVar);
						oNewWithControl.bindObject({
							model : sVar,
							path : sResolvedPath
						});
					} else {
						oNewWithControl.bindObject(sPath);
					}

					iNestingLevel++;
					debug(oElement, sVar, "=", sResolvedPath);
					if (oNewWithControl.getBindingContext(sVar)
							=== oWithControl.getBindingContext(sVar)) {
						// Warn and ignore the new "with" control when its binding context is
						// the same as a previous one.
						// We test identity because models cache and reuse binding contexts.
						warn("Set unchanged path '" + sResolvedPath + "' in ", oElement, null);
						oNewWithControl = oWithControl;
					}

					liftChildNodes(oElement, oNewWithControl);
					oElement.parentNode.removeChild(oElement);
					debugFinished(oElement);
					iNestingLevel--;
				}

				/**
				 * Visits the attributes of the given node.
				 *
				 * @param {Node} oNode the DOM Node
				 * @param {sap.ui.core.template._with} oWithControl the "with" control
				 */
				function visitAttributes(oNode, oWithControl) {
					var i, n,
						oAttributesList = oNode.attributes;

					if (oAttributesList) { // only if oNode is an Element
						for (i = 0, n = oAttributesList.length; i < n; i += 1) {
							resolveAttributeBinding(oNode, oAttributesList.item(i), oWithControl);
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
						oNodeList = oNode.childNodes,
						n = oNodeList.length,
						aChildren = new Array(n);

					// cache live collection so that removing a template node does not hurt
					for (i = 0; i < n; i += 1) {
						aChildren[i] = oNodeList.item(i);
					}
					for (i = 0; i < n; i += 1) {
						visitNode(aChildren[i], oWithControl);
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
							error("Unexpected tag ", oNode);
						}
					} else if (oNode.namespaceURI === "sap.ui.core") {
						switch (localName(oNode)) {
						case "ExtensionPoint":
							if (templateExtensionPoint(oNode, oWithControl)) {
								return;
							}
							break;

						case "Fragment":
							if (oNode.getAttribute("type") === "XML") {
								templateFragment(oNode, oWithControl);
								return;
							}
							break;

						// no default
						}
					}

					visitAttributes(oNode, oWithControl);
					visitChildNodes(oNode, oWithControl);
				}

				/**
				 * Outputs a warning; takes care not to serialize XML in vain.
				 *
				 * @param {string} sText
				 *   the main text of the warning
				 * @param {Element} oElement
				 *   a DOM element
				 * @param {string} sDetails
				 *   the details of the warning
				 */
				function warn(sText, oElement, sDetails) {
					if (jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING)) {
						jQuery.sap.log.warning(
							sCaller + ": " + sText + serializeSingleElement(oElement),
							sDetails, "sap.ui.core.util.XMLPreprocessor");
					}
				}

				//TODO remove this legacy compatibility for design time templating
				if (typeof mSettings === "string") {
					sCaller = mSettings;
					mSettings = oViewInfo;
					oViewInfo = null; // not available
				} else {
					sCaller = oViewInfo.caller;
					aFragmentNames.push(oViewInfo.name);
				}
				mSettings = mSettings || {};
				if (bDebug) {
					debug(undefined, "Start processing", sCaller);
					if (mSettings.bindingContexts instanceof Context)  {
						debug(undefined, "undefined =", mSettings.bindingContexts);
					} else {
						for (sName in mSettings.bindingContexts) {
							debug(undefined, sName, "=", mSettings.bindingContexts[sName]);
						}
					}
				}
				visitNode(oRootElement, new With({
					models : mSettings.models,
					bindingContexts : mSettings.bindingContexts
				}));
				debug(undefined, "Finished processing", sCaller);
				return oRootElement;
			}
		};
	}, /* bExport= */ true);
