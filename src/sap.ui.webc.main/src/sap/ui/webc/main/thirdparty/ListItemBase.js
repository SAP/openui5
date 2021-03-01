sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/util/TabbableElements', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/themes/ListItemBase.css'], function (litRender, UI5Element, TabbableElements, Keys, ListItemBase_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);

	const metadata = {
		properties:   {
			selected: {
				type: Boolean,
			},
			hasBorder: {
				type: Boolean,
			},
			_tabIndex: {
				type: String,
				defaultValue: "-1",
				noAttribute: true,
			},
			disabled: {
				type: Boolean,
			},
			focused: {
				type: Boolean,
			},
		},
		events:   {
			_focused: {},
			"_forward-after": {},
			"_forward-before": {},
		},
	};
	class ListItemBase extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return ListItemBase_css;
		}
		_onfocusin(event) {
			if (event.isMarked === "button" || event.isMarked === "link") {
				return;
			}
			this.focused = true;
			this.fireEvent("_focused", event);
		}
		_onfocusout(_event) {
			this.focused = false;
		}
		_onkeydown(event) {
			if (Keys.isTabNext(event)) {
				return this._handleTabNext(event);
			}
			if (Keys.isTabPrevious(event)) {
				return this._handleTabPrevious(event);
			}
		}
		_onkeyup() {}
		_handleTabNext(event) {
			const target = event.target;
			if (this.shouldForwardTabAfter(target)) {
				this.fireEvent("_forward-after", { item: target });
			}
		}
		_handleTabPrevious(event) {
			const target = event.target;
			if (this.shouldForwardTabBefore(target)) {
				const eventData = event;
				eventData.item = target;
				this.fireEvent("_forward-before", eventData);
			}
		}
		shouldForwardTabAfter(target) {
			const aContent = TabbableElements.getTabbableElements(this.getDomRef());
			if (target.getFocusDomRef) {
				target = target.getFocusDomRef();
			}
			return !aContent.length || (aContent[aContent.length - 1] === target);
		}
		shouldForwardTabBefore(target) {
			return this.getDomRef() === target;
		}
		get classes() {
			return {
				main: {
					"ui5-li-root": true,
					"ui5-li--focusable": !this.disabled,
				},
			};
		}
		get ariaDisabled() {
			return this.disabled ? "true" : undefined;
		}
		get tabIndex() {
			if (this.disabled) {
				return -1;
			}
			if (this.selected) {
				return 0;
			}
			return this._tabIndex;
		}
	}

	return ListItemBase;

});
