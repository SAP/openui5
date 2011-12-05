package com.sap.ui5.tools.maven;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.CharArrayWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.util.EnumSet;
import java.util.regex.Pattern;

public class SearchReplaceMain {

	// ---- following code is copied from phx.generator.util.IOUtils ----
	
	public static final String ISO_8859_1 = "ISO-8859-1";
	public static final String UTF8 = "UTF-8";

	private static Writer createFileWriter(File target, boolean append,
			String encoding, int bufferSize) throws IOException {
		OutputStream os = new FileOutputStream(target, append);
		Writer w = encoding == null ? new OutputStreamWriter(os)
				: new OutputStreamWriter(os, encoding);
		if (bufferSize < 0)
			return w;
		else if (bufferSize == 0)
			return new BufferedWriter(w);
		else
			return new BufferedWriter(w, bufferSize);
	}

	private static Reader createFileReader(File source, String encoding, int bufferSize) throws IOException {
		return createStreamReader(new FileInputStream(source), encoding, bufferSize);
	}

	private static Reader createStreamReader(InputStream os, String encoding,
			int bufferSize) throws IOException {
		Reader r = encoding == null ? new InputStreamReader(os)
				: new InputStreamReader(os, encoding);
		if (bufferSize < 0)
			return r;
		else if (bufferSize == 0)
			return new BufferedReader(r);
		else
			return new BufferedReader(r, bufferSize);
	}

	private static long copy(Reader in, Writer out, char[] buffer) throws IOException {
		long l = 0;
		int n;
		while ((n = in.read(buffer)) > -1) {
			out.write(buffer, 0, n);
			l += n;
		}
		return l;
	}

	public static CharSequence readFile(File file, String encoding) throws IOException {
		Reader in = createFileReader(file, encoding, -1);
		return read(in, (int) file.length()); // TODO better rounding
	}

	private static CharSequence read(Reader reader, int initialSize) throws IOException {
		CharBuffer out = new CharBuffer(initialSize);
		copy(reader, out, new char[0x4000]);
		return out;
	}

	public static void writeFile(File file, String str, String encoding) throws IOException {
		Writer out = createFileWriter(file, false, encoding, -1);
		out.write(str);
		out.close();
	}

	private static class CharBuffer extends CharArrayWriter implements CharSequence {

		CharBuffer(int length) {
			super(length);
		}

		@Override
		public char charAt(int index) {
			if ((index < 0) || (index >= count))
				throw new StringIndexOutOfBoundsException(index);
			return buf[index];
		}

		@Override
		public int length() {
			return count;
		}

		@Override
		public CharSequence subSequence(int start, int end) {
			if (start < 0)
				throw new StringIndexOutOfBoundsException(start);
			if (end > count)
				throw new StringIndexOutOfBoundsException(end);
			if (start > end)
				throw new StringIndexOutOfBoundsException(end - start);
			return new String(buf, start, end - start);
		}

	}

	// ---- end of code copy ----
	
	private static boolean checkOut(File file) throws IOException, InterruptedException {
		return Runtime.getRuntime().exec("p4.exe -p perforce3003.wdf.sap.corp:3003 edit " + file).waitFor() == 0;
	}

	static Pattern from = Pattern.compile("sap\\.ui(?:\\.getCore\\(\\))?.setRoot\\(([\"'][^'\"]*['\"])\\s*,\\s*([^\\s\\)]+)\\s*\\)\\s*;");
	static String to = "$2.placeAt($1);";

	private static void processFile(File file) throws Exception {

		if ( file.getName().endsWith(".html") || file.getName().endsWith(".js") || file.getName().endsWith(".jsp") ) { 
			
  		String encoding = UTF8;
  		
  
  		CharSequence orig = readFile(file, encoding);
  		CharSequence s = orig;
    
  		s = from.matcher(s).replaceAll(to);
  		if (s != orig) {
  			String str = (String) s;
  			if (!str.contentEquals(orig)) {
  				System.out.println("  Processing file: \"" + file + "\" ");
  				if (!file.canWrite()) {
  					System.out.print("    P4 checkout: ");
  					System.out.println(checkOut(file) ? "SUCCESS" : "ERROR");
  				}
  				if (file.canWrite()) {
  					writeFile(file, str, encoding);
  				} else {
  					System.out.println("couldn't write chnages");
  				}
  			}
  		}
		}
	}

	private static void scan(File dir) throws Exception {
		// skip target folders in maven projects (just a heuristic)
		if ( dir.getName().equals("target") && new File(dir.getParentFile(), "pom.xml").exists() ) 
			return;
		File[] files = dir.listFiles();
		if (files != null) {
			for (File file : files) {
				if (file.isDirectory())
					scan(file);
				else
					processFile(file);
			}
		}
	}

	/**
	 * @param args
	 */
	public static void main(String[] args) throws Exception {
		if (args.length < 1) {
			throw new RuntimeException(
					"usage: <root-dir> ");
		}

		File root = new File(args[0]).getCanonicalFile();

		if (!root.isDirectory()) {
			throw new RuntimeException(
					"root dir must be specified and must be an existing directory");
		}

		
		System.out.println();
		System.out.println("Scanning directory \"" + root + "\"");
		scan(root);
	}

}
