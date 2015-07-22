/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataDocumentModel
sap.ui.define([
	//FIX4MASTER open source approval for Olingo missing
	"jquery.sap.global",
	"sap/ui/model/Model",
	"./_ODataHelper",
	"./_OlingoDocument"
], function (jQuery, Model, Helper, OlingoDocument) {
	"use strict";

	/**
	 * Creates a "pseudo" v4 OData model which accesses the metadata document instead.
	 *
	 * @param {string} sDocumentUrl
	 *   the service URL of the metadata document
	 *
	 * @class
	 * Implementation of a "pseudo" v4 OData model which accesses the metadata document instead.
	 */
	var ODataDocumentModel = Model.extend("sap.ui.model.odata.v4.ODataDocumentModel", {
		constructor : function (sDocumentUrl) {
			Model.apply(this);
			this.sDocumentUrl = sDocumentUrl;
			this.oDocumentPromise = undefined;
		}
	});

	/**
	 * Triggers a GET request for the meta data document. The data is read from the returned
	 * document and transformed to the Edmx format.
	 *
	 * Supports the following requests:
	 * <ul>
	 * <li><code>/EntityContainer</code>: reads the entity container without any expands
	 * <li><code>/EntityContainer/EntitySets(Fullname='<i>FullEntitySetName</i>')</code>: reads the
	 * entity set with the type, its properties and its navigation properties expanded.
	 * </ul>
	 *
	 * Get parameters are ignored.
	 *
	 * @param {string} sPath
	 *   An OData request path as described above
	 * @returns {Promise}
	 *   A promise to be resolved when the OData request is finished
	 *
	 * @protected
	 */
	ODataDocumentModel.prototype.read = function (sPath) {
		var i = sPath.indexOf('?');

		if (i >= 0) {
			sPath = sPath.slice(0, i);
		}
		return this.requestObject(sPath);
	};

	/**
	 * Requests the object for the given path relative to the given context. Returns a
	 * <code>Promise</code>, which is resolved with the requested object or rejected with an error.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context in the data model to be used as a starting point in case of a relative path
	 * @returns {Promise}
	 *   A promise which is resolved with the requested object as soon as it is available
	 */
	ODataDocumentModel.prototype.requestObject = function (sPath, oContext) {
		var sPart,
			aParts,
			sResolvedPath = this.resolve(sPath, oContext);

		function unsupported(sError) {
			throw new Error(sError + ": " + sPath);
		}

		function unknown(sError) {
			unsupported('"' + sError + '" unknown');
		}

		if (!sResolvedPath) {
			unsupported("Not an absolute path");
		}
		aParts = Helper.splitPath(sResolvedPath);
		sPart = aParts.shift();
		if (sPart !== 'EntityContainer') {
			unknown(sPart);
		}
		return OlingoDocument.requestDocument(this).then(function (oDocument) {
			var oObject,
				oPart;

			oPart = Helper.parsePathPart(aParts.shift());
			if (!oPart) {
				return OlingoDocument.transformEntityContainer(oDocument);
			}
			if (oPart.name !== "EntitySets") {
				unknown(oPart.name);
			}
			if (!oPart.key) {
				unsupported("Missing key");
			}
			if (!oPart.key.Fullname) {
				unknown(oPart.all);
			}
			oObject = OlingoDocument.transformEntitySet(oDocument, oPart.key.Fullname);
			for (;;) {
				oPart = Helper.parsePathPart(aParts.shift());
				if (!oPart) {
					return oObject;
				}
				if (oPart.name in oObject) {
					oObject = oObject[oPart.name];
					if (oPart.key) {
						if (Array.isArray(oObject)) {
							oObject = Helper.findKeyInArray(oObject, oPart.key);
						} else {
							unsupported('"' + oPart.name + '" is not an array');
						}
					}
				} else {
					unknown(oPart.all);
				}
			}
		});
	};

	return ODataDocumentModel;
}, /* bExport= */ true);
