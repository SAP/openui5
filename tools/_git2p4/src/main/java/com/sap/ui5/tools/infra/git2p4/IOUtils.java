package com.sap.ui5.tools.infra.git2p4;

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
import java.util.Arrays;

public class IOUtils {

  public static final String US_ASCII   = "US-ASCII";
  public static final String ISO_8859_1 = "ISO-8859-1";
  public static final String UTF8       = "UTF-8";

  public static Writer createFileWriter(File target, boolean append, String encoding, int bufferSize) throws IOException {
    OutputStream os = new FileOutputStream(target, append);

    OutputStreamWriter w = encoding == null ? new OutputStreamWriter(os) : new OutputStreamWriter(os, encoding);
    if ( bufferSize < 0 )
      return w;
    else if ( bufferSize == 0 )
      return new BufferedWriter(w);
    else
      return new BufferedWriter(w, bufferSize);
  }

  public static Reader createFileReader(File source, String encoding, int bufferSize) throws IOException {
    return createStreamReader(new FileInputStream(source), encoding, bufferSize);
  }

  public static Reader createStreamReader(InputStream os, String encoding, int bufferSize) throws IOException {
    Reader r = encoding == null ? new InputStreamReader(os) : new InputStreamReader(os, encoding);
    if ( bufferSize < 0 )
      return r;
    else if ( bufferSize == 0 )
      return new BufferedReader(r);
    else
      return new BufferedReader(r, bufferSize);
  }

  public static long copy(Reader in, Writer out) throws IOException {
    return copy(in, out, new char[0x4000]);
  }

  public static long copy(Reader in, Writer out, char[] buffer) throws IOException {
    long l = 0;
    int n;
    while ((n = in.read(buffer)) > -1) {
      out.write(buffer, 0, n);
      l+=n;
    }
    return l;
  }

  public static CharSequence readFile(File file, String encoding) throws IOException {
    Reader in = createFileReader(file, encoding, -1);
    return read(in, (int) file.length()); // TODO better rounding
  }

  public static CharSequence readStream(InputStream stream) throws IOException {
    Reader in = createStreamReader(stream, null, -1);
    return read(in, 0x10000); // TODO better guess or param?
  }

  public static CharSequence read(Reader reader, int initialSize) throws IOException {
    CharBuffer out = new CharBuffer(initialSize);
    copy(reader, out, new char[0x4000]);
    reader.close();
    return out;
  }

  public static void writeFile(File file, String encoding, CharSequence str) throws IOException {
    Writer out = createFileWriter(file, false, encoding, -1);
    out.append(str);
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

  public static void copy(InputStream is, OutputStream os) throws IOException {
    copy(is, os, false);
  }

  public static void copy(InputStream is, OutputStream os, byte[] buffer, boolean close) throws IOException {
    while ( true ) {
      int n = is.read(buffer);
      if ( n < 0 ) break;
      os.write(buffer, 0, n);
    }
    if ( close ) {
      is.close();
      os.close();
    }
  }

  public static void copy(InputStream is, OutputStream os, boolean close) throws IOException {
    copy(is, os, new byte[0x10000], close);
  }

  public static void copy(File a, File b, byte[] buffer) throws IOException {
    if ( !b.getParentFile().exists() ) {
      b.getParentFile().mkdirs();
    }
    FileInputStream fis = new FileInputStream(a);
    FileOutputStream fos = new FileOutputStream(b);
    copy(fis, fos, buffer, true);
  }

  public static void copy(File a, File b) throws IOException {
    if ( !b.getParentFile().exists() ) {
      b.getParentFile().mkdirs();
    }
    FileInputStream fis = new FileInputStream(a);
    FileOutputStream fos = new FileOutputStream(b);
    copy(fis, fos, true);
  }

  public static void sync(File a, File b) throws IOException {
    byte[] buffer1 = new byte[0x10000];
    byte[] buffer2 = new byte[0x10000];
    boolean equal=b.canRead() && a.length() == b.length();
    if ( equal ) {
      FileInputStream fiSource = new FileInputStream(a);
      FileInputStream fiTarget = new FileInputStream(b);
      while ( true ) {
        int n1 = fiSource.read(buffer1);
        int n2 = fiTarget.read(buffer2);
        if ( n1 != n2 ) {
          equal = false;
          break;
        }
        if ( n1 < buffer1.length ) {
          Arrays.fill(buffer1, n1, buffer1.length, (byte) 0);
          Arrays.fill(buffer2, n2, buffer2.length, (byte) 0);
        }
        if ( !Arrays.equals(buffer1,  buffer2) ) {
          equal = false;
        } break;
      }
      fiSource.close();
      fiTarget.close();
    }
    if ( !equal ) {
      buffer1 = null;
      buffer2 = null;
      copy(a,b);
    }
  }

}
