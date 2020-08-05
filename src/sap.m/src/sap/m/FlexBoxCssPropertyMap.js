/*!
 * ${copyright}
 */
sap.ui.define([],
	function() {
	"use strict";

	var FlexBoxCssPropertyMap = {
		'specie10': {
			'order': {
				'<number>': {
					'flex-order': '<number>'
				}
			},
			'flex-grow': {
				'<number>': {
					'flex-positive': '<number>',
					'flex-preferred-size': 'auto'
				}
			},
			'flex-shrink': {
				'<number>': {
					'flex-negative': '<number>'
				}
			},
			'flex-basis': {
				'<number>': {
					'flex-preferred-size': '<number>'
				}
			}
		}
	};

	return FlexBoxCssPropertyMap;

}, /* bExport= */ true);
