/*!
 * ${copyright}
 */

// Provides control sap.m.UploadCollectionItem.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element', 'sap/m/ObjectAttribute', 'sap/m/ObjectStatus'],
	function(jQuery, library, Element, ObjectAttribute, ObjectStatus) {
	"use strict";


	
	/**
	 * Constructor for a new UploadCollectionItem.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Items provide information about the uploaded files.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.26
	 * @alias sap.m.UploadCollectionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UploadCollectionItem = Element.extend("sap.m.UploadCollectionItem", /** @lends sap.m.UploadCollectionItem.prototype */
	{
		metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Specifies the name of the user who uploaded the file.
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 */
				contributor : {
					type : "string",
					group : "Data",
					defaultValue : null
				},

				/**
				 * Specifies a unique identifier of the file (created by the application).
				 */
				documentId : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * Specifies the name of the uploaded file.
				 */
				fileName : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * Specifies the size of the uploaded file (in megabytes).
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 */
				fileSize : {
					type : "float",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * Specifies the MIME type of the file.
				 */
				mimeType : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * Specifies the URL where the thumbnail of the file is located.
				 */
				thumbnailUrl : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * Specifies the date on which the file was uploaded. 
				 * The application has to define the date format.
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 */
				uploadedDate : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * Specifies the URL where the file is located.
				 */
				url : {
					type : "string",
					group : "Misc",
					defaultValue : null
				},

				/**
				 * Enables/Disables the Edit pushbutton.
				 * If the value is true, the Edit pushbutton is enabled and the edit function can be used.
				 * If the value is false, the edit function is not available.
				 */
				enableEdit : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				},

				/**
				 * Enables/Disables the Edit pushbutton.
				 * If the value is true, the Edit pushbutton is enabled and the edit function can be used.
				 * If the value is false, the edit function is not available.
				 */
				enableDelete : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				},

				/**
				 * Show/Hide the Edit pushbutton.
				 * If the value is true, the Edit pushbutton is visible.
				 * If the value is false, the Edit pushbutton is not visible.
				 */
				visibleEdit : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				},

				/**
				 * Show/Hide the Delete pushbutton.
				 * If the value is true, the Delete pushbutton is visible.
				 * If the value is false, the Delete pushbutton is not visible.
				 */
				visibleDelete : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				}
			},
			aggregations : {
				/**
				 * Attributes of an uploaded item, e.g. 'Uploaded by', 'Uploaded on', 'File Size'
				 * Attributes will be displayed after an item has been uploaded
				 * The property 'active' of sap.m.ObjectAttribute is not supported
				 * @experimental Since 1.30. Behavior might change.
				 */
				attributes : {
					type : "sap.m.ObjectAttribute",
					multiple : true
				},
				/**
				 * Statuses of an uploaded item
				 * Statuses will be displayed after an item has been uploaded
				 * @experimental Since 1.30. Behavior might change.
				 */
				statuses : {
					type : "sap.m.ObjectStatus",
					multiple : true
				}
			}
		}
	});

	return UploadCollectionItem;

}, /* bExport= */true);
