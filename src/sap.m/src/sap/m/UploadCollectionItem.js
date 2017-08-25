/*!
 * ${copyright}
 */

// Provides control sap.m.UploadCollectionItem.
sap.ui.define([
	"jquery.sap.global",
	"./library",
	"sap/ui/core/Element",
	"sap/m/ObjectAttribute",
	"sap/ui/core/util/File",
	"sap/ui/Device"
], function(jQuery, library, Element, ObjectAttribute, FileUtil, Device) {
	"use strict";

	/**
	 * Constructor for a new UploadCollectionItem
	 *
	 * @param {string} [sId] ID for the new control, will be generated automatically if no ID is provided.
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Defines a structure of the element of the 'items' aggregation.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.26.0
	 * @alias sap.m.UploadCollectionItem
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var UploadCollectionItem = Element.extend("sap.m.UploadCollectionItem", /** @lends sap.m.UploadCollectionItem.prototype */ {
		metadata: {

			library: "sap.m",
			properties: {

				/**
				 * Specifies the name of the user who uploaded the file.
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 * However, if the property is filled, it is displayed as an attribute. To make sure the title does not appear twice, do not use the property.
				 */
				contributor: {
					type: "string",
					group: "Data",
					defaultValue: null
				},

				/**
				 * Specifies a unique identifier of the file (created by the application).
				 */
				documentId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the name of the uploaded file.
				 */
				fileName: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the size of the uploaded file (in megabytes).
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 */
				fileSize: {
					type: "float",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the MIME type of the file.
				 */
				mimeType: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the URL where the thumbnail of the file is located. This can also be an SAPUI5 icon URL.
				 */
				thumbnailUrl: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the date on which the file was uploaded.
				 * The application has to define the date format.
				 * @deprecated since version 1.30. This property is deprecated; use the aggregation attributes instead.
				 */
				uploadedDate: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the URL where the file is located.
				 * If the application doesn't provide a value for this property, the icon and the file name of the UploadCollectionItem are not clickable.
				 */
				url: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Enables/Disables the Edit button.
				 * If the value is true, the Edit button is enabled and the edit function can be used.
				 * If the value is false, the edit function is not available.
				 */
				enableEdit: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},

				/**
				 * Enables/Disables the Delete button.
				 * If the value is true, the Delete button is enabled and the delete function can be used.
				 * If the value is false, the delete function is not available.
				 */
				enableDelete: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},

				/**
				 * Show/Hide the Edit button.
				 * If the value is true, the Edit button is visible.
				 * If the value is false, the Edit button is not visible.
				 */
				visibleEdit: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},

				/**
				 * Show/Hide the Delete button.
				 * If the value is true, the Delete button is visible.
				 * If the value is false, the Delete button is not visible.
				 */
				visibleDelete: {
					type: "boolean",
					group: "Behavior",
					defaultValue: true
				},

				/**
				 * Aria label for the icon (or for the image).
				 * @since 1.30.0
				 */
				ariaLabelForPicture: {
					type: "string",
					group: "Accessibility",
					defaultValue: null
				},

				/**
				 * Defines the selected state of the UploadCollectionItem.
				 * @since 1.34.0
				 */
				selected: {
					type: "boolean",
					group: "Behavior",
					defaultValue: false
				}
			},
			defaultAggregation: "attributes",
			aggregations: {
				/**
				 * Attributes of an uploaded item, for example, 'Uploaded By', 'Uploaded On', 'File Size'
				 * attributes are displayed after an item has been uploaded.
				 * Additionally, the Active property of sap.m.ObjectAttribute is supported.<br>
				 * Note that if one of the deprecated properties contributor, fileSize or UploadedDate is filled in addition to this attribute, two attributes with the same title
				 * are displayed as these properties get displayed as an attribute.
				 * Example: An application passes the property ‘contributor’ with the value ‘A’ and the aggregation attributes ‘contributor’: ‘B’. As a result, the attributes
				 * ‘contributor’:’A’ and ‘contributor’:’B’ are displayed. To make sure the title does not appear twice, check if one of the properties is filled.
				 * @since 1.30.0
				 */
				attributes: {
					type: "sap.m.ObjectAttribute",
					multiple: true,
					bindable: "bindable"
				},
				/**
				 * Hidden aggregation for the attributes created from the deprecated properties uploadedDate, contributor and fileSize
				 * @since 1.30.0
				 */
				_propertyAttributes: {
					type: "sap.m.ObjectAttribute",
					multiple: true,
					visibility: "hidden"
				},
				/**
				 * Statuses of an uploaded item
				 * Statuses will be displayed after an item has been uploaded
				 * @since 1.30.0
				 */
				statuses: {
					type: "sap.m.ObjectStatus",
					multiple: true,
					bindable: "bindable"
				},
				/**
				 * Markers of an uploaded item
				 * Markers will be displayed after an item has been uploaded
				 * But not in Edit mode
				 * @since 1.40.0
				 */
				markers: {
					type: "sap.m.ObjectMarker",
					multiple: true,
					bindable: "bindable"
				}
			},

			associations: {
				/**
				 * ID of the FileUploader instance
				 * @since 1.30.0
				 */
				fileUploader: {
					type: "sap.ui.unified.FileUploader",
					multiple: false
				}
			},

			events: {
				/**
				 * This event is triggered when the user presses the filename link.
				 * If this event is provided, it overwrites the default behavior of opening the file.
				 *
				 * @since 1.50.0
				 */
				press: {},

				/**
				 * When a deletePress event handler is attached to the item and the user presses the delete button, this event is triggered.
				 * If this event is triggered, it overwrites the default delete behavior of UploadCollection and the fileDeleted event of UploadCollection is not triggered.
				 *
				 * @since 1.50.0
				 */
				deletePress: {}
			}
		}
	});

	UploadCollectionItem.prototype.init = function() {
		this._mDeprecatedProperties = {};
		this._aManagedInstances = [];
	};

	UploadCollectionItem.prototype.exit = function() {
		for (var i = 0; i < this._aManagedInstances.length; i++) {
			this._aManagedInstances[i].destroy();
		}
	};

	UploadCollectionItem.prototype.setContributor = function(sContributor) {
		if (this.getContributor() !== sContributor) {
			this.setProperty("contributor", sContributor, true);
			this._updateDeprecatedProperties();
		}
		return this;
	};

	UploadCollectionItem.prototype.setUploadedDate = function(sUploadedDate) {
		if (this.getUploadedDate() !== sUploadedDate) {
			this.setProperty("uploadedDate", sUploadedDate, true);
			this._updateDeprecatedProperties();
		}
		return this;
	};

	UploadCollectionItem.prototype.setFileSize = function(sFileSize) {
		if (this.getFileSize() !== sFileSize) {
			this.setProperty("fileSize", sFileSize, true);
			this._updateDeprecatedProperties();
		}
		return this;
	};

	UploadCollectionItem.prototype.setSelected = function(selected) {
		if (this.getSelected() !== selected) {
			this.setProperty("selected", selected, true);
			this.fireEvent("selected");
		}
		return this;
	};

	/**
	 * Downloads the item.
	 * The sap.ui.core.util.File method is used here. For further details on this method, see {sap.ui.core.util.File.save}.
	 * @param {boolean} askForLocation Decides whether to ask for a location to download or not.
	 * @since 1.36.0
	 * @public
	 * @returns {boolean} <code>true</code> if download is possible, otherwise <code>false</code>
	 */
	UploadCollectionItem.prototype.download = function(askForLocation) {
		// File.save doesn't work in Safari but URLHelper.redirect does work.
		// So, this overwrites the value of askForLocation in order to make it work.
		if (Device.browser.name === "sf") {
			askForLocation = false;
		}
		// If there isn't URL, download is not possible
		if (!this.getUrl()) {
			jQuery.sap.log.warning("Items to download do not have a URL.");
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
				FileUtil.save(oBlob, sFileName, sFileExtension, this.getMimeType(), "utf-8");
			}.bind(this);
			oXhr.send();
			return true;
		} else {
			library.URLHelper.redirect(this.getUrl(), true);
			return true;
		}
	};

	/**
	 * Split file name into name and extension.
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
	 * Update deprecated properties aggregation
	 * @private
	 * @since 1.30.0
	 */
	UploadCollectionItem.prototype._updateDeprecatedProperties = function() {
		var aProperties = ["uploadedDate", "contributor", "fileSize"];
		this.removeAllAggregation("_propertyAttributes", true);
		jQuery.each(aProperties, function(i, sName) {
			var sValue = this.getProperty(sName),
				oAttribute = this._mDeprecatedProperties[sName];
			if (jQuery.type(sValue) === "number" && !!sValue || !!sValue) {
				if (!oAttribute) {
					oAttribute = new ObjectAttribute({
						active: false
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
	 * Return all attributes, the deprecated property attributes and the aggregated attributes in one array
	 * @private
	 * @since 1.30.0
	 * @returns {sap.m.ObjectAttribute[]} Mapped properties
	 */
	UploadCollectionItem.prototype.getAllAttributes = function() {
		return this.getAggregation("_propertyAttributes", []).concat(this.getAttributes());
	};

	/**
	 * Creates an instance based on the given module name and settings. The instance is managed by the item lifecycle.
	 * @param {string} name Module name to create an instance from
	 * @param {object} settings Settings which are applied to the instance.
	 * @param {string} getterName Name for generating a getter function.
	 * @private
	 * @returns {sap.ui.base.ManagedObject} Newly created instance
	 */
	UploadCollectionItem.prototype._getControl = function(name, settings, getterName) {
		var fnConstructor = jQuery.sap.getObject(name),
			oInstance = new fnConstructor(settings);
		this._aManagedInstances.push(oInstance);
		if (getterName) {
			this["_get" + getterName] = jQuery.sap.getter(oInstance);
		}
		return oInstance;
	};

	/**
	 * Checks if item can be pressed.
	 * @return {boolean} True if item press is enabled.
	 * @private
	 */
	UploadCollectionItem.prototype._getPressEnabled = function() {
		return this.hasListeners("press") || !!jQuery.trim(this.getUrl());
	};

	return UploadCollectionItem;
});
