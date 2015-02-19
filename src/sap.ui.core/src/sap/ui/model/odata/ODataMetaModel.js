/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/BindingMode', 'sap/ui/model/ClientContextBinding',
		'sap/ui/model/json/JSONListBinding', 'sap/ui/model/json/JSONModel',
		'sap/ui/model/json/JSONPropertyBinding', 'sap/ui/model/json/JSONTreeBinding',
		'sap/ui/model/MetaModel'],
	function(BindingMode, ClientContextBinding, JSONListBinding, JSONModel, JSONPropertyBinding,
			JSONTreeBinding, MetaModel) {
	"use strict";

	/*global Promise */

	/**
	 * DO NOT CALL this private constructor for a new <code>ODataMetaModel</code>,
	 * but rather use {@link sap.ui.model.odata.ODataModel#getMetaModel} instead!
	 *
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
	 *   the OData model's meta data object
	 * @param {sap.ui.model.odata.ODataAnnotations} oAnnotations
	 *   the OData model's annotations object
	 *
	 * @class Implementation of an OData meta model which offers a unified access to both OData v2
	 * meta data and v4 annotations. It uses the existing {@link sap.ui.model.odata.ODataMetadata}
	 * as a foundation and merges v4 annotations from the existing
	 * {@link sap.ui.model.odata.ODataAnnotations} directly into the corresponding model element.
	 *
	 * Also, annotations from the "http://www.sap.com/Protocols/SAPData" namespace are lifted up
	 * from the <code>extensions</code> array and transformed from objects into simple properties
	 * with an "sap:" prefix for their name. Note that this happens in addition, thus the
	 * following example shows both representations. This way, such annotations can be addressed
	 * via a simple relative path instead of searching an array.
	 * <pre>
		{
			"name" : "BusinessPartnerID",
			"extensions" : [{
				"name" : "label",
				"value" : "Bus. Part. ID",
				"namespace" : "http://www.sap.com/Protocols/SAPData"
			}],
			"sap:label" : "Bus. Part. ID"
		}
	 * </pre>
	 *
	 * This model is read-only and thus only supports
	 * {@link sap.ui.model.BindingMode.OneTime OneTime} binding mode. No events
	 * ({@link sap.ui.model.Model#event:parseError parseError},
	 * {@link sap.ui.model.Model#event:requestCompleted requestCompleted},
	 * {@link sap.ui.model.Model#event:requestFailed requestFailed},
	 * {@link sap.ui.model.Model#event:requestSent requestSent}) are fired!
	 * For asynchronous loading use {@link #loaded loaded} instead, which is based on promises.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.ODataMetaModel
	 * @extends sap.ui.model.MetaModel
	 * @public
	 * @since 1.27.0
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.ODataMetaModel",
			/** @lends sap.ui.model.odata.ODataMetaModel.prototype */ {

			constructor : function(oMetadata, oAnnotations) {
				MetaModel.apply(this); // no arguments to pass!
				this.sDefaultBindingMode = BindingMode.OneTime;
				this.mSupportedBindingModes = {"OneTime" : true};
				this.oModel = new JSONModel();
				this.oModel.setDefaultBindingMode(this.sDefaultBindingMode);
				this.oLoadedPromise = load(this.oModel, oMetadata, oAnnotations);
			},

			metadata : {
				publicMethods : ["loaded"]
			}
		});

	/*
	 * Returns the index of the object inside the given array, where the property with the given
	 * name has the given expected value.
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
	function findIndex(aArray, vExpectedPropertyValue, sPropertyName) {
		var iIndex = -1;

		sPropertyName = sPropertyName || "name";
		jQuery.each(aArray || [], function (i, oObject) {
			if (oObject[sPropertyName] === vExpectedPropertyValue) {
				iIndex = i;
				return false; // break
			}
		});

		return iIndex;
	}

	/*
	 * Returns the object inside the given array, where the property with the given name has the
	 * given expected value.
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
	function findObject(aArray, vExpectedPropertyValue, sPropertyName) {
		var iIndex = findIndex(aArray, vExpectedPropertyValue, sPropertyName);

		return iIndex < 0 ? null : aArray[iIndex];
	}

	/*
	 * Returns the thing with the given qualified name from the given model's array (within a
	 * schema) of given name.
	 *
	 * @param {sap.ui.model.Model} oModel
	 *   any model
	 * @param {string} sArrayName
	 *  name of array within schema which will be searched
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Foo"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the thing itself is returned or just its path
	 * @returns {object|string}
	 *   (the path to) the thing with the given qualified name; <code>undefined</code> (for a path)
	 *   or <code>null</code> (for an object) if no such thing is found
	 */
	function getObject(oModel, sArrayName, sQualifiedName, bAsPath) {
		var vResult = bAsPath ? undefined : null,
			iSeparatorPos,
			sNamespace,
			sName;

		sQualifiedName = sQualifiedName || "";
		iSeparatorPos = sQualifiedName.lastIndexOf(".");
		sNamespace = sQualifiedName.slice(0, iSeparatorPos);
		sName = sQualifiedName.slice(iSeparatorPos + 1);
		jQuery.each(oModel.getObject("/dataServices/schema") || [], function (i, oSchema) {
			if (oSchema.namespace === sNamespace) {
				jQuery.each(oSchema[sArrayName] || [], function (j, oThing) {
					if (oThing.name === sName) {
						vResult = bAsPath ? oThing.$path : oThing;
						return false; // break
					}
				});
				return false; // break
			}
		});

		return vResult;
	}

	/*
	 * Waits until the given OData meta data and annotations are fully loaded and merges them
	 * into the given JSON model. Returns the promise used by {@link #loaded}.
	 *
	 * @param {sap.ui.model.json.JSONModel} oModel
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
	 * @param {sap.ui.model.odata.ODataAnnotations} oAnnotations
	 * @returns {Promise}
	 */
	function load(oModel, oMetadata, oAnnotations) {
		/*
		 * Lift all extensions from the <a href="http://www.sap.com/Protocols/SAPData">
		 * SAP Annotations for OData Version 2.0</a> namespace up as attributes with "sap:" prefix.
		 *
		 * @param {number} iUnused
		 *   unused index so that the function can be used directly in jQuery.each
		 * @param {object} o
		 *   any object
		 */
		function liftSAPData(iUnused, o) {
			jQuery.each(o.extensions || [], function (i, oExtension) {
				if (oExtension.namespace === "http://www.sap.com/Protocols/SAPData") {
					o["sap:" + oExtension.name] = oExtension.value;
				}
			});
		}

		/*
		 * Calls the given success handler as soon as the given object is "loaded".
		 * Calls the given error handler as soon as the given object is "failed".
		 *
		 * @param {object} o
		 * @param {function(void)} fnSuccess
		 * @param {function(Error)} fnError
		 */
		function loaded(o, fnSuccess, fnError) {
			if (!o || o.isLoaded()) {
				fnSuccess();
			} else if (o.isFailed()) {
				fnError(new Error("Error loading meta model"));
			} else {
				o.attachLoaded(fnSuccess);
				o.attachFailed(function (oEvent) {
					fnError(new Error("Error loading meta model: "
						+ oEvent.getParameter("message")));
				});
			}
		}

		/*
		 * Visits all children inside the given array, lifts "SAPData" extensions and inlines OData
		 * v4 annotations for each child.
		 *
		 * @param {object[]} aChildren
		 *   any array of children
		 * @param {object} mChildAnnotations
		 *   map from child name (or role) to annotations
		 * @param {function} [fnCallback]
		 *   optional callback for each child
		 */
		function visitChildren(aChildren, mChildAnnotations, fnCallback) {
			jQuery.each(aChildren || [], function (iUnused, oChild) {
				liftSAPData(iUnused, oChild);
				jQuery.extend(oChild, mChildAnnotations[oChild.name || oChild.role]);

				if (fnCallback) {
					fnCallback(oChild);
				}
			});
		}

		/*
		 * Merges the given annotation data into the given meta data and lifts SAPData extensions.
		 *
		 * @param {object} oAnnotations
		 *   annotations "JSON"
		 * @param {object} oData
		 *   meta data "JSON"
		 */
		function merge(oAnnotations, oData) {
			/*
			 * Gets the map from child name to annotations for a parent with the given qualified
			 * name which lives inside the entity container as indicated.
			 *
			 * @param {string} sQualifiedName
			 *   the parent's qualified name
			 * @param {boolean} bInContainer
			 *   whether the parent lives inside the entity container (or beside it)
			 * @returns {object}
			 *   the map from child name to annotations
			 */
			function getChildAnnotations(sQualifiedName, bInContainer) {
				var o = bInContainer
					? oAnnotations.EntityContainer
					: oAnnotations.propertyAnnotations;
				return o && o[sQualifiedName] || {};
			}

			jQuery.each(oData.dataServices.schema || [], function (i, oSchema) {
				/*
				 * Visits all parents inside the current schema's array of given name,
				 * lifts "SAPData" extensions, inlines OData v4 annotations,
				 * and adds <code>$path</code> for each parent.
				 *
				 * @param {string} sArrayName
				 *   name of array of parents
				 * @param {boolean} bInContainer
				 *   whether the parents live inside the entity container (or beside it)
				 * @param {function} fnCallback
				 *   mandatory callback for each parent, child annotations are passed in
				 */
				function visitParents(sArrayName, bInContainer, fnCallback) {
					var aParents = oSchema[sArrayName];

					jQuery.each(aParents || [], function (j, oParent) {
						var sQualifiedName = oSchema.namespace + "." + oParent.name,
							mChildAnnotations = getChildAnnotations(sQualifiedName, bInContainer);

						liftSAPData(j, oParent);
						jQuery.extend(oParent, oAnnotations[sQualifiedName]);
						oParent.$path = "/dataServices/schema/" + i + "/" + sArrayName + "/" + j;

						fnCallback(oParent, mChildAnnotations);
					});
				}

				liftSAPData(i, oSchema);
				jQuery.extend(oSchema, oAnnotations[oSchema.namespace]);

				visitParents("association", false, function (oAssociation, mChildAnnotations) {
					visitChildren(oAssociation.end, mChildAnnotations);
				});

				visitParents("complexType", false, function (oComplexType, mChildAnnotations) {
					visitChildren(oComplexType.property, mChildAnnotations);
				});

				visitParents("entityContainer", true,
					function (oEntityContainer, mChildAnnotations) {
						/*
						 * Visits all parameters of the given function import.
						 *
						 * @param {object} oFunctionImport
						 *   a function import's v2 meta data object
						 */
						function visitParameters(oFunctionImport) {
							var sQualifiedName = oSchema.namespace + "." + oEntityContainer.name,
								mAnnotations = oAnnotations.EntityContainer
									&& oAnnotations.EntityContainer[sQualifiedName]
									|| {};

							jQuery.each(oFunctionImport.parameter || [],
								function (iUnused, oParam) {
									liftSAPData(iUnused, oParam);
									jQuery.extend(oParam,
										mAnnotations[oFunctionImport.name + "/" + oParam.name]);
								}
							);
						}

						visitChildren(oEntityContainer.associationSet, mChildAnnotations);
						visitChildren(oEntityContainer.entitySet, mChildAnnotations);
						visitChildren(oEntityContainer.functionImport, mChildAnnotations,
							visitParameters);
					}
				);

				visitParents("entityType", false, function (oEntityType, mChildAnnotations) {
					visitChildren(oEntityType.property, mChildAnnotations);
					visitChildren(oEntityType.navigationProperty, mChildAnnotations);
				});
			});
		}

		return new Promise(function (fnResolve, fnReject) {
			loaded(oMetadata, function () {
				loaded(oAnnotations, function () {
					try {
						var oData = JSON.parse(JSON.stringify(oMetadata.getServiceMetadata()));
						merge(oAnnotations ? oAnnotations.getAnnotationsData() : {}, oData);
						oModel.setData(oData);
						fnResolve();
					} catch (ex) {
						fnReject(ex);
					}
				}, fnReject);
			}, fnReject);
		});
	}

	/**
	 * Returns the value of the object or property inside this model's data which can be reached,
	 * starting at the given context, by following the given path.
	 *
	 * @param {string} sPath
	 *   a relative or absolute path
	 * @param {object|sap.ui.model.Context} [oContext]
	 *   the context to be used as a starting point in case of a relative path
	 * @returns {any}
	 *   the value of the object or property or <code>null</code> in case a relative path without
	 *   a context is given
	 * @private
	 */
	ODataMetaModel.prototype._getObject = function (sPath, oContext) {
		var i, oNode = oContext, aParts, sResolvedPath = sPath || "";

		if (!oContext || oContext instanceof sap.ui.model.Context){
			sResolvedPath = this.resolve(sPath || "", oContext);
			if (!sResolvedPath) {
				jQuery.sap.log.error("Invalid relative path w/o context", sPath,
					"sap.ui.model.odata.ODataMetaModel");
				return null;
			}
		}

		if (sResolvedPath.charAt(0) === "/") {
			oNode = this.oModel._getObject("/");
			sResolvedPath = sResolvedPath.slice(1);
		}

		if (sResolvedPath) {
			aParts = sResolvedPath.split("/");
			for (i = 0; i < aParts.length; i += 1) {
				if (!oNode) {
					if (jQuery.sap.log.isLoggable(jQuery.sap.log.Level.WARNING)) {
						jQuery.sap.log.warning("Invalid part: " + aParts[i],
							"path: " + sPath + ", context: "
							+ (oContext instanceof sap.ui.model.Context ?
								oContext.getPath() : oContext),
							"sap.ui.model.odata.ODataMetaModel");
					}
					break;
				}
				oNode = oNode[aParts[i]];
			}
		}
		return oNode;
	};

	ODataMetaModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		return new ClientContextBinding(this, sPath, oContext, mParameters);
	};

	ODataMetaModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters,
			mParameters) {
		return new JSONListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
	};

	ODataMetaModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new JSONPropertyBinding(this, sPath, oContext, mParameters);
	};

	ODataMetaModel.prototype.bindTree = function (sPath, oContext, aFilters, mParameters) {
		return new JSONTreeBinding(this, sPath, oContext, aFilters, mParameters);
	};

	ODataMetaModel.prototype.destroy = function () {
		MetaModel.prototype.destroy.apply(this, arguments);
		return this.oModel.destroy.apply(this.oModel, arguments);
	};

	/**
	 * Returns the OData meta model context corresponding to the given OData model path.
	 *
	 * @param {string} [sPath]
	 *   an absolute path pointing to an entity or property, e.g.
	 *   "/ProductSet(1)/ToSupplier/BusinessPartnerID"; this equals the
	 *   <a href="http://www.odata.org/documentation/odata-version-2-0/uri-conventions#ResourcePath">
	 *   resource path</a> component of a URI according to OData v2 URI conventions
	 * @returns {sap.ui.model.Context}
	 *   the context for the corresponding meta data object, i.e. an entity type or its property,
	 *   or <code>null</code> in case no path is given
	 * @throws {Error} in case no context can be determined
	 * @public
	 */
	ODataMetaModel.prototype.getMetaContext = function (sPath) {
		var oAssocationEnd,
			oEntitySet,
			oEntityType,
			sMetaPath,
			sNavigationPropertyName,
			aParts,
			sQualifiedName; // qualified name of current entity type across navigations

		/*
		 * Strips the OData key predicate from a resource path segment.
		 *
		 * @param {string} sSegment
		 * @returns {string}
		 */
		function stripKeyPredicate(sSegment) {
			var iPos = sSegment.indexOf("(");
			return iPos >= 0
				? sSegment.slice(0, iPos)
				: sSegment;
		}

		if (!sPath) {
			return null;
		}

		aParts = sPath.split("/");
		if (aParts[0] !== "") {
			throw new Error("Not an absolute path: " + sPath);
		}
		aParts.shift();

		// from entity set to entity type
		oEntitySet = this.getODataEntitySet(stripKeyPredicate(aParts[0]));
		if (!oEntitySet) {
			throw new Error("Entity set not found: " + aParts[0]);
		}
		aParts.shift();
		sQualifiedName = oEntitySet.entityType;

		// follow (navigation) properties
		while (aParts.length) {
			oEntityType = this.getODataEntityType(sQualifiedName);
			sNavigationPropertyName = stripKeyPredicate(aParts[0]);
			oAssocationEnd = this.getODataAssociationEnd(oEntityType, sNavigationPropertyName);

			if (oAssocationEnd) {
				// navigation property
				sQualifiedName = oAssocationEnd.type;
				if (oAssocationEnd.multiplicity === "1" && sNavigationPropertyName !== aParts[0]) {
					// key predicate not allowed here
					throw new Error("Multiplicity is 1: " + aParts[0]);
				}
				aParts.shift();
			} else {
				// structural property, incl. complex types
				sMetaPath = this.getODataProperty(oEntityType, aParts, true);
				if (aParts.length) {
					throw new Error("Property not found: " + aParts.join("/"));
				}
				break;
			}
		}

		sMetaPath = sMetaPath || this.getODataEntityType(sQualifiedName, true);
		return this.createBindingContext(sMetaPath);
	};

	/**
	 * Returns the OData association end corresponding to the given entity type's navigation
	 * property of given name.
	 *
	 * @param {object} oEntityType
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string} sName
	 *   the name of a navigation property within this entity type
	 * @returns {object}
	 *   the OData association end or <code>null</code> if no such association end is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataAssociationEnd = function (oEntityType, sName) {
		var oNavigationProperty = oEntityType
				? findObject(oEntityType.navigationProperty, sName)
				: null,
			oAssociation = oNavigationProperty
				? getObject(this.oModel, "association", oNavigationProperty.relationship)
				: null,
			oAssociationEnd = oAssociation
				? findObject(oAssociation.end, oNavigationProperty.toRole, "role")
				: null;

		return oAssociationEnd;
	};

	/**
	 * Returns the OData association <b>set</b> end corresponding to the given entity type's
	 * navigation property of given name.
	 *
	 * @param {object} oEntityType
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string} sName
	 *   the name of a navigation property within this entity type
	 * @returns {object}
	 *   the OData association set end or <code>null</code> if no such association set end is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataAssociationSetEnd = function (oEntityType, sName) {
		var oAssociationSet,
			oAssociationSetEnd = null,
			oEntityContainer = this.getODataEntityContainer(),
			oNavigationProperty = oEntityType
				? findObject(oEntityType.navigationProperty, sName)
				: null;

		if (oEntityContainer && oNavigationProperty) {
			oAssociationSet = findObject(oEntityContainer.associationSet,
				oNavigationProperty.relationship, "association");
			oAssociationSetEnd = oAssociationSet
				? findObject(oAssociationSet.end, oNavigationProperty.toRole, "role")
				: null;
		}

		return oAssociationSetEnd;
	};

	/**
	 * Returns the OData complex type with the given qualified name, either as a path or as an
	 * object, as indicated.
	 *
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Address"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the complex type is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the complex type with the given qualified name; <code>undefined</code> (for
	 *   a path) or <code>null</code> (for an object) if no such type is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataComplexType = function (sQualifiedName, bAsPath) {
		return getObject(this.oModel, "complexType", sQualifiedName, bAsPath);
	};

	/**
	 * Returns the OData default entity container.
	 *
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity container is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the default entity container; <code>undefined</code> (for a path) or
	 *   <code>null</code> (for an object) if no such container is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntityContainer = function (bAsPath) {
		var vResult = bAsPath ? undefined : null;

		jQuery.each(this.oModel.getObject("/dataServices/schema") || [], function (i, oSchema) {
			var j = findIndex(oSchema.entityContainer, "true", "isDefaultEntityContainer");

			if (j >= 0) {
				vResult = bAsPath
					? "/dataServices/schema/" + i + "/entityContainer/" + j
					: oSchema.entityContainer[j];
				return false; //break
			}
		});

		return vResult;
	};

	/**
	 * Returns the OData entity set with the given simple name from the default entity container.
	 *
	 * @param {string} sName
	 *   a simple name, e.g. "ProductSet"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity type is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the entity set with the given simple name; <code>undefined</code> (for a
	 *   path) or <code>null</code> (for an object) if no such set is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntitySet = function (sName, bAsPath) {
		var k,
			oEntityContainer = this.getODataEntityContainer(),
			vResult = bAsPath ? undefined : null;

		if (oEntityContainer) {
			k = findIndex(oEntityContainer.entitySet, sName);
			if (k >= 0) {
				vResult = bAsPath
					? oEntityContainer.$path + "/entitySet/" + k
					: oEntityContainer.entitySet[k];
			}
		}

		return vResult;
	};

	/**
	 * Returns the OData entity type with the given qualified name, either as a path or as an
	 * object, as indicated.
	 *
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Product"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the entity type is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the entity type with the given qualified name; <code>undefined</code> (for a
	 *   path) or <code>null</code> (for an object) if no such type is found
	 * @public
	 */
	ODataMetaModel.prototype.getODataEntityType = function (sQualifiedName, bAsPath) {
		return getObject(this.oModel, "entityType", sQualifiedName, bAsPath);
	};

	/**
	 * Returns the given OData type's property of given name. If an array is given instead of a
	 * single name, it is consumed (via <code>Array.prototype.shift</code>) piece by piece until an
	 * element is encountered which cannot be resolved as a property name of the current type; in
	 * this case, the last property found is returned and <code>vName</code> contains only the
	 * remaining names, with <code>vName[0]</code> being the one which was not found.
	 *
	 * @param {object} oType
	 *   a complex type as returned by {@link #getODataComplexType getODataComplexType}, or
	 *   an entity type as returned by {@link #getODataEntityType getODataEntityType}
	 * @param {string|string[]} vName
	 *   the name of a property within this type (e.g. "Address"), or an array of such names (e.g.
	 *   <code>["Address", "Street"]</code>) in order to drill-down into complex types;
	 *   <b>BEWARE</b> that this array is modified by removing each part which is understood!
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the property is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the last OData property found; <code>undefined</code> (for a path) or
	 *   <code>null</code> (for an object) if no property was found at all
	 * @public
	 */
	ODataMetaModel.prototype.getODataProperty = function (oType, vName, bAsPath) {
		var i,
			aParts = jQuery.isArray(vName) ? vName : [vName],
			oProperty = null,
			sPropertyPath;

		while (oType && aParts.length) {
			i = findIndex(oType.property, aParts[0]);
			if (i < 0) {
				break;
			}

			aParts.shift();
			oProperty = oType.property[i];
			sPropertyPath = oType.$path + "/property/" + i;

			if (aParts.length) {
				// go to complex type in order to allow drill-down
				oType = this.getODataComplexType(oProperty.type);
			}
		}

		return bAsPath ? sPropertyPath : oProperty;
	};

	ODataMetaModel.prototype.getProperty = function () {
		return this._getObject.apply(this, arguments);
	};

	ODataMetaModel.prototype.isList = function () {
		return this.oModel.isList.apply(this.oModel, arguments);
	};

	/**
	 * Returns a promise which is fulfilled once the meta model data is loaded and can be used.
	 * It is rejected with a corresponding <code>Error</code> object in case of errors, such as
	 * failure to load meta data or annotations.
	 *
	 * @public
	 * @returns {Promise} a Promise
	 */
	ODataMetaModel.prototype.loaded = function(){
		return this.oLoadedPromise;
	};

	/**
	 * Refresh not supported by OData meta model!
	 *
	 * @throws {Error}
	 * @returns {void}
	 * @public
	 */
	ODataMetaModel.prototype.refresh = function () {
		throw new Error("Unsupported operation: ODataMetaModel#refresh");
	};

	/**
	 * Legacy syntax not supported by OData meta model!
	 *
	 * @param {boolean} bLegacySyntax
	 *   must not be true!
	 * @throws {Error} if <code>bLegacySyntax</code> is true
	 * @returns {void}
	 * @public
	 */
	ODataMetaModel.prototype.setLegacySyntax = function (bLegacySyntax) {
		if (bLegacySyntax) {
			throw new Error("Legacy syntax not supported by ODataMetaModel");
		}
	};

	/**
	 * Changes not supported by OData meta model!
	 *
	 * @throws {Error}
	 * @returns {void}
	 * @private
	 */
	ODataMetaModel.prototype.setProperty = function () {
		// Note: this method is called by JSONPropertyBinding#setValue
		throw new Error("Unsupported operation: ODataMetaModel#setProperty");
	};

	return ODataMetaModel;
}, /* bExport= */ true);
