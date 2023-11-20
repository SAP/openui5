sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/mvc/Controller'
],
	function(Element, Controller) {
		'use strict';

		return Controller.extend('sap.ui.layout.GridData.controller.GridData', {
			onSliderMoved: function (oEvent) {
				var iValue = oEvent.getParameter('value'),
					$oGridWrapperRef = this._getNextGridRef(oEvent.getSource());

				this._changeGridWrapperWidth($oGridWrapperRef, iValue);
			},

			_getNextGridRef: function (oSlider) {
				return oSlider ? oSlider.$().parent().next().find('.gridWrapper') : null;
			},

			_changeGridWrapperWidth: function ($oGridWrapper, iValue) {
				if (!$oGridWrapper) {
					return;
				}

				Element.closestTo($oGridWrapper[0]).setWidth(iValue + '%');
			}
		});
	});
