var undefined;
var VERSION = "4.17.21";
var LARGE_ARRAY_SIZE = 200;
var FUNC_ERROR_TEXT = "Expected a function";
var HASH_UNDEFINED = "__lodash_hash_undefined__";
var MAX_MEMOIZE_SIZE = 500;
var PLACEHOLDER = "__lodash_placeholder__";
var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
var WRAP_BIND_FLAG = 1, WRAP_BIND_KEY_FLAG = 2, WRAP_CURRY_BOUND_FLAG = 4, WRAP_CURRY_FLAG = 8, WRAP_CURRY_RIGHT_FLAG = 16, WRAP_PARTIAL_FLAG = 32, WRAP_PARTIAL_RIGHT_FLAG = 64, WRAP_ARY_FLAG = 128, WRAP_REARG_FLAG = 256, WRAP_FLIP_FLAG = 512;
var HOT_COUNT = 800, HOT_SPAN = 16;
var INFINITY = 1 / 0, MAX_SAFE_INTEGER = 9007199254740991, MAX_INTEGER = 1.7976931348623157e+308, NAN = 0 / 0;
var MAX_ARRAY_LENGTH = 4294967295;
var wrapFlags = [
    ["ary", WRAP_ARY_FLAG],
    ["bind", WRAP_BIND_FLAG],
    ["bindKey", WRAP_BIND_KEY_FLAG],
    ["curry", WRAP_CURRY_FLAG],
    ["curryRight", WRAP_CURRY_RIGHT_FLAG],
    ["flip", WRAP_FLIP_FLAG],
    ["partial", WRAP_PARTIAL_FLAG],
    ["partialRight", WRAP_PARTIAL_RIGHT_FLAG],
    ["rearg", WRAP_REARG_FLAG]
];
var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", promiseTag = "[object Promise]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/, rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reTrimStart = /^\s+/;
var reWhitespace = /\s/;
var reWrapComment = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/, reWrapDetails = /\{\n\/\* \[wrapped with (.+)\] \*/, reSplitDetails = /,? & /;
var reEscapeChar = /\\(\\)?/g;
var reFlags = /\w*$/;
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
var reIsBinary = /^0b[01]+$/i;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var reIsOctal = /^0o[0-7]+$/i;
var reIsUint = /^(?:0|[1-9]\d*)$/;
var rsAstralRange = "\\ud800-\\udfff", rsComboMarksRange = "\\u0300-\\u036f", reComboHalfMarksRange = "\\ufe20-\\ufe2f", rsComboSymbolsRange = "\\u20d0-\\u20ff", rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange, rsVarRange = "\\ufe0e\\ufe0f";
var rsAstral = "[" + rsAstralRange + "]", rsCombo = "[" + rsComboRange + "]", rsFitz = "\\ud83c[\\udffb-\\udfff]", rsModifier = "(?:" + rsCombo + "|" + rsFitz + ")", rsNonAstral = "[^" + rsAstralRange + "]", rsRegional = "(?:\\ud83c[\\udde6-\\uddff]){2}", rsSurrPair = "[\\ud800-\\udbff][\\udc00-\\udfff]", rsZWJ = "\\u200d";
var reOptMod = rsModifier + "?", rsOptVar = "[" + rsVarRange + "]?", rsOptJoin = "(?:" + rsZWJ + "(?:" + [rsNonAstral, rsRegional, rsSurrPair].join("|") + ")" + rsOptVar + reOptMod + ")*", rsSeq = rsOptVar + reOptMod + rsOptJoin, rsSymbol = "(?:" + [rsNonAstral + rsCombo + "?", rsCombo, rsRegional, rsSurrPair, rsAstral].join("|") + ")";
var reUnicode = RegExp(rsFitz + "(?=" + rsFitz + ")|" + rsSymbol + rsSeq, "g");
var reHasUnicode = RegExp("[" + rsZWJ + rsAstralRange + rsComboRange + rsVarRange + "]");
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
var freeParseInt = parseInt;
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var freeProcess = moduleExports && freeGlobal.process;
var nodeUtil = (function () {
    try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
            return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
    }
    catch (e) { }
}());
var nodeIsMap = nodeUtil && nodeUtil.isMap, nodeIsSet = nodeUtil && nodeUtil.isSet, nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
function apply(func, thisArg, args) {
    switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
}
function arrayEach(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
            break;
        }
    }
    return array;
}
function arrayFilter(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
            result[resIndex++] = value;
        }
    }
    return result;
}
function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf(array, value, 0) > -1;
}
function arrayIncludesWith(array, value, comparator) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
        if (comparator(value, array[index])) {
            return true;
        }
    }
    return false;
}
function arrayMap(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length, result = Array(length);
    while (++index < length) {
        result[index] = iteratee(array[index], index, array);
    }
    return result;
}
function arrayPush(array, values) {
    var index = -1, length = values.length, offset = array.length;
    while (++index < length) {
        array[offset + index] = values[index];
    }
    return array;
}
function arraySome(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
        if (predicate(array[index], index, array)) {
            return true;
        }
    }
    return false;
}
function asciiToArray(string) {
    return string.split("");
}
function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
    while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
            return index;
        }
    }
    return -1;
}
function baseIndexOf(array, value, fromIndex) {
    return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}
