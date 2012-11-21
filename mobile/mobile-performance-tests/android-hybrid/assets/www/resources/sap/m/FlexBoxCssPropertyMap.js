/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 * 
 * (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

sap.m.FlexBoxCssPropertyMap = {
	'spec0907': {
		'display': {
			'flex': {
				'display': 'box'
			},
			'inline-flex': {
				'display': 'inline-box'
			}
		},
		'flex-direction': {
			'row': {
				'box-orient': 'horizontal',
				'box-direction': 'normal'
			},
			'row-reverse': {
				'box-orient': 'horizontal',
				'box-direction': 'reverse'
			},
			'column': {
				'box-orient': 'vertical',
				'box-direction': 'normal'
			},
			'column-reverse': {
				'box-orient': 'vertical',
				'box-direction': 'reverse'
			}
		},
		'flex-wrap': {
			'no-wrap': {
				'box-lines': 'single'
			},
			'wrap': {
				'box-lines': 'multiple'
			},
			'wrap-reverse': null
		},
		'flex-flow': null,
		'order': {
			'<number>': {
				'box-ordinal-group': '<integer>'
			}
		},
		'flex-grow': {
			'<number>': {
				'box-flex': '<number>'
			}
		},
		'flex-shrink': null,
		'flex-basis': null,
		'flex': {
			'[flex-grow] | [flex-shrink] | [flex-basis]': {
				'box-flex': '[flex-grow]'
			}
		},
		'justify-content': {
			'flex-start': {
				'box-pack': 'start'
			},
			'flex-end': {
				'box-pack': 'end'
			},
			'center': {
				'box-pack': 'center'
			},
			'space-between': {
				'box-pack': 'justify'
			},
			'space-around': null
		},
		'align-items': {
			'flex-start': {
				'box-align': 'start'
			},
			'flex-end':{
				'box-align': 'end'
			},
			'center': {
				'box-align': 'center'
			},
			'baseline': {
				'box-align': 'baseline'
			},
			'stretch': {
				'box-align': 'stretch'
			}
		},
		'align-self': null,
		'align-content': null
	}
};