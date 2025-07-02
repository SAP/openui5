/* eslint-disable */
sap.ui.define(['exports', 'testdata/fastnavigation/webc/integration/webcomponents', 'testdata/fastnavigation/webc/integration/i18n-defaults', 'testdata/fastnavigation/webc/integration/isElementHidden'], (function (exports, webcomponentsBase, i18nDefaults, isElementHidden) { 'use strict';

    /**
     * Different list selection modes.
     * @public
     */
    var ListSelectionMode;
    (function (ListSelectionMode) {
        /**
         * Default mode (no selection).
         * @public
         */
        ListSelectionMode["None"] = "None";
        /**
         * Right-positioned single selection mode (only one list item can be selected).
         * @public
         */
        ListSelectionMode["Single"] = "Single";
        /**
         * Left-positioned single selection mode (only one list item can be selected).
         * @public
         */
        ListSelectionMode["SingleStart"] = "SingleStart";
        /**
         * Selected item is highlighted but no selection element is visible
         * (only one list item can be selected).
         * @public
         */
        ListSelectionMode["SingleEnd"] = "SingleEnd";
        /**
         * Selected item is highlighted and selection is changed upon arrow navigation
         * (only one list item can be selected - this is always the focused item).
         * @public
         */
        ListSelectionMode["SingleAuto"] = "SingleAuto";
        /**
         * Multi selection mode (more than one list item can be selected).
         * @public
         */
        ListSelectionMode["Multiple"] = "Multiple";
        /**
         * Delete mode (only one list item can be deleted via provided delete button)
         * @public
         */
        ListSelectionMode["Delete"] = "Delete";
    })(ListSelectionMode || (ListSelectionMode = {}));
    var ListSelectionMode$1 = ListSelectionMode;

    function LabelTemplate() {
        return (i18nDefaults.jsxs("label", { class: "ui5-label-root", onClick: this._onclick, children: [i18nDefaults.jsx("span", { class: "ui5-label-text-wrapper", children: i18nDefaults.jsx("slot", {}) }), i18nDefaults.jsx("span", { "aria-hidden": "true", class: "ui5-label-required-colon", "data-ui5-colon": this._colonSymbol })] }));
    }

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var labelCss = `:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapContent_LabelColor);font-family:"72override",var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;cursor:text}.ui5-label-root{width:100%;cursor:inherit}:host{white-space:normal}:host([wrapping-type="None"]){white-space:nowrap}:host([wrapping-type="None"]) .ui5-label-root{display:inline-flex}:host([wrapping-type="None"]) .ui5-label-text-wrapper{text-overflow:ellipsis;overflow:hidden;display:inline-block;vertical-align:top;flex:0 1 auto;min-width:0}:host([show-colon]) .ui5-label-required-colon:before{content:attr(data-ui5-colon)}:host([required]) .ui5-label-required-colon:after{content:"*";color:var(--sapField_RequiredColor);font-size:var(--sapFontLargeSize);font-weight:700;position:relative;font-style:normal;vertical-align:middle;line-height:0}.ui5-label-text-wrapper{padding-inline-end:.075rem}:host([required][show-colon]) .ui5-label-required-colon:after{margin-inline-start:.125rem}:host([show-colon]) .ui5-label-required-colon{margin-inline-start:-.05rem;white-space:pre}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Label_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-label` is a component used to represent a label for elements like input, textarea, select.
     * The `for` property of the `ui5-label` must be the same as the id attribute of the related input element.
     * Screen readers read out the label, when the user focuses the labelled control.
     *
     * The `ui5-label` appearance can be influenced by properties,
     * such as `required` and `wrappingType`.
     * The appearance of the Label can be configured in a limited way by using the design property.
     * For a broader choice of designs, you can use custom styles.
     *
     * ### ES6 Module Import
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/Label";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Defines the text of the component.
     *
     * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     */
    let Label = Label_1 = class Label extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines whether colon is added to the component text.
             *
             * **Note:** Usually used in forms.
             * @default false
             * @public
             */
            this.showColon = false;
            /**
             * Defines whether an asterisk character is added to the component text.
             *
             * **Note:** Usually indicates that user input (bound with the `for` property) is required.
             * In that case the `required` property of
             * the corresponding input should also be set.
             * @default false
             * @public
             */
            this.required = false;
            /**
             * Defines how the text of a component will be displayed when there is not enough space.
             *
             * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
             * @default "Normal"
             * @public
             */
            this.wrappingType = "Normal";
        }
        _onclick() {
            if (!this.for) {
                return;
            }
            const elementToFocus = this.getRootNode().querySelector(`[id="${this.for}"]`);
            if (elementToFocus) {
                elementToFocus.focus();
            }
        }
        get _colonSymbol() {
            return Label_1.i18nBundle.getText(i18nDefaults.LABEL_COLON);
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], Label.prototype, "for", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Label.prototype, "showColon", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], Label.prototype, "required", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], Label.prototype, "wrappingType", void 0);
    __decorate$1([
        i18nDefaults.i("testdata/fastnavigation/webc/gen/ui5/webcomponents")
    ], Label, "i18nBundle", void 0);
    Label = Label_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-label",
            renderer: i18nDefaults.y,
            template: LabelTemplate,
            styles: labelCss,
            languageAware: true,
        })
    ], Label);
    Label.define();
    var Label$1 = Label;

    const r=e=>{if(!e||e.hasAttribute("data-sap-no-tab-ref")||isElementHidden.t(e))return  false;const t=e.getAttribute("tabindex");if(t!=null)return parseInt(t)>=0;const n=e.nodeName.toLowerCase();return n==="a"||/^(input|select|textarea|button|object)$/.test(n)?!e.disabled:false};

    const b=t=>a([...t.children]),a=(t,n)=>{const l=n||[];return t&&t.forEach(r$1=>{if(r$1.nodeType===Node.TEXT_NODE||r$1.nodeType===Node.COMMENT_NODE)return;const e=r$1;if(!e.hasAttribute("data-sap-no-tab-ref"))if(r(e)&&l.push(e),e.tagName==="SLOT")a(e.assignedNodes(),l);else {const s=e.shadowRoot?e.shadowRoot.children:e.children;a([...s],l);}}),l};

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var styles = `:host{box-sizing:border-box;height:var(--_ui5-v2-11-0_list_item_base_height);background-color:var(--ui5-v2-11-0-listitem-background-color);border-bottom:.0625rem solid transparent}:host(:not([hidden])){display:block}:host([disabled]){opacity:var(--_ui5-v2-11-0-listitembase_disabled_opacity);pointer-events:none}:host([actionable]:not([disabled]):not([ui5-li-group-header])){cursor:pointer}:host([has-border]){border-bottom:var(--ui5-v2-11-0-listitem-border-bottom)}:host([selected]){background-color:var(--sapList_SelectionBackgroundColor);border-bottom:var(--ui5-v2-11-0-listitem-selected-border-bottom)}:host([selected]) .ui5-li-additional-text{text-shadow:var(--sapContent_TextShadow)}:host([actionable]:not([active]):not([selected]):not([ui5-li-group-header]):hover){background-color:var(--sapList_Hover_Background)}:host([actionable]:not([active]):not([selected]):not([ui5-li-group-header]):hover) .ui5-li-additional-text{text-shadow:var(--sapContent_TextShadow)}:host([actionable][selected]:not([active],[data-moving]):hover){background-color:var(--sapList_Hover_SelectionBackground)}:host([active][actionable]:not([data-moving])),:host([active][actionable][selected]:not([data-moving])){background-color:var(--sapList_Active_Background)}:host([desktop]:not([data-moving])) .ui5-li-root.ui5-li--focusable:focus:after,:host([desktop][focused]:not([data-moving])) .ui5-li-root.ui5-li--focusable:after,:host(:not([data-moving])) .ui5-li-root.ui5-li--focusable:focus-visible:after,:host([desktop]:not([data-moving])) .ui5-li-root .ui5-li-content:focus:after,:host([desktop][focused]:not([data-moving])) .ui5-li-root .ui5-li-content:after,:host(:not([data-moving])) .ui5-li-root .ui5-li-content:focus-visible:after{content:"";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;inset:.125rem;pointer-events:none}.ui5-li-root{position:relative;display:flex;align-items:center;width:100%;height:100%;padding:var(--_ui5-v2-11-0_list_item_base_padding);box-sizing:border-box;background-color:inherit}.ui5-li-root.ui5-li--focusable{outline:none}.ui5-li-content{display:flex;align-items:center;flex:auto;overflow:hidden;max-width:100%;font-family:"72override",var(--sapFontFamily);color:var(--sapList_TextColor)}.ui5-li-content .ui5-li-title{color:var(--sapList_TextColor);font-size:var(--_ui5-v2-11-0_list_item_title_size)}.ui5-li-text-wrapper{display:flex;flex-direction:row;justify-content:space-between;flex:auto;min-width:1px;line-height:normal}
`;

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var draggableElementStyles = `[draggable=true]{cursor:grab!important}[draggable=true][data-moving]{cursor:grabbing!important;opacity:var(--sapContent_DisabledOpacity)}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * A class to serve as a foundation
     * for the `ListItem` and `ListItemGroupHeader` classes.
     * @constructor
     * @abstract
     * @extends UI5Element
     * @public
     */
    let ListItemBase = class ListItemBase extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines the selected state of the component.
             * @default false
             * @private
             */
            this.selected = false;
            /**
             * Defines whether the item is movable.
             * @default false
             * @private
             * @since 2.0.0
             */
            this.movable = false;
            /**
            * Defines if the list item should display its bottom border.
            * @private
            */
            this.hasBorder = false;
            /**
            * Defines whether `ui5-li` is in disabled state.
            *
            * **Note:** A disabled `ui5-li` is noninteractive.
            * @default false
            * @protected
            * @since 1.0.0-rc.12
            */
            this.disabled = false;
            /**
             * Indicates if the element is on focus
             * @private
             */
            this.focused = false;
            /**
             * Indicates if the list item is actionable, e.g has hover and pressed effects.
             * @private
             */
            this.actionable = false;
        }
        onEnterDOM() {
            if (webcomponentsBase.f$1()) {
                this.setAttribute("desktop", "");
            }
        }
        onBeforeRendering() {
            this.actionable = true;
        }
        _onfocusin(e) {
            this.fireDecoratorEvent("request-tabindex-change", e);
            if (e.target !== this.getFocusDomRef()) {
                return;
            }
            this.fireDecoratorEvent("_focused", e);
        }
        _onkeydown(e) {
            if (webcomponentsBase.B(e)) {
                return this._handleTabNext(e);
            }
            if (webcomponentsBase.m$2(e)) {
                return this._handleTabPrevious(e);
            }
            if (this.getFocusDomRef().matches(":has(:focus-within)")) {
                return;
            }
            if (webcomponentsBase.i(e)) {
                e.preventDefault();
            }
            if (webcomponentsBase.b$1(e)) {
                this.fireItemPress(e);
            }
        }
        _onkeyup(e) {
            if (this.getFocusDomRef().matches(":has(:focus-within)")) {
                return;
            }
            if (webcomponentsBase.i(e)) {
                this.fireItemPress(e);
            }
        }
        _onclick(e) {
            if (this.getFocusDomRef().matches(":has(:focus-within)")) {
                return;
            }
            this.fireItemPress(e);
        }
        fireItemPress(e) {
            if (this.disabled || !this._pressable) {
                return;
            }
            if (webcomponentsBase.b$1(e)) {
                e.preventDefault();
            }
            this.fireDecoratorEvent("_press", { item: this, selected: this.selected, key: e.key });
        }
        _handleTabNext(e) {
            if (this.shouldForwardTabAfter()) {
                if (!this.fireDecoratorEvent("forward-after")) {
                    e.preventDefault();
                }
            }
        }
        _handleTabPrevious(e) {
            const target = e.target;
            if (this.shouldForwardTabBefore(target)) {
                this.fireDecoratorEvent("forward-before");
            }
        }
        /**
         * Determines if th current list item either has no tabbable content or
         * [Tab] is performed onto the last tabbale content item.
         */
        shouldForwardTabAfter() {
            const aContent = b(this.getFocusDomRef());
            return aContent.length === 0 || (aContent[aContent.length - 1] === webcomponentsBase.t());
        }
        /**
         * Determines if the current list item is target of [SHIFT+TAB].
         */
        shouldForwardTabBefore(target) {
            return this.getFocusDomRef() === target;
        }
        get classes() {
            return {
                main: {
                    "ui5-li-root": true,
                    "ui5-li--focusable": this._focusable,
                },
            };
        }
        get _ariaDisabled() {
            return this.disabled ? true : undefined;
        }
        get _focusable() {
            return !this.disabled;
        }
        get _pressable() {
            return true;
        }
        get hasConfigurableMode() {
            return false;
        }
        get _effectiveTabIndex() {
            if (!this._focusable) {
                return -1;
            }
            if (this.selected) {
                return 0;
            }
            return this.forcedTabIndex ? parseInt(this.forcedTabIndex) : undefined;
        }
    };
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "selected", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "movable", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "hasBorder", void 0);
    __decorate([
        webcomponentsBase.s()
    ], ListItemBase.prototype, "forcedTabIndex", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "disabled", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "focused", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemBase.prototype, "actionable", void 0);
    ListItemBase = __decorate([
        webcomponentsBase.m({
            renderer: i18nDefaults.y,
            styles: [styles, draggableElementStyles],
        }),
        i18nDefaults.l("request-tabindex-change", {
            bubbles: true,
        }),
        i18nDefaults.l("_press", {
            bubbles: true,
        }),
        i18nDefaults.l("_focused", {
            bubbles: true,
        }),
        i18nDefaults.l("forward-after", {
            bubbles: true,
            cancelable: true,
        }),
        i18nDefaults.l("forward-before", {
            bubbles: true,
        })
    ], ListItemBase);
    var ListItemBase$1 = ListItemBase;

    exports.Label = Label$1;
    exports.ListItemBase = ListItemBase$1;
    exports.ListSelectionMode = ListSelectionMode$1;

}));
