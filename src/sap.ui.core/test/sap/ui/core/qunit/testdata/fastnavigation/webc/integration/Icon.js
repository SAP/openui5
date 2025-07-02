/* eslint-disable */
sap.ui.define(['exports', 'testdata/fastnavigation/webc/integration/webcomponents', 'testdata/fastnavigation/webc/integration/i18n-defaults'], (function (exports, webcomponentsBase, i18nDefaults) { 'use strict';

    function IconTemplate() {
        return (i18nDefaults.jsxs("svg", { class: "ui5-icon-root", part: "root", tabindex: this._tabIndex, dir: this._dir, viewBox: this.viewBox, role: this.effectiveAccessibleRole, focusable: "false", preserveAspectRatio: "xMidYMid meet", "aria-label": this.effectiveAccessibleName, "aria-hidden": this.effectiveAriaHidden, xmlns: "http://www.w3.org/2000/svg", onKeyDown: this._onkeydown, onKeyUp: this._onkeyup, children: [this.hasIconTooltip &&
                    i18nDefaults.jsxs("title", { id: `${this._id}-tooltip`, children: [" ", this.effectiveAccessibleName, " "] }), i18nDefaults.jsxs("g", { role: "presentation", children: [this.customSvg &&
                            i18nDefaults.jsx("g", { dangerouslySetInnerHTML: { __html: this.customSvg.strings?.join("") ?? "" } }), this.pathData.map(path => (i18nDefaults.jsx("path", { d: path })))] })] }));
    }

    /**
     * Different Icon modes.
     * @public
     * @since 2.0.0
     */
    var IconMode;
    (function (IconMode) {
        /**
         * Image mode (by default).
         * Configures the component to internally render role="img".
         * @public
         */
        IconMode["Image"] = "Image";
        /**
         * Decorative mode.
         * Configures the component to internally render role="presentation" and aria-hidden="true",
         * making it purely decorative without semantic content or interactivity.
         * @public
         */
        IconMode["Decorative"] = "Decorative";
        /**
         * Interactive mode.
         * Configures the component to internally render role="button".
         * This mode also supports focus and press handling to enhance interactivity.
         * @public
        */
        IconMode["Interactive"] = "Interactive";
    })(IconMode || (IconMode = {}));
    var IconMode$1 = IconMode;

    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("testdata/fastnavigation/webc/gen/ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var iconCss = `:host{-webkit-tap-highlight-color:rgba(0,0,0,0)}:host([hidden]){display:none}:host([invalid]){display:none}:host(:not([hidden]).ui5_hovered){opacity:.7}:host{display:inline-block;width:1rem;height:1rem;color:var(--sapContent_IconColor);fill:currentColor;outline:none}:host([design="Contrast"]){color:var(--sapContent_ContrastIconColor)}:host([design="Critical"]){color:var(--sapCriticalElementColor)}:host([design="Information"]){color:var(--sapInformativeElementColor)}:host([design="Negative"]){color:var(--sapNegativeElementColor)}:host([design="Neutral"]){color:var(--sapNeutralElementColor)}:host([design="NonInteractive"]){color:var(--sapContent_NonInteractiveIconColor)}:host([design="Positive"]){color:var(--sapPositiveElementColor)}:host([mode="Interactive"][desktop]) .ui5-icon-root:focus,:host([mode="Interactive"]) .ui5-icon-root:focus-visible{outline:var(--sapContent_FocusWidth) var(--sapContent_FocusStyle) var(--sapContent_FocusColor);border-radius:var(--ui5-v2-11-0-icon-focus-border-radius)}.ui5-icon-root{display:flex;height:100%;width:100%;outline:none;vertical-align:top}:host([mode="Interactive"]){cursor:pointer}.ui5-icon-root:not([dir=ltr])>g{transform:var(--_ui5-v2-11-0_icon_transform_scale);transform-origin:center}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    const ICON_NOT_FOUND = "ICON_NOT_FOUND";
    /**
     * @class
     * ### Overview
     *
     * The `ui5-icon` component represents an SVG icon.
     * There are two main scenarios how the `ui5-icon` component is used:
     * as a purely decorative element,
     * or as an interactive element that can be focused and clicked.
     *
     * ### Usage
     *
     * 1. **Get familiar with the icons collections.**
     *
     * Before displaying an icon, you need to explore the icons collections to find and import the desired icon.
     *
     * Currently there are 3 icons collection, available as 3 npm packages:
     *
     * - [ui5/webcomponents-icons](https://www.npmjs.com/package/ui5/webcomponents-icons) represents the "SAP-icons" collection and includes the following
     * [icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons).
     * - [ui5/webcomponents-icons-tnt](https://www.npmjs.com/package/ui5/webcomponents-icons-tnt) represents the "tnt" collection and includes the following
     * [icons](https://sdk.openui5.org/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/SAP-icons-TNT).
     * - [ui5/webcomponents-icons-business-suite](https://www.npmjs.com/package/ui5/webcomponents-icons-business-suite) represents the "business-suite" collection and includes the following
     * [icons](https://ui5.sap.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html#/overview/BusinessSuiteInAppSymbols).
     *
     * 2. **After exploring the icons collections, add one or more of the packages as dependencies to your project.**
     *
     * `npm i ui5/webcomponents-icons`
     * `npm i ui5/webcomponents-icons-tnt`
     * `npm i ui5/webcomponents-icons-business-suite`
     *
     * 3. **Then, import the desired icon**.
     *
     * `import "ui5/\{package_name\}/dist/\{icon_name\}.js";`
     *
     * **For Example**:
     *
     * For the standard "SAP-icons" icon collection, import an icon from the `ui5/webcomponents-icons` package:
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons/dist/employee.js";`
     *
     * For the "tnt" (SAP Fiori Tools) icon collection, import an icon from the `ui5/webcomponents-icons-tnt` package:
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons-tnt/dist/antenna.js";`
     *
     * For the "business-suite" (SAP Business Suite) icon collection, import an icon from the `ui5/webcomponents-icons-business-suite` package:
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons-business-suite/dist/ab-testing.js";`
     *
     * 4. **Display the icon using the `ui5-icon` web component.**
     * Set the icon collection ("SAP-icons", "tnt" or "business-suite" - "SAP-icons" is the default icon collection and can be skipped)
     * and the icon name to the `name` property.
     *
     * `<ui5-icon name="employee"></ui5-icon>`
     * `<ui5-icon name="tnt/antenna"></ui5-icon>`
     * `<ui5-icon name="business-suite/ab-testing"></ui5-icon>`
     *
     * ### Keyboard Handling
     *
     * - [Space] / [Enter] or [Return] - Fires the `click` event if the `mode` property is set to `Interactive`.
     * - [Shift] - If [Space] / [Enter] or [Return] is pressed, pressing [Shift] releases the ui5-icon without triggering the click event.
     *
     * ### ES6 Module Import
     *
     * `import "testdata/fastnavigation/webc/gen/ui5/webcomponents/dist/Icon.js";`
     * @csspart root - Used to style the outermost wrapper of the `ui5-icon`.
     * @constructor
     * @extends UI5Element
     * @implements {IIcon}
     * @public
     */
    let Icon = class Icon extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Defines the component semantic design.
             * @default "Default"
             * @public
             * @since 1.9.2
             */
            this.design = "Default";
            /**
             * Defines whether the component should have a tooltip.
             *
             * **Note:** The tooltip text should be provided via the `accessible-name` property.
             * @default false
             * @public
             */
            this.showTooltip = false;
            /**
             * Defines the mode of the component.
             * @default "Decorative"
             * @public
             * @since 2.0.0
             */
            this.mode = "Decorative";
            /**
             * @private
             */
            this.pathData = [];
            /**
            * @private
            */
            this.invalid = false;
        }
        _onkeydown(e) {
            if (this.mode !== IconMode$1.Interactive) {
                return;
            }
            if (webcomponentsBase.b$1(e)) {
                this.fireDecoratorEvent("click");
            }
            if (webcomponentsBase.i(e)) {
                e.preventDefault(); // prevent scrolling
            }
        }
        _onkeyup(e) {
            if (this.mode === IconMode$1.Interactive && webcomponentsBase.i(e)) {
                this.fireDecoratorEvent("click");
            }
        }
        /**
        * Enforce "ltr" direction, based on the icons collection metadata.
        */
        get _dir() {
            return this.ltr ? "ltr" : undefined;
        }
        get effectiveAriaHidden() {
            return this.mode === IconMode$1.Decorative ? "true" : undefined;
        }
        get _tabIndex() {
            return this.mode === IconMode$1.Interactive ? 0 : undefined;
        }
        get effectiveAccessibleRole() {
            switch (this.mode) {
                case IconMode$1.Interactive:
                    return "button";
                case IconMode$1.Decorative:
                    return "presentation";
                default:
                    return "img";
            }
        }
        onEnterDOM() {
            if (webcomponentsBase.f$1()) {
                this.setAttribute("desktop", "");
            }
        }
        async onBeforeRendering() {
            const name = this.name;
            if (!name) {
                return;
            }
            let iconData = webcomponentsBase.u$2(name);
            if (!iconData) {
                iconData = await webcomponentsBase.n(name);
            }
            if (!iconData) {
                this.invalid = true;
                /* eslint-disable-next-line */
                return console.warn(`Required icon is not registered. Invalid icon name: ${this.name}`);
            }
            if (iconData === ICON_NOT_FOUND) {
                this.invalid = true;
                /* eslint-disable-next-line */
                return console.warn(`Required icon is not registered. You can either import the icon as a module in order to use it e.g. "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons/dist/${name.replace("sap-icon://", "")}.js", or setup a JSON build step and import "testdata/fastnavigation/webc/gen/ui5/webcomponents-icons/dist/AllIcons.js".`);
            }
            this.viewBox = iconData.viewBox || "0 0 512 512";
            if (iconData.customTemplate) {
                iconData.pathData = [];
                this.customSvg = webcomponentsBase.n$1(iconData.customTemplate, this);
            }
            // in case a new valid name is set, show the icon
            this.invalid = false;
            this.pathData = Array.isArray(iconData.pathData) ? iconData.pathData : [iconData.pathData];
            this.accData = iconData.accData;
            this.ltr = iconData.ltr;
            this.packageName = iconData.packageName;
            if (this.accessibleName) {
                this.effectiveAccessibleName = this.accessibleName;
            }
            else if (this.accData) {
                const i18nBundle = await webcomponentsBase.f$2(this.packageName);
                this.effectiveAccessibleName = i18nBundle.getText(this.accData) || undefined;
            }
            else {
                this.effectiveAccessibleName = undefined;
            }
        }
        get hasIconTooltip() {
            return this.showTooltip && this.effectiveAccessibleName;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Icon.prototype, "design", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Icon.prototype, "name", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Icon.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Icon.prototype, "showTooltip", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Icon.prototype, "mode", void 0);
    __decorate([
        webcomponentsBase.s({ type: Array })
    ], Icon.prototype, "pathData", void 0);
    __decorate([
        webcomponentsBase.s({ type: Object, noAttribute: true })
    ], Icon.prototype, "accData", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Icon.prototype, "invalid", void 0);
    __decorate([
        webcomponentsBase.s({ noAttribute: true })
    ], Icon.prototype, "effectiveAccessibleName", void 0);
    Icon = __decorate([
        webcomponentsBase.m({
            tag: "ui5-icon",
            languageAware: true,
            themeAware: true,
            renderer: i18nDefaults.y,
            template: IconTemplate,
            styles: iconCss,
        })
        /**
         * Fired on mouseup, `SPACE` and `ENTER`.
         * - on mouse click, the icon fires native `click` event
         * - on `SPACE` and `ENTER`, the icon fires custom `click` event
         * @public
         * @since 2.11.0
         */
        ,
        i18nDefaults.l("click", {
            bubbles: true,
        })
    ], Icon);
    Icon.define();
    var Icon$1 = Icon;

    exports.Icon = Icon$1;

}));
