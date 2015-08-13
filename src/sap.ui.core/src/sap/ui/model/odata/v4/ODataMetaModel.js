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
			aParts,
			sResolvedPath = this.resolve(sPath, oContext),
			that = this;

		/**
		 * Fetches and parses the next part of the path. Modifies aParts
		 * @returns {object}
		 *   an object describing the part with name and key
		 */
		function nextPart() {
			return Helper.parsePathPart(aParts.shift());
		}

		function unsupported(sError) {
			throw new Error(sError + ": " + sPath);
		}

		function unknown(sError) {
			unsupported("Unknown: " + sError);
		}

		function followPath(oObject) {
			var oNextObject;

			while (aParts.length) {
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
		aParts = Helper.splitPath(sResolvedPath);
		oPart = nextPart();
		if (oPart.all !== 'EntityContainer') {
			unknown(oPart.all);
		}

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
		var aParts = Helper.splitPath(sPath),
			aMatches = rEntitySetName.exec(aParts[0]),
			that = this;

		if (!aMatches) {
			throw new Error("Unsupported: " + sPath);
		}
		return Helper.requestEntityContainer(this).then(function (oEntityContainer) {
			var sMetaPath = "/EntityContainer/",
				sName,
				oObject,
				oProperty,
				sProperty;

			oObject = Helper.findInArray(oEntityContainer.EntitySets, "Name", aMatches[1]);
			if (oObject) {
				sName = "EntitySets";
				sProperty = "EntityType";
			} else {
				oObject = Helper.findInArray(oEntityContainer.Singletons, "Name", aMatches[1]);
				if (!oObject) {
					throw new Error("Type " + aMatches[1] + " not found");
				}
				sName = "Singletons";
				sProperty = "Type";
			}
			sMetaPath += sName + "(Fullname='" + encodeURIComponent(oObject.Fullname) + "')" + "/"
				+ sProperty;
			return Helper.requestProperty(that.oModel, oObject, sProperty, sMetaPath)
				.then(function (oType) {
					var i = 1;

					if (!aParts[i]) {
						return sMetaPath;
					}

					for (;;) {
						oProperty = Helper.findInArray(oType.Properties, "Name", aParts[i]);
						if (!oProperty) {
							throw new Error("Unknown property: " + oType.QualifiedName + "/"
								+ aParts[i] + ": " + sPath);
						}
						sMetaPath = sMetaPath + "/Properties(Fullname='"
							+ encodeURIComponent(oProperty.Fullname) + "')";
						i += 1;
						if (!aParts[i]) {
							return sMetaPath;
						}
						sMetaPath = sMetaPath + "/Type";
						oType = oProperty.Type;
					}
				}).then(function (sMetaPath) {
					return that.getContext(sMetaPath);
				});
			});
	};

	return ODataMetaModel;
}, /* bExport= */ true);
