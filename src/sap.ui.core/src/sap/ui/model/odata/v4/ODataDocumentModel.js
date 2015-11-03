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

	var ODataDocumentModel;

	/**
	 * Creates a model to access the meta data document.
	 *
	 * @param {string} sDocumentUrl
	 *   the service URL of the metadata document
	 *
	 * @class
	 * Implementation of a virtual interface for the v4 OData meta model which accesses the
	 * meta data document. The class implements exactly those requests that
	 * {@link sap.ui.model.odata.v4.ODataMetaModel ODataMetaModel} requires.
	 */
	ODataDocumentModel = Model.extend("sap.ui.model.odata.v4.ODataDocumentModel", {
		constructor : function (sDocumentUrl) {
			Model.apply(this);
			this.sDocumentUrl = sDocumentUrl;
			this.oDocumentPromise = undefined;
		}
	});

	/**
	 * Requests the entity container from a meta data document. The data is returned in a format
	 * compliant to the following request to a metadata service:
	 * <pre>
	 * /EntityContainer?$expand=EntitySets($expand=EntityType($select=QualifiedName),
	 *                            NavigationPropertyBindings($expand=Target($select=Fullname)))),
	 *                          Singletons($expand=Type($select=QualifiedName),
	 *                            NavigationPropertyBindings($expand=Target($select=Fullname))))
	 * </pre>
	 *
	 * @returns {SyncPromise}
	 *   A promise that will be resolved with the requested data
	 *
	 * @private
	 */
	ODataDocumentModel.prototype.getOrRequestEntityContainer = function () {
		return OlingoDocument.getOrRequestDocument(this).then(function (oDocument) {
			return OlingoDocument.transformEntityContainer(oDocument);
		});
	};

	/**
	 * Requests an entity type from a meta data document. The data is returned in a format
	 * compliant to the following request to a meta data service:
	 * <pre>
	 * /Types('sQualifiedName')?$expand=Properties/Type($levels=max),
	 *                 NavigationProperties($expand=Type($select=QualifiedName))
	 * </pre>
	 *
	 * @param {string} sQualifiedName
	 *   the qualified name of the type
	 * @returns {SyncPromise}
	 *   A promise that will be resolved with the requested data
	 *
	 * @private
	 */
	ODataDocumentModel.prototype.getOrRequestEntityType = function (sQualifiedName) {
		return OlingoDocument.getOrRequestDocument(this).then(function (oDocument) {
			return OlingoDocument.transformEntityType(oDocument, sQualifiedName);
		});
	};

	return ODataDocumentModel;
}, /* bExport= */ true);
