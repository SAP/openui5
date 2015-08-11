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
		return this.oModel.requestObject(this.resolve(sPath, oContext));
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
		var aMatches, aParts,
			that = this;

		aParts = Helper.splitPath(sPath);
		aMatches = rEntitySetName.exec(aParts[0]);
		if (!aMatches) {
			throw new Error("Unsupported: /" + aParts[0]);
		}
		return Helper.requestEntitySet(this.oModel, aMatches[1]).then(function (oEntitySet) {
			var sMetaPath = "/EntityContainer/EntitySets(Fullname='"
					+ encodeURIComponent(oEntitySet.Fullname) + "')/EntityType",
				oProperty;
			if (!aParts[1]) {
				return sMetaPath;
			}
			oProperty = Helper.findInArray(oEntitySet.EntityType.Properties, "Name", aParts[1]);
			if (!oProperty) {
				throw new Error("Unknown property: " + oEntitySet.EntityType.QualifiedName + "/"
					+ aParts[1]);
			}
			return sMetaPath + "/Properties(Fullname='" + encodeURIComponent(oProperty.Fullname)
				+ "')";
		}).then(function (sMetaPath) {
			return that.getContext(sMetaPath);
		});
	};

	return ODataMetaModel;
}, /* bExport= */ true);
