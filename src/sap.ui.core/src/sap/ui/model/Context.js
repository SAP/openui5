/*!
 * ${copyright}
 */
/*eslint-disable max-len */
// Provides an abstraction for model bindings
sap.ui.define([
	"sap/base/util/isPlainObject",
	"sap/ui/base/Object"
], function (isPlainObject, BaseObject) {
	"use strict";


	/**
	 * Constructor for Context class. The constructor must only be called by model-internal methods.
	 *
	 * @class
	 * The Context is a pointer to an object in the model data. A relative binding needs a context
	 * as a reference point in order to resolve its path; without a context, a relative binding is
	 * unresolved and does not point to model data. Context instances can, for example, be created
	 * in the following ways:
	 * <ul>
	 * <li>by a {@link sap.ui.model.ListBinding} for each list entry,</li>
	 * <li>as the single context associated with a {@link sap.ui.model.ContextBinding},</li>
	 * <li>by calling {@link sap.ui.model.Model#createBindingContext}.</li>
	 * </ul>
	 *
	 * For more information on the concept of data binding and binding contexts, see
	 * {@link topic:e2e6f4127fe4450ab3cf1339c42ee832 documentation on binding syntax}.
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
			"abstract" : true
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
	 * Sets the given value for the property with the given binding path relative to this context in the model.
	 *
	 * @param {string} sPath
	 *   The binding path
	 * @param {any} vValue
	 *   The value to set
	 * @param {string} [sGroupId]
	 *   Not used in default implementation; may be used by sub classes
	 * @param {boolean} [bRetry]
	 *   Not used in default implementation; may be used by sub classes
	 * @throws {Error}
	 *   If the value cannot be set because this context does not refer to an entry in the model data
	 * @private
	 */
	Context.prototype.setProperty = function(sPath, vValue, sGroupId, bRetry) {
		if (!this.oModel.setProperty(sPath, vValue, this, /*bAsyncUpdate*/ true)) {
			throw new Error("Cannot set the value " + vValue + " for the property " + sPath + " as the context path "
				+ this.getPath() + " does not refer to an entry in the model data.");
		}
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
	 * Whether this context has changed. By default this context cannot be changed but subclasses
	 * can override this behaviour.
	 *
	 * @return {boolean} Whether this context has changed
	 * @private
	 * @ui5-restricted sap.ui.base.ManagedObject
	 */
	Context.prototype.hasChanged = function() {
		return false;
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
		// The check below is used in ManagedObject.setBindingContext as well to avoid
		// a dependency to Context (ManagedObject should be databinding free).
		// Both places must kept in sync!
		return oOldContext !== oNewContext
			|| !!oNewContext && !!oNewContext.hasChanged();
	};

	/**
	 * Returns the path of this Context instance.
	 *
	 * @returns {string} The path
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