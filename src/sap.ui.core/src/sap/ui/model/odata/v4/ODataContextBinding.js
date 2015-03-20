/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"jquery.sap.global", "sap/ui/model/ChangeReason", "sap/ui/model/ContextBinding"
], function(jQuery, ChangeReason, ContextBinding) {
	"use strict";

	/**
	 * Constructor for a new ODataContextBinding.
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   the OData V4 model
	 * @param {String} sPath
	 *   the binding path in the model
	 * @param {Object} oContext
	 *   ???//TODO
	 *
	 * @class Context binding for an OData V4 model.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.model.odata.v4.ODataContextBinding
	 * @extends sap.ui.model.ContextBinding
	 * @public
	 * @since 1.29.0 //TODO
	 */
	var ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding", /** @lends sap.ui.model.odata.v4.ODataContextBinding.prototype */ {
		constructor : function() {
			ContextBinding.apply(this, arguments);
		},
		metadata : {
			publicMethods : []
		}
	});

	/**
	 * TODO
	 * Checks whether an update of this bindings is required. If this is the case the change event of
	 * the binding is fired.
	 *
	 * @param {boolean} bForceUpdate
	 *
	 * @private
	 */
	ODataContextBinding.prototype.checkUpdate = function (bForceUpdate) {
		var oPromise = this.getModel().read(this.getPath()),
			that = this;

		oPromise.then(
			function (oData) {
				//TODO if (!this.bSuspended) {
				//TODO TDD
				that.oBoundContext = that.getModel().getContext(that.getPath());
				that._fireChange({reason: ChangeReason.Change});
			},
			function (oError) {
				/*TODO error handler: complete, TDD!*/
				jQuery.sap.log.error("error", oError, "sap.ui.model.odata.v4.ODataContextBinding");
			});
	};

	/**
	 * TODO Return the bound context.
	 */
	//overrides ContextBinding.prototype.getBoundContext
	ODataContextBinding.prototype.getBoundContext = function (oContext) {
		return this.oBoundContext;
	};

	return ODataContextBinding;

}, /* bExport= */ true);
