sap.ui.define(['sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/main/thirdparty/types/ListItemType', 'sap/ui/webc/main/thirdparty/Button', 'sap/ui/webc/main/thirdparty/Input', 'sap/ui/webc/main/thirdparty/Label', 'sap/ui/webc/main/thirdparty/Link', 'sap/ui/webc/main/thirdparty/ProgressIndicator', 'sap/ui/webc/main/thirdparty/ListItem', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/util/getFileExtension', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/Keys', './types/UploadState', 'sap/ui/webc/common/thirdparty/icons/refresh', 'sap/ui/webc/common/thirdparty/icons/stop', 'sap/ui/webc/common/thirdparty/icons/edit', './generated/i18n/i18n-defaults', './generated/templates/UploadCollectionItemTemplate.lit', './generated/themes/UploadCollectionItem.css'], function (i18nBundle, ListItemType, Button, Input, Label, Link, ProgressIndicator, ListItem, Integer, getFileExtension, Render, Keys, UploadState, refresh, stop, edit, i18nDefaults, UploadCollectionItemTemplate_lit, UploadCollectionItem_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var ListItemType__default = /*#__PURE__*/_interopDefaultLegacy(ListItemType);
	var Button__default = /*#__PURE__*/_interopDefaultLegacy(Button);
	var Input__default = /*#__PURE__*/_interopDefaultLegacy(Input);
	var Label__default = /*#__PURE__*/_interopDefaultLegacy(Label);
	var Link__default = /*#__PURE__*/_interopDefaultLegacy(Link);
	var ProgressIndicator__default = /*#__PURE__*/_interopDefaultLegacy(ProgressIndicator);
	var ListItem__default = /*#__PURE__*/_interopDefaultLegacy(ListItem);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var getFileExtension__default = /*#__PURE__*/_interopDefaultLegacy(getFileExtension);

	const metadata = {
		tag: "ui5-upload-collection-item",
		languageAware: true,
		properties:  {
			file: {
				type: Object,
				defaultValue: null,
			},
			fileName: {
				type: String,
			},
			fileNameClickable: {
				type: Boolean,
			},
			disableDeleteButton: {
				type: Boolean,
			},
			hideDeleteButton: {
				type: Boolean,
			},
			hideRetryButton: {
				type: Boolean,
			},
			hideTerminateButton: {
				type: Boolean,
			},
			progress: {
				type: Integer__default,
				defaultValue: 0,
			},
			uploadState: {
				type: UploadState,
				defaultValue: UploadState.Ready,
			},
			_editing: {
				type: Boolean,
			},
		},
		slots:  {
			"default": {
				type: Node,
			},
			thumbnail: {
				type: HTMLElement,
			},
		},
		events:  {
			"file-name-click": { },
			rename: { },
			terminate: {},
			retry: {},
			"_focus-requested": {},
		},
	};
	class UploadCollectionItem extends ListItem__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [ListItem__default.styles, UploadCollectionItem_css];
		}
		static get template() {
			return UploadCollectionItemTemplate_lit;
		}
		static get dependencies() {
			return [
				...ListItem__default.dependencies,
				Button__default,
				Input__default,
				Link__default,
				Label__default,
				ProgressIndicator__default,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		constructor() {
			super();
			this.i18nFioriBundle = i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
		}
		async _initInputField() {
			await Render.renderFinished();
			const inp = this.shadowRoot.getElementById("ui5-uci-edit-input");
			inp.value = this._fileNameWithoutExtension;
			await Render.renderFinished();
			const inpFocusDomRef = inp.getFocusDomRef();
			if (inpFocusDomRef) {
				inpFocusDomRef.focus();
				inpFocusDomRef.setSelectionRange(0, this._fileNameWithoutExtension.length);
			}
		}
		async onDetailClick(event) {
			super.onDetailClick(event);
			this._editing = true;
			await this._initInputField();
		}
		_onDetailKeyup(event) {
			if (Keys.isSpace(event)) {
				this.onDetailClick(event);
			}
		}
		_onInputFocusin(event) {
			event.stopPropagation();
		}
		_onInputKeyDown(event) {
			if (Keys.isEscape(event)) {
				this._onRenameCancel(event);
			} else if (Keys.isEnter(event)) {
				this._onRename();
			} else if (Keys.isSpace(event)) {
				event.stopImmediatePropagation();
			}
		}
		_onRename(event) {
			const inp = this.shadowRoot.getElementById("ui5-uci-edit-input");
			this.fileName = inp.value + this._fileExtension;
			this.fireEvent("rename");
			this._editing = false;
			this._focus();
		}
		_onRenameKeyup(event) {
			if (Keys.isSpace(event)) {
				this._onRename(event);
			}
		}
		async _onRenameCancel(event) {
			this._editing = false;
			if (Keys.isEscape(event)) {
				await Render.renderFinished();
				this.shadowRoot.getElementById(`${this._id}-editing-button`).focus();
			} else {
				this._focus();
			}
		}
		_onRenameCancelKeyup(event) {
			if (Keys.isSpace(event)) {
				this._onRenameCancel(event);
			}
		}
		_focus() {
			this.fireEvent("_focus-requested");
		}
		_onFileNameClick(event) {
			this.fireEvent("file-name-click");
		}
		_onRetry(event) {
			this.fireEvent("retry");
		}
		_onRetryKeyup(event) {
			if (Keys.isSpace(event)) {
				this._onRetry(event);
			}
		}
		_onTerminate(event) {
			this.fireEvent("terminate");
		}
		_onTerminateKeyup(event) {
			if (Keys.isSpace(event)) {
				this._onTerminate(event);
			}
		}
		getFocusDomRef() {
			return this.getDomRef();
		}
		get list() {
			return this.assignedSlot.parentElement;
		}
		get classes() {
			const result = super.classes;
			return {
				main: {
					...result.main,
					"ui5-uci-root": true,
					"ui5-uci-root-editing": this._editing,
					"ui5-uci-root-uploading": this.uploadState === UploadState.Uploading,
				},
			};
		}
		get renderDeleteButton() {
			return !this.hideDeleteButton;
		}
		get placeSelectionElementAfter() {
			return true;
		}
		get placeSelectionElementBefore() {
			return false;
		}
		get _fileNameWithoutExtension() {
			return this.fileName.substring(0, this.fileName.length - this._fileExtension.length);
		}
		get _fileExtension() {
			return getFileExtension__default(this.fileName);
		}
		get _renameBtnText() {
			return this.i18nFioriBundle.getText(i18nDefaults.UPLOADCOLLECTIONITEM_RENAMEBUTTON_TEXT);
		}
		get _cancelRenameBtnText() {
			return this.i18nFioriBundle.getText(i18nDefaults.UPLOADCOLLECTIONITEM_CANCELBUTTON_TEXT);
		}
		get _showProgressIndicator() {
			return this.uploadState !== UploadState.Complete;
		}
		get _progressText() {
			if (this.uploadState === UploadState.Uploading) {
				return this.i18nFioriBundle.getText(i18nDefaults.UPLOADCOLLECTIONITEM_UPLOADING_STATE);
			}
			if (this.uploadState === UploadState.Error) {
				return this.i18nFioriBundle.getText(i18nDefaults.UPLOADCOLLECTIONITEM_ERROR_STATE);
			}
			return this.i18nFioriBundle.getText(i18nDefaults.UPLOADCOLLECTIONITEM_READY_STATE);
		}
		get _showRetry() {
			return !this.hideRetryButton && this.uploadState === UploadState.Error;
		}
		get _showTerminate() {
			return !this.hideTerminateButton && this.uploadState === UploadState.Uploading;
		}
		get _retryButtonTooltip() {
			return this.i18nFioriBundle.getText(i18nDefaults.UPLOADCOLLECTIONITEM_RETRY_BUTTON_TEXT);
		}
		get _terminateButtonTooltip() {
			return this.i18nFioriBundle.getText(i18nDefaults.UPLOADCOLLECTIONITEM_TERMINATE_BUTTON_TEXT);
		}
		get _editButtonTooltip() {
			return this.i18nFioriBundle.getText(i18nDefaults.UPLOADCOLLECTIONITEM_EDIT_BUTTON_TEXT);
		}
		get valueStateName() {
			if (this.uploadState === UploadState.Error) {
				return "Error";
			}
			if (this.uploadState === UploadState.Ready || this.uploadState === UploadState.Uploading) {
				return "Information";
			}
			return undefined;
		}
		get typeDetail() {
			return false;
		}
		get showEditButton() {
			return this.type === ListItemType__default.Detail;
		}
	}
	UploadCollectionItem.define();

	return UploadCollectionItem;

});
