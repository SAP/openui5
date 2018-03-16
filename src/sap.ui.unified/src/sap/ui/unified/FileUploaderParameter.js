/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.FileUploaderParameter.
sap.ui.define(['sap/ui/core/Element', './library'],
	function(Element, library) {
	"use strict";



	/**
	 * Constructor for a new FileUploaderParameter.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Represents a parameter for the FileUploader which is rendered as a hidden inputfield.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.FileUploaderParameter
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FileUploaderParameter = Element.extend("sap.ui.unified.FileUploaderParameter", /** @lends sap.ui.unified.FileUploaderParameter.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * The name of the hidden inputfield.
			 * @since 1.12.2
			 */
			name : {type : "string", group : "Data", defaultValue : null},

			/**
			 * The value of the hidden inputfield.
			 * @since 1.12.2
			 */
			value : {type : "string", group : "Data", defaultValue : null}
		}
	}});



	return FileUploaderParameter;

});
