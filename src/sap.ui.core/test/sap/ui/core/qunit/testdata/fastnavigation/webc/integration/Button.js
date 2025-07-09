/* eslint-disable */
sap.ui.define(['testdata/fastnavigation/webc/integration/webcomponents', 'testdata/fastnavigation/webc/integration/i18n-defaults', 'testdata/fastnavigation/webc/integration/Icon'], (function (webcomponentsBase, i18nDefaults, Icon) { 'use strict';

    const t=r=>Array.from(r).filter(e=>e.nodeType!==Node.COMMENT_NODE&&(e.nodeType!==Node.TEXT_NODE||(e.nodeValue||"").trim().length!==0)).length>0;

    let e;const l=()=>(e===void 0&&(e=webcomponentsBase.D()),e);

    /**
     * Different Button designs.
     * @public
     */
    var ButtonDesign;
    (function (ButtonDesign) {
        /**
         * default type (no special styling)
         * @public
         */
        ButtonDesign["Default"] = "Default";
        /**
         * accept type (green button)
         * @public
         */
        ButtonDesign["Positive"] = "Positive";
        /**
         * reject style (red button)
         * @public
         */
        ButtonDesign["Negative"] = "Negative";
        /**
         * transparent type
         * @public
         */
        ButtonDesign["Transparent"] = "Transparent";
        /**
         * emphasized type
         * @public
         */
        ButtonDesign["Emphasized"] = "Emphasized";
        /**
         * attention type
         * @public
         */
        ButtonDesign["Attention"] = "Attention";
    })(ButtonDesign || (ButtonDesign = {}));
    var ButtonDesign$1 = ButtonDesign;

    /**
     * Determines if the button has special form-related functionality.
     * @public
     */
    var ButtonType;
    (function (ButtonType) {
        /**
         * The button does not do anything special when inside a form
         * @public
         */
        ButtonType["Button"] = "Button";
        /**
         * The button acts as a submit button (submits a form)
         * @public
         */
        ButtonType["Submit"] = "Submit";
        /**
         * The button acts as a reset button (resets a form)
         * @public
         */
        ButtonType["Reset"] = "Reset";
    })(ButtonType || (ButtonType = {}));
    var ButtonType$1 = ButtonType;

    /**
     * Determines where the badge will be placed and how it will be styled.
     * @since 2.7.0
     * @public
     */
    var ButtonBadgeDesign;
    (function (ButtonBadgeDesign) {
        /**
         * The badge is displayed after the text, inside the button.
         * @public
         */
        ButtonBadgeDesign["InlineText"] = "InlineText";
        /**
         * The badge is displayed at the top-end corner of the button.
         *
         * **Note:** According to design guidance, the OverlayText design mode is best used in cozy density to avoid potential visual issues in compact.
         * @public
         */
        ButtonBadgeDesign["OverlayText"] = "OverlayText";
        /**
         * The badge is displayed as an attention dot.
         * @public
         */
        ButtonBadgeDesign["AttentionDot"] = "AttentionDot";
    })(ButtonBadgeDesign || (ButtonBadgeDesign = {}));
    var ButtonBadgeDesign$1 = ButtonBadgeDesign;

    function ButtonTemplate(injectedProps) {
        return (i18nDefaults.jsx(i18nDefaults.Fragment, { children: i18nDefaults.jsxs("button", { type: "button", class: {
                    "ui5-button-root": true,
                    "ui5-button-badge-placement-end": this.badge[0]?.design === "InlineText",
                    "ui5-button-badge-placement-end-top": this.badge[0]?.design === "OverlayText",
                    "ui5-button-badge-dot": this.badge[0]?.design === "AttentionDot",
                }, disabled: this.disabled, "data-sap-focus-ref": true, "aria-pressed": injectedProps?.ariaPressed, "aria-valuemin": injectedProps?.ariaValueMin, "aria-valuemax": injectedProps?.ariaValueMax, "aria-valuenow": injectedProps?.ariaValueNow, "aria-valuetext": injectedProps?.ariaValueText, onFocusOut: this._onfocusout, onClick: this._onclick, onMouseDown: this._onmousedown, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onTouchStart: this._ontouchstart, onTouchEnd: this._ontouchend, tabindex: this.tabIndexValue, "aria-expanded": this.accessibilityAttributes.expanded, "aria-controls": this.accessibilityAttributes.controls, "aria-haspopup": this._hasPopup, "aria-label": this.ariaLabelText, "aria-description": this.ariaDescriptionText, title: this.buttonTitle, part: "button", role: this.effectiveAccRole, children: [this.icon &&
                        i18nDefaults.jsx(Icon.Icon, { class: "ui5-button-icon", name: this.icon, mode: "Decorative", part: "icon" }), i18nDefaults.jsx("span", { id: `${this._id}-content`, class: "ui5-button-text", children: i18nDefaults.jsx("bdi", { children: i18nDefaults.jsx("slot", {}) }) }), this.endIcon &&
                        i18nDefaults.jsx(Icon.Icon, { class: "ui5-button-end-icon", name: this.endIcon, mode: "Decorative", part: "endIcon" }), this.shouldRenderBadge &&
                        i18nDefaults.jsx("slot", { name: "badge" })] }) }));
    }

    webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var buttonCss = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5-v2-11-0_button_base_min_width);height:var(--_ui5-v2-11-0_button_base_height);line-height:normal;font-family:var(--_ui5-v2-11-0_button_fontFamily);font-size:var(--sapFontSize);text-shadow:var(--_ui5-v2-11-0_button_text_shadow);border-radius:var(--_ui5-v2-11-0_button_border_radius);cursor:pointer;background-color:var(--sapButton_Background);border:var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);color:var(--sapButton_TextColor);box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;-webkit-tap-highlight-color:transparent}.ui5-button-root{min-width:inherit;cursor:inherit;height:100%;width:100%;box-sizing:border-box;display:flex;justify-content:center;align-items:center;outline:none;padding:0 var(--_ui5-v2-11-0_button_base_padding);position:relative;background:transparent;border:none;color:inherit;text-shadow:inherit;font:inherit;white-space:inherit;overflow:inherit;text-overflow:inherit;letter-spacing:inherit;word-spacing:inherit;line-height:inherit;-webkit-user-select:none;-moz-user-select:none;user-select:none}:host(:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host(:not([hidden]):not([disabled]).ui5_hovered){background:var(--sapButton_Hover_Background);border:1px solid var(--sapButton_Hover_BorderColor);color:var(--sapButton_Hover_TextColor)}.ui5-button-icon,.ui5-button-end-icon{color:inherit;flex-shrink:0}.ui5-button-end-icon{margin-inline-start:var(--_ui5-v2-11-0_button_base_icon_margin)}:host([icon-only]:not([has-end-icon])) .ui5-button-root{min-width:auto;padding:0}:host([icon-only]) .ui5-button-text{display:none}.ui5-button-text{outline:none;position:relative;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([has-icon]:not(:empty)) .ui5-button-text{margin-inline-start:var(--_ui5-v2-11-0_button_base_icon_margin)}:host([has-end-icon]:not([has-icon]):empty) .ui5-button-end-icon{margin-inline-start:0}:host([disabled]){opacity:var(--sapContent_DisabledOpacity);pointer-events:unset;cursor:default}:host([has-icon]:not([icon-only]):not([has-end-icon])) .ui5-button-text{min-width:calc(var(--_ui5-v2-11-0_button_base_min_width) - var(--_ui5-v2-11-0_button_base_icon_margin) - 1rem)}:host([disabled]:active){pointer-events:none}:host([desktop]:not([active])) .ui5-button-root:focus-within:after,:host(:not([active])) .ui5-button-root:focus-visible:after,:host([desktop][active][design="Emphasized"]) .ui5-button-root:focus-within:after,:host([active][design="Emphasized"]) .ui5-button-root:focus-visible:after,:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-11-0_button_focused_border);border-radius:var(--_ui5-v2-11-0_button_focused_border_radius)}:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{border-color:var(--_ui5-v2-11-0_button_pressed_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-11-0_button_emphasized_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:before,:host([design="Emphasized"]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5-v2-11-0_button_emphasized_focused_border_before);border-radius:var(--_ui5-v2-11-0_button_focused_border_radius)}.ui5-button-root::-moz-focus-inner{border:0}bdi{display:block;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([ui5-button][active]:not([disabled]):not([non-interactive])){background-image:none;background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([design="Positive"]){background-color:var(--sapButton_Accept_Background);border-color:var(--sapButton_Accept_BorderColor);color:var(--sapButton_Accept_TextColor)}:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Accept_Hover_Background);border-color:var(--sapButton_Accept_Hover_BorderColor);color:var(--sapButton_Accept_Hover_TextColor)}:host([ui5-button][design="Positive"][active]:not([non-interactive])){background-color:var(--sapButton_Accept_Active_Background);border-color:var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Accept_Active_TextColor)}:host([design="Negative"]){background-color:var(--sapButton_Reject_Background);border-color:var(--sapButton_Reject_BorderColor);color:var(--sapButton_Reject_TextColor)}:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Reject_Hover_Background);border-color:var(--sapButton_Reject_Hover_BorderColor);color:var(--sapButton_Reject_Hover_TextColor)}:host([ui5-button][design="Negative"][active]:not([non-interactive])){background-color:var(--sapButton_Reject_Active_Background);border-color:var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Reject_Active_TextColor)}:host([design="Attention"]){background-color:var(--sapButton_Attention_Background);border-color:var(--sapButton_Attention_BorderColor);color:var(--sapButton_Attention_TextColor)}:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Attention_Hover_Background);border-color:var(--sapButton_Attention_Hover_BorderColor);color:var(--sapButton_Attention_Hover_TextColor)}:host([ui5-button][design="Attention"][active]:not([non-interactive])){background-color:var(--sapButton_Attention_Active_Background);border-color:var(--sapButton_Attention_Active_BorderColor);color:var(--sapButton_Attention_Active_TextColor)}:host([design="Emphasized"]){background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);border-width:var(--_ui5-v2-11-0_button_emphasized_border_width);color:var(--sapButton_Emphasized_TextColor);font-family:var(--sapButton_Emphasized_FontFamily)}:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Emphasized_Hover_Background);border-color:var(--sapButton_Emphasized_Hover_BorderColor);border-width:var(--_ui5-v2-11-0_button_emphasized_border_width);color:var(--sapButton_Emphasized_Hover_TextColor)}:host([ui5-button][design="Empasized"][active]:not([non-interactive])){background-color:var(--sapButton_Emphasized_Active_Background);border-color:var(--sapButton_Emphasized_Active_BorderColor);color:var(--sapButton_Emphasized_Active_TextColor)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-11-0_button_emphasized_focused_border_color);outline:none}:host([design="Emphasized"][desktop][active]:not([non-interactive])) .ui5-button-root:focus-within:after,:host([design="Emphasized"][active]:not([non-interactive])) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-11-0_button_emphasized_focused_active_border_color)}:host([design="Transparent"]){background-color:var(--sapButton_Lite_Background);color:var(--sapButton_Lite_TextColor);border-color:var(--sapButton_Lite_BorderColor)}:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Lite_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapButton_Lite_Hover_TextColor)}:host([ui5-button][design="Transparent"][active]:not([non-interactive])){background-color:var(--sapButton_Lite_Active_Background);border-color:var(--sapButton_Lite_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([ui5-segmented-button-item][active][desktop]) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item][active]) .ui5-button-root:focus-visible:after,:host([pressed][desktop]) .ui5-button-root:focus-within:after,:host([pressed]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5-v2-11-0_button_pressed_focused_border_color);outline:none}:host([ui5-segmented-button-item][desktop]:not(:last-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:last-child)) .ui5-button-root:focus-visible:after{border-top-right-radius:var(--_ui5-v2-11-0_button_focused_inner_border_radius);border-bottom-right-radius:var(--_ui5-v2-11-0_button_focused_inner_border_radius)}:host([ui5-segmented-button-item][desktop]:not(:first-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:first-child)) .ui5-button-root:focus-visible:after{border-top-left-radius:var(--_ui5-v2-11-0_button_focused_inner_border_radius);border-bottom-left-radius:var(--_ui5-v2-11-0_button_focused_inner_border_radius)}::slotted([slot="badge"][design="InlineText"]){pointer-events:initial;font-family:"72override",var(--sapButton_FontFamily);font-size:var(--sapFontSmallSize);padding-inline-start:.25rem;--_ui5-v2-11-0-tag-height: .625rem}::slotted([slot="badge"][design="OverlayText"]){pointer-events:initial;position:absolute;top:0;inset-inline-end:0;margin:-.5rem;z-index:1000;font-family:"72override",var(--sapButton_FontFamily);font-size:var(--sapFontSmallSize);--_ui5-v2-11-0-tag-height: .625rem}::slotted([slot="badge"][design="AttentionDot"]){pointer-events:initial;content:"";position:absolute;top:0;inset-inline-end:0;margin:-.25rem;z-index:1000}:host(:state(has-overlay-badge)){overflow:visible;margin-inline-end:.3125rem}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Button_1;
    let isGlobalHandlerAttached = false;
    let activeButton = null;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-button` component represents a simple push button.
     * It enables users to trigger actions by clicking or tapping the `ui5-button`, or by pressing
     * certain keyboard keys, such as Enter.
     *
     * ### Usage
     *
     * For the `ui5-button` UI, you can define text, icon, or both. You can also specify
     * whether the text or the icon is displayed first.
     *
     * You can choose from a set of predefined types that offer different
     * styling to correspond to the triggered action.
     *
     * You can set the `ui5-button` as enabled or disabled. An enabled
     * `ui5-button` can be pressed by clicking or tapping it. The button changes
     * its style to provide visual feedback to the user that it is pressed or hovered over with
     * the mouse cursor. A disabled `ui5-button` appears inactive and cannot be pressed.
     *
     * ### ES6 Module Import
     *
     * `import "ui5/webcomponents/dist/Button.js";`
     * @csspart button - Used to style the native button element
     * @csspart icon - Used to style the icon in the native button element
     * @csspart endIcon - Used to style the end icon in the native button element
     * @constructor
     * @extends UI5Element
     * @implements { IButton }
     * @public
     */
    let Button = Button_1 = class Button extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines the component design.
             * @default "Default"
             * @public
             */
            this.design = "Default";
            /**
             * Defines whether the component is disabled.
             * A disabled component can't be pressed or
             * focused, and it is not in the tab chain.
             * @default false
             * @public
             */
            this.disabled = false;
            /**
             * When set to `true`, the component will
             * automatically submit the nearest HTML form element on `press`.
             *
             * **Note:** This property is only applicable within the context of an HTML Form element.`
             * @default false
             * @public
             * @deprecated Set the "type" property to "Submit" to achieve the same result. The "submits" property is ignored if "type" is set to any value other than "Button".
             */
            this.submits = false;
            /**
             * Defines the additional accessibility attributes that will be applied to the component.
             * The following fields are supported:
             *
             * - **expanded**: Indicates whether the button, or another grouping element it controls, is currently expanded or collapsed.
             * Accepts the following string values: `true` or `false`
             *
             * - **hasPopup**: Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by the button.
             * Accepts the following string values: `dialog`, `grid`, `listbox`, `menu` or `tree`.
             *
             * - **controls**: Identifies the element (or elements) whose contents or presence are controlled by the button element.
             * Accepts a lowercase string value.
             *
             * @public
             * @since 1.2.0
             * @default {}
             */
            this.accessibilityAttributes = {};
            /**
             * Defines whether the button has special form-related functionality.
             *
             * **Note:** This property is only applicable within the context of an HTML Form element.
             * @default "Button"
             * @public
             * @since 1.15.0
             */
            this.type = "Button";
            /**
             * Describes the accessibility role of the button.
             *
             * **Note:** Use <code>ButtonAccessibleRole.Link</code> role only with a press handler, which performs a navigation. In all other scenarios the default button semantics are recommended.
             *
             * @default "Button"
             * @public
             * @since 1.23
             */
            this.accessibleRole = "Button";
            /**
             * Used to switch the active state (pressed or not) of the component.
             * @private
             */
            this.active = false;
            /**
             * Defines if a content has been added to the default slot
             * @private
             */
            this.iconOnly = false;
            /**
             * Indicates if the elements has a slotted icon
             * @private
             */
            this.hasIcon = false;
            /**
             * Indicates if the elements has a slotted end icon
             * @private
             */
            this.hasEndIcon = false;
            /**
             * Indicates if the element is focusable
             * @private
             */
            this.nonInteractive = false;
            /**
             * @private
             */
            this._iconSettings = {};
            /**
             * Defines the tabIndex of the component.
             * @private
             */
            this.forcedTabIndex = "0";
            /**
             * @since 1.0.0-rc.13
             * @private
             */
            this._isTouch = false;
            this._cancelAction = false;
            this._deactivate = () => {
                if (activeButton) {
                    activeButton._setActiveState(false);
                }
            };
            if (!isGlobalHandlerAttached) {
                document.addEventListener("mouseup", this._deactivate);
                isGlobalHandlerAttached = true;
            }
        }
        _ontouchstart() {
            if (this.nonInteractive) {
                return;
            }
            this._setActiveState(true);
        }
        onEnterDOM() {
            if (webcomponentsBase.f$1()) {
                this.setAttribute("desktop", "");
            }
        }
        async onBeforeRendering() {
            this._setBadgeOverlayStyle();
            this.hasIcon = !!this.icon;
            this.hasEndIcon = !!this.endIcon;
            this.iconOnly = this.isIconOnly;
            const defaultTooltip = await this.getDefaultTooltip();
            this.buttonTitle = this.iconOnly ? this.tooltip ?? defaultTooltip : this.tooltip;
        }
        _setBadgeOverlayStyle() {
            const needsOverflowVisible = this.badge.length && (this.badge[0].design === ButtonBadgeDesign$1.AttentionDot || this.badge[0].design === ButtonBadgeDesign$1.OverlayText);
            if (needsOverflowVisible) {
                this._internals.states.add("has-overlay-badge");
            }
            else {
                this._internals.states.delete("has-overlay-badge");
            }
        }
        _onclick(e) {
            e.stopImmediatePropagation();
            if (this.nonInteractive) {
                return;
            }
            const { altKey, ctrlKey, metaKey, shiftKey, } = e;
            const prevented = !this.fireDecoratorEvent("click", {
                originalEvent: e,
                altKey,
                ctrlKey,
                metaKey,
                shiftKey,
            });
            if (prevented) {
                return;
            }
            if (this._isSubmit) {
                webcomponentsBase.i$1(this);
            }
            if (this._isReset) {
                webcomponentsBase.m$1(this);
            }
            if (webcomponentsBase.h()) {
                this.getDomRef()?.focus();
            }
        }
        _onmousedown() {
            if (this.nonInteractive) {
                return;
            }
            this._setActiveState(true);
            activeButton = this; // eslint-disable-line
        }
        _ontouchend(e) {
            if (this.disabled) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (this.active) {
                this._setActiveState(false);
            }
            if (activeButton) {
                activeButton._setActiveState(false);
            }
        }
        _onkeydown(e) {
            this._cancelAction = webcomponentsBase.io(e) || webcomponentsBase.H(e);
            if (webcomponentsBase.i(e) || webcomponentsBase.b$1(e)) {
                this._setActiveState(true);
            }
            else if (this._cancelAction) {
                this._setActiveState(false);
            }
        }
        _onkeyup(e) {
            if (this._cancelAction) {
                e.preventDefault();
            }
            if (webcomponentsBase.i(e) || webcomponentsBase.b$1(e)) {
                if (this.active) {
                    this._setActiveState(false);
                }
            }
        }
        _onfocusout() {
            if (this.nonInteractive) {
                return;
            }
            if (this.active) {
                this._setActiveState(false);
            }
        }
        _setActiveState(active) {
            const eventPrevented = !this.fireDecoratorEvent("active-state-change");
            if (eventPrevented) {
                return;
            }
            this.active = active;
        }
        get _hasPopup() {
            return this.accessibilityAttributes.hasPopup;
        }
        get hasButtonType() {
            return this.design !== ButtonDesign$1.Default && this.design !== ButtonDesign$1.Transparent;
        }
        get isIconOnly() {
            return !t(this.text);
        }
        static typeTextMappings() {
            return {
                "Positive": i18nDefaults.BUTTON_ARIA_TYPE_ACCEPT,
                "Negative": i18nDefaults.BUTTON_ARIA_TYPE_REJECT,
                "Emphasized": i18nDefaults.BUTTON_ARIA_TYPE_EMPHASIZED,
                "Attention": i18nDefaults.BUTTON_ARIA_TYPE_ATTENTION,
            };
        }
        getDefaultTooltip() {
            if (!l()) {
                return;
            }
            return webcomponentsBase.A(this.icon);
        }
        get buttonTypeText() {
            return Button_1.i18nBundle.getText(Button_1.typeTextMappings()[this.design]);
        }
        get effectiveAccRole() {
            return i18nDefaults.n(this.accessibleRole);
        }
        get tabIndexValue() {
            if (this.disabled) {
                return;
            }
            const tabindex = this.getAttribute("tabindex");
            if (tabindex) {
                return Number.parseInt(tabindex);
            }
            return this.nonInteractive ? -1 : Number.parseInt(this.forcedTabIndex);
        }
        get ariaLabelText() {
            const ariaLabelText = i18nDefaults.A(this) || "";
            const typeLabelText = this.hasButtonType ? this.buttonTypeText : "";
            const internalLabelText = this.effectiveBadgeDescriptionText || "";
            const labelParts = [ariaLabelText, typeLabelText, internalLabelText].filter(part => part);
            return labelParts.join(" ");
        }
        get ariaDescriptionText() {
            return this.accessibleDescription === "" ? undefined : this.accessibleDescription;
        }
        get effectiveBadgeDescriptionText() {
            if (!this.shouldRenderBadge) {
                return "";
            }
            const badgeEffectiveText = this.badge[0].effectiveText;
            // Use distinct i18n keys for singular and plural badge values to ensure proper localization.
            // Some languages have different grammatical rules for singular and plural forms,
            // so separate keys (BUTTON_BADGE_ONE_ITEM and BUTTON_BADGE_MANY_ITEMS) are necessary.
            switch (badgeEffectiveText) {
                case "":
                    return badgeEffectiveText;
                case "1":
                    return Button_1.i18nBundle.getText(i18nDefaults.BUTTON_BADGE_ONE_ITEM, badgeEffectiveText);
                default:
                    return Button_1.i18nBundle.getText(i18nDefaults.BUTTON_BADGE_MANY_ITEMS, badgeEffectiveText);
            }
        }
        get _isSubmit() {
            return this.type === ButtonType$1.Submit || this.submits;
        }
        get _isReset() {
            return this.type === ButtonType$1.Reset;
        }
        get shouldRenderBadge() {
            return !!this.badge.length && (!!this.badge[0].text.length || this.badge[0].design === ButtonBadgeDesign$1.AttentionDot);
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "design", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "disabled", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "icon", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "endIcon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "submits", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "tooltip", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "accessibleNameRef", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], Button.prototype, "accessibilityAttributes", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "accessibleDescription", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "type", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Button.prototype, "accessibleRole", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "active", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "iconOnly", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "hasIcon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "hasEndIcon", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "nonInteractive", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Button.prototype, "buttonTitle", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object })
    ], Button.prototype, "_iconSettings", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Button.prototype, "forcedTabIndex", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "_isTouch", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Button.prototype, "_cancelAction", void 0);
    __decorate([
        webcomponentsBase.d({ type: Node, "default": true })
    ], Button.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.d({ type: HTMLElement, invalidateOnChildChange: true })
    ], Button.prototype, "badge", void 0);
    __decorate([
        i18nDefaults.i("ui5/webcomponents")
    ], Button, "i18nBundle", void 0);
    Button = Button_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-button",
            formAssociated: true,
            languageAware: true,
            renderer: i18nDefaults.y,
            template: ButtonTemplate,
            styles: buttonCss,
            shadowRootOptions: { delegatesFocus: true },
        })
        /**
         * Fired when the component is activated either with a mouse/tap or by using the Enter or Space key.
         *
         * **Note:** The event will not be fired if the `disabled` property is set to `true`.
         *
         * @since 2.10.0
         * @public
         * @param {Event} originalEvent Returns original event that comes from user's **click** interaction
         * @param {boolean} altKey Returns whether the "ALT" key was pressed when the event was triggered.
         * @param {boolean} ctrlKey Returns whether the "CTRL" key was pressed when the event was triggered.
         * @param {boolean} metaKey Returns whether the "META" key was pressed when the event was triggered.
         * @param {boolean} shiftKey Returns whether the "SHIFT" key was pressed when the event was triggered.
         */
        ,
        i18nDefaults.l("click", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired whenever the active state of the component changes.
         * @private
         */
        ,
        i18nDefaults.l("active-state-change", {
            bubbles: true,
            cancelable: true,
        })
    ], Button);
    Button.define();
    var Button$1 = Button;

    return Button$1;

}));
