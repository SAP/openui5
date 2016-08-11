/*!
 * ${copyright}
 */

// Provides an abstraction for model bindings
sap.ui.define(['sap/ui/base/Object'],
	function(BaseObject) {
	"use strict";


	/**
	 * Constructor for Context class.
	 *
	 * @class
	 * The Context is a pointer to an object in the model data, which is used to
	 * allow definition of relative bindings, which are resolved relative to the
	 * defined object.
	 * Context elements are created either by the ListBinding for each list entry
	 * or by using createBindingContext.
	 *
	 * @param {sap.ui.model.Model} oModel the model
	 * @param {String} sPath the binding path
	 * @abstract
	 * @public
	 * @alias sap.ui.model.Context
	 * @extends sap.ui.base.Object
	 */
	var Context = BaseObject.extend("sap.ui.model.Context", /** @lends sap.ui.model.Context.prototype */ {

		constructor : function(oModel, sPath) {

			BaseObject.apply(this);

			this.oModel = oModel;
			this.sPath = sPath;

		},

		metadata : {
			"abstract" : true,
		  publicMethods : [
				"getModel", "getPath", "getProperty", "getObject"
			]
		}

	});

	// Getter
	/**
	 * Getter for model
	 * @public
	 * @return {sap.ui.core.Model} the model
	 */
	Context.prototype.getModel = function() {
		return this.oModel;
	};

	/**
	 * Getter for path of the context itself or a subpath
	 * @public
	 * @param {String} sPath the binding path
	 * @return {String} the binding path
	 */
	Context.prototype.getPath = function(sPath) {
		return this.sPath + (sPath ? "/" + sPath : "");
	};

	/**
	 * Gets the property with the given relative binding path
	 * @public
	 * @param {String} sPath the binding path
	 * @return {any} the property value
	 */
	Context.prototype.getProperty = function(sPath) {
		return this.oModel.getProperty(sPath, this);
	};

	/**
	 * Gets the (model dependent) object the context points to or the object with the given relative binding path
	 * @public
	 * @param {String} [sPath] the binding path
	 * @param {object} [mParameters] additional model specific parameters (optional)
	 * @return {object} the context object
	 */
	Context.prototype.getObject = function(sPath, mParameters) {
		if (jQuery.isPlainObject(sPath)) {
			mParameters = sPath;
			sPath = undefined;
		}
		return this.oModel.getObject(sPath, this, mParameters);
	};

	/**
	 * toString method returns path for compatibility
	 */
	Context.prototype.toString = function() {
		return this.sPath;
	};


	return Context;

});
