sap.ui.define(['sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/icons/decline', 'sap/ui/webc/common/thirdparty/icons/edit', 'sap/ui/webc/common/thirdparty/base/i18nBundle', './types/ListItemType', './types/ListMode', './ListItemBase', './RadioButton', './CheckBox', './Button', './generated/i18n/i18n-defaults', './generated/themes/ListItem.css'], function (Keys, decline, edit, i18nBundle, ListItemType, ListMode, ListItemBase, RadioButton, CheckBox, Button, i18nDefaults, ListItem_css) { 'use strict';

	const metadata = {
		languageAware: true,
		properties:  {
			type: {
				type: ListItemType,
				defaultValue: ListItemType.Active,
			},
			active: {
				type: Boolean,
			},
			title: {
				type: String,
			},
			actionable: {
				type: Boolean,
			},
			role: {
				type: String,
				defaultValue: "option",
			},
			_mode: {
				type: ListMode,
				defaultValue: ListMode.None,
			},
		},
		events:  {
			"detail-click": {},
			_press: {},
			_focused: {},
			"_selection-requested": {},
		},
	};
	class ListItem extends ListItemBase {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return [ListItemBase.styles, ListItem_css];
		}
		static get dependencies() {
			return [
				Button,
				RadioButton,
				CheckBox,
			];
		}
		constructor() {
			super();
			this.deactivateByKey = event => {
				if (Keys.isEnter(event)) {
					this.deactivate();
				}
			};
			this.deactivate = () => {
				if (this.active) {
					this.active = false;
				}
			};
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering(...params) {
			this.actionable = (this.type === ListItemType.Active) && (this._mode !== ListMode.Delete);
		}
		onEnterDOM() {
			document.addEventListener("mouseup", this.deactivate);
			document.addEventListener("touchend", this.deactivate);
			document.addEventListener("keyup", this.deactivateByKey);
		}
		onExitDOM() {
			document.removeEventListener("mouseup", this.deactivate);
			document.removeEventListener("keyup", this.deactivateByKey);
			document.removeEventListener("touchend", this.deactivate);
		}
		_onkeydown(event) {
			super._onkeydown(event);
			const itemActive = this.type === ListItemType.Active;
			if (Keys.isSpace(event)) {
				event.preventDefault();
			}
			if ((Keys.isSpace(event) || Keys.isEnter(event)) && itemActive) {
				this.activate();
			}
			if (Keys.isEnter(event)) {
				this.fireItemPress(event);
			}
		}
		_onkeyup(event) {
			if (Keys.isSpace(event) || Keys.isEnter(event)) {
				this.deactivate();
			}
			if (Keys.isSpace(event)) {
				this.fireItemPress(event);
			}
			if (this.modeDelete && Keys.isDelete(event)) {
				this.onDelete();
			}
		}
		_onmousedown(event) {
			if (event.isMarked === "button") {
				return;
			}
			this.activate();
		}
		_onmouseup(event) {
			if (event.isMarked === "button") {
				return;
			}
			this.deactivate();
		}
		_ontouchstart(event) {
			this._onmousedown(event);
		}
		_ontouchend(event) {
			this._onmouseup(event);
		}
		_onfocusout() {
			super._onfocusout();
			this.deactivate();
		}
		_onclick(event) {
			if (event.isMarked === "button") {
				return;
			}
			this.fireItemPress(event);
		}
		onMultiSelectionComponentPress(event) {
			if (this.isInactive) {
				return;
			}
			this.fireEvent("_selection-requested", { item: this, selected: event.target.checked, selectionComponentPressed: true });
		}
		onSingleSelectionComponentPress(event) {
			if (this.isInactive) {
				return;
			}
			this.fireEvent("_selection-requested", { item: this, selected: !event.target.selected, selectionComponentPressed: true });
		}
		activate() {
			if (this.type === ListItemType.Active) {
				this.active = true;
			}
		}
		onDelete(event) {
			this.fireEvent("_selection-requested", { item: this, selectionComponentPressed: false });
		}
		onDetailClick(event) {
			this.fireEvent("detail-click", { item: this, selected: this.selected });
		}
		fireItemPress(event) {
			if (this.isInactive) {
				return;
			}
			this.fireEvent("_press", { item: this, selected: this.selected, key: event.key });
		}
		get isInactive() {
			return this.type === ListItemType.Inactive || this.type === ListItemType.Detail;
		}
		get placeSelectionElementBefore() {
			return this._mode === ListMode.MultiSelect
				|| this._mode === ListMode.SingleSelectBegin;
		}
		get placeSelectionElementAfter() {
			return !this.placeSelectionElementBefore
				&& (this._mode === ListMode.SingleSelectEnd || this._mode === ListMode.Delete);
		}
		get modeSingleSelect() {
			return [
				ListMode.SingleSelectBegin,
				ListMode.SingleSelectEnd,
				ListMode.SingleSelect,
			].includes(this._mode);
		}
		get modeMultiSelect() {
			return this._mode === ListMode.MultiSelect;
		}
		get modeDelete() {
			return this._mode === ListMode.Delete;
		}
		get renderDeleteButton() {
			return this.modeDelete;
		}
		get disableDeleteButton() {
			return false;
		}
		get typeDetail() {
			return this.type === ListItemType.Detail;
		}
		get typeActive() {
			return this.type === ListItemType.Active;
		}
		get ariaSelected() {
			if (this.modeMultiSelect || this.modeSingleSelect) {
				return this.selected;
			}
			return undefined;
		}
		get deleteText() {
			return this.i18nBundle.getText(i18nDefaults.DELETE);
		}
		get _accInfo() {
			return {
				role: this.role,
				ariaExpanded: undefined,
				ariaLevel: undefined,
				ariaLabel: this.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_ITEM_CHECKBOX),
				listItemAriaLabel: undefined,
			};
		}
		static async onDefine() {
			await Promise.all([
				i18nBundle.fetchI18nBundle("@ui5/webcomponents"),
			]);
		}
	}

	return ListItem;

});
