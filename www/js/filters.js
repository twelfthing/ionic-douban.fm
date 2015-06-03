angular.module("starter.filters", [])
    
    .filter("floatToTime", function () {
        return function (f, format) {
            if (undefined === f) return ''
            return parseInt(f/60) + ':' + (parseInt(f)%60 > 9?parseInt(f)%60:('0'+parseInt(f)%60));

        };
    })