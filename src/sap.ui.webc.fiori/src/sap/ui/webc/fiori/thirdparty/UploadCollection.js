sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/main/thirdparty/Icon', 'sap/ui/webc/main/thirdparty/Label', 'sap/ui/webc/main/thirdparty/List', 'sap/ui/webc/main/thirdparty/types/ListMode', 'sap/ui/webc/main/thirdparty/Title', 'sap/ui/webc/common/thirdparty/icons/upload-to-cloud', 'sap/ui/webc/common/thirdparty/icons/document', './generated/i18n/i18n-defaults', './upload-utils/UploadCollectionBodyDnD', './types/UploadCollectionDnDMode', './generated/templates/UploadCollectionTemplate.lit', './generated/themes/UploadCollection.css'], function (UI5Element, litRender, i18nBundle, Icon, Label, List, ListMode, Title, uploadToCloud, document, i18nDefaults, UploadCollectionBodyDnD, UploadCollectionDnDMode, UploadCollectionTemplate_lit, UploadCollection_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Icon__default = /*#__PURE__*/_interopDefaultLegacy(Icon);
	var Label__default = /*#__PURE__*/_interopDefaultLegacy(Label);
	var List__default = /*#__PURE__*/_interopDefaultLegacy(List);
	var ListMode__default = /*#__PURE__*/_interopDefaultLegacy(ListMode);
	var Title__default = /*#__PURE__*/_interopDefaultLegacy(Title);

	const metadata = {
		tag: "ui5-upload-collection",
		languageAware: true,
		properties:  {
			mode: {
				type: ListMode__default,
				defaultValue: ListMode__default.None,
			},
			noDataDescription: {
				type: String,
			},
			noDataText: {
				type: String,
			},
			hideDragOverlay: {
				type: Boolean,
			},
			_dndOverlayMode: {
				type: String,
				defaultValue: UploadCollectionDnDMode.None,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
			},
			header: {
				type: HTMLElement,
			},
		},
		events:  {
			drop: {},
			"item-delete": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"selection-change": {
				detail: {
					selectedItems: { type: Array },
				},
			},
		},
	};
	class UploadCollection extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return UploadCollection_css;
		}
		static get template() {
			return UploadCollectionTemplate_lit;
		}
		static get dependencies() {
			return [
				Icon__default,
				Label__default,
				List__default,
				Title__default,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents-fiori");
		}
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents-fiori");
			this._bodyDnDHandler = event => {
				if (this._dndOverlayMode !== UploadCollectionDnDMode.Drop) {
					this._dndOverlayMode = event.mode;
				}
			};
		}
		onEnterDOM() {
			if (this.hideDragOverlay) {
				return;
			}
			UploadCollectionBodyDnD.attachBodyDnDHandler(this._bodyDnDHandler);
		}
		onExitDOM() {
			if (this.hideDragOverlay) {
				return;
			}
			UploadCollectionBodyDnD.detachBodyDnDHandler(this._bodyDnDHandler);
		}
		_ondragenter(event) {
			if (this.hideDragOverlay) {
				return;
			}
			if (!UploadCollectionBodyDnD.draggingFiles(event)) {
				return;
			}
			this._dndOverlayMode = UploadCollectionDnDMode.Drop;
		}
		_ondrop(event) {
			if (this.hideDragOverlay) {
				return;
			}
			if (event.target !== this.shadowRoot.querySelector(".uc-dnd-overlay")) {
				event.stopPropagation();
			}
			this._dndOverlayMode = UploadCollectionDnDMode.None;
		}
		_ondragover(event) {
			if (this.hideDragOverlay) {
				return;
			}
			event.preventDefault();
		}
		_ondragleave() {
			if (this.hideDragOverlay) {
				return;
			}
			this._dndOverlayMode = UploadCollectionDnDMode.Drag;
		}
		_onItemDelete(event) {
			this.fireEvent("item-delete", { item: event.detail.item });
		}
		_onSelectionChange(event) {
			this.fireEvent("selection-change", { selectedItems: event.detail.selectedItems });
		}
		get classes() {
			return {
				content: {
					"ui5-uc-content": true,
					"ui5-uc-content-no-data": this.items.length === 0,
				},
				dndOverlay: {
					"uc-dnd-overlay": true,
					"uc-drag-overlay": this._dndOverlayMode === UploadCollectionDnDMode.Drag,
					"uc-drop-overlay": this._dndOverlayMode === UploadCollectionDnDMode.Drop,
				},
			};
		}
		get _root() {
			return this.shadowRoot.querySelector(".ui5-uc-root");
		}
		get _dndOverlay() {
			return this._root.querySelector(".uc-dnd-overlay");
		}
		get _showDndOverlay() {
			return this._dndOverlayMode !== UploadCollectionDnDMode.None;
		}
		get _showNoData() {
			return this.items.length === 0 && !this._showDndOverlay;
		}
		get _noDataText() {
			return this.noDataText || this.i18nBundle.getText(i18nDefaults.UPLOADCOLLECTION_NO_DATA_TEXT);
		}
		get _noDataDescription() {
			return this.noDataDescription || this.i18nBundle.getText(i18nDefaults.UPLOADCOLLECTION_NO_DATA_DESCRIPTION);
		}
		get _roleDescription() {
			return this.i18nBundle.getText(i18nDefaults.UPLOADCOLLECTION_ARIA_ROLE_DESCRIPTION);
		}
		get _dndOverlayText() {
			if (this._dndOverlayMode === UploadCollectionDnDMode.Drag) {
				return this.i18nBundle.getText(i18nDefaults.UPLOADCOLLECTION_DRAG_FILE_INDICATOR);
			}
			return this.i18nBundle.getText(i18nDefaults.UPLOADCOLLECTION_DROP_FILE_INDICATOR);
		}
	}
	UploadCollection.define();

	return UploadCollection;

});
