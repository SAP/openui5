package com.sap.ui5.webviewer.utils;

import java.io.File;

public class StringUtils {

	public static String formatterFilePath(String path) {
		if (path != null && path.contains("/")) {
			path = path.replaceAll("\\/", "\\" + File.separator);
		}
		path = formatterSlash(path, File.separator);
		return formatterFilePath(path, File.separator);
	}

	public static String formatterSlash(String path, String newSeparator) {
		if (path != null && path.contains("/")) {
			path = path.replaceAll("\\/", "\\" + newSeparator);
		}
		return path;
	}

	public static String formatterFilePath(String path, String separator) {
		if (!"".equals(path) && !path.endsWith(separator)) {
			path += separator;
		}
		return path;
	}

	public static String combinedResourcePath(String separator, String... params) {
		StringBuilder builder = new StringBuilder();
		for (String param : params) {
			builder.append(param).append(separator);
		}
		return builder.toString();
	}

	public static String combinedString(String separator, String... params) {
		StringBuilder builder = new StringBuilder();
		for (String param : params) {
			builder.append(param).append(separator);
		}
		String reslut = "";
		if (builder.length() > 0) {
			reslut = builder.substring(0, builder.length() - 1);
		}
		return reslut;
	}

	public static String deleteStartChars(String source, String chars) {
		if (source.contains(chars)) {
			source = source.substring(chars.length(), source.length() - 1);
		}
		return source;
	}

	public static String formatterUrl(String url) {
		if (!"".equals(url) && !url.endsWith("\\/")) {
			url += "/";
		}
		return url;
	}
}
