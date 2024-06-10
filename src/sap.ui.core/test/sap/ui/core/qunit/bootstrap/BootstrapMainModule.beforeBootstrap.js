(() => {
	"use strict";
	window["initModuleLoaded"] = new Promise((res, rej) => {
		window["initModuleResolve"] = res;
	});
})();
