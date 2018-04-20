sap.ui.define(['sap/ui/core/mvc/Controller'],
	function(Controller) {
		'use strict';

		return Controller.extend('sap.ui.layout.GridData.GridData', {
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

				$oGridWrapper.control()[0].setWidth(iValue + '%');
			}
		});
	});
