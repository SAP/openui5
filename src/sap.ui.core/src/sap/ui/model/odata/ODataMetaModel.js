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
	 * @class Model implementation for OData meta models
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
	 * or annotations from the given URLs, the Promise is rejected with a respective Error object.
	 * @return {Promise} a Promise
	 * @public
	 */
	ODataMetaModel.prototype.loaded = function(){
		return this.oLoadedPromise;
	};

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
			jQuery.each(o.extensions, function (i, oExtension) {
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
		 * Merge the given annotation data into the given meta data.
		 * @param {object} oAnnotations
		 * @param {object} oData
		 */
		function merge(oAnnotations, oData) {
			jQuery.each(oData.dataServices.schema || [], function (i, oSchema) {
				liftSAPData(oSchema);
				jQuery.each(oSchema.entityType || [], function (j, oEntity) {
					var sEntityName = oSchema.namespace + "." + oEntity.name,
						mPropertyAnnotations = oAnnotations.propertyAnnotations
							&& oAnnotations.propertyAnnotations[sEntityName];

					liftSAPData(oEntity);
					jQuery.extend(oEntity, oAnnotations[sEntityName]);

					if (mPropertyAnnotations) {
						jQuery.each(oEntity.property || [], function (k, oProperty) {
							liftSAPData(oProperty);
							jQuery.extend(oProperty, mPropertyAnnotations[oProperty.name]);
						});
					}
				});
			});
		}

		return new Promise(function (fnResolve, fnReject) {
			loaded(oMetadata, function () {
				loaded(oAnnotations, function () {
					try {
						var oData = JSON.parse(JSON.stringify(oMetadata.getServiceMetadata()));
						if (oAnnotations) {
							merge(oAnnotations.getAnnotationsData(), oData);
						}
						oModel.setData(oData);
						fnResolve();
					} catch (ex) {
						fnReject(ex);
					}
				}, fnReject);
			}, fnReject);
		});
	}

	//TODO how do we get the correct, full list of methods to delegate here? what about pub/sub for events?
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

	//TODO @private in base class sap.ui.model.Model
	ODataMetaModel.prototype.checkUpdate = function () {
		return this.oModel.checkUpdate.apply(this.oModel, arguments);
	};

	//TODO missing JsDoc, does this belong to base class sap.ui.model.MetaModel?
	ODataMetaModel.prototype.getData = function () {
		return this.oModel.getData.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.getProperty = function () {
		return this.oModel.getProperty.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.getObject = function () {
		return this.oModel.getObject.apply(this.oModel, arguments);
	};

	//TODO JsDoc does not appear for base class sap.ui.model.Model
	ODataMetaModel.prototype.isList = function () {
		return this.oModel.isList.apply(this.oModel, arguments);
	};

	return ODataMetaModel;
}, /* bExport= */ true);
