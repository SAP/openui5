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
	 * The class supports exactly those requests that {@link sap.ui.model.odata.v4.ODataMetaModel
	 * ODataMetaModel} requires.
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
	 * <li><code>/EntityContainer</code>: reads the entity container (assuming the query options
	 *   <code>$expand=EntitySets,Singletons</code>)
	 * <li><code>/Types(QualifiedName='<i>EntityTypeName</i>')</code>: reads the given entity type
	 *   (assuming the query options
	 *   <code>$expand=Properties/Type($level=max),NavigationProperties</code>); can only read
	 *   entity types (all other types should be read automatically due to the full expand of the
	 *   property types)
	 * </ul>
	 *
	 * The actual query options are ignored.
	 *
	 * Properties leading to entity types (<code>EntitySets.EntityType</code>),
	 * <code>Singletons.Type</code> and <code>NavigationProperties.Type</code>) are never read,
	 * but supplied with an <code>@odata.navigationLink</code>, so that the
	 * <code>ODataMetaModel</code> can request them easily when needed.
	 *
	 * @param {string} sPath
	 *   An OData request path as described above
	 * @returns {Promise}
	 *   A promise that will be resolved with the requested data
	 *
	 * @protected
	 */
	ODataDocumentModel.prototype.read = function (sPath) {
		var i = sPath.indexOf('?'),
			aSegments;

		function unsupported() {
			throw new Error("Unsupported: " + sPath);
		}

		if (i >= 0) {
			sPath = sPath.substring(0, i);
		}
		aSegments = Helper.splitPath(sPath);
		return OlingoDocument.requestDocument(this).then(function (oDocument) {
			var oPart = Helper.parsePathSegment(aSegments[0]);

			if (aSegments.length !== 1) {
				unsupported();
			}
			switch (oPart.name) {
				case "EntityContainer":
					if (oPart.key) {
						unsupported();
					}
					return OlingoDocument.transformEntityContainer(oDocument);
				case "Types":
					if (!Helper.hasProperties(oPart.key, ["QualifiedName"])) {
						unsupported();
					}
					return OlingoDocument.transformEntityType(oDocument, oPart.key.QualifiedName);
				default:
					unsupported();
			}
		});
	};

	return ODataDocumentModel;
}, /* bExport= */ true);
