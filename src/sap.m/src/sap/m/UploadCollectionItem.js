/*!
 * ${copyright}
 */

// Provides control sap.m.UploadCollectionItem.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element', 'sap/m/ObjectAttribute', 'sap/m/ObjectStatus', 'sap/ui/core/util/File'],
	function(jQuery, library, Element, ObjectAttribute, ObjectStatus, FileUtil) {
	"use strict";

	/**
	 * Constructor for a new UploadCollectionItem
	 *
	 * @param {string} [sId] ID for the new control, will be generated automatically if no ID is provided.
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
	var UploadCollectionItem = Element.extend("sap.m.UploadCollectionItem", /** @lends sap.m.UploadCollectionItem.prototype */ {
		metadata : {

			library : "sap.m",
			properties : {

				/**
				 * Specifies the name of the user who uploaded the file.
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 * However, if the property is filled, it is displayed as an attribute. To make sure the title does not appear twice, do not use the property.
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
				 * Enables/Disables the Edit button.
				 * If the value is true, the Edit button is enabled and the edit function can be used.
				 * If the value is false, the edit function is not available.
				 */
				enableEdit : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				},

				/**
				 * Enables/Disables the Edit button.
				 * If the value is true, the Edit button is enabled and the edit function can be used.
				 * If the value is false, the edit function is not available.
				 */
				enableDelete : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				},

				/**
				 * Show/Hide the Edit button.
				 * If the value is true, the Edit button is visible.
				 * If the value is false, the Edit button is not visible.
				 */
				visibleEdit : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				},

				/**
				 * Show/Hide the Delete button.
				 * If the value is true, the Delete button is visible.
				 * If the value is false, the Delete button is not visible.
				 */
				visibleDelete : {
					type : "boolean",
					group : "Behavior",
					defaultValue : true
				},

				/**
				 * Aria label for the icon (or for the image).
				 * @experimental since version 1.30. The behavior of the property might change in the next version.
				 */
				ariaLabelForPicture : {type : "string",
					group : "Accessibility",
					defaultValue : null
				},

				/**
				 * Defines the selected state of the UploadCollectionItem.
				 * @since 1.34
				 */
				selected : {
					type : "boolean",
					group : "Behavior",
					defaultValue : false
				}
			},
			defaultAggregation : "attributes",
			aggregations : {
				/**
				 * Attributes of an uploaded item, for example, 'Uploaded By', 'Uploaded On', 'File Size'
				 * attributes are displayed after an item has been uploaded.
				 * Additionally, the Active property of sap.m.ObjectAttribute is supported.<br>
				 * Note that if one of the deprecated properties contributor, fileSize or UploadedDate is filled in addition to this attribute, two attributes with the same title
				 * are displayed as these properties get displayed as an attribute.
				 * Example: An application passes the property ‘contributor’ with the value ‘A’ and the aggregation attributes ‘contributor’: ‘B’. As a result, the attributes
				 * ‘contributor’:’A’ and ‘contributor’:’B’ are displayed. To make sure the title does not appear twice, check if one of the properties is filled.
				 * @since 1.30
				 */
				attributes : {
					type : "sap.m.ObjectAttribute",
					multiple : true
				},
				/**
				 * Hidden aggregation for the attributes created from the deprecated properties uploadedDate, contributor and fileSize
				 * @since 1.30
				 */
				_propertyAttributes : {
					type : "sap.m.ObjectAttribute",
					multiple : true,
					visibility : "hidden"
				},
				/**
				 * Statuses of an uploaded item
				 * Statuses will be displayed after an item has been uploaded
				 * @since 1.30
				 */
				statuses : {
					type : "sap.m.ObjectStatus",
					multiple : true
				}
			},

			associations : {
				/**
				 * ID of the FileUploader instance
				 * since version 1.30
				 */
				fileUploader : {
					type : "sap.ui.unified.FileUploader",
					group : "misc",
					multiple : false
				}
			}
		}
	});

	UploadCollectionItem.prototype.init = function() {
		this._mDeprecatedProperties = {};
	};

	/**
	 * @description Setter of the deprecated contributor property. The property is mapped to the aggregation attributes.
	 * @deprecated since version 1.30
	 * @public
	 */
	UploadCollectionItem.prototype.setContributor = function(sContributor) {
		this.setProperty("contributor", sContributor, false);
		this._updateDeprecatedProperties();
		return this;
	};

	/**
	 * @description Setter of the deprecated uploadedDate property. The property is mapped to the aggregation attributes.
	 * @deprecated since version 1.30
	 * @public
	 */
	UploadCollectionItem.prototype.setUploadedDate = function(sUploadedDate) {
		this.setProperty("uploadedDate", sUploadedDate, false);
		this._updateDeprecatedProperties();
		return this;
	};

	/**
	 * @description Setter of the deprecated fileSize property. The property is mapped to the aggregation attributes.
	 * @deprecated since version 1.30
	 * @public
	 */
	UploadCollectionItem.prototype.setFileSize = function(sFileSize) {
		this.setProperty("fileSize", sFileSize, false);
		this._updateDeprecatedProperties();
		return this;
	};

	/**
	 * @description Setter of the selected property.
	 * @param {boolean} selected value to set on Selected property
	 * @since 1.34
	 * @public
	 */
	UploadCollectionItem.prototype.setSelected = function(selected) {
		if (selected !== this.getSelected()) {
			this.setProperty("selected", selected, true);
			this.fireEvent("selected");
		}
	};

	/**
	 * Downloads the item.
	 * The sap.ui.core.util.File method is used here. For further details on this method, see {sap.ui.core.util.File.save}.
	 * @param {boolean} askForLocation Decides whether to ask for a location to download or not.
	 * @since 1.36.0
	 * @public
	 */
	UploadCollectionItem.prototype.download = function(askForLocation) {
		// File.save doesn't work in Safari but URLHelper.redirect does work.
		// So, this overwrites the value of askForLocation in order to make it work.
		if (sap.ui.Device.browser.name === "sf") {
			askForLocation = false;
		}
		// If there isn't URL, download is not possible
		if (!this.getUrl()) {
			jQuery.sap.log.warning("Items to download do not have an URL.");
			return false;
		} else if (askForLocation) {
			var oBlob = null;
			var oXhr = new window.XMLHttpRequest();
			oXhr.open("GET", this.getUrl());
			oXhr.responseType = "blob";// force the HTTP response, response-type header to be blob
			oXhr.onload = function() {
				var sFileName = this.getFileName();
				var oFileNameAndExtension = this._splitFileName(sFileName, false);
				var sFileExtension = oFileNameAndExtension.extension;
				sFileName = oFileNameAndExtension.name;
				oBlob = oXhr.response; // oXhr.response is now a blob object
				FileUtil.save(oBlob, sFileName, sFileExtension, this.getMimeType(), 'utf-8');
			}.bind(this);
			oXhr.send();
			return true;
		} else {
			library.URLHelper.redirect(this.getUrl(), true);
			return true;
		}
	};

	/**
	 * @description Split file name into name and extension.
	 * @param {string} fileName Full file name inclusive the extension
	 * @param {boolean} withDot True if the extension should be returned starting with a dot (ie: '.jpg'). False for no dot. If not value is provided, the extension name is given without dot
	 * @returns {object} oResult Filename and Extension
	 * @private
	 */
	UploadCollectionItem.prototype._splitFileName = function(fileName, withDot) {
		var oResult = {};
		var oRegex = /(?:\.([^.]+))?$/;
		var aFileExtension = oRegex.exec(fileName);
		oResult.name = fileName.slice(0, fileName.indexOf(aFileExtension[0]));
		if (withDot) {
			oResult.extension = aFileExtension[0];
		} else {
			oResult.extension = aFileExtension[1];
		}
		return oResult;
	};

	/**
	 * @description Update deprecated properties aggregation
	 * @private
	 * @since 1.30.
	 */
	UploadCollectionItem.prototype._updateDeprecatedProperties = function() {
		var aProperties = ["uploadedDate", "contributor", "fileSize"];
		this.removeAllAggregation("_propertyAttributes", true);
		jQuery.each(aProperties, function(i, sName) {
			var sValue = this.getProperty(sName),
					oAttribute = this._mDeprecatedProperties[sName];
			if (jQuery.type(sValue) === "number" && !!sValue  || !!sValue) {
				if (!oAttribute) {
					oAttribute = new ObjectAttribute({
						active : false
					});
					this._mDeprecatedProperties[sName] = oAttribute;
					this.addAggregation("_propertyAttributes", oAttribute, true);
					oAttribute.setText(sValue);
				} else {
					oAttribute.setText(sValue);
					this.addAggregation("_propertyAttributes", oAttribute, true);
				}
			} else if (oAttribute) {
				oAttribute.destroy();
				delete this._mDeprecatedProperties[sName];
			}
		}.bind(this));
		this.invalidate();
	};

	/**
	 * @description Return all attributes, the deprecated property attributes and the aggregated attributes in one array
	 * @private
	 * @since 1.30.
	 */
	UploadCollectionItem.prototype.getAllAttributes = function() {
		return this.getAggregation("_propertyAttributes", []).concat(this.getAttributes());
	};

	return UploadCollectionItem;

}, /* bExport= */true);
