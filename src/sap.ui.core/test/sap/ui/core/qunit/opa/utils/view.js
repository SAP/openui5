sap.ui.define([
], function () {
	"use strict";

	return {
		createXmlView: function (sViewName, sViewId) {
            var sView = [
                '<core:View xmlns:core="sap.ui.core" xmlns="sap.m">',
                '<Button id="foo">',
                '</Button>',
                '<Button id="bar">',
                '</Button>',
                '<Button id="baz">',
                '</Button>',
                '<Image id="boo"></Image>',
                '</core:View>'
            ].join('');
            var oView;

            oView = sap.ui.xmlview({id: sViewId, viewContent: sView});
            oView.setViewName(sViewName);
            return oView;
        }
	};
});
