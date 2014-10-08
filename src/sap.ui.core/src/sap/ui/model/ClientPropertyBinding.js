/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a property binding
sap.ui.define(['jquery.sap.global', './PropertyBinding'],
	function(jQuery, PropertyBinding) {
	"use strict";


	/**
	 *
	 * @class
	 * Property binding implementation for client models
	 * 
	 * @param {sap.ui.model.Model} oModel
	 * @param {String} sPath
	 * @param {sap.ui.model.Context} oContext
	 * @param {Object} [mParameters]
	 * 
	 * @name sap.ui.model.ClientPropertyBinding
	 * @extends sap.ui.model.PropertyBinding
	 */
	var ClientPropertyBinding = PropertyBinding.extend("sap.ui.model.ClientPropertyBinding", /** @lends sap.ui.model.ClientPropertyBinding.prototype */ {
		
		constructor : function(oModel, sPath, oContext, mParameters){
			PropertyBinding.apply(this, arguments);
			this.oValue = this._getValue();
		}
		
	});
	
	/**
	 * @see sap.ui.model.PropertyBinding.prototype.getValue
	 * @name sap.ui.model.ClientPropertyBinding#getValue
	 * @function
	 */
	ClientPropertyBinding.prototype.getValue = function(){
		return this.oValue;
	};
	
	
	/**
	 * Returns the current value of the bound target (incl. re-evaluation)
	 * @return {object} the current value of the bound target
	 * @name sap.ui.model.ClientPropertyBinding#_getValue
	 * @function
	 */
	ClientPropertyBinding.prototype._getValue = function(){
		var sProperty = this.sPath.substr(this.sPath.lastIndexOf("/") + 1);
		if (sProperty == "__name__") {
			var aPath = this.oContext.split("/");
			return aPath[aPath.length - 1];
		}
		return this.oModel.getProperty(this.sPath, this.oContext); // ensure to survive also not set model object
	};
	
	/**
	 * Setter for context
	 * @name sap.ui.model.ClientPropertyBinding#setContext
	 * @function
	 */
	ClientPropertyBinding.prototype.setContext = function(oContext) {
		if (this.oContext != oContext) {
			this.oContext = oContext;
			if (this.isRelative()) {
				this.checkUpdate();
			}
		}
	};

	return ClientPropertyBinding;

}, /* bExport= */ true);
