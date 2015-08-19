/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataMetaModel
sap.ui.define([
	'sap/ui/model/MetaModel',
	'sap/ui/model/odata/v4/_ODataHelper'
], function (MetaModel, Helper) {
	"use strict";

	var rEntitySetName = /^(\w+)(\[|\(|$)/; // identifier followed by [,( or at end of string

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
			}
		});

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
					return Helper.requestProperty(that.oModel, oObject, oPart.name, sResolvedPath)
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
				if (!aSegments[i]) {
					return sMetaPath;
				}
				sMetaPath = sMetaPath + "/Type";
				if (!("Type" in oProperty)) {
					return Helper.requestProperty(that.oModel, oProperty, "Type", sMetaPath)
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
			return Helper.requestProperty(that.oModel, oResult.object, sProperty, sMetaPath)
				.then(followPath);
		}).then(function (sMetaPath) {
			return that.getContext(sMetaPath);
		});
	};

	return ODataMetaModel;
}, /* bExport= */ true);
