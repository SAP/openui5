import ObjectPath from "sap/base/util/ObjectPath";
import assert from "sap/base/assert";
import Log from "sap/base/Log";
import isPlainObject from "sap/base/util/isPlainObject";
import resolveReference from "sap/base/util/resolveReference";
export class DataType {
    getName(...args: any) {
        return undefined;
    }
    getBaseType(...args: any) {
        return undefined;
    }
    getPrimitiveType(...args: any) {
        var oType = this;
        while (oType.getBaseType()) {
            oType = oType.getBaseType();
        }
        return oType;
    }
    getComponentType(...args: any) {
        return undefined;
    }
    getDefaultValue(...args: any) {
        return undefined;
    }
    isArrayType(...args: any) {
        return false;
    }
    isEnumType(...args: any) {
        return false;
    }
    getEnumValues(...args: any) {
        return undefined;
    }
    parseValue(sValue: any) {
        return sValue;
    }
    setNormalizer(fnNormalizer: any) {
        assert(typeof fnNormalizer === "function", "DataType.setNormalizer: fnNormalizer must be a function");
        this._fnNormalizer = typeof fnNormalizer === "function" ? fnNormalizer : undefined;
    }
    normalize(oValue: any) {
        return this._fnNormalizer ? this._fnNormalizer(oValue) : oValue;
    }
    static getType(sTypeName: any) {
        assert(sTypeName && typeof sTypeName === "string", "sTypeName must be a non-empty string");
        var oType = mTypes[sTypeName];
        if (!(oType instanceof DataType)) {
            if (sTypeName.indexOf("[]", sTypeName.length - 2) > 0) {
                var sComponentTypeName = sTypeName.slice(0, -2), oComponentType = this.getType(sComponentTypeName);
                oType = oComponentType && createArrayType(oComponentType);
                if (oType) {
                    mTypes[sTypeName] = oType;
                }
            }
            else if (sTypeName !== "array") {
                oType = ObjectPath.get(sTypeName);
                if (oType instanceof DataType) {
                    mTypes[sTypeName] = oType;
                }
                else if (isPlainObject(oType)) {
                    oType = mTypes[sTypeName] = createEnumType(sTypeName, oType);
                }
                else if (oType) {
                    Log.warning("'" + sTypeName + "' is not a valid data type. Falling back to type 'any'.");
                    oType = mTypes.any;
                }
                else {
                    Log.error("data type '" + sTypeName + "' could not be found.");
                    oType = undefined;
                }
            }
        }
        return oType;
    }
    static createType(sName: any, mSettings: any, vBase: any) {
        assert(typeof sName === "string" && sName, "DataType.createType: type name must be a non-empty string");
        assert(vBase == null || vBase instanceof DataType || typeof vBase === "string" && vBase, "DataType.createType: base type must be empty or a DataType or a non-empty string");
        if (/[\[\]]/.test(sName)) {
            Log.error("DataType.createType: array types ('something[]') must not be created with createType, " + "they're created on-the-fly by DataType.getType");
        }
        if (typeof vBase === "string") {
            vBase = DataType.getType(vBase);
        }
        vBase = vBase || mTypes.any;
        if (vBase.isArrayType() || vBase.isEnumType()) {
            Log.error("DataType.createType: base type must not be an array- or enum-type");
        }
        if (sName === "array" || mTypes[sName] instanceof DataType) {
            if (sName === "array" || mTypes[sName].getBaseType() == null) {
                throw new Error("DataType.createType: primitive or hidden type " + sName + " can't be re-defined");
            }
            Log.warning("DataTypes.createType: type " + sName + " is redefined. " + "This is an unsupported usage of DataType and might cause issues.");
        }
        var oType = mTypes[sName] = createType(sName, mSettings, vBase);
        return oType;
    }
    static registerInterfaceTypes(aTypes: any) {
        aTypes.forEach(function (sType) {
            oInterfaces.add(sType);
            ObjectPath.set(sType, sType);
        });
    }
    static isInterfaceType(sType: any) {
        return oInterfaces.has(sType);
    }
    constructor(...args: any) {
        throw new Error();
    }
}
DataType.prototype.isValid = undefined;
function createType(sName, mSettings, oBase) {
    mSettings = mSettings || {};
    var oBaseObject = oBase || DataType.prototype;
    var oType = Object.create(oBaseObject);
    oType.getName = function () {
        return sName;
    };
    if (mSettings.hasOwnProperty("defaultValue")) {
        var vDefault = mSettings.defaultValue;
        oType.getDefaultValue = function () {
            return vDefault;
        };
    }
    if (mSettings.isValid) {
        var fnIsValid = mSettings.isValid;
        oType.isValid = oBaseObject.isValid ? function (vValue) {
            if (!oBaseObject.isValid(vValue)) {
                return false;
            }
            return fnIsValid(vValue);
        } : fnIsValid;
    }
    if (mSettings.parseValue) {
        oType.parseValue = mSettings.parseValue;
    }
    oType.getBaseType = function () {
        return oBase;
    };
    return oType;
}
var mTypes = {
    "any": createType("any", {
        defaultValue: null,
        isValid: function (vValue) {
            return true;
        }
    }),
    "boolean": createType("boolean", {
        defaultValue: false,
        isValid: function (vValue) {
            return typeof vValue === "boolean";
        },
        parseValue: function (sValue) {
            return sValue == "true";
        }
    }),
    "int": createType("int", {
        defaultValue: 0,
        isValid: function (vValue) {
            return typeof vValue === "number" && (isNaN(vValue) || Math.floor(vValue) == vValue);
        },
        parseValue: function (sValue) {
            return parseInt(sValue);
        }
    }),
    "float": createType("float", {
        defaultValue: 0,
        isValid: function (vValue) {
            return typeof vValue === "number";
        },
        parseValue: function (sValue) {
            return parseFloat(sValue);
        }
    }),
    "string": createType("string", {
        defaultValue: "",
        isValid: function (vValue) {
            return typeof vValue === "string" || vValue instanceof String;
        },
        parseValue: function (sValue) {
            return sValue;
        }
    }),
    "object": createType("object", {
        defaultValue: null,
        isValid: function (vValue) {
            return typeof vValue === "object" || typeof vValue === "function";
        },
        parseValue: function (sValue) {
            return sValue ? JSON.parse(sValue) : null;
        }
    }),
    "function": createType("function", {
        defaultValue: null,
        isValid: function (vValue) {
            return vValue == null || typeof vValue === "function";
        },
        parseValue: function (sValue, _oOptions) {
            if (sValue === "") {
                return undefined;
            }
            if (!/^\.?[A-Z_\$][A-Z0-9_\$]*(\.[A-Z_\$][A-Z0-9_\$]*)*$/i.test(sValue)) {
                throw new Error("Function references must consist of dot separated " + "simple identifiers (A-Z, 0-9, _ or $) only, but was '" + sValue + "'");
            }
            var fnResult, oContext = _oOptions && _oOptions.context, oLocals = _oOptions && _oOptions.locals;
            fnResult = resolveReference(sValue, Object.assign({ ".": oContext }, oLocals));
            if (fnResult && this.isValid(fnResult)) {
                return fnResult;
            }
            throw new TypeError("The string '" + sValue + "' couldn't be resolved to a function");
        }
    })
};
var arrayType = createType("array", {
    defaultValue: []
});
function createArrayType(componentType) {
    assert(componentType instanceof DataType, "DataType.<createArrayType>: componentType must be a DataType");
    var oType = Object.create(DataType.prototype);
    oType.getName = function () {
        return componentType.getName() + "[]";
    };
    oType.getComponentType = function () {
        return componentType;
    };
    oType.isValid = function (aValues) {
        if (aValues === null) {
            return true;
        }
        if (Array.isArray(aValues)) {
            for (var i = 0; i < aValues.length; i++) {
                if (!componentType.isValid(aValues[i])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };
    oType.parseValue = function (sValue) {
        var aValues = sValue.split(",");
        for (var i = 0; i < aValues.length; i++) {
            aValues[i] = componentType.parseValue(aValues[i]);
        }
        return aValues;
    };
    oType.isArrayType = function () {
        return true;
    };
    oType.getBaseType = function () {
        return arrayType;
    };
    return oType;
}
function createEnumType(sTypeName, oEnum) {
    var mValues = {}, sDefaultValue;
    for (var sName in oEnum) {
        var sValue = oEnum[sName];
        if (!sDefaultValue) {
            sDefaultValue = sValue;
        }
        if (typeof sValue !== "string") {
            throw new Error("Value " + sValue + " for enum type " + sTypeName + " is not a string");
        }
        if (!mValues.hasOwnProperty(sValue) || sName == sValue) {
            mValues[sValue] = sName;
        }
    }
    var oType = Object.create(DataType.prototype);
    oType.getName = function () {
        return sTypeName;
    };
    oType.isValid = function (v) {
        return typeof v === "string" && mValues.hasOwnProperty(v);
    };
    oType.parseValue = function (sValue) {
        return oEnum[sValue];
    };
    oType.getDefaultValue = function () {
        return sDefaultValue;
    };
    oType.getBaseType = function () {
        return mTypes.string;
    };
    oType.isEnumType = function () {
        return true;
    };
    oType.getEnumValues = function () {
        return oEnum;
    };
    return oType;
}
var oInterfaces = new Set();