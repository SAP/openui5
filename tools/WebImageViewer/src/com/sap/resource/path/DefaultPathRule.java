package com.sap.resource.path;

import java.io.File;

import com.sap.utils.StringUtils;

public class DefaultPathRule implements PathRule {
	
	private String rootUrl;
	
	public static final int CONTROL_FOLDER_DEPTH_FROM_ROOT = 7;
	
	public static final int IMAGE_FOLDER_DEPTH_FROM_PLATFORM = 7;
	
	public static final int RTL_FOLDER_DEPTH_FROM_ROOT = 4;
	
	public static final int CONTROL_FOLDER_DEPTH_FROM_RTL = 3;
	
	public static final int CONTROL_FOLDER_DEPTH_FROM_MODULE = 2;
	
	public static final String DIFF_IMAGE_SUFFIX = "-diff";
	
	private String defaultSeparator;
	
	public DefaultPathRule(String url) {
		this.rootUrl = url;
		this.defaultSeparator = File.separator;
	}
	
	public DefaultPathRule(String url, String pathSeparator) {
		this.rootUrl = url;
		this.defaultSeparator = pathSeparator;
	}
	
	
	/**
	 * 
	 * @param path
	 * @return
	 */
	public String getPlatformByPath(String path) {
		String[] pathArray = splitPathWithoutRootPath(path);
		if (pathArray.length < 1) {
			throw new RuntimeException("Get platform appear exception, the path [" + path + "]");
		}
		return pathArray[0];
	}
	
	public String getBrowserByPath(String path) {
		String[] pathArray = splitPathWithoutRootPath(path);
		if (pathArray.length < 2) {
			throw new RuntimeException("Get browser appear exception, the path [" + path + "]");
		}
		return pathArray[1];
	}

	public String getThemeByPath(String path) {
		String[] pathArray = splitPathWithoutRootPath(path);
		if (pathArray.length < 3) {
			throw new RuntimeException("Get theme appear exception, the path [" + path + "]");
		}
		return pathArray[2];
	}

	public String getRtlByPath(String path) {
		String[] pathArray = splitPathWithoutRootPath(path);
		if (pathArray.length < 4) {
			throw new RuntimeException("Get rtl appear exception, the path [" + path + "]");
		}
		return pathArray[3];
	}
	
	public String getCategoryByPath(String path) {
		String[] pathArray = splitPathWithoutRootPath(path);
		if (pathArray.length < 5) {
			throw new RuntimeException("Get category appear exception, the path [" + path + "]");
		}
		return pathArray[4];
	}
	
	public String getModuleNameByPath(String path) {
		String[] pathArray = splitPathWithoutRootPath(path);
		if (pathArray.length < 6) {
			throw new RuntimeException("Get module appear exception, the path [" + path + "]");
		}
		return pathArray[5];
	}
	
	public String getControlNameByPath(String path) {
		String[] pathArray = splitPathWithoutRootPath(path);
		if (pathArray.length < 7) {
			throw new RuntimeException("Get control appear exception, the path [" + path + "]");
		}
		return pathArray[6];
	}
	
	public String getJobNameByPath(String path) {
		String[] pathArray = splitPathWithoutRootPath(path);
		if (pathArray.length <= 5) {
			throw new RuntimeException("Get job name appear exception, the path [" + path + "]");
		}
		return StringUtils.combinedString(defaultSeparator, pathArray[0], pathArray[1], pathArray[2], pathArray[3]);
	}
	
	public String getExceptedImageName(String diffImageName) {
		int dotIndex = diffImageName.indexOf(".");
		String suffix = diffImageName.substring(dotIndex);
		String name = diffImageName.substring(0, dotIndex - DIFF_IMAGE_SUFFIX.length()); 
		return name + suffix;
	}
	
	public String getDiffImageByExpectedImageName(String expectedImageName) {
		int dotIndex = expectedImageName.indexOf(".");
		String suffix = expectedImageName.substring(dotIndex);
		String name = expectedImageName.substring(0, dotIndex) + DIFF_IMAGE_SUFFIX; 
		return name + suffix;
	}
	
	@Override
    public int getImageFolderDepthFromPlatform() {
        return IMAGE_FOLDER_DEPTH_FROM_PLATFORM;
    }
	
	private String[] splitPathWithoutRootPath(String path) {
		rootUrl = StringUtils.formatterFilePath(rootUrl);
		if (path.contains(rootUrl)) {
			path = path.substring(rootUrl.length());
		}
		return path.split("\\" + defaultSeparator);
	}


	public String getDefaultSeparator() {
		return defaultSeparator;
	}


	public void setDefaultSeparator(String defaultSeparator) {
		this.defaultSeparator = defaultSeparator;
	}
}
