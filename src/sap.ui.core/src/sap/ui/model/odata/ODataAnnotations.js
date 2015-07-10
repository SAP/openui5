/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataAnnotations
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'sap/ui/base/EventProvider'],
	function(jQuery, Device, EventProvider) {
	"use strict";

	/*global ActiveXObject */

	/**
	 * Whitelist of property node names whose values should be put through alias replacement
	 */
	var mAliasNodeWhitelist = {
		EnumMember: true,
		Path: true,
		PropertyPath: true,
		NavigationPropertyPath: true,
		AnnotationPath: true
	};

	var mTextNodeWhitelist = {
		Binary: true,
		Bool: true,
		Date: true,
		DateTimeOffset: true,
		Decimal: true,
		Duration: true,
		Float: true,
		Guid: true,
		Int: true,
		String: true,
		TimeOfDay: true,

		LabelElementReference: true,
		EnumMember: true,
		Path: true,
		PropertyPath: true,
		NavigationPropertyPath: true,
		AnnotationPath: true
	};

	var mMultipleArgumentDynamicExpressions = {
		And: true,
		Or: true,
		// Not: true,
		Eq: true,
		Ne: true,
		Gt: true,
		Ge: true,
		Lt: true,
		Le: true,
		If: true,
		Collection: true
	};



	/**
	 * @param {string|string[]} aAnnotationURI The annotation-URL or an array of URLS that should be parsed and merged
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
	 * @param {object} mParams
	 *
	 * @class Implementation to access oData Annotations
	 *
	 * @author SAP SE
	 * @version
	 * ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.model.odata.ODataAnnotations
	 * @extends sap.ui.base.Object
	 */
	var ODataAnnotations = EventProvider.extend("sap.ui.model.odata.ODataAnnotations", /** @lends sap.ui.model.odata.ODataAnnotations.prototype */
	{

		constructor : function(aAnnotationURI, oMetadata, mParams) {
			EventProvider.apply(this, arguments);
			this.oMetadata = oMetadata;
			this.oAnnotations = {};
			this.bLoaded = false;
			this.bAsync = mParams && mParams.async;
			this.xPath = null;
			this.oError = null;
			this.bValidXML = true;
			this.oRequestHandles = [];
			this.oLoadEvent = null;
			this.oFailedEvent = null;

			if (aAnnotationURI) {
				this.addUrl(aAnnotationURI);

				if (!this.bAsync) {
					// Synchronous loading, we can directly check for errors
					jQuery.sap.assert(
						!jQuery.isEmptyObject(this.oMetadata),
						"Metadata must be available for synchronous annotation loading"
					);
					if (this.oError) {
						jQuery.sap.log.error(
							"OData annotations could not be loaded: " + this.oError.message
						);
					}
				}
			}
		},
		metadata : {
			publicMethods : ["parse", "getAnnotationsData", "attachFailed", "detachFailed", "attachLoaded", "detachLoaded"]
		}

	});

	/**
	 * returns the raw annotation data
	 *
	 * @public
	 * @returns {object} returns annotations data
	 */
	ODataAnnotations.prototype.getAnnotationsData = function() {
		return this.oAnnotations;
	};

	/**
	 * Checks whether annotations from at least one source are available
	 *
	 * @public
	 * @returns {boolean} returns whether annotations is already loaded
	 */
	ODataAnnotations.prototype.isLoaded = function() {
		return this.bLoaded;
	};

	/**
	 * Checks whether annotations loading of at least one of the given URLs has already failed.
	 * Note: For asynchronous annotations {@link #attachFailed} has to be used.
	 *
	 * @public
	 * @returns {boolean} whether annotations request has failed
	 */
	ODataAnnotations.prototype.isFailed = function() {
		return this.oError !== null;
	};

	/**
	 * Fire event loaded to attached listeners.
	 *
	 * @param {map} [mArguments] Map of arguments that will be given as parameters to teh event handler
	 * @return {sap.ui.model.odata.ODataAnnotations} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataAnnotations.prototype.fireLoaded = function(mArguments) {
		this.fireEvent("loaded", mArguments);
		return this;
	};

	/**
	 * Attach event-handler <code>fnFunction</code> to the 'loaded' event of this <code>sap.ui.model.odata.ODataAnnotations</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.ODataAnnotations} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachLoaded = function(oData, fnFunction, oListener) {
		this.attachEvent("loaded", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'loaded' event of this <code>sap.ui.model.odata.ODataAnnotations</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.ODataAnnotations} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.detachLoaded = function(fnFunction, oListener) {
		this.detachEvent("loaded", fnFunction, oListener);
		return this;
	};


	/**
	 * Fire event failed to attached listeners.
	 *
	 * @param {object} [mArguments] the arguments to pass along with the event.
	 * @param {string} [mArguments.message]  A text that describes the failure.
	 * @param {string} [mArguments.statusCode]  HTTP status code returned by the request (if available)
	 * @param {string} [mArguments.statusText] The status as a text, details not specified, intended only for diagnosis output
	 * @param {string} [mArguments.responseText] Response that has been received for the request ,as a text string
	 *
	 * @return {sap.ui.model.odata.ODataAnnotations} <code>this</code> to allow method chaining
	 * @protected
	 */
	ODataAnnotations.prototype.fireFailed = function(mArguments) {
		this.fireEvent("failed", mArguments);
		return this;
	};


	/**
	 * Attach event-handler <code>fnFunction</code> to the 'failed' event of this <code>sap.ui.model.odata.ODataAnnotations</code>.
	 *
	 *
	 * @param {object}
	 *            [oData] The object, that should be passed along with the event-object when firing the event.
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs. This function will be called on the
	 *            oListener-instance (if present) or in a 'static way'.
	 * @param {object}
	 *            [oListener] Object on which to call the given function. If empty, the global context (window) is used.
	 *
	 * @return {sap.ui.model.odata.ODataAnnotations} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.attachFailed = function(oData, fnFunction, oListener) {
		this.attachEvent("failed", oData, fnFunction, oListener);
		return this;
	};

	/**
	 * Detach event-handler <code>fnFunction</code> from the 'failed' event of this <code>sap.ui.model.odata.ODataAnnotations</code>.
	 *
	 * The passed function and listener object must match the ones previously used for event registration.
	 *
	 * @param {function}
	 *            fnFunction The function to call, when the event occurs.
	 * @param {object}
	 *            oListener Object on which the given function had to be called.
	 * @return {sap.ui.model.odata.ODataAnnotations} <code>this</code> to allow method chaining
	 * @public
	 */
	ODataAnnotations.prototype.detachFailed = function(fnFunction, oListener) {
		this.detachEvent("failed", fnFunction, oListener);
		return this;
	};


	/**
	 * Parses the alias definitions of the annotation document and fills the internal oAlias object.
	 *
	 * @param {object} oXMLDoc - The document containing the alias definitions
	 * @param {map} mAnnotationReferences - The annotation reference object (output)
	 * @param {map} mAlias - The alias reference object (output)
	 * @return {boolean} Whether references where found in the XML document
	 * @private
	 */
	ODataAnnotations.prototype._parseReferences = function(oXMLDoc, mAnnotationReferences, mAlias) {
		var bFound = false;

		var oNode, i;

		var sAliasSelector = "//edmx:Reference/edmx:Include[@Namespace and @Alias]";
		var oAliasNodes = this.xPath.selectNodes(oXMLDoc, sAliasSelector, oXMLDoc);
		for (i = 0; i < oAliasNodes.length; ++i) {
			bFound = true;
			oNode = this.xPath.nextNode(oAliasNodes, i);
			mAlias[oNode.getAttribute("Alias")] = oNode.getAttribute("Namespace");
		}


		var sReferenceSelector = "//edmx:Reference[@Uri]/edmx:IncludeAnnotations[@TermNamespace]";
		var oReferenceNodes = this.xPath.selectNodes(oXMLDoc, sReferenceSelector, oXMLDoc);
		for (i = 0; i < oReferenceNodes.length; ++i) {
			bFound = true;
			oNode = this.xPath.nextNode(oReferenceNodes, i);
			var sTermNamespace   = oNode.getAttribute("TermNamespace");
			var sTargetNamespace = oNode.getAttribute("TargetNamespace");
			var sReferenceUri    = oNode.parentNode.getAttribute("Uri");

			if (sTargetNamespace) {
				if (!mAnnotationReferences[sTargetNamespace]) {
					mAnnotationReferences[sTargetNamespace] = {};
				}
				mAnnotationReferences[sTargetNamespace][sTermNamespace] = sReferenceUri;
			} else {
				mAnnotationReferences[sTermNamespace] = sReferenceUri;
			}
		}

		return bFound;
	};

	ODataAnnotations.prototype.parse = function(oXMLDoc) {
		var mappingList = {}, schemaNodes, oSchema = {}, schemaNode,
		termNodes, oTerms, termNode, sTermType, oMetadataProperties, annotationNodes, annotationNode,
		annotationTarget, annotationNamespace, annotation, propertyAnnotation, propertyAnnotationNodes,
		propertyAnnotationNode, sTermValue, targetAnnotation, annotationQualifier, annotationTerm,
		valueAnnotation, expandNodes, expandNode, path, pathValues, expandNodesApplFunc, i, nodeIndex;

		this.xPath = this.getXPath();
		this.oServiceMetadata = this.oMetadata.getServiceMetadata();

		// Set XPath namespace
		oXMLDoc = this.xPath.setNameSpace(oXMLDoc);
		// Schema Alias
		schemaNodes = this.xPath.selectNodes(oXMLDoc, "//d:Schema", oXMLDoc);
		for (i = 0; i < schemaNodes.length; i += 1) {
			schemaNode = this.xPath.nextNode(schemaNodes, i);
			oSchema.Alias = schemaNode.getAttribute("Alias");
			oSchema.Namespace = schemaNode.getAttribute("Namespace");
		}

		// Fill local alias and reference objects
		var oAnnotationReferences = {};
		var oAlias = {};
		var bFoundReferences = this._parseReferences(oXMLDoc, oAnnotationReferences, oAlias);
		if (bFoundReferences) {
			mappingList.annotationReferences = oAnnotationReferences;
			mappingList.aliasDefinitions = oAlias;
		}

		// Term nodes
		termNodes = this.xPath.selectNodes(oXMLDoc, "//d:Term", oXMLDoc);
		if (termNodes.length > 0) {
			oTerms = {};
			for (nodeIndex = 0; nodeIndex < termNodes.length; nodeIndex += 1) {
				termNode = this.xPath.nextNode(termNodes, nodeIndex);
				sTermType = this.replaceWithAlias(termNode.getAttribute("Type"), oAlias);
				oTerms["@" + oSchema.Alias + "." + termNode.getAttribute("Name")] = sTermType;
			}
			mappingList.termDefinitions = oTerms;
		}
		// Metadata information of all properties
		oMetadataProperties = this.getAllPropertiesMetadata(this.oServiceMetadata);
		if (oMetadataProperties.extensions) {
			mappingList.propertyExtensions = oMetadataProperties.extensions;
		}
		// Annotations
		annotationNodes = this.xPath.selectNodes(oXMLDoc, "//d:Annotations ", oXMLDoc);
		for (nodeIndex = 0; nodeIndex < annotationNodes.length; nodeIndex += 1) {
			annotationNode = this.xPath.nextNode(annotationNodes, nodeIndex);
			if (annotationNode.hasChildNodes() === false) {
				continue;
			}
			annotationTarget = annotationNode.getAttribute("Target");
			annotationNamespace = annotationTarget.split(".")[0];
			if (annotationNamespace && oAlias[annotationNamespace]) {
				annotationTarget = annotationTarget.replace(new RegExp(annotationNamespace, ""), oAlias[annotationNamespace]);
			}
			annotation = annotationTarget;
			propertyAnnotation = null;
			var sContainerAnnotation = null;
			if (annotationTarget.indexOf("/") > 0) {
				annotation = annotationTarget.split("/")[0];
				// check sAnnotation is EntityContainer: if yes, something in there is annotated - EntitySet, FunctionImport, ..
				var bSchemaExists =
					this.oServiceMetadata.dataServices &&
					this.oServiceMetadata.dataServices.schema &&
					this.oServiceMetadata.dataServices.schema.length;

				if (bSchemaExists) {
					for (var j = this.oServiceMetadata.dataServices.schema.length - 1; j >= 0; j--) {
						var oMetadataSchema = this.oServiceMetadata.dataServices.schema[j];
						if (oMetadataSchema.entityContainer) {
							var aAnnotation = annotation.split('.');
							for (var k = oMetadataSchema.entityContainer.length - 1; k >= 0; k--) {
								if (oMetadataSchema.entityContainer[k].name === aAnnotation[aAnnotation.length - 1] ) {
									sContainerAnnotation = annotationTarget.replace(annotation + "/", "");
									break;
								}
							}
						}
					}
				}

				//else - it's a property annotation
				if (!sContainerAnnotation) {
					propertyAnnotation = annotationTarget.replace(annotation + "/", "");
				}
			}
			// --- Value annotation of complex types. ---
			if (propertyAnnotation) {
				if (!mappingList.propertyAnnotations) {
					mappingList.propertyAnnotations = {};
				}
				if (!mappingList.propertyAnnotations[annotation]) {
					mappingList.propertyAnnotations[annotation] = {};
				}
				if (!mappingList.propertyAnnotations[annotation][propertyAnnotation]) {
					mappingList.propertyAnnotations[annotation][propertyAnnotation] = {};
				}

				propertyAnnotationNodes = this.xPath.selectNodes(oXMLDoc, "./d:Annotation", annotationNode);
				for (var nodeIndexValue = 0; nodeIndexValue < propertyAnnotationNodes.length; nodeIndexValue += 1) {
					propertyAnnotationNode = this.xPath.nextNode(propertyAnnotationNodes, nodeIndexValue);
					sTermValue = this.replaceWithAlias(propertyAnnotationNode.getAttribute("Term"), oAlias);
					var sQualifierValue = annotationNode.getAttribute("Qualifier") || propertyAnnotationNode.getAttribute("Qualifier");
					if (sQualifierValue) {
						sTermValue += "#" + sQualifierValue;
					}

					if (propertyAnnotationNode.hasChildNodes() === false) {
						mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] = this.getPropertyValueAttributes(propertyAnnotationNode, oAlias);
					} else {
						mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] = this.getPropertyValue(oXMLDoc, propertyAnnotationNode, oAlias);
					}

				}
				// --- Annotations ---
			} else {
				var mTarget;
				if (sContainerAnnotation) {
					// Target is an entity container
					if (!mappingList["EntityContainer"]) {
						mappingList["EntityContainer"] = {};
					}
					if (!mappingList["EntityContainer"][annotation]) {
						mappingList["EntityContainer"][annotation] = {};
					}
					mTarget = mappingList["EntityContainer"][annotation];
				} else {
					if (!mappingList[annotation]) {
						mappingList[annotation] = {};
					}
					mTarget = mappingList[annotation];
				}

				targetAnnotation = annotation.replace(oAlias[annotationNamespace], annotationNamespace);
				propertyAnnotationNodes = this.xPath.selectNodes(oXMLDoc, "./d:Annotation", annotationNode);
				for (var nodeIndexAnnotation = 0; nodeIndexAnnotation < propertyAnnotationNodes.length; nodeIndexAnnotation += 1) {
					propertyAnnotationNode = this.xPath.nextNode(propertyAnnotationNodes, nodeIndexAnnotation);
					annotationQualifier = annotationNode.getAttribute("Qualifier") || propertyAnnotationNode.getAttribute("Qualifier");
					annotationTerm = this.replaceWithAlias(propertyAnnotationNode.getAttribute("Term"), oAlias);
					if (annotationQualifier) {
						annotationTerm += "#" + annotationQualifier;
					}
					valueAnnotation = this.getPropertyValue(oXMLDoc, propertyAnnotationNode, oAlias);
					valueAnnotation = this.setEdmTypes(valueAnnotation, oMetadataProperties.types, annotation, oSchema);

					if (!sContainerAnnotation) {
						mTarget[annotationTerm] = valueAnnotation;
					} else {
						if (!mTarget[sContainerAnnotation]) {
							mTarget[sContainerAnnotation] = {};
						}
						mTarget[sContainerAnnotation][annotationTerm] = valueAnnotation;
					}

				}
				// --- Setup of Expand nodes. ---
				expandNodes = this.xPath.selectNodes(oXMLDoc, "//d:Annotations[contains(@Target, '" + targetAnnotation
						+ "')]//d:PropertyValue[contains(@Path, '/')]//@Path", oXMLDoc);
				for (i = 0; i < expandNodes.length; i += 1) {
					expandNode = this.xPath.nextNode(expandNodes, i);
					path = expandNode.value;
					if (mappingList.propertyAnnotations) {
						if (mappingList.propertyAnnotations[annotation]) {
							if (mappingList.propertyAnnotations[annotation][path]) {
								continue;
							}
						}
					}
					pathValues = path.split('/');
					if (this.isNavProperty(annotation, pathValues[0], this.oServiceMetadata)) {
						if (!mappingList.expand) {
							mappingList.expand = {};
						}
						if (!mappingList.expand[annotation]) {
							mappingList.expand[annotation] = {};
						}
						mappingList.expand[annotation][pathValues[0]] = pathValues[0];
					}
				}
				expandNodesApplFunc = this.xPath.selectNodes(oXMLDoc, "//d:Annotations[contains(@Target, '" + targetAnnotation
						+ "')]//d:Path[contains(., '/')]", oXMLDoc);
				for (i = 0; i < expandNodesApplFunc.length; i += 1) {
					expandNode = this.xPath.nextNode(expandNodesApplFunc, i);
					path = this.xPath.getNodeText(expandNode);
					if (
						mappingList.propertyAnnotations &&
						mappingList.propertyAnnotations[annotation] &&
						mappingList.propertyAnnotations[annotation][path]
					) {
						continue;
					}
					if (!mappingList.expand) {
						mappingList.expand = {};
					}
					if (!mappingList.expand[annotation]) {
						mappingList.expand[annotation] = {};
					}
					pathValues = path.split('/');
					if (this.isNavProperty(annotation, pathValues[0], this.oServiceMetadata)) {
						if (!mappingList.expand) {
							mappingList.expand = {};
						}
						if (!mappingList.expand[annotation]) {
							mappingList.expand[annotation] = {};
						}
						mappingList.expand[annotation][pathValues[0]] = pathValues[0];
					}
				}
			}
		}

		return mappingList;
	};

	ODataAnnotations.prototype.getXPath = function() {
		var xPath = {};

		if (Device.browser.internet_explorer) {// old IE
			xPath = {
				setNameSpace : function(outNode) {
					outNode.setProperty("SelectionNamespaces",
							'xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" xmlns:d="http://docs.oasis-open.org/odata/ns/edm"');
					outNode.setProperty("SelectionLanguage", "XPath");
					return outNode;
				},
				selectNodes : function(outNode, xPath, inNode) {
					return inNode.selectNodes(xPath);
				},
				nextNode : function(node) {
					return node.nextNode();
				},
				getNodeText : function(node) {
					return node.text;
				}
			};
		} else {// Chrome, Firefox, Opera, etc.
			xPath = {
				setNameSpace : function(outNode) {
					return outNode;
				},
				nsResolver : function(prefix) {
					var ns = {
						"edmx" : "http://docs.oasis-open.org/odata/ns/edmx",
						"d" : "http://docs.oasis-open.org/odata/ns/edm"
					};
					return ns[prefix] || null;
				},
				selectNodes : function(outNode, sPath, inNode) {
					var xmlNodes = outNode.evaluate(sPath, inNode, this.nsResolver, /* ORDERED_NODE_SNAPSHOT_TYPE: */ 7, null);
					xmlNodes.length = xmlNodes.snapshotLength;
					return xmlNodes;
				},
				nextNode : function(node, item) {
					return node.snapshotItem(item);
				},
				getNodeText : function(node) {
					return node.textContent;
				}
			};
		}
		
		xPath.getPath = function(oNode) {
			var sPath = "";
			var sId = "getAttribute" in oNode ? oNode.getAttribute("id") : "";
			var sTagName = oNode.tagName ? oNode.tagName : "";
			
		    if (sId) {
				// If node has an ID, use that
				sPath = 'id("' + sId + '")';
			} else if (oNode instanceof Document) {
				sPath = "/";
			} else if (sTagName.toLowerCase() === "body") {
				// If node is the body element, just return its tag name
				sPath = sTagName;
			} else if (oNode.parentNode) {
				// Count the position in the parent and get the path of the parent recursively
				
				var iPos = 1;
				for (var i = 0; i < oNode.parentNode.childNodes.length; ++i) {
					if (oNode.parentNode.childNodes[i] === oNode) {
						// Found the node inside its parent
						sPath = xPath.getPath(oNode.parentNode) +  "/" + sTagName + "[" + iPos + "]";
						break;
					} else if (oNode.parentNode.childNodes[i].nodeType === 1 && oNode.parentNode.childNodes[i].tagName === sTagName) {
						// In case there are other elements of the same kind, count them
						++iPos;
					}
				}
			} else {
				jQuery.sap.log.error("Wrong Input node - cannot find XPath to it: " + sTagName);
			}
			
			return sPath;
		};
		
		return xPath;
	};

	
	

	/**
	 * Sets an XML document
	 *
	 * @param {object} oXMLDocument The XML document to parse for annotations
	 * @param {string} sXMLContent The XML content as string to parse for annotations
	 * @param {map} [mOptions] Additional options
	 * @param {fuction} [mOptions.success] Success callback gets an objec as argument with the
	 *                  properties "annotations" containing the parsed annotations and "xmlDoc"
	 *                  containing the XML-Document that was returned by the request.
	 * @param {fuction} [mOptions.error] Error callback gets an objec as argument with the
	 *                  property "xmlDoc" containing the XML-Document that was returned by the
	 *                  request and could not be correctly parsed.
	 * @param {boolean} [mOptions.fireEvents] If this option is set to true, events are fired as if the annotations
	 *                  were loaded from a URL
	 * @return {boolean} Whether or not parsing was successful
	 * @public
	 */
	ODataAnnotations.prototype.setXML = function(oXMLDocument, sXMLContent, mOptions) {
		// Make sure there are always callable handlers
		var mDefaultOptions = {
			success:    function() {},
			error:      function() {},
			fireEvents: false
		};
		mOptions = jQuery.extend({}, mDefaultOptions, mOptions);

		var oXMLDoc = null;
		if (Device.browser.internet_explorer) {
			// IE creates an XML Document, but we cannot use it since it does not support the
			// evaluate-method. So we have to create a new document from the XML string every time.
			// This also leads to using a difference XPath implementation @see getXPath
			oXMLDoc = new ActiveXObject("Microsoft.XMLDOM"); // ??? "Msxml2.DOMDocument.6.0"
			oXMLDoc.preserveWhiteSpace = true;
			
			// The MSXML implementation does not parse documents with the technically correct "xmlns:xml"-attribute
			// So if a document contains 'xmlns:xml="http://www.w3.org/XML/1998/namespace"', IE will stop working.
			// This hack removes the XML namespace declaration which is then implicitly set to the default one.
			if (sXMLContent.indexOf(" xmlns:xml=") > -1) {
				sXMLContent = sXMLContent
					.replace(' xmlns:xml="http://www.w3.org/XML/1998/namespace"', "")
					.replace(" xmlns:xml='http://www.w3.org/XML/1998/namespace'", "");
			}
			
			oXMLDoc.loadXML(sXMLContent);
		} else if (oXMLDocument) {
			oXMLDoc = oXMLDocument;
		} else if (window.DOMParser) {
			oXMLDoc = new DOMParser().parseFromString(sXMLContent, 'application/xml');
		} else {
			jQuery.sap.log.fatal("The browser does not support XML parsing. Annotations are not available.");
			return false;
		}

		var fnParseDocument = function(oXMLDoc) {
			var mResult = {
				xmlDoc : oXMLDoc
			};

			var oAnnotations = this.parse(oXMLDoc);

			if (oAnnotations) {
				if (!this.oAnnotations) {
					this.oAnnotations = {};
				}
				jQuery.extend(true, this.oAnnotations, oAnnotations);

				mResult.annotations = this.oAnnotations;

				this.bLoaded = true;
				
				mOptions.success(mResult);
				if (mOptions.fireEvents) {
					this.fireLoaded(mResult);
				}
			} else {
				
				mOptions.error(mResult);
				if (mOptions.fireEvents) {
					this.fireFailed(mResult);
				}
			}
		}.bind(this, oXMLDoc);

		if (
			// All browsers including IE
			oXMLDoc.getElementsByTagName("parsererror").length > 0
			// IE 11 special case
			|| (oXMLDoc.parseError && oXMLDoc.parseError.errorCode !== 0)
		) {
			// Malformed XML, notify application of the problem

			// This seems to be needed since with some jQuery versions the XML document
			// is partly parsed and with some it is not parsed at all. We now choose the
			// "safe" approach and only accept completely valid documents.
			mOptions.error({
				xmlDoc : oXMLDoc
			});
			return false;
		} else {
			// Check if Metadata is loaded on the model. We need the Metadata to parse the annotations

			var oMetadata = this.oMetadata.getServiceMetadata();
			if (!oMetadata || jQuery.isEmptyObject(oMetadata)) {
				// Metadata is not loaded, wait for it before trying to parse
				this.oMetadata.attachLoaded(fnParseDocument);
			} else {
				fnParseDocument();
			}
			return true;
		}
	};

	/**
	 * Adds (a) new URL(s) to the be parsed for OData annotations, which are then merged into the annotations object
	 * which can be retrieved by calling the getAnnotations()-method.
	 *
	 * @param {string|sting[]} vUrl - Either one URL as string or an array or URL strings
	 * @return {Promise} The Promise to load the given URL(s), resolved if all URLs have been loaded, rejected if at least one failed to load
	 * 		The argument is an object containing the annotations-object, success (an array of sucessfully loaded URLs), fail (an array ob of failed URLs)
	 * @public
	 */
	ODataAnnotations.prototype.addUrl = function(vUrl) {
		var that = this;

		var aUris = vUrl;

		if (Array.isArray(vUrl) && vUrl.length == 0) {
			return Promise.resolve({annotations: this.oAnnotations});
		}

		if (!Array.isArray(vUrl)) {
			aUris = [ vUrl ];
		}

		return new Promise(function(fnResolve, fnReject) {
			var iLoadCount = 0;

			var mResults = {
				annotations: null,
				success: [],
				fail: []
			};
			var fnRequestCompleted = function(mResult) {
				iLoadCount++;

				if (mResult.type === "success") {
					mResults.success.push(mResult);
				} else {
					mResults.fail.push(mResult);
				}

				if (iLoadCount === aUris.length) {
					// Finished loading all URIs
					mResults.annotations = that.oAnnotations;

					if (mResults.success.length > 0) {
						// For compatibility reasons, we fire the loaded event if at least one has been loaded...
						var mSuccess = {
							annotations:	that.oAnnotations,
							results: 	mResults
						};

						if (that.bAsync) {
							that.fireLoaded(mSuccess);
						} else {
							that.oLoadEvent = jQuery.sap.delayedCall(0, that, that.fireLoaded, [ mSuccess ]);
						}
					}

					if (mResults.success.length < aUris.length) {
						// firefailed is called for every failed URL in _loadFromUrl
						fnReject(mResults);
					} else {
						// All URLs could be loaded and parsed
						fnResolve(mResults);
					}
				}
			};

			for (var i = 0; i < aUris.length; ++i) {
				that._loadFromUrl(aUris[i]).then(fnRequestCompleted, fnRequestCompleted);
			}
		});
	};

	/**
	 * Returns a promise to load and parse annotations from a single URL, resolves if the URL could be loaded and parsed, rejects
	 * otherwise
	 *
	 * @param {string} sUrl - The URL to load
	 * @return {Promise} The promise to load the URL. Argument contains information about the failed or succeeded request
	 */
	ODataAnnotations.prototype._loadFromUrl = function(sUrl) {
		var that = this;
		return new Promise(function(fnResolve, fnReject) {
			var mAjaxOptions = {
				url : sUrl,
				async : that.bAsync
			};

			var oRequestHandle;
			var fnFail = function(oJQXHR, sStatusText) {
				if (oRequestHandle && oRequestHandle.bSuppressErrorHandlerCall) {
					return;
				}

				that.oError = {
					type:			"fail",
					url:			sUrl,
					message:		sStatusText,
					statusCode:		oJQXHR.statusCode,
					statusText:		oJQXHR.statusText,
					responseText:	oJQXHR.responseText
				};

				if (that.bAsync) {
					that.oFailedEvent = jQuery.sap.delayedCall(0, that, that.fireFailed, [ that.oError ]);
				} else {
					that.fireFailed(that.oError);
				}

				fnReject(that.oError);

			};

			var fnSuccess = function(sData, sStatusText, oJQXHR) {
				that.setXML(oJQXHR.responseXML, oJQXHR.responseText, {
					success: function(mData) {
						fnResolve({
							type:			"success",
							url: 			sUrl,
							message:		sStatusText,
							statusCode:		oJQXHR.statusCode,
							statusText:		oJQXHR.statusText,
							responseText:		oJQXHR.responseText
						});
					},
					error : function(mData) {
						fnFail(oJQXHR, "Malformed XML document");
					}
				});
			};

			jQuery.ajax(mAjaxOptions).done(fnSuccess).fail(fnFail);
		});
	};

	ODataAnnotations.prototype.getAllPropertiesMetadata = function(oMetadata) {
		var oMetadataSchema = {},
		oPropertyTypes = {},
		oPropertyExtensions = {},
		bPropertyExtensions = false,
		sNamespace,
		aEntityTypes,
		aComplexTypes,
		oEntityType = {},
		oProperties = {},
		oExtensions = {},
		bExtensions = false,
		oProperty,
		oComplexTypeProp,
		sPropertyName,
		sType,
		oPropExtension,
		oReturn = {
			types : oPropertyTypes
		};

		if (!oMetadata.dataServices.schema) {
			return oReturn;
		}

		for (var i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
			oMetadataSchema = oMetadata.dataServices.schema[i];
			if (oMetadataSchema.entityType) {
				sNamespace = oMetadataSchema.namespace;
				aEntityTypes = oMetadataSchema.entityType;
				aComplexTypes = oMetadataSchema.complexType;
				for (var j in aEntityTypes) {
					oEntityType = aEntityTypes[j];
					oExtensions = {};
					oProperties = {};
					if (oEntityType.hasStream && oEntityType.hasStream === "true") {
						continue;
					}
					for (var k in oEntityType.property) {
						oProperty = oEntityType.property[k];
						if (oProperty.type.substring(0, sNamespace.length) === sNamespace) {
							for (var l in aComplexTypes) {
								if (aComplexTypes[l].name === oProperty.type.substring(sNamespace.length + 1)) {
									for (k in aComplexTypes[l].property) {
										oComplexTypeProp = aComplexTypes[l].property[k];
										oProperties[aComplexTypes[l].name + "/" + oComplexTypeProp.name] = oComplexTypeProp.type;
									}
								}
							}
						} else {
							sPropertyName = oProperty.name;
							sType = oProperty.type;
							for (var p in oProperty.extensions) {
								oPropExtension = oProperty.extensions[p];
								if ((oPropExtension.name === "display-format") && (oPropExtension.value === "Date")) {
									sType = "Edm.Date";
								} else {
									bExtensions = true;
									if (!oExtensions[sPropertyName]) {
										oExtensions[sPropertyName] = {};
									}
									if (oPropExtension.namespace && !oExtensions[sPropertyName][oPropExtension.namespace]) {
										oExtensions[sPropertyName][oPropExtension.namespace] = {};
									}
									oExtensions[sPropertyName][oPropExtension.namespace][oPropExtension.name] = oPropExtension.value;
								}
							}
							oProperties[sPropertyName] = sType;
						}
					}
					if (!oPropertyTypes[sNamespace + "." + oEntityType.name]) {
						oPropertyTypes[sNamespace + "." + oEntityType.name] = {};
					}
					oPropertyTypes[sNamespace + "." + oEntityType.name] = oProperties;
					if (bExtensions) {
						if (!oPropertyExtensions[sNamespace + "." + oEntityType.name]) {
							bPropertyExtensions = true;
						}
						oPropertyExtensions[sNamespace + "." + oEntityType.name] = {};
						oPropertyExtensions[sNamespace + "." + oEntityType.name] = oExtensions;
					}
				}
			}
		}
		if (bPropertyExtensions) {
			oReturn = {
				types : oPropertyTypes,
				extensions : oPropertyExtensions
			};
		}
		return oReturn;
	};

	ODataAnnotations.prototype.setEdmTypes = function(aPropertyValues, oProperties, sTarget, oSchema) {
		var oPropertyValue, sEdmType = '';
		for (var pValueIndex in aPropertyValues) {
			if (aPropertyValues[pValueIndex]) {
				oPropertyValue = aPropertyValues[pValueIndex];
				if (oPropertyValue.Value && oPropertyValue.Value.Path) {
					sEdmType = this.getEdmType(oPropertyValue.Value.Path, oProperties, sTarget, oSchema);
					if (sEdmType) {
						aPropertyValues[pValueIndex].EdmType = sEdmType;
					}
					continue;
				}
				if (oPropertyValue.Path) {
					sEdmType = this.getEdmType(oPropertyValue.Path, oProperties, sTarget, oSchema);
					if (sEdmType) {
						aPropertyValues[pValueIndex].EdmType = sEdmType;
					}
					continue;
				}
				if (oPropertyValue.Facets) {
					aPropertyValues[pValueIndex].Facets = this.setEdmTypes(oPropertyValue.Facets, oProperties, sTarget, oSchema);
					continue;
				}
				if (oPropertyValue.Data) {
					aPropertyValues[pValueIndex].Data = this.setEdmTypes(oPropertyValue.Data, oProperties, sTarget, oSchema);
					continue;
				}
				if (pValueIndex === "Data") {
					aPropertyValues.Data = this.setEdmTypes(oPropertyValue, oProperties, sTarget, oSchema);
					continue;
				}
				if (oPropertyValue.Value && oPropertyValue.Value.Apply) {
					aPropertyValues[pValueIndex].Value.Apply.Parameters = this.setEdmTypes(oPropertyValue.Value.Apply.Parameters,
							oProperties, sTarget, oSchema);
					continue;
				}
				if (oPropertyValue.Value && oPropertyValue.Type && (oPropertyValue.Type === "Path")) {
					sEdmType = this.getEdmType(oPropertyValue.Value, oProperties, sTarget, oSchema);
					if (sEdmType) {
						aPropertyValues[pValueIndex].EdmType = sEdmType;
					}
				}
			}
		}
		return aPropertyValues;
	};

	ODataAnnotations.prototype.getEdmType = function(sPath, oProperties, sTarget, oSchema) {
		if ((sPath.charAt(0) === "@") && (sPath.indexOf(oSchema.Alias) === 1)) {
			sPath = sPath.slice(oSchema.Alias.length + 2);
		}
		if (sPath.indexOf("/") >= 0) {
			if (oProperties[sPath.slice(0, sPath.indexOf("/"))]) {
				sTarget = sPath.slice(0, sPath.indexOf("/"));
				sPath = sPath.slice(sPath.indexOf("/") + 1);
			}
		}
		for (var pIndex in oProperties[sTarget]) {
			if (sPath === pIndex) {
				return oProperties[sTarget][pIndex];
			}
		}
	};


	/**
	 * Returns a map of key value pairs corresponding to the attributes of the given Node -
	 * attributes named "Property", "Term" and "Qualifier" are ignored.
	 *
	 * @param {Node} oNode - The node with the attributes
	 * @param {map} mAlias - A map containing aliases that should be replaced in the attribute value
	 * @return {map} A map containing the attributes as key/value pairs
	 * @private
	 */
	ODataAnnotations.prototype.getPropertyValueAttributes = function(oNode, mAlias) {
		var mIgnoredAttributes = { "Property" : true, "Term": true, "Qualifier": true };
		var mAttributes = {};

		for (var i = 0; i < oNode.attributes.length; i += 1) {
			if (!mIgnoredAttributes[oNode.attributes[i].name]) {
				mAttributes[oNode.attributes[i].name] = this.replaceWithAlias(oNode.attributes[i].value, mAlias);
			}
		}

		return mAttributes;
	};

	/**
	 * Returns a property value object for the given nodes
	 *
	 * @param {Document} oXmlDoc - The XML document that is parsed
	 * @param {map} mAlias - Alias map
	 * @param {XPathResult} oNodeList - As many nodes as should be checked for Record values
	 * @return {object|object[]} The extracted values
	 * @private
	 */
	ODataAnnotations.prototype._getRecordValues = function(oXmlDoc, mAlias, oNodeList) {
		var aNodeValues = [];

		for (var i = 0; i < oNodeList.length; ++i) {
			var oNode = this.xPath.nextNode(oNodeList, i);
			var vNodeValue = this.getPropertyValues(oXmlDoc, oNode, mAlias);

			var sType = oNode.getAttribute("Type");
			if (sType) {
				vNodeValue["RecordType"] = this.replaceWithAlias(sType, mAlias);
			}

			aNodeValues.push(vNodeValue);
		}

		return aNodeValues;
	};

	/**
	 * Extracts the text value from all nodes in the given NodeList and puts them into an array
	 *
	 * @param {Document} oXmlDoc - The XML document that is parsed
	 * @param {XPathResult} oNodeList - As many nodes as should be checked for Record values
	 * @param {map} [mAlias] - If this map is given, alias replacement with the given values will be performed on the found text
	 * @return {object[]} Array of values
	 * @private
	 */
	ODataAnnotations.prototype._getTextValues = function(oXmlDoc, oNodeList, mAlias) {
		var aNodeValues = [];

		for (var i = 0; i < oNodeList.length; i += 1) {
			var oNode = this.xPath.nextNode(oNodeList, i);
			var oValue = {};
			var sText = this.xPath.getNodeText(oNode);
			// TODO: Is nodeName correct or should we remove the namespace?
			oValue[oNode.nodeName] = mAlias ? this.replaceWithAlias(sText, mAlias) : sText;
			aNodeValues.push(oValue);
		}

		return aNodeValues;
	};

	/**
	 * Returns the text value of a given node and does an alias replacement if neccessary.
	 *
	 * @param {Node} oNode - The Node of which the text value should be determined
	 * @param {map} mAlias - The alias map
	 * @return {string} The text content
	 */
	ODataAnnotations.prototype._getTextValue = function(oNode, mAlias) {
		var sValue = "";
		if (oNode.nodeName in mAliasNodeWhitelist) {
			sValue = this.replaceWithAlias(this.xPath.getNodeText(oNode), mAlias);
		} else {
			sValue = this.xPath.getNodeText(oNode);
		}
		if (oNode.nodeName !== "String") {
			// Trim whitespace if it's not specified as string value
			sValue = sValue.trim();
		}
		return sValue;
	};

	ODataAnnotations.prototype.getPropertyValue = function(oXmlDocument, oDocumentNode, mAlias) {
		var vPropertyValue = {};

		if (oDocumentNode.hasChildNodes()) {
			// This is a complex value, check for child values

			var oRecordNodeList = this.xPath.selectNodes(oXmlDocument, "./d:Record", oDocumentNode);
			var aRecordValues = this._getRecordValues(oXmlDocument, mAlias, oRecordNodeList);

			var oCollectionRecordNodeList = this.xPath.selectNodes(oXmlDocument, "./d:Collection/d:Record | ./d:Collection/d:If/d:Record", oDocumentNode);
			var aCollectionRecordValues = this._getRecordValues(oXmlDocument, mAlias, oCollectionRecordNodeList);

			var aPropertyValues = aRecordValues.concat(aCollectionRecordValues);
			if (aPropertyValues.length > 0) {
				if (oCollectionRecordNodeList.length === 0 && oRecordNodeList.length > 0) {
					// Record without a collection, only ise the first one (there should be only one)
					vPropertyValue = aPropertyValues[0];
				} else {
					vPropertyValue = aPropertyValues;
				}
			} else {
				var oCollectionNodes = this.xPath.selectNodes(oXmlDocument, "./d:Collection/d:AnnotationPath | ./d:Collection/d:PropertyPath", oDocumentNode);

				if (oCollectionNodes.length > 0) {
					vPropertyValue = this._getTextValues(oXmlDocument, oCollectionNodes, mAlias);
				} else {
					vPropertyValue = this.getPropertyValueAttributes(oDocumentNode, mAlias);

					var oChildNodes = this.xPath.selectNodes(oXmlDocument, "./d:*[not(local-name() = \"Annotation\")]", oDocumentNode);
					if (oChildNodes.length > 0) {
						// Now get all values for child elements
						for (var i = 0; i < oChildNodes.length; i++) {
							var oChildNode = this.xPath.nextNode(oChildNodes, i);
							var vValue;

							var sNodeName = oChildNode.nodeName;
							var sParentName = oChildNode.parentNode.nodeName;

							if (sNodeName === "Apply") {
								vValue = this.getApplyFunctions(oXmlDocument, oChildNode, mAlias);
							} else {
								vValue = this.getPropertyValue(oXmlDocument, oChildNode, mAlias);									
							}

							// For dynamic expressions, add a Parameters Array so we can iterate over all parameters in
							// their order within the document
							if (mMultipleArgumentDynamicExpressions[sParentName]) {
								if (!Array.isArray(vPropertyValue)) {
									vPropertyValue = [];
								}

								var mValue = {};
								mValue[sNodeName] = vValue;
								vPropertyValue.push(mValue);
							} else {
								if (vPropertyValue[sNodeName]) {
									jQuery.sap.log.warning(
										"Annotation contained multiple " + sNodeName + " values. Only the last " +
										"one will be stored: " + this.xPath.getPath(oChildNode)
									);
								}
								vPropertyValue[sNodeName] = vValue;
							}
						}
					} else if (oDocumentNode.nodeName in mTextNodeWhitelist) {
						vPropertyValue = this._getTextValue(oDocumentNode, mAlias);
					}
				}
			}
		} else if (oDocumentNode.nodeName in mTextNodeWhitelist) {
			vPropertyValue = this._getTextValue(oDocumentNode, mAlias);
		} else if (oDocumentNode.nodeName.toLowerCase() === "null") {
			vPropertyValue = null;
		} else {
			vPropertyValue = this.getPropertyValueAttributes(oDocumentNode, mAlias);
		}
		return vPropertyValue;
	};

	/**
	 * Returns a map with all Annotation- and PropertyValue-elements of the given Node. The properties of the returned
	 * map consist of the PropertyValue's "Property" attribute or the Annotation's "Term" attribute.
	 * 
	 * @param {Document} oXmlDocument - The document to use for the node search
	 * @param {Element} oParentElement - The parent element in which to search
	 * @param {map} mAlias - The alias map used in {@link ODataAnnotations#replaceWithAlias}
	 * @returns {map} The collection of record values and annotations as a map
	 * @private
	 */
	ODataAnnotations.prototype.getPropertyValues = function(oXmlDocument, oParentElement, mAlias) {
		var mProperties = {}, i;

		var oAnnotationNodes = this.xPath.selectNodes(oXmlDocument, "./d:Annotation", oParentElement);
		var oPropertyValueNodes = this.xPath.selectNodes(oXmlDocument, "./d:PropertyValue", oParentElement);

		jQuery.sap.assert(
			oAnnotationNodes.length === 0 || oPropertyValueNodes.length === 0,
			"Record contains PropertyValue and Annotation elements, this is not allowed and might lead to " +
			"annotation values being overwritten. Element: " + this.xPath.getPath(oParentElement)
		);

		if (oAnnotationNodes.length === 0 && oPropertyValueNodes.length === 0) {
			mProperties = this.getPropertyValue(oXmlDocument, oParentElement, mAlias);
		} else {
			for (i = 0; i < oAnnotationNodes.length; i++) {
				var oAnnotationNode = this.xPath.nextNode(oAnnotationNodes, i);
				var sTerm = this.replaceWithAlias(oAnnotationNode.getAttribute("Term"), mAlias);
				mProperties[sTerm] = this.getPropertyValue(oXmlDocument, oAnnotationNode, mAlias);
			}

			for (i = 0; i < oPropertyValueNodes.length; i++) {
				var oPropertyValueNode = this.xPath.nextNode(oPropertyValueNodes, i);
				var sPropertyName = oPropertyValueNode.getAttribute("Property");
				mProperties[sPropertyName] = this.getPropertyValue(oXmlDocument, oPropertyValueNode, mAlias);
				
				var oApplyNodes = this.xPath.selectNodes(oXmlDocument, "./d:Apply", oPropertyValueNode);
				for (var n = 0; n < oApplyNodes.length; n += 1) {
					var oApplyNode = this.xPath.nextNode(oApplyNodes, n);
					mProperties[sPropertyName] = {};
					mProperties[sPropertyName]['Apply'] = this.getApplyFunctions(oXmlDocument, oApplyNode, mAlias);
				}
			}
		}

		return mProperties;
	};

	ODataAnnotations.prototype.getApplyFunctions = function(xmlDoc, applyNode, mAlias) {
		var mApply = {
			Name: applyNode.getAttribute('Function'),
			Parameters: []
		};

		var oParameterNodes = this.xPath.selectNodes(xmlDoc, "./d:*", applyNode);
		for (var i = 0; i < oParameterNodes.length; i += 1) {
			var oParameterNode = this.xPath.nextNode(oParameterNodes, i);
			var mParameter = {
				Type:  oParameterNode.nodeName
			};

			if (oParameterNode.nodeName === "Apply") {
				mParameter.Value = this.getApplyFunctions(xmlDoc, oParameterNode);
			} else if (oParameterNode.nodeName === "LabeledElement") {
				mParameter.Value = this.getPropertyValue(xmlDoc, oParameterNode, mAlias);
				
				// Move the name attribute up one level to keep compatibility with earlier implementation
				mParameter.Name = mParameter.Value.Name;
				delete mParameter.Value.Name;
			} else if (mMultipleArgumentDynamicExpressions[oParameterNode.nodeName]) {
				mParameter.Value = this.getPropertyValue(xmlDoc, oParameterNode, mAlias);
			} else {
				mParameter.Value = this.xPath.getNodeText(oParameterNode);
			}

			mApply.Parameters.push(mParameter);
		}

		return mApply;
	};

	/**
	 * Returns true if the given path combined with the given entity-type is found in the
	 * given metadata
	 *
	 * @param {string} sEntityType - The entity type to look for
	 * @param {string} sPathValue - The path to look for
	 * @param {object} oMetadata - The service's metadata object to search in
	 * @returns {boolean} True if the path/entityType combination is found
	 */
	ODataAnnotations.prototype.isNavProperty = function(sEntityType, sPathValue, oMetadata) {
		for (var i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
			var oMetadataSchema = oMetadata.dataServices.schema[i];
			if (oMetadataSchema.entityType) {
				var sNamespace = oMetadataSchema.namespace + ".";
				var aEntityTypes = oMetadataSchema.entityType;
				for (var k = aEntityTypes.length - 1; k >= 0; k -= 1) {
					if (sNamespace + aEntityTypes[k].name === sEntityType && aEntityTypes[k].navigationProperty) {
						for (var j = 0; j < aEntityTypes[k].navigationProperty.length; j += 1) {
							if (aEntityTypes[k].navigationProperty[j].name === sPathValue) {
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	};

	/**
	 * Replaces the first alias (existing as key in the map) found in the given string with the
	 * respective value in the map if it is not directly behind a ".". By default only one
	 * replacement is done, unless the iReplacements parameter is set to a higher number or 0
	 *
	 * @param {string} sValue - The string where the alias should be replaced
	 * @param {map} mAlias - The alias map with the alias as key and the target value as value
	 * @param {int} iReplacements - The number of replacements to doo at most or 0 for all
	 * @return {string} The string with the alias replaced
	 */
	ODataAnnotations.prototype.replaceWithAlias = function(sValue, mAlias, iReplacements) {
		if (iReplacements === undefined) {
			iReplacements = 1;
		}

		for (var sAlias in mAlias) {
			if (sValue.indexOf(sAlias + ".") >= 0 && sValue.indexOf("." + sAlias + ".") < 0) {
				sValue = sValue.replace(sAlias + ".", mAlias[sAlias] + ".");

				iReplacements--;
				if (iReplacements === 0) {
					return sValue;
				}
			}
		}
		return sValue;
	};

	ODataAnnotations.prototype.destroy = function() {
		// Abort pending xml request
		for (var i = 0; i < this.oRequestHandles.length; ++i) {
			if (this.oRequestHandles[i]) {
				this.oRequestHandles[i].bSuppressErrorHandlerCall = true;
				this.oRequestHandles[i].abort();
				this.oRequestHandles[i] = null;
			}
		}

		EventProvider.prototype.destroy.apply(this, arguments);
		if (this.oLoadEvent) {
			jQuery.sap.clearDelayedCall(this.oLoadEvent);
		}
		if (this.oFailedEvent) {
			jQuery.sap.clearDelayedCall(this.oFailedEvent);
		}
	};


	return ODataAnnotations;

});
