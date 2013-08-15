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

exports.Transform = Object.create(Base, {
    _matrix: { value: null, writable: true },

    _dirty: { value: true, writable: true },

    _translation: { value: null, writable: true },
    _rotation: { value: null, writable: true },
    _scale: { value: null, writable: true },


    //utility to move out of here and be shared with same code in animations
    interpolateVec: {
        value: function(from, to, step, destination) {
            for (i = 0 ; i < destination.length ; i++) {
                var v1 = from[i];
                var v2 = to[i];
                destination[i] = v1 + ((v2 - v1) * step);
            }
        }
    },

    easeInEaseOut: {
        value: function(x) {
            //x = x*2 -1;

            //actually, just ease out
            var t = x;
            var start = 0;
            var end = 1;

            t--;
            y =  end*(t * t * t + 1.) + start - 1.;
            y = -y;
            y = 1 - y;
            return y;

            /*
                        t *= 2;
                        var y;
                        if (t < 1.) {
                            y = end/2. * t * t + start - 1.;

                        } else {

                            t--;
                            y= -end/2. * (t*(t-2) - 1) + start - 1.;
                        }
                        y = -y;

                        y = 1 - y;
                        return y;
            */
/*
            t *= 2.;
            if (t < 1.)  {
                y = end/2 * t * t * t + start - 1.;
            } else {
                t -= 2;
                y = end/2*(t * t * t + 2) + start - 1.;
            }
*/
            return y;
        }
    },

    inverpolateAxisAngle : {
        value: function(from, to, step, destination) {
            var AXIS_ANGLE_INTERP = 0;
            var AXIS_ANGLE_INTERP_NAIVE = 1;
            var QUATERNION = 2;
            var interpolationType = QUATERNION;//AXIS_ANGLE_INTERP_NAIVE;
            var axisAngle1 = vec4.createFrom(from[0],from[1],from[2],from[3]);
            var axisAngle2 = vec4.createFrom(to[0],to[1],to[2],to[3]);
            if (interpolationType == AXIS_ANGLE_INTERP) {
                vec3.normalize(axisAngle1); //FIXME: do that upfront
                vec3.normalize(axisAngle2);
                //get the rotation axis from the cross product
                var rotAxis = vec3.create();
                vec3.cross(axisAngle1, axisAngle2, rotAxis);

                var lA1 = Math.sqrt(vec3.dot(axisAngle1,axisAngle1));
                var lA2 = Math.sqrt(vec3.dot(axisAngle2,axisAngle2));

                //now the rotation angle
                var angle = Math.acos(vec3.dot(axisAngle1,axisAngle2));
                var axisAngleRotMat = mat4.identity();
                mat4.rotate(axisAngleRotMat, angle * step, rotAxis);

                mat4.multiplyVec3(axisAngleRotMat, axisAngle1, rotAxis);
                vec3.normalize(rotAxis);

                var interpolatedAngle = axisAngle1[3]+((axisAngle2[3]-axisAngle1[3]) * step);
                quat4.fromAngleAxis(interpolatedAngle, rotAxis, destination);
            } else if (interpolationType == AXIS_ANGLE_INTERP_NAIVE) {
                //direct linear interpolation of components, to be considered for small angles
                for (i = 0 ; i < destination.length ; i++) {
                    var v1 = axisAngle1[i];
                    var v2 = axisAngle2[i];
                    axisAngle2[i] = v1 + ((v2 - v1) * step);
                }
                quat4.fromAngleAxis(axisAngle2[3], axisAngle2, destination);
            } else if (interpolationType == QUATERNION) {
                var k1 = quat4.create();
                var k2 = quat4.create();
                quat4.fromAngleAxis(from[3],
                    vec3.createFrom(from[0],from[1],from[2]), k1);
                quat4.fromAngleAxis(to[3],
                    vec3.createFrom(to[ 0],to[1],to[2]), k2);
                quat4.slerp(from, to, step, destination);
            }
        }
    },

    interpolateToTransform: {
        value: function(to, step, destination) {
            //step = 0.5;
            step = this.easeInEaseOut(step);
            //debugger;
            this.interpolateVec(this._translation, to._translation, step, destination._translation);
            this.interpolateVec(this._scale, to._scale, step, destination._scale);
            this.inverpolateAxisAngle(this._rotation, to._rotation, step, destination._rotation);
            //FIXME:breaks encapsulation
            destination._dirty = true;
        }
    },

    matrix: {
        get: function() {
            if (this._dirty) {
                var tr  = mat4.identity();
                var scale  = mat4.identity();
                var rotation  = mat4.identity();

                mat4.translate(tr, this._translation);
                mat4.scale(scale, this._scale);
                quat4.toMat4(this._rotation, rotation);

                this._matrix = mat4.identity();

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
    }
});
