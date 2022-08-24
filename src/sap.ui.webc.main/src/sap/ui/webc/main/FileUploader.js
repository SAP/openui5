/*!
 * ${copyright}
 */

// Provides control sap.ui.webc.main.FileUploader.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"sap/ui/core/EnabledPropagator",
	"sap/ui/core/library",
	"./thirdparty/FileUploader",
	"./thirdparty/features/InputElementsFormSupport"
], function(WebComponent, library, EnabledPropagator, coreLibrary) {
	"use strict";

	var ValueState = coreLibrary.ValueState;

	/**
	 * Constructor for a new <code>FileUploader</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.FileUploader</code> opens a file explorer dialog and enables users to upload files. The component consists of input field, but you can provide an HTML element by your choice to trigger the file upload, by using the default slot. Furthermore, you can set the property "hideInput" to "true" to hide the input field. <br>
	 * To get all selected files, you can simply use the read-only "files" property. To restrict the types of files the user can select, you can use the "accept" property. <br>
	 * And, similar to all input based components, the FileUploader supports "valueState", "placeholder", "name", and "disabled" properties.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.FileUploader
	 * @implements sap.ui.core.IFormContent
	 */
	var FileUploader = WebComponent.extend("sap.ui.webc.main.FileUploader", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-file-uploader-ui5",
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			properties: {

				/**
				 * Comma-separated list of file types that the component should accept. <br>
				 * <br>
				 * <b>Note:</b> Please make sure you are adding the <code>.</code> in front on the file type, e.g. <code>.png</code> in case you want to accept png's only.
				 */
				accept: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the control is enabled. A disabled control can't be interacted with, and it is not in the tab chain.
				 */
				enabled: {
					type: "boolean",
					defaultValue: true,
					mapping: {
						type: "attribute",
						to: "disabled",
						formatter: "_mapEnabled"
					}
				},

				/**
				 * If set to "true", the input field of component will not be rendered. Only the default slot that is passed will be rendered.
				 */
				hideInput: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Allows multiple files to be chosen.
				 */
				multiple: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Determines the name with which the component will be submitted in an HTML form.
				 *
				 *
				 * <br>
				 * <br>
				 * <b>Note:</b> When set, a native <code>input</code> HTML element will be created inside the component so that it can be submitted as part of an HTML form. Do not use this property unless you need to submit a form.
				 */
				name: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines a short hint intended to aid the user with data entry when the component has no value.
				 */
				placeholder: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the name/names of the file/files to upload.
				 */
				value: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines the value state of the component. <br>
				 * <br>
				 * Available options are:
				 * <ul>
				 *     <li><code>None</code></li>
				 *     <li><code>Error</code></li>
				 *     <li><code>Warning</code></li>
				 *     <li><code>Success</code></li>
				 *     <li><code>Information</code></li>
				 * </ul>
				 */
				valueState: {
					type: "sap.ui.core.ValueState",
					defaultValue: ValueState.None
				},

				/**
				 * Defines the value state message that will be displayed as pop up under the contorl.
				 * <br>
				 * <br>
				 *
				 *
				 * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
				 */
				valueStateMessage: {
					type: "string",
					defaultValue: "",
					mapping: {
						type: "slot",
						to: "div"
					}
				},

				/**
				 * Defines the width of the control
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					mapping: "style"
				}
			},
			defaultAggregation: "content",
			aggregations: {

				/**
				 * By default the component contains a single input field. With this slot you can pass any content that you wish to add. See the samples for more information.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			},
			events: {

				/**
				 * Event is fired when the value of the file path has been changed. <b>Note:</b> Keep in mind that because of the HTML input element of type file, the event is also fired in Chrome browser when the Cancel button of the uploads window is pressed.
				 */
				change: {
					parameters: {
						/**
						 * The current files.
						 */
						files: {
							type: "FileList"
						}
					}
				}
			},
			getters: ["files"]
		}
	});

	/**
	 * Returns the fileList of all selected files.
	 * @public
	 * @name sap.ui.webc.main.FileUploader#getFiles
	 * @function
	 */

	EnabledPropagator.call(FileUploader.prototype);

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return FileUploader;
});