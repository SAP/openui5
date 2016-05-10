/*!
 * ${copyright}
 */

// Provides class sap.ui.model.odata.ODataAnnotations
sap.ui.define(['jquery.sap.global', 'sap/ui/Device'], function(jQuery, Device) {
"use strict";

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



var AnnotationsParser =  {

	parse: function(oMetadata, oXMLDoc) {
		var mappingList = {}, schemaNodes, schemaNode,
		termNodes, oTerms, termNode, sTermType, annotationNodes, annotationNode,
		annotationTarget, annotationNamespace, annotation, propertyAnnotation, propertyAnnotationNodes,
		propertyAnnotationNode, sTermValue, targetAnnotation, annotationTerm,
		valueAnnotation, expandNodes, expandNode, path, pathValues, expandNodesApplFunc, i, nodeIndex;

		this._parserData = {};

		this._oXPath = this.getXPath();
		this._parserData.metadataInstance = oMetadata;
		this._parserData.serviceMetadata = oMetadata.getServiceMetadata();
		this._parserData.xmlDocument = this._oXPath.setNameSpace(oXMLDoc);
		this._parserData.schema = {};
		this._parserData.aliases = {};

		// Schema Alias
		schemaNodes = this._oXPath.selectNodes("//d:Schema", this._parserData.xmlDocument);
		for (i = 0; i < schemaNodes.length; i += 1) {
			schemaNode = this._oXPath.nextNode(schemaNodes, i);
			this._parserData.schema.Alias = schemaNode.getAttribute("Alias");
			this._parserData.schema.Namespace = schemaNode.getAttribute("Namespace");
		}

		// Fill local alias and reference objects
		var oAnnotationReferences = {};
		var bFoundReferences = this._parseReferences(oAnnotationReferences);
		if (bFoundReferences) {
			mappingList.annotationReferences = oAnnotationReferences;
			mappingList.aliasDefinitions = this._parserData.aliases;
		}

		// Term nodes
		termNodes = this._oXPath.selectNodes("//d:Term", this._parserData.xmlDocument);
		if (termNodes.length > 0) {
			oTerms = {};
			for (nodeIndex = 0; nodeIndex < termNodes.length; nodeIndex += 1) {
				termNode = this._oXPath.nextNode(termNodes, nodeIndex);
				sTermType = this.replaceWithAlias(termNode.getAttribute("Type"));
				oTerms["@" + this._parserData.schema.Alias + "." + termNode.getAttribute("Name")] = sTermType;
			}
			mappingList.termDefinitions = oTerms;
		}

		// Metadata information of all properties
		this._parserData.metadataProperties = this.getAllPropertiesMetadata(this._parserData.serviceMetadata);
		if (this._parserData.metadataProperties.extensions) {
			mappingList.propertyExtensions = this._parserData.metadataProperties.extensions;
		}

		// Annotations
		annotationNodes = this._oXPath.selectNodes("//d:Annotations ", this._parserData.xmlDocument);
		for (nodeIndex = 0; nodeIndex < annotationNodes.length; nodeIndex += 1) {
			annotationNode = this._oXPath.nextNode(annotationNodes, nodeIndex);
			if (annotationNode.hasChildNodes() === false) {
				continue;
			}
			annotationTarget = annotationNode.getAttribute("Target");
			annotationNamespace = annotationTarget.split(".")[0];
			if (annotationNamespace && this._parserData.aliases[annotationNamespace]) {
				annotationTarget = annotationTarget.replace(new RegExp(annotationNamespace, ""), this._parserData.aliases[annotationNamespace]);
			}
			annotation = annotationTarget;
			propertyAnnotation = null;
			var sContainerAnnotation = null;
			if (annotationTarget.indexOf("/") > 0) {
				annotation = annotationTarget.split("/")[0];
				// check sAnnotation is EntityContainer: if yes, something in there is annotated - EntitySet, FunctionImport, ..
				var bSchemaExists =
					this._parserData.serviceMetadata.dataServices &&
					this._parserData.serviceMetadata.dataServices.schema &&
					this._parserData.serviceMetadata.dataServices.schema.length;

				if (bSchemaExists) {
					for (var j = this._parserData.serviceMetadata.dataServices.schema.length - 1; j >= 0; j--) {
						var oMetadataSchema = this._parserData.serviceMetadata.dataServices.schema[j];
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

				propertyAnnotationNodes = this._oXPath.selectNodes("./d:Annotation", annotationNode);
				for (var nodeIndexValue = 0; nodeIndexValue < propertyAnnotationNodes.length; nodeIndexValue += 1) {
					propertyAnnotationNode = this._oXPath.nextNode(propertyAnnotationNodes, nodeIndexValue);
					sTermValue = this.replaceWithAlias(propertyAnnotationNode.getAttribute("Term"));
					var sQualifierValue = annotationNode.getAttribute("Qualifier") || propertyAnnotationNode.getAttribute("Qualifier");
					if (sQualifierValue) {
						sTermValue += "#" + sQualifierValue;
					}

					if (propertyAnnotationNode.hasChildNodes() === false) {
						mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] =
							this.enrichFromPropertyValueAttributes({}, propertyAnnotationNode);
					} else {
						mappingList.propertyAnnotations[annotation][propertyAnnotation][sTermValue] = this.getPropertyValue(propertyAnnotationNode);
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

				targetAnnotation = annotation.replace(this._parserData.aliases[annotationNamespace], annotationNamespace);
				propertyAnnotationNodes = this._oXPath.selectNodes("./d:Annotation", annotationNode);
				for (var nodeIndexAnnotation = 0; nodeIndexAnnotation < propertyAnnotationNodes.length; nodeIndexAnnotation += 1) {
					propertyAnnotationNode = this._oXPath.nextNode(propertyAnnotationNodes, nodeIndexAnnotation);

					var mAnnotation = this._parseAnnotation(annotation, annotationNode, propertyAnnotationNode);
					annotationTerm = mAnnotation.key;
					valueAnnotation = mAnnotation.value;

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
				expandNodes = this._oXPath.selectNodes("//d:Annotations[contains(@Target, '" + targetAnnotation
						+ "')]//d:PropertyValue[contains(@Path, '/')]//@Path", this._parserData.xmlDocument);
				for (i = 0; i < expandNodes.length; i += 1) {
					expandNode = this._oXPath.nextNode(expandNodes, i);
					path = expandNode.value;
					if (mappingList.propertyAnnotations) {
						if (mappingList.propertyAnnotations[annotation]) {
							if (mappingList.propertyAnnotations[annotation][path]) {
								continue;
							}
						}
					}
					pathValues = path.split('/');
					if (!!this.findNavProperty(annotation, pathValues[0])) {
						if (!mappingList.expand) {
							mappingList.expand = {};
						}
						if (!mappingList.expand[annotation]) {
							mappingList.expand[annotation] = {};
						}
						mappingList.expand[annotation][pathValues[0]] = pathValues[0];
					}
				}
				expandNodesApplFunc = this._oXPath.selectNodes("//d:Annotations[contains(@Target, '" + targetAnnotation
						+ "')]//d:Path[contains(., '/')]", this._parserData.xmlDocument);
				for (i = 0; i < expandNodesApplFunc.length; i += 1) {
					expandNode = this._oXPath.nextNode(expandNodesApplFunc, i);
					path = this._oXPath.getNodeText(expandNode);
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
					if (!!this.findNavProperty(annotation, pathValues[0])) {
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

		this._parserData = null;
		return mappingList;
	},


	_parseAnnotation: function (sAnnotationTarget, oAnnotationsNode, oAnnotationNode) {

		var sQualifier = oAnnotationsNode.getAttribute("Qualifier") || oAnnotationNode.getAttribute("Qualifier");
		var sTerm = this.replaceWithAlias(oAnnotationNode.getAttribute("Term"), this._parserData.aliases);
		if (sQualifier) {
			sTerm += "#" + sQualifier;
		}

		var vValue = this.getPropertyValue(oAnnotationNode, this._parserData.aliases, sAnnotationTarget);
		vValue = this.setEdmTypes(vValue, this._parserData.metadataProperties.types, sAnnotationTarget, this._parserData.schema);

		return {
			key: sTerm,
			value: vValue
		};
	},

	/**
	 * Parses the alias definitions of the annotation document and fills the internal oAlias object.
	 *
	 * @param {map} mAnnotationReferences - The annotation reference object (output)
	 * @param {map} mAlias - The alias reference object (output)
	 * @return {boolean} Whether references where found in the XML document
	 * @private
	 */
	_parseReferences: function(mAnnotationReferences) {
		var bFound = false;

		var oNode, i;
		var xPath = this._oXPath;

		var sAliasSelector = "//edmx:Reference/edmx:Include[@Namespace and @Alias]";
		var oAliasNodes = xPath.selectNodes(sAliasSelector, this._parserData.xmlDocument);
		for (i = 0; i < oAliasNodes.length; ++i) {
			bFound = true;
			oNode = xPath.nextNode(oAliasNodes, i);
			this._parserData.aliases[oNode.getAttribute("Alias")] = oNode.getAttribute("Namespace");
		}


		var sReferenceSelector = "//edmx:Reference[@Uri]/edmx:IncludeAnnotations[@TermNamespace]";
		var oReferenceNodes = xPath.selectNodes(sReferenceSelector, this._parserData.xmlDocument);
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
	},

	setEdmTypes: function(aPropertyValues, oProperties, sTarget, oSchema) {
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
	},

	getEdmType: function(sPath, oProperties, sTarget, oSchema) {
		var iPos = sPath.indexOf("/");
		if (iPos > -1) {
			var sPropertyName = sPath.substr(0, iPos);
			var mNavProperty = this.findNavProperty(sTarget, sPropertyName);

			if (mNavProperty) {
				var mToEntityType = this._parserData.metadataInstance._getEntityTypeByNavPropertyObject(mNavProperty);

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
		for (var pIndex in oProperties[sTarget]) {
			if (sPath === pIndex) {
				return oProperties[sTarget][pIndex];
			}
		}
	},


	/**
	 * Returns a map of key value pairs corresponding to the attributes of the given Node -
	 * attributes named "Property", "Term" and "Qualifier" are ignored.
	 *
	 * @param {map} mAttributes - A map that may already contain attributes, this map will be filled and returned by this method
	 * @param {Node} oNode - The node with the attributes
	 * @param {map} mAlias - A map containing aliases that should be replaced in the attribute value
	 * @return {map} A map containing the attributes as key/value pairs
	 * @private
	 */
	enrichFromPropertyValueAttributes: function(mAttributes, oNode) {
		var mIgnoredAttributes = { "Property" : true, "Term": true, "Qualifier": true };

		var fnReplaceAlias = function(sValue) {
			return this.replaceWithAlias(sValue);
		}.bind(this);

		for (var i = 0; i < oNode.attributes.length; i += 1) {
			if (!mIgnoredAttributes[oNode.attributes[i].name]) {
				var sName = oNode.attributes[i].name;
				var sValue = oNode.attributes[i].value;

				// Special case: EnumMember can contain a space separated list of properties that must all have their
				// aliases replaced
				if (sName === "EnumMember" && sValue.indexOf(" ") > -1) {
					var aValues = sValue.split(" ");
					mAttributes[sName] = aValues.map(fnReplaceAlias).join(" ");
				} else {
					mAttributes[sName] = this.replaceWithAlias(sValue);
				}
			}
		}

		return mAttributes;
	},

	/**
	 * Returns a property value object for the given nodes
	 *
	 * @param {Document} oXmlDoc - The XML document that is parsed
	 * @param {map} mAlias - Alias map
	 * @param {XPathResult} oNodeList - As many nodes as should be checked for Record values
	 * @return {object|object[]} The extracted values
	 * @private
	 */
	_getRecordValues: function(oNodeList) {
		var aNodeValues = [];
		var xPath = this._oXPath;

		for (var i = 0; i < oNodeList.length; ++i) {
			var oNode = xPath.nextNode(oNodeList, i);
			var vNodeValue = this.getPropertyValues(oNode);

			var sType = oNode.getAttribute("Type");
			if (sType) {
				vNodeValue["RecordType"] = this.replaceWithAlias(sType);
			}

			aNodeValues.push(vNodeValue);
		}

		return aNodeValues;
	},

	/**
	 * Extracts the text value from all nodes in the given NodeList and puts them into an array
	 *
	 * @param {Document} oXmlDoc - The XML document that is parsed
	 * @param {XPathResult} oNodeList - As many nodes as should be checked for Record values
	 * @param {map} [mAlias] - If this map is given, alias replacement with the given values will be performed on the found text
	 * @return {object[]} Array of values
	 * @private
	 */
	_getTextValues: function(oNodeList) {
		var aNodeValues = [];
		var xPath = this._oXPath;

		for (var i = 0; i < oNodeList.length; i += 1) {
			var oNode = xPath.nextNode(oNodeList, i);
			var oValue = {};
			var sText = xPath.getNodeText(oNode);
			// TODO: Is nodeName correct or should we remove the namespace?
			oValue[oNode.nodeName] = this._parserData.aliases ? this.replaceWithAlias(sText) : sText;
			aNodeValues.push(oValue);
		}

		return aNodeValues;
	},

	/**
	 * Returns the text value of a given node and does an alias replacement if neccessary.
	 *
	 * @param {Node} oNode - The Node of which the text value should be determined
	 * @param {map} mAlias - The alias map
	 * @return {string} The text content
	 */
	_getTextValue: function(oNode) {
		var xPath = this._oXPath;

		var sValue = "";
		if (oNode.nodeName in mAliasNodeWhitelist) {
			sValue = this.replaceWithAlias(xPath.getNodeText(oNode));
		} else {
			sValue = xPath.getNodeText(oNode);
		}
		if (oNode.nodeName !== "String") {
			// Trim whitespace if it's not specified as string value
			sValue = sValue.trim();
		}
		return sValue;
	},

	getPropertyValue: function(oDocumentNode, sAnnotationTarget) {
		var i;

		var xPath = this._oXPath;

		var vPropertyValue = oDocumentNode.nodeName === "Collection" ? [] : {};

		if (oDocumentNode.hasChildNodes()) {
			// This is a complex value, check for child values

			var oRecordNodeList = xPath.selectNodes("./d:Record", oDocumentNode);
			var aRecordValues = this._getRecordValues(oRecordNodeList);

			var oCollectionRecordNodeList = xPath.selectNodes("./d:Collection/d:Record | ./d:Collection/d:If/d:Record", oDocumentNode);
			var aCollectionRecordValues = this._getRecordValues(oCollectionRecordNodeList);

			var aPropertyValues = aRecordValues.concat(aCollectionRecordValues);
			if (aPropertyValues.length > 0) {
				if (oCollectionRecordNodeList.length === 0 && oRecordNodeList.length > 0) {
					// Record without a collection, only ise the first one (there should be only one)
					vPropertyValue = aPropertyValues[0];
				} else {
					vPropertyValue = aPropertyValues;
				}
			} else {
				var oCollectionNodes = xPath.selectNodes("./d:Collection/d:AnnotationPath | ./d:Collection/d:PropertyPath", oDocumentNode);

				if (oCollectionNodes.length > 0) {
					vPropertyValue = this._getTextValues(oCollectionNodes);
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
								vValue = this.getApplyFunctions(oChildNode);
							} else {
								vValue = this.getPropertyValue(oChildNode);
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
									jQuery.sap.log.warning(
										"Annotation contained multiple " + sNodeName + " values. Only the last " +
										"one will be stored: " + xPath.getPath(oChildNode)
									);
								}
								vPropertyValue[sNodeName] = vValue;
							}
						}
					} else if (oDocumentNode.nodeName in mTextNodeWhitelist) {
						vPropertyValue = this._getTextValue(oDocumentNode);
					}

					this.enrichFromPropertyValueAttributes(vPropertyValue, oDocumentNode);
				}
			}

			var oNestedAnnotations = xPath.selectNodes("./d:Annotation", oDocumentNode);
			if (oNestedAnnotations.length > 0) {
				for (i = 0; i < oNestedAnnotations.length; i++) {
					var oNestedAnnotationNode = xPath.nextNode(oNestedAnnotations, i);
					var mAnnotation = this._parseAnnotation(sAnnotationTarget, oDocumentNode, oNestedAnnotationNode);

					vPropertyValue[mAnnotation.key] = mAnnotation.value;
				}

			}

		} else if (oDocumentNode.nodeName in mTextNodeWhitelist) {
			vPropertyValue = this._getTextValue(oDocumentNode);
		} else if (oDocumentNode.nodeName.toLowerCase() === "null") {
			vPropertyValue = null;
		} else {
			this.enrichFromPropertyValueAttributes(vPropertyValue, oDocumentNode);
		}
		return vPropertyValue;
	},

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
	getPropertyValues: function(oParentElement) {
		var mProperties = {}, i;
		var xPath = this._oXPath;

		var oAnnotationNodes = xPath.selectNodes("./d:Annotation", oParentElement);
		var oPropertyValueNodes = xPath.selectNodes("./d:PropertyValue", oParentElement);


		if (oAnnotationNodes.length === 0 && oPropertyValueNodes.length === 0) {
			mProperties = this.getPropertyValue(oParentElement);
		} else {
			for (i = 0; i < oAnnotationNodes.length; i++) {
				var oAnnotationNode = xPath.nextNode(oAnnotationNodes, i);
				var sTerm = this.replaceWithAlias(oAnnotationNode.getAttribute("Term"));

				// The following function definition inside the loop will be removed in non-debug builds.
				/* eslint-disable no-loop-func */
				jQuery.sap.assert(!mProperties[sTerm], function () {
					return (
						"Record contains values that overwrite previous ones; this is not allowed." +
						" Element: " + xPath.getPath(oParentElement)
					);
				});
				/* eslint-enable no-loop-func */

				mProperties[sTerm] = this.getPropertyValue(oAnnotationNode);
			}

			for (i = 0; i < oPropertyValueNodes.length; i++) {
				var oPropertyValueNode = xPath.nextNode(oPropertyValueNodes, i);
				var sPropertyName = oPropertyValueNode.getAttribute("Property");

				// The following function definition inside the loop will be removed in non-debug builds.
				/* eslint-disable no-loop-func */
				jQuery.sap.assert(!mProperties[sPropertyName], function () {
					return (
						"Record contains values that overwrite previous ones; this is not allowed." +
						" Element: " + xPath.getPath(oParentElement)
					);
				});
				/* eslint-enable no-loop-func */

				mProperties[sPropertyName] = this.getPropertyValue(oPropertyValueNode);

				var oApplyNodes = xPath.selectNodes("./d:Apply", oPropertyValueNode);
				for (var n = 0; n < oApplyNodes.length; n += 1) {
					var oApplyNode = xPath.nextNode(oApplyNodes, n);
					mProperties[sPropertyName] = {};
					mProperties[sPropertyName]['Apply'] = this.getApplyFunctions(oApplyNode);
				}
			}
		}

		return mProperties;
	},

	getApplyFunctions: function(applyNode) {
		var xPath = this._oXPath;

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
				mParameter.Value = this.getApplyFunctions(oParameterNode);
			} else if (oParameterNode.nodeName === "LabeledElement") {
				mParameter.Value = this.getPropertyValue(oParameterNode);

				// Move the name attribute up one level to keep compatibility with earlier implementation
				mParameter.Name = mParameter.Value.Name;
				delete mParameter.Value.Name;
			} else if (mMultipleArgumentDynamicExpressions[oParameterNode.nodeName]) {
				mParameter.Value = this.getPropertyValue(oParameterNode);
			} else {
				mParameter.Value = xPath.getNodeText(oParameterNode);
			}

			mApply.Parameters.push(mParameter);
		}

		return mApply;
	},

	/**
	 * Returns true if the given path combined with the given entity-type is found in the
	 * given metadata
	 *
	 * @param {string} sEntityType - The entity type to look for
	 * @param {string} sPathValue - The path to look for
	 * @param {object} oMetadata - The service's metadata object to search in
	 * @returns {map|null} The NavigationProperty map as defined in the EntityType or null if nothing is found
	 */
	findNavProperty: function(sEntityType, sPathValue) {
		var oMetadata = this._parserData.serviceMetadata;
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
	replaceWithAlias: function(sValue, iReplacements) {
		if (iReplacements === undefined) {
			iReplacements = 1;
		}

		for (var sAlias in this._parserData.aliases) {
			if (sValue.indexOf(sAlias + ".") >= 0 && sValue.indexOf("." + sAlias + ".") < 0) {
				sValue = sValue.replace(sAlias + ".", this._parserData.aliases[sAlias] + ".");

				iReplacements--;
				if (iReplacements === 0) {
					return sValue;
				}
			}
		}
		return sValue;
	},




	getXPath: function() {
		var xPath = {};
		var mParserData = this._parserData;

		if (Device.browser.internet_explorer) {// old IE
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
				jQuery.sap.log.error("Wrong Input node - cannot find XPath to it: " + sTagName);
			}

			return sPath;
		};

		return xPath;
	}

};


return AnnotationsParser;

});
