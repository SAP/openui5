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

}
