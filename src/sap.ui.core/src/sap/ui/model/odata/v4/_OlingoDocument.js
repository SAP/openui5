/*!
 * ${copyright}
 */

sap.ui.define([
	"./_ODataHelper",
	"./_SyncPromise",
	"sap/ui/thirdparty/odatajs-4.0.0"
], function (Helper, SyncPromise, Olingo) {
	"use strict";
	/*global odatajs */

	var rCollection = /^Collection\((.*)\)$/,
		mFacets = {
			"maxLength" : "MaxLength",
			"precision" : "Precision",
			"scale" : "Scale"
		},
		OlingoDocument;

	OlingoDocument = {

		/**
		 * Returns a SyncPromise for the metadata document. Reads it from
		 * <code>oModel.sDocumentUrl</code> via the Olingo metadata handler with the first request.
		 * Caches it and responds subsequent queries from the cache.
		 *
		 * @param {sap.ui.model.odata.v4.oDataDocumentModel} oModel
		 *   the model
		 * @returns {SyncPromise}
		 *   a promise to be resolved with the metadata document
		 * @private
		 */
		fetchDocument : function (oModel) {
			if (!oModel._oDocumentPromise) {
				oModel._oDocumentPromise = SyncPromise.resolve(
					new Promise(function (fnResolve, fnReject) {
						odatajs.oData.request({
							requestUri: oModel.sDocumentUrl
						}, function (oDocument) {
							fnResolve(oDocument);
						}, function (oOlingoError) {
							var oError = Helper.createError(oOlingoError);

							jQuery.sap.log.error(oError.message, "GET " + oModel.sDocumentUrl,
								"sap.ui.model.odata.v4.ODataDocumentModel");
							fnReject(oError);
						},  odatajs.oData.metadataHandler);
					}));
			}
			return oModel._oDocumentPromise;
		},

		/**
		 * Finds the complex type in the Olingo metadata document.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the complex type
		 * @return {object}
		 *   the complex type
		 * @throws {Error} if no complex type with this name could be found
		 * @private
		 */
		findComplexType: function (oDocument, sQualifiedName) {
			var i = sQualifiedName.lastIndexOf("."),
			oResult,
			sSchemaName = sQualifiedName.substring(0, i),
			oSchema = Helper.findInArray(oDocument.dataServices.schema, "namespace", sSchemaName),
			sTypeName = sQualifiedName.substring(i + 1);

			if (oSchema) {
				oResult = Helper.findInArray(oSchema.complexType, "name", sTypeName);
				if (oResult) {
					return oResult;
				}
			}
			throw new Error("Unknown complex type: " + sQualifiedName);
		},

		/**
		 * Finds the entity type in the Olingo metadata document.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the entity type
		 * @return {object}
		 *   the entity type
		 * @throws {Error} if no entity type can be found
		 *
		 * @private
		 */
		findEntityType : function (oDocument, sQualifiedName) {
			var i = sQualifiedName.lastIndexOf("."),
				oResult,
				sSchemaName = sQualifiedName.substring(0, i),
				oSchema = Helper.findInArray(oDocument.dataServices.schema, "namespace",
					sSchemaName),
				sTypeName = sQualifiedName.substring(i + 1);

			if (oSchema) {
				oResult = Helper.findInArray(oSchema.entityType, "name", sTypeName);
				if (oResult) {
					return oResult;
				}
			}
			throw new Error("Unknown entity type: " + sQualifiedName);
		},

		/**
		 * Finds the schema containing the entity container in the Olingo metadata document.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @return {object}
		 *   the schema containing entity container
		 * @throws {Error} if the entity container cannot be found
		 * @private
		 */
		findSchemaWithEntityContainer : function (oDocument) {
			var oSchema, i;

			for (i = 0; i < oDocument.dataServices.schema.length; i++) {
				oSchema = oDocument.dataServices.schema[i];
				if ("entityContainer" in oSchema) {
					return oSchema;
				}
			}
			throw new Error("EntityContainer not found");
		},

		/**
		 * Determines the schema name from the qualified name.
		 *
		 * @param {string} sQualifiedName
		 *   a qualified name
		 * @returns {string}
		 *   the schema name
		 */
		getSchemaName : function (sQualifiedName) {
			var i = sQualifiedName.lastIndexOf('.');
			return i >= 0 ? sQualifiedName.slice(0, i) : "";
		},

		/**
		 * Strips off the simple name which is separated from the qualifying part via a dot.
		 *
		 * @param {string} sQualifiedName
		 *   a qualified name
		 * @returns {string}
		 *   the unqualified name
		 */
		getUnqualifiedName : function (sQualifiedName) {
			var i = sQualifiedName.lastIndexOf('.');
			return i >= 0 ? sQualifiedName.slice(i + 1) : sQualifiedName;
		},

		/**
		 * Parses a type reference in a (navigation) property.
		 * @param {string} sTypeRef
		 *   the type reference (either "Edm.String" or "Collection(Edm.String)")
		 * @returns {object}
		 *  an object with the properties {boolean} collection, {string} qualifiedName
		 */
		parseTypeRef : function (sTypeRef) {
			var aMatches = rCollection.exec(sTypeRef);

			return {
				collection: !!aMatches,
				qualifiedName: aMatches ? aMatches[1] : sTypeRef
			};
		},

		/**
		 * Finds the entity container in the Olingo metadata document and transforms it to the Edmx
		 * format. EntitySets and Singletons are inserted.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @return {object}
		 *   the entity container
		 * @private
		 */
		transformEntityContainer : function (oDocument) {
			var oSchema = OlingoDocument.findSchemaWithEntityContainer(oDocument),
				oEntityContainer = oSchema.entityContainer,
				oResult = {
					"Name" : oEntityContainer.name,
					"QualifiedName" : oSchema.namespace + "." + oEntityContainer.name,
					"EntitySets" : [],
					"Singletons" : []
				};

			if (oEntityContainer.entitySet) {
				oEntityContainer.entitySet.forEach(function(oEntitySet) {
					oResult.EntitySets.push({
						"Name" : oEntitySet.name,
						"Fullname" : oResult.QualifiedName + "/" + oEntitySet.name,
						"NavigationPropertyBindings" :
							OlingoDocument.transformNavigationPropertyBindings(
								oEntitySet.navigationPropertyBinding, oEntitySet.name,
								oResult.QualifiedName),
						"EntityType" : {
							"QualifiedName" : oEntitySet.entityType
						}
					});
				});
			}
			if (oEntityContainer.singleton) {
				oEntityContainer.singleton.forEach(function(oSingleton) {
					oResult.Singletons.push({
						"Name" : oSingleton.name,
						"Fullname" : oResult.QualifiedName + "/" + oSingleton.name,
						"NavigationPropertyBindings" :
							OlingoDocument.transformNavigationPropertyBindings(
								oSingleton.navigationPropertyBinding, oSingleton.name,
								oResult.QualifiedName),
						"Type" : {
							"QualifiedName" : oSingleton.type
						}
					});
				});
			}
			return oResult;
		},

		/**
		 * Transforms the given NavigationPropertyBindings to the Edmx format.
		 *
		 * @param {object[]} aNavigationPropertyBindings
		 *   the array of NavigationPropertyBindings
		  * @param {string} sSetName
		 *   the short name of the entity set owning the bindings
		 * @param {string} sContainerName
		 *   the qualified name of the entity container
		 * @return {object[]}
		 *   the transformed array of NavigationPropertyBindings
		 * @private
		 */
		transformNavigationPropertyBindings : function (aNavigationPropertyBindings, sSetName,
			sContainerName) {
			var aResult = [];

			if (aNavigationPropertyBindings) {
				aNavigationPropertyBindings.forEach(function(oNavigationPropertyBinding) {
					var sTargetName = oNavigationPropertyBinding.target;

					if (sTargetName.indexOf("/") < 0) {
						sTargetName = sContainerName + "/" + sTargetName;
					}
					aResult.push({
						"Fullname" : sContainerName + "/" + sSetName + "/"
							+ oNavigationPropertyBinding.path,
						"Path" : oNavigationPropertyBinding.path,
						"Target" : {
							"Fullname" : sTargetName
						}
					});
				});
			}
			return aResult;
		},

		/**
		 * Finds the entity type in the Olingo metadata document and transforms it to the Edmx
		 * format.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the entity type
		 * @return {object}
		 *   the entity type or <code>undefined</code> if not found
		 * @private
		 */
		transformEntityType : function (oDocument, sQualifiedName) {
			var oEntityType = OlingoDocument.findEntityType(oDocument, sQualifiedName),
				i,
				oResult = OlingoDocument.transformStructuredType(oDocument, sQualifiedName,
					oEntityType),
				oSourceProperty,
				oTargetProperty,
				oTypeRef;

			oResult.Key = [];
			oResult.NavigationProperties = [];
			for (i = 0; i < oEntityType.key[0].propertyRef.length; i++) {
				oResult.Key.push({"PropertyPath" : oEntityType.key[0].propertyRef[i].name});
			}
			if (oEntityType.navigationProperty) {
				for (i = 0; i < oEntityType.navigationProperty.length; i++) {
					oSourceProperty = oEntityType.navigationProperty[i];
					oTypeRef = OlingoDocument.parseTypeRef(oSourceProperty.type);
					oTargetProperty = {
						"Name" : oSourceProperty.name,
						"Fullname" : sQualifiedName + "/" + oSourceProperty.name,
						"Nullable" : oSourceProperty.nullable === "true",
						"ContainsTarget" : false,
						"IsCollection" : oTypeRef.collection,
						"Type" : {
							"QualifiedName" : oTypeRef.qualifiedName
						}
					};
					oResult.NavigationProperties.push(oTargetProperty);
				}
			}

			return oResult;
		},

		/**
		 * Transforms the structured type in Olingo meta data format to the Edmx format.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the structured type
		 * @param {object} oType
		 *   the type as found in the Olingo document
		 * @return {object}
		 *   the structured type
		 * @private
		 */
		transformStructuredType: function (oDocument, sQualifiedName, oType) {
			var sFacet,
				i,
				oResult = {
					"Name" : oType.name,
					"QualifiedName" : sQualifiedName,
					"Abstract" : false,
					"OpenType" : false,
					"Properties" : []
				},
				oSourceProperty,
				oTargetProperty;

			for (i = 0; i < oType.property.length; i++) {
				oSourceProperty = oType.property[i];
				oTargetProperty = {
					"Name" : oSourceProperty.name,
					"Fullname" : sQualifiedName + "/" + oSourceProperty.name,
					"Nullable" : oSourceProperty.nullable === "true",
					"Facets" : [],
					"Type" : OlingoDocument.transformType(oDocument, oSourceProperty.type)
				};
				for (sFacet in mFacets) {
					if (sFacet in oSourceProperty) {
						oTargetProperty.Facets.push({
							"Name" : mFacets[sFacet],
							"Value" : oSourceProperty[sFacet]
						});
					}
				}
				oResult.Properties.push(oTargetProperty);
			}
			return oResult;
		},

		/**
		 * Finds the property type in the Olingo metadata and transforms it to the Edmx format.
		 *
		 * @param {object} oDocument
		 *   the Olingo metadata document
		 * @param {string} sQualifiedName
		 *   the qualified name of the property type
		 * @return {object}
		 *   the property type or <code>undefined</code> if not found
		 * @private
		 */
		transformType: function (oDocument, sQualifiedName) {
			var oType;

			if (OlingoDocument.getSchemaName(sQualifiedName) === "Edm") {
				return {
					"@odata.type" : "#Edm.Metadata.PrimitiveType",
					"Name" : OlingoDocument.getUnqualifiedName(sQualifiedName),
					"QualifiedName" : sQualifiedName
				};
			}
			oType = OlingoDocument.transformStructuredType(oDocument, sQualifiedName,
				OlingoDocument.findComplexType(oDocument, sQualifiedName));
			oType["@odata.type"] = "#Edm.Metadata.ComplexType";
			return oType;
		}
	};

	return OlingoDocument;
}, /* bExport= */ false);
