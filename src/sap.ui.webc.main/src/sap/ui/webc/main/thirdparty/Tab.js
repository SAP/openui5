sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/renderer/executeTemplate', 'sap/ui/webc/common/thirdparty/icons/error', 'sap/ui/webc/common/thirdparty/icons/alert', 'sap/ui/webc/common/thirdparty/icons/sys-enter-2', './types/SemanticColor', './types/ListItemType', './TabContainer', './Icon', './Button', './CustomListItem', './generated/templates/TabTemplate.lit', './generated/templates/TabInStripTemplate.lit', './generated/templates/TabInOverflowTemplate.lit', './generated/themes/Tab.css', './generated/themes/TabInStrip.css', './generated/themes/TabInOverflow.css'], function (UI5Element, litRender, executeTemplate, error, alert, sysEnter2, SemanticColor, ListItemType, TabContainer, Icon, Button, CustomListItem, TabTemplate_lit, TabInStripTemplate_lit, TabInOverflowTemplate_lit, Tab_css, TabInStrip_css, TabInOverflow_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var executeTemplate__default = /*#__PURE__*/_interopDefaultLegacy(executeTemplate);

	const metadata = {
		tag: "ui5-tab",
		managedSlots: true,
		languageAware: true,
		slots:  {
			"default": {
				type: Node,
				propertyName: "content",
				invalidateOnChildChange: {
					properties: true,
					slots: false,
				},
			},
			subTabs: {
				type: HTMLElement,
				individualSlots: true,
				invalidateOnChildChange: {
					properties: true,
					slots: false,
				},
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
			selected: {
				type: Boolean,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
				noAttribute: true,
			},
			_selected: {
				type: Boolean,
			},
			_realTab: {
				type: Object,
			},
			_isTopLevelTab: {
				type: Boolean,
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
				Button,
				CustomListItem,
			];
		}
		get displayText() {
			let text = this.text;
			if (this._isInline && this.additionalText) {
				text += ` (${this.additionalText})`;
			}
			return text;
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
		get stableDomRef() {
			return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
		}
		get requiresExpandButton() {
			return this.subTabs.length > 0 && this._isTopLevelTab && this._hasOwnContent;
		}
		get isSingleClickArea() {
			return this.subTabs.length > 0 && this._isTopLevelTab && !this._hasOwnContent;
		}
		get isOnSelectedTabPath() {
			return this._realTab === this || this.tabs.some(subTab => subTab.isOnSelectedTabPath);
		}
		get _effectiveSlotName() {
			return this.isOnSelectedTabPath ? this._individualSlot : "disabled-slot";
		}
		get _defaultSlotName() {
			return this._realTab === this ? "" : "disabled-slot";
		}
		get _hasOwnContent() {
			return this.content.some(node => (node.nodeType !== Node.COMMENT_NODE
					&& (node.nodeType !== Node.TEXT_NODE || node.nodeValue.trim().length !== 0)));
		}
		getTabInStripDomRef() {
			return this._tabInStripDomRef;
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
			const subItemSelected = this.tabs.some(elem => elem.effectiveSelected);
			return this.selected || this._selected || subItemSelected;
		}
		get effectiveHidden() {
			return !this.effectiveSelected;
		}
		get tabs() {
			return this.subTabs.filter(tab => !tab.isSeparator);
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
		get stripClasses() {
			const classes = ["ui5-tab-strip-item"];
			if (this.effectiveSelected) {
				classes.push("ui5-tab-strip-item--selected");
			}
			if (this.disabled) {
				classes.push("ui5-tab-strip-item--disabled");
			}
			if (this._isInline) {
				classes.push("ui5-tab-strip-item--inline");
			}
			if (this.additionalText) {
				classes.push("ui5-tab-strip-item--withAddionalText");
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
			if (this.isSingleClickArea) {
				classes.push(`ui5-tab-strip-item--singleClickArea`);
			}
			return classes.join(" ");
		}
		get semanticIconName() {
			switch (this.design) {
			case SemanticColor.Positive:
				return "sys-enter-2";
			case SemanticColor.Negative:
				return "error";
			case SemanticColor.Critical:
				return "alert";
			default:
				return null;
			}
		}
		get semanticIconClasses() {
			const classes = ["ui5-tab-semantic-icon"];
			if (this.design !== SemanticColor.Default && this.design !== SemanticColor.Neutral) {
				classes.push(`ui5-tab-semantic-icon--${this.design.toLowerCase()}`);
			}
			return classes.join(" ");
		}
		get overflowClasses() {
			const classes = ["ui5-tab-overflow-item"];
			if (this.design !== SemanticColor.Default && this.design !== SemanticColor.Neutral) {
				classes.push(`ui5-tab-overflow-item--${this.design.toLowerCase()}`);
			}
			if (this.disabled) {
				classes.push("ui5-tab-overflow-item--disabled");
			}
			if (this.selected) {
				classes.push("ui5-tab-overflow-item--selectedSubTab");
			}
			return classes.join(" ");
		}
		get overflowState() {
			return (this.disabled || this.isSingleClickArea) ? ListItemType.Inactive : ListItemType.Active;
		}
	}
	Tab.define();
	TabContainer.registerTabStyles(TabInStrip_css);
	TabContainer.registerStaticAreaTabStyles(TabInOverflow_css);

	return Tab;

});
