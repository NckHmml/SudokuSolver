// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();

$(function () {
    $("#btnSolve").on("click", startSolve);

    $("[data-template]").each(function (index, element) {
        var _this = $(element),
            name = _this.attr("data-template"),
            template = $("[data-template-name='" + name + "']").html(),
            data = getDataForTemplate(name),
            output = Mustache.render(template, data);

        _this.append(output);

        $("select:not([data-x='']):not([data-y=''])").on("change", selectChanged);
    });

    function getDataForTemplate(name) {
        switch (name) {
            case "field":
                return generateFieldData();
            default:
                return null;
        }
    }

    function generateFieldData() {
        var data = {
            "blocks": []
        };

        for (var y = 0; y < 9; y++) {
            data.blocks.push([]);

            for (var x = 0; x < 9; x++) {
                data.blocks[y].push({
                    x: x,
                    y: y
                });
            }
        }

        return data;
    }

    function selectChanged() {
        $("select:not([data-x='']):not([data-y=''])").removeClass("invalid");

        var _this = $(this),
        x = _this.attr("data-x"),
        y = _this.attr("data-y"),
        blocks = [];

        for (var ix = 0; ix < 9; ix++) {
            blocks.push([]);
            for (var iy = 0; iy < 9; iy++) {
                blocks[ix].push(null);
            }
        }

        $("select:not([data-x='']):not([data-y=''])").each(function () {
            var x = $(this).attr("data-x"),
                y = $(this).attr("data-y");
            blocks[x][y] = $(this).val();
        });

        checkCells(blocks);
        checkRows(blocks);
        checkColumns(blocks);
    }

    function checkCells(blocks) {
        for (var val = 1; val <= 9; val++) {
            var count = [];

            for (var cell = 0; cell < 9; cell++) {
                count.push(0);

                var startx = cell % 3;
                var starty = cell - (cell % 3);
                startx *= 3;

                for (var x = 0; x < 3; x++) {
                    for (var y = 0; y < 3; y++) {
                        if (blocks[x + startx][y + starty] == val)
                            count[cell]++;
                    }
                }

                if (count[cell] > 1) {
                    for (var x = 0; x < 3; x++) {
                        for (var y = 0; y < 3; y++) {
                            $("select[data-x='" + (x + startx) + "'][data-y='" + (y + starty) + "']").addClass("invalid");
                        }
                    }
                }
            }
        }
    }

    function checkRows(blocks) {
        for (var val = 1; val <= 9; val++) {
            var count = [];

            for (var y = 0; y < 9; y++) {
                count.push(0);
                for (var x = 0; x < 9; x++) {
                    if (blocks[x][y] == val)
                        count[y]++;
                }
                if (count[y] > 1)
                    $("select[data-y='" + y + "']").addClass("invalid");
            }
        }
    }

    function checkColumns(blocks) {
        for (var val = 1; val <= 9; val++) {
            var count = [];

            for (var x = 0; x < 9; x++) {
                count.push(0);
                for (var y = 0; y < 9; y++) {
                    if (blocks[x][y] == val)
                        count[x]++;
                }
                if (count[x] > 1)
                    $("select[data-x='" + x + "']").addClass("invalid");
            }
        }
    }

    function startSolve() {
        var
            step = 0,
            iSolved = 0;
        do {
            var
                possibilities = [],
                blocks = [];

            // Construct the block and possibilities buffer
            for (var ix = 0; ix < 9; ix++) {
                possibilities.push([]);
                blocks.push([]);
                for (var iy = 0; iy < 9; iy++) {
                    possibilities[ix].push([]);
                    for (var val = 1; val <= 9; val++)
                        possibilities[ix][iy].push(val);
                    blocks[ix].push(null);
                }
            }

            // Fill the block buffer
            $("select:not([data-x='']):not([data-y=''])").each(function () {
                var x = $(this).attr("data-x"),
                    y = $(this).attr("data-y");
                blocks[x][y] = $(this).val();
            });
            // Iterate through all possible x,y and val
            for (var x = 0; x < 9; x++)
                for (var y = 0; y < 9; y++) {
                    if (blocks[x][y] != '') {
                        // Val already set, clear it
                        possibilities[x][y] = [];
                        continue;
                    }
                    for (var val = 1; val <= 9; val++) {
                        // Checks if a value is possible, else remove it from the array
                        if (!solveRow(blocks, x, y, val))
                            arrayRemoveItem(possibilities[x][y], val);
                        else if (!solveColumn(blocks, x, y, val))
                            arrayRemoveItem(possibilities[x][y], val);
                        else if (!solveCell(blocks, x, y, val))
                            arrayRemoveItem(possibilities[x][y], val);
                    }
                }

            iSolved = 0;

            // Check if a value only has 1 available spot in a cell
            for (var val = 1; val <= 1; val++) {
                for (var cell = 0; cell < 9; cell++) {
                    var spots = [];

                    var startx = cell % 3;
                    var starty = cell - (cell % 3);
                    startx *= 3;
                    for (var x = startx; x < startx + 3; x++)
                        for (var y = starty; y < starty + 3; y++) {
                            if (possibilities[x][y].indexOf(val) >= 0)
                                spots.push({
                                    x: x,
                                    y: y
                                });
                        }

                    if (spots.length === 1) {
                        var spot = spots[0];
                        iSolved++;
                        blocks[spot.x][spot.y] = val;
                        possibilities[spot.x][spot.y] = [];
                    }
                }
            }

            // A very simple solving step, checking where only 1 value is possible based on the buffer
            for (var x = 0; x < 9; x++)
                for (var y = 0; y < 9; y++) {
                    if (possibilities[x][y].length === 1) {
                        iSolved++;
                        blocks[x][y] = possibilities[x][y];
                        possibilities[x][y] = [];
                    }
                }

            for (var x = 0; x < 9; x++)
                for (var y = 0; y < 9; y++)
                    $("select[data-x='" + x + "'][data-y='" + y + "']").val(blocks[x][y]);
        }
        while (iSolved > 0);
    }

    function solveRow(blocks, x, y, val) {
        for (var ix = 0; ix < 9; ix++) {
            if (x === ix) continue;
            if (blocks[ix][y] == val) return false;
        }
        return true;
    }

    function solveColumn(blocks, x, y, val) {
        for (var iy = 0; iy < 9; iy++) {
            if (y === iy) continue;
            if (blocks[x][iy] == val) return false;
        }
        return true;
    }

    function solveCell(blocks, x, y, val) {
        var startx = x - (x % 3);
        var starty = y - (y % 3);

        for (var ix = startx; ix < startx + 3; ix++)
            for (var iy = starty; iy < starty + 3; iy++) {
                if (y === iy && x == ix) continue;
                if (blocks[ix][iy] == val) return false;
            }
        return true;
    }

    function arrayRemoveItem(array, item) {
        var index = array.indexOf(item);
        array.splice(index, 1);
    }
});