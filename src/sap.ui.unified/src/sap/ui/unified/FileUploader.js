/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.FileUploader.
sap.ui.define([
	'sap/ui/core/Control',
	'./library',
	'sap/ui/core/LabelEnablement',
	'sap/ui/core/library',
	'sap/ui/Device',
	'./FileUploaderRenderer',
	'sap/ui/dom/containsOrEquals',
	'sap/ui/events/KeyCodes',
	'sap/base/Log',
	'sap/base/security/encodeXML',
	"sap/ui/thirdparty/jquery",
	// jQuery Plugin "addAriaDescribedBy"
	'sap/ui/dom/jquery/Aria'
], function(
	Control,
	library,
	LabelEnablement,
	coreLibrary,
	Device,
	FileUploaderRenderer,
	containsOrEquals,
	KeyCodes,
	Log,
	encodeXML,
	jQuery
) {
	"use strict";



	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;



	/**
	 * Constructor for a new <code>FileUploader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The framework generates an input field and a button with text "Browse ...".
	 * The API supports features such as on change uploads (the upload starts immediately after
	 * a file has been selected), file uploads with explicit calls, adjustable control sizes,
	 * text display after uploads, or tooltips containing complete file paths.
	 *
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/upload-collection/ Upload Collection}
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent, sap.ui.unified.IProcessableBlobs
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.unified.FileUploader
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FileUploader = Control.extend("sap.ui.unified.FileUploader", /** @lends sap.ui.unified.FileUploader.prototype */ { metadata : {

		interfaces : ["sap.ui.core.IFormContent", "sap.ui.unified.IProcessableBlobs"],
		library : "sap.ui.unified",
		designtime: "sap/ui/unified/designtime/FileUploader.designtime",
		properties : {

			/**
			 * Value of the path for file upload.
			 */
			value : {type : "string", group : "Data", defaultValue : ''},

			/**
			 * Disabled controls have different colors, depending on customer settings.
			 */
			enabled : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Used when URL address is on a remote server.
			 */
			uploadUrl : {type : "sap.ui.core.URI", group : "Data", defaultValue : ''},

			/**
			 * Unique control name for identification on the server side after sending data to the server.
			 */
			name : {type : "string", group : "Data", defaultValue : null},

			/**
			 * Specifies the displayed control width.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : ''},

			/**
			 * If set to "true", the upload immediately starts after file selection.
			 * With the default setting, the upload needs to be explicitly triggered.
			 */
			uploadOnChange : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Additional data that is sent to the back end service.
			 *
			 * Data will be transmitted as value of a hidden input where the name is derived from the
			 * <code>name</code> property with suffix "-data".
			 */
			additionalData : {type : "string", group : "Data", defaultValue : null},

			/**
			 * If the FileUploader is configured to upload the file directly after the file is selected,
			 * it is not allowed to upload a file with the same name again. If a user should be allowed
			 * to upload a file with the same name again this parameter has to be "true".
			 *
			 * A typical use case would be if the files have different paths.
			 */
			sameFilenameAllowed : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * The button's text can be overwritten using this property.
			 */
			buttonText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * The chosen files will be checked against an array of file types.
			 *
			 * If at least one file does not fit the file type restriction, the upload is prevented.
			 * <b>Note:</b> This property is not supported by Edge.
			 *
			 * Example: <code>["jpg", "png", "bmp"]</code>.
			 */
			fileType : {type : "string[]", group : "Data", defaultValue : null},

			/**
			 * Allows multiple files to be chosen and uploaded from the same folder.
			 *
			 * This property is not supported by Internet Explorer 9.
			 *
			 * <b>Note:</b> Keep in mind that the various operating systems for mobile devices
			 * can react differently to the property so that fewer upload functions may be
			 * available in some cases.
			 */
			multiple : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * A file size limit in megabytes which prevents the upload if at least one file exceeds it.
			 *
			 * This property is not supported by Internet Explorer 9.
			 */
			maximumFileSize : {type : "float", group : "Data", defaultValue : null},

			/**
			 * The chosen files will be checked against an array of mime types.
			 *
			 * If at least one file does not fit the mime type restriction, the upload is prevented.
			 * <b>Note:</b> This property is not supported by Internet Explorer & Edge.
			 *
			 * Example: <code>["image/png", "image/jpeg"]</code>.
			 */
			mimeType : {type : "string[]", group : "Data", defaultValue : null},

			/**
			 * If set to "true", the request will be sent as XHR request instead of a form submit.
			 *
			 * This property is not supported by Internet Explorer 9.
			 */
			sendXHR : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Placeholder for the text field.
			 */
			placeholder : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * Style of the button.
			 *
			 * Values "Transparent, "Accept", "Reject", or "Emphasized" are allowed.
			 */
			style : {type : "string", group : "Appearance", defaultValue : null},

			/**
			 * If set to "true", the <code>FileUploader</code> will be rendered as Button only,
			 * without showing the input field.
			 */
			buttonOnly : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If set to "false", the request will be sent as file only request instead of a multipart/form-data request.
			 *
			 * Only one file could be uploaded using this type of request. Required for sending such a request is
			 * to set the property <code>sendXHR</code> to "true". This property is not supported by Internet Explorer 9.
			 */
			useMultipart : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * The maximum length of a filename which the <code>FileUploader</code> will accept.
			 *
			 * If the maximum filename length is exceeded, the corresponding event <code>filenameLengthExceed</code> is fired.
			 * @since 1.24.0
			 */
			maximumFilenameLength : {type : "int", group : "Data", defaultValue : null},

			/**
			 * Visualizes warnings or errors related to the text field.
			 *
			 * Possible values: Warning, Error, Success, None.
			 * @since 1.24.0
			 */
			valueState : {type : "sap.ui.core.ValueState", group : "Data", defaultValue : ValueState.None},

			/**
			 * Custom text for the value state message pop-up.
			 *
			 * <b>Note:</b> If not specified, a default text, based on the value state type, will be used instead.
			 * @since 1.52
			 */
			valueStateText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Icon to be displayed as graphical element within the button.
			 *
			 * This can be a URI to an image or an icon font URI.
			 * @since 1.26.0
			 */
			icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''},

			/**
			 * Icon to be displayed as graphical element within the button when it is hovered (only if also a base icon was specified).
			 *
			 * If not specified, the base icon is used. If an icon font icon is used, this property is ignored.
			 * @since 1.26.0
			 */
			iconHovered : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''},

			/**
			 * Icon to be displayed as graphical element within the button when it is selected (only if also a base icon was specified).
			 *
			 * If not specified, the base or hovered icon is used. If an icon font icon is used, this property is ignored.
			 * @since 1.26.0
			 */
			iconSelected : {type : "sap.ui.core.URI", group : "Appearance", defaultValue : ''},

			/**
			 * If set to true (default), the display sequence is 1. icon 2. control text.
			 * @since 1.26.0
			 */
			iconFirst : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set to true, the button is displayed without any text.
			 * @since 1.26.0
			 */
			iconOnly : {type : "boolean", group : "Appearance", defaultValue : false}
		},
		aggregations : {

			/**
			 * The parameters for the <code>FileUploader</code> which are rendered as a hidden input field.
			 * @since 1.12.2
			 */
			parameters : {type : "sap.ui.unified.FileUploaderParameter", multiple : true, singularName : "parameter"},

			/**
			 * The header parameters for the <code>FileUploader</code> which are only submitted with XHR requests.
			 * Header parameters are not supported by Internet Explorer 9.
			 */
			headerParameters : {type : "sap.ui.unified.FileUploaderParameter", multiple : true, singularName : "headerParameter"},

			/**
			 * Settings for the <code>XMLHttpRequest</code> object.
			 * <b>Note:</b> This aggregation is only used when the <code>sendXHR</code> property is set to <code>true</code>.
			 * @since 1.52
			 */
			xhrSettings : {type : "sap.ui.unified.FileUploaderXHRSettings", multiple : false}
		},
		associations : {

			/**
			 * Association to controls / IDs which describe this control (see WAI-ARIA attribute <code>aria-describedby</code>).
			 */
			ariaDescribedBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaDescribedBy"},

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute <code>aria-labelledby</code>).
			 */
			ariaLabelledBy: {type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy"}
		},
		events : {

			/**
			 * Event is fired when the value of the file path has been changed.
			 *
			 * <b>Note:</b> Keep in mind that because of the HTML input element of type file, the
			 * event is also fired in Chrome browser when the Cancel button of the
			 * uploads window is pressed.
			 */
			change : {
				parameters : {

					/**
					 * New file path value.
					 */
					newValue : {type : "string"},

					/**
					 * Files.
					 */
					files : {type : "object[]"}
				}
			},

			/**
			 * Event is fired as soon as the upload request is completed (either successful or unsuccessful).
			 *
			 * To see if the upload request was successful, check the <code>status</code> parameter for a value 2xx.
			 * The actual progress of the upload can be monitored by listening to the <code>uploadProgress</code> event.
			 * However, this covers only the client side of the upload process and does not give any success status
			 * from the server.
			 */
			uploadComplete : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * Response message which comes from the server.
					 *
					 * On the server side this response has to be put within the &quot;body&quot; tags of the response
					 * document of the iFrame. It can consist of a return code and an optional message. This does not
					 * work in cross-domain scenarios.
					 */
					response : {type : "string"},

					/**
					 * ReadyState of the XHR request.
					 *
					 * Required for receiving a <code>readyStateXHR</code> is to set the property <code>sendXHR</code>
					 * to true. This property is not supported by Internet Explorer 9.
					 */
					readyStateXHR : {type : "string"},

					/**
					 * Status of the XHR request.
					 *
					 * Required for receiving a <code>status</code> is to set the property <code>sendXHR</code> to true.
					 * This property is not supported by Internet Explorer 9.
					 */
					status : {type : "string"},

					/**
					 * Http-Response which comes from the server.
					 *
					 * Required for receiving <code>responseRaw</code> is to set the property <code>sendXHR</code> to true.
					 *
					 * This property is not supported by Internet Explorer 9.
					 */
					responseRaw : {type : "string"},

					/**
					 * Http-Response-Headers which come from the server.
					 *
					 * Provided as a JSON-map, i.e. each header-field is reflected by a property in the <code>headers</code>
					 * object, with the property value reflecting the header-field's content.
					 *
					 * Required for receiving <code>headers</code> is to set the property <code>sendXHR</code> to true.
					 * This property is not supported by Internet Explorer 9.
					 */
					headers : {type : "object"},

					/**
					 * Http-Request-Headers.
					 *
					 * Required for receiving <code>requestHeaders</code> is to set the property <code>sendXHR</code> to true.
					 * This property is not supported by Internet Explorer 9.
					 */
					requestHeaders : {type : "object[]"}
				}
			},

			/**
			 * Event is fired when the type of a file does not match the <code>mimeType</code> or <code>fileType</code> property.
			 */
			typeMissmatch : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * The file ending of a file to be uploaded.
					 */
					fileType : {type : "string"},

					/**
					 * The MIME type of a file to be uploaded.
					 */
					mimeType : {type : "string"}
				}
			},

			/**
			 * Event is fired when the size of a file is above the <code>maximumFileSize</code> property.
			 * This event is not supported by Internet Explorer 9 (same restriction as for the property
			 * <code>maximumFileSize</code>).
			 */
			fileSizeExceed : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * The size in MB of a file to be uploaded.
					 */
					fileSize : {type : "string"}
				}
			},

			/**
			 * Event is fired when the size of the file is 0
			 */
			fileEmpty : {
				parameters : {

					/**
					 * The name of the file to be uploaded.
					 */
					fileName: {type : "string"}
				}
			},

			/**
			 * Event is fired when the file is allowed for upload on client side.
			 */
			fileAllowed : {},

			/**
			 * Event is fired after the upload has started and before the upload is completed.
			 *
			 * It contains progress information related to the running upload. Depending on file size, band width
			 * and used browser the event is fired once or multiple times.
			 *
			 * This event is only supported with property <code>sendXHR</code> set to true, i.e. the event is not
			 * supported in Internet Explorer 9.
			 *
			 * @since 1.24.0
			 */
			uploadProgress : {
				parameters : {

					/**
					 * Indicates whether or not the relative upload progress can be calculated out of loaded and total.
					 */
					lengthComputable : {type : "boolean"},

					/**
					 * The number of bytes of the file which have been uploaded by the time the event was fired.
					 */
					loaded : {type : "float"},

					/**
					 * The total size of the file to be uploaded in bytes.
					 */
					total : {type : "float"},

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * Http-Request-Headers.
					 *
					 * Required for receiving <code>requestHeaders</code> is to set the property <code>sendXHR</code> to true.
					 * This property is not supported by Internet Explorer 9.
					 */
					requestHeaders : {type : "object[]"}
				}
			},

			/**
			 * Event is fired after the current upload has been aborted.
			 *
			 * This event is only supported with property <code>sendXHR</code> set to true, i.e. the event is not supported
			 * in Internet Explorer 9.
			 * @since 1.24.0
			 */
			uploadAborted : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * Http-Request-Headers.
					 *
					 * Required for receiving <code>requestHeader</code> is to set the property <code>sendXHR</code> to true.
					 * This property is not supported by Internet Explorer 9.
					 */
					requestHeaders : {type : "object[]"}
				}
			},

			/**
			 * Event is fired, if the filename of a chosen file is longer than the value specified with the
			 * <code>maximumFilenameLength</code> property.
			 * @since 1.24.0
			 */
			filenameLengthExceed : {
				parameters : {

					/**
					 * The filename, which is longer than specified by the value of the property <code>maximumFilenameLength</code>.
					 */
					fileName : {type : "string"}
				}
			},

			/**
			 * Event is fired before an upload is started.
			 * @since 1.30.0
			 */
			uploadStart : {
				parameters : {

					/**
					 * The name of a file to be uploaded.
					 */
					fileName : {type : "string"},

					/**
					 * Http-Request-Headers.
					 *
					 * Required for receiving <code>requestHeaders</code> is to set the property <code>sendXHR</code>
					 * to true. This property is not supported by Internet Explorer 9.
					 */
					requestHeaders : {type : "object[]"}
				}
			}
		}
	}});


	/**
	 * Initializes the control.
	 * It is called from the constructor.
	 * @private
	 */
	FileUploader.prototype.init = function(){
		var that = this;
		// load the respective UI-Elements from the FileUploaderHelper
		this.oFilePath = library.FileUploaderHelper.createTextField(this.getId() + "-fu_input").addEventDelegate({
			onAfterRendering: function () {
				if (that.getWidth()) {
					that._resizeDomElements();
				}
			}
		});
		this.oBrowse = library.FileUploaderHelper.createButton(this.getId() + "-fu_button");
		this.oFilePath.setParent(this);
		this.oBrowse.setParent(this);

		this.oFileUpload = null;

		// check if sap.m library is used
		this.bMobileLib = this.oBrowse.getMetadata().getName() == "sap.m.Button";

		//retrieving the default browse button text from the resource bundle
		if (!this.getIconOnly()) {
			this.oBrowse.setText(this.getBrowseText());
		}else {
			this.oBrowse.setTooltip(this.getBrowseText());
		}

		if (sap.ui.getCore().getConfiguration().getAccessibility()) {
			if (!FileUploader.prototype._sAccText) {
				var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
				FileUploader.prototype._sAccText = rb.getText("FILEUPLOAD_ACC");
			}
			if (this.oBrowse.addAriaDescribedBy) {
				this.oBrowse.addAriaDescribedBy(this.getId() + "-AccDescr");
			}
		}

	};

	FileUploader.prototype.setButtonText = function(sText) {
		this.setProperty("buttonText", sText, false);
		if (!this.getIconOnly()) {
			this.oBrowse.setText(sText || this.getBrowseText());
		}else {
			this.oBrowse.setTooltip(sText || this.getBrowseText());
		}
		return this;
	};

	FileUploader.prototype.setIcon = function(sIcon) {
		this.oBrowse.setIcon(sIcon);
		this.setProperty("icon", sIcon, false);
		return this;
	};

	FileUploader.prototype.setIconHovered = function(sIconHovered) {
		this.setProperty("iconHovered", sIconHovered, false);
		if (this.oBrowse.setIconHovered) {
			this.oBrowse.setIconHovered(sIconHovered);
		}
		return this;
	};

	FileUploader.prototype.setIconSelected = function(sIconSelected) {
		this.setProperty("iconSelected", sIconSelected, false);
		if (this.oBrowse.setIconSelected) {
			this.oBrowse.setIconSelected(sIconSelected);
		} else {
			this.oBrowse.setActiveIcon(sIconSelected);
		}
		return this;
	};

	FileUploader.prototype.setIconFirst = function(bIconFirst) {
		this.oBrowse.setIconFirst(bIconFirst);
		this.setProperty("iconFirst", bIconFirst, false);
		return this;
	};

	FileUploader.prototype.setIconOnly = function(bIconOnly) {
		this.setProperty("iconOnly", bIconOnly, false);
		if (bIconOnly) {
			this.oBrowse.setText("");
			this.oBrowse.setTooltip(this.getButtonText() || this.getBrowseText());
		}else {
			this.oBrowse.setText(this.getButtonText() || this.getBrowseText());
			this.oBrowse.setTooltip("");
		}
		return this;
	};

	FileUploader.prototype.getIdForLabel = function () {
		return this.oBrowse.getId();
	};

	/**
	 * Ensures that FileUploader's internal button will have a reference back to the labels, by which
	 * the FileUploader is labelled
	 *
	 * @returns {sap.ui.unified.FileUploader} For chaining
	 * @private
	 */
	FileUploader.prototype._ensureBackwardsReference = function () {
		var oInternalButton = this.oBrowse,
			aInternalButtonAriaLabelledBy = oInternalButton.getAriaLabelledBy(),
			aReferencingLabels = LabelEnablement.getReferencingLabels(this);

		if (aInternalButtonAriaLabelledBy) {
			aReferencingLabels.forEach(function (sLabelId) {
				if (aInternalButtonAriaLabelledBy.indexOf(sLabelId) === -1) {
					oInternalButton.addAriaLabelledBy(sLabelId);
				}
			});
		}

		return this;
	};

	FileUploader.prototype.setFileType = function(vTypes) {
		// Compatibility issue: converting the given types to an array in case it is a string
		var aTypes = this._convertTypesToArray(vTypes);
		this.setProperty("fileType", aTypes, false);
		return this;
	};

	FileUploader.prototype.setMimeType = function(vTypes) {
		// Compatibility issue: converting the given types to an array in case it is a string
		var aTypes = this._convertTypesToArray(vTypes);
		this.setProperty("mimeType", aTypes, false);
		return this;
	};

	FileUploader.prototype.setTooltip = function(oTooltip) {
		var sTooltip,
			sapUiFupInputMaskDOM;

		this._refreshTooltipBaseDelegate(oTooltip);
		this.setAggregation("tooltip", oTooltip, true);
		this._updateAccDescription();

		if (this.oFileUpload) {
			sTooltip = this.getTooltip_AsString();
			sapUiFupInputMaskDOM = this.$().find(".sapUiFupInputMask")[0];

			if (sTooltip) {
				this.oFileUpload.setAttribute("title", sTooltip);
				sapUiFupInputMaskDOM && sapUiFupInputMaskDOM.setAttribute("title", sTooltip);
			} else {
				this.oFileUpload.removeAttribute("title");
				sapUiFupInputMaskDOM && sapUiFupInputMaskDOM.removeAttribute("title");
			}
		}
		return this;
	};

	FileUploader.prototype.addAriaLabelledBy = function(sID) {
		this.addAssociation("ariaLabelledBy", sID);
		this.oBrowse.addAriaLabelledBy(sID);

		return this;
	};

	FileUploader.prototype.removeAriaLabelledBy = function(sID) {
		var sLabelId = this.removeAssociation("ariaLabelledBy", sID);
		this.oBrowse.removeAriaLabelledBy(sLabelId);

		return sLabelId;
	};

	FileUploader.prototype.removeAllAriaLabelledBy = function() {
		var aLabelIds = this.removeAllAssociation("ariaLabelledBy"),
			aButtonLabels = this.oBrowse.getAriaLabelledBy();

		// We make sure to leave any sap.m.Label in the button's ariaLabelledBy
		aLabelIds.forEach(function(sLabelId) {
			if (aButtonLabels.indexOf(sLabelId) >= 0) {
				this.oBrowse.removeAriaLabelledBy(sLabelId);
			}
		}.bind(this));

		return aLabelIds;
	};

	FileUploader.prototype.addAriaDescribedBy = function(sID) {
		this.addAssociation("ariaDescribedBy", sID);
		this.oBrowse.addAriaDescribedBy(sID);

		return this;
	};

	FileUploader.prototype.removeAriaDescribedBy = function(sID) {
		var sDescriptionId = this.removeAssociation("ariaDescribedBy", sID);
		this.oBrowse.removeAriaDescribedBy(sDescriptionId);

		return sDescriptionId;
	};

	FileUploader.prototype.removeAllAriaDescribedBy = function() {
		var aDescriptionIds = this.removeAllAssociation("ariaDescribedBy"),
			aButtonDescriptionIds = this.oBrowse.getAriaDescribedBy();

		// Keep the default accessibility description in the -AccDescr element
		aDescriptionIds.forEach(function(sLabelId) {
			if (aButtonDescriptionIds.indexOf(sLabelId) >= 0) {
				this.oBrowse.removeAriaDescribedBy(sLabelId);
			}
		}.bind(this));

		return aDescriptionIds;
	};

	/*
	 * Generates the text, which would be placed as an accessibility description,
	 * based on the current FileUploader's placeholder, value and tooltip.
	 */
	FileUploader.prototype._generateAccDescriptionText = function () {
		var sTooltip = this.getTooltip_AsString(),
			sPlaceholder = this.getPlaceholder(),
			sValue = this.getValue(),
			sAccDescription = "";

		if (sTooltip) {
			sAccDescription += sTooltip + " ";
		}

		if (sValue) {
			sAccDescription += sValue + " ";
		} else if (sPlaceholder) {
			sAccDescription += sPlaceholder + " ";
		}

		sAccDescription += this._sAccText;

		return sAccDescription;
	};

	/*
	 * Updates the hidden element's text, which holds the accessibility description.
	 * This method should be called whenever the placeholder/value/tooltip update.
	 * Otherwise screen readers will simply read a description, which doesn't match
	 * what's visible on the screen.
	 */
	FileUploader.prototype._updateAccDescription = function () {
		var oAccDescriptionHolder = document.getElementById(this.getId() + "-AccDescr"),
			sNewDescription = this._generateAccDescriptionText();

		if (oAccDescriptionHolder) {
			oAccDescriptionHolder.innerHTML = encodeXML(sNewDescription);
		}
	};

	/**
	 * Helper to ensure, that the types (file or mime) are inside an array.
	 * The FUP also accepts comma-separated strings for its fileType and mimeType property.
	 * @private
	 */
	FileUploader.prototype._convertTypesToArray = function (vTypes) {
		if (typeof vTypes === "string") {
			if (vTypes === "") {
				return [];
			} else {
				return vTypes.split(",").map(function (sType) {
					return sType.trim();
				});
			}
		}
		return vTypes;
	};

	/**
	 * Terminates the control when it has been destroyed.
	 * @private
	 */
	FileUploader.prototype.exit = function(){

		// destroy the nested controls
		this.oFilePath.destroy();
		this.oBrowse.destroy();

		// remove the IFRAME
		if (this.oIFrameRef) {
			jQuery(this.oIFrameRef).unbind();
			sap.ui.getCore().getStaticAreaRef().removeChild(this.oIFrameRef);
			this.oIFrameRef = null;
		}

	};

	/**
	 * Clean up event listeners before rendering
	 * @private
	 */
	FileUploader.prototype.onBeforeRendering = function() {

		// store the file uploader outside in the static area
		var oStaticArea = sap.ui.getCore().getStaticAreaRef();
		jQuery(this.oFileUpload).appendTo(oStaticArea);

		// unbind the custom event handlers
		jQuery(this.oFileUpload).unbind();

	};

	/**
	 * Prepare the upload processing, establish the change handler for the
	 * pure html input object.
	 * @private
	 */
	FileUploader.prototype.onAfterRendering = function() {
		// prepare the file upload control and the upload iframe
		this.prepareFileUploadAndIFrame();

		this._cacheDOMEls();
		this._addLabelFeaturesToBrowse();

		// event listener registration for change event
		jQuery(this.oFileUpload).change(jQuery.proxy(this.handlechange, this));

		if (!this.bMobileLib) {
			this.oFilePath.$().attr("tabindex", "-1");
		} else {
			this.oFilePath.$().find('input').attr("tabindex", "-1");
		}
		// in case of IE9 we prevent the browse button from being focused because the
		// native file uploader requires the focus for catching the keyboard events
		if ((!!Device.browser.internet_explorer && Device.browser.version == 9)) {
			this.oBrowse.$().attr("tabindex", "-1");
		}

		if (LabelEnablement.isRequired(this)) {
			this.oBrowse.$().attr("aria-required", "true");
		}

		setTimeout(this._recalculateWidth.bind(this), 0);

		this.oFilePath.$().find('input').removeAttr("role").attr("aria-live", "polite");

		if (this.getValueState() == ValueState.Error) {
			this.oBrowse.$().attr("aria-invalid", "true");
		}

	};


	FileUploader.prototype._cacheDOMEls = function() {
		this.FUEl = this.getDomRef("fu");
		this.FUDataEl = this.getDomRef("fu_data");
	};

	FileUploader.prototype.onfocusin = function(oEvent) {

		if (!this.oFilePath.shouldValueStateMessageBeOpened || this.oFilePath.shouldValueStateMessageBeOpened()) {
			this.openValueStateMessage();
		}

	};

	FileUploader.prototype.onsapfocusleave = function(oEvent) {

		if (!oEvent.relatedControlId || !containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
			this.closeValueStateMessage();
		}

	};

	FileUploader.prototype._recalculateWidth = function() {
		// calculation of the width of the overlay for the original file upload
		// !sap.ui.Device.browser.internet_explorer check: only for non IE browsers since there we need
		// the button in front of the fileuploader
		if (this.getWidth()) {
			if (this.getButtonOnly() && this.oBrowse.getDomRef()) {
				this.oBrowse.getDomRef().style.width = this.getWidth();
			}
			// Recalculate the textfield width...
			this._resizeDomElements();
		}
	};

	/**
	 * Returns the DOM element that should be focused, when the focus is set onto the control.
	 * @returns {Element} The DOM element that should be focused
	 */
	FileUploader.prototype.getFocusDomRef = function() {
		return this.$("fu").get(0);
	};

	FileUploader.prototype._resizeDomElements = function() {
		var sId = this.getId();
		this._oBrowseDomRef = this.oBrowse.getDomRef();
		var $b = jQuery(this._oBrowseDomRef);
		var _buttonWidth = $b.parent().outerWidth(true);
		this._oFilePathDomRef = this.oFilePath.getDomRef();
		var oDomRef = this._oFilePathDomRef;
		var sWidth = this.getWidth();

		if (sWidth.substr( -1) == "%" && oDomRef) {
			// Special case - if the width is not in px, we only change the top element

			// Resize all elements from the input field up to the control element itself.
			while (oDomRef.id != sId) {
				oDomRef.style.width = "100%";
				oDomRef = oDomRef.parentNode;
			}

			oDomRef.style.width = sWidth;
		} else {
			if (oDomRef) {
				oDomRef.style.width = sWidth;

				// Now make sure the field including the button has the correct size
				var $fp = jQuery(this._oFilePathDomRef);
				var _newWidth = $fp.outerWidth() - _buttonWidth;
				if (_newWidth < 0) {
					this.oFilePath.getDomRef().style.width = "0px";
					if (this.oFileUpload && !Device.browser.internet_explorer) {
						this.oFileUpload.style.width = $b.outerWidth(true);
					}
				} else {
					this.oFilePath.getDomRef().style.width = _newWidth + "px";
				}
			}
		}
	};

	FileUploader.prototype.onresize = function() {
		this._recalculateWidth();
	};

	FileUploader.prototype.onThemeChanged = function() {
		this._recalculateWidth();
	};

	FileUploader.prototype.setEnabled = function(bEnabled){
		var $oFileUpload = jQuery(this.oFileUpload);

		this.setProperty("enabled", bEnabled);
		this.oFilePath.setEnabled(bEnabled);
		this.oBrowse.setEnabled(bEnabled);
		bEnabled ? $oFileUpload.removeAttr('disabled') : $oFileUpload.attr('disabled', 'disabled');

		return this;
	};

	FileUploader.prototype.setValueState = function(sValueState) {

		this.setProperty("valueState", sValueState, true);
		//as of 1.23.1 oFilePath can be an sap.ui.commons.TextField or an sap.m.Input, which both have a valueState
		if (this.oFilePath.setValueState) {
			this.oFilePath.setValueState(sValueState);
		} else {
			Log.warning("Setting the valueState property with the combination of libraries used is not supported.", this);
		}

		if (this.oBrowse.getDomRef()) {
			if (sValueState == ValueState.Error) {
				this.oBrowse.$().attr("aria-invalid", "true");
			}else {
				this.oBrowse.$().removeAttr("aria-invalid");
			}
		}

		if (containsOrEquals(this.getDomRef(), document.activeElement)) {
			switch (sValueState) {
				case ValueState.Error:
				case ValueState.Warning:
				case ValueState.Success:
					this.openValueStateMessage();
					break;
				default:
					this.closeValueStateMessage();
			}
		}

		return this;

	};

	FileUploader.prototype.setValueStateText = function(sValueStateText) {
		if (this.oFilePath.setValueStateText) {
			this.oFilePath.setValueStateText(sValueStateText);
		} else {
			Log.warning("Setting the valueStateText property with the combination of libraries used is not supported.", this);
		}

		return this.setProperty("valueStateText", sValueStateText, true);
	};

	FileUploader.prototype.setPlaceholder = function(sPlaceholder) {
		this.setProperty("placeholder", sPlaceholder, true);
		this.oFilePath.setPlaceholder(sPlaceholder);

		this._updateAccDescription();

		return this;
	};

	FileUploader.prototype.setStyle = function(sStyle) {
		this.setProperty("style", sStyle, true);
		if (sStyle) {
			if (sStyle == "Transparent") {
				if (this.oBrowse.setLite) {
					this.oBrowse.setLite(true);
				} else {
					this.oBrowse.setType("Transparent");
				}
			} else {
				if (this.oBrowse.setType) {
					this.oBrowse.setType(sStyle);
				} else {
					if (sStyle == "Emphasized") {
						sStyle = "Emph";
					}
					this.oBrowse.setStyle(sStyle);
				}
			}
		}
		return this;
	};

	FileUploader.prototype.setValue = function(sValue, bFireEvent, bSupressFocus) {
		var oldValue = this.getValue();
		var oFiles;
		if ((oldValue != sValue) || this.getSameFilenameAllowed()) {
			// only upload when a valid value is set
			var bUpload = this.getUploadOnChange() && sValue;
			// when we do not upload we re-render (cause some browsers don't like
			// to change the value of file uploader INPUT elements)
			this.setProperty("value", sValue, bUpload);
			if (this.oFilePath) {
				this.oFilePath.setValue(sValue);
				//refocus the Button, except bSupressFocus is set
				if (this.oBrowse.getDomRef() && !bSupressFocus && containsOrEquals(this.getDomRef(), document.activeElement)) {
					this.oBrowse.focus();
				}
			}
			var oForm = this.getDomRef("fu_form"),
				sapMInnerInput = this.getDomRef("fu_input-inner");
			//reseting the input fields if setValue("") is called, also for undefined and null
			if (this.oFileUpload && /* is visible: */ oForm && !sValue) {
				// some browsers do not allow to clear the value of the fileuploader control
				// therefore we utilize the form and reset the values inside this form and
				// apply the additionalData again afterwards
				oForm.reset();
				this.getDomRef("fu_input").value = "";
				//if the sap.m library is used, we also need to clear the inner input-field of sap.m.Input
				if (sapMInnerInput) {
					sapMInnerInput.value = "";
				}
				//keep the additional data on the form
				jQuery(this.FUDataEl).val(this.getAdditionalData());
			}
			// only fire event when triggered by user interaction
			if (bFireEvent) {
				if (window.File) {
					oFiles = this.FUEl.files;
				}
				if (!this.getSameFilenameAllowed() || sValue) {
					this.fireChange({id:this.getId(), newValue:sValue, files:oFiles});
				}
			}
			if (bUpload) {
				this.upload();
			}
		}
		return this;
	};


	/**
	 * Clears the content of the <code>FileUploader</code>.
	 *
	 * <b>Note:</b> The attached additional data however is retained.
	 *
	 * @public
	 * @since 1.25.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 * @returns {sap.ui.unified.FileUploader} The <code>sap.ui.unified.FileUploader</code> instance
	 */
	FileUploader.prototype.clear = function () {
		var uploadForm = this.getDomRef("fu_form");
		if (uploadForm) {
			uploadForm.reset();
		}
		//clear the value, don't fire change event, and suppress the refocusing of the file input field
		return this.setValue("", false, true);
	};

	FileUploader.prototype.onmousedown = function(oEvent) {
		if (!this.bMobileLib) {
			this.oBrowse.onmousedown(oEvent);
		}
	};

	FileUploader.prototype.onmouseup = function(oEvent) {
		if (!this.bMobileLib) {
			this.oBrowse.onmouseup(oEvent);
		}
	};

	FileUploader.prototype.onmouseover = function (oEvent) {
		if (!this.bMobileLib) {
			jQuery(this.oBrowse.getDomRef()).addClass('sapUiBtnStdHover');
			this.oBrowse.onmouseover(oEvent);
		}
	};

	FileUploader.prototype.onmouseout = function (oEvent) {
		if (!this.bMobileLib) {
			jQuery(this.oBrowse.getDomRef()).removeClass('sapUiBtnStdHover');
			this.oBrowse.onmouseout(oEvent);
		}
	};

	FileUploader.prototype.setAdditionalData = function(sAdditionalData) {
		// set the additional data in the hidden input
		this.setProperty("additionalData", sAdditionalData, true);
		var oAdditionalData = this.FUDataEl;
		if (oAdditionalData) {
			sAdditionalData = this.getAdditionalData() || "";
			oAdditionalData.value = sAdditionalData;
		}
		return this;
	};

	FileUploader.prototype.sendFiles = function(aXhr, iIndex) {

		var that = this;

		var bAllPosted = true;
		for (var i = 0; i < aXhr.length; i++) {
			if (!aXhr[i].bPosted) {
				bAllPosted = false;
				break;
			}
		}
		if (bAllPosted) {
			if (this.getSameFilenameAllowed() && this.getUploadOnChange()) {
				that.setValue("", true);
			}
			return;
		}

		var oXhr = aXhr[iIndex];
		var sFilename = oXhr.file.name ? oXhr.file.name : "MultipartFile";

		if ((Device.browser.edge || Device.browser.internet_explorer) && oXhr.file.type && oXhr.xhr.readyState == 1) {
			var sContentType = oXhr.file.type;
			oXhr.xhr.setRequestHeader("Content-Type", sContentType);
			oXhr.requestHeaders.push({name: "Content-Type", value: sContentType});
		}

		var oRequestHeaders = oXhr.requestHeaders;

		var fnProgressListener = function(oProgressEvent) {
			var oProgressData = {
				lengthComputable: !!oProgressEvent.lengthComputable,
				loaded: oProgressEvent.loaded,
				total: oProgressEvent.total
			};
			that.fireUploadProgress({
				"lengthComputable": oProgressData.lengthComputable,
				"loaded": oProgressData.loaded,
				"total": oProgressData.total,
				"fileName": sFilename,
				"requestHeaders": oRequestHeaders
			});
		};

		oXhr.xhr.upload.addEventListener("progress", fnProgressListener);

		oXhr.xhr.onreadystatechange = function() {

			var sResponse;
			var sResponseRaw;
			var mHeaders = {};
			var sPlainHeader;
			var aHeaderLines;
			var iHeaderIdx;
			var sReadyState;
			sReadyState = oXhr.xhr.readyState;
			var sStatus = oXhr.xhr.status;

			if (oXhr.xhr.readyState == 4) {
				//this check is needed, because (according to the xhr spec) the readyState is set to OPEN (4)
				//as soon as the xhr is aborted. Only after the progress events are fired, the state is set to UNSENT (0)
				if (oXhr.xhr.responseXML) {
					sResponse = oXhr.xhr.responseXML.documentElement.textContent;
				}
				sResponseRaw = oXhr.xhr.response;

				//Parse the http-header into a map
				sPlainHeader = oXhr.xhr.getAllResponseHeaders();
				if (sPlainHeader) {
					aHeaderLines = sPlainHeader.split("\u000d\u000a");
					for (var i = 0; i < aHeaderLines.length; i++) {
						if (aHeaderLines[i]) {
							iHeaderIdx = aHeaderLines[i].indexOf("\u003a\u0020");
							mHeaders[aHeaderLines[i].substring(0, iHeaderIdx)] = aHeaderLines[i].substring(iHeaderIdx + 2);
						}
					}
				}
				that.fireUploadComplete({
					"fileName": sFilename,
					"headers": mHeaders,
					"response": sResponse,
					"responseRaw": sResponseRaw,
					"readyStateXHR": sReadyState,
					"status": sStatus,
					"requestHeaders": oRequestHeaders
				});
			}
			that._bUploading = false;
		};
		if (oXhr.xhr.readyState === 0 || oXhr.bPosted) {
			iIndex++;
			that.sendFiles(aXhr, iIndex);
		} else {
			oXhr.xhr.send(oXhr.file);
			oXhr.bPosted = true;
			iIndex++;
			that.sendFiles(aXhr, iIndex);
		}
	};


	/**
	 * Starts the upload (as defined by uploadUrl).
	 *
	 * @param {boolean} [bPreProcessFiles] Set to <code>true</code> to allow pre-processing of the files before sending the request.
	 * As a result, the <code>upload</code> method becomes asynchronous. See {@link sap.ui.unified.IProcessableBlobs} for more information.
	 * <b>Note:</b> This parameter is only taken into account when <code>sendXHR</code> is set to <code>true</code>.
	 *
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FileUploader.prototype.upload = function(bPreProcessFiles) {
		//supress Upload if the FileUploader is not enabled
		if (!this.getEnabled()) {
			return;
		}
		var uploadForm = this.getDomRef("fu_form");
		try {
			this._bUploading = true;
			if (this.getSendXHR() && window.File) {
				var aFiles = this.FUEl.files;
				if (bPreProcessFiles) {
					this._sendProcessedFilesWithXHR(aFiles);
				} else {
					this._sendFilesWithXHR(aFiles);
				}
			} else if (uploadForm) {
				uploadForm.submit();
				this._resetValueAfterUploadStart();
			}
		} catch (oException) {
			Log.error("File upload failed:\n" + oException.message);
		}
	};

	/**
	 * Aborts the currently running upload.
	 *
	 * @param {string} sHeaderParameterName
	 *                 The name of the parameter within the <code>headerParameters</code> aggregation to be checked.
	 *
	 *                 <b>Note:</b> aborts the request, sent with a header parameter with the provided name.
	 *                 The parameter is taken into account if the sHeaderParameterValue parameter is provided too.
	 *
	 * @param {string} sHeaderParameterValue
	 *                 The value of the parameter within the <code>headerParameters</code> aggregation to be checked.
	 *
	 *                 <b>Note:</b> aborts the request, sent with a header parameter with the provided value.
	 *                 The parameter is taken into account if the sHeaderParameterName parameter is provided too.
	 * @public
	 * @since 1.24.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FileUploader.prototype.abort = function(sHeaderParameterName, sHeaderParameterValue) {
		if (!this.getUseMultipart()) {
			var iStart = this._aXhr.length - 1;
			for (var i = iStart; i > -1 ; i--) {
				if (sHeaderParameterName && sHeaderParameterValue) {
					for (var j = 0; j < this._aXhr[i].requestHeaders.length; j++) {
						var sHeader = this._aXhr[i].requestHeaders[j].name;
						var sValue = this._aXhr[i].requestHeaders[j].value;
						if (sHeader == sHeaderParameterName && sValue == sHeaderParameterValue) {
							this._aXhr[i].xhr.abort();
							this.fireUploadAborted({
								"fileName": this._aXhr[i].fileName,
								"requestHeaders": this._aXhr[i].requestHeaders
							});
							// Remove aborted entry from internal array.
							this._aXhr.splice(i, 1);
							Log.info("File upload aborted.");
							break;
						}
					}
				} else {
					this._aXhr[i].xhr.abort();
					this.fireUploadAborted({
						"fileName": this._aXhr[i].fileName,
						"requestHeaders": this._aXhr[i].requestHeaders
					});
					// Remove aborted entry from internal array.
					this._aXhr.splice(i, 1);
					Log.info("File upload aborted.");
				}
			}
		} else if (this._uploadXHR && this._uploadXHR.abort) {
			// fires a progress event 'abort' on the _uploadXHR
			this._uploadXHR.abort();
			this.fireUploadAborted({
				"fileName": null,
				"requestHeaders": null
			});
			Log.info("File upload aborted.");
		}
	};

	FileUploader.prototype.onkeypress = function(oEvent) {
		this.onkeydown(oEvent);
	};

	FileUploader.prototype.onclick = function(oEvent) {
		if (this.getSameFilenameAllowed() && this.getEnabled()) {
			this.setValue("", true);
		}
		//refocus the Button, except bSupressFocus is set
		if (this.oBrowse.getDomRef() && containsOrEquals(this.getDomRef(), document.activeElement)) {
			this.oBrowse.focus();
		}
	};

	//
	//Event Handling
	//
	FileUploader.prototype.onkeydown = function(oEvent) {
		if (!this.getEnabled()) {
			return;
		}
		if (this.getSameFilenameAllowed() && this.getUploadOnChange()) {
			this.setValue("", true);
		}
		var iKeyCode = oEvent.keyCode,
			eKC = KeyCodes;
		if (iKeyCode == eKC.DELETE || iKeyCode == eKC.BACKSPACE) {
			if (this.oFileUpload) {
				this.setValue("", true);
			}
		} else if (iKeyCode == eKC.SPACE || iKeyCode == eKC.ENTER) {
			// this does not work for IE9 and downwards! TODO: check with IE10/11
			// consider to always put the focus on the hidden file uploader
			// and let the fileuploader manager the keyboard interaction
			if (!(!!Device.browser.internet_explorer && Device.browser.version <= 9) && this.oFileUpload) {
				this.oFileUpload.click();
				oEvent.preventDefault();
				oEvent.stopPropagation();
			}
		} else if (iKeyCode != eKC.TAB &&
					iKeyCode != eKC.SHIFT &&
					iKeyCode != eKC.F6 &&
					iKeyCode != eKC.PAGE_UP &&
					iKeyCode != eKC.PAGE_DOWN &&
					iKeyCode != eKC.ESCAPE &&
					iKeyCode != eKC.END &&
					iKeyCode != eKC.HOME &&
					iKeyCode != eKC.ARROW_LEFT &&
					iKeyCode != eKC.ARROW_UP &&
					iKeyCode != eKC.ARROW_RIGHT &&
					iKeyCode != eKC.ARROW_DOWN) {
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}
	};

	/**
	 * Helper function to check if the given filename is longer than the specified 'maximumFilenameLength'.
	 * @param {string} [sFilename] the filename which should be tested
	 * @param {boolean} [bFireEvent] if necessary, this flag triggers that a filenameLengthExceed event is fired
	 * @returns {boolean} whether the filename is too long or not
	 * @private
	 */
	FileUploader.prototype._isFilenameTooLong = function (sFilename) {
		var iMaxFilenameLength = this.getMaximumFilenameLength();
		if (iMaxFilenameLength !== 0 && sFilename.length > iMaxFilenameLength) {
			Log.info("The filename of " + sFilename + " (" + sFilename.length + " characters)  is longer than the maximum of " + iMaxFilenameLength + " characters.");
			return true;
		}

		return false;
	};

	FileUploader.prototype.handlechange = function(oEvent) {
		if (this.oFileUpload && this.getEnabled()) {
			var aFileTypes = this.getFileType();

			var sFileString = '';
			var bWrongType, sName, iIdx, sFileEnding;
			var uploadForm = this.getDomRef("fu_form");

			if (window.File) {
				var aFiles = oEvent.target.files;

				if (this._areFilesAllowed(aFiles)) {
					this.fireFileAllowed();
					sFileString = this._generateInputValue(aFiles);
				} else {
					uploadForm.reset();
					this.setValue("", true, true);
					return;
				}
			} else if (aFileTypes && aFileTypes.length > 0) {
				// This else case is executed if the File-API is not supported by the browser (especially IE9).
				// Check if allowed file types match the chosen file from the oFileUpload IFrame Workaround.
				bWrongType = true;
				sName = this.oFileUpload.value || "";
				iIdx = sName.lastIndexOf(".");
				sFileEnding = (iIdx === -1) ? "" : sName.substring(iIdx + 1);
				for (var l = 0; l < aFileTypes.length; l++) {
					if (sFileEnding == aFileTypes[l]) {
						bWrongType = false;
					}
				}
				if (bWrongType) {
					Log.info("File: " + sName + " is of type " + sFileEnding + ". Allowed types are: "  + aFileTypes + ".");
					this.fireTypeMissmatch({
						fileName:sName,
						fileType:sFileEnding
					});
					uploadForm.reset();
					this.setValue("", true, true);
					return;
				}
				//check if the filename is too long and fire the corresponding event if necessary
				if (this._isFilenameTooLong(sName)) {
					this.fireFilenameLengthExceed({
						fileName: sName
					});
					uploadForm.reset();
					this.setValue("", true, true);
					return;
				}
				if (sName) {
					this.fireFileAllowed();
				}
			}

			// due to new security mechanism modern browsers simply
			// append a fakepath in front of the filename instead of
			// returning the filename only - we strip this path now
			var sValue = this.oFileUpload.value || "";
			var iIndex = sValue.lastIndexOf("\\");
			if (iIndex >= 0) {
				sValue = sValue.substring(iIndex + 1);
			}
			if (this.getMultiple()) {
				//multiple is not supported in IE <= 9
				if (!(Device.browser.internet_explorer && Device.browser.version <= 9)) {
					sValue = sFileString;
				}
			}

			//sValue has to be filled to avoid clearing the FilePath by pressing cancel
			if (sValue || Device.browser.chrome) { // in Chrome the file path has to be cleared as the upload will be avoided
				this.setValue(sValue, true);
			}
		}
	};

	//
	// Private
	//

	/*
	* Send passed files as argument trough XHR request.
	* @param {array} [aFiles] list of files from type window.File, this array is returned from input type="file" or from Drag and Drop
	* @returns this
	* @private
	*/
	FileUploader.prototype._sendFilesWithXHR = function (aFiles) {
		var iFiles,
			sHeader,
			sValue,
			oXhrEntry,
			oXHRSettings = this.getXhrSettings();

		if (aFiles.length > 0) {
			if (this.getUseMultipart()) {
				//one xhr request for all files
				iFiles = 1;
			} else {
				//several xhr requests for every file
				iFiles = aFiles.length;
			}
			// Save references to already uploading files if a new upload comes between upload and complete or abort
			this._aXhr = this._aXhr || [];
			for (var j = 0; j < iFiles; j++) {
				//keep a reference on the current upload xhr
				this._uploadXHR = new window.XMLHttpRequest();

				oXhrEntry = {
					xhr: this._uploadXHR,
					requestHeaders: []
				};
				this._aXhr.push(oXhrEntry);
				oXhrEntry.xhr.open("POST", this.getUploadUrl(), true);
				if (oXHRSettings) {
					oXhrEntry.xhr.withCredentials = oXHRSettings.getWithCredentials();
				}
				if (this.getHeaderParameters()) {
					var aHeaderParams = this.getHeaderParameters();
					for (var i = 0; i < aHeaderParams.length; i++) {
						sHeader = aHeaderParams[i].getName();
						sValue = aHeaderParams[i].getValue();
						oXhrEntry.requestHeaders.push({
							name: sHeader,
							value: sValue
						});
					}
				}
				var sFilename = aFiles[j].name;
				var aRequestHeaders = oXhrEntry.requestHeaders;
				oXhrEntry.fileName = sFilename;
				oXhrEntry.file = aFiles[j];
				this.fireUploadStart({
					"fileName": sFilename,
					"requestHeaders": aRequestHeaders
				});
				for (var k = 0; k < aRequestHeaders.length; k++) {
					// Check if request is still open in case abort() was called.
					if (oXhrEntry.xhr.readyState === 0) {
						break;
					}
					sHeader = aRequestHeaders[k].name;
					sValue = aRequestHeaders[k].value;
					oXhrEntry.xhr.setRequestHeader(sHeader, sValue);
				}
			}
			if (this.getUseMultipart()) {
				var formData = new window.FormData();
				var name = this.FUEl.name;
				for (var l = 0; l < aFiles.length; l++) {
					this._appendFileToFormData(formData, name, aFiles[l]);
				}
				formData.append("_charset_", "UTF-8");
				var data = this.FUDataEl.name;
				if (this.getAdditionalData()) {
					var sData = this.getAdditionalData();
					formData.append(data, sData);
				} else {
					formData.append(data, "");
				}
				if (this.getParameters()) {
					var oParams = this.getParameters();
					for (var m = 0; m < oParams.length; m++) {
						var sName = oParams[m].getName();
						sValue = oParams[m].getValue();
						formData.append(sName, sValue);
					}
				}
				oXhrEntry.file = formData;
				this.sendFiles(this._aXhr, 0);
			} else {
				this.sendFiles(this._aXhr, 0);
			}
			this._bUploading = false;
			this._resetValueAfterUploadStart();
		}

		return this;
	};

	/**
	 * Append a file to passed FormData object handling special case where there is a Blob or window.File with a name
	 * parameter passed.
	 * @param {object} oFormData receiving FormData object
	 * @param {string} sFieldName name of the form field
	 * @param {object} oFile object to be appended
	 * @private
	 */
	FileUploader.prototype._appendFileToFormData = function (oFormData, sFieldName, oFile) {
		// BCP: 1770523801 We pass third parameter 'name' only for instance of 'Blob' that has a 'name'
		// parameter to prevent the append method failing on Safari browser.
		if (oFile instanceof window.Blob && oFile.name) {
			oFormData.append(sFieldName, oFile, oFile.name);
		} else {
			oFormData.append(sFieldName, oFile);
		}
	};

	/*
	* Processes the passed files and sends them afterwards via XHR request.
	* @param {array} [aFiles] list of files from type window.File
	* @returns this
	* @private
	*/
	FileUploader.prototype._sendProcessedFilesWithXHR = function (aFiles) {
		this.getProcessedBlobsFromArray(aFiles).then(function(aBlobs){
			this._sendFilesWithXHR(aBlobs);
		}.bind(this)).catch(function(oResult){
			Log.error("File upload failed: " + oResult && oResult.message ? oResult.message : "no details available");
		});
		return this;
	};

	/*
	* Check if passed files complies with the provided file restrictions.
	* These restrictions are the values of properties like "fileType", "maximumFileSize", "mimeType", "maximumFilenameLength"
	* @param {array} [aFiles] list of files from type window.File, this array is returned from input type="file" or from Drag and Drop
	* @returns {boolean}
	* @private
	*/
	FileUploader.prototype._areFilesAllowed = function (aFiles) {
		var sName, bWrongType, iIdx, sFileEnding, sType,
			fMaxSize = this.getMaximumFileSize(),
			aMimeTypes = this.getMimeType(),
			aFileTypes = this.getFileType();

		for (var i = 0; i < aFiles.length; i++) {
			sName = aFiles[i].name;
			sType = aFiles[i].type;
			if (!sType) {
				sType = "unknown";
			}
			var fSize = ((aFiles[i].size / 1024) / 1024);
			if (fMaxSize && (fSize > fMaxSize)) {
				Log.info("File: " + sName + " is of size " + fSize + " MB which exceeds the file size limit of " + fMaxSize + " MB.");
				this.fireFileSizeExceed({
					fileName: sName,
					fileSize: fSize
				});

				return false;
			}
			if (fSize === 0){
				Log.info("File: " + sName + " is empty!");
				this.fireFileEmpty({
					fileName: sName
				});
			}
			//check if the filename is too long and fire the corresponding event if necessary
			if (this._isFilenameTooLong(sName)) {
				this.fireFilenameLengthExceed({
					fileName: sName
				});

				return false;
			}
			//check allowed mime-types for potential mismatches
			if (aMimeTypes && aMimeTypes.length > 0) {
				var bWrongMime = true;
				for (var j = 0; j < aMimeTypes.length; j++) {
					if (sType == aMimeTypes[j] || aMimeTypes[j] == "*/*" || sType.match(aMimeTypes[j])) {
						bWrongMime = false;
					}
				}
				if (bWrongMime && !(sType === "unknown" && (Device.browser.edge || Device.browser.msie))) {
					Log.info("File: " + sName + " is of type " + sType + ". Allowed types are: "  + aMimeTypes + ".");
					this.fireTypeMissmatch({
						fileName:sName,
						mimeType:sType
					});

					return false;
				}
			}
			//check allowed file-types for potential mismatches
			if (aFileTypes && aFileTypes.length > 0) {
				bWrongType = true;
				iIdx = sName.lastIndexOf(".");
				sFileEnding = (iIdx === -1) ? "" : sName.substring(iIdx + 1);
				for (var k = 0; k < aFileTypes.length; k++) {
					if (sFileEnding.toLowerCase() == aFileTypes[k].toLowerCase()) {
						bWrongType = false;
					}
				}
				if (bWrongType) {
					Log.info("File: " + sName + " is of type " + sFileEnding + ". Allowed types are: "  + aFileTypes + ".");
					this.fireTypeMissmatch({
						fileName:sName,
						fileType:sFileEnding
					});

					return false;
				}
			}
		}

		return true;
	};

	/*
	* Validate provided files from drag and drop event and send them trough XHR
	* Be aware that this method is private and is created only for drag and drop enablement inside sap.m.UploadCollection
	* @param {array} [aFiles] list of files from type window.File, this array is returned from input type="file" or from Drag and Drop
	* @returns {this}
	* @private
	*/
	FileUploader.prototype._sendFilesFromDragAndDrop = function (aFiles) {
		if (this._areFilesAllowed(aFiles)) {
			this._sendFilesWithXHR(aFiles);
		}
		return this;
	};

	/*
	* The value in the FileUplader input is generated from this method.
	* It contains the names of the files in quotes divided by space.
	* @param {array} [aFiles] list with files from type window.File, this array is returned from input type="file" or from Drag and Drop
	* returns {string} The value of the input
	*/
	FileUploader.prototype._generateInputValue = function (aFiles) {
		var sFileString = "";

		for (var i = 0; i < aFiles.length; i++) {
			sFileString = sFileString + '"' + aFiles[i].name + '" ';
		}

		return sFileString;
	};

	/**
	 * Helper to retrieve the I18N texts for a button
	 * @private
	 */
	FileUploader.prototype.getBrowseText = function() {

		// as the text is the same for all FileUploaders, get it only once
		if (!FileUploader.prototype._sBrowseText) {
			var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
			FileUploader.prototype._sBrowseText = rb.getText("FILEUPLOAD_BROWSE");
		}

		return FileUploader.prototype._sBrowseText ? FileUploader.prototype._sBrowseText : "Browse...";

	};

	/**
	 * Getter for shortened value.
	 * @private
	 * @deprecated the value now is the short value (filename only)!
	 */
	FileUploader.prototype.getShortenValue = function() {
		return this.getValue();
	};

	/**
	 * Prepares the hidden IFrame for uploading the file (in static area).
	 * @private
	 */
	FileUploader.prototype.prepareFileUploadAndIFrame = function() {

		if (!this.oFileUpload) {

			// create the file uploader markup
			var aFileUpload = [];
			aFileUpload.push('<input ');
			aFileUpload.push('type="file" ');
			aFileUpload.push('aria-hidden="true" ');
			if (this.getName()) {
				if (this.getMultiple()) {
					//multiple is not supported in IE <= 9
					if (!(Device.browser.internet_explorer && Device.browser.version <= 9)) {
						aFileUpload.push('name="' + encodeXML(this.getName()) + '[]" ');
					}
				} else {
					aFileUpload.push('name="' + encodeXML(this.getName()) + '" ');
				}
			} else {
				if (this.getMultiple()) {
					//multiple is not supported in IE <= 9
					if (!(Device.browser.internet_explorer && Device.browser.version <= 9)) {
						aFileUpload.push('name="' + this.getId() + '[]" ');
					}
				} else {
					aFileUpload.push('name="' + this.getId() + '" ');
				}
			}
			aFileUpload.push('id="' + this.getId() + '-fu" ');
			if (!(!!Device.browser.internet_explorer && Device.browser.version == 9)) {
				// for IE9 the file uploader itself gets the focus to make sure that the
				// keyboard interaction works and there is no security issue - unfortunately
				// this has the negative side effect that 2 tabs are required.
				aFileUpload.push('tabindex="-1" ');
			}
			aFileUpload.push('size="1" ');
			if (this.getTooltip_AsString() ) {
				aFileUpload.push('title="' + encodeXML(this.getTooltip_AsString()) + '" ');
			//} else if (this.getTooltip() ) {
				// object tooltip, do nothing - tooltip will be displayed
			} else if (this.getValue() !== "") {
				// only if there is no tooltip, then set value as fallback
				aFileUpload.push('title="' + encodeXML(this.getValue()) + '" ');
			}
			if (!this.getEnabled()) {
				aFileUpload.push('disabled="disabled" ');
			}
			if (this.getMultiple()) {
				//multiple is not supported in IE <= 9
				if (!(Device.browser.internet_explorer && Device.browser.version <= 9)) {
					aFileUpload.push('multiple ');
				}
			}
			if ((this.getMimeType() || this.getFileType()) && window.File) {
				var aMimeTypes = this.getMimeType() || [];
				var aFileTypes = this.getFileType() || [];
				aFileTypes = aFileTypes.map(function(item) {
					return item.indexOf(".") === 0 ? item : "." + item;
				});
				var sAcceptedTypes = aFileTypes.concat(aMimeTypes).join(",");
				aFileUpload.push('accept="' + encodeXML(sAcceptedTypes) + '" ');
			}
			aFileUpload.push('>');

			// add it into the control markup
			this.oFileUpload = jQuery(aFileUpload.join("")).prependTo(this.$().find(".sapUiFupInputMask")).get(0);

		} else {

			// move the file uploader from the static area to the control markup
			jQuery(this.oFileUpload).prependTo(this.$().find(".sapUiFupInputMask"));

		}

		if (!this.oIFrameRef) {

			// create the upload iframe
			var oIFrameRef = document.createElement("iframe");
			oIFrameRef.style.display = "none";
			/*eslint-enable no-script-url */
			oIFrameRef.id = this.sId + "-frame";
			sap.ui.getCore().getStaticAreaRef().appendChild(oIFrameRef);
			oIFrameRef.contentWindow.name = this.sId + "-frame";

			// sink the load event of the upload iframe
			var that = this;
			this._bUploading = false; // flag for uploading
			jQuery(oIFrameRef).on( "load", function(oEvent) {
				if (that._bUploading) {
					Log.info("File uploaded to " + that.getUploadUrl());
					var sResponse;
					try {
						sResponse = that.oIFrameRef.contentWindow.document.body.innerHTML;
					} catch (ex) {
						// in case of cross-domain submit we get a permission denied exception
						// when we try to access the body of the IFrame document
					}
					that.fireUploadComplete({"response": sResponse});
					that._bUploading = false;
				}
			});

			// keep the reference
			this.oIFrameRef = oIFrameRef;

		}
	};

	FileUploader.prototype.openValueStateMessage = function() {

		if (this.oFilePath.openValueStateMessage) {
			this.oFilePath.openValueStateMessage();
			this.oBrowse.$().addAriaDescribedBy(this.oFilePath.getId() + "-message");
		}

	};

	FileUploader.prototype.closeValueStateMessage = function() {

		if (this.oFilePath.closeValueStateMessage) {
			this.oFilePath.closeValueStateMessage();
			this.oBrowse.$().removeAriaDescribedBy(this.oFilePath.getId() + "-message");
		}

	};

	FileUploader.prototype._resetValueAfterUploadStart = function () {
		Log.info("File uploading to " + this.getUploadUrl());
		if (this.getSameFilenameAllowed() && this.getUploadOnChange() && this.getUseMultipart()) {
			this.setValue("", true);
		}
	};
	/*
	* Add default input type=file and label behaviour to file uploader.
	*/
	FileUploader.prototype._addLabelFeaturesToBrowse = function () {
		var $browse;

		if (this.oBrowse &&  this.oBrowse.$().length) {
			$browse = this.oBrowse.$();
			$browse.attr("type', 'button"); // The default type of button is submit that's why on click of label there are submit of the form. This way we are avoiding the submit of form.
			$browse.click(function(e) {
				e.preventDefault();
				this.FUEl.click(); // The default behaviour on click on label is to open "open file" dialog. The only way to attach click event that is transferred from the label to the button is this way. AttachPress and attachTap don't work in this case.
			}.bind(this));
		}
	};

	/**
	 * Allows to process Blobs before they get uploaded. This API can be used to create custom Blobs
	 * and upload these custom Blobs instead of the received/initials Blobs in the parameter <code>aBlobs</code>.
	 * One use case could be to create and upload zip archives based on the passed Blobs.
	 * The default implementation of this API should simply resolve with the received Blobs (parameter <code>aBlobs</code>).
	 *
	 * This API is only supported in case <code>sendXHR</code> is <code>true</code>. This means only IE10+ is supported, while IE9 and below is not.
	 *
	 * This is a default implementation of the interface <code>sap.ui.unified.IProcessableBlobs</code>.
	 *
         * @public
         * @since 1.52
	 * @param {Blob[]} aBlobs The initial Blobs which can be used to determine/calculate a new array of Blobs for further processing.
	 * @return {Promise} A Promise that resolves with an array of Blobs which is used for the final uploading.
	 */
	FileUploader.prototype.getProcessedBlobsFromArray = function (aBlobs){
		return new Promise(function(resolve){
			resolve(aBlobs);
		});
	};


	return FileUploader;

});
