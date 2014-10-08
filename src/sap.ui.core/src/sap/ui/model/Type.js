/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object'],
	function(jQuery, BaseObject) {
	"use strict";


	/**
	 * Constructor for a new Type.
	 *
	 * @class
	 * This is an abstract base class for type objects.
	 * @abstract
	 *
	 * @extends sap.ui.base.Object
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.model.Type
	 */
	var Type = BaseObject.extend("sap.ui.model.Type", /** @lends sap.ui.model.Type.prototype */ {
		
		constructor : function () {
			BaseObject.apply(this, arguments);
			this.sName = "Type";
		},
	
		metadata : {
			"abstract" : true,
			publicMethods : [
			// methods
			"getName"
		  ]
		}
		
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.Type with name <code>sClassName</code> 
	 * and enriches it with the information contained in <code>oClassInfo</code>.
	 * 
	 * For a detailed description of <code>oClassInfo</code> or <code>FNMetaImpl</code> 
	 * see {@link sap.ui.base.Object.extend Object.extend}.
	 *   
	 * @param {string} sClassName name of the class to be created
	 * @param {object} [oClassInfo] object literal with informations about the class  
	 * @param {function} [FNMetaImpl] alternative constructor for a metadata object
	 * @return {function} the created class / constructor function
	 * @public
	 * @static
	 * @name sap.ui.model.Type.extend
	 * @function
	 */
	
	
	/**
	 * Returns the name of this type.
	 *
	 * @return {String} the name of this type
	 * @public
	 * @name sap.ui.model.Type#getName
	 * @function
	 */
	Type.prototype.getName = function() {
		return this.sName;
	};

	return Type;

}, /* bExport= */ true);
