/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/model/json/JSONModel', 'sap/ui/model/MetaModel'],
	function(JSONModel, MetaModel) {
	"use strict";

	/*global Promise */

	/**
	 * Constructor for a new ODataMetaModel.
	 *
	 * @class Model implementation for meta models
	 * @abstract
	 * @extends sap.ui.model.MetaModel
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.model.odata.v2.ODataMetaModel
	 * @param {string} sMetadataUrl
	 *   The URL for the OData service metadata
	 * @param {string|string[]} vAnnotationUrl
	 *   URL or array of URLs to load the annotations of the OData service
	 */
	var ODataMetaModel = MetaModel.extend("sap.ui.model.odata.v2.ODataMetaModel",
			/** @lends sap.ui.model.odata.v2.ODataMetaModel.prototype */ {
			/**
			 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
			 * @param {sap.ui.model.odata.ODataAnnotations} oAnnotations
			 */
			constructor : function(oMetadata, oAnnotations) {
				this.oModel = new JSONModel();
				this.oLoadedPromise = load(this.oModel, oMetadata, oAnnotations);
				MetaModel.apply(this, arguments);
			},

			metadata : {
				publicMethods : ["loaded"]
			}
		});

	/**
	 * Returns a Promise which is fulfilled once the meta model data is loaded and can be accessed
	 * via {@link #getData} or similar methods. In error cases like issues on loading the metadata
	 * or annotations from the URLs given the Promise is rejected with the respective Error object.
	 * @public
	 * @return {Promise} the Promise
	 */
	ODataMetaModel.prototype.loaded = function(){
		return this.oLoadedPromise;
	};

	/**
	 * @param {sap.ui.model.json.JSONModel} oModel
	 * @param {sap.ui.model.odata.ODataMetadata} oMetadata
	 * @param {sap.ui.model.odata.ODataAnnotations} oAnnotations
	 * @returns {Promise}
	 */
	function load(oModel, oMetadata, oAnnotations) {
		/*
		 * Calls the given handler as soon as the given object is "loaded".
		 *
		 * @param {object} o
		 * @param {function(void)} fnLoaded
		 */
		function loaded(o, fnLoaded) {
			if (!o || o.isLoaded()) {
				fnLoaded();
			} else {
				o.attachLoaded(fnLoaded);
			}
		}

		/*
		 * Merge the given annotation data into the given meta data.
		 * @param {object} oAnnotations
		 * @param {object} oData
		 */
		function merge(oAnnotations, oData) {
			jQuery.each(oData.dataServices.schema, function (i, oSchema) {
				jQuery.each(oSchema.entityType, function (j, oEntity) {
					var sEntityName = oSchema.namespace + "." + oEntity.name,
						mPropertyAnnotations = oAnnotations.propertyAnnotations[sEntityName];

					jQuery.extend(oEntity, oAnnotations[sEntityName]);

					if (mPropertyAnnotations) {
						jQuery.each(oEntity.property, function (k, oProperty) {
							//TODO needed? useful? beware of array with additional properties!
//							jQuery.extend(oProperty.extensions, // an array!
//								oAnnotations.propertyExtensions[sEntityName][oProperty.name]);
							jQuery.extend(oProperty, mPropertyAnnotations[oProperty.name]);
						});
					}
				});
			});
		}

		return new Promise(function (fnResolve, fnReject) {
			loaded(oMetadata, function () {
				loaded(oAnnotations, function () {
					var oData = JSON.parse(JSON.stringify(oMetadata.getServiceMetadata()));
					if (oAnnotations) {
						merge(oAnnotations.getAnnotationsData(), oData);
					}
					oModel.setData(oData);
					fnResolve();
				});
			});
		});
	}

	ODataMetaModel.prototype.bindContext = function () {
		return this.oModel.bindContext.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.bindList = function () {
		return this.oModel.bindList.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.bindProperty = function () {
		return this.oModel.bindProperty.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.bindTree = function () {
		return this.oModel.bindTree.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.checkUpdate = function () {
		return this.oModel.checkUpdate.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.getData = function () {
		return this.oModel.getData.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.getProperty = function () {
		return this.oModel.getProperty.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.getObject = function () {
		return this.oModel.getObject.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.isList = function () {
		return this.oModel.isList.apply(this.oModel, arguments);
	};

	return ODataMetaModel;
}, /* bExport= */ true);
