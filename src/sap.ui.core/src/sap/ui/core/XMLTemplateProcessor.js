/*!
 * ${copyright}
 */

/*global Promise */

sap.ui.define([
	'sap/ui/base/DataType',
	'sap/ui/base/BindingInfo',
	'sap/ui/core/CustomData',
	'sap/ui/core/Component',
	'sap/ui/core/ElementRegistry',
	'./mvc/View',
	'./mvc/EventHandlerResolver',
	'./ExtensionPoint',
	'./StashedControlSupport',
	'sap/ui/base/SyncPromise',
	'sap/base/future',
	'sap/base/Log',
	'sap/base/assert',
	'sap/base/util/LoaderExtensions',
	'sap/base/util/JSTokenizer',
	'sap/base/util/each',
	'sap/base/util/isEmptyObject',
	'sap/ui/base/DesignTime',
	'sap/ui/core/Lib'
], function(
	DataType,
	BindingInfo,
	CustomData,
	Component,
	ElementRegistry,
	View,
	EventHandlerResolver,
	ExtensionPoint,
	StashedControlSupport,
	SyncPromise,
	future,
	Log,
	assert,
	LoaderExtensions,
	JSTokenizer,
	each,
	isEmptyObject,
	DesignTime,
	Library
) {
	"use strict";

	function parseScalarType(sType, sValue, sName, oContext, oRequireModules, aTypePromises) {
		var bResolveTypesAsync = !!aTypePromises;
		var oBindingInfo;

		// check for a binding expression (string)
		var oBindingParseResult = BindingInfo.parse(sValue, oContext, /*bUnescape*/true,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/false, /*bPreferContext*/false,
			oRequireModules,
			/* bResolveTypesAsync: Whether we want the type classes to be resolved,
			        true if async == true, false otherwise */
			bResolveTypesAsync);

		// asynchronously resolved types result in a Promise we need to unwrap here
		if (bResolveTypesAsync && oBindingParseResult) {
			aTypePromises.push(oBindingParseResult.resolved);
			oBindingInfo = oBindingParseResult.bindingInfo;
		} else {
			oBindingInfo = oBindingParseResult;
		}

		if ( oBindingInfo && typeof oBindingInfo === "object" ) {
			return oBindingInfo;
		}

		var vValue = sValue = typeof oBindingInfo === "string" ? oBindingInfo : sValue; // oBindingInfo could be an unescaped string
		var oType = DataType.getType(sType);
		if (oType) {
			if (oType instanceof DataType) {
				vValue = oType.parseValue(sValue, {
					context: oContext,
					locals: oRequireModules
				});

				// if the parsed value is not valid, we don't fail but only log an error
				if (!oType.isValid(vValue)) {
					future.errorThrows("Value '" + sValue + "' is not valid for type '" + oType.getName() + "'.");
				}
			}
			// else keep original sValue (e.g. for enums)
		} else {
			throw new Error("Property " + sName + " has unknown type " + sType);
		}

		// Note: to avoid double resolution of binding expressions, we have to escape string values once again
		return typeof vValue === "string" ? BindingInfo.escape(vValue) : vValue;
	}

	function localName(xmlNode) {
		// localName for standard browsers, nodeName in the absence of namespaces
		return xmlNode.localName || xmlNode.nodeName;
	}

	/**
	 * The official XHTML namespace. Can be used to embed XHTML in an XMLView.
	 *
	 * Note: Using this namespace prevents semantic rendering of an XMLView.
	 * @const
	 * @private
	 */
	var XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";

	/**
	 * The official XMLNS namespace. Must only be used for xmlns:* attributes.
	 * @const
	 * @private
	 */
	var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";

	/**
	 * The official SVG namespace. Can be used to embed SVG in an XMLView.
	 *
	 * Note: Using this namespace prevents semantic rendering of an XMLView.
	 * @const
	 * @private
	 */
	var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

	/**
	 * XML Namespace of the core library.
	 *
	 * This namespace is used to identify some sap.ui.core controls or entities with a special handling
	 * and for the special require attribute that can be used to load modules.
	 * @const
	 * @private
	 */
	var CORE_NAMESPACE = "sap.ui.core";

	/**
	 * XML Namespace of the mvc relevant controls in the core library.
	 *
	 * This namespace is used to identify the view tags within the sap.ui.core.mvc namespace.
	 * @const
	 * @private
	 */
	var CORE_MVC_NAMESPACE = "sap.ui.core.mvc";

	/**
	 * An XML namespace that apps can use to add custom data to a control's XML element.
	 * The name of the attribute will be used as key, the value as value of a CustomData element.
	 *
	 * This namespace is allowed for public usage.
	 * @const
	 * @private
	 */
	var CUSTOM_DATA_NAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1";

	/**
	 * An XML namespace that can be used by tooling to add attributes with support information to an element.
	 * @const
	 * @private
	 */
	var SUPPORT_INFO_NAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.support.Support.info/1";

	/**
	 * An XML namespace that denotes the XML composite definition.
	 * Processing of such nodes is skipped.
	 * @const
	 * @private
	 */
	var XML_COMPOSITE_NAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1";

	/**
	 * An XML namespace that is used for a marker attribute when a node's ID has been
	 * prefixed with the view ID (enriched). The marker attribute helps to prevent multiple prefixing.
	 *
	 * This namespace is only used inside the XMLTemplateProcessor.
	 * @const
	 * @private
	 */
	var UI5_INTERNAL_NAMESPACE = "http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1";

	/**
	 * A prefix for XML namespaces that are reserved for XMLPreprocessor extensions.
	 * Attributes with a namespace starting with this prefix, are ignored by this class.
	 * @const
	 * @private
	 */
	var PREPROCESSOR_NAMESPACE_PREFIX = "http://schemas.sap.com/sapui5/preprocessorextension/";

	/**
	 * List of attributes that are declared as "special settings" in view's metadata but can be configured on View's
	 * root tag
	 *
	 * @const
	 * @private
	 */
	var VIEW_SPECIAL_ATTRIBUTES = ['controllerName', 'resourceBundleName', 'resourceBundleUrl', 'resourceBundleLocale', 'resourceBundleAlias'];

	/**
		 * Creates a function based on the passed mode and callback which applies a callback to each child of a node.
		 * @param {function} fnCallback The callback to apply
		 * @returns {function} The created function
		 * @private
		 */
	function getHandleChildrenStrategy(fnCallback) {
		// async strategy ensures processing order by chaining the callbacks
		function asyncStrategy(node, mOptions) {
			var pChain = Promise.resolve(),
				aChildPromises = [mOptions.chain];

			for (var i = 0; i < node.childNodes.length; i++) {
				pChain = pChain.then(fnCallback.bind(null, node, node.childNodes[i], mOptions));
				aChildPromises.push(pChain);
			}
			return Promise.all(aChildPromises);
		}

		return asyncStrategy;
	}

	/**
	 * The XMLTemplateProcessor class is used to load and process Control trees in XML-declarative notation.
	 *
	 * @namespace
	 * @alias sap.ui.core.XMLTemplateProcessor
	 */
	var XMLTemplateProcessor = {};

	/**   API METHODS ***/


	/**
	 * Loads an XML template using the module loading mechanism and returns the root XML element of the XML
	 * document.
	 *
	 * @param {string} sTemplateName the template/fragment/view resource to be loaded
	 * @param {string} [sExtension] the file extension, e.g. "fragment"
	 * @return {Element} an XML document root element
	 */
	XMLTemplateProcessor.loadTemplate = function(sTemplateName, sExtension) {
		var sResourceName = sTemplateName.replace(/\./g, "/") + ("." + (sExtension || "view") + ".xml");
		return LoaderExtensions.loadResource(sResourceName).documentElement;
	};

	/**
	 * Loads an XML template using the module loading mechanism and returns a Promise, which resolves with the root XML element of the XML
	 * document.
	 *
	 * @param {string} sTemplateName the template/fragment/view resource to be loaded
	 * @param {string} [sExtension] the file extension, e.g. "fragment"
	 * @return {Promise} The promise resolves with the <code>documentElement</code> of the loaded XML file.
	 * @private
	 */
	XMLTemplateProcessor.loadTemplatePromise = function(sTemplateName, sExtension) {
		var sResourceName = sTemplateName.replace(/\./g, "/") + ("." + (sExtension || "view") + ".xml");
		return LoaderExtensions.loadResource(sResourceName, {async: true}).then(function (oResult) {
			return oResult.documentElement;
		}); // result is the document node
	};

	/**
	 * Parses special settings that are supported on the View's root tag but not declared in View's metadata. The
	 * standard properties, event handlers, aggregations and associations are parsed in the same way as the child nodes
	 * are parsed.
	 *
	 * @param {Element} xmlNode the XML element representing the View
	 * @param {sap.ui.core.mvc.XMLView} oView the View to consider when parsing the attributes
	 */
	XMLTemplateProcessor.parseViewAttributes = function(xmlNode, oView) {
		var i, attr;
		for ( i = 0; i < xmlNode.attributes.length; i++) {
			attr = xmlNode.attributes[i];
			if (VIEW_SPECIAL_ATTRIBUTES.includes(attr.name)) {
				oView["_" + attr.name] = attr.value;
			}
		}
	};

	/**
	 * Parses a complete XML template definition (full node hierarchy) and resolves the ids to their full qualification
	 *
	 * @param {Element} xmlNode the XML element representing the View/Fragment
	 * @param {sap.ui.core.mvc.XMLView|sap.ui.core.Fragment} oView the View/Fragment which corresponds to the parsed XML
	 * @return {Element} The element enriched with the full ids
	 * @protected
	 */
	XMLTemplateProcessor.enrichTemplateIds = function(xmlNode, oView) {
		XMLTemplateProcessor.enrichTemplateIdsPromise(xmlNode, oView, false);
		return xmlNode;
	};

	/**
		 * Parses a complete XML template definition (full node hierarchy) and resolves the ids to their full qualification
		 *
		 * @param {Element} xmlNode the XML element representing the View/Fragment
		 * @param {sap.ui.core.mvc.XMLView|sap.ui.core.Fragment} oView the View/Fragment which corresponds to the parsed XML
		 * @returns {Promise} which resolves with the xmlNode
		 * @private
		 */
	XMLTemplateProcessor.enrichTemplateIdsPromise = function(xmlNode, oView) {
		return parseTemplate(xmlNode, oView, true, undefined, true).then(function() {
			return xmlNode;
		});
	};

	/**
	 * Parses a complete XML template definition (full node hierarchy)
	 *
	 * @param {Element} xmlNode the XML element representing the View/Fragment
	 * @param {sap.ui.core.mvc.XMLView|sap.ui.core.Fragment} oView the View/Fragment which corresponds to the parsed XML
	 * @param {object} mSettings The settings object that is given to the view's factory method
	 * @return {Array} an array containing Controls and/or plain HTML element strings
	 */
	XMLTemplateProcessor.parseTemplate = function(xmlNode, oView, mSettings) {
		return XMLTemplateProcessor.parseTemplatePromise(xmlNode, oView, false, { settings: mSettings }).unwrap();
	};

	/**
		 * Parses a complete XML template definition (full node hierarchy)
		 *
		 * @param {Element} xmlNode the XML element representing the View/Fragment
		 * @param {sap.ui.core.mvc.XMLView|sap.ui.core.Fragment} oView the View/Fragment which corresponds to the parsed XML
		 * @param {boolean} bAsync Whether or not to perform the template processing asynchronously
		 * @param {object} oParseConfig parse configuration options, e.g. settings pre-processor
		 * @return {Promise} with an array containing Controls and/or plain HTML element strings
		 * @private
		 * @ui5-restricted sap.ui.core.Fragment, sap.ui.core.mvc.XMLView
		 */
	XMLTemplateProcessor.parseTemplatePromise = function(xmlNode, oView, _bAsync, oParseConfig) {
		return parseTemplate(xmlNode, oView, false, oParseConfig, true).then(function(vResult) {
			// vResult is the result array of the XMLTP's parsing.
			// Elements in vResult can be:
			//  * RenderManager Call (Array)
			//  * Control instance (Object)
			//  * ExtensionPoint placeholder (Object)

			// we only trigger Flex for ExtensionPoints inside Views
			// A potential ExtensionPoint provider will resolve any ExtensionPoints with their correct content (or the default content, if no flex changes exist)
			if (oView.isA("sap.ui.core.mvc.View")) {
				var vContent, i;
				// For async views all ExtensionPoints have been resolved.
				// Their resulting content needs to be spliced into the rendering array.
				// We loop backwards so we don't have to deal with index shifts (EPs can have more than 1 result control).
				for (i = vResult.length - 1; i >= 0; i--) {
					vContent = vResult[i];

					if (vContent && vContent._isExtensionPoint) {
						var aSpliceArgs = [i, 1].concat(vContent._aControls);
						Array.prototype.splice.apply(vResult, aSpliceArgs);
					}
				}
			}

			return vResult;
		});
	};

	/**
	 * Validate the parsed require context object
	 *
	 * The require context object should be an object. Every key in the object should be a valid
	 * identifier (shouldn't contain '.'). Every value in the object should be a non-empty string.
	 *
	 * @param {object} oRequireContext The parsed require context
	 * @return {string} The error message if the validation fails, otherwise it returns undefined
	 */
	function validateRequireContext(oRequireContext) {
		var sErrorMessage,
			rIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

		if (!oRequireContext || typeof oRequireContext !== "object") {
			sErrorMessage = "core:require in XMLView can't be parsed to a valid object";
		} else {
			Object.keys(oRequireContext).some(function(sKey) {
				if (!rIdentifier.test(sKey)) {
					// '.' is not allowed to use in sKey
					sErrorMessage = "core:require in XMLView contains invalid identifier: '"
						+ sKey + "'";
					return true;
				}

				if (!oRequireContext[sKey] || typeof oRequireContext[sKey] !== "string") {
					// The value should be a non-empty string
					sErrorMessage = "core:require in XMLView contains invalid value '"
						+ oRequireContext[sKey] + "'under key '" + sKey + "'";
					return true;
				}
				return false;
			});
		}

		return sErrorMessage;
	}

	/**
		 * Extract module information which is defined with the "require" attribute under "sap.ui.core" namespace
		 * and load the modules when there are some defined
		 *
		 * @param {Element} xmlNode The current XMLNode which is being processed
		 * @return {Promise|undefined} The promise resolves after all modules are loaded. If the given xml node
		 *  doesn't have require context defined, undefined is returned.
		 */
	function parseAndLoadRequireContext(xmlNode) {
		var sCoreContext = xmlNode.getAttributeNS(CORE_NAMESPACE, "require"),
			oRequireContext,
			oModules,
			sErrorMessage;

		if (sCoreContext) {
			try {
				oRequireContext = JSTokenizer.parseJS(sCoreContext);
			} catch (e) {
				Log.error("Require attribute can't be parsed on Node: ", xmlNode.nodeName);
				throw e;
			}

			sErrorMessage = validateRequireContext(oRequireContext);
			if (sErrorMessage) {
				throw new Error(sErrorMessage + " on Node: " + xmlNode.nodeName);
			}

			if (!isEmptyObject(oRequireContext)) {
				oModules = {};
				return new Promise(function(resolve, reject) {
					// check whether all modules have been loaded already, avoids nested setTimeout calls
					var bAllLoaded = Object.keys(oRequireContext).reduce(function(bAll, sKey) {
						oModules[sKey] = sap.ui.require(oRequireContext[sKey]);
						return bAll && oModules[sKey] !== undefined;
					}, true);
					if ( bAllLoaded ) {
						resolve(oModules);
						return;
					}
					// fall back to async loading
					sap.ui.require(Object.values(oRequireContext), function() {
						var aLoadedModules = arguments;
						Object.keys(oRequireContext).forEach(function(sKey, i) {
							oModules[sKey] = aLoadedModules[i];
						});
						resolve(oModules);
					}, reject);
				});
			}
		}
	}

	/**
		 * @private
		 */
	function fnTriggerExtensionPointProvider(oTargetControl, mAggregationsWithExtensionPoints) {
		var pProvider = SyncPromise.resolve();

		// if no extension points are given, we don't have to do anything here
		if (!isEmptyObject(mAggregationsWithExtensionPoints)) {
			var aAppliedExtensionPoints = [];

			// in the async case we can collect the ExtensionPointProvider promises and
			// then can delay the view.loaded() promise until all extension points are
			var fnResolveExtensionPoints;
			pProvider = new Promise(function(resolve) {
				fnResolveExtensionPoints = resolve;
			});

			Object.keys(mAggregationsWithExtensionPoints).forEach(function(sAggregationName) {
				var aExtensionPoints = mAggregationsWithExtensionPoints[sAggregationName];

				aExtensionPoints.forEach(function(oExtensionPoint) {
					oExtensionPoint.targetControl = oTargetControl;

					var fnExtClass = sap.ui.require(oExtensionPoint.providerClass);

					// apply directly if class was already loaded
					if (fnExtClass) {
						aAppliedExtensionPoints.push(fnExtClass.applyExtensionPoint(oExtensionPoint));
					} else {
						// load provider class and apply
						var p = new Promise(function(resolve, reject) {
							sap.ui.require([oExtensionPoint.providerClass], function(ExtensionPointProvider) {
								resolve(ExtensionPointProvider);
							}, reject);
						}).then(function(ExtensionPointProvider) {
							return ExtensionPointProvider.applyExtensionPoint(oExtensionPoint);
						});

						aAppliedExtensionPoints.push(p);
					}
				});
			});

			Promise.all(aAppliedExtensionPoints).then(fnResolveExtensionPoints);
		}
		return pProvider;
	}

	function findNamespacePrefix(node, namespace, prefix) {
		var sCandidate = prefix;
		for (var iCount = 0; iCount < 100; iCount++) {
			var sRegisteredNamespace = node.lookupNamespaceURI(sCandidate);
			if (sRegisteredNamespace == null || sRegisteredNamespace === namespace) {
				return sCandidate;
			}
			sCandidate = prefix + iCount;
		}
		throw new Error("Could not find an unused namespace prefix after 100 tries, giving up");
	}

	/**
		 * Parses a complete XML template definition (full node hierarchy)
		 *
		 * @param {Element} xmlNode the XML element representing the View/Fragment
		 * @param {sap.ui.core.mvc.XMLView|sap.ui.core.Fragment} oView the View/Fragment which corresponds to the parsed XML
		 * @param {boolean} bEnrichFullIds Flag for running in a mode which only resolves the ids and writes them back
		 *     to the xml source.
		 * @param {object} oParseConfig parse configuration options, e.g. settings pre-processor
		 *
		 * @return {Promise} with an array containing Controls and/or plain HTML element strings
		 */
	function parseTemplate(xmlNode, oView, bEnrichFullIds, oParseConfig) {
		// the output of the template parsing, containing strings and promises which resolve to control or control arrays
		// later this intermediate state with promises gets resolved to a flat array containing only strings and controls
		var aResult = [],
			sInternalPrefix = findNamespacePrefix(xmlNode, UI5_INTERNAL_NAMESPACE, "__ui5"),
			pResultChain = parseAndLoadRequireContext(xmlNode, true) || SyncPromise.resolve(),
			collectControl = (pContent) => aResult.push(pContent);

		Log.debug("XML will be processed " + ("asynchronously") + ".", "", "XMLTemplateProcessor");

		var bDesignMode = DesignTime.isDesignModeEnabled();
		if (bDesignMode) {
			oView._sapui_declarativeSourceInfo = {
				// the node representing the current control
				xmlNode: xmlNode,
				// the document root node
				xmlRootNode: oView._oContainingView === oView ? xmlNode :
					oView._oContainingView._sapui_declarativeSourceInfo.xmlRootNode
			};
		}
		if (!oView.isSubView()) {
			// define internal namespace on root node
			xmlNode.setAttributeNS(XMLNS_NAMESPACE, "xmlns:" + sInternalPrefix, UI5_INTERNAL_NAMESPACE);
		}

		var bWrapped = processNode(xmlNode, pResultChain);

		// iterate aResult for Promises
		// if a Promise is found splice its resolved content at the same position in aResult
		// then start over again starting with the position of the last extracted element
		//
		// Note: the index 'i' is reused for optimization
		var i = 0;
		function resolveResultPromises() {
			for (/* i = index of the unknown content */; i < aResult.length; i++) {
				var vElement = aResult[i];
				if (vElement && typeof vElement.then === 'function') {
					return vElement
						// destructive operation, the length of aResult changes
						.then(spliceContentIntoResult)
						// enter the recursion with the current index (pointing at the new content)
						.then(resolveResultPromises);
				}
			}
			return aResult;
		}

		// replace the Promise with a variable number of contents in aResult
		function spliceContentIntoResult(vContent) {
			// equivalent to aResult.apply(start, deleteCount, content1, content2...)
			var args = [i, 1].concat(vContent);
			Array.prototype.splice.apply(aResult, args);
		}

		// Post-processing of the finalized view content:
		// Once this Promise is resolved, we have the full view content available.
		// The final output of the parseTemplate call will be an array containing DOM Strings and UI5 Controls.
		// Flatten the array so that all promises are resolved and replaced.
		return pResultChain
			.then(resolveResultPromises)
			.then(function(aResult) {
				// remove the wrapper node
				if (bWrapped) {
					var oWrapper = xmlNode.parentNode;
					oWrapper.removeChild(xmlNode);

					if (oWrapper.parentNode) {
						oWrapper.parentNode.replaceChild(xmlNode, oWrapper);
					}
				}
				return aResult;
			});

		function identity(sId) {
			return sId;
		}

		function createId(sId) {
			return oView._oContainingView.createId(sId);
		}

		function createErrorInfo(node, vError) {
			var sType = oView.getMetadata().isA("sap.ui.core.mvc.View") ? "View" : "Fragment";
			var sNodeSerialization = node.outerHTML ? node.cloneNode(false).outerHTML : node.textContent;

			return "Error found in " + sType + " (id: '" + oView.getId() + "').\nXML node: '" + sNodeSerialization + "':\n" + vError;
		}

		function normalizeRootNode(node) {
			var sNodeName = localName(node),
				oWrapper;

			if (oView.isA("sap.ui.core.Fragment") && (sNodeName !== "FragmentDefinition" || node.namespaceURI !== CORE_NAMESPACE)) {
				// Wrap the content into a "FragmentDefinition" node for single control node
				oWrapper = node.ownerDocument.createElementNS(CORE_NAMESPACE, "FragmentDefinition");
			}

			if (oWrapper) {
				var oOldParent = node.parentNode;

				if (oOldParent) {
					oOldParent.replaceChild(oWrapper, node);
				}
				oWrapper.appendChild(node);
			}

			return oWrapper;
		}

		function processNode(node, pChain) {
			var bWrapped = false,
				sCurrentName = oView.sViewName || oView._sFragmentName,
				oNewRoot, sNodeName;

			if (!sCurrentName) {
				var oTopView = oView;
				var iLoopCounter = 0; // Make sure there are not infinite loops
				while (++iLoopCounter < 1000 && oTopView && oTopView !== oTopView._oContainingView) {
					oTopView = oTopView._oContainingView;
				}
				sCurrentName = oTopView.sViewName;
			}

			oNewRoot = normalizeRootNode(node);
			if (oNewRoot) {
				node = oNewRoot;
				bWrapped = true;
			}

			sNodeName = localName(node);
			if (oView.isA("sap.ui.core.mvc.XMLView")) {
				if ((sNodeName !== "View" && sNodeName !== "XMLView") || node.namespaceURI !== CORE_MVC_NAMESPACE) {
					future.errorThrows("XMLView's root node must be 'View' or 'XMLView' and have the namespace 'sap.ui.core.mvc'" + (sCurrentName ? " (View name: " + sCurrentName + ")" : ""));
				}
				// createRegularControls
				pResultChain = pChain.then(function() {
					return createRegularControls(node, oView.getMetadata().getClass(), pChain, null, { rootArea: true, rootNode: true });
				});
			} else {
				var handleChildren = getHandleChildrenStrategy(function(node, childNode, mOptions) {
					if (childNode.nodeType === 1 /* Element Node*/) {
						return createControls(childNode, mOptions.chain, null /*closest binding*/, undefined /* aggregation info*/, { rootArea: true });
					}
				}, true);

				pResultChain = pChain.then(function() {
					return handleChildren(node, {
						chain: pChain
					});
				});

			}
			return bWrapped;
		}

		function scopedRunWithOwner(fnCreation) {
			if (oView.fnScopedRunWithOwner) {
				// We need to use the already created scoped runWithOwner function from the outer view instance.
				// This way, the nested views are receiving the correct Owner component, across asynchronous calls.
				return oView.fnScopedRunWithOwner(fnCreation);
			} else {
				return fnCreation();
			}
		}

		/**
		 * Requests the control class if not loaded yet.
		 * If the View is set to async=true, an async XHR is sent, otherwise a sync XHR.
		 *
		 * @param {string} sNamespaceURI
		 * @param {string} sLocalName
		 * @returns {function|Promise|undefined} the loaded ControlClass plain or resolved from a Promise
		 */
		function findControlClass(sNamespaceURI, sLocalName) {
			var sClassName;
			var mLibraries = Library.all();
			each(mLibraries, function(sLibName, oLibrary) {
				if ( sNamespaceURI === oLibrary.namespace || sNamespaceURI === oLibrary.name ) {
					sClassName = oLibrary.name + "." + ((oLibrary.tagNames && oLibrary.tagNames[sLocalName]) || sLocalName);
				}
			});

			sClassName = sClassName || sNamespaceURI + "." + sLocalName;

			/**
			 * Validates if a control class is available and provides error feedback otherwise.
			 * @param {sap.ui.core.Control|undefined} fnClass control class or undefined if not returned as module content for its sap.ui.define factory
			 * @return {sap.ui.core.Control|undefined} the resolved class.
			 */
			function validateClass(fnClass) {
				if (!fnClass) {
					const sErrorLogMessage = `Control '${sClassName}' did not return a class definition from sap.ui.define.`;

					future.errorThrows(sErrorLogMessage, "", "XMLTemplateProcessor");
				}
				return fnClass;
			}

			var sResourceName = sClassName.replace(/\./g, "/");
			var oClassObject = sap.ui.require(sResourceName);
			if (!oClassObject) {
				return new Promise(function(resolve, reject) {
					sap.ui.require([sResourceName], function(oClassObject) {
						try {
							oClassObject = validateClass(oClassObject);
							resolve(oClassObject);
						} catch (e) {
							reject(e);
						}
					}, reject);
				});
			}
			return oClassObject;
		}

		/**
		 * Takes an arbitrary node (control or plain HTML) and creates zero or one or more SAPUI5 controls from it,
		 * iterating over the attributes and child nodes.
		 *
		 * @param {Element} node The current XMLNode which is being processed
		 * @param {Promise} pRequireContext Promise which resolves with the loaded modules from require context
		 * @param {object} [oClosestBinding] Information on the binding that is closest to currently processed control
		 *  node. Used by the flex extension-point provider to correctly trigger aggregation updates. This is necessary
		 *  for extension-points that are inside a template control of an aggregation.
		 * @param {Object} [oAggregation] The information of the aggregation to which the control being processed will be added
		 * @param {object} [oConfig] The config object that contains information which is forwarded during the recursive processing
		 * @param {boolean} [oConfig.rootArea=false] Indicates whether it's processing the root area of an XMLView
		 * @param {boolean} [oConfig.rootNode=false] Indicates whether the <code>node</code> is the root node of an XMLView's content
		 * @return {Promise} resolving to an array with 0..n controls
		 * @private
		 */
		function createControls(node, pRequireContext, oClosestBinding, oAggregation, oConfig) {
			var bRootArea = oConfig && oConfig.rootArea,
				bRenderingRelevant = bRootArea && (oView.isA("sap.ui.core.Fragment") || (oAggregation && oAggregation.name === "content")),
				pResult;

			localName(node);
			oConfig && oConfig.rootNode && oView.isSubView();

			if (node.nodeType === 1 /* ELEMENT_NODE */) {
				// Using native HTML in future is not allowed. We need to check explicitely in order to throw
				if (node.namespaceURI === XHTML_NAMESPACE || node.namespaceURI === SVG_NAMESPACE) {
					future.warningThrows(`Using native HTML content in XMLViews is deprecated.`, oView.getId());
				}
				pResult = createControlOrExtension(node, pRequireContext, oClosestBinding);
				if (bRenderingRelevant) {
					collectControl(pResult);
				}
				// non-HTML (SAPUI5) control
				// we must return the result in either bRootArea=true or the bRootArea=false case because we use the result
				// to add the control to the aggregation of its parent control
				return pResult;
			}

			return SyncPromise.resolve([]);
		}

		/**
		 * Creates 0..n UI5 controls from an XML node which is not plain HTML, but a UI5 node (either control or
		 * ExtensionPoint). One control for regular controls, zero for ExtensionPoints without configured extension
		 * and n controls for multi-root Fragments.
		 *
		 * @param {Element} node The current XMLNode which is being processed
		 * @param {Promise} pRequireContext Promise which resolves with the loaded modules from require context
		 * @param {object} [oClosestBinding] Information on the binding that is closest to currently processed control
		 *  node. Used by the flex extension-point provider to correctly trigger aggregation updates. This is necessary
		 *  for extension-points that are inside a template control of an aggregation.
		 * @return {Promise} resolving to an array with 0..n controls created from a node
		 * @private
		 */
		function createControlOrExtension(node, pRequireContext, oClosestBinding) { // this will also be extended for Fragments with multiple roots

			if (localName(node) === "ExtensionPoint" && node.namespaceURI === CORE_NAMESPACE) {

				if (bEnrichFullIds) {
					// Processing the different types of ExtensionPoints (XML, JS...) is not possible, hence
					// they are skipped as well as their potentially overwritten default content.
					return SyncPromise.resolve([]);
				} else {
					// for Views the containing View's name is required to retrieve the according extension configuration,
					// whereas for Fragments the actual Fragment's name is required - oView can be either View or Fragment
					var oContainer = oView instanceof View ? oView._oContainingView : oView;

					// The ExtensionPoint module is actually the sap.ui.extensionpoint function.
					// We still call _factory for skipping the deprecation warning.
					var fnExtensionPointFactory = ExtensionPoint._factory.bind(null, oContainer, node.getAttribute("name"), function() {
						// create extensionpoint with callback function for defaultContent - will only be executed if there is no customizing configured or if customizing is disabled
						var pChild = SyncPromise.resolve();
						var aChildControlPromises = [];
						var children = node.childNodes;
						for (var i = 0; i < children.length; i++) {
							var oChildNode = children[i];
							if (oChildNode.nodeType === 1 /* ELEMENT_NODE */) { // text nodes are ignored - plaintext inside extension points is not supported; no warning log because even whitespace is a text node
								// chain the child node creation for sequential processing
								pChild = pChild.then(createControls.bind(null, oChildNode, pRequireContext, oClosestBinding));
								aChildControlPromises.push(pChild);
							}
						}

						return SyncPromise.all(aChildControlPromises).then(function(aChildControl){
							var aDefaultContent = [];
							aChildControl.forEach(function(aControls) {
								aDefaultContent = aDefaultContent.concat(aControls);
							});
							return aDefaultContent;
						});
					}, undefined /* [targetControl] */, undefined /* [aggregationName] */, true);

					return SyncPromise.resolve(scopedRunWithOwner(fnExtensionPointFactory));
				}

			} else {
				// a plain and simple regular UI5 control
				var sLocalName = localName(node);

				// [SUPPORT-RULE]: Check, whether the control class name starts with a lower case letter
				//                 Local tag names might be in dot-notation, e.g. "<lib:table.Column />"
				var sControlName = sLocalName;
				var iControlNameStart = sLocalName.lastIndexOf(".");
				if (iControlNameStart >= 0) {
					sControlName = sLocalName.substring(iControlNameStart + 1, sLocalName.length);
				}
				if (/^[a-z].*/.test(sControlName)) {
					var sNameOrId = oView.sViewName || oView._sFragmentName || oView.getId();
					// View or Fragment
					Log.warning("View or Fragment '" + sNameOrId + "' contains a Control tag that starts with lower case '" + sControlName + "'",
						oView.getId(),
						"sap.ui.core.XMLTemplateProcessor#lowerCase"
					);
				}
				// [/SUPPORT-RULE]

				var vClass = findControlClass(node.namespaceURI, sLocalName);
				if (vClass && typeof vClass.then === 'function') {
					return vClass.then(function (fnClass) {
						return createRegularControls(node, fnClass, pRequireContext, oClosestBinding);
					});
				} else {
					// class has already been loaded
					return createRegularControls(node, vClass, pRequireContext, oClosestBinding);
				}
			}
		}

		/**
		 * Creates 0..n UI5 controls from an XML node.
		 * One control for regular controls, zero for ExtensionPoints without configured extension and
		 * n controls for multi-root Fragments.
		 *
		 * @param {Element} node The current XMLNode which is being processed
		 * @param {function} oClass The constructor of the control that is currently being processed
		 * @param {Promise} pRequireContext Promise which resolves with the loaded modules from require context
		 * @param {object} [oClosestBinding] Information on the binding that is closest to currently processed control
		 *  node. Used by the flex extension-point provider to correctly trigger aggregation updates. This is necessary
		 *  for extension-points that are inside a template control of an aggregation.
		 * @param {object} [oConfig] The config object that contains information which is forwarded during the recursive processing
		 * @param {boolean} [oConfig.rootArea=false] Indicates whether it's processing the root area of an XMLView
		 * @param {boolean} [oConfig.rootNode=false] Indicates whether the <code>node</code> is the root node of an XMLView's content
		 *
		 * @return {Promise} resolving to an array with 0..n controls created from a node
		 * @private
		 */
		function createRegularControls(node, oClass, pRequireContext, oClosestBinding, oConfig) {
			var ns = node.namespaceURI,
				mSettings = {},
				mAggregationsWithExtensionPoints = {},
				sStyleClasses = "",
				aCustomData = [],
				mCustomSettings = null,
				sSupportData = null,
				// for stashed nodes we need to ignore the following type of attributes:
				// 1. Aggregations
				//    -> might lead to the creation of bindings; also the aggregation template is removed anyway
				// 2. Associations
				//    -> might refer to controls inside the node, which have been removed earlier when the StashedControl was created
				// 3. Events
				bStashedControl = node.getAttribute("stashed") === "true",
				bRootArea = oConfig && oConfig.rootArea,
				bViewRootNode = oConfig && oConfig.rootNode,
				oRequireContext;

			// remove stashed attribute as it is an unknown property.
			if (!bEnrichFullIds) {
				node.removeAttribute("stashed");
			}

			if (!oClass) {
				return SyncPromise.resolve([]);
			}

			if (bViewRootNode) {
				// although the 'id' isn't needed for mSettings object because the view instance is already created,
				// it's still needed for the closestBinding info object
				mSettings.id = oView.getId();
			}

			var oMetadata = oClass.getMetadata();
			var mKnownSettings = oMetadata.getAllSettings();

			var pSelfRequireContext = !bRootArea ? parseAndLoadRequireContext(node, true) : undefined;

			// create new promise only when the current node has core:require defined
			if (pSelfRequireContext) {
				pRequireContext = SyncPromise.all([pRequireContext, pSelfRequireContext])
					.then(function(aRequiredModules) {
						return Object.assign({}, aRequiredModules[0], aRequiredModules[1]);
					});
			}

			pRequireContext = pRequireContext.then(function(oRequireModules) {
				if (isEmptyObject(oRequireModules)) {
					oRequireModules = null;
				}

				oRequireContext = oRequireModules;

				// [ASYNC only]: In async mode we instruct the BindingParser to resolve the Types asynchronously.
				//               The function "parseScalarType()" will then collect the Promises from the BindingParser,
				//               so that we can then wait for them later on here.
				var aTypePromises = [];

				if (!bEnrichFullIds) {
					for (var i = 0; i < node.attributes.length; i++) {
						var attr = node.attributes[i],
							sName = attr.name,
							sNamespace = attr.namespaceURI,
							oInfo = mKnownSettings[sName],
							sValue = attr.value;

						if (bViewRootNode && VIEW_SPECIAL_ATTRIBUTES.includes(sName)) {
							continue;
						}

						// apply the value of the attribute to a
						//   * property,
						//   * association (id of the control),
						//   * event (name of the function in the controller) or
						//   * CustomData element (namespace-prefixed attribute)

						if (sName === "id" && !bViewRootNode) { // "id" attribute on View's root node isn't supported
							// special handling for ID
							mSettings[sName] = getId(oView, node, sValue);

						} else if (sName === "class") {
							// special handling for CSS classes, which will be added via addStyleClass()
							sStyleClasses += sValue;

						} else if (sName === "viewName") {
							mSettings[sName] = sValue;

						} else if (sName === "fragmentName") {
							mSettings[sName] = sValue;
							mSettings['containingView'] = oView._oContainingView;

						} else if ((sName === "binding" && !oInfo) || sName === 'objectBindings' ) {
							if (!bStashedControl) {
								var oBindingInfo = BindingInfo.parse(sValue, oView._oContainingView.oController);
								// TODO reject complex bindings, types, formatters; enable 'parameters'?
								if (oBindingInfo) {
									mSettings.objectBindings = mSettings.objectBindings || {};
									mSettings.objectBindings[oBindingInfo.model || undefined] = oBindingInfo;
								}
							}
						} else if (sName === 'metadataContexts') {
							if (!bStashedControl) {
								var mMetaContextsInfo = null;

								try {
									mMetaContextsInfo = XMLTemplateProcessor._calculatedModelMapping(sValue, oView._oContainingView.oController, true);
								} catch (e) {
									future.errorThrows("" + oView + ":" + e.message);
								}

								if (mMetaContextsInfo) {
									mSettings.metadataContexts = mMetaContextsInfo;

									if (XMLTemplateProcessor._preprocessMetadataContexts) {
										XMLTemplateProcessor._preprocessMetadataContexts(oClass.getMetadata().getName(), mSettings, oView._oContainingView.oController);
									}
								}
							}
						} else if (sName.indexOf(":") > -1) {  // namespace-prefixed attribute found
							sNamespace = attr.namespaceURI;
							if (sNamespace === CUSTOM_DATA_NAMESPACE) {  // CustomData attribute found
								var sLocalName = localName(attr);
								aCustomData.push(new CustomData({
									key: sLocalName,
									value: parseScalarType("any", sValue, sLocalName, oView._oContainingView.oController, oRequireModules, aTypePromises)
								}));
							} else if (sNamespace === SUPPORT_INFO_NAMESPACE) {
								sSupportData = sValue;
							} else if (sNamespace && sNamespace.startsWith(PREPROCESSOR_NAMESPACE_PREFIX)) {
								Log.debug(oView + ": XMLView parser ignored preprocessor attribute '" + sName + "' (value: '" + sValue + "')");
							} else if (sNamespace === UI5_INTERNAL_NAMESPACE && localName(attr) === "invisible") {
								oInfo = mKnownSettings.visible;
								if (oInfo && oInfo._iKind === 0 && oInfo.type === "boolean") {
									mSettings.visible = false;
								}
							} else if (sNamespace === CORE_NAMESPACE
									   || sNamespace === UI5_INTERNAL_NAMESPACE
									   || sName.startsWith("xmlns:") ) {
								// ignore namespaced attributes that are handled by the XMLTP itself
							} else {
								// all other namespaced attributes are kept as custom settings
								if (!mCustomSettings) {
									mCustomSettings = {};
								}
								if (!mCustomSettings.hasOwnProperty(attr.namespaceURI)) {
									mCustomSettings[attr.namespaceURI] = {};
								}
								mCustomSettings[attr.namespaceURI][localName(attr)] = attr.nodeValue;
								Log.debug(oView + ": XMLView parser encountered unknown attribute '" + sName + "' (value: '" + sValue + "') with unknown namespace, stored as sap-ui-custom-settings of customData");
								// TODO: here XMLView could check for namespace handlers registered by the application for this namespace which could modify mSettings according to their interpretation of the attribute
							}

						} else if (oInfo && oInfo._iKind === 0 /* PROPERTY */ ) {
							// other PROPERTY
							mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController, oRequireModules, aTypePromises); // View._oContainingView.oController is null when [...]
							// FIXME: ._oContainingView might be the original Fragment for an extension fragment or a fragment in a fragment - so it has no controller bit ITS containingView.

						} else if (oInfo && oInfo._iKind === 1 /* SINGLE_AGGREGATION */ && oInfo.altTypes ) {
							// AGGREGATION with scalar type (altType)
							if (!bStashedControl) {
								mSettings[sName] = parseScalarType(oInfo.altTypes[0], sValue, sName, oView._oContainingView.oController, oRequireModules);
							}

						} else if (oInfo && oInfo._iKind === 2 /* MULTIPLE_AGGREGATION */ ) {
							if (!bStashedControl) {
								var oBindingInfo = BindingInfo.parse(sValue, oView._oContainingView.oController, false, false, false, false, oRequireModules);
								if ( oBindingInfo ) {
									mSettings[sName] = oBindingInfo;
								} else {
									future.errorThrows("" + oView + ": aggregations with cardinality 0..n specifies a non valid BindingInfo (wrong value: " + sName + "='" + sValue + "')");
								}
							}

						} else if (oInfo && oInfo._iKind === 3 /* SINGLE_ASSOCIATION */ ) {
							// ASSOCIATION
							if (!bStashedControl) {
								mSettings[sName] = createId(sValue); // use the value as ID
							}

						} else if (oInfo && oInfo._iKind === 4 /* MULTIPLE_ASSOCIATION */ ) {
							// we support "," and " " to separate IDs and filter out empty IDs
							if (!bStashedControl) {
								mSettings[sName] = sValue.split(/[\s,]+/g).filter(identity).map(createId);
							}

						} else if (oInfo && oInfo._iKind === 5 /* EVENT */ ) {
							// EVENT
							if (!bStashedControl) {
								var aEventHandlers = [];

								EventHandlerResolver.parse(sValue).forEach(function (sEventHandler) { // eslint-disable-line no-loop-func
									var vEventHandler = EventHandlerResolver.resolveEventHandler(sEventHandler, oView._oContainingView.oController, oRequireModules); // TODO: can this be made async? (to avoid the hard resolver dependency)
									if (vEventHandler) {
										aEventHandlers.push(vEventHandler);
									} else  {
										future.warningThrows("" + oView + ": event handler function \"" + sEventHandler + "\" is not a function or does not exist in the controller.");
									}
								});

								if (aEventHandlers.length) {
									mSettings[sName] = aEventHandlers;
								}
							}
						} else if (oInfo && oInfo._iKind === -1) {
							// SPECIAL SETTING - currently only allowed for:
							// - View's async setting
							if (oMetadata.isA("sap.ui.core.mvc.View") && sName == "async") {
								mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController, oRequireModules);
							} else {
								future.warningThrows("" + oView + ": setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "') is not supported");
							}
						} else {
							future.assertThrows(sName === 'xmlns', oView + ": encountered unknown setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "')");
							if (XMLTemplateProcessor._supportInfo) {
								XMLTemplateProcessor._supportInfo({
									context : node,
									env : {
										caller:"createRegularControls",
										error: true,
										info: "unknown setting '" + sName + "' for class " + oMetadata.getName()
									}
								});
							}
						}
					}
					//add custom settings as custom data "sap-ui-custom-settings"
					if (mCustomSettings) {
						aCustomData.push(new CustomData({
							key:"sap-ui-custom-settings",
							value: mCustomSettings
						}));
					}
					if (aCustomData.length > 0) {
						mSettings.customData = aCustomData;
					}
				}

				// aTypePromises is only filled when we run in async mode, so we don't need to use SyncPromise here
				if (Array.isArray(aTypePromises)) {
					return Promise.all(aTypePromises).then(function() { return oRequireModules; });
				}

				return oRequireModules;
			}).catch(function(oError) {
				// Errors caught here are expected UI5 issues, e.g. DataType errors, broken BindingSyntax, missing event handler functions etc.
				// we enrich the error message with XML information, e.g. the node causing the issue
				if (!oError.isEnriched) {
					// Logging the error like this cuts away the stack trace,
					// but provides better information for applications.
					// For Framework debugging, we would have to look at the error object anyway.
					oError = new Error(createErrorInfo(node, oError));
					oError.isEnriched = true;

					// TODO: Can be enriched with additional info for a support rule (not yet implemented)
					Log.error(oError);
				}

				throw oError;
			});

			/**
			 * The way how handleChildren works determines parallel or sequential processing
			 *
			 * @return {Promise} resolving to an array with 0..n controls created from a node
			 * @private
			 */
			// the actual handleChildren function depends on the processing mode
			var handleChildren = getHandleChildrenStrategy(handleChild, true);

			/**
			 * @return {Promise} resolving to an array with 0..n controls created from a node
			 * @private
			 */
			function handleChild(node, childNode, mOptions) {
				var oAggregation = mOptions.aggregation,
					mAggregations = mOptions.allAggregations,
					pRequireContext = mOptions.chain,
					oClosestBinding = mOptions.closestBinding,
					oConfig = mOptions.config,
					oNamedAggregation,
					fnCreateStashedControl;

				// inspect only element nodes
				if (childNode.nodeType === 1 /* ELEMENT_NODE */) {

					if (childNode.namespaceURI === XML_COMPOSITE_NAMESPACE) {
						mSettings[localName(childNode)] = childNode.querySelector("*");
						return undefined;
					}
					// check for a named aggregation (must have the same namespace as the parent and an aggregation with the same name must exist)
					oNamedAggregation = childNode.namespaceURI === ns && mAggregations && mAggregations[localName(childNode)];

					if (oNamedAggregation) {
						// the children of the current childNode are aggregated controls (or HTML) below the named aggregation
						return handleChildren(childNode, {
							aggregation: oNamedAggregation,
							allAggregations: null,
							chain: pRequireContext,
							closestBinding: oClosestBinding,
							config: oConfig
						});
					} else if (oAggregation) {
						// TODO consider moving this to a place where HTML and SVG nodes can be handled properly
						// create a StashedControl for inactive controls, which is not placed in an aggregation
						if (childNode.getAttribute("stashed") === "true" && !bEnrichFullIds) {
							var oStashedNode = childNode;
							// clone the node and remove all descendants
							childNode = childNode.cloneNode();
							// remove stashed attribute as it is an unknown property.
							oStashedNode.removeAttribute("stashed");
							fnCreateStashedControl = function() {
								var sControlId = getId(oView, childNode);

								StashedControlSupport.createStashedControl({
									wrapperId: sControlId,
									fnCreate: function(bSync) {
										setUI5Attribute(oStashedNode, "unstash");
										const vUnstashedControl = handleChild(node, oStashedNode, {
											aggregation: oAggregation,
											allAggregations: mAggregations,
											chain: SyncPromise.resolve(oRequireContext),
											closestBinding: oClosestBinding
										});
										return vUnstashedControl;
									}
								});
							};

							scopedRunWithOwner(fnCreateStashedControl);

							// ...and mark the stashed node as invisible.
							// The original visibility value is still scoped in the clone (visible could be bound, yet stashed controls are never visible)
							childNode.removeAttribute("visible");
							setUI5Attribute(childNode, "invisible");
						}

						if ( mSettings[oAggregation.name] &&
							// whether the created controls will be the template for a list binding
							typeof mSettings[oAggregation.name].path === "string") {
							oClosestBinding = {
								aggregation: oAggregation.name,
								id: mSettings.id
							};

							// mark that the content aggregation of the View node is bound
							if (bViewRootNode && oAggregation.name === "content") {
								oConfig = oConfig || {};
								oConfig.contentBound = true;
							}
						}

						// child node name does not equal an aggregation name,
						// so this child must be a control (or HTML) which is aggregated below the DEFAULT aggregation
						return createControls(childNode, pRequireContext, oClosestBinding, oAggregation, oConfig).then(function(aControls) {
							for (var j = 0; j < aControls.length; j++) {
								var oControl = aControls[j];
								// append the child to the aggregation
								var name = oAggregation.name;

								// oControl is an ExtensionPoint placeholder
								// only in Flexibility scenario if an ExtensionProvider is given!
								if (oControl._isExtensionPoint) {
									if (!mSettings[name]) {
										mSettings[name] = [];
									}

									var aExtensionPointList = mAggregationsWithExtensionPoints[name];
									if (!aExtensionPointList) {
										aExtensionPointList = mAggregationsWithExtensionPoints[name] = [];
									}
									// if the aggregation already exists we get the
									oControl.index = mSettings[name].length;
									oControl.aggregationName = name;
									oControl.closestAggregationBindingCarrier = oClosestBinding && oClosestBinding.id; // TODO can we safely assume that this has an "id"?
									oControl.closestAggregationBinding = oClosestBinding && oClosestBinding.aggregation;

									// connect extension points
									var oLast = aExtensionPointList[aExtensionPointList.length - 1];
									if (oLast) {
										oLast._nextSibling = oControl;
									}

									aExtensionPointList.push(oControl);
								} else if (oAggregation.multiple) {
									// 1..n AGGREGATION
									if (!mSettings[name]) {
										mSettings[name] = [];
									}
									if (typeof mSettings[name].path === "string") {
										assert(!mSettings[name].template, "list bindings support only a single template object");
										mSettings[name].template = oControl;
									} else {
										mSettings[name].push(oControl);
									}
								} else {
									// 1..1 AGGREGATION
									assert(!mSettings[name], "multiple aggregates defined for aggregation with cardinality 0..1");
									mSettings[name] = oControl;
								}
							}
							return aControls;
						});
					} else {
						throw new Error(createErrorInfo(childNode, "Cannot add direct child without default aggregation defined for control " + oMetadata.getElementName()));
					}
				} else if (childNode.nodeType === 3 /* TEXT_NODE */) {
					if (oConfig && oConfig.rootArea) {
						createControls(childNode, pRequireContext, oClosestBinding, oAggregation, oConfig);
					} else {
						var sTextContent = childNode.textContent || childNode.text;
						if (sTextContent && sTextContent.trim()) { // whitespace would be okay
							throw new Error(createErrorInfo(childNode, "Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed."));
						}
					}
				} // other nodes types are silently ignored

			}

			// loop child nodes and handle all AGGREGATIONS
			var oAggregation = oMetadata.getDefaultAggregation();
			var mAggregations = oMetadata.getAllAggregations();

			return handleChildren(node, {
				aggregation: oAggregation,
				allAggregations: mAggregations,
				chain: pRequireContext,
				closestBinding: oClosestBinding,
				config: oConfig
			}).then(function() {
				// apply the settings to the control
				var vNewControlInstance;
				var pProvider = SyncPromise.resolve();
				var pInstanceCreated = SyncPromise.resolve();
				var sType = node.getAttribute("type");

				var oOwnerComponent = Component.getOwnerComponentFor(oView);
				var bIsAsyncComponent = oOwnerComponent && oOwnerComponent.isA("sap.ui.core.IAsyncContentCreation");

				if (bEnrichFullIds) {
					if (!bRootArea && node.hasAttribute("id")) {
						setId(oView, node);
					}
				} else if (!bViewRootNode && oClass.getMetadata().isA("sap.ui.core.mvc.View")) {
					if (!oClass._sType && !mSettings.viewName) {
						// Add module view name
						mSettings.viewName = "module:" + oClass.getMetadata().getName().replace(/\./g, "/");
					}

					mSettings.type = oClass._sType || sType;

					// legacy check: async=false is not supported with an async-component
					if (bIsAsyncComponent && mSettings.async === false) {
						throw new Error(
							"A nested view contained in a Component implementing 'sap.ui.core.IAsyncContentCreation' is processed asynchronously by default and cannot be processed synchronously.\n" +
							"Affected Component '" + oOwnerComponent.getMetadata().getComponentName() + "' and View '" + mSettings.viewName + "'."
						);
					}

					pInstanceCreated = scopedRunWithOwner(function() {
						return View.create(mSettings);
					});
				} else if (oClass.getMetadata().isA("sap.ui.core.Fragment")) {
					var sFragmentPath = "sap/ui/core/Fragment";
					var Fragment = sap.ui.require(sFragmentPath);

					// call Fragment.load with mSettings.name
					mSettings.name = mSettings.name || mSettings.fragmentName;

					if (Fragment) {
						pInstanceCreated = Fragment.load(mSettings);
					} else {
						pInstanceCreated = new Promise(function (resolve, reject) {
							sap.ui.require([sFragmentPath], function (Fragment) {
								Fragment.load(mSettings).then(function (oFragmentContent) {
									resolve(oFragmentContent);
								});
							}, reject);
						});
					}
				} else {
					// call the control constructor with the according owner in scope
					var fnCreateInstance = function() {
						var oInstance;

						if (bViewRootNode) {
							oInstance = oView;
							oView.applySettings(mSettings);
						} else {
							// the scoped runWithOwner function is only during ASYNC processing!
							oInstance = scopedRunWithOwner(function () {
								var oInstance;
								if (node.getAttributeNS(UI5_INTERNAL_NAMESPACE, "unstash") === "true") {
									oInstance = ElementRegistry.get(mSettings.id);
									// If the placeholder has a visible property we set it to false to hide the placeholder.
									// We must reset the setting to true to make it visible again or reflect the new settings.
									if (oInstance.setVisible) {
										oInstance.setVisible(true);
									}
									oInstance.applySettings(mSettings);
								} else {
									oInstance = new oClass(mSettings);
								}
								return oInstance;
							});
						}

						// check if we need to hand the ExtensionPoint info to the ExtensionProvider
						pProvider = fnTriggerExtensionPointProvider(oInstance, mAggregationsWithExtensionPoints, true);

						return oInstance;
					};

					if (oParseConfig && oParseConfig.fnRunWithPreprocessor) {
						vNewControlInstance = oParseConfig.fnRunWithPreprocessor(fnCreateInstance);
					} else {
						vNewControlInstance = fnCreateInstance();
					}
				}

				return pInstanceCreated.then(function (vContent) {
					return vContent || vNewControlInstance;
				}).then(function (vFinalInstance) {
					if (sStyleClasses && vFinalInstance.addStyleClass) {
						// Elements do not have a style class!
						vFinalInstance.addStyleClass(sStyleClasses);
					}

					if (!vFinalInstance) {
						vFinalInstance = [];
					} else if (!Array.isArray(vFinalInstance)) {
						vFinalInstance = [vFinalInstance];
					}

					//apply support info if needed
					if (XMLTemplateProcessor._supportInfo && vFinalInstance) {
						for (var i = 0, iLength = vFinalInstance.length; i < iLength; i++) {
							var oInstance = vFinalInstance[i];
							if (oInstance && oInstance.getId()) {
								//create a support info for id creation and add it to the support data
								var iSupportIndex = XMLTemplateProcessor._supportInfo({ context: node, env: { caller: "createRegularControls", nodeid: node.getAttribute("id"), controlid: oInstance.getId() } }),
									sData = sSupportData ? sSupportData + "," : "";
								sData += iSupportIndex;
								//add the controls support data to the indexed map of support info control instance map
								XMLTemplateProcessor._supportInfo.addSupportInfo(oInstance.getId(), sData);
							}
						}
					}

					if (bDesignMode) {
						vFinalInstance.forEach(function (oInstance) {
							if (oMetadata.getCompositeAggregationName) {
								var aNodes = node.getElementsByTagName(oInstance.getMetadata().getCompositeAggregationName());
								for (var i = 0; i < aNodes.length; i++) {
									node.removeChild(aNodes[0]);
								}
							}
							oInstance._sapui_declarativeSourceInfo = {
								xmlNode: node,
								xmlRootNode: oView._sapui_declarativeSourceInfo.xmlRootNode,
								fragmentName: oMetadata.getName() === 'sap.ui.core.Fragment' ? mSettings['fragmentName'] : null
							};
						});
					}

					return pProvider.then(function () {
						// either resolve with fragment or control instance
						return vFinalInstance;
					});
				});
			});

		}

		function setUI5Attribute(node, name) {
			var sPrefix = findNamespacePrefix(node, UI5_INTERNAL_NAMESPACE, sInternalPrefix);
			node.setAttributeNS(UI5_INTERNAL_NAMESPACE, sPrefix + ":" + name, "true");
		}

		function getId(oView, xmlNode, sId) {
			if (xmlNode.getAttributeNS(UI5_INTERNAL_NAMESPACE, "id")) {
				return xmlNode.getAttribute("id");
			} else {
				return createId(sId ? sId : xmlNode.getAttribute("id"));
			}
		}

		function setId(oView, xmlNode) {
			xmlNode.setAttribute("id", createId(xmlNode.getAttribute("id")));
			setUI5Attribute(xmlNode, "id");
		}
	}

	/**
	 * Preprocessor for special setting metadataContexts.
	 * Needs to be re-implemented.
	 *
	 * @param {string} sClassName - The class of the control to be created
	 * @param {object} oNode - The settings
	 * @param {object} oContext - The current context of the control
	 * @private
	 */
	XMLTemplateProcessor._preprocessMetadataContexts = null;

	/**
	 * Create a named map for models and binding
	 *
	 * @param {string} sBinding The string value of a complex binding containing one or more models
	 * @param {object} oContext - The current context (controller)
	 * @param {boolean} bAllowMultipleBindings - Whether to allow multiple bindings
	 *
	 * @returns {object} a named map keyed by model name
	 */
	XMLTemplateProcessor._calculatedModelMapping = function(sBinding, oContext, bAllowMultipleBindings) {
		var oCtx,
			mBinding = {},
			oBinding = BindingInfo.parse(sBinding, oContext);

		function checkFormatter(aFragments) {
			// the pattern must be /d,/d,/d
			// => aFragments.length is even
			if (aFragments.length % 2 === 0) {
				throw new Error("The last entry is no binding");
			}

			// must start with a number
			for (var i = 1; i <= aFragments.length; i = i + 2) {
				if (typeof aFragments[i - 1] == 'string') {
					throw new Error("Binding expected not a string");
				}

				if (aFragments[i]) {
					if ((typeof aFragments[i] != 'string') || (aFragments[i] != ",")) {
						throw new Error("Missing delimiter ','");
					}
				}
			}
		}

		// check the formatter

		if (oBinding) {
			if (!oBinding.formatter) {
				oCtx = oBinding;
				oBinding = {parts: [oCtx]};
			} else {
				//check the text Arrangements
				checkFormatter(oBinding.formatter.textFragments);
				//only allow a number at the binding
			}

			for (var i = 0; i < oBinding.parts.length; i++) {
				oCtx = oBinding.parts[i];
				mBinding[oCtx.model] = mBinding[oCtx.model] || (bAllowMultipleBindings ? [] : null);

				if (Array.isArray(mBinding[oCtx.model])) {
					mBinding[oCtx.model].push(oCtx);
				} else {
					// error when two contexts of overrule???
					mBinding[oCtx.model] = oCtx;
				}
			}
		}

		return mBinding;
	};

	return XMLTemplateProcessor;
});
