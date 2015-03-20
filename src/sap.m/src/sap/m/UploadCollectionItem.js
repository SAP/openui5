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
				 * Attributes of an uploaded item, for example, 'Uploaded By', 'Uploaded On', 'File Size'
				 * Attributes are displayed after an item has been uploaded.
				 * The Active property of sap.m.ObjectAttribute is not supported.
				 * @experimental since version 1.30. The behavior of aggregations might change in the next version.
				 * Note that if one of the deprecated properties contributor, fileSize or UploadedDate is filled in addition to this attribute, two attributes with the same title
				 * are displayed as these properties get displayed as an attribute.
				 * Example: An application passes the property ‘contributor’ with the value ‘A’ and the aggregation attributes ‘contributor’: ‘B’. As a result, the attributes
				 * ‘contributor’:’A’ and ‘contributor’:’B’ are displayed. To make sure the title does not appear twice, check if one of the properties is filled.
				 */
				attributes : {
					type : "sap.m.ObjectAttribute",
					multiple : true
				},
				/**
				 * Statuses of an uploaded item
				 * Statuses will be displayed after an item has been uploaded
				 * @experimental since version 1.30. The behavior might change in the next version.
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
	 * @deprecated
	 */
	UploadCollectionItem.prototype.setContributor = function(sContributor) {
		this._setDeprecatedAttribute.bind(this)(sContributor, "contributor", this._addDeprecatedPropertyContributor);
		this.setProperty("contributor", sContributor, false);
		return this;
	};

	/**
	 * @description Setter of the deprecated uploadedDate property. The property is mapped to the aggregation attributes.
	 * @deprecated
	 */
	UploadCollectionItem.prototype.setUploadedDate = function(sUploadedDate) {
		this._setDeprecatedAttribute.bind(this)(sUploadedDate, "uploadedDate", this._addDecprecatedPropertyUploadedDate);
		this.setProperty("uploadedDate", sUploadedDate, false);
		return this;
	};

	/**
	 * @description Setter of the deprecated fileSize property. The property is mapped to the aggregation attributes.
	 * @deprecated
	 */
	UploadCollectionItem.prototype.setFileSize = function(sFileSize) {
		this._setDeprecatedAttribute.bind(this)(sFileSize, "fileSize", this._addDecprecatedPropertyFileSize);
		this.setProperty("fileSize", sFileSize, false);
		return this;
	};

	/**
	 * @description Creation or update of an item in the aggregation attributes triggered by a deprecated property.
	 * @param {string} [sPropertyValue] Value of the deprecated property
	 * @param {string} [sPropertyName] 	Name of the deprecated property for example, sFileSize
	 * @param {string} [sAddMethodName] Method to create or update the given deprecated property in the aggregation attributes
	 * @private
	 */
	UploadCollectionItem.prototype._setDeprecatedAttribute = function(sPropertyValue, sPropertyName, fnAddMethodName ) {
			if (this._mapDeprecatedProperties[sPropertyName] && 
					this.getAttributes() && this.getAttributes()[this._getPositionOfDeprecatedAttribute(sPropertyName)] && 
					(this._mapDeprecatedProperties[sPropertyName].getText(sPropertyValue) === this.getAttributes()[this._getPositionOfDeprecatedAttribute(sPropertyName)].getText())) {
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
	 */
	UploadCollectionItem.prototype._getPositionOfDeprecatedAttribute = function(sPropertyName) {
		var iPosition;
		switch (sPropertyName) {
			case 'uploadedDate':
				iPosition = 0;
				break;
			case 'contributor':
				iPosition = 1;
				if (!this._mapDeprecatedProperties.uploadedDate) {
					iPosition = 0;
				}
				break;
			case 'fileSize':
				iPosition = 2;
				if (!this._mapDeprecatedProperties.contributor && !this._mapDeprecatedProperties.uploadedDate) {
					iPosition = 0;
				} else if (!this._mapDeprecatedProperties.contributor || !this._mapDeprecatedProperties.uploadedDate) {
					iPosition = 1;
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
	UploadCollectionItem.prototype._addDeprecatedPropertyContributor = function(sContributor) {
		var iPosition = this._getPositionOfDeprecatedAttribute("contributor");
		this._mapDeprecatedProperties.contributor = new ObjectAttribute({
			active : false,
			text : sContributor
		});
		Element.prototype.insertAggregation.apply(this, ["attributes", this._mapDeprecatedProperties.contributor, iPosition, true]);
	};

	/**
	 * @description Creation of an item in the aggregation attributes triggered by a deprecated uploadedDate property.
	 * @param {string} [sUploadedDate] Value of the deprecated uploadedDate property
	 * @private
	 * @experimental
	 */
	UploadCollectionItem.prototype._addDecprecatedPropertyUploadedDate = function(sUploadedDate) {
		var iPosition = this._getPositionOfDeprecatedAttribute("uploadedDate");
		this._mapDeprecatedProperties.uploadedDate = new ObjectAttribute({
			active : false,
			text : sUploadedDate
		});
		Element.prototype.insertAggregation.apply(this, ["attributes", this._mapDeprecatedProperties.uploadedDate, iPosition, true]);
	};

	/**
	 * @description Creation of an item in the aggregation attributes triggered by a deprecated fileSize property.
	 * @param {string} [sFileSize] Value of the deprecated fileSize property
	 * @private
	 */
	UploadCollectionItem.prototype._addDecprecatedPropertyFileSize = function(sFileSize) {
		var iPosition = this._getPositionOfDeprecatedAttribute("fileSize");
		this._mapDeprecatedProperties.fileSize = new ObjectAttribute({
			active : false,
			text : sFileSize
		});
		Element.prototype.insertAggregation.apply(this, ["attributes", this._mapDeprecatedProperties.fileSize, iPosition, true]);
	};

  // addAggregation
	UploadCollectionItem.prototype.addAggregation = function(sAggregationName, oObject, bSuppressInvalidate) {
		if (!sAggregationName || !oObject) {
			return this;
		}
		Element.prototype.addAggregation.apply(this, arguments);
		this._setDeprecatedProprtiesInAggregation.bind(this)("attributes");
		return this;
	};
  // insertAggregation
	UploadCollectionItem.prototype.insertAggregation = function(sAggregationName, oObject, iIndex, bSuppressInvalidate) {
		if (!sAggregationName || !oObject) {
			return this;
		}
		if (sAggregationName === "attributes") {
			this._setDeprecatedProprtiesInAggregation.bind(this)("attributes");
			var iLength = Object.keys(this._mapDeprecatedProperties).length;
			// iIndex could be < 0
			if (iIndex >= 0){
				iIndex = iIndex + iLength;
			} else {
				//in case iLength === 2 means at Position 3 the attribute will be inserted
				iIndex = iLength;
			}
		}
		Element.prototype.insertAggregation.apply(this, [sAggregationName, oObject, iIndex, bSuppressInvalidate]);
		return this;
	};
  // removeAllAggregation
	UploadCollectionItem.prototype.removeAllAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (!sAggregationName) {
			return this;
		}
		Element.prototype.removeAllAggregation.apply(this, arguments);
		this._setDeprecatedProprtiesInAggregation.bind(this)("attributes");
		return this;
	};
  // removeAggregation
	UploadCollectionItem.prototype.removeAggregation = function (sAggregationName, vObject, bSuppressInvalidate) {
		if (!sAggregationName || !vObject) {
			return this;
		}
		Element.prototype.removeAggregation.apply(this, arguments);
		this._setDeprecatedProprtiesInAggregation.bind(this)("attributes");
		return this;
	};
  // destroyAggregation
	UploadCollectionItem.prototype.destroyAggregation = function (sAggregationName, bSuppressInvalidate) {
		if (!sAggregationName) {
			return this;
		}
		Element.prototype.destroyAggregation.apply(this, arguments);
		this._setDeprecatedProprtiesInAggregation.bind(this)(sAggregationName);
		return this;
	};

	/**
	 * @description Deprecated properties will be set to the aggregation attributes.
	 * @param {string} [sAggregationName] Name of the aggregation
	 * @private
	 * @experimental
	 */
	UploadCollectionItem.prototype._setDeprecatedProprtiesInAggregation = function (sAggregationName) {
		if (sAggregationName === "attributes") {
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

  // addAttributes
	UploadCollectionItem.prototype.addAttribute = function (oObject) {
		this.addAggregation.bind(this)("attributes", oObject, false);
		return this;
	};

  // insertAttributes
	UploadCollectionItem.prototype.insertAttribute = function(oObject, iIndex, bSuppressInvalidate) {
		this.insertAggregation.bind(this)("attributes", oObject, iIndex, bSuppressInvalidate);
		return this;
	};

  // removeAllAttributes
	UploadCollectionItem.prototype.removeAllAttributes = function () {
		this.removeAllAggregation.bind(this)("attributes", false);
		return this;
	};

  // removeAttributes
	UploadCollectionItem.prototype.removeAttribute = function (vObject, bSuppressInvalidate) {
		this.removeAggregation.bind(this)("attributes", vObject, bSuppressInvalidate);
		return this;
	};

  // destroyAttributes
	UploadCollectionItem.prototype.destroyAttributes = function () {
		this.destroyAggregation.bind(this)("attributes", false);
		return this;
	};

	return UploadCollectionItem;

}, /* bExport= */true);
