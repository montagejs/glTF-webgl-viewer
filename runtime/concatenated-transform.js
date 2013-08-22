// Copyright (c) Fabrice ROBINET
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  * Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
//  * Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
//  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

require("runtime/dependencies/gl-matrix");
var Base = require("runtime/base").Base;
var Utilities = require("runtime/utilities").Utilities;

var ConcatenatedTransform = exports.ConcatenatedTransform = Object.create(Object.prototype, {
    _matrix: { value: null, writable: true },

    _dirty: { value: true, writable: true },

    _id: { value: 0, writable: true },

    _transforms: { value: null, writable: true },

    transforms: {
        get: function() {
            return this._transforms;
        },
        set: function(transforms) {
            var i;
            if (this._transforms) {
                for (i = 0 ; i < this._transforms.length ; i++) {
                    this._transforms[i].removeObserver(this);
                }
            }

            this._transforms = transforms;

            if (this._transforms) {
                for (i = 0 ; i < this._transforms.length ; i++) {
                    this._transforms[i].addObserver(this);
                }
            }
        }
    },

    transformDidChange: {
        value: function(transform) {
            this._dirty = true;
        }
    },

    matrix: {
        get: function() {
            if (this._dirty) {
                if (this.transforms != null) {
                    var length = this.transforms.length;
                    //to be quick
                    if (length === 2) {
                        mat4.multiply(this.transforms[0].matrix, this.transforms[1].matrix, this._matrix);
                    } else if (length === 1) {
                        mat4.set(this.transforms[0], this._matrix);
                    } else {

                       //FIXME: todo
                    }

                    this._dirty = false;
                }
            }

            return this._matrix;
        }
    },

    init: {
        value: function() {
            this.matrix = mat4.identity();
            return this;
        }
    }

});
