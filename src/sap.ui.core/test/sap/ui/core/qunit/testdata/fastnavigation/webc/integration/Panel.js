/* eslint-disable */
sap.ui.define(['testdata/fastnavigation/webc/integration/webcomponents', 'testdata/fastnavigation/webc/integration/i18n-defaults', 'testdata/fastnavigation/webc/integration/Button', 'testdata/fastnavigation/webc/integration/Icon', 'testdata/fastnavigation/webc/integration/slim-arrow-right'], (function (webcomponentsBase, i18nDefaults, Button, Icon, slimArrowRight) { 'use strict';

    function PanelTemplate() {
        return (i18nDefaults.jsx(i18nDefaults.Fragment, { children: i18nDefaults.jsxs("div", { class: "ui5-panel-root", role: this.accRole, "aria-label": this.effectiveAccessibleName, "aria-labelledby": this.fixedPanelAriaLabelledbyReference, children: [this.hasHeaderOrHeaderText &&
                        // header: either header or h1 with header text
                        i18nDefaults.jsx("div", { class: {
                                "ui5-panel-heading-wrapper": true,
                                "ui5-panel-heading-wrapper-sticky": this.stickyHeader,
                            }, role: this.headingWrapperRole, "aria-level": this.headingWrapperAriaLevel, children: i18nDefaults.jsxs("div", { onClick: this._headerClick, onKeyDown: this._headerKeyDown, onKeyUp: this._headerKeyUp, class: "ui5-panel-header", tabindex: this.headerTabIndex, role: this.accInfo.role, "aria-expanded": this.accInfo.ariaExpanded, "aria-controls": this.accInfo.ariaControls, "aria-labelledby": this.accInfo.ariaLabelledby, part: "header", children: [!this.fixed &&
                                        i18nDefaults.jsx("div", { class: "ui5-panel-header-button-root", children: this._hasHeader ?
                                                i18nDefaults.jsx(Button, { design: "Transparent", class: "ui5-panel-header-button ui5-panel-header-button-with-icon", onClick: this._toggleButtonClick, accessibilityAttributes: this.accInfo.button.accessibilityAttributes, tooltip: this.accInfo.button.title, accessibleName: this.accInfo.button.ariaLabelButton, children: i18nDefaults.jsx("div", { class: "ui5-panel-header-icon-wrapper", children: i18nDefaults.jsx(Icon.Icon, { class: {
                                                                "ui5-panel-header-icon": true,
                                                                "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                            }, name: slimArrowRight.slimArrowRightIcon }) }) })
                                                : // else
                                                    i18nDefaults.jsx(Icon.Icon, { class: {
                                                            "ui5-panel-header-button": true,
                                                            "ui5-panel-header-icon": true,
                                                            "ui5-panel-header-button-animated": !this.shouldNotAnimate,
                                                        }, name: slimArrowRight.slimArrowRightIcon, showTooltip: true, accessibleName: this.toggleButtonTitle }) }), this._hasHeader ?
                                        i18nDefaults.jsx("slot", { name: "header" })
                                        : // else
                                            i18nDefaults.jsx("div", { id: `${this._id}-header-title`, class: "ui5-panel-header-title", children: this.headerText })] }) }), i18nDefaults.jsx("div", { class: "ui5-panel-content", id: `${this._id}-content`, tabindex: -1, style: {
                            display: this._contentExpanded ? "block" : "none",
                        }, part: "content", children: i18nDefaults.jsx("slot", {}) })] }) }));
    }

    webcomponentsBase.p("ui5/webcomponents-theming", "sap_horizon", async () => i18nDefaults.defaultThemeBase);
    webcomponentsBase.p("ui5/webcomponents", "sap_horizon", async () => i18nDefaults.defaultTheme);
    var panelCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:block}:host{font-family:"72override",var(--sapFontFamily);background-color:var(--sapGroup_TitleBackground);border-radius:var(--_ui5-v2-11-0_panel_border_radius)}:host(:not([collapsed])){border-bottom:var(--_ui5-v2-11-0_panel_border_bottom)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{min-height:var(--_ui5-v2-11-0_panel_header_height);width:100%;position:relative;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:var(--_ui5-v2-11-0_panel_header_padding_right);font-family:"72override",var(--sapFontHeaderFamily);font-size:var(--sapGroup_Title_FontSize);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-header-icon{color:var(--_ui5-v2-11-0_panel_icon_color)}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header]):not([fixed])) .ui5-panel-header{cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--_ui5-v2-11-0_panel_focus_border);border-radius:var(--_ui5-v2-11-0_panel_border_radius);top:var(--_ui5-v2-11-0_panel_focus_offset);bottom:var(--_ui5-v2-11-0_panel_focus_bottom_offset);left:var(--_ui5-v2-11-0_panel_focus_offset);right:var(--_ui5-v2-11-0_panel_focus_offset)}:host(:not([collapsed]):not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{border-radius:var(--_ui5-v2-11-0_panel_border_radius_expanded)}:host(:not([collapsed])) .ui5-panel-header-button:not(.ui5-panel-header-button-with-icon),:host(:not([collapsed])) .ui5-panel-header-icon-wrapper [ui5-icon]{transform:var(--_ui5-v2-11-0_panel_toggle_btn_rotation)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky{position:sticky;top:0;background-color:var(--_ui5-v2-11-0_panel_header_background_color);z-index:100;border-radius:var(--_ui5-v2-11-0_panel_border_radius)}.ui5-panel-header-title{width:calc(100% - var(--_ui5-v2-11-0_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-panel-content{padding:var(--_ui5-v2-11-0_panel_content_padding);background-color:var(--sapGroup_ContentBackground);outline:none;border-bottom-left-radius:var(--_ui5-v2-11-0_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-11-0_panel_border_radius);overflow:auto}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5-v2-11-0_panel_button_root_width);height:var(--_ui5-v2-11-0_panel_button_root_height);padding:var(--_ui5-v2-11-0_panel_header_button_wrapper_padding);box-sizing:border-box}:host([fixed]:not([collapsed]):not([_has-header])) .ui5-panel-header,:host([collapsed]) .ui5-panel-header{border-bottom:.0625rem solid var(--sapGroup_TitleBorderColor)}:host([collapsed]) .ui5-panel-header{border-bottom-left-radius:var(--_ui5-v2-11-0_panel_border_radius);border-bottom-right-radius:var(--_ui5-v2-11-0_panel_border_radius)}:host(:not([fixed]):not([collapsed])) .ui5-panel-header{border-bottom:var(--_ui5-v2-11-0_panel_default_header_border)}[ui5-button].ui5-panel-header-button{display:flex;justify-content:center;align-items:center;min-width:initial;height:100%;width:100%}.ui5-panel-header-icon-wrapper{display:flex;justify-content:center;align-items:center}.ui5-panel-header-icon-wrapper,.ui5-panel-header-icon-wrapper .ui5-panel-header-icon{color:inherit}.ui5-panel-header-icon-wrapper,[ui5-button].ui5-panel-header-button-with-icon [ui5-icon]{pointer-events:none}.ui5-panel-root{height:100%;display:flex;flex-direction:column}
`;

    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var Panel_1;
    /**
     * @class
     *
     * ### Overview
     *
     * The `ui5-panel` component is a container which has a header and a
     * content area and is used
     * for grouping and displaying information. It can be collapsed to save space on the screen.
     *
     * ### Guidelines:
     *
     * - Nesting two or more panels is not recommended.
     * - Do not stack too many panels on one page.
     *
     * ### Structure
     * The panel's header area consists of a title bar with a header text or custom header.
     *
     * The header is clickable and can be used to toggle between the expanded and collapsed state. It includes an icon which rotates depending on the state.
     *
     * The custom header can be set through the `header` slot and it may contain arbitraray content, such as: title, buttons or any other HTML elements.
     *
     * The content area can contain an arbitrary set of controls.
     *
     * **Note:** The custom header is not clickable out of the box, but in this case the icon is interactive and allows to show/hide the content area.
     *
     * ### Responsive Behavior
     *
     * - If the width of the panel is set to 100% (default), the panel and its children are
     * resized responsively,
     * depending on its parent container.
     * - If the panel has a fixed height, it will take up the space even if the panel is
     * collapsed.
     * - When the panel is expandable (the `fixed` property is set to `false`),
     * an arrow icon (pointing to the right) appears in front of the header.
     * - When the animation is activated, expand/collapse uses a smooth animation to open or
     * close the content area.
     * - When the panel expands/collapses, the arrow icon rotates 90 degrees
     * clockwise/counter-clockwise.
     *
     * ### Keyboard Handling
     *
     * #### Fast Navigation
     * This component provides a build in fast navigation group which can be used via [F6] / [Shift] + [F6] / [Ctrl] + [Alt/Option] / [Down] or [Ctrl] + [Alt/Option] + [Up].
     * In order to use this functionality, you need to import the following module:
     * `import "ui5/webcomponents-base/dist/features/F6Navigation.js"`
     *
     * ### ES6 Module Import
     *
     * `import "ui5/webcomponents/dist/Panel.js";`
     * @constructor
     * @extends UI5Element
     * @public
     * @slot {Array<Node>} default - Defines the content of the component. The content is visible only when the component is expanded.
     * @csspart header - Used to style the wrapper of the header.
     * @csspart content - Used to style the wrapper of the content.
     */
    let Panel = Panel_1 = class Panel extends webcomponentsBase.b {
        constructor() {
            super(...arguments);
            /**
             * Determines whether the component is in a fixed state that is not
             * expandable/collapsible by user interaction.
             * @default false
             * @public
             */
            this.fixed = false;
            /**
             * Indicates whether the component is collapsed and only the header is displayed.
             * @default false
             * @public
             */
            this.collapsed = false;
            /**
             * Indicates whether the transition between the expanded and the collapsed state of the component is animated. By default the animation is enabled.
             * @default false
             * @public
             * @since 1.0.0-rc.16
             */
            this.noAnimation = false;
            /**
             * Sets the accessible ARIA role of the component.
             * Depending on the usage, you can change the role from the default `Form`
             * to `Region` or `Complementary`.
             * @default "Form"
             * @public
             */
            this.accessibleRole = "Form";
            /**
             * Defines the "aria-level" of component heading,
             * set by the `headerText`.
             * @default "H2"
             * @public
            */
            this.headerLevel = "H2";
            /**
             * Indicates whether the Panel header is sticky or not.
             * If stickyHeader is set to true, then whenever you scroll the content or
             * the application, the header of the panel will be always visible and
             * a solid color will be used for its design.
             * @default false
             * @public
             * @since 1.16.0-rc.1
             */
            this.stickyHeader = false;
            /**
             * When set to `true`, the `accessibleName` property will be
             * applied not only on the panel root itself, but on its toggle button too.
             * **Note:** This property only has effect if `accessibleName` is set and a header slot is provided.
             * @default false
             * @private
              */
            this.useAccessibleNameForToggleButton = false;
            /**
             * @private
             */
            this._hasHeader = false;
            this._contentExpanded = false;
            this._animationRunning = false;
        }
        onBeforeRendering() {
            // If the animation is running, it will set the content expanded state at the end
            if (!this._animationRunning) {
                this._contentExpanded = !this.collapsed;
            }
            this._hasHeader = !!this.header.length;
        }
        shouldToggle(element) {
            const customContent = this.header.length;
            if (customContent) {
                return element.classList.contains("ui5-panel-header-button");
            }
            return true;
        }
        get shouldNotAnimate() {
            return this.noAnimation || webcomponentsBase.d$1() === webcomponentsBase.u.None;
        }
        _headerClick(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            this._toggleOpen();
        }
        _toggleButtonClick(e) {
            if (e.detail.originalEvent.x === 0 && e.detail.originalEvent.y === 0) {
                e.stopImmediatePropagation();
            }
        }
        _headerKeyDown(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            if (webcomponentsBase.b$1(e)) {
                e.preventDefault();
            }
            if (webcomponentsBase.i(e)) {
                e.preventDefault();
            }
        }
        _headerKeyUp(e) {
            if (!this.shouldToggle(e.target)) {
                return;
            }
            if (webcomponentsBase.b$1(e)) {
                this._toggleOpen();
            }
            if (webcomponentsBase.i(e)) {
                this._toggleOpen();
            }
        }
        _toggleOpen() {
            if (this.fixed) {
                return;
            }
            this.collapsed = !this.collapsed;
            if (this.shouldNotAnimate) {
                this.fireDecoratorEvent("toggle");
                return;
            }
            this._animationRunning = true;
            const elements = this.getDomRef().querySelectorAll(".ui5-panel-content");
            const animations = [];
            [].forEach.call(elements, oElement => {
                if (this.collapsed) {
                    animations.push(webcomponentsBase.u$1(oElement).promise());
                }
                else {
                    animations.push(webcomponentsBase.b$2(oElement).promise());
                }
            });
            Promise.all(animations).then(() => {
                this._animationRunning = false;
                this._contentExpanded = !this.collapsed;
                this.fireDecoratorEvent("toggle");
            });
        }
        _headerOnTarget(target) {
            return target.classList.contains("sapMPanelWrappingDiv");
        }
        get toggleButtonTitle() {
            return Panel_1.i18nBundle.getText(i18nDefaults.PANEL_ICON);
        }
        get expanded() {
            return !this.collapsed;
        }
        get accRole() {
            return this.accessibleRole.toLowerCase();
        }
        get effectiveAccessibleName() {
            return typeof this.accessibleName === "string" && this.accessibleName.length ? this.accessibleName : undefined;
        }
        get accInfo() {
            return {
                "button": {
                    "accessibilityAttributes": {
                        "expanded": this.expanded,
                    },
                    "title": this.toggleButtonTitle,
                    "ariaLabelButton": !this.nonFocusableButton && this.useAccessibleNameForToggleButton ? this.effectiveAccessibleName : undefined,
                },
                "ariaExpanded": this.nonFixedInternalHeader ? this.expanded : undefined,
                "ariaControls": this.nonFixedInternalHeader ? `${this._id}-content` : undefined,
                "ariaLabelledby": this.nonFocusableButton ? this.ariaLabelledbyReference : undefined,
                "role": this.nonFixedInternalHeader ? "button" : undefined,
            };
        }
        get ariaLabelledbyReference() {
            return (this.nonFocusableButton && this.headerText && !this.fixed) ? `${this._id}-header-title` : undefined;
        }
        get fixedPanelAriaLabelledbyReference() {
            return this.fixed && !this.effectiveAccessibleName ? `${this._id}-header-title` : undefined;
        }
        get headerAriaLevel() {
            return Number.parseInt(this.headerLevel.slice(1));
        }
        get headerTabIndex() {
            return (this.header.length || this.fixed) ? -1 : 0;
        }
        get headingWrapperAriaLevel() {
            return !this._hasHeader ? this.headerAriaLevel : undefined;
        }
        get headingWrapperRole() {
            return !this._hasHeader ? "heading" : undefined;
        }
        get nonFixedInternalHeader() {
            return !this._hasHeader && !this.fixed;
        }
        get hasHeaderOrHeaderText() {
            return this._hasHeader || this.headerText;
        }
        get nonFocusableButton() {
            return !this.header.length;
        }
    };
    __decorate([
        webcomponentsBase.s()
    ], Panel.prototype, "headerText", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "fixed", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "collapsed", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "noAnimation", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Panel.prototype, "accessibleRole", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Panel.prototype, "headerLevel", void 0);
    __decorate([
        webcomponentsBase.s()
    ], Panel.prototype, "accessibleName", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "stickyHeader", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "useAccessibleNameForToggleButton", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean })
    ], Panel.prototype, "_hasHeader", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Panel.prototype, "_contentExpanded", void 0);
    __decorate([
        webcomponentsBase.s({ type: Boolean, noAttribute: true })
    ], Panel.prototype, "_animationRunning", void 0);
    __decorate([
        webcomponentsBase.d()
    ], Panel.prototype, "header", void 0);
    __decorate([
        i18nDefaults.i("ui5/webcomponents")
    ], Panel, "i18nBundle", void 0);
    Panel = Panel_1 = __decorate([
        webcomponentsBase.m({
            tag: "ui5-panel",
            fastNavigation: true,
            languageAware: true,
            renderer: i18nDefaults.y,
            template: PanelTemplate,
            styles: panelCss,
        })
        /**
         * Fired when the component is expanded/collapsed by user interaction.
         * @public
         */
        ,
        i18nDefaults.l("toggle", {
            bubbles: true,
        })
    ], Panel);
    Panel.define();
    var Panel$1 = Panel;

    return Panel$1;

}));
