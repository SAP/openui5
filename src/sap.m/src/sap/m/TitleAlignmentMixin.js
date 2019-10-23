/*!
 * ${copyright}
 */

/*
 * Title Alignment Mixin
 * Provides functionality for changing of the Title Alignment for the controls with header based on sap.m.Bar.
 * The alignment can be theme specific or default. The default alignment is 'center'.
 * Controls which want to have such functionality must have titleAlignment property set to
 * library.TitleAlignment.Start, library.TitleAlignment.Center or library.TitleAlignment.Auto
 * Auto value tries to retreive a value stored in the theme, and if there is such defined, use it;
 * otherwise the default 'center' alignment is used instead.
 * In order to use Title Alignment functionality, the developer also must "register" the corresponding sap.m.Bar(s)
 * with _setupBarTitleAlignment(oBar) method after the creation of the Bar instance.
*/


sap.ui.define([
	'sap/ui/core/theming/Parameters',
	'sap/m/library'
],
function(
	Parameters,
	library
) {
	"use strict";

	var TitleAlignmentMixin = {};
	var TitleAlignment = library.TitleAlignment;

	/**
	 * Registers a <code>sap.m.Bar</code> for Title alignment feature
	 *
	 * @param {sap.m.Bar} oBar The control's Bar to align
	 * @param {string} sKey key of the Bar
	 * @private
	 */
	var _setupBarTitleAlignment = function (oBar, sKey) {
		// add bar instance to the list
		this._oTitleAlignmentBarInstances[sKey] = oBar;
		this._determineTitleAlignment(oBar);
	};

	/**
	 * Catches the theme change event and (re)align the registered controls
	 *
	 * @private
	 */
	var _titleAlignmentThemeChangedHandler = function () {
		this._determineTitleAlignment();
	};

	/**
	 * Attaches theme change event to the control
	 *
	 * @private
	 */
	var _attachTitleAlignmentEventDelegate = function () {
		this._titleAlignmentThemeChangedDelegate = {onThemeChanged : this._titleAlignmentThemeChangedHandler};
		this.addEventDelegate(this._titleAlignmentThemeChangedDelegate, this);
	};

	/**
	 * Detaches theme change event
	 *
	 * @private
	 */
	var _detachTitleAlignmentEventDelegate = function () {
		this.removeEventDelegate(this._titleAlignmentThemeChangedDelegate);
	};

	/**
	 * Determines what alignment to apply to the title, based on control and theme settings
	 * If an instance of sap.m.Bar is passes as argument, the alignment is applied only to it
	 * Otherwise all registered instances will get the alignment
	 *
	 * @param {sap.m.Bar} oBar title alignment
	 * @private
	 */
	var _determineTitleAlignment = function (oBar) {
		var sThemeAlignment = Parameters.get("sapMTitleAlignment");
		var sControlAlignment = this.getTitleAlignment();

		// determine the resulting alignment and remove/add corresponding class to the header control
		if (sControlAlignment === TitleAlignment.Auto) {
			sControlAlignment = sThemeAlignment === undefined ? TitleAlignment.Center : sThemeAlignment;
		}
		// do bar alignment
		if (oBar === undefined) { // no Bar passes as argument, align all Bars "registered" for alignment
			for (var k in this._oTitleAlignmentBarInstances) {
				_setBarClass(this._oTitleAlignmentBarInstances[k]);
			}
		} else { // align only passed Bar (initial setup)
			_setBarClass(oBar);
		}

		/* Internal helper function */
		function _setBarClass(oBar) {
			// first removes and then adds alignment class (if needed)
			oBar.removeStyleClass("sapMBarTitleStart");
			if (sControlAlignment === TitleAlignment.Start) {
				oBar.addStyleClass("sapMBarTitleStart");
			}
		}
	};

	/**
	 * Sets <code>titleAlignment</code> of the control
	 *
	 * @param {sap.m.TitleAlignment} oAlignment title alignment
	 * @return Reference to the control instance for chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	var setTitleAlignment = function (oAlignment) {
		this.setProperty("titleAlignment", oAlignment, true);
		this._determineTitleAlignment();
		for (var k in this._oTitleAlignmentBarInstances) {
			this._oTitleAlignmentBarInstances[k].invalidate();
		}

		return this;
	};

	/**
	 * Extends the control with ability to align its title.
	 *
	 * @param oControlPrototype The control prototype to extend
	 * @private
	 */
	TitleAlignmentMixin.mixInto = function (oControlPrototype) {
		oControlPrototype._setupBarTitleAlignment = _setupBarTitleAlignment;
		oControlPrototype._titleAlignmentThemeChangedHandler = _titleAlignmentThemeChangedHandler;
		oControlPrototype._attachTitleAlignmentEventDelegate = _attachTitleAlignmentEventDelegate;
		oControlPrototype._detachTitleAlignmentEventDelegate = _detachTitleAlignmentEventDelegate;
		oControlPrototype._determineTitleAlignment = _determineTitleAlignment;
		oControlPrototype.setTitleAlignment = setTitleAlignment;

		var fnInit = oControlPrototype.init;
		oControlPrototype.init = function (sId) {
			this._oTitleAlignmentBarInstances = {};
			var res = fnInit.apply(this, arguments);
			this._attachTitleAlignmentEventDelegate();
			return res;
		};

		var fnExit = oControlPrototype.exit;
		oControlPrototype.exit = function (sId) {
			var res = fnExit.apply(this, arguments);
			this._detachTitleAlignmentEventDelegate();
			delete this._oTitleAlignmentBarInstances;
			return res;
		};
	};

	return TitleAlignmentMixin;
});
