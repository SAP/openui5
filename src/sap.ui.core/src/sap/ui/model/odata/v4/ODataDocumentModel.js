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
	 * <li><code>/EntityContainer</code>: reads the entity container with Singletons and EntitySets
	 * expanded
	 * <li><code>/EntityContainer/EntitySets(Fullname='<i>FullEntitySetName</i>')/EntityType</code>:
	 * reads the entity type fo the entity set with its properties, the property type and its
	 * navigation properties expanded.
	 * <li><code>/EntityContainer/Singletons(Fullname='<i>FullEntitySetName</i>')/EntityType</code>:
	 * reads the entity type fo the singleton with its properties, the property type and its
	 * navigation properties expanded.
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
		var i = sPath.indexOf('?'),
			aParts;

		function unsupported() {
			throw new Error("Unsupported: " + sPath);
		}

		if (i >= 0) {
			sPath = sPath.substring(0, i);
		}
		aParts = Helper.splitPath(sPath);
		return OlingoDocument.requestDocument(this).then(function (oDocument) {
			var oPart,
				sProperty,
				oType,
				sType;

			if (aParts.shift() !== "EntityContainer") {
				unsupported();
			}
			if (!aParts.length) {
				return OlingoDocument.transformEntityContainer(oDocument);
			}
			oPart = Helper.parsePathPart(aParts.shift());
			if (!oPart.key || !oPart.key.Fullname) {
				unsupported();
			}
			switch (oPart.name) {
				case "EntitySets":
					sType = OlingoDocument.findEntitySet(oDocument, oPart.key.Fullname).entityType;
					sProperty = "EntityType";
					break;
				case "Singletons":
					sType = OlingoDocument.findSingleton(oDocument, oPart.key.Fullname).type;
					sProperty = "Type";
					break;
				default:
					unsupported();
			}
			if (aParts.shift() !== sProperty) {
				unsupported();
			}
			oType = OlingoDocument.transformEntityType(oDocument, sType);
			if (aParts.length) {
				unsupported();
			}
			return oType;
		});
	};

	return ODataDocumentModel;
}, /* bExport= */ true);
