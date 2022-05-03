sap.ui["define"]("sap/ui/core/CommandExecution", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/ExtensionPoint", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/Shortcut", [], function() { return function() {}; });
// sap.ui["define"]("sap/ui/performance/trace/Interaction", [], function() {
// 	return {
// 		notifyAsyncStep: function() { return function(){};},
// 		setStepComponent: function() {},
// 		notifyStepStart: function() {},
// 		getActive: function() {return false;}
// 	};
// });
sap.ui["define"]("sap/ui/performance/trace/Measurement", [], function() { return function() {}; });
sap.ui["define"]("sap/base/util/array/diff", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/BusyIndicatorUtils", [], function() { return function() {}; });
sap.ui["define"]("jquery.sap.stubs", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/ResizeHandler", [], function() {
	var fnRH = function() {};
	fnRH.deregisterAllForControl = function() { };
	return fnRH
});
sap.ui["define"]("sap/ui/core/IntervalTrigger", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/EventBus", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/core/LocaleData", [], function() { return undefined; });

sap.ui["define"]("sap/ui/thirdparty/jquery-mobile-custom", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/thirdparty/jquery-compat", [], function() { return function() {}; });
sap.ui["define"]("sap/ui/thirdparty/jquery", ["sap/ui/base/Object"], function(BaseObject) {
	var jQuery = function(o) {
		var match = typeof (o) === 'string' && o.match(/<([^\s>]+)(\s|>)+/);
		if (typeof o === "function") {
			if (!document.body) {
				document.addEventListener("DOMContentLoaded", o);
			} else {
				setTimeout(o);
			}
		} else if (match && match[1]) {
			var o = document.createElement(match[1]);
			return jQuery(o);
		} else if (o instanceof HTMLElement) {
			return (function(element) {
				var aO = [element];
					aO.attr = function(key, value) {
						if (arguments.length == 1) {
							return element.getAttribute(key);
						} else {
							element.setAttribute(key, value);
							return this;
						}
					};
					aO.bind = function(eventTypes, handler) {
						if (eventTypes) {
							eventTypes.split(" ").forEach(function(type) {
								element.addEventListener(type, function(event) {
									handler(jQuery.Event(event));
								});
							});
						}
					};
					aO.offset = function() {
						return {};
					};
					aO.children = function() {
						return {
							each: function() {}
						};
					};
					aO.append = function(content) {
						element.innerHTML = content;
					};
					aO.control = function(index) {
						var control = element.closest("[data-sap-ui]");
						if (control) {
							return sap.ui.getCore().byId(control.id);
						}
					};
					aO.replaceWith = function() {};
					aO.on = function(type, fn) {
						type.split(" ").forEach(function(t) {
							element.addEventListener(t, function(event) {
								fn(jQuery.Event(event));
							});
						});
						return this;
					};
					aO.off = function(type, fn) {
						type.split(" ").forEach(function(t) {
							element.remove(t, function(event) {
								fn(jQuery.Event(event));
							});
						});
						return this;
					};
					aO.remove = function() {return this;};
					aO.css = function() {return this;};
					aO.get = function() {return document.body;};
					aO.is = function() {return false;};
					aO.prependTo = function(target) {target.insertBefore( aO[0], target.firstChild );}
					return aO;

			}(o));
		} else if (o instanceof HTMLDocument) {
			return (function(element) {
				return {
					children: function() {
						return {
							length: 0,
							each: function() {}
						};
					},
					replaceWith: function() {},
					on: function(type, fn) {
						type.split(" ").forEach(function(t) {
							document.addEventListener(t, function(event) {
								fn(jQuery.Event(event));
							});
						});
						return this;
					},
					closest: function() {
						return {
							attr:function() {}
						}
					},
					css:function() {return this;},
					prependTo:function() {}
				}
			}(o));
		} else {
			return {
				children: function() {
					return {
						length: 0,
						each: function() {}
					};
				},
				replaceWith: function() {},
				on: function(type, fn) {
					type.split(" ").forEach(function(t) {
						document.addEventListener(t, function(event) {
							fn(jQuery.Event(event));
						});
					});
					return this;
				},
				off: function(type, fn) {
					type.split(" ").forEach(function(t) {
						document.removeEventListener(t, fn);
					});
					return this;
				},
				closest: function() {
					return {
						attr:function() {}
					}
				},
				css:function() {return this;},
				prependTo:function() {},
				each:function() {},
				parents:function(elem) {
					return {
						hasClass:function() {return false;}
					};
				},
				html: function() {

				},
				attr: function(key, value) {
					return this;
				},
				append: function() {return this;},
				data: function() {return false;}

			}
		}
	};
	jQuery.extend = function(o1, o2, o3) {
		return Object.assign.apply(window, arguments);
	};
	jQuery.Event = function(event) {
		return {
			isPropagationStopped: function() { return false; },
			isImmediatePropagationStopped: function() { return false; },
			isImmediateHandlerPropagationStopped: function() { return false; },
			isMarked: function() { return false; },
			getMark: function() { return; },
			setMark: function() { },
			setMarked: function() { },
			target: typeof (event) === "string" ? undefined : event.target,
			type: typeof (event) === "string" ? event : event.type
		};
	};
	jQuery.expr = {
		pseudos: {}
	},
	jQuery.support = {}
	jQuery.fx = {

	}
	jQuery.proxy = function(fn, c) {
		return fn.bind(c);
	}
	jQuery.event = {
		special: function() {},
		fix: function() {
			return  {};
		}
	}
	jQuery.isEmptyObject = function(o) {
		return Object.keys(o).length == 0;
	}
	jQuery.Deferred = function() {
		var that = this;
		this.promise = new Promise(function(resolve, reject) {
			that.resolve = resolve;
			that.reject = reject;
		});
		this.then = function() {
			return this.promise.then.apply(this.promise, arguments);
		}.bind(this);
	};
	jQuery.ajax = function(opts) {

		var xhr = new XMLHttpRequest();
		xhr.open('GET', opts.url);
		xhr.onload = function() {
			if (xhr.status === 200) {
				var convert = jQuery.ajaxSettings.converters["text " + opts.dataType];
				opts.success(convert(xhr.responseText));
			}
			else {
				opts.error(xhr.responseText);
			}
		};
		xhr.send();
	};
	jQuery.ajaxSettings = {
		converters: {
			"text xml": function(v) {
				var parser = new DOMParser();
				return parser.parseFromString(v,"text/xml");
			},
			"text json": function(v) {
				return JSON.parse(v);
			},
			"text html": function(v) {
				return v;
			},
			"text text": function(v) {
				return v;
			}
		}
	};
	jQuery.each = function(o, fn) {
		Object.keys(o).forEach(function(v) {
			fn(v, o[v]);
		});
	}
	jQuery.fn = {};
	window.$ = window.jQuery = jQuery;
	return jQuery;
});
sap.ui.loader.config({
	paths: {"sap/ui/demo/todo": "./"},
	bundlesUI5: {
		"FESR.js":["sap/ui/performance/trace/FESR.js"]
	}
});
sap.ui.require([
	"sap/ui/core/Core"
], function(Core) {
	"use strict";
		Core.boot();
		sap.ui.require([
			"sap/ui/core/ComponentContainer"
		], function(ComponentContainer) {
			// oPH = new Placeholder({
			// 	html:"sap/ui/demo/todo/view/ph.fragment.html"
			// })
			Core.attachInit(function() {
				new ComponentContainer({
					id: "compCont",
					name: "sap.ui.demo.todo",
					async: true,
					manifest: true
				}).placeAt("content");
				// oCompCont.showPlaceholder({placeholder: oPH});
			});
		},function(oError) {console.log(oError);});
},function(oError) {console.log(oError);});
