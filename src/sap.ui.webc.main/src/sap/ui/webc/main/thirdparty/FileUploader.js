sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/i18n/i18n-defaults', './Input', './Popover', './generated/templates/FileUploaderTemplate.lit', './generated/templates/FileUploaderPopoverTemplate.lit', './generated/themes/FileUploader.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css'], function (UI5Element, ValueState, FeaturesRegistry, litRender, i18nBundle, Keys, i18nDefaults, Input, Popover, FileUploaderTemplate_lit, FileUploaderPopoverTemplate_lit, FileUploader_css, ResponsivePopoverCommon_css, ValueStateMessage_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-file-uploader",
		languageAware: true,
		properties:  {
			accept: {
				type: String,
			},
			hideInput: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			multiple: {
				type: Boolean,
			},
			name: {
				type: String,
			},
			placeholder: {
				type: String,
			},
			value: {
				type: String,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			focused: {
				type: Boolean,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "content",
				type: HTMLElement,
			},
			valueStateMessage: {
				type: HTMLElement,
			},
			formSupport: {
				type: HTMLElement,
			},
		},
		events:  {
			change: {
				detail: {
					files: { type: FileList },
				},
			},
		},
	};
	class FileUploader extends UI5Element__default {
		static get formAssociated() {
			return true;
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return FileUploader_css;
		}
		static get template() {
			return FileUploaderTemplate_lit;
		}
		static get staticAreaTemplate() {
			return FileUploaderPopoverTemplate_lit;
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, ValueStateMessage_css];
		}
		constructor() {
			super();
			if (this._canUseNativeFormSupport) {
				this._internals = this.attachInternals();
			}
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		_onmouseover() {
			this.content.forEach(item => {
				item.classList.add("ui5_hovered");
			});
		}
		_onmouseout() {
			this.content.forEach(item => {
				item.classList.remove("ui5_hovered");
			});
		}
		_onkeydown(event) {
			if (Keys.isEnter(event)) {
				this._input.click(event);
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event)) {
				this._input.click(event);
			}
		}
		_onfocusin() {
			this.focused = true;
		}
		_onfocusout() {
			this.focused = false;
		}
		get files() {
			if (this._input) {
				return this._input.files;
			}
			return FileUploader._emptyFilesList;
		}
		onBeforeRendering() {
			this._enableFormSupport();
		}
		onAfterRendering() {
			if (!this.value) {
				this._input.value = "";
			}
			this.toggleValueStatePopover(this.shouldOpenValueStateMessagePopover);
		}
		_enableFormSupport() {
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (FormSupport) {
				if (this._canUseNativeFormSupport) {
					this._setFormValue();
				} else {
					FormSupport.syncNativeFileInput(
						this,
						(element, nativeInput) => {
							nativeInput.disabled = element.disabled;
						},
						this._onChange.bind(this),
					);
				}
			} else if (this.name) {
				console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
		}
		_onChange(event) {
			this._updateValue(event.target.files);
			this.fireEvent("change", {
				files: event.target.files,
			});
		}
		_updateValue(files) {
			this.value = Array.from(files).reduce((acc, currFile) => {
				return `${acc}"${currFile.name}" `;
			}, "");
		}
		_setFormValue() {
			const formData = new FormData();
			for (let i = 0; i < this.files.length; i++) {
				formData.append(this.name, this.files[i]);
			}
			this._internals.setFormValue(formData);
		}
		toggleValueStatePopover(open) {
			if (open) {
				this.openValueStatePopover();
			} else {
				this.closeValueStatePopover();
			}
		}
		async openValueStatePopover() {
			const popover = await this._getPopover();
			if (popover) {
				popover.showAt(this);
			}
		}
		async closeValueStatePopover() {
			const popover = await this._getPopover();
			if (popover) {
				popover.close();
			}
		}
		async _getPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector(".ui5-valuestatemessage-popover");
		}
		static get _emptyFilesList() {
			if (!this.emptyInput) {
				this.emptyInput = document.createElement("input");
				this.emptyInput.type = "file";
			}
			return this.emptyInput.files;
		}
		get browseText() {
			return this.i18nBundle.getText(i18nDefaults.FILEUPLOAD_BROWSE);
		}
		get titleText() {
			return this.i18nBundle.getText(i18nDefaults.FILEUPLOADER_TITLE);
		}
		get _canUseNativeFormSupport() {
			return !!this.attachInternals;
		}
		get _keepInputInShadowDOM() {
			return this._canUseNativeFormSupport || !this.name;
		}
		get _input() {
			return this.shadowRoot.querySelector("input[type=file]") || this.querySelector("input[type=file][data-ui5-form-support]");
		}
		get _type() {
			return "file";
		}
		get valueStateTextMappings() {
			const i18nBundle = this.i18nBundle;
			return {
				"Success": i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Information": i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
				"Error": i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
			};
		}
		get valueStateText() {
			return this.valueStateTextMappings[this.valueState];
		}
		get hasValueState() {
			return this.valueState !== ValueState__default.None;
		}
		get hasValueStateText() {
			return this.hasValueState && this.valueState !== ValueState__default.Success;
		}
		get valueStateMessageText() {
			return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
		}
		get shouldDisplayDefaultValueStateMessage() {
			return !this.valueStateMessage.length && this.hasValueStateText;
		}
		get shouldOpenValueStateMessagePopover() {
			return this.focused && this.hasValueStateText && !this.hideInput;
		}
		get classes() {
			return {
				popoverValueState: {
					"ui5-valuestatemessage-root": true,
					"ui5-valuestatemessage--success": this.valueState === ValueState__default.Success,
					"ui5-valuestatemessage--error": this.valueState === ValueState__default.Error,
					"ui5-valuestatemessage--warning": this.valueState === ValueState__default.Warning,
					"ui5-valuestatemessage--information": this.valueState === ValueState__default.Information,
				},
			};
		}
		get styles() {
			return {
				popoverHeader: {
					"width": `${this.ui5Input ? this.ui5Input.offsetWidth : 0}px`,
				},
			};
		}
		get ui5Input() {
			return this.shadowRoot.querySelector(".ui5-file-uploader-input");
		}
		static get dependencies() {
			return [Input, Popover];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	FileUploader.define();

	return FileUploader;

});
