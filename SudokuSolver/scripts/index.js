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

    $("#btnForce").on("click", startForce);

    $("#btnSave").on("click", save);

    $("#btnLoad").on("click", load);

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
            possibilities = [],
            blocks = [],
            step = 0,
            iSolved = 0;
        markPreset();
        setBlocks(blocks);
        do {
            possibilities = [];
            setPossibilities(blocks, possibilities);

            iSolved = 0;
            iSolved += solveSpotMethod(blocks, possibilities);
        }
        while (iSolved > 0);
        setFields(blocks);

        if (countEmptyBlocks(blocks) > 0) {
            $('#modalForce').modal();
        }
    }

    function setBlocks(blocks) {
        // Construct the block buffer
        for (var ix = 0; ix < 9; ix++) {
            blocks.push([]);
            for (var iy = 0; iy < 9; iy++) {
                blocks[ix].push(null);
            }
        }

        // Fill the block buffer
        $("select:not([data-x='']):not([data-y=''])").each(function () {
            var x = $(this).attr("data-x"),
                y = $(this).attr("data-y");
            blocks[x][y] = $(this).val();
        });
    }

    function setPossibilities(blocks, possibilities) {
        // Construct the possibilities buffer
        for (var ix = 0; ix < 9; ix++) {
            possibilities.push([]);
            for (var iy = 0; iy < 9; iy++) {
                possibilities[ix].push([]);
                for (var val = 1; val <= 9; val++)
                    possibilities[ix][iy].push(val);
            }
        }

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
    }

    function setFields(blocks) {
        for (var x = 0; x < 9; x++)
            for (var y = 0; y < 9; y++)
                $("select[data-x='" + x + "'][data-y='" + y + "']").val(blocks[x][y]);
    }

    function solveSpotMethod(blocks, possibilities) {
        var iSolved = 0;
        // Checking rows of possible values, then use them to exclude possibilities
        for (var val = 1; val <= 9; val++) {
            for (var cell = 0; cell < 9; cell++) {
                var spots = [];

                var startx = cell % 3;
                var starty = cell - (cell % 3);
                startx *= 3;

                for (var x = startx; x < startx + 3; x++) {
                    for (var y = starty; y < starty + 3; y++) {
                        if (possibilities[x][y].indexOf(val) >= 0)
                            spots.push({
                                x: x,
                                y: y
                            });
                    }
                }

                if (spots.length <= 1) continue;

                var spot = spots[0];
                var isRow = true,
                    isCol = true;

                for (var i = 1; i < spots.length; i++) {
                    isRow &= spots[i].y == spot.y;
                    isCol &= spots[i].x == spot.x;
                }

                if (isRow && !isCol) {
                    for (var x = 0; x < 9; x++) {
                        if (x >= startx && x < startx + 3)
                            continue;
                        arrayRemoveItem(possibilities[x][spot.y], val);
                    }
                } else if (isCol && !isRow) {
                    for (var y = 0; y < 9; y++) {
                        if (y >= starty && y < starty + 3)
                            continue;
                        arrayRemoveItem(possibilities[spot.x][y], val);
                    }
                }
            }
        }

        // Check if a value only has 1 available spot in a cell
        for (var val = 1; val <= 9; val++) {
            for (var cell = 0; cell < 9; cell++) {
                var spots = [];

                var startx = cell % 3;
                var starty = cell - (cell % 3);
                startx *= 3;
                for (var x = startx; x < startx + 3; x++) {
                    for (var y = starty; y < starty + 3; y++) {
                        if (possibilities[x][y].indexOf(val) >= 0)
                            spots.push({
                                x: x,
                                y: y
                            });
                    }
                }

                if (spots.length === 1) {
                    var spot = spots[0];
                    iSolved++;
                    blocks[spot.x][spot.y] = val;
                    possibilities[spot.x][spot.y] = [];
                }
            }
        }
        return iSolved;
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
        if (index < 0) return;
        array.splice(index, 1);
    }

    function startForce() {
        var
            possibilities = [],
            blocks = [],
            saveStart = [],
            emptycount,
            startWith = 0;
        setBlocks(blocks);
        emptycount = 999;
        saveStart = blocks;
        while (startWith < 9) {
            while (emptycount > 0) {
                if (emptycount == countEmptyBlocks(blocks))
                    break;
                emptycount = countEmptyBlocks(blocks);
                possibilities = []
                setPossibilities(blocks, possibilities);
                var $break = false;
                for (var x = 0; x < 9; x++) {
                    for (var y = 0; y < 9; y++) {
                        if (possibilities[x][y].length > startWith) {
                            blocks[x][y] = possibilities[x][y][startWith];
                            startWith = 0
                            $break = true;
                            break;
                        }
                    }
                    if ($break)
                        break;
                }

                var iSolved;
                do {
                    possibilities = [];
                    setPossibilities(blocks, possibilities);

                    iSolved = 0;
                    iSolved += solveSpotMethod(blocks, possibilities);
                }
                while (iSolved > 0);
            }

            if (countEmptyBlocks(blocks) === 0)
                break;
            blocks = saveStart;
            startWith++;
        }

        if (countEmptyBlocks(blocks) > 0) {
            $('#modalFailed').modal();
        } else {
            setFields(blocks);
        }
    }

    function countEmptyBlocks(blocks) {
        var count = 0;
        $.each(blocks, function (iRow) {
            $.each(blocks[iRow], function (iCell) {
                if (blocks[iRow][iCell] === '')
                    count++;
            });
        });
        return count;
    }

    function countPossibilities(possibilities) {
        var count = 0;
        $.each(possibilities, function (iRow) {
            $.each(possibilities[iRow], function (iCell) {
                count += possibilities[iRow][iCell].length;
            });
        });
        return count;
    }

    function save() {
        var blocks = [];
        setBlocks(blocks);
        $("#txtSave").val(JSON.stringify(blocks));
        $('#modalSave').modal();
    }

    function load() {
        var blocks = JSON.parse($("#txtLoad").val());
        setFields(blocks);
        markPreset();
    }

    function markPreset() {
        $("select:not([data-x='']):not([data-y=''])").each(function () {
            if ($(this).val() !== '') {
                $(this).addClass("original");
            } else {
                $(this).removeClass("original");
            }
        });
    }
});