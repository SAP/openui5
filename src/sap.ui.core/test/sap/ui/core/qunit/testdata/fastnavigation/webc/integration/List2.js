/* eslint-disable */
sap.ui.define(['exports', 'testdata/fastnavigation/webc/integration/webcomponents', 'testdata/fastnavigation/webc/integration/i18n-defaults', 'testdata/fastnavigation/webc/integration/getEffectiveScrollbarStyle', 'testdata/fastnavigation/webc/integration/ListItemBase'], (function (exports, webcomponentsBase, i18nDefaults, getEffectiveScrollbarStyle, ListItemBase) { 'use strict';

    let t$1=null,n$1=false;const o=new Set,a$1=new Set,r$1=e=>{!e.dataTransfer||!(e.target instanceof HTMLElement)||a$1.has(e.target)||(t$1=e.target);},d=()=>{t$1=null;},l=()=>{t$1=null;},s=e=>{t$1=e;},m$1=()=>t$1,g=()=>{(document.body.addEventListener("dragstart",r$1),document.body.addEventListener("dragend",d),document.body.addEventListener("drop",l));},i$1=e=>{o.add(e),g();},E$1=e=>{o.delete(e),o.size===0&&n$1;},u$1=e=>(a$1.add(e),s),v=e=>{a$1.delete(e);},p={subscribe:i$1,unsubscribe:E$1,addSelfManagedArea:u$1,removeSelfManagedArea:v,getDraggedElement:m$1};

    function i(t,o,n,m,r={}){const a=p.getDraggedElement(),e={targetReference:null,placement:null};if(!a&&!r?.crossDnD)return e;const s=n.placements;return e.targetReference=t.target,s.some(l=>{const c=r.originalEvent?{originalEvent:t}:{};return o.fireDecoratorEvent("move-over",{...c,source:{element:a},destination:{element:m,placement:l}})?false:(t.preventDefault(),e.targetReference=n.element,e.placement=l,true)})||(e.targetReference=null),e}

    function m(t,r,o,a,n={}){t.preventDefault();const e=p.getDraggedElement();if(!e&&n?.crossDnD)return;const i=n.originalEvent?{originalEvent:t}:{};r.fireDecoratorEvent("move",{...i,source:{element:e},destination:{element:o,placement:a}}),e?.focus();}

    var a=(l=>(l.Vertical="Vertical",l.Horizontal="Horizontal",l))(a||{});

    var r=(f=>(f.On="On",f.Before="Before",f.After="After",f))(r||{});

    const A=(e,t,r$1,a)=>{const o=Math.abs(e-t),m=Math.abs(e-r$1),s=Math.abs(e-a),c=Math.min(o,m,s);let l=[];switch(c){case o:l=[r.Before];break;case m:l=[r.On,o<s?r.Before:r.After];break;case s:l=[r.After];break}return l},L=(e,t,r)=>{let a$1=Number.POSITIVE_INFINITY,o=null;for(let f=0;f<e.length;f++){const h=e[f],{left:p,width:w,top:B,height:H}=h.getBoundingClientRect();let u;r===a.Vertical?u=B+H/2:u=p+w/2;const M=Math.abs(t-u);M<a$1&&(a$1=M,o=h);}if(!o)return null;const{width:m,height:s,left:c,right:l,top:b,bottom:d}=o.getBoundingClientRect();let i;return r===a.Vertical?i=A(t,b,b+s/2,d):i=A(t,c,c+m/2,l),{element:o,placements:i}},T=(e,t)=>(t--,t<0?[]:[{element:e[t],placement:r.Before}]),y=(e,t)=>(t++,t>=e.length?[]:[{element:e[t],placement:r.After}]),E={ArrowLeft:T,ArrowUp:T,ArrowRight:y,ArrowDown:y,Home:(e,t)=>e.slice(0,t).map(r$1=>({element:r$1,placement:r.Before})),End:(e,t)=>e.slice(t+1,e.length).reverse().map(r$1=>({element:r$1,placement:r.After}))},k=(e,t,r)=>P(r.key)?E[r.key](e,e.indexOf(t)):[],P=e=>e in E;

    const t=e=>{let o=e;return e.shadowRoot&&e.shadowRoot.activeElement&&(o=e.shadowRoot.activeElement),o};

    let e=null;const u=(t,o)=>{e&&clearTimeout(e),e=setTimeout(()=>{e=null,t();},o);};

    const n=e=>{const t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)};

    /**
     * Different list growing modes.
     * @public
     */
    var ListGrowingMode;
    (function (ListGrowingMode) {
        /**
         * Component's "load-more" is fired upon pressing a "More" button.
         * at the bottom.
         * @public
         */
        ListGrowingMode["Button"] = "Button";
        /**
         * Component's "load-more" is fired upon scroll.
         * @public
         */
        ListGrowingMode["Scroll"] = "Scroll";
        /**
         * Component's growing is not enabled.
         * @public
         */
        ListGrowingMode["None"] = "None";
    })(ListGrowingMode || (ListGrowingMode = {}));
    var ListGrowingMode$1 = ListGrowingMode;

    /**
     * List accessible roles.
     * @public
     * @since 2.0.0
     */
    var ListAccessibleRole;
    (function (ListAccessibleRole) {
        /**
         * Represents the ARIA role "list". (by default)
         * @public
         */
        ListAccessibleRole["List"] = "List";
        /**
         * Represents the ARIA role "menu".
         * @public
         */
        ListAccessibleRole["Menu"] = "Menu";
        /**
         * Represents the ARIA role "tree".
         * @public
         */
        ListAccessibleRole["Tree"] = "Tree";
        /**
         * Represents the ARIA role "listbox".
         * @public
         */
        ListAccessibleRole["ListBox"] = "ListBox";
    })(ListAccessibleRole || (ListAccessibleRole = {}));
    var ListAccessibleRole$1 = ListAccessibleRole;

    /**
     * Different types of list items separators.
     * @public
     * @since 2.0.0
     */
    var ListSeparator;
    (function (ListSeparator) {
        /**
         * Separators between the items including the last and the first one.
         * @public
         */
        ListSeparator["All"] = "All";
        /**
         * Separators between the items.
         * Note: This enumeration depends on the theme.
         * @public
         */
        ListSeparator["Inner"] = "Inner";
        /**
         * No item separators.
         * @public
         */
        ListSeparator["None"] = "None";
    })(ListSeparator || (ListSeparator = {}));
    var ListSeparator$1 = ListSeparator;

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

    function BusyIndicatorTemplate() {
        return (i18nDefaults.jsxs("div", { class: "ui5-busy-indicator-root", children: [this._isBusy && (i18nDefaults.jsxs("div", { class: "ui5-busy-indicator-busy-area", title: this.ariaTitle, tabindex: 0, role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuetext": "Busy", "aria-labelledby": this.labelId, "data-sap-focus-ref": true, children: [this.textPosition.top && BusyIndicatorBusyText.call(this), i18nDefaults.jsxs("div", { class: "ui5-busy-indicator-circles-wrapper", children: [i18nDefaults.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-0" }), i18nDefaults.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-1" }), i18nDefaults.jsx("div", { class: "ui5-busy-indicator-circle circle-animation-2" })] }), this.textPosition.bottom && BusyIndicatorBusyText.call(this)] })), i18nDefaults.jsx("slot", {}), this._isBusy && (i18nDefaults.jsx("span", { "data-ui5-focus-redirect": true, tabindex: 0, role: "none", onFocusIn: this._redirectFocus }))] }));
    }
    function BusyIndicatorBusyText() {
        return (i18nDefaults.jsx(i18nDefaults.Fragment, { children: this.text && (i18nDefaults.jsx(ListItemBase.Label, { id: `${this._id}-label`, class: "ui5-busy-indicator-text", children: this.text })) }));
    }

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var busyIndicatorCss = `:host(:not([hidden])){display:inline-block}:host([_is-busy]){color:var(--_ui5-v2-11-0_busy_indicator_color)}:host([size="S"]) .ui5-busy-indicator-root{min-width:1.625rem;min-height:.5rem}:host([size="S"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:1.75rem}:host([size="S"]) .ui5-busy-indicator-circle{width:.5rem;height:.5rem}:host([size="S"]) .ui5-busy-indicator-circle:first-child,:host([size="S"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.0625rem}:host(:not([size])) .ui5-busy-indicator-root,:host([size="M"]) .ui5-busy-indicator-root{min-width:3.375rem;min-height:1rem}:host([size="M"]) .ui5-busy-indicator-circle:first-child,:host([size="M"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.1875rem}:host(:not([size])[text]:not([text=""])) .ui5-busy-indicator-root,:host([size="M"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:2.25rem}:host(:not([size])) .ui5-busy-indicator-circle,:host([size="M"]) .ui5-busy-indicator-circle{width:1rem;height:1rem}:host([size="L"]) .ui5-busy-indicator-root{min-width:6.5rem;min-height:2rem}:host([size="L"]) .ui5-busy-indicator-circle:first-child,:host([size="L"]) .ui5-busy-indicator-circle:nth-child(2){margin-inline-end:.25rem}:host([size="L"][text]:not([text=""])) .ui5-busy-indicator-root{min-height:3.25rem}:host([size="L"]) .ui5-busy-indicator-circle{width:2rem;height:2rem}.ui5-busy-indicator-root{display:flex;justify-content:center;align-items:center;position:relative;background-color:inherit;height:inherit;border-radius:inherit}.ui5-busy-indicator-busy-area{position:absolute;z-index:99;inset:0;display:flex;justify-content:center;align-items:center;background-color:inherit;flex-direction:column;border-radius:inherit}:host([active]) ::slotted(*){opacity:var(--sapContent_DisabledOpacity)}:host([desktop]) .ui5-busy-indicator-busy-area:focus,.ui5-busy-indicator-busy-area:focus-visible{outline:var(--_ui5-v2-11-0_busy_indicator_focus_outline);outline-offset:-2px}.ui5-busy-indicator-circles-wrapper{line-height:0}.ui5-busy-indicator-circle{display:inline-block;background-color:currentColor;border-radius:50%}.ui5-busy-indicator-circle:before{content:"";width:100%;height:100%;border-radius:100%}.circle-animation-0{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11)}.circle-animation-1{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.2s}.circle-animation-2{animation:grow 1.6s infinite cubic-bezier(.32,.06,.85,1.11);animation-delay:.4s}.ui5-busy-indicator-text{width:100%;text-align:center}:host([text-placement="Top"]) .ui5-busy-indicator-text{margin-bottom:.5rem}:host(:not([text-placement])) .ui5-busy-indicator-text,:host([text-placement="Bottom"]) .ui5-busy-indicator-text{margin-top:.5rem}@keyframes grow{0%,50%,to{-webkit-transform:scale(.5);-moz-transform:scale(.5);transform:scale(.5)}25%{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}}
`;

    var __decorate$4 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/BusyIndicator.js";`
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
            return BusyIndicator_1.i18nBundle.getText(i18nDefaults.BUSY_INDICATOR_TITLE);
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
            if (webcomponentsBase.B(e)) {
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
    __decorate$4([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "text", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "size", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], BusyIndicator.prototype, "active", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Number })
    ], BusyIndicator.prototype, "delay", void 0);
    __decorate$4([
        webcomponentsBase.s()
    ], BusyIndicator.prototype, "textPlacement", void 0);
    __decorate$4([
        webcomponentsBase.s({ type: Boolean })
    ], BusyIndicator.prototype, "_isBusy", void 0);
    __decorate$4([
        i18nDefaults.i("testdata/fastnavigation/webc/gen/ui5/webcomponents")
    ], BusyIndicator, "i18nBundle", void 0);
    BusyIndicator = BusyIndicator_1 = __decorate$4([
        webcomponentsBase.m({
            tag: "ui5-busy-indicator",
            languageAware: true,
            styles: busyIndicatorCss,
            renderer: i18nDefaults.y,
            template: BusyIndicatorTemplate,
        })
    ], BusyIndicator);
    BusyIndicator.define();
    var BusyIndicator$1 = BusyIndicator;

    function DropIndicatorTemplate() {
        return i18nDefaults.jsx("div", { class: {
                "ui5-di-rect": this.placement === r.On,
                "ui5-di-needle": this.placement !== r.On,
            } });
    }

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var DropIndicatorCss = `:host{position:absolute;pointer-events:none;z-index:99}:host([orientation="Vertical"]) .ui5-di-needle{width:.125rem;height:100%;inset-block:0;background:var(--sapContent_DragAndDropActiveColor)}:host([orientation="Vertical"]){margin-left:-.0625rem}:host([orientation="Horizontal"]) .ui5-di-needle{height:.125rem;width:100%;inset-inline:0;background:var(--sapContent_DragAndDropActiveColor)}:host([orientation="Horizontal"]){margin-top:-.0625rem}:host([orientation="Horizontal"][placement="Before"][first]){margin-top:.3125rem}:host([orientation="Horizontal"][placement="After"][last]){margin-top:-.3125rem}:host([orientation="Vertical"]) .ui5-di-needle:before{left:-.1875rem;content:"";position:absolute;width:.25rem;height:.25rem;border-radius:.25rem;border:.125rem solid var(--sapContent_DragAndDropActiveColor);background-color:#fff;pointer-events:none}:host([orientation="Horizontal"]) .ui5-di-needle:before{top:-.1875rem;content:"";position:absolute;width:.25rem;height:.25rem;border-radius:.25rem;border:.125rem solid var(--sapContent_DragAndDropActiveColor);background-color:#fff;pointer-events:none}:host .ui5-di-rect{border:.125rem solid var(--sapContent_DragAndDropActiveColor);position:absolute;inset:0}:host .ui5-di-rect:before{content:" ";position:absolute;inset:0;background:var(--sapContent_DragAndDropActiveColor);opacity:.05}
`;

    var __decorate$3 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     *
     * ### Overview
     *
     * ### Usage
     *
     * ### ES6 Module Import
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/DropIndicator.js";`
     *
     * @constructor
     * @extends UI5Element
     * @private
     */
    let DropIndicator = class DropIndicator extends webcomponentsBase.b {
        get _positionProperty() {
            if (this.orientation === a.Vertical) {
                return "left";
            }
            return "top";
        }
        constructor() {
            super();
            /**
             * Element where the drop indicator will be shown.
             *
             * @public
             * @default null
             */
            this.targetReference = null;
            /**
             * Owner of the indicator and the target.
             * @public
             * @default null
             */
            this.ownerReference = null;
            /**
             * Placement of the indicator relative to the target.
             *
             * @default "Before"
             * @public
             */
            this.placement = "Before";
            /**
             * Orientation of the indicator.
             *
             * @default "Vertical"
             * @public
             */
            this.orientation = "Vertical";
        }
        onAfterRendering() {
            if (!this.targetReference || !this.ownerReference) {
                Object.assign(this.style, {
                    display: "none",
                });
                return;
            }
            const { left, width, right, top, bottom, height, } = this.targetReference.getBoundingClientRect();
            const { top: containerTop, height: containerHeight, } = this.ownerReference.getBoundingClientRect();
            const style = {
                display: "",
                [this._positionProperty]: "",
                width: "",
                height: "",
            };
            let position = 0;
            let isLast = false;
            let isFirst = false;
            if (this.orientation === a.Vertical) {
                switch (this.placement) {
                    case r.Before:
                        position = left;
                        break;
                    case r.On:
                        style.width = `${width}px`;
                        position = left;
                        break;
                    case r.After:
                        position = right;
                        break;
                }
                style.height = `${height}px`;
            }
            if (this.orientation === a.Horizontal) {
                switch (this.placement) {
                    case r.Before:
                        position = top;
                        break;
                    case r.On:
                        style.height = `${height}px`;
                        position = top;
                        break;
                    case r.After:
                        position = bottom;
                        break;
                }
                style.width = `${width}px`;
                position -= containerTop;
                if (position <= 0) {
                    isFirst = true;
                }
                if (position >= containerHeight) {
                    isLast = true;
                }
            }
            style[this._positionProperty] = `${position}px`;
            this.toggleAttribute("first", isFirst);
            this.toggleAttribute("last", isLast);
            Object.assign(this.style, style);
        }
    };
    __decorate$3([
        webcomponentsBase.s({ type: Object })
    ], DropIndicator.prototype, "targetReference", void 0);
    __decorate$3([
        webcomponentsBase.s({ type: Object })
    ], DropIndicator.prototype, "ownerReference", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], DropIndicator.prototype, "placement", void 0);
    __decorate$3([
        webcomponentsBase.s()
    ], DropIndicator.prototype, "orientation", void 0);
    DropIndicator = __decorate$3([
        webcomponentsBase.m({
            tag: "ui5-drop-indicator",
            renderer: i18nDefaults.y,
            styles: DropIndicatorCss,
            template: DropIndicatorTemplate,
        })
    ], DropIndicator);
    DropIndicator.define();
    var DropIndicator$1 = DropIndicator;

    function ListTemplate() {
        return (i18nDefaults.jsx("div", { class: "ui5-list-root", onFocusIn: this._onfocusin, onKeyDown: this._onkeydown, onDragEnter: this._ondragenter, onDragOver: this._ondragover, onDrop: this._ondrop, onDragLeave: this._ondragleave, "onui5-close": this.onItemClose, "onui5-toggle": this.onItemToggle, "onui5-request-tabindex-change": this.onItemTabIndexChange, "onui5-_focused": this.onItemFocused, "onui5-forward-after": this.onForwardAfter, "onui5-forward-before": this.onForwardBefore, "onui5-selection-requested": this.onSelectionRequested, "onui5-focus-requested": this.onFocusRequested, "onui5-_press": this.onItemPress, children: i18nDefaults.jsxs(BusyIndicator$1, { id: `${this._id}-busyIndicator`, delay: this.loadingDelay, active: this.showBusyIndicatorOverlay, class: "ui5-list-busy-indicator", children: [i18nDefaults.jsxs("div", { class: "ui5-list-scroll-container", children: [this.header.length > 0 && i18nDefaults.jsx("slot", { name: "header" }), this.shouldRenderH1 &&
                                i18nDefaults.jsx("header", { id: this.headerID, class: "ui5-list-header", children: this.headerText }), this.hasData &&
                                i18nDefaults.jsx("div", { id: `${this._id}-before`, tabindex: 0, role: "none", class: "ui5-list-focusarea" }), i18nDefaults.jsx("span", { id: `${this._id}-modeLabel`, class: "ui5-hidden-text", children: this.ariaLabelModeText }), i18nDefaults.jsxs("ul", { id: `${this._id}-listUl`, class: "ui5-list-ul", role: this.listAccessibleRole, "aria-label": this.ariaLabelTxt, "aria-labelledby": this.ariaLabelledBy, "aria-description": this.ariaDescriptionText, children: [i18nDefaults.jsx("slot", {}), this.showNoDataText &&
                                        i18nDefaults.jsx("li", { tabindex: 0, id: `${this._id}-nodata`, class: "ui5-list-nodata", role: "listitem", children: i18nDefaults.jsx("div", { id: `${this._id}-nodata-text`, class: "ui5-list-nodata-text", children: this.noDataText }) })] }), this.growsWithButton && moreRow.call(this), this.footerText &&
                                i18nDefaults.jsx("footer", { id: `${this._id}-footer`, class: "ui5-list-footer", children: this.footerText }), this.hasData &&
                                i18nDefaults.jsx("div", { id: `${this._id}-after`, tabindex: 0, role: "none", class: "ui5-list-focusarea" }), i18nDefaults.jsx("span", { tabindex: -1, "aria-hidden": "true", class: "ui5-list-end-marker" })] }), i18nDefaults.jsx(DropIndicator$1, { orientation: "Horizontal", ownerReference: this })] }) }));
    }
    function moreRow() {
        return (i18nDefaults.jsx("div", { class: "ui5-growing-button", part: "growing-button", children: i18nDefaults.jsxs("div", { id: `${this._id}-growing-btn`, role: "button", tabindex: 0, part: "growing-button-inner", class: {
                    "ui5-growing-button-inner": true,
                    "ui5-growing-button-inner-active": this._loadMoreActive,
                }, "aria-labelledby": `${this._id}-growingButton-text`, onClick: this._onLoadMoreClick, onKeyDown: this._onLoadMoreKeydown, onKeyUp: this._onLoadMoreKeyup, onMouseDown: this._onLoadMoreMousedown, onMouseUp: this._onLoadMoreMouseup, children: [this.loading &&
                        i18nDefaults.jsx(BusyIndicator$1, { delay: this.loadingDelay, part: "growing-button-busy-indicator", class: "ui5-list-growing-button-busy-indicator", active: true }), i18nDefaults.jsx("span", { id: `${this._id}-growingButton-text`, class: "ui5-growing-button-text", "growing-button-text": true, children: this._growingButtonText })] }) }));
    }

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var listCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}.ui5-growing-button{display:flex;align-items:center;padding:var(--_ui5-v2-11-0_load_more_padding);border-top:1px solid var(--sapList_BorderColor);border-bottom:var(--_ui5-v2-11-0_load_more_border-bottom);box-sizing:border-box;cursor:pointer;outline:none}.ui5-growing-button-inner{display:flex;align-items:center;justify-content:center;flex-direction:row;min-height:var(--_ui5-v2-11-0_load_more_text_height);width:100%;color:var(--sapButton_TextColor);background-color:var(--sapList_Background);border:var(--_ui5-v2-11-0_load_more_border);border-radius:var(--_ui5-v2-11-0_load_more_border_radius);box-sizing:border-box}.ui5-growing-button-inner:focus-visible{outline:var(--_ui5-v2-11-0_load_more_outline_width) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);outline-offset:-.125rem;border-color:transparent}.ui5-growing-button-inner:hover{background-color:var(--sapList_Hover_Background)}.ui5-growing-button-inner:active,.ui5-growing-button-inner.ui5-growing-button-inner--active{background-color:var(--sapList_Active_Background);border-color:var(--sapList_Active_Background)}.ui5-growing-button-inner:active>*,.ui5-growing-button-inner.ui5-growing-button-inner--active>*{color:var(--sapList_Active_TextColor)}.ui5-growing-button-text{text-align:center;font-family:"72override",var(--sapFontFamily);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box}.ui5-growing-button-text{height:var(--_ui5-v2-11-0_load_more_text_height);padding:.875rem 1rem 1rem;font-size:var(--_ui5-v2-11-0_load_more_text_font_size);font-weight:700}:host([loading]) .ui5-list-growing-button-busy-indicator:not([_is-busy]){display:none}:host([loading]) .ui5-list-growing-button-busy-indicator[_is-busy]+.ui5-growing-button-text{padding-left:.5rem}:host(:not([hidden])){display:block;max-width:100%;width:100%;-webkit-tap-highlight-color:transparent}:host([indent]) .ui5-list-root{padding:2rem}:host([separators="None"]) .ui5-list-nodata{border-bottom:0}.ui5-list-root,.ui5-list-busy-indicator{width:100%;height:100%;position:relative;box-sizing:border-box}.ui5-list-scroll-container{overflow:auto;height:100%;width:100%}.ui5-list-ul{list-style-type:none;padding:0;margin:0}.ui5-list-ul:focus{outline:none}.ui5-list-focusarea{position:fixed}.ui5-list-header{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;box-sizing:border-box;font-size:var(--sapFontHeader4Size);font-family:"72override",var(--sapFontFamily);color:var(--sapGroup_TitleTextColor);height:3rem;line-height:3rem;padding:0 1rem;background-color:var(--sapGroup_TitleBackground);border-bottom:1px solid var(--sapGroup_TitleBorderColor)}.ui5-list-footer{height:2rem;box-sizing:border-box;-webkit-text-size-adjust:none;font-size:var(--sapFontSize);font-family:"72override",var(--sapFontFamily);line-height:2rem;background-color:var(--sapList_FooterBackground);color:var(--ui5-v2-11-0_list_footer_text_color);padding:0 1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ui5-list-nodata{list-style-type:none;display:-webkit-box;display:flex;-webkit-box-align:center;align-items:center;-webkit-box-pack:center;justify-content:center;color:var(--sapTextColor);background-color:var(--sapList_Background);border-bottom:1px solid var(--sapList_BorderColor);padding:0 1rem!important;outline:none;min-height:var(--_ui5-v2-11-0_list_no_data_height);font-size:var(--_ui5-v2-11-0_list_no_data_font_size);font-family:"72override",var(--sapFontFamily);position:relative}.ui5-list-nodata:focus:after{content:"";border:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);position:absolute;inset:.125rem;pointer-events:none}.ui5-list-nodata-text{overflow:hidden;text-overflow:ellipsis;white-space:normal;margin:var(--_ui5-v2-11-0_list_item_content_vertical_offset) 0}:host([growing="Scroll"]) .ui5-list-end-marker{display:inline-block}
`;

    function ListItemGroupHeaderTemplate() {
        return (i18nDefaults.jsxs("div", { part: "native-li", role: this.effectiveAccRole, tabindex: this.forcedTabIndex ? parseInt(this.forcedTabIndex) : undefined, class: {
                "ui5-ghli-root": true,
                ...this.classes.main,
            }, "aria-label": this.ariaLabelText, "aria-roledescription": this.groupHeaderText, onFocusIn: this._onfocusin, onKeyDown: this._onkeydown, children: [i18nDefaults.jsx("div", { id: `${this._id}-content`, class: "ui5-li-content", children: i18nDefaults.jsx("span", { class: "ui5-ghli-title", children: i18nDefaults.jsx("slot", {}) }) }), this.hasSubItems && i18nDefaults.jsx("slot", { name: "subItems" })] }));
    }

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var ListItemGroupHeaderCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{height:var(--_ui5-v2-11-0_group_header_list_item_height);background:var(--ui5-v2-11-0-group-header-listitem-background-color);color:var(--sapList_TableGroupHeaderTextColor)}:host([has-border]){border-bottom:var(--sapList_BorderWidth) solid var(--sapList_GroupHeaderBorderColor)}:host([actionable]:not([disabled])){cursor:default}.ui5-li-root.ui5-ghli-root{padding-top:.5rem;color:currentColor;font-size:var(--sapFontHeader6Size);font-weight:400;line-height:2rem;margin:0}.ui5-ghli-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;font-family:var(--sapFontHeaderFamily)}.ui5-li-content{width:100%}
`;

    /**
     * ListItem accessible roles.
     * @public
     * @since 2.0.0
     */
    var ListItemAccessibleRole;
    (function (ListItemAccessibleRole) {
        /**
         * Represents the ARIA role "group".
         * @private
         */
        ListItemAccessibleRole["Group"] = "Group";
        /**
         * Represents the ARIA role "listitem". (by default)
         * @public
         */
        ListItemAccessibleRole["ListItem"] = "ListItem";
        /**
         * Represents the ARIA role "menuitem".
         * @public
         */
        ListItemAccessibleRole["MenuItem"] = "MenuItem";
        /**
         * Represents the ARIA role "treeitem".
         * @public
         */
        ListItemAccessibleRole["TreeItem"] = "TreeItem";
        /**
         * Represents the ARIA role "option".
         * @public
         */
        ListItemAccessibleRole["Option"] = "Option";
        /**
         * Represents the ARIA role "none".
         * @public
         */
        ListItemAccessibleRole["None"] = "None";
    })(ListItemAccessibleRole || (ListItemAccessibleRole = {}));
    var ListItemAccessibleRole$1 = ListItemAccessibleRole;

    var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var ListItemGroupHeader_1;
    /**
     * @class
     * The `ui5-li-group-header` is a special list item, used only to separate other list items into logical groups.
     * @slot {Node[]} default - Defines the text of the component.
     *
     * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
     * @constructor
     * @extends ListItemBase
     * @private
     */
    let ListItemGroupHeader = ListItemGroupHeader_1 = class ListItemGroupHeader extends ListItemBase.ListItemBase {
        constructor() {
            super(...arguments);
            this.accessibleRole = ListItemAccessibleRole$1.ListItem;
        }
        get effectiveAccRole() {
            return i18nDefaults.n(this.accessibleRole);
        }
        get groupItem() {
            return true;
        }
        get _pressable() {
            return false;
        }
        get groupHeaderText() {
            return ListItemGroupHeader_1.i18nBundle.getText(i18nDefaults.GROUP_HEADER_TEXT);
        }
        get ariaLabelText() {
            return [this.textContent, this.accessibleName].filter(Boolean).join(" ");
        }
        get hasSubItems() {
            return this.subItems.length > 0;
        }
    };
    __decorate$2([
        webcomponentsBase.s()
    ], ListItemGroupHeader.prototype, "accessibleName", void 0);
    __decorate$2([
        webcomponentsBase.s()
    ], ListItemGroupHeader.prototype, "accessibleRole", void 0);
    __decorate$2([
        webcomponentsBase.d()
    ], ListItemGroupHeader.prototype, "subItems", void 0);
    __decorate$2([
        i18nDefaults.i("testdata/fastnavigation/webc/gen/ui5/webcomponents")
    ], ListItemGroupHeader, "i18nBundle", void 0);
    ListItemGroupHeader = ListItemGroupHeader_1 = __decorate$2([
        webcomponentsBase.m({
            tag: "ui5-li-group-header",
            languageAware: true,
            template: ListItemGroupHeaderTemplate,
            styles: [ListItemBase.ListItemBase.styles, ListItemGroupHeaderCss],
        })
    ], ListItemGroupHeader);
    ListItemGroupHeader.define();
    var ListItemGroupHeader$1 = ListItemGroupHeader;

    function ListItemGroupTemplate() {
        return (i18nDefaults.jsxs(i18nDefaults.Fragment, { children: [this.hasHeader &&
                    i18nDefaults.jsxs(ListItemGroupHeader$1, { focused: this.focused, part: "header", accessibleRole: ListItemAccessibleRole$1.ListItem, children: [this.hasFormattedHeader ? i18nDefaults.jsx("slot", { name: "header" }) : this.headerText, i18nDefaults.jsx("div", { role: "list", slot: "subItems", "aria-owns": `${this._id}-content`, "aria-label": this.headerText })] }), i18nDefaults.jsxs("div", { class: "ui5-group-li-root", onDragEnter: this._ondragenter, onDragOver: this._ondragover, onDrop: this._ondrop, onDragLeave: this._ondragleave, id: `${this._id}-content`, children: [i18nDefaults.jsx("slot", {}), i18nDefaults.jsx(DropIndicator$1, { orientation: "Horizontal", ownerReference: this })] })] }));
    }

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var ListItemGroupCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host{height:var(--_ui5-v2-11-0_group_header_list_item_height);background:var(--ui5-v2-11-0-group-header-listitem-background-color);color:var(--sapList_TableGroupHeaderTextColor)}.ui5-group-li-root{width:100%;height:100%;position:relative;box-sizing:border-box;padding:0;margin:0;list-style-type:none}
`;

    var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    /**
     * @class
     * ### Overview
     * The `ui5-li-group` is a special list item, used only to create groups of list items.
     *
     * This is the item to use inside a `ui5-list`.
     *
     * ### ES6 Module Import
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/ListItemGroup.js";`
     * @csspart header - Used to style the header item of the group
     * @constructor
     * @extends UI5Element
     * @public
     * @since 2.0.0
     */
    let ListItemGroup = class ListItemGroup extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Indicates whether the header is focused
             * @private
             */
            this.focused = false;
        }
        onEnterDOM() {
            p.subscribe(this);
        }
        onExitDOM() {
            p.unsubscribe(this);
        }
        get groupHeaderItem() {
            return this.shadowRoot.querySelector("[ui5-li-group-header]");
        }
        get hasHeader() {
            return !!this.headerText || this.hasFormattedHeader;
        }
        get hasFormattedHeader() {
            return !!this.header.length;
        }
        get isListItemGroup() {
            return true;
        }
        get dropIndicatorDOM() {
            return this.shadowRoot.querySelector("[ui5-drop-indicator]");
        }
        _ondragenter(e) {
            e.preventDefault();
        }
        _ondragleave(e) {
            if (e.relatedTarget instanceof Node && this.shadowRoot.contains(e.relatedTarget)) {
                return;
            }
            this.dropIndicatorDOM.targetReference = null;
        }
        _ondragover(e) {
            const draggedElement = p.getDraggedElement();
            if (!(e.target instanceof HTMLElement) || !draggedElement) {
                return;
            }
            const closestPosition = L(this.items, e.clientY, a.Vertical);
            if (!closestPosition) {
                this.dropIndicatorDOM.targetReference = null;
                return;
            }
            let placements = closestPosition.placements;
            if (closestPosition.element === draggedElement) {
                placements = placements.filter(placement => placement !== r.On);
            }
            const placementAccepted = placements.some(placement => {
                const beforeItemMovePrevented = !this.fireDecoratorEvent("move-over", {
                    source: {
                        element: draggedElement,
                    },
                    destination: {
                        element: closestPosition.element,
                        placement,
                    },
                });
                if (beforeItemMovePrevented) {
                    e.preventDefault();
                    this.dropIndicatorDOM.targetReference = closestPosition.element;
                    this.dropIndicatorDOM.placement = placement;
                    return true;
                }
                return false;
            });
            if (!placementAccepted) {
                this.dropIndicatorDOM.targetReference = null;
            }
        }
        _ondrop(e) {
            e.preventDefault();
            this.fireDecoratorEvent("move", {
                source: {
                    element: p.getDraggedElement(),
                },
                destination: {
                    element: this.dropIndicatorDOM.targetReference,
                    placement: this.dropIndicatorDOM.placement,
                },
            });
            this.dropIndicatorDOM.targetReference = null;
        }
    };
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemGroup.prototype, "headerText", void 0);
    __decorate$1([
        webcomponentsBase.s()
    ], ListItemGroup.prototype, "headerAccessibleName", void 0);
    __decorate$1([
        webcomponentsBase.d({
            "default": true,
            invalidateOnChildChange: true,
            type: HTMLElement,
        })
    ], ListItemGroup.prototype, "items", void 0);
    __decorate$1([
        webcomponentsBase.s({ type: Boolean })
    ], ListItemGroup.prototype, "focused", void 0);
    __decorate$1([
        webcomponentsBase.d({ type: HTMLElement })
    ], ListItemGroup.prototype, "header", void 0);
    ListItemGroup = __decorate$1([
        webcomponentsBase.m({
            tag: "ui5-li-group",
            renderer: i18nDefaults.y,
            languageAware: true,
            template: ListItemGroupTemplate,
            styles: [ListItemGroupCss],
        })
        /**
         * Fired when a movable list item is moved over a potential drop target during a dragging operation.
         *
         * If the new position is valid, prevent the default action of the event using `preventDefault()`.
         * @param {object} source Contains information about the moved element under `element` property.
         * @param {object} destination Contains information about the destination of the moved element. Has `element` and `placement` properties.
         * @public
         * @since 2.1.0
         */
        ,
        i18nDefaults.l("move-over", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when a movable list item is dropped onto a drop target.
         *
         * **Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action.
         * @param {object} source Contains information about the moved element under `element` property.
         * @param {object} destination Contains information about the destination of the moved element. Has `element` and `placement` properties.
         * @public
         * @since 2.1.0
         */
        ,
        i18nDefaults.l("move", {
            bubbles: true,
        })
    ], ListItemGroup);
    ListItemGroup.define();
    const isInstanceOfListItemGroup = (object) => {
        return "isListItemGroup" in object;
    };
    var ListItemGroup$1 = ListItemGroup;

    const findVerticalScrollContainer = (element) => {
        while (element) {
            const { overflowY } = window.getComputedStyle(element);
            if (overflowY === "auto" || overflowY === "scroll") {
                return element;
            }
            if (element.parentNode instanceof ShadowRoot) {
                element = element.parentNode.host;
            }
            else {
                element = element.parentElement;
            }
        }
        return document.scrollingElement || document.documentElement;
    };

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var List_1;
    const INFINITE_SCROLL_DEBOUNCE_RATE = 250; // ms
    const PAGE_UP_DOWN_SIZE = 10;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-list` component allows displaying a list of items, advanced keyboard
     * handling support for navigating between items, and predefined modes to improve the development efficiency.
     *
     * The `ui5-list` is a container for the available list items:
     *
     * - `ui5-li`
     * - `ui5-li-custom`
     * - `ui5-li-group`
     *
     * To benefit from the built-in selection mechanism, you can use the available
     * selection modes, such as
     * `Single`, `Multiple` and `Delete`.
     *
     * Additionally, the `ui5-list` provides header, footer, and customization for the list item separators.
     *
     * ### Keyboard Handling
     *
     * #### Basic Navigation
     * The `ui5-list` provides advanced keyboard handling.
     * When a list is focused the user can use the following keyboard
     * shortcuts in order to perform a navigation:
     *
     * - [Up] or [Down] - Navigates up and down the items
     * - [Home] - Navigates to first item
     * - [End] - Navigates to the last item
     *
     * The user can use the following keyboard shortcuts to perform actions (such as select, delete),
     * when the `selectionMode` property is in use:
     *
     * - [Space] - Select an item (if `type` is 'Active') when `selectionMode` is selection
     * - [Delete] - Delete an item if `selectionMode` property is `Delete`
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/List.js";`
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/ListItemStandard.js";` (for `ui5-li`)
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/ListItemCustom.js";` (for `ui5-li-custom`)
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/ListItemGroup.js";` (for `ui5-li-group`)
     * @constructor
     * @extends UI5Element
     * @public
     * @csspart growing-button - Used to style the button, that is used for growing of the component
     * @csspart growing-button-inner - Used to style the button inner element
     */
    let List = List_1 = class List extends webcomponentsBase.b {
        constructor() {
            super();
            /**
             * Determines whether the component is indented.
             * @default false
             * @public
             */
            this.indent = false;
            /**
             * Defines the selection mode of the component.
             * @default "None"
             * @public
             */
            this.selectionMode = "None";
            /**
             * Defines the item separator style that is used.
             * @default "All"
             * @public
             */
            this.separators = "All";
            /**
             * Defines whether the component will have growing capability either by pressing a `More` button,
             * or via user scroll. In both cases `load-more` event is fired.
             *
             * **Restrictions:** `growing="Scroll"` is not supported for Internet Explorer,
             * on IE the component will fallback to `growing="Button"`.
             * @default "None"
             * @since 1.0.0-rc.13
             * @public
             */
            this.growing = "None";
            /**
             * Defines if the component would display a loading indicator over the list.
             * @default false
             * @public
             * @since 1.0.0-rc.6
             */
            this.loading = false;
            /**
             * Defines the delay in milliseconds, after which the loading indicator will show up for this component.
             * @default 1000
             * @public
             */
            this.loadingDelay = 1000;
            /**
             * Defines the accessible role of the component.
             * @public
             * @default "List"
             * @since 1.0.0-rc.15
             */
            this.accessibleRole = "List";
            /**
             * Defines if the entire list is in view port.
             * @private
             */
            this._inViewport = false;
            /**
             * Defines the active state of the `More` button.
             * @private
             */
            this._loadMoreActive = false;
            /**
             * Defines the current media query size.
             * @default "S"
             * @private
             */
            this.mediaRange = "S";
            this._previouslyFocusedItem = null;
            // Indicates that the List is forwarding the focus before or after the internal ul.
            this._forwardingFocus = false;
            // Indicates if the IntersectionObserver started observing the List
            this.listEndObserved = false;
            this._itemNavigation = new webcomponentsBase.f$3(this, {
                skipItemsSize: PAGE_UP_DOWN_SIZE, // PAGE_UP and PAGE_DOWN will skip trough 10 items
                navigationMode: webcomponentsBase.r.Vertical,
                getItemsCallback: () => this.getEnabledItems(),
            });
            this._handleResizeCallback = this._handleResize.bind(this);
            // Indicates the List bottom most part has been detected by the IntersectionObserver
            // for the first time.
            this.initialIntersection = true;
            this._groupCount = 0;
            this._groupItemCount = 0;
            this.onItemFocusedBound = this.onItemFocused.bind(this);
            this.onForwardAfterBound = this.onForwardAfter.bind(this);
            this.onForwardBeforeBound = this.onForwardBefore.bind(this);
            this.onItemTabIndexChangeBound = this.onItemTabIndexChange.bind(this);
        }
        /**
         * Returns an array containing the list item instances without the groups in a flat structure.
         * @default []
         * @since 2.0.0
         * @public
         */
        get listItems() {
            return this.getItems();
        }
        _updateAssociatedLabelsTexts() {
            this._associatedDescriptionRefTexts = i18nDefaults.p(this);
            this._associatedLabelsRefTexts = i18nDefaults.E(this);
        }
        onEnterDOM() {
            i18nDefaults.y$1(this, this._updateAssociatedLabelsTexts.bind(this));
            p.subscribe(this);
            webcomponentsBase.f$4.register(this.getDomRef(), this._handleResizeCallback);
        }
        onExitDOM() {
            i18nDefaults.T(this);
            this.unobserveListEnd();
            webcomponentsBase.f$4.deregister(this.getDomRef(), this._handleResizeCallback);
            p.unsubscribe(this);
        }
        onBeforeRendering() {
            this.detachGroupHeaderEvents();
            this.prepareListItems();
        }
        onAfterRendering() {
            this.attachGroupHeaderEvents();
            if (this.growsOnScroll) {
                this.observeListEnd();
            }
            else if (this.listEndObserved) {
                this.unobserveListEnd();
            }
            if (this.grows) {
                this.checkListInViewport();
            }
        }
        attachGroupHeaderEvents() {
            // events fired by the group headers are not bubbling through the shadow
            // dom of the groups because of capture: false of the custom events
            this.getItems().forEach(item => {
                if (item.hasAttribute("ui5-li-group-header")) {
                    item.addEventListener("ui5-_focused", this.onItemFocusedBound);
                    item.addEventListener("ui5-forward-after", this.onForwardAfterBound);
                    item.addEventListener("ui5-forward-before", this.onForwardBeforeBound);
                }
            });
        }
        detachGroupHeaderEvents() {
            this.getItems().forEach(item => {
                if (item.hasAttribute("ui5-li-group-header")) {
                    item.removeEventListener("ui5-_focused", this.onItemFocusedBound);
                    item.removeEventListener("ui5-forward-after", this.onForwardAfterBound);
                    item.removeEventListener("ui5-forward-before", this.onForwardBeforeBound);
                }
            });
        }
        getFocusDomRef() {
            return this._itemNavigation._getCurrentItem();
        }
        get shouldRenderH1() {
            return !this.header.length && this.headerText;
        }
        get headerID() {
            return `${this._id}-header`;
        }
        get modeLabelID() {
            return `${this._id}-modeLabel`;
        }
        get listEndDOM() {
            return this.shadowRoot.querySelector(".ui5-list-end-marker");
        }
        get dropIndicatorDOM() {
            return this.shadowRoot.querySelector("[ui5-drop-indicator]");
        }
        get hasData() {
            return this.getItems().length !== 0;
        }
        get showBusyIndicatorOverlay() {
            return !this.growsWithButton && this.loading;
        }
        get showNoDataText() {
            return !this.hasData && this.noDataText;
        }
        get isDelete() {
            return this.selectionMode === ListItemBase.ListSelectionMode.Delete;
        }
        get isSingleSelect() {
            return [
                ListItemBase.ListSelectionMode.Single,
                ListItemBase.ListSelectionMode.SingleStart,
                ListItemBase.ListSelectionMode.SingleEnd,
                ListItemBase.ListSelectionMode.SingleAuto,
            ].includes(this.selectionMode);
        }
        get isMultiple() {
            return this.selectionMode === ListItemBase.ListSelectionMode.Multiple;
        }
        get ariaLabelledBy() {
            if (this.accessibleNameRef || this.accessibleName) {
                return undefined;
            }
            const ids = [];
            if (this.isMultiple || this.isSingleSelect || this.isDelete) {
                ids.push(this.modeLabelID);
            }
            if (this.shouldRenderH1) {
                ids.push(this.headerID);
            }
            return ids.length ? ids.join(" ") : undefined;
        }
        get ariaLabelTxt() {
            return this._associatedLabelsRefTexts || i18nDefaults.A(this);
        }
        get ariaDescriptionText() {
            return this._associatedDescriptionRefTexts || i18nDefaults.L(this) || this._getDescriptionForGroups();
        }
        get scrollContainer() {
            return this.shadowRoot.querySelector(".ui5-list-scroll-container");
        }
        hasGrowingComponent() {
            if (this.growsOnScroll && this.scrollContainer) {
                return this.scrollContainer.clientHeight !== this.scrollContainer.scrollHeight;
            }
            return this.growsWithButton;
        }
        _getDescriptionForGroups() {
            let description = "";
            if (this._groupCount > 0) {
                if (this.accessibleRole === ListAccessibleRole$1.List) {
                    description = List_1.i18nBundle.getText(i18nDefaults.LIST_ROLE_LIST_GROUP_DESCRIPTION, this._groupCount, this._groupItemCount);
                }
                else if (this.accessibleRole === ListAccessibleRole$1.ListBox) {
                    description = List_1.i18nBundle.getText(i18nDefaults.LIST_ROLE_LISTBOX_GROUP_DESCRIPTION, this._groupCount);
                }
            }
            return description;
        }
        get ariaLabelModeText() {
            if (this.hasData) {
                if (this.isMultiple) {
                    return List_1.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_MULTISELECTABLE);
                }
                if (this.isSingleSelect) {
                    return List_1.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_SELECTABLE);
                }
                if (this.isDelete) {
                    return List_1.i18nBundle.getText(i18nDefaults.ARIA_LABEL_LIST_DELETABLE);
                }
            }
            return "";
        }
        get grows() {
            return this.growing !== ListGrowingMode$1.None;
        }
        get growsOnScroll() {
            return this.growing === ListGrowingMode$1.Scroll;
        }
        get growsWithButton() {
            return this.growing === ListGrowingMode$1.Button;
        }
        get _growingButtonText() {
            return this.growingButtonText || List_1.i18nBundle.getText(i18nDefaults.LOAD_MORE_TEXT);
        }
        get listAccessibleRole() {
            return i18nDefaults.n(this.accessibleRole);
        }
        get classes() {
            return {
                root: {
                    "ui5-list-root": true,
                },
            };
        }
        prepareListItems() {
            const slottedItems = this.getItemsForProcessing();
            slottedItems.forEach((item, key) => {
                const isLastChild = key === slottedItems.length - 1;
                const showBottomBorder = this.separators === ListSeparator$1.All
                    || (this.separators === ListSeparator$1.Inner && !isLastChild);
                if (item.hasConfigurableMode) {
                    item._selectionMode = this.selectionMode;
                }
                item.hasBorder = showBottomBorder;
                item.mediaRange = this.mediaRange;
            });
        }
        async observeListEnd() {
            if (!this.listEndObserved) {
                await webcomponentsBase.f$5();
                this.getIntersectionObserver().observe(this.listEndDOM);
                this.listEndObserved = true;
            }
        }
        unobserveListEnd() {
            if (this.growingIntersectionObserver) {
                this.growingIntersectionObserver.disconnect();
                this.growingIntersectionObserver = null;
                this.listEndObserved = false;
            }
        }
        onInteresection(entries) {
            if (this.initialIntersection) {
                this.initialIntersection = false;
                return;
            }
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    u(this.loadMore.bind(this), INFINITE_SCROLL_DEBOUNCE_RATE);
                }
            });
        }
        /*
        * ITEM SELECTION BASED ON THE CURRENT MODE
        */
        onSelectionRequested(e) {
            const previouslySelectedItems = this.getSelectedItems();
            let selectionChange = false;
            if (this.selectionMode !== ListItemBase.ListSelectionMode.None && this[`handle${this.selectionMode}`]) {
                selectionChange = this[`handle${this.selectionMode}`](e.detail.item, !!e.detail.selected);
            }
            if (selectionChange) {
                const changePrevented = !this.fireDecoratorEvent("selection-change", {
                    selectedItems: this.getSelectedItems(),
                    previouslySelectedItems,
                    selectionComponentPressed: e.detail.selectionComponentPressed,
                    targetItem: e.detail.item,
                    key: e.detail.key,
                });
                if (changePrevented) {
                    this._revertSelection(previouslySelectedItems);
                }
            }
        }
        handleSingle(item) {
            if (item.selected) {
                return false;
            }
            this.deselectSelectedItems();
            item.selected = true;
            return true;
        }
        handleSingleStart(item) {
            return this.handleSingle(item);
        }
        handleSingleEnd(item) {
            return this.handleSingle(item);
        }
        handleSingleAuto(item) {
            return this.handleSingle(item);
        }
        handleMultiple(item, selected) {
            item.selected = selected;
            return true;
        }
        handleDelete(item) {
            this.fireDecoratorEvent("item-delete", { item });
            return true;
        }
        deselectSelectedItems() {
            this.getSelectedItems().forEach(item => { item.selected = false; });
        }
        getSelectedItems() {
            return this.getItems().filter(item => item.selected);
        }
        getEnabledItems() {
            return this.getItems().filter(item => item._focusable);
        }
        getItems() {
            // drill down when we see ui5-li-group and get the items
            const items = [];
            const slottedItems = this.getSlottedNodes("items");
            let groupCount = 0;
            let groupItemCount = 0;
            slottedItems.forEach(item => {
                if (isInstanceOfListItemGroup(item)) {
                    const groupItems = [item.groupHeaderItem, ...item.items.filter(listItem => listItem.assignedSlot)].filter(Boolean);
                    items.push(...groupItems);
                    groupCount++;
                    // subtract group itself for proper group header item count
                    groupItemCount += groupItems.length - 1;
                }
                else {
                    item.assignedSlot && items.push(item);
                }
            });
            this._groupCount = groupCount;
            this._groupItemCount = groupItemCount;
            return items;
        }
        getItemsForProcessing() {
            return this.getItems();
        }
        _revertSelection(previouslySelectedItems) {
            this.getItems().forEach((item) => {
                const oldSelection = previouslySelectedItems.indexOf(item) !== -1;
                const multiSelectCheckBox = item.shadowRoot.querySelector(".ui5-li-multisel-cb");
                const singleSelectRadioButton = item.shadowRoot.querySelector(".ui5-li-singlesel-radiobtn");
                item.selected = oldSelection;
                if (multiSelectCheckBox) {
                    multiSelectCheckBox.checked = oldSelection;
                }
                else if (singleSelectRadioButton) {
                    singleSelectRadioButton.checked = oldSelection;
                }
            });
        }
        _onkeydown(e) {
            if (webcomponentsBase.W(e)) {
                this._handleEnd();
                e.preventDefault();
                return;
            }
            if (webcomponentsBase.F(e)) {
                this._handleHome();
                return;
            }
            if (webcomponentsBase.P(e)) {
                this._handleDown();
                e.preventDefault();
                return;
            }
            if (webcomponentsBase.f$6(e)) {
                this._moveItem(e.target, e);
                return;
            }
            if (webcomponentsBase.B(e)) {
                this._handleTabNext(e);
            }
        }
        _moveItem(item, e) {
            if (!item || !item.movable) {
                return;
            }
            const closestPositions = k(this.items, item, e);
            if (!closestPositions.length) {
                return;
            }
            e.preventDefault();
            const acceptedPosition = closestPositions.find(({ element, placement }) => {
                return !this.fireDecoratorEvent("move-over", {
                    originalEvent: e,
                    source: {
                        element: item,
                    },
                    destination: {
                        element,
                        placement,
                    },
                });
            });
            if (acceptedPosition) {
                this.fireDecoratorEvent("move", {
                    originalEvent: e,
                    source: {
                        element: item,
                    },
                    destination: {
                        element: acceptedPosition.element,
                        placement: acceptedPosition.placement,
                    },
                });
                item.focus();
            }
        }
        _onLoadMoreKeydown(e) {
            if (webcomponentsBase.i(e)) {
                e.preventDefault();
                this._loadMoreActive = true;
            }
            if (webcomponentsBase.b$1(e)) {
                this._onLoadMoreClick();
                this._loadMoreActive = true;
            }
            if (webcomponentsBase.B(e)) {
                this.focusAfterElement();
            }
            if (webcomponentsBase.D$1(e)) {
                this._handleLodeMoreUp(e);
                return;
            }
            if (webcomponentsBase.m$2(e)) {
                if (this.getPreviouslyFocusedItem()) {
                    this.focusPreviouslyFocusedItem();
                }
                else {
                    this.focusFirstItem();
                }
                e.preventDefault();
            }
        }
        _onLoadMoreKeyup(e) {
            if (webcomponentsBase.i(e)) {
                this._onLoadMoreClick();
            }
            this._loadMoreActive = false;
        }
        _onLoadMoreMousedown() {
            this._loadMoreActive = true;
        }
        _onLoadMoreMouseup() {
            this._loadMoreActive = false;
        }
        _onLoadMoreClick() {
            this.loadMore();
        }
        _handleLodeMoreUp(e) {
            const growingButton = this.getGrowingButton();
            if (growingButton === e.target) {
                const items = this.getItems();
                const lastItem = items[items.length - 1];
                this.focusItem(lastItem);
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
        checkListInViewport() {
            this._inViewport = n(this.getDomRef());
        }
        loadMore() {
            if (this.hasGrowingComponent()) {
                this.fireDecoratorEvent("load-more");
            }
        }
        _handleResize() {
            this.checkListInViewport();
            const width = this.getBoundingClientRect().width;
            this.mediaRange = webcomponentsBase.i$2.getCurrentRange(webcomponentsBase.i$2.RANGESETS.RANGE_4STEPS, width);
        }
        /*
        * KEYBOARD SUPPORT
        */
        _handleTabNext(e) {
            t(e.target);
            {
                return;
            }
        }
        _handleHome() {
            if (!this.growsWithButton) {
                return;
            }
            this.focusFirstItem();
        }
        _handleEnd() {
            if (!this.growsWithButton) {
                return;
            }
            this._shouldFocusGrowingButton();
        }
        _handleDown() {
            if (!this.growsWithButton) {
                return;
            }
            this._shouldFocusGrowingButton();
        }
        _onfocusin(e) {
            const target = t(e.target);
            // If the focusin event does not origin from one of the 'triggers' - ignore it.
            if (!this.isForwardElement(target)) {
                return;
            }
            // The focus arrives in the List for the first time.
            // If there is selected item - focus it or focus the first item.
            if (!this.getPreviouslyFocusedItem()) {
                if (this.growsWithButton && this.isForwardAfterElement(target)) {
                    this.focusGrowingButton();
                }
                else {
                    this.focusFirstItem();
                }
                e.stopImmediatePropagation();
                return;
            }
            // The focus returns to the List,
            // focus the first selected item or the previously focused element.
            if (!this.getForwardingFocus()) {
                if (this.growsWithButton && this.isForwardAfterElement(target)) {
                    this.focusGrowingButton();
                    e.stopImmediatePropagation();
                    return;
                }
                this.focusPreviouslyFocusedItem();
            }
            e.stopImmediatePropagation();
            this.setForwardingFocus(false);
        }
        _ondragenter(e) {
            e.preventDefault();
        }
        _ondragleave(e) {
            if (e.relatedTarget instanceof Node && this.shadowRoot.contains(e.relatedTarget)) {
                return;
            }
            this.dropIndicatorDOM.targetReference = null;
        }
        _ondragover(e) {
            if (!(e.target instanceof HTMLElement)) {
                return;
            }
            const closestPosition = L(this.items, e.clientY, a.Vertical);
            if (!closestPosition) {
                this.dropIndicatorDOM.targetReference = null;
                return;
            }
            const { targetReference, placement } = i(e, this, closestPosition, closestPosition.element, { originalEvent: true });
            this.dropIndicatorDOM.targetReference = targetReference;
            this.dropIndicatorDOM.placement = placement;
        }
        _ondrop(e) {
            if (!this.dropIndicatorDOM?.targetReference || !this.dropIndicatorDOM?.placement) {
                e.preventDefault();
                return;
            }
            m(e, this, this.dropIndicatorDOM.targetReference, this.dropIndicatorDOM.placement, { originalEvent: true });
            this.dropIndicatorDOM.targetReference = null;
        }
        isForwardElement(element) {
            const elementId = element.id;
            const beforeElement = this.getBeforeElement();
            if (this._id === elementId || (beforeElement && beforeElement.id === elementId)) {
                return true;
            }
            return this.isForwardAfterElement(element);
        }
        isForwardAfterElement(element) {
            const elementId = element.id;
            const afterElement = this.getAfterElement();
            return afterElement && afterElement.id === elementId;
        }
        onItemTabIndexChange(e) {
            e.stopPropagation();
            const target = e.target;
            this._itemNavigation.setCurrentItem(target);
        }
        onItemFocused(e) {
            const target = e.target;
            e.stopPropagation();
            this._itemNavigation.setCurrentItem(target);
            this.fireDecoratorEvent("item-focused", { item: target });
            if (this.selectionMode === ListItemBase.ListSelectionMode.SingleAuto) {
                const detail = {
                    item: target,
                    selectionComponentPressed: false,
                    selected: true,
                    key: e.detail.key,
                };
                this.onSelectionRequested({ detail });
            }
        }
        onItemPress(e) {
            const pressedItem = e.detail.item;
            if (!this.fireDecoratorEvent("item-click", { item: pressedItem })) {
                return;
            }
            if (this.selectionMode !== ListItemBase.ListSelectionMode.Delete) {
                const detail = {
                    item: pressedItem,
                    selectionComponentPressed: false,
                    selected: !pressedItem.selected,
                    key: e.detail.key,
                };
                this.onSelectionRequested({ detail });
            }
        }
        // This is applicable to NotificationListItem
        onItemClose(e) {
            const target = e.target;
            const shouldFireItemClose = target?.hasAttribute("ui5-li-notification") || target?.hasAttribute("ui5-li-notification-group");
            if (shouldFireItemClose) {
                this.fireDecoratorEvent("item-close", { item: e.detail?.item });
            }
        }
        onItemToggle(e) {
            this.fireDecoratorEvent("item-toggle", { item: e.detail.item });
        }
        onForwardBefore(e) {
            this.setPreviouslyFocusedItem(e.target);
            this.focusBeforeElement();
            e.stopPropagation();
        }
        onForwardAfter(e) {
            this.setPreviouslyFocusedItem(e.target);
            if (!this.growsWithButton) {
                this.focusAfterElement();
            }
            else {
                this.focusGrowingButton();
                e.preventDefault();
            }
            e.stopPropagation();
        }
        focusBeforeElement() {
            this.setForwardingFocus(true);
            this.getBeforeElement().focus();
        }
        focusAfterElement() {
            this.setForwardingFocus(true);
            this.getAfterElement().focus();
        }
        focusGrowingButton() {
            const growingBtn = this.getGrowingButton();
            if (growingBtn) {
                growingBtn.focus();
            }
        }
        _shouldFocusGrowingButton() {
            const items = this.getItems();
            const lastIndex = items.length - 1;
            const currentIndex = this._itemNavigation._currentIndex;
            if (currentIndex !== -1 && currentIndex === lastIndex) {
                this.focusGrowingButton();
            }
        }
        getGrowingButton() {
            return this.shadowRoot.querySelector(`[id="${this._id}-growing-btn"]`);
        }
        /**
         * Focuses the first list item and sets its tabindex to "0" via the ItemNavigation
         * @protected
         */
        focusFirstItem() {
            // only enabled items are focusable
            const firstItem = this.getFirstItem(x => x._focusable);
            if (firstItem) {
                firstItem.focus();
            }
        }
        focusPreviouslyFocusedItem() {
            const previouslyFocusedItem = this.getPreviouslyFocusedItem();
            if (previouslyFocusedItem) {
                previouslyFocusedItem.focus();
            }
        }
        focusFirstSelectedItem() {
            // only enabled items are focusable
            const firstSelectedItem = this.getFirstItem(x => x.selected && x._focusable);
            if (firstSelectedItem) {
                firstSelectedItem.focus();
            }
        }
        /**
         * Focuses a list item and sets its tabindex to "0" via the ItemNavigation
         * @protected
         * @param item
         */
        focusItem(item) {
            this._itemNavigation.setCurrentItem(item);
            item.focus();
        }
        onFocusRequested(e) {
            setTimeout(() => {
                this.setPreviouslyFocusedItem(e.target);
                this.focusPreviouslyFocusedItem();
            }, 0);
        }
        setForwardingFocus(forwardingFocus) {
            this._forwardingFocus = forwardingFocus;
        }
        getForwardingFocus() {
            return this._forwardingFocus;
        }
        setPreviouslyFocusedItem(item) {
            this._previouslyFocusedItem = item;
        }
        getPreviouslyFocusedItem() {
            return this._previouslyFocusedItem;
        }
        getFirstItem(filter) {
            const slottedItems = this.getItems();
            let firstItem = null;
            if (!filter) {
                return slottedItems.length ? slottedItems[0] : null;
            }
            for (let i = 0; i < slottedItems.length; i++) {
                if (filter(slottedItems[i])) {
                    firstItem = slottedItems[i];
                    break;
                }
            }
            return firstItem;
        }
        getAfterElement() {
            if (!this._afterElement) {
                this._afterElement = this.shadowRoot.querySelector(`[id="${this._id}-after"]`);
            }
            return this._afterElement;
        }
        getBeforeElement() {
            if (!this._beforeElement) {
                this._beforeElement = this.shadowRoot.querySelector(`[id="${this._id}-before"]`);
            }
            return this._beforeElement;
        }
        getIntersectionObserver() {
            if (!this.growingIntersectionObserver) {
                const scrollContainer = this.scrollContainer || findVerticalScrollContainer(this.getDomRef());
                this.growingIntersectionObserver = new IntersectionObserver(this.onInteresection.bind(this), {
                    root: scrollContainer,
                    rootMargin: "5px",
                    threshold: 1.0,
                });
            }
            return this.growingIntersectionObserver;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "headerText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "footerText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], List.prototype, "indent", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "selectionMode", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "noDataText", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "separators", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "growing", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "growingButtonText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], List.prototype, "loading", void 0);
    __decorate([
        webcomponentsBase.s({ type: Number })
    ], List.prototype, "loadingDelay", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleNameRef", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleDescription", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleDescriptionRef", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], List.prototype, "_associatedDescriptionRefTexts", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], List.prototype, "_associatedLabelsRefTexts", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "accessibleRole", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], List.prototype, "_inViewport", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], List.prototype, "_loadMoreActive", void 0);
    __decorate([
        webcomponentsBase.s()
    ], List.prototype, "mediaRange", void 0);
    __decorate([
        webcomponentsBase.d({
            type: HTMLElement,
            "default": true,
            invalidateOnChildChange: true,
        })
    ], List.prototype, "items", void 0);
    __decorate([
        webcomponentsBase.d()
    ], List.prototype, "header", void 0);
    __decorate([
        i18nDefaults.i("testdata/fastnavigation/webc/gen/ui5/webcomponents")
    ], List, "i18nBundle", void 0);
    List = List_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-list",
            fastNavigation: true,
            renderer: i18nDefaults.y,
            template: ListTemplate,
            styles: [
                listCss,
                getEffectiveScrollbarStyle.a(),
            ],
        })
        /**
         * Fired when an item is activated, unless the item's `type` property
         * is set to `Inactive`.
         *
         * **Note**: This event is not triggered by interactions with selection components such as the checkboxes and radio buttons,
         * associated with non-default `selectionMode` values, or if any other **interactive** component
         * (such as a button or input) within the list item is directly clicked.
         * @param {HTMLElement} item The clicked item.
         * @public
         */
        ,
        i18nDefaults.l("item-click", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when the `Close` button of any item is clicked
         *
         * **Note:** This event is only applicable to list items that can be closed (such as notification list items),
         * not to be confused with `item-delete`.
         * @param {HTMLElement} item the item about to be closed.
         * @public
         * @since 1.0.0-rc.8
         */
        ,
        i18nDefaults.l("item-close", {
            bubbles: true,
        })
        /**
         * Fired when the `Toggle` button of any item is clicked.
         *
         * **Note:** This event is only applicable to list items that can be toggled (such as notification group list items).
         * @param {HTMLElement} item the toggled item.
         * @public
         * @since 1.0.0-rc.8
         */
        ,
        i18nDefaults.l("item-toggle", {
            bubbles: true,
        })
        /**
         * Fired when the Delete button of any item is pressed.
         *
         * **Note:** A Delete button is displayed on each item,
         * when the component `selectionMode` property is set to `Delete`.
         * @param {HTMLElement} item the deleted item.
         * @public
         */
        ,
        i18nDefaults.l("item-delete", {
            bubbles: true,
        })
        /**
         * Fired when selection is changed by user interaction
         * in `Single`, `SingleStart`, `SingleEnd` and `Multiple` selection modes.
         * @param {Array<ListItemBase>} selectedItems An array of the selected items.
         * @param {Array<ListItemBase>} previouslySelectedItems An array of the previously selected items.
         * @public
         */
        ,
        i18nDefaults.l("selection-change", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when the user scrolls to the bottom of the list.
         *
         * **Note:** The event is fired when the `growing='Scroll'` property is enabled.
         * @public
         * @since 1.0.0-rc.6
         */
        ,
        i18nDefaults.l("load-more", {
            bubbles: true,
        })
        /**
         * @private
         */
        ,
        i18nDefaults.l("item-focused", {
            bubbles: true,
        })
        /**
         * Fired when a movable list item is moved over a potential drop target during a dragging operation.
         *
         * If the new position is valid, prevent the default action of the event using `preventDefault()`.
         * @param {object} source Contains information about the moved element under `element` property.
         * @param {object} destination Contains information about the destination of the moved element. Has `element` and `placement` properties.
         * @public
         * @since 2.0.0
         */
        ,
        i18nDefaults.l("move-over", {
            bubbles: true,
            cancelable: true,
        })
        /**
         * Fired when a movable list item is dropped onto a drop target.
         *
         * **Note:** `move` event is fired only if there was a preceding `move-over` with prevented default action.
         * @param {object} source Contains information about the moved element under `element` property.
         * @param {object} destination Contains information about the destination of the moved element. Has `element` and `placement` properties.
         * @public
         */
        ,
        i18nDefaults.l("move", {
            bubbles: true,
        })
    ], List);
    List.define();
    var List$1 = List;

    exports.DropIndicator = DropIndicator$1;
    exports.List = List$1;
    exports.ListAccessibleRole = ListAccessibleRole$1;
    exports.ListItemAccessibleRole = ListItemAccessibleRole$1;
    exports.ListItemGroup = ListItemGroup$1;
    exports.ListItemGroupHeader = ListItemGroupHeader$1;

}));
