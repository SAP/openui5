sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/renderer/executeTemplate', './types/SemanticColor', './types/TabLayout', './TabContainer', './Icon', './CustomListItem', './generated/templates/TabTemplate.lit', './generated/templates/TabInStripTemplate.lit', './generated/templates/TabInOverflowTemplate.lit', './generated/themes/Tab.css', './generated/themes/TabInStrip.css', './generated/themes/TabInOverflow.css'], function (UI5Element, litRender, executeTemplate, SemanticColor, TabLayout, TabContainer, Icon, CustomListItem, TabTemplate_lit, TabInStripTemplate_lit, TabInOverflowTemplate_lit, Tab_css, TabInStrip_css, TabInOverflow_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var executeTemplate__default = /*#__PURE__*/_interopDefaultLegacy(executeTemplate);

	const metadata = {
		tag: "ui5-tab",
		slots:  {
			"default": {
				type: Node,
			},
		},
		properties:  {
			text: {
				type: String,
			},
			disabled: {
				type: Boolean,
			},
			additionalText: {
				type: String,
			},
			icon: {
				type: String,
			},
			design: {
				type: SemanticColor,
				defaultValue: SemanticColor.Default,
			},
			stableDomRef: {
				type: String,
			},
			selected: {
				type: Boolean,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
				noAttribute: true,
			},
		},
		events:  {
		},
	};
	class Tab extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TabTemplate_lit;
		}
		static get stripTemplate() {
			return TabInStripTemplate_lit;
		}
		static get overflowTemplate() {
			return TabInOverflowTemplate_lit;
		}
		static get styles() {
			return Tab_css;
		}
		static get dependencies() {
			return [
				Icon,
				CustomListItem,
			];
		}
		get isSeparator() {
			return false;
		}
		get stripPresentation() {
			return executeTemplate__default(this.constructor.stripTemplate, this);
		}
		get overflowPresentation() {
			return executeTemplate__default(this.constructor.overflowTemplate, this);
		}
		getFocusDomRef() {
			let focusedDomRef = super.getFocusDomRef();
			if (this._getTabContainerHeaderItemCallback) {
				focusedDomRef = this._getTabContainerHeaderItemCallback();
			}
			return focusedDomRef;
		}
		get isMixedModeTab() {
			return !this.icon && this._mixedMode;
		}
		get isTextOnlyTab() {
			return !this.icon && !this._mixedMode;
		}
		get isIconTab() {
			return !!this.icon;
		}
		get effectiveDisabled() {
			return this.disabled || undefined;
		}
		get effectiveSelected() {
			return this.selected || false;
		}
		get effectiveHidden() {
			return !this.selected;
		}
		get ariaLabelledBy() {
			const labels = [];
			if (this.text) {
				labels.push(`${this._id}-text`);
			}
			if (this.additionalText) {
				labels.push(`${this._id}-additionalText`);
			}
			if (this.icon) {
				labels.push(`${this._id}-icon`);
			}
			return labels.join(" ");
		}
		get headerClasses() {
			const classes = ["ui5-tab-strip-item"];
			if (this.selected) {
				classes.push("ui5-tab-strip-item--selected");
			}
			if (this.disabled) {
				classes.push("ui5-tab-strip-item--disabled");
			}
			if (this.tabLayout === TabLayout.Inline) {
				classes.push("ui5-tab-strip-item--inline");
			}
			if (!this.icon && !this._mixedMode) {
				classes.push("ui5-tab-strip-item--textOnly");
			}
			if (this.icon) {
				classes.push("ui5-tab-strip-item--withIcon");
			}
			if (!this.icon && this._mixedMode) {
				classes.push("ui5-tab-strip-item--mixedMode");
			}
			if (this.design !== SemanticColor.Default) {
				classes.push(`ui5-tab-strip-item--${this.design.toLowerCase()}`);
			}
			return classes.join(" ");
		}
		get headerSemanticIconClasses() {
			const classes = ["ui5-tab-strip-item-semanticIcon"];
			if (this.design !== SemanticColor.Default) {
				classes.push(`ui5-tab-strip-item-semanticIcon--${this.design.toLowerCase()}`);
			}
			return classes.join(" ");
		}
		get overflowClasses() {
			const classes = ["ui5-tab-overflow-item"];
			if (this.design !== SemanticColor.Default) {
				classes.push(`ui5-tab-overflow-item--${this.design.toLowerCase()}`);
			}
			if (this.disabled) {
				classes.push("ui5-tab-overflow-item--disabled");
			}
			return classes.join(" ");
		}
		get overflowState() {
			return this.disabled ? "Inactive" : "Active";
		}
	}
	Tab.define();
	TabContainer.registerTabStyles(TabInStrip_css);
	TabContainer.registerStaticAreaTabStyles(TabInOverflow_css);

	return Tab;

});
