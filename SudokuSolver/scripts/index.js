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
        console.clear();
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
});