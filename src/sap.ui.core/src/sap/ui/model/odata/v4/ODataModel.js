/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataModel
sap.ui.define([
	//FIX4MASTER open source approval for Olingo missing
	"jquery.sap.global", "sap/ui/model/Model", "./ODataContextBinding", "./ODataPropertyBinding", "sap/ui/thirdparty/odatajs-4.0.0"
], function(jQuery, Model, ODataContextBinding, ODataPropertyBinding, Olingo) {
	"use strict";

	/*global odatajs */

	var OData = odatajs.oData;

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
	 * @class Model implementation for OData V4.
	 *
	 * @author SAP SE
	 * @extends sap.ui.model.Model
	 * @alias sap.ui.model.odata.v4.ODataModel
	 * @public
	 * @since 1.29.0 //TODO
	 * @version ${version}
	 */
	var ODataModel = Model.extend("sap.ui.model.odata.v4.ODataModel", /** @lends sap.ui.model.odata.v4.ODataModel.prototype */ {
			constructor : function(sServiceUrl) {
				Model.apply(this/*, arguments*/);
				if (!sServiceUrl) {
					throw new Error("Missing service URL");
				}
				this.sServiceUrl = sServiceUrl;
				//TODO set this.sDefaultBindingMode, this.mSupportedBindingModes
			},
			metadata : {
				publicMethods : []
			}
		});

	/**
	 * TODO does what???
	 *
	 * @see sap.ui.model.Model.prototype.bindContext
	 * @param {string} sPath
	 *   the resolved path
	 * @param {object} oContext
	 *   the ??? context object
	 * @returns {object} oBinding
	 *   contextBinding object
	 * @private
	 */
	ODataModel.prototype.bindContext = function (sPath, oContext/*, mParameters*/) {
		return new ODataContextBinding(this, sPath, oContext/*, mParameters*/);
	};

	/**
	 * TODO Implement in inheriting classes
	 *
	 * @name sap.ui.model.Model.prototype.bindList
	 * @function
	 * @param {string}
	 *         sPath the path pointing to the list / array that should be bound
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {sap.ui.model.Sorter}
	 *         [aSorters=null] initial sort order (can be either a sorter or an array of sorters) (optional)
	 * @param {array}
	 *         [aFilters=null] predefined filter/s (can be either a filter or an array of filters) (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 * @return {sap.ui.model.ListBinding}

	 * @public
	 */
	ODataModel.prototype.bindList = function () {
		notImplemented("bindList", arguments);
	};

	/**
	 * TODO Does what???
	 *
	 * @name sap.ui.model.Model.prototype.bindProperty
	 * @function
	 * @param {string}
	 *         sPath the path pointing to the property that should be bound
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 * @return {sap.ui.model.PropertyBinding}
	 *
	 * @public
	 */
	ODataModel.prototype.bindProperty = function (sPath, oContext, mParameters) {
		return new ODataPropertyBinding(this, sPath, oContext/*, mParameters*/);
	};

	/**
	 * TODO Implement in inheriting classes
	 *
	 * @name sap.ui.model.Model.prototype.bindTree
	 * @function
	 * @param {string}
	 *         sPath the path pointing to the tree / array that should be bound
	 * @param {object}
	 *         [oContext=null] the context object for this databinding (optional)
	 * @param {array}
	 *         [aFilters=null] predefined filter/s contained in an array (optional)
	 * @param {object}
	 *         [mParameters=null] additional model specific parameters (optional)
	 * @return {sap.ui.model.TreeBinding}
	 *
	 * @public
	 */
	ODataModel.prototype.bindTree = function () {
		notImplemented("bindTree", arguments);
	};

	/**
	 * TODO Implement in inheriting classes
	 *
	 * @name sap.ui.model.Model.prototype.createBindingContext
	 * @function
	 * @param {string}
	 *         sPath the path to create the new context from
	 * @param {object}
	 *		   [oContext=null] the context which should be used to create the new binding context
	 * @param {object}
	 *		   [mParameters=null] the parameters used to create the new binding context
	 * @param {function}
	 *         [fnCallBack] the function which should be called after the binding context has been created
	 * @param {boolean}
	 *         [bReload] force reload even if data is already available. For server side models this should
	 *                   refetch the data from the server
	 * @return {sap.ui.model.Context} the binding context, if it could be created synchronously
	 *
	 * @public
	 */
	ODataModel.prototype.createBindingContext = function () {
		notImplemented("createBindingContext", arguments);
	};

	/**
	 * TODO Implement in inheriting classes
	 *
	 * @name sap.ui.model.Model.prototype.destroyBindingContext
	 * @function
	 * @param {object}
	 *         oContext to destroy
	 * @public
	 */
	ODataModel.prototype.destroyBindingContext = function () {
		notImplemented("destroyBindingContext", arguments);
	};

	/**
	 * TODO Implement in inheriting classes
	 *
	 * @name sap.ui.model.Model.prototype.getProperty
	 * @function
	 * @param {string}
	 *         sPath the path to where to read the attribute value
	 * @param {object}
	 *		   [oContext=null] the context with which the path should be resolved
	 * @public
	 */
	ODataModel.prototype.getProperty = function () {
		notImplemented("getProperty", arguments);
	};

	/**
	 * Trigger a GET request to the OData service that was specified in the model constructor.
	 * The data will be stored in the model.
	 *
	 * @param {string} sPath
	 *   A string containing the path to the data which should be retrieved. The path is
	 *   concatenated to the <code>sServiceUrl</code> which was specified in the model constructor.
	 *
	 * TODO support the following parameters
	 * @param {map} [mParameters] Optional parameter map containing any of the following properties:
	 * @param {object} [mParameters.context] If specified the sPath has to be is relative to the path
	 * 		given with the context.
	 * @param {map} [mParameters.urlParameters] A map containing the parameters that will be passed as query strings
	 * @param {array} [mParameter.filters] an array of sap.ui.model.Filter to be included in the request URL
	 * @param {array} [mParameter.sorters] an array of sap.ui.model.Sorter to be included in the request URL
	 * @param {string} [mParameters.batchGroupId] batchGroupId for this request
	 *
	 * @return {object} an object which has an <code>abort</code> function to abort the current request.
	 *
	 * @public
	 */
	ODataModel.prototype.read = function (sPath, mParameters) {
		var that = this;

		//TODO enrich the returned promise with an abort method?
		return new Promise(function (fnResolve, fnReject) {
			OData.read(that.sServiceUrl + sPath, function (oData) {
					fnResolve(oData);
				});
		});
	};

	return ODataModel;

}, /* bExport= */ true);
