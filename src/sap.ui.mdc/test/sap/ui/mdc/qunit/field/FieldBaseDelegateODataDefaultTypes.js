/* global sinon */

sap.ui.define([
	'sap/ui/mdc/field/FieldBaseDelegate',
	"sap/ui/mdc/odata/TypeMap"
], function (
	FieldBaseDelegate,
	ODataTypeMap
	) {
	"use strict";

	const FieldBaseDelegateODataDefaultTypes = {
		enable: function () {
			if (!FieldBaseDelegate.getTypeMap.isSinonProxy) {
				sinon.stub(FieldBaseDelegate, "getTypeMap").returns(ODataTypeMap);
			}
		},
		disable: function () {
			if (FieldBaseDelegate.getTypeMap.isSinonProxy) {
				FieldBaseDelegate.getTypeMap.restore();
			}
		}
	};

	return FieldBaseDelegateODataDefaultTypes;

});
