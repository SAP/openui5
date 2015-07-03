/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataAnnotations
sap.ui.define(['jquery.sap.global', 'sap/ui/base/EventProvider'],
	function(jQuery, EventProvider) {
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
	 * !!! EXPERIMENTAL !!!
	 *
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
	 * @experimental This feature has not been tested due to the lack of OData testing infrastructure. The API is NOT stable yet. Use at your own risk.
	 */
	var ODataAnnotations = sap.ui.base.EventProvider.extend("sap.ui.model.odata.ODataAnnotations", /** @lends sap.ui.model.odata.ODataAnnotations.prototype */
	{

		constructor : function(aAnnotationURI, oMetadata, mParams) {
			EventProvider.apply(this, arguments);
			this.oMetadata = oMetadata;
			this.oAnnotations = null;
			this.bLoaded = false;
			this.bAsync = mParams && mParams.async;
			this.xPath = null;
			this.aAnnotationURI = aAnnotationURI;
			this.error = null;
			this.bValidXML = true;
			this.oRequestHandles = [];
			this.oLoadEvent = null;
			this.oFailedEvent = null;

			// Whether the xml document is in MS proprietary
			this.xmlCompatVersion = false;


			if (aAnnotationURI) {
				this.loadXML();

				if (!this.bAsync) {
					// Synchronous loading, we can directly check for errors
					jQuery.sap.assert(
						!jQuery.isEmptyObject(this.oMetadata),
						"Metadata must be available for synchronous annotation loading"
					);
					if (this.error) {
						jQuery.sap.log.error(
							"OData annotations could not be loaded: " + this.error.message
						);
					}
				}
			}
		},
		metadata : {
			publicMethods : ["parse", "getAnnotationsData", "attachFailed", "detachAnnoationsFailed", "attachLoaded", "detachLoaded"]
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
	 * Checks whether annotations is available
	 * 
	 * @public
	 * @returns {boolean} returns whether annotations is already loaded
	 */
	ODataAnnotations.prototype.isLoaded = function() {
		return this.bLoaded;
	};

	/**
	 * Checks whether annotations loading has already failed.
	 * Note:
	 * For asynchronous annotations {@link #attachFailed} has to be used also.
	 *
	 * @public
	 * @returns {boolean} whether annotations request has failed
	 */
	ODataAnnotations.prototype.isFailed = function() {
		return this.error !== null;
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
	 * @param {object} [oXMLDoc] The document containing the alias definitions
	 * @param {object} [oAnnotationReferences] The annotation reference object (output)
	 * @param {object} [oAlias] The alias reference object (output)
	 * @return {void}
	 * @private
	 */
	ODataAnnotations.prototype._parseAliases = function(oXMLDoc, oAnnotationReferences, oAlias) {
		// Alias nodes
		var refNodes = this.xPath.selectNodes(oXMLDoc, "//edmx:Reference", oXMLDoc);

		for (var i = 0; i < refNodes.length; i += 1) {
			var refNode = this.xPath.nextNode(refNodes, i);
			var aliasNodes = this.xPath.selectNodes(oXMLDoc, "./edmx:Include", refNode);
			if (aliasNodes && aliasNodes.length > 0) {
				var aliasNode = this.xPath.nextNode(aliasNodes, 0);
				if (aliasNode.getAttribute("Alias")) {
					oAlias[aliasNode.getAttribute("Alias")] = aliasNode.getAttribute("Namespace");
				} else {
					oAlias[aliasNode.getAttribute("Namespace")] = aliasNode.getAttribute("Namespace");
				}
			}
			var annoNodes = this.xPath.selectNodes(oXMLDoc, "./edmx:IncludeAnnotations", refNode);
			if (annoNodes.length > 0) {
				for (var j = 0; j < annoNodes.length; j += 1) {
					var annoNode = this.xPath.nextNode(annoNodes, j);
					if (annoNode.getAttribute("TargetNamespace")) {
						var sAnnoNameSpace = annoNode.getAttribute("TargetNamespace");
						if (!oAnnotationReferences[sAnnoNameSpace]) {
							oAnnotationReferences[sAnnoNameSpace] = {};
						}
						oAnnotationReferences[sAnnoNameSpace][annoNode.getAttribute("TermNamespace")] = refNode.getAttribute("Uri");
					} else {
						oAnnotationReferences[annoNode.getAttribute("TermNamespace")] = refNode.getAttribute("Uri");
					}
				}
			}
		}
	};

	ODataAnnotations.prototype.parse = function(oXMLDoc) {
		var mappingList = {}, schemaNodes, oSchema = {}, schemaNode,
		oAnnotationReferences = {},
		termNodes, oTerms, termNode, sTermType, oMetadataProperties, annotationNodes, annotationNode,
		annotationTarget, annotationNamespace, annotation, propertyAnnotation, propertyAnnotationNodes,
		propertyAnnotationNode, sTermValue, targetAnnotation, annotationQualifier, annotationTerm,
		valueAnnotation, expandNodes, expandNode, path, pathValues, expandNodesApplFunc, i, nodeIndex;

		var oAlias = {};

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

		// Fill local alias object
		this._parseAliases(oXMLDoc, oAnnotationReferences, oAlias);

		if (oAnnotationReferences) {
			mappingList.annotationReferences = oAnnotationReferences;
		}
		mappingList.aliasDefinitions = oAlias;
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

		if (this.xmlCompatVersion) {// old IE
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
		return xPath;
	};


	/**
	 * Sets an XML document
	 * 
	 * @param {object} oXMLDocument The XML document to parse for annotations
	 * @param {string} sXMLContent The XML content as string to parse for annotations
	 * @param {map} mOptions Additional options
	 * @param {fuction} mOptions.success Success callback gets an objec as argument with the 
	 *                  properties "annotations" containing the parsed annotations and "xmlDoc"
	 *                  containing the XML-Document that was returned by the request.
	 * @param {fuction} mOptions.error Error callback gets an objec as argument with the 
	 *                  property "xmlDoc" containing the XML-Document that was returned by the 
	 *                  request and could not be correctly parsed.
	 * @returns {bool} Whether or not parsing was successful
	 * @public
	 */
	ODataAnnotations.prototype.setXML = function(oXMLDocument, sXMLContent, mOptions) {
		// Make sure there are always callable handlers
		var mDefaultOptions = {
			success : function() {},
			error   : function() {}
		};
		mOptions = jQuery.extend({}, mDefaultOptions, mOptions);

		var that = this;
		var oXMLDoc = null;

		if (sap.ui.Device.browser.internet_explorer) {
			// TODO: Check when IE will support evaluate-method
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
			this.xmlCompatVersion = true;
		} else if (oXMLDocument) {
			oXMLDoc = oXMLDocument;
		} else {
			oXMLDoc = new DOMParser().parseFromString(sXMLContent, 'application/xml');
		}

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

			if (jQuery.isEmptyObject(this.oMetadata.getServiceMetadata())) {
				// Metadata is not loaded, wait for it before trying to parse
				this.oMetadata.attachLoaded(function() {
					var oAnnotations = that.parse(oXMLDoc);
					if (oAnnotations) {
						mOptions.success({
							annotations: oAnnotations,
							xmlDoc : oXMLDoc
						});
					} else {
						mOptions.error({
							xmlDoc : oXMLDoc
						});
					}
				});
			} else {
				var oAnnotations = this.parse(oXMLDoc);
				if (oAnnotations) {
					mOptions.success({
						annotations: oAnnotations,
						xmlDoc : oXMLDoc
					});
				} else {
					mOptions.error({
						xmlDoc : oXMLDoc
					});
				}
			}
			return true;
		}
	};


	ODataAnnotations.prototype.loadXML = function() {
		var that = this;

		// Support loading of more than one annotation URL (merged)
		if (!jQuery.isArray(this.aAnnotationURI)) {
			this.aAnnotationURI = [ this.aAnnotationURI ];
		}

		var iLen = this.aAnnotationURI.length;
		this.mLoaded = {
			length : iLen
		};

		var fnCreateFailCallback = function(iRequest) {
			return function _handleFail(oJQXHR, sStatusText) {
				if (that.oRequestHandles[iRequest] && that.oRequestHandles[iRequest].bSuppressErrorHandlerCall) {
					return;
				}
				that.oRequestHandles[iRequest] = null;
				that.error = {
					message : sStatusText,
					statusCode : oJQXHR.statusCode,
					statusText : oJQXHR.statusText,
					url : that.aAnnotationURI[iRequest],
					responseText : oJQXHR.responseText
				};

				if (!that.bAsync) {
					that.oFailedEvent = jQuery.sap.delayedCall(0, that, that.fireFailed, [that.error]);
				} else {
					that.fireFailed(that.error);
				}
			};
		};

		var fnCreateSuccessCallback = function(iRequest, fnHandleFail) {
			return function(sData, sTextStatus, oJQXHR) {
				that.oRequestHandles[iRequest] = null;
				that.setXML(oJQXHR.responseXML, oJQXHR.responseText, {
					success: function(mData) {
						that.mLoaded[iRequest] = mData.annotations;
						that.checkAllLoaded();
					},
					error : function(mData) {
						that.mLoaded[iRequest] = false;
						fnHandleFail(oJQXHR, "Malformed XML document");
						that.checkAllLoaded();
					}
				});
			};
		};

		for (var i = 0; i < iLen; ++i) {
			this.mLoaded[i] = false;

			var mAjaxOptions = {
				url : this.aAnnotationURI[i],
				async : this.bAsync
			};

			var fnFail = fnCreateFailCallback(i);
			var fnSuccess = fnCreateSuccessCallback(i, fnFail);

			this.oRequestHandles[i] = jQuery.ajax(mAjaxOptions).done(fnSuccess).fail(fnFail);
		}
	};


	ODataAnnotations.prototype.checkAllLoaded = function() {
		var i;
		var iLen = this.mLoaded.length;
		for (i = 0; i < iLen; ++i) {
			if (!this.mLoaded[i]) {
				return;
			}
		}

		this.oAnnotations = {};
		for (i = 0; i < iLen; ++i) {
			jQuery.extend(true, this.oAnnotations, this.mLoaded[i]);
		}

		// All are loaded. Mark Annotations loaded.
		this.bLoaded = true;

		if (this.bAsync) {
			this.fireLoaded({annotations: this.oAnnotations});
		} else {
			this.oLoadEvent = jQuery.sap.delayedCall(0, this, this.fireLoaded, [{annotations: this.oAnnotations}]);
		}
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
	ODataAnnotations.prototype.getPropertyValueAttributes = function(documentNode, oAlias) {
		var sKey = "", sValue = "", i, propertyValueAttributes = {};
		for (i = 0; i < documentNode.attributes.length; i += 1) {
			var sAttrName = documentNode.attributes[i].name;
			if (sAttrName !== "Property" && sAttrName !== "Term" && sAttrName !== "Qualifier") {
				sKey = documentNode.attributes[i].name;
				sValue = documentNode.attributes[i].value;
			}
			if (sKey) {
				propertyValueAttributes[sKey] = this.replaceWithAlias(sValue, oAlias);
			}
		}
		return propertyValueAttributes;
	};

	ODataAnnotations.prototype.getSimpleNodeValue = function(xmlDoc, documentNode, mAlias) {
		var oValue = {};

		var oValueNodes = this.xPath.selectNodes(xmlDoc, "./d:String | ./d:Path | ./d:Apply", documentNode);
		for (var i = 0; i < oValueNodes.length; ++i) {
			var oValueNode = this.xPath.nextNode(oValueNodes, i);
			var vValue;

			switch (oValueNode.nodeName) {
				case "Apply":
					vValue = this.getApplyFunctions(xmlDoc, oValueNode, mAlias);
					break;

				default:
					vValue = this.xPath.getNodeText(oValueNode);
					break;
			}

			oValue[oValueNode.nodeName] = vValue;
		}

		return oValue;
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

	
	ODataAnnotations.prototype.getPropertyValue = function(xmlDoc, documentNode, oAlias) {
		var propertyValue = {}, recordNodes, recordNodeCnt, nodeIndex, recordNode, propertyValues, urlValueNodes, urlValueNode, pathNode, oPath = {}, annotationNodes, annotationNode, nodeIndexValue, termValue, collectionNodes;
		var xPath = this.getXPath();

		if (documentNode.hasChildNodes()) {
			recordNodes = this.xPath.selectNodes(xmlDoc, "./d:Record | ./d:Collection/d:Record | ./d:Collection/d:If/d:Record",
					documentNode);
			if (recordNodes.length) {
				recordNodeCnt = 0;
				for (nodeIndex = 0; nodeIndex < recordNodes.length; nodeIndex += 1) {
					recordNode = this.xPath.nextNode(recordNodes, nodeIndex);
					propertyValues = this.getPropertyValues(xmlDoc, recordNode, oAlias);
					if (recordNode.getAttribute("Type")) {
						propertyValues["RecordType"] = this.replaceWithAlias(recordNode.getAttribute("Type"), oAlias);
					}
					if (recordNodeCnt === 0) {
						if (recordNode.nextElementSibling || (recordNode.parentNode.nodeName === "Collection")
								|| (recordNode.parentNode.nodeName === "If")) {
							propertyValue = [];
							propertyValue.push(propertyValues);
						} else {
							propertyValue = propertyValues;
						}
					} else {
						propertyValue.push(propertyValues);
					}
					recordNodeCnt += 1;
				}
			} else {
				urlValueNodes = this.xPath.selectNodes(xmlDoc, "./d:UrlRef", documentNode);
				if (urlValueNodes.length > 0) {
					for (nodeIndex = 0; nodeIndex < urlValueNodes.length; nodeIndex += 1) {
						urlValueNode = this.xPath.nextNode(urlValueNodes, nodeIndex);
						propertyValue["UrlRef"] = this.getSimpleNodeValue(xmlDoc, urlValueNode);
					}
				} else {
					urlValueNodes = this.xPath.selectNodes(xmlDoc, "./d:Url", documentNode);
					if (urlValueNodes.length > 0) {
						for (nodeIndex = 0; nodeIndex < urlValueNodes.length; nodeIndex += 1) {
							urlValueNode = this.xPath.nextNode(urlValueNodes, nodeIndex);
							propertyValue["Url"] = this.getSimpleNodeValue(xmlDoc, urlValueNode);
						}
					} else {
						collectionNodes = this.xPath.selectNodes(xmlDoc,
								"./d:Collection/d:AnnotationPath | ./d:Collection/d:PropertyPath", documentNode);
						if (collectionNodes.length > 0) {
							propertyValue = [];
							for (nodeIndex = 0; nodeIndex < collectionNodes.length; nodeIndex += 1) {
								pathNode = this.xPath.nextNode(collectionNodes, nodeIndex);
								oPath = {};
								oPath[pathNode.nodeName] = this.replaceWithAlias(xPath.getNodeText(pathNode), oAlias);
								propertyValue.push(oPath);
							}
						} else {
							propertyValue = this.getPropertyValueAttributes(documentNode, oAlias);
							annotationNodes = this.xPath.selectNodes(xmlDoc, "./d:Annotation", documentNode);
							annotationNode = {};
							for (nodeIndexValue = 0; nodeIndexValue < annotationNodes.length; nodeIndexValue += 1) {
								annotationNode = this.xPath.nextNode(annotationNodes, nodeIndexValue);
								if (annotationNode.hasChildNodes() === false) {
									termValue = this.replaceWithAlias(annotationNode.getAttribute("Term"), oAlias);
									propertyValue[termValue] = this.getPropertyValueAttributes(annotationNode, oAlias);
								}
							}

							var aOtherNodes = xPath.selectNodes(xmlDoc, "./d:*", documentNode);
							if (aOtherNodes.length > 0) {
								for (var i = 0; i < aOtherNodes.length; i++) {
									var oOtherNode = xPath.nextNode(aOtherNodes, i);
									if (oOtherNode.nodeName !== "Annotation") {
										var sNodeName = oOtherNode.nodeName;
										var sParentName = oOtherNode.parentNode.nodeName;
										
										var vValue;
										if (sNodeName === "Apply") {
											vValue = this.getApplyFunctions(xmlDoc, oOtherNode, oAlias);
										} else {
											vValue = this.getPropertyValue(xmlDoc, oOtherNode, oAlias);									
										}
										
										// For dynamic expressions, add a Parameters Array so we can iterate over all parameters in 
										// their order within the document
										if (mMultipleArgumentDynamicExpressions[sParentName]) {
											if (!Array.isArray(propertyValue)) {
												propertyValue = [];
											}
											
											var mValue = {};
											mValue[sNodeName] = vValue;
											propertyValue.push(mValue);
										} else {
											if (propertyValue[sNodeName]) {
												jQuery.sap.log.warning(
													"Annotation contained multiple " + sNodeName + " values. Only the last " +
													"one will be stored"
												);
											}
											propertyValue[sNodeName] = vValue;
										}
									}
								}
							} else if (documentNode.nodeName in mTextNodeWhitelist) {
								propertyValue = this._getTextValue(documentNode, oAlias);
							}
						}
					}
				}
			}
		} else if (documentNode.nodeName in mTextNodeWhitelist) {
			propertyValue = this._getTextValue(documentNode, oAlias);
		} else {
			propertyValue = this.getPropertyValueAttributes(documentNode, oAlias);
		}
		return propertyValue;
	};
	ODataAnnotations.prototype.getPropertyValues = function(xmlDoc, documentNode, oAlias) {
		var properties = {}, annotationNode = {}, annotationNodes, nodeIndexValue, termValue, propertyValueNodes, nodeIndex, propertyValueNode, propertyName, applyNodes, applyNode, applyNodeIndex;
		annotationNodes = this.xPath.selectNodes(xmlDoc, "./d:Annotation", documentNode);
		for (nodeIndexValue = 0; nodeIndexValue < annotationNodes.length; nodeIndexValue += 1) {
			annotationNode = this.xPath.nextNode(annotationNodes, nodeIndexValue);
			if (annotationNode.hasChildNodes() === false) {
				termValue = this.replaceWithAlias(annotationNode.getAttribute("Term"), oAlias);
				properties[termValue] = this.getPropertyValueAttributes(annotationNode, oAlias);
			}
		}
		propertyValueNodes = this.xPath.selectNodes(xmlDoc, "./d:PropertyValue", documentNode);
		if (propertyValueNodes.length > 0) {
			for (nodeIndex = 0; nodeIndex < propertyValueNodes.length; nodeIndex += 1) {
				propertyValueNode = this.xPath.nextNode(propertyValueNodes, nodeIndex);
				propertyName = propertyValueNode.getAttribute("Property");
				properties[propertyName] = this.getPropertyValue(xmlDoc, propertyValueNode, oAlias);
				applyNodes = this.xPath.selectNodes(xmlDoc, "./d:Apply", propertyValueNode);
				applyNode = null;
				for (applyNodeIndex = 0; applyNodeIndex < applyNodes.length; applyNodeIndex += 1) {
					applyNode = this.xPath.nextNode(applyNodes, applyNodeIndex);
					if (applyNode) {
						properties[propertyName] = {};
						properties[propertyName]['Apply'] = this.getApplyFunctions(xmlDoc, applyNode, oAlias);
					}
				}
			}
		} else {
			properties = this.getPropertyValue(xmlDoc, documentNode, oAlias);
		}
		return properties;
	};
	ODataAnnotations.prototype.getApplyFunctions = function(xmlDoc, applyNode, mAlias) {
		var apply = {}, parameterNodes, paraNode = null, parameters = [], i;
		parameterNodes = this.xPath.selectNodes(xmlDoc, "./d:*", applyNode);
		for (i = 0; i < parameterNodes.length; i += 1) {
			paraNode = this.xPath.nextNode(parameterNodes, i);
			
			var mParameter = {
				Type:  paraNode.nodeName
			};
			
			if (paraNode.nodeName === "Apply") {
				mParameter.Value = this.getApplyFunctions(xmlDoc, paraNode);
				
			} else if (paraNode.nodeName === "LabeledElement") {
				var vValue = this.getPropertyValue(xmlDoc, paraNode, mAlias);
				
				mParameter.Name = vValue.Name;
				delete vValue.Name;
				mParameter.Value = vValue;
				
			} else if (mMultipleArgumentDynamicExpressions[paraNode.nodeName]) {
				mParameter.Value = this.getPropertyValue(xmlDoc, paraNode, mAlias);
				
			} else {
				mParameter.Value = this.xPath.getNodeText(paraNode);
			}

			parameters.push(mParameter);
			
			
		}
		apply['Name'] = applyNode.getAttribute('Function');
		apply['Parameters'] = parameters;
		return apply;
	};
	ODataAnnotations.prototype.isNavProperty = function(sEntityType, sPathValue, oMetadata) {
		var oMetadataSchema, i, namespace, aEntityTypes, j, k;
		for (i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
			oMetadataSchema = oMetadata.dataServices.schema[i];
			if (oMetadataSchema.entityType) {
				namespace = oMetadataSchema.namespace + ".";
				aEntityTypes = oMetadataSchema.entityType;
				for (k = aEntityTypes.length - 1; k >= 0; k -= 1) {
					if (namespace + aEntityTypes[k].name === sEntityType && aEntityTypes[k].navigationProperty) {
						for (j = 0; j < aEntityTypes[k].navigationProperty.length; j += 1) {
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

	ODataAnnotations.prototype.replaceWithAlias = function(sValue, oAlias) {
		for (var sAlias in oAlias) {
			if (sValue.indexOf(sAlias + ".") >= 0 && sValue.indexOf("." + sAlias + ".") < 0) {
				sValue = sValue.replace(sAlias + ".", oAlias[sAlias] + ".");
				return sValue;
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


		sap.ui.base.Object.prototype.destroy.apply(this, arguments);
		if (this.oLoadEvent) {
			jQuery.sap.clearDelayedCall(this.oLoadEvent);
		}
		if (this.oFailedEvent) {
			jQuery.sap.clearDelayedCall(this.oFailedEvent);
		}
	};


	return ODataAnnotations;

}, /* bExport= */ true);
