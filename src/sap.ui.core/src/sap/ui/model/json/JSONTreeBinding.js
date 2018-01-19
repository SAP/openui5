/*!
 * ${copyright}
 */

// Provides the JSON model implementation of a list binding
sap.ui.define(['jquery.sap.global', 'sap/ui/model/ClientTreeBinding'],
	function(jQuery, ClientTreeBinding) {
	"use strict";


	/**
	 * Creates a new JSONListBinding.
	 *
	 * This constructor should only be called by subclasses or model implementations, not by application or control code.
	 * Such code should use {@link sap.ui.model.json.JSONModel#bindTree JSONModel#bindTree} on the corresponding model instance instead.
	 *
	 * @param {sap.ui.model.json.JSONModel}
	 *         oModel Model instance that this binding is created for and that it belongs to
	 * @param {string}
	 *         sPath Path pointing to the tree or array that should be bound
	 * @param {object}
	 *         [oContext=null] Context object for this binding, mandatory when a relative binding path is given
	 * @param {sap.ui.model.Filter|sap.ui.model.Filter[]}
	 *         [aFilters=null] Predefined filters contained in an array
	 * @param {object}
	 *         [mParameters=null] Additional model-specific parameters
	 * @param {string[]} [mParameters.arrayNames]
	 * 			Keys of arrays to be used for building the tree structure. If not specified, all arrays and objects in the bound data will be used.
	 *			Note that for arrays nested inside differently named arrays, you need to add both to <code>arrayNames</code>. You always have to add the complete parent chain.
	 *			If any array is ignored, its child arrays will be ignored as well even if they have been added to <code>arrayNames</code>.
	 * @throws {Error} When one of the filters uses an operator that is not supported by the underlying model implementation
	 *
	 *
	 * @class
	 * Tree binding implementation for JSON format.
	 *
	 * The bound data can contain JSON objects and arrays. Both will be used to build the tree structure.
	 * You can optionally define a set of arrays to be used for the tree structure in the parameter <code>arrayNames</code>.
	 * If this parameter is set, all other objects and arrays will be ignored.
	 *
	 * @protected
	 * @alias sap.ui.model.json.JSONTreeBinding
	 * @extends sap.ui.model.ClientTreeBinding
	 */
	var JSONTreeBinding = ClientTreeBinding.extend("sap.ui.model.json.JSONTreeBinding");

	JSONTreeBinding.prototype._saveSubContext = function(oNode, aContexts, sContextPath, sName) {
		// only collect node if it is defined (and not null), because typeof null == "object"!
		if (oNode && typeof oNode == "object") {
			var oNodeContext = this.oModel.getContext(sContextPath + sName);
			// check if there is a filter on this level applied
			if (this.aAllFilters && !this.bIsFiltering) {
				if (jQuery.inArray(oNodeContext, this.filterInfo.aFilteredContexts) != -1) {
					aContexts.push(oNodeContext);
				}
			} else {
				aContexts.push(oNodeContext);
			}
		}
	};

	return JSONTreeBinding;

});
