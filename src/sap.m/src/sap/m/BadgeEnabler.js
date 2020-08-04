/*!
 * ${copyright}
 */

// Provides helper sap.m.BadgeEnabler
sap.ui.define([
		'sap/m/BadgeCustomData',
		'sap/base/Log',
		'sap/m/library'
	],
	function(BadgeCustomData, Log, library) {
		"use strict";

		var IBADGE_CSS_CLASS = "sapMBadge";

		var IBADGE_POSITION_CLASSES = {
			topLeft: "sapMBadgeTopLeft",

			topRight: "sapMBadgeTopRight",

			inline: "sapMBadgeInline"
		};

		var IBADGE_STATE = library.BadgeState;

		/**
		 * @class A helper class for implementing the {@link sap.m.IBadge} interface.
		 *
		 * The class represents a utility for visualising and updating the <code>badge</code> indicator for
		 * <code>sap.ui.core.Control</code> instances. It should be created once per <code>IBadge</code> instance.
		 *
		 * On its initialization, <codeBadgeEnabler</code> can accept a settings object.
		 * The settings object contains the following properties:
		 *
		 * <ul>
		 * <li><code>position</code> - accepts three predefined string values which
		 * add relative CSS classes to the badge element and position it accordingly:
		 * <code>topLeft</code>, <code>topRight</code> and <code>inline</code></li>
		 *
		 * <li><code>accentColor</code> - accepts string values equal to theme-specific accent colors.
		 * For more information, see the
		 * {@link https://experience.sap.com/fiori-design-web/quartz-light-colors/#accent-colors
		 * SAP Fiori Design Guidelines}.</li>
		 *
		 * <li><code>selector</code> - accepts Object, containing one property which is named either
		 * <code>selector</code> or <code>suffix</code>. If no selector is passed, the main ID of the
		 * control is automatically set as selector value.</li>
		 * </ul>
		 *
		 * @since 1.80
		 * @protected
		 * @alias sap.m.IBadgeEnabler
		 */
		var BadgeEnabler = function () {

			// Attaching configuration and eventDelegate
			this.initBadgeEnablement = function (oConfig, customControl) {
				var oDelegator = customControl ? customControl : this;
				this._oBadgeConfig = oConfig || {};
				oDelegator.addEventDelegate({
					onAfterRendering: _renderBadgeDom
				}, this);
			};

			//Selects specific DOM element, for the badge to be applied in
			function _getContainerDomElement(oContainerSelector, oControl) {
				if (oContainerSelector.suffix) {
					return oControl.$(oContainerSelector.suffix);
				}
				if (oContainerSelector.selector) {
					return oControl.$().find(oContainerSelector.selector).first();
				}
			}

			//Adding badge DOM element
			function _renderBadgeDom() {

				this._isBadgeAttached = false;

				if (!this.getBadgeCustomData() || !isValidValue(this.getBadgeCustomData().getValue())) {
					return false;
				}

				_createBadgeDom.call(this);

				if (!Object.keys(this._oBadgeConfig).length) {
					return this;
				}

				if (this._oBadgeConfig.position) {
					this._oBadgeContainer.addClass(IBADGE_POSITION_CLASSES[this._oBadgeConfig.position]);
				}

				if (this._oBadgeConfig.accentColor) {
					this._oBadgeContainer.addClass(IBADGE_CSS_CLASS + this._oBadgeConfig.accentColor);
				}

				return this;
			}

			//removing badge DOM element
			function _removeBadgeDom() {
				var oBadgeElement = _getBadgeElement.call(this);

				this._isBadgeAttached = false;

				oBadgeElement.removeClass("sapMBadgeAnimationAdd");
				oBadgeElement.width();
				oBadgeElement.addClass("sapMBadgeAnimationRemove");
				oBadgeElement.attr("data-badge", "");

				callHandler.call(this, "", IBADGE_STATE["Disappear"]);

				return this;
			}


			//returns the badge DOM Element
			function _getBadgeElement() {
				return this.$(IBADGE_CSS_CLASS);
			}

			//returns the badge DOM Element ID
			function _getBadgeId() {
				return this.getId() + "-" + IBADGE_CSS_CLASS;
			}

			//removing badge DOM element
			function _createBadgeDom() {
				var _oNode,
					sBadgeId = _getBadgeId.call(this),
					oBadgeElement = _getBadgeElement.call(this),
					sValue = this._oBadgeCustomData.getValue();
				this._oBadgeContainer = this._oBadgeConfig && this._oBadgeConfig.selector ?
					_getContainerDomElement(this._oBadgeConfig.selector, this) :
					this.$();
				if (oBadgeElement.length) {
					oBadgeElement.remove();
				}

				_oNode = jQuery('<div></div>').addClass(IBADGE_CSS_CLASS + "Indicator");
				_oNode.attr("id", sBadgeId);
				_oNode.attr("data-badge", sValue);
				_oNode.attr("aria-label", getAriaLabelText.call(this));
				_oNode.appendTo(this._oBadgeContainer);
				_oNode.addClass("sapMBadgeAnimationAdd");

				this._isBadgeAttached = true;
				this._oBadgeContainer.addClass(IBADGE_CSS_CLASS);

				callHandler.call(this, sValue, IBADGE_STATE["Appear"]);
			}

			//Manually updating the 'span', containing badge
			this.updateBadge = function (sValue) {
				var oBadgeElement = _getBadgeElement.call(this);
				oBadgeElement.removeClass("sapMBadgeAnimationUpdate");
				if (isValidValue(sValue)) {
					if (this._isBadgeAttached) {
						oBadgeElement.attr("data-badge", sValue);
						oBadgeElement.attr("aria-label", getAriaLabelText.call(this));
						oBadgeElement.width();
						oBadgeElement.addClass("sapMBadgeAnimationUpdate");

						callHandler.call(this, sValue, IBADGE_STATE["Updated"]);
					} else if (this.getDomRef()) {
						_createBadgeDom.call(this);
					}
				} else if (this._isBadgeAttached) {
					_removeBadgeDom.call(this);
				}
			};

			function getAriaLabelText() {
				var sAriaLabelGetter = this.getAriaLabelBadgeText;

				return sAriaLabelGetter && typeof sAriaLabelGetter === "function" && sAriaLabelGetter.call(this);
			}

			function callHandler(value, state) {
				if (this.onBadgeUpdate && typeof this.onBadgeUpdate === "function") {
					var sBadgeId = _getBadgeId.call(this);
					return this.onBadgeUpdate(value, state, sBadgeId);
				}
			}

			//Validating the input for the badge
			function isValidValue (sValue) {
				return sValue !== undefined && sValue !== "undefined" && sValue !== "";
			}

			// Override for the initial 1..n aggregation method for adding new one,
			//to make it 1:1
			this.addCustomData = function (oCustomData) {
				if (oCustomData.isA("sap.m.BadgeCustomData")) {

					this.removeAggregation("customData", this._oBadgeCustomData, true);
					this._oBadgeCustomData = oCustomData;


					this.addAggregation("customData", oCustomData, true);
					return this.updateBadge(oCustomData.getValue());
				}

				return this.addAggregation("customData", oCustomData);
			};

			// Override for the initial 1..n aggregation method for inserting new one,
			//to make it 1:1
			this.insertCustomData = function (oCustomData) {
				if (oCustomData.isA("sap.m.BadgeCustomData")) {

					this.updateBadge(oCustomData.getValue());
					this.removeAggregation("customData", this._oBadgeCustomData, true);
					this._oBadgeCustomData = oCustomData;

					return this.addAggregation("customData", oCustomData, true);
				}

				return this.insertAggregation("customData", oCustomData);
			};

			this.getBadgeCustomData = function () {
				var oBadgeCustomData = this.getCustomData().filter(function(item) {return item instanceof BadgeCustomData;});
				return oBadgeCustomData.length ? oBadgeCustomData[0] : undefined;
			};

			this.removeBadgeCustomData = function () {
				var oBadgeCustomData;
				oBadgeCustomData = this._oBadgeCustomData;
				this._oBadgeCustomData = null;
				this.updateBadge("");
				return this.removeAggregation("customData", oBadgeCustomData, true);
			};

			this.setBadgeAccentColor = function (sValue) {
				if (!this._oBadgeContainer) { return false; }

				this._oBadgeContainer.removeClass(IBADGE_CSS_CLASS + this._oBadgeConfig.accentColor);

				this._oBadgeContainer.addClass(IBADGE_CSS_CLASS + sValue);
				this._oBadgeConfig.accentColor = sValue;
			};

			this.setBadgePosition = function (sValue) {
				if (!this._oBadgeContainer) { return false; }

				this._oBadgeContainer.removeClass(IBADGE_CSS_CLASS + this._oBadgeConfig.position);

				this._oBadgeContainer.addClass(IBADGE_POSITION_CLASSES[sValue]);
				this._oBadgeConfig.position = sValue;
			};
		};
	return BadgeEnabler;
});