function baseIsNaN(value) {
    return value !== value;
}
function baseProperty(key) {
    return function (object) {
        return object == null ? undefined : object[key];
    };
}
function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
        result[index] = iteratee(index);
    }
    return result;
}
function baseTrim(string) {
    return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
}
function baseUnary(func) {
    return function (value) {
        return func(value);
    };
}
function baseValues(object, props) {
    return arrayMap(props, function (key) {
        return object[key];
    });
}
function cacheHas(cache, key) {
    return cache.has(key);
}
function countHolders(array, placeholder) {
    var length = array.length, result = 0;
    while (length--) {
        if (array[length] === placeholder) {
            ++result;
        }
    }
    return result;
}
function getValue(object, key) {
    return object == null ? undefined : object[key];
}
function hasUnicode(string) {
    return reHasUnicode.test(string);
}
function iteratorToArray(iterator) {
    var data, result = [];
    while (!(data = iterator.next()).done) {
        result.push(data.value);
    }
    return result;
}
function mapToArray(map) {
    var index = -1, result = Array(map.size);
    map.forEach(function (value, key) {
        result[++index] = [key, value];
    });
    return result;
}
function overArg(func, transform) {
    return function (arg) {
        return func(transform(arg));
    };
}
function replaceHolders(array, placeholder) {
    var index = -1, length = array.length, resIndex = 0, result = [];
    while (++index < length) {
        var value = array[index];
        if (value === placeholder || value === PLACEHOLDER) {
            array[index] = PLACEHOLDER;
            result[resIndex++] = index;
        }
    }
    return result;
}
function setToArray(set) {
    var index = -1, result = Array(set.size);
    set.forEach(function (value) {
        result[++index] = value;
    });
    return result;
}
function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1, length = array.length;
    while (++index < length) {
        if (array[index] === value) {
            return index;
        }
    }
    return -1;
}
function stringToArray(string) {
    return hasUnicode(string) ? unicodeToArray(string) : asciiToArray(string);
}
function trimmedEndIndex(string) {
    var index = string.length;
    while (index-- && reWhitespace.test(string.charAt(index))) { }
    return index;
}
function unicodeToArray(string) {
    return string.match(reUnicode) || [];
}
var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
var coreJsData = root["__core-js_shared__"];
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var maskSrcKey = (function () {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
    return uid ? ("Symbol(src)_1." + uid) : "";
}());
var nativeObjectToString = objectProto.toString;
var objectCtorString = funcToString.call(Object);
var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
var Buffer = moduleExports ? root.Buffer : undefined, Symbol = root.Symbol, Uint8Array = root.Uint8Array, allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined, getPrototype = overArg(Object.getPrototypeOf, Object), objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, spreadableSymbol = Symbol ? Symbol.isConcatSpreadable : undefined, symIterator = Symbol ? Symbol.iterator : undefined, symToStringTag = Symbol ? Symbol.toStringTag : undefined;
var defineProperty = (function () {
    try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
    }
    catch (e) { }
}());
var nativeGetSymbols = Object.getOwnPropertySymbols, nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined, nativeKeys = overArg(Object.keys, Object), nativeMax = Math.max, nativeMin = Math.min, nativeNow = Date.now;
var DataView = getNative(root, "DataView"), Map = getNative(root, "Map"), Promise = getNative(root, "Promise"), Set = getNative(root, "Set"), WeakMap = getNative(root, "WeakMap"), nativeCreate = getNative(Object, "create");
var metaMap = WeakMap && new WeakMap;
var realNames = {};
var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map), promiseCtorString = toSource(Promise), setCtorString = toSource(Set), weakMapCtorString = toSource(WeakMap);
var symbolProto = Symbol ? Symbol.prototype : undefined, symbolValueOf = symbolProto ? symbolProto.valueOf : undefined, symbolToString = symbolProto ? symbolProto.toString : undefined;
function lodash() {
}
var baseCreate = (function () {
    function object() { }
    return function (proto) {
        if (!isObject(proto)) {
            return {};
        }
        if (objectCreate) {
            return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
    };
}());
function baseLodash() {
}
function LazyWrapper(value) {
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__dir__ = 1;
    this.__filtered__ = false;
    this.__iteratees__ = [];
    this.__takeCount__ = MAX_ARRAY_LENGTH;
    this.__views__ = [];
}
LazyWrapper.prototype = baseCreate(baseLodash.prototype);
LazyWrapper.prototype.constructor = LazyWrapper;
function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}
function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
}
function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
}
function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
}
function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}
function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    return this;
}
Hash.prototype.clear = hashClear;
Hash.prototype["delete"] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}
function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
}
function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
        return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
        data.pop();
    }
    else {
        splice.call(data, index, 1);
    }
    --this.size;
    return true;
}
function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf(data, key);
    return index < 0 ? undefined : data[index][1];
}
function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
}
function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf(data, key);
    if (index < 0) {
        ++this.size;
        data.push([key, value]);
    }
    else {
        data[index][1] = value;
    }
    return this;
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype["delete"] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
    }
}
function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
        "hash": new Hash,
        "map": new (Map || ListCache),
        "string": new Hash
    };
}
function mapCacheDelete(key) {
    var result = getMapData(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
}
function mapCacheGet(key) {
    return getMapData(this, key).get(key);
}
function mapCacheHas(key) {
    return getMapData(this, key).has(key);
}
function mapCacheSet(key, value) {
    var data = getMapData(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype["delete"] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
function SetCache(values) {
    var index = -1, length = values == null ? 0 : values.length;
    this.__data__ = new MapCache;
    while (++index < length) {
        this.add(values[index]);
    }
}
function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
}
function setCacheHas(value) {
    return this.__data__.has(value);
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
}
function stackClear() {
    this.__data__ = new ListCache;
    this.size = 0;
}
function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
}
function stackGet(key) {
    return this.__data__.get(key);
}
function stackHas(key) {
    return this.__data__.has(key);
}
function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
        }
        data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
}
Stack.prototype.clear = stackClear;
Stack.prototype["delete"] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
    for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || (isBuff && (key == "offset" || key == "parent")) || (isType && (key == "buffer" || key == "byteLength" || key == "byteOffset")) || isIndex(key, length)))) {
            result.push(key);
        }
    }
    return result;
}
function assignMergeValue(object, key, value) {
    if ((value !== undefined && !eq(object[key], value)) || (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
    }
}
function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
    }
}
function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
        if (eq(array[length][0], key)) {
            return length;
        }
    }
    return -1;
}
function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
}
function baseAssignIn(object, source) {
    return object && copyObject(source, keysIn(source), object);
}
function baseAssignValue(object, key, value) {
    if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
            "configurable": true,
            "enumerable": true,
            "value": value,
            "writable": true
        });
    }
    else {
        object[key] = value;
    }
}
function baseClone(value, bitmask, customizer, key, object, stack) {
    var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
    if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
        return result;
    }
    if (!isObject(value)) {
        return value;
    }
    var isArr = isArray(value);
    if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
            return copyArray(value, result);
        }
    }
    else {
        var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
        if (isBuffer(value)) {
            return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
            result = (isFlat || isFunc) ? {} : initCloneObject(value);
            if (!isDeep) {
                return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
            }
        }
        else {
            if (!cloneableTags[tag]) {
                return object ? value : {};
            }
            result = initCloneByTag(value, tag, isDeep);
        }
    }
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
        return stacked;
    }
    stack.set(value, result);
    if (isSet(value)) {
        value.forEach(function (subValue) {
            result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
    }
    else if (isMap(value)) {
        value.forEach(function (subValue, key) {
            result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
        });
    }
    var keysFunc = isFull ? (isFlat ? getAllKeysIn : getAllKeys) : (isFlat ? keysIn : keys);
    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function (subValue, key) {
        if (props) {
            key = subValue;
            subValue = value[key];
        }
        assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
}
function baseDifference(array, values, iteratee, comparator) {
    var index = -1, includes = arrayIncludes, isCommon = true, length = array.length, result = [], valuesLength = values.length;
    if (!length) {
        return result;
    }
    if (iteratee) {
        values = arrayMap(values, baseUnary(iteratee));
    }
    if (comparator) {
        includes = arrayIncludesWith;
        isCommon = false;
    }
    else if (values.length >= LARGE_ARRAY_SIZE) {
        includes = cacheHas;
        isCommon = false;
        values = new SetCache(values);
    }
    outer: while (++index < length) {
        var value = array[index], computed = iteratee == null ? value : iteratee(value);
        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
            var valuesIndex = valuesLength;
            while (valuesIndex--) {
                if (values[valuesIndex] === computed) {
                    continue outer;
                }
            }
            result.push(value);
        }
        else if (!includes(values, computed, comparator)) {
            result.push(value);
        }
    }
    return result;
}
var baseEach = createBaseEach(baseForOwn);
function baseExtremum(array, iteratee, comparator) {
    var index = -1, length = array.length;
    while (++index < length) {
        var value = array[index], current = iteratee(value);
        if (current != null && (computed === undefined ? (current === current && !isSymbol(current)) : comparator(current, computed))) {
            var computed = current, result = value;
        }
    }
    return result;
}
function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1, length = array.length;
    predicate || (predicate = isFlattenable);
    result || (result = []);
    while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
            if (depth > 1) {
                baseFlatten(value, depth - 1, predicate, isStrict, result);
            }
            else {
                arrayPush(result, value);
            }
        }
        else if (!isStrict) {
            result[result.length] = value;
        }
    }
    return result;
}
var baseFor = createBaseFor();
function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
}
function baseGet(object, path) {
    path = castPath(path, object);
    var index = 0, length = path.length;
    while (object != null && index < length) {
        object = object[toKey(path[index++])];
    }
    return (index && index == length) ? object : undefined;
}
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}
function baseGetTag(value) {
    if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value)) ? getRawTag(value) : objectToString(value);
}
function baseGt(value, other) {
    return value > other;
}
function baseHasIn(object, key) {
    return object != null && key in Object(object);
}
function baseIntersection(arrays, iteratee, comparator) {
    var includes = comparator ? arrayIncludesWith : arrayIncludes, length = arrays[0].length, othLength = arrays.length, othIndex = othLength, caches = Array(othLength), maxLength = Infinity, result = [];
    while (othIndex--) {
        var array = arrays[othIndex];
        if (othIndex && iteratee) {
            array = arrayMap(array, baseUnary(iteratee));
        }
        maxLength = nativeMin(array.length, maxLength);
        caches[othIndex] = !comparator && (iteratee || (length >= 120 && array.length >= 120)) ? new SetCache(othIndex && array) : undefined;
    }
    array = arrays[0];
    var index = -1, seen = caches[0];
    outer: while (++index < length && result.length < maxLength) {
        var value = array[index], computed = iteratee ? iteratee(value) : value;
        value = (comparator || value !== 0) ? value : 0;
        if (!(seen ? cacheHas(seen, computed) : includes(result, computed, comparator))) {
            othIndex = othLength;
            while (--othIndex) {
                var cache = caches[othIndex];
                if (!(cache ? cacheHas(cache, computed) : includes(arrays[othIndex], computed, comparator))) {
                    continue outer;
                }
            }
            if (seen) {
                seen.push(computed);
            }
            result.push(value);
        }
    }
    return result;
}
function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
}
function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
        return true;
    }
    if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;
    var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
            return false;
        }
        objIsArr = true;
        objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object)) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
            var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
            stack || (stack = new Stack);
            return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
    }
    if (!isSameTag) {
        return false;
    }
    stack || (stack = new Stack);
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}
function baseIsMap(value) {
    return isObjectLike(value) && getTag(value) == mapTag;
}
function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length, length = index, noCustomizer = !customizer;
    if (object == null) {
        return !length;
    }
    object = Object(object);
    while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2]) ? data[1] !== object[data[0]] : !(data[0] in object)) {
            return false;
        }
    }
    while (++index < length) {
        data = matchData[index];
        var key = data[0], objValue = object[key], srcValue = data[1];
        if (noCustomizer && data[2]) {
            if (objValue === undefined && !(key in object)) {
                return false;
            }
        }
        else {
            var stack = new Stack;
            if (customizer) {
                var result = customizer(objValue, srcValue, key, object, source, stack);
            }
            if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
                return false;
            }
        }
    }
    return true;
}
function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
        return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
}
function baseIsSet(value) {
    return isObjectLike(value) && getTag(value) == setTag;
}
function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}
function baseIteratee(value) {
    if (typeof value == "function") {
        return value;
    }
    if (value == null) {
        return identity;
    }
    if (typeof value == "object") {
        return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
    }
    return property(value);
}
function baseKeys(object) {
    if (!isPrototype(object)) {
        return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
            result.push(key);
        }
    }
    return result;
}
function baseKeysIn(object) {
    if (!isObject(object)) {
        return nativeKeysIn(object);
    }
    var isProto = isPrototype(object), result = [];
    for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
            result.push(key);
        }
    }
    return result;
}
function baseLt(value, other) {
    return value < other;
}
function baseMap(collection, iteratee) {
    var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
    baseEach(collection, function (value, key, collection) {
        result[++index] = iteratee(value, key, collection);
    });
    return result;
}
function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function (object) {
        return object === source || baseIsMatch(object, source, matchData);
    };
}
function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
    }
    return function (object) {
        var objValue = get(object, path);
        return (objValue === undefined && objValue === srcValue) ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
    };
}
function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
        return;
    }
    baseFor(source, function (srcValue, key) {
        stack || (stack = new Stack);
        if (isObject(srcValue)) {
            baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        }
        else {
            var newValue = customizer ? customizer(safeGet(object, key), srcValue, (key + ""), object, source, stack) : undefined;
            if (newValue === undefined) {
                newValue = srcValue;
            }
            assignMergeValue(object, key, newValue);
        }
    }, keysIn);
}
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
    if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
    }
    var newValue = customizer ? customizer(objValue, srcValue, (key + ""), object, source, stack) : undefined;
    var isCommon = newValue === undefined;
    if (isCommon) {
        var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
            if (isArray(objValue)) {
                newValue = objValue;
            }
            else if (isArrayLikeObject(objValue)) {
                newValue = copyArray(objValue);
            }
            else if (isBuff) {
                isCommon = false;
                newValue = cloneBuffer(srcValue, true);
            }
            else if (isTyped) {
                isCommon = false;
                newValue = cloneTypedArray(srcValue, true);
            }
            else {
                newValue = [];
            }
        }
        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
            newValue = objValue;
            if (isArguments(objValue)) {
                newValue = toPlainObject(objValue);
            }
            else if (!isObject(objValue) || isFunction(objValue)) {
                newValue = initCloneObject(srcValue);
            }
        }
        else {
            isCommon = false;
        }
    }
    if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
    }
    assignMergeValue(object, key, newValue);
}
function basePick(object, paths) {
    return basePickBy(object, paths, function (value, path) {
        return hasIn(object, path);
    });
}
function basePickBy(object, paths, predicate) {
    var index = -1, length = paths.length, result = {};
    while (++index < length) {
        var path = paths[index], value = baseGet(object, path);
        if (predicate(value, path)) {
            baseSet(result, castPath(path, object), value);
        }
    }
    return result;
}
function basePropertyDeep(path) {
    return function (object) {
        return baseGet(object, path);
    };
}
function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + "");
}
function baseSet(object, path, value, customizer) {
    if (!isObject(object)) {
        return object;
    }
    path = castPath(path, object);
    var index = -1, length = path.length, lastIndex = length - 1, nested = object;
    while (nested != null && ++index < length) {
        var key = toKey(path[index]), newValue = value;
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            return object;
        }
        if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined;
            if (newValue === undefined) {
                newValue = isObject(objValue) ? objValue : (isIndex(path[index + 1]) ? [] : {});
            }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
    }
    return object;
}
var baseSetData = !metaMap ? identity : function (func, data) {
    metaMap.set(func, data);
    return func;
};
var baseSetToString = !defineProperty ? identity : function (func, string) {
    return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant(string),
        "writable": true
    });
};
function baseSlice(array, start, end) {
    var index = -1, length = array.length;
    if (start < 0) {
        start = -start > length ? 0 : (length + start);
    }
    end = end > length ? length : end;
    if (end < 0) {
        end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;
    var result = Array(length);
    while (++index < length) {
        result[index] = array[index + start];
    }
    return result;
}
function baseToString(value) {
    if (typeof value == "string") {
        return value;
    }
    if (isArray(value)) {
        return arrayMap(value, baseToString) + "";
    }
    if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
    }
    var result = (value + "");
    return (result == "0" && (1 / value) == -INFINITY) ? "-0" : result;
}
function baseUniq(array, iteratee, comparator) {
    var index = -1, includes = arrayIncludes, length = array.length, isCommon = true, result = [], seen = result;
    if (comparator) {
        isCommon = false;
        includes = arrayIncludesWith;
    }
    else if (length >= LARGE_ARRAY_SIZE) {
        var set = iteratee ? null : createSet(array);
        if (set) {
            return setToArray(set);
        }
        isCommon = false;
        includes = cacheHas;
        seen = new SetCache;
    }
    else {
        seen = iteratee ? [] : result;
    }
    outer: while (++index < length) {
        var value = array[index], computed = iteratee ? iteratee(value) : value;
        value = (comparator || value !== 0) ? value : 0;
        if (isCommon && computed === computed) {
            var seenIndex = seen.length;
            while (seenIndex--) {
                if (seen[seenIndex] === computed) {
                    continue outer;
                }
            }
            if (iteratee) {
                seen.push(computed);
            }
            result.push(value);
        }
        else if (!includes(seen, computed, comparator)) {
            if (seen !== result) {
                seen.push(computed);
            }
            result.push(value);
        }
    }
    return result;
}
function baseUnset(object, path) {
    path = castPath(path, object);
    object = parent(object, path);
    return object == null || delete object[toKey(last(path))];
}
function baseXor(arrays, iteratee, comparator) {
    var length = arrays.length;
    if (length < 2) {
        return length ? baseUniq(arrays[0]) : [];
    }
    var index = -1, result = Array(length);
    while (++index < length) {
        var array = arrays[index], othIndex = -1;
        while (++othIndex < length) {
            if (othIndex != index) {
                result[index] = baseDifference(result[index] || array, arrays[othIndex], iteratee, comparator);
            }
        }
    }
    return baseUniq(baseFlatten(result, 1), iteratee, comparator);
}
function baseZipObject(props, values, assignFunc) {
    var index = -1, length = props.length, valsLength = values.length, result = {};
    while (++index < length) {
        var value = index < valsLength ? values[index] : undefined;
        assignFunc(result, props[index], value);
    }
    return result;
}
function castArrayLikeObject(value) {
    return isArrayLikeObject(value) ? value : [];
}
function castPath(value, object) {
    if (isArray(value)) {
        return value;
    }
    return isKey(value, object) ? [value] : stringToPath(toString(value));
}
function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
        return buffer.slice();
    }
    var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
    buffer.copy(result);
    return result;
}
function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
}
function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}
function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
}
function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}
function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
function composeArgs(args, partials, holders, isCurried) {
    var argsIndex = -1, argsLength = args.length, holdersLength = holders.length, leftIndex = -1, leftLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result = Array(leftLength + rangeLength), isUncurried = !isCurried;
    while (++leftIndex < leftLength) {
        result[leftIndex] = partials[leftIndex];
    }
    while (++argsIndex < holdersLength) {
        if (isUncurried || argsIndex < argsLength) {
            result[holders[argsIndex]] = args[argsIndex];
        }
    }
    while (rangeLength--) {
        result[leftIndex++] = args[argsIndex++];
    }
    return result;
}
function composeArgsRight(args, partials, holders, isCurried) {
    var argsIndex = -1, argsLength = args.length, holdersIndex = -1, holdersLength = holders.length, rightIndex = -1, rightLength = partials.length, rangeLength = nativeMax(argsLength - holdersLength, 0), result = Array(rangeLength + rightLength), isUncurried = !isCurried;
    while (++argsIndex < rangeLength) {
        result[argsIndex] = args[argsIndex];
    }
    var offset = argsIndex;
    while (++rightIndex < rightLength) {
        result[offset + rightIndex] = partials[rightIndex];
    }
    while (++holdersIndex < holdersLength) {
        if (isUncurried || argsIndex < argsLength) {
            result[offset + holders[holdersIndex]] = args[argsIndex++];
        }
    }
    return result;
}
function copyArray(source, array) {
    var index = -1, length = source.length;
    array || (array = Array(length));
    while (++index < length) {
        array[index] = source[index];
    }
    return array;
}
function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});
    var index = -1, length = props.length;
    while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
        if (newValue === undefined) {
            newValue = source[key];
        }
        if (isNew) {
            baseAssignValue(object, key, newValue);
        }
        else {
            assignValue(object, key, newValue);
        }
    }
    return object;
}
function copySymbols(source, object) {
    return copyObject(source, getSymbols(source), object);
}
function copySymbolsIn(source, object) {
    return copyObject(source, getSymbolsIn(source), object);
}
function createAssigner(assigner) {
    return baseRest(function (object, sources) {
        var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : undefined, guard = length > 2 ? sources[2] : undefined;
        customizer = (assigner.length > 3 && typeof customizer == "function") ? (length--, customizer) : undefined;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
            customizer = length < 3 ? undefined : customizer;
            length = 1;
        }
        object = Object(object);
        while (++index < length) {
            var source = sources[index];
            if (source) {
                assigner(object, source, index, customizer);
            }
        }
        return object;
    });
}
function createBaseEach(eachFunc, fromRight) {
    return function (collection, iteratee) {
        if (collection == null) {
            return collection;
        }
        if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee);
        }
        var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
        while ((fromRight ? index-- : ++index < length)) {
            if (iteratee(iterable[index], index, iterable) === false) {
                break;
            }
        }
        return collection;
    };
}
function createBaseFor(fromRight) {
    return function (object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
            var key = props[fromRight ? length : ++index];
            if (iteratee(iterable[key], key, iterable) === false) {
                break;
            }
        }
        return object;
    };
}
function createBind(func, bitmask, thisArg) {
    var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
    function wrapper() {
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return fn.apply(isBind ? thisArg : this, arguments);
    }
    return wrapper;
}
function createCtor(Ctor) {
    return function () {
        var args = arguments;
        switch (args.length) {
            case 0: return new Ctor;
            case 1: return new Ctor(args[0]);
            case 2: return new Ctor(args[0], args[1]);
            case 3: return new Ctor(args[0], args[1], args[2]);
            case 4: return new Ctor(args[0], args[1], args[2], args[3]);
            case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
            case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
            case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
        }
        var thisBinding = baseCreate(Ctor.prototype), result = Ctor.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
    };
}
function createCurry(func, bitmask, arity) {
    var Ctor = createCtor(func);
    function wrapper() {
        var length = arguments.length, args = Array(length), index = length, placeholder = getHolder(wrapper);
        while (index--) {
            args[index] = arguments[index];
        }
        var holders = (length < 3 && args[0] !== placeholder && args[length - 1] !== placeholder) ? [] : replaceHolders(args, placeholder);
        length -= holders.length;
        if (length < arity) {
            return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, undefined, args, holders, undefined, undefined, arity - length);
        }
        var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        return apply(fn, this, args);
    }
    return wrapper;
}
function createHybrid(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
    var isAry = bitmask & WRAP_ARY_FLAG, isBind = bitmask & WRAP_BIND_FLAG, isBindKey = bitmask & WRAP_BIND_KEY_FLAG, isCurried = bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG), isFlip = bitmask & WRAP_FLIP_FLAG, Ctor = isBindKey ? undefined : createCtor(func);
    function wrapper() {
        var length = arguments.length, args = Array(length), index = length;
        while (index--) {
            args[index] = arguments[index];
        }
        if (isCurried) {
            var placeholder = getHolder(wrapper), holdersCount = countHolders(args, placeholder);
        }
        if (partials) {
            args = composeArgs(args, partials, holders, isCurried);
        }
        if (partialsRight) {
            args = composeArgsRight(args, partialsRight, holdersRight, isCurried);
        }
        length -= holdersCount;
        if (isCurried && length < arity) {
            var newHolders = replaceHolders(args, placeholder);
            return createRecurry(func, bitmask, createHybrid, wrapper.placeholder, thisArg, args, newHolders, argPos, ary, arity - length);
        }
        var thisBinding = isBind ? thisArg : this, fn = isBindKey ? thisBinding[func] : func;
        length = args.length;
        if (argPos) {
            args = reorder(args, argPos);
        }
        else if (isFlip && length > 1) {
            args.reverse();
        }
        if (isAry && ary < length) {
            args.length = ary;
        }
        if (this && this !== root && this instanceof wrapper) {
            fn = Ctor || createCtor(fn);
        }
        return fn.apply(thisBinding, args);
    }
    return wrapper;
}
function createPartial(func, bitmask, thisArg, partials) {
    var isBind = bitmask & WRAP_BIND_FLAG, Ctor = createCtor(func);
    function wrapper() {
        var argsIndex = -1, argsLength = arguments.length, leftIndex = -1, leftLength = partials.length, args = Array(leftLength + argsLength), fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
        while (++leftIndex < leftLength) {
            args[leftIndex] = partials[leftIndex];
        }
        while (argsLength--) {
            args[leftIndex++] = arguments[++argsIndex];
        }
        return apply(fn, isBind ? thisArg : this, args);
    }
    return wrapper;
}
function createRecurry(func, bitmask, wrapFunc, placeholder, thisArg, partials, holders, argPos, ary, arity) {
    var isCurry = bitmask & WRAP_CURRY_FLAG, newHolders = isCurry ? holders : undefined, newHoldersRight = isCurry ? undefined : holders, newPartials = isCurry ? partials : undefined, newPartialsRight = isCurry ? undefined : partials;
    bitmask |= (isCurry ? WRAP_PARTIAL_FLAG : WRAP_PARTIAL_RIGHT_FLAG);
    bitmask &= ~(isCurry ? WRAP_PARTIAL_RIGHT_FLAG : WRAP_PARTIAL_FLAG);
    if (!(bitmask & WRAP_CURRY_BOUND_FLAG)) {
        bitmask &= ~(WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG);
    }
    var newData = [
        func,
        bitmask,
        thisArg,
        newPartials,
        newHolders,
        newPartialsRight,
        newHoldersRight,
        argPos,
        ary,
        arity
    ];
    var result = wrapFunc.apply(undefined, newData);
    if (isLaziable(func)) {
        setData(result, newData);
    }
    result.placeholder = placeholder;
    return setWrapToString(result, func, bitmask);
}
var createSet = !(Set && (1 / setToArray(new Set([, -0]))[1]) == INFINITY) ? noop : function (values) {
    return new Set(values);
};
function createWrap(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
    var isBindKey = bitmask & WRAP_BIND_KEY_FLAG;
    if (!isBindKey && typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    var length = partials ? partials.length : 0;
    if (!length) {
        bitmask &= ~(WRAP_PARTIAL_FLAG | WRAP_PARTIAL_RIGHT_FLAG);
        partials = holders = undefined;
    }
    ary = ary === undefined ? ary : nativeMax(toInteger(ary), 0);
    arity = arity === undefined ? arity : toInteger(arity);
    length -= holders ? holders.length : 0;
    if (bitmask & WRAP_PARTIAL_RIGHT_FLAG) {
        var partialsRight = partials, holdersRight = holders;
        partials = holders = undefined;
    }
    var data = isBindKey ? undefined : getData(func);
    var newData = [
        func,
        bitmask,
        thisArg,
        partials,
        holders,
        partialsRight,
        holdersRight,
        argPos,
        ary,
        arity
    ];
    if (data) {
        mergeData(newData, data);
    }
    func = newData[0];
    bitmask = newData[1];
    thisArg = newData[2];
    partials = newData[3];
    holders = newData[4];
    arity = newData[9] = newData[9] === undefined ? (isBindKey ? 0 : func.length) : nativeMax(newData[9] - length, 0);
    if (!arity && bitmask & (WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG)) {
        bitmask &= ~(WRAP_CURRY_FLAG | WRAP_CURRY_RIGHT_FLAG);
    }
    if (!bitmask || bitmask == WRAP_BIND_FLAG) {
        var result = createBind(func, bitmask, thisArg);
    }
    else if (bitmask == WRAP_CURRY_FLAG || bitmask == WRAP_CURRY_RIGHT_FLAG) {
        result = createCurry(func, bitmask, arity);
    }
    else if ((bitmask == WRAP_PARTIAL_FLAG || bitmask == (WRAP_BIND_FLAG | WRAP_PARTIAL_FLAG)) && !holders.length) {
        result = createPartial(func, bitmask, thisArg, partials);
    }
    else {
        result = createHybrid.apply(undefined, newData);
    }
    var setter = data ? baseSetData : setData;
    return setWrapToString(setter(result, newData), func, bitmask);
}
function customOmitClone(value) {
    return isPlainObject(value) ? undefined : value;
}
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
    }
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
    }
    var index = -1, result = true, seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;
    stack.set(array, other);
    stack.set(other, array);
    while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
            var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
            if (compared) {
                continue;
            }
            result = false;
            break;
        }
        if (seen) {
            if (!arraySome(other, function (othValue, othIndex) {
                if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                    return seen.push(othIndex);
                }
            })) {
                result = false;
                break;
            }
        }
        else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            result = false;
            break;
        }
    }
    stack["delete"](array);
    stack["delete"](other);
    return result;
}
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
        case dataViewTag:
            if ((object.byteLength != other.byteLength) || (object.byteOffset != other.byteOffset)) {
                return false;
            }
            object = object.buffer;
            other = other.buffer;
        case arrayBufferTag:
            if ((object.byteLength != other.byteLength) || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
                return false;
            }
            return true;
        case boolTag:
        case dateTag:
        case numberTag: return eq(+object, +other);
        case errorTag: return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag: return object == (other + "");
        case mapTag: var convert = mapToArray;
        case setTag:
            var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
            convert || (convert = setToArray);
            if (object.size != other.size && !isPartial) {
                return false;
            }
            var stacked = stack.get(object);
            if (stacked) {
                return stacked == other;
            }
            bitmask |= COMPARE_UNORDERED_FLAG;
            stack.set(object, other);
            var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
            stack["delete"](object);
            return result;
        case symbolTag: if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }
    return false;
}
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
        return false;
    }
    var index = objLength;
    while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
            return false;
        }
    }
    var objStacked = stack.get(object);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
            var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === undefined ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack)) : compared)) {
            result = false;
            break;
        }
        skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
            result = false;
        }
    }
    stack["delete"](object);
    stack["delete"](other);
    return result;
}
function flatRest(func) {
    return setToString(overRest(func, undefined, flatten), func + "");
}
function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
}
function getAllKeysIn(object) {
    return baseGetAllKeys(object, keysIn, getSymbolsIn);
}
var getData = !metaMap ? noop : function (func) {
    return metaMap.get(func);
};
function getFuncName(func) {
    var result = (func.name + ""), array = realNames[result], length = hasOwnProperty.call(realNames, result) ? array.length : 0;
    while (length--) {
        var data = array[length], otherFunc = data.func;
        if (otherFunc == null || otherFunc == func) {
            return data.name;
        }
    }
    return result;
}
function getHolder(func) {
    var object = hasOwnProperty.call(lodash, "placeholder") ? lodash : func;
    return object.placeholder;
}
function getIteratee() {
    var result = lodash.iteratee || iteratee;
    result = result === iteratee ? baseIteratee : result;
    return arguments.length ? result(arguments[0], arguments[1]) : result;
}
function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
function getMatchData(object) {
    var result = keys(object), length = result.length;
    while (length--) {
        var key = result[length], value = object[key];
        result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
}
function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
}
function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    try {
        value[symToStringTag] = undefined;
        var unmasked = true;
    }
    catch (e) { }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
        if (isOwn) {
            value[symToStringTag] = tag;
        }
        else {
            delete value[symToStringTag];
        }
    }
    return result;
}
var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
    if (object == null) {
        return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function (symbol) {
        return propertyIsEnumerable.call(object, symbol);
    });
};
var getSymbolsIn = !nativeGetSymbols ? stubArray : function (object) {
    var result = [];
    while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
    }
    return result;
};
var getTag = baseGetTag;
if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) || (Map && getTag(new Map) != mapTag) || (Promise && getTag(Promise.resolve()) != promiseTag) || (Set && getTag(new Set) != setTag) || (WeakMap && getTag(new WeakMap) != weakMapTag)) {
    getTag = function (value) {
        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : undefined, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
            switch (ctorString) {
                case dataViewCtorString: return dataViewTag;
                case mapCtorString: return mapTag;
                case promiseCtorString: return promiseTag;
                case setCtorString: return setTag;
                case weakMapCtorString: return weakMapTag;
            }
        }
        return result;
    };
}
function getWrapDetails(source) {
    var match = source.match(reWrapDetails);
    return match ? match[1].split(reSplitDetails) : [];
}
function hasPath(object, path, hasFunc) {
    path = castPath(path, object);
    var index = -1, length = path.length, result = false;
    while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
            break;
        }
        object = object[key];
    }
    if (result || ++index != length) {
        return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}
