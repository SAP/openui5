/* eslint-disable */
sap.ui.define(['testdata/fastnavigation/webc/integration/webcomponents', 'testdata/fastnavigation/webc/integration/i18n-defaults', 'testdata/fastnavigation/webc/integration/ValueState', 'testdata/fastnavigation/webc/integration/ListItemBase', 'testdata/fastnavigation/webc/integration/slim-arrow-right', 'testdata/fastnavigation/webc/integration/Button', 'testdata/fastnavigation/webc/integration/Icon', 'testdata/fastnavigation/webc/integration/isElementHidden'], (function (webcomponentsBase, i18nDefaults, ValueState, ListItemBase, slimArrowRight, Button, Icon, isElementHidden) { 'use strict';

	const name$9 = "edit";
	const pathData$9 = "M475 104q5 7 5 12 0 6-5 11L150 453q-4 4-8 4L32 480l22-110q0-5 4-9L384 36q4-4 11-4t11 4zm-121 99l-46-45L84 381l46 46zm87-88l-46-44-64 64 45 45z";
	const ltr$9 = false;
	const collection$9 = "SAP-icons-v4";
	const packageName$9 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$9, { pathData: pathData$9, ltr: ltr$9, collection: collection$9, packageName: packageName$9 });

	const name$8 = "edit";
	const pathData$8 = "M505 94q7 7 7 18t-6 17L130 505q-7 7-18 7H26q-11 0-18.5-7.5T0 486v-86q1-10 6-16L382 7q7-7 18-7t18 7zm-55 18l-50-50-50 50 50 50zm-86 86l-50-50L62 400l50 50z";
	const ltr$8 = false;
	const collection$8 = "SAP-icons-v5";
	const packageName$8 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$8, { pathData: pathData$8, ltr: ltr$8, collection: collection$8, packageName: packageName$8 });

	var editIcon = "edit";

	/**
	 * Different types of Highlight .
	 *
	 * @public
	 */
	var Highlight;
	(function (Highlight) {
	    /**
	     * @public
	     */
	    Highlight["None"] = "None";
	    /**
	     * @public
	     */
	    Highlight["Positive"] = "Positive";
	    /**
	     * @public
	     */
	    Highlight["Critical"] = "Critical";
	    /**
	     * @public
	     */
	    Highlight["Negative"] = "Negative";
	    /**
	     * @public
	     */
	    Highlight["Information"] = "Information";
	})(Highlight || (Highlight = {}));
	var Highlight$1 = Highlight;

	/**
	 * Different list item types.
	 * @public
	 */
	var ListItemType;
	(function (ListItemType) {
	    /**
	     * Indicates the list item does not have any active feedback when item is pressed.
	     * @public
	     */
	    ListItemType["Inactive"] = "Inactive";
	    /**
	     * Indicates that the item is clickable via active feedback when item is pressed.
	     * @public
	     */
	    ListItemType["Active"] = "Active";
	    /**
	     * Enables detail button of the list item that fires detail-click event.
	     * @public
	     */
	    ListItemType["Detail"] = "Detail";
	    /**
	     * Enables the type of navigation, which is specified to add an arrow at the end of the items and fires navigate-click event.
	     * @public
	     */
	    ListItemType["Navigation"] = "Navigation";
	})(ListItemType || (ListItemType = {}));
	var ListItemType$1 = ListItemType;

	webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
	webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
	var styles = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host([navigated]) .ui5-li-root .ui5-li-navigated{width:.1875rem;position:absolute;right:0;top:0;bottom:0;background-color:var(--sapList_SelectionBorderColor)}:host([active][actionable]) .ui5-li-root .ui5-li-icon{color:var(--sapList_Active_TextColor)}:host([active][actionable]) .ui5-li-title,:host([active][actionable]) .ui5-li-desc,:host([active][actionable]) .ui5-li-additional-text{color:var(--sapList_Active_TextColor)}:host([active][actionable]) .ui5-li-additional-text{text-shadow:none}:host([additional-text-state="Critical"]) .ui5-li-additional-text{color:var(--sapCriticalTextColor)}:host([additional-text-state="Positive"]) .ui5-li-additional-text{color:var(--sapPositiveTextColor)}:host([additional-text-state="Negative"]) .ui5-li-additional-text{color:var(--sapNegativeTextColor)}:host([additional-text-state="Information"]) .ui5-li-additional-text{color:var(--sapInformativeTextColor)}:host([has-title][description]){height:5rem}:host([has-title][image]){height:5rem}:host([_has-image]){height:5rem}:host([image]) .ui5-li-content{height:3rem}::slotted(img[slot="image"]){width:var(--_ui5-v2-11-0_list_item_img_size);height:var(--_ui5-v2-11-0_list_item_img_size);border-radius:var(--ui5-v2-11-0-avatar-border-radius);object-fit:contain}::slotted([ui5-icon][slot="image"]){color:var(--sapContent_NonInteractiveIconColor);min-width:var(--_ui5-v2-11-0_list_item_icon_size);min-height:var(--_ui5-v2-11-0_list_item_icon_size);padding-inline-end:var(--_ui5-v2-11-0_list_item_icon_padding-inline-end)}::slotted([ui5-avatar][slot="image"]){min-width:var(--_ui5-v2-11-0_list_item_img_size);min-height:var(--_ui5-v2-11-0_list_item_img_size);margin-top:var(--_ui5-v2-11-0_list_item_img_top_margin);margin-bottom:var(--_ui5-v2-11-0_list_item_img_bottom_margin);margin-inline-end:var(--_ui5-v2-11-0_list_item_img_hn_margin)}:host([wrapping-type="None"][description]) .ui5-li-root{padding:1rem}:host([description]) .ui5-li-content{height:3rem}:host([has-title][description]) .ui5-li-title{padding-bottom:.375rem}.ui5-li-text-wrapper{flex-direction:column}:host([description]) .ui5-li-text-wrapper{height:100%;justify-content:space-between;padding:.125rem 0}.ui5-li-description-info-wrapper{display:flex;justify-content:space-between}.ui5-li-additional-text,:host(:not([wrapping-type="Normal"])) .ui5-li-title,.ui5-li-desc{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}:host([wrapping-type="Normal"]){height:auto}:host([wrapping-type="Normal"]) .ui5-li-content{margin:var(--_ui5-v2-11-0_list_item_content_vertical_offset) 0}.ui5-li-desc{color:var(--sapContent_LabelColor);font-size:var(--sapFontSize)}:host([description]) .ui5-li-additional-text{align-self:flex-end}.ui5-li-icon{min-width:var(--_ui5-v2-11-0_list_item_icon_size);min-height:var(--_ui5-v2-11-0_list_item_icon_size);color:var(--sapContent_NonInteractiveIconColor);padding-inline-end:var(--_ui5-v2-11-0_list_item_icon_padding-inline-end)}:host([icon-end]) .ui5-li-icon{padding-inline-start:var(--_ui5-v2-11-0_list_item_icon_padding-inline-end)}.ui5-li-detailbtn,.ui5-li-deletebtn{display:flex;align-items:center;margin-left:var(--_ui5-v2-11-0_list_buttons_left_space)}.ui5-li-multisel-cb,.ui5-li-singlesel-radiobtn{flex-shrink:0}:host([description]) .ui5-li-singlesel-radiobtn{align-self:flex-start;margin-top:var(--_ui5-v2-11-0_list_item_selection_btn_margin_top)}:host([description]) .ui5-li-multisel-cb{align-self:flex-start;margin-top:var(--_ui5-v2-11-0_list_item_selection_btn_margin_top)}:host([_selection-mode="SingleStart"][wrapping-type]) .ui5-li-root{padding-inline:0 1rem}:host([_selection-mode="Multiple"][wrapping-type]) .ui5-li-root{padding-inline:0 1rem}:host([_selection-mode="SingleEnd"][wrapping-type]) .ui5-li-root{padding-inline:1rem 0}:host [ui5-checkbox].ui5-li-singlesel-radiobtn{margin-right:var(--_ui5-v2-11-0_list_item_cb_margin_right)}.ui5-li-highlight{position:absolute;width:.375rem;bottom:0;left:0;top:0;border-inline-end:.0625rem solid var(--ui5-v2-11-0-listitem-background-color);box-sizing:border-box}:host([highlight="Negative"]) .ui5-li-highlight{background:var(--sapNegativeTextColor)}:host([highlight="Critical"]) .ui5-li-highlight{background:var(--sapCriticalTextColor)}:host([highlight="Positive"]) .ui5-li-highlight{background:var(--sapPositiveTextColor)}:host([highlight="Information"]) .ui5-li-highlight{background:var(--sapInformativeTextColor)}:host([wrapping-type="Normal"][description]),:host([wrapping-type="Normal"][has-title][description]),:host([wrapping-type="Normal"][has-title][image]){height:auto;min-height:5rem}:host([wrapping-type="Normal"][description]) .ui5-li-content,:host([wrapping-type="Normal"][image]) .ui5-li-content{height:auto;min-height:3rem}:host([wrapping-type="Normal"][has-title][description]) .ui5-li-title{padding-bottom:.75rem}:host([wrapping-type="Normal"][additional-text]) .ui5-li-additional-text{padding-inline-start:.75rem}:host([wrapping-type="Normal"]) .ui5-li-description-info-wrapper{flex-direction:column}:host([wrapping-type="Normal"]) .ui5-li-description-info-wrapper .ui5-li-additional-text{white-space:normal}:host([wrapping-type="Normal"]) .ui5-li-multisel-cb,:host([wrapping-type="Normal"]) .ui5-li-singlesel-radiobtn{display:flex;align-self:flex-start}:host([wrapping-type="Normal"][description]) .ui5-li-multisel-cb,:host([wrapping-type="Normal"][description]) .ui5-li-singlesel-radiobtn{margin-top:0}:host([wrapping-type="Normal"]) .ui5-li-icon,:host([wrapping-type="Normal"]) .ui5-li-image{display:flex;align-self:flex-start}:host([wrapping-type="Normal"][icon-end]) .ui5-li-icon{margin-top:var(--_ui5-v2-11-0_list_item_content_vertical_offset)}:host([wrapping-type="Normal"]) ::slotted([ui5-avatar][slot="image"]){margin-top:0;margin-bottom:0}:host([wrapping-type="Normal"]) .ui5-li-detailbtn,:host([wrapping-type="Normal"]) .ui5-li-deletebtn{margin-inline-start:.875rem}
`;

	webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
	webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
	var listItemAdditionalTextCss = `.ui5-li-additional-text{margin:0 .25rem;color:var(--sapNeutralTextColor);font-size:var(--sapFontSize);min-width:3.75rem;text-align:end;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`;

	var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var ListItem_1;
	/**
	 * @class
	 * A class to serve as a base
	 * for the `ListItemStandard` and `ListItemCustom` classes.
	 * @constructor
	 * @abstract
	 * @extends ListItemBase
	 * @public
	 */
	let ListItem = ListItem_1 = class ListItem extends ListItemBase.ListItemBase {
	    constructor() {
	        super();
	        /**
	         * Defines the visual indication and behavior of the list items.
	         * Available options are `Active` (by default), `Inactive`, `Detail` and `Navigation`.
	         *
	         * **Note:** When set to `Active` or `Navigation`, the item will provide visual response upon press and hover,
	         * while with type `Inactive` and `Detail` - will not.
	         * @default "Active"
	         * @public
	        */
	        this.type = "Active";
	        /**
	         * Defines the additional accessibility attributes that will be applied to the component.
	         * The following fields are supported:
	         *
	         * - **ariaSetsize**: Defines the number of items in the current set  when not all items in the set are present in the DOM.
	         * **Note:** The value is an integer reflecting the number of items in the complete set. If the size of the entire set is unknown, set `-1`.
	         *
	         * 	- **ariaPosinset**: Defines an element's number or position in the current set when not all items are present in the DOM.
	         * 	**Note:** The value is an integer greater than or equal to 1, and less than or equal to the size of the set when that size is known.
	         *
	         * @default {}
	         * @public
	         * @since 1.15.0
	         */
	        this.accessibilityAttributes = {};
	        /**
	         * The navigated state of the list item.
	         * If set to `true`, a navigation indicator is displayed at the end of the list item.
	         * @default false
	         * @public
	         * @since 1.10.0
	         */
	        this.navigated = false;
	        /**
	         * Indicates if the list item is active, e.g pressed down with the mouse or the keyboard keys.
	         * @private
	        */
	        this.active = false;
	        /**
	         * Defines the highlight state of the list items.
	         * Available options are: `"None"` (by default), `"Positive"`, `"Critical"`, `"Information"` and `"Negative"`.
	         * @default "None"
	         * @public
	         * @since 1.24
	         */
	        this.highlight = "None";
	        /**
	         * Used to define the role of the list item.
	         * @private
	         * @default "ListItem"
	         * @since 1.3.0
	         *
	         */
	        this.accessibleRole = "ListItem";
	        this._selectionMode = "None";
	        /**
	         * Defines the current media query size.
	         * @default "S"
	         * @private
	         */
	        this.mediaRange = "S";
	        this.deactivateByKey = (e) => {
	            if (webcomponentsBase.b$1(e)) {
	                this.deactivate();
	            }
	        };
	        this.deactivate = () => {
	            if (this.active) {
	                this.active = false;
	            }
	        };
	    }
	    onBeforeRendering() {
	        super.onBeforeRendering();
	        this.actionable = (this.type === ListItemType$1.Active || this.type === ListItemType$1.Navigation) && (this._selectionMode !== ListItemBase.ListSelectionMode.Delete);
	    }
	    onEnterDOM() {
	        super.onEnterDOM();
	        document.addEventListener("mouseup", this.deactivate);
	        document.addEventListener("touchend", this.deactivate);
	        document.addEventListener("keyup", this.deactivateByKey);
	    }
	    onExitDOM() {
	        document.removeEventListener("mouseup", this.deactivate);
	        document.removeEventListener("keyup", this.deactivateByKey);
	        document.removeEventListener("touchend", this.deactivate);
	    }
	    async _onkeydown(e) {
	        if ((webcomponentsBase.i(e) || webcomponentsBase.b$1(e)) && this._isTargetSelfFocusDomRef(e)) {
	            return;
	        }
	        super._onkeydown(e);
	        const itemActive = this.type === ListItemType$1.Active, itemNavigated = this.typeNavigation;
	        if ((webcomponentsBase.i(e) || webcomponentsBase.b$1(e)) && (itemActive || itemNavigated)) {
	            this.activate();
	        }
	        if (webcomponentsBase.so(e)) {
	            const activeElement = webcomponentsBase.t();
	            const focusDomRef = this.getFocusDomRef();
	            if (activeElement === focusDomRef) {
	                const firstFocusable = await ValueState.b(focusDomRef);
	                firstFocusable?.focus();
	            }
	            else {
	                focusDomRef.focus();
	            }
	        }
	    }
	    _onkeyup(e) {
	        super._onkeyup(e);
	        if (webcomponentsBase.i(e) || webcomponentsBase.b$1(e)) {
	            this.deactivate();
	        }
	        if (this.modeDelete && webcomponentsBase.V(e)) {
	            this.onDelete();
	        }
	    }
	    _onmousedown() {
	        this.activate();
	    }
	    _onmouseup() {
	        if (this.getFocusDomRef().matches(":has(:focus-within)")) {
	            return;
	        }
	        this.deactivate();
	    }
	    _ontouchend() {
	        this._onmouseup();
	    }
	    _onfocusin(e) {
	        super._onfocusin(e);
	        if (e.target !== this.getFocusDomRef()) {
	            this.deactivate();
	        }
	    }
	    _onfocusout(e) {
	        if (e.target !== this.getFocusDomRef()) {
	            return;
	        }
	        this.deactivate();
	    }
	    _ondragstart(e) {
	        if (!e.dataTransfer) {
	            return;
	        }
	        if (e.target === this._listItem) {
	            this.setAttribute("data-moving", "");
	            e.dataTransfer.dropEffect = "move";
	            e.dataTransfer.effectAllowed = "move";
	        }
	    }
	    _ondragend(e) {
	        if (e.target === this._listItem) {
	            this.removeAttribute("data-moving");
	        }
	    }
	    _isTargetSelfFocusDomRef(e) {
	        const target = e.target, focusDomRef = this.getFocusDomRef();
	        return target !== focusDomRef;
	    }
	    /**
	     * Called when selection components in Single (ui5-radio-button)
	     * and Multi (ui5-checkbox) selection modes are used.
	     */
	    onMultiSelectionComponentPress(e) {
	        if (this.isInactive) {
	            return;
	        }
	        this.fireDecoratorEvent("selection-requested", { item: this, selected: e.target.checked, selectionComponentPressed: true });
	    }
	    onSingleSelectionComponentPress(e) {
	        if (this.isInactive) {
	            return;
	        }
	        this.fireDecoratorEvent("selection-requested", { item: this, selected: !e.target.checked, selectionComponentPressed: true });
	    }
	    activate() {
	        if (this.type === ListItemType$1.Active || this.type === ListItemType$1.Navigation) {
	            this.active = true;
	        }
	    }
	    onDelete() {
	        this.fireDecoratorEvent("selection-requested", { item: this, selectionComponentPressed: false });
	    }
	    onDetailClick() {
	        this.fireDecoratorEvent("detail-click", { item: this, selected: this.selected });
	    }
	    fireItemPress(e) {
	        if (this.isInactive) {
	            return;
	        }
	        super.fireItemPress(e);
	        if (document.activeElement !== this) {
	            this.focus();
	        }
	    }
	    get isInactive() {
	        return this.type === ListItemType$1.Inactive || this.type === ListItemType$1.Detail;
	    }
	    get placeSelectionElementBefore() {
	        return this._selectionMode === ListItemBase.ListSelectionMode.Multiple
	            || this._selectionMode === ListItemBase.ListSelectionMode.SingleStart;
	    }
	    get placeSelectionElementAfter() {
	        return !this.placeSelectionElementBefore
	            && (this._selectionMode === ListItemBase.ListSelectionMode.SingleEnd || this._selectionMode === ListItemBase.ListSelectionMode.Delete);
	    }
	    get modeSingleSelect() {
	        return [
	            ListItemBase.ListSelectionMode.SingleStart,
	            ListItemBase.ListSelectionMode.SingleEnd,
	            ListItemBase.ListSelectionMode.Single,
	        ].includes(this._selectionMode);
	    }
	    get modeMultiple() {
	        return this._selectionMode === ListItemBase.ListSelectionMode.Multiple;
	    }
	    get modeDelete() {
	        return this._selectionMode === ListItemBase.ListSelectionMode.Delete;
	    }
	    get typeDetail() {
	        return this.type === ListItemType$1.Detail;
	    }
	    get typeNavigation() {
	        return this.type === ListItemType$1.Navigation;
	    }
	    get typeActive() {
	        return this.type === ListItemType$1.Active;
	    }
	    get _ariaSelected() {
	        if (this.modeMultiple || this.modeSingleSelect) {
	            return this.selected;
	        }
	        return undefined;
	    }
	    get listItemAccessibleRole() {
	        return (this._forcedAccessibleRole || this.accessibleRole.toLowerCase());
	    }
	    get ariaSelectedText() {
	        let ariaSelectedText;
	        // Selected state needs to be supported separately since now the role mapping is list -> listitem[]
	        // to avoid the issue of nesting interactive elements, ex. (option -> radio/checkbox);
	        // The text is added to aria-describedby because as part of the aria-labelledby
	        // the whole content of the item is readout when the aria-labelledby value is changed.
	        if (this._ariaSelected !== undefined) {
	            ariaSelectedText = this._ariaSelected ? ListItem_1.i18nBundle.getText(i18nDefaults.LIST_ITEM_SELECTED) : ListItem_1.i18nBundle.getText(i18nDefaults.LIST_ITEM_NOT_SELECTED);
	        }
	        return ariaSelectedText;
	    }
	    get deleteText() {
	        return ListItem_1.i18nBundle.getText(i18nDefaults.DELETE);
	    }
	    get hasDeleteButtonSlot() {
	        return !!this.deleteButton.length;
	    }
	    get _accessibleNameRef() {
	        if (this.accessibleName) {
	            // accessibleName is set - return labels excluding content
	            return `${this._id}-invisibleText`;
	        }
	        // accessibleName is not set - return _accInfo.listItemAriaLabel including content
	        return `${this._id}-content ${this._id}-invisibleText`;
	    }
	    get ariaLabelledByText() {
	        const texts = [
	            this._accInfo.listItemAriaLabel,
	            this.accessibleName,
	            this.typeActive ? ListItem_1.i18nBundle.getText(i18nDefaults.LIST_ITEM_ACTIVE) : undefined,
	        ].filter(Boolean);
	        return texts.join(" ");
	    }
	    get _accInfo() {
	        return {
	            role: this.listItemAccessibleRole,
	            ariaExpanded: undefined,
	            ariaLevel: undefined,
	            ariaLabel: ListItem_1.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_ITEM_CHECKBOX),
	            ariaLabelRadioButton: ListItem_1.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_ITEM_RADIO_BUTTON),
	            ariaSelectedText: this.ariaSelectedText,
	            ariaHaspopup: this.accessibilityAttributes.hasPopup,
	            setsize: this.accessibilityAttributes.ariaSetsize,
	            posinset: this.accessibilityAttributes.ariaPosinset,
	            tooltip: this.tooltip,
	        };
	    }
	    get _hasHighlightColor() {
	        return this.highlight !== Highlight$1.None;
	    }
	    get hasConfigurableMode() {
	        return true;
	    }
	    get _listItem() {
	        return this.shadowRoot.querySelector("li");
	    }
	};
	__decorate$3([
	    webcomponentsBase.s()
	], ListItem.prototype, "type", void 0);
	__decorate$3([
	    webcomponentsBase.s({ type: Object })
	], ListItem.prototype, "accessibilityAttributes", void 0);
	__decorate$3([
	    webcomponentsBase.s({ type: Boolean })
	], ListItem.prototype, "navigated", void 0);
	__decorate$3([
	    webcomponentsBase.s()
	], ListItem.prototype, "tooltip", void 0);
	__decorate$3([
	    webcomponentsBase.s({ type: Boolean })
	], ListItem.prototype, "active", void 0);
	__decorate$3([
	    webcomponentsBase.s()
	], ListItem.prototype, "highlight", void 0);
	__decorate$3([
	    webcomponentsBase.s({ type: Boolean })
	], ListItem.prototype, "selected", void 0);
	__decorate$3([
	    webcomponentsBase.s()
	], ListItem.prototype, "accessibleRole", void 0);
	__decorate$3([
	    webcomponentsBase.s()
	], ListItem.prototype, "_forcedAccessibleRole", void 0);
	__decorate$3([
	    webcomponentsBase.s()
	], ListItem.prototype, "_selectionMode", void 0);
	__decorate$3([
	    webcomponentsBase.s()
	], ListItem.prototype, "mediaRange", void 0);
	__decorate$3([
	    webcomponentsBase.d()
	], ListItem.prototype, "deleteButton", void 0);
	__decorate$3([
	    i18nDefaults.i("ui5/webcomponents")
	], ListItem, "i18nBundle", void 0);
	ListItem = ListItem_1 = __decorate$3([
	    webcomponentsBase.m({
	        languageAware: true,
	        renderer: i18nDefaults.y,
	        styles: [
	            ListItemBase.ListItemBase.styles,
	            listItemAdditionalTextCss,
	            styles,
	        ],
	    })
	    /**
	     * Fired when the user clicks on the detail button when type is `Detail`.
	     * @public
	     */
	    ,
	    i18nDefaults.l("detail-click", {
	        bubbles: true,
	    }),
	    i18nDefaults.l("selection-requested", {
	        bubbles: true,
	    })
	], ListItem);
	var ListItem$1 = ListItem;

	class RadioButtonGroup {
	    static hasGroup(groupName) {
	        return this.groups.has(groupName);
	    }
	    static getGroup(groupName) {
	        return this.groups.get(groupName);
	    }
	    static getCheckedRadioFromGroup(groupName) {
	        return this.checkedRadios.get(groupName);
	    }
	    static removeGroup(groupName) {
	        this.checkedRadios.delete(groupName);
	        return this.groups.delete(groupName);
	    }
	    static addToGroup(radioBtn, groupName) {
	        if (this.hasGroup(groupName)) {
	            this.enforceSingleSelection(radioBtn, groupName);
	            if (this.getGroup(groupName)) {
	                this.getGroup(groupName).push(radioBtn);
	            }
	        }
	        else {
	            this.createGroup(radioBtn, groupName);
	        }
	        this.updateTabOrder(groupName);
	    }
	    static removeFromGroup(radioBtn, groupName) {
	        const group = this.getGroup(groupName);
	        if (!group) {
	            return;
	        }
	        const checkedRadio = this.getCheckedRadioFromGroup(groupName);
	        // Remove the radio button from the given group
	        group.forEach((_radioBtn, idx, arr) => {
	            if (radioBtn._id === _radioBtn._id) {
	                return arr.splice(idx, 1);
	            }
	        });
	        if (checkedRadio === radioBtn) {
	            this.checkedRadios.set(groupName, null);
	        }
	        // Remove the group if it is empty
	        if (!group.length) {
	            this.removeGroup(groupName);
	        }
	        this.updateTabOrder(groupName);
	    }
	    static createGroup(radioBtn, groupName) {
	        if (radioBtn.checked) {
	            this.checkedRadios.set(groupName, radioBtn);
	        }
	        this.groups.set(groupName, [radioBtn]);
	    }
	    static selectNextItem(item, groupName) {
	        const group = this.getGroup(groupName);
	        if (!group) {
	            return;
	        }
	        const groupLength = group.length, currentItemPosition = group.indexOf(item);
	        if (groupLength <= 1) {
	            return;
	        }
	        const nextItemToFocus = this._nextFocusable(currentItemPosition, group);
	        if (!nextItemToFocus) {
	            return;
	        }
	        this.updateSelectionInGroup(nextItemToFocus, groupName);
	    }
	    static updateFormValidity(groupName) {
	        const group = this.getGroup(groupName);
	        if (!group) {
	            return;
	        }
	        const hasRequired = group.some(r => r.required);
	        const hasChecked = group.some(r => r.checked);
	        group.forEach(r => {
	            r._groupChecked = hasChecked;
	            r._groupRequired = hasRequired;
	        });
	    }
	    static updateTabOrder(groupName) {
	        const group = this.getGroup(groupName);
	        if (!group) {
	            return;
	        }
	        const hasCheckedRadio = group.some(radioBtn => radioBtn.checked);
	        group.filter(radioBtn => !radioBtn.disabled).forEach((radioBtn, idx) => {
	            let activeElement = webcomponentsBase.t();
	            if (activeElement?.classList.contains("ui5-radio-root")) {
	                activeElement = activeElement.getRootNode();
	                if (activeElement instanceof ShadowRoot) {
	                    activeElement = activeElement.host;
	                }
	            }
	            if (hasCheckedRadio) {
	                if (activeElement?.hasAttribute("ui5-radio-button") && activeElement.readonly) {
	                    radioBtn._tabIndex = activeElement === radioBtn && radioBtn.readonly ? 0 : -1;
	                }
	                else {
	                    radioBtn._tabIndex = radioBtn.checked ? 0 : -1;
	                }
	            }
	            else {
	                radioBtn._tabIndex = idx === 0 ? 0 : -1;
	            }
	        });
	    }
	    static selectPreviousItem(item, groupName) {
	        const group = this.getGroup(groupName);
	        if (!group) {
	            return;
	        }
	        const groupLength = group.length, currentItemPosition = group.indexOf(item);
	        if (groupLength <= 1) {
	            return;
	        }
	        const previousItemToFocus = this._previousFocusable(currentItemPosition, group);
	        if (!previousItemToFocus) {
	            return;
	        }
	        this.updateSelectionInGroup(previousItemToFocus, groupName);
	    }
	    static selectItem(item, groupName) {
	        this.updateSelectionInGroup(item, groupName);
	        this.updateTabOrder(groupName);
	        this.updateFormValidity(groupName);
	    }
	    static updateSelectionInGroup(radioBtnToSelect, groupName) {
	        const checkedRadio = this.getCheckedRadioFromGroup(groupName);
	        if (checkedRadio && !radioBtnToSelect.readonly) {
	            this._deselectRadio(checkedRadio);
	            this.checkedRadios.set(groupName, radioBtnToSelect);
	        }
	        // the focusable radio buttons are the enabled and the read-only ones, but only the enabled are selectable
	        if (radioBtnToSelect) {
	            radioBtnToSelect.focus();
	            if (!radioBtnToSelect.readonly) {
	                this._selectRadio(radioBtnToSelect);
	            }
	            else {
	                // Ensure updateTabOrder is called after focus
	                setTimeout(() => {
	                    this.updateTabOrder(groupName);
	                }, 0);
	            }
	        }
	    }
	    static _deselectRadio(radioBtn) {
	        if (radioBtn) {
	            radioBtn.checked = false;
	        }
	    }
	    static _selectRadio(radioBtn) {
	        radioBtn.checked = true;
	        radioBtn._checked = true;
	        radioBtn.fireDecoratorEvent("change");
	    }
	    static _nextFocusable(pos, group) {
	        if (!group) {
	            return null;
	        }
	        const groupLength = group.length;
	        let nextRadioToFocus = null;
	        if (pos === groupLength - 1) {
	            if (group[0].disabled) {
	                return this._nextFocusable(1, group);
	            }
	            nextRadioToFocus = group[0];
	        }
	        else if (group[pos + 1].disabled) {
	            return this._nextFocusable(pos + 1, group);
	        }
	        else {
	            nextRadioToFocus = group[pos + 1];
	        }
	        return nextRadioToFocus;
	    }
	    static _previousFocusable(pos, group) {
	        const groupLength = group.length;
	        let previousRadioToFocus = null;
	        if (pos === 0) {
	            if (group[groupLength - 1].disabled) {
	                return this._previousFocusable(groupLength - 1, group);
	            }
	            previousRadioToFocus = group[groupLength - 1];
	        }
	        else if (group[pos - 1].disabled) {
	            return this._previousFocusable(pos - 1, group);
	        }
	        else {
	            previousRadioToFocus = group[pos - 1];
	        }
	        return previousRadioToFocus;
	    }
	    static enforceSingleSelection(radioBtn, groupName) {
	        const checkedRadio = this.getCheckedRadioFromGroup(groupName);
	        if (radioBtn.checked) {
	            if (!checkedRadio) {
	                this.checkedRadios.set(groupName, radioBtn);
	            }
	            else if (radioBtn !== checkedRadio) {
	                this._deselectRadio(checkedRadio);
	                this.checkedRadios.set(groupName, radioBtn);
	            }
	        }
	        else if (radioBtn === checkedRadio) {
	            this.checkedRadios.set(groupName, null);
	        }
	        this.updateTabOrder(groupName);
	        this.updateFormValidity(groupName);
	    }
	    static get groups() {
	        if (!this._groups) {
	            this._groups = new Map();
	        }
	        return this._groups;
	    }
	    static get checkedRadios() {
	        if (!this._checkedRadios) {
	            this._checkedRadios = new Map();
	        }
	        return this._checkedRadios;
	    }
	}

	function RadioButtonTemplate() {
	    return (i18nDefaults.jsxs("div", { role: "radio", class: "ui5-radio-root", "aria-checked": this.checked, "aria-disabled": this.effectiveAriaDisabled, "aria-describedby": this.effectiveAriaDescribedBy, "aria-label": this.ariaLabelText, tabindex: this.effectiveTabIndex, onClick: this._onclick, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onMouseDown: this._onmousedown, onMouseUp: this._onmouseup, onFocusOut: this._onfocusout, children: [i18nDefaults.jsxs("div", { class: {
	                    "ui5-radio-inner": true,
	                    "ui5-radio-inner--hoverable": !this.disabled && !this.readonly && webcomponentsBase.f$1(),
	                }, children: [i18nDefaults.jsxs("svg", { class: "ui5-radio-svg", focusable: "false", "aria-hidden": "true", children: [i18nDefaults.jsx("circle", { part: "outer-ring", class: "ui5-radio-svg-outer", cx: "50%", cy: "50%", r: "50%" }), i18nDefaults.jsx("circle", { part: "inner-ring", class: "ui5-radio-svg-inner", cx: "50%", cy: "50%" })] }), i18nDefaults.jsx("input", { type: "radio", required: this.required, checked: this.checked, readonly: this.readonly, disabled: this.disabled, name: this.name, "data-sap-no-tab-ref": true })] }), this.text &&
	                i18nDefaults.jsx(ListItemBase.Label, { id: `${this._id}-label`, class: "ui5-radio-label", for: this._id, wrappingType: this.wrappingType, children: this.text }), this.hasValueState &&
	                i18nDefaults.jsx("span", { id: `${this._id}-descr`, class: "ui5-hidden-text", children: this.valueStateText })] }));
	}

	webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
	webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
	var radioButtonCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5-v2-11-0_radio_button_min_width);max-width:100%;text-overflow:ellipsis;overflow:hidden;color:var(--_ui5-v2-11-0_radio_button_color);border-radius:var(--_ui5-v2-11-0_radio_button_border_radius)}:host(:not([disabled])) .ui5-radio-root{cursor:pointer}:host([checked]){color:var(--_ui5-v2-11-0_radio_button_checked_fill)}:host([checked]) .ui5-radio-svg-inner{fill:var(--_ui5-v2-11-0_radio_button_inner_ring_color)}:host([checked]) .ui5-radio-svg-outer{stroke:var(--_ui5-v2-11-0_radio_button_outer_ring_color)}:host([disabled]) .ui5-radio-root{color:var(--_ui5-v2-11-0_radio_button_color);opacity:var(--sapContent_DisabledOpacity)}:host([disabled][checked]) .ui5-radio-svg-outer{stroke:var(--_ui5-v2-11-0_radio_button_color)}:host(:not([disabled])[desktop]) .ui5-radio-root:focus:before,:host(:not([disabled])) .ui5-radio-root:focus-visible:before{content:"";display:var(--_ui5-v2-11-0_radio_button_focus_outline);position:absolute;inset:var(--_ui5-v2-11-0_radio_button_focus_dist);pointer-events:none;border:var(--_ui5-v2-11-0_radio_button_border_width) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--_ui5-v2-11-0_radio_button_border_radius)}:host(:not([value-state="Negative"]):not([value-state="Critical"]):not([value-state="Positive"]):not([value-state="Information"])) .ui5-radio-root:hover .ui5-radio-inner--hoverable .ui5-radio-svg-outer{stroke:var(--_ui5-v2-11-0_radio_button_outer_ring_hover_color)}:host(:not([value-state="Negative"]):not([value-state="Critical"]):not([value-state="Positive"]):not([value-state="Information"])[checked]) .ui5-radio-root:hover .ui5-radio-inner--hoverable .ui5-radio-svg-outer{stroke:var(--_ui5-v2-11-0_radio_button_outer_ring_checked_hover_color)}.ui5-radio-root:hover .ui5-radio-inner--hoverable .ui5-radio-svg-outer,:host([checked]) .ui5-radio-root:hover .ui5-radio-inner--hoverable .ui5-radio-svg-outer{fill:var(--_ui5-v2-11-0_radio_button_hover_fill)}:host([active][checked]:not([value-state]):not([disabled]):not([readonly])) .ui5-radio-svg-outer{stroke:var(--_ui5-v2-11-0_radio_button_outer_ring_checked_hover_color)}:host([active]:not([checked]):not([value-state]):not([disabled]):not([readonly])) .ui5-radio-svg-outer{stroke:var(--_ui5-v2-11-0_radio_button_outer_ring_active_color)}:host([text]) .ui5-radio-root{padding-inline-end:var(--_ui5-v2-11-0_radio_button_border_width)}:host([text][desktop]) .ui5-radio-root:focus:before,:host([text]) .ui5-radio-root:focus-visible:before{inset-inline-end:0px}:host([text]) .ui5-radio-inner{padding:var(--_ui5-v2-11-0_radio_button_outer_ring_padding_with_label)}:host([checked][readonly]) .ui5-radio-svg-inner{fill:var(--_ui5-v2-11-0_radio_button_read_only_inner_ring_color)}:host([readonly]) .ui5-radio-root .ui5-radio-svg-outer{fill:var(--sapField_ReadOnly_Background);stroke:var(--sapField_ReadOnly_BorderColor);stroke-dasharray:var(--_ui5-v2-11-0_radio_button_read_only_border_type);stroke-width:var(--_ui5-v2-11-0_radio_button_read_only_border_width)}:host([value-state="Negative"]) .ui5-radio-svg-outer,:host([value-state="Critical"]) .ui5-radio-svg-outer{stroke-width:var(--sapField_InvalidBorderWidth)}:host([value-state="Information"]) .ui5-radio-svg-outer{stroke-width:var(--_ui5-v2-11-0_radio_button_information_border_width)}:host([value-state="Negative"][checked]) .ui5-radio-svg-inner{fill:var(--_ui5-v2-11-0_radio_button_checked_error_fill)}:host([value-state="Negative"]) .ui5-radio-svg-outer,:host([value-state="Negative"]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable:hover .ui5-radio-svg-outer{stroke:var(--sapField_InvalidColor);fill:var(--sapField_InvalidBackground)}:host([value-state="Negative"]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable .ui5-radio-svg-outer{fill:var(--_ui5-v2-11-0_radio_button_hover_fill_error)}:host([value-state="Critical"][checked]) .ui5-radio-svg-inner{fill:var(--_ui5-v2-11-0_radio_button_checked_warning_fill)}:host([value-state="Critical"]) .ui5-radio-svg-outer,:host([value-state="Critical"]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable:hover .ui5-radio-svg-outer{stroke:var(--sapField_WarningColor);fill:var(--sapField_WarningBackground)}:host([value-state="Critical"]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable .ui5-radio-svg-outer{fill:var(--_ui5-v2-11-0_radio_button_hover_fill_warning)}:host([value-state="Positive"][checked]) .ui5-radio-svg-inner{fill:var(--_ui5-v2-11-0_radio_button_checked_success_fill)}:host([value-state="Positive"]) .ui5-radio-svg-outer,:host([value-state="Positive"]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable:hover .ui5-radio-svg-outer{stroke:var(--sapField_SuccessColor);fill:var(--sapField_SuccessBackground)}:host([value-state="Positive"]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable .ui5-radio-svg-outer{fill:var(--_ui5-v2-11-0_radio_button_hover_fill_success)}:host([value-state="Information"][checked]) .ui5-radio-svg-inner{fill:var(--_ui5-v2-11-0_radio_button_checked_information_fill)}:host([value-state="Information"]) .ui5-radio-svg-outer,:host([value-state="Information"]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable:hover .ui5-radio-svg-outer{stroke:var(--sapField_InformationColor);fill:var(--sapField_InformationBackground)}:host([value-state="Information"]) .ui5-radio-root:hover .ui5-radio-inner.ui5-radio-inner--hoverable .ui5-radio-svg-outer{fill:var(--_ui5-v2-11-0_radio_button_hover_fill_information)}:host([value-state="Negative"]) .ui5-radio-root,:host([value-state="Critical"]) .ui5-radio-root,:host([value-state="Information"]) .ui5-radio-root{stroke-dasharray:var(--_ui5-v2-11-0_radio_button_warning_error_border_dash)}.ui5-radio-root{height:auto;position:relative;display:inline-flex;flex-wrap:nowrap;outline:none;max-width:100%;box-sizing:border-box;border:var(--_ui5-v2-11-0_radio_button_border);border-radius:var(--_ui5-v2-11-0_radio_button_border_radius)}.ui5-radio-inner{display:flex;align-items:center;padding:var(--_ui5-v2-11-0_radio_button_outer_ring_padding);flex-shrink:0;height:var(--_ui5-v2-11-0_radio_button_inner_size);font-size:1rem;pointer-events:none;vertical-align:top}.ui5-radio-inner{outline:none}.ui5-radio-inner input{-webkit-appearance:none;visibility:hidden;width:0;left:0;position:absolute;font-size:inherit;margin:0}[ui5-label].ui5-radio-label{display:flex;align-items:center;padding-inline-end:var(--_ui5-v2-11-0_radio_button_label_offset);padding-block:var(--_ui5-v2-11-0_radio_button_label_side_padding);vertical-align:top;max-width:100%;pointer-events:none;color:var(--_ui5-v2-11-0_radio_button_label_color);overflow-wrap:break-word}:host([wrapping-type="None"][text]) .ui5-radio-root{height:var(--_ui5-v2-11-0_radio_button_height)}:host([wrapping-type="None"][text]) [ui5-label].ui5-radio-label{text-overflow:ellipsis;overflow:hidden}.ui5-radio-svg{height:var(--_ui5-v2-11-0_radio_button_svg_size);width:var(--_ui5-v2-11-0_radio_button_svg_size);overflow:visible;pointer-events:none}.ui5-radio-svg-outer{fill:var(--_ui5-v2-11-0_radio_button_outer_ring_bg);stroke:currentColor;stroke-width:var(--_ui5-v2-11-0_radio_button_outer_ring_width)}.ui5-radio-svg-inner{fill:none;r:var(--_ui5-v2-11-0_radio_button_inner_ring_radius)}.ui5-radio-svg-outer,.ui5-radio-svg-inner{flex-shrink:0}:host(.ui5-li-singlesel-radiobtn) .ui5-radio-root .ui5-radio-inner .ui5-radio-svg-outer{fill:var(--sapList_Background)}
`;

	var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var RadioButton_1;
	let isGlobalHandlerAttached$1 = false;
	let activeRadio;
	/**
	 * @class
	 *
	 * ### Overview
	 *
	 * The `ui5-radio-button` component enables users to select a single option from a set of options.
	 * When a `ui5-radio-button` is selected by the user, the
	 * `change` event is fired.
	 * When a `ui5-radio-button` that is within a group is selected, the one
	 * that was previously selected gets automatically deselected. You can group radio buttons by using the `name` property.
	 *
	 * **Note:** If `ui5-radio-button` is not part of a group, it can be selected once, but can not be deselected back.
	 *
	 * ### Keyboard Handling
	 *
	 * Once the `ui5-radio-button` is on focus, it might be selected by pressing the Space and Enter keys.
	 *
	 * The Arrow Down/Arrow Up and Arrow Left/Arrow Right keys can be used to change selection between next/previous radio buttons in one group,
	 * while TAB and SHIFT + TAB can be used to enter or leave the radio button group.
	 *
	 * **Note:** On entering radio button group, the focus goes to the currently selected radio button.
	 *
	 * ### ES6 Module Import
	 *
	 * `import "ui5/webcomponents/dist/RadioButton";`
	 * @constructor
	 * @extends UI5Element
	 * @public
	 * @csspart outer-ring - Used to style the outer ring of the `ui5-radio-button`.
	 * @csspart inner-ring - Used to style the inner ring of the `ui5-radio-button`.
	 */
	let RadioButton = RadioButton_1 = class RadioButton extends webcomponentsBase.b {
	    get formValidityMessage() {
	        return RadioButton_1.i18nBundle.getText(i18nDefaults.FORM_SELECTABLE_REQUIRED2);
	    }
	    get formValidity() {
	        return { valueMissing: this._groupRequired && !this._groupChecked };
	    }
	    async formElementAnchor() {
	        return this.getFocusDomRefAsync();
	    }
	    get formFormattedValue() {
	        return this.checked ? (this.value || "on") : null;
	    }
	    constructor() {
	        super();
	        /**
	         * Defines whether the component is disabled.
	         *
	         * **Note:** A disabled component is completely noninteractive.
	         * @default false
	         * @public
	         */
	        this.disabled = false;
	        /**
	         * Defines whether the component is read-only.
	         *
	         * **Note:** A read-only component isn't editable or selectable.
	         * However, because it's focusable, it still provides visual feedback upon user interaction.
	         * @default false
	         * @public
	         */
	        this.readonly = false;
	        /**
	         * Defines whether the component is required.
	         * @default false
	         * @public
	         * @since 1.9.0
	         */
	        this.required = false;
	        /**
	         * Defines whether the component is checked or not.
	         *
	         * **Note:** The property value can be changed with user interaction,
	         * either by clicking/tapping on the component,
	         * or by using the Space or Enter key.
	         *
	         * **Note:** Only enabled radio buttons can be checked.
	         * Read-only radio buttons are not selectable, and therefore are always unchecked.
	         * @default false
	         * @formEvents change
	         * @formProperty
	         * @public
	         * @since 1.0.0-rc.15
	         */
	        this.checked = false;
	        /**
	         * Defines the value state of the component.
	         * @default "None"
	         * @public
	         */
	        this.valueState = "None";
	        /**
	         * Defines the form value of the component.
	         * When a form with a radio button group is submitted, the group's value
	         * will be the value of the currently selected radio button.
	         * @default ""
	         * @public
	         */
	        this.value = "";
	        /**
	         * Defines whether the component text wraps when there is not enough space.
	         *
	         * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
	         * @default "Normal"
	         * @public
	         */
	        this.wrappingType = "Normal";
	        /**
	         * Defines the active state (pressed or not) of the component.
	         * @default false
	         * @private
	         */
	        this.active = false;
	        /**
	         * Defines if the component is selected in specific group
	         * @default false
	         * @private
	         */
	        this._groupChecked = false;
	        this._groupRequired = false;
	        this._name = "";
	        this._checked = false;
	        this._deactivate = () => {
	            if (activeRadio) {
	                activeRadio.active = false;
	            }
	        };
	        if (!isGlobalHandlerAttached$1) {
	            document.addEventListener("mouseup", this._deactivate);
	            isGlobalHandlerAttached$1 = true;
	        }
	    }
	    onAfterRendering() {
	        this.syncGroup();
	    }
	    onEnterDOM() {
	        if (webcomponentsBase.f$1()) {
	            this.setAttribute("desktop", "");
	        }
	    }
	    onExitDOM() {
	        this.syncGroup(true);
	    }
	    syncGroup(forceRemove) {
	        const oldGroup = this._name;
	        const currentGroup = this.name;
	        const oldChecked = this._checked;
	        const currentChecked = this.checked;
	        if (forceRemove) {
	            RadioButtonGroup.removeFromGroup(this, oldGroup);
	        }
	        if (currentGroup !== oldGroup) {
	            if (oldGroup) {
	                // remove the control from the previous group
	                RadioButtonGroup.removeFromGroup(this, oldGroup);
	            }
	            if (currentGroup) {
	                // add the control to the existing group
	                RadioButtonGroup.addToGroup(this, currentGroup);
	            }
	        }
	        else if (currentGroup && this.isConnected) {
	            RadioButtonGroup.enforceSingleSelection(this, currentGroup);
	        }
	        if (this.name && currentChecked !== oldChecked) {
	            RadioButtonGroup.updateTabOrder(this.name);
	        }
	        this._name = this.name || "";
	        this._checked = this.checked;
	    }
	    _onclick() {
	        return this.toggle();
	    }
	    _handleDown(e) {
	        const currentGroup = this.name;
	        if (!currentGroup) {
	            return;
	        }
	        e.preventDefault();
	        RadioButtonGroup.selectNextItem(this, currentGroup);
	    }
	    _handleUp(e) {
	        const currentGroup = this.name;
	        if (!currentGroup) {
	            return;
	        }
	        e.preventDefault();
	        RadioButtonGroup.selectPreviousItem(this, currentGroup);
	    }
	    _onkeydown(e) {
	        if (webcomponentsBase.i(e)) {
	            this.active = true;
	            return e.preventDefault();
	        }
	        if (webcomponentsBase.b$1(e)) {
	            this.active = true;
	            return this.toggle();
	        }
	        const isRTL = this.effectiveDir === "rtl";
	        if (webcomponentsBase.P(e) || (!isRTL && webcomponentsBase.c(e)) || (isRTL && webcomponentsBase.K(e))) {
	            this._handleDown(e);
	        }
	        if (webcomponentsBase.D$1(e) || (!isRTL && webcomponentsBase.K(e)) || (isRTL && webcomponentsBase.c(e))) {
	            this._handleUp(e);
	        }
	    }
	    _onkeyup(e) {
	        if (webcomponentsBase.i(e)) {
	            this.toggle();
	        }
	        this.active = false;
	    }
	    _onmousedown() {
	        this.active = true;
	        activeRadio = this; // eslint-disable-line
	    }
	    _onmouseup() {
	        this.active = false;
	    }
	    _onfocusout() {
	        this.active = false;
	    }
	    toggle() {
	        if (!this.canToggle()) {
	            return this;
	        }
	        if (!this.name) {
	            this.checked = !this.checked;
	            this.fireDecoratorEvent("change");
	            return this;
	        }
	        RadioButtonGroup.selectItem(this, this.name);
	        return this;
	    }
	    canToggle() {
	        return !(this.disabled || this.readonly || this.checked);
	    }
	    get effectiveAriaDisabled() {
	        return (this.disabled || this.readonly) ? true : undefined;
	    }
	    get ariaLabelText() {
	        return [i18nDefaults.A(this), this.text].filter(Boolean).join(" ");
	    }
	    get effectiveAriaDescribedBy() {
	        return this.hasValueState ? `${this._id}-descr` : undefined;
	    }
	    get hasValueState() {
	        return this.valueState !== ValueState.o.None;
	    }
	    get valueStateText() {
	        switch (this.valueState) {
	            case ValueState.o.Negative:
	                return RadioButton_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR);
	            case ValueState.o.Critical:
	                return RadioButton_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING);
	            case ValueState.o.Positive:
	                return RadioButton_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS);
	            case ValueState.o.Information:
	                return RadioButton_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION);
	            default:
	                return "";
	        }
	    }
	    get effectiveTabIndex() {
	        const tabindex = this.getAttribute("tabindex");
	        if (this.disabled) {
	            return -1;
	        }
	        if (this.name) {
	            return this._tabIndex;
	        }
	        return tabindex ? parseInt(tabindex) : 0;
	    }
	};
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], RadioButton.prototype, "disabled", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], RadioButton.prototype, "readonly", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], RadioButton.prototype, "required", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], RadioButton.prototype, "checked", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], RadioButton.prototype, "text", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], RadioButton.prototype, "valueState", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], RadioButton.prototype, "name", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], RadioButton.prototype, "value", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], RadioButton.prototype, "wrappingType", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], RadioButton.prototype, "accessibleName", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], RadioButton.prototype, "accessibleNameRef", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Number })
	], RadioButton.prototype, "_tabIndex", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], RadioButton.prototype, "active", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean, noAttribute: true })
	], RadioButton.prototype, "_groupChecked", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean, noAttribute: true })
	], RadioButton.prototype, "_groupRequired", void 0);
	__decorate$2([
	    i18nDefaults.i("ui5/webcomponents")
	], RadioButton, "i18nBundle", void 0);
	RadioButton = RadioButton_1 = __decorate$2([
	    webcomponentsBase.m({
	        tag: "ui5-radio-button",
	        languageAware: true,
	        formAssociated: true,
	        renderer: i18nDefaults.y,
	        template: RadioButtonTemplate,
	        styles: radioButtonCss,
	    })
	    /**
	     * Fired when the component checked state changes.
	     * @public
	     * @since 1.0.0-rc.15
	     */
	    ,
	    i18nDefaults.l("change", {
	        bubbles: true,
	    })
	], RadioButton);
	RadioButton.define();
	var RadioButton$1 = RadioButton;

	webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
	webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
	var checkboxCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host(:not([hidden])){display:inline-block}:host([required]){vertical-align:middle}:host{overflow:hidden;max-width:100%;outline:none;border-radius:var(--_ui5-v2-11-0_checkbox_border_radius);transition:var(--_ui5-v2-11-0_checkbox_transition);cursor:pointer;user-select:none;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none}:host([disabled]){cursor:default}:host([disabled]) .ui5-checkbox-root{opacity:var(--_ui5-v2-11-0_checkbox_disabled_opacity)}:host([disabled]) .ui5-checkbox-inner{border-color:var(--_ui5-v2-11-0_checkbox_inner_disabled_border_color)}:host([disabled]) .ui5-checkbox-label{color:var(--_ui5-v2-11-0_checkbox_disabled_label_color)}:host([readonly]:not([value-state="Critical"]):not([value-state="Negative"])) .ui5-checkbox-inner{background:var(--sapField_ReadOnly_Background);border:var(--_ui5-v2-11-0_checkbox_inner_readonly_border);color:var(--sapField_TextColor)}:host(:not([wrapping-type="None"])[text]) .ui5-checkbox-root{min-height:auto;box-sizing:border-box;align-items:flex-start;padding-top:var(--_ui5-v2-11-0_checkbox_root_side_padding);padding-bottom:var(--_ui5-v2-11-0_checkbox_root_side_padding)}:host(:not([wrapping-type="None"])[text]) .ui5-checkbox-root .ui5-checkbox-label{overflow-wrap:break-word;align-self:center}:host([desktop][text]:not([wrapping-type="None"])) .ui5-checkbox-root:focus:before,.ui5-checkbox-root[text]:focus-visible:before{inset-block:var(--_ui5-v2-11-0_checkbox_wrapped_focus_inset_block)}:host([value-state="Negative"]) .ui5-checkbox-inner,:host([value-state="Negative"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--sapField_InvalidBackground);border:var(--_ui5-v2-11-0_checkbox_inner_error_border);color:var(--sapField_InvalidColor)}:host([value-state="Negative"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-11-0_checkbox_inner_error_background_hover)}:host([value-state="Critical"]) .ui5-checkbox-inner,:host([value-state="Critical"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--sapField_WarningBackground);border:var(--_ui5-v2-11-0_checkbox_inner_warning_border);color:var(--_ui5-v2-11-0_checkbox_inner_warning_color)}:host([value-state="Critical"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-11-0_checkbox_inner_warning_background_hover)}:host([value-state="Information"]) .ui5-checkbox-inner,:host([value-state="Information"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--sapField_InformationBackground);border:var(--_ui5-v2-11-0_checkbox_inner_information_border);color:var(--_ui5-v2-11-0_checkbox_inner_information_color)}:host([value-state="Information"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-11-0_checkbox_inner_information_background_hover)}:host([value-state="Positive"]) .ui5-checkbox-inner,:host([value-state="Positive"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--sapField_SuccessBackground);border:var(--_ui5-v2-11-0_checkbox_inner_success_border);color:var(--sapField_SuccessColor)}:host([value-state="Positive"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-11-0_checkbox_inner_success_background_hover)}:host([value-state="Critical"]) .ui5-checkbox-icon,:host([value-state="Critical"][indeterminate]) .ui5-checkbox-inner:after{color:var(--_ui5-v2-11-0_checkbox_checkmark_warning_color)}.ui5-checkbox-root{position:relative;display:inline-flex;align-items:center;max-width:100%;min-height:var(--_ui5-v2-11-0_checkbox_width_height);min-width:var(--_ui5-v2-11-0_checkbox_width_height);padding:0 var(--_ui5-v2-11-0_checkbox_wrapper_padding);outline:none;transition:var(--_ui5-v2-11-0_checkbox_transition);border:var(--_ui5-v2-11-0_checkbox_default_focus_border);border-radius:var(--_ui5-v2-11-0_checkbox_border_radius);box-sizing:border-box}:host([desktop]) .ui5-checkbox-root:focus:before,.ui5-checkbox-root:focus-visible:before{display:var(--_ui5-v2-11-0_checkbox_focus_outline_display);content:"";position:absolute;inset-inline:var(--_ui5-v2-11-0_checkbox_focus_position);inset-block:var(--_ui5-v2-11-0_checkbox_focus_position);border:var(--_ui5-v2-11-0_checkbox_focus_outline);border-radius:var(--_ui5-v2-11-0_checkbox_focus_border_radius)}:host([text]) .ui5-checkbox-root{padding-inline-end:var(--_ui5-v2-11-0_checkbox_right_focus_distance)}:host([text]) .ui5-checkbox-root:focus:before,:host([text]) .ui5-checkbox-root:focus-visible:before{inset-inline-end:0}:host(:hover:not([disabled])){background:var(--_ui5-v2-11-0_checkbox_outer_hover_background)}.ui5-checkbox--hoverable .ui5-checkbox-label:hover{color:var(--_ui5-v2-11-0_checkbox_label_color)}:host(:not([active]):not([checked]):not([value-state])) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner,:host(:not([active]):not([checked])[value-state="None"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-11-0_checkbox_hover_background);border-color:var(--_ui5-v2-11-0_checkbox_inner_hover_border_color)}:host(:not([active])[checked]:not([value-state])) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner,:host(:not([active])[checked][value-state="None"]) .ui5-checkbox--hoverable:hover .ui5-checkbox-inner{background:var(--_ui5-v2-11-0_checkbox_hover_background);border-color:var(--_ui5-v2-11-0_checkbox_inner_hover_checked_border_color)}:host([checked]:not([value-state])) .ui5-checkbox-inner,:host([checked][value-state="None"]) .ui5-checkbox-inner{border-color:var(--_ui5-v2-11-0_checkbox_inner_selected_border_color)}:host([active]:not([checked]):not([value-state]):not([disabled])) .ui5-checkbox-inner,:host([active]:not([checked])[value-state="None"]:not([disabled])) .ui5-checkbox-inner{border-color:var(--_ui5-v2-11-0_checkbox_inner_active_border_color);background-color:var(--_ui5-v2-11-0_checkbox_active_background)}:host([active][checked]:not([value-state]):not([disabled])) .ui5-checkbox-inner,:host([active][checked][value-state="None"]:not([disabled])) .ui5-checkbox-inner{border-color:var(--_ui5-v2-11-0_checkbox_inner_selected_border_color);background-color:var(--_ui5-v2-11-0_checkbox_active_background)}.ui5-checkbox-inner{min-width:var(--_ui5-v2-11-0_checkbox_inner_width_height);max-width:var(--_ui5-v2-11-0_checkbox_inner_width_height);height:var(--_ui5-v2-11-0_checkbox_inner_width_height);max-height:var(--_ui5-v2-11-0_checkbox_inner_width_height);border:var(--_ui5-v2-11-0_checkbox_inner_border);border-radius:var(--_ui5-v2-11-0_checkbox_inner_border_radius);background:var(--_ui5-v2-11-0_checkbox_inner_background);color:var(--_ui5-v2-11-0_checkbox_checkmark_color);box-sizing:border-box;position:relative;cursor:inherit}:host([indeterminate][checked]) .ui5-checkbox-inner:after{content:"";background-color:currentColor;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:var(--_ui5-v2-11-0_checkbox_partially_icon_size);height:var(--_ui5-v2-11-0_checkbox_partially_icon_size)}:host input{-webkit-appearance:none;visibility:hidden;width:0;left:0;position:absolute;font-size:inherit}.ui5-checkbox-root .ui5-checkbox-label{margin-inline-start:var(--_ui5-v2-11-0_checkbox_label_offset);cursor:inherit;text-overflow:ellipsis;overflow:hidden;pointer-events:none;color:var(--_ui5-v2-11-0_checkbox_label_color)}.ui5-checkbox-icon{width:var(--_ui5-v2-11-0_checkbox_icon_size);height:var(--_ui5-v2-11-0_checkbox_icon_size);color:currentColor;cursor:inherit;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}:host([display-only]){cursor:default}:host([display-only]) .ui5-checkbox-display-only-icon-inner [ui5-icon]{color:var(--sapTextColor)}:host([display-only]) .ui5-checkbox-display-only-icon-inner{min-width:var(--_ui5-v2-11-0_checkbox_inner_width_height);max-width:var(--_ui5-v2-11-0_checkbox_inner_width_height);height:var(--_ui5-v2-11-0_checkbox_inner_width_height);max-height:var(--_ui5-v2-11-0_checkbox_inner_width_height);display:flex;align-items:center;justify-content:center}
