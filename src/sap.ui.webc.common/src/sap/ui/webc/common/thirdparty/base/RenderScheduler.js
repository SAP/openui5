sap.ui.define(['./Render'], function (Render) { 'use strict';

	class RenderScheduler {
		static async renderDeferred(webComponent) {
			console.log("RenderScheduler.renderDeferred is deprecated, please use renderDeferred, exported by Render.js instead");
			await Render.renderDeferred(webComponent);
		}
		static renderImmediately(webComponent) {
			console.log("RenderScheduler.renderImmediately is deprecated, please use renderImmediately, exported by Render.js instead");
			return Render.renderImmediately(webComponent);
		}
		static async whenFinished() {
			console.log("RenderScheduler.whenFinished is deprecated, please use renderFinished, exported by Render.js instead");
			await Render.renderFinished();
		}
	}

	return RenderScheduler;

});
