/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global"], function (jQuery) {
	"use strict";

	/*global Promise */

	var oBoolFalse = { "Bool" : "false" },
		oBoolTrue = { "Bool" : "true" },
		// maps V2 filter-restriction value to corresponding V4 FilterExpressionType enum value
		mFilterRestrictions = {
			"interval" : "SingleInterval",
			"multi-value" : "MultiValue",
			"single-value" : "SingleValue"
		},
		sLoggingModule = "sap.ui.model.odata.ODataMetaModel",
		// maps V2 sap semantics annotations to a V4 annotations relative to
		// com.sap.vocabularies.Communication.v1.
		mSemanticsToV4AnnotationPath = {
			// contact annotations
			"bday" : "Contact",
			"city" : "Contact/adr",
			"country" : "Contact/adr",
			"email" : "Contact/email",
			"familyname" : "Contact/n",
			"givenname" : "Contact/n",
			"honorific" : "Contact/n",
			"middlename" : "Contact/n",
			"name" : "Contact",
			"nickname" : "Contact",
			"note" : "Contact",
			"org" : "Contact",
			"org-role" : "Contact",
			"org-unit" : "Contact",
			"photo" : "Contact",
			"pobox" : "Contact/adr",
			"region" : "Contact/adr",
			"street" : "Contact/adr",
			"suffix" : "Contact/n",
			"tel" : "Contact/tel",
			"title" : "Contact",
			"zip" : "Contact/adr",
			// event annotations
			"class" : "Event",
			"dtend" : "Event",
			"dtstart" : "Event",
			"duration" : "Event",
			"fbtype" : "Event",
			"location" : "Event",
			"status" : "Event",
			"transp" : "Event",
			"wholeday" : "Event",
			// message annotations
			"body" : "Message",
			"from" : "Message",
			"received" : "Message",
			"sender" : "Message",
			"subject" : "Message",
			// task annotations
			"completed" : "Task",
			"due" : "Task",
			"percent-complete" : "Task",
			"priority" : "Task"
		},
		rSemanticsWithTypes = /(\w+)(?:;type=([\w,]+))?/,
		mV2SemanticsToV4TypeInfo = {
			"email" : {
				typeMapping : {
					"home" : "home",
					"pref" : "preferred",
					"work" : "work"
				},
				v4EnumType : "com.sap.vocabularies.Communication.v1.ContactInformationType",
				v4PropertyAnnotation : "com.sap.vocabularies.Communication.v1.IsEmailAddress"
			},
			"tel" : {
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
				v4PropertyAnnotation : "com.sap.vocabularies.Communication.v1.IsPhoneNumber"
			}
		},
		// map from V2 to V4 for NON-DEFAULT cases only
		mV2ToV4 = {
			creatable : {
				"Org.OData.Capabilities.V1.InsertRestrictions" : { "Insertable" : oBoolFalse }
			},
//			deletable : {
//				"Org.OData.Capabilities.V1.DeleteRestrictions" : { "Deletable" : oBoolFalse }
//			}, // see handleXableAndXablePath()
			pageable : {
				"Org.OData.Capabilities.V1.SkipSupported" : oBoolFalse,
				"Org.OData.Capabilities.V1.TopSupported" : oBoolFalse
			},
			"requires-filter" : {
				"Org.OData.Capabilities.V1.FilterRestrictions" : { "RequiresFilter" : oBoolTrue }
			},
			topable : {
				"Org.OData.Capabilities.V1.TopSupported" : oBoolFalse
			}
//			updatable : {
//				"Org.OData.Capabilities.V1.UpdateRestrictions" : { "Updatable" : oBoolFalse }
//			} // see handleXableAndXablePath()
		},
		// only if V4 name is different from V2 name
		mV2ToV4Attribute = {
			"city" : "locality",
			"email" : "address",
			"familyname" : "surname",
			"givenname" : "given",
			"honorific" : "prefix",
			"middlename" : "additional",
			"name" : "fn",
			"org-role" : "role",
			"org-unit" : "orgunit",
			"percent-complete" : "percentcomplete",
			"tel" : "uri",
			"zip" : "code"
		},
		// map from V2 annotation to an array of an annotation term and a name in that annotation
		// that holds a collection of property references
		mV2ToV4PropertyCollection = {
			"sap:filterable" : [ "Org.OData.Capabilities.V1.FilterRestrictions",
				"NonFilterableProperties" ],
			"sap:required-in-filter" : [ "Org.OData.Capabilities.V1.FilterRestrictions",
				"RequiredProperties" ],
			"sap:sortable" : [ "Org.OData.Capabilities.V1.SortRestrictions",
				"NonSortableProperties" ]
		},
		iWARNING = jQuery.sap.log.Level.WARNING,
		Utils;


	/**
	 * This object contains helper functions for ODataMetaModel.
	 *
	 * @since 1.29.0
	 */
	Utils = {

		/**
		 * Adds EntitySet V4 annotation for current extension if extension value is equal to
		 * the given non-default value. Depending on bDeepCopy the annotation will be merged
		 * with deep copy.
		 * @param {object} o
		 *   any object
		 * @param {object} oExtension
		 *   the SAP Annotation (OData Version 2.0) for which a V4 annotation needs to be added
		 * @param {string} sTypeClass
		 *   the type class of the given object; supported type classes are "Property" and
		 *   "EntitySet"
		 * @param {string} sNonDefaultValue
		 *   if current extension value is equal to this sNonDefaultValue the annotation is
		 *   added
		 * @param {boolean} bDeepCopy
		 *   if true the annotation is mixed in as deep copy of the entry in mV2ToV4 map
		 */
		addEntitySetAnnotation : function (o, oExtension, sTypeClass, sNonDefaultValue, bDeepCopy) {
			if (sTypeClass === "EntitySet" && oExtension.value === sNonDefaultValue) {
				// potentially nested structure so do deep copy
				if (bDeepCopy) {
					jQuery.extend(true, o, mV2ToV4[oExtension.name]);
				} else {
					// Warning: Passing false for the first argument is not supported!
					jQuery.extend(o, mV2ToV4[oExtension.name]);
				}
			}
		},

		/**
		 * Adds corresponding V4 annotation for V2 <code>sap:filter-restriction</code> to the given
		 * entity set.
		 *
		 * @param {object} oProperty
		 *   the property of the entity
		 * @param {object} oEntitySet
		 *   the entity set to which the corresponding V4 annotations needs to be added
		 */
		addFilterRestriction : function (oProperty, oEntitySet) {
			var aFilterRestrictions,
				sFilterRestrictionValue = mFilterRestrictions[oProperty["sap:filter-restriction"]];

			if (!sFilterRestrictionValue) {
				if (jQuery.sap.log.isLoggable(iWARNING, sLoggingModule)) {
					jQuery.sap.log.warning("Unsupported sap:filter-restriction: "
							+ oProperty["sap:filter-restriction"],
						oEntitySet.entityType + "." + oProperty.name, sLoggingModule);
				}
				return;
			}

			aFilterRestrictions =
				oEntitySet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] || [];

			aFilterRestrictions.push({
				"Property" : { "PropertyPath" : oProperty.name},
				"AllowedExpressions" : {
					"EnumMember" : "com.sap.vocabularies.Common.v1.FilterExpressionType/"
						+ sFilterRestrictionValue
				}
			});
			oEntitySet["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] =
				aFilterRestrictions;
		},

		/**
		 * Adds current property to the property collection for given V2 annotation.
		 *
		 * @param {string} sV2AnnotationName
		 *   V2 annotation name (key in map mV2ToV4PropertyCollection)
		 * @param {object} oEntitySet
		 *   the entity set
		 * @param {object} oProperty
		 *   the property of the entity
		 */
		addPropertyToAnnotation : function (sV2AnnotationName, oEntitySet, oProperty) {
			var aNames = mV2ToV4PropertyCollection[sV2AnnotationName],
				sTerm = aNames[0],
				sCollection = aNames[1],
				oAnnotation = oEntitySet[sTerm] || {},
				aCollection = oAnnotation[sCollection] || [];

			aCollection.push({ "PropertyPath" : oProperty.name });
			oAnnotation[sCollection] = aCollection;
			oEntitySet[sTerm] = oAnnotation;
		},

		/**
		 * Collects sap:semantics annotations of the given type's properties at the type.
		 *
		 * @param {object} oType
		 *   the entity type or the complex type for which sap:semantics needs to be added
		 */
		addSapSemantics : function (oType) {
			if (oType.property) {
				oType.property.forEach(function (oProperty) {
					var aAnnotationParts,
						bIsCollection,
						aMatches,
						sSubStructure,
						vTmp,
						sV2Semantics = oProperty["sap:semantics"],
						sV4Annotation,
						sV4AnnotationPath,
						oV4Annotation,
						oV4TypeInfo,
						sV4TypeList;

					if (!sV2Semantics) {
						return;
					}
					aMatches = rSemanticsWithTypes.exec(sV2Semantics);
					if (!aMatches) {
						if (jQuery.sap.log.isLoggable(iWARNING, sLoggingModule)) {
							jQuery.sap.log.warning("Unsupported sap:semantics: " + sV2Semantics,
								oType.name + "." + oProperty.name, sLoggingModule);
						}
						return;
					}

					if (aMatches[2]) {
						sV2Semantics = aMatches[1];
						sV4TypeList = Utils.getV4TypesForV2Semantics(sV2Semantics, aMatches[2],
							oProperty, oType);
					}
					oV4TypeInfo = mV2SemanticsToV4TypeInfo[sV2Semantics];
					bIsCollection = sV2Semantics === "tel" || sV2Semantics === "email";
					sV4AnnotationPath = mSemanticsToV4AnnotationPath[sV2Semantics];
					if (sV4AnnotationPath) {
						aAnnotationParts = sV4AnnotationPath.split("/");
						sV4Annotation = "com.sap.vocabularies.Communication.v1."
							+ aAnnotationParts[0];
						oType[sV4Annotation] = oType[sV4Annotation] || {};
						oV4Annotation = oType[sV4Annotation];
						sSubStructure = aAnnotationParts[1];
						if (sSubStructure) {
							oV4Annotation[sSubStructure] = oV4Annotation[sSubStructure] ||
								(bIsCollection ? [] : {});
							if (bIsCollection) {
								vTmp = {};
								oV4Annotation[sSubStructure].push(vTmp);
								oV4Annotation = vTmp;
							} else {
								oV4Annotation = oV4Annotation[sSubStructure];
							}
						}
						oV4Annotation[mV2ToV4Attribute[sV2Semantics] || sV2Semantics]
							= { "Path" : oProperty.name };
						if (sV4TypeList) {
							// set also type attribute
							oV4Annotation.type = { "EnumMember" : sV4TypeList };
						}
					}

					// Additional annotation at the property with sap:semantics "tel" or "email";
					// ensure not to overwrite existing V4 annotations
					if (oV4TypeInfo) {
						oProperty[oV4TypeInfo.v4PropertyAnnotation] =
							oProperty[oV4TypeInfo.v4PropertyAnnotation] || oBoolTrue;
					}
				});
			}
		},

		/**
		 * Adds corresponding unit annotation (Org.OData.Measures.V1.Unit or
		 * Org.OData.Measures.V1.ISOCurrency)  to the given property based on the
		 * sap:semantics V2 annotation of the referenced unit property.
		 *
		 * @param {object} oValueProperty
		 *   the value property for which the unit annotation needs to be determined
		 * @param {object[]} aProperties
		 *   the array of properties containing the unit
		 */
		addUnitAnnotation : function (oValueProperty, aProperties) {
			var sUnitProperty = oValueProperty["sap:unit"],
				i = Utils.findIndex(aProperties, sUnitProperty),
				oUnit;

			if (i >= 0) {
				oUnit = aProperties[i];
				if (oUnit["sap:semantics"] === "unit-of-measure") {
					oValueProperty["Org.OData.Measures.V1.Unit"] =
						{ "Path" : oUnit.name };
				} else if (oUnit["sap:semantics"] === "currency-code") {
					oValueProperty["Org.OData.Measures.V1.ISOCurrency"] =
						{ "Path" : oUnit.name };
				}
			}
		},

		/**
		 * Adds the corresponding V4 annotation to the given object based on the given SAP
		 * extension.
		 *
		 * @param {object} o
		 *   any object
		 * @param {object} oExtension
		 *   the SAP Annotation (OData Version 2.0) for which a V4 annotation needs to be added
		 * @param {string} sTypeClass
		 *   the type class of the given object; supported type classes are "Property" and
		 *   "EntitySet"
		 */
		addV4Annotation : function (o, oExtension, sTypeClass) {
			switch (oExtension.name) {
				case "aggregation-role":
					if (oExtension.value === "dimension") {
						o["com.sap.vocabularies.Analytics.v1.Dimension"] = oBoolTrue;
					} else if (oExtension.value === "measure") {
						o["com.sap.vocabularies.Analytics.v1.Measure"] = oBoolTrue;
					}
					break;
				case "display-format":
					if (oExtension.value === "NonNegative") {
						o["com.sap.vocabularies.Common.v1.IsDigitSequence"] = oBoolTrue;
					} else if (oExtension.value === "UpperCase") {
						o["com.sap.vocabularies.Common.v1.IsUpperCase"] = oBoolTrue;
					}
					break;
				case "pageable":
				case "topable":
					Utils.addEntitySetAnnotation(o, oExtension, sTypeClass, "false", false);
					break;
				case "creatable":
					Utils.addEntitySetAnnotation(o, oExtension, sTypeClass, "false", true);
					break;
				case "deletable":
				case "deletable-path":
					Utils.handleXableAndXablePath(o, oExtension, sTypeClass,
						"Org.OData.Capabilities.V1.DeleteRestrictions", "Deletable");
					break;
				case "updatable":
				case "updatable-path":
					Utils.handleXableAndXablePath(o, oExtension, sTypeClass,
						"Org.OData.Capabilities.V1.UpdateRestrictions", "Updatable");
					break;
				case "requires-filter":
					Utils.addEntitySetAnnotation(o, oExtension, sTypeClass, "true", true);
					break;
				case "field-control":
					o["com.sap.vocabularies.Common.v1.FieldControl"]
						= { "Path" : oExtension.value };
					break;
				case "heading":
					o["com.sap.vocabularies.Common.v1.Heading"] = { "String" : oExtension.value };
					break;
				case "label":
					o["com.sap.vocabularies.Common.v1.Label"] = { "String" : oExtension.value };
					break;
				case "precision":
					o["Org.OData.Measures.V1.Scale"] = { "Path" : oExtension.value };
					break;
				case "quickinfo":
					o["com.sap.vocabularies.Common.v1.QuickInfo"] =
						{ "String" : oExtension.value };
					break;
				case "text":
					o["com.sap.vocabularies.Common.v1.Text"] = { "Path" : oExtension.value };
					break;
				case "visible":
					if (oExtension.value === "false") {
						o["com.sap.vocabularies.Common.v1.FieldControl"] = {
							"EnumMember" : "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
						};
						o["com.sap.vocabularies.UI.v1.Hidden"] = oBoolTrue;
					}
					break;
				default:
					// no transformation for V2 annotation supported or necessary
			}
		},

		/**
		 * Iterate over all properties of the associated entity type for given entity
		 * set and check whether the property needs to be added to an annotation at the
		 * entity set.
		 * For example all properties with "sap:sortable=false" are collected in
		 * annotation Org.OData.Capabilities.V1.SortRestrictions/NonSortableProperties.
		 *
		 * @param {object} oEntitySet
		 *   the entity set
		 * @param {object} oEntityType
		 *   the corresponding entity type
		 */
		calculateEntitySetAnnotations : function (oEntitySet, oEntityType) {
			if (oEntityType.property) {
				oEntityType.property.forEach(function (oProperty) {
					if (oProperty["sap:filterable"] === "false") {
						Utils.addPropertyToAnnotation("sap:filterable", oEntitySet, oProperty);
					}
					if (oProperty["sap:required-in-filter"] === "true") {
						Utils.addPropertyToAnnotation("sap:required-in-filter", oEntitySet,
							oProperty);
					}
					if (oProperty["sap:sortable"] === "false") {
						Utils.addPropertyToAnnotation("sap:sortable", oEntitySet, oProperty);
					}
					if (oProperty["sap:filter-restriction"]) {
						Utils.addFilterRestriction(oProperty, oEntitySet);
					}
				});
			}
			if (oEntityType.navigationProperty) {
				oEntityType.navigationProperty.forEach(function (oNavigationProperty) {
					if (oNavigationProperty["sap:filterable"] === "false") {
						Utils.addPropertyToAnnotation("sap:filterable", oEntitySet,
							oNavigationProperty);
					}
					Utils.handleCreatableNavigationProperty(oEntitySet, oNavigationProperty);
				});
			}
		},

		/**
		 * Returns the index of the object inside the given array, where the property with the
		 * given name has the given expected value.
		 *
		 * @param {object[]} aArray
		 *   some array
		 * @param {any} vExpectedPropertyValue
		 *   expected value of the property with given name
		 * @param {string} [sPropertyName="name"]
		 *   some property name
		 * @returns {number}
		 *   the index of the object found or <code>-1</code> if no such object is found
		 */
		findIndex : function (aArray, vExpectedPropertyValue, sPropertyName) {
			var iIndex = -1;

			sPropertyName = sPropertyName || "name";
			if (aArray) {
				aArray.forEach(function (oObject, i) {
					if (oObject[sPropertyName] === vExpectedPropertyValue) {
						iIndex = i;
						return false; // break
					}
				});
			}

			return iIndex;
		},

		/**
		 * Returns the object inside the given array, where the property with the given name has
		 * the given expected value.
		 *
		 * @param {object[]} aArray
		 *   some array
		 * @param {any} vExpectedPropertyValue
		 *   expected value of the property with given name
		 * @param {string} [sPropertyName="name"]
		 *   some property name
		 * @returns {object}
		 *   the object found or <code>null</code> if no such object is found
		 */
		findObject : function (aArray, vExpectedPropertyValue, sPropertyName) {
			var iIndex = Utils.findIndex(aArray, vExpectedPropertyValue, sPropertyName);

			return iIndex < 0 ? null : aArray[iIndex];
		},

		/**
		 * Gets the map from child name to annotations for a parent with the given qualified
		 * name which lives inside the entity container as indicated.
		 *
		 * @param {sap.ui.model.odata.ODataAnnotations} oAnnotations
		 *   the OData annotations
		 * @param {string} sQualifiedName
		 *   the parent's qualified name
		 * @param {boolean} bInContainer
		 *   whether the parent lives inside the entity container (or beside it)
		 * @returns {object}
		 *   the map from child name to annotations
		 */
		getChildAnnotations : function (oAnnotations, sQualifiedName, bInContainer) {
			var o = bInContainer
				? oAnnotations.EntityContainer
				: oAnnotations.propertyAnnotations;
			return o && o[sQualifiedName] || {};
		},

		/**
		 * Returns the thing with the given simple name from the given entity container.
		 *
		 * @param {object} oEntityContainer
		 *   the entity container
		 * @param {string} sArrayName
		 *   name of array within entity container which will be searched
		 * @param {string} sName
		 *   a simple name, e.g. "Foo"
		 * @param {boolean} [bAsPath=false]
		 *   determines whether the thing itself is returned or just its path
		 * @returns {object|string}
		 *   (the path to) the thing with the given qualified name; <code>undefined</code> (for a
		 *   path) or <code>null</code> (for an object) if no such thing is found
		 */
		getFromContainer : function (oEntityContainer, sArrayName, sName, bAsPath) {
			var k,
				vResult = bAsPath ? undefined : null;

			if (oEntityContainer) {
				k = Utils.findIndex(oEntityContainer[sArrayName], sName);
				if (k >= 0) {
					vResult = bAsPath
						? oEntityContainer.$path + "/" + sArrayName + "/" + k
						: oEntityContainer[sArrayName][k];
				}
			}

			return vResult;
		},

		/**
		 * Returns the thing with the given qualified name from the given model's array (within a
		 * schema) of given name.
		 *
		 * @param {sap.ui.model.Model|object[]} vModel
		 *   either a model or an array of schemas
		 * @param {string} sArrayName
		 *   name of array within schema which will be searched
		 * @param {string} sQualifiedName
		 *   a qualified name, e.g. "ACME.Foo"
		 * @param {boolean} [bAsPath=false]
		 *   determines whether the thing itself is returned or just its path
		 * @returns {object|string}
		 *   (the path to) the thing with the given qualified name; <code>undefined</code> (for a
		 *   path) or <code>null</code> (for an object) if no such thing is found
		 */
		getObject : function (vModel, sArrayName, sQualifiedName, bAsPath) {
			var aArray,
				vResult = bAsPath ? undefined : null,
				oSchema,
				iSeparatorPos,
				sNamespace,
				sName;

			sQualifiedName = sQualifiedName || "";
			iSeparatorPos = sQualifiedName.lastIndexOf(".");
			sNamespace = sQualifiedName.slice(0, iSeparatorPos);
			sName = sQualifiedName.slice(iSeparatorPos + 1);
			oSchema = Utils.getSchema(vModel, sNamespace);
			if (oSchema) {
				aArray = oSchema[sArrayName];
				if (aArray) {
					aArray.forEach(function (oThing) {
						if (oThing.name === sName) {
							vResult = bAsPath ? oThing.$path : oThing;
							return false; // break
						}
					});
				}
			}

			return vResult;
		},

		/**
		 * Returns the schema with the given namespace.
		 *
		 * @param {sap.ui.model.Model|object[]} vModel
		 *   either a model or an array of schemas
		 * @param {string} sNamespace
		 *   a namespace, e.g. "ACME"
		 * @returns {object}
		 *   the schema with the given namespace; <code>null</code> if no such schema is found
		 */
		getSchema : function (vModel, sNamespace) {
			var oSchema = null,
				aSchemas = Array.isArray(vModel)
					? vModel
					: vModel.getObject("/dataServices/schema");

			if (aSchemas) {
				aSchemas.forEach(function (o) {
					if (o.namespace === sNamespace) {
						oSchema = o;
						return false; // break
					}
				});
			}

			return oSchema;
		},

		/**
		 * Compute a space-separated list of V4 annotation enumeration values for the given
		 * sap:semantics "tel" and "email".
		 * E.g. for <code>sap:semantics="tel;type=fax"</code> this function returns
		 * "com.sap.vocabularies.Communication.v1.PhoneType/fax".
		 *
		 * @param {string} sSemantics
		 *   the sap:semantivs value ("tel" or "email")
		 * @param {string} sTypesList
		 *   the comma-separated list of types for sap:semantics
		 * @param {object} oProperty
		 *   the property
		 * @param {object} oType
		 *   the type
		 * @returns {string}
		 *   the corresponding space-separated list of V4 annotation enumeration values;
		 *   returns an empty string if the sap:semantics value is not supported; unsupported types
		 *   are logged and skipped;
		 */
		getV4TypesForV2Semantics : function (sSemantics, sTypesList, oProperty, oType) {
			var aResult = [],
				oV4TypeInfo = mV2SemanticsToV4TypeInfo[sSemantics];

			if (oV4TypeInfo) {
				sTypesList.split(",").forEach(function (sType) {
					var sTargetType = oV4TypeInfo.typeMapping[sType];
					if (sTargetType) {
						aResult.push(oV4TypeInfo.v4EnumType + "/" + sTargetType);
					} else if (jQuery.sap.log.isLoggable(iWARNING, sLoggingModule)) {
						jQuery.sap.log.warning("Unsupported type for sap:semantics: " + sType,
							oType.name + "." + oProperty.name, sLoggingModule);
					}
				});
			}
			return aResult.join(" ");
		},

		/**
		 * Returns the map representing the <code>com.sap.vocabularies.Common.v1.ValueList</code>
		 * annotations of the given property.
		 *
		 * @param {object} oProperty the property
		 * @returns {object} map of ValueList annotations contained in oProperty
		 */
		getValueLists : function (oProperty) {
			var sName,
				sQualifier,
				mValueLists = {};

			for (sName in oProperty) {
				if (jQuery.sap.startsWith(sName, "com.sap.vocabularies.Common.v1.ValueList")) {
					sQualifier = sName.split("#")[1] || "";
					mValueLists[sQualifier] = oProperty[sName];
				}
			}

			return mValueLists;
		},

		/**
		 * Convert sap:creatable and sap:creatable-path at navigation property to V4 annotation
		 * 'Org.OData.Capabilities.V1.InsertRestrictions/NonInsertableNavigationProperties' at
		 * the given entity set.
		 * If both V2 annotations 'sap:creatable' and 'sap:creatable-path' are given the service is
		 * broken and the navigation property is added as non-insertable navigation property.
		 * If neither 'sap:creatable' nor 'sap:creatable-path' are given this function does
		 * nothing.
		 *
		 * @param {object} oEntitySet
		 *   The entity set
		 * @param {object} oNavigationProperty
		 *   The navigation property
		 */
		handleCreatableNavigationProperty : function (oEntitySet, oNavigationProperty) {
			var sCreatable = oNavigationProperty["sap:creatable"],
				sCreatablePath = oNavigationProperty["sap:creatable-path"],
				oInsertRestrictions,
				oNonInsertable = {"NavigationPropertyPath" : oNavigationProperty.name},
				aNonInsertableNavigationProperties;

			if (sCreatable && sCreatablePath) {
				// inconsistent service if both v2 annotations are set
				jQuery.sap.log.warning("Inconsistent service",
					"Use either 'sap:creatable' or 'sap:creatable-path' at navigation property "
						+ "'" + oEntitySet.entityType + "/" + oNavigationProperty.name + "'",
					sLoggingModule);
				sCreatable = "false";
				sCreatablePath = undefined;
			}
			if (sCreatable === "false" || sCreatablePath) {
				oInsertRestrictions
					= oEntitySet["Org.OData.Capabilities.V1.InsertRestrictions"]
					= oEntitySet["Org.OData.Capabilities.V1.InsertRestrictions"] || {};
				aNonInsertableNavigationProperties
					= oInsertRestrictions["NonInsertableNavigationProperties"]
					= oInsertRestrictions["NonInsertableNavigationProperties"] || [];
				if (sCreatablePath) {
					oNonInsertable = {
						"If" : [{
							"Not" : {
								"Path" : sCreatablePath
							}
						}, oNonInsertable]
					};
				}
				aNonInsertableNavigationProperties.push(oNonInsertable);
			}
		},

		/**
		 * Converts deletable/updatable and delatable-path/updatable-path into corresponding V4
		 * annotation.
		 * If both deletable/updatable and delatable-path/updatable-path are defined the service is
		 * broken and the object is marked as non-deletable/non-updatable.
		 *
		 * @param {object} o
		 *   any object
		 * @param {object} oExtension
		 *   the SAP Annotation (OData Version 2.0) for which a V4 annotation needs to be added
		 * @param {string} sTypeClass
		 *   the type class of the given object; supported type is "EntitySet"
		 * @param {string} sTerm
		 *   the V4 annotation term to use
		 * @param {string} sProperty
		 *   the V4 annotation property to use
		 */
		handleXableAndXablePath : function (o, oExtension, sTypeClass, sTerm, sProperty) {
			var sV2Annotation = sProperty.toLowerCase(),
				oValue;

			if (sTypeClass !== "EntitySet") {
				return; // "Property" not supported here, see liftSAPData()
			}

			if (o["sap:" + sV2Annotation] && o["sap:" + sV2Annotation + "-path"]) {
				// the first extension (sap:xable or sap:xable-path) is processed as usual;
				// only if a second extension (sap:xable-path or sap:xable) is processed,
				// the warning is logged and the entity set is marked as non-deletable or
				// non-updatable
				jQuery.sap.log.warning("Inconsistent service",
					"Use either 'sap:" + sV2Annotation + "' or 'sap:" + sV2Annotation + "-path'"
						+ " at entity set '" + o.name + "'", sLoggingModule);
				oValue = oBoolFalse;
			} else if (sV2Annotation !== oExtension.name) {
				// delatable-path/updatable-path
				oValue = { "Path" : oExtension.value };
			} else if (oExtension.value === "false") {
				oValue = oBoolFalse;
			}

			if (oValue) {
				o[sTerm] = o[sTerm] || {};
				o[sTerm][sProperty] = oValue;
			}
		},

		/**
		 * Lift all extensions from the <a href="http://www.sap.com/Protocols/SAPData"> SAP
		 * Annotations for OData Version 2.0</a> namespace up as attributes with "sap:" prefix.
		 *
		 * @param {object} o
		 *   any object
		 * @param {string} sTypeClass
		 *   the type class of the given object; supported type classes are "Property" and
		 *   "EntitySet"
		 */
		liftSAPData : function (o, sTypeClass) {
			if (!o.extensions) {
				return;
			}

			o.extensions.forEach(function (oExtension) {
				if (oExtension.namespace === "http://www.sap.com/Protocols/SAPData") {
					o["sap:" + oExtension.name] = oExtension.value;
					Utils.addV4Annotation(o, oExtension, sTypeClass);
				}
			});
			// after all SAP V2 annotations are lifted up add V4 annotations that are calculated
			// by multiple V2 annotations or that have a different default value
			switch (sTypeClass) {
				case "Property":
					if (o["sap:updatable"] === "false") {
						if (o["sap:creatable"] === "false") {
							o["Org.OData.Core.V1.Computed"] = oBoolTrue;
						} else {
							o["Org.OData.Core.V1.Immutable"] = oBoolTrue;
						}
					}
					break;
				case "EntitySet":
					if (o["sap:searchable"] !== "true") {
						o["Org.OData.Capabilities.V1.SearchRestrictions"] =
							{ "Searchable" : oBoolFalse };
					}
					break;
				default:
					// nothing to do
			}
		},

		/**
		 * Merges the given annotation data into the given metadata and lifts SAPData extensions.
		 *
		 * @param {object} oAnnotations
		 *   annotations "JSON"
		 * @param {object} oData
		 *   metadata "JSON"
		 */
		merge : function (oAnnotations, oData) {
			var aSchemas = oData.dataServices.schema;

			if (!aSchemas) {
				return;
			}
			aSchemas.forEach(function (oSchema, i) {
				// remove datajs artefact for inline annotations in $metadata
				delete oSchema.annotations;

				Utils.liftSAPData(oSchema);
				oSchema.$path = "/dataServices/schema/" + i;
				jQuery.extend(oSchema, oAnnotations[oSchema.namespace]);

				Utils.visitParents(oSchema, oAnnotations, "association",
					function (oAssociation, mChildAnnotations) {
						Utils.visitChildren(oAssociation.end, mChildAnnotations);
					});

				Utils.visitParents(oSchema, oAnnotations, "complexType",
					function (oComplexType, mChildAnnotations) {
						Utils.visitChildren(oComplexType.property, mChildAnnotations, "Property");
						Utils.addSapSemantics(oComplexType);
					});

				// visit all entity types before visiting the entity sets to ensure that V2
				// annotations are already lifted up and can be used for calculating entity
				// set annotations which are based on V2 annotations on entity properties
				Utils.visitParents(oSchema, oAnnotations, "entityType", Utils.visitEntityType);

				Utils.visitParents(oSchema, oAnnotations, "entityContainer",
					function (oEntityContainer, mChildAnnotations) {
						Utils.visitChildren(oEntityContainer.associationSet, mChildAnnotations);
						Utils.visitChildren(oEntityContainer.entitySet, mChildAnnotations,
							"EntitySet", aSchemas);
						Utils.visitChildren(oEntityContainer.functionImport, mChildAnnotations,
							"", null, Utils.visitParameters.bind(this,
								oAnnotations, oSchema, oEntityContainer));
					});
			});
		},

		/**
		 * Visits all children inside the given array, lifts "SAPData" extensions and
		 * inlines OData V4 annotations for each child.
		 *
		 * @param {object[]} aChildren
		 *   any array of children
		 * @param {object} mChildAnnotations
		 *   map from child name (or role) to annotations
		 * @param {string} [sTypeClass]
		 *   the type class of the given children; supported type classes are "Property"
		 *   and "EntitySet"
		 * @param {object[]} [aSchemas]
		 *   Array of OData data service schemas (needed only for type class "EntitySet")
		 * @param {function} [fnCallback]
		 *   optional callback for each child
		 * @param {number} [iStartIndex=0]
		 *   optional start index in the given array
		 */
		visitChildren : function (aChildren, mChildAnnotations, sTypeClass, aSchemas, fnCallback,
				iStartIndex) {
			if (!aChildren) {
				return;
			}
			if (iStartIndex) {
				aChildren = aChildren.slice(iStartIndex);
			}
			aChildren.forEach(function (oChild) {
				// lift SAP data for easy access to SAP Annotations for OData V 2.0
				Utils.liftSAPData(oChild, sTypeClass);
			});
			aChildren.forEach(function (oChild) {
				var oEntityType;

				if (sTypeClass === "Property" && oChild["sap:unit"]) {
					Utils.addUnitAnnotation(oChild, aChildren);
				} else if (sTypeClass === "EntitySet") {
					// calculated entity set annotations need to be added before V4
					// annotations are merged
					oEntityType = Utils.getObject(aSchemas, "entityType", oChild.entityType);
					Utils.calculateEntitySetAnnotations(oChild, oEntityType);
				}

				if (fnCallback) {
					fnCallback(oChild);
				}
				// merge V4 annotations after child annotations are processed
				jQuery.extend(oChild, mChildAnnotations[oChild.name || oChild.role]);
			});
		},

		/**
		 * Visits the given entity type and its (structural or navigation) properties.
		 *
		 * @param {object} oEntityType
		 *   the entity type
		 * @param {object} mChildAnnotations
		 *   map from child name (or role) to annotations
		 */
		visitEntityType : function (oEntityType, mChildAnnotations) {
			Utils.visitChildren(oEntityType.property, mChildAnnotations, "Property");
			Utils.visitChildren(oEntityType.navigationProperty, mChildAnnotations);
			Utils.addSapSemantics(oEntityType);
		},

		/**
		 * Visits all parameters of the given function import.
		 *
		 * @param {object} oAnnotations
		 *   annotations "JSON"
		 * @param {object} oSchema
		 *   OData data service schema
		 * @param {object} oEntityContainer
		 *   the entity container
		 * @param {object} oFunctionImport
		 *   a function import's V2 metadata object
		 */
		visitParameters : function (oAnnotations, oSchema, oEntityContainer, oFunctionImport) {
			var mAnnotations;

			if (!oFunctionImport.parameter) {
				return;
			}
			mAnnotations = Utils.getChildAnnotations(oAnnotations,
				oSchema.namespace + "." + oEntityContainer.name, true);
			oFunctionImport.parameter.forEach(
				function (oParam) {
					Utils.liftSAPData(oParam);
					jQuery.extend(oParam,
						mAnnotations[oFunctionImport.name + "/" + oParam.name]);
				}
			);
		},

		/**
		 * Visits all parents (or a single parent) inside the current schema's array of given name,
		 * lifts "SAPData" extensions, inlines OData V4 annotations, and adds <code>$path</code>
		 * for each parent.
		 *
		 * @param {object} oSchema
		 *   OData data service schema
		 * @param {object} oAnnotations
		 *   annotations "JSON"
		 * @param {string} sArrayName
		 *   name of array of parents
		 * @param {function} fnCallback
		 *   mandatory callback for each parent, child annotations are passed in
		 * @param {number} [iIndex]
		 *   optional index of a single parent to visit; default is to visit all
		 */
		visitParents : function (oSchema, oAnnotations, sArrayName, fnCallback, iIndex) {
			var aParents = oSchema[sArrayName];

			function visitParent(oParent, j) {
				var sQualifiedName = oSchema.namespace + "." + oParent.name,
					mChildAnnotations = Utils.getChildAnnotations(oAnnotations, sQualifiedName,
						sArrayName === "entityContainer");

				Utils.liftSAPData(oParent);
				// @see sap.ui.model.odata.ODataMetadata#_getEntityTypeByName
				oParent.namespace = oSchema.namespace;
				oParent.$path = oSchema.$path + "/" + sArrayName + "/" + j;

				fnCallback(oParent, mChildAnnotations);
				// merge V4 annotations after child annotations are processed
				jQuery.extend(oParent, oAnnotations[sQualifiedName]);
			}

			if (!aParents) {
				return;
			}
			if (iIndex !== undefined) {
				visitParent(aParents[iIndex], iIndex);
			} else {
				aParents.forEach(visitParent);
			}
		}
	};

	return Utils;
}, /* bExport= */ false);
