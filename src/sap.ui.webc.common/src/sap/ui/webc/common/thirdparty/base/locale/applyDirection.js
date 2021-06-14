sap.ui.define(['../Render', './directionChange'], function (Render, directionChange) { 'use strict';

	const applyDirection = async () => {
		const listenersResults = directionChange.fireDirectionChange();
		await Promise.all(listenersResults);
		await Render.reRenderAllUI5Elements({ rtlAware: true });
	};

	return applyDirection;

});
