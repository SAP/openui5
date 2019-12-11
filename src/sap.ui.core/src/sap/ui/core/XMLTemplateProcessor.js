/*!
 * ${copyright}
 */

/*global HTMLTemplateElement, DocumentFragment, Promise*/

sap.ui.define([
	'sap/ui/thirdparty/jquery',
	'sap/ui/base/DataType',
	'sap/ui/base/ManagedObject',
	'sap/ui/core/CustomData',
	'./mvc/View',
	'./mvc/EventHandlerResolver',
	'./ExtensionPoint',
	'./StashedControlSupport',
	'sap/ui/base/SyncPromise',
	'sap/base/Log',
	'sap/base/util/ObjectPath',
	'sap/base/util/values',
	'sap/base/assert',
	'sap/base/security/encodeXML',
	'sap/base/util/LoaderExtensions',
	'sap/base/util/JSTokenizer',
	'sap/base/util/isEmptyObject'
],
function(
	jQuery,
	DataType,
	ManagedObject,
	CustomData,
	View,
	EventHandlerResolver,
	ExtensionPoint,
	StashedControlSupport,
	SyncPromise,
	Log,
	ObjectPath,
	values,
	assert,
	encodeXML,
	LoaderExtensions,
	JSTokenizer,
	isEmptyObject
) {
	"use strict";

	function parseScalarType(sType, sValue, sName, oContext, oRequireModules) {
		// check for a binding expression (string)
		var oBindingInfo = ManagedObject.bindingParser(sValue, oContext, /*bUnescape*/true,
			/*bTolerateFunctionsNotFound*/false, /*bStaticContext*/false, /*bPreferContext*/false,
			oRequireModules);

		if ( oBindingInfo && typeof oBindingInfo === "object" ) {
			return oBindingInfo;
		}

		var vValue = sValue = oBindingInfo || sValue; // oBindingInfo could be an unescaped string
		var oType = DataType.getType(sType);
		if (oType) {
			if (oType instanceof DataType) {
				vValue = oType.parseValue(sValue, {
					context: oContext,
					locals: oRequireModules
				});

				// if the parsed value is not valid, we don't fail but only log an error
				if (!oType.isValid(vValue)) {
					Log.error("Value '" + sValue + "' is not valid for type '" + oType.getName() + "'.");
				}
			}
			// else keep original sValue (e.g. for enums)
		} else {
			throw new Error("Property " + sName + " has unknown type " + sType);
		}

		// Note: to avoid double resolution of binding expressions, we have to escape string values once again
		return typeof vValue === "string" ? ManagedObject.bindingParser.escape(vValue) : vValue;
	}

	function localName(xmlNode) {
		// localName for standard browsers, baseName for IE, nodeName in the absence of namespaces
		return xmlNode.localName || xmlNode.baseName || xmlNode.nodeName;
	}

	/**
	 * Unwraps the given SyncPromise and synchronously returns the resolution value.
	 * @param {SyncPromise} pSyncPromise The promise to unwrap
	 * @returns {*} the resolution value of the SyncPromise
	 * @throws An Error if the SyncPromise was rejected
	 * @private
	 */
	function unwrapSyncPromise(pSyncPromise) {
		// unwrap SyncPromise resolve value
		if (pSyncPromise.isRejected()) {
			// sync promises store the error within the result if they are rejected
			throw pSyncPromise.getResult();
		}
		return pSyncPromise.getResult();
	}

	/**
	 * Creates a function based on the passed mode and callback which applies a callback to each child of a node.
	 * @param {boolean} bAsync The strategy to choose
	 * @param {function} fnCallback The callback to apply
	 * @returns {function} The created function
	 * @private
	 */
	function getHandleChildrenStrategy(bAsync, fnCallback) {

		// sync strategy ensures processing order by just being sync
		function syncStrategy(node, oAggregation, mAggregations, pRequireContext) {
			var childNode,
				vChild,
				aChildren = [];

			for (childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
				vChild = fnCallback(node, oAggregation, mAggregations, childNode, false, pRequireContext);
				if (vChild) {
					aChildren.push(unwrapSyncPromise(vChild));
				}
			}
			return SyncPromise.resolve(aChildren);
		}

		// async strategy ensures processing order by chaining the callbacks
		function asyncStrategy(node, oAggregation, mAggregations, pRequireContext) {
			var childNode,
				pChain = Promise.resolve(),
				aChildPromises = [pRequireContext];

			for (childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {
				pChain = pChain.then(fnCallback.bind(null, node, oAggregation, mAggregations, childNode, false, pRequireContext));
				aChildPromises.push(pChain);
			}
			return Promise.all(aChildPromises);
		}

		return bAsync ? asyncStrategy : syncStrategy;
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
	 * Parses only the attributes of the XML root node (View!) and fills them into the given settings object.
	 * Children are parsed later on after the controller has been set.
	 * TODO cannot handle event handlers in the root node
	 *
	 * @param {Element} xmlNode the XML element representing the View
	 * @param {sap.ui.core.mvc.XMLView} oView the View to consider when parsing the attributes
	 * @param {object} mSettings the settings object which should be enriched with the suitable attributes from the XML node
	 * @return undefined
	 */
	XMLTemplateProcessor.parseViewAttributes = function(xmlNode, oView, mSettings) {

		var mAllProperties = oView.getMetadata().getAllProperties();
		for ( var i = 0; i < xmlNode.attributes.length; i++) {
			var attr = xmlNode.attributes[i];
			if (attr.name === 'controllerName') {
				oView._controllerName = attr.value;
			} else if (attr.name === 'resourceBundleName') {
				oView._resourceBundleName =  attr.value;
			} else if (attr.name === 'resourceBundleUrl') {
				oView._resourceBundleUrl =  attr.value;
			} else if (attr.name === 'resourceBundleLocale') {
				oView._resourceBundleLocale =  attr.value;
			} else if (attr.name === 'resourceBundleAlias') {
				oView._resourceBundleAlias =  attr.value;
			} else if (attr.name === 'class') {
				oView.addStyleClass(attr.value);
			} else if (!mSettings[attr.name] && mAllProperties[attr.name]) {
				mSettings[attr.name] = parseScalarType(mAllProperties[attr.name].type, attr.value, attr.name, oView._oContainingView.oController);
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
	 * @param {boolean} bAsync Whether or not to perform the template processing asynchronously
	 * @returns {Promise} which resolves with the xmlNode
	 * @private
	 */
	XMLTemplateProcessor.enrichTemplateIdsPromise = function (xmlNode, oView, bAsync) {
		return parseTemplate(xmlNode, oView, true, bAsync).then(function() {
			return xmlNode;
		});
	};

	/**
	 * Parses a complete XML template definition (full node hierarchy)
	 *
	 * @param {Element} xmlNode the XML element representing the View/Fragment
	 * @param {sap.ui.core.mvc.XMLView|sap.ui.core.Fragment} oView the View/Fragment which corresponds to the parsed XML
	 * @return {Array} an array containing Controls and/or plain HTML element strings
	 */
	XMLTemplateProcessor.parseTemplate = function(xmlNode, oView) {
		return unwrapSyncPromise(XMLTemplateProcessor.parseTemplatePromise(xmlNode, oView, false));
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
	 */
	XMLTemplateProcessor.parseTemplatePromise = function(xmlNode, oView, bAsync, oParseConfig) {
		return parseTemplate(xmlNode, oView, false, bAsync, oParseConfig);
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
					sErrorMessage = "core:require in XMLView contains invalide value '"
						+ oRequireContext[sKey] + "'under key '" + sKey + "'";
					return true;
				}
			});
		}

		return sErrorMessage;
	}

	/**
	 * Extract module information which is defined with the "require" attribute under "sap.ui.core" namespace
	 * and load the modules when there are some defined
	 *
	 * @param {Element} xmlNode The current XMLNode which is being processed
	 * @param {boolean} bAsync Whether the view is processed asynchronously
	 *
	 * @return {promise|undefined} The promise resolves after all modules are loaded. If the given xml node
	 *  doesn't have require context defined, undefined is returned.
	 */
	function parseAndLoadRequireContext(xmlNode, bAsync) {
		var sCoreContext = xmlNode.getAttributeNS("sap.ui.core", "require"),
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
				if (bAsync) {
					return new Promise(function(resolve, reject) {
						sap.ui.require(values(oRequireContext), function() {
							var aLoadedModules = arguments;
							Object.keys(oRequireContext).forEach(function(sKey, i) {
								oModules[sKey] = aLoadedModules[i];
							});
							resolve(oModules);
						}, reject);
					});
				} else {
					Object.keys(oRequireContext).forEach(function(sKey) {
						oModules[sKey] = sap.ui.requireSync(oRequireContext[sKey]);
					});

					return SyncPromise.resolve(oModules);
				}
			}
		}
	}

	/**
	 * Parses a complete XML template definition (full node hierarchy)
	 *
	 * @param {Element} xmlNode the XML element representing the View/Fragment
	 * @param {sap.ui.core.mvc.XMLView|sap.ui.core.Fragment} oView the View/Fragment which corresponds to the parsed XML
	 * @param {boolean} bEnrichFullIds Flag for running in a mode which only resolves the ids and writes them back
	 *     to the xml source.
	 * @param {boolean} bAsync Whether or not to perform the template processing asynchronously.
	 *     The async processing will only be active in conjunction with the internal XML processing mode set to <code>sequential</code>.
	 *     The processing mode "sequential" is implicitly activated for the following type of async views:
	 *      a) root views in the manifest
	 *      b) XMLViews created with the (XML)View.create factory
	 *      c) XMLViews used via routing
	 *     Additionally all declarative nested subviews (and in future: fragments) are also processed asynchronously.
	 * @param {object} oParseConfig parse configuration options, e.g. settings pre-processor
	 *
	 * @return {Promise} with an array containing Controls and/or plain HTML element strings
	 */
	function parseTemplate(xmlNode, oView, bEnrichFullIds, bAsync, oParseConfig) {
		// the output of the template parsing, containing strings and promises which resolve to control or control arrays
		// later this intermediate state with promises gets resolved to a flat array containing only strings and controls
		var aResult = [],
			pResultChain = parseAndLoadRequireContext(xmlNode, bAsync) || SyncPromise.resolve();

		bAsync = bAsync && oView._sProcessingMode === "sequential";
		Log.debug("XML processing mode is " + (bAsync ? "sequential" : "default"), "", "XMLTemplateProcessor");

		var bDesignMode = sap.ui.getCore().getConfiguration().getDesignMode();
		if (bDesignMode) {
			oView._sapui_declarativeSourceInfo = {
				// the node representing the current control
				xmlNode: xmlNode,
				// the document root node
				xmlRootNode: oView._oContainingView === oView ? xmlNode :
					oView._oContainingView._sapui_declarativeSourceInfo.xmlRootNode
			};
		}
		var sCurrentName = oView.sViewName || oView._sFragmentName; // TODO: should Fragments and Views be separated here?
		if (!sCurrentName) {
			var oTopView = oView;
			var iLoopCounter = 0; // Make sure there are not infinite loops
			while (++iLoopCounter < 1000 && oTopView && oTopView !== oTopView._oContainingView) {
				oTopView = oTopView._oContainingView;
			}
			sCurrentName = oTopView.sViewName;
		}

		if (oView.isSubView()) {
			parseNode(xmlNode, true, false, pResultChain);
		} else {
			if (xmlNode.localName === "View" && xmlNode.namespaceURI !== "sap.ui.core.mvc") {
				// it's not <core:View>, it's <mvc:View> !!!
				Log.warning("XMLView root node must have the 'sap.ui.core.mvc' namespace, not '" + xmlNode.namespaceURI + "'" + (sCurrentName ? " (View name: " + sCurrentName + ")" : ""));
			}
			parseChildren(xmlNode, false, false, pResultChain);
		}

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
		return pResultChain.then(resolveResultPromises);

		function identity(sId) {
			return sId;
		}

		function createId(sId) {
			return oView._oContainingView.createId(sId);
		}

		/**
		 * Parses an XML node that might represent a UI5 control or simple XHTML.
		 * XHTML will be added to the aResult array as a sequence of strings,
		 * UI5 controls will be instantiated and added as controls
		 *
		 * @param {Element} xmlNode the XML node to parse
		 * @param {boolean} bRoot whether this node is the root node
		 * @param {boolean} bIgnoreTopLevelTextNodes
		 * @param {Promise} pRequireContext Promise which resolves with the loaded modules from require context
		 * @returns {Promise} resolving with the content of the parsed node, which is a tree structure containing DOM Strings & UI5 Controls
		 */
		function parseNode(xmlNode, bRoot, bIgnoreTopLevelTextNodes, pRequireContext) {

			if ( xmlNode.nodeType === 1 /* ELEMENT_NODE */ ) {

				var sLocalName = localName(xmlNode);
				if (xmlNode.namespaceURI === "http://www.w3.org/1999/xhtml" || xmlNode.namespaceURI === "http://www.w3.org/2000/svg") {
					// write opening tag
					aResult.push("<" + sLocalName + " ");
					// write attributes
					var bHasId = false;
					for (var i = 0; i < xmlNode.attributes.length; i++) {
						var attr = xmlNode.attributes[i];
						var value = attr.value;
						if (attr.name === "id") {
							bHasId = true;
							value = getId(oView, xmlNode);
						}
						aResult.push(attr.name + "=\"" + encodeXML(value) + "\" ");
					}
					if ( bRoot === true ) {
						aResult.push("data-sap-ui-preserve" + "=\"" + oView.getId() + "\" ");
						if (!bHasId) {
							aResult.push("id" + "=\"" + oView.getId() + "\" ");
						}
					}
					aResult.push(">");

					// write children
					var oContent = xmlNode;
					if (window.HTMLTemplateElement && xmlNode instanceof HTMLTemplateElement && xmlNode.content instanceof DocumentFragment) {
						// <template> support (HTMLTemplateElement has no childNodes, but a content node which contains the childNodes)
						oContent = xmlNode.content;
					}

					parseChildren(oContent, false, false, pRequireContext);
					aResult.push("</" + sLocalName + ">");


				} else if (sLocalName === "FragmentDefinition" && xmlNode.namespaceURI === "sap.ui.core") {
					// a Fragment element - which is not turned into a control itself. Only its content is parsed.
					parseChildren(xmlNode, false, true, pRequireContext);
					// TODO: check if this branch is required or can be handled by the below one

				} else {

					// assumption: an ELEMENT_NODE with non-XHTML namespace is an SAPUI5 control and the namespace equals the library name
					pResultChain = pResultChain.then(function() {
						// Chaining the Promises as we need to make sure the order in which the XML DOM nodes are processed is fixed (depth-first, pre-order).
						// The order of processing (and Promise resolution) is mandatory for keeping the order of the UI5 Controls' aggregation fixed and compatible.
						return createControlOrExtension(xmlNode, pRequireContext).then(function(aChildControls) {
							for (var i = 0; i < aChildControls.length; i++) {
							var oChild = aChildControls[i];
								if (oView.getMetadata().hasAggregation("content")) {
									oView.addAggregation("content", oChild);
								// can oView really have an association called "content"?
								} else if (oView.getMetadata().hasAssociation(("content"))) {
									oView.addAssociation("content", oChild);
								}
							}
							return aChildControls;
						});
					});
					aResult.push(pResultChain);

				}

			} else if (xmlNode.nodeType === 3 /* TEXT_NODE */ && !bIgnoreTopLevelTextNodes) {

				var text = xmlNode.textContent || xmlNode.text,
					parentName = localName(xmlNode.parentNode);
				if (text) {
					if (parentName != "style") {
						text = encodeXML(text);
					}
					aResult.push(text);
				}

			}
		}

		/**
		 * Parses the children of an XML node.
		 *
		 * @param {Element} xmlNode the xml node which will be parsed
		 * @param {boolean} bRoot
		 * @param {boolean} bIgnoreToplevelTextNodes
		 * @param {Promise} pRequireContext Promise which resolves with the loaded modules from require context
		 * @returns {Promise[]} each resolving to the according child nodes content
		 */
		function parseChildren(xmlNode, bRoot, bIgnoreToplevelTextNodes, pRequireContext) {
			var children = xmlNode.childNodes;
			for (var i = 0; i < children.length; i++) {
				parseNode(children[i], bRoot, bIgnoreToplevelTextNodes, pRequireContext);
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
			var mLibraries = sap.ui.getCore().getLoadedLibraries();
			jQuery.each(mLibraries, function(sLibName, oLibrary) {
				if ( sNamespaceURI === oLibrary.namespace || sNamespaceURI === oLibrary.name ) {
					sClassName = oLibrary.name + "." + ((oLibrary.tagNames && oLibrary.tagNames[sLocalName]) || sLocalName);
				}
			});
			// TODO guess library from sNamespaceURI and load corresponding lib!?
			sClassName = sClassName || sNamespaceURI + "." + sLocalName;

			// ensure that control and library are loaded
			function getObjectFallback(oClassObject) {
				// some modules might not return a class definition, so we fallback to the global
				// this is against the AMD definition, but is required for backward compatibility
				if (!oClassObject) {
					Log.error("Control '" + sClassName + "' did not return a class definition from sap.ui.define.", "", "XMLTemplateProcessor");
					oClassObject = ObjectPath.get(sClassName);
				}
				if (!oClassObject) {
					Log.error("Can't find object class '" + sClassName + "' for XML-view", "", "XMLTemplateProcessor");
				}
				return oClassObject;
			}

			var sResourceName = sClassName.replace(/\./g, "/");
			var oClassObject = sap.ui.require(sResourceName);
			if (!oClassObject) {
				if (bAsync) {
					return new Promise(function(resolve) {
						sap.ui.require([sResourceName], function(oClassObject) {
							oClassObject = getObjectFallback(oClassObject);
							resolve(oClassObject);
						});
					});
				} else {
					oClassObject = sap.ui.requireSync(sResourceName);
					oClassObject = getObjectFallback(oClassObject);
				}
			}
			return oClassObject;
		}

		/**
		 * Takes an arbitrary node (control or plain HTML) and creates zero or one or more SAPUI5 controls from it,
		 * iterating over the attributes and child nodes.
		 *
		 * @param {Element} node The current XMLNode which is being processed
		 * @param {Promise} pRequireContext Promise which resolves with the loaded modules from require context
		 * @return {Promise} resolving to an array with 0..n controls
		 * @private
		 */
		function createControls(node, pRequireContext) {
			// differentiate between SAPUI5 and plain-HTML children
			if (node.namespaceURI === "http://www.w3.org/1999/xhtml" || node.namespaceURI === "http://www.w3.org/2000/svg" ) {
				var id = node.attributes['id'] ? node.attributes['id'].textContent || node.attributes['id'].text : null;

				if (bEnrichFullIds) {
					return XMLTemplateProcessor.enrichTemplateIdsPromise(node, oView, bAsync).then(function(){
						// do not create controls
						return [];
					});
				} else {
					// plain HTML node - create a new View control
					// creates a view instance, but makes sure the new view receives the correct owner component
					var fnCreateView = function (oViewClass) {
						var mViewParameters = {
							id: id ? getId(oView, node, id) : undefined,
							xmlNode: node,
							containingView: oView._oContainingView,
							processingMode: oView._sProcessingMode // add processing mode, so it can be propagated to subviews inside the HTML block
						};
						// running with owner component
						if (oView.fnScopedRunWithOwner) {
							return oView.fnScopedRunWithOwner(function () {
								return new oViewClass(mViewParameters);
							});
						}
						// no owner component
						// (or fully sync path, which handles the owner propagation on a higher level)
						return new oViewClass(mViewParameters);
					};

					if (bAsync) {
						return new Promise(function (resolve, reject) {
							sap.ui.require(["sap/ui/core/mvc/XMLView"], function(XMLView) {
								resolve([fnCreateView(XMLView)]);
							});
						});
					} else {
						var XMLView = sap.ui.requireSync("sap/ui/core/mvc/XMLView");
						return SyncPromise.resolve([fnCreateView(XMLView)]);
					}
				}

			} else {
				// non-HTML (SAPUI5) control
				return createControlOrExtension(node, pRequireContext);
			}
		}

		/**
		 * Creates 0..n UI5 controls from an XML node which is not plain HTML, but a UI5 node (either control or
		 * ExtensionPoint). One control for regular controls, zero for ExtensionPoints without configured extension
		 * and n controls for multi-root Fragments.
		 *
		 * @param {Element} node The current XMLNode which is being processed
		 * @param {Promise} pRequireContext Promise which resolves with the loaded modules from require context
		 * @return {Promise} resolving to an array with 0..n controls created from a node
		 * @private
		 */
		function createControlOrExtension(node, pRequireContext) { // this will also be extended for Fragments with multiple roots

			if (localName(node) === "ExtensionPoint" && node.namespaceURI === "sap.ui.core" ) {

				if (bEnrichFullIds) {
					// Processing the different types of ExtensionPoints (XML, JS...) is not possible, hence
					// they are skipped as well as their potentially overwritten default content.
					return SyncPromise.resolve([]);
				} else {
					// for Views the containing View's name is required to retrieve the according extension configuration,
					// whereas for Fragments the actual Fragment's name is required - oView can be either View or Fragment
					var oContainer = oView instanceof View ? oView._oContainingView : oView;

					// @evo-todo: The factory call needs to be refactored into a proper async/sync switch.
					// @evo-todo: The ExtensionPoint module is actually the sap.ui.extensionpoint function.
					//            We still call _factory for skipping the deprecation warning for now.
					var fnExtensionPointFactory = ExtensionPoint._factory.bind(null, oContainer, node.getAttribute("name"), function() {
						// create extensionpoint with callback function for defaultContent - will only be executed if there is no customizing configured or if customizing is disabled
						var pChild = SyncPromise.resolve();
						var aChildControlPromises = [];
						var children = node.childNodes;
						// for some reasons phantomjs does not work with an Array#forEach here
						for (var i = 0; i < children.length; i++) {
							var oChildNode = children[i];
							if (oChildNode.nodeType === 1 /* ELEMENT_NODE */) { // text nodes are ignored - plaintext inside extension points is not supported; no warning log because even whitespace is a text node
								// chain the child node creation for sequential processing
								pChild = pChild.then(createControls.bind(null, oChildNode, pRequireContext));
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
					});

					return SyncPromise.resolve(oView.fnScopedRunWithOwner ? oView.fnScopedRunWithOwner(fnExtensionPointFactory) : fnExtensionPointFactory());
				}

			} else {
				// a plain and simple regular UI5 control
				var vClass = findControlClass(node.namespaceURI, localName(node));
				if (vClass && typeof vClass.then === 'function') {
					return vClass.then(function (fnClass) {
						return createRegularControls(node, fnClass, pRequireContext);
					});
				} else {
					// class has already been loaded
					return createRegularControls(node, vClass, pRequireContext);
				}
			}
		}

		/**
		 * Creates 0..n UI5 controls from an XML node.
		 * One control for regular controls, zero for ExtensionPoints without configured extension and
		 * n controls for multi-root Fragments.
		 *
		 * @return {Promise} resolving to an array with 0..n controls created from a node
		 * @private
		 */
		function createRegularControls(node, oClass, pRequireContext) {
			var ns = node.namespaceURI,
				mSettings = {},
				sStyleClasses = "",
				aCustomData = [],
				mCustomSettings = null,
				sSupportData = null;

			if (!oClass) {
				return SyncPromise.resolve([]);
			}

			var oMetadata = oClass.getMetadata();
			var mKnownSettings = oMetadata.getAllSettings();

			var pSelfRequireContext = parseAndLoadRequireContext(node, bAsync);

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

				if (!bEnrichFullIds) {
					for (var i = 0; i < node.attributes.length; i++) {
						var attr = node.attributes[i],
							sName = attr.name,
							oInfo = mKnownSettings[sName],
							sValue = attr.value;

						// apply the value of the attribute to a
						//   * property,
						//   * association (id of the control),
						//   * event (name of the function in the controller) or
						//   * CustomData element (namespace-prefixed attribute)

						if (sName === "id") {
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
							var oBindingInfo = ManagedObject.bindingParser(sValue, oView._oContainingView.oController);
							// TODO reject complex bindings, types, formatters; enable 'parameters'?
							if (oBindingInfo) {
								mSettings.objectBindings = mSettings.objectBindings || {};
								mSettings.objectBindings[oBindingInfo.model || undefined] = oBindingInfo;
							}
						} else if (sName === 'metadataContexts') {
							var mMetaContextsInfo = null;

							try {
								mMetaContextsInfo = XMLTemplateProcessor._calculatedModelMapping(sValue,oView._oContainingView.oController,true);
							} catch (e) {
								Log.error(oView + ":" + e.message);
							}

							if (mMetaContextsInfo) {
								mSettings.metadataContexts = mMetaContextsInfo;

								if (XMLTemplateProcessor._preprocessMetadataContexts) {
									XMLTemplateProcessor._preprocessMetadataContexts(oClass.getMetadata().getName(), mSettings, oView._oContainingView.oController);
								}
							}
						} else if (sName.indexOf(":") > -1) {  // namespace-prefixed attribute found
							if (attr.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1") {  // CustomData attribute found
								var sLocalName = localName(attr);
								aCustomData.push(new CustomData({
									key:sLocalName,
									value:parseScalarType("any", sValue, sLocalName, oView._oContainingView.oController)
								}));
							} else if (attr.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.support.Support.info/1") {
								sSupportData = sValue;
							} else if (attr.namespaceURI && attr.namespaceURI.indexOf("http://schemas.sap.com/sapui5/preprocessorextension/") === 0) {
								Log.debug(oView + ": XMLView parser ignored preprocessor attribute '" + sName + "' (value: '" + sValue + "')");
							} else if (sName.indexOf("xmlns:") !== 0 ) { // other, unknown namespace and not an xml namespace alias definition
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
							mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController, oRequireModules); // View._oContainingView.oController is null when [...]
							// FIXME: ._oContainingView might be the original Fragment for an extension fragment or a fragment in a fragment - so it has no controller bit ITS containingView.

						} else if (oInfo && oInfo._iKind === 1 /* SINGLE_AGGREGATION */ && oInfo.altTypes ) {
							// AGGREGATION with scalar type (altType)
							mSettings[sName] = parseScalarType(oInfo.altTypes[0], sValue, sName, oView._oContainingView.oController, oRequireModules);

						} else if (oInfo && oInfo._iKind === 2 /* MULTIPLE_AGGREGATION */ ) {
							var oBindingInfo = ManagedObject.bindingParser(sValue, oView._oContainingView.oController, false, false, false, false, oRequireModules);
							if ( oBindingInfo ) {
								mSettings[sName] = oBindingInfo;
							} else {
								// TODO we now in theory allow more than just a binding path. Update message?
								Log.error(oView + ": aggregations with cardinality 0..n only allow binding paths as attribute value (wrong value: " + sName + "='" + sValue + "')");
							}

						} else if (oInfo && oInfo._iKind === 3 /* SINGLE_ASSOCIATION */ ) {
							// ASSOCIATION
							mSettings[sName] = createId(sValue); // use the value as ID

						} else if (oInfo && oInfo._iKind === 4 /* MULTIPLE_ASSOCIATION */ ) {
							// we support "," and " " to separate IDs and filter out empty IDs
							mSettings[sName] = sValue.split(/[\s,]+/g).filter(identity).map(createId);

						} else if (oInfo && oInfo._iKind === 5 /* EVENT */ ) {
							// EVENT
							var aEventHandlers = [];

							EventHandlerResolver.parse(sValue).forEach(function (sEventHandler) { // eslint-disable-line no-loop-func
								var vEventHandler = EventHandlerResolver.resolveEventHandler(sEventHandler, oView._oContainingView.oController, oRequireModules); // TODO: can this be made async? (to avoid the hard resolver dependency)
								if (vEventHandler) {
									aEventHandlers.push(vEventHandler);
								} else  {
									Log.warning(oView + ": event handler function \"" + sEventHandler + "\" is not a function or does not exist in the controller.");
								}
							});

							if (aEventHandlers.length) {
								mSettings[sName] = aEventHandlers;
							}
						} else if (oInfo && oInfo._iKind === -1) {
							// SPECIAL SETTING - currently only allowed for View's async setting
							if (View.prototype.isPrototypeOf(oClass.prototype) && sName == "async") {
								mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController, oRequireModules);
							} else {
								Log.warning(oView + ": setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "') is not supported");
							}
						} else {
							assert(sName === 'xmlns', oView + ": encountered unknown setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "')");
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

				return oRequireModules;
			});

			/**
			 * The way how handleChildren works determines parallel or sequential processing
			 *
			 * @return {Promise} resolving to an array with 0..n controls created from a node
			 * @private
			 */
			// the actual handleChildren function depends on the processing mode
			var handleChildren = getHandleChildrenStrategy(bAsync, handleChild);

			/**
			 * @return {Promise} resolving to an array with 0..n controls created from a node
			 * @private
			 */
			function handleChild(node, oAggregation, mAggregations, childNode, bActivate, pRequireContext) {
				var oNamedAggregation;
				// inspect only element nodes
				if (childNode.nodeType === 1 /* ELEMENT_NODE */) {

					if (childNode.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.xmlcomposite/1") {
						mSettings[localName(childNode)] = childNode.querySelector("*");
						return;
					}

					// check for a named aggregation (must have the same namespace as the parent and an aggregation with the same name must exist)
					oNamedAggregation = childNode.namespaceURI === ns && mAggregations && mAggregations[localName(childNode)];
					if (oNamedAggregation) {
						// the children of the current childNode are aggregated controls (or HTML) below the named aggregation
						return handleChildren(childNode, oNamedAggregation, false, pRequireContext);

					} else if (oAggregation) {
						// TODO consider moving this to a place where HTML and SVG nodes can be handled properly
						// create a StashedControl for inactive controls, which is not placed in an aggregation
						if (!bActivate && childNode.getAttribute("stashed") === "true" && !bEnrichFullIds) {
							StashedControlSupport.createStashedControl(getId(oView, childNode), {
								sParentId: mSettings["id"],
								sParentAggregationName: oAggregation.name,
								fnCreate: function() {
									// EVO-Todo: stashed control-support is still mandatory SYNC
									// this means we need to switch back the view processing to synchronous too
									// at this point everything is sync again
									var bPrevAsync = bAsync;
									bAsync = false;

									try {
										return unwrapSyncPromise(handleChild(node, oAggregation, mAggregations, childNode, true, pRequireContext));
									} finally {
										// EVO-Todo:revert back to the original async/sync behavior
										// if we moved to the sync path for the stashed control, we might now go back to the async path.
										bAsync = bPrevAsync;
									}
								}
							});
							return;
						}

						// child node name does not equal an aggregation name,
						// so this child must be a control (or HTML) which is aggregated below the DEFAULT aggregation
						return createControls(childNode, pRequireContext).then(function(aControls) {
							for (var j = 0; j < aControls.length; j++) {
								var oControl = aControls[j];
								// append the child to the aggregation
								var name = oAggregation.name;
								if (oAggregation.multiple) {
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
					} else if (localName(node) !== "FragmentDefinition" || node.namespaceURI !== "sap.ui.core") { // children of FragmentDefinitions are ok, they need no aggregation
						throw new Error("Cannot add direct child without default aggregation defined for control " + oMetadata.getElementName());
					}

				} else if (childNode.nodeType === 3 /* TEXT_NODE */) {
					if (jQuery.trim(childNode.textContent || childNode.text)) { // whitespace would be okay
						throw new Error("Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed: " + jQuery.trim(childNode.textContent || childNode.text));
					}
				} // other nodes types are silently ignored

			}

			// loop child nodes and handle all AGGREGATIONS
			var oAggregation = oMetadata.getDefaultAggregation();
			var mAggregations = oMetadata.getAllAggregations();

			return handleChildren(node, oAggregation, mAggregations, pRequireContext).then(function() {
				// apply the settings to the control
				var vNewControlInstance;

				if (bEnrichFullIds && node.hasAttribute("id")) {
						setId(oView, node);
				} else if (!bEnrichFullIds) {

					if (View.prototype.isPrototypeOf(oClass.prototype) && typeof oClass._sType === "string") {
						var fnCreateViewInstance = function () {
							// Pass processingMode to nested XMLViews
							if (oClass.getMetadata().isA("sap.ui.core.mvc.XMLView") && oView._sProcessingMode === "sequential") {
								mSettings.processingMode = "sequential";
							}
							return View._legacyCreate(mSettings, undefined, oClass._sType);
						};

						// for views having a factory function defined we use the factory function!
						if (oView.fnScopedRunWithOwner) {
							// We need to use the already created scoped runWithOwner function from the outer view instance.
							// This way, the nested views are receiving the correct Owner component, across asynchronous calls.
							vNewControlInstance = oView.fnScopedRunWithOwner(fnCreateViewInstance);
						} else {
							vNewControlInstance = fnCreateViewInstance();
						}

					} else {
						// call the control constructor with the according owner in scope
						var fnCreateInstance = function() {
							// Pass processingMode to Fragments only
							if (oClass.getMetadata().isA("sap.ui.core.Fragment") && node.getAttribute("type") !== "JS" && oView._sProcessingMode === "sequential") {
								mSettings.processingMode = "sequential";
							}
							if (oView.fnScopedRunWithOwner) {
								return oView.fnScopedRunWithOwner(function() {
									return new oClass(mSettings);
								});
							} else {
								return new oClass(mSettings);
							}
						};

						if (oParseConfig && oParseConfig.fnRunWithPreprocessor) {
							vNewControlInstance = oParseConfig.fnRunWithPreprocessor(fnCreateInstance);
						} else {
							vNewControlInstance = fnCreateInstance();
						}

					}

					if (sStyleClasses && vNewControlInstance.addStyleClass) {
						// Elements do not have a style class!
						vNewControlInstance.addStyleClass(sStyleClasses);
					}
				}

				if (!vNewControlInstance) {
					vNewControlInstance = [];
				} else if (!Array.isArray(vNewControlInstance)) {
					vNewControlInstance = [vNewControlInstance];
				}

				//apply support info if needed
				if (XMLTemplateProcessor._supportInfo && vNewControlInstance) {
					for (var i = 0, iLength = vNewControlInstance.length; i < iLength; i++) {
						var oInstance = vNewControlInstance[i];
						if (oInstance && oInstance.getId()) {
							//create a support info for id creation and add it to the support data
							var iSupportIndex = XMLTemplateProcessor._supportInfo({context:node, env:{caller:"createRegularControls", nodeid: node.getAttribute("id"), controlid: oInstance.getId()}}),
								sData = sSupportData ? sSupportData + "," : "";
							sData += iSupportIndex;
							//add the controls support data to the indexed map of support info control instance map
							XMLTemplateProcessor._supportInfo.addSupportInfo(oInstance.getId(), sData);
						}
					}
				}

				if (bDesignMode) {
					vNewControlInstance.forEach(function (oInstance) {
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

				return vNewControlInstance;
			});

		}

		function getId(oView, xmlNode, sId) {
			if (xmlNode.getAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id")) {
				return xmlNode.getAttribute("id");
			} else {
				return createId(sId ? sId : xmlNode.getAttribute("id"));
			}
		}

		function setId(oView, xmlNode) {
			xmlNode.setAttribute("id", createId(xmlNode.getAttribute("id")));
			xmlNode.setAttributeNS("http://schemas.sap.com/sapui5/extension/sap.ui.core.Internal/1", "id", true);
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
	 * @param{string} The string value of a complex binding containing one or more models
	 * @param {object} oContext - The current context
	 *
	 * @return{object} a named map keyed by model name
	 */
	XMLTemplateProcessor._calculatedModelMapping = function(sBinding,oContext,bAllowMultipleBindings) {
		var oCtx,
			mBinding = {},
			oBinding = ManagedObject.bindingParser(sBinding, oContext);

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
				//check the text Arrangments
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

}, /* bExport= */ true);