`;

	const name$7 = "accept";
	const pathData$7 = "M455.8 94q9 9 3 19l-222 326q-4 8-12 9t-14-5l-151-167q-5-5-4.5-11t5.5-11l25-25q12-12 23 0l96 96q5 5 13 4.5t12-8.5l175-249q4-7 11.5-8t13.5 4z";
	const ltr$7 = true;
	const collection$7 = "SAP-icons-v4";
	const packageName$7 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$7, { pathData: pathData$7, ltr: ltr$7, collection: collection$7, packageName: packageName$7 });

	const name$6 = "accept";
	const pathData$6 = "M187 416q-12 0-20-9L71 299q-7-7-7-17 0-11 7.5-18.5T90 256q12 0 19 9l77 87 217-247q8-9 19-9t18.5 7.5T448 122q0 10-6 16L206 407q-7 9-19 9z";
	const ltr$6 = true;
	const collection$6 = "SAP-icons-v5";
	const packageName$6 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$6, { pathData: pathData$6, ltr: ltr$6, collection: collection$6, packageName: packageName$6 });

	var accept = "accept";

	const name$5 = "complete";
	const pathData$5 = "M431.958 320h32v128q0 14-9.5 23t-22.5 9h-384q-14 0-23-9t-9-23V64q0-13 9-22.5t23-9.5h128v32h-128v384h384V320zm60-295q7 7 2 16l-185 272q-3 6-10 7t-12-4l-125-139q-9-9 0-18l21-21q10-10 19 0l80 80q5 5 11.5 4t9.5-8l146-207q3-6 9.5-7t11.5 4z";
	const ltr$5 = true;
	const collection$5 = "SAP-icons-v4";
	const packageName$5 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$5, { pathData: pathData$5, ltr: ltr$5, collection: collection$5, packageName: packageName$5 });

	const name$4 = "complete";
	const pathData$4 = "M438 224q11 0 18.5 7.5T464 250v140q0 38-26 64t-64 26H106q-38 0-64-26t-26-64V122q0-38 26-64t64-26h237q11 0 18 7.5t7 18.5-7 18-18 7H106q-16 0-27.5 11.5T67 122v268q0 16 11.5 27.5T106 429h268q16 0 27.5-11.5T413 390V250q0-11 7-18.5t18-7.5zm32-192q11 0 18.5 7.5T496 58q0 10-7 17L257 312q-6 8-18 8-10 0-18-8l-70-71q-7-7-7-18t7.5-18 18.5-7 18 7l51 53L452 40q8-8 18-8z";
	const ltr$4 = true;
	const collection$4 = "SAP-icons-v5";
	const packageName$4 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$4, { pathData: pathData$4, ltr: ltr$4, collection: collection$4, packageName: packageName$4 });

	var complete = "complete";

	const name$3 = "border";
	const pathData$3 = "M448 32q13 0 22.5 9t9.5 23v384q0 14-9.5 23t-22.5 9H64q-14 0-23-9t-9-23V64q0-14 9-23t23-9h384zm0 32H64v384h384V64z";
	const ltr$3 = false;
	const collection$3 = "SAP-icons-v4";
	const packageName$3 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$3, { pathData: pathData$3, ltr: ltr$3, collection: collection$3, packageName: packageName$3 });

	const name$2 = "border";
	const pathData$2 = "M390 480H122q-38 0-64-26t-26-64V122q0-38 26-64t64-26h268q38 0 64 26t26 64v268q0 38-26 64t-64 26zM122 83q-17 0-28 11t-11 28v268q0 17 11 28t28 11h268q17 0 28-11t11-28V122q0-17-11-28t-28-11H122z";
	const ltr$2 = false;
	const collection$2 = "SAP-icons-v5";
	const packageName$2 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$2, { pathData: pathData$2, ltr: ltr$2, collection: collection$2, packageName: packageName$2 });

	var border = "border";

	const name$1 = "tri-state";
	const pathData$1 = "M448 32q13 0 22.5 9.5T480 64v384q0 14-9.5 23t-22.5 9H64q-14 0-23-9t-9-23V64q0-13 9-22.5T64 32h384zm0 32H64v384h384V64zM160 345V169q0-8 8-8h176q8 0 8 8v176q0 8-8 8H168q-8 0-8-8z";
	const ltr$1 = false;
	const collection$1 = "SAP-icons-v4";
	const packageName$1 = "ui5/webcomponents-icons";

	webcomponentsBase.f(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

	const name = "tri-state";
	const pathData = "M390 32q38 0 64 26t26 64v268q0 38-26 64t-64 26H122q-38 0-64-26t-26-64V122q0-38 26-64t64-26h268zm39 90q0-17-11-28t-28-11H122q-17 0-28 11t-11 28v268q0 17 11 28t28 11h268q17 0 28-11t11-28V122zm-77 38v192H160V160h192z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "ui5/webcomponents-icons";

	webcomponentsBase.f(name, { pathData, ltr, collection, packageName });

	var triState = "tri-state";

	function CheckBoxTemplate() {
	    return (i18nDefaults.jsxs("div", { class: {
	            "ui5-checkbox-root": true,
	            "ui5-checkbox--hoverable": !this.disabled && !this.readonly && webcomponentsBase.f$1(),
	        }, role: "checkbox", part: "root", "aria-checked": this.effectiveAriaChecked, "aria-readonly": this.ariaReadonly, "aria-disabled": this.effectiveAriaDisabled, "aria-label": this.ariaLabelText, "aria-labelledby": this.ariaLabelledBy, "aria-describedby": this.ariaDescribedBy, "aria-required": this.required, tabindex: this.effectiveTabIndex, onMouseDown: this._onmousedown, onMouseUp: this._onmouseup, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onClick: this._onclick, onFocusOut: this._onfocusout, children: [this.isDisplayOnly ?
	                i18nDefaults.jsx("div", { class: "ui5-checkbox-display-only-icon-inner", children: i18nDefaults.jsx(Icon.Icon, { "aria-hidden": "true", name: displayOnlyIcon.call(this), class: "ui5-checkbox-display-only-icon", part: "icon" }) })
	                :
	                    i18nDefaults.jsx("div", { id: `${this._id}-CbBg`, class: "ui5-checkbox-inner", children: this.isCompletelyChecked &&
	                            i18nDefaults.jsx(Icon.Icon, { "aria-hidden": "true", name: accept, class: "ui5-checkbox-icon", part: "icon" }) }), i18nDefaults.jsx("input", { id: `${this._id}-CB`, type: "checkbox", checked: this.checked, readonly: this.readonly, disabled: this.disabled, tabindex: -1, "aria-hidden": "true", "data-sap-no-tab-ref": true }), this.text &&
	                i18nDefaults.jsx(ListItemBase.Label, { id: `${this._id}-label`, part: "label", class: "ui5-checkbox-label", wrappingType: this.wrappingType, required: this.required, children: this.text }), this.hasValueState &&
	                i18nDefaults.jsx("span", { id: `${this._id}-descr`, class: "ui5-hidden-text", children: this.valueStateText })] }));
	}
	function displayOnlyIcon() {
	    if (this.isCompletelyChecked) {
	        return complete;
	    }
	    if (this.checked && this.indeterminate) {
	        return triState;
	    }
	    return border;
	}

	var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var CheckBox_1;
	let isGlobalHandlerAttached = false;
	let activeCb;
	/**
	 * @class
	 *
	 * ### Overview
	 *
	 * Allows the user to set a binary value, such as true/false or yes/no for an item.
	 *
	 * The `ui5-checkbox` component consists of a box and a label that describes its purpose.
	 * If it's checked, an indicator is displayed inside the box.
	 * To check/uncheck the `ui5-checkbox`, the user has to click or tap the square
	 * box or its label.
	 *
	 * The `ui5-checkbox` component only has 2 states - checked and unchecked.
	 * Clicking or tapping toggles the `ui5-checkbox` between checked and unchecked state.
	 *
	 * ### Usage
	 *
	 * You can define the checkbox text with via the `text` property. If the text exceeds the available width, it is truncated by default.
	 * In case you prefer text to truncate, set the `wrappingType` property to "None".
	 * The touchable area for toggling the `ui5-checkbox` ends where the text ends.
	 *
	 * You can disable the `ui5-checkbox` by setting the `disabled` property to
	 * `true`,
	 * or use the `ui5-checkbox` in read-only mode by setting the `readonly`
	 * property to `true`.
	 *
	 * ### Keyboard Handling
	 *
	 * The user can use the following keyboard shortcuts to toggle the checked state of the `ui5-checkbox`.
	 *
	 * - [Space],[Enter] - Toggles between different states: checked, not checked.
	 *
	 * ### ES6 Module Import
	 *
	 * `import "ui5/webcomponents/dist/CheckBox.js";`
	 * @constructor
	 * @extends UI5Element
	 * @public
	 * @csspart root - Used to style the outermost wrapper of the `ui5-checkbox`
	 * @csspart label - Used to style the label of the `ui5-checkbox`
	 * @csspart icon - Used to style the icon of the `ui5-checkbox`
	 */
	let CheckBox = CheckBox_1 = class CheckBox extends webcomponentsBase.b {
	    get formValidityMessage() {
	        return CheckBox_1.i18nBundle.getText(i18nDefaults.FORM_CHECKABLE_REQUIRED);
	    }
	    get formValidity() {
	        return { valueMissing: this.required && !this.checked };
	    }
	    async formElementAnchor() {
	        return this.getFocusDomRefAsync();
	    }
	    get formFormattedValue() {
	        return this.checked ? "on" : null;
	    }
	    constructor() {
	        super();
	        /**
	         * Defines whether the component is disabled.
	         *
	         * **Note:** A disabled component is completely noninteractive.
	         * @default false
	         * @public
	         */
	        this.disabled = false;
	        /**
	         * Defines whether the component is read-only.
	         *
	         * **Note:** A read-only component is not editable,
	         * but still provides visual feedback upon user interaction.
	         * @default false
	         * @public
	         */
	        this.readonly = false;
	        /**
	         * Determines whether the `ui5-checkbox` is in display only state.
	         *
	         * When set to `true`, the `ui5-checkbox` is not interactive, not editable, not focusable
	         * and not in the tab chain. This setting is used for forms in review mode.
	         *
	         * **Note:** When the property `disabled` is set to `true` this property has no effect.
	         * @since 1.22.0
	         * @public
	         * @default false
	         */
	        this.displayOnly = false;
	        /**
	         * Defines whether the component is required.
	         *
	         * **Note:** We advise against using the text property of the checkbox when there is a
	         * label associated with it to avoid having two required asterisks.
	         * @default false
	         * @public
	         * @since 1.3.0
	         */
	        this.required = false;
	        /**
	        * Defines whether the component is displayed as partially checked.
	        *
	        * **Note:** The indeterminate state can be set only programmatically and can’t be achieved by user
	        * interaction and the resulting visual state depends on the values of the `indeterminate`
	        * and `checked` properties:
	        *
	        * -  If the component is checked and indeterminate, it will be displayed as partially checked
	        * -  If the component is checked and it is not indeterminate, it will be displayed as checked
	        * -  If the component is not checked, it will be displayed as not checked regardless value of the indeterminate attribute
	        * @default false
	        * @public
	        * @since 1.0.0-rc.15
	        */
	        this.indeterminate = false;
	        /**
	         * Defines if the component is checked.
	         *
	         * **Note:** The property can be changed with user interaction,
	         * either by cliking/tapping on the component, or by
	         * pressing the Enter or Space key.
	         * @default false
	         * @formEvents change
	         * @formProperty
	         * @public
	         */
	        this.checked = false;
	        /**
	         * Defines the value state of the component.
	         * @default "None"
	         * @public
	         */
	        this.valueState = "None";
	        /**
	         * Defines whether the component text wraps when there is not enough space.
	         *
	         * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
	         * **Note:** for option "None" the text will be truncated with an ellipsis.
	         * @default "Normal"
	         * @public
	         */
	        this.wrappingType = "Normal";
	        /**
	         * Defines the active state (pressed or not) of the component.
	         * @private
	         */
	        this.active = false;
	        this._deactivate = () => {
	            if (activeCb) {
	                activeCb.active = false;
	            }
	        };
	        if (!isGlobalHandlerAttached) {
	            document.addEventListener("mouseup", this._deactivate);
	            isGlobalHandlerAttached = true;
	        }
	    }
	    onEnterDOM() {
	        if (webcomponentsBase.f$1()) {
	            this.setAttribute("desktop", "");
	        }
	    }
	    _onclick() {
	        this.toggle();
	    }
	    _onmousedown() {
	        if (this.readonly || this.disabled) {
	            return;
	        }
	        this.active = true;
	        activeCb = this; // eslint-disable-line
	    }
	    _onmouseup() {
	        this.active = false;
	    }
	    _onfocusout() {
	        this.active = false;
	    }
	    _onkeydown(e) {
	        if (webcomponentsBase.i(e)) {
	            e.preventDefault();
	        }
	        if (this.readonly || this.disabled) {
	            return;
	        }
	        if (webcomponentsBase.b$1(e)) {
	            this.toggle();
	        }
	        this.active = true;
	    }
	    _onkeyup(e) {
	        if (webcomponentsBase.i(e)) {
	            this.toggle();
	        }
	        this.active = false;
	    }
	    toggle() {
	        if (this.canToggle()) {
	            const lastState = {
	                checked: this.checked,
	                indeterminate: this.indeterminate,
	            };
	            if (this.indeterminate) {
	                this.indeterminate = false;
	                this.checked = true;
	            }
	            else {
	                this.checked = !this.checked;
	            }
	            const changePrevented = !this.fireDecoratorEvent("change");
	            // Angular two way data binding
	            const valueChangePrevented = !this.fireDecoratorEvent("value-changed");
	            if (changePrevented || valueChangePrevented) {
	                this.checked = lastState.checked;
	                this.indeterminate = lastState.indeterminate;
	            }
	        }
	        return this;
	    }
	    canToggle() {
	        return !(this.disabled || this.readonly || this.displayOnly);
	    }
	    valueStateTextMappings() {
	        return {
	            "Negative": CheckBox_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
	            "Critical": CheckBox_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
	            "Positive": CheckBox_1.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
	        };
	    }
	    get ariaLabelText() {
	        return i18nDefaults.A(this);
	    }
	    get classes() {
	        return {
	            main: {
	                "ui5-checkbox--hoverable": !this.disabled && !this.readonly && webcomponentsBase.f$1(),
	            },
	        };
	    }
	    get ariaReadonly() {
	        return this.readonly || this.displayOnly ? "true" : undefined;
	    }
	    get effectiveAriaDisabled() {
	        return this.disabled ? "true" : undefined;
	    }
	    get effectiveAriaChecked() {
	        return this.indeterminate && this.checked ? "mixed" : this.checked;
	    }
	    get ariaLabelledBy() {
	        if (!this.ariaLabelText) {
	            return this.text ? `${this._id}-label` : undefined;
	        }
	        return undefined;
	    }
	    get ariaDescribedBy() {
	        return this.hasValueState ? `${this._id}-descr` : undefined;
	    }
	    get hasValueState() {
	        return this.valueState !== ValueState.o.None;
	    }
	    get valueStateText() {
	        if (this.valueState !== ValueState.o.None && this.valueState !== ValueState.o.Information) {
	            return this.valueStateTextMappings()[this.valueState];
	        }
	    }
	    get effectiveTabIndex() {
	        const tabindex = this.getAttribute("tabindex");
	        if (this.tabbable) {
	            return tabindex ? parseInt(tabindex) : 0;
	        }
	    }
	    get tabbable() {
	        return !this.disabled && !this.displayOnly;
	    }
	    get isCompletelyChecked() {
	        return this.checked && !this.indeterminate;
	    }
	    get isDisplayOnly() {
	        return this.displayOnly && !this.disabled;
	    }
	};
	__decorate$1([
	    webcomponentsBase.s()
	], CheckBox.prototype, "accessibleNameRef", void 0);
	__decorate$1([
	    webcomponentsBase.s()
	], CheckBox.prototype, "accessibleName", void 0);
	__decorate$1([
	    webcomponentsBase.s({ type: Boolean })
	], CheckBox.prototype, "disabled", void 0);
	__decorate$1([
	    webcomponentsBase.s({ type: Boolean })
	], CheckBox.prototype, "readonly", void 0);
	__decorate$1([
	    webcomponentsBase.s({ type: Boolean })
	], CheckBox.prototype, "displayOnly", void 0);
	__decorate$1([
	    webcomponentsBase.s({ type: Boolean })
	], CheckBox.prototype, "required", void 0);
	__decorate$1([
	    webcomponentsBase.s({ type: Boolean })
	], CheckBox.prototype, "indeterminate", void 0);
	__decorate$1([
	    webcomponentsBase.s({ type: Boolean })
	], CheckBox.prototype, "checked", void 0);
	__decorate$1([
	    webcomponentsBase.s()
	], CheckBox.prototype, "text", void 0);
	__decorate$1([
	    webcomponentsBase.s()
	], CheckBox.prototype, "valueState", void 0);
	__decorate$1([
	    webcomponentsBase.s()
	], CheckBox.prototype, "wrappingType", void 0);
	__decorate$1([
	    webcomponentsBase.s()
	], CheckBox.prototype, "name", void 0);
	__decorate$1([
	    webcomponentsBase.s({ type: Boolean })
	], CheckBox.prototype, "active", void 0);
	__decorate$1([
	    i18nDefaults.i("ui5/webcomponents")
	], CheckBox, "i18nBundle", void 0);
	CheckBox = CheckBox_1 = __decorate$1([
	    webcomponentsBase.m({
	        tag: "ui5-checkbox",
	        languageAware: true,
	        formAssociated: true,
	        renderer: i18nDefaults.y,
	        template: CheckBoxTemplate,
	        styles: checkboxCss,
	    })
	    /**
	     * Fired when the component checked state changes.
	     * @public
	     */
	    ,
	    i18nDefaults.l("change", {
	        bubbles: true,
	        cancelable: true,
	    })
	    /**
	     * Fired to make Angular two way data binding work properly.
	     * @private
	     */
	    ,
	    i18nDefaults.l("value-changed", {
	        bubbles: true,
	        cancelable: true,
	    })
	], CheckBox);
	CheckBox.define();
	var CheckBox$1 = CheckBox;

	const predefinedHooks$1 = {
	    listItemPreContent,
	    listItemContent: listItemContent$1,
	    imageBegin,
	    iconBegin,
	    iconEnd,
	    selectionElement,
	};
	function ListItemTemplate(hooks) {
	    const currentHooks = { ...predefinedHooks$1, ...hooks };
	    return i18nDefaults.jsxs("li", { part: "native-li", "data-sap-focus-ref": true, tabindex: this._effectiveTabIndex, class: this.classes.main, onFocusIn: this._onfocusin, onFocusOut: this._onfocusout, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onMouseUp: this._onmouseup, onMouseDown: this._onmousedown, onTouchStart: this._onmousedown, onTouchEnd: this._ontouchend, onClick: this._onclick, draggable: this.movable, onDragStart: this._ondragstart, onDragEnd: this._ondragend, role: this._accInfo.role, title: this._accInfo.tooltip, "aria-expanded": this._accInfo.ariaExpanded, "aria-level": this._accInfo.ariaLevel, "aria-haspopup": this._accInfo.ariaHaspopup, "aria-posinset": this._accInfo.posinset, "aria-setsize": this._accInfo.setsize, "aria-describedby": `${this._id}-invisibleText-describedby`, "aria-labelledby": this._accessibleNameRef, "aria-disabled": this._ariaDisabled, "aria-selected": this._accInfo.ariaSelected, "aria-checked": this._accInfo.ariaChecked, "aria-owns": this._accInfo.ariaOwns, "aria-keyshortcuts": this._accInfo.ariaKeyShortcuts, children: [currentHooks.listItemPreContent.call(this), this.placeSelectionElementBefore && selectionElement.call(this), this._hasHighlightColor && i18nDefaults.jsx("div", { class: "ui5-li-highlight" }), i18nDefaults.jsxs("div", { part: "content", id: `${this._id}-content`, class: "ui5-li-content", children: [currentHooks.imageBegin.call(this), currentHooks.iconBegin.call(this), currentHooks.listItemContent.call(this)] }), currentHooks.iconEnd.call(this), this.typeDetail && (i18nDefaults.jsx("div", { class: "ui5-li-detailbtn", children: i18nDefaults.jsx(Button, { part: "detail-button", design: "Transparent", onClick: this.onDetailClick, icon: editIcon }) })), this.typeNavigation && (i18nDefaults.jsx(Icon.Icon, { name: slimArrowRight.slimArrowRightIcon })), this.navigated && (i18nDefaults.jsx("div", { class: "ui5-li-navigated" })), this.placeSelectionElementAfter && (currentHooks.selectionElement.call(this)), i18nDefaults.jsx("span", { id: `${this._id}-invisibleText`, class: "ui5-hidden-text", children: this.ariaLabelledByText }), i18nDefaults.jsx("span", { id: `${this._id}-invisibleText-describedby`, class: "ui5-hidden-text", children: this._accInfo.ariaSelectedText })] });
	}
	function listItemPreContent() { }
	function listItemContent$1() { }
	function imageBegin() { }
	function iconBegin() { }
	function iconEnd() { }
	function selectionElement() {
	    switch (true) {
	        case this.modeSingleSelect:
	            return (i18nDefaults.jsx(RadioButton$1, { part: "radio", disabled: this.isInactive, accessibleName: this._accInfo.ariaLabelRadioButton, tabindex: -1, id: `${this._id}-singleSelectionElement`, class: "ui5-li-singlesel-radiobtn", checked: this.selected, onChange: this.onSingleSelectionComponentPress }));
	        case this.modeMultiple:
	            return (i18nDefaults.jsx(CheckBox$1, { part: "checkbox", disabled: this.isInactive, indeterminate: this.indeterminate, tabindex: -1, id: `${this._id}-multiSelectionElement`, class: "ui5-li-multisel-cb", checked: this.selected, accessibleName: this._accInfo.ariaLabel, onChange: this.onMultiSelectionComponentPress }));
	        case this.modeDelete:
	            return (i18nDefaults.jsx("div", { class: "ui5-li-deletebtn", children: this.hasDeleteButtonSlot ?
	                    (i18nDefaults.jsx("slot", { name: "deleteButton" })) : (i18nDefaults.jsx(Button, { part: "delete-button", tabindex: -1, "data-sap-no-tab-ref": true, id: `${this._id}-deleteSelectionElement`, design: "Transparent", icon: ValueState.decline, onClick: this.onDelete, tooltip: this.deleteText })) }));
	    }
	}

	const predefinedHooks = {
	    listItemContent,
	};
	function ListItemCustomTemplate(hooks) {
	    const currentHooks = { ...predefinedHooks, ...hooks };
	    return ListItemTemplate.call(this, currentHooks);
	}
	function listItemContent() {
	    return i18nDefaults.jsx("slot", {});
	}

	webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
	webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
	var ListItemCustomCss = `:host(:not([hidden])){display:block}:host{min-height:var(--_ui5-v2-11-0_list_item_base_height);height:auto;box-sizing:border-box}.ui5-li-root.ui5-custom-li-root{pointer-events:inherit;min-height:inherit}.ui5-li-root.ui5-custom-li-root .ui5-li-content{pointer-events:inherit}[ui5-checkbox].ui5-li-singlesel-radiobtn,[ui5-radio-button].ui5-li-singlesel-radiobtn{display:flex;align-items:center}.ui5-li-root.ui5-custom-li-root,[ui5-checkbox].ui5-li-singlesel-radiobtn,[ui5-radio-button].ui5-li-singlesel-radiobtn{min-width:var(--_ui5-v2-11-0_custom_list_item_rb_min_width)}:host([_selection-mode="SingleStart"]) .ui5-li-root.ui5-custom-li-root{padding-inline:0 1rem}:host([_selection-mode="Multiple"]) .ui5-li-root.ui5-custom-li-root{padding-inline:0 1rem}:host([_selection-mode="SingleEnd"]) .ui5-li-root.ui5-custom-li-root{padding-inline:1rem 0}
