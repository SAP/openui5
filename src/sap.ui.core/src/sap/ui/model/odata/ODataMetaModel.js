/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/ClientContextBinding', 'sap/ui/model/ClientPropertyBinding',
		'sap/ui/model/json/JSONListBinding', 'sap/ui/model/json/JSONModel',
		'sap/ui/model/json/JSONTreeBinding', 'sap/ui/model/MetaModel'],
	function(ClientContextBinding, ClientPropertyBinding, JSONListBinding, JSONModel,
			JSONTreeBinding, MetaModel) {
	"use strict";

	/*global Promise */

	/**
	 * Constructor for a new ODataMetaModel.
	 *
	 * @class Model implementation for OData meta models, which are read-only models. No events
	 * ({@link sap.ui.model.Model#event:parseError},
	 * {@link sap.ui.model.Model#event:requestCompleted},
	 * {@link sap.ui.model.Model#event:requestFailed},
	 * {@link sap.ui.model.Model#event:requestSent}) are fired!
	 * For asynchronous loading use {@link #loaded} instead, which is based on promises.
	 *
	 * @extends sap.ui.model.MetaModel
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @alias sap.ui.model.odata.ODataMetaModel
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
	 *   the OData model's metadata object
	 * @param {sap.ui.model.odata.ODataAnnotations} oAnnotations
	 *   the OData model's annotations object
	 * @public
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.ODataMetaModel",
			/** @lends sap.ui.model.odata.ODataMetaModel.prototype */ {

			constructor : function(oMetadata, oAnnotations) {
				MetaModel.apply(this); // no arguments to pass!
				this.sDefaultBindingMode = sap.ui.model.BindingMode.OneTime;
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
		var oResult = null;

		sPropertyName = sPropertyName || "name";
		jQuery.each(aArray || [], function (i, oObject) {
			if (oObject[sPropertyName] === vExpectedPropertyValue) {
				oResult = oObject;
				return false; // break
			}
		});

		return oResult;
	}

	/*
	 * Returns the thing with the given qualified name from the given model's array (within a
	 * schema) of given name; either as a path or as an object, as indicated.
	 *
	 * @param {sap.ui.model.Model} oModel
	 *   any model
	 * @param {string} sArrayName
	 *  name of array within schema which will be searched
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Foo"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the thing is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the thing with the given qualified name; <code>undefined</code> (for a path)
	 *   or <code>null</code> (for an object) if no such thing is found
	 */
	function getPathOrObject(oModel, sArrayName, sQualifiedName, bAsPath) {
		var vResult = bAsPath ? undefined : null,
			aParts = (sQualifiedName || "").split("."),
			sNamespace = aParts[0],
			sName = aParts[1];

		jQuery.each(oModel.getObject("/dataServices/schema") || [], function (i, oSchema) {
			if (oSchema.namespace === sNamespace) {
				jQuery.each(oSchema[sArrayName] || [], function (j, oThing) {
					if (oThing.name === sName) {
						vResult = bAsPath
							? "/dataServices/schema/" + i + "/" + sArrayName + "/" + j
							: oThing;
						return false; // break
					}
				});
				return false; // break
			}
		});

		return vResult;
	}

	/*
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
		 * @param {object} o
		 *   any object
		 */
		function liftSAPData(o) {
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
		 * Merge the given annotation data into the given meta data and lift SAPData extensions.
		 * @param {object} oAnnotations
		 *   annotations "JSON"
		 * @param {object} oData
		 *   meta data "JSON"
		 */
		function merge(oAnnotations, oData) {
			jQuery.each(oData.dataServices.schema || [], function (i, oSchema) {
				liftSAPData(oSchema);
				jQuery.each(oSchema.entityType || [], function (j, oEntity) {
					var sEntityName = oSchema.namespace + "." + oEntity.name,
						mPropertyAnnotations = oAnnotations.propertyAnnotations
							&& oAnnotations.propertyAnnotations[sEntityName] || {};

					liftSAPData(oEntity);
					jQuery.extend(oEntity, oAnnotations[sEntityName]);

					jQuery.each(oEntity.property || [], function (k, oProperty) {
						liftSAPData(oProperty);
						jQuery.extend(oProperty, mPropertyAnnotations[oProperty.name]);
					});
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

	ODataMetaModel.prototype._getObject = function () {
		return this.oModel._getObject.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.bindContext = function (sPath, oContext, mParameters) {
		return new ClientContextBinding(this, sPath, oContext, mParameters);
	};

	ODataMetaModel.prototype.bindList = function (sPath, oContext, aSorters, aFilters,
			mParameters) {
		return new JSONListBinding(this, sPath, oContext, aSorters, aFilters, mParameters);
	};

	ODataMetaModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		// avoid JSONPropertyBinding#setValue
		return new ClientPropertyBinding(this, sPath, oContext, mParameters);
	};

	ODataMetaModel.prototype.bindTree = function (sPath, oContext, aFilters, mParameters) {
		return new JSONTreeBinding(this, sPath, oContext, aFilters, mParameters);
	};

	ODataMetaModel.prototype.destroy = function () {
		MetaModel.prototype.destroy.apply(this, arguments);
		return this.oModel.destroy.apply(this.oModel, arguments);
	};

	/**
	 * Returns the OData association with the given qualified name, either as a path or as an
	 * object, as indicated.
	 *
	 * @param {string} sQualifiedName
	 *   a qualified name, e.g. "ACME.Assoc_BusinessPartner_Products"
	 * @param {boolean} [bAsPath=false]
	 *   determines whether the association is returned as a path or as an object
	 * @returns {object|string}
	 *   (the path to) the association with the given qualified name; <code>undefined</code> (for a
	 *   path) or <code>null</code> (for an object) if no such association is found
	 * @public
	 * @static
	 */
	ODataMetaModel.prototype.getODataAssociation = function (sQualifiedName, bAsPath) {
		return getPathOrObject(this.oModel, "association", sQualifiedName, bAsPath);
	};

	/**
	 * Returns the given OData association's end with the given role name.
	 *
	 * @param {object} oAssociation
	 *   an association as returned by {@link #getODataAssocation}
	 * @param {string} sRoleName
	 *   a role name within this association
	 * @returns {object}
	 *   the OData association's end or <code>null</code> if no such association end is found
	 * @public
	 * @static
	 */
	ODataMetaModel.prototype.getODataAssociationEnd = function (oAssociation, sRoleName) {
		return oAssociation ? findObject(oAssociation.end, sRoleName, "role") : null;
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
	 * @static
	 */
	ODataMetaModel.prototype.getODataEntityType = function (sQualifiedName, bAsPath) {
		return getPathOrObject(this.oModel, "entityType", sQualifiedName, bAsPath);
	};

	/**
	 * Returns the given OData entity type's navigation property with the given name.
	 *
	 * @param {object} oEntityType
	 *   an entity type as returned by {@link #getODataEntityType}
	 * @param {string} sName
	 *   a local name, e.g. "ToSupplier"
	 * @returns {object}
	 *   the OData entity type's navigation property or <code>null</code> if no such navigation
	 *   property is found
	 * @public
	 * @static
	 */
	ODataMetaModel.prototype.getODataNavigationProperty = function (oEntityType, sName) {
		return oEntityType ? findObject(oEntityType.navigationProperty, sName) : null;
	};

	ODataMetaModel.prototype.getProperty = function () {
		return this.oModel.getProperty.apply(this.oModel, arguments);
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
	 * @return {Promise} a Promise
	 */
	ODataMetaModel.prototype.loaded = function(){
		return this.oLoadedPromise;
	};

	/**
	 * Refresh not supported by OData meta model!
	 *
	 * @throws Error
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
	 * @throws Error if <code>bLegacySyntax</code> is true
	 * @public
	 */
	ODataMetaModel.prototype.setLegacySyntax = function (bLegacySyntax) {
		if (bLegacySyntax) {
			throw new Error("Legacy syntax not supported by ODataMetaModel");
		}
	};

	return ODataMetaModel;
}, /* bExport= */ true);
