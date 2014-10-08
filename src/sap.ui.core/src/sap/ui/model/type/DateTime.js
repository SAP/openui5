/*!
 * ${copyright}
 */

// Provides the base implementation for all model implementations
sap.ui.define(['jquery.sap.global', './Date'],
	function(jQuery, Date) {
	"use strict";


	/**
	 * Constructor for a DateTime type.
	 *
	 * @class
	 * This class represents datetime simple types.
	 *
	 * @extends sap.ui.model.type.Date
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @param {object} [oFormatOptions] options used to create a DateFormat for formatting / parsing to/from external values and 
	 *           optionally for a second DateFormat to convert between the data source format (Model) and the internally used JavaScript Date.format. 
	 *           For both DateFormat objects, the same options are supported as for {@link sap.ui.core.format.DateFormat.getDateTimeInstance DateFormat.getDateTimeInstance}.
	 *           Note that this differs from the base type.
	 * @param {object} [oConstraints] value constraints. Supports the same kind of constraints as its base type Date, but note the different format options (Date vs. DateTime) 
	 * @name sap.ui.model.type.DateTime
	 */
	var DateTime = Date.extend("sap.ui.model.type.DateTime", /** @lends sap.ui.model.type.DateTime.prototype */ {
		
		constructor : function () {
			Date.apply(this, arguments);
			this.sName = "DateTime";
		}
	
	});
	
	/**
	 * Creates a new subclass of class sap.ui.model.type.DateTime with name <code>sClassName</code> 
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
	 * @name sap.ui.model.type.DateTime.extend
	 * @function
	 */
	
	/**
	 * Called by the framework when any localization setting changed
	 * @see sap.ui.model.Date.prototype._handleLocalizationChange
	 * @private
	 * @name sap.ui.model.type.DateTime#_handleLocalizationChange
	 * @function
	 */
	DateTime.prototype._handleLocalizationChange = function() {
		this.oOutputFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(this.oFormatOptions);
		if (this.oFormatOptions.source) {
			this.oInputFormat = sap.ui.core.format.DateFormat.getDateTimeInstance(this.oFormatOptions.source);
		}
	};
	
	

	return DateTime;

}, /* bExport= */ true);
