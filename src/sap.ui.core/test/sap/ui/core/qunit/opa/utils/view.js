sap.ui.define([
	"sap/ui/core/mvc/XMLView"
], function (XMLView) {
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

			return XMLView.create({
				id: sViewId,
				definition: sView
			}).then(function(oView) {
				oView.setViewName(sViewName);
				return oView;
			});
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
