const Helper = {
	resolvePath: function(imgPath: string): string {
		const rootPath = (jQuery as any).sap.getModulePath("sap.m.sample.TsTodos.webapp");
		return rootPath + imgPath;
	}
};

export default Helper;
