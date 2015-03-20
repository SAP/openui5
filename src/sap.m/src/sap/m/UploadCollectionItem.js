/*!
 * ${copyright}
 */

// Provides control sap.m.UploadCollectionItem.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Element', 'sap/m/ObjectAttribute', 'sap/m/ObjectStatus'],
	function(jQuery, library, Element, ObjectAttribute, ObjectStatus) {
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

	UploadCollectionItem.prototype.init = function() {
		this._mapDeprecatedProperties = {};
	};

	/**
	 * @description Setter of the deprecated contributor property. The property is mapped to the aggregation attributes.
	 * @experimental
	 * @deprecated
	 */
	UploadCollectionItem.prototype.setContributor = function(sContributor) {
		this._setDeprecatedAttribute.bind(this)(sContributor, "contributor", this._addDecprecatedPropertyContributor);
		this.setProperty("contributor", sContributor, false);
	};

	/**
	 * @description Setter of the deprecated uploadedDate property. The property is mapped to the aggregation attributes.
	 * @experimental
	 * @deprecated
	 */
	UploadCollectionItem.prototype.setUploadedDate = function(sUploadedDate) {
		this._setDeprecatedAttribute.bind(this)(sUploadedDate, "uploadedDate", this._addDecprecatedPropertyUploadedDate);
		this.setProperty("uploadedDate", sUploadedDate, false);
	};

	/**
	 * @description Setter of the deprecated fileSize property. The property is mapped to the aggregation attributes.
	 * @experimental
	 * @deprecated
	 */
	UploadCollectionItem.prototype.setFileSize = function(sFileSize) {
		this._setDeprecatedAttribute.bind(this)(sFileSize, "fileSize", this._addDecprecatedPropertyFileSize);
		this.setProperty("fileSize", sFileSize, false);
	};

	/**
	 * @description Creation or update of an item in the aggregation attributes triggered by a deprecated property.
	 * @param {string} [sPropertyValue] Value of the deprecated property
	 * @param {string} [sPropertyName] 	Name of the deprecated property for example, sFileSize
	 * @param {string} [sAddMethodName] Method to create or update the given deprecated property in the aggregation attributes
	 * @private
	 * @experimental
	 */
	UploadCollectionItem.prototype._setDeprecatedAttribute = function(sPropertyValue, sPropertyName, fnAddMethodName ) {
			if (this._mapDeprecatedProperties[sPropertyName] && this.getAttributes() && this.getAttributes()[this._getPositionOfDeprecatedAttribute(sPropertyName, fnAddMethodName)] && (this._mapDeprecatedProperties[sPropertyName].getText(sPropertyValue) === this.getAttributes()[this._getPositionOfDeprecatedAttribute(sPropertyName, fnAddMethodName)].getText())) {
				//overwriting existing value
				this._mapDeprecatedProperties[sPropertyName].setText(sPropertyValue);
			} else {
				//new item
				fnAddMethodName.bind(this)(sPropertyValue);
			}
	};

	/**
	 * @description Determines the position of the deprecated property in the attributes aggregation.
	 * @param {string} [sPropertyName] 	Name of the deprecated property for example, sFileSize
	 * @param {string} [sAddMethodName] Method to create or update the given deprecated property in the aggregation attributes
	 * @private
	 * @experimental
	 */
	UploadCollectionItem.prototype._getPositionOfDeprecatedAttribute = function( sPropertyName) {
		var iPosition = 0;
		switch (sPropertyName) {
			case 'uploadedDate' :
				iPosition = 1;
				if (!this._mapDeprecatedProperties.contributor) {
					iPosition = 0;
				}
				break;
			case 'fileSize' :
				iPosition = 1;
				if (this._mapDeprecatedProperties.contributor && this._mapDeprecatedProperties.uploadedDate) {
					iPosition = 2;
				} else if (!this._mapDeprecatedProperties.contributor && !this._mapDeprecatedProperties.uploadedDate) {
					iPosition = 0;
				}
				break;
		}
		return iPosition;
	};

	/**
	 * @description Creation of an item in the aggregation attributes triggered by a deprecated contributor property.
	 * @param {string} [sContributor] Value of the deprecated contributor property
	 * @private
	 * @experimental
	 */
	UploadCollectionItem.prototype._addDecprecatedPropertyContributor = function(sContributor) {
		this._mapDeprecatedProperties.contributor = new ObjectAttribute({
			active : false,
			text : sContributor
		});
		return Element.prototype.insertAggregation.apply(this, ["attributes", this._mapDeprecatedProperties.contributor, 0, true]);
	};

	/**
	 * @description Creation of an item in the aggregation attributes triggered by a deprecated uploadedDate property.
	 * @param {string} [sUploadedDate] Value of the deprecated uploadedDate property
	 * @private
	 * @experimental
	 */
	UploadCollectionItem.prototype._addDecprecatedPropertyUploadedDate = function(sUploadedDate) {
		var iPosition = 0;
		this._mapDeprecatedProperties.uploadedDate = new ObjectAttribute({
			active : false,
			text : sUploadedDate
		});
		//Determine the position of the uploadedDate attribute
		if (this._mapDeprecatedProperties.contributor) {
			iPosition = 1;
		}
		return Element.prototype.insertAggregation.apply(this, ["attributes", this._mapDeprecatedProperties.uploadedDate, iPosition, true]);
	};

	/**
	 * @description Creation of an item in the aggregation attributes triggered by a deprecated fileSize property.
	 * @param {string} [sFileSize] Value of the deprecated fileSize property
	 * @private
	 * @experimental
	 */
	UploadCollectionItem.prototype._addDecprecatedPropertyFileSize = function(sFileSize) {
		var iPosition = 1;
		this._mapDeprecatedProperties.fileSize = new ObjectAttribute({
			active : false,
			text : sFileSize
		});
		//Determines the position of the fileSize attribute; default is position 1
		if (this._mapDeprecatedProperties.contributor && this._mapDeprecatedProperties.uploadedDate) {
				iPosition = 2;
		} else if (!this._mapDeprecatedProperties.contributor && !this._mapDeprecatedProperties.uploadedDate) {
				iPosition = 0;
		}
		return Element.prototype.insertAggregation.apply(this, ["attributes", this._mapDeprecatedProperties.fileSize, iPosition, true]);
	};
//addAggregation
	UploadCollectionItem.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		if (!sAggregationName || !oObject) {
			return this;
		}
		var oElement = Element.prototype.addAggregation.apply(this, arguments);
		this._setDeprecatedProprtiesInAggregation.bind(this)("attributes");
		return oElement;
	};
