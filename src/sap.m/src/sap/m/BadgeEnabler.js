/*!
 * ${copyright}
 */

// Provides helper sap.m.BadgeEnabler
sap.ui.define([
		'sap/m/BadgeCustomData',
		'sap/m/library',
		'sap/ui/thirdparty/jquery'
	],
	function(BadgeCustomData, library, jQuery) {
		"use strict";

		var IBADGE_CSS_CLASS = "sapMBadge";

		var IBADGE_POSITION_CLASSES = {
			topLeft: "sapMBadgeTopLeft",

			topRight: "sapMBadgeTopRight",

			inline: "sapMBadgeInline"
		};

		var IBADGE_STATE = library.BadgeState;

		var IBADGE_STYLE = library.BadgeStyle;

		var IBADGE_INVALID_VALUES = ["", "undefined", "null", false];

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
		 * @alias sap.m.BadgeEnabler
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

				if (!this.getBadgeCustomData() || !this.getBadgeCustomData().getVisible()) {
					return false;
				}

				_createBadgeDom.call(this);

				if (!Object.keys(this._oBadgeConfig).length) {
					return this;
				}

				return this;
			}

			//removing badge DOM element
			function _removeBadgeDom() {
				var oBadgeElement = _getBadgeElement.call(this);

				oBadgeElement.removeClass("sapMBadgeAnimationUpdate");
				oBadgeElement.removeClass("sapMBadgeAnimationAdd");
				oBadgeElement.width();
				oBadgeElement.addClass("sapMBadgeAnimationRemove");
				oBadgeElement.on("animationend", function () {
					oBadgeElement.css("display","none");
					oBadgeElement.off();
				});
				oBadgeElement.removeAttr("aria-label");

				this._isBadgeAttached = false;
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
					fnBadgeValueFormatter =  typeof this.badgeValueFormatter === "function" && this.badgeValueFormatter,
					sValue = isValidValue(fnBadgeValueFormatter ? fnBadgeValueFormatter.call(this, this.getBadgeCustomData().getValue())
						: this.getBadgeCustomData().getValue()) || "",

					sStyle = this._oBadgeConfig.style ? this._oBadgeConfig.style : IBADGE_STYLE.Default,
					sAnimationType = this.getBadgeCustomData().getAnimation();
				this._oBadgeContainer = this._oBadgeConfig && this._oBadgeConfig.selector ?
					_getContainerDomElement(this._oBadgeConfig.selector, this) :
					this.$();
				if (oBadgeElement.length) {
					oBadgeElement.remove();
				}

				_oNode = jQuery('<div></div>').addClass(IBADGE_CSS_CLASS + "Indicator");

				_oNode.addClass(IBADGE_CSS_CLASS + sStyle);

				_oNode.attr("id", sBadgeId);
				_oNode.attr("data-badge", sValue);
				_oNode.attr("aria-label", getAriaLabelText.call(this));
				_oNode.appendTo(this._oBadgeContainer);
				_oNode.addClass("sapMBadgeAnimationAdd");

				this._isBadgeAttached = true;
				this._oBadgeContainer.addClass(IBADGE_CSS_CLASS);

				if (this._oBadgeConfig.position) {
					this._oBadgeContainer.addClass(IBADGE_POSITION_CLASSES[this._oBadgeConfig.position]);
				}

				if (this._oBadgeConfig.accentColor) {
					this._oBadgeContainer.addClass(IBADGE_CSS_CLASS + this._oBadgeConfig.accentColor);
				}

				this._oBadgeContainer.addClass(this.getBadgeAnimationClass(this.getBadgeCustomData().getAnimation()));
				this._badgeAnimaionType = sAnimationType;

				callHandler.call(this, sValue, IBADGE_STATE["Appear"]);
			}

			//Manually updating the 'span', containing badge

			this.updateBadgeValue = function (sValue) {
				var fnBadgeValueFormatter =  typeof this.badgeValueFormatter === "function" && this.badgeValueFormatter,
					oBadgeElement;

				sValue = isValidValue((fnBadgeValueFormatter ? fnBadgeValueFormatter.call(this, sValue) : sValue))
					|| "";

				if (!this.getBadgeCustomData().getVisible()) { return false; }
				oBadgeElement = _getBadgeElement.call(this);
				oBadgeElement.removeClass("sapMBadgeAnimationUpdate");
				oBadgeElement.attr("data-badge", sValue);
				oBadgeElement.attr("aria-label", getAriaLabelText.call(this));
				oBadgeElement.width();
				oBadgeElement.addClass("sapMBadgeAnimationUpdate");

				callHandler.call(this, sValue, IBADGE_STATE["Updated"]);
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
				return IBADGE_INVALID_VALUES.indexOf(sValue) === -1 && sValue;
			}

			// Override for the initial 1..n aggregation method for adding new one,
			//to make it 1:1
			this.addCustomData = function (oCustomData) {
				if (oCustomData.isA("sap.m.BadgeCustomData")) {

					this.removeAggregation("customData", this._oBadgeCustomData, true);
					this._oBadgeCustomData = oCustomData;


					this.addAggregation("customData", oCustomData, true);
					return this.updateBadgeVisibility(oCustomData.getVisible());
				}

				return this.addAggregation("customData", oCustomData);
			};

			// Override for the initial 1..n aggregation method for inserting new one,
			//to make it 1:1
			this.insertCustomData = function (oCustomData) {
				if (oCustomData.isA("sap.m.BadgeCustomData")) {

					this.removeAggregation("customData", this._oBadgeCustomData, true);
					this._oBadgeCustomData = oCustomData;


					this.addAggregation("customData", oCustomData, true);
					return this.updateBadgeVisibility(oCustomData.getVisible());
				}

				return this.insertAggregation("customData", oCustomData);
			};

			this.getBadgeCustomData = function () {
				var oBadgeCustomData = this.getCustomData().filter(function(item) {return item instanceof BadgeCustomData;});
				return oBadgeCustomData.length ? oBadgeCustomData[0] : undefined;
			};

			this.getBadgeAnimationClass = function (sAnimationType) {
				return IBADGE_CSS_CLASS + "AnimationType" + sAnimationType;
			};

			this.removeBadgeCustomData = function () {
				var oBadgeCustomData;
				oBadgeCustomData = this._oBadgeCustomData;
				this._oBadgeCustomData = null;
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

			this.updateBadgeVisibility = function (bVisible) {
				return bVisible ? _createBadgeDom.call(this) : _removeBadgeDom.call(this);
			};

			this._renderBadge = function () {
				_renderBadgeDom.call(this);
			};

			this.updateBadgeAnimation = function (sAnimationType) {

				if (this._oBadgeContainer) {
					this._badgeAnimaionType && this._oBadgeContainer.removeClass(this.getBadgeAnimationClass(this._badgeAnimaionType));
					this._oBadgeContainer.addClass(this.getBadgeAnimationClass(sAnimationType));
				}

				this._badgeAnimaionType = sAnimationType;
			};
		};
	return BadgeEnabler;
});
