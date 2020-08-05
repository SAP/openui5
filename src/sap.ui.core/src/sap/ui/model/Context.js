/*!
 * ${copyright}
 */

// Provides an abstraction for model bindings
sap.ui.define(['sap/ui/base/Object', "sap/base/util/isPlainObject"],
	function(BaseObject, isPlainObject) {
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
	 * @param {string} sPath the binding path
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
			this.bForceRefresh = false;
			this.sDeepPath = "";
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
	 * @return {sap.ui.model.Model} the model
	 */
	Context.prototype.getModel = function() {
		return this.oModel;
	};

	/**
	 * Getter for path of the context itself or a subpath
	 * @public
	 * @param {string} [sPath] the binding path (optional)
	 * @return {string} the binding path
	 */
	Context.prototype.getPath = function(sPath) {
		return this.sPath + (sPath ? "/" + sPath : "");
	};

	/**
	 * Gets the property with the given relative binding path
	 * @public
	 * @param {string} sPath the binding path
	 * @return {any} the property value
	 */
	Context.prototype.getProperty = function(sPath) {
		return this.oModel.getProperty(sPath, this);
	};

	/**
	 * Gets the (model dependent) object the context points to or the object with the given relative binding path
	 * @public
	 * @param {string} [sPath] the binding path
	 * @param {object} [mParameters] additional model specific parameters (optional)
	 * @return {object} the context object
	 */
	Context.prototype.getObject = function(sPath, mParameters) {
		if (isPlainObject(sPath)) {
			mParameters = sPath;
			sPath = undefined;
		}
		return this.oModel.getObject(sPath, this, mParameters);
	};

	/**
	 * Sets the force refresh flag of the context. If this is set, the context will force a refresh of dependent
	 * bindings, when the context is propagated.
	 * @private
	 * @param {boolean} bForceRefresh the force refresh flag
	 */
	Context.prototype.setForceRefresh = function(bForceRefresh) {
		this.bForceRefresh = bForceRefresh;
	};

	/**
	 * This method returns, whether dependent bindings need to be refreshed.
	 * @private
	 * @return {boolean} the force refresh flag
	 */
	Context.prototype.isRefreshForced = function() {
		return this.bForceRefresh;
	};

	/**
	 * Sets the preliminary flag of the context. If this is set, the context is not yet linked to actual model
	 * data, but does just contain path information. This can be used by dependent bindings to send their request
	 * in parallel to the request of the context binding.
	 * @private
	 * @param {boolean} bPreliminary the preliminary flag
	 */
	Context.prototype.setPreliminary = function(bPreliminary) {
		this.bPreliminary = bPreliminary;
	};

	/**
	 * This method returns, whether the context is preliminary.
	 * @private
	 * @ui5-restricted sap.suite.ui.generic
	 * @return {boolean} the preliminary flag
	 */
	Context.prototype.isPreliminary = function() {
		return this.bPreliminary;
	};

	/**
	 * Sets the updated flag of the context. If this is set, the context was updated. E.g. the path changed from
	 * a preliminary path to the canonical one.
	 * @private
	 * @param {boolean} bUpdated the preliminary flag
	 */
	Context.prototype.setUpdated = function(bUpdated) {
		this.bUpdated = bUpdated;
	};

	/**
	 * This method returns, whether the context is updated.
	 * @private
	 * @return {boolean} the updated flag
	 */
	Context.prototype.isUpdated = function() {
		return this.bUpdated;
	};

	/**
	 * Compares the two given Contexts. Returns true if the context instances are not equal,
	 * if the new context is updated or if the new context is refreshed.
	 *
	 * @param {sap.ui.model.Context} oOldContext The old Context
	 * @param {sap.ui.model.Context} oNewContext The new Context
	 * @return {boolean} Whether oNewContext has changed
	 * @private
	 */
	Context.hasChanged = function(oOldContext, oNewContext) {
		var bChanged = false;

		if (oOldContext !== oNewContext) {
			bChanged = true;
		} else if (oNewContext && oNewContext.isUpdated()) {
			bChanged = true;
		} else if (oNewContext && oNewContext.isRefreshForced()) {
			bChanged = true;
		}

		return bChanged;
	};

	/**
	 * toString method returns path for compatibility
	 */
	Context.prototype.toString = function() {
		return this.sPath;
	};

	/**
	 * Returns messages associated with this context, that is messages belonging to the object
	 * referred to by this context or a child object of that object. The messages are sorted by
	 * their {@link sap.ui.core.message.Message#getType type} according to the type's severity in a
	 * way that messages with highest severity come first.
	 *
	 * @returns {sap.ui.core.message.Message[]}
	 *   The messages associated with this context sorted by severity; empty array in case no
	 *   messages exist
	 * @throws {Error}
	 *   In case the context's model does not implement the method
	 *   {@link sap.ui.model.Model#getMessages}
	 *
	 * @public
	 * @see sap.ui.model.Model#getMessages
	 * @since 1.76.0
	 */
	Context.prototype.getMessages = function () {
		return this.oModel.getMessages(this);
	};

	return Context;

});