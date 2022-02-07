/*!
 * ${copyright}
 */
/*eslint-disable max-len */
sap.ui.define(['./Model'],
	function(Model) {
	"use strict";

	/**
	 * Constructor for a new MetaModel.
	 *
	 * @class Model implementation for meta models
	 * @abstract
	 * @extends sap.ui.model.Model
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.model.MetaModel
	 */
	var MetaModel = Model.extend("sap.ui.model.MetaModel", {
			constructor : function() {
				Model.apply(this, arguments);
			}
		});

	/**
	 * @param {string} sPath
	 *   the path to create the new context from
	 * @param {object} [oContext=null]
	 *   the context which should be used to create the new binding context
	 * @param {object} [mParameters=null]
	 *   the parameters used to create the new binding context
	 * @param {function} [fnCallBack]
	 *   the function which should be called after the binding context has been created
	 * @param {boolean} [bReload]
	 *   force reload even if data is already available. For server side models this should
	 *   refetch the data from the server
	 * @return {sap.ui.model.Context|undefined} the binding context, if it could be created synchronously
	 * @see sap.ui.model.Model.prototype.createBindingContext
	 *
	 */
	MetaModel.prototype.createBindingContext = function(sPath, oContext, mParameters, fnCallBack) {
		if (typeof oContext == "function") {
			fnCallBack = oContext;
			oContext = null;
		}
		if (typeof mParameters == "function") {
			fnCallBack = mParameters;
			mParameters = null;
		}
		// resolve path and create context
		var sContextPath = this.resolve(sPath, oContext),
			oNewContext = (sContextPath == undefined) ? undefined : this.getContext(sContextPath ? sContextPath : "/");
			if (!oNewContext) {
				oNewContext = null;
		}
		if (fnCallBack) {
			fnCallBack(oNewContext);
		}
		return oNewContext;
	};

	/**
	 * Does nothing.
	 */
	MetaModel.prototype.destroyBindingContext = function() {
	};

	return MetaModel;

});
