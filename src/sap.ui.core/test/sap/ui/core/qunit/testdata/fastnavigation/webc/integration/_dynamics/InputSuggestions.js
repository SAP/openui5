/* eslint-disable */
sap.ui.define(['exports', 'testdata/fastnavigation/webc/integration/Input2', 'testdata/fastnavigation/webc/integration/webcomponents', 'testdata/fastnavigation/webc/integration/ListItemBase', 'testdata/fastnavigation/webc/integration/i18n-defaults', 'testdata/fastnavigation/webc/integration/List2', 'testdata/fastnavigation/webc/integration/Icon', 'testdata/fastnavigation/webc/integration/ValueState', 'testdata/fastnavigation/webc/integration/getEffectiveScrollbarStyle', 'testdata/fastnavigation/webc/integration/Button', 'testdata/fastnavigation/webc/integration/isElementHidden'], (function (exports, Input, webcomponentsBase, ListItemBase, i18nDefaults, List, Icon, ValueState, getEffectiveScrollbarStyle, Button, isElementHidden) { 'use strict';

    const r=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");

    function a(r$1,e,s,i){return r$1.replaceAll(new RegExp(r(e),`${i?"i":""}g`),s)}function f(r,e){if(!r||!e)return r;const s=n=>{const[g,l]=n.split("");for(;r.indexOf(n)>=0||e.indexOf(n)>=0;)n=`${g}${n}${l}`;return n},i=s("12"),t=s("34");let o=Input.fnEncodeXML(a(r,e,n=>`${i}${n}${t}`,true));return [[i,"<b>"],[t,"</b>"]].forEach(([n,g])=>{o=a(o,n,g,false);}),o}

    function ListItemBaseTemplate(hooks, injectedProps) {
        const listItemContent = hooks?.listItemContent || defaultListItemContent;
        return (i18nDefaults.jsx("li", { part: "native-li", "data-sap-focus-ref": true, tabindex: this._effectiveTabIndex, class: this.classes.main, draggable: this.movable, role: injectedProps?.role, title: injectedProps?.title, onFocusIn: this._onfocusin, onKeyUp: this._onkeyup, onKeyDown: this._onkeydown, onClick: this._onclick, children: listItemContent.call(this) }));
    }
    function defaultListItemContent() {
        return i18nDefaults.jsx("div", { part: "content", id: `${this._id}-content`, class: "ui5-li-content", children: i18nDefaults.jsx("div", { class: "ui5-li-text-wrapper", children: i18nDefaults.jsx("span", { part: "title", class: "ui5-li-title", children: i18nDefaults.jsx("slot", {}) }) }) });
    }

    function SuggestionItemTemplate() {
        return [ListItemBaseTemplate.call(this, { listItemContent }, { role: "option" })];
    }
    function listItemContent() {
        return i18nDefaults.jsx("div", { part: "content", id: "content", class: "ui5-li-content", children: i18nDefaults.jsxs("div", { class: "ui5-li-text-wrapper", children: [i18nDefaults.jsx("span", { part: "title", className: "ui5-li-title", dangerouslySetInnerHTML: { __html: this.markupText } }), this.additionalText &&
                        i18nDefaults.jsx("span", { part: "additional-text", class: "ui5-li-additional-text", children: this.additionalText })] }) });
    }

    webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var styles = `:host([ui5-suggestion-item]){height:auto;min-height:var(--_ui5-v2-11-0_list_item_base_height)}:host([ui5-suggestion-item]) .ui5-li-root{min-height:var(--_ui5-v2-11-0_list_item_base_height)}:host([ui5-suggestion-item]) .ui5-li-content{padding-bottom:.875rem;padding-top:.875rem;box-sizing:border-box}
`;

    var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * The `ui5-suggestion-item` represents the suggestion item of the `ui5-input`.
     * @constructor
     * @extends ListItemBase
     * @abstract
     * @implements { IInputSuggestionItemSelectable }
     * @public
     */
    let SuggestionItem = class SuggestionItem extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            /**
             * Defines the markup text that will be displayed as suggestion.
             * Used for highlighting the matching parts of the text.
             *
             * @since 2.0.0
             * @private
             */
            this.markupText = "";
        }
        onEnterDOM() {
            if (webcomponentsBase.f$1()) {
                this.setAttribute("desktop", "");
            }
        }
        get _effectiveTabIndex() {
            return -1;
        }
    };
    __decorate$3([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "text", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "additionalText", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], SuggestionItem.prototype, "markupText", void 0);
    SuggestionItem = __decorate$3([
        webcomponentsBase.m({
            tag: "ui5-suggestion-item",
            template: SuggestionItemTemplate,
            styles: [ListItemBase.ListItemBase.styles, styles],
        })
    ], SuggestionItem);
    SuggestionItem.define();

    function ListItemGroupTemplate(hooks) {
        const items = hooks?.items || defaultItems;
        return (i18nDefaults.jsxs("ul", { role: "group", class: "ui5-group-li-root", onDragEnter: this._ondragenter, onDragOver: this._ondragover, onDrop: this._ondrop, onDragLeave: this._ondragleave, children: [this.hasHeader &&
                    i18nDefaults.jsx(List.ListItemGroupHeader, { focused: this.focused, part: "header", accessibleRole: List.ListItemAccessibleRole.Group, children: this.hasFormattedHeader ? i18nDefaults.jsx("slot", { name: "header" }) : this.headerText }), items.call(this), i18nDefaults.jsx(List.DropIndicator, { orientation: "Horizontal", ownerReference: this })] }));
    }
    function defaultItems() {
        return i18nDefaults.jsx("slot", {});
    }

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * The `ui5-suggestion-item-group` is type of suggestion item,
     * that can be used to split the `ui5-input` suggestions into groups.
     * @constructor
     * @extends ListItemGroup
     * @public
     * @since 2.0.0
     */
    let SuggestionItemGroup = class SuggestionItemGroup extends List.ListItemGroup {
    };
    __decorate$2([
        webcomponentsBase.d({
            "default": true,
            invalidateOnChildChange: true,
            type: HTMLElement,
        })
    ], SuggestionItemGroup.prototype, "items", void 0);
    SuggestionItemGroup = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-suggestion-item-group",
            template: ListItemGroupTemplate,
        })
    ], SuggestionItemGroup);
    SuggestionItemGroup.define();

    const name$1 = "resize-corner";
    const pathData$1 = "M384 160v32q0 12-10 22L182 406q-10 10-22 10h-32zM224 416l160-160v32q0 12-10 22l-96 96q-10 10-22 10h-32zm160-64v32q0 12-10 22t-22 10h-32z";
    const ltr$1 = false;
    const collection$1 = "SAP-icons-v4";
    const packageName$1 = "ui5/webcomponents-icons";

    webcomponentsBase.f(name$1, { pathData: pathData$1, ltr: ltr$1, collection: collection$1, packageName: packageName$1 });

    const name = "resize-corner";
    const pathData = "M282 416q-11 0-18.5-7.5T256 390t7-18l109-109q7-7 18-7t18.5 7.5T416 282t-7 18L300 409q-7 7-18 7zm-160 0q-11 0-18.5-7.5T96 390t7-18l269-269q7-7 18-7t18.5 7.5T416 122t-7 18L140 409q-7 7-18 7z";
    const ltr = false;
    const collection = "SAP-icons-v5";
    const packageName = "ui5/webcomponents-icons";

    webcomponentsBase.f(name, { pathData, ltr, collection, packageName });

    var resizeCorner = "resize-corner";

    function DialogTemplate() {
        return Input.PopupTemplate.call(this, {
            beforeContent,
            afterContent,
        });
    }
    function beforeContent() {
        return (i18nDefaults.jsx(i18nDefaults.Fragment, { children: !!this._displayHeader &&
                i18nDefaults.jsx("header", { children: i18nDefaults.jsxs("div", { class: "ui5-popup-header-root", id: "ui5-popup-header", role: "group", "aria-describedby": this.effectiveAriaDescribedBy, "aria-roledescription": this.ariaRoleDescriptionHeaderText, tabIndex: this._headerTabIndex, onKeyDown: this._onDragOrResizeKeyDown, onMouseDown: this._onDragMouseDown, part: "header", children: [this.hasValueState &&
                                i18nDefaults.jsx(Icon.Icon, { class: "ui5-dialog-value-state-icon", name: this._dialogStateIcon }), this.header.length ?
                                i18nDefaults.jsx("slot", { name: "header" })
                                :
                                    i18nDefaults.jsx(Input.Title, { level: "H1", id: "ui5-popup-header-text", class: "ui5-popup-header-text", children: this.headerText }), this.resizable ?
                                this.draggable ?
                                    i18nDefaults.jsx("span", { id: `${this._id}-descr`, "aria-hidden": "true", class: "ui5-hidden-text", children: this.ariaDescribedByHeaderTextDraggableAndResizable })
                                    :
                                        i18nDefaults.jsx("span", { id: `${this._id}-descr`, "aria-hidden": "true", class: "ui5-hidden-text", children: this.ariaDescribedByHeaderTextResizable })
                                :
                                    this.draggable &&
                                        i18nDefaults.jsx("span", { id: `${this._id}-descr`, "aria-hidden": "true", class: "ui5-hidden-text", children: this.ariaDescribedByHeaderTextDraggable })] }) }) }));
    }
    function afterContent() {
        return (i18nDefaults.jsxs(i18nDefaults.Fragment, { children: [!!this.footer.length &&
                    i18nDefaults.jsx("footer", { class: "ui5-popup-footer-root", part: "footer", children: i18nDefaults.jsx("slot", { name: "footer" }) }), this._showResizeHandle &&
                    i18nDefaults.jsx("div", { class: "ui5-popup-resize-handle", onMouseDown: this._onResizeMouseDown, children: i18nDefaults.jsx(Icon.Icon, { name: resizeCorner }) })] }));
    }

    webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var dialogCSS = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{min-width:20rem;min-height:6rem;max-height:94%;max-width:90%;flex-direction:column;box-shadow:var(--sapContent_Shadow3);border-radius:var(--sapElement_BorderCornerRadius)}:host([stretch]){width:90%;height:94%}:host([stretch][on-phone]){width:100%;height:100%;max-height:100%;max-width:100%;border-radius:0;min-width:0}:host([draggable]) .ui5-popup-header-root,:host([draggable]) ::slotted([slot="header"]){cursor:move}:host([draggable]) .ui5-popup-header-root *{cursor:auto}:host([draggable]) .ui5-popup-root{user-select:text}::slotted([slot="header"]){max-width:100%}.ui5-popup-root{display:flex;flex-direction:column;max-width:100vw}.ui5-popup-header-root{position:relative}.ui5-popup-header-root:before{content:"";position:absolute;inset-block-start:auto;inset-block-end:0;inset-inline-start:0;inset-inline-end:0;height:var(--_ui5-v2-11-0_dialog_header_state_line_height);background:var(--sapObjectHeader_BorderColor)}:host([state="Negative"]) .ui5-popup-header-root:before{background:var(--sapErrorBorderColor)}:host([state="Information"]) .ui5-popup-header-root:before{background:var(--sapInformationBorderColor)}:host([state="Positive"]) .ui5-popup-header-root:before{background:var(--sapSuccessBorderColor)}:host([state="Critical"]) .ui5-popup-header-root:before{background:var(--sapWarningBorderColor)}.ui5-dialog-value-state-icon{margin-inline-end:.5rem;flex-shrink:0}:host([state="Negative"]) .ui5-dialog-value-state-icon{color:var(--_ui5-v2-11-0_dialog_header_error_state_icon_color)}:host([state="Information"]) .ui5-dialog-value-state-icon{color:var(--_ui5-v2-11-0_dialog_header_information_state_icon_color)}:host([state="Positive"]) .ui5-dialog-value-state-icon{color:var(--_ui5-v2-11-0_dialog_header_success_state_icon_color)}:host([state="Critical"]) .ui5-dialog-value-state-icon{color:var(--_ui5-v2-11-0_dialog_header_warning_state_icon_color)}.ui5-popup-header-root{outline:none}:host([desktop]) .ui5-popup-header-root:focus:after,.ui5-popup-header-root:focus-visible:after{content:"";position:absolute;left:var(--_ui5-v2-11-0_dialog_header_focus_left_offset);bottom:var(--_ui5-v2-11-0_dialog_header_focus_bottom_offset);right:var(--_ui5-v2-11-0_dialog_header_focus_right_offset);top:var(--_ui5-v2-11-0_dialog_header_focus_top_offset);border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--_ui5-v2-11-0_dialog_header_border_radius) var(--_ui5-v2-11-0_dialog_header_border_radius) 0 0;pointer-events:none}:host([stretch]) .ui5-popup-content{width:100%;height:100%}.ui5-popup-content{min-height:var(--_ui5-v2-11-0_dialog_content_min_height);flex:1 1 auto}.ui5-popup-resize-handle{position:absolute;bottom:-.5rem;inset-inline-end:-.5rem;cursor:var(--_ui5-v2-11-0_dialog_resize_cursor);width:1.5rem;height:1.5rem;border-radius:50%}.ui5-popup-resize-handle [ui5-icon]{color:var(--sapButton_Lite_TextColor)}::slotted([slot="footer"]){height:var(--_ui5-v2-11-0_dialog_footer_height)}::slotted([slot="footer"][ui5-bar][design="Footer"]){border-top:none}::slotted([slot="header"][ui5-bar]){box-shadow:none}::slotted([slot="footer"][ui5-toolbar]){border:0}:host::backdrop{background-color:var(--_ui5-v2-11-0_popup_block_layer_background);opacity:var(--_ui5-v2-11-0_popup_block_layer_opacity)}.ui5-block-layer{display:block}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Dialog_1;
    /**
     * Defines the step size at which this component would change by when being dragged or resized with the keyboard.
     */
    const STEP_SIZE = 16;
    /**
     * Defines the icons corresponding to the dialog's state.
     */
    const ICON_PER_STATE = {
        [ValueState.o.Negative]: "error",
        [ValueState.o.Critical]: "alert",
        [ValueState.o.Positive]: "sys-enter-2",
        [ValueState.o.Information]: "information",
    };
    /**
     * @class
     * ### Overview
     * The `ui5-dialog` component is used to temporarily display some information in a
     * size-limited window in front of the regular app screen.
     * It is used to prompt the user for an action or a confirmation.
     * The `ui5-dialog` interrupts the current app processing as it is the only focused UI element and
     * the main screen is dimmed/blocked.
     * The dialog combines concepts known from other technologies where the windows have
     * names such as dialog box, dialog window, pop-up, pop-up window, alert box, or message box.
     *
     * The `ui5-dialog` is modal, which means that a user action is required before it is possible to return to the parent window.
     * To open multiple dialogs, each dialog element should be separate in the markup. This will ensure the correct modal behavior. Avoid nesting dialogs within each other.
     * The content of the `ui5-dialog` is fully customizable.
     *
     * ### Structure
     * A `ui5-dialog` consists of a header, content, and a footer for action buttons.
     * The `ui5-dialog` is usually displayed at the center of the screen.
     * Its position can be changed by the user. To enable this, you need to set the property `draggable` accordingly.

     *
     * ### Responsive Behavior
     * The `stretch` property can be used to stretch the `ui5-dialog` to full screen. For better usability, it's recommended to stretch the dialog to full screen on phone devices.
     *
     * **Note:** When a `ui5-bar` is used in the header or in the footer, you should remove the default dialog's paddings.
     *
     * For more information see the sample "Bar in Header/Footer".

     * ### Keyboard Handling
     *
     * #### Basic Navigation
     * When the `ui5-dialog` has the `draggable` property set to `true` and the header is focused, the user can move the dialog
     * with the following keyboard shortcuts:
     *
     * - [Up] or [Down] arrow keys - Move the dialog up/down.
     * - [Left] or [Right] arrow keys - Move the dialog left/right.
     *
     * #### Resizing
     * When the `ui5-dialog` has the `resizable` property set to `true` and the header is focused, the user can change the size of the dialog
     * with the following keyboard shortcuts:
     *
     * - [Shift] + [Up] or [Down] - Decrease/Increase the height of the dialog.
     * - [Shift] + [Left] or [Right] - Decrease/Increase the width of the dialog.
     *
     * ### ES6 Module Import
     *
     * `import "ui5/webcomponents/dist/Dialog";`
     *
     * @constructor
     * @extends Popup
     * @public
     * @csspart header - Used to style the header of the component
     * @csspart content - Used to style the content of the component
     * @csspart footer - Used to style the footer of the component
     */
    let Dialog = Dialog_1 = class Dialog extends Input.Popup {
        constructor() {
            super();
            /**
             * Determines if the dialog will be stretched to full screen on mobile. On desktop,
             * the dialog will be stretched to approximately 90% of the viewport.
             *
             * **Note:** For better usability of the component it is recommended to set this property to "true" when the dialog is opened on phone.
             * @default false
             * @public
             */
            this.stretch = false;
            /**
             * Determines whether the component is draggable.
             * If this property is set to true, the Dialog will be draggable by its header.
             *
             * **Note:** The component can be draggable only in desktop mode.
             *
             * **Note:** This property overrides the default HTML "draggable" attribute native behavior.
             * When "draggable" is set to true, the native browser "draggable"
             * behavior is prevented and only the Dialog custom logic ("draggable by its header") works.
             * @default false
             * @since 1.0.0-rc.9
             * @public
             */
            this.draggable = false;
            /**
             * Configures the component to be resizable.
             * If this property is set to true, the Dialog will have a resize handle in its bottom right corner in LTR languages.
             * In RTL languages, the resize handle will be placed in the bottom left corner.
             *
             * **Note:** The component can be resizable only in desktop mode.
             *
             * **Note:** Upon resizing, externally defined height and width styling will be ignored.
             * @default false
             * @since 1.0.0-rc.10
             * @public
             */
            this.resizable = false;
            /**
             * Defines the state of the `Dialog`.
             *
             * **Note:** If `"Negative"` and `"Critical"` states is set, it will change the
             * accessibility role to "alertdialog", if the accessibleRole property is set to `"Dialog"`.
             * @default "None"
             * @public
             * @since 1.0.0-rc.15
             */
            this.state = "None";
            this._draggedOrResized = false;
            this._revertSize = () => {
                Object.assign(this.style, {
                    top: "",
                    left: "",
                    width: "",
                    height: "",
                });
            };
            this._screenResizeHandler = this._screenResize.bind(this);
            this._dragMouseMoveHandler = this._onDragMouseMove.bind(this);
            this._dragMouseUpHandler = this._onDragMouseUp.bind(this);
            this._resizeMouseMoveHandler = this._onResizeMouseMove.bind(this);
            this._resizeMouseUpHandler = this._onResizeMouseUp.bind(this);
            this._dragStartHandler = this._handleDragStart.bind(this);
        }
        static _isHeader(element) {
            return element.classList.contains("ui5-popup-header-root") || element.getAttribute("slot") === "header";
        }
        get isModal() {
            return true;
        }
        get _ariaLabelledBy() {
            let ariaLabelledById;
            if (this.headerText && !this._ariaLabel) {
                ariaLabelledById = "ui5-popup-header-text";
            }
            return ariaLabelledById;
        }
        get ariaRoleDescriptionHeaderText() {
            return (this.resizable || this.draggable) ? Dialog_1.i18nBundle.getText(i18nDefaults.DIALOG_HEADER_ARIA_ROLE_DESCRIPTION) : undefined;
        }
        get effectiveAriaDescribedBy() {
            return (this.resizable || this.draggable) ? `${this._id}-descr` : undefined;
        }
        get ariaDescribedByHeaderTextResizable() {
            return Dialog_1.i18nBundle.getText(i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_RESIZABLE);
        }
        get ariaDescribedByHeaderTextDraggable() {
            return Dialog_1.i18nBundle.getText(i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE);
        }
        get ariaDescribedByHeaderTextDraggableAndResizable() {
            return Dialog_1.i18nBundle.getText(i18nDefaults.DIALOG_HEADER_ARIA_DESCRIBEDBY_DRAGGABLE_RESIZABLE);
        }
        /**
         * Determines if the header should be shown.
         */
        get _displayHeader() {
            return this.header.length || this.headerText || this.draggable || this.resizable;
        }
        get _movable() {
            return !this.stretch && this.onDesktop && (this.draggable || this.resizable);
        }
        get _headerTabIndex() {
            return this._movable ? 0 : undefined;
        }
        get _showResizeHandle() {
            return this.resizable && this.onDesktop;
        }
        get _minHeight() {
            let minHeight = Number.parseInt(window.getComputedStyle(this.contentDOM).minHeight);
            const header = this._root.querySelector(".ui5-popup-header-root");
            if (header) {
                minHeight += header.offsetHeight;
            }
            const footer = this._root.querySelector(".ui5-popup-footer-root");
            if (footer) {
                minHeight += footer.offsetHeight;
            }
            return minHeight;
        }
        get hasValueState() {
            return this.state !== ValueState.o.None;
        }
        get _dialogStateIcon() {
            return ICON_PER_STATE[this.state];
        }
        get _role() {
            if (this.accessibleRole === Input.PopupAccessibleRole.None) {
                return undefined;
            }
            if (this.state === ValueState.o.Negative || this.state === ValueState.o.Critical) {
                return i18nDefaults.n(Input.PopupAccessibleRole.AlertDialog);
            }
            return i18nDefaults.n(this.accessibleRole);
        }
        _show() {
            super._show();
            this._center();
        }
        onBeforeRendering() {
            super.onBeforeRendering();
            this._isRTL = this.effectiveDir === "rtl";
        }
        onEnterDOM() {
            super.onEnterDOM();
            this._attachScreenResizeHandler();
            this.addEventListener("dragstart", this._dragStartHandler);
            this.setAttribute("data-sap-ui-fastnavgroup-container", "true");
        }
        onExitDOM() {
            super.onExitDOM();
            this._detachScreenResizeHandler();
            this.removeEventListener("dragstart", this._dragStartHandler);
        }
        /**
         * @override
         */
        _resize() {
            super._resize();
            if (!this._draggedOrResized) {
                this._center();
            }
        }
        _screenResize() {
            this._center();
        }
        _attachScreenResizeHandler() {
            if (!this._screenResizeHandlerAttached) {
                window.addEventListener("resize", this._screenResizeHandler);
                this._screenResizeHandlerAttached = true;
            }
        }
        _detachScreenResizeHandler() {
            if (this._screenResizeHandlerAttached) {
                window.removeEventListener("resize", this._screenResizeHandler);
                this._screenResizeHandlerAttached = false; // prevent dialog from repositioning during resizing
            }
        }
        _center() {
            const height = window.innerHeight - this.offsetHeight, width = window.innerWidth - this.offsetWidth;
            Object.assign(this.style, {
                top: `${Math.round(height / 2)}px`,
                left: `${Math.round(width / 2)}px`,
            });
        }
        /**
         * Event handlers
         */
        _onDragMouseDown(e) {
            // allow dragging only on the header
            if (!this._movable || !this.draggable || !Dialog_1._isHeader(e.target)) {
                return;
            }
            const { top, left, } = this.getBoundingClientRect();
            const { width, height, } = window.getComputedStyle(this);
            Object.assign(this.style, {
                top: `${top}px`,
                left: `${left}px`,
                width: `${Math.round(Number.parseFloat(width) * 100) / 100}px`,
                height: `${Math.round(Number.parseFloat(height) * 100) / 100}px`,
            });
            this._x = e.clientX;
            this._y = e.clientY;
            this._draggedOrResized = true;
            this._attachMouseDragHandlers();
        }
        _onDragMouseMove(e) {
            e.preventDefault();
            const { clientX, clientY } = e;
            const calcX = this._x - clientX;
            const calcY = this._y - clientY;
            const { left, top, } = this.getBoundingClientRect();
            Object.assign(this.style, {
                left: `${Math.floor(left - calcX)}px`,
                top: `${Math.floor(top - calcY)}px`,
            });
            this._x = clientX;
            this._y = clientY;
        }
        _onDragMouseUp() {
            delete this._x;
            delete this._y;
            this._detachMouseDragHandlers();
        }
        _onDragOrResizeKeyDown(e) {
            if (!this._movable || !Dialog_1._isHeader(e.target)) {
                return;
            }
            if (this.draggable && [webcomponentsBase.D$1, webcomponentsBase.P, webcomponentsBase.K, webcomponentsBase.c].some(key => key(e))) {
                this._dragWithEvent(e);
                return;
            }
            if (this.resizable && [webcomponentsBase.O, webcomponentsBase.u$3, webcomponentsBase.w, webcomponentsBase.T].some(key => key(e))) {
                this._resizeWithEvent(e);
            }
        }
        _dragWithEvent(e) {
            const { top, left, width, height, } = this.getBoundingClientRect();
            let newPos = 0;
            let posDirection = "top";
            switch (true) {
                case webcomponentsBase.D$1(e):
                    newPos = top - STEP_SIZE;
                    posDirection = "top";
                    break;
                case webcomponentsBase.P(e):
                    newPos = top + STEP_SIZE;
                    posDirection = "top";
                    break;
                case webcomponentsBase.K(e):
                    newPos = left - STEP_SIZE;
                    posDirection = "left";
                    break;
                case webcomponentsBase.c(e):
                    newPos = left + STEP_SIZE;
                    posDirection = "left";
                    break;
            }
            newPos = Input.m(newPos, 0, posDirection === "left" ? window.innerWidth - width : window.innerHeight - height);
            this.style[posDirection] = `${newPos}px`;
        }
        _resizeWithEvent(e) {
            this._draggedOrResized = true;
            this.addEventListener("ui5-before-close", this._revertSize, { once: true });
            const { top, left } = this.getBoundingClientRect(), style = window.getComputedStyle(this), minWidth = Number.parseFloat(style.minWidth), maxWidth = window.innerWidth - left, maxHeight = window.innerHeight - top;
            let width = Number.parseFloat(style.width), height = Number.parseFloat(style.height);
            switch (true) {
                case webcomponentsBase.O(e):
                    height -= STEP_SIZE;
                    break;
                case webcomponentsBase.u$3(e):
                    height += STEP_SIZE;
                    break;
                case webcomponentsBase.w(e):
                    width -= STEP_SIZE;
                    break;
                case webcomponentsBase.T(e):
                    width += STEP_SIZE;
                    break;
            }
            width = Input.m(width, minWidth, maxWidth);
            height = Input.m(height, this._minHeight, maxHeight);
            Object.assign(this.style, {
                width: `${width}px`,
                height: `${height}px`,
            });
        }
        _attachMouseDragHandlers() {
            window.addEventListener("mousemove", this._dragMouseMoveHandler);
            window.addEventListener("mouseup", this._dragMouseUpHandler);
        }
        _detachMouseDragHandlers() {
            window.removeEventListener("mousemove", this._dragMouseMoveHandler);
            window.removeEventListener("mouseup", this._dragMouseUpHandler);
        }
        _onResizeMouseDown(e) {
            if (!this._movable || !this.resizable) {
                return;
            }
            e.preventDefault();
            const { top, left, } = this.getBoundingClientRect();
            const { width, height, minWidth, } = window.getComputedStyle(this);
            this._initialX = e.clientX;
            this._initialY = e.clientY;
            this._initialWidth = Number.parseFloat(width);
            this._initialHeight = Number.parseFloat(height);
            this._initialTop = top;
            this._initialLeft = left;
            this._minWidth = Number.parseFloat(minWidth);
            this._cachedMinHeight = this._minHeight;
            Object.assign(this.style, {
                top: `${top}px`,
                left: `${left}px`,
            });
            this._draggedOrResized = true;
            this._attachMouseResizeHandlers();
        }
        _onResizeMouseMove(e) {
            const { clientX, clientY } = e;
            let newWidth, newLeft;
            if (this._isRTL) {
                newWidth = Input.m(this._initialWidth - (clientX - this._initialX), this._minWidth, this._initialLeft + this._initialWidth);
                newLeft = Input.m(this._initialLeft + (clientX - this._initialX), 0, this._initialX + this._initialWidth - this._minWidth);
            }
            else {
                newWidth = Input.m(this._initialWidth + (clientX - this._initialX), this._minWidth, window.innerWidth - this._initialLeft);
            }
            const newHeight = Input.m(this._initialHeight + (clientY - this._initialY), this._cachedMinHeight, window.innerHeight - this._initialTop);
            Object.assign(this.style, {
                height: `${newHeight}px`,
                width: `${newWidth}px`,
                left: newLeft ? `${newLeft}px` : undefined,
            });
        }
        _onResizeMouseUp() {
            delete this._initialX;
            delete this._initialY;
            delete this._initialWidth;
            delete this._initialHeight;
            delete this._initialTop;
            delete this._initialLeft;
            delete this._minWidth;
            delete this._cachedMinHeight;
            this._detachMouseResizeHandlers();
        }
        _handleDragStart(e) {
            if (this.draggable) {
                e.preventDefault();
            }
        }
        _attachMouseResizeHandlers() {
            window.addEventListener("mousemove", this._resizeMouseMoveHandler);
            window.addEventListener("mouseup", this._resizeMouseUpHandler);
            this.addEventListener("ui5-before-close", this._revertSize, { once: true });
        }
        _detachMouseResizeHandlers() {
            window.removeEventListener("mousemove", this._resizeMouseMoveHandler);
            window.removeEventListener("mouseup", this._resizeMouseUpHandler);
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], Dialog.prototype, "headerText", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Dialog.prototype, "stretch", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Dialog.prototype, "draggable", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Dialog.prototype, "resizable", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Dialog.prototype, "state", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], Dialog.prototype, "header", void 0);
    __decorate$1([
        webcomponentsBase.d()
    ], Dialog.prototype, "footer", void 0);
    __decorate$1([
        i18nDefaults.i("ui5/webcomponents")
    ], Dialog, "i18nBundle", void 0);
    Dialog = Dialog_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-dialog",
            template: DialogTemplate,
            styles: [
                Input.Popup.styles,
                Input.PopupsCommonCss,
                dialogCSS,
                getEffectiveScrollbarStyle.a(),
            ],
        })
    ], Dialog);
    Dialog.define();
    var Dialog$1 = Dialog;

    function ResponsivePopoverTemplate() {
        if (!this._isPhone) {
            return Input.PopoverTemplate.call(this);
        }
        return (i18nDefaults.jsxs(Dialog$1, { "root-element": true, accessibleName: this.accessibleName, accessibleNameRef: this.accessibleNameRef, accessibleRole: this.accessibleRole, stretch: true, preventInitialFocus: this.preventInitialFocus, preventFocusRestore: this.preventFocusRestore, initialFocus: this.initialFocus, onBeforeOpen: this._beforeDialogOpen, onOpen: this._afterDialogOpen, onBeforeClose: this._beforeDialogClose, onClose: this._afterDialogClose, exportparts: "content, header, footer", open: this.open, children: [!this._hideHeader && i18nDefaults.jsx(i18nDefaults.Fragment, { children: this.header.length ?
                        i18nDefaults.jsx("slot", { slot: "header", name: "header" })
                        :
                            i18nDefaults.jsxs("div", { class: this.classes.header, slot: "header", children: [this.headerText &&
                                        i18nDefaults.jsx(Input.Title, { level: "H1", wrappingType: "None", class: "ui5-popup-header-text ui5-responsive-popover-header-text", children: this.headerText }), !this._hideCloseButton &&
                                        i18nDefaults.jsx(Button, { icon: ValueState.decline, design: "Transparent", accessibleName: this._closeDialogAriaLabel, onClick: this._dialogCloseButtonClick })] }) }), i18nDefaults.jsx("slot", {}), i18nDefaults.jsx("slot", { slot: "footer", name: "footer" })] }));
    }

    webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var ResponsivePopoverCss = `:host{--_ui5-v2-11-0_input_width: 100%;min-width:6.25rem;min-height:2rem}:host([on-phone]){display:contents}.ui5-responsive-popover-header{height:var(--_ui5-v2-11-0-responsive_popover_header_height);display:flex;justify-content:var(--_ui5-v2-11-0_popup_header_prop_header_text_alignment);align-items:center;width:100%}.ui5-responsive-popover-header-text{width:calc(100% - var(--_ui5-v2-11-0_button_base_min_width))}.ui5-responsive-popover-header-no-title{justify-content:flex-end}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ResponsivePopover_1;
    /**
     * @class
     *
     * ### Overview
     * The `ui5-responsive-popover` acts as a Popover on desktop and tablet, while on phone it acts as a Dialog.
     * The component improves tremendously the user experience on mobile.
     *
     * ### Usage
     * Use it when you want to make sure that all the content is visible on any device.
     *
     * ### ES6 Module Import
     *
     * `import "ui5/webcomponents/dist/ResponsivePopover.js";`
     * @constructor
     * @extends Popover
     * @since 1.0.0-rc.6
     * @public
     * @csspart header - Used to style the header of the component
     * @csspart content - Used to style the content of the component
     * @csspart footer - Used to style the footer of the component
     */
    let ResponsivePopover = ResponsivePopover_1 = class ResponsivePopover extends Input.Popover {
        constructor() {
            super();
            /**
             * Defines if only the content would be displayed (without header and footer) in the popover on Desktop.
             * By default both the header and footer would be displayed.
             * @private
             */
            this.contentOnlyOnDesktop = false;
            /**
             * Used internaly for controls which must not have header.
             * @private
             */
            this._hideHeader = false;
            /**
             * Defines whether a close button will be rendered in the header of the component
             * **Note:** If you are using the `header` slot, this property will have no effect
             * @private
             * @default false
             * @since 1.0.0-rc.16
             */
            this._hideCloseButton = false;
        }
        async openPopup() {
            if (!webcomponentsBase.d$2()) {
                await super.openPopup();
            }
            else if (this._dialog) {
                this._dialog.open = true;
            }
        }
        async _show() {
            if (!webcomponentsBase.d$2()) {
                return super._show();
            }
        }
        _dialogCloseButtonClick() {
            this.closePopup();
        }
        /**
         * Closes the popover/dialog.
         * @override
         */
        closePopup(escPressed = false, preventRegistryUpdate = false, preventFocusRestore = false) {
            if (!webcomponentsBase.d$2()) {
                super.closePopup(escPressed, preventRegistryUpdate, preventFocusRestore);
            }
            else {
                this._dialog?.closePopup(escPressed, preventRegistryUpdate, preventFocusRestore);
            }
        }
        toggle(opener) {
            if (this.open) {
                this.closePopup();
                return;
            }
            this.opener = opener;
            this.open = true;
        }
        get classes() {
            const allClasses = super.classes;
            allClasses.header = {
                "ui5-responsive-popover-header": true,
                "ui5-responsive-popover-header-no-title": !this.headerText,
            };
            return allClasses;
        }
        get _dialog() {
            return this.shadowRoot.querySelector("[ui5-dialog]");
        }
        get contentDOM() {
            return webcomponentsBase.d$2() ? this._dialog.contentDOM : super.contentDOM;
        }
        get _isPhone() {
            return webcomponentsBase.d$2();
        }
        get _displayHeader() {
            return (webcomponentsBase.d$2() || !this.contentOnlyOnDesktop) && super._displayHeader;
        }
        get _displayFooter() {
            return webcomponentsBase.d$2() || !this.contentOnlyOnDesktop;
        }
        get _closeDialogAriaLabel() {
            return ResponsivePopover_1.i18nBundle.getText(i18nDefaults.RESPONSIVE_POPOVER_CLOSE_DIALOG_BUTTON);
        }
        _beforeDialogOpen() {
            this._opened = true;
            this.open = true;
            this.fireDecoratorEvent("before-open");
        }
        _afterDialogOpen() {
            this.fireDecoratorEvent("open");
        }
        _beforeDialogClose(e) {
            this.fireDecoratorEvent("before-close", e.detail);
        }
        _afterDialogClose() {
            this._opened = false;
            this.open = false;
            this.fireDecoratorEvent("close");
        }
        get isModal() {
            if (!webcomponentsBase.d$2()) {
                return super.isModal;
            }
            return this._dialog.isModal;
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ResponsivePopover.prototype, "contentOnlyOnDesktop", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ResponsivePopover.prototype, "_hideHeader", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ResponsivePopover.prototype, "_hideCloseButton", void 0);
    __decorate([
        i18nDefaults.i("ui5/webcomponents")
    ], ResponsivePopover, "i18nBundle", void 0);
    ResponsivePopover = ResponsivePopover_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-responsive-popover",
            styles: [Input.Popover.styles, ResponsivePopoverCss],
            template: ResponsivePopoverTemplate,
        })
    ], ResponsivePopover);
    ResponsivePopover.define();

    function InputSuggestionsTemplate(hooks) {
        const suggestionsList = hooks?.suggestionsList || defaultSuggestionsList;
        const valueStateMessage = hooks?.valueStateMessage;
        const valueStateMessageInputIcon = hooks?.valueStateMessageInputIcon;
        return (i18nDefaults.jsxs(ResponsivePopover, { class: this.classes.popover, hideArrow: true, preventFocusRestore: true, preventInitialFocus: true, placement: "Bottom", horizontalAlign: "Start", tabindex: -1, style: this.styles.suggestionsPopover, onOpen: this._afterOpenPicker, onClose: this._afterClosePicker, onScroll: this._scroll, open: this.open, opener: this, accessibleName: this._popupLabel, children: [this._isPhone &&
                    i18nDefaults.jsxs(i18nDefaults.Fragment, { children: [i18nDefaults.jsxs("div", { slot: "header", class: "ui5-responsive-popover-header", children: [i18nDefaults.jsxs("div", { class: "row", children: [i18nDefaults.jsx("span", { children: this._headerTitleText }), i18nDefaults.jsx(Button, { class: "ui5-responsive-popover-close-btn", icon: ValueState.decline, design: "Transparent", onClick: this._closePicker })] }), i18nDefaults.jsx("div", { class: "row", children: i18nDefaults.jsx("div", { class: "input-root-phone native-input-wrapper", children: i18nDefaults.jsx(Input.Input, { class: "ui5-input-inner-phone", type: this.inputType, value: this.value, showClearIcon: this.showClearIcon, placeholder: this.placeholder, onInput: this._handleInput, onChange: this._handleChange }) }) })] }), this.hasValueStateMessage &&
                                i18nDefaults.jsxs("div", { class: this.classes.popoverValueState, style: this.styles.suggestionPopoverHeader, children: [i18nDefaults.jsx(Icon.Icon, { class: "ui5-input-value-state-message-icon", name: valueStateMessageInputIcon?.call(this) }), this.open && valueStateMessage?.call(this)] })] }), !this._isPhone && this.hasValueStateMessage &&
                    i18nDefaults.jsxs("div", { slot: "header", class: {
                            "ui5-responsive-popover-header": true,
                            "ui5-responsive-popover-header--focused": this._isValueStateFocused,
                            ...this.classes.popoverValueState,
                        }, style: this.styles.suggestionPopoverHeader, children: [i18nDefaults.jsx(Icon.Icon, { class: "ui5-input-value-state-message-icon", name: valueStateMessageInputIcon?.call(this) }), this.open && valueStateMessage?.call(this)] }), suggestionsList.call(this), this._isPhone &&
                    i18nDefaults.jsx("div", { slot: "footer", class: "ui5-responsive-popover-footer", children: i18nDefaults.jsx(Button, { design: "Transparent", onClick: this._closePicker, children: this._suggestionsOkButtonText }) })] }));
    }
    function defaultSuggestionsList() {
        return (i18nDefaults.jsx(List.List, { accessibleRole: List.ListAccessibleRole.ListBox, separators: this.suggestionSeparators, selectionMode: "Single", onMouseDown: this.onItemMouseDown, onItemClick: this._handleSuggestionItemPress, onSelectionChange: this._handleSelectionChange, children: i18nDefaults.jsx("slot", {}) }));
    }

    /**
     * A class to manage the `Input` suggestion items.
     * @class
     * @private
     */
    class Suggestions {
        get template() {
            return InputSuggestionsTemplate;
        }
        constructor(component, slotName, highlight, handleFocus) {
            // The component, that the suggestion would plug into.
            this.component = component;
            // Defines the items` slot name.
            this.slotName = slotName;
            // Defines, if the focus will be moved via the arrow keys.
            this.handleFocus = handleFocus;
            // Defines, if the suggestions should highlight.
            this.highlight = highlight;
            // An integer value to store the currently selected item position,
            // that changes due to user interaction.
            this.selectedItemIndex = -1;
        }
        onUp(e, indexOfItem) {
            e.preventDefault();
            const index = !this.isOpened && this._hasValueState && indexOfItem === -1 ? 0 : indexOfItem;
            this._handleItemNavigation(false /* forward */, index);
            return true;
        }
        onDown(e, indexOfItem) {
            e.preventDefault();
            const index = !this.isOpened && this._hasValueState && indexOfItem === -1 ? 0 : indexOfItem;
            this._handleItemNavigation(true /* forward */, index);
            return true;
        }
        onSpace(e) {
            if (this._isItemOnTarget()) {
                e.preventDefault();
                this.onItemSelected(this._selectedItem, true /* keyboardUsed */);
                return true;
            }
            return false;
        }
        onEnter(e) {
            if (this._isGroupItem) {
                e.preventDefault();
                return false;
            }
            if (this._isItemOnTarget()) {
                this.onItemSelected(this._selectedItem, true /* keyboardUsed */);
                return true;
            }
            return false;
        }
        onPageUp(e) {
            e.preventDefault();
            const isItemIndexValid = this.selectedItemIndex - 10 > -1;
            if (this._hasValueState && !isItemIndexValid) {
                this._focusValueState();
                return true;
            }
            this._moveItemSelection(this.selectedItemIndex, isItemIndexValid ? this.selectedItemIndex -= 10 : this.selectedItemIndex = 0);
            return true;
        }
        onPageDown(e) {
            e.preventDefault();
            const items = this._getItems();
            const lastItemIndex = items.length - 1;
            const isItemIndexValid = this.selectedItemIndex + 10 <= lastItemIndex;
            if (this._hasValueState && !items) {
                this._focusValueState();
                return true;
            }
            this._moveItemSelection(this.selectedItemIndex, isItemIndexValid ? this.selectedItemIndex += 10 : this.selectedItemIndex = lastItemIndex);
            return true;
        }
        onHome(e) {
            e.preventDefault();
            if (this._hasValueState) {
                this._focusValueState();
                return true;
            }
            this._moveItemSelection(this.selectedItemIndex, this.selectedItemIndex = 0);
            return true;
        }
        onEnd(e) {
            e.preventDefault();
            const lastItemIndex = this._getItems().length - 1;
            if (this._hasValueState && !lastItemIndex) {
                this._focusValueState();
                return true;
            }
            this._moveItemSelection(this.selectedItemIndex, this.selectedItemIndex = lastItemIndex);
            return true;
        }
        onTab() {
            if (this._isItemOnTarget()) {
                this.onItemSelected(this._selectedItem, true);
                return true;
            }
            return false;
        }
        toggle(bToggle, options) {
            const toggle = bToggle !== undefined ? bToggle : !this.isOpened();
            if (toggle) {
                this._getComponent().open = true;
            }
            else {
                this.close(options.preventFocusRestore);
            }
        }
        get _selectedItem() {
            return this._getNonGroupItems().find(item => item.selected);
        }
        _isScrollable() {
            const sc = this._getScrollContainer();
            return sc.offsetHeight < sc.scrollHeight;
        }
        close(preventFocusRestore = false) {
            const selectedItem = this._getItems() && this._getItems()[this.selectedItemIndex];
            this._getComponent().open = false;
            const picker = this._getPicker();
            picker.preventFocusRestore = preventFocusRestore;
            picker.open = false;
            if (selectedItem && selectedItem.focused) {
                selectedItem.focused = false;
            }
        }
        updateSelectedItemPosition(pos) {
            this.selectedItemIndex = pos;
        }
        onItemSelected(selectedItem, keyboardUsed) {
            const item = selectedItem;
            const nonGroupItems = this._getNonGroupItems();
            if (!item) {
                return;
            }
            this.accInfo = {
                isGroup: item.hasAttribute("ui5-suggestion-item-group"),
                currentPos: nonGroupItems.indexOf(item) + 1,
                listSize: nonGroupItems.length,
                itemText: item.text || "",
                additionalText: item.additionalText,
            };
            this._getComponent().onItemSelected(item, keyboardUsed);
            this._getComponent().open = false;
        }
        onItemSelect(item) {
            this._getComponent().onItemSelect(item);
        }
        /* Private methods */
        // Note: Split into two separate handlers
        onItemPress(e) {
            let pressedItem; // SuggestionListItem
            const isPressEvent = e.type === "ui5-item-click";
            // Only use the press e if the item is already selected, in all other cases we are listening for 'ui5-selection-change' from the list
            // Also we have to check if the selection-change is fired by the list's 'item-click' event handling, to avoid double handling on our side
            if ((isPressEvent && !e.detail.item.selected) || (this._handledPress && !isPressEvent)) {
                return;
            }
            if (isPressEvent && e.detail.item.selected) {
                pressedItem = e.detail.item;
                this._handledPress = true;
            }
            else {
                pressedItem = e.detail.selectedItems[0];
            }
            this.onItemSelected(pressedItem, false /* keyboardUsed */);
        }
        _onClose() {
            this._handledPress = false;
        }
        _isItemOnTarget() {
            return this.isOpened() && this.selectedItemIndex !== null && this.selectedItemIndex !== -1 && !this._isGroupItem;
        }
        get _isGroupItem() {
            const items = this._getItems();
            if (!items || !items[this.selectedItemIndex]) {
                return false;
            }
            return items[this.selectedItemIndex].hasAttribute("ui5-suggestion-item-group");
        }
        isOpened() {
            return !!(this._getPicker()?.open);
        }
        _handleItemNavigation(forward, index) {
            this.selectedItemIndex = index;
            if (!this._getItems().length) {
                return;
            }
            if (forward) {
                this._selectNextItem();
            }
            else {
                this._selectPreviousItem();
            }
        }
        _selectNextItem() {
            const itemsCount = this._getItems().length;
            const previousSelectedIdx = this.selectedItemIndex;
            if (this._hasValueState && previousSelectedIdx === -1 && !this.component._isValueStateFocused) {
                this._focusValueState();
                return;
            }
            if ((previousSelectedIdx === -1 && !this._hasValueState) || this.component._isValueStateFocused) {
                this._clearValueStateFocus();
                this.selectedItemIndex = -1;
            }
            if (previousSelectedIdx !== -1 && previousSelectedIdx + 1 > itemsCount - 1) {
                return;
            }
            this._moveItemSelection(previousSelectedIdx, ++this.selectedItemIndex);
        }
        _selectPreviousItem() {
            const items = this._getItems();
            const previousSelectedIdx = this.selectedItemIndex;
            if (this._hasValueState && previousSelectedIdx === 0 && !this.component._isValueStateFocused) {
                this.component.hasSuggestionItemSelected = false;
                this.component._isValueStateFocused = true;
                this.selectedItemIndex = 0;
                items[0].focused = false;
                if (items[0].hasAttribute("ui5-suggestion-item")) {
                    items[0].selected = false;
                }
                return;
            }
            if (this.component._isValueStateFocused) {
                this.component.focused = true;
                this.component._isValueStateFocused = false;
                this.selectedItemIndex = 0;
                return;
            }
            if (previousSelectedIdx === -1 || previousSelectedIdx === null) {
                return;
            }
            if (previousSelectedIdx - 1 < 0) {
                if (items[previousSelectedIdx].hasAttribute("ui5-suggestion-item") || items[previousSelectedIdx].hasAttribute("ui5-suggestion-item-custom")) {
                    items[previousSelectedIdx].selected = false;
                }
                items[previousSelectedIdx].focused = false;
                this.component.focused = true;
                this.component.hasSuggestionItemSelected = false;
                this.selectedItemIndex -= 1;
                return;
            }
            this._moveItemSelection(previousSelectedIdx, --this.selectedItemIndex);
        }
        _moveItemSelection(previousIdx, nextIdx) {
            const items = this._getItems();
            const currentItem = items[nextIdx];
            const previousItem = items[previousIdx];
            const nonGroupItems = this._getNonGroupItems();
            const isGroupItem = currentItem.hasAttribute("ui5-suggestion-item-group");
            if (!currentItem) {
                return;
            }
            this.component.focused = false;
            this._clearValueStateFocus();
            const selectedItem = this._getItems()[this.selectedItemIndex];
            this.accInfo = {
                isGroup: isGroupItem,
                currentPos: items.indexOf(currentItem) + 1,
                itemText: (isGroupItem ? selectedItem.headerText : selectedItem.text) || "",
            };
            if (currentItem.hasAttribute("ui5-suggestion-item") || currentItem.hasAttribute("ui5-suggestion-item-custom")) {
                this.accInfo.additionalText = currentItem.additionalText || "";
                this.accInfo.currentPos = nonGroupItems.indexOf(currentItem) + 1;
                this.accInfo.listSize = nonGroupItems.length;
            }
            if (previousItem) {
                previousItem.focused = false;
            }
            if (previousItem?.hasAttribute("ui5-suggestion-item") || previousItem?.hasAttribute("ui5-suggestion-item-custom")) {
                previousItem.selected = false;
            }
            if (currentItem) {
                currentItem.focused = true;
                if (!isGroupItem) {
                    currentItem.selected = true;
                }
                if (this.handleFocus) {
                    currentItem.focus();
                }
            }
            this.component.hasSuggestionItemSelected = true;
            this.onItemSelect(currentItem);
            if (!this._isItemIntoView(currentItem)) {
                const itemRef = this._isGroupItem ? currentItem.shadowRoot.querySelector("[ui5-li-group-header]") : currentItem;
                this._scrollItemIntoView(itemRef);
            }
        }
        _deselectItems() {
            const items = this._getItems();
            items.forEach(item => {
                if (item.hasAttribute("ui5-suggestion-item")) {
                    item.selected = false;
                }
                item.focused = false;
            });
        }
        _clearItemFocus() {
            const focusedItem = this._getItems().find(item => item.focused);
            if (focusedItem) {
                focusedItem.focused = false;
            }
        }
        _isItemIntoView(item) {
            const rectItem = item.getDomRef().getBoundingClientRect();
            const rectInput = this._getComponent().getDomRef().getBoundingClientRect();
            const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
            let headerHeight = 0;
            if (this._hasValueState) {
                const valueStateHeader = this._getPicker().querySelector("[slot=header]");
                headerHeight = valueStateHeader.getBoundingClientRect().height;
            }
            return (rectItem.top + Suggestions.SCROLL_STEP <= windowHeight) && (rectItem.top >= rectInput.top + headerHeight);
        }
        _scrollItemIntoView(item) {
            item.scrollIntoView({
                behavior: "auto",
                block: "nearest",
                inline: "nearest",
            });
        }
        _getScrollContainer() {
            if (!this._scrollContainer) {
                this._scrollContainer = this._getPicker().shadowRoot.querySelector(".ui5-popup-content");
            }
            return this._scrollContainer;
        }
        /**
         * Returns the items in 1D array.
         *
         */
        _getItems() {
            const suggestionComponent = this._getComponent();
            return suggestionComponent.getSlottedNodes("suggestionItems").flatMap(item => {
                return item.hasAttribute("ui5-suggestion-item-group") ? [item, ...item.items] : [item];
            });
        }
        _getNonGroupItems() {
            return this._getItems().filter(item => !item.hasAttribute("ui5-suggestion-item-group"));
        }
        _getComponent() {
            return this.component;
        }
        _getList() {
            return this._getPicker().querySelector("[ui5-list]");
        }
        _getListWidth() {
            return this._getList()?.offsetWidth;
        }
        _getPicker() {
            return this._getComponent().shadowRoot.querySelector("[ui5-responsive-popover]");
        }
        get itemSelectionAnnounce() {
            if (!this.accInfo) {
                return "";
            }
            if (this.accInfo.isGroup) {
                return `${Suggestions.i18nBundle.getText(i18nDefaults.LIST_ITEM_GROUP_HEADER)} ${this.accInfo.itemText}`;
            }
            const itemPositionText = Suggestions.i18nBundle.getText(i18nDefaults.LIST_ITEM_POSITION, this.accInfo.currentPos || 0, this.accInfo.listSize || 0);
            return `${this.accInfo.additionalText} ${itemPositionText}`;
        }
        hightlightInput(text, input) {
            return f(text, input);
        }
        get _hasValueState() {
            return this.component.hasValueStateMessage;
        }
        _focusValueState() {
            this.component._isValueStateFocused = true;
            this.component.focused = false;
            this.component.hasSuggestionItemSelected = false;
            this.selectedItemIndex = 0;
            this.component.value = this.component.typedInValue;
            this._deselectItems();
        }
        _clearValueStateFocus() {
            this.component._isValueStateFocused = false;
        }
        _clearSelectedSuggestionAndaccInfo() {
            this.accInfo = undefined;
            this.selectedItemIndex = 0;
        }
    }
    Suggestions.SCROLL_STEP = 60;
    Input.Input.SuggestionsClass = Suggestions;

    exports.default = Suggestions;

}));
