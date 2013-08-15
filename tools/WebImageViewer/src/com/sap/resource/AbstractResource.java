package com.sap.resource;

import com.sap.resource.path.PathRule;

public abstract class AbstractResource implements Resource {

	protected PathRule rule;

	@Override
	public String getPlatformByCurrentPath(String path) {
		return rule.getPlatformByPath(path);
	}

	@Override
	public String getBrowserByCurrentPath(String path) {
		return rule.getBrowserByPath(path);
	}

	@Override
	public String getThemeByCurrentPath(String path) {
		return rule.getThemeByPath(path);
	}

	@Override
	public String getRtlByCurrentPath(String path) {
		return rule.getRtlByPath(path);
	}

	@Override
	public String getCategoryByCurrentPath(String path) {
		return rule.getCategoryByPath(path);
	}

	@Override
	public String getModuleNameByCurrentPath(String path) {
		return rule.getModuleNameByPath(path);
	}

	@Override
	public String getControlNameByCurrentPath(String path) {
		return rule.getControlNameByPath(path);
	}

	@Override
	public String getJobNameByCurrentPath(String path) {
		return rule.getJobNameByPath(path);
	}

	@Override
	public String getDiffImage(String expectedImageName) {
		return rule.getDiffImageByExpectedImageName(expectedImageName);
	}

	@Override
	public int getImageFolderDepthFromPlatform() {
		return rule.getImageFolderDepthFromPlatform();
	}

	public PathRule getRule() {
		return rule;
	}

	public void setRule(PathRule rule) {
		this.rule = rule;
	}
}
