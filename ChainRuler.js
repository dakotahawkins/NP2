var universe = NeptunesPride.universe;

// Override initRuler() to use an array of stars rather than starA/starB
universe.initRuler = function () {
    universe.ruler = {};
    universe.ruler.stars = [];
    universe.ruler.eta = 0;
    universe.ruler.gateEta = 0;
    universe.ruler.gate = false;
    universe.ruler.ly = 0;
    universe.ruler.hsRequired = 0;
};

// Override updateRuler() to use an array of stars rather than starA/starB
universe.updateRuler = function (star) {
    universe.ruler.stars.push(star);

    var numStars = universe.ruler.stars.length;
    if (numStars < 2) return;

    var starA = universe.ruler.stars[numStars - 2];
    var starB = universe.ruler.stars[numStars - 1];

    var dist = universe.distance(starA.x, starA.y, starB.x, starB.y);
    var speed = universe.galaxy.fleet_speed;
    var eta = Math.floor(dist / speed) + 1;

    universe.ruler.eta += eta;
    universe.ruler.ly = String(8 * dist).substring(0, 4);
    universe.ruler.hsRequired = Math.max(Math.floor(8 * dist) - 2, 1);

    // If you've gone through any two gated stars, always treat the ruler as gated
    if (universe.starsGated(starA, starB)) {
        universe.ruler.gate = true;
        universe.ruler.gateEta += Math.floor(dist / (3 * speed)) + 1;
    } else {
        universe.ruler.gateEta += eta;
    }
};

// Find the map. Usually in Crux.crux.children[1] but that could change someday.
var map = Crux.crux.children.filter(
    function (widget) {
        return widget.hasOwnProperty("map");
    }
)[0].map;

// Override drawRuler() to use an array of stars rather than starA/starB
map.drawRuler = function () {
    var numStars = universe.ruler.stars.length;
    if (numStars < 2) return;

    for (i = 1; i < numStars; i++) {
        map.context.strokeStyle = "rgba(255, 255, 255, 0.5)";
        map.context.lineWidth = 8 * map.pixelRatio;
        map.context.beginPath();
        var x1 = map.worldToScreenX(universe.ruler.stars[i - 1].x);
        var y1 = map.worldToScreenY(universe.ruler.stars[i - 1].y);
        var x2 = map.worldToScreenX(universe.ruler.stars[i].x);
        var y2 = map.worldToScreenY(universe.ruler.stars[i].y);
        map.context.moveTo(x1, y1);
        map.context.lineTo(x2, y2);
        map.context.stroke();
    }
};

// Similarly, find the widget with onStartRuler so we can clear the stars.
var np = Crux.crux.children.filter(
    function (widget) {
        return widget.hasOwnProperty("onStartRuler");
    }
)[0];

// Override onStartRuler() to clear out the ruler.
np.old_onStartRuler = np.onStartRuler;
np.onStartRuler = function () {
    universe.initRuler();
    np.old_onStartRuler();
}

// Bind (or re-bind)? the v key to the ruler.
Mousetrap.bind(["v", "V"], function () { Crux.crux.trigger("start_ruler"); });

// For some reason this line must be doubled. WTF.
Crux.crux.on("start_ruler", np.onStartRuler);
Crux.crux.on("start_ruler", np.onStartRuler);
