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
	 * @class Model implementation for OData meta models, which are read-only models. No events
	 * ({@link sap.ui.model.Model#event:parseError},
	 * {@link sap.ui.model.Model#event:requestCompleted},
	 * {@link sap.ui.model.Model#event:requestFailed},
	 * {@link sap.ui.model.Model#event:requestSent}) are fired!
	 * For asynchronous loading use {@link #loaded} instead, which is based on promises.
	 *
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
				MetaModel.apply(this); // no arguments to pass!
				this.sDefaultBindingMode = sap.ui.model.BindingMode.OneTime;
				this.mSupportedBindingModes = {"OneTime" : true};
				this.oModel = new JSONModel();
				this.oModel.setDefaultBindingMode(this.sDefaultBindingMode);
				this.oLoadedPromise = load(this.oModel, oMetadata, oAnnotations);
			},

			metadata : {
				publicMethods : ["loaded"]
			}
		});

	/**
	 * Returns a promise which is fulfilled once the meta model data is loaded and can be used.
	 * It is rejected with a corresponding <code>Error</code> object in case of errors, such as
	 * failure to load meta data or annotations.
	 *
	 * @public
	 * @return {Promise} a Promise
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
			jQuery.each(o.extensions || [], function (i, oExtension) {
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
		 * Merge the given annotation data into the given meta data and lift SAPData extensions.
		 * @param {object} oAnnotations
		 *   annotations "JSON"
		 * @param {object} oData
		 *   meta data "JSON"
		 */
		function merge(oAnnotations, oData) {
			jQuery.each(oData.dataServices.schema || [], function (i, oSchema) {
				liftSAPData(oSchema);
				jQuery.each(oSchema.entityType || [], function (j, oEntity) {
					var sEntityName = oSchema.namespace + "." + oEntity.name,
						mPropertyAnnotations = oAnnotations.propertyAnnotations
							&& oAnnotations.propertyAnnotations[sEntityName] || {};

					liftSAPData(oEntity);
					jQuery.extend(oEntity, oAnnotations[sEntityName]);

					jQuery.each(oEntity.property || [], function (k, oProperty) {
						liftSAPData(oProperty);
						jQuery.extend(oProperty, mPropertyAnnotations[oProperty.name]);
					});
				});
			});
		}

		return new Promise(function (fnResolve, fnReject) {
			loaded(oMetadata, function () {
				loaded(oAnnotations, function () {
					try {
						var oData = JSON.parse(JSON.stringify(oMetadata.getServiceMetadata()));
						merge(oAnnotations ? oAnnotations.getAnnotationsData() : {}, oData);
						oModel.setData(oData);
						fnResolve();
					} catch (ex) {
						fnReject(ex);
					}
				}, fnReject);
			}, fnReject);
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

	ODataMetaModel.prototype.getObject = function () {
		return this.oModel.getObject.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.getProperty = function () {
		return this.oModel.getProperty.apply(this.oModel, arguments);
	};

	ODataMetaModel.prototype.isList = function () {
		return this.oModel.isList.apply(this.oModel, arguments);
	};

	/**
	 * Refresh not supported by OData meta model!
	 *
	 * @throws Error
	 * @public
	 */
	ODataMetaModel.prototype.refresh = function () {
		throw new Error("Unsupported operation: ODataMetaModel#refresh");
	};

	/**
	 * Legacy syntax not supported by OData meta model!
	 *
	 * @param {boolean} bLegacySyntax
	 *   must not be true!
	 * @throws Error if <code>bLegacySyntax</code> is true
	 * @public
	 */
	ODataMetaModel.prototype.setLegacySyntax = function (bLegacySyntax) {
		if (bLegacySyntax) {
			throw new Error("Legacy syntax not supported by ODataMetaModel");
		}
	};

	ODataMetaModel.prototype.setSizeLimit = function () {
		return this.oModel.setSizeLimit.apply(this.oModel, arguments);
	};

	return ODataMetaModel;
}, /* bExport= */ true);
