// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        
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
        console.log(data);

        _this.append(output);
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
            data["blocks"].push([]);

            for (var x = 0; x < 9; x++) {
                data["blocks"][y].push({
                    x: x,
                    y: y
                });
            }
        }

        return data;
    }
});