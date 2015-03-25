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
    }

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    }

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    }
})();
$(function () {
    $("#btnSolve").on("click", startSolve);

    $("#btnForce").on("click", startForce);

    $("#btnSave").on("click", save);

    $("#btnLoad").on("click", load);

    // Mustache template renderer
    $("[data-template]").each(function (index, element) {
        var _this = $(element),
            name = _this.attr("data-template"),
            template = $("[data-template-name='" + name + "']").html(),
            data = getDataForTemplate(name),
            output = Mustache.render(template, data);

        _this.append(output);

        // Bind the on change event
        $("input[type='number']:not([data-x='']):not([data-y=''])").on("change", selectChanged);
    });

    // Get template data
    function getDataForTemplate(name) {
        switch (name) {
            case "field":
                return generateFieldData();
            default:
                return null;
        }
    }

    // Create empty block buffer for mustache templating
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

    // Input select change handler
    function selectChanged() {
        // Clear all invallid classes
        $("input[type='number']:not([data-x='']):not([data-y=''])").removeClass("invalid");

        // Create empty block buffer
        var _this = $(this),
            blocks = [];
        for (var ix = 0; ix < 9; ix++) {
            blocks.push([]);
            for (var iy = 0; iy < 9; iy++) {
                blocks[ix].push(null);
            }
        }
        // Set block buffer
        $("input[type='number']:not([data-x='']):not([data-y=''])").each(function () {
            var x = $(this).attr("data-x"),
                y = $(this).attr("data-y");
            blocks[x][y] = $(this).val();
        });

        // Checks
        checkCells(blocks);
        checkRows(blocks);
        checkColumns(blocks);
    }

    // Check all cells and add the invalid class where needed
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
                            $("input[data-x='" + (x + startx) + "'][data-y='" + (y + starty) + "']").addClass("invalid");
                        }
                    }
                }
            }
        }
    }

    // Check all rows and add the invalid class where needed
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
                    $("input[data-y='" + y + "']").addClass("invalid");
            }
        }
    }

    // Check all columns and add the invalid class where needed
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
                    $("input[data-x='" + x + "']").addClass("invalid");
            }
        }
    }

    // Solving method
    function startSolve() {
        var
            possibilities = [],
            blocks = [],
            iSolved = 0
            xSolved = 0;
        markPreset();
        setBlocks(blocks);
        // Loop while it is able to solve
        do {
            iSolved = 0;

            possibilities = [];
            iSolved += solveSpotMethod(blocks, possibilities);
            possibilities = [];
            iSolved += solveXwing(blocks, possibilities);
        }
        while (iSolved > 0);
        setFields(blocks);

        // If the simple methode failed, ask the user if he wants to continue with a bruteforce method
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
        $("input[type='number']:not([data-x='']):not([data-y=''])").each(function () {
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
                for (var val = 1; val <= 9; val++) {
                    possibilities[ix][iy].push(val);
                }
            }
        }

        // Iterate through all possible x,y and val
        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                if (blocks[x][y] !== '') {
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
    }

    // Set the html inputs to the block data
    function setFields(blocks) {
        for (var x = 0; x < 9; x++)
            for (var y = 0; y < 9; y++)
                $("input[data-x='" + x + "'][data-y='" + y + "']").val(blocks[x][y]);
    }

    // Simple solve spot method, simply check for a spot with 1 unique possibility
    function solveSpotMethod(blocks, possibilities) {
        setPossibilities(blocks, possibilities);
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
                    isRow &= spots[i].y === spot.y;
                    isCol &= spots[i].x === spot.x;
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
                    blocks[spot.x][spot.y] = val;
                    possibilities[spot.x][spot.y] = [];
                    return 1;
                }
            }
        }

        return 0;
    }

    // More advanced xwing method
    function solveXwing(blocks, possibilities) {        
        setPossibilities(blocks, possibilities);

        applyXwing(blocks, possibilities);

        for (var x = 0; x < 9; x++) {
            for (var y = 0; y < 9; y++) {
                if (possibilities[x][y].length === 1) {
                    blocks[x][y] = possibilities[x][y][0];
                    return 1;
                }
            }
        }

        return 0;
    }

    // Row check
    function solveRow(blocks, x, y, val) {
        for (var ix = 0; ix < 9; ix++) {
            if (x === ix) continue;
            if (blocks[ix][y] == val) return false;
        }
        return true;
    }

    // Column check
    function solveColumn(blocks, x, y, val) {
        for (var iy = 0; iy < 9; iy++) {
            if (y === iy) continue;
            if (blocks[x][iy] == val) return false;
        }
        return true;
    }

    // Cell check
    function solveCell(blocks, x, y, val) {
        var startx = x - (x % 3);
        var starty = y - (y % 3);

        for (var ix = startx; ix < startx + 3; ix++) {
            for (var iy = starty; iy < starty + 3; iy++) {
                if (y === iy && x == ix) continue;
                if (blocks[ix][iy] == val) return false;
            }
        }
        return true;
    }

    // Removes a specific item from an array
    function arrayRemoveItem(array, item) {
        var index = array.indexOf(item);
        if (index < 0) return;
        array.splice(index, 1);
    }

    // Start the bruteforcing method
    function startForce() {
        var blocks = [],
            possibilities = [];
        setBlocks(blocks);
        setPossibilities(blocks, possibilities);

        if (!forceStep(blocks)) {
            // If no solution found, notify user
            $('#modalFailed').modal();
        } else {
            // If solution found, set field data
            setFields(blocks);
        }
    }

    // The bruteforce method
    function forceStep(blocks) {
        var emptycount = 999,
            possibilities = [],
            saveStart = blocks,
            iSolved;

        while (emptycount > 0) {
            // Break to prevent infinite loop when its imposible to guess
            if (emptycount == countEmptyBlocks(blocks))
                break;
            emptycount = countEmptyBlocks(blocks);
            possibilities = [];
            setPossibilities(blocks, possibilities);
            var $break = false;
            for (var x = 0; x < 9; x++) {
                for (var y = 0; y < 9; y++) {
                    if (possibilities[x][y].length > 0) {
                        blocks[x][y] = possibilities[x][y][0];
                        $break = true;
                        break;
                    }
                }
                if ($break)
                    break;
            }

            // Apply the normal solving sequence per bruteforce step
            do {
                iSolved = 0;

                possibilities = [];
                iSolved += solveSpotMethod(blocks, possibilities);
                possibilities = [];
                iSolved += solveXwing(blocks, possibilities);
            }
            while (iSolved > 0);

            if (countEmptyBlocks(blocks) === 0) {
                // Return when solved
                return true;
            }
            blocks = saveStart;
        }
        return false;
    }

    // Counts non-filled blocks
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

    // Counts the possibilities in the buffer
    function countPossibilities(possibilities) {
        var count = 0;
        $.each(possibilities, function (iRow) {
            $.each(possibilities[iRow], function (iCell) {
                count += possibilities[iRow][iCell].length;
            });
        });
        return count;
    }

    // Create a save string and show the popup
    function save() {
        var blocks = [];
        setBlocks(blocks);
        $("#txtSave").val(JSON.stringify(blocks));
        $('#modalSave').modal();
    }

    // Load in data from the load popup
    function load() {
        var blocks = JSON.parse($("#txtLoad").val());
        $("input[type='number']:not([data-x='']):not([data-y=''])").removeClass("invalid");
        setFields(blocks);
        markPreset();
    }

    // Mark preset data green, by adding a class
    function markPreset() {
        $("input[type='number']:not([data-x='']):not([data-y=''])").each(function () {
            if ($(this).val() !== '') {
                $(this).addClass("original");
            } else {
                $(this).removeClass("original");
            }
        });
    }

    // Xwing solving method
    function applyXwing(blocks, possibilities) {
        // Apply xwing rowbased
        for (var val = 1; val <= 9; val++) {
            var xwing = [];
            for (var y = 0; y < 9; y++) {
                var count = 0;
                for (var x = 0; x < 9; x++) {
                    if (possibilities[x][y].indexOf(val) !== -1) {
                        count++;
                    }
                }
                if (count === 2) {
                    xwing.push({
                        y: y,
                        val: val
                    });
                }
            }

            if (xwing.length === 2) {
                // Found valid xwing
                var val = xwing[0].val;

                // Search the columns to exclude the val in
                for (var x = 0; x < 9; x++)
                {
                    var hasVal1 = possibilities[x][xwing[0].y].indexOf(val) !== -1;
                    var hasVal2 = possibilities[x][xwing[1].y].indexOf(val) !== -1;

                    if (hasVal1 && hasVal2) {
                        for (var y = 0; y < 9; y++) {
                            if (y === xwing[0].y || y === xwing[1].y) continue;
                            arrayRemoveItem(possibilities[x][y], val);
                        }
                    }
                }
            }
        }

        // Apply xwing collbased
        for (var val = 1; val <= 9; val++) {
            var xwing = [];
            for (var x = 0; x < 9; x++) {
                var count = 0;
                for (var y = 0; y < 9; y++) {
                    if (possibilities[x][y].indexOf(val) !== -1) {
                        count++;
                    }
                }
                if (count === 2) {
                    xwing.push({
                        x: x,
                        val: val
                    });
                }
            }

            if (xwing.length === 2) {
                // Found valid xwing
                var val = xwing[0].val;

                // Search the columns to exclude the val in
                for (var y = 0; y < 9; y++) {
                    var hasVal1 = possibilities[xwing[0].x][y].indexOf(val) !== -1;
                    var hasVal2 = possibilities[xwing[1].x][y].indexOf(val) !== -1;

                    if (hasVal1 && hasVal2) {
                        for (var x = 0; x < 9; x++) {
                            if (x === xwing[0].x || x === xwing[1].x) continue;
                            arrayRemoveItem(possibilities[x][y], val);
                        }
                    }
                }
            }
        }
    }
});