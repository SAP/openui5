/*!
 * ${copyright}
 */

/*global HTMLTemplateElement, DocumentFragment*/

sap.ui.define(['jquery.sap.global', 'sap/ui/base/DataType', 'sap/ui/base/ManagedObject', 'sap/ui/core/CustomData', './mvc/View', './ExtensionPoint', './StashedControlSupport'],
	function(jQuery, DataType, ManagedObject, CustomData, View, ExtensionPoint, StashedControlSupport) {
	"use strict";



		function parseScalarType(sType, sValue, sName, oController) {
			// check for a binding expression (string)
			var oBindingInfo = ManagedObject.bindingParser(sValue, oController, true);
			if ( oBindingInfo && typeof oBindingInfo === "object" ) {
				return oBindingInfo;
			}

			var vValue = sValue = oBindingInfo || sValue; // oBindingInfo could be an unescaped string
			var oType = DataType.getType(sType);
			if (oType) {
				if (oType instanceof DataType) {
					vValue = oType.parseValue(sValue);
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
		 * The XMLTemplateProcessor class is used to load and process Control trees in XML-declarative notation.
		 *
		 * @namespace
		 * @alias sap.ui.core.XMLTemplateProcessor
		 */
		var XMLTemplateProcessor = {};



		/**   API METHODS ***/


		/**
		 * Loads an XML template using the module loading mechanism and returns the root XML element of the XML document.
		 *
		 * @param {string} sTemplateName
		 * @param {string} [sExtension]
		 * @return {Element} an XML document root element
		 */
		XMLTemplateProcessor.loadTemplate = function(sTemplateName, sExtension) {
			var sResourceName = jQuery.sap.getResourceName(sTemplateName, "." + (sExtension || "view") + ".xml");
			return jQuery.sap.loadResource(sResourceName).documentElement; // result is the document node
		};


		/**
		 * Parses only the attributes of the XML root node (View!) and fills them into the given settings object.
		 * Children are parsed later on after the controller has been set.
		 * TODO cannot handle event handlers in the root node
		 *
		 * @param {Element} xmlNode the XML element representing the View
		 * @param {sap.ui.base.ManagedObject} oView the View to consider when parsing the attributes
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
		 * Flag for running in a mode which only resolves the ids and writes them back to the xml source.
		 * @private
		 */
		var bEnrichFullIds = false;

		/**
		 * Parses a complete XML template definition (full node hierarchy) and resolves the ids to their full qualification
		 *
		 * @param {Element} xmlNode the XML element representing the View/Fragment
		 * @param {sap.ui.base.ManagedObject} oView the View/Fragment which corresponds to the parsed XML
		 * @return {Element} the element enriched with the full ids
		 * @protected
		 */
		XMLTemplateProcessor.enrichTemplateIds = function(xmlNode, oView) {
			var bRecursive = (bEnrichFullIds !== false);
			bEnrichFullIds = true;
			try {
				// parse the template without control creation, only enriching the ids
				XMLTemplateProcessor.parseTemplate(xmlNode, oView);
			} finally {
				// ensure setting flag to false only if not called recursively
				bEnrichFullIds = bRecursive;
			}
			return xmlNode;
		};


		/**
		 * Parses a complete XML template definition (full node hierarchy)
		 *
		 * @param {Element} xmlNode the XML element representing the View/Fragment
		 * @param {sap.ui.base.ManagedObject} oView the View/Fragment which corresponds to the parsed XML
		 * @return an array containing Controls and/or plain HTML element strings
		 */
		XMLTemplateProcessor.parseTemplate = function(xmlNode, oView) {
			var bDesignMode = sap.ui.getCore().getConfiguration().getDesignMode();
			var aResult = [];
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
				parseNode(xmlNode, true);
			} else {
				if (xmlNode.localName === "View" && xmlNode.namespaceURI !== "sap.ui.core.mvc") {
					// it's not <core:View>, it's <mvc:View> !!!
					jQuery.sap.log.warning("XMLView root node must have the 'sap.ui.core.mvc' namespace, not '" + xmlNode.namespaceURI + "'" + (sCurrentName ? " (View name: " + sCurrentName + ")" : ""));
				}
				parseChildren(xmlNode);
			}

			return aResult;

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
 			 * @return undefined but the aResult array is filled
			 */
			function parseNode(xmlNode, bRoot, bIgnoreTopLevelTextNodes) {

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
							aResult.push(attr.name + "=\"" + jQuery.sap.encodeHTML(value) + "\" ");
						}
						if ( bRoot === true ) {
							aResult.push("data-sap-ui-preserve" + "=\"" + oView.getId() + "\" ");
							if (!bHasId) {
								aResult.push("id" + "=\"" + oView.getId() + "\" ");
							}
						}
						aResult.push(">");

						// write children
						if (window.HTMLTemplateElement && xmlNode instanceof HTMLTemplateElement && xmlNode.content instanceof DocumentFragment) {
							// <template> support (HTMLTemplateElement has no childNodes, but a content node which contains the childNodes)
							parseChildren(xmlNode.content);
						} else {
							parseChildren(xmlNode);
						}

						// close the tag
						aResult.push("</" + sLocalName + ">");

					} else if (sLocalName === "FragmentDefinition" && xmlNode.namespaceURI === "sap.ui.core") {
						// a Fragment element - which is not turned into a control itself. Only its content is parsed.
						parseChildren(xmlNode, false, true);
						// TODO: check if this branch is required or can be handled by the below one

					} else {

						// assumption: an ELEMENT_NODE with non-XHTML namespace is an SAPUI5 control and the namespace equals the library name
						var aChildren = createControlOrExtension(xmlNode);

						for (var i = 0; i < aChildren.length; i++) {
							var oChild = aChildren[i];
							if (oView.getMetadata().hasAggregation("content")) {
								oView.addAggregation("content", oChild);
							} else if (oView.getMetadata().hasAssociation(("content"))) {
								oView.addAssociation("content", oChild);
							}

							aResult.push(oChild);
						}

					}

				} else if (xmlNode.nodeType === 3 /* TEXT_NODE */ && !bIgnoreTopLevelTextNodes) {

					var text = xmlNode.textContent || xmlNode.text,
					parentName = localName(xmlNode.parentNode);
					if (text) {
						if (parentName != "style") {
							text = jQuery.sap.encodeHTML(text);
						}
						aResult.push(text);
					}

				}

			}

			/**
			 * Parses the children of an XML node
			 */
			function parseChildren(xmlNode, bRoot, bIgnoreToplevelTextNodes) {
				var children = xmlNode.childNodes;
				for (var i = 0; i < children.length; i++) {
					parseNode(children[i], bRoot, bIgnoreToplevelTextNodes);
				}
			}

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
				jQuery.sap.require(sClassName); // make sure oClass.getMetadata() exists
				var oClassObject = jQuery.sap.getObject(sClassName);
				if (oClassObject) {
					return oClassObject;
				} else {
					jQuery.sap.log.error("Can't find object class '" + sClassName + "' for XML-view", "", "XMLTemplateProcessor.js");
				}
			}

			/**
			 * Takes an arbitrary node (control or plain HTML) and creates zero or one or more SAPUI5 controls from it,
			 * iterating over the attributes and child nodes.
			 *
			 * @return an array with 0..n controls
			 * @private
			 */
			function createControls(node) {
				// differentiate between SAPUI5 and plain-HTML children
				if (node.namespaceURI === "http://www.w3.org/1999/xhtml" || node.namespaceURI === "http://www.w3.org/2000/svg" ) {
					var id = node.attributes['id'] ? node.attributes['id'].textContent || node.attributes['id'].text : null;

					if (bEnrichFullIds) {
						XMLTemplateProcessor.enrichTemplateIds(node, oView);
						// do not create controls
						return [];
					} else {
						// plain HTML node - create a new View control
						var XMLView = sap.ui.requireSync("sap/ui/core/mvc/XMLView");
						return [ new XMLView({
							id: id ? getId(oView, node, id) : undefined,
							xmlNode:node,
							containingView:oView._oContainingView})
						];
					}

				} else {
					// non-HTML (SAPUI5) control
					return createControlOrExtension(node);
				}
			}

			/**
			 * Creates 0..n UI5 controls from an XML node which is not plain HTML, but a UI5 node (either control or ExtensionPoint).
			 * One control for regular controls, zero for ExtensionPoints without configured extension and
			 * n controls for multi-root Fragments.
			 *
			 * @return an array with 0..n controls created from a node
			 * @private
			 */
			function createControlOrExtension(node) { // this will also be extended for Fragments with multiple roots

				if (localName(node) === "ExtensionPoint" && node.namespaceURI === "sap.ui.core" ) {
					if (bEnrichFullIds) {
						// Processing the different types of ExtensionPoints (XML, JS...) is not possible, hence
						// they are skipped as well as their potentially overwritten default content.
						return [];
					} else {
						// create extensionpoint with callback function for defaultContent - will only be executed if there is no customizing configured or if customizing is disabled
						return ExtensionPoint(oView, node.getAttribute("name"), function(){
							var children = node.childNodes;
							var oDefaultContent = [];
							for (var i = 0; i < children.length; i++) {
								var oChildNode = children[i];
								if (oChildNode.nodeType === 1 /* ELEMENT_NODE */) { // text nodes are ignored - plaintext inside extension points is not supported; no warning log because even whitespace is a text node
									oDefaultContent = jQuery.merge(oDefaultContent, createControls(oChildNode));
								}
							}
							return oDefaultContent;
						});
					}

				}  else {
					// a plain and simple regular UI5 control
					return createRegularControls(node);
				}
			}

			/**
			 * Creates 0..n UI5 controls from an XML node.
			 * One control for regular controls, zero for ExtensionPoints without configured extension and
			 * n controls for multi-root Fragments.
			 *
			 * @return an array with 0..n controls created from a node
			 * @private
			 */
			function createRegularControls(node) {
				var ns = node.namespaceURI,
				oClass = findControlClass(ns, localName(node)),
				mSettings = {},
				sStyleClasses = "",
				aCustomData = [],
				sSupportData = null;
				if (!oClass) {
					return [];
				}
				var oMetadata = oClass.getMetadata();
				var mKnownSettings = oMetadata.getAllSettings();
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
							var oMetaContextsInfo;

							if (XMLTemplateProcessor._preprocessMetadataContexts) {
								oMetaContextsInfo =  XMLTemplateProcessor._preprocessMetadataContexts(oClass.getMetadata().getName(),node,oView._oContainingView.oController);
							}

							if (oMetaContextsInfo) {
								mSettings.metadataContexts = mSettings.metadataContexts || {};
								mSettings.metadataContexts[oMetaContextsInfo.model || undefined] = oMetaContextsInfo;
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
							} else if ( sName.indexOf("xmlns:") !== 0 ) { // other, unknown namespace and not an xml namespace alias definition
								jQuery.sap.log.warning(oView + ": XMLView parser encountered and ignored attribute '" + sName + "' (value: '" + sValue + "') with unknown namespace");
								// TODO: here XMLView could check for namespace handlers registered by the application for this namespace which could modify mSettings according to their interpretation of the attribute
							}

						} else if (oInfo && oInfo._iKind === 0 /* PROPERTY */ ) {
							// other PROPERTY
							mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController); // View._oContainingView.oController is null when [...]
							// FIXME: ._oContainingView might be the original Fragment for an extension fragment or a fragment in a fragment - so it has no controller bit ITS containingView.

						} else if (oInfo && oInfo._iKind === 1 /* SINGLE_AGGREGATION */ && oInfo.altTypes ) {
							// AGGREGATION with scalar type (altType)
							mSettings[sName] = parseScalarType(oInfo.altTypes[0], sValue, sName, oView._oContainingView.oController);

						} else if (oInfo && oInfo._iKind === 2 /* MULTIPLE_AGGREGATION */ ) {
							var oBindingInfo = ManagedObject.bindingParser(sValue, oView._oContainingView.oController);
							if ( oBindingInfo ) {
								mSettings[sName] = oBindingInfo;
							} else {
								// TODO we now in theory allow more than just a binding path. Update message?
								jQuery.sap.log.error(oView + ": aggregations with cardinality 0..n only allow binding paths as attribute value (wrong value: " + sName + "='" + sValue + "')");
							}

						} else if (oInfo && oInfo._iKind === 3 /* SINGLE_ASSOCIATION */ ) {
							// ASSOCIATION
							mSettings[sName] = createId(sValue); // use the value as ID

						} else if (oInfo && oInfo._iKind === 4 /* MULTIPLE_ASSOCIATION */ ) {
							// we support "," and " " to separate IDs and filter out empty IDs
							mSettings[sName] = sValue.split(/[\s,]+/g).filter(identity).map(createId);

						} else if (oInfo && oInfo._iKind === 5 /* EVENT */ ) {
							// EVENT
							var vEventHandler = View._resolveEventHandler(sValue, oView._oContainingView.oController);
							if ( vEventHandler ) {
								mSettings[sName] = vEventHandler;
							} else {
								jQuery.sap.log.warning(oView + ": event handler function \"" + sValue + "\" is not a function or does not exist in the controller.");
							}
						} else if (oInfo && oInfo._iKind === -1) {
							// SPECIAL SETTING - currently only allowed for View´s async setting
							if (View.prototype.isPrototypeOf(oClass.prototype) && sName == "async") {
								mSettings[sName] = parseScalarType(oInfo.type, sValue, sName, oView._oContainingView.oController);
							} else {
								jQuery.sap.log.warning(oView + ": setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "') is not supported");
							}
						} else {
							jQuery.sap.assert(sName === 'xmlns', oView + ": encountered unknown setting '" + sName + "' for class " + oMetadata.getName() + " (value:'" + sValue + "')");
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
					if (aCustomData.length > 0) {
						mSettings.customData = aCustomData;
					}
				}

				function handleChildren(node, oAggregation, mAggregations) {

					var childNode;

					// loop over all nodes
					for (childNode = node.firstChild; childNode; childNode = childNode.nextSibling) {

						handleChild(node, oAggregation, mAggregations, childNode);
					}
				}

				function handleChild(node, oAggregation, mAggregations, childNode, bActivate) {
					var oNamedAggregation;
					// inspect only element nodes
					if (childNode.nodeType === 1 /* ELEMENT_NODE */) {

						if (childNode.namespaceURI === "http://schemas.sap.com/sapui5/extension/sap.ui.core.fragmentcontrol/1") {
							mSettings[localName(childNode)] = childNode.querySelector("*");
							return;
						}

						// check for a named aggregation (must have the same namespace as the parent and an aggregation with the same name must exist)
						oNamedAggregation = childNode.namespaceURI === ns && mAggregations && mAggregations[localName(childNode)];
						if (oNamedAggregation) {
							// the children of the current childNode are aggregated controls (or HTML) below the named aggregation
							handleChildren(childNode, oNamedAggregation);

						} else if (oAggregation) {
							// TODO consider moving this to a place where HTML and SVG nodes can be handled properly
							// create a StashedControl for inactive controls, which is not placed in an aggregation
							if (!bActivate && childNode.getAttribute("stashed") === "true" && !bEnrichFullIds) {
								StashedControlSupport.createStashedControl(getId(oView, childNode), {
									sParentId: mSettings["id"],
									sParentAggregationName: oAggregation.name,
									fnCreate: function() {
										return handleChild(node, oAggregation, mAggregations, childNode, true);
									}
								});
								return;
							}

							// child node name does not equal an aggregation name,
							// so this child must be a control (or HTML) which is aggregated below the DEFAULT aggregation
							var aControls = createControls(childNode);
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
										jQuery.sap.assert(!mSettings[name].template, "list bindings support only a single template object");
										mSettings[name].template = oControl;
									} else {
										mSettings[name].push(oControl);
									}
								} else {
									// 1..1 AGGREGATION
									jQuery.sap.assert(!mSettings[name], "multiple aggregates defined for aggregation with cardinality 0..1");
									mSettings[name] = oControl;
								}
							}
							return aControls;
						} else if (localName(node) !== "FragmentDefinition" || node.namespaceURI !== "sap.ui.core") { // children of FragmentDefinitions are ok, they need no aggregation
							throw new Error("Cannot add direct child without default aggregation defined for control " + oMetadata.getElementName());
						}

					} else if (childNode.nodeType === 3 /* TEXT_NODE */) {
						if (jQuery.trim(childNode.textContent || childNode.text)) { // whitespace would be okay
							throw new Error("Cannot add text nodes as direct child of an aggregation. For adding text to an aggregation, a surrounding html tag is needed: " + jQuery.trim(childNode.textContent || childNode.text));
						}
					} // other nodes types are silently ignored

					return [];
				}

				// loop child nodes and handle all AGGREGATIONS
				var oAggregation = oMetadata.getDefaultAggregation();
				var mAggregations = oMetadata.getAllAggregations();
				handleChildren(node, oAggregation, mAggregations);

				// apply the settings to the control
				var vNewControlInstance;

				if (bEnrichFullIds && node.hasAttribute("id")) {
						setId(oView, node);
				} else if (!bEnrichFullIds) {
					if (View.prototype.isPrototypeOf(oClass.prototype) && typeof oClass._sType === "string") {
						// for views having a factory function defined we use the factory function!
						vNewControlInstance = sap.ui.view(mSettings, undefined, oClass._sType);
					} else {
						// call the control constructor
						// NOTE: the sap.ui.core.Fragment constructor can return an array containing multiple controls (for multi-root Fragments)
						//   This is the reason for all the related functions around here returning arrays.
						vNewControlInstance = new oClass(mSettings);
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
						oInstance._sapui_declarativeSourceInfo = {
							xmlNode: node,
							xmlRootNode: oView._sapui_declarativeSourceInfo.xmlRootNode,
							fragmentName: oMetadata.getName() === 'sap.ui.core.Fragment' ? mSettings['fragmentName'] : null
						};
					});
				}

				return vNewControlInstance;
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

		};

		/**
		 * Preprocessor for special setting metadataContexts.
		 * Needs to be re-implemented.
		 *
		 * @param {string} sClassName - The class of the control to be created
		 * @param {object} oNode - The XML node
		 * @param {object} oContext - The current context of the control
		 * @private
		 */
		XMLTemplateProcessor._preprocessMetadataContexts = null;

	return XMLTemplateProcessor;

}, /* bExport= */ true);
