/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"./_Helper",
	"./_MetadataConverter"
], function (jQuery, _Helper, _MetadataConverter) {
	"use strict";

	var V2MetadataConverter,
		sModuleName = "sap.ui.model.odata.v4.lib._V2MetadataConverter",

		// namespaces
		sEdmxNamespace = "http://schemas.microsoft.com/ado/2007/06/edmx",
		sMicrosoftNamespace = "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata",
		mV2toV4 = {
			"creatable" : {
				"property" : "Insertable",
				"term" : "@Org.OData.Capabilities.V1.InsertRestrictions"
			},
			"deletable" : {
				"property" : "Deletable",
				"term" : "@Org.OData.Capabilities.V1.DeleteRestrictions"
			},
			"deletable-path" : {
				"property" : "Deletable",
				"term" : "@Org.OData.Capabilities.V1.DeleteRestrictions"
			},
			"field-control" : {
				"term" : "@com.sap.vocabularies.Common.v1.FieldControl"
			},
			"heading" : {
				"term" : "@com.sap.vocabularies.Common.v1.Heading"
			},
			"label" : {
				"term" : "@com.sap.vocabularies.Common.v1.Label"
			},
			"precision" : {
				"term" : "@Org.OData.Measures.V1.Scale"
			},
			"quickinfo" : {
				"term" : "@com.sap.vocabularies.Common.v1.QuickInfo"
			},
			"requires-filter" : {
				"property" : "RequiresFilter",
				"term" : "@Org.OData.Capabilities.V1.FilterRestrictions"
			},
			"searchable" : {
				"property" : "Searchable",
				"term" : "@Org.OData.Capabilities.V1.SearchRestrictions"
			},
			"text" : {
				"term" : "@com.sap.vocabularies.Common.v1.Text"
			},
			"updatable" : {
				"property" : "Updatable",
				"term" : "@Org.OData.Capabilities.V1.UpdateRestrictions"
			},
			"updatable-path" : {
				"property" : "Updatable",
				"term" : "@Org.OData.Capabilities.V1.UpdateRestrictions"
			}
		},
		mV2toV4Semantics = {
			"bday" : {
				TermName : "Contact"
			},
			"city" : {
				Path : "adr",
				TermName : "Contact",
				V4Attribute: "locality"
			},
			"country" : {
				Path : "adr",
				TermName : "Contact"
			},
			"email" : {
				Path : "address",
				TermName : "Contact",
				V4Attribute: "uri",
				typeMapping : {
					"home" : "home",
					"pref" : "preferred",
					"work" : "work"
				},
				v4EnumType : "com.sap.vocabularies.Communication.v1.ContactInformationType",
				v4PropertyAnnotation : "@com.sap.vocabularies.Communication.v1.IsEmailAddress"
			},
			"familyname" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute: "surname"
			},
			"givenname" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute: "given"
			},
			"honorific" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute: "prefix"
			},
			"middlename" : {
				Path : "n",
				TermName : "Contact",
				V4Attribute: "additional"
			},
			"name" : {
				TermName : "Contact",
				V4Attribute: "fn"
			},
			"nickname" : {
				TermName : "Contact"
			},
			"note" : {
				TermName : "Contact"
			},
			"org" : {
				TermName : "Contact"
			},
			"org-role" : {
				TermName : "Contact",
				V4Attribute : "role"
			},
			"org-unit" : {
				TermName : "Contact",
				V4Attribute : "orgunit"
			},
			"photo" : {
				TermName : "Contact"
			},
			"pobox" : {
				Path : "adr",
				TermName : "Contact"
			},
			"region" : {
				Path : "adr",
				TermName : "Contact"
			},
			"street" : {
				Path : "adr",
				TermName : "Contact"
			},
			"suffix" : {
				Path : "n",
				TermName : "Contact"
			},
			"tel" : {
				Path : "tel",
				TermName : "Contact",
				V4Attribute: "uri",
				typeMapping : {
					"cell" : "cell",
					"fax" : "fax",
					"home" : "home",
					"pref" : "preferred",
					"video" : "video",
					"voice" : "voice",
					"work" : "work"
				},
				v4EnumType : "com.sap.vocabularies.Communication.v1.PhoneType",
				v4PropertyAnnotation : "@com.sap.vocabularies.Communication.v1.IsPhoneNumber"
			},
			"title" : {
				TermName : "Contact"
			},
			"zip" : {
				Path : "adr",
				TermName : "Contact",
				V4Attribute: "code"
			},
			// event annotations
			"class" : {
				TermName : "Event"
			},
			"dtend" : {
				TermName : "Event"
			},
			"dtstart" : {
				TermName : "Event"
			},
			"duration" : {
				TermName : "Event"
			},
			"fbtype" : {
				TermName : "Event"
			},
			"location" : {
				TermName : "Event"
			},
			"status" : {
				TermName : "Event"
			},
			"transp" : {
				TermName : "Event"
			},
			"wholeday" : {
				TermName : "Event"
			},
			// message annotations
			"body" : {
				TermName : "Message"
			},
			"from" : {
				TermName : "Message"
			},
			"received" : {
				TermName : "Message"
			},
			"sender" : {
				TermName : "Message"
			},
			"subject" : {
				TermName : "Message"
			},
			// task annotations
			"completed" : {
				TermName : "Task"
			},
			"due" : {
				TermName : "Task"
			},
			"percent-complete" : {
				TermName : "Task",
				V4Attribute: "percentcomplete"
			},
			"priority" : {
				TermName : "Task"
			}
		},
		sSapNamespace = "http://www.sap.com/Protocols/SAPData",

		// the configurations for traverse
		oAliasConfig = {
			"Reference" : {
				"Include" : {
					__processor : _MetadataConverter.processAlias
				}
			},
			"DataServices" : {
				"Schema" : {
					__processor : _MetadataConverter.processAlias
				}
			}
		},
		oStructuredTypeConfig = {
			"NavigationProperty" : {
				__processor : processTypeNavigationProperty
			},
			"Property" : {
				__processor : processTypeProperty
			}
		},
		oFullConfig = {
			__include : [_MetadataConverter.oReferenceInclude],
			"DataServices" : {
				__processor : processDataServices,
				"Schema" : {
					__postProcessor : postProcessSchema,
					__processor : _MetadataConverter.processSchema,
					__include : [_MetadataConverter.oAnnotationsConfig],
					"Association" : {
						__processor : processAssociation,
						"End" : {
							__processor : processAssociationEnd
						},
						"ReferentialConstraint" : {
							__processor : processReferentialConstraint,
							"Dependent" : {
								__processor : processDependent,
								"PropertyRef" : {
									__processor : processReferentialConstraintPropertyRef
								}
							},
							"Principal" : {
								__processor : processPrincipal,
								"PropertyRef" : {
									__processor : processReferentialConstraintPropertyRef
								}
							}
						}
					},
					"ComplexType" : {
						__processor : processComplexType,
						__include : [oStructuredTypeConfig]
					},
					"EntityContainer" : {
						__processor : processEntityContainer,
						"AssociationSet" : {
							__processor : processAssociationSet,
							"End" : {
								__processor : processAssociationSetEnd
							}
						},
						"EntitySet" : {
							__processor : processEntitySet
						},
						"FunctionImport" : {
							__processor : processFunctionImport,
							"Parameter" : {
								__processor : processParameter
							}
						}
					},
					"EntityType" : {
						__processor : processEntityType,
						__include : [oStructuredTypeConfig],
						"Key" : {
							"PropertyRef" : {
								__processor : processEntityTypeKeyPropertyRef
							}
						}
					}
				}
			}
		};

	/**
	 * Iterates over all attributes and converts V2 annotations to corresponding V4 annotations
	 * based on the given kind.
	 *
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 * @param {string} sKind The kind of the element, e.g. "EntitySet" or "Property"
	 */
	function convertAnnotations(oElement, oAggregate, sKind) {
		var sElementPath = oAggregate.annotatable.path,
			mAnnotations = oAggregate.convertedV2Annotations[sElementPath] || {},
			oAttribute,
			aAttributes = oElement.attributes,
			sParentPath = oAggregate.annotatable.parent.path,
			mParentAnnotations = oAggregate.convertedV2Annotations[sParentPath] || {},
			sSemanticValue,
			i,
			n = aAttributes.length;

		if (sKind === "EntityType" || sKind === "FunctionImport") {
			setAnnotation(mAnnotations, "label", oElement.getAttributeNS(sSapNamespace, "label"));
		} else {
			for (i = 0; i < n; i++) {
				oAttribute = aAttributes[i];
				if (oAttribute.namespaceURI !== sSapNamespace) {
					continue;
				}
				if (sKind === "EntitySet") {
					convertEntitySetAnnotation(oElement, oAttribute, mAnnotations, oAggregate);
				} else if (sKind === "Property" && oAttribute.localName === "semantics") {
					sSemanticValue = oAttribute.value;
					if (sSemanticValue === "unit-of-measure"
							|| sSemanticValue === "currency-code") {
						oAggregate.mProperty2Semantics[sElementPath] = sSemanticValue;
					}
					convertPropertySemanticAnnotations(oAttribute, mParentAnnotations,
						mAnnotations);
				} else if (sKind === "Property") {
					if (oAttribute.localName === "unit") {
						oAggregate.mProperty2Unit[sElementPath] = oAttribute.value;
					}
					convertPropertyAnnotations(oAttribute, mAnnotations);
				}
			}
			if (sKind === "EntitySet"
					&& oElement.getAttributeNS(sSapNamespace, "searchable") !== "true") {
				// default for sap:searchable is false --> add v4 annotation, if value of
				// v2 annotation is not true
				setAnnotation(mAnnotations, "searchable", false);
			} else if (sKind === "Property") {
				if (oElement.getAttributeNS(sSapNamespace, "updatable") === "false") {
					if (oElement.getAttributeNS(sSapNamespace, "creatable") === "false") {
						mAnnotations["@Org.OData.Core.V1.Computed"] = true;
					} else {
						mAnnotations["@Org.OData.Core.V1.Immutable"] = true;
					}
				}
			}
		}

		if (Object.keys(mAnnotations).length > 0) {
			oAggregate.convertedV2Annotations[sElementPath] = mAnnotations;
		}
		if (Object.keys(mParentAnnotations).length > 0) {
			oAggregate.convertedV2Annotations[sParentPath] = mParentAnnotations;
		}
	}

	/**
	 * Converts a V2 annotation of an EntitySet to the corresponding V4 annotation and puts
	 * the annotation into the given map of V4 annotations.
	 *
	 * @param {Element} oElement The element
	 * @param {Attr} oAttribute The attribute
	 * @param {object} mAnnotations Map of V4 annotations
	 * @param {object} oAggregate The aggregate (for error handling)
	 */
	function convertEntitySetAnnotation(oElement, oAttribute, mAnnotations, oAggregate) {
		var sConflictingV2Annotation;

		switch (oAttribute.localName){
			case "creatable":
			case "deletable":
			case "updatable":
				if (oAttribute.value === "false") {
					setAnnotation(mAnnotations, oAttribute.localName, false);
				}
				break;
			case "deletable-path":
			case "updatable-path":
				sConflictingV2Annotation = oAttribute.localName.slice(0, 9);
				if (oElement.getAttributeNS(sSapNamespace, sConflictingV2Annotation)) {
					setAnnotation(mAnnotations, oAttribute.localName, false);
					jQuery.sap.log.warning("Inconsistent metadata in '" + oAggregate.url + "'",
						"Use either 'sap:" + sConflictingV2Annotation + "' or 'sap:"
							+ sConflictingV2Annotation + "-path'"
							+ " at entity set '" + oAggregate.annotatable.path + "'", sModuleName);
				} else {
					setAnnotation(mAnnotations, oAttribute.localName, {
						$Path : oAttribute.value
					});
				}
				break;
			case "label":
				mAnnotations["@com.sap.vocabularies.Common.v1.Label"] = oAttribute.value;
				break;
			case "pageable":
				if (oAttribute.value === "false") {
					mAnnotations["@Org.OData.Capabilities.V1.SkipSupported"] = false;
					mAnnotations["@Org.OData.Capabilities.V1.TopSupported"] = false;
				}
				break;
			case "requires-filter":
				if (oAttribute.value === "true") {
					setAnnotation(mAnnotations, oAttribute.localName, true);
				}
				break;
			case "topable":
				if (oAttribute.value === "false") {
					mAnnotations["@Org.OData.Capabilities.V1.TopSupported"] = false;
				}
				break;
			default: //no conversion yet
		}
	}

	/**
	 * Converts a V2 annotation of an EntitySet to the corresponding V4 annotation and puts
	 * the annotation into the given map of V4 annotations.
	 *
	 * @param {Attr} oAttribute The attribute
	 * @param {object} mAnnotations Map of V4 annotations
	 */
	function convertPropertyAnnotations(oAttribute, mAnnotations) {
		switch (oAttribute.localName) {
			// simple cases
			case "heading":
			case "label":
			case "quickinfo":
				setAnnotation(mAnnotations, oAttribute.localName, oAttribute.value);
				break;
			case "field-control":
			case "precision":
			case "text":
				setAnnotation(mAnnotations, oAttribute.localName, {
					$Path : oAttribute.value
				});
				break;
			// more complex cases
			case "aggregation-role":
				if (oAttribute.value === "dimension") {
					mAnnotations["@com.sap.vocabularies.Analytics.v1.Dimension"] = true;
				} else if (oAttribute.value === "measure") {
					mAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"] = true;
				}
				break;
			case "display-format":
				if (oAttribute.value === "NonNegative") {
					mAnnotations["@com.sap.vocabularies.Common.v1.IsDigitSequence"] = true;
				} else if (oAttribute.value === "UpperCase") {
					mAnnotations["@com.sap.vocabularies.Common.v1.IsUpperCase"] = true;
				}
				break;
			case "visible":
				if (oAttribute.value === "false") {
					mAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] = true;
					mAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"] = {
						$EnumMember :
							"com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
					};
				}
				break;
			default:
				//no conversion supported
		}
	}

	/**
	 * Converts a sap:semantics V2 annotation of a property to the corresponding V4 annotation at
	 * an EntityType and puts the annotation into the given map of V4 annotations.
	 *
	 * @param {Attr} oAttribute The attribute
	 * @param {object} mTypeAnnotations Map of V4 annotations at EntityType/ComplexType level
	 * @param {object} mPropertyAnnotations Map of V4 annotations at Property level
	 */
	function convertPropertySemanticAnnotations(oAttribute, mTypeAnnotations,
		mPropertyAnnotations) {
		var oAnnotations,
			sEnum,
			oPath,
			aResult,
			oSemantics,
			aValue = oAttribute.value.split(";"),
			sValue = aValue[0],
			oV2toV4Semantic;

		if (sValue === "url") {
			mPropertyAnnotations["@Org.OData.Core.V1.IsURL"] = true;
			return;
		}

		oV2toV4Semantic = mV2toV4Semantics[sValue];
		if (oV2toV4Semantic) {
			oPath = {
				"$Path" : oAttribute.ownerElement.getAttribute("Name")
			};
			oAnnotations = V2MetadataConverter.getOrCreateObject(mTypeAnnotations,
				"@com.sap.vocabularies.Communication.v1." + oV2toV4Semantic.TermName);
			if (oV2toV4Semantic.Path) {
				oSemantics = V2MetadataConverter.getOrCreateObject(oAnnotations,
					oV2toV4Semantic.Path);
				oSemantics[oV2toV4Semantic.V4Attribute || sValue] = oPath;

				if (oV2toV4Semantic.v4PropertyAnnotation) {
					mPropertyAnnotations[oV2toV4Semantic.v4PropertyAnnotation]
						= true;

					//Determination of space separated list of V4 annotations enumeration value for
					//given sap:semantics "tel" and "email"
					if (aValue[1]) {
						aResult = [];
						sEnum = aValue[1].split("=")[1];
						sEnum.split(",").forEach(function (sType) {
							var sTargetType = oV2toV4Semantic.typeMapping[sType];
							if (sTargetType) {
								aResult.push(oV2toV4Semantic.v4EnumType + "/" + sTargetType);
							} else {
								jQuery.sap.log.warning("Unsupported semantic type: "
										+ sType, undefined, sModuleName);
							}
						});
						if (aResult.length > 0) {
							oSemantics.type = {"EnumMember" : aResult.join(" ")};
						}
					}
					oAnnotations[oV2toV4Semantic.Path] = [oSemantics];
				} else {
					oAnnotations[oV2toV4Semantic.Path] = oSemantics;
				}
			} else {
				oAnnotations[oV2toV4Semantic.V4Attribute || sValue] = oPath;
			}
		}
	}

	/**
	 * Post-processing of an Schema element.
	 *
	 * @param {Element} oElement The element
	 * @param {any[]} aResult The results from child elements
	 * @param {object} oAggregate The aggregate
	 */
	function postProcessSchema(oElement, aResult, oAggregate) {
		var mAnnotations,
			oEntityContainer,
			sEntityContainerName,
			oEntitySet,
			sEntitySetName,
			sTarget;

		for (sEntityContainerName in oAggregate.mEntityContainersOfSchema) {
			oEntityContainer = oAggregate.mEntityContainersOfSchema[sEntityContainerName];

			for (sEntitySetName in oEntityContainer) {
				oEntitySet = oEntityContainer[sEntitySetName];
				if (oEntitySet.$kind !== "EntitySet") {
					continue;
				}
				sTarget = sEntityContainerName + "/" + sEntitySetName;
				mAnnotations = jQuery.extend(true,
					oAggregate.convertedV2Annotations[sTarget] || {},
					oAggregate.mEntityType2EntitySetAnnotation[oEntitySet.$Type]);
				if (Object.keys(mAnnotations).length) {
					oAggregate.convertedV2Annotations[sTarget] = mAnnotations;
				}
			}
		}

		if (oAggregate.schema.$Annotations) {
			V2MetadataConverter.mergeAnnotations(oAggregate.convertedV2Annotations,
				oAggregate.schema.$Annotations);
		} else if (Object.keys(oAggregate.convertedV2Annotations).length > 0) {
			oAggregate.schema.$Annotations = oAggregate.convertedV2Annotations;
		}

		oAggregate.convertedV2Annotations = {}; // reset schema annotations for next schema
		oAggregate.mEntityContainersOfSchema = {};
	}

	/**
	 * Processes an Association element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAssociation(oElement, oAggregate) {
		var sName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.associations[sName] = oAggregate.association = {
			referentialConstraint : null,
			roles : {} // maps role name -> AssocationEnd
		};
	}

	/**
	 * Processes an End element below an Association element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAssociationEnd(oElement, oAggregate) {
		var sName = oElement.getAttribute("Role");

		oAggregate.association.roles[sName] = {
			multiplicity : oElement.getAttribute("Multiplicity"),
			propertyName : undefined, // will poss. be set in updateNavigationProperties...
			typeName : V2MetadataConverter.resolveAlias(oElement.getAttribute("Type"), oAggregate)
		};
	}

	/**
	 * Processes an AssociationSet element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAssociationSet(oElement, oAggregate) {
		var oAssociationSet = {
				associationName : V2MetadataConverter.resolveAlias(
					oElement.getAttribute("Association"), oAggregate),
				ends : []
			};

		oAggregate.associationSet = oAssociationSet;
		oAggregate.associationSets.push(oAssociationSet);
	}

	/**
	 * Processes an End element below an Association or AssociationSet element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processAssociationSetEnd(oElement, oAggregate) {
		oAggregate.associationSet.ends.push({
			entitySetName : oElement.getAttribute("EntitySet"),
			roleName : oElement.getAttribute("Role")
		});
	}

	/**
	 * Processes a ComplexType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processComplexType(oElement, oAggregate) {
		processType(oElement, oAggregate, {"$kind" : "ComplexType"});
	}

	/**
	 * Processes a DataServices element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processDataServices(oElement, oAggregate) {
		if (oElement.getAttributeNS(sMicrosoftNamespace, "DataServiceVersion") !== "2.0") {
			throw new Error(oAggregate.url + " is not a valid OData V2 metadata document");
		}
	}

	/**
	 * Processes a Dependent element below a ReferentialConstraint element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processDependent(oElement, oAggregate) {
		var oConstraint = oAggregate.association.referentialConstraint;

		oAggregate.constraintRole = oConstraint.dependent = {
			roleName : oElement.getAttribute("Role")
		};
	}

	/**
	 * Processes an EntityContainer.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityContainer(oElement, oAggregate) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.mEntityContainersOfSchema[sQualifiedName]
			= oAggregate.result[sQualifiedName] = oAggregate.entityContainer = {
			"$kind" : "EntityContainer"
		};
		if (oElement.getAttributeNS(sMicrosoftNamespace, "IsDefaultEntityContainer") === "true") {
			oAggregate.defaultEntityContainer = sQualifiedName;
		}
		V2MetadataConverter.annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes an EntitySet element at the EntityContainer.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntitySet(oElement, oAggregate) {
		var sName = oElement.getAttribute("Name");

		oAggregate.entityContainer[sName] = oAggregate.entitySet = {
			$kind : "EntitySet",
			$Type :
				V2MetadataConverter.resolveAlias(oElement.getAttribute("EntityType"), oAggregate)
		};
		V2MetadataConverter.annotatable(oAggregate, sName);

		convertAnnotations(oElement, oAggregate, "EntitySet");
	}

	/**
	 * Processes an EntityType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityType(oElement, oAggregate) {
		var oType = {
			$kind : "EntityType"
		};

		processType(oElement, oAggregate, oType);
		V2MetadataConverter.processAttributes(oElement, oType, {
			"Abstract" : V2MetadataConverter.setIfTrue,
			"BaseType" : function (sType) {
				return sType ? V2MetadataConverter.resolveAlias(sType, oAggregate) : undefined;
			}
		});

		convertAnnotations(oElement, oAggregate, "EntityType");
	}

	/**
	 * Processes a PropertyRef element of the EntityType's Key.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processEntityTypeKeyPropertyRef(oElement, oAggregate) {
		var sName = oElement.getAttribute("Name");

		V2MetadataConverter.getOrCreateArray(oAggregate.type, "$Key").push(sName);
	}

	/**
	 * Processes a FunctionImport element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processFunctionImport(oElement, oAggregate) {
		var sHttpMethod = oElement.getAttributeNS(sMicrosoftNamespace, "HttpMethod"),
			sKind = sHttpMethod === "POST" ? "Action" : "Function",
			oFunction = {
				$kind : sKind
			},
			sName = oElement.getAttribute("Name"),
			sQualifiedName = oAggregate.namespace + sName,
			oFunctionImport = {
				$kind : sKind + "Import"
			},
			sReturnType = oElement.getAttribute("ReturnType"),
			oReturnType;

		oFunctionImport["$" + sKind] = sQualifiedName;
		V2MetadataConverter.processAttributes(oElement, oFunctionImport, {
			"EntitySet" : V2MetadataConverter.setValue
		});
		if (sReturnType) {
			oFunction.$ReturnType = oReturnType = {};
			processTypedCollection(sReturnType, oReturnType, oAggregate, oElement);
		}
		if (oElement.getAttributeNS(sSapNamespace, "action-for")) {
			jQuery.sap.log.warning("Unsupported 'sap:action-for' at FunctionImport '" + sName
				+ "', removing this FunctionImport", undefined, sModuleName);
		} else {
			// add Function and FunctionImport to the result
			oAggregate.entityContainer[sName] = oFunctionImport;
			oAggregate.result[sQualifiedName] = [oFunction];
		}
		// Remember the current function (even if it has not been added to the result), so that
		// processParameter adds to this. This avoids that parameters belonging to a removed
		// FunctionImport are added to the predecessor.
		oAggregate.function = oFunction;
		V2MetadataConverter.annotatable(oAggregate, sName);

		convertAnnotations(oElement, oAggregate, "FunctionImport");
	}

	/**
	 * Processes a Parameter element within an Action or Function.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processParameter(oElement, oAggregate) {
		var oFunction = oAggregate.function,
			sLabel,
			oParameter = {
				$Name : oElement.getAttribute("Name")
			};

		V2MetadataConverter.processFacetAttributes(oElement, oParameter);
		processTypedCollection(oElement.getAttribute("Type"), oParameter, oAggregate, oElement);

		V2MetadataConverter.getOrCreateArray(oFunction, "$Parameter").push(oParameter);
		V2MetadataConverter.annotatable(oAggregate, oParameter);

		sLabel = oElement.getAttributeNS(sSapNamespace, "label");
		if (sLabel) {
			oParameter[mV2toV4["label"].term] = sLabel;
		}
	}

	/**
	 * Processes a Principal element below a ReferentialConstraint element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processPrincipal(oElement, oAggregate) {
		var oConstraint = oAggregate.association.referentialConstraint;

		oAggregate.constraintRole = oConstraint.principal = {
			roleName : oElement.getAttribute("Role")
		};
	}

	/**
	 * Processes an End element below an Association element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processReferentialConstraint(oElement, oAggregate) {
		oAggregate.association.referentialConstraint = {};
	}

	/**
	 * Processes an End element below an Association element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processReferentialConstraintPropertyRef(oElement, oAggregate) {
		oAggregate.constraintRole.propertyRef = oElement.getAttribute("Name");
	}

	/**
	 * Processes a ComplexType or EntityType element.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 * @param {object} oType The initial typed result object
	 */
	function processType(oElement, oAggregate, oType) {
		var sQualifiedName = oAggregate.namespace + oElement.getAttribute("Name");

		oAggregate.sTypeName = sQualifiedName;
		oAggregate.result[sQualifiedName] = oAggregate.type = oType;
		V2MetadataConverter.annotatable(oAggregate, sQualifiedName);
	}

	/**
	 * Processes the type in the form "Type" or "Collection(Type)" and sets the appropriate
	 * properties.
	 * @param {string} sType The type attribute from the Element
	 * @param {object} oProperty The property attribute in the JSON
	 * @param {object} oAggregate The aggregate
	 * @param {Element} oElement The element using the type
	 */
	function processTypedCollection(sType, oProperty, oAggregate, oElement) {
		var aMatches = V2MetadataConverter.rCollection.exec(sType);

		if (aMatches) {
			oProperty.$isCollection = true;
			sType = aMatches[1];
		}
		// according to the XSD simple types do not (necessarily) have the namespace "Edm."
		if (sType.indexOf(".") < 0) {
			sType = "Edm." + sType;
		}
		switch (sType) {
			case "Edm.DateTime":
				oProperty.$v2Type = sType;
				if (oElement.getAttributeNS(sSapNamespace, "display-format") === "Date") {
					sType = "Edm.Date";
					delete oProperty.$Precision;
				} else {
					sType = "Edm.DateTimeOffset";
				}
				break;
			case "Edm.Float":
				oProperty.$v2Type = sType;
				sType = "Edm.Single";
				break;
			case "Edm.Time":
				oProperty.$v2Type = sType;
				sType = "Edm.TimeOfDay";
				break;
			default:
				sType = V2MetadataConverter.resolveAlias(sType, oAggregate);
		}
		oProperty.$Type = sType;
	}

	/**
	 * Processes a NavigationProperty element of a structured type.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTypeNavigationProperty(oElement, oAggregate) {
		var sCreatable = oElement.getAttributeNS(sSapNamespace, "creatable"),
			sCreatablePath = oElement.getAttributeNS(sSapNamespace, "creatable-path"),
			vHere,
			sName = oElement.getAttribute("Name"),
			oNavigationPropertyPath,
			oProperty = {
				$kind : "NavigationProperty"
			};

		oAggregate.type[sName] = oProperty;
		oAggregate.navigationProperties.push({
			associationName :
				V2MetadataConverter.resolveAlias(oElement.getAttribute("Relationship"), oAggregate),
			fromRoleName : oElement.getAttribute("FromRole"),
			property : oProperty,
			propertyName : sName,
			toRoleName : oElement.getAttribute("ToRole")
		});

		V2MetadataConverter.annotatable(oAggregate, sName);
		if (sCreatable) {
			oNavigationPropertyPath = {"$NavigationPropertyPath" : sName};
			if (sCreatablePath) {
				jQuery.sap.log.warning("Inconsistent metadata in '" + oAggregate.url + "'",
					"Use either 'sap:creatable' or 'sap:creatable-path' at navigation property '"
					+ oAggregate.annotatable.path + "'", sModuleName);
			} else if (sCreatable === "true") {
				oNavigationPropertyPath = null;
			}
		} else if (sCreatablePath) {
			oNavigationPropertyPath = {
				"$If" : [{
					"$Not" : {"$Path" : sCreatablePath}
				}, {
					"$NavigationPropertyPath" : sName
				}]
			};
		}
		if (oNavigationPropertyPath) {
			vHere = V2MetadataConverter.getOrCreateObject(
				oAggregate.mEntityType2EntitySetAnnotation, oAggregate.sTypeName);
			vHere = V2MetadataConverter.getOrCreateObject(
				vHere, "@Org.OData.Capabilities.V1.InsertRestrictions");
			vHere = V2MetadataConverter.getOrCreateArray(
				vHere, "NonInsertableNavigationProperties");
			vHere.push(oNavigationPropertyPath);
		}
	}

	/**
	 * For each property with a "sap:unit" annotation a corresponding V4 annotation is created.
	 * The annotation is "Org.OData.Measures.V1.Unit" if the unit has
	 * sap:semantics="unit-of-measure" or "Org.OData.Measures.V1.ISOCurrency" if the unit has
	 * sap:semantics="currency-code". The unit property can be in a different type thus the
	 * conversion can only happen in pass 3.
	 *
	 * @param {object} oAggregate The aggregate
	 */
	function processUnitConversion(oAggregate) {
		Object.keys(oAggregate.mProperty2Unit).forEach(function (sPropertyPath) {
			var vHere,
				oType,
				sTypeName = sPropertyPath.split("/")[0],
				sUnitAnnotation,
				sUnitPath = oAggregate.mProperty2Unit[sPropertyPath],
				aUnitPathSegments = sUnitPath.split("/"),
				oUnitProperty,
				sUnitSemantics,
				i,
				n = aUnitPathSegments.length;

			for (i = 0; i < n; i++) {
				oType = oAggregate.result[sTypeName];
				oUnitProperty = oType[aUnitPathSegments[i]];
				if (!oUnitProperty) {
					jQuery.sap.log.warning("Path '" + sUnitPath
						+ "' for sap:unit cannot be resolved", sPropertyPath, sModuleName);
					return;
				}
				if (i < n - 1) {
					sTypeName = oUnitProperty.$Type;
				}
			}
			sUnitSemantics = oAggregate.mProperty2Semantics[
				sTypeName + "/" + aUnitPathSegments[n - 1]];
			if (!sUnitSemantics) {
				jQuery.sap.log.warning("Unsupported sap:semantics at sap:unit='" + sUnitPath
					+ "'; expected 'currency-code' or 'unit-of-measure'", sPropertyPath,
					sModuleName);
				return;
			}

			sUnitAnnotation = sUnitSemantics === "currency-code" ? "ISOCurrency" : "Unit";
			sUnitAnnotation = "@Org.OData.Measures.V1." + sUnitAnnotation;

			vHere = V2MetadataConverter.getOrCreateObject(
				oAggregate.result[_Helper.namespace(sPropertyPath) + "."], "$Annotations");
			vHere = V2MetadataConverter.getOrCreateObject(vHere, sPropertyPath);
			if (!(sUnitAnnotation in vHere)) { // existing V4 annotations won't be overridden
				vHere[sUnitAnnotation] = {"$Path" : sUnitPath};
			}
		});
	}

	/**
	 * Processes a Property element of a structured type.
	 * @param {Element} oElement The element
	 * @param {object} oAggregate The aggregate
	 */
	function processTypeProperty(oElement, oAggregate) {
		var sEnumMember,
			sFilterable = oElement.getAttributeNS(sSapNamespace, "filterable"),
			sFilterRestriction = oElement.getAttributeNS(sSapNamespace, "filter-restriction"),
			vHere,
			sName = oElement.getAttribute("Name"),
			oProperty = {
				"$kind" : "Property"
			},
			sRequiredInFilter = oElement.getAttributeNS(sSapNamespace, "required-in-filter"),
			sSortable = oElement.getAttributeNS(sSapNamespace, "sortable");

		/*
		 * Assumes that the given annotation term applies to all <EntitySet>s using the current
		 * <EntityType>. The term's value is a record that contains an array-valued property with
		 * the given name. Pushes a <code>$PropertyPath</code> pointing to the current <Property>
		 * element to that array.
		 */
		function pushPropertyPath(sTerm, sProperty, sAnnotation) {
			if (oAggregate.type.$kind === "EntityType") {
				vHere = V2MetadataConverter.getOrCreateObject(
					oAggregate.mEntityType2EntitySetAnnotation, oAggregate.sTypeName);
				vHere = V2MetadataConverter.getOrCreateObject(vHere, sTerm);
				vHere = V2MetadataConverter.getOrCreateArray(vHere, sProperty);
				vHere.push({"$PropertyPath" : sName});
			} else {
				jQuery.sap.log.warning("Unsupported SAP annotation at a complex type in '"
					+ oAggregate.url + "'", "sap:" + sAnnotation + " at property '"
					+ oAggregate.annotatable.path + "'", sModuleName);
			}
		}

		oAggregate.type[sName] = oProperty;
		V2MetadataConverter.processFacetAttributes(oElement, oProperty);
		processTypedCollection(oElement.getAttribute("Type"), oProperty, oAggregate, oElement);

		V2MetadataConverter.annotatable(oAggregate, sName);
		convertAnnotations(oElement, oAggregate, "Property");
		if (sFilterable === "false") {
			pushPropertyPath("@Org.OData.Capabilities.V1.FilterRestrictions",
				"NonFilterableProperties", "filterable");
		}
		if (sFilterRestriction) {
			switch (sFilterRestriction) {
				case "interval":
					sEnumMember = "SingleInterval";
					break;
				case "multi-value":
					sEnumMember = "MultiValue";
					break;
				case "single-value":
					sEnumMember = "SingleValue";
					break;
				default:
					jQuery.sap.log.warning("Inconsistent metadata in '" + oAggregate.url + "'",
						"Unsupported sap:filter-restriction=\"" + sFilterRestriction
						+ "\" at property '" + oAggregate.annotatable.path + "'", sModuleName);
			}
			if (sEnumMember) {
				if (oAggregate.type.$kind === "EntityType") {
					vHere = V2MetadataConverter.getOrCreateObject(
						oAggregate.mEntityType2EntitySetAnnotation, oAggregate.sTypeName);
					vHere = V2MetadataConverter.getOrCreateArray(
						vHere, "@com.sap.vocabularies.Common.v1.FilterExpressionRestrictions");
					vHere.push({
						"AllowedExpressions" : {
							"EnumMember"
							: "com.sap.vocabularies.Common.v1.FilterExpressionType/" + sEnumMember
						},
						"Property" : {"$PropertyPath" : sName}
					});
				} else {
					jQuery.sap.log.warning("Unsupported SAP annotation at a complex type in '"
						+ oAggregate.url + "'", "sap:filter-restriction at property '"
						+ oAggregate.annotatable.path + "'", sModuleName);
				}
			}
		}
		if (sRequiredInFilter === "true") {
			pushPropertyPath("@Org.OData.Capabilities.V1.FilterRestrictions", "RequiredProperties",
				"required-in-filter");
		}
		if (sSortable === "false") {
			pushPropertyPath("@Org.OData.Capabilities.V1.SortRestrictions",
				"NonSortableProperties", "sortable");
		}
	}

	/**
	 * Sets an annotation for the given V2 name in the given annotations map.
	 * Does nothing if vValue is <code>null</code> or <code>""</code>
	 *
	 * @param {object} mAnnotations Map of annotations to be updated
	 * @param {string} sV2Name The name of the V2 annotation
	 * @param {object|boolean} vValue The new value
	 */
	function setAnnotation(mAnnotations, sV2Name, vValue) {
		var mAnnotationInfo = mV2toV4[sV2Name],
			oAnnotation;
		if (vValue === null || vValue === "") {
			return;
		}
		if (mAnnotationInfo.property) {
			oAnnotation = mAnnotations[mAnnotationInfo.term] || {};
			oAnnotation[mAnnotationInfo.property] = vValue;
		} else {
			oAnnotation = vValue;
		}
		mAnnotations[mAnnotationInfo.term] = oAnnotation;
	}

	/**
	 * Sets $EntityContainer to the default entity container (or the only one).
	 * @param {object} oAggregate The aggregate
	 */
	function setDefaultEntityContainer(oAggregate) {
		var sDefaultEntityContainer = oAggregate.defaultEntityContainer,
			aEntityContainers;

		if (sDefaultEntityContainer) {
			oAggregate.result.$EntityContainer = sDefaultEntityContainer;
		} else {
			aEntityContainers = Object.keys(oAggregate.result).filter(function (sQualifiedName) {
				return oAggregate.result[sQualifiedName].$kind === "EntityContainer";
			});
			if (aEntityContainers.length === 1) {
				oAggregate.result.$EntityContainer = aEntityContainers[0];
			}
		}
	}

	/**
	 * Updates navigation properties and creates navigation property bindings. Iterates over the
	 * aggregated navigation properties list and updates the corresponding navigation properties
	 * from the associations. Iterates over the aggregated association set and tries to create
	 * navigation property bindings for both directions.
	 *
	 * @param {object} oAggregate The aggregate
	 */
	function updateNavigationPropertiesAndCreateBindings(oAggregate) {

		oAggregate.navigationProperties.forEach(function (oNavigationPropertyData) {
			var oAssociation = oAggregate.associations[oNavigationPropertyData.associationName],
				oConstraint = oAssociation.referentialConstraint,
				oNavigationProperty = oNavigationPropertyData.property,
				oToRole = oAssociation.roles[oNavigationPropertyData.toRoleName];

			oNavigationProperty.$Type = oToRole.typeName;
			oToRole.propertyName = oNavigationPropertyData.propertyName;
			if (oToRole.multiplicity === "1") {
				oNavigationProperty.$Nullable = false;
			}
			if (oToRole.multiplicity === "*") {
				oNavigationProperty.$isCollection = true;
			}
			if (oConstraint
					&& oConstraint.principal.roleName === oNavigationPropertyData.toRoleName) {
				oNavigationProperty.$ReferentialConstraint = {};
				oNavigationProperty.$ReferentialConstraint[oConstraint.dependent.propertyRef]
					= oConstraint.principal.propertyRef;
			}
		});

		oAggregate.associationSets.forEach(function (oAssociationSet) {
			var oAssociation = oAggregate.associations[oAssociationSet.associationName],
				oEntityContainer = oAggregate.entityContainer;

			/*
			 * Creates a navigation property binding for the navigation property of the "from" set's
			 * type that has the "to" type as target, using the sets pointing to these types.
			 */
			function createNavigationPropertyBinding(oAssociationSetFrom, oAssociationSetTo) {
				var oEntitySet = oEntityContainer[oAssociationSetFrom.entitySetName],
					oToRole = oAssociation.roles[oAssociationSetTo.roleName];

				if (oToRole.propertyName) {
					oEntitySet.$NavigationPropertyBinding
						= oEntitySet.$NavigationPropertyBinding || {};
					oEntitySet.$NavigationPropertyBinding[oToRole.propertyName]
						= oAssociationSetTo.entitySetName;
				}
			}

			// Try to create navigation property bindings for the two directions
			createNavigationPropertyBinding(oAssociationSet.ends[0], oAssociationSet.ends[1]);
			createNavigationPropertyBinding(oAssociationSet.ends[1], oAssociationSet.ends[0]);
		});
	}

	V2MetadataConverter = jQuery.extend({}, _MetadataConverter, {
		/**
		 * Converts the metadata from XML format to a JSON object.
		 *
		 * @param {Document} oDocument
		 *   The XML DOM document
		 * @param {string} sUrl
		 *   The URL by which this document has been loaded (for error messages)
		 * @returns {object}
		 *   The metadata JSON
		 */
		convertXMLMetadata : function (oDocument, sUrl) {
			var oAggregate, oElement;

			jQuery.sap.measure.average("convertXMLMetadata", "", sModuleName);

			oElement = oDocument.documentElement;
			if (oElement.localName !== "Edmx" || oElement.namespaceURI !== sEdmxNamespace) {
				throw new Error(sUrl + " is not a valid OData V2 metadata document");
			}
			oAggregate = {
				"aliases" : {}, // maps alias -> namespace
				"annotatable" : null, // the current annotatable, see function annotatable
				"association" : null, // the current association
				"associations" : {}, // maps qualified name -> association
				"associationSet" : null, // the current associationSet
				"associationSets" : [], // list of associationSets
				"constraintRole" : null, // the current Principal/Dependent
				// maps annotatable path to a map of converted V2 annotations for current Schema
				"convertedV2Annotations" : {},
				"defaultEntityContainer" : null, // the name of the default EntityContainer
				"entityContainer" : null, // the current EntityContainer
				mEntityContainersOfSchema : {}, // all EntityContainers of current Schema by name
				"entitySet" : null, // the current EntitySet
				// converted V2 annotations for EntitySets, identified by EntityType's name
				mEntityType2EntitySetAnnotation : {},
				"function" : null, // the current function
				"namespace" : null, // the namespace of the current Schema
				mProperty2Semantics : {}, // maps a property's path to its sap:semantics value
				"navigationProperties" : [], // a list of navigation property data
				"processFacetAttributes" : V2MetadataConverter.processFacetAttributes,
				"processTypedCollection" : processTypedCollection,
				"schema" : null, // the current Schema
				"type" : null, // the current EntityType/ComplexType
				sTypeName : null, // the name of the current EntityType/ComplexType
				mProperty2Unit : {}, // maps a property's path to its sap:unit value
				"result" : {
					"$Version" : "4.0" // The result of the conversion is a V4 streamlined JSON
				},
				"url" : sUrl // the document URL (for error messages)
			};

			// pass 1: find aliases
			V2MetadataConverter.traverse(oElement, oAggregate, oAliasConfig);
			// pass 2: full conversion
			V2MetadataConverter.traverse(oElement, oAggregate, oFullConfig);
			// pass 3
			setDefaultEntityContainer(oAggregate);
			updateNavigationPropertiesAndCreateBindings(oAggregate);
			processUnitConversion(oAggregate);

			jQuery.sap.measure.end("convertXMLMetadata");
			return oAggregate.result;
		},

		/**
		 * Merges the given V2 annotations into the given V4 annotations map. If the annotation
		 * is contained in both maps the V4 one wins.
		 * @param {object} mConvertedV2Annotations
		 *   Maps annotatable path to a map of converted V2 annotations; this object is modified
		 *   during the merge
		 * @param {object} [mV4Annotations]
		 *   Maps annotatable path to a map of V4 annotations; V2 annotations are merged into this
		 *   object
		 */
		mergeAnnotations : function (mConvertedV2Annotations, mV4Annotations) {
			var sAnnotatablePath;

			for (sAnnotatablePath in mConvertedV2Annotations) {
				if (sAnnotatablePath in mV4Annotations) {
					mV4Annotations[sAnnotatablePath] = jQuery.extend(
						mConvertedV2Annotations[sAnnotatablePath],
						mV4Annotations[sAnnotatablePath]);
				} else {
					mV4Annotations[sAnnotatablePath] = mConvertedV2Annotations[sAnnotatablePath];
				}
			}
		},

		/**
		 * Processes the TFacetAttributes and TPropertyFacetAttributes of the elements Property,
		 * TypeDefinition etc.
		 * @param {Element} oElement The element
		 * @param {object} oResult The result object to fill
		 */
		processFacetAttributes : function (oElement, oResult) {
			V2MetadataConverter.processAttributes(oElement, oResult, {
				"DefaultValue" : V2MetadataConverter.setValue,
				"MaxLength" : function (sValue) {
					return sValue === "Max" ? undefined : V2MetadataConverter.setNumber(sValue);
				},
				"Nullable" : V2MetadataConverter.setIfFalse,
				"Precision" : V2MetadataConverter.setNumber,
				"Scale" :  V2MetadataConverter.setNumber,
				"Unicode" : V2MetadataConverter.setIfFalse
			});
			if (oElement.getAttribute("FixedLength") === "false") {
				oResult.$Scale = "variable";
			}
		}
	});

	return V2MetadataConverter;
}, /* bExport= */false);
