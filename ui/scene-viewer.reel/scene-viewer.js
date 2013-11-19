var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;
var Utilities = require("runtime/utilities").Utilities;
var SceneHelper = require("runtime/scene-helper").SceneHelper;

exports.SceneViewer = Component.specialize({

    /**
     * The Scene Object
     * @type {Object}
     */
    scene: {
        get: function() {
            return this._scene;
        },
        set: function(value) {
            if (value != this._scene) {
                this._scene = value;
                this.sceneDidChange();
            }
        }
    },

    /**
     * View that performs rendering of the Scene
     * @type {Object}
     */
    sceneView: {
        get: function() {
            return this.templateObjects ? this.templateObjects.sceneView : null;
        }
    },

    /**
     * If true the viewer will automatically switch from one animated viewPoint to another
     * @type {boolean}
     * @default true
     */
    automaticallyCyclesThroughViewPoints: { value: true, writable: true },

    play: {
        value: function() {
            if (this.sceneView) {
                this.sceneView.play();
            }
        }
    },

    pause: {
        value: function() {
            if (this.sceneView) {
                this.sceneView.pause();
            }
        }
    },

    stop: {
        value: function() {
            if (this.sceneView) {
                this.sceneView.stop();
            }
        }
    },

    /* private */

    _fillViewport: { value: true },

    _scene: { value: null, writable: true },

    constructor: {
        value: function SceneViewer () {
            this.super();
        }
    },

    fillViewport: {
        get: function() {
            return this._fillViewport;
        },
        set: function(value) {
            if (value && ! this._fillViewport) {
                window.addEventListener("resize", this, true);
            } else if (! value && this._fillViewport) {
                window.removeEventListener("resize", this, true);
            }
            this._fillViewport = value;
        }
    },


    /* internal montage framework + callbacks from various delegates */

    _sceneDidLoad: {
        value: function(scene) {
            if (scene.glTFElement) {
                if (this.scene.glTFElement.animationManager) {
                    if (this.scene.glTFElement.animationManager) {
                        this.scene.glTFElement.animationManager.delegate = this;
                    }
                }
            }
        }
    },

    handleStatusChange: {
        value: function(status, key, object) {
            if (status === "loaded") {
                this._sceneDidLoad(object);
                //Work-around
                var self = this;
                setTimeout(function() {
                    self.scene.removeOwnPropertyChangeListener("status", self);
                }, 1);

            }
        }
    },

    sceneDidChange: {
        value: function() {
            if (this.scene) {
                if (this.scene.isLoaded()) {
                    this._sceneDidLoad(this.scene);
                } else {
                    this.scene.addOwnPropertyChangeListener("status", this);
                }

            }
            if (this.sceneView) {
                this.sceneView.scene = this.scene;
            }
        }
    },

    sceneTimeWillChange: {
        value: function(animation, upcomingSceneTime) {

        }
    },

    sceneTimeDidChange: {
        value: function(animation) {

            if (this.scene == null)
                return;
            if (this.scene.glTFElement == null) {
                return;
            }

            var endTime = this.scene.glTFElement.endTime;
            if ((endTime !== -1) && (this.sceneView != null)) {
                var animationManager = this.scene.glTFElement.animationManager;
                if (animationManager.sceneTime / 1000. > endTime) {
                    if (this.automaticallyCyclesThroughViewPoints == true) {
                        var viewPointIndex = this.sceneView._viewPointIndex; //_viewPointIndex is private in view, we could actually put/access this info from scene
                        var viewPoints = SceneHelper.getViewPoints(this.scene);
                        if (viewPoints.length > 0) {
                            var nextViewPoint;
                            var checkIdx = 0;
                            do {
                                animationManager.sceneTime = 0;
                                checkIdx++;
                                viewPointIndex = ++viewPointIndex % viewPoints.length;
                                nextViewPoint = viewPoints[viewPointIndex];
                            } while ((checkIdx < viewPoints.length) && (animationManager.nodeHasAnimatedAncestor(nextViewPoint.glTFElement) == false));
                            this.sceneView.viewPoint = nextViewPoint;
                        }
                    }
                }
            }
        }
    },

    templateDidLoad:{
        value:function () {
            //we ensure that we'll have the scene propagated to view by calling sceneDidChange() in templateDidLoad
            this.sceneDidChange();
            this.needsDraw = true;
        }
    },

    enterDocument: {
        value: function(firstTime) {
            if (this.fillViewport) {
                window.addEventListener("resize", this, true);
            }
        }
    },

    exitDocument: {
        value: function() {
            if (this.fillViewport) {
                window.removeEventListener("resize", this, true);
            }
        }
    },

    draw: {
        value: function() {
        }
    },

    willDraw: {
        value: function() {
            if (this.sceneView) {
                var computedStyle = window.getComputedStyle(this.element, null);

                var w = parseInt(computedStyle["width"]);
                var h = parseInt(computedStyle["height"]);

                this.sceneView.width = w;
                this.sceneView.height = h;
                this.sceneView.needsDraw = true;
            }
        }
    },

    /* dom */

    captureResize: {
        value: function(evt) {
            this.needsDraw = true;
        }
    }

});