function initCloneArray(array) {
    var length = array.length, result = new array.constructor(length);
    if (length && typeof array[0] == "string" && hasOwnProperty.call(array, "index")) {
        result.index = array.index;
        result.input = array.input;
    }
    return result;
}
function initCloneObject(object) {
    return (typeof object.constructor == "function" && !isPrototype(object)) ? baseCreate(getPrototype(object)) : {};
}
function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
        case arrayBufferTag: return cloneArrayBuffer(object);
        case boolTag:
        case dateTag: return new Ctor(+object);
        case dataViewTag: return cloneDataView(object, isDeep);
        case float32Tag:
        case float64Tag:
        case int8Tag:
        case int16Tag:
        case int32Tag:
        case uint8Tag:
        case uint8ClampedTag:
        case uint16Tag:
        case uint32Tag: return cloneTypedArray(object, isDeep);
        case mapTag: return new Ctor;
        case numberTag:
        case stringTag: return new Ctor(object);
        case regexpTag: return cloneRegExp(object);
        case setTag: return new Ctor;
        case symbolTag: return cloneSymbol(object);
    }
}
function insertWrapDetails(source, details) {
    var length = details.length;
    if (!length) {
        return source;
    }
    var lastIndex = length - 1;
    details[lastIndex] = (length > 1 ? "& " : "") + details[lastIndex];
    details = details.join(length > 2 ? ", " : " ");
    return source.replace(reWrapComment, "{\n/* [wrapped with " + details + "] */\n");
}
function isFlattenable(value) {
    return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (type == "number" || (type != "symbol" && reIsUint.test(value))) && (value > -1 && value % 1 == 0 && value < length);
}
function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
        return false;
    }
    var type = typeof index;
    if (type == "number" ? (isArrayLike(object) && isIndex(index, object.length)) : (type == "string" && index in object)) {
        return eq(object[index], value);
    }
    return false;
}
function isKey(value, object) {
    if (isArray(value)) {
        return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
        return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || (object != null && value in Object(object));
}
function isKeyable(value) {
    var type = typeof value;
    return (type == "string" || type == "number" || type == "symbol" || type == "boolean") ? (value !== "__proto__") : (value === null);
}
function isLaziable(func) {
    var funcName = getFuncName(func), other = lodash[funcName];
    if (typeof other != "function" || !(funcName in LazyWrapper.prototype)) {
        return false;
    }
    if (func === other) {
        return true;
    }
    var data = getData(other);
    return !!data && func === data[0];
}
function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
}
function isPrototype(value) {
    var Ctor = value && value.constructor, proto = (typeof Ctor == "function" && Ctor.prototype) || objectProto;
    return value === proto;
}
function isStrictComparable(value) {
    return value === value && !isObject(value);
}
function matchesStrictComparable(key, srcValue) {
    return function (object) {
        if (object == null) {
            return false;
        }
        return object[key] === srcValue && (srcValue !== undefined || (key in Object(object)));
    };
}
function memoizeCapped(func) {
    var result = memoize(func, function (key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
            cache.clear();
        }
        return key;
    });
    var cache = result.cache;
    return result;
}
function mergeData(data, source) {
    var bitmask = data[1], srcBitmask = source[1], newBitmask = bitmask | srcBitmask, isCommon = newBitmask < (WRAP_BIND_FLAG | WRAP_BIND_KEY_FLAG | WRAP_ARY_FLAG);
    var isCombo = ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_CURRY_FLAG)) || ((srcBitmask == WRAP_ARY_FLAG) && (bitmask == WRAP_REARG_FLAG) && (data[7].length <= source[8])) || ((srcBitmask == (WRAP_ARY_FLAG | WRAP_REARG_FLAG)) && (source[7].length <= source[8]) && (bitmask == WRAP_CURRY_FLAG));
    if (!(isCommon || isCombo)) {
        return data;
    }
    if (srcBitmask & WRAP_BIND_FLAG) {
        data[2] = source[2];
        newBitmask |= bitmask & WRAP_BIND_FLAG ? 0 : WRAP_CURRY_BOUND_FLAG;
    }
    var value = source[3];
    if (value) {
        var partials = data[3];
        data[3] = partials ? composeArgs(partials, value, source[4]) : value;
        data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : source[4];
    }
    value = source[5];
    if (value) {
        partials = data[5];
        data[5] = partials ? composeArgsRight(partials, value, source[6]) : value;
        data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : source[6];
    }
    value = source[7];
    if (value) {
        data[7] = value;
    }
    if (srcBitmask & WRAP_ARY_FLAG) {
        data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
    }
    if (data[9] == null) {
        data[9] = source[9];
    }
    data[0] = source[0];
    data[1] = newBitmask;
    return data;
}
function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
        for (var key in Object(object)) {
            result.push(key);
        }
    }
    return result;
}
function objectToString(value) {
    return nativeObjectToString.call(value);
}
function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
    return function () {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index < length) {
            array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
            otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
    };
}
function parent(object, path) {
    return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
}
function reorder(array, indexes) {
    var arrLength = array.length, length = nativeMin(indexes.length, arrLength), oldArray = copyArray(array);
    while (length--) {
        var index = indexes[length];
        array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
    }
    return array;
}
function safeGet(object, key) {
    if (key === "constructor" && typeof object[key] === "function") {
        return;
    }
    if (key == "__proto__") {
        return;
    }
    return object[key];
}
var setData = shortOut(baseSetData);
var setToString = shortOut(baseSetToString);
function setWrapToString(wrapper, reference, bitmask) {
    var source = (reference + "");
    return setToString(wrapper, insertWrapDetails(source, updateWrapDetails(getWrapDetails(source), bitmask)));
}
function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function () {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
            if (++count >= HOT_COUNT) {
                return arguments[0];
            }
        }
        else {
            count = 0;
        }
        return func.apply(undefined, arguments);
    };
}
var stringToPath = memoizeCapped(function (string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
        result.push("");
    }
    string.replace(rePropName, function (match, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, "$1") : (number || match));
    });
    return result;
});
function toKey(value) {
    if (typeof value == "string" || isSymbol(value)) {
        return value;
    }
    var result = (value + "");
    return (result == "0" && (1 / value) == -INFINITY) ? "-0" : result;
}
function toSource(func) {
    if (func != null) {
        try {
            return funcToString.call(func);
        }
        catch (e) { }
        try {
            return (func + "");
        }
        catch (e) { }
    }
    return "";
}
function updateWrapDetails(details, bitmask) {
    arrayEach(wrapFlags, function (pair) {
        var value = "_." + pair[0];
        if ((bitmask & pair[1]) && !arrayIncludes(details, value)) {
            details.push(value);
        }
    });
    return details.sort();
}
function compact(array) {
    var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index < length) {
        var value = array[index];
        if (value) {
            result[resIndex++] = value;
        }
    }
    return result;
}
var difference = baseRest(function (array, values) {
    return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true)) : [];
});
var differenceBy = baseRest(function (array, values) {
    var iteratee = last(values);
    if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
    }
    return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), getIteratee(iteratee, 2)) : [];
});
var differenceWith = baseRest(function (array, values) {
    var comparator = last(values);
    if (isArrayLikeObject(comparator)) {
        comparator = undefined;
    }
    return isArrayLikeObject(array) ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator) : [];
});
function flatten(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten(array, 1) : [];
}
function flattenDeep(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten(array, INFINITY) : [];
}
function flattenDepth(array, depth) {
    var length = array == null ? 0 : array.length;
    if (!length) {
        return [];
    }
    depth = depth === undefined ? 1 : toInteger(depth);
    return baseFlatten(array, depth);
}
var intersection = baseRest(function (arrays) {
    var mapped = arrayMap(arrays, castArrayLikeObject);
    return (mapped.length && mapped[0] === arrays[0]) ? baseIntersection(mapped) : [];
});
var intersectionBy = baseRest(function (arrays) {
    var iteratee = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
    if (iteratee === last(mapped)) {
        iteratee = undefined;
    }
    else {
        mapped.pop();
    }
    return (mapped.length && mapped[0] === arrays[0]) ? baseIntersection(mapped, getIteratee(iteratee, 2)) : [];
});
var intersectionWith = baseRest(function (arrays) {
    var comparator = last(arrays), mapped = arrayMap(arrays, castArrayLikeObject);
    comparator = typeof comparator == "function" ? comparator : undefined;
    if (comparator) {
        mapped.pop();
    }
    return (mapped.length && mapped[0] === arrays[0]) ? baseIntersection(mapped, undefined, comparator) : [];
});
function last(array) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
}
var union = baseRest(function (arrays) {
    return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true));
});
var unionBy = baseRest(function (arrays) {
    var iteratee = last(arrays);
    if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
    }
    return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), getIteratee(iteratee, 2));
});
var unionWith = baseRest(function (arrays) {
    var comparator = last(arrays);
    comparator = typeof comparator == "function" ? comparator : undefined;
    return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
});
function uniq(array) {
    return (array && array.length) ? baseUniq(array) : [];
}
function uniqBy(array, iteratee) {
    return (array && array.length) ? baseUniq(array, getIteratee(iteratee, 2)) : [];
}
function uniqWith(array, comparator) {
    comparator = typeof comparator == "function" ? comparator : undefined;
    return (array && array.length) ? baseUniq(array, undefined, comparator) : [];
}
var without = baseRest(function (array, values) {
    return isArrayLikeObject(array) ? baseDifference(array, values) : [];
});
var xor = baseRest(function (arrays) {
    return baseXor(arrayFilter(arrays, isArrayLikeObject));
});
var xorBy = baseRest(function (arrays) {
    var iteratee = last(arrays);
    if (isArrayLikeObject(iteratee)) {
        iteratee = undefined;
    }
    return baseXor(arrayFilter(arrays, isArrayLikeObject), getIteratee(iteratee, 2));
});
var xorWith = baseRest(function (arrays) {
    var comparator = last(arrays);
    comparator = typeof comparator == "function" ? comparator : undefined;
    return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
});
function zipObject(props, values) {
    return baseZipObject(props || [], values || [], assignValue);
}
function zipObjectDeep(props, values) {
    return baseZipObject(props || [], values || [], baseSet);
}
function flatMap(collection, iteratee) {
    return baseFlatten(map(collection, iteratee), 1);
}
function flatMapDeep(collection, iteratee) {
    return baseFlatten(map(collection, iteratee), INFINITY);
}
function flatMapDepth(collection, iteratee, depth) {
    depth = depth === undefined ? 1 : toInteger(depth);
    return baseFlatten(map(collection, iteratee), depth);
}
function map(collection, iteratee) {
    var func = isArray(collection) ? arrayMap : baseMap;
    return func(collection, getIteratee(iteratee, 3));
}
var now = function () {
    return root.Date.now();
};
function curry(func, arity, guard) {
    arity = guard ? undefined : arity;
    var result = createWrap(func, WRAP_CURRY_FLAG, undefined, undefined, undefined, undefined, undefined, arity);
    result.placeholder = curry.placeholder;
    return result;
}
function debounce(func, wait, options) {
    var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
    if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
        leading = !!options.leading;
        maxing = "maxWait" in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
    }
    function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
    }
    function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
        return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
    }
    function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) || (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }
    function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
    }
    function trailingEdge(time) {
        timerId = undefined;
        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
    }
    function cancel() {
        if (timerId !== undefined) {
            clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
    }
    function flush() {
        return timerId === undefined ? result : trailingEdge(now());
    }
    function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
            if (timerId === undefined) {
                return leadingEdge(lastCallTime);
            }
            if (maxing) {
                clearTimeout(timerId);
                timerId = setTimeout(timerExpired, wait);
                return invokeFunc(lastCallTime);
            }
        }
        if (timerId === undefined) {
            timerId = setTimeout(timerExpired, wait);
        }
        return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
}
function memoize(func, resolver) {
    if (typeof func != "function" || (resolver != null && typeof resolver != "function")) {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function () {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
            return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
}
memoize.Cache = MapCache;
function throttle(func, wait, options) {
    var leading = true, trailing = true;
    if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
        leading = "leading" in options ? !!options.leading : leading;
        trailing = "trailing" in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
        "leading": leading,
        "maxWait": wait,
        "trailing": trailing
    });
}
function castArray() {
    if (!arguments.length) {
        return [];
    }
    var value = arguments[0];
    return isArray(value) ? value : [value];
}
function eq(value, other) {
    return value === other || (value !== value && other !== other);
}
var isArguments = baseIsArguments(function () { return arguments; }()) ? baseIsArguments : function (value) {
    return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
};
var isArray = Array.isArray;
function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
}
function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
}
var isBuffer = nativeIsBuffer || stubFalse;
function isEqual(value, other) {
    return baseIsEqual(value, other);
}
function isEqualWith(value, other, customizer) {
    customizer = typeof customizer == "function" ? customizer : undefined;
    var result = customizer ? customizer(value, other) : undefined;
    return result === undefined ? baseIsEqual(value, other, undefined, customizer) : !!result;
}
function isFunction(value) {
    if (!isObject(value)) {
        return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
}
function isObjectLike(value) {
    return value != null && typeof value == "object";
}
var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
function isNil(value) {
    return value == null;
}
function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
        return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
function isString(value) {
    return typeof value == "string" || (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}
function isSymbol(value) {
    return typeof value == "symbol" || (isObjectLike(value) && baseGetTag(value) == symbolTag);
}
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
function toArray(value) {
    if (!value) {
        return [];
    }
    if (isArrayLike(value)) {
        return isString(value) ? stringToArray(value) : copyArray(value);
    }
    if (symIterator && value[symIterator]) {
        return iteratorToArray(value[symIterator]());
    }
    var tag = getTag(value), func = tag == mapTag ? mapToArray : (tag == setTag ? setToArray : values);
    return func(value);
}
function toFinite(value) {
    if (!value) {
        return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
}
function toInteger(value) {
    var result = toFinite(value), remainder = result % 1;
    return result === result ? (remainder ? result - remainder : result) : 0;
}
function toNumber(value) {
    if (typeof value == "number") {
        return value;
    }
    if (isSymbol(value)) {
        return NAN;
    }
    if (isObject(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject(other) ? (other + "") : other;
    }
    if (typeof value != "string") {
        return value === 0 ? value : +value;
    }
    value = baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value)) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : (reIsBadHex.test(value) ? NAN : +value);
}
function toPlainObject(value) {
    return copyObject(value, keysIn(value));
}
function toString(value) {
    return value == null ? "" : baseToString(value);
}
function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
}
function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
}
function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}
var merge = createAssigner(function (object, source, srcIndex) {
    baseMerge(object, source, srcIndex);
});
var mergeWith = createAssigner(function (object, source, srcIndex, customizer) {
    baseMerge(object, source, srcIndex, customizer);
});
var omit = flatRest(function (object, paths) {
    var result = {};
    if (object == null) {
        return result;
    }
    var isDeep = false;
    paths = arrayMap(paths, function (path) {
        path = castPath(path, object);
        isDeep || (isDeep = path.length > 1);
        return path;
    });
    copyObject(object, getAllKeysIn(object), result);
    if (isDeep) {
        result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
    }
    var length = paths.length;
    while (length--) {
        baseUnset(result, paths[length]);
    }
    return result;
});
var pick = flatRest(function (object, paths) {
    return object == null ? {} : basePick(object, paths);
});
function pickBy(object, predicate) {
    if (object == null) {
        return {};
    }
    var props = arrayMap(getAllKeysIn(object), function (prop) {
        return [prop];
    });
    predicate = getIteratee(predicate);
    return basePickBy(object, props, function (value, path) {
        return predicate(value, path[0]);
    });
}
function values(object) {
    return object == null ? [] : baseValues(object, keys(object));
}
function constant(value) {
    return function () {
        return value;
    };
}
function identity(value) {
    return value;
}
function iteratee(func) {
    return baseIteratee(typeof func == "function" ? func : baseClone(func, CLONE_DEEP_FLAG));
}
function noop() {
}
function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}
function stubArray() {
    return [];
}
function stubFalse() {
    return false;
}
function max(array) {
    return (array && array.length) ? baseExtremum(array, identity, baseGt) : undefined;
}
function min(array) {
    return (array && array.length) ? baseExtremum(array, identity, baseLt) : undefined;
}
lodash.castArray = castArray;
lodash.compact = compact;
lodash.constant = constant;
lodash.curry = curry;
lodash.debounce = debounce;
lodash.difference = difference;
lodash.differenceBy = differenceBy;
lodash.differenceWith = differenceWith;
lodash.flatMap = flatMap;
lodash.flatMapDeep = flatMapDeep;
lodash.flatMapDepth = flatMapDepth;
lodash.flatten = flatten;
lodash.flattenDeep = flattenDeep;
lodash.flattenDepth = flattenDepth;
lodash.intersection = intersection;
lodash.intersectionBy = intersectionBy;
lodash.intersectionWith = intersectionWith;
lodash.iteratee = iteratee;
lodash.keys = keys;
lodash.keysIn = keysIn;
lodash.map = map;
lodash.memoize = memoize;
lodash.merge = merge;
lodash.mergeWith = mergeWith;
lodash.omit = omit;
lodash.pick = pick;
lodash.pickBy = pickBy;
lodash.property = property;
lodash.throttle = throttle;
lodash.toArray = toArray;
lodash.toPlainObject = toPlainObject;
lodash.union = union;
lodash.unionBy = unionBy;
lodash.unionWith = unionWith;
lodash.uniq = uniq;
lodash.uniqBy = uniqBy;
lodash.uniqWith = uniqWith;
lodash.values = values;
lodash.without = without;
lodash.xor = xor;
lodash.xorBy = xorBy;
lodash.xorWith = xorWith;
lodash.zipObject = zipObject;
lodash.zipObjectDeep = zipObjectDeep;
lodash.eq = eq;
lodash.get = get;
lodash.hasIn = hasIn;
lodash.identity = identity;
lodash.isArguments = isArguments;
lodash.isArray = isArray;
lodash.isArrayLike = isArrayLike;
lodash.isArrayLikeObject = isArrayLikeObject;
lodash.isBuffer = isBuffer;
lodash.isEqual = isEqual;
lodash.isEqualWith = isEqualWith;
lodash.isFunction = isFunction;
lodash.isLength = isLength;
lodash.isMap = isMap;
lodash.isNil = isNil;
lodash.isObject = isObject;
lodash.isObjectLike = isObjectLike;
lodash.isPlainObject = isPlainObject;
lodash.isSet = isSet;
lodash.isString = isString;
lodash.isSymbol = isSymbol;
lodash.isTypedArray = isTypedArray;
lodash.last = last;
lodash.max = max;
lodash.min = min;
lodash.stubArray = stubArray;
lodash.stubFalse = stubFalse;
lodash.noop = noop;
lodash.now = now;
lodash.toFinite = toFinite;
lodash.toInteger = toInteger;
lodash.toNumber = toNumber;
lodash.toString = toString;
lodash.VERSION = VERSION;
curry.placeholder = lodash;