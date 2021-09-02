sap.ui.define(['sap/ui/webc/common/thirdparty/base/isLegacyBrowser', 'sap/ui/webc/common/thirdparty/base/Keys', './Button', './generated/templates/ToggleButtonTemplate.lit', './generated/themes/ToggleButton.css', './generated/themes/ToggleButton.ie11.css'], function (isLegacyBrowser, Keys, Button, ToggleButtonTemplate_lit, ToggleButton_css, ToggleButton_ie11_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var isLegacyBrowser__default = /*#__PURE__*/_interopDefaultLegacy(isLegacyBrowser);

	const metadata = {
		tag: "ui5-toggle-button",
		altTag: "ui5-togglebutton",
		properties:  {
			pressed: {
				type: Boolean,
			},
		},
	};
	class ToggleButton extends Button {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return ToggleButtonTemplate_lit;
		}
		static get styles() {
			return [Button.styles, ToggleButton_css, isLegacyBrowser__default() && ToggleButton_ie11_css];
		}
		_onclick() {
			this.pressed = !this.pressed;
		}
		_onkeyup(event) {
			if (Keys.isSpaceShift(event)) {
				event.preventDefault();
				return;
			}
			super._onkeyup(event);
		}
	}
	ToggleButton.define();

	return ToggleButton;

});
