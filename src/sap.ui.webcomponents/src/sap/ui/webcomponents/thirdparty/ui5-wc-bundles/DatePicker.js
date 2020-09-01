sap.ui.define(['./chunk-7ceb84db', './chunk-52e7820d', './chunk-f88e3e0b', './chunk-10d30a0b', './chunk-bc74bbec', './chunk-b003cdb5', './chunk-57e79e7c', './chunk-1be5f319', './chunk-04be579f', './chunk-2e860beb', './chunk-b83f2514', './chunk-1b10f44e', './chunk-fd3246cd', './chunk-02a372c1', './chunk-35c756ba', './chunk-390485da', './chunk-47035d43', './chunk-81e00f35', './chunk-8b7daeae', './chunk-c52baa5e', './chunk-7e1c675d', './chunk-2ca5b205', './chunk-b4193b36', './chunk-f9a0bf68', './chunk-b051469f'], function (__chunk_1, __chunk_2, __chunk_3, __chunk_5, __chunk_6, __chunk_7, __chunk_8, __chunk_9, __chunk_10, __chunk_13, __chunk_14, __chunk_15, __chunk_18, __chunk_21, __chunk_24, __chunk_25, __chunk_26, __chunk_27, __chunk_28, __chunk_29, __chunk_30, __chunk_31, __chunk_32, __chunk_33, __chunk_34) { 'use strict';

	/**
	 * Different calendar types.
	 */

	var CalendarTypes = {
	  Gregorian: "Gregorian",
	  Islamic: "Islamic",
	  Japanese: "Japanese",
	  Buddhist: "Buddhist",
	  Persian: "Persian"
	};

	var CalendarType =
	/*#__PURE__*/
	function (_DataType) {
	  __chunk_1._inherits(CalendarType, _DataType);

	  function CalendarType() {
	    __chunk_1._classCallCheck(this, CalendarType);

	    return __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(CalendarType).apply(this, arguments));
	  }

	  __chunk_1._createClass(CalendarType, null, [{
	    key: "isValid",
	    value: function isValid(value) {
	      return !!CalendarTypes[value];
	    }
	  }]);

	  return CalendarType;
	}(__chunk_1.DataType);

	CalendarType.generataTypeAcessors(CalendarTypes);

	var calendarType;

	var getCalendarType = function getCalendarType() {
	  if (calendarType === undefined) {
	    calendarType = __chunk_1.getCalendarType();
	  }

	  if (CalendarType.isValid(calendarType)) {
	    return calendarType;
	  }

	  return CalendarType.Gregorian;
	};
	 // eslint-disable-line

	var emptyFn = function emptyFn() {};
	/**
	 * OpenUI5 FormatSettings shim
	 */


	var FormatSettings = {
	  getFormatLocale: __chunk_1.getLocale,
	  getLegacyDateFormat: emptyFn,
	  getLegacyDateCalendarCustomizing: emptyFn,
	  getCustomLocaleData: emptyFn
	};
	/**
	 * OpenUI5 Configuration Shim
	 */

	var Configuration = {
	  getLanguage: __chunk_1.getLanguage,
	  getCalendarType: getCalendarType,
	  getSupportedLanguages: function getSupportedLanguages() {
	    return __chunk_1.getDesigntimePropertyAsArray("$core-i18n-locales:,ar,bg,ca,cs,da,de,el,en,es,et,fi,fr,hi,hr,hu,it,iw,ja,ko,lt,lv,nl,no,pl,pt,ro,ru,sh,sk,sl,sv,th,tr,uk,vi,zh_CN,zh_TW$");
	  },
	  getOriginInfo: emptyFn,
	  getFormatSettings: function getFormatSettings() {
	    return FormatSettings;
	  }
	};
	/**
	 * OpenUI5 Core shim
	 */

	var Core = {
	  getConfiguration: function getConfiguration() {
	    return Configuration;
	  },
	  getLibraryResourceBundle: emptyFn(),
	  getFormatSettings: function getFormatSettings() {
	    return FormatSettings;
	  }
	};

	var BaseObject;

	var Interface = function Interface(oObject, aMethods, bFacade) {
	  if (!oObject) {
	    return oObject;
	  }

	  BaseObject = BaseObject || sap.ui.requireSync("sap/ui/base/Object");

	  function fCreateDelegator(oObject, sMethodName) {
	    return function () {
	      var tmp = oObject[sMethodName].apply(oObject, arguments);

	      if (bFacade) {
	        return this;
	      } else {
	        return tmp instanceof BaseObject ? tmp.getInterface() : tmp;
	      }
	    };
	  }

	  if (!aMethods) {
	    return {};
	  }

	  var sMethodName;

	  for (var i = 0, ml = aMethods.length; i < ml; i++) {
	    sMethodName = aMethods[i];

	    if (!oObject[sMethodName] || typeof oObject[sMethodName] === "function") {
	      this[sMethodName] = fCreateDelegator(oObject, sMethodName);
	    }
	  }
	};

	var ObjectPath = {};
	var defaultRootContext = window;

	function getObjectPathArray(vObjectPath) {
	  return Array.isArray(vObjectPath) ? vObjectPath.slice() : vObjectPath.split(".");
	}

	ObjectPath.create = function (vObjectPath, oRootContext) {
	  var oObject = oRootContext || defaultRootContext;
	  var aNames = getObjectPathArray(vObjectPath);

	  for (var i = 0; i < aNames.length; i++) {
	    var sName = aNames[i];

	    if (oObject[sName] === null || oObject[sName] !== undefined && __chunk_1._typeof(oObject[sName]) !== "object" && typeof oObject[sName] !== "function") {
	      throw new Error("Could not set object-path for '" + aNames.join(".") + "', path segment '" + sName + "' already exists.");
	    }

	    oObject[sName] = oObject[sName] || {};
	    oObject = oObject[sName];
	  }

	  return oObject;
	};

	ObjectPath.get = function (vObjectPath, oRootContext) {
	  var oObject = oRootContext || defaultRootContext;
	  var aNames = getObjectPathArray(vObjectPath);
	  var sPropertyName = aNames.pop();

	  for (var i = 0; i < aNames.length && oObject; i++) {
	    oObject = oObject[aNames[i]];
	  }

	  return oObject ? oObject[sPropertyName] : undefined;
	};

	ObjectPath.set = function (vObjectPath, vValue, oRootContext) {
	  oRootContext = oRootContext || defaultRootContext;
	  var aNames = getObjectPathArray(vObjectPath);
	  var sPropertyName = aNames.pop();
	  var oObject = ObjectPath.create(aNames, oRootContext);
	  oObject[sPropertyName] = vValue;
	};

	var Device = {
	  browser: {
	    phantomJS: false
	  }
	};

	var fnNow = !(typeof window != "undefined" && window.performance && performance.now && performance.timing) ? Date.now : function () {
	  var iNavigationStart = performance.timing.navigationStart;
	  return function perfnow() {
	    return iNavigationStart + performance.now();
	  };
	}();

	var Log = {};
	Log.Level = {
	  NONE: -1,
	  FATAL: 0,
	  ERROR: 1,
	  WARNING: 2,
	  INFO: 3,
	  DEBUG: 4,
	  TRACE: 5,
	  ALL: 5 + 1
	};
	var sDefaultComponent,
	    aLog = [],
	    mMaxLevel = {
	  '': Log.Level.ERROR
	},
	    iLogEntriesLimit = 3000,
	    oListener = null,
	    bLogSupportInfo = false;

	function pad0(i, w) {
	  return ('000' + String(i)).slice(-w);
	}

	function level(sComponent) {
	  return !sComponent || isNaN(mMaxLevel[sComponent]) ? mMaxLevel[''] : mMaxLevel[sComponent];
	}

	function discardLogEntries() {
	  var iLogLength = aLog.length;

	  if (iLogLength) {
	    var iEntriesToKeep = Math.min(iLogLength, Math.floor(iLogEntriesLimit * 0.7));

	    if (oListener) {
	      oListener.onDiscardLogEntries(aLog.slice(0, iLogLength - iEntriesToKeep));
	    }

	    if (iEntriesToKeep) {
	      aLog = aLog.slice(-iEntriesToKeep, iLogLength);
	    } else {
	      aLog = [];
	    }
	  }
	}

	function getLogEntryListenerInstance() {
	  if (!oListener) {
	    oListener = {
	      listeners: [],
	      onLogEntry: function onLogEntry(oLogEntry) {
	        for (var i = 0; i < oListener.listeners.length; i++) {
	          if (oListener.listeners[i].onLogEntry) {
	            oListener.listeners[i].onLogEntry(oLogEntry);
	          }
	        }
	      },
	      onDiscardLogEntries: function onDiscardLogEntries(aDiscardedLogEntries) {
	        for (var i = 0; i < oListener.listeners.length; i++) {
	          if (oListener.listeners[i].onDiscardLogEntries) {
	            oListener.listeners[i].onDiscardLogEntries(aDiscardedLogEntries);
	          }
	        }
	      },
	      attach: function attach(oLog, oLstnr) {
	        if (oLstnr) {
	          oListener.listeners.push(oLstnr);

	          if (oLstnr.onAttachToLog) {
	            oLstnr.onAttachToLog(oLog);
	          }
	        }
	      },
	      detach: function detach(oLog, oLstnr) {
	        for (var i = 0; i < oListener.listeners.length; i++) {
	          if (oListener.listeners[i] === oLstnr) {
	            if (oLstnr.onDetachFromLog) {
	              oLstnr.onDetachFromLog(oLog);
	            }

	            oListener.listeners.splice(i, 1);
	            return;
	          }
	        }
	      }
	    };
	  }

	  return oListener;
	}

	Log.fatal = function (sMessage, sDetails, sComponent, fnSupportInfo) {
	  log(Log.Level.FATAL, sMessage, sDetails, sComponent, fnSupportInfo);
	};

	Log.error = function (sMessage, sDetails, sComponent, fnSupportInfo) {
	  log(Log.Level.ERROR, sMessage, sDetails, sComponent, fnSupportInfo);
	};

	Log.warning = function (sMessage, sDetails, sComponent, fnSupportInfo) {
	  log(Log.Level.WARNING, sMessage, sDetails, sComponent, fnSupportInfo);
	};

	Log.info = function (sMessage, sDetails, sComponent, fnSupportInfo) {
	  log(Log.Level.INFO, sMessage, sDetails, sComponent, fnSupportInfo);
	};

	Log.debug = function (sMessage, sDetails, sComponent, fnSupportInfo) {
	  log(Log.Level.DEBUG, sMessage, sDetails, sComponent, fnSupportInfo);
	};

	Log.trace = function (sMessage, sDetails, sComponent, fnSupportInfo) {
	  log(Log.Level.TRACE, sMessage, sDetails, sComponent, fnSupportInfo);
	};

	Log.setLevel = function (iLogLevel, sComponent, _bDefault) {
	  sComponent = sComponent || sDefaultComponent || '';

	  if (!_bDefault || mMaxLevel[sComponent] == null) {
	    mMaxLevel[sComponent] = iLogLevel;
	    var sLogLevel;
	    Object.keys(Log.Level).forEach(function (sLevel) {
	      if (Log.Level[sLevel] === iLogLevel) {
	        sLogLevel = sLevel;
	      }
	    });
	    log(Log.Level.INFO, 'Changing log level ' + (sComponent ? 'for \'' + sComponent + '\' ' : '') + 'to ' + sLogLevel, '', 'sap.base.log');
	  }
	};

	Log.getLevel = function (sComponent) {
	  return level(sComponent || sDefaultComponent);
	};

	Log.isLoggable = function (iLevel, sComponent) {
	  return (iLevel == null ? Log.Level.DEBUG : iLevel) <= level(sComponent || sDefaultComponent);
	};

	Log.logSupportInfo = function (bEnabled) {
	  bLogSupportInfo = bEnabled;
	};

	function log(iLevel, sMessage, sDetails, sComponent, fnSupportInfo) {
	  if (!fnSupportInfo && !sComponent && typeof sDetails === 'function') {
	    fnSupportInfo = sDetails;
	    sDetails = '';
	  }

	  if (!fnSupportInfo && typeof sComponent === 'function') {
	    fnSupportInfo = sComponent;
	    sComponent = '';
	  }

	  sComponent = sComponent || sDefaultComponent;

	  if (iLevel <= level(sComponent)) {
	    var fNow = fnNow(),
	        oNow = new Date(fNow),
	        iMicroSeconds = Math.floor((fNow - Math.floor(fNow)) * 1000),
	        oLogEntry = {
	      time: pad0(oNow.getHours(), 2) + ':' + pad0(oNow.getMinutes(), 2) + ':' + pad0(oNow.getSeconds(), 2) + '.' + pad0(oNow.getMilliseconds(), 3) + pad0(iMicroSeconds, 3),
	      date: pad0(oNow.getFullYear(), 4) + '-' + pad0(oNow.getMonth() + 1, 2) + '-' + pad0(oNow.getDate(), 2),
	      timestamp: fNow,
	      level: iLevel,
	      message: String(sMessage || ''),
	      details: String(sDetails || ''),
	      component: String(sComponent || '')
	    };

	    if (bLogSupportInfo && typeof fnSupportInfo === 'function') {
	      oLogEntry.supportInfo = fnSupportInfo();
	    }

	    if (iLogEntriesLimit) {
	      if (aLog.length >= iLogEntriesLimit) {
	        discardLogEntries();
	      }

	      aLog.push(oLogEntry);
	    }

	    if (oListener) {
	      oListener.onLogEntry(oLogEntry);
	    }

	    if (console) {
	      var isDetailsError = sDetails instanceof Error,
	          logText = oLogEntry.date + ' ' + oLogEntry.time + ' ' + oLogEntry.message + ' - ' + oLogEntry.details + ' ' + oLogEntry.component;

	      switch (iLevel) {
	        case Log.Level.FATAL:
	        case Log.Level.ERROR:
	          isDetailsError ? console.error(logText, '\n', sDetails) : console.error(logText);
	          break;

	        case Log.Level.WARNING:
	          isDetailsError ? console.warn(logText, '\n', sDetails) : console.warn(logText);
	          break;

	        case Log.Level.INFO:
	          if (console.info) {
	            isDetailsError ? console.info(logText, '\n', sDetails) : console.info(logText);
	          } else {
	            isDetailsError ? console.log(logText, '\n', sDetails) : console.log(logText);
	          }

	          break;

	        case Log.Level.DEBUG:
	          if (console.debug) {
	            isDetailsError ? console.debug(logText, '\n', sDetails) : console.debug(logText);
	          } else {
	            isDetailsError ? console.log(logText, '\n', sDetails) : console.log(logText);
	          }

	          break;

	        case Log.Level.TRACE:
	          if (console.trace) {
	            isDetailsError ? console.trace(logText, '\n', sDetails) : console.trace(logText);
	          } else {
	            isDetailsError ? console.log(logText, '\n', sDetails) : console.log(logText);
	          }

	          break;
	      }

	      if (console.info && oLogEntry.supportInfo) {
	        console.info(oLogEntry.supportInfo);
	      }
	    }

	    return oLogEntry;
	  }
	}

	Log.getLogEntries = function () {
	  return aLog.slice();
	};

	Log.getLogEntriesLimit = function () {
	  return iLogEntriesLimit;
	};

	Log.setLogEntriesLimit = function (iLimit) {
	  if (iLimit < 0) {
	    throw new Error('The log entries limit needs to be greater than or equal to 0!');
	  }

	  iLogEntriesLimit = iLimit;

	  if (aLog.length >= iLogEntriesLimit) {
	    discardLogEntries();
	  }
	};

	Log.addLogListener = function (oListener) {
	  getLogEntryListenerInstance().attach(this, oListener);
	};

	Log.removeLogListener = function (oListener) {
	  getLogEntryListenerInstance().detach(this, oListener);
	};

	function Logger(sComponent) {
	  this.fatal = function (msg, detail, comp, support) {
	    Log.fatal(msg, detail, comp || sComponent, support);
	    return this;
	  };

	  this.error = function (msg, detail, comp, support) {
	    Log.error(msg, detail, comp || sComponent, support);
	    return this;
	  };

	  this.warning = function (msg, detail, comp, support) {
	    Log.warning(msg, detail, comp || sComponent, support);
	    return this;
	  };

	  this.info = function (msg, detail, comp, support) {
	    Log.info(msg, detail, comp || sComponent, support);
	    return this;
	  };

	  this.debug = function (msg, detail, comp, support) {
	    Log.debug(msg, detail, comp || sComponent, support);
	    return this;
	  };

	  this.trace = function (msg, detail, comp, support) {
	    Log.trace(msg, detail, comp || sComponent, support);
	    return this;
	  };

	  this.setLevel = function (level, comp) {
	    Log.setLevel(level, comp || sComponent);
	    return this;
	  };

	  this.getLevel = function (comp) {
	    return Log.getLevel(comp || sComponent);
	  };

	  this.isLoggable = function (level, comp) {
	    return Log.isLoggable(level, comp || sComponent);
	  };
	}

	Log.getLogger = function (sComponent, iDefaultLogLevel) {
	  if (!isNaN(iDefaultLogLevel) && mMaxLevel[sComponent] == null) {
	    mMaxLevel[sComponent] = iDefaultLogLevel;
	  }

	  return new Logger(sComponent);
	};

	var fnAssert = function fnAssert(bResult, vMessage) {
	  if (!bResult) {
	    var sMessage = typeof vMessage === 'function' ? vMessage() : vMessage;

	    if (console && console.assert) {
	      console.assert(bResult, sMessage);
	    } else {
	      Log.debug('[Assertions] ' + sMessage);
	    }
	  }
	};

	var fnUniqueSort = function fnUniqueSort(aArray) {
	  fnAssert(aArray instanceof Array, 'uniqueSort: input parameter must be an Array');
	  var l = aArray.length;

	  if (l > 1) {
	    aArray.sort();
	    var j = 0;

	    for (var i = 1; i < l; i++) {
	      if (aArray[i] !== aArray[j]) {
	        aArray[++j] = aArray[i];
	      }
	    }

	    if (++j < l) {
	      aArray.splice(j, l - j);
	    }
	  }

	  return aArray;
	};

	var Metadata = function Metadata(sClassName, oClassInfo) {
	  fnAssert(typeof sClassName === 'string' && sClassName, 'Metadata: sClassName must be a non-empty string');
	  fnAssert(__chunk_1._typeof(oClassInfo) === 'object', 'Metadata: oClassInfo must be empty or an object');

	  if (!oClassInfo || __chunk_1._typeof(oClassInfo.metadata) !== 'object') {
	    oClassInfo = {
	      metadata: oClassInfo || {},
	      constructor: ObjectPath.get(sClassName)
	    };
	    oClassInfo.metadata.__version = 1;
	  }

	  oClassInfo.metadata.__version = oClassInfo.metadata.__version || 2;

	  if (typeof oClassInfo.constructor !== 'function') {
	    throw Error('constructor for class ' + sClassName + ' must have been declared before creating metadata for it');
	  }

	  this._sClassName = sClassName;
	  this._oClass = oClassInfo.constructor;
	  this.extend(oClassInfo);
	};

	Metadata.prototype.extend = function (oClassInfo) {
	  this.applySettings(oClassInfo);
	  this.afterApplySettings();
	};

	Metadata.prototype.applySettings = function (oClassInfo) {
	  var that = this,
	      oStaticInfo = oClassInfo.metadata,
	      oPrototype;

	  if (oStaticInfo.baseType) {
	    var oParentClass = ObjectPath.get(oStaticInfo.baseType);

	    if (typeof oParentClass !== 'function') {
	      Log.fatal('base class \'' + oStaticInfo.baseType + '\' does not exist');
	    }

	    if (oParentClass.getMetadata) {
	      this._oParent = oParentClass.getMetadata();
	      fnAssert(oParentClass === oParentClass.getMetadata().getClass(), 'Metadata: oParentClass must match the class in the parent metadata');
	    } else {
	      this._oParent = new Metadata(oStaticInfo.baseType, {});
	    }
	  } else {
	    this._oParent = undefined;
	  }

	  this._bAbstract = !!oStaticInfo['abstract'];
	  this._bFinal = !!oStaticInfo['final'];
	  this._sStereotype = oStaticInfo.stereotype || (this._oParent ? this._oParent._sStereotype : 'object');
	  this._bDeprecated = !!oStaticInfo['deprecated'];
	  this._aInterfaces = oStaticInfo.interfaces || [];
	  this._aPublicMethods = oStaticInfo.publicMethods || [];
	  this._bInterfacesUnique = false;
	  oPrototype = this._oClass.prototype;

	  for (var n in oClassInfo) {
	    if (n !== 'metadata' && n !== 'constructor') {
	      oPrototype[n] = oClassInfo[n];

	      if (!n.match(/^_|^on|^init$|^exit$/)) {
	        that._aPublicMethods.push(n);
	      }
	    }
	  }
	};

	Metadata.prototype.afterApplySettings = function () {
	  if (this._oParent) {
	    this._aAllPublicMethods = this._oParent._aAllPublicMethods.concat(this._aPublicMethods);
	    this._bInterfacesUnique = false;
	  } else {
	    this._aAllPublicMethods = this._aPublicMethods;
	  }
	};

	Metadata.prototype.getStereotype = function () {
	  return this._sStereotype;
	};

	Metadata.prototype.getName = function () {
	  return this._sClassName;
	};

	Metadata.prototype.getClass = function () {
	  return this._oClass;
	};

	Metadata.prototype.getParent = function () {
	  return this._oParent;
	};

	Metadata.prototype._dedupInterfaces = function () {
	  if (!this._bInterfacesUnique) {
	    fnUniqueSort(this._aInterfaces);
	    fnUniqueSort(this._aPublicMethods);
	    fnUniqueSort(this._aAllPublicMethods);
	    this._bInterfacesUnique = true;
	  }
	};

	Metadata.prototype.getPublicMethods = function () {
	  this._dedupInterfaces();

	  return this._aPublicMethods;
	};

	Metadata.prototype.getAllPublicMethods = function () {
	  this._dedupInterfaces();

	  return this._aAllPublicMethods;
	};

	Metadata.prototype.getInterfaces = function () {
	  this._dedupInterfaces();

	  return this._aInterfaces;
	};

	Metadata.prototype.isInstanceOf = function (sInterface) {
	  if (this._oParent) {
	    if (this._oParent.isInstanceOf(sInterface)) {
	      return true;
	    }
	  }

	  var a = this._aInterfaces;

	  for (var i = 0, l = a.length; i < l; i++) {
	    if (a[i] === sInterface) {
	      return true;
	    }
	  }

	  return false;
	};

	var WRITABLE_IFF_PHANTOM = !!Device.browser.phantomJS;
	Object.defineProperty(Metadata.prototype, '_mImplementedTypes', {
	  get: function get() {
	    if (this === Metadata.prototype) {
	      throw new Error('sap.ui.base.Metadata: The \'_mImplementedTypes\' property must not be accessed on the prototype');
	    }

	    var result = Object.create(this._oParent ? this._oParent._mImplementedTypes : null);
	    result[this._sClassName] = true;
	    var aInterfaces = this._aInterfaces,
	        i = aInterfaces.length;

	    while (i-- > 0) {
	      if (!result[aInterfaces[i]]) {
	        result[aInterfaces[i]] = true;
	      }
	    }

	    Object.defineProperty(this, '_mImplementedTypes', {
	      value: Object.freeze(result),
	      writable: WRITABLE_IFF_PHANTOM,
	      configurable: false
	    });
	    return result;
	  },
	  configurable: true
	});

	Metadata.prototype.isA = function (vTypeName) {
	  var mTypes = this._mImplementedTypes;

	  if (Array.isArray(vTypeName)) {
	    for (var i = 0; i < vTypeName.length; i++) {
	      if (vTypeName[i] in mTypes) {
	        return true;
	      }
	    }

	    return false;
	  }

	  return vTypeName in mTypes;
	};

	Metadata.prototype.isAbstract = function () {
	  return this._bAbstract;
	};

	Metadata.prototype.isFinal = function () {
	  return this._bFinal;
	};

	Metadata.prototype.isDeprecated = function () {
	  return this._bDeprecated;
	};

	Metadata.prototype.addPublicMethods = function (sMethod) {
	  var aNames = sMethod instanceof Array ? sMethod : arguments;
	  Array.prototype.push.apply(this._aPublicMethods, aNames);
	  Array.prototype.push.apply(this._aAllPublicMethods, aNames);
	  this._bInterfacesUnique = false;
	};

	Metadata.createClass = function (fnBaseClass, sClassName, oClassInfo, FNMetaImpl) {
	  if (typeof fnBaseClass === 'string') {
	    FNMetaImpl = oClassInfo;
	    oClassInfo = sClassName;
	    sClassName = fnBaseClass;
	    fnBaseClass = null;
	  }

	  fnAssert(!fnBaseClass || typeof fnBaseClass === 'function');
	  fnAssert(typeof sClassName === 'string' && !!sClassName);
	  fnAssert(!oClassInfo || __chunk_1._typeof(oClassInfo) === 'object');
	  fnAssert(!FNMetaImpl || typeof FNMetaImpl === 'function');
	  FNMetaImpl = FNMetaImpl || Metadata;

	  if (typeof FNMetaImpl.preprocessClassInfo === 'function') {
	    oClassInfo = FNMetaImpl.preprocessClassInfo(oClassInfo);
	  }

	  oClassInfo = oClassInfo || {};
	  oClassInfo.metadata = oClassInfo.metadata || {};

	  if (!oClassInfo.hasOwnProperty('constructor')) {
	    oClassInfo.constructor = undefined;
	  }

	  var fnClass = oClassInfo.constructor;
	  fnAssert(!fnClass || typeof fnClass === 'function');

	  if (fnBaseClass) {
	    if (!fnClass) {
	      if (oClassInfo.metadata.deprecated) {
	        fnClass = function fnClass() {
	          Log.warning('Usage of deprecated class: ' + sClassName);
	          fnBaseClass.apply(this, arguments);
	        };
	      } else {
	        fnClass = function fnClass() {
	          fnBaseClass.apply(this, arguments);
	        };
	      }
	    }

	    fnClass.prototype = Object.create(fnBaseClass.prototype);
	    fnClass.prototype.constructor = fnClass;
	    oClassInfo.metadata.baseType = fnBaseClass.getMetadata().getName();
	  } else {
	    fnClass = fnClass || function () {};

	    delete oClassInfo.metadata.baseType;
	  }

	  oClassInfo.constructor = fnClass;
	  ObjectPath.set(sClassName, fnClass);
	  var oMetadata = new FNMetaImpl(sClassName, oClassInfo);

	  fnClass.getMetadata = fnClass.prototype.getMetadata = function () {
	    return oMetadata;
	  };

	  if (!fnClass.getMetadata().isFinal()) {
	    fnClass.extend = function (sSCName, oSCClassInfo, fnSCMetaImpl) {
	      return Metadata.createClass(fnClass, sSCName, oSCClassInfo, fnSCMetaImpl || FNMetaImpl);
	    };
	  }

	  return fnClass;
	};

	var BaseObject$1 = Metadata.createClass('sap.ui.base.Object', {
	  constructor: function constructor() {
	    if (!(this instanceof BaseObject$1)) {
	      throw Error('Cannot instantiate object: "new" is missing!');
	    }
	  }
	});

	BaseObject$1.prototype.destroy = function () {};

	BaseObject$1.prototype.getInterface = function () {
	  var oInterface = new Interface(this, this.getMetadata().getAllPublicMethods());

	  this.getInterface = function () {
	    return oInterface;
	  };

	  return oInterface;
	};

	BaseObject$1.defineClass = function (sClassName, oStaticInfo, FNMetaImpl) {
	  var oMetadata = new (FNMetaImpl || Metadata)(sClassName, oStaticInfo);
	  var fnClass = oMetadata.getClass();

	  fnClass.getMetadata = fnClass.prototype.getMetadata = function () {
	    return oMetadata;
	  };

	  if (!oMetadata.isFinal()) {
	    fnClass.extend = function (sSCName, oSCClassInfo, fnSCMetaImpl) {
	      return Metadata.createClass(fnClass, sSCName, oSCClassInfo, fnSCMetaImpl || FNMetaImpl);
	    };
	  }

	  Log.debug('defined class \'' + sClassName + '\'' + (oMetadata.getParent() ? ' as subclass of ' + oMetadata.getParent().getName() : ''));
	  return oMetadata;
	};

	BaseObject$1.prototype.isA = function (vTypeName) {
	  return this.getMetadata().isA(vTypeName);
	};

	BaseObject$1.isA = function (oObject, vTypeName) {
	  return oObject instanceof BaseObject$1 && oObject.isA(vTypeName);
	};

	var class2type = {};
	var hasOwn = class2type.hasOwnProperty;
	var toString = class2type.toString;
	var fnToString = hasOwn.toString;
	var ObjectFunctionString = fnToString.call(Object);

	var fnIsPlainObject = function fnIsPlainObject(obj) {
	  var proto, Ctor;

	  if (!obj || toString.call(obj) !== "[object Object]") {
	    return false;
	  }

	  proto = Object.getPrototypeOf(obj);

	  if (!proto) {
	    return true;
	  }

	  Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
	  return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
	};

	var oToken = Object.create(null);

	var fnMerge = function fnMerge() {
	  var src,
	      copyIsArray,
	      copy,
	      name,
	      options,
	      clone,
	      target = arguments[2] || {},
	      i = 3,
	      length = arguments.length,
	      deep = arguments[0] || false,
	      skipToken = arguments[1] ? undefined : oToken;

	  if (__chunk_1._typeof(target) !== 'object' && typeof target !== 'function') {
	    target = {};
	  }

	  for (; i < length; i++) {
	    if ((options = arguments[i]) != null) {
	      for (name in options) {
	        src = target[name];
	        copy = options[name];

	        if (name === '__proto__' || target === copy) {
	          continue;
	        }

	        if (deep && copy && (fnIsPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
	          if (copyIsArray) {
	            copyIsArray = false;
	            clone = src && Array.isArray(src) ? src : [];
	          } else {
	            clone = src && fnIsPlainObject(src) ? src : {};
	          }

	          target[name] = fnMerge(deep, arguments[1], clone, copy);
	        } else if (copy !== skipToken) {
	          target[name] = copy;
	        }
	      }
	    }
	  }

	  return target;
	};

	var fnExtend = function fnExtend() {
	  var args = [false, true];
	  args.push.apply(args, arguments);
	  return fnMerge.apply(null, args);
	};

	var CalendarType$1 = {
	  Gregorian: "Gregorian",
	  Islamic: "Islamic",
	  Japanese: "Japanese",
	  Persian: "Persian",
	  Buddhist: "Buddhist"
	};

	var rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
	var Locale = BaseObject$1.extend('sap.ui.core.Locale', {
	  constructor: function constructor(sLocaleId) {
	    BaseObject$1.apply(this);
	    var aResult = rLocale.exec(sLocaleId.replace(/_/g, '-'));

	    if (aResult === null) {
	      throw 'The given language \'' + sLocaleId + '\' does not adhere to BCP-47.';
	    }

	    this.sLocaleId = sLocaleId;
	    this.sLanguage = aResult[1] || null;
	    this.sScript = aResult[2] || null;
	    this.sRegion = aResult[3] || null;
	    this.sVariant = aResult[4] && aResult[4].slice(1) || null;
	    this.sExtension = aResult[5] && aResult[5].slice(1) || null;
	    this.sPrivateUse = aResult[6] || null;

	    if (this.sLanguage) {
	      this.sLanguage = this.sLanguage.toLowerCase();
	    }

	    if (this.sScript) {
	      this.sScript = this.sScript.toLowerCase().replace(/^[a-z]/, function ($) {
	        return $.toUpperCase();
	      });
	    }

	    if (this.sRegion) {
	      this.sRegion = this.sRegion.toUpperCase();
	    }
	  },
	  getLanguage: function getLanguage() {
	    return this.sLanguage;
	  },
	  getScript: function getScript() {
	    return this.sScript;
	  },
	  getRegion: function getRegion() {
	    return this.sRegion;
	  },
	  getVariant: function getVariant() {
	    return this.sVariant;
	  },
	  getVariantSubtags: function getVariantSubtags() {
	    return this.sVariant ? this.sVariant.split('-') : [];
	  },
	  getExtension: function getExtension() {
	    return this.sExtension;
	  },
	  getExtensionSubtags: function getExtensionSubtags() {
	    return this.sExtension ? this.sExtension.slice(2).split('-') : [];
	  },
	  getPrivateUse: function getPrivateUse() {
	    return this.sPrivateUse;
	  },
	  getPrivateUseSubtags: function getPrivateUseSubtags() {
	    return this.sPrivateUse ? this.sPrivateUse.slice(2).split('-') : [];
	  },
	  hasPrivateUseSubtag: function hasPrivateUseSubtag(sSubtag) {
	    fnAssert(sSubtag && sSubtag.match(/^[0-9A-Z]{1,8}$/i), 'subtag must be a valid BCP47 private use tag');
	    return this.getPrivateUseSubtags().indexOf(sSubtag) >= 0;
	  },
	  toString: function toString() {
	    var r = [this.sLanguage];

	    if (this.sScript) {
	      r.push(this.sScript);
	    }

	    if (this.sRegion) {
	      r.push(this.sRegion);
	    }

	    if (this.sVariant) {
	      r.push(this.sVariant);
	    }

	    if (this.sExtension) {
	      r.push(this.sExtension);
	    }

	    if (this.sPrivateUse) {
	      r.push(this.sPrivateUse);
	    }

	    return r.join('-');
	  },
	  getSAPLogonLanguage: function getSAPLogonLanguage() {
	    var sLanguage = this.sLanguage || '',
	        m;

	    if (sLanguage.indexOf('-') >= 0) {
	      sLanguage = sLanguage.slice(0, sLanguage.indexOf('-'));
	    }

	    sLanguage = M_ISO639_OLD_TO_NEW[sLanguage] || sLanguage;

	    if (sLanguage === 'zh') {
	      if (this.sScript === 'Hant' || !this.sScript && this.sRegion === 'TW') {
	        sLanguage = 'zf';
	      }
	    }

	    if (this.sPrivateUse && (m = /-(saptrc|sappsd)(?:-|$)/i.exec(this.sPrivateUse))) {
	      sLanguage = m[1].toLowerCase() === 'saptrc' ? '1Q' : '2Q';
	    }

	    return sLanguage.toUpperCase();
	  }
	});
	var M_ISO639_OLD_TO_NEW = {
	  'iw': 'he',
	  'ji': 'yi',
	  'in': 'id',
	  'sh': 'sr'
	};

	function getDesigntimePropertyAsArray(sValue) {
	  var m = /\$([-a-z0-9A-Z._]+)(?::([^$]*))?\$/.exec(sValue);
	  return m && m[2] ? m[2].split(/,/) : null;
	}

	var A_RTL_LOCALES = getDesigntimePropertyAsArray('$cldr-rtl-locales:ar,fa,he$') || [];
	Locale._cldrLocales = getDesigntimePropertyAsArray('$cldr-locales:ar,ar_EG,ar_SA,bg,br,ca,cs,da,de,de_AT,de_CH,el,el_CY,en,en_AU,en_GB,en_HK,en_IE,en_IN,en_NZ,en_PG,en_SG,en_ZA,es,es_AR,es_BO,es_CL,es_CO,es_MX,es_PE,es_UY,es_VE,et,fa,fi,fr,fr_BE,fr_CA,fr_CH,fr_LU,he,hi,hr,hu,id,it,it_CH,ja,kk,ko,lt,lv,ms,nb,nl,nl_BE,nn,pl,pt,pt_PT,ro,ru,ru_UA,sk,sl,sr,sv,th,tr,uk,vi,zh_CN,zh_HK,zh_SG,zh_TW$');
	Locale._coreI18nLocales = getDesigntimePropertyAsArray('$core-i18n-locales:,ar,bg,ca,cs,da,de,el,en,es,et,fi,fr,hi,hr,hu,it,iw,ja,kk,ko,lt,lv,ms,nl,no,pl,pt,ro,ru,sh,sk,sl,sv,th,tr,uk,vi,zh_CN,zh_TW$');

	Locale._impliesRTL = function (vLanguage) {
	  var oLocale = vLanguage instanceof Locale ? vLanguage : new Locale(vLanguage);
	  var sLanguage = oLocale.getLanguage() || '';
	  sLanguage = sLanguage && M_ISO639_OLD_TO_NEW[sLanguage] || sLanguage;
	  var sRegion = oLocale.getRegion() || '';

	  if (sRegion && A_RTL_LOCALES.indexOf(sLanguage + '_' + sRegion) >= 0) {
	    return true;
	  }

	  return A_RTL_LOCALES.indexOf(sLanguage) >= 0;
	};

	var LoaderExtensions = {
	  loadResource: __chunk_1.getModuleContent
	};

	var LocaleData = BaseObject$1.extend('sap.ui.core.LocaleData', {
	  constructor: function constructor(oLocale) {
	    this.oLocale = oLocale;
	    BaseObject$1.apply(this);
	    this.mData = getData(oLocale);
	  },
	  _get: function _get() {
	    return this._getDeep(this.mData, arguments);
	  },
	  _getMerged: function _getMerged() {
	    return this._get.apply(this, arguments);
	  },
	  _getDeep: function _getDeep(oObject, aPropertyNames) {
	    var oResult = oObject;

	    for (var i = 0; i < aPropertyNames.length; i++) {
	      oResult = oResult[aPropertyNames[i]];

	      if (oResult === undefined) {
	        break;
	      }
	    }

	    return oResult;
	  },
	  getOrientation: function getOrientation() {
	    return this._get('orientation');
	  },
	  getLanguages: function getLanguages() {
	    return this._get('languages');
	  },
	  getScripts: function getScripts() {
	    return this._get('scripts');
	  },
	  getTerritories: function getTerritories() {
	    return this._get('territories');
	  },
	  getMonths: function getMonths(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'narrow' || sWidth == 'abbreviated' || sWidth == 'wide', 'sWidth must be narrow, abbreviated or wide');
	    return this._get(getCLDRCalendarName(sCalendarType), 'months', 'format', sWidth);
	  },
	  getMonthsStandAlone: function getMonthsStandAlone(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'narrow' || sWidth == 'abbreviated' || sWidth == 'wide', 'sWidth must be narrow, abbreviated or wide');
	    return this._get(getCLDRCalendarName(sCalendarType), 'months', 'stand-alone', sWidth);
	  },
	  getDays: function getDays(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'narrow' || sWidth == 'abbreviated' || sWidth == 'wide' || sWidth == 'short', 'sWidth must be narrow, abbreviate, wide or short');
	    return this._get(getCLDRCalendarName(sCalendarType), 'days', 'format', sWidth);
	  },
	  getDaysStandAlone: function getDaysStandAlone(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'narrow' || sWidth == 'abbreviated' || sWidth == 'wide' || sWidth == 'short', 'sWidth must be narrow, abbreviated, wide or short');
	    return this._get(getCLDRCalendarName(sCalendarType), 'days', 'stand-alone', sWidth);
	  },
	  getQuarters: function getQuarters(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'narrow' || sWidth == 'abbreviated' || sWidth == 'wide', 'sWidth must be narrow, abbreviated or wide');
	    return this._get(getCLDRCalendarName(sCalendarType), 'quarters', 'format', sWidth);
	  },
	  getQuartersStandAlone: function getQuartersStandAlone(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'narrow' || sWidth == 'abbreviated' || sWidth == 'wide', 'sWidth must be narrow, abbreviated or wide');
	    return this._get(getCLDRCalendarName(sCalendarType), 'quarters', 'stand-alone', sWidth);
	  },
	  getDayPeriods: function getDayPeriods(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'narrow' || sWidth == 'abbreviated' || sWidth == 'wide', 'sWidth must be narrow, abbreviated or wide');
	    return this._get(getCLDRCalendarName(sCalendarType), 'dayPeriods', 'format', sWidth);
	  },
	  getDayPeriodsStandAlone: function getDayPeriodsStandAlone(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'narrow' || sWidth == 'abbreviated' || sWidth == 'wide', 'sWidth must be narrow, abbreviated or wide');
	    return this._get(getCLDRCalendarName(sCalendarType), 'dayPeriods', 'stand-alone', sWidth);
	  },
	  getDatePattern: function getDatePattern(sStyle, sCalendarType) {
	    fnAssert(sStyle == 'short' || sStyle == 'medium' || sStyle == 'long' || sStyle == 'full', 'sStyle must be short, medium, long or full');
	    return this._get(getCLDRCalendarName(sCalendarType), 'dateFormats', sStyle);
	  },
	  getTimePattern: function getTimePattern(sStyle, sCalendarType) {
	    fnAssert(sStyle == 'short' || sStyle == 'medium' || sStyle == 'long' || sStyle == 'full', 'sStyle must be short, medium, long or full');
	    return this._get(getCLDRCalendarName(sCalendarType), 'timeFormats', sStyle);
	  },
	  getDateTimePattern: function getDateTimePattern(sStyle, sCalendarType) {
	    fnAssert(sStyle == 'short' || sStyle == 'medium' || sStyle == 'long' || sStyle == 'full', 'sStyle must be short, medium, long or full');
	    return this._get(getCLDRCalendarName(sCalendarType), 'dateTimeFormats', sStyle);
	  },
	  getCombinedDateTimePattern: function getCombinedDateTimePattern(sDateStyle, sTimeStyle, sCalendarType) {
	    fnAssert(sDateStyle == 'short' || sDateStyle == 'medium' || sDateStyle == 'long' || sDateStyle == 'full', 'sStyle must be short, medium, long or full');
	    fnAssert(sTimeStyle == 'short' || sTimeStyle == 'medium' || sTimeStyle == 'long' || sTimeStyle == 'full', 'sStyle must be short, medium, long or full');
	    var sDateTimePattern = this.getDateTimePattern(sDateStyle, sCalendarType),
	        sDatePattern = this.getDatePattern(sDateStyle, sCalendarType),
	        sTimePattern = this.getTimePattern(sTimeStyle, sCalendarType);
	    return sDateTimePattern.replace('{0}', sTimePattern).replace('{1}', sDatePattern);
	  },
	  getCustomDateTimePattern: function getCustomDateTimePattern(sSkeleton, sCalendarType) {
	    var oAvailableFormats = this._get(getCLDRCalendarName(sCalendarType), 'dateTimeFormats', 'availableFormats');

	    return this._getFormatPattern(sSkeleton, oAvailableFormats, sCalendarType);
	  },
	  getIntervalPattern: function getIntervalPattern(sId, sCalendarType) {
	    var oIntervalFormats = this._get(getCLDRCalendarName(sCalendarType), 'dateTimeFormats', 'intervalFormats'),
	        aIdParts,
	        sIntervalId,
	        sDifference,
	        oInterval,
	        sPattern;

	    if (sId) {
	      aIdParts = sId.split('-');
	      sIntervalId = aIdParts[0];
	      sDifference = aIdParts[1];
	      oInterval = oIntervalFormats[sIntervalId];

	      if (oInterval) {
	        sPattern = oInterval[sDifference];

	        if (sPattern) {
	          return sPattern;
	        }
	      }
	    }

	    return oIntervalFormats.intervalFormatFallback;
	  },
	  getCombinedIntervalPattern: function getCombinedIntervalPattern(sPattern, sCalendarType) {
	    var oIntervalFormats = this._get(getCLDRCalendarName(sCalendarType), 'dateTimeFormats', 'intervalFormats'),
	        sFallbackPattern = oIntervalFormats.intervalFormatFallback;

	    return sFallbackPattern.replace(/\{(0|1)\}/g, sPattern);
	  },
	  getCustomIntervalPattern: function getCustomIntervalPattern(sSkeleton, vGreatestDiff, sCalendarType) {
	    var oAvailableFormats = this._get(getCLDRCalendarName(sCalendarType), 'dateTimeFormats', 'intervalFormats');

	    return this._getFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, vGreatestDiff);
	  },
	  _getFormatPattern: function _getFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, vDiff) {
	    var vPattern, aPatterns, oIntervalFormats;

	    if (!vDiff) {
	      vPattern = oAvailableFormats[sSkeleton];
	    } else if (typeof vDiff === 'string') {
	      if (vDiff == 'j' || vDiff == 'J') {
	        vDiff = this.getPreferredHourSymbol();
	      }

	      oIntervalFormats = oAvailableFormats[sSkeleton];
	      vPattern = oIntervalFormats && oIntervalFormats[vDiff];
	    }

	    if (vPattern) {
	      if (__chunk_1._typeof(vPattern) === 'object') {
	        aPatterns = Object.keys(vPattern).map(function (sKey) {
	          return vPattern[sKey];
	        });
	      } else {
	        return vPattern;
	      }
	    }

	    if (!aPatterns) {
	      aPatterns = this._createFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, vDiff);
	    }

	    if (aPatterns && aPatterns.length === 1) {
	      return aPatterns[0];
	    }

	    return aPatterns;
	  },
	  _createFormatPattern: function _createFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, vDiff) {
	    var aTokens = this._parseSkeletonFormat(sSkeleton),
	        aPatterns,
	        oBestMatch = this._findBestMatch(aTokens, sSkeleton, oAvailableFormats),
	        oToken,
	        oAvailableDateTimeFormats,
	        oSymbol,
	        oGroup,
	        sPattern,
	        sSinglePattern,
	        sDiffSymbol,
	        sDiffGroup,
	        rMixedSkeleton = /^([GyYqQMLwWEecdD]+)([hHkKjJmszZvVOXx]+)$/,
	        bSingleDate,
	        i;

	    if (vDiff) {
	      if (typeof vDiff === 'string') {
	        sDiffGroup = mCLDRSymbols[vDiff] ? mCLDRSymbols[vDiff].group : '';

	        if (sDiffGroup) {
	          bSingleDate = mCLDRSymbolGroups[sDiffGroup].index > aTokens[aTokens.length - 1].index;
	        }

	        sDiffSymbol = vDiff;
	      } else {
	        bSingleDate = true;

	        if (aTokens[0].symbol === 'y' && oBestMatch && oBestMatch.pattern.G) {
	          oSymbol = mCLDRSymbols['G'];
	          oGroup = mCLDRSymbolGroups[oSymbol.group];
	          aTokens.splice(0, 0, {
	            symbol: 'G',
	            group: oSymbol.group,
	            match: oSymbol.match,
	            index: oGroup.index,
	            field: oGroup.field,
	            length: 1
	          });
	        }

	        for (i = aTokens.length - 1; i >= 0; i--) {
	          oToken = aTokens[i];

	          if (vDiff[oToken.group]) {
	            bSingleDate = false;
	            break;
	          }
	        }

	        for (i = 0; i < aTokens.length; i++) {
	          oToken = aTokens[i];

	          if (vDiff[oToken.group]) {
	            sDiffSymbol = oToken.symbol;
	            break;
	          }
	        }

	        if ((sDiffSymbol == 'h' || sDiffSymbol == 'K') && vDiff.DayPeriod) {
	          sDiffSymbol = 'a';
	        }
	      }

	      if (bSingleDate) {
	        return [this.getCustomDateTimePattern(sSkeleton, sCalendarType)];
	      }

	      if (oBestMatch && oBestMatch.missingTokens.length === 0) {
	        sPattern = oBestMatch.pattern[sDiffSymbol];

	        if (sPattern && oBestMatch.distance > 0) {
	          sPattern = this._expandFields(sPattern, oBestMatch.patternTokens, aTokens);
	        }
	      }

	      if (!sPattern) {
	        oAvailableDateTimeFormats = this._get(getCLDRCalendarName(sCalendarType), 'dateTimeFormats', 'availableFormats');

	        if (rMixedSkeleton.test(sSkeleton) && 'ahHkKjJms'.indexOf(sDiffSymbol) >= 0) {
	          sPattern = this._getMixedFormatPattern(sSkeleton, oAvailableDateTimeFormats, sCalendarType, vDiff);
	        } else {
	          sSinglePattern = this._getFormatPattern(sSkeleton, oAvailableDateTimeFormats, sCalendarType);
	          sPattern = this.getCombinedIntervalPattern(sSinglePattern, sCalendarType);
	        }
	      }

	      aPatterns = [sPattern];
	    } else if (!oBestMatch) {
	      sPattern = sSkeleton;
	      aPatterns = [sPattern];
	    } else {
	      if (typeof oBestMatch.pattern === 'string') {
	        aPatterns = [oBestMatch.pattern];
	      } else if (__chunk_1._typeof(oBestMatch.pattern) === 'object') {
	        aPatterns = [];

	        for (var sKey in oBestMatch.pattern) {
	          sPattern = oBestMatch.pattern[sKey];
	          aPatterns.push(sPattern);
	        }
	      }

	      if (oBestMatch.distance > 0) {
	        if (oBestMatch.missingTokens.length > 0) {
	          if (rMixedSkeleton.test(sSkeleton)) {
	            aPatterns = [this._getMixedFormatPattern(sSkeleton, oAvailableFormats, sCalendarType)];
	          } else {
	            aPatterns = this._expandFields(aPatterns, oBestMatch.patternTokens, aTokens);
	            aPatterns = this._appendItems(aPatterns, oBestMatch.missingTokens, sCalendarType);
	          }
	        } else {
	          aPatterns = this._expandFields(aPatterns, oBestMatch.patternTokens, aTokens);
	        }
	      }
	    }

	    if (sSkeleton.indexOf('J') >= 0) {
	      aPatterns.forEach(function (sPattern, iIndex) {
	        aPatterns[iIndex] = sPattern.replace(/ ?[abB](?=([^']*'[^']*')*[^']*)$/g, '');
	      });
	    }

	    return aPatterns;
	  },
	  _parseSkeletonFormat: function _parseSkeletonFormat(sSkeleton) {
	    var aTokens = [],
	        oToken = {
	      index: -1
	    },
	        sSymbol,
	        oSymbol,
	        oGroup;

	    for (var i = 0; i < sSkeleton.length; i++) {
	      sSymbol = sSkeleton.charAt(i);

	      if (sSymbol == 'j' || sSymbol == 'J') {
	        sSymbol = this.getPreferredHourSymbol();
	      }

	      if (sSymbol == oToken.symbol) {
	        oToken.length++;
	        continue;
	      }

	      oSymbol = mCLDRSymbols[sSymbol];
	      oGroup = mCLDRSymbolGroups[oSymbol.group];

	      if (oSymbol.group == 'Other' || oGroup.diffOnly) {
	        throw new Error('Symbol \'' + sSymbol + '\' is not allowed in skeleton format \'' + sSkeleton + '\'');
	      }

	      if (oGroup.index <= oToken.index) {
	        throw new Error('Symbol \'' + sSymbol + '\' at wrong position or duplicate in skeleton format \'' + sSkeleton + '\'');
	      }

	      oToken = {
	        symbol: sSymbol,
	        group: oSymbol.group,
	        match: oSymbol.match,
	        index: oGroup.index,
	        field: oGroup.field,
	        length: 1
	      };
	      aTokens.push(oToken);
	    }

	    return aTokens;
	  },
	  _findBestMatch: function _findBestMatch(aTokens, sSkeleton, oAvailableFormats) {
	    var aTestTokens,
	        aMissingTokens,
	        oToken,
	        oTestToken,
	        iTest,
	        iDistance,
	        bMatch,
	        iFirstDiffPos,
	        oTokenSymbol,
	        oTestTokenSymbol,
	        oBestMatch = {
	      distance: 10000,
	      firstDiffPos: -1
	    };

	    for (var sTestSkeleton in oAvailableFormats) {
	      if (sTestSkeleton === 'intervalFormatFallback' || sTestSkeleton.indexOf('B') > -1) {
	        continue;
	      }

	      aTestTokens = this._parseSkeletonFormat(sTestSkeleton);
	      iDistance = 0;
	      aMissingTokens = [];
	      bMatch = true;

	      if (aTokens.length < aTestTokens.length) {
	        continue;
	      }

	      iTest = 0;
	      iFirstDiffPos = aTokens.length;

	      for (var i = 0; i < aTokens.length; i++) {
	        oToken = aTokens[i];
	        oTestToken = aTestTokens[iTest];

	        if (iFirstDiffPos === aTokens.length) {
	          iFirstDiffPos = i;
	        }

	        if (oTestToken) {
	          oTokenSymbol = mCLDRSymbols[oToken.symbol];
	          oTestTokenSymbol = mCLDRSymbols[oTestToken.symbol];

	          if (oToken.symbol === oTestToken.symbol) {
	            if (oToken.length === oTestToken.length) {
	              if (iFirstDiffPos === i) {
	                iFirstDiffPos = aTokens.length;
	              }
	            } else {
	              if (oToken.length < oTokenSymbol.numericCeiling ? oTestToken.length < oTestTokenSymbol.numericCeiling : oTestToken.length >= oTestTokenSymbol.numericCeiling) {
	                iDistance += Math.abs(oToken.length - oTestToken.length);
	              } else {
	                iDistance += 5;
	              }
	            }

	            iTest++;
	            continue;
	          } else {
	            if (oToken.match == oTestToken.match) {
	              iDistance += Math.abs(oToken.length - oTestToken.length) + 10;
	              iTest++;
	              continue;
	            }
	          }
	        }

	        aMissingTokens.push(oToken);
	        iDistance += 50 - i;
	      }

	      if (iTest < aTestTokens.length) {
	        bMatch = false;
	      }

	      if (bMatch && (iDistance < oBestMatch.distance || iDistance === oBestMatch.distance && iFirstDiffPos > oBestMatch.firstDiffPos)) {
	        oBestMatch.distance = iDistance;
	        oBestMatch.firstDiffPos = iFirstDiffPos;
	        oBestMatch.missingTokens = aMissingTokens;
	        oBestMatch.pattern = oAvailableFormats[sTestSkeleton];
	        oBestMatch.patternTokens = aTestTokens;
	      }
	    }

	    if (oBestMatch.pattern) {
	      return oBestMatch;
	    }
	  },
	  _expandFields: function _expandFields(vPattern, aPatternTokens, aTokens) {
	    var bSinglePattern = typeof vPattern === 'string';
	    var aPatterns;

	    if (bSinglePattern) {
	      aPatterns = [vPattern];
	    } else {
	      aPatterns = vPattern;
	    }

	    var aResult = aPatterns.map(function (sPattern) {
	      var mGroups = {},
	          mPatternGroups = {},
	          sResultPatterm = '',
	          bQuoted = false,
	          i = 0,
	          iSkeletonLength,
	          iPatternLength,
	          iBestLength,
	          iNewLength,
	          oSkeletonToken,
	          oBestToken,
	          oSymbol,
	          sChar;
	      aTokens.forEach(function (oToken) {
	        mGroups[oToken.group] = oToken;
	      });
	      aPatternTokens.forEach(function (oToken) {
	        mPatternGroups[oToken.group] = oToken;
	      });

	      while (i < sPattern.length) {
	        sChar = sPattern.charAt(i);

	        if (bQuoted) {
	          sResultPatterm += sChar;

	          if (sChar == '\'') {
	            bQuoted = false;
	          }
	        } else {
	          oSymbol = mCLDRSymbols[sChar];

	          if (oSymbol && mGroups[oSymbol.group] && mPatternGroups[oSymbol.group]) {
	            oSkeletonToken = mGroups[oSymbol.group];
	            oBestToken = mPatternGroups[oSymbol.group];
	            iSkeletonLength = oSkeletonToken.length;
	            iBestLength = oBestToken.length;
	            iPatternLength = 1;

	            while (sPattern.charAt(i + 1) == sChar) {
	              i++;
	              iPatternLength++;
	            }

	            if (iSkeletonLength === iBestLength || (iSkeletonLength < oSymbol.numericCeiling ? iPatternLength >= oSymbol.numericCeiling : iPatternLength < oSymbol.numericCeiling)) {
	              iNewLength = iPatternLength;
	            } else {
	              iNewLength = Math.max(iPatternLength, iSkeletonLength);
	            }

	            for (var j = 0; j < iNewLength; j++) {
	              sResultPatterm += sChar;
	            }
	          } else {
	            sResultPatterm += sChar;

	            if (sChar == '\'') {
	              bQuoted = true;
	            }
	          }
	        }

	        i++;
	      }

	      return sResultPatterm;
	    });
	    return bSinglePattern ? aResult[0] : aResult;
	  },
	  _appendItems: function _appendItems(aPatterns, aMissingTokens, sCalendarType) {
	    var oAppendItems = this._get(getCLDRCalendarName(sCalendarType), 'dateTimeFormats', 'appendItems');

	    aPatterns.forEach(function (sPattern, iIndex) {
	      var sDisplayName, sAppendPattern, sAppendField;
	      aMissingTokens.forEach(function (oToken) {
	        sAppendPattern = oAppendItems[oToken.group];
	        sDisplayName = '\'' + this.getDisplayName(oToken.field) + '\'';
	        sAppendField = '';

	        for (var i = 0; i < oToken.length; i++) {
	          sAppendField += oToken.symbol;
	        }

	        aPatterns[iIndex] = sAppendPattern.replace(/\{0\}/, sPattern).replace(/\{1\}/, sAppendField).replace(/\{2\}/, sDisplayName);
	      }.bind(this));
	    }.bind(this));
	    return aPatterns;
	  },
	  _getMixedFormatPattern: function _getMixedFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, vDiff) {
	    var rMixedSkeleton = /^([GyYqQMLwWEecdD]+)([hHkKjJmszZvVOXx]+)$/,
	        rWideMonth = /MMMM|LLLL/,
	        rAbbrevMonth = /MMM|LLL/,
	        rWeekDay = /E|e|c/,
	        oResult,
	        sDateSkeleton,
	        sTimeSkeleton,
	        sStyle,
	        sDatePattern,
	        sTimePattern,
	        sDateTimePattern,
	        sResultPattern;
	    oResult = rMixedSkeleton.exec(sSkeleton);
	    sDateSkeleton = oResult[1];
	    sTimeSkeleton = oResult[2];
	    sDatePattern = this._getFormatPattern(sDateSkeleton, oAvailableFormats, sCalendarType);

	    if (vDiff) {
	      sTimePattern = this.getCustomIntervalPattern(sTimeSkeleton, vDiff, sCalendarType);
	    } else {
	      sTimePattern = this._getFormatPattern(sTimeSkeleton, oAvailableFormats, sCalendarType);
	    }

	    if (rWideMonth.test(sDateSkeleton)) {
	      sStyle = rWeekDay.test(sDateSkeleton) ? 'full' : 'long';
	    } else if (rAbbrevMonth.test(sDateSkeleton)) {
	      sStyle = 'medium';
	    } else {
	      sStyle = 'short';
	    }

	    sDateTimePattern = this.getDateTimePattern(sStyle, sCalendarType);
	    sResultPattern = sDateTimePattern.replace(/\{1\}/, sDatePattern).replace(/\{0\}/, sTimePattern);
	    return sResultPattern;
	  },
	  getNumberSymbol: function getNumberSymbol(sType) {
	    fnAssert(sType == 'decimal' || sType == 'group' || sType == 'plusSign' || sType == 'minusSign' || sType == 'percentSign', 'sType must be decimal, group, plusSign, minusSign or percentSign');
	    return this._get('symbols-latn-' + sType);
	  },
	  getLenientNumberSymbols: function getLenientNumberSymbols(sType) {
	    fnAssert(sType == 'plusSign' || sType == 'minusSign', 'sType must be plusSign or minusSign');
	    return this._get('lenient-scope-number')[sType];
	  },
	  getDecimalPattern: function getDecimalPattern() {
	    return this._get('decimalFormat').standard;
	  },
	  getCurrencyPattern: function getCurrencyPattern(sContext) {
	    return this._get('currencyFormat')[sContext] || this._get('currencyFormat').standard;
	  },
	  getCurrencySpacing: function getCurrencySpacing(sPosition) {
	    return this._get('currencyFormat', 'currencySpacing', sPosition === 'after' ? 'afterCurrency' : 'beforeCurrency');
	  },
	  getPercentPattern: function getPercentPattern() {
	    return this._get('percentFormat').standard;
	  },
	  getMiscPattern: function getMiscPattern(sName) {
	    fnAssert(sName == 'approximately' || sName == 'atLeast' || sName == 'atMost' || sName == 'range', 'sName must be approximately, atLeast, atMost or range');
	    return this._get('miscPattern')[sName];
	  },
	  getMinimalDaysInFirstWeek: function getMinimalDaysInFirstWeek() {
	    return this._get('weekData-minDays');
	  },
	  getFirstDayOfWeek: function getFirstDayOfWeek() {
	    return this._get('weekData-firstDay');
	  },
	  getWeekendStart: function getWeekendStart() {
	    return this._get('weekData-weekendStart');
	  },
	  getWeekendEnd: function getWeekendEnd() {
	    return this._get('weekData-weekendEnd');
	  },
	  getCustomCurrencyCodes: function getCustomCurrencyCodes() {
	    var mCustomCurrencies = this._get('currency') || {},
	        mCustomCurrencyCodes = {};
	    Object.keys(mCustomCurrencies).forEach(function (sCurrencyKey) {
	      mCustomCurrencyCodes[sCurrencyKey] = sCurrencyKey;
	    });
	    return mCustomCurrencyCodes;
	  },
	  getCurrencyDigits: function getCurrencyDigits(sCurrency) {
	    var mCustomCurrencies = this._get('currency');

	    if (mCustomCurrencies) {
	      if (mCustomCurrencies[sCurrency] && mCustomCurrencies[sCurrency].hasOwnProperty('digits')) {
	        return mCustomCurrencies[sCurrency].digits;
	      } else if (mCustomCurrencies['DEFAULT'] && mCustomCurrencies['DEFAULT'].hasOwnProperty('digits')) {
	        return mCustomCurrencies['DEFAULT'].digits;
	      }
	    }

	    var iDigits = this._get('currencyDigits', sCurrency);

	    if (iDigits == null) {
	      iDigits = this._get('currencyDigits', 'DEFAULT');

	      if (iDigits == null) {
	        iDigits = 2;
	      }
	    }

	    return iDigits;
	  },
	  getCurrencySymbol: function getCurrencySymbol(sCurrency) {
	    var oCurrencySymbols = this.getCurrencySymbols();
	    return oCurrencySymbols && oCurrencySymbols[sCurrency] || sCurrency;
	  },
	  getCurrencyCodeBySymbol: function getCurrencyCodeBySymbol(sCurrencySymbol) {
	    var oCurrencySymbols = this._get('currencySymbols'),
	        sCurrencyCode;

	    for (sCurrencyCode in oCurrencySymbols) {
	      if (oCurrencySymbols[sCurrencyCode] === sCurrencySymbol) {
	        return sCurrencyCode;
	      }
	    }

	    return sCurrencySymbol;
	  },
	  getCurrencySymbols: function getCurrencySymbols() {
	    var mCustomCurrencies = this._get('currency'),
	        mCustomCurrencySymbols = {},
	        sIsoCode;

	    for (var sCurrencyKey in mCustomCurrencies) {
	      sIsoCode = mCustomCurrencies[sCurrencyKey].isoCode;

	      if (mCustomCurrencies[sCurrencyKey].symbol) {
	        mCustomCurrencySymbols[sCurrencyKey] = mCustomCurrencies[sCurrencyKey].symbol;
	      } else if (sIsoCode) {
	        mCustomCurrencySymbols[sCurrencyKey] = this._get('currencySymbols')[sIsoCode];
	      }
	    }

	    return Object.assign({}, this._get('currencySymbols'), mCustomCurrencySymbols);
	  },
	  getUnitDisplayName: function getUnitDisplayName(sUnit) {
	    var mUnitFormat = this.getUnitFormat(sUnit);
	    return mUnitFormat && mUnitFormat['displayName'] || '';
	  },
	  getRelativePatterns: function getRelativePatterns(aScales, sStyle) {
	    if (sStyle === undefined) {
	      sStyle = 'wide';
	    }

	    fnAssert(sStyle === 'wide' || sStyle === 'short' || sStyle === 'narrow', 'sStyle is only allowed to be set with \'wide\', \'short\' or \'narrow\'');
	    var aPatterns = [],
	        aPluralCategories = this.getPluralCategories(),
	        oScale,
	        oTimeEntry,
	        iValue,
	        iSign;

	    if (!aScales) {
	      aScales = ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'];
	    }

	    aScales.forEach(function (sScale) {
	      oScale = this._get('dateFields', sScale + '-' + sStyle);

	      for (var sEntry in oScale) {
	        if (sEntry.indexOf('relative-type-') === 0) {
	          iValue = parseInt(sEntry.substr(14));
	          aPatterns.push({
	            scale: sScale,
	            value: iValue,
	            pattern: oScale[sEntry]
	          });
	        } else if (sEntry.indexOf('relativeTime-type-') == 0) {
	          oTimeEntry = oScale[sEntry];
	          iSign = sEntry.substr(18) === 'past' ? -1 : 1;
	          aPluralCategories.forEach(function (sKey) {
	            aPatterns.push({
	              scale: sScale,
	              sign: iSign,
	              pattern: oTimeEntry['relativeTimePattern-count-' + sKey]
	            });
	          });
	        }
	      }
	    }.bind(this));
	    return aPatterns;
	  },
	  getRelativePattern: function getRelativePattern(sScale, iDiff, bFuture, sStyle) {
	    var sPattern, oTypes, sKey, sPluralCategory;

	    if (typeof bFuture === 'string') {
	      sStyle = bFuture;
	      bFuture = undefined;
	    }

	    if (bFuture === undefined) {
	      bFuture = iDiff > 0;
	    }

	    if (sStyle === undefined) {
	      sStyle = 'wide';
	    }

	    fnAssert(sStyle === 'wide' || sStyle === 'short' || sStyle === 'narrow', 'sStyle is only allowed to be set with \'wide\', \'short\' or \'narrow\'');
	    sKey = sScale + '-' + sStyle;

	    if (iDiff === 0 || iDiff === -2 || iDiff === 2) {
	      sPattern = this._get('dateFields', sKey, 'relative-type-' + iDiff);
	    }

	    if (!sPattern) {
	      oTypes = this._get('dateFields', sKey, 'relativeTime-type-' + (bFuture ? 'future' : 'past'));
	      sPluralCategory = this.getPluralCategory(Math.abs(iDiff).toString());
	      sPattern = oTypes['relativeTimePattern-count-' + sPluralCategory];
	    }

	    return sPattern;
	  },
	  getRelativeSecond: function getRelativeSecond(iDiff, sStyle) {
	    return this.getRelativePattern('second', iDiff, sStyle);
	  },
	  getRelativeMinute: function getRelativeMinute(iDiff, sStyle) {
	    if (iDiff == 0) {
	      return null;
	    }

	    return this.getRelativePattern('minute', iDiff, sStyle);
	  },
	  getRelativeHour: function getRelativeHour(iDiff, sStyle) {
	    if (iDiff == 0) {
	      return null;
	    }

	    return this.getRelativePattern('hour', iDiff, sStyle);
	  },
	  getRelativeDay: function getRelativeDay(iDiff, sStyle) {
	    return this.getRelativePattern('day', iDiff, sStyle);
	  },
	  getRelativeWeek: function getRelativeWeek(iDiff, sStyle) {
	    return this.getRelativePattern('week', iDiff, sStyle);
	  },
	  getRelativeMonth: function getRelativeMonth(iDiff, sStyle) {
	    return this.getRelativePattern('month', iDiff, sStyle);
	  },
	  getDisplayName: function getDisplayName(sType, sStyle) {
	    fnAssert(sType == 'second' || sType == 'minute' || sType == 'hour' || sType == 'zone' || sType == 'day' || sType == 'weekday' || sType == 'week' || sType == 'month' || sType == 'quarter' || sType == 'year' || sType == 'era', 'sType must be second, minute, hour, zone, day, weekday, week, month, quarter, year, era');

	    if (sStyle === undefined) {
	      sStyle = 'wide';
	    }

	    fnAssert(sStyle === 'wide' || sStyle === 'short' || sStyle === 'narrow', 'sStyle is only allowed to be set with \'wide\', \'short\' or \'narrow\'');
	    var aSingleFormFields = ['era', 'weekday', 'zone'],
	        sKey = aSingleFormFields.indexOf(sType) === -1 ? sType + '-' + sStyle : sType;
	    return this._get('dateFields', sKey, 'displayName');
	  },
	  getRelativeYear: function getRelativeYear(iDiff, sStyle) {
	    return this.getRelativePattern('year', iDiff, sStyle);
	  },
	  getDecimalFormat: function getDecimalFormat(sStyle, sNumber, sPlural) {
	    var sFormat;
	    var oFormats;

	    switch (sStyle) {
	      case 'long':
	        oFormats = this._get('decimalFormat-long');
	        break;

	      default:
	        oFormats = this._get('decimalFormat-short');
	        break;
	    }

	    if (oFormats) {
	      var sName = sNumber + '-' + sPlural;
	      sFormat = oFormats[sName];

	      if (!sFormat) {
	        sName = sNumber + '-other';
	        sFormat = oFormats[sName];
	      }
	    }

	    return sFormat;
	  },
	  getCurrencyFormat: function getCurrencyFormat(sStyle, sNumber, sPlural) {
	    var sFormat;

	    var oFormats = this._get('currencyFormat-' + sStyle);

	    if (!oFormats) {
	      if (sStyle === 'sap-short') {
	        throw new Error('Failed to get CLDR data for property "currencyFormat-sap-short"');
	      }

	      oFormats = this._get('currencyFormat-short');
	    }

	    if (oFormats) {
	      var sName = sNumber + '-' + sPlural;
	      sFormat = oFormats[sName];

	      if (!sFormat) {
	        sName = sNumber + '-other';
	        sFormat = oFormats[sName];
	      }
	    }

	    return sFormat;
	  },
	  getListFormat: function getListFormat(sType, sStyle) {
	    var oFormats = this._get('listPattern-' + (sType || 'standard') + '-' + (sStyle || 'wide'));

	    if (oFormats) {
	      return oFormats;
	    }

	    return {};
	  },
	  getResolvedUnitFormat: function getResolvedUnitFormat(sUnit) {
	    sUnit = this.getUnitFromMapping(sUnit) || sUnit;
	    return this.getUnitFormat(sUnit);
	  },
	  getUnitFormat: function getUnitFormat(sUnit) {
	    return this._get('units', 'short', sUnit);
	  },
	  getUnitFormats: function getUnitFormats() {
	    return this._getMerged('units', 'short');
	  },
	  getUnitFromMapping: function getUnitFromMapping(sMapping) {
	    return this._get('unitMappings', sMapping);
	  },
	  getEras: function getEras(sWidth, sCalendarType) {
	    fnAssert(sWidth == 'wide' || sWidth == 'abbreviated' || sWidth == 'narrow', 'sWidth must be wide, abbreviate or narrow');

	    var oEras = this._get(getCLDRCalendarName(sCalendarType), 'era-' + sWidth),
	        aEras = [];

	    for (var i in oEras) {
	      aEras[parseInt(i)] = oEras[i];
	    }

	    return aEras;
	  },
	  getEraDates: function getEraDates(sCalendarType) {
	    var oEraDates = this._get('eras-' + sCalendarType.toLowerCase()),
	        aEraDates = [];

	    for (var i in oEraDates) {
	      aEraDates[parseInt(i)] = oEraDates[i];
	    }

	    return aEraDates;
	  },
	  getCalendarWeek: function getCalendarWeek(sStyle, iWeekNumber) {
	    fnAssert(sStyle == 'wide' || sStyle == 'narrow', 'sStyle must be wide or narrow');
	    var oMessageBundle = Core.getLibraryResourceBundle('sap.ui.core', this.oLocale.toString()),
	        sKey = 'date.week.calendarweek.' + sStyle;
	    return oMessageBundle.getText(sKey, iWeekNumber);
	  },
	  getPreferredCalendarType: function getPreferredCalendarType() {
	    var sCalendarPreference = this._get('calendarPreference'),
	        aCalendars = sCalendarPreference ? sCalendarPreference.split(' ') : [],
	        sCalendarName,
	        sType,
	        i;

	    for (i = 0; i < aCalendars.length; i++) {
	      sCalendarName = aCalendars[i].split('-')[0];

	      for (sType in CalendarType$1) {
	        if (sCalendarName === sType.toLowerCase()) {
	          return sType;
	        }
	      }
	    }

	    return CalendarType$1.Gregorian;
	  },
	  getPreferredHourSymbol: function getPreferredHourSymbol() {
	    return this._get('timeData', '_preferred');
	  },
	  getPluralCategories: function getPluralCategories() {
	    var oPlurals = this._get('plurals'),
	        aCategories = Object.keys(oPlurals);

	    aCategories.push('other');
	    return aCategories;
	  },
	  getPluralCategory: function getPluralCategory(sNumber) {
	    var oPlurals = this._get('plurals');

	    if (typeof sNumber === 'number') {
	      sNumber = sNumber.toString();
	    }

	    if (!this._pluralTest) {
	      this._pluralTest = {};
	    }

	    for (var sCategory in oPlurals) {
	      var fnTest = this._pluralTest[sCategory];

	      if (!fnTest) {
	        fnTest = this._parsePluralRule(oPlurals[sCategory]);
	        this._pluralTest[sCategory] = fnTest;
	      }

	      if (fnTest(sNumber)) {
	        return sCategory;
	      }
	    }

	    return 'other';
	  },
	  _parsePluralRule: function _parsePluralRule(sRule) {
	    var OP_OR = 'or',
	        OP_AND = 'and',
	        OP_MOD = '%',
	        OP_EQ = '=',
	        OP_NEQ = '!=',
	        OPD_N = 'n',
	        OPD_I = 'i',
	        OPD_F = 'f',
	        OPD_T = 't',
	        OPD_V = 'v',
	        OPD_W = 'w',
	        RANGE = '..',
	        SEP = ',';
	    var i = 0,
	        aTokens;
	    aTokens = sRule.split(' ');

	    function accept(sToken) {
	      if (aTokens[i] === sToken) {
	        i++;
	        return true;
	      }

	      return false;
	    }

	    function consume() {
	      var sToken = aTokens[i];
	      i++;
	      return sToken;
	    }

	    function or_condition() {
	      var fnAnd, fnOr;
	      fnAnd = and_condition();

	      if (accept(OP_OR)) {
	        fnOr = or_condition();
	        return function (o) {
	          return fnAnd(o) || fnOr(o);
	        };
	      }

	      return fnAnd;
	    }

	    function and_condition() {
	      var fnRelation, fnAnd;
	      fnRelation = relation();

	      if (accept(OP_AND)) {
	        fnAnd = and_condition();
	        return function (o) {
	          return fnRelation(o) && fnAnd(o);
	        };
	      }

	      return fnRelation;
	    }

	    function relation() {
	      var fnExpr, fnRangeList, bEq;
	      fnExpr = expr();

	      if (accept(OP_EQ)) {
	        bEq = true;
	      } else if (accept(OP_NEQ)) {
	        bEq = false;
	      } else {
	        throw new Error('Expected \'=\' or \'!=\'');
	      }

	      fnRangeList = range_list();

	      if (bEq) {
	        return function (o) {
	          return fnRangeList(o).indexOf(fnExpr(o)) >= 0;
	        };
	      } else {
	        return function (o) {
	          return fnRangeList(o).indexOf(fnExpr(o)) === -1;
	        };
	      }
	    }

	    function expr() {
	      var fnOperand;
	      fnOperand = operand();

	      if (accept(OP_MOD)) {
	        var iDivisor = parseInt(consume());
	        return function (o) {
	          return fnOperand(o) % iDivisor;
	        };
	      }

	      return fnOperand;
	    }

	    function operand() {
	      if (accept(OPD_N)) {
	        return function (o) {
	          return o.n;
	        };
	      } else if (accept(OPD_I)) {
	        return function (o) {
	          return o.i;
	        };
	      } else if (accept(OPD_F)) {
	        return function (o) {
	          return o.f;
	        };
	      } else if (accept(OPD_T)) {
	        return function (o) {
	          return o.t;
	        };
	      } else if (accept(OPD_V)) {
	        return function (o) {
	          return o.v;
	        };
	      } else if (accept(OPD_W)) {
	        return function (o) {
	          return o.w;
	        };
	      } else {
	        throw new Error('Unknown operand: ' + consume());
	      }
	    }

	    function range_list() {
	      var aValues = [],
	          sRangeList = consume(),
	          aParts = sRangeList.split(SEP),
	          aRange,
	          iFrom,
	          iTo;
	      aParts.forEach(function (sPart) {
	        aRange = sPart.split(RANGE);

	        if (aRange.length === 1) {
	          aValues.push(parseInt(sPart));
	        } else {
	          iFrom = parseInt(aRange[0]);
	          iTo = parseInt(aRange[1]);

	          for (var i = iFrom; i <= iTo; i++) {
	            aValues.push(i);
	          }
	        }
	      });
	      return function (o) {
	        return aValues;
	      };
	    }

	    var fnOr = or_condition();

	    if (i != aTokens.length) {
	      throw new Error('Not completely parsed');
	    }

	    return function (sValue) {
	      var iDotPos = sValue.indexOf('.'),
	          sDecimal,
	          sFraction,
	          sFractionNoZeros,
	          o;

	      if (iDotPos === -1) {
	        sDecimal = sValue;
	        sFraction = '';
	        sFractionNoZeros = '';
	      } else {
	        sDecimal = sValue.substr(0, iDotPos);
	        sFraction = sValue.substr(iDotPos + 1);
	        sFractionNoZeros = sFraction.replace(/0+$/, '');
	      }

	      o = {
	        n: parseFloat(sValue),
	        i: parseInt(sDecimal),
	        v: sFraction.length,
	        w: sFractionNoZeros.length,
	        f: parseInt(sFraction),
	        t: parseInt(sFractionNoZeros)
	      };
	      return fnOr(o);
	    };
	  }
	});
	var mCLDRSymbolGroups = {
	  'Era': {
	    field: 'era',
	    index: 0
	  },
	  'Year': {
	    field: 'year',
	    index: 1
	  },
	  'Quarter': {
	    field: 'quarter',
	    index: 2
	  },
	  'Month': {
	    field: 'month',
	    index: 3
	  },
	  'Week': {
	    field: 'week',
	    index: 4
	  },
	  'Day-Of-Week': {
	    field: 'weekday',
	    index: 5
	  },
	  'Day': {
	    field: 'day',
	    index: 6
	  },
	  'DayPeriod': {
	    field: 'hour',
	    index: 7,
	    diffOnly: true
	  },
	  'Hour': {
	    field: 'hour',
	    index: 8
	  },
	  'Minute': {
	    field: 'minute',
	    index: 9
	  },
	  'Second': {
	    field: 'second',
	    index: 10
	  },
	  'Timezone': {
	    field: 'zone',
	    index: 11
	  }
	};
	var mCLDRSymbols = {
	  'G': {
	    group: 'Era',
	    match: 'Era',
	    numericCeiling: 1
	  },
	  'y': {
	    group: 'Year',
	    match: 'Year',
	    numericCeiling: 100
	  },
	  'Y': {
	    group: 'Year',
	    match: 'Year',
	    numericCeiling: 100
	  },
	  'Q': {
	    group: 'Quarter',
	    match: 'Quarter',
	    numericCeiling: 3
	  },
	  'q': {
	    group: 'Quarter',
	    match: 'Quarter',
	    numericCeiling: 3
	  },
	  'M': {
	    group: 'Month',
	    match: 'Month',
	    numericCeiling: 3
	  },
	  'L': {
	    group: 'Month',
	    match: 'Month',
	    numericCeiling: 3
	  },
	  'w': {
	    group: 'Week',
	    match: 'Week',
	    numericCeiling: 100
	  },
	  'W': {
	    group: 'Week',
	    match: 'Week',
	    numericCeiling: 100
	  },
	  'd': {
	    group: 'Day',
	    match: 'Day',
	    numericCeiling: 100
	  },
	  'D': {
	    group: 'Day',
	    match: 'Day',
	    numericCeiling: 100
	  },
	  'E': {
	    group: 'Day-Of-Week',
	    match: 'Day-Of-Week',
	    numericCeiling: 1
	  },
	  'e': {
	    group: 'Day-Of-Week',
	    match: 'Day-Of-Week',
	    numericCeiling: 3
	  },
	  'c': {
	    group: 'Day-Of-Week',
	    match: 'Day-Of-Week',
	    numericCeiling: 2
	  },
	  'h': {
	    group: 'Hour',
	    match: 'Hour12',
	    numericCeiling: 100
	  },
	  'H': {
	    group: 'Hour',
	    match: 'Hour24',
	    numericCeiling: 100
	  },
	  'k': {
	    group: 'Hour',
	    match: 'Hour24',
	    numericCeiling: 100
	  },
	  'K': {
	    group: 'Hour',
	    match: 'Hour12',
	    numericCeiling: 100
	  },
	  'm': {
	    group: 'Minute',
	    match: 'Minute',
	    numericCeiling: 100
	  },
	  's': {
	    group: 'Second',
	    match: 'Second',
	    numericCeiling: 100
	  },
	  'z': {
	    group: 'Timezone',
	    match: 'Timezone',
	    numericCeiling: 1
	  },
	  'Z': {
	    group: 'Timezone',
	    match: 'Timezone',
	    numericCeiling: 1
	  },
	  'O': {
	    group: 'Timezone',
	    match: 'Timezone',
	    numericCeiling: 1
	  },
	  'v': {
	    group: 'Timezone',
	    match: 'Timezone',
	    numericCeiling: 1
	  },
	  'V': {
	    group: 'Timezone',
	    match: 'Timezone',
	    numericCeiling: 1
	  },
	  'X': {
	    group: 'Timezone',
	    match: 'Timezone',
	    numericCeiling: 1
	  },
	  'x': {
	    group: 'Timezone',
	    match: 'Timezone',
	    numericCeiling: 1
	  },
	  'S': {
	    group: 'Other',
	    numericCeiling: 100
	  },
	  'u': {
	    group: 'Other',
	    numericCeiling: 100
	  },
	  'U': {
	    group: 'Other',
	    numericCeiling: 1
	  },
	  'r': {
	    group: 'Other',
	    numericCeiling: 100
	  },
	  'F': {
	    group: 'Other',
	    numericCeiling: 100
	  },
	  'g': {
	    group: 'Other',
	    numericCeiling: 100
	  },
	  'a': {
	    group: 'DayPeriod',
	    numericCeiling: 1
	  },
	  'b': {
	    group: 'Other',
	    numericCeiling: 1
	  },
	  'B': {
	    group: 'Other',
	    numericCeiling: 1
	  },
	  'A': {
	    group: 'Other',
	    numericCeiling: 100
	  }
	};
	var M_DEFAULT_DATA = {
	  'orientation': 'left-to-right',
	  'languages': {},
	  'scripts': {},
	  'territories': {},
	  'ca-gregorian': {
	    'dateFormats': {
	      'full': 'EEEE, MMMM d, y',
	      'long': 'MMMM d, y',
	      'medium': 'MMM d, y',
	      'short': 'M/d/yy'
	    },
	    'timeFormats': {
	      'full': 'h:mm:ss a zzzz',
	      'long': 'h:mm:ss a z',
	      'medium': 'h:mm:ss a',
	      'short': 'h:mm a'
	    },
	    'dateTimeFormats': {
	      'full': '{1} \'at\' {0}',
	      'long': '{1} \'at\' {0}',
	      'medium': '{1}, {0}',
	      'short': '{1}, {0}',
	      'availableFormats': {
	        'd': 'd',
	        'E': 'ccc',
	        'Ed': 'd E',
	        'Ehm': 'E h:mm a',
	        'EHm': 'E HH:mm',
	        'Ehms': 'E h:mm:ss a',
	        'EHms': 'E HH:mm:ss',
	        'Gy': 'y G',
	        'GyMMM': 'MMM y G',
	        'GyMMMd': 'MMM d, y G',
	        'GyMMMEd': 'E, MMM d, y G',
	        'h': 'h a',
	        'H': 'HH',
	        'hm': 'h:mm a',
	        'Hm': 'HH:mm',
	        'hms': 'h:mm:ss a',
	        'Hms': 'HH:mm:ss',
	        'hmsv': 'h:mm:ss a v',
	        'Hmsv': 'HH:mm:ss v',
	        'hmv': 'h:mm a v',
	        'Hmv': 'HH:mm v',
	        'M': 'L',
	        'Md': 'M/d',
	        'MEd': 'E, M/d',
	        'MMM': 'LLL',
	        'MMMd': 'MMM d',
	        'MMMEd': 'E, MMM d',
	        'MMMMd': 'MMMM d',
	        'ms': 'mm:ss',
	        'y': 'y',
	        'yM': 'M/y',
	        'yMd': 'M/d/y',
	        'yMEd': 'E, M/d/y',
	        'yMMM': 'MMM y',
	        'yMMMd': 'MMM d, y',
	        'yMMMEd': 'E, MMM d, y',
	        'yMMMM': 'MMMM y',
	        'yQQQ': 'QQQ y',
	        'yQQQQ': 'QQQQ y'
	      },
	      'appendItems': {
	        'Day': '{0} ({2}: {1})',
	        'Day-Of-Week': '{0} {1}',
	        'Era': '{0} {1}',
	        'Hour': '{0} ({2}: {1})',
	        'Minute': '{0} ({2}: {1})',
	        'Month': '{0} ({2}: {1})',
	        'Quarter': '{0} ({2}: {1})',
	        'Second': '{0} ({2}: {1})',
	        'Timezone': '{0} {1}',
	        'Week': '{0} ({2}: {1})',
	        'Year': '{0} {1}'
	      },
	      'intervalFormats': {
	        'intervalFormatFallback': "{0} \u2013 {1}",
	        'd': {
	          'd': "d \u2013 d"
	        },
	        'h': {
	          'a': "h a \u2013 h a",
	          'h': "h \u2013 h a"
	        },
	        'H': {
	          'H': "HH \u2013 HH"
	        },
	        'hm': {
	          'a': "h:mm a \u2013 h:mm a",
	          'h': "h:mm \u2013 h:mm a",
	          'm': "h:mm \u2013 h:mm a"
	        },
	        'Hm': {
	          'H': "HH:mm \u2013 HH:mm",
	          'm': "HH:mm \u2013 HH:mm"
	        },
	        'hmv': {
	          'a': "h:mm a \u2013 h:mm a v",
	          'h': "h:mm \u2013 h:mm a v",
	          'm': "h:mm \u2013 h:mm a v"
	        },
	        'Hmv': {
	          'H': "HH:mm \u2013 HH:mm v",
	          'm': "HH:mm \u2013 HH:mm v"
	        },
	        'hv': {
	          'a': "h a \u2013 h a v",
	          'h': "h \u2013 h a v"
	        },
	        'Hv': {
	          'H': "HH \u2013 HH v"
	        },
	        'M': {
	          'M': "M \u2013 M"
	        },
	        'Md': {
	          'd': "M/d \u2013 M/d",
	          'M': "M/d \u2013 M/d"
	        },
	        'MEd': {
	          'd': "E, M/d \u2013 E, M/d",
	          'M': "E, M/d \u2013 E, M/d"
	        },
	        'MMM': {
	          'M': "MMM \u2013 MMM"
	        },
	        'MMMd': {
	          'd': "MMM d \u2013 d",
	          'M': "MMM d \u2013 MMM d"
	        },
	        'MMMEd': {
	          'd': "E, MMM d \u2013 E, MMM d",
	          'M': "E, MMM d \u2013 E, MMM d"
	        },
	        'y': {
	          'y': "y \u2013 y"
	        },
	        'yM': {
	          'M': "M/y \u2013 M/y",
	          'y': "M/y \u2013 M/y"
	        },
	        'yMd': {
	          'd': "M/d/y \u2013 M/d/y",
	          'M': "M/d/y \u2013 M/d/y",
	          'y': "M/d/y \u2013 M/d/y"
	        },
	        'yMEd': {
	          'd': "E, M/d/y \u2013 E, M/d/y",
	          'M': "E, M/d/y \u2013 E, M/d/y",
	          'y': "E, M/d/y \u2013 E, M/d/y"
	        },
	        'yMMM': {
	          'M': "MMM \u2013 MMM y",
	          'y': "MMM y \u2013 MMM y"
	        },
	        'yMMMd': {
	          'd': "MMM d \u2013 d, y",
	          'M': "MMM d \u2013 MMM d, y",
	          'y': "MMM d, y \u2013 MMM d, y"
	        },
	        'yMMMEd': {
	          'd': "E, MMM d \u2013 E, MMM d, y",
	          'M': "E, MMM d \u2013 E, MMM d, y",
	          'y': "E, MMM d, y \u2013 E, MMM d, y"
	        },
	        'yMMMM': {
	          'M': "MMMM \u2013 MMMM y",
	          'y': "MMMM y \u2013 MMMM y"
	        }
	      }
	    },
	    'months': {
	      'format': {
	        'abbreviated': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	        'narrow': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	        'wide': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	      },
	      'stand-alone': {
	        'abbreviated': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	        'narrow': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
	        'wide': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
	      }
	    },
	    'days': {
	      'format': {
	        'abbreviated': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	        'narrow': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
	        'short': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
	        'wide': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	      },
	      'stand-alone': {
	        'abbreviated': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	        'narrow': ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
	        'short': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
	        'wide': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	      }
	    },
	    'quarters': {
	      'format': {
	        'abbreviated': ['Q1', 'Q2', 'Q3', 'Q4'],
	        'narrow': ['1', '2', '3', '4'],
	        'wide': ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']
	      },
	      'stand-alone': {
	        'abbreviated': ['Q1', 'Q2', 'Q3', 'Q4'],
	        'narrow': ['1', '2', '3', '4'],
	        'wide': ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter']
	      }
	    },
	    'dayPeriods': {
	      'format': {
	        'abbreviated': ['AM', 'PM'],
	        'narrow': ['a', 'p'],
	        'wide': ['AM', 'PM']
	      },
	      'stand-alone': {
	        'abbreviated': ['AM', 'PM'],
	        'narrow': ['AM', 'PM'],
	        'wide': ['AM', 'PM']
	      }
	    },
	    'era-wide': {
	      '0': 'Before Christ',
	      '1': 'Anno Domini'
	    },
	    'era-abbreviated': {
	      '0': 'BC',
	      '1': 'AD'
	    },
	    'era-narrow': {
	      '0': 'B',
	      '1': 'A'
	    }
	  },
	  'eras-gregorian': {
	    '0': {
	      '_end': '0-12-31'
	    },
	    '1': {
	      '_start': '1-01-01'
	    }
	  },
	  'dateFields': {
	    'era': {
	      'displayName': 'era'
	    },
	    'year-wide': {
	      'displayName': 'year',
	      'relative-type--1': 'last year',
	      'relative-type-0': 'this year',
	      'relative-type-1': 'next year',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} year',
	        'relativeTimePattern-count-other': 'in {0} years'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} year ago',
	        'relativeTimePattern-count-other': '{0} years ago'
	      }
	    },
	    'year-short': {
	      'displayName': 'yr.',
	      'relative-type--1': 'last yr.',
	      'relative-type-0': 'this yr.',
	      'relative-type-1': 'next yr.',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} yr.',
	        'relativeTimePattern-count-other': 'in {0} yr.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} yr. ago',
	        'relativeTimePattern-count-other': '{0} yr. ago'
	      }
	    },
	    'year-narrow': {
	      'displayName': 'yr.',
	      'relative-type--1': 'last yr.',
	      'relative-type-0': 'this yr.',
	      'relative-type-1': 'next yr.',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} yr.',
	        'relativeTimePattern-count-other': 'in {0} yr.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} yr. ago',
	        'relativeTimePattern-count-other': '{0} yr. ago'
	      }
	    },
	    'quarter-wide': {
	      'displayName': 'quarter',
	      'relative-type--1': 'last quarter',
	      'relative-type-0': 'this quarter',
	      'relative-type-1': 'next quarter',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} quarter',
	        'relativeTimePattern-count-other': 'in {0} quarters'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} quarter ago',
	        'relativeTimePattern-count-other': '{0} quarters ago'
	      }
	    },
	    'quarter-short': {
	      'displayName': 'qtr.',
	      'relative-type--1': 'last qtr.',
	      'relative-type-0': 'this qtr.',
	      'relative-type-1': 'next qtr.',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} qtr.',
	        'relativeTimePattern-count-other': 'in {0} qtrs.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} qtr. ago',
	        'relativeTimePattern-count-other': '{0} qtrs. ago'
	      }
	    },
	    'quarter-narrow': {
	      'displayName': 'qtr.',
	      'relative-type--1': 'last qtr.',
	      'relative-type-0': 'this qtr.',
	      'relative-type-1': 'next qtr.',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} qtr.',
	        'relativeTimePattern-count-other': 'in {0} qtrs.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} qtr. ago',
	        'relativeTimePattern-count-other': '{0} qtrs. ago'
	      }
	    },
	    'month-wide': {
	      'displayName': 'month',
	      'relative-type--1': 'last month',
	      'relative-type-0': 'this month',
	      'relative-type-1': 'next month',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} month',
	        'relativeTimePattern-count-other': 'in {0} months'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} month ago',
	        'relativeTimePattern-count-other': '{0} months ago'
	      }
	    },
	    'month-short': {
	      'displayName': 'mo.',
	      'relative-type--1': 'last mo.',
	      'relative-type-0': 'this mo.',
	      'relative-type-1': 'next mo.',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} mo.',
	        'relativeTimePattern-count-other': 'in {0} mo.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} mo. ago',
	        'relativeTimePattern-count-other': '{0} mo. ago'
	      }
	    },
	    'month-narrow': {
	      'displayName': 'mo.',
	      'relative-type--1': 'last mo.',
	      'relative-type-0': 'this mo.',
	      'relative-type-1': 'next mo.',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} mo.',
	        'relativeTimePattern-count-other': 'in {0} mo.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} mo. ago',
	        'relativeTimePattern-count-other': '{0} mo. ago'
	      }
	    },
	    'week-wide': {
	      'displayName': 'week',
	      'relative-type--1': 'last week',
	      'relative-type-0': 'this week',
	      'relative-type-1': 'next week',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} week',
	        'relativeTimePattern-count-other': 'in {0} weeks'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} week ago',
	        'relativeTimePattern-count-other': '{0} weeks ago'
	      },
	      'relativePeriod': 'the week of {0}'
	    },
	    'week-short': {
	      'displayName': 'wk.',
	      'relative-type--1': 'last wk.',
	      'relative-type-0': 'this wk.',
	      'relative-type-1': 'next wk.',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} wk.',
	        'relativeTimePattern-count-other': 'in {0} wk.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} wk. ago',
	        'relativeTimePattern-count-other': '{0} wk. ago'
	      },
	      'relativePeriod': 'the week of {0}'
	    },
	    'week-narrow': {
	      'displayName': 'wk.',
	      'relative-type--1': 'last wk.',
	      'relative-type-0': 'this wk.',
	      'relative-type-1': 'next wk.',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} wk.',
	        'relativeTimePattern-count-other': 'in {0} wk.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} wk. ago',
	        'relativeTimePattern-count-other': '{0} wk. ago'
	      },
	      'relativePeriod': 'the week of {0}'
	    },
	    'day-wide': {
	      'displayName': 'day',
	      'relative-type--1': 'yesterday',
	      'relative-type-0': 'today',
	      'relative-type-1': 'tomorrow',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} day',
	        'relativeTimePattern-count-other': 'in {0} days'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} day ago',
	        'relativeTimePattern-count-other': '{0} days ago'
	      }
	    },
	    'day-short': {
	      'displayName': 'day',
	      'relative-type--1': 'yesterday',
	      'relative-type-0': 'today',
	      'relative-type-1': 'tomorrow',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} day',
	        'relativeTimePattern-count-other': 'in {0} days'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} day ago',
	        'relativeTimePattern-count-other': '{0} days ago'
	      }
	    },
	    'day-narrow': {
	      'displayName': 'day',
	      'relative-type--1': 'yesterday',
	      'relative-type-0': 'today',
	      'relative-type-1': 'tomorrow',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} day',
	        'relativeTimePattern-count-other': 'in {0} days'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} day ago',
	        'relativeTimePattern-count-other': '{0} days ago'
	      }
	    },
	    'weekday': {
	      'displayName': 'day of the week'
	    },
	    'hour-wide': {
	      'displayName': 'hour',
	      'relative-type-0': 'this hour',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} hour',
	        'relativeTimePattern-count-other': 'in {0} hours'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} hour ago',
	        'relativeTimePattern-count-other': '{0} hours ago'
	      }
	    },
	    'hour-short': {
	      'displayName': 'hr.',
	      'relative-type-0': 'this hour',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} hr.',
	        'relativeTimePattern-count-other': 'in {0} hr.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} hr. ago',
	        'relativeTimePattern-count-other': '{0} hr. ago'
	      }
	    },
	    'hour-narrow': {
	      'displayName': 'hr.',
	      'relative-type-0': 'this hour',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} hr.',
	        'relativeTimePattern-count-other': 'in {0} hr.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} hr. ago',
	        'relativeTimePattern-count-other': '{0} hr. ago'
	      }
	    },
	    'minute-wide': {
	      'displayName': 'minute',
	      'relative-type-0': 'this minute',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} minute',
	        'relativeTimePattern-count-other': 'in {0} minutes'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} minute ago',
	        'relativeTimePattern-count-other': '{0} minutes ago'
	      }
	    },
	    'minute-short': {
	      'displayName': 'min.',
	      'relative-type-0': 'this minute',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} min.',
	        'relativeTimePattern-count-other': 'in {0} min.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} min. ago',
	        'relativeTimePattern-count-other': '{0} min. ago'
	      }
	    },
	    'minute-narrow': {
	      'displayName': 'min.',
	      'relative-type-0': 'this minute',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} min.',
	        'relativeTimePattern-count-other': 'in {0} min.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} min. ago',
	        'relativeTimePattern-count-other': '{0} min. ago'
	      }
	    },
	    'second-wide': {
	      'displayName': 'second',
	      'relative-type-0': 'now',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} second',
	        'relativeTimePattern-count-other': 'in {0} seconds'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} second ago',
	        'relativeTimePattern-count-other': '{0} seconds ago'
	      }
	    },
	    'second-short': {
	      'displayName': 'sec.',
	      'relative-type-0': 'now',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} sec.',
	        'relativeTimePattern-count-other': 'in {0} sec.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} sec. ago',
	        'relativeTimePattern-count-other': '{0} sec. ago'
	      }
	    },
	    'second-narrow': {
	      'displayName': 'sec.',
	      'relative-type-0': 'now',
	      'relativeTime-type-future': {
	        'relativeTimePattern-count-one': 'in {0} sec.',
	        'relativeTimePattern-count-other': 'in {0} sec.'
	      },
	      'relativeTime-type-past': {
	        'relativeTimePattern-count-one': '{0} sec. ago',
	        'relativeTimePattern-count-other': '{0} sec. ago'
	      }
	    },
	    'zone': {
	      'displayName': 'time zone'
	    }
	  },
	  'decimalFormat': {
	    'standard': '#,##0.###'
	  },
	  'currencyFormat': {
	    'standard': '\xA4#,##0.00',
	    'currencySpacing': {
	      'beforeCurrency': {
	        'currencyMatch': '[:^S:]',
	        'surroundingMatch': '[:digit:]',
	        'insertBetween': '\xA0'
	      },
	      'afterCurrency': {
	        'currencyMatch': '[:^S:]',
	        'surroundingMatch': '[:digit:]',
	        'insertBetween': '\xA0'
	      }
	    }
	  },
	  'percentFormat': {
	    'standard': '#,##0%'
	  },
	  'miscPattern': {
	    'approximately': '~{0}',
	    'atLeast': '{0}+',
	    'atMost': "\u2264{0}",
	    'range': "{0}\u2013{1}"
	  },
	  'symbols-latn-decimal': '.',
	  'symbols-latn-group': ',',
	  'symbols-latn-plusSign': '+',
	  'symbols-latn-minusSign': '-',
	  'symbols-latn-percentSign': '%',
	  'weekData-minDays': 4,
	  'weekData-firstDay': 1,
	  'weekData-weekendStart': 6,
	  'weekData-weekendEnd': 0,
	  'timeData': {
	    _allowed: 'H h',
	    _preferred: 'H'
	  },
	  'lenient-scope-number': {
	    'minusSign': "-\u2010\u2012\u2013\u207B\u208B\u2212\u2796\uFE63",
	    'commaSign': ",\u060C\u066B\u3001\uFE10\uFE11\uFE50\uFE51\uFF0C",
	    'plusSign': "+\u207A\u208A\u2795\uFB29\uFE62"
	  },
	  'plurals': {},
	  'units': {
	    'short': {
	      'per': {
	        'compoundUnitPattern': '{0}/{1}'
	      },
	      'acceleration-g-force': {
	        'displayName': 'g-force',
	        'unitPattern-count-one': '{0} G',
	        'unitPattern-count-other': '{0} G'
	      },
	      'acceleration-meter-per-second-squared': {
	        'displayName': 'meters/sec\xB2',
	        'unitPattern-count-one': '{0} m/s\xB2',
	        'unitPattern-count-other': '{0} m/s\xB2'
	      },
	      'angle-revolution': {
	        'displayName': 'rev',
	        'unitPattern-count-one': '{0} rev',
	        'unitPattern-count-other': '{0} rev'
	      },
	      'angle-radian': {
	        'displayName': 'radians',
	        'unitPattern-count-one': '{0} rad',
	        'unitPattern-count-other': '{0} rad'
	      },
	      'angle-degree': {
	        'displayName': 'degrees',
	        'unitPattern-count-one': '{0} deg',
	        'unitPattern-count-other': '{0} deg'
	      },
	      'angle-arc-minute': {
	        'displayName': 'arcmins',
	        'unitPattern-count-one': '{0} arcmin',
	        'unitPattern-count-other': '{0} arcmins'
	      },
	      'angle-arc-second': {
	        'displayName': 'arcsecs',
	        'unitPattern-count-one': '{0} arcsec',
	        'unitPattern-count-other': '{0} arcsecs'
	      },
	      'area-square-kilometer': {
	        'displayName': 'km\xB2',
	        'unitPattern-count-one': '{0} km\xB2',
	        'unitPattern-count-other': '{0} km\xB2',
	        'perUnitPattern': '{0}/km\xB2'
	      },
	      'area-hectare': {
	        'displayName': 'hectares',
	        'unitPattern-count-one': '{0} ha',
	        'unitPattern-count-other': '{0} ha'
	      },
	      'area-square-meter': {
	        'displayName': 'meters\xB2',
	        'unitPattern-count-one': '{0} m\xB2',
	        'unitPattern-count-other': '{0} m\xB2',
	        'perUnitPattern': '{0}/m\xB2'
	      },
	      'area-square-centimeter': {
	        'displayName': 'cm\xB2',
	        'unitPattern-count-one': '{0} cm\xB2',
	        'unitPattern-count-other': '{0} cm\xB2',
	        'perUnitPattern': '{0}/cm\xB2'
	      },
	      'area-square-mile': {
	        'displayName': 'sq miles',
	        'unitPattern-count-one': '{0} sq mi',
	        'unitPattern-count-other': '{0} sq mi',
	        'perUnitPattern': '{0}/mi\xB2'
	      },
	      'area-acre': {
	        'displayName': 'acres',
	        'unitPattern-count-one': '{0} ac',
	        'unitPattern-count-other': '{0} ac'
	      },
	      'area-square-yard': {
	        'displayName': 'yards\xB2',
	        'unitPattern-count-one': '{0} yd\xB2',
	        'unitPattern-count-other': '{0} yd\xB2'
	      },
	      'area-square-foot': {
	        'displayName': 'sq feet',
	        'unitPattern-count-one': '{0} sq ft',
	        'unitPattern-count-other': '{0} sq ft'
	      },
	      'area-square-inch': {
	        'displayName': 'inches\xB2',
	        'unitPattern-count-one': '{0} in\xB2',
	        'unitPattern-count-other': '{0} in\xB2',
	        'perUnitPattern': '{0}/in\xB2'
	      },
	      'concentr-karat': {
	        'displayName': 'karats',
	        'unitPattern-count-one': '{0} kt',
	        'unitPattern-count-other': '{0} kt'
	      },
	      'concentr-milligram-per-deciliter': {
	        'displayName': 'mg/dL',
	        'unitPattern-count-one': '{0} mg/dL',
	        'unitPattern-count-other': '{0} mg/dL'
	      },
	      'concentr-millimole-per-liter': {
	        'displayName': 'millimol/liter',
	        'unitPattern-count-one': '{0} mmol/L',
	        'unitPattern-count-other': '{0} mmol/L'
	      },
	      'concentr-part-per-million': {
	        'displayName': 'parts/million',
	        'unitPattern-count-one': '{0} ppm',
	        'unitPattern-count-other': '{0} ppm'
	      },
	      'consumption-liter-per-kilometer': {
	        'displayName': 'liters/km',
	        'unitPattern-count-one': '{0} L/km',
	        'unitPattern-count-other': '{0} L/km'
	      },
	      'consumption-liter-per-100kilometers': {
	        'displayName': 'L/100 km',
	        'unitPattern-count-one': '{0} L/100 km',
	        'unitPattern-count-other': '{0} L/100 km'
	      },
	      'consumption-mile-per-gallon': {
	        'displayName': 'miles/gal',
	        'unitPattern-count-one': '{0} mpg',
	        'unitPattern-count-other': '{0} mpg'
	      },
	      'consumption-mile-per-gallon-imperial': {
	        'displayName': 'miles/gal Imp.',
	        'unitPattern-count-one': '{0} mpg Imp.',
	        'unitPattern-count-other': '{0} mpg Imp.'
	      },
	      'digital-terabyte': {
	        'displayName': 'TByte',
	        'unitPattern-count-one': '{0} TB',
	        'unitPattern-count-other': '{0} TB'
	      },
	      'digital-terabit': {
	        'displayName': 'Tbit',
	        'unitPattern-count-one': '{0} Tb',
	        'unitPattern-count-other': '{0} Tb'
	      },
	      'digital-gigabyte': {
	        'displayName': 'GByte',
	        'unitPattern-count-one': '{0} GB',
	        'unitPattern-count-other': '{0} GB'
	      },
	      'digital-gigabit': {
	        'displayName': 'Gbit',
	        'unitPattern-count-one': '{0} Gb',
	        'unitPattern-count-other': '{0} Gb'
	      },
	      'digital-megabyte': {
	        'displayName': 'MByte',
	        'unitPattern-count-one': '{0} MB',
	        'unitPattern-count-other': '{0} MB'
	      },
	      'digital-megabit': {
	        'displayName': 'Mbit',
	        'unitPattern-count-one': '{0} Mb',
	        'unitPattern-count-other': '{0} Mb'
	      },
	      'digital-kilobyte': {
	        'displayName': 'kByte',
	        'unitPattern-count-one': '{0} kB',
	        'unitPattern-count-other': '{0} kB'
	      },
	      'digital-kilobit': {
	        'displayName': 'kbit',
	        'unitPattern-count-one': '{0} kb',
	        'unitPattern-count-other': '{0} kb'
	      },
	      'digital-byte': {
	        'displayName': 'byte',
	        'unitPattern-count-one': '{0} byte',
	        'unitPattern-count-other': '{0} byte'
	      },
	      'digital-bit': {
	        'displayName': 'bit',
	        'unitPattern-count-one': '{0} bit',
	        'unitPattern-count-other': '{0} bit'
	      },
	      'duration-century': {
	        'displayName': 'c',
	        'unitPattern-count-one': '{0} c',
	        'unitPattern-count-other': '{0} c'
	      },
	      'duration-year': {
	        'displayName': 'years',
	        'unitPattern-count-one': '{0} yr',
	        'unitPattern-count-other': '{0} yrs',
	        'perUnitPattern': '{0}/y'
	      },
	      'duration-month': {
	        'displayName': 'months',
	        'unitPattern-count-one': '{0} mth',
	        'unitPattern-count-other': '{0} mths',
	        'perUnitPattern': '{0}/m'
	      },
	      'duration-week': {
	        'displayName': 'weeks',
	        'unitPattern-count-one': '{0} wk',
	        'unitPattern-count-other': '{0} wks',
	        'perUnitPattern': '{0}/w'
	      },
	      'duration-day': {
	        'displayName': 'days',
	        'unitPattern-count-one': '{0} day',
	        'unitPattern-count-other': '{0} days',
	        'perUnitPattern': '{0}/d'
	      },
	      'duration-hour': {
	        'displayName': 'hours',
	        'unitPattern-count-one': '{0} hr',
	        'unitPattern-count-other': '{0} hr',
	        'perUnitPattern': '{0}/h'
	      },
	      'duration-minute': {
	        'displayName': 'mins',
	        'unitPattern-count-one': '{0} min',
	        'unitPattern-count-other': '{0} min',
	        'perUnitPattern': '{0}/min'
	      },
	      'duration-second': {
	        'displayName': 'secs',
	        'unitPattern-count-one': '{0} sec',
	        'unitPattern-count-other': '{0} sec',
	        'perUnitPattern': '{0}/s'
	      },
	      'duration-millisecond': {
	        'displayName': 'millisecs',
	        'unitPattern-count-one': '{0} ms',
	        'unitPattern-count-other': '{0} ms'
	      },
	      'duration-microsecond': {
	        'displayName': 'μsecs',
	        'unitPattern-count-one': '{0} μs',
	        'unitPattern-count-other': '{0} μs'
	      },
	      'duration-nanosecond': {
	        'displayName': 'nanosecs',
	        'unitPattern-count-one': '{0} ns',
	        'unitPattern-count-other': '{0} ns'
	      },
	      'electric-ampere': {
	        'displayName': 'amps',
	        'unitPattern-count-one': '{0} A',
	        'unitPattern-count-other': '{0} A'
	      },
	      'electric-milliampere': {
	        'displayName': 'milliamps',
	        'unitPattern-count-one': '{0} mA',
	        'unitPattern-count-other': '{0} mA'
	      },
	      'electric-ohm': {
	        'displayName': 'ohms',
	        'unitPattern-count-one': '{0} Ω',
	        'unitPattern-count-other': '{0} Ω'
	      },
	      'electric-volt': {
	        'displayName': 'volts',
	        'unitPattern-count-one': '{0} V',
	        'unitPattern-count-other': '{0} V'
	      },
	      'energy-kilocalorie': {
	        'displayName': 'kcal',
	        'unitPattern-count-one': '{0} kcal',
	        'unitPattern-count-other': '{0} kcal'
	      },
	      'energy-calorie': {
	        'displayName': 'cal',
	        'unitPattern-count-one': '{0} cal',
	        'unitPattern-count-other': '{0} cal'
	      },
	      'energy-foodcalorie': {
	        'displayName': 'Cal',
	        'unitPattern-count-one': '{0} Cal',
	        'unitPattern-count-other': '{0} Cal'
	      },
	      'energy-kilojoule': {
	        'displayName': 'kilojoule',
	        'unitPattern-count-one': '{0} kJ',
	        'unitPattern-count-other': '{0} kJ'
	      },
	      'energy-joule': {
	        'displayName': 'joules',
	        'unitPattern-count-one': '{0} J',
	        'unitPattern-count-other': '{0} J'
	      },
	      'energy-kilowatt-hour': {
	        'displayName': 'kW-hour',
	        'unitPattern-count-one': '{0} kWh',
	        'unitPattern-count-other': '{0} kWh'
	      },
	      'frequency-gigahertz': {
	        'displayName': 'GHz',
	        'unitPattern-count-one': '{0} GHz',
	        'unitPattern-count-other': '{0} GHz'
	      },
	      'frequency-megahertz': {
	        'displayName': 'MHz',
	        'unitPattern-count-one': '{0} MHz',
	        'unitPattern-count-other': '{0} MHz'
	      },
	      'frequency-kilohertz': {
	        'displayName': 'kHz',
	        'unitPattern-count-one': '{0} kHz',
	        'unitPattern-count-other': '{0} kHz'
	      },
	      'frequency-hertz': {
	        'displayName': 'Hz',
	        'unitPattern-count-one': '{0} Hz',
	        'unitPattern-count-other': '{0} Hz'
	      },
	      'length-kilometer': {
	        'displayName': 'km',
	        'unitPattern-count-one': '{0} km',
	        'unitPattern-count-other': '{0} km',
	        'perUnitPattern': '{0}/km'
	      },
	      'length-meter': {
	        'displayName': 'm',
	        'unitPattern-count-one': '{0} m',
	        'unitPattern-count-other': '{0} m',
	        'perUnitPattern': '{0}/m'
	      },
	      'length-decimeter': {
	        'displayName': 'dm',
	        'unitPattern-count-one': '{0} dm',
	        'unitPattern-count-other': '{0} dm'
	      },
	      'length-centimeter': {
	        'displayName': 'cm',
	        'unitPattern-count-one': '{0} cm',
	        'unitPattern-count-other': '{0} cm',
	        'perUnitPattern': '{0}/cm'
	      },
	      'length-millimeter': {
	        'displayName': 'mm',
	        'unitPattern-count-one': '{0} mm',
	        'unitPattern-count-other': '{0} mm'
	      },
	      'length-micrometer': {
	        'displayName': 'µmeters',
	        'unitPattern-count-one': '{0} µm',
	        'unitPattern-count-other': '{0} µm'
	      },
	      'length-nanometer': {
	        'displayName': 'nm',
	        'unitPattern-count-one': '{0} nm',
	        'unitPattern-count-other': '{0} nm'
	      },
	      'length-picometer': {
	        'displayName': 'pm',
	        'unitPattern-count-one': '{0} pm',
	        'unitPattern-count-other': '{0} pm'
	      },
	      'length-mile': {
	        'displayName': 'miles',
	        'unitPattern-count-one': '{0} mi',
	        'unitPattern-count-other': '{0} mi'
	      },
	      'length-yard': {
	        'displayName': 'yards',
	        'unitPattern-count-one': '{0} yd',
	        'unitPattern-count-other': '{0} yd'
	      },
	      'length-foot': {
	        'displayName': 'feet',
	        'unitPattern-count-one': '{0} ft',
	        'unitPattern-count-other': '{0} ft',
	        'perUnitPattern': '{0}/ft'
	      },
	      'length-inch': {
	        'displayName': 'inches',
	        'unitPattern-count-one': '{0} in',
	        'unitPattern-count-other': '{0} in',
	        'perUnitPattern': '{0}/in'
	      },
	      'length-parsec': {
	        'displayName': 'parsecs',
	        'unitPattern-count-one': '{0} pc',
	        'unitPattern-count-other': '{0} pc'
	      },
	      'length-light-year': {
	        'displayName': 'light yrs',
	        'unitPattern-count-one': '{0} ly',
	        'unitPattern-count-other': '{0} ly'
	      },
	      'length-astronomical-unit': {
	        'displayName': 'au',
	        'unitPattern-count-one': '{0} au',
	        'unitPattern-count-other': '{0} au'
	      },
	      'length-furlong': {
	        'displayName': 'furlongs',
	        'unitPattern-count-one': '{0} fur',
	        'unitPattern-count-other': '{0} fur'
	      },
	      'length-fathom': {
	        'displayName': 'fathoms',
	        'unitPattern-count-one': '{0} ftm',
	        'unitPattern-count-other': '{0} ftm'
	      },
	      'length-nautical-mile': {
	        'displayName': 'nmi',
	        'unitPattern-count-one': '{0} nmi',
	        'unitPattern-count-other': '{0} nmi'
	      },
	      'length-mile-scandinavian': {
	        'displayName': 'smi',
	        'unitPattern-count-one': '{0} smi',
	        'unitPattern-count-other': '{0} smi'
	      },
	      'length-point': {
	        'displayName': 'points',
	        'unitPattern-count-one': '{0} pt',
	        'unitPattern-count-other': '{0} pt'
	      },
	      'light-lux': {
	        'displayName': 'lux',
	        'unitPattern-count-one': '{0} lx',
	        'unitPattern-count-other': '{0} lx'
	      },
	      'mass-metric-ton': {
	        'displayName': 't',
	        'unitPattern-count-one': '{0} t',
	        'unitPattern-count-other': '{0} t'
	      },
	      'mass-kilogram': {
	        'displayName': 'kg',
	        'unitPattern-count-one': '{0} kg',
	        'unitPattern-count-other': '{0} kg',
	        'perUnitPattern': '{0}/kg'
	      },
	      'mass-gram': {
	        'displayName': 'grams',
	        'unitPattern-count-one': '{0} g',
	        'unitPattern-count-other': '{0} g',
	        'perUnitPattern': '{0}/g'
	      },
	      'mass-milligram': {
	        'displayName': 'mg',
	        'unitPattern-count-one': '{0} mg',
	        'unitPattern-count-other': '{0} mg'
	      },
	      'mass-microgram': {
	        'displayName': 'µg',
	        'unitPattern-count-one': '{0} µg',
	        'unitPattern-count-other': '{0} µg'
	      },
	      'mass-ton': {
	        'displayName': 'tons',
	        'unitPattern-count-one': '{0} tn',
	        'unitPattern-count-other': '{0} tn'
	      },
	      'mass-stone': {
	        'displayName': 'stones',
	        'unitPattern-count-one': '{0} st',
	        'unitPattern-count-other': '{0} st'
	      },
	      'mass-pound': {
	        'displayName': 'pounds',
	        'unitPattern-count-one': '{0} lb',
	        'unitPattern-count-other': '{0} lb',
	        'perUnitPattern': '{0}/lb'
	      },
	      'mass-ounce': {
	        'displayName': 'oz',
	        'unitPattern-count-one': '{0} oz',
	        'unitPattern-count-other': '{0} oz',
	        'perUnitPattern': '{0}/oz'
	      },
	      'mass-ounce-troy': {
	        'displayName': 'oz troy',
	        'unitPattern-count-one': '{0} oz t',
	        'unitPattern-count-other': '{0} oz t'
	      },
	      'mass-carat': {
	        'displayName': 'carats',
	        'unitPattern-count-one': '{0} CD',
	        'unitPattern-count-other': '{0} CD'
	      },
	      'power-gigawatt': {
	        'displayName': 'GW',
	        'unitPattern-count-one': '{0} GW',
	        'unitPattern-count-other': '{0} GW'
	      },
	      'power-megawatt': {
	        'displayName': 'MW',
	        'unitPattern-count-one': '{0} MW',
	        'unitPattern-count-other': '{0} MW'
	      },
	      'power-kilowatt': {
	        'displayName': 'kW',
	        'unitPattern-count-one': '{0} kW',
	        'unitPattern-count-other': '{0} kW'
	      },
	      'power-watt': {
	        'displayName': 'watts',
	        'unitPattern-count-one': '{0} W',
	        'unitPattern-count-other': '{0} W'
	      },
	      'power-milliwatt': {
	        'displayName': 'mW',
	        'unitPattern-count-one': '{0} mW',
	        'unitPattern-count-other': '{0} mW'
	      },
	      'power-horsepower': {
	        'displayName': 'hp',
	        'unitPattern-count-one': '{0} hp',
	        'unitPattern-count-other': '{0} hp'
	      },
	      'pressure-hectopascal': {
	        'displayName': 'hPa',
	        'unitPattern-count-one': '{0} hPa',
	        'unitPattern-count-other': '{0} hPa'
	      },
	      'pressure-millimeter-of-mercury': {
	        'displayName': 'mmHg',
	        'unitPattern-count-one': '{0} mmHg',
	        'unitPattern-count-other': '{0} mmHg'
	      },
	      'pressure-pound-per-square-inch': {
	        'displayName': 'psi',
	        'unitPattern-count-one': '{0} psi',
	        'unitPattern-count-other': '{0} psi'
	      },
	      'pressure-inch-hg': {
	        'displayName': 'inHg',
	        'unitPattern-count-one': '{0} inHg',
	        'unitPattern-count-other': '{0} inHg'
	      },
	      'pressure-millibar': {
	        'displayName': 'mbar',
	        'unitPattern-count-one': '{0} mbar',
	        'unitPattern-count-other': '{0} mbar'
	      },
	      'speed-kilometer-per-hour': {
	        'displayName': 'km/hour',
	        'unitPattern-count-one': '{0} kph',
	        'unitPattern-count-other': '{0} kph'
	      },
	      'speed-meter-per-second': {
	        'displayName': 'meters/sec',
	        'unitPattern-count-one': '{0} m/s',
	        'unitPattern-count-other': '{0} m/s'
	      },
	      'speed-mile-per-hour': {
	        'displayName': 'miles/hour',
	        'unitPattern-count-one': '{0} mph',
	        'unitPattern-count-other': '{0} mph'
	      },
	      'speed-knot': {
	        'displayName': 'kn',
	        'unitPattern-count-one': '{0} kn',
	        'unitPattern-count-other': '{0} kn'
	      },
	      'temperature-generic': {
	        'displayName': '\xB0',
	        'unitPattern-count-other': '{0}\xB0'
	      },
	      'temperature-celsius': {
	        'displayName': 'deg. C',
	        'unitPattern-count-one': '{0}\xB0C',
	        'unitPattern-count-other': '{0}\xB0C'
	      },
	      'temperature-fahrenheit': {
	        'displayName': 'deg. F',
	        'unitPattern-count-one': '{0}\xB0F',
	        'unitPattern-count-other': '{0}\xB0F'
	      },
	      'temperature-kelvin': {
	        'displayName': 'K',
	        'unitPattern-count-one': '{0} K',
	        'unitPattern-count-other': '{0} K'
	      },
	      'volume-cubic-kilometer': {
	        'displayName': 'km\xB3',
	        'unitPattern-count-one': '{0} km\xB3',
	        'unitPattern-count-other': '{0} km\xB3'
	      },
	      'volume-cubic-meter': {
	        'displayName': 'm\xB3',
	        'unitPattern-count-one': '{0} m\xB3',
	        'unitPattern-count-other': '{0} m\xB3',
	        'perUnitPattern': '{0}/m\xB3'
	      },
	      'volume-cubic-centimeter': {
	        'displayName': 'cm\xB3',
	        'unitPattern-count-one': '{0} cm\xB3',
	        'unitPattern-count-other': '{0} cm\xB3',
	        'perUnitPattern': '{0}/cm\xB3'
	      },
	      'volume-cubic-mile': {
	        'displayName': 'mi\xB3',
	        'unitPattern-count-one': '{0} mi\xB3',
	        'unitPattern-count-other': '{0} mi\xB3'
	      },
	      'volume-cubic-yard': {
	        'displayName': 'yards\xB3',
	        'unitPattern-count-one': '{0} yd\xB3',
	        'unitPattern-count-other': '{0} yd\xB3'
	      },
	      'volume-cubic-foot': {
	        'displayName': 'feet\xB3',
	        'unitPattern-count-one': '{0} ft\xB3',
	        'unitPattern-count-other': '{0} ft\xB3'
	      },
	      'volume-cubic-inch': {
	        'displayName': 'inches\xB3',
	        'unitPattern-count-one': '{0} in\xB3',
	        'unitPattern-count-other': '{0} in\xB3'
	      },
	      'volume-megaliter': {
	        'displayName': 'ML',
	        'unitPattern-count-one': '{0} ML',
	        'unitPattern-count-other': '{0} ML'
	      },
	      'volume-hectoliter': {
	        'displayName': 'hL',
	        'unitPattern-count-one': '{0} hL',
	        'unitPattern-count-other': '{0} hL'
	      },
	      'volume-liter': {
	        'displayName': 'liters',
	        'unitPattern-count-one': '{0} L',
	        'unitPattern-count-other': '{0} L',
	        'perUnitPattern': '{0}/L'
	      },
	      'volume-deciliter': {
	        'displayName': 'dL',
	        'unitPattern-count-one': '{0} dL',
	        'unitPattern-count-other': '{0} dL'
	      },
	      'volume-centiliter': {
	        'displayName': 'cL',
	        'unitPattern-count-one': '{0} cL',
	        'unitPattern-count-other': '{0} cL'
	      },
	      'volume-milliliter': {
	        'displayName': 'mL',
	        'unitPattern-count-one': '{0} mL',
	        'unitPattern-count-other': '{0} mL'
	      },
	      'volume-pint-metric': {
	        'displayName': 'mpt',
	        'unitPattern-count-one': '{0} mpt',
	        'unitPattern-count-other': '{0} mpt'
	      },
	      'volume-cup-metric': {
	        'displayName': 'mcup',
	        'unitPattern-count-one': '{0} mc',
	        'unitPattern-count-other': '{0} mc'
	      },
	      'volume-acre-foot': {
	        'displayName': 'acre ft',
	        'unitPattern-count-one': '{0} ac ft',
	        'unitPattern-count-other': '{0} ac ft'
	      },
	      'volume-bushel': {
	        'displayName': 'bushels',
	        'unitPattern-count-one': '{0} bu',
	        'unitPattern-count-other': '{0} bu'
	      },
	      'volume-gallon': {
	        'displayName': 'gal',
	        'unitPattern-count-one': '{0} gal',
	        'unitPattern-count-other': '{0} gal',
	        'perUnitPattern': '{0}/gal US'
	      },
	      'volume-gallon-imperial': {
	        'displayName': 'Imp. gal',
	        'unitPattern-count-one': '{0} gal Imp.',
	        'unitPattern-count-other': '{0} gal Imp.',
	        'perUnitPattern': '{0}/gal Imp.'
	      },
	      'volume-quart': {
	        'displayName': 'qts',
	        'unitPattern-count-one': '{0} qt',
	        'unitPattern-count-other': '{0} qt'
	      },
	      'volume-pint': {
	        'displayName': 'pints',
	        'unitPattern-count-one': '{0} pt',
	        'unitPattern-count-other': '{0} pt'
	      },
	      'volume-cup': {
	        'displayName': 'cups',
	        'unitPattern-count-one': '{0} c',
	        'unitPattern-count-other': '{0} c'
	      },
	      'volume-fluid-ounce': {
	        'displayName': 'fl oz',
	        'unitPattern-count-one': '{0} fl oz',
	        'unitPattern-count-other': '{0} fl oz'
	      },
	      'volume-tablespoon': {
	        'displayName': 'tbsp',
	        'unitPattern-count-one': '{0} tbsp',
	        'unitPattern-count-other': '{0} tbsp'
	      },
	      'volume-teaspoon': {
	        'displayName': 'tsp',
	        'unitPattern-count-one': '{0} tsp',
	        'unitPattern-count-other': '{0} tsp'
	      },
	      'coordinateUnit': {
	        'east': '{0} E',
	        'north': '{0} N',
	        'south': '{0} S',
	        'west': '{0} W'
	      }
	    }
	  }
	};
	var M_ISO639_OLD_TO_NEW$1 = {
	  'iw': 'he',
	  'ji': 'yi',
	  'in': 'id',
	  'sh': 'sr'
	};

	var M_SUPPORTED_LOCALES = function () {
	  var LOCALES = Locale._cldrLocales,
	      result = {},
	      i;

	  if (LOCALES) {
	    for (i = 0; i < LOCALES.length; i++) {
	      result[LOCALES[i]] = true;
	    }
	  }

	  return result;
	}();

	var mLocaleDatas = {};

	function getCLDRCalendarName(sCalendarType) {
	  if (!sCalendarType) {
	    sCalendarType = Core.getConfiguration().getCalendarType();
	  }

	  return 'ca-' + sCalendarType.toLowerCase();
	}

	function getData(oLocale) {
	  var sLanguage = oLocale.getLanguage() || '',
	      sScript = oLocale.getScript() || '',
	      sRegion = oLocale.getRegion() || '',
	      mData;

	  function merge(obj, fallbackObj) {
	    var name, value, fallbackValue;

	    if (!fallbackObj) {
	      return;
	    }

	    for (name in fallbackObj) {
	      if (fallbackObj.hasOwnProperty(name)) {
	        value = obj[name];
	        fallbackValue = fallbackObj[name];

	        if (value === undefined) {
	          obj[name] = fallbackValue;
	        } else if (value === null) {
	          delete obj[name];
	        } else if (__chunk_1._typeof(value) === 'object' && __chunk_1._typeof(fallbackValue) === 'object') {
	          merge(value, fallbackValue);
	        }
	      }
	    }
	  }

	  function getOrLoad(sId) {
	    if (!mLocaleDatas[sId] && (!M_SUPPORTED_LOCALES || M_SUPPORTED_LOCALES[sId] === true)) {
	      var data = mLocaleDatas[sId] = LoaderExtensions.loadResource('sap/ui/core/cldr/' + sId + '.json', {
	        dataType: 'json',
	        failOnError: false
	      });

	      if (data && data.__fallbackLocale) {
	        merge(data, getOrLoad(data.__fallbackLocale));
	        delete data.__fallbackLocale;
	      }
	    }

	    return mLocaleDatas[sId];
	  }

	  sLanguage = sLanguage && M_ISO639_OLD_TO_NEW$1[sLanguage] || sLanguage;

	  if (sLanguage === 'no') {
	    sLanguage = 'nb';
	  }

	  if (sLanguage === 'zh' && !sRegion) {
	    if (sScript === 'Hans') {
	      sRegion = 'CN';
	    } else if (sScript === 'Hant') {
	      sRegion = 'TW';
	    }
	  }

	  var sId = sLanguage + '_' + sRegion;

	  if (sLanguage && sRegion) {
	    mData = getOrLoad(sId);
	  }

	  if (!mData && sLanguage) {
	    mData = getOrLoad(sLanguage);
	  }

	  mLocaleDatas[sId] = mData || M_DEFAULT_DATA;
	  return mLocaleDatas[sId];
	}

	var CustomLocaleData = LocaleData.extend('sap.ui.core.CustomLocaleData', {
	  constructor: function constructor(oLocale) {
	    LocaleData.apply(this, arguments);
	    this.mCustomData = Core.getConfiguration().getFormatSettings().getCustomLocaleData();
	  },
	  _get: function _get() {
	    var aArguments = Array.prototype.slice.call(arguments),
	        sCalendar,
	        sKey;

	    if (aArguments[0].indexOf('ca-') == 0) {
	      sCalendar = aArguments[0];

	      if (sCalendar == getCLDRCalendarName()) {
	        aArguments = aArguments.slice(1);
	      }
	    }

	    sKey = aArguments.join('-');
	    var vValue = this.mCustomData[sKey];

	    if (vValue == null) {
	      vValue = this._getDeep(this.mCustomData, arguments);

	      if (vValue == null) {
	        vValue = this._getDeep(this.mData, arguments);
	      }
	    }

	    return vValue;
	  },
	  _getMerged: function _getMerged() {
	    var mData = this._getDeep(this.mData, arguments);

	    var mCustomData = this._getDeep(this.mCustomData, arguments);

	    return fnExtend({}, mData, mCustomData);
	  }
	});

	LocaleData.getInstance = function (oLocale) {
	  return oLocale.hasPrivateUseSubtag('sapufmt') ? new CustomLocaleData(oLocale) : new LocaleData(oLocale);
	};

	var mRegistry = new Map();
	var _Calendars = {
	  get: function get(sCalendarType) {
	    if (!mRegistry.has(sCalendarType)) {
	      throw new Error("Required calendar type: " + sCalendarType + " not loaded.");
	    }

	    return mRegistry.get(sCalendarType);
	  },
	  set: function set(sCalendarType, CalendarClass) {
	    mRegistry.set(sCalendarType, CalendarClass);
	  }
	};

	var UniversalDate = BaseObject$1.extend('sap.ui.core.date.UniversalDate', {
	  constructor: function constructor() {
	    var clDate = UniversalDate.getClass();
	    return this.createDate(clDate, arguments);
	  }
	});

	UniversalDate.UTC = function () {
	  var clDate = UniversalDate.getClass();
	  return clDate.UTC.apply(clDate, arguments);
	};

	UniversalDate.now = function () {
	  return Date.now();
	};

	UniversalDate.prototype.createDate = function (clDate, aArgs) {
	  switch (aArgs.length) {
	    case 0:
	      return new clDate();

	    case 1:
	      return new clDate(aArgs[0]);

	    case 2:
	      return new clDate(aArgs[0], aArgs[1]);

	    case 3:
	      return new clDate(aArgs[0], aArgs[1], aArgs[2]);

	    case 4:
	      return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3]);

	    case 5:
	      return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4]);

	    case 6:
	      return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4], aArgs[5]);

	    case 7:
	      return new clDate(aArgs[0], aArgs[1], aArgs[2], aArgs[3], aArgs[4], aArgs[5], aArgs[6]);
	  }
	};

	UniversalDate.getInstance = function (oDate, sCalendarType) {
	  var clDate, oInstance;

	  if (oDate instanceof UniversalDate) {
	    oDate = oDate.getJSDate();
	  }

	  if (!sCalendarType) {
	    sCalendarType = Core.getConfiguration().getCalendarType();
	  }

	  clDate = UniversalDate.getClass(sCalendarType);
	  oInstance = Object.create(clDate.prototype);
	  oInstance.oDate = oDate;
	  oInstance.sCalendarType = sCalendarType;
	  return oInstance;
	};

	UniversalDate.getClass = function (sCalendarType) {
	  if (!sCalendarType) {
	    sCalendarType = Core.getConfiguration().getCalendarType();
	  }

	  return _Calendars.get(sCalendarType);
	};

	['getDate', 'getMonth', 'getFullYear', 'getYear', 'getDay', 'getHours', 'getMinutes', 'getSeconds', 'getMilliseconds', 'getUTCDate', 'getUTCMonth', 'getUTCFullYear', 'getUTCDay', 'getUTCHours', 'getUTCMinutes', 'getUTCSeconds', 'getUTCMilliseconds', 'getTime', 'valueOf', 'getTimezoneOffset', 'toString', 'toDateString', 'setDate', 'setFullYear', 'setYear', 'setMonth', 'setHours', 'setMinutes', 'setSeconds', 'setMilliseconds', 'setUTCDate', 'setUTCFullYear', 'setUTCMonth', 'setUTCHours', 'setUTCMinutes', 'setUTCSeconds', 'setUTCMilliseconds'].forEach(function (sName) {
	  UniversalDate.prototype[sName] = function () {
	    return this.oDate[sName].apply(this.oDate, arguments);
	  };
	});

	UniversalDate.prototype.getJSDate = function () {
	  return this.oDate;
	};

	UniversalDate.prototype.getCalendarType = function () {
	  return this.sCalendarType;
	};

	UniversalDate.prototype.getEra = function () {
	  return UniversalDate.getEraByDate(this.sCalendarType, this.oDate.getFullYear(), this.oDate.getMonth(), this.oDate.getDate());
	};

	UniversalDate.prototype.setEra = function (iEra) {};

	UniversalDate.prototype.getUTCEra = function () {
	  return UniversalDate.getEraByDate(this.sCalendarType, this.oDate.getUTCFullYear(), this.oDate.getUTCMonth(), this.oDate.getUTCDate());
	};

	UniversalDate.prototype.setUTCEra = function (iEra) {};

	UniversalDate.prototype.getWeek = function () {
	  return UniversalDate.getWeekByDate(this.sCalendarType, this.getFullYear(), this.getMonth(), this.getDate());
	};

	UniversalDate.prototype.setWeek = function (oWeek) {
	  var oDate = UniversalDate.getFirstDateOfWeek(this.sCalendarType, oWeek.year || this.getFullYear(), oWeek.week);
	  this.setFullYear(oDate.year, oDate.month, oDate.day);
	};

	UniversalDate.prototype.getUTCWeek = function () {
	  return UniversalDate.getWeekByDate(this.sCalendarType, this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate());
	};

	UniversalDate.prototype.setUTCWeek = function (oWeek) {
	  var oDate = UniversalDate.getFirstDateOfWeek(this.sCalendarType, oWeek.year || this.getFullYear(), oWeek.week);
	  this.setUTCFullYear(oDate.year, oDate.month, oDate.day);
	};

	UniversalDate.prototype.getQuarter = function () {
	  return Math.floor(this.getMonth() / 3);
	};

	UniversalDate.prototype.getUTCQuarter = function () {
	  return Math.floor(this.getUTCMonth() / 3);
	};

	UniversalDate.prototype.getDayPeriod = function () {
	  if (this.getHours() < 12) {
	    return 0;
	  } else {
	    return 1;
	  }
	};

	UniversalDate.prototype.getUTCDayPeriod = function () {
	  if (this.getUTCHours() < 12) {
	    return 0;
	  } else {
	    return 1;
	  }
	};

	UniversalDate.prototype.getTimezoneShort = function () {
	  if (this.oDate.getTimezoneShort) {
	    return this.oDate.getTimezoneShort();
	  }
	};

	UniversalDate.prototype.getTimezoneLong = function () {
	  if (this.oDate.getTimezoneLong) {
	    return this.oDate.getTimezoneLong();
	  }
	};

	var iMillisecondsInWeek = 7 * 24 * 60 * 60 * 1000;

	UniversalDate.getWeekByDate = function (sCalendarType, iYear, iMonth, iDay) {
	  var oLocale = Core.getConfiguration().getFormatSettings().getFormatLocale(),
	      clDate = this.getClass(sCalendarType),
	      oFirstDay = getFirstDayOfFirstWeek(clDate, iYear),
	      oDate = new clDate(clDate.UTC(iYear, iMonth, iDay)),
	      iWeek,
	      iLastYear,
	      iNextYear,
	      oLastFirstDay,
	      oNextFirstDay;

	  if (oLocale.getRegion() === 'US') {
	    iWeek = calculateWeeks(oFirstDay, oDate);
	  } else {
	    iLastYear = iYear - 1;
	    iNextYear = iYear + 1;
	    oLastFirstDay = getFirstDayOfFirstWeek(clDate, iLastYear);
	    oNextFirstDay = getFirstDayOfFirstWeek(clDate, iNextYear);

	    if (oDate >= oNextFirstDay) {
	      iYear = iNextYear;
	      iWeek = 0;
	    } else if (oDate < oFirstDay) {
	      iYear = iLastYear;
	      iWeek = calculateWeeks(oLastFirstDay, oDate);
	    } else {
	      iWeek = calculateWeeks(oFirstDay, oDate);
	    }
	  }

	  return {
	    year: iYear,
	    week: iWeek
	  };
	};

	UniversalDate.getFirstDateOfWeek = function (sCalendarType, iYear, iWeek) {
	  var oLocale = Core.getConfiguration().getFormatSettings().getFormatLocale(),
	      clDate = this.getClass(sCalendarType),
	      oFirstDay = getFirstDayOfFirstWeek(clDate, iYear),
	      oDate = new clDate(oFirstDay.valueOf() + iWeek * iMillisecondsInWeek);

	  if (oLocale.getRegion() === 'US' && iWeek === 0 && oFirstDay.getUTCFullYear() < iYear) {
	    return {
	      year: iYear,
	      month: 0,
	      day: 1
	    };
	  }

	  return {
	    year: oDate.getUTCFullYear(),
	    month: oDate.getUTCMonth(),
	    day: oDate.getUTCDate()
	  };
	};

	function getFirstDayOfFirstWeek(clDate, iYear) {
	  var oLocale = Core.getConfiguration().getFormatSettings().getFormatLocale(),
	      oLocaleData = LocaleData.getInstance(oLocale),
	      iMinDays = oLocaleData.getMinimalDaysInFirstWeek(),
	      iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek(),
	      oFirstDay = new clDate(clDate.UTC(iYear, 0, 1)),
	      iDayCount = 7;

	  while (oFirstDay.getUTCDay() !== iFirstDayOfWeek) {
	    oFirstDay.setUTCDate(oFirstDay.getUTCDate() - 1);
	    iDayCount--;
	  }

	  if (iDayCount < iMinDays) {
	    oFirstDay.setUTCDate(oFirstDay.getUTCDate() + 7);
	  }

	  return oFirstDay;
	}

	function calculateWeeks(oFromDate, oToDate) {
	  return Math.floor((oToDate.valueOf() - oFromDate.valueOf()) / iMillisecondsInWeek);
	}

	var mEras = {};

	UniversalDate.getEraByDate = function (sCalendarType, iYear, iMonth, iDay) {
	  var aEras = getEras(sCalendarType),
	      iTimestamp = new Date(0).setUTCFullYear(iYear, iMonth, iDay),
	      oEra;

	  for (var i = aEras.length - 1; i >= 0; i--) {
	    oEra = aEras[i];

	    if (!oEra) {
	      continue;
	    }

	    if (oEra._start && iTimestamp >= oEra._startInfo.timestamp) {
	      return i;
	    }

	    if (oEra._end && iTimestamp < oEra._endInfo.timestamp) {
	      return i;
	    }
	  }
	};

	UniversalDate.getCurrentEra = function (sCalendarType) {
	  var oNow = new Date();
	  return this.getEraByDate(sCalendarType, oNow.getFullYear(), oNow.getMonth(), oNow.getDate());
	};

	UniversalDate.getEraStartDate = function (sCalendarType, iEra) {
	  var aEras = getEras(sCalendarType),
	      oEra = aEras[iEra] || aEras[0];

	  if (oEra._start) {
	    return oEra._startInfo;
	  }
	};

	function getEras(sCalendarType) {
	  var oLocale = Core.getConfiguration().getFormatSettings().getFormatLocale(),
	      oLocaleData = LocaleData.getInstance(oLocale),
	      aEras = mEras[sCalendarType];

	  if (!aEras) {
	    var aEras = oLocaleData.getEraDates(sCalendarType);

	    if (!aEras[0]) {
	      aEras[0] = {
	        _start: '1-1-1'
	      };
	    }

	    for (var i = 0; i < aEras.length; i++) {
	      var oEra = aEras[i];

	      if (!oEra) {
	        continue;
	      }

	      if (oEra._start) {
	        oEra._startInfo = parseDateString(oEra._start);
	      }

	      if (oEra._end) {
	        oEra._endInfo = parseDateString(oEra._end);
	      }
	    }

	    mEras[sCalendarType] = aEras;
	  }

	  return aEras;
	}

	function parseDateString(sDateString) {
	  var aParts = sDateString.split('-'),
	      iYear,
	      iMonth,
	      iDay;

	  if (aParts[0] == '') {
	    iYear = -parseInt(aParts[1]);
	    iMonth = parseInt(aParts[2]) - 1;
	    iDay = parseInt(aParts[3]);
	  } else {
	    iYear = parseInt(aParts[0]);
	    iMonth = parseInt(aParts[1]) - 1;
	    iDay = parseInt(aParts[2]);
	  }

	  return {
	    timestamp: new Date(0).setUTCFullYear(iYear, iMonth, iDay),
	    year: iYear,
	    month: iMonth,
	    day: iDay
	  };
	}

	var Buddhist = UniversalDate.extend('sap.ui.core.date.Buddhist', {
	  constructor: function constructor() {
	    var aArgs = arguments;

	    if (aArgs.length > 1) {
	      aArgs = toGregorianArguments(aArgs);
	    }

	    this.oDate = this.createDate(Date, aArgs);
	    this.sCalendarType = CalendarType$1.Buddhist;
	  }
	});

	Buddhist.UTC = function () {
	  var aArgs = toGregorianArguments(arguments);
	  return Date.UTC.apply(Date, aArgs);
	};

	Buddhist.now = function () {
	  return Date.now();
	};

	function toBuddhist(oGregorian) {
	  var iEraStartYear = UniversalDate.getEraStartDate(CalendarType$1.Buddhist, 0).year,
	      iYear = oGregorian.year - iEraStartYear + 1;

	  if (oGregorian.year < 1941 && oGregorian.month < 3) {
	    iYear -= 1;
	  }

	  if (oGregorian.year === null) {
	    iYear = undefined;
	  }

	  return {
	    year: iYear,
	    month: oGregorian.month,
	    day: oGregorian.day
	  };
	}

	function toGregorian(oBuddhist) {
	  var iEraStartYear = UniversalDate.getEraStartDate(CalendarType$1.Buddhist, 0).year,
	      iYear = oBuddhist.year + iEraStartYear - 1;

	  if (iYear < 1941 && oBuddhist.month < 3) {
	    iYear += 1;
	  }

	  if (oBuddhist.year === null) {
	    iYear = undefined;
	  }

	  return {
	    year: iYear,
	    month: oBuddhist.month,
	    day: oBuddhist.day
	  };
	}

	function toGregorianArguments(aArgs) {
	  var oBuddhist, oGregorian;
	  oBuddhist = {
	    year: aArgs[0],
	    month: aArgs[1],
	    day: aArgs[2] !== undefined ? aArgs[2] : 1
	  };
	  oGregorian = toGregorian(oBuddhist);
	  aArgs[0] = oGregorian.year;
	  return aArgs;
	}

	Buddhist.prototype._getBuddhist = function () {
	  var oGregorian = {
	    year: this.oDate.getFullYear(),
	    month: this.oDate.getMonth(),
	    day: this.oDate.getDate()
	  };
	  return toBuddhist(oGregorian);
	};

	Buddhist.prototype._setBuddhist = function (oBuddhist) {
	  var oGregorian = toGregorian(oBuddhist);
	  return this.oDate.setFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	Buddhist.prototype._getUTCBuddhist = function () {
	  var oGregorian = {
	    year: this.oDate.getUTCFullYear(),
	    month: this.oDate.getUTCMonth(),
	    day: this.oDate.getUTCDate()
	  };
	  return toBuddhist(oGregorian);
	};

	Buddhist.prototype._setUTCBuddhist = function (oBuddhist) {
	  var oGregorian = toGregorian(oBuddhist);
	  return this.oDate.setUTCFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	Buddhist.prototype.getYear = function () {
	  return this._getBuddhist().year;
	};

	Buddhist.prototype.getFullYear = function () {
	  return this._getBuddhist().year;
	};

	Buddhist.prototype.getUTCFullYear = function () {
	  return this._getUTCBuddhist().year;
	};

	Buddhist.prototype.setYear = function (iYear) {
	  var oBuddhist = this._getBuddhist();

	  oBuddhist.year = iYear;
	  return this._setBuddhist(oBuddhist);
	};

	Buddhist.prototype.setFullYear = function (iYear, iMonth, iDay) {
	  var oBuddhist = this._getBuddhist();

	  oBuddhist.year = iYear;

	  if (iMonth !== undefined) {
	    oBuddhist.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oBuddhist.day = iDay;
	  }

	  return this._setBuddhist(oBuddhist);
	};

	Buddhist.prototype.setUTCFullYear = function (iYear, iMonth, iDay) {
	  var oBuddhist = this._getUTCBuddhist();

	  oBuddhist.year = iYear;

	  if (iMonth !== undefined) {
	    oBuddhist.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oBuddhist.day = iDay;
	  }

	  return this._setUTCBuddhist(oBuddhist);
	};

	Buddhist.prototype.getWeek = function () {
	  return UniversalDate.getWeekByDate(this.sCalendarType, this.oDate.getFullYear(), this.getMonth(), this.getDate());
	};

	Buddhist.prototype.getUTCWeek = function () {
	  return UniversalDate.getWeekByDate(this.sCalendarType, this.oDate.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate());
	};

	_Calendars.set(CalendarType$1.Buddhist, Buddhist);

	var Islamic = UniversalDate.extend('sap.ui.core.date.Islamic', {
	  constructor: function constructor() {
	    var aArgs = arguments;

	    if (aArgs.length > 1) {
	      aArgs = toGregorianArguments$1(aArgs);
	    }

	    this.oDate = this.createDate(Date, aArgs);
	    this.sCalendarType = CalendarType$1.Islamic;
	  }
	});

	Islamic.UTC = function () {
	  var aArgs = toGregorianArguments$1(arguments);
	  return Date.UTC.apply(Date, aArgs);
	};

	Islamic.now = function () {
	  return Date.now();
	};

	var BASE_YEAR = 1400,
	    GREGORIAN_EPOCH_DAYS = 1721425.5,
	    ISLAMIC_EPOCH_DAYS = 1948439.5,
	    ISLAMIC_MILLIS = -42521587200000,
	    ONE_DAY = 86400000;
	var oCustomizationMap = null;
	var aSupportedIslamicCalendarTypes = ['A', 'B'];

	function toIslamic(oGregorian) {
	  var iGregorianYear = oGregorian.year,
	      iGregorianMonth = oGregorian.month,
	      iGregorianDay = oGregorian.day,
	      iIslamicYear,
	      iIslamicMonth,
	      iIslamicDay,
	      iMonths,
	      iDays,
	      iLeapAdj,
	      iJulianDay;
	  iLeapAdj = 0;

	  if (iGregorianMonth + 1 > 2) {
	    iLeapAdj = isGregorianLeapYear(iGregorianYear) ? -1 : -2;
	  }

	  iJulianDay = GREGORIAN_EPOCH_DAYS - 1 + 365 * (iGregorianYear - 1) + Math.floor((iGregorianYear - 1) / 4) + -Math.floor((iGregorianYear - 1) / 100) + Math.floor((iGregorianYear - 1) / 400) + Math.floor((367 * (iGregorianMonth + 1) - 362) / 12 + iLeapAdj + iGregorianDay);
	  iJulianDay = Math.floor(iJulianDay) + 0.5;
	  iDays = iJulianDay - ISLAMIC_EPOCH_DAYS;
	  iMonths = Math.floor(iDays / 29.530588853);

	  if (iMonths < 0) {
	    iIslamicYear = Math.floor(iMonths / 12) + 1;
	    iIslamicMonth = iMonths % 12;

	    if (iIslamicMonth < 0) {
	      iIslamicMonth += 12;
	    }

	    iIslamicDay = iDays - monthStart(iIslamicYear, iIslamicMonth) + 1;
	  } else {
	    iMonths++;

	    while (getCustomMonthStartDays(iMonths) > iDays) {
	      iMonths--;
	    }

	    iIslamicYear = Math.floor(iMonths / 12) + 1;
	    iIslamicMonth = iMonths % 12;
	    iIslamicDay = iDays - getCustomMonthStartDays(12 * (iIslamicYear - 1) + iIslamicMonth) + 1;
	  }

	  return {
	    day: iIslamicDay,
	    month: iIslamicMonth,
	    year: iIslamicYear
	  };
	}

	function toGregorian$1(oIslamic) {
	  var iIslamicYear = oIslamic.year,
	      iIslamicMonth = oIslamic.month,
	      iIslamicDate = oIslamic.day,
	      iMonthStart = iIslamicYear < 1 ? monthStart(iIslamicYear, iIslamicMonth) : getCustomMonthStartDays(12 * (iIslamicYear - 1) + iIslamicMonth),
	      iJulianDay = iIslamicDate + iMonthStart + ISLAMIC_EPOCH_DAYS - 1,
	      iJulianDayNoon = Math.floor(iJulianDay - 0.5) + 0.5,
	      iDaysSinceGregorianEpoch = iJulianDayNoon - GREGORIAN_EPOCH_DAYS,
	      iQuadricent = Math.floor(iDaysSinceGregorianEpoch / 146097),
	      iQuadricentNormalized = mod(iDaysSinceGregorianEpoch, 146097),
	      iCent = Math.floor(iQuadricentNormalized / 36524),
	      iCentNormalized = mod(iQuadricentNormalized, 36524),
	      iQuad = Math.floor(iCentNormalized / 1461),
	      iQuadNormalized = mod(iCentNormalized, 1461),
	      iYearIndex = Math.floor(iQuadNormalized / 365),
	      iYear = iQuadricent * 400 + iCent * 100 + iQuad * 4 + iYearIndex,
	      iMonth,
	      iDay,
	      iGregorianYearStartDays,
	      iDayOfYear,
	      tjd,
	      tjd2,
	      iLeapAdj,
	      iLeapAdj2;

	  if (!(iCent == 4 || iYearIndex == 4)) {
	    iYear++;
	  }

	  iGregorianYearStartDays = GREGORIAN_EPOCH_DAYS + 365 * (iYear - 1) + Math.floor((iYear - 1) / 4) - Math.floor((iYear - 1) / 100) + Math.floor((iYear - 1) / 400);
	  iDayOfYear = iJulianDayNoon - iGregorianYearStartDays;
	  tjd = GREGORIAN_EPOCH_DAYS - 1 + 365 * (iYear - 1) + Math.floor((iYear - 1) / 4) - Math.floor((iYear - 1) / 100) + Math.floor((iYear - 1) / 400) + Math.floor(739 / 12 + (isGregorianLeapYear(iYear) ? -1 : -2) + 1);
	  iLeapAdj = 0;

	  if (iJulianDayNoon < tjd) {
	    iLeapAdj = 0;
	  } else {
	    iLeapAdj = isGregorianLeapYear(iYear) ? 1 : 2;
	  }

	  iMonth = Math.floor(((iDayOfYear + iLeapAdj) * 12 + 373) / 367);
	  tjd2 = GREGORIAN_EPOCH_DAYS - 1 + 365 * (iYear - 1) + Math.floor((iYear - 1) / 4) - Math.floor((iYear - 1) / 100) + Math.floor((iYear - 1) / 400);
	  iLeapAdj2 = 0;

	  if (iMonth > 2) {
	    iLeapAdj2 = isGregorianLeapYear(iYear) ? -1 : -2;
	  }

	  tjd2 += Math.floor((367 * iMonth - 362) / 12 + iLeapAdj2 + 1);
	  iDay = iJulianDayNoon - tjd2 + 1;
	  return {
	    day: iDay,
	    month: iMonth - 1,
	    year: iYear
	  };
	}

	function toGregorianArguments$1(aArgs) {
	  var aGregorianArgs = Array.prototype.slice.call(aArgs),
	      oIslamic,
	      oGregorian;
	  oIslamic = {
	    year: aArgs[0],
	    month: aArgs[1],
	    day: aArgs[2] !== undefined ? aArgs[2] : 1
	  };
	  oGregorian = toGregorian$1(oIslamic);
	  aGregorianArgs[0] = oGregorian.year;
	  aGregorianArgs[1] = oGregorian.month;
	  aGregorianArgs[2] = oGregorian.day;
	  return aGregorianArgs;
	}

	function initCustomizationMap() {
	  var sDateFormat, oCustomizationJSON;
	  oCustomizationMap = {};
	  sDateFormat = Core.getConfiguration().getFormatSettings().getLegacyDateFormat();
	  sDateFormat = _isSupportedIslamicCalendarType(sDateFormat) ? sDateFormat : 'A';
	  oCustomizationJSON = Core.getConfiguration().getFormatSettings().getLegacyDateCalendarCustomizing();
	  oCustomizationJSON = oCustomizationJSON || [];

	  if (!oCustomizationJSON.length) {
	    Log.warning('No calendar customizations.');
	    return;
	  }

	  oCustomizationJSON.forEach(function (oEntry) {
	    if (oEntry.dateFormat === sDateFormat) {
	      var date = parseDate(oEntry.gregDate);
	      var iGregorianDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
	      var iMillis = iGregorianDate.getTime();
	      var iIslamicMonthStartDays = (iMillis - ISLAMIC_MILLIS) / ONE_DAY;
	      date = parseDate(oEntry.islamicMonthStart);
	      var iIslamicMonths = (date.year - 1) * 12 + date.month - 1;
	      oCustomizationMap[iIslamicMonths] = iIslamicMonthStartDays;
	    }
	  });
	  Log.info('Working with date format: [' + sDateFormat + '] and customization: ' + JSON.stringify(oCustomizationJSON));
	}

	function parseDate(sDate) {
	  return {
	    year: parseInt(sDate.substr(0, 4)),
	    month: parseInt(sDate.substr(4, 2)),
	    day: parseInt(sDate.substr(6, 2))
	  };
	}

	function getCustomMonthStartDays(months) {
	  if (!oCustomizationMap) {
	    initCustomizationMap();
	  }

	  var iIslamicMonthStartDays = oCustomizationMap[months];

	  if (!iIslamicMonthStartDays) {
	    var year = Math.floor(months / 12) + 1;
	    var month = months % 12;
	    iIslamicMonthStartDays = monthStart(year, month);
	  }

	  return iIslamicMonthStartDays;
	}

	function monthStart(year, month) {
	  return Math.ceil(29.5 * month) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
	}

	function mod(a, b) {
	  return a - b * Math.floor(a / b);
	}

	function isGregorianLeapYear(iYear) {
	  return !(iYear % 400) || !(iYear % 4) && !!(iYear % 100);
	}

	function _isSupportedIslamicCalendarType(sCalendarType) {
	  return aSupportedIslamicCalendarTypes.indexOf(sCalendarType) !== -1;
	}

	Islamic.prototype._getIslamic = function () {
	  return toIslamic({
	    day: this.oDate.getDate(),
	    month: this.oDate.getMonth(),
	    year: this.oDate.getFullYear()
	  });
	};

	Islamic.prototype._setIslamic = function (oIslamic) {
	  var oGregorian = toGregorian$1(oIslamic);
	  return this.oDate.setFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	Islamic.prototype._getUTCIslamic = function () {
	  return toIslamic({
	    day: this.oDate.getUTCDate(),
	    month: this.oDate.getUTCMonth(),
	    year: this.oDate.getUTCFullYear()
	  });
	};

	Islamic.prototype._setUTCIslamic = function (oIslamic) {
	  var oGregorian = toGregorian$1(oIslamic);
	  return this.oDate.setUTCFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	Islamic.prototype.getDate = function (iDate) {
	  return this._getIslamic().day;
	};

	Islamic.prototype.getMonth = function () {
	  return this._getIslamic().month;
	};

	Islamic.prototype.getYear = function () {
	  return this._getIslamic().year - BASE_YEAR;
	};

	Islamic.prototype.getFullYear = function () {
	  return this._getIslamic().year;
	};

	Islamic.prototype.setDate = function (iDate) {
	  var oIslamic = this._getIslamic();

	  oIslamic.day = iDate;
	  return this._setIslamic(oIslamic);
	};

	Islamic.prototype.setMonth = function (iMonth, iDay) {
	  var oIslamic = this._getIslamic();

	  oIslamic.month = iMonth;

	  if (iDay !== undefined) {
	    oIslamic.day = iDay;
	  }

	  return this._setIslamic(oIslamic);
	};

	Islamic.prototype.setYear = function (iYear) {
	  var oIslamic = this._getIslamic();

	  oIslamic.year = iYear + BASE_YEAR;
	  return this._setIslamic(oIslamic);
	};

	Islamic.prototype.setFullYear = function (iYear, iMonth, iDay) {
	  var oIslamic = this._getIslamic();

	  oIslamic.year = iYear;

	  if (iMonth !== undefined) {
	    oIslamic.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oIslamic.day = iDay;
	  }

	  return this._setIslamic(oIslamic);
	};

	Islamic.prototype.getUTCDate = function (iDate) {
	  return this._getUTCIslamic().day;
	};

	Islamic.prototype.getUTCMonth = function () {
	  return this._getUTCIslamic().month;
	};

	Islamic.prototype.getUTCFullYear = function () {
	  return this._getUTCIslamic().year;
	};

	Islamic.prototype.setUTCDate = function (iDate) {
	  var oIslamic = this._getUTCIslamic();

	  oIslamic.day = iDate;
	  return this._setUTCIslamic(oIslamic);
	};

	Islamic.prototype.setUTCMonth = function (iMonth, iDay) {
	  var oIslamic = this._getUTCIslamic();

	  oIslamic.month = iMonth;

	  if (iDay !== undefined) {
	    oIslamic.day = iDay;
	  }

	  return this._setUTCIslamic(oIslamic);
	};

	Islamic.prototype.setUTCFullYear = function (iYear, iMonth, iDay) {
	  var oIslamic = this._getUTCIslamic();

	  oIslamic.year = iYear;

	  if (iMonth !== undefined) {
	    oIslamic.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oIslamic.day = iDay;
	  }

	  return this._setUTCIslamic(oIslamic);
	};

	_Calendars.set(CalendarType$1.Islamic, Islamic);

	var Japanese = UniversalDate.extend('sap.ui.core.date.Japanese', {
	  constructor: function constructor() {
	    var aArgs = arguments;

	    if (aArgs.length > 1) {
	      aArgs = toGregorianArguments$2(aArgs);
	    }

	    this.oDate = this.createDate(Date, aArgs);
	    this.sCalendarType = CalendarType$1.Japanese;
	  }
	});

	Japanese.UTC = function () {
	  var aArgs = toGregorianArguments$2(arguments);
	  return Date.UTC.apply(Date, aArgs);
	};

	Japanese.now = function () {
	  return Date.now();
	};

	function toJapanese(oGregorian) {
	  var iEra = UniversalDate.getEraByDate(CalendarType$1.Japanese, oGregorian.year, oGregorian.month, oGregorian.day),
	      iEraStartYear = UniversalDate.getEraStartDate(CalendarType$1.Japanese, iEra).year;
	  return {
	    era: iEra,
	    year: oGregorian.year - iEraStartYear + 1,
	    month: oGregorian.month,
	    day: oGregorian.day
	  };
	}

	function toGregorian$2(oJapanese) {
	  var iEraStartYear = UniversalDate.getEraStartDate(CalendarType$1.Japanese, oJapanese.era).year;
	  return {
	    year: iEraStartYear + oJapanese.year - 1,
	    month: oJapanese.month,
	    day: oJapanese.day
	  };
	}

	function toGregorianArguments$2(aArgs) {
	  var oJapanese,
	      oGregorian,
	      iEra,
	      vYear = aArgs[0];

	  if (typeof vYear == 'number') {
	    if (vYear >= 100) {
	      return aArgs;
	    } else {
	      iEra = UniversalDate.getCurrentEra(CalendarType$1.Japanese);
	      vYear = [iEra, vYear];
	    }
	  } else if (!Array.isArray(vYear)) {
	    vYear = [];
	  }

	  oJapanese = {
	    era: vYear[0],
	    year: vYear[1],
	    month: aArgs[1],
	    day: aArgs[2] !== undefined ? aArgs[2] : 1
	  };
	  oGregorian = toGregorian$2(oJapanese);
	  aArgs[0] = oGregorian.year;
	  return aArgs;
	}

	Japanese.prototype._getJapanese = function () {
	  var oGregorian = {
	    year: this.oDate.getFullYear(),
	    month: this.oDate.getMonth(),
	    day: this.oDate.getDate()
	  };
	  return toJapanese(oGregorian);
	};

	Japanese.prototype._setJapanese = function (oJapanese) {
	  var oGregorian = toGregorian$2(oJapanese);
	  return this.oDate.setFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	Japanese.prototype._getUTCJapanese = function () {
	  var oGregorian = {
	    year: this.oDate.getUTCFullYear(),
	    month: this.oDate.getUTCMonth(),
	    day: this.oDate.getUTCDate()
	  };
	  return toJapanese(oGregorian);
	};

	Japanese.prototype._setUTCJapanese = function (oJapanese) {
	  var oGregorian = toGregorian$2(oJapanese);
	  return this.oDate.setUTCFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	Japanese.prototype.getYear = function () {
	  return this._getJapanese().year;
	};

	Japanese.prototype.getFullYear = function () {
	  return this._getJapanese().year;
	};

	Japanese.prototype.getEra = function () {
	  return this._getJapanese().era;
	};

	Japanese.prototype.getUTCFullYear = function () {
	  return this._getUTCJapanese().year;
	};

	Japanese.prototype.getUTCEra = function () {
	  return this._getUTCJapanese().era;
	};

	Japanese.prototype.setYear = function (iYear) {
	  var oJapanese = this._getJapanese();

	  oJapanese.year = iYear;
	  return this._setJapanese(oJapanese);
	};

	Japanese.prototype.setFullYear = function (iYear, iMonth, iDay) {
	  var oJapanese = this._getJapanese();

	  oJapanese.year = iYear;

	  if (iMonth !== undefined) {
	    oJapanese.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oJapanese.day = iDay;
	  }

	  return this._setJapanese(oJapanese);
	};

	Japanese.prototype.setEra = function (iEra, iYear, iMonth, iDay) {
	  var oEraStartDate = UniversalDate.getEraStartDate(CalendarType$1.Japanese, iEra),
	      oJapanese = toJapanese(oEraStartDate);

	  if (iYear !== undefined) {
	    oJapanese.year = iYear;
	  }

	  if (iMonth !== undefined) {
	    oJapanese.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oJapanese.day = iDay;
	  }

	  return this._setJapanese(oJapanese);
	};

	Japanese.prototype.setUTCFullYear = function (iYear, iMonth, iDay) {
	  var oJapanese = this._getUTCJapanese();

	  oJapanese.year = iYear;

	  if (iMonth !== undefined) {
	    oJapanese.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oJapanese.day = iDay;
	  }

	  return this._setUTCJapanese(oJapanese);
	};

	Japanese.prototype.setUTCEra = function (iEra, iYear, iMonth, iDay) {
	  var oEraStartDate = UniversalDate.getEraStartDate(CalendarType$1.Japanese, iEra),
	      oJapanese = toJapanese(oEraStartDate);

	  if (iYear !== undefined) {
	    oJapanese.year = iYear;
	  }

	  if (iMonth !== undefined) {
	    oJapanese.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oJapanese.day = iDay;
	  }

	  return this._setUTCJapanese(oJapanese);
	};

	Japanese.prototype.getWeek = function () {
	  return UniversalDate.getWeekByDate(this.sCalendarType, this.oDate.getFullYear(), this.getMonth(), this.getDate());
	};

	Japanese.prototype.getUTCWeek = function () {
	  return UniversalDate.getWeekByDate(this.sCalendarType, this.oDate.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate());
	};

	_Calendars.set(CalendarType$1.Japanese, Japanese);

	var Persian = UniversalDate.extend('sap.ui.core.date.Persian', {
	  constructor: function constructor() {
	    var aArgs = arguments;

	    if (aArgs.length > 1) {
	      aArgs = toGregorianArguments$3(aArgs);
	    }

	    this.oDate = this.createDate(Date, aArgs);
	    this.sCalendarType = CalendarType$1.Persian;
	  }
	});

	Persian.UTC = function () {
	  var aArgs = toGregorianArguments$3(arguments);
	  return Date.UTC.apply(Date, aArgs);
	};

	Persian.now = function () {
	  return Date.now();
	};

	var BASE_YEAR$1 = 1300;

	function toPersian(oGregorian) {
	  var iJulianDayNumber = g2d(oGregorian.year, oGregorian.month + 1, oGregorian.day);
	  return d2j(iJulianDayNumber);
	}

	function toGregorian$3(oPersian) {
	  var iJulianDayNumber = j2d(oPersian.year, oPersian.month + 1, oPersian.day);
	  return d2g(iJulianDayNumber);
	}

	function toGregorianArguments$3(aArgs) {
	  var aGregorianArgs = Array.prototype.slice.call(aArgs),
	      oPersian,
	      oGregorian;

	  if (typeof aArgs[0] !== 'number' || typeof aArgs[1] !== 'number' || aArgs[2] !== undefined && typeof aArgs[2] != 'number') {
	    aGregorianArgs[0] = NaN;
	    aGregorianArgs[1] = NaN;
	    aGregorianArgs[2] = NaN;
	    return aGregorianArgs;
	  }

	  oPersian = {
	    year: aArgs[0],
	    month: aArgs[1],
	    day: aArgs[2] !== undefined ? aArgs[2] : 1
	  };
	  oGregorian = toGregorian$3(oPersian);
	  aGregorianArgs[0] = oGregorian.year;
	  aGregorianArgs[1] = oGregorian.month;
	  aGregorianArgs[2] = oGregorian.day;
	  return aGregorianArgs;
	}

	function jalCal(jy) {
	  var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178],
	      bl = breaks.length,
	      gy = jy + 621,
	      leapJ = -14,
	      jp = breaks[0],
	      jm,
	      jump,
	      leap,
	      leapG,
	      march,
	      n,
	      i;

	  for (i = 1; i < bl; i += 1) {
	    jm = breaks[i];
	    jump = jm - jp;

	    if (jy < jm) {
	      break;
	    }

	    leapJ = leapJ + div(jump, 33) * 8 + div(mod$1(jump, 33), 4);
	    jp = jm;
	  }

	  n = jy - jp;
	  leapJ = leapJ + div(n, 33) * 8 + div(mod$1(n, 33) + 3, 4);

	  if (mod$1(jump, 33) === 4 && jump - n === 4) {
	    leapJ += 1;
	  }

	  leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
	  march = 20 + leapJ - leapG;

	  if (jump - n < 6) {
	    n = n - jump + div(jump + 4, 33) * 33;
	  }

	  leap = mod$1(mod$1(n + 1, 33) - 1, 4);

	  if (leap === -1) {
	    leap = 4;
	  }

	  return {
	    leap: leap,
	    gy: gy,
	    march: march
	  };
	}

	function j2d(jy, jm, jd) {
	  while (jm < 1) {
	    jm += 12;
	    jy--;
	  }

	  while (jm > 12) {
	    jm -= 12;
	    jy++;
	  }

	  var r = jalCal(jy);
	  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
	}

	function d2j(jdn) {
	  var gy = d2g(jdn).year,
	      jy = gy - 621,
	      r = jalCal(jy),
	      jdn1f = g2d(gy, 3, r.march),
	      jd,
	      jm,
	      k;
	  k = jdn - jdn1f;

	  if (k >= 0) {
	    if (k <= 185) {
	      jm = 1 + div(k, 31);
	      jd = mod$1(k, 31) + 1;
	      return {
	        year: jy,
	        month: jm - 1,
	        day: jd
	      };
	    } else {
	      k -= 186;
	    }
	  } else {
	    jy -= 1;
	    k += 179;

	    if (r.leap === 1) {
	      k += 1;
	    }
	  }

	  jm = 7 + div(k, 30);
	  jd = mod$1(k, 30) + 1;
	  return {
	    year: jy,
	    month: jm - 1,
	    day: jd
	  };
	}

	function g2d(gy, gm, gd) {
	  var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod$1(gm + 9, 12) + 2, 5) + gd - 34840408;
	  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
	  return d;
	}

	function d2g(jdn) {
	  var j, i, gd, gm, gy;
	  j = 4 * jdn + 139361631;
	  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
	  i = div(mod$1(j, 1461), 4) * 5 + 308;
	  gd = div(mod$1(i, 153), 5) + 1;
	  gm = mod$1(div(i, 153), 12) + 1;
	  gy = div(j, 1461) - 100100 + div(8 - gm, 6);
	  return {
	    year: gy,
	    month: gm - 1,
	    day: gd
	  };
	}

	function div(a, b) {
	  return ~~(a / b);
	}

	function mod$1(a, b) {
	  return a - ~~(a / b) * b;
	}

	Persian.prototype._getPersian = function () {
	  return toPersian({
	    day: this.oDate.getDate(),
	    month: this.oDate.getMonth(),
	    year: this.oDate.getFullYear()
	  });
	};

	Persian.prototype._setPersian = function (oPersian) {
	  var oGregorian = toGregorian$3(oPersian);
	  return this.oDate.setFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	Persian.prototype._getUTCPersian = function () {
	  return toPersian({
	    day: this.oDate.getUTCDate(),
	    month: this.oDate.getUTCMonth(),
	    year: this.oDate.getUTCFullYear()
	  });
	};

	Persian.prototype._setUTCPersian = function (oPersian) {
	  var oGregorian = toGregorian$3(oPersian);
	  return this.oDate.setUTCFullYear(oGregorian.year, oGregorian.month, oGregorian.day);
	};

	Persian.prototype.getDate = function (iDate) {
	  return this._getPersian().day;
	};

	Persian.prototype.getMonth = function () {
	  return this._getPersian().month;
	};

	Persian.prototype.getYear = function () {
	  return this._getPersian().year - BASE_YEAR$1;
	};

	Persian.prototype.getFullYear = function () {
	  return this._getPersian().year;
	};

	Persian.prototype.setDate = function (iDate) {
	  var oPersian = this._getPersian();

	  oPersian.day = iDate;
	  return this._setPersian(oPersian);
	};

	Persian.prototype.setMonth = function (iMonth, iDay) {
	  var oPersian = this._getPersian();

	  oPersian.month = iMonth;

	  if (iDay !== undefined) {
	    oPersian.day = iDay;
	  }

	  return this._setPersian(oPersian);
	};

	Persian.prototype.setYear = function (iYear) {
	  var oPersian = this._getPersian();

	  oPersian.year = iYear + BASE_YEAR$1;
	  return this._setPersian(oPersian);
	};

	Persian.prototype.setFullYear = function (iYear, iMonth, iDay) {
	  var oPersian = this._getPersian();

	  oPersian.year = iYear;

	  if (iMonth !== undefined) {
	    oPersian.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oPersian.day = iDay;
	  }

	  return this._setPersian(oPersian);
	};

	Persian.prototype.getUTCDate = function (iDate) {
	  return this._getUTCPersian().day;
	};

	Persian.prototype.getUTCMonth = function () {
	  return this._getUTCPersian().month;
	};

	Persian.prototype.getUTCFullYear = function () {
	  return this._getUTCPersian().year;
	};

	Persian.prototype.setUTCDate = function (iDate) {
	  var oPersian = this._getUTCPersian();

	  oPersian.day = iDate;
	  return this._setUTCPersian(oPersian);
	};

	Persian.prototype.setUTCMonth = function (iMonth, iDay) {
	  var oPersian = this._getUTCPersian();

	  oPersian.month = iMonth;

	  if (iDay !== undefined) {
	    oPersian.day = iDay;
	  }

	  return this._setUTCPersian(oPersian);
	};

	Persian.prototype.setUTCFullYear = function (iYear, iMonth, iDay) {
	  var oPersian = this._getUTCPersian();

	  oPersian.year = iYear;

	  if (iMonth !== undefined) {
	    oPersian.month = iMonth;
	  }

	  if (iDay !== undefined) {
	    oPersian.day = iDay;
	  }

	  return this._setUTCPersian(oPersian);
	};

	_Calendars.set(CalendarType$1.Persian, Persian);

	var fnEqual = function fnEqual(a, b, maxDepth, contains, depth) {
	  if (typeof maxDepth == 'boolean') {
	    contains = maxDepth;
	    maxDepth = undefined;
	  }

	  if (!depth) {
	    depth = 0;
	  }

	  if (!maxDepth) {
	    maxDepth = 10;
	  }

	  if (depth > maxDepth) {
	    Log.warning('deepEqual comparison exceeded maximum recursion depth of ' + maxDepth + '. Treating values as unequal');
	    return false;
	  }

	  if (a === b) {
	    return true;
	  }

	  var bIsReallyNaN = typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b);

	  if (bIsReallyNaN) {
	    return true;
	  }

	  if (Array.isArray(a) && Array.isArray(b)) {
	    if (!contains && a.length !== b.length) {
	      return false;
	    }

	    if (a.length > b.length) {
	      return false;
	    }

	    for (var i = 0; i < a.length; i++) {
	      if (!fnEqual(a[i], b[i], maxDepth, contains, depth + 1)) {
	        return false;
	      }
	    }

	    return true;
	  }

	  if (__chunk_1._typeof(a) == 'object' && __chunk_1._typeof(b) == 'object') {
	    if (!a || !b) {
	      return false;
	    }

	    if (a.constructor !== b.constructor) {
	      return false;
	    }

	    if (!contains && Object.keys(a).length !== Object.keys(b).length) {
	      return false;
	    }

	    if (a instanceof Node) {
	      return a.isEqualNode(b);
	    }

	    if (a instanceof Date) {
	      return a.valueOf() === b.valueOf();
	    }

	    for (var i in a) {
	      if (!fnEqual(a[i], b[i], maxDepth, contains, depth + 1)) {
	        return false;
	      }
	    }

	    return true;
	  }

	  return false;
	};

	var rMessageFormat = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;

	var fnFormatMessage = function fnFormatMessage(sPattern, aValues) {
	  fnAssert(typeof sPattern === 'string' || sPattern instanceof String, 'pattern must be string');

	  if (arguments.length > 2 || aValues != null && !Array.isArray(aValues)) {
	    aValues = Array.prototype.slice.call(arguments, 1);
	  }

	  aValues = aValues || [];
	  return sPattern.replace(rMessageFormat, function ($0, $1, $2, $3, offset) {
	    if ($1) {
	      return '\'';
	    } else if ($2) {
	      return $2.replace(/''/g, '\'');
	    } else if ($3) {
	      return String(aValues[parseInt($3)]);
	    }

	    throw new Error('formatMessage: pattern syntax error at pos. ' + offset);
	  });
	};

	var DateFormat = function DateFormat() {
	  throw new Error();
	};

	var mCldrDatePattern = {};
	DateFormat.oDateInfo = {
	  oDefaultFormatOptions: {
	    style: 'medium',
	    relativeScale: 'day',
	    relativeStyle: 'wide'
	  },
	  aFallbackFormatOptions: [{
	    style: 'short'
	  }, {
	    style: 'medium'
	  }, {
	    pattern: 'yyyy-MM-dd'
	  }, {
	    pattern: 'yyyyMMdd',
	    strictParsing: true
	  }],
	  bShortFallbackFormatOptions: true,
	  bPatternFallbackWithoutDelimiter: true,
	  getPattern: function getPattern(oLocaleData, sStyle, sCalendarType) {
	    return oLocaleData.getDatePattern(sStyle, sCalendarType);
	  },
	  oRequiredParts: {
	    'text': true,
	    'year': true,
	    'weekYear': true,
	    'month': true,
	    'day': true
	  },
	  aRelativeScales: ['year', 'month', 'week', 'day'],
	  aRelativeParseScales: ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second'],
	  aIntervalCompareFields: ['Era', 'FullYear', 'Quarter', 'Month', 'Week', 'Date']
	};
	DateFormat.oDateTimeInfo = {
	  oDefaultFormatOptions: {
	    style: 'medium',
	    relativeScale: 'auto',
	    relativeStyle: 'wide'
	  },
	  aFallbackFormatOptions: [{
	    style: 'short'
	  }, {
	    style: 'medium'
	  }, {
	    pattern: 'yyyy-MM-dd\'T\'HH:mm:ss'
	  }, {
	    pattern: 'yyyyMMdd HHmmss'
	  }],
	  getPattern: function getPattern(oLocaleData, sStyle, sCalendarType) {
	    var iSlashIndex = sStyle.indexOf('/');

	    if (iSlashIndex > 0) {
	      return oLocaleData.getCombinedDateTimePattern(sStyle.substr(0, iSlashIndex), sStyle.substr(iSlashIndex + 1), sCalendarType);
	    } else {
	      return oLocaleData.getCombinedDateTimePattern(sStyle, sStyle, sCalendarType);
	    }
	  },
	  oRequiredParts: {
	    'text': true,
	    'year': true,
	    'weekYear': true,
	    'month': true,
	    'day': true,
	    'hour0_23': true,
	    'hour1_24': true,
	    'hour0_11': true,
	    'hour1_12': true
	  },
	  aRelativeScales: ['year', 'month', 'week', 'day', 'hour', 'minute', 'second'],
	  aRelativeParseScales: ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second'],
	  aIntervalCompareFields: ['Era', 'FullYear', 'Quarter', 'Month', 'Week', 'Date', 'DayPeriod', 'Hours', 'Minutes', 'Seconds']
	};
	DateFormat.oTimeInfo = {
	  oDefaultFormatOptions: {
	    style: 'medium',
	    relativeScale: 'auto',
	    relativeStyle: 'wide'
	  },
	  aFallbackFormatOptions: [{
	    style: 'short'
	  }, {
	    style: 'medium'
	  }, {
	    pattern: 'HH:mm:ss'
	  }, {
	    pattern: 'HHmmss'
	  }],
	  getPattern: function getPattern(oLocaleData, sStyle, sCalendarType) {
	    return oLocaleData.getTimePattern(sStyle, sCalendarType);
	  },
	  oRequiredParts: {
	    'text': true,
	    'hour0_23': true,
	    'hour1_24': true,
	    'hour0_11': true,
	    'hour1_12': true
	  },
	  aRelativeScales: ['hour', 'minute', 'second'],
	  aRelativeParseScales: ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second'],
	  aIntervalCompareFields: ['DayPeriod', 'Hours', 'Minutes', 'Seconds']
	};

	DateFormat.getInstance = function (oFormatOptions, oLocale) {
	  return this.getDateInstance(oFormatOptions, oLocale);
	};

	DateFormat.getDateInstance = function (oFormatOptions, oLocale) {
	  return this.createInstance(oFormatOptions, oLocale, this.oDateInfo);
	};

	DateFormat.getDateTimeInstance = function (oFormatOptions, oLocale) {
	  return this.createInstance(oFormatOptions, oLocale, this.oDateTimeInfo);
	};

	DateFormat.getTimeInstance = function (oFormatOptions, oLocale) {
	  return this.createInstance(oFormatOptions, oLocale, this.oTimeInfo);
	};

	function createIntervalPatternWithNormalConnector(oFormat) {
	  var sPattern = oFormat.oLocaleData.getIntervalPattern('', oFormat.oFormatOptions.calendarType);
	  sPattern = sPattern.replace(/[^\{\}01 ]/, '-');
	  return sPattern.replace(/\{(0|1)\}/g, oFormat.oFormatOptions.pattern);
	}

	DateFormat.createInstance = function (oFormatOptions, oLocale, oInfo) {
	  var oFormat = Object.create(this.prototype);

	  if (oFormatOptions instanceof Locale) {
	    oLocale = oFormatOptions;
	    oFormatOptions = undefined;
	  }

	  if (!oLocale) {
	    oLocale = Core.getConfiguration().getFormatSettings().getFormatLocale();
	  }

	  oFormat.oLocale = oLocale;
	  oFormat.oLocaleData = LocaleData.getInstance(oLocale);
	  oFormat.oFormatOptions = fnExtend({}, oInfo.oDefaultFormatOptions, oFormatOptions);

	  if (!oFormat.oFormatOptions.calendarType) {
	    oFormat.oFormatOptions.calendarType = Core.getConfiguration().getCalendarType();
	  }

	  if (!oFormat.oFormatOptions.pattern) {
	    if (oFormat.oFormatOptions.format) {
	      oFormat.oFormatOptions.pattern = oFormat.oLocaleData.getCustomDateTimePattern(oFormat.oFormatOptions.format, oFormat.oFormatOptions.calendarType);
	    } else {
	      oFormat.oFormatOptions.pattern = oInfo.getPattern(oFormat.oLocaleData, oFormat.oFormatOptions.style, oFormat.oFormatOptions.calendarType);
	    }
	  }

	  if (oFormat.oFormatOptions.interval) {
	    if (oFormat.oFormatOptions.format) {
	      oFormat.intervalPatterns = oFormat.oLocaleData.getCustomIntervalPattern(oFormat.oFormatOptions.format, null, oFormat.oFormatOptions.calendarType);

	      if (typeof oFormat.intervalPatterns === 'string') {
	        oFormat.intervalPatterns = [oFormat.intervalPatterns];
	      }

	      oFormat.intervalPatterns.push(oFormat.oLocaleData.getCustomDateTimePattern(oFormat.oFormatOptions.format, oFormat.oFormatOptions.calendarType));
	    } else {
	      oFormat.intervalPatterns = [oFormat.oLocaleData.getCombinedIntervalPattern(oFormat.oFormatOptions.pattern, oFormat.oFormatOptions.calendarType), oFormat.oFormatOptions.pattern];
	    }

	    var sCommonConnectorPattern = createIntervalPatternWithNormalConnector(oFormat);
	    oFormat.intervalPatterns.push(sCommonConnectorPattern);
	  }

	  if (!oFormat.oFormatOptions.fallback) {
	    if (!oInfo.oFallbackFormats) {
	      oInfo.oFallbackFormats = {};
	    }

	    var sLocale = oLocale.toString(),
	        sCalendarType = oFormat.oFormatOptions.calendarType,
	        sKey = sLocale + '-' + sCalendarType,
	        sPattern,
	        aFallbackFormatOptions;

	    if (oFormat.oFormatOptions.pattern && oInfo.bPatternFallbackWithoutDelimiter) {
	      sKey = sKey + '-' + oFormat.oFormatOptions.pattern;
	    }

	    if (oFormat.oFormatOptions.interval) {
	      sKey = sKey + '-' + 'interval';
	    }

	    var oFallbackFormats = oInfo.oFallbackFormats[sKey] ? Object.assign({}, oInfo.oFallbackFormats[sKey]) : undefined;

	    if (!oFallbackFormats) {
	      aFallbackFormatOptions = oInfo.aFallbackFormatOptions;

	      if (oInfo.bShortFallbackFormatOptions) {
	        sPattern = oInfo.getPattern(oFormat.oLocaleData, 'short');
	        aFallbackFormatOptions = aFallbackFormatOptions.concat(DateFormat._createFallbackOptionsWithoutDelimiter(sPattern));
	      }

	      if (oFormat.oFormatOptions.pattern && oInfo.bPatternFallbackWithoutDelimiter) {
	        aFallbackFormatOptions = DateFormat._createFallbackOptionsWithoutDelimiter(oFormat.oFormatOptions.pattern).concat(aFallbackFormatOptions);
	      }

	      oFallbackFormats = DateFormat._createFallbackFormat(aFallbackFormatOptions, sCalendarType, oLocale, oInfo, oFormat.oFormatOptions.interval);
	    }

	    oFormat.aFallbackFormats = oFallbackFormats;
	  }

	  oFormat.oRequiredParts = oInfo.oRequiredParts;
	  oFormat.aRelativeScales = oInfo.aRelativeScales;
	  oFormat.aRelativeParseScales = oInfo.aRelativeParseScales;
	  oFormat.aIntervalCompareFields = oInfo.aIntervalCompareFields;
	  oFormat.init();
	  return oFormat;
	};

	DateFormat.prototype.init = function () {
	  var sCalendarType = this.oFormatOptions.calendarType;
	  this.aMonthsAbbrev = this.oLocaleData.getMonths('abbreviated', sCalendarType);
	  this.aMonthsWide = this.oLocaleData.getMonths('wide', sCalendarType);
	  this.aMonthsNarrow = this.oLocaleData.getMonths('narrow', sCalendarType);
	  this.aMonthsAbbrevSt = this.oLocaleData.getMonthsStandAlone('abbreviated', sCalendarType);
	  this.aMonthsWideSt = this.oLocaleData.getMonthsStandAlone('wide', sCalendarType);
	  this.aMonthsNarrowSt = this.oLocaleData.getMonthsStandAlone('narrow', sCalendarType);
	  this.aDaysAbbrev = this.oLocaleData.getDays('abbreviated', sCalendarType);
	  this.aDaysWide = this.oLocaleData.getDays('wide', sCalendarType);
	  this.aDaysNarrow = this.oLocaleData.getDays('narrow', sCalendarType);
	  this.aDaysShort = this.oLocaleData.getDays('short', sCalendarType);
	  this.aDaysAbbrevSt = this.oLocaleData.getDaysStandAlone('abbreviated', sCalendarType);
	  this.aDaysWideSt = this.oLocaleData.getDaysStandAlone('wide', sCalendarType);
	  this.aDaysNarrowSt = this.oLocaleData.getDaysStandAlone('narrow', sCalendarType);
	  this.aDaysShortSt = this.oLocaleData.getDaysStandAlone('short', sCalendarType);
	  this.aQuartersAbbrev = this.oLocaleData.getQuarters('abbreviated', sCalendarType);
	  this.aQuartersWide = this.oLocaleData.getQuarters('wide', sCalendarType);
	  this.aQuartersNarrow = this.oLocaleData.getQuarters('narrow', sCalendarType);
	  this.aQuartersAbbrevSt = this.oLocaleData.getQuartersStandAlone('abbreviated', sCalendarType);
	  this.aQuartersWideSt = this.oLocaleData.getQuartersStandAlone('wide', sCalendarType);
	  this.aQuartersNarrowSt = this.oLocaleData.getQuartersStandAlone('narrow', sCalendarType);
	  this.aErasNarrow = this.oLocaleData.getEras('narrow', sCalendarType);
	  this.aErasAbbrev = this.oLocaleData.getEras('abbreviated', sCalendarType);
	  this.aErasWide = this.oLocaleData.getEras('wide', sCalendarType);
	  this.aDayPeriods = this.oLocaleData.getDayPeriods('abbreviated', sCalendarType);
	  this.aFormatArray = this.parseCldrDatePattern(this.oFormatOptions.pattern);
	  this.sAllowedCharacters = this.getAllowedCharacters(this.aFormatArray);
	};

	DateFormat._createFallbackFormat = function (aFallbackFormatOptions, sCalendarType, oLocale, oInfo, bInterval) {
	  return aFallbackFormatOptions.map(function (oOptions) {
	    var oFormatOptions = Object.assign({}, oOptions);

	    if (bInterval) {
	      oFormatOptions.interval = true;
	    }

	    oFormatOptions.calendarType = sCalendarType;
	    oFormatOptions.fallback = true;
	    var oFallbackFormat = DateFormat.createInstance(oFormatOptions, oLocale, oInfo);
	    oFallbackFormat.bIsFallback = true;
	    return oFallbackFormat;
	  });
	};

	DateFormat._createFallbackOptionsWithoutDelimiter = function (sBasePattern) {
	  var rNonDateFields = /[^dMyGU]/g,
	      oDayReplace = {
	    regex: /d+/g,
	    replace: 'dd'
	  },
	      oMonthReplace = {
	    regex: /M+/g,
	    replace: 'MM'
	  },
	      oYearReplace = {
	    regex: /[yU]+/g,
	    replace: ['yyyy', 'yy']
	  };
	  sBasePattern = sBasePattern.replace(rNonDateFields, '');
	  sBasePattern = sBasePattern.replace(oDayReplace.regex, oDayReplace.replace);
	  sBasePattern = sBasePattern.replace(oMonthReplace.regex, oMonthReplace.replace);
	  return oYearReplace.replace.map(function (sReplace) {
	    return {
	      pattern: sBasePattern.replace(oYearReplace.regex, sReplace),
	      strictParsing: true
	    };
	  });
	};

	var oParseHelper = {
	  isNumber: function isNumber(iCharCode) {
	    return iCharCode >= 48 && iCharCode <= 57;
	  },
	  findNumbers: function findNumbers(sValue, iMaxLength) {
	    var iLength = 0;

	    while (iLength < iMaxLength && this.isNumber(sValue.charCodeAt(iLength))) {
	      iLength++;
	    }

	    if (typeof sValue !== 'string') {
	      sValue = sValue.toString();
	    }

	    return sValue.substr(0, iLength);
	  },
	  findEntry: function findEntry(sValue, aList) {
	    var iFoundIndex = -1,
	        iMatchedLength = 0;

	    for (var j = 0; j < aList.length; j++) {
	      if (aList[j] && aList[j].length > iMatchedLength && sValue.indexOf(aList[j]) === 0) {
	        iFoundIndex = j;
	        iMatchedLength = aList[j].length;
	      }
	    }

	    return {
	      index: iFoundIndex,
	      value: iFoundIndex === -1 ? null : aList[iFoundIndex]
	    };
	  },
	  parseTZ: function parseTZ(sValue, bISO) {
	    var iLength = 0;
	    var iTZFactor = sValue.charAt(0) == '+' ? -1 : 1;
	    var sPart;
	    iLength++;
	    sPart = this.findNumbers(sValue.substr(iLength), 2);
	    var iTZDiffHour = parseInt(sPart);
	    iLength += 2;

	    if (bISO) {
	      iLength++;
	    }

	    sPart = this.findNumbers(sValue.substr(iLength), 2);
	    iLength += 2;
	    var iTZDiff = parseInt(sPart);
	    return {
	      length: iLength,
	      tzDiff: (iTZDiff + 60 * iTZDiffHour) * iTZFactor
	    };
	  },
	  checkValid: function checkValid(sType, bPartInvalid, oFormat) {
	    if (sType in oFormat.oRequiredParts && bPartInvalid) {
	      return false;
	    }
	  }
	};
	DateFormat.prototype.oSymbols = {
	  '': {
	    name: 'text',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      return oField.value;
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var sChar;
	      var bValid = true;
	      var iValueIndex = 0;
	      var iPatternIndex = 0;
	      var sDelimiter = "-~\u2010\u2011\u2012\u2013\u2014\uFE58\uFE63\uFF0D\uFF5E";

	      for (; iPatternIndex < oPart.value.length; iPatternIndex++) {
	        sChar = oPart.value.charAt(iPatternIndex);

	        if (sChar === ' ') {
	          while (sValue.charAt(iValueIndex) === ' ') {
	            iValueIndex++;
	          }
	        } else if (sDelimiter.includes(sChar)) {
	          if (!sDelimiter.includes(sValue.charAt(iValueIndex))) {
	            bValid = false;
	          }

	          iValueIndex++;
	        } else {
	          if (sValue.charAt(iValueIndex) !== sChar) {
	            bValid = false;
	          }

	          iValueIndex++;
	        }

	        if (!bValid) {
	          break;
	        }
	      }

	      if (bValid) {
	        return {
	          length: iValueIndex
	        };
	      } else {
	        var bPartInvalid = false;

	        if (oConfig.index < oConfig.formatArray.length - 1) {
	          bPartInvalid = oConfig.formatArray[oConfig.index + 1].type in oFormat.oRequiredParts;
	        }

	        return {
	          valid: oParseHelper.checkValid(oPart.type, bPartInvalid, oFormat)
	        };
	      }
	    }
	  },
	  'G': {
	    name: 'era',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iEra = bUTC ? oDate.getUTCEra() : oDate.getEra();

	      if (oField.digits <= 3) {
	        return oFormat.aErasAbbrev[iEra];
	      } else if (oField.digits === 4) {
	        return oFormat.aErasWide[iEra];
	      } else {
	        return oFormat.aErasNarrow[iEra];
	      }
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var aErasVariants = [oFormat.aErasWide, oFormat.aErasAbbrev, oFormat.aErasNarrow];

	      for (var i = 0; i < aErasVariants.length; i++) {
	        var aVariants = aErasVariants[i];
	        var oFound = oParseHelper.findEntry(sValue, aVariants);

	        if (oFound.index !== -1) {
	          return {
	            era: oFound.index,
	            length: oFound.value.length
	          };
	        }
	      }

	      return {
	        era: oFormat.aErasWide.length - 1,
	        valid: oParseHelper.checkValid(oPart.type, true, oFormat)
	      };
	    }
	  },
	  'y': {
	    name: 'year',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iYear = bUTC ? oDate.getUTCFullYear() : oDate.getFullYear();
	      var sYear = String(iYear);
	      var sCalendarType = oFormat.oFormatOptions.calendarType;

	      if (oField.digits == 2 && sYear.length > 2) {
	        sYear = sYear.substr(sYear.length - 2);
	      }

	      if (sCalendarType != CalendarType$1.Japanese && oField.digits == 1 && iYear < 100) {
	        sYear = sYear.padStart(4, '0');
	      }

	      return sYear.padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var sCalendarType = oFormat.oFormatOptions.calendarType;
	      var sPart;

	      if (oPart.digits == 1) {
	        sPart = oParseHelper.findNumbers(sValue, 4);
	      } else if (oPart.digits == 2) {
	        sPart = oParseHelper.findNumbers(sValue, 2);
	      } else {
	        sPart = oParseHelper.findNumbers(sValue, oPart.digits);
	      }

	      var iYear = parseInt(sPart);

	      if (sCalendarType != CalendarType$1.Japanese && sPart.length <= 2) {
	        var oCurrentDate = UniversalDate.getInstance(new Date(), sCalendarType),
	            iCurrentYear = oCurrentDate.getFullYear(),
	            iCurrentCentury = Math.floor(iCurrentYear / 100),
	            iYearDiff = iCurrentCentury * 100 + iYear - iCurrentYear;

	        if (iYearDiff < -70) {
	          iYear += (iCurrentCentury + 1) * 100;
	        } else if (iYearDiff < 30) {
	          iYear += iCurrentCentury * 100;
	        } else {
	          iYear += (iCurrentCentury - 1) * 100;
	        }
	      }

	      return {
	        length: sPart.length,
	        valid: oParseHelper.checkValid(oPart.type, sPart === '', oFormat),
	        year: iYear
	      };
	    }
	  },
	  'Y': {
	    name: 'weekYear',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var oWeek = bUTC ? oDate.getUTCWeek() : oDate.getWeek();
	      var iWeekYear = oWeek.year;
	      var sWeekYear = String(iWeekYear);
	      var sCalendarType = oFormat.oFormatOptions.calendarType;

	      if (oField.digits == 2 && sWeekYear.length > 2) {
	        sWeekYear = sWeekYear.substr(sWeekYear.length - 2);
	      }

	      if (sCalendarType != CalendarType$1.Japanese && oField.digits == 1 && iWeekYear < 100) {
	        sWeekYear = sWeekYear.padStart(4, '0');
	      }

	      return sWeekYear.padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var sCalendarType = oFormat.oFormatOptions.calendarType;
	      var sPart;

	      if (oPart.digits == 1) {
	        sPart = oParseHelper.findNumbers(sValue, 4);
	      } else if (oPart.digits == 2) {
	        sPart = oParseHelper.findNumbers(sValue, 2);
	      } else {
	        sPart = oParseHelper.findNumbers(sValue, oPart.digits);
	      }

	      var iYear = parseInt(sPart);
	      var iWeekYear;

	      if (sCalendarType != CalendarType$1.Japanese && sPart.length <= 2) {
	        var oCurrentDate = UniversalDate.getInstance(new Date(), sCalendarType),
	            iCurrentYear = oCurrentDate.getFullYear(),
	            iCurrentCentury = Math.floor(iCurrentYear / 100),
	            iYearDiff = iCurrentCentury * 100 + iWeekYear - iCurrentYear;

	        if (iYearDiff < -70) {
	          iWeekYear += (iCurrentCentury + 1) * 100;
	        } else if (iYearDiff < 30) {
	          iWeekYear += iCurrentCentury * 100;
	        } else {
	          iWeekYear += (iCurrentCentury - 1) * 100;
	        }
	      }

	      return {
	        length: sPart.length,
	        valid: oParseHelper.checkValid(oPart.type, sPart === '', oFormat),
	        year: iYear,
	        weekYear: iWeekYear
	      };
	    }
	  },
	  'M': {
	    name: 'month',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth();

	      if (oField.digits == 3) {
	        return oFormat.aMonthsAbbrev[iMonth];
	      } else if (oField.digits == 4) {
	        return oFormat.aMonthsWide[iMonth];
	      } else if (oField.digits > 4) {
	        return oFormat.aMonthsNarrow[iMonth];
	      } else {
	        return String(iMonth + 1).padStart(oField.digits, '0');
	      }
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var aMonthsVariants = [oFormat.aMonthsWide, oFormat.aMonthsWideSt, oFormat.aMonthsAbbrev, oFormat.aMonthsAbbrevSt, oFormat.aMonthsNarrow, oFormat.aMonthsNarrowSt];
	      var bValid;
	      var iMonth;
	      var sPart;

	      if (oPart.digits < 3) {
	        sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	        bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);
	        iMonth = parseInt(sPart) - 1;

	        if (oConfig.strict && (iMonth > 11 || iMonth < 0)) {
	          bValid = false;
	        }
	      } else {
	        for (var i = 0; i < aMonthsVariants.length; i++) {
	          var aVariants = aMonthsVariants[i];
	          var oFound = oParseHelper.findEntry(sValue, aVariants);

	          if (oFound.index !== -1) {
	            return {
	              month: oFound.index,
	              length: oFound.value.length
	            };
	          }
	        }

	        bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
	      }

	      return {
	        month: iMonth,
	        length: sPart ? sPart.length : 0,
	        valid: bValid
	      };
	    }
	  },
	  'L': {
	    name: 'monthStandalone',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iMonth = bUTC ? oDate.getUTCMonth() : oDate.getMonth();

	      if (oField.digits == 3) {
	        return oFormat.aMonthsAbbrevSt[iMonth];
	      } else if (oField.digits == 4) {
	        return oFormat.aMonthsWideSt[iMonth];
	      } else if (oField.digits > 4) {
	        return oFormat.aMonthsNarrowSt[iMonth];
	      } else {
	        return String(iMonth + 1).padStart(oField.digits, '0');
	      }
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var aMonthsVariants = [oFormat.aMonthsWide, oFormat.aMonthsWideSt, oFormat.aMonthsAbbrev, oFormat.aMonthsAbbrevSt, oFormat.aMonthsNarrow, oFormat.aMonthsNarrowSt];
	      var bValid;
	      var iMonth;
	      var sPart;

	      if (oPart.digits < 3) {
	        sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	        bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);
	        iMonth = parseInt(sPart) - 1;

	        if (oConfig.strict && (iMonth > 11 || iMonth < 0)) {
	          bValid = false;
	        }
	      } else {
	        for (var i = 0; i < aMonthsVariants.length; i++) {
	          var aVariants = aMonthsVariants[i];
	          var oFound = oParseHelper.findEntry(sValue, aVariants);

	          if (oFound.index !== -1) {
	            return {
	              month: oFound.index,
	              length: oFound.value.length
	            };
	          }
	        }

	        bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
	      }

	      return {
	        month: iMonth,
	        length: sPart ? sPart.length : 0,
	        valid: bValid
	      };
	    }
	  },
	  'w': {
	    name: 'weekInYear',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var oWeek = bUTC ? oDate.getUTCWeek() : oDate.getWeek();
	      var iWeek = oWeek.week;
	      var sWeek = String(iWeek + 1);

	      if (oField.digits < 3) {
	        sWeek = sWeek.padStart(oField.digits, '0');
	      } else {
	        sWeek = oFormat.oLocaleData.getCalendarWeek(oField.digits === 3 ? 'narrow' : 'wide', sWeek.padStart(2, '0'));
	      }

	      return sWeek;
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bValid;
	      var sPart;
	      var iWeek;
	      var iLength = 0;

	      if (oPart.digits < 3) {
	        sPart = oParseHelper.findNumbers(sValue, 2);
	        iLength = sPart.length;
	        iWeek = parseInt(sPart) - 1;
	        bValid = oParseHelper.checkValid(oPart.type, !sPart, oFormat);
	      } else {
	        sPart = oFormat.oLocaleData.getCalendarWeek(oPart.digits === 3 ? 'narrow' : 'wide');
	        sPart = sPart.replace('{0}', '[0-9]+');
	        var rWeekNumber = new RegExp(sPart),
	            oResult = rWeekNumber.exec(sValue);

	        if (oResult) {
	          iLength = oResult[0].length;
	          iWeek = parseInt(oResult[0]) - 1;
	        } else {
	          bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
	        }
	      }

	      return {
	        length: iLength,
	        valid: bValid,
	        week: iWeek
	      };
	    }
	  },
	  'W': {
	    name: 'weekInMonth',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      return '';
	    },
	    parse: function parse() {
	      return {};
	    }
	  },
	  'D': {
	    name: 'dayInYear',
	    format: function format(oField, oDate, bUTC, oFormat) {},
	    parse: function parse() {
	      return {};
	    }
	  },
	  'd': {
	    name: 'day',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iDate = bUTC ? oDate.getUTCDate() : oDate.getDate();
	      return String(iDate).padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	      var bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);
	      var iDay = parseInt(sPart);

	      if (oConfig.strict && (iDay > 31 || iDay < 1)) {
	        bValid = false;
	      }

	      return {
	        day: iDay,
	        length: sPart.length,
	        valid: bValid
	      };
	    }
	  },
	  'Q': {
	    name: 'quarter',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iQuarter = bUTC ? oDate.getUTCQuarter() : oDate.getQuarter();

	      if (oField.digits == 3) {
	        return oFormat.aQuartersAbbrev[iQuarter];
	      } else if (oField.digits == 4) {
	        return oFormat.aQuartersWide[iQuarter];
	      } else if (oField.digits > 4) {
	        return oFormat.aQuartersNarrow[iQuarter];
	      } else {
	        return String(iQuarter + 1).padStart(oField.digits, '0');
	      }
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bValid;
	      var iQuarter;
	      var sPart;
	      var aQuartersVariants = [oFormat.aQuartersWide, oFormat.aQuartersWideSt, oFormat.aQuartersAbbrev, oFormat.aQuartersAbbrevSt, oFormat.aQuartersNarrow, oFormat.aQuartersNarrowSt];

	      if (oPart.digits < 3) {
	        sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	        bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);
	        iQuarter = parseInt(sPart) - 1;

	        if (oConfig.strict && iQuarter > 3) {
	          bValid = false;
	        }
	      } else {
	        for (var i = 0; i < aQuartersVariants.length; i++) {
	          var aVariants = aQuartersVariants[i];
	          var oFound = oParseHelper.findEntry(sValue, aVariants);

	          if (oFound.index !== -1) {
	            return {
	              quarter: oFound.index,
	              length: oFound.value.length
	            };
	          }
	        }

	        bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
	      }

	      return {
	        length: sPart ? sPart.length : 0,
	        quarter: iQuarter,
	        valid: bValid
	      };
	    }
	  },
	  'q': {
	    name: 'quarterStandalone',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iQuarter = bUTC ? oDate.getUTCQuarter() : oDate.getQuarter();

	      if (oField.digits == 3) {
	        return oFormat.aQuartersAbbrevSt[iQuarter];
	      } else if (oField.digits == 4) {
	        return oFormat.aQuartersWideSt[iQuarter];
	      } else if (oField.digits > 4) {
	        return oFormat.aQuartersNarrowSt[iQuarter];
	      } else {
	        return String(iQuarter + 1).padStart(oField.digits, '0');
	      }
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bValid;
	      var iQuarter;
	      var sPart;
	      var aQuartersVariants = [oFormat.aQuartersWide, oFormat.aQuartersWideSt, oFormat.aQuartersAbbrev, oFormat.aQuartersAbbrevSt, oFormat.aQuartersNarrow, oFormat.aQuartersNarrowSt];

	      if (oPart.digits < 3) {
	        sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	        bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);
	        iQuarter = parseInt(sPart) - 1;

	        if (oConfig.strict && iQuarter > 3) {
	          bValid = false;
	        }
	      } else {
	        for (var i = 0; i < aQuartersVariants.length; i++) {
	          var aVariants = aQuartersVariants[i];
	          var oFound = oParseHelper.findEntry(sValue, aVariants);

	          if (oFound.index !== -1) {
	            return {
	              quarter: oFound.index,
	              length: oFound.value.length
	            };
	          }
	        }

	        bValid = oParseHelper.checkValid(oPart.type, true, oFormat);
	      }

	      return {
	        length: sPart ? sPart.length : 0,
	        quarter: iQuarter,
	        valid: bValid
	      };
	    }
	  },
	  'F': {
	    name: 'dayOfWeekInMonth',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      return '';
	    },
	    parse: function parse() {
	      return {};
	    }
	  },
	  'E': {
	    name: 'dayNameInWeek',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();

	      if (oField.digits < 4) {
	        return oFormat.aDaysAbbrev[iDay];
	      } else if (oField.digits == 4) {
	        return oFormat.aDaysWide[iDay];
	      } else if (oField.digits == 5) {
	        return oFormat.aDaysNarrow[iDay];
	      } else {
	        return oFormat.aDaysShort[iDay];
	      }
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var aDaysVariants = [oFormat.aDaysWide, oFormat.aDaysWideSt, oFormat.aDaysAbbrev, oFormat.aDaysAbbrevSt, oFormat.aDaysShort, oFormat.aDaysShortSt, oFormat.aDaysNarrow, oFormat.aDaysNarrowSt];

	      for (var i = 0; i < aDaysVariants.length; i++) {
	        var aVariants = aDaysVariants[i];
	        var oFound = oParseHelper.findEntry(sValue, aVariants);

	        if (oFound.index !== -1) {
	          return {
	            dayOfWeek: oFound.index,
	            length: oFound.value.length
	          };
	        }
	      }
	    }
	  },
	  'c': {
	    name: 'dayNameInWeekStandalone',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();

	      if (oField.digits < 4) {
	        return oFormat.aDaysAbbrevSt[iDay];
	      } else if (oField.digits == 4) {
	        return oFormat.aDaysWideSt[iDay];
	      } else if (oField.digits == 5) {
	        return oFormat.aDaysNarrowSt[iDay];
	      } else {
	        return oFormat.aDaysShortSt[iDay];
	      }
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var aDaysVariants = [oFormat.aDaysWide, oFormat.aDaysWideSt, oFormat.aDaysAbbrev, oFormat.aDaysAbbrevSt, oFormat.aDaysShort, oFormat.aDaysShortSt, oFormat.aDaysNarrow, oFormat.aDaysNarrowSt];

	      for (var i = 0; i < aDaysVariants.length; i++) {
	        var aVariants = aDaysVariants[i];
	        var oFound = oParseHelper.findEntry(sValue, aVariants);

	        if (oFound.index !== -1) {
	          return {
	            day: oFound.index,
	            length: oFound.value.length
	          };
	        }
	      }
	    }
	  },
	  'u': {
	    name: 'dayNumberOfWeek',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iDay = bUTC ? oDate.getUTCDay() : oDate.getDay();
	      return oFormat._adaptDayOfWeek(iDay);
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var sPart = oParseHelper.findNumbers(sValue, oPart.digits);
	      return {
	        dayNumberOfWeek: parseInt(sPart),
	        length: sPart.length
	      };
	    }
	  },
	  'a': {
	    name: 'amPmMarker',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iDayPeriod = bUTC ? oDate.getUTCDayPeriod() : oDate.getDayPeriod();
	      return oFormat.aDayPeriods[iDayPeriod];
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bPM;
	      var iLength;
	      var sAM = oFormat.aDayPeriods[0],
	          sPM = oFormat.aDayPeriods[1];
	      var rAMPM = /[aApP](?:\.)?[mM](?:\.)?/;
	      var aMatch = sValue.match(rAMPM);
	      var bVariant = aMatch && aMatch.index === 0;

	      if (bVariant) {
	        sValue = aMatch[0].replace(/\./g, '').toLowerCase() + sValue.substring(aMatch[0].length);
	        sAM = sAM.replace(/\./g, '').toLowerCase();
	        sPM = sPM.replace(/\./g, '').toLowerCase();
	      }

	      if (sValue.indexOf(sAM) === 0) {
	        bPM = false;
	        iLength = bVariant ? aMatch[0].length : sAM.length;
	      } else if (sValue.indexOf(sPM) === 0) {
	        bPM = true;
	        iLength = bVariant ? aMatch[0].length : sPM.length;
	      }

	      return {
	        pm: bPM,
	        length: iLength
	      };
	    }
	  },
	  'H': {
	    name: 'hour0_23',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
	      return String(iHours).padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bValid;
	      var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	      var iHours = parseInt(sPart);
	      bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);

	      if (oConfig.strict && iHours > 23) {
	        bValid = false;
	      }

	      return {
	        hour: iHours,
	        length: sPart.length,
	        valid: bValid
	      };
	    }
	  },
	  'k': {
	    name: 'hour1_24',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
	      var sHours = iHours === 0 ? '24' : String(iHours);
	      return sHours.padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bValid;
	      var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	      var iHours = parseInt(sPart);
	      bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);

	      if (iHours == 24) {
	        iHours = 0;
	      }

	      if (oConfig.strict && iHours > 23) {
	        bValid = false;
	      }

	      return {
	        hour: iHours,
	        length: sPart.length,
	        valid: bValid
	      };
	    }
	  },
	  'K': {
	    name: 'hour0_11',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
	      var sHours = String(iHours > 11 ? iHours - 12 : iHours);
	      return sHours.padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bValid;
	      var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	      var iHours = parseInt(sPart);
	      bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);

	      if (oConfig.strict && iHours > 11) {
	        bValid = false;
	      }

	      return {
	        hour: iHours,
	        length: sPart.length,
	        valid: bValid
	      };
	    }
	  },
	  'h': {
	    name: 'hour1_12',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iHours = bUTC ? oDate.getUTCHours() : oDate.getHours();
	      var sHours;

	      if (iHours > 12) {
	        sHours = String(iHours - 12);
	      } else if (iHours == 0) {
	        sHours = '12';
	      } else {
	        sHours = String(iHours);
	      }

	      return sHours.padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bPM = oConfig.dateValue.pm;
	      var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	      var iHours = parseInt(sPart);
	      var bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);

	      if (iHours == 12) {
	        iHours = 0;
	        bPM = bPM === undefined ? true : bPM;
	      }

	      if (oConfig.strict && iHours > 11) {
	        bValid = false;
	      }

	      return {
	        hour: iHours,
	        length: sPart.length,
	        pm: bPM,
	        valid: bValid
	      };
	    }
	  },
	  'm': {
	    name: 'minute',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iMinutes = bUTC ? oDate.getUTCMinutes() : oDate.getMinutes();
	      return String(iMinutes).padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bValid;
	      var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	      var iMinutes = parseInt(sPart);
	      bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);

	      if (oConfig.strict && iMinutes > 59) {
	        bValid = false;
	      }

	      return {
	        length: sPart.length,
	        minute: iMinutes,
	        valid: bValid
	      };
	    }
	  },
	  's': {
	    name: 'second',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iSeconds = bUTC ? oDate.getUTCSeconds() : oDate.getSeconds();
	      return String(iSeconds).padStart(oField.digits, '0');
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var bValid;
	      var sPart = oParseHelper.findNumbers(sValue, Math.max(oPart.digits, 2));
	      var iSeconds = parseInt(sPart);
	      bValid = oParseHelper.checkValid(oPart.type, sPart === '', oFormat);

	      if (oConfig.strict && iSeconds > 59) {
	        bValid = false;
	      }

	      return {
	        length: sPart.length,
	        second: iSeconds,
	        valid: bValid
	      };
	    }
	  },
	  'S': {
	    name: 'fractionalsecond',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iMilliseconds = bUTC ? oDate.getUTCMilliseconds() : oDate.getMilliseconds();
	      var sMilliseconds = String(iMilliseconds);
	      var sFractionalseconds = sMilliseconds.padStart(3, '0');
	      sFractionalseconds = sFractionalseconds.substr(0, oField.digits);
	      sFractionalseconds = sFractionalseconds.padEnd(oField.digits, '0');
	      return sFractionalseconds;
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var sPart = oParseHelper.findNumbers(sValue, oPart.digits);
	      var iLength = sPart.length;
	      sPart = sPart.substr(0, 3);
	      sPart = sPart.padEnd(3, '0');
	      var iMilliseconds = parseInt(sPart);
	      return {
	        length: iLength,
	        millisecond: iMilliseconds
	      };
	    }
	  },
	  'z': {
	    name: 'timezoneGeneral',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      if (oField.digits > 3 && oDate.getTimezoneLong()) {
	        return oDate.getTimezoneLong();
	      } else if (oDate.getTimezoneShort()) {
	        return oDate.getTimezoneShort();
	      }

	      var sTimeZone = 'GMT';
	      var iTZOffset = Math.abs(oDate.getTimezoneOffset());
	      var bPositiveOffset = oDate.getTimezoneOffset() > 0;
	      var iHourOffset = Math.floor(iTZOffset / 60);
	      var iMinuteOffset = iTZOffset % 60;

	      if (!bUTC && iTZOffset != 0) {
	        sTimeZone += bPositiveOffset ? '-' : '+';
	        sTimeZone += String(iHourOffset).padStart(2, '0');
	        sTimeZone += ':';
	        sTimeZone += String(iMinuteOffset).padStart(2, '0');
	      } else {
	        sTimeZone += 'Z';
	      }

	      return sTimeZone;
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      var iLength = 0;
	      var iTZDiff;
	      var oTZ = sValue.substring(0, 3);

	      if (oTZ === 'GMT' || oTZ === 'UTC') {
	        iLength = 3;
	      } else if (sValue.substring(0, 2) === 'UT') {
	        iLength = 2;
	      } else if (sValue.charAt(0) == 'Z') {
	        iLength = 1;
	        iTZDiff = 0;
	      } else {
	        return {
	          error: 'cannot be parsed correcly by sap.ui.core.format.DateFormat: The given timezone is not supported!'
	        };
	      }

	      if (sValue.charAt(0) != 'Z') {
	        var oParsedTZ = oParseHelper.parseTZ(sValue.substr(iLength), true);
	        iLength += oParsedTZ.length;
	        iTZDiff = oParsedTZ.tzDiff;
	      }

	      return {
	        length: iLength,
	        tzDiff: iTZDiff
	      };
	    }
	  },
	  'Z': {
	    name: 'timezoneRFC822',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iTZOffset = Math.abs(oDate.getTimezoneOffset());
	      var bPositiveOffset = oDate.getTimezoneOffset() > 0;
	      var iHourOffset = Math.floor(iTZOffset / 60);
	      var iMinuteOffset = iTZOffset % 60;
	      var sTimeZone = '';

	      if (!bUTC && iTZOffset != 0) {
	        sTimeZone += bPositiveOffset ? '-' : '+';
	        sTimeZone += String(iHourOffset).padStart(2, '0');
	        sTimeZone += String(iMinuteOffset).padStart(2, '0');
	      }

	      return sTimeZone;
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      return oParseHelper.parseTZ(sValue, false);
	    }
	  },
	  'X': {
	    name: 'timezoneISO8601',
	    format: function format(oField, oDate, bUTC, oFormat) {
	      var iTZOffset = Math.abs(oDate.getTimezoneOffset());
	      var bPositiveOffset = oDate.getTimezoneOffset() > 0;
	      var iHourOffset = Math.floor(iTZOffset / 60);
	      var iMinuteOffset = iTZOffset % 60;
	      var sTimeZone = '';

	      if (!bUTC && iTZOffset != 0) {
	        sTimeZone += bPositiveOffset ? '-' : '+';
	        sTimeZone += String(iHourOffset).padStart(2, '0');
	        sTimeZone += ':';
	        sTimeZone += String(iMinuteOffset).padStart(2, '0');
	      } else {
	        sTimeZone += 'Z';
	      }

	      return sTimeZone;
	    },
	    parse: function parse(sValue, oPart, oFormat, oConfig) {
	      if (sValue.charAt(0) == 'Z') {
	        return {
	          length: 1,
	          tzDiff: 0
	        };
	      } else {
	        return oParseHelper.parseTZ(sValue, true);
	      }
	    }
	  }
	};

	DateFormat.prototype._format = function (oJSDate, bUTC) {
	  if (this.oFormatOptions.relative) {
	    var sRes = this.formatRelative(oJSDate, bUTC, this.oFormatOptions.relativeRange);

	    if (sRes) {
	      return sRes;
	    }
	  }

	  var sCalendarType = this.oFormatOptions.calendarType;
	  var oDate = UniversalDate.getInstance(oJSDate, sCalendarType);
	  var aBuffer = [],
	      oPart,
	      sResult,
	      sSymbol;

	  for (var i = 0; i < this.aFormatArray.length; i++) {
	    oPart = this.aFormatArray[i];
	    sSymbol = oPart.symbol || '';
	    aBuffer.push(this.oSymbols[sSymbol].format(oPart, oDate, bUTC, this));
	  }

	  sResult = aBuffer.join('');

	  if (Core.getConfiguration().getOriginInfo()) {
	    sResult = new String(sResult);
	    sResult.originInfo = {
	      source: 'Common Locale Data Repository',
	      locale: this.oLocale.toString(),
	      style: this.oFormatOptions.style,
	      pattern: this.oFormatOptions.pattern
	    };
	  }

	  return sResult;
	};

	DateFormat.prototype.format = function (vJSDate, bUTC) {
	  var sCalendarType = this.oFormatOptions.calendarType,
	      sResult;

	  if (bUTC === undefined) {
	    bUTC = this.oFormatOptions.UTC;
	  }

	  if (Array.isArray(vJSDate)) {
	    if (!this.oFormatOptions.interval) {
	      Log.error('Non-interval DateFormat can\'t format more than one date instance.');
	      return '';
	    }

	    if (vJSDate.length !== 2) {
	      Log.error('Interval DateFormat can only format with 2 date instances but ' + vJSDate.length + ' is given.');
	      return '';
	    }

	    if (this.oFormatOptions.singleIntervalValue) {
	      if (vJSDate[0] === null) {
	        Log.error('First date instance which is passed to the interval DateFormat shouldn\'t be null.');
	        return '';
	      }

	      if (vJSDate[1] === null) {
	        sResult = this._format(vJSDate[0], bUTC);
	      }
	    }

	    if (sResult === undefined) {
	      var bValid = vJSDate.every(function (oJSDate) {
	        return oJSDate && !isNaN(oJSDate.getTime());
	      });

	      if (!bValid) {
	        Log.error('At least one date instance which is passed to the interval DateFormat isn\'t valid.');
	        return '';
	      }

	      sResult = this._formatInterval(vJSDate, bUTC);
	    }
	  } else {
	    if (!vJSDate || isNaN(vJSDate.getTime())) {
	      Log.error('The given date instance isn\'t valid.');
	      return '';
	    }

	    if (this.oFormatOptions.interval) {
	      Log.error('Interval DateFormat expects an array with two dates for the first argument but only one date is given.');
	      return '';
	    }

	    sResult = this._format(vJSDate, bUTC);
	  }

	  if (sCalendarType == CalendarType$1.Japanese && this.oLocale.getLanguage() === 'ja') {
	    sResult = sResult.replace(/(^|[^\d])1年/g, '$1元年');
	  }

	  return sResult;
	};

	DateFormat.prototype._formatInterval = function (aJSDates, bUTC) {
	  var sCalendarType = this.oFormatOptions.calendarType;
	  var oFromDate = UniversalDate.getInstance(aJSDates[0], sCalendarType);
	  var oToDate = UniversalDate.getInstance(aJSDates[1], sCalendarType);
	  var oDate;
	  var oPart;
	  var sSymbol;
	  var aBuffer = [];
	  var sPattern;
	  var aFormatArray = [];

	  var oDiffField = this._getGreatestDiffField([oFromDate, oToDate], bUTC);

	  if (!oDiffField) {
	    return this._format(aJSDates[0], bUTC);
	  }

	  if (this.oFormatOptions.format) {
	    sPattern = this.oLocaleData.getCustomIntervalPattern(this.oFormatOptions.format, oDiffField, sCalendarType);
	  } else {
	    sPattern = this.oLocaleData.getCombinedIntervalPattern(this.oFormatOptions.pattern, sCalendarType);
	  }

	  aFormatArray = this.parseCldrDatePattern(sPattern);
	  oDate = oFromDate;

	  for (var i = 0; i < aFormatArray.length; i++) {
	    oPart = aFormatArray[i];
	    sSymbol = oPart.symbol || '';

	    if (oPart.repeat) {
	      oDate = oToDate;
	    }

	    aBuffer.push(this.oSymbols[sSymbol].format(oPart, oDate, bUTC, this));
	  }

	  return aBuffer.join('');
	};

	var mFieldToGroup = {
	  Era: 'Era',
	  FullYear: 'Year',
	  Quarter: 'Quarter',
	  Month: 'Month',
	  Week: 'Week',
	  Date: 'Day',
	  DayPeriod: 'DayPeriod',
	  Hours: 'Hour',
	  Minutes: 'Minute',
	  Seconds: 'Second'
	};

	DateFormat.prototype._getGreatestDiffField = function (aDates, bUTC) {
	  var bDiffFound = false,
	      mDiff = {};
	  this.aIntervalCompareFields.forEach(function (sField) {
	    var sGetterPrefix = 'get' + (bUTC ? 'UTC' : ''),
	        sMethodName = sGetterPrefix + sField,
	        sFieldGroup = mFieldToGroup[sField],
	        vFromValue = aDates[0][sMethodName].apply(aDates[0]),
	        vToValue = aDates[1][sMethodName].apply(aDates[1]);

	    if (!fnEqual(vFromValue, vToValue)) {
	      bDiffFound = true;
	      mDiff[sFieldGroup] = true;
	    }
	  });

	  if (bDiffFound) {
	    return mDiff;
	  }

	  return null;
	};

	DateFormat.prototype._parse = function (sValue, aFormatArray, bUTC, bStrict) {
	  var iIndex = 0,
	      oPart,
	      sSubValue,
	      oResult;
	  var oDateValue = {
	    valid: true
	  };
	  var oParseConf = {
	    formatArray: aFormatArray,
	    dateValue: oDateValue,
	    strict: bStrict
	  };

	  for (var i = 0; i < aFormatArray.length; i++) {
	    sSubValue = sValue.substr(iIndex);
	    oPart = aFormatArray[i];
	    oParseConf.index = i;
	    oResult = this.oSymbols[oPart.symbol || ''].parse(sSubValue, oPart, this, oParseConf) || {};
	    oDateValue = fnExtend(oDateValue, oResult);

	    if (oResult.valid === false) {
	      break;
	    }

	    iIndex += oResult.length || 0;
	  }

	  oDateValue.index = iIndex;

	  if (oDateValue.pm) {
	    oDateValue.hour += 12;
	  }

	  if (oDateValue.dayNumberOfWeek === undefined && oDateValue.dayOfWeek !== undefined) {
	    oDateValue.dayNumberOfWeek = this._adaptDayOfWeek(oDateValue.dayOfWeek);
	  }

	  if (oDateValue.quarter !== undefined && oDateValue.month === undefined && oDateValue.day === undefined) {
	    oDateValue.month = 3 * oDateValue.quarter;
	    oDateValue.day = 1;
	  }

	  return oDateValue;
	};

	DateFormat.prototype._parseInterval = function (sValue, sCalendarType, bUTC, bStrict) {
	  var aDateValues, iRepeat, oDateValue;
	  this.intervalPatterns.some(function (sPattern) {
	    var aFormatArray = this.parseCldrDatePattern(sPattern);
	    iRepeat = undefined;

	    for (var i = 0; i < aFormatArray.length; i++) {
	      if (aFormatArray[i].repeat) {
	        iRepeat = i;
	        break;
	      }
	    }

	    if (iRepeat === undefined) {
	      oDateValue = this._parse(sValue, aFormatArray, bUTC, bStrict);

	      if (oDateValue.index === 0 || oDateValue.index < sValue.length) {
	        oDateValue.valid = false;
	      }

	      if (oDateValue.valid === false) {
	        return;
	      }

	      aDateValues = [oDateValue, oDateValue];
	      return true;
	    } else {
	      aDateValues = [];
	      oDateValue = this._parse(sValue, aFormatArray.slice(0, iRepeat), bUTC, bStrict);

	      if (oDateValue.valid === false) {
	        return;
	      }

	      aDateValues.push(oDateValue);
	      var iLength = oDateValue.index;
	      oDateValue = this._parse(sValue.substring(iLength), aFormatArray.slice(iRepeat), bUTC, bStrict);

	      if (oDateValue.index === 0 || oDateValue.index + iLength < sValue.length) {
	        oDateValue.valid = false;
	      }

	      if (oDateValue.valid === false) {
	        return;
	      }

	      aDateValues.push(oDateValue);
	      return true;
	    }
	  }.bind(this));
	  return aDateValues;
	};

	var fnCreateDate = function fnCreateDate(oDateValue, sCalendarType, bUTC, bStrict) {
	  var oDate,
	      iYear = typeof oDateValue.year === 'number' ? oDateValue.year : 1970;

	  if (oDateValue.valid) {
	    if (bUTC || oDateValue.tzDiff !== undefined) {
	      oDate = UniversalDate.getInstance(new Date(0), sCalendarType);
	      oDate.setUTCEra(oDateValue.era || UniversalDate.getCurrentEra(sCalendarType));
	      oDate.setUTCFullYear(iYear);
	      oDate.setUTCMonth(oDateValue.month || 0);
	      oDate.setUTCDate(oDateValue.day || 1);
	      oDate.setUTCHours(oDateValue.hour || 0);
	      oDate.setUTCMinutes(oDateValue.minute || 0);
	      oDate.setUTCSeconds(oDateValue.second || 0);
	      oDate.setUTCMilliseconds(oDateValue.millisecond || 0);

	      if (bStrict && (oDateValue.day || 1) !== oDate.getUTCDate()) {
	        oDateValue.valid = false;
	        oDate = undefined;
	      } else {
	        if (oDateValue.tzDiff) {
	          oDate.setUTCMinutes((oDateValue.minute || 0) + oDateValue.tzDiff);
	        }

	        if (oDateValue.week !== undefined && (oDateValue.month === undefined || oDateValue.day === undefined)) {
	          oDate.setUTCWeek({
	            year: oDateValue.weekYear || oDateValue.year,
	            week: oDateValue.week
	          });

	          if (oDateValue.dayNumberOfWeek !== undefined) {
	            oDate.setUTCDate(oDate.getUTCDate() + oDateValue.dayNumberOfWeek - 1);
	          }
	        }
	      }
	    } else {
	      oDate = UniversalDate.getInstance(new Date(1970, 0, 1, 0, 0, 0), sCalendarType);
	      oDate.setEra(oDateValue.era || UniversalDate.getCurrentEra(sCalendarType));
	      oDate.setFullYear(iYear);
	      oDate.setMonth(oDateValue.month || 0);
	      oDate.setDate(oDateValue.day || 1);
	      oDate.setHours(oDateValue.hour || 0);
	      oDate.setMinutes(oDateValue.minute || 0);
	      oDate.setSeconds(oDateValue.second || 0);
	      oDate.setMilliseconds(oDateValue.millisecond || 0);

	      if (bStrict && (oDateValue.day || 1) !== oDate.getDate()) {
	        oDateValue.valid = false;
	        oDate = undefined;
	      } else if (oDateValue.week !== undefined && (oDateValue.month === undefined || oDateValue.day === undefined)) {
	        oDate.setWeek({
	          year: oDateValue.weekYear || oDateValue.year,
	          week: oDateValue.week
	        });

	        if (oDateValue.dayNumberOfWeek !== undefined) {
	          oDate.setDate(oDate.getDate() + oDateValue.dayNumberOfWeek - 1);
	        }
	      }
	    }

	    if (oDateValue.valid) {
	      oDate = oDate.getJSDate();
	      return oDate;
	    }
	  }

	  return null;
	};

	function mergeWithoutOverwrite(object1, object2) {
	  if (object1 === object2) {
	    return object1;
	  }

	  var oMergedObject = {};
	  Object.keys(object1).forEach(function (sKey) {
	    oMergedObject[sKey] = object1[sKey];
	  });
	  Object.keys(object2).forEach(function (sKey) {
	    if (!oMergedObject.hasOwnProperty(sKey)) {
	      oMergedObject[sKey] = object2[sKey];
	    }
	  });
	  return oMergedObject;
	}

	function isValidDateRange(oStartDate, oEndDate) {
	  if (oStartDate.getTime() > oEndDate.getTime()) {
	    return false;
	  }

	  return true;
	}

	DateFormat.prototype.parse = function (sValue, bUTC, bStrict) {
	  sValue = sValue == null ? '' : String(sValue).trim();
	  var oDateValue;
	  var sCalendarType = this.oFormatOptions.calendarType;

	  if (bUTC === undefined) {
	    bUTC = this.oFormatOptions.UTC;
	  }

	  if (bStrict === undefined) {
	    bStrict = this.oFormatOptions.strictParsing;
	  }

	  if (sCalendarType == CalendarType$1.Japanese && this.oLocale.getLanguage() === 'ja') {
	    sValue = sValue.replace(/元年/g, '1年');
	  }

	  if (!this.oFormatOptions.interval) {
	    var oJSDate = this.parseRelative(sValue, bUTC);

	    if (oJSDate) {
	      return oJSDate;
	    }

	    oDateValue = this._parse(sValue, this.aFormatArray, bUTC, bStrict);

	    if (oDateValue.index === 0 || oDateValue.index < sValue.length) {
	      oDateValue.valid = false;
	    }

	    oJSDate = fnCreateDate(oDateValue, sCalendarType, bUTC, bStrict);

	    if (oJSDate) {
	      return oJSDate;
	    }
	  } else {
	    var aDateValues = this._parseInterval(sValue, sCalendarType, bUTC, bStrict);

	    var oJSDate1, oJSDate2;

	    if (aDateValues && aDateValues.length == 2) {
	      var oDateValue1 = mergeWithoutOverwrite(aDateValues[0], aDateValues[1]);
	      var oDateValue2 = mergeWithoutOverwrite(aDateValues[1], aDateValues[0]);
	      oJSDate1 = fnCreateDate(oDateValue1, sCalendarType, bUTC, bStrict);
	      oJSDate2 = fnCreateDate(oDateValue2, sCalendarType, bUTC, bStrict);

	      if (oJSDate1 && oJSDate2) {
	        if (this.oFormatOptions.singleIntervalValue && oJSDate1.getTime() === oJSDate2.getTime()) {
	          return [oJSDate1, null];
	        }

	        var bValid = isValidDateRange(oJSDate1, oJSDate2);

	        if (bStrict && !bValid) {
	          Log.error('StrictParsing: Invalid date range. The given end date is before the start date.');
	          return [null, null];
	        }

	        return [oJSDate1, oJSDate2];
	      }
	    }
	  }

	  if (!this.bIsFallback) {
	    var vDate;
	    this.aFallbackFormats.every(function (oFallbackFormat) {
	      vDate = oFallbackFormat.parse(sValue, bUTC, bStrict);

	      if (Array.isArray(vDate)) {
	        return !(vDate[0] && vDate[1]);
	      } else {
	        return !vDate;
	      }
	    });
	    return vDate;
	  }

	  if (!this.oFormatOptions.interval) {
	    return null;
	  } else {
	    return [null, null];
	  }
	};

	DateFormat.prototype.parseCldrDatePattern = function (sPattern) {
	  if (mCldrDatePattern[sPattern]) {
	    return mCldrDatePattern[sPattern];
	  }

	  var aFormatArray = [],
	      i,
	      bQuoted = false,
	      oCurrentObject = null,
	      sState = '',
	      sNewState = '',
	      mAppeared = {},
	      bIntervalStartFound = false;

	  for (i = 0; i < sPattern.length; i++) {
	    var sCurChar = sPattern.charAt(i),
	        sNextChar,
	        sPrevChar,
	        sPrevPrevChar;

	    if (bQuoted) {
	      if (sCurChar == '\'') {
	        sPrevChar = sPattern.charAt(i - 1);
	        sPrevPrevChar = sPattern.charAt(i - 2);
	        sNextChar = sPattern.charAt(i + 1);

	        if (sPrevChar == '\'' && sPrevPrevChar != '\'') {
	          bQuoted = false;
	        } else if (sNextChar == '\'') {
	          i += 1;
	        } else {
	          bQuoted = false;
	          continue;
	        }
	      }

	      if (sState == 'text') {
	        oCurrentObject.value += sCurChar;
	      } else {
	        oCurrentObject = {
	          type: 'text',
	          value: sCurChar
	        };
	        aFormatArray.push(oCurrentObject);
	        sState = 'text';
	      }
	    } else {
	      if (sCurChar == '\'') {
	        bQuoted = true;
	      } else if (this.oSymbols[sCurChar]) {
	        sNewState = this.oSymbols[sCurChar].name;

	        if (sState == sNewState) {
	          oCurrentObject.digits++;
	        } else {
	          oCurrentObject = {
	            type: sNewState,
	            symbol: sCurChar,
	            digits: 1
	          };
	          aFormatArray.push(oCurrentObject);
	          sState = sNewState;

	          if (!bIntervalStartFound) {
	            if (mAppeared[sNewState]) {
	              oCurrentObject.repeat = true;
	              bIntervalStartFound = true;
	            } else {
	              mAppeared[sNewState] = true;
	            }
	          }
	        }
	      } else {
	        if (sState == 'text') {
	          oCurrentObject.value += sCurChar;
	        } else {
	          oCurrentObject = {
	            type: 'text',
	            value: sCurChar
	          };
	          aFormatArray.push(oCurrentObject);
	          sState = 'text';
	        }
	      }
	    }
	  }

	  mCldrDatePattern[sPattern] = aFormatArray;
	  return aFormatArray;
	};

	DateFormat.prototype.parseRelative = function (sValue, bUTC) {
	  var aPatterns, oEntry, rPattern, oResult, iValue;

	  if (!sValue) {
	    return null;
	  }

	  aPatterns = this.oLocaleData.getRelativePatterns(this.aRelativeParseScales, this.oFormatOptions.relativeStyle);

	  for (var i = 0; i < aPatterns.length; i++) {
	    oEntry = aPatterns[i];
	    rPattern = new RegExp('^\\s*' + oEntry.pattern.replace(/\{0\}/, '(\\d+)') + '\\s*$', 'i');
	    oResult = rPattern.exec(sValue);

	    if (oResult) {
	      if (oEntry.value !== undefined) {
	        return computeRelativeDate(oEntry.value, oEntry.scale);
	      } else {
	        iValue = parseInt(oResult[1]);
	        return computeRelativeDate(iValue * oEntry.sign, oEntry.scale);
	      }
	    }
	  }

	  function computeRelativeDate(iDiff, sScale) {
	    var iToday,
	        oToday = new Date(),
	        oJSDate;

	    if (bUTC) {
	      iToday = oToday.getTime();
	    } else {
	      iToday = Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate(), oToday.getHours(), oToday.getMinutes(), oToday.getSeconds(), oToday.getMilliseconds());
	    }

	    oJSDate = new Date(iToday);

	    switch (sScale) {
	      case 'second':
	        oJSDate.setUTCSeconds(oJSDate.getUTCSeconds() + iDiff);
	        break;

	      case 'minute':
	        oJSDate.setUTCMinutes(oJSDate.getUTCMinutes() + iDiff);
	        break;

	      case 'hour':
	        oJSDate.setUTCHours(oJSDate.getUTCHours() + iDiff);
	        break;

	      case 'day':
	        oJSDate.setUTCDate(oJSDate.getUTCDate() + iDiff);
	        break;

	      case 'week':
	        oJSDate.setUTCDate(oJSDate.getUTCDate() + iDiff * 7);
	        break;

	      case 'month':
	        oJSDate.setUTCMonth(oJSDate.getUTCMonth() + iDiff);
	        break;

	      case 'quarter':
	        oJSDate.setUTCMonth(oJSDate.getUTCMonth() + iDiff * 3);
	        break;

	      case 'year':
	        oJSDate.setUTCFullYear(oJSDate.getUTCFullYear() + iDiff);
	        break;
	    }

	    if (bUTC) {
	      return oJSDate;
	    } else {
	      return new Date(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate(), oJSDate.getUTCHours(), oJSDate.getUTCMinutes(), oJSDate.getUTCSeconds(), oJSDate.getUTCMilliseconds());
	    }
	  }
	};

	DateFormat.prototype.formatRelative = function (oJSDate, bUTC, aRange) {
	  var oToday = new Date(),
	      oDateUTC,
	      sScale = this.oFormatOptions.relativeScale || 'day',
	      iDiff,
	      sPattern,
	      iDiffSeconds;
	  iDiffSeconds = (oJSDate.getTime() - oToday.getTime()) / 1000;

	  if (this.oFormatOptions.relativeScale == 'auto') {
	    sScale = this._getScale(iDiffSeconds, this.aRelativeScales);
	  }

	  if (!aRange) {
	    aRange = this._mRanges[sScale];
	  }

	  if (sScale == 'year' || sScale == 'month' || sScale == 'day') {
	    oToday = new Date(Date.UTC(oToday.getFullYear(), oToday.getMonth(), oToday.getDate()));
	    oDateUTC = new Date(0);

	    if (bUTC) {
	      oDateUTC.setUTCFullYear(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate());
	    } else {
	      oDateUTC.setUTCFullYear(oJSDate.getFullYear(), oJSDate.getMonth(), oJSDate.getDate());
	    }

	    oJSDate = oDateUTC;
	  }

	  iDiff = this._getDifference(sScale, [oToday, oJSDate]);

	  if (this.oFormatOptions.relativeScale != 'auto' && (iDiff < aRange[0] || iDiff > aRange[1])) {
	    return null;
	  }

	  sPattern = this.oLocaleData.getRelativePattern(sScale, iDiff, iDiffSeconds > 0, this.oFormatOptions.relativeStyle);
	  return fnFormatMessage(sPattern, [Math.abs(iDiff)]);
	};

	DateFormat.prototype._mRanges = {
	  second: [-60, 60],
	  minute: [-60, 60],
	  hour: [-24, 24],
	  day: [-6, 6],
	  week: [-4, 4],
	  month: [-12, 12],
	  year: [-10, 10]
	};
	DateFormat.prototype._mScales = {
	  second: 1,
	  minute: 60,
	  hour: 3600,
	  day: 86400,
	  week: 604800,
	  month: 2592000,
	  quarter: 7776000,
	  year: 31536000
	};

	DateFormat.prototype._getScale = function (iDiffSeconds, aScales) {
	  var sScale, sTestScale;
	  iDiffSeconds = Math.abs(iDiffSeconds);

	  for (var i = 0; i < aScales.length; i++) {
	    sTestScale = aScales[i];

	    if (iDiffSeconds >= this._mScales[sTestScale]) {
	      sScale = sTestScale;
	      break;
	    }
	  }

	  if (!sScale) {
	    sScale = aScales[aScales.length - 1];
	  }

	  return sScale;
	};

	function cutDateFields(oDate, iStartIndex) {
	  var aFields = ['FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds', 'Milliseconds'],
	      sMethodName;

	  for (var i = iStartIndex; i < aFields.length; i++) {
	    sMethodName = 'set' + aFields[iStartIndex];
	    oDate[sMethodName].apply(oDate, [0]);
	  }
	}

	var mRelativeDiffs = {
	  year: function year(oFromDate, oToDate) {
	    return oToDate.getFullYear() - oFromDate.getFullYear();
	  },
	  month: function month(oFromDate, oToDate) {
	    return oToDate.getMonth() - oFromDate.getMonth() + this.year(oFromDate, oToDate) * 12;
	  },
	  week: function week(oFromDate, oToDate, oFormat) {
	    var iFromDay = oFormat._adaptDayOfWeek(oFromDate.getDay());

	    var iToDay = oFormat._adaptDayOfWeek(oToDate.getDay());

	    cutDateFields(oFromDate, 3);
	    cutDateFields(oToDate, 3);
	    return (oToDate.getTime() - oFromDate.getTime() - (iToDay - iFromDay) * oFormat._mScales.day * 1000) / (oFormat._mScales.week * 1000);
	  },
	  day: function day(oFromDate, oToDate, oFormat) {
	    cutDateFields(oFromDate, 3);
	    cutDateFields(oToDate, 3);
	    return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.day * 1000);
	  },
	  hour: function hour(oFromDate, oToDate, oFormat) {
	    cutDateFields(oFromDate, 4);
	    cutDateFields(oToDate, 4);
	    return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.hour * 1000);
	  },
	  minute: function minute(oFromDate, oToDate, oFormat) {
	    cutDateFields(oFromDate, 5);
	    cutDateFields(oToDate, 5);
	    return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.minute * 1000);
	  },
	  second: function second(oFromDate, oToDate, oFormat) {
	    cutDateFields(oFromDate, 6);
	    cutDateFields(oToDate, 6);
	    return (oToDate.getTime() - oFromDate.getTime()) / (oFormat._mScales.second * 1000);
	  }
	};

	DateFormat.prototype._adaptDayOfWeek = function (iDayOfWeek) {
	  var iFirstDayOfWeek = LocaleData.getInstance(Core.getConfiguration().getFormatSettings().getFormatLocale()).getFirstDayOfWeek();
	  var iDayNumberOfWeek = iDayOfWeek - (iFirstDayOfWeek - 1);

	  if (iDayNumberOfWeek <= 0) {
	    iDayNumberOfWeek += 7;
	  }

	  return iDayNumberOfWeek;
	};

	DateFormat.prototype._getDifference = function (sScale, aDates) {
	  var oFromDate = aDates[0];
	  var oToDate = aDates[1];
	  return Math.round(mRelativeDiffs[sScale](oFromDate, oToDate, this));
	};

	DateFormat.prototype.getAllowedCharacters = function (aFormatArray) {
	  if (this.oFormatOptions.relative) {
	    return '';
	  }

	  var sAllowedCharacters = '';
	  var bNumbers = false;
	  var bAll = false;
	  var oPart;

	  for (var i = 0; i < aFormatArray.length; i++) {
	    oPart = aFormatArray[i];

	    switch (oPart.type) {
	      case 'text':
	        if (sAllowedCharacters.indexOf(oPart.value) < 0) {
	          sAllowedCharacters += oPart.value;
	        }

	        break;

	      case 'day':
	      case 'year':
	      case 'weekYear':
	      case 'dayNumberOfWeek':
	      case 'weekInYear':
	      case 'hour0_23':
	      case 'hour1_24':
	      case 'hour0_11':
	      case 'hour1_12':
	      case 'minute':
	      case 'second':
	      case 'fractionalsecond':
	        if (!bNumbers) {
	          sAllowedCharacters += '0123456789';
	          bNumbers = true;
	        }

	        break;

	      case 'month':
	      case 'monthStandalone':
	        if (oPart.digits < 3) {
	          if (!bNumbers) {
	            sAllowedCharacters += '0123456789';
	            bNumbers = true;
	          }
	        } else {
	          bAll = true;
	        }

	        break;

	      default:
	        bAll = true;
	        break;
	    }
	  }

	  if (bAll) {
	    sAllowedCharacters = '';
	  }

	  return sAllowedCharacters;
	};

	var CalendarDate =
	/*#__PURE__*/
	function () {
	  function CalendarDate() {
	    __chunk_1._classCallCheck(this, CalendarDate);

	    var aArgs = arguments,
	        // eslint-disable-line
	    oJSDate,
	        oNow,
	        sCalendarType;

	    switch (aArgs.length) {
	      case 0:
	        // defaults to the current date
	        oNow = new Date();
	        return this.constructor(oNow.getFullYear(), oNow.getMonth(), oNow.getDate());

	      case 1: // CalendarDate

	      case 2:
	        // CalendarDate, sCalendarType
	        if (!(aArgs[0] instanceof CalendarDate)) {
	          throw new Error("Invalid arguments: the first argument must be of type sap.ui.unified.calendar.CalendarDate.");
	        }

	        sCalendarType = aArgs[1] ? aArgs[1] : aArgs[0]._oUDate.sCalendarType; // Use source.valueOf() (returns the same point of time regardless calendar type) instead of
	        // source's getters to avoid non-gregorian Year, Month and Date may be used to construct a Gregorian date

	        oJSDate = new Date(aArgs[0].valueOf()); // Make this date really local. Now getters are safe.

	        oJSDate.setFullYear(oJSDate.getUTCFullYear(), oJSDate.getUTCMonth(), oJSDate.getUTCDate());
	        oJSDate.setHours(oJSDate.getUTCHours(), oJSDate.getUTCMinutes(), oJSDate.getUTCSeconds(), oJSDate.getUTCMilliseconds());
	        this._oUDate = createUniversalUTCDate(oJSDate, sCalendarType);
	        break;

	      case 3: // year, month, date

	      case 4:
	        // year, month, date, sCalendarType
	        checkNumericLike(aArgs[0], "Invalid year: ".concat(aArgs[0]));
	        checkNumericLike(aArgs[1], "Invalid month: ".concat(aArgs[1]));
	        checkNumericLike(aArgs[2], "Invalid date: ".concat(aArgs[2]));
	        oJSDate = new Date(0, 0, 1);
	        oJSDate.setFullYear(aArgs[0], aArgs[1], aArgs[2]); // 2 digits year is not supported. If so, it is considered as full year as well.

	        if (aArgs[3]) {
	          sCalendarType = aArgs[3];
	        }

	        this._oUDate = createUniversalUTCDate(oJSDate, sCalendarType);
	        break;

	      default:
	        throw new Error("".concat("Invalid arguments. Accepted arguments are: 1) oCalendarDate, (optional)calendarType" + "or 2) year, month, date, (optional) calendarType").concat(aArgs));
	    }
	  }

	  __chunk_1._createClass(CalendarDate, [{
	    key: "getYear",
	    value: function getYear() {
	      return this._oUDate.getUTCFullYear();
	    }
	  }, {
	    key: "setYear",
	    value: function setYear(year) {
	      checkNumericLike(year, "Invalid year: ".concat(year));

	      this._oUDate.setUTCFullYear(year);

	      return this;
	    }
	  }, {
	    key: "getMonth",
	    value: function getMonth() {
	      return this._oUDate.getUTCMonth();
	    }
	  }, {
	    key: "setMonth",
	    value: function setMonth(month) {
	      checkNumericLike(month, "Invalid month: ".concat(month));

	      this._oUDate.setUTCMonth(month);

	      return this;
	    }
	  }, {
	    key: "getDate",
	    value: function getDate() {
	      return this._oUDate.getUTCDate();
	    }
	  }, {
	    key: "setDate",
	    value: function setDate(date) {
	      checkNumericLike(date, "Invalid date: ".concat(date));

	      this._oUDate.setUTCDate(date);

	      return this;
	    }
	  }, {
	    key: "getDay",
	    value: function getDay() {
	      return this._oUDate.getUTCDay();
	    }
	  }, {
	    key: "getCalendarType",
	    value: function getCalendarType() {
	      return this._oUDate.sCalendarType;
	    }
	  }, {
	    key: "isBefore",
	    value: function isBefore(oCalendarDate) {
	      checkCalendarDate(oCalendarDate);
	      return this.valueOf() < oCalendarDate.valueOf();
	    }
	  }, {
	    key: "isAfter",
	    value: function isAfter(oCalendarDate) {
	      checkCalendarDate(oCalendarDate);
	      return this.valueOf() > oCalendarDate.valueOf();
	    }
	  }, {
	    key: "isSameOrBefore",
	    value: function isSameOrBefore(oCalendarDate) {
	      checkCalendarDate(oCalendarDate);
	      return this.valueOf() <= oCalendarDate.valueOf();
	    }
	  }, {
	    key: "isSameOrAfter",
	    value: function isSameOrAfter(oCalendarDate) {
	      checkCalendarDate(oCalendarDate);
	      return this.valueOf() >= oCalendarDate.valueOf();
	    }
	  }, {
	    key: "isSame",
	    value: function isSame(oCalendarDate) {
	      checkCalendarDate(oCalendarDate);
	      return this.valueOf() === oCalendarDate.valueOf();
	    }
	  }, {
	    key: "toLocalJSDate",
	    value: function toLocalJSDate() {
	      // Use this._oUDate.getTime()(returns the same point of time regardless calendar type)  instead of
	      // this._oUDate's getters to avoid non-gregorian Year, Month and Date to be used to construct a Gregorian date
	      var oLocalDate = new Date(this._oUDate.getTime()); // Make this date really local. Now getters are safe.

	      oLocalDate.setFullYear(oLocalDate.getUTCFullYear(), oLocalDate.getUTCMonth(), oLocalDate.getUTCDate());
	      oLocalDate.setHours(0, 0, 0, 0);
	      return oLocalDate;
	    }
	  }, {
	    key: "toUTCJSDate",
	    value: function toUTCJSDate() {
	      // Use this._oUDate.getTime()(returns the same point of time regardless calendar type)  instead of
	      // this._oUDate's getters to avoid non-gregorian Year, Month and Date to be used to construct a Gregorian date
	      var oUTCDate = new Date(this._oUDate.getTime());
	      oUTCDate.setUTCHours(0, 0, 0, 0);
	      return oUTCDate;
	    }
	  }, {
	    key: "toString",
	    value: function toString() {
	      return "".concat(this._oUDate.sCalendarType, ": ").concat(this.getYear(), "/").concat(this.getMonth() + 1, "/").concat(this.getDate());
	    }
	  }, {
	    key: "valueOf",
	    value: function valueOf() {
	      return this._oUDate.getTime();
	    }
	  }], [{
	    key: "fromLocalJSDate",
	    value: function fromLocalJSDate(oJSDate, sCalendarType) {
	      // Cross frame check for a date should be performed here otherwise setDateValue would fail in OPA tests
	      // because Date object in the test is different than the Date object in the application (due to the iframe).
	      // We can use jQuery.type or this method:
	      function isValidDate(date) {
	        return date && Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date); // eslint-disable-line
	      }

	      if (!isValidDate(oJSDate)) {
	        throw new Error("Date parameter must be a JavaScript Date object: [".concat(oJSDate, "]."));
	      }

	      return new CalendarDate(oJSDate.getFullYear(), oJSDate.getMonth(), oJSDate.getDate(), sCalendarType);
	    }
	  }, {
	    key: "fromTimestamp",
	    value: function fromTimestamp(iTimestamp, sCalendarType) {
	      var oCalDate = new CalendarDate(0, 0, 1);
	      oCalDate._oUDate = UniversalDate.getInstance(new Date(iTimestamp), sCalendarType);
	      return oCalDate;
	    }
	  }]);

	  return CalendarDate;
	}();

	function createUniversalUTCDate(oDate, sCalendarType) {
	  if (sCalendarType) {
	    return UniversalDate.getInstance(createUTCDate(oDate), sCalendarType);
	  }

	  return new UniversalDate(createUTCDate(oDate).getTime());
	}
	/**
	 * Creates a JavaScript UTC Date corresponding to the given JavaScript Date.
	 * @param {Date} oDate JavaScript date object. Time related information is cut.
	 * @returns {Date} JavaScript date created from the date object, but this time considered as UTC date information.
	 */


	function createUTCDate(oDate) {
	  var oUTCDate = new Date(Date.UTC(0, 0, 1));
	  oUTCDate.setUTCFullYear(oDate.getFullYear(), oDate.getMonth(), oDate.getDate());
	  return oUTCDate;
	}

	function checkCalendarDate(oCalendarDate) {
	  if (!(oCalendarDate instanceof CalendarDate)) {
	    throw new Error("Invalid calendar date: [".concat(oCalendarDate, "]. Expected: sap.ui.unified.calendar.CalendarDate"));
	  }
	}
	/**
	 * Verifies the given value is numeric like, i.e. 3, "3" and throws an error if it is not.
	 * @param {any} value The value of any type to check. If null or undefined, this method throws an error.
	 * @param {string} message The message to be used if an error is to be thrown
	 * @throws will throw an error if the value is null or undefined or is not like a number
	 */


	function checkNumericLike(value, message) {
	  if (value === undefined || value === Infinity || isNaN(value)) {
	    // eslint-disable-line
	    throw message;
	  }
	}

	var name = "appointment-2";
	var pathData = "M448 33q14 0 23 9t9 23v416q0 14-9 23t-23 9H64q-13 0-22.5-9T32 481V65q0-14 9.5-23T64 33h64V1h32v32h192V1h32v32h64zm-96 64h32V65h-32v32zm-224 0h32V65h-32v32zm320 32H64v352h384V129zM128 257q-14 0-23-9t-9-23 9-23 23-9 23 9 9 23-9 23-23 9zm128 0q-14 0-23-9t-9-23 9-23 23-9 23 9 9 23-9 23-23 9zm128 0q-14 0-23-9t-9-23 9-23 23-9 23 9 9 23-9 23-23 9zm0 128q-14 0-23-9t-9-23 9-23 23-9 23 9 9 23-9 23-23 9zm-128 0q-14 0-23-9t-9-23 9-23 23-9 23 9 9 23-9 23-23 9zm-128 0q-14 0-23-9t-9-23 9-23 23-9 23 9 9 23-9 23-23 9z";
	var ltr = false;
	__chunk_1.registerIcon(name, {
	  pathData: pathData,
	  ltr: ltr
	});

	function _templateObject() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-calheader-root\" dir=\"", "\" @keydown=", "><div id=\"", "-btnPrev\" class=\"", "\" @click=", " data-sap-cal-head-button=\"Prev\"><ui5-icon class=\"ui5-calheader-arrowicon\" name=\"", "\"></ui5-icon></div><div class=\"ui5-calheader-midcontainer\"><div id=\"", "-btn1\" class=\"ui5-calheader-arrowbtn ui5-calheader-middlebtn\" type=\"", "\" tabindex=\"0\" @click=", " data-sap-show-picker=\"Month\">", "</div><div id=\"", "-btn2\" class=\"ui5-calheader-arrowbtn ui5-calheader-middlebtn\" type=\"", "\" tabindex=\"0\" @click=", " data-sap-show-picker=\"Year\">", "</div></div><div class=\"", "\" @click=", " id=\"", "-btnNext\" data-sap-cal-head-button=\"Next\"><ui5-icon class=\"ui5-calheader-arrowicon\" name=\"", "\"></ui5-icon></div></div>"]);

	  _templateObject = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject(), __chunk_2.ifDefined(context.effectiveDir), context._onkeydown, __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._btnPrev.classes), context._handlePrevPress, __chunk_2.ifDefined(context._btnPrev.icon), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._btn1.type), context._showMonthPicker, __chunk_2.ifDefined(context._btn1.text), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._btn2.type), context._showYearPicker, __chunk_2.ifDefined(context._btn2.text), __chunk_2.ifDefined(context._btnNext.classes), context._handleNextPress, __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._btnNext.icon));
	};

	var main = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles = ":host{display:inline-block;width:100%}.ui5-calheader-root{display:flex;height:var(--_ui5_calendar_header_height);padding:var(--_ui5_calendar_header_padding);box-sizing:border-box}.ui5-calheader-root [ui5-button]{height:100%}.ui5-calheader-arrowbtn{display:flex;justify-content:center;align-items:center;width:var(--_ui5_calendar_header_arrow_button_width);background-color:var(--sapButton_Lite_Background);color:var(--sapButton_TextColor);cursor:pointer;overflow:hidden;white-space:nowrap;padding:0;font-size:var(--sapFontSize)}.ui5-calheader-arrowbtn.ui5-calheader-arrowbtn-disabled,.ui5-calheader-arrowbtn.ui5-calheader-arrowbtn-disabled:active,.ui5-calheader-arrowbtn.ui5-calheader-arrowbtn-disabled:focus,.ui5-calheader-arrowbtn.ui5-calheader-arrowbtn-disabled:hover{pointer-events:none;opacity:.4;outline:none;background-color:var(--sapButton_Lite_Background);color:var(--sapButton_TextColor)}.ui5-calheader-arrowbtn:focus{outline:none}.ui5-calheader-arrowbtn:hover{background-color:var(--sapButton_Hover_Background);color:var(--sapButton_Hover_TextColor)}.ui5-calheader-arrowbtn:active{background-color:var(--sapButton_Active_Background);color:var(--sapButton_Active_TextColor)}.ui5-calheader-arrowbtn,.ui5-calheader-middlebtn{border:var(--_ui5_calendar_header_arrow_button_border);border-radius:var(--_ui5_calendar_header_arrow_button_border_radius)}.ui5-calheader-arrowicon{color:currentColor;pointer-events:none}.ui5-calheader-midcontainer{display:flex;justify-content:space-around;flex:1 1 auto;padding:0 .5rem}.ui5-calheader-midcontainer .ui5-calheader-middlebtn:first-child{margin-right:.5rem}.ui5-calheader-middlebtn{font-family:var(--sapFontFamily);width:var(--_ui5_calendar_header_middle_button_width);flex:var(--_ui5_calendar_header_middle_button_flex);position:relative;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ui5-calheader-middlebtn:focus{border:var(--_ui5_calendar_header_middle_button_focus_border);border-radius:var(--_ui5_calendar_header_middle_button_focus_border_radius)}.ui5-calheader-middlebtn:focus:after{content:\"\";display:var(--_ui5_calendar_header_middle_button_focus_after_display);width:var(--_ui5_calendar_header_middle_button_focus_after_width);height:var(--_ui5_calendar_header_middle_button_focus_after_height);border:1px dotted var(--sapContent_FocusColor);position:absolute;top:var(--_ui5_calendar_header_middle_button_focus_after_top_offset);left:var(--_ui5_calendar_header_middle_button_focus_after_left_offset)}.ui5-calheader-middlebtn:focus:active:after{border-color:var(--sapContent_ContrastFocusColor)}[dir=rtl] .ui5-calheader-root-midcontainer .ui5-calheader-middlebtn:first-child{margin-left:.5rem;margin-right:0}";

	var metadata = {
	  tag: "ui5-calendar-header",
	  properties: {
	    monthText: {
	      type: String
	    },
	    yearText: {
	      type: String
	    },
	    _btnPrev: {
	      type: Object
	    },
	    _btnNext: {
	      type: Object
	    },
	    _btn1: {
	      type: Object
	    },
	    _btn2: {
	      type: Object
	    },
	    _isNextButtonDisabled: {
	      type: Boolean
	    },
	    _isPrevButtonDisabled: {
	      type: Boolean
	    }
	  },
	  events: {
	    "previous-press": {},
	    "next-press": {},
	    "show-month-press": {},
	    "show-year-press": {}
	  }
	};

	var CalendarHeader =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(CalendarHeader, _UI5Element);

	  __chunk_1._createClass(CalendarHeader, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return styles;
	    }
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_14.Button, __chunk_9.Icon];
	    }
	  }]);

	  function CalendarHeader() {
	    var _this;

	    __chunk_1._classCallCheck(this, CalendarHeader);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(CalendarHeader).call(this));
	    _this._btnPrev = {};
	    _this._btnPrev.icon = "slim-arrow-left";
	    _this._btnNext = {};
	    _this._btnNext.icon = "slim-arrow-right";
	    _this._btn1 = {};
	    _this._btn1.type = __chunk_14.ButtonDesign.Transparent;
	    _this._btn2 = {};
	    _this._btn2.type = __chunk_14.ButtonDesign.Transparent;
	    return _this;
	  }

	  __chunk_1._createClass(CalendarHeader, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      this._btn1.text = this.monthText;
	      this._btn2.text = this.yearText;
	      this._btnPrev.classes = "ui5-calheader-arrowbtn";
	      this._btnNext.classes = "ui5-calheader-arrowbtn";

	      if (this._isNextButtonDisabled) {
	        this._btnNext.classes += " ui5-calheader-arrowbtn-disabled";
	      }

	      if (this._isPrevButtonDisabled) {
	        this._btnPrev.classes += " ui5-calheader-arrowbtn-disabled";
	      }
	    }
	  }, {
	    key: "_handlePrevPress",
	    value: function _handlePrevPress(event) {
	      this.fireEvent("previous-press", event);
	    }
	  }, {
	    key: "_handleNextPress",
	    value: function _handleNextPress(event) {
	      this.fireEvent("next-press", event);
	    }
	  }, {
	    key: "_showMonthPicker",
	    value: function _showMonthPicker(event) {
	      this.fireEvent("show-month-press", event);
	    }
	  }, {
	    key: "_showYearPicker",
	    value: function _showYearPicker(event) {
	      this.fireEvent("show-year-press", event);
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isSpace(event) || __chunk_8.isEnter(event)) {
	        var showPickerButton = event.target.getAttribute("data-sap-show-picker");

	        if (showPickerButton) {
	          this["_show".concat(showPickerButton, "Picker")]();
	        }
	      }
	    }
	  }]);

	  return CalendarHeader;
	}(__chunk_1.UI5Element);

	CalendarHeader.define();

	var formatSettings;

	var getFirstDayOfWeek = function getFirstDayOfWeek() {
	  if (formatSettings === undefined) {
	    formatSettings = __chunk_1.getFormatSettings();
	  }

	  return formatSettings.firstDayOfWeek;
	};
	 // eslint-disable-line

	var calculateWeekNumber = function calculateWeekNumber(confFirstDayOfWeek, oDate, iYear, oLocale, oLocaleData) {
	  var iWeekNum = 0;
	  var iWeekDay = 0;
	  var iFirstDayOfWeek = Number.isInteger(confFirstDayOfWeek) ? confFirstDayOfWeek : oLocaleData.getFirstDayOfWeek(); // search Locale for containing "en-US", since sometimes
	  // when any user settings have been defined, subtag "sapufmt" is added to the locale name
	  // this is described inside sap.ui.core.Configuration file

	  if (oLocale && oLocale.getLanguage() === "en" && oLocale.getRegion() === "US") {
	    /*
	    	* in US the week starts with Sunday
	    	* The first week of the year starts with January 1st. But Dec. 31 is still in the last year
	    	* So the week beginning in December and ending in January has 2 week numbers
	    	*/
	    var oJanFirst = new UniversalDate(oDate.getTime());
	    oJanFirst.setUTCFullYear(iYear, 0, 1);
	    iWeekDay = oJanFirst.getUTCDay(); // get the date for the same weekday like jan 1.

	    var oCheckDate = new UniversalDate(oDate.getTime());
	    oCheckDate.setUTCDate(oCheckDate.getUTCDate() - oCheckDate.getUTCDay() + iWeekDay);
	    iWeekNum = Math.round((oCheckDate.getTime() - oJanFirst.getTime()) / 86400000 / 7) + 1;
	  } else {
	    // normally the first week of the year is the one where the first Thursday of the year is
	    // find Thursday of this week
	    // if the checked day is before the 1. day of the week use a day of the previous week to check
	    var oThursday = new UniversalDate(oDate.getTime());
	    oThursday.setUTCDate(oThursday.getUTCDate() - iFirstDayOfWeek);
	    iWeekDay = oThursday.getUTCDay();
	    oThursday.setUTCDate(oThursday.getUTCDate() - iWeekDay + 4);
	    var oFirstDayOfYear = new UniversalDate(oThursday.getTime());
	    oFirstDayOfYear.setUTCMonth(0, 1);
	    iWeekDay = oFirstDayOfYear.getUTCDay();
	    var iAddDays = 0;

	    if (iWeekDay > 4) {
	      iAddDays = 7; // first day of year is after Thursday, so first Thursday is in the next week
	    }

	    var oFirstThursday = new UniversalDate(oFirstDayOfYear.getTime());
	    oFirstThursday.setUTCDate(1 - iWeekDay + 4 + iAddDays);
	    iWeekNum = Math.round((oThursday.getTime() - oFirstThursday.getTime()) / 86400000 / 7) + 1;
	  }

	  return iWeekNum;
	};

	function _templateObject8() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"sapWCEmptyWeek\"></div>"]);

	  _templateObject8 = function _templateObject8() {
	    return data;
	  };

	  return data;
	}

	function _templateObject7() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div id=\"", "\" tabindex=\"", "\" data-sap-timestamp=\"", "\" data-sap-index=\"", "\" role=\"gridcell\" aria-selected=\"", "\" class=\"", "\"><span class=\"ui5-dp-daytext\" data-sap-timestamp=\"", "\" data-sap-index=\"", "\">", "</span></div>"]);

	  _templateObject7 = function _templateObject7() {
	    return data;
	  };

	  return data;
	}

	function _templateObject6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div style=\"display: flex;\" @mouseover=\"", "\" @keydown=\"", "\">", "</div>"]);

	  _templateObject6 = function _templateObject6() {
	    return data;
	  };

	  return data;
	}

	function _templateObject5() {
	  var data = __chunk_1._taggedTemplateLiteral(["", ""]);

	  _templateObject5 = function _templateObject5() {
	    return data;
	  };

	  return data;
	}

	function _templateObject4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div id=", " role=\"columnheader\" aria-label=\"", "\" class=\"", "\">", "</div>"]);

	  _templateObject4 = function _templateObject4() {
	    return data;
	  };

	  return data;
	}

	function _templateObject3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-dp-weekname-container\"><span class=\"ui5-dp-weekname\">", "</span></div>"]);

	  _templateObject3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-dp-weeknumber-container\">", "</div>"]);

	  _templateObject2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-dp-root\" style=\"", "\" @keydown=", " @mousedown=", " @mouseup=", ">", "<div id=\"", "-content\" class=\"ui5-dp-content\"><div role=\"row\" class=\"ui5-dp-days-names-container\">", "</div><div id=\"", "-days\" class=\"ui5-dp-items-container\" tabindex=\"-1\">", "</div></div></div>"]);

	  _templateObject$1 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$1 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$1(), __chunk_2.styleMap(context.styles.wrapper), context._onkeydown, context._onmousedown, context._onmouseup, !context._hideWeekNumbers ? block1(context) : undefined, __chunk_2.ifDefined(context._id), __chunk_2.repeat(context._dayNames, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block3(item, index, context);
	  }), __chunk_2.ifDefined(context._id), __chunk_2.repeat(context._weeks, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block4(item, index, context);
	  }));
	};

	var block1 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2(), __chunk_2.repeat(context._weekNumbers, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block2(item, index, context);
	  }));
	};

	var block2 = function block2(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject3(), __chunk_2.ifDefined(item));
	};

	var block3 = function block3(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject4(), __chunk_2.ifDefined(item.id), __chunk_2.ifDefined(item.name), __chunk_2.ifDefined(item.classes), __chunk_2.ifDefined(item.ultraShortName));
	};

	var block4 = function block4(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject5(), item.length ? block5(item, index, context) : block7(item, index, context));
	};

	var block5 = function block5(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject6(), context._onitemmouseover, context._onitemkeydown, __chunk_2.repeat(item, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block6(item, index, context);
	  }));
	};

	var block6 = function block6(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject7(), __chunk_2.ifDefined(item.id), __chunk_2.ifDefined(item._tabIndex), __chunk_2.ifDefined(item.timestamp), __chunk_2.ifDefined(item._index), __chunk_2.ifDefined(item.selected), __chunk_2.ifDefined(item.classes), __chunk_2.ifDefined(item.timestamp), __chunk_2.ifDefined(item._index), __chunk_2.ifDefined(item.iDay));
	};

	var block7 = function block7(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject8());
	};

	var main$1 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$1(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var dayPickerCSS = ":host(:not([hidden])){display:inline-block}:host{height:100%;width:100%}:host([_hide-week-numbers]) .ui5-dp-content{flex-basis:100%}.ui5-dp-dayname,.ui5-dp-item,.ui5-dp-weekname{width:var(--_ui5_day_picker_item_width);height:var(--_ui5_day_picker_item_height);margin-top:var(--_ui5_daypicker_item_margin);margin-right:var(--_ui5_daypicker_item_margin);font-family:var(--sapFontFamily);border-radius:var(--_ui5_daypicker_item_border_radius)}.ui5-dp-weekname{color:var(--_ui5_daypicker_weekname_color)}.ui5-dp-content{display:flex;flex-basis:87.5%;flex-direction:column;font-family:var(--sapFontFamily)}.ui5-dp-days-names-container{display:flex;height:var(--_ui5_daypicker_daynames_container_height)}.ui5-dp-weeknumber-container{padding-top:var(--_ui5_daypicker_weeknumbers_container_padding_top);flex-basis:12.5%}.ui5-dp-dayname,.ui5-dp-item,.ui5-dp-weekname,.ui5-dp-weekname-container{display:flex;flex-grow:1;justify-content:center;align-items:center;font-size:var(--sapFontSmallSize);outline:none;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ui5-dp-item{position:relative;color:var(--sapTextColor);background:var(--sapLegend_WorkingBackground);font-size:var(--sapFontSize);border:var(--_ui5_daypicker_item_border)}.ui5-dp-item:hover{background:var(--sapList_Hover_Background)}.ui5-dp-daytext{display:flex;width:100%;height:100%;justify-content:center;align-items:center;box-sizing:border-box}.ui5-dp-dayname{color:var(--_ui5_daypicker_dayname_color);height:100%}.ui5-dp-item.ui5-dp-item--weeekend{background:var(--sapLegend_NonWorkingBackground)}.ui5-dp-item.ui5-dp-item--disabled{pointer-events:none;opacity:.5}.ui5-dp-item.ui5-dp-item--weeekend:hover{background:var(--sapList_Hover_Background)}.ui5-dp-item.ui5-dp-item--othermonth{color:var(--_ui5_daypicker_item_othermonth_color);background:var(--_ui5_daypicker_item_othermonth_background_color);border-color:transparent}.ui5-dp-item.ui5-dp-item--othermonth:hover,.ui5-dp-item.ui5-dp-item--weeekend.ui5-dp-item--othermonth:hover{color:var(--_ui5_daypicker_item_othermonth_hover_color);background:var(--sapList_Hover_Background)}.ui5-dp-item:focus:after{content:\"\";width:calc(100% - .25rem);height:calc(100% - .25rem);border:var(--_ui5_daypicker_item_outline_width) dotted var(--sapContent_FocusColor);position:absolute;top:var(--_ui5_daypicker_item_outline_offset);left:var(--_ui5_daypicker_item_outline_offset)}.ui5-dp-item.ui5-dp-item--selected .ui5-dp-daytext{background:var(--sapContent_Selected_Background);color:var(--sapContent_Selected_TextColor)}.ui5-dp-item.ui5-dp-item--selected.ui5-dp-item--now .ui5-dp-daytext{border:1px solid var(--sapList_Background);border-radius:var(--_ui5_daypicker_item_now_inner_border_radius)}.ui5-dp-item.ui5-dp-item--selected.ui5-dp-item--now:focus:after{width:var(--_ui5_daypicker_item_now_selected_focus_after_width);height:var(--_ui5_daypicker_item_now_selected_focus_after_height);border-color:var(--sapContent_FocusColor);top:0;left:0}.ui5-dp-item.ui5-dp-item--selected:hover{background:var(--_ui5_daypicker_item_selected_hover_background_color);color:var(--sapContent_ContrastTextColor)}.ui5-dp-item.ui5-dp-item--selected:focus:after{border-color:var(--sapContent_ContrastFocusColor)}.ui5-dp-items-container{outline:none}.ui5-dp-item.ui5-dp-item--selected-between .ui5-dp-daytext,.ui5-dp-item[hovered] .ui5-dp-daytext{background-color:var(--sapList_SelectionBackgroundColor);color:var(--sapTextColor)}.ui5-dp-item.ui5-dp-item--selected-between,.ui5-dp-item[hovered]{border:1px solid var(--sapContent_Selected_Background);border-radius:5%}.ui5-dp-item.ui5-dp-item--now{border:.125rem solid var(--sapLegend_CurrentDateTime)}.ui5-dp-item.ui5-dp-item--selected.ui5-dp-item--selected-between:focus:after{border-color:var(--sapContent_FocusColor)}.ui5-dp-items-container>:first-child{justify-content:flex-end}.ui5-dp-emptyweek{height:var(--_ui5_day_picker_empty_height)}";

	var monthDiff = function monthDiff(startDate, endDate) {
	  var months;

	  var _startDate = CalendarDate.fromTimestamp(startDate).toLocalJSDate(),
	      _endDate = CalendarDate.fromTimestamp(endDate).toLocalJSDate();

	  months = (_endDate.getFullYear() - _startDate.getFullYear()) * 12;
	  months -= _startDate.getMonth();
	  months += _endDate.getMonth();
	  return months;
	};
	/**
	 * @public
	 */


	var metadata$1 = {
	  tag: "ui5-daypicker",
	  properties:
	  /** @lends  sap.ui.webcomponents.main.DayPicker.prototype */
	  {
	    /**
	     * A UNIX timestamp - seconds since 00:00:00 UTC on Jan 1, 1970.
	     * @type {number}
	     * @public
	     */
	    timestamp: {
	      type: __chunk_1.Integer
	    },

	    /**
	     * Sets a calendar type used for display.
	     * If not set, the calendar type of the global configuration is used.
	     * @type {CalendarType}
	     * @public
	     */
	    primaryCalendarType: {
	      type: CalendarType
	    },

	    /**
	     * Sets the selected dates as UTC timestamps.
	     * @type {Array}
	     * @public
	     */
	    selectedDates: {
	      type: __chunk_1.Integer,
	      multiple: true
	    },

	    /**
	     * Determines the minimum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    minDate: {
	      type: String
	    },

	    /**
	     * Determines the maximum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    maxDate: {
	      type: String
	    },

	    /**
	     * Determines the format, displayed in the input field.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    formatPattern: {
	      type: String
	    },

	    /**
	     * Defines the visibility of the week numbers column.
	     * <br><br>
	     *
	     * <b>Note:<b> For calendars other than Gregorian,
	     * the week numbers are not displayed regardless of what is set.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    hideWeekNumbers: {
	      type: Boolean
	    },

	    /**
	     * Defines the effective weeks numbers visibility,
	     * based on the <code>primaryCalendarType</code> and <code>hideWeekNumbers</code> property.
	     * @type {boolean}
	     * @private
	     */
	    _hideWeekNumbers: {
	      type: Boolean
	    },

	    /**
	     * @type {Object}
	     * @private
	     */
	    _weeks: {
	      type: Object,
	      multiple: true
	    },

	    /**
	     * @type {Object}
	     * @private
	     */
	    _weekNumbers: {
	      type: Object,
	      multiple: true
	    },

	    /**
	     * @type {boolean}
	     * @private
	     */
	    _hidden: {
	      type: Boolean,
	      noAttribute: true
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.DayPicker.prototype */
	  {
	    /**
	     * Fired when the user selects a new Date on the Web Component.
	     * @public
	     * @event
	     */
	    change: {},

	    /**
	     * Fired when month, year has changed due to item navigation.
	     * @public
	     * @event
	     */
	    navigate: {}
	  }
	};
	var DEFAULT_MAX_YEAR = 9999;
	var DEFAULT_MIN_YEAR = 1;
	/**
	 * @class
	 *
	 * Represents one month view inside a calendar.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.DayPicker
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-daypicker
	 * @public
	 */

	var DayPicker =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(DayPicker, _UI5Element);

	  __chunk_1._createClass(DayPicker, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata$1;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main$1;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return dayPickerCSS;
	    }
	  }]);

	  function DayPicker() {
	    var _this;

	    __chunk_1._classCallCheck(this, DayPicker);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(DayPicker).call(this));
	    _this._oLocale = __chunk_1.getLocale();
	    _this._oLocaleData = new LocaleData(_this._oLocale);
	    _this._itemNav = new __chunk_31.ItemNavigation(__chunk_1._assertThisInitialized(_this), {
	      rowSize: 7,
	      pageSize: 42,
	      behavior: __chunk_31.ItemNavigationBehavior.Paging
	    });

	    _this._itemNav.getItemsCallback = function getItemsCallback() {
	      return this.focusableDays;
	    }.bind(__chunk_1._assertThisInitialized(_this));

	    _this._itemNav.attachEvent(__chunk_31.ItemNavigation.BORDER_REACH, _this._handleItemNavigationBorderReach.bind(__chunk_1._assertThisInitialized(_this)));

	    _this._itemNav.attachEvent("PageBottom", _this._handleMonthBottomOverflow.bind(__chunk_1._assertThisInitialized(_this)));

	    _this._itemNav.attachEvent("PageTop", _this._handleMonthTopOverflow.bind(__chunk_1._assertThisInitialized(_this)));

	    return _this;
	  }

	  __chunk_1._createClass(DayPicker, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      var oCalDate,
	          day,
	          timestamp,
	          lastWeekNumber = -1,
	          isDaySelected = false,
	          todayIndex = 0;

	      var _aVisibleDays = this._getVisibleDays(this._calendarDate);

	      this._weeks = [];
	      var week = [];
	      this._weekNumbers = [];
	      var weekday;

	      if (this.minDate) {
	        this._minDateObject = new Date(this._minDate);
	      }

	      if (this.maxDate) {
	        this._maxDateObject = new Date(this._maxDate);
	      }
	      /* eslint-disable no-loop-func */


	      for (var i = 0; i < _aVisibleDays.length; i++) {
	        oCalDate = _aVisibleDays[i];
	        timestamp = oCalDate.valueOf() / 1000; // no need to round because CalendarDate does it
	        // day of the week

	        weekday = oCalDate.getDay() - this._getFirstDayOfWeek();

	        if (weekday < 0) {
	          weekday += 7;
	        }

	        day = {
	          timestamp: timestamp.toString(),
	          selected: this._selectedDates.some(function (d) {
	            return d === timestamp;
	          }),
	          selectedBetween: this._selectedDates.slice(1, this._selectedDates.length - 1).some(function (d) {
	            return d === timestamp;
	          }),
	          iDay: oCalDate.getDate(),
	          _index: i.toString(),
	          classes: "ui5-dp-item ui5-dp-wday".concat(weekday)
	        };
	        var weekNumber = calculateWeekNumber(getFirstDayOfWeek(), oCalDate.toUTCJSDate(), oCalDate.getYear(), this._oLocale, this._oLocaleData);

	        if (lastWeekNumber !== weekNumber) {
	          this._weekNumbers.push(weekNumber);

	          lastWeekNumber = weekNumber;
	        }

	        var isToday = oCalDate.isSame(CalendarDate.fromLocalJSDate(new Date(), this._primaryCalendarType));
	        week.push(day);

	        if (oCalDate.getDay() === this._getFirstDayOfWeek()) {
	          day.classes += " ui5-dp-firstday";
	        }

	        if (day.selected) {
	          day.classes += " ui5-dp-item--selected";
	          isDaySelected = true;
	        }

	        if (day.selectedBetween) {
	          day.classes += " ui5-dp-item--selected-between";
	        }

	        if (isToday) {
	          day.classes += " ui5-dp-item--now";
	          todayIndex = i;
	        }

	        if (oCalDate.getMonth() !== this._month) {
	          day.classes += " ui5-dp-item--othermonth";
	        }

	        day.id = "".concat(this._id, "-").concat(timestamp);

	        if (this._isWeekend(oCalDate)) {
	          day.classes += " ui5-dp-item--weeekend";
	        }

	        if ((this.minDate || this.maxDate) && this._isOutOfSelectableRange(oCalDate)) {
	          day.classes += " ui5-dp-item--disabled";
	          day.disabled = true;
	        }

	        if (day.classes.indexOf("ui5-dp-wday6") !== -1 || _aVisibleDays.length - 1 === i) {
	          this._weeks.push(week);

	          week = [];
	        }
	      }

	      while (this._weeks.length < 6) {
	        this._weeks.push([]);
	      }
	      /* eslint-enable no-loop-func */


	      if (!isDaySelected && todayIndex && this._itemNav.current === 0) {
	        this._itemNav.current = todayIndex;
	      }

	      var aDayNamesWide = this._oLocaleData.getDays("wide", this._primaryCalendarType);

	      var aDayNamesAbbreviated = this._oLocaleData.getDays("abbreviated", this._primaryCalendarType);

	      var aUltraShortNames = aDayNamesAbbreviated.map(function (n) {
	        return n;
	      });
	      var dayName;
	      this._dayNames = [];

	      for (var _i = 0; _i < 7; _i++) {
	        weekday = _i + this._getFirstDayOfWeek();

	        if (weekday > 6) {
	          weekday -= 7;
	        }

	        dayName = {
	          id: "".concat(this._id, "-WH").concat(_i.toString()),
	          name: aDayNamesWide[weekday],
	          ultraShortName: aUltraShortNames[weekday],
	          classes: "ui5-dp-dayname"
	        };

	        this._dayNames.push(dayName);
	      }

	      this._dayNames[0].classes += " ui5-dp-firstday";
	      this._hideWeekNumbers = this.shouldHideWeekNumbers;
	    }
	  }, {
	    key: "onAfterRendering",
	    value: function onAfterRendering() {
	      if (this.selectedDates.length === 1) {
	        this.fireEvent("daypickerrendered", {
	          focusedItemIndex: this._itemNav.currentIndex
	        });
	      }
	    }
	  }, {
	    key: "_onmousedown",
	    value: function _onmousedown(event) {
	      var _this2 = this;

	      var target = event.target;

	      var dayPressed = this._isDayPressed(target);

	      if (dayPressed) {
	        var targetDate = parseInt(target.getAttribute("data-sap-timestamp")); // findIndex, give it to item navigation

	        for (var i = 0; i < this._weeks.length; i++) {
	          for (var j = 0; j < this._weeks[i].length; j++) {
	            if (parseInt(this._weeks[i][j].timestamp) === targetDate) {
	              var _ret = function () {
	                var index = parseInt(target.getAttribute("data-sap-index"));

	                if (_this2.minDate || _this2.maxDate) {
	                  var focusableItem = _this2.focusableDays.find(function (item) {
	                    return parseInt(item._index) === index;
	                  });

	                  index = focusableItem ? _this2.focusableDays.indexOf(focusableItem) : index;
	                }

	                _this2._itemNav.current = index;

	                _this2._itemNav.update();

	                return "break";
	              }();

	              if (_ret === "break") break;
	            }
	          }
	        }

	        this.targetDate = targetDate;
	      }
	    }
	  }, {
	    key: "_onmouseup",
	    value: function _onmouseup(event) {
	      var dayPressed = this._isDayPressed(event.target);

	      if (this.targetDate) {
	        this._modifySelectionAndNotifySubscribers(this.targetDate, event.ctrlKey);

	        this.targetDate = null;
	      }

	      if (!dayPressed) {
	        this._itemNav.focusCurrent();
	      }
	    }
	  }, {
	    key: "_onitemmouseover",
	    value: function _onitemmouseover(event) {
	      if (this.selectedDates.length === 1) {
	        this.fireEvent("item-mouseover", event);
	      }
	    }
	  }, {
	    key: "_onitemkeydown",
	    value: function _onitemkeydown(event) {
	      if (this.selectedDates.length === 1) {
	        this.fireEvent("item-keydown", event);
	      }
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isEnter(event)) {
	        return this._handleEnter(event);
	      }

	      if (__chunk_8.isSpace(event)) {
	        return this._handleSpace(event);
	      }
	    }
	  }, {
	    key: "_handleEnter",
	    value: function _handleEnter(event) {
	      event.preventDefault();

	      if (event.target.className.indexOf("ui5-dp-item") > -1) {
	        var targetDate = parseInt(event.target.getAttribute("data-sap-timestamp"));

	        this._modifySelectionAndNotifySubscribers(targetDate, event.ctrlKey);
	      }
	    }
	  }, {
	    key: "_handleSpace",
	    value: function _handleSpace(event) {
	      event.preventDefault();

	      if (event.target.className.indexOf("ui5-dp-item") > -1) {
	        var targetDate = parseInt(event.target.getAttribute("data-sap-timestamp"));

	        this._modifySelectionAndNotifySubscribers(targetDate, event.ctrlKey);
	      }
	    }
	  }, {
	    key: "_modifySelectionAndNotifySubscribers",
	    value: function _modifySelectionAndNotifySubscribers(sNewDate, bAdd) {
	      if (bAdd) {
	        this.selectedDates = [].concat(__chunk_1._toConsumableArray(this._selectedDates), [sNewDate]);
	      } else {
	        this.selectedDates = [sNewDate];
	      }

	      this.fireEvent("change", {
	        dates: __chunk_1._toConsumableArray(this._selectedDates)
	      });
	    }
	  }, {
	    key: "_handleMonthBottomOverflow",
	    value: function _handleMonthBottomOverflow(event) {
	      this._itemNav.hasNextPage = this._hasNextMonth();
	    }
	  }, {
	    key: "_handleMonthTopOverflow",
	    value: function _handleMonthTopOverflow(event) {
	      this._itemNav.hasPrevPage = this._hasPrevMonth();
	    }
	  }, {
	    key: "_hasNextMonth",
	    value: function _hasNextMonth() {
	      var newMonth = this._month + 1;
	      var newYear = this._year;

	      if (newMonth > 11) {
	        newMonth = 0;
	        newYear++;
	      }

	      if (newYear > DEFAULT_MAX_YEAR && newMonth === 0) {
	        return false;
	      }

	      if (!this.maxDate) {
	        return true;
	      }

	      var oNewDate = this._calendarDate;
	      oNewDate.setDate(oNewDate.getDate());
	      oNewDate.setYear(newYear);
	      oNewDate.setMonth(newMonth);
	      var monthsBetween = monthDiff(oNewDate.valueOf(), this._maxDate);

	      if (monthsBetween < 0) {
	        return false;
	      }

	      var lastFocusableDay = this.focusableDays[this.focusableDays.length - 1].iDay;

	      if (monthsBetween === 0 && CalendarDate.fromTimestamp(this._maxDate).toLocalJSDate().getDate() === lastFocusableDay) {
	        return false;
	      }

	      return true;
	    }
	  }, {
	    key: "_hasPrevMonth",
	    value: function _hasPrevMonth() {
	      var newMonth = this._month - 1;
	      var newYear = this._year;

	      if (newMonth < 0) {
	        newMonth = 11;
	        newYear--;
	      }

	      if (newYear < DEFAULT_MIN_YEAR && newMonth === 11) {
	        return false;
	      }

	      if (!this.minDate) {
	        return true;
	      }

	      var oNewDate = this._calendarDate;
	      oNewDate.setDate(oNewDate.getDate());
	      oNewDate.setYear(newYear);
	      oNewDate.setMonth(newMonth);
	      var monthsBetween = monthDiff(this._minDate, oNewDate.valueOf());

	      if (this.minDate && monthsBetween < 0) {
	        return false;
	      }

	      return true;
	    }
	  }, {
	    key: "_handleItemNavigationBorderReach",
	    value: function _handleItemNavigationBorderReach(event) {
	      var currentMonth = this._month,
	          currentYear = this._year;
	      var newMonth, newYear, newDate, currentDate;

	      if (event.end) {
	        currentDate = new Date(this._weeks[this._weeks.length - 1][event.offset].timestamp * 1000);
	        newMonth = currentMonth < 11 ? currentMonth + 1 : 0;
	        newYear = currentMonth < 11 ? currentYear : currentYear + 1;
	        newDate = currentDate.getMonth() === newMonth ? currentDate.getDate() : currentDate.getDate() + 7;
	      } else if (event.start) {
	        currentDate = new Date(this._weeks[0][event.offset].timestamp * 1000);
	        newMonth = currentMonth > 0 ? currentMonth - 1 : 11;
	        newYear = currentMonth > 0 ? currentYear : currentYear - 1;
	        newDate = currentDate.getMonth() === newMonth ? currentDate.getDate() : currentDate.getDate() - 7;
	      }

	      var oNewDate = this._calendarDate;
	      oNewDate.setDate(newDate);
	      oNewDate.setYear(newYear);
	      oNewDate.setMonth(newMonth);

	      if (oNewDate.getYear() < DEFAULT_MIN_YEAR || oNewDate.getYear() > DEFAULT_MAX_YEAR) {
	        return;
	      }

	      if (this._isOutOfSelectableRange(oNewDate._oUDate.oDate)) {
	        return;
	      }

	      this.fireEvent("navigate", {
	        timestamp: oNewDate.valueOf() / 1000
	      });
	    }
	  }, {
	    key: "_isWeekend",
	    value: function _isWeekend(oDate) {
	      var iWeekDay = oDate.getDay(),
	          iWeekendStart = this._oLocaleData.getWeekendStart(),
	          iWeekendEnd = this._oLocaleData.getWeekendEnd();

	      return iWeekDay >= iWeekendStart && iWeekDay <= iWeekendEnd || iWeekendEnd < iWeekendStart && (iWeekDay >= iWeekendStart || iWeekDay <= iWeekendEnd);
	    }
	  }, {
	    key: "_isDayPressed",
	    value: function _isDayPressed(target) {
	      var targetParent = target.parentNode;
	      return target.className.indexOf("ui5-dp-item") > -1 || targetParent && target.parentNode.classList.contains("ui5-dp-item");
	    }
	  }, {
	    key: "_isOutOfSelectableRange",
	    value: function _isOutOfSelectableRange(date) {
	      var currentDate = date._oUDate ? date.toLocalJSDate() : CalendarDate.fromTimestamp(date).toLocalJSDate();
	      return currentDate > this._maxDateObject || currentDate < this._minDateObject;
	    }
	  }, {
	    key: "getFormat",
	    value: function getFormat() {
	      if (this._isPattern) {
	        this._oDateFormat = DateFormat.getInstance({
	          pattern: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      } else {
	        this._oDateFormat = DateFormat.getInstance({
	          style: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      }

	      return this._oDateFormat;
	    }
	  }, {
	    key: "_getVisibleDays",
	    value: function _getVisibleDays(oStartDate, bIncludeBCDates) {
	      var oCalDate, iDaysOldMonth, iYear;
	      var _aVisibleDays = []; // If date passed generate days for new start date else return the current one

	      if (!oStartDate) {
	        return _aVisibleDays;
	      }

	      var iFirstDayOfWeek = this._getFirstDayOfWeek(); // determine weekday of first day in month


	      var oFirstDay = new CalendarDate(oStartDate, this._primaryCalendarType);
	      oFirstDay.setDate(1);
	      iDaysOldMonth = oFirstDay.getDay() - iFirstDayOfWeek;

	      if (iDaysOldMonth < 0) {
	        iDaysOldMonth = 7 + iDaysOldMonth;
	      }

	      if (iDaysOldMonth > 0) {
	        // determine first day for display
	        oFirstDay.setDate(1 - iDaysOldMonth);
	      }

	      var oDay = new CalendarDate(oFirstDay);

	      for (var i = 0; i < 42; i++) {
	        iYear = oDay.getYear();
	        oCalDate = new CalendarDate(oDay, this._primaryCalendarType);

	        if (bIncludeBCDates && iYear < DEFAULT_MIN_YEAR) {
	          // For dates before 0001-01-01 we should render only empty squares to keep
	          // the month square matrix correct.
	          oCalDate._bBeforeFirstYear = true;

	          _aVisibleDays.push(oCalDate);
	        } else if (iYear >= DEFAULT_MIN_YEAR && iYear <= DEFAULT_MAX_YEAR) {
	          // Days before 0001-01-01 or after 9999-12-31 should not be rendered.
	          _aVisibleDays.push(oCalDate);
	        }

	        oDay.setDate(oDay.getDate() + 1);
	      }

	      return _aVisibleDays;
	    }
	  }, {
	    key: "_getFirstDayOfWeek",
	    value: function _getFirstDayOfWeek() {
	      var confFirstDayOfWeek = getFirstDayOfWeek();
	      return Number.isInteger(confFirstDayOfWeek) ? confFirstDayOfWeek : this._oLocaleData.getFirstDayOfWeek();
	    }
	  }, {
	    key: "shouldHideWeekNumbers",
	    get: function get() {
	      if (this._primaryCalendarType !== CalendarType.Gregorian) {
	        return true;
	      }

	      return this.hideWeekNumbers;
	    }
	  }, {
	    key: "_timestamp",
	    get: function get() {
	      return this.timestamp !== undefined ? this.timestamp : Math.floor(new Date().getTime() / 1000);
	    }
	  }, {
	    key: "_localDate",
	    get: function get() {
	      return new Date(this._timestamp * 1000);
	    }
	  }, {
	    key: "_calendarDate",
	    get: function get() {
	      return CalendarDate.fromTimestamp(this._localDate.getTime(), this._primaryCalendarType);
	    }
	  }, {
	    key: "_formatPattern",
	    get: function get() {
	      return this.formatPattern || "medium"; // get from config
	    }
	  }, {
	    key: "_month",
	    get: function get() {
	      return this._calendarDate.getMonth();
	    }
	  }, {
	    key: "_year",
	    get: function get() {
	      return this._calendarDate.getYear();
	    }
	  }, {
	    key: "_currentCalendarDate",
	    get: function get() {
	      return CalendarDate.fromTimestamp(new Date().getTime(), this._primaryCalendarType);
	    }
	  }, {
	    key: "_selectedDates",
	    get: function get() {
	      return this.selectedDates || [];
	    }
	  }, {
	    key: "_primaryCalendarType",
	    get: function get() {
	      return this.primaryCalendarType || getCalendarType() || LocaleData.getInstance(__chunk_1.getLocale()).getPreferredCalendarType();
	    }
	  }, {
	    key: "focusableDays",
	    get: function get() {
	      var _ref;

	      var focusableDays = [];

	      for (var i = 0; i < this._weeks.length; i++) {
	        var week = this._weeks[i].filter(function (x) {
	          return !x.disabled;
	        });

	        focusableDays.push(week);
	      }

	      return (_ref = []).concat.apply(_ref, focusableDays);
	    }
	  }, {
	    key: "_maxDate",
	    get: function get() {
	      if (this.maxDate) {
	        var jsDate = new Date(this.getFormat().parse(this.maxDate).getFullYear(), this.getFormat().parse(this.maxDate).getMonth(), this.getFormat().parse(this.maxDate).getDate());
	        var oCalDate = CalendarDate.fromTimestamp(jsDate.getTime(), this._primaryCalendarType);
	        return oCalDate.valueOf();
	      }

	      return this.maxDate;
	    }
	  }, {
	    key: "_minDate",
	    get: function get() {
	      if (this.minDate) {
	        var jsDate = new Date(this.getFormat().parse(this.minDate).getFullYear(), this.getFormat().parse(this.minDate).getMonth(), this.getFormat().parse(this.minDate).getDate());
	        var oCalDate = CalendarDate.fromTimestamp(jsDate.getTime(), this._primaryCalendarType);
	        return oCalDate.valueOf();
	      }

	      return this.minDate;
	    }
	  }, {
	    key: "_isPattern",
	    get: function get() {
	      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        wrapper: {
	          display: this._hidden ? "none" : "flex"
	        },
	        main: {
	          width: "100%"
	        }
	      };
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return Promise.all([__chunk_1.fetchCldr(__chunk_1.getLocale().getLanguage(), __chunk_1.getLocale().getRegion(), __chunk_1.getLocale().getScript())]);

	              case 2:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }]);

	  return DayPicker;
	}(__chunk_1.UI5Element);

	DayPicker.define();

	function _templateObject3$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div id=\"", "\" data-sap-timestamp=", " tabindex=", " class=\"", "\" role=\"gridcell\" aria-selected=\"false\">", "</div>"]);

	  _templateObject3$1 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2$1() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-mp-quarter\">", "</div>"]);

	  _templateObject2$1 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-mp-root\" role=\"grid\" aria-readonly=\"false\" aria-multiselectable=\"false\" style=\"", "\" @keydown=", " @click=", ">", "</div>"]);

	  _templateObject$2 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$2 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$2(), __chunk_2.styleMap(context.styles.main), context._onkeydown, context._onclick, __chunk_2.repeat(context._quarters, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block1$1(item, index, context);
	  }));
	};

	var block1$1 = function block1(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject2$1(), __chunk_2.repeat(item, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block2$1(item, index, context);
	  }));
	};

	var block2$1 = function block2(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject3$1(), __chunk_2.ifDefined(item.id), __chunk_2.ifDefined(item.timestamp), __chunk_2.ifDefined(item._tabIndex), __chunk_2.ifDefined(item.classes), __chunk_2.ifDefined(item.name));
	};

	var main$2 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$2(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles$1 = ":host(:not([hidden])){display:inline-block}:host{width:100%;height:100%}.ui5-mp-root{padding:2rem 0 1rem 0;display:flex;flex-direction:column;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);justify-content:center;align-items:center}.ui5-mp-item{display:flex;width:calc(33.333% - .125rem);height:var(--_ui5_month_picker_item_height);color:var(--sapTextColor);background-color:var(--sapLegend_WorkingBackground);align-items:center;justify-content:center;margin:var(--_ui5_monthpicker_item_margin);box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;outline:none;position:relative;border:var(--_ui5_monthpicker_item_border);border-radius:var(--_ui5_monthpicker_item_border_radius)}.ui5-mp-item:hover{background-color:var(--sapList_Hover_Background)}.ui5-mp-item.ui5-mp-item--selected{background-color:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}.ui5-mp-item.ui5-mp-item--disabled{pointer-events:none;opacity:.5}.ui5-mp-item.ui5-mp-item--selected:focus{background-color:var(--sapContent_Selected_Background)}.ui5-mp-item.ui5-mp-item--selected:focus:after{border-color:var(--sapContent_ContrastFocusColor)}.ui5-mp-item.ui5-mp-item--selected:hover{background-color:var(--sapContent_Selected_Background)}.ui5-mp-item:focus:after{content:\"\";position:absolute;width:var(--_ui5_monthpicker_item_focus_after_width);height:var(--_ui5_monthpicker_item_focus_after_height);border:var(--_ui5_monthpicker_item_focus_after_border);top:var(--_ui5_monthpicker_item_focus_after_offset);left:var(--_ui5_monthpicker_item_focus_after_offset)}.ui5-mp-quarter{display:flex;justify-content:center;align-items:center;width:100%}";

	/**
	 * @public
	 */

	var metadata$2 = {
	  tag: "ui5-monthpicker",
	  properties:
	  /** @lends  sap.ui.webcomponents.main.MonthPicker.prototype */
	  {
	    /**
	     * A UNIX timestamp - seconds since 00:00:00 UTC on Jan 1, 1970.
	     * @type {Integer}
	     * @public
	     */
	    timestamp: {
	      type: __chunk_1.Integer
	    },

	    /**
	     * Sets a calendar type used for display.
	     * If not set, the calendar type of the global configuration is used.
	     * @type {CalendarType}
	     * @public
	     */
	    primaryCalendarType: {
	      type: CalendarType
	    },

	    /**
	     * Determines the мinimum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    minDate: {
	      type: String
	    },

	    /**
	     * Determines the maximum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    maxDate: {
	      type: String
	    },
	    _quarters: {
	      type: Object,
	      multiple: true
	    },
	    _hidden: {
	      type: Boolean,
	      noAttribute: true
	    },

	    /**
	     * Determines the format, displayed in the input field.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    formatPattern: {
	      type: String
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.MonthPicker.prototype */
	  {
	    /**
	     * Fired when the user selects a new Date on the Web Component.
	     * @public
	     * @event
	     */
	    change: {}
	  }
	};
	/**
	 * Month picker component.
	 *
	 * @class
	 *
	 * Displays months which can be selected.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.MonthPicker
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-monthpicker
	 * @public
	 */

	var MonthPicker =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(MonthPicker, _UI5Element);

	  __chunk_1._createClass(MonthPicker, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata$2;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main$2;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return styles$1;
	    }
	  }]);

	  function MonthPicker() {
	    var _this;

	    __chunk_1._classCallCheck(this, MonthPicker);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(MonthPicker).call(this));
	    _this._oLocale = __chunk_1.getLocale();
	    _this._oLocaleData = new LocaleData(_this._oLocale);
	    _this._itemNav = new __chunk_31.ItemNavigation(__chunk_1._assertThisInitialized(_this), {
	      pageSize: 12,
	      rowSize: 3,
	      behavior: __chunk_31.ItemNavigationBehavior.Paging
	    });

	    _this._itemNav.getItemsCallback = function getItemsCallback() {
	      var _ref;

	      var focusableMonths = [];

	      for (var i = 0; i < this._quarters.length; i++) {
	        var quarter = this._quarters[i].filter(function (x) {
	          return !x.disabled;
	        });

	        focusableMonths.push(quarter);
	      }

	      return (_ref = []).concat.apply(_ref, focusableMonths);
	    }.bind(__chunk_1._assertThisInitialized(_this));

	    _this._itemNav.setItemsCallback = function setItemsCallback(items) {
	      this._quarters = items;
	    }.bind(__chunk_1._assertThisInitialized(_this));

	    return _this;
	  }

	  __chunk_1._createClass(MonthPicker, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      var quarters = [];
	      var oCalDate = CalendarDate.fromTimestamp(new Date().getTime(), this._primaryCalendarType);
	      var timestamp;

	      for (var i = 0; i < 12; i++) {
	        oCalDate.setMonth(i);
	        timestamp = oCalDate.valueOf() / 1000;
	        var month = {
	          timestamp: timestamp.toString(),
	          id: "".concat(this._id, "-m").concat(i),
	          name: this._oLocaleData.getMonths("wide", this._primaryCalendarType)[i],
	          classes: "ui5-mp-item"
	        };

	        if (this._month === i) {
	          month.classes += " ui5-mp-item--selected";
	        }

	        if ((this.minDate || this.maxDate) && this._isOutOfSelectableRange(i)) {
	          month.classes += " ui5-mp-item--disabled";
	          month.disabled = true;
	        }

	        var quarterIndex = parseInt(i / 3);

	        if (quarters[quarterIndex]) {
	          quarters[quarterIndex].push(month);
	        } else {
	          quarters[quarterIndex] = [month];
	        }
	      }

	      this._quarters = quarters;
	    }
	  }, {
	    key: "onAfterRendering",
	    value: function onAfterRendering() {
	      this._itemNav.focusCurrent();
	    }
	  }, {
	    key: "_onclick",
	    value: function _onclick(event) {
	      if (event.target.className.indexOf("ui5-mp-item") > -1) {
	        var timestamp = this.getTimestampFromDOM(event.target);
	        this.timestamp = timestamp;
	        this._itemNav.current = this._month;
	        this.fireEvent("change", {
	          timestamp: timestamp
	        });
	      }
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isSpace(event) || __chunk_8.isEnter(event)) {
	        this._activateMonth(event);
	      }
	    }
	  }, {
	    key: "_activateMonth",
	    value: function _activateMonth(event) {
	      event.preventDefault();

	      if (event.target.className.indexOf("ui5-mp-item") > -1) {
	        var timestamp = this.getTimestampFromDOM(event.target);
	        this.timestamp = timestamp;
	        this.fireEvent("change", {
	          timestamp: timestamp
	        });
	      }
	    }
	  }, {
	    key: "_isOutOfSelectableRange",
	    value: function _isOutOfSelectableRange(monthIndex) {
	      var currentDateYear = this._localDate.getFullYear(),
	          minDate = new Date(this._minDate),
	          maxDate = new Date(this._maxDate),
	          minDateCheck = minDate && (currentDateYear === minDate.getFullYear() && monthIndex < minDate.getMonth() || currentDateYear < minDate.getFullYear()),
	          maxDateCheck = maxDate && (currentDateYear === maxDate.getFullYear() && monthIndex > maxDate.getMonth() || currentDateYear > maxDate.getFullYear());

	      return maxDateCheck || minDateCheck;
	    }
	  }, {
	    key: "getFormat",
	    value: function getFormat() {
	      if (this._isPattern) {
	        this._oDateFormat = DateFormat.getInstance({
	          pattern: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      } else {
	        this._oDateFormat = DateFormat.getInstance({
	          style: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      }

	      return this._oDateFormat;
	    }
	  }, {
	    key: "getTimestampFromDOM",
	    value: function getTimestampFromDOM(domNode) {
	      var oMonthDomRef = domNode.getAttribute("data-sap-timestamp");
	      return parseInt(oMonthDomRef);
	    }
	  }, {
	    key: "_timestamp",
	    get: function get() {
	      return this.timestamp !== undefined ? this.timestamp : Math.floor(new Date().getTime() / 1000);
	    }
	  }, {
	    key: "_localDate",
	    get: function get() {
	      return new Date(this._timestamp * 1000);
	    }
	  }, {
	    key: "_calendarDate",
	    get: function get() {
	      return CalendarDate.fromTimestamp(this._localDate.getTime(), this._primaryCalendarType);
	    }
	  }, {
	    key: "_month",
	    get: function get() {
	      return this._calendarDate.getMonth();
	    }
	  }, {
	    key: "_primaryCalendarType",
	    get: function get() {
	      return this.primaryCalendarType || getCalendarType() || LocaleData.getInstance(__chunk_1.getLocale()).getPreferredCalendarType();
	    }
	  }, {
	    key: "_isPattern",
	    get: function get() {
	      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
	    }
	  }, {
	    key: "_maxDate",
	    get: function get() {
	      if (this.maxDate) {
	        var jsDate = new Date(this.getFormat().parse(this.maxDate).getFullYear(), this.getFormat().parse(this.maxDate).getMonth(), this.getFormat().parse(this.maxDate).getDate());
	        var oCalDate = CalendarDate.fromTimestamp(jsDate.getTime(), this._primaryCalendarType);
	        return oCalDate.valueOf();
	      }

	      return this.maxDate;
	    }
	  }, {
	    key: "_minDate",
	    get: function get() {
	      if (this.minDate) {
	        var jsDate = new Date(this.getFormat().parse(this.minDate).getFullYear(), this.getFormat().parse(this.minDate).getMonth(), this.getFormat().parse(this.minDate).getDate());
	        var oCalDate = CalendarDate.fromTimestamp(jsDate.getTime(), this._primaryCalendarType);
	        return oCalDate.valueOf();
	      }

	      return this.minDate;
	    }
	  }, {
	    key: "_formatPattern",
	    get: function get() {
	      return this.formatPattern || "medium"; // get from config
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        main: {
	          display: this._hidden ? "none" : ""
	        }
	      };
	    }
	  }]);

	  return MonthPicker;
	}(__chunk_1.UI5Element);

	MonthPicker.define();

	function _templateObject3$2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div id=\"", "\" tabindex=\"", "\" data-sap-timestamp=\"", "\" class=\"", "\" role=\"gridcell\" aria-selected=\"false\">", "</div>"]);

	  _templateObject3$2 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2$2() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-yp-interval-container\">", "</div>"]);

	  _templateObject2$2 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-yp-root\" role=\"grid\" aria-readonly=\"false\" aria-multiselectable=\"false\" style=\"", "\" @keydown=", " @click=", ">", "</div>"]);

	  _templateObject$3 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$3 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$3(), __chunk_2.styleMap(context.styles.main), context._onkeydown, context._onclick, __chunk_2.repeat(context._yearIntervals, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block1$2(item, index, context);
	  }));
	};

	var block1$2 = function block1(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject2$2(), __chunk_2.repeat(item, function (item, index) {
	    return item._id || index;
	  }, function (item, index) {
	    return block2$2(item, index, context);
	  }));
	};

	var block2$2 = function block2(item, index, context) {
	  return __chunk_2.scopedHtml(_templateObject3$2(), __chunk_2.ifDefined(item.id), __chunk_2.ifDefined(item._tabIndex), __chunk_2.ifDefined(item.timestamp), __chunk_2.ifDefined(item.classes), __chunk_2.ifDefined(item.year));
	};

	var main$3 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$3(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var styles$2 = ":host(:not([hidden])){display:inline-block}:host{width:100%;height:100%}.ui5-yp-root{padding:2rem 0 1rem 0;display:flex;flex-direction:column;font-family:var(--sapFontFamily);font-size:var(--sapFontSize);justify-content:center;align-items:center}.ui5-yp-interval-container{display:flex;justify-content:center;align-items:center;width:100%}.ui5-yp-item{display:flex;margin:var(--_ui5_yearpicker_item_margin);width:calc(25% - .125rem);height:var(--_ui5_year_picker_item_height);color:var(--sapTextColor);background-color:var(--sapLegend_WorkingBackground);align-items:center;justify-content:center;box-sizing:border-box;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;outline:none;position:relative;border:var(--_ui5_yearpicker_item_border);border-radius:var(--_ui5_yearpicker_item_border_radius)}.ui5-yp-item:hover{background-color:var(--sapList_Hover_Background)}.ui5-yp-item.ui5-yp-item--selected{background-color:var(--sapSelectedColor);color:var(--sapContent_ContrastTextColor)}.ui5-yp-item.ui5-yp-item--disabled{pointer-events:none;opacity:.5}.ui5-yp-item.ui5-yp-item--selected:focus{background-color:var(--_ui5_yearpicker_item_selected_focus)}.ui5-yp-item.ui5-yp-item--selected:focus:after{border-color:var(--sapContent_ContrastFocusColor)}.ui5-yp-item.ui5-yp-item--selected:hover{background-color:var(--_ui5_yearpicker_item_selected_focus)}.ui5-yp-item:focus:after{content:\"\";position:absolute;width:var(--_ui5_yearpicker_item_focus_after_width);height:var(--_ui5_yearpicker_item_focus_after_height);border:var(--_ui5_yearpicker_item_focus_after_border);top:var(--_ui5_yearpicker_item_focus_after_offset);left:var(--_ui5_yearpicker_item_focus_after_offset)}";

	/**
	 * @public
	 */

	var metadata$3 = {
	  tag: "ui5-yearpicker",
	  properties:
	  /** @lends  sap.ui.webcomponents.main.YearPicker.prototype */
	  {
	    /**
	     * A UNIX timestamp - seconds since 00:00:00 UTC on Jan 1, 1970.
	     * @type {Integer}
	     * @public
	     */
	    timestamp: {
	      type: __chunk_1.Integer
	    },

	    /**
	     * Sets a calendar type used for display.
	     * If not set, the calendar type of the global configuration is used.
	     * @type {CalendarType}
	     * @public
	     */
	    primaryCalendarType: {
	      type: CalendarType
	    },

	    /**
	     * Determines the мinimum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    minDate: {
	      type: String
	    },

	    /**
	     * Determines the maximum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue undefined
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    maxDate: {
	      type: String,
	      defaultValue: undefined
	    },
	    _selectedYear: {
	      type: __chunk_1.Integer,
	      noAttribute: true
	    },
	    _yearIntervals: {
	      type: Object,
	      multiple: true
	    },
	    _hidden: {
	      type: Boolean,
	      noAttribute: true
	    },

	    /**
	    * Determines the format, displayed in the input field.
	    *
	    * @type {string}
	    * @defaultvalue ""
	    * @public
	    */
	    formatPattern: {
	      type: String
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.YearPicker.prototype */
	  {
	    /**
	     * Fired when the user selects a new Date on the Web Component.
	     * @public
	     * @event
	     */
	    change: {}
	  }
	};
	/**
	 * @class
	 *
	 * Displays years which can be selected.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.YearPicker
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-yearpicker
	 * @public
	 */

	var YearPicker =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(YearPicker, _UI5Element);

	  __chunk_1._createClass(YearPicker, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata$3;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return styles$2;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main$3;
	    }
	  }]);

	  function YearPicker() {
	    var _this;

	    __chunk_1._classCallCheck(this, YearPicker);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(YearPicker).call(this));
	    _this._oLocale = __chunk_1.getLocale();
	    _this._itemNav = new __chunk_31.ItemNavigation(__chunk_1._assertThisInitialized(_this), {
	      pageSize: 20,
	      rowSize: 4,
	      behavior: __chunk_31.ItemNavigationBehavior.Paging
	    });

	    _this._itemNav.getItemsCallback = function getItemsCallback() {
	      var _ref;

	      var focusableYears = [];

	      for (var i = 0; i < this._yearIntervals.length; i++) {
	        var yearInterval = this._yearIntervals[i].filter(function (x) {
	          return !x.disabled;
	        });

	        focusableYears.push(yearInterval);
	      }

	      return (_ref = []).concat.apply(_ref, focusableYears);
	    }.bind(__chunk_1._assertThisInitialized(_this));

	    _this._itemNav.attachEvent(__chunk_31.ItemNavigation.BORDER_REACH, _this._handleItemNavigationBorderReach.bind(__chunk_1._assertThisInitialized(_this)));

	    _this._yearIntervals = [];
	    return _this;
	  }

	  __chunk_1._createClass(YearPicker, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      var oYearFormat = DateFormat.getDateInstance({
	        format: "y",
	        calendarType: this._primaryCalendarType
	      }, this._oLocale);
	      var oCalDate = this._calendarDate;
	      oCalDate.setMonth(0);
	      oCalDate.setDate(1);

	      if (oCalDate.getYear() - YearPicker._MIDDLE_ITEM_INDEX - 1 > YearPicker._MAX_YEAR - YearPicker._ITEMS_COUNT) {
	        oCalDate.setYear(YearPicker._MAX_YEAR - YearPicker._ITEMS_COUNT);
	      } else if (oCalDate.getYear() - YearPicker._MIDDLE_ITEM_INDEX - 1 < YearPicker._MIN_YEAR) {
	        oCalDate.setYear(YearPicker._MIN_YEAR - 1);
	      } else {
	        oCalDate.setYear(oCalDate.getYear() - YearPicker._MIDDLE_ITEM_INDEX - 1);
	      }

	      var intervals = [];
	      var timestamp;

	      if (this._selectedYear === undefined) {
	        this._selectedYear = this._year;
	      }

	      for (var i = 0; i < YearPicker._ITEMS_COUNT; i++) {
	        var intervalIndex = parseInt(i / 4);

	        if (!intervals[intervalIndex]) {
	          intervals[intervalIndex] = [];
	        }

	        oCalDate.setYear(oCalDate.getYear() + 1);
	        timestamp = oCalDate.valueOf() / 1000;
	        var year = {
	          timestamp: timestamp.toString(),
	          id: "".concat(this._id, "-y").concat(timestamp),
	          year: oYearFormat.format(oCalDate.toLocalJSDate()),
	          classes: "ui5-yp-item"
	        };

	        if (oCalDate.getYear() === this._selectedYear) {
	          year.classes += " ui5-yp-item--selected";
	        }

	        if ((this.minDate || this.maxDate) && this._isOutOfSelectableRange(oCalDate.getYear())) {
	          year.classes += " ui5-yp-item--disabled";
	          year.disabled = true;
	        }

	        if (intervals[intervalIndex]) {
	          intervals[intervalIndex].push(year);
	        }
	      }

	      this._yearIntervals = intervals;
	    }
	  }, {
	    key: "onAfterRendering",
	    value: function onAfterRendering() {
	      this._itemNav.focusCurrent();
	    }
	  }, {
	    key: "_onclick",
	    value: function _onclick(event) {
	      if (event.target.className.indexOf("ui5-yp-item") > -1) {
	        var timestamp = this.getTimestampFromDom(event.target);
	        this.timestamp = timestamp;
	        this._selectedYear = this._year;
	        this._itemNav.current = YearPicker._MIDDLE_ITEM_INDEX;
	        this.fireEvent("change", {
	          timestamp: timestamp
	        });
	      }
	    }
	  }, {
	    key: "getTimestampFromDom",
	    value: function getTimestampFromDom(domNode) {
	      var sTimestamp = domNode.getAttribute("data-sap-timestamp");
	      return parseInt(sTimestamp);
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isEnter(event)) {
	        return this._handleEnter(event);
	      }

	      if (__chunk_8.isSpace(event)) {
	        return this._handleSpace(event);
	      }
	    }
	  }, {
	    key: "_handleEnter",
	    value: function _handleEnter(event) {
	      event.preventDefault();

	      if (event.target.className.indexOf("ui5-yp-item") > -1) {
	        var timestamp = this.getTimestampFromDom(event.target);
	        this.timestamp = timestamp;
	        this._selectedYear = this._year;
	        this._itemNav.current = YearPicker._MIDDLE_ITEM_INDEX;
	        this.fireEvent("change", {
	          timestamp: timestamp
	        });
	      }
	    }
	  }, {
	    key: "_handleSpace",
	    value: function _handleSpace(event) {
	      event.preventDefault();

	      if (event.target.className.indexOf("ui5-yp-item") > -1) {
	        var timestamp = this.getTimestampFromDom(event.target);
	        this._selectedYear = CalendarDate.fromTimestamp(timestamp * 1000, this._primaryCalendarType).getYear();
	      }
	    }
	  }, {
	    key: "_handleItemNavigationBorderReach",
	    value: function _handleItemNavigationBorderReach(event) {
	      var oCalDate = this._calendarDate;
	      oCalDate.setMonth(0);
	      oCalDate.setDate(1);

	      if (event.end) {
	        oCalDate.setYear(oCalDate.getYear() + YearPicker._ITEMS_COUNT);
	      } else if (event.start) {
	        if (oCalDate.getYear() - YearPicker._MIDDLE_ITEM_INDEX < YearPicker._MIN_YEAR) {
	          return;
	        }

	        oCalDate.setYear(oCalDate.getYear() - YearPicker._ITEMS_COUNT);
	      }

	      if (oCalDate.getYear() - YearPicker._MIDDLE_ITEM_INDEX > YearPicker._MAX_YEAR) {
	        return;
	      }

	      if (this._isOutOfSelectableRange(oCalDate.getYear() - YearPicker._MIDDLE_ITEM_INDEX) && this._isOutOfSelectableRange(oCalDate.getYear() + YearPicker._MIDDLE_ITEM_INDEX)) {
	        return;
	      }

	      if (this._isOutOfSelectableRange(oCalDate.getYear() - YearPicker._MIDDLE_ITEM_INDEX) && this._isOutOfSelectableRange(oCalDate.getYear() + YearPicker._MIDDLE_ITEM_INDEX)) {
	        return;
	      }

	      this.timestamp = oCalDate.valueOf() / 1000;
	    }
	  }, {
	    key: "_isOutOfSelectableRange",
	    value: function _isOutOfSelectableRange(year) {
	      var minDate = new Date(this._minDate),
	          maxDate = new Date(this._maxDate),
	          minDateCheck = minDate && year < minDate.getFullYear(),
	          maxDateCheck = maxDate && year > maxDate.getFullYear();
	      return minDateCheck || maxDateCheck;
	    }
	  }, {
	    key: "getFormat",
	    value: function getFormat() {
	      if (this._isPattern) {
	        this._oDateFormat = DateFormat.getInstance({
	          pattern: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      } else {
	        this._oDateFormat = DateFormat.getInstance({
	          style: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      }

	      return this._oDateFormat;
	    }
	  }, {
	    key: "_timestamp",
	    get: function get() {
	      return this.timestamp !== undefined ? this.timestamp : Math.floor(new Date().getTime() / 1000);
	    }
	  }, {
	    key: "_localDate",
	    get: function get() {
	      return new Date(this._timestamp * 1000);
	    }
	  }, {
	    key: "_calendarDate",
	    get: function get() {
	      return CalendarDate.fromTimestamp(this._localDate.getTime(), this._primaryCalendarType);
	    }
	  }, {
	    key: "_year",
	    get: function get() {
	      return this._calendarDate.getYear();
	    }
	  }, {
	    key: "_primaryCalendarType",
	    get: function get() {
	      return this.primaryCalendarType || getCalendarType() || LocaleData.getInstance(__chunk_1.getLocale()).getPreferredCalendarType();
	    }
	  }, {
	    key: "_isPattern",
	    get: function get() {
	      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
	    }
	  }, {
	    key: "_formatPattern",
	    get: function get() {
	      return this.formatPattern || "medium"; // get from config
	    }
	  }, {
	    key: "_maxDate",
	    get: function get() {
	      if (this.maxDate) {
	        var jsDate = new Date(this.getFormat().parse(this.maxDate).getFullYear(), this.getFormat().parse(this.maxDate).getMonth(), this.getFormat().parse(this.maxDate).getDate());
	        var oCalDate = CalendarDate.fromTimestamp(jsDate.getTime(), this._primaryCalendarType);
	        return oCalDate.valueOf();
	      }

	      return this.maxDate;
	    }
	  }, {
	    key: "_minDate",
	    get: function get() {
	      if (this.minDate) {
	        var jsDate = new Date(this.getFormat().parse(this.minDate).getFullYear(), this.getFormat().parse(this.minDate).getMonth(), this.getFormat().parse(this.minDate).getDate());
	        var oCalDate = CalendarDate.fromTimestamp(jsDate.getTime(), this._primaryCalendarType);
	        return oCalDate.valueOf();
	      }

	      return this.minDate;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        main: {
	          display: this._hidden ? "none" : ""
	        }
	      };
	    }
	  }]);

	  return YearPicker;
	}(__chunk_1.UI5Element);

	YearPicker._ITEMS_COUNT = 20;
	YearPicker._MIDDLE_ITEM_INDEX = 7;
	YearPicker._MAX_YEAR = 9999;
	YearPicker._MIN_YEAR = 1;
	YearPicker.define();

	var Gregorian = UniversalDate.extend('sap.ui.core.date.Gregorian', {
	  constructor: function constructor() {
	    this.oDate = this.createDate(Date, arguments);
	    this.sCalendarType = CalendarType$1.Gregorian;
	  }
	});

	Gregorian.UTC = function () {
	  return Date.UTC.apply(Date, arguments);
	};

	Gregorian.now = function () {
	  return Date.now();
	};

	_Calendars.set(CalendarType$1.Gregorian, Gregorian);

	function _templateObject$4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"", "\" style=\"", "\"><ui5-calendar-header id=\"", "-head\" month-text=\"", "\" year-text=\"", "\" .primaryCalendarType=\"", "\" @ui5-previous-press=\"", "\" @ui5-next-press=\"", "\" @ui5-show-month-press=\"", "\" @ui5-show-year-press=\"", "\" ._isNextButtonDisabled=\"", "\" ._isPrevButtonDisabled=\"", "\"></ui5-calendar-header><div id=\"", "-content\"><ui5-daypicker id=\"", "-daypicker\" class=\"", "\" format-pattern=\"", "\" .selectedDates=\"", "\" ._hidden=\"", "\" .primaryCalendarType=\"", "\" .minDate=\"", "\" .maxDate=\"", "\" timestamp=\"", "\" @ui5-change=\"", "\" @ui5-navigate=\"", "\" ?hide-week-numbers=\"", "\"></ui5-daypicker><ui5-monthpicker id=\"", "-MP\" class=\"", "\" format-pattern=\"", "\" ._hidden=\"", "\" .primaryCalendarType=\"", "\" .minDate=\"", "\" .maxDate=\"", "\" timestamp=\"", "\" @ui5-change=\"", "\"></ui5-monthpicker><ui5-yearpicker id=\"", "-YP\" class=\"", "\" format-pattern=\"", "\" ._hidden=\"", "\" .primaryCalendarType=\"", "\" .minDate=\"", "\" .maxDate=\"", "\" timestamp=\"", "\" ._selectedYear=\"", "\" @ui5-change=\"", "\"></ui5-yearpicker></div></div>"]);

	  _templateObject$4 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$4 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$4(), __chunk_2.classMap(context.classes.main), __chunk_2.styleMap(context.styles.main), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._header.monthText), __chunk_2.ifDefined(context._header.yearText), __chunk_2.ifDefined(context._oMonth.primaryCalendarType), __chunk_2.ifDefined(context._header.onPressPrevious), __chunk_2.ifDefined(context._header.onPressNext), __chunk_2.ifDefined(context._header.onBtn1Press), __chunk_2.ifDefined(context._header.onBtn2Press), __chunk_2.ifDefined(context._header._isNextButtonDisabled), __chunk_2.ifDefined(context._header._isPrevButtonDisabled), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._id), __chunk_2.classMap(context.classes.dayPicker), __chunk_2.ifDefined(context._oMonth.formatPattern), __chunk_2.ifDefined(context._oMonth.selectedDates), __chunk_2.ifDefined(context._oMonth._hidden), __chunk_2.ifDefined(context._oMonth.primaryCalendarType), __chunk_2.ifDefined(context._oMonth.minDate), __chunk_2.ifDefined(context._oMonth.maxDate), __chunk_2.ifDefined(context._oMonth.timestamp), __chunk_2.ifDefined(context._oMonth.onSelectedDatesChange), __chunk_2.ifDefined(context._oMonth.onNavigate), context.hideWeekNumbers, __chunk_2.ifDefined(context._id), __chunk_2.classMap(context.classes.monthPicker), __chunk_2.ifDefined(context._oMonth.formatPattern), __chunk_2.ifDefined(context._monthPicker._hidden), __chunk_2.ifDefined(context._oMonth.primaryCalendarType), __chunk_2.ifDefined(context._oMonth.minDate), __chunk_2.ifDefined(context._oMonth.maxDate), __chunk_2.ifDefined(context._monthPicker.timestamp), __chunk_2.ifDefined(context._monthPicker.onSelectedMonthChange), __chunk_2.ifDefined(context._id), __chunk_2.classMap(context.classes.yearPicker), __chunk_2.ifDefined(context._oMonth.formatPattern), __chunk_2.ifDefined(context._yearPicker._hidden), __chunk_2.ifDefined(context._oMonth.primaryCalendarType), __chunk_2.ifDefined(context._oMonth.minDate), __chunk_2.ifDefined(context._oMonth.maxDate), __chunk_2.ifDefined(context._yearPicker.timestamp), __chunk_2.ifDefined(context._yearPicker._selectedYear), __chunk_2.ifDefined(context._yearPicker.onSelectedYearChange));
	};

	var main$4 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$4(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var calendarCSS = ":host{display:inline-block}.ui5-daypicker--hidden,.ui5-monthpicker--hidden,.ui5-yearpicker--hidden{display:none}.ui5-cal-root{background:var(--sapList_Background)}.ui5-cal-root [ui5-daypicker],.ui5-cal-root [ui5-month-picker],.ui5-cal-root [ui5-yearpicker]{vertical-align:top}";

	/**
	 * @public
	 */

	var metadata$4 = {
	  tag: "ui5-calendar",
	  properties:
	  /** @lends  sap.ui.webcomponents.main.Calendar.prototype */
	  {
	    /**
	     * Defines the UNIX timestamp - seconds since 00:00:00 UTC on Jan 1, 1970.
	     * @type {Integer}
	     * @public
	    */
	    timestamp: {
	      type: __chunk_1.Integer
	    },

	    /**
	     * Defines the calendar type used for display.
	     * If not defined, the calendar type of the global configuration is used.
	     * Available options are: "Gregorian", "Islamic", "Japanese", "Buddhist" and "Persian".
	     * @type {CalendarType}
	     * @public
	     */
	    primaryCalendarType: {
	      type: CalendarType
	    },

	    /**
	     * Defines the selected dates as UTC timestamps.
	     * @type {Array}
	     * @public
	     */
	    selectedDates: {
	      type: __chunk_1.Integer,
	      multiple: true
	    },

	    /**
	     * Determines the мinimum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    minDate: {
	      type: String
	    },

	    /**
	     * Determines the maximum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    maxDate: {
	      type: String
	    },

	    /**
	     * Defines the visibility of the week numbers column.
	     * <br><br>
	     *
	     * <b>Note:<b> For calendars other than Gregorian,
	     * the week numbers are not displayed regardless of what is set.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    hideWeekNumbers: {
	      type: Boolean
	    },
	    _header: {
	      type: Object
	    },
	    _oMonth: {
	      type: Object
	    },
	    _monthPicker: {
	      type: Object
	    },
	    _yearPicker: {
	      type: Object
	    },
	    _calendarWidth: {
	      type: String,
	      noAttribute: true
	    },
	    _calendarHeight: {
	      type: String,
	      noAttribute: true
	    },
	    formatPattern: {
	      type: String
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.Calendar.prototype */
	  {
	    /**
	     * Fired when the selected dates changed.
	     * @event sap.ui.webcomponents.main.Calendar#selected-dates-change
	     * @param {Array} dates The selected dates' timestamps
	     * @public
	     */
	    "selected-dates-change": {
	      type: Array
	    }
	  }
	};
	/**
	 * @class
	 *
	 * The <code>ui5-calendar</code> can be used standale to display the years, months, weeks and days,
	 * but the main purpose of the <code>ui5-calendar</code> is to be used within a <code>ui5-date-picker</code>.
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.Calendar
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-calendar
	 * @public
	 */

	var Calendar =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(Calendar, _UI5Element);

	  __chunk_1._createClass(Calendar, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata$4;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main$4;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return calendarCSS;
	    }
	  }]);

	  function Calendar() {
	    var _this;

	    __chunk_1._classCallCheck(this, Calendar);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(Calendar).call(this));
	    _this._oLocale = __chunk_1.getLocale();
	    _this._oLocaleData = new LocaleData(_this._oLocale);
	    _this._header = {};
	    _this._header.onPressPrevious = _this._handlePrevious.bind(__chunk_1._assertThisInitialized(_this));
	    _this._header.onPressNext = _this._handleNext.bind(__chunk_1._assertThisInitialized(_this));
	    _this._header.onBtn1Press = _this._handleMonthButtonPress.bind(__chunk_1._assertThisInitialized(_this));
	    _this._header.onBtn2Press = _this._handleYearButtonPress.bind(__chunk_1._assertThisInitialized(_this));
	    _this._oMonth = {};
	    _this._oMonth.onSelectedDatesChange = _this._handleSelectedDatesChange.bind(__chunk_1._assertThisInitialized(_this));
	    _this._oMonth.onNavigate = _this._handleMonthNavigate.bind(__chunk_1._assertThisInitialized(_this));
	    _this._monthPicker = {};
	    _this._monthPicker._hidden = true;
	    _this._monthPicker.onSelectedMonthChange = _this._handleSelectedMonthChange.bind(__chunk_1._assertThisInitialized(_this));
	    _this._yearPicker = {};
	    _this._yearPicker._hidden = true;
	    _this._yearPicker.onSelectedYearChange = _this._handleSelectedYearChange.bind(__chunk_1._assertThisInitialized(_this));
	    _this._isShiftingYears = false;
	    return _this;
	  }

	  __chunk_1._createClass(Calendar, [{
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      var oYearFormat = DateFormat.getDateInstance({
	        format: "y",
	        calendarType: this._primaryCalendarType
	      });
	      var minDateParsed = this.minDate && this.getFormat().parse(this.minDate);
	      var maxDateParsed = this.maxDate && this.getFormat().parse(this.maxDate);
	      var firstDayOfCalendarTimeStamp = -62135596800000;
	      var currentMonth = 0;
	      var currentYear = 1;

	      if ((this.minDate || this.maxDate) && this._timestamp && !this.isInValidRange(this._timestamp * 1000)) {
	        if (this._minDate) {
	          this.timestamp = this._minDate / 1000;
	        } else {
	          this.timestamp = new Date(firstDayOfCalendarTimeStamp).getTime() / 1000;
	        }
	      }

	      this._oMonth.formatPattern = this._formatPattern;
	      this._oMonth.timestamp = this._timestamp;
	      this._oMonth.selectedDates = __chunk_1._toConsumableArray(this._selectedDates);
	      this._oMonth.primaryCalendarType = this._primaryCalendarType;
	      this._oMonth.minDate = this.minDate;
	      this._oMonth.maxDate = this.maxDate;
	      this._header.monthText = this._oLocaleData.getMonths("wide", this._primaryCalendarType)[this._month];
	      this._header.yearText = oYearFormat.format(this._localDate, true);
	      currentMonth = this.timestamp && CalendarDate.fromTimestamp(this.timestamp * 1000).getMonth();
	      currentYear = this.timestamp && CalendarDate.fromTimestamp(this.timestamp * 1000).getYear(); // month picker

	      this._monthPicker.primaryCalendarType = this._primaryCalendarType;
	      this._monthPicker.timestamp = this._timestamp;
	      this._yearPicker.primaryCalendarType = this._primaryCalendarType;

	      if (!this._isShiftingYears) {
	        // year picker
	        this._yearPicker.timestamp = this._timestamp;
	      }

	      this._isShiftingYears = false;

	      if (!this._oMonth._hidden) {
	        if (this.minDate && minDateParsed.getMonth() === currentMonth && minDateParsed.getFullYear() === currentYear) {
	          this._header._isPrevButtonDisabled = true;
	        } else {
	          this._header._isPrevButtonDisabled = false;
	        }

	        if (this.maxDate && maxDateParsed.getMonth() === currentMonth && maxDateParsed.getFullYear() === currentYear) {
	          this._header._isNextButtonDisabled = true;
	        } else {
	          this._header._isNextButtonDisabled = false;
	        }
	      }

	      if (!this._yearPicker._hidden) {
	        currentYear = this._yearPicker.timestamp && CalendarDate.fromTimestamp(this._yearPicker.timestamp * 1000).getYear();

	        if (this.minDate && currentYear - minDateParsed.getFullYear() < 1) {
	          this._header._isPrevButtonDisabled = true;
	        } else {
	          this._header._isPrevButtonDisabled = false;
	        }

	        if (this.maxDate && maxDateParsed.getFullYear() - currentYear < 1) {
	          this._header._isNextButtonDisabled = true;
	        } else {
	          this._header._isNextButtonDisabled = false;
	        }
	      }
	    }
	  }, {
	    key: "_handleSelectedDatesChange",
	    value: function _handleSelectedDatesChange(event) {
	      this.selectedDates = __chunk_1._toConsumableArray(event.detail.dates);
	      this.fireEvent("selected-dates-change", {
	        dates: event.detail.dates
	      });
	    }
	  }, {
	    key: "_handleMonthNavigate",
	    value: function _handleMonthNavigate(event) {
	      this.timestamp = event.detail.timestamp;
	    }
	  }, {
	    key: "_handleSelectedMonthChange",
	    value: function _handleSelectedMonthChange(event) {
	      var oNewDate = this._calendarDate;
	      var newMonthIndex = CalendarDate.fromTimestamp(event.detail.timestamp * 1000, this._primaryCalendarType).getMonth();
	      oNewDate.setMonth(newMonthIndex);
	      this.timestamp = oNewDate.valueOf() / 1000;

	      this._hideMonthPicker();

	      this._focusFirstDayOfMonth(oNewDate);
	    }
	  }, {
	    key: "_focusFirstDayOfMonth",
	    value: function _focusFirstDayOfMonth(targetDate) {
	      var fistDayOfMonthIndex = -1; // focus first day of the month

	      var dayPicker = this.shadowRoot.querySelector("[ui5-daypicker]");

	      dayPicker._getVisibleDays(targetDate).forEach(function (date, index) {
	        if (date.getDate() === 1 && fistDayOfMonthIndex === -1) {
	          fistDayOfMonthIndex = index;
	        }
	      });

	      dayPicker._itemNav.currentIndex = fistDayOfMonthIndex;

	      dayPicker._itemNav.focusCurrent();
	    }
	  }, {
	    key: "_handleSelectedYearChange",
	    value: function _handleSelectedYearChange(event) {
	      var oNewDate = CalendarDate.fromTimestamp(event.detail.timestamp * 1000, this._primaryCalendarType);
	      oNewDate.setMonth(0);
	      oNewDate.setDate(1);
	      this.timestamp = oNewDate.valueOf() / 1000;

	      this._hideYearPicker();

	      this._focusFirstDayOfMonth(oNewDate);
	    }
	  }, {
	    key: "_handleMonthButtonPress",
	    value: function _handleMonthButtonPress() {
	      this._hideYearPicker();

	      this["_".concat(this._monthPicker._hidden ? "show" : "hide", "MonthPicker")]();
	    }
	  }, {
	    key: "_handleYearButtonPress",
	    value: function _handleYearButtonPress() {
	      this._hideMonthPicker();

	      this["_".concat(this._yearPicker._hidden ? "show" : "hide", "YearPicker")]();
	    }
	  }, {
	    key: "_handlePrevious",
	    value: function _handlePrevious() {
	      if (this._monthPicker._hidden && this._yearPicker._hidden) {
	        this._showPrevMonth();
	      } else if (this._monthPicker._hidden && !this._yearPicker._hidden) {
	        this._showPrevPageYears();
	      } else if (!this._monthPicker._hidden && this._yearPicker._hidden) {
	        this._showPrevYear();
	      }
	    }
	  }, {
	    key: "_handleNext",
	    value: function _handleNext() {
	      if (this._monthPicker._hidden && this._yearPicker._hidden) {
	        this._showNextMonth();
	      } else if (this._monthPicker._hidden && !this._yearPicker._hidden) {
	        this._showNextPageYears();
	      } else if (!this._monthPicker._hidden && this._yearPicker._hidden) {
	        this._showNextYear();
	      }
	    }
	  }, {
	    key: "_showNextMonth",
	    value: function _showNextMonth() {
	      var nextMonth = this._calendarDate;
	      nextMonth.setDate(1);
	      nextMonth.setMonth(nextMonth.getMonth() + 1);

	      if (nextMonth.getYear() > YearPicker._MAX_YEAR) {
	        return;
	      }

	      if (!this.isInValidRange(nextMonth.toLocalJSDate().valueOf())) {
	        return;
	      }

	      this._focusFirstDayOfMonth(nextMonth);

	      this.timestamp = nextMonth.valueOf() / 1000;
	    }
	  }, {
	    key: "_showPrevMonth",
	    value: function _showPrevMonth() {
	      var iNewMonth = this._month - 1,
	          iNewYear = this._calendarDate.getYear(); // focus first day of the month


	      var dayPicker = this.shadowRoot.querySelector("[ui5-daypicker]");

	      var currentMonthDate = dayPicker._calendarDate.setMonth(dayPicker._calendarDate.getMonth());

	      var lastMonthDate = dayPicker._calendarDate.setMonth(dayPicker._calendarDate.getMonth() - 1); // set the date to last day of last month


	      currentMonthDate.setDate(-1); // find the index of the last day

	      var lastDayOfMonthIndex = -1;

	      if (!this.isInValidRange(currentMonthDate.toLocalJSDate().valueOf())) {
	        return;
	      }

	      dayPicker._getVisibleDays(lastMonthDate).forEach(function (date, index) {
	        var isSameDate = currentMonthDate.getDate() === date.getDate();
	        var isSameMonth = currentMonthDate.getMonth() === date.getMonth();

	        if (isSameDate && isSameMonth) {
	          lastDayOfMonthIndex = index + 1;
	        }
	      });

	      var weekDaysCount = 7;

	      if (lastDayOfMonthIndex !== -1) {
	        // find the DOM for the last day index
	        var lastDay = dayPicker.shadowRoot.querySelector(".ui5-dp-items-container").children[parseInt(lastDayOfMonthIndex / weekDaysCount)].children[lastDayOfMonthIndex % weekDaysCount]; // update current item in ItemNavigation

	        dayPicker._itemNav.current = lastDayOfMonthIndex; // focus the item

	        lastDay.focus();
	      }

	      if (iNewMonth > 11) {
	        iNewMonth = 0;
	        iNewYear = this._calendarDate.getYear() + 1;
	      }

	      if (iNewMonth < 0) {
	        iNewMonth = 11;
	        iNewYear = this._calendarDate.getYear() - 1;
	      }

	      var oNewDate = this._calendarDate;
	      oNewDate.setYear(iNewYear);
	      oNewDate.setMonth(iNewMonth);

	      if (oNewDate.getYear() < YearPicker._MIN_YEAR) {
	        return;
	      }

	      this.timestamp = oNewDate.valueOf() / 1000;
	    }
	  }, {
	    key: "_showNextYear",
	    value: function _showNextYear() {
	      if (this._calendarDate.getYear() === YearPicker._MAX_YEAR) {
	        return;
	      }

	      var oNewDate = this._calendarDate;
	      oNewDate.setYear(this._calendarDate.getYear() + 1);
	      this.timestamp = oNewDate.valueOf() / 1000;
	    }
	  }, {
	    key: "_showPrevYear",
	    value: function _showPrevYear() {
	      if (this._calendarDate.getYear() === YearPicker._MIN_YEAR) {
	        return;
	      }

	      var oNewDate = this._calendarDate;
	      oNewDate.setYear(this._calendarDate.getYear() - 1);
	      this.timestamp = oNewDate.valueOf() / 1000;
	    }
	  }, {
	    key: "_showNextPageYears",
	    value: function _showNextPageYears() {
	      if (!this._isYearInRange(this._yearPicker.timestamp, YearPicker._ITEMS_COUNT - YearPicker._MIDDLE_ITEM_INDEX, YearPicker._MIN_YEAR, YearPicker._MAX_YEAR)) {
	        return;
	      }

	      if (this.minDate && !this._isYearInRange(this._yearPicker.timestamp, YearPicker._ITEMS_COUNT - YearPicker._MIDDLE_ITEM_INDEX, this.getFormat().parse(this.minDate).getFullYear(), YearPicker._MAX_YEAR)) {
	        return;
	      }

	      if (this.maxDate && !this._isYearInRange(this._yearPicker.timestamp, YearPicker._ITEMS_COUNT - YearPicker._MIDDLE_ITEM_INDEX, YearPicker._MIN_YEAR, this.getFormat().parse(this.maxDate).getFullYear())) {
	        return;
	      }

	      this._yearPicker = Object.assign({}, this._yearPicker, {
	        timestamp: this._yearPicker.timestamp + 31536000 * YearPicker._ITEMS_COUNT
	      });
	      this._isShiftingYears = true;
	    }
	  }, {
	    key: "_showPrevPageYears",
	    value: function _showPrevPageYears() {
	      if (!this._isYearInRange(this._yearPicker.timestamp, -YearPicker._MIDDLE_ITEM_INDEX - 1, YearPicker._MIN_YEAR, YearPicker._MAX_YEAR)) {
	        return;
	      }

	      if (this.minDate && !this._isYearInRange(this._yearPicker.timestamp, -YearPicker._MIDDLE_ITEM_INDEX - 1, this.getFormat().parse(this.minDate).getFullYear(), YearPicker._MAX_YEAR)) {
	        return;
	      }

	      if (this.maxDate && !this._isYearInRange(this._yearPicker.timestamp, -YearPicker._MIDDLE_ITEM_INDEX - 1, YearPicker._MIN_YEAR, this.getFormat().parse(this.maxDate).getFullYear())) {
	        return;
	      }

	      this._yearPicker = Object.assign({}, this._yearPicker, {
	        timestamp: this._yearPicker.timestamp - 31536000 * YearPicker._ITEMS_COUNT
	      });
	      this._isShiftingYears = true;
	    }
	  }, {
	    key: "_showMonthPicker",
	    value: function _showMonthPicker() {
	      this._monthPicker = Object.assign({}, this._monthPicker);
	      this._oMonth = Object.assign({}, this._oMonth);
	      this._monthPicker.timestamp = this._timestamp;
	      this._monthPicker._hidden = false;
	      this._oMonth._hidden = true;
	      var calendarRect = this.shadowRoot.querySelector(".ui5-cal-root").getBoundingClientRect();
	      this._calendarWidth = calendarRect.width.toString();
	      this._calendarHeight = calendarRect.height.toString();
	    }
	  }, {
	    key: "_showYearPicker",
	    value: function _showYearPicker() {
	      this._yearPicker = Object.assign({}, this._yearPicker);
	      this._oMonth = Object.assign({}, this._oMonth);
	      this._yearPicker.timestamp = this._timestamp;
	      this._yearPicker._selectedYear = this._calendarDate.getYear();
	      this._yearPicker._hidden = false;
	      this._oMonth._hidden = true;
	      var calendarRect = this.shadowRoot.querySelector(".ui5-cal-root").getBoundingClientRect();
	      this._calendarWidth = calendarRect.width.toString();
	      this._calendarHeight = calendarRect.height.toString();
	    }
	  }, {
	    key: "_hideMonthPicker",
	    value: function _hideMonthPicker() {
	      this._monthPicker = Object.assign({}, this._monthPicker);
	      this._oMonth = Object.assign({}, this._oMonth);
	      this._monthPicker._hidden = true;
	      this._oMonth._hidden = false;
	    }
	  }, {
	    key: "_hideYearPicker",
	    value: function _hideYearPicker() {
	      this._yearPicker = Object.assign({}, this._yearPicker);
	      this._oMonth = Object.assign({}, this._oMonth);
	      this._yearPicker._hidden = true;
	      this._oMonth._hidden = false;
	    }
	  }, {
	    key: "_isYearInRange",
	    value: function _isYearInRange(timestamp, yearsoffset, min, max) {
	      if (timestamp) {
	        var oCalDate = CalendarDate.fromTimestamp(timestamp * 1000, this._primaryCalendarType);
	        oCalDate.setMonth(0);
	        oCalDate.setDate(1);
	        oCalDate.setYear(oCalDate.getYear() + yearsoffset);
	        return oCalDate.getYear() >= min && oCalDate.getYear() <= max;
	      }
	    }
	  }, {
	    key: "isInValidRange",

	    /**
	     * Checks if a date is in range between minimum and maximum date
	     * @param {object} value
	     * @public
	     */
	    value: function isInValidRange() {
	      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
	      var pickedDate = CalendarDate.fromTimestamp(value).toLocalJSDate(),
	          minDate = this._minDate && new Date(this._minDate),
	          maxDate = this._maxDate && new Date(this._maxDate);

	      if (minDate && maxDate) {
	        if (minDate <= pickedDate && maxDate >= pickedDate) {
	          return true;
	        }
	      } else if (minDate && !maxDate) {
	        if (minDate <= pickedDate) {
	          return true;
	        }
	      } else if (maxDate && !minDate) {
	        if (maxDate >= pickedDate) {
	          return true;
	        }
	      } else if (!maxDate && !minDate) {
	        return true;
	      }

	      return false;
	    }
	  }, {
	    key: "getFormat",
	    value: function getFormat() {
	      if (this._isPattern) {
	        this._oDateFormat = DateFormat.getInstance({
	          pattern: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      } else {
	        this._oDateFormat = DateFormat.getInstance({
	          style: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      }

	      return this._oDateFormat;
	    }
	  }, {
	    key: "_timestamp",
	    get: function get() {
	      return this.timestamp !== undefined ? this.timestamp : Math.floor(new Date().getTime() / 1000);
	    }
	  }, {
	    key: "_localDate",
	    get: function get() {
	      return new Date(this._timestamp * 1000);
	    }
	  }, {
	    key: "_calendarDate",
	    get: function get() {
	      return CalendarDate.fromTimestamp(this._localDate.getTime(), this._primaryCalendarType);
	    }
	  }, {
	    key: "_month",
	    get: function get() {
	      return this._calendarDate.getMonth();
	    }
	  }, {
	    key: "_primaryCalendarType",
	    get: function get() {
	      return this.primaryCalendarType || getCalendarType() || LocaleData.getInstance(__chunk_1.getLocale()).getPreferredCalendarType();
	    }
	  }, {
	    key: "_formatPattern",
	    get: function get() {
	      return this.formatPattern || "medium"; // get from config
	    }
	  }, {
	    key: "_isPattern",
	    get: function get() {
	      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
	    }
	  }, {
	    key: "_selectedDates",
	    get: function get() {
	      return this.selectedDates || [];
	    }
	  }, {
	    key: "_maxDate",
	    get: function get() {
	      if (this.maxDate) {
	        var jsDate = new Date(this.getFormat().parse(this.maxDate).getFullYear(), this.getFormat().parse(this.maxDate).getMonth(), this.getFormat().parse(this.maxDate).getDate());
	        var oCalDate = CalendarDate.fromTimestamp(jsDate.getTime(), this._primaryCalendarType);
	        return oCalDate.valueOf();
	      }

	      return this.maxDate;
	    }
	  }, {
	    key: "_minDate",
	    get: function get() {
	      if (this.minDate) {
	        var jsDate = new Date(this.getFormat().parse(this.minDate).getFullYear(), this.getFormat().parse(this.minDate).getMonth(), this.getFormat().parse(this.minDate).getDate());
	        var oCalDate = CalendarDate.fromTimestamp(jsDate.getTime(), this._primaryCalendarType);
	        return oCalDate.valueOf();
	      }

	      return this.minDate;
	    }
	  }, {
	    key: "classes",
	    get: function get() {
	      return {
	        main: {
	          "ui5-cal-root": true
	        },
	        dayPicker: {
	          ".ui5-daypicker--hidden": !this._yearPicker._hidden || !this._monthPicker._hidden
	        },
	        yearPicker: {
	          "ui5-yearpicker--hidden": this._yearPicker._hidden
	        },
	        monthPicker: {
	          "ui5-monthpicker--hidden": this._monthPicker._hidden
	        }
	      };
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        main: {
	          "height": "".concat(this._calendarHeight ? "".concat(this._calendarHeight, "px") : "auto"),
	          "width": "".concat(this._calendarWidth ? "".concat(this._calendarWidth, "px") : "auto")
	        }
	      };
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return __chunk_1.fetchCldr(__chunk_1.getLocale().getLanguage(), __chunk_1.getLocale().getRegion(), __chunk_1.getLocale().getScript());

	              case 2:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [CalendarHeader, DayPicker, MonthPicker, YearPicker];
	    }
	  }]);

	  return Calendar;
	}(__chunk_1.UI5Element);

	Calendar.define();

	function _templateObject3$3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-icon slot=\"icon\" name=\"", "\" tabindex=\"-1\" accessible-name=\"", "\" show-tooltip @click=\"", "\" input-icon ?pressed=\"", "\" dir=\"", "\"></ui5-icon>"]);

	  _templateObject3$3 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2$3() {
	  var data = __chunk_1._taggedTemplateLiteral(["<slot name=\"valueStateMessage\" slot=\"valueStateMessage\"></slot>"]);

	  _templateObject2$3 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$5() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div class=\"ui5-date-picker-root\" style=\"", "\" @keydown=", "><!-- INPUT --><ui5-input id=\"", "-inner\" class=\"ui5-date-picker-input\" placeholder=\"", "\" type=\"", "\" value=\"", "\" ?disabled=\"", "\" ?readonly=\"", "\" value-state=\"", "\" @ui5-change=\"", "\" @ui5-input=\"", "\" data-sap-focus-ref ._inputAccInfo =\"", "\">", "", "</ui5-input><slot name=\"formSupport\"></slot></div>"]);

	  _templateObject$5 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$5 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$5(), __chunk_2.styleMap(context.styles.main), context._onkeydown, __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._placeholder), __chunk_2.ifDefined(context.type), __chunk_2.ifDefined(context.value), context.disabled, context.readonly, __chunk_2.ifDefined(context.valueState), __chunk_2.ifDefined(context._handleInputChange), __chunk_2.ifDefined(context._handleInputLiveChange), __chunk_2.ifDefined(context.accInfo), context.valueStateMessage.length ? block1$3(context) : undefined, !context.readonly ? block2$3(context) : undefined);
	};

	var block1$3 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2$3());
	};

	var block2$3 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3$3(), __chunk_2.ifDefined(context.openIconName), __chunk_2.ifDefined(context.openIconTitle), context.togglePicker, context._isPickerOpen, __chunk_2.ifDefined(context.effectiveDir));
	};

	var main$5 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$5(context);
	};

	function _templateObject3$4() {
	  var data = __chunk_1._taggedTemplateLiteral([""]);

	  _templateObject3$4 = function _templateObject3() {
	    return data;
	  };

	  return data;
	}

	function _templateObject2$4() {
	  var data = __chunk_1._taggedTemplateLiteral(["<div slot=\"header\" class=\"ui5-responsive-popover-header\"><div class=\"row\"><span>", "</span><ui5-button class=\"ui5-responsive-popover-close-btn\" icon=\"decline\" design=\"Transparent\" @click=\"", "\"></ui5-button></div></div>"]);

	  _templateObject2$4 = function _templateObject2() {
	    return data;
	  };

	  return data;
	}

	function _templateObject$6() {
	  var data = __chunk_1._taggedTemplateLiteral(["<ui5-responsive-popover id=\"", "-responsive-popover\" allow-target-overlap=\"", "\" stay-open-on-scroll=\"", "\" placement-type=\"Bottom\" horizontal-align=\"Left\" ?disable-scrolling=\"", "\" no-arrow with-padding no-stretch ?_hide-header=", " @keydown=\"", "\" @ui5-before-open=\"", "\" @ui5-after-open=\"", "\" @ui5-before-close=\"", "\" @ui5-after-close=\"", "\">", "<ui5-calendar id=\"", "-calendar\" primary-calendar-type=\"", "\" format-pattern=\"", "\" timestamp=\"", "\" .selectedDates=\"", "\" .minDate=\"", "\" .maxDate=\"", "\" @ui5-selected-dates-change=\"", "\" ?hide-week-numbers=\"", "\"></ui5-calendar>", "</ui5-responsive-popover>"]);

	  _templateObject$6 = function _templateObject() {
	    return data;
	  };

	  return data;
	}

	var block0$6 = function block0(context) {
	  return __chunk_2.scopedHtml(_templateObject$6(), __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._respPopoverConfig.allowTargetOverlap), __chunk_2.ifDefined(context._respPopoverConfig.stayOpenOnScroll), context._isIE, __chunk_2.ifDefined(context._shouldHideHeader), context._onkeydown, __chunk_2.ifDefined(context._respPopoverConfig.beforeOpen), __chunk_2.ifDefined(context._respPopoverConfig.afterOpen), __chunk_2.ifDefined(context._respPopoverConfig.beforeClose), __chunk_2.ifDefined(context._respPopoverConfig.afterClose), context.showHeader ? block1$4(context) : undefined, __chunk_2.ifDefined(context._id), __chunk_2.ifDefined(context._calendar.primaryCalendarType), __chunk_2.ifDefined(context._calendar.formatPattern), __chunk_2.ifDefined(context._calendar.timestamp), __chunk_2.ifDefined(context._calendar.selectedDates), __chunk_2.ifDefined(context._calendar.minDate), __chunk_2.ifDefined(context._calendar.maxDate), __chunk_2.ifDefined(context._calendar.onSelectedDatesChange), context.hideWeekNumbers, context.showFooter ? block2$4(context) : undefined);
	};

	var block1$4 = function block1(context) {
	  return __chunk_2.scopedHtml(_templateObject2$4(), __chunk_2.ifDefined(context._headerTitleText), context.closePicker);
	};

	var block2$4 = function block2(context) {
	  return __chunk_2.scopedHtml(_templateObject3$4());
	};

	var main$6 = function main(context, tags, suffix) {
	  __chunk_2.setTags(tags);
	  __chunk_2.setSuffix(suffix);
	  return block0$6(context);
	};

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var datePickerCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}[input-icon]{color:var(--sapContent_IconColor);cursor:pointer;outline:none;padding:var(--_ui5_input_icon_padding);border-left:1px solid transparent;min-width:1rem;min-height:1rem}[input-icon][pressed]{background:var(--sapButton_Selected_Background);color:var(--sapButton_Active_TextColor)}[input-icon]:active{background-color:var(--sapButton_Active_Background);color:var(--sapButton_Active_TextColor)}[input-icon]:not([pressed]):not(:active):hover{background:var(--sapButton_Lite_Hover_Background)}[input-icon]:hover{border-left:var(--_ui5_select_hover_icon_left_border)}[input-icon][dir=rtl]:hover{border-left:none;border-right:var(--_ui5_select_hover_icon_left_border)}[input-icon][dir=rtl]{border-left:none;border-right:1px solid transparent}:host(:not([hidden])){display:inline-block}:host .ui5-date-picker-input{width:100%}";

	__chunk_1.registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", __chunk_6.defaultThemeBase);
	__chunk_1.registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", __chunk_7.defaultTheme);
	var datePickerPopoverCss = "[ui5-calendar]{width:100%}";

	/**
	 * @public
	 */

	var metadata$5 = {
	  tag: "ui5-date-picker",
	  altTag: "ui5-datepicker",
	  languageAware: true,
	  managedSlots: true,
	  properties:
	  /** @lends  sap.ui.webcomponents.main.DatePicker.prototype */
	  {
	    /**
	     * Defines a formatted date value.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    value: {
	      type: String
	    },

	    /**
	     * Defines the value state of the <code>ui5-date-picker</code>.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>None</code></li>
	     * <li><code>Error</code></li>
	     * <li><code>Warning</code></li>
	     * <li><code>Success</code></li>
	     * <li><code>Information</code></li>
	     * </ul>
	     *
	     * @type {ValueState}
	     * @defaultvalue "None"
	     * @public
	     */
	    valueState: {
	      type: __chunk_21.ValueState,
	      defaultValue: __chunk_21.ValueState.None
	    },

	    /**
	     * Determines the format, displayed in the input field.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    formatPattern: {
	      type: String
	    },

	    /**
	     * Determines the minimum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    minDate: {
	      type: String
	    },

	    /**
	     * Determines the maximum date available for selection.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @since 1.0.0-rc.6
	     * @public
	     */
	    maxDate: {
	      type: String
	    },

	    /**
	     * Determines the calendar type.
	     * The input value is formated according to the calendar type
	     * and the picker shows the months and years from the specified calendar.
	     * <br><br>
	     * Available options are:
	     * <ul>
	     * <li><code>Gregorian</code></li>
	     * <li><code>Islamic</code></li>
	     * <li><code>Japanese</code></li>
	     * <li><code>Buddhist</code></li>
	     * <li><code>Persian</code></li>
	     * </ul>
	     *
	     * @type {CalendarType}
	     * @defaultvalue "Gregorian"
	     * @public
	     */
	    primaryCalendarType: {
	      type: CalendarType
	    },

	    /**
	     * Defines whether the <code>ui5-datepicker</code> is required.
	     *
	     * @since 1.0.0-rc.9
	     * @type {Boolean}
	     * @defaultvalue false
	     * @public
	     */
	    required: {
	      type: Boolean
	    },

	    /**
	     * Determines whether the <code>ui5-date-picker</code> is displayed as disabled.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    disabled: {
	      type: Boolean
	    },

	    /**
	     * Determines whether the <code>ui5-date-picker</code> is displayed as read-only.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     */
	    readonly: {
	      type: Boolean
	    },

	    /**
	     * Defines a short hint, intended to aid the user with data entry when the
	     * <code>ui5-date-picker</code> has no value.
	     *
	     * <br><br>
	     * <b>Note:</b> When no placeholder is set, the format pattern is displayed as a placeholder.
	     * Passing an empty string as the value of this property will make the <code>ui5-date-picker</code> appear empty - without placeholder or format pattern.
	     *
	     * @type {string}
	     * @defaultvalue undefined
	     * @public
	     */
	    placeholder: {
	      type: String,
	      defaultValue: undefined
	    },

	    /**
	     * Determines the name with which the <code>ui5-date-picker</code> will be submitted in an HTML form.
	     *
	     * <br><br>
	     * <b>Important:</b> For the <code>name</code> property to have effect, you must add the following import to your project:
	     * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
	     *
	     * <br><br>
	     * <b>Note:</b> When set, a native <code>input</code> HTML element
	     * will be created inside the <code>ui5-date-picker</code> so that it can be submitted as
	     * part of an HTML form. Do not use this property unless you need to submit a form.
	     *
	     * @type {string}
	     * @defaultvalue ""
	     * @public
	     */
	    name: {
	      type: String
	    },

	    /**
	     * Defines the visibility of the week numbers column.
	     * <br><br>
	     *
	     * <b>Note:<b> For calendars other than Gregorian,
	     * the week numbers are not displayed regardless of what is set.
	     *
	     * @type {boolean}
	     * @defaultvalue false
	     * @public
	     * @since 1.0.0-rc.8
	     */
	    hideWeekNumbers: {
	      type: Boolean
	    },

	    /**
	     * Defines the aria-label attribute for the <code>ui5-date-picker</code>.
	     *
	     * @type {String}
	     * @since 1.0.0-rc.9
	     * @private
	     * @defaultvalue ""
	     */
	    ariaLabel: {
	      type: String
	    },

	    /**
	     * Receives id(or many ids) of the elements that label the <code>ui5-date-picker</code>.
	     *
	     * @type {String}
	     * @defaultvalue ""
	     * @private
	     * @since 1.0.0-rc.9
	     */
	    ariaLabelledby: {
	      type: String,
	      defaultValue: ""
	    },
	    _isPickerOpen: {
	      type: Boolean,
	      noAttribute: true
	    },
	    _respPopoverConfig: {
	      type: Object
	    },
	    _calendar: {
	      type: Object
	    }
	  },
	  slots:
	  /** @lends  sap.ui.webcomponents.main.DatePicker.prototype */
	  {
	    /**
	     * Defines the value state message that will be displayed as pop up under the <code>ui5-date-picker</code>.
	     * <br><br>
	     *
	     * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
	     * <br>
	     * <b>Note:</b> The <code>valueStateMessage</code> would be displayed,
	     * when the <code>ui5-date-picker</code> is in <code>Information</code>, <code>Warning</code> or <code>Error</code> value state.
	     * @type {HTMLElement}
	     * @since 1.0.0-rc.7
	     * @slot
	     * @public
	     */
	    valueStateMessage: {
	      type: HTMLElement
	    }
	  },
	  events:
	  /** @lends  sap.ui.webcomponents.main.DatePicker.prototype */
	  {
	    /**
	     * Fired when the input operation has finished by pressing Enter or on focusout.
	     *
	     * @event
	     * @public
	    */
	    change: {},

	    /**
	     * Fired when the value of the <code>ui5-date-picker</code> is changed at each key stroke.
	     *
	     * @event
	     * @public
	    */
	    input: {}
	  }
	};
	/**
	 * @class
	 *
	 * <h3 class="comment-api-title">Overview</h3>
	 *
	 * The <code>ui5-date-picker</code> component provides an input field with assigned calendar which opens on user action.
	 * The <code>ui5-date-picker</code> allows users to select a localized date using touch,
	 * mouse, or keyboard input. It consists of two parts: the date input field and the
	 * date picker.
	 *
	 * <h3>Usage</h3>
	 *
	 * The user can enter a date by:
	 * <ul>
	 * <li>Using the calendar that opens in a popup</li>
	 * <li>Typing it in directly in the input field</li>
	 * </ul>
	 * <br><br>
	 * When the user makes an entry and chooses the enter key, the calendar shows the corresponding date.
	 * When the user directly triggers the calendar display, the actual date is displayed.
	 *
	 * <h3>Formatting</h3>
	 *
	 * If a date is entered by typing it into
	 * the input field, it must fit to the used date format.
	 * <br><br>
	 * Supported format options are pattern-based on Unicode LDML Date Format notation.
	 * For more information, see <ui5-link target="_blank" href="http://unicode.org/reports/tr35/#Date_Field_Symbol_Table" class="api-table-content-cell-link">UTS #35: Unicode Locale Data Markup Language</ui5-link>.
	 * <br><br>
	 * For example, if the <code>format-pattern</code> is "yyyy-MM-dd",
	 * a valid value string is "2015-07-30" and the same is displayed in the input.
	 *
	 * <h3>Keyboard Handling</h3>
	 * The <code>ui5-date-picker</code> provides advanced keyboard handling.
	 * If the <code>ui5-date-picker</code> is focused,
	 * you can open or close the drop-down by pressing <code>F4</code>, <code>ALT+UP</code> or <code>ALT+DOWN</code> keys.
	 * Once the drop-down is opened, you can use the <code>UP</code>, <code>DOWN</code>, <code>LEFT</code>, <code>RIGHT</code> arrow keys
	 * to navigate through the dates and select one by pressing the <code>Space</code> or <code>Enter</code> keys. Moreover you can
	 * use TAB to reach the buttons for changing month and year.
	 * <br>
	 *
	 * <h3>ES6 Module Import</h3>
	 *
	 * <code>import "@ui5/webcomponents/dist/DatePicker";</code>
	 *
	 * @constructor
	 * @author SAP SE
	 * @alias sap.ui.webcomponents.main.DatePicker
	 * @extends sap.ui.webcomponents.base.UI5Element
	 * @tagname ui5-date-picker
	 * @public
	 */

	var DatePicker =
	/*#__PURE__*/
	function (_UI5Element) {
	  __chunk_1._inherits(DatePicker, _UI5Element);

	  __chunk_1._createClass(DatePicker, null, [{
	    key: "metadata",
	    get: function get() {
	      return metadata$5;
	    }
	  }, {
	    key: "render",
	    get: function get() {
	      return __chunk_2.litRender;
	    }
	  }, {
	    key: "template",
	    get: function get() {
	      return main$5;
	    }
	  }, {
	    key: "staticAreaTemplate",
	    get: function get() {
	      return main$6;
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return datePickerCss;
	    }
	  }, {
	    key: "staticAreaStyles",
	    get: function get() {
	      return [__chunk_25.ResponsivePopoverCommonCss, datePickerPopoverCss];
	    }
	  }]);

	  function DatePicker() {
	    var _this;

	    __chunk_1._classCallCheck(this, DatePicker);

	    _this = __chunk_1._possibleConstructorReturn(this, __chunk_1._getPrototypeOf(DatePicker).call(this));
	    _this._respPopoverConfig = {
	      allowTargetOverlap: true,
	      stayOpenOnScroll: true,
	      afterClose: function afterClose() {
	        _this._isPickerOpen = false;

	        if (__chunk_10.isPhone()) {
	          // close device's keyboard and prevent further typing
	          _this.blur();
	        } else if (_this._focusInputAfterClose) {
	          _this._getInput().focus();

	          _this._focusInputAfterClose = false;
	        }

	        var calendar = _this.calendar;

	        if (calendar) {
	          calendar._hideMonthPicker();

	          calendar._hideYearPicker();
	        }
	      },
	      afterOpen: function afterOpen() {
	        var calendar = _this.calendar;

	        if (!calendar) {
	          return;
	        }

	        var dayPicker = calendar.shadowRoot.querySelector("#".concat(calendar._id, "-daypicker"));
	        var selectedDay = dayPicker.shadowRoot.querySelector(".ui5-dp-item--selected");
	        var today = dayPicker.shadowRoot.querySelector(".ui5-dp-item--now");
	        var focusableDay = selectedDay || today;

	        if (!selectedDay && (_this.minDate || _this.maxDate) && !_this.isInValidRange(new Date().getTime())) {
	          focusableDay = _this.findFirstFocusableDay(dayPicker);
	        }

	        if (_this._focusInputAfterOpen) {
	          _this._focusInputAfterOpen = false;

	          _this._getInput().focus();
	        } else if (focusableDay) {
	          focusableDay.focus();
	          var focusableDayIdx = parseInt(focusableDay.getAttribute("data-sap-index"));
	          var focusableItem = dayPicker.focusableDays.find(function (item) {
	            return parseInt(item._index) === focusableDayIdx;
	          });
	          focusableDayIdx = focusableItem ? dayPicker.focusableDays.indexOf(focusableItem) : focusableDayIdx;
	          dayPicker._itemNav.current = focusableDayIdx;

	          dayPicker._itemNav.update();
	        }
	      }
	    };
	    _this._calendar = {
	      onSelectedDatesChange: _this._handleCalendarChange.bind(__chunk_1._assertThisInitialized(_this)),
	      selectedDates: []
	    };
	    _this.i18nBundle = __chunk_3.getI18nBundle("@ui5/webcomponents");
	    return _this;
	  }

	  __chunk_1._createClass(DatePicker, [{
	    key: "findFirstFocusableDay",
	    value: function findFirstFocusableDay(daypicker) {
	      var today = new Date();

	      if (!this.isInValidRange(today.getTime())) {
	        var focusableItems = Array.from(daypicker.shadowRoot.querySelectorAll(".ui5-dp-item"));
	        return focusableItems.filter(function (x) {
	          return !x.classList.contains("ui5-dp-item--disabled");
	        })[0];
	      }
	    }
	  }, {
	    key: "onBeforeRendering",
	    value: function onBeforeRendering() {
	      this._calendar.primaryCalendarType = this._primaryCalendarType;
	      this._calendar.formatPattern = this._formatPattern;

	      if (this.minDate && !this.isValid(this.minDate)) {
	        this.minDate = null;
	        console.warn("In order for the \"minDate\" property to have effect, you should enter valid date format"); // eslint-disable-line
	      }

	      if (this.maxDate && !this.isValid(this.maxDate)) {
	        this.maxDate = null;
	        console.warn("In order for the \"maxDate\" property to have effect, you should enter valid date format"); // eslint-disable-line
	      }

	      if (this._checkValueValidity(this.value)) {
	        this._changeCalendarSelection();
	      } else {
	        this._calendar.selectedDates = [];
	      }

	      var FormSupport = __chunk_1.getFeature("FormSupport");

	      if (FormSupport) {
	        FormSupport.syncNativeHiddenInput(this);
	      } else if (this.name) {
	        console.warn("In order for the \"name\" property to have effect, you should also: import \"@ui5/webcomponents/dist/features/InputElementsFormSupport.js\";"); // eslint-disable-line
	      }

	      if (this.minDate) {
	        this._calendar.minDate = this.minDate;
	      }

	      if (this.maxDate) {
	        this._calendar.maxDate = this.maxDate;
	      }
	    }
	  }, {
	    key: "_getTimeStampFromString",
	    value: function _getTimeStampFromString(value) {
	      var jsDate = this.getFormat().parse(value);

	      if (jsDate) {
	        var jsDateTimeNow = Date.UTC(jsDate.getFullYear(), jsDate.getMonth(), jsDate.getDate());
	        var calDate = CalendarDate.fromTimestamp(jsDateTimeNow, this._primaryCalendarType);
	        return calDate.valueOf();
	      }

	      return undefined;
	    }
	  }, {
	    key: "_onkeydown",
	    value: function _onkeydown(event) {
	      if (__chunk_8.isShow(event)) {
	        event.preventDefault(); // Prevent scroll on Alt/Option + Arrow Up/Down

	        if (this.isOpen()) {
	          if (__chunk_8.isF4(event)) {
	            if (this.calendar._monthPicker._hidden) {
	              this.calendar._showYearPicker();
	            }
	          } else {
	            this._toggleAndFocusInput();
	          }
	        } else {
	          this._toggleAndFocusInput();
	        }
	      }
	    }
	  }, {
	    key: "_toggleAndFocusInput",
	    value: function _toggleAndFocusInput() {
	      this.togglePicker();

	      this._getInput().focus();
	    }
	  }, {
	    key: "_getInput",
	    value: function _getInput() {
	      return this.shadowRoot.querySelector("[ui5-input]");
	    }
	  }, {
	    key: "_handleInputChange",
	    value: function () {
	      var _handleInputChange2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee() {
	        var nextValue, emptyValue, isValid;
	        return regeneratorRuntime.wrap(function _callee$(_context) {
	          while (1) {
	            switch (_context.prev = _context.next) {
	              case 0:
	                _context.next = 2;
	                return this._getInput().getInputValue();

	              case 2:
	                nextValue = _context.sent;
	                emptyValue = nextValue === "";
	                isValid = emptyValue || this._checkValueValidity(nextValue);

	                if (isValid) {
	                  nextValue = this.normalizeValue(nextValue);
	                  this.valueState = __chunk_21.ValueState.None;
	                } else {
	                  this.valueState = __chunk_21.ValueState.Error;
	                }

	                this.value = nextValue;
	                this.fireEvent("change", {
	                  value: nextValue,
	                  valid: isValid
	                }); // Angular two way data binding

	                this.fireEvent("value-changed", {
	                  value: nextValue,
	                  valid: isValid
	                });

	              case 9:
	              case "end":
	                return _context.stop();
	            }
	          }
	        }, _callee, this);
	      }));

	      function _handleInputChange() {
	        return _handleInputChange2.apply(this, arguments);
	      }

	      return _handleInputChange;
	    }()
	  }, {
	    key: "_handleInputLiveChange",
	    value: function () {
	      var _handleInputLiveChange2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee2() {
	        var nextValue, emptyValue, isValid;
	        return regeneratorRuntime.wrap(function _callee2$(_context2) {
	          while (1) {
	            switch (_context2.prev = _context2.next) {
	              case 0:
	                _context2.next = 2;
	                return this._getInput().getInputValue();

	              case 2:
	                nextValue = _context2.sent;
	                emptyValue = nextValue === "";
	                isValid = emptyValue || this._checkValueValidity(nextValue);
	                this.value = nextValue;
	                this.fireEvent("input", {
	                  value: nextValue,
	                  valid: isValid
	                });

	              case 7:
	              case "end":
	                return _context2.stop();
	            }
	          }
	        }, _callee2, this);
	      }));

	      function _handleInputLiveChange() {
	        return _handleInputLiveChange2.apply(this, arguments);
	      }

	      return _handleInputLiveChange;
	    }()
	  }, {
	    key: "_checkValueValidity",
	    value: function _checkValueValidity(value) {
	      return this.isValid(value) && this.isInValidRange(this._getTimeStampFromString(value));
	    }
	  }, {
	    key: "_click",
	    value: function _click(event) {
	      if (__chunk_10.isPhone()) {
	        this.responsivePopover.open(this);
	        event.preventDefault(); // prevent immediate selection of any item
	      }
	    }
	    /**
	     * Checks if a value is valid against the current date format of the DatePicker.
	     * @param {string} value A value to be tested against the current date format
	     * @public
	     */

	  }, {
	    key: "isValid",
	    value: function isValid() {
	      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
	      return !!(value && this.getFormat().parse(value));
	    }
	    /**
	     * Checks if a date is in range between minimum and maximum date.
	     * @param {object} value
	     * @public
	     */

	  }, {
	    key: "isInValidRange",
	    value: function isInValidRange() {
	      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

	      if (value === "") {
	        return true;
	      }

	      var pickedDate = new Date(value),
	          minDate = this._minDate && new Date(this._minDate),
	          maxDate = this._maxDate && new Date(this._maxDate);

	      if (minDate && maxDate) {
	        if (minDate <= pickedDate && maxDate >= pickedDate) {
	          return true;
	        }
	      } else if (minDate && !maxDate) {
	        if (minDate <= pickedDate) {
	          return true;
	        }
	      } else if (maxDate && !minDate) {
	        if (maxDate >= pickedDate) {
	          return true;
	        }
	      } else if (!maxDate && !minDate) {
	        return true;
	      }

	      return false;
	    } // because the parser understands more than one format
	    // but we need values in one format

	  }, {
	    key: "normalizeValue",
	    value: function normalizeValue(value) {
	      if (value === "") {
	        return value;
	      }

	      return this.getFormat().format(this.getFormat().parse(value));
	    }
	  }, {
	    key: "getFormat",
	    value: function getFormat() {
	      if (this._isPattern) {
	        this._oDateFormat = DateFormat.getInstance({
	          pattern: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      } else {
	        this._oDateFormat = DateFormat.getInstance({
	          style: this._formatPattern,
	          calendarType: this._primaryCalendarType
	        });
	      }

	      return this._oDateFormat;
	    }
	  }, {
	    key: "_respPopover",
	    value: function () {
	      var _respPopover2 = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee3() {
	        var staticAreaItem;
	        return regeneratorRuntime.wrap(function _callee3$(_context3) {
	          while (1) {
	            switch (_context3.prev = _context3.next) {
	              case 0:
	                _context3.next = 2;
	                return this.getStaticAreaItemDomRef();

	              case 2:
	                staticAreaItem = _context3.sent;
	                return _context3.abrupt("return", staticAreaItem.querySelector("[ui5-responsive-popover]"));

	              case 4:
	              case "end":
	                return _context3.stop();
	            }
	          }
	        }, _callee3, this);
	      }));

	      function _respPopover() {
	        return _respPopover2.apply(this, arguments);
	      }

	      return _respPopover;
	    }()
	  }, {
	    key: "_canOpenPicker",
	    value: function _canOpenPicker() {
	      return !this.disabled && !this.readonly;
	    }
	  }, {
	    key: "_handleCalendarChange",
	    value: function _handleCalendarChange(event) {
	      var iNewValue = event.detail.dates && event.detail.dates[0];

	      if (this._calendar.selectedDates.indexOf(iNewValue) !== -1) {
	        this.closePicker();
	        return false;
	      }

	      var fireChange = this._handleCalendarSelectedDatesChange(event, iNewValue);

	      if (fireChange) {
	        this.fireEvent("change", {
	          value: this.value,
	          valid: true
	        }); // Angular two way data binding

	        this.fireEvent("value-changed", {
	          value: this.value,
	          valid: true
	        });
	      }

	      this.closePicker();
	    }
	  }, {
	    key: "_handleCalendarSelectedDatesChange",
	    value: function _handleCalendarSelectedDatesChange(event, newValue) {
	      this._updateValueCalendarSelectedDatesChange(newValue);

	      this._calendar.timestamp = newValue;
	      this._calendar.selectedDates = event.detail.dates;
	      this._focusInputAfterClose = true;

	      if (this.isInValidRange(this._getTimeStampFromString(this.value))) {
	        this.valueState = __chunk_21.ValueState.None;
	      } else {
	        this.valueState = __chunk_21.ValueState.Error;
	      }

	      return true;
	    }
	  }, {
	    key: "_updateValueCalendarSelectedDatesChange",
	    value: function _updateValueCalendarSelectedDatesChange(newValue) {
	      this.value = this.getFormat().format(new Date(CalendarDate.fromTimestamp(newValue * 1000, this._primaryCalendarType).valueOf()), true);
	    }
	    /**
	     * Formats a Java Script date object into a string representing a locale date
	     * according to the <code>formatPattern</code> property of the DatePicker instance
	     * @param {object} oDate A Java Script date object to be formatted as string
	     * @public
	     */

	  }, {
	    key: "formatValue",
	    value: function formatValue(oDate) {
	      return this.getFormat().format(oDate);
	    }
	    /**
	     * Closes the picker.
	     * @public
	     */

	  }, {
	    key: "closePicker",
	    value: function closePicker() {
	      this.responsivePopover.close();
	    }
	    /**
	     * Opens the picker.
	     * @param {object} options A JSON object with additional configuration.<br>
	     * <code>{ focusInput: true }</code> By default, the focus goes in the picker after opening it.
	     * Specify this option to focus the input field.
	     * @public
	     */

	  }, {
	    key: "openPicker",
	    value: function () {
	      var _openPicker = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee4(options) {
	        return regeneratorRuntime.wrap(function _callee4$(_context4) {
	          while (1) {
	            switch (_context4.prev = _context4.next) {
	              case 0:
	                this._isPickerOpen = true;
	                _context4.next = 3;
	                return this._respPopover();

	              case 3:
	                this.responsivePopover = _context4.sent;

	                this._changeCalendarSelection();

	                if (options && options.focusInput) {
	                  this._focusInputAfterOpen = true;
	                }

	                this.responsivePopover.open(this);

	              case 7:
	              case "end":
	                return _context4.stop();
	            }
	          }
	        }, _callee4, this);
	      }));

	      function openPicker(_x) {
	        return _openPicker.apply(this, arguments);
	      }

	      return openPicker;
	    }()
	  }, {
	    key: "togglePicker",
	    value: function togglePicker() {
	      if (this.isOpen()) {
	        this.closePicker();
	      } else if (this._canOpenPicker()) {
	        this.openPicker();
	      }
	    }
	  }, {
	    key: "_changeCalendarSelection",
	    value: function _changeCalendarSelection(focusTimestamp) {
	      if (this._calendarDate.getYear() < 1) {
	        // 0 is a valid year, but we cannot display it
	        return;
	      }

	      var oCalDate = this._calendarDate;
	      var timestamp = focusTimestamp || oCalDate.valueOf() / 1000;
	      this._calendar = Object.assign({}, this._calendar);
	      this._calendar.timestamp = timestamp;

	      if (this.value) {
	        this._calendar.selectedDates = [timestamp];
	      }
	    }
	    /**
	     * Checks if the picker is open.
	     * @returns {Boolean} true if the picker is open, false otherwise
	     * @public
	     */

	  }, {
	    key: "isOpen",
	    value: function isOpen() {
	      return !!this._isPickerOpen;
	    }
	    /**
	     * Gets some semantic details about an event originated in the control.
	     * @param {*} event An event object
	     * @returns {Object} Semantic details
	     */

	  }, {
	    key: "getSemanticTargetInfo",
	    value: function getSemanticTargetInfo(event) {
	      var oDomTarget = getDomTarget(event);
	      var isInput = false;

	      if (oDomTarget && oDomTarget.className.indexOf("ui5-input-inner") > -1) {
	        isInput = true;
	      }

	      return {
	        isInput: isInput
	      };
	    }
	    /**
	     * Currently selected date represented as JavaScript Date instance.
	     *
	     * @readonly
	     * @type { Date }
	     * @public
	     */

	  }, {
	    key: "validValue",
	    get: function get() {
	      if (this.isValid(this.value)) {
	        return this.value;
	      }

	      return this.getFormat().format(new Date());
	    }
	  }, {
	    key: "calendar",
	    get: function get() {
	      return this.responsivePopover.querySelector("#".concat(this._id, "-calendar"));
	    }
	  }, {
	    key: "_calendarDate",
	    get: function get() {
	      var millisecondsUTC = this.getFormat().parse(this.validValue, true).getTime();
	      var oCalDate = CalendarDate.fromTimestamp(millisecondsUTC - millisecondsUTC % (24 * 60 * 60 * 1000), this._primaryCalendarType);
	      return oCalDate;
	    }
	  }, {
	    key: "_primaryCalendarType",
	    get: function get() {
	      return this.primaryCalendarType || getCalendarType() || LocaleData.getInstance(__chunk_1.getLocale()).getPreferredCalendarType();
	    }
	  }, {
	    key: "_formatPattern",
	    get: function get() {
	      return this.formatPattern || "medium"; // get from config
	    }
	  }, {
	    key: "_isPattern",
	    get: function get() {
	      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
	    }
	  }, {
	    key: "_displayFormat",
	    get: function get() {
	      return this.getFormat().oFormatOptions.pattern;
	    }
	  }, {
	    key: "_placeholder",
	    get: function get() {
	      return this.placeholder !== undefined ? this.placeholder : this._displayFormat;
	    }
	  }, {
	    key: "_headerTitleText",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.INPUT_SUGGESTIONS_TITLE);
	    }
	  }, {
	    key: "phone",
	    get: function get() {
	      return __chunk_10.isPhone();
	    }
	  }, {
	    key: "showHeader",
	    get: function get() {
	      return this.phone;
	    }
	  }, {
	    key: "showFooter",
	    get: function get() {
	      return this.phone;
	    }
	  }, {
	    key: "_isIE",
	    get: function get() {
	      return __chunk_10.isIE();
	    }
	  }, {
	    key: "accInfo",
	    get: function get() {
	      return {
	        "ariaDescribedBy": "".concat(this._id, "-date"),
	        "ariaHasPopup": "true",
	        "ariaAutoComplete": "none",
	        "role": "combobox",
	        "ariaOwns": "".concat(this._id, "-responsive-popover"),
	        "ariaExpanded": this.isOpen(),
	        "ariaDescription": this.dateAriaDescription,
	        "ariaRequired": this.required,
	        "ariaLabel": __chunk_13.getEffectiveAriaLabelText(this)
	      };
	    }
	  }, {
	    key: "_maxDate",
	    get: function get() {
	      if (this.maxDate) {
	        return this._getTimeStampFromString(this.maxDate);
	      }

	      return this.maxDate;
	    }
	  }, {
	    key: "_minDate",
	    get: function get() {
	      if (this.minDate) {
	        return this._getTimeStampFromString(this.minDate);
	      }

	      return this.minDate;
	    }
	  }, {
	    key: "openIconTitle",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.DATEPICKER_OPEN_ICON_TITLE);
	    }
	  }, {
	    key: "openIconName",
	    get: function get() {
	      return "appointment-2";
	    }
	  }, {
	    key: "dateAriaDescription",
	    get: function get() {
	      return this.i18nBundle.getText(__chunk_5.DATEPICKER_DATE_ACC_TEXT);
	    }
	    /**
	     * Defines whether the dialog on mobile should have header
	     * @private
	     */

	  }, {
	    key: "_shouldHideHeader",
	    get: function get() {
	      return false;
	    }
	  }, {
	    key: "dateValue",
	    get: function get() {
	      return this.getFormat().parse(this.value);
	    }
	  }, {
	    key: "styles",
	    get: function get() {
	      return {
	        main: {
	          width: "100%"
	        }
	      };
	    }
	  }, {
	    key: "type",
	    get: function get() {
	      return __chunk_33.InputType.Text;
	    }
	  }], [{
	    key: "onDefine",
	    value: function () {
	      var _onDefine = __chunk_1._asyncToGenerator(
	      /*#__PURE__*/
	      regeneratorRuntime.mark(function _callee5() {
	        return regeneratorRuntime.wrap(function _callee5$(_context5) {
	          while (1) {
	            switch (_context5.prev = _context5.next) {
	              case 0:
	                _context5.next = 2;
	                return Promise.all([__chunk_1.fetchCldr(__chunk_1.getLocale().getLanguage(), __chunk_1.getLocale().getRegion(), __chunk_1.getLocale().getScript()), __chunk_1.fetchI18nBundle("@ui5/webcomponents")]);

	              case 2:
	              case "end":
	                return _context5.stop();
	            }
	          }
	        }, _callee5);
	      }));

	      function onDefine() {
	        return _onDefine.apply(this, arguments);
	      }

	      return onDefine;
	    }()
	  }, {
	    key: "dependencies",
	    get: function get() {
	      return [__chunk_9.Icon, __chunk_25.ResponsivePopover, Calendar, __chunk_33.Input, __chunk_14.Button];
	    }
	  }]);

	  return DatePicker;
	}(__chunk_1.UI5Element);

	var getDomTarget = function getDomTarget(event) {
	  var target, composedPath;

	  if (typeof event.composedPath === "function") {
	    composedPath = event.composedPath();
	  }

	  if (Array.isArray(composedPath) && composedPath.length) {
	    target = composedPath[0];
	  }

	  return target;
	};

	DatePicker.define();

	return DatePicker;

});
//# sourceMappingURL=DatePicker.js.map
