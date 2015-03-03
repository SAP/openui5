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

		if (sap.ui.Device.browser.internet_explorer) {// old IE
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
			// IE creates an XML Document, but we cannot use it since it does not support the
			// evaluate-method. So we have to create a new document from the XML string every time.
			// This also leads to using a difference XPath implementation @see getXPath
			oXMLDoc = new ActiveXObject("Microsoft.XMLDOM"); // ??? "Msxml2.DOMDocument.6.0"
			oXMLDoc.preserveWhiteSpace = true;
			oXMLDoc.loadXML(sXMLContent);
		} else if (oXMLDocument) {
			oXMLDoc = oXMLDocument;
		} else if (window.DOMParser) {
			oXMLDoc = new DOMParser().parseFromString(sXMLContent, 'application/xml');
		} else {
			jQuery.sap.log.fatal("The browser does not support XML parsing. Annotations are not available.");
			return;
		}

		if (oXMLDoc.getElementsByTagName("parsererror").length > 0) {
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
	 * Searches the child nodes of the given node for nodes with the name "String", "Path" or
	 * "Apply" and returns a map with the found child-name as property and the parsed value(s) as
	 * value. For "String" and "Path", the text content of the child node is used as value and
	 * for "Apply" the node is parsed using
	 * [getApplyFunctions()]{@link sap.ui.model.odata.ODataAnnotations#getApplyFunctions}
	 *
	 * @param {Document} xmlDoc - The XML-Document the node belongs to.
	 * @param {Node} documentNode - The Node that should be searched for fitting child nodes
	 * @private
	 */
	ODataAnnotations.prototype.getSimpleNodeValue = function(xmlDoc, documentNode) {
		var oValue = {};

		var oValueNodes = this.xPath.selectNodes(xmlDoc, "./d:String | ./d:Path | ./d:Apply", documentNode);
		for (var i = 0; i < oValueNodes.length; ++i) {
			var oValueNode = this.xPath.nextNode(oValueNodes, i);
			var vValue;

			switch (oValueNode.nodeName) {
				case "Apply":
					vValue = this.getApplyFunctions(xmlDoc, oValueNode, this.xPath);
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
	 * @return {object[]}
	 * @private
	 */
	ODataAnnotations.prototype._getTextValues = function(oXmlDoc, oNodeList) {
		var aNodeValues = [];

		for (var i = 0; i < oNodeList.length; i += 1) {
			var oNode = this.xPath.nextNode(oNodeList, i);
			var oValue = {};
			oValue[oNode.nodeName] = this.xPath.getNodeText(oNode); // TODO: Is nodeName correct or should we remove the namespace?
			aNodeValues.push(oValue);
		}

		return aNodeValues;
	};

	/**
	 * Adds all attribute values from the attributes named sAttributeName for
	 * the nodes in the given XPathResult as properties to the given mValue map.
	 *
	 * @param {map} mValue - The map/object to add the properties to
	 * @param {map} mAlias - Alias map
	 * @param {XPathResult} oNodeList -The nodes to be searched for Children with the attribute
	 * @param {string} sAttributeName - The attribute name which should be used to extract the value
	 * @private
	 */
	ODataAnnotations.prototype._enrichValueFromAttribute = function(/* ref: */ mValue, mAlias, oNodeList, sAttributeName) {
		for (var i = 0; i < oNodeList.length; i += 1) {
			var oNode = this.xPath.nextNode(oNodeList, i);
			if (oNode.hasChildNodes() === false) {
				var sAttributeValue = this.replaceWithAlias(oNode.getAttribute(sAttributeName), mAlias);
				mValue[sAttributeValue] = this.getPropertyValueAttributes(oNode, mAlias);
			}
		}
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
				// Search for UrlRef and Url elements, select the last if there are many (UrlRef is prefered over Url)
				var oUrlValueNodes = this.xPath.selectNodes(oXmlDocument, "./d:Url[last()] | ./d:UrlRef[last()]", oDocumentNode);

				if (oUrlValueNodes.length > 0) {
					// Only use the first entry of the result since we only asked for the last entry in the XPath query
					var oUrlValueNode = this.xPath.nextNode(oUrlValueNodes, 0);
					vPropertyValue[oUrlValueNode.nodeName] = this.getSimpleNodeValue(oXmlDocument, oUrlValueNode); // TODO: Is nodeName correct or should we remove the namespace?
				} else {
					// No Url or UrlRef found, search for Collection with AnnotationPath or PropertyPath
					var oCollectionNodes = this.xPath.selectNodes(oXmlDocument, "./d:Collection/d:AnnotationPath | ./d:Collection/d:PropertyPath", oDocumentNode);

					if (oCollectionNodes.length > 0) {
						vPropertyValue = this._getTextValues(oXmlDocument, oCollectionNodes);
					} else {
						vPropertyValue = this.getPropertyValueAttributes(oDocumentNode, mAlias);

						var oAnnotationNodes = this.xPath.selectNodes(oXmlDocument, "./d:Annotation", oDocumentNode);
						this._enrichValueFromAttribute(/* ref: */ vPropertyValue, mAlias, oAnnotationNodes, "Term");

						// Now get all values for child elements
						var oChildNodes = this.xPath.selectNodes(oXmlDocument, "./d:*[not(local-name() = \"Annotation\")]", oDocumentNode);
						for (var i = 0; i < oChildNodes.length; i++) {
							var oChildNode = this.xPath.nextNode(oChildNodes, i);
							var vValue;
							if (oChildNode.hasChildNodes()) {
								vValue = this.getPropertyValue(oXmlDocument, oChildNode, mAlias);
							} else {
								vValue = this.getPropertyValueAttributes(oChildNode, mAlias);
							}
							vPropertyValue[oChildNode.nodeName] = vValue;
						}

						if (oChildNodes.length === 0 && oDocumentNode.nodeName in mTextNodeWhitelist) {
							// hasChildNodes, but selectNodes found nothing - it should be a text node
							if (oDocumentNode.nodeName in mAliasNodeWhitelist) {
								vPropertyValue = this.replaceWithAlias(this.xPath.getNodeText(oDocumentNode), mAlias);
							} else {
								vPropertyValue = this.xPath.getNodeText(oDocumentNode);
							}
							if (oDocumentNode.nodeName !== "String") {
								// Trim whitespace if it's not specified as string value
								vPropertyValue = vPropertyValue.replace(/^[ \t\n\r]*(.*?)[ \t\n\r]*$/, "$1");
							}
						}
					}
				}
			}
		} else {
			vPropertyValue = this.getPropertyValueAttributes(oDocumentNode, mAlias);
		}
		return vPropertyValue;
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
						properties[propertyName]['Apply'] = this.getApplyFunctions(xmlDoc, applyNode);
					}
				}
			}
		} else {
			properties = this.getPropertyValue(xmlDoc, documentNode, oAlias);
		}
		return properties;
	};

	ODataAnnotations.prototype.getApplyFunctions = function(xmlDoc, applyNode) {
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

			switch (oParameterNode.nodeName) {
				case "Apply" :
					mParameter.Value = this.getApplyFunctions(xmlDoc, oParameterNode);
					break;
				case "LabeledElement" :
					mParameter.Name = oParameterNode.getAttribute("Name");
					mParameter.Value = this.getSimpleNodeValue(xmlDoc, oParameterNode);
					break;
				default :
					mParameter.Value = this.xPath.getNodeText(oParameterNode);
					break;
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
	 * @return {boolean}
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
