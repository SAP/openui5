/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataPropertyBinding
sap.ui.define([
	"jquery.sap.global", "sap/ui/model/ChangeReason", "sap/ui/model/PropertyBinding"
], function(jQuery, ChangeReason, PropertyBinding) {
	"use strict";

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
		throw new Error("Not implemented method v4.ODataPropertyBinding." + sMethodName
			+ " called with arguments " + sArgs);
	}

	/**
	 * Constructor for a new ODataPropertyBinding.
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   the OData V4 model
	 * @param {String} sPath
	 *   the binding path in the model
	 * @param {sap.ui.model.Context} oContext
	 *   ??? TODO
	 * @param {object} [mParameters]
	 *   ??? TODO
	 *
	 * @class Property binding for an OData V4 model.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataPropertyBinding
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 * @since 1.29.0 //TODO
	 */
	var ODataPropertyBinding = PropertyBinding.extend("sap.ui.model.odata.v4.ODataPropertyBinding", /** @lends sap.ui.model.odata.v4.ODataPropertyBinding.prototype */ {

		constructor : function() {
			PropertyBinding.apply(this, arguments);
		},
		metadata : {
			publicMethods : []
		}
	});


	//TODO TDD
	ODataPropertyBinding.prototype.checkUpdate = function (bForceUpdate) {
		var oPromise,
			that = this;

		if (!this.getContext()) {
			jQuery.sap.log.warning("No context: can't resolve property binding for path "
				+ this.getPath(), undefined, "sap.ui.model.odata.v4.ODataPropertyBinding");
			return;
		}
		oPromise = this.getModel().read(
			this.getModel().resolve(this.getPath(), this.getContext()));
		oPromise.then(
			function (oData) {
				that.oValue = oData.value;
//				TODO if (!this.bSuspended) {
				that._fireChange({reason: ChangeReason.Change});
			},
			function (oError) {
				/*TODO error handler: complete, TDD!*/
				jQuery.sap.log.error("error", oError,
					"sap.ui.model.odata.v4.ODataPropertyBinding");
			});
	};

	/**
	 * Returns the current value of the bound target.
	 * @returns {object}
	 *   the current value of the bound target
	 * @public
	 */
	ODataPropertyBinding.prototype.getValue = function () {
		return this.oValue;
	};

	//TODO doc, TDD
	ODataPropertyBinding.prototype.setContext = function (oContext) {
		this.oContext = oContext;
		this.checkUpdate();
	};

	/**
	 * TODO Sets the value for this binding. A model implementation should check if the current default binding mode permits
	 * setting the binding value and if so set the new value also in the model.
	 *
	 * @function
	 * @name sap.ui.model.PropertyBinding.prototype.setValue
	 * @param {object} oValue the value to set for this binding
	 *
	 * @public
	 */
	ODataPropertyBinding.prototype.setValue = function () {
		notImplemented("setValue", arguments);
	};

	return ODataPropertyBinding;

}, /* bExport= */ true);
