var Montage = require("montage").Montage;
var Component = require("montage/ui/component").Component;
var Utilities = require("runtime/utilities").Utilities;
var SceneHelper = require("runtime/scene-helper").SceneHelper;

exports.SceneViewer = Component.specialize({

    /**
     * If true the viewer will automatically switch from one animated viewPoint to another
     * @type {boolean}
     * @default true
     */
    automaticallyCyclesThroughViewPoints: { value: true, writable: true },

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

    handleStatusChange: {
        value: function(status, key, object) {
            if (status === "loaded") {
                if (this.scene.glTFElement.animationManager) {
                    this.scene.glTFElement.animationManager.delegate = this;
                    this.scene.removeOwnPropertyChangeListener("status", this);
                }
            }
        }
    },

    sceneDidChange: {
        value: function() {
            if (this.scene) {
                this.scene.addOwnPropertyChangeListener("status", this);
            }
            if (this.sceneView) {
                this.sceneView.scene = this.scene;
                this.sceneView.play();
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

    canDraw: {
        value: function() {
            return this.sceneView != null;
        }
    },

    draw: {
        value: function() {
        }
    },

    willDraw: {
        value: function() {
            if (this.sceneView) {
                this.sceneView.width = window.innerWidth;
                this.sceneView.height = window.innerHeight;
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
