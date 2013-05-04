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

var global = window;
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
      
        module.exports = factory(global);
        module.exports.Transform = module.exports;
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function () {
            return factory(root);
        });
    } else {
        // Browser globals
        factory(root);
    }
}(this, function (root) {
    var Base;
    if (typeof exports === 'object') {
        require("runtime/dependencies/gl-matrix");
        Base = require("runtime/base").Base;
    } else {
        Base = global.Base;
    }

    var Transform = Object.create(Base, {
        _matrix: { value: null, writable: true },

        _dirty: { value: true, writable: true },

        _translation: { value: null, writable: true },
        _rotation: { value: null, writable: true },
        _scale: { value: null, writable: true },

        matrix: {
            get: function() {
                if (this._dirty) {
                    var tr  = mat4.identity();
                    var scale  = mat4.identity();
                    var rotation  = mat4.identity();

                    mat4.translate(tr, this._translation);
                    mat4.scale(scale, this._scale);
                    //FIXME: the alloc to get the axis is unfortunate here...
                    mat4.rotate(rotation, this._rotation[3], vec3.createFrom(this._rotation[0],this._rotation[1],this._rotation[2]));

                    if (!this._matrix) {
                        this._matrix = mat4.identity();
                    }

                    mat4.multiply(this._matrix, tr);
                    mat4.multiply(this._matrix, rotation);
                    mat4.multiply(this._matrix, scale);

                    this._dirty = false;
                }

                return this._matrix;
            },
            set: function(value ) {
                this._matrix = value;
                this._dirty = false;
            }
        },

        translation : {
            set: function(value ) {
                this._translation = value;
                this._dirty = true;
            }
        },

        rotation : {
            set: function(value ) {
                this._rotation = value;
                this._dirty = true;
            }
        },

        scale : {
            set: function(value ) {
                this._scale = value;
                this._dirty = true;
            }
        },

        initWithDescription: {
            value: function(description) {
                this.__Base_init();

                if (description.matrix) {
                    this.matrix = mat4.create(description.matrix);
                } else if (description.translation || description.rotation || description.scale) {
                    this.translation = description.translation ? vec3.create(description.translation) : vec3.createFrom(0,0,0);
                    this.rotation = description.rotation ? vec4.create(description.rotation) : vec4.createFrom(0,0,0,0);
                    this.scale = description.scale ? vec3.create(description.scale) : vec3.createFrom(1,1,1);
                } else {
                    this.matrix = mat4.identity();
                }
                return this;
            }
        },

        init: {
            value: function() {
                this.__Base_init();
                this.translation = vec3.createFrom(0,0,0);
                this.rotation = vec4.createFrom(0,0,0,0);
                this.scale = vec3.createFrom(1,1,1);

                this.matrix = mat4.identity();
                return this;
            }
        },

    });

    if(root) {
        root.Transform = Transform;
    }

    return Transform;

}));