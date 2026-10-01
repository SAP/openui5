sap.ui.define(['exports', 'sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/Icon'], (function (exports, webcomponentsBase, Geomap, Icon) { 'use strict';

    const b=new WeakMap,o=new WeakMap,v={attributes:true,childList:true,characterData:true,subtree:true},E=e=>{const t=e.accessibleNameRef?.split(" ")??[];let s="";return t.forEach((n,c)=>{const l=m(e,n),a=`${l&&l.textContent?l.textContent:""}`;a&&(s+=a,c<t.length-1&&(s+=" "));}),s},f=e=>{const t=new Set;u(e).forEach(r=>{t.add(r);});const n=e.accessibleNameRef,c=e.accessibleDescriptionRef,l=[n,c].filter(Boolean).join(" ");return (l?l.split(" "):[]).forEach(r=>{const i=m(e,r);i&&t.add(i);}),Array.from(t)},u=e=>{const t=e.getRootNode().querySelectorAll(`[for="${e.id}"]`);return Array.from(t)},m=(e,t)=>e.getRootNode().querySelector(`[id='${t}']`)||document.getElementById(t),k=e=>s=>{const n=s&&s.type==="property"&&s.name==="accessibleNameRef",c=s&&s.type==="property"&&s.name==="accessibleDescriptionRef";if(!n&&!c)return;const l=o.get(e);if(!l)return;const a=l.observedElements,r=f(e);a.forEach(i=>{r.includes(i)||d(l,i);}),r.forEach(i=>{a.includes(i)||(g(l,i),l.observedElements.push(i));}),l?.callback();},y=(e,t)=>{if(o.has(e))return;const s=f(e),n=k(e),c={host:e,observedElements:s,callback:t,invalidationCallback:n};o.set(e,c),e.attachInvalidate(n),s.forEach(l=>{g(c,l);}),t();},g=(e,t)=>{let s=b.get(t);if(!s){s={observer:null,callbacks:[]};const n=new MutationObserver(()=>{s.callbacks.forEach(a=>{a();});const l=document.getElementById(t.id);e.host.id===t.getAttribute("for")||l||d(e,t);});s.observer=n,n.observe(t,v),b.set(t,s);}s.callbacks.includes(e.callback)||s.callbacks.push(e.callback);},d=(e,t)=>{const s=b.get(t);s&&(s.callbacks=s.callbacks.filter(n=>n!==e.callback),s.callbacks.length||(s.observer?.disconnect(),b.delete(t))),e.observedElements=e.observedElements.filter(n=>n!==t);},T=e=>{const t=o.get(e);if(!t)return;[...t.observedElements].forEach(n=>{d(t,n);}),e.detachInvalidate(t.invalidationCallback),o.delete(e);};

    const t=r=>Array.from(r).filter(e=>e.nodeType!==Node.COMMENT_NODE&&(e.nodeType!==Node.TEXT_NODE||(e.nodeValue||"").trim().length!==0)).length>0;

    function n(e){return e.toLowerCase()}

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

    /**
     * Button accessible roles.
     *
     * @public
     * @since 1.23
     */
    var ButtonAccessibleRole;
    (function (ButtonAccessibleRole) {
        /**
         * Represents Default (button) ARIA role.
         * @public
         */
        ButtonAccessibleRole["Button"] = "Button";
        /**
         * Represents the ARIA role "link".
         * @public
         */
        ButtonAccessibleRole["Link"] = "Link";
    })(ButtonAccessibleRole || (ButtonAccessibleRole = {}));
    var ButtonAccessibleRole$1 = ButtonAccessibleRole;

    /**
     * Different BusyIndicator text placements.
     *
     * @public
     */
    var BusyIndicatorTextPlacement;
    (function (BusyIndicatorTextPlacement) {
        /**
         * The text will be displayed on top of the busy indicator.
         * @public
         */
        BusyIndicatorTextPlacement["Top"] = "Top";
        /**
         * The text will be displayed at the bottom of the busy indicator.
         * @public
         */
        BusyIndicatorTextPlacement["Bottom"] = "Bottom";
    })(BusyIndicatorTextPlacement || (BusyIndicatorTextPlacement = {}));
    var BusyIndicatorTextPlacement$1 = BusyIndicatorTextPlacement;

    function LabelTemplate() {
        return (Geomap.jsxs("label", { class: "ui5-label-root", onClick: this._onclick, children: [Geomap.jsx("span", { class: "ui5-label-text-wrapper", children: Geomap.jsx("slot", {}) }), Geomap.jsx("span", { "aria-hidden": "true", class: "ui5-label-required-colon", "data-ui5-colon": this._colonSymbol })] }));
    }

    webcomponentsBase.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => Geomap.defaultThemeBase);
    webcomponentsBase.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => Icon.defaultTheme, "host");
    var labelCss = `:host(:not([hidden])){display:inline-flex}:host{max-width:100%;color:var(--sapContent_LabelColor);font-family:var(--sapFontFamily);font-size:var(--sapFontSize);font-weight:400;cursor:text}.ui5-label-root{width:100%;cursor:inherit}:host{white-space:normal}:host([wrapping-type="None"]){white-space:nowrap}:host([wrapping-type="None"]) .ui5-label-root{display:inline-flex}:host([wrapping-type="None"]) .ui5-label-text-wrapper{text-overflow:ellipsis;overflow:hidden;display:inline-block;vertical-align:top;flex:0 1 auto;min-width:0}:host([show-colon]) .ui5-label-required-colon:before{content:attr(data-ui5-colon)}:host([required]) .ui5-label-required-colon:after{content:"*";color:var(--sapField_RequiredColor);font-size:var(--sapFontLargeSize);font-weight:700;position:relative;font-style:normal;vertical-align:middle;line-height:0}.ui5-label-text-wrapper{padding-inline-end:.075rem}:host([required][show-colon]) .ui5-label-required-colon:after{margin-inline-start:.125rem}:host([show-colon]) .ui5-label-required-colon{margin-inline-start:-.05rem;white-space:pre}
`;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
     * `import "@ui5/webcomponents/dist/Label";`
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
            return Label_1.i18nBundle.getText(Icon.LABEL_COLON);
        }
    };
    __decorate$2([
        webcomponentsBase.s()
    ], Label.prototype, "for", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Label.prototype, "showColon", void 0);
    __decorate$2([
        webcomponentsBase.s({ type: Boolean })
    ], Label.prototype, "required", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], Label.prototype, "wrappingType", void 0);
    __decorate$2([
        Icon.i("@ui5/webcomponents")
    ], Label, "i18nBundle", void 0);
    Label = Label_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-label",
            renderer: Geomap.y,
            template: LabelTemplate,
            styles: labelCss,
            languageAware: true,
        })
    ], Label);
    Label.define();
    var Label$1 = Label;

    function BusyIndicatorTemplate() {
        return (Geomap.jsxs("div", { class: "ui5-busy-indicator-root", children: [this._isBusy && (Geomap.jsxs("div", { class: {
                        "ui5-busy-indicator-busy-area": true,
                        "ui5-busy-indicator-busy-area-over-content": this.hasContent,
                    }, title: this.ariaTitle, tabindex: 0, role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuetext": "Busy", "aria-labelledby": this.labelId, "data-sap-focus-ref": true, children: [this.textPosition.top && BusyIndicatorBusyText.call(this), Geomap.jsxs("div", { class: "ui5-busy-indicator-circles-wrapper", children: [Geomap.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-0" }), Geomap.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-1" }), Geomap.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-2" })] }), this.textPosition.bottom && BusyIndicatorBusyText.call(this)] })), Geomap.jsx("slot", {}), this._isBusy && (Geomap.jsx("span", { "data-ui5-focus-redirect": true, tabindex: 0, role: "none", onFocusIn: this._redirectFocus }))] }));
    }
    function BusyIndicatorBusyText() {
        return (Geomap.jsx(Geomap.Fragment, { children: this.text && (Geomap.jsx(Label$1, { id: `${this._id}-label`, class: "ui5-busy-indicator-text", children: this.text })) }));
    }

    webcomponentsBase.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => Geomap.defaultThemeBase);
    webcomponentsBase.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => Icon.defaultTheme, "host");
    var busyIndicatorCss = `:host(:not([hidden])){display:inline-block}:host([_is-busy]){color:var(--_ui5_busy_indicator_color)}:host([size="S"]) .ui5-busy-indicator-root{min-width:1.625rem;min-height:.5rem}:host([size="S"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:1.75rem}:host([size="S"]) .ui5-busy-indicator-circle{width:.5rem;height:.5rem}:host([size="S"]) .ui5-busy-indicator-circle:first-child,:host([size="S"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.0625rem}:host(:not([size])) .ui5-busy-indicator-root,:host([size="M"]) .ui5-busy-indicator-root{min-width:3.375rem;min-height:1rem}:host([size="M"]) .ui5-busy-indicator-circle:first-child,:host([size="M"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.1875rem}:host(:not([size])[text]:not([text=""])) .ui5-busy-indicator-root,:host([size="M"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:2.25rem}:host(:not([size])) .ui5-busy-indicator-circle,:host([size="M"]) .ui5-busy-indicator-circle{width:1rem;height:1rem}:host([size="L"]) .ui5-busy-indicator-root{min-width:6.5rem;min-height:2rem}:host([size="L"]) .ui5-busy-indicator-circle:first-child,:host([size="L"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.25rem}:host([size="L"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:3.25rem}:host([size="L"]) .ui5-busy-indicator-circle{width:2rem;height:2rem}.ui5-busy-indicator-root{display:flex;justify-content:center;align-items:center;position:relative;background-color:inherit;height:inherit;border-radius:inherit}.ui5-busy-indicator-busy-area.ui5-busy-indicator-busy-area-over-content{position:absolute;inset:0;z-index:99}.ui5-busy-indicator-busy-area{display:flex;justify-content:center;align-items:center;background-color:inherit;flex-direction:column;border-radius:inherit}:host([active]) ::slotted(*){opacity:var(--sapContent_DisabledOpacity)}:host([desktop]) .ui5-busy-indicator-busy-area:focus,.ui5-busy-indicator-busy-area:focus-visible{outline:var(--_ui5_busy_indicator_focus_outline);outline-offset:-2px}.ui5-busy-indicator-circles-wrapper{line-height:0}.ui5-busy-indicator-circle{display:inline-block;background-color:currentColor;border-radius:50%}.ui5-busy-indicator-circle:before{content:"";width:100%;height:100%;border-radius:100%}.circle-animation-0{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11)}.circle-animation-1{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.2s}.circle-animation-2{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.4s}.ui5-busy-indicator-text{width:100%;text-align:center}:host([text-placement="Top"]) .ui5-busy-indicator-text{margin-bottom:.5rem}:host(:not([text-placement])) .ui5-busy-indicator-text,:host([text-placement="Bottom"]) .ui5-busy-indicator-text{margin-top:.5rem}@keyframes grow{0%,50%,to{-webkit-transform:scale(.5);-moz-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var BusyIndicator_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-busy-indicator` signals that some operation is going on and that the
     * user must wait. It does not block the current UI screen so other operations could be triggered in parallel.
     * It displays 3 dots and each dot expands and shrinks at a different rate, resulting in a cascading flow of animation.
     *
     * ### Usage
     * For the `ui5-busy-indicator` you can define the size, the text and whether it is shown or hidden.
     * In order to hide it, use the "active" property.
     *
     * In order to show busy state over an HTML element, simply nest the HTML element in a `ui5-busy-indicator` instance.
     *
     * **Note:** Since `ui5-busy-indicator` has `display: inline-block;` by default and no width of its own,
     * whenever you need to wrap a block-level element, you should set `display: block` to the busy indicator as well.
     *
     * #### When to use:
     *
     * - The user needs to be able to cancel the operation.
     * - Only part of the application or a particular component is affected.
     *
     * #### When not to use:
     *
     * - The operation takes less than one second.
     * - You need to block the screen and prevent the user from starting another activity.
     * - Do not show multiple busy indicators at once.
     *
     * ### ES6 Module Import
     *
     * `import "@ui5/webcomponents/dist/BusyIndicator.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Determines the content over which the component will appear.
     * @since 0.12.0
     */
    let BusyIndicator = BusyIndicator_1 = class BusyIndicator extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Defines the size of the component.
             * @default "M"
             * @public
             */
            this.size = "M";
            /**
             * Defines if the busy indicator is visible on the screen. By default it is not.
             * @default false
             * @public
             */
            this.active = false;
            /**
             * Defines the delay in milliseconds, after which the busy indicator will be visible on the screen.
             * @default 1000
             * @public
             */
            this.delay = 1000;
            /**
             * Defines the placement of the text.
             *
             * @default "Bottom"
             * @public
             */
            this.textPlacement = "Bottom";
            /**
             * Defines if the component is currently in busy state.
             * @private
             */
            this._isBusy = false;
            this._keydownHandler = this._handleKeydown.bind(this);
            this._preventEventHandler = this._preventEvent.bind(this);
        }
        onEnterDOM() {
            this.addEventListener("keydown", this._keydownHandler, {
                capture: true,
            });
            this.addEventListener("keyup", this._preventEventHandler, {
                capture: true,
            });
            if (webcomponentsBase.f$1()) {
                this.setAttribute("desktop", "");
            }
        }
        onExitDOM() {
            if (this._busyTimeoutId) {
                clearTimeout(this._busyTimeoutId);
                delete this._busyTimeoutId;
            }
            this.removeEventListener("keydown", this._keydownHandler, true);
            this.removeEventListener("keyup", this._preventEventHandler, true);
        }
        get ariaTitle() {
            return BusyIndicator_1.i18nBundle.getText(Icon.BUSY_INDICATOR_TITLE);
        }
        get labelId() {
            return this.text ? `${this._id}-label` : undefined;
        }
        get textPosition() {
            return {
                top: this.text && this.textPlacement === BusyIndicatorTextPlacement$1.Top,
                bottom: this.text && this.textPlacement === BusyIndicatorTextPlacement$1.Bottom,
            };
        }
        get hasContent() {
            return t(Array.from(this.children));
        }
        onBeforeRendering() {
            if (this.active) {
                if (!this._isBusy && !this._busyTimeoutId) {
                    this._busyTimeoutId = setTimeout(() => {
                        delete this._busyTimeoutId;
                        this._isBusy = true;
                    }, Math.max(0, this.delay));
                }
            }
            else {
                if (this._busyTimeoutId) {
                    clearTimeout(this._busyTimeoutId);
                    delete this._busyTimeoutId;
                }
                this._isBusy = false;
            }
        }
        _handleKeydown(e) {
            if (!this._isBusy) {
                return;
            }
            e.stopImmediatePropagation();
            // move the focus to the last element in this DOM and let TAB continue to the next focusable element
            if (webcomponentsBase.x(e)) {
                this.focusForward = true;
                this.shadowRoot.querySelector("[data-ui5-focus-redirect]").focus();
                this.focusForward = false;
            }
        }
        _preventEvent(e) {
            if (this._isBusy) {
                e.stopImmediatePropagation();
            }
        }
        /**
         * Moves the focus to busy area when coming with SHIFT + TAB
         */
        _redirectFocus(e) {
            if (this.focusForward) {
                return;
            }
            e.preventDefault();
            this.shadowRoot.querySelector(".ui5-busy-indicator-busy-area").focus();
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "text", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "size", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], BusyIndicator.prototype, "active", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Number })
    ], BusyIndicator.prototype, "delay", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "textPlacement", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], BusyIndicator.prototype, "_isBusy", void 0);
    __decorate$1([
        Icon.i("@ui5/webcomponents")
    ], BusyIndicator, "i18nBundle", void 0);
    BusyIndicator = BusyIndicator_1 = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-busy-indicator",
            languageAware: true,
            styles: busyIndicatorCss,
            renderer: Geomap.y,
            template: BusyIndicatorTemplate,
        })
    ], BusyIndicator);
    BusyIndicator.define();
    var BusyIndicator$1 = BusyIndicator;

    /**
     * Different BusyIndicator sizes.
     * @public
     */
    var BusyIndicatorSize;
    (function (BusyIndicatorSize) {
        /**
         * small size
         * @public
         */
        BusyIndicatorSize["S"] = "S";
        /**
         * medium size
         * @public
         */
        BusyIndicatorSize["M"] = "M";
        /**
         * large size
         * @public
         */
        BusyIndicatorSize["L"] = "L";
    })(BusyIndicatorSize || (BusyIndicatorSize = {}));
    var BusyIndicatorSize$1 = BusyIndicatorSize;

    function ButtonTemplate(injectedProps) {
        return (Geomap.jsxs(Geomap.Fragment, { children: [Geomap.jsxs("button", { type: "button", class: {
                        "ui5-button-root": true,
                        "ui5-button-badge-placement-end": this.badge[0]?.design === "InlineText",
                        "ui5-button-badge-placement-end-top": this.badge[0]?.design === "OverlayText",
                        "ui5-button-badge-dot": this.badge[0]?.design === "AttentionDot"
                    }, disabled: this.disabled, "data-sap-focus-ref": true, "aria-pressed": injectedProps?.ariaPressed, "aria-valuemin": injectedProps?.ariaValueMin, "aria-valuemax": injectedProps?.ariaValueMax, "aria-valuenow": injectedProps?.ariaValueNow, "aria-valuetext": injectedProps?.ariaValueText, onFocusOut: this._onfocusout, onClick: this._onclick, onMouseDown: this._onmousedown, onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, onTouchStart: this._ontouchstart, onTouchEnd: this._ontouchend, tabindex: this.tabIndexValue, "aria-expanded": this._computedAccessibilityAttributes?.expanded, "aria-controls": this._computedAccessibilityAttributes?.controls, "aria-haspopup": this._computedAccessibilityAttributes?.hasPopup, "aria-label": this._computedAccessibilityAttributes?.ariaLabel, "aria-keyshortcuts": this._computedAccessibilityAttributes?.ariaKeyShortcuts, "aria-description": this.ariaDescriptionText, "aria-busy": this.loading ? "true" : undefined, title: this.buttonTitle, part: "button", role: this.effectiveAccRole, children: [this.icon &&
                            Geomap.jsx(Icon.Icon, { class: "ui5-button-icon", name: this.icon, mode: "Decorative", part: "icon" }), Geomap.jsx("span", { id: `${this._id}-content`, class: "ui5-button-text", children: Geomap.jsx("bdi", { children: Geomap.jsx("slot", {}) }) }), this.endIcon &&
                            Geomap.jsx(Icon.Icon, { class: "ui5-button-end-icon", name: this.endIcon, mode: "Decorative", part: "endIcon" }), this.shouldRenderBadge &&
                            Geomap.jsx("slot", { name: "badge" })] }), this.loading &&
                    Geomap.jsx(BusyIndicator$1, { id: `${this._id}-button-busy-indicator`, class: "ui5-button-busy-indicator", size: this.iconOnly ? BusyIndicatorSize$1.S : BusyIndicatorSize$1.M, active: true, delay: this.loadingDelay, inert: this.loading })] }));
    }

    webcomponentsBase.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => Geomap.defaultThemeBase);
    webcomponentsBase.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => Icon.defaultTheme, "host");
    var buttonCss = `:host{vertical-align:middle}.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5_button_base_min_width);height:var(--_ui5_button_base_height);line-height:normal;font-family:var(--_ui5_button_fontFamily);font-size:var(--sapFontSize);text-shadow:var(--_ui5_button_text_shadow);border-radius:var(--_ui5_button_border_radius);cursor:pointer;background-color:var(--sapButton_Background);border:var(--sapButton_BorderWidth) solid var(--sapButton_BorderColor);color:var(--sapButton_TextColor);box-sizing:border-box;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;-webkit-tap-highlight-color:transparent}.ui5-button-root{min-width:inherit;cursor:inherit;height:100%;width:100%;box-sizing:border-box;display:flex;justify-content:center;align-items:center;outline:none;padding:0 var(--_ui5_button_base_padding);position:relative;background:transparent;border:none;color:inherit;text-shadow:inherit;font:inherit;white-space:inherit;overflow:inherit;text-overflow:inherit;letter-spacing:inherit;word-spacing:inherit;line-height:inherit;-webkit-user-select:none;-moz-user-select:none;user-select:none}:host(:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host(:not([hidden]):not([disabled]).ui5_hovered){background:var(--sapButton_Hover_Background);border:1px solid var(--sapButton_Hover_BorderColor);color:var(--sapButton_Hover_TextColor)}.ui5-button-icon,.ui5-button-end-icon{color:inherit;flex-shrink:0}.ui5-button-end-icon{margin-inline-start:var(--_ui5_button_base_icon_margin)}:host([icon-only]:not([has-end-icon])) .ui5-button-root{min-width:auto;padding:0}:host([icon-only]) .ui5-button-text{display:none}.ui5-button-text{outline:none;position:relative;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([has-icon]:not(:empty)) .ui5-button-text{margin-inline-start:var(--_ui5_button_base_icon_margin)}:host([has-end-icon]:not([has-icon]):empty) .ui5-button-end-icon{margin-inline-start:0}:host([disabled]){opacity:var(--sapContent_DisabledOpacity);pointer-events:unset;cursor:default}:host([has-icon]:not([icon-only]):not([has-end-icon])) .ui5-button-text{min-width:calc(var(--_ui5_button_base_min_width) - var(--_ui5_button_base_icon_margin) - 1rem)}:host([disabled]:active){pointer-events:none}:host([desktop]:not([loading])) .ui5-button-root:focus-within:after,:host(:not([active])) .ui5-button-root:focus-visible:after,:host([desktop][active][design="Emphasized"]) .ui5-button-root:focus-within:after,:host([active][design="Emphasized"]) .ui5-button-root:focus-visible:after,:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;pointer-events:none;inset:.0625rem;border:var(--_ui5_button_focused_border);border-radius:var(--_ui5_button_focused_border_radius)}:host([desktop][active]) .ui5-button-root:focus-within:before,:host([active]) .ui5-button-root:focus-visible:before{border-color:var(--_ui5_button_pressed_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5_button_emphasized_focused_border_color)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:before,:host([design="Emphasized"]) .ui5-button-root:focus-visible:before{content:"";position:absolute;box-sizing:border-box;inset:.0625rem;border:var(--_ui5_button_emphasized_focused_border_before);border-radius:var(--_ui5_button_focused_border_radius)}.ui5-button-root::-moz-focus-inner{border:0}bdi{display:block;white-space:inherit;overflow:inherit;text-overflow:inherit}:host([ui5-button][active]:not([disabled]):not([non-interactive])){background-image:none;background-color:var(--sapButton_Active_Background);border-color:var(--sapButton_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([design="Positive"]){background-color:var(--sapButton_Accept_Background);border-color:var(--sapButton_Accept_BorderColor);color:var(--sapButton_Accept_TextColor)}:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Positive"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Accept_Hover_Background);border-color:var(--sapButton_Accept_Hover_BorderColor);color:var(--sapButton_Accept_Hover_TextColor)}:host([ui5-button][design="Positive"][active]:not([non-interactive])){background-color:var(--sapButton_Accept_Active_Background);border-color:var(--sapButton_Accept_Active_BorderColor);color:var(--sapButton_Accept_Active_TextColor)}:host([design="Negative"]){background-color:var(--sapButton_Reject_Background);border-color:var(--sapButton_Reject_BorderColor);color:var(--sapButton_Reject_TextColor)}:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Negative"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Reject_Hover_Background);border-color:var(--sapButton_Reject_Hover_BorderColor);color:var(--sapButton_Reject_Hover_TextColor)}:host([ui5-button][design="Negative"][active]:not([non-interactive])){background-color:var(--sapButton_Reject_Active_Background);border-color:var(--sapButton_Reject_Active_BorderColor);color:var(--sapButton_Reject_Active_TextColor)}:host([design="Attention"]){background-color:var(--sapButton_Attention_Background);border-color:var(--sapButton_Attention_BorderColor);color:var(--sapButton_Attention_TextColor)}:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Attention"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Attention_Hover_Background);border-color:var(--sapButton_Attention_Hover_BorderColor);color:var(--sapButton_Attention_Hover_TextColor)}:host([ui5-button][design="Attention"][active]:not([non-interactive])){background-color:var(--sapButton_Attention_Active_Background);border-color:var(--sapButton_Attention_Active_BorderColor);color:var(--sapButton_Attention_Active_TextColor)}:host([design="Emphasized"]){background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor);border-width:var(--_ui5_button_emphasized_border_width);color:var(--sapButton_Emphasized_TextColor);font-family:var(--sapButton_Emphasized_FontFamily)}:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Emphasized_Hover_Background);border-color:var(--sapButton_Emphasized_Hover_BorderColor);border-width:var(--_ui5_button_emphasized_border_width);color:var(--sapButton_Emphasized_Hover_TextColor)}:host([ui5-button][design="Empasized"][active]:not([non-interactive])){background-color:var(--sapButton_Emphasized_Active_Background);border-color:var(--sapButton_Emphasized_Active_BorderColor);color:var(--sapButton_Emphasized_Active_TextColor)}:host([design="Emphasized"][desktop]) .ui5-button-root:focus-within:after,:host([design="Emphasized"]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5_button_emphasized_focused_border_color);outline:none}:host([design="Emphasized"][desktop][active]:not([non-interactive])) .ui5-button-root:focus-within:after,:host([design="Emphasized"][active]:not([non-interactive])) .ui5-button-root:focus-visible:after{border-color:var(--_ui5_button_emphasized_focused_active_border_color)}:host([design="Transparent"]){background-color:var(--sapButton_Lite_Background);color:var(--sapButton_Lite_TextColor);border-color:var(--sapButton_Lite_BorderColor)}:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Transparent"]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:var(--sapButton_Lite_Hover_Background);border-color:var(--sapButton_Lite_Hover_BorderColor);color:var(--sapButton_Lite_Hover_TextColor)}:host([ui5-button][design="Transparent"][active]:not([non-interactive])){background-color:var(--sapButton_Lite_Active_Background);border-color:var(--sapButton_Lite_Active_BorderColor);color:var(--sapButton_Active_TextColor)}:host([ui5-segmented-button-item][active][desktop]) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item][active]) .ui5-button-root:focus-visible:after,:host([pressed][desktop]) .ui5-button-root:focus-within:after,:host([pressed]) .ui5-button-root:focus-visible:after{border-color:var(--_ui5_button_pressed_focused_border_color);outline:none}:host([ui5-segmented-button-item][desktop]:not(:last-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:last-child)) .ui5-button-root:focus-visible:after{border-top-right-radius:var(--_ui5_button_focused_inner_border_radius);border-bottom-right-radius:var(--_ui5_button_focused_inner_border_radius)}:host([ui5-segmented-button-item][desktop]:not(:first-child)) .ui5-button-root:focus-within:after,:host([ui5-segmented-button-item]:not(:first-child)) .ui5-button-root:focus-visible:after{border-top-left-radius:var(--_ui5_button_focused_inner_border_radius);border-bottom-left-radius:var(--_ui5_button_focused_inner_border_radius)}::slotted([slot="badge"][design="InlineText"]){pointer-events:initial;font-family:var(--sapButton_FontFamily);font-size:var(--sapFontSmallSize);padding-inline-start:.25rem;--_ui5-tag-height: .625rem}::slotted([slot="badge"][design="OverlayText"]){pointer-events:initial;position:absolute;top:0;inset-inline-end:0;margin:var(--_ui5_button_overlay_badge_offset, -.5rem);z-index:1;font-family:var(--sapButton_FontFamily);font-size:var(--sapFontSmallSize);--_ui5-tag-height: .625rem}::slotted([slot="badge"][design="AttentionDot"]){pointer-events:initial;content:"";position:absolute;top:0;inset-inline-end:0;margin:-.25rem;z-index:1}:host(:state(has-overlay-badge)){overflow:visible;margin-inline-end:.3125rem}:host([loading]){position:relative;pointer-events:unset}:host([loading]) .ui5-button-root{opacity:var(--sapContent_DisabledOpacity)}:host([loading][design="Emphasized"]){background-color:inherit;border:inherit}:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover),:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered){background-color:inherit;border:inherit}:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]):hover) .ui5-button-root,:host([design="Emphasized"][loading]:not([active]):not([non-interactive]):not([_is-touch]):not([disabled]).ui5_hovered) .ui5-button-root{background-color:var(--sapButton_Emphasized_Hover_Background)}:host([loading][design="Emphasized"]) .ui5-button-root{background-color:var(--sapButton_Emphasized_Background);border-color:var(--sapButton_Emphasized_BorderColor)}.ui5-button-busy-indicator{position:absolute;height:100%;width:100%;top:0}:host([has-end-icon]:not([icon])) .ui5-button-root{justify-content:flex-start}:host([icon-only]) .ui5-button-root{justify-content:center}:host([has-end-icon]:not([icon]):not(:empty)) .ui5-button-end-icon{padding-inline-start:var(--_ui5_button_base_icon_margin);margin-inline-start:auto}
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
     * `import "@ui5/webcomponents/dist/Button.js";`
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
             * - **ariaLabel**: Defines the accessible ARIA name of the component.
             * Accepts any string value.
             *
             *  - **ariaKeyShortcuts**: Defines keyboard shortcuts that activate or give focus to the button.
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
             * Defines whether the button shows a loading indicator.
             *
             * **Note:** If set to `true`, a busy indicator component will be displayed on the related button.
             * @default false
             * @public
             * @since 2.13.0
             */
            this.loading = false;
            /**
             * Specifies the delay in milliseconds before the loading indicator appears within the associated button.
             * @default 1000
             * @public
             * @since 2.13.0
             */
            this.loadingDelay = 1000;
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
            this._isSpacePressed = false;
            this._clickHandlerAttached = false;
            this._deactivate = () => {
                if (activeButton) {
                    activeButton._setActiveState(false);
                }
            };
            this._onclickBound = e => {
                if (e instanceof CustomEvent) {
                    return;
                }
                this._onclick(e);
            };
            if (!this._clickHandlerAttached) {
                this.addEventListener("click", this._onclickBound);
                this._clickHandlerAttached = true;
            }
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
            if (!this._clickHandlerAttached) {
                this.addEventListener("click", this._onclickBound);
                this._clickHandlerAttached = true;
            }
            y(this, this._updateAccessibleNameRefTexts.bind(this));
        }
        _updateAccessibleNameRefTexts() {
            this._accessibleNameRefTexts = E(this);
        }
        onExitDOM() {
            if (this._clickHandlerAttached) {
                this.removeEventListener("click", this._onclickBound);
                this._clickHandlerAttached = false;
            }
            if (activeButton === this) {
                activeButton = null;
            }
            T(this);
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
            if (this.loading) {
                e.preventDefault();
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
                e.preventDefault();
                return;
            }
            if (this._isSubmit) {
                webcomponentsBase.l$2(this);
            }
            if (this._isReset) {
                webcomponentsBase.u$2(this);
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
            if (this.disabled || this.loading) {
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
            if (webcomponentsBase.Ko(e) || webcomponentsBase.m$2(e)) {
                this._cancelAction = true;
            }
            else if (webcomponentsBase.A(e)) {
                this._isSpacePressed = true;
            }
            if ((webcomponentsBase.A(e) || webcomponentsBase.b$1(e))) {
                this._setActiveState(true);
            }
            else if (this._cancelAction) {
                this._setActiveState(false);
            }
        }
        _onkeyup(e) {
            const isSpaceKey = webcomponentsBase.A(e);
            const isCancelKey = webcomponentsBase.Ko(e) || webcomponentsBase.m$2(e);
            if (isSpaceKey || webcomponentsBase.K(e)) {
                if (this._cancelAction) {
                    this._cancelAction = false;
                    this._isSpacePressed = false;
                    e.preventDefault();
                    return;
                }
                this._isSpacePressed = false;
            }
            else if (isCancelKey && !this._isSpacePressed) {
                this._cancelAction = false;
            }
            if ((webcomponentsBase.A(e) || webcomponentsBase.b$1(e))) {
                if (this.active) {
                    this._setActiveState(false);
                }
            }
        }
        _onfocusout() {
            if (this.nonInteractive) {
                return;
            }
            this._isSpacePressed = false;
            this._cancelAction = false;
            if (this.active) {
                this._setActiveState(false);
            }
        }
        _setActiveState(active) {
            const eventPrevented = !this.fireDecoratorEvent("active-state-change");
            if (eventPrevented || this.loading) {
                return;
            }
            this.active = active;
        }
        get hasButtonType() {
            return this.design !== ButtonDesign$1.Default && this.design !== ButtonDesign$1.Transparent;
        }
        get isIconOnly() {
            return !t(this.text);
        }
        static typeTextMappings() {
            return {
                "Positive": Icon.BUTTON_ARIA_TYPE_ACCEPT,
                "Negative": Icon.BUTTON_ARIA_TYPE_REJECT,
                "Emphasized": Icon.BUTTON_ARIA_TYPE_EMPHASIZED,
                "Attention": Icon.BUTTON_ARIA_TYPE_ATTENTION,
            };
        }
        getDefaultTooltip() {
            if (!webcomponentsBase.l$3()) {
                return;
            }
            return webcomponentsBase.x$1(this.icon);
        }
        get buttonTypeText() {
            return Button_1.i18nBundle.getText(Button_1.typeTextMappings()[this.design]);
        }
        get effectiveAccRole() {
            return n(this.accessibleRole);
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
            // Use accessibleNameRef texts (cached), then accessibleName (direct), then textContent as fallback
            const effectiveAriaLabelText = this._accessibleNameRefTexts || this.accessibleName || "";
            const textContent = this.textContent || "";
            const internalLabelText = this.effectiveBadgeDescriptionText || "";
            // Use either the effective aria label text (if accessibleName is provided) or the button's text content
            const mainLabelText = effectiveAriaLabelText || textContent;
            const labelParts = [mainLabelText, internalLabelText].filter(part => part);
            return labelParts.join(" ");
        }
        get ariaDescriptionText() {
            const accessibleDescription = this.accessibleDescription === "" ? undefined : this.accessibleDescription;
            const typeLabelText = this.hasButtonType ? this.buttonTypeText : "";
            const descriptionParts = [accessibleDescription, typeLabelText].filter(part => part);
            return descriptionParts.length > 0 ? descriptionParts.join(" ") : undefined;
        }
        get _computedAccessibilityAttributes() {
            return {
                expanded: this.accessibilityAttributes.expanded,
                hasPopup: this.accessibilityAttributes.hasPopup,
                controls: this.accessibilityAttributes.controls,
                ariaKeyShortcuts: this.accessibilityAttributes.ariaKeyShortcuts,
                ariaLabel: this.accessibilityAttributes.ariaLabel || this.ariaLabelText,
            };
        }
        get accessibilityInfo() {
            return {
                description: this.ariaDescriptionText,
                role: this.effectiveAccRole,
                disabled: this.disabled,
                children: this.text,
                type: this.effectiveAccRoleTranslation,
                label: this.ariaLabelText,
            };
        }
        get effectiveAccRoleTranslation() {
            if (this.accessibleRole === ButtonAccessibleRole$1.Button) {
                return Button_1.i18nBundle.getText(Icon.BUTTON_ROLE_DESCRIPTION);
            }
            if (this.accessibleRole === ButtonAccessibleRole$1.Link) {
                return Button_1.i18nBundle.getText(Icon.LINK_ROLE_DESCRIPTION);
            }
            return "";
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
                    return Button_1.i18nBundle.getText(Icon.BUTTON_BADGE_ONE_ITEM, badgeEffectiveText);
                default:
                    return Button_1.i18nBundle.getText(Icon.BUTTON_BADGE_MANY_ITEMS, badgeEffectiveText);
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
    ], Button.prototype, "form", void 0);
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
        webcomponentsBase.s({ type: Boolean })
    ], Button.prototype, "loading", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], Button.prototype, "loadingDelay", void 0);
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
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Button.prototype, "_isSpacePressed", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Button.prototype, "_accessibleNameRefTexts", void 0);
    __decorate([
        webcomponentsBase.d$1({ type: Node, "default": true })
    ], Button.prototype, "text", void 0);
    __decorate([
        webcomponentsBase.d$1({ type: HTMLElement, invalidateOnChildChange: true })
    ], Button.prototype, "badge", void 0);
    __decorate([
        Icon.i("@ui5/webcomponents")
    ], Button, "i18nBundle", void 0);
    Button = Button_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-button",
            formAssociated: true,
            languageAware: true,
            renderer: Geomap.y,
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
        Geomap.l("click", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired whenever the active state of the component changes.
         * @private
         */
        ,
        Geomap.l("active-state-change", {
            bubbles: true,
            cancelable: true,
        })
    ], Button);
    Button.define();
    var Button$1 = Button;

    exports.Button = Button$1;
    exports.ButtonTemplate = ButtonTemplate;

}));
