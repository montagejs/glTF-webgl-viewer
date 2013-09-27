// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
try {
  this['Module'] = Module;
  Module.test;
} catch(e) {
  this['Module'] = Module = {};
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (typeof module === "object") {
  module.exports = Module;
}
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  if (!Module['arguments']) {
    Module['arguments'] = process['argv'].slice(2);
  }
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (!Module['arguments']) {
    if (typeof scriptArgs != 'undefined') {
      Module['arguments'] = scriptArgs;
    } else if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  if (!Module['print']) {
    Module['print'] = function(x) {
      console.log(x);
    };
  }
  if (!Module['printErr']) {
    Module['printErr'] = function(x) {
      console.log(x);
    };
  }
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (!Module['arguments']) {
    if (typeof arguments != 'undefined') {
      Module['arguments'] = arguments;
    }
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  if (!Module['print']) {
    Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
if (!Module['preRun']) Module['preRun'] = [];
if (!Module['postRun']) Module['postRun'] = [];
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    type.flatIndexes = type.fields.map(function(field) {
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        size = Types.types[field].flatSize;
        alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      return FUNCTION_TABLE[ptr].apply(null, args);
    } else {
      return FUNCTION_TABLE[ptr]();
    }
  },
  addFunction: function (func) {
    var table = FUNCTION_TABLE;
    var ret = table.length;
    table.push(func);
    table.push(0);
    return ret;
  },
  removeFunction: function (index) {
    var table = FUNCTION_TABLE;
    table[index] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? (((low)>>>(0))+(((high)>>>(0))*4294967296)) : (((low)>>>(0))+(((high)|(0))*4294967296))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var setjmpId = 1; // Used in setjmp/longjmp
var setjmpLabels = {};
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function abort(text) {
  Module.print(text + ':\n' + (new Error).stack);
  ABORT = true;
  throw "Assertion: " + text;
}
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = globalScope['Module']['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,Math.min(Math.floor((value)/4294967296), 4294967295)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 67108864;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATINIT__ = []; // functions called during startup
var __ATMAIN__ = []; // functions called when main() is to be run
var __ATEXIT__ = []; // functions called during shutdown
var runtimeInitialized = false;
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function addPreRun(func) {
  if (!Module['preRun']) Module['preRun'] = [];
  else if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
  Module['preRun'].push(func);
}
var awaitingMemoryInitializer = false;
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
    runPostSets();
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
  awaitingMemoryInitializer = false;
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 19296;
var _stdout;
var _stdin;
var _stderr;
__ATINIT__ = __ATINIT__.concat([
  { func: function() { __GLOBAL__I_a() } },
  { func: function() { __GLOBAL__I_a108() } },
  { func: function() { __GLOBAL__I_a154() } }
]);
var ___fsmu8;
var ___dso_handle;
var __ZTVN10__cxxabiv120__si_class_type_infoE;
var __ZTVN10__cxxabiv117__class_type_infoE;
var __ZTIt;
var __ZTIs;
var __ZTIm;
var __ZTIl;
var __ZTIj;
var __ZTIi;
var __ZTIh;
var __ZTIf;
var __ZTId;
var __ZTIc;
var __ZTIa;
var _stdout = _stdout=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stdin = _stdin=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv120__si_class_type_infoE=allocate([0,0,0,0,40,69,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTVN10__cxxabiv117__class_type_infoE=allocate([0,0,0,0,56,69,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIt=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIs=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIm=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIl=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIj=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIi=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIh=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIf=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTId=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIc=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
__ZTIa=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([0,0,0,0,0,0,36,64,0,0,0,0,0,0,89,64,0,0,0,0,0,136,195,64,0,0,0,0,132,215,151,65,0,128,224,55,121,195,65,67,23,110,5,181,181,184,147,70,245,249,63,233,3,79,56,77,50,29,48,249,72,119,130,90,60,191,115,127,221,79,21,117,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,204,2,0,0,0,0,0,0,108,111,110,103,0,0,0,0,74,117,108,0,0,0,0,0,74,117,110,0,0,0,0,0,65,112,114,0,0,0,0,0,77,97,114,0,0,0,0,0,70,101,98,0,0,0,0,0,74,97,110,0,0,0,0,0,68,101,99,101,109,98,101,114,0,0,0,0,0,0,0,0,78,111,118,101,109,98,101,114,0,0,0,0,0,0,0,0,117,110,115,117,112,112,111,114,116,101,100,32,108,111,99,97,108,101,32,102,111,114,32,115,116,97,110,100,97,114,100,32,105,110,112,117,116,0,0,0,79,99,116,111,98,101,114,0,83,101,112,116,101,109,98,101,114,0,0,0,0,0,0,0,117,110,115,105,103,110,101,100,32,105,110,116,0,0,0,0,65,117,103,117,115,116,0,0,118,111,105,100,0,0,0,0,74,117,108,121,0,0,0,0,74,117,110,101,0,0,0,0,77,97,121,0,0,0,0,0,65,112,114,105,108,0,0,0,77,97,114,99,104,0,0,0,98,97,115,105,99,95,115,116,114,105,110,103,0,0,0,0,70,101,98,114,117,97,114,121,0,0,0,0,0,0,0,0,74,97,110,117,97,114,121,0,68,0,0,0,101,0,0,0,99,0,0,0,0,0,0,0,105,110,116,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,0,0,0,0,47,85,115,101,114,115,47,102,97,98,114,105,99,101,114,111,98,105,110,101,116,47,83,105,116,101,115,47,84,69,83,84,47,114,101,115,116,51,100,47,115,101,114,118,101,114,47,111,51,100,103,99,47,115,114,99,47,111,51,100,103,99,95,99,111,109,109,111,110,95,108,105,98,47,105,110,99,47,111,51,100,103,99,86,101,99,116,111,114,46,104,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,0,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,0,0,0,0,117,110,115,105,103,110,101,100,32,115,104,111,114,116,0,0,74,0,0,0,97,0,0,0,110,0,0,0,0,0,0,0,68,0,0,0,101,0,0,0,99,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,78,0,0,0,111,0,0,0,118,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,0,0,0,0,79,0,0,0,99,0,0,0,116,0,0,0,111,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,83,0,0,0,101,0,0,0,112,0,0,0,116,0,0,0,101,0,0,0,109,0,0,0,98,0,0,0,101,0,0,0,114,0,0,0,0,0,0,0,65,0,0,0,117,0,0,0,103,0,0,0,117,0,0,0,115,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,108,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,117,0,0,0,110,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,112,0,0,0,114,0,0,0,105,0,0,0,108,0,0,0,0,0,0,0,97,32,60,32,79,51,68,71,67,95,83,67,51,68,77,67,95,77,65,88,95,78,85,77,95,73,78,84,95,65,84,84,82,73,66,85,84,69,83,0,115,104,111,114,116,0,0,0,77,0,0,0,97,0,0,0,114,0,0,0,99,0,0,0,104,0,0,0,0,0,0,0,70,0,0,0,101,0,0,0,98,0,0,0,114,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,74,0,0,0,97,0,0,0,110,0,0,0,117,0,0,0,97,0,0,0,114,0,0,0,121,0,0,0,0,0,0,0,80,77,0,0,0,0,0,0,99,97,110,110,111,116,32,115,116,97,114,116,32,100,101,99,111,100,101,114,0,0,0,0,65,77,0,0,0,0,0,0,80,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,65,0,0,0,77,0,0,0,0,0,0,0,0,0,0,0,47,85,115,101,114,115,47,102,97,98,114,105,99,101,114,111,98,105,110,101,116,47,83,105,116,101,115,47,84,69,83,84,47,114,101,115,116,51,100,47,115,101,114,118,101,114,47,111,51,100,103,99,47,115,114,99,47,111,51,100,103,99,95,99,111,109,109,111,110,95,108,105,98,47,105,110,99,47,111,51,100,103,99,73,110,100,101,120,101,100,70,97,99,101,83,101,116,46,104,0,0,0,0,0,117,110,115,105,103,110,101,100,32,99,104,97,114,0,0,0,112,111,115,105,116,105,111,110,32,60,32,109,95,115,116,114,101,97,109,46,71,101,116,83,105,122,101,40,41,32,45,32,79,51,68,71,67,95,66,73,78,65,82,89,95,83,84,82,69,65,77,95,78,85,77,95,83,89,77,66,79,76,83,95,85,73,78,84,51,50,0,0,110,111,32,99,111,100,101,32,98,117,102,102,101,114,32,115,101,116,0,0,0,0,0,0,105,116,101,114,97,116,111,114,32,60,32,109,95,116,114,105,97,110,103,108,101,115,79,114,100,101,114,46,71,101,116,83,105,122,101,40,41,0,0,0,115,105,103,110,101,100,32,99,104,97,114,0,0,0,0,0,108,111,99,97,108,101,32,110,111,116,32,115,117,112,112,111,114,116,101,100,0,0,0,0,105,110,118,97,108,105,100,32,99,111,100,101,99,32,98,117,102,102,101,114,32,115,105,122,101,0,0,0,0,0,0,0,112,111,115,105,116,105,111,110,32,60,32,109,95,115,116,114,101,97,109,46,71,101,116,83,105,122,101,40,41,32,45,32,52,0,0,0,0,0,0,0,115,105,122,101,32,60,61,32,109,95,97,108,108,111,99,97,116,101,100,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,110,117,109,70,108,111,97,116,65,116,116,114,105,98,117,116,101,115,32,60,32,79,51,68,71,67,95,83,67,51,68,77,67,95,77,65,88,95,78,85,77,95,70,76,79,65,84,95,65,84,84,82,73,66,85,84,69,83,0,0,0,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,110,117,109,73,110,116,65,116,116,114,105,98,117,116,101,115,32,60,32,79,51,68,71,67,95,83,67,51,68,77,67,95,77,65,88,95,78,85,77,95,73,78,84,95,65,84,84,82,73,66,85,84,69,83,0,0,37,0,0,0,97,0,0,0,32,0,0,0,37,0,0,0,98,0,0,0,32,0,0,0,37,0,0,0,100,0,0,0,32,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,89,0,0,0,0,0,0,0,0,0,0,0,100,105,109,32,60,32,79,51,68,71,67,95,83,67,51,68,77,67,95,77,65,88,95,68,73,77,95,70,76,79,65,84,95,65,84,84,82,73,66,85,84,69,83,0,0,0,0,0,37,97,32,37,98,32,37,100,32,37,72,58,37,77,58,37,83,32,37,89,0,0,0,0,118,101,114,116,105,99,101,115,83,105,122,101,32,62,32,48,0,0,0,0,0,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,0,0,0,0,0,0,0,0,115,105,122,101,84,70,65,78,32,62,32,48,0,0,0,0,115,116,100,58,58,98,97,100,95,97,108,108,111,99,0,0,110,117,109,84,114,105,97,110,103,108,101,115,32,62,32,48,0,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,110,117,109,86,101,114,116,105,99,101,115,32,62,32,48,0,105,116,101,114,97,116,111,114,32,60,32,109,95,110,117,109,84,70,65,78,115,46,71,101,116,83,105,122,101,40,41,0,47,85,115,101,114,115,47,102,97,98,114,105,99,101,114,111,98,105,110,101,116,47,83,105,116,101,115,47,84,69,83,84,47,114,101,115,116,51,100,47,115,101,114,118,101,114,47,111,51,100,103,99,47,115,114,99,47,111,51,100,103,99,95,99,111,109,109,111,110,95,108,105,98,47,105,110,99,47,111,51,100,103,99,84,114,105,97,110,103,108,101,70,97,110,115,46,104,0,0,0,0,0,0,0,99,104,97,114,0,0,0,0,105,116,101,114,97,116,111,114,32,60,32,109,95,100,101,103,114,101,101,115,46,71,101,116,83,105,122,101,40,41,0,0,102,0,0,0,97,0,0,0,108,0,0,0,115,0,0,0,101,0,0,0,0,0,0,0,47,85,115,101,114,115,47,102,97,98,114,105,99,101,114,111,98,105,110,101,116,47,83,105,116,101,115,47,84,69,83,84,47,114,101,115,116,51,100,47,115,101,114,118,101,114,47,111,51,100,103,99,47,115,114,99,47,111,51,100,103,99,95,99,111,109,109,111,110,95,108,105,98,47,105,110,99,47,111,51,100,103,99,66,105,110,97,114,121,83,116,114,101,97,109,46,104,0,0,0,0,0,0,0,105,116,101,114,97,116,111,114,32,60,32,109,95,99,111,110,102,105,103,115,46,71,101,116,83,105,122,101,40,41,0,0,102,97,108,115,101,0,0,0,109,95,110,117,109,86,101,114,116,105,99,101,115,32,62,61,32,48,0,0,0,0,0,0,116,0,0,0,114,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,0,0,0,0,109,95,110,117,109,84,70,65,78,115,32,60,32,109,95,115,105,122,101,84,70,65,78,65,108,108,111,99,97,116,101,100,83,105,122,101,0,0,0,0,109,95,110,117,109,84,70,65,78,115,32,62,61,32,48,0,99,97,110,110,111,116,32,97,115,115,105,103,110,32,109,101,109,111,114,121,32,102,111,114,32,99,111,109,112,114,101,115,115,101,100,32,100,97,116,97,32,98,117,102,102,101,114,0,105,116,101,114,97,116,111,114,32,60,32,109,95,111,112,101,114,97,116,105,111,110,115,46,71,101,116,83,105,122,101,40,41,0,0,0,0,0,0,0,105,116,101,114,97,116,111,114,32,60,32,109,95,105,110,100,105,99,101,115,46,71,101,116,83,105,122,101,40,41,0,0,37,112,0,0,0,0,0,0,118,101,114,116,101,120,32,62,61,32,48,0,0,0,0,0,105,111,115,95,98,97,115,101,58,58,99,108,101,97,114,0,118,101,114,116,101,120,32,60,32,109,95,110,117,109,86,101,114,116,105,99,101,115,0,0,109,95,110,117,109,78,101,105,103,104,98,111,114,115,91,101,108,101,109,101,110,116,93,32,60,61,32,109,95,110,117,109,78,101,105,103,104,98,111,114,115,91,109,95,110,117,109,69,108,101,109,101,110,116,115,45,49,93,0,0,0,0,0,0,116,32,62,61,32,48,32,38,38,32,116,32,60,32,109,95,110,117,109,84,114,105,97,110,103,108,101,115,0,0,0,0,115,116,100,58,58,98,97,100,95,99,97,115,116,0,0,0,98,111,111,108,0,0,0,0,109,95,115,105,122,101,32,60,32,109,95,97,108,108,111,99,97,116,101,100,0,0,0,0,10,32,69,120,101,99,117,116,105,111,110,32,116,101,114,109,105,110,97,116,101,100,33,10,0,0,0,0,0,0,0,0,67,0,0,0,0,0,0,0,101,108,101,109,101,110,116,32,60,32,109,95,110,117,109,69,108,101,109,101,110,116,115,0,10,10,32,45,62,32,65,114,105,116,104,109,101,116,105,99,32,99,111,100,105,110,103,32,101,114,114,111,114,58,32,0,118,101,99,116,111,114,0,0,101,109,115,99,114,105,112,116,101,110,58,58,109,101,109,111,114,121,95,118,105,101,119,0,101,108,101,109,101,110,116,32,62,61,32,48,0,0,0,0,37,46,48,76,102,0,0,0,101,109,115,99,114,105,112,116,101,110,58,58,118,97,108,0,105,111,115,116,114,101,97,109,0,0,0,0,0,0,0,0,101,108,101,109,101,110,116,32,60,32,109,95,110,101,105,103,104,98,111,114,115,83,105,122,101,0,0,0,0,0,0,0,109,111,110,101,121,95,103,101,116,32,101,114,114,111,114,0,115,116,100,58,58,119,115,116,114,105,110,103,0,0,0,0,99,97,110,110,111,116,32,115,101,116,32,98,117,102,102,101,114,32,119,104,105,108,101,32,101,110,99,111,100,105,110,103,32,111,114,32,100,101,99,111,100,105,110,103,0,0,0,0,47,85,115,101,114,115,47,102,97,98,114,105,99,101,114,111,98,105,110,101,116,47,83,105,116,101,115,47,84,69,83,84,47,114,101,115,116,51,100,47,115,101,114,118,101,114,47,111,51,100,103,99,47,115,114,99,47,111,51,100,103,99,95,99,111,109,109,111,110,95,108,105,98,47,105,110,99,47,111,51,100,103,99,65,100,106,97,99,101,110,99,121,73,110,102,111,46,104,0,0,0,0,0,0,99,97,110,110,111,116,32,97,115,115,105,103,110,32,109,111,100,101,108,32,109,101,109,111,114,121,0,0,0,0,0,0,83,97,116,0,0,0,0,0,70,114,105,0,0,0,0,0,37,76,102,0,0,0,0,0,84,104,117,0,0,0,0,0,115,116,100,58,58,115,116,114,105,110,103,0,0,0,0,0,87,101,100,0,0,0,0,0,84,117,101,0,0,0,0,0,100,105,109,70,108,111,97,116,65,114,114,97,121,32,60,32,79,51,68,71,67,95,83,67,51,68,77,67,95,77,65,88,95,68,73,77,95,70,76,79,65,84,95,65,84,84,82,73,66,85,84,69,83,0,0,0,77,111,110,0,0,0,0,0,83,117,110,0,0,0,0,0,83,97,116,117,114,100,97,121,0,0,0,0,0,0,0,0,70,114,105,100,97,121,0,0,105,110,118,97,108,105,100,32,110,117,109,98,101,114,32,111,102,32,100,97,116,97,32,115,121,109,98,111,108,115,0,0,84,104,117,114,115,100,97,121,0,0,0,0,0,0,0,0,87,101,100,110,101,115,100,97,121,0,0,0,0,0,0,0,84,117,101,115,100,97,121,0,77,111,110,100,97,121,0,0,100,111,117,98,108,101,0,0,83,117,110,100,97,121,0,0,58,32,0,0,0,0,0,0,47,85,115,101,114,115,47,102,97,98,114,105,99,101,114,111,98,105,110,101,116,47,83,105,116,101,115,47,84,69,83,84,47,114,101,115,116,51,100,47,115,101,114,118,101,114,47,111,51,100,103,99,47,115,114,99,47,111,51,100,103,99,95,100,101,99,111,100,101,95,108,105,98,47,105,110,99,47,111,51,100,103,99,83,67,51,68,77,67,68,101,99,111,100,101,114,46,105,110,108,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,0,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,0,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,0,0,0,0,117,110,115,112,101,99,105,102,105,101,100,32,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,32,101,114,114,111,114,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,0,0,0,0,83,0,0,0,97,0,0,0,116,0,0,0,117,0,0,0,114,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,102,108,111,97,116,0,0,0,70,0,0,0,114,0,0,0,105,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,84,0,0,0,104,0,0,0,117,0,0,0,114,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,97,32,60,32,79,51,68,71,67,95,83,67,51,68,77,67,95,77,65,88,95,78,85,77,95,70,76,79,65,84,95,65,84,84,82,73,66,85,84,69,83,0,0,0,0,0,0,0,117,110,115,105,103,110,101,100,32,108,111,110,103,0,0,0,87,0,0,0,101,0,0,0,100,0,0,0,110,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,84,0,0,0,117,0,0,0,101,0,0,0,115,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,77,0,0,0,111,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,83,0,0,0,117,0,0,0,110,0,0,0,100,0,0,0,97,0,0,0,121,0,0,0,0,0,0,0,0,0,0,0,68,101,99,0,0,0,0,0,78,111,118,0,0,0,0,0,79,99,116,0,0,0,0,0,83,101,112,0,0,0,0,0,65,117,103,0,0,0,0,0,47,85,115,101,114,115,47,102,97,98,114,105,99,101,114,111,98,105,110,101,116,47,83,105,116,101,115,47,84,69,83,84,47,114,101,115,116,51,100,47,115,101,114,118,101,114,47,111,51,100,103,99,47,115,114,99,47,111,51,100,103,99,95,100,101,99,111,100,101,95,108,105,98,47,105,110,99,47,111,51,100,103,99,84,114,105,97,110,103,108,101,76,105,115,116,68,101,99,111,100,101,114,46,105,110,108,0,0,0,0,0,0,116,101,115,116,68,101,99,111,100,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,67,111,109,112,114,101,115,115,101,100,84,114,105,97,110,103,108,101,70,97,110,115,58,58,82,101,97,100,73,110,100,101,120,40,117,110,115,105,103,110,101,100,32,108,111,110,103,32,38,41,32,99,111,110,115,116,0,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,67,111,109,112,114,101,115,115,101,100,84,114,105,97,110,103,108,101,70,97,110,115,58,58,82,101,97,100,84,114,105,97,110,103,108,101,73,110,100,101,120,40,117,110,115,105,103,110,101,100,32,108,111,110,103,32,38,41,32,99,111,110,115,116,0,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,67,111,109,112,114,101,115,115,101,100,84,114,105,97,110,103,108,101,70,97,110,115,58,58,82,101,97,100,79,112,101,114,97,116,105,111,110,40,117,110,115,105,103,110,101,100,32,108,111,110,103,32,38,41,32,99,111,110,115,116,0,0,0,0,0,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,67,111,109,112,114,101,115,115,101,100,84,114,105,97,110,103,108,101,70,97,110,115,58,58,82,101,97,100,78,117,109,84,70,97,110,115,40,117,110,115,105,103,110,101,100,32,108,111,110,103,32,38,41,32,99,111,110,115,116,0,108,111,110,103,32,111,51,100,103,99,58,58,67,111,109,112,114,101,115,115,101,100,84,114,105,97,110,103,108,101,70,97,110,115,58,58,82,101,97,100,68,101,103,114,101,101,40,117,110,115,105,103,110,101,100,32,108,111,110,103,32,38,41,32,99,111,110,115,116,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,67,111,109,112,114,101,115,115,101,100,84,114,105,97,110,103,108,101,70,97,110,115,58,58,82,101,97,100,67,111,110,102,105,103,40,117,110,115,105,103,110,101,100,32,108,111,110,103,32,38,41,32,99,111,110,115,116,0,0,0,82,101,97,108,32,42,99,111,110,115,116,32,111,51,100,103,99,58,58,73,110,100,101,120,101,100,70,97,99,101,83,101,116,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,71,101,116,70,108,111,97,116,65,116,116,114,105,98,117,116,101,40,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,99,111,110,115,116,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,108,111,110,103,32,42,99,111,110,115,116,32,111,51,100,103,99,58,58,73,110,100,101,120,101,100,70,97,99,101,83,101,116,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,71,101,116,73,110,116,65,116,116,114,105,98,117,116,101,40,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,99,111,110,115,116,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,65,100,106,97,99,101,110,99,121,73,110,102,111,58,58,66,101,103,105,110,40,108,111,110,103,41,32,99,111,110,115,116,0,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,65,100,106,97,99,101,110,99,121,73,110,102,111,58,58,69,110,100,40,108,111,110,103,41,32,99,111,110,115,116,0,0,0,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,65,100,106,97,99,101,110,99,121,73,110,102,111,58,58,71,101,116,78,101,105,103,104,98,111,114,40,108,111,110,103,41,32,99,111,110,115,116,0,0,0,0,0,0,108,111,110,103,32,111,51,100,103,99,58,58,84,114,105,97,110,103,108,101,70,97,110,115,58,58,71,101,116,86,101,114,116,101,120,40,108,111,110,103,41,32,99,111,110,115,116,0,117,110,115,105,103,110,101,100,32,108,111,110,103,32,111,51,100,103,99,58,58,66,105,110,97,114,121,83,116,114,101,97,109,58,58,82,101,97,100,85,73,110,116,51,50,65,83,67,73,73,40,117,110,115,105,103,110,101,100,32,108,111,110,103,32,38,41,32,99,111,110,115,116,0,0,0,0,0,0,0,117,110,115,105,103,110,101,100,32,108,111,110,103,32,111,51,100,103,99,58,58,66,105,110,97,114,121,83,116,114,101,97,109,58,58,82,101,97,100,85,73,110,116,51,50,66,105,110,40,117,110,115,105,103,110,101,100,32,108,111,110,103,32,38,41,32,99,111,110,115,116,0,118,111,105,100,32,111,51,100,103,99,58,58,86,101,99,116,111,114,60,108,111,110,103,62,58,58,80,117,115,104,66,97,99,107,40,99,111,110,115,116,32,84,32,38,41,32,91,84,32,61,32,108,111,110,103,93,0,0,0,0,0,0,0,0,118,111,105,100,32,111,51,100,103,99,58,58,86,101,99,116,111,114,60,117,110,115,105,103,110,101,100,32,99,104,97,114,62,58,58,83,101,116,83,105,122,101,40,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,99,104,97,114,93,0,0,0,118,111,105,100,32,111,51,100,103,99,58,58,86,101,99,116,111,114,60,99,104,97,114,62,58,58,80,117,115,104,66,97,99,107,40,99,111,110,115,116,32,84,32,38,41,32,91,84,32,61,32,99,104,97,114,93,0,0,0,0,0,0,0,0,111,51,100,103,99,58,58,79,51,68,71,67,69,114,114,111,114,67,111,100,101,32,111,51,100,103,99,58,58,67,111,109,112,114,101,115,115,101,100,84,114,105,97,110,103,108,101,70,97,110,115,58,58,65,108,108,111,99,97,116,101,40,108,111,110,103,44,32,108,111,110,103,41,0,0,0,0,0,0,0,111,51,100,103,99,58,58,79,51,68,71,67,69,114,114,111,114,67,111,100,101,32,111,51,100,103,99,58,58,84,114,105,97,110,103,108,101,76,105,115,116,68,101,99,111,100,101,114,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,82,101,111,114,100,101,114,40,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,0,0,0,0,0,0,111,51,100,103,99,58,58,79,51,68,71,67,69,114,114,111,114,67,111,100,101,32,111,51,100,103,99,58,58,84,114,105,97,110,103,108,101,76,105,115,116,68,101,99,111,100,101,114,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,73,110,105,116,40,84,32,42,99,111,110,115,116,44,32,99,111,110,115,116,32,108,111,110,103,44,32,99,111,110,115,116,32,108,111,110,103,44,32,99,111,110,115,116,32,108,111,110,103,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,0,0,0,0,0,118,111,105,100,32,111,51,100,103,99,58,58,73,110,100,101,120,101,100,70,97,99,101,83,101,116,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,83,101,116,78,117,109,70,108,111,97,116,65,116,116,114,105,98,117,116,101,115,40,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,0,118,111,105,100,32,111,51,100,103,99,58,58,73,110,100,101,120,101,100,70,97,99,101,83,101,116,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,83,101,116,70,108,111,97,116,65,116,116,114,105,98,117,116,101,77,105,110,40,117,110,115,105,103,110,101,100,32,108,111,110,103,44,32,117,110,115,105,103,110,101,100,32,108,111,110,103,44,32,82,101,97,108,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,0,0,0,0,0,118,111,105,100,32,111,51,100,103,99,58,58,73,110,100,101,120,101,100,70,97,99,101,83,101,116,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,83,101,116,78,117,109,73,110,116,65,116,116,114,105,98,117,116,101,115,40,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,0,0,0,118,111,105,100,32,111,51,100,103,99,58,58,73,110,100,101,120,101,100,70,97,99,101,83,101,116,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,83,101,116,78,70,108,111,97,116,65,116,116,114,105,98,117,116,101,40,117,110,115,105,103,110,101,100,32,108,111,110,103,44,32,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,0,0,0,0,0,118,111,105,100,32,111,51,100,103,99,58,58,73,110,100,101,120,101,100,70,97,99,101,83,101,116,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,83,101,116,78,73,110,116,65,116,116,114,105,98,117,116,101,40,117,110,115,105,103,110,101,100,32,108,111,110,103,44,32,117,110,115,105,103,110,101,100,32,108,111,110,103,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,111,51,100,103,99,58,58,79,51,68,71,67,69,114,114,111,114,67,111,100,101,32,111,51,100,103,99,58,58,83,67,51,68,77,67,68,101,99,111,100,101,114,60,117,110,115,105,103,110,101,100,32,115,104,111,114,116,62,58,58,68,101,99,111,100,101,70,108,111,97,116,65,114,114,97,121,40,82,101,97,108,32,42,99,111,110,115,116,44,32,117,110,115,105,103,110,101,100,32,108,111,110,103,44,32,117,110,115,105,103,110,101,100,32,108,111,110,103,44,32,117,110,115,105,103,110,101,100,32,108,111,110,103,44,32,99,111,110,115,116,32,82,101,97,108,32,42,99,111,110,115,116,44,32,99,111,110,115,116,32,82,101,97,108,32,42,99,111,110,115,116,44,32,117,110,115,105,103,110,101,100,32,108,111,110,103,44,32,99,111,110,115,116,32,73,110,100,101,120,101,100,70,97,99,101,83,101,116,60,84,62,32,38,44,32,111,51,100,103,99,58,58,79,51,68,71,67,83,67,51,68,77,67,80,114,101,100,105,99,116,105,111,110,77,111,100,101,32,38,44,32,99,111,110,115,116,32,111,51,100,103,99,58,58,66,105,110,97,114,121,83,116,114,101,97,109,32,38,41,32,91,84,32,61,32,117,110,115,105,103,110,101,100,32,115,104,111,114,116,93,0,0,0,0,111,51,100,103,99,58,58,79,51,68,71,67,69,114,114,111,114,67,111,100,101,32,111,51,100,103,99,58,58,65,100,106,97,99,101,110,99,121,73,110,102,111,58,58,65,100,100,78,101,105,103,104,98,111,114,40,108,111,110,103,44,32,108,111,110,103,41,0,0,0,0,0,111,51,100,103,99,58,58,79,51,68,71,67,69,114,114,111,114,67,111,100,101,32,111,51,100,103,99,58,58,84,114,105,97,110,103,108,101,70,97,110,115,58,58,65,100,100,86,101,114,116,101,120,40,108,111,110,103,41,0,0,0,0,0,0,111,51,100,103,99,58,58,79,51,68,71,67,69,114,114,111,114,67,111,100,101,32,111,51,100,103,99,58,58,84,114,105,97,110,103,108,101,70,97,110,115,58,58,65,108,108,111,99,97,116,101,40,108,111,110,103,44,32,108,111,110,103,41,0,111,51,100,103,99,58,58,79,51,68,71,67,69,114,114,111,114,67,111,100,101,32,111,51,100,103,99,58,58,84,114,105,97,110,103,108,101,70,97,110,115,58,58,65,100,100,84,70,65,78,40,41,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,0,0,0,0,0,0,37,0,0,0,89,0,0,0,45,0,0,0,37,0,0,0,109,0,0,0,45,0,0,0,37,0,0,0,100,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,0,0,0,0,37,0,0,0,73,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,32,0,0,0,37,0,0,0,112,0,0,0,0,0,0,0,37,0,0,0,109,0,0,0,47,0,0,0,37,0,0,0,100,0,0,0,47,0,0,0,37,0,0,0,121,0,0,0,37,0,0,0,72,0,0,0,58,0,0,0,37,0,0,0,77,0,0,0,58,0,0,0,37,0,0,0,83,0,0,0,37,72,58,37,77,58,37,83,37,72,58,37,77,0,0,0,37,73,58,37,77,58,37,83,32,37,112,0,0,0,0,0,37,89,45,37,109,45,37,100,37,109,47,37,100,47,37,121,37,72,58,37,77,58,37,83,37,0,0,0,0,0,0,0,37,112,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,192,0,0,0,192,0,0,0,64,0,0,0,64,0,0,0,0,232,62,0,0,66,0,0,0,50,1,0,0,30,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,248,62,0,0,2,2,0,0,158,1,0,0,202,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,63,0,0,184,0,0,0,218,2,0,0,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,63,0,0,248,0,0,0,16,0,0,0,72,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,63,0,0,248,0,0,0,40,0,0,0,72,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,63,0,0,166,1,0,0,218,0,0,0,116,0,0,0,204,1,0,0,48,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,63,0,0,140,2,0,0,212,1,0,0,116,0,0,0,168,2,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,63,0,0,156,1,0,0,216,1,0,0,116,0,0,0,206,1,0,0,190,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0].concat([0,0,0,0,160,63,0,0,210,2,0,0,110,1,0,0,116,0,0,0,192,1,0,0,10,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,64,0,0,198,2,0,0,36,0,0,0,116,0,0,0,120,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,64,0,0,154,1,0,0,34,1,0,0,116,0,0,0,168,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,64,0,0,84,0,0,0,36,1,0,0,116,0,0,0,110,2,0,0,20,0,0,0,218,1,0,0,28,0,0,0,198,0,0,0,112,2,0,0,226,0,0,0,248,255,255,255,128,64,0,0,112,0,0,0,44,0,0,0,176,0,0,0,72,0,0,0,8,0,0,0,162,0,0,0,142,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,64,0,0,180,2,0,0,122,2,0,0,116,0,0,0,108,0,0,0,124,0,0,0,144,2,0,0,122,1,0,0,160,0,0,0,14,0,0,0,92,2,0,0,248,255,255,255,168,64,0,0,100,1,0,0,46,2,0,0,94,2,0,0,130,2,0,0,56,1,0,0,238,0,0,0,16,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,208,64,0,0,208,0,0,0,222,1,0,0,116,0,0,0,0,1,0,0,224,0,0,0,114,0,0,0,102,1,0,0,176,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,64,0,0,150,0,0,0,170,0,0,0,116,0,0,0,232,0,0,0,210,1,0,0,156,0,0,0,198,1,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,64,0,0,186,2,0,0,2,0,0,0,116,0,0,0,134,1,0,0,202,2,0,0,26,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,65,0,0,110,0,0,0,88,2,0,0,116,0,0,0,120,2,0,0,206,0,0,0,180,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,65,0,0,104,2,0,0,46,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,65,0,0,62,0,0,0,108,1,0,0,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,65,0,0,12,0,0,0,172,1,0,0,116,0,0,0,96,0,0,0,82,0,0,0,76,0,0,0,80,0,0,0,74,0,0,0,90,0,0,0,88,0,0,0,148,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,65,0,0,254,0,0,0,38,0,0,0,116,0,0,0,252,1,0,0,0,2,0,0,246,1,0,0,254,1,0,0,244,1,0,0,250,1,0,0,248,1,0,0,174,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,65,0,0,86,0,0,0,46,0,0,0,116,0,0,0,56,2,0,0,54,2,0,0,44,2,0,0,48,2,0,0,208,1,0,0,52,2,0,0,42,2,0,0,62,2,0,0,60,2,0,0,58,2,0,0,84,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,65,0,0,128,0,0,0,4,0,0,0,116,0,0,0,176,2,0,0,166,2,0,0,160,2,0,0,162,2,0,0,138,2,0,0,164,2,0,0,158,2,0,0,162,1,0,0,172,2,0,0,170,2,0,0,50,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,200,65,0,0,196,0,0,0,240,0,0,0,116,0,0,0,80,1,0,0,242,1,0,0,38,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,65,0,0,60,0,0,0,178,1,0,0,116,0,0,0,236,1,0,0,82,2,0,0,42,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,65,0,0,132,2,0,0,94,1,0,0,116,0,0,0,238,1,0,0,134,0,0,0,234,1,0,0,94,0,0,0,54,1,0,0,106,0,0,0,128,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,66,0,0,186,1,0,0,154,0,0,0,116,0,0,0,52,0,0,0,30,1,0,0,164,0,0,0,64,2,0,0,24,2,0,0,194,1,0,0,20,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,40,66,0,0,186,1,0,0,98,1,0,0,116,0,0,0,200,2,0,0,136,0,0,0,68,0,0,0,206,2,0,0,244,0,0,0,246,0,0,0,104,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,72,66,0,0,186,1,0,0,136,1,0,0,116,0,0,0,68,1,0,0,72,1,0,0,8,2,0,0,190,0,0,0,124,1,0,0,142,0,0,0,70,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,104,66,0,0,186,1,0,0,70,0,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,120,66,0,0,144,0,0,0,142,1,0,0,116,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,136,66,0,0,186,1,0,0,212,0,0,0,116,0,0,0,114,1,0,0,182,0,0,0,66,1,0,0,194,2,0,0,186,0,0,0,12,2,0,0,226,1,0,0,56,0,0,0,118,0,0,0,98,2,0,0,18,1,0,0,188,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,66,0,0,216,2,0,0,78,0,0,0,116,0,0,0,22,0,0,0,50,0,0,0,86,1,0,0,90,2,0,0,138,0,0,0,92,1,0,0,160,1,0,0,120,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,224,66,0,0,174,0,0,0,114,2,0,0,146,1,0,0,90,1,0,0,58,1,0,0,84,2,0,0,74,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,240,66,0,0,186,1,0,0,220,0,0,0,116,0,0,0,68,1,0,0,72,1,0,0,8,2,0,0,190,0,0,0,124,1,0,0,142,0,0,0,70,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,67,0,0,186,1,0,0,174,2,0,0,116,0,0,0,68,1,0,0,72,1,0,0,8,2,0,0,190,0,0,0,124,1,0,0,142,0,0,0,70,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,67,0,0,76,1,0,0,150,2,0,0,192,0,0,0,132,1,0,0,250,0,0,0,202,1,0,0,228,1,0,0,36,2,0,0,68,2,0,0,146,0,0,0,130,0,0,0,208,2,0,0,212,2,0,0,220,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,67,0,0,18,0,0,0,52,1,0,0,224,1,0,0,134,2,0,0,128,2,0,0,40,1,0,0,2,1,0,0,214,1,0,0,82,1,0,0,32,0,0,0,58,0,0,0,152,2,0,0,62,1,0,0,152,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,72,67,0,0,102,0,0,0,78,2,0,0,252,255,255,255,252,255,255,255,72,67,0,0,118,1,0,0,74,1,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,96,67,0,0,106,2,0,0,154,2,0,0,252,255,255,255,252,255,255,255,96,67,0,0,32,1,0,0,14,2,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,120,67,0,0,228,0,0,0,220,2,0,0,248,255,255,255,248,255,255,255,120,67,0,0,188,1,0,0,148,2,0,0,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,144,67,0,0,28,1,0,0,40,2,0,0,248,255,255,255,248,255,255,255,144,67,0,0,104,1,0,0,126,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,168,67,0,0,28,2,0,0,190,1,0,0,214,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,68,0,0,188,2,0,0,126,2,0,0,34,0,0,0,132,1,0,0,250,0,0,0,202,1,0,0,22,1,0,0,36,2,0,0,68,2,0,0,146,0,0,0,130,0,0,0,208,2,0,0,212,2,0,0,156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,68,0,0,138,1,0,0,184,1,0,0,42,1,0,0,134,2,0,0,128,2,0,0,40,1,0,0,230,1,0,0,214,1,0,0,82,1,0,0,32,0,0,0,58,0,0,0,152,2,0,0,62,1,0,0,172,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,68,0,0,116,2,0,0,116,1,0,0,116,0,0,0,96,1,0,0,100,2,0,0,150,1,0,0,196,2,0,0,54,0,0,0,12,1,0,0,10,1,0,0,210,0,0,0,88,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,96,68,0,0,24,1,0,0,140,0,0,0,116,0,0,0,80,2,0,0,10,0,0,0,32,2,0,0,118,2,0,0,136,2,0,0,234,0,0,0,86,2,0,0,180,1,0,0,132,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,68,0,0,124,2,0,0,48,1,0,0,116,0,0,0,92,0,0,0,44,1,0,0,152,1,0,0,140,1,0,0,146,2,0,0,182,1,0,0,6,2,0,0,200,1,0,0,26,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,160,68,0,0,204,0,0,0,170,1,0,0,116,0,0,0,38,2,0,0,66,2,0,0,6,1,0,0,96,2,0,0,242,0,0,0,194,0,0,0,148,1,0,0,76,2,0,0,70,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,216,68,0,0,230,0,0,0,178,0,0,0,16,2,0,0,132,1,0,0,250,0,0,0,202,1,0,0,228,1,0,0,36,2,0,0,68,2,0,0,106,1,0,0,196,1,0,0,166,0,0,0,212,2,0,0,220,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,232,68,0,0,26,0,0,0,108,2,0,0,240,1,0,0,134,2,0,0,128,2,0,0,40,1,0,0,2,1,0,0,214,1,0,0,82,1,0,0,20,1,0,0,122,0,0,0,30,0,0,0,62,1,0,0,152,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,8,69,0,0,192,2,0,0,222,0,0,0,158,0,0,0,130,1,0,0,34,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,24,69,0,0,192,2,0,0,4,2,0,0,158,0,0,0,130,1,0,0,200,0,0,0,64,0,0,0,102,2,0,0,14,1,0,0,0,0,0,0,0,0,0,0,118,0,0,0,0,0,0,0,116,0,0,0,0,0,0,0,115,0,0,0,0,0,0,0,109,0,0,0,0,0,0,0,108,0,0,0,0,0,0,0,106,0,0,0,0,0,0,0,105,0,0,0,0,0,0,0,104,0,0,0,0,0,0,0,102,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,99,0,0,0,0,0,0,0,98,0,0,0,0,0,0,0,97,0,0,0,0,0,0,0,83,116,57,116,121,112,101,95,105,110,102,111,0,0,0,0,83,116,57,101,120,99,101,112,116,105,111,110,0,0,0,0,83,116,57,98,97,100,95,97,108,108,111,99,0,0,0,0,83,116,56,98,97,100,95,99,97,115,116,0,0,0,0,0,83,116,49,51,114,117,110,116,105,109,101,95,101,114,114,111,114,0,0,0,0,0,0,0,83,116,49,50,108,101,110,103,116,104,95,101,114,114,111,114,0,0,0,0,0,0,0,0,83,116,49,49,108,111,103,105,99,95,101,114,114,111,114,0,78,83,116,51,95,95,49,57,116,105,109,101,95,98,97,115,101,69,0,0,0,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,109,111,110,101,121,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,98,97,115,105,99,95,105,111,115,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,112,117,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,119,69,69,0,0,0,78,83,116,51,95,95,49,57,95,95,110,117,109,95,103,101,116,73,99,69,69,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,116,105,109,101,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,110,117,109,112,117,110,99,116,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,119,69,69,0,0,0,0,78,83,116,51,95,95,49,56,109,101,115,115,97,103,101,115,73,99,69,69,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,56,105,111,115,95,98,97,115,101,55,102,97,105,108,117,114,101,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,119,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,112,117,116,73,99,78,83,95,49,57,111,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,119,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,110,117,109,95,103,101,116,73,99,78,83,95,49,57,105,115,116,114,101,97,109,98,117,102,95,105,116,101,114,97,116,111,114,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,119,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,108,108,97,116,101,73,99,69,69,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,119,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,99,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,115,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,55,99,111,100,101,99,118,116,73,68,105,99,49,48,95,109,98,115,116,97,116,101,95,116,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,102,97,99,101,116,69,0,0,0,78,83,116,51,95,95,49,54,108,111,99,97,108,101,53,95,95,105,109,112,69,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,53,99,116,121,112,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,49,95,95,98,97,115,105,99,95,115,116,114,105,110,103,95,99,111,109,109,111,110,73,76,98,49,69,69,69,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,119,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,50,48,95,95,116,105,109,101,95,103,101,116,95,99,95,115,116,111,114,97,103,101,73,99,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,57,95,95,105,111,115,116,114,101,97,109,95,99,97,116,101,103,111,114,121,69,0,0,0,78,83,116,51,95,95,49,49,55,95,95,119,105,100,101,110,95,102,114,111,109,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,78,83,116,51,95,95,49,49,54,95,95,110,97,114,114,111,119,95,116,111,95,117,116,102,56,73,76,106,51,50,69,69,69,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,53,98,97,115,105,99,95,115,116,114,101,97,109,98,117,102,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,101,114,114,111,114,95,99,97,116,101,103,111,114,121,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,115,104,97,114,101,100,95,99,111,117,110,116,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,112,117,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,52,95,95,110,117,109,95,103,101,116,95,98,97,115,101,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,51,109,101,115,115,97,103,101,115,95,98,97,115,101,69,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,111,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,51,98,97,115,105,99,95,105,115,116,114,101,97,109,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,115,121,115,116,101,109,95,101,114,114,111,114,69,0,0,78,83,116,51,95,95,49,49,50,99,111,100,101,99,118,116,95,98,97,115,101,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,119,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,119,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,119,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,98,97,115,105,99,95,115,116,114,105,110,103,73,99,78,83,95,49,49,99,104,97,114,95,116,114,97,105,116,115,73,99,69,69,78,83,95,57,97,108,108,111,99,97,116,111,114,73,99,69,69,69,69,0,0,78,83,116,51,95,95,49,49,50,95,95,100,111,95,109,101,115,115,97,103,101,69,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,115,116,100,111,117,116,98,117,102,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,112,117,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,119,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,49,95,95,109,111,110,101,121,95,103,101,116,73,99,69,69,0,0,0,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,119,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,49,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,112,117,110,99,116,73,99,76,98,48,69,69,69,0,0,0,0,0,78,83,116,51,95,95,49,49,48,109,111,110,101,121,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,99,116,121,112,101,95,98,97,115,101,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,116,105,109,101,95,112,117,116,69,0,0,0,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,119,69,69,0,78,83,116,51,95,95,49,49,48,95,95,115,116,100,105,110,98,117,102,73,99,69,69,0,78,49,48,101,109,115,99,114,105,112,116,101,110,51,118,97,108,69,0,0,0,0,0,0,78,49,48,101,109,115,99,114,105,112,116,101,110,49,49,109,101,109,111,114,121,95,118,105,101,119,69,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,51,95,95,102,117,110,100,97,109,101,110,116,97,108,95,116,121,112,101,95,105,110,102,111,69,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,49,95,95,118,109,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,50,48,95,95,115,105,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,55,95,95,99,108,97,115,115,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,78,49,48,95,95,99,120,120,97,98,105,118,49,49,54,95,95,115,104,105,109,95,116,121,112,101,95,105,110,102,111,69,0,0,0,0,0,0,0,0,96,49,0,0,176,49,0,0,96,49,0,0,8,50,0,0,0,0,0,0,24,50,0,0,0,0,0,0,40,50,0,0,0,0,0,0,56,50,0,0,224,62,0,0,0,0,0,0,0,0,0,0,72,50,0,0,224,62,0,0,0,0,0,0,0,0,0,0,88,50,0,0,224,62,0,0,0,0,0,0,0,0,0,0,112,50,0,0,40,63,0,0,0,0,0,0,0,0,0,0,136,50,0,0,224,62,0,0,0,0,0,0,0,0,0,0,152,50,0,0,136,49,0,0,176,50,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,32,68,0,0,0,0,0,0,136,49,0,0,248,50,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,40,68,0,0,0,0,0,0,136,49,0,0,64,51,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,48,68,0,0,0,0,0,0,136,49,0,0,136,51,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,56,68,0,0,0,0,0,0,0,0,0,0,208,51,0,0,48,65,0,0,0,0,0,0,0,0,0,0,0,52,0,0,48,65,0,0,0,0,0,0,136,49,0,0,48,52,0,0,0,0,0,0,1,0,0,0,48,67,0,0,0,0,0,0,136,49,0,0,72,52,0,0,0,0,0,0,1,0,0,0,48,67,0,0,0,0,0,0,136,49,0,0,96,52,0,0,0,0,0,0,1,0,0,0,56,67,0,0,0,0,0,0,136,49,0,0,120,52,0,0,0,0,0,0,1,0,0,0,56,67,0,0,0,0,0,0,136,49,0,0,144,52,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,208,68,0,0,0,8,0,0,136,49,0,0,216,52,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,208,68,0,0,0,8,0,0,136,49,0,0,32,53,0,0,0,0,0,0,3,0,0,0,104,66,0,0,2,0,0,0,56,63,0,0,2,0,0,0,208,66,0,0,0,8,0,0,136,49,0,0,104,53,0,0,0,0,0,0,3,0,0,0,104,66,0,0,2,0,0,0,56,63,0,0,2,0,0,0,216,66,0,0,0,8,0,0,0,0,0,0,176,53,0,0,104,66,0,0,0,0,0,0,0,0,0,0,200,53,0,0,104,66,0,0,0,0,0,0,136,49,0,0,224,53,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,64,67,0,0,2,0,0,0,136,49,0,0,248,53,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,64,67,0,0,2,0,0,0,0,0,0,0,16,54,0,0,0,0,0,0,40,54,0,0,168,67,0,0,0,0,0,0,136,49,0,0,72,54,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,224,63,0,0,0,0,0,0,136,49,0,0,144,54,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,248,63,0,0,0,0,0,0,136,49,0,0,216,54,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,16,64,0,0,0,0,0,0,136,49,0,0,32,55,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,40,64,0,0,0,0,0,0,0,0,0,0,104,55,0,0,104,66,0,0,0,0,0,0,0,0,0,0,128,55,0,0,104,66,0,0,0,0,0,0,136,49,0,0,152,55,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,184,67,0,0,2,0,0,0,136,49,0,0,192,55,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,184,67,0,0,2,0,0,0,136,49,0,0,232,55,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,184,67,0,0,2,0,0,0,136,49,0,0,16,56,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,184,67,0,0,2,0,0,0,0,0,0,0,56,56,0,0,40,67,0,0,0,0,0,0,0,0,0,0,80,56,0,0,104,66,0,0,0,0,0,0,136,49,0,0,104,56,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,200,68,0,0,2,0,0,0,136,49,0,0,128,56,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,200,68,0,0,2,0,0,0,0,0,0,0,152,56,0,0,0,0,0,0,192,56,0,0,0,0,0,0,232,56,0,0,0,0,0,0,16,57,0,0,240,67,0,0,0,0,0,0,0,0,0,0,48,57,0,0,72,66,0,0,0,0,0,0,0,0,0,0,88,57,0,0,72,66,0,0,0,0,0,0,0,0,0,0,128,57,0,0,0,0,0,0,184,57,0,0,0,0,0,0,240,57,0,0,0,0,0,0,16,58,0,0,0,0,0,0,48,58,0,0,0,0,0,0,80,58,0,0,0,0,0,0,112,58,0,0,136,49,0,0,136,58,0,0,0,0,0,0,1,0,0,0,192,63,0,0,3,244,255,255,136,49,0,0,184,58,0,0,0,0,0,0,1,0,0,0,208,63,0,0,3,244,255,255,136,49,0,0,232,58,0,0,0,0,0,0,1,0,0,0,192,63,0,0,3,244,255,255,136,49,0,0,24,59,0,0,0,0,0,0,1,0,0,0,208,63,0,0,3,244,255,255,0,0,0,0,72,59,0,0,8,63,0,0,0,0,0,0,0,0,0,0,96,59,0,0,136,49,0,0,120,59,0,0,0,0,0,0,1,0,0,0,200,66,0,0,0,0,0,0,136,49,0,0,184,59,0,0,0,0,0,0,1,0,0,0,200,66,0,0,0,0,0,0,0,0,0,0,248,59,0,0,32,67,0,0,0,0,0,0,0,0,0,0,16,60,0,0,16,67,0,0,0,0,0,0,0,0,0,0,48,60,0,0,24,67,0,0,0,0,0,0,0,0,0,0,80,60,0,0,0,0,0,0,112,60,0,0,0,0,0,0,144,60,0,0,0,0,0,0,176,60,0,0,136,49,0,0,208,60,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,192,68,0,0,2,0,0,0,136,49,0,0,240,60,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,192,68,0,0,2,0,0,0,136,49,0,0,16,61,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,192,68,0,0,2,0,0,0,136,49,0,0,48,61,0,0,0,0,0,0,2,0,0,0,104,66,0,0,2,0,0,0,192,68,0,0,2,0,0,0,0,0,0,0,80,61,0,0,0,0,0,0,104,61,0,0,0,0,0,0,128,61,0,0,0,0,0,0,152,61,0,0,16,67,0,0,0,0,0,0,0,0,0,0,176,61,0,0,24,67,0,0,0,0,0,0,0,0,0,0,200,61,0,0,0,0,0,0,224,61,0,0,0,0,0,0,0,62,0,0,72,69,0,0,0,0,0,0,0,0,0,0,40,62,0,0,56,69,0,0,0,0,0,0,0,0,0,0,80,62,0,0,56,69,0,0,0,0,0,0,0,0,0,0,120,62,0,0,72,69,0,0,0,0,0,0,0,0,0,0,160,62,0,0,216,62,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,65,66,67,68,69,70,120,88,43,45,112,80,105,73,110,78,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])
, "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
function runPostSets() {
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(8))>>2)]=(704);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(12))>>2)]=(334);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(16))>>2)]=(158);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(20))>>2)]=(386);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(24))>>2)]=(200);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(28))>>2)]=(98);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(32))>>2)]=(236);
HEAP32[(((__ZTVN10__cxxabiv120__si_class_type_infoE)+(36))>>2)]=(264);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(8))>>2)]=(704);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(12))>>2)]=(694);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(16))>>2)]=(158);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(20))>>2)]=(386);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(24))>>2)]=(200);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(28))>>2)]=(534);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(32))>>2)]=(260);
HEAP32[(((__ZTVN10__cxxabiv117__class_type_infoE)+(36))>>2)]=(400);
HEAP32[((__ZTIt)>>2)]=(((12640)|0));
HEAP32[(((__ZTIt)+(4))>>2)]=((12728)|0);
HEAP32[((__ZTIs)>>2)]=(((12640)|0));
HEAP32[(((__ZTIs)+(4))>>2)]=((12736)|0);
HEAP32[((__ZTIm)>>2)]=(((12640)|0));
HEAP32[(((__ZTIm)+(4))>>2)]=((12744)|0);
HEAP32[((__ZTIl)>>2)]=(((12640)|0));
HEAP32[(((__ZTIl)+(4))>>2)]=((12752)|0);
HEAP32[((__ZTIj)>>2)]=(((12640)|0));
HEAP32[(((__ZTIj)+(4))>>2)]=((12760)|0);
HEAP32[((__ZTIi)>>2)]=(((12640)|0));
HEAP32[(((__ZTIi)+(4))>>2)]=((12768)|0);
HEAP32[((__ZTIh)>>2)]=(((12640)|0));
HEAP32[(((__ZTIh)+(4))>>2)]=((12776)|0);
HEAP32[((__ZTIf)>>2)]=(((12640)|0));
HEAP32[(((__ZTIf)+(4))>>2)]=((12784)|0);
HEAP32[((__ZTId)>>2)]=(((12640)|0));
HEAP32[(((__ZTId)+(4))>>2)]=((12792)|0);
HEAP32[((__ZTIc)>>2)]=(((12640)|0));
HEAP32[(((__ZTIc)+(4))>>2)]=((12800)|0);
HEAP32[((__ZTIa)>>2)]=(((12640)|0));
HEAP32[(((__ZTIa)+(4))>>2)]=((12816)|0);
HEAP32[((16088)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((16096)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((16104)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16120)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16136)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16152)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16168)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16184)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((16320)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16336)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16592)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16608)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16688)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((16696)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16840)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((16856)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17000)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17016)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17096)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17104)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17112)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17120)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17136)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17152)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17168)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17176)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17184)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17192)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17200)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17208)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17216)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17320)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17336)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17392)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17408)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17424)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17440)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17448)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17456)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17464)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17600)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17608)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17616)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17624)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17640)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17656)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17664)>>2)]=(((__ZTVN10__cxxabiv117__class_type_infoE+8)|0));
HEAP32[((17672)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17688)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17704)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17720)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
HEAP32[((17736)>>2)]=(((__ZTVN10__cxxabiv120__si_class_type_infoE+8)|0));
}
if (!awaitingMemoryInitializer) runPostSets();
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  function ___gxx_personality_v0() {
    }
;
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      ret = dest|0;
      if ((dest&3) == (src&3)) {
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[(dest)]=HEAP8[(src)];
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        while ((num|0) >= 4) {
          HEAP32[((dest)>>2)]=HEAP32[((src)>>2)];
          dest = (dest+4)|0;
          src = (src+4)|0;
          num = (num-4)|0;
        }
      }
      while ((num|0) > 0) {
        HEAP8[(dest)]=HEAP8[(src)];
        dest = (dest+1)|0;
        src = (src+1)|0;
        num = (num-1)|0;
      }
      return ret|0;
    }var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function ___assert_func(filename, line, func, condition) {
      throw 'Assertion failed: ' + (condition ? Pointer_stringify(condition) : 'unknown condition') + ', at: ' + [filename ? Pointer_stringify(filename) : 'unknown filename', line, func ? Pointer_stringify(func) : 'unknown function'] + ' at ' + new Error().stack;
    }
  function _llvm_umul_with_overflow_i32(x, y) {
      x = x>>>0;
      y = y>>>0;
      return tempRet0 = x*y > 4294967295,(x*y)>>>0;
    }
  var _sqrt=Math.sqrt;
  var ___timespec_struct_layout={__size__:8,tv_sec:0,tv_nsec:4};function _clock_gettime(clk_id, tp) {
      // int clock_gettime(clockid_t clk_id, struct timespec *tp);
      var now = Date.now();
      HEAP32[(((tp)+(___timespec_struct_layout.tv_sec))>>2)]=Math.floor(now/1000); // seconds
      HEAP32[(((tp)+(___timespec_struct_layout.tv_nsec))>>2)]=0; // nanoseconds - not supported
      return 0;
    }
  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var stop = 0, value4 = 0, stop4 = 0, unaligned = 0;
      stop = (ptr + num)|0;
      if ((num|0) >= 20) {
        // This is unaligned, but quite large, so work hard to get to aligned settings
        value = value & 0xff;
        unaligned = ptr & 3;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
        stop4 = stop & ~3;
        if (unaligned) {
          unaligned = (ptr + 4 - unaligned)|0;
          while ((ptr|0) < (unaligned|0)) { // no need to check for stop, since we have large num
            HEAP8[(ptr)]=value;
            ptr = (ptr+1)|0;
          }
        }
        while ((ptr|0) < (stop4|0)) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      while ((ptr|0) < (stop|0)) {
        HEAP8[(ptr)]=value;
        ptr = (ptr+1)|0;
      }
    }var _llvm_memset_p0i8_i32=_memset;
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      function ExitStatus() {
        this.name = "ExitStatus";
        this.message = "Program terminated with exit(" + status + ")";
        this.status = status;
        Module.print('Exit Status: ' + status);
      };
      ExitStatus.prototype = new Error();
      ExitStatus.prototype.constructor = ExitStatus;
      exitRuntime();
      ABORT = true;
      throw new ExitStatus();
    }function _exit(status) {
      __exit(status);
    }function __ZSt9terminatev() {
      _exit(-1234);
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        FS.ensureRoot();
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },ensureRoot:function () {
        if (FS.root) return;
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        FS.ensureRoot();
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function simpleOutput(val) {
          if (val === null || val === 10) {
            output.printer(output.buffer.join(''));
            output.buffer = [];
          } else {
            output.buffer.push(utf8.processCChar(val));
          }
        }
        if (!output) {
          stdoutOverridden = false;
          output = simpleOutput;
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = simpleOutput;
        }
        if (!error.printer) error.printer = Module['print'];
        if (!error.buffer) error.buffer = [];
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        // Create the I/O devices.
        var devFolder = FS.createFolder('/', 'dev', true, true);
        var stdin = FS.createDevice(devFolder, 'stdin', input);
        var stdout = FS.createDevice(devFolder, 'stdout', null, output);
        var stderr = FS.createDevice(devFolder, 'stderr', null, error);
        FS.createDevice(devFolder, 'tty', input, output);
        FS.createDevice(devFolder, 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          isTerminal: !stdinOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stdoutOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          isTerminal: !stderrOverridden,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead = 0;
        while (stream.ungotten.length && nbyte > 0) {
          HEAP8[((buf++)|0)]=stream.ungotten.pop()
          nbyte--;
          bytesRead++;
        }
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            while (stream.ungotten.length && nbyte > 0) {
              HEAP8[((buf++)|0)]=stream.ungotten.pop()
              nbyte--;
              bytesRead++;
            }
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var ungotSize = stream.ungotten.length;
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          if (bytesRead != -1) {
            stream.position += (stream.ungotten.length - ungotSize) + bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      if (!FS.streams[stream]) return -1;
      var streamObj = FS.streams[stream];
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _read(stream, _fgetc.ret, 1);
      if (ret == 0) {
        streamObj.eof = true;
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }var _getc=_fgetc;
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  function _strlen(ptr) {
      ptr = ptr|0;
      var curr = 0;
      curr = ptr;
      while (HEAP8[(curr)]) {
        curr = (curr + 1)|0;
      }
      return (curr - ptr)|0;
    }function _fputs(s, stream) {
      // int fputs(const char *restrict s, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputs.html
      return _write(stream, s, _strlen(s));
    }
  function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
;
;
;
;
;
;
;
;
  function _pthread_mutex_lock() {}
  function _pthread_mutex_unlock() {}
  function _pthread_cond_broadcast() {
      return 0;
    }
  function _pthread_cond_wait() {
      return 0;
    }
  function _atexit(func, arg) {
      __ATEXIT__.unshift({ func: func, arg: arg });
    }var ___cxa_atexit=_atexit;
  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }
  function ___cxa_free_exception(ptr) {
      try {
        return _free(ptr);
      } catch(e) { // XXX FIXME
      }
    }
  function _llvm_eh_exception() {
      return HEAP32[((_llvm_eh_exception.buf)>>2)];
    }
  function __ZSt18uncaught_exceptionv() { // std::uncaught_exception()
      return !!__ZSt18uncaught_exceptionv.uncaught_exception;
    }
  function ___cxa_is_number_type(type) {
      var isNumber = false;
      try { if (type == __ZTIi) isNumber = true } catch(e){}
      try { if (type == __ZTIj) isNumber = true } catch(e){}
      try { if (type == __ZTIl) isNumber = true } catch(e){}
      try { if (type == __ZTIm) isNumber = true } catch(e){}
      try { if (type == __ZTIx) isNumber = true } catch(e){}
      try { if (type == __ZTIy) isNumber = true } catch(e){}
      try { if (type == __ZTIf) isNumber = true } catch(e){}
      try { if (type == __ZTId) isNumber = true } catch(e){}
      try { if (type == __ZTIe) isNumber = true } catch(e){}
      try { if (type == __ZTIc) isNumber = true } catch(e){}
      try { if (type == __ZTIa) isNumber = true } catch(e){}
      try { if (type == __ZTIh) isNumber = true } catch(e){}
      try { if (type == __ZTIs) isNumber = true } catch(e){}
      try { if (type == __ZTIt) isNumber = true } catch(e){}
      return isNumber;
    }function ___cxa_does_inherit(definiteType, possibilityType, possibility) {
      if (possibility == 0) return false;
      if (possibilityType == 0 || possibilityType == definiteType)
        return true;
      var possibility_type_info;
      if (___cxa_is_number_type(possibilityType)) {
        possibility_type_info = possibilityType;
      } else {
        var possibility_type_infoAddr = HEAP32[((possibilityType)>>2)] - 8;
        possibility_type_info = HEAP32[((possibility_type_infoAddr)>>2)];
      }
      switch (possibility_type_info) {
      case 0: // possibility is a pointer
        // See if definite type is a pointer
        var definite_type_infoAddr = HEAP32[((definiteType)>>2)] - 8;
        var definite_type_info = HEAP32[((definite_type_infoAddr)>>2)];
        if (definite_type_info == 0) {
          // Also a pointer; compare base types of pointers
          var defPointerBaseAddr = definiteType+8;
          var defPointerBaseType = HEAP32[((defPointerBaseAddr)>>2)];
          var possPointerBaseAddr = possibilityType+8;
          var possPointerBaseType = HEAP32[((possPointerBaseAddr)>>2)];
          return ___cxa_does_inherit(defPointerBaseType, possPointerBaseType, possibility);
        } else
          return false; // one pointer and one non-pointer
      case 1: // class with no base class
        return false;
      case 2: // class with base class
        var parentTypeAddr = possibilityType + 8;
        var parentType = HEAP32[((parentTypeAddr)>>2)];
        return ___cxa_does_inherit(definiteType, parentType, possibility);
      default:
        return false; // some unencountered type
      }
    }
  function ___resumeException(ptr) {
      if (HEAP32[((_llvm_eh_exception.buf)>>2)] == 0) HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr;
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }function ___cxa_find_matching_catch(thrown, throwntype) {
      if (thrown == -1) thrown = HEAP32[((_llvm_eh_exception.buf)>>2)];
      if (throwntype == -1) throwntype = HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)];
      var typeArray = Array.prototype.slice.call(arguments, 2);
      // If throwntype is a pointer, this means a pointer has been
      // thrown. When a pointer is thrown, actually what's thrown
      // is a pointer to the pointer. We'll dereference it.
      if (throwntype != 0 && !___cxa_is_number_type(throwntype)) {
        var throwntypeInfoAddr= HEAP32[((throwntype)>>2)] - 8;
        var throwntypeInfo= HEAP32[((throwntypeInfoAddr)>>2)];
        if (throwntypeInfo == 0)
          thrown = HEAP32[((thrown)>>2)];
      }
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var i = 0; i < typeArray.length; i++) {
        if (___cxa_does_inherit(typeArray[i], throwntype, thrown))
          return tempRet0 = typeArray[i],thrown;
      }
      // Shouldn't happen unless we have bogus data in typeArray
      // or encounter a type for which emscripten doesn't have suitable
      // typeinfo defined. Best-efforts match just in case.
      return tempRet0 = throwntype,thrown;
    }function ___cxa_throw(ptr, type, destructor) {
      if (!___cxa_throw.initialized) {
        try {
          HEAP32[((__ZTVN10__cxxabiv119__pointer_type_infoE)>>2)]=0; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv117__class_type_infoE)>>2)]=1; // Workaround for libcxxabi integration bug
        } catch(e){}
        try {
          HEAP32[((__ZTVN10__cxxabiv120__si_class_type_infoE)>>2)]=2; // Workaround for libcxxabi integration bug
        } catch(e){}
        ___cxa_throw.initialized = true;
      }
      HEAP32[((_llvm_eh_exception.buf)>>2)]=ptr
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=type
      HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=destructor
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exception = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exception++;
      }
      throw ptr + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function ___cxa_begin_catch(ptr) {
      __ZSt18uncaught_exceptionv.uncaught_exception--;
      return ptr;
    }
  function ___cxa_end_catch() {
      if (___cxa_end_catch.rethrown) {
        ___cxa_end_catch.rethrown = false;
        return;
      }
      // Clear state flag.
      __THREW__ = 0;
      // Clear type.
      HEAP32[(((_llvm_eh_exception.buf)+(4))>>2)]=0
      // Call destructor if one is registered then clear it.
      var ptr = HEAP32[((_llvm_eh_exception.buf)>>2)];
      var destructor = HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)];
      if (destructor) {
        Runtime.dynCall('vi', destructor, [ptr]);
        HEAP32[(((_llvm_eh_exception.buf)+(8))>>2)]=0
      }
      // Free ptr if it isn't null.
      if (ptr) {
        ___cxa_free_exception(ptr);
        HEAP32[((_llvm_eh_exception.buf)>>2)]=0
      }
    }
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      var flush = function(filedes) {
        // Right now we write all data directly, except for output devices.
        if (FS.streams[filedes] && FS.streams[filedes].object.output) {
          if (!FS.streams[filedes].isTerminal) { // don't flush terminals, it would cause a \n to also appear
            FS.streams[filedes].object.output(null);
          }
        }
      };
      try {
        if (stream === 0) {
          for (var i = 0; i < FS.streams.length; i++) if (FS.streams[i]) flush(i);
        } else {
          flush(stream);
        }
        return 0;
      } catch (e) {
        ___setErrNo(ERRNO_CODES.EIO);
        return -1;
      }
    }
  function _ungetc(c, stream) {
      // int ungetc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ungetc.html
      if (FS.streams[stream]) {
        c = unSign(c & 0xFF);
        FS.streams[stream].ungotten.push(c);
        return c;
      } else {
        return -1;
      }
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _strcpy(pdest, psrc) {
      pdest = pdest|0; psrc = psrc|0;
      var i = 0;
      do {
        HEAP8[(((pdest+i)|0)|0)]=HEAP8[(((psrc+i)|0)|0)];
        i = (i+1)|0;
      } while (HEAP8[(((psrc)+(i-1))|0)]);
      return pdest|0;
    }
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"No message of desired type",36:"Identifier removed",37:"Channel number out of range",38:"Level 2 not synchronized",39:"Level 3 halted",40:"Level 3 reset",41:"Link number out of range",42:"Protocol driver not attached",43:"No CSI structure available",44:"Level 2 halted",45:"Deadlock condition",46:"No record locks available",50:"Invalid exchange",51:"Invalid request descriptor",52:"Exchange full",53:"No anode",54:"Invalid request code",55:"Invalid slot",56:"File locking deadlock error",57:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",74:"Multihop attempted",75:"Inode is remote (not really error)",76:"Cross mount point (not really error)",77:"Trying to read unreadable message",79:"Inappropriate file type or format",80:"Given log. name not unique",81:"f.d. invalid for this operation",82:"Remote address changed",83:"Can\t access a needed shared lib",84:"Accessing a corrupted shared lib",85:".lib section in a.out corrupted",86:"Attempting to link in too many libs",87:"Attempting to exec a shared library",88:"Function not implemented",89:"No more files",90:"Directory not empty",91:"File or path name too long",92:"Too many symbolic links",95:"Operation not supported on transport endpoint",96:"Protocol family not supported",104:"Connection reset by peer",105:"No buffer space available",106:"Address family not supported by protocol family",107:"Protocol wrong type for socket",108:"Socket operation on non-socket",109:"Protocol not available",110:"Can't send after socket shutdown",111:"Connection refused",112:"Address already in use",113:"Connection aborted",114:"Network is unreachable",115:"Network interface is not configured",116:"Connection timed out",117:"Host is down",118:"Host is unreachable",119:"Connection already in progress",120:"Socket already connected",121:"Destination address required",122:"Message too long",123:"Unknown protocol",124:"Socket type not supported",125:"Address not available",126:"ENETRESET",127:"Socket is already connected",128:"Socket is not connected",129:"TOOMANYREFS",130:"EPROCLIM",131:"EUSERS",132:"EDQUOT",133:"ESTALE",134:"Not supported",135:"No medium (in tape drive)",136:"No such host or network path",137:"Filename exists with different case",138:"EILSEQ",139:"Value too large for defined data type",140:"Operation canceled",141:"State not recoverable",142:"Previous owner died",143:"Streams pipe error"};function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          for (var i = 0; i < msg.length; i++) {
            HEAP8[(((strerrbuf)+(i))|0)]=msg.charCodeAt(i)
          }
          HEAP8[(((strerrbuf)+(i))|0)]=0
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }
  function _abort() {
      ABORT = true;
      throw 'abort() at ' + (new Error().stack);
    }
  function _memmove(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      if (((src|0) < (dest|0)) & ((dest|0) < ((src + num)|0))) {
        // Unlikely case: Copy backwards in a safe manner
        src = (src + num)|0;
        dest = (dest + num)|0;
        while ((num|0) > 0) {
          dest = (dest - 1)|0;
          src = (src - 1)|0;
          num = (num - 1)|0;
          HEAP8[(dest)]=HEAP8[(src)];
        }
      } else {
        _memcpy(dest, src, num) | 0;
      }
    }var _llvm_memmove_p0i8_p0i8_i32=_memmove;
  function ___cxa_rethrow() {
      ___cxa_end_catch.rethrown = true;
      throw HEAP32[((_llvm_eh_exception.buf)>>2)] + " - Exception catching is disabled, this exception cannot be caught. Compile with -s DISABLE_EXCEPTION_CATCHING=0 or DISABLE_EXCEPTION_CATCHING=2 to catch.";;
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _isxdigit(chr) {
      return (chr >= 48 && chr <= 57) ||
             (chr >= 97 && chr <= 102) ||
             (chr >= 65 && chr <= 70);
    }var _isxdigit_l=_isxdigit;
  function _isdigit(chr) {
      return chr >= 48 && chr <= 57;
    }var _isdigit_l=_isdigit;
  function __isFloat(text) {
      return !!(/^[+-]?[0-9]*\.?[0-9]+([eE][+-]?[0-9]+)?$/.exec(text));
    }function __scanString(format, get, unget, varargs) {
      if (!__scanString.whiteSpace) {
        __scanString.whiteSpace = {};
        __scanString.whiteSpace[32] = 1;
        __scanString.whiteSpace[9] = 1;
        __scanString.whiteSpace[10] = 1;
        __scanString.whiteSpace[11] = 1;
        __scanString.whiteSpace[12] = 1;
        __scanString.whiteSpace[13] = 1;
        __scanString.whiteSpace[' '] = 1;
        __scanString.whiteSpace['\t'] = 1;
        __scanString.whiteSpace['\n'] = 1;
        __scanString.whiteSpace['\v'] = 1;
        __scanString.whiteSpace['\f'] = 1;
        __scanString.whiteSpace['\r'] = 1;
      }
      // Supports %x, %4x, %d.%d, %lld, %s, %f, %lf.
      // TODO: Support all format specifiers.
      format = Pointer_stringify(format);
      var soFar = 0;
      if (format.indexOf('%n') >= 0) {
        // need to track soFar
        var _get = get;
        get = function() {
          soFar++;
          return _get();
        }
        var _unget = unget;
        unget = function() {
          soFar--;
          return _unget();
        }
      }
      var formatIndex = 0;
      var argsi = 0;
      var fields = 0;
      var argIndex = 0;
      var next;
      mainLoop:
      for (var formatIndex = 0; formatIndex < format.length;) {
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'n') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          HEAP32[((argPtr)>>2)]=soFar;
          formatIndex += 2;
          continue;
        }
        // TODO: Support strings like "%5c" etc.
        if (format[formatIndex] === '%' && format[formatIndex+1] == 'c') {
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          fields++;
          next = get();
          HEAP8[(argPtr)]=next
          formatIndex += 2;
          continue;
        }
        // remove whitespace
        while (1) {
          next = get();
          if (next == 0) return fields;
          if (!(next in __scanString.whiteSpace)) break;
        }
        unget();
        if (format[formatIndex] === '%') {
          formatIndex++;
          var suppressAssignment = false;
          if (format[formatIndex] == '*') {
            suppressAssignment = true;
            formatIndex++;
          }
          var maxSpecifierStart = formatIndex;
          while (format[formatIndex].charCodeAt(0) >= 48 &&
                 format[formatIndex].charCodeAt(0) <= 57) {
            formatIndex++;
          }
          var max_;
          if (formatIndex != maxSpecifierStart) {
            max_ = parseInt(format.slice(maxSpecifierStart, formatIndex), 10);
          }
          var long_ = false;
          var half = false;
          var longLong = false;
          if (format[formatIndex] == 'l') {
            long_ = true;
            formatIndex++;
            if (format[formatIndex] == 'l') {
              longLong = true;
              formatIndex++;
            }
          } else if (format[formatIndex] == 'h') {
            half = true;
            formatIndex++;
          }
          var type = format[formatIndex];
          formatIndex++;
          var curr = 0;
          var buffer = [];
          // Read characters according to the format. floats are trickier, they may be in an unfloat state in the middle, then be a valid float later
          if (type == 'f' || type == 'e' || type == 'g' ||
              type == 'F' || type == 'E' || type == 'G') {
            var last = 0;
            next = get();
            while (next > 0) {
              buffer.push(String.fromCharCode(next));
              if (__isFloat(buffer.join(''))) {
                last = buffer.length;
              }
              next = get();
            }
            for (var i = 0; i < buffer.length - last + 1; i++) {
              unget();
            }
            buffer.length = last;
          } else {
            next = get();
            var first = true;
            while ((curr < max_ || isNaN(max_)) && next > 0) {
              if (!(next in __scanString.whiteSpace) && // stop on whitespace
                  (type == 's' ||
                   ((type === 'd' || type == 'u' || type == 'i') && ((next >= 48 && next <= 57) ||
                                                                     (first && next == 45))) ||
                   ((type === 'x' || type === 'X') && (next >= 48 && next <= 57 ||
                                     next >= 97 && next <= 102 ||
                                     next >= 65 && next <= 70))) &&
                  (formatIndex >= format.length || next !== format[formatIndex].charCodeAt(0))) { // Stop when we read something that is coming up
                buffer.push(String.fromCharCode(next));
                next = get();
                curr++;
                first = false;
              } else {
                break;
              }
            }
            unget();
          }
          if (buffer.length === 0) return 0;  // Failure.
          if (suppressAssignment) continue;
          var text = buffer.join('');
          var argPtr = HEAP32[(((varargs)+(argIndex))>>2)];
          argIndex += Runtime.getAlignSize('void*', null, true);
          switch (type) {
            case 'd': case 'u': case 'i':
              if (half) {
                HEAP16[((argPtr)>>1)]=parseInt(text, 10);
              } else if (longLong) {
                (tempI64 = [parseInt(text, 10)>>>0,Math.min(Math.floor((parseInt(text, 10))/4294967296), 4294967295)>>>0],HEAP32[((argPtr)>>2)]=tempI64[0],HEAP32[(((argPtr)+(4))>>2)]=tempI64[1]);
              } else {
                HEAP32[((argPtr)>>2)]=parseInt(text, 10);
              }
              break;
            case 'X':
            case 'x':
              HEAP32[((argPtr)>>2)]=parseInt(text, 16)
              break;
            case 'F':
            case 'f':
            case 'E':
            case 'e':
            case 'G':
            case 'g':
            case 'E':
              // fallthrough intended
              if (long_) {
                HEAPF64[((argPtr)>>3)]=parseFloat(text)
              } else {
                HEAPF32[((argPtr)>>2)]=parseFloat(text)
              }
              break;
            case 's':
              var array = intArrayFromString(text);
              for (var j = 0; j < array.length; j++) {
                HEAP8[(((argPtr)+(j))|0)]=array[j]
              }
              break;
          }
          fields++;
        } else if (format[formatIndex] in __scanString.whiteSpace) {
          next = get();
          while (next in __scanString.whiteSpace) {
            if (next <= 0) break mainLoop;  // End of input.
            next = get();
          }
          unget(next);
          formatIndex++;
        } else {
          // Not a specifier.
          next = get();
          if (format[formatIndex].charCodeAt(0) !== next) {
            unget(next);
            break mainLoop;
          }
          formatIndex++;
        }
      }
      return fields;
    }function _sscanf(s, format, varargs) {
      // int sscanf(const char *restrict s, const char *restrict format, ... );
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/scanf.html
      var index = 0;
      var get = function() { return HEAP8[(((s)+(index++))|0)]; };
      var unget = function() { index--; };
      return __scanString(format, get, unget, varargs);
    }
  function __Z7catopenPKci() { throw 'catopen not implemented' }
  function __Z7catgetsP8_nl_catdiiPKc() { throw 'catgets not implemented' }
  function __Z8catcloseP8_nl_catd() { throw 'catclose not implemented' }
  function _newlocale(mask, locale, base) {
      return 0;
    }
  function _freelocale(locale) {}
  function ___ctype_b_loc() {
      // http://refspecs.freestandards.org/LSB_3.0.0/LSB-Core-generic/LSB-Core-generic/baselib---ctype-b-loc.html
      var me = ___ctype_b_loc;
      if (!me.ret) {
        var values = [
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,8195,8194,8194,8194,8194,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,24577,49156,49156,49156,
          49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,49156,55304,55304,55304,55304,55304,55304,55304,55304,
          55304,55304,49156,49156,49156,49156,49156,49156,49156,54536,54536,54536,54536,54536,54536,50440,50440,50440,50440,50440,
          50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,50440,49156,49156,49156,49156,49156,
          49156,54792,54792,54792,54792,54792,54792,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,50696,
          50696,50696,50696,50696,50696,50696,50696,49156,49156,49156,49156,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ];
        var i16size = 2;
        var arr = _malloc(values.length * i16size);
        for (var i = 0; i < values.length; i++) {
          HEAP16[(((arr)+(i * i16size))>>1)]=values[i]
        }
        me.ret = allocate([arr + 128 * i16size], 'i16*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_tolower_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-tolower-loc.html
      var me = ___ctype_tolower_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,91,92,93,94,95,96,97,98,99,100,101,102,103,
          104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,
          134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,
          164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,
          194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,
          224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,
          254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function ___ctype_toupper_loc() {
      // http://refspecs.freestandards.org/LSB_3.1.1/LSB-Core-generic/LSB-Core-generic/libutil---ctype-toupper-loc.html
      var me = ___ctype_toupper_loc;
      if (!me.ret) {
        var values = [
          128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,
          158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,
          188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,
          218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,
          248,249,250,251,252,253,254,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,
          33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,
          73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,
          81,82,83,84,85,86,87,88,89,90,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,
          145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,
          175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,
          205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,
          235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255
        ];
        var i32size = 4;
        var arr = _malloc(values.length * i32size);
        for (var i = 0; i < values.length; i++) {
          HEAP32[(((arr)+(i * i32size))>>2)]=values[i]
        }
        me.ret = allocate([arr + 128 * i32size], 'i32*', ALLOC_NORMAL);
      }
      return me.ret;
    }
  function _strftime(s, maxsize, format, timeptr) {
      // size_t strftime(char *restrict s, size_t maxsize, const char *restrict format, const struct tm *restrict timeptr);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/strftime.html
      // TODO: Implement.
      return 0;
    }var _strftime_l=_strftime;
  function _isspace(chr) {
      return chr in { 32: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
    }
  function __parseInt64(str, endptr, base, min, max, unsign) {
      var isNegative = false;
      // Skip space.
      while (_isspace(HEAP8[(str)])) str++;
      // Check for a plus/minus sign.
      if (HEAP8[(str)] == 45) {
        str++;
        isNegative = true;
      } else if (HEAP8[(str)] == 43) {
        str++;
      }
      // Find base.
      var ok = false;
      var finalBase = base;
      if (!finalBase) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            finalBase = 16;
            str += 2;
          } else {
            finalBase = 8;
            ok = true; // we saw an initial zero, perhaps the entire thing is just "0"
          }
        }
      } else if (finalBase==16) {
        if (HEAP8[(str)] == 48) {
          if (HEAP8[((str+1)|0)] == 120 ||
              HEAP8[((str+1)|0)] == 88) {
            str += 2;
          }
        }
      }
      if (!finalBase) finalBase = 10;
      start = str;
      // Get digits.
      var chr;
      while ((chr = HEAP8[(str)]) != 0) {
        var digit = parseInt(String.fromCharCode(chr), finalBase);
        if (isNaN(digit)) {
          break;
        } else {
          str++;
          ok = true;
        }
      }
      if (!ok) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return tempRet0 = 0,0;
      }
      // Set end pointer.
      if (endptr) {
        HEAP32[((endptr)>>2)]=str
      }
      try {
        var numberString = isNegative ? '-'+Pointer_stringify(start, str - start) : Pointer_stringify(start, str - start);
        i64Math.fromString(numberString, finalBase, min, max, unsign);
      } catch(e) {
        ___setErrNo(ERRNO_CODES.ERANGE); // not quite correct
      }
      return tempRet0 = HEAP32[(((tempDoublePtr)+(4))>>2)],HEAP32[((tempDoublePtr)>>2)];
    }function _strtoull(str, endptr, base) {
      return __parseInt64(str, endptr, base, 0, '18446744073709551615', true);  // ULONG_MAX.
    }var _strtoull_l=_strtoull;
  function _strtoll(str, endptr, base) {
      return __parseInt64(str, endptr, base, '-9223372036854775808', '9223372036854775807');  // LLONG_MIN, LLONG_MAX.
    }var _strtoll_l=_strtoll;
  function _uselocale(locale) {
      return 0;
    }
  function ___locale_mb_cur_max() { throw '__locale_mb_cur_max not implemented' }
  var _llvm_va_start=undefined;
  function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }function _asprintf(s, format, varargs) {
      return _sprintf(-s, format, varargs);
    }function _vasprintf(s, format, va_arg) {
      return _asprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _llvm_va_end() {}
  function _vsnprintf(s, n, format, va_arg) {
      return _snprintf(s, n, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsprintf(s, format, va_arg) {
      return _sprintf(s, format, HEAP32[((va_arg)>>2)]);
    }
  function _vsscanf(s, format, va_arg) {
      return _sscanf(s, format, HEAP32[((va_arg)>>2)]);
    }
  var _llvm_memset_p0i8_i64=_memset;
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  function ___cxa_call_unexpected(exception) {
      Module.printErr('Unexpected exception thrown, this is not properly supported - aborting');
      ABORT = true;
      throw exception;
    }
  function _llvm_lifetime_start() {}
  function _llvm_lifetime_end() {}
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        function getMimetype(name) {
          return {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'bmp': 'image/bmp',
            'ogg': 'audio/ogg',
            'wav': 'audio/wav',
            'mp3': 'audio/mpeg'
          }[name.substr(name.lastIndexOf('.')+1)];
        }
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/.exec(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_llvm_eh_exception.buf = allocate(12, "void*", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var FUNCTION_TABLE = [0,0,__ZNSt3__18messagesIwED0Ev,0,__ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNKSt3__18numpunctIcE12do_falsenameEv,0,__ZNKSt3__120__time_get_c_storageIwE3__rEv,0,__ZNKSt3__110moneypunctIwLb0EE16do_thousands_sepEv
,0,__ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm,0,__ZNSt12length_errorD0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED1Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm
,0,__ZNKSt3__15ctypeIcE10do_toupperEc,0,__ZNSt3__16locale2id6__initEv,0,__ZNSt3__110__stdinbufIcED1Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm,0,__ZNSt3__110__stdinbufIcE9pbackfailEi
,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9underflowEv,0,__ZNSt3__111__stdoutbufIwE5imbueERKNS_6localeE,0,__ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev,0,__ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNSt11logic_errorD0Ev
,0,__ZNKSt3__17collateIcE7do_hashEPKcS3_,0,__ZNKSt3__120__time_get_c_storageIwE8__monthsEv,0,__ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev,0,__ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwRKNS_12basic_stringIwS3_NS_9allocatorIwEEEE,0,__ZNKSt3__15ctypeIcE10do_toupperEPcPKc
,0,__ZNKSt3__17codecvtIcc10_mbstate_tE6do_outERS1_PKcS5_RS5_PcS7_RS7_,0,__ZNKSt3__110moneypunctIwLb1EE16do_positive_signEv,0,__ZNKSt3__15ctypeIwE10do_tolowerEPwPKw,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5uflowEv,0,__ZNSt3__17collateIcED1Ev
,0,__ZNSt3__18ios_base7failureD2Ev,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNSt9bad_allocD2Ev,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_,0,__ZNSt3__16locale5facetD0Ev
,0,__ZNKSt3__120__time_get_c_storageIwE3__cEv,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwy,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwx,0,__ZNSt3__15ctypeIcED0Ev,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwm
,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwl,0,__ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwe,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwd
,0,__ZNKSt3__110moneypunctIcLb1EE16do_decimal_pointEv,0,__ZNKSt3__17codecvtIwc10_mbstate_tE11do_encodingEv,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwb,0,__ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEcRKNS_12basic_stringIcS3_NS_9allocatorIcEEEE
,0,__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE13do_max_lengthEv,0,__ZNKSt3__17codecvtIwc10_mbstate_tE9do_lengthERS1_PKcS5_j,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13do_date_orderEv,0,__ZNSt3__18messagesIcED1Ev
,0,__ZNKSt3__120__time_get_c_storageIwE7__weeksEv,0,__ZNKSt3__18numpunctIwE11do_groupingEv,0,__ZNSt3__16locale5facet16__on_zero_sharedEv,0,__ZNKSt3__15ctypeIwE8do_widenEc,0,__ZNKSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPK2tmcc
,0,__ZNSt3__110__stdinbufIcE5uflowEv,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm,0,__ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev,0,__ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5uflowEv
,0,__ZNKSt3__110moneypunctIwLb0EE13do_neg_formatEv,0,__ZNKSt3__17codecvtIwc10_mbstate_tE5do_inERS1_PKcS5_RS5_PwS7_RS7_,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE5do_inERS1_PKcS5_RS5_PDsS7_RS7_,0,__ZNKSt3__15ctypeIcE8do_widenEc,0,__ZNSt3__110moneypunctIwLb0EED0Ev
,0,__ZNKSt3__17codecvtIDic10_mbstate_tE9do_lengthERS1_PKcS5_j,0,__ZNSt3__16locale5__impD2Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9underflowEv,0,__ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPKv,0,__ZNSt3__18numpunctIcED2Ev
,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE8overflowEi,0,__ZNSt3__17codecvtIcc10_mbstate_tED0Ev,0,__ZNKSt3__18numpunctIcE11do_groupingEv,0,__ZNK10__cxxabiv116__shim_type_info5noop1Ev,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm
,0,__ZNKSt3__120__time_get_c_storageIwE3__xEv,0,__ZNKSt3__17codecvtIcc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_,0,__ZNSt3__110__stdinbufIwE9pbackfailEi,0,__ZNKSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPK2tmcc,0,__ZNSt3__18numpunctIcED0Ev
,0,__ZNSt3__111__stdoutbufIcE8overflowEi,0,__ZNSt3__119__iostream_categoryD1Ev,0,__ZNKSt3__120__time_get_c_storageIwE7__am_pmEv,0,__ZNSt3__110__stdinbufIwED0Ev,0,__ZNKSt3__18messagesIcE8do_closeEi
,0,__ZNKSt3__15ctypeIwE5do_isEPKwS3_Pt,0,__ZNSt13runtime_errorD2Ev,0,__ZNKSt3__15ctypeIwE10do_toupperEw,0,__ZNKSt3__15ctypeIwE9do_narrowEPKwS3_cPc,0,__ZNKSt3__17codecvtIDic10_mbstate_tE11do_encodingEv
,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5imbueERKNS_6localeE,0,__ZNKSt3__110moneypunctIcLb0EE16do_negative_signEv,0,__ZNSt3__17collateIwED1Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm,0,__ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv
,0,__ZNKSt8bad_cast4whatEv,0,__ZNSt3__110moneypunctIcLb0EED1Ev,0,__ZNKSt3__18messagesIcE6do_getEiiiRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE,0,__ZNSt3__18numpunctIwED2Ev,0,__ZNKSt3__110moneypunctIwLb1EE13do_pos_formatEv
,0,__ZNSt3__15ctypeIwED0Ev,0,__ZNKSt13runtime_error4whatEv,0,_free,0,__ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev,0,__ZNSt3__117__widen_from_utf8ILj32EED0Ev
,0,__ZN10__cxxabiv123__fundamental_type_infoD0Ev,0,__ZNKSt3__18numpunctIwE16do_thousands_sepEv,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc,0,__ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev,0,__ZNSt3__110__stdinbufIwED1Ev
,0,__ZNKSt3__18numpunctIcE16do_decimal_pointEv,0,__ZNKSt3__110moneypunctIwLb0EE16do_negative_signEv,0,__ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZNKSt3__120__time_get_c_storageIcE3__xEv,0,__ZNSt3__17collateIwED0Ev
,0,__ZNKSt3__110moneypunctIcLb0EE16do_positive_signEv,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE16do_always_noconvEv,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE9do_lengthERS1_PKcS5_j,0,__ZNSt11logic_errorD2Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekoffExNS_8ios_base7seekdirEj
,0,__ZNSt3__117__call_once_proxyINS_5tupleIJNS_12_GLOBAL__N_111__fake_bindEEEEEEvPv,0,__ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNKSt3__18numpunctIwE16do_decimal_pointEv,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE4syncEv,0,__ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib
,0,__ZNKSt3__110moneypunctIcLb0EE11do_groupingEv,0,__ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi,0,__ZNKSt3__110moneypunctIwLb1EE14do_frac_digitsEv,0,__ZNKSt3__110moneypunctIwLb1EE16do_negative_signEv,0,__ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi
,0,__ZNKSt3__120__time_get_c_storageIcE3__XEv,0,__ZNKSt3__15ctypeIwE9do_narrowEwc,0,__ZNSt3__110__stdinbufIcE9underflowEv,0,__ZNSt3__111__stdoutbufIwE4syncEv,0,__ZNSt3__110moneypunctIwLb0EED1Ev
,0,__ZNKSt3__110moneypunctIcLb1EE13do_neg_formatEv,0,__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev,0,__ZNKSt3__17codecvtIcc10_mbstate_tE5do_inERS1_PKcS5_RS5_PcS7_RS7_,0,__ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev,0,__ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev
,0,__ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev,0,__ZNKSt3__17collateIwE7do_hashEPKwS3_,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekposENS_4fposI10_mbstate_tEEj,0,__ZNSt3__111__stdoutbufIcE5imbueERKNS_6localeE,0,__ZNKSt3__110moneypunctIcLb1EE16do_thousands_sepEv
,0,__ZNSt3__18ios_baseD0Ev,0,__ZNSt3__110moneypunctIcLb1EED0Ev,0,__ZNSt9bad_allocD0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED0Ev,0,__ZNKSt3__17codecvtIwc10_mbstate_tE16do_always_noconvEv
,0,__ZNKSt3__120__time_get_c_storageIcE3__rEv,0,__ZNKSt3__114error_category10equivalentEiRKNS_15error_conditionE,0,___cxx_global_array_dtor53,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsputnEPKci,0,___cxx_global_array_dtor56
,0,__ZNKSt3__15ctypeIwE10do_scan_isEtPKwS3_,0,__ZNKSt3__17codecvtIDic10_mbstate_tE6do_outERS1_PKDiS5_RS5_PcS7_RS7_,0,__ZNKSt3__17codecvtIDic10_mbstate_tE13do_max_lengthEv,0,__ZNKSt3__17codecvtIDic10_mbstate_tE5do_inERS1_PKcS5_RS5_PDiS7_RS7_,0,__ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev
,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED1Ev,0,__ZN10__cxxabiv120__si_class_type_infoD0Ev,0,__ZNKSt3__17collateIwE10do_compareEPKwS3_S3_S3_,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsgetnEPci,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv
,0,__ZNKSt3__15ctypeIcE10do_tolowerEc,0,__ZNKSt3__110moneypunctIwLb1EE13do_neg_formatEv,0,__ZNKSt3__114error_category23default_error_conditionEi,0,__ZNKSt3__15ctypeIcE8do_widenEPKcS3_Pc,0,__ZNSt3__17codecvtIwc10_mbstate_tED0Ev
,0,__ZNKSt3__110moneypunctIwLb1EE16do_decimal_pointEv,0,__ZNSt3__17codecvtIDsc10_mbstate_tED0Ev,0,__ZNKSt3__120__time_get_c_storageIcE7__weeksEv,0,__ZNKSt3__18numpunctIwE11do_truenameEv,0,__ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev
,0,__ZNSt3__110__stdinbufIwE9underflowEv,0,__ZNSt3__18ios_base7failureD0Ev,0,__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNSt3__18ios_base4InitD2Ev,0,__ZNKSt3__15ctypeIwE5do_isEtw
,0,__ZNSt3__110moneypunctIwLb1EED0Ev,0,__ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev,0,__ZNKSt3__15ctypeIcE9do_narrowEPKcS3_cPc,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm,0,__ZNKSt3__17codecvtIDic10_mbstate_tE16do_always_noconvEv
,0,___cxx_global_array_dtor105,0,__ZNKSt3__17codecvtIwc10_mbstate_tE13do_max_lengthEv,0,__ZNK10__cxxabiv116__shim_type_info5noop2Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6setbufEPwi,0,__ZNKSt3__18messagesIwE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE
,0,__ZNSt3__17codecvtIDic10_mbstate_tED0Ev,0,__ZNSt3__111__stdoutbufIcED1Ev,0,__ZNKSt3__110moneypunctIcLb1EE14do_curr_symbolEv,0,__ZNSt3__16locale5__impD0Ev,0,__ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi
,0,__ZNKSt3__119__iostream_category4nameEv,0,__ZNKSt3__110moneypunctIcLb0EE14do_frac_digitsEv,0,__ZNKSt3__110moneypunctIwLb1EE11do_groupingEv,0,__ZNKSt3__110moneypunctIcLb1EE11do_groupingEv,0,__ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev
,0,__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,__ZNSt8bad_castD0Ev,0,__ZNKSt3__15ctypeIcE9do_narrowEcc,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRf,0,__ZNSt3__112__do_nothingEPv
,0,__ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev,0,___cxx_global_array_dtor81,0,__ZNSt3__110moneypunctIcLb0EED0Ev,0,__ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPKv
,0,__ZNKSt3__18numpunctIwE12do_falsenameEv,0,__ZNSt3__17collateIcED0Ev,0,__ZNKSt3__110moneypunctIwLb0EE13do_pos_formatEv,0,__ZNKSt3__110moneypunctIcLb1EE16do_negative_signEv,0,__ZNSt3__111__stdoutbufIcED0Ev
,0,__ZNSt3__16locale5facetD2Ev,0,__ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev,0,__ZNSt3__112system_errorD0Ev,0,__ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe,0,__ZNKSt3__17codecvtIcc10_mbstate_tE9do_lengthERS1_PKcS5_j
,0,__ZNSt3__110__stdinbufIwE5uflowEv,0,__ZNKSt3__18numpunctIcE11do_truenameEv,0,__ZNKSt3__110moneypunctIcLb1EE13do_pos_formatEv,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekposENS_4fposI10_mbstate_tEEj,0,__ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwe
,0,__ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_,0,__ZNKSt3__18numpunctIcE16do_thousands_sepEv,0,__ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9showmanycEv
,0,__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE8overflowEi,0,__ZNSt3__18numpunctIwED0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE
,0,__ZNKSt3__15ctypeIwE10do_tolowerEw,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE4syncEv,0,__ZNSt3__111__stdoutbufIcE4syncEv,0,__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev,0,__ZNKSt3__17codecvtIwc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_
,0,__ZNKSt3__17collateIcE10do_compareEPKcS3_S3_S3_,0,__ZNKSt3__17codecvtIwc10_mbstate_tE6do_outERS1_PKwS5_RS5_PcS7_RS7_,0,__ZNSt3__110__stdinbufIcE5imbueERKNS_6localeE,0,__ZNKSt3__17collateIwE12do_transformEPKwS3_,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcy
,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcx,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEce,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcd,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcb,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcm
,0,__ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcl,0,__ZNSt8bad_castD2Ev,0,__ZN10__cxxabiv121__vmi_class_type_infoD0Ev,0,__ZNKSt3__110moneypunctIcLb1EE14do_frac_digitsEv,0,__ZNKSt3__17codecvtIDic10_mbstate_tE10do_unshiftERS1_PcS4_RS4_
,0,__ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIcS3_NS_9allocatorIcEEEE,0,__ZNKSt3__15ctypeIwE10do_toupperEPwPKw,0,__ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev,0,__ZNSt3__110__stdinbufIwE5imbueERKNS_6localeE,0,___ZN10emscripten8internal7InvokerINSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEJRKS8_EE6invokeEPFS8_SA_EPNS0_11BindingTypeIS8_E3$_0E_
,0,__ZNKSt3__17codecvtIcc10_mbstate_tE13do_max_lengthEv,0,__ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib,0,__ZNKSt3__17codecvtIcc10_mbstate_tE16do_always_noconvEv,0,__ZNKSt3__18messagesIwE8do_closeEi,0,__ZNSt3__112system_errorD2Ev
,0,__ZNKSt9bad_alloc4whatEv,0,__ZNKSt3__110moneypunctIwLb0EE11do_groupingEv,0,__ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9showmanycEv,0,__ZNKSt3__110moneypunctIcLb0EE16do_decimal_pointEv
,0,__ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRy,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRx,0,__ZNKSt3__120__time_get_c_storageIcE8__monthsEv,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRt
,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRm,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRl,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRb,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRe
,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRd,0,__ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRf,0,__ZNKSt3__17codecvtIcc10_mbstate_tE11do_encodingEv,0,__ZNKSt3__110moneypunctIcLb0EE16do_thousands_sepEv,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsgetnEPwi
,0,__ZNKSt3__110moneypunctIcLb0EE13do_neg_formatEv,0,__ZNKSt11logic_error4whatEv,0,__ZNKSt3__119__iostream_category7messageEi,0,__ZNKSt3__110moneypunctIcLb0EE13do_pos_formatEv,0,__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev
,0,__ZNKSt3__110moneypunctIwLb0EE16do_decimal_pointEv,0,__ZNKSt3__17collateIcE12do_transformEPKcS3_,0,__ZNKSt3__114error_category10equivalentERKNS_10error_codeEi,0,__ZNKSt3__110moneypunctIwLb0EE14do_frac_digitsEv,0,__ZNSt3__18messagesIcED0Ev
,0,__ZNKSt3__15ctypeIcE10do_tolowerEPcPKc,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc,0,__ZNKSt3__120__time_get_c_storageIcE7__am_pmEv,0,__ZNKSt3__110moneypunctIcLb0EE14do_curr_symbolEv,0,__ZNKSt3__15ctypeIwE8do_widenEPKcS3_Pw
,0,__ZNKSt3__110moneypunctIwLb1EE16do_thousands_sepEv,0,__ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib,0,__ZNSt3__18ios_baseD2Ev,0,__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev,0,__ZNSt3__110__stdinbufIcED0Ev
,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13do_date_orderEv,0,__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm,0,__ZNSt3__119__iostream_categoryD0Ev,0,__ZNSt3__110moneypunctIwLb1EED1Ev,0,__ZNKSt3__110moneypunctIwLb0EE14do_curr_symbolEv
,0,__ZNKSt3__18messagesIcE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE,0,__ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev,0,__ZNSt3__110moneypunctIcLb1EED1Ev,0,__ZNSt3__111__stdoutbufIwED0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj
,0,__ZNKSt3__120__time_get_c_storageIcE3__cEv,0,__ZNSt3__17codecvtIwc10_mbstate_tED2Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6setbufEPci,0,__ZNKSt3__110moneypunctIwLb0EE16do_positive_signEv,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_
,0,__ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNKSt3__120__time_get_c_storageIwE3__XEv,0,__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm,0,__ZNKSt3__110moneypunctIcLb1EE16do_positive_signEv,0,__ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev
,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED0Ev,0,__ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9pbackfailEi,0,__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev,0,__ZNSt3__111__stdoutbufIwE8overflowEi,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRy
,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRx,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRt,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRm,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRl,0,__ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEce
,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRe,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRd,0,__ZNSt3__116__narrow_to_utf8ILj32EED0Ev,0,__ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRb,0,___cxx_global_array_dtor
,0,__ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZN10__cxxabiv117__class_type_infoD0Ev,0,__Z10testDecodeRKNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE,0,__ZNSt3__18messagesIwED1Ev,0,__ZNSt3__111__stdoutbufIwED1Ev
,0,__ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIwS3_NS_9allocatorIwEEEE,0,__ZN10__cxxabiv116__shim_type_infoD2Ev,0,__ZNKSt3__15ctypeIwE11do_scan_notEtPKwS3_,0,__ZNKSt3__110moneypunctIwLb1EE14do_curr_symbolEv,0,__ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev
,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE6do_outERS1_PKDsS5_RS5_PcS7_RS7_,0,__ZNKSt3__18messagesIwE6do_getEiiiRKNS_12basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEEE,0,___getTypeName,0,__ZNKSt3__17codecvtIDsc10_mbstate_tE11do_encodingEv,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9pbackfailEi
,0,__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev,0,__ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsputnEPKwi,0,__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev,0,__ZNSt3__15ctypeIcED2Ev,0,__ZNSt13runtime_errorD0Ev,0,__ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev,0,___cxx_global_array_dtor120];
// EMSCRIPTEN_START_FUNCS
function __Z10testDecodeRKNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r3=r1>>2;r4=STACKTOP;r5=r1,r6=r5>>2;r7=STACKTOP,r8=r7>>2;STACKTOP=STACKTOP+3472|0;r9=STACKTOP;STACKTOP=STACKTOP+16|0;r10=STACKTOP,r11=r10>>2;STACKTOP=STACKTOP+22676|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;_memset(r7+8|0,0,3112);HEAP32[r8+781]=2;HEAP32[r8+780]=1;HEAP32[r8+4]=14;HEAP32[r8+5]=8;HEAP32[r8+6]=10;HEAP32[r8+7]=10;HEAP32[r8+264]=5;HEAP32[r8+265]=5;HEAP32[r8+266]=6;HEAP32[r8+267]=5;r6=0;while(1){HEAP32[((r6<<2)+1072>>2)+r8]=1;r12=r6+1|0;if(r12>>>0<256){r6=r12}else{break}}_memset(r7+2096|0,0,1024);r6=r7+3128|0;__ZN5o3dgc19TriangleListDecoderItEC2Ev(r6);_memset(r7+3368|0,0,92);HEAP32[r8]=0;HEAP32[r8+1]=0;r12=r7+3336|0;HEAP32[r8+866]=0;r13=r12>>2;HEAP32[r13]=0;HEAP32[r13+1]=0;HEAP32[r13+2]=0;HEAP32[r13+3]=0;HEAP32[r13+4]=0;HEAP32[r13+5]=0;HEAP32[r13+6]=0;r13=(r9+4|0)>>2;r14=(r9+8|0)>>2;HEAP32[r14]=0;r15=(r9|0)>>2;HEAP32[r15]=0;HEAP32[r9+12>>2]=1;HEAP32[r13]=4096;r16=__Znaj(4096);HEAP32[r15]=r16;_memset(r10,0,22668);HEAP32[r11+5668]=16843009;HEAPF32[r11+5667]=30;r17=HEAP8[r2];if((r17&1)==0){r18=r2+1|0}else{r18=HEAP32[r2+8>>2]}r19=r17&255;if((r19&1|0)==0){r20=r19>>>1}else{r20=HEAP32[r2+4>>2]}if(HEAP32[r13]>>>0<r20>>>0){HEAP32[r13]=r20;r2=__Znaj(r20);r19=HEAP32[r14];do{if((r19|0)!=0){r17=HEAP32[r15];_memcpy(r2,r17,r19)|0;if((r17|0)==0){break}__ZdaPv(r17)}}while(0);HEAP32[r15]=r2;r21=r2}else{r21=r16}_memcpy(r21,r18,r20)|0;if(HEAP32[r13]>>>0<r20>>>0){___assert_func(432,96,5864,1544)}HEAP32[r14]=r20;__ZN5o3dgc13SC3DMCDecoderItE12DecodeHeaderERNS_14IndexedFaceSetItEERKNS_12BinaryStreamE(r7,r10,r9);r20=HEAP32[r11+3];r14=r20*12&-1;r13=r10+16|0;r18=r10+24|0;r21=HEAP32[r11]*6&-1;r16=(HEAP32[r13>>2]+r20)*12&-1;r20=(HEAP32[r18>>2]<<3)+r16+r21|0;r2=r1;r19=HEAP8[r5];r17=r19&255;if((r17&1|0)==0){r22=r17>>>1}else{r22=HEAP32[r3+1]}do{if(r22>>>0<r20>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEjc(r1,r20-r22|0,0)}else{if((r19&1)==0){HEAP8[r2+(r20+1)|0]=0;HEAP8[r5]=r20<<1&255;break}else{HEAP8[HEAP32[r3+2]+r20|0]=0;HEAP32[r3+1]=r20;break}}}while(0);r20=(HEAP8[r5]&1)==0;if(r20){HEAP32[r11+1]=r2+1;r23=r2+1|0}else{HEAP32[r11+1]=HEAP32[r3+2];r23=HEAP32[r3+2]}HEAP32[r11+29]=r23+r21;if((HEAP32[r13>>2]|0)!=0){if(r20){r24=r2+1|0}else{r24=HEAP32[r3+2]}HEAP32[r11+30]=r24+r21+r14}if((HEAP32[r18>>2]|0)!=0){if(r20){r25=r2+1|0}else{r25=HEAP32[r3+2]}HEAP32[r11+32]=r25+r16+r21}__ZN5o3dgc13SC3DMCDecoderItE14DecodePlayloadERNS_14IndexedFaceSetItEERKNS_12BinaryStreamE(r7,r10,r9);r9=HEAP32[r15];if((r9|0)!=0){__ZdaPv(r9)}r9=HEAP32[r8+839];if((r9|0)!=0){__ZdaPv(r9)}r9=HEAP32[r12>>2];if((r9|0)!=0){__ZdaPv(r9)}r9=HEAP32[r8+836];if((r9|0)==0){__ZN5o3dgc19TriangleListDecoderItED2Ev(r6);STACKTOP=r4;return}__ZdaPv(r9);__ZN5o3dgc19TriangleListDecoderItED2Ev(r6);STACKTOP=r4;return}function __ZN5o3dgc13SC3DMCDecoderItE12DecodeHeaderERNS_14IndexedFaceSetItEERKNS_12BinaryStreamE(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r4=r2>>2;r5=r1>>2;r6=0;r7=r1|0,r8=r7>>2;r9=HEAP32[r8];do{if((__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r3,r7)|0)==497){HEAP32[r5+866]=2;r10=2;r11=r3|0,r12=r11>>2}else{HEAP32[r8]=r9;if(r9>>>0>=(HEAP32[r3+8>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r13=r3|0,r14=r13>>2;r15=r9+1|0;HEAP32[r8]=r15;r16=HEAPU8[HEAP32[r14]+r9|0];r17=r9+2|0;HEAP32[r8]=r17;r18=(HEAPU8[HEAP32[r14]+r15|0]<<7)+r16|0;r16=r9+3|0;HEAP32[r8]=r16;r15=(HEAPU8[HEAP32[r14]+r17|0]<<14)+r18|0;r18=r9+4|0;HEAP32[r8]=r18;r17=(HEAPU8[HEAP32[r14]+r16|0]<<21)+r15|0;HEAP32[r8]=r9+5;if(((HEAPU8[HEAP32[r14]+r18|0]<<28)+r17|0)==497){HEAP32[r5+866]=1;r10=1;r11=r13,r12=r11>>2;break}else{r19=5;return r19}}}while(0);r11=(r1+3464|0)>>2;HEAP32[r5+1]=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,r10);r10=HEAP32[r8];HEAP32[r8]=r10+1;HEAP32[r5+781]=HEAPU8[HEAP32[r12]+r10|0];HEAPF32[r4+5667]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r10=HEAP32[r8];HEAP32[r8]=r10+1;HEAP8[r2+22672|0]=HEAP8[HEAP32[r12]+r10|0]&1;HEAP8[r2+22673|0]=0;HEAP8[r2+22674|0]=0;HEAP8[r2+22675|0]=0;r10=r2+12|0;HEAP32[r10>>2]=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r1=r2+16|0;HEAP32[r1>>2]=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r9=r2+20|0;HEAP32[r9>>2]=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r13=r2+24|0;HEAP32[r13>>2]=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r17=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);if(r17>>>0>=256){___assert_func(1176,166,6336,1616)}r18=(r2+132|0)>>2;HEAP32[r18]=r17;r17=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);if(r17>>>0>=256){___assert_func(1176,171,6568,1696)}r14=(r2+136|0)>>2;HEAP32[r14]=r17;if((HEAP32[r10>>2]|0)!=0){HEAP32[r4]=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+7]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+10]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+8]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+11]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+9]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+12]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r10=HEAP32[r8];HEAP32[r8]=r10+1;HEAP32[r5+4]=HEAPU8[HEAP32[r12]+r10|0]}if((HEAP32[r1>>2]|0)!=0){__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+13]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+16]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+14]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+17]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+15]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+18]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r1=HEAP32[r8];HEAP32[r8]=r1+2;HEAP32[r5+5]=HEAPU8[HEAP32[r12]+r1+1|0]}if((HEAP32[r9>>2]|0)!=0){__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+19]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+22]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+20]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+23]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+21]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+24]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r9=HEAP32[r8];HEAP32[r8]=r9+2;HEAP32[r5+6]=HEAPU8[HEAP32[r12]+r9+1|0]}if((HEAP32[r13>>2]|0)!=0){__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+25]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+27]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+26]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);HEAPF32[r4+28]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r13=HEAP32[r8];HEAP32[r8]=r13+1;HEAP32[r5+7]=HEAPU8[HEAP32[r12]+r13|0]}L99:do{if((HEAP32[r18]|0)!=0){r13=0;L100:while(1){r9=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);if(r13>>>0>=256){r6=88;break}HEAP32[((r13<<2)+140>>2)+r4]=r9;if((r9|0)!=0){__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r9=HEAP32[r8];HEAP32[r8]=r9+1;r1=HEAP8[HEAP32[r12]+r9|0];HEAP32[((r13<<2)+2188>>2)+r4]=r1&255;if(r1<<24>>24!=0){r9=r13<<3;r10=0;r17=0;while(1){r2=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);if((r10&255)>=8){r6=94;break L100}r15=r17+r9|0;HEAPF32[((r15<<2)+4236>>2)+r4]=r2;HEAPF32[((r15<<2)+12428>>2)+r4]=__ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r15=r10+1&255;if((r15&255)<(r1&255)){r10=r15;r17=r15&255}else{break}}}r17=HEAP32[r8];HEAP32[r8]=r17+2;HEAP32[((r13<<2)+32>>2)+r5]=HEAPU8[HEAP32[r12]+r17+1|0]}r17=r13+1|0;if(r17>>>0<HEAP32[r18]>>>0){r13=r17}else{break L99}}if(r6==88){___assert_func(1176,189,6672,3936)}else if(r6==94){___assert_func(1176,210,6440,1840)}}}while(0);if((HEAP32[r14]|0)==0){r19=0;return r19}else{r20=0}while(1){r18=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);if(r20>>>0>=256){r6=98;break}HEAP32[((r20<<2)+1164>>2)+r4]=r18;if((r18|0)!=0){__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r3,r7,HEAP32[r11]);r18=HEAP32[r8];HEAP32[r8]=r18+1;HEAP32[((r20<<2)+3212>>2)+r4]=HEAPU8[HEAP32[r12]+r18|0];HEAP32[r8]=HEAP32[r8]+1}r18=r20+1|0;if(r18>>>0<HEAP32[r14]>>>0){r20=r18}else{r19=0;r6=104;break}}if(r6==98){___assert_func(1176,194,6792,960)}else if(r6==104){return r19}}function __ZN5o3dgc19TriangleListDecoderItE6DecodeEPtllRKNS_12BinaryStreamERm(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11;r7=r1+200|0;r8=HEAP32[r6>>2];HEAP32[r6>>2]=r8+1;r9=HEAP8[HEAP32[r5>>2]+r8|0];r8=r1+204|0;HEAP8[r8]=(r9&255)>>>1&1;r10=r9&1;HEAP8[r1+205|0]=r10;if(r10<<24>>24!=0){r11=6;return r11}__ZN5o3dgc19TriangleListDecoderItE4InitEPtlll(r1,r2,r3,r4,__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r5,r6,HEAP32[r7>>2]));__ZN5o3dgc22CompressedTriangleFans4LoadERKNS_12BinaryStreamERmbNS_15O3DGCStreamTypeE(r1+92|0,r5,r6,(HEAP8[r8]&1)!=0,HEAP32[r7>>2]);r7=r1+32|0;if((HEAP32[r7>>2]|0)<=0){r11=0;return r11}r8=r1+48|0;r6=0;while(1){r5=r6+1|0;if((r6|0)==(HEAP32[r8>>2]|0)){HEAP32[r8>>2]=r5}__ZN5o3dgc19TriangleListDecoderItE27CompueLocalConnectivityInfoEl(r1,r6);__ZN5o3dgc19TriangleListDecoderItE14DecompressTFANEl(r1,r6);if((r5|0)<(HEAP32[r7>>2]|0)){r6=r5}else{r11=0;break}}return r11}function __ZN5o3dgc13SC3DMCDecoderItE14DecodePlayloadERNS_14IndexedFaceSetItEERKNS_12BinaryStreamE(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r4=r2>>2;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r1+3128|0;HEAP32[r1+3328>>2]=HEAP32[r1+3464>>2];r8=r1|0,r9=r8>>2;r10=(r1+3448|0)>>2;HEAP32[r10]=HEAP32[r9];r11=r6>>2;HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;HEAP32[r11+3]=0;r11=r6|0;_clock_gettime(1,r11);r12=r2+12|0;__ZN5o3dgc19TriangleListDecoderItE6DecodeEPtllRKNS_12BinaryStreamERm(r7,HEAP32[r4+1],HEAP32[r4],HEAP32[r12>>2],r3,r8);r8=r6+8|0;_clock_gettime(1,r8);r13=(r6+8|0)>>2;r14=(r6|0)>>2;r15=(r6+12|0)>>2;r16=(r6+4|0)>>2;HEAPF64[r1+3400>>3]=((HEAP32[r13]-HEAP32[r14]|0)+(HEAP32[r15]-HEAP32[r16]|0)*1e-9)*1e3;r6=HEAP32[r9];HEAP32[r10]=r6-HEAP32[r10];r10=(r1+3432|0)>>2;HEAP32[r10]=r6;_clock_gettime(1,r11);r6=HEAP32[r12>>2];do{if((r6|0)!=0){r12=__ZN5o3dgc13SC3DMCDecoderItE16DecodeFloatArrayEPfmmmPKfS4_mRKNS_14IndexedFaceSetItEERNS_25O3DGCSC3DMCPredictionModeERKNS_12BinaryStreamE(r1,HEAP32[r4+29],r6,3,3,r2+28|0,r2+40|0,HEAP32[r1+16>>2],r2,r1+1056|0,r3);if((r12|0)==0){break}else{r17=r12}STACKTOP=r5;return r17}}while(0);_clock_gettime(1,r8);HEAPF64[r1+3368>>3]=((HEAP32[r13]-HEAP32[r14]|0)+(HEAP32[r15]-HEAP32[r16]|0)*1e-9)*1e3;r6=HEAP32[r9];HEAP32[r10]=r6-HEAP32[r10];r10=(r1+3436|0)>>2;HEAP32[r10]=r6;_clock_gettime(1,r11);r6=HEAP32[r4+4];if((r6|0)!=0){__ZN5o3dgc13SC3DMCDecoderItE16DecodeFloatArrayEPfmmmPKfS4_mRKNS_14IndexedFaceSetItEERNS_25O3DGCSC3DMCPredictionModeERKNS_12BinaryStreamE(r1,HEAP32[r4+30],r6,3,3,r2+52|0,r2+64|0,HEAP32[r1+20>>2],r2,r1+1064|0,r3)}_clock_gettime(1,r8);HEAPF64[r1+3376>>3]=((HEAP32[r13]-HEAP32[r14]|0)+(HEAP32[r15]-HEAP32[r16]|0)*1e-9)*1e3;r6=HEAP32[r9];HEAP32[r10]=r6-HEAP32[r10];r10=(r1+3444|0)>>2;HEAP32[r10]=r6;_clock_gettime(1,r11);r6=HEAP32[r4+5];if((r6|0)!=0){__ZN5o3dgc13SC3DMCDecoderItE16DecodeFloatArrayEPfmmmPKfS4_mRKNS_14IndexedFaceSetItEERNS_25O3DGCSC3DMCPredictionModeERKNS_12BinaryStreamE(r1,HEAP32[r4+31],r6,3,3,r2+76|0,r2+88|0,HEAP32[r1+24>>2],r2,r1+1068|0,r3)}_clock_gettime(1,r8);HEAPF64[r1+3392>>3]=((HEAP32[r13]-HEAP32[r14]|0)+(HEAP32[r15]-HEAP32[r16]|0)*1e-9)*1e3;r6=HEAP32[r9];HEAP32[r10]=r6-HEAP32[r10];r10=(r1+3440|0)>>2;HEAP32[r10]=r6;_clock_gettime(1,r11);r6=HEAP32[r4+6];if((r6|0)!=0){__ZN5o3dgc13SC3DMCDecoderItE16DecodeFloatArrayEPfmmmPKfS4_mRKNS_14IndexedFaceSetItEERNS_25O3DGCSC3DMCPredictionModeERKNS_12BinaryStreamE(r1,HEAP32[r4+32],r6,2,2,r2+100|0,r2+108|0,HEAP32[r1+28>>2],r2,r1+1060|0,r3)}_clock_gettime(1,r8);HEAPF64[r1+3384>>3]=((HEAP32[r13]-HEAP32[r14]|0)+(HEAP32[r15]-HEAP32[r16]|0)*1e-9)*1e3;r6=HEAP32[r9];HEAP32[r10]=r6-HEAP32[r10];r10=(r1+3452|0)>>2;HEAP32[r10]=r6;_clock_gettime(1,r11);r6=r2+132|0;L154:do{if((HEAP32[r6>>2]|0)!=0){r12=0;while(1){if(r12>>>0>=256){break}r18=HEAP32[((r12<<2)+2188>>2)+r4];r19=r12<<3;__ZN5o3dgc13SC3DMCDecoderItE16DecodeFloatArrayEPfmmmPKfS4_mRKNS_14IndexedFaceSetItEERNS_25O3DGCSC3DMCPredictionModeERKNS_12BinaryStreamE(r1,HEAP32[((r12<<2)+20620>>2)+r4],HEAP32[((r12<<2)+140>>2)+r4],r18,r18,(r19<<2)+r2+4236|0,(r19<<2)+r2+12428|0,HEAP32[r1+(r12<<2)+32>>2],r2,(r12<<2)+r1+1072|0,r3);r19=r12+1|0;if(r19>>>0<HEAP32[r6>>2]>>>0){r12=r19}else{break L154}}___assert_func(1176,140,5224,3936)}}while(0);_clock_gettime(1,r8);HEAPF64[r1+3408>>3]=((HEAP32[r13]-HEAP32[r14]|0)+(HEAP32[r15]-HEAP32[r16]|0)*1e-9)*1e3;r6=HEAP32[r9];HEAP32[r10]=r6-HEAP32[r10];r10=(r1+3456|0)>>2;HEAP32[r10]=r6;_clock_gettime(1,r11);r6=r2+136|0;L160:do{if((HEAP32[r6>>2]|0)!=0){r2=0;while(1){if(r2>>>0>=256){break}r12=HEAP32[((r2<<2)+3212>>2)+r4];__ZN5o3dgc13SC3DMCDecoderItE14DecodeIntArrayEPlmmmRKNS_12BinaryStreamE(r1,HEAP32[((r2<<2)+21644>>2)+r4],HEAP32[((r2<<2)+1164>>2)+r4],r12,r12,r3);r12=r2+1|0;if(r12>>>0<HEAP32[r6>>2]>>>0){r2=r12}else{break L160}}___assert_func(1176,145,5336,960)}}while(0);_clock_gettime(1,r8);HEAPF64[r1+3416>>3]=((HEAP32[r13]-HEAP32[r14]|0)+(HEAP32[r15]-HEAP32[r16]|0)*1e-9)*1e3;HEAP32[r10]=HEAP32[r9]-HEAP32[r10];_clock_gettime(1,r11);__ZN5o3dgc19TriangleListDecoderItE7ReorderEv(r7);_clock_gettime(1,r8);HEAPF64[r1+3424>>3]=((HEAP32[r13]-HEAP32[r14]|0)+(HEAP32[r15]-HEAP32[r16]|0)*1e-9)*1e3;r17=0;STACKTOP=r5;return r17}function ___ZN10emscripten8internal7InvokerINSt3__112basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEJRKS8_EE6invokeEPFS8_SA_EPNS0_11BindingTypeIS8_E3$_0E_(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r3=STACKTOP;STACKTOP=STACKTOP+32|0;r4=r3,r5=r4>>2;r6=r3+16,r7=r6>>2;r8=r2+4|0;r9=HEAP32[r2>>2];if((r9|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r9>>>0<11){HEAP8[r6]=r9<<1&255;r10=r6+1|0}else{r2=r9+16&-16;r11=__Znwj(r2);HEAP32[r7+2]=r11;HEAP32[r7]=r2|1;HEAP32[r7+1]=r9;r10=r11}_memcpy(r10,r8,r9)|0;HEAP8[r10+r9|0]=0;FUNCTION_TABLE[r1](r4,r6);r1=r4;r9=HEAPU8[r1];if((r9&1|0)==0){r12=r9>>>1}else{r12=HEAP32[r5+1]}r9=_malloc(r12+4|0);r12=r9;r10=HEAPU8[r1];if((r10&1|0)==0){r13=r10>>>1}else{r13=HEAP32[r5+1]}HEAP32[r9>>2]=r13;r13=r9+4|0;r9=HEAP8[r1];if((r9&1)==0){r14=r4+1|0}else{r14=HEAP32[r5+2]}r4=r9&255;if((r4&1|0)==0){r15=r4>>>1}else{r15=HEAP32[r5+1]}_memcpy(r13,r14,r15)|0;if((HEAP8[r1]&1)!=0){__ZdlPv(HEAP32[r5+2])}if((HEAP8[r6]&1)==0){STACKTOP=r3;return r12}__ZdlPv(HEAP32[r7+2]);STACKTOP=r3;return r12}function __ZN5o3dgc13SC3DMCDecoderItE16DecodeFloatArrayEPfmmmPKfS4_mRKNS_14IndexedFaceSetItEERNS_25O3DGCSC3DMCPredictionModeERKNS_12BinaryStreamE(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139;r12=r10>>2;r10=0;r13=STACKTOP;STACKTOP=STACKTOP+568|0;r14=r13>>2;r15=r13+32,r16=r15>>2;r17=r13+384;r18=r13+416,r19=r18>>2;r20=r13+440;r21=r13+480,r22=r21>>2;r23=r13+488;r24=r13+528;if(r4>>>0>=8){___assert_func(3560,441,6904,3360)}r25=r17+24|0;HEAP32[r25>>2]=0;r26=(r17+28|0)>>2;HEAP32[r26]=0;r27=r17|0;HEAP32[r27>>2]=0;r28=r17+4|0;HEAP32[r28>>2]=0;HEAP32[r19+3]=1;HEAP32[r19+4]=2;HEAP32[r19+2]=4096;HEAP32[r19+1]=4;HEAP32[r19]=4;HEAP32[r20+24>>2]=0;r19=r20|0;HEAP32[r19>>2]=0;__ZN5o3dgc19Adaptive_Data_Model12set_alphabetEj(r20,9);r29=HEAP32[r9+4>>2]>>1;r30=Math.imul(r4,r3)|0;r31=r1|0,r32=r31>>2;r33=HEAP32[r32];r34=(r1+3464|0)>>2;r35=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r11,r31,HEAP32[r34]);r31=HEAP32[r32];HEAP32[r32]=r31+1;r36=(r11|0)>>2;r37=HEAPU8[HEAP32[r36]+r31|0];r31=r37>>>4&7;HEAP32[r12]=r37&7;r37=HEAP32[r32];r38=r33-r37+r35|0;HEAP32[r22]=r35+r33;do{if((HEAP32[r34]|0)==1){if((r31|0)!=5){r39=5;break}__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r11,r21,1);r40=0;r41=0;r10=208}else{if((r31|0)!=4){r39=5;break}r42=HEAP32[r36]+r37|0;HEAP32[r32]=r33+r35;__ZN5o3dgc16Arithmetic_Codec10set_bufferEjPh(r17,r38,r42);if((HEAP32[r26]|0)!=0){__ZN5o3dgcL8AC_ErrorEPKc(1112)}if((HEAP32[r25>>2]|0)==0){__ZN5o3dgcL8AC_ErrorEPKc(1368)}HEAP32[r26]=2;r42=(r17+20|0)>>2;HEAP32[r42]=-1;r43=HEAP32[r27>>2];r44=r43+3|0;r45=(r17+8|0)>>2;HEAP32[r45]=r44;r46=(r17+16|0)>>2;HEAP32[r46]=HEAPU8[r43+1|0]<<16|HEAPU8[r43]<<24|HEAPU8[r43+2|0]<<8|HEAPU8[r44];r44=0;r43=0;L217:while(1){while(1){r47=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r17,r18);if((r47|0)==1){break}else if((r47|0)==0){r48=0;r49=r43;break L217}}r44=(1<<r43)+r44|0;r43=r43+1|0}L222:while(1){r43=r49;while(1){r50=r43-1|0;if((r43|0)==0){r51=0;r52=0;break L222}r47=HEAP32[r42];r53=r47>>>13<<12;r54=HEAP32[r46];r55=r54>>>0>=r53>>>0;if(r55){r56=r54-r53|0;HEAP32[r46]=r56;r57=r47-r53|0;r58=r56}else{r57=r53;r58=r54}HEAP32[r42]=r57;if(r57>>>0<16777216){r54=r58;r53=HEAP32[r45];r56=r57;while(1){r47=r53+1|0;HEAP32[r45]=r47;r59=HEAPU8[r47]|r54<<8;HEAP32[r46]=r59;r60=r56<<8;HEAP32[r42]=r60;if(r60>>>0<16777216){r54=r59;r53=r47;r56=r60}else{break}}}if(r55){break}else{r43=r50}}r48=1<<r50|r48;r49=r50}L236:while(1){while(1){r43=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r17,r18);if((r43|0)==0){break L236}else if((r43|0)==1){break}}r51=(1<<r52)+r51|0;r52=r52+1|0}r43=r48+r44|0;r56=0;r53=r52;L242:while(1){r54=r53;while(1){r61=r54-1|0;if((r54|0)==0){break L242}r60=HEAP32[r42];r47=r60>>>13<<12;r59=HEAP32[r46];r62=r59>>>0>=r47>>>0;if(r62){r63=r59-r47|0;HEAP32[r46]=r63;r64=r60-r47|0;r65=r63}else{r64=r47;r65=r59}HEAP32[r42]=r64;if(r64>>>0<16777216){r59=r65;r47=HEAP32[r45];r63=r64;while(1){r60=r47+1|0;HEAP32[r45]=r60;r66=HEAPU8[r60]|r59<<8;HEAP32[r46]=r66;r67=r63<<8;HEAP32[r42]=r67;if(r67>>>0<16777216){r59=r66;r47=r60;r63=r67}else{break}}}if(r62){break}else{r54=r61}}r56=1<<r61|r56;r53=r61}r40=r43;r41=r56+r51|0;r10=208}}while(0);do{if(r10==208){HEAP32[r23+24>>2]=0;r51=r23|0;HEAP32[r51>>2]=0;__ZN5o3dgc19Adaptive_Data_Model12set_alphabetEj(r23,r41+2|0);if((HEAP32[r12]|0)==6){r61=r1+3344|0;r64=(r1+3348|0)>>2;if(HEAP32[r64]>>>0<r30>>>0){HEAP32[r64]=r30;r65=__Znaj(r30);r52=r1+3352|0;r48=HEAP32[r52>>2];r50=r61|0;do{if((r48|0)!=0){r49=HEAP32[r50>>2];_memcpy(r65,r49,r48)|0;if((r49|0)==0){break}__ZdaPv(r49)}}while(0);HEAP32[r50>>2]=r65;r68=r52,r69=r68>>2}else{r68=r1+3352|0,r69=r68>>2}HEAP32[r69]=0;L273:do{if((HEAP32[r34]|0)==1){if((r3|0)==0){break}r48=(r61|0)>>2;r56=0;while(1){r43=HEAP32[r32];r49=r43+1|0;HEAP32[r32]=r49;r57=HEAP8[HEAP32[r36]+r43|0];r43=r57&255;if(r57<<24>>24==127){r57=0;r58=r43;r27=r49;while(1){r49=r27+1|0;HEAP32[r32]=r49;r26=HEAPU8[HEAP32[r36]+r27|0];r25=(r26>>>1<<r57)+r58|0;if((r26&1|0)==0){r70=r25;break}else{r57=r57+6|0;r58=r25;r27=r49}}}else{r70=r43}if((r70&1|0)==0){r71=r70>>>1&255}else{r71=-((r70+1|0)>>>1)&255}r27=HEAP32[r69];r58=HEAP32[r64];if((r27|0)==(r58|0)){r57=r27<<1;r62=r57>>>0<32?32:r57;HEAP32[r64]=r62;r57=__Znaj(r62);r62=HEAP32[r69];do{if((r62|0)==0){r72=0}else{r49=HEAP32[r48];_memcpy(r57,r49,r62)|0;if((r49|0)==0){r72=r62;break}__ZdaPv(r49);r72=HEAP32[r69]}}while(0);HEAP32[r48]=r57;r73=r72;r74=HEAP32[r64]}else{r73=r27;r74=r58}if(r73>>>0>=r74>>>0){break}HEAP32[r69]=r73+1;HEAP8[HEAP32[r48]+r73|0]=r71;r62=r56+1|0;if(r62>>>0<r3>>>0){r56=r62}else{break L273}}___assert_func(432,88,5944,2840)}else{HEAP32[r24+24>>2]=0;r56=r24|0;HEAP32[r56>>2]=0;__ZN5o3dgc19Adaptive_Data_Model12set_alphabetEj(r24,12);L299:do{if((r3|0)!=0){r48=(r61|0)>>2;r62=0;while(1){r43=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r17,r24);if((r43&1|0)==0){r75=r43>>>1&255}else{r75=-((r43+1|0)>>>1)&255}r43=HEAP32[r69];r49=HEAP32[r64];if((r43|0)==(r49|0)){r25=r43<<1;r26=r25>>>0<32?32:r25;HEAP32[r64]=r26;r25=__Znaj(r26);r26=HEAP32[r69];do{if((r26|0)==0){r76=0}else{r38=HEAP32[r48];_memcpy(r25,r38,r26)|0;if((r38|0)==0){r76=r26;break}__ZdaPv(r38);r76=HEAP32[r69]}}while(0);HEAP32[r48]=r25;r77=r76;r78=HEAP32[r64]}else{r77=r43;r78=r49}if(r77>>>0>=r78>>>0){break}HEAP32[r69]=r77+1;HEAP8[HEAP32[r48]+r77|0]=r75;r26=r62+1|0;if(r26>>>0<r3>>>0){r62=r26}else{break L299}}___assert_func(432,88,5944,2840)}}while(0);r62=HEAP32[r56>>2];if((r62|0)==0){break}__ZdaPv(r62)}}while(0);__ZN5o3dgc13SC3DMCDecoderItE14ProcessNormalsERKNS_14IndexedFaceSetItEE(r1,r9);r79=2}else{r79=r4}r64=r1+3340|0;if(HEAP32[r64>>2]>>>0<r30>>>0){r61=r1+3336|0;r52=HEAP32[r61>>2];if((r52|0)!=0){__ZdaPv(r52)}HEAP32[r64>>2]=r30;r64=_llvm_umul_with_overflow_i32(r30,4);HEAP32[r61>>2]=__Znaj(tempRet0?-1:r64)}r64=(r3|0)>0;L329:do{if(r64){r61=r1+3208|0;r52=r1+3216|0;r65=(r79|0)==0;r50=(r1+3336|0)>>2;r62=(r17+20|0)>>2;r48=(r17+16|0)>>2;r58=(r17+8|0)>>2;r27=r1+3200|0;r57=r1+3212|0;r26=0;L331:while(1){r38=HEAP32[r61>>2];if((r38|0)<=(r26|0)){r10=269;break}r35=HEAP32[r52>>2]>>2;r33=HEAP32[(r26<<2>>2)+r35];r37=(r26|0)>0;if(r37){r80=HEAP32[(r26-1<<2>>2)+r35]}else{r80=0}do{if((r33-r80|0)>0){r31=HEAP32[r12];if((r31|0)==0){r10=377;break}if(r37){r81=HEAP32[(r26-1<<2>>2)+r35]}else{r81=0}if((r81|0)>=(r33|0)){r10=377;break}r21=HEAP32[r27>>2];r11=0;r53=r81;while(1){if((r21|0)<=(r53|0)){r10=280;break L331}if((r53|0)<=-1){r10=283;break L331}r42=HEAP32[r57>>2];r46=HEAP32[r42+(r53<<2)>>2];if((r46|0)<0){r82=r11;break}L349:do{if((r31|0)==5){r45=r46*3&-1;r44=HEAPU16[(r45<<1>>1)+r29];r54=HEAPU16[(r45+1<<1>>1)+r29];do{if((r44|0)==(r26|0)){r83=HEAPU16[(r45+2<<1>>1)+r29];r84=r54}else{if((r54|0)!=(r26|0)){r83=r54;r84=r44;break}r83=HEAPU16[(r45+2<<1>>1)+r29];r84=r44}}while(0);if(!((r84|0)<(r26|0)&(r83|0)<(r26|0))){r85=r11;break}if((r38|0)<=(r84|0)){r10=293;break L331}if((r84|0)==0){r86=0}else{r86=HEAP32[(r84-1<<2>>2)+r35]}r44=HEAP32[(r84<<2>>2)+r35];if((r86|0)>=(r44|0)){r85=r11;break}r45=r83>>>0<r84>>>0?r83:r84;r54=r83>>>0>r84>>>0?r83:r84;r63=Math.imul(r84,r5)|0;r47=Math.imul(r83,r5)|0;r59=r11;r55=r86;while(1){if((r21|0)<=(r55|0)){r10=300;break L331}if((r55|0)<=-1){r10=303;break L331}r67=HEAP32[r42+(r55<<2)>>2];if((r67|0)<0){r85=r59;break L349}r60=r67*3&-1;r67=HEAPU16[(r60<<1>>1)+r29];r66=(r67|0)==(r83|0);if((r67|0)>=(r26|0)|(r67|0)==(r84|0)){r87=-1}else{r87=r66?-1:r67}r67=HEAPU16[(r60+1<<1>>1)+r29];r88=(r67|0)==(r83|0);if((r67|0)>=(r26|0)|(r67|0)==(r84|0)){r89=r87}else{r89=r88?r87:r67}r67=HEAPU16[(r60+2<<1>>1)+r29];r60=(r67|0)==(r83|0);if((r67|0)>=(r26|0)|(r67|0)==(r84|0)){r90=r89}else{r90=r60?r89:r67}L376:do{if((r90|0)==-1|(r60|(r88|r66))^1){r91=r59}else{r67=r90^-1;do{if((r59|0)==0){r92=0;r10=321}else{r93=0;L379:while(1){r94=(r15+(r93*44&-1)|0)>>2;r95=r15+(r93*44&-1)+8|0;r96=HEAP32[r95>>2];do{if((r96|0)==(r67|0)){r97=HEAP32[((r93*44&-1)+4>>2)+r16];if((r54|0)!=(r97|0)){if((r54|0)<(r97|0)){break L379}else{break}}if((r45|0)==(HEAP32[r94]|0)){r91=r59;break L376}if((r45|0)<(HEAP32[r94]|0)){break L379}}else{if((r96|0)>(r67|0)){break L379}}}while(0);r96=r93+1|0;if(r96>>>0<r59>>>0){r93=r96}else{r10=320;break}}if(r10==320){r10=0;if(r59>>>0<8){r92=r59;r10=321;break}else{r91=r59;break L376}}r96=(r59>>>0<8&1)+r59|0;r97=r96-1|0;if(r97>>>0>r93>>>0){r98=r96;r99=r97;while(1){r97=r15+(r99*44&-1)|0;r100=r15+((r98-2)*44&-1)|0;_memcpy(r97,r100,44)|0;r100=r99-1|0;if(r100>>>0>r93>>>0){r98=r99;r99=r100}else{break}}}HEAP32[r94]=r45;HEAP32[((r93*44&-1)+4>>2)+r16]=r54;HEAP32[r95>>2]=r67;r101=r93;r102=r96}}while(0);if(r10==321){r10=0;HEAP32[((r92*44&-1)>>2)+r16]=r45;HEAP32[((r92*44&-1)+4>>2)+r16]=r54;HEAP32[((r92*44&-1)+8>>2)+r16]=r67;r101=r92;r102=r92+1|0}if((r101|0)==-1|r65){r91=r102;break}r99=Math.imul(r90,r5)|0;r98=HEAP32[r50]>>2;r100=0;while(1){HEAP32[((r100<<2)+(r101*44&-1)+12>>2)+r16]=HEAP32[(r100+r47<<2>>2)+r98]+HEAP32[(r100+r63<<2>>2)+r98]-HEAP32[(r100+r99<<2>>2)+r98];r97=r100+1|0;if(r97>>>0<r79>>>0){r100=r97}else{r91=r102;break}}}}while(0);r66=r55+1|0;if((r66|0)<(r44|0)){r59=r91;r55=r66}else{r85=r91;break}}}else{r85=r11}}while(0);if((r31|0)==6|(r31|0)==5|(r31|0)==1){r42=r46*3&-1;r55=r85;r59=0;while(1){r44=HEAPU16[(r59+r42<<1>>1)+r29];L408:do{if((r44|0)<(r26|0)){do{if((r55|0)==0){r103=0;r10=340}else{r63=0;L411:while(1){r104=(r15+(r63*44&-1)|0)>>2;r105=r15+(r63*44&-1)+8|0;r47=HEAP32[r105>>2];do{if((r44|0)==(r47|0)){r54=HEAP32[((r63*44&-1)+4>>2)+r16];if((r54|0)!=-1){if((r54|0)>-1){break L411}else{break}}if((HEAP32[r104]|0)==-1){r106=r55;break L408}if((HEAP32[r104]|0)>-1){break L411}}else{if((r44|0)<(r47|0)){break L411}}}while(0);r47=r63+1|0;if(r47>>>0<r55>>>0){r63=r47}else{r10=339;break}}if(r10==339){r10=0;if(r55>>>0<8){r103=r55;r10=340;break}else{r106=r55;break L408}}r47=(r55>>>0<8&1)+r55|0;r96=r47-1|0;if(r96>>>0>r63>>>0){r93=r47;r54=r96;while(1){r96=r15+(r54*44&-1)|0;r45=r15+((r93-2)*44&-1)|0;_memcpy(r96,r45,44)|0;r45=r54-1|0;if(r45>>>0>r63>>>0){r93=r54;r54=r45}else{break}}}HEAP32[r104]=-1;HEAP32[((r63*44&-1)+4>>2)+r16]=-1;HEAP32[r105>>2]=r44;if((r63|0)==-1){r106=r47;break L408}else{r107=r47;r108=r63}}}while(0);if(r10==340){r10=0;HEAP32[((r103*44&-1)>>2)+r16]=-1;HEAP32[((r103*44&-1)+4>>2)+r16]=-1;HEAP32[((r103*44&-1)+8>>2)+r16]=r44;r107=r103+1|0;r108=r103}if(r65){r106=r107;break}r54=Math.imul(r44,r5)|0;r93=HEAP32[r50];r45=0;while(1){HEAP32[((r45<<2)+(r108*44&-1)+12>>2)+r16]=HEAP32[r93+(r45+r54<<2)>>2];r96=r45+1|0;if(r96>>>0<r79>>>0){r45=r96}else{r106=r107;break}}}else{r106=r55}}while(0);r44=r59+1|0;if((r44|0)<3){r55=r106;r59=r44}else{r109=r106;break}}}else{r109=r85}r59=r53+1|0;if((r59|0)<(r33|0)){r11=r109;r53=r59}else{r82=r109;break}}if(r82>>>0<=1){r10=377;break}if((HEAP32[r34]|0)==1){r53=HEAP32[r22];HEAP32[r22]=r53+1;r110=HEAPU8[HEAP32[r36]+r53|0]}else{r110=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r17,r20)}if(r65){break}r53=Math.imul(r26,r5)|0;r11=0;while(1){do{if((HEAP32[r34]|0)==1){r31=HEAP32[r32];r21=r31+1|0;HEAP32[r32]=r21;r49=HEAP8[HEAP32[r36]+r31|0];r31=r49&255;if(r49<<24>>24==127){r49=0;r43=r31;r25=r21;while(1){r21=r25+1|0;HEAP32[r32]=r21;r59=HEAPU8[HEAP32[r36]+r25|0];r55=(r59>>>1<<r49)+r43|0;if((r59&1|0)==0){r111=r55;break}else{r49=r49+6|0;r43=r55;r25=r21}}}else{r111=r31}if((r111&1|0)==0){r112=r111>>>1;break}else{r112=-((r111+1|0)>>>1)|0;break}}else{r25=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r17,r23);if((r25|0)==(r41|0)){r43=0;r49=r40;L456:while(1){while(1){r21=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r17,r18);if((r21|0)==1){break}else if((r21|0)==0){r113=0;r114=r49;break L456}}r43=(1<<r49)+r43|0;r49=r49+1|0}L461:while(1){r49=r114;while(1){r115=r49-1|0;if((r49|0)==0){break L461}r31=HEAP32[r62];r21=r31>>>13<<12;r55=HEAP32[r48];r59=r55>>>0>=r21>>>0;if(r59){r42=r55-r21|0;HEAP32[r48]=r42;r116=r31-r21|0;r117=r42}else{r116=r21;r117=r55}HEAP32[r62]=r116;if(r116>>>0<16777216){r55=r117;r21=HEAP32[r58];r42=r116;while(1){r31=r21+1|0;HEAP32[r58]=r31;r46=HEAPU8[r31]|r55<<8;HEAP32[r48]=r46;r44=r42<<8;HEAP32[r62]=r44;if(r44>>>0<16777216){r55=r46;r21=r31;r42=r44}else{break}}}if(r59){break}else{r49=r115}}r113=1<<r115|r113;r114=r115}r118=r43+r41+r113|0}else{r118=r25}if((r118&1|0)==0){r112=r118>>>1;break}else{r112=-((r118+1|0)>>>1)|0;break}}}while(0);HEAP32[HEAP32[r50]+(r11+r53<<2)>>2]=HEAP32[((r11<<2)+(r110*44&-1)+12>>2)+r16]+r112;r49=r11+1|0;if(r49>>>0<r79>>>0){r11=r49}else{break}}}else{r10=377}}while(0);L481:do{if(r10==377){r10=0;do{if(r37){if((HEAP32[r12]|0)==0){break}if(r65){break L481}r33=Math.imul(r26-1|0,r5)|0;r35=Math.imul(r26,r5)|0;r38=0;while(1){do{if((HEAP32[r34]|0)==1){r11=HEAP32[r32];r53=r11+1|0;HEAP32[r32]=r53;r49=HEAP8[HEAP32[r36]+r11|0];r11=r49&255;if(r49<<24>>24==127){r49=0;r42=r11;r21=r53;while(1){r53=r21+1|0;HEAP32[r32]=r53;r55=HEAPU8[HEAP32[r36]+r21|0];r63=(r55>>>1<<r49)+r42|0;if((r55&1|0)==0){r119=r63;break}else{r49=r49+6|0;r42=r63;r21=r53}}}else{r119=r11}if((r119&1|0)==0){r120=r119>>>1;break}else{r120=-((r119+1|0)>>>1)|0;break}}else{r21=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r17,r23);if((r21|0)==(r41|0)){r42=0;r49=r40;L500:while(1){while(1){r53=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r17,r18);if((r53|0)==1){break}else if((r53|0)==0){r121=0;r122=r49;break L500}}r42=(1<<r49)+r42|0;r49=r49+1|0}L505:while(1){r49=r122;while(1){r123=r49-1|0;if((r49|0)==0){break L505}r11=HEAP32[r62];r59=r11>>>13<<12;r53=HEAP32[r48];r63=r53>>>0>=r59>>>0;if(r63){r55=r53-r59|0;HEAP32[r48]=r55;r124=r11-r59|0;r125=r55}else{r124=r59;r125=r53}HEAP32[r62]=r124;if(r124>>>0<16777216){r53=r125;r59=HEAP32[r58];r55=r124;while(1){r11=r59+1|0;HEAP32[r58]=r11;r47=HEAPU8[r11]|r53<<8;HEAP32[r48]=r47;r44=r55<<8;HEAP32[r62]=r44;if(r44>>>0<16777216){r53=r47;r59=r11;r55=r44}else{break}}}if(r63){break}else{r49=r123}}r121=1<<r123|r121;r122=r123}r126=r42+r41+r121|0}else{r126=r21}if((r126&1|0)==0){r120=r126>>>1;break}else{r120=-((r126+1|0)>>>1)|0;break}}}while(0);r25=HEAP32[r50];HEAP32[r25+(r38+r35<<2)>>2]=HEAP32[r25+(r38+r33<<2)>>2]+r120;r25=r38+1|0;if(r25>>>0<r79>>>0){r38=r25}else{break L481}}}}while(0);if(r65){break}r38=Math.imul(r26,r5)|0;r33=0;while(1){do{if((HEAP32[r34]|0)==1){r35=HEAP32[r32];r25=r35+1|0;HEAP32[r32]=r25;r43=HEAP8[HEAP32[r36]+r35|0];r35=r43&255;if(r43<<24>>24==127){r127=0;r128=r35;r129=r25}else{r130=r35;break}while(1){r35=r129+1|0;HEAP32[r32]=r35;r25=HEAPU8[HEAP32[r36]+r129|0];r43=(r25>>>1<<r127)+r128|0;if((r25&1|0)==0){r130=r43;break}else{r127=r127+6|0;r128=r43;r129=r35}}}else{r35=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r17,r23);if((r35|0)==(r41|0)){r131=0;r132=r40}else{r130=r35;break}L534:while(1){while(1){r35=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r17,r18);if((r35|0)==1){break}else if((r35|0)==0){r133=0;r134=r132;break L534}}r131=(1<<r132)+r131|0;r132=r132+1|0}L539:while(1){r21=r134;while(1){r135=r21-1|0;if((r21|0)==0){break L539}r42=HEAP32[r62];r35=r42>>>13<<12;r43=HEAP32[r48];r25=r43>>>0>=r35>>>0;if(r25){r49=r43-r35|0;HEAP32[r48]=r49;r136=r42-r35|0;r137=r49}else{r136=r35;r137=r43}HEAP32[r62]=r136;if(r136>>>0<16777216){r43=r137;r35=HEAP32[r58];r49=r136;while(1){r42=r35+1|0;HEAP32[r58]=r42;r55=HEAPU8[r42]|r43<<8;HEAP32[r48]=r55;r59=r49<<8;HEAP32[r62]=r59;if(r59>>>0<16777216){r43=r55;r35=r42;r49=r59}else{break}}}if(r25){break}else{r21=r135}}r133=1<<r135|r133;r134=r135}r130=r131+r41+r133|0}}while(0);HEAP32[HEAP32[r50]+(r33+r38<<2)>>2]=r130;r21=r33+1|0;if(r21>>>0<r79>>>0){r33=r21}else{break}}}}while(0);r37=r26+1|0;if((r37|0)<(r3|0)){r26=r37}else{break L329}}if(r10==269){___assert_func(3160,129,5496,2904)}else if(r10==280){___assert_func(3160,135,5544,3048)}else if(r10==283){___assert_func(3160,136,5544,2992)}else if(r10==293){___assert_func(3160,123,5448,2904)}else if(r10==300){___assert_func(3160,135,5544,3048)}else if(r10==303){___assert_func(3160,136,5544,2992)}}}while(0);HEAP32[r32]=HEAP32[r22];r26=(r79|0)==0;do{if((HEAP32[r12]|0)==6){if(!r26){r50=(1<<r8+1)-1|0;r62=0;while(1){r48=HEAPF32[(r62<<2)+9960>>2]-HEAPF32[(r62<<2)+9952>>2];if(r48>0){HEAPF32[(r62<<2>>2)+r14]=r48/r50}else{HEAPF32[(r62<<2>>2)+r14]=1}r48=r62+1|0;if(r48>>>0<r79>>>0){r62=r48}else{break}}}do{if((r3|0)!=0){r62=r1+3336|0;if(r26){break}else{r138=0}while(1){r50=Math.imul(r138,r5)|0;r48=0;while(1){r58=r48+r50|0;HEAPF32[r2+(r58<<2)>>2]=(HEAP32[HEAP32[r62>>2]+(r58<<2)>>2]|0)*HEAPF32[(r48<<2>>2)+r14]+HEAPF32[(r48<<2)+9952>>2];r58=r48+1|0;if(r58>>>0<r79>>>0){r48=r58}else{break}}r48=r138+1|0;if(r48>>>0<r3>>>0){r138=r48}else{break}}}}while(0);if(!r64){break}r62=r1+3356|0;r48=r1+3344|0;r50=0;while(1){r58=r50<<1;r65=HEAP32[r62>>2];r57=HEAPF32[r65+(r58<<2)>>2];r27=HEAPF32[r65+((r58|1)<<2)>>2];r58=Math.imul(r50,r5)|0;r65=(r58<<2)+r2|0;r52=(r58+1<<2)+r2|0;__ZN5o3dgc12CubeToSphereEffcRfS0_S0_(r57+HEAPF32[r65>>2],r27+HEAPF32[r52>>2],HEAP8[HEAP32[r48>>2]+r50|0],r65,r52,(r58+2<<2)+r2|0);r58=r50+1|0;if((r58|0)<(r3|0)){r50=r58}else{break}}}else{if(!r26){r50=(1<<r8)-1|0;r48=0;while(1){r62=HEAPF32[r7+(r48<<2)>>2]-HEAPF32[r6+(r48<<2)>>2];if(r62>0){HEAPF32[(r48<<2>>2)+r14]=r62/r50}else{HEAPF32[(r48<<2>>2)+r14]=1}r62=r48+1|0;if(r62>>>0<r79>>>0){r48=r62}else{break}}}if((r3|0)==0){break}r48=r1+3336|0;if(r26){break}else{r139=0}while(1){r50=Math.imul(r139,r5)|0;r62=0;while(1){r58=r62+r50|0;HEAPF32[r2+(r58<<2)>>2]=(HEAP32[HEAP32[r48>>2]+(r58<<2)>>2]|0)*HEAPF32[(r62<<2>>2)+r14]+HEAPF32[r6+(r62<<2)>>2];r58=r62+1|0;if(r58>>>0<r79>>>0){r62=r58}else{break}}r62=r139+1|0;if(r62>>>0<r3>>>0){r139=r62}else{break}}}}while(0);r26=HEAP32[r51>>2];if((r26|0)==0){r39=0;break}__ZdaPv(r26);r39=0}}while(0);r139=HEAP32[r19>>2];if((r139|0)!=0){__ZdaPv(r139)}r139=HEAP32[r28>>2];if((r139|0)==0){STACKTOP=r13;return r39}__ZdaPv(r139);STACKTOP=r13;return r39}function __ZN5o3dgc13SC3DMCDecoderItE14DecodeIntArrayEPlmmmRKNS_12BinaryStreamE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r7=STACKTOP;STACKTOP=STACKTOP+96|0;r8=r7;r9=r7+32,r10=r9>>2;r11=r7+56;r12=r8+24|0;HEAP32[r12>>2]=0;r13=(r8+28|0)>>2;HEAP32[r13]=0;r14=r8|0;HEAP32[r14>>2]=0;r15=r8+4|0;HEAP32[r15>>2]=0;HEAP32[r10+3]=1;HEAP32[r10+4]=2;HEAP32[r10+2]=4096;HEAP32[r10+1]=4;HEAP32[r10]=4;r10=r1|0,r16=r10>>2;r17=HEAP32[r16];r18=(r1+3464|0)>>2;r1=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r6,r10,HEAP32[r18]);HEAP32[r16]=HEAP32[r16]+1;r19=(r6|0)>>2;r20=__ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r6,r10,HEAP32[r18])-2147483647|0;r10=HEAP32[r16];if((HEAP32[r18]|0)==1){r21=0;r22=0}else{r6=r1+r17|0;r17=HEAP32[r19]+r10|0;HEAP32[r16]=r6;__ZN5o3dgc16Arithmetic_Codec10set_bufferEjPh(r8,r6-r10|0,r17);if((HEAP32[r13]|0)!=0){__ZN5o3dgcL8AC_ErrorEPKc(1112)}if((HEAP32[r12>>2]|0)==0){__ZN5o3dgcL8AC_ErrorEPKc(1368)}HEAP32[r13]=2;r13=(r8+20|0)>>2;HEAP32[r13]=-1;r12=HEAP32[r14>>2];r14=r12+3|0;r17=(r8+8|0)>>2;HEAP32[r17]=r14;r10=(r8+16|0)>>2;HEAP32[r10]=HEAPU8[r12+1|0]<<16|HEAPU8[r12]<<24|HEAPU8[r12+2|0]<<8|HEAPU8[r14];r14=0;r12=0;L632:while(1){while(1){r6=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r8,r9);if((r6|0)==1){break}else if((r6|0)==0){r23=0;r24=r12;break L632}}r14=(1<<r12)+r14|0;r12=r12+1|0}L637:while(1){r12=r24;while(1){r25=r12-1|0;if((r12|0)==0){r26=0;r27=0;break L637}r6=HEAP32[r13];r1=r6>>>13<<12;r28=HEAP32[r10];r29=r28>>>0>=r1>>>0;if(r29){r30=r28-r1|0;HEAP32[r10]=r30;r31=r6-r1|0;r32=r30}else{r31=r1;r32=r28}HEAP32[r13]=r31;if(r31>>>0<16777216){r28=r32;r1=HEAP32[r17];r30=r31;while(1){r6=r1+1|0;HEAP32[r17]=r6;r33=HEAPU8[r6]|r28<<8;HEAP32[r10]=r33;r34=r30<<8;HEAP32[r13]=r34;if(r34>>>0<16777216){r28=r33;r1=r6;r30=r34}else{break}}}if(r29){break}else{r12=r25}}r23=1<<r25|r23;r24=r25}L651:while(1){while(1){r25=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r8,r9);if((r25|0)==0){break L651}else if((r25|0)==1){break}}r26=(1<<r27)+r26|0;r27=r27+1|0}r25=r23+r14|0;r14=0;r23=r27;L657:while(1){r27=r23;while(1){r35=r27-1|0;if((r27|0)==0){break L657}r24=HEAP32[r13];r31=r24>>>13<<12;r32=HEAP32[r10];r12=r32>>>0>=r31>>>0;if(r12){r30=r32-r31|0;HEAP32[r10]=r30;r36=r24-r31|0;r37=r30}else{r36=r31;r37=r32}HEAP32[r13]=r36;if(r36>>>0<16777216){r32=r37;r31=HEAP32[r17];r30=r36;while(1){r24=r31+1|0;HEAP32[r17]=r24;r1=HEAPU8[r24]|r32<<8;HEAP32[r10]=r1;r28=r30<<8;HEAP32[r13]=r28;if(r28>>>0<16777216){r32=r1;r31=r24;r30=r28}else{break}}}if(r12){break}else{r27=r35}}r14=1<<r35|r14;r23=r35}r21=r14+r26|0;r22=r25}HEAP32[r11+24>>2]=0;r25=r11|0;HEAP32[r25>>2]=0;__ZN5o3dgc19Adaptive_Data_Model12set_alphabetEj(r11,r21+2|0);r26=(r3|0)>0;do{if((HEAP32[r18]|0)==1){if((r4|0)==0|r26^1){break}else{r38=0}while(1){r14=Math.imul(r38,r5)|0;r35=0;while(1){r23=HEAP32[r16];r13=r23+1|0;HEAP32[r16]=r13;r10=HEAP8[HEAP32[r19]+r23|0];r23=r10&255;if(r10<<24>>24==127){r10=0;r17=r23;r36=r13;while(1){r13=r36+1|0;HEAP32[r16]=r13;r37=HEAPU8[HEAP32[r19]+r36|0];r27=(r37>>>1<<r10)+r17|0;if((r37&1|0)==0){r39=r27;break}else{r10=r10+6|0;r17=r27;r36=r13}}}else{r39=r23}HEAP32[r2+(r35+r14<<2)>>2]=r39+r20;r36=r35+1|0;if(r36>>>0<r4>>>0){r35=r36}else{break}}r35=r38+1|0;if((r35|0)<(r3|0)){r38=r35}else{break}}}else{if(!r26){break}r35=(r4|0)==0;r14=(r8+20|0)>>2;r12=(r8+16|0)>>2;r36=r8+8|0;r17=0;while(1){if(!r35){r10=Math.imul(r17,r5)|0;r13=0;while(1){r27=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r8,r11);if((r27|0)==(r21|0)){r37=0;r30=r22;L684:while(1){while(1){r31=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r8,r9);if((r31|0)==1){break}else if((r31|0)==0){r40=0;r41=r30;break L684}}r37=(1<<r30)+r37|0;r30=r30+1|0}L689:while(1){r30=r41;while(1){r42=r30-1|0;if((r30|0)==0){break L689}r23=HEAP32[r14];r31=r23>>>13<<12;r32=HEAP32[r12];r29=r32>>>0>=r31>>>0;if(r29){r28=r32-r31|0;HEAP32[r12]=r28;r43=r23-r31|0;r44=r28}else{r43=r31;r44=r32}HEAP32[r14]=r43;if(r43>>>0<16777216){r32=r44;r31=HEAP32[r36>>2];r28=r43;while(1){r23=r31+1|0;HEAP32[r36>>2]=r23;r24=HEAPU8[r23]|r32<<8;HEAP32[r12]=r24;r1=r28<<8;HEAP32[r14]=r1;if(r1>>>0<16777216){r32=r24;r31=r23;r28=r1}else{break}}}if(r29){break}else{r30=r42}}r40=1<<r42|r40;r41=r42}r45=r37+r21+r40|0}else{r45=r27}HEAP32[r2+(r13+r10<<2)>>2]=r45+r20;r30=r13+1|0;if(r30>>>0<r4>>>0){r13=r30}else{break}}}r13=r17+1|0;if((r13|0)<(r3|0)){r17=r13}else{break}}}}while(0);r3=HEAP32[r25>>2];if((r3|0)!=0){__ZdaPv(r3)}r3=HEAP32[r15>>2];if((r3|0)==0){STACKTOP=r7;return 0}__ZdaPv(r3);STACKTOP=r7;return 0}function __ZN5o3dgc19TriangleListDecoderItE7ReorderEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r2=0;if((HEAP8[r1+204|0]&1)==0){return 0}r3=r1+44|0;r4=HEAP32[r3>>2];r5=r1+40|0;r6=HEAP32[r5>>2];r7=(r1+28|0)>>2;r8=HEAP32[r7]*6&-1;_memcpy(r4,r6,r8)|0;r8=HEAP32[r7];if((r8|0)<=0){return 0}r6=r1+160|0;r4=r1+152|0;r1=0;r9=0;r10=r8;while(1){if(r9>>>0>=HEAP32[r6>>2]>>>0){r2=551;break}r8=r9+1|0;r11=HEAP32[HEAP32[r4>>2]+(r9<<2)>>2];if((r11&1|0)==0){r12=r11>>>1}else{r12=-((r11+1|0)>>>1)|0}r11=r12+r1|0;if(!((r11|0)>-1&(r11|0)<(r10|0))){r2=556;break}r13=(((r11*3&-1)<<1)+HEAP32[r5>>2]|0)>>1;r14=(((r9*3&-1)<<1)+HEAP32[r3>>2]|0)>>1;HEAP16[r13]=HEAP16[r14];HEAP16[r13+1]=HEAP16[r14+1];HEAP16[r13+2]=HEAP16[r14+2];r14=HEAP32[r7];if((r8|0)<(r14|0)){r1=r11+1|0;r9=r8;r10=r14}else{r2=561;break}}if(r2==551){___assert_func(2120,125,4848,1392)}else if(r2==556){___assert_func(4176,104,6088,2784)}else if(r2==561){return 0}}function __ZNK5o3dgc12BinaryStream10ReadUInt32ERmNS_15O3DGCStreamTypeE(r1,r2,r3){var r4,r5,r6,r7,r8;r4=r2>>2;if((r3|0)!=1){r5=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r1,r2);return r5}r2=HEAP32[r4];if(r2>>>0>=(HEAP32[r1+8>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r3=(r1|0)>>2;r1=r2+1|0;HEAP32[r4]=r1;r6=HEAPU8[HEAP32[r3]+r2|0];r7=r2+2|0;HEAP32[r4]=r7;r8=(HEAPU8[HEAP32[r3]+r1|0]<<7)+r6|0;r6=r2+3|0;HEAP32[r4]=r6;r1=(HEAPU8[HEAP32[r3]+r7|0]<<14)+r8|0;r8=r2+4|0;HEAP32[r4]=r8;r7=(HEAPU8[HEAP32[r3]+r6|0]<<21)+r1|0;HEAP32[r4]=r2+5;r5=(HEAPU8[HEAP32[r3]+r8|0]<<28)+r7|0;return r5}function __ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=r2>>2;r2=HEAP32[r3];if(r2>>>0>=(HEAP32[r1+8>>2]-4|0)>>>0){___assert_func(2288,239,5728,1504)}r4=(HEAP32[r1+12>>2]|0)==0;r5=r2+1|0;HEAP32[r3]=r5;r6=(r1|0)>>2;r1=HEAPU8[HEAP32[r6]+r2|0];if(r4){r4=r2+2|0;HEAP32[r3]=r4;r7=HEAPU8[HEAP32[r6]+r5|0]<<16|r1<<24;r8=r2+3|0;HEAP32[r3]=r8;r9=r7|HEAPU8[HEAP32[r6]+r4|0]<<8;HEAP32[r3]=r2+4;r10=r9|HEAPU8[HEAP32[r6]+r8|0];return r10}else{r8=r2+2|0;HEAP32[r3]=r8;r9=HEAPU8[HEAP32[r6]+r5|0]<<8|r1;r1=r2+3|0;HEAP32[r3]=r1;r5=r9|HEAPU8[HEAP32[r6]+r8|0]<<16;HEAP32[r3]=r2+4;r10=r5|HEAPU8[HEAP32[r6]+r1|0]<<24;return r10}}function __ZN5o3dgc12CubeToSphereEffcRfS0_S0_(r1,r2,r3,r4,r5,r6){var r7,r8;r7=r6>>2;r6=r5>>2;r5=r4>>2;r4=r3<<24>>24;if((r4|0)==0){HEAPF32[r5]=r1;HEAPF32[r6]=r2;r3=HEAPF32[r5];r8=1-r3*r3-r2*r2;HEAPF32[r7]=Math.sqrt(r8>0?r8:0);return}else if((r4|0)==1){HEAPF32[r5]=-r1;HEAPF32[r6]=-r2;r8=HEAPF32[r5];r3=1-r8*r8-r2*r2;HEAPF32[r7]=-Math.sqrt(r3>0?r3:0);return}else if((r4|0)==2){HEAPF32[r7]=r1;HEAPF32[r5]=r2;r3=HEAPF32[r7];r8=1-r2*r2-r3*r3;HEAPF32[r6]=Math.sqrt(r8>0?r8:0);return}else if((r4|0)==3){HEAPF32[r7]=-r1;HEAPF32[r5]=-r2;r8=HEAPF32[r7];r3=1-r2*r2-r8*r8;HEAPF32[r6]=-Math.sqrt(r3>0?r3:0);return}else if((r4|0)==4){HEAPF32[r6]=r1;HEAPF32[r7]=r2;r3=HEAPF32[r6];r8=1-r3*r3-r2*r2;HEAPF32[r5]=Math.sqrt(r8>0?r8:0);return}else if((r4|0)==5){HEAPF32[r6]=-r1;HEAPF32[r7]=-r2;r7=HEAPF32[r6];r6=1-r7*r7-r2*r2;HEAPF32[r5]=-Math.sqrt(r6>0?r6:0);return}else{return}}function __ZN5o3dgc13SC3DMCDecoderItE14ProcessNormalsERKNS_14IndexedFaceSetItEE(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r3=0;r4=HEAP32[r2+16>>2];r5=r4<<1;r6=r1+3360|0;if(HEAP32[r6>>2]>>>0<r5>>>0){r7=r1+3356|0;r8=HEAP32[r7>>2];if((r8|0)!=0){__ZdaPv(r8)}HEAP32[r6>>2]=r5;r6=_llvm_umul_with_overflow_i32(r5,4);HEAP32[r7>>2]=__Znaj(tempRet0?-1:r6)}r6=HEAP32[r2+4>>2]>>1;HEAP32[r1+3352>>2]=0;if((r4|0)<=0){return 0}r2=r1+3208|0;r7=r1+3216|0;r5=r1+3344|0;r8=r1+3356|0;r9=r1+3200|0;r10=r1+3212|0;r11=r1+3336|0;r1=0;r12=0;r13=0;r14=0;L786:while(1){if((HEAP32[r2>>2]|0)<=(r14|0)){r3=600;break}if((r14|0)>0){r15=HEAP32[HEAP32[r7>>2]+(r14-1<<2)>>2]}else{r15=0}r16=HEAP32[HEAP32[r7>>2]+(r14<<2)>>2];L792:do{if((r15|0)<(r16|0)){r17=HEAP32[r9>>2];r18=0;r19=0;r20=0;r21=r15;while(1){if((r17|0)<=(r21|0)){r3=606;break L786}if((r21|0)<=-1){r3=608;break L786}r22=HEAP32[HEAP32[r10>>2]+(r21<<2)>>2];if((r22|0)==-1){r23=r18;r24=r19;r25=r20;break L792}r26=r22*3&-1;r22=HEAPU16[(r26<<1>>1)+r6]*3&-1;r27=HEAP32[r11>>2]>>2;r28=HEAP32[(r22<<2>>2)+r27];r29=HEAP32[(r22+1<<2>>2)+r27];r30=HEAP32[(r22+2<<2>>2)+r27];r22=HEAPU16[(r26+1<<1>>1)+r6]*3&-1;r31=HEAPU16[(r26+2<<1>>1)+r6]*3&-1;r26=HEAP32[(r22<<2>>2)+r27]-r28|0;r32=HEAP32[(r22+1<<2>>2)+r27]-r29|0;r33=HEAP32[(r22+2<<2>>2)+r27]-r30|0;r22=HEAP32[(r31<<2>>2)+r27]-r28|0;r28=HEAP32[(r31+1<<2>>2)+r27]-r29|0;r29=HEAP32[(r31+2<<2>>2)+r27]-r30|0;r30=Math.imul(r29,r32)|0;r27=Math.imul(r28,r33)|0;r31=Math.imul(r22,r33)|0;r33=Math.imul(r29,r26)|0;r29=r20-r27+r30|0;r30=r31+r19-r33|0;r33=(Math.imul(r28,r26)|0)+(r18-Math.imul(r22,r32))|0;r32=r21+1|0;if((r32|0)<(r16|0)){r18=r33;r19=r30;r20=r29;r21=r32}else{r23=r33;r24=r30;r25=r29;break}}}else{r23=0;r24=0;r25=0}}while(0);r16=r25|0;r21=r24|0;r20=r23|0;r19=Math.sqrt(r20*r20+r21*r21+r16*r16);r16=r19==0?1:r19;r19=-r25|0;r21=(r25|0)<0?r19:r25;r20=-r24|0;r18=(r24|0)<0?r20:r24;r17=-r23|0;r29=(r23|0)<0?r17:r23;do{if((r29|0)<(r21|0)|(r29|0)<(r18|0)){if(!((r18|0)<(r21|0)|(r18|0)<(r29|0))){r30=(r24|0)>-1;r34=r30?2:3;r35=r30?r25:r19;r36=r30?r23:r17;break}if((r21|0)<(r18|0)|(r21|0)<(r29|0)){r34=r13;r35=r12;r36=r1;break}r30=(r25|0)>-1;r34=r30?4:5;r35=r30?r23:r17;r36=r30?r24:r20}else{r30=(r23|0)>-1;r34=r23>>>31&255;r35=r30?r24:r20;r36=r30?r25:r19}}while(0);r19=HEAP32[r5>>2]+r14|0;r20=HEAP8[r19]+r34&255;HEAP8[r19]=r20;r19=(r20<<24>>25|0)==(r34<<24>>25|0);r20=r14<<1;HEAPF32[HEAP32[r8>>2]+(r20<<2)>>2]=r19?(r36|0)/r16:0;HEAPF32[HEAP32[r8>>2]+((r20|1)<<2)>>2]=r19?(r35|0)/r16:0;r19=r14+1|0;if((r19|0)<(r4|0)){r1=r36;r12=r35;r13=r34;r14=r19}else{r3=620;break}}if(r3==600){___assert_func(3160,123,5448,2904)}else if(r3==606){___assert_func(3160,135,5544,3048)}else if(r3==608){___assert_func(3160,136,5544,2992)}else if(r3==620){return 0}}function __ZN5o3dgc19TriangleListDecoderItE4InitEPtlll(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r6=r1>>2;if((r4|0)<=0){___assert_func(4176,35,6192,2072)}if((r3|0)<=0){___assert_func(4176,36,6192,2008)}r7=(r1+28|0)>>2;HEAP32[r7]=r3;r3=(r1+32|0)>>2;HEAP32[r3]=r4;HEAP32[r6+10]=r2;HEAP32[r6+12]=0;HEAP32[r6+13]=0;r2=r1+20|0;r8=r1>>2;HEAP32[r8]=0;HEAP32[r8+1]=0;HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAP32[r8+4]=0;if((HEAP32[r2>>2]|0)<(r4|0)){HEAP32[r2>>2]=r4;r2=r1+68|0;r8=HEAP32[r2>>2];if((r8|0)!=0){__ZdaPv(r8)}r8=r1+64|0;r9=HEAP32[r8>>2];if((r9|0)!=0){__ZdaPv(r9)}r9=_llvm_umul_with_overflow_i32(HEAP32[r3],4);HEAP32[r2>>2]=__Znaj(tempRet0?-1:r9);r9=_llvm_umul_with_overflow_i32(HEAP32[r3],4);HEAP32[r8>>2]=__Znaj(tempRet0?-1:r9)}do{if((HEAP8[r1+204|0]&1)!=0){r9=r1+36|0;r8=HEAP32[r7];if((HEAP32[r9>>2]|0)>=(r8|0)){break}r2=r1+44|0;r10=HEAP32[r2>>2];if((r10|0)==0){r11=r8}else{__ZdaPv(r10);r11=HEAP32[r7]}HEAP32[r9>>2]=r11;r9=_llvm_umul_with_overflow_i32(r11*3&-1,2);HEAP32[r2>>2]=__Znaj(tempRet0?-1:r9)}}while(0);HEAP32[r6+43]=HEAP32[r6+50];__ZN5o3dgc22CompressedTriangleFans8AllocateEll(r1+92|0,HEAP32[r3],HEAP32[r7]);r7=HEAP32[r3];__ZN5o3dgc12TriangleFans8AllocateEll(r1+176|0,r7<<1,r7<<3);r7=r1+76|0;r3=r1+88|0;r6=HEAP32[r3>>2];if((HEAP32[r7>>2]|0)<(r4|0)){if((r6|0)!=0){__ZdaPv(r6)}HEAP32[r7>>2]=r4;r7=_llvm_umul_with_overflow_i32(r4,4);r11=__Znaj(tempRet0?-1:r7);HEAP32[r3>>2]=r11;r12=r11}else{r12=r6}r6=(r1+80|0)>>2;HEAP32[r6]=r4;r11=(r1+88|0)>>2;r3=0;while(1){HEAP32[r12+(r3<<2)>>2]=r5;r7=r3+1|0;if((r7|0)<(r4|0)){r3=r7}else{break}}r3=HEAP32[r6];if((r3|0)>1){r4=1;while(1){r5=HEAP32[r11];r12=(r4<<2)+r5|0;HEAP32[r12>>2]=HEAP32[r12>>2]+HEAP32[r5+(r4-1<<2)>>2];r5=r4+1|0;r12=HEAP32[r6];if((r5|0)<(r12|0)){r4=r5}else{r13=r12;break}}}else{r13=r3}r3=HEAP32[r11];r4=(r1+72|0)>>2;r12=HEAP32[r4];r5=r1+84|0;r1=HEAP32[r5>>2];if((HEAP32[r3+(r13-1<<2)>>2]|0)<=(r12|0)){r14=r12;r15=r1;r16=r15;r17=r14<<2;_memset(r16,-1,r17);return 0}if((r1|0)==0){r18=r13;r19=r3}else{__ZdaPv(r1);r18=HEAP32[r6];r19=HEAP32[r11]}r11=HEAP32[r19+(r18-1<<2)>>2];HEAP32[r4]=r11;r18=_llvm_umul_with_overflow_i32(r11,4);r11=__Znaj(tempRet0?-1:r18);HEAP32[r5>>2]=r11;r14=HEAP32[r4];r15=r11;r16=r15;r17=r14<<2;_memset(r16,-1,r17);return 0}function __ZN5o3dgc19TriangleListDecoderItE27CompueLocalConnectivityInfoEl(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28;r3=0;r4=(r1+56|0)>>2;HEAP32[r4]=0;r5=(r1+60|0)>>2;HEAP32[r5]=0;r6=r1+80|0;r7=HEAP32[r6>>2];if((r7|0)<=(r2|0)){___assert_func(3160,123,5448,2904)}if((r2|0)<=-1){___assert_func(3160,124,5448,2992)}if((r2|0)>0){r8=r1+88|0;r9=HEAP32[HEAP32[r8>>2]+(r2-1<<2)>>2];r10=r8}else{r9=0;r10=r1+88|0}r8=r1+72|0;r11=r1+84|0;r12=r1+40|0;r13=(r1+64|0)>>2;r14=(r1+68|0)>>2;r1=r9;r9=r7;while(1){if((r9|0)<=(r2|0)){r3=660;break}if((r1|0)>=(HEAP32[HEAP32[r10>>2]+(r2<<2)>>2]|0)){r3=681;break}if((HEAP32[r8>>2]|0)<=(r1|0)){r3=663;break}if((r1|0)<=-1){r3=665;break}r7=HEAP32[HEAP32[r11>>2]+(r1<<2)>>2];r15=(r7|0)>-1;if(!r15){r3=681;break}HEAP32[r4]=HEAP32[r4]+1;r16=r7*3&-1;r7=0;while(1){r17=HEAPU16[HEAP32[r12>>2]+(r7+r16<<1)>>1];do{if((r17|0)>(r2|0)){r18=HEAP32[r5];r19=HEAP32[r13];r20=0;while(1){if((r20|0)>=(r18|0)){r3=677;break}r21=HEAP32[r19+(r20<<2)>>2];if((r17|0)==(r21|0)){r3=672;break}if((r17|0)<(r21|0)){r3=674;break}else{r20=r20+1|0}}if(r3==672){r3=0;r21=(r20<<2)+HEAP32[r14]|0;HEAP32[r21>>2]=HEAP32[r21>>2]+1;break}else if(r3==674){r3=0;HEAP32[r5]=r18+1;r21=r18;r22=r19;while(1){r23=r21-1|0;HEAP32[r22+(r21<<2)>>2]=HEAP32[r22+(r23<<2)>>2];r24=HEAP32[r14];HEAP32[r24+(r21<<2)>>2]=HEAP32[r24+(r23<<2)>>2];r25=HEAP32[r13];if((r23|0)>(r20|0)){r21=r23;r22=r25}else{break}}HEAP32[r25+(r20<<2)>>2]=r17;HEAP32[HEAP32[r14]+(r20<<2)>>2]=1;break}else if(r3==677){r3=0;HEAP32[r19+(r18<<2)>>2]=r17;HEAP32[HEAP32[r14]+(HEAP32[r5]<<2)>>2]=1;HEAP32[r5]=HEAP32[r5]+1;break}}}while(0);r17=r7+1|0;if((r17|0)<3){r7=r17}else{break}}if(!r15){r3=681;break}r1=r1+1|0;r9=HEAP32[r6>>2]}if(r3==660){___assert_func(3160,129,5496,2904)}else if(r3==663){___assert_func(3160,135,5544,3048)}else if(r3==665){___assert_func(3160,136,5544,2992)}else if(r3==681){r3=HEAP32[r5];if((r3|0)>2){r26=1;r27=r3}else{return 0}while(1){r3=HEAP32[r14];if((HEAP32[r3+(r26<<2)>>2]|0)==1){L903:do{if((r26|0)>0){r6=r26;r9=r3;r1=1;while(1){r25=r6-1|0;r2=(r25<<2)+r9|0;r12=HEAP32[r2>>2];if((r1|0)>=(r12|0)){break L903}HEAP32[r9+(r6<<2)>>2]=r12;HEAP32[r2>>2]=r1;r2=HEAP32[r13];r12=(r6<<2)+r2|0;r4=(r25<<2)+r2|0;r2=HEAP32[r12>>2];HEAP32[r12>>2]=HEAP32[r4>>2];HEAP32[r4>>2]=r2;if((r25|0)<=0){break L903}r2=HEAP32[r14];r6=r25;r9=r2;r1=HEAP32[r2+(r25<<2)>>2]}}}while(0);r28=HEAP32[r5]}else{r28=r27}r3=r26+1|0;if((r3|0)<(r28|0)){r26=r3;r27=r28}else{break}}return 0}}function __ZN5o3dgc19TriangleListDecoderItE14DecompressTFANEl(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40;r3=0;r4=r1|0;r5=HEAP32[r4>>2];if(r5>>>0>=HEAP32[r1+100>>2]>>>0){___assert_func(2120,75,5008,2088)}HEAP32[r4>>2]=r5+1;r4=HEAP32[HEAP32[r1+92>>2]+(r5<<2)>>2];if((r4|0)<=0){return 0}r5=r1+176|0;r6=r1+4|0;r7=r1+112|0;r8=r1+104|0;r9=r1+56|0;r10=r1+8|0;r11=r1+124|0;r12=r1+116|0;r13=(r1+188|0)>>2;r14=r1+192|0;r15=(r1+52|0)>>2;r16=r2&65535;r17=(r1+40|0)>>2;r18=r1+72|0;r19=(r1+64|0)>>2;r20=(r1+48|0)>>2;r21=(r1+60|0)>>2;r22=(r1+12|0)>>2;r23=(r1+136|0)>>2;r24=(r1+128|0)>>2;r25=(r1+16|0)>>2;r26=(r1+148|0)>>2;r27=(r1+140|0)>>2;r1=0;L918:while(1){__ZN5o3dgc12TriangleFans7AddTFANEv(r5);r28=HEAP32[r6>>2];if(r28>>>0>=HEAP32[r7>>2]>>>0){r3=697;break}HEAP32[r6>>2]=r28+1;r29=HEAP32[HEAP32[r8>>2]+(r28<<2)>>2]+2-HEAP32[r9>>2]|0;r28=HEAP32[r10>>2];if(r28>>>0>=HEAP32[r11>>2]>>>0){r3=699;break}HEAP32[r10>>2]=r28+1;r30=HEAP32[HEAP32[r12>>2]+(r28<<2)>>2];r28=HEAP32[r13];__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r2);do{if((r30|0)==5){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+4>>2]);if((r29|0)>1){r31=1}else{break}while(1){r32=HEAP32[r20];r33=HEAP32[r21];HEAP32[r21]=r33+1;HEAP32[HEAP32[r19]+(r33<<2)>>2]=r32;r32=HEAP32[r20];HEAP32[r20]=r32+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r32);r32=r31+1|0;if((r32|0)<(r29|0)){r31=r32}else{break}}}else if((r30|0)==7){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+4>>2]);r32=r29-1|0;if((r32|0)>1){r33=1;while(1){r34=HEAP32[r20];r35=HEAP32[r21];HEAP32[r21]=r35+1;HEAP32[HEAP32[r19]+(r35<<2)>>2]=r34;r34=HEAP32[r20];HEAP32[r20]=r34+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r34);r34=r33+1|0;if((r34|0)<(r32|0)){r33=r34}else{break}}}__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]>>2])}else if((r30|0)==2){r33=r29-1|0;if((r33|0)>0){r32=0;while(1){r34=HEAP32[r20];r35=HEAP32[r21];HEAP32[r21]=r35+1;HEAP32[HEAP32[r19]+(r35<<2)>>2]=r34;r34=HEAP32[r20];HEAP32[r20]=r34+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r34);r34=r32+1|0;if((r34|0)<(r33|0)){r32=r34}else{break}}}__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]>>2])}else if((r30|0)==3){r32=r29-1|0;if((r32|0)>0){r33=0;while(1){r34=HEAP32[r20];r35=HEAP32[r21];HEAP32[r21]=r35+1;HEAP32[HEAP32[r19]+(r35<<2)>>2]=r34;r34=HEAP32[r20];HEAP32[r20]=r34+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r34);r34=r33+1|0;if((r34|0)<(r32|0)){r33=r34}else{break}}}__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+4>>2])}else if((r30|0)==6){if((r29|0)>0){r36=0}else{break}while(1){r33=HEAP32[r20];r32=HEAP32[r21];HEAP32[r21]=r32+1;HEAP32[HEAP32[r19]+(r32<<2)>>2]=r33;r33=HEAP32[r20];HEAP32[r20]=r33+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r33);r33=r36+1|0;if((r33|0)<(r29|0)){r36=r33}else{break}}}else if((r30|0)==9){if((r29|0)>0){r37=0}else{break}while(1){r33=HEAP32[r22];if(r33>>>0>=HEAP32[r23]>>>0){r3=745;break L918}HEAP32[r22]=r33+1;do{if((HEAP32[HEAP32[r24]+(r33<<2)>>2]|0)==1){r32=HEAP32[r25];if(r32>>>0>=HEAP32[r26]>>>0){r3=748;break L918}HEAP32[r25]=r32+1;r34=HEAP32[HEAP32[r27]+(r32<<2)>>2];if((r34|0)<0){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+((r34^-1)<<2)>>2]);break}else{__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r34+r2|0);break}}else{r34=HEAP32[r20];r32=HEAP32[r21];HEAP32[r21]=r32+1;HEAP32[HEAP32[r19]+(r32<<2)>>2]=r34;r34=HEAP32[r20];HEAP32[r20]=r34+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r34)}}while(0);r33=r37+1|0;if((r33|0)<(r29|0)){r37=r33}else{break}}}else if((r30|0)==0){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]>>2]);r33=r29-1|0;if((r33|0)>1){r34=1;while(1){r32=HEAP32[r20];r35=HEAP32[r21];HEAP32[r21]=r35+1;HEAP32[HEAP32[r19]+(r35<<2)>>2]=r32;r32=HEAP32[r20];HEAP32[r20]=r32+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r32);r32=r34+1|0;if((r32|0)<(r33|0)){r34=r32}else{break}}}__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+4>>2])}else if((r30|0)==1){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]>>2]);r34=r29-1|0;if((r34|0)>1){r33=1;while(1){r32=HEAP32[r22];if(r32>>>0>=HEAP32[r23]>>>0){r3=710;break L918}HEAP32[r22]=r32+1;do{if((HEAP32[HEAP32[r24]+(r32<<2)>>2]|0)==1){r35=HEAP32[r25];if(r35>>>0>=HEAP32[r26]>>>0){r3=713;break L918}HEAP32[r25]=r35+1;r38=HEAP32[HEAP32[r27]+(r35<<2)>>2];if((r38|0)<0){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+((r38^-1)<<2)>>2]);break}else{__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r38+r2|0);break}}else{r38=HEAP32[r20];r35=HEAP32[r21];HEAP32[r21]=r35+1;HEAP32[HEAP32[r19]+(r35<<2)>>2]=r38;r38=HEAP32[r20];HEAP32[r20]=r38+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r38)}}while(0);r32=r33+1|0;if((r32|0)<(r34|0)){r33=r32}else{break}}}__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+4>>2])}else if((r30|0)==4){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]>>2]);if((r29|0)>1){r39=1}else{break}while(1){r33=HEAP32[r20];r34=HEAP32[r21];HEAP32[r21]=r34+1;HEAP32[HEAP32[r19]+(r34<<2)>>2]=r33;r33=HEAP32[r20];HEAP32[r20]=r33+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r33);r33=r39+1|0;if((r33|0)<(r29|0)){r39=r33}else{break}}}else if((r30|0)==8){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+4>>2]);r33=r29-1|0;if((r33|0)>1){r34=1;while(1){r32=HEAP32[r22];if(r32>>>0>=HEAP32[r23]>>>0){r3=734;break L918}HEAP32[r22]=r32+1;do{if((HEAP32[HEAP32[r24]+(r32<<2)>>2]|0)==1){r38=HEAP32[r25];if(r38>>>0>=HEAP32[r26]>>>0){r3=737;break L918}HEAP32[r25]=r38+1;r35=HEAP32[HEAP32[r27]+(r38<<2)>>2];if((r35|0)<0){__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]+((r35^-1)<<2)>>2]);break}else{__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r35+r2|0);break}}else{r35=HEAP32[r20];r38=HEAP32[r21];HEAP32[r21]=r38+1;HEAP32[HEAP32[r19]+(r38<<2)>>2]=r35;r35=HEAP32[r20];HEAP32[r20]=r35+1;__ZN5o3dgc12TriangleFans9AddVertexEl(r5,r35)}}while(0);r32=r34+1|0;if((r32|0)<(r33|0)){r34=r32}else{break}}}__ZN5o3dgc12TriangleFans9AddVertexEl(r5,HEAP32[HEAP32[r19]>>2])}}while(0);r29=HEAP32[r13];r30=r28+1|0;if((r29|0)<=(r30|0)){r3=755;break}if((r30|0)<=-1){r3=757;break}r34=r28+2|0;L995:do{if((r34|0)<(r29|0)){r33=HEAP32[HEAP32[r14>>2]+(r30<<2)>>2];r32=r34;r35=r29;while(1){if((r35|0)<=(r32|0)){r3=761;break L918}if((r32|0)<=-1){r3=763;break L918}r38=HEAP32[HEAP32[r14>>2]+(r32<<2)>>2];r40=HEAP32[r15]*3&-1;HEAP16[HEAP32[r17]+(r40<<1)>>1]=r16;HEAP16[HEAP32[r17]+(r40+1<<1)>>1]=r33&65535;HEAP16[HEAP32[r17]+(r40+2<<1)>>1]=r38&65535;__ZN5o3dgc13AdjacencyInfo11AddNeighborEll(r18,r2,HEAP32[r15]);__ZN5o3dgc13AdjacencyInfo11AddNeighborEll(r18,r33,HEAP32[r15]);__ZN5o3dgc13AdjacencyInfo11AddNeighborEll(r18,r38,HEAP32[r15]);HEAP32[r15]=HEAP32[r15]+1;r40=r32+1|0;if((r40|0)>=(r29|0)){break L995}r33=r38;r32=r40;r35=HEAP32[r13]}}}while(0);r29=r1+1|0;if((r29|0)==(r4|0)){r3=768;break}else{r1=r29}}if(r3==755){___assert_func(2120,263,5600,2696)}else if(r3==757){___assert_func(2120,264,5600,2664)}else if(r3==761){___assert_func(2120,263,5600,2696)}else if(r3==763){___assert_func(2120,264,5600,2664)}else if(r3==734){___assert_func(2120,105,4928,2584)}else if(r3==745){___assert_func(2120,105,4928,2584)}else if(r3==748){___assert_func(2120,115,4776,2624)}else if(r3==737){___assert_func(2120,115,4776,2624)}else if(r3==768){return 0}else if(r3==697){___assert_func(2120,85,5080,2232)}else if(r3==699){___assert_func(2120,95,5152,2392)}else if(r3==710){___assert_func(2120,105,4928,2584)}else if(r3==713){___assert_func(2120,115,4776,2624)}}function __ZN5o3dgc12TriangleFans7AddTFANEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r2=(r1+8|0)>>2;r3=HEAP32[r2];if((r3|0)<=-1){___assert_func(2120,236,7408,2520)}r4=r3+1|0;HEAP32[r2]=r4;r3=r1+4|0;do{if((r4|0)==(HEAP32[r3>>2]|0)){r5=r4<<1;HEAP32[r3>>2]=r5;r6=r1+20|0;r7=HEAP32[r6>>2];r8=_llvm_umul_with_overflow_i32(r5,4);r5=__Znaj(tempRet0?-1:r8);HEAP32[r6>>2]=r5;r6=r7;r8=HEAP32[r2];r9=r8<<2;_memcpy(r5,r6,r9)|0;if((r7|0)==0){r10=r8;break}__ZdaPv(r6);r10=HEAP32[r2]}else{r10=r4}}while(0);if((r10|0)>1){r4=HEAP32[r1+20>>2];r11=HEAP32[r4+(r10-2<<2)>>2];r12=r4;r13=r10-1|0;r14=(r13<<2)+r12|0;HEAP32[r14>>2]=r11;return 0}else{r11=0;r12=HEAP32[r1+20>>2];r13=r10-1|0;r14=(r13<<2)+r12|0;HEAP32[r14>>2]=r11;return 0}}function __ZN5o3dgc12TriangleFans9AddVertexEl(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r3=r1+8|0;r4=HEAP32[r3>>2];if((r4|0)<=-1){___assert_func(2120,218,7280,2520)}if((r4|0)>=(HEAP32[r1+4>>2]|0)){___assert_func(2120,219,7280,2480)}r4=(r1+12|0)>>2;r5=HEAP32[r4];if((r5|0)<=-1){___assert_func(2120,220,7280,2432)}r6=r5+1|0;HEAP32[r4]=r6;r5=r1|0;do{if((r6|0)==(HEAP32[r5>>2]|0)){r7=r6<<1;HEAP32[r5>>2]=r7;r8=r1+16|0;r9=HEAP32[r8>>2];r10=_llvm_umul_with_overflow_i32(r7,4);r7=__Znaj(tempRet0?-1:r10);HEAP32[r8>>2]=r7;r10=r9;r11=HEAP32[r4];r12=r11<<2;_memcpy(r7,r10,r12)|0;if((r9|0)==0){r13=r11;r14=r8;break}__ZdaPv(r10);r13=HEAP32[r4];r14=r8}else{r13=r6;r14=r1+16|0}}while(0);HEAP32[HEAP32[r14>>2]+(r13-1<<2)>>2]=r2;r2=(HEAP32[r3>>2]-1<<2)+HEAP32[r1+20>>2]|0;HEAP32[r2>>2]=HEAP32[r2>>2]+1;return 0}function __ZN5o3dgc13AdjacencyInfo11AddNeighborEll(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;r4=0;r5=HEAP32[r1+16>>2]>>2;r6=HEAP32[(r2<<2>>2)+r5];r7=HEAP32[r1+8>>2];if((r6|0)>(HEAP32[(r7-1<<2>>2)+r5]|0)){___assert_func(3160,108,7208,2720)}if((r7|0)<=(r2|0)){___assert_func(3160,123,5448,2904)}if((r2|0)<=-1){___assert_func(3160,124,5448,2992)}if((r2|0)>0){r8=HEAP32[(r2-1<<2>>2)+r5]}else{r8=0}r5=r1+12|0;r1=r8;while(1){if((r1|0)>=(r6|0)){r9=1;r4=805;break}r10=(r1<<2)+HEAP32[r5>>2]|0;if((HEAP32[r10>>2]|0)==-1){break}else{r1=r1+1|0}}if(r4==805){return r9}HEAP32[r10>>2]=r3;r9=0;return r9}function __ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r3=r2+8|0;r4=(r1+20|0)>>2;r5=HEAP32[r4];r6=Math.imul(r5>>>13,HEAP32[r3>>2])|0;r7=(r1+16|0)>>2;r8=HEAP32[r7];r9=r8>>>0>=r6>>>0;r10=r9&1;if(r9){HEAP32[r7]=r8-r6;r8=r5-r6|0;HEAP32[r4]=r8;r11=r8}else{HEAP32[r4]=r6;r6=r2+12|0;HEAP32[r6>>2]=HEAP32[r6>>2]+1;r11=HEAP32[r4]}if(r11>>>0<16777216){r6=r1+8|0;r1=HEAP32[r7];r8=HEAP32[r6>>2];r5=r11;while(1){r11=r8+1|0;HEAP32[r6>>2]=r11;r9=HEAPU8[r11]|r1<<8;HEAP32[r7]=r9;r12=r5<<8;HEAP32[r4]=r12;if(r12>>>0<16777216){r1=r9;r8=r11;r5=r12}else{break}}}r5=(r2+4|0)>>2;r8=HEAP32[r5]-1|0;HEAP32[r5]=r8;if((r8|0)!=0){return r10}r8=r2|0;r1=HEAP32[r8>>2];r4=(r2+16|0)>>2;r7=HEAP32[r4]+r1|0;HEAP32[r4]=r7;do{if(r7>>>0>8192){r6=(r7+1|0)>>>1;HEAP32[r4]=r6;r12=r2+12|0;r11=(HEAP32[r12>>2]+1|0)>>>1;HEAP32[r12>>2]=r11;if((r11|0)!=(r6|0)){r13=r6;r14=r11;break}r11=r6+1|0;HEAP32[r4]=r11;r13=r11;r14=r6}else{r13=r7;r14=HEAP32[r2+12>>2]}}while(0);HEAP32[r3>>2]=(Math.imul(Math.floor(2147483648/(r13>>>0)),r14)|0)>>>18;r14=r1*5&-1;r1=r14>>>0>259?64:r14>>>2;HEAP32[r8>>2]=r1;HEAP32[r5]=r1;return r10}function __ZN5o3dgc19Adaptive_Data_Model6updateEb(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r3=0;r4=(r1+16|0)>>2;r5=(r1+12|0)>>2;r6=HEAP32[r5]+HEAP32[r4]|0;HEAP32[r5]=r6;do{if(r6>>>0>32768){HEAP32[r5]=0;r7=r1+24|0;if((HEAP32[r7>>2]|0)==0){r8=0;break}r9=r1+4|0;r10=0;while(1){r11=(r10<<2)+HEAP32[r9>>2]|0;r12=(HEAP32[r11>>2]+1|0)>>>1;HEAP32[r11>>2]=r12;r11=r12+HEAP32[r5]|0;HEAP32[r5]=r11;r12=r10+1|0;if(r12>>>0<HEAP32[r7>>2]>>>0){r10=r12}else{r8=r11;break}}}else{r8=r6}}while(0);r6=Math.floor(2147483648/(r8>>>0));do{if(!r2){r8=(r1+32|0)>>2;if((HEAP32[r8]|0)==0){break}r5=(r1+24|0)>>2;if((HEAP32[r5]|0)==0){r10=r1+8|0;HEAP32[HEAP32[r10>>2]>>2]=0;r13=r10;r14=0;r3=839}else{r10=r1|0;r7=r1+4|0;r9=r1+36|0;r11=r1+8|0;r12=0;r15=0;r16=0;while(1){r17=(Math.imul(r15,r6)|0)>>>16;HEAP32[HEAP32[r10>>2]+(r16<<2)>>2]=r17;r17=HEAP32[HEAP32[r7>>2]+(r16<<2)>>2]+r15|0;r18=HEAP32[HEAP32[r10>>2]+(r16<<2)>>2]>>>(HEAP32[r9>>2]>>>0);if(r12>>>0<r18>>>0){r19=r16-1|0;r20=r12;while(1){r21=r20+1|0;HEAP32[HEAP32[r11>>2]+(r21<<2)>>2]=r19;if(r21>>>0<r18>>>0){r20=r21}else{r22=r18;break}}}else{r22=r12}r18=r16+1|0;if(r18>>>0<HEAP32[r5]>>>0){r12=r22;r15=r17;r16=r18}else{break}}HEAP32[HEAP32[r11>>2]>>2]=0;if(r22>>>0<=HEAP32[r8]>>>0){r13=r11;r14=r22;r3=839}}if(r3==839){r16=r14;while(1){r15=r16+1|0;HEAP32[HEAP32[r13>>2]+(r15<<2)>>2]=HEAP32[r5]-1;if(r15>>>0>HEAP32[r8]>>>0){break}else{r16=r15}}}r23=HEAP32[r5];r24=HEAP32[r4];r25=r24*5&-1;r26=r25>>>2;r27=r23<<3;r28=r27+48|0;r29=r26>>>0>r28>>>0;r30=r29?r28:r26;HEAP32[r4]=r30;r31=r1+20|0,r32=r31>>2;HEAP32[r32]=r30;return}}while(0);r13=r1+24|0;if((HEAP32[r13>>2]|0)==0){r23=0;r24=HEAP32[r4];r25=r24*5&-1;r26=r25>>>2;r27=r23<<3;r28=r27+48|0;r29=r26>>>0>r28>>>0;r30=r29?r28:r26;HEAP32[r4]=r30;r31=r1+20|0,r32=r31>>2;HEAP32[r32]=r30;return}r14=r1|0;r3=r1+4|0;r22=0;r2=0;while(1){r16=(Math.imul(r22,r6)|0)>>>16;HEAP32[HEAP32[r14>>2]+(r2<<2)>>2]=r16;r16=r2+1|0;r8=HEAP32[r13>>2];if(r16>>>0<r8>>>0){r22=HEAP32[HEAP32[r3>>2]+(r2<<2)>>2]+r22|0;r2=r16}else{r23=r8;break}}r24=HEAP32[r4];r25=r24*5&-1;r26=r25>>>2;r27=r23<<3;r28=r27+48|0;r29=r26>>>0>r28>>>0;r30=r29?r28:r26;HEAP32[r4]=r30;r31=r1+20|0,r32=r31>>2;HEAP32[r32]=r30;return}function __ZN5o3dgc19TriangleListDecoderItED2Ev(r1){var r2,r3;r2=r1>>2;r3=HEAP32[r2+11];if((r3|0)!=0){__ZdaPv(r3)}r3=HEAP32[r2+48];if((r3|0)!=0){__ZdaPv(r3)}r3=HEAP32[r2+49];if((r3|0)!=0){__ZdaPv(r3)}__ZN5o3dgc22CompressedTriangleFansD2Ev(r1+92|0);r1=HEAP32[r2+21];if((r1|0)!=0){__ZdaPv(r1)}r1=HEAP32[r2+22];if((r1|0)==0){return}__ZdaPv(r1);return}function __ZN5o3dgc22CompressedTriangleFansD2Ev(r1){var r2;r2=r1>>2;r1=HEAP32[r2+18];if((r1|0)!=0){__ZdaPv(r1)}r1=HEAP32[r2+15];if((r1|0)!=0){__ZdaPv(r1)}r1=HEAP32[r2+12];if((r1|0)!=0){__ZdaPv(r1)}r1=HEAP32[r2+9];if((r1|0)!=0){__ZdaPv(r1)}r1=HEAP32[r2+6];if((r1|0)!=0){__ZdaPv(r1)}r1=HEAP32[r2+3];if((r1|0)!=0){__ZdaPv(r1)}r1=HEAP32[r2];if((r1|0)==0){return}__ZdaPv(r1);return}function __ZN5o3dgc19TriangleListDecoderItEC2Ev(r1){var r2,r3,r4;r2=r1>>2;HEAP32[r2+20]=0;r3=r1+72|0;HEAP32[r3>>2]=16;HEAP32[r2+19]=16;HEAP32[r2+22]=__Znaj(64);r4=_llvm_umul_with_overflow_i32(HEAP32[r3>>2],4);HEAP32[r2+21]=__Znaj(tempRet0?-1:r4);_memset(r1+92|0,0,84);HEAP32[r2+46]=0;HEAP32[r2+47]=0;r4=r1+176|0;HEAP32[r4>>2]=128;HEAP32[r2+45]=8;HEAP32[r2+49]=__Znaj(32);r3=_llvm_umul_with_overflow_i32(HEAP32[r4>>2],4);HEAP32[r2+48]=__Znaj(tempRet0?-1:r3);HEAP8[r1+204|0]=0;HEAP8[r1+205|0]=0;_memset(r1,0,72);return}function __GLOBAL__I_a(){var r1,r2,r3;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r2=r1;HEAP32[r2>>2]=2;r3=r2+4|0;HEAP32[r3>>2]=17368;HEAP32[r2+8>>2]=17368;__embind_register_function(4288,2,r3,530,696);STACKTOP=r1;return}function __ZN5o3dgc22CompressedTriangleFans8AllocateEll(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r4=r1>>2;if((r2|0)<=0){___assert_func(2120,58,6008,2072)}r5=r1+4|0;if(HEAP32[r5>>2]>>>0<r2>>>0){HEAP32[r5>>2]=r2;r5=_llvm_umul_with_overflow_i32(r2,4);r6=__Znaj(tempRet0?-1:r5);r5=r6;r7=HEAP32[r4+2];r8=r1|0;do{if((r7|0)!=0){r9=HEAP32[r8>>2];r10=r9;r11=r7<<2;_memcpy(r6,r10,r11)|0;if((r9|0)==0){break}__ZdaPv(r10)}}while(0);HEAP32[r8>>2]=r5}r5=r2<<1;r2=r1+16|0;if(HEAP32[r2>>2]>>>0<r5>>>0){HEAP32[r2>>2]=r5;r2=_llvm_umul_with_overflow_i32(r5,4);r8=__Znaj(tempRet0?-1:r2);r2=r8;r6=HEAP32[r4+5];r7=r1+12|0;do{if((r6|0)!=0){r10=HEAP32[r7>>2];r9=r10;r11=r6<<2;_memcpy(r8,r9,r11)|0;if((r10|0)==0){break}__ZdaPv(r9)}}while(0);HEAP32[r7>>2]=r2}r2=r1+28|0;if(HEAP32[r2>>2]>>>0<r5>>>0){HEAP32[r2>>2]=r5;r2=_llvm_umul_with_overflow_i32(r5,4);r7=__Znaj(tempRet0?-1:r2);r2=r7;r8=HEAP32[r4+8];r6=r1+24|0;do{if((r8|0)!=0){r9=HEAP32[r6>>2];r10=r9;r11=r8<<2;_memcpy(r7,r10,r11)|0;if((r9|0)==0){break}__ZdaPv(r10)}}while(0);HEAP32[r6>>2]=r2}r2=r1+40|0;if(HEAP32[r2>>2]>>>0<r5>>>0){HEAP32[r2>>2]=r5;r2=_llvm_umul_with_overflow_i32(r5,4);r6=__Znaj(tempRet0?-1:r2);r2=r6;r7=HEAP32[r4+11];r8=r1+36|0;do{if((r7|0)!=0){r10=HEAP32[r8>>2];r9=r10;r11=r7<<2;_memcpy(r6,r9,r11)|0;if((r10|0)==0){break}__ZdaPv(r9)}}while(0);HEAP32[r8>>2]=r2}r2=r1+52|0;if(HEAP32[r2>>2]>>>0<r5>>>0){HEAP32[r2>>2]=r5;r2=_llvm_umul_with_overflow_i32(r5,4);r5=__Znaj(tempRet0?-1:r2);r2=r5;r8=HEAP32[r4+14];r6=r1+48|0;do{if((r8|0)!=0){r7=HEAP32[r6>>2];r9=r7;r10=r8<<2;_memcpy(r5,r9,r10)|0;if((r7|0)==0){break}__ZdaPv(r9)}}while(0);HEAP32[r6>>2]=r2}r2=r1+64|0;if(HEAP32[r2>>2]>>>0>=r3>>>0){r12=r1+8|0;HEAP32[r12>>2]=0;r13=r1+20|0;HEAP32[r13>>2]=0;r14=r1+32|0;HEAP32[r14>>2]=0;r15=r1+44|0;HEAP32[r15>>2]=0;r16=r1+56|0;HEAP32[r16>>2]=0;return 0}HEAP32[r2>>2]=r3;r2=_llvm_umul_with_overflow_i32(r3,4);r3=__Znaj(tempRet0?-1:r2);r2=r3;r6=HEAP32[r4+17];r4=r1+60|0;do{if((r6|0)!=0){r5=HEAP32[r4>>2];r8=r5;r9=r6<<2;_memcpy(r3,r8,r9)|0;if((r5|0)==0){break}__ZdaPv(r8)}}while(0);HEAP32[r4>>2]=r2;r12=r1+8|0;HEAP32[r12>>2]=0;r13=r1+20|0;HEAP32[r13>>2]=0;r14=r1+32|0;HEAP32[r14>>2]=0;r15=r1+44|0;HEAP32[r15>>2]=0;r16=r1+56|0;HEAP32[r16>>2]=0;return 0}function __ZN5o3dgc12TriangleFans8AllocateEll(r1,r2,r3){var r4,r5,r6;if((r2|0)<=0){___assert_func(2120,192,7344,1976)}if((r3|0)<=0){___assert_func(2120,193,7344,1912)}HEAP32[r1+8>>2]=0;HEAP32[r1+12>>2]=0;r4=r1|0;if((HEAP32[r4>>2]|0)<(r3|0)){r5=r1+16|0;r6=HEAP32[r5>>2];if((r6|0)!=0){__ZdaPv(r6)}HEAP32[r4>>2]=r3;r4=_llvm_umul_with_overflow_i32(r3,4);HEAP32[r5>>2]=__Znaj(tempRet0?-1:r4)}r4=r1+4|0;if((HEAP32[r4>>2]|0)>=(r2|0)){return 0}r5=r1+20|0;r1=HEAP32[r5>>2];if((r1|0)!=0){__ZdaPv(r1)}HEAP32[r4>>2]=r2;r4=_llvm_umul_with_overflow_i32(r2,4);HEAP32[r5>>2]=__Znaj(tempRet0?-1:r4);return 0}function __ZNK5o3dgc12BinaryStream11ReadFloat32ERmNS_15O3DGCStreamTypeE(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r2>>2;if((r3|0)!=1){r5=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r1,r2);r6=(HEAP32[tempDoublePtr>>2]=r5,HEAPF32[tempDoublePtr>>2]);return r6}r2=HEAP32[r4];if(r2>>>0>=(HEAP32[r1+8>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r3=(r1|0)>>2;r1=r2+1|0;HEAP32[r4]=r1;r7=HEAPU8[HEAP32[r3]+r2|0];r8=r2+2|0;HEAP32[r4]=r8;r9=(HEAPU8[HEAP32[r3]+r1|0]<<7)+r7|0;r7=r2+3|0;HEAP32[r4]=r7;r1=(HEAPU8[HEAP32[r3]+r8|0]<<14)+r9|0;r9=r2+4|0;HEAP32[r4]=r9;r8=(HEAPU8[HEAP32[r3]+r7|0]<<21)+r1|0;HEAP32[r4]=r2+5;r5=(HEAPU8[HEAP32[r3]+r9|0]<<28)+r8|0;r6=(HEAP32[tempDoublePtr>>2]=r5,HEAPF32[tempDoublePtr>>2]);return r6}function __ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r3=r2>>2;r4=(r1+20|0)>>2;r5=HEAP32[r4];r6=r2+8|0;do{if((HEAP32[r6>>2]|0)==0){r7=r5>>>15;HEAP32[r4]=r7;r8=HEAP32[r3+6];r9=HEAP32[r3];r10=HEAP32[r1+16>>2];r11=r8;r12=r8>>>1;r8=0;r13=0;r14=r5;while(1){r15=Math.imul(HEAP32[r9+(r12<<2)>>2],r7)|0;r16=r15>>>0>r10>>>0;r17=r16?r15:r14;r18=r16?r13:r15;r15=r16?r8:r12;r19=r16?r12:r11;r16=(r15+r19|0)>>>1;if((r16|0)==(r15|0)){r20=r15;r21=r18;r22=r17;r23=r10;break}else{r11=r19;r12=r16;r8=r15;r13=r18;r14=r17}}}else{r14=HEAP32[r1+16>>2];r13=r5>>>15;HEAP32[r4]=r13;r8=Math.floor((r14>>>0)/(r13>>>0));r12=r8>>>(HEAP32[r3+9]>>>0);r11=HEAP32[r6>>2];r10=HEAP32[r11+(r12<<2)>>2];r7=HEAP32[r11+(r12+1<<2)>>2]+1|0;r12=r10+1|0;r11=HEAP32[r3]>>2;if(r7>>>0>r12>>>0){r9=r10;r17=r7;while(1){r7=(r17+r9|0)>>>1;r18=HEAP32[(r7<<2>>2)+r11]>>>0>r8>>>0;r15=r18?r9:r7;r16=r18?r7:r17;r7=r15+1|0;if(r16>>>0>r7>>>0){r9=r15;r17=r16}else{r24=r15;r25=r7;break}}}else{r24=r10;r25=r12}r17=Math.imul(r13,HEAP32[(r24<<2>>2)+r11])|0;if((r24|0)==(HEAP32[r3+7]|0)){r20=r24;r21=r17;r22=r5;r23=r14;break}r20=r24;r21=r17;r22=Math.imul(HEAP32[(r25<<2>>2)+r11],r13)|0;r23=r14}}while(0);r25=r1+16|0;r24=r23-r21|0;HEAP32[r25>>2]=r24;r23=r22-r21|0;HEAP32[r4]=r23;if(r23>>>0<16777216){r21=r1+8|0;r1=r24;r24=HEAP32[r21>>2];r22=r23;while(1){r23=r24+1|0;HEAP32[r21>>2]=r23;r5=HEAPU8[r23]|r1<<8;HEAP32[r25>>2]=r5;r6=r22<<8;HEAP32[r4]=r6;if(r6>>>0<16777216){r1=r5;r24=r23;r22=r6}else{break}}}r22=(r20<<2)+HEAP32[r3+1]|0;HEAP32[r22>>2]=HEAP32[r22>>2]+1;r22=r2+20|0;r3=HEAP32[r22>>2]-1|0;HEAP32[r22>>2]=r3;if((r3|0)!=0){return r20}__ZN5o3dgc19Adaptive_Data_Model6updateEb(r2,0);return r20}function __ZN5o3dgc16Arithmetic_Codec10set_bufferEjPh(r1,r2,r3){var r4,r5,r6;if((r2|0)==0){__ZN5o3dgcL8AC_ErrorEPKc(1472)}if((HEAP32[r1+28>>2]|0)!=0){__ZN5o3dgcL8AC_ErrorEPKc(3112)}r4=(r1+24|0)>>2;if((r3|0)!=0){HEAP32[r4]=r2;HEAP32[r1>>2]=r3;r3=r1+4|0;r5=HEAP32[r3>>2];if((r5|0)!=0){__ZdaPv(r5)}HEAP32[r3>>2]=0;return}if(HEAP32[r4]>>>0>=r2>>>0){return}HEAP32[r4]=r2;r3=r1+4|0;r5=HEAP32[r3>>2];if((r5|0)==0){r6=r2}else{__ZdaPv(r5);r6=HEAP32[r4]}r4=__Znaj(r6+16|0);HEAP32[r3>>2]=r4;if((r4|0)==0){__ZN5o3dgcL8AC_ErrorEPKc(2536)}HEAP32[r1>>2]=r4;return}function __ZN5o3dgcL8AC_ErrorEPKc(r1){_fwrite(2928,31,1,HEAP32[_stderr>>2]);_fputs(r1,HEAP32[_stderr>>2]);_fwrite(2864,24,1,HEAP32[_stderr>>2]);_fgetc(HEAP32[_stdin>>2]);_exit(1)}function __ZN5o3dgc19Adaptive_Data_Model12set_alphabetEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=r1>>2;if((r2-2|0)>>>0>2046){__ZN5o3dgcL8AC_ErrorEPKc(3456)}r4=(r1+24|0)>>2;do{if((HEAP32[r4]|0)==(r2|0)){r5=r2}else{HEAP32[r4]=r2;HEAP32[r3+7]=r2-1;r6=(r1|0)>>2;r7=HEAP32[r6];if((r7|0)==0){r8=r2}else{__ZdaPv(r7);r8=HEAP32[r4]}if(r8>>>0>16){r7=3;while(1){if(r8>>>0>1<<r7+2>>>0){r7=r7+1|0}else{break}}r9=1<<r7;HEAP32[r3+8]=r9;HEAP32[r3+9]=15-r7;r10=_llvm_umul_with_overflow_i32((r8<<1)+r9+2|0,4);r9=__Znaj(tempRet0?-1:r10);HEAP32[r6]=r9;r10=HEAP32[r4];HEAP32[r3+2]=(r10<<3)+r9;r11=r9;r12=r10}else{HEAP32[r3+2]=0;HEAP32[r3+9]=0;HEAP32[r3+8]=0;r10=_llvm_umul_with_overflow_i32(r8<<1,4);r9=__Znaj(tempRet0?-1:r10);HEAP32[r6]=r9;r11=r9;r12=HEAP32[r4]}HEAP32[r3+1]=(r12<<2)+r11;if((r11|0)!=0){r5=r12;break}__ZN5o3dgcL8AC_ErrorEPKc(3264)}}while(0);if((r5|0)==0){return}HEAP32[r3+3]=0;r12=r1+16|0;HEAP32[r12>>2]=r5;r5=r1+4|0;r11=0;while(1){HEAP32[HEAP32[r5>>2]+(r11<<2)>>2]=1;r8=r11+1|0;if(r8>>>0<HEAP32[r4]>>>0){r11=r8}else{break}}__ZN5o3dgc19Adaptive_Data_Model6updateEb(r1,0);r1=(HEAP32[r4]+6|0)>>>1;HEAP32[r12>>2]=r1;HEAP32[r3+5]=r1;return}function __ZN5o3dgc12LoadUIntDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r4=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r3;r6=HEAP32[r4];r7=r2+8|0;if(r6>>>0>=(HEAP32[r7>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r8=(r2|0)>>2;r2=r6+5|0;HEAP32[r4]=r2;if(r2>>>0>=(HEAP32[r7>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r7=r6+6|0;HEAP32[r4]=r7;r9=HEAPU8[HEAP32[r8]+r2|0];r2=r6+7|0;HEAP32[r4]=r2;r10=(HEAPU8[HEAP32[r8]+r7|0]<<7)+r9|0;r9=r6+8|0;HEAP32[r4]=r9;r7=(HEAPU8[HEAP32[r8]+r2|0]<<14)+r10|0;r10=r6+9|0;HEAP32[r4]=r10;r2=(HEAPU8[HEAP32[r8]+r9|0]<<21)+r7|0;HEAP32[r4]=r6+10;r6=(HEAPU8[HEAP32[r8]+r10|0]<<28)+r2|0;r2=r1+4|0;if(HEAP32[r2>>2]>>>0<r6>>>0){HEAP32[r2>>2]=r6;r2=_llvm_umul_with_overflow_i32(r6,4);r10=__Znaj(tempRet0?-1:r2);r2=r10;r7=r1+8|0;r9=HEAP32[r7>>2];r11=r1|0;do{if((r9|0)!=0){r12=HEAP32[r11>>2];r13=r12;r14=r9<<2;_memcpy(r10,r13,r14)|0;if((r12|0)==0){break}__ZdaPv(r13)}}while(0);HEAP32[r11>>2]=r2;r15=r7}else{r15=r1+8|0}HEAP32[r15>>2]=0;if((r6|0)==0){STACKTOP=r3;return 0}else{r16=0}while(1){r15=HEAP32[r4];r7=r15+1|0;HEAP32[r4]=r7;r2=HEAP8[HEAP32[r8]+r15|0];r15=r2&255;if(r2<<24>>24==127){r2=0;r11=r15;r10=r7;while(1){r7=r10+1|0;HEAP32[r4]=r7;r9=HEAPU8[HEAP32[r8]+r10|0];r13=(r9>>>1<<r2)+r11|0;if((r9&1|0)==0){r17=r13;break}else{r2=r2+6|0;r11=r13;r10=r7}}}else{r17=r15}HEAP32[r5>>2]=r17;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);r10=r16+1|0;if(r10>>>0<r6>>>0){r16=r10}else{break}}STACKTOP=r3;return 0}function __ZN5o3dgc6VectorIlE8PushBackERKl(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r3=(r1+8|0)>>2;r4=HEAP32[r3];r5=(r1+4|0)>>2;r6=HEAP32[r5];if((r4|0)==(r6|0)){r7=r4<<1;r8=r7>>>0<32?32:r7;HEAP32[r5]=r8;r7=_llvm_umul_with_overflow_i32(r8,4);r8=__Znaj(tempRet0?-1:r7);r7=r8;r9=HEAP32[r3];r10=r1|0;do{if((r9|0)==0){r11=0}else{r12=HEAP32[r10>>2];r13=r12;r14=r9<<2;_memcpy(r8,r13,r14)|0;if((r12|0)==0){r11=r9;break}__ZdaPv(r13);r11=HEAP32[r3]}}while(0);HEAP32[r10>>2]=r7;r15=r11;r16=HEAP32[r5]}else{r15=r4;r16=r6}if(r15>>>0<r16>>>0){r16=HEAP32[r2>>2];HEAP32[r3]=r15+1;HEAP32[HEAP32[r1>>2]+(r15<<2)>>2]=r16;return}else{___assert_func(432,88,5800,2840)}}function __ZN5o3dgc11LoadIntDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r4=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r3;r6=HEAP32[r4];r7=r2+8|0;if(r6>>>0>=(HEAP32[r7>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r8=(r2|0)>>2;r2=r6+5|0;HEAP32[r4]=r2;if(r2>>>0>=(HEAP32[r7>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r7=r6+6|0;HEAP32[r4]=r7;r9=HEAPU8[HEAP32[r8]+r2|0];r2=r6+7|0;HEAP32[r4]=r2;r10=(HEAPU8[HEAP32[r8]+r7|0]<<7)+r9|0;r9=r6+8|0;HEAP32[r4]=r9;r7=(HEAPU8[HEAP32[r8]+r2|0]<<14)+r10|0;r10=r6+9|0;HEAP32[r4]=r10;r2=(HEAPU8[HEAP32[r8]+r9|0]<<21)+r7|0;HEAP32[r4]=r6+10;r6=(HEAPU8[HEAP32[r8]+r10|0]<<28)+r2|0;r2=r1+4|0;if(HEAP32[r2>>2]>>>0<r6>>>0){HEAP32[r2>>2]=r6;r2=_llvm_umul_with_overflow_i32(r6,4);r10=__Znaj(tempRet0?-1:r2);r2=r10;r7=r1+8|0;r9=HEAP32[r7>>2];r11=r1|0;do{if((r9|0)!=0){r12=HEAP32[r11>>2];r13=r12;r14=r9<<2;_memcpy(r10,r13,r14)|0;if((r12|0)==0){break}__ZdaPv(r13)}}while(0);HEAP32[r11>>2]=r2;r15=r7}else{r15=r1+8|0}HEAP32[r15>>2]=0;if((r6|0)==0){STACKTOP=r3;return 0}else{r16=0}while(1){r15=HEAP32[r4];r7=r15+1|0;HEAP32[r4]=r7;r2=HEAP8[HEAP32[r8]+r15|0];r15=r2&255;if(r2<<24>>24==127){r2=0;r11=r15;r10=r7;while(1){r7=r10+1|0;HEAP32[r4]=r7;r9=HEAPU8[HEAP32[r8]+r10|0];r13=(r9>>>1<<r2)+r11|0;if((r9&1|0)==0){r17=r13;break}else{r2=r2+6|0;r11=r13;r10=r7}}}else{r17=r15}if((r17&1|0)==0){r18=r17>>>1}else{r18=-((r17+1|0)>>>1)|0}HEAP32[r5>>2]=r18;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);r10=r16+1|0;if(r10>>>0<r6>>>0){r16=r10}else{break}}STACKTOP=r3;return 0}function __ZN5o3dgc11LoadBinDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r4=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r3,r6=r5>>2;r7=HEAP32[r4];r8=r2+8|0;if(r7>>>0>=(HEAP32[r8>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r9=(r2|0)>>2;r2=r7+5|0;HEAP32[r4]=r2;if(r2>>>0>=(HEAP32[r8>>2]-5|0)>>>0){___assert_func(2288,322,5648,1296)}r8=r7+6|0;HEAP32[r4]=r8;r10=HEAPU8[HEAP32[r9]+r2|0];r2=r7+7|0;HEAP32[r4]=r2;r11=(HEAPU8[HEAP32[r9]+r8|0]<<7)+r10|0;r10=r7+8|0;HEAP32[r4]=r10;r8=(HEAPU8[HEAP32[r9]+r2|0]<<14)+r11|0;r11=r7+9|0;HEAP32[r4]=r11;r2=(HEAPU8[HEAP32[r9]+r10|0]<<21)+r8|0;HEAP32[r4]=r7+10;r7=(HEAPU8[HEAP32[r9]+r11|0]<<28)+r2|0;r2=r7*7&-1;r11=r1+4|0;if(HEAP32[r11>>2]>>>0<r2>>>0){HEAP32[r11>>2]=r2;r11=_llvm_umul_with_overflow_i32(r2,4);r2=__Znaj(tempRet0?-1:r11);r11=r2;r8=r1+8|0;r10=HEAP32[r8>>2];r12=r1|0;do{if((r10|0)!=0){r13=HEAP32[r12>>2];r14=r13;r15=r10<<2;_memcpy(r2,r14,r15)|0;if((r13|0)==0){break}__ZdaPv(r14)}}while(0);HEAP32[r12>>2]=r11;r16=r8}else{r16=r1+8|0}HEAP32[r16>>2]=0;if((r7|0)==0){STACKTOP=r3;return 0}else{r17=0}while(1){r16=HEAP32[r4];HEAP32[r4]=r16+1;r8=HEAPU8[HEAP32[r9]+r16|0];HEAP32[r6]=r8&1;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);HEAP32[r6]=r8>>>1&1;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);HEAP32[r6]=r8>>>2&1;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);HEAP32[r6]=r8>>>3&1;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);HEAP32[r6]=r8>>>4&1;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);HEAP32[r6]=r8>>>5&1;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);HEAP32[r6]=r8>>>6&1;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r5);r8=r17+7|0;if(r8>>>0<r7>>>0){r17=r8}else{break}}STACKTOP=r3;return 0}function __ZN5o3dgc22CompressedTriangleFans4LoadERKNS_12BinaryStreamERmbNS_15O3DGCStreamTypeE(r1,r2,r3,r4,r5){var r6;r6=r1|0;if((r5|0)==1){__ZN5o3dgc12LoadUIntDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r6,r2,r3);__ZN5o3dgc12LoadUIntDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r1+12|0,r2,r3);__ZN5o3dgc12LoadUIntDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r1+24|0,r2,r3);__ZN5o3dgc11LoadBinDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r1+36|0,r2,r3);__ZN5o3dgc11LoadIntDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r1+48|0,r2,r3);if(!r4){return 0}__ZN5o3dgc12LoadUIntDataERNS_6VectorIlEERKNS_12BinaryStreamERm(r1+60|0,r2,r3);return 0}else{__ZN5o3dgc12LoadIntACEGCERNS_6VectorIlEEmRKNS_12BinaryStreamERm(r6,4,r2,r3);__ZN5o3dgc12LoadIntACEGCERNS_6VectorIlEEmRKNS_12BinaryStreamERm(r1+12|0,16,r2,r3);__ZN5o3dgc10LoadUIntACERNS_6VectorIlEEmRKNS_12BinaryStreamERm(r1+24|0,10,r2,r3);__ZN5o3dgc9LoadBinACERNS_6VectorIlEERKNS_12BinaryStreamERm(r1+36|0,r2,r3);__ZN5o3dgc12LoadIntACEGCERNS_6VectorIlEEmRKNS_12BinaryStreamERm(r1+48|0,8,r2,r3);if(!r4){return 0}__ZN5o3dgc12LoadIntACEGCERNS_6VectorIlEEmRKNS_12BinaryStreamERm(r1+60|0,16,r2,r3);return 0}}function ___getTypeName(r1){return _strdup(HEAP32[r1+4>>2])}function __ZN53EmscriptenBindingInitializer_native_and_builtin_typesC2Ev(r1){__embind_register_void(16072,304);__embind_register_bool(16080,2832,1,0);__embind_register_integer(__ZTIc,2224,-128,127);__embind_register_integer(__ZTIa,1432,-128,127);__embind_register_integer(__ZTIh,1280,0,255);__embind_register_integer(__ZTIs,1e3,-32768,32767);__embind_register_integer(__ZTIt,672,0,65535);__embind_register_integer(__ZTIi,408,-2147483648,2147483647);__embind_register_integer(__ZTIj,280,0,-1);__embind_register_integer(__ZTIl,128,-2147483648,2147483647);__embind_register_integer(__ZTIm,3984,0,-1);__embind_register_float(__ZTIf,3856);__embind_register_float(__ZTId,3536);__embind_register_std_string(17368,3328);__embind_register_std_wstring(17344,4,3096);__embind_register_emval(17656,3016);__embind_register_memory_view(17664,2968);return}function __GLOBAL__I_a108(){__ZN53EmscriptenBindingInitializer_native_and_builtin_typesC2Ev(0);return}function __ZN5o3dgc10LoadUIntACERNS_6VectorIlEEmRKNS_12BinaryStreamERm(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r5=STACKTOP;STACKTOP=STACKTOP+80|0;r6=r5,r7=r6>>2;r8=r5+32;r9=r5+72;r10=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r3,r4)-12|0;r11=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r3,r4);if((r11|0)==0){STACKTOP=r5;return 0}r12=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r3,r4);r13=HEAP32[r4>>2];r14=HEAP32[r3>>2]+r13|0;HEAP32[r4>>2]=r13+r10;r13=r1+4|0;if(HEAP32[r13>>2]>>>0<r11>>>0){HEAP32[r13>>2]=r11;r13=_llvm_umul_with_overflow_i32(r11,4);r4=__Znaj(tempRet0?-1:r13);r13=r4;r3=HEAP32[r1+8>>2];r15=r1|0;do{if((r3|0)!=0){r16=HEAP32[r15>>2];r17=r16;r18=r3<<2;_memcpy(r4,r17,r18)|0;if((r16|0)==0){break}__ZdaPv(r17)}}while(0);HEAP32[r15>>2]=r13}r13=r6+24|0;HEAP32[r13>>2]=0;r15=(r6+28|0)>>2;HEAP32[r15]=0;r4=r6|0;HEAP32[r4>>2]=0;r3=r6+4|0;HEAP32[r3>>2]=0;__ZN5o3dgc16Arithmetic_Codec10set_bufferEjPh(r6,r10,r14);if((HEAP32[r15]|0)!=0){__ZN5o3dgcL8AC_ErrorEPKc(1112)}if((HEAP32[r13>>2]|0)==0){__ZN5o3dgcL8AC_ErrorEPKc(1368)}HEAP32[r15]=2;HEAP32[r7+5]=-1;r15=HEAP32[r4>>2];r4=r15+3|0;HEAP32[r7+2]=r4;HEAP32[r7+4]=HEAPU8[r15+1|0]<<16|HEAPU8[r15]<<24|HEAPU8[r15+2|0]<<8|HEAPU8[r4];HEAP32[r8+24>>2]=0;r4=r8|0;HEAP32[r4>>2]=0;__ZN5o3dgc19Adaptive_Data_Model12set_alphabetEj(r8,r2+1|0);r2=0;while(1){HEAP32[r9>>2]=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r6,r8)+r12;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r9);r15=r2+1|0;if(r15>>>0<r11>>>0){r2=r15}else{break}}r2=HEAP32[r4>>2];if((r2|0)!=0){__ZdaPv(r2)}r2=HEAP32[r3>>2];if((r2|0)==0){STACKTOP=r5;return 0}__ZdaPv(r2);STACKTOP=r5;return 0}function __ZN5o3dgc12LoadIntACEGCERNS_6VectorIlEEmRKNS_12BinaryStreamERm(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31;r5=STACKTOP;STACKTOP=STACKTOP+104|0;r6=r5;r7=r5+32;r8=r5+72,r9=r8>>2;r10=r5+96;r11=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r3,r4)-12|0;r12=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r3,r4);if((r12|0)==0){STACKTOP=r5;return 0}r13=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r3,r4)-2147483647|0;r14=HEAP32[r4>>2];r15=HEAP32[r3>>2]+r14|0;HEAP32[r4>>2]=r14+r11;r14=r1+4|0;if(HEAP32[r14>>2]>>>0<r12>>>0){HEAP32[r14>>2]=r12;r14=_llvm_umul_with_overflow_i32(r12,4);r4=__Znaj(tempRet0?-1:r14);r14=r4;r3=HEAP32[r1+8>>2];r16=r1|0;do{if((r3|0)!=0){r17=HEAP32[r16>>2];r18=r17;r19=r3<<2;_memcpy(r4,r18,r19)|0;if((r17|0)==0){break}__ZdaPv(r18)}}while(0);HEAP32[r16>>2]=r14}r14=r6+24|0;HEAP32[r14>>2]=0;r16=(r6+28|0)>>2;HEAP32[r16]=0;r4=r6|0;HEAP32[r4>>2]=0;r3=r6+4|0;HEAP32[r3>>2]=0;__ZN5o3dgc16Arithmetic_Codec10set_bufferEjPh(r6,r11,r15);if((HEAP32[r16]|0)!=0){__ZN5o3dgcL8AC_ErrorEPKc(1112)}if((HEAP32[r14>>2]|0)==0){__ZN5o3dgcL8AC_ErrorEPKc(1368)}HEAP32[r16]=2;r16=(r6+20|0)>>2;HEAP32[r16]=-1;r14=HEAP32[r4>>2];r4=r14+3|0;r15=(r6+8|0)>>2;HEAP32[r15]=r4;r11=(r6+16|0)>>2;HEAP32[r11]=HEAPU8[r14+1|0]<<16|HEAPU8[r14]<<24|HEAPU8[r14+2|0]<<8|HEAPU8[r4];HEAP32[r7+24>>2]=0;r4=r7|0;HEAP32[r4>>2]=0;__ZN5o3dgc19Adaptive_Data_Model12set_alphabetEj(r7,r2+2|0);HEAP32[r9+3]=1;HEAP32[r9+4]=2;HEAP32[r9+2]=4096;HEAP32[r9+1]=4;HEAP32[r9]=4;r9=0;while(1){r14=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_19Adaptive_Data_ModelE(r6,r7);if((r14|0)==(r2|0)){r18=0;r17=0;L1461:while(1){while(1){r19=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r6,r8);if((r19|0)==1){break}else if((r19|0)==0){r20=0;r21=r17;break L1461}}r18=(1<<r17)+r18|0;r17=r17+1|0}L1466:while(1){r17=r21;while(1){r22=r17-1|0;if((r17|0)==0){break L1466}r19=HEAP32[r16];r23=r19>>>13<<12;r24=HEAP32[r11];r25=r24>>>0>=r23>>>0;if(r25){r26=r24-r23|0;HEAP32[r11]=r26;r27=r19-r23|0;r28=r26}else{r27=r23;r28=r24}HEAP32[r16]=r27;if(r27>>>0<16777216){r24=r28;r23=HEAP32[r15];r26=r27;while(1){r19=r23+1|0;HEAP32[r15]=r19;r29=HEAPU8[r19]|r24<<8;HEAP32[r11]=r29;r30=r26<<8;HEAP32[r16]=r30;if(r30>>>0<16777216){r24=r29;r23=r19;r26=r30}else{break}}}if(r25){break}else{r17=r22}}r20=1<<r22|r20;r21=r22}r31=r18+r2+r20|0}else{r31=r14}HEAP32[r10>>2]=r13+r31;__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r10);r17=r9+1|0;if(r17>>>0<r12>>>0){r9=r17}else{break}}r9=HEAP32[r4>>2];if((r9|0)!=0){__ZdaPv(r9)}r9=HEAP32[r3>>2];if((r9|0)==0){STACKTOP=r5;return 0}__ZdaPv(r9);STACKTOP=r5;return 0}function __ZN5o3dgc9LoadBinACERNS_6VectorIlEERKNS_12BinaryStreamERm(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r4=STACKTOP;STACKTOP=STACKTOP+64|0;r5=r4,r6=r5>>2;r7=r4+32,r8=r7>>2;r9=r4+56;r10=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r2,r3)-8|0;r11=__ZNK5o3dgc12BinaryStream13ReadUInt32BinERm(r2,r3);if((r11|0)==0){STACKTOP=r4;return 0}r12=HEAP32[r3>>2];r13=HEAP32[r2>>2]+r12|0;HEAP32[r3>>2]=r12+r10;r12=r1+4|0;if(HEAP32[r12>>2]>>>0<r11>>>0){HEAP32[r12>>2]=r11;r12=_llvm_umul_with_overflow_i32(r11,4);r3=__Znaj(tempRet0?-1:r12);r12=r3;r2=HEAP32[r1+8>>2];r14=r1|0;do{if((r2|0)!=0){r15=HEAP32[r14>>2];r16=r15;r17=r2<<2;_memcpy(r3,r16,r17)|0;if((r15|0)==0){break}__ZdaPv(r16)}}while(0);HEAP32[r14>>2]=r12}r12=r5+24|0;HEAP32[r12>>2]=0;r14=(r5+28|0)>>2;HEAP32[r14]=0;r3=r5|0;HEAP32[r3>>2]=0;r2=r5+4|0;HEAP32[r2>>2]=0;__ZN5o3dgc16Arithmetic_Codec10set_bufferEjPh(r5,r10,r13);if((HEAP32[r14]|0)!=0){__ZN5o3dgcL8AC_ErrorEPKc(1112)}if((HEAP32[r12>>2]|0)==0){__ZN5o3dgcL8AC_ErrorEPKc(1368)}HEAP32[r14]=2;HEAP32[r6+5]=-1;r14=HEAP32[r3>>2];r3=r14+3|0;HEAP32[r6+2]=r3;HEAP32[r6+4]=HEAPU8[r14+1|0]<<16|HEAPU8[r14]<<24|HEAPU8[r14+2|0]<<8|HEAPU8[r3];HEAP32[r8+3]=1;HEAP32[r8+4]=2;HEAP32[r8+2]=4096;HEAP32[r8+1]=4;HEAP32[r8]=4;r8=0;while(1){HEAP32[r9>>2]=__ZN5o3dgc16Arithmetic_Codec6decodeERNS_18Adaptive_Bit_ModelE(r5,r7);__ZN5o3dgc6VectorIlE8PushBackERKl(r1,r9);r3=r8+1|0;if(r3>>>0<r11>>>0){r8=r3}else{break}}r8=HEAP32[r2>>2];if((r8|0)==0){STACKTOP=r4;return 0}__ZdaPv(r8);STACKTOP=r4;return 0}function __ZNSt3__111__stdoutbufIwED1Ev(r1){var r2;HEAP32[r1>>2]=11728;r2=HEAP32[r1+4>>2];r1=r2+4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)|0)!=0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);return}function __ZNSt3__111__stdoutbufIwED0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=11728;r2=HEAP32[r1+4>>2];r3=r2+4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)|0)!=0){r4=r1;__ZdlPv(r4);return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);r4=r1;__ZdlPv(r4);return}function __ZNSt3__111__stdoutbufIwE4syncEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;r6=r1+36|0;r7=r1+40|0;r8=r4|0;r9=r4+8|0;r10=r4;r4=r1+32|0;while(1){r1=HEAP32[r6>>2];r11=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,HEAP32[r7>>2],r8,r9,r5);r1=HEAP32[r5>>2]-r10|0;if((_fwrite(r8,1,r1,HEAP32[r4>>2])|0)!=(r1|0)){r12=-1;r2=1187;break}if((r11|0)==2){r12=-1;r2=1186;break}else if((r11|0)!=1){r2=1183;break}}if(r2==1183){r12=((_fflush(HEAP32[r4>>2])|0)!=0)<<31>>31;STACKTOP=r3;return r12}else if(r2==1187){STACKTOP=r3;return r12}else if(r2==1186){STACKTOP=r3;return r12}}function __ZNSt3__18ios_base4InitC2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47;__ZNSt3__110__stdinbufIcEC2EP7__sFILEP10_mbstate_t(18e3,HEAP32[_stdin>>2],18072);HEAP32[4734]=12020;HEAP32[4736]=12040;HEAP32[4735]=0;HEAP32[4742]=18e3;HEAP32[4740]=0;HEAP32[4741]=0;HEAP32[4737]=4098;HEAP32[4739]=0;HEAP32[4738]=6;_memset(18976,0,40);if(HEAP8[19160]){r2=HEAP32[2238]}else{if(HEAP8[19168]){r3=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r3=9256}HEAP32[2244]=r3;r1=r3+4|0;tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r2=8976}r1=HEAP32[r2>>2];HEAP32[4743]=r1;r2=r1+4|0;tempValue=HEAP32[r2>>2],HEAP32[r2>>2]=tempValue+1,tempValue;HEAP32[4754]=0;HEAP32[4755]=-1;__ZNSt3__111__stdoutbufIcEC2EP7__sFILEP10_mbstate_t(17904,HEAP32[_stdout>>2],18080);HEAP32[4668]=11924;HEAP32[4669]=11944;HEAP32[4675]=17904;HEAP32[4673]=0;HEAP32[4674]=0;HEAP32[4670]=4098;HEAP32[4672]=0;HEAP32[4671]=6;_memset(18708,0,40);if(HEAP8[19160]){r4=HEAP32[2238]}else{if(HEAP8[19168]){r5=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r5=9256}HEAP32[2244]=r5;r2=r5+4|0;tempValue=HEAP32[r2>>2],HEAP32[r2>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r4=8976}r2=HEAP32[r4>>2];HEAP32[4676]=r2;r4=r2+4|0;tempValue=HEAP32[r4>>2],HEAP32[r4>>2]=tempValue+1,tempValue;HEAP32[4687]=0;HEAP32[4688]=-1;__ZNSt3__111__stdoutbufIcEC2EP7__sFILEP10_mbstate_t(17952,HEAP32[_stderr>>2],18088);HEAP32[4712]=11924;HEAP32[4713]=11944;HEAP32[4719]=17952;HEAP32[4717]=0;HEAP32[4718]=0;HEAP32[4714]=4098;HEAP32[4716]=0;HEAP32[4715]=6;_memset(18884,0,40);if(HEAP8[19160]){r6=HEAP32[2238]}else{if(HEAP8[19168]){r7=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r7=9256}HEAP32[2244]=r7;r4=r7+4|0;tempValue=HEAP32[r4>>2],HEAP32[r4>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r6=8976}r4=HEAP32[r6>>2];HEAP32[4720]=r4;r6=r4+4|0;tempValue=HEAP32[r6>>2],HEAP32[r6>>2]=tempValue+1,tempValue;HEAP32[4731]=0;HEAP32[4732]=-1;r6=HEAP32[HEAP32[HEAP32[4712]-12>>2]+18872>>2];HEAP32[4690]=11924;HEAP32[4691]=11944;HEAP32[4697]=r6;HEAP32[4695]=(r6|0)==0&1;HEAP32[4696]=0;HEAP32[4692]=4098;HEAP32[4694]=0;HEAP32[4693]=6;_memset(18796,0,40);if(HEAP8[19160]){r8=HEAP32[2238]}else{if(HEAP8[19168]){r9=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r9=9256}HEAP32[2244]=r9;r6=r9+4|0;tempValue=HEAP32[r6>>2],HEAP32[r6>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r8=8976}r6=HEAP32[r8>>2];HEAP32[4698]=r6;r8=r6+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;HEAP32[4709]=0;HEAP32[4710]=-1;HEAP32[HEAP32[HEAP32[4734]-12>>2]+19008>>2]=18672;r8=HEAP32[HEAP32[4712]-12>>2]+18852|0;HEAP32[r8>>2]=HEAP32[r8>>2]|8192;HEAP32[HEAP32[HEAP32[4712]-12>>2]+18920>>2]=18672;__ZNSt3__110__stdinbufIwEC2EP7__sFILEP10_mbstate_t(17848,HEAP32[_stdin>>2],18096);HEAP32[4646]=11972;HEAP32[4648]=11992;HEAP32[4647]=0;HEAP32[4654]=17848;HEAP32[4652]=0;HEAP32[4653]=0;HEAP32[4649]=4098;HEAP32[4651]=0;HEAP32[4650]=6;_memset(18624,0,40);if(HEAP8[19160]){r10=HEAP32[2238]}else{if(HEAP8[19168]){r11=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r11=9256}HEAP32[2244]=r11;r8=r11+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r10=8976}r8=HEAP32[r10>>2];HEAP32[4655]=r8;r10=r8+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;HEAP32[4666]=0;HEAP32[4667]=-1;__ZNSt3__111__stdoutbufIwEC2EP7__sFILEP10_mbstate_t(17752,HEAP32[_stdout>>2],18104);HEAP32[4576]=11876;HEAP32[4577]=11896;HEAP32[4583]=17752;HEAP32[4581]=0;HEAP32[4582]=0;HEAP32[4578]=4098;HEAP32[4580]=0;HEAP32[4579]=6;_memset(18340,0,40);if(HEAP8[19160]){r12=HEAP32[2238]}else{if(HEAP8[19168]){r13=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r13=9256}HEAP32[2244]=r13;r10=r13+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r12=8976}r10=HEAP32[r12>>2];HEAP32[4584]=r10;r12=r10+4|0;tempValue=HEAP32[r12>>2],HEAP32[r12>>2]=tempValue+1,tempValue;HEAP32[4595]=0;HEAP32[4596]=-1;__ZNSt3__111__stdoutbufIwEC2EP7__sFILEP10_mbstate_t(17800,HEAP32[_stderr>>2],18112);HEAP32[4620]=11876;HEAP32[4621]=11896;HEAP32[4627]=17800;HEAP32[4625]=0;HEAP32[4626]=0;HEAP32[4622]=4098;HEAP32[4624]=0;HEAP32[4623]=6;_memset(18516,0,40);if(HEAP8[19160]){r14=HEAP32[2238]}else{if(HEAP8[19168]){r15=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r15=9256}HEAP32[2244]=r15;r12=r15+4|0;tempValue=HEAP32[r12>>2],HEAP32[r12>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r14=8976}r12=HEAP32[r14>>2];HEAP32[4628]=r12;r14=r12+4|0;tempValue=HEAP32[r14>>2],HEAP32[r14>>2]=tempValue+1,tempValue;HEAP32[4639]=0;HEAP32[4640]=-1;r14=HEAP32[HEAP32[HEAP32[4620]-12>>2]+18504>>2];HEAP32[4598]=11876;HEAP32[4599]=11896;HEAP32[4605]=r14;HEAP32[4603]=(r14|0)==0&1;HEAP32[4604]=0;HEAP32[4600]=4098;HEAP32[4602]=0;HEAP32[4601]=6;_memset(18428,0,40);if(HEAP8[19160]){r16=HEAP32[2238];r17=r16|0;r18=HEAP32[r17>>2];r19=r18;HEAP32[4606]=r19;r20=r18+4|0,r21=r20>>2;r22=(tempValue=HEAP32[r21],HEAP32[r21]=tempValue+1,tempValue);HEAP32[4617]=0;HEAP32[4618]=-1;r23=HEAP32[4646];r24=r23-12|0;r25=r24;r26=HEAP32[r25>>2];r27=r26+72|0;r28=r27+18584|0;r29=r28;HEAP32[r29>>2]=18304;r30=HEAP32[4620];r31=r30-12|0;r32=r31;r33=HEAP32[r32>>2];r34=r33+4|0;r35=r34+18480|0;r36=r35,r37=r36>>2;r38=HEAP32[r37];r39=r38|8192;HEAP32[r37]=r39;r40=HEAP32[4620];r41=r40-12|0;r42=r41;r43=HEAP32[r42>>2];r44=r43+72|0;r45=r44+18480|0;r46=r45;HEAP32[r46>>2]=18304;return}if(HEAP8[19168]){r47=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r47=9256}HEAP32[2244]=r47;r14=r47+4|0;tempValue=HEAP32[r14>>2],HEAP32[r14>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r16=8976;r17=r16|0;r18=HEAP32[r17>>2];r19=r18;HEAP32[4606]=r19;r20=r18+4|0,r21=r20>>2;r22=(tempValue=HEAP32[r21],HEAP32[r21]=tempValue+1,tempValue);HEAP32[4617]=0;HEAP32[4618]=-1;r23=HEAP32[4646];r24=r23-12|0;r25=r24;r26=HEAP32[r25>>2];r27=r26+72|0;r28=r27+18584|0;r29=r28;HEAP32[r29>>2]=18304;r30=HEAP32[4620];r31=r30-12|0;r32=r31;r33=HEAP32[r32>>2];r34=r33+4|0;r35=r34+18480|0;r36=r35,r37=r36>>2;r38=HEAP32[r37];r39=r38|8192;HEAP32[r37]=r39;r40=HEAP32[4620];r41=r40-12|0;r42=r41;r43=HEAP32[r42>>2];r44=r43+72|0;r45=r44+18480|0;r46=r45;HEAP32[r46>>2]=18304;return}function __ZNSt3__18ios_base4InitD2Ev(r1){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(18672);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(18760);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(18304);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(18392);return}function __ZNSt3__111__stdoutbufIwEC2EP7__sFILEP10_mbstate_t(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r4=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r4,r6=r5>>2;r7=r1|0;HEAP32[r7>>2]=11728;if(HEAP8[19160]){r8=HEAP32[2238]}else{if(HEAP8[19168]){r9=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r9=9256}HEAP32[2244]=r9;r10=r9+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r8=8976}r10=r1+4|0;r9=HEAP32[r8>>2];HEAP32[r10>>2]=r9;r8=r9+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;r8=(r1+8|0)>>2;HEAP32[r8]=0;HEAP32[r8+1]=0;HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAP32[r8+4]=0;HEAP32[r8+5]=0;HEAP32[r7>>2]=12096;HEAP32[r1+32>>2]=r2;r2=r1+36|0;r7=HEAP32[r10>>2],r10=r7>>2;r8=(r7+4|0)>>2;tempValue=HEAP32[r8],HEAP32[r8]=tempValue+1,tempValue;if((HEAP32[4566]|0)!=-1){HEAP32[r6]=18264;HEAP32[r6+1]=24;HEAP32[r6+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18264,r5,252)}r5=HEAP32[4567]-1|0;r6=HEAP32[r10+2];do{if(HEAP32[r10+3]-r6>>2>>>0>r5>>>0){r9=HEAP32[r6+(r5<<2)>>2];if((r9|0)==0){break}r11=r9;if(((tempValue=HEAP32[r8],HEAP32[r8]=tempValue+ -1,tempValue)|0)!=0){HEAP32[r2>>2]=r11;r12=r1+40|0;HEAP32[r12>>2]=r3;r13=r1+44|0;r14=r9;r15=HEAP32[r14>>2];r16=r15+28|0;r17=HEAP32[r16>>2];r18=FUNCTION_TABLE[r17](r11);r19=r18&1;HEAP8[r13]=r19;STACKTOP=r4;return}FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](r7|0);HEAP32[r2>>2]=r11;r12=r1+40|0;HEAP32[r12>>2]=r3;r13=r1+44|0;r14=r9;r15=HEAP32[r14>>2];r16=r15+28|0;r17=HEAP32[r16>>2];r18=FUNCTION_TABLE[r17](r11);r19=r18&1;HEAP8[r13]=r19;STACKTOP=r4;return}}while(0);r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=10008;___cxa_throw(r4,16120,514)}function __ZNSt3__111__stdoutbufIwE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3,r5=r4>>2;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);r6=HEAP32[r2>>2];if((HEAP32[4566]|0)!=-1){HEAP32[r5]=18264;HEAP32[r5+1]=24;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18264,r4,252)}r4=HEAP32[4567]-1|0;r5=HEAP32[r6+8>>2];if(HEAP32[r6+12>>2]-r5>>2>>>0<=r4>>>0){r7=___cxa_allocate_exception(4);r8=r7;HEAP32[r8>>2]=10008;___cxa_throw(r7,16120,514)}r6=HEAP32[r5+(r4<<2)>>2];if((r6|0)==0){r7=___cxa_allocate_exception(4);r8=r7;HEAP32[r8>>2]=10008;___cxa_throw(r7,16120,514)}else{r7=r6;HEAP32[r1+36>>2]=r7;HEAP8[r1+44|0]=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+28>>2]](r7)&1;STACKTOP=r3;return}}function __ZNSt3__111__stdoutbufIwE8overflowEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=(r2|0)==-1;if(!r9){r10=r6+4|0;r11=(r1+24|0)>>2;r12=(r1+20|0)>>2;HEAP32[r12]=r6;r13=(r1+28|0)>>2;HEAP32[r13]=r10;HEAP32[r6>>2]=r2;HEAP32[r11]=r10;L1652:do{if((HEAP8[r1+44|0]&1)==0){r14=r5|0;HEAP32[r7>>2]=r14;r15=r1+36|0;r16=r1+40|0;r17=r5+8|0;r18=r5;r19=r1+32|0;r20=r6;r21=r10;while(1){r22=HEAP32[r15>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+12>>2]](r22,HEAP32[r16>>2],r20,r21,r8,r14,r17,r7);r24=HEAP32[r12];if((HEAP32[r8>>2]|0)==(r24|0)){r25=-1;r3=1311;break}if((r23|0)==3){r3=1299;break}if(r23>>>0>=2){r25=-1;r3=1312;break}r22=HEAP32[r7>>2]-r18|0;if((_fwrite(r14,1,r22,HEAP32[r19>>2])|0)!=(r22|0)){r25=-1;r3=1310;break}if((r23|0)!=1){break L1652}r23=HEAP32[r8>>2];r22=HEAP32[r11];HEAP32[r12]=r23;HEAP32[r13]=r22;r26=(r22-r23>>2<<2)+r23|0;HEAP32[r11]=r26;r20=r23;r21=r26}if(r3==1310){STACKTOP=r4;return r25}else if(r3==1311){STACKTOP=r4;return r25}else if(r3==1299){if((_fwrite(r24,1,1,HEAP32[r19>>2])|0)==1){break}else{r25=-1}STACKTOP=r4;return r25}else if(r3==1312){STACKTOP=r4;return r25}}else{if((_fwrite(r6,4,1,HEAP32[r1+32>>2])|0)==1){break}else{r25=-1}STACKTOP=r4;return r25}}while(0);HEAP32[r11]=0;HEAP32[r12]=0;HEAP32[r13]=0}r25=r9?0:r2;STACKTOP=r4;return r25}function __ZNSt3__110__stdinbufIwED1Ev(r1){var r2;HEAP32[r1>>2]=11728;r2=HEAP32[r1+4>>2];r1=r2+4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)|0)!=0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);return}function __ZNSt3__110__stdinbufIwED0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=11728;r2=HEAP32[r1+4>>2];r3=r2+4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)|0)!=0){r4=r1;__ZdlPv(r4);return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);r4=r1;__ZdlPv(r4);return}function __ZNSt3__110__stdinbufIwE9underflowEv(r1){return __ZNSt3__110__stdinbufIwE9__getcharEb(r1,0)}function __ZNSt3__110__stdinbufIwE5uflowEv(r1){return __ZNSt3__110__stdinbufIwE9__getcharEb(r1,1)}function __ZNSt3__110__stdinbufIwE9pbackfailEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r4+16;if((r2|0)==-1){r9=-1;STACKTOP=r4;return r9}HEAP32[r8>>2]=r2;r10=HEAP32[r1+36>>2];r11=r5|0;r12=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+12>>2]](r10,HEAP32[r1+40>>2],r8,r8+4|0,r4+24,r11,r5+8|0,r6);if((r12|0)==2|(r12|0)==1){r9=-1;STACKTOP=r4;return r9}else if((r12|0)==3){HEAP8[r11]=r2&255;HEAP32[r7]=r5+1}r5=r1+32|0;while(1){r1=HEAP32[r7];if(r1>>>0<=r11>>>0){r9=r2;r3=1333;break}r12=r1-1|0;HEAP32[r7]=r12;if((_ungetc(HEAP8[r12]|0,HEAP32[r5>>2])|0)==-1){r9=-1;r3=1332;break}}if(r3==1332){STACKTOP=r4;return r9}else if(r3==1333){STACKTOP=r4;return r9}}function __ZNSt3__110__stdinbufIwE9__getcharEb(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r4+16;r9=r4+24;r10=HEAP32[r1+44>>2];r11=(r10|0)>1?r10:1;L1699:do{if((r11|0)>0){r10=r1+32|0;r12=0;while(1){r13=_fgetc(HEAP32[r10>>2]);if((r13|0)==-1){r14=-1;break}HEAP8[r5+r12|0]=r13&255;r13=r12+1|0;if((r13|0)<(r11|0)){r12=r13}else{break L1699}}STACKTOP=r4;return r14}}while(0);L1706:do{if((HEAP8[r1+48|0]&1)==0){r12=r1+40|0;r10=r1+36|0;r13=r5|0;r15=r6+4|0;r16=r1+32|0;r17=r11;while(1){r18=HEAP32[r12>>2];r19=r18;r20=HEAP32[r19>>2];r21=HEAP32[r19+4>>2];r19=HEAP32[r10>>2];r22=r5+r17|0;r23=FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+16>>2]](r19,r18,r13,r22,r8,r6,r15,r9);if((r23|0)==3){r3=1346;break}else if((r23|0)==2){r14=-1;r3=1359;break}else if((r23|0)!=1){r24=r17;break L1706}r23=HEAP32[r12>>2];HEAP32[r23>>2]=r20;HEAP32[r23+4>>2]=r21;if((r17|0)==8){r14=-1;r3=1355;break}r21=_fgetc(HEAP32[r16>>2]);if((r21|0)==-1){r14=-1;r3=1356;break}HEAP8[r22]=r21&255;r17=r17+1|0}if(r3==1356){STACKTOP=r4;return r14}else if(r3==1346){HEAP32[r7]=HEAP8[r13]|0;r24=r17;break}else if(r3==1355){STACKTOP=r4;return r14}else if(r3==1359){STACKTOP=r4;return r14}}else{HEAP32[r7]=HEAP8[r5|0]|0;r24=r11}}while(0);L1720:do{if(!r2){r11=r1+32|0;r3=r24;while(1){if((r3|0)<=0){break L1720}r9=r3-1|0;if((_ungetc(HEAP8[r5+r9|0]|0,HEAP32[r11>>2])|0)==-1){r14=-1;break}else{r3=r9}}STACKTOP=r4;return r14}}while(0);r14=HEAP32[r7];STACKTOP=r4;return r14}function __ZNSt3__111__stdoutbufIcED1Ev(r1){var r2;HEAP32[r1>>2]=11800;r2=HEAP32[r1+4>>2];r1=r2+4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)|0)!=0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);return}function __ZNSt3__111__stdoutbufIcED0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=11800;r2=HEAP32[r1+4>>2];r3=r2+4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)|0)!=0){r4=r1;__ZdlPv(r4);return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);r4=r1;__ZdlPv(r4);return}function __ZNSt3__111__stdoutbufIcE4syncEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=0;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3;r5=r3+8;r6=r1+36|0;r7=r1+40|0;r8=r4|0;r9=r4+8|0;r10=r4;r4=r1+32|0;while(1){r1=HEAP32[r6>>2];r11=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r1,HEAP32[r7>>2],r8,r9,r5);r1=HEAP32[r5>>2]-r10|0;if((_fwrite(r8,1,r1,HEAP32[r4>>2])|0)!=(r1|0)){r12=-1;r2=1375;break}if((r11|0)==2){r12=-1;r2=1377;break}else if((r11|0)!=1){r2=1373;break}}if(r2==1375){STACKTOP=r3;return r12}else if(r2==1373){r12=((_fflush(HEAP32[r4>>2])|0)!=0)<<31>>31;STACKTOP=r3;return r12}else if(r2==1377){STACKTOP=r3;return r12}}function __ZNSt3__110__stdinbufIwEC2EP7__sFILEP10_mbstate_t(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r4,r6=r5>>2;r7=r1|0;HEAP32[r7>>2]=11728;if(HEAP8[19160]){r8=HEAP32[2238]}else{if(HEAP8[19168]){r9=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r9=9256}HEAP32[2244]=r9;r10=r9+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r8=8976}r10=r1+4|0;r9=HEAP32[r8>>2];HEAP32[r10>>2]=r9;r8=r9+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;r8=(r1+8|0)>>2;HEAP32[r8]=0;HEAP32[r8+1]=0;HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAP32[r8+4]=0;HEAP32[r8+5]=0;HEAP32[r7>>2]=12496;HEAP32[r1+32>>2]=r2;HEAP32[r1+40>>2]=r3;r3=HEAP32[r10>>2],r10=r3>>2;r2=(r3+4|0)>>2;tempValue=HEAP32[r2],HEAP32[r2]=tempValue+1,tempValue;if((HEAP32[4566]|0)!=-1){HEAP32[r6]=18264;HEAP32[r6+1]=24;HEAP32[r6+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18264,r5,252)}r5=HEAP32[4567]-1|0;r6=HEAP32[r10+2];do{if(HEAP32[r10+3]-r6>>2>>>0>r5>>>0){r7=HEAP32[r6+(r5<<2)>>2];if((r7|0)==0){break}r8=r7;r9=r1+36|0;HEAP32[r9>>2]=r8;r11=r1+44|0;HEAP32[r11>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+24>>2]](r8);r8=HEAP32[r9>>2];HEAP8[r1+48|0]=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r8)&1;if((HEAP32[r11>>2]|0)<=8){if(((tempValue=HEAP32[r2],HEAP32[r2]=tempValue+ -1,tempValue)|0)!=0){STACKTOP=r4;return}FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](r3|0);STACKTOP=r4;return}r11=___cxa_allocate_exception(8);HEAP32[r11>>2]=10040;r8=r11+4|0;if((r8|0)!=0){r9=__Znaj(50),r7=r9>>2;HEAP32[r7+1]=37;HEAP32[r7]=37;r12=r9+12|0;HEAP32[r8>>2]=r12;HEAP32[r7+2]=0;_memcpy(r12,216,38)|0}___cxa_throw(r11,16136,184)}}while(0);r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=10008;___cxa_throw(r4,16120,514)}function __ZNSt3__110__stdinbufIwE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3,r5=r4>>2;r6=HEAP32[r2>>2];if((HEAP32[4566]|0)!=-1){HEAP32[r5]=18264;HEAP32[r5+1]=24;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18264,r4,252)}r4=HEAP32[4567]-1|0;r5=HEAP32[r6+8>>2];if(HEAP32[r6+12>>2]-r5>>2>>>0<=r4>>>0){r7=___cxa_allocate_exception(4);r8=r7;HEAP32[r8>>2]=10008;___cxa_throw(r7,16120,514)}r6=HEAP32[r5+(r4<<2)>>2];if((r6|0)==0){r7=___cxa_allocate_exception(4);r8=r7;HEAP32[r8>>2]=10008;___cxa_throw(r7,16120,514)}r7=r6;r8=r1+36|0;HEAP32[r8>>2]=r7;r4=r1+44|0;HEAP32[r4>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+24>>2]](r7);r7=HEAP32[r8>>2];HEAP8[r1+48|0]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r7)&1;if((HEAP32[r4>>2]|0)>8){__ZNSt3__121__throw_runtime_errorEPKc(216)}else{STACKTOP=r3;return}}function __ZNSt3__111__stdoutbufIcEC2EP7__sFILEP10_mbstate_t(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r4=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r4,r6=r5>>2;r7=r1|0;HEAP32[r7>>2]=11800;if(HEAP8[19160]){r8=HEAP32[2238]}else{if(HEAP8[19168]){r9=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r9=9256}HEAP32[2244]=r9;r10=r9+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r8=8976}r10=r1+4|0;r9=HEAP32[r8>>2];HEAP32[r10>>2]=r9;r8=r9+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;r8=(r1+8|0)>>2;HEAP32[r8]=0;HEAP32[r8+1]=0;HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAP32[r8+4]=0;HEAP32[r8+5]=0;HEAP32[r7>>2]=12168;HEAP32[r1+32>>2]=r2;r2=r1+36|0;r7=HEAP32[r10>>2],r10=r7>>2;r8=(r7+4|0)>>2;tempValue=HEAP32[r8],HEAP32[r8]=tempValue+1,tempValue;if((HEAP32[4568]|0)!=-1){HEAP32[r6]=18272;HEAP32[r6+1]=24;HEAP32[r6+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18272,r5,252)}r5=HEAP32[4569]-1|0;r6=HEAP32[r10+2];do{if(HEAP32[r10+3]-r6>>2>>>0>r5>>>0){r9=HEAP32[r6+(r5<<2)>>2];if((r9|0)==0){break}r11=r9;if(((tempValue=HEAP32[r8],HEAP32[r8]=tempValue+ -1,tempValue)|0)!=0){HEAP32[r2>>2]=r11;r12=r1+40|0;HEAP32[r12>>2]=r3;r13=r1+44|0;r14=r9;r15=HEAP32[r14>>2];r16=r15+28|0;r17=HEAP32[r16>>2];r18=FUNCTION_TABLE[r17](r11);r19=r18&1;HEAP8[r13]=r19;STACKTOP=r4;return}FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](r7|0);HEAP32[r2>>2]=r11;r12=r1+40|0;HEAP32[r12>>2]=r3;r13=r1+44|0;r14=r9;r15=HEAP32[r14>>2];r16=r15+28|0;r17=HEAP32[r16>>2];r18=FUNCTION_TABLE[r17](r11);r19=r18&1;HEAP8[r13]=r19;STACKTOP=r4;return}}while(0);r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=10008;___cxa_throw(r4,16120,514)}function __ZNSt3__111__stdoutbufIcE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3,r5=r4>>2;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+24>>2]](r1);r6=HEAP32[r2>>2];if((HEAP32[4568]|0)!=-1){HEAP32[r5]=18272;HEAP32[r5+1]=24;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18272,r4,252)}r4=HEAP32[4569]-1|0;r5=HEAP32[r6+8>>2];if(HEAP32[r6+12>>2]-r5>>2>>>0<=r4>>>0){r7=___cxa_allocate_exception(4);r8=r7;HEAP32[r8>>2]=10008;___cxa_throw(r7,16120,514)}r6=HEAP32[r5+(r4<<2)>>2];if((r6|0)==0){r7=___cxa_allocate_exception(4);r8=r7;HEAP32[r8>>2]=10008;___cxa_throw(r7,16120,514)}else{r7=r6;HEAP32[r1+36>>2]=r7;HEAP8[r1+44|0]=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+28>>2]](r7)&1;STACKTOP=r3;return}}function __ZNKSt11logic_error4whatEv(r1){return HEAP32[r1+4>>2]}function __ZNKSt13runtime_error4whatEv(r1){return HEAP32[r1+4>>2]}function __ZNKSt3__114error_category23default_error_conditionEi(r1,r2,r3){HEAP32[r1>>2]=r3;HEAP32[r1+4>>2]=r2;return}function __ZNKSt3__114error_category10equivalentERKNS_10error_codeEi(r1,r2,r3){var r4;if((HEAP32[r2+4>>2]|0)!=(r1|0)){r4=0;return r4}r4=(HEAP32[r2>>2]|0)==(r3|0);return r4}function __ZNSt3__111__stdoutbufIcE8overflowEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=(r2|0)==-1;if(!r9){r10=r6+1|0;r11=(r1+24|0)>>2;r12=(r1+20|0)>>2;HEAP32[r12]=r6;r13=(r1+28|0)>>2;HEAP32[r13]=r10;HEAP8[r6]=r2&255;HEAP32[r11]=r10;L1833:do{if((HEAP8[r1+44|0]&1)==0){r14=r5|0;HEAP32[r7>>2]=r14;r15=r1+36|0;r16=r1+40|0;r17=r5+8|0;r18=r5;r19=r1+32|0;r20=r6;r21=r10;while(1){r22=HEAP32[r15>>2];r23=FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+12>>2]](r22,HEAP32[r16>>2],r20,r21,r8,r14,r17,r7);r24=HEAP32[r12];if((HEAP32[r8>>2]|0)==(r24|0)){r25=-1;r3=1479;break}if((r23|0)==3){r3=1466;break}if(r23>>>0>=2){r25=-1;r3=1475;break}r22=HEAP32[r7>>2]-r18|0;if((_fwrite(r14,1,r22,HEAP32[r19>>2])|0)!=(r22|0)){r25=-1;r3=1477;break}if((r23|0)!=1){break L1833}r23=HEAP32[r8>>2];r22=HEAP32[r11];HEAP32[r12]=r23;HEAP32[r13]=r22;r26=r23+(r22-r23)|0;HEAP32[r11]=r26;r20=r23;r21=r26}if(r3==1475){STACKTOP=r4;return r25}else if(r3==1477){STACKTOP=r4;return r25}else if(r3==1466){if((_fwrite(r24,1,1,HEAP32[r19>>2])|0)==1){break}else{r25=-1}STACKTOP=r4;return r25}else if(r3==1479){STACKTOP=r4;return r25}}else{if((_fwrite(r6,1,1,HEAP32[r1+32>>2])|0)==1){break}else{r25=-1}STACKTOP=r4;return r25}}while(0);HEAP32[r11]=0;HEAP32[r12]=0;HEAP32[r13]=0}r25=r9?0:r2;STACKTOP=r4;return r25}function __ZNSt3__110__stdinbufIcED1Ev(r1){var r2;HEAP32[r1>>2]=11800;r2=HEAP32[r1+4>>2];r1=r2+4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)|0)!=0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);return}function __ZNSt3__110__stdinbufIcED0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=11800;r2=HEAP32[r1+4>>2];r3=r2+4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)|0)!=0){r4=r1;__ZdlPv(r4);return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);r4=r1;__ZdlPv(r4);return}function __ZNSt3__110__stdinbufIcE9underflowEv(r1){return __ZNSt3__110__stdinbufIcE9__getcharEb(r1,0)}function __ZNSt3__110__stdinbufIcE5uflowEv(r1){return __ZNSt3__110__stdinbufIcE9__getcharEb(r1,1)}function __ZNSt3__110__stdinbufIcE9pbackfailEi(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8,r7=r6>>2;r8=r4+16;if((r2|0)==-1){r9=-1;STACKTOP=r4;return r9}r10=r2&255;HEAP8[r8]=r10;r11=HEAP32[r1+36>>2];r12=r5|0;r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+12>>2]](r11,HEAP32[r1+40>>2],r8,r8+1|0,r4+24,r12,r5+8|0,r6);if((r13|0)==3){HEAP8[r12]=r10;HEAP32[r7]=r5+1}else if((r13|0)==2|(r13|0)==1){r9=-1;STACKTOP=r4;return r9}r13=r1+32|0;while(1){r1=HEAP32[r7];if(r1>>>0<=r12>>>0){r9=r2;r3=1502;break}r5=r1-1|0;HEAP32[r7]=r5;if((_ungetc(HEAP8[r5]|0,HEAP32[r13>>2])|0)==-1){r9=-1;r3=1500;break}}if(r3==1500){STACKTOP=r4;return r9}else if(r3==1502){STACKTOP=r4;return r9}}function __ZNSt3__110__stdinbufIcE9__getcharEb(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r3=0;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r4;r6=r4+8;r7=r4+16;r8=r4+24;r9=HEAP32[r1+44>>2];r10=(r9|0)>1?r9:1;L1880:do{if((r10|0)>0){r9=r1+32|0;r11=0;while(1){r12=_fgetc(HEAP32[r9>>2]);if((r12|0)==-1){r13=-1;break}HEAP8[r5+r11|0]=r12&255;r12=r11+1|0;if((r12|0)<(r10|0)){r11=r12}else{break L1880}}STACKTOP=r4;return r13}}while(0);L1887:do{if((HEAP8[r1+48|0]&1)==0){r11=r1+40|0;r9=r1+36|0;r12=r5|0;r14=r6+1|0;r15=r1+32|0;r16=r10;while(1){r17=HEAP32[r11>>2];r18=r17;r19=HEAP32[r18>>2];r20=HEAP32[r18+4>>2];r18=HEAP32[r9>>2];r21=r5+r16|0;r22=FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+16>>2]](r18,r17,r12,r21,r7,r6,r14,r8);if((r22|0)==3){r3=1513;break}else if((r22|0)==2){r13=-1;r3=1524;break}else if((r22|0)!=1){r23=r16;break L1887}r22=HEAP32[r11>>2];HEAP32[r22>>2]=r19;HEAP32[r22+4>>2]=r20;if((r16|0)==8){r13=-1;r3=1522;break}r20=_fgetc(HEAP32[r15>>2]);if((r20|0)==-1){r13=-1;r3=1523;break}HEAP8[r21]=r20&255;r16=r16+1|0}if(r3==1513){HEAP8[r6]=HEAP8[r12];r23=r16;break}else if(r3==1522){STACKTOP=r4;return r13}else if(r3==1523){STACKTOP=r4;return r13}else if(r3==1524){STACKTOP=r4;return r13}}else{HEAP8[r6]=HEAP8[r5|0];r23=r10}}while(0);L1901:do{if(!r2){r10=r1+32|0;r3=r23;while(1){if((r3|0)<=0){break L1901}r8=r3-1|0;if((_ungetc(HEAPU8[r5+r8|0],HEAP32[r10>>2])|0)==-1){r13=-1;break}else{r3=r8}}STACKTOP=r4;return r13}}while(0);r13=HEAPU8[r6];STACKTOP=r4;return r13}function __GLOBAL__I_a154(){__ZNSt3__18ios_base4InitC2Ev(0);_atexit(368,19024,___dso_handle);return}function __ZNSt11logic_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=10104;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt11logic_errorD2Ev(r1){var r2;HEAP32[r1>>2]=10104;r2=r1+4|0;r1=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)-1|0)>=0){return}r1=HEAP32[r2>>2]-12|0;if((r1|0)==0){return}__ZdaPv(r1);return}function __ZNSt13runtime_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=10040;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt13runtime_errorD2Ev(r1){var r2;HEAP32[r1>>2]=10040;r2=r1+4|0;r1=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)-1|0)>=0){return}r1=HEAP32[r2>>2]-12|0;if((r1|0)==0){return}__ZdaPv(r1);return}function __ZNSt12length_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=10104;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNKSt3__114error_category10equivalentEiRKNS_15error_conditionE(r1,r2,r3){var r4,r5,r6;r4=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r4;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+12>>2]](r5,r1,r2);if((HEAP32[r5+4>>2]|0)!=(HEAP32[r3+4>>2]|0)){r6=0;STACKTOP=r4;return r6}r6=(HEAP32[r5>>2]|0)==(HEAP32[r3>>2]|0);STACKTOP=r4;return r6}function __ZNSt3__112system_error6__initERKNS_10error_codeENS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r4=STACKTOP;r5=r3,r6=r5>>2;r7=STACKTOP,r8=r7>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r9=r2|0;r10=HEAP32[r9>>2];do{if((r10|0)!=0){r11=HEAPU8[r5];if((r11&1|0)==0){r12=r11>>>1}else{r12=HEAP32[r3+4>>2]}if((r12|0)==0){r13=r10}else{__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r3,3552,2);r13=HEAP32[r9>>2]}r11=HEAP32[r2+4>>2];FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+24>>2]](r7,r11,r13);r11=r7;r14=HEAP8[r11];if((r14&1)==0){r15=r7+1|0}else{r15=HEAP32[r8+2]}r16=r14&255;if((r16&1|0)==0){r17=r16>>>1}else{r17=HEAP32[r8+1]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r3,r15,r17);if((HEAP8[r11]&1)==0){break}__ZdlPv(HEAP32[r8+2])}}while(0);r8=r1>>2;HEAP32[r8]=HEAP32[r6];HEAP32[r8+1]=HEAP32[r6+1];HEAP32[r8+2]=HEAP32[r6+2];HEAP32[r6]=0;HEAP32[r6+1]=0;HEAP32[r6+2]=0;STACKTOP=r4;return}function __ZNSt3__110__stdinbufIcEC2EP7__sFILEP10_mbstate_t(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=STACKTOP;STACKTOP=STACKTOP+16|0;r5=r4,r6=r5>>2;r7=r1|0;HEAP32[r7>>2]=11800;if(HEAP8[19160]){r8=HEAP32[2238]}else{if(HEAP8[19168]){r9=HEAP32[HEAP32[2240]>>2]}else{__ZNSt3__16locale5__impC2Ej(9256,1);HEAP32[2242]=9256;HEAP32[2240]=8968;HEAP8[19168]=1;r9=9256}HEAP32[2244]=r9;r10=r9+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;HEAP32[2238]=8976;HEAP8[19160]=1;r8=8976}r10=r1+4|0;r9=HEAP32[r8>>2];HEAP32[r10>>2]=r9;r8=r9+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;r8=(r1+8|0)>>2;HEAP32[r8]=0;HEAP32[r8+1]=0;HEAP32[r8+2]=0;HEAP32[r8+3]=0;HEAP32[r8+4]=0;HEAP32[r8+5]=0;HEAP32[r7>>2]=12568;HEAP32[r1+32>>2]=r2;HEAP32[r1+40>>2]=r3;r3=HEAP32[r10>>2],r10=r3>>2;r2=(r3+4|0)>>2;tempValue=HEAP32[r2],HEAP32[r2]=tempValue+1,tempValue;if((HEAP32[4568]|0)!=-1){HEAP32[r6]=18272;HEAP32[r6+1]=24;HEAP32[r6+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18272,r5,252)}r5=HEAP32[4569]-1|0;r6=HEAP32[r10+2];do{if(HEAP32[r10+3]-r6>>2>>>0>r5>>>0){r7=HEAP32[r6+(r5<<2)>>2];if((r7|0)==0){break}r8=r7;r9=r1+36|0;HEAP32[r9>>2]=r8;r11=r1+44|0;HEAP32[r11>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+24>>2]](r8);r8=HEAP32[r9>>2];HEAP8[r1+48|0]=FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r8)&1;if((HEAP32[r11>>2]|0)<=8){if(((tempValue=HEAP32[r2],HEAP32[r2]=tempValue+ -1,tempValue)|0)!=0){STACKTOP=r4;return}FUNCTION_TABLE[HEAP32[HEAP32[r10]+8>>2]](r3|0);STACKTOP=r4;return}r11=___cxa_allocate_exception(8);HEAP32[r11>>2]=10040;r8=r11+4|0;if((r8|0)!=0){r9=__Znaj(50),r7=r9>>2;HEAP32[r7+1]=37;HEAP32[r7]=37;r12=r9+12|0;HEAP32[r8>>2]=r12;HEAP32[r7+2]=0;_memcpy(r12,216,38)|0}___cxa_throw(r11,16136,184)}}while(0);r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=10008;___cxa_throw(r4,16120,514)}function __ZNSt3__110__stdinbufIcE5imbueERKNS_6localeE(r1,r2){var r3,r4,r5,r6,r7,r8;r3=STACKTOP;STACKTOP=STACKTOP+16|0;r4=r3,r5=r4>>2;r6=HEAP32[r2>>2];if((HEAP32[4568]|0)!=-1){HEAP32[r5]=18272;HEAP32[r5+1]=24;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18272,r4,252)}r4=HEAP32[4569]-1|0;r5=HEAP32[r6+8>>2];if(HEAP32[r6+12>>2]-r5>>2>>>0<=r4>>>0){r7=___cxa_allocate_exception(4);r8=r7;HEAP32[r8>>2]=10008;___cxa_throw(r7,16120,514)}r6=HEAP32[r5+(r4<<2)>>2];if((r6|0)==0){r7=___cxa_allocate_exception(4);r8=r7;HEAP32[r8>>2]=10008;___cxa_throw(r7,16120,514)}r7=r6;r8=r1+36|0;HEAP32[r8>>2]=r7;r4=r1+44|0;HEAP32[r4>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+24>>2]](r7);r7=HEAP32[r8>>2];HEAP8[r1+48|0]=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r7)&1;if((HEAP32[r4>>2]|0)>8){__ZNSt3__121__throw_runtime_errorEPKc(216)}else{STACKTOP=r3;return}}function __ZNSt3__112system_errorD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=10040;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt3__112system_errorD2Ev(r1){var r2;HEAP32[r1>>2]=10040;r2=r1+4|0;r1=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)-1|0)>=0){return}r1=HEAP32[r2>>2]-12|0;if((r1|0)==0){return}__ZdaPv(r1);return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev(r1){if((HEAP8[r1]&1)==0){return}__ZdlPv(HEAP32[r1+8>>2]);return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10;r3=_strlen(r2);r4=r1;r5=r1;r6=HEAP8[r5];if((r6&1)==0){r7=10;r8=r6}else{r6=HEAP32[r1>>2];r7=(r6&-2)-1|0;r8=r6&255}if(r7>>>0<r3>>>0){r6=r8&255;if((r6&1|0)==0){r9=r6>>>1}else{r9=HEAP32[r1+4>>2]}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r7,r3-r7|0,r9,0,r9,r3,r2);return r1}if((r8&1)==0){r10=r4+1|0}else{r10=HEAP32[r1+8>>2]}_memmove(r10,r2,r3,1,0);HEAP8[r10+r3|0]=0;if((HEAP8[r5]&1)==0){HEAP8[r5]=r3<<1&255;return r1}else{HEAP32[r1+4>>2]=r3;return r1}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEjc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10;if((r2|0)==0){return r1}r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=10;r7=r5}else{r5=HEAP32[r1>>2];r6=(r5&-2)-1|0;r7=r5&255}r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r1+4>>2]}if((r6-r8|0)>>>0<r2>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r6,r2-r6+r8|0,r8,r8,0,0);r9=HEAP8[r4]}else{r9=r7}if((r9&1)==0){r10=r1+1|0}else{r10=HEAP32[r1+8>>2]}_memset(r10+r8|0,r3,r2);r3=r8+r2|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r3<<1&255}else{HEAP32[r1+4>>2]=r3}HEAP8[r10+r3|0]=0;return r1}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcj(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=10;r7=r5}else{r5=HEAP32[r1>>2];r6=(r5&-2)-1|0;r7=r5&255}r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r1+4>>2]}if((r6-r8|0)>>>0<r3>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r6,r3-r6+r8|0,r8,r8,0,r3,r2);return r1}if((r3|0)==0){return r1}if((r7&1)==0){r9=r1+1|0}else{r9=HEAP32[r1+8>>2]}r7=r9+r8|0;_memcpy(r7,r2,r3)|0;r2=r8+r3|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r2<<1&255}else{HEAP32[r1+4>>2]=r2}HEAP8[r9+r2|0]=0;return r1}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEED1Ev(r1){if((HEAP8[r1]&1)==0){return}__ZdlPv(HEAP32[r1+8>>2]);return}function __ZNSt3__112system_errorC2ENS_10error_codeEPKc(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r4=STACKTOP;STACKTOP=STACKTOP+32|0;r5=r2;r2=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[r2>>2]=HEAP32[r5>>2];HEAP32[r2+4>>2]=HEAP32[r5+4>>2];r5=r4;r6=r4+16,r7=r6>>2;r8=_strlen(r3);if((r8|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r8>>>0<11){HEAP8[r6]=r8<<1&255;r9=r6+1|0}else{r10=r8+16&-16;r11=__Znwj(r10);HEAP32[r7+2]=r11;HEAP32[r7]=r10|1;HEAP32[r7+1]=r8;r9=r11}_memcpy(r9,r3,r8)|0;HEAP8[r9+r8|0]=0;__ZNSt3__112system_error6__initERKNS_10error_codeENS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r5,r2,r6);r8=(r1|0)>>2;HEAP32[r8]=10040;r9=r1+4|0;r3=r5;if((r9|0)!=0){if((HEAP8[r3]&1)==0){r12=r5+1|0}else{r12=HEAP32[r5+8>>2]}r11=_strlen(r12);r10=__Znaj(r11+13|0),r13=r10>>2;HEAP32[r13+1]=r11;HEAP32[r13]=r11;r11=r10+12|0;HEAP32[r9>>2]=r11;HEAP32[r13+2]=0;_strcpy(r11,r12)}if((HEAP8[r3]&1)!=0){__ZdlPv(HEAP32[r5+8>>2])}if((HEAP8[r6]&1)==0){HEAP32[r8]=12064;r14=r1+8|0;r15=r2;r16=r14;r17=r15|0;r18=HEAP32[r17>>2];r19=r15+4|0;r20=HEAP32[r19>>2];r21=r16|0;HEAP32[r21>>2]=r18;r22=r16+4|0;HEAP32[r22>>2]=r20;STACKTOP=r4;return}__ZdlPv(HEAP32[r7+2]);HEAP32[r8]=12064;r14=r1+8|0;r15=r2;r16=r14;r17=r15|0;r18=HEAP32[r17>>2];r19=r15+4|0;r20=HEAP32[r19>>2];r21=r16|0;HEAP32[r21>>2]=r18;r22=r16+4|0;HEAP32[r22>>2]=r20;STACKTOP=r4;return}function __ZNSt3__111__call_onceERVmPvPFvS2_E(r1,r2,r3){var r4;r4=r1>>2;if((HEAP32[r4]|0)==1){while(1){_pthread_cond_wait(18064,18056);if((HEAP32[r4]|0)!=1){break}}}if((HEAP32[r4]|0)!=0){return}HEAP32[r4]=1;FUNCTION_TABLE[r3](r2);HEAP32[r4]=-1;_pthread_cond_broadcast(18064);return}function __ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(r1){var r2,r3,r4,r5;r1=___cxa_allocate_exception(8);HEAP32[r1>>2]=10104;r2=r1+4|0;if((r2|0)!=0){r3=__Znaj(25),r4=r3>>2;HEAP32[r4+1]=12;HEAP32[r4]=12;r5=r3+12|0;HEAP32[r2>>2]=r5;HEAP32[r4+2]=0;_memcpy(r5,352,13)|0}HEAP32[r1>>2]=10072;___cxa_throw(r1,16152,248)}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r3=r1>>2;if((r2|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}r4=r1;r5=r1;r1=HEAP8[r5];if((r1&1)==0){r6=10;r7=r1}else{r1=HEAP32[r3];r6=(r1&-2)-1|0;r7=r1&255}r1=r7&255;if((r1&1|0)==0){r8=r1>>>1}else{r8=HEAP32[r3+1]}r1=r8>>>0>r2>>>0?r8:r2;if(r1>>>0<11){r9=11}else{r9=r1+16&-16}r1=r9-1|0;if((r1|0)==(r6|0)){return}if((r1|0)==10){r10=r4+1|0;r11=HEAP32[r3+2];r12=1;r13=0;r14=r7}else{if(r1>>>0>r6>>>0){r15=__Znwj(r9)}else{r15=__Znwj(r9)}r6=HEAP8[r5];r1=r6&1;if(r1<<24>>24==0){r16=r4+1|0}else{r16=HEAP32[r3+2]}r10=r15;r11=r16;r12=r1<<24>>24!=0;r13=1;r14=r6}r6=r14&255;if((r6&1|0)==0){r17=r6>>>1}else{r17=HEAP32[r3+1]}r6=r17+1|0;_memcpy(r10,r11,r6)|0;if(r12){__ZdlPv(r11)}if(r13){HEAP32[r3]=r9|1;HEAP32[r3+1]=r8;HEAP32[r3+2]=r10;return}else{HEAP8[r5]=r8<<1&255;return}}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE21__grow_by_and_replaceEjjjjjjPKc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;if((-3-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r9=r1+1|0}else{r9=HEAP32[r1+8>>2]}do{if(r2>>>0<2147483631){r10=r3+r2|0;r11=r2<<1;r12=r10>>>0<r11>>>0?r11:r10;if(r12>>>0<11){r13=11;break}r13=r12+16&-16}else{r13=-2}}while(0);r3=__Znwj(r13);if((r5|0)!=0){_memcpy(r3,r9,r5)|0}if((r7|0)!=0){r12=r3+r5|0;_memcpy(r12,r8,r7)|0}r8=r4-r6|0;if((r8|0)!=(r5|0)){r4=r8-r5|0;r12=r3+r7+r5|0;r10=r9+r6+r5|0;_memcpy(r12,r10,r4)|0}if((r2|0)==10){r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=r3+r17|0;HEAP8[r19]=0;return}__ZdlPv(r9);r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r13|1;r16=r1|0;HEAP32[r16>>2]=r15;r17=r8+r7|0;r18=r1+4|0;HEAP32[r18>>2]=r17;r19=r3+r17|0;HEAP8[r19]=0;return}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;if((-3-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r8=r1+1|0}else{r8=HEAP32[r1+8>>2]}do{if(r2>>>0<2147483631){r9=r3+r2|0;r10=r2<<1;r11=r9>>>0<r10>>>0?r10:r9;if(r11>>>0<11){r12=11;break}r12=r11+16&-16}else{r12=-2}}while(0);r3=__Znwj(r12);if((r5|0)!=0){_memcpy(r3,r8,r5)|0}r11=r4-r6|0;if((r11|0)!=(r5|0)){r4=r11-r5|0;r11=r3+r7+r5|0;r7=r8+r6+r5|0;_memcpy(r11,r7,r4)|0}if((r2|0)==10){r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}__ZdlPv(r8);r13=r1+8|0;HEAP32[r13>>2]=r3;r14=r12|1;r15=r1|0;HEAP32[r15>>2]=r14;return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5imbueERKNS_6localeE(r1,r2){return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6setbufEPci(r1,r2,r3){return r1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE4syncEv(r1){return 0}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9showmanycEv(r1){return 0}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9underflowEv(r1){return-1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE9pbackfailEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE8overflowEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5imbueERKNS_6localeE(r1,r2){return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6setbufEPwi(r1,r2,r3){return r1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE4syncEv(r1){return 0}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9showmanycEv(r1){return 0}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9underflowEv(r1){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE9pbackfailEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE8overflowEi(r1,r2){return-1}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekoffExNS_8ios_base7seekdirEj(r1,r2,r3,r4,r5,r6){r6=r1;HEAP32[r6>>2]=0;HEAP32[r6+4>>2]=0;r6=r1+8|0;HEAP32[r6>>2]=-1;HEAP32[r6+4>>2]=-1;return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE7seekposENS_4fposI10_mbstate_tEEj(r1,r2,r3,r4){r4=STACKTOP;r2=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;HEAP32[r3>>2]=HEAP32[r2];HEAP32[r3+4>>2]=HEAP32[r2+1];HEAP32[r3+8>>2]=HEAP32[r2+2];HEAP32[r3+12>>2]=HEAP32[r2+3];r2=r1;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;r2=r1+8|0;HEAP32[r2>>2]=-1;HEAP32[r2+4>>2]=-1;STACKTOP=r4;return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekoffExNS_8ios_base7seekdirEj(r1,r2,r3,r4,r5,r6){r6=r1;HEAP32[r6>>2]=0;HEAP32[r6+4>>2]=0;r6=r1+8|0;HEAP32[r6>>2]=-1;HEAP32[r6+4>>2]=-1;return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE7seekposENS_4fposI10_mbstate_tEEj(r1,r2,r3,r4){r4=STACKTOP;r2=r3>>2;r3=STACKTOP;STACKTOP=STACKTOP+16|0;HEAP32[r3>>2]=HEAP32[r2];HEAP32[r3+4>>2]=HEAP32[r2+1];HEAP32[r3+8>>2]=HEAP32[r2+2];HEAP32[r3+12>>2]=HEAP32[r2+3];r2=r1;HEAP32[r2>>2]=0;HEAP32[r2+4>>2]=0;r2=r1+8|0;HEAP32[r2>>2]=-1;HEAP32[r2+4>>2]=-1;STACKTOP=r4;return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=1;r7=r5}else{r5=HEAP32[r1>>2];r6=(r5&-2)-1|0;r7=r5&255}if(r6>>>0<r3>>>0){r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r1+4>>2]}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE21__grow_by_and_replaceEjjjjjjPKw(r1,r6,r3-r6|0,r8,0,r8,r3,r2);return r1}if((r7&1)==0){r9=r1+4|0}else{r9=HEAP32[r1+8>>2]}r7=(r3|0)==0;do{if(r9-r2>>2>>>0<r3>>>0){if(r7){break}else{r10=r3}while(1){r8=r10-1|0;HEAP32[r9+(r8<<2)>>2]=HEAP32[r2+(r8<<2)>>2];if((r8|0)==0){break}else{r10=r8}}}else{if(r7){break}else{r11=r2;r12=r3;r13=r9}while(1){r8=r12-1|0;HEAP32[r13>>2]=HEAP32[r11>>2];if((r8|0)==0){break}else{r11=r11+4|0;r12=r8;r13=r13+4|0}}}}while(0);HEAP32[r9+(r3<<2)>>2]=0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r3<<1&255;return r1}else{HEAP32[r1+4>>2]=r3;return r1}}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=11800;r2=HEAP32[r1+4>>2];r3=r2+4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)|0)!=0){r4=r1;__ZdlPv(r4);return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);r4=r1;__ZdlPv(r4);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEED1Ev(r1){var r2;HEAP32[r1>>2]=11800;r2=HEAP32[r1+4>>2];r1=r2+4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)|0)!=0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);return}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsgetnEPci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+12|0;r8=r1+16|0;r9=r2;r2=0;while(1){r10=HEAP32[r7>>2];if(r10>>>0<HEAP32[r8>>2]>>>0){HEAP32[r7>>2]=r10+1;r11=HEAP8[r10]}else{r10=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+40>>2]](r1);if((r10|0)==-1){r6=r2;r4=1884;break}r11=r10&255}HEAP8[r9]=r11;r10=r2+1|0;if((r10|0)<(r3|0)){r9=r9+1|0;r2=r10}else{r6=r10;r4=1883;break}}if(r4==1884){return r6}else if(r4==1883){return r6}}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE5uflowEv(r1){var r2,r3;if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1)|0)==-1){r2=-1;return r2}r3=r1+12|0;r1=HEAP32[r3>>2];HEAP32[r3>>2]=r1+1;r2=HEAPU8[r1];return r2}function __ZNSt3__115basic_streambufIcNS_11char_traitsIcEEE6xsputnEPKci(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+24|0;r8=r1+28|0;r9=0;r10=r2;while(1){r2=HEAP32[r7>>2];if(r2>>>0<HEAP32[r8>>2]>>>0){r11=HEAP8[r10];HEAP32[r7>>2]=r2+1;HEAP8[r2]=r11}else{if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r1,HEAPU8[r10])|0)==-1){r6=r9;r4=1898;break}}r11=r9+1|0;if((r11|0)<(r3|0)){r9=r11;r10=r10+1|0}else{r6=r11;r4=1899;break}}if(r4==1899){return r6}else if(r4==1898){return r6}}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=11728;r2=HEAP32[r1+4>>2];r3=r2+4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)|0)!=0){r4=r1;__ZdlPv(r4);return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);r4=r1;__ZdlPv(r4);return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEED1Ev(r1){var r2;HEAP32[r1>>2]=11728;r2=HEAP32[r1+4>>2];r1=r2+4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)|0)!=0){return}FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+8>>2]](r2|0);return}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsgetnEPwi(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+12|0;r8=r1+16|0;r9=r2;r2=0;while(1){r10=HEAP32[r7>>2];if(r10>>>0<HEAP32[r8>>2]>>>0){HEAP32[r7>>2]=r10+4;r11=HEAP32[r10>>2]}else{r10=FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+40>>2]](r1);if((r10|0)==-1){r6=r2;r4=1919;break}else{r11=r10}}HEAP32[r9>>2]=r11;r10=r2+1|0;if((r10|0)<(r3|0)){r9=r9+4|0;r2=r10}else{r6=r10;r4=1920;break}}if(r4==1919){return r6}else if(r4==1920){return r6}}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE5uflowEv(r1){var r2,r3;if((FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r1)|0)==-1){r2=-1;return r2}r3=r1+12|0;r1=HEAP32[r3>>2];HEAP32[r3>>2]=r1+4;r2=HEAP32[r1>>2];return r2}function __ZNSt3__115basic_streambufIwNS_11char_traitsIwEEE6xsputnEPKwi(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=0;r5=r1;if((r3|0)<=0){r6=0;return r6}r7=r1+24|0;r8=r1+28|0;r9=0;r10=r2;while(1){r2=HEAP32[r7>>2];if(r2>>>0<HEAP32[r8>>2]>>>0){r11=HEAP32[r10>>2];HEAP32[r7>>2]=r2+4;HEAP32[r2>>2]=r11}else{if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r1,HEAP32[r10>>2])|0)==-1){r6=r9;r4=1934;break}}r11=r9+1|0;if((r11|0)<(r3|0)){r9=r11;r10=r10+4|0}else{r6=r11;r4=1935;break}}if(r4==1934){return r6}else if(r4==1935){return r6}}function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);__ZdlPv(r1);return}function __ZNSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r3=r1>>2;if(r2>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}r4=r1;r5=HEAP8[r4];if((r5&1)==0){r6=1;r7=r5}else{r5=HEAP32[r3];r6=(r5&-2)-1|0;r7=r5&255}r5=r7&255;if((r5&1|0)==0){r8=r5>>>1}else{r8=HEAP32[r3+1]}r5=r8>>>0>r2>>>0?r8:r2;if(r5>>>0<2){r9=2}else{r9=r5+4&-4}r5=r9-1|0;if((r5|0)==(r6|0)){return}if((r5|0)==1){r10=r1+4|0;r11=HEAP32[r3+2];r12=1;r13=0;r14=r7}else{r7=r9<<2;if(r5>>>0>r6>>>0){r15=__Znwj(r7)}else{r15=__Znwj(r7)}r7=HEAP8[r4];r6=r7&1;if(r6<<24>>24==0){r16=r1+4|0}else{r16=HEAP32[r3+2]}r10=r15;r11=r16;r12=r6<<24>>24!=0;r13=1;r14=r7}r7=r14&255;if((r7&1|0)==0){r17=r7>>>1}else{r17=HEAP32[r3+1]}r7=r17+1|0;if((r7|0)!=0){r17=r11;r14=r7;r7=r10;while(1){r6=r14-1|0;HEAP32[r7>>2]=HEAP32[r17>>2];if((r6|0)==0){break}else{r17=r17+4|0;r14=r6;r7=r7+4|0}}}if(r12){__ZdlPv(r11)}if(r13){HEAP32[r3]=r9|1;HEAP32[r3+1]=r8;HEAP32[r3+2]=r10;return}else{HEAP8[r4]=r8<<1&255;return}}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE21__grow_by_and_replaceEjjjjjjPKw(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;if((1073741821-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r9=r1+4|0}else{r9=HEAP32[r1+8>>2]}do{if(r2>>>0<536870895){r10=r3+r2|0;r11=r2<<1;r12=r10>>>0<r11>>>0?r11:r10;if(r12>>>0<2){r13=2;break}r13=r12+4&-4}else{r13=1073741822}}while(0);r3=__Znwj(r13<<2);if((r5|0)!=0){r12=r9;r10=r5;r11=r3;while(1){r14=r10-1|0;HEAP32[r11>>2]=HEAP32[r12>>2];if((r14|0)==0){break}else{r12=r12+4|0;r10=r14;r11=r11+4|0}}}if((r7|0)!=0){r11=r8;r8=r7;r10=(r5<<2)+r3|0;while(1){r12=r8-1|0;HEAP32[r10>>2]=HEAP32[r11>>2];if((r12|0)==0){break}else{r11=r11+4|0;r8=r12;r10=r10+4|0}}}r10=r4-r6|0;if((r10|0)!=(r5|0)){r4=(r6+r5<<2)+r9|0;r6=r10-r5|0;r8=(r7+r5<<2)+r3|0;while(1){r5=r6-1|0;HEAP32[r8>>2]=HEAP32[r4>>2];if((r5|0)==0){break}else{r4=r4+4|0;r6=r5;r8=r8+4|0}}}if((r2|0)==1){r15=r1+8|0;HEAP32[r15>>2]=r3;r16=r13|1;r17=r1|0;HEAP32[r17>>2]=r16;r18=r10+r7|0;r19=r1+4|0;HEAP32[r19>>2]=r18;r20=(r18<<2)+r3|0;HEAP32[r20>>2]=0;return}__ZdlPv(r9);r15=r1+8|0;HEAP32[r15>>2]=r3;r16=r13|1;r17=r1|0;HEAP32[r17>>2]=r16;r18=r10+r7|0;r19=r1+4|0;HEAP32[r19>>2]=r18;r20=(r18<<2)+r3|0;HEAP32[r20>>2]=0;return}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16;if((1073741821-r2|0)>>>0<r3>>>0){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if((HEAP8[r1]&1)==0){r8=r1+4|0}else{r8=HEAP32[r1+8>>2]}do{if(r2>>>0<536870895){r9=r3+r2|0;r10=r2<<1;r11=r9>>>0<r10>>>0?r10:r9;if(r11>>>0<2){r12=2;break}r12=r11+4&-4}else{r12=1073741822}}while(0);r3=__Znwj(r12<<2);if((r5|0)!=0){r11=r8;r9=r5;r10=r3;while(1){r13=r9-1|0;HEAP32[r10>>2]=HEAP32[r11>>2];if((r13|0)==0){break}else{r11=r11+4|0;r9=r13;r10=r10+4|0}}}r10=r4-r6|0;if((r10|0)!=(r5|0)){r4=(r6+r5<<2)+r8|0;r6=r10-r5|0;r10=(r7+r5<<2)+r3|0;while(1){r5=r6-1|0;HEAP32[r10>>2]=HEAP32[r4>>2];if((r5|0)==0){break}else{r4=r4+4|0;r6=r5;r10=r10+4|0}}}if((r2|0)==1){r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r12|1;r16=r1|0;HEAP32[r16>>2]=r15;return}__ZdlPv(r8);r14=r1+8|0;HEAP32[r14>>2]=r3;r15=r12|1;r16=r1|0;HEAP32[r16>>2]=r15;return}function __ZNSt3__18ios_baseD2Ev(r1){var r2,r3,r4,r5,r6;r2=r1>>2;HEAP32[r2]=10728;r3=HEAP32[r2+10];if((r3|0)!=0){r4=r1+32|0;r5=r1+36|0;r6=r3;while(1){r3=r6-1|0;FUNCTION_TABLE[HEAP32[HEAP32[r4>>2]+(r3<<2)>>2]](0,r1,HEAP32[HEAP32[r5>>2]+(r3<<2)>>2]);if((r3|0)==0){break}else{r6=r3}}}r6=HEAP32[r2+7];r5=r6+4|0;if(((tempValue=HEAP32[r5>>2],HEAP32[r5>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r6>>2]+8>>2]](r6)}_free(HEAP32[r2+8]);_free(HEAP32[r2+9]);_free(HEAP32[r2+12]);_free(HEAP32[r2+15]);return}function __ZNKSt3__119__iostream_category4nameEv(r1){return 3032}function __ZNSt3__119__iostream_categoryD1Ev(r1){return}function __ZNSt3__17collateIcED1Ev(r1){return}function __ZNSt3__16locale5facetD2Ev(r1){return}function __ZNKSt3__17collateIcE10do_compareEPKcS3_S3_S3_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r1=0;L2491:do{if((r4|0)==(r5|0)){r6=r2}else{r7=r2;r8=r4;while(1){if((r7|0)==(r3|0)){r9=-1;r1=2033;break}r10=HEAP8[r7];r11=HEAP8[r8];if(r10<<24>>24<r11<<24>>24){r9=-1;r1=2032;break}if(r11<<24>>24<r10<<24>>24){r9=1;r1=2031;break}r10=r7+1|0;r11=r8+1|0;if((r11|0)==(r5|0)){r6=r10;break L2491}else{r7=r10;r8=r11}}if(r1==2032){return r9}else if(r1==2031){return r9}else if(r1==2033){return r9}}}while(0);r9=(r6|0)!=(r3|0)&1;return r9}function __ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+8)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_istreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+8|0);return}function __ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);__ZdlPv(r1);return}function __ZNSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+8|0);return}function __ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+8)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_istreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+8|0);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+4)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIcNS_11char_traitsIcEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+4|0);return}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);__ZdlPv(r1);return}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+4|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[HEAP32[r1>>2]-12>>2];__ZNSt3__18ios_baseD2Ev(r3+(r2+4)|0);__ZdlPv(r2+r3|0);return}function __ZTv0_n12_NSt3__113basic_ostreamIwNS_11char_traitsIwEEED1Ev(r1){__ZNSt3__18ios_baseD2Ev(r1+HEAP32[HEAP32[r1>>2]-12>>2]+4|0);return}function __ZNSt3__18ios_base7failureD0Ev(r1){var r2,r3,r4;HEAP32[r1>>2]=10040;r2=r1+4|0;r3=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r3>>2],HEAP32[r3>>2]=tempValue+ -1,tempValue)-1|0)>=0){r4=r1;__ZdlPv(r4);return}r3=HEAP32[r2>>2]-12|0;if((r3|0)==0){r4=r1;__ZdlPv(r4);return}__ZdaPv(r3);r4=r1;__ZdlPv(r4);return}function __ZNSt3__18ios_base7failureD2Ev(r1){var r2;HEAP32[r1>>2]=10040;r2=r1+4|0;r1=HEAP32[r2>>2]-4|0;if(((tempValue=HEAP32[r1>>2],HEAP32[r1>>2]=tempValue+ -1,tempValue)-1|0)>=0){return}r1=HEAP32[r2>>2]-12|0;if((r1|0)==0){return}__ZdaPv(r1);return}function __ZNSt3__18ios_baseD0Ev(r1){__ZNSt3__18ios_baseD2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__119__iostream_categoryD0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__17collateIcED0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r3=r2;r4=r2+8;r5=r1>>2;r6=HEAP32[HEAP32[r5]-12>>2]>>2;r7=r1,r8=r7>>2;if((HEAP32[r6+(r8+6)]|0)==0){STACKTOP=r2;return r1}r9=r4|0;HEAP8[r9]=0;HEAP32[r4+4>>2]=r1;do{if((HEAP32[r6+(r8+4)]|0)==0){r10=HEAP32[r6+(r8+18)];if((r10|0)!=0){__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE5flushEv(r10)}HEAP8[r9]=1;r10=HEAP32[(HEAP32[HEAP32[r5]-12>>2]+24>>2)+r8];if((FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r10)|0)!=-1){break}r10=HEAP32[HEAP32[r5]-12>>2];r11=r10+(r7+16)|0;r12=HEAP32[r11>>2]|1;HEAP32[r11>>2]=r12;if((r12&HEAP32[(r10+20>>2)+r8]|0)==0){break}r10=___cxa_allocate_exception(16);if(!HEAP8[19184]){HEAP32[2248]=11568;HEAP8[19184]=1}HEAP32[r3>>2]=_bitshift64Shl(8992,0,32)&0|1;HEAP32[r3+4>>2]=tempRet0&-1;__ZNSt3__112system_errorC2ENS_10error_codeEPKc(r10,r3,2680);HEAP32[r10>>2]=10752;___cxa_throw(r10,16696,62)}}while(0);__ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r4);STACKTOP=r2;return r1}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r3=r2;r4=r2+8;r5=r1>>2;r6=HEAP32[HEAP32[r5]-12>>2]>>2;r7=r1,r8=r7>>2;if((HEAP32[r6+(r8+6)]|0)==0){STACKTOP=r2;return r1}r9=r4|0;HEAP8[r9]=0;HEAP32[r4+4>>2]=r1;do{if((HEAP32[r6+(r8+4)]|0)==0){r10=HEAP32[r6+(r8+18)];if((r10|0)!=0){__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE5flushEv(r10)}HEAP8[r9]=1;r10=HEAP32[(HEAP32[HEAP32[r5]-12>>2]+24>>2)+r8];if((FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r10)|0)!=-1){break}r10=HEAP32[HEAP32[r5]-12>>2];r11=r10+(r7+16)|0;r12=HEAP32[r11>>2]|1;HEAP32[r11>>2]=r12;if((r12&HEAP32[(r10+20>>2)+r8]|0)==0){break}r10=___cxa_allocate_exception(16);if(!HEAP8[19184]){HEAP32[2248]=11568;HEAP8[19184]=1}HEAP32[r3>>2]=_bitshift64Shl(8992,0,32)&0|1;HEAP32[r3+4>>2]=tempRet0&-1;__ZNSt3__112system_errorC2ENS_10error_codeEPKc(r10,r3,2680);HEAP32[r10>>2]=10752;___cxa_throw(r10,16696,62)}}while(0);__ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE6sentryD2Ev(r4);STACKTOP=r2;return r1}function __ZNSt3__113basic_ostreamIcNS_11char_traitsIcEEE6sentryD2Ev(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=(r1+4|0)>>2;r1=HEAP32[r4];r5=HEAP32[HEAP32[r1>>2]-12>>2]>>2;r6=r1>>2;if((HEAP32[r5+(r6+6)]|0)==0){STACKTOP=r2;return}if((HEAP32[r5+(r6+4)]|0)!=0){STACKTOP=r2;return}if((HEAP32[r5+(r6+1)]&8192|0)==0){STACKTOP=r2;return}if(__ZSt18uncaught_exceptionv()){STACKTOP=r2;return}r6=HEAP32[r4];r5=HEAP32[r6+HEAP32[HEAP32[r6>>2]-12>>2]+24>>2];if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+24>>2]](r5)|0)!=-1){STACKTOP=r2;return}r5=HEAP32[r4];r4=HEAP32[HEAP32[r5>>2]-12>>2];r6=r5;r5=r4+(r6+16)|0;r1=HEAP32[r5>>2]|1;HEAP32[r5>>2]=r1;if((r1&HEAP32[r4+(r6+20)>>2]|0)==0){STACKTOP=r2;return}r2=___cxa_allocate_exception(16);if(!HEAP8[19184]){HEAP32[2248]=11568;HEAP8[19184]=1}HEAP32[r3>>2]=_bitshift64Shl(8992,0,32)&0|1;HEAP32[r3+4>>2]=tempRet0&-1;__ZNSt3__112system_errorC2ENS_10error_codeEPKc(r2,r3,2680);HEAP32[r2>>2]=10752;___cxa_throw(r2,16696,62)}function __ZNSt3__113basic_ostreamIwNS_11char_traitsIwEEE6sentryD2Ev(r1){var r2,r3,r4,r5,r6;r2=STACKTOP;STACKTOP=STACKTOP+8|0;r3=r2;r4=(r1+4|0)>>2;r1=HEAP32[r4];r5=HEAP32[HEAP32[r1>>2]-12>>2]>>2;r6=r1>>2;if((HEAP32[r5+(r6+6)]|0)==0){STACKTOP=r2;return}if((HEAP32[r5+(r6+4)]|0)!=0){STACKTOP=r2;return}if((HEAP32[r5+(r6+1)]&8192|0)==0){STACKTOP=r2;return}if(__ZSt18uncaught_exceptionv()){STACKTOP=r2;return}r6=HEAP32[r4];r5=HEAP32[r6+HEAP32[HEAP32[r6>>2]-12>>2]+24>>2];if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+24>>2]](r5)|0)!=-1){STACKTOP=r2;return}r5=HEAP32[r4];r4=HEAP32[HEAP32[r5>>2]-12>>2];r6=r5;r5=r4+(r6+16)|0;r1=HEAP32[r5>>2]|1;HEAP32[r5>>2]=r1;if((r1&HEAP32[r4+(r6+20)>>2]|0)==0){STACKTOP=r2;return}r2=___cxa_allocate_exception(16);if(!HEAP8[19184]){HEAP32[2248]=11568;HEAP8[19184]=1}HEAP32[r3>>2]=_bitshift64Shl(8992,0,32)&0|1;HEAP32[r3+4>>2]=tempRet0&-1;__ZNSt3__112system_errorC2ENS_10error_codeEPKc(r2,r3,2680);HEAP32[r2>>2]=10752;___cxa_throw(r2,16696,62)}function __ZNKSt3__119__iostream_category7messageEi(r1,r2,r3){var r4,r5,r6;r2=r1>>2;if((r3|0)==1){r4=__Znwj(48);HEAP32[r2+2]=r4;HEAP32[r2]=49;HEAP32[r2+1]=35;_memcpy(r4,3728,35)|0;HEAP8[r4+35|0]=0;return}r4=_strerror(r3);r3=_strlen(r4);if((r3|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<11){HEAP8[r1]=r3<<1&255;r5=r1+1|0}else{r1=r3+16&-16;r6=__Znwj(r1);HEAP32[r2+2]=r6;HEAP32[r2]=r1|1;HEAP32[r2+1]=r3;r5=r6}_memcpy(r5,r4,r3)|0;HEAP8[r5+r3|0]=0;return}function __ZNSt3__17collateIwED1Ev(r1){return}function __ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){return}function __ZNKSt3__17collateIcE7do_hashEPKcS3_(r1,r2,r3){var r4,r5,r6,r7;if((r2|0)==(r3|0)){r4=0;return r4}else{r5=r2;r6=0}while(1){r2=(r6<<4)+HEAP8[r5]|0;r1=r2&-268435456;r7=(r1>>>24|r1)^r2;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r7;break}else{r5=r2;r6=r7}}return r4}function __ZNKSt3__17collateIwE10do_compareEPKwS3_S3_S3_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11;r1=0;L2646:do{if((r4|0)==(r5|0)){r6=r2}else{r7=r2;r8=r4;while(1){if((r7|0)==(r3|0)){r9=-1;r1=2190;break}r10=HEAP32[r7>>2];r11=HEAP32[r8>>2];if((r10|0)<(r11|0)){r9=-1;r1=2191;break}if((r11|0)<(r10|0)){r9=1;r1=2193;break}r10=r7+4|0;r11=r8+4|0;if((r11|0)==(r5|0)){r6=r10;break L2646}else{r7=r10;r8=r11}}if(r1==2191){return r9}else if(r1==2193){return r9}else if(r1==2190){return r9}}}while(0);r9=(r6|0)!=(r3|0)&1;return r9}function __ZNKSt3__17collateIwE7do_hashEPKwS3_(r1,r2,r3){var r4,r5,r6,r7;if((r2|0)==(r3|0)){r4=0;return r4}else{r5=r2;r6=0}while(1){r2=(r6<<4)+HEAP32[r5>>2]|0;r1=r2&-268435456;r7=(r1>>>24|r1)^r2;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r7;break}else{r5=r2;r6=r7}}return r4}function __ZNSt3__17collateIwED0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__17collateIcE12do_transformEPKcS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r2=r3;r5=r4-r2|0;if((r5|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r5>>>0<11){HEAP8[r1]=r5<<1&255;r6=r1+1|0}else{r7=r5+16&-16;r8=__Znwj(r7);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r7|1;HEAP32[r1+4>>2]=r5;r6=r8}if((r3|0)==(r4|0)){r9=r6;HEAP8[r9]=0;return}r8=r4+ -r2|0;r2=r6;r5=r3;while(1){HEAP8[r2]=HEAP8[r5];r3=r5+1|0;if((r3|0)==(r4|0)){break}else{r2=r2+1|0;r5=r3}}r9=r6+r8|0;HEAP8[r9]=0;return}function __ZNKSt3__17collateIwE12do_transformEPKwS3_(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r2=r3;r5=r4-r2|0;r6=r5>>2;if(r6>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r6>>>0<2){HEAP8[r1]=r5>>>1&255;r7=r1+4|0}else{r5=r6+4&-4;r8=__Znwj(r5<<2);HEAP32[r1+8>>2]=r8;HEAP32[r1>>2]=r5|1;HEAP32[r1+4>>2]=r6;r7=r8}if((r3|0)==(r4|0)){r9=r7;HEAP32[r9>>2]=0;return}r8=(r4-4+ -r2|0)>>>2;r2=r7;r6=r3;while(1){HEAP32[r2>>2]=HEAP32[r6>>2];r3=r6+4|0;if((r3|0)==(r4|0)){break}else{r2=r2+4|0;r6=r3}}r9=(r8+1<<2)+r7|0;HEAP32[r9>>2]=0;return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r8=STACKTOP;STACKTOP=STACKTOP+96|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16,r12=r11>>2;r13=r8+32;r14=r8+40;r15=r8+48;r16=r8+56;r17=r8+64;r18=r8+88;if((HEAP32[r5+4>>2]&1|0)==0){HEAP32[r13>>2]=-1;r19=HEAP32[HEAP32[r2>>2]+16>>2];r20=r3|0;HEAP32[r15>>2]=HEAP32[r20>>2];HEAP32[r16>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r19](r14,r2,r15,r16,r5,r6,r13);r16=HEAP32[r14>>2];HEAP32[r20>>2]=r16;r20=HEAP32[r13>>2];if((r20|0)==0){HEAP8[r7]=0}else if((r20|0)==1){HEAP8[r7]=1}else{HEAP8[r7]=1;HEAP32[r6>>2]=4}HEAP32[r1>>2]=r16;STACKTOP=r8;return}r16=r5+28|0;r5=HEAP32[r16>>2],r20=r5>>2;r13=(r5+4|0)>>2;tempValue=HEAP32[r13],HEAP32[r13]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r12]=18576;HEAP32[r12+1]=24;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r11,252)}r11=HEAP32[4645]-1|0;r12=HEAP32[r20+2];do{if(HEAP32[r20+3]-r12>>2>>>0>r11>>>0){r14=HEAP32[r12+(r11<<2)>>2];if((r14|0)==0){break}r15=r14;if(((tempValue=HEAP32[r13],HEAP32[r13]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r20]+8>>2]](r5)}r14=HEAP32[r16>>2],r2=r14>>2;r19=(r14+4|0)>>2;tempValue=HEAP32[r19],HEAP32[r19]=tempValue+1,tempValue;if((HEAP32[4548]|0)!=-1){HEAP32[r10]=18192;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18192,r9,252)}r21=HEAP32[4549]-1|0;r22=HEAP32[r2+2];do{if(HEAP32[r2+3]-r22>>2>>>0>r21>>>0){r23=HEAP32[r22+(r21<<2)>>2];if((r23|0)==0){break}r24=r23;if(((tempValue=HEAP32[r19],HEAP32[r19]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r2]+8>>2]](r14)}r25=r17|0;r26=r23;FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+24>>2]](r25,r24);FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+28>>2]](r17+12|0,r24);HEAP32[r18>>2]=HEAP32[r4>>2];HEAP8[r7]=(__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r18,r25,r17+24|0,r15,r6,1)|0)==(r25|0)&1;HEAP32[r1>>2]=HEAP32[r3>>2];if((HEAP8[r17+12|0]&1)!=0){__ZdlPv(HEAP32[r17+20>>2])}if((HEAP8[r17]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r17+8>>2]);STACKTOP=r8;return}}while(0);r15=___cxa_allocate_exception(4);HEAP32[r15>>2]=10008;___cxa_throw(r15,16120,514)}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRl(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L2744:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=2288}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L2744}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=2288;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L2744}}}}while(0);if(r2==2288){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r33=r20>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r27=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r27}}while(0);HEAP32[r7>>2]=__ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L2789:do{if(r30){r2=2320}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=2320;break L2789}}while(0);if(!(r9^(r28|0)==0)){r2=2322}}}while(0);if(r2==2320){if(r9){r2=2322}}if(r2==2322){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r34;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+104|0;r10=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r10>>2];r10=(r4-r3|0)/12&-1;r11=r9|0;do{if(r10>>>0>100){r12=_malloc(r10);if((r12|0)!=0){r13=r12;r14=r12;break}r12=___cxa_allocate_exception(4);HEAP32[r12>>2]=9976;___cxa_throw(r12,16104,66)}else{r13=r11;r14=0}}while(0);r11=(r3|0)==(r4|0);if(r11){r15=r10;r16=0}else{r12=r10;r10=0;r17=r13;r18=r3;while(1){r19=HEAPU8[r18];if((r19&1|0)==0){r20=r19>>>1}else{r20=HEAP32[r18+4>>2]}if((r20|0)==0){HEAP8[r17]=2;r21=r10+1|0;r22=r12-1|0}else{HEAP8[r17]=1;r21=r10;r22=r12}r19=r18+12|0;if((r19|0)==(r4|0)){r15=r22;r16=r21;break}else{r12=r22;r10=r21;r17=r17+1|0;r18=r19}}}r18=(r1|0)>>2;r1=(r2|0)>>2;r2=r5;r17=0;r21=r16;r16=r15;while(1){r15=HEAP32[r18],r10=r15>>2;do{if((r15|0)==0){r23=0}else{if((HEAP32[r10+3]|0)!=(HEAP32[r10+4]|0)){r23=r15;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r15)|0)==-1){HEAP32[r18]=0;r23=0;break}else{r23=HEAP32[r18];break}}}while(0);r15=(r23|0)==0;r10=HEAP32[r1],r22=r10>>2;if((r10|0)==0){r24=r23,r25=r24>>2;r26=0,r27=r26>>2}else{do{if((HEAP32[r22+3]|0)==(HEAP32[r22+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r10)|0)!=-1){r28=r10;break}HEAP32[r1]=0;r28=0}else{r28=r10}}while(0);r24=HEAP32[r18],r25=r24>>2;r26=r28,r27=r26>>2}r29=(r26|0)==0;if(!((r15^r29)&(r16|0)!=0)){break}r10=HEAP32[r25+3];if((r10|0)==(HEAP32[r25+4]|0)){r30=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)&255}else{r30=HEAP8[r10]}if(r7){r31=r30}else{r31=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](r5,r30)}do{if(r11){r32=r21;r33=r16}else{r10=r17+1|0;r22=r16;r12=r21;r20=r13;r19=0;r34=r3;while(1){do{if((HEAP8[r20]|0)==1){r35=r34;if((HEAP8[r35]&1)==0){r36=r34+1|0}else{r36=HEAP32[r34+8>>2]}r37=HEAP8[r36+r17|0];if(r7){r38=r37}else{r38=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+12>>2]](r5,r37)}if(r31<<24>>24!=r38<<24>>24){HEAP8[r20]=0;r39=r19;r40=r12;r41=r22-1|0;break}r37=HEAPU8[r35];if((r37&1|0)==0){r42=r37>>>1}else{r42=HEAP32[r34+4>>2]}if((r42|0)!=(r10|0)){r39=1;r40=r12;r41=r22;break}HEAP8[r20]=2;r39=1;r40=r12+1|0;r41=r22-1|0}else{r39=r19;r40=r12;r41=r22}}while(0);r37=r34+12|0;if((r37|0)==(r4|0)){break}r22=r41;r12=r40;r20=r20+1|0;r19=r39;r34=r37}if(!r39){r32=r40;r33=r41;break}r34=HEAP32[r18];r19=r34+12|0;r20=HEAP32[r19>>2];if((r20|0)==(HEAP32[r34+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+40>>2]](r34)}else{HEAP32[r19>>2]=r20+1}if((r40+r41|0)>>>0<2|r11){r32=r40;r33=r41;break}r20=r17+1|0;r19=r40;r34=r13;r12=r3;while(1){do{if((HEAP8[r34]|0)==2){r22=HEAPU8[r12];if((r22&1|0)==0){r43=r22>>>1}else{r43=HEAP32[r12+4>>2]}if((r43|0)==(r20|0)){r44=r19;break}HEAP8[r34]=0;r44=r19-1|0}else{r44=r19}}while(0);r22=r12+12|0;if((r22|0)==(r4|0)){r32=r44;r33=r41;break}else{r19=r44;r34=r34+1|0;r12=r22}}}}while(0);r17=r17+1|0;r21=r32;r16=r33}do{if((r24|0)==0){r45=0}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){r45=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r18]=0;r45=0;break}else{r45=HEAP32[r18];break}}}while(0);r18=(r45|0)==0;do{if(r29){r8=2409}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){if(r18){break}else{r8=2411;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)|0)==-1){HEAP32[r1]=0;r8=2409;break}else{if(r18^(r26|0)==0){break}else{r8=2411;break}}}}while(0);if(r8==2409){if(r18){r8=2411}}if(r8==2411){HEAP32[r6>>2]=HEAP32[r6>>2]|2}L2914:do{if(r11){r8=2416}else{r18=r3;r26=r13;while(1){if((HEAP8[r26]|0)==2){r46=r18;break L2914}r1=r18+12|0;if((r1|0)==(r4|0)){r8=2416;break L2914}r18=r1;r26=r26+1|0}}}while(0);if(r8==2416){HEAP32[r6>>2]=HEAP32[r6>>2]|4;r46=r4}if((r14|0)==0){STACKTOP=r9;return r46}_free(r14);STACKTOP=r9;return r46}function __ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16;r11=r5>>2;r5=r4>>2;r4=HEAP32[r5];r12=(r4|0)==(r3|0);do{if(r12){r13=(HEAP8[r10+24|0]|0)==r1<<24>>24;if(!r13){if((HEAP8[r10+25|0]|0)!=r1<<24>>24){break}}HEAP32[r5]=r3+1;HEAP8[r3]=r13?43:45;HEAP32[r11]=0;r14=0;return r14}}while(0);r13=HEAPU8[r7];if((r13&1|0)==0){r15=r13>>>1}else{r15=HEAP32[r7+4>>2]}if((r15|0)!=0&r1<<24>>24==r6<<24>>24){r6=HEAP32[r9>>2];if((r6-r8|0)>=160){r14=0;return r14}r8=HEAP32[r11];HEAP32[r9>>2]=r6+4;HEAP32[r6>>2]=r8;HEAP32[r11]=0;r14=0;return r14}r8=r10+26|0;r6=r10;while(1){if((r6|0)==(r8|0)){r16=r8;break}if((HEAP8[r6]|0)==r1<<24>>24){r16=r6;break}else{r6=r6+1|0}}r6=r16-r10|0;if((r6|0)>23){r14=-1;return r14}do{if((r2|0)==8|(r2|0)==10){if((r6|0)<(r2|0)){break}else{r14=-1}return r14}else if((r2|0)==16){if((r6|0)<22){break}if(r12){r14=-1;return r14}if((r4-r3|0)>=3){r14=-1;return r14}if((HEAP8[r4-1|0]|0)!=48){r14=-1;return r14}HEAP32[r11]=0;r10=HEAP8[r6+19032|0];r16=HEAP32[r5];HEAP32[r5]=r16+1;HEAP8[r16]=r10;r14=0;return r14}}while(0);if((r4-r3|0)<39){r3=HEAP8[r6+19032|0];HEAP32[r5]=r4+1;HEAP8[r4]=r3}HEAP32[r11]=HEAP32[r11]+1;r14=0;return r14}function __ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=r1;r6=r1;r7=HEAP8[r6];r8=r7&255;if((r8&1|0)==0){r9=r8>>>1}else{r9=HEAP32[r1+4>>2]}if((r9|0)==0){return}do{if((r2|0)==(r3|0)){r10=r7}else{r9=r3-4|0;if(r9>>>0>r2>>>0){r11=r2;r12=r9}else{r10=r7;break}while(1){r9=HEAP32[r11>>2];HEAP32[r11>>2]=HEAP32[r12>>2];HEAP32[r12>>2]=r9;r9=r11+4|0;r8=r12-4|0;if(r9>>>0<r8>>>0){r11=r9;r12=r8}else{break}}r10=HEAP8[r6]}}while(0);if((r10&1)==0){r13=r5+1|0}else{r13=HEAP32[r1+8>>2]}r5=r10&255;if((r5&1|0)==0){r14=r5>>>1}else{r14=HEAP32[r1+4>>2]}r1=r3-4|0;r3=HEAP8[r13];r5=r3<<24>>24;r10=r3<<24>>24<1|r3<<24>>24==127;L2994:do{if(r1>>>0>r2>>>0){r3=r13+r14|0;r6=r13;r12=r2;r11=r5;r7=r10;while(1){if(!r7){if((r11|0)!=(HEAP32[r12>>2]|0)){break}}r8=(r3-r6|0)>1?r6+1|0:r6;r9=r12+4|0;r15=HEAP8[r8];r16=r15<<24>>24;r17=r15<<24>>24<1|r15<<24>>24==127;if(r9>>>0<r1>>>0){r6=r8;r12=r9;r11=r16;r7=r17}else{r18=r16;r19=r17;break L2994}}HEAP32[r4>>2]=4;return}else{r18=r5;r19=r10}}while(0);if(r19){return}r19=HEAP32[r1>>2];if(!(r18>>>0<r19>>>0|(r19|0)==0)){return}HEAP32[r4>>2]=4;return}function __ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=HEAP32[___errno_location()>>2];HEAP32[___errno_location()>>2]=0;if(HEAP8[19176]){r9=HEAP32[2246]}else{r10=_newlocale(1,2896,0);HEAP32[2246]=r10;HEAP8[19176]=1;r9=r10}r10=_strtoll(r1,r6,r4,r9);r9=tempRet0;r4=HEAP32[___errno_location()>>2];if((r4|0)==0){HEAP32[___errno_location()>>2]=r8}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=-1;r6=0;if((r4|0)==34|((r9|0)<(r2|0)|(r9|0)==(r2|0)&r10>>>0<-2147483648>>>0)|((r9|0)>(r6|0)|(r9|0)==(r6|0)&r10>>>0>2147483647>>>0)){HEAP32[r3>>2]=4;r3=0;r7=(r9|0)>(r3|0)|(r9|0)==(r3|0)&r10>>>0>0>>>0?2147483647:-2147483648;STACKTOP=r5;return r7}else{r7=r10;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==64){r19=8}else if((r18|0)==8){r19=16}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L3038:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=2520}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L3038}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=2520;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L3038}}}}while(0);if(r2==2520){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r33=r20>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r27=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r27}}while(0);HEAP32[r7>>2]=__ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L3083:do{if(r30){r2=2552}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=2552;break L3083}}while(0);if(!(r9^(r28|0)==0)){r2=2554}}}while(0);if(r2==2552){if(r9){r2=2554}}if(r2==2554){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r34;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;do{if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0}else{r9=HEAP32[___errno_location()>>2];HEAP32[___errno_location()>>2]=0;if(HEAP8[19176]){r10=HEAP32[2246]}else{r11=_newlocale(1,2896,0);HEAP32[2246]=r11;HEAP8[19176]=1;r10=r11}r11=_strtoll(r1,r6,r4,r10);r12=tempRet0;r13=HEAP32[___errno_location()>>2];if((r13|0)==0){HEAP32[___errno_location()>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0;break}if((r13|0)!=34){r7=r12;r8=r11;break}HEAP32[r3>>2]=4;r13=0;r9=(r12|0)>(r13|0)|(r12|0)==(r13|0)&r11>>>0>0>>>0;r7=r9?2147483647:-2147483648;r8=r9?-1:0}}while(0);STACKTOP=r5;return tempRet0=r7,r8}function __ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+32|0;r6=r5,r7=r6>>2;r8=r5+16,r9=r8>>2;r10=HEAP32[r2+28>>2];r2=(r10+4|0)>>2;tempValue=HEAP32[r2],HEAP32[r2]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r9]=18576;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r8,252)}r8=HEAP32[4645]-1|0;r9=r10+12|0;r11=r10+8|0;r12=HEAP32[r11>>2];do{if(HEAP32[r9>>2]-r12>>2>>>0>r8>>>0){r13=HEAP32[r12+(r8<<2)>>2];if((r13|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+32>>2]](r13,19032,19058,r3);if((HEAP32[4548]|0)!=-1){HEAP32[r7]=18192;HEAP32[r7+1]=24;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18192,r6,252)}r13=HEAP32[4549]-1|0;r14=HEAP32[r11>>2];do{if(HEAP32[r9>>2]-r14>>2>>>0>r13>>>0){r15=HEAP32[r14+(r13<<2)>>2];if((r15|0)==0){break}r16=r15;HEAP8[r4]=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+16>>2]](r16);FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r1,r16);if(((tempValue=HEAP32[r2],HEAP32[r2]=tempValue+ -1,tempValue)|0)!=0){STACKTOP=r5;return}FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+8>>2]](r10);STACKTOP=r5;return}}while(0);r13=___cxa_allocate_exception(4);HEAP32[r13>>2]=10008;___cxa_throw(r13,16120,514)}}while(0);r5=___cxa_allocate_exception(4);HEAP32[r5>>2]=10008;___cxa_throw(r5,16120,514)}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRt(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L3145:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=2611}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L3145}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=2611;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L3145}}}}while(0);if(r2==2611){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r33=r20>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r27=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r27}}while(0);HEAP16[r7>>1]=__ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L3190:do{if(r30){r2=2643}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=2643;break L3190}}while(0);if(!(r9^(r28|0)==0)){r2=2645}}}while(0);if(r2==2643){if(r9){r2=2645}}if(r2==2645){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r34;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=HEAP32[___errno_location()>>2];HEAP32[___errno_location()>>2]=0;if(HEAP8[19176]){r9=HEAP32[2246]}else{r10=_newlocale(1,2896,0);HEAP32[2246]=r10;HEAP8[19176]=1;r9=r10}r10=_strtoull(r1,r6,r4,r9);r9=tempRet0;r4=HEAP32[___errno_location()>>2];if((r4|0)==0){HEAP32[___errno_location()>>2]=r8}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r4|0)==34|(r9>>>0>r2>>>0|r9>>>0==r2>>>0&r10>>>0>65535>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r10&65535;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L3237:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=2687}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L3237}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=2687;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L3237}}}}while(0);if(r2==2687){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r33=r20>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r27=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r27}}while(0);HEAP32[r7>>2]=__ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L3282:do{if(r30){r2=2719}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=2719;break L3282}}while(0);if(!(r9^(r28|0)==0)){r2=2721}}}while(0);if(r2==2719){if(r9){r2=2721}}if(r2==2721){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r34;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=HEAP32[___errno_location()>>2];HEAP32[___errno_location()>>2]=0;if(HEAP8[19176]){r9=HEAP32[2246]}else{r10=_newlocale(1,2896,0);HEAP32[2246]=r10;HEAP8[19176]=1;r9=r10}r10=_strtoull(r1,r6,r4,r9);r9=tempRet0;r4=HEAP32[___errno_location()>>2];if((r4|0)==0){HEAP32[___errno_location()>>2]=r8}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r4|0)==34|(r9>>>0>r2>>>0|r9>>>0==r2>>>0&r10>>>0>-1>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r10;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L3329:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=2763}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L3329}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=2763;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L3329}}}}while(0);if(r2==2763){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r33=r20>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r27=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r27}}while(0);HEAP32[r7>>2]=__ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L3374:do{if(r30){r2=2795}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=2795;break L3374}}while(0);if(!(r9^(r28|0)==0)){r2=2797}}}while(0);if(r2==2795){if(r9){r2=2797}}if(r2==2797){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r34;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r8=HEAP32[___errno_location()>>2];HEAP32[___errno_location()>>2]=0;if(HEAP8[19176]){r9=HEAP32[2246]}else{r10=_newlocale(1,2896,0);HEAP32[2246]=r10;HEAP8[19176]=1;r9=r10}r10=_strtoull(r1,r6,r4,r9);r9=tempRet0;r4=HEAP32[___errno_location()>>2];if((r4|0)==0){HEAP32[___errno_location()>>2]=r8}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;STACKTOP=r5;return r7}r2=0;if((r4|0)==34|(r9>>>0>r2>>>0|r9>>>0==r2>>>0&r10>>>0>-1>>>0)){HEAP32[r3>>2]=4;r7=-1;STACKTOP=r5;return r7}else{r7=r10;STACKTOP=r5;return r7}}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+280|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+32;r11=r8+40;r12=r8+56;r13=r8+96;r14=r8+104;r15=r8+264,r16=r15>>2;r17=r8+272;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIcE17__stage2_int_prepERNS_8ios_baseEPcRc(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP32[r9],r20=r10>>2;L3421:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{if((HEAP32[r20+3]|0)!=(HEAP32[r20+4]|0)){r21=r10,r22=r21>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r23=(r21|0)==0;r24=HEAP32[r3],r25=r24>>2;do{if((r24|0)==0){r2=2839}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){if(r23){r26=r24;r27=0;break}else{r28=r24,r29=r28>>2;r30=0;break L3421}}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)==-1){HEAP32[r3]=0;r2=2839;break}else{r31=(r24|0)==0;if(r23^r31){r26=r24;r27=r31;break}else{r28=r24,r29=r28>>2;r30=r31;break L3421}}}}while(0);if(r2==2839){r2=0;if(r23){r28=0,r29=r28>>2;r30=1;break}else{r26=0;r27=1}}r24=(r21+12|0)>>2;r25=HEAP32[r24];r31=r21+16|0;if((r25|0)==(HEAP32[r31>>2]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)&255}else{r32=HEAP8[r25]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r32,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r28=r26,r29=r28>>2;r30=r27;break}r25=HEAP32[r24];if((r25|0)==(HEAP32[r31>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r24]=r25+1;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r33=r20>>>1}else{r33=HEAP32[r11+4>>2]}do{if((r33|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r27=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r27}}while(0);HEAP32[r7>>2]=__ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r23){r34=0}else{if((HEAP32[r22+3]|0)!=(HEAP32[r22+4]|0)){r34=r21;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)|0)!=-1){r34=r21;break}HEAP32[r9]=0;r34=0}}while(0);r9=(r34|0)==0;L3466:do{if(r30){r2=2871}else{do{if((HEAP32[r29+3]|0)==(HEAP32[r29+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){break}HEAP32[r3]=0;r2=2871;break L3466}}while(0);if(!(r9^(r28|0)==0)){r2=2873}}}while(0);if(r2==2871){if(r9){r2=2873}}if(r2==2873){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r34;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;do{if((r1|0)==(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0}else{if((HEAP8[r1]|0)==45){HEAP32[r3>>2]=4;r7=0;r8=0;break}r9=HEAP32[___errno_location()>>2];HEAP32[___errno_location()>>2]=0;if(HEAP8[19176]){r10=HEAP32[2246]}else{r11=_newlocale(1,2896,0);HEAP32[2246]=r11;HEAP8[19176]=1;r10=r11}r11=_strtoull(r1,r6,r4,r10);r12=tempRet0;r13=HEAP32[___errno_location()>>2];if((r13|0)==0){HEAP32[___errno_location()>>2]=r9}if((HEAP32[r6>>2]|0)!=(r2|0)){HEAP32[r3>>2]=4;r7=0;r8=0;break}if((r13|0)!=34){r7=r12;r8=r11;break}HEAP32[r3>>2]=4;r7=-1;r8=-1}}while(0);STACKTOP=r5;return tempRet0=r7,r8}function __ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12){var r13,r14,r15,r16,r17,r18,r19;r13=r11>>2;r11=r10>>2;r10=r5>>2;r5=HEAP32[r10];r14=r4;if((r5-r14|0)>38){r15=-1;return r15}if(r1<<24>>24==r6<<24>>24){if((HEAP8[r2]&1)==0){r15=-1;return r15}HEAP8[r2]=0;r6=HEAP32[r10];HEAP32[r10]=r6+1;HEAP8[r6]=46;r6=HEAPU8[r8];if((r6&1|0)==0){r16=r6>>>1}else{r16=HEAP32[r8+4>>2]}if((r16|0)==0){r15=0;return r15}r16=HEAP32[r11];if((r16-r9|0)>=160){r15=0;return r15}r6=HEAP32[r13];HEAP32[r11]=r16+4;HEAP32[r16>>2]=r6;r15=0;return r15}do{if(r1<<24>>24==r7<<24>>24){r6=HEAPU8[r8];if((r6&1|0)==0){r17=r6>>>1}else{r17=HEAP32[r8+4>>2]}if((r17|0)==0){break}if((HEAP8[r2]&1)==0){r15=-1;return r15}r6=HEAP32[r11];if((r6-r9|0)>=160){r15=0;return r15}r16=HEAP32[r13];HEAP32[r11]=r6+4;HEAP32[r6>>2]=r16;HEAP32[r13]=0;r15=0;return r15}}while(0);r17=r12+32|0;r7=r12;while(1){if((r7|0)==(r17|0)){r18=r17;break}if((HEAP8[r7]|0)==r1<<24>>24){r18=r7;break}else{r7=r7+1|0}}r7=r18-r12|0;if((r7|0)>31){r15=-1;return r15}r12=HEAP8[r7+19032|0];do{if((r7|0)==22|(r7|0)==23){HEAP8[r3]=80}else if((r7|0)==25|(r7|0)==24){do{if((r5|0)!=(r4|0)){if((HEAP8[r5-1|0]&95|0)==(HEAP8[r3]&127|0)){break}else{r15=-1}return r15}}while(0);HEAP32[r10]=r5+1;HEAP8[r5]=r12;r15=0;return r15}else{r18=HEAP8[r3];if((r12&95|0)!=(r18<<24>>24|0)){break}HEAP8[r3]=r18|-128;if((HEAP8[r2]&1)==0){break}HEAP8[r2]=0;r18=HEAPU8[r8];if((r18&1|0)==0){r19=r18>>>1}else{r19=HEAP32[r8+4>>2]}if((r19|0)==0){break}r18=HEAP32[r11];if((r18-r9|0)>=160){break}r1=HEAP32[r13];HEAP32[r11]=r18+4;HEAP32[r18>>2]=r1}}while(0);r11=HEAP32[r10];if((r11-r14|0)<(((HEAP8[r3]|0)<0?39:29)|0)){HEAP32[r10]=r11+1;HEAP8[r11]=r12}if((r7|0)>21){r15=0;return r15}HEAP32[r13]=HEAP32[r13]+1;r15=0;return r15}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRf(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+312|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+40;r11=r8+48;r12=r8+56;r13=r8+112;r14=r8+120;r15=r8+280,r16=r15>>2;r17=r8+288;r18=r8+296;r19=r8+304;r20=r8+8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r12,r5,r20,r10,r11);r5=r8+72|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP8[r11];r11=HEAP32[r22],r23=r11>>2;L3570:while(1){do{if((r11|0)==0){r24=0,r25=r24>>2}else{if((HEAP32[r23+3]|0)!=(HEAP32[r23+4]|0)){r24=r11,r25=r24>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)|0)!=-1){r24=r11,r25=r24>>2;break}HEAP32[r22]=0;r24=0,r25=r24>>2}}while(0);r26=(r24|0)==0;r27=HEAP32[r3],r28=r27>>2;do{if((r27|0)==0){r2=2957}else{if((HEAP32[r28+3]|0)!=(HEAP32[r28+4]|0)){if(r26){r29=r27;r30=0;break}else{r31=r27,r32=r31>>2;r33=0;break L3570}}if((FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)|0)==-1){HEAP32[r3]=0;r2=2957;break}else{r34=(r27|0)==0;if(r26^r34){r29=r27;r30=r34;break}else{r31=r27,r32=r31>>2;r33=r34;break L3570}}}}while(0);if(r2==2957){r2=0;if(r26){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r27=(r24+12|0)>>2;r28=HEAP32[r27];r34=r24+16|0;if((r28|0)==(HEAP32[r34>>2]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)&255}else{r35=HEAP8[r28]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r35,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r28=HEAP32[r27];if((r28|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r25]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r27]=r28+1;r11=r24,r23=r11>>2;continue}}r11=r12;r23=HEAPU8[r11];if((r23&1|0)==0){r36=r23>>>1}else{r36=HEAP32[r12+4>>2]}do{if((r36|0)!=0){if((HEAP8[r18]&1)==0){break}r23=HEAP32[r16];if((r23-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r23+4;HEAP32[r23>>2]=r30}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r37=0}else{if(!HEAP8[19176]){HEAP32[2246]=_newlocale(1,2896,0);HEAP8[19176]=1}r13=_strtod(r5,r9);if((HEAP32[r9>>2]|0)==(r17|0)){r37=r13;break}else{HEAP32[r6>>2]=4;r37=0;break}}}while(0);HEAPF32[r7>>2]=r37;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);do{if(r26){r38=0}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){r38=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)!=-1){r38=r24;break}HEAP32[r22]=0;r38=0}}while(0);r22=(r38|0)==0;L3626:do{if(r33){r2=2997}else{do{if((HEAP32[r32+3]|0)==(HEAP32[r32+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)!=-1){break}HEAP32[r3]=0;r2=2997;break L3626}}while(0);if(!(r22^(r31|0)==0)){r2=2999}}}while(0);if(r2==2997){if(r22){r2=2999}}if(r2==2999){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r38;if((HEAP8[r11]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r12+8>>2]);STACKTOP=r8;return}function __ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r6=STACKTOP;STACKTOP=STACKTOP+32|0;r7=r6,r8=r7>>2;r9=r6+16,r10=r9>>2;r11=HEAP32[r2+28>>2];r2=(r11+4|0)>>2;tempValue=HEAP32[r2],HEAP32[r2]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r10]=18576;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r9,252)}r9=HEAP32[4645]-1|0;r10=r11+12|0;r12=r11+8|0;r13=HEAP32[r12>>2];do{if(HEAP32[r10>>2]-r13>>2>>>0>r9>>>0){r14=HEAP32[r13+(r9<<2)>>2];if((r14|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+32>>2]](r14,19032,19064,r3);if((HEAP32[4548]|0)!=-1){HEAP32[r8]=18192;HEAP32[r8+1]=24;HEAP32[r8+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18192,r7,252)}r14=HEAP32[4549]-1|0;r15=HEAP32[r12>>2];do{if(HEAP32[r10>>2]-r15>>2>>>0>r14>>>0){r16=HEAP32[r15+(r14<<2)>>2];if((r16|0)==0){break}r17=r16;r18=r16;HEAP8[r4]=FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+12>>2]](r17);HEAP8[r5]=FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+16>>2]](r17);FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r1,r17);if(((tempValue=HEAP32[r2],HEAP32[r2]=tempValue+ -1,tempValue)|0)!=0){STACKTOP=r6;return}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11);STACKTOP=r6;return}}while(0);r14=___cxa_allocate_exception(4);HEAP32[r14>>2]=10008;___cxa_throw(r14,16120,514)}}while(0);r6=___cxa_allocate_exception(4);HEAP32[r6>>2]=10008;___cxa_throw(r6,16120,514)}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRd(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+312|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+40;r11=r8+48;r12=r8+56;r13=r8+112;r14=r8+120;r15=r8+280,r16=r15>>2;r17=r8+288;r18=r8+296;r19=r8+304;r20=r8+8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r12,r5,r20,r10,r11);r5=r8+72|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP8[r11];r11=HEAP32[r22],r23=r11>>2;L3668:while(1){do{if((r11|0)==0){r24=0,r25=r24>>2}else{if((HEAP32[r23+3]|0)!=(HEAP32[r23+4]|0)){r24=r11,r25=r24>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)|0)!=-1){r24=r11,r25=r24>>2;break}HEAP32[r22]=0;r24=0,r25=r24>>2}}while(0);r26=(r24|0)==0;r27=HEAP32[r3],r28=r27>>2;do{if((r27|0)==0){r2=3041}else{if((HEAP32[r28+3]|0)!=(HEAP32[r28+4]|0)){if(r26){r29=r27;r30=0;break}else{r31=r27,r32=r31>>2;r33=0;break L3668}}if((FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)|0)==-1){HEAP32[r3]=0;r2=3041;break}else{r34=(r27|0)==0;if(r26^r34){r29=r27;r30=r34;break}else{r31=r27,r32=r31>>2;r33=r34;break L3668}}}}while(0);if(r2==3041){r2=0;if(r26){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r27=(r24+12|0)>>2;r28=HEAP32[r27];r34=r24+16|0;if((r28|0)==(HEAP32[r34>>2]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)&255}else{r35=HEAP8[r28]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r35,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r28=HEAP32[r27];if((r28|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r25]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r27]=r28+1;r11=r24,r23=r11>>2;continue}}r11=r12;r23=HEAPU8[r11];if((r23&1|0)==0){r36=r23>>>1}else{r36=HEAP32[r12+4>>2]}do{if((r36|0)!=0){if((HEAP8[r18]&1)==0){break}r23=HEAP32[r16];if((r23-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r23+4;HEAP32[r23>>2]=r30}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r37=0}else{if(!HEAP8[19176]){HEAP32[2246]=_newlocale(1,2896,0);HEAP8[19176]=1}r13=_strtod(r5,r9);if((HEAP32[r9>>2]|0)==(r17|0)){r37=r13;break}HEAP32[r6>>2]=4;r37=0}}while(0);HEAPF64[r7>>3]=r37;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);do{if(r26){r38=0}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){r38=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)!=-1){r38=r24;break}HEAP32[r22]=0;r38=0}}while(0);r22=(r38|0)==0;L3722:do{if(r33){r2=3080}else{do{if((HEAP32[r32+3]|0)==(HEAP32[r32+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)!=-1){break}HEAP32[r3]=0;r2=3080;break L3722}}while(0);if(!(r22^(r31|0)==0)){r2=3082}}}while(0);if(r2==3080){if(r22){r2=3082}}if(r2==3082){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r38;if((HEAP8[r11]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r12+8>>2]);STACKTOP=r8;return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+312|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+40;r11=r8+48;r12=r8+56;r13=r8+112;r14=r8+120;r15=r8+280,r16=r15>>2;r17=r8+288;r18=r8+296;r19=r8+304;r20=r8+8|0;__ZNSt3__19__num_getIcE19__stage2_float_prepERNS_8ios_baseEPcRcS5_(r12,r5,r20,r10,r11);r5=r8+72|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP8[r10];r10=HEAP8[r11];r11=HEAP32[r22],r23=r11>>2;L3739:while(1){do{if((r11|0)==0){r24=0,r25=r24>>2}else{if((HEAP32[r23+3]|0)!=(HEAP32[r23+4]|0)){r24=r11,r25=r24>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)|0)!=-1){r24=r11,r25=r24>>2;break}HEAP32[r22]=0;r24=0,r25=r24>>2}}while(0);r26=(r24|0)==0;r27=HEAP32[r3],r28=r27>>2;do{if((r27|0)==0){r2=3100}else{if((HEAP32[r28+3]|0)!=(HEAP32[r28+4]|0)){if(r26){r29=r27;r30=0;break}else{r31=r27,r32=r31>>2;r33=0;break L3739}}if((FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)|0)==-1){HEAP32[r3]=0;r2=3100;break}else{r34=(r27|0)==0;if(r26^r34){r29=r27;r30=r34;break}else{r31=r27,r32=r31>>2;r33=r34;break L3739}}}}while(0);if(r2==3100){r2=0;if(r26){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r27=(r24+12|0)>>2;r28=HEAP32[r27];r34=r24+16|0;if((r28|0)==(HEAP32[r34>>2]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)&255}else{r35=HEAP8[r28]}if((__ZNSt3__19__num_getIcE19__stage2_float_loopEcRbRcPcRS4_ccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjS4_(r35,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r28=HEAP32[r27];if((r28|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r25]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r27]=r28+1;r11=r24,r23=r11>>2;continue}}r11=r12;r23=HEAPU8[r11];if((r23&1|0)==0){r36=r23>>>1}else{r36=HEAP32[r12+4>>2]}do{if((r36|0)!=0){if((HEAP8[r18]&1)==0){break}r23=HEAP32[r16];if((r23-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r23+4;HEAP32[r23>>2]=r30}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r37=0}else{if(!HEAP8[19176]){HEAP32[2246]=_newlocale(1,2896,0);HEAP8[19176]=1}r13=_strtod(r5,r9);if((HEAP32[r9>>2]|0)==(r17|0)){r37=r13;break}HEAP32[r6>>2]=4;r37=0}}while(0);HEAPF64[r7>>3]=r37;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);do{if(r26){r38=0}else{if((HEAP32[r25+3]|0)!=(HEAP32[r25+4]|0)){r38=r24;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)|0)!=-1){r38=r24;break}HEAP32[r22]=0;r38=0}}while(0);r22=(r38|0)==0;L3793:do{if(r33){r2=3139}else{do{if((HEAP32[r32+3]|0)==(HEAP32[r32+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)!=-1){break}HEAP32[r3]=0;r2=3139;break L3793}}while(0);if(!(r22^(r31|0)==0)){r2=3141}}}while(0);if(r2==3139){if(r22){r2=3141}}if(r2==3141){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r38;if((HEAP8[r11]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r12+8>>2]);STACKTOP=r8;return}function __ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){return}function __ZNSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__17num_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+48;r13=r12,r14=r13>>2;r15=STACKTOP;STACKTOP=STACKTOP+40|0;r16=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r19=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=HEAP32[r5+28>>2],r5=r14>>2;r20=(r14+4|0)>>2;tempValue=HEAP32[r20],HEAP32[r20]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r10]=18576;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r9,252)}r9=HEAP32[4645]-1|0;r10=HEAP32[r5+2];do{if(HEAP32[r5+3]-r10>>2>>>0>r9>>>0){r21=HEAP32[r10+(r9<<2)>>2];if((r21|0)==0){break}r22=r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r21>>2]+32>>2]](r21,19032,19058,r22);if(((tempValue=HEAP32[r20],HEAP32[r20]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+8>>2]](r14)}r21=r15|0;_memset(r21,0,40);HEAP32[r16>>2]=r21;r23=r17|0;HEAP32[r18>>2]=r23;HEAP32[r19>>2]=0;r24=(r3|0)>>2;r25=(r4|0)>>2;r26=HEAP32[r24],r27=r26>>2;L3822:while(1){do{if((r26|0)==0){r28=0,r29=r28>>2}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){r28=r26,r29=r28>>2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)|0)!=-1){r28=r26,r29=r28>>2;break}HEAP32[r24]=0;r28=0,r29=r28>>2}}while(0);r30=(r28|0)==0;r31=HEAP32[r25],r32=r31>>2;do{if((r31|0)==0){r2=3170}else{if((HEAP32[r32+3]|0)!=(HEAP32[r32+4]|0)){if(r30){r33=r31;r34=0;break}else{r35=r31,r36=r35>>2;r37=0;break L3822}}if((FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)|0)==-1){HEAP32[r25]=0;r2=3170;break}else{r38=(r31|0)==0;if(r30^r38){r33=r31;r34=r38;break}else{r35=r31,r36=r35>>2;r37=r38;break L3822}}}}while(0);if(r2==3170){r2=0;if(r30){r35=0,r36=r35>>2;r37=1;break}else{r33=0;r34=1}}r31=(r28+12|0)>>2;r32=HEAP32[r31];r38=r28+16|0;if((r32|0)==(HEAP32[r38>>2]|0)){r39=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)&255}else{r39=HEAP8[r32]}if((__ZNSt3__19__num_getIcE17__stage2_int_loopEciPcRS2_RjcRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_S2_(r39,16,r21,r16,r19,0,r12,r23,r18,r22)|0)!=0){r35=r33,r36=r35>>2;r37=r34;break}r32=HEAP32[r31];if((r32|0)==(HEAP32[r38>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r26=r28,r27=r26>>2;continue}else{HEAP32[r31]=r32+1;r26=r28,r27=r26>>2;continue}}HEAP8[r15+39|0]=0;if(HEAP8[19176]){r40=HEAP32[2246]}else{r26=_newlocale(1,2896,0);HEAP32[2246]=r26;HEAP8[19176]=1;r40=r26}if((__ZNSt3__110__sscanf_lEPKcPvS1_z(r21,r40,2656,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r7,tempInt))|0)!=1){HEAP32[r6>>2]=4}do{if(r30){r41=0}else{if((HEAP32[r29+3]|0)!=(HEAP32[r29+4]|0)){r41=r28;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)|0)!=-1){r41=r28;break}HEAP32[r24]=0;r41=0}}while(0);r24=(r41|0)==0;L3867:do{if(r37){r2=3202}else{do{if((HEAP32[r36+3]|0)==(HEAP32[r36+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r36]+36>>2]](r35)|0)!=-1){break}HEAP32[r25]=0;r2=3202;break L3867}}while(0);if(!(r24^(r35|0)==0)){r2=3204}}}while(0);if(r2==3202){if(r24){r2=3204}}if(r2==3204){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r41;if((HEAP8[r13]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r12+8>>2]);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNSt3__110__sscanf_lEPKcPvS1_z(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r6;HEAP32[r7>>2]=r4;HEAP32[r7+4>>2]=0;r7=_uselocale(r2);r2=_vsscanf(r1,r3,r6|0);if((r7|0)==0){STACKTOP=r5;return r2}_uselocale(r7);STACKTOP=r5;return r2}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r8=STACKTOP;STACKTOP=STACKTOP+96|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16,r12=r11>>2;r13=r8+32;r14=r8+40;r15=r8+48;r16=r8+56;r17=r8+64;r18=r8+88;if((HEAP32[r5+4>>2]&1|0)==0){HEAP32[r13>>2]=-1;r19=HEAP32[HEAP32[r2>>2]+16>>2];r20=r3|0;HEAP32[r15>>2]=HEAP32[r20>>2];HEAP32[r16>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r19](r14,r2,r15,r16,r5,r6,r13);r16=HEAP32[r14>>2];HEAP32[r20>>2]=r16;r20=HEAP32[r13>>2];if((r20|0)==1){HEAP8[r7]=1}else if((r20|0)==0){HEAP8[r7]=0}else{HEAP8[r7]=1;HEAP32[r6>>2]=4}HEAP32[r1>>2]=r16;STACKTOP=r8;return}r16=r5+28|0;r5=HEAP32[r16>>2],r20=r5>>2;r13=(r5+4|0)>>2;tempValue=HEAP32[r13],HEAP32[r13]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r12]=18568;HEAP32[r12+1]=24;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r11,252)}r11=HEAP32[4643]-1|0;r12=HEAP32[r20+2];do{if(HEAP32[r20+3]-r12>>2>>>0>r11>>>0){r14=HEAP32[r12+(r11<<2)>>2];if((r14|0)==0){break}r15=r14;if(((tempValue=HEAP32[r13],HEAP32[r13]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r20]+8>>2]](r5)}r14=HEAP32[r16>>2],r2=r14>>2;r19=(r14+4|0)>>2;tempValue=HEAP32[r19],HEAP32[r19]=tempValue+1,tempValue;if((HEAP32[4546]|0)!=-1){HEAP32[r10]=18184;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18184,r9,252)}r21=HEAP32[4547]-1|0;r22=HEAP32[r2+2];do{if(HEAP32[r2+3]-r22>>2>>>0>r21>>>0){r23=HEAP32[r22+(r21<<2)>>2];if((r23|0)==0){break}r24=r23;if(((tempValue=HEAP32[r19],HEAP32[r19]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r2]+8>>2]](r14)}r25=r17|0;r26=r23;FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+24>>2]](r25,r24);FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+28>>2]](r17+12|0,r24);HEAP32[r18>>2]=HEAP32[r4>>2];HEAP8[r7]=(__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r18,r25,r17+24|0,r15,r6,1)|0)==(r25|0)&1;HEAP32[r1>>2]=HEAP32[r3>>2];if((HEAP8[r17+12|0]&1)!=0){__ZdlPv(HEAP32[r17+20>>2])}if((HEAP8[r17]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r17+8>>2]);STACKTOP=r8;return}}while(0);r15=___cxa_allocate_exception(4);HEAP32[r15>>2]=10008;___cxa_throw(r15,16120,514)}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRl(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==8){r19=16}else if((r18|0)==0){r19=0}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L6:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=18}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=18;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L6}}}}while(0);if(r2==18){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r35=r20>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r30}}while(0);HEAP32[r7>>2]=__ZNSt3__125__num_get_signed_integralIlEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=51}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=51;break}else{if(r9^(r31|0)==0){break}else{r2=53;break}}}}while(0);if(r2==51){if(r9){r2=53}}if(r2==53){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r36;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r8=0;r9=STACKTOP;STACKTOP=STACKTOP+104|0;r10=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r10>>2];r10=(r4-r3|0)/12&-1;r11=r9|0;do{if(r10>>>0>100){r12=_malloc(r10);if((r12|0)!=0){r13=r12;r14=r12;break}r12=___cxa_allocate_exception(4);HEAP32[r12>>2]=9976;___cxa_throw(r12,16104,66)}else{r13=r11;r14=0}}while(0);r11=(r3|0)==(r4|0);if(r11){r15=r10;r16=0}else{r12=r10;r10=0;r17=r13;r18=r3;while(1){r19=HEAPU8[r18];if((r19&1|0)==0){r20=r19>>>1}else{r20=HEAP32[r18+4>>2]}if((r20|0)==0){HEAP8[r17]=2;r21=r10+1|0;r22=r12-1|0}else{HEAP8[r17]=1;r21=r10;r22=r12}r19=r18+12|0;if((r19|0)==(r4|0)){r15=r22;r16=r21;break}else{r12=r22;r10=r21;r17=r17+1|0;r18=r19}}}r18=(r1|0)>>2;r1=(r2|0)>>2;r2=r5;r17=0;r21=r16;r16=r15;while(1){r15=HEAP32[r18],r10=r15>>2;do{if((r15|0)==0){r23=0}else{r22=HEAP32[r10+3];if((r22|0)==(HEAP32[r10+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r15)}else{r24=HEAP32[r22>>2]}if((r24|0)==-1){HEAP32[r18]=0;r23=0;break}else{r23=HEAP32[r18];break}}}while(0);r15=(r23|0)==0;r10=HEAP32[r1],r22=r10>>2;if((r10|0)==0){r25=r23,r26=r25>>2;r27=0,r28=r27>>2}else{r12=HEAP32[r22+3];if((r12|0)==(HEAP32[r22+4]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r10)}else{r29=HEAP32[r12>>2]}if((r29|0)==-1){HEAP32[r1]=0;r30=0}else{r30=r10}r25=HEAP32[r18],r26=r25>>2;r27=r30,r28=r27>>2}r31=(r27|0)==0;if(!((r15^r31)&(r16|0)!=0)){break}r15=HEAP32[r26+3];if((r15|0)==(HEAP32[r26+4]|0)){r32=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)}else{r32=HEAP32[r15>>2]}if(r7){r33=r32}else{r33=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+28>>2]](r5,r32)}do{if(r11){r34=r21;r35=r16}else{r15=r17+1|0;r10=r16;r12=r21;r22=r13;r20=0;r19=r3;while(1){do{if((HEAP8[r22]|0)==1){r36=r19;if((HEAP8[r36]&1)==0){r37=r19+4|0}else{r37=HEAP32[r19+8>>2]}r38=HEAP32[r37+(r17<<2)>>2];if(r7){r39=r38}else{r39=FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+28>>2]](r5,r38)}if((r33|0)!=(r39|0)){HEAP8[r22]=0;r40=r20;r41=r12;r42=r10-1|0;break}r38=HEAPU8[r36];if((r38&1|0)==0){r43=r38>>>1}else{r43=HEAP32[r19+4>>2]}if((r43|0)!=(r15|0)){r40=1;r41=r12;r42=r10;break}HEAP8[r22]=2;r40=1;r41=r12+1|0;r42=r10-1|0}else{r40=r20;r41=r12;r42=r10}}while(0);r38=r19+12|0;if((r38|0)==(r4|0)){break}r10=r42;r12=r41;r22=r22+1|0;r20=r40;r19=r38}if(!r40){r34=r41;r35=r42;break}r19=HEAP32[r18];r20=r19+12|0;r22=HEAP32[r20>>2];if((r22|0)==(HEAP32[r19+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+40>>2]](r19)}else{HEAP32[r20>>2]=r22+4}if((r41+r42|0)>>>0<2|r11){r34=r41;r35=r42;break}r22=r17+1|0;r20=r41;r19=r13;r12=r3;while(1){do{if((HEAP8[r19]|0)==2){r10=HEAPU8[r12];if((r10&1|0)==0){r44=r10>>>1}else{r44=HEAP32[r12+4>>2]}if((r44|0)==(r22|0)){r45=r20;break}HEAP8[r19]=0;r45=r20-1|0}else{r45=r20}}while(0);r10=r12+12|0;if((r10|0)==(r4|0)){r34=r45;r35=r42;break}else{r20=r45;r19=r19+1|0;r12=r10}}}}while(0);r17=r17+1|0;r21=r34;r16=r35}do{if((r25|0)==0){r46=1}else{r35=HEAP32[r26+3];if((r35|0)==(HEAP32[r26+4]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)}else{r47=HEAP32[r35>>2]}if((r47|0)==-1){HEAP32[r18]=0;r46=1;break}else{r46=(HEAP32[r18]|0)==0;break}}}while(0);do{if(r31){r8=142}else{r18=HEAP32[r28+3];if((r18|0)==(HEAP32[r28+4]|0)){r48=FUNCTION_TABLE[HEAP32[HEAP32[r28]+36>>2]](r27)}else{r48=HEAP32[r18>>2]}if((r48|0)==-1){HEAP32[r1]=0;r8=142;break}else{if(r46^(r27|0)==0){break}else{r8=144;break}}}}while(0);if(r8==142){if(r46){r8=144}}if(r8==144){HEAP32[r6>>2]=HEAP32[r6>>2]|2}L186:do{if(r11){r8=149}else{r46=r3;r27=r13;while(1){if((HEAP8[r27]|0)==2){r49=r46;break L186}r1=r46+12|0;if((r1|0)==(r4|0)){r8=149;break L186}r46=r1;r27=r27+1|0}}}while(0);if(r8==149){HEAP32[r6>>2]=HEAP32[r6>>2]|4;r49=r4}if((r14|0)==0){STACKTOP=r9;return r49}_free(r14);STACKTOP=r9;return r49}function __ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16;r11=r5>>2;r5=r4>>2;r4=HEAP32[r5];r12=(r4|0)==(r3|0);do{if(r12){r13=(HEAP32[r10+96>>2]|0)==(r1|0);if(!r13){if((HEAP32[r10+100>>2]|0)!=(r1|0)){break}}HEAP32[r5]=r3+1;HEAP8[r3]=r13?43:45;HEAP32[r11]=0;r14=0;return r14}}while(0);r13=HEAPU8[r7];if((r13&1|0)==0){r15=r13>>>1}else{r15=HEAP32[r7+4>>2]}if((r15|0)!=0&(r1|0)==(r6|0)){r6=HEAP32[r9>>2];if((r6-r8|0)>=160){r14=0;return r14}r8=HEAP32[r11];HEAP32[r9>>2]=r6+4;HEAP32[r6>>2]=r8;HEAP32[r11]=0;r14=0;return r14}r8=r10+104|0;r6=r10;while(1){if((r6|0)==(r8|0)){r16=r8;break}if((HEAP32[r6>>2]|0)==(r1|0)){r16=r6;break}else{r6=r6+4|0}}r6=r16-r10|0;r10=r6>>2;if((r6|0)>92){r14=-1;return r14}do{if((r2|0)==8|(r2|0)==10){if((r10|0)<(r2|0)){break}else{r14=-1}return r14}else if((r2|0)==16){if((r6|0)<88){break}if(r12){r14=-1;return r14}if((r4-r3|0)>=3){r14=-1;return r14}if((HEAP8[r4-1|0]|0)!=48){r14=-1;return r14}HEAP32[r11]=0;r16=HEAP8[r10+19032|0];r1=HEAP32[r5];HEAP32[r5]=r1+1;HEAP8[r1]=r16;r14=0;return r14}}while(0);if((r4-r3|0)<39){r3=HEAP8[r10+19032|0];HEAP32[r5]=r4+1;HEAP8[r4]=r3}HEAP32[r11]=HEAP32[r11]+1;r14=0;return r14}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==8){r19=16}else if((r18|0)==0){r19=0}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L250:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=208}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=208;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L250}}}}while(0);if(r2==208){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r35=r20>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r30}}while(0);HEAP32[r7>>2]=__ZNSt3__125__num_get_signed_integralIxEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=241}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=241;break}else{if(r9^(r31|0)==0){break}else{r2=243;break}}}}while(0);if(r2==241){if(r9){r2=243}}if(r2==243){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r36;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+32|0;r6=r5,r7=r6>>2;r8=r5+16,r9=r8>>2;r10=HEAP32[r2+28>>2];r2=(r10+4|0)>>2;tempValue=HEAP32[r2],HEAP32[r2]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r9]=18568;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r8,252)}r8=HEAP32[4643]-1|0;r9=r10+12|0;r11=r10+8|0;r12=HEAP32[r11>>2];do{if(HEAP32[r9>>2]-r12>>2>>>0>r8>>>0){r13=HEAP32[r12+(r8<<2)>>2];if((r13|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+48>>2]](r13,19032,19058,r3);if((HEAP32[4546]|0)!=-1){HEAP32[r7]=18184;HEAP32[r7+1]=24;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18184,r6,252)}r13=HEAP32[4547]-1|0;r14=HEAP32[r11>>2];do{if(HEAP32[r9>>2]-r14>>2>>>0>r13>>>0){r15=HEAP32[r14+(r13<<2)>>2];if((r15|0)==0){break}r16=r15;HEAP32[r4>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+16>>2]](r16);FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r1,r16);if(((tempValue=HEAP32[r2],HEAP32[r2]=tempValue+ -1,tempValue)|0)!=0){STACKTOP=r5;return}FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+8>>2]](r10);STACKTOP=r5;return}}while(0);r13=___cxa_allocate_exception(4);HEAP32[r13>>2]=10008;___cxa_throw(r13,16120,514)}}while(0);r5=___cxa_allocate_exception(4);HEAP32[r5>>2]=10008;___cxa_throw(r5,16120,514)}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRt(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==0){r19=0}else if((r18|0)==8){r19=16}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L346:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=289}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=289;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L346}}}}while(0);if(r2==289){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r35=r20>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r30}}while(0);HEAP16[r7>>1]=__ZNSt3__127__num_get_unsigned_integralItEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=322}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=322;break}else{if(r9^(r31|0)==0){break}else{r2=324;break}}}}while(0);if(r2==322){if(r9){r2=324}}if(r2==324){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r36;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjS8_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==8){r19=16}else if((r18|0)==0){r19=0}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L418:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=347}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=347;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L418}}}}while(0);if(r2==347){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r35=r20>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r30}}while(0);HEAP32[r7>>2]=__ZNSt3__127__num_get_unsigned_integralIjEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=380}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=380;break}else{if(r9^(r31|0)==0){break}else{r2=382;break}}}}while(0);if(r2==380){if(r9){r2=382}}if(r2==382){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r36;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==8){r19=16}else if((r18|0)==0){r19=0}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L490:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=405}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=405;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L490}}}}while(0);if(r2==405){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r35=r20>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r30}}while(0);HEAP32[r7>>2]=__ZNSt3__127__num_get_unsigned_integralImEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=438}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=438;break}else{if(r9^(r31|0)==0){break}else{r2=440;break}}}}while(0);if(r2==438){if(r9){r2=440}}if(r2==440){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r36;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+352|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+104;r11=r8+112;r12=r8+128;r13=r8+168;r14=r8+176;r15=r8+336,r16=r15>>2;r17=r8+344;r18=HEAP32[r5+4>>2]&74;if((r18|0)==8){r19=16}else if((r18|0)==0){r19=0}else if((r18|0)==64){r19=8}else{r19=10}r18=r9|0;__ZNSt3__19__num_getIwE17__stage2_int_prepERNS_8ios_baseEPwRw(r11,r5,r18,r10);r5=r12|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r12=r14|0;HEAP32[r16]=r12;HEAP32[r17>>2]=0;r9=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r9],r20=r10>>2;L562:while(1){do{if((r10|0)==0){r21=0,r22=r21>>2}else{r23=HEAP32[r20+3];if((r23|0)==(HEAP32[r20+4]|0)){r24=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r10)}else{r24=HEAP32[r23>>2]}if((r24|0)!=-1){r21=r10,r22=r21>>2;break}HEAP32[r9]=0;r21=0,r22=r21>>2}}while(0);r25=(r21|0)==0;r23=HEAP32[r3],r26=r23>>2;do{if((r23|0)==0){r2=463}else{r27=HEAP32[r26+3];if((r27|0)==(HEAP32[r26+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r23)}else{r28=HEAP32[r27>>2]}if((r28|0)==-1){HEAP32[r3]=0;r2=463;break}else{r27=(r23|0)==0;if(r25^r27){r29=r23;r30=r27;break}else{r31=r23,r32=r31>>2;r33=r27;break L562}}}}while(0);if(r2==463){r2=0;if(r25){r31=0,r32=r31>>2;r33=1;break}else{r29=0;r30=1}}r23=(r21+12|0)>>2;r26=HEAP32[r23];r27=r21+16|0;if((r26|0)==(HEAP32[r27>>2]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r34=HEAP32[r26>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r34,r19,r5,r13,r17,r4,r11,r12,r15,r18)|0)!=0){r31=r29,r32=r31>>2;r33=r30;break}r26=HEAP32[r23];if((r26|0)==(HEAP32[r27>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r22]+40>>2]](r21);r10=r21,r20=r10>>2;continue}else{HEAP32[r23]=r26+4;r10=r21,r20=r10>>2;continue}}r10=r11;r20=HEAPU8[r10];if((r20&1|0)==0){r35=r20>>>1}else{r35=HEAP32[r11+4>>2]}do{if((r35|0)!=0){r20=HEAP32[r16];if((r20-r14|0)>=160){break}r30=HEAP32[r17>>2];HEAP32[r16]=r20+4;HEAP32[r20>>2]=r30}}while(0);HEAP32[r7>>2]=__ZNSt3__127__num_get_unsigned_integralIyEET_PKcS3_Rji(r5,HEAP32[r13>>2],r6,r19);HEAP32[r7+4>>2]=tempRet0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r11,r12,HEAP32[r16],r6);do{if(r25){r36=0}else{r16=HEAP32[r22+3];if((r16|0)==(HEAP32[r22+4]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r22]+36>>2]](r21)}else{r37=HEAP32[r16>>2]}if((r37|0)!=-1){r36=r21;break}HEAP32[r9]=0;r36=0}}while(0);r9=(r36|0)==0;do{if(r33){r2=496}else{r21=HEAP32[r32+3];if((r21|0)==(HEAP32[r32+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r31)}else{r38=HEAP32[r21>>2]}if((r38|0)==-1){HEAP32[r3]=0;r2=496;break}else{if(r9^(r31|0)==0){break}else{r2=498;break}}}}while(0);if(r2==496){if(r9){r2=498}}if(r2==498){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r36;if((HEAP8[r10]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r11+8>>2]);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12){var r13,r14,r15,r16,r17,r18,r19;r13=r11>>2;r11=r10>>2;r10=r5>>2;r5=HEAP32[r10];r14=r4;if((r5-r14|0)>38){r15=-1;return r15}if((r1|0)==(r6|0)){if((HEAP8[r2]&1)==0){r15=-1;return r15}HEAP8[r2]=0;r6=HEAP32[r10];HEAP32[r10]=r6+1;HEAP8[r6]=46;r6=HEAPU8[r8];if((r6&1|0)==0){r16=r6>>>1}else{r16=HEAP32[r8+4>>2]}if((r16|0)==0){r15=0;return r15}r16=HEAP32[r11];if((r16-r9|0)>=160){r15=0;return r15}r6=HEAP32[r13];HEAP32[r11]=r16+4;HEAP32[r16>>2]=r6;r15=0;return r15}do{if((r1|0)==(r7|0)){r6=HEAPU8[r8];if((r6&1|0)==0){r17=r6>>>1}else{r17=HEAP32[r8+4>>2]}if((r17|0)==0){break}if((HEAP8[r2]&1)==0){r15=-1;return r15}r6=HEAP32[r11];if((r6-r9|0)>=160){r15=0;return r15}r16=HEAP32[r13];HEAP32[r11]=r6+4;HEAP32[r6>>2]=r16;HEAP32[r13]=0;r15=0;return r15}}while(0);r17=r12+128|0;r7=r12;while(1){if((r7|0)==(r17|0)){r18=r17;break}if((HEAP32[r7>>2]|0)==(r1|0)){r18=r7;break}else{r7=r7+4|0}}r7=r18-r12|0;r12=r7>>2;if((r7|0)>124){r15=-1;return r15}r18=HEAP8[r12+19032|0];do{if((r12|0)==22|(r12|0)==23){HEAP8[r3]=80}else if((r12|0)==25|(r12|0)==24){do{if((r5|0)!=(r4|0)){if((HEAP8[r5-1|0]&95|0)==(HEAP8[r3]&127|0)){break}else{r15=-1}return r15}}while(0);HEAP32[r10]=r5+1;HEAP8[r5]=r18;r15=0;return r15}else{r1=HEAP8[r3];if((r18&95|0)!=(r1<<24>>24|0)){break}HEAP8[r3]=r1|-128;if((HEAP8[r2]&1)==0){break}HEAP8[r2]=0;r1=HEAPU8[r8];if((r1&1|0)==0){r19=r1>>>1}else{r19=HEAP32[r8+4>>2]}if((r19|0)==0){break}r1=HEAP32[r11];if((r1-r9|0)>=160){break}r17=HEAP32[r13];HEAP32[r11]=r1+4;HEAP32[r1>>2]=r17}}while(0);r11=HEAP32[r10];if((r11-r14|0)<(((HEAP8[r3]|0)<0?39:29)|0)){HEAP32[r10]=r11+1;HEAP8[r11]=r18}if((r7|0)>84){r15=0;return r15}HEAP32[r13]=HEAP32[r13]+1;r15=0;return r15}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRf(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+408|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+136;r11=r8+144;r12=r8+152;r13=r8+208;r14=r8+216;r15=r8+376,r16=r15>>2;r17=r8+384;r18=r8+392;r19=r8+400;r20=r8+8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r12,r5,r20,r10,r11);r5=r8+168|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r11>>2];r11=HEAP32[r22],r23=r11>>2;L697:while(1){do{if((r11|0)==0){r24=0,r25=r24>>2}else{r26=HEAP32[r23+3];if((r26|0)==(HEAP32[r23+4]|0)){r27=FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)}else{r27=HEAP32[r26>>2]}if((r27|0)!=-1){r24=r11,r25=r24>>2;break}HEAP32[r22]=0;r24=0,r25=r24>>2}}while(0);r28=(r24|0)==0;r26=HEAP32[r3],r29=r26>>2;do{if((r26|0)==0){r2=569}else{r30=HEAP32[r29+3];if((r30|0)==(HEAP32[r29+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r26)}else{r31=HEAP32[r30>>2]}if((r31|0)==-1){HEAP32[r3]=0;r2=569;break}else{r30=(r26|0)==0;if(r28^r30){r32=r26;r33=r30;break}else{r34=r26,r35=r34>>2;r36=r30;break L697}}}}while(0);if(r2==569){r2=0;if(r28){r34=0,r35=r34>>2;r36=1;break}else{r32=0;r33=1}}r26=(r24+12|0)>>2;r29=HEAP32[r26];r30=r24+16|0;if((r29|0)==(HEAP32[r30>>2]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r37=HEAP32[r29>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r37,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){r34=r32,r35=r34>>2;r36=r33;break}r29=HEAP32[r26];if((r29|0)==(HEAP32[r30>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r25]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r26]=r29+4;r11=r24,r23=r11>>2;continue}}r11=r12;r23=HEAPU8[r11];if((r23&1|0)==0){r38=r23>>>1}else{r38=HEAP32[r12+4>>2]}do{if((r38|0)!=0){if((HEAP8[r18]&1)==0){break}r23=HEAP32[r16];if((r23-r14|0)>=160){break}r33=HEAP32[r17>>2];HEAP32[r16]=r23+4;HEAP32[r23>>2]=r33}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r39=0}else{if(!HEAP8[19176]){HEAP32[2246]=_newlocale(1,2896,0);HEAP8[19176]=1}r13=_strtod(r5,r9);if((HEAP32[r9>>2]|0)==(r17|0)){r39=r13;break}else{HEAP32[r6>>2]=4;r39=0;break}}}while(0);HEAPF32[r7>>2]=r39;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);do{if(r28){r40=0}else{r16=HEAP32[r25+3];if((r16|0)==(HEAP32[r25+4]|0)){r41=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r41=HEAP32[r16>>2]}if((r41|0)!=-1){r40=r24;break}HEAP32[r22]=0;r40=0}}while(0);r22=(r40|0)==0;do{if(r36){r2=610}else{r24=HEAP32[r35+3];if((r24|0)==(HEAP32[r35+4]|0)){r42=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r34)}else{r42=HEAP32[r24>>2]}if((r42|0)==-1){HEAP32[r3]=0;r2=610;break}else{if(r22^(r34|0)==0){break}else{r2=612;break}}}}while(0);if(r2==610){if(r22){r2=612}}if(r2==612){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r40;if((HEAP8[r11]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r12+8>>2]);STACKTOP=r8;return}function __ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r6=STACKTOP;STACKTOP=STACKTOP+32|0;r7=r6,r8=r7>>2;r9=r6+16,r10=r9>>2;r11=HEAP32[r2+28>>2];r2=(r11+4|0)>>2;tempValue=HEAP32[r2],HEAP32[r2]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r10]=18568;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r9,252)}r9=HEAP32[4643]-1|0;r10=r11+12|0;r12=r11+8|0;r13=HEAP32[r12>>2];do{if(HEAP32[r10>>2]-r13>>2>>>0>r9>>>0){r14=HEAP32[r13+(r9<<2)>>2];if((r14|0)==0){break}FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+48>>2]](r14,19032,19064,r3);if((HEAP32[4546]|0)!=-1){HEAP32[r8]=18184;HEAP32[r8+1]=24;HEAP32[r8+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18184,r7,252)}r14=HEAP32[4547]-1|0;r15=HEAP32[r12>>2];do{if(HEAP32[r10>>2]-r15>>2>>>0>r14>>>0){r16=HEAP32[r15+(r14<<2)>>2];if((r16|0)==0){break}r17=r16;r18=r16;HEAP32[r4>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+12>>2]](r17);HEAP32[r5>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+16>>2]](r17);FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r1,r17);if(((tempValue=HEAP32[r2],HEAP32[r2]=tempValue+ -1,tempValue)|0)!=0){STACKTOP=r6;return}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11);STACKTOP=r6;return}}while(0);r14=___cxa_allocate_exception(4);HEAP32[r14>>2]=10008;___cxa_throw(r14,16120,514)}}while(0);r6=___cxa_allocate_exception(4);HEAP32[r6>>2]=10008;___cxa_throw(r6,16120,514)}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRd(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+408|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+136;r11=r8+144;r12=r8+152;r13=r8+208;r14=r8+216;r15=r8+376,r16=r15>>2;r17=r8+384;r18=r8+392;r19=r8+400;r20=r8+8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r12,r5,r20,r10,r11);r5=r8+168|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r11>>2];r11=HEAP32[r22],r23=r11>>2;L800:while(1){do{if((r11|0)==0){r24=0,r25=r24>>2}else{r26=HEAP32[r23+3];if((r26|0)==(HEAP32[r23+4]|0)){r27=FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)}else{r27=HEAP32[r26>>2]}if((r27|0)!=-1){r24=r11,r25=r24>>2;break}HEAP32[r22]=0;r24=0,r25=r24>>2}}while(0);r28=(r24|0)==0;r26=HEAP32[r3],r29=r26>>2;do{if((r26|0)==0){r2=655}else{r30=HEAP32[r29+3];if((r30|0)==(HEAP32[r29+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r26)}else{r31=HEAP32[r30>>2]}if((r31|0)==-1){HEAP32[r3]=0;r2=655;break}else{r30=(r26|0)==0;if(r28^r30){r32=r26;r33=r30;break}else{r34=r26,r35=r34>>2;r36=r30;break L800}}}}while(0);if(r2==655){r2=0;if(r28){r34=0,r35=r34>>2;r36=1;break}else{r32=0;r33=1}}r26=(r24+12|0)>>2;r29=HEAP32[r26];r30=r24+16|0;if((r29|0)==(HEAP32[r30>>2]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r37=HEAP32[r29>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r37,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){r34=r32,r35=r34>>2;r36=r33;break}r29=HEAP32[r26];if((r29|0)==(HEAP32[r30>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r25]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r26]=r29+4;r11=r24,r23=r11>>2;continue}}r11=r12;r23=HEAPU8[r11];if((r23&1|0)==0){r38=r23>>>1}else{r38=HEAP32[r12+4>>2]}do{if((r38|0)!=0){if((HEAP8[r18]&1)==0){break}r23=HEAP32[r16];if((r23-r14|0)>=160){break}r33=HEAP32[r17>>2];HEAP32[r16]=r23+4;HEAP32[r23>>2]=r33}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r39=0}else{if(!HEAP8[19176]){HEAP32[2246]=_newlocale(1,2896,0);HEAP8[19176]=1}r13=_strtod(r5,r9);if((HEAP32[r9>>2]|0)==(r17|0)){r39=r13;break}HEAP32[r6>>2]=4;r39=0}}while(0);HEAPF64[r7>>3]=r39;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);do{if(r28){r40=0}else{r16=HEAP32[r25+3];if((r16|0)==(HEAP32[r25+4]|0)){r41=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r41=HEAP32[r16>>2]}if((r41|0)!=-1){r40=r24;break}HEAP32[r22]=0;r40=0}}while(0);r22=(r40|0)==0;do{if(r36){r2=695}else{r24=HEAP32[r35+3];if((r24|0)==(HEAP32[r35+4]|0)){r42=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r34)}else{r42=HEAP32[r24>>2]}if((r42|0)==-1){HEAP32[r3]=0;r2=695;break}else{if(r22^(r34|0)==0){break}else{r2=697;break}}}}while(0);if(r2==695){if(r22){r2=697}}if(r2==697){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r40;if((HEAP8[r11]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r12+8>>2]);STACKTOP=r8;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+408|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+136;r11=r8+144;r12=r8+152;r13=r8+208;r14=r8+216;r15=r8+376,r16=r15>>2;r17=r8+384;r18=r8+392;r19=r8+400;r20=r8+8|0;__ZNSt3__19__num_getIwE19__stage2_float_prepERNS_8ios_baseEPwRwS5_(r12,r5,r20,r10,r11);r5=r8+168|0;_memset(r5,0,40);HEAP32[r13>>2]=r5;r21=r14|0;HEAP32[r16]=r21;HEAP32[r17>>2]=0;HEAP8[r18]=1;HEAP8[r19]=69;r22=(r3|0)>>2;r3=(r4|0)>>2;r4=HEAP32[r10>>2];r10=HEAP32[r11>>2];r11=HEAP32[r22],r23=r11>>2;L876:while(1){do{if((r11|0)==0){r24=0,r25=r24>>2}else{r26=HEAP32[r23+3];if((r26|0)==(HEAP32[r23+4]|0)){r27=FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r11)}else{r27=HEAP32[r26>>2]}if((r27|0)!=-1){r24=r11,r25=r24>>2;break}HEAP32[r22]=0;r24=0,r25=r24>>2}}while(0);r28=(r24|0)==0;r26=HEAP32[r3],r29=r26>>2;do{if((r26|0)==0){r2=716}else{r30=HEAP32[r29+3];if((r30|0)==(HEAP32[r29+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r26)}else{r31=HEAP32[r30>>2]}if((r31|0)==-1){HEAP32[r3]=0;r2=716;break}else{r30=(r26|0)==0;if(r28^r30){r32=r26;r33=r30;break}else{r34=r26,r35=r34>>2;r36=r30;break L876}}}}while(0);if(r2==716){r2=0;if(r28){r34=0,r35=r34>>2;r36=1;break}else{r32=0;r33=1}}r26=(r24+12|0)>>2;r29=HEAP32[r26];r30=r24+16|0;if((r29|0)==(HEAP32[r30>>2]|0)){r37=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r37=HEAP32[r29>>2]}if((__ZNSt3__19__num_getIwE19__stage2_float_loopEwRbRcPcRS4_wwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSE_RjPw(r37,r18,r19,r5,r13,r4,r10,r12,r21,r15,r17,r20)|0)!=0){r34=r32,r35=r34>>2;r36=r33;break}r29=HEAP32[r26];if((r29|0)==(HEAP32[r30>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r25]+40>>2]](r24);r11=r24,r23=r11>>2;continue}else{HEAP32[r26]=r29+4;r11=r24,r23=r11>>2;continue}}r11=r12;r23=HEAPU8[r11];if((r23&1|0)==0){r38=r23>>>1}else{r38=HEAP32[r12+4>>2]}do{if((r38|0)!=0){if((HEAP8[r18]&1)==0){break}r23=HEAP32[r16];if((r23-r14|0)>=160){break}r33=HEAP32[r17>>2];HEAP32[r16]=r23+4;HEAP32[r23>>2]=r33}}while(0);r17=HEAP32[r13>>2];do{if((r5|0)==(r17|0)){HEAP32[r6>>2]=4;r39=0}else{if(!HEAP8[19176]){HEAP32[2246]=_newlocale(1,2896,0);HEAP8[19176]=1}r13=_strtod(r5,r9);if((HEAP32[r9>>2]|0)==(r17|0)){r39=r13;break}HEAP32[r6>>2]=4;r39=0}}while(0);HEAPF64[r7>>3]=r39;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r12,r21,HEAP32[r16],r6);do{if(r28){r40=0}else{r16=HEAP32[r25+3];if((r16|0)==(HEAP32[r25+4]|0)){r41=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r41=HEAP32[r16>>2]}if((r41|0)!=-1){r40=r24;break}HEAP32[r22]=0;r40=0}}while(0);r22=(r40|0)==0;do{if(r36){r2=756}else{r24=HEAP32[r35+3];if((r24|0)==(HEAP32[r35+4]|0)){r42=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r34)}else{r42=HEAP32[r24>>2]}if((r42|0)==-1){HEAP32[r3]=0;r2=756;break}else{if(r22^(r34|0)==0){break}else{r2=758;break}}}}while(0);if(r2==756){if(r22){r2=758}}if(r2==758){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r40;if((HEAP8[r11]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r12+8>>2]);STACKTOP=r8;return}function __ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){return}function __ZNSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcl(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+80|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+24;r11=r7+48;r12=r7+56;r13=r7+64;r14=r7+72;r15=r8|0;HEAP8[r15]=HEAP8[9760];HEAP8[r15+1|0]=HEAP8[9761|0];HEAP8[r15+2|0]=HEAP8[9762|0];HEAP8[r15+3|0]=HEAP8[9763|0];HEAP8[r15+4|0]=HEAP8[9764|0];HEAP8[r15+5|0]=HEAP8[9765|0];r16=r8+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r16}else{HEAP8[r16]=43;r19=r8+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;r19=r20+1|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=100}}while(0);r19=r9|0;if(HEAP8[19176]){r21=HEAP32[2246]}else{r18=_newlocale(1,2896,0);HEAP32[2246]=r18;HEAP8[19176]=1;r21=r18}r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,r21,r15,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r9+r18|0;r15=HEAP32[r17>>2]&176;do{if((r15|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r22=r9+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=785;break}r17=HEAP8[r9+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=785;break}r22=r9+2|0}else if((r15|0)==32){r22=r6}else{r2=785}}while(0);if(r2==785){r22=r19}r2=r10|0;r10=r13|0;r15=HEAP32[r4+28>>2];HEAP32[r10>>2]=r15;r9=r15+4|0;tempValue=HEAP32[r9>>2],HEAP32[r9>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r19,r22,r6,r2,r11,r12,r13);r13=HEAP32[r10>>2];r10=r13+4|0;if(((tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+ -1,tempValue)|0)!=0){r23=r3|0;r24=HEAP32[r23>>2];r25=r14|0;HEAP32[r25>>2]=r24;r26=HEAP32[r11>>2];r27=HEAP32[r12>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,r26,r27,r4,r5);STACKTOP=r7;return}FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+8>>2]](r13|0);r23=r3|0;r24=HEAP32[r23>>2];r25=r14|0;HEAP32[r25>>2]=r24;r26=HEAP32[r11>>2];r27=HEAP32[r12>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,r26,r27,r4,r5);STACKTOP=r7;return}function __ZNKSt3__17num_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjRPv(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+136|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+120;r13=r12,r14=r13>>2;r15=STACKTOP;STACKTOP=STACKTOP+40|0;r16=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r17=STACKTOP;STACKTOP=STACKTOP+160|0;r18=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r19=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r14]=0;HEAP32[r14+1]=0;HEAP32[r14+2]=0;r14=HEAP32[r5+28>>2],r5=r14>>2;r20=(r14+4|0)>>2;tempValue=HEAP32[r20],HEAP32[r20]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r10]=18568;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r9,252)}r9=HEAP32[4643]-1|0;r10=HEAP32[r5+2];do{if(HEAP32[r5+3]-r10>>2>>>0>r9>>>0){r21=HEAP32[r10+(r9<<2)>>2];if((r21|0)==0){break}r22=r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r21>>2]+48>>2]](r21,19032,19058,r22);if(((tempValue=HEAP32[r20],HEAP32[r20]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+8>>2]](r14)}r21=r15|0;_memset(r21,0,40);HEAP32[r16>>2]=r21;r23=r17|0;HEAP32[r18>>2]=r23;HEAP32[r19>>2]=0;r24=(r3|0)>>2;r25=(r4|0)>>2;r26=HEAP32[r24],r27=r26>>2;L998:while(1){do{if((r26|0)==0){r28=0,r29=r28>>2}else{r30=HEAP32[r27+3];if((r30|0)==(HEAP32[r27+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)}else{r31=HEAP32[r30>>2]}if((r31|0)!=-1){r28=r26,r29=r28>>2;break}HEAP32[r24]=0;r28=0,r29=r28>>2}}while(0);r32=(r28|0)==0;r30=HEAP32[r25],r33=r30>>2;do{if((r30|0)==0){r2=817}else{r34=HEAP32[r33+3];if((r34|0)==(HEAP32[r33+4]|0)){r35=FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r30)}else{r35=HEAP32[r34>>2]}if((r35|0)==-1){HEAP32[r25]=0;r2=817;break}else{r34=(r30|0)==0;if(r32^r34){r36=r30;r37=r34;break}else{r38=r30,r39=r38>>2;r40=r34;break L998}}}}while(0);if(r2==817){r2=0;if(r32){r38=0,r39=r38>>2;r40=1;break}else{r36=0;r37=1}}r30=(r28+12|0)>>2;r33=HEAP32[r30];r34=r28+16|0;if((r33|0)==(HEAP32[r34>>2]|0)){r41=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r41=HEAP32[r33>>2]}if((__ZNSt3__19__num_getIwE17__stage2_int_loopEwiPcRS2_RjwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjRSD_Pw(r41,16,r21,r16,r19,0,r12,r23,r18,r22)|0)!=0){r38=r36,r39=r38>>2;r40=r37;break}r33=HEAP32[r30];if((r33|0)==(HEAP32[r34>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r29]+40>>2]](r28);r26=r28,r27=r26>>2;continue}else{HEAP32[r30]=r33+4;r26=r28,r27=r26>>2;continue}}HEAP8[r15+39|0]=0;if(HEAP8[19176]){r42=HEAP32[2246]}else{r26=_newlocale(1,2896,0);HEAP32[2246]=r26;HEAP8[19176]=1;r42=r26}if((__ZNSt3__110__sscanf_lEPKcPvS1_z(r21,r42,2656,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r7,tempInt))|0)!=1){HEAP32[r6>>2]=4}do{if(r32){r43=0}else{r26=HEAP32[r29+3];if((r26|0)==(HEAP32[r29+4]|0)){r44=FUNCTION_TABLE[HEAP32[HEAP32[r29]+36>>2]](r28)}else{r44=HEAP32[r26>>2]}if((r44|0)!=-1){r43=r28;break}HEAP32[r24]=0;r43=0}}while(0);r24=(r43|0)==0;do{if(r40){r2=850}else{r21=HEAP32[r39+3];if((r21|0)==(HEAP32[r39+4]|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r39]+36>>2]](r38)}else{r45=HEAP32[r21>>2]}if((r45|0)==-1){HEAP32[r25]=0;r2=850;break}else{if(r24^(r38|0)==0){break}else{r2=852;break}}}}while(0);if(r2==850){if(r24){r2=852}}if(r2==852){HEAP32[r6>>2]=HEAP32[r6>>2]|2}HEAP32[r1>>2]=r43;if((HEAP8[r13]&1)==0){STACKTOP=r8;return}__ZdlPv(HEAP32[r12+8>>2]);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcb(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r7=STACKTOP;STACKTOP=STACKTOP+40|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+16;r11=r7+24;if((HEAP32[r4+4>>2]&1|0)==0){r12=HEAP32[HEAP32[r2>>2]+24>>2];HEAP32[r10>>2]=HEAP32[r3>>2];FUNCTION_TABLE[r12](r1,r2,r10,r4,r5,r6&1);STACKTOP=r7;return}r5=HEAP32[r4+28>>2],r4=r5>>2;r10=(r5+4|0)>>2;tempValue=HEAP32[r10],HEAP32[r10]=tempValue+1,tempValue;if((HEAP32[4548]|0)!=-1){HEAP32[r9]=18192;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18192,r8,252)}r8=HEAP32[4549]-1|0;r9=HEAP32[r4+2];do{if(HEAP32[r4+3]-r9>>2>>>0>r8>>>0){r2=HEAP32[r9+(r8<<2)>>2];if((r2|0)==0){break}r12=r2;if(((tempValue=HEAP32[r10],HEAP32[r10]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r4]+8>>2]](r5)}r13=HEAP32[r2>>2];if(r6){FUNCTION_TABLE[HEAP32[r13+24>>2]](r11,r12)}else{FUNCTION_TABLE[HEAP32[r13+28>>2]](r11,r12)}r12=r11;r13=r11;r2=HEAP8[r13];if((r2&1)==0){r14=r12+1|0;r15=r14;r16=r14;r17=r11+8|0}else{r14=r11+8|0;r15=HEAP32[r14>>2];r16=r12+1|0;r17=r14}r14=(r3|0)>>2;r12=r11+4|0;r18=r15;r19=r2;while(1){r20=(r19&1)==0;if(r20){r21=r16}else{r21=HEAP32[r17>>2]}r2=r19&255;if((r18|0)==(r21+((r2&1|0)==0?r2>>>1:HEAP32[r12>>2])|0)){break}r2=HEAP8[r18];r22=HEAP32[r14];do{if((r22|0)!=0){r23=r22+24|0;r24=HEAP32[r23>>2];if((r24|0)!=(HEAP32[r22+28>>2]|0)){HEAP32[r23>>2]=r24+1;HEAP8[r24]=r2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+52>>2]](r22,r2&255)|0)!=-1){break}HEAP32[r14]=0}}while(0);r18=r18+1|0;r19=HEAP8[r13]}HEAP32[r1>>2]=HEAP32[r14];if(r20){STACKTOP=r7;return}__ZdlPv(HEAP32[r17>>2]);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);HEAP32[r7>>2]=10008;___cxa_throw(r7,16120,514)}function __ZNSt3__111__sprintf_lEPcPvPKcz(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r6;HEAP32[r7>>2]=r4;HEAP32[r7+4>>2]=0;r7=_uselocale(r2);r2=_vsprintf(r1,r3,r6|0);if((r7|0)==0){STACKTOP=r5;return r2}_uselocale(r7);STACKTOP=r5;return r2}function __ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r8=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r9>>2];r9=r1,r10=r9>>2;r11=(r2|0)>>2;r2=HEAP32[r11],r12=r2>>2;if((r2|0)==0){HEAP32[r8]=0;STACKTOP=r1;return}r13=r5;r5=r3;r14=r13-r5|0;r15=r6+12|0;r6=HEAP32[r15>>2];r16=(r6|0)>(r14|0)?r6-r14|0:0;r14=r4;r6=r14-r5|0;do{if((r6|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r2,r3,r6)|0)==(r6|0)){break}HEAP32[r11]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);do{if((r16|0)>0){if(r16>>>0<11){r6=r16<<1&255;r3=r9;HEAP8[r3]=r6;r17=r9+1|0;r18=r6;r19=r3}else{r3=r16+16&-16;r6=__Znwj(r3);HEAP32[r10+2]=r6;r5=r3|1;HEAP32[r10]=r5;HEAP32[r10+1]=r16;r17=r6;r18=r5&255;r19=r9}_memset(r17,r7,r16);HEAP8[r17+r16|0]=0;if((r18&1)==0){r20=r9+1|0}else{r20=HEAP32[r10+2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r2,r20,r16)|0)==(r16|0)){if((HEAP8[r19]&1)==0){break}__ZdlPv(HEAP32[r10+2]);break}HEAP32[r11]=0;HEAP32[r8]=0;if((HEAP8[r19]&1)==0){STACKTOP=r1;return}__ZdlPv(HEAP32[r10+2]);STACKTOP=r1;return}}while(0);r10=r13-r14|0;do{if((r10|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r2,r4,r10)|0)==(r10|0)){break}HEAP32[r11]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);HEAP32[r15>>2]=0;HEAP32[r8]=r2;STACKTOP=r1;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+112|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+32;r12=r8+80;r13=r8+88;r14=r8+96;r15=r8+104;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r16=r9;r9=r16+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r9}else{HEAP8[r9]=43;r19=r16+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;HEAP8[r20+1|0]=108;r19=r20+2|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=100}}while(0);r19=r10|0;if(HEAP8[19176]){r21=HEAP32[2246]}else{r18=_newlocale(1,2896,0);HEAP32[2246]=r18;HEAP8[19176]=1;r21=r18}r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,r21,r16,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));r7=r10+r18|0;r6=HEAP32[r17>>2]&176;do{if((r6|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r22=r10+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=956;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=956;break}r22=r10+2|0}else if((r6|0)==32){r22=r7}else{r2=956}}while(0);if(r2==956){r22=r19}r2=r11|0;r11=r14|0;r6=HEAP32[r4+28>>2];HEAP32[r11>>2]=r6;r10=r6+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r19,r22,r7,r2,r12,r13,r14);r14=HEAP32[r11>>2];r11=r14+4|0;if(((tempValue=HEAP32[r11>>2],HEAP32[r11>>2]=tempValue+ -1,tempValue)|0)!=0){r23=r3|0;r24=HEAP32[r23>>2];r25=r15|0;HEAP32[r25>>2]=r24;r26=HEAP32[r12>>2];r27=HEAP32[r13>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,r26,r27,r4,r5);STACKTOP=r8;return}FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+8>>2]](r14|0);r23=r3|0;r24=HEAP32[r23>>2];r25=r15|0;HEAP32[r25>>2]=r24;r26=HEAP32[r12>>2];r27=HEAP32[r13>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,r26,r27,r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcm(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+80|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+24;r11=r7+48;r12=r7+56;r13=r7+64;r14=r7+72;r15=r8|0;HEAP8[r15]=HEAP8[9760];HEAP8[r15+1|0]=HEAP8[9761|0];HEAP8[r15+2|0]=HEAP8[9762|0];HEAP8[r15+3|0]=HEAP8[9763|0];HEAP8[r15+4|0]=HEAP8[9764|0];HEAP8[r15+5|0]=HEAP8[9765|0];r16=r8+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r16}else{HEAP8[r16]=43;r19=r8+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;r19=r20+1|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=117}}while(0);r19=r9|0;if(HEAP8[19176]){r21=HEAP32[2246]}else{r18=_newlocale(1,2896,0);HEAP32[2246]=r18;HEAP8[19176]=1;r21=r18}r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,r21,r15,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r9+r18|0;r15=HEAP32[r17>>2]&176;do{if((r15|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r22=r9+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=985;break}r17=HEAP8[r9+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=985;break}r22=r9+2|0}else if((r15|0)==32){r22=r6}else{r2=985}}while(0);if(r2==985){r22=r19}r2=r10|0;r10=r13|0;r15=HEAP32[r4+28>>2];HEAP32[r10>>2]=r15;r9=r15+4|0;tempValue=HEAP32[r9>>2],HEAP32[r9>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r19,r22,r6,r2,r11,r12,r13);r13=HEAP32[r10>>2];r10=r13+4|0;if(((tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+ -1,tempValue)|0)!=0){r23=r3|0;r24=HEAP32[r23>>2];r25=r14|0;HEAP32[r25>>2]=r24;r26=HEAP32[r11>>2];r27=HEAP32[r12>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,r26,r27,r4,r5);STACKTOP=r7;return}FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+8>>2]](r13|0);r23=r3|0;r24=HEAP32[r23>>2];r25=r14|0;HEAP32[r25>>2]=r24;r26=HEAP32[r11>>2];r27=HEAP32[r12>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,r26,r27,r4,r5);STACKTOP=r7;return}function __ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r8=r6>>2;r6=STACKTOP;STACKTOP=STACKTOP+48|0;r9=r6,r10=r9>>2;r11=r6+16,r12=r11>>2;r13=r6+32;r14=r7|0;r7=HEAP32[r14>>2];if((HEAP32[4644]|0)!=-1){HEAP32[r12]=18576;HEAP32[r12+1]=24;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r11,252)}r11=HEAP32[4645]-1|0;r12=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r12>>2>>>0<=r11>>>0){r15=___cxa_allocate_exception(4);r16=r15;HEAP32[r16>>2]=10008;___cxa_throw(r15,16120,514)}r7=HEAP32[r12+(r11<<2)>>2];if((r7|0)==0){r15=___cxa_allocate_exception(4);r16=r15;HEAP32[r16>>2]=10008;___cxa_throw(r15,16120,514)}r15=r7;r16=HEAP32[r14>>2];if((HEAP32[4548]|0)!=-1){HEAP32[r10]=18192;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18192,r9,252)}r9=HEAP32[4549]-1|0;r10=HEAP32[r16+8>>2];if(HEAP32[r16+12>>2]-r10>>2>>>0<=r9>>>0){r17=___cxa_allocate_exception(4);r18=r17;HEAP32[r18>>2]=10008;___cxa_throw(r17,16120,514)}r16=HEAP32[r10+(r9<<2)>>2];if((r16|0)==0){r17=___cxa_allocate_exception(4);r18=r17;HEAP32[r18>>2]=10008;___cxa_throw(r17,16120,514)}r17=r16;FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r13,r17);r18=r13;r9=r13;r10=HEAPU8[r9];if((r10&1|0)==0){r19=r10>>>1}else{r19=HEAP32[r13+4>>2]}do{if((r19|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+32>>2]](r15,r1,r3,r4);HEAP32[r8]=r4+(r3-r1)}else{HEAP32[r8]=r4;r10=HEAP8[r1];if(r10<<24>>24==45|r10<<24>>24==43){r14=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+28>>2]](r15,r10);r10=HEAP32[r8];HEAP32[r8]=r10+1;HEAP8[r10]=r14;r20=r1+1|0}else{r20=r1}do{if((r3-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;break}r14=r20+1|0;r10=HEAP8[r14];if(!(r10<<24>>24==120|r10<<24>>24==88)){r21=r20;break}r10=r7;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,48);r12=HEAP32[r8];HEAP32[r8]=r12+1;HEAP8[r12]=r11;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,HEAP8[r14]);r14=HEAP32[r8];HEAP32[r8]=r14+1;HEAP8[r14]=r11;r21=r20+2|0}else{r21=r20}}while(0);do{if((r21|0)!=(r3|0)){r11=r3-1|0;if(r21>>>0<r11>>>0){r22=r21;r23=r11}else{break}while(1){r11=HEAP8[r22];HEAP8[r22]=HEAP8[r23];HEAP8[r23]=r11;r11=r22+1|0;r14=r23-1|0;if(r11>>>0<r14>>>0){r22=r11;r23=r14}else{break}}}}while(0);r14=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+16>>2]](r17);if(r21>>>0<r3>>>0){r11=r18+1|0;r10=r7;r12=r13+4|0;r24=r13+8|0;r25=0;r26=0;r27=r21;while(1){r28=(HEAP8[r9]&1)==0;do{if((HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)==0){r29=r26;r30=r25}else{if((r25|0)!=(HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)){r29=r26;r30=r25;break}r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r14;r31=HEAPU8[r9];r29=(r26>>>0<(((r31&1|0)==0?r31>>>1:HEAP32[r12>>2])-1|0)>>>0&1)+r26|0;r30=0}}while(0);r28=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+28>>2]](r15,HEAP8[r27]);r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r28;r28=r27+1|0;if(r28>>>0<r3>>>0){r25=r30+1|0;r26=r29;r27=r28}else{break}}}r27=r4+(r21-r1)|0;r26=HEAP32[r8];if((r27|0)==(r26|0)){break}r25=r26-1|0;if(r27>>>0<r25>>>0){r32=r27;r33=r25}else{break}while(1){r25=HEAP8[r32];HEAP8[r32]=HEAP8[r33];HEAP8[r33]=r25;r25=r32+1|0;r27=r33-1|0;if(r25>>>0<r27>>>0){r32=r25;r33=r27}else{break}}}}while(0);if((r2|0)==(r3|0)){r34=HEAP32[r8]}else{r34=r4+(r2-r1)|0}HEAP32[r5>>2]=r34;if((HEAP8[r9]&1)==0){STACKTOP=r6;return}__ZdlPv(HEAP32[r13+8>>2]);STACKTOP=r6;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+112|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+32;r12=r8+80;r13=r8+88;r14=r8+96;r15=r8+104;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r16=r9;r9=r16+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r9}else{HEAP8[r9]=43;r19=r16+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;HEAP8[r20+1|0]=108;r19=r20+2|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=117}}while(0);r19=r10|0;if(HEAP8[19176]){r21=HEAP32[2246]}else{r18=_newlocale(1,2896,0);HEAP32[2246]=r18;HEAP8[19176]=1;r21=r18}r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,r21,r16,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));r7=r10+r18|0;r6=HEAP32[r17>>2]&176;do{if((r6|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r22=r10+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=1070;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=1070;break}r22=r10+2|0}else if((r6|0)==32){r22=r7}else{r2=1070}}while(0);if(r2==1070){r22=r19}r2=r11|0;r11=r14|0;r6=HEAP32[r4+28>>2];HEAP32[r11>>2]=r6;r10=r6+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIcE21__widen_and_group_intEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r19,r22,r7,r2,r12,r13,r14);r14=HEAP32[r11>>2];r11=r14+4|0;if(((tempValue=HEAP32[r11>>2],HEAP32[r11>>2]=tempValue+ -1,tempValue)|0)!=0){r23=r3|0;r24=HEAP32[r23>>2];r25=r15|0;HEAP32[r25>>2]=r24;r26=HEAP32[r12>>2];r27=HEAP32[r13>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,r26,r27,r4,r5);STACKTOP=r8;return}FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+8>>2]](r14|0);r23=r3|0;r24=HEAP32[r23>>2];r25=r15|0;HEAP32[r25>>2]=r24;r26=HEAP32[r12>>2];r27=HEAP32[r13>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,r26,r27,r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcd(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+152|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+40,r11=r10>>2;r12=r7+48;r13=r7+112;r14=r7+120;r15=r7+128;r16=r7+136;r17=r7+144;HEAP32[r8>>2]=37;HEAP32[r8+4>>2]=0;r18=r8;r8=r18+1|0;r19=r4+4|0;r20=HEAP32[r19>>2];if((r20&2048|0)==0){r21=r8}else{HEAP8[r8]=43;r21=r18+2|0}if((r20&1024|0)==0){r22=r21}else{HEAP8[r21]=35;r22=r21+1|0}r21=r20&260;r8=r20>>>14;do{if((r21|0)==260){if((r8&1|0)==0){HEAP8[r22]=97;r23=0;break}else{HEAP8[r22]=65;r23=0;break}}else{HEAP8[r22]=46;r20=r22+2|0;HEAP8[r22+1|0]=42;if((r21|0)==256){if((r8&1|0)==0){HEAP8[r20]=101;r23=1;break}else{HEAP8[r20]=69;r23=1;break}}else if((r21|0)==4){if((r8&1|0)==0){HEAP8[r20]=102;r23=1;break}else{HEAP8[r20]=70;r23=1;break}}else{if((r8&1|0)==0){HEAP8[r20]=103;r23=1;break}else{HEAP8[r20]=71;r23=1;break}}}}while(0);r8=r9|0;HEAP32[r11]=r8;if(HEAP8[19176]){r24=HEAP32[2246]}else{r9=_newlocale(1,2896,0);HEAP32[2246]=r9;HEAP8[19176]=1;r24=r9}if(r23){r25=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r24,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{r25=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r24,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}do{if((r25|0)>29){r24=HEAP8[19176];if(r23){if(r24){r26=HEAP32[2246]}else{r9=_newlocale(1,2896,0);HEAP32[2246]=r9;HEAP8[19176]=1;r26=r9}r27=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r26,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{if(r24){r28=HEAP32[2246]}else{r24=_newlocale(1,2896,0);HEAP32[2246]=r24;HEAP8[19176]=1;r28=r24}r27=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r28,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}r24=HEAP32[r11];if((r24|0)!=0){r29=r27;r30=r24;r31=r24;break}r24=___cxa_allocate_exception(4);HEAP32[r24>>2]=9976;___cxa_throw(r24,16104,66)}else{r29=r25;r30=0;r31=HEAP32[r11]}}while(0);r25=r31+r29|0;r27=HEAP32[r19>>2]&176;do{if((r27|0)==16){r19=HEAP8[r31];if(r19<<24>>24==45|r19<<24>>24==43){r32=r31+1|0;break}if(!((r29|0)>1&r19<<24>>24==48)){r2=1127;break}r19=HEAP8[r31+1|0];if(!(r19<<24>>24==120|r19<<24>>24==88)){r2=1127;break}r32=r31+2|0}else if((r27|0)==32){r32=r25}else{r2=1127}}while(0);if(r2==1127){r32=r31}do{if((r31|0)==(r8|0)){r33=r12|0;r34=0;r35=r8}else{r2=_malloc(r29<<1);if((r2|0)!=0){r33=r2;r34=r2;r35=HEAP32[r11];break}r2=___cxa_allocate_exception(4);HEAP32[r2>>2]=9976;___cxa_throw(r2,16104,66)}}while(0);r11=r15|0;r29=HEAP32[r4+28>>2];HEAP32[r11>>2]=r29;r8=r29+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r35,r32,r25,r33,r13,r14,r15);r15=HEAP32[r11>>2];r11=r15+4|0;if(((tempValue=HEAP32[r11>>2],HEAP32[r11>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+8>>2]](r15|0)}r15=r3|0;HEAP32[r17>>2]=HEAP32[r15>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r16,r17,r33,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);r5=HEAP32[r16>>2];HEAP32[r15>>2]=r5;HEAP32[r1>>2]=r5;if((r34|0)!=0){_free(r34)}if((r30|0)==0){STACKTOP=r7;return}_free(r30);STACKTOP=r7;return}function __ZNSt3__112__snprintf_lEPcjPvPKcz(r1,r2,r3,r4,r5){var r6,r7,r8;r6=STACKTOP;STACKTOP=STACKTOP+16|0;r7=r6;r8=r7;HEAP32[r8>>2]=r5;HEAP32[r8+4>>2]=0;r8=_uselocale(r3);r3=_vsnprintf(r1,r2,r4,r7|0);if((r8|0)==0){STACKTOP=r6;return r3}_uselocale(r8);STACKTOP=r6;return r3}function __ZNSt3__112__asprintf_lEPPcPvPKcz(r1,r2,r3,r4){var r5,r6,r7;r5=STACKTOP;STACKTOP=STACKTOP+16|0;r6=r5;r7=r6;HEAP32[r7>>2]=r4;HEAP32[r7+4>>2]=0;r7=_uselocale(r2);r2=_vasprintf(r1,r3,r6|0);if((r7|0)==0){STACKTOP=r5;return r2}_uselocale(r7);STACKTOP=r5;return r2}function __ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r8=r6>>2;r6=0;r9=STACKTOP;STACKTOP=STACKTOP+48|0;r10=r9,r11=r10>>2;r12=r9+16,r13=r12>>2;r14=r9+32;r15=r7|0;r7=HEAP32[r15>>2];if((HEAP32[4644]|0)!=-1){HEAP32[r13]=18576;HEAP32[r13+1]=24;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r12,252)}r12=HEAP32[4645]-1|0;r13=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r13>>2>>>0<=r12>>>0){r16=___cxa_allocate_exception(4);r17=r16;HEAP32[r17>>2]=10008;___cxa_throw(r16,16120,514)}r7=HEAP32[r13+(r12<<2)>>2],r12=r7>>2;if((r7|0)==0){r16=___cxa_allocate_exception(4);r17=r16;HEAP32[r17>>2]=10008;___cxa_throw(r16,16120,514)}r16=r7;r17=HEAP32[r15>>2];if((HEAP32[4548]|0)!=-1){HEAP32[r11]=18192;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18192,r10,252)}r10=HEAP32[4549]-1|0;r11=HEAP32[r17+8>>2];if(HEAP32[r17+12>>2]-r11>>2>>>0<=r10>>>0){r18=___cxa_allocate_exception(4);r19=r18;HEAP32[r19>>2]=10008;___cxa_throw(r18,16120,514)}r17=HEAP32[r11+(r10<<2)>>2],r10=r17>>2;if((r17|0)==0){r18=___cxa_allocate_exception(4);r19=r18;HEAP32[r19>>2]=10008;___cxa_throw(r18,16120,514)}r18=r17;FUNCTION_TABLE[HEAP32[HEAP32[r10]+20>>2]](r14,r18);HEAP32[r8]=r4;r17=HEAP8[r1];if(r17<<24>>24==45|r17<<24>>24==43){r19=FUNCTION_TABLE[HEAP32[HEAP32[r12]+28>>2]](r16,r17);r17=HEAP32[r8];HEAP32[r8]=r17+1;HEAP8[r17]=r19;r20=r1+1|0}else{r20=r1}r19=r3;L1436:do{if((r19-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;r6=1204;break}r17=r20+1|0;r11=HEAP8[r17];if(!(r11<<24>>24==120|r11<<24>>24==88)){r21=r20;r6=1204;break}r11=r7;r15=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r16,48);r13=HEAP32[r8];HEAP32[r8]=r13+1;HEAP8[r13]=r15;r15=r20+2|0;r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+28>>2]](r16,HEAP8[r17]);r17=HEAP32[r8];HEAP32[r8]=r17+1;HEAP8[r17]=r13;r13=r15;while(1){if(r13>>>0>=r3>>>0){r22=r13;r23=r15;break L1436}r17=HEAP8[r13];if(HEAP8[19176]){r24=HEAP32[2246]}else{r11=_newlocale(1,2896,0);HEAP32[2246]=r11;HEAP8[19176]=1;r24=r11}if((_isxdigit(r17<<24>>24,r24)|0)==0){r22=r13;r23=r15;break}else{r13=r13+1|0}}}else{r21=r20;r6=1204}}while(0);L1451:do{if(r6==1204){while(1){r6=0;if(r21>>>0>=r3>>>0){r22=r21;r23=r20;break L1451}r24=HEAP8[r21];if(HEAP8[19176]){r25=HEAP32[2246]}else{r13=_newlocale(1,2896,0);HEAP32[2246]=r13;HEAP8[19176]=1;r25=r13}if((_isdigit(r24<<24>>24,r25)|0)==0){r22=r21;r23=r20;break}else{r21=r21+1|0;r6=1204}}}}while(0);r6=r14;r21=r14;r20=HEAPU8[r21];if((r20&1|0)==0){r26=r20>>>1}else{r26=HEAP32[r14+4>>2]}do{if((r26|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r12]+32>>2]](r16,r23,r22,HEAP32[r8]);HEAP32[r8]=HEAP32[r8]+(r22-r23)}else{do{if((r23|0)!=(r22|0)){r20=r22-1|0;if(r23>>>0<r20>>>0){r27=r23;r28=r20}else{break}while(1){r20=HEAP8[r27];HEAP8[r27]=HEAP8[r28];HEAP8[r28]=r20;r20=r27+1|0;r25=r28-1|0;if(r20>>>0<r25>>>0){r27=r20;r28=r25}else{break}}}}while(0);r25=FUNCTION_TABLE[HEAP32[HEAP32[r10]+16>>2]](r18);if(r23>>>0<r22>>>0){r20=r6+1|0;r24=r14+4|0;r13=r14+8|0;r15=r7;r17=0;r11=0;r29=r23;while(1){r30=(HEAP8[r21]&1)==0;do{if((HEAP8[(r30?r20:HEAP32[r13>>2])+r11|0]|0)>0){if((r17|0)!=(HEAP8[(r30?r20:HEAP32[r13>>2])+r11|0]|0)){r31=r11;r32=r17;break}r33=HEAP32[r8];HEAP32[r8]=r33+1;HEAP8[r33]=r25;r33=HEAPU8[r21];r31=(r11>>>0<(((r33&1|0)==0?r33>>>1:HEAP32[r24>>2])-1|0)>>>0&1)+r11|0;r32=0}else{r31=r11;r32=r17}}while(0);r30=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+28>>2]](r16,HEAP8[r29]);r33=HEAP32[r8];HEAP32[r8]=r33+1;HEAP8[r33]=r30;r30=r29+1|0;if(r30>>>0<r22>>>0){r17=r32+1|0;r11=r31;r29=r30}else{break}}}r29=r4+(r23-r1)|0;r11=HEAP32[r8];if((r29|0)==(r11|0)){break}r17=r11-1|0;if(r29>>>0<r17>>>0){r34=r29;r35=r17}else{break}while(1){r17=HEAP8[r34];HEAP8[r34]=HEAP8[r35];HEAP8[r35]=r17;r17=r34+1|0;r29=r35-1|0;if(r17>>>0<r29>>>0){r34=r17;r35=r29}else{break}}}}while(0);L1490:do{if(r22>>>0<r3>>>0){r35=r7;r34=r22;while(1){r23=HEAP8[r34];if(r23<<24>>24==46){break}r31=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+28>>2]](r16,r23);r23=HEAP32[r8];HEAP32[r8]=r23+1;HEAP8[r23]=r31;r31=r34+1|0;if(r31>>>0<r3>>>0){r34=r31}else{r36=r31;break L1490}}r35=FUNCTION_TABLE[HEAP32[HEAP32[r10]+12>>2]](r18);r31=HEAP32[r8];HEAP32[r8]=r31+1;HEAP8[r31]=r35;r36=r34+1|0}else{r36=r22}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r12]+32>>2]](r16,r36,r3,HEAP32[r8]);r16=HEAP32[r8]+(r19-r36)|0;HEAP32[r8]=r16;if((r2|0)==(r3|0)){r37=r16}else{r37=r4+(r2-r1)|0}HEAP32[r5>>2]=r37;if((HEAP8[r21]&1)==0){STACKTOP=r9;return}__ZdlPv(HEAP32[r14+8>>2]);STACKTOP=r9;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEce(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+152|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+40,r11=r10>>2;r12=r7+48;r13=r7+112;r14=r7+120;r15=r7+128;r16=r7+136;r17=r7+144;HEAP32[r8>>2]=37;HEAP32[r8+4>>2]=0;r18=r8;r8=r18+1|0;r19=r4+4|0;r20=HEAP32[r19>>2];if((r20&2048|0)==0){r21=r8}else{HEAP8[r8]=43;r21=r18+2|0}if((r20&1024|0)==0){r22=r21}else{HEAP8[r21]=35;r22=r21+1|0}r21=r20&260;r8=r20>>>14;do{if((r21|0)==260){HEAP8[r22]=76;r20=r22+1|0;if((r8&1|0)==0){HEAP8[r20]=97;r23=0;break}else{HEAP8[r20]=65;r23=0;break}}else{HEAP8[r22]=46;HEAP8[r22+1|0]=42;HEAP8[r22+2|0]=76;r20=r22+3|0;if((r21|0)==4){if((r8&1|0)==0){HEAP8[r20]=102;r23=1;break}else{HEAP8[r20]=70;r23=1;break}}else if((r21|0)==256){if((r8&1|0)==0){HEAP8[r20]=101;r23=1;break}else{HEAP8[r20]=69;r23=1;break}}else{if((r8&1|0)==0){HEAP8[r20]=103;r23=1;break}else{HEAP8[r20]=71;r23=1;break}}}}while(0);r8=r9|0;HEAP32[r11]=r8;if(HEAP8[19176]){r24=HEAP32[2246]}else{r9=_newlocale(1,2896,0);HEAP32[2246]=r9;HEAP8[19176]=1;r24=r9}if(r23){r25=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r24,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{r25=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r24,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}do{if((r25|0)>29){r24=HEAP8[19176];if(r23){if(r24){r26=HEAP32[2246]}else{r9=_newlocale(1,2896,0);HEAP32[2246]=r9;HEAP8[19176]=1;r26=r9}r27=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r26,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{if(r24){r28=HEAP32[2246]}else{r24=_newlocale(1,2896,0);HEAP32[2246]=r24;HEAP8[19176]=1;r28=r24}r27=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r28,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}r24=HEAP32[r11];if((r24|0)!=0){r29=r27;r30=r24;r31=r24;break}r24=___cxa_allocate_exception(4);HEAP32[r24>>2]=9976;___cxa_throw(r24,16104,66)}else{r29=r25;r30=0;r31=HEAP32[r11]}}while(0);r25=r31+r29|0;r27=HEAP32[r19>>2]&176;do{if((r27|0)==32){r32=r25}else if((r27|0)==16){r19=HEAP8[r31];if(r19<<24>>24==45|r19<<24>>24==43){r32=r31+1|0;break}if(!((r29|0)>1&r19<<24>>24==48)){r2=1297;break}r19=HEAP8[r31+1|0];if(!(r19<<24>>24==120|r19<<24>>24==88)){r2=1297;break}r32=r31+2|0}else{r2=1297}}while(0);if(r2==1297){r32=r31}do{if((r31|0)==(r8|0)){r33=r12|0;r34=0;r35=r8}else{r2=_malloc(r29<<1);if((r2|0)!=0){r33=r2;r34=r2;r35=HEAP32[r11];break}r2=___cxa_allocate_exception(4);HEAP32[r2>>2]=9976;___cxa_throw(r2,16104,66)}}while(0);r11=r15|0;r29=HEAP32[r4+28>>2];HEAP32[r11>>2]=r29;r8=r29+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIcE23__widen_and_group_floatEPcS2_S2_S2_RS2_S3_RKNS_6localeE(r35,r32,r25,r33,r13,r14,r15);r15=HEAP32[r11>>2];r11=r15+4|0;if(((tempValue=HEAP32[r11>>2],HEAP32[r11>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+8>>2]](r15|0)}r15=r3|0;HEAP32[r17>>2]=HEAP32[r15>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r16,r17,r33,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);r5=HEAP32[r16>>2];HEAP32[r15>>2]=r5;HEAP32[r1>>2]=r5;if((r34|0)!=0){_free(r34)}if((r30|0)==0){STACKTOP=r7;return}_free(r30);STACKTOP=r7;return}function __ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){return}function __ZNSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwl(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+144|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+24;r11=r7+112;r12=r7+120;r13=r7+128;r14=r7+136;r15=r8|0;HEAP8[r15]=HEAP8[9760];HEAP8[r15+1|0]=HEAP8[9761|0];HEAP8[r15+2|0]=HEAP8[9762|0];HEAP8[r15+3|0]=HEAP8[9763|0];HEAP8[r15+4|0]=HEAP8[9764|0];HEAP8[r15+5|0]=HEAP8[9765|0];r16=r8+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r16}else{HEAP8[r16]=43;r19=r8+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;r19=r20+1|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=100}}while(0);r19=r9|0;if(HEAP8[19176]){r21=HEAP32[2246]}else{r18=_newlocale(1,2896,0);HEAP32[2246]=r18;HEAP8[19176]=1;r21=r18}r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,r21,r15,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r9+r18|0;r15=HEAP32[r17>>2]&176;do{if((r15|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r22=r9+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=1343;break}r17=HEAP8[r9+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=1343;break}r22=r9+2|0}else if((r15|0)==32){r22=r6}else{r2=1343}}while(0);if(r2==1343){r22=r19}r2=r10|0;r10=r13|0;r15=HEAP32[r4+28>>2];HEAP32[r10>>2]=r15;r9=r15+4|0;tempValue=HEAP32[r9>>2],HEAP32[r9>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r19,r22,r6,r2,r11,r12,r13);r13=HEAP32[r10>>2];r10=r13+4|0;if(((tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+ -1,tempValue)|0)!=0){r23=r3|0;r24=HEAP32[r23>>2];r25=r14|0;HEAP32[r25>>2]=r24;r26=HEAP32[r11>>2];r27=HEAP32[r12>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,r26,r27,r4,r5);STACKTOP=r7;return}FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+8>>2]](r13|0);r23=r3|0;r24=HEAP32[r23>>2];r25=r14|0;HEAP32[r25>>2]=r24;r26=HEAP32[r11>>2];r27=HEAP32[r12>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,r26,r27,r4,r5);STACKTOP=r7;return}function __ZNKSt3__17num_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPKv(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+96|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+24;r11=r7+48;r12=r7+88;r13=r7+16|0;HEAP8[r13]=HEAP8[9768];HEAP8[r13+1|0]=HEAP8[9769|0];HEAP8[r13+2|0]=HEAP8[9770|0];HEAP8[r13+3|0]=HEAP8[9771|0];HEAP8[r13+4|0]=HEAP8[9772|0];HEAP8[r13+5|0]=HEAP8[9773|0];r14=r10|0;if(HEAP8[19176]){r15=HEAP32[2246]}else{r16=_newlocale(1,2896,0);HEAP32[2246]=r16;HEAP8[19176]=1;r15=r16}r16=__ZNSt3__111__sprintf_lEPcPvPKcz(r14,r15,r13,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r10+r16|0;r13=HEAP32[r4+4>>2]&176;do{if((r13|0)==16){r15=HEAP8[r14];if(r15<<24>>24==45|r15<<24>>24==43){r17=r10+1|0;break}if(!((r16|0)>1&r15<<24>>24==48)){r2=1362;break}r15=HEAP8[r10+1|0];if(!(r15<<24>>24==120|r15<<24>>24==88)){r2=1362;break}r17=r10+2|0}else if((r13|0)==32){r17=r6}else{r2=1362}}while(0);if(r2==1362){r17=r14}r2=HEAP32[r4+28>>2],r13=r2>>2;r15=(r2+4|0)>>2;tempValue=HEAP32[r15],HEAP32[r15]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r9]=18576;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r8,252)}r8=HEAP32[4645]-1|0;r9=HEAP32[r13+2];do{if(HEAP32[r13+3]-r9>>2>>>0>r8>>>0){r18=HEAP32[r9+(r8<<2)>>2];if((r18|0)==0){break}if(((tempValue=HEAP32[r15],HEAP32[r15]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r13]+8>>2]](r2)}r19=r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+32>>2]](r18,r14,r6,r19);r18=r11+r16|0;if((r17|0)==(r6|0)){r20=r18;r21=r3|0;r22=HEAP32[r21>>2];r23=r12|0;HEAP32[r23>>2]=r22;__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r12,r19,r20,r18,r4,r5);STACKTOP=r7;return}r20=r11+(r17-r10)|0;r21=r3|0;r22=HEAP32[r21>>2];r23=r12|0;HEAP32[r23>>2]=r22;__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r12,r19,r20,r18,r4,r5);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);HEAP32[r7>>2]=10008;___cxa_throw(r7,16120,514)}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwb(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25;r7=STACKTOP;STACKTOP=STACKTOP+40|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+16;r11=r7+24;if((HEAP32[r4+4>>2]&1|0)==0){r12=HEAP32[HEAP32[r2>>2]+24>>2];HEAP32[r10>>2]=HEAP32[r3>>2];FUNCTION_TABLE[r12](r1,r2,r10,r4,r5,r6&1);STACKTOP=r7;return}r5=HEAP32[r4+28>>2],r4=r5>>2;r10=(r5+4|0)>>2;tempValue=HEAP32[r10],HEAP32[r10]=tempValue+1,tempValue;if((HEAP32[4546]|0)!=-1){HEAP32[r9]=18184;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18184,r8,252)}r8=HEAP32[4547]-1|0;r9=HEAP32[r4+2];do{if(HEAP32[r4+3]-r9>>2>>>0>r8>>>0){r2=HEAP32[r9+(r8<<2)>>2];if((r2|0)==0){break}r12=r2;if(((tempValue=HEAP32[r10],HEAP32[r10]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r4]+8>>2]](r5)}r13=HEAP32[r2>>2];if(r6){FUNCTION_TABLE[HEAP32[r13+24>>2]](r11,r12)}else{FUNCTION_TABLE[HEAP32[r13+28>>2]](r11,r12)}r12=r11;r13=HEAP8[r12];if((r13&1)==0){r2=r11+4|0;r14=r2;r15=r2;r16=r11+8|0}else{r2=r11+8|0;r14=HEAP32[r2>>2];r15=r11+4|0;r16=r2}r2=(r3|0)>>2;r17=r14;r18=r13;while(1){r19=(r18&1)==0;if(r19){r20=r15}else{r20=HEAP32[r16>>2]}r13=r18&255;if((r13&1|0)==0){r21=r13>>>1}else{r21=HEAP32[r15>>2]}if((r17|0)==((r21<<2)+r20|0)){break}r13=HEAP32[r17>>2];r22=HEAP32[r2];do{if((r22|0)!=0){r23=r22+24|0;r24=HEAP32[r23>>2];if((r24|0)==(HEAP32[r22+28>>2]|0)){r25=FUNCTION_TABLE[HEAP32[HEAP32[r22>>2]+52>>2]](r22,r13)}else{HEAP32[r23>>2]=r24+4;HEAP32[r24>>2]=r13;r25=r13}if((r25|0)!=-1){break}HEAP32[r2]=0}}while(0);r17=r17+4|0;r18=HEAP8[r12]}HEAP32[r1>>2]=HEAP32[r2];if(r19){STACKTOP=r7;return}__ZdlPv(HEAP32[r16>>2]);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);HEAP32[r7>>2]=10008;___cxa_throw(r7,16120,514)}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwx(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+232|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+32;r12=r8+200;r13=r8+208;r14=r8+216;r15=r8+224;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r16=r9;r9=r16+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r9}else{HEAP8[r9]=43;r19=r16+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;HEAP8[r20+1|0]=108;r19=r20+2|0;r20=r18&74;do{if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else if((r20|0)==64){HEAP8[r19]=111}else{HEAP8[r19]=100}}while(0);r19=r10|0;if(HEAP8[19176]){r21=HEAP32[2246]}else{r20=_newlocale(1,2896,0);HEAP32[2246]=r20;HEAP8[19176]=1;r21=r20}r20=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,r21,r16,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));r7=r10+r20|0;r6=HEAP32[r17>>2]&176;do{if((r6|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r22=r10+1|0;break}if(!((r20|0)>1&r17<<24>>24==48)){r2=1439;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=1439;break}r22=r10+2|0}else if((r6|0)==32){r22=r7}else{r2=1439}}while(0);if(r2==1439){r22=r19}r2=r11|0;r11=r14|0;r6=HEAP32[r4+28>>2];HEAP32[r11>>2]=r6;r10=r6+4|0;tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r19,r22,r7,r2,r12,r13,r14);r14=HEAP32[r11>>2];r11=r14+4|0;if(((tempValue=HEAP32[r11>>2],HEAP32[r11>>2]=tempValue+ -1,tempValue)|0)!=0){r23=r3|0;r24=HEAP32[r23>>2];r25=r15|0;HEAP32[r25>>2]=r24;r26=HEAP32[r12>>2];r27=HEAP32[r13>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,r26,r27,r4,r5);STACKTOP=r8;return}FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+8>>2]](r14|0);r23=r3|0;r24=HEAP32[r23>>2];r25=r15|0;HEAP32[r25>>2]=r24;r26=HEAP32[r12>>2];r27=HEAP32[r13>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,r26,r27,r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwm(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+144|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+24;r11=r7+112;r12=r7+120;r13=r7+128;r14=r7+136;r15=r8|0;HEAP8[r15]=HEAP8[9760];HEAP8[r15+1|0]=HEAP8[9761|0];HEAP8[r15+2|0]=HEAP8[9762|0];HEAP8[r15+3|0]=HEAP8[9763|0];HEAP8[r15+4|0]=HEAP8[9764|0];HEAP8[r15+5|0]=HEAP8[9765|0];r16=r8+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r16}else{HEAP8[r16]=43;r19=r8+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;r19=r20+1|0;r20=r18&74;do{if((r20|0)==64){HEAP8[r19]=111}else if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else{HEAP8[r19]=117}}while(0);r19=r9|0;if(HEAP8[19176]){r21=HEAP32[2246]}else{r18=_newlocale(1,2896,0);HEAP32[2246]=r18;HEAP8[19176]=1;r21=r18}r18=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,r21,r15,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r9+r18|0;r15=HEAP32[r17>>2]&176;do{if((r15|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r22=r9+1|0;break}if(!((r18|0)>1&r17<<24>>24==48)){r2=1468;break}r17=HEAP8[r9+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=1468;break}r22=r9+2|0}else if((r15|0)==32){r22=r6}else{r2=1468}}while(0);if(r2==1468){r22=r19}r2=r10|0;r10=r13|0;r15=HEAP32[r4+28>>2];HEAP32[r10>>2]=r15;r9=r15+4|0;tempValue=HEAP32[r9>>2],HEAP32[r9>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r19,r22,r6,r2,r11,r12,r13);r13=HEAP32[r10>>2];r10=r13+4|0;if(((tempValue=HEAP32[r10>>2],HEAP32[r10>>2]=tempValue+ -1,tempValue)|0)!=0){r23=r3|0;r24=HEAP32[r23>>2];r25=r14|0;HEAP32[r25>>2]=r24;r26=HEAP32[r11>>2];r27=HEAP32[r12>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,r26,r27,r4,r5);STACKTOP=r7;return}FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+8>>2]](r13|0);r23=r3|0;r24=HEAP32[r23>>2];r25=r14|0;HEAP32[r25>>2]=r24;r26=HEAP32[r11>>2];r27=HEAP32[r12>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r14,r2,r26,r27,r4,r5);STACKTOP=r7;return}function __ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r8=r6>>2;r6=STACKTOP;STACKTOP=STACKTOP+48|0;r9=r6,r10=r9>>2;r11=r6+16,r12=r11>>2;r13=r6+32;r14=r7|0;r7=HEAP32[r14>>2];if((HEAP32[4642]|0)!=-1){HEAP32[r12]=18568;HEAP32[r12+1]=24;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r11,252)}r11=HEAP32[4643]-1|0;r12=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r12>>2>>>0<=r11>>>0){r15=___cxa_allocate_exception(4);r16=r15;HEAP32[r16>>2]=10008;___cxa_throw(r15,16120,514)}r7=HEAP32[r12+(r11<<2)>>2];if((r7|0)==0){r15=___cxa_allocate_exception(4);r16=r15;HEAP32[r16>>2]=10008;___cxa_throw(r15,16120,514)}r15=r7;r16=HEAP32[r14>>2];if((HEAP32[4546]|0)!=-1){HEAP32[r10]=18184;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18184,r9,252)}r9=HEAP32[4547]-1|0;r10=HEAP32[r16+8>>2];if(HEAP32[r16+12>>2]-r10>>2>>>0<=r9>>>0){r17=___cxa_allocate_exception(4);r18=r17;HEAP32[r18>>2]=10008;___cxa_throw(r17,16120,514)}r16=HEAP32[r10+(r9<<2)>>2];if((r16|0)==0){r17=___cxa_allocate_exception(4);r18=r17;HEAP32[r18>>2]=10008;___cxa_throw(r17,16120,514)}r17=r16;FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+20>>2]](r13,r17);r18=r13;r9=r13;r10=HEAPU8[r9];if((r10&1|0)==0){r19=r10>>>1}else{r19=HEAP32[r13+4>>2]}do{if((r19|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+48>>2]](r15,r1,r3,r4);HEAP32[r8]=(r3-r1<<2)+r4}else{HEAP32[r8]=r4;r10=HEAP8[r1];if(r10<<24>>24==45|r10<<24>>24==43){r14=FUNCTION_TABLE[HEAP32[HEAP32[r7>>2]+44>>2]](r15,r10);r10=HEAP32[r8];HEAP32[r8]=r10+4;HEAP32[r10>>2]=r14;r20=r1+1|0}else{r20=r1}do{if((r3-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;break}r14=r20+1|0;r10=HEAP8[r14];if(!(r10<<24>>24==120|r10<<24>>24==88)){r21=r20;break}r10=r7;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,48);r12=HEAP32[r8];HEAP32[r8]=r12+4;HEAP32[r12>>2]=r11;r11=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,HEAP8[r14]);r14=HEAP32[r8];HEAP32[r8]=r14+4;HEAP32[r14>>2]=r11;r21=r20+2|0}else{r21=r20}}while(0);do{if((r21|0)!=(r3|0)){r11=r3-1|0;if(r21>>>0<r11>>>0){r22=r21;r23=r11}else{break}while(1){r11=HEAP8[r22];HEAP8[r22]=HEAP8[r23];HEAP8[r23]=r11;r11=r22+1|0;r14=r23-1|0;if(r11>>>0<r14>>>0){r22=r11;r23=r14}else{break}}}}while(0);r14=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+16>>2]](r17);if(r21>>>0<r3>>>0){r11=r18+1|0;r10=r7;r12=r13+4|0;r24=r13+8|0;r25=0;r26=0;r27=r21;while(1){r28=(HEAP8[r9]&1)==0;do{if((HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)==0){r29=r26;r30=r25}else{if((r25|0)!=(HEAP8[(r28?r11:HEAP32[r24>>2])+r26|0]|0)){r29=r26;r30=r25;break}r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r14;r31=HEAPU8[r9];r29=(r26>>>0<(((r31&1|0)==0?r31>>>1:HEAP32[r12>>2])-1|0)>>>0&1)+r26|0;r30=0}}while(0);r28=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+44>>2]](r15,HEAP8[r27]);r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r28;r28=r27+1|0;if(r28>>>0<r3>>>0){r25=r30+1|0;r26=r29;r27=r28}else{break}}}r27=(r21-r1<<2)+r4|0;r26=HEAP32[r8];if((r27|0)==(r26|0)){break}r25=r26-4|0;if(r27>>>0<r25>>>0){r32=r27;r33=r25}else{break}while(1){r25=HEAP32[r32>>2];HEAP32[r32>>2]=HEAP32[r33>>2];HEAP32[r33>>2]=r25;r25=r32+4|0;r27=r33-4|0;if(r25>>>0<r27>>>0){r32=r25;r33=r27}else{break}}}}while(0);if((r2|0)==(r3|0)){r34=HEAP32[r8]}else{r34=(r2-r1<<2)+r4|0}HEAP32[r5>>2]=r34;if((HEAP8[r9]&1)==0){STACKTOP=r6;return}__ZdlPv(HEAP32[r13+8>>2]);STACKTOP=r6;return}function __ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r8=r1>>2;r1=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r9>>2];r9=r1,r10=r9>>2;r11=(r2|0)>>2;r2=HEAP32[r11];if((r2|0)==0){HEAP32[r8]=0;STACKTOP=r1;return}r12=r5;r5=r3;r13=r12-r5>>2;r14=r6+12|0;r6=HEAP32[r14>>2];r15=(r6|0)>(r13|0)?r6-r13|0:0;r13=r4;r6=r13-r5|0;r5=r6>>2;do{if((r6|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+48>>2]](r2,r3,r5)|0)==(r5|0)){break}HEAP32[r11]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);do{if((r15|0)>0){if(r15>>>0>1073741822){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r15>>>0<2){HEAP8[r9]=r15<<1&255;r16=1;r17=r9+4|0}else{r5=r15+4&-4;r3=__Znwj(r5<<2);HEAP32[r10+2]=r3;HEAP32[r10]=r5|1;HEAP32[r10+1]=r15;r16=r15;r17=r3}r3=r16;r5=r17;while(1){r6=r3-1|0;HEAP32[r5>>2]=r7;if((r6|0)==0){break}else{r3=r6;r5=r5+4|0}}HEAP32[r17+(r15<<2)>>2]=0;r5=HEAP32[r11];r3=r9;if((HEAP8[r3]&1)==0){r18=r9+4|0}else{r18=HEAP32[r10+2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+48>>2]](r5,r18,r15)|0)==(r15|0)){if((HEAP8[r3]&1)==0){r19=r5;break}__ZdlPv(HEAP32[r10+2]);r19=r5;break}HEAP32[r11]=0;HEAP32[r8]=0;if((HEAP8[r3]&1)==0){STACKTOP=r1;return}__ZdlPv(HEAP32[r10+2]);STACKTOP=r1;return}else{r19=r2}}while(0);r2=r12-r13|0;r13=r2>>2;do{if((r2|0)>0){if((FUNCTION_TABLE[HEAP32[HEAP32[r19>>2]+48>>2]](r19,r4,r13)|0)==(r13|0)){break}HEAP32[r11]=0;HEAP32[r8]=0;STACKTOP=r1;return}}while(0);HEAP32[r14>>2]=0;HEAP32[r8]=r19;STACKTOP=r1;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwy(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27;r2=0;r8=STACKTOP;STACKTOP=STACKTOP+240|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r8+32;r12=r8+208;r13=r8+216;r14=r8+224;r15=r8+232;HEAP32[r9>>2]=37;HEAP32[r9+4>>2]=0;r16=r9;r9=r16+1|0;r17=r4+4|0;r18=HEAP32[r17>>2];if((r18&2048|0)==0){r19=r9}else{HEAP8[r9]=43;r19=r16+2|0}if((r18&512|0)==0){r20=r19}else{HEAP8[r19]=35;r20=r19+1|0}HEAP8[r20]=108;HEAP8[r20+1|0]=108;r19=r20+2|0;r20=r18&74;do{if((r20|0)==8){if((r18&16384|0)==0){HEAP8[r19]=120;break}else{HEAP8[r19]=88;break}}else if((r20|0)==64){HEAP8[r19]=111}else{HEAP8[r19]=117}}while(0);r19=r10|0;if(HEAP8[19176]){r21=HEAP32[2246]}else{r20=_newlocale(1,2896,0);HEAP32[2246]=r20;HEAP8[19176]=1;r21=r20}r20=__ZNSt3__111__sprintf_lEPcPvPKcz(r19,r21,r16,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=r6,HEAP32[tempInt+8>>2]=r7,tempInt));r7=r10+r20|0;r6=HEAP32[r17>>2]&176;do{if((r6|0)==32){r22=r7}else if((r6|0)==16){r17=HEAP8[r19];if(r17<<24>>24==45|r17<<24>>24==43){r22=r10+1|0;break}if(!((r20|0)>1&r17<<24>>24==48)){r2=1589;break}r17=HEAP8[r10+1|0];if(!(r17<<24>>24==120|r17<<24>>24==88)){r2=1589;break}r22=r10+2|0}else{r2=1589}}while(0);if(r2==1589){r22=r19}r2=r11|0;r11=r14|0;r10=HEAP32[r4+28>>2];HEAP32[r11>>2]=r10;r20=r10+4|0;tempValue=HEAP32[r20>>2],HEAP32[r20>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIwE21__widen_and_group_intEPcS2_S2_PwRS3_S4_RKNS_6localeE(r19,r22,r7,r2,r12,r13,r14);r14=HEAP32[r11>>2];r11=r14+4|0;if(((tempValue=HEAP32[r11>>2],HEAP32[r11>>2]=tempValue+ -1,tempValue)|0)!=0){r23=r3|0;r24=HEAP32[r23>>2];r25=r15|0;HEAP32[r25>>2]=r24;r26=HEAP32[r12>>2];r27=HEAP32[r13>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,r26,r27,r4,r5);STACKTOP=r8;return}FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+8>>2]](r14|0);r23=r3|0;r24=HEAP32[r23>>2];r25=r15|0;HEAP32[r25>>2]=r24;r26=HEAP32[r12>>2];r27=HEAP32[r13>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r15,r2,r26,r27,r4,r5);STACKTOP=r8;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwd(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+320|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+40,r11=r10>>2;r12=r7+48;r13=r7+280;r14=r7+288;r15=r7+296;r16=r7+304;r17=r7+312;HEAP32[r8>>2]=37;HEAP32[r8+4>>2]=0;r18=r8;r8=r18+1|0;r19=r4+4|0;r20=HEAP32[r19>>2];if((r20&2048|0)==0){r21=r8}else{HEAP8[r8]=43;r21=r18+2|0}if((r20&1024|0)==0){r22=r21}else{HEAP8[r21]=35;r22=r21+1|0}r21=r20&260;r8=r20>>>14;do{if((r21|0)==260){if((r8&1|0)==0){HEAP8[r22]=97;r23=0;break}else{HEAP8[r22]=65;r23=0;break}}else{HEAP8[r22]=46;r20=r22+2|0;HEAP8[r22+1|0]=42;if((r21|0)==256){if((r8&1|0)==0){HEAP8[r20]=101;r23=1;break}else{HEAP8[r20]=69;r23=1;break}}else if((r21|0)==4){if((r8&1|0)==0){HEAP8[r20]=102;r23=1;break}else{HEAP8[r20]=70;r23=1;break}}else{if((r8&1|0)==0){HEAP8[r20]=103;r23=1;break}else{HEAP8[r20]=71;r23=1;break}}}}while(0);r8=r9|0;HEAP32[r11]=r8;if(HEAP8[19176]){r24=HEAP32[2246]}else{r9=_newlocale(1,2896,0);HEAP32[2246]=r9;HEAP8[19176]=1;r24=r9}if(r23){r25=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r24,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{r25=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r24,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}do{if((r25|0)>29){r24=HEAP8[19176];if(r23){if(r24){r26=HEAP32[2246]}else{r9=_newlocale(1,2896,0);HEAP32[2246]=r9;HEAP8[19176]=1;r26=r9}r27=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r26,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{if(r24){r28=HEAP32[2246]}else{r24=_newlocale(1,2896,0);HEAP32[2246]=r24;HEAP8[19176]=1;r28=r24}r27=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r28,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}r24=HEAP32[r11];if((r24|0)!=0){r29=r27;r30=r24;r31=r24;break}r24=___cxa_allocate_exception(4);HEAP32[r24>>2]=9976;___cxa_throw(r24,16104,66)}else{r29=r25;r30=0;r31=HEAP32[r11]}}while(0);r25=r31+r29|0;r27=HEAP32[r19>>2]&176;do{if((r27|0)==32){r32=r25}else if((r27|0)==16){r19=HEAP8[r31];if(r19<<24>>24==45|r19<<24>>24==43){r32=r31+1|0;break}if(!((r29|0)>1&r19<<24>>24==48)){r2=1646;break}r19=HEAP8[r31+1|0];if(!(r19<<24>>24==120|r19<<24>>24==88)){r2=1646;break}r32=r31+2|0}else{r2=1646}}while(0);if(r2==1646){r32=r31}do{if((r31|0)==(r8|0)){r33=r12|0;r34=0;r35=r8}else{r2=_malloc(r29<<3);r27=r2;if((r2|0)!=0){r33=r27;r34=r27;r35=HEAP32[r11];break}r27=___cxa_allocate_exception(4);HEAP32[r27>>2]=9976;___cxa_throw(r27,16104,66)}}while(0);r11=r15|0;r29=HEAP32[r4+28>>2];HEAP32[r11>>2]=r29;r8=r29+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r35,r32,r25,r33,r13,r14,r15);r15=HEAP32[r11>>2];r11=r15+4|0;if(((tempValue=HEAP32[r11>>2],HEAP32[r11>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+8>>2]](r15|0)}r15=r3|0;HEAP32[r17>>2]=HEAP32[r15>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r16,r17,r33,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);r5=HEAP32[r16>>2];HEAP32[r15>>2]=r5;HEAP32[r1>>2]=r5;if((r34|0)!=0){_free(r34)}if((r30|0)==0){STACKTOP=r7;return}_free(r30);STACKTOP=r7;return}function __ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r8=r6>>2;r6=0;r9=STACKTOP;STACKTOP=STACKTOP+48|0;r10=r9,r11=r10>>2;r12=r9+16,r13=r12>>2;r14=r9+32;r15=r7|0;r7=HEAP32[r15>>2];if((HEAP32[4642]|0)!=-1){HEAP32[r13]=18568;HEAP32[r13+1]=24;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r12,252)}r12=HEAP32[4643]-1|0;r13=HEAP32[r7+8>>2];if(HEAP32[r7+12>>2]-r13>>2>>>0<=r12>>>0){r16=___cxa_allocate_exception(4);r17=r16;HEAP32[r17>>2]=10008;___cxa_throw(r16,16120,514)}r7=HEAP32[r13+(r12<<2)>>2],r12=r7>>2;if((r7|0)==0){r16=___cxa_allocate_exception(4);r17=r16;HEAP32[r17>>2]=10008;___cxa_throw(r16,16120,514)}r16=r7;r17=HEAP32[r15>>2];if((HEAP32[4546]|0)!=-1){HEAP32[r11]=18184;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18184,r10,252)}r10=HEAP32[4547]-1|0;r11=HEAP32[r17+8>>2];if(HEAP32[r17+12>>2]-r11>>2>>>0<=r10>>>0){r18=___cxa_allocate_exception(4);r19=r18;HEAP32[r19>>2]=10008;___cxa_throw(r18,16120,514)}r17=HEAP32[r11+(r10<<2)>>2],r10=r17>>2;if((r17|0)==0){r18=___cxa_allocate_exception(4);r19=r18;HEAP32[r19>>2]=10008;___cxa_throw(r18,16120,514)}r18=r17;FUNCTION_TABLE[HEAP32[HEAP32[r10]+20>>2]](r14,r18);HEAP32[r8]=r4;r17=HEAP8[r1];if(r17<<24>>24==45|r17<<24>>24==43){r19=FUNCTION_TABLE[HEAP32[HEAP32[r12]+44>>2]](r16,r17);r17=HEAP32[r8];HEAP32[r8]=r17+4;HEAP32[r17>>2]=r19;r20=r1+1|0}else{r20=r1}r19=r3;L2021:do{if((r19-r20|0)>1){if((HEAP8[r20]|0)!=48){r21=r20;r6=1706;break}r17=r20+1|0;r11=HEAP8[r17];if(!(r11<<24>>24==120|r11<<24>>24==88)){r21=r20;r6=1706;break}r11=r7;r15=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+44>>2]](r16,48);r13=HEAP32[r8];HEAP32[r8]=r13+4;HEAP32[r13>>2]=r15;r15=r20+2|0;r13=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+44>>2]](r16,HEAP8[r17]);r17=HEAP32[r8];HEAP32[r8]=r17+4;HEAP32[r17>>2]=r13;r13=r15;while(1){if(r13>>>0>=r3>>>0){r22=r13;r23=r15;break L2021}r17=HEAP8[r13];if(HEAP8[19176]){r24=HEAP32[2246]}else{r11=_newlocale(1,2896,0);HEAP32[2246]=r11;HEAP8[19176]=1;r24=r11}if((_isxdigit(r17<<24>>24,r24)|0)==0){r22=r13;r23=r15;break}else{r13=r13+1|0}}}else{r21=r20;r6=1706}}while(0);L2036:do{if(r6==1706){while(1){r6=0;if(r21>>>0>=r3>>>0){r22=r21;r23=r20;break L2036}r24=HEAP8[r21];if(HEAP8[19176]){r25=HEAP32[2246]}else{r13=_newlocale(1,2896,0);HEAP32[2246]=r13;HEAP8[19176]=1;r25=r13}if((_isdigit(r24<<24>>24,r25)|0)==0){r22=r21;r23=r20;break}else{r21=r21+1|0;r6=1706}}}}while(0);r6=r14;r21=r14;r20=HEAPU8[r21];if((r20&1|0)==0){r26=r20>>>1}else{r26=HEAP32[r14+4>>2]}do{if((r26|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r16,r23,r22,HEAP32[r8]);HEAP32[r8]=(r22-r23<<2)+HEAP32[r8]}else{do{if((r23|0)!=(r22|0)){r20=r22-1|0;if(r23>>>0<r20>>>0){r27=r23;r28=r20}else{break}while(1){r20=HEAP8[r27];HEAP8[r27]=HEAP8[r28];HEAP8[r28]=r20;r20=r27+1|0;r25=r28-1|0;if(r20>>>0<r25>>>0){r27=r20;r28=r25}else{break}}}}while(0);r25=FUNCTION_TABLE[HEAP32[HEAP32[r10]+16>>2]](r18);if(r23>>>0<r22>>>0){r20=r6+1|0;r24=r14+4|0;r13=r14+8|0;r15=r7;r17=0;r11=0;r29=r23;while(1){r30=(HEAP8[r21]&1)==0;do{if((HEAP8[(r30?r20:HEAP32[r13>>2])+r11|0]|0)>0){if((r17|0)!=(HEAP8[(r30?r20:HEAP32[r13>>2])+r11|0]|0)){r31=r11;r32=r17;break}r33=HEAP32[r8];HEAP32[r8]=r33+4;HEAP32[r33>>2]=r25;r33=HEAPU8[r21];r31=(r11>>>0<(((r33&1|0)==0?r33>>>1:HEAP32[r24>>2])-1|0)>>>0&1)+r11|0;r32=0}else{r31=r11;r32=r17}}while(0);r30=FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+44>>2]](r16,HEAP8[r29]);r33=HEAP32[r8];HEAP32[r8]=r33+4;HEAP32[r33>>2]=r30;r30=r29+1|0;if(r30>>>0<r22>>>0){r17=r32+1|0;r11=r31;r29=r30}else{break}}}r29=(r23-r1<<2)+r4|0;r11=HEAP32[r8];if((r29|0)==(r11|0)){break}r17=r11-4|0;if(r29>>>0<r17>>>0){r34=r29;r35=r17}else{break}while(1){r17=HEAP32[r34>>2];HEAP32[r34>>2]=HEAP32[r35>>2];HEAP32[r35>>2]=r17;r17=r34+4|0;r29=r35-4|0;if(r17>>>0<r29>>>0){r34=r17;r35=r29}else{break}}}}while(0);L2075:do{if(r22>>>0<r3>>>0){r35=r7;r34=r22;while(1){r23=HEAP8[r34];if(r23<<24>>24==46){break}r31=FUNCTION_TABLE[HEAP32[HEAP32[r35>>2]+44>>2]](r16,r23);r23=HEAP32[r8];HEAP32[r8]=r23+4;HEAP32[r23>>2]=r31;r31=r34+1|0;if(r31>>>0<r3>>>0){r34=r31}else{r36=r31;break L2075}}r35=FUNCTION_TABLE[HEAP32[HEAP32[r10]+12>>2]](r18);r31=HEAP32[r8];HEAP32[r8]=r31+4;HEAP32[r31>>2]=r35;r36=r34+1|0}else{r36=r22}}while(0);FUNCTION_TABLE[HEAP32[HEAP32[r12]+48>>2]](r16,r36,r3,HEAP32[r8]);r16=(r19-r36<<2)+HEAP32[r8]|0;HEAP32[r8]=r16;if((r2|0)==(r3|0)){r37=r16}else{r37=(r2-r1<<2)+r4|0}HEAP32[r5>>2]=r37;if((HEAP8[r21]&1)==0){STACKTOP=r9;return}__ZdlPv(HEAP32[r14+8>>2]);STACKTOP=r9;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwe(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+320|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7;r9=r7+8;r10=r7+40,r11=r10>>2;r12=r7+48;r13=r7+280;r14=r7+288;r15=r7+296;r16=r7+304;r17=r7+312;HEAP32[r8>>2]=37;HEAP32[r8+4>>2]=0;r18=r8;r8=r18+1|0;r19=r4+4|0;r20=HEAP32[r19>>2];if((r20&2048|0)==0){r21=r8}else{HEAP8[r8]=43;r21=r18+2|0}if((r20&1024|0)==0){r22=r21}else{HEAP8[r21]=35;r22=r21+1|0}r21=r20&260;r8=r20>>>14;do{if((r21|0)==260){HEAP8[r22]=76;r20=r22+1|0;if((r8&1|0)==0){HEAP8[r20]=97;r23=0;break}else{HEAP8[r20]=65;r23=0;break}}else{HEAP8[r22]=46;HEAP8[r22+1|0]=42;HEAP8[r22+2|0]=76;r20=r22+3|0;if((r21|0)==256){if((r8&1|0)==0){HEAP8[r20]=101;r23=1;break}else{HEAP8[r20]=69;r23=1;break}}else if((r21|0)==4){if((r8&1|0)==0){HEAP8[r20]=102;r23=1;break}else{HEAP8[r20]=70;r23=1;break}}else{if((r8&1|0)==0){HEAP8[r20]=103;r23=1;break}else{HEAP8[r20]=71;r23=1;break}}}}while(0);r8=r9|0;HEAP32[r11]=r8;if(HEAP8[19176]){r24=HEAP32[2246]}else{r9=_newlocale(1,2896,0);HEAP32[2246]=r9;HEAP8[19176]=1;r24=r9}if(r23){r25=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r24,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{r25=__ZNSt3__112__snprintf_lEPcjPvPKcz(r8,30,r24,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}do{if((r25|0)>29){r24=HEAP8[19176];if(r23){if(r24){r26=HEAP32[2246]}else{r9=_newlocale(1,2896,0);HEAP32[2246]=r9;HEAP8[19176]=1;r26=r9}r27=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r26,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+16|0,HEAP32[tempInt>>2]=HEAP32[r4+8>>2],HEAPF64[tempInt+8>>3]=r6,tempInt))}else{if(r24){r28=HEAP32[2246]}else{r24=_newlocale(1,2896,0);HEAP32[2246]=r24;HEAP8[19176]=1;r28=r24}r27=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r28,r18,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r6,tempInt))}r24=HEAP32[r11];if((r24|0)!=0){r29=r27;r30=r24;r31=r24;break}r24=___cxa_allocate_exception(4);HEAP32[r24>>2]=9976;___cxa_throw(r24,16104,66)}else{r29=r25;r30=0;r31=HEAP32[r11]}}while(0);r25=r31+r29|0;r27=HEAP32[r19>>2]&176;do{if((r27|0)==32){r32=r25}else if((r27|0)==16){r19=HEAP8[r31];if(r19<<24>>24==45|r19<<24>>24==43){r32=r31+1|0;break}if(!((r29|0)>1&r19<<24>>24==48)){r2=1799;break}r19=HEAP8[r31+1|0];if(!(r19<<24>>24==120|r19<<24>>24==88)){r2=1799;break}r32=r31+2|0}else{r2=1799}}while(0);if(r2==1799){r32=r31}do{if((r31|0)==(r8|0)){r33=r12|0;r34=0;r35=r8}else{r2=_malloc(r29<<3);r27=r2;if((r2|0)!=0){r33=r27;r34=r27;r35=HEAP32[r11];break}r27=___cxa_allocate_exception(4);HEAP32[r27>>2]=9976;___cxa_throw(r27,16104,66)}}while(0);r11=r15|0;r29=HEAP32[r4+28>>2];HEAP32[r11>>2]=r29;r8=r29+4|0;tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+1,tempValue;__ZNSt3__19__num_putIwE23__widen_and_group_floatEPcS2_S2_PwRS3_S4_RKNS_6localeE(r35,r32,r25,r33,r13,r14,r15);r15=HEAP32[r11>>2];r11=r15+4|0;if(((tempValue=HEAP32[r11>>2],HEAP32[r11>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+8>>2]](r15|0)}r15=r3|0;HEAP32[r17>>2]=HEAP32[r15>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r16,r17,r33,HEAP32[r13>>2],HEAP32[r14>>2],r4,r5);r5=HEAP32[r16>>2];HEAP32[r15>>2]=r5;HEAP32[r1>>2]=r5;if((r34|0)!=0){_free(r34)}if((r30|0)==0){STACKTOP=r7;return}_free(r30);STACKTOP=r7;return}function __ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13do_date_orderEv(r1){return 2}function __ZNSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r9,r10,r5,r6,r7,9752,9760);STACKTOP=r8;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r2+8|0;r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+20>>2]](r11);HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];r4=r12;r3=HEAP8[r12];if((r3&1)==0){r13=r4+1|0;r14=r4+1|0}else{r4=HEAP32[r12+8>>2];r13=r4;r14=r4}r4=r3&255;if((r4&1|0)==0){r15=r4>>>1}else{r15=HEAP32[r12+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r9,r10,r5,r6,r7,r14,r13+r15|0);STACKTOP=r8;return}function __ZNKSt3__17num_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPKv(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+208|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r7,r9=r8>>2;r10=r7+24;r11=r7+48;r12=r7+200;r13=r7+16|0;HEAP8[r13]=HEAP8[9768];HEAP8[r13+1|0]=HEAP8[9769|0];HEAP8[r13+2|0]=HEAP8[9770|0];HEAP8[r13+3|0]=HEAP8[9771|0];HEAP8[r13+4|0]=HEAP8[9772|0];HEAP8[r13+5|0]=HEAP8[9773|0];r14=r10|0;if(HEAP8[19176]){r15=HEAP32[2246]}else{r16=_newlocale(1,2896,0);HEAP32[2246]=r16;HEAP8[19176]=1;r15=r16}r16=__ZNSt3__111__sprintf_lEPcPvPKcz(r14,r15,r13,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r6,tempInt));r6=r10+r16|0;r13=HEAP32[r4+4>>2]&176;do{if((r13|0)==16){r15=HEAP8[r14];if(r15<<24>>24==45|r15<<24>>24==43){r17=r10+1|0;break}if(!((r16|0)>1&r15<<24>>24==48)){r2=1844;break}r15=HEAP8[r10+1|0];if(!(r15<<24>>24==120|r15<<24>>24==88)){r2=1844;break}r17=r10+2|0}else if((r13|0)==32){r17=r6}else{r2=1844}}while(0);if(r2==1844){r17=r14}r2=HEAP32[r4+28>>2],r13=r2>>2;r15=(r2+4|0)>>2;tempValue=HEAP32[r15],HEAP32[r15]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r9]=18568;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r8,252)}r8=HEAP32[4643]-1|0;r9=HEAP32[r13+2];do{if(HEAP32[r13+3]-r9>>2>>>0>r8>>>0){r18=HEAP32[r9+(r8<<2)>>2];if((r18|0)==0){break}if(((tempValue=HEAP32[r15],HEAP32[r15]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r13]+8>>2]](r2)}r19=r11|0;FUNCTION_TABLE[HEAP32[HEAP32[r18>>2]+48>>2]](r18,r14,r6,r19);r18=(r16<<2)+r11|0;if((r17|0)==(r6|0)){r20=r18;r21=r3|0;r22=HEAP32[r21>>2];r23=r12|0;HEAP32[r23>>2]=r22;__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r12,r19,r20,r18,r4,r5);STACKTOP=r7;return}r20=(r17-r10<<2)+r11|0;r21=r3|0;r22=HEAP32[r21>>2];r23=r12|0;HEAP32[r23>>2]=r22;__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r12,r19,r20,r18,r4,r5);STACKTOP=r7;return}}while(0);r7=___cxa_allocate_exception(4);HEAP32[r7>>2]=10008;___cxa_throw(r7,16120,514)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60;r10=r6>>2;r11=0;r12=STACKTOP;STACKTOP=STACKTOP+40|0;r13=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r13>>2];r13=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r13>>2];r13=r12,r14=r13>>2;r15=r12+16;r16=r12+24;r17=r12+32;r18=HEAP32[r5+28>>2],r19=r18>>2;r20=(r18+4|0)>>2;tempValue=HEAP32[r20],HEAP32[r20]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r14]=18576;HEAP32[r14+1]=24;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r13,252)}r13=HEAP32[4645]-1|0;r14=HEAP32[r19+2];do{if(HEAP32[r19+3]-r14>>2>>>0>r13>>>0){r21=HEAP32[r14+(r13<<2)>>2];if((r21|0)==0){break}r22=r21;if(((tempValue=HEAP32[r20],HEAP32[r20]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r19]+8>>2]](r18)}HEAP32[r10]=0;r23=(r3|0)>>2;L2229:do{if((r8|0)==(r9|0)){r11=1931}else{r24=(r4|0)>>2;r25=r21>>2;r26=r21+8|0;r27=r21;r28=r2;r29=r16|0;r30=r17|0;r31=r15|0;r32=r8;r33=0;L2231:while(1){r34=r33;while(1){if((r34|0)!=0){r11=1931;break L2229}r35=HEAP32[r23],r36=r35>>2;do{if((r35|0)==0){r37=0}else{if((HEAP32[r36+3]|0)!=(HEAP32[r36+4]|0)){r37=r35;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r36]+36>>2]](r35)|0)!=-1){r37=r35;break}HEAP32[r23]=0;r37=0}}while(0);r35=(r37|0)==0;r36=HEAP32[r24],r38=r36>>2;L2241:do{if((r36|0)==0){r11=1882}else{do{if((HEAP32[r38+3]|0)==(HEAP32[r38+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r36)|0)!=-1){break}HEAP32[r24]=0;r11=1882;break L2241}}while(0);if(r35){r39=r36}else{r11=1883;break L2231}}}while(0);if(r11==1882){r11=0;if(r35){r11=1883;break L2231}else{r39=0}}if(FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r22,HEAP8[r32],0)<<24>>24==37){r11=1888;break}r36=HEAP8[r32];if(r36<<24>>24>-1){r40=HEAP32[r26>>2];if((HEAP16[r40+(r36<<24>>24<<1)>>1]&8192)!=0){r41=r32;r11=1899;break}}r42=(r37+12|0)>>2;r36=HEAP32[r42];r43=r37+16|0;if((r36|0)==(HEAP32[r43>>2]|0)){r44=FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+36>>2]](r37)&255}else{r44=HEAP8[r36]}if(FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+12>>2]](r22,r44)<<24>>24==FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+12>>2]](r22,HEAP8[r32])<<24>>24){r11=1926;break}HEAP32[r10]=4;r34=4}L2259:do{if(r11==1888){r11=0;r34=r32+1|0;if((r34|0)==(r9|0)){r11=1889;break L2231}r36=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r22,HEAP8[r34],0);if(r36<<24>>24==69|r36<<24>>24==48){r38=r32+2|0;if((r38|0)==(r9|0)){r11=1892;break L2231}r45=r36;r46=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r22,HEAP8[r38],0);r47=r38}else{r45=0;r46=r36;r47=r34}r34=HEAP32[HEAP32[r28>>2]+36>>2];HEAP32[r29>>2]=r37;HEAP32[r30>>2]=r39;FUNCTION_TABLE[r34](r15,r2,r16,r17,r5,r6,r7,r46,r45);HEAP32[r23]=HEAP32[r31>>2];r48=r47+1|0}else if(r11==1899){while(1){r11=0;r34=r41+1|0;if((r34|0)==(r9|0)){r49=r9;break}r36=HEAP8[r34];if(r36<<24>>24<=-1){r49=r34;break}if((HEAP16[r40+(r36<<24>>24<<1)>>1]&8192)==0){r49=r34;break}else{r41=r34;r11=1899}}r35=r37,r34=r35>>2;r36=r39,r38=r36>>2;while(1){do{if((r35|0)==0){r50=0}else{if((HEAP32[r34+3]|0)!=(HEAP32[r34+4]|0)){r50=r35;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r34]+36>>2]](r35)|0)!=-1){r50=r35;break}HEAP32[r23]=0;r50=0}}while(0);r51=(r50|0)==0;do{if((r36|0)==0){r11=1912}else{if((HEAP32[r38+3]|0)!=(HEAP32[r38+4]|0)){if(r51){r52=r36;break}else{r48=r49;break L2259}}if((FUNCTION_TABLE[HEAP32[HEAP32[r38]+36>>2]](r36)|0)==-1){HEAP32[r24]=0;r11=1912;break}else{if(r51^(r36|0)==0){r52=r36;break}else{r48=r49;break L2259}}}}while(0);if(r11==1912){r11=0;if(r51){r48=r49;break L2259}else{r52=0}}r53=(r50+12|0)>>2;r54=HEAP32[r53];r55=r50+16|0;if((r54|0)==(HEAP32[r55>>2]|0)){r56=FUNCTION_TABLE[HEAP32[HEAP32[r50>>2]+36>>2]](r50)&255}else{r56=HEAP8[r54]}if(r56<<24>>24<=-1){r48=r49;break L2259}if((HEAP16[HEAP32[r26>>2]+(r56<<24>>24<<1)>>1]&8192)==0){r48=r49;break L2259}r54=HEAP32[r53];if((r54|0)==(HEAP32[r55>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r50>>2]+40>>2]](r50);r35=r50,r34=r35>>2;r36=r52,r38=r36>>2;continue}else{HEAP32[r53]=r54+1;r35=r50,r34=r35>>2;r36=r52,r38=r36>>2;continue}}}else if(r11==1926){r11=0;r36=HEAP32[r42];if((r36|0)==(HEAP32[r43>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+40>>2]](r37)}else{HEAP32[r42]=r36+1}r48=r32+1|0}}while(0);if((r48|0)==(r9|0)){r11=1931;break L2229}r32=r48;r33=HEAP32[r10]}if(r11==1892){HEAP32[r10]=4;r57=r37,r58=r57>>2;break}else if(r11==1889){HEAP32[r10]=4;r57=r37,r58=r57>>2;break}else if(r11==1883){HEAP32[r10]=4;r57=r37,r58=r57>>2;break}}}while(0);if(r11==1931){r57=HEAP32[r23],r58=r57>>2}r22=r3|0;do{if((r57|0)!=0){if((HEAP32[r58+3]|0)!=(HEAP32[r58+4]|0)){break}if((FUNCTION_TABLE[HEAP32[HEAP32[r58]+36>>2]](r57)|0)!=-1){break}HEAP32[r22>>2]=0}}while(0);r23=HEAP32[r22>>2];r21=(r23|0)==0;r33=r4|0;r32=HEAP32[r33>>2],r26=r32>>2;L2317:do{if((r32|0)==0){r11=1941}else{do{if((HEAP32[r26+3]|0)==(HEAP32[r26+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r32)|0)!=-1){break}HEAP32[r33>>2]=0;r11=1941;break L2317}}while(0);if(!r21){break}r59=r1|0,r60=r59>>2;HEAP32[r60]=r23;STACKTOP=r12;return}}while(0);do{if(r11==1941){if(r21){break}r59=r1|0,r60=r59>>2;HEAP32[r60]=r23;STACKTOP=r12;return}}while(0);HEAP32[r10]=HEAP32[r10]|2;r59=r1|0,r60=r59>>2;HEAP32[r60]=r23;STACKTOP=r12;return}}while(0);r12=___cxa_allocate_exception(4);HEAP32[r12>>2]=10008;___cxa_throw(r12,16120,514)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r8=STACKTOP;STACKTOP=STACKTOP+24|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=HEAP32[r5+28>>2],r5=r12>>2;r13=(r12+4|0)>>2;tempValue=HEAP32[r13],HEAP32[r13]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r11]=18576;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r10,252)}r10=HEAP32[4645]-1|0;r11=HEAP32[r5+2];do{if(HEAP32[r5+3]-r11>>2>>>0>r10>>>0){r14=HEAP32[r11+(r10<<2)>>2];if((r14|0)==0){break}if(((tempValue=HEAP32[r13],HEAP32[r13]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+8>>2]](r12)}r15=HEAP32[r4>>2];r16=r2+8|0;r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]>>2]](r16);HEAP32[r9>>2]=r15;r15=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r17,r17+168|0,r14,r6,0)-r17|0;if((r15|0)>=168){r18=r3|0;r19=HEAP32[r18>>2];r20=r1|0;HEAP32[r20>>2]=r19;STACKTOP=r8;return}HEAP32[r7+24>>2]=((r15|0)/12&-1|0)%7&-1;r18=r3|0;r19=HEAP32[r18>>2];r20=r1|0;HEAP32[r20>>2]=r19;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r8=STACKTOP;STACKTOP=STACKTOP+24|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=HEAP32[r5+28>>2],r5=r12>>2;r13=(r12+4|0)>>2;tempValue=HEAP32[r13],HEAP32[r13]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r11]=18576;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r10,252)}r10=HEAP32[4645]-1|0;r11=HEAP32[r5+2];do{if(HEAP32[r5+3]-r11>>2>>>0>r10>>>0){r14=HEAP32[r11+(r10<<2)>>2];if((r14|0)==0){break}if(((tempValue=HEAP32[r13],HEAP32[r13]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+8>>2]](r12)}r15=HEAP32[r4>>2];r16=r2+8|0;r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+4>>2]](r16);HEAP32[r9>>2]=r15;r15=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r17,r17+288|0,r14,r6,0)-r17|0;if((r15|0)>=288){r18=r3|0;r19=HEAP32[r18>>2];r20=r1|0;HEAP32[r20>>2]=r19;STACKTOP=r8;return}HEAP32[r7+16>>2]=((r15|0)/12&-1|0)%12&-1;r18=r3|0;r19=HEAP32[r18>>2];r20=r1|0;HEAP32[r20>>2]=r19;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r2=STACKTOP;STACKTOP=STACKTOP+24|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r2;r9=r2+8,r10=r9>>2;r11=HEAP32[r5+28>>2],r5=r11>>2;r12=(r11+4|0)>>2;tempValue=HEAP32[r12],HEAP32[r12]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r10]=18576;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r9,252)}r9=HEAP32[4645]-1|0;r10=HEAP32[r5+2];do{if(HEAP32[r5+3]-r10>>2>>>0>r9>>>0){r13=HEAP32[r10+(r9<<2)>>2];if((r13|0)==0){break}if(((tempValue=HEAP32[r12],HEAP32[r12]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+8>>2]](r11)}HEAP32[r8>>2]=HEAP32[r4>>2];r14=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r8,r6,r13,4);if((HEAP32[r6>>2]&4|0)!=0){r15=r3|0;r16=HEAP32[r15>>2];r17=r1|0;HEAP32[r17>>2]=r16;STACKTOP=r2;return}if((r14|0)<69){r18=r14+2e3|0}else{r18=(r14-69|0)>>>0<31?r14+1900|0:r14}HEAP32[r7+20>>2]=r18-1900;r15=r3|0;r16=HEAP32[r15>>2];r17=r1|0;HEAP32[r17>>2]=r16;STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);HEAP32[r2>>2]=10008;___cxa_throw(r2,16120,514)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68;r9=r7>>2;r10=r6>>2;r11=STACKTOP;STACKTOP=STACKTOP+320|0;r12=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r12>>2];r12=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r12>>2];r12=r11;r13=r11+8;r14=r11+16;r15=r11+24;r16=r11+32;r17=r11+40;r18=r11+48;r19=r11+56;r20=r11+64;r21=r11+72;r22=r11+80;r23=r11+88;r24=r11+96,r25=r24>>2;r26=r11+112;r27=r11+120;r28=r11+128;r29=r11+136;r30=r11+144;r31=r11+152;r32=r11+160;r33=r11+168;r34=r11+176;r35=r11+184;r36=r11+192;r37=r11+200;r38=r11+208;r39=r11+216;r40=r11+224;r41=r11+232;r42=r11+240;r43=r11+248;r44=r11+256;r45=r11+264;r46=r11+272;r47=r11+280;r48=r11+288;r49=r11+296;r50=r11+304;r51=r11+312;HEAP32[r10]=0;r52=HEAP32[r5+28>>2],r53=r52>>2;r54=(r52+4|0)>>2;tempValue=HEAP32[r54],HEAP32[r54]=tempValue+1,tempValue;if((HEAP32[4644]|0)!=-1){HEAP32[r25]=18576;HEAP32[r25+1]=24;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r24,252)}r24=HEAP32[4645]-1|0;r25=HEAP32[r53+2];do{if(HEAP32[r53+3]-r25>>2>>>0>r24>>>0){r55=HEAP32[r25+(r24<<2)>>2];if((r55|0)==0){break}r56=r55;if(((tempValue=HEAP32[r54],HEAP32[r54]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r53]+8>>2]](r52)}r55=r8<<24>>24;L2393:do{if((r55|0)==97|(r55|0)==65){r57=HEAP32[r4>>2];r58=r2+8|0;r59=FUNCTION_TABLE[HEAP32[HEAP32[r58>>2]>>2]](r58);HEAP32[r23>>2]=r57;r57=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r23,r59,r59+168|0,r56,r6,0)-r59|0;if((r57|0)>=168){break}HEAP32[r9+6]=((r57|0)/12&-1|0)%7&-1}else if((r55|0)==72){HEAP32[r20>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r20,r6,r56,2);r59=HEAP32[r10];if((r59&4|0)==0&(r57|0)<24){HEAP32[r9+2]=r57;break}else{HEAP32[r10]=r59|4;break}}else if((r55|0)==88){r59=r2+8|0;r57=FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+24>>2]](r59);r59=r3|0;HEAP32[r49>>2]=HEAP32[r59>>2];HEAP32[r50>>2]=HEAP32[r4>>2];r58=r57;r60=HEAP8[r57];if((r60&1)==0){r61=r58+1|0;r62=r58+1|0}else{r58=HEAP32[r57+8>>2];r61=r58;r62=r58}r58=r60&255;if((r58&1|0)==0){r63=r58>>>1}else{r63=HEAP32[r57+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r48,r2,r49,r50,r5,r6,r7,r62,r61+r63|0);HEAP32[r59>>2]=HEAP32[r48>>2]}else if((r55|0)==84){r59=r3|0;HEAP32[r44>>2]=HEAP32[r59>>2];HEAP32[r45>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r43,r2,r44,r45,r5,r6,r7,9704,9712);HEAP32[r59>>2]=HEAP32[r43>>2]}else if((r55|0)==119){HEAP32[r14>>2]=HEAP32[r4>>2];r59=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r14,r6,r56,1);r57=HEAP32[r10];if((r57&4|0)==0&(r59|0)<7){HEAP32[r9+6]=r59;break}else{HEAP32[r10]=r57|4;break}}else if((r55|0)==120){r57=HEAP32[HEAP32[r2>>2]+20>>2];HEAP32[r46>>2]=HEAP32[r3>>2];HEAP32[r47>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r57](r1,r2,r46,r47,r5,r6,r7);STACKTOP=r11;return}else if((r55|0)==98|(r55|0)==66|(r55|0)==104){r57=HEAP32[r4>>2];r59=r2+8|0;r58=FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+4>>2]](r59);HEAP32[r22>>2]=r57;r57=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r22,r58,r58+288|0,r56,r6,0)-r58|0;if((r57|0)>=288){break}HEAP32[r9+4]=((r57|0)/12&-1|0)%12&-1}else if((r55|0)==110|(r55|0)==116){HEAP32[r35>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIcEE(0,r3,r35,r6,r56)}else if((r55|0)==114){r57=r3|0;HEAP32[r38>>2]=HEAP32[r57>>2];HEAP32[r39>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r37,r2,r38,r39,r5,r6,r7,9720,9731);HEAP32[r57>>2]=HEAP32[r37>>2]}else if((r55|0)==82){r57=r3|0;HEAP32[r41>>2]=HEAP32[r57>>2];HEAP32[r42>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r40,r2,r41,r42,r5,r6,r7,9712,9717);HEAP32[r57>>2]=HEAP32[r40>>2]}else if((r55|0)==83){HEAP32[r15>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r15,r6,r56,2);r58=HEAP32[r10];if((r58&4|0)==0&(r57|0)<61){HEAP32[r9]=r57;break}else{HEAP32[r10]=r58|4;break}}else if((r55|0)==112){HEAP32[r36>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIcEE(r2,r7+8|0,r3,r36,r6,r56)}else if((r55|0)==106){HEAP32[r18>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r18,r6,r56,3);r57=HEAP32[r10];if((r57&4|0)==0&(r58|0)<366){HEAP32[r9+7]=r58;break}else{HEAP32[r10]=r57|4;break}}else if((r55|0)==77){HEAP32[r16>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r16,r6,r56,2);r58=HEAP32[r10];if((r58&4|0)==0&(r57|0)<60){HEAP32[r9+1]=r57;break}else{HEAP32[r10]=r58|4;break}}else if((r55|0)==68){r58=r3|0;HEAP32[r30>>2]=HEAP32[r58>>2];HEAP32[r31>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r29,r2,r30,r31,r5,r6,r7,9744,9752);HEAP32[r58>>2]=HEAP32[r29>>2]}else if((r55|0)==70){r58=r3|0;HEAP32[r33>>2]=HEAP32[r58>>2];HEAP32[r34>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r32,r2,r33,r34,r5,r6,r7,9736,9744);HEAP32[r58>>2]=HEAP32[r32>>2]}else if((r55|0)==109){HEAP32[r17>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r17,r6,r56,2)-1|0;r57=HEAP32[r10];if((r57&4|0)==0&(r58|0)<12){HEAP32[r9+4]=r58;break}else{HEAP32[r10]=r57|4;break}}else if((r55|0)==73){r57=r7+8|0;HEAP32[r19>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r19,r6,r56,2);r59=HEAP32[r10];do{if((r59&4|0)==0){if((r58-1|0)>>>0>=12){break}HEAP32[r57>>2]=r58;break L2393}}while(0);HEAP32[r10]=r59|4}else if((r55|0)==100|(r55|0)==101){r58=r7+12|0;HEAP32[r21>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r21,r6,r56,2);r60=HEAP32[r10];do{if((r60&4|0)==0){if((r57-1|0)>>>0>=31){break}HEAP32[r58>>2]=r57;break L2393}}while(0);HEAP32[r10]=r60|4}else if((r55|0)==99){r57=r2+8|0;r58=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]+12>>2]](r57);r57=r3|0;HEAP32[r27>>2]=HEAP32[r57>>2];HEAP32[r28>>2]=HEAP32[r4>>2];r59=r58;r64=HEAP8[r58];if((r64&1)==0){r65=r59+1|0;r66=r59+1|0}else{r59=HEAP32[r58+8>>2];r65=r59;r66=r59}r59=r64&255;if((r59&1|0)==0){r67=r59>>>1}else{r67=HEAP32[r58+4>>2]}__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKcSC_(r26,r2,r27,r28,r5,r6,r7,r66,r65+r67|0);HEAP32[r57>>2]=HEAP32[r26>>2]}else if((r55|0)==89){HEAP32[r12>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r12,r6,r56,4);if((HEAP32[r10]&4|0)!=0){break}HEAP32[r9+5]=r57-1900}else if((r55|0)==37){HEAP32[r51>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIcEE(0,r3,r51,r6,r56)}else if((r55|0)==121){HEAP32[r13>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r13,r6,r56,4);if((HEAP32[r10]&4|0)!=0){break}if((r57|0)<69){r68=r57+2e3|0}else{r68=(r57-69|0)>>>0<31?r57+1900|0:r57}HEAP32[r9+5]=r68-1900}else{HEAP32[r10]=HEAP32[r10]|4}}while(0);HEAP32[r1>>2]=HEAP32[r3>>2];STACKTOP=r11;return}}while(0);r11=___cxa_allocate_exception(4);HEAP32[r11>>2]=10008;___cxa_throw(r11,16120,514)}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r1=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=(r3|0)>>2;r3=r5+8|0;L2474:while(1){r5=HEAP32[r7],r8=r5>>2;do{if((r5|0)==0){r9=0}else{if((HEAP32[r8+3]|0)!=(HEAP32[r8+4]|0)){r9=r5;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r5)|0)==-1){HEAP32[r7]=0;r9=0;break}else{r9=HEAP32[r7];break}}}while(0);r5=(r9|0)==0;r8=HEAP32[r2],r10=r8>>2;L2483:do{if((r8|0)==0){r1=2086}else{do{if((HEAP32[r10+3]|0)==(HEAP32[r10+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r8)|0)!=-1){break}HEAP32[r2]=0;r1=2086;break L2483}}while(0);if(r5){r11=r8;r12=0}else{r13=r8,r14=r13>>2;r15=0;break L2474}}}while(0);if(r1==2086){r1=0;if(r5){r13=0,r14=r13>>2;r15=1;break}else{r11=0;r12=1}}r8=HEAP32[r7],r10=r8>>2;r16=HEAP32[r10+3];if((r16|0)==(HEAP32[r10+4]|0)){r17=FUNCTION_TABLE[HEAP32[HEAP32[r10]+36>>2]](r8)&255}else{r17=HEAP8[r16]}if(r17<<24>>24<=-1){r13=r11,r14=r13>>2;r15=r12;break}if((HEAP16[HEAP32[r3>>2]+(r17<<24>>24<<1)>>1]&8192)==0){r13=r11,r14=r13>>2;r15=r12;break}r16=HEAP32[r7];r8=r16+12|0;r10=HEAP32[r8>>2];if((r10|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16);continue}else{HEAP32[r8>>2]=r10+1;continue}}r12=HEAP32[r7],r11=r12>>2;do{if((r12|0)==0){r18=0}else{if((HEAP32[r11+3]|0)!=(HEAP32[r11+4]|0)){r18=r12;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+36>>2]](r12)|0)==-1){HEAP32[r7]=0;r18=0;break}else{r18=HEAP32[r7];break}}}while(0);r7=(r18|0)==0;do{if(r15){r1=2105}else{if((HEAP32[r14+3]|0)!=(HEAP32[r14+4]|0)){if(!(r7^(r13|0)==0)){break}STACKTOP=r6;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r13)|0)==-1){HEAP32[r2]=0;r1=2105;break}if(!r7){break}STACKTOP=r6;return}}while(0);do{if(r1==2105){if(r7){break}STACKTOP=r6;return}}while(0);HEAP32[r4>>2]=HEAP32[r4>>2]|2;STACKTOP=r6;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11;r7=STACKTOP;STACKTOP=STACKTOP+8|0;r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r7;r9=r1+8|0;r1=FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+8>>2]](r9);r9=HEAPU8[r1];if((r9&1|0)==0){r10=r9>>>1}else{r10=HEAP32[r1+4>>2]}r9=HEAPU8[r1+12|0];if((r9&1|0)==0){r11=r9>>>1}else{r11=HEAP32[r1+16>>2]}if((r10|0)==(-r11|0)){HEAP32[r5>>2]=HEAP32[r5>>2]|4;STACKTOP=r7;return}HEAP32[r8>>2]=HEAP32[r4>>2];r4=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEPKNS_12basic_stringIcS3_NS_9allocatorIcEEEENS_5ctypeIcEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r8,r1,r1+24|0,r6,r5,0);r5=r4-r1|0;do{if((r4|0)==(r1|0)){if((HEAP32[r2>>2]|0)!=12){break}HEAP32[r2>>2]=0;STACKTOP=r7;return}}while(0);if((r5|0)!=12){STACKTOP=r7;return}r5=HEAP32[r2>>2];if((r5|0)>=12){STACKTOP=r7;return}HEAP32[r2>>2]=r5+12;STACKTOP=r7;return}function __ZNKSt3__18time_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIcEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;r1=r4>>2;r4=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=HEAP32[r7],r8=r2>>2;do{if((r2|0)==0){r9=0}else{if((HEAP32[r8+3]|0)!=(HEAP32[r8+4]|0)){r9=r2;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r2)|0)==-1){HEAP32[r7]=0;r9=0;break}else{r9=HEAP32[r7];break}}}while(0);r2=(r9|0)==0;r9=(r3|0)>>2;r3=HEAP32[r9],r8=r3>>2;L2557:do{if((r3|0)==0){r4=2143}else{do{if((HEAP32[r8+3]|0)==(HEAP32[r8+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r3)|0)!=-1){break}HEAP32[r9]=0;r4=2143;break L2557}}while(0);if(r2){r10=r3,r11=r10>>2;r12=0}else{r4=2144}}}while(0);if(r4==2143){if(r2){r4=2144}else{r10=0,r11=r10>>2;r12=1}}if(r4==2144){HEAP32[r1]=HEAP32[r1]|6;STACKTOP=r6;return}r2=HEAP32[r7],r3=r2>>2;r8=HEAP32[r3+3];if((r8|0)==(HEAP32[r3+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r3]+36>>2]](r2)&255}else{r13=HEAP8[r8]}if(FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+36>>2]](r5,r13,0)<<24>>24!=37){HEAP32[r1]=HEAP32[r1]|4;STACKTOP=r6;return}r13=HEAP32[r7];r5=r13+12|0;r8=HEAP32[r5>>2];if((r8|0)==(HEAP32[r13+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+40>>2]](r13)}else{HEAP32[r5>>2]=r8+1}r8=HEAP32[r7],r5=r8>>2;do{if((r8|0)==0){r14=0}else{if((HEAP32[r5+3]|0)!=(HEAP32[r5+4]|0)){r14=r8;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r5]+36>>2]](r8)|0)==-1){HEAP32[r7]=0;r14=0;break}else{r14=HEAP32[r7];break}}}while(0);r7=(r14|0)==0;do{if(r12){r4=2163}else{if((HEAP32[r11+3]|0)!=(HEAP32[r11+4]|0)){if(!(r7^(r10|0)==0)){break}STACKTOP=r6;return}if((FUNCTION_TABLE[HEAP32[HEAP32[r11]+36>>2]](r10)|0)==-1){HEAP32[r9]=0;r4=2163;break}if(!r7){break}STACKTOP=r6;return}}while(0);do{if(r4==2163){if(r7){break}STACKTOP=r6;return}}while(0);HEAP32[r1]=HEAP32[r1]|2;STACKTOP=r6;return}function __ZNSt3__120__get_up_to_n_digitsIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32;r6=r3>>2;r3=0;r7=STACKTOP;r8=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r8>>2];r8=(r1|0)>>2;r1=HEAP32[r8],r9=r1>>2;do{if((r1|0)==0){r10=0}else{if((HEAP32[r9+3]|0)!=(HEAP32[r9+4]|0)){r10=r1;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r1)|0)==-1){HEAP32[r8]=0;r10=0;break}else{r10=HEAP32[r8];break}}}while(0);r1=(r10|0)==0;r10=(r2|0)>>2;r2=HEAP32[r10],r9=r2>>2;L2611:do{if((r2|0)==0){r3=2183}else{do{if((HEAP32[r9+3]|0)==(HEAP32[r9+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r2)|0)!=-1){break}HEAP32[r10]=0;r3=2183;break L2611}}while(0);if(r1){r11=r2}else{r3=2184}}}while(0);if(r3==2183){if(r1){r3=2184}else{r11=0}}if(r3==2184){HEAP32[r6]=HEAP32[r6]|6;r12=0;STACKTOP=r7;return r12}r1=HEAP32[r8],r2=r1>>2;r9=HEAP32[r2+3];if((r9|0)==(HEAP32[r2+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r1)&255}else{r13=HEAP8[r9]}do{if(r13<<24>>24>-1){r9=r4+8|0;if((HEAP16[HEAP32[r9>>2]+(r13<<24>>24<<1)>>1]&2048)==0){break}r1=r4;r2=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r4,r13,0)<<24>>24;r14=HEAP32[r8];r15=r14+12|0;r16=HEAP32[r15>>2];if((r16|0)==(HEAP32[r14+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+40>>2]](r14);r17=r2;r18=r5;r19=r11,r20=r19>>2}else{HEAP32[r15>>2]=r16+1;r17=r2;r18=r5;r19=r11,r20=r19>>2}while(1){r21=r17-48|0;r2=r18-1|0;r16=HEAP32[r8],r15=r16>>2;do{if((r16|0)==0){r22=0}else{if((HEAP32[r15+3]|0)!=(HEAP32[r15+4]|0)){r22=r16;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r15]+36>>2]](r16)|0)==-1){HEAP32[r8]=0;r22=0;break}else{r22=HEAP32[r8];break}}}while(0);r16=(r22|0)==0;if((r19|0)==0){r23=r22,r24=r23>>2;r25=0,r26=r25>>2}else{do{if((HEAP32[r20+3]|0)==(HEAP32[r20+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r19)|0)!=-1){r27=r19;break}HEAP32[r10]=0;r27=0}else{r27=r19}}while(0);r23=HEAP32[r8],r24=r23>>2;r25=r27,r26=r25>>2}r28=(r25|0)==0;if(!((r16^r28)&(r2|0)>0)){r3=2213;break}r15=HEAP32[r24+3];if((r15|0)==(HEAP32[r24+4]|0)){r29=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r23)&255}else{r29=HEAP8[r15]}if(r29<<24>>24<=-1){r12=r21;r3=2232;break}if((HEAP16[HEAP32[r9>>2]+(r29<<24>>24<<1)>>1]&2048)==0){r12=r21;r3=2228;break}r15=(FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r4,r29,0)<<24>>24)+(r21*10&-1)|0;r14=HEAP32[r8];r30=r14+12|0;r31=HEAP32[r30>>2];if((r31|0)==(HEAP32[r14+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r14>>2]+40>>2]](r14);r17=r15;r18=r2;r19=r25,r20=r19>>2;continue}else{HEAP32[r30>>2]=r31+1;r17=r15;r18=r2;r19=r25,r20=r19>>2;continue}}if(r3==2213){do{if((r23|0)==0){r32=0}else{if((HEAP32[r24+3]|0)!=(HEAP32[r24+4]|0)){r32=r23;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r23)|0)==-1){HEAP32[r8]=0;r32=0;break}else{r32=HEAP32[r8];break}}}while(0);r1=(r32|0)==0;L2668:do{if(r28){r3=2223}else{do{if((HEAP32[r26+3]|0)==(HEAP32[r26+4]|0)){if((FUNCTION_TABLE[HEAP32[HEAP32[r26]+36>>2]](r25)|0)!=-1){break}HEAP32[r10]=0;r3=2223;break L2668}}while(0);if(r1){r12=r21}else{break}STACKTOP=r7;return r12}}while(0);do{if(r3==2223){if(r1){break}else{r12=r21}STACKTOP=r7;return r12}}while(0);HEAP32[r6]=HEAP32[r6]|2;r12=r21;STACKTOP=r7;return r12}else if(r3==2228){STACKTOP=r7;return r12}else if(r3==2232){STACKTOP=r7;return r12}}}while(0);HEAP32[r6]=HEAP32[r6]|4;r12=0;STACKTOP=r7;return r12}function __ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13do_date_orderEv(r1){return 2}function __ZNSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_timeES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r9,r10,r5,r6,r7,9672,9704);STACKTOP=r8;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_dateES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15;r8=STACKTOP;STACKTOP=STACKTOP+16|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8;r11=r2+8|0;r12=FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+20>>2]](r11);HEAP32[r9>>2]=HEAP32[r3>>2];HEAP32[r10>>2]=HEAP32[r4>>2];r4=HEAP8[r12];if((r4&1)==0){r13=r12+4|0;r14=r12+4|0}else{r3=HEAP32[r12+8>>2];r13=r3;r14=r3}r3=r4&255;if((r3&1|0)==0){r15=r3>>>1}else{r15=HEAP32[r12+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r9,r10,r5,r6,r7,r14,(r15<<2)+r13|0);STACKTOP=r8;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66;r10=r6>>2;r11=0;r12=STACKTOP;STACKTOP=STACKTOP+40|0;r13=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r13>>2];r13=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r13>>2];r13=r12,r14=r13>>2;r15=r12+16;r16=r12+24;r17=r12+32;r18=HEAP32[r5+28>>2],r19=r18>>2;r20=(r18+4|0)>>2;tempValue=HEAP32[r20],HEAP32[r20]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r14]=18568;HEAP32[r14+1]=24;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r13,252)}r13=HEAP32[4643]-1|0;r14=HEAP32[r19+2];do{if(HEAP32[r19+3]-r14>>2>>>0>r13>>>0){r21=HEAP32[r14+(r13<<2)>>2];if((r21|0)==0){break}r22=r21;if(((tempValue=HEAP32[r20],HEAP32[r20]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r19]+8>>2]](r18)}HEAP32[r10]=0;r23=(r3|0)>>2;L2707:do{if((r8|0)==(r9|0)){r11=2318}else{r24=(r4|0)>>2;r25=r21>>2;r26=r21>>2;r27=r21;r28=r2;r29=r16|0;r30=r17|0;r31=r15|0;r32=r8,r33=r32>>2;r34=0;L2709:while(1){r35=r34;while(1){if((r35|0)!=0){r11=2318;break L2707}r36=HEAP32[r23],r37=r36>>2;do{if((r36|0)==0){r38=0}else{r39=HEAP32[r37+3];if((r39|0)==(HEAP32[r37+4]|0)){r40=FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r36)}else{r40=HEAP32[r39>>2]}if((r40|0)!=-1){r38=r36;break}HEAP32[r23]=0;r38=0}}while(0);r36=(r38|0)==0;r37=HEAP32[r24],r39=r37>>2;do{if((r37|0)==0){r11=2268}else{r41=HEAP32[r39+3];if((r41|0)==(HEAP32[r39+4]|0)){r42=FUNCTION_TABLE[HEAP32[HEAP32[r39]+36>>2]](r37)}else{r42=HEAP32[r41>>2]}if((r42|0)==-1){HEAP32[r24]=0;r11=2268;break}else{if(r36^(r37|0)==0){r43=r37;break}else{r11=2270;break L2709}}}}while(0);if(r11==2268){r11=0;if(r36){r11=2270;break L2709}else{r43=0}}if(FUNCTION_TABLE[HEAP32[HEAP32[r25]+52>>2]](r22,HEAP32[r33],0)<<24>>24==37){r11=2275;break}if(FUNCTION_TABLE[HEAP32[HEAP32[r26]+12>>2]](r22,8192,HEAP32[r33])){r44=r32;r11=2285;break}r45=(r38+12|0)>>2;r37=HEAP32[r45];r46=r38+16|0;if((r37|0)==(HEAP32[r46>>2]|0)){r47=FUNCTION_TABLE[HEAP32[HEAP32[r38>>2]+36>>2]](r38)}else{r47=HEAP32[r37>>2]}if((FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+28>>2]](r22,r47)|0)==(FUNCTION_TABLE[HEAP32[HEAP32[r27>>2]+28>>2]](r22,HEAP32[r33])|0)){r11=2313;break}HEAP32[r10]=4;r35=4}L2741:do{if(r11==2313){r11=0;r35=HEAP32[r45];if((r35|0)==(HEAP32[r46>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r38>>2]+40>>2]](r38)}else{HEAP32[r45]=r35+4}r48=r32+4|0}else if(r11==2275){r11=0;r35=r32+4|0;if((r35|0)==(r9|0)){r11=2276;break L2709}r37=FUNCTION_TABLE[HEAP32[HEAP32[r25]+52>>2]](r22,HEAP32[r35>>2],0);if(r37<<24>>24==69|r37<<24>>24==48){r39=r32+8|0;if((r39|0)==(r9|0)){r11=2279;break L2709}r49=r37;r50=FUNCTION_TABLE[HEAP32[HEAP32[r25]+52>>2]](r22,HEAP32[r39>>2],0);r51=r39}else{r49=0;r50=r37;r51=r35}r35=HEAP32[HEAP32[r28>>2]+36>>2];HEAP32[r29>>2]=r38;HEAP32[r30>>2]=r43;FUNCTION_TABLE[r35](r15,r2,r16,r17,r5,r6,r7,r50,r49);HEAP32[r23]=HEAP32[r31>>2];r48=r51+4|0}else if(r11==2285){while(1){r11=0;r35=r44+4|0;if((r35|0)==(r9|0)){r52=r9;break}if(FUNCTION_TABLE[HEAP32[HEAP32[r26]+12>>2]](r22,8192,HEAP32[r35>>2])){r44=r35;r11=2285}else{r52=r35;break}}r36=r38,r35=r36>>2;r37=r43,r39=r37>>2;while(1){do{if((r36|0)==0){r53=0}else{r41=HEAP32[r35+3];if((r41|0)==(HEAP32[r35+4]|0)){r54=FUNCTION_TABLE[HEAP32[HEAP32[r35]+36>>2]](r36)}else{r54=HEAP32[r41>>2]}if((r54|0)!=-1){r53=r36;break}HEAP32[r23]=0;r53=0}}while(0);r41=(r53|0)==0;do{if((r37|0)==0){r11=2300}else{r55=HEAP32[r39+3];if((r55|0)==(HEAP32[r39+4]|0)){r56=FUNCTION_TABLE[HEAP32[HEAP32[r39]+36>>2]](r37)}else{r56=HEAP32[r55>>2]}if((r56|0)==-1){HEAP32[r24]=0;r11=2300;break}else{if(r41^(r37|0)==0){r57=r37;break}else{r48=r52;break L2741}}}}while(0);if(r11==2300){r11=0;if(r41){r48=r52;break L2741}else{r57=0}}r55=(r53+12|0)>>2;r58=HEAP32[r55];r59=r53+16|0;if((r58|0)==(HEAP32[r59>>2]|0)){r60=FUNCTION_TABLE[HEAP32[HEAP32[r53>>2]+36>>2]](r53)}else{r60=HEAP32[r58>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r26]+12>>2]](r22,8192,r60)){r48=r52;break L2741}r58=HEAP32[r55];if((r58|0)==(HEAP32[r59>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r53>>2]+40>>2]](r53);r36=r53,r35=r36>>2;r37=r57,r39=r37>>2;continue}else{HEAP32[r55]=r58+4;r36=r53,r35=r36>>2;r37=r57,r39=r37>>2;continue}}}}while(0);if((r48|0)==(r9|0)){r11=2318;break L2707}r32=r48,r33=r32>>2;r34=HEAP32[r10]}if(r11==2270){HEAP32[r10]=4;r61=r38,r62=r61>>2;break}else if(r11==2276){HEAP32[r10]=4;r61=r38,r62=r61>>2;break}else if(r11==2279){HEAP32[r10]=4;r61=r38,r62=r61>>2;break}}}while(0);if(r11==2318){r61=HEAP32[r23],r62=r61>>2}r22=r3|0;do{if((r61|0)!=0){r21=HEAP32[r62+3];if((r21|0)==(HEAP32[r62+4]|0)){r63=FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r61)}else{r63=HEAP32[r21>>2]}if((r63|0)!=-1){break}HEAP32[r22>>2]=0}}while(0);r23=HEAP32[r22>>2];r21=(r23|0)==0;r34=r4|0;r32=HEAP32[r34>>2],r33=r32>>2;do{if((r32|0)==0){r11=2331}else{r26=HEAP32[r33+3];if((r26|0)==(HEAP32[r33+4]|0)){r64=FUNCTION_TABLE[HEAP32[HEAP32[r33]+36>>2]](r32)}else{r64=HEAP32[r26>>2]}if((r64|0)==-1){HEAP32[r34>>2]=0;r11=2331;break}if(!(r21^(r32|0)==0)){break}r65=r1|0,r66=r65>>2;HEAP32[r66]=r23;STACKTOP=r12;return}}while(0);do{if(r11==2331){if(r21){break}r65=r1|0,r66=r65>>2;HEAP32[r66]=r23;STACKTOP=r12;return}}while(0);HEAP32[r10]=HEAP32[r10]|2;r65=r1|0,r66=r65>>2;HEAP32[r66]=r23;STACKTOP=r12;return}}while(0);r12=___cxa_allocate_exception(4);HEAP32[r12>>2]=10008;___cxa_throw(r12,16120,514)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE14do_get_weekdayES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r8=STACKTOP;STACKTOP=STACKTOP+24|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=HEAP32[r5+28>>2],r5=r12>>2;r13=(r12+4|0)>>2;tempValue=HEAP32[r13],HEAP32[r13]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r11]=18568;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r10,252)}r10=HEAP32[4643]-1|0;r11=HEAP32[r5+2];do{if(HEAP32[r5+3]-r11>>2>>>0>r10>>>0){r14=HEAP32[r11+(r10<<2)>>2];if((r14|0)==0){break}if(((tempValue=HEAP32[r13],HEAP32[r13]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+8>>2]](r12)}r15=HEAP32[r4>>2];r16=r2+8|0;r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]>>2]](r16);HEAP32[r9>>2]=r15;r15=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r17,r17+168|0,r14,r6,0)-r17|0;if((r15|0)>=168){r18=r3|0;r19=HEAP32[r18>>2];r20=r1|0;HEAP32[r20>>2]=r19;STACKTOP=r8;return}HEAP32[r7+24>>2]=((r15|0)/12&-1|0)%7&-1;r18=r3|0;r19=HEAP32[r18>>2];r20=r1|0;HEAP32[r20>>2]=r19;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE16do_get_monthnameES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r8=STACKTOP;STACKTOP=STACKTOP+24|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r9>>2];r9=r8;r10=r8+8,r11=r10>>2;r12=HEAP32[r5+28>>2],r5=r12>>2;r13=(r12+4|0)>>2;tempValue=HEAP32[r13],HEAP32[r13]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r11]=18568;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r10,252)}r10=HEAP32[4643]-1|0;r11=HEAP32[r5+2];do{if(HEAP32[r5+3]-r11>>2>>>0>r10>>>0){r14=HEAP32[r11+(r10<<2)>>2];if((r14|0)==0){break}if(((tempValue=HEAP32[r13],HEAP32[r13]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+8>>2]](r12)}r15=HEAP32[r4>>2];r16=r2+8|0;r17=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+4>>2]](r16);HEAP32[r9>>2]=r15;r15=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r9,r17,r17+288|0,r14,r6,0)-r17|0;if((r15|0)>=288){r18=r3|0;r19=HEAP32[r18>>2];r20=r1|0;HEAP32[r20>>2]=r19;STACKTOP=r8;return}HEAP32[r7+16>>2]=((r15|0)/12&-1|0)%12&-1;r18=r3|0;r19=HEAP32[r18>>2];r20=r1|0;HEAP32[r20>>2]=r19;STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11do_get_yearES4_S4_RNS_8ios_baseERjP2tm(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18;r2=STACKTOP;STACKTOP=STACKTOP+24|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r2;r9=r2+8,r10=r9>>2;r11=HEAP32[r5+28>>2],r5=r11>>2;r12=(r11+4|0)>>2;tempValue=HEAP32[r12],HEAP32[r12]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r10]=18568;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r9,252)}r9=HEAP32[4643]-1|0;r10=HEAP32[r5+2];do{if(HEAP32[r5+3]-r10>>2>>>0>r9>>>0){r13=HEAP32[r10+(r9<<2)>>2];if((r13|0)==0){break}if(((tempValue=HEAP32[r12],HEAP32[r12]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r5]+8>>2]](r11)}HEAP32[r8>>2]=HEAP32[r4>>2];r14=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r8,r6,r13,4);if((HEAP32[r6>>2]&4|0)!=0){r15=r3|0;r16=HEAP32[r15>>2];r17=r1|0;HEAP32[r17>>2]=r16;STACKTOP=r2;return}if((r14|0)<69){r18=r14+2e3|0}else{r18=(r14-69|0)>>>0<31?r14+1900|0:r14}HEAP32[r7+20>>2]=r18-1900;r15=r3|0;r16=HEAP32[r15>>2];r17=r1|0;HEAP32[r17>>2]=r16;STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);HEAP32[r2>>2]=10008;___cxa_throw(r2,16120,514)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_RNS_8ios_baseERjP2tmcc(r1,r2,r3,r4,r5,r6,r7,r8,r9){var r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68;r9=r7>>2;r10=r6>>2;r11=STACKTOP;STACKTOP=STACKTOP+320|0;r12=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r12>>2];r12=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r12>>2];r12=r11;r13=r11+8;r14=r11+16;r15=r11+24;r16=r11+32;r17=r11+40;r18=r11+48;r19=r11+56;r20=r11+64;r21=r11+72;r22=r11+80;r23=r11+88;r24=r11+96,r25=r24>>2;r26=r11+112;r27=r11+120;r28=r11+128;r29=r11+136;r30=r11+144;r31=r11+152;r32=r11+160;r33=r11+168;r34=r11+176;r35=r11+184;r36=r11+192;r37=r11+200;r38=r11+208;r39=r11+216;r40=r11+224;r41=r11+232;r42=r11+240;r43=r11+248;r44=r11+256;r45=r11+264;r46=r11+272;r47=r11+280;r48=r11+288;r49=r11+296;r50=r11+304;r51=r11+312;HEAP32[r10]=0;r52=HEAP32[r5+28>>2],r53=r52>>2;r54=(r52+4|0)>>2;tempValue=HEAP32[r54],HEAP32[r54]=tempValue+1,tempValue;if((HEAP32[4642]|0)!=-1){HEAP32[r25]=18568;HEAP32[r25+1]=24;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r24,252)}r24=HEAP32[4643]-1|0;r25=HEAP32[r53+2];do{if(HEAP32[r53+3]-r25>>2>>>0>r24>>>0){r55=HEAP32[r25+(r24<<2)>>2];if((r55|0)==0){break}r56=r55;if(((tempValue=HEAP32[r54],HEAP32[r54]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r53]+8>>2]](r52)}r55=r8<<24>>24;L2883:do{if((r55|0)==84){r57=r3|0;HEAP32[r44>>2]=HEAP32[r57>>2];HEAP32[r45>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r43,r2,r44,r45,r5,r6,r7,9536,9568);HEAP32[r57>>2]=HEAP32[r43>>2]}else if((r55|0)==119){HEAP32[r14>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r14,r6,r56,1);r58=HEAP32[r10];if((r58&4|0)==0&(r57|0)<7){HEAP32[r9+6]=r57;break}else{HEAP32[r10]=r58|4;break}}else if((r55|0)==83){HEAP32[r15>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r15,r6,r56,2);r57=HEAP32[r10];if((r57&4|0)==0&(r58|0)<61){HEAP32[r9]=r58;break}else{HEAP32[r10]=r57|4;break}}else if((r55|0)==77){HEAP32[r16>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r16,r6,r56,2);r58=HEAP32[r10];if((r58&4|0)==0&(r57|0)<60){HEAP32[r9+1]=r57;break}else{HEAP32[r10]=r58|4;break}}else if((r55|0)==120){r58=HEAP32[HEAP32[r2>>2]+20>>2];HEAP32[r46>>2]=HEAP32[r3>>2];HEAP32[r47>>2]=HEAP32[r4>>2];FUNCTION_TABLE[r58](r1,r2,r46,r47,r5,r6,r7);STACKTOP=r11;return}else if((r55|0)==88){r58=r2+8|0;r57=FUNCTION_TABLE[HEAP32[HEAP32[r58>>2]+24>>2]](r58);r58=r3|0;HEAP32[r49>>2]=HEAP32[r58>>2];HEAP32[r50>>2]=HEAP32[r4>>2];r59=HEAP8[r57];if((r59&1)==0){r60=r57+4|0;r61=r57+4|0}else{r62=HEAP32[r57+8>>2];r60=r62;r61=r62}r62=r59&255;if((r62&1|0)==0){r63=r62>>>1}else{r63=HEAP32[r57+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r48,r2,r49,r50,r5,r6,r7,r61,(r63<<2)+r60|0);HEAP32[r58>>2]=HEAP32[r48>>2]}else if((r55|0)==72){HEAP32[r20>>2]=HEAP32[r4>>2];r58=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r20,r6,r56,2);r57=HEAP32[r10];if((r57&4|0)==0&(r58|0)<24){HEAP32[r9+2]=r58;break}else{HEAP32[r10]=r57|4;break}}else if((r55|0)==109){HEAP32[r17>>2]=HEAP32[r4>>2];r57=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r17,r6,r56,2)-1|0;r58=HEAP32[r10];if((r58&4|0)==0&(r57|0)<12){HEAP32[r9+4]=r57;break}else{HEAP32[r10]=r58|4;break}}else if((r55|0)==110|(r55|0)==116){HEAP32[r35>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIwEE(0,r3,r35,r6,r56)}else if((r55|0)==112){HEAP32[r36>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIwEE(r2,r7+8|0,r3,r36,r6,r56)}else if((r55|0)==114){r58=r3|0;HEAP32[r38>>2]=HEAP32[r58>>2];HEAP32[r39>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r37,r2,r38,r39,r5,r6,r7,9592,9636);HEAP32[r58>>2]=HEAP32[r37>>2]}else if((r55|0)==97|(r55|0)==65){r58=HEAP32[r4>>2];r57=r2+8|0;r62=FUNCTION_TABLE[HEAP32[HEAP32[r57>>2]>>2]](r57);HEAP32[r23>>2]=r58;r58=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r23,r62,r62+168|0,r56,r6,0)-r62|0;if((r58|0)>=168){break}HEAP32[r9+6]=((r58|0)/12&-1|0)%7&-1}else if((r55|0)==100|(r55|0)==101){r58=r7+12|0;HEAP32[r21>>2]=HEAP32[r4>>2];r62=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r21,r6,r56,2);r57=HEAP32[r10];do{if((r57&4|0)==0){if((r62-1|0)>>>0>=31){break}HEAP32[r58>>2]=r62;break L2883}}while(0);HEAP32[r10]=r57|4}else if((r55|0)==98|(r55|0)==66|(r55|0)==104){r62=HEAP32[r4>>2];r58=r2+8|0;r59=FUNCTION_TABLE[HEAP32[HEAP32[r58>>2]+4>>2]](r58);HEAP32[r22>>2]=r62;r62=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r22,r59,r59+288|0,r56,r6,0)-r59|0;if((r62|0)>=288){break}HEAP32[r9+4]=((r62|0)/12&-1|0)%12&-1}else if((r55|0)==106){HEAP32[r18>>2]=HEAP32[r4>>2];r62=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r18,r6,r56,3);r59=HEAP32[r10];if((r59&4|0)==0&(r62|0)<366){HEAP32[r9+7]=r62;break}else{HEAP32[r10]=r59|4;break}}else if((r55|0)==99){r59=r2+8|0;r62=FUNCTION_TABLE[HEAP32[HEAP32[r59>>2]+12>>2]](r59);r59=r3|0;HEAP32[r27>>2]=HEAP32[r59>>2];HEAP32[r28>>2]=HEAP32[r4>>2];r58=HEAP8[r62];if((r58&1)==0){r64=r62+4|0;r65=r62+4|0}else{r66=HEAP32[r62+8>>2];r64=r66;r65=r66}r66=r58&255;if((r66&1|0)==0){r67=r66>>>1}else{r67=HEAP32[r62+4>>2]}__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r26,r2,r27,r28,r5,r6,r7,r65,(r67<<2)+r64|0);HEAP32[r59>>2]=HEAP32[r26>>2]}else if((r55|0)==121){HEAP32[r13>>2]=HEAP32[r4>>2];r59=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r13,r6,r56,4);if((HEAP32[r10]&4|0)!=0){break}if((r59|0)<69){r68=r59+2e3|0}else{r68=(r59-69|0)>>>0<31?r59+1900|0:r59}HEAP32[r9+5]=r68-1900}else if((r55|0)==73){r59=r7+8|0;HEAP32[r19>>2]=HEAP32[r4>>2];r62=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r19,r6,r56,2);r66=HEAP32[r10];do{if((r66&4|0)==0){if((r62-1|0)>>>0>=12){break}HEAP32[r59>>2]=r62;break L2883}}while(0);HEAP32[r10]=r66|4}else if((r55|0)==70){r62=r3|0;HEAP32[r33>>2]=HEAP32[r62>>2];HEAP32[r34>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r32,r2,r33,r34,r5,r6,r7,9504,9536);HEAP32[r62>>2]=HEAP32[r32>>2]}else if((r55|0)==89){HEAP32[r12>>2]=HEAP32[r4>>2];r62=__ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r3,r12,r6,r56,4);if((HEAP32[r10]&4|0)!=0){break}HEAP32[r9+5]=r62-1900}else if((r55|0)==37){HEAP32[r51>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIwEE(0,r3,r51,r6,r56)}else if((r55|0)==68){r62=r3|0;HEAP32[r30>>2]=HEAP32[r62>>2];HEAP32[r31>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r29,r2,r30,r31,r5,r6,r7,9640,9672);HEAP32[r62>>2]=HEAP32[r29>>2]}else if((r55|0)==82){r62=r3|0;HEAP32[r41>>2]=HEAP32[r62>>2];HEAP32[r42>>2]=HEAP32[r4>>2];__ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE3getES4_S4_RNS_8ios_baseERjP2tmPKwSC_(r40,r2,r41,r42,r5,r6,r7,9568,9588);HEAP32[r62>>2]=HEAP32[r40>>2]}else{HEAP32[r10]=HEAP32[r10]|4}}while(0);HEAP32[r1>>2]=HEAP32[r3>>2];STACKTOP=r11;return}}while(0);r11=___cxa_allocate_exception(4);HEAP32[r11>>2]=10008;___cxa_throw(r11,16120,514)}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE17__get_white_spaceERS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r1=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=(r3|0)>>2;r3=r5;L2964:while(1){r8=HEAP32[r7],r9=r8>>2;do{if((r8|0)==0){r10=1}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r12=HEAP32[r11>>2]}if((r12|0)==-1){HEAP32[r7]=0;r10=1;break}else{r10=(HEAP32[r7]|0)==0;break}}}while(0);r8=HEAP32[r2],r9=r8>>2;do{if((r8|0)==0){r1=2480}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r13=HEAP32[r11>>2]}if((r13|0)==-1){HEAP32[r2]=0;r1=2480;break}else{r11=(r8|0)==0;if(r10^r11){r14=r8;r15=r11;break}else{r16=r8,r17=r16>>2;r18=r11;break L2964}}}}while(0);if(r1==2480){r1=0;if(r10){r16=0,r17=r16>>2;r18=1;break}else{r14=0;r15=1}}r8=HEAP32[r7],r9=r8>>2;r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r8)}else{r19=HEAP32[r11>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r3>>2]+12>>2]](r5,8192,r19)){r16=r14,r17=r16>>2;r18=r15;break}r11=HEAP32[r7];r8=r11+12|0;r9=HEAP32[r8>>2];if((r9|0)==(HEAP32[r11+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+40>>2]](r11);continue}else{HEAP32[r8>>2]=r9+4;continue}}r15=HEAP32[r7],r14=r15>>2;do{if((r15|0)==0){r20=1}else{r19=HEAP32[r14+3];if((r19|0)==(HEAP32[r14+4]|0)){r21=FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r15)}else{r21=HEAP32[r19>>2]}if((r21|0)==-1){HEAP32[r7]=0;r20=1;break}else{r20=(HEAP32[r7]|0)==0;break}}}while(0);do{if(r18){r1=2502}else{r7=HEAP32[r17+3];if((r7|0)==(HEAP32[r17+4]|0)){r22=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r16)}else{r22=HEAP32[r7>>2]}if((r22|0)==-1){HEAP32[r2]=0;r1=2502;break}if(!(r20^(r16|0)==0)){break}STACKTOP=r6;return}}while(0);do{if(r1==2502){if(r20){break}STACKTOP=r6;return}}while(0);HEAP32[r4>>2]=HEAP32[r4>>2]|2;STACKTOP=r6;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE11__get_am_pmERiRS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11;r7=STACKTOP;STACKTOP=STACKTOP+8|0;r8=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r8>>2];r8=r7;r9=r1+8|0;r1=FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+8>>2]](r9);r9=HEAPU8[r1];if((r9&1|0)==0){r10=r9>>>1}else{r10=HEAP32[r1+4>>2]}r9=HEAPU8[r1+12|0];if((r9&1|0)==0){r11=r9>>>1}else{r11=HEAP32[r1+16>>2]}if((r10|0)==(-r11|0)){HEAP32[r5>>2]=HEAP32[r5>>2]|4;STACKTOP=r7;return}HEAP32[r8>>2]=HEAP32[r4>>2];r4=__ZNSt3__114__scan_keywordINS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEPKNS_12basic_stringIwS3_NS_9allocatorIwEEEENS_5ctypeIwEEEET0_RT_SE_SD_SD_RKT1_Rjb(r3,r8,r1,r1+24|0,r6,r5,0);r5=r4-r1|0;do{if((r4|0)==(r1|0)){if((HEAP32[r2>>2]|0)!=12){break}HEAP32[r2>>2]=0;STACKTOP=r7;return}}while(0);if((r5|0)!=12){STACKTOP=r7;return}r5=HEAP32[r2>>2];if((r5|0)>=12){STACKTOP=r7;return}HEAP32[r2>>2]=r5+12;STACKTOP=r7;return}function __ZNKSt3__18time_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE13__get_percentERS4_S4_RjRKNS_5ctypeIwEE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r1=r4>>2;r4=0;r6=STACKTOP;r7=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r7>>2];r7=(r2|0)>>2;r2=HEAP32[r7],r8=r2>>2;do{if((r2|0)==0){r9=1}else{r10=HEAP32[r8+3];if((r10|0)==(HEAP32[r8+4]|0)){r11=FUNCTION_TABLE[HEAP32[HEAP32[r8]+36>>2]](r2)}else{r11=HEAP32[r10>>2]}if((r11|0)==-1){HEAP32[r7]=0;r9=1;break}else{r9=(HEAP32[r7]|0)==0;break}}}while(0);r11=(r3|0)>>2;r3=HEAP32[r11],r2=r3>>2;do{if((r3|0)==0){r4=2542}else{r8=HEAP32[r2+3];if((r8|0)==(HEAP32[r2+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r3)}else{r12=HEAP32[r8>>2]}if((r12|0)==-1){HEAP32[r11]=0;r4=2542;break}else{r8=(r3|0)==0;if(r9^r8){r13=r3,r14=r13>>2;r15=r8;break}else{r4=2544;break}}}}while(0);if(r4==2542){if(r9){r4=2544}else{r13=0,r14=r13>>2;r15=1}}if(r4==2544){HEAP32[r1]=HEAP32[r1]|6;STACKTOP=r6;return}r9=HEAP32[r7],r3=r9>>2;r12=HEAP32[r3+3];if((r12|0)==(HEAP32[r3+4]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r3]+36>>2]](r9)}else{r16=HEAP32[r12>>2]}if(FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+52>>2]](r5,r16,0)<<24>>24!=37){HEAP32[r1]=HEAP32[r1]|4;STACKTOP=r6;return}r16=HEAP32[r7];r5=r16+12|0;r12=HEAP32[r5>>2];if((r12|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16)}else{HEAP32[r5>>2]=r12+4}r12=HEAP32[r7],r5=r12>>2;do{if((r12|0)==0){r17=1}else{r16=HEAP32[r5+3];if((r16|0)==(HEAP32[r5+4]|0)){r18=FUNCTION_TABLE[HEAP32[HEAP32[r5]+36>>2]](r12)}else{r18=HEAP32[r16>>2]}if((r18|0)==-1){HEAP32[r7]=0;r17=1;break}else{r17=(HEAP32[r7]|0)==0;break}}}while(0);do{if(r15){r4=2566}else{r7=HEAP32[r14+3];if((r7|0)==(HEAP32[r14+4]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r14]+36>>2]](r13)}else{r19=HEAP32[r7>>2]}if((r19|0)==-1){HEAP32[r11]=0;r4=2566;break}if(!(r17^(r13|0)==0)){break}STACKTOP=r6;return}}while(0);do{if(r4==2566){if(r17){break}STACKTOP=r6;return}}while(0);HEAP32[r1]=HEAP32[r1]|2;STACKTOP=r6;return}function __ZNSt3__120__get_up_to_n_digitsIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEEEiRT0_S5_RjRKNS_5ctypeIT_EEi(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r6=r3>>2;r3=0;r7=STACKTOP;r8=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r8>>2];r8=(r1|0)>>2;r1=HEAP32[r8],r9=r1>>2;do{if((r1|0)==0){r10=1}else{r11=HEAP32[r9+3];if((r11|0)==(HEAP32[r9+4]|0)){r12=FUNCTION_TABLE[HEAP32[HEAP32[r9]+36>>2]](r1)}else{r12=HEAP32[r11>>2]}if((r12|0)==-1){HEAP32[r8]=0;r10=1;break}else{r10=(HEAP32[r8]|0)==0;break}}}while(0);r12=(r2|0)>>2;r2=HEAP32[r12],r1=r2>>2;do{if((r2|0)==0){r3=2588}else{r9=HEAP32[r1+3];if((r9|0)==(HEAP32[r1+4]|0)){r13=FUNCTION_TABLE[HEAP32[HEAP32[r1]+36>>2]](r2)}else{r13=HEAP32[r9>>2]}if((r13|0)==-1){HEAP32[r12]=0;r3=2588;break}else{if(r10^(r2|0)==0){r14=r2;break}else{r3=2590;break}}}}while(0);if(r3==2588){if(r10){r3=2590}else{r14=0}}if(r3==2590){HEAP32[r6]=HEAP32[r6]|6;r15=0;STACKTOP=r7;return r15}r10=HEAP32[r8],r2=r10>>2;r13=HEAP32[r2+3];if((r13|0)==(HEAP32[r2+4]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r10)}else{r16=HEAP32[r13>>2]}r13=r4;if(!FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r4,2048,r16)){HEAP32[r6]=HEAP32[r6]|4;r15=0;STACKTOP=r7;return r15}r10=r4;r2=FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+52>>2]](r4,r16,0)<<24>>24;r16=HEAP32[r8];r1=r16+12|0;r9=HEAP32[r1>>2];if((r9|0)==(HEAP32[r16+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+40>>2]](r16);r17=r2;r18=r5;r19=r14,r20=r19>>2}else{HEAP32[r1>>2]=r9+4;r17=r2;r18=r5;r19=r14,r20=r19>>2}while(1){r21=r17-48|0;r14=r18-1|0;r5=HEAP32[r8],r2=r5>>2;do{if((r5|0)==0){r22=0}else{r9=HEAP32[r2+3];if((r9|0)==(HEAP32[r2+4]|0)){r23=FUNCTION_TABLE[HEAP32[HEAP32[r2]+36>>2]](r5)}else{r23=HEAP32[r9>>2]}if((r23|0)==-1){HEAP32[r8]=0;r22=0;break}else{r22=HEAP32[r8];break}}}while(0);r5=(r22|0)==0;if((r19|0)==0){r24=r22,r25=r24>>2;r26=0,r27=r26>>2}else{r2=HEAP32[r20+3];if((r2|0)==(HEAP32[r20+4]|0)){r28=FUNCTION_TABLE[HEAP32[HEAP32[r20]+36>>2]](r19)}else{r28=HEAP32[r2>>2]}if((r28|0)==-1){HEAP32[r12]=0;r29=0}else{r29=r19}r24=HEAP32[r8],r25=r24>>2;r26=r29,r27=r26>>2}r30=(r26|0)==0;if(!((r5^r30)&(r14|0)>0)){break}r5=HEAP32[r25+3];if((r5|0)==(HEAP32[r25+4]|0)){r31=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r31=HEAP32[r5>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r4,2048,r31)){r15=r21;r3=2643;break}r5=(FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+52>>2]](r4,r31,0)<<24>>24)+(r21*10&-1)|0;r2=HEAP32[r8];r9=r2+12|0;r1=HEAP32[r9>>2];if((r1|0)==(HEAP32[r2+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r2>>2]+40>>2]](r2);r17=r5;r18=r14;r19=r26,r20=r19>>2;continue}else{HEAP32[r9>>2]=r1+4;r17=r5;r18=r14;r19=r26,r20=r19>>2;continue}}if(r3==2643){STACKTOP=r7;return r15}do{if((r24|0)==0){r32=1}else{r19=HEAP32[r25+3];if((r19|0)==(HEAP32[r25+4]|0)){r33=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r24)}else{r33=HEAP32[r19>>2]}if((r33|0)==-1){HEAP32[r8]=0;r32=1;break}else{r32=(HEAP32[r8]|0)==0;break}}}while(0);do{if(r30){r3=2634}else{r8=HEAP32[r27+3];if((r8|0)==(HEAP32[r27+4]|0)){r34=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)}else{r34=HEAP32[r8>>2]}if((r34|0)==-1){HEAP32[r12]=0;r3=2634;break}if(r32^(r26|0)==0){r15=r21}else{break}STACKTOP=r7;return r15}}while(0);do{if(r3==2634){if(r32){break}else{r15=r21}STACKTOP=r7;return r15}}while(0);HEAP32[r6]=HEAP32[r6]|2;r15=r21;STACKTOP=r7;return r15}function __ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[r1+8>>2];if((r3|0)==0){__ZdlPv(r2);return}_freelocale(r3);__ZdlPv(r2);return}function __ZNSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){var r2;r2=HEAP32[r1+8>>2];if((r2|0)==0){return}_freelocale(r2);return}function __ZNSt3__110moneypunctIcLb0EED1Ev(r1){return}function __ZNKSt3__110moneypunctIcLb0EE16do_decimal_pointEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb0EE16do_thousands_sepEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb0EE14do_frac_digitsEv(r1){return 0}function __ZNSt3__110moneypunctIcLb1EED1Ev(r1){return}function __ZNKSt3__110moneypunctIcLb1EE16do_decimal_pointEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb1EE16do_thousands_sepEv(r1){return 127}function __ZNKSt3__110moneypunctIcLb1EE14do_frac_digitsEv(r1){return 0}function __ZNSt3__110moneypunctIwLb0EED1Ev(r1){return}function __ZNKSt3__110moneypunctIwLb0EE16do_decimal_pointEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb0EE16do_thousands_sepEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb0EE14do_frac_digitsEv(r1){return 0}function __ZNSt3__110moneypunctIwLb1EED1Ev(r1){return}function __ZNKSt3__110moneypunctIwLb1EE16do_decimal_pointEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb1EE16do_thousands_sepEv(r1){return 2147483647}function __ZNKSt3__110moneypunctIwLb1EE14do_frac_digitsEv(r1){return 0}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){return}function __ZNSt3__112__do_nothingEPv(r1){return}function __ZNKSt3__110moneypunctIcLb0EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb0EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb1EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb1EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb0EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb0EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb1EE13do_pos_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIwLb1EE13do_neg_formatEv(r1,r2){r2=r1;tempBigInt=67109634;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;return}function __ZNKSt3__110moneypunctIcLb0EE16do_negative_signEv(r1,r2){r2=r1;HEAP8[r1]=2;HEAP8[r2+1|0]=45;HEAP8[r2+2|0]=0;return}function __ZNKSt3__110moneypunctIcLb1EE16do_negative_signEv(r1,r2){r2=r1;HEAP8[r1]=2;HEAP8[r2+1|0]=45;HEAP8[r2+2|0]=0;return}function __ZNKSt3__110moneypunctIwLb0EE16do_negative_signEv(r1,r2){HEAP8[r1]=2;r2=r1+4|0;HEAP32[r2>>2]=45;HEAP32[r2+4>>2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE16do_negative_signEv(r1,r2){HEAP8[r1]=2;r2=r1+4|0;HEAP32[r2>>2]=45;HEAP32[r2+4>>2]=0;return}function __ZNKSt3__18time_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_RNS_8ios_baseEcPK2tmcc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r5=STACKTOP;STACKTOP=STACKTOP+112|0;r4=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r4>>2];r4=r5;r9=r5+8;r10=r9|0;r11=r4|0;HEAP8[r11]=37;r12=r4+1|0;HEAP8[r12]=r7;r13=r4+2|0;HEAP8[r13]=r8;HEAP8[r4+3|0]=0;if(r8<<24>>24!=0){HEAP8[r12]=r8;HEAP8[r13]=r7}r7=_strftime(r10,100,r11,r6,HEAP32[r2+8>>2]);r2=r9+r7|0;r9=HEAP32[r3>>2];if((r7|0)==0){r14=r9;r15=r1|0;HEAP32[r15>>2]=r14;STACKTOP=r5;return}else{r16=r9;r17=r10}while(1){r10=HEAP8[r17];if((r16|0)==0){r18=0}else{r9=r16+24|0;r7=HEAP32[r9>>2];if((r7|0)==(HEAP32[r16+28>>2]|0)){r19=FUNCTION_TABLE[HEAP32[HEAP32[r16>>2]+52>>2]](r16,r10&255)}else{HEAP32[r9>>2]=r7+1;HEAP8[r7]=r10;r19=r10&255}r18=(r19|0)==-1?0:r16}r10=r17+1|0;if((r10|0)==(r2|0)){r14=r18;break}else{r16=r18;r17=r10}}r15=r1|0;HEAP32[r15>>2]=r14;STACKTOP=r5;return}function __ZNKSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_RNS_8ios_baseEwPK2tmcc(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16;r5=STACKTOP;STACKTOP=STACKTOP+408|0;r4=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r4>>2];r4=r5;r9=r5+400;r10=r4|0;HEAP32[r9>>2]=r4+400;__ZNKSt3__110__time_put8__do_putEPwRS1_PK2tmcc(r2+8|0,r10,r9,r6,r7,r8);r8=HEAP32[r9>>2];r9=HEAP32[r3>>2];if((r10|0)==(r8|0)){r11=r9;r12=r1|0;HEAP32[r12>>2]=r11;STACKTOP=r5;return}else{r13=r9;r14=r10}while(1){r10=HEAP32[r14>>2];if((r13|0)==0){r15=0}else{r9=r13+24|0;r3=HEAP32[r9>>2];if((r3|0)==(HEAP32[r13+28>>2]|0)){r16=FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+52>>2]](r13,r10)}else{HEAP32[r9>>2]=r3+4;HEAP32[r3>>2]=r10;r16=r10}r15=(r16|0)==-1?0:r13}r10=r14+4|0;if((r10|0)==(r8|0)){r11=r15;break}else{r13=r15;r14=r10}}r12=r1|0;HEAP32[r12>>2]=r11;STACKTOP=r5;return}function __ZNSt3__110moneypunctIcLb0EED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__110moneypunctIcLb0EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb0EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb0EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNSt3__110moneypunctIcLb1EED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__110moneypunctIcLb1EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb1EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIcLb1EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNSt3__110moneypunctIwLb0EED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__110moneypunctIwLb0EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb0EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb0EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNSt3__110moneypunctIwLb1EED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__110moneypunctIwLb1EE11do_groupingEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE14do_curr_symbolEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNKSt3__110moneypunctIwLb1EE16do_positive_signEv(r1,r2){r2=r1>>2;HEAP32[r2]=0;HEAP32[r2+1]=0;HEAP32[r2+2]=0;return}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){var r2,r3;r2=r1;r3=HEAP32[r1+8>>2];if((r3|0)==0){__ZdlPv(r2);return}_freelocale(r3);__ZdlPv(r2);return}function __ZNSt3__18time_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){var r2;r2=HEAP32[r1+8>>2];if((r2|0)==0){return}_freelocale(r2);return}function __ZNKSt3__110__time_put8__do_putEPwRS1_PK2tmcc(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14;r7=STACKTOP;STACKTOP=STACKTOP+120|0;r8=r7;r9=r7+112;r10=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r11=r7+8|0;r12=r8|0;HEAP8[r12]=37;r13=r8+1|0;HEAP8[r13]=r5;r14=r8+2|0;HEAP8[r14]=r6;HEAP8[r8+3|0]=0;if(r6<<24>>24!=0){HEAP8[r13]=r6;HEAP8[r14]=r5}r5=r1|0;_strftime(r11,100,r12,r4,HEAP32[r5>>2]);HEAP32[r9>>2]=0;HEAP32[r9+4>>2]=0;HEAP32[r10>>2]=r11;r11=HEAP32[r3>>2]-r2>>2;r4=_uselocale(HEAP32[r5>>2]);r5=_mbsrtowcs(r2,r10,r11,r9);if((r4|0)!=0){_uselocale(r4)}if((r5|0)==-1){__ZNSt3__121__throw_runtime_errorEPKc(1448)}else{HEAP32[r3>>2]=(r5<<2)+r2;STACKTOP=r7;return}}function __ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r2=0;r9=STACKTOP;STACKTOP=STACKTOP+280|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+120;r14=r9+128;r15=r9+136;r16=r9+144;r17=r9+152;r18=r9+160;r19=r9+176;r20=(r13|0)>>2;HEAP32[r20]=r12;r21=r13+4|0;HEAP32[r21>>2]=420;r22=(r15|0)>>2;r23=HEAP32[r6+28>>2];HEAP32[r22]=r23;r24=r23+4|0;tempValue=HEAP32[r24>>2],HEAP32[r24>>2]=tempValue+1,tempValue;r24=HEAP32[r22];if((HEAP32[4644]|0)!=-1){HEAP32[r11]=18576;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r10,252)}r10=HEAP32[4645]-1|0;r11=HEAP32[r24+8>>2];do{if(HEAP32[r24+12>>2]-r11>>2>>>0>r10>>>0){r23=HEAP32[r11+(r10<<2)>>2];if((r23|0)==0){break}r25=r23;HEAP8[r16]=0;r26=(r4|0)>>2;HEAP32[r17>>2]=HEAP32[r26];do{if(__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r3,r17,r5,r15,HEAP32[r6+4>>2],r7,r16,r25,r13,r14,r12+100|0)){r27=r18|0;FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+32>>2]](r25,9488,9498,r27);r28=r19|0;r29=HEAP32[r14>>2];r30=HEAP32[r20];r31=r29-r30|0;do{if((r31|0)>98){r32=_malloc(r31+2|0);if((r32|0)!=0){r33=r32;r34=r32;break}r32=___cxa_allocate_exception(4);HEAP32[r32>>2]=9976;___cxa_throw(r32,16104,66)}else{r33=r28;r34=0}}while(0);if((HEAP8[r16]&1)==0){r35=r33}else{HEAP8[r33]=45;r35=r33+1|0}if(r30>>>0<r29>>>0){r31=r18+10|0;r32=r18;r36=r35;r37=r30;while(1){r38=r27;while(1){if((r38|0)==(r31|0)){r39=r31;break}if((HEAP8[r38]|0)==(HEAP8[r37]|0)){r39=r38;break}else{r38=r38+1|0}}HEAP8[r36]=HEAP8[r39-r32+9488|0];r38=r37+1|0;r40=r36+1|0;if(r38>>>0<HEAP32[r14>>2]>>>0){r36=r40;r37=r38}else{r41=r40;break}}}else{r41=r35}HEAP8[r41]=0;if((_sscanf(r28,3312,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1){if((r34|0)==0){break}_free(r34);break}r37=___cxa_allocate_exception(8);HEAP32[r37>>2]=10040;r36=r37+4|0;if((r36|0)!=0){r32=__Znaj(28),r31=r32>>2;HEAP32[r31+1]=15;HEAP32[r31]=15;r27=r32+12|0;HEAP32[r36>>2]=r27;HEAP32[r31+2]=0;_memcpy(r27,3080,16)|0}___cxa_throw(r37,16136,184)}}while(0);r25=r3|0;r23=HEAP32[r25>>2],r37=r23>>2;do{if((r23|0)==0){r42=0}else{if((HEAP32[r37+3]|0)!=(HEAP32[r37+4]|0)){r42=r23;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r23)|0)!=-1){r42=r23;break}HEAP32[r25>>2]=0;r42=0}}while(0);r25=(r42|0)==0;r23=HEAP32[r26],r37=r23>>2;do{if((r23|0)==0){r2=2790}else{if((HEAP32[r37+3]|0)!=(HEAP32[r37+4]|0)){if(r25){break}else{r2=2792;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r23)|0)==-1){HEAP32[r26]=0;r2=2790;break}else{if(r25^(r23|0)==0){break}else{r2=2792;break}}}}while(0);if(r2==2790){if(r25){r2=2792}}if(r2==2792){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r42;r23=HEAP32[r22];r26=r23+4|0;if(((tempValue=HEAP32[r26>>2],HEAP32[r26>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+8>>2]](r23|0)}r23=HEAP32[r20];HEAP32[r20]=0;if((r23|0)==0){STACKTOP=r9;return}FUNCTION_TABLE[HEAP32[r21>>2]](r23);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);HEAP32[r9>>2]=10008;___cxa_throw(r9,16120,514)}function __ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160;r12=r10>>2;r10=r6>>2;r6=0;r13=STACKTOP;STACKTOP=STACKTOP+440|0;r14=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r14>>2];r14=r13;r15=r13+400;r16=r13+408;r17=r13+416;r18=r13+424;r19=r18,r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r22=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP,r26=r25>>2;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=r14|0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r21,r29=r20>>2;r30=r22,r31=r30>>2;r32=r23,r33=r32>>2;r34=r24,r35=r34>>2;HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;HEAP32[r31]=0;HEAP32[r31+1]=0;HEAP32[r31+2]=0;HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;HEAP32[r35]=0;HEAP32[r35+1]=0;HEAP32[r35+2]=0;__ZNSt3__111__money_getIcE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_SF_Ri(r3,r4,r15,r16,r17,r18,r21,r22,r23,r25);r25=(r9|0)>>2;HEAP32[r12]=HEAP32[r25];r4=(r1|0)>>2;r1=(r2|0)>>2;r2=(r8+8|0)>>2;r8=r24+1|0;r3=(r24+8|0)>>2;r35=(r24|0)>>2;r33=(r24+4|0)>>2;r24=r23+1|0;r31=(r23+4|0)>>2;r29=(r23+8|0)>>2;r36=r22+1|0;r37=(r22+4|0)>>2;r38=(r22+8|0)>>2;r39=(r5&512|0)!=0;r5=r21+1|0;r40=(r21+4|0)>>2;r41=(r21+8|0)>>2;r21=r15+3|0;r42=(r9+4|0)>>2;r9=r18+4|0;r43=r11;r11=420;r44=r28;r45=r28;r28=r14+400|0;r14=0;r46=0;L2:while(1){r47=HEAP32[r4],r48=r47>>2;do{if((r47|0)==0){r49=0}else{if((HEAP32[r48+3]|0)!=(HEAP32[r48+4]|0)){r49=r47;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r48]+36>>2]](r47)|0)==-1){HEAP32[r4]=0;r49=0;break}else{r49=HEAP32[r4];break}}}while(0);r47=(r49|0)==0;r48=HEAP32[r1],r50=r48>>2;do{if((r48|0)==0){r6=15}else{if((HEAP32[r50+3]|0)!=(HEAP32[r50+4]|0)){if(r47){r51=r48;break}else{r52=r11;r53=r44;r54=r45;r55=r14;r6=313;break L2}}if((FUNCTION_TABLE[HEAP32[HEAP32[r50]+36>>2]](r48)|0)==-1){HEAP32[r1]=0;r6=15;break}else{if(r47){r51=r48;break}else{r52=r11;r53=r44;r54=r45;r55=r14;r6=313;break L2}}}}while(0);if(r6==15){r6=0;if(r47){r52=r11;r53=r44;r54=r45;r55=r14;r6=313;break}else{r51=0}}r48=HEAP8[r15+r46|0]|0;do{if((r48|0)==4){r50=HEAP8[r17];r56=0;r57=r28;r58=r45;r59=r44;r60=r11;r61=r43;L26:while(1){r62=HEAP32[r4],r63=r62>>2;do{if((r62|0)==0){r64=0}else{if((HEAP32[r63+3]|0)!=(HEAP32[r63+4]|0)){r64=r62;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r63]+36>>2]](r62)|0)==-1){HEAP32[r4]=0;r64=0;break}else{r64=HEAP32[r4];break}}}while(0);r62=(r64|0)==0;r63=HEAP32[r1],r65=r63>>2;do{if((r63|0)==0){r6=205}else{if((HEAP32[r65+3]|0)!=(HEAP32[r65+4]|0)){if(r62){break}else{break L26}}if((FUNCTION_TABLE[HEAP32[HEAP32[r65]+36>>2]](r63)|0)==-1){HEAP32[r1]=0;r6=205;break}else{if(r62){break}else{break L26}}}}while(0);if(r6==205){r6=0;if(r62){break}}r63=HEAP32[r4],r65=r63>>2;r66=HEAP32[r65+3];if((r66|0)==(HEAP32[r65+4]|0)){r67=FUNCTION_TABLE[HEAP32[HEAP32[r65]+36>>2]](r63)&255}else{r67=HEAP8[r66]}do{if(r67<<24>>24>-1){if((HEAP16[HEAP32[r2]+(r67<<24>>24<<1)>>1]&2048)==0){r6=225;break}r66=HEAP32[r12];if((r66|0)==(r61|0)){r63=(HEAP32[r42]|0)!=420;r65=HEAP32[r25];r68=r61-r65|0;r69=r68>>>0<2147483647?r68<<1:-1;r70=_realloc(r63?r65:0,r69);if((r70|0)==0){r6=215;break L2}do{if(r63){HEAP32[r25]=r70;r71=r70}else{r65=HEAP32[r25];HEAP32[r25]=r70;if((r65|0)==0){r71=r70;break}FUNCTION_TABLE[HEAP32[r42]](r65);r71=HEAP32[r25]}}while(0);HEAP32[r42]=216;r70=r71+r68|0;HEAP32[r12]=r70;r72=HEAP32[r25]+r69|0;r73=r70}else{r72=r61;r73=r66}HEAP32[r12]=r73+1;HEAP8[r73]=r67;r74=r56+1|0;r75=r57;r76=r58;r77=r59;r78=r60;r79=r72}else{r6=225}}while(0);if(r6==225){r6=0;r62=HEAPU8[r19];if(!((r56|0)!=0&(((r62&1|0)==0?r62>>>1:HEAP32[r9>>2])|0)!=0&r67<<24>>24==r50<<24>>24)){break}if((r58|0)==(r57|0)){r62=r58-r59|0;r70=r62>>>0<2147483647?r62<<1:-1;if((r60|0)==420){r80=0}else{r80=r59}r63=_realloc(r80,r70);r65=r63;if((r63|0)==0){r6=230;break L2}r81=(r70>>>2<<2)+r65|0;r82=(r62>>2<<2)+r65|0;r83=r65;r84=216}else{r81=r57;r82=r58;r83=r59;r84=r60}HEAP32[r82>>2]=r56;r74=0;r75=r81;r76=r82+4|0;r77=r83;r78=r84;r79=r61}r65=HEAP32[r4];r62=r65+12|0;r70=HEAP32[r62>>2];if((r70|0)==(HEAP32[r65+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r65>>2]+40>>2]](r65);r56=r74;r57=r75;r58=r76;r59=r77;r60=r78;r61=r79;continue}else{HEAP32[r62>>2]=r70+1;r56=r74;r57=r75;r58=r76;r59=r77;r60=r78;r61=r79;continue}}if((r59|0)==(r58|0)|(r56|0)==0){r85=r57;r86=r58;r87=r59;r88=r60}else{if((r58|0)==(r57|0)){r50=r58-r59|0;r70=r50>>>0<2147483647?r50<<1:-1;if((r60|0)==420){r89=0}else{r89=r59}r62=_realloc(r89,r70);r65=r62;if((r62|0)==0){r6=242;break L2}r90=(r70>>>2<<2)+r65|0;r91=(r50>>2<<2)+r65|0;r92=r65;r93=216}else{r90=r57;r91=r58;r92=r59;r93=r60}HEAP32[r91>>2]=r56;r85=r90;r86=r91+4|0;r87=r92;r88=r93}if((HEAP32[r26]|0)>0){r65=HEAP32[r4],r50=r65>>2;do{if((r65|0)==0){r94=0}else{if((HEAP32[r50+3]|0)!=(HEAP32[r50+4]|0)){r94=r65;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r50]+36>>2]](r65)|0)==-1){HEAP32[r4]=0;r94=0;break}else{r94=HEAP32[r4];break}}}while(0);r65=(r94|0)==0;r50=HEAP32[r1],r56=r50>>2;do{if((r50|0)==0){r6=259}else{if((HEAP32[r56+3]|0)!=(HEAP32[r56+4]|0)){if(r65){r95=r50;break}else{r6=266;break L2}}if((FUNCTION_TABLE[HEAP32[HEAP32[r56]+36>>2]](r50)|0)==-1){HEAP32[r1]=0;r6=259;break}else{if(r65){r95=r50;break}else{r6=266;break L2}}}}while(0);if(r6==259){r6=0;if(r65){r6=266;break L2}else{r95=0}}r50=HEAP32[r4],r56=r50>>2;r60=HEAP32[r56+3];if((r60|0)==(HEAP32[r56+4]|0)){r96=FUNCTION_TABLE[HEAP32[HEAP32[r56]+36>>2]](r50)&255}else{r96=HEAP8[r60]}if(r96<<24>>24!=(HEAP8[r16]|0)){r6=266;break L2}r60=HEAP32[r4];r50=r60+12|0;r56=HEAP32[r50>>2];if((r56|0)==(HEAP32[r60+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r60>>2]+40>>2]](r60);r97=r61;r98=r95,r99=r98>>2}else{HEAP32[r50>>2]=r56+1;r97=r61;r98=r95,r99=r98>>2}while(1){r56=HEAP32[r4],r50=r56>>2;do{if((r56|0)==0){r100=0}else{if((HEAP32[r50+3]|0)!=(HEAP32[r50+4]|0)){r100=r56;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r50]+36>>2]](r56)|0)==-1){HEAP32[r4]=0;r100=0;break}else{r100=HEAP32[r4];break}}}while(0);r56=(r100|0)==0;do{if((r98|0)==0){r6=282}else{if((HEAP32[r99+3]|0)!=(HEAP32[r99+4]|0)){if(r56){r101=r98;break}else{r6=290;break L2}}if((FUNCTION_TABLE[HEAP32[HEAP32[r99]+36>>2]](r98)|0)==-1){HEAP32[r1]=0;r6=282;break}else{if(r56){r101=r98;break}else{r6=290;break L2}}}}while(0);if(r6==282){r6=0;if(r56){r6=290;break L2}else{r101=0}}r50=HEAP32[r4],r60=r50>>2;r59=HEAP32[r60+3];if((r59|0)==(HEAP32[r60+4]|0)){r102=FUNCTION_TABLE[HEAP32[HEAP32[r60]+36>>2]](r50)&255}else{r102=HEAP8[r59]}if(r102<<24>>24<=-1){r6=290;break L2}if((HEAP16[HEAP32[r2]+(r102<<24>>24<<1)>>1]&2048)==0){r6=290;break L2}r59=HEAP32[r12];if((r59|0)==(r97|0)){r50=(HEAP32[r42]|0)!=420;r60=HEAP32[r25];r58=r97-r60|0;r57=r58>>>0<2147483647?r58<<1:-1;r70=_realloc(r50?r60:0,r57);if((r70|0)==0){r6=293;break L2}do{if(r50){HEAP32[r25]=r70;r103=r70}else{r60=HEAP32[r25];HEAP32[r25]=r70;if((r60|0)==0){r103=r70;break}FUNCTION_TABLE[HEAP32[r42]](r60);r103=HEAP32[r25]}}while(0);HEAP32[r42]=216;r70=r103+r58|0;HEAP32[r12]=r70;r104=HEAP32[r25]+r57|0;r105=r70}else{r104=r97;r105=r59}r70=HEAP32[r4],r50=r70>>2;r56=HEAP32[r50+3];if((r56|0)==(HEAP32[r50+4]|0)){r106=FUNCTION_TABLE[HEAP32[HEAP32[r50]+36>>2]](r70)&255;r107=HEAP32[r12]}else{r106=HEAP8[r56];r107=r105}HEAP32[r12]=r107+1;HEAP8[r107]=r106;r56=HEAP32[r26]-1|0;HEAP32[r26]=r56;r70=HEAP32[r4];r50=r70+12|0;r60=HEAP32[r50>>2];if((r60|0)==(HEAP32[r70+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r70>>2]+40>>2]](r70)}else{HEAP32[r50>>2]=r60+1}if((r56|0)>0){r97=r104;r98=r101,r99=r98>>2}else{r108=r104;break}}}else{r108=r61}if((HEAP32[r12]|0)==(HEAP32[r25]|0)){r6=311;break L2}else{r109=r14;r110=r85;r111=r86;r112=r87;r113=r88;r114=r108}}else if((r48|0)==1){if((r46|0)==3){r52=r11;r53=r44;r54=r45;r55=r14;r6=313;break L2}r65=HEAP32[r4],r56=r65>>2;r60=HEAP32[r56+3];if((r60|0)==(HEAP32[r56+4]|0)){r115=FUNCTION_TABLE[HEAP32[HEAP32[r56]+36>>2]](r65)&255}else{r115=HEAP8[r60]}if(r115<<24>>24<=-1){r6=67;break L2}if((HEAP16[HEAP32[r2]+(r115<<24>>24<<1)>>1]&8192)==0){r6=67;break L2}r60=HEAP32[r4];r65=r60+12|0;r56=HEAP32[r65>>2];if((r56|0)==(HEAP32[r60+16>>2]|0)){r116=FUNCTION_TABLE[HEAP32[HEAP32[r60>>2]+40>>2]](r60)&255}else{HEAP32[r65>>2]=r56+1;r116=HEAP8[r56]}r56=HEAP8[r34];if((r56&1)==0){r117=10;r118=r56}else{r56=HEAP32[r35];r117=(r56&-2)-1|0;r118=r56&255}r56=r118&255;r65=(r56&1|0)==0?r56>>>1:HEAP32[r33];if((r65|0)==(r117|0)){if((r117|0)==-3){r6=55;break L2}r56=(r118&1)==0?r8:HEAP32[r3];do{if(r117>>>0<2147483631){r60=r117+1|0;r50=r117<<1;r70=r60>>>0<r50>>>0?r50:r60;if(r70>>>0<11){r119=11;break}r119=r70+16&-16}else{r119=-2}}while(0);r61=__Znwj(r119);_memcpy(r61,r56,r117)|0;if((r117|0)!=10){__ZdlPv(r56)}HEAP32[r3]=r61;r70=r119|1;HEAP32[r35]=r70;r120=r70&255;r121=r61}else{r120=r118;r121=HEAP32[r3]}r61=(r120&1)==0?r8:r121;HEAP8[r61+r65|0]=r116;r70=r65+1|0;HEAP8[r61+r70|0]=0;if((HEAP8[r34]&1)==0){HEAP8[r34]=r70<<1&255;r6=68;break}else{HEAP32[r33]=r70;r6=68;break}}else if((r48|0)==0){r6=68}else if((r48|0)==3){r70=HEAP8[r30];r61=r70&255;r60=(r61&1|0)==0?r61>>>1:HEAP32[r37];r61=HEAP8[r32];r50=r61&255;r62=(r50&1|0)==0?r50>>>1:HEAP32[r31];if((r60|0)==(-r62|0)){r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break}r50=(r60|0)==0;r60=HEAP32[r4],r63=r60>>2;r122=HEAP32[r63+3];r123=HEAP32[r63+4];r124=(r122|0)==(r123|0);if(!(r50|(r62|0)==0)){if(r124){r62=FUNCTION_TABLE[HEAP32[HEAP32[r63]+36>>2]](r60)&255;r125=HEAP32[r4];r126=r62;r127=HEAP8[r30];r128=r125;r129=HEAP32[r125+12>>2];r130=HEAP32[r125+16>>2]}else{r126=HEAP8[r122];r127=r70;r128=r60;r129=r122;r130=r123}r123=r128+12|0;r125=(r129|0)==(r130|0);if(r126<<24>>24==(HEAP8[(r127&1)==0?r36:HEAP32[r38]]|0)){if(r125){FUNCTION_TABLE[HEAP32[HEAP32[r128>>2]+40>>2]](r128)}else{HEAP32[r123>>2]=r129+1}r123=HEAPU8[r30];r109=((r123&1|0)==0?r123>>>1:HEAP32[r37])>>>0>1?r22:r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break}if(r125){r131=FUNCTION_TABLE[HEAP32[HEAP32[r128>>2]+36>>2]](r128)&255}else{r131=HEAP8[r129]}if(r131<<24>>24!=(HEAP8[(HEAP8[r32]&1)==0?r24:HEAP32[r29]]|0)){r6=150;break L2}r125=HEAP32[r4];r123=r125+12|0;r62=HEAP32[r123>>2];if((r62|0)==(HEAP32[r125+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r125>>2]+40>>2]](r125)}else{HEAP32[r123>>2]=r62+1}HEAP8[r7]=1;r62=HEAPU8[r32];r109=((r62&1|0)==0?r62>>>1:HEAP32[r31])>>>0>1?r23:r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break}if(r50){if(r124){r132=FUNCTION_TABLE[HEAP32[HEAP32[r63]+36>>2]](r60)&255;r133=HEAP8[r32]}else{r132=HEAP8[r122];r133=r61}if(r132<<24>>24!=(HEAP8[(r133&1)==0?r24:HEAP32[r29]]|0)){r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break}r61=HEAP32[r4];r50=r61+12|0;r62=HEAP32[r50>>2];if((r62|0)==(HEAP32[r61+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r61>>2]+40>>2]](r61)}else{HEAP32[r50>>2]=r62+1}HEAP8[r7]=1;r62=HEAPU8[r32];r109=((r62&1|0)==0?r62>>>1:HEAP32[r31])>>>0>1?r23:r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break}if(r124){r134=FUNCTION_TABLE[HEAP32[HEAP32[r63]+36>>2]](r60)&255;r135=HEAP8[r30]}else{r134=HEAP8[r122];r135=r70}if(r134<<24>>24!=(HEAP8[(r135&1)==0?r36:HEAP32[r38]]|0)){HEAP8[r7]=1;r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break}r70=HEAP32[r4];r122=r70+12|0;r60=HEAP32[r122>>2];if((r60|0)==(HEAP32[r70+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r70>>2]+40>>2]](r70)}else{HEAP32[r122>>2]=r60+1}r60=HEAPU8[r30];r109=((r60&1|0)==0?r60>>>1:HEAP32[r37])>>>0>1?r22:r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43}else if((r48|0)==2){if(!((r14|0)!=0|r46>>>0<2)){if((r46|0)==2){r136=(HEAP8[r21]|0)!=0}else{r136=0}if(!(r39|r136)){r109=0;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break}}r60=HEAP8[r20];r122=(r60&1)==0?r5:HEAP32[r41];L263:do{if((r46|0)==0){r137=r122}else{if(HEAPU8[r15+(r46-1)|0]>=2){r137=r122;break}r70=r60&255;r63=r122+((r70&1|0)==0?r70>>>1:HEAP32[r40])|0;r70=r122;while(1){if((r70|0)==(r63|0)){r138=r63;break}r124=HEAP8[r70];if(r124<<24>>24<=-1){r138=r70;break}if((HEAP16[HEAP32[r2]+(r124<<24>>24<<1)>>1]&8192)==0){r138=r70;break}else{r70=r70+1|0}}r70=r138-r122|0;r63=HEAP8[r34];r59=r63&255;r57=(r59&1|0)==0?r59>>>1:HEAP32[r33];if(r70>>>0>r57>>>0){r137=r122;break}r59=(r63&1)==0?r8:HEAP32[r3];r63=r59+r57|0;if((r138|0)==(r122|0)){r137=r122;break}r58=r122;r124=r59+(r57-r70)|0;while(1){if((HEAP8[r124]|0)!=(HEAP8[r58]|0)){r137=r122;break L263}r70=r124+1|0;if((r70|0)==(r63|0)){r137=r138;break}else{r58=r58+1|0;r124=r70}}}}while(0);r65=r60&255;L277:do{if((r137|0)==(r122+((r65&1|0)==0?r65>>>1:HEAP32[r40])|0)){r139=r137}else{r56=r51,r124=r56>>2;r58=r137;while(1){r63=HEAP32[r4],r70=r63>>2;do{if((r63|0)==0){r140=0}else{if((HEAP32[r70+3]|0)!=(HEAP32[r70+4]|0)){r140=r63;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r70]+36>>2]](r63)|0)==-1){HEAP32[r4]=0;r140=0;break}else{r140=HEAP32[r4];break}}}while(0);r63=(r140|0)==0;do{if((r56|0)==0){r6=179}else{if((HEAP32[r124+3]|0)!=(HEAP32[r124+4]|0)){if(r63){r141=r56;break}else{r139=r58;break L277}}if((FUNCTION_TABLE[HEAP32[HEAP32[r124]+36>>2]](r56)|0)==-1){HEAP32[r1]=0;r6=179;break}else{if(r63){r141=r56;break}else{r139=r58;break L277}}}}while(0);if(r6==179){r6=0;if(r63){r139=r58;break L277}else{r141=0}}r70=HEAP32[r4],r66=r70>>2;r69=HEAP32[r66+3];if((r69|0)==(HEAP32[r66+4]|0)){r142=FUNCTION_TABLE[HEAP32[HEAP32[r66]+36>>2]](r70)&255}else{r142=HEAP8[r69]}if(r142<<24>>24!=(HEAP8[r58]|0)){r139=r58;break L277}r69=HEAP32[r4];r70=r69+12|0;r66=HEAP32[r70>>2];if((r66|0)==(HEAP32[r69+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r69>>2]+40>>2]](r69)}else{HEAP32[r70>>2]=r66+1}r66=r58+1|0;r70=HEAP8[r20];r69=r70&255;if((r66|0)==(((r70&1)==0?r5:HEAP32[r41])+((r69&1|0)==0?r69>>>1:HEAP32[r40])|0)){r139=r66;break}else{r56=r141,r124=r56>>2;r58=r66}}}}while(0);if(!r39){r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break}r65=HEAP8[r20];r122=r65&255;if((r139|0)==(((r65&1)==0?r5:HEAP32[r41])+((r122&1|0)==0?r122>>>1:HEAP32[r40])|0)){r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43}else{r6=192;break L2}}else{r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43}}while(0);L312:do{if(r6==68){r6=0;if((r46|0)==3){r52=r11;r53=r44;r54=r45;r55=r14;r6=313;break L2}else{r143=r51,r144=r143>>2}while(1){r48=HEAP32[r4],r47=r48>>2;do{if((r48|0)==0){r145=0}else{if((HEAP32[r47+3]|0)!=(HEAP32[r47+4]|0)){r145=r48;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r47]+36>>2]](r48)|0)==-1){HEAP32[r4]=0;r145=0;break}else{r145=HEAP32[r4];break}}}while(0);r48=(r145|0)==0;do{if((r143|0)==0){r6=81}else{if((HEAP32[r144+3]|0)!=(HEAP32[r144+4]|0)){if(r48){r146=r143;break}else{r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break L312}}if((FUNCTION_TABLE[HEAP32[HEAP32[r144]+36>>2]](r143)|0)==-1){HEAP32[r1]=0;r6=81;break}else{if(r48){r146=r143;break}else{r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break L312}}}}while(0);if(r6==81){r6=0;if(r48){r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break L312}else{r146=0}}r47=HEAP32[r4],r122=r47>>2;r65=HEAP32[r122+3];if((r65|0)==(HEAP32[r122+4]|0)){r147=FUNCTION_TABLE[HEAP32[HEAP32[r122]+36>>2]](r47)&255}else{r147=HEAP8[r65]}if(r147<<24>>24<=-1){r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break L312}if((HEAP16[HEAP32[r2]+(r147<<24>>24<<1)>>1]&8192)==0){r109=r14;r110=r28;r111=r45;r112=r44;r113=r11;r114=r43;break L312}r65=HEAP32[r4];r47=r65+12|0;r122=HEAP32[r47>>2];if((r122|0)==(HEAP32[r65+16>>2]|0)){r148=FUNCTION_TABLE[HEAP32[HEAP32[r65>>2]+40>>2]](r65)&255}else{HEAP32[r47>>2]=r122+1;r148=HEAP8[r122]}r122=HEAP8[r34];if((r122&1)==0){r149=10;r150=r122}else{r122=HEAP32[r35];r149=(r122&-2)-1|0;r150=r122&255}r122=r150&255;r47=(r122&1|0)==0?r122>>>1:HEAP32[r33];if((r47|0)==(r149|0)){if((r149|0)==-3){r6=98;break L2}r122=(r150&1)==0?r8:HEAP32[r3];do{if(r149>>>0<2147483631){r65=r149+1|0;r60=r149<<1;r58=r65>>>0<r60>>>0?r60:r65;if(r58>>>0<11){r151=11;break}r151=r58+16&-16}else{r151=-2}}while(0);r48=__Znwj(r151);_memcpy(r48,r122,r149)|0;if((r149|0)!=10){__ZdlPv(r122)}HEAP32[r3]=r48;r58=r151|1;HEAP32[r35]=r58;r152=r58&255;r153=r48}else{r152=r150;r153=HEAP32[r3]}r48=(r152&1)==0?r8:r153;HEAP8[r48+r47|0]=r148;r58=r47+1|0;HEAP8[r48+r58|0]=0;if((HEAP8[r34]&1)==0){HEAP8[r34]=r58<<1&255;r143=r146,r144=r143>>2;continue}else{HEAP32[r33]=r58;r143=r146,r144=r143>>2;continue}}}}while(0);r58=r46+1|0;if(r58>>>0<4){r43=r114;r11=r113;r44=r112;r45=r111;r28=r110;r14=r109;r46=r58}else{r52=r113;r53=r112;r54=r111;r55=r109;r6=313;break}}L368:do{if(r6==55){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}else if(r6==67){HEAP32[r10]=HEAP32[r10]|4;r154=0;r155=r44;r156=r11}else if(r6==98){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}else if(r6==150){HEAP32[r10]=HEAP32[r10]|4;r154=0;r155=r44;r156=r11}else if(r6==192){HEAP32[r10]=HEAP32[r10]|4;r154=0;r155=r44;r156=r11}else if(r6==215){__ZSt17__throw_bad_allocv()}else if(r6==230){__ZSt17__throw_bad_allocv()}else if(r6==242){__ZSt17__throw_bad_allocv()}else if(r6==266){HEAP32[r10]=HEAP32[r10]|4;r154=0;r155=r87;r156=r88}else if(r6==290){HEAP32[r10]=HEAP32[r10]|4;r154=0;r155=r87;r156=r88}else if(r6==293){__ZSt17__throw_bad_allocv()}else if(r6==311){HEAP32[r10]=HEAP32[r10]|4;r154=0;r155=r87;r156=r88}else if(r6==313){L388:do{if((r55|0)!=0){r109=r55;r111=r55+1|0;r112=r55+8|0;r113=r55+4|0;r46=1;L390:while(1){r14=HEAPU8[r109];if((r14&1|0)==0){r157=r14>>>1}else{r157=HEAP32[r113>>2]}if(r46>>>0>=r157>>>0){break L388}r14=HEAP32[r4],r110=r14>>2;do{if((r14|0)==0){r158=0}else{if((HEAP32[r110+3]|0)!=(HEAP32[r110+4]|0)){r158=r14;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r110]+36>>2]](r14)|0)==-1){HEAP32[r4]=0;r158=0;break}else{r158=HEAP32[r4];break}}}while(0);r14=(r158|0)==0;r110=HEAP32[r1],r47=r110>>2;do{if((r110|0)==0){r6=331}else{if((HEAP32[r47+3]|0)!=(HEAP32[r47+4]|0)){if(r14){break}else{break L390}}if((FUNCTION_TABLE[HEAP32[HEAP32[r47]+36>>2]](r110)|0)==-1){HEAP32[r1]=0;r6=331;break}else{if(r14){break}else{break L390}}}}while(0);if(r6==331){r6=0;if(r14){break}}r110=HEAP32[r4],r47=r110>>2;r122=HEAP32[r47+3];if((r122|0)==(HEAP32[r47+4]|0)){r159=FUNCTION_TABLE[HEAP32[HEAP32[r47]+36>>2]](r110)&255}else{r159=HEAP8[r122]}if((HEAP8[r109]&1)==0){r160=r111}else{r160=HEAP32[r112>>2]}if(r159<<24>>24!=(HEAP8[r160+r46|0]|0)){break}r122=r46+1|0;r110=HEAP32[r4];r47=r110+12|0;r28=HEAP32[r47>>2];if((r28|0)==(HEAP32[r110+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r110>>2]+40>>2]](r110);r46=r122;continue}else{HEAP32[r47>>2]=r28+1;r46=r122;continue}}HEAP32[r10]=HEAP32[r10]|4;r154=0;r155=r53;r156=r52;break L368}}while(0);if((r53|0)==(r54|0)){r154=1;r155=r54;r156=r52;break}HEAP32[r27>>2]=0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r18,r53,r54,r27);if((HEAP32[r27>>2]|0)==0){r154=1;r155=r53;r156=r52;break}HEAP32[r10]=HEAP32[r10]|4;r154=0;r155=r53;r156=r52}}while(0);if((HEAP8[r34]&1)!=0){__ZdlPv(HEAP32[r3])}if((HEAP8[r32]&1)!=0){__ZdlPv(HEAP32[r29])}if((HEAP8[r30]&1)!=0){__ZdlPv(HEAP32[r38])}if((HEAP8[r20]&1)!=0){__ZdlPv(HEAP32[r41])}if((HEAP8[r19]&1)!=0){__ZdlPv(HEAP32[r18+8>>2])}if((r155|0)==0){STACKTOP=r13;return r154}FUNCTION_TABLE[r156](r155);STACKTOP=r13;return r154}function __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendIPcEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12;r4=r1;r5=r2;r6=HEAP8[r4];r7=r6&255;if((r7&1|0)==0){r8=r7>>>1}else{r8=HEAP32[r1+4>>2]}if((r6&1)==0){r9=10;r10=r6}else{r6=HEAP32[r1>>2];r9=(r6&-2)-1|0;r10=r6&255}r6=r3-r5|0;if((r3|0)==(r2|0)){return r1}if((r9-r8|0)>>>0<r6>>>0){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r9,r8+r6-r9|0,r8,r8,0,0);r11=HEAP8[r4]}else{r11=r10}if((r11&1)==0){r12=r1+1|0}else{r12=HEAP32[r1+8>>2]}r11=r3+(r8-r5)|0;r5=r2;r2=r12+r8|0;while(1){HEAP8[r2]=HEAP8[r5];r10=r5+1|0;if((r10|0)==(r3|0)){break}else{r5=r10;r2=r2+1|0}}HEAP8[r12+r11|0]=0;r11=r8+r6|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r11<<1&255;return r1}else{HEAP32[r1+4>>2]=r11;return r1}}function __ZNSt3__121__throw_runtime_errorEPKc(r1){var r2,r3,r4,r5,r6;r2=___cxa_allocate_exception(8);HEAP32[r2>>2]=10040;r3=r2+4|0;if((r3|0)==0){___cxa_throw(r2,16136,184)}r4=_strlen(r1);r5=__Znaj(r4+13|0),r6=r5>>2;HEAP32[r6+1]=r4;HEAP32[r6]=r4;r4=r5+12|0;HEAP32[r3>>2]=r4;HEAP32[r6+2]=0;_strcpy(r4,r1);___cxa_throw(r2,16136,184)}function __ZNKSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIcS3_NS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37;r2=r8>>2;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+160|0;r11=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r11>>2];r11=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r11>>2];r11=r10,r12=r11>>2;r13=r10+16;r14=r10+120;r15=r10+128;r16=r10+136;r17=r10+144;r18=r10+152;r19=(r14|0)>>2;HEAP32[r19]=r13;r20=r14+4|0;HEAP32[r20>>2]=420;r21=(r16|0)>>2;r22=HEAP32[r6+28>>2];HEAP32[r21]=r22;r23=r22+4|0;tempValue=HEAP32[r23>>2],HEAP32[r23>>2]=tempValue+1,tempValue;r23=HEAP32[r21];if((HEAP32[4644]|0)!=-1){HEAP32[r12]=18576;HEAP32[r12+1]=24;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r11,252)}r11=HEAP32[4645]-1|0;r12=HEAP32[r23+8>>2];do{if(HEAP32[r23+12>>2]-r12>>2>>>0>r11>>>0){r22=HEAP32[r12+(r11<<2)>>2];if((r22|0)==0){break}r24=r22;HEAP8[r17]=0;r25=r4|0;r26=HEAP32[r25>>2],r27=r26>>2;HEAP32[r18>>2]=r26;if(__ZNSt3__19money_getIcNS_19istreambuf_iteratorIcNS_11char_traitsIcEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIcEERNS_10unique_ptrIcPFvPvEEERPcSM_(r3,r18,r5,r16,HEAP32[r6+4>>2],r7,r17,r24,r14,r15,r13+100|0)){r28=r8;if((HEAP8[r28]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r28]=0}else{HEAP8[HEAP32[r2+2]]=0;HEAP32[r2+1]=0}r29=r22;do{if((HEAP8[r17]&1)!=0){r22=FUNCTION_TABLE[HEAP32[HEAP32[r29>>2]+28>>2]](r24,45);r30=HEAP8[r28];if((r30&1)==0){r31=10;r32=r30}else{r30=HEAP32[r2];r31=(r30&-2)-1|0;r32=r30&255}r30=r32&255;if((r30&1|0)==0){r33=r30>>>1}else{r33=HEAP32[r2+1]}if((r33|0)==(r31|0)){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r8,r31,1,r31,r31,0,0);r34=HEAP8[r28]}else{r34=r32}if((r34&1)==0){r35=r8+1|0}else{r35=HEAP32[r2+2]}HEAP8[r35+r33|0]=r22;r22=r33+1|0;HEAP8[r35+r22|0]=0;if((HEAP8[r28]&1)==0){HEAP8[r28]=r22<<1&255;break}else{HEAP32[r2+1]=r22;break}}}while(0);r28=FUNCTION_TABLE[HEAP32[HEAP32[r29>>2]+28>>2]](r24,48);r22=HEAP32[r15>>2];r30=r22-1|0;r36=HEAP32[r19];while(1){if(r36>>>0>=r30>>>0){break}if((HEAP8[r36]|0)==r28<<24>>24){r36=r36+1|0}else{break}}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendIPcEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r8,r36,r22)}r28=r3|0;r30=HEAP32[r28>>2],r24=r30>>2;do{if((r30|0)==0){r37=0}else{if((HEAP32[r24+3]|0)!=(HEAP32[r24+4]|0)){r37=r30;break}if((FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r30)|0)!=-1){r37=r30;break}HEAP32[r28>>2]=0;r37=0}}while(0);r28=(r37|0)==0;do{if((r26|0)==0){r9=437}else{if((HEAP32[r27+3]|0)!=(HEAP32[r27+4]|0)){if(r28){break}else{r9=439;break}}if((FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)|0)==-1){HEAP32[r25>>2]=0;r9=437;break}else{if(r28^(r26|0)==0){break}else{r9=439;break}}}}while(0);if(r9==437){if(r28){r9=439}}if(r9==439){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r37;r26=HEAP32[r21];r25=r26+4|0;if(((tempValue=HEAP32[r25>>2],HEAP32[r25>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+8>>2]](r26|0)}r26=HEAP32[r19];HEAP32[r19]=0;if((r26|0)==0){STACKTOP=r10;return}FUNCTION_TABLE[HEAP32[r20>>2]](r26);STACKTOP=r10;return}}while(0);r10=___cxa_allocate_exception(4);HEAP32[r10>>2]=10008;___cxa_throw(r10,16120,514)}function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){return}function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__111__money_getIcE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_SF_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r11=STACKTOP;STACKTOP=STACKTOP+56|0;r12=r11,r13=r12>>2;r14=r11+16,r15=r14>>2;r16=r11+32;r17=r11+40;r18=r17>>2;r19=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r22=r21>>2;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=r23>>2;r25=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r29=r28>>2;r30=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r31=r30>>2;r32=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r33=r32>>2;if(r1){r1=HEAP32[r2>>2];if((HEAP32[4772]|0)!=-1){HEAP32[r15]=19088;HEAP32[r15+1]=24;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19088,r14,252)}r14=HEAP32[4773]-1|0;r15=HEAP32[r1+8>>2];if(HEAP32[r1+12>>2]-r15>>2>>>0<=r14>>>0){r34=___cxa_allocate_exception(4);r35=r34;HEAP32[r35>>2]=10008;___cxa_throw(r34,16120,514)}r1=HEAP32[r15+(r14<<2)>>2];if((r1|0)==0){r34=___cxa_allocate_exception(4);r35=r34;HEAP32[r35>>2]=10008;___cxa_throw(r34,16120,514)}r34=r1;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](r16,r34);r35=r3;tempBigInt=HEAP32[r16>>2];HEAP8[r35]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+3|0]=tempBigInt&255;r35=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r35]+32>>2]](r17,r34);r17=r9,r16=r17>>2;if((HEAP8[r17]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r17]=0}else{HEAP8[HEAP32[r9+8>>2]]=0;HEAP32[r9+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r16]=HEAP32[r18];HEAP32[r16+1]=HEAP32[r18+1];HEAP32[r16+2]=HEAP32[r18+2];HEAP32[r18]=0;HEAP32[r18+1]=0;HEAP32[r18+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r35]+28>>2]](r19,r34);r19=r8,r18=r19>>2;if((HEAP8[r19]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r19]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r18]=HEAP32[r20];HEAP32[r18+1]=HEAP32[r20+1];HEAP32[r18+2]=HEAP32[r20+2];HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r1;HEAP8[r4]=FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+12>>2]](r34);HEAP8[r5]=FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+16>>2]](r34);FUNCTION_TABLE[HEAP32[HEAP32[r35]+20>>2]](r21,r34);r21=r6,r20=r21>>2;if((HEAP8[r21]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r21]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r20]=HEAP32[r22];HEAP32[r20+1]=HEAP32[r22+1];HEAP32[r20+2]=HEAP32[r22+2];HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r35]+24>>2]](r23,r34);r23=r7,r35=r23>>2;if((HEAP8[r23]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r23]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r35]=HEAP32[r24];HEAP32[r35+1]=HEAP32[r24+1];HEAP32[r35+2]=HEAP32[r24+2];HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0;r36=FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+36>>2]](r34);HEAP32[r10>>2]=r36;STACKTOP=r11;return}else{r34=HEAP32[r2>>2];if((HEAP32[4774]|0)!=-1){HEAP32[r13]=19096;HEAP32[r13+1]=24;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19096,r12,252)}r12=HEAP32[4775]-1|0;r13=HEAP32[r34+8>>2];if(HEAP32[r34+12>>2]-r13>>2>>>0<=r12>>>0){r37=___cxa_allocate_exception(4);r38=r37;HEAP32[r38>>2]=10008;___cxa_throw(r37,16120,514)}r34=HEAP32[r13+(r12<<2)>>2];if((r34|0)==0){r37=___cxa_allocate_exception(4);r38=r37;HEAP32[r38>>2]=10008;___cxa_throw(r37,16120,514)}r37=r34;FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+44>>2]](r25,r37);r38=r3;tempBigInt=HEAP32[r25>>2];HEAP8[r38]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+3|0]=tempBigInt&255;r38=r34>>2;FUNCTION_TABLE[HEAP32[HEAP32[r38]+32>>2]](r26,r37);r26=r9,r25=r26>>2;if((HEAP8[r26]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r26]=0}else{HEAP8[HEAP32[r9+8>>2]]=0;HEAP32[r9+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r25]=HEAP32[r27];HEAP32[r25+1]=HEAP32[r27+1];HEAP32[r25+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r38]+28>>2]](r28,r37);r28=r8,r27=r28>>2;if((HEAP8[r28]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r28]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r27]=HEAP32[r29];HEAP32[r27+1]=HEAP32[r29+1];HEAP32[r27+2]=HEAP32[r29+2];HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;r29=r34;HEAP8[r4]=FUNCTION_TABLE[HEAP32[HEAP32[r29>>2]+12>>2]](r37);HEAP8[r5]=FUNCTION_TABLE[HEAP32[HEAP32[r29>>2]+16>>2]](r37);FUNCTION_TABLE[HEAP32[HEAP32[r38]+20>>2]](r30,r37);r30=r6,r29=r30>>2;if((HEAP8[r30]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r30]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r29]=HEAP32[r31];HEAP32[r29+1]=HEAP32[r31+1];HEAP32[r29+2]=HEAP32[r31+2];HEAP32[r31]=0;HEAP32[r31+1]=0;HEAP32[r31+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r38]+24>>2]](r32,r37);r32=r7,r38=r32>>2;if((HEAP8[r32]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r32]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r38]=HEAP32[r33];HEAP32[r38+1]=HEAP32[r33+1];HEAP32[r38+2]=HEAP32[r33+2];HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0;r36=FUNCTION_TABLE[HEAP32[HEAP32[r34>>2]+36>>2]](r37);HEAP32[r10>>2]=r36;STACKTOP=r11;return}}function __ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRe(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44;r2=0;r9=STACKTOP;STACKTOP=STACKTOP+600|0;r10=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r10>>2];r10=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r10>>2];r10=r9,r11=r10>>2;r12=r9+16;r13=r9+416;r14=r9+424;r15=r9+432;r16=r9+440;r17=r9+448;r18=r9+456;r19=r9+496;r20=(r13|0)>>2;HEAP32[r20]=r12;r21=r13+4|0;HEAP32[r21>>2]=420;r22=(r15|0)>>2;r23=HEAP32[r6+28>>2];HEAP32[r22]=r23;r24=r23+4|0;tempValue=HEAP32[r24>>2],HEAP32[r24>>2]=tempValue+1,tempValue;r24=HEAP32[r22];if((HEAP32[4642]|0)!=-1){HEAP32[r11]=18568;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r10,252)}r10=HEAP32[4643]-1|0;r11=HEAP32[r24+8>>2];do{if(HEAP32[r24+12>>2]-r11>>2>>>0>r10>>>0){r23=HEAP32[r11+(r10<<2)>>2];if((r23|0)==0){break}r25=r23;HEAP8[r16]=0;r26=(r4|0)>>2;HEAP32[r17>>2]=HEAP32[r26];do{if(__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r3,r17,r5,r15,HEAP32[r6+4>>2],r7,r16,r25,r13,r14,r12+400|0)){r27=r18|0;FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+48>>2]](r25,9472,9482,r27);r28=r19|0;r29=HEAP32[r14>>2];r30=HEAP32[r20];r31=r29-r30|0;do{if((r31|0)>392){r32=_malloc(r31+8>>2|0);if((r32|0)!=0){r33=r32;r34=r32;break}r32=___cxa_allocate_exception(4);HEAP32[r32>>2]=9976;___cxa_throw(r32,16104,66)}else{r33=r28;r34=0}}while(0);if((HEAP8[r16]&1)==0){r35=r33}else{HEAP8[r33]=45;r35=r33+1|0}if(r30>>>0<r29>>>0){r31=r18+40|0;r32=r18;r36=r35;r37=r30;while(1){r38=r27;while(1){if((r38|0)==(r31|0)){r39=r31;break}if((HEAP32[r38>>2]|0)==(HEAP32[r37>>2]|0)){r39=r38;break}else{r38=r38+4|0}}HEAP8[r36]=HEAP8[r39-r32+37888>>2|0];r38=r37+4|0;r40=r36+1|0;if(r38>>>0<HEAP32[r14>>2]>>>0){r36=r40;r37=r38}else{r41=r40;break}}}else{r41=r35}HEAP8[r41]=0;if((_sscanf(r28,3312,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAP32[tempInt>>2]=r8,tempInt))|0)==1){if((r34|0)==0){break}_free(r34);break}r37=___cxa_allocate_exception(8);HEAP32[r37>>2]=10040;r36=r37+4|0;if((r36|0)!=0){r32=__Znaj(28),r31=r32>>2;HEAP32[r31+1]=15;HEAP32[r31]=15;r27=r32+12|0;HEAP32[r36>>2]=r27;HEAP32[r31+2]=0;_memcpy(r27,3080,16)|0}___cxa_throw(r37,16136,184)}}while(0);r25=r3|0;r23=HEAP32[r25>>2],r37=r23>>2;do{if((r23|0)==0){r42=0}else{r27=HEAP32[r37+3];if((r27|0)==(HEAP32[r37+4]|0)){r43=FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r23)}else{r43=HEAP32[r27>>2]}if((r43|0)!=-1){r42=r23;break}HEAP32[r25>>2]=0;r42=0}}while(0);r25=(r42|0)==0;r23=HEAP32[r26],r37=r23>>2;do{if((r23|0)==0){r2=559}else{r27=HEAP32[r37+3];if((r27|0)==(HEAP32[r37+4]|0)){r44=FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r23)}else{r44=HEAP32[r27>>2]}if((r44|0)==-1){HEAP32[r26]=0;r2=559;break}else{if(r25^(r23|0)==0){break}else{r2=561;break}}}}while(0);if(r2==559){if(r25){r2=561}}if(r2==561){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r42;r23=HEAP32[r22];r26=r23+4|0;if(((tempValue=HEAP32[r26>>2],HEAP32[r26>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+8>>2]](r23|0)}r23=HEAP32[r20];HEAP32[r20]=0;if((r23|0)==0){STACKTOP=r9;return}FUNCTION_TABLE[HEAP32[r21>>2]](r23);STACKTOP=r9;return}}while(0);r9=___cxa_allocate_exception(4);HEAP32[r9>>2]=10008;___cxa_throw(r9,16120,514)}
function __ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11){var r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99,r100,r101,r102,r103,r104,r105,r106,r107,r108,r109,r110,r111,r112,r113,r114,r115,r116,r117,r118,r119,r120,r121,r122,r123,r124,r125,r126,r127,r128,r129,r130,r131,r132,r133,r134,r135,r136,r137,r138,r139,r140,r141,r142,r143,r144,r145,r146,r147,r148,r149,r150,r151,r152,r153,r154,r155,r156,r157,r158,r159,r160,r161,r162;r12=r10>>2;r13=r6>>2;r6=0;r14=STACKTOP;STACKTOP=STACKTOP+448|0;r15=r2;r2=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r2>>2]=HEAP32[r15>>2];r15=r14,r16=r15>>2;r17=r14+8;r18=r14+408;r19=r14+416;r20=r14+424;r21=r14+432;r22=r21,r23=r22>>2;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r16]=r11;r11=r17|0;HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;r23=r24,r30=r23>>2;r31=r25,r32=r31>>2;r33=r26,r34=r33>>2;r35=r27,r36=r35>>2;HEAP32[r30]=0;HEAP32[r30+1]=0;HEAP32[r30+2]=0;HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;HEAP32[r34]=0;HEAP32[r34+1]=0;HEAP32[r34+2]=0;HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0;__ZNSt3__111__money_getIwE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_SJ_Ri(r3,r4,r18,r19,r20,r21,r24,r25,r26,r28);r4=r9|0;HEAP32[r12]=HEAP32[r4>>2];r3=(r1|0)>>2;r1=(r2|0)>>2;r2=r8>>2;r36=r27+4|0,r34=r36>>2;r32=(r27+8|0)>>2;r30=r27|0;r37=r26+4|0,r38=r37>>2;r39=(r26+8|0)>>2;r40=r25+4|0,r41=r40>>2;r42=(r25+8|0)>>2;r43=(r5&512|0)!=0;r5=r24+4|0,r44=r5>>2;r45=(r24+8|0)>>2;r24=r18+3|0;r46=r21+4|0;r47=420;r48=r11;r49=r11;r11=r17+400|0;r17=0;r50=0;L693:while(1){r51=HEAP32[r3],r52=r51>>2;do{if((r51|0)==0){r53=1}else{r54=HEAP32[r52+3];if((r54|0)==(HEAP32[r52+4]|0)){r55=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r51)}else{r55=HEAP32[r54>>2]}if((r55|0)==-1){HEAP32[r3]=0;r53=1;break}else{r53=(HEAP32[r3]|0)==0;break}}}while(0);r51=HEAP32[r1],r52=r51>>2;do{if((r51|0)==0){r6=591}else{r54=HEAP32[r52+3];if((r54|0)==(HEAP32[r52+4]|0)){r56=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r51)}else{r56=HEAP32[r54>>2]}if((r56|0)==-1){HEAP32[r1]=0;r6=591;break}else{if(r53^(r51|0)==0){r57=r51;break}else{r58=r47;r59=r48;r60=r49;r61=r17;r6=857;break L693}}}}while(0);if(r6==591){r6=0;if(r53){r58=r47;r59=r48;r60=r49;r61=r17;r6=857;break}else{r57=0}}r51=HEAP8[r18+r50|0]|0;L717:do{if((r51|0)==1){if((r50|0)==3){r58=r47;r59=r48;r60=r49;r61=r17;r6=857;break L693}r52=HEAP32[r3],r54=r52>>2;r62=HEAP32[r54+3];if((r62|0)==(HEAP32[r54+4]|0)){r63=FUNCTION_TABLE[HEAP32[HEAP32[r54]+36>>2]](r52)}else{r63=HEAP32[r62>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,r63)){r6=632;break L693}r62=HEAP32[r3];r52=r62+12|0;r54=HEAP32[r52>>2];if((r54|0)==(HEAP32[r62+16>>2]|0)){r64=FUNCTION_TABLE[HEAP32[HEAP32[r62>>2]+40>>2]](r62)}else{HEAP32[r52>>2]=r54+4;r64=HEAP32[r54>>2]}r54=HEAP8[r35];if((r54&1)==0){r65=1;r66=r54}else{r54=HEAP32[r30>>2];r65=(r54&-2)-1|0;r66=r54&255}r54=r66&255;r52=(r54&1|0)==0?r54>>>1:HEAP32[r34];if((r52|0)==(r65|0)){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r27,r65,1,r65,r65,0,0);r67=HEAP8[r35]}else{r67=r66}r54=(r67&1)==0?r36:HEAP32[r32];HEAP32[r54+(r52<<2)>>2]=r64;r62=r52+1|0;HEAP32[r54+(r62<<2)>>2]=0;if((HEAP8[r35]&1)==0){HEAP8[r35]=r62<<1&255;r6=633;break}else{HEAP32[r34]=r62;r6=633;break}}else if((r51|0)==0){r6=633}else if((r51|0)==2){if(!((r17|0)!=0|r50>>>0<2)){if((r50|0)==2){r68=(HEAP8[r24]|0)!=0}else{r68=0}if(!(r43|r68)){r69=0;r70=r11;r71=r49;r72=r48;r73=r47;break}}r62=HEAP8[r23];r54=(r62&1)==0?r5:HEAP32[r45];L747:do{if((r50|0)==0){r74=r54;r75=r62;r76=r57,r77=r76>>2}else{if(HEAPU8[r18+(r50-1)|0]<2){r78=r54;r79=r62}else{r74=r54;r75=r62;r76=r57,r77=r76>>2;break}while(1){r52=r79&255;if((r78|0)==((((r52&1|0)==0?r52>>>1:HEAP32[r44])<<2)+((r79&1)==0?r5:HEAP32[r45])|0)){r80=r79;break}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,HEAP32[r78>>2])){r6=716;break}r78=r78+4|0;r79=HEAP8[r23]}if(r6==716){r6=0;r80=HEAP8[r23]}r52=(r80&1)==0;r81=r78-(r52?r5:HEAP32[r45])>>2;r82=HEAP8[r35];r83=r82&255;r84=(r83&1|0)==0;L757:do{if(r81>>>0<=(r84?r83>>>1:HEAP32[r34])>>>0){r85=(r82&1)==0;r86=((r84?r83>>>1:HEAP32[r34])-r81<<2)+(r85?r36:HEAP32[r32])|0;r87=((r84?r83>>>1:HEAP32[r34])<<2)+(r85?r36:HEAP32[r32])|0;if((r86|0)==(r87|0)){r74=r78;r75=r80;r76=r57,r77=r76>>2;break L747}else{r88=r86;r89=r52?r5:HEAP32[r45]}while(1){if((HEAP32[r88>>2]|0)!=(HEAP32[r89>>2]|0)){break L757}r86=r88+4|0;if((r86|0)==(r87|0)){r74=r78;r75=r80;r76=r57,r77=r76>>2;break L747}r88=r86;r89=r89+4|0}}}while(0);r74=r52?r5:HEAP32[r45];r75=r80;r76=r57,r77=r76>>2}}while(0);L764:while(1){r62=r75&255;if((r74|0)==((((r62&1|0)==0?r62>>>1:HEAP32[r44])<<2)+((r75&1)==0?r5:HEAP32[r45])|0)){break}r62=HEAP32[r3],r54=r62>>2;do{if((r62|0)==0){r90=1}else{r83=HEAP32[r54+3];if((r83|0)==(HEAP32[r54+4]|0)){r91=FUNCTION_TABLE[HEAP32[HEAP32[r54]+36>>2]](r62)}else{r91=HEAP32[r83>>2]}if((r91|0)==-1){HEAP32[r3]=0;r90=1;break}else{r90=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r76|0)==0){r6=737}else{r62=HEAP32[r77+3];if((r62|0)==(HEAP32[r77+4]|0)){r92=FUNCTION_TABLE[HEAP32[HEAP32[r77]+36>>2]](r76)}else{r92=HEAP32[r62>>2]}if((r92|0)==-1){HEAP32[r1]=0;r6=737;break}else{if(r90^(r76|0)==0){r93=r76;break}else{break L764}}}}while(0);if(r6==737){r6=0;if(r90){break}else{r93=0}}r62=HEAP32[r3],r54=r62>>2;r52=HEAP32[r54+3];if((r52|0)==(HEAP32[r54+4]|0)){r94=FUNCTION_TABLE[HEAP32[HEAP32[r54]+36>>2]](r62)}else{r94=HEAP32[r52>>2]}if((r94|0)!=(HEAP32[r74>>2]|0)){break}r52=HEAP32[r3];r62=r52+12|0;r54=HEAP32[r62>>2];if((r54|0)==(HEAP32[r52+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r52>>2]+40>>2]](r52)}else{HEAP32[r62>>2]=r54+4}r74=r74+4|0;r75=HEAP8[r23];r76=r93,r77=r76>>2}if(!r43){r69=r17;r70=r11;r71=r49;r72=r48;r73=r47;break}r54=HEAP8[r23];r62=r54&255;if((r74|0)==((((r62&1|0)==0?r62>>>1:HEAP32[r44])<<2)+((r54&1)==0?r5:HEAP32[r45])|0)){r69=r17;r70=r11;r71=r49;r72=r48;r73=r47}else{r6=749;break L693}}else if((r51|0)==3){r54=HEAP8[r31];r62=r54&255;r52=(r62&1|0)==0;r83=HEAP8[r33];r84=r83&255;r81=(r84&1|0)==0;if(((r52?r62>>>1:HEAP32[r41])|0)==(-(r81?r84>>>1:HEAP32[r38])|0)){r69=r17;r70=r11;r71=r49;r72=r48;r73=r47;break}do{if(((r52?r62>>>1:HEAP32[r41])|0)!=0){if(((r81?r84>>>1:HEAP32[r38])|0)==0){break}r82=HEAP32[r3],r87=r82>>2;r86=HEAP32[r87+3];if((r86|0)==(HEAP32[r87+4]|0)){r95=FUNCTION_TABLE[HEAP32[HEAP32[r87]+36>>2]](r82);r96=HEAP8[r31]}else{r95=HEAP32[r86>>2];r96=r54}r86=HEAP32[r3],r82=r86>>2;r87=r86+12|0;r85=HEAP32[r87>>2];r97=(r85|0)==(HEAP32[r82+4]|0);if((r95|0)==(HEAP32[((r96&1)==0?r40:HEAP32[r42])>>2]|0)){if(r97){FUNCTION_TABLE[HEAP32[HEAP32[r82]+40>>2]](r86)}else{HEAP32[r87>>2]=r85+4}r87=HEAPU8[r31];r69=((r87&1|0)==0?r87>>>1:HEAP32[r41])>>>0>1?r25:r17;r70=r11;r71=r49;r72=r48;r73=r47;break L717}if(r97){r98=FUNCTION_TABLE[HEAP32[HEAP32[r82]+36>>2]](r86)}else{r98=HEAP32[r85>>2]}if((r98|0)!=(HEAP32[((HEAP8[r33]&1)==0?r37:HEAP32[r39])>>2]|0)){r6=705;break L693}r85=HEAP32[r3];r86=r85+12|0;r82=HEAP32[r86>>2];if((r82|0)==(HEAP32[r85+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r85>>2]+40>>2]](r85)}else{HEAP32[r86>>2]=r82+4}HEAP8[r7]=1;r82=HEAPU8[r33];r69=((r82&1|0)==0?r82>>>1:HEAP32[r38])>>>0>1?r26:r17;r70=r11;r71=r49;r72=r48;r73=r47;break L717}}while(0);r84=HEAP32[r3],r81=r84>>2;r82=HEAP32[r81+3];r86=(r82|0)==(HEAP32[r81+4]|0);if(((r52?r62>>>1:HEAP32[r41])|0)==0){if(r86){r99=FUNCTION_TABLE[HEAP32[HEAP32[r81]+36>>2]](r84);r100=HEAP8[r33]}else{r99=HEAP32[r82>>2];r100=r83}if((r99|0)!=(HEAP32[((r100&1)==0?r37:HEAP32[r39])>>2]|0)){r69=r17;r70=r11;r71=r49;r72=r48;r73=r47;break}r85=HEAP32[r3];r97=r85+12|0;r87=HEAP32[r97>>2];if((r87|0)==(HEAP32[r85+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r85>>2]+40>>2]](r85)}else{HEAP32[r97>>2]=r87+4}HEAP8[r7]=1;r87=HEAPU8[r33];r69=((r87&1|0)==0?r87>>>1:HEAP32[r38])>>>0>1?r26:r17;r70=r11;r71=r49;r72=r48;r73=r47;break}if(r86){r101=FUNCTION_TABLE[HEAP32[HEAP32[r81]+36>>2]](r84);r102=HEAP8[r31]}else{r101=HEAP32[r82>>2];r102=r54}if((r101|0)!=(HEAP32[((r102&1)==0?r40:HEAP32[r42])>>2]|0)){HEAP8[r7]=1;r69=r17;r70=r11;r71=r49;r72=r48;r73=r47;break}r82=HEAP32[r3];r84=r82+12|0;r81=HEAP32[r84>>2];if((r81|0)==(HEAP32[r82+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r82>>2]+40>>2]](r82)}else{HEAP32[r84>>2]=r81+4}r81=HEAPU8[r31];r69=((r81&1|0)==0?r81>>>1:HEAP32[r41])>>>0>1?r25:r17;r70=r11;r71=r49;r72=r48;r73=r47}else if((r51|0)==4){r81=0;r84=r11;r82=r49;r86=r48;r87=r47;L852:while(1){r97=HEAP32[r3],r85=r97>>2;do{if((r97|0)==0){r103=1}else{r104=HEAP32[r85+3];if((r104|0)==(HEAP32[r85+4]|0)){r105=FUNCTION_TABLE[HEAP32[HEAP32[r85]+36>>2]](r97)}else{r105=HEAP32[r104>>2]}if((r105|0)==-1){HEAP32[r3]=0;r103=1;break}else{r103=(HEAP32[r3]|0)==0;break}}}while(0);r97=HEAP32[r1],r85=r97>>2;do{if((r97|0)==0){r6=763}else{r104=HEAP32[r85+3];if((r104|0)==(HEAP32[r85+4]|0)){r106=FUNCTION_TABLE[HEAP32[HEAP32[r85]+36>>2]](r97)}else{r106=HEAP32[r104>>2]}if((r106|0)==-1){HEAP32[r1]=0;r6=763;break}else{if(r103^(r97|0)==0){break}else{break L852}}}}while(0);if(r6==763){r6=0;if(r103){break}}r97=HEAP32[r3],r85=r97>>2;r104=HEAP32[r85+3];if((r104|0)==(HEAP32[r85+4]|0)){r107=FUNCTION_TABLE[HEAP32[HEAP32[r85]+36>>2]](r97)}else{r107=HEAP32[r104>>2]}if(FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,2048,r107)){r104=HEAP32[r12];if((r104|0)==(HEAP32[r16]|0)){__ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r9,r10,r15);r108=HEAP32[r12]}else{r108=r104}HEAP32[r12]=r108+4;HEAP32[r108>>2]=r107;r109=r81+1|0;r110=r84;r111=r82;r112=r86;r113=r87}else{r104=HEAPU8[r22];if((((r104&1|0)==0?r104>>>1:HEAP32[r46>>2])|0)==0|(r81|0)==0){break}if((r107|0)!=(HEAP32[r20>>2]|0)){break}if((r82|0)==(r84|0)){r104=(r87|0)!=420;r97=r82-r86|0;r85=r97>>>0<2147483647?r97<<1:-1;if(r104){r114=r86}else{r114=0}r104=_realloc(r114,r85);r115=r104;if((r104|0)==0){r6=780;break L693}r116=(r85>>>2<<2)+r115|0;r117=(r97>>2<<2)+r115|0;r118=r115;r119=216}else{r116=r84;r117=r82;r118=r86;r119=r87}HEAP32[r117>>2]=r81;r109=0;r110=r116;r111=r117+4|0;r112=r118;r113=r119}r115=HEAP32[r3];r97=r115+12|0;r85=HEAP32[r97>>2];if((r85|0)==(HEAP32[r115+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r115>>2]+40>>2]](r115);r81=r109;r84=r110;r82=r111;r86=r112;r87=r113;continue}else{HEAP32[r97>>2]=r85+4;r81=r109;r84=r110;r82=r111;r86=r112;r87=r113;continue}}if((r86|0)==(r82|0)|(r81|0)==0){r120=r84;r121=r82;r122=r86;r123=r87}else{if((r82|0)==(r84|0)){r54=(r87|0)!=420;r83=r82-r86|0;r62=r83>>>0<2147483647?r83<<1:-1;if(r54){r124=r86}else{r124=0}r54=_realloc(r124,r62);r52=r54;if((r54|0)==0){r6=794;break L693}r125=(r62>>>2<<2)+r52|0;r126=(r83>>2<<2)+r52|0;r127=r52;r128=216}else{r125=r84;r126=r82;r127=r86;r128=r87}HEAP32[r126>>2]=r81;r120=r125;r121=r126+4|0;r122=r127;r123=r128}r52=HEAP32[r28>>2];if((r52|0)>0){r83=HEAP32[r3],r62=r83>>2;do{if((r83|0)==0){r129=1}else{r54=HEAP32[r62+3];if((r54|0)==(HEAP32[r62+4]|0)){r130=FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r83)}else{r130=HEAP32[r54>>2]}if((r130|0)==-1){HEAP32[r3]=0;r129=1;break}else{r129=(HEAP32[r3]|0)==0;break}}}while(0);r83=HEAP32[r1],r62=r83>>2;do{if((r83|0)==0){r6=814}else{r81=HEAP32[r62+3];if((r81|0)==(HEAP32[r62+4]|0)){r131=FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r83)}else{r131=HEAP32[r81>>2]}if((r131|0)==-1){HEAP32[r1]=0;r6=814;break}else{if(r129^(r83|0)==0){r132=r83;break}else{r6=820;break L693}}}}while(0);if(r6==814){r6=0;if(r129){r6=820;break L693}else{r132=0}}r83=HEAP32[r3],r62=r83>>2;r81=HEAP32[r62+3];if((r81|0)==(HEAP32[r62+4]|0)){r133=FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r83)}else{r133=HEAP32[r81>>2]}if((r133|0)!=(HEAP32[r19>>2]|0)){r6=820;break L693}r81=HEAP32[r3];r83=r81+12|0;r62=HEAP32[r83>>2];if((r62|0)==(HEAP32[r81+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r81>>2]+40>>2]](r81);r134=r132,r135=r134>>2;r136=r52}else{HEAP32[r83>>2]=r62+4;r134=r132,r135=r134>>2;r136=r52}while(1){r62=HEAP32[r3],r83=r62>>2;do{if((r62|0)==0){r137=1}else{r81=HEAP32[r83+3];if((r81|0)==(HEAP32[r83+4]|0)){r138=FUNCTION_TABLE[HEAP32[HEAP32[r83]+36>>2]](r62)}else{r138=HEAP32[r81>>2]}if((r138|0)==-1){HEAP32[r3]=0;r137=1;break}else{r137=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r134|0)==0){r6=837}else{r62=HEAP32[r135+3];if((r62|0)==(HEAP32[r135+4]|0)){r139=FUNCTION_TABLE[HEAP32[HEAP32[r135]+36>>2]](r134)}else{r139=HEAP32[r62>>2]}if((r139|0)==-1){HEAP32[r1]=0;r6=837;break}else{if(r137^(r134|0)==0){r140=r134;break}else{r6=844;break L693}}}}while(0);if(r6==837){r6=0;if(r137){r6=844;break L693}else{r140=0}}r62=HEAP32[r3],r83=r62>>2;r81=HEAP32[r83+3];if((r81|0)==(HEAP32[r83+4]|0)){r141=FUNCTION_TABLE[HEAP32[HEAP32[r83]+36>>2]](r62)}else{r141=HEAP32[r81>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,2048,r141)){r6=844;break L693}if((HEAP32[r12]|0)==(HEAP32[r16]|0)){__ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r9,r10,r15)}r81=HEAP32[r3],r62=r81>>2;r83=HEAP32[r62+3];if((r83|0)==(HEAP32[r62+4]|0)){r142=FUNCTION_TABLE[HEAP32[HEAP32[r62]+36>>2]](r81)}else{r142=HEAP32[r83>>2]}r83=HEAP32[r12];HEAP32[r12]=r83+4;HEAP32[r83>>2]=r142;r83=r136-1|0;HEAP32[r28>>2]=r83;r81=HEAP32[r3];r62=r81+12|0;r87=HEAP32[r62>>2];if((r87|0)==(HEAP32[r81+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r81>>2]+40>>2]](r81)}else{HEAP32[r62>>2]=r87+4}if((r83|0)>0){r134=r140,r135=r134>>2;r136=r83}else{break}}}if((HEAP32[r12]|0)==(HEAP32[r4>>2]|0)){r6=855;break L693}else{r69=r17;r70=r120;r71=r121;r72=r122;r73=r123}}else{r69=r17;r70=r11;r71=r49;r72=r48;r73=r47}}while(0);L992:do{if(r6==633){r6=0;if((r50|0)==3){r58=r47;r59=r48;r60=r49;r61=r17;r6=857;break L693}else{r143=r57,r144=r143>>2}while(1){r51=HEAP32[r3],r52=r51>>2;do{if((r51|0)==0){r145=1}else{r83=HEAP32[r52+3];if((r83|0)==(HEAP32[r52+4]|0)){r146=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r51)}else{r146=HEAP32[r83>>2]}if((r146|0)==-1){HEAP32[r3]=0;r145=1;break}else{r145=(HEAP32[r3]|0)==0;break}}}while(0);do{if((r143|0)==0){r6=647}else{r51=HEAP32[r144+3];if((r51|0)==(HEAP32[r144+4]|0)){r147=FUNCTION_TABLE[HEAP32[HEAP32[r144]+36>>2]](r143)}else{r147=HEAP32[r51>>2]}if((r147|0)==-1){HEAP32[r1]=0;r6=647;break}else{if(r145^(r143|0)==0){r148=r143;break}else{r69=r17;r70=r11;r71=r49;r72=r48;r73=r47;break L992}}}}while(0);if(r6==647){r6=0;if(r145){r69=r17;r70=r11;r71=r49;r72=r48;r73=r47;break L992}else{r148=0}}r51=HEAP32[r3],r52=r51>>2;r83=HEAP32[r52+3];if((r83|0)==(HEAP32[r52+4]|0)){r149=FUNCTION_TABLE[HEAP32[HEAP32[r52]+36>>2]](r51)}else{r149=HEAP32[r83>>2]}if(!FUNCTION_TABLE[HEAP32[HEAP32[r2]+12>>2]](r8,8192,r149)){r69=r17;r70=r11;r71=r49;r72=r48;r73=r47;break L992}r83=HEAP32[r3];r51=r83+12|0;r52=HEAP32[r51>>2];if((r52|0)==(HEAP32[r83+16>>2]|0)){r150=FUNCTION_TABLE[HEAP32[HEAP32[r83>>2]+40>>2]](r83)}else{HEAP32[r51>>2]=r52+4;r150=HEAP32[r52>>2]}r52=HEAP8[r35];if((r52&1)==0){r151=1;r152=r52}else{r52=HEAP32[r30>>2];r151=(r52&-2)-1|0;r152=r52&255}r52=r152&255;r51=(r52&1|0)==0?r52>>>1:HEAP32[r34];if((r51|0)==(r151|0)){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r27,r151,1,r151,r151,0,0);r153=HEAP8[r35]}else{r153=r152}r52=(r153&1)==0?r36:HEAP32[r32];HEAP32[r52+(r51<<2)>>2]=r150;r83=r51+1|0;HEAP32[r52+(r83<<2)>>2]=0;if((HEAP8[r35]&1)==0){HEAP8[r35]=r83<<1&255;r143=r148,r144=r143>>2;continue}else{HEAP32[r34]=r83;r143=r148,r144=r143>>2;continue}}}}while(0);r83=r50+1|0;if(r83>>>0<4){r47=r73;r48=r72;r49=r71;r11=r70;r17=r69;r50=r83}else{r58=r73;r59=r72;r60=r71;r61=r69;r6=857;break}}L1039:do{if(r6==780){__ZSt17__throw_bad_allocv()}else if(r6==794){__ZSt17__throw_bad_allocv()}else if(r6==820){HEAP32[r13]=HEAP32[r13]|4;r154=0;r155=r122;r156=r123}else if(r6==844){HEAP32[r13]=HEAP32[r13]|4;r154=0;r155=r122;r156=r123}else if(r6==855){HEAP32[r13]=HEAP32[r13]|4;r154=0;r155=r122;r156=r123}else if(r6==857){L1048:do{if((r61|0)!=0){r69=r61;r71=r61+4|0;r72=r61+8|0;r73=1;L1050:while(1){r50=HEAPU8[r69];if((r50&1|0)==0){r157=r50>>>1}else{r157=HEAP32[r71>>2]}if(r73>>>0>=r157>>>0){break L1048}r50=HEAP32[r3],r17=r50>>2;do{if((r50|0)==0){r158=1}else{r70=HEAP32[r17+3];if((r70|0)==(HEAP32[r17+4]|0)){r159=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r159=HEAP32[r70>>2]}if((r159|0)==-1){HEAP32[r3]=0;r158=1;break}else{r158=(HEAP32[r3]|0)==0;break}}}while(0);r50=HEAP32[r1],r17=r50>>2;do{if((r50|0)==0){r6=876}else{r70=HEAP32[r17+3];if((r70|0)==(HEAP32[r17+4]|0)){r160=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r160=HEAP32[r70>>2]}if((r160|0)==-1){HEAP32[r1]=0;r6=876;break}else{if(r158^(r50|0)==0){break}else{break L1050}}}}while(0);if(r6==876){r6=0;if(r158){break}}r50=HEAP32[r3],r17=r50>>2;r70=HEAP32[r17+3];if((r70|0)==(HEAP32[r17+4]|0)){r161=FUNCTION_TABLE[HEAP32[HEAP32[r17]+36>>2]](r50)}else{r161=HEAP32[r70>>2]}if((HEAP8[r69]&1)==0){r162=r71}else{r162=HEAP32[r72>>2]}if((r161|0)!=(HEAP32[r162+(r73<<2)>>2]|0)){break}r70=r73+1|0;r50=HEAP32[r3];r17=r50+12|0;r11=HEAP32[r17>>2];if((r11|0)==(HEAP32[r50+16>>2]|0)){FUNCTION_TABLE[HEAP32[HEAP32[r50>>2]+40>>2]](r50);r73=r70;continue}else{HEAP32[r17>>2]=r11+4;r73=r70;continue}}HEAP32[r13]=HEAP32[r13]|4;r154=0;r155=r59;r156=r58;break L1039}}while(0);if((r59|0)==(r60|0)){r154=1;r155=r60;r156=r58;break}HEAP32[r29>>2]=0;__ZNSt3__116__check_groupingERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEEPjS8_Rj(r21,r59,r60,r29);if((HEAP32[r29>>2]|0)==0){r154=1;r155=r59;r156=r58;break}HEAP32[r13]=HEAP32[r13]|4;r154=0;r155=r59;r156=r58}else if(r6==632){HEAP32[r13]=HEAP32[r13]|4;r154=0;r155=r48;r156=r47}else if(r6==705){HEAP32[r13]=HEAP32[r13]|4;r154=0;r155=r48;r156=r47}else if(r6==749){HEAP32[r13]=HEAP32[r13]|4;r154=0;r155=r48;r156=r47}}while(0);if((HEAP8[r35]&1)!=0){__ZdlPv(HEAP32[r32])}if((HEAP8[r33]&1)!=0){__ZdlPv(HEAP32[r39])}if((HEAP8[r31]&1)!=0){__ZdlPv(HEAP32[r42])}if((HEAP8[r23]&1)!=0){__ZdlPv(HEAP32[r45])}if((HEAP8[r22]&1)!=0){__ZdlPv(HEAP32[r21+8>>2])}if((r155|0)==0){STACKTOP=r14;return r154}FUNCTION_TABLE[r156](r155);STACKTOP=r14;return r154}function __ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6appendIPwEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11,r12,r13;r4=r1;r5=r2;r6=HEAP8[r4];r7=r6&255;if((r7&1|0)==0){r8=r7>>>1}else{r8=HEAP32[r1+4>>2]}if((r6&1)==0){r9=1;r10=r6}else{r6=HEAP32[r1>>2];r9=(r6&-2)-1|0;r10=r6&255}r6=r3-r5>>2;if((r6|0)==0){return r1}if((r9-r8|0)>>>0<r6>>>0){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r9,r8+r6-r9|0,r8,r8,0,0);r11=HEAP8[r4]}else{r11=r10}if((r11&1)==0){r12=r1+4|0}else{r12=HEAP32[r1+8>>2]}r11=(r8<<2)+r12|0;if((r2|0)==(r3|0)){r13=r11}else{r10=r8+((r3-4+ -r5|0)>>>2)+1|0;r5=r2;r2=r11;while(1){HEAP32[r2>>2]=HEAP32[r5>>2];r11=r5+4|0;if((r11|0)==(r3|0)){break}else{r5=r11;r2=r2+4|0}}r13=(r10<<2)+r12|0}HEAP32[r13>>2]=0;r13=r8+r6|0;if((HEAP8[r4]&1)==0){HEAP8[r4]=r13<<1&255;return r1}else{HEAP32[r1+4>>2]=r13;return r1}}function __ZNKSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_getES4_S4_bRNS_8ios_baseERjRNS_12basic_stringIwS3_NS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39;r2=r8>>2;r9=0;r10=STACKTOP;STACKTOP=STACKTOP+456|0;r11=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r11>>2];r11=r4;r4=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r4>>2]=HEAP32[r11>>2];r11=r10,r12=r11>>2;r13=r10+16;r14=r10+416;r15=r10+424;r16=r10+432;r17=r10+440;r18=r10+448;r19=(r14|0)>>2;HEAP32[r19]=r13;r20=r14+4|0;HEAP32[r20>>2]=420;r21=(r16|0)>>2;r22=HEAP32[r6+28>>2];HEAP32[r21]=r22;r23=r22+4|0;tempValue=HEAP32[r23>>2],HEAP32[r23>>2]=tempValue+1,tempValue;r23=HEAP32[r21];if((HEAP32[4642]|0)!=-1){HEAP32[r12]=18568;HEAP32[r12+1]=24;HEAP32[r12+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r11,252)}r11=HEAP32[4643]-1|0;r12=HEAP32[r23+8>>2];do{if(HEAP32[r23+12>>2]-r12>>2>>>0>r11>>>0){r22=HEAP32[r12+(r11<<2)>>2];if((r22|0)==0){break}r24=r22;HEAP8[r17]=0;r25=r4|0;r26=HEAP32[r25>>2],r27=r26>>2;HEAP32[r18>>2]=r26;if(__ZNSt3__19money_getIwNS_19istreambuf_iteratorIwNS_11char_traitsIwEEEEE8__do_getERS4_S4_bRKNS_6localeEjRjRbRKNS_5ctypeIwEERNS_10unique_ptrIwPFvPvEEERPwSM_(r3,r18,r5,r16,HEAP32[r6+4>>2],r7,r17,r24,r14,r15,r13+400|0)){r28=r8;if((HEAP8[r28]&1)==0){HEAP32[r2+1]=0;HEAP8[r28]=0}else{HEAP32[HEAP32[r2+2]>>2]=0;HEAP32[r2+1]=0}r29=r22;do{if((HEAP8[r17]&1)!=0){r22=FUNCTION_TABLE[HEAP32[HEAP32[r29>>2]+44>>2]](r24,45);r30=HEAP8[r28];if((r30&1)==0){r31=1;r32=r30}else{r30=HEAP32[r2];r31=(r30&-2)-1|0;r32=r30&255}r30=r32&255;if((r30&1|0)==0){r33=r30>>>1}else{r33=HEAP32[r2+1]}if((r33|0)==(r31|0)){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r8,r31,1,r31,r31,0,0);r34=HEAP8[r28]}else{r34=r32}if((r34&1)==0){r35=r8+4|0}else{r35=HEAP32[r2+2]}HEAP32[r35+(r33<<2)>>2]=r22;r22=r33+1|0;HEAP32[r35+(r22<<2)>>2]=0;if((HEAP8[r28]&1)==0){HEAP8[r28]=r22<<1&255;break}else{HEAP32[r2+1]=r22;break}}}while(0);r28=FUNCTION_TABLE[HEAP32[HEAP32[r29>>2]+44>>2]](r24,48);r22=HEAP32[r15>>2];r30=r22-4|0;r36=HEAP32[r19];while(1){if(r36>>>0>=r30>>>0){break}if((HEAP32[r36>>2]|0)==(r28|0)){r36=r36+4|0}else{break}}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6appendIPwEENS_9enable_ifIXsr21__is_forward_iteratorIT_EE5valueERS5_E4typeES9_S9_(r8,r36,r22)}r28=r3|0;r30=HEAP32[r28>>2],r24=r30>>2;do{if((r30|0)==0){r37=0}else{r29=HEAP32[r24+3];if((r29|0)==(HEAP32[r24+4]|0)){r38=FUNCTION_TABLE[HEAP32[HEAP32[r24]+36>>2]](r30)}else{r38=HEAP32[r29>>2]}if((r38|0)!=-1){r37=r30;break}HEAP32[r28>>2]=0;r37=0}}while(0);r28=(r37|0)==0;do{if((r26|0)==0){r9=977}else{r30=HEAP32[r27+3];if((r30|0)==(HEAP32[r27+4]|0)){r39=FUNCTION_TABLE[HEAP32[HEAP32[r27]+36>>2]](r26)}else{r39=HEAP32[r30>>2]}if((r39|0)==-1){HEAP32[r25>>2]=0;r9=977;break}else{if(r28^(r26|0)==0){break}else{r9=979;break}}}}while(0);if(r9==977){if(r28){r9=979}}if(r9==979){HEAP32[r7>>2]=HEAP32[r7>>2]|2}HEAP32[r1>>2]=r37;r26=HEAP32[r21];r25=r26+4|0;if(((tempValue=HEAP32[r25>>2],HEAP32[r25>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r26>>2]+8>>2]](r26|0)}r26=HEAP32[r19];HEAP32[r19]=0;if((r26|0)==0){STACKTOP=r10;return}FUNCTION_TABLE[HEAP32[r20>>2]](r26);STACKTOP=r10;return}}while(0);r10=___cxa_allocate_exception(4);HEAP32[r10>>2]=10008;___cxa_throw(r10,16120,514)}function __ZNSt3__111__money_getIwE13__gather_infoEbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_SJ_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r11=r9>>2;r12=r8>>2;r13=r7>>2;r14=STACKTOP;STACKTOP=STACKTOP+56|0;r15=r14,r16=r15>>2;r17=r14+16,r18=r17>>2;r19=r14+32;r20=r14+40;r21=r20>>2;r22=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r23=r22>>2;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=r24>>2;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r30=r29>>2;r31=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r32=r31>>2;r33=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r34=r33>>2;r35=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r36=r35>>2;if(r1){r1=HEAP32[r2>>2];if((HEAP32[4768]|0)!=-1){HEAP32[r18]=19072;HEAP32[r18+1]=24;HEAP32[r18+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19072,r17,252)}r17=HEAP32[4769]-1|0;r18=HEAP32[r1+8>>2];if(HEAP32[r1+12>>2]-r18>>2>>>0<=r17>>>0){r37=___cxa_allocate_exception(4);r38=r37;HEAP32[r38>>2]=10008;___cxa_throw(r37,16120,514)}r1=HEAP32[r18+(r17<<2)>>2];if((r1|0)==0){r37=___cxa_allocate_exception(4);r38=r37;HEAP32[r38>>2]=10008;___cxa_throw(r37,16120,514)}r37=r1;FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+44>>2]](r19,r37);r38=r3;tempBigInt=HEAP32[r19>>2];HEAP8[r38]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r38+3|0]=tempBigInt&255;r38=r1>>2;FUNCTION_TABLE[HEAP32[HEAP32[r38]+32>>2]](r20,r37);r20=r9,r19=r20>>2;if((HEAP8[r20]&1)==0){HEAP32[r11+1]=0;HEAP8[r20]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r19]=HEAP32[r21];HEAP32[r19+1]=HEAP32[r21+1];HEAP32[r19+2]=HEAP32[r21+2];HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r38]+28>>2]](r22,r37);r22=r8,r21=r22>>2;if((HEAP8[r22]&1)==0){HEAP32[r12+1]=0;HEAP8[r22]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r21]=HEAP32[r23];HEAP32[r21+1]=HEAP32[r23+1];HEAP32[r21+2]=HEAP32[r23+2];HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;r23=r1>>2;HEAP32[r4>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r23]+12>>2]](r37);HEAP32[r5>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r23]+16>>2]](r37);FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+20>>2]](r24,r37);r24=r6,r1=r24>>2;if((HEAP8[r24]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r24]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r1]=HEAP32[r25];HEAP32[r1+1]=HEAP32[r25+1];HEAP32[r1+2]=HEAP32[r25+2];HEAP32[r25]=0;HEAP32[r25+1]=0;HEAP32[r25+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r38]+24>>2]](r26,r37);r26=r7,r38=r26>>2;if((HEAP8[r26]&1)==0){HEAP32[r13+1]=0;HEAP8[r26]=0}else{HEAP32[HEAP32[r13+2]>>2]=0;HEAP32[r13+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r7,0);HEAP32[r38]=HEAP32[r27];HEAP32[r38+1]=HEAP32[r27+1];HEAP32[r38+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;r39=FUNCTION_TABLE[HEAP32[HEAP32[r23]+36>>2]](r37);HEAP32[r10>>2]=r39;STACKTOP=r14;return}else{r37=HEAP32[r2>>2];if((HEAP32[4770]|0)!=-1){HEAP32[r16]=19080;HEAP32[r16+1]=24;HEAP32[r16+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19080,r15,252)}r15=HEAP32[4771]-1|0;r16=HEAP32[r37+8>>2];if(HEAP32[r37+12>>2]-r16>>2>>>0<=r15>>>0){r40=___cxa_allocate_exception(4);r41=r40;HEAP32[r41>>2]=10008;___cxa_throw(r40,16120,514)}r37=HEAP32[r16+(r15<<2)>>2];if((r37|0)==0){r40=___cxa_allocate_exception(4);r41=r40;HEAP32[r41>>2]=10008;___cxa_throw(r40,16120,514)}r40=r37;FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+44>>2]](r28,r40);r41=r3;tempBigInt=HEAP32[r28>>2];HEAP8[r41]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r41+3|0]=tempBigInt&255;r41=r37>>2;FUNCTION_TABLE[HEAP32[HEAP32[r41]+32>>2]](r29,r40);r29=r9,r28=r29>>2;if((HEAP8[r29]&1)==0){HEAP32[r11+1]=0;HEAP8[r29]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r28]=HEAP32[r30];HEAP32[r28+1]=HEAP32[r30+1];HEAP32[r28+2]=HEAP32[r30+2];HEAP32[r30]=0;HEAP32[r30+1]=0;HEAP32[r30+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r41]+28>>2]](r31,r40);r31=r8,r30=r31>>2;if((HEAP8[r31]&1)==0){HEAP32[r12+1]=0;HEAP8[r31]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r30]=HEAP32[r32];HEAP32[r30+1]=HEAP32[r32+1];HEAP32[r30+2]=HEAP32[r32+2];HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0;r32=r37>>2;HEAP32[r4>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r32]+12>>2]](r40);HEAP32[r5>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r32]+16>>2]](r40);FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+20>>2]](r33,r40);r33=r6,r37=r33>>2;if((HEAP8[r33]&1)==0){HEAP8[r6+1|0]=0;HEAP8[r33]=0}else{HEAP8[HEAP32[r6+8>>2]]=0;HEAP32[r6+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r6,0);HEAP32[r37]=HEAP32[r34];HEAP32[r37+1]=HEAP32[r34+1];HEAP32[r37+2]=HEAP32[r34+2];HEAP32[r34]=0;HEAP32[r34+1]=0;HEAP32[r34+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r41]+24>>2]](r35,r40);r35=r7,r41=r35>>2;if((HEAP8[r35]&1)==0){HEAP32[r13+1]=0;HEAP8[r35]=0}else{HEAP32[HEAP32[r13+2]>>2]=0;HEAP32[r13+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r7,0);HEAP32[r41]=HEAP32[r36];HEAP32[r41+1]=HEAP32[r36+1];HEAP32[r41+2]=HEAP32[r36+2];HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0;r39=FUNCTION_TABLE[HEAP32[HEAP32[r32]+36>>2]](r40);HEAP32[r10>>2]=r39;STACKTOP=r14;return}}function __ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED1Ev(r1){return}function __ZNSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__119__double_or_nothingIwEEvRNS_10unique_ptrIT_PFvPvEEERPS2_S9_(r1,r2,r3){var r4,r5,r6,r7,r8,r9,r10,r11;r4=(r1+4|0)>>2;r5=(HEAP32[r4]|0)!=420;r6=(r1|0)>>2;r1=HEAP32[r6];r7=r1;r8=HEAP32[r3>>2]-r7|0;r9=r8>>>0<2147483647?r8<<1:-1;r8=HEAP32[r2>>2]-r7>>2;if(r5){r10=r1}else{r10=0}r1=_realloc(r10,r9);r10=r1;if((r1|0)==0){__ZSt17__throw_bad_allocv()}do{if(r5){HEAP32[r6]=r10;r11=r10}else{r1=HEAP32[r6];HEAP32[r6]=r10;if((r1|0)==0){r11=r10;break}FUNCTION_TABLE[HEAP32[r4]](r1);r11=HEAP32[r6]}}while(0);HEAP32[r4]=216;HEAP32[r2>>2]=(r8<<2)+r11;HEAP32[r3>>2]=(r9>>>2<<2)+HEAP32[r6];return}function __ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEce(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49;r2=STACKTOP;STACKTOP=STACKTOP+280|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r2,r9=r8>>2;r10=r2+120,r11=r10>>2;r12=r2+232;r13=r2+240;r14=r2+248;r15=r2+256;r16=r2+264;r17=r16,r18=r17>>2;r19=STACKTOP,r20=r19>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r19,r22=r21>>2;r23=STACKTOP,r24=r23>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=r23,r26=r25>>2;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+100|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r31=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r32=r2+16|0;HEAP32[r11]=r32;r33=r2+128|0;r34=_snprintf(r32,100,3008,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r7,tempInt));do{if(r34>>>0>99){if(HEAP8[19176]){r35=HEAP32[2246]}else{r32=_newlocale(1,2896,0);HEAP32[2246]=r32;HEAP8[19176]=1;r35=r32}r32=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r35,3008,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r7,tempInt));r36=HEAP32[r11];if((r36|0)==0){r37=___cxa_allocate_exception(4);HEAP32[r37>>2]=9976;___cxa_throw(r37,16104,66)}r37=_malloc(r32);if((r37|0)!=0){r38=r37;r39=r32;r40=r36;r41=r37;break}r37=___cxa_allocate_exception(4);HEAP32[r37>>2]=9976;___cxa_throw(r37,16104,66)}else{r38=r33;r39=r34;r40=0;r41=0}}while(0);r34=(r12|0)>>2;r33=HEAP32[r5+28>>2];HEAP32[r34]=r33;r7=r33+4|0;tempValue=HEAP32[r7>>2],HEAP32[r7>>2]=tempValue+1,tempValue;r7=HEAP32[r34];if((HEAP32[4644]|0)!=-1){HEAP32[r9]=18576;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r8,252)}r8=HEAP32[4645]-1|0;r9=HEAP32[r7+8>>2];do{if(HEAP32[r7+12>>2]-r9>>2>>>0>r8>>>0){r33=HEAP32[r9+(r8<<2)>>2];if((r33|0)==0){break}r35=r33;r10=HEAP32[r11];FUNCTION_TABLE[HEAP32[HEAP32[r33>>2]+32>>2]](r35,r10,r10+r39|0,r38);if((r39|0)==0){r42=0}else{r42=(HEAP8[HEAP32[r11]]|0)==45}HEAP32[r18]=0;HEAP32[r18+1]=0;HEAP32[r18+2]=0;HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;HEAP32[r26]=0;HEAP32[r26+1]=0;HEAP32[r26+2]=0;__ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r4,r42,r12,r13,r14,r15,r16,r19,r23,r27);r10=r28|0;r33=HEAP32[r27>>2];if((r39|0)>(r33|0)){r37=HEAPU8[r25];if((r37&1|0)==0){r43=r37>>>1}else{r43=HEAP32[r24+1]}r37=HEAPU8[r21];if((r37&1|0)==0){r44=r37>>>1}else{r44=HEAP32[r20+1]}r45=(r39-r33<<1|1)+r43+r44|0}else{r37=HEAPU8[r25];if((r37&1|0)==0){r46=r37>>>1}else{r46=HEAP32[r24+1]}r37=HEAPU8[r21];if((r37&1|0)==0){r47=r37>>>1}else{r47=HEAP32[r20+1]}r45=r47+(r46+2)|0}r37=r45+r33|0;do{if(r37>>>0>100){r36=_malloc(r37);if((r36|0)!=0){r48=r36;r49=r36;break}r36=___cxa_allocate_exception(4);HEAP32[r36>>2]=9976;___cxa_throw(r36,16104,66)}else{r48=r10;r49=0}}while(0);__ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r48,r29,r30,HEAP32[r5+4>>2],r38,r38+r39|0,r35,r42,r13,HEAP8[r14],HEAP8[r15],r16,r19,r23,r33);HEAP32[r31>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r31,r48,HEAP32[r29>>2],HEAP32[r30>>2],r5,r6);if((r49|0)!=0){_free(r49)}if((HEAP8[r25]&1)!=0){__ZdlPv(HEAP32[r24+2])}if((HEAP8[r21]&1)!=0){__ZdlPv(HEAP32[r20+2])}if((HEAP8[r17]&1)!=0){__ZdlPv(HEAP32[r16+8>>2])}r10=HEAP32[r34];r37=r10+4|0;if(((tempValue=HEAP32[r37>>2],HEAP32[r37>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+8>>2]](r10|0)}if((r41|0)!=0){_free(r41)}if((r40|0)==0){STACKTOP=r2;return}_free(r40);STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);HEAP32[r2>>2]=10008;___cxa_throw(r2,16120,514)}function __ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r11=r9>>2;r12=STACKTOP;STACKTOP=STACKTOP+40|0;r13=r12,r14=r13>>2;r15=r12+16,r16=r15>>2;r17=r12+32;r18=r17;r19=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r22=r21;r23=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=r23>>2;r25=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r26=r25>>2;r27=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r28=r27>>2;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=r29;r31=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r32=r31>>2;r33=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r34=r33;r35=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r36=r35>>2;r37=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r38=r37>>2;r39=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r40=r39>>2;r41=HEAP32[r3>>2]>>2;if(r1){if((HEAP32[4772]|0)!=-1){HEAP32[r16]=19088;HEAP32[r16+1]=24;HEAP32[r16+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19088,r15,252)}r15=HEAP32[4773]-1|0;r16=HEAP32[r41+2];if(HEAP32[r41+3]-r16>>2>>>0<=r15>>>0){r42=___cxa_allocate_exception(4);r43=r42;HEAP32[r43>>2]=10008;___cxa_throw(r42,16120,514)}r1=HEAP32[r16+(r15<<2)>>2],r15=r1>>2;if((r1|0)==0){r42=___cxa_allocate_exception(4);r43=r42;HEAP32[r43>>2]=10008;___cxa_throw(r42,16120,514)}r42=r1;r43=HEAP32[r15];if(r2){FUNCTION_TABLE[HEAP32[r43+44>>2]](r18,r42);r18=r4;tempBigInt=HEAP32[r17>>2];HEAP8[r18]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r18+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r15]+32>>2]](r19,r42);r19=r9,r18=r19>>2;if((HEAP8[r19]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r19]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r18]=HEAP32[r20];HEAP32[r18+1]=HEAP32[r20+1];HEAP32[r18+2]=HEAP32[r20+2];HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0}else{FUNCTION_TABLE[HEAP32[r43+40>>2]](r22,r42);r22=r4;tempBigInt=HEAP32[r21>>2];HEAP8[r22]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r22+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r15]+28>>2]](r23,r42);r23=r9,r22=r23>>2;if((HEAP8[r23]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r23]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r22]=HEAP32[r24];HEAP32[r22+1]=HEAP32[r24+1];HEAP32[r22+2]=HEAP32[r24+2];HEAP32[r24]=0;HEAP32[r24+1]=0;HEAP32[r24+2]=0}r24=r1;HEAP8[r5]=FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+12>>2]](r42);HEAP8[r6]=FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+16>>2]](r42);r24=r1;FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+20>>2]](r25,r42);r25=r7,r1=r25>>2;if((HEAP8[r25]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r25]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r1]=HEAP32[r26];HEAP32[r1+1]=HEAP32[r26+1];HEAP32[r1+2]=HEAP32[r26+2];HEAP32[r26]=0;HEAP32[r26+1]=0;HEAP32[r26+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r24>>2]+24>>2]](r27,r42);r27=r8,r24=r27>>2;if((HEAP8[r27]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r27]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r24]=HEAP32[r28];HEAP32[r24+1]=HEAP32[r28+1];HEAP32[r24+2]=HEAP32[r28+2];HEAP32[r28]=0;HEAP32[r28+1]=0;HEAP32[r28+2]=0;r44=FUNCTION_TABLE[HEAP32[HEAP32[r15]+36>>2]](r42);HEAP32[r10>>2]=r44;STACKTOP=r12;return}else{if((HEAP32[4774]|0)!=-1){HEAP32[r14]=19096;HEAP32[r14+1]=24;HEAP32[r14+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19096,r13,252)}r13=HEAP32[4775]-1|0;r14=HEAP32[r41+2];if(HEAP32[r41+3]-r14>>2>>>0<=r13>>>0){r45=___cxa_allocate_exception(4);r46=r45;HEAP32[r46>>2]=10008;___cxa_throw(r45,16120,514)}r41=HEAP32[r14+(r13<<2)>>2],r13=r41>>2;if((r41|0)==0){r45=___cxa_allocate_exception(4);r46=r45;HEAP32[r46>>2]=10008;___cxa_throw(r45,16120,514)}r45=r41;r46=HEAP32[r13];if(r2){FUNCTION_TABLE[HEAP32[r46+44>>2]](r30,r45);r30=r4;tempBigInt=HEAP32[r29>>2];HEAP8[r30]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r30+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r13]+32>>2]](r31,r45);r31=r9,r30=r31>>2;if((HEAP8[r31]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r31]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r30]=HEAP32[r32];HEAP32[r30+1]=HEAP32[r32+1];HEAP32[r30+2]=HEAP32[r32+2];HEAP32[r32]=0;HEAP32[r32+1]=0;HEAP32[r32+2]=0}else{FUNCTION_TABLE[HEAP32[r46+40>>2]](r34,r45);r34=r4;tempBigInt=HEAP32[r33>>2];HEAP8[r34]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r34+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r13]+28>>2]](r35,r45);r35=r9,r34=r35>>2;if((HEAP8[r35]&1)==0){HEAP8[r9+1|0]=0;HEAP8[r35]=0}else{HEAP8[HEAP32[r11+2]]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r9,0);HEAP32[r34]=HEAP32[r36];HEAP32[r34+1]=HEAP32[r36+1];HEAP32[r34+2]=HEAP32[r36+2];HEAP32[r36]=0;HEAP32[r36+1]=0;HEAP32[r36+2]=0}r36=r41;HEAP8[r5]=FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+12>>2]](r45);HEAP8[r6]=FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+16>>2]](r45);r36=r41;FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+20>>2]](r37,r45);r37=r7,r41=r37>>2;if((HEAP8[r37]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r37]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r41]=HEAP32[r38];HEAP32[r41+1]=HEAP32[r38+1];HEAP32[r41+2]=HEAP32[r38+2];HEAP32[r38]=0;HEAP32[r38+1]=0;HEAP32[r38+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+24>>2]](r39,r45);r39=r8,r36=r39>>2;if((HEAP8[r39]&1)==0){HEAP8[r8+1|0]=0;HEAP8[r39]=0}else{HEAP8[HEAP32[r8+8>>2]]=0;HEAP32[r8+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r8,0);HEAP32[r36]=HEAP32[r40];HEAP32[r36+1]=HEAP32[r40+1];HEAP32[r36+2]=HEAP32[r40+2];HEAP32[r40]=0;HEAP32[r40+1]=0;HEAP32[r40+2]=0;r44=FUNCTION_TABLE[HEAP32[HEAP32[r13]+36>>2]](r45);HEAP32[r10>>2]=r44;STACKTOP=r12;return}}function __ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED1Ev(r1){return}function __ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15){var r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77;r16=r3>>2;r3=0;HEAP32[r16]=r1;r17=r7>>2;r18=r14;r19=r14+1|0;r20=r14+8|0;r21=(r14+4|0)>>2;r14=r13;r22=(r4&512|0)==0;r23=r13+1|0;r24=r13+4|0;r25=r13+8|0;r13=r7+8|0;r26=(r15|0)>0;r27=r12;r28=r12+1|0;r29=(r12+8|0)>>2;r30=r12+4|0;r12=-r15|0;r31=r5;r5=0;while(1){r32=HEAP8[r9+r5|0]|0;do{if((r32|0)==0){HEAP32[r2>>2]=HEAP32[r16];r33=r31}else if((r32|0)==1){HEAP32[r2>>2]=HEAP32[r16];r34=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,32);r35=HEAP32[r16];HEAP32[r16]=r35+1;HEAP8[r35]=r34;r33=r31}else if((r32|0)==3){r34=HEAP8[r18];r35=r34&255;if((r35&1|0)==0){r36=r35>>>1}else{r36=HEAP32[r21]}if((r36|0)==0){r33=r31;break}if((r34&1)==0){r37=r19}else{r37=HEAP32[r20>>2]}r34=HEAP8[r37];r35=HEAP32[r16];HEAP32[r16]=r35+1;HEAP8[r35]=r34;r33=r31}else if((r32|0)==2){r34=HEAP8[r14];r35=r34&255;r38=(r35&1|0)==0;if(r38){r39=r35>>>1}else{r39=HEAP32[r24>>2]}if((r39|0)==0|r22){r33=r31;break}if((r34&1)==0){r40=r23;r41=r23}else{r34=HEAP32[r25>>2];r40=r34;r41=r34}if(r38){r42=r35>>>1}else{r42=HEAP32[r24>>2]}r35=r40+r42|0;r38=HEAP32[r16];if((r41|0)==(r35|0)){r43=r38}else{r34=r41;r44=r38;while(1){HEAP8[r44]=HEAP8[r34];r38=r34+1|0;r45=r44+1|0;if((r38|0)==(r35|0)){r43=r45;break}else{r34=r38;r44=r45}}}HEAP32[r16]=r43;r33=r31}else if((r32|0)==4){r44=HEAP32[r16];r34=r8?r31+1|0:r31;r35=r34;while(1){if(r35>>>0>=r6>>>0){break}r45=HEAP8[r35];if(r45<<24>>24<=-1){break}if((HEAP16[HEAP32[r13>>2]+(r45<<24>>24<<1)>>1]&2048)==0){break}else{r35=r35+1|0}}r45=r35;if(r26){if(r35>>>0>r34>>>0){r38=r34+ -r45|0;r45=r38>>>0<r12>>>0?r12:r38;r38=r45+r15|0;r46=r35;r47=r15;r48=r44;while(1){r49=r46-1|0;r50=HEAP8[r49];HEAP32[r16]=r48+1;HEAP8[r48]=r50;r50=r47-1|0;r51=(r50|0)>0;if(!(r49>>>0>r34>>>0&r51)){break}r46=r49;r47=r50;r48=HEAP32[r16]}r48=r35+r45|0;if(r51){r52=r38;r53=r48;r3=1243}else{r54=0;r55=r38;r56=r48}}else{r52=r15;r53=r35;r3=1243}if(r3==1243){r3=0;r54=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,48);r55=r52;r56=r53}r48=HEAP32[r16];HEAP32[r16]=r48+1;if((r55|0)>0){r47=r55;r46=r48;while(1){HEAP8[r46]=r54;r50=r47-1|0;r49=HEAP32[r16];HEAP32[r16]=r49+1;if((r50|0)>0){r47=r50;r46=r49}else{r57=r49;break}}}else{r57=r48}HEAP8[r57]=r10;r58=r56}else{r58=r35}if((r58|0)==(r34|0)){r46=FUNCTION_TABLE[HEAP32[HEAP32[r17]+28>>2]](r7,48);r47=HEAP32[r16];HEAP32[r16]=r47+1;HEAP8[r47]=r46}else{r46=HEAP8[r27];r47=r46&255;if((r47&1|0)==0){r59=r47>>>1}else{r59=HEAP32[r30>>2]}if((r59|0)==0){r60=r58;r61=0;r62=0;r63=-1}else{if((r46&1)==0){r64=r28}else{r64=HEAP32[r29]}r60=r58;r61=0;r62=0;r63=HEAP8[r64]|0}while(1){do{if((r61|0)==(r63|0)){r46=HEAP32[r16];HEAP32[r16]=r46+1;HEAP8[r46]=r11;r46=r62+1|0;r47=HEAP8[r27];r38=r47&255;if((r38&1|0)==0){r65=r38>>>1}else{r65=HEAP32[r30>>2]}if(r46>>>0>=r65>>>0){r66=r63;r67=r46;r68=0;break}r38=(r47&1)==0;if(r38){r69=r28}else{r69=HEAP32[r29]}if((HEAP8[r69+r46|0]|0)==127){r66=-1;r67=r46;r68=0;break}if(r38){r70=r28}else{r70=HEAP32[r29]}r66=HEAP8[r70+r46|0]|0;r67=r46;r68=0}else{r66=r63;r67=r62;r68=r61}}while(0);r46=r60-1|0;r38=HEAP8[r46];r47=HEAP32[r16];HEAP32[r16]=r47+1;HEAP8[r47]=r38;if((r46|0)==(r34|0)){break}else{r60=r46;r61=r68+1|0;r62=r67;r63=r66}}}r35=HEAP32[r16];if((r44|0)==(r35|0)){r33=r34;break}r48=r35-1|0;if(r44>>>0<r48>>>0){r71=r44;r72=r48}else{r33=r34;break}while(1){r48=HEAP8[r71];HEAP8[r71]=HEAP8[r72];HEAP8[r72]=r48;r48=r71+1|0;r35=r72-1|0;if(r48>>>0<r35>>>0){r71=r48;r72=r35}else{r33=r34;break}}}else{r33=r31}}while(0);r32=r5+1|0;if(r32>>>0<4){r31=r33;r5=r32}else{break}}r5=HEAP8[r18];r18=r5&255;r33=(r18&1|0)==0;if(r33){r73=r18>>>1}else{r73=HEAP32[r21]}if(r73>>>0>1){if((r5&1)==0){r74=r19;r75=r19}else{r19=HEAP32[r20>>2];r74=r19;r75=r19}if(r33){r76=r18>>>1}else{r76=HEAP32[r21]}r21=r74+r76|0;r76=HEAP32[r16];r74=r75+1|0;if((r74|0)==(r21|0)){r77=r76}else{r75=r76;r76=r74;while(1){HEAP8[r75]=HEAP8[r76];r74=r75+1|0;r18=r76+1|0;if((r18|0)==(r21|0)){r77=r74;break}else{r75=r74;r76=r18}}}HEAP32[r16]=r77}r77=r4&176;if((r77|0)==32){HEAP32[r2>>2]=HEAP32[r16];return}else if((r77|0)==16){return}else{HEAP32[r2>>2]=r1;return}}function __ZNSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__19money_putIcNS_19ostreambuf_iteratorIcNS_11char_traitsIcEEEEE6do_putES4_bRNS_8ios_baseEcRKNS_12basic_stringIcS3_NS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r2=r7>>2;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+24;r13=r8+32;r14=r8+40;r15=r8+48;r16=r15,r17=r16>>2;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r18,r21=r20>>2;r22=STACKTOP,r23=r22>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=r22,r25=r24>>2;r26=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+100|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r31=(r11|0)>>2;r32=HEAP32[r5+28>>2];HEAP32[r31]=r32;r33=r32+4|0;tempValue=HEAP32[r33>>2],HEAP32[r33>>2]=tempValue+1,tempValue;r33=HEAP32[r31];if((HEAP32[4644]|0)!=-1){HEAP32[r10]=18576;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r9,252)}r9=HEAP32[4645]-1|0;r10=HEAP32[r33+8>>2];do{if(HEAP32[r33+12>>2]-r10>>2>>>0>r9>>>0){r32=HEAP32[r10+(r9<<2)>>2];if((r32|0)==0){break}r34=r32;r35=r7;r36=r7;r37=HEAP8[r36];r38=r37&255;if((r38&1|0)==0){r39=r38>>>1}else{r39=HEAP32[r2+1]}if((r39|0)==0){r40=0}else{if((r37&1)==0){r41=r35+1|0}else{r41=HEAP32[r2+2]}r40=HEAP8[r41]<<24>>24==FUNCTION_TABLE[HEAP32[HEAP32[r32>>2]+28>>2]](r34,45)<<24>>24}HEAP32[r17]=0;HEAP32[r17+1]=0;HEAP32[r17+2]=0;HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;HEAP32[r25]=0;HEAP32[r25+1]=0;HEAP32[r25+2]=0;__ZNSt3__111__money_putIcE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERcS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESF_SF_Ri(r4,r40,r11,r12,r13,r14,r15,r18,r22,r26);r32=r27|0;r37=HEAP8[r36];r38=r37&255;r42=(r38&1|0)==0;if(r42){r43=r38>>>1}else{r43=HEAP32[r2+1]}r44=HEAP32[r26>>2];if((r43|0)>(r44|0)){if(r42){r45=r38>>>1}else{r45=HEAP32[r2+1]}r38=HEAPU8[r24];if((r38&1|0)==0){r46=r38>>>1}else{r46=HEAP32[r23+1]}r38=HEAPU8[r20];if((r38&1|0)==0){r47=r38>>>1}else{r47=HEAP32[r19+1]}r48=(r45-r44<<1|1)+r46+r47|0}else{r38=HEAPU8[r24];if((r38&1|0)==0){r49=r38>>>1}else{r49=HEAP32[r23+1]}r38=HEAPU8[r20];if((r38&1|0)==0){r50=r38>>>1}else{r50=HEAP32[r19+1]}r48=r50+(r49+2)|0}r38=r48+r44|0;do{if(r38>>>0>100){r42=_malloc(r38);if((r42|0)!=0){r51=r42;r52=r42;r53=HEAP8[r36];break}r42=___cxa_allocate_exception(4);HEAP32[r42>>2]=9976;___cxa_throw(r42,16104,66)}else{r51=r32;r52=0;r53=r37}}while(0);if((r53&1)==0){r54=r35+1|0;r55=r35+1|0}else{r37=HEAP32[r2+2];r54=r37;r55=r37}r37=r53&255;if((r37&1|0)==0){r56=r37>>>1}else{r56=HEAP32[r2+1]}__ZNSt3__111__money_putIcE8__formatEPcRS2_S3_jPKcS5_RKNS_5ctypeIcEEbRKNS_10money_base7patternEccRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEESL_SL_i(r51,r28,r29,HEAP32[r5+4>>2],r55,r54+r56|0,r34,r40,r12,HEAP8[r13],HEAP8[r14],r15,r18,r22,r44);HEAP32[r30>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIcNS_11char_traitsIcEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r30,r51,HEAP32[r28>>2],HEAP32[r29>>2],r5,r6);if((r52|0)!=0){_free(r52)}if((HEAP8[r24]&1)!=0){__ZdlPv(HEAP32[r23+2])}if((HEAP8[r20]&1)!=0){__ZdlPv(HEAP32[r19+2])}if((HEAP8[r16]&1)!=0){__ZdlPv(HEAP32[r15+8>>2])}r37=HEAP32[r31];r32=r37+4|0;if(((tempValue=HEAP32[r32>>2],HEAP32[r32>>2]=tempValue+ -1,tempValue)|0)!=0){STACKTOP=r8;return}FUNCTION_TABLE[HEAP32[HEAP32[r37>>2]+8>>2]](r37|0);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwe(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50;r2=STACKTOP;STACKTOP=STACKTOP+576|0;r8=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r8>>2];r8=r2,r9=r8>>2;r10=r2+120,r11=r10>>2;r12=r2+528;r13=r2+536;r14=r2+544;r15=r2+552;r16=r2+560;r17=r16,r18=r17>>2;r19=STACKTOP,r20=r19>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r19,r22=r21>>2;r23=STACKTOP,r24=r23>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=r23,r26=r25>>2;r27=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r28=STACKTOP;STACKTOP=STACKTOP+400|0;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r31=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r32=r2+16|0;HEAP32[r11]=r32;r33=r2+128|0;r34=_snprintf(r32,100,3008,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r7,tempInt));do{if(r34>>>0>99){if(HEAP8[19176]){r35=HEAP32[2246]}else{r32=_newlocale(1,2896,0);HEAP32[2246]=r32;HEAP8[19176]=1;r35=r32}r32=__ZNSt3__112__asprintf_lEPPcPvPKcz(r10,r35,3008,(tempInt=STACKTOP,STACKTOP=STACKTOP+8|0,HEAPF64[tempInt>>3]=r7,tempInt));r36=HEAP32[r11];if((r36|0)==0){r37=___cxa_allocate_exception(4);HEAP32[r37>>2]=9976;___cxa_throw(r37,16104,66)}r37=_malloc(r32<<2);r38=r37;if((r37|0)!=0){r39=r38;r40=r32;r41=r36;r42=r38;break}r38=___cxa_allocate_exception(4);HEAP32[r38>>2]=9976;___cxa_throw(r38,16104,66)}else{r39=r33;r40=r34;r41=0;r42=0}}while(0);r34=(r12|0)>>2;r33=HEAP32[r5+28>>2];HEAP32[r34]=r33;r7=r33+4|0;tempValue=HEAP32[r7>>2],HEAP32[r7>>2]=tempValue+1,tempValue;r7=HEAP32[r34];if((HEAP32[4642]|0)!=-1){HEAP32[r9]=18568;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r8,252)}r8=HEAP32[4643]-1|0;r9=HEAP32[r7+8>>2];do{if(HEAP32[r7+12>>2]-r9>>2>>>0>r8>>>0){r33=HEAP32[r9+(r8<<2)>>2];if((r33|0)==0){break}r35=r33;r10=HEAP32[r11];FUNCTION_TABLE[HEAP32[HEAP32[r33>>2]+48>>2]](r35,r10,r10+r40|0,r39);if((r40|0)==0){r43=0}else{r43=(HEAP8[HEAP32[r11]]|0)==45}HEAP32[r18]=0;HEAP32[r18+1]=0;HEAP32[r18+2]=0;HEAP32[r22]=0;HEAP32[r22+1]=0;HEAP32[r22+2]=0;HEAP32[r26]=0;HEAP32[r26+1]=0;HEAP32[r26+2]=0;__ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r4,r43,r12,r13,r14,r15,r16,r19,r23,r27);r10=r28|0;r33=HEAP32[r27>>2];if((r40|0)>(r33|0)){r38=HEAPU8[r25];if((r38&1|0)==0){r44=r38>>>1}else{r44=HEAP32[r24+1]}r38=HEAPU8[r21];if((r38&1|0)==0){r45=r38>>>1}else{r45=HEAP32[r20+1]}r46=(r40-r33<<1|1)+r44+r45|0}else{r38=HEAPU8[r25];if((r38&1|0)==0){r47=r38>>>1}else{r47=HEAP32[r24+1]}r38=HEAPU8[r21];if((r38&1|0)==0){r48=r38>>>1}else{r48=HEAP32[r20+1]}r46=r48+(r47+2)|0}r38=r46+r33|0;do{if(r38>>>0>100){r36=_malloc(r38<<2);r32=r36;if((r36|0)!=0){r49=r32;r50=r32;break}r32=___cxa_allocate_exception(4);HEAP32[r32>>2]=9976;___cxa_throw(r32,16104,66)}else{r49=r10;r50=0}}while(0);__ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r49,r29,r30,HEAP32[r5+4>>2],r39,(r40<<2)+r39|0,r35,r43,r13,HEAP32[r14>>2],HEAP32[r15>>2],r16,r19,r23,r33);HEAP32[r31>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r31,r49,HEAP32[r29>>2],HEAP32[r30>>2],r5,r6);if((r50|0)!=0){_free(r50)}if((HEAP8[r25]&1)!=0){__ZdlPv(HEAP32[r24+2])}if((HEAP8[r21]&1)!=0){__ZdlPv(HEAP32[r20+2])}if((HEAP8[r17]&1)!=0){__ZdlPv(HEAP32[r16+8>>2])}r10=HEAP32[r34];r38=r10+4|0;if(((tempValue=HEAP32[r38>>2],HEAP32[r38>>2]=tempValue+ -1,tempValue)|0)==0){FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+8>>2]](r10|0)}if((r42|0)!=0){_free(r42)}if((r41|0)==0){STACKTOP=r2;return}_free(r41);STACKTOP=r2;return}}while(0);r2=___cxa_allocate_exception(4);HEAP32[r2>>2]=10008;___cxa_throw(r2,16120,514)}function __ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10){var r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47;r11=r9>>2;r12=r8>>2;r13=STACKTOP;STACKTOP=STACKTOP+40|0;r14=r13,r15=r14>>2;r16=r13+16,r17=r16>>2;r18=r13+32;r19=r18;r20=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r21=r20>>2;r22=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r23=r22;r24=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r25=r24>>2;r26=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r27=r26>>2;r28=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r29=r28>>2;r30=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r31=r30;r32=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r33=r32>>2;r34=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r35=r34;r36=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r37=r36>>2;r38=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r39=r38>>2;r40=STACKTOP;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r41=r40>>2;r42=HEAP32[r3>>2]>>2;if(r1){if((HEAP32[4768]|0)!=-1){HEAP32[r17]=19072;HEAP32[r17+1]=24;HEAP32[r17+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19072,r16,252)}r16=HEAP32[4769]-1|0;r17=HEAP32[r42+2];if(HEAP32[r42+3]-r17>>2>>>0<=r16>>>0){r43=___cxa_allocate_exception(4);r44=r43;HEAP32[r44>>2]=10008;___cxa_throw(r43,16120,514)}r1=HEAP32[r17+(r16<<2)>>2],r16=r1>>2;if((r1|0)==0){r43=___cxa_allocate_exception(4);r44=r43;HEAP32[r44>>2]=10008;___cxa_throw(r43,16120,514)}r43=r1;r44=HEAP32[r16];if(r2){FUNCTION_TABLE[HEAP32[r44+44>>2]](r19,r43);r19=r4;tempBigInt=HEAP32[r18>>2];HEAP8[r19]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r19+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r16]+32>>2]](r20,r43);r20=r9,r19=r20>>2;if((HEAP8[r20]&1)==0){HEAP32[r11+1]=0;HEAP8[r20]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r19]=HEAP32[r21];HEAP32[r19+1]=HEAP32[r21+1];HEAP32[r19+2]=HEAP32[r21+2];HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0}else{FUNCTION_TABLE[HEAP32[r44+40>>2]](r23,r43);r23=r4;tempBigInt=HEAP32[r22>>2];HEAP8[r23]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r23+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r16]+28>>2]](r24,r43);r24=r9,r23=r24>>2;if((HEAP8[r24]&1)==0){HEAP32[r11+1]=0;HEAP8[r24]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r23]=HEAP32[r25];HEAP32[r23+1]=HEAP32[r25+1];HEAP32[r23+2]=HEAP32[r25+2];HEAP32[r25]=0;HEAP32[r25+1]=0;HEAP32[r25+2]=0}r25=r1>>2;HEAP32[r5>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r25]+12>>2]](r43);HEAP32[r6>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r25]+16>>2]](r43);FUNCTION_TABLE[HEAP32[HEAP32[r16]+20>>2]](r26,r43);r26=r7,r1=r26>>2;if((HEAP8[r26]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r26]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r1]=HEAP32[r27];HEAP32[r1+1]=HEAP32[r27+1];HEAP32[r1+2]=HEAP32[r27+2];HEAP32[r27]=0;HEAP32[r27+1]=0;HEAP32[r27+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r16]+24>>2]](r28,r43);r28=r8,r16=r28>>2;if((HEAP8[r28]&1)==0){HEAP32[r12+1]=0;HEAP8[r28]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r16]=HEAP32[r29];HEAP32[r16+1]=HEAP32[r29+1];HEAP32[r16+2]=HEAP32[r29+2];HEAP32[r29]=0;HEAP32[r29+1]=0;HEAP32[r29+2]=0;r45=FUNCTION_TABLE[HEAP32[HEAP32[r25]+36>>2]](r43);HEAP32[r10>>2]=r45;STACKTOP=r13;return}else{if((HEAP32[4770]|0)!=-1){HEAP32[r15]=19080;HEAP32[r15+1]=24;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19080,r14,252)}r14=HEAP32[4771]-1|0;r15=HEAP32[r42+2];if(HEAP32[r42+3]-r15>>2>>>0<=r14>>>0){r46=___cxa_allocate_exception(4);r47=r46;HEAP32[r47>>2]=10008;___cxa_throw(r46,16120,514)}r42=HEAP32[r15+(r14<<2)>>2],r14=r42>>2;if((r42|0)==0){r46=___cxa_allocate_exception(4);r47=r46;HEAP32[r47>>2]=10008;___cxa_throw(r46,16120,514)}r46=r42;r47=HEAP32[r14];if(r2){FUNCTION_TABLE[HEAP32[r47+44>>2]](r31,r46);r31=r4;tempBigInt=HEAP32[r30>>2];HEAP8[r31]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r31+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r14]+32>>2]](r32,r46);r32=r9,r31=r32>>2;if((HEAP8[r32]&1)==0){HEAP32[r11+1]=0;HEAP8[r32]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r31]=HEAP32[r33];HEAP32[r31+1]=HEAP32[r33+1];HEAP32[r31+2]=HEAP32[r33+2];HEAP32[r33]=0;HEAP32[r33+1]=0;HEAP32[r33+2]=0}else{FUNCTION_TABLE[HEAP32[r47+40>>2]](r35,r46);r35=r4;tempBigInt=HEAP32[r34>>2];HEAP8[r35]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r35+3|0]=tempBigInt&255;FUNCTION_TABLE[HEAP32[HEAP32[r14]+28>>2]](r36,r46);r36=r9,r35=r36>>2;if((HEAP8[r36]&1)==0){HEAP32[r11+1]=0;HEAP8[r36]=0}else{HEAP32[HEAP32[r11+2]>>2]=0;HEAP32[r11+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r9,0);HEAP32[r35]=HEAP32[r37];HEAP32[r35+1]=HEAP32[r37+1];HEAP32[r35+2]=HEAP32[r37+2];HEAP32[r37]=0;HEAP32[r37+1]=0;HEAP32[r37+2]=0}r37=r42>>2;HEAP32[r5>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r37]+12>>2]](r46);HEAP32[r6>>2]=FUNCTION_TABLE[HEAP32[HEAP32[r37]+16>>2]](r46);FUNCTION_TABLE[HEAP32[HEAP32[r14]+20>>2]](r38,r46);r38=r7,r6=r38>>2;if((HEAP8[r38]&1)==0){HEAP8[r7+1|0]=0;HEAP8[r38]=0}else{HEAP8[HEAP32[r7+8>>2]]=0;HEAP32[r7+4>>2]=0}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE7reserveEj(r7,0);HEAP32[r6]=HEAP32[r39];HEAP32[r6+1]=HEAP32[r39+1];HEAP32[r6+2]=HEAP32[r39+2];HEAP32[r39]=0;HEAP32[r39+1]=0;HEAP32[r39+2]=0;FUNCTION_TABLE[HEAP32[HEAP32[r14]+24>>2]](r40,r46);r40=r8,r14=r40>>2;if((HEAP8[r40]&1)==0){HEAP32[r12+1]=0;HEAP8[r40]=0}else{HEAP32[HEAP32[r12+2]>>2]=0;HEAP32[r12+1]=0}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE7reserveEj(r8,0);HEAP32[r14]=HEAP32[r41];HEAP32[r14+1]=HEAP32[r41+1];HEAP32[r14+2]=HEAP32[r41+2];HEAP32[r41]=0;HEAP32[r41+1]=0;HEAP32[r41+2]=0;r45=FUNCTION_TABLE[HEAP32[HEAP32[r37]+36>>2]](r46);HEAP32[r10>>2]=r45;STACKTOP=r13;return}}function __ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15){var r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77;r16=r3>>2;r3=0;HEAP32[r16]=r1;r17=r7>>2;r18=r14;r19=r14+4|0,r20=r19>>2;r21=r14+8|0;r14=r13;r22=(r4&512|0)==0;r23=r13+4|0;r24=r13+8|0;r13=r7;r25=(r15|0)>0;r26=r12;r27=r12+1|0;r28=(r12+8|0)>>2;r29=r12+4|0;r12=r5;r5=0;while(1){r30=HEAP8[r9+r5|0]|0;do{if((r30|0)==0){HEAP32[r2>>2]=HEAP32[r16];r31=r12}else if((r30|0)==1){HEAP32[r2>>2]=HEAP32[r16];r32=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,32);r33=HEAP32[r16];HEAP32[r16]=r33+4;HEAP32[r33>>2]=r32;r31=r12}else if((r30|0)==3){r32=HEAP8[r18];r33=r32&255;if((r33&1|0)==0){r34=r33>>>1}else{r34=HEAP32[r20]}if((r34|0)==0){r31=r12;break}if((r32&1)==0){r35=r19}else{r35=HEAP32[r21>>2]}r32=HEAP32[r35>>2];r33=HEAP32[r16];HEAP32[r16]=r33+4;HEAP32[r33>>2]=r32;r31=r12}else if((r30|0)==2){r32=HEAP8[r14];r33=r32&255;r36=(r33&1|0)==0;if(r36){r37=r33>>>1}else{r37=HEAP32[r23>>2]}if((r37|0)==0|r22){r31=r12;break}if((r32&1)==0){r38=r23;r39=r23;r40=r23}else{r32=HEAP32[r24>>2];r38=r32;r39=r32;r40=r32}if(r36){r41=r33>>>1}else{r41=HEAP32[r23>>2]}r33=(r41<<2)+r38|0;r36=HEAP32[r16];if((r39|0)==(r33|0)){r42=r36}else{r32=((r41-1<<2)+r38+ -r40|0)>>>2;r43=r39;r44=r36;while(1){HEAP32[r44>>2]=HEAP32[r43>>2];r45=r43+4|0;if((r45|0)==(r33|0)){break}r43=r45;r44=r44+4|0}r42=(r32+1<<2)+r36|0}HEAP32[r16]=r42;r31=r12}else if((r30|0)==4){r44=HEAP32[r16];r43=r8?r12+4|0:r12;r33=r43;while(1){if(r33>>>0>=r6>>>0){break}if(FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+12>>2]](r7,2048,HEAP32[r33>>2])){r33=r33+4|0}else{break}}if(r25){if(r33>>>0>r43>>>0){r36=r33;r32=r15;while(1){r46=r36-4|0;r45=HEAP32[r46>>2];r47=HEAP32[r16];HEAP32[r16]=r47+4;HEAP32[r47>>2]=r45;r48=r32-1|0;r49=(r48|0)>0;if(r46>>>0>r43>>>0&r49){r36=r46;r32=r48}else{break}}if(r49){r50=r48;r51=r46;r3=1547}else{r52=0;r53=r48;r54=r46}}else{r50=r15;r51=r33;r3=1547}if(r3==1547){r3=0;r52=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,48);r53=r50;r54=r51}r32=HEAP32[r16];HEAP32[r16]=r32+4;if((r53|0)>0){r36=r53;r45=r32;while(1){HEAP32[r45>>2]=r52;r47=r36-1|0;r55=HEAP32[r16];HEAP32[r16]=r55+4;if((r47|0)>0){r36=r47;r45=r55}else{r56=r55;break}}}else{r56=r32}HEAP32[r56>>2]=r10;r57=r54}else{r57=r33}if((r57|0)==(r43|0)){r45=FUNCTION_TABLE[HEAP32[HEAP32[r17]+44>>2]](r7,48);r36=HEAP32[r16];HEAP32[r16]=r36+4;HEAP32[r36>>2]=r45}else{r45=HEAP8[r26];r36=r45&255;if((r36&1|0)==0){r58=r36>>>1}else{r58=HEAP32[r29>>2]}if((r58|0)==0){r59=r57;r60=0;r61=0;r62=-1}else{if((r45&1)==0){r63=r27}else{r63=HEAP32[r28]}r59=r57;r60=0;r61=0;r62=HEAP8[r63]|0}while(1){do{if((r60|0)==(r62|0)){r45=HEAP32[r16];HEAP32[r16]=r45+4;HEAP32[r45>>2]=r11;r45=r61+1|0;r36=HEAP8[r26];r55=r36&255;if((r55&1|0)==0){r64=r55>>>1}else{r64=HEAP32[r29>>2]}if(r45>>>0>=r64>>>0){r65=r62;r66=r45;r67=0;break}r55=(r36&1)==0;if(r55){r68=r27}else{r68=HEAP32[r28]}if((HEAP8[r68+r45|0]|0)==127){r65=-1;r66=r45;r67=0;break}if(r55){r69=r27}else{r69=HEAP32[r28]}r65=HEAP8[r69+r45|0]|0;r66=r45;r67=0}else{r65=r62;r66=r61;r67=r60}}while(0);r45=r59-4|0;r55=HEAP32[r45>>2];r36=HEAP32[r16];HEAP32[r16]=r36+4;HEAP32[r36>>2]=r55;if((r45|0)==(r43|0)){break}else{r59=r45;r60=r67+1|0;r61=r66;r62=r65}}}r33=HEAP32[r16];if((r44|0)==(r33|0)){r31=r43;break}r32=r33-4|0;if(r44>>>0<r32>>>0){r70=r44;r71=r32}else{r31=r43;break}while(1){r32=HEAP32[r70>>2];HEAP32[r70>>2]=HEAP32[r71>>2];HEAP32[r71>>2]=r32;r32=r70+4|0;r33=r71-4|0;if(r32>>>0<r33>>>0){r70=r32;r71=r33}else{r31=r43;break}}}else{r31=r12}}while(0);r30=r5+1|0;if(r30>>>0<4){r12=r31;r5=r30}else{break}}r5=HEAP8[r18];r18=r5&255;r31=(r18&1|0)==0;if(r31){r72=r18>>>1}else{r72=HEAP32[r20]}if(r72>>>0>1){if((r5&1)==0){r73=r19;r74=r19;r75=r19}else{r19=HEAP32[r21>>2];r73=r19;r74=r19;r75=r19}if(r31){r76=r18>>>1}else{r76=HEAP32[r20]}r20=(r76<<2)+r73|0;r18=HEAP32[r16];r31=r74+4|0;if((r31|0)==(r20|0)){r77=r18}else{r74=(((r76-2<<2)+r73+ -r75|0)>>>2)+1|0;r75=r18;r73=r31;while(1){HEAP32[r75>>2]=HEAP32[r73>>2];r31=r73+4|0;if((r31|0)==(r20|0)){break}else{r75=r75+4|0;r73=r31}}r77=(r74<<2)+r18|0}HEAP32[r16]=r77}r77=r4&176;if((r77|0)==16){return}else if((r77|0)==32){HEAP32[r2>>2]=HEAP32[r16];return}else{HEAP32[r2>>2]=r1;return}}function __ZNSt3__18messagesIcED1Ev(r1){return}function __ZNSt3__18messagesIwED1Ev(r1){return}function __ZNSt3__18messagesIcED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__18messagesIcE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE(r1,r2,r3){var r4;if((HEAP8[r2]&1)==0){r4=r2+1|0}else{r4=HEAP32[r2+8>>2]}r2=__Z7catopenPKci(r4,200);return r2>>>(((r2|0)!=-1&1)>>>0)}function __ZNKSt3__18messagesIcE8do_closeEi(r1,r2){__Z8catcloseP8_nl_catd((r2|0)==-1?-1:r2<<1);return}function __ZNSt3__18messagesIwED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__18messagesIwE7do_openERKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNS_6localeE(r1,r2,r3){var r4;if((HEAP8[r2]&1)==0){r4=r2+1|0}else{r4=HEAP32[r2+8>>2]}r2=__Z7catopenPKci(r4,200);return r2>>>(((r2|0)!=-1&1)>>>0)}function __ZNKSt3__19money_putIwNS_19ostreambuf_iteratorIwNS_11char_traitsIwEEEEE6do_putES4_bRNS_8ios_baseEwRKNS_12basic_stringIwS3_NS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6,r7){var r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56;r2=r7>>2;r8=STACKTOP;STACKTOP=STACKTOP+64|0;r9=r3;r3=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;HEAP32[r3>>2]=HEAP32[r9>>2];r9=r8,r10=r9>>2;r11=r8+16;r12=r8+24;r13=r8+32;r14=r8+40;r15=r8+48;r16=r15,r17=r16>>2;r18=STACKTOP,r19=r18>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r20=r18,r21=r20>>2;r22=STACKTOP,r23=r22>>2;STACKTOP=STACKTOP+12|0;STACKTOP=STACKTOP+7>>3<<3;r24=r22,r25=r24>>2;r26=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r27=STACKTOP;STACKTOP=STACKTOP+400|0;r28=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r29=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r30=STACKTOP;STACKTOP=STACKTOP+4|0;STACKTOP=STACKTOP+7>>3<<3;r31=(r11|0)>>2;r32=HEAP32[r5+28>>2];HEAP32[r31]=r32;r33=r32+4|0;tempValue=HEAP32[r33>>2],HEAP32[r33>>2]=tempValue+1,tempValue;r33=HEAP32[r31];if((HEAP32[4642]|0)!=-1){HEAP32[r10]=18568;HEAP32[r10+1]=24;HEAP32[r10+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r9,252)}r9=HEAP32[4643]-1|0;r10=HEAP32[r33+8>>2];do{if(HEAP32[r33+12>>2]-r10>>2>>>0>r9>>>0){r32=HEAP32[r10+(r9<<2)>>2];if((r32|0)==0){break}r34=r32;r35=r7;r36=HEAP8[r35];r37=r36&255;if((r37&1|0)==0){r38=r37>>>1}else{r38=HEAP32[r2+1]}if((r38|0)==0){r39=0}else{if((r36&1)==0){r40=r7+4|0}else{r40=HEAP32[r2+2]}r39=(HEAP32[r40>>2]|0)==(FUNCTION_TABLE[HEAP32[HEAP32[r32>>2]+44>>2]](r34,45)|0)}HEAP32[r17]=0;HEAP32[r17+1]=0;HEAP32[r17+2]=0;HEAP32[r21]=0;HEAP32[r21+1]=0;HEAP32[r21+2]=0;HEAP32[r25]=0;HEAP32[r25+1]=0;HEAP32[r25+2]=0;__ZNSt3__111__money_putIwE13__gather_infoEbbRKNS_6localeERNS_10money_base7patternERwS8_RNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERNS9_IwNSA_IwEENSC_IwEEEESJ_Ri(r4,r39,r11,r12,r13,r14,r15,r18,r22,r26);r32=r27|0;r36=HEAP8[r35];r37=r36&255;r41=(r37&1|0)==0;if(r41){r42=r37>>>1}else{r42=HEAP32[r2+1]}r43=HEAP32[r26>>2];if((r42|0)>(r43|0)){if(r41){r44=r37>>>1}else{r44=HEAP32[r2+1]}r37=HEAPU8[r24];if((r37&1|0)==0){r45=r37>>>1}else{r45=HEAP32[r23+1]}r37=HEAPU8[r20];if((r37&1|0)==0){r46=r37>>>1}else{r46=HEAP32[r19+1]}r47=(r44-r43<<1|1)+r45+r46|0}else{r37=HEAPU8[r24];if((r37&1|0)==0){r48=r37>>>1}else{r48=HEAP32[r23+1]}r37=HEAPU8[r20];if((r37&1|0)==0){r49=r37>>>1}else{r49=HEAP32[r19+1]}r47=r49+(r48+2)|0}r37=r47+r43|0;do{if(r37>>>0>100){r41=_malloc(r37<<2);r50=r41;if((r41|0)!=0){r51=r50;r52=r50;r53=HEAP8[r35];break}r50=___cxa_allocate_exception(4);HEAP32[r50>>2]=9976;___cxa_throw(r50,16104,66)}else{r51=r32;r52=0;r53=r36}}while(0);if((r53&1)==0){r54=r7+4|0;r55=r7+4|0}else{r36=HEAP32[r2+2];r54=r36;r55=r36}r36=r53&255;if((r36&1|0)==0){r56=r36>>>1}else{r56=HEAP32[r2+1]}__ZNSt3__111__money_putIwE8__formatEPwRS2_S3_jPKwS5_RKNS_5ctypeIwEEbRKNS_10money_base7patternEwwRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEERKNSE_IwNSF_IwEENSH_IwEEEESQ_i(r51,r28,r29,HEAP32[r5+4>>2],r55,(r56<<2)+r54|0,r34,r39,r12,HEAP32[r13>>2],HEAP32[r14>>2],r15,r18,r22,r43);HEAP32[r30>>2]=HEAP32[r3>>2];__ZNSt3__116__pad_and_outputIwNS_11char_traitsIwEEEENS_19ostreambuf_iteratorIT_T0_EES6_PKS4_S8_S8_RNS_8ios_baseES4_(r1,r30,r51,HEAP32[r28>>2],HEAP32[r29>>2],r5,r6);if((r52|0)!=0){_free(r52)}if((HEAP8[r24]&1)!=0){__ZdlPv(HEAP32[r23+2])}if((HEAP8[r20]&1)!=0){__ZdlPv(HEAP32[r19+2])}if((HEAP8[r16]&1)!=0){__ZdlPv(HEAP32[r15+8>>2])}r36=HEAP32[r31];r32=r36+4|0;if(((tempValue=HEAP32[r32>>2],HEAP32[r32>>2]=tempValue+ -1,tempValue)|0)!=0){STACKTOP=r8;return}FUNCTION_TABLE[HEAP32[HEAP32[r36>>2]+8>>2]](r36|0);STACKTOP=r8;return}}while(0);r8=___cxa_allocate_exception(4);HEAP32[r8>>2]=10008;___cxa_throw(r8,16120,514)}function __ZNKSt3__18messagesIcE6do_getEiiiRKNS_12basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+16|0;r8=r7;r9=r8,r10=r9>>2;HEAP32[r10]=0;HEAP32[r10+1]=0;HEAP32[r10+2]=0;r10=r1,r11=r10>>2;r12=r6;r13=HEAP8[r6];if((r13&1)==0){r14=r12+1|0;r15=r12+1|0}else{r12=HEAP32[r6+8>>2];r14=r12;r15=r12}r12=r13&255;if((r12&1|0)==0){r16=r12>>>1}else{r16=HEAP32[r6+4>>2]}r6=r14+r16|0;do{if(r15>>>0<r6>>>0){r16=r8+1|0;r14=(r8+8|0)>>2;r12=r8|0;r13=r8+4|0;r17=r15;r18=0;while(1){r19=HEAP8[r17];if((r18&1)==0){r20=10;r21=r18}else{r22=HEAP32[r12>>2];r20=(r22&-2)-1|0;r21=r22&255}r22=r21&255;r23=(r22&1|0)==0?r22>>>1:HEAP32[r13>>2];if((r23|0)==(r20|0)){if((r20|0)==-3){r2=1700;break}r22=(r21&1)==0?r16:HEAP32[r14];do{if(r20>>>0<2147483631){r24=r20+1|0;r25=r20<<1;r26=r24>>>0<r25>>>0?r25:r24;if(r26>>>0<11){r27=11;break}r27=r26+16&-16}else{r27=-2}}while(0);r26=__Znwj(r27);_memcpy(r26,r22,r20)|0;if((r20|0)!=10){__ZdlPv(r22)}HEAP32[r14]=r26;r26=r27|1;HEAP32[r12>>2]=r26;r28=r26&255}else{r28=r21}r26=(r28&1)==0?r16:HEAP32[r14];HEAP8[r26+r23|0]=r19;r24=r23+1|0;HEAP8[r26+r24|0]=0;r26=HEAP8[r9];if((r26&1)==0){r25=r24<<1&255;HEAP8[r9]=r25;r29=r25}else{HEAP32[r13>>2]=r24;r29=r26}r26=r17+1|0;if(r26>>>0<r6>>>0){r17=r26;r18=r29}else{r2=1713;break}}if(r2==1700){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}else if(r2==1713){r18=(r3|0)==-1?-1:r3<<1;if((r29&1)==0){r30=r18;r2=1718;break}r31=HEAP32[r8+8>>2];r32=r18;break}}else{r30=(r3|0)==-1?-1:r3<<1;r2=1718}}while(0);if(r2==1718){r31=r8+1|0;r32=r30}r30=__Z7catgetsP8_nl_catdiiPKc(r32,r4,r5,r31);HEAP32[r11]=0;HEAP32[r11+1]=0;HEAP32[r11+2]=0;r11=_strlen(r30);r31=r30+r11|0;if((r11|0)>0){r11=r1+1|0;r5=r1+4|0;r4=r1+8|0;r32=r1|0;r2=r30;r30=0;while(1){r3=HEAP8[r2];if((r30&1)==0){r33=10;r34=r30}else{r29=HEAP32[r32>>2];r33=(r29&-2)-1|0;r34=r29&255}r29=r34&255;if((r29&1|0)==0){r35=r29>>>1}else{r35=HEAP32[r5>>2]}if((r35|0)==(r33|0)){__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9__grow_byEjjjjjj(r1,r33,1,r33,r33,0,0);r36=HEAP8[r10]}else{r36=r34}if((r36&1)==0){r37=r11}else{r37=HEAP32[r4>>2]}HEAP8[r37+r35|0]=r3;r3=r35+1|0;HEAP8[r37+r3|0]=0;r29=HEAP8[r10];if((r29&1)==0){r6=r3<<1&255;HEAP8[r10]=r6;r38=r6}else{HEAP32[r5>>2]=r3;r38=r29}r29=r2+1|0;if(r29>>>0<r31>>>0){r2=r29;r30=r38}else{break}}}if((HEAP8[r9]&1)==0){STACKTOP=r7;return}__ZdlPv(HEAP32[r8+8>>2]);STACKTOP=r7;return}function __ZNKSt3__18messagesIwE8do_closeEi(r1,r2){__Z8catcloseP8_nl_catd((r2|0)==-1?-1:r2<<1);return}function __ZNKSt3__18messagesIwE6do_getEiiiRKNS_12basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEEE(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60;r2=0;r7=STACKTOP;STACKTOP=STACKTOP+224|0;r8=r7;r9=r7+8;r10=r7+40;r11=r7+48,r12=r11>>2;r13=r7+56;r14=r7+64;r15=r7+192;r16=r7+200,r17=r16>>2;r18=r7+208;r19=r18,r20=r19>>2;r21=STACKTOP;STACKTOP=STACKTOP+8|0;r22=STACKTOP;STACKTOP=STACKTOP+8|0;HEAP32[r20]=0;HEAP32[r20+1]=0;HEAP32[r20+2]=0;r20=r1,r23=r20>>2;r24=r21|0;HEAP32[r21+4>>2]=0;HEAP32[r21>>2]=11672;r25=HEAP8[r6];if((r25&1)==0){r26=r6+4|0;r27=r6+4|0}else{r28=HEAP32[r6+8>>2];r26=r28;r27=r28}r28=r25&255;if((r28&1|0)==0){r29=r28>>>1}else{r29=HEAP32[r6+4>>2]}r6=(r29<<2)+r26|0;do{if(r27>>>0<r6>>>0){r26=r21;r29=r9|0;r28=r9+32|0;r25=r18+1|0;r30=(r18+8|0)>>2;r31=r18|0;r32=r18+4|0;r33=r27;r34=11672;L2092:while(1){HEAP32[r12]=r33;r35=(FUNCTION_TABLE[HEAP32[r34+12>>2]](r24,r8,r33,r6,r11,r29,r28,r10)|0)==2;r36=HEAP32[r12];if(r35|(r36|0)==(r33|0)){r2=1760;break}if(r29>>>0<HEAP32[r10>>2]>>>0){r35=r29;r37=HEAP8[r19];while(1){r38=HEAP8[r35];if((r37&1)==0){r39=10;r40=r37}else{r41=HEAP32[r31>>2];r39=(r41&-2)-1|0;r40=r41&255}r41=r40&255;r42=(r41&1|0)==0?r41>>>1:HEAP32[r32>>2];if((r42|0)==(r39|0)){if((r39|0)==-3){r2=1770;break L2092}r41=(r40&1)==0?r25:HEAP32[r30];do{if(r39>>>0<2147483631){r43=r39+1|0;r44=r39<<1;r45=r43>>>0<r44>>>0?r44:r43;if(r45>>>0<11){r46=11;break}r46=r45+16&-16}else{r46=-2}}while(0);r45=__Znwj(r46);_memcpy(r45,r41,r39)|0;if((r39|0)!=10){__ZdlPv(r41)}HEAP32[r30]=r45;r45=r46|1;HEAP32[r31>>2]=r45;r47=r45&255}else{r47=r40}r45=(r47&1)==0?r25:HEAP32[r30];HEAP8[r45+r42|0]=r38;r43=r42+1|0;HEAP8[r45+r43|0]=0;r45=HEAP8[r19];if((r45&1)==0){r44=r43<<1&255;HEAP8[r19]=r44;r48=r44}else{HEAP32[r32>>2]=r43;r48=r45}r45=r35+1|0;if(r45>>>0<HEAP32[r10>>2]>>>0){r35=r45;r37=r48}else{break}}r49=HEAP32[r12]}else{r49=r36}if(r49>>>0>=r6>>>0){r2=1786;break}r33=r49;r34=HEAP32[r26>>2]}if(r2==1770){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}else if(r2==1786){r26=(r3|0)==-1?-1:r3<<1;if((HEAP8[r19]&1)==0){r50=r26;r2=1793;break}r51=HEAP32[r18+8>>2];r52=r26;break}else if(r2==1760){r26=___cxa_allocate_exception(8);HEAP32[r26>>2]=10040;r34=r26+4|0;if((r34|0)!=0){r33=__Znaj(33),r32=r33>>2;HEAP32[r32+1]=20;HEAP32[r32]=20;r30=r33+12|0;HEAP32[r34>>2]=r30;HEAP32[r32+2]=0;_memcpy(r30,1448,21)|0}___cxa_throw(r26,16136,184)}}else{r50=(r3|0)==-1?-1:r3<<1;r2=1793}}while(0);if(r2==1793){r51=r18+1|0;r52=r50}r50=__Z7catgetsP8_nl_catdiiPKc(r52,r4,r5,r51);HEAP32[r23]=0;HEAP32[r23+1]=0;HEAP32[r23+2]=0;r23=r22|0;HEAP32[r22+4>>2]=0;HEAP32[r22>>2]=11616;r51=_strlen(r50);r5=r50+r51|0;L2138:do{if((r51|0)>=1){r4=r22;r52=r5;r2=r14|0;r3=r14+128|0;r49=r1+4|0;r6=r1+8|0;r12=r1|0;r48=r50;r10=0;r47=11616;while(1){HEAP32[r17]=r48;r40=(FUNCTION_TABLE[HEAP32[r47+16>>2]](r23,r13,r48,(r52-r48|0)>32?r48+32|0:r5,r16,r2,r3,r15)|0)==2;r46=HEAP32[r17];if(r40|(r46|0)==(r48|0)){break}if(r2>>>0<HEAP32[r15>>2]>>>0){r40=r2;r39=r10;while(1){r11=HEAP32[r40>>2];if((r39&1)==0){r53=1;r54=r39}else{r8=HEAP32[r12>>2];r53=(r8&-2)-1|0;r54=r8&255}r8=r54&255;if((r8&1|0)==0){r55=r8>>>1}else{r55=HEAP32[r49>>2]}if((r55|0)==(r53|0)){__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE9__grow_byEjjjjjj(r1,r53,1,r53,r53,0,0);r56=HEAP8[r20]}else{r56=r54}if((r56&1)==0){r57=r49}else{r57=HEAP32[r6>>2]}HEAP32[r57+(r55<<2)>>2]=r11;r11=r55+1|0;HEAP32[r57+(r11<<2)>>2]=0;r8=HEAP8[r20];if((r8&1)==0){r24=r11<<1&255;HEAP8[r20]=r24;r58=r24}else{HEAP32[r49>>2]=r11;r58=r8}r8=r40+4|0;if(r8>>>0<HEAP32[r15>>2]>>>0){r40=r8;r39=r58}else{break}}r59=HEAP32[r17];r60=r58}else{r59=r46;r60=r10}if(r59>>>0>=r5>>>0){break L2138}r48=r59;r10=r60;r47=HEAP32[r4>>2]}r4=___cxa_allocate_exception(8);HEAP32[r4>>2]=10040;r47=r4+4|0;if((r47|0)!=0){r10=__Znaj(33),r48=r10>>2;HEAP32[r48+1]=20;HEAP32[r48]=20;r49=r10+12|0;HEAP32[r47>>2]=r49;HEAP32[r48+2]=0;_memcpy(r49,1448,21)|0}___cxa_throw(r4,16136,184)}}while(0);if((HEAP8[r19]&1)==0){STACKTOP=r7;return}__ZdlPv(HEAP32[r18+8>>2]);STACKTOP=r7;return}function __ZNSt3__17codecvtIwc10_mbstate_tED2Ev(r1){var r2;HEAP32[r1>>2]=11136;r2=HEAP32[r1+8>>2];if((r2|0)==0){return}_freelocale(r2);return}function __ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv(r1){var r2,r3,r4,r5,r6;r1=___cxa_allocate_exception(8);HEAP32[r1>>2]=10104;r2=r1+4|0;if((r2|0)==0){r3=r1;HEAP32[r3>>2]=10072;___cxa_throw(r1,16152,248)}r4=__Znaj(19),r5=r4>>2;HEAP32[r5+1]=6;HEAP32[r5]=6;r6=r4+12|0;HEAP32[r2>>2]=r6;HEAP32[r5+2]=0;HEAP8[r6]=HEAP8[2960];HEAP8[r6+1|0]=HEAP8[2961|0];HEAP8[r6+2|0]=HEAP8[2962|0];HEAP8[r6+3|0]=HEAP8[2963|0];HEAP8[r6+4|0]=HEAP8[2964|0];HEAP8[r6+5|0]=HEAP8[2965|0];HEAP8[r6+6|0]=HEAP8[2966|0];r3=r1;HEAP32[r3>>2]=10072;___cxa_throw(r1,16152,248)}function __ZNSt3__16locale5__impC2Ej(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95,r96,r97,r98,r99;r3=STACKTOP;STACKTOP=STACKTOP+448|0;r4=r3,r5=r4>>2;r6=r3+16,r7=r6>>2;r8=r3+32,r9=r8>>2;r10=r3+48,r11=r10>>2;r12=r3+64,r13=r12>>2;r14=r3+80,r15=r14>>2;r16=r3+96,r17=r16>>2;r18=r3+112,r19=r18>>2;r20=r3+128,r21=r20>>2;r22=r3+144,r23=r22>>2;r24=r3+160,r25=r24>>2;r26=r3+176,r27=r26>>2;r28=r3+192,r29=r28>>2;r30=r3+208,r31=r30>>2;r32=r3+224,r33=r32>>2;r34=r3+240,r35=r34>>2;r36=r3+256,r37=r36>>2;r38=r3+272,r39=r38>>2;r40=r3+288,r41=r40>>2;r42=r3+304,r43=r42>>2;r44=r3+320,r45=r44>>2;r46=r3+336,r47=r46>>2;r48=r3+352,r49=r48>>2;r50=r3+368,r51=r50>>2;r52=r3+384,r53=r52>>2;r54=r3+400,r55=r54>>2;r56=r3+416,r57=r56>>2;r58=r3+432,r59=r58>>2;HEAP32[r1+4>>2]=r2-1;HEAP32[r1>>2]=11392;r2=r1+8|0;r60=(r2|0)>>2;r61=(r1+12|0)>>2;HEAP8[r1+136|0]=1;r62=r1+24|0;r63=r62;HEAP32[r61]=r63;HEAP32[r60]=r63;HEAP32[r1+16>>2]=r62+112;r62=28;r64=r63;while(1){if((r64|0)==0){r65=0}else{HEAP32[r64>>2]=0;r65=HEAP32[r61]}r66=r65+4|0;HEAP32[r61]=r66;r63=r62-1|0;if((r63|0)==0){break}else{r62=r63;r64=r66}}r64=r1+144|0;r1=r64;HEAP8[r64]=2;HEAP8[r1+1|0]=67;HEAP8[r1+2|0]=0;r1=HEAP32[r60];if((r1|0)!=(r66|0)){HEAP32[r61]=(-((r65+ -r1|0)>>>2)<<2)+r65}HEAP32[2303]=0;HEAP32[2302]=11096;if((HEAP32[4564]|0)!=-1){HEAP32[r59]=18256;HEAP32[r59+1]=24;HEAP32[r59+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18256,r58,252)}r58=HEAP32[4565];r59=r58-1|0;tempValue=HEAP32[2303],HEAP32[2303]=tempValue+1,tempValue;r65=HEAP32[r61];r1=HEAP32[r60];r66=r65-r1>>2;do{if(r66>>>0>r59>>>0){r67=r1}else{if(r66>>>0<r58>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r58-r66|0);r67=HEAP32[r60];break}if(r66>>>0<=r58>>>0){r67=r1;break}r64=(r58<<2)+r1|0;if((r64|0)==(r65|0)){r67=r1;break}HEAP32[r61]=(((r65-4+ -r64|0)>>>2^-1)<<2)+r65;r67=r1}}while(0);r1=HEAP32[r67+(r59<<2)>>2];do{if((r1|0)!=0){r67=r1+4|0;if(((tempValue=HEAP32[r67>>2],HEAP32[r67>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r59<<2)>>2]=9208;HEAP32[2301]=0;HEAP32[2300]=11056;if((HEAP32[4562]|0)!=-1){HEAP32[r57]=18248;HEAP32[r57+1]=24;HEAP32[r57+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18248,r56,252)}r56=HEAP32[4563];r57=r56-1|0;tempValue=HEAP32[2301],HEAP32[2301]=tempValue+1,tempValue;r59=HEAP32[r61];r1=HEAP32[r60];r67=r59-r1>>2;do{if(r67>>>0>r57>>>0){r68=r1}else{if(r67>>>0<r56>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r56-r67|0);r68=HEAP32[r60];break}if(r67>>>0<=r56>>>0){r68=r1;break}r65=(r56<<2)+r1|0;if((r65|0)==(r59|0)){r68=r1;break}HEAP32[r61]=(((r59-4+ -r65|0)>>>2^-1)<<2)+r59;r68=r1}}while(0);r1=HEAP32[r68+(r57<<2)>>2];do{if((r1|0)!=0){r68=r1+4|0;if(((tempValue=HEAP32[r68>>2],HEAP32[r68>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r57<<2)>>2]=9200;HEAP32[2357]=0;HEAP32[2356]=11504;HEAP32[2358]=0;HEAP8[9436]=0;HEAP32[2358]=HEAP32[___ctype_b_loc()>>2];if((HEAP32[4644]|0)!=-1){HEAP32[r55]=18576;HEAP32[r55+1]=24;HEAP32[r55+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18576,r54,252)}r54=HEAP32[4645];r55=r54-1|0;tempValue=HEAP32[2357],HEAP32[2357]=tempValue+1,tempValue;r57=HEAP32[r61];r1=HEAP32[r60];r68=r57-r1>>2;do{if(r68>>>0>r55>>>0){r69=r1}else{if(r68>>>0<r54>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r54-r68|0);r69=HEAP32[r60];break}if(r68>>>0<=r54>>>0){r69=r1;break}r59=(r54<<2)+r1|0;if((r59|0)==(r57|0)){r69=r1;break}HEAP32[r61]=(((r57-4+ -r59|0)>>>2^-1)<<2)+r57;r69=r1}}while(0);r1=HEAP32[r69+(r55<<2)>>2];do{if((r1|0)!=0){r69=r1+4|0;if(((tempValue=HEAP32[r69>>2],HEAP32[r69>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r55<<2)>>2]=9424;HEAP32[2355]=0;HEAP32[2354]=11424;if((HEAP32[4642]|0)!=-1){HEAP32[r53]=18568;HEAP32[r53+1]=24;HEAP32[r53+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18568,r52,252)}r52=HEAP32[4643];r53=r52-1|0;tempValue=HEAP32[2355],HEAP32[2355]=tempValue+1,tempValue;r55=HEAP32[r61];r1=HEAP32[r60];r69=r55-r1>>2;do{if(r69>>>0>r53>>>0){r70=r1}else{if(r69>>>0<r52>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r52-r69|0);r70=HEAP32[r60];break}if(r69>>>0<=r52>>>0){r70=r1;break}r57=(r52<<2)+r1|0;if((r57|0)==(r55|0)){r70=r1;break}HEAP32[r61]=(((r55-4+ -r57|0)>>>2^-1)<<2)+r55;r70=r1}}while(0);r1=HEAP32[r70+(r53<<2)>>2];do{if((r1|0)!=0){r70=r1+4|0;if(((tempValue=HEAP32[r70>>2],HEAP32[r70>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r53<<2)>>2]=9416;HEAP32[2309]=0;HEAP32[2308]=11192;if((HEAP32[4568]|0)!=-1){HEAP32[r51]=18272;HEAP32[r51+1]=24;HEAP32[r51+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18272,r50,252)}r50=HEAP32[4569];r51=r50-1|0;tempValue=HEAP32[2309],HEAP32[2309]=tempValue+1,tempValue;r53=HEAP32[r61];r1=HEAP32[r60];r70=r53-r1>>2;do{if(r70>>>0>r51>>>0){r71=r1}else{if(r70>>>0<r50>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r50-r70|0);r71=HEAP32[r60];break}if(r70>>>0<=r50>>>0){r71=r1;break}r55=(r50<<2)+r1|0;if((r55|0)==(r53|0)){r71=r1;break}HEAP32[r61]=(((r53-4+ -r55|0)>>>2^-1)<<2)+r53;r71=r1}}while(0);r1=HEAP32[r71+(r51<<2)>>2];do{if((r1|0)!=0){r71=r1+4|0;if(((tempValue=HEAP32[r71>>2],HEAP32[r71>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r51<<2)>>2]=9232;HEAP32[2305]=0;HEAP32[2304]=11136;HEAP32[2306]=0;if((HEAP32[4566]|0)!=-1){HEAP32[r49]=18264;HEAP32[r49+1]=24;HEAP32[r49+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18264,r48,252)}r48=HEAP32[4567];r49=r48-1|0;tempValue=HEAP32[2305],HEAP32[2305]=tempValue+1,tempValue;r51=HEAP32[r61];r1=HEAP32[r60];r71=r51-r1>>2;do{if(r71>>>0>r49>>>0){r72=r1}else{if(r71>>>0<r48>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r48-r71|0);r72=HEAP32[r60];break}if(r71>>>0<=r48>>>0){r72=r1;break}r53=(r48<<2)+r1|0;if((r53|0)==(r51|0)){r72=r1;break}HEAP32[r61]=(((r51-4+ -r53|0)>>>2^-1)<<2)+r51;r72=r1}}while(0);r1=HEAP32[r72+(r49<<2)>>2];do{if((r1|0)!=0){r72=r1+4|0;if(((tempValue=HEAP32[r72>>2],HEAP32[r72>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r49<<2)>>2]=9216;HEAP32[2311]=0;HEAP32[2310]=11248;if((HEAP32[4570]|0)!=-1){HEAP32[r47]=18280;HEAP32[r47+1]=24;HEAP32[r47+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18280,r46,252)}r46=HEAP32[4571];r47=r46-1|0;tempValue=HEAP32[2311],HEAP32[2311]=tempValue+1,tempValue;r49=HEAP32[r61];r1=HEAP32[r60];r72=r49-r1>>2;do{if(r72>>>0>r47>>>0){r73=r1}else{if(r72>>>0<r46>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r46-r72|0);r73=HEAP32[r60];break}if(r72>>>0<=r46>>>0){r73=r1;break}r51=(r46<<2)+r1|0;if((r51|0)==(r49|0)){r73=r1;break}HEAP32[r61]=(((r49-4+ -r51|0)>>>2^-1)<<2)+r49;r73=r1}}while(0);r1=HEAP32[r73+(r47<<2)>>2];do{if((r1|0)!=0){r73=r1+4|0;if(((tempValue=HEAP32[r73>>2],HEAP32[r73>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r47<<2)>>2]=9240;HEAP32[2313]=0;HEAP32[2312]=11304;if((HEAP32[4572]|0)!=-1){HEAP32[r45]=18288;HEAP32[r45+1]=24;HEAP32[r45+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18288,r44,252)}r44=HEAP32[4573];r45=r44-1|0;tempValue=HEAP32[2313],HEAP32[2313]=tempValue+1,tempValue;r47=HEAP32[r61];r1=HEAP32[r60];r73=r47-r1>>2;do{if(r73>>>0>r45>>>0){r74=r1}else{if(r73>>>0<r44>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r44-r73|0);r74=HEAP32[r60];break}if(r73>>>0<=r44>>>0){r74=r1;break}r49=(r44<<2)+r1|0;if((r49|0)==(r47|0)){r74=r1;break}HEAP32[r61]=(((r47-4+ -r49|0)>>>2^-1)<<2)+r47;r74=r1}}while(0);r1=HEAP32[r74+(r45<<2)>>2];do{if((r1|0)!=0){r74=r1+4|0;if(((tempValue=HEAP32[r74>>2],HEAP32[r74>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r45<<2)>>2]=9248;HEAP32[2283]=0;HEAP32[2282]=10600;HEAP8[9136]=46;HEAP8[9137]=44;HEAP32[2285]=0;HEAP32[2286]=0;HEAP32[2287]=0;if((HEAP32[4548]|0)!=-1){HEAP32[r43]=18192;HEAP32[r43+1]=24;HEAP32[r43+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18192,r42,252)}r42=HEAP32[4549];r43=r42-1|0;tempValue=HEAP32[2283],HEAP32[2283]=tempValue+1,tempValue;r45=HEAP32[r61];r1=HEAP32[r60];r74=r45-r1>>2;do{if(r74>>>0>r43>>>0){r75=r1}else{if(r74>>>0<r42>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r42-r74|0);r75=HEAP32[r60];break}if(r74>>>0<=r42>>>0){r75=r1;break}r47=(r42<<2)+r1|0;if((r47|0)==(r45|0)){r75=r1;break}HEAP32[r61]=(((r45-4+ -r47|0)>>>2^-1)<<2)+r45;r75=r1}}while(0);r1=HEAP32[r75+(r43<<2)>>2];do{if((r1|0)!=0){r75=r1+4|0;if(((tempValue=HEAP32[r75>>2],HEAP32[r75>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r43<<2)>>2]=9128;HEAP32[2275]=0;HEAP32[2274]=10552;HEAP32[2276]=46;HEAP32[2277]=44;HEAP32[2278]=0;HEAP32[2279]=0;HEAP32[2280]=0;if((HEAP32[4546]|0)!=-1){HEAP32[r41]=18184;HEAP32[r41+1]=24;HEAP32[r41+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18184,r40,252)}r40=HEAP32[4547];r41=r40-1|0;tempValue=HEAP32[2275],HEAP32[2275]=tempValue+1,tempValue;r43=HEAP32[r61];r1=HEAP32[r60];r75=r43-r1>>2;do{if(r75>>>0>r41>>>0){r76=r1}else{if(r75>>>0<r40>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r40-r75|0);r76=HEAP32[r60];break}if(r75>>>0<=r40>>>0){r76=r1;break}r45=(r40<<2)+r1|0;if((r45|0)==(r43|0)){r76=r1;break}HEAP32[r61]=(((r43-4+ -r45|0)>>>2^-1)<<2)+r43;r76=r1}}while(0);r1=HEAP32[r76+(r41<<2)>>2];do{if((r1|0)!=0){r76=r1+4|0;if(((tempValue=HEAP32[r76>>2],HEAP32[r76>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r41<<2)>>2]=9096;HEAP32[2299]=0;HEAP32[2298]=10984;if((HEAP32[4560]|0)!=-1){HEAP32[r39]=18240;HEAP32[r39+1]=24;HEAP32[r39+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18240,r38,252)}r38=HEAP32[4561];r39=r38-1|0;tempValue=HEAP32[2299],HEAP32[2299]=tempValue+1,tempValue;r41=HEAP32[r61];r1=HEAP32[r60];r76=r41-r1>>2;do{if(r76>>>0>r39>>>0){r77=r1}else{if(r76>>>0<r38>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r38-r76|0);r77=HEAP32[r60];break}if(r76>>>0<=r38>>>0){r77=r1;break}r43=(r38<<2)+r1|0;if((r43|0)==(r41|0)){r77=r1;break}HEAP32[r61]=(((r41-4+ -r43|0)>>>2^-1)<<2)+r41;r77=r1}}while(0);r1=HEAP32[r77+(r39<<2)>>2];do{if((r1|0)!=0){r77=r1+4|0;if(((tempValue=HEAP32[r77>>2],HEAP32[r77>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r39<<2)>>2]=9192;HEAP32[2297]=0;HEAP32[2296]=10912;if((HEAP32[4558]|0)!=-1){HEAP32[r37]=18232;HEAP32[r37+1]=24;HEAP32[r37+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18232,r36,252)}r36=HEAP32[4559];r37=r36-1|0;tempValue=HEAP32[2297],HEAP32[2297]=tempValue+1,tempValue;r39=HEAP32[r61];r1=HEAP32[r60];r77=r39-r1>>2;do{if(r77>>>0>r37>>>0){r78=r1}else{if(r77>>>0<r36>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r36-r77|0);r78=HEAP32[r60];break}if(r77>>>0<=r36>>>0){r78=r1;break}r41=(r36<<2)+r1|0;if((r41|0)==(r39|0)){r78=r1;break}HEAP32[r61]=(((r39-4+ -r41|0)>>>2^-1)<<2)+r39;r78=r1}}while(0);r1=HEAP32[r78+(r37<<2)>>2];do{if((r1|0)!=0){r78=r1+4|0;if(((tempValue=HEAP32[r78>>2],HEAP32[r78>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r37<<2)>>2]=9184;HEAP32[2295]=0;HEAP32[2294]=10848;if((HEAP32[4556]|0)!=-1){HEAP32[r35]=18224;HEAP32[r35+1]=24;HEAP32[r35+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18224,r34,252)}r34=HEAP32[4557];r35=r34-1|0;tempValue=HEAP32[2295],HEAP32[2295]=tempValue+1,tempValue;r37=HEAP32[r61];r1=HEAP32[r60];r78=r37-r1>>2;do{if(r78>>>0>r35>>>0){r79=r1}else{if(r78>>>0<r34>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r34-r78|0);r79=HEAP32[r60];break}if(r78>>>0<=r34>>>0){r79=r1;break}r39=(r34<<2)+r1|0;if((r39|0)==(r37|0)){r79=r1;break}HEAP32[r61]=(((r37-4+ -r39|0)>>>2^-1)<<2)+r37;r79=r1}}while(0);r1=HEAP32[r79+(r35<<2)>>2];do{if((r1|0)!=0){r79=r1+4|0;if(((tempValue=HEAP32[r79>>2],HEAP32[r79>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r35<<2)>>2]=9176;HEAP32[2293]=0;HEAP32[2292]=10784;if((HEAP32[4554]|0)!=-1){HEAP32[r33]=18216;HEAP32[r33+1]=24;HEAP32[r33+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18216,r32,252)}r32=HEAP32[4555];r33=r32-1|0;tempValue=HEAP32[2293],HEAP32[2293]=tempValue+1,tempValue;r35=HEAP32[r61];r1=HEAP32[r60];r79=r35-r1>>2;do{if(r79>>>0>r33>>>0){r80=r1}else{if(r79>>>0<r32>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r32-r79|0);r80=HEAP32[r60];break}if(r79>>>0<=r32>>>0){r80=r1;break}r37=(r32<<2)+r1|0;if((r37|0)==(r35|0)){r80=r1;break}HEAP32[r61]=(((r35-4+ -r37|0)>>>2^-1)<<2)+r35;r80=r1}}while(0);r1=HEAP32[r80+(r33<<2)>>2];do{if((r1|0)!=0){r80=r1+4|0;if(((tempValue=HEAP32[r80>>2],HEAP32[r80>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r33<<2)>>2]=9168;HEAP32[2367]=0;HEAP32[2366]=12432;if((HEAP32[4774]|0)!=-1){HEAP32[r31]=19096;HEAP32[r31+1]=24;HEAP32[r31+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19096,r30,252)}r30=HEAP32[4775];r31=r30-1|0;tempValue=HEAP32[2367],HEAP32[2367]=tempValue+1,tempValue;r33=HEAP32[r61];r1=HEAP32[r60];r80=r33-r1>>2;do{if(r80>>>0>r31>>>0){r81=r1}else{if(r80>>>0<r30>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r30-r80|0);r81=HEAP32[r60];break}if(r80>>>0<=r30>>>0){r81=r1;break}r35=(r30<<2)+r1|0;if((r35|0)==(r33|0)){r81=r1;break}HEAP32[r61]=(((r33-4+ -r35|0)>>>2^-1)<<2)+r33;r81=r1}}while(0);r1=HEAP32[r81+(r31<<2)>>2];do{if((r1|0)!=0){r81=r1+4|0;if(((tempValue=HEAP32[r81>>2],HEAP32[r81>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r31<<2)>>2]=9464;HEAP32[2365]=0;HEAP32[2364]=12368;if((HEAP32[4772]|0)!=-1){HEAP32[r29]=19088;HEAP32[r29+1]=24;HEAP32[r29+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19088,r28,252)}r28=HEAP32[4773];r29=r28-1|0;tempValue=HEAP32[2365],HEAP32[2365]=tempValue+1,tempValue;r31=HEAP32[r61];r1=HEAP32[r60];r81=r31-r1>>2;do{if(r81>>>0>r29>>>0){r82=r1}else{if(r81>>>0<r28>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r28-r81|0);r82=HEAP32[r60];break}if(r81>>>0<=r28>>>0){r82=r1;break}r33=(r28<<2)+r1|0;if((r33|0)==(r31|0)){r82=r1;break}HEAP32[r61]=(((r31-4+ -r33|0)>>>2^-1)<<2)+r31;r82=r1}}while(0);r1=HEAP32[r82+(r29<<2)>>2];do{if((r1|0)!=0){r82=r1+4|0;if(((tempValue=HEAP32[r82>>2],HEAP32[r82>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r29<<2)>>2]=9456;HEAP32[2363]=0;HEAP32[2362]=12304;if((HEAP32[4770]|0)!=-1){HEAP32[r27]=19080;HEAP32[r27+1]=24;HEAP32[r27+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19080,r26,252)}r26=HEAP32[4771];r27=r26-1|0;tempValue=HEAP32[2363],HEAP32[2363]=tempValue+1,tempValue;r29=HEAP32[r61];r1=HEAP32[r60];r82=r29-r1>>2;do{if(r82>>>0>r27>>>0){r83=r1}else{if(r82>>>0<r26>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r26-r82|0);r83=HEAP32[r60];break}if(r82>>>0<=r26>>>0){r83=r1;break}r31=(r26<<2)+r1|0;if((r31|0)==(r29|0)){r83=r1;break}HEAP32[r61]=(((r29-4+ -r31|0)>>>2^-1)<<2)+r29;r83=r1}}while(0);r1=HEAP32[r83+(r27<<2)>>2];do{if((r1|0)!=0){r83=r1+4|0;if(((tempValue=HEAP32[r83>>2],HEAP32[r83>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r27<<2)>>2]=9448;HEAP32[2361]=0;HEAP32[2360]=12240;if((HEAP32[4768]|0)!=-1){HEAP32[r25]=19072;HEAP32[r25+1]=24;HEAP32[r25+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(19072,r24,252)}r24=HEAP32[4769];r25=r24-1|0;tempValue=HEAP32[2361],HEAP32[2361]=tempValue+1,tempValue;r27=HEAP32[r61];r1=HEAP32[r60];r83=r27-r1>>2;do{if(r83>>>0>r25>>>0){r84=r1}else{if(r83>>>0<r24>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r24-r83|0);r84=HEAP32[r60];break}if(r83>>>0<=r24>>>0){r84=r1;break}r29=(r24<<2)+r1|0;if((r29|0)==(r27|0)){r84=r1;break}HEAP32[r61]=(((r27-4+ -r29|0)>>>2^-1)<<2)+r27;r84=r1}}while(0);r1=HEAP32[r84+(r25<<2)>>2];do{if((r1|0)!=0){r84=r1+4|0;if(((tempValue=HEAP32[r84>>2],HEAP32[r84>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r25<<2)>>2]=9440;HEAP32[2257]=0;HEAP32[2256]=10256;if((HEAP32[4536]|0)!=-1){HEAP32[r23]=18144;HEAP32[r23+1]=24;HEAP32[r23+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18144,r22,252)}r22=HEAP32[4537];r23=r22-1|0;tempValue=HEAP32[2257],HEAP32[2257]=tempValue+1,tempValue;r25=HEAP32[r61];r1=HEAP32[r60];r84=r25-r1>>2;do{if(r84>>>0>r23>>>0){r85=r1}else{if(r84>>>0<r22>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r22-r84|0);r85=HEAP32[r60];break}if(r84>>>0<=r22>>>0){r85=r1;break}r27=(r22<<2)+r1|0;if((r27|0)==(r25|0)){r85=r1;break}HEAP32[r61]=(((r25-4+ -r27|0)>>>2^-1)<<2)+r25;r85=r1}}while(0);r1=HEAP32[r85+(r23<<2)>>2];do{if((r1|0)!=0){r85=r1+4|0;if(((tempValue=HEAP32[r85>>2],HEAP32[r85>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r23<<2)>>2]=9024;HEAP32[2255]=0;HEAP32[2254]=10216;if((HEAP32[4534]|0)!=-1){HEAP32[r21]=18136;HEAP32[r21+1]=24;HEAP32[r21+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18136,r20,252)}r20=HEAP32[4535];r21=r20-1|0;tempValue=HEAP32[2255],HEAP32[2255]=tempValue+1,tempValue;r23=HEAP32[r61];r1=HEAP32[r60];r85=r23-r1>>2;do{if(r85>>>0>r21>>>0){r86=r1}else{if(r85>>>0<r20>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r20-r85|0);r86=HEAP32[r60];break}if(r85>>>0<=r20>>>0){r86=r1;break}r25=(r20<<2)+r1|0;if((r25|0)==(r23|0)){r86=r1;break}HEAP32[r61]=(((r23-4+ -r25|0)>>>2^-1)<<2)+r23;r86=r1}}while(0);r1=HEAP32[r86+(r21<<2)>>2];do{if((r1|0)!=0){r86=r1+4|0;if(((tempValue=HEAP32[r86>>2],HEAP32[r86>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r21<<2)>>2]=9016;HEAP32[2253]=0;HEAP32[2252]=10176;if((HEAP32[4532]|0)!=-1){HEAP32[r19]=18128;HEAP32[r19+1]=24;HEAP32[r19+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18128,r18,252)}r18=HEAP32[4533];r19=r18-1|0;tempValue=HEAP32[2253],HEAP32[2253]=tempValue+1,tempValue;r21=HEAP32[r61];r1=HEAP32[r60];r86=r21-r1>>2;do{if(r86>>>0>r19>>>0){r87=r1}else{if(r86>>>0<r18>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r18-r86|0);r87=HEAP32[r60];break}if(r86>>>0<=r18>>>0){r87=r1;break}r23=(r18<<2)+r1|0;if((r23|0)==(r21|0)){r87=r1;break}HEAP32[r61]=(((r21-4+ -r23|0)>>>2^-1)<<2)+r21;r87=r1}}while(0);r1=HEAP32[r87+(r19<<2)>>2];do{if((r1|0)!=0){r87=r1+4|0;if(((tempValue=HEAP32[r87>>2],HEAP32[r87>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r19<<2)>>2]=9008;HEAP32[2251]=0;HEAP32[2250]=10136;if((HEAP32[4530]|0)!=-1){HEAP32[r17]=18120;HEAP32[r17+1]=24;HEAP32[r17+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18120,r16,252)}r16=HEAP32[4531];r17=r16-1|0;tempValue=HEAP32[2251],HEAP32[2251]=tempValue+1,tempValue;r19=HEAP32[r61];r1=HEAP32[r60];r87=r19-r1>>2;do{if(r87>>>0>r17>>>0){r88=r1}else{if(r87>>>0<r16>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r16-r87|0);r88=HEAP32[r60];break}if(r87>>>0<=r16>>>0){r88=r1;break}r21=(r16<<2)+r1|0;if((r21|0)==(r19|0)){r88=r1;break}HEAP32[r61]=(((r19-4+ -r21|0)>>>2^-1)<<2)+r19;r88=r1}}while(0);r1=HEAP32[r88+(r17<<2)>>2];do{if((r1|0)!=0){r88=r1+4|0;if(((tempValue=HEAP32[r88>>2],HEAP32[r88>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r17<<2)>>2]=9e3;HEAP32[2271]=0;HEAP32[2270]=10456;HEAP32[2272]=10504;if((HEAP32[4544]|0)!=-1){HEAP32[r15]=18176;HEAP32[r15+1]=24;HEAP32[r15+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18176,r14,252)}r14=HEAP32[4545];r15=r14-1|0;tempValue=HEAP32[2271],HEAP32[2271]=tempValue+1,tempValue;r17=HEAP32[r61];r1=HEAP32[r60];r88=r17-r1>>2;do{if(r88>>>0>r15>>>0){r89=r1}else{if(r88>>>0<r14>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r14-r88|0);r89=HEAP32[r60];break}if(r88>>>0<=r14>>>0){r89=r1;break}r19=(r14<<2)+r1|0;if((r19|0)==(r17|0)){r89=r1;break}HEAP32[r61]=(((r17-4+ -r19|0)>>>2^-1)<<2)+r17;r89=r1}}while(0);r1=HEAP32[r89+(r15<<2)>>2];do{if((r1|0)!=0){r89=r1+4|0;if(((tempValue=HEAP32[r89>>2],HEAP32[r89>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r15<<2)>>2]=9080;HEAP32[2267]=0;HEAP32[2266]=10360;HEAP32[2268]=10408;if((HEAP32[4542]|0)!=-1){HEAP32[r13]=18168;HEAP32[r13+1]=24;HEAP32[r13+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18168,r12,252)}r12=HEAP32[4543];r13=r12-1|0;tempValue=HEAP32[2267],HEAP32[2267]=tempValue+1,tempValue;r15=HEAP32[r61];r1=HEAP32[r60];r89=r15-r1>>2;do{if(r89>>>0>r13>>>0){r90=r1}else{if(r89>>>0<r12>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r12-r89|0);r90=HEAP32[r60];break}if(r89>>>0<=r12>>>0){r90=r1;break}r17=(r12<<2)+r1|0;if((r17|0)==(r15|0)){r90=r1;break}HEAP32[r61]=(((r15-4+ -r17|0)>>>2^-1)<<2)+r15;r90=r1}}while(0);r1=HEAP32[r90+(r13<<2)>>2];do{if((r1|0)!=0){r90=r1+4|0;if(((tempValue=HEAP32[r90>>2],HEAP32[r90>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+8>>2]](r1|0)}}while(0);HEAP32[HEAP32[r60]+(r13<<2)>>2]=9064;HEAP32[2263]=0;HEAP32[2262]=11360;if(HEAP8[19176]){r91=HEAP32[2246]}else{r13=_newlocale(1,2896,0);HEAP32[2246]=r13;HEAP8[19176]=1;r91=r13}HEAP32[2264]=r91;HEAP32[2262]=10328;if((HEAP32[4540]|0)!=-1){HEAP32[r11]=18160;HEAP32[r11+1]=24;HEAP32[r11+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18160,r10,252)}r10=HEAP32[4541];r11=r10-1|0;tempValue=HEAP32[2263],HEAP32[2263]=tempValue+1,tempValue;r91=HEAP32[r61];r13=HEAP32[r60];r1=r91-r13>>2;do{if(r1>>>0>r11>>>0){r92=r13}else{if(r1>>>0<r10>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r10-r1|0);r92=HEAP32[r60];break}if(r1>>>0<=r10>>>0){r92=r13;break}r90=(r10<<2)+r13|0;if((r90|0)==(r91|0)){r92=r13;break}HEAP32[r61]=(((r91-4+ -r90|0)>>>2^-1)<<2)+r91;r92=r13}}while(0);r13=HEAP32[r92+(r11<<2)>>2];do{if((r13|0)!=0){r92=r13+4|0;if(((tempValue=HEAP32[r92>>2],HEAP32[r92>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r13>>2]+8>>2]](r13|0)}}while(0);HEAP32[HEAP32[r60]+(r11<<2)>>2]=9048;HEAP32[2259]=0;HEAP32[2258]=11360;if(HEAP8[19176]){r93=HEAP32[2246]}else{r11=_newlocale(1,2896,0);HEAP32[2246]=r11;HEAP8[19176]=1;r93=r11}HEAP32[2260]=r93;HEAP32[2258]=10296;if((HEAP32[4538]|0)!=-1){HEAP32[r9]=18152;HEAP32[r9+1]=24;HEAP32[r9+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18152,r8,252)}r8=HEAP32[4539];r9=r8-1|0;tempValue=HEAP32[2259],HEAP32[2259]=tempValue+1,tempValue;r93=HEAP32[r61];r11=HEAP32[r60];r13=r93-r11>>2;do{if(r13>>>0>r9>>>0){r94=r11}else{if(r13>>>0<r8>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r8-r13|0);r94=HEAP32[r60];break}if(r13>>>0<=r8>>>0){r94=r11;break}r92=(r8<<2)+r11|0;if((r92|0)==(r93|0)){r94=r11;break}HEAP32[r61]=(((r93-4+ -r92|0)>>>2^-1)<<2)+r93;r94=r11}}while(0);r11=HEAP32[r94+(r9<<2)>>2];do{if((r11|0)!=0){r94=r11+4|0;if(((tempValue=HEAP32[r94>>2],HEAP32[r94>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11|0)}}while(0);HEAP32[HEAP32[r60]+(r9<<2)>>2]=9032;HEAP32[2291]=0;HEAP32[2290]=10688;if((HEAP32[4552]|0)!=-1){HEAP32[r7]=18208;HEAP32[r7+1]=24;HEAP32[r7+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18208,r6,252)}r6=HEAP32[4553];r7=r6-1|0;tempValue=HEAP32[2291],HEAP32[2291]=tempValue+1,tempValue;r9=HEAP32[r61];r11=HEAP32[r60];r94=r9-r11>>2;do{if(r94>>>0>r7>>>0){r95=r11}else{if(r94>>>0<r6>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r6-r94|0);r95=HEAP32[r60];break}if(r94>>>0<=r6>>>0){r95=r11;break}r93=(r6<<2)+r11|0;if((r93|0)==(r9|0)){r95=r11;break}HEAP32[r61]=(((r9-4+ -r93|0)>>>2^-1)<<2)+r9;r95=r11}}while(0);r11=HEAP32[r95+(r7<<2)>>2];do{if((r11|0)!=0){r95=r11+4|0;if(((tempValue=HEAP32[r95>>2],HEAP32[r95>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11|0)}}while(0);HEAP32[HEAP32[r60]+(r7<<2)>>2]=9160;HEAP32[2289]=0;HEAP32[2288]=10648;if((HEAP32[4550]|0)!=-1){HEAP32[r5]=18200;HEAP32[r5+1]=24;HEAP32[r5+2]=0;__ZNSt3__111__call_onceERVmPvPFvS2_E(18200,r4,252)}r4=HEAP32[4551];r5=r4-1|0;tempValue=HEAP32[2289],HEAP32[2289]=tempValue+1,tempValue;r7=HEAP32[r61];r11=HEAP32[r60];r95=r7-r11>>2;do{if(r95>>>0>r5>>>0){r96=r11}else{if(r95>>>0<r4>>>0){__ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r2,r4-r95|0);r96=HEAP32[r60];break}if(r95>>>0<=r4>>>0){r96=r11;break}r9=(r4<<2)+r11|0;if((r9|0)==(r7|0)){r96=r11;break}HEAP32[r61]=(((r7-4+ -r9|0)>>>2^-1)<<2)+r7;r96=r11}}while(0);r11=HEAP32[r96+(r5<<2)>>2];if((r11|0)==0){r97=HEAP32[r60];r98=(r5<<2)+r97|0,r99=r98>>2;HEAP32[r99]=9152;STACKTOP=r3;return}r96=r11+4|0;if(((tempValue=HEAP32[r96>>2],HEAP32[r96>>2]=tempValue+ -1,tempValue)|0)!=0){r97=HEAP32[r60];r98=(r5<<2)+r97|0,r99=r98>>2;HEAP32[r99]=9152;STACKTOP=r3;return}FUNCTION_TABLE[HEAP32[HEAP32[r11>>2]+8>>2]](r11|0);r97=HEAP32[r60];r98=(r5<<2)+r97|0,r99=r98>>2;HEAP32[r99]=9152;STACKTOP=r3;return}function __ZNKSt3__15ctypeIcE8do_widenEc(r1,r2){return r2}function __ZNKSt3__17codecvtIcc10_mbstate_tE6do_outERS1_PKcS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){HEAP32[r5>>2]=r3;HEAP32[r8>>2]=r6;return 3}function __ZNKSt3__17codecvtIcc10_mbstate_tE5do_inERS1_PKcS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){HEAP32[r5>>2]=r3;HEAP32[r8>>2]=r6;return 3}function __ZNKSt3__17codecvtIcc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIcc10_mbstate_tE11do_encodingEv(r1){return 1}function __ZNKSt3__17codecvtIcc10_mbstate_tE16do_always_noconvEv(r1){return 1}function __ZNKSt3__17codecvtIcc10_mbstate_tE13do_max_lengthEv(r1){return 1}function __ZNKSt3__15ctypeIwE8do_widenEc(r1,r2){return r2<<24>>24}function __ZNKSt3__15ctypeIwE9do_narrowEwc(r1,r2,r3){return r2>>>0<128?r2&255:r3}function __ZNKSt3__15ctypeIcE9do_narrowEcc(r1,r2,r3){return r2<<24>>24>-1?r2:r3}function __ZNKSt3__17codecvtIcc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){r2=r4-r3|0;return r2>>>0<r5>>>0?r2:r5}function __ZNSt3__16locale2id6__initEv(r1){HEAP32[r1+4>>2]=(tempValue=HEAP32[4574],HEAP32[4574]=tempValue+1,tempValue)+1;return}function __ZNKSt3__15ctypeIwE8do_widenEPKcS3_Pw(r1,r2,r3,r4){var r5,r6,r7;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){HEAP32[r7>>2]=HEAP8[r6]|0;r4=r6+1|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+4|0}}return r5}function __ZNKSt3__15ctypeIwE9do_narrowEPKwS3_cPc(r1,r2,r3,r4,r5){var r6,r7,r8;if((r2|0)==(r3|0)){r6=r2;return r6}r1=((r3-4+ -r2|0)>>>2)+1|0;r7=r2;r8=r5;while(1){r5=HEAP32[r7>>2];HEAP8[r8]=r5>>>0<128?r5&255:r4;r5=r7+4|0;if((r5|0)==(r3|0)){break}else{r7=r5;r8=r8+1|0}}r6=(r1<<2)+r2|0;return r6}function __ZNKSt3__15ctypeIcE8do_widenEPKcS3_Pc(r1,r2,r3,r4){var r5,r6,r7;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){HEAP8[r7]=HEAP8[r6];r4=r6+1|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+1|0}}return r5}function __ZNKSt3__15ctypeIcE9do_narrowEPKcS3_cPc(r1,r2,r3,r4,r5){var r6,r7,r8;if((r2|0)==(r3|0)){r6=r2;return r6}else{r7=r2;r8=r5}while(1){r5=HEAP8[r7];HEAP8[r8]=r5<<24>>24>-1?r5:r4;r5=r7+1|0;if((r5|0)==(r3|0)){r6=r3;break}else{r7=r5;r8=r8+1|0}}return r6}function __ZNSt3__16locale5__impD0Ev(r1){__ZNSt3__16locale5__impD2Ev(r1);__ZdlPv(r1);return}function __ZNSt3__16locale5__impD2Ev(r1){var r2,r3,r4,r5,r6,r7,r8,r9;HEAP32[r1>>2]=11392;r2=(r1+12|0)>>2;r3=HEAP32[r2];r4=(r1+8|0)>>2;r5=HEAP32[r4];if((r3|0)==(r5|0)){r6=r3}else{r3=0;r7=r5;while(1){r5=HEAP32[r7+(r3<<2)>>2];do{if((r5|0)!=0){r8=r5+4|0;if(((tempValue=HEAP32[r8>>2],HEAP32[r8>>2]=tempValue+ -1,tempValue)|0)!=0){break}FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+8>>2]](r5|0)}}while(0);r5=r3+1|0;r8=HEAP32[r4];if(r5>>>0<HEAP32[r2]-r8>>2>>>0){r3=r5;r7=r8}else{r6=r8;break}}}if((HEAP8[r1+144|0]&1)==0){r9=r6}else{__ZdlPv(HEAP32[r1+152>>2]);r9=HEAP32[r4]}if((r9|0)==0){return}r4=HEAP32[r2];if((r9|0)!=(r4|0)){HEAP32[r2]=(((r4-4+ -r9|0)>>>2^-1)<<2)+r4}if((r9|0)==(r1+24|0)){HEAP8[r1+136|0]=0;return}else{__ZdlPv(r9);return}}function __ZNSt3__16locale5facetD0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__16locale5facet16__on_zero_sharedEv(r1){if((r1|0)==0){return}FUNCTION_TABLE[HEAP32[HEAP32[r1>>2]+4>>2]](r1);return}function __ZNSt3__15ctypeIwED0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__15ctypeIcED0Ev(r1){var r2;HEAP32[r1>>2]=11504;r2=HEAP32[r1+8>>2];do{if((r2|0)!=0){if((HEAP8[r1+12|0]&1)==0){break}__ZdaPv(r2)}}while(0);__ZdlPv(r1);return}function __ZNSt3__15ctypeIcED2Ev(r1){var r2;HEAP32[r1>>2]=11504;r2=HEAP32[r1+8>>2];if((r2|0)==0){return}if((HEAP8[r1+12|0]&1)==0){return}__ZdaPv(r2);return}function __ZNSt3__17codecvtIcc10_mbstate_tED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__15ctypeIwE5do_isEtw(r1,r2,r3){var r4;if(r3>>>0>=128){r4=0;return r4}r4=(HEAP16[HEAP32[___ctype_b_loc()>>2]+(r3<<1)>>1]&r2)<<16>>16!=0;return r4}function __ZNKSt3__15ctypeIwE5do_isEPKwS3_Pt(r1,r2,r3,r4){var r5,r6,r7,r8;if((r2|0)==(r3|0)){r5=r2;return r5}else{r6=r2;r7=r4}while(1){r4=HEAP32[r6>>2];if(r4>>>0<128){r8=HEAP16[HEAP32[___ctype_b_loc()>>2]+(r4<<1)>>1]}else{r8=0}HEAP16[r7>>1]=r8;r4=r6+4|0;if((r4|0)==(r3|0)){r5=r3;break}else{r6=r4;r7=r7+2|0}}return r5}function __ZNKSt3__15ctypeIwE10do_scan_isEtPKwS3_(r1,r2,r3,r4){var r5,r6;r1=0;if((r3|0)==(r4|0)){r5=r3;return r5}else{r6=r3}while(1){r3=HEAP32[r6>>2];if(r3>>>0<128){if((HEAP16[HEAP32[___ctype_b_loc()>>2]+(r3<<1)>>1]&r2)<<16>>16!=0){r5=r6;r1=2366;break}}r3=r6+4|0;if((r3|0)==(r4|0)){r5=r4;r1=2367;break}else{r6=r3}}if(r1==2366){return r5}else if(r1==2367){return r5}}function __ZNKSt3__15ctypeIwE11do_scan_notEtPKwS3_(r1,r2,r3,r4){var r5;r1=r3;while(1){if((r1|0)==(r4|0)){r5=r4;break}r3=HEAP32[r1>>2];if(r3>>>0>=128){r5=r1;break}if((HEAP16[HEAP32[___ctype_b_loc()>>2]+(r3<<1)>>1]&r2)<<16>>16==0){r5=r1;break}else{r1=r1+4|0}}return r5}function __ZNKSt3__15ctypeIwE10do_toupperEw(r1,r2){var r3;if(r2>>>0>=128){r3=r2;return r3}r3=HEAP32[HEAP32[___ctype_toupper_loc()>>2]+(r2<<2)>>2];return r3}function __ZNKSt3__15ctypeIwE10do_toupperEPwPKw(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP32[r5>>2];if(r2>>>0<128){r6=HEAP32[HEAP32[___ctype_toupper_loc()>>2]+(r2<<2)>>2]}else{r6=r2}HEAP32[r5>>2]=r6;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIwE10do_tolowerEw(r1,r2){var r3;if(r2>>>0>=128){r3=r2;return r3}r3=HEAP32[HEAP32[___ctype_tolower_loc()>>2]+(r2<<2)>>2];return r3}function __ZNKSt3__15ctypeIwE10do_tolowerEPwPKw(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP32[r5>>2];if(r2>>>0<128){r6=HEAP32[HEAP32[___ctype_tolower_loc()>>2]+(r2<<2)>>2]}else{r6=r2}HEAP32[r5>>2]=r6;r2=r5+4|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIcE10do_toupperEc(r1,r2){var r3;if(r2<<24>>24<=-1){r3=r2;return r3}r3=HEAP32[HEAP32[___ctype_toupper_loc()>>2]+(r2<<24>>24<<2)>>2]&255;return r3}function __ZNKSt3__15ctypeIcE10do_toupperEPcPKc(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP8[r5];if(r2<<24>>24>-1){r6=HEAP32[HEAP32[___ctype_toupper_loc()>>2]+(r2<<24>>24<<2)>>2]&255}else{r6=r2}HEAP8[r5]=r6;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNKSt3__15ctypeIcE10do_tolowerEc(r1,r2){var r3;if(r2<<24>>24<=-1){r3=r2;return r3}r3=HEAP32[HEAP32[___ctype_tolower_loc()>>2]+(r2<<24>>24<<2)>>2]&255;return r3}function __ZNKSt3__15ctypeIcE10do_tolowerEPcPKc(r1,r2,r3){var r4,r5,r6;if((r2|0)==(r3|0)){r4=r2;return r4}else{r5=r2}while(1){r2=HEAP8[r5];if(r2<<24>>24>-1){r6=HEAP32[HEAP32[___ctype_tolower_loc()>>2]+(r2<<24>>24<<2)>>2]&255}else{r6=r2}HEAP8[r5]=r6;r2=r5+1|0;if((r2|0)==(r3|0)){r4=r3;break}else{r5=r2}}return r4}function __ZNSt3__17codecvtIwc10_mbstate_tED0Ev(r1){var r2;HEAP32[r1>>2]=11136;r2=HEAP32[r1+8>>2];if((r2|0)!=0){_freelocale(r2)}__ZdlPv(r1);return}function __ZNKSt3__17codecvtIwc10_mbstate_tE6do_outERS1_PKwS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26;r2=r8>>2;r8=r5>>2;r9=0;r10=r3;while(1){if((r10|0)==(r4|0)){r11=r4;break}if((HEAP32[r10>>2]|0)==0){r11=r10;break}else{r10=r10+4|0}}HEAP32[r2]=r6;HEAP32[r8]=r3;L2853:do{if((r3|0)==(r4|0)|(r6|0)==(r7|0)){r12=r3}else{r10=r7;r13=(r1+8|0)>>2;r14=r6;r15=r3;r16=r11;while(1){r17=_uselocale(HEAP32[r13]);r18=_wcsnrtombs(r14,r5,r16-r15>>2,r10-r14|0,0);if((r17|0)!=0){_uselocale(r17)}if((r18|0)==0){r19=1;r9=2476;break}else if((r18|0)==-1){r9=2452;break}r17=HEAP32[r2]+r18|0;HEAP32[r2]=r17;if((r17|0)==(r7|0)){r9=2471;break}if((r16|0)==(r4|0)){r20=r4;r21=r17;r22=HEAP32[r8]}else{r17=_uselocale(HEAP32[r13]);if((r17|0)!=0){_uselocale(r17)}r17=HEAP32[r2];if((r17|0)==(r7|0)){r19=1;r9=2474;break}HEAP32[r2]=r17+1;HEAP8[r17]=0;r17=HEAP32[r8]+4|0;HEAP32[r8]=r17;r18=r17;while(1){if((r18|0)==(r4|0)){r23=r4;break}if((HEAP32[r18>>2]|0)==0){r23=r18;break}else{r18=r18+4|0}}r20=r23;r21=HEAP32[r2];r22=r17}if((r22|0)==(r4|0)|(r21|0)==(r7|0)){r12=r22;break L2853}else{r14=r21;r15=r22;r16=r20}}if(r9==2471){r12=HEAP32[r8];break}else if(r9==2476){return r19}else if(r9==2452){HEAP32[r2]=r14;L2878:do{if((r15|0)==(HEAP32[r8]|0)){r24=r15}else{r16=r15;r10=r14;while(1){r18=HEAP32[r16>>2];r25=_uselocale(HEAP32[r13]);r26=_wcrtomb(r10,r18,0);if((r25|0)!=0){_uselocale(r25)}if((r26|0)==-1){r24=r16;break L2878}r25=HEAP32[r2]+r26|0;HEAP32[r2]=r25;r26=r16+4|0;if((r26|0)==(HEAP32[r8]|0)){r24=r26;break}else{r16=r26;r10=r25}}}}while(0);HEAP32[r8]=r24;r19=2;return r19}else if(r9==2474){return r19}}}while(0);r19=(r12|0)!=(r4|0)&1;return r19}function __ZNKSt3__17codecvtIwc10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNSt3__1L13utf16_to_utf8EPKtS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14;r9=r6>>2;r6=r3>>2;r3=0;HEAP32[r6]=r1;HEAP32[r9]=r4;do{if((r8&2|0)!=0){if((r5-r4|0)<3){r10=1;return r10}else{HEAP32[r9]=r4+1;HEAP8[r4]=-17;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-69;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-65;break}}}while(0);r4=r2;r8=HEAP32[r6];if(r8>>>0>=r2>>>0){r10=0;return r10}r1=r5;r5=r8;L2901:while(1){r8=HEAP16[r5>>1];r11=r8&65535;if(r11>>>0>r7>>>0){r10=2;r3=2517;break}do{if((r8&65535)<128){r12=HEAP32[r9];if((r1-r12|0)<1){r10=1;r3=2509;break L2901}HEAP32[r9]=r12+1;HEAP8[r12]=r8&255}else{if((r8&65535)<2048){r12=HEAP32[r9];if((r1-r12|0)<2){r10=1;r3=2510;break L2901}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6|192)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r8&65535)<55296){r12=HEAP32[r9];if((r1-r12|0)<3){r10=1;r3=2513;break L2901}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r8&65535)>=56320){if((r8&65535)<57344){r10=2;r3=2514;break L2901}r12=HEAP32[r9];if((r1-r12|0)<3){r10=1;r3=2515;break L2901}HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11&63|128)&255;break}if((r4-r5|0)<4){r10=1;r3=2511;break L2901}r12=r5+2|0;r13=HEAPU16[r12>>1];if((r13&64512|0)!=56320){r10=2;r3=2508;break L2901}if((r1-HEAP32[r9]|0)<4){r10=1;r3=2507;break L2901}r14=r11&960;if(((r14<<10)+65536|r11<<10&64512|r13&1023)>>>0>r7>>>0){r10=2;r3=2512;break L2901}HEAP32[r6]=r12;r12=(r14>>>6)+1|0;r14=HEAP32[r9];HEAP32[r9]=r14+1;HEAP8[r14]=(r12>>>2|240)&255;r14=HEAP32[r9];HEAP32[r9]=r14+1;HEAP8[r14]=(r11>>>2&15|r12<<4&48|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r11<<4&48|r13>>>6&15|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r13&63|128)&255}}while(0);r11=HEAP32[r6]+2|0;HEAP32[r6]=r11;if(r11>>>0<r2>>>0){r5=r11}else{r10=0;r3=2505;break}}if(r3==2512){return r10}else if(r3==2513){return r10}else if(r3==2514){return r10}else if(r3==2515){return r10}else if(r3==2517){return r10}else if(r3==2507){return r10}else if(r3==2508){return r10}else if(r3==2509){return r10}else if(r3==2510){return r10}else if(r3==2511){return r10}else if(r3==2505){return r10}}function __ZNSt3__17codecvtIDsc10_mbstate_tED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__17codecvtIDsc10_mbstate_tE6do_outERS1_PKDsS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L13utf16_to_utf8EPKtS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=(HEAP32[r1>>2]-r3>>1<<1)+r3;HEAP32[r8>>2]=r6+(HEAP32[r9>>2]-r6);STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDsc10_mbstate_tE5do_inERS1_PKcS5_RS5_PDsS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L13utf8_to_utf16EPKhS1_RS1_PtS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=r3+(HEAP32[r1>>2]-r3);HEAP32[r8>>2]=(HEAP32[r9>>2]-r6>>1<<1)+r6;STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIwc10_mbstate_tE5do_inERS1_PKcS5_RS5_PwS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33;r9=r8>>2;r8=r5>>2;r10=0;r11=STACKTOP;STACKTOP=STACKTOP+8|0;r12=r11;r13=r12;r14=r3;while(1){if((r14|0)==(r4|0)){r15=r4;break}if((HEAP8[r14]|0)==0){r15=r14;break}else{r14=r14+1|0}}HEAP32[r9]=r6;HEAP32[r8]=r3;L2946:do{if((r3|0)==(r4|0)|(r6|0)==(r7|0)){r16=r3}else{r14=r2;r17=r7;r18=(r1+8|0)>>2;r19=r6;r20=r3;r21=r15;while(1){r22=HEAP32[r14+4>>2];HEAP32[r12>>2]=HEAP32[r14>>2];HEAP32[r12+4>>2]=r22;r23=r21;r22=_uselocale(HEAP32[r18]);r24=_mbsnrtowcs(r19,r5,r23-r20|0,r17-r19>>2,r2);if((r22|0)!=0){_uselocale(r22)}if((r24|0)==0){r25=2;r10=2556;break}else if((r24|0)==-1){r10=2530;break}r22=(r24<<2)+HEAP32[r9]|0;HEAP32[r9]=r22;if((r22|0)==(r7|0)){r10=2552;break}r24=HEAP32[r8];if((r21|0)==(r4|0)){r26=r4;r27=r22;r28=r24}else{r29=_uselocale(HEAP32[r18]);r30=_mbrtowc(r22,r24,1,r2);if((r29|0)!=0){_uselocale(r29)}if((r30|0)!=0){r25=2;r10=2555;break}HEAP32[r9]=HEAP32[r9]+4;r30=HEAP32[r8]+1|0;HEAP32[r8]=r30;r29=r30;while(1){if((r29|0)==(r4|0)){r31=r4;break}if((HEAP8[r29]|0)==0){r31=r29;break}else{r29=r29+1|0}}r26=r31;r27=HEAP32[r9];r28=r30}if((r28|0)==(r4|0)|(r27|0)==(r7|0)){r16=r28;break L2946}else{r19=r27;r20=r28;r21=r26}}if(r10==2555){STACKTOP=r11;return r25}else if(r10==2556){STACKTOP=r11;return r25}else if(r10==2552){r16=HEAP32[r8];break}else if(r10==2530){HEAP32[r9]=r19;L2971:do{if((r20|0)==(HEAP32[r8]|0)){r32=r20}else{r21=r19;r17=r20;while(1){r14=_uselocale(HEAP32[r18]);r29=_mbrtowc(r21,r17,r23-r17|0,r13);if((r14|0)!=0){_uselocale(r14)}if((r29|0)==0){r33=r17+1|0}else if((r29|0)==-1){r10=2536;break}else if((r29|0)==-2){r10=2537;break}else{r33=r17+r29|0}r29=HEAP32[r9]+4|0;HEAP32[r9]=r29;if((r33|0)==(HEAP32[r8]|0)){r32=r33;break L2971}else{r21=r29;r17=r33}}if(r10==2536){HEAP32[r8]=r17;r25=2;STACKTOP=r11;return r25}else if(r10==2537){HEAP32[r8]=r17;r25=1;STACKTOP=r11;return r25}}}while(0);HEAP32[r8]=r32;r25=(r32|0)!=(r4|0)&1;STACKTOP=r11;return r25}}}while(0);r25=(r16|0)!=(r4|0)&1;STACKTOP=r11;return r25}function __ZNKSt3__17codecvtIwc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;r3=_uselocale(HEAP32[r1+8>>2]);if((r3|0)==0){return 0}_uselocale(r3);return 0}function __ZNKSt3__17codecvtIwc10_mbstate_tE11do_encodingEv(r1){var r2,r3,r4;r2=r1+8|0;r1=_uselocale(HEAP32[r2>>2]);if((r1|0)!=0){_uselocale(r1)}r1=HEAP32[r2>>2];if((r1|0)==0){return 1}r2=_uselocale(r1);r1=___locale_mb_cur_max();if((r2|0)==0){r3=(r1|0)==1;r4=r3&1;return r4}_uselocale(r2);r3=(r1|0)==1;r4=r3&1;return r4}function __ZNKSt3__17codecvtIwc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14;r6=0;if((r5|0)==0|(r3|0)==(r4|0)){r7=0;return r7}r8=r4;r9=r1+8|0;r1=(r2|0)!=0?r2:112;r2=r3;r3=0;r10=0;while(1){r11=_uselocale(HEAP32[r9>>2]);r12=_mbrtowc(0,r2,r8-r2|0,r1);if((r11|0)!=0){_uselocale(r11)}if((r12|0)==0){r13=1;r14=r2+1|0}else if((r12|0)==-1|(r12|0)==-2){r7=r3;r6=2598;break}else{r13=r12;r14=r2+r12|0}r12=r13+r3|0;r11=r10+1|0;if(r11>>>0>=r5>>>0|(r14|0)==(r4|0)){r7=r12;r6=2597;break}else{r2=r14;r3=r12;r10=r11}}if(r6==2597){return r7}else if(r6==2598){return r7}}function __ZNKSt3__17codecvtIwc10_mbstate_tE13do_max_lengthEv(r1){var r2,r3,r4;r2=HEAP32[r1+8>>2];do{if((r2|0)==0){r3=1}else{r1=_uselocale(r2);r4=___locale_mb_cur_max();if((r1|0)==0){r3=r4;break}_uselocale(r1);r3=r4}}while(0);return r3}function __ZNKSt3__17codecvtIDsc10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIDsc10_mbstate_tE11do_encodingEv(r1){return 0}function __ZNKSt3__17codecvtIDsc10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNKSt3__17codecvtIDsc10_mbstate_tE13do_max_lengthEv(r1){return 4}function __ZNSt3__1L13utf8_to_utf16EPKhS1_RS1_PtS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r9=r6>>2;r6=r3>>2;r3=0;HEAP32[r6]=r1;HEAP32[r9]=r4;r4=HEAP32[r6];do{if((r8&4|0)==0){r10=r4}else{if((r2-r4|0)<=2){r10=r4;break}if((HEAP8[r4]|0)!=-17){r10=r4;break}if((HEAP8[r4+1|0]|0)!=-69){r10=r4;break}if((HEAP8[r4+2|0]|0)!=-65){r10=r4;break}r1=r4+3|0;HEAP32[r6]=r1;r10=r1}}while(0);L3044:do{if(r10>>>0<r2>>>0){r4=r2;r8=r5;r1=HEAP32[r9],r11=r1>>1;r12=r10;L3046:while(1){if(r1>>>0>=r5>>>0){r13=r12;break L3044}r14=HEAP8[r12];r15=r14&255;if(r15>>>0>r7>>>0){r16=2;r3=2662;break}do{if(r14<<24>>24>-1){HEAP16[r11]=r14&255;HEAP32[r6]=HEAP32[r6]+1}else{if((r14&255)<194){r16=2;r3=2660;break L3046}if((r14&255)<224){if((r4-r12|0)<2){r16=1;r3=2663;break L3046}r17=HEAPU8[r12+1|0];if((r17&192|0)!=128){r16=2;r3=2664;break L3046}r18=r17&63|r15<<6&1984;if(r18>>>0>r7>>>0){r16=2;r3=2666;break L3046}HEAP16[r11]=r18&65535;HEAP32[r6]=HEAP32[r6]+2;break}if((r14&255)<240){if((r4-r12|0)<3){r16=1;r3=2670;break L3046}r18=HEAP8[r12+1|0];r17=HEAP8[r12+2|0];if((r15|0)==224){if((r18&-32)<<24>>24!=-96){r16=2;r3=2667;break L3046}}else if((r15|0)==237){if((r18&-32)<<24>>24!=-128){r16=2;r3=2668;break L3046}}else{if((r18&-64)<<24>>24!=-128){r16=2;r3=2669;break L3046}}r19=r17&255;if((r19&192|0)!=128){r16=2;r3=2656;break L3046}r17=(r18&255)<<6&4032|r15<<12|r19&63;if((r17&65535)>>>0>r7>>>0){r16=2;r3=2657;break L3046}HEAP16[r11]=r17&65535;HEAP32[r6]=HEAP32[r6]+3;break}if((r14&255)>=245){r16=2;r3=2658;break L3046}if((r4-r12|0)<4){r16=1;r3=2659;break L3046}r17=HEAP8[r12+1|0];r19=HEAP8[r12+2|0];r18=HEAP8[r12+3|0];if((r15|0)==240){if((r17+112&255)>=48){r16=2;r3=2661;break L3046}}else if((r15|0)==244){if((r17&-16)<<24>>24!=-128){r16=2;r3=2671;break L3046}}else{if((r17&-64)<<24>>24!=-128){r16=2;r3=2672;break L3046}}r20=r19&255;if((r20&192|0)!=128){r16=2;r3=2673;break L3046}r19=r18&255;if((r19&192|0)!=128){r16=2;r3=2674;break L3046}if((r8-r1|0)<4){r16=1;r3=2675;break L3046}r18=r15&7;r21=r17&255;r17=r20<<6;r22=r19&63;if((r21<<12&258048|r18<<18|r17&4032|r22)>>>0>r7>>>0){r16=2;r3=2676;break L3046}HEAP16[r11]=(r21<<2&60|r20>>>4&3|((r21>>>4&3|r18<<2)<<6)+16320|55296)&65535;r18=HEAP32[r9]+2|0;HEAP32[r9]=r18;HEAP16[r18>>1]=(r22|r17&960|56320)&65535;HEAP32[r6]=HEAP32[r6]+4}}while(0);r15=HEAP32[r9]+2|0;HEAP32[r9]=r15;r14=HEAP32[r6];if(r14>>>0<r2>>>0){r1=r15,r11=r1>>1;r12=r14}else{r13=r14;break L3044}}if(r3==2656){return r16}else if(r3==2657){return r16}else if(r3==2658){return r16}else if(r3==2659){return r16}else if(r3==2660){return r16}else if(r3==2661){return r16}else if(r3==2662){return r16}else if(r3==2663){return r16}else if(r3==2664){return r16}else if(r3==2666){return r16}else if(r3==2667){return r16}else if(r3==2668){return r16}else if(r3==2669){return r16}else if(r3==2670){return r16}else if(r3==2671){return r16}else if(r3==2672){return r16}else if(r3==2673){return r16}else if(r3==2674){return r16}else if(r3==2675){return r16}else if(r3==2676){return r16}}else{r13=r10}}while(0);r16=r13>>>0<r2>>>0&1;return r16}function __ZNSt3__1L20utf8_to_utf16_lengthEPKhS1_jmNS_12codecvt_modeE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r6=0;do{if((r5&4|0)==0){r7=r1}else{if((r2-r1|0)<=2){r7=r1;break}if((HEAP8[r1]|0)!=-17){r7=r1;break}if((HEAP8[r1+1|0]|0)!=-69){r7=r1;break}r7=(HEAP8[r1+2|0]|0)==-65?r1+3|0:r1}}while(0);L3113:do{if(r7>>>0<r2>>>0&(r3|0)!=0){r5=r2;r8=0;r9=r7;L3115:while(1){r10=HEAP8[r9];r11=r10&255;if(r11>>>0>r4>>>0){r12=r9;break L3113}do{if(r10<<24>>24>-1){r13=r9+1|0;r14=r8}else{if((r10&255)<194){r12=r9;break L3113}if((r10&255)<224){if((r5-r9|0)<2){r12=r9;break L3113}r15=HEAPU8[r9+1|0];if((r15&192|0)!=128){r12=r9;break L3113}if((r15&63|r11<<6&1984)>>>0>r4>>>0){r12=r9;break L3113}r13=r9+2|0;r14=r8;break}if((r10&255)<240){r16=r9;if((r5-r16|0)<3){r12=r9;break L3113}r15=HEAP8[r9+1|0];r17=HEAP8[r9+2|0];if((r11|0)==237){if((r15&-32)<<24>>24!=-128){r6=2699;break L3115}}else if((r11|0)==224){if((r15&-32)<<24>>24!=-96){r6=2697;break L3115}}else{if((r15&-64)<<24>>24!=-128){r6=2701;break L3115}}r18=r17&255;if((r18&192|0)!=128){r12=r9;break L3113}if(((r15&255)<<6&4032|r11<<12&61440|r18&63)>>>0>r4>>>0){r12=r9;break L3113}r13=r9+3|0;r14=r8;break}if((r10&255)>=245){r12=r9;break L3113}r19=r9;if((r5-r19|0)<4){r12=r9;break L3113}if((r3-r8|0)>>>0<2){r12=r9;break L3113}r18=HEAP8[r9+1|0];r15=HEAP8[r9+2|0];r17=HEAP8[r9+3|0];if((r11|0)==240){if((r18+112&255)>=48){r6=2710;break L3115}}else if((r11|0)==244){if((r18&-16)<<24>>24!=-128){r6=2712;break L3115}}else{if((r18&-64)<<24>>24!=-128){r6=2714;break L3115}}r20=r15&255;if((r20&192|0)!=128){r12=r9;break L3113}r15=r17&255;if((r15&192|0)!=128){r12=r9;break L3113}if(((r18&255)<<12&258048|r11<<18&1835008|r20<<6&4032|r15&63)>>>0>r4>>>0){r12=r9;break L3113}r13=r9+4|0;r14=r8+1|0}}while(0);r11=r14+1|0;if(r13>>>0<r2>>>0&r11>>>0<r3>>>0){r8=r11;r9=r13}else{r12=r13;break L3113}}if(r6==2701){r21=r16-r1|0;return r21}else if(r6==2710){r21=r19-r1|0;return r21}else if(r6==2697){r21=r16-r1|0;return r21}else if(r6==2699){r21=r16-r1|0;return r21}else if(r6==2712){r21=r19-r1|0;return r21}else if(r6==2714){r21=r19-r1|0;return r21}}else{r12=r7}}while(0);r21=r12-r1|0;return r21}function __ZNKSt3__17codecvtIDsc10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){return __ZNSt3__1L20utf8_to_utf16_lengthEPKhS1_jmNS_12codecvt_modeE(r3,r4,r5,1114111,0)}function __ZNSt3__17codecvtIDic10_mbstate_tED0Ev(r1){__ZdlPv(r1);return}function __ZNKSt3__17codecvtIDic10_mbstate_tE6do_outERS1_PKDiS5_RS5_PcS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L12ucs4_to_utf8EPKjS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=(HEAP32[r1>>2]-r3>>2<<2)+r3;HEAP32[r8>>2]=r6+(HEAP32[r9>>2]-r6);STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDic10_mbstate_tE10do_unshiftERS1_PcS4_RS4_(r1,r2,r3,r4,r5){HEAP32[r5>>2]=r3;return 3}function __ZNKSt3__17codecvtIDic10_mbstate_tE11do_encodingEv(r1){return 0}function __ZNKSt3__17codecvtIDic10_mbstate_tE16do_always_noconvEv(r1){return 0}function __ZNKSt3__17codecvtIDic10_mbstate_tE13do_max_lengthEv(r1){return 4}function __ZNSt3__1L12ucs4_to_utf8EPKjS1_RS1_PhS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12;r9=r6>>2;r6=0;HEAP32[r3>>2]=r1;HEAP32[r9]=r4;do{if((r8&2|0)!=0){if((r5-r4|0)<3){r10=1;return r10}else{HEAP32[r9]=r4+1;HEAP8[r4]=-17;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-69;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=-65;break}}}while(0);r4=HEAP32[r3>>2];if(r4>>>0>=r2>>>0){r10=0;return r10}r8=r5;r5=r4;L14:while(1){r4=HEAP32[r5>>2];if((r4&-2048|0)==55296|r4>>>0>r7>>>0){r10=2;r6=26;break}do{if(r4>>>0<128){r1=HEAP32[r9];if((r8-r1|0)<1){r10=1;r6=27;break L14}HEAP32[r9]=r1+1;HEAP8[r1]=r4&255}else{if(r4>>>0<2048){r1=HEAP32[r9];if((r8-r1|0)<2){r10=1;r6=28;break L14}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>6|192)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4&63|128)&255;break}r1=HEAP32[r9];r11=r8-r1|0;if(r4>>>0<65536){if((r11|0)<3){r10=1;r6=29;break L14}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>12|224)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r4>>>6&63|128)&255;r12=HEAP32[r9];HEAP32[r9]=r12+1;HEAP8[r12]=(r4&63|128)&255;break}else{if((r11|0)<4){r10=1;r6=30;break L14}HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>18|240)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>12&63|128)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4>>>6&63|128)&255;r1=HEAP32[r9];HEAP32[r9]=r1+1;HEAP8[r1]=(r4&63|128)&255;break}}}while(0);r4=HEAP32[r3>>2]+4|0;HEAP32[r3>>2]=r4;if(r4>>>0<r2>>>0){r5=r4}else{r10=0;r6=31;break}}if(r6==26){return r10}else if(r6==27){return r10}else if(r6==28){return r10}else if(r6==29){return r10}else if(r6==30){return r10}else if(r6==31){return r10}}function __ZNSt3__1L12utf8_to_ucs4EPKhS1_RS1_PjS3_RS3_mNS_12codecvt_modeE(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19;r9=r3>>2;r3=0;HEAP32[r9]=r1;HEAP32[r6>>2]=r4;r4=HEAP32[r9];do{if((r8&4|0)==0){r10=r4}else{if((r2-r4|0)<=2){r10=r4;break}if((HEAP8[r4]|0)!=-17){r10=r4;break}if((HEAP8[r4+1|0]|0)!=-69){r10=r4;break}if((HEAP8[r4+2|0]|0)!=-65){r10=r4;break}r1=r4+3|0;HEAP32[r9]=r1;r10=r1}}while(0);L46:do{if(r10>>>0<r2>>>0){r4=r2;r8=HEAP32[r6>>2],r1=r8>>2;r11=r10;L48:while(1){if(r8>>>0>=r5>>>0){r12=r11;break L46}r13=HEAP8[r11];r14=r13&255;do{if(r13<<24>>24>-1){if(r14>>>0>r7>>>0){r15=2;r3=72;break L48}HEAP32[r1]=r14;HEAP32[r9]=HEAP32[r9]+1}else{if((r13&255)<194){r15=2;r3=73;break L48}if((r13&255)<224){if((r4-r11|0)<2){r15=1;r3=74;break L48}r16=HEAPU8[r11+1|0];if((r16&192|0)!=128){r15=2;r3=75;break L48}r17=r16&63|r14<<6&1984;if(r17>>>0>r7>>>0){r15=2;r3=76;break L48}HEAP32[r1]=r17;HEAP32[r9]=HEAP32[r9]+2;break}if((r13&255)<240){if((r4-r11|0)<3){r15=1;r3=77;break L48}r17=HEAP8[r11+1|0];r16=HEAP8[r11+2|0];if((r14|0)==224){if((r17&-32)<<24>>24!=-96){r15=2;r3=78;break L48}}else if((r14|0)==237){if((r17&-32)<<24>>24!=-128){r15=2;r3=79;break L48}}else{if((r17&-64)<<24>>24!=-128){r15=2;r3=80;break L48}}r18=r16&255;if((r18&192|0)!=128){r15=2;r3=81;break L48}r16=(r17&255)<<6&4032|r14<<12&61440|r18&63;if(r16>>>0>r7>>>0){r15=2;r3=82;break L48}HEAP32[r1]=r16;HEAP32[r9]=HEAP32[r9]+3;break}if((r13&255)>=245){r15=2;r3=83;break L48}if((r4-r11|0)<4){r15=1;r3=84;break L48}r16=HEAP8[r11+1|0];r18=HEAP8[r11+2|0];r17=HEAP8[r11+3|0];if((r14|0)==240){if((r16+112&255)>=48){r15=2;r3=85;break L48}}else if((r14|0)==244){if((r16&-16)<<24>>24!=-128){r15=2;r3=86;break L48}}else{if((r16&-64)<<24>>24!=-128){r15=2;r3=87;break L48}}r19=r18&255;if((r19&192|0)!=128){r15=2;r3=88;break L48}r18=r17&255;if((r18&192|0)!=128){r15=2;r3=89;break L48}r17=(r16&255)<<12&258048|r14<<18&1835008|r19<<6&4032|r18&63;if(r17>>>0>r7>>>0){r15=2;r3=90;break L48}HEAP32[r1]=r17;HEAP32[r9]=HEAP32[r9]+4}}while(0);r14=HEAP32[r6>>2]+4|0;HEAP32[r6>>2]=r14;r13=HEAP32[r9];if(r13>>>0<r2>>>0){r8=r14,r1=r8>>2;r11=r13}else{r12=r13;break L46}}if(r3==72){return r15}else if(r3==73){return r15}else if(r3==74){return r15}else if(r3==75){return r15}else if(r3==76){return r15}else if(r3==77){return r15}else if(r3==78){return r15}else if(r3==79){return r15}else if(r3==80){return r15}else if(r3==81){return r15}else if(r3==82){return r15}else if(r3==83){return r15}else if(r3==84){return r15}else if(r3==85){return r15}else if(r3==86){return r15}else if(r3==87){return r15}else if(r3==88){return r15}else if(r3==89){return r15}else if(r3==90){return r15}}else{r12=r10}}while(0);r15=r12>>>0<r2>>>0&1;return r15}function __ZNSt3__1L19utf8_to_ucs4_lengthEPKhS1_jmNS_12codecvt_modeE(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20;r6=0;do{if((r5&4|0)==0){r7=r1}else{if((r2-r1|0)<=2){r7=r1;break}if((HEAP8[r1]|0)!=-17){r7=r1;break}if((HEAP8[r1+1|0]|0)!=-69){r7=r1;break}r7=(HEAP8[r1+2|0]|0)==-65?r1+3|0:r1}}while(0);L113:do{if(r7>>>0<r2>>>0&(r3|0)!=0){r5=r2;r8=1;r9=r7;L115:while(1){r10=HEAP8[r9];r11=r10&255;do{if(r10<<24>>24>-1){if(r11>>>0>r4>>>0){r12=r9;break L113}r13=r9+1|0}else{if((r10&255)<194){r12=r9;break L113}if((r10&255)<224){if((r5-r9|0)<2){r12=r9;break L113}r14=HEAPU8[r9+1|0];if((r14&192|0)!=128){r12=r9;break L113}if((r14&63|r11<<6&1984)>>>0>r4>>>0){r12=r9;break L113}r13=r9+2|0;break}if((r10&255)<240){r15=r9;if((r5-r15|0)<3){r12=r9;break L113}r14=HEAP8[r9+1|0];r16=HEAP8[r9+2|0];if((r11|0)==237){if((r14&-32)<<24>>24!=-128){r6=114;break L115}}else if((r11|0)==224){if((r14&-32)<<24>>24!=-96){r6=112;break L115}}else{if((r14&-64)<<24>>24!=-128){r6=116;break L115}}r17=r16&255;if((r17&192|0)!=128){r12=r9;break L113}if(((r14&255)<<6&4032|r11<<12&61440|r17&63)>>>0>r4>>>0){r12=r9;break L113}r13=r9+3|0;break}if((r10&255)>=245){r12=r9;break L113}r18=r9;if((r5-r18|0)<4){r12=r9;break L113}r17=HEAP8[r9+1|0];r14=HEAP8[r9+2|0];r16=HEAP8[r9+3|0];if((r11|0)==240){if((r17+112&255)>=48){r6=124;break L115}}else if((r11|0)==244){if((r17&-16)<<24>>24!=-128){r6=126;break L115}}else{if((r17&-64)<<24>>24!=-128){r6=128;break L115}}r19=r14&255;if((r19&192|0)!=128){r12=r9;break L113}r14=r16&255;if((r14&192|0)!=128){r12=r9;break L113}if(((r17&255)<<12&258048|r11<<18&1835008|r19<<6&4032|r14&63)>>>0>r4>>>0){r12=r9;break L113}r13=r9+4|0}}while(0);if(!(r13>>>0<r2>>>0&r8>>>0<r3>>>0)){r12=r13;break L113}r8=r8+1|0;r9=r13}if(r6==124){r20=r18-r1|0;return r20}else if(r6==126){r20=r18-r1|0;return r20}else if(r6==128){r20=r18-r1|0;return r20}else if(r6==114){r20=r15-r1|0;return r20}else if(r6==116){r20=r15-r1|0;return r20}else if(r6==112){r20=r15-r1|0;return r20}}else{r12=r7}}while(0);r20=r12-r1|0;return r20}function __ZNKSt3__18numpunctIcE16do_decimal_pointEv(r1){return HEAP8[r1+8|0]}function __ZNKSt3__18numpunctIwE16do_decimal_pointEv(r1){return HEAP32[r1+8>>2]}function __ZNKSt3__18numpunctIcE16do_thousands_sepEv(r1){return HEAP8[r1+9|0]}function __ZNKSt3__18numpunctIwE16do_thousands_sepEv(r1){return HEAP32[r1+12>>2]}function __ZNKSt3__18numpunctIcE11do_truenameEv(r1,r2){r2=r1;HEAP8[r1]=8;r1=r2+1|0;tempBigInt=1702195828;HEAP8[r1]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r1+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r1+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r1+3|0]=tempBigInt&255;HEAP8[r2+5|0]=0;return}function __ZNKSt3__17codecvtIDic10_mbstate_tE5do_inERS1_PKcS5_RS5_PDiS7_RS7_(r1,r2,r3,r4,r5,r6,r7,r8){var r9,r10;r2=STACKTOP;STACKTOP=STACKTOP+16|0;r1=r2;r9=r2+8;HEAP32[r1>>2]=r3;HEAP32[r9>>2]=r6;r10=__ZNSt3__1L12utf8_to_ucs4EPKhS1_RS1_PjS3_RS3_mNS_12codecvt_modeE(r3,r4,r1,r6,r7,r9,1114111,0);HEAP32[r5>>2]=r3+(HEAP32[r1>>2]-r3);HEAP32[r8>>2]=(HEAP32[r9>>2]-r6>>2<<2)+r6;STACKTOP=r2;return r10}function __ZNKSt3__17codecvtIDic10_mbstate_tE9do_lengthERS1_PKcS5_j(r1,r2,r3,r4,r5){return __ZNSt3__1L19utf8_to_ucs4_lengthEPKhS1_jmNS_12codecvt_modeE(r3,r4,r5,1114111,0)}function __ZNSt3__116__narrow_to_utf8ILj32EED0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__117__widen_from_utf8ILj32EED0Ev(r1){__ZdlPv(r1);return}function __ZNSt3__18numpunctIcED0Ev(r1){var r2;HEAP32[r1>>2]=10600;if((HEAP8[r1+12|0]&1)==0){r2=r1;__ZdlPv(r2);return}__ZdlPv(HEAP32[r1+20>>2]);r2=r1;__ZdlPv(r2);return}function __ZNSt3__18numpunctIcED2Ev(r1){HEAP32[r1>>2]=10600;if((HEAP8[r1+12|0]&1)==0){return}__ZdlPv(HEAP32[r1+20>>2]);return}function __ZNSt3__18numpunctIwED0Ev(r1){var r2;HEAP32[r1>>2]=10552;if((HEAP8[r1+16|0]&1)==0){r2=r1;__ZdlPv(r2);return}__ZdlPv(HEAP32[r1+24>>2]);r2=r1;__ZdlPv(r2);return}function __ZNSt3__18numpunctIwED2Ev(r1){HEAP32[r1>>2]=10552;if((HEAP8[r1+16|0]&1)==0){return}__ZdlPv(HEAP32[r1+24>>2]);return}function __ZNKSt3__18numpunctIcE11do_groupingEv(r1,r2){var r3,r4,r5,r6;r3=r2+12|0,r4=r3>>2;if((HEAP8[r3]&1)==0){r3=r1>>2;HEAP32[r3]=HEAP32[r4];HEAP32[r3+1]=HEAP32[r4+1];HEAP32[r3+2]=HEAP32[r4+2];return}r4=HEAP32[r2+20>>2];r3=HEAP32[r2+16>>2];if((r3|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<11){HEAP8[r1]=r3<<1&255;r5=r1+1|0}else{r2=r3+16&-16;r6=__Znwj(r2);HEAP32[r1+8>>2]=r6;HEAP32[r1>>2]=r2|1;HEAP32[r1+4>>2]=r3;r5=r6}_memcpy(r5,r4,r3)|0;HEAP8[r5+r3|0]=0;return}function __ZNKSt3__18numpunctIwE11do_groupingEv(r1,r2){var r3,r4,r5,r6;r3=r2+16|0,r4=r3>>2;if((HEAP8[r3]&1)==0){r3=r1>>2;HEAP32[r3]=HEAP32[r4];HEAP32[r3+1]=HEAP32[r4+1];HEAP32[r3+2]=HEAP32[r4+2];return}r4=HEAP32[r2+24>>2];r3=HEAP32[r2+20>>2];if((r3|0)==-1){__ZNKSt3__121__basic_string_commonILb1EE20__throw_length_errorEv(0)}if(r3>>>0<11){HEAP8[r1]=r3<<1&255;r5=r1+1|0}else{r2=r3+16&-16;r6=__Znwj(r2);HEAP32[r1+8>>2]=r6;HEAP32[r1>>2]=r2|1;HEAP32[r1+4>>2]=r3;r5=r6}_memcpy(r5,r4,r3)|0;HEAP8[r5+r3|0]=0;return}function __ZNKSt3__18numpunctIwE11do_truenameEv(r1,r2){var r3,r4,r5;r2=__Znwj(32);r3=r2;HEAP32[r1+8>>2]=r3;HEAP32[r1>>2]=9;HEAP32[r1+4>>2]=4;r1=2456;r4=4;r5=r3;while(1){r3=r4-1|0;HEAP32[r5>>2]=HEAP32[r1>>2];if((r3|0)==0){break}else{r1=r1+4|0;r4=r3;r5=r5+4|0}}HEAP32[r2+16>>2]=0;return}function __ZNKSt3__18numpunctIcE12do_falsenameEv(r1,r2){r2=r1;HEAP8[r1]=10;r1=r2+1|0;HEAP8[r1]=HEAP8[2424|0];HEAP8[r1+1|0]=HEAP8[2425|0];HEAP8[r1+2|0]=HEAP8[2426|0];HEAP8[r1+3|0]=HEAP8[2427|0];HEAP8[r1+4|0]=HEAP8[2428|0];HEAP8[r2+6|0]=0;return}function __ZNKSt3__18numpunctIwE12do_falsenameEv(r1,r2){var r3,r4,r5;r2=__Znwj(32);r3=r2;HEAP32[r1+8>>2]=r3;HEAP32[r1>>2]=9;HEAP32[r1+4>>2]=5;r1=2264;r4=5;r5=r3;while(1){r3=r4-1|0;HEAP32[r5>>2]=HEAP32[r1>>2];if((r3|0)==0){break}else{r1=r1+4|0;r4=r3;r5=r5+4|0}}HEAP32[r2+20>>2]=0;return}function __ZNKSt3__120__time_get_c_storageIcE7__weeksEv(r1){var r2;if(HEAP8[19256]){r2=HEAP32[2468];return r2}if(!HEAP8[19144]){_memset(8496,0,168);_atexit(734,0,___dso_handle);HEAP8[19144]=1}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8496,3544);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8508,3528);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8520,3520);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8532,3504);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8544,3488);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8556,3448);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8568,3432);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8580,3424);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8592,3416);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8604,3352);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8616,3344);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8628,3320);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8640,3304);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8652,3296);HEAP32[2468]=8496;HEAP8[19256]=1;r2=8496;return r2}function __ZNKSt3__120__time_get_c_storageIwE7__weeksEv(r1){var r2;if(HEAP8[19200]){r2=HEAP32[2446];return r2}if(!HEAP8[19120]){_memset(7752,0,168);_atexit(382,0,___dso_handle);HEAP8[19120]=1}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7752,4104,6);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7764,4072,6);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7776,4040,7);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7788,4e3,9);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7800,3896,8);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7812,3864,6);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7824,3816,8);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7836,3800,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7848,3784,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7860,3768,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7872,3712,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7884,3696,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7896,3680,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7908,3664,3);HEAP32[2446]=7752;HEAP8[19200]=1;r2=7752;return r2}function __ZNKSt3__120__time_get_c_storageIcE8__monthsEv(r1){var r2;if(HEAP8[19248]){r2=HEAP32[2466];return r2}if(!HEAP8[19136]){_memset(8208,0,288);_atexit(424,0,___dso_handle);HEAP8[19136]=1}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8208,384);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8220,368);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8232,344);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8244,336);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8256,328);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8268,320);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8280,312);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8292,296);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8304,264);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8316,256);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8328,200);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8340,184);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8352,176);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8364,168);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8376,160);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8388,152);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8400,328);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8412,144);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8424,136);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8436,4168);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8448,4160);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8460,4152);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8472,4144);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8484,4136);HEAP32[2466]=8208;HEAP8[19248]=1;r2=8208;return r2}function __ZNKSt3__120__time_get_c_storageIwE8__monthsEv(r1){var r2;if(HEAP8[19192]){r2=HEAP32[2444];return r2}if(!HEAP8[19112]){_memset(7464,0,288);_atexit(320,0,___dso_handle);HEAP8[19112]=1}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7464,1072,7);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7476,1032,8);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7488,1008,5);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7500,936,5);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7512,608,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7524,912,4);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7536,888,4);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7548,856,6);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7560,816,9);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7572,784,7);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7584,744,8);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7596,704,8);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7608,688,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7620,656,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7632,640,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7644,624,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7656,608,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7668,592,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7680,576,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7692,560,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7704,544,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7716,528,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7728,416,3);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7740,392,3);HEAP32[2444]=7464;HEAP8[19192]=1;r2=7464;return r2}function __ZNKSt3__120__time_get_c_storageIcE7__am_pmEv(r1){var r2;if(HEAP8[19264]){r2=HEAP32[2470];return r2}if(!HEAP8[19152]){_memset(8664,0,288);_atexit(316,0,___dso_handle);HEAP8[19152]=1}__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8664,1136);__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6assignEPKc(8676,1104);HEAP32[2470]=8664;HEAP8[19264]=1;r2=8664;return r2}function __ZNKSt3__120__time_get_c_storageIwE7__am_pmEv(r1){var r2;if(HEAP8[19208]){r2=HEAP32[2448];return r2}if(!HEAP8[19128]){_memset(7920,0,288);_atexit(690,0,___dso_handle);HEAP8[19128]=1}__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7920,1160,2);__ZNSt3__112basic_stringIwNS_11char_traitsIwEENS_9allocatorIwEEE6assignEPKwj(7932,1144,2);HEAP32[2448]=7920;HEAP8[19208]=1;r2=7920;return r2}function __ZNKSt3__120__time_get_c_storageIcE3__xEv(r1){var r2;if(HEAP8[19272]){return 9888}HEAP8[9888]=16;r1=9889;r2=r1|0;tempBigInt=623865125;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;r2=r1+4|0;tempBigInt=2032480100;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;HEAP8[9897|0]=0;_atexit(726,9888,___dso_handle);HEAP8[19272]=1;return 9888}function __ZNKSt3__120__time_get_c_storageIwE3__xEv(r1){var r2,r3,r4,r5;if(HEAP8[19216]){return 9800}r1=__Znwj(48);r2=r1;HEAP32[2452]=r2;HEAP32[2450]=13;HEAP32[2451]=8;r3=2032;r4=8;r5=r2;while(1){r2=r4-1|0;HEAP32[r5>>2]=HEAP32[r3>>2];if((r2|0)==0){break}else{r3=r3+4|0;r4=r2;r5=r5+4|0}}HEAP32[r1+32>>2]=0;_atexit(488,9800,___dso_handle);HEAP8[19216]=1;return 9800}function __ZNKSt3__120__time_get_c_storageIcE3__XEv(r1){var r2;if(HEAP8[19296]){return 9936}HEAP8[9936]=16;r1=9937;r2=r1|0;tempBigInt=624576549;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;r2=r1+4|0;tempBigInt=1394948685;HEAP8[r2]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+1|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+2|0]=tempBigInt&255;tempBigInt=tempBigInt>>8;HEAP8[r2+3|0]=tempBigInt&255;HEAP8[9945|0]=0;_atexit(726,9936,___dso_handle);HEAP8[19296]=1;return 9936}function __ZNKSt3__120__time_get_c_storageIwE3__XEv(r1){var r2,r3,r4,r5;if(HEAP8[19240]){return 9848}r1=__Znwj(48);r2=r1;HEAP32[2464]=r2;HEAP32[2462]=13;HEAP32[2463]=8;r3=1936;r4=8;r5=r2;while(1){r2=r4-1|0;HEAP32[r5>>2]=HEAP32[r3>>2];if((r2|0)==0){break}else{r3=r3+4|0;r4=r2;r5=r5+4|0}}HEAP32[r1+32>>2]=0;_atexit(488,9848,___dso_handle);HEAP8[19240]=1;return 9848}function __ZNKSt3__120__time_get_c_storageIcE3__cEv(r1){if(HEAP8[19288]){return 9920}r1=__Znwj(32);HEAP32[2482]=r1;HEAP32[2480]=33;HEAP32[2481]=20;_memcpy(r1,1888,20)|0;HEAP8[r1+20|0]=0;_atexit(726,9920,___dso_handle);HEAP8[19288]=1;return 9920}function __ZNKSt3__120__time_get_c_storageIwE3__cEv(r1){var r2,r3,r4,r5;if(HEAP8[19232]){return 9832}r1=__Znwj(96);r2=r1;HEAP32[2460]=r2;HEAP32[2458]=25;HEAP32[2459]=20;r3=1752;r4=20;r5=r2;while(1){r2=r4-1|0;HEAP32[r5>>2]=HEAP32[r3>>2];if((r2|0)==0){break}else{r3=r3+4|0;r4=r2;r5=r5+4|0}}HEAP32[r1+80>>2]=0;_atexit(488,9832,___dso_handle);HEAP8[19232]=1;return 9832}function __ZNKSt3__120__time_get_c_storageIcE3__rEv(r1){if(HEAP8[19280]){return 9904}r1=__Znwj(16);HEAP32[2478]=r1;HEAP32[2476]=17;HEAP32[2477]=11;_memcpy(r1,1680,11)|0;HEAP8[r1+11|0]=0;_atexit(726,9904,___dso_handle);HEAP8[19280]=1;return 9904}function __ZNKSt3__120__time_get_c_storageIwE3__rEv(r1){var r2,r3,r4,r5;if(HEAP8[19224]){return 9816}r1=__Znwj(48);r2=r1;HEAP32[2456]=r2;HEAP32[2454]=13;HEAP32[2455]=11;r3=1568;r4=11;r5=r2;while(1){r2=r4-1|0;HEAP32[r5>>2]=HEAP32[r3>>2];if((r2|0)==0){break}else{r3=r3+4|0;r4=r2;r5=r5+4|0}}HEAP32[r1+44>>2]=0;_atexit(488,9816,___dso_handle);HEAP8[19224]=1;return 9816}function __ZNSt3__117__call_once_proxyINS_5tupleIJNS_12_GLOBAL__N_111__fake_bindEEEEEEvPv(r1){var r2,r3,r4,r5;r2=r1+4|0;r3=HEAP32[r1>>2]+HEAP32[r2+4>>2]|0;r1=r3;r4=HEAP32[r2>>2];if((r4&1|0)==0){r5=r4;FUNCTION_TABLE[r5](r1);return}else{r5=HEAP32[HEAP32[r3>>2]+(r4-1)>>2];FUNCTION_TABLE[r5](r1);return}}function ___cxx_global_array_dtor(r1){var r2;r1=8208;while(1){r2=r1-12|0;if((HEAP8[r2]&1)!=0){__ZdlPv(HEAP32[r1-12+8>>2])}if((r2|0)==7920){break}else{r1=r2}}return}function ___cxx_global_array_dtor53(r1){var r2;r1=8952;while(1){r2=r1-12|0;if((HEAP8[r2]&1)!=0){__ZdlPv(HEAP32[r1-12+8>>2])}if((r2|0)==8664){break}else{r1=r2}}return}function ___cxx_global_array_dtor56(r1){var r2;r1=7752;while(1){r2=r1-12|0;if((HEAP8[r2]&1)!=0){__ZdlPv(HEAP32[r1-12+8>>2])}if((r2|0)==7464){break}else{r1=r2}}return}function ___cxx_global_array_dtor81(r1){var r2;r1=8496;while(1){r2=r1-12|0;if((HEAP8[r2]&1)!=0){__ZdlPv(HEAP32[r1-12+8>>2])}if((r2|0)==8208){break}else{r1=r2}}return}function ___cxx_global_array_dtor105(r1){if((HEAP8[7908|0]&1)!=0){__ZdlPv(HEAP32[1979])}if((HEAP8[7896|0]&1)!=0){__ZdlPv(HEAP32[1976])}if((HEAP8[7884|0]&1)!=0){__ZdlPv(HEAP32[1973])}if((HEAP8[7872|0]&1)!=0){__ZdlPv(HEAP32[1970])}if((HEAP8[7860|0]&1)!=0){__ZdlPv(HEAP32[1967])}if((HEAP8[7848|0]&1)!=0){__ZdlPv(HEAP32[1964])}if((HEAP8[7836|0]&1)!=0){__ZdlPv(HEAP32[1961])}if((HEAP8[7824|0]&1)!=0){__ZdlPv(HEAP32[1958])}if((HEAP8[7812|0]&1)!=0){__ZdlPv(HEAP32[1955])}if((HEAP8[7800|0]&1)!=0){__ZdlPv(HEAP32[1952])}if((HEAP8[7788|0]&1)!=0){__ZdlPv(HEAP32[1949])}if((HEAP8[7776|0]&1)!=0){__ZdlPv(HEAP32[1946])}if((HEAP8[7764|0]&1)!=0){__ZdlPv(HEAP32[1943])}if((HEAP8[7752]&1)==0){return}__ZdlPv(HEAP32[1940]);return}function __ZNSt3__16vectorIPNS_6locale5facetENS_15__sso_allocatorIS3_Lj28EEEE8__appendEj(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17;r3=0;r4=r1+8|0;r5=(r1+4|0)>>2;r6=HEAP32[r5];r7=HEAP32[r4>>2];r8=r6;if(r7-r8>>2>>>0>=r2>>>0){r9=r2;r10=r6;while(1){if((r10|0)==0){r11=0}else{HEAP32[r10>>2]=0;r11=HEAP32[r5]}r6=r11+4|0;HEAP32[r5]=r6;r12=r9-1|0;if((r12|0)==0){break}else{r9=r12;r10=r6}}return}r10=r1+16|0;r9=(r1|0)>>2;r11=HEAP32[r9];r6=r8-r11>>2;r8=r6+r2|0;if(r8>>>0>1073741823){__ZNKSt3__120__vector_base_commonILb1EE20__throw_length_errorEv(0)}r12=r7-r11|0;do{if(r12>>2>>>0>536870910){r13=1073741823;r3=365}else{r11=r12>>1;r7=r11>>>0<r8>>>0?r8:r11;if((r7|0)==0){r14=0;r15=0;break}r11=r1+128|0;if(!((HEAP8[r11]&1)==0&r7>>>0<29)){r13=r7;r3=365;break}HEAP8[r11]=1;r14=r10;r15=r7}}while(0);if(r3==365){r14=__Znwj(r13<<2);r15=r13}r13=r2;r2=(r6<<2)+r14|0;while(1){if((r2|0)==0){r16=0}else{HEAP32[r2>>2]=0;r16=r2}r17=r16+4|0;r3=r13-1|0;if((r3|0)==0){break}else{r13=r3;r2=r17}}r2=(r15<<2)+r14|0;r15=HEAP32[r9];r13=HEAP32[r5]-r15|0;r16=(r6-(r13>>2)<<2)+r14|0;r14=r16;r6=r15;_memcpy(r14,r6,r13)|0;HEAP32[r9]=r16;HEAP32[r5]=r17;HEAP32[r4>>2]=r2;if((r15|0)==0){return}if((r15|0)==(r10|0)){HEAP8[r1+128|0]=0;return}else{__ZdlPv(r6);return}}function ___cxx_global_array_dtor120(r1){if((HEAP8[8652|0]&1)!=0){__ZdlPv(HEAP32[2165])}if((HEAP8[8640|0]&1)!=0){__ZdlPv(HEAP32[2162])}if((HEAP8[8628|0]&1)!=0){__ZdlPv(HEAP32[2159])}if((HEAP8[8616|0]&1)!=0){__ZdlPv(HEAP32[2156])}if((HEAP8[8604|0]&1)!=0){__ZdlPv(HEAP32[2153])}if((HEAP8[8592|0]&1)!=0){__ZdlPv(HEAP32[2150])}if((HEAP8[8580|0]&1)!=0){__ZdlPv(HEAP32[2147])}if((HEAP8[8568|0]&1)!=0){__ZdlPv(HEAP32[2144])}if((HEAP8[8556|0]&1)!=0){__ZdlPv(HEAP32[2141])}if((HEAP8[8544|0]&1)!=0){__ZdlPv(HEAP32[2138])}if((HEAP8[8532|0]&1)!=0){__ZdlPv(HEAP32[2135])}if((HEAP8[8520|0]&1)!=0){__ZdlPv(HEAP32[2132])}if((HEAP8[8508|0]&1)!=0){__ZdlPv(HEAP32[2129])}if((HEAP8[8496]&1)==0){return}__ZdlPv(HEAP32[2126]);return}function _mbrtowc(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;HEAP32[r6>>2]=r1;r7=(((r4|0)==0?104:r4)|0)>>2;r4=HEAP32[r7];L492:do{if((r2|0)==0){if((r4|0)==0){r8=0}else{break}STACKTOP=r5;return r8}else{if((r1|0)==0){r9=r6;HEAP32[r6>>2]=r9;r10=r9}else{r10=r1}if((r3|0)==0){r8=-2;STACKTOP=r5;return r8}do{if((r4|0)==0){r9=HEAP8[r2];r11=r9&255;if(r9<<24>>24>-1){HEAP32[r10>>2]=r11;r8=r9<<24>>24!=0&1;STACKTOP=r5;return r8}else{r9=r11-194|0;if(r9>>>0>50){break L492}r12=r2+1|0;r13=HEAP32[___fsmu8+(r9<<2)>>2];r14=r3-1|0;break}}else{r12=r2;r13=r4;r14=r3}}while(0);L508:do{if((r14|0)==0){r15=r13}else{r9=HEAP8[r12];r11=(r9&255)>>>3;if((r11-16|(r13>>26)+r11)>>>0>7){break L492}else{r16=r12;r17=r13;r18=r14;r19=r9}while(1){r9=r16+1|0;r20=(r19&255)-128|r17<<6;r21=r18-1|0;if((r20|0)>=0){break}if((r21|0)==0){r15=r20;break L508}r11=HEAP8[r9];if(((r11&255)-128|0)>>>0>63){break L492}else{r16=r9;r17=r20;r18=r21;r19=r11}}HEAP32[r7]=0;HEAP32[r10>>2]=r20;r8=r3-r21|0;STACKTOP=r5;return r8}}while(0);HEAP32[r7]=r15;r8=-2;STACKTOP=r5;return r8}}while(0);HEAP32[r7]=0;HEAP32[___errno_location()>>2]=138;r8=-1;STACKTOP=r5;return r8}function _mbsnrtowcs(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36;r6=STACKTOP;STACKTOP=STACKTOP+1032|0;r7=r6;r8=r6+1024,r9=r8>>2;r10=HEAP32[r2>>2];HEAP32[r9]=r10;r11=(r1|0)!=0;r12=r11?r4:256;r4=r11?r1:r7|0;L523:do{if((r10|0)==0|(r12|0)==0){r13=0;r14=r3;r15=r12;r16=r4;r17=r10}else{r1=r7|0;r18=r12;r19=r3;r20=0;r21=r4;r22=r10;while(1){r23=r19>>>2;r24=r23>>>0>=r18>>>0;if(!(r24|r19>>>0>131)){r13=r20;r14=r19;r15=r18;r16=r21;r17=r22;break L523}r25=r24?r18:r23;r26=r19-r25|0;r23=_mbsrtowcs(r21,r8,r25,r5);if((r23|0)==-1){break}if((r21|0)==(r1|0)){r27=r1;r28=r18}else{r27=(r23<<2)+r21|0;r28=r18-r23|0}r25=r23+r20|0;r23=HEAP32[r9];if((r23|0)==0|(r28|0)==0){r13=r25;r14=r26;r15=r28;r16=r27;r17=r23;break L523}else{r18=r28;r19=r26;r20=r25;r21=r27;r22=r23}}r13=-1;r14=r26;r15=0;r16=r21;r17=HEAP32[r9]}}while(0);L534:do{if((r17|0)==0){r29=r13;r30=r17}else{if((r15|0)==0|(r14|0)==0){r29=r13;r30=r17;break}else{r31=r15;r32=r14;r33=r13;r34=r16;r35=r17}while(1){r36=_mbrtowc(r34,r35,r32,r5);if((r36+2|0)>>>0<3){break}r26=r35+r36|0;HEAP32[r9]=r26;r27=r31-1|0;r28=r33+1|0;if((r27|0)==0|(r32|0)==(r36|0)){r29=r28;r30=r26;break L534}else{r31=r27;r32=r32-r36|0;r33=r28;r34=r34+4|0;r35=r26}}if((r36|0)==-1){r29=-1;r30=r35;break}else if((r36|0)==0){HEAP32[r9]=0;r29=r33;r30=0;break}else{HEAP32[r5>>2]=0;r29=r33;r30=r35;break}}}while(0);if(!r11){STACKTOP=r6;return r29}HEAP32[r2>>2]=r30;STACKTOP=r6;return r29}function _mbsrtowcs(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59;r5=0;r6=HEAP32[r2>>2];do{if((r4|0)==0){r5=459}else{r7=r4|0;r8=HEAP32[r7>>2];if((r8|0)==0){r5=459;break}if((r1|0)==0){r9=r8;r10=r6;r11=r3;r5=470;break}HEAP32[r7>>2]=0;r12=r8;r13=r6;r14=r1;r15=r3;r5=490}}while(0);if(r5==459){if((r1|0)==0){r16=r6;r17=r3;r5=461}else{r18=r6;r19=r1;r20=r3;r5=460}}L555:while(1){if(r5==461){r5=0;r6=HEAP8[r16];do{if(((r6&255)-1|0)>>>0<127){if((r16&3|0)!=0){r21=r16;r22=r17;r23=r6;break}r4=HEAP32[r16>>2];if(((r4-16843009|r4)&-2139062144|0)==0){r24=r17;r25=r16}else{r21=r16;r22=r17;r23=r4&255;break}while(1){r26=r25+4|0;r27=r24-4|0;r28=HEAP32[r26>>2];if(((r28-16843009|r28)&-2139062144|0)==0){r24=r27;r25=r26}else{break}}r21=r26;r22=r27;r23=r28&255}else{r21=r16;r22=r17;r23=r6}}while(0);r6=r23&255;if((r6-1|0)>>>0<127){r16=r21+1|0;r17=r22-1|0;r5=461;continue}r4=r6-194|0;if(r4>>>0>50){r29=r22;r30=r1;r31=r21;r5=501;break}r9=HEAP32[___fsmu8+(r4<<2)>>2];r10=r21+1|0;r11=r22;r5=470;continue}else if(r5==470){r5=0;r4=HEAPU8[r10]>>>3;if((r4-16|(r9>>26)+r4)>>>0>7){r5=471;break}r4=r10+1|0;do{if((r9&33554432|0)==0){r32=r4}else{if((HEAPU8[r4]-128|0)>>>0>63){r5=474;break L555}r6=r10+2|0;if((r9&524288|0)==0){r32=r6;break}if((HEAPU8[r6]-128|0)>>>0>63){r5=477;break L555}r32=r10+3|0}}while(0);r16=r32;r17=r11-1|0;r5=461;continue}else if(r5==490){r5=0;r4=HEAPU8[r13];r6=r4>>>3;if((r6-16|(r12>>26)+r6)>>>0>7){r5=491;break}r6=r13+1|0;r33=r4-128|r12<<6;do{if((r33|0)<0){r4=HEAPU8[r6]-128|0;if(r4>>>0>63){r5=494;break L555}r8=r13+2|0;r34=r4|r33<<6;if((r34|0)>=0){r35=r34;r36=r8;break}r4=HEAPU8[r8]-128|0;if(r4>>>0>63){r5=497;break L555}r35=r4|r34<<6;r36=r13+3|0}else{r35=r33;r36=r6}}while(0);HEAP32[r14>>2]=r35;r18=r36;r19=r14+4|0;r20=r15-1|0;r5=460;continue}else if(r5==460){r5=0;if((r20|0)==0){r37=r3;r5=510;break}else{r38=r20;r39=r19;r40=r18}while(1){r6=HEAP8[r40];do{if(((r6&255)-1|0)>>>0<127){if((r40&3|0)==0&r38>>>0>3){r41=r38;r42=r39,r43=r42>>2;r44=r40}else{r45=r40;r46=r39;r47=r38;r48=r6;break}while(1){r49=HEAP32[r44>>2];if(((r49-16843009|r49)&-2139062144|0)!=0){r5=484;break}HEAP32[r43]=r49&255;HEAP32[r43+1]=HEAPU8[r44+1|0];HEAP32[r43+2]=HEAPU8[r44+2|0];r50=r44+4|0;r51=r42+16|0;HEAP32[r43+3]=HEAPU8[r44+3|0];r52=r41-4|0;if(r52>>>0>3){r41=r52;r42=r51,r43=r42>>2;r44=r50}else{r5=485;break}}if(r5==484){r5=0;r45=r44;r46=r42;r47=r41;r48=r49&255;break}else if(r5==485){r5=0;r45=r50;r46=r51;r47=r52;r48=HEAP8[r50];break}}else{r45=r40;r46=r39;r47=r38;r48=r6}}while(0);r53=r48&255;if((r53-1|0)>>>0>=127){break}HEAP32[r46>>2]=r53;r6=r47-1|0;if((r6|0)==0){r37=r3;r5=508;break L555}else{r38=r6;r39=r46+4|0;r40=r45+1|0}}r6=r53-194|0;if(r6>>>0>50){r29=r47;r30=r46;r31=r45;r5=501;break}r12=HEAP32[___fsmu8+(r6<<2)>>2];r13=r45+1|0;r14=r46;r15=r47;r5=490;continue}}if(r5==471){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=500}else if(r5==474){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=500}else if(r5==477){r54=r9;r55=r10-1|0;r56=r1;r57=r11;r5=500}else if(r5==497){r54=r34;r55=r13-1|0;r56=r14;r57=r15;r5=500}else if(r5==491){r54=r12;r55=r13-1|0;r56=r14;r57=r15;r5=500}else if(r5==494){r54=r33;r55=r13-1|0;r56=r14;r57=r15;r5=500}else if(r5==508){return r37}else if(r5==510){return r37}if(r5==500){if((r54|0)==0){r29=r57;r30=r56;r31=r55;r5=501}else{r58=r56;r59=r55}}do{if(r5==501){if((HEAP8[r31]|0)!=0){r58=r30;r59=r31;break}if((r30|0)!=0){HEAP32[r30>>2]=0;HEAP32[r2>>2]=0}r37=r3-r29|0;return r37}}while(0);HEAP32[___errno_location()>>2]=138;if((r58|0)==0){r37=-1;return r37}HEAP32[r2>>2]=r59;r37=-1;return r37}function _wcrtomb(r1,r2,r3){var r4;if((r1|0)==0){r4=1;return r4}if(r2>>>0<128){HEAP8[r1]=r2&255;r4=1;return r4}if(r2>>>0<2048){HEAP8[r1]=(r2>>>6|192)&255;HEAP8[r1+1|0]=(r2&63|128)&255;r4=2;return r4}if(r2>>>0<55296|(r2-57344|0)>>>0<8192){HEAP8[r1]=(r2>>>12|224)&255;HEAP8[r1+1|0]=(r2>>>6&63|128)&255;HEAP8[r1+2|0]=(r2&63|128)&255;r4=3;return r4}if((r2-65536|0)>>>0<1048576){HEAP8[r1]=(r2>>>18|240)&255;HEAP8[r1+1|0]=(r2>>>12&63|128)&255;HEAP8[r1+2|0]=(r2>>>6&63|128)&255;HEAP8[r1+3|0]=(r2&63|128)&255;r4=4;return r4}else{HEAP32[___errno_location()>>2]=138;r4=-1;return r4}}function _wcsnrtombs(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r5=STACKTOP;STACKTOP=STACKTOP+264|0;r6=r5;r7=r5+256,r8=r7>>2;r9=HEAP32[r2>>2];HEAP32[r8]=r9;r10=(r1|0)!=0;r11=r10?r4:256;r4=r10?r1:r6|0;L645:do{if((r9|0)==0|(r11|0)==0){r12=0;r13=r3;r14=r11;r15=r4;r16=r9}else{r1=r6|0;r17=r11;r18=r3;r19=0;r20=r4;r21=r9;while(1){r22=r18>>>0>=r17>>>0;if(!(r22|r18>>>0>32)){r12=r19;r13=r18;r14=r17;r15=r20;r16=r21;break L645}r23=r22?r17:r18;r24=r18-r23|0;r22=_wcsrtombs(r20,r7,r23,0);if((r22|0)==-1){break}if((r20|0)==(r1|0)){r25=r1;r26=r17}else{r25=r20+r22|0;r26=r17-r22|0}r23=r22+r19|0;r22=HEAP32[r8];if((r22|0)==0|(r26|0)==0){r12=r23;r13=r24;r14=r26;r15=r25;r16=r22;break L645}else{r17=r26;r18=r24;r19=r23;r20=r25;r21=r22}}r12=-1;r13=r24;r14=0;r15=r20;r16=HEAP32[r8]}}while(0);L656:do{if((r16|0)==0){r27=r12;r28=r16}else{if((r14|0)==0|(r13|0)==0){r27=r12;r28=r16;break}else{r29=r14;r30=r13;r31=r12;r32=r15;r33=r16}while(1){r34=_wcrtomb(r32,HEAP32[r33>>2],0);if((r34+1|0)>>>0<2){break}r24=r33+4|0;HEAP32[r8]=r24;r25=r30-1|0;r26=r31+1|0;if((r29|0)==(r34|0)|(r25|0)==0){r27=r26;r28=r24;break L656}else{r29=r29-r34|0;r30=r25;r31=r26;r32=r32+r34|0;r33=r24}}if((r34|0)!=0){r27=-1;r28=r33;break}HEAP32[r8]=0;r27=r31;r28=0}}while(0);if(!r10){STACKTOP=r5;return r27}HEAP32[r2>>2]=r28;STACKTOP=r5;return r27}function __ZNSt8bad_castD2Ev(r1){return}function __ZNKSt8bad_cast4whatEv(r1){return 2816}function __ZN10__cxxabiv116__shim_type_infoD2Ev(r1){return}function __ZNK10__cxxabiv116__shim_type_info5noop1Ev(r1){return}function __ZNK10__cxxabiv116__shim_type_info5noop2Ev(r1){return}function __ZNK10__cxxabiv123__fundamental_type_info9can_catchEPKNS_16__shim_type_infoERPv(r1,r2,r3){return(r1|0)==(r2|0)}function __ZNK10__cxxabiv117__class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((HEAP32[r2+8>>2]|0)!=(r1|0)){return}r1=r2+16|0;r5=HEAP32[r1>>2];if((r5|0)==0){HEAP32[r1>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r5|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function _wcsrtombs(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24;r4=r2>>2;r2=0;r5=STACKTOP;STACKTOP=STACKTOP+8|0;r6=r5;if((r1|0)==0){r7=HEAP32[r4];r8=r6|0;r9=HEAP32[r7>>2];if((r9|0)==0){r10=0;STACKTOP=r5;return r10}else{r11=0;r12=r7;r13=r9}while(1){if(r13>>>0>127){r9=_wcrtomb(r8,r13,0);if((r9|0)==-1){r10=-1;r2=598;break}else{r14=r9}}else{r14=1}r9=r14+r11|0;r7=r12+4|0;r15=HEAP32[r7>>2];if((r15|0)==0){r10=r9;r2=599;break}else{r11=r9;r12=r7;r13=r15}}if(r2==598){STACKTOP=r5;return r10}else if(r2==599){STACKTOP=r5;return r10}}L704:do{if(r3>>>0>3){r13=r3;r12=r1;r11=HEAP32[r4];while(1){r14=HEAP32[r11>>2];if((r14|0)==0){r16=r13;r17=r12;break L704}if(r14>>>0>127){r8=_wcrtomb(r12,r14,0);if((r8|0)==-1){r10=-1;break}r18=r12+r8|0;r19=r13-r8|0;r20=r11}else{HEAP8[r12]=r14&255;r18=r12+1|0;r19=r13-1|0;r20=HEAP32[r4]}r14=r20+4|0;HEAP32[r4]=r14;if(r19>>>0>3){r13=r19;r12=r18;r11=r14}else{r16=r19;r17=r18;break L704}}STACKTOP=r5;return r10}else{r16=r3;r17=r1}}while(0);L716:do{if((r16|0)==0){r21=0}else{r1=r6|0;r18=r16;r19=r17;r20=HEAP32[r4];while(1){r11=HEAP32[r20>>2];if((r11|0)==0){r2=591;break}if(r11>>>0>127){r12=_wcrtomb(r1,r11,0);if((r12|0)==-1){r10=-1;r2=596;break}if(r12>>>0>r18>>>0){r2=587;break}_wcrtomb(r19,HEAP32[r20>>2],0);r22=r19+r12|0;r23=r18-r12|0;r24=r20}else{HEAP8[r19]=r11&255;r22=r19+1|0;r23=r18-1|0;r24=HEAP32[r4]}r11=r24+4|0;HEAP32[r4]=r11;if((r23|0)==0){r21=0;break L716}else{r18=r23;r19=r22;r20=r11}}if(r2==596){STACKTOP=r5;return r10}else if(r2==591){HEAP8[r19]=0;r21=r18;break}else if(r2==587){r10=r3-r18|0;STACKTOP=r5;return r10}}}while(0);HEAP32[r4]=0;r10=r3-r21|0;STACKTOP=r5;return r10}function __ZNSt8bad_castD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv123__fundamental_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv117__class_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv120__si_class_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZN10__cxxabiv121__vmi_class_type_infoD0Ev(r1){__ZdlPv(r1);return}function __ZNK10__cxxabiv117__class_type_info9can_catchEPKNS_16__shim_type_infoERPv(r1,r2,r3){var r4,r5,r6,r7,r8,r9;r4=STACKTOP;STACKTOP=STACKTOP+56|0;r5=r4,r6=r5>>2;do{if((r1|0)==(r2|0)){r7=1}else{if((r2|0)==0){r7=0;break}r8=___dynamic_cast(r2,17736,17720,-1);r9=r8;if((r8|0)==0){r7=0;break}_memset(r5,0,56);HEAP32[r6]=r9;HEAP32[r6+2]=r1;HEAP32[r6+3]=-1;HEAP32[r6+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+28>>2]](r9,r5,HEAP32[r3>>2],1);if((HEAP32[r6+6]|0)!=1){r7=0;break}HEAP32[r3>>2]=HEAP32[r6+4];r7=1}}while(0);STACKTOP=r4;return r7}function __ZNK10__cxxabiv120__si_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5;if((r1|0)!=(HEAP32[r2+8>>2]|0)){r5=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r5>>2]+28>>2]](r5,r2,r3,r4);return}r5=r2+16|0;r1=HEAP32[r5>>2];if((r1|0)==0){HEAP32[r5>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r3=r2+24|0;if((HEAP32[r3>>2]|0)!=2){return}HEAP32[r3>>2]=r4;return}function __ZNK10__cxxabiv121__vmi_class_type_info27has_unambiguous_public_baseEPNS_19__dynamic_cast_infoEPvi(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11;r5=0;if((r1|0)==(HEAP32[r2+8>>2]|0)){r6=r2+16|0;r7=HEAP32[r6>>2];if((r7|0)==0){HEAP32[r6>>2]=r3;HEAP32[r2+24>>2]=r4;HEAP32[r2+36>>2]=1;return}if((r7|0)!=(r3|0)){r7=r2+36|0;HEAP32[r7>>2]=HEAP32[r7>>2]+1;HEAP32[r2+24>>2]=2;HEAP8[r2+54|0]=1;return}r7=r2+24|0;if((HEAP32[r7>>2]|0)!=2){return}HEAP32[r7>>2]=r4;return}r7=HEAP32[r1+12>>2];r6=(r7<<3)+r1+16|0;r8=HEAP32[r1+20>>2];r9=r8>>8;if((r8&1|0)==0){r10=r9}else{r10=HEAP32[HEAP32[r3>>2]+r9>>2]}r9=HEAP32[r1+16>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r2,r3+r10|0,(r8&2|0)!=0?r4:2);if((r7|0)<=1){return}r7=r2+54|0;r8=r3;r10=r1+24|0;while(1){r1=HEAP32[r10+4>>2];r9=r1>>8;if((r1&1|0)==0){r11=r9}else{r11=HEAP32[HEAP32[r8>>2]+r9>>2]}r9=HEAP32[r10>>2];FUNCTION_TABLE[HEAP32[HEAP32[r9>>2]+28>>2]](r9,r2,r3+r11|0,(r1&2|0)!=0?r4:2);if((HEAP8[r7]&1)!=0){r5=646;break}r1=r10+8|0;if(r1>>>0<r6>>>0){r10=r1}else{r5=647;break}}if(r5==646){return}else if(r5==647){return}}function ___dynamic_cast(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;r5=STACKTOP;STACKTOP=STACKTOP+56|0;r6=r5,r7=r6>>2;r8=HEAP32[r1>>2];r9=r1+HEAP32[r8-8>>2]|0;r10=HEAP32[r8-4>>2];r8=r10;HEAP32[r7]=r3;HEAP32[r7+1]=r1;HEAP32[r7+2]=r2;HEAP32[r7+3]=r4;r4=r6+16|0;r2=r6+20|0;r1=r6+24|0;r11=r6+28|0;r12=r6+32|0;r13=r6+40|0;_memset(r4,0,39);if((r10|0)==(r3|0)){HEAP32[r7+12]=1;FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+20>>2]](r8,r6,r9,r9,1,0);STACKTOP=r5;return(HEAP32[r1>>2]|0)==1?r9:0}FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r8,r6,r9,1,0);r9=HEAP32[r7+9];do{if((r9|0)==0){if((HEAP32[r13>>2]|0)!=1){r14=0;break}if((HEAP32[r11>>2]|0)!=1){r14=0;break}r14=(HEAP32[r12>>2]|0)==1?HEAP32[r2>>2]:0}else if((r9|0)==1){if((HEAP32[r1>>2]|0)!=1){if((HEAP32[r13>>2]|0)!=0){r14=0;break}if((HEAP32[r11>>2]|0)!=1){r14=0;break}if((HEAP32[r12>>2]|0)!=1){r14=0;break}}r14=HEAP32[r4>>2]}else{r14=0}}while(0);STACKTOP=r5;return r14}function __ZNK10__cxxabiv121__vmi_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34;r6=r2>>2;r7=r1>>2;r8=0;r9=r1|0;if((r9|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r10=r2+28|0;if((HEAP32[r10>>2]|0)==1){return}HEAP32[r10>>2]=r4;return}if((r9|0)==(HEAP32[r6]|0)){do{if((HEAP32[r6+4]|0)!=(r3|0)){r9=r2+20|0;if((HEAP32[r9>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r10=(r2+44|0)>>2;if((HEAP32[r10]|0)==4){return}r11=HEAP32[r7+3];r12=(r11<<3)+r1+16|0;L828:do{if((r11|0)>0){r13=r2+52|0;r14=r2+53|0;r15=r2+54|0;r16=r1+8|0;r17=r2+24|0;r18=r3;r19=0;r20=r1+16|0;r21=0;L830:while(1){HEAP8[r13]=0;HEAP8[r14]=0;r22=HEAP32[r20+4>>2];r23=r22>>8;if((r22&1|0)==0){r24=r23}else{r24=HEAP32[HEAP32[r18>>2]+r23>>2]}r23=HEAP32[r20>>2];FUNCTION_TABLE[HEAP32[HEAP32[r23>>2]+20>>2]](r23,r2,r3,r3+r24|0,2-(r22>>>1&1)|0,r5);if((HEAP8[r15]&1)!=0){r25=r21;r26=r19;break}do{if((HEAP8[r14]&1)==0){r27=r21;r28=r19}else{if((HEAP8[r13]&1)==0){if((HEAP32[r16>>2]&1|0)==0){r25=1;r26=r19;break L830}else{r27=1;r28=r19;break}}if((HEAP32[r17>>2]|0)==1){r8=687;break L828}if((HEAP32[r16>>2]&2|0)==0){r8=687;break L828}else{r27=1;r28=1}}}while(0);r22=r20+8|0;if(r22>>>0<r12>>>0){r19=r28;r20=r22;r21=r27}else{r25=r27;r26=r28;break}}if(r26){r29=r25;r8=686}else{r30=r25;r8=683}}else{r30=0;r8=683}}while(0);do{if(r8==683){HEAP32[r9>>2]=r3;r12=r2+40|0;HEAP32[r12>>2]=HEAP32[r12>>2]+1;if((HEAP32[r6+9]|0)!=1){r29=r30;r8=686;break}if((HEAP32[r6+6]|0)!=2){r29=r30;r8=686;break}HEAP8[r2+54|0]=1;if(r30){r8=687}else{r8=688}}}while(0);if(r8==686){if(r29){r8=687}else{r8=688}}if(r8==687){HEAP32[r10]=3;return}else if(r8==688){HEAP32[r10]=4;return}}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}r6=HEAP32[r7+3];r29=(r6<<3)+r1+16|0;r30=HEAP32[r7+5];r25=r30>>8;if((r30&1|0)==0){r31=r25}else{r31=HEAP32[HEAP32[r3>>2]+r25>>2]}r25=HEAP32[r7+4];FUNCTION_TABLE[HEAP32[HEAP32[r25>>2]+24>>2]](r25,r2,r3+r31|0,(r30&2|0)!=0?r4:2,r5);r30=r1+24|0;if((r6|0)<=1){return}r6=HEAP32[r7+2];do{if((r6&2|0)==0){r7=(r2+36|0)>>2;if((HEAP32[r7]|0)==1){break}if((r6&1|0)==0){r1=r2+54|0;r31=r3;r25=r30;while(1){if((HEAP8[r1]&1)!=0){r8=724;break}if((HEAP32[r7]|0)==1){r8=725;break}r26=HEAP32[r25+4>>2];r28=r26>>8;if((r26&1|0)==0){r32=r28}else{r32=HEAP32[HEAP32[r31>>2]+r28>>2]}r28=HEAP32[r25>>2];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+24>>2]](r28,r2,r3+r32|0,(r26&2|0)!=0?r4:2,r5);r26=r25+8|0;if(r26>>>0<r29>>>0){r25=r26}else{r8=726;break}}if(r8==724){return}else if(r8==725){return}else if(r8==726){return}}r25=r2+24|0;r31=r2+54|0;r1=r3;r10=r30;while(1){if((HEAP8[r31]&1)!=0){r8=729;break}if((HEAP32[r7]|0)==1){if((HEAP32[r25>>2]|0)==1){r8=722;break}}r26=HEAP32[r10+4>>2];r28=r26>>8;if((r26&1|0)==0){r33=r28}else{r33=HEAP32[HEAP32[r1>>2]+r28>>2]}r28=HEAP32[r10>>2];FUNCTION_TABLE[HEAP32[HEAP32[r28>>2]+24>>2]](r28,r2,r3+r33|0,(r26&2|0)!=0?r4:2,r5);r26=r10+8|0;if(r26>>>0<r29>>>0){r10=r26}else{r8=723;break}}if(r8==722){return}else if(r8==723){return}else if(r8==729){return}}}while(0);r33=r2+54|0;r32=r3;r6=r30;while(1){if((HEAP8[r33]&1)!=0){r8=727;break}r30=HEAP32[r6+4>>2];r10=r30>>8;if((r30&1|0)==0){r34=r10}else{r34=HEAP32[HEAP32[r32>>2]+r10>>2]}r10=HEAP32[r6>>2];FUNCTION_TABLE[HEAP32[HEAP32[r10>>2]+24>>2]](r10,r2,r3+r34|0,(r30&2|0)!=0?r4:2,r5);r30=r6+8|0;if(r30>>>0<r29>>>0){r6=r30}else{r8=728;break}}if(r8==727){return}else if(r8==728){return}}function __ZNK10__cxxabiv117__class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6;r5=r2>>2;if((HEAP32[r5+2]|0)==(r1|0)){if((HEAP32[r5+1]|0)!=(r3|0)){return}r6=r2+28|0;if((HEAP32[r6>>2]|0)==1){return}HEAP32[r6>>2]=r4;return}if((HEAP32[r5]|0)!=(r1|0)){return}do{if((HEAP32[r5+4]|0)!=(r3|0)){r1=r2+20|0;if((HEAP32[r1>>2]|0)==(r3|0)){break}HEAP32[r5+8]=r4;HEAP32[r1>>2]=r3;r1=r2+40|0;HEAP32[r1>>2]=HEAP32[r1>>2]+1;do{if((HEAP32[r5+9]|0)==1){if((HEAP32[r5+6]|0)!=2){break}HEAP8[r2+54|0]=1}}while(0);HEAP32[r5+11]=4;return}}while(0);if((r4|0)!=1){return}HEAP32[r5+8]=1;return}function __ZNK10__cxxabiv117__class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7;r6=r2>>2;if((HEAP32[r6+2]|0)!=(r1|0)){return}HEAP8[r2+53|0]=1;if((HEAP32[r6+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r1=HEAP32[r4>>2];if((r1|0)==0){HEAP32[r4>>2]=r3;HEAP32[r6+6]=r5;HEAP32[r6+9]=1;if(!((HEAP32[r6+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r1|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r1=HEAP32[r3>>2];if((r1|0)==2){HEAP32[r3>>2]=r5;r7=r5}else{r7=r1}if(!((HEAP32[r6+12]|0)==1&(r7|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv120__si_class_type_info16search_below_dstEPNS_19__dynamic_cast_infoEPKvib(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13;r6=r2>>2;r7=0;r8=r1|0;if((r8|0)==(HEAP32[r6+2]|0)){if((HEAP32[r6+1]|0)!=(r3|0)){return}r9=r2+28|0;if((HEAP32[r9>>2]|0)==1){return}HEAP32[r9>>2]=r4;return}if((r8|0)!=(HEAP32[r6]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+24>>2]](r8,r2,r3,r4,r5);return}do{if((HEAP32[r6+4]|0)!=(r3|0)){r8=r2+20|0;if((HEAP32[r8>>2]|0)==(r3|0)){break}HEAP32[r6+8]=r4;r9=(r2+44|0)>>2;if((HEAP32[r9]|0)==4){return}r10=r2+52|0;HEAP8[r10]=0;r11=r2+53|0;HEAP8[r11]=0;r12=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r12>>2]+20>>2]](r12,r2,r3,r3,1,r5);if((HEAP8[r11]&1)==0){r13=0;r7=783}else{if((HEAP8[r10]&1)==0){r13=1;r7=783}}L982:do{if(r7==783){HEAP32[r8>>2]=r3;r10=r2+40|0;HEAP32[r10>>2]=HEAP32[r10>>2]+1;do{if((HEAP32[r6+9]|0)==1){if((HEAP32[r6+6]|0)!=2){r7=786;break}HEAP8[r2+54|0]=1;if(r13){break L982}}else{r7=786}}while(0);if(r7==786){if(r13){break}}HEAP32[r9]=4;return}}while(0);HEAP32[r9]=3;return}}while(0);if((r4|0)!=1){return}HEAP32[r6+8]=1;return}function __ZNK10__cxxabiv121__vmi_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=r2+52|0;r9=HEAP8[r8]&1;r10=r2+53|0;r11=HEAP8[r10]&1;r12=HEAP32[r1+12>>2];r13=(r12<<3)+r1+16|0;HEAP8[r8]=0;HEAP8[r10]=0;r14=HEAP32[r1+20>>2];r15=r14>>8;if((r14&1|0)==0){r16=r15}else{r16=HEAP32[HEAP32[r4>>2]+r15>>2]}r15=HEAP32[r1+16>>2];FUNCTION_TABLE[HEAP32[HEAP32[r15>>2]+20>>2]](r15,r2,r3,r4+r16|0,(r14&2|0)!=0?r5:2,r6);L1004:do{if((r12|0)>1){r14=r2+24|0;r16=r1+8|0;r15=r2+54|0;r17=r4;r18=r1+24|0;while(1){if((HEAP8[r15]&1)!=0){break L1004}do{if((HEAP8[r8]&1)==0){if((HEAP8[r10]&1)==0){break}if((HEAP32[r16>>2]&1|0)==0){break L1004}}else{if((HEAP32[r14>>2]|0)==1){break L1004}if((HEAP32[r16>>2]&2|0)==0){break L1004}}}while(0);HEAP8[r8]=0;HEAP8[r10]=0;r19=HEAP32[r18+4>>2];r20=r19>>8;if((r19&1|0)==0){r21=r20}else{r21=HEAP32[HEAP32[r17>>2]+r20>>2]}r20=HEAP32[r18>>2];FUNCTION_TABLE[HEAP32[HEAP32[r20>>2]+20>>2]](r20,r2,r3,r4+r21|0,(r19&2|0)!=0?r5:2,r6);r19=r18+8|0;if(r19>>>0<r13>>>0){r18=r19}else{break}}}}while(0);HEAP8[r8]=r9;HEAP8[r10]=r11;return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r11=HEAP32[r4>>2];if((r11|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r11|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r11=HEAP32[r3>>2];if((r11|0)==2){HEAP32[r3>>2]=r5;r22=r5}else{r22=r11}if(!((HEAP32[r7+12]|0)==1&(r22|0)==1)){return}HEAP8[r2+54|0]=1;return}function __ZNK10__cxxabiv120__si_class_type_info16search_above_dstEPNS_19__dynamic_cast_infoEPKvS4_ib(r1,r2,r3,r4,r5,r6){var r7,r8,r9;r7=r2>>2;if((r1|0)!=(HEAP32[r7+2]|0)){r8=HEAP32[r1+8>>2];FUNCTION_TABLE[HEAP32[HEAP32[r8>>2]+20>>2]](r8,r2,r3,r4,r5,r6);return}HEAP8[r2+53|0]=1;if((HEAP32[r7+1]|0)!=(r4|0)){return}HEAP8[r2+52|0]=1;r4=r2+16|0;r6=HEAP32[r4>>2];if((r6|0)==0){HEAP32[r4>>2]=r3;HEAP32[r7+6]=r5;HEAP32[r7+9]=1;if(!((HEAP32[r7+12]|0)==1&(r5|0)==1)){return}HEAP8[r2+54|0]=1;return}if((r6|0)!=(r3|0)){r3=r2+36|0;HEAP32[r3>>2]=HEAP32[r3>>2]+1;HEAP8[r2+54|0]=1;return}r3=r2+24|0;r6=HEAP32[r3>>2];if((r6|0)==2){HEAP32[r3>>2]=r5;r9=r5}else{r9=r6}if(!((HEAP32[r7+12]|0)==1&(r9|0)==1)){return}HEAP8[r2+54|0]=1;return}function _malloc(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69,r70,r71,r72,r73,r74,r75,r76,r77,r78,r79,r80,r81,r82,r83,r84,r85,r86,r87,r88,r89,r90,r91,r92,r93,r94,r95;r2=0;do{if(r1>>>0<245){if(r1>>>0<11){r3=16}else{r3=r1+11&-8}r4=r3>>>3;r5=HEAP32[1076];r6=r5>>>(r4>>>0);if((r6&3|0)!=0){r7=(r6&1^1)+r4|0;r8=r7<<1;r9=(r8<<2)+4344|0;r10=(r8+2<<2)+4344|0;r8=HEAP32[r10>>2];r11=r8+8|0;r12=HEAP32[r11>>2];do{if((r9|0)==(r12|0)){HEAP32[1076]=r5&(1<<r7^-1)}else{if(r12>>>0<HEAP32[1080]>>>0){_abort()}r13=r12+12|0;if((HEAP32[r13>>2]|0)==(r8|0)){HEAP32[r13>>2]=r9;HEAP32[r10>>2]=r12;break}else{_abort()}}}while(0);r12=r7<<3;HEAP32[r8+4>>2]=r12|3;r10=r8+(r12|4)|0;HEAP32[r10>>2]=HEAP32[r10>>2]|1;r14=r11;return r14}if(r3>>>0<=HEAP32[1078]>>>0){r15=r3,r16=r15>>2;break}if((r6|0)!=0){r10=2<<r4;r12=r6<<r4&(r10|-r10);r10=(r12&-r12)-1|0;r12=r10>>>12&16;r9=r10>>>(r12>>>0);r10=r9>>>5&8;r13=r9>>>(r10>>>0);r9=r13>>>2&4;r17=r13>>>(r9>>>0);r13=r17>>>1&2;r18=r17>>>(r13>>>0);r17=r18>>>1&1;r19=(r10|r12|r9|r13|r17)+(r18>>>(r17>>>0))|0;r17=r19<<1;r18=(r17<<2)+4344|0;r13=(r17+2<<2)+4344|0;r17=HEAP32[r13>>2];r9=r17+8|0;r12=HEAP32[r9>>2];do{if((r18|0)==(r12|0)){HEAP32[1076]=r5&(1<<r19^-1)}else{if(r12>>>0<HEAP32[1080]>>>0){_abort()}r10=r12+12|0;if((HEAP32[r10>>2]|0)==(r17|0)){HEAP32[r10>>2]=r18;HEAP32[r13>>2]=r12;break}else{_abort()}}}while(0);r12=r19<<3;r13=r12-r3|0;HEAP32[r17+4>>2]=r3|3;r18=r17;r5=r18+r3|0;HEAP32[r18+(r3|4)>>2]=r13|1;HEAP32[r18+r12>>2]=r13;r12=HEAP32[1078];if((r12|0)!=0){r18=HEAP32[1081];r4=r12>>>3;r12=r4<<1;r6=(r12<<2)+4344|0;r11=HEAP32[1076];r8=1<<r4;do{if((r11&r8|0)==0){HEAP32[1076]=r11|r8;r20=r6;r21=(r12+2<<2)+4344|0}else{r4=(r12+2<<2)+4344|0;r7=HEAP32[r4>>2];if(r7>>>0>=HEAP32[1080]>>>0){r20=r7;r21=r4;break}_abort()}}while(0);HEAP32[r21>>2]=r18;HEAP32[r20+12>>2]=r18;HEAP32[r18+8>>2]=r20;HEAP32[r18+12>>2]=r6}HEAP32[1078]=r13;HEAP32[1081]=r5;r14=r9;return r14}r12=HEAP32[1077];if((r12|0)==0){r15=r3,r16=r15>>2;break}r8=(r12&-r12)-1|0;r12=r8>>>12&16;r11=r8>>>(r12>>>0);r8=r11>>>5&8;r17=r11>>>(r8>>>0);r11=r17>>>2&4;r19=r17>>>(r11>>>0);r17=r19>>>1&2;r4=r19>>>(r17>>>0);r19=r4>>>1&1;r7=HEAP32[((r8|r12|r11|r17|r19)+(r4>>>(r19>>>0))<<2)+4608>>2];r19=r7;r4=r7,r17=r4>>2;r11=(HEAP32[r7+4>>2]&-8)-r3|0;while(1){r7=HEAP32[r19+16>>2];if((r7|0)==0){r12=HEAP32[r19+20>>2];if((r12|0)==0){break}else{r22=r12}}else{r22=r7}r7=(HEAP32[r22+4>>2]&-8)-r3|0;r12=r7>>>0<r11>>>0;r19=r22;r4=r12?r22:r4,r17=r4>>2;r11=r12?r7:r11}r19=r4;r9=HEAP32[1080];if(r19>>>0<r9>>>0){_abort()}r5=r19+r3|0;r13=r5;if(r19>>>0>=r5>>>0){_abort()}r5=HEAP32[r17+6];r6=HEAP32[r17+3];do{if((r6|0)==(r4|0)){r18=r4+20|0;r7=HEAP32[r18>>2];if((r7|0)==0){r12=r4+16|0;r8=HEAP32[r12>>2];if((r8|0)==0){r23=0,r24=r23>>2;break}else{r25=r8;r26=r12}}else{r25=r7;r26=r18}while(1){r18=r25+20|0;r7=HEAP32[r18>>2];if((r7|0)!=0){r25=r7;r26=r18;continue}r18=r25+16|0;r7=HEAP32[r18>>2];if((r7|0)==0){break}else{r25=r7;r26=r18}}if(r26>>>0<r9>>>0){_abort()}else{HEAP32[r26>>2]=0;r23=r25,r24=r23>>2;break}}else{r18=HEAP32[r17+2];if(r18>>>0<r9>>>0){_abort()}r7=r18+12|0;if((HEAP32[r7>>2]|0)!=(r4|0)){_abort()}r12=r6+8|0;if((HEAP32[r12>>2]|0)==(r4|0)){HEAP32[r7>>2]=r6;HEAP32[r12>>2]=r18;r23=r6,r24=r23>>2;break}else{_abort()}}}while(0);L1146:do{if((r5|0)!=0){r6=r4+28|0;r9=(HEAP32[r6>>2]<<2)+4608|0;do{if((r4|0)==(HEAP32[r9>>2]|0)){HEAP32[r9>>2]=r23;if((r23|0)!=0){break}HEAP32[1077]=HEAP32[1077]&(1<<HEAP32[r6>>2]^-1);break L1146}else{if(r5>>>0<HEAP32[1080]>>>0){_abort()}r18=r5+16|0;if((HEAP32[r18>>2]|0)==(r4|0)){HEAP32[r18>>2]=r23}else{HEAP32[r5+20>>2]=r23}if((r23|0)==0){break L1146}}}while(0);if(r23>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r24+6]=r5;r6=HEAP32[r17+4];do{if((r6|0)!=0){if(r6>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r24+4]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);r6=HEAP32[r17+5];if((r6|0)==0){break}if(r6>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r24+5]=r6;HEAP32[r6+24>>2]=r23;break}}}while(0);if(r11>>>0<16){r5=r11+r3|0;HEAP32[r17+1]=r5|3;r6=r5+(r19+4)|0;HEAP32[r6>>2]=HEAP32[r6>>2]|1}else{HEAP32[r17+1]=r3|3;HEAP32[r19+(r3|4)>>2]=r11|1;HEAP32[r19+r11+r3>>2]=r11;r6=HEAP32[1078];if((r6|0)!=0){r5=HEAP32[1081];r9=r6>>>3;r6=r9<<1;r18=(r6<<2)+4344|0;r12=HEAP32[1076];r7=1<<r9;do{if((r12&r7|0)==0){HEAP32[1076]=r12|r7;r27=r18;r28=(r6+2<<2)+4344|0}else{r9=(r6+2<<2)+4344|0;r8=HEAP32[r9>>2];if(r8>>>0>=HEAP32[1080]>>>0){r27=r8;r28=r9;break}_abort()}}while(0);HEAP32[r28>>2]=r5;HEAP32[r27+12>>2]=r5;HEAP32[r5+8>>2]=r27;HEAP32[r5+12>>2]=r18}HEAP32[1078]=r11;HEAP32[1081]=r13}r6=r4+8|0;if((r6|0)==0){r15=r3,r16=r15>>2;break}else{r14=r6}return r14}else{if(r1>>>0>4294967231){r15=-1,r16=r15>>2;break}r6=r1+11|0;r7=r6&-8,r12=r7>>2;r19=HEAP32[1077];if((r19|0)==0){r15=r7,r16=r15>>2;break}r17=-r7|0;r9=r6>>>8;do{if((r9|0)==0){r29=0}else{if(r7>>>0>16777215){r29=31;break}r6=(r9+1048320|0)>>>16&8;r8=r9<<r6;r10=(r8+520192|0)>>>16&4;r30=r8<<r10;r8=(r30+245760|0)>>>16&2;r31=14-(r10|r6|r8)+(r30<<r8>>>15)|0;r29=r7>>>((r31+7|0)>>>0)&1|r31<<1}}while(0);r9=HEAP32[(r29<<2)+4608>>2];L1194:do{if((r9|0)==0){r32=0;r33=r17;r34=0}else{if((r29|0)==31){r35=0}else{r35=25-(r29>>>1)|0}r4=0;r13=r17;r11=r9,r18=r11>>2;r5=r7<<r35;r31=0;while(1){r8=HEAP32[r18+1]&-8;r30=r8-r7|0;if(r30>>>0<r13>>>0){if((r8|0)==(r7|0)){r32=r11;r33=r30;r34=r11;break L1194}else{r36=r11;r37=r30}}else{r36=r4;r37=r13}r30=HEAP32[r18+5];r8=HEAP32[((r5>>>31<<2)+16>>2)+r18];r6=(r30|0)==0|(r30|0)==(r8|0)?r31:r30;if((r8|0)==0){r32=r36;r33=r37;r34=r6;break}else{r4=r36;r13=r37;r11=r8,r18=r11>>2;r5=r5<<1;r31=r6}}}}while(0);if((r34|0)==0&(r32|0)==0){r9=2<<r29;r17=r19&(r9|-r9);if((r17|0)==0){r15=r7,r16=r15>>2;break}r9=(r17&-r17)-1|0;r17=r9>>>12&16;r31=r9>>>(r17>>>0);r9=r31>>>5&8;r5=r31>>>(r9>>>0);r31=r5>>>2&4;r11=r5>>>(r31>>>0);r5=r11>>>1&2;r18=r11>>>(r5>>>0);r11=r18>>>1&1;r38=HEAP32[((r9|r17|r31|r5|r11)+(r18>>>(r11>>>0))<<2)+4608>>2]}else{r38=r34}if((r38|0)==0){r39=r33;r40=r32,r41=r40>>2}else{r11=r38,r18=r11>>2;r5=r33;r31=r32;while(1){r17=(HEAP32[r18+1]&-8)-r7|0;r9=r17>>>0<r5>>>0;r13=r9?r17:r5;r17=r9?r11:r31;r9=HEAP32[r18+4];if((r9|0)!=0){r11=r9,r18=r11>>2;r5=r13;r31=r17;continue}r9=HEAP32[r18+5];if((r9|0)==0){r39=r13;r40=r17,r41=r40>>2;break}else{r11=r9,r18=r11>>2;r5=r13;r31=r17}}}if((r40|0)==0){r15=r7,r16=r15>>2;break}if(r39>>>0>=(HEAP32[1078]-r7|0)>>>0){r15=r7,r16=r15>>2;break}r31=r40,r5=r31>>2;r11=HEAP32[1080];if(r31>>>0<r11>>>0){_abort()}r18=r31+r7|0;r19=r18;if(r31>>>0>=r18>>>0){_abort()}r17=HEAP32[r41+6];r13=HEAP32[r41+3];do{if((r13|0)==(r40|0)){r9=r40+20|0;r4=HEAP32[r9>>2];if((r4|0)==0){r6=r40+16|0;r8=HEAP32[r6>>2];if((r8|0)==0){r42=0,r43=r42>>2;break}else{r44=r8;r45=r6}}else{r44=r4;r45=r9}while(1){r9=r44+20|0;r4=HEAP32[r9>>2];if((r4|0)!=0){r44=r4;r45=r9;continue}r9=r44+16|0;r4=HEAP32[r9>>2];if((r4|0)==0){break}else{r44=r4;r45=r9}}if(r45>>>0<r11>>>0){_abort()}else{HEAP32[r45>>2]=0;r42=r44,r43=r42>>2;break}}else{r9=HEAP32[r41+2];if(r9>>>0<r11>>>0){_abort()}r4=r9+12|0;if((HEAP32[r4>>2]|0)!=(r40|0)){_abort()}r6=r13+8|0;if((HEAP32[r6>>2]|0)==(r40|0)){HEAP32[r4>>2]=r13;HEAP32[r6>>2]=r9;r42=r13,r43=r42>>2;break}else{_abort()}}}while(0);L1244:do{if((r17|0)!=0){r13=r40+28|0;r11=(HEAP32[r13>>2]<<2)+4608|0;do{if((r40|0)==(HEAP32[r11>>2]|0)){HEAP32[r11>>2]=r42;if((r42|0)!=0){break}HEAP32[1077]=HEAP32[1077]&(1<<HEAP32[r13>>2]^-1);break L1244}else{if(r17>>>0<HEAP32[1080]>>>0){_abort()}r9=r17+16|0;if((HEAP32[r9>>2]|0)==(r40|0)){HEAP32[r9>>2]=r42}else{HEAP32[r17+20>>2]=r42}if((r42|0)==0){break L1244}}}while(0);if(r42>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r43+6]=r17;r13=HEAP32[r41+4];do{if((r13|0)!=0){if(r13>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r43+4]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);r13=HEAP32[r41+5];if((r13|0)==0){break}if(r13>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r43+5]=r13;HEAP32[r13+24>>2]=r42;break}}}while(0);do{if(r39>>>0<16){r17=r39+r7|0;HEAP32[r41+1]=r17|3;r13=r17+(r31+4)|0;HEAP32[r13>>2]=HEAP32[r13>>2]|1}else{HEAP32[r41+1]=r7|3;HEAP32[((r7|4)>>2)+r5]=r39|1;HEAP32[(r39>>2)+r5+r12]=r39;r13=r39>>>3;if(r39>>>0<256){r17=r13<<1;r11=(r17<<2)+4344|0;r9=HEAP32[1076];r6=1<<r13;do{if((r9&r6|0)==0){HEAP32[1076]=r9|r6;r46=r11;r47=(r17+2<<2)+4344|0}else{r13=(r17+2<<2)+4344|0;r4=HEAP32[r13>>2];if(r4>>>0>=HEAP32[1080]>>>0){r46=r4;r47=r13;break}_abort()}}while(0);HEAP32[r47>>2]=r19;HEAP32[r46+12>>2]=r19;HEAP32[r12+(r5+2)]=r46;HEAP32[r12+(r5+3)]=r11;break}r17=r18;r6=r39>>>8;do{if((r6|0)==0){r48=0}else{if(r39>>>0>16777215){r48=31;break}r9=(r6+1048320|0)>>>16&8;r13=r6<<r9;r4=(r13+520192|0)>>>16&4;r8=r13<<r4;r13=(r8+245760|0)>>>16&2;r30=14-(r4|r9|r13)+(r8<<r13>>>15)|0;r48=r39>>>((r30+7|0)>>>0)&1|r30<<1}}while(0);r6=(r48<<2)+4608|0;HEAP32[r12+(r5+7)]=r48;HEAP32[r12+(r5+5)]=0;HEAP32[r12+(r5+4)]=0;r11=HEAP32[1077];r30=1<<r48;if((r11&r30|0)==0){HEAP32[1077]=r11|r30;HEAP32[r6>>2]=r17;HEAP32[r12+(r5+6)]=r6;HEAP32[r12+(r5+3)]=r17;HEAP32[r12+(r5+2)]=r17;break}if((r48|0)==31){r49=0}else{r49=25-(r48>>>1)|0}r30=r39<<r49;r11=HEAP32[r6>>2];while(1){if((HEAP32[r11+4>>2]&-8|0)==(r39|0)){break}r50=(r30>>>31<<2)+r11+16|0;r6=HEAP32[r50>>2];if((r6|0)==0){r2=1003;break}else{r30=r30<<1;r11=r6}}if(r2==1003){if(r50>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r50>>2]=r17;HEAP32[r12+(r5+6)]=r11;HEAP32[r12+(r5+3)]=r17;HEAP32[r12+(r5+2)]=r17;break}}r30=r11+8|0;r6=HEAP32[r30>>2];r13=HEAP32[1080];if(r11>>>0<r13>>>0){_abort()}if(r6>>>0<r13>>>0){_abort()}else{HEAP32[r6+12>>2]=r17;HEAP32[r30>>2]=r17;HEAP32[r12+(r5+2)]=r6;HEAP32[r12+(r5+3)]=r11;HEAP32[r12+(r5+6)]=0;break}}}while(0);r5=r40+8|0;if((r5|0)==0){r15=r7,r16=r15>>2;break}else{r14=r5}return r14}}while(0);r40=HEAP32[1078];if(r15>>>0<=r40>>>0){r50=r40-r15|0;r39=HEAP32[1081];if(r50>>>0>15){r49=r39;HEAP32[1081]=r49+r15;HEAP32[1078]=r50;HEAP32[(r49+4>>2)+r16]=r50|1;HEAP32[r49+r40>>2]=r50;HEAP32[r39+4>>2]=r15|3}else{HEAP32[1078]=0;HEAP32[1081]=0;HEAP32[r39+4>>2]=r40|3;r50=r40+(r39+4)|0;HEAP32[r50>>2]=HEAP32[r50>>2]|1}r14=r39+8|0;return r14}r39=HEAP32[1079];if(r15>>>0<r39>>>0){r50=r39-r15|0;HEAP32[1079]=r50;r39=HEAP32[1082];r40=r39;HEAP32[1082]=r40+r15;HEAP32[(r40+4>>2)+r16]=r50|1;HEAP32[r39+4>>2]=r15|3;r14=r39+8|0;return r14}do{if((HEAP32[20]|0)==0){r39=_sysconf(8);if((r39-1&r39|0)==0){HEAP32[22]=r39;HEAP32[21]=r39;HEAP32[23]=-1;HEAP32[24]=2097152;HEAP32[25]=0;HEAP32[1187]=0;HEAP32[20]=_time(0)&-16^1431655768;break}else{_abort()}}}while(0);r39=r15+48|0;r50=HEAP32[22];r40=r15+47|0;r49=r50+r40|0;r48=-r50|0;r50=r49&r48;if(r50>>>0<=r15>>>0){r14=0;return r14}r46=HEAP32[1186];do{if((r46|0)!=0){r47=HEAP32[1184];r41=r47+r50|0;if(r41>>>0<=r47>>>0|r41>>>0>r46>>>0){r14=0}else{break}return r14}}while(0);L1336:do{if((HEAP32[1187]&4|0)==0){r46=HEAP32[1082];L1338:do{if((r46|0)==0){r2=1033}else{r41=r46;r47=4752;while(1){r51=r47|0;r42=HEAP32[r51>>2];if(r42>>>0<=r41>>>0){r52=r47+4|0;if((r42+HEAP32[r52>>2]|0)>>>0>r41>>>0){break}}r42=HEAP32[r47+8>>2];if((r42|0)==0){r2=1033;break L1338}else{r47=r42}}if((r47|0)==0){r2=1033;break}r41=r49-HEAP32[1079]&r48;if(r41>>>0>=2147483647){r53=0;break}r11=_sbrk(r41);r17=(r11|0)==(HEAP32[r51>>2]+HEAP32[r52>>2]|0);r54=r17?r11:-1;r55=r17?r41:0;r56=r11;r57=r41;r2=1042}}while(0);do{if(r2==1033){r46=_sbrk(0);if((r46|0)==-1){r53=0;break}r7=r46;r41=HEAP32[21];r11=r41-1|0;if((r11&r7|0)==0){r58=r50}else{r58=r50-r7+(r11+r7&-r41)|0}r41=HEAP32[1184];r7=r41+r58|0;if(!(r58>>>0>r15>>>0&r58>>>0<2147483647)){r53=0;break}r11=HEAP32[1186];if((r11|0)!=0){if(r7>>>0<=r41>>>0|r7>>>0>r11>>>0){r53=0;break}}r11=_sbrk(r58);r7=(r11|0)==(r46|0);r54=r7?r46:-1;r55=r7?r58:0;r56=r11;r57=r58;r2=1042}}while(0);L1358:do{if(r2==1042){r11=-r57|0;if((r54|0)!=-1){r59=r55,r60=r59>>2;r61=r54,r62=r61>>2;r2=1053;break L1336}do{if((r56|0)!=-1&r57>>>0<2147483647&r57>>>0<r39>>>0){r7=HEAP32[22];r46=r40-r57+r7&-r7;if(r46>>>0>=2147483647){r63=r57;break}if((_sbrk(r46)|0)==-1){_sbrk(r11);r53=r55;break L1358}else{r63=r46+r57|0;break}}else{r63=r57}}while(0);if((r56|0)==-1){r53=r55}else{r59=r63,r60=r59>>2;r61=r56,r62=r61>>2;r2=1053;break L1336}}}while(0);HEAP32[1187]=HEAP32[1187]|4;r64=r53;r2=1050}else{r64=0;r2=1050}}while(0);do{if(r2==1050){if(r50>>>0>=2147483647){break}r53=_sbrk(r50);r56=_sbrk(0);if(!((r56|0)!=-1&(r53|0)!=-1&r53>>>0<r56>>>0)){break}r63=r56-r53|0;r56=r63>>>0>(r15+40|0)>>>0;r55=r56?r53:-1;if((r55|0)!=-1){r59=r56?r63:r64,r60=r59>>2;r61=r55,r62=r61>>2;r2=1053}}}while(0);do{if(r2==1053){r64=HEAP32[1184]+r59|0;HEAP32[1184]=r64;if(r64>>>0>HEAP32[1185]>>>0){HEAP32[1185]=r64}r64=HEAP32[1082],r50=r64>>2;L1378:do{if((r64|0)==0){r55=HEAP32[1080];if((r55|0)==0|r61>>>0<r55>>>0){HEAP32[1080]=r61}HEAP32[1188]=r61;HEAP32[1189]=r59;HEAP32[1191]=0;HEAP32[1085]=HEAP32[20];HEAP32[1084]=-1;r55=0;while(1){r63=r55<<1;r56=(r63<<2)+4344|0;HEAP32[(r63+3<<2)+4344>>2]=r56;HEAP32[(r63+2<<2)+4344>>2]=r56;r56=r55+1|0;if(r56>>>0<32){r55=r56}else{break}}r55=r61+8|0;if((r55&7|0)==0){r65=0}else{r65=-r55&7}r55=r59-40-r65|0;HEAP32[1082]=r61+r65;HEAP32[1079]=r55;HEAP32[(r65+4>>2)+r62]=r55|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[1083]=HEAP32[24]}else{r55=4752,r56=r55>>2;while(1){r66=HEAP32[r56];r67=r55+4|0;r68=HEAP32[r67>>2];if((r61|0)==(r66+r68|0)){r2=1065;break}r63=HEAP32[r56+2];if((r63|0)==0){break}else{r55=r63,r56=r55>>2}}do{if(r2==1065){if((HEAP32[r56+3]&8|0)!=0){break}r55=r64;if(!(r55>>>0>=r66>>>0&r55>>>0<r61>>>0)){break}HEAP32[r67>>2]=r68+r59;r55=HEAP32[1082];r63=HEAP32[1079]+r59|0;r53=r55;r57=r55+8|0;if((r57&7|0)==0){r69=0}else{r69=-r57&7}r57=r63-r69|0;HEAP32[1082]=r53+r69;HEAP32[1079]=r57;HEAP32[r69+(r53+4)>>2]=r57|1;HEAP32[r63+(r53+4)>>2]=40;HEAP32[1083]=HEAP32[24];break L1378}}while(0);if(r61>>>0<HEAP32[1080]>>>0){HEAP32[1080]=r61}r56=r61+r59|0;r53=4752;while(1){r70=r53|0;if((HEAP32[r70>>2]|0)==(r56|0)){r2=1075;break}r63=HEAP32[r53+8>>2];if((r63|0)==0){break}else{r53=r63}}do{if(r2==1075){if((HEAP32[r53+12>>2]&8|0)!=0){break}HEAP32[r70>>2]=r61;r56=r53+4|0;HEAP32[r56>>2]=HEAP32[r56>>2]+r59;r56=r61+8|0;if((r56&7|0)==0){r71=0}else{r71=-r56&7}r56=r59+(r61+8)|0;if((r56&7|0)==0){r72=0,r73=r72>>2}else{r72=-r56&7,r73=r72>>2}r56=r61+r72+r59|0;r63=r56;r57=r71+r15|0,r55=r57>>2;r40=r61+r57|0;r57=r40;r39=r56-(r61+r71)-r15|0;HEAP32[(r71+4>>2)+r62]=r15|3;do{if((r63|0)==(HEAP32[1082]|0)){r54=HEAP32[1079]+r39|0;HEAP32[1079]=r54;HEAP32[1082]=r57;HEAP32[r55+(r62+1)]=r54|1}else{if((r63|0)==(HEAP32[1081]|0)){r54=HEAP32[1078]+r39|0;HEAP32[1078]=r54;HEAP32[1081]=r57;HEAP32[r55+(r62+1)]=r54|1;HEAP32[(r54>>2)+r62+r55]=r54;break}r54=r59+4|0;r58=HEAP32[(r54>>2)+r62+r73];if((r58&3|0)==1){r52=r58&-8;r51=r58>>>3;L1423:do{if(r58>>>0<256){r48=HEAP32[((r72|8)>>2)+r62+r60];r49=HEAP32[r73+(r62+(r60+3))];r11=(r51<<3)+4344|0;do{if((r48|0)!=(r11|0)){if(r48>>>0<HEAP32[1080]>>>0){_abort()}if((HEAP32[r48+12>>2]|0)==(r63|0)){break}_abort()}}while(0);if((r49|0)==(r48|0)){HEAP32[1076]=HEAP32[1076]&(1<<r51^-1);break}do{if((r49|0)==(r11|0)){r74=r49+8|0}else{if(r49>>>0<HEAP32[1080]>>>0){_abort()}r47=r49+8|0;if((HEAP32[r47>>2]|0)==(r63|0)){r74=r47;break}_abort()}}while(0);HEAP32[r48+12>>2]=r49;HEAP32[r74>>2]=r48}else{r11=r56;r47=HEAP32[((r72|24)>>2)+r62+r60];r46=HEAP32[r73+(r62+(r60+3))];do{if((r46|0)==(r11|0)){r7=r72|16;r41=r61+r54+r7|0;r17=HEAP32[r41>>2];if((r17|0)==0){r42=r61+r7+r59|0;r7=HEAP32[r42>>2];if((r7|0)==0){r75=0,r76=r75>>2;break}else{r77=r7;r78=r42}}else{r77=r17;r78=r41}while(1){r41=r77+20|0;r17=HEAP32[r41>>2];if((r17|0)!=0){r77=r17;r78=r41;continue}r41=r77+16|0;r17=HEAP32[r41>>2];if((r17|0)==0){break}else{r77=r17;r78=r41}}if(r78>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r78>>2]=0;r75=r77,r76=r75>>2;break}}else{r41=HEAP32[((r72|8)>>2)+r62+r60];if(r41>>>0<HEAP32[1080]>>>0){_abort()}r17=r41+12|0;if((HEAP32[r17>>2]|0)!=(r11|0)){_abort()}r42=r46+8|0;if((HEAP32[r42>>2]|0)==(r11|0)){HEAP32[r17>>2]=r46;HEAP32[r42>>2]=r41;r75=r46,r76=r75>>2;break}else{_abort()}}}while(0);if((r47|0)==0){break}r46=r72+(r61+(r59+28))|0;r48=(HEAP32[r46>>2]<<2)+4608|0;do{if((r11|0)==(HEAP32[r48>>2]|0)){HEAP32[r48>>2]=r75;if((r75|0)!=0){break}HEAP32[1077]=HEAP32[1077]&(1<<HEAP32[r46>>2]^-1);break L1423}else{if(r47>>>0<HEAP32[1080]>>>0){_abort()}r49=r47+16|0;if((HEAP32[r49>>2]|0)==(r11|0)){HEAP32[r49>>2]=r75}else{HEAP32[r47+20>>2]=r75}if((r75|0)==0){break L1423}}}while(0);if(r75>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r76+6]=r47;r11=r72|16;r46=HEAP32[(r11>>2)+r62+r60];do{if((r46|0)!=0){if(r46>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r76+4]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r46=HEAP32[(r54+r11>>2)+r62];if((r46|0)==0){break}if(r46>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r76+5]=r46;HEAP32[r46+24>>2]=r75;break}}}while(0);r79=r61+(r52|r72)+r59|0;r80=r52+r39|0}else{r79=r63;r80=r39}r54=r79+4|0;HEAP32[r54>>2]=HEAP32[r54>>2]&-2;HEAP32[r55+(r62+1)]=r80|1;HEAP32[(r80>>2)+r62+r55]=r80;r54=r80>>>3;if(r80>>>0<256){r51=r54<<1;r58=(r51<<2)+4344|0;r46=HEAP32[1076];r47=1<<r54;do{if((r46&r47|0)==0){HEAP32[1076]=r46|r47;r81=r58;r82=(r51+2<<2)+4344|0}else{r54=(r51+2<<2)+4344|0;r48=HEAP32[r54>>2];if(r48>>>0>=HEAP32[1080]>>>0){r81=r48;r82=r54;break}_abort()}}while(0);HEAP32[r82>>2]=r57;HEAP32[r81+12>>2]=r57;HEAP32[r55+(r62+2)]=r81;HEAP32[r55+(r62+3)]=r58;break}r51=r40;r47=r80>>>8;do{if((r47|0)==0){r83=0}else{if(r80>>>0>16777215){r83=31;break}r46=(r47+1048320|0)>>>16&8;r52=r47<<r46;r54=(r52+520192|0)>>>16&4;r48=r52<<r54;r52=(r48+245760|0)>>>16&2;r49=14-(r54|r46|r52)+(r48<<r52>>>15)|0;r83=r80>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r83<<2)+4608|0;HEAP32[r55+(r62+7)]=r83;HEAP32[r55+(r62+5)]=0;HEAP32[r55+(r62+4)]=0;r58=HEAP32[1077];r49=1<<r83;if((r58&r49|0)==0){HEAP32[1077]=r58|r49;HEAP32[r47>>2]=r51;HEAP32[r55+(r62+6)]=r47;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}if((r83|0)==31){r84=0}else{r84=25-(r83>>>1)|0}r49=r80<<r84;r58=HEAP32[r47>>2];while(1){if((HEAP32[r58+4>>2]&-8|0)==(r80|0)){break}r85=(r49>>>31<<2)+r58+16|0;r47=HEAP32[r85>>2];if((r47|0)==0){r2=1148;break}else{r49=r49<<1;r58=r47}}if(r2==1148){if(r85>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r85>>2]=r51;HEAP32[r55+(r62+6)]=r58;HEAP32[r55+(r62+3)]=r51;HEAP32[r55+(r62+2)]=r51;break}}r49=r58+8|0;r47=HEAP32[r49>>2];r52=HEAP32[1080];if(r58>>>0<r52>>>0){_abort()}if(r47>>>0<r52>>>0){_abort()}else{HEAP32[r47+12>>2]=r51;HEAP32[r49>>2]=r51;HEAP32[r55+(r62+2)]=r47;HEAP32[r55+(r62+3)]=r58;HEAP32[r55+(r62+6)]=0;break}}}while(0);r14=r61+(r71|8)|0;return r14}}while(0);r53=r64;r55=4752,r40=r55>>2;while(1){r86=HEAP32[r40];if(r86>>>0<=r53>>>0){r87=HEAP32[r40+1];r88=r86+r87|0;if(r88>>>0>r53>>>0){break}}r55=HEAP32[r40+2],r40=r55>>2}r55=r86+(r87-39)|0;if((r55&7|0)==0){r89=0}else{r89=-r55&7}r55=r86+(r87-47)+r89|0;r40=r55>>>0<(r64+16|0)>>>0?r53:r55;r55=r40+8|0,r57=r55>>2;r39=r61+8|0;if((r39&7|0)==0){r90=0}else{r90=-r39&7}r39=r59-40-r90|0;HEAP32[1082]=r61+r90;HEAP32[1079]=r39;HEAP32[(r90+4>>2)+r62]=r39|1;HEAP32[(r59-36>>2)+r62]=40;HEAP32[1083]=HEAP32[24];HEAP32[r40+4>>2]=27;HEAP32[r57]=HEAP32[1188];HEAP32[r57+1]=HEAP32[1189];HEAP32[r57+2]=HEAP32[1190];HEAP32[r57+3]=HEAP32[1191];HEAP32[1188]=r61;HEAP32[1189]=r59;HEAP32[1191]=0;HEAP32[1190]=r55;r55=r40+28|0;HEAP32[r55>>2]=7;if((r40+32|0)>>>0<r88>>>0){r57=r55;while(1){r55=r57+4|0;HEAP32[r55>>2]=7;if((r57+8|0)>>>0<r88>>>0){r57=r55}else{break}}}if((r40|0)==(r53|0)){break}r57=r40-r64|0;r55=r57+(r53+4)|0;HEAP32[r55>>2]=HEAP32[r55>>2]&-2;HEAP32[r50+1]=r57|1;HEAP32[r53+r57>>2]=r57;r55=r57>>>3;if(r57>>>0<256){r39=r55<<1;r63=(r39<<2)+4344|0;r56=HEAP32[1076];r47=1<<r55;do{if((r56&r47|0)==0){HEAP32[1076]=r56|r47;r91=r63;r92=(r39+2<<2)+4344|0}else{r55=(r39+2<<2)+4344|0;r49=HEAP32[r55>>2];if(r49>>>0>=HEAP32[1080]>>>0){r91=r49;r92=r55;break}_abort()}}while(0);HEAP32[r92>>2]=r64;HEAP32[r91+12>>2]=r64;HEAP32[r50+2]=r91;HEAP32[r50+3]=r63;break}r39=r64;r47=r57>>>8;do{if((r47|0)==0){r93=0}else{if(r57>>>0>16777215){r93=31;break}r56=(r47+1048320|0)>>>16&8;r53=r47<<r56;r40=(r53+520192|0)>>>16&4;r55=r53<<r40;r53=(r55+245760|0)>>>16&2;r49=14-(r40|r56|r53)+(r55<<r53>>>15)|0;r93=r57>>>((r49+7|0)>>>0)&1|r49<<1}}while(0);r47=(r93<<2)+4608|0;HEAP32[r50+7]=r93;HEAP32[r50+5]=0;HEAP32[r50+4]=0;r63=HEAP32[1077];r49=1<<r93;if((r63&r49|0)==0){HEAP32[1077]=r63|r49;HEAP32[r47>>2]=r39;HEAP32[r50+6]=r47;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}if((r93|0)==31){r94=0}else{r94=25-(r93>>>1)|0}r49=r57<<r94;r63=HEAP32[r47>>2];while(1){if((HEAP32[r63+4>>2]&-8|0)==(r57|0)){break}r95=(r49>>>31<<2)+r63+16|0;r47=HEAP32[r95>>2];if((r47|0)==0){r2=1183;break}else{r49=r49<<1;r63=r47}}if(r2==1183){if(r95>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r95>>2]=r39;HEAP32[r50+6]=r63;HEAP32[r50+3]=r64;HEAP32[r50+2]=r64;break}}r49=r63+8|0;r57=HEAP32[r49>>2];r47=HEAP32[1080];if(r63>>>0<r47>>>0){_abort()}if(r57>>>0<r47>>>0){_abort()}else{HEAP32[r57+12>>2]=r39;HEAP32[r49>>2]=r39;HEAP32[r50+2]=r57;HEAP32[r50+3]=r63;HEAP32[r50+6]=0;break}}}while(0);r50=HEAP32[1079];if(r50>>>0<=r15>>>0){break}r64=r50-r15|0;HEAP32[1079]=r64;r50=HEAP32[1082];r57=r50;HEAP32[1082]=r57+r15;HEAP32[(r57+4>>2)+r16]=r64|1;HEAP32[r50+4>>2]=r15|3;r14=r50+8|0;return r14}}while(0);HEAP32[___errno_location()>>2]=12;r14=0;return r14}function _free(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46;r2=r1>>2;r3=0;if((r1|0)==0){return}r4=r1-8|0;r5=r4;r6=HEAP32[1080];if(r4>>>0<r6>>>0){_abort()}r7=HEAP32[r1-4>>2];r8=r7&3;if((r8|0)==1){_abort()}r9=r7&-8,r10=r9>>2;r11=r1+(r9-8)|0;r12=r11;L1595:do{if((r7&1|0)==0){r13=HEAP32[r4>>2];if((r8|0)==0){return}r14=-8-r13|0,r15=r14>>2;r16=r1+r14|0;r17=r16;r18=r13+r9|0;if(r16>>>0<r6>>>0){_abort()}if((r17|0)==(HEAP32[1081]|0)){r19=(r1+(r9-4)|0)>>2;if((HEAP32[r19]&3|0)!=3){r20=r17,r21=r20>>2;r22=r18;break}HEAP32[1078]=r18;HEAP32[r19]=HEAP32[r19]&-2;HEAP32[r15+(r2+1)]=r18|1;HEAP32[r11>>2]=r18;return}r19=r13>>>3;if(r13>>>0<256){r13=HEAP32[r15+(r2+2)];r23=HEAP32[r15+(r2+3)];r24=(r19<<3)+4344|0;do{if((r13|0)!=(r24|0)){if(r13>>>0<r6>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r17|0)){break}_abort()}}while(0);if((r23|0)==(r13|0)){HEAP32[1076]=HEAP32[1076]&(1<<r19^-1);r20=r17,r21=r20>>2;r22=r18;break}do{if((r23|0)==(r24|0)){r25=r23+8|0}else{if(r23>>>0<r6>>>0){_abort()}r26=r23+8|0;if((HEAP32[r26>>2]|0)==(r17|0)){r25=r26;break}_abort()}}while(0);HEAP32[r13+12>>2]=r23;HEAP32[r25>>2]=r13;r20=r17,r21=r20>>2;r22=r18;break}r24=r16;r19=HEAP32[r15+(r2+6)];r26=HEAP32[r15+(r2+3)];do{if((r26|0)==(r24|0)){r27=r14+(r1+20)|0;r28=HEAP32[r27>>2];if((r28|0)==0){r29=r14+(r1+16)|0;r30=HEAP32[r29>>2];if((r30|0)==0){r31=0,r32=r31>>2;break}else{r33=r30;r34=r29}}else{r33=r28;r34=r27}while(1){r27=r33+20|0;r28=HEAP32[r27>>2];if((r28|0)!=0){r33=r28;r34=r27;continue}r27=r33+16|0;r28=HEAP32[r27>>2];if((r28|0)==0){break}else{r33=r28;r34=r27}}if(r34>>>0<r6>>>0){_abort()}else{HEAP32[r34>>2]=0;r31=r33,r32=r31>>2;break}}else{r27=HEAP32[r15+(r2+2)];if(r27>>>0<r6>>>0){_abort()}r28=r27+12|0;if((HEAP32[r28>>2]|0)!=(r24|0)){_abort()}r29=r26+8|0;if((HEAP32[r29>>2]|0)==(r24|0)){HEAP32[r28>>2]=r26;HEAP32[r29>>2]=r27;r31=r26,r32=r31>>2;break}else{_abort()}}}while(0);if((r19|0)==0){r20=r17,r21=r20>>2;r22=r18;break}r26=r14+(r1+28)|0;r16=(HEAP32[r26>>2]<<2)+4608|0;do{if((r24|0)==(HEAP32[r16>>2]|0)){HEAP32[r16>>2]=r31;if((r31|0)!=0){break}HEAP32[1077]=HEAP32[1077]&(1<<HEAP32[r26>>2]^-1);r20=r17,r21=r20>>2;r22=r18;break L1595}else{if(r19>>>0<HEAP32[1080]>>>0){_abort()}r13=r19+16|0;if((HEAP32[r13>>2]|0)==(r24|0)){HEAP32[r13>>2]=r31}else{HEAP32[r19+20>>2]=r31}if((r31|0)==0){r20=r17,r21=r20>>2;r22=r18;break L1595}}}while(0);if(r31>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r32+6]=r19;r24=HEAP32[r15+(r2+4)];do{if((r24|0)!=0){if(r24>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r32+4]=r24;HEAP32[r24+24>>2]=r31;break}}}while(0);r24=HEAP32[r15+(r2+5)];if((r24|0)==0){r20=r17,r21=r20>>2;r22=r18;break}if(r24>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r32+5]=r24;HEAP32[r24+24>>2]=r31;r20=r17,r21=r20>>2;r22=r18;break}}else{r20=r5,r21=r20>>2;r22=r9}}while(0);r5=r20,r31=r5>>2;if(r5>>>0>=r11>>>0){_abort()}r5=r1+(r9-4)|0;r32=HEAP32[r5>>2];if((r32&1|0)==0){_abort()}do{if((r32&2|0)==0){if((r12|0)==(HEAP32[1082]|0)){r6=HEAP32[1079]+r22|0;HEAP32[1079]=r6;HEAP32[1082]=r20;HEAP32[r21+1]=r6|1;if((r20|0)==(HEAP32[1081]|0)){HEAP32[1081]=0;HEAP32[1078]=0}if(r6>>>0<=HEAP32[1083]>>>0){return}_sys_trim(0);return}if((r12|0)==(HEAP32[1081]|0)){r6=HEAP32[1078]+r22|0;HEAP32[1078]=r6;HEAP32[1081]=r20;HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;return}r6=(r32&-8)+r22|0;r33=r32>>>3;L1701:do{if(r32>>>0<256){r34=HEAP32[r2+r10];r25=HEAP32[((r9|4)>>2)+r2];r8=(r33<<3)+4344|0;do{if((r34|0)!=(r8|0)){if(r34>>>0<HEAP32[1080]>>>0){_abort()}if((HEAP32[r34+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r25|0)==(r34|0)){HEAP32[1076]=HEAP32[1076]&(1<<r33^-1);break}do{if((r25|0)==(r8|0)){r35=r25+8|0}else{if(r25>>>0<HEAP32[1080]>>>0){_abort()}r4=r25+8|0;if((HEAP32[r4>>2]|0)==(r12|0)){r35=r4;break}_abort()}}while(0);HEAP32[r34+12>>2]=r25;HEAP32[r35>>2]=r34}else{r8=r11;r4=HEAP32[r10+(r2+4)];r7=HEAP32[((r9|4)>>2)+r2];do{if((r7|0)==(r8|0)){r24=r9+(r1+12)|0;r19=HEAP32[r24>>2];if((r19|0)==0){r26=r9+(r1+8)|0;r16=HEAP32[r26>>2];if((r16|0)==0){r36=0,r37=r36>>2;break}else{r38=r16;r39=r26}}else{r38=r19;r39=r24}while(1){r24=r38+20|0;r19=HEAP32[r24>>2];if((r19|0)!=0){r38=r19;r39=r24;continue}r24=r38+16|0;r19=HEAP32[r24>>2];if((r19|0)==0){break}else{r38=r19;r39=r24}}if(r39>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r39>>2]=0;r36=r38,r37=r36>>2;break}}else{r24=HEAP32[r2+r10];if(r24>>>0<HEAP32[1080]>>>0){_abort()}r19=r24+12|0;if((HEAP32[r19>>2]|0)!=(r8|0)){_abort()}r26=r7+8|0;if((HEAP32[r26>>2]|0)==(r8|0)){HEAP32[r19>>2]=r7;HEAP32[r26>>2]=r24;r36=r7,r37=r36>>2;break}else{_abort()}}}while(0);if((r4|0)==0){break}r7=r9+(r1+20)|0;r34=(HEAP32[r7>>2]<<2)+4608|0;do{if((r8|0)==(HEAP32[r34>>2]|0)){HEAP32[r34>>2]=r36;if((r36|0)!=0){break}HEAP32[1077]=HEAP32[1077]&(1<<HEAP32[r7>>2]^-1);break L1701}else{if(r4>>>0<HEAP32[1080]>>>0){_abort()}r25=r4+16|0;if((HEAP32[r25>>2]|0)==(r8|0)){HEAP32[r25>>2]=r36}else{HEAP32[r4+20>>2]=r36}if((r36|0)==0){break L1701}}}while(0);if(r36>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r37+6]=r4;r8=HEAP32[r10+(r2+2)];do{if((r8|0)!=0){if(r8>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r37+4]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);r8=HEAP32[r10+(r2+3)];if((r8|0)==0){break}if(r8>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r37+5]=r8;HEAP32[r8+24>>2]=r36;break}}}while(0);HEAP32[r21+1]=r6|1;HEAP32[(r6>>2)+r31]=r6;if((r20|0)!=(HEAP32[1081]|0)){r40=r6;break}HEAP32[1078]=r6;return}else{HEAP32[r5>>2]=r32&-2;HEAP32[r21+1]=r22|1;HEAP32[(r22>>2)+r31]=r22;r40=r22}}while(0);r22=r40>>>3;if(r40>>>0<256){r31=r22<<1;r32=(r31<<2)+4344|0;r5=HEAP32[1076];r36=1<<r22;do{if((r5&r36|0)==0){HEAP32[1076]=r5|r36;r41=r32;r42=(r31+2<<2)+4344|0}else{r22=(r31+2<<2)+4344|0;r37=HEAP32[r22>>2];if(r37>>>0>=HEAP32[1080]>>>0){r41=r37;r42=r22;break}_abort()}}while(0);HEAP32[r42>>2]=r20;HEAP32[r41+12>>2]=r20;HEAP32[r21+2]=r41;HEAP32[r21+3]=r32;return}r32=r20;r41=r40>>>8;do{if((r41|0)==0){r43=0}else{if(r40>>>0>16777215){r43=31;break}r42=(r41+1048320|0)>>>16&8;r31=r41<<r42;r36=(r31+520192|0)>>>16&4;r5=r31<<r36;r31=(r5+245760|0)>>>16&2;r22=14-(r36|r42|r31)+(r5<<r31>>>15)|0;r43=r40>>>((r22+7|0)>>>0)&1|r22<<1}}while(0);r41=(r43<<2)+4608|0;HEAP32[r21+7]=r43;HEAP32[r21+5]=0;HEAP32[r21+4]=0;r22=HEAP32[1077];r31=1<<r43;do{if((r22&r31|0)==0){HEAP32[1077]=r22|r31;HEAP32[r41>>2]=r32;HEAP32[r21+6]=r41;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20}else{if((r43|0)==31){r44=0}else{r44=25-(r43>>>1)|0}r5=r40<<r44;r42=HEAP32[r41>>2];while(1){if((HEAP32[r42+4>>2]&-8|0)==(r40|0)){break}r45=(r5>>>31<<2)+r42+16|0;r36=HEAP32[r45>>2];if((r36|0)==0){r3=1362;break}else{r5=r5<<1;r42=r36}}if(r3==1362){if(r45>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r45>>2]=r32;HEAP32[r21+6]=r42;HEAP32[r21+3]=r20;HEAP32[r21+2]=r20;break}}r5=r42+8|0;r6=HEAP32[r5>>2];r36=HEAP32[1080];if(r42>>>0<r36>>>0){_abort()}if(r6>>>0<r36>>>0){_abort()}else{HEAP32[r6+12>>2]=r32;HEAP32[r5>>2]=r32;HEAP32[r21+2]=r6;HEAP32[r21+3]=r42;HEAP32[r21+6]=0;break}}}while(0);r21=HEAP32[1084]-1|0;HEAP32[1084]=r21;if((r21|0)==0){r46=4760}else{return}while(1){r21=HEAP32[r46>>2];if((r21|0)==0){break}else{r46=r21+8|0}}HEAP32[1084]=-1;return}function _realloc(r1,r2){var r3,r4,r5,r6;if((r1|0)==0){r3=_malloc(r2);return r3}if(r2>>>0>4294967231){HEAP32[___errno_location()>>2]=12;r3=0;return r3}if(r2>>>0<11){r4=16}else{r4=r2+11&-8}r5=_try_realloc_chunk(r1-8|0,r4);if((r5|0)!=0){r3=r5+8|0;return r3}r5=_malloc(r2);if((r5|0)==0){r3=0;return r3}r4=HEAP32[r1-4>>2];r6=(r4&-8)-((r4&3|0)==0?8:4)|0;r4=r6>>>0<r2>>>0?r6:r2;_memcpy(r5,r1,r4)|0;_free(r1);r3=r5;return r3}function _sys_trim(r1){var r2,r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14;do{if((HEAP32[20]|0)==0){r2=_sysconf(8);if((r2-1&r2|0)==0){HEAP32[22]=r2;HEAP32[21]=r2;HEAP32[23]=-1;HEAP32[24]=2097152;HEAP32[25]=0;HEAP32[1187]=0;HEAP32[20]=_time(0)&-16^1431655768;break}else{_abort()}}}while(0);if(r1>>>0>=4294967232){r3=0;return r3}r2=HEAP32[1082];if((r2|0)==0){r3=0;return r3}r4=HEAP32[1079];do{if(r4>>>0>(r1+40|0)>>>0){r5=HEAP32[22];r6=Math.imul(Math.floor(((-40-r1-1+r4+r5|0)>>>0)/(r5>>>0))-1|0,r5)|0;r7=r2;r8=4752,r9=r8>>2;while(1){r10=HEAP32[r9];if(r10>>>0<=r7>>>0){if((r10+HEAP32[r9+1]|0)>>>0>r7>>>0){r11=r8;break}}r10=HEAP32[r9+2];if((r10|0)==0){r11=0;break}else{r8=r10,r9=r8>>2}}if((HEAP32[r11+12>>2]&8|0)!=0){break}r8=_sbrk(0);r9=(r11+4|0)>>2;if((r8|0)!=(HEAP32[r11>>2]+HEAP32[r9]|0)){break}r7=_sbrk(-(r6>>>0>2147483646?-2147483648-r5|0:r6)|0);r10=_sbrk(0);if(!((r7|0)!=-1&r10>>>0<r8>>>0)){break}r7=r8-r10|0;if((r8|0)==(r10|0)){break}HEAP32[r9]=HEAP32[r9]-r7;HEAP32[1184]=HEAP32[1184]-r7;r9=HEAP32[1082];r12=HEAP32[1079]-r7|0;r7=r9;r13=r9+8|0;if((r13&7|0)==0){r14=0}else{r14=-r13&7}r13=r12-r14|0;HEAP32[1082]=r7+r14;HEAP32[1079]=r13;HEAP32[r14+(r7+4)>>2]=r13|1;HEAP32[r12+(r7+4)>>2]=40;HEAP32[1083]=HEAP32[24];r3=(r8|0)!=(r10|0)&1;return r3}}while(0);if(HEAP32[1079]>>>0<=HEAP32[1083]>>>0){r3=0;return r3}HEAP32[1083]=-1;r3=0;return r3}function _try_realloc_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29;r3=(r1+4|0)>>2;r4=HEAP32[r3];r5=r4&-8,r6=r5>>2;r7=r1,r8=r7>>2;r9=r7+r5|0;r10=r9;r11=HEAP32[1080];if(r7>>>0<r11>>>0){_abort()}r12=r4&3;if(!((r12|0)!=1&r7>>>0<r9>>>0)){_abort()}r13=(r7+(r5|4)|0)>>2;r14=HEAP32[r13];if((r14&1|0)==0){_abort()}if((r12|0)==0){if(r2>>>0<256){r15=0;return r15}do{if(r5>>>0>=(r2+4|0)>>>0){if((r5-r2|0)>>>0>HEAP32[22]<<1>>>0){break}else{r15=r1}return r15}}while(0);r15=0;return r15}if(r5>>>0>=r2>>>0){r12=r5-r2|0;if(r12>>>0<=15){r15=r1;return r15}HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|3;HEAP32[r13]=HEAP32[r13]|1;_dispose_chunk(r7+r2|0,r12);r15=r1;return r15}if((r10|0)==(HEAP32[1082]|0)){r12=HEAP32[1079]+r5|0;if(r12>>>0<=r2>>>0){r15=0;return r15}r13=r12-r2|0;HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r13|1;HEAP32[1082]=r7+r2;HEAP32[1079]=r13;r15=r1;return r15}if((r10|0)==(HEAP32[1081]|0)){r13=HEAP32[1078]+r5|0;if(r13>>>0<r2>>>0){r15=0;return r15}r12=r13-r2|0;if(r12>>>0>15){HEAP32[r3]=r4&1|r2|2;HEAP32[(r2+4>>2)+r8]=r12|1;HEAP32[(r13>>2)+r8]=r12;r16=r13+(r7+4)|0;HEAP32[r16>>2]=HEAP32[r16>>2]&-2;r17=r7+r2|0;r18=r12}else{HEAP32[r3]=r4&1|r13|2;r4=r13+(r7+4)|0;HEAP32[r4>>2]=HEAP32[r4>>2]|1;r17=0;r18=0}HEAP32[1078]=r18;HEAP32[1081]=r17;r15=r1;return r15}if((r14&2|0)!=0){r15=0;return r15}r17=(r14&-8)+r5|0;if(r17>>>0<r2>>>0){r15=0;return r15}r18=r17-r2|0;r4=r14>>>3;L1921:do{if(r14>>>0<256){r13=HEAP32[r6+(r8+2)];r12=HEAP32[r6+(r8+3)];r16=(r4<<3)+4344|0;do{if((r13|0)!=(r16|0)){if(r13>>>0<r11>>>0){_abort()}if((HEAP32[r13+12>>2]|0)==(r10|0)){break}_abort()}}while(0);if((r12|0)==(r13|0)){HEAP32[1076]=HEAP32[1076]&(1<<r4^-1);break}do{if((r12|0)==(r16|0)){r19=r12+8|0}else{if(r12>>>0<r11>>>0){_abort()}r20=r12+8|0;if((HEAP32[r20>>2]|0)==(r10|0)){r19=r20;break}_abort()}}while(0);HEAP32[r13+12>>2]=r12;HEAP32[r19>>2]=r13}else{r16=r9;r20=HEAP32[r6+(r8+6)];r21=HEAP32[r6+(r8+3)];do{if((r21|0)==(r16|0)){r22=r5+(r7+20)|0;r23=HEAP32[r22>>2];if((r23|0)==0){r24=r5+(r7+16)|0;r25=HEAP32[r24>>2];if((r25|0)==0){r26=0,r27=r26>>2;break}else{r28=r25;r29=r24}}else{r28=r23;r29=r22}while(1){r22=r28+20|0;r23=HEAP32[r22>>2];if((r23|0)!=0){r28=r23;r29=r22;continue}r22=r28+16|0;r23=HEAP32[r22>>2];if((r23|0)==0){break}else{r28=r23;r29=r22}}if(r29>>>0<r11>>>0){_abort()}else{HEAP32[r29>>2]=0;r26=r28,r27=r26>>2;break}}else{r22=HEAP32[r6+(r8+2)];if(r22>>>0<r11>>>0){_abort()}r23=r22+12|0;if((HEAP32[r23>>2]|0)!=(r16|0)){_abort()}r24=r21+8|0;if((HEAP32[r24>>2]|0)==(r16|0)){HEAP32[r23>>2]=r21;HEAP32[r24>>2]=r22;r26=r21,r27=r26>>2;break}else{_abort()}}}while(0);if((r20|0)==0){break}r21=r5+(r7+28)|0;r13=(HEAP32[r21>>2]<<2)+4608|0;do{if((r16|0)==(HEAP32[r13>>2]|0)){HEAP32[r13>>2]=r26;if((r26|0)!=0){break}HEAP32[1077]=HEAP32[1077]&(1<<HEAP32[r21>>2]^-1);break L1921}else{if(r20>>>0<HEAP32[1080]>>>0){_abort()}r12=r20+16|0;if((HEAP32[r12>>2]|0)==(r16|0)){HEAP32[r12>>2]=r26}else{HEAP32[r20+20>>2]=r26}if((r26|0)==0){break L1921}}}while(0);if(r26>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r27+6]=r20;r16=HEAP32[r6+(r8+4)];do{if((r16|0)!=0){if(r16>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r27+4]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);r16=HEAP32[r6+(r8+5)];if((r16|0)==0){break}if(r16>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r27+5]=r16;HEAP32[r16+24>>2]=r26;break}}}while(0);if(r18>>>0<16){HEAP32[r3]=r17|HEAP32[r3]&1|2;r26=r7+(r17|4)|0;HEAP32[r26>>2]=HEAP32[r26>>2]|1;r15=r1;return r15}else{HEAP32[r3]=HEAP32[r3]&1|r2|2;HEAP32[(r2+4>>2)+r8]=r18|3;r8=r7+(r17|4)|0;HEAP32[r8>>2]=HEAP32[r8>>2]|1;_dispose_chunk(r7+r2|0,r18);r15=r1;return r15}}function _dispose_chunk(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42;r3=r2>>2;r4=0;r5=r1,r6=r5>>2;r7=r5+r2|0;r8=r7;r9=HEAP32[r1+4>>2];L1997:do{if((r9&1|0)==0){r10=HEAP32[r1>>2];if((r9&3|0)==0){return}r11=r5+ -r10|0;r12=r11;r13=r10+r2|0;r14=HEAP32[1080];if(r11>>>0<r14>>>0){_abort()}if((r12|0)==(HEAP32[1081]|0)){r15=(r2+(r5+4)|0)>>2;if((HEAP32[r15]&3|0)!=3){r16=r12,r17=r16>>2;r18=r13;break}HEAP32[1078]=r13;HEAP32[r15]=HEAP32[r15]&-2;HEAP32[(4-r10>>2)+r6]=r13|1;HEAP32[r7>>2]=r13;return}r15=r10>>>3;if(r10>>>0<256){r19=HEAP32[(8-r10>>2)+r6];r20=HEAP32[(12-r10>>2)+r6];r21=(r15<<3)+4344|0;do{if((r19|0)!=(r21|0)){if(r19>>>0<r14>>>0){_abort()}if((HEAP32[r19+12>>2]|0)==(r12|0)){break}_abort()}}while(0);if((r20|0)==(r19|0)){HEAP32[1076]=HEAP32[1076]&(1<<r15^-1);r16=r12,r17=r16>>2;r18=r13;break}do{if((r20|0)==(r21|0)){r22=r20+8|0}else{if(r20>>>0<r14>>>0){_abort()}r23=r20+8|0;if((HEAP32[r23>>2]|0)==(r12|0)){r22=r23;break}_abort()}}while(0);HEAP32[r19+12>>2]=r20;HEAP32[r22>>2]=r19;r16=r12,r17=r16>>2;r18=r13;break}r21=r11;r15=HEAP32[(24-r10>>2)+r6];r23=HEAP32[(12-r10>>2)+r6];do{if((r23|0)==(r21|0)){r24=16-r10|0;r25=r24+(r5+4)|0;r26=HEAP32[r25>>2];if((r26|0)==0){r27=r5+r24|0;r24=HEAP32[r27>>2];if((r24|0)==0){r28=0,r29=r28>>2;break}else{r30=r24;r31=r27}}else{r30=r26;r31=r25}while(1){r25=r30+20|0;r26=HEAP32[r25>>2];if((r26|0)!=0){r30=r26;r31=r25;continue}r25=r30+16|0;r26=HEAP32[r25>>2];if((r26|0)==0){break}else{r30=r26;r31=r25}}if(r31>>>0<r14>>>0){_abort()}else{HEAP32[r31>>2]=0;r28=r30,r29=r28>>2;break}}else{r25=HEAP32[(8-r10>>2)+r6];if(r25>>>0<r14>>>0){_abort()}r26=r25+12|0;if((HEAP32[r26>>2]|0)!=(r21|0)){_abort()}r27=r23+8|0;if((HEAP32[r27>>2]|0)==(r21|0)){HEAP32[r26>>2]=r23;HEAP32[r27>>2]=r25;r28=r23,r29=r28>>2;break}else{_abort()}}}while(0);if((r15|0)==0){r16=r12,r17=r16>>2;r18=r13;break}r23=r5+(28-r10)|0;r14=(HEAP32[r23>>2]<<2)+4608|0;do{if((r21|0)==(HEAP32[r14>>2]|0)){HEAP32[r14>>2]=r28;if((r28|0)!=0){break}HEAP32[1077]=HEAP32[1077]&(1<<HEAP32[r23>>2]^-1);r16=r12,r17=r16>>2;r18=r13;break L1997}else{if(r15>>>0<HEAP32[1080]>>>0){_abort()}r11=r15+16|0;if((HEAP32[r11>>2]|0)==(r21|0)){HEAP32[r11>>2]=r28}else{HEAP32[r15+20>>2]=r28}if((r28|0)==0){r16=r12,r17=r16>>2;r18=r13;break L1997}}}while(0);if(r28>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r29+6]=r15;r21=16-r10|0;r23=HEAP32[(r21>>2)+r6];do{if((r23|0)!=0){if(r23>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r29+4]=r23;HEAP32[r23+24>>2]=r28;break}}}while(0);r23=HEAP32[(r21+4>>2)+r6];if((r23|0)==0){r16=r12,r17=r16>>2;r18=r13;break}if(r23>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r29+5]=r23;HEAP32[r23+24>>2]=r28;r16=r12,r17=r16>>2;r18=r13;break}}else{r16=r1,r17=r16>>2;r18=r2}}while(0);r1=HEAP32[1080];if(r7>>>0<r1>>>0){_abort()}r28=r2+(r5+4)|0;r29=HEAP32[r28>>2];do{if((r29&2|0)==0){if((r8|0)==(HEAP32[1082]|0)){r30=HEAP32[1079]+r18|0;HEAP32[1079]=r30;HEAP32[1082]=r16;HEAP32[r17+1]=r30|1;if((r16|0)!=(HEAP32[1081]|0)){return}HEAP32[1081]=0;HEAP32[1078]=0;return}if((r8|0)==(HEAP32[1081]|0)){r30=HEAP32[1078]+r18|0;HEAP32[1078]=r30;HEAP32[1081]=r16;HEAP32[r17+1]=r30|1;HEAP32[(r30>>2)+r17]=r30;return}r30=(r29&-8)+r18|0;r31=r29>>>3;L2096:do{if(r29>>>0<256){r22=HEAP32[r3+(r6+2)];r9=HEAP32[r3+(r6+3)];r23=(r31<<3)+4344|0;do{if((r22|0)!=(r23|0)){if(r22>>>0<r1>>>0){_abort()}if((HEAP32[r22+12>>2]|0)==(r8|0)){break}_abort()}}while(0);if((r9|0)==(r22|0)){HEAP32[1076]=HEAP32[1076]&(1<<r31^-1);break}do{if((r9|0)==(r23|0)){r32=r9+8|0}else{if(r9>>>0<r1>>>0){_abort()}r10=r9+8|0;if((HEAP32[r10>>2]|0)==(r8|0)){r32=r10;break}_abort()}}while(0);HEAP32[r22+12>>2]=r9;HEAP32[r32>>2]=r22}else{r23=r7;r10=HEAP32[r3+(r6+6)];r15=HEAP32[r3+(r6+3)];do{if((r15|0)==(r23|0)){r14=r2+(r5+20)|0;r11=HEAP32[r14>>2];if((r11|0)==0){r19=r2+(r5+16)|0;r20=HEAP32[r19>>2];if((r20|0)==0){r33=0,r34=r33>>2;break}else{r35=r20;r36=r19}}else{r35=r11;r36=r14}while(1){r14=r35+20|0;r11=HEAP32[r14>>2];if((r11|0)!=0){r35=r11;r36=r14;continue}r14=r35+16|0;r11=HEAP32[r14>>2];if((r11|0)==0){break}else{r35=r11;r36=r14}}if(r36>>>0<r1>>>0){_abort()}else{HEAP32[r36>>2]=0;r33=r35,r34=r33>>2;break}}else{r14=HEAP32[r3+(r6+2)];if(r14>>>0<r1>>>0){_abort()}r11=r14+12|0;if((HEAP32[r11>>2]|0)!=(r23|0)){_abort()}r19=r15+8|0;if((HEAP32[r19>>2]|0)==(r23|0)){HEAP32[r11>>2]=r15;HEAP32[r19>>2]=r14;r33=r15,r34=r33>>2;break}else{_abort()}}}while(0);if((r10|0)==0){break}r15=r2+(r5+28)|0;r22=(HEAP32[r15>>2]<<2)+4608|0;do{if((r23|0)==(HEAP32[r22>>2]|0)){HEAP32[r22>>2]=r33;if((r33|0)!=0){break}HEAP32[1077]=HEAP32[1077]&(1<<HEAP32[r15>>2]^-1);break L2096}else{if(r10>>>0<HEAP32[1080]>>>0){_abort()}r9=r10+16|0;if((HEAP32[r9>>2]|0)==(r23|0)){HEAP32[r9>>2]=r33}else{HEAP32[r10+20>>2]=r33}if((r33|0)==0){break L2096}}}while(0);if(r33>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r34+6]=r10;r23=HEAP32[r3+(r6+4)];do{if((r23|0)!=0){if(r23>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r34+4]=r23;HEAP32[r23+24>>2]=r33;break}}}while(0);r23=HEAP32[r3+(r6+5)];if((r23|0)==0){break}if(r23>>>0<HEAP32[1080]>>>0){_abort()}else{HEAP32[r34+5]=r23;HEAP32[r23+24>>2]=r33;break}}}while(0);HEAP32[r17+1]=r30|1;HEAP32[(r30>>2)+r17]=r30;if((r16|0)!=(HEAP32[1081]|0)){r37=r30;break}HEAP32[1078]=r30;return}else{HEAP32[r28>>2]=r29&-2;HEAP32[r17+1]=r18|1;HEAP32[(r18>>2)+r17]=r18;r37=r18}}while(0);r18=r37>>>3;if(r37>>>0<256){r29=r18<<1;r28=(r29<<2)+4344|0;r33=HEAP32[1076];r34=1<<r18;do{if((r33&r34|0)==0){HEAP32[1076]=r33|r34;r38=r28;r39=(r29+2<<2)+4344|0}else{r18=(r29+2<<2)+4344|0;r6=HEAP32[r18>>2];if(r6>>>0>=HEAP32[1080]>>>0){r38=r6;r39=r18;break}_abort()}}while(0);HEAP32[r39>>2]=r16;HEAP32[r38+12>>2]=r16;HEAP32[r17+2]=r38;HEAP32[r17+3]=r28;return}r28=r16;r38=r37>>>8;do{if((r38|0)==0){r40=0}else{if(r37>>>0>16777215){r40=31;break}r39=(r38+1048320|0)>>>16&8;r29=r38<<r39;r34=(r29+520192|0)>>>16&4;r33=r29<<r34;r29=(r33+245760|0)>>>16&2;r18=14-(r34|r39|r29)+(r33<<r29>>>15)|0;r40=r37>>>((r18+7|0)>>>0)&1|r18<<1}}while(0);r38=(r40<<2)+4608|0;HEAP32[r17+7]=r40;HEAP32[r17+5]=0;HEAP32[r17+4]=0;r18=HEAP32[1077];r29=1<<r40;if((r18&r29|0)==0){HEAP32[1077]=r18|r29;HEAP32[r38>>2]=r28;HEAP32[r17+6]=r38;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}if((r40|0)==31){r41=0}else{r41=25-(r40>>>1)|0}r40=r37<<r41;r41=HEAP32[r38>>2];while(1){if((HEAP32[r41+4>>2]&-8|0)==(r37|0)){break}r42=(r40>>>31<<2)+r41+16|0;r38=HEAP32[r42>>2];if((r38|0)==0){r4=1668;break}else{r40=r40<<1;r41=r38}}if(r4==1668){if(r42>>>0<HEAP32[1080]>>>0){_abort()}HEAP32[r42>>2]=r28;HEAP32[r17+6]=r41;HEAP32[r17+3]=r16;HEAP32[r17+2]=r16;return}r16=r41+8|0;r42=HEAP32[r16>>2];r4=HEAP32[1080];if(r41>>>0<r4>>>0){_abort()}if(r42>>>0<r4>>>0){_abort()}HEAP32[r42+12>>2]=r28;HEAP32[r16>>2]=r28;HEAP32[r17+2]=r42;HEAP32[r17+3]=r41;HEAP32[r17+6]=0;return}function __Znwj(r1){var r2,r3,r4;r2=0;r3=(r1|0)==0?1:r1;while(1){r4=_malloc(r3);if((r4|0)!=0){r2=1712;break}r1=(tempValue=HEAP32[4776],HEAP32[4776]=tempValue,tempValue);if((r1|0)==0){break}FUNCTION_TABLE[r1]()}if(r2==1712){return r4}r4=___cxa_allocate_exception(4);HEAP32[r4>>2]=9976;___cxa_throw(r4,16104,66)}function __Znaj(r1){return __Znwj(r1)}function __ZNSt9bad_allocD2Ev(r1){return}function __ZNKSt9bad_alloc4whatEv(r1){return 1992}function __ZdlPv(r1){if((r1|0)==0){return}_free(r1);return}function __ZdaPv(r1){__ZdlPv(r1);return}function __ZNSt9bad_allocD0Ev(r1){__ZdlPv(r1);return}function _strtod(r1,r2){var r3,r4,r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41;r3=0;r4=r1;while(1){r5=r4+1|0;if((_isspace(HEAP8[r4]|0)|0)==0){break}else{r4=r5}}r6=HEAP8[r4];if(r6<<24>>24==43){r7=r5;r8=0}else if(r6<<24>>24==45){r7=r5;r8=1}else{r7=r4;r8=0}r4=-1;r5=0;r6=r7;while(1){r9=HEAP8[r6];if(((r9<<24>>24)-48|0)>>>0<10){r10=r4}else{if(r9<<24>>24!=46|(r4|0)>-1){break}else{r10=r5}}r4=r10;r5=r5+1|0;r6=r6+1|0}r10=r6+ -r5|0;r7=(r4|0)<0;r11=((r7^1)<<31>>31)+r5|0;r12=(r11|0)>18;r13=(r12?-18:-r11|0)+(r7?r5:r4)|0;r4=r12?18:r11;do{if((r4|0)==0){r14=r1;r15=0}else{if((r4|0)>9){r11=r10;r12=r4;r5=0;while(1){r7=HEAP8[r11];r16=r11+1|0;if(r7<<24>>24==46){r17=HEAP8[r16];r18=r11+2|0}else{r17=r7;r18=r16}r19=(r17<<24>>24)+((r5*10&-1)-48)|0;r16=r12-1|0;if((r16|0)>9){r11=r18;r12=r16;r5=r19}else{break}}r20=(r19|0)*1e9;r21=9;r22=r18;r3=1742}else{if((r4|0)>0){r20=0;r21=r4;r22=r10;r3=1742}else{r23=0;r24=0}}if(r3==1742){r5=r22;r12=r21;r11=0;while(1){r16=HEAP8[r5];r7=r5+1|0;if(r16<<24>>24==46){r25=HEAP8[r7];r26=r5+2|0}else{r25=r16;r26=r7}r27=(r25<<24>>24)+((r11*10&-1)-48)|0;r7=r12-1|0;if((r7|0)>0){r5=r26;r12=r7;r11=r27}else{break}}r23=r27|0;r24=r20}r11=r24+r23;do{if(r9<<24>>24==69|r9<<24>>24==101){r12=r6+1|0;r5=HEAP8[r12];if(r5<<24>>24==45){r28=r6+2|0;r29=1}else if(r5<<24>>24==43){r28=r6+2|0;r29=0}else{r28=r12;r29=0}r12=HEAP8[r28];if(((r12<<24>>24)-48|0)>>>0<10){r30=r28;r31=0;r32=r12}else{r33=0;r34=r28;r35=r29;break}while(1){r12=(r32<<24>>24)+((r31*10&-1)-48)|0;r5=r30+1|0;r7=HEAP8[r5];if(((r7<<24>>24)-48|0)>>>0<10){r30=r5;r31=r12;r32=r7}else{r33=r12;r34=r5;r35=r29;break}}}else{r33=0;r34=r6;r35=0}}while(0);r5=r13+((r35|0)==0?r33:-r33|0)|0;r12=(r5|0)<0?-r5|0:r5;if((r12|0)>511){HEAP32[___errno_location()>>2]=34;r36=1;r37=8;r38=511;r3=1759}else{if((r12|0)==0){r39=1}else{r36=1;r37=8;r38=r12;r3=1759}}if(r3==1759){while(1){r3=0;if((r38&1|0)==0){r40=r36}else{r40=r36*HEAPF64[r37>>3]}r12=r38>>1;if((r12|0)==0){r39=r40;break}else{r36=r40;r37=r37+8|0;r38=r12;r3=1759}}}if((r5|0)>-1){r14=r34;r15=r11*r39;break}else{r14=r34;r15=r11/r39;break}}}while(0);if((r2|0)!=0){HEAP32[r2>>2]=r14}if((r8|0)==0){r41=r15;return r41}r41=-r15;return r41}function __ZSt17__throw_bad_allocv(){var r1;r1=___cxa_allocate_exception(4);HEAP32[r1>>2]=9976;___cxa_throw(r1,16104,66)}function _i64Add(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r5=r1+r3>>>0;r6=r2+r4+(r5>>>0<r1>>>0|0)>>>0;return tempRet0=r6,r5|0}function _i64Subtract(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r5=r1-r3>>>0;r6=r2-r4>>>0;r6=r2-r4-(r3>>>0>r1>>>0|0)>>>0;return tempRet0=r6,r5|0}function _bitshift64Shl(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2<<r3|(r1&r4<<32-r3)>>>32-r3;return r1<<r3}tempRet0=r1<<r3-32;return 0}function _bitshift64Lshr(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2>>>r3;return r1>>>r3|(r2&r4)<<32-r3}tempRet0=0;return r2>>>r3-32|0}function _bitshift64Ashr(r1,r2,r3){var r4;r1=r1|0;r2=r2|0;r3=r3|0;r4=0;if((r3|0)<32){r4=(1<<r3)-1|0;tempRet0=r2>>r3;return r1>>>r3|(r2&r4)<<32-r3}tempRet0=(r2|0)<0?-1:0;return r2>>r3-32|0}function _llvm_ctlz_i32(r1){var r2;r1=r1|0;r2=0;r2=HEAP8[ctlz_i8+(r1>>>24)|0];if((r2|0)<8)return r2|0;r2=HEAP8[ctlz_i8+(r1>>16&255)|0];if((r2|0)<8)return r2+8|0;r2=HEAP8[ctlz_i8+(r1>>8&255)|0];if((r2|0)<8)return r2+16|0;return HEAP8[ctlz_i8+(r1&255)|0]+24|0}var ctlz_i8=allocate([8,7,6,6,5,5,5,5,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"i8",ALLOC_DYNAMIC);function _llvm_cttz_i32(r1){var r2;r1=r1|0;r2=0;r2=HEAP8[cttz_i8+(r1&255)|0];if((r2|0)<8)return r2|0;r2=HEAP8[cttz_i8+(r1>>8&255)|0];if((r2|0)<8)return r2+8|0;r2=HEAP8[cttz_i8+(r1>>16&255)|0];if((r2|0)<8)return r2+16|0;return HEAP8[cttz_i8+(r1>>>24)|0]+24|0}var cttz_i8=allocate([8,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,7,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,6,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,5,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0,4,0,1,0,2,0,1,0,3,0,1,0,2,0,1,0],"i8",ALLOC_DYNAMIC);function ___muldsi3(r1,r2){var r3,r4,r5,r6,r7,r8,r9;r1=r1|0;r2=r2|0;r3=0,r4=0,r5=0,r6=0,r7=0,r8=0,r9=0;r3=r1&65535;r4=r2&65535;r5=Math.imul(r4,r3)|0;r6=r1>>>16;r7=(r5>>>16)+Math.imul(r4,r6)|0;r8=r2>>>16;r9=Math.imul(r8,r3)|0;return(tempRet0=(r7>>>16)+Math.imul(r8,r6)+(((r7&65535)+r9|0)>>>16)|0,r7+r9<<16|r5&65535|0)|0}function ___divdi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0;r5=r2>>31|((r2|0)<0?-1:0)<<1;r6=((r2|0)<0?-1:0)>>31|((r2|0)<0?-1:0)<<1;r7=r4>>31|((r4|0)<0?-1:0)<<1;r8=((r4|0)<0?-1:0)>>31|((r4|0)<0?-1:0)<<1;r9=_i64Subtract(r5^r1,r6^r2,r5,r6)|0;r10=tempRet0;r11=_i64Subtract(r7^r3,r8^r4,r7,r8)|0;r12=r7^r5;r13=r8^r6;r14=___udivmoddi4(r9,r10,r11,tempRet0,0)|0;r15=_i64Subtract(r14^r12,tempRet0^r13,r12,r13)|0;return(tempRet0=tempRet0,r15)|0}function ___remdi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9,r10,r11,r12,r13,r14,r15;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0;r15=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r15|0;r6=r2>>31|((r2|0)<0?-1:0)<<1;r7=((r2|0)<0?-1:0)>>31|((r2|0)<0?-1:0)<<1;r8=r4>>31|((r4|0)<0?-1:0)<<1;r9=((r4|0)<0?-1:0)>>31|((r4|0)<0?-1:0)<<1;r10=_i64Subtract(r6^r1,r7^r2,r6,r7)|0;r11=tempRet0;r12=_i64Subtract(r8^r3,r9^r4,r8,r9)|0;___udivmoddi4(r10,r11,r12,tempRet0,r5)|0;r13=_i64Subtract(HEAP32[r5>>2]^r6,HEAP32[r5+4>>2]^r7,r6,r7)|0;r14=tempRet0;STACKTOP=r15;return(tempRet0=r14,r13)|0}function ___muldi3(r1,r2,r3,r4){var r5,r6,r7,r8,r9;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0,r7=0,r8=0,r9=0;r5=r1;r6=r3;r7=___muldsi3(r5,r6)|0;r8=tempRet0;r9=Math.imul(r2,r6)|0;return(tempRet0=Math.imul(r4,r5)+r9+r8|r8&0,r7&-1|0)|0}function ___udivdi3(r1,r2,r3,r4){var r5;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0;r5=___udivmoddi4(r1,r2,r3,r4,0)|0;return(tempRet0=tempRet0,r5)|0}function ___uremdi3(r1,r2,r3,r4){var r5,r6;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=0,r6=0;r6=STACKTOP;STACKTOP=STACKTOP+8|0;r5=r6|0;___udivmoddi4(r1,r2,r3,r4,r5)|0;STACKTOP=r6;return(tempRet0=HEAP32[r5+4>>2]|0,HEAP32[r5>>2]|0)|0}function ___udivmoddi4(r1,r2,r3,r4,r5){var r6,r7,r8,r9,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42,r43,r44,r45,r46,r47,r48,r49,r50,r51,r52,r53,r54,r55,r56,r57,r58,r59,r60,r61,r62,r63,r64,r65,r66,r67,r68,r69;r1=r1|0;r2=r2|0;r3=r3|0;r4=r4|0;r5=r5|0;r6=0,r7=0,r8=0,r9=0,r10=0,r11=0,r12=0,r13=0,r14=0,r15=0,r16=0,r17=0,r18=0,r19=0,r20=0,r21=0,r22=0,r23=0,r24=0,r25=0,r26=0,r27=0,r28=0,r29=0,r30=0,r31=0,r32=0,r33=0,r34=0,r35=0,r36=0,r37=0,r38=0,r39=0,r40=0,r41=0,r42=0,r43=0,r44=0,r45=0,r46=0,r47=0,r48=0,r49=0,r50=0,r51=0,r52=0,r53=0,r54=0,r55=0,r56=0,r57=0,r58=0,r59=0,r60=0,r61=0,r62=0,r63=0,r64=0,r65=0,r66=0,r67=0,r68=0,r69=0;r6=r1;r7=r2;r8=r7;r9=r3;r10=r4;r11=r10;if((r8|0)==0){r12=(r5|0)!=0;if((r11|0)==0){if(r12){HEAP32[r5>>2]=(r6>>>0)%(r9>>>0);HEAP32[r5+4>>2]=0}r69=0;r68=(r6>>>0)/(r9>>>0)>>>0;return(tempRet0=r69,r68)|0}else{if(!r12){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}}r13=(r11|0)==0;do{if((r9|0)==0){if(r13){if((r5|0)!=0){HEAP32[r5>>2]=(r8>>>0)%(r9>>>0);HEAP32[r5+4>>2]=0}r69=0;r68=(r8>>>0)/(r9>>>0)>>>0;return(tempRet0=r69,r68)|0}if((r6|0)==0){if((r5|0)!=0){HEAP32[r5>>2]=0;HEAP32[r5+4>>2]=(r8>>>0)%(r11>>>0)}r69=0;r68=(r8>>>0)/(r11>>>0)>>>0;return(tempRet0=r69,r68)|0}r14=r11-1|0;if((r14&r11|0)==0){if((r5|0)!=0){HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r14&r8|r2&0}r69=0;r68=r8>>>((_llvm_cttz_i32(r11|0)|0)>>>0);return(tempRet0=r69,r68)|0}r15=_llvm_ctlz_i32(r11|0)|0;r16=r15-_llvm_ctlz_i32(r8|0)|0;if(r16>>>0<=30){r17=r16+1|0;r18=31-r16|0;r37=r17;r36=r8<<r18|r6>>>(r17>>>0);r35=r8>>>(r17>>>0);r34=0;r33=r6<<r18;break}if((r5|0)==0){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r7|r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}else{if(!r13){r28=_llvm_ctlz_i32(r11|0)|0;r29=r28-_llvm_ctlz_i32(r8|0)|0;if(r29>>>0<=31){r30=r29+1|0;r31=31-r29|0;r32=r29-31>>31;r37=r30;r36=r6>>>(r30>>>0)&r32|r8<<r31;r35=r8>>>(r30>>>0)&r32;r34=0;r33=r6<<r31;break}if((r5|0)==0){r69=0;r68=0;return(tempRet0=r69,r68)|0}HEAP32[r5>>2]=r1&-1;HEAP32[r5+4>>2]=r7|r2&0;r69=0;r68=0;return(tempRet0=r69,r68)|0}r19=r9-1|0;if((r19&r9|0)!=0){r21=_llvm_ctlz_i32(r9|0)+33|0;r22=r21-_llvm_ctlz_i32(r8|0)|0;r23=64-r22|0;r24=32-r22|0;r25=r24>>31;r26=r22-32|0;r27=r26>>31;r37=r22;r36=r24-1>>31&r8>>>(r26>>>0)|(r8<<r24|r6>>>(r22>>>0))&r27;r35=r27&r8>>>(r22>>>0);r34=r6<<r23&r25;r33=(r8<<r23|r6>>>(r26>>>0))&r25|r6<<r24&r22-33>>31;break}if((r5|0)!=0){HEAP32[r5>>2]=r19&r6;HEAP32[r5+4>>2]=0}if((r9|0)==1){r69=r7|r2&0;r68=r1&-1|0;return(tempRet0=r69,r68)|0}else{r20=_llvm_cttz_i32(r9|0)|0;r69=r8>>>(r20>>>0)|0;r68=r8<<32-r20|r6>>>(r20>>>0)|0;return(tempRet0=r69,r68)|0}}}while(0);if((r37|0)==0){r64=r33;r63=r34;r62=r35;r61=r36;r60=0;r59=0}else{r38=r3&-1|0;r39=r10|r4&0;r40=_i64Add(r38,r39,-1,-1)|0;r41=tempRet0;r47=r33;r46=r34;r45=r35;r44=r36;r43=r37;r42=0;while(1){r48=r46>>>31|r47<<1;r49=r42|r46<<1;r50=r44<<1|r47>>>31|0;r51=r44>>>31|r45<<1|0;_i64Subtract(r40,r41,r50,r51)|0;r52=tempRet0;r53=r52>>31|((r52|0)<0?-1:0)<<1;r54=r53&1;r55=_i64Subtract(r50,r51,r53&r38,(((r52|0)<0?-1:0)>>31|((r52|0)<0?-1:0)<<1)&r39)|0;r56=r55;r57=tempRet0;r58=r43-1|0;if((r58|0)==0){break}else{r47=r48;r46=r49;r45=r57;r44=r56;r43=r58;r42=r54}}r64=r48;r63=r49;r62=r57;r61=r56;r60=0;r59=r54}r65=r63;r66=0;r67=r64|r66;if((r5|0)!=0){HEAP32[r5>>2]=r61;HEAP32[r5+4>>2]=r62}r69=(r65|0)>>>31|r67<<1|(r66<<1|r65>>>31)&0|r60;r68=(r65<<1|0>>>31)&-2|r59;return(tempRet0=r69,r68)|0}
// EMSCRIPTEN_END_FUNCS
Module["_malloc"] = _malloc;
Module["_realloc"] = _realloc;
// TODO: strip out parts of this we do not need
//======= begin closure i64 code =======
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @fileoverview Defines a Long class for representing a 64-bit two's-complement
 * integer value, which faithfully simulates the behavior of a Java "long". This
 * implementation is derived from LongLib in GWT.
 *
 */
var i64Math = (function() { // Emscripten wrapper
  var goog = { math: {} };
  /**
   * Constructs a 64-bit two's-complement integer, given its low and high 32-bit
   * values as *signed* integers.  See the from* functions below for more
   * convenient ways of constructing Longs.
   *
   * The internal representation of a long is the two given signed, 32-bit values.
   * We use 32-bit pieces because these are the size of integers on which
   * Javascript performs bit-operations.  For operations like addition and
   * multiplication, we split each number into 16-bit pieces, which can easily be
   * multiplied within Javascript's floating-point representation without overflow
   * or change in sign.
   *
   * In the algorithms below, we frequently reduce the negative case to the
   * positive case by negating the input(s) and then post-processing the result.
   * Note that we must ALWAYS check specially whether those values are MIN_VALUE
   * (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
   * a positive number, it overflows back into a negative).  Not handling this
   * case would often result in infinite recursion.
   *
   * @param {number} low  The low (signed) 32 bits of the long.
   * @param {number} high  The high (signed) 32 bits of the long.
   * @constructor
   */
  goog.math.Long = function(low, high) {
    /**
     * @type {number}
     * @private
     */
    this.low_ = low | 0;  // force into 32 signed bits.
    /**
     * @type {number}
     * @private
     */
    this.high_ = high | 0;  // force into 32 signed bits.
  };
  // NOTE: Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the
  // from* methods on which they depend.
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @private
   */
  goog.math.Long.IntCache_ = {};
  /**
   * Returns a Long representing the given (32-bit) integer value.
   * @param {number} value The 32-bit integer in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromInt = function(value) {
    if (-128 <= value && value < 128) {
      var cachedObj = goog.math.Long.IntCache_[value];
      if (cachedObj) {
        return cachedObj;
      }
    }
    var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
    if (-128 <= value && value < 128) {
      goog.math.Long.IntCache_[value] = obj;
    }
    return obj;
  };
  /**
   * Returns a Long representing the given value, provided that it is a finite
   * number.  Otherwise, zero is returned.
   * @param {number} value The number in question.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromNumber = function(value) {
    if (isNaN(value) || !isFinite(value)) {
      return goog.math.Long.ZERO;
    } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MIN_VALUE;
    } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
      return goog.math.Long.MAX_VALUE;
    } else if (value < 0) {
      return goog.math.Long.fromNumber(-value).negate();
    } else {
      return new goog.math.Long(
          (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
          (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
    }
  };
  /**
   * Returns a Long representing the 64-bit integer that comes by concatenating
   * the given high and low bits.  Each is assumed to use 32 bits.
   * @param {number} lowBits The low 32-bits.
   * @param {number} highBits The high 32-bits.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromBits = function(lowBits, highBits) {
    return new goog.math.Long(lowBits, highBits);
  };
  /**
   * Returns a Long representation of the given string, written using the given
   * radix.
   * @param {string} str The textual representation of the Long.
   * @param {number=} opt_radix The radix in which the text is written.
   * @return {!goog.math.Long} The corresponding Long value.
   */
  goog.math.Long.fromString = function(str, opt_radix) {
    if (str.length == 0) {
      throw Error('number format error: empty string');
    }
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (str.charAt(0) == '-') {
      return goog.math.Long.fromString(str.substring(1), radix).negate();
    } else if (str.indexOf('-') >= 0) {
      throw Error('number format error: interior "-" character: ' + str);
    }
    // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
    var result = goog.math.Long.ZERO;
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i);
      var value = parseInt(str.substring(i, i + size), radix);
      if (size < 8) {
        var power = goog.math.Long.fromNumber(Math.pow(radix, size));
        result = result.multiply(power).add(goog.math.Long.fromNumber(value));
      } else {
        result = result.multiply(radixToPower);
        result = result.add(goog.math.Long.fromNumber(value));
      }
    }
    return result;
  };
  // NOTE: the compiler should inline these constant values below and then remove
  // these variables, so there should be no runtime penalty for these.
  /**
   * Number used repeated below in calculations.  This must appear before the
   * first call to any from* function below.
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_32_DBL_ =
      goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_31_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ / 2;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_48_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_64_DBL_ =
      goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
  /**
   * @type {number}
   * @private
   */
  goog.math.Long.TWO_PWR_63_DBL_ =
      goog.math.Long.TWO_PWR_64_DBL_ / 2;
  /** @type {!goog.math.Long} */
  goog.math.Long.ZERO = goog.math.Long.fromInt(0);
  /** @type {!goog.math.Long} */
  goog.math.Long.ONE = goog.math.Long.fromInt(1);
  /** @type {!goog.math.Long} */
  goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
  /** @type {!goog.math.Long} */
  goog.math.Long.MAX_VALUE =
      goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
  /** @type {!goog.math.Long} */
  goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
  /**
   * @type {!goog.math.Long}
   * @private
   */
  goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
  /** @return {number} The value, assuming it is a 32-bit integer. */
  goog.math.Long.prototype.toInt = function() {
    return this.low_;
  };
  /** @return {number} The closest floating-point representation to this value. */
  goog.math.Long.prototype.toNumber = function() {
    return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
           this.getLowBitsUnsigned();
  };
  /**
   * @param {number=} opt_radix The radix in which the text should be written.
   * @return {string} The textual representation of this value.
   */
  goog.math.Long.prototype.toString = function(opt_radix) {
    var radix = opt_radix || 10;
    if (radix < 2 || 36 < radix) {
      throw Error('radix out of range: ' + radix);
    }
    if (this.isZero()) {
      return '0';
    }
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = goog.math.Long.fromNumber(radix);
        var div = this.div(radixLong);
        var rem = div.multiply(radixLong).subtract(this);
        return div.toString(radix) + rem.toInt().toString(radix);
      } else {
        return '-' + this.negate().toString(radix);
      }
    }
    // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
    var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
    var rem = this;
    var result = '';
    while (true) {
      var remDiv = rem.div(radixToPower);
      var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
      var digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) {
        return digits + result;
      } else {
        while (digits.length < 6) {
          digits = '0' + digits;
        }
        result = '' + digits + result;
      }
    }
  };
  /** @return {number} The high 32-bits as a signed value. */
  goog.math.Long.prototype.getHighBits = function() {
    return this.high_;
  };
  /** @return {number} The low 32-bits as a signed value. */
  goog.math.Long.prototype.getLowBits = function() {
    return this.low_;
  };
  /** @return {number} The low 32-bits as an unsigned value. */
  goog.math.Long.prototype.getLowBitsUnsigned = function() {
    return (this.low_ >= 0) ?
        this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
  };
  /**
   * @return {number} Returns the number of bits needed to represent the absolute
   *     value of this Long.
   */
  goog.math.Long.prototype.getNumBitsAbs = function() {
    if (this.isNegative()) {
      if (this.equals(goog.math.Long.MIN_VALUE)) {
        return 64;
      } else {
        return this.negate().getNumBitsAbs();
      }
    } else {
      var val = this.high_ != 0 ? this.high_ : this.low_;
      for (var bit = 31; bit > 0; bit--) {
        if ((val & (1 << bit)) != 0) {
          break;
        }
      }
      return this.high_ != 0 ? bit + 33 : bit + 1;
    }
  };
  /** @return {boolean} Whether this value is zero. */
  goog.math.Long.prototype.isZero = function() {
    return this.high_ == 0 && this.low_ == 0;
  };
  /** @return {boolean} Whether this value is negative. */
  goog.math.Long.prototype.isNegative = function() {
    return this.high_ < 0;
  };
  /** @return {boolean} Whether this value is odd. */
  goog.math.Long.prototype.isOdd = function() {
    return (this.low_ & 1) == 1;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long equals the other.
   */
  goog.math.Long.prototype.equals = function(other) {
    return (this.high_ == other.high_) && (this.low_ == other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long does not equal the other.
   */
  goog.math.Long.prototype.notEquals = function(other) {
    return (this.high_ != other.high_) || (this.low_ != other.low_);
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than the other.
   */
  goog.math.Long.prototype.lessThan = function(other) {
    return this.compare(other) < 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is less than or equal to the other.
   */
  goog.math.Long.prototype.lessThanOrEqual = function(other) {
    return this.compare(other) <= 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than the other.
   */
  goog.math.Long.prototype.greaterThan = function(other) {
    return this.compare(other) > 0;
  };
  /**
   * @param {goog.math.Long} other Long to compare against.
   * @return {boolean} Whether this Long is greater than or equal to the other.
   */
  goog.math.Long.prototype.greaterThanOrEqual = function(other) {
    return this.compare(other) >= 0;
  };
  /**
   * Compares this Long with the given one.
   * @param {goog.math.Long} other Long to compare against.
   * @return {number} 0 if they are the same, 1 if the this is greater, and -1
   *     if the given one is greater.
   */
  goog.math.Long.prototype.compare = function(other) {
    if (this.equals(other)) {
      return 0;
    }
    var thisNeg = this.isNegative();
    var otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) {
      return -1;
    }
    if (!thisNeg && otherNeg) {
      return 1;
    }
    // at this point, the signs are the same, so subtraction will not overflow
    if (this.subtract(other).isNegative()) {
      return -1;
    } else {
      return 1;
    }
  };
  /** @return {!goog.math.Long} The negation of this value. */
  goog.math.Long.prototype.negate = function() {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.MIN_VALUE;
    } else {
      return this.not().add(goog.math.Long.ONE);
    }
  };
  /**
   * Returns the sum of this and the given Long.
   * @param {goog.math.Long} other Long to add to this one.
   * @return {!goog.math.Long} The sum of this and the given Long.
   */
  goog.math.Long.prototype.add = function(other) {
    // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns the difference of this and the given Long.
   * @param {goog.math.Long} other Long to subtract from this.
   * @return {!goog.math.Long} The difference of this and the given Long.
   */
  goog.math.Long.prototype.subtract = function(other) {
    return this.add(other.negate());
  };
  /**
   * Returns the product of this and the given long.
   * @param {goog.math.Long} other Long to multiply with this.
   * @return {!goog.math.Long} The product of this and the other.
   */
  goog.math.Long.prototype.multiply = function(other) {
    if (this.isZero()) {
      return goog.math.Long.ZERO;
    } else if (other.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().multiply(other.negate());
      } else {
        return this.negate().multiply(other).negate();
      }
    } else if (other.isNegative()) {
      return this.multiply(other.negate()).negate();
    }
    // If both longs are small, use float multiplication
    if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
        other.lessThan(goog.math.Long.TWO_PWR_24_)) {
      return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
    }
    // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
    var a48 = this.high_ >>> 16;
    var a32 = this.high_ & 0xFFFF;
    var a16 = this.low_ >>> 16;
    var a00 = this.low_ & 0xFFFF;
    var b48 = other.high_ >>> 16;
    var b32 = other.high_ & 0xFFFF;
    var b16 = other.low_ >>> 16;
    var b00 = other.low_ & 0xFFFF;
    var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
  };
  /**
   * Returns this Long divided by the given one.
   * @param {goog.math.Long} other Long by which to divide.
   * @return {!goog.math.Long} This Long divided by the given one.
   */
  goog.math.Long.prototype.div = function(other) {
    if (other.isZero()) {
      throw Error('division by zero');
    } else if (this.isZero()) {
      return goog.math.Long.ZERO;
    }
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      if (other.equals(goog.math.Long.ONE) ||
          other.equals(goog.math.Long.NEG_ONE)) {
        return goog.math.Long.MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
      } else if (other.equals(goog.math.Long.MIN_VALUE)) {
        return goog.math.Long.ONE;
      } else {
        // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
        var halfThis = this.shiftRight(1);
        var approx = halfThis.div(other).shiftLeft(1);
        if (approx.equals(goog.math.Long.ZERO)) {
          return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
        } else {
          var rem = this.subtract(other.multiply(approx));
          var result = approx.add(rem.div(other));
          return result;
        }
      }
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ZERO;
    }
    if (this.isNegative()) {
      if (other.isNegative()) {
        return this.negate().div(other.negate());
      } else {
        return this.negate().div(other).negate();
      }
    } else if (other.isNegative()) {
      return this.div(other.negate()).negate();
    }
    // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
    var res = goog.math.Long.ZERO;
    var rem = this;
    while (rem.greaterThanOrEqual(other)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
      // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
      var log2 = Math.ceil(Math.log(approx) / Math.LN2);
      var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
      // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      var approxRes = goog.math.Long.fromNumber(approx);
      var approxRem = approxRes.multiply(other);
      while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
        approx -= delta;
        approxRes = goog.math.Long.fromNumber(approx);
        approxRem = approxRes.multiply(other);
      }
      // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
      if (approxRes.isZero()) {
        approxRes = goog.math.Long.ONE;
      }
      res = res.add(approxRes);
      rem = rem.subtract(approxRem);
    }
    return res;
  };
  /**
   * Returns this Long modulo the given one.
   * @param {goog.math.Long} other Long by which to mod.
   * @return {!goog.math.Long} This Long modulo the given one.
   */
  goog.math.Long.prototype.modulo = function(other) {
    return this.subtract(this.div(other).multiply(other));
  };
  /** @return {!goog.math.Long} The bitwise-NOT of this value. */
  goog.math.Long.prototype.not = function() {
    return goog.math.Long.fromBits(~this.low_, ~this.high_);
  };
  /**
   * Returns the bitwise-AND of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to AND.
   * @return {!goog.math.Long} The bitwise-AND of this and the other.
   */
  goog.math.Long.prototype.and = function(other) {
    return goog.math.Long.fromBits(this.low_ & other.low_,
                                   this.high_ & other.high_);
  };
  /**
   * Returns the bitwise-OR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to OR.
   * @return {!goog.math.Long} The bitwise-OR of this and the other.
   */
  goog.math.Long.prototype.or = function(other) {
    return goog.math.Long.fromBits(this.low_ | other.low_,
                                   this.high_ | other.high_);
  };
  /**
   * Returns the bitwise-XOR of this Long and the given one.
   * @param {goog.math.Long} other The Long with which to XOR.
   * @return {!goog.math.Long} The bitwise-XOR of this and the other.
   */
  goog.math.Long.prototype.xor = function(other) {
    return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                   this.high_ ^ other.high_);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the left by the given amount.
   */
  goog.math.Long.prototype.shiftLeft = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var low = this.low_;
      if (numBits < 32) {
        var high = this.high_;
        return goog.math.Long.fromBits(
            low << numBits,
            (high << numBits) | (low >>> (32 - numBits)));
      } else {
        return goog.math.Long.fromBits(0, low << (numBits - 32));
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount.
   */
  goog.math.Long.prototype.shiftRight = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >> numBits);
      } else {
        return goog.math.Long.fromBits(
            high >> (numBits - 32),
            high >= 0 ? 0 : -1);
      }
    }
  };
  /**
   * Returns this Long with bits shifted to the right by the given amount, with
   * the new top bits matching the current sign bit.
   * @param {number} numBits The number of bits by which to shift.
   * @return {!goog.math.Long} This shifted to the right by the given amount, with
   *     zeros placed into the new leading bits.
   */
  goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
    numBits &= 63;
    if (numBits == 0) {
      return this;
    } else {
      var high = this.high_;
      if (numBits < 32) {
        var low = this.low_;
        return goog.math.Long.fromBits(
            (low >>> numBits) | (high << (32 - numBits)),
            high >>> numBits);
      } else if (numBits == 32) {
        return goog.math.Long.fromBits(high, 0);
      } else {
        return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
      }
    }
  };
  //======= begin jsbn =======
  var navigator = { appName: 'Modern Browser' }; // polyfill a little
  // Copyright (c) 2005  Tom Wu
  // All Rights Reserved.
  // http://www-cs-students.stanford.edu/~tjw/jsbn/
  /*
   * Copyright (c) 2003-2005  Tom Wu
   * All Rights Reserved.
   *
   * Permission is hereby granted, free of charge, to any person obtaining
   * a copy of this software and associated documentation files (the
   * "Software"), to deal in the Software without restriction, including
   * without limitation the rights to use, copy, modify, merge, publish,
   * distribute, sublicense, and/or sell copies of the Software, and to
   * permit persons to whom the Software is furnished to do so, subject to
   * the following conditions:
   *
   * The above copyright notice and this permission notice shall be
   * included in all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
   * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
   * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
   *
   * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
   * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
   * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
   * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
   * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
   *
   * In addition, the following condition applies:
   *
   * All redistributions must retain an intact copy of this copyright notice
   * and disclaimer.
   */
  // Basic JavaScript BN library - subset useful for RSA encryption.
  // Bits per digit
  var dbits;
  // JavaScript engine analysis
  var canary = 0xdeadbeefcafe;
  var j_lm = ((canary&0xffffff)==0xefcafe);
  // (public) Constructor
  function BigInteger(a,b,c) {
    if(a != null)
      if("number" == typeof a) this.fromNumber(a,b,c);
      else if(b == null && "string" != typeof a) this.fromString(a,256);
      else this.fromString(a,b);
  }
  // return new, unset BigInteger
  function nbi() { return new BigInteger(null); }
  // am: Compute w_j += (x*this_i), propagate carries,
  // c is initial carry, returns final carry.
  // c < 3*dvalue, x < 2*dvalue, this_i < dvalue
  // We need to select the fastest one that works in this environment.
  // am1: use a single mult and divide to get the high bits,
  // max digit bits should be 26 because
  // max internal value = 2*dvalue^2-2*dvalue (< 2^53)
  function am1(i,x,w,j,c,n) {
    while(--n >= 0) {
      var v = x*this[i++]+w[j]+c;
      c = Math.floor(v/0x4000000);
      w[j++] = v&0x3ffffff;
    }
    return c;
  }
  // am2 avoids a big mult-and-extract completely.
  // Max digit bits should be <= 30 because we do bitwise ops
  // on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
  function am2(i,x,w,j,c,n) {
    var xl = x&0x7fff, xh = x>>15;
    while(--n >= 0) {
      var l = this[i]&0x7fff;
      var h = this[i++]>>15;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x7fff)<<15)+w[j]+(c&0x3fffffff);
      c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
      w[j++] = l&0x3fffffff;
    }
    return c;
  }
  // Alternately, set max digit bits to 28 since some
  // browsers slow down when dealing with 32-bit numbers.
  function am3(i,x,w,j,c,n) {
    var xl = x&0x3fff, xh = x>>14;
    while(--n >= 0) {
      var l = this[i]&0x3fff;
      var h = this[i++]>>14;
      var m = xh*l+h*xl;
      l = xl*l+((m&0x3fff)<<14)+w[j]+c;
      c = (l>>28)+(m>>14)+xh*h;
      w[j++] = l&0xfffffff;
    }
    return c;
  }
  if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
    BigInteger.prototype.am = am2;
    dbits = 30;
  }
  else if(j_lm && (navigator.appName != "Netscape")) {
    BigInteger.prototype.am = am1;
    dbits = 26;
  }
  else { // Mozilla/Netscape seems to prefer am3
    BigInteger.prototype.am = am3;
    dbits = 28;
  }
  BigInteger.prototype.DB = dbits;
  BigInteger.prototype.DM = ((1<<dbits)-1);
  BigInteger.prototype.DV = (1<<dbits);
  var BI_FP = 52;
  BigInteger.prototype.FV = Math.pow(2,BI_FP);
  BigInteger.prototype.F1 = BI_FP-dbits;
  BigInteger.prototype.F2 = 2*dbits-BI_FP;
  // Digit conversions
  var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
  var BI_RC = new Array();
  var rr,vv;
  rr = "0".charCodeAt(0);
  for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
  rr = "a".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  rr = "A".charCodeAt(0);
  for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
  function int2char(n) { return BI_RM.charAt(n); }
  function intAt(s,i) {
    var c = BI_RC[s.charCodeAt(i)];
    return (c==null)?-1:c;
  }
  // (protected) copy this to r
  function bnpCopyTo(r) {
    for(var i = this.t-1; i >= 0; --i) r[i] = this[i];
    r.t = this.t;
    r.s = this.s;
  }
  // (protected) set from integer value x, -DV <= x < DV
  function bnpFromInt(x) {
    this.t = 1;
    this.s = (x<0)?-1:0;
    if(x > 0) this[0] = x;
    else if(x < -1) this[0] = x+DV;
    else this.t = 0;
  }
  // return bigint initialized to value
  function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
  // (protected) set from string and radix
  function bnpFromString(s,b) {
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 256) k = 8; // byte array
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else { this.fromRadix(s,b); return; }
    this.t = 0;
    this.s = 0;
    var i = s.length, mi = false, sh = 0;
    while(--i >= 0) {
      var x = (k==8)?s[i]&0xff:intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-") mi = true;
        continue;
      }
      mi = false;
      if(sh == 0)
        this[this.t++] = x;
      else if(sh+k > this.DB) {
        this[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
        this[this.t++] = (x>>(this.DB-sh));
      }
      else
        this[this.t-1] |= x<<sh;
      sh += k;
      if(sh >= this.DB) sh -= this.DB;
    }
    if(k == 8 && (s[0]&0x80) != 0) {
      this.s = -1;
      if(sh > 0) this[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
    }
    this.clamp();
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) clamp off excess high words
  function bnpClamp() {
    var c = this.s&this.DM;
    while(this.t > 0 && this[this.t-1] == c) --this.t;
  }
  // (public) return string representation in given radix
  function bnToString(b) {
    if(this.s < 0) return "-"+this.negate().toString(b);
    var k;
    if(b == 16) k = 4;
    else if(b == 8) k = 3;
    else if(b == 2) k = 1;
    else if(b == 32) k = 5;
    else if(b == 4) k = 2;
    else return this.toRadix(b);
    var km = (1<<k)-1, d, m = false, r = "", i = this.t;
    var p = this.DB-(i*this.DB)%k;
    if(i-- > 0) {
      if(p < this.DB && (d = this[i]>>p) > 0) { m = true; r = int2char(d); }
      while(i >= 0) {
        if(p < k) {
          d = (this[i]&((1<<p)-1))<<(k-p);
          d |= this[--i]>>(p+=this.DB-k);
        }
        else {
          d = (this[i]>>(p-=k))&km;
          if(p <= 0) { p += this.DB; --i; }
        }
        if(d > 0) m = true;
        if(m) r += int2char(d);
      }
    }
    return m?r:"0";
  }
  // (public) -this
  function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
  // (public) |this|
  function bnAbs() { return (this.s<0)?this.negate():this; }
  // (public) return + if this > a, - if this < a, 0 if equal
  function bnCompareTo(a) {
    var r = this.s-a.s;
    if(r != 0) return r;
    var i = this.t;
    r = i-a.t;
    if(r != 0) return (this.s<0)?-r:r;
    while(--i >= 0) if((r=this[i]-a[i]) != 0) return r;
    return 0;
  }
  // returns bit length of the integer x
  function nbits(x) {
    var r = 1, t;
    if((t=x>>>16) != 0) { x = t; r += 16; }
    if((t=x>>8) != 0) { x = t; r += 8; }
    if((t=x>>4) != 0) { x = t; r += 4; }
    if((t=x>>2) != 0) { x = t; r += 2; }
    if((t=x>>1) != 0) { x = t; r += 1; }
    return r;
  }
  // (public) return the number of bits in "this"
  function bnBitLength() {
    if(this.t <= 0) return 0;
    return this.DB*(this.t-1)+nbits(this[this.t-1]^(this.s&this.DM));
  }
  // (protected) r = this << n*DB
  function bnpDLShiftTo(n,r) {
    var i;
    for(i = this.t-1; i >= 0; --i) r[i+n] = this[i];
    for(i = n-1; i >= 0; --i) r[i] = 0;
    r.t = this.t+n;
    r.s = this.s;
  }
  // (protected) r = this >> n*DB
  function bnpDRShiftTo(n,r) {
    for(var i = n; i < this.t; ++i) r[i-n] = this[i];
    r.t = Math.max(this.t-n,0);
    r.s = this.s;
  }
  // (protected) r = this << n
  function bnpLShiftTo(n,r) {
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<cbs)-1;
    var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
    for(i = this.t-1; i >= 0; --i) {
      r[i+ds+1] = (this[i]>>cbs)|c;
      c = (this[i]&bm)<<bs;
    }
    for(i = ds-1; i >= 0; --i) r[i] = 0;
    r[ds] = c;
    r.t = this.t+ds+1;
    r.s = this.s;
    r.clamp();
  }
  // (protected) r = this >> n
  function bnpRShiftTo(n,r) {
    r.s = this.s;
    var ds = Math.floor(n/this.DB);
    if(ds >= this.t) { r.t = 0; return; }
    var bs = n%this.DB;
    var cbs = this.DB-bs;
    var bm = (1<<bs)-1;
    r[0] = this[ds]>>bs;
    for(var i = ds+1; i < this.t; ++i) {
      r[i-ds-1] |= (this[i]&bm)<<cbs;
      r[i-ds] = this[i]>>bs;
    }
    if(bs > 0) r[this.t-ds-1] |= (this.s&bm)<<cbs;
    r.t = this.t-ds;
    r.clamp();
  }
  // (protected) r = this - a
  function bnpSubTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]-a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c -= a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c -= a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c -= a.s;
    }
    r.s = (c<0)?-1:0;
    if(c < -1) r[i++] = this.DV+c;
    else if(c > 0) r[i++] = c;
    r.t = i;
    r.clamp();
  }
  // (protected) r = this * a, r != this,a (HAC 14.12)
  // "this" should be the larger one if appropriate.
  function bnpMultiplyTo(a,r) {
    var x = this.abs(), y = a.abs();
    var i = x.t;
    r.t = i+y.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < y.t; ++i) r[i+x.t] = x.am(0,y[i],r,i,0,x.t);
    r.s = 0;
    r.clamp();
    if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
  }
  // (protected) r = this^2, r != this (HAC 14.16)
  function bnpSquareTo(r) {
    var x = this.abs();
    var i = r.t = 2*x.t;
    while(--i >= 0) r[i] = 0;
    for(i = 0; i < x.t-1; ++i) {
      var c = x.am(i,x[i],r,2*i,0,1);
      if((r[i+x.t]+=x.am(i+1,2*x[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
        r[i+x.t] -= x.DV;
        r[i+x.t+1] = 1;
      }
    }
    if(r.t > 0) r[r.t-1] += x.am(i,x[i],r,2*i,0,1);
    r.s = 0;
    r.clamp();
  }
  // (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
  // r != q, this != m.  q or r may be null.
  function bnpDivRemTo(m,q,r) {
    var pm = m.abs();
    if(pm.t <= 0) return;
    var pt = this.abs();
    if(pt.t < pm.t) {
      if(q != null) q.fromInt(0);
      if(r != null) this.copyTo(r);
      return;
    }
    if(r == null) r = nbi();
    var y = nbi(), ts = this.s, ms = m.s;
    var nsh = this.DB-nbits(pm[pm.t-1]);	// normalize modulus
    if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
    else { pm.copyTo(y); pt.copyTo(r); }
    var ys = y.t;
    var y0 = y[ys-1];
    if(y0 == 0) return;
    var yt = y0*(1<<this.F1)+((ys>1)?y[ys-2]>>this.F2:0);
    var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
    var i = r.t, j = i-ys, t = (q==null)?nbi():q;
    y.dlShiftTo(j,t);
    if(r.compareTo(t) >= 0) {
      r[r.t++] = 1;
      r.subTo(t,r);
    }
    BigInteger.ONE.dlShiftTo(ys,t);
    t.subTo(y,y);	// "negative" y so we can replace sub with am later
    while(y.t < ys) y[y.t++] = 0;
    while(--j >= 0) {
      // Estimate quotient digit
      var qd = (r[--i]==y0)?this.DM:Math.floor(r[i]*d1+(r[i-1]+e)*d2);
      if((r[i]+=y.am(0,qd,r,j,0,ys)) < qd) {	// Try it out
        y.dlShiftTo(j,t);
        r.subTo(t,r);
        while(r[i] < --qd) r.subTo(t,r);
      }
    }
    if(q != null) {
      r.drShiftTo(ys,q);
      if(ts != ms) BigInteger.ZERO.subTo(q,q);
    }
    r.t = ys;
    r.clamp();
    if(nsh > 0) r.rShiftTo(nsh,r);	// Denormalize remainder
    if(ts < 0) BigInteger.ZERO.subTo(r,r);
  }
  // (public) this mod a
  function bnMod(a) {
    var r = nbi();
    this.abs().divRemTo(a,null,r);
    if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
    return r;
  }
  // Modular reduction using "classic" algorithm
  function Classic(m) { this.m = m; }
  function cConvert(x) {
    if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
    else return x;
  }
  function cRevert(x) { return x; }
  function cReduce(x) { x.divRemTo(this.m,null,x); }
  function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  Classic.prototype.convert = cConvert;
  Classic.prototype.revert = cRevert;
  Classic.prototype.reduce = cReduce;
  Classic.prototype.mulTo = cMulTo;
  Classic.prototype.sqrTo = cSqrTo;
  // (protected) return "-1/this % 2^DB"; useful for Mont. reduction
  // justification:
  //         xy == 1 (mod m)
  //         xy =  1+km
  //   xy(2-xy) = (1+km)(1-km)
  // x[y(2-xy)] = 1-k^2m^2
  // x[y(2-xy)] == 1 (mod m^2)
  // if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
  // should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
  // JS multiply "overflows" differently from C/C++, so care is needed here.
  function bnpInvDigit() {
    if(this.t < 1) return 0;
    var x = this[0];
    if((x&1) == 0) return 0;
    var y = x&3;		// y == 1/x mod 2^2
    y = (y*(2-(x&0xf)*y))&0xf;	// y == 1/x mod 2^4
    y = (y*(2-(x&0xff)*y))&0xff;	// y == 1/x mod 2^8
    y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;	// y == 1/x mod 2^16
    // last step - calculate inverse mod DV directly;
    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
    y = (y*(2-x*y%this.DV))%this.DV;		// y == 1/x mod 2^dbits
    // we really want the negative inverse, and -DV < y < DV
    return (y>0)?this.DV-y:-y;
  }
  // Montgomery reduction
  function Montgomery(m) {
    this.m = m;
    this.mp = m.invDigit();
    this.mpl = this.mp&0x7fff;
    this.mph = this.mp>>15;
    this.um = (1<<(m.DB-15))-1;
    this.mt2 = 2*m.t;
  }
  // xR mod m
  function montConvert(x) {
    var r = nbi();
    x.abs().dlShiftTo(this.m.t,r);
    r.divRemTo(this.m,null,r);
    if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
    return r;
  }
  // x/R mod m
  function montRevert(x) {
    var r = nbi();
    x.copyTo(r);
    this.reduce(r);
    return r;
  }
  // x = x/R mod m (HAC 14.32)
  function montReduce(x) {
    while(x.t <= this.mt2)	// pad x so am has enough room later
      x[x.t++] = 0;
    for(var i = 0; i < this.m.t; ++i) {
      // faster way of calculating u0 = x[i]*mp mod DV
      var j = x[i]&0x7fff;
      var u0 = (j*this.mpl+(((j*this.mph+(x[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
      // use am to combine the multiply-shift-add into one call
      j = i+this.m.t;
      x[j] += this.m.am(0,u0,x,i,0,this.m.t);
      // propagate carry
      while(x[j] >= x.DV) { x[j] -= x.DV; x[++j]++; }
    }
    x.clamp();
    x.drShiftTo(this.m.t,x);
    if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
  }
  // r = "x^2/R mod m"; x != r
  function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
  // r = "xy/R mod m"; x,y != r
  function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
  Montgomery.prototype.convert = montConvert;
  Montgomery.prototype.revert = montRevert;
  Montgomery.prototype.reduce = montReduce;
  Montgomery.prototype.mulTo = montMulTo;
  Montgomery.prototype.sqrTo = montSqrTo;
  // (protected) true iff this is even
  function bnpIsEven() { return ((this.t>0)?(this[0]&1):this.s) == 0; }
  // (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
  function bnpExp(e,z) {
    if(e > 0xffffffff || e < 1) return BigInteger.ONE;
    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
    g.copyTo(r);
    while(--i >= 0) {
      z.sqrTo(r,r2);
      if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
      else { var t = r; r = r2; r2 = t; }
    }
    return z.revert(r);
  }
  // (public) this^e % m, 0 <= e < 2^32
  function bnModPowInt(e,m) {
    var z;
    if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
    return this.exp(e,z);
  }
  // protected
  BigInteger.prototype.copyTo = bnpCopyTo;
  BigInteger.prototype.fromInt = bnpFromInt;
  BigInteger.prototype.fromString = bnpFromString;
  BigInteger.prototype.clamp = bnpClamp;
  BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
  BigInteger.prototype.drShiftTo = bnpDRShiftTo;
  BigInteger.prototype.lShiftTo = bnpLShiftTo;
  BigInteger.prototype.rShiftTo = bnpRShiftTo;
  BigInteger.prototype.subTo = bnpSubTo;
  BigInteger.prototype.multiplyTo = bnpMultiplyTo;
  BigInteger.prototype.squareTo = bnpSquareTo;
  BigInteger.prototype.divRemTo = bnpDivRemTo;
  BigInteger.prototype.invDigit = bnpInvDigit;
  BigInteger.prototype.isEven = bnpIsEven;
  BigInteger.prototype.exp = bnpExp;
  // public
  BigInteger.prototype.toString = bnToString;
  BigInteger.prototype.negate = bnNegate;
  BigInteger.prototype.abs = bnAbs;
  BigInteger.prototype.compareTo = bnCompareTo;
  BigInteger.prototype.bitLength = bnBitLength;
  BigInteger.prototype.mod = bnMod;
  BigInteger.prototype.modPowInt = bnModPowInt;
  // "constants"
  BigInteger.ZERO = nbv(0);
  BigInteger.ONE = nbv(1);
  // jsbn2 stuff
  // (protected) convert from radix string
  function bnpFromRadix(s,b) {
    this.fromInt(0);
    if(b == null) b = 10;
    var cs = this.chunkSize(b);
    var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
    for(var i = 0; i < s.length; ++i) {
      var x = intAt(s,i);
      if(x < 0) {
        if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
        continue;
      }
      w = b*w+x;
      if(++j >= cs) {
        this.dMultiply(d);
        this.dAddOffset(w,0);
        j = 0;
        w = 0;
      }
    }
    if(j > 0) {
      this.dMultiply(Math.pow(b,j));
      this.dAddOffset(w,0);
    }
    if(mi) BigInteger.ZERO.subTo(this,this);
  }
  // (protected) return x s.t. r^x < DV
  function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
  // (public) 0 if this == 0, 1 if this > 0
  function bnSigNum() {
    if(this.s < 0) return -1;
    else if(this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
    else return 1;
  }
  // (protected) this *= n, this >= 0, 1 < n < DV
  function bnpDMultiply(n) {
    this[this.t] = this.am(0,n-1,this,0,0,this.t);
    ++this.t;
    this.clamp();
  }
  // (protected) this += n << w words, this >= 0
  function bnpDAddOffset(n,w) {
    if(n == 0) return;
    while(this.t <= w) this[this.t++] = 0;
    this[w] += n;
    while(this[w] >= this.DV) {
      this[w] -= this.DV;
      if(++w >= this.t) this[this.t++] = 0;
      ++this[w];
    }
  }
  // (protected) convert to radix string
  function bnpToRadix(b) {
    if(b == null) b = 10;
    if(this.signum() == 0 || b < 2 || b > 36) return "0";
    var cs = this.chunkSize(b);
    var a = Math.pow(b,cs);
    var d = nbv(a), y = nbi(), z = nbi(), r = "";
    this.divRemTo(d,y,z);
    while(y.signum() > 0) {
      r = (a+z.intValue()).toString(b).substr(1) + r;
      y.divRemTo(d,y,z);
    }
    return z.intValue().toString(b) + r;
  }
  // (public) return value as integer
  function bnIntValue() {
    if(this.s < 0) {
      if(this.t == 1) return this[0]-this.DV;
      else if(this.t == 0) return -1;
    }
    else if(this.t == 1) return this[0];
    else if(this.t == 0) return 0;
    // assumes 16 < DB < 32
    return ((this[1]&((1<<(32-this.DB))-1))<<this.DB)|this[0];
  }
  // (protected) r = this + a
  function bnpAddTo(a,r) {
    var i = 0, c = 0, m = Math.min(a.t,this.t);
    while(i < m) {
      c += this[i]+a[i];
      r[i++] = c&this.DM;
      c >>= this.DB;
    }
    if(a.t < this.t) {
      c += a.s;
      while(i < this.t) {
        c += this[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += this.s;
    }
    else {
      c += this.s;
      while(i < a.t) {
        c += a[i];
        r[i++] = c&this.DM;
        c >>= this.DB;
      }
      c += a.s;
    }
    r.s = (c<0)?-1:0;
    if(c > 0) r[i++] = c;
    else if(c < -1) r[i++] = this.DV+c;
    r.t = i;
    r.clamp();
  }
  BigInteger.prototype.fromRadix = bnpFromRadix;
  BigInteger.prototype.chunkSize = bnpChunkSize;
  BigInteger.prototype.signum = bnSigNum;
  BigInteger.prototype.dMultiply = bnpDMultiply;
  BigInteger.prototype.dAddOffset = bnpDAddOffset;
  BigInteger.prototype.toRadix = bnpToRadix;
  BigInteger.prototype.intValue = bnIntValue;
  BigInteger.prototype.addTo = bnpAddTo;
  //======= end jsbn =======
  // Emscripten wrapper
  var Wrapper = {
    abs: function(l, h) {
      var x = new goog.math.Long(l, h);
      var ret;
      if (x.isNegative()) {
        ret = x.negate();
      } else {
        ret = x;
      }
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
    },
    ensureTemps: function() {
      if (Wrapper.ensuredTemps) return;
      Wrapper.ensuredTemps = true;
      Wrapper.two32 = new BigInteger();
      Wrapper.two32.fromString('4294967296', 10);
      Wrapper.two64 = new BigInteger();
      Wrapper.two64.fromString('18446744073709551616', 10);
      Wrapper.temp1 = new BigInteger();
      Wrapper.temp2 = new BigInteger();
    },
    lh2bignum: function(l, h) {
      var a = new BigInteger();
      a.fromString(h.toString(), 10);
      var b = new BigInteger();
      a.multiplyTo(Wrapper.two32, b);
      var c = new BigInteger();
      c.fromString(l.toString(), 10);
      var d = new BigInteger();
      c.addTo(b, d);
      return d;
    },
    stringify: function(l, h, unsigned) {
      var ret = new goog.math.Long(l, h).toString();
      if (unsigned && ret[0] == '-') {
        // unsign slowly using jsbn bignums
        Wrapper.ensureTemps();
        var bignum = new BigInteger();
        bignum.fromString(ret, 10);
        ret = new BigInteger();
        Wrapper.two64.addTo(bignum, ret);
        ret = ret.toString(10);
      }
      return ret;
    },
    fromString: function(str, base, min, max, unsigned) {
      Wrapper.ensureTemps();
      var bignum = new BigInteger();
      bignum.fromString(str, base);
      var bigmin = new BigInteger();
      bigmin.fromString(min, 10);
      var bigmax = new BigInteger();
      bigmax.fromString(max, 10);
      if (unsigned && bignum.compareTo(BigInteger.ZERO) < 0) {
        var temp = new BigInteger();
        bignum.addTo(Wrapper.two64, temp);
        bignum = temp;
      }
      var error = false;
      if (bignum.compareTo(bigmin) < 0) {
        bignum = bigmin;
        error = true;
      } else if (bignum.compareTo(bigmax) > 0) {
        bignum = bigmax;
        error = true;
      }
      var ret = goog.math.Long.fromString(bignum.toString()); // min-max checks should have clamped this to a range goog.math.Long can handle well
      HEAP32[tempDoublePtr>>2] = ret.low_;
      HEAP32[tempDoublePtr+4>>2] = ret.high_;
      if (error) throw 'range error';
    }
  };
  return Wrapper;
})();
//======= end closure i64 code =======
// === Auto-generated postamble setup entry stuff ===
Module['callMain'] = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(!Module['preRun'] || Module['preRun'].length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  var ret;
  var initialStackTop = STACKTOP;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e.name == 'ExitStatus') {
      return e.status;
    } else if (e == 'SimulateInfiniteLoop') {
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    STACKTOP = initialStackTop;
  }
  return ret;
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return 0;
  }
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    var toRun = Module['preRun'];
    Module['preRun'] = [];
    for (var i = toRun.length-1; i >= 0; i--) {
      toRun[i]();
    }
    if (runDependencies > 0) {
      // a preRun added a dependency, run will be called later
      return 0;
    }
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    var ret = 0;
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      ret = Module['callMain'](args);
      if (!Module['noExitRuntime']) {
        exitRuntime();
      }
    }
    if (Module['postRun']) {
      if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
      while (Module['postRun'].length > 0) {
        Module['postRun'].pop()();
      }
    }
    return ret;
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
    return 0;
  } else {
    return doRun();
  }
}
Module['run'] = Module.run = run;
// {{PRE_RUN_ADDITIONS}}
/*global Module*/
/*global _malloc, _free, _memcpy*/
/*global FUNCTION_TABLE, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32*/
/*global readLatin1String*/
/*global __emval_register, _emval_handle_array, __emval_decref*/
/*global ___getTypeName*/
/*jslint sub:true*/ /* The symbols 'fromWireType' and 'toWireType' must be accessed via array notation to be closure-safe since craftInvokerFunction crafts functions as strings that can't be closured. */
var InternalError = Module.InternalError = extendError(Error, 'InternalError');
var BindingError = Module.BindingError = extendError(Error, 'BindingError');
var UnboundTypeError = Module.UnboundTypeError = extendError(BindingError, 'UnboundTypeError');
function throwInternalError(message) {
    throw new InternalError(message);
}
function throwBindingError(message) {
    throw new BindingError(message);
}
function throwUnboundTypeError(message, types) {
    var unboundTypes = [];
    var seen = {};
    function visit(type) {
        if (seen[type]) {
            return;
        }
        if (registeredTypes[type]) {
            return;
        }
        if (typeDependencies[type]) {
            typeDependencies[type].forEach(visit);
            return;
        }
        unboundTypes.push(type);
        seen[type] = true;
    }
    types.forEach(visit);
    throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
}
// Creates a function overload resolution table to the given method 'methodName' in the given prototype,
// if the overload table doesn't yet exist.
function ensureOverloadTable(proto, methodName, humanName) {
    if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function() {
            // TODO This check can be removed in -O3 level "unsafe" optimizations.
            if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
            }
            return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
    }            
}
/* Registers a symbol (function, class, enum, ...) as part of the Module JS object so that
   hand-written code is able to access that symbol via 'Module.name'.
   name: The name of the symbol that's being exposed.
   value: The object itself to expose (function, class, ...)
   numArguments: For functions, specifies the number of arguments the function takes in. For other types, unused and undefined.
   To implement support for multiple overloads of a function, an 'overload selector' function is used. That selector function chooses
   the appropriate overload to call from an function overload table. This selector function is only used if multiple overloads are
   actually registered, since it carries a slight performance penalty. */
function exposePublicSymbol(name, value, numArguments) {
    if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
            throwBindingError("Cannot register public name '" + name + "' twice");
        }
        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module.hasOwnProperty(numArguments)) {
            throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        Module[name] = value;
        if (undefined !== numArguments) {
            Module[name].numArguments = numArguments;
        }
    }
}
function replacePublicSymbol(name, value, numArguments) {
    if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistant public symbol');
    }
    // If there's an overload table for this symbol, replace the symbol in the overload table instead.
    if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
    }
    else {
        Module[name] = value;
    }
}
// from https://github.com/imvu/imvujs/blob/master/src/error.js
function extendError(baseErrorType, errorName) {
    var errorClass = createNamedFunction(errorName, function(message) {
        this.name = errorName;
        this.message = message;
        var stack = (new Error(message)).stack;
        if (stack !== undefined) {
            this.stack = this.toString() + '\n' +
                stack.replace(/^Error(:[^\n]*)?\n/, '');
        }
    });
    errorClass.prototype = Object.create(baseErrorType.prototype);
    errorClass.prototype.constructor = errorClass;
    errorClass.prototype.toString = function() {
        if (this.message === undefined) {
            return this.name;
        } else {
            return this.name + ': ' + this.message;
        }
    };
    return errorClass;
}
// from https://github.com/imvu/imvujs/blob/master/src/function.js
function createNamedFunction(name, body) {
    name = makeLegalFunctionName(name);
    /*jshint evil:true*/
    return new Function(
        "body",
        "return function " + name + "() {\n" +
        "    \"use strict\";" +
        "    return body.apply(this, arguments);\n" +
        "};\n"
    )(body);
}
function _embind_repr(v) {
    var t = typeof v;
    if (t === 'object' || t === 'array' || t === 'function') {
        return v.toString();
    } else {
        return '' + v;
    }
}
// typeID -> { toWireType: ..., fromWireType: ... }
var registeredTypes = {};
// typeID -> [callback]
var awaitingDependencies = {};
// typeID -> [dependentTypes]
var typeDependencies = {};
// class typeID -> {pointerType: ..., constPointerType: ...}
var registeredPointers = {};
function registerType(rawType, registeredInstance) {
    var name = registeredInstance.name;
    if (!rawType) {
        throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
    }
    if (registeredTypes.hasOwnProperty(rawType)) {
        throwBindingError("Cannot register type '" + name + "' twice");
    }
    registeredTypes[rawType] = registeredInstance;
    delete typeDependencies[rawType];
    if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach(function(cb) {
            cb();
        });
    }
}
function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
    myTypes.forEach(function(type) {
        typeDependencies[type] = dependentTypes;
    });
    function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
            throwInternalError('Mismatched type converter count');
        }
        for (var i = 0; i < myTypes.length; ++i) {
            registerType(myTypes[i], myTypeConverters[i]);
        }
    }
    var typeConverters = new Array(dependentTypes.length);
    var unregisteredTypes = [];
    var registered = 0;
    dependentTypes.forEach(function(dt, i) {
        if (registeredTypes.hasOwnProperty(dt)) {
            typeConverters[i] = registeredTypes[dt];
        } else {
            unregisteredTypes.push(dt);
            if (!awaitingDependencies.hasOwnProperty(dt)) {
                awaitingDependencies[dt] = [];
            }
            awaitingDependencies[dt].push(function() {
                typeConverters[i] = registeredTypes[dt];
                ++registered;
                if (registered === unregisteredTypes.length) {
                    onComplete(typeConverters);
                }
            });
        }
    });
    if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
    }
}
var __charCodes = (function() {
    var codes = new Array(256);
    for (var i = 0; i < 256; ++i) {
        codes[i] = String.fromCharCode(i);
    }
    return codes;
})();
function readLatin1String(ptr) {
    var ret = "";
    var c = ptr;
    while (HEAPU8[c]) {
        ret += __charCodes[HEAPU8[c++]];
    }
    return ret;
}
function getTypeName(type) {
    var ptr = ___getTypeName(type);
    var rv = readLatin1String(ptr);
    _free(ptr);
    return rv;
}
function heap32VectorToArray(count, firstElement) {
    var array = [];
    for (var i = 0; i < count; i++) {
        array.push(HEAP32[(firstElement >> 2) + i]);
    }
    return array;
}
function requireRegisteredType(rawType, humanName) {
    var impl = registeredTypes[rawType];
    if (undefined === impl) {
        throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
    }
    return impl;
}
function __embind_register_void(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function() {
            return undefined;
        },
        'toWireType': function(destructors, o) {
            // TODO: assert if anything else is given?
            return undefined;
        },
    });
}
function __embind_register_bool(rawType, name, trueValue, falseValue) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(wt) {
            // ambiguous emscripten ABI: sometimes return values are
            // true or false, and sometimes integers (0 or 1)
            return !!wt;
        },
        'toWireType': function(destructors, o) {
            return o ? trueValue : falseValue;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
// When converting a number from JS to C++ side, the valid range of the number is
// [minRange, maxRange], inclusive.
function __embind_register_integer(primitiveType, name, minRange, maxRange) {
    name = readLatin1String(name);
    if (maxRange === -1) { // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come out as 'i32 -1'. Always treat those as max u32.
        maxRange = 4294967295;
    }
    registerType(primitiveType, {
        name: name,
        minRange: minRange,
        maxRange: maxRange,
        'fromWireType': function(value) {
            return value;
        },
        'toWireType': function(destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following two if()s and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            if (value < minRange || value > maxRange) {
                throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
            }
            return value | 0;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_float(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            return value;
        },
        'toWireType': function(destructors, value) {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
            // avoid the following if() and assume value is of proper type.
            if (typeof value !== "number" && typeof value !== "boolean") {
                throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
            }
            return value;
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_std_string(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
            }
            _free(value);
            return a.join('');
        },
        'toWireType': function(destructors, value) {
            if (value instanceof ArrayBuffer) {
                value = new Uint8Array(value);
            }
            function getTAElement(ta, index) {
                return ta[index];
            }
            function getStringElement(string, index) {
                return string.charCodeAt(index);
            }
            var getElement;
            if (value instanceof Uint8Array) {
                getElement = getTAElement;
            } else if (value instanceof Int8Array) {
                getElement = getTAElement;
            } else if (typeof value === 'string') {
                getElement = getStringElement;
            } else {
                throwBindingError('Cannot pass non-string to std::string');
            }
            // assumes 4-byte alignment
            var length = value.length;
            var ptr = _malloc(4 + length);
            HEAPU32[ptr >> 2] = length;
            for (var i = 0; i < length; ++i) {
                var charCode = getElement(value, i);
                if (charCode > 255) {
                    _free(ptr);
                    throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + 4 + i] = charCode;
            }
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        },
        destructorFunction: function(ptr) { _free(ptr); },
    });
}
function __embind_register_std_wstring(rawType, charSize, name) {
    name = readLatin1String(name);
    var HEAP, shift;
    if (charSize === 2) {
        HEAP = HEAPU16;
        shift = 1;
    } else if (charSize === 4) {
        HEAP = HEAPU32;
        shift = 2;
    }
    registerType(rawType, {
        name: name,
        'fromWireType': function(value) {
            var length = HEAPU32[value >> 2];
            var a = new Array(length);
            var start = (value + 4) >> shift;
            for (var i = 0; i < length; ++i) {
                a[i] = String.fromCharCode(HEAP[start + i]);
            }
            _free(value);
            return a.join('');
        },
        'toWireType': function(destructors, value) {
            // assumes 4-byte alignment
            var length = value.length;
            var ptr = _malloc(4 + length * charSize);
            HEAPU32[ptr >> 2] = length;
            var start = (ptr + 4) >> shift;
            for (var i = 0; i < length; ++i) {
                HEAP[start + i] = value.charCodeAt(i);
            }
            if (destructors !== null) {
                destructors.push(_free, ptr);
            }
            return ptr;
        },
        destructorFunction: function(ptr) { _free(ptr); },
    });
}
function __embind_register_emval(rawType, name) {
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
            var rv = _emval_handle_array[handle].value;
            __emval_decref(handle);
            return rv;
        },
        'toWireType': function(destructors, value) {
            return __emval_register(value);
        },
        destructorFunction: null, // This type does not need a destructor
    });
}
function __embind_register_memory_view(rawType, name) {
    var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,        
    ];
    name = readLatin1String(name);
    registerType(rawType, {
        name: name,
        'fromWireType': function(handle) {
            var type = HEAPU32[handle >> 2];
            var size = HEAPU32[(handle >> 2) + 1]; // in elements
            var data = HEAPU32[(handle >> 2) + 2]; // byte offset into emscripten heap
            var TA = typeMapping[type];
            return new TA(HEAP8.buffer, data, size);
        },
    });
}
function runDestructors(destructors) {
    while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
    }
}
// Function implementation of operator new, per
// http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
// 13.2.2
// ES3
function new_(constructor, argumentList) {
    if (!(constructor instanceof Function)) {
        throw new TypeError('new_ called with constructor type ' + typeof(constructor) + " which is not a function");
    }
    /*
     * Previously, the following line was just:
     function dummy() {};
     * Unfortunately, Chrome was preserving 'dummy' as the object's name, even though at creation, the 'dummy' has the
     * correct constructor name.  Thus, objects created with IMVU.new would show up in the debugger as 'dummy', which
     * isn't very helpful.  Using IMVU.createNamedFunction addresses the issue.  Doublely-unfortunately, there's no way
     * to write a test for this behavior.  -NRD 2013.02.22
     */
    var dummy = createNamedFunction(constructor.name, function(){});
    dummy.prototype = constructor.prototype;
    var obj = new dummy;
    var r = constructor.apply(obj, argumentList);
    return (r instanceof Object) ? r : obj;
}
// The path to interop from JS code to C++ code:
// (hand-written JS code) -> (autogenerated JS invoker) -> (template-generated C++ invoker) -> (target C++ function)
// craftInvokerFunction generates the JS invoker function for each function exposed to JS through embind.
function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
    // humanName: a human-readable string name for the function to be generated.
    // argTypes: An array that contains the embind type objects for all types in the function signature.
    //    argTypes[0] is the type object for the function return value.
    //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
    //    argTypes[2...] are the actual function parameters.
    // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
    // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
    // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
    var argCount = argTypes.length;
    if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
    }
    var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
    if (!isClassMethodFunc && !FUNCTION_TABLE[cppTargetFunc]) {
        throwBindingError('Global function '+humanName+' is not defined!');
    }
    // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
// TODO: This omits argument count check - enable only at -O3 or similar.
//    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
//       return FUNCTION_TABLE[fn];
//    }
    var argsList = "";
    var argsListWired = "";
    for(var i = 0; i < argCount-2; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i;
        argsListWired += (i!==0?", ":"")+"arg"+i+"Wired";
    }
    var invokerFnBody =
        "return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n" +
        "if (arguments.length !== "+(argCount - 2)+") {\n" +
            "throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount - 2)+" args!');\n" +
        "}\n";
    // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
    // TODO: Remove this completely once all function invokers are being dynamically generated.
    var needsDestructorStack = false;
    for(var i = 1; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here.
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) { // The type does not define a destructor function - must use dynamic stack
            needsDestructorStack = true;
            break;
        }
    }
    if (needsDestructorStack) {
        invokerFnBody +=
            "var destructors = [];\n";
    }
    var dtorStack = needsDestructorStack ? "destructors" : "null";
    var args1 = ["throwBindingError", "classType", "invoker", "fn", "runDestructors", "retType", "classParam"];
    var args2 = [throwBindingError, classType, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
    if (isClassMethodFunc) {
        invokerFnBody += "var thisWired = classParam.toWireType("+dtorStack+", this);\n";
    }
    for(var i = 0; i < argCount-2; ++i) {
        invokerFnBody += "var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";
        args1.push("argType"+i);
        args2.push(argTypes[i+2]);
    }
    if (isClassMethodFunc) {
        argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
    }
    var returns = (argTypes[0].name !== "void");
    invokerFnBody +=
        (returns?"var rv = ":"") + "invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";
    if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
    } else {
        for(var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
            var paramName = (i === 1 ? "thisWired" : ("arg"+(i-2)+"Wired"));
            if (argTypes[i].destructorFunction !== null) {
                invokerFnBody += paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";
                args1.push(paramName+"_dtor");
                args2.push(argTypes[i].destructorFunction);
            }
        }
    }
    if (returns) {
        invokerFnBody += "return retType.fromWireType(rv);\n";
    }
    invokerFnBody += "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __embind_register_function(name, argCount, rawArgTypesAddr, rawInvoker, fn) {
    var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    name = readLatin1String(name);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    exposePublicSymbol(name, function() {
        throwUnboundTypeError('Cannot call ' + name + ' due to unbound types', argTypes);
    }, argCount - 1);
    whenDependentTypesAreResolved([], argTypes, function(argTypes) {
        var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn), argCount - 1);
        return [];
    });
}
var tupleRegistrations = {};
function __embind_register_tuple(rawType, name, rawConstructor, rawDestructor) {
    tupleRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: FUNCTION_TABLE[rawConstructor],
        rawDestructor: FUNCTION_TABLE[rawDestructor],
        elements: [],
    };
}
function __embind_register_tuple_element(
    rawTupleType,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    tupleRegistrations[rawTupleType].elements.push({
        getterReturnType: getterReturnType,
        getter: FUNCTION_TABLE[getter],
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: FUNCTION_TABLE[setter],
        setterContext: setterContext,
    });
}
function __embind_finalize_tuple(rawTupleType) {
    var reg = tupleRegistrations[rawTupleType];
    delete tupleRegistrations[rawTupleType];
    var elements = reg.elements;
    var elementsLength = elements.length;
    var elementTypes = elements.map(function(elt) { return elt.getterReturnType; }).
                concat(elements.map(function(elt) { return elt.setterArgumentType; }));
    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    whenDependentTypesAreResolved([rawTupleType], elementTypes, function(elementTypes) {
        elements.forEach(function(elt, i) {
            var getterReturnType = elementTypes[i];
            var getter = elt.getter;
            var getterContext = elt.getterContext;
            var setterArgumentType = elementTypes[i + elementsLength];
            var setter = elt.setter;
            var setterContext = elt.setterContext;
            elt.read = function(ptr) {
                return getterReturnType['fromWireType'](getter(getterContext, ptr));
            };
            elt.write = function(ptr, o) {
                var destructors = [];
                setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
                runDestructors(destructors);
            };
        });
        return [{
            name: reg.name,
            'fromWireType': function(ptr) {
                var rv = new Array(elementsLength);
                for (var i = 0; i < elementsLength; ++i) {
                    rv[i] = elements[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
            },
            'toWireType': function(destructors, o) {
                if (elementsLength !== o.length) {
                    throw new TypeError("Incorrect number of tuple elements for " + reg.name + ": expected=" + elementsLength + ", actual=" + o.length);
                }
                var ptr = rawConstructor();
                for (var i = 0; i < elementsLength; ++i) {
                    elements[i].write(ptr, o[i]);
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr);
                }
                return ptr;
            },
            destructorFunction: rawDestructor,
        }];
    });
}
var structRegistrations = {};
function __embind_register_struct(
    rawType,
    name,
    rawConstructor,
    rawDestructor
) {
    structRegistrations[rawType] = {
        name: readLatin1String(name),
        rawConstructor: FUNCTION_TABLE[rawConstructor],
        rawDestructor: FUNCTION_TABLE[rawDestructor],
        fields: [],
    };
}
function __embind_register_struct_field(
    structType,
    fieldName,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    structRegistrations[structType].fields.push({
        fieldName: readLatin1String(fieldName),
        getterReturnType: getterReturnType,
        getter: FUNCTION_TABLE[getter],
        getterContext: getterContext,
        setterArgumentType: setterArgumentType,
        setter: FUNCTION_TABLE[setter],
        setterContext: setterContext,
    });
}
function __embind_finalize_struct(structType) {
    var reg = structRegistrations[structType];
    delete structRegistrations[structType];
    var rawConstructor = reg.rawConstructor;
    var rawDestructor = reg.rawDestructor;
    var fieldRecords = reg.fields;
    var fieldTypes = fieldRecords.map(function(field) { return field.getterReturnType; }).
              concat(fieldRecords.map(function(field) { return field.setterArgumentType; }));
    whenDependentTypesAreResolved([structType], fieldTypes, function(fieldTypes) {
        var fields = {};
        fieldRecords.forEach(function(field, i) {
            var fieldName = field.fieldName;
            var getterReturnType = fieldTypes[i];
            var getter = field.getter;
            var getterContext = field.getterContext;
            var setterArgumentType = fieldTypes[i + fieldRecords.length];
            var setter = field.setter;
            var setterContext = field.setterContext;
            fields[fieldName] = {
                read: function(ptr) {
                    return getterReturnType['fromWireType'](
                        getter(getterContext, ptr));
                },
                write: function(ptr, o) {
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
                    runDestructors(destructors);
                }
            };
        });
        return [{
            name: reg.name,
            'fromWireType': function(ptr) {
                var rv = {};
                for (var i in fields) {
                    rv[i] = fields[i].read(ptr);
                }
                rawDestructor(ptr);
                return rv;
            },
            'toWireType': function(destructors, o) {
                // todo: Here we have an opportunity for -O3 level "unsafe" optimizations:
                // assume all fields are present without checking.
                for (var fieldName in fields) {
                    if (!(fieldName in o)) {
                        throw new TypeError('Missing field');
                    }
                }
                var ptr = rawConstructor();
                for (fieldName in fields) {
                    fields[fieldName].write(ptr, o[fieldName]);
                }
                if (destructors !== null) {
                    destructors.push(rawDestructor, ptr);
                }
                return ptr;
            },
            destructorFunction: rawDestructor,
        }];
    });
}
var genericPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        if (this.isSmartPointer) {
            var ptr = this.rawConstructor();
            if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
            }
            return ptr;
        } else {
            return 0;
        }
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
            throwBindingError('Passing raw pointer to smart pointer is illegal');
        }
        switch (this.sharingPolicy) {
            case 0: // NONE
                // no upcasting
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                } else {
                    throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
                }
                break;
            case 1: // INTRUSIVE
                ptr = handle.$$.smartPtr;
                break;
            case 2: // BY_EMVAL
                if (handle.$$.smartPtrType === this) {
                    ptr = handle.$$.smartPtr;
                } else {
                    var clonedHandle = handle.clone();
                    ptr = this.rawShare(
                        ptr,
                        __emval_register(function() {
                            clonedHandle.delete();
                        })
                    );
                    if (destructors !== null) {
                        destructors.push(this.rawDestructor, ptr);
                    }
                }
                break;
            default:
                throwBindingError('Unsupporting sharing policy');
        }
    }
    return ptr;
};
// If we know a pointer type is not going to have SmartPtr logic in it, we can
// special-case optimize it a bit (compare to genericPointerToWireType)
var constNoSmartPtrRawPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
};
// An optimized version for non-const method accesses - there we must additionally restrict that
// the pointer is not a const-pointer.
var nonConstNoSmartPtrRawPointerToWireType = function(destructors, handle) {
    if (handle === null) {
        if (this.isReference) {
            throwBindingError('null is not a valid ' + this.name);
        }
        return 0;
    }
    if (!handle.$$) {
        throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
    }
    if (!handle.$$.ptr) {
        throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
    }
    if (handle.$$.ptrType.isConst) {
        throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
    }
    var handleClass = handle.$$.ptrType.registeredClass;
    var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
    return ptr;
};
function RegisteredPointer(
    name,
    registeredClass,
    isReference,
    isConst,
    // smart pointer properties
    isSmartPointer,
    pointeeType,
    sharingPolicy,
    rawGetPointee,
    rawConstructor,
    rawShare,
    rawDestructor
) {
    this.name = name;
    this.registeredClass = registeredClass;
    this.isReference = isReference;
    this.isConst = isConst;
    // smart pointer properties
    this.isSmartPointer = isSmartPointer;
    this.pointeeType = pointeeType;
    this.sharingPolicy = sharingPolicy;
    this.rawGetPointee = rawGetPointee;
    this.rawConstructor = rawConstructor;
    this.rawShare = rawShare;
    this.rawDestructor = rawDestructor;
    if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
            this['toWireType'] = constNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
        } else {
            this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
            this.destructorFunction = null;
        }
    } else {
        this['toWireType'] = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in 
        //       craftInvokerFunction altogether.
    }
}
RegisteredPointer.prototype.getPointee = function(ptr) {
    if (this.rawGetPointee) {
        ptr = this.rawGetPointee(ptr);
    }
    return ptr;
};
RegisteredPointer.prototype.destructor = function(ptr) {
    if (this.rawDestructor) {
        this.rawDestructor(ptr);
    }
};
RegisteredPointer.prototype['fromWireType'] = function(ptr) {
    // ptr is a raw pointer (or a raw smartpointer)
    // rawPointer is a maybe-null raw pointer
    var rawPointer = this.getPointee(ptr);
    if (!rawPointer) {
        this.destructor(ptr);
        return null;
    }
    function makeDefaultHandle() {
        if (this.isSmartPointer) {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this.pointeeType,
                ptr: rawPointer,
                smartPtrType: this,
                smartPtr: ptr,
            });
        } else {
            return makeClassHandle(this.registeredClass.instancePrototype, {
                ptrType: this,
                ptr: ptr,
            });
        }
    }
    var actualType = this.registeredClass.getActualType(rawPointer);
    var registeredPointerRecord = registeredPointers[actualType];
    if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
    }
    var toType;
    if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
    } else {
        toType = registeredPointerRecord.pointerType;
    }
    var dp = downcastPointer(
        rawPointer,
        this.registeredClass,
        toType.registeredClass);
    if (dp === null) {
        return makeDefaultHandle.call(this);
    }
    if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
            smartPtrType: this,
            smartPtr: ptr,
        });
    } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
            ptrType: toType,
            ptr: dp,
        });
    }
};
function makeClassHandle(prototype, record) {
    if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
    }
    var hasSmartPtrType = !!record.smartPtrType;
    var hasSmartPtr = !!record.smartPtr;
    if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
    }
    record.count = { value: 1 };
    return Object.create(prototype, {
        $$: {
            value: record,
        },
    });
}
// root of all pointer and smart pointer handles in embind
function ClassHandle() {
}
function getInstanceTypeName(handle) {
    return handle.$$.ptrType.registeredClass.name;
}
ClassHandle.prototype.isAliasOf = function(other) {
    if (!(this instanceof ClassHandle)) {
        return false;
    }
    if (!(other instanceof ClassHandle)) {
        return false;
    }
    var leftClass = this.$$.ptrType.registeredClass;
    var left = this.$$.ptr;
    var rightClass = other.$$.ptrType.registeredClass;
    var right = other.$$.ptr;
    while (leftClass.baseClass) {
        left = leftClass.upcast(left);
        leftClass = leftClass.baseClass;
    }
    while (rightClass.baseClass) {
        right = rightClass.upcast(right);
        rightClass = rightClass.baseClass;
    }
    return leftClass === rightClass && left === right;
};
function throwInstanceAlreadyDeleted(obj) {
    throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
}
ClassHandle.prototype.clone = function() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    var clone = Object.create(Object.getPrototypeOf(this), {
        $$: {
            value: shallowCopy(this.$$),
        }
    });
    clone.$$.count.value += 1;
    return clone;
};
function runDestructor(handle) {
    var $$ = handle.$$;
    if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
    } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
    }
}
ClassHandle.prototype['delete'] = function ClassHandle_delete() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    if (this.$$.deleteScheduled) {
        throwBindingError('Object already scheduled for deletion');
    }
    this.$$.count.value -= 1;
    if (0 === this.$$.count.value) {
        runDestructor(this);
    }
    this.$$.smartPtr = undefined;
    this.$$.ptr = undefined;
};
var deletionQueue = [];
ClassHandle.prototype['isDeleted'] = function isDeleted() {
    return !this.$$.ptr;
};
ClassHandle.prototype['deleteLater'] = function deleteLater() {
    if (!this.$$.ptr) {
        throwInstanceAlreadyDeleted(this);
    }
    if (this.$$.deleteScheduled) {
        throwBindingError('Object already scheduled for deletion');
    }
    deletionQueue.push(this);
    if (deletionQueue.length === 1 && delayFunction) {
        delayFunction(flushPendingDeletes);
    }
    this.$$.deleteScheduled = true;
    return this;
};
function flushPendingDeletes() {
    while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
    }
}
Module['flushPendingDeletes'] = flushPendingDeletes;
var delayFunction;
Module['setDelayFunction'] = function setDelayFunction(fn) {
    delayFunction = fn;
    if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
    }
};
function RegisteredClass(
    name,
    constructor,
    instancePrototype,
    rawDestructor,
    baseClass,
    getActualType,
    upcast,
    downcast
) {
    this.name = name;
    this.constructor = constructor;
    this.instancePrototype = instancePrototype;
    this.rawDestructor = rawDestructor;
    this.baseClass = baseClass;
    this.getActualType = getActualType;
    this.upcast = upcast;
    this.downcast = downcast;
}
function shallowCopy(o) {
    var rv = {};
    for (var k in o) {
        rv[k] = o[k];
    }
    return rv;
}
function __embind_register_class(
    rawType,
    rawPointerType,
    rawConstPointerType,
    baseClassRawType,
    getActualType,
    upcast,
    downcast,
    name,
    rawDestructor
) {
    name = readLatin1String(name);
    rawDestructor = FUNCTION_TABLE[rawDestructor];
    getActualType = FUNCTION_TABLE[getActualType];
    upcast = FUNCTION_TABLE[upcast];
    downcast = FUNCTION_TABLE[downcast];
    var legalFunctionName = makeLegalFunctionName(name);
    exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
    });
    whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        function(base) {
            base = base[0];
            var baseClass;
            var basePrototype;
            if (baseClassRawType) {
                baseClass = base.registeredClass;
                basePrototype = baseClass.instancePrototype;
            } else {
                basePrototype = ClassHandle.prototype;
            }
            var constructor = createNamedFunction(legalFunctionName, function() {
                if (Object.getPrototypeOf(this) !== instancePrototype) {
                    throw new BindingError("Use 'new' to construct " + name);
                }
                if (undefined === registeredClass.constructor_body) {
                    throw new BindingError(name + " has no accessible constructor");
                }
                var body = registeredClass.constructor_body[arguments.length];
                if (undefined === body) {
                    throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
                }
                return body.apply(this, arguments);
            });
            var instancePrototype = Object.create(basePrototype, {
                constructor: { value: constructor },
            });
            constructor.prototype = instancePrototype;
            var registeredClass = new RegisteredClass(
                name,
                constructor,
                instancePrototype,
                rawDestructor,
                baseClass,
                getActualType,
                upcast,
                downcast);
            var referenceConverter = new RegisteredPointer(
                name,
                registeredClass,
                true,
                false,
                false);
            var pointerConverter = new RegisteredPointer(
                name + '*',
                registeredClass,
                false,
                false,
                false);
            var constPointerConverter = new RegisteredPointer(
                name + ' const*',
                registeredClass,
                false,
                true,
                false);
            registeredPointers[rawType] = {
                pointerType: pointerConverter,
                constPointerType: constPointerConverter
            };
            replacePublicSymbol(legalFunctionName, constructor);
            return [referenceConverter, pointerConverter, constPointerConverter];
        }
    );
}
function __embind_register_class_constructor(
    rawClassType,
    argCount,
    rawArgTypesAddr,
    invoker,
    rawConstructor
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    invoker = FUNCTION_TABLE[invoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = 'constructor ' + classType.name;
        if (undefined === classType.registeredClass.constructor_body) {
            classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
            throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount-1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
        }
        classType.registeredClass.constructor_body[argCount - 1] = function() {
            throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
        };
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            classType.registeredClass.constructor_body[argCount - 1] = function() {
                if (arguments.length !== argCount - 1) {
                    throwBindingError(humanName + ' called with ' + arguments.length + ' arguments, expected ' + (argCount-1));
                }
                var destructors = [];
                var args = new Array(argCount);
                args[0] = rawConstructor;
                for (var i = 1; i < argCount; ++i) {
                    args[i] = argTypes[i]['toWireType'](destructors, arguments[i - 1]);
                }
                var ptr = invoker.apply(null, args);
                runDestructors(destructors);
                return argTypes[0]['fromWireType'](ptr);
            };
            return [];
        });
        return [];
    });
}
function downcastPointer(ptr, ptrClass, desiredClass) {
    if (ptrClass === desiredClass) {
        return ptr;
    }
    if (undefined === desiredClass.baseClass) {
        return null; // no conversion
    }
    // O(depth) stack space used
    return desiredClass.downcast(
        downcastPointer(ptr, ptrClass, desiredClass.baseClass));
}
function upcastPointer(ptr, ptrClass, desiredClass) {
    while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
            throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
    }
    return ptr;
}
function validateThis(this_, classType, humanName) {
    if (!(this_ instanceof Object)) {
        throwBindingError(humanName + ' with invalid "this": ' + this_);
    }
    if (!(this_ instanceof classType.registeredClass.constructor)) {
        throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name);
    }
    if (!this_.$$.ptr) {
        throwBindingError('cannot call emscripten binding method ' + humanName + ' on deleted object');
    }
    // todo: kill this
    return upcastPointer(
        this_.$$.ptr,
        this_.$$.ptrType.registeredClass,
        classType.registeredClass);
}
function __embind_register_class_function(
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr, // [ReturnType, ThisType, Args...]
    rawInvoker,
    context
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;
        var unboundTypesHandler = function() {
            throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
        };
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount-2)) {
            // This is the first overload to be registered, OR we are replacing a function in the base class with a function in the derived class.
            unboundTypesHandler.argCount = argCount-2;
            unboundTypesHandler.className = classType.name;
            proto[methodName] = unboundTypesHandler;
        } else {
            // There was an existing function with the same name registered. Set up a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount-2] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
            // Replace the initial unbound-handler-stub function with the appropriate member function, now that all types
            // are resolved. If multiple overloads are registered for this function, the function goes into an overload table.
            if (undefined === proto[methodName].overloadTable) {
                proto[methodName] = memberFunction;
            } else {
                proto[methodName].overloadTable[argCount-2] = memberFunction;
            }
            return [];
        });
        return [];
    });
}
function __embind_register_class_class_function(
    rawClassType,
    methodName,
    argCount,
    rawArgTypesAddr,
    rawInvoker,
    fn
) {
    var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
    methodName = readLatin1String(methodName);
    rawInvoker = FUNCTION_TABLE[rawInvoker];
    whenDependentTypesAreResolved([], [rawClassType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + methodName;
        var unboundTypesHandler = function() {
                throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
            };
        var proto = classType.registeredClass.constructor;
        if (undefined === proto[methodName]) {
            // This is the first function to be registered with this name.
            unboundTypesHandler.argCount = argCount-1;
            proto[methodName] = unboundTypesHandler;
        } else {
            // There was an existing function with the same name registered. Set up a function overload routing table.
            ensureOverloadTable(proto, methodName, humanName);
            proto[methodName].overloadTable[argCount-1] = unboundTypesHandler;
        }
        whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
            // Replace the initial unbound-types-handler stub with the proper function. If multiple overloads are registered,
            // the function handlers go into an overload table.
            var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
            var func = craftInvokerFunction(humanName, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn);
            if (undefined === proto[methodName].overloadTable) {
                proto[methodName] = func;
            } else {
                proto[methodName].overloadTable[argCount-1] = func;
            }
            return [];
        });
        return [];
    });
}
function __embind_register_class_property(
    classType,
    fieldName,
    getterReturnType,
    getter,
    getterContext,
    setterArgumentType,
    setter,
    setterContext
) {
    fieldName = readLatin1String(fieldName);
    getter = FUNCTION_TABLE[getter];
    whenDependentTypesAreResolved([], [classType], function(classType) {
        classType = classType[0];
        var humanName = classType.name + '.' + fieldName;
        var desc = {
            get: function() {
                throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [getterReturnType, setterArgumentType]);
            },
            enumerable: true,
            configurable: true
        };
        if (setter) {
            desc.set = function() {
                throwUnboundTypeError('Cannot access ' + humanName + ' due to unbound types', [getterReturnType, setterArgumentType]);
            };
        } else {
            desc.set = function(v) {
                throwBindingError(humanName + ' is a read-only property');
            };
        }
        Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
        whenDependentTypesAreResolved(
            [],
            (setter ? [getterReturnType, setterArgumentType] : [getterReturnType]),
        function(types) {
            var getterReturnType = types[0];
            var desc = {
                get: function() {
                    var ptr = validateThis(this, classType, humanName + ' getter');
                    return getterReturnType['fromWireType'](getter(getterContext, ptr));
                },
                enumerable: true
            };
            if (setter) {
                setter = FUNCTION_TABLE[setter];
                var setterArgumentType = types[1];
                desc.set = function(v) {
                    var ptr = validateThis(this, classType, humanName + ' setter');
                    var destructors = [];
                    setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, v));
                    runDestructors(destructors);
                };
            }
            Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
            return [];
        });
        return [];
    });
}
var char_0 = '0'.charCodeAt(0);
var char_9 = '9'.charCodeAt(0);
function makeLegalFunctionName(name) {
    name = name.replace(/[^a-zA-Z0-9_]/g, '$');
    var f = name.charCodeAt(0);
    if (f >= char_0 && f <= char_9) {
        return '_' + name;
    } else {
        return name;
    }
}
function __embind_register_smart_ptr(
    rawType,
    rawPointeeType,
    name,
    sharingPolicy,
    rawGetPointee,
    rawConstructor,
    rawShare,
    rawDestructor
) {
    name = readLatin1String(name);
    rawGetPointee = FUNCTION_TABLE[rawGetPointee];
    rawConstructor = FUNCTION_TABLE[rawConstructor];
    rawShare = FUNCTION_TABLE[rawShare];
    rawDestructor = FUNCTION_TABLE[rawDestructor];
    whenDependentTypesAreResolved([rawType], [rawPointeeType], function(pointeeType) {
        pointeeType = pointeeType[0];
        var registeredPointer = new RegisteredPointer(
            name,
            pointeeType.registeredClass,
            false,
            false,
            // smart pointer properties
            true,
            pointeeType,
            sharingPolicy,
            rawGetPointee,
            rawConstructor,
            rawShare,
            rawDestructor);
        return [registeredPointer];
    });
}
function __embind_register_enum(
    rawType,
    name
) {
    name = readLatin1String(name);
    function constructor() {
    }
    constructor.values = {};
    registerType(rawType, {
        name: name,
        constructor: constructor,
        'fromWireType': function(c) {
            return this.constructor.values[c];
        },
        'toWireType': function(destructors, c) {
            return c.value;
        },
        destructorFunction: null,
    });
    exposePublicSymbol(name, constructor);
}
function __embind_register_enum_value(
    rawEnumType,
    name,
    enumValue
) {
    var enumType = requireRegisteredType(rawEnumType, 'enum');
    name = readLatin1String(name);
    var Enum = enumType.constructor;
    var Value = Object.create(enumType.constructor.prototype, {
        value: {value: enumValue},
        constructor: {value: createNamedFunction(enumType.name + '_' + name, function() {})},
    });
    Enum.values[enumValue] = Value;
    Enum[name] = Value;
}
function __embind_register_constant(name, type, value) {
    name = readLatin1String(name);
    whenDependentTypesAreResolved([], [type], function(type) {
        type = type[0];
        Module[name] = type['fromWireType'](value);
        return [];
    });
}
/*global Module:true, Runtime*/
/*global HEAP32*/
/*global new_*/
/*global createNamedFunction*/
/*global readLatin1String, writeStringToMemory*/
/*global requireRegisteredType, throwBindingError*/
var Module = Module || {};
var _emval_handle_array = [{}]; // reserve zero
var _emval_free_list = [];
// Public JS API
/** @expose */
Module.count_emval_handles = function() {
    var count = 0;
    for (var i = 1; i < _emval_handle_array.length; ++i) {
        if (_emval_handle_array[i] !== undefined) {
            ++count;
        }
    }
    return count;
};
/** @expose */
Module.get_first_emval = function() {
    for (var i = 1; i < _emval_handle_array.length; ++i) {
        if (_emval_handle_array[i] !== undefined) {
            return _emval_handle_array[i];
        }
    }
    return null;
};
// Private C++ API
var _emval_symbols = {}; // address -> string
function __emval_register_symbol(address) {
    _emval_symbols[address] = readLatin1String(address);
}
function getStringOrSymbol(address) {
    var symbol = _emval_symbols[address];
    if (symbol === undefined) {
        return readLatin1String(address);
    } else {
        return symbol;
    }
}
function requireHandle(handle) {
    if (!handle) {
        throwBindingError('Cannot use deleted val. handle = ' + handle);
    }
}
function __emval_register(value) {
    var handle = _emval_free_list.length ?
        _emval_free_list.pop() :
        _emval_handle_array.length;
    _emval_handle_array[handle] = {refcount: 1, value: value};
    return handle;
}
function __emval_incref(handle) {
    if (handle) {
        _emval_handle_array[handle].refcount += 1;
    }
}
function __emval_decref(handle) {
    if (handle && 0 === --_emval_handle_array[handle].refcount) {
        _emval_handle_array[handle] = undefined;
        _emval_free_list.push(handle);
    }
}
function __emval_new_array() {
    return __emval_register([]);
}
function __emval_new_object() {
    return __emval_register({});
}
function __emval_undefined() {
    return __emval_register(undefined);
}
function __emval_null() {
    return __emval_register(null);
}
function __emval_new_cstring(v) {
    return __emval_register(getStringOrSymbol(v));
}
function __emval_take_value(type, v) {
    type = requireRegisteredType(type, '_emval_take_value');
    v = type.fromWireType(v);
    return __emval_register(v);
}
var __newers = {}; // arity -> function
function craftEmvalAllocator(argCount) {
    /*This function returns a new function that looks like this:
    function emval_allocator_3(handle, argTypes, arg0Wired, arg1Wired, arg2Wired) {
        var argType0 = requireRegisteredType(HEAP32[(argTypes >> 2)], "parameter 0");
        var arg0 = argType0.fromWireType(arg0Wired);
        var argType1 = requireRegisteredType(HEAP32[(argTypes >> 2) + 1], "parameter 1");
        var arg1 = argType1.fromWireType(arg1Wired);
        var argType2 = requireRegisteredType(HEAP32[(argTypes >> 2) + 2], "parameter 2");
        var arg2 = argType2.fromWireType(arg2Wired);
        var constructor = _emval_handle_array[handle].value;
        var emval = new constructor(arg0, arg1, arg2);
        return emval;
    } */
    var args1 = ["requireRegisteredType", "HEAP32", "_emval_handle_array", "__emval_register"];
    var args2 = [requireRegisteredType, HEAP32, _emval_handle_array, __emval_register];
    var argsList = "";
    var argsListWired = "";
    for(var i = 0; i < argCount; ++i) {
        argsList += (i!==0?", ":"")+"arg"+i; // 'arg0, arg1, ..., argn'
        argsListWired += ", arg"+i+"Wired"; // ', arg0Wired, arg1Wired, ..., argnWired'
    }
    var invokerFnBody =
        "return function emval_allocator_"+argCount+"(handle, argTypes " + argsListWired + ") {\n";
    for(var i = 0; i < argCount; ++i) {
        invokerFnBody += 
            "var argType"+i+" = requireRegisteredType(HEAP32[(argTypes >> 2) + "+i+"], \"parameter "+i+"\");\n" +
            "var arg"+i+" = argType"+i+".fromWireType(arg"+i+"Wired);\n";
    }
    invokerFnBody +=
        "var constructor = _emval_handle_array[handle].value;\n" +
        "var obj = new constructor("+argsList+");\n" +
        "return __emval_register(obj);\n" +
        "}\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __emval_new(handle, argCount, argTypes) {
    requireHandle(handle);
    var newer = __newers[argCount];
    if (!newer) {
        newer = craftEmvalAllocator(argCount);
        __newers[argCount] = newer;
    }
    if (argCount === 0) {
        return newer(handle, argTypes);
    } else if (argCount === 1) {
        return newer(handle, argTypes, arguments[3]);
    } else if (argCount === 2) {
        return newer(handle, argTypes, arguments[3], arguments[4]);
    } else if (argCount === 3) {
        return newer(handle, argTypes, arguments[3], arguments[4], arguments[5]);
    } else if (argCount === 4) {
        return newer(handle, argTypes, arguments[3], arguments[4], arguments[5], arguments[6]);
    } else {
        // This is a slow path! (.apply and .splice are slow), so a few specializations are present above.
        return newer.apply(null, arguments.splice(1));
    }
}
// appease jshint (technically this code uses eval)
var global = (function(){return Function;})()('return this')();
function __emval_get_global(name) {
    name = getStringOrSymbol(name);
    return __emval_register(global[name]);
}
function __emval_get_module_property(name) {
    name = getStringOrSymbol(name);
    return __emval_register(Module[name]);
}
function __emval_get_property(handle, key) {
    requireHandle(handle);
    return __emval_register(_emval_handle_array[handle].value[_emval_handle_array[key].value]);
}
function __emval_set_property(handle, key, value) {
    requireHandle(handle);
    _emval_handle_array[handle].value[_emval_handle_array[key].value] = _emval_handle_array[value].value;
}
function __emval_as(handle, returnType) {
    requireHandle(handle);
    returnType = requireRegisteredType(returnType, 'emval::as');
    var destructors = [];
    // caller owns destructing
    return returnType.toWireType(destructors, _emval_handle_array[handle].value);
}
function parseParameters(argCount, argTypes, argWireTypes) {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        var argType = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
        a[i] = argType.fromWireType(argWireTypes[i]);
    }
    return a;
}
function __emval_call(handle, argCount, argTypes) {
    requireHandle(handle);
    var types = lookupTypes(argCount, argTypes);
    var args = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        args[i] = types[i].fromWireType(arguments[3 + i]);
    }
    var fn = _emval_handle_array[handle].value;
    var rv = fn.apply(undefined, args);
    return __emval_register(rv);
}
function lookupTypes(argCount, argTypes, argWireTypes) {
    var a = new Array(argCount);
    for (var i = 0; i < argCount; ++i) {
        a[i] = requireRegisteredType(
            HEAP32[(argTypes >> 2) + i],
            "parameter " + i);
    }
    return a;
}
function __emval_get_method_caller(argCount, argTypes) {
    var types = lookupTypes(argCount, argTypes);
    var retType = types[0];
    var signatureName = retType.name + "_$" + types.slice(1).map(function (t) { return t.name; }).join("_") + "$";
    var args1 = ["Runtime", "createNamedFunction", "requireHandle", "getStringOrSymbol", "_emval_handle_array", "retType"];
    var args2 = [Runtime, createNamedFunction, requireHandle, getStringOrSymbol, _emval_handle_array, retType];
    var argsList = ""; // 'arg0, arg1, arg2, ... , argN'
    var argsListWired = ""; // 'arg0Wired, ..., argNWired'
    for (var i = 0; i < argCount - 1; ++i) {
        argsList += (i !== 0 ? ", " : "") + "arg" + i;
        argsListWired += ", arg" + i + "Wired";
        args1.push("argType" + i);
        args2.push(types[1 + i]);
    }
    var invokerFnBody =
        "return Runtime.addFunction(createNamedFunction('" + signatureName + "', function (handle, name" + argsListWired + ") {\n" +
        "requireHandle(handle);\n" +
        "name = getStringOrSymbol(name);\n";
    for (var i = 0; i < argCount - 1; ++i) {
        invokerFnBody += "var arg" + i + " = argType" + i + ".fromWireType(arg" + i + "Wired);\n";
    }
    invokerFnBody +=
        "var obj = _emval_handle_array[handle].value;\n" +
        "return retType.toWireType(null, obj[name](" + argsList + "));\n" + 
        "}));\n";
    args1.push(invokerFnBody);
    var invokerFunction = new_(Function, args1).apply(null, args2);
    return invokerFunction;
}
function __emval_has_function(handle, name) {
    name = getStringOrSymbol(name);
    return _emval_handle_array[handle].value[name] instanceof Function;
}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
  // {{MODULE_ADDITIONS}}
