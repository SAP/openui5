sap.ui.define([
	"sap/m/Button"
], function (Button) {
	"use strict";

	return {
		createXmlView: function (sViewName, sViewId, mFragment) {
			var sView = [
				'<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">',
				'<Button id="foo">',
				'</Button>',
				'<Button id="bar">',
				'</Button>',
				'<Button id="baz">',
				'</Button>',
				'<Image id="boo"></Image>',
				_getFragment(mFragment),
				'</mvc:View>'
			].join('');
			var oView;

			oView = sap.ui.xmlview({id: sViewId, viewContent: sView});
			oView.setViewName(sViewName);
			return oView;
		}
	};

	function _getFragment(mFragment) {
		var sFragment = '';
		if (mFragment) {
			sFragment = '<core:Fragment ';
			if (mFragment.id) {
				sFragment += 'id="' + mFragment.id + '" ';
			}
			if (mFragment.name) {
				sFragment += 'fragmentName="' + mFragment.name + '" ';
			}
			sFragment += 'type="JS" />';
		}

		return  sFragment;
	}
});
