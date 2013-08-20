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

//FIXME: add decomposition to be able to add getters in TRS
var Transform = exports.Transform = Object.create(Base, {
    _matrix: { value: null, writable: true },

    _dirty: { value: true, writable: true },

    _translation: { value: null, writable: true },
    _rotation: { value: null, writable: true },
    _scale: { value: null, writable: true },

    interpolateToTransform: {
        value: function(to, step, destination) {
            //step = 0.5;
            step = Utilities.easeOut(step);
            //debugger;
            Utilities.interpolateVec(this._translation, to._translation, step, destination._translation);
            Utilities.interpolateVec(this._scale, to._scale, step, destination._scale);
            Utilities.inverpolateAxisAngle(this._rotation, to._rotation, step, destination._rotation);
            //FIXME:breaks encapsulation
            destination._dirty = true;
        }
    },

    matrix: {
        get: function() {
            if (this._dirty) {
                if (this._matrix == null) {
                    this._matrix = mat4.create();
                }

                if (this._intermediateMatrices == null) {
                    this._intermediateMatrices = [];

                    this._intermediateMatrices.push(mat4.identity());   //idx: 0 tmp
                    this._intermediateMatrices.push(mat4.identity());   //idx: 1 tr
                    this._intermediateMatrices.push(mat4.identity());   //idx: 2 scale
                    this._intermediateMatrices.push(mat4.identity());   //idx: 3 rotation
                }

                mat4.identity(this._matrix);
                mat4.identity(this._intermediateMatrices[0]);

                mat4.set(this._intermediateMatrices[0], this._intermediateMatrices[1]); //tr
                mat4.set(this._intermediateMatrices[0], this._intermediateMatrices[2]); //scale
                mat4.set(this._intermediateMatrices[0], this._intermediateMatrices[3]); //rotation

                mat4.translate(this._intermediateMatrices[1], this._translation);
                mat4.scale(this._intermediateMatrices[2], this._scale);
                quat4.toMat4(this._rotation, this._intermediateMatrices[3]);

                mat4.multiply(this._matrix, this._intermediateMatrices[1]);
                mat4.multiply(this._matrix, this._intermediateMatrices[2]);
                mat4.multiply(this._matrix, this._intermediateMatrices[3]);

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
                var r = description.rotation;
                this.rotation = r ?  quat4.fromAngleAxis(r[3], vec3.createFrom(r[0],r[1],r[2])) : vec4.createFrom(0,0,0,0);
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

    copy: {
        value: function() {
            var transform = Object.create(Transform).init();

            if (this._translation) {
                transform.translation = vec3.createFrom(this._translation[0], this._translation[1], this._translation[2]);
            }

            if (this._scale) {
                transform.scale = vec3.createFrom(this._scale[0], this._scale[1], this._scale[2]);
            }

            if (this._rotation) {
                transform.rotation = quat4.create(this._rotation);
            }

            transform.matrix = mat4.create(this.matrix);
            return transform;
        }
    }

});
