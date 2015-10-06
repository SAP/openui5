/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataMetaModel
sap.ui.define([
	'sap/ui/model/MetaModel',
	"sap/ui/model/odata/ODataUtils",
	'sap/ui/model/odata/v4/_ODataHelper'
], function (MetaModel, ODataUtils, Helper) {
	"use strict";

	var rEntitySetName = /^(\w+)(\[|\(|$)/, // identifier followed by [,( or at end of string
		rNumber = /^\d+$/;

	/**
	 * Do <strong>NOT</strong> call this private constructor for a new <code>ODataMetaModel</code>,
	 * but rather use {@link sap.ui.model.odata.v4.ODataModel#getMetaModel getMetaModel} instead.
	 *
	 * @class Implementation of an OData meta model which offers access to OData v4 meta data.
	 *
	 * This model is read-only.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataMetaModel
	 * @extends sap.ui.model.MetaModel
	 * @public
	 * @since 1.31.0
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.v4.ODataMetaModel", {
			constructor : function (oModel) {
				MetaModel.call(this);
				if (!oModel) {
					throw new Error("Missing metadata model");
				}
				this.oModel = oModel;
				// @see sap.ui.model.odata.v4._ODataHelper.requestEntityContainer
				this._oEntityContainerPromise = null;
			}
		});

	/**
	 * Returns a promise for the "4.3.1 Canonical URL" corresponding to the given service root URL
	 * and absolute data binding path which must point to an entity.
	 *
	 * @param {string} sServiceUrl
	 *   root URL of the service
	 * @param {string} sPath
	 *   an absolute data binding path pointing to an entity, e.g.
	 *   "/TEAMS[0];list=0/TEAM_2_EMPLOYEES/0"
	 * @param {function} fnRead
	 *   function like {@link sap.ui.model.odata.v4.ODataModel#read} which provides access to data
	 * @returns {Promise}
	 *   a promise which is resolved with the canonical URL (e.g.
	 *   "/<service root URL>/EMPLOYEES(ID='1')") in case of success, or rejected with an instance
	 *   of <code>Error</code> in case of failure
	 * @private
	 */
	ODataMetaModel.prototype.requestCanonicalUrl = function (sServiceUrl, sPath, fnRead) {
		var that = this;

		return fnRead(sPath, true).then(function (oEntityInstance) {
			return that.requestMetaContext(sPath).then(function (oContext) {
				// e.g. "/EntitySets(Name='foo')"
				// or   "/EntitySets(Name='foo')/EntityType/NavigationProperties(Name='bar')"
				var iLastSlash = oContext.getPath().lastIndexOf("/"),
					sTypePath = iLastSlash > 0 ? "Type" : "EntityType";

				return Promise.all([
					that.requestObject(sTypePath, oContext), // --> oEntityType
					Helper.requestEntitySetName(oContext) // --> sEntitySetName
				]).then(function (aValues) {
					var oEntityType = aValues[0],
						sEntitySetName = aValues[1];

					return sServiceUrl + encodeURIComponent(sEntitySetName)
						+ Helper.getKeyPredicate(oEntityType, oEntityInstance);
				});
			});
		});
	};

	/**
	 * Requests the meta data object for the given path relative to the given context.
	 *
	 * Returns a <code>Promise</code> which is resolved with the requested meta model object or
	 * rejected with an error.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the meta model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context to be used as a starting point in case of a relative path
	 * @returns {Promise}
	 *   A promise which is resolved with the requested meta model object as soon as it is
	 *   available
	 */
	ODataMetaModel.prototype.requestObject = function (sPath, oContext) {
		var oPart,
			aSegments,
			sResolvedPath = this.resolve(sPath, oContext),
			that = this;

		/**
		 * Fetches and parses the next part of the path. Modifies aSegments
		 * @returns {object}
		 *   an object describing the part with name and key
		 */
		function nextPart() {
			return Helper.parsePathSegment(aSegments.shift());
		}

		function unsupported(sError) {
			throw new Error(sError + ": " + sPath);
		}

		function unknown(sError) {
			unsupported("Unknown: " + sError);
		}

		function followPath(oObject) {
			var oNextObject;

			while (aSegments.length) {
				oPart = nextPart();
				if (!(oPart.name in oObject)) {
					return Helper.requestProperty(that, oObject, oPart.name, sResolvedPath)
						.then(followPath);
				}
				oNextObject = oObject[oPart.name];
				if (oPart.key) {
					if (!Array.isArray(oNextObject)) {
						unsupported('"' + oPart.name + '" is not an array');
					}
					oObject = Helper.findKeyInArray(oNextObject, oPart.key);
					if (!oObject) {
						unknown(oPart.all);
					}
				} else {
					oObject = oNextObject;
				}
			}
			return oObject;
		}

		if (!sResolvedPath) {
			unsupported("Not an absolute path");
		}
		aSegments = Helper.splitPath(sResolvedPath);
		return Helper.requestEntityContainer(this).then(followPath);
	};

	/**
	 * Requests the OData meta model context corresponding to the given OData model path.
	 *
	 * Returns a <code>Promise</code> which is resolved with the requested OData meta data context
	 * or rejected with an error.
	 *
	 * @param {string} sPath
	 *   An absolute path within the OData data model for which the OData meta data context is
	 *   requested
	 * @returns {Promise}
	 *   A promise that gets resolved with the corresponding meta data context
	 *   (<code>sap.ui.model.Context</code>) within the meta model, as soon as all required meta
	 *   data to calculate this context is available; if no context can be determined, the promise
	 *   is rejected with the corresponding error
	 * @public
	 */
	ODataMetaModel.prototype.requestMetaContext = function (sPath) {
		var i = 1,
			sMetaPath = "",
			aSegments = Helper.splitPath(sPath),
			aMatches,
			that = this;

		function findChild(oObject, aProperties, sName) {
			var oChild,
				i,
				sProperty;

			for (i = 0; i < aProperties.length; i += 1) {
				sProperty = aProperties[i];
				if (sProperty in oObject) {
					oChild = Helper.findInArray(oObject[sProperty], "Name", sName);
					if (oChild) {
						sMetaPath += "/" + sProperty + "(Name='"
							+ encodeURIComponent(oChild.Name) + "')";
						return {object: oChild, property: sProperty};
					}
				}
			}
			return undefined;
		}

		/**
		 * Follows the path from the given type corresponding to position <code>i - 1</code> in
		 * <code>aSegments</code> until the path is exhausted.
		 * @param {object} oType
		 *   the type
		 * @returns {string}
		 *   the meta path
		 */
		function followPath(oType) {
			var oProperty,
				oResult;

			if (!aSegments[i]) {
				return sMetaPath;
			}

			for (;;) {
				oResult = findChild(oType, ["Properties", "NavigationProperties"], aSegments[i]);
				if (!oResult) {
					throw new Error("Unknown property: " + oType.QualifiedName + "/"
						+ aSegments[i] + ": " + sPath);
				}
				oProperty = oResult.object;
				i += 1;
				if (rNumber.test(aSegments[i])) {
					// skip index in data path e.g. .../TEAM_2_EMPLOYEES/2/Name
					i += 1;
				}

				if (!aSegments[i]) {
					return sMetaPath;
				}
				sMetaPath = sMetaPath + "/Type";
				if (!("Type" in oProperty)) {
					return Helper.requestProperty(that, oProperty, "Type", sMetaPath)
						.then(followPath);
				}
				oType = oProperty.Type;
			}
		}

		if (aSegments.length === 0) {
			throw new Error("Unsupported: " + sPath);
		}
		aMatches = rEntitySetName.exec(aSegments[0]);
		if (!aMatches) {
			throw new Error("Unsupported: " + sPath);
		}
		return Helper.requestEntityContainer(this).then(function (oEntityContainer) {
			var sProperty,
				oResult;

			oResult = findChild(oEntityContainer, ["EntitySets", "Singletons"], aMatches[1]);
			if (!oResult) {
				throw new Error("Type " + aMatches[1] + " not found");
			}
			if (!aSegments[i]) {
				return sMetaPath;
			}
			sProperty = oResult.property === "EntitySets" ? "EntityType" : "Type";
			sMetaPath += "/" + sProperty;
			return Helper.requestProperty(that, oResult.object, sProperty, sMetaPath)
				.then(followPath);
		}).then(function (sMetaPath) {
			return that.getContext(sMetaPath);
		});
	};

	var mUi5TypeForEdmType = {
			"Edm.Boolean" : {type : "sap.ui.model.odata.type.Boolean"},
			"Edm.Byte" : {type : "sap.ui.model.odata.type.Byte"},
			"Edm.Date" : {type: "sap.ui.model.odata.type.Date"},
//			"Edm.DateTimeOffset" : {type : "sap.ui.model.odata.type.DateTimeOffset"},
			"Edm.Decimal" : {
				type : "sap.ui.model.odata.type.Decimal",
				facets : {"Precision": "precision", "Scale" : "scale"}
			},
			"Edm.Double" : {type: "sap.ui.model.odata.type.Double"},
			"Edm.Guid" : {type: "sap.ui.model.odata.type.Guid"},
			"Edm.Int16" : {type: "sap.ui.model.odata.type.Int16"},
			"Edm.Int32" : {type: "sap.ui.model.odata.type.Int32"},
			"Edm.Int64" : {type: "sap.ui.model.odata.type.Int64"},
			"Edm.SByte" : {type: "sap.ui.model.odata.type.SByte"},
			"Edm.Single" : {type: "sap.ui.model.odata.type.Single"},
			"Edm.String" : {
				type : "sap.ui.model.odata.type.String",
				facets : {"MaxLength" : "maxLength"}
			}
		};

	/**
	 * Requests the UI5 type for the given property path that formats and parses corresponding to
	 * the property's EDM type and facets. The property's type must be a primitive type.
	 *
	 * @param {string} sPath
	 *   An absolute path to an OData property within the OData data model
	 * @returns {Promise}
	 *   A promise that gets resolved with the corresponding UI5 type from
	 *   <code>sap.ui.model.odata.type</code>; if no type can be determined, the promise is
	 *   rejected with the corresponding error
	 * @public
	 */
	ODataMetaModel.prototype.requestUI5Type = function (sPath) {
		var that = this;

		return this.requestMetaContext(sPath).then(function (oMetaContext) {
			return that.requestObject("", oMetaContext);
		}).then(function (oProperty) {
			var oConstraints,
				oFacet,
				i,
				oUi5Type;

			function setConstraint(sKey, vValue) {
				oConstraints = oConstraints || {};
				oConstraints[sKey] = vValue;
			}

			if (!("Type" in oProperty) || !("Facets" in oProperty) || !("Nullable" in oProperty)) {
				throw new Error("No property found at " + sPath);
			}
			oUi5Type = mUi5TypeForEdmType[oProperty.Type.QualifiedName];
			if (!oUi5Type) {
				throw new Error("Unsupported EDM type: " + oProperty.Type.QualifiedName + ": "
					+ sPath);
			}
			for (i = 0; i < oProperty.Facets.length; i++) {
				oFacet = oProperty.Facets[i];
				if (oUi5Type.facets && oFacet.Name in oUi5Type.facets) {
					setConstraint(oUi5Type.facets[oFacet.Name], oFacet.Value);
				}
			}
			if (!oProperty.Nullable) {
				setConstraint("nullable", false);
			}
			return new (jQuery.sap.getObject(oUi5Type.type, 0))({}, oConstraints);
		});
	};

	return ODataMetaModel;
}, /* bExport= */ true);
