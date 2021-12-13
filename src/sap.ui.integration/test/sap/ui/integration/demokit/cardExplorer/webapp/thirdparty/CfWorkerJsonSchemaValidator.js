/* eslint-disable */
/* @cfworker/json-schema 1.6.8 */
(function () {
	'use strict';

	function ownKeys(object, enumerableOnly) {
		var keys = Object.keys(object);

		if (Object.getOwnPropertySymbols) {
			var symbols = Object.getOwnPropertySymbols(object);

			if (enumerableOnly) {
				symbols = symbols.filter(function (sym) {
					return Object.getOwnPropertyDescriptor(object, sym).enumerable;
				});
			}

			keys.push.apply(keys, symbols);
		}

		return keys;
	}

	function _objectSpread2(target) {
		for (var i = 1; i < arguments.length; i++) {
			var source = arguments[i] != null ? arguments[i] : {};

			if (i % 2) {
				ownKeys(Object(source), true).forEach(function (key) {
					_defineProperty(target, key, source[key]);
				});
			} else if (Object.getOwnPropertyDescriptors) {
				Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
			} else {
				ownKeys(Object(source)).forEach(function (key) {
					Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
				});
			}
		}

		return target;
	}

	function _typeof(obj) {
		"@babel/helpers - typeof";

		if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
			_typeof = function (obj) {
				return typeof obj;
			};
		} else {
			_typeof = function (obj) {
				return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
			};
		}

		return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	function _defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}

	function _createClass(Constructor, protoProps, staticProps) {
		if (protoProps) _defineProperties(Constructor.prototype, protoProps);
		if (staticProps) _defineProperties(Constructor, staticProps);
		return Constructor;
	}

	function _defineProperty(obj, key, value) {
		if (key in obj) {
			Object.defineProperty(obj, key, {
				value: value,
				enumerable: true,
				configurable: true,
				writable: true
			});
		} else {
			obj[key] = value;
		}

		return obj;
	}

	function _toArray(arr) {
		return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
	}

	function _toConsumableArray(arr) {
		return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}

	function _arrayWithoutHoles(arr) {
		if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _arrayWithHoles(arr) {
		if (Array.isArray(arr)) return arr;
	}

	function _iterableToArray(iter) {
		if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
	}

	function _unsupportedIterableToArray(o, minLen) {
		if (!o) return;
		if (typeof o === "string") return _arrayLikeToArray(o, minLen);
		var n = Object.prototype.toString.call(o).slice(8, -1);
		if (n === "Object" && o.constructor) n = o.constructor.name;
		if (n === "Map" || n === "Set") return Array.from(o);
		if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
		if (len == null || len > arr.length) len = arr.length;

		for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

		return arr2;
	}

	function _nonIterableSpread() {
		throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _nonIterableRest() {
		throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _createForOfIteratorHelper(o, allowArrayLike) {
		var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];

		if (!it) {
			if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
				if (it) o = it;
				var i = 0;

				var F = function () { };

				return {
					s: F,
					n: function () {
						if (i >= o.length) return {
							done: true
						};
						return {
							done: false,
							value: o[i++]
						};
					},
					e: function (e) {
						throw e;
					},
					f: F
				};
			}

			throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
		}

		var normalCompletion = true,
			didErr = false,
			err;
		return {
			s: function () {
				it = it.call(o);
			},
			n: function () {
				var step = it.next();
				normalCompletion = step.done;
				return step;
			},
			e: function (e) {
				didErr = true;
				err = e;
			},
			f: function () {
				try {
					if (!normalCompletion && it.return != null) it.return();
				} finally {
					if (didErr) throw err;
				}
			}
		};
	}

	function deepCompareStrict(a, b) {
		var typeofa = _typeof(a);

		if (typeofa !== _typeof(b)) {
			return false;
		}

		if (Array.isArray(a)) {
			if (!Array.isArray(b)) {
				return false;
			}

			var length = a.length;

			if (length !== b.length) {
				return false;
			}

			for (var i = 0; i < length; i++) {
				if (!deepCompareStrict(a[i], b[i])) {
					return false;
				}
			}

			return true;
		}

		if (typeofa === 'object') {
			if (!a || !b) {
				return a === b;
			}

			var aKeys = Object.keys(a);
			var bKeys = Object.keys(b);
			var _length = aKeys.length;

			if (_length !== bKeys.length) {
				return false;
			}

			for (var _i = 0, _aKeys = aKeys; _i < _aKeys.length; _i++) {
				var k = _aKeys[_i];

				if (!deepCompareStrict(a[k], b[k])) {
					return false;
				}
			}

			return true;
		}

		return a === b;
	}

	function encodePointer(p) {
		return encodeURI(escapePointer(p));
	}
	function escapePointer(p) {
		return p.replace(/~/g, '~0').replace(/\//g, '~1');
	}

	var schemaArrayKeyword = {
		items: true,
		allOf: true,
		anyOf: true,
		oneOf: true
	};
	var schemaMapKeyword = {
		$defs: true,
		definitions: true,
		properties: true,
		patternProperties: true,
		dependentSchemas: true
	};
	var ignoredKeyword = {
		id: true,
		$id: true,
		$ref: true,
		$schema: true,
		$anchor: true,
		$vocabulary: true,
		$comment: true,
		"default": true,
		"enum": true,
		"const": true,
		required: true,
		type: true,
		maximum: true,
		minimum: true,
		exclusiveMaximum: true,
		exclusiveMinimum: true,
		multipleOf: true,
		maxLength: true,
		minLength: true,
		pattern: true,
		format: true,
		maxItems: true,
		minItems: true,
		uniqueItems: true,
		maxProperties: true,
		minProperties: true
	};
	var initialBaseURI = typeof self !== 'undefined' && self.location ? new URL(self.location.origin + self.location.pathname + location.search) : new URL('https://github.com/cfworker');
	function dereference(schema) {
		var lookup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Object.create(null);
		var baseURI = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : initialBaseURI;
		var basePointer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

		if (schema && _typeof(schema) === 'object' && !Array.isArray(schema)) {
			var id = schema.$id || schema.id;

			if (id) {
				var url = new URL(id, baseURI);

				if (url.hash.length > 1) {
					lookup[url.href] = schema;
				} else {
					url.hash = '';

					if (basePointer === '') {
						baseURI = url;
					} else {
						dereference(schema, lookup, baseURI);
					}
				}
			}
		} else if (schema !== true && schema !== false) {
			return lookup;
		}

		var schemaURI = baseURI.href + (basePointer ? '#' + basePointer : '');

		if (lookup[schemaURI] !== undefined) {
			throw new Error("Duplicate schema URI \"".concat(schemaURI, "\"."));
		}

		lookup[schemaURI] = schema;

		if (schema === true || schema === false) {
			return lookup;
		}

		if (schema.__absolute_uri__ === undefined) {
			Object.defineProperty(schema, '__absolute_uri__', {
				enumerable: false,
				value: schemaURI
			});
		}

		if (schema.$ref && schema.__absolute_ref__ === undefined) {
			var _url = new URL(schema.$ref, baseURI);

			_url.hash = _url.hash;
			Object.defineProperty(schema, '__absolute_ref__', {
				enumerable: false,
				value: _url.href
			});
		}

		if (schema.$anchor) {
			var _url2 = new URL('#' + schema.$anchor, baseURI);

			lookup[_url2.href] = schema;
		}

		for (var key in schema) {
			if (ignoredKeyword[key]) {
				continue;
			}

			var keyBase = "".concat(basePointer, "/").concat(encodePointer(key));
			var subSchema = schema[key];

			if (Array.isArray(subSchema)) {
				if (schemaArrayKeyword[key]) {
					var length = subSchema.length;

					for (var i = 0; i < length; i++) {
						dereference(subSchema[i], lookup, baseURI, "".concat(keyBase, "/").concat(i));
					}
				}
			} else if (schemaMapKeyword[key]) {
				for (var subKey in subSchema) {
					dereference(subSchema[subKey], lookup, baseURI, "".concat(keyBase, "/").concat(encodePointer(subKey)));
				}
			} else {
				dereference(subSchema, lookup, baseURI, keyBase);
			}
		}

		return lookup;
	}

	var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
	var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
	var HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
	var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
	var URL_ = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+\x2D?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+\x2D?)*(?:[0-9KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[KSa-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:(?![\t-\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF])[\s\S])*)?$/i;
	var UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
	var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
	var JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
	var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
	var FASTDATE = /^\d\d\d\d-[0-1]\d-[0-3]\d$/;
	var FASTTIME = /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i;
	var FASTDATETIME = /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i;
	var FASTURIREFERENCE = /^(?:(?:[a-z][a-z0-9+-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i;

	var EMAIL = function EMAIL(input) {
		if (input[0] === '"') return false;

		var _input$split = input.split('@'),
			_input$split2 = _toArray(_input$split),
			name = _input$split2[0],
			host = _input$split2[1],
			rest = _input$split2.slice(2);

		if (!name || !host || rest.length !== 0 || name.length > 64 || host.length > 253) return false;
		if (name[0] === '.' || name.endsWith('.') || name.includes('..')) return false;
		if (!/^[a-z0-9.-]+$/i.test(host) || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(name)) return false;
		return host.split('.').every(function (part) {
			return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(part);
		});
	};

	var IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
	var IPV6 = /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i;

	var DURATION = function DURATION(input) {
		return input.length > 1 && input.length < 80 && (/^P\d+([.,]\d+)?W$/.test(input) || /^P[\dYMDTHS]*(\d[.,]\d+)?[YMDHS]$/.test(input) && /^P([.,\d]+Y)?([.,\d]+M)?([.,\d]+D)?(T([.,\d]+H)?([.,\d]+M)?([.,\d]+S)?)?$/.test(input));
	};

	function bind(r) {
		return r.test.bind(r);
	}

	var fullFormat = {
		date: date,
		time: time.bind(undefined, false),
		'date-time': date_time,
		duration: DURATION,
		uri: uri,
		'uri-reference': bind(URIREF),
		'uri-template': bind(URITEMPLATE),
		url: bind(URL_),
		email: EMAIL,
		hostname: bind(HOSTNAME),
		ipv4: bind(IPV4),
		ipv6: bind(IPV6),
		regex: regex,
		uuid: bind(UUID),
		'json-pointer': bind(JSON_POINTER),
		'json-pointer-uri-fragment': bind(JSON_POINTER_URI_FRAGMENT),
		'relative-json-pointer': bind(RELATIVE_JSON_POINTER)
	};
	var fastFormat = _objectSpread2(_objectSpread2({}, fullFormat), {}, {
		date: bind(FASTDATE),
		time: bind(FASTTIME),
		'date-time': bind(FASTDATETIME),
		'uri-reference': bind(FASTURIREFERENCE)
	});

	function isLeapYear(year) {
		return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	}

	function date(str) {
		var matches = str.match(DATE);
		if (!matches) return false;
		var year = +matches[1];
		var month = +matches[2];
		var day = +matches[3];
		return month >= 1 && month <= 12 && day >= 1 && day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
	}

	function time(full, str) {
		var matches = str.match(TIME);
		if (!matches) return false;
		var hour = +matches[1];
		var minute = +matches[2];
		var second = +matches[3];
		var timeZone = !!matches[5];
		return (hour <= 23 && minute <= 59 && second <= 59 || hour == 23 && minute == 59 && second == 60) && (!full || timeZone);
	}

	var DATE_TIME_SEPARATOR = /t|\s/i;

	function date_time(str) {
		var dateTime = str.split(DATE_TIME_SEPARATOR);
		return dateTime.length == 2 && date(dateTime[0]) && time(true, dateTime[1]);
	}

	var NOT_URI_FRAGMENT = /\/|:/;
	var URI_PATTERN = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;

	function uri(str) {
		return NOT_URI_FRAGMENT.test(str) && URI_PATTERN.test(str);
	}

	var Z_ANCHOR = /[^\\]\\Z/;

	function regex(str) {
		if (Z_ANCHOR.test(str)) return false;

		try {
			new RegExp(str);
			return true;
		} catch (e) {
			return false;
		}
	}

	function ucs2length(s) {
		var result = 0;
		var length = s.length;
		var index = 0;
		var charCode;

		while (index < length) {
			result++;
			charCode = s.charCodeAt(index++);

			if (charCode >= 0xd800 && charCode <= 0xdbff && index < length) {
				charCode = s.charCodeAt(index);

				if ((charCode & 0xfc00) == 0xdc00) {
					index++;
				}
			}
		}

		return result;
	}

	function validate(instance, schema) {
		var draft = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '2019-09';
		var lookup = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : dereference(schema);
		var shortCircuit = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
		var recursiveAnchor = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
		var instanceLocation = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : '#';
		var schemaLocation = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : '#';
		var evaluated = arguments.length > 8 ? arguments[8] : undefined;

		if (schema === true) {
			return {
				valid: true,
				errors: []
			};
		}

		if (schema === false) {
			return {
				valid: false,
				errors: [{
					instanceLocation: instanceLocation,
					keyword: 'false',
					keywordLocation: instanceLocation,
					error: 'False boolean schema.'
				}]
			};
		}

		var rawInstanceType = _typeof(instance);

		var instanceType;

		switch (rawInstanceType) {
			case 'boolean':
			case 'number':
			case 'string':
				instanceType = rawInstanceType;
				break;

			case 'object':
				if (instance === null) {
					instanceType = 'null';
				} else if (Array.isArray(instance)) {
					instanceType = 'array';
					evaluated = evaluated || {
						items: -1
					};
				} else {
					instanceType = 'object';
					evaluated = evaluated || {
						properties: Object.create(null)
					};
				}

				break;

			default:
				throw new Error("Instances of \"".concat(rawInstanceType, "\" type are not supported."));
		}

		var $ref = schema.$ref,
			$recursiveRef = schema.$recursiveRef,
			$recursiveAnchor = schema.$recursiveAnchor,
			$type = schema.type,
			$const = schema["const"],
			$enum = schema["enum"],
			$required = schema.required,
			$not = schema.not,
			$anyOf = schema.anyOf,
			$allOf = schema.allOf,
			$oneOf = schema.oneOf,
			$if = schema["if"],
			$then = schema.then,
			$else = schema["else"],
			$format = schema.format,
			$properties = schema.properties,
			$patternProperties = schema.patternProperties,
			$additionalProperties = schema.additionalProperties,
			$unevaluatedProperties = schema.unevaluatedProperties,
			$minProperties = schema.minProperties,
			$maxProperties = schema.maxProperties,
			$propertyNames = schema.propertyNames,
			$dependentRequired = schema.dependentRequired,
			$dependentSchemas = schema.dependentSchemas,
			$dependencies = schema.dependencies,
			$items = schema.items,
			$additionalItems = schema.additionalItems,
			$unevaluatedItems = schema.unevaluatedItems,
			$contains = schema.contains,
			$minContains = schema.minContains,
			$maxContains = schema.maxContains,
			$minItems = schema.minItems,
			$maxItems = schema.maxItems,
			$uniqueItems = schema.uniqueItems,
			$minimum = schema.minimum,
			$maximum = schema.maximum,
			$exclusiveMinimum = schema.exclusiveMinimum,
			$exclusiveMaximum = schema.exclusiveMaximum,
			$multipleOf = schema.multipleOf,
			$minLength = schema.minLength,
			$maxLength = schema.maxLength,
			$pattern = schema.pattern,
			__absolute_ref__ = schema.__absolute_ref__;
		var errors = [];

		if ($ref !== undefined) {
			var uri = __absolute_ref__ || $ref;
			var refSchema = lookup[uri];

			if (refSchema === undefined) {
				var message = "Unresolved $ref \"".concat($ref, "\".");

				if (__absolute_ref__ && __absolute_ref__ !== $ref) {
					message += "  Absolute URI \"".concat(__absolute_ref__, "\".");
				}

				message += "\nKnown schemas:\n- ".concat(Object.keys(lookup).join('\n- '));
				throw new Error(message);
			}

			var keywordLocation = "".concat(schemaLocation, "/$ref");
			var result = validate(instance, refSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated);

			if (!result.valid) {
				errors.push.apply(errors, [{
					instanceLocation: instanceLocation,
					keyword: '$ref',
					keywordLocation: keywordLocation,
					error: 'A subschema had errors.'
				}].concat(_toConsumableArray(result.errors)));
			}

			if (draft === '4' || draft === '7') {
				return {
					valid: errors.length === 0,
					errors: errors
				};
			}
		}

		if ($recursiveAnchor === true && recursiveAnchor === null) {
			recursiveAnchor = schema;
		}

		if ($recursiveRef === '#') {
			var _keywordLocation = "".concat(schemaLocation, "/$recursiveRef");

			var _result = validate(instance, recursiveAnchor === null ? schema : recursiveAnchor, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, _keywordLocation, evaluated);

			if (!_result.valid) {
				errors.push.apply(errors, [{
					instanceLocation: instanceLocation,
					keyword: '$recursiveRef',
					keywordLocation: _keywordLocation,
					error: 'A subschema had errors.'
				}].concat(_toConsumableArray(_result.errors)));
			}
		}

		if (Array.isArray($type)) {
			var length = $type.length;
			var valid = false;

			for (var i = 0; i < length; i++) {
				if (instanceType === $type[i] || $type[i] === 'integer' && instanceType === 'number' && instance % 1 === 0 && instance === instance) {
					valid = true;
					break;
				}
			}

			if (!valid) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'type',
					keywordLocation: "".concat(schemaLocation, "/type"),
					error: "Instance type \"".concat(instanceType, "\" is invalid. Expected \"").concat($type.join('", "'), "\".")
				});
			}
		} else if ($type === 'integer') {
			if (instanceType !== 'number' || instance % 1 || instance !== instance) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'type',
					keywordLocation: "".concat(schemaLocation, "/type"),
					error: "Instance type \"".concat(instanceType, "\" is invalid. Expected \"").concat($type, "\".")
				});
			}
		} else if ($type !== undefined && instanceType !== $type) {
			errors.push({
				instanceLocation: instanceLocation,
				keyword: 'type',
				keywordLocation: "".concat(schemaLocation, "/type"),
				error: "Instance type \"".concat(instanceType, "\" is invalid. Expected \"").concat($type, "\".")
			});
		}

		if ($const !== undefined) {
			if (instanceType === 'object' || instanceType === 'array') {
				if (!deepCompareStrict(instance, $const)) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'const',
						keywordLocation: "".concat(schemaLocation, "/const"),
						error: "Instance does not match ".concat(JSON.stringify($const), ".")
					});
				}
			} else if (instance !== $const) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'const',
					keywordLocation: "".concat(schemaLocation, "/const"),
					error: "Instance does not match ".concat(JSON.stringify($const), ".")
				});
			}
		}

		if ($enum !== undefined) {
			if (instanceType === 'object' || instanceType === 'array') {
				if (!$enum.some(function (value) {
					return deepCompareStrict(instance, value);
				})) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'enum',
						keywordLocation: "".concat(schemaLocation, "/enum"),
						error: "Instance does not match any of ".concat(JSON.stringify($enum), ".")
					});
				}
			} else if (!$enum.some(function (value) {
				return instance === value;
			})) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'enum',
					keywordLocation: "".concat(schemaLocation, "/enum"),
					error: "Instance does not match any of ".concat(JSON.stringify($enum), ".")
				});
			}
		}

		if ($not !== undefined) {
			var _keywordLocation2 = "".concat(schemaLocation, "/not");

			var _result2 = validate(instance, $not, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, _keywordLocation2);

			if (_result2.valid) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'not',
					keywordLocation: _keywordLocation2,
					error: 'Instance matched "not" schema.'
				});
			}
		}

		if ($anyOf !== undefined) {
			var _keywordLocation3 = "".concat(schemaLocation, "/anyOf");

			var errorsLength = errors.length;
			var anyValid = false;

			for (var _i = 0; _i < $anyOf.length; _i++) {
				var subSchema = $anyOf[_i];

				var _result3 = validate(instance, subSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, "".concat(_keywordLocation3, "/").concat(_i), evaluated);

				errors.push.apply(errors, _toConsumableArray(_result3.errors));
				anyValid = anyValid || _result3.valid;
			}

			if (anyValid) {
				errors.length = errorsLength;
			} else {
				errors.splice(errorsLength, 0, {
					instanceLocation: instanceLocation,
					keyword: 'anyOf',
					keywordLocation: _keywordLocation3,
					error: 'Instance does not match any subschemas.'
				});
			}
		}

		if ($allOf !== undefined) {
			var _keywordLocation4 = "".concat(schemaLocation, "/allOf");

			var _errorsLength = errors.length;
			var allValid = true;

			for (var _i2 = 0; _i2 < $allOf.length; _i2++) {
				var _subSchema = $allOf[_i2];

				var _result4 = validate(instance, _subSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, "".concat(_keywordLocation4, "/").concat(_i2), evaluated);

				errors.push.apply(errors, _toConsumableArray(_result4.errors));
				allValid = allValid && _result4.valid;
			}

			if (allValid) {
				errors.length = _errorsLength;
			} else {
				errors.splice(_errorsLength, 0, {
					instanceLocation: instanceLocation,
					keyword: 'allOf',
					keywordLocation: _keywordLocation4,
					error: "Instance does not match every subschema."
				});
			}
		}

		if ($oneOf !== undefined) {
			var _keywordLocation5 = "".concat(schemaLocation, "/oneOf");

			var _errorsLength2 = errors.length;
			var matches = $oneOf.filter(function (subSchema, i) {
				var result = validate(instance, subSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, "".concat(_keywordLocation5, "/").concat(i), evaluated);
				errors.push.apply(errors, _toConsumableArray(result.errors));
				return result.valid;
			}).length;

			if (matches === 1) {
				errors.length = _errorsLength2;
			} else {
				errors.splice(_errorsLength2, 0, {
					instanceLocation: instanceLocation,
					keyword: 'oneOf',
					keywordLocation: _keywordLocation5,
					error: "Instance does not match exactly one subschema (".concat(matches, " matches).")
				});
			}
		}

		if ($if !== undefined) {
			var _keywordLocation6 = "".concat(schemaLocation, "/if");

			var conditionResult = validate(instance, $if, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, _keywordLocation6, evaluated).valid;

			if (conditionResult) {
				if ($then !== undefined) {
					var thenResult = validate(instance, $then, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, "".concat(schemaLocation, "/then"), evaluated);

					if (!thenResult.valid) {
						errors.push.apply(errors, [{
							instanceLocation: instanceLocation,
							keyword: 'if',
							keywordLocation: _keywordLocation6,
							error: "Instance does not match \"then\" schema."
						}].concat(_toConsumableArray(thenResult.errors)));
					}
				}
			} else if ($else !== undefined) {
				var elseResult = validate(instance, $else, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, "".concat(schemaLocation, "/else"), evaluated);

				if (!elseResult.valid) {
					errors.push.apply(errors, [{
						instanceLocation: instanceLocation,
						keyword: 'if',
						keywordLocation: _keywordLocation6,
						error: "Instance does not match \"else\" schema."
					}].concat(_toConsumableArray(elseResult.errors)));
				}
			}
		}

		if (instanceType === 'object') {
			if ($required !== undefined) {
				var _iterator = _createForOfIteratorHelper($required),
					_step;

				try {
					for (_iterator.s(); !(_step = _iterator.n()).done;) {
						var key = _step.value;

						if (!(key in instance)) {
							errors.push({
								instanceLocation: instanceLocation,
								keyword: 'required',
								keywordLocation: "".concat(schemaLocation, "/required"),
								error: "Instance does not have required property \"".concat(key, "\".")
							});
						}
					}
				} catch (err) {
					_iterator.e(err);
				} finally {
					_iterator.f();
				}
			}

			var keys = Object.keys(instance);

			if ($minProperties !== undefined && keys.length < $minProperties) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'minProperties',
					keywordLocation: "".concat(schemaLocation, "/minProperties"),
					error: "Instance does not have at least ".concat($minProperties, " properties.")
				});
			}

			if ($maxProperties !== undefined && keys.length > $maxProperties) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'maxProperties',
					keywordLocation: "".concat(schemaLocation, "/maxProperties"),
					error: "Instance does not have at least ".concat($maxProperties, " properties.")
				});
			}

			if ($propertyNames !== undefined) {
				var _keywordLocation7 = "".concat(schemaLocation, "/propertyNames");

				for (var _key in instance) {
					var subInstancePointer = "".concat(instanceLocation, "/").concat(encodePointer(_key));

					var _result5 = validate(_key, $propertyNames, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, _keywordLocation7);

					if (!_result5.valid) {
						errors.push.apply(errors, [{
							instanceLocation: instanceLocation,
							keyword: 'propertyNames',
							keywordLocation: _keywordLocation7,
							error: "Property name \"".concat(_key, "\" does not match schema.")
						}].concat(_toConsumableArray(_result5.errors)));
					}
				}
			}

			if ($dependentRequired !== undefined) {
				var _keywordLocation8 = "".concat(schemaLocation, "/dependantRequired");

				for (var _key2 in $dependentRequired) {
					if (_key2 in instance) {
						var required = $dependentRequired[_key2];

						var _iterator2 = _createForOfIteratorHelper(required),
							_step2;

						try {
							for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
								var dependantKey = _step2.value;

								if (!(dependantKey in instance)) {
									errors.push({
										instanceLocation: instanceLocation,
										keyword: 'dependentRequired',
										keywordLocation: _keywordLocation8,
										error: "Instance has \"".concat(_key2, "\" but does not have \"").concat(dependantKey, "\".")
									});
								}
							}
						} catch (err) {
							_iterator2.e(err);
						} finally {
							_iterator2.f();
						}
					}
				}
			}

			if ($dependentSchemas !== undefined) {
				for (var _key3 in $dependentSchemas) {
					var _keywordLocation9 = "".concat(schemaLocation, "/dependentSchemas");

					if (_key3 in instance) {
						var _result6 = validate(instance, $dependentSchemas[_key3], draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, "".concat(_keywordLocation9, "/").concat(encodePointer(_key3)), evaluated);

						if (!_result6.valid) {
							errors.push.apply(errors, [{
								instanceLocation: instanceLocation,
								keyword: 'dependentSchemas',
								keywordLocation: _keywordLocation9,
								error: "Instance has \"".concat(_key3, "\" but does not match dependant schema.")
							}].concat(_toConsumableArray(_result6.errors)));
						}
					}
				}
			}

			if ($dependencies !== undefined) {
				var _keywordLocation10 = "".concat(schemaLocation, "/dependencies");

				for (var _key4 in $dependencies) {
					if (_key4 in instance) {
						var propsOrSchema = $dependencies[_key4];

						if (Array.isArray(propsOrSchema)) {
							var _iterator3 = _createForOfIteratorHelper(propsOrSchema),
								_step3;

							try {
								for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
									var _dependantKey = _step3.value;

									if (!(_dependantKey in instance)) {
										errors.push({
											instanceLocation: instanceLocation,
											keyword: 'dependencies',
											keywordLocation: _keywordLocation10,
											error: "Instance has \"".concat(_key4, "\" but does not have \"").concat(_dependantKey, "\".")
										});
									}
								}
							} catch (err) {
								_iterator3.e(err);
							} finally {
								_iterator3.f();
							}
						} else {
							var _result7 = validate(instance, propsOrSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, "".concat(_keywordLocation10, "/").concat(encodePointer(_key4)));

							if (!_result7.valid) {
								errors.push.apply(errors, [{
									instanceLocation: instanceLocation,
									keyword: 'dependencies',
									keywordLocation: _keywordLocation10,
									error: "Instance has \"".concat(_key4, "\" but does not match dependant schema.")
								}].concat(_toConsumableArray(_result7.errors)));
							}
						}
					}
				}
			}

			var thisEvaluated = Object.create(null);

			if (!evaluated || !evaluated.properties) {
				throw new Error('evaluated.properties should be an object');
			}

			var stop = false;

			if ($properties !== undefined) {
				var _keywordLocation11 = "".concat(schemaLocation, "/properties");

				for (var _key5 in $properties) {
					if (!(_key5 in instance)) {
						continue;
					}

					var _subInstancePointer = "".concat(instanceLocation, "/").concat(encodePointer(_key5));

					var _result8 = validate(instance[_key5], $properties[_key5], draft, lookup, shortCircuit, recursiveAnchor, _subInstancePointer, "".concat(_keywordLocation11, "/").concat(encodePointer(_key5)));

					if (_result8.valid) {
						evaluated.properties[_key5] = thisEvaluated[_key5] = true;
					} else {
						stop = shortCircuit;
						errors.push.apply(errors, [{
							instanceLocation: instanceLocation,
							keyword: 'properties',
							keywordLocation: _keywordLocation11,
							error: "Property \"".concat(_key5, "\" does not match schema.")
						}].concat(_toConsumableArray(_result8.errors)));
						if (stop) break;
					}
				}
			}

			if (!stop && $patternProperties !== undefined) {
				var _keywordLocation12 = "".concat(schemaLocation, "/patternProperties");

				for (var pattern in $patternProperties) {
					var regex = new RegExp(pattern);
					var _subSchema2 = $patternProperties[pattern];

					for (var _key6 in instance) {
						if (!regex.test(_key6)) {
							continue;
						}

						var _subInstancePointer2 = "".concat(instanceLocation, "/").concat(encodePointer(_key6));

						var _result9 = validate(instance[_key6], _subSchema2, draft, lookup, shortCircuit, recursiveAnchor, _subInstancePointer2, "".concat(_keywordLocation12, "/").concat(encodePointer(pattern)));

						if (_result9.valid) {
							evaluated.properties[_key6] = thisEvaluated[_key6] = true;
						} else {
							stop = shortCircuit;
							errors.push.apply(errors, [{
								instanceLocation: instanceLocation,
								keyword: 'patternProperties',
								keywordLocation: _keywordLocation12,
								error: "Property \"".concat(_key6, "\" matches pattern \"").concat(pattern, "\" but does not match associated schema.")
							}].concat(_toConsumableArray(_result9.errors)));
						}
					}
				}
			}

			if (!stop && $additionalProperties !== undefined) {
				var _keywordLocation13 = "".concat(schemaLocation, "/additionalProperties");

				for (var _key7 in instance) {
					if (thisEvaluated[_key7]) {
						continue;
					}

					var _subInstancePointer3 = "".concat(instanceLocation, "/").concat(encodePointer(_key7));

					var _result10 = validate(instance[_key7], $additionalProperties, draft, lookup, shortCircuit, recursiveAnchor, _subInstancePointer3, _keywordLocation13);

					if (_result10.valid) {
						evaluated.properties[_key7] = true;
					} else {
						stop = shortCircuit;
						errors.push.apply(errors, [{
							instanceLocation: instanceLocation,
							keyword: 'additionalProperties',
							keywordLocation: _keywordLocation13,
							error: "Property \"".concat(_key7, "\" does not match additional properties schema.")
						}].concat(_toConsumableArray(_result10.errors)));
					}
				}
			} else if (!stop && $unevaluatedProperties !== undefined) {
				var _keywordLocation14 = "".concat(schemaLocation, "/unevaluatedProperties");

				for (var _key8 in instance) {
					if (!evaluated.properties[_key8]) {
						var _subInstancePointer4 = "".concat(instanceLocation, "/").concat(encodePointer(_key8));

						var _result11 = validate(instance[_key8], $unevaluatedProperties, draft, lookup, shortCircuit, recursiveAnchor, _subInstancePointer4, _keywordLocation14);

						if (_result11.valid) {
							evaluated.properties[_key8] = true;
						} else {
							errors.push.apply(errors, [{
								instanceLocation: instanceLocation,
								keyword: 'unevaluatedProperties',
								keywordLocation: _keywordLocation14,
								error: "Property \"".concat(_key8, "\" does not match unevaluated properties schema.")
							}].concat(_toConsumableArray(_result11.errors)));
						}
					}
				}
			}
		} else if (instanceType === 'array') {
			if ($maxItems !== undefined && instance.length > $maxItems) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'maxItems',
					keywordLocation: "".concat(schemaLocation, "/maxItems"),
					error: "Array has too many items (".concat(instance.length, " > ").concat($maxItems, ").")
				});
			}

			if ($minItems !== undefined && instance.length < $minItems) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'minItems',
					keywordLocation: "".concat(schemaLocation, "/minItems"),
					error: "Array has too few items (".concat(instance.length, " < ").concat($minItems, ").")
				});
			}

			if (!evaluated || evaluated.items === undefined) {
				throw new Error('evaluated.items should be a number');
			}

			var _length = instance.length;
			var _i3 = 0;
			var _stop = false;

			if ($items !== undefined) {
				var _keywordLocation15 = "".concat(schemaLocation, "/items");

				if (Array.isArray($items)) {
					var length2 = Math.min($items.length, _length);

					for (; _i3 < length2; _i3++) {
						var _result12 = validate(instance[_i3], $items[_i3], draft, lookup, shortCircuit, recursiveAnchor, "".concat(instanceLocation, "/").concat(_i3), "".concat(_keywordLocation15, "/").concat(_i3));

						if (!_result12.valid) {
							_stop = shortCircuit;
							errors.push.apply(errors, [{
								instanceLocation: instanceLocation,
								keyword: 'items',
								keywordLocation: _keywordLocation15,
								error: "Items did not match schema."
							}].concat(_toConsumableArray(_result12.errors)));
							if (_stop) break;
						}
					}
				} else {
					for (; _i3 < _length; _i3++) {
						var _result13 = validate(instance[_i3], $items, draft, lookup, shortCircuit, recursiveAnchor, "".concat(instanceLocation, "/").concat(_i3), _keywordLocation15);

						if (!_result13.valid) {
							_stop = shortCircuit;
							errors.push.apply(errors, [{
								instanceLocation: instanceLocation,
								keyword: 'items',
								keywordLocation: _keywordLocation15,
								error: "Items did not match schema."
							}].concat(_toConsumableArray(_result13.errors)));
							if (_stop) break;
						}
					}
				}

				evaluated.items = Math.max(_i3, evaluated.items);

				if (!_stop && $additionalItems !== undefined) {
					var _keywordLocation16 = "".concat(schemaLocation, "/additionalItems");

					for (; _i3 < _length; _i3++) {
						var _result14 = validate(instance[_i3], $additionalItems, draft, lookup, shortCircuit, recursiveAnchor, "".concat(instanceLocation, "/").concat(_i3), _keywordLocation16);

						if (!_result14.valid) {
							_stop = shortCircuit;
							errors.push.apply(errors, [{
								instanceLocation: instanceLocation,
								keyword: 'additionalItems',
								keywordLocation: _keywordLocation16,
								error: "Items did not match additional items schema."
							}].concat(_toConsumableArray(_result14.errors)));
						}
					}

					evaluated.items = Math.max(_i3, evaluated.items);
				}
			}

			if (!_stop && $unevaluatedItems !== undefined) {
				var _keywordLocation17 = "".concat(schemaLocation, "/unevaluatedItems");

				for (_i3 = Math.max(evaluated.items, 0); _i3 < _length; _i3++) {
					var _result15 = validate(instance[_i3], $unevaluatedItems, draft, lookup, shortCircuit, recursiveAnchor, "".concat(instanceLocation, "/").concat(_i3), _keywordLocation17);

					if (!_result15.valid) {
						errors.push.apply(errors, [{
							instanceLocation: instanceLocation,
							keyword: 'unevaluatedItems',
							keywordLocation: _keywordLocation17,
							error: "Items did not match unevaluated items schema."
						}].concat(_toConsumableArray(_result15.errors)));
					}
				}

				evaluated.items = Math.max(_i3, evaluated.items);
			}

			if ($contains !== undefined) {
				if (_length === 0 && $minContains === undefined) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'contains',
						keywordLocation: "".concat(schemaLocation, "/contains"),
						error: "Array is empty. It must contain at least one item matching the schema."
					});
				} else if ($minContains !== undefined && _length < $minContains) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'minContains',
						keywordLocation: "".concat(schemaLocation, "/minContains"),
						error: "Array has less items (".concat(_length, ") than minContains (").concat($minContains, ").")
					});
				} else {
					var _keywordLocation18 = "".concat(schemaLocation, "/contains");

					var _errorsLength3 = errors.length;
					var contained = 0;

					for (var _i4 = 0; _i4 < _length; _i4++) {
						var _result16 = validate(instance[_i4], $contains, draft, lookup, shortCircuit, recursiveAnchor, "".concat(instanceLocation, "/").concat(_i4), _keywordLocation18);

						if (_result16.valid) {
							contained++;

							if ($minContains === undefined && $maxContains === undefined) {
								break;
							}
						} else {
							errors.push.apply(errors, _toConsumableArray(_result16.errors));
						}
					}

					if (contained >= ($minContains || 0)) {
						errors.length = _errorsLength3;
					}

					if ($minContains === undefined && $maxContains === undefined && contained === 0) {
						errors.splice(_errorsLength3, 0, {
							instanceLocation: instanceLocation,
							keyword: 'contains',
							keywordLocation: _keywordLocation18,
							error: "Array does not contain item matching schema."
						});
					} else if ($minContains !== undefined && contained < $minContains) {
						errors.push({
							instanceLocation: instanceLocation,
							keyword: 'minContains',
							keywordLocation: "".concat(schemaLocation, "/minContains"),
							error: "Array must contain at least ".concat($minContains, " items matching schema. Only ").concat(contained, " items were found.")
						});
					} else if ($maxContains !== undefined && contained > $maxContains) {
						errors.push({
							instanceLocation: instanceLocation,
							keyword: 'maxContains',
							keywordLocation: "".concat(schemaLocation, "/maxContains"),
							error: "Array may contain at most ".concat($maxContains, " items matching schema. ").concat(contained, " items were found.")
						});
					}
				}
			}

			if ($uniqueItems) {
				for (var j = 0; j < _length; j++) {
					var a = instance[j];
					var ao = _typeof(a) === 'object' && a !== null;

					for (var k = 0; k < _length; k++) {
						if (j === k) {
							continue;
						}

						var b = instance[k];
						var bo = _typeof(b) === 'object' && b !== null;

						if (a === b || ao && bo && deepCompareStrict(a, b)) {
							errors.push({
								instanceLocation: instanceLocation,
								keyword: 'uniqueItems',
								keywordLocation: "".concat(schemaLocation, "/uniqueItems"),
								error: "Duplicate items at indexes ".concat(j, " and ").concat(k, ".")
							});
							j = Number.MAX_SAFE_INTEGER;
							k = Number.MAX_SAFE_INTEGER;
						}
					}
				}
			}
		} else if (instanceType === 'number') {
			if (draft === '4') {
				if ($minimum !== undefined && ($exclusiveMinimum === true && instance <= $minimum || instance < $minimum)) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'minimum',
						keywordLocation: "".concat(schemaLocation, "/minimum"),
						error: "".concat(instance, " is less than ").concat($exclusiveMinimum ? 'or equal to ' : '', " ").concat($minimum, ".")
					});
				}

				if ($maximum !== undefined && ($exclusiveMaximum === true && instance >= $maximum || instance > $maximum)) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'maximum',
						keywordLocation: "".concat(schemaLocation, "/maximum"),
						error: "".concat(instance, " is greater than ").concat($exclusiveMaximum ? 'or equal to ' : '', " ").concat($maximum, ".")
					});
				}
			} else {
				if ($minimum !== undefined && instance < $minimum) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'minimum',
						keywordLocation: "".concat(schemaLocation, "/minimum"),
						error: "".concat(instance, " is less than ").concat($minimum, ".")
					});
				}

				if ($maximum !== undefined && instance > $maximum) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'maximum',
						keywordLocation: "".concat(schemaLocation, "/maximum"),
						error: "".concat(instance, " is greater than ").concat($maximum, ".")
					});
				}

				if ($exclusiveMinimum !== undefined && instance <= $exclusiveMinimum) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'exclusiveMinimum',
						keywordLocation: "".concat(schemaLocation, "/exclusiveMinimum"),
						error: "".concat(instance, " is less than ").concat($exclusiveMinimum, ".")
					});
				}

				if ($exclusiveMaximum !== undefined && instance >= $exclusiveMaximum) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'exclusiveMaximum',
						keywordLocation: "".concat(schemaLocation, "/exclusiveMaximum"),
						error: "".concat(instance, " is greater than or equal to ").concat($exclusiveMaximum, ".")
					});
				}
			}

			if ($multipleOf !== undefined) {
				var remainder = instance % $multipleOf;

				if (Math.abs(0 - remainder) >= 1.1920929e-7 && Math.abs($multipleOf - remainder) >= 1.1920929e-7) {
					errors.push({
						instanceLocation: instanceLocation,
						keyword: 'multipleOf',
						keywordLocation: "".concat(schemaLocation, "/multipleOf"),
						error: "".concat(instance, " is not a multiple of ").concat($multipleOf, ".")
					});
				}
			}
		} else if (instanceType === 'string') {
			var _length2 = $minLength === undefined && $maxLength === undefined ? 0 : ucs2length(instance);

			if ($minLength !== undefined && _length2 < $minLength) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'minLength',
					keywordLocation: "".concat(schemaLocation, "/minLength"),
					error: "String is too short (".concat(_length2, " < ").concat($minLength, ").")
				});
			}

			if ($maxLength !== undefined && _length2 > $maxLength) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'maxLength',
					keywordLocation: "".concat(schemaLocation, "/maxLength"),
					error: "String is too long (".concat(_length2, " > ").concat($maxLength, ").")
				});
			}

			if ($pattern !== undefined && !new RegExp($pattern).test(instance)) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'pattern',
					keywordLocation: "".concat(schemaLocation, "/pattern"),
					error: "String does not match pattern."
				});
			}

			if ($format !== undefined && fastFormat[$format] && !fastFormat[$format](instance)) {
				errors.push({
					instanceLocation: instanceLocation,
					keyword: 'format',
					keywordLocation: "".concat(schemaLocation, "/format"),
					error: "String does not match format \"".concat($format, "\".")
				});
			}
		}

		return {
			valid: errors.length === 0,
			errors: errors
		};
	}

	var Validator = /*#__PURE__*/function () {
		function Validator(schema) {
			var draft = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '2019-09';
			var shortCircuit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

			_classCallCheck(this, Validator);

			this.schema = schema;
			this.draft = draft;
			this.shortCircuit = shortCircuit;
			this.lookup = dereference(schema);
		}

		_createClass(Validator, [{
			key: "validate",
			value: function validate$1(instance) {
				return validate(instance, this.schema, this.draft, this.lookup, this.shortCircuit);
			}
		}, {
			key: "addSchema",
			value: function addSchema(schema, id) {
				if (id) {
					schema = _objectSpread2(_objectSpread2({}, schema), {}, {
						$id: id
					});
				}

				dereference(schema, this.lookup);
			}
		}]);

		return Validator;
	}();

	window.JsonSchemaValidator = Validator;

})();