//insertAggregation
	UploadCollectionItem.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (!sAggregationName || !oObject) {
			return this;
		}
		if (sAggregationName == "attributes") {
			this._setDeprecatedProprtiesInAggregation.bind(this)("attributes");
			var iLength = Object.keys(this._mapDeprecatedProperties).length;
			if (iLength >= 0 && iIndex >= 0){
				iIndex = iIndex + iLength;
			} else {
				//in case iLength == 2 means at Position 3 the attribute will be inserted
				iIndex = iLength;
			}
		}

		var oElement = Element.prototype.insertAggregation.apply(this, [sAggregationName, oObject, iIndex, bSuppressInvalidate]);
		return oElement;
	};
//removeAllAggregation
	UploadCollectionItem.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (!sAggregationName) {
			return this;
		}
		var oElement = Element.prototype.removeAllAggregation.apply(this, arguments);
		this._setDeprecatedProprtiesInAggregation.bind(this)("attributes");
		return oElement;
	};
//removeAggregation
	UploadCollectionItem.prototype.removeAggregation = function (sAggregationName, vObject, bSuppressInvalidate) {
		if (!sAggregationName || !vObject) {
			return this;
		}
		var oElement = Element.prototype.removeAggregation.apply(this, arguments);
		this._setDeprecatedProprtiesInAggregation.bind(this)("attributes");
		return oElement;
	};
//destroyAggregation
	UploadCollectionItem.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (!sAggregationName) {
			return this;
		}
		var oElement = Element.prototype.destroyAggregation.apply(this, arguments);
		this._setDeprecatedProprtiesInAggregation.bind(this)(sAggregationName);
		return oElement;
	};

	/**
	 * @description Deprecated properties will be set to the aggregation attributes.
	 * @param {string} [sAggregationName] Name of the aggregation
	 * @private
	 * @experimental
	 */
	UploadCollectionItem.prototype._setDeprecatedProprtiesInAggregation = function (sAggregationName) {
		if (sAggregationName == "attributes") {
			//contributor
			if (this.getContributor()) {
				this.setContributor.bind(this)(this.getContributor());
			}
			//uploadedDate
			if (this.getUploadedDate()) {
				this.setUploadedDate.bind(this)(this.getUploadedDate());
			}
			//fileSize
			if (this.getFileSize()) {
				this.setFileSize.bind(this)(this.getFileSize());
			}
		}
	};

//addAttributes
	UploadCollectionItem.prototype.addAttribute = function (oObject) {
		this.addAggregation.bind(this)("attributes", oObject, false);
	};

//insertAttributes
	UploadCollectionItem.prototype.insertAttribute = function(oObject, iIndex, bSuppressInvalidate) {
		this.insertAggregation.bind(this)("attributes", oObject, iIndex, bSuppressInvalidate);
	};

//removeAllAttributes
	UploadCollectionItem.prototype.removeAllAttributes = function () {
		this.removeAllAggregation.bind(this)("attributes", false);
	};

//removeAttributes
	UploadCollectionItem.prototype.removeAttribute = function (vObject, bSuppressInvalidate) {
		this.removeAggregation.bind(this)("attributes", vObject, bSuppressInvalidate);
	};

//destroyAttributes
	UploadCollectionItem.prototype.destroyAttributes = function () {
		this.destroyAggregation.bind(this)("attributes", false);
	};

	return UploadCollectionItem;

}, /* bExport= */true);