`;

	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	/**
	 * @class
	 *
	 * A component to be used as custom list item within the `ui5-list`
	 * the same way as the standard `ui5-li`.
	 *
	 * The component accepts arbitrary HTML content to allow full customization.
	 * @csspart native-li - Used to style the main li tag of the list item
	 * @csspart content - Used to style the content area of the list item
	 * @csspart detail-button - Used to style the button rendered when the list item is of type detail
	 * @csspart delete-button - Used to style the button rendered when the list item is in delete mode
	 * @csspart radio - Used to style the radio button rendered when the list item is in single selection mode
	 * @csspart checkbox - Used to style the checkbox rendered when the list item is in multiple selection mode
	 * @slot {Node[]} default - Defines the content of the component.
	 * @constructor
	 * @extends ListItem
	 * @public
	 */
	let ListItemCustom = class ListItemCustom extends ListItem$1 {
	    constructor() {
	        super(...arguments);
	        /**
	         * Defines whether the item is movable.
	         * @default false
	         * @public
	         * @since 2.0.0
	         */
	        this.movable = false;
	    }
	    async _onkeydown(e) {
	        const isTab = webcomponentsBase.B(e) || webcomponentsBase.m$2(e);
	        const isFocused = this.matches(":focus");
	        if (!isTab && !isFocused && !webcomponentsBase.so(e)) {
	            return;
	        }
	        await super._onkeydown(e);
	    }
	    _onkeyup(e) {
	        const isTab = webcomponentsBase.B(e) || webcomponentsBase.m$2(e);
	        const isFocused = this.matches(":focus");
	        if (!isTab && !isFocused && !webcomponentsBase.so(e)) {
	            return;
	        }
	        super._onkeyup(e);
	    }
	    get classes() {
	        const result = super.classes;
	        result.main["ui5-custom-li-root"] = true;
	        return result;
	    }
	};
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], ListItemCustom.prototype, "movable", void 0);
	__decorate([
	    webcomponentsBase.s()
	], ListItemCustom.prototype, "accessibleName", void 0);
	ListItemCustom = __decorate([
	    webcomponentsBase.m({
	        tag: "ui5-li-custom",
	        template: ListItemCustomTemplate,
	        renderer: i18nDefaults.y,
	        styles: [ListItem$1.styles, ListItemCustomCss],
	    })
	], ListItemCustom);
	ListItemCustom.define();
	var ListItemCustom$1 = ListItemCustom;

	return ListItemCustom$1;

}));
