/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataModel

/**
 * Model and related classes like bindings for OData v4.
 *
 * @namespace
 * @name sap.ui.model.odata.v4
 * @public
 */

sap.ui.define([
	//FIX4MASTER open source approval for Olingo missing
	"jquery.sap.global",
	"sap/ui/model/Model",
	"./ODataContextBinding",
	"./ODataDocumentModel",
	"./ODataListBinding",
	"./ODataMetaModel",
	"./ODataPropertyBinding",
	"sap/ui/thirdparty/odatajs-4.0.0"
], function(jQuery, Model, ODataContextBinding, ODataDocumentModel, ODataListBinding,
		ODataMetaModel, ODataPropertyBinding, Olingo) {
	"use strict";

	/*global odatajs */

	var rListBindingPath = /^\/.+\[(\d+)\];list=(\d+)\/(.+)/;

	/**
	 * Throws an error for a not yet implemented method with the given name called by the SAPUI5
	 * framework. The error message includes the arguments to the method call.
	 * @param {string} sMethodName - the method name
	 * @param {object} args - the arguments passed to this method when called by SAPUI5
	 */
	function notImplemented(sMethodName, args) {
		var sArgs;

		try {
			sArgs = JSON.stringify(args);
		} catch (e) {
			sArgs = "JSON.stringify error for arguments "  + String(args);
		}
		throw new Error("Not implemented method v4.ODataModel." + sMethodName
			+ " called with arguments " + sArgs);
	}

	/**
	 * Constructor for a new ODataModel.
	 *
	 * @param {string} [sServiceUrl]
	 *   base URL of the service to request data from; it is required, but may also be given via
	 *   <code>mParameters.serviceUrl</code>
	 * @param {object} [mParameters]
	 *   the parameters
	 * @param {boolean} [mParameters.automaticTypeDetermination=false]
	 *   If this parameter is set, all property bindings request a type from the meta model
	 *   unless given otherwise
	 * @param {string} [mParameters.serviceUrl]
	 *   base URL of the service to request data from; only used if the parameter
	 *   <code>sServiceUrl</code> has not been given
	 *
	 * @class Model implementation for OData v4.
	 *
	 * @author SAP SE
	 * @alias sap.ui.model.odata.v4.ODataModel
	 * @extends sap.ui.model.Model
	 * @public
	 * @since 1.31.0
	 * @version ${version}
	 */
	var ODataModel = Model.extend("sap.ui.model.odata.v4.ODataModel",
			/** @lends sap.ui.model.odata.v4.ODataModel.prototype */
			{
				constructor : function (sServiceUrl, mParameters) {
					// do not pass any parameters to Model
					Model.apply(this);
					if (typeof sServiceUrl === "object") {
						mParameters = sServiceUrl;
						sServiceUrl = mParameters.serviceUrl;
					}
					if (!sServiceUrl) {
						throw new Error("Missing service URL");
					}
					if (sServiceUrl.charAt(sServiceUrl.length - 1) !== "/") {
						throw new Error("Service URL must end with '/'");
					}
					this.sServiceUrl = sServiceUrl.slice(0, -1);
					this.mParameters = mParameters;
					this.oMetaModel = new ODataMetaModel(
						new ODataDocumentModel(this.sServiceUrl + "/$metadata"));
				}
			});

	/**
	 * Creates a new context binding for the given path. This binding is inactive and will not know
	 * the bound context initially. You have to call {@link sap.ui.model.Binding#initialize
	 * initialize()} to get it updated asynchronously and register a change listener at the binding
	 * to be informed when the bound context is available.
	 *
	 * @param {string} sPath
	 *   the binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding}
	 *   the context binding
	 * @public
	 */
	ODataModel.prototype.bindContext = function (sPath, oContext) {
		return new ODataContextBinding(this, sPath, oContext);
	};

	/**
	 * Creates a new list binding for the given path and optional context which must
	 * resolve to an absolute OData path for an entity set.
	 *
	 * @param {string} sPath
	 *   the binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 * @return {sap.ui.model.odata.v4.ODataListBinding}
	 *   the list binding
	 * @public
	 */
	ODataModel.prototype.bindList = function (sPath, oContext) {
		var oListBinding;

		this.aLists = this.aLists || [];
		oListBinding = new ODataListBinding(this, sPath, oContext, this.aLists.length);
		this.aLists.push(oListBinding);
		return oListBinding;
	};

	/**
	 * Creates a new property binding for the given path. This binding is inactive and will not
	 * know the property value initially. You have to call {@link sap.ui.model.Binding#initialize
	 * initialize()} to get it updated asynchronously and register a change listener at the binding
	 * to be informed when the value is available.
	 *
	 * @param {string} sPath
	 *   the binding path in the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   the context which is required as base for a relative path
	 * @returns {sap.ui.model.odata.v4.ODataPropertyBinding}
	 *   the property binding
	 * @public
	 */
	ODataModel.prototype.bindProperty = function (sPath, oContext) {
		var that = this;

		return new ODataPropertyBinding(this, sPath, oContext, {
			automaticTypeDetermination:
				that.mParameters && that.mParameters.automaticTypeDetermination
		});
	};

	ODataModel.prototype.bindTree = function () {
		notImplemented("bindTree", arguments);
	};

	ODataModel.prototype.createBindingContext = function () {
		notImplemented("createBindingContext", arguments);
	};

	ODataModel.prototype.destroyBindingContext = function () {
		notImplemented("destroyBindingContext", arguments);
	};

	/**
	 * Returns the meta model for this ODataModel
	 *
	 * @returns {sap.ui.model.odata.v4.ODataMetaModel}
	 *   The meta model for this ODataModel
	 * @public
	 */
	ODataModel.prototype.getMetaModel = function () {
		return this.oMetaModel;
	};

	ODataModel.prototype.getProperty = function () {
		notImplemented("getProperty", arguments);
	};

	/**
	 * Triggers a GET request to this model's OData service. The data will be stored in the model.
	 *
	 * @param {string} sPath
	 *   A relative path to the data which should be retrieved
	 * @returns {Promise}
	 *   A promise to be resolved when the OData request is finished
	 *
	 * @protected
	 */
	ODataModel.prototype.read = function (sPath) {
		var that = this;

		return new Promise(function (fnResolve, fnReject) {
			var aMatches = rListBindingPath.exec(sPath), // /TEAMS[2];list=0/Name
				sRequestUri;

			if (aMatches) { // use list binding to retrieve the value
				that.aLists[Number(aMatches[2])].readValue(Number(aMatches[1]), aMatches[3]).then(
					function (oValue) {
						fnResolve({value : oValue});
					},
					function (oError) {
						fnReject(oError);
					});
				return;
			}

			sRequestUri = that.sServiceUrl + sPath;
			odatajs.oData.read({
				requestUri: sRequestUri,
				headers: {
					"accept-language": sap.ui.getCore().getConfiguration().getLanguage()
				}
			}, function (oData) {
				fnResolve(oData);
			}, function (oError) {
				var oParsedError = JSON.parse(oError.response.body).error;
				jQuery.sap.log.error(oParsedError.message, "read(" + sRequestUri + ")",
					"sap.ui.model.odata.v4.ODataModel");
				oError = new Error(oParsedError.message);
				oError.error = oParsedError;
				fnReject(oError);
			});
		});
	};

	/**
	 * Requests the object for the given path relative to the given context.
	 *
	 * If the path does not contain a <code>/#</code>, path and context are used to get the object
	 * from the data model.
	 * If the path contains <code>/#</code>, it will be split into a data model path and a meta
	 * model path.
	 * For example:
	 * /path/in/data/model/#path/in/metadata/model
	 * For the given context and data model path, the corresponding meta model context is
	 * determined. This context is used to retrieve the meta model object following the meta model
	 * path.
	 *
	 * Returns a <code>Promise</code>, which is resolved with the requested object or rejected with
	 * an error.
	 *
	 * @param {string} sPath
	 *   A relative or absolute path within the model
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context in the data model to be used as a starting point in case of a relative path
	 * @returns {Promise}
	 *   A promise which is resolved with the requested object as soon as it is available
	 * @public
	 */
	ODataModel.prototype.requestObject = function (sPath, oContext) {
		var iMeta = sPath.indexOf('/#'),
			sMetaModelPath,
			sModelPath,
			that = this;

		if (iMeta >= 0) {
			sModelPath = this.resolve(sPath.substring(0, iMeta), oContext);
			sMetaModelPath = sPath.substring(iMeta + 2);
			return this.getMetaModel().requestMetaContext(sModelPath)
				.then(function (oMetaContext) {
					return that.getMetaModel().requestObject(sMetaModelPath, oMetaContext);
				});
		}
		notImplemented("requestObject", arguments);
	};

	return ODataModel;

}, /* bExport= */ true);
