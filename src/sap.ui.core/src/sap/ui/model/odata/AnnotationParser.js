/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataAnnotations
sap.ui.define([
	"sap/base/assert",
	"sap/base/Log",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function (assert, Log, Device, jQuery) {
"use strict";

/*
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
 * Gets the qualifier for an <Annotation> element, possibly inherited from the direct parent
 * <Annotations> element.
 *
 * @param {Element} oAnnotationNode An <Annotation> element
 * @returns {string} The qualifier or some falsy value
 */
function getQualifier(oAnnotationNode) {
	return oAnnotationNode.getAttribute("Qualifier")
		|| oAnnotationNode.parentNode.nodeName === "Annotations"
			&& oAnnotationNode.parentNode.getAttribute("Qualifier");
}


/**
 * Static class for annotations parsing in the ODataModel (version 1 and 2 only).
 *
 * This class should not be used outside the annotations loaders.
 *
 * @static
 * @protected
 */
var AnnotationParser =  {

	/**
	 * Merges the given parsed annotation map into the given target annotation map.
	 *
	 * @param {Object<string,Object>} mTargetAnnotations The target annotation map into which the source annotations should be merged
	 * @param {Object<string,Object>} mSourceAnnotations The source annotation map that should be merged into the target annotation map
	 * @static
	 * @protected
	 */
	merge: function(mTargetAnnotations, mSourceAnnotations) {

		// Merge must be done on Term level, this is why the original line does not suffice any more:
		//     jQuery.extend(true, this.oAnnotations, mAnnotations);
		// Terms are defined on different levels, the main one is below the target level, which is directly
		// added as property to the annotations object and then in the same way inside two special properties
		// named "propertyAnnotations" and "EntityContainer"


		var sTarget, sTerm;
		var aSpecialCases = ["annotationsAtArrays", "propertyAnnotations", "EntityContainer", "annotationReferences"];

		// First merge standard annotations
		for (sTarget in mSourceAnnotations) {
			if (aSpecialCases.indexOf(sTarget) !== -1) {
				// Skip these as they are special properties that contain Target level definitions
				continue;
			}

			// ...all others contain Term level definitions
			AnnotationParser._mergeAnnotation(sTarget, mSourceAnnotations, mTargetAnnotations);
		}

		// Now merge special cases except "annotationsAtArrays"
		for (var i = 1; i < aSpecialCases.length; ++i) {
			var sSpecialCase = aSpecialCases[i];

			mTargetAnnotations[sSpecialCase] = mTargetAnnotations[sSpecialCase] || {}; // Make sure the target namespace exists
			for (sTarget in mSourceAnnotations[sSpecialCase]) {
				for (sTerm in mSourceAnnotations[sSpecialCase][sTarget]) {
					// Now merge every term
					mTargetAnnotations[sSpecialCase][sTarget] = mTargetAnnotations[sSpecialCase][sTarget] || {};
					AnnotationParser._mergeAnnotation(sTerm, mSourceAnnotations[sSpecialCase][sTarget], mTargetAnnotations[sSpecialCase][sTarget]);
				}
			}
		}

		if (mSourceAnnotations.annotationsAtArrays) {
			mTargetAnnotations.annotationsAtArrays = (mTargetAnnotations.annotationsAtArrays || [])
				.concat(mSourceAnnotations.annotationsAtArrays);
		}
	},


	/*
	 * @static
	 * @private
	 */
	_mergeAnnotation: function(sName, mAnnotations, mTarget) {
		// Everything in here must be on Term level, so we overwrite the target with the data from the source

		if (Array.isArray(mAnnotations[sName])) {
			// This is a collection - make sure it stays one
			mTarget[sName] = mAnnotations[sName].slice(0);
		} else {
			// Make sure the map exists in the target
			mTarget[sName] = mTarget[sName] || {};

			for (var sKey in mAnnotations[sName]) {
				mTarget[sName][sKey] = mAnnotations[sName][sKey];
			}
		}
	},

	/**
	 * Parses the given XML-document using the given ODataMetadata-object and returns a native JavaScript-object
	 * representation of it.
	 *
	 * This method should only be used by the ODataAnnotation-loaders.
	 *
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata The metadata to be used for interpreting the annotation document
	 * @param {document} oXMLDoc The annotation document
	 * @param {string} [sSourceUrl="metadata document"] The source URL
	 * @returns {object} The parsed annotation object
	 * @static
	 * @protected
	 */
	parse: function(oMetadata, oXMLDoc, sSourceUrl) {
		try {
			AnnotationParser._parserData = {};
			AnnotationParser._oXPath = AnnotationParser.getXPath();

			return AnnotationParser._parse(oMetadata, oXMLDoc, sSourceUrl);
		} finally {
			delete AnnotationParser._parserData;
			delete AnnotationParser._oXPath;
		}
	},

	/**
	 * Parses the given XML-document using the given ODataMetadata-object and returns a native JavaScript-object
	 * representation of it.
	 *
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata The metadata to be used for interpreting the annotation document
	 * @param {document} oXMLDoc The annotation document
	 * @param {string} [sSourceUrl="metadata document"] The source URL
	 * @returns {object} The parsed annotation object
	 * @static
	 * @private
	 */
	_parse: function(oMetadata, oXMLDoc, sSourceUrl) {
		var mappingList = {}, schemaNodes, schemaNode,
		termNodes, oTerms, termNode, sTermType, annotationNodes, annotationNode,
		annotationTarget, annotationNamespace, annotation, propertyAnnotation, propertyAnnotationNodes,
		propertyAnnotationNode, sTermValue, targetAnnotation,
		expandNodes, expandNode, path, pathValues, expandNodesApplFunc, i, nodeIndex,
		annotationsAtArrays = [];

		AnnotationParser._parserData.metadataInstance = oMetadata;
		AnnotationParser._parserData.serviceMetadata = oMetadata.getServiceMetadata();
		AnnotationParser._parserData.xmlDocument = AnnotationParser._oXPath.setNameSpace(oXMLDoc);
		AnnotationParser._parserData.schema = {};
		AnnotationParser._parserData.aliases = {};
		AnnotationParser._parserData.url = sSourceUrl ? sSourceUrl : "metadata document";
		AnnotationParser._parserData.annotationsAtArrays = annotationsAtArrays;

		// Schema Alias
		schemaNodes = AnnotationParser._oXPath.selectNodes("//d:Schema", AnnotationParser._parserData.xmlDocument);
		for (i = 0; i < schemaNodes.length; i += 1) {
			schemaNode = AnnotationParser._oXPath.nextNode(schemaNodes, i);
			AnnotationParser._parserData.schema.Alias = schemaNode.getAttribute("Alias");
			AnnotationParser._parserData.schema.Namespace = schemaNode.getAttribute("Namespace");
		}

		// Fill local alias and reference objects
		var oAnnotationReferences = {};
		var bFoundReferences = AnnotationParser._parseReferences(oAnnotationReferences);
		if (bFoundReferences) {
			mappingList.annotationReferences = oAnnotationReferences;
			mappingList.aliasDefinitions = AnnotationParser._parserData.aliases;
		}

		// Term nodes
		termNodes = AnnotationParser._oXPath.selectNodes("//d:Term", AnnotationParser._parserData.xmlDocument);
		if (termNodes.length > 0) {
			oTerms = {};
			for (nodeIndex = 0; nodeIndex < termNodes.length; nodeIndex += 1) {
				termNode = AnnotationParser._oXPath.nextNode(termNodes, nodeIndex);
				sTermType = AnnotationParser.replaceWithAlias(termNode.getAttribute("Type"));
				oTerms["@" + AnnotationParser._parserData.schema.Alias + "." + termNode.getAttribute("Name")] = sTermType;
			}
			mappingList.termDefinitions = oTerms;
		}

		// Metadata information of all properties
		AnnotationParser._parserData.metadataProperties = AnnotationParser.getAllPropertiesMetadata(AnnotationParser._parserData.serviceMetadata);
		if (AnnotationParser._parserData.metadataProperties.extensions) {
			mappingList.propertyExtensions = AnnotationParser._parserData.metadataProperties.extensions;
		}

		// Annotations
		annotationNodes = AnnotationParser._oXPath.selectNodes("//d:Annotations ", AnnotationParser._parserData.xmlDocument);
		for (nodeIndex = 0; nodeIndex < annotationNodes.length; nodeIndex += 1) {
			annotationNode = AnnotationParser._oXPath.nextNode(annotationNodes, nodeIndex);
			if (annotationNode.hasChildNodes() === false) {
				continue;
			}
			annotationTarget = annotationNode.getAttribute("Target");
			annotationNamespace = annotationTarget.split(".")[0];
			if (annotationNamespace && AnnotationParser._parserData.aliases[annotationNamespace]) {
				annotationTarget = annotationTarget.replace(new RegExp(annotationNamespace, ""), AnnotationParser._parserData.aliases[annotationNamespace]);
			}
			annotation = annotationTarget;
			propertyAnnotation = null;
			var sContainerAnnotation = null;
			if (annotationTarget.indexOf("/") > 0) {
				annotation = annotationTarget.split("/")[0];
				// check sAnnotation is EntityContainer: if yes, something in there is annotated - EntitySet, FunctionImport, ..
				var bSchemaExists =
					AnnotationParser._parserData.serviceMetadata.dataServices &&
					AnnotationParser._parserData.serviceMetadata.dataServices.schema &&
					AnnotationParser._parserData.serviceMetadata.dataServices.schema.length;

				if (bSchemaExists) {
					for (var j = AnnotationParser._parserData.serviceMetadata.dataServices.schema.length - 1; j >= 0; j--) {
						var oMetadataSchema = AnnotationParser._parserData.serviceMetadata.dataServices.schema[j];
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

				propertyAnnotationNodes = AnnotationParser._oXPath.selectNodes("./d:Annotation", annotationNode);
				for (var nodeIndexValue = 0; nodeIndexValue < propertyAnnotationNodes.length; nodeIndexValue += 1) {
					propertyAnnotationNode = AnnotationParser._oXPath.nextNode(propertyAnnotationNodes, nodeIndexValue);
					sTermValue = AnnotationParser.replaceWithAlias(propertyAnnotationNode.getAttribute("Term"));
					var sQualifierValue = getQualifier(propertyAnnotationNode);
					if (sQualifierValue) {
						sTermValue += "#" + sQualifierValue;
					}

					if (propertyAnnotationNode.hasChildNodes() === false) {
						var o = {};
						AnnotationParser.enrichFromPropertyValueAttributes(o, propertyAnnotationNode);
						if (jQuery.isEmptyObject(o)) {
							// assume DefaultValue="true" for annotation term w/o reading vocabulary
							o.Bool = "true";
						}
						mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] = o;
					} else {
						mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] = AnnotationParser.getPropertyValue(propertyAnnotationNode);
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

				targetAnnotation = annotation.replace(AnnotationParser._parserData.aliases[annotationNamespace], annotationNamespace);
				propertyAnnotationNodes = AnnotationParser._oXPath.selectNodes("./d:Annotation", annotationNode);
				for (var nodeIndexAnnotation = 0; nodeIndexAnnotation < propertyAnnotationNodes.length; nodeIndexAnnotation += 1) {
					propertyAnnotationNode = AnnotationParser._oXPath.nextNode(propertyAnnotationNodes, nodeIndexAnnotation);

					var oAnnotationTarget = mTarget;
					if (sContainerAnnotation) {
						if (!mTarget[sContainerAnnotation]) {
							mTarget[sContainerAnnotation] = {};
						}
						oAnnotationTarget = mTarget[sContainerAnnotation];
					}
					AnnotationParser._parseAnnotation(annotation, propertyAnnotationNode, oAnnotationTarget);
				}
				// --- Setup of Expand nodes. ---
				expandNodes = AnnotationParser._oXPath.selectNodes("//d:Annotations[contains(@Target, '" + targetAnnotation
						+ "')]//d:PropertyValue[contains(@Path, '/')]//@Path", AnnotationParser._parserData.xmlDocument);
				for (i = 0; i < expandNodes.length; i += 1) {
					expandNode = AnnotationParser._oXPath.nextNode(expandNodes, i);
					path = expandNode.value;
					if (mappingList.propertyAnnotations) {
						if (mappingList.propertyAnnotations[annotation]) {
							if (mappingList.propertyAnnotations[annotation][path]) {
								continue;
							}
						}
					}
					pathValues = path.split('/');
					if (AnnotationParser.findNavProperty(annotation, pathValues[0])) {
						if (!mappingList.expand) {
							mappingList.expand = {};
						}
						if (!mappingList.expand[annotation]) {
							mappingList.expand[annotation] = {};
						}
						mappingList.expand[annotation][pathValues[0]] = pathValues[0];
					}
				}
				expandNodesApplFunc = AnnotationParser._oXPath.selectNodes("//d:Annotations[contains(@Target, '" + targetAnnotation
						+ "')]//d:Path[contains(., '/')]", AnnotationParser._parserData.xmlDocument);
				for (i = 0; i < expandNodesApplFunc.length; i += 1) {
					expandNode = AnnotationParser._oXPath.nextNode(expandNodesApplFunc, i);
					path = AnnotationParser._oXPath.getNodeText(expandNode);
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
					if (AnnotationParser.findNavProperty(annotation, pathValues[0])) {
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

		if (annotationsAtArrays.length) {
			// A list of paths (as array of strings or numbers) to annotations at arrays
			mappingList.annotationsAtArrays = annotationsAtArrays.map(
				function (oAnnotationNode) {
					return AnnotationParser.backupAnnotationAtArray(oAnnotationNode, mappingList);
				});
		}

		return mappingList;
	},

	/*
	 * Backs up the annotation corresponding to the given element by adding it also as a sibling of
	 * the array under the name of "Property@Term#Qualifier". This way, it will survive
	 * (de-)serialization via JSON.stringify and JSON.parse. Returns a path which points to it.
	 *
	 * @param {Element} oElement
	 *   The <Annotation> element of an annotation inside an array
	 * @param {object} mAnnotations
	 *   The annotation map
	 * @returns {string[]}
	 *   Path of string or number segments pointing to annotation at array
	 *
	 * @private
	 * @see AnnotationParser.restoreAnnotationsAtArrays
	 * @see AnnotationParser.syncAnnotationsAtArrays
	 * @static
	 */
	backupAnnotationAtArray : function (oElement, mAnnotations) {
		var sQualifier,
			aSegments = [];

		// returns the current oElement's index in its parentElement's "children" collection
		// (but works in IE as well)
		function index() {
			return Array.prototype.filter.call(oElement.parentNode.childNodes, function (oNode) {
					return oNode.nodeType === 1;
				}).indexOf(oElement);
		}

		while (oElement.nodeName !== "Annotations") {
			switch (oElement.nodeName) {
				case "Annotation":
					sQualifier = getQualifier(oElement);
					aSegments.unshift(oElement.getAttribute("Term")
						+ (sQualifier ? "#" + sQualifier : ""));
					break;

				case "Collection":
					break;

				case "PropertyValue":
					aSegments.unshift(oElement.getAttribute("Property"));
					break;

				case "Record":
					if (oElement.parentNode.nodeName === "Collection") {
						aSegments.unshift(index());
					}
					break;

				default:
					if (oElement.parentNode.nodeName === "Apply") {
						aSegments.unshift("Value");
						aSegments.unshift(index());
						aSegments.unshift("Parameters");
					} else {
						aSegments.unshift(oElement.nodeName);
					}
					break;
			}
			oElement = oElement.parentNode;
		}
		aSegments.unshift(oElement.getAttribute("Target"));

		aSegments = aSegments.map(function (vSegment) {
			return typeof vSegment === "string"
				? AnnotationParser.replaceWithAlias(vSegment)
				: vSegment;
		});

		AnnotationParser.syncAnnotationsAtArrays(mAnnotations, aSegments, true);

		return aSegments;
	},

	/**
	 * Restores annotations at arrays which might have been lost due to serialization.
	 *
	 * @param {object} mAnnotations - The annotation map
	 *
	 * @protected
	 * @see AnnotationParser.backupAnnotationAtArray
	 * @see AnnotationParser.syncAnnotationsAtArrays
	 * @static
	 */
	restoreAnnotationsAtArrays: function (mAnnotations) {
		if (mAnnotations.annotationsAtArrays) {
			mAnnotations.annotationsAtArrays.forEach(function (aSegments) {
				AnnotationParser.syncAnnotationsAtArrays(mAnnotations, aSegments);
			});
		}
	},

	/*
	 * Sync annotations at arrays and their siblings.
	 *
	 * @param {object} mAnnotations
	 *   The annotation map
	 * @param {string[]} aSegments
	 *   Path of string or number segments pointing to annotation at array
	 * @param {boolean} bWarn
	 *   Whether warnings are allowed
	 *
	 * @private
	 * @see AnnotationParser.backupAnnotationAtArray
	 * @see AnnotationParser.restoreAnnotationsAtArrays
	 */
	syncAnnotationsAtArrays: function (mAnnotations, aSegments, bWarn) {
		var i,
			n = aSegments.length - 2,
			sAnnotation = aSegments[n + 1],
			oParent = mAnnotations,
			sProperty = aSegments[n],
			sSiblingName = sProperty + "@" + sAnnotation;

		for (i = 0; i < n; i += 1) {
			oParent = oParent && oParent[aSegments[i]];
		}
		if (oParent && Array.isArray(oParent[sProperty])) {
			if (!(sSiblingName in oParent)) {
				oParent[sSiblingName] = oParent[sProperty][sAnnotation];
			}
			if (!(sAnnotation in oParent[sProperty])) {
				oParent[sProperty][sAnnotation] = oParent[sSiblingName];
			}
		} else if (bWarn) {
			Log.warning("Wrong path to annotation at array", aSegments,
				"sap.ui.model.odata.AnnotationParser");
		}
	},

	/*
	 * Sets the parsed annotation term at the given oAnnotationTarget object.
	 *
	 * @param {string} sAnnotationTarget
	 *   The target path used to determine EDM types
	 * @param {Element} oAnnotationNode
	 *   The <Annotation> node to parse
	 * @param {object|object[]} oAnnotationTarget
	 *   The target at which the annotation value is added
	 *
	 * @static
	 * @private
	 */
	_parseAnnotation: function (sAnnotationTarget, oAnnotationNode, oAnnotationTarget) {
		var sQualifier = getQualifier(oAnnotationNode);
		var sTerm = AnnotationParser.replaceWithAlias(oAnnotationNode.getAttribute("Term"));
		if (sQualifier) {
			sTerm += "#" + sQualifier;
		}

		var vValue = AnnotationParser.getPropertyValue(oAnnotationNode, sAnnotationTarget);
		vValue = AnnotationParser.setEdmTypes(vValue, AnnotationParser._parserData.metadataProperties.types, sAnnotationTarget, AnnotationParser._parserData.schema);

		oAnnotationTarget[sTerm] = vValue;
		if (Array.isArray(oAnnotationTarget)) {
			AnnotationParser._parserData.annotationsAtArrays.push(oAnnotationNode);
		}
	},

	/*
	 * Parses the alias definitions of the annotation document and fills the internal oAlias object.
	 *
	 * @param {map} mAnnotationReferences - The annotation reference object (output)
	 * @return {boolean} Whether references where found in the XML document
	 * @static
	 * @private
	 */
	_parseReferences: function(mAnnotationReferences) {
		var bFound = false;

		var oNode, i;
		var xPath = AnnotationParser._oXPath;

		var sAliasSelector = "//edmx:Reference/edmx:Include[@Namespace and @Alias]";
		var oAliasNodes = xPath.selectNodes(sAliasSelector, AnnotationParser._parserData.xmlDocument);
		for (i = 0; i < oAliasNodes.length; ++i) {
			bFound = true;
			oNode = xPath.nextNode(oAliasNodes, i);
			AnnotationParser._parserData.aliases[oNode.getAttribute("Alias")] = oNode.getAttribute("Namespace");
		}


		var sReferenceSelector = "//edmx:Reference[@Uri]/edmx:IncludeAnnotations[@TermNamespace]";
		var oReferenceNodes = xPath.selectNodes(sReferenceSelector, AnnotationParser._parserData.xmlDocument);
		for (i = 0; i < oReferenceNodes.length; ++i) {
			bFound = true;
			oNode = xPath.nextNode(oReferenceNodes, i);
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
	},

	/*
	 * @static
	 * @private
	 */
	getAllPropertiesMetadata: function(oMetadata) {
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
				for (var j = 0; j < aEntityTypes.length; j += 1) {
					oEntityType = aEntityTypes[j];
					oExtensions = {};
					oProperties = {};
					if (oEntityType.property) {
						for (var k = 0; k < oEntityType.property.length; k += 1) {
							oProperty = oEntityType.property[k];
							if (oProperty.type.substring(0, sNamespace.length) === sNamespace) {
								if (aComplexTypes) {
									for (var l = 0; l < aComplexTypes.length; l += 1) {
										if (aComplexTypes[l].name === oProperty.type.substring(sNamespace.length + 1)) {
											if (aComplexTypes[l].property) {
												for (var m = 0; m < aComplexTypes[l].property.length; m += 1) {
													oComplexTypeProp = aComplexTypes[l].property[m];
													oProperties[aComplexTypes[l].name + "/" + oComplexTypeProp.name] = oComplexTypeProp.type;
												}
											}
										}
									}
								}
							} else {
								sPropertyName = oProperty.name;
								sType = oProperty.type;
								if (oProperty.extensions) {
									for (var p = 0; p < oProperty.extensions.length; p += 1) {
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
								}
								oProperties[sPropertyName] = sType;
							}
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
	},

	/*
	 * @static
	 * @private
	 */
	setEdmTypes: function(vPropertyValues, oProperties, sTarget, oSchema) {

		function setEdmType(vValueIndex) {
			var oPropertyValue, sEdmType = '';

			if (vPropertyValues[vValueIndex]) {
				oPropertyValue = vPropertyValues[vValueIndex];
				if (oPropertyValue.Value && oPropertyValue.Value.Path) {
					sEdmType = AnnotationParser.getEdmType(oPropertyValue.Value.Path, oProperties, sTarget, oSchema);
					if (sEdmType) {
						vPropertyValues[vValueIndex].EdmType = sEdmType;
					}
				} else if (oPropertyValue.Path) {
					sEdmType = AnnotationParser.getEdmType(oPropertyValue.Path, oProperties, sTarget, oSchema);
					if (sEdmType) {
						vPropertyValues[vValueIndex].EdmType = sEdmType;
					}
				} else if (oPropertyValue.Facets) {
					vPropertyValues[vValueIndex].Facets = AnnotationParser.setEdmTypes(oPropertyValue.Facets, oProperties, sTarget, oSchema);
				} else if (oPropertyValue.Data) {
					vPropertyValues[vValueIndex].Data = AnnotationParser.setEdmTypes(oPropertyValue.Data, oProperties, sTarget, oSchema);
				} else if (vValueIndex === "Data") {
					vPropertyValues.Data = AnnotationParser.setEdmTypes(oPropertyValue, oProperties, sTarget, oSchema);
				} else if (oPropertyValue.Value && oPropertyValue.Value.Apply) {
					vPropertyValues[vValueIndex].Value.Apply.Parameters = AnnotationParser.setEdmTypes(oPropertyValue.Value.Apply.Parameters,
							oProperties, sTarget, oSchema);
				} else if (oPropertyValue.Value && oPropertyValue.Type && (oPropertyValue.Type === "Path")) {
					sEdmType = AnnotationParser.getEdmType(oPropertyValue.Value, oProperties, sTarget, oSchema);
					if (sEdmType) {
						vPropertyValues[vValueIndex].EdmType = sEdmType;
					}
				}
			}
		}

		if (Array.isArray(vPropertyValues)) {
			for (var iValueIndex = 0; iValueIndex < vPropertyValues.length; iValueIndex += 1) {
				setEdmType(iValueIndex);
			}
		} else {
			for (var sValueIndex in vPropertyValues) {
				setEdmType(sValueIndex);
			}
		}

		return vPropertyValues;
	},

	/*
	 * @static
	 * @private
	 */
	getEdmType: function(sPath, oProperties, sTarget, oSchema) {
		var iPos = sPath.indexOf("/");
		if (iPos > -1) {
			var sPropertyName = sPath.substr(0, iPos);
			var mNavProperty = AnnotationParser.findNavProperty(sTarget, sPropertyName);

			if (mNavProperty) {
				var mToEntityType = AnnotationParser._parserData.metadataInstance._getEntityTypeByNavPropertyObject(mNavProperty);

				if (mToEntityType) {
					sTarget = mToEntityType.entityType;
					sPath = sPath.substr(iPos + 1);
				}
			}
		}

		if ((sPath.charAt(0) === "@") && (sPath.indexOf(oSchema.Alias) === 1)) {
			sPath = sPath.slice(oSchema.Alias.length + 2);
		}
		if (sPath.indexOf("/") >= 0) {
			if (oProperties[sPath.slice(0, sPath.indexOf("/"))]) {
				sTarget = sPath.slice(0, sPath.indexOf("/"));
				sPath = sPath.slice(sPath.indexOf("/") + 1);
			}
		}
		return oProperties[sTarget] && oProperties[sTarget][sPath];
	},


	/*
	 * Returns a map of key value pairs corresponding to the attributes of the given Node -
	 * attributes named "Property", "Term" and "Qualifier" are ignored.
	 *
	 * @param {map} mAttributes - A map that may already contain attributes, this map will be filled and returned by this method
	 * @param {Node} oNode - The node with the attributes
	 * @return {map} A map containing the attributes as key/value pairs
	 * @static
	 * @private
	 */
	enrichFromPropertyValueAttributes: function(mAttributes, oNode) {
		var mIgnoredAttributes = {
				"Property" : true,
				"Qualifier": true,
				"Term": true,
				"xmlns" : true
			};

		for (var i = 0; i < oNode.attributes.length; i += 1) {
			var sName = oNode.attributes[i].name;
			if (!mIgnoredAttributes[sName] && (sName.indexOf("xmlns:") !== 0)) {
				var sValue = oNode.attributes[i].value;

				// Special case: EnumMember can contain a space separated list of properties that must all have their
				// aliases replaced
				if (sName === "EnumMember" && sValue.indexOf(" ") > -1) {
					var aValues = sValue.split(" ");
					mAttributes[sName] = aValues.map(AnnotationParser.replaceWithAlias).join(" ");
				} else {
					mAttributes[sName] = AnnotationParser.replaceWithAlias(sValue);
				}
			}
		}

		return mAttributes;
	},

	/*
	 * Returns a property value object for the given nodes
	 *
	 * @param {XPathResult} oNodeList - As many nodes as should be checked for Record values
	 * @return {object|object[]} The extracted values
	 * @static
	 * @private
	 */
	_getRecordValues: function(oNodeList) {
		var aNodeValues = [];
		var xPath = AnnotationParser._oXPath;

		for (var i = 0; i < oNodeList.length; ++i) {
			var oNode = xPath.nextNode(oNodeList, i);
			var vNodeValue = AnnotationParser.getPropertyValues(oNode);

			var sType = oNode.getAttribute("Type");
			if (sType) {
				vNodeValue["RecordType"] = AnnotationParser.replaceWithAlias(sType);
			}

			aNodeValues.push(vNodeValue);
		}

		return aNodeValues;
	},

	/*
	 * Extracts the text value from all nodes in the given NodeList and puts them into an array
	 *
	 * @param {XPathResult} oNodeList - As many nodes as should be checked for Record values
	 * @return {object[]} Array of values
	 * @static
	 * @private
	 */
	_getTextValues: function(oNodeList) {
		var aNodeValues = [];
		var xPath = AnnotationParser._oXPath;

		for (var i = 0; i < oNodeList.length; i += 1) {
			var oNode = xPath.nextNode(oNodeList, i);
			var oValue = {};
			var sText = xPath.getNodeText(oNode);
			// TODO: Is nodeName correct or should we remove the namespace?
			oValue[oNode.nodeName] = AnnotationParser._parserData.aliases ? AnnotationParser.replaceWithAlias(sText) : sText;
			aNodeValues.push(oValue);
		}

		return aNodeValues;
	},

	/*
	 * Returns the text value of a given node and does an alias replacement if neccessary.
	 *
	 * @param {Node} oNode - The Node of which the text value should be determined
	 * @return {string} The text content
 	 * @static
 	 * @private
	 */
	_getTextValue: function(oNode) {
		var xPath = AnnotationParser._oXPath;

		var sValue = "";
		if (oNode.nodeName in mAliasNodeWhitelist) {
			sValue = AnnotationParser.replaceWithAlias(xPath.getNodeText(oNode));
		} else {
			sValue = xPath.getNodeText(oNode);
		}
		if (oNode.nodeName !== "String") {
			// Trim whitespace if it's not specified as string value
			sValue = sValue.trim();
		}
		return sValue;
	},

	/**
	 * Determines the annotation value (static or dynamic expression) at the given element.
	 *
	 * @param {Element} oDocumentNode
	 *   The element
	 * @param {string} [sAnnotationTarget]
	 *   The target path used to determine EDM types
	 * @returns {object|object[]}
	 *   The annotation value
	 *
	 * @static
	 * @private
	 */
	getPropertyValue: function(oDocumentNode, sAnnotationTarget) {
		var i;

		var xPath = AnnotationParser._oXPath;

		var vPropertyValue = oDocumentNode.nodeName === "Collection" ? [] : {};

		if (oDocumentNode.hasChildNodes()) {
			// This is a complex value, check for child values

			var oRecordNodeList = xPath.selectNodes("./d:Record", oDocumentNode);
			var aRecordValues = AnnotationParser._getRecordValues(oRecordNodeList);

			var oCollectionRecordNodeList = xPath.selectNodes("./d:Collection/d:Record | ./d:Collection/d:If/d:Record", oDocumentNode);
			var aCollectionRecordValues = AnnotationParser._getRecordValues(oCollectionRecordNodeList);

			var aPropertyValues = aRecordValues.concat(aCollectionRecordValues);
			if (aPropertyValues.length > 0) {
				if (oCollectionRecordNodeList.length === 0 && oRecordNodeList.length > 0) {
					// Record without a collection, only ise the first one (there should be only one)
					vPropertyValue = aPropertyValues[0];
				} else {
					vPropertyValue = aPropertyValues;
				}
			} else {
				var oCollectionNodes = xPath.selectNodes("./d:Collection/d:AnnotationPath | ./d:Collection/d:NavigationPropertyPath | ./d:Collection/d:PropertyPath", oDocumentNode);

				if (oCollectionNodes.length > 0) {
					vPropertyValue = AnnotationParser._getTextValues(oCollectionNodes);
				} else {

					var oChildNodes = xPath.selectNodes("./d:*[not(local-name() = \"Annotation\")]", oDocumentNode);
					if (oChildNodes.length > 0) {
						// Now get all values for child elements
						for (i = 0; i < oChildNodes.length; i++) {
							var oChildNode = xPath.nextNode(oChildNodes, i);
							var vValue;

							var sNodeName = oChildNode.nodeName;
							var sParentName = oChildNode.parentNode.nodeName;

							if (sNodeName === "Apply") {
								vValue = AnnotationParser.getApplyFunctions(oChildNode);
							} else {
								vValue = AnnotationParser.getPropertyValue(oChildNode);
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
							} else if (sNodeName === "Collection") {
								// Collections are lists by definition and thus should be parsed as arrays
								vPropertyValue = vValue;
							} else {
								if (vPropertyValue[sNodeName]) {
									Log.warning(
										"Annotation contained multiple " + sNodeName + " values. Only the last " +
										"one will be stored: " + xPath.getPath(oChildNode)
									);
								}
								vPropertyValue[sNodeName] = vValue;
							}
						}

						AnnotationParser.enrichFromPropertyValueAttributes(vPropertyValue, oDocumentNode);
					} else if (oDocumentNode.nodeName in mTextNodeWhitelist) {
						vPropertyValue = AnnotationParser._getTextValue(oDocumentNode); // string
					} else { // e.g. <Term Name="..." Type="...">
						AnnotationParser.enrichFromPropertyValueAttributes(vPropertyValue, oDocumentNode);
					}
				}
			}

			var oNestedAnnotations = xPath.selectNodes("./d:Annotation", oDocumentNode);
			if (oNestedAnnotations.length > 0) {
				for (i = 0; i < oNestedAnnotations.length; i++) {
					var oNestedAnnotationNode = xPath.nextNode(oNestedAnnotations, i);
					AnnotationParser._parseAnnotation(sAnnotationTarget, oNestedAnnotationNode, vPropertyValue);
				}

			}

		} else if (oDocumentNode.nodeName in mTextNodeWhitelist) {
			vPropertyValue = AnnotationParser._getTextValue(oDocumentNode);
		} else if (oDocumentNode.nodeName.toLowerCase() === "null") {
			vPropertyValue = null;
		} else {
			AnnotationParser.enrichFromPropertyValueAttributes(vPropertyValue, oDocumentNode);
		}
		return vPropertyValue;
	},

	/*
	 * Returns a map with all Annotation- and PropertyValue-elements of the given Node. The properties of the returned
	 * map consist of the PropertyValue's "Property" attribute or the Annotation's "Term" attribute.
	 *
	 * @param {Element} oParentElement - The parent element in which to search
	 * @returns {map} The collection of record values and annotations as a map
	 * @static
	 * @private
	 */
	getPropertyValues: function(oParentElement) {
		var mProperties = {}, i;
		var xPath = AnnotationParser._oXPath;

		var oAnnotationNodes = xPath.selectNodes("./d:Annotation", oParentElement);
		var oPropertyValueNodes = xPath.selectNodes("./d:PropertyValue", oParentElement);

		function getAssertText(oParentElement, sWhat, sName) {
			var oAnnotationTarget,
				oAnnotationTerm = oParentElement;

			while (oAnnotationTerm.nodeName !== "Annotation") {
				oAnnotationTerm = oAnnotationTerm.parentNode;
			}
			oAnnotationTarget = oAnnotationTerm.parentNode;

			return (sWhat + " '" + sName + "' is defined twice; "
				+ "Source = " + AnnotationParser._parserData.url
				+ ", Annotation Target = " + oAnnotationTarget.getAttribute("Target")
				+ ", Term = " + oAnnotationTerm.getAttribute("Term"));
		}

		if (oAnnotationNodes.length === 0 && oPropertyValueNodes.length === 0) {
			mProperties = AnnotationParser.getPropertyValue(oParentElement);
		} else {
			for (i = 0; i < oAnnotationNodes.length; i++) {
				var oAnnotationNode = xPath.nextNode(oAnnotationNodes, i);
				var sTerm = AnnotationParser.replaceWithAlias(oAnnotationNode.getAttribute("Term"));

				// The following function definition inside the loop will be removed in non-debug builds.
				/* eslint-disable no-loop-func */
				assert(!mProperties[sTerm], function () {
					return getAssertText(oParentElement, "Annotation", sTerm);
				});
				/* eslint-enable no-loop-func */

				mProperties[sTerm] = AnnotationParser.getPropertyValue(oAnnotationNode);
			}

			for (i = 0; i < oPropertyValueNodes.length; i++) {
				var oPropertyValueNode = xPath.nextNode(oPropertyValueNodes, i);
				var sPropertyName = oPropertyValueNode.getAttribute("Property");

				// The following function definition inside the loop will be removed in non-debug builds.
				/* eslint-disable no-loop-func */
				assert(!mProperties[sPropertyName], function () {
					return getAssertText(oParentElement, "Property", sPropertyName);
				});
				/* eslint-enable no-loop-func */

				mProperties[sPropertyName] = AnnotationParser.getPropertyValue(oPropertyValueNode);

				var oApplyNodes = xPath.selectNodes("./d:Apply", oPropertyValueNode);
				for (var n = 0; n < oApplyNodes.length; n += 1) {
					var oApplyNode = xPath.nextNode(oApplyNodes, n);
					mProperties[sPropertyName] = {};
					mProperties[sPropertyName]['Apply'] = AnnotationParser.getApplyFunctions(oApplyNode);
				}
			}
		}

		return mProperties;
	},

	/*
	 * @static
	 * @private
	 */
	getApplyFunctions: function(applyNode) {
		var xPath = AnnotationParser._oXPath;

		var mApply = {
			Name: applyNode.getAttribute('Function'),
			Parameters: []
		};

		var oParameterNodes = xPath.selectNodes("./d:*", applyNode);
		for (var i = 0; i < oParameterNodes.length; i += 1) {
			var oParameterNode = xPath.nextNode(oParameterNodes, i);
			var mParameter = {
				Type:  oParameterNode.nodeName
			};

			if (oParameterNode.nodeName === "Apply") {
				mParameter.Value = AnnotationParser.getApplyFunctions(oParameterNode);
			} else if (oParameterNode.nodeName === "LabeledElement") {
				mParameter.Value = AnnotationParser.getPropertyValue(oParameterNode);

				// Move the name attribute up one level to keep compatibility with earlier implementation
				mParameter.Name = mParameter.Value.Name;
				delete mParameter.Value.Name;
			} else if (mMultipleArgumentDynamicExpressions[oParameterNode.nodeName]) {
				mParameter.Value = AnnotationParser.getPropertyValue(oParameterNode);
			} else {
				mParameter.Value = xPath.getNodeText(oParameterNode);
			}

			mApply.Parameters.push(mParameter);
		}

		return mApply;
	},

	/*
	 * Returns true if the given path combined with the given entity-type is found in the
	 * given metadata
	 *
	 * @param {string} sEntityType - The entity type to look for
	 * @param {string} sPathValue - The path to look for
	 * @returns {map|null} The NavigationProperty map as defined in the EntityType or null if nothing is found
 	 * @static
 	 * @private
	 */
	findNavProperty: function(sEntityType, sPathValue) {
		var oMetadata = AnnotationParser._parserData.serviceMetadata;
		for (var i = oMetadata.dataServices.schema.length - 1; i >= 0; i -= 1) {
			var oMetadataSchema = oMetadata.dataServices.schema[i];
			if (oMetadataSchema.entityType) {
				var sNamespace = oMetadataSchema.namespace + ".";
				var aEntityTypes = oMetadataSchema.entityType;
				for (var k = aEntityTypes.length - 1; k >= 0; k -= 1) {
					if (sNamespace + aEntityTypes[k].name === sEntityType && aEntityTypes[k].navigationProperty) {
						for (var j = 0; j < aEntityTypes[k].navigationProperty.length; j += 1) {
							if (aEntityTypes[k].navigationProperty[j].name === sPathValue) {
								return aEntityTypes[k].navigationProperty[j];
							}
						}
					}
				}
			}
		}
		return null;
	},

	/*
	 * Replaces the first alias (existing as key in the map) found in the given string with the
	 * respective value in the map if it is not directly behind a ".". By default only one
	 * replacement is done, unless the iReplacements parameter is set to a higher number or 0
	 *
	 * @param {string} sValue - The string where the alias should be replaced
	 * @param {int} iReplacements - The number of replacements to doo at most or 0 for all
	 * @return {string} The string with the alias replaced
 	 * @static
 	 * @private
	 */
	replaceWithAlias: function(sValue, iReplacements) {
		if (iReplacements === undefined) {
			iReplacements = 1;
		}
		for (var sAlias in AnnotationParser._parserData.aliases) {
			if (sValue.indexOf(sAlias + ".") >= 0 && sValue.indexOf("." + sAlias + ".") < 0) {
				sValue = sValue.replace(sAlias + ".", AnnotationParser._parserData.aliases[sAlias] + ".");

				iReplacements--;
				if (iReplacements === 0) {
					return sValue;
				}
			}
		}
		return sValue;
	},

	/*
	 * @static
	 * @private
	 */
	getXPath: function() {
		var xPath = {};
		var mParserData = AnnotationParser._parserData;

		if (Device.browser.msie) {// old IE
			xPath = {
				setNameSpace : function(outNode) {
					outNode.setProperty("SelectionNamespaces",
							'xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" xmlns:d="http://docs.oasis-open.org/odata/ns/edm"');
					outNode.setProperty("SelectionLanguage", "XPath");
					return outNode;
				},
				selectNodes : function(xPath, inNode) {
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
				selectNodes : function(sPath, inNode) {
					var xmlNodes = mParserData.xmlDocument.evaluate(sPath, inNode, this.nsResolver, /* ORDERED_NODE_SNAPSHOT_TYPE: */ 7, null);
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
				Log.error("Wrong Input node - cannot find XPath to it: " + sTagName);
			}

			return sPath;
		};

		return xPath;
	}

};


return AnnotationParser;

});