sap.ui.define([
	"sap/ui/mdc/DefaultTypeMap",
	"sap/ui/mdc/enums/BaseType",
	"mdc/sample/model/type/LengthMeter" // require the type here, as there is no library to define it
], function(DefaultTypeMap, BaseType, LengthMeter) {
    "use strict";

	const TypeMap = Object.assign({}, DefaultTypeMap);
    TypeMap.import(DefaultTypeMap);
	TypeMap.set("mdc.sample.model.type.LengthMeter", BaseType.Numeric);
	TypeMap.freeze();

	return TypeMap;

}, /* bExport= */false);