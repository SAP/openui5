sap.ui.define(['require', 'sap/ui/geomap/thirdparty/webcomponents', 'sap/ui/geomap/thirdparty/Geomap2', 'sap/ui/geomap/thirdparty/GeomapContainerControl', 'sap/ui/geomap/thirdparty/Icon', 'sap/ui/geomap/thirdparty/Button', 'sap/ui/geomap/thirdparty/GeomapControlBase', 'sap/ui/geomap/thirdparty/GeomapElement'], (function (require, webcomponentsBase, Geomap, GeomapContainerControl, Icon, Button, GeomapControlBase, GeomapElement) { 'use strict';

	const name$1 = "slim-arrow-right";
	const pathData$1 = "M5.178 2.87c-.237-.228-.237-.466 0-.715A.445.445 0 0 1 5.505 2c.119 0 .228.052.327.155l4.9 5.13c.179.207.268.446.268.715 0 .27-.09.497-.267.684l-4.901 5.16A.46.46 0 0 1 5.49 14a.46.46 0 0 1-.341-.155.503.503 0 0 1 0-.716L9.9 8.155c.119-.103.119-.217 0-.342L5.178 2.87Z";
	const ltr$1 = false;
	const viewBox$1 = "0 0 16 16";
	const collection$1 = "SAP-icons-v4";
	const packageName$1 = "@ui5/webcomponents-icons";

	webcomponentsBase.y(name$1, { pathData: pathData$1, ltr: ltr$1, viewBox: viewBox$1, collection: collection$1, packageName: packageName$1 });

	const name = "slim-arrow-right";
	const pathData = "M6.273 3.17a.75.75 0 0 1 1.056.103l3.5 4.247a.75.75 0 0 1 0 .955l-3.5 4.252a.75.75 0 0 1-1.158-.954l3.107-3.775-3.107-3.771a.75.75 0 0 1 .102-1.056Z";
	const ltr = false;
	const viewBox = "0 0 16 16";
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";

	webcomponentsBase.y(name, { pathData, ltr, viewBox, collection, packageName });

	var slimArrowRight = "slim-arrow-right";

	function PanelTemplate() {
	    return (Geomap.jsx(Geomap.Fragment, { children: Geomap.jsxs("div", { class: "ui5-panel-root", role: this.accRole, "aria-label": this.effectiveAccessibleName, "aria-labelledby": this.fixedPanelAriaLabelledbyReference, children: [this.hasHeaderOrHeaderText &&
	                    // header: either header or h1 with header text
	                    Geomap.jsx("div", { class: {
	                            "ui5-panel-heading-wrapper": true,
	                            "ui5-panel-heading-wrapper-sticky": this.stickyHeader,
	                        }, role: this.headingWrapperRole, "aria-level": this.headingWrapperAriaLevel, part: "header-wrapper", children: Geomap.jsxs("div", { onClick: this._headerClick, onKeyDown: this._headerKeyDown, onKeyUp: this._headerKeyUp, onTouchStart: this._isMobile, onFocusOut: this._headerFocusOut, class: "ui5-panel-header", tabindex: this.headerTabIndex, role: this.accInfo.role, "aria-expanded": this.accInfo.ariaExpanded, "aria-controls": this.accInfo.ariaControls, "aria-labelledby": this.accInfo.ariaLabelledby, part: "header", children: [!this.fixed &&
	                                    Geomap.jsx("div", { class: "ui5-panel-header-button-root", children: this._hasHeader ?
	                                            Geomap.jsx(Button.Button, { design: "Transparent", class: "ui5-panel-header-button ui5-panel-header-button-with-icon", onClick: this._toggleButtonClick, accessibilityAttributes: this.accInfo.button.accessibilityAttributes, tooltip: this.accInfo.button.title, accessibleName: this.accInfo.button.ariaLabelButton, children: Geomap.jsx("div", { class: "ui5-panel-header-icon-wrapper", children: Geomap.jsx(Icon.Icon, { class: {
	                                                            "ui5-panel-header-icon": true,
	                                                            "ui5-panel-header-button-animated": !this.shouldNotAnimate,
	                                                        }, name: slimArrowRight }) }) })
	                                            : // else
	                                                Geomap.jsx(Icon.Icon, { class: {
	                                                        "ui5-panel-header-button": true,
	                                                        "ui5-panel-header-icon": true,
	                                                        "ui5-panel-header-button-animated": !this.shouldNotAnimate,
	                                                    }, name: slimArrowRight, showTooltip: true, accessibleName: this.toggleButtonTitle }) }), this._hasHeader ?
	                                    Geomap.jsx("slot", { name: "header" })
	                                    : // else
	                                        Geomap.jsx("div", { id: `${this._id}-header-title`, class: "ui5-panel-header-title", children: this.headerText })] }) }), Geomap.jsx("div", { class: "ui5-panel-content", id: `${this._id}-content`, tabindex: -1, style: {
	                        display: this._contentExpanded ? "block" : "none",
	                    }, part: "content", children: Geomap.jsx("slot", {}) })] }) }));
	}

	webcomponentsBase.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => Geomap.defaultThemeBase);
	webcomponentsBase.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => Icon.defaultTheme, "host");
	var panelCss = `.ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:-1000px;top:-1000px;pointer-events:none;font-size:0}:host(:not([hidden])){display:block}:host{font-family:var(--sapFontFamily);background-color:var(--sapGroup_TitleBackground);border-radius:var(--_ui5_panel_border_radius)}:host(:not([collapsed])){border-bottom:var(--_ui5_panel_border_bottom)}:host([fixed]) .ui5-panel-header{padding-left:1rem}.ui5-panel-header{min-height:var(--_ui5_panel_header_height);width:100%;position:relative;display:flex;justify-content:flex-start;align-items:center;outline:none;box-sizing:border-box;padding-right:var(--_ui5_panel_header_padding_right);font-family:var(--sapFontHeaderFamily);font-size:var(--sapGroup_Title_FontSize);font-weight:400;color:var(--sapGroup_TitleTextColor)}.ui5-panel-header-icon{color:var(--_ui5_panel_icon_color)}.ui5-panel-header-button-animated{transition:transform .4s ease-out}:host(:not([_has-header]):not([fixed])) .ui5-panel-header{cursor:pointer}:host(:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{content:"";position:absolute;pointer-events:none;z-index:2;border:var(--_ui5_panel_focus_border);border-radius:var(--_ui5_panel_border_radius);top:var(--_ui5_panel_focus_offset);bottom:var(--_ui5_panel_focus_bottom_offset);left:var(--_ui5_panel_focus_offset);right:var(--_ui5_panel_focus_offset)}:host(:not([collapsed]):not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{border-radius:var(--_ui5_panel_border_radius_expanded)}:host([_touched]:not([_has-header]):not([fixed])) .ui5-panel-header:focus:after{display:none}:host(:not([collapsed])) .ui5-panel-header-button:not(.ui5-panel-header-button-with-icon),:host(:not([collapsed])) .ui5-panel-header-icon-wrapper [ui5-icon]{transform:var(--_ui5_panel_toggle_btn_rotation)}:host([fixed]) .ui5-panel-header-title{width:100%}.ui5-panel-heading-wrapper.ui5-panel-heading-wrapper-sticky{position:sticky;top:0;background-color:var(--_ui5_panel_header_background_color);z-index:100;border-radius:var(--_ui5_panel_border_radius)}.ui5-panel-header-title{width:calc(100% - var(--_ui5_panel_button_root_width));overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ui5-panel-content{padding:var(--_ui5_panel_content_padding);background-color:var(--sapGroup_ContentBackground);outline:none;border-bottom-left-radius:var(--_ui5_panel_border_radius);border-bottom-right-radius:var(--_ui5_panel_border_radius);overflow:auto}.ui5-panel-header-button-root{display:flex;justify-content:center;align-items:center;flex-shrink:0;width:var(--_ui5_panel_button_root_width);height:var(--_ui5_panel_button_root_height);padding:var(--_ui5_panel_header_button_wrapper_padding);box-sizing:border-box}:host([fixed]:not([collapsed]):not([_has-header])) .ui5-panel-header,:host([collapsed]) .ui5-panel-header{border-bottom:.0625rem solid var(--sapGroup_TitleBorderColor)}:host([collapsed]) .ui5-panel-header{border-bottom-left-radius:var(--_ui5_panel_border_radius);border-bottom-right-radius:var(--_ui5_panel_border_radius)}:host(:not([fixed]):not([collapsed])) .ui5-panel-header{border-bottom:var(--_ui5_panel_default_header_border)}[ui5-button].ui5-panel-header-button{display:flex;justify-content:center;align-items:center;min-width:initial;height:100%;width:100%}.ui5-panel-header-icon-wrapper{display:flex;justify-content:center;align-items:center}.ui5-panel-header-icon-wrapper,.ui5-panel-header-icon-wrapper .ui5-panel-header-icon{color:inherit}.ui5-panel-header-icon-wrapper,[ui5-button].ui5-panel-header-button-with-icon [ui5-icon]{pointer-events:none}.ui5-panel-root{height:100%;display:flex;flex-direction:column}
`;

	var __decorate$2 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
	 * `import "@ui5/webcomponents-base/dist/features/F6Navigation.js"`
	 *
	 * ### ES6 Module Import
	 *
	 * `import "@ui5/webcomponents/dist/Panel.js";`
	 * @constructor
	 * @extends UI5Element
	 * @public
	 * @slot {Array<Node>} default - Defines the content of the component. The content is visible only when the component is expanded.
	 * @csspart header-wrapper - Used to style the outermost header wrapper, useful for adjusting sticky header position.
	 * @csspart header - Used to style the header.
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
	        this._pendingToggle = false;
	        this._touched = false;
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
	        return this.noAnimation || webcomponentsBase.m$1() === webcomponentsBase.u.None;
	    }
	    _isMobile() {
	        if (webcomponentsBase.l$1()) {
	            this._touched = true;
	        }
	    }
	    _headerFocusOut() {
	        this._touched = false;
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
	            this._toggleOpen();
	        }
	        if (webcomponentsBase.A(e)) {
	            e.preventDefault();
	            this._pendingToggle = true;
	        }
	        // Cancel toggle if Escape is pressed
	        if (webcomponentsBase.m$2(e) && this._pendingToggle) {
	            e.preventDefault();
	            this._pendingToggle = false;
	        }
	    }
	    _headerKeyUp(e) {
	        if (!this.shouldToggle(e.target)) {
	            return;
	        }
	        if (webcomponentsBase.b$1(e)) {
	            e.preventDefault();
	        }
	        if (webcomponentsBase.A(e)) {
	            // Only toggle if space was pressed and escape wasn't pressed to cancel
	            if (this._pendingToggle) {
	                this._toggleOpen();
	            }
	            this._pendingToggle = false;
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
	        return Panel_1.i18nBundle.getText(Icon.PANEL_ICON);
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
	__decorate$2([
	    webcomponentsBase.s()
	], Panel.prototype, "headerText", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], Panel.prototype, "fixed", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], Panel.prototype, "collapsed", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], Panel.prototype, "noAnimation", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], Panel.prototype, "accessibleRole", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], Panel.prototype, "headerLevel", void 0);
	__decorate$2([
	    webcomponentsBase.s()
	], Panel.prototype, "accessibleName", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], Panel.prototype, "stickyHeader", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], Panel.prototype, "useAccessibleNameForToggleButton", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], Panel.prototype, "_hasHeader", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean, noAttribute: true })
	], Panel.prototype, "_contentExpanded", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean, noAttribute: true })
	], Panel.prototype, "_animationRunning", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean, noAttribute: true })
	], Panel.prototype, "_pendingToggle", void 0);
	__decorate$2([
	    webcomponentsBase.s({ type: Boolean })
	], Panel.prototype, "_touched", void 0);
	__decorate$2([
	    webcomponentsBase.d$1()
	], Panel.prototype, "header", void 0);
	__decorate$2([
	    Icon.i("@ui5/webcomponents")
	], Panel, "i18nBundle", void 0);
	Panel = Panel_1 = __decorate$2([
	    webcomponentsBase.m({
	        tag: "ui5-panel",
	        fastNavigation: true,
	        languageAware: true,
	        renderer: Geomap.y,
	        template: PanelTemplate,
	        styles: panelCss,
	    })
	    /**
	     * Fired when the component is expanded/collapsed by user interaction.
	     * @public
	     */
	    ,
	    Geomap.l("toggle", {
	        bubbles: true,
	    })
	], Panel);
	Panel.define();
	var Panel$1 = Panel;

	/**
	 * Different types of Title level.
	 * @public
	 */
	var TitleLevel;
	(function (TitleLevel) {
	    /**
	     * Renders `h1` tag.
	     * @public
	     */
	    TitleLevel["H1"] = "H1";
	    /**
	     * Renders `h2` tag.
	     * @public
	     */
	    TitleLevel["H2"] = "H2";
	    /**
	     * Renders `h3` tag.
	     * @public
	     */
	    TitleLevel["H3"] = "H3";
	    /**
	     * Renders `h4` tag.
	     * @public
	     */
	    TitleLevel["H4"] = "H4";
	    /**
	     * Renders `h5` tag.
	     * @public
	     */
	    TitleLevel["H5"] = "H5";
	    /**
	     * Renders `h6` tag.
	     * @public
	     */
	    TitleLevel["H6"] = "H6";
	})(TitleLevel || (TitleLevel = {}));
	var TitleLevel$1 = TitleLevel;

	function TitleTemplate() {
	    return (Geomap.jsx(Geomap.Fragment, { children: title.call(this, this.level) }));
	}
	function title(titleLevel) {
	    switch (titleLevel) {
	        case "H1":
	            return (Geomap.jsx("h1", { class: "ui5-title-root", children: titleInner.call(this) }));
	        case "H2":
	            return (Geomap.jsx("h2", { class: "ui5-title-root", children: titleInner.call(this) }));
	        case "H3":
	            return (Geomap.jsx("h3", { class: "ui5-title-root", children: titleInner.call(this) }));
	        case "H4":
	            return (Geomap.jsx("h4", { class: "ui5-title-root", children: titleInner.call(this) }));
	        case "H5":
	            return (Geomap.jsx("h5", { class: "ui5-title-root", children: titleInner.call(this) }));
	        case "H6":
	            return (Geomap.jsx("h6", { id: `${this._id}-inner`, class: "ui5-title-root", children: titleInner.call(this) }));
	        default:
	            return (Geomap.jsx("h2", { class: "ui5-title-root", children: titleInner.call(this) }));
	    }
	}
	function titleInner() {
	    return (Geomap.jsx("span", { id: `${this._id}-inner`, children: Geomap.jsx("slot", {}) }));
	}

	webcomponentsBase.f("@" + "ui5" + "/" + "webcomponents-theming", "sap_horizon", async () => Geomap.defaultThemeBase);
	webcomponentsBase.f("@" + "u" + "i" + "5" + "/" + "w" + "e" + "b" + "c" + "o" + "m" + "p" + "o" + "n" + "e" + "n" + "t" + "s", "sap_horizon", async () => Icon.defaultTheme, "host");
	var titleCss = `:host(:not([hidden])){display:block;cursor:text}:host{max-width:100%;color:var(--sapGroup_TitleTextColor);font-size:var(--sapFontHeader5Size);font-family:var(--sapFontHeaderFamily);text-shadow:var(--sapContent_TextShadow)}.ui5-title-root{display:inline-block;position:relative;font-weight:400;font-size:inherit;box-sizing:border-box;overflow:hidden;text-overflow:ellipsis;max-width:100%;vertical-align:bottom;-webkit-margin-before:0;-webkit-margin-after:0;-webkit-margin-start:0;-webkit-margin-end:0;margin:0;cursor:inherit}:host{white-space:pre-line}:host([wrapping-type="None"]){white-space:nowrap}.ui5-title-root,:host ::slotted(*){white-space:inherit}::slotted(*){font-size:inherit;font-family:inherit;text-shadow:inherit}:host([size="H1"]){font-size:var(--sapFontHeader1Size)}:host([size="H2"]){font-size:var(--sapFontHeader2Size)}:host([size="H3"]){font-size:var(--sapFontHeader3Size)}:host([size="H4"]){font-size:var(--sapFontHeader4Size)}:host([size="H5"]){font-size:var(--sapFontHeader5Size)}:host([size="H6"]){font-size:var(--sapFontHeader6Size)}
`;

	var __decorate$1 = (this && this.__decorate) || function (decorators, target, key, desc) {
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
	 * The `ui5-title` component is used to display titles inside a page.
	 * It is a simple, large-sized text with explicit header/title semantics.
	 *
	 * ### ES6 Module Import
	 *
	 * `import "@ui5/webcomponents/dist/Title.js";`
	 * @constructor
	 * @extends UI5Element
	 * @slot {Node[]} default - Defines the text of the component.
	 * This component supports nesting a `Link` component inside.
	 *
	 * **Note:** Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
	 * @public
	 */
	let Title = class Title extends webcomponentsBase.b {
	    constructor() {
	        super(...arguments);
	        /**
	         * Defines how the text of a component will be displayed when there is not enough space.
	         *
	         * **Note:** for option "Normal" the text will wrap and the words will not be broken based on hyphenation.
	         * @default "Normal"
	         * @public
	         */
	        this.wrappingType = "Normal";
	        /**
	         * Defines the component level.
	         * Available options are: `"H6"` to `"H1"`.
	         * This property does not influence the style of the component.
	         * Use the property `size` for this purpose instead.
	         * @default "H2"
	         * @public
	         */
	        this.level = "H2";
	        /**
	         * Defines the visual appearance of the title.
	         * Available options are: `"H6"` to `"H1"`.
	         * @default "H5"
	         * @public
	         */
	        this.size = "H5";
	    }
	    get h1() {
	        return this.level === TitleLevel$1.H1;
	    }
	    get h2() {
	        return this.level === TitleLevel$1.H2;
	    }
	    get h3() {
	        return this.level === TitleLevel$1.H3;
	    }
	    get h4() {
	        return this.level === TitleLevel$1.H4;
	    }
	    get h5() {
	        return this.level === TitleLevel$1.H5;
	    }
	    get h6() {
	        return this.level === TitleLevel$1.H6;
	    }
	};
	__decorate$1([
	    webcomponentsBase.s()
	], Title.prototype, "wrappingType", void 0);
	__decorate$1([
	    webcomponentsBase.s()
	], Title.prototype, "level", void 0);
	__decorate$1([
	    webcomponentsBase.s()
	], Title.prototype, "size", void 0);
	Title = __decorate$1([
	    webcomponentsBase.m({
	        tag: "ui5-title",
	        renderer: Geomap.y,
	        template: TitleTemplate,
	        styles: titleCss,
	    })
	], Title);
	Title.define();
	var Title$1 = Title;

	const loadIconsBundle = async (collection) => {
	    let iconData;
	    if (collection === "SAP-icons-v5") {
	        iconData = (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-icons-v5" */ 'sap/ui/geomap/thirdparty/_dynamics/SAP-icons'], resolve, reject); })).default;
	    }
	    else {
	        iconData = (await new Promise(function (resolve, reject) { require([/* webpackChunkName: "ui5-webcomponents-sap-icons-v4" */ 'sap/ui/geomap/thirdparty/_dynamics/SAP-icons2'], resolve, reject); })).default;
	    }
	    if (typeof iconData === "string" && iconData.endsWith(".json")) {
	        throw new Error("[icons] Invalid bundling detected - dynamic JSON imports bundled as URLs. Switch to inlining JSON files from the build. Check the \"Assets\" documentation for more information.");
	    }
	    return iconData;
	};
	const registerLoaders = () => {
	    webcomponentsBase.C("SAP-icons-v4", loadIconsBundle);
	    webcomponentsBase.C("SAP-icons-v5", loadIconsBundle);
	};
	registerLoaders();

	function GeomapLegendControlTemplate() {
	    return (Geomap.jsx("div", { class: {
	            "legend-control": true,
	            "legend-control--hidden": this.hidden,
	        }, children: Geomap.jsxs(Panel$1, { collapsed: !this.expanded, onToggle: () => { this.toggle(); }, children: [Geomap.jsx(Title$1, { slot: "header", level: "H5", class: "legend-header-title", children: this.headerTitle }), this.hasItems
	                    ? (Geomap.jsx("div", { class: "legend-list", children: this.items.map((item) => (Geomap.jsxs("div", { class: "legend-item", onClick: () => { this.onItemClick(item); }, children: [item.icon
	                                    ? Geomap.jsx(Icon.Icon, { name: item.icon, class: "legend-icon", style: { color: item.color } })
	                                    : Geomap.jsx("span", { class: "legend-color-swatch", style: { backgroundColor: item.color } }), Geomap.jsx("span", { class: "legend-label", children: item.label })] }, item.id))) }))
	                    : (Geomap.jsx("div", { class: "legend-empty", children: "No legend items" }))] }) }));
	}

	webcomponentsBase.f("@ui5/webcomponents-theming", "sap_horizon", async () => Geomap.defaultThemeBase);
	webcomponentsBase.f("@ui5/webcomponents-geomap", "sap_horizon", async () => Geomap.defaultTheme);
	var GeomapLegendControlCss = `:host{display:block}.legend-control--hidden{display:none}.legend-control{font-family:"72","72full",Arial,Helvetica,sans-serif;font-size:.75rem;min-width:10rem;max-width:20rem;max-height:18.75rem}.legend-control [ui5-panel]::part(content){max-height:18.75rem;overflow-y:auto}.legend-header-title{font-size:.875rem}.legend-list{display:flex;flex-direction:column;padding:.125rem 0}.legend-item{display:flex;align-items:center;gap:.375rem;padding:.1875rem .5rem;cursor:pointer;border-radius:.25rem}.legend-item:hover{background-color:var(--sapList_Hover_Background)}.legend-item:active{background-color:var(--sapList_Active_Background);color:var(--sapList_Active_TextColor)}.legend-icon{flex-shrink:0;width:.875rem;height:.875rem}.legend-color-swatch{display:inline-block;width:.875rem;height:.875rem;border-radius:.125rem;border:.0625rem solid rgba(0,0,0,.15);flex-shrink:0}.legend-label{font-size:.75rem;white-space:nowrap;color:var(--sapTextColor, #32363a)}.legend-empty{padding:.375rem;color:var(--sapNeutralTextColor, #6a6d70);font-style:italic;text-align:center;font-size:.75rem}
`;

	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var GeomapLegendControl_1;
	/**
	 * @class
	 *
	 * ### Overview
	 *
	 * The `ui5-geomap-legend-control` displays a legend on the map with configurable items.
	 * It extends `ui5-geomap-container-control` and provides a pre-built UI for map legends.
	 *
	 * ### Usage
	 *
	 * ```html
	 * <ui5-geomap-legend-control
	 *   slot="mapControls"
	 *   position="BottomRight"
	 *   header-title="Map Legend"
	 *   expanded
	 * ></ui5-geomap-legend-control>
	 * ```
	 *
	 * ### ES6 Module Import
	 *
	 * `import "@ui5/webcomponents-geomap/dist/GeomapLegendControl.js";`
	 *
	 * @constructor
	 * @extends GeomapContainerControl
	 * @experimental
	 * @public
	 */
	let GeomapLegendControl = GeomapLegendControl_1 = class GeomapLegendControl extends GeomapContainerControl {
	    constructor() {
	        super(...arguments);
	        /**
	         * Defines the header title of the legend panel.
	         *
	         * @default "Legend"
	         * @public
	         */
	        this.headerTitle = "Legend";
	        /**
	         * Whether the legend panel is expanded.
	         *
	         * @default false
	         * @public
	         */
	        this.expanded = false;
	        /**
	         * Whether the legend is hidden.
	         *
	         * @default false
	         * @public
	         */
	        this.hidden = false;
	        /**
	         * Whether the legend can be dragged/moved on the map.
	         *
	         * @default false
	         * @public
	         */
	        this.draggable = false;
	        /**
	         * The legend items to display.
	         *
	         * @public
	         */
	        this.items = [];
	        this._dragOffset = { x: 0, y: 0 };
	        this._dragStart = { x: 0, y: 0 };
	        this._isDragging = false;
	        this._hasDragged = false;
	        /** Position relative to the map container's top-left corner (in px). */
	        this._mapRelativePos = null;
	        this._onMouseDown = null;
	        this._onMouseMove = null;
	        this._onMouseUp = null;
	        this._onTouchStart = null;
	        this._onTouchMove = null;
	        this._onTouchEnd = null;
	        this._resizeObserver = null;
	        /** Which horizontal edge the legend is stuck to during resize, or null. */
	        this._stuckEdge = null;
	    }
	    /**
	     * Returns whether the legend has items.
	     */
	    get hasItems() {
	        return this.items.length > 0;
	    }
	    /**
	     * Toggles the expanded state of the legend control and fires a "toggle" event.
	     */
	    toggle() {
	        this.expanded = !this.expanded;
	        this.fireDecoratorEvent("toggle", { expanded: this.expanded });
	    }
	    /**
	     * Handles a click on a legend item and fires the "item-click" event.
	     */
	    onItemClick(item) {
	        this.fireDecoratorEvent("item-click", { item });
	    }
	    /**
	     * Hides the legend.
	     */
	    hide() {
	        this.hidden = true;
	    }
	    /**
	     * Shows the legend.
	     */
	    show() {
	        this.hidden = false;
	    }
	    async onEnterDOM() {
	        await super.onEnterDOM();
	        this._attachDragAndDrop();
	    }
	    onExitDOM() {
	        this._detachDragAndDrop();
	        super.onExitDOM();
	    }
	    handleInvalidation(changeInfo) {
	        super.handleInvalidation(changeInfo);
	        if (changeInfo.type === "property" && changeInfo.name === "draggable") {
	            if (this.draggable) {
	                this._attachDragAndDrop();
	            }
	            else {
	                this._detachDragAndDrop();
	            }
	        }
	    }
	    /**
	     * Returns the legend's container element.
	     */
	    get container() {
	        return this._instance?._container;
	    }
	    _getMapContainer() {
	        return this.map?.getContainer() ?? null;
	    }
	    /** The horizontal edge the legend should snap to based on its initial position. */
	    get _snapEdge() {
	        return this.position.includes("Right") ? "right" : "left";
	    }
	    _handlePointerStart(clientX, clientY, legendEl) {
	        this._isDragging = true;
	        this._hasDragged = false;
	        this._dragStart = { x: clientX, y: clientY };
	        const rect = legendEl.getBoundingClientRect();
	        this._dragOffset = {
	            x: clientX - rect.left,
	            y: clientY - rect.top,
	        };
	    }
	    _handlePointerMove(clientX, clientY, legendEl) {
	        if (!this._isDragging) {
	            return;
	        }
	        if (!this._hasDragged) {
	            const dx = clientX - this._dragStart.x;
	            const dy = clientY - this._dragStart.y;
	            if (Math.abs(dx) < GeomapLegendControl_1.DRAG_THRESHOLD && Math.abs(dy) < GeomapLegendControl_1.DRAG_THRESHOLD) {
	                return;
	            }
	            this._hasDragged = true;
	            const rect = legendEl.getBoundingClientRect();
	            legendEl.style.position = "fixed";
	            legendEl.style.left = `${rect.left}px`;
	            legendEl.style.top = `${rect.top}px`;
	            legendEl.style.zIndex = "1000";
	            legendEl.style.cursor = "grabbing";
	        }
	        const newLeft = clientX - this._dragOffset.x;
	        const newTop = clientY - this._dragOffset.y;
	        legendEl.style.left = `${newLeft}px`;
	        legendEl.style.top = `${newTop}px`;
	        const mapContainer = this._getMapContainer();
	        if (mapContainer) {
	            const mapRect = mapContainer.getBoundingClientRect();
	            this._mapRelativePos = { x: newLeft - mapRect.left, y: newTop - mapRect.top };
	        }
	    }
	    _handlePointerEnd(legendEl) {
	        this._isDragging = false;
	        legendEl.style.cursor = "grab";
	        if (this._hasDragged) {
	            this._clampToMapContainer(legendEl);
	        }
	    }
	    _attachDragAndDrop() {
	        const legendEl = this.container;
	        if (!this.draggable || !legendEl) {
	            return;
	        }
	        legendEl.style.cursor = "grab";
	        // Mouse handlers
	        this._onMouseDown = (e) => {
	            e.preventDefault();
	            e.stopPropagation();
	            this._handlePointerStart(e.clientX, e.clientY, legendEl);
	            document.addEventListener("mousemove", this._onMouseMove);
	            document.addEventListener("mouseup", this._onMouseUp);
	        };
	        this._onMouseMove = (e) => {
	            this._handlePointerMove(e.clientX, e.clientY, legendEl);
	        };
	        this._onMouseUp = () => {
	            this._handlePointerEnd(legendEl);
	            document.removeEventListener("mousemove", this._onMouseMove);
	            document.removeEventListener("mouseup", this._onMouseUp);
	        };
	        // Touch handlers
	        this._onTouchStart = (e) => {
	            if (e.touches.length !== 1) {
	                return;
	            }
	            const touch = e.touches[0];
	            this._handlePointerStart(touch.clientX, touch.clientY, legendEl);
	            document.addEventListener("touchmove", this._onTouchMove, { passive: false });
	            document.addEventListener("touchend", this._onTouchEnd);
	        };
	        this._onTouchMove = (e) => {
	            if (e.touches.length !== 1) {
	                return;
	            }
	            const touch = e.touches[0];
	            if (this._hasDragged) {
	                e.preventDefault();
	            }
	            this._handlePointerMove(touch.clientX, touch.clientY, legendEl);
	            if (this._hasDragged) {
	                e.preventDefault();
	            }
	        };
	        this._onTouchEnd = () => {
	            document.removeEventListener("touchmove", this._onTouchMove);
	            document.removeEventListener("touchend", this._onTouchEnd);
	            if (this._hasDragged) {
	                this._handlePointerEnd(legendEl);
	            }
	            else {
	                this._isDragging = false;
	            }
	        };
	        legendEl.addEventListener("mousedown", this._onMouseDown);
	        legendEl.addEventListener("touchstart", this._onTouchStart, { passive: false });
	        const mapContainer = this._getMapContainer();
	        if (mapContainer) {
	            this._resizeObserver = new ResizeObserver(() => {
	                if (this._hasDragged && !this._isDragging) {
	                    this._clampToMapContainer(legendEl, true);
	                }
	            });
	            this._resizeObserver.observe(mapContainer);
	        }
	    }
	    /**
	     * Clamps the legend so it stays fully inside the map container.
	     * During resize (`isResize = true`), the Y coordinate is preserved
	     * and the legend sticks to its snap edge (left or right, based on
	     * the initial `position`) once a collision is detected.
	     */
	    _clampToMapContainer(legendEl, isResize = false) {
	        const mapContainer = this._getMapContainer();
	        if (!mapContainer) {
	            return;
	        }
	        const mapRect = mapContainer.getBoundingClientRect();
	        const elRect = legendEl.getBoundingClientRect();
	        let left;
	        let top;
	        if (isResize && this._stuckEdge === "right") {
	            left = mapRect.right - elRect.width;
	            top = this._mapRelativePos ? mapRect.top + this._mapRelativePos.y : elRect.top;
	        }
	        else if (isResize && this._stuckEdge === "left") {
	            left = mapRect.left;
	            top = this._mapRelativePos ? mapRect.top + this._mapRelativePos.y : elRect.top;
	        }
	        else if (this._mapRelativePos) {
	            left = mapRect.left + this._mapRelativePos.x;
	            top = mapRect.top + this._mapRelativePos.y;
	        }
	        else {
	            left = elRect.left;
	            top = elRect.top;
	        }
	        const clampedLeft = Math.max(mapRect.left, Math.min(left, mapRect.right - elRect.width));
	        const clampedTop = Math.max(mapRect.top, Math.min(top, mapRect.bottom - elRect.height));
	        legendEl.style.left = `${clampedLeft}px`;
	        legendEl.style.top = `${clampedTop}px`;
	        if (isResize) {
	            // Detect collision: clamping shifted the legend toward its snap edge
	            if (clampedLeft !== left) {
	                this._stuckEdge = this._snapEdge;
	            }
	            if (this._mapRelativePos) {
	                this._mapRelativePos = { x: clampedLeft - mapRect.left, y: this._mapRelativePos.y };
	            }
	        }
	        else {
	            this._stuckEdge = null;
	            this._mapRelativePos = { x: clampedLeft - mapRect.left, y: clampedTop - mapRect.top };
	        }
	    }
	    _detachDragAndDrop() {
	        const legendEl = this.container;
	        if (!legendEl) {
	            return;
	        }
	        legendEl.style.cursor = "";
	        if (this._onMouseDown) {
	            legendEl.removeEventListener("mousedown", this._onMouseDown);
	        }
	        if (this._onMouseMove) {
	            document.removeEventListener("mousemove", this._onMouseMove);
	        }
	        if (this._onMouseUp) {
	            document.removeEventListener("mouseup", this._onMouseUp);
	        }
	        if (this._onTouchStart) {
	            legendEl.removeEventListener("touchstart", this._onTouchStart);
	        }
	        if (this._onTouchMove) {
	            document.removeEventListener("touchmove", this._onTouchMove);
	        }
	        if (this._onTouchEnd) {
	            document.removeEventListener("touchend", this._onTouchEnd);
	        }
	        this._onMouseDown = null;
	        this._onMouseMove = null;
	        this._onMouseUp = null;
	        this._onTouchStart = null;
	        this._onTouchMove = null;
	        this._onTouchEnd = null;
	        if (this._resizeObserver) {
	            this._resizeObserver.disconnect();
	            this._resizeObserver = null;
	        }
	    }
	};
	GeomapLegendControl.DRAG_THRESHOLD = 5;
	__decorate([
	    webcomponentsBase.s()
	], GeomapLegendControl.prototype, "headerTitle", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], GeomapLegendControl.prototype, "expanded", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], GeomapLegendControl.prototype, "hidden", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Boolean })
	], GeomapLegendControl.prototype, "draggable", void 0);
	__decorate([
	    webcomponentsBase.s({ type: Array })
	], GeomapLegendControl.prototype, "items", void 0);
	GeomapLegendControl = GeomapLegendControl_1 = __decorate([
	    webcomponentsBase.m({
	        tag: "ui5-geomap-legend-control",
	        template: GeomapLegendControlTemplate,
	        styles: [GeomapLegendControlCss],
	        renderer: Geomap.y,
	    })
	    /**
	     * Fired when legend is expanded/collapsed.
	     *
	     * @public
	     */
	    ,
	    Geomap.l("toggle")
	    /**
	     * Fired when a legend item is clicked.
	     *
	     * @public
	     */
	    ,
	    Geomap.l("item-click")
	], GeomapLegendControl);
	GeomapLegendControl.define();
	var GeomapLegendControl_default = GeomapLegendControl;

	return GeomapLegendControl_default;

}));
