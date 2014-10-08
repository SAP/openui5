/*!
 * ${copyright}
 */

// Provides control sap.m.UploadCollectionParameter.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";


	
	/**
	 * Constructor for a new UploadCollectionParameter.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Represents a parameter for the UploadCollection.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP AG
	 * @version 1.25.0-SNAPSHOT
	 *
	 * @constructor
	 * @public
	 * @name sap.m.UploadCollectionParameter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UploadCollectionParameter = Element.extend("sap.m.UploadCollectionParameter", /** @lends sap.m.UploadCollectionParameter.prototype */ { metadata : {
	
		library : "sap.m",
		properties : {
	
			/**
			 * The name of the parameter.
			 * @since 1.12.2
			 */
			name : {type : "string", group : "Data", defaultValue : null},
	
			/**
			 * The value of the parameter.
			 * @since 1.12.2
			 */
			value : {type : "string", group : "Data", defaultValue : null}
		}
	}});
	
	

	return UploadCollectionParameter;

}, /* bExport= */ true);
