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
	"jquery.sap.global", "sap/ui/model/Model", "./ODataContextBinding", "./ODataListBinding",
	"./ODataPropertyBinding", "sap/ui/thirdparty/odatajs-4.0.0"
], function(jQuery, Model, ODataContextBinding, ODataListBinding, ODataPropertyBinding, Olingo) {
	"use strict";

	/*global odatajs */

	var ODataModel,
		rListBindingPath = /^\/.+\[(\d+)\];list=(\d+)\/(.+)/,
		rTrailingSlash = /\/?$/;

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
	 * @param {string} sServiceUrl
	 *   base URL of the service to request data from
	 *
	 * @class Model implementation for OData v4.
	 *
	 * @author SAP SE
	 * @extends sap.ui.model.Model
	 * @alias sap.ui.model.odata.v4.ODataModel
	 * @public
	 * @since 1.31.0
	 * @version ${version}
	 */
	ODataModel = Model.extend("sap.ui.model.odata.v4.ODataModel",
			/** @lends sap.ui.model.odata.v4.ODataModel.prototype */
			{
				constructor : function (sServiceUrl) {
					// do not pass any parameters to Model
					Model.apply(this);
					if (!sServiceUrl) {
						throw new Error("Missing service URL");
					}
					this.sServiceUrl = sServiceUrl.replace(rTrailingSlash, "");
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
		return new ODataPropertyBinding(this, sPath, oContext);
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
			var oListCache,
				aMatches = rListBindingPath.exec(sPath), // /TEAMS[2];list=0/Name
				sRequestUri;

			if (aMatches) { // path resolves to cache of a list binding
				oListCache = that.aLists[Number(aMatches[2])].oCache;
				oListCache.readRange(Number(aMatches[1]), 1).then(function (oData) {
					fnResolve({value: oData.value[0][aMatches[3]]});
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

	return ODataModel;

}, /* bExport= */ true);
