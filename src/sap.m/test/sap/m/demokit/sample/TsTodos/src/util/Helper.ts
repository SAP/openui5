const Helper = {
	resolvePath: function(imgPath: string): string {
		const rootPath = (sap as any).ui.require.toUrl("sap/m/sample/TsTodos/webapp");
		return rootPath + imgPath;
	}
};

export default Helper;
