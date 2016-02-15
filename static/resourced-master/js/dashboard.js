var ResourcedMaster = ResourcedMaster || {};

ResourcedMaster.globals = {};

ResourcedMaster.globals.currentCluster = {};

ResourcedMaster.metrics = {};
ResourcedMaster.metrics.get = function(accessToken, metricID, options) {
    var path = '/api/metrics/' + metricID;
    var getParams = '';

    if('host' in options) {
        path = path + '/hosts/' + options.host;
    }
    if('shortAggrInterval' in options) {
        path = path + '/' + options.shortAggrInterval;
    }
    if('createdInterval' in options) {
        getParams = getParams + 'CreatedInterval=' + options.createdInterval;
    }

    $.ajax({
        url: path + '?' + getParams,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + window.btoa(accessToken + ':'));
        },
        success: options.successCallback || null
    });
};
ResourcedMaster.metrics.renderOneChart = function(accessToken, metricID, options) {
    options.successCallback = function(result) {
        if (result.constructor != Array) {
            result = [result];
        }

        options.containerDOM.highcharts({
            chart: {
                width: options.containerDOM.width(),
                height: options.height || ResourcedMaster.highcharts.defaultHeight,
                events: {
                    load: options.onLoad
                }
            },
            title: {
                text: options.title || ''
            },
            series: result
        });
    };

    ResourcedMaster.metrics.get(accessToken, metricID, options);
};
ResourcedMaster.metrics.renderOneChartAggr = function(accessToken, metricID, options) {
    options.successCallback = function(result) {
        if (result.constructor != Array) {
            result = [result];
        }

        options.containerDOM.highcharts({
            chart: {
                width: options.containerDOM.width(),
                height: options.height || ResourcedMaster.highcharts.defaultHeight,
                events: {
                    load: options.onLoad
                }
            },
            title: {
                text: ''
            },
            series: result
        });
    };

    ResourcedMaster.metrics.get(accessToken, metricID, options);
};
ResourcedMaster.metrics.getEventLines = function(accessToken, options) {
    var path = '/api/events/line';
    var getParams = '';

    if('createdInterval' in options) {
        getParams = getParams + 'CreatedInterval=' + options.createdInterval;
    }

    $.ajax({
        url: path + '?' + getParams,
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + window.btoa(accessToken + ':'));
        },
        success: options.successCallback || null
    });
};
ResourcedMaster.metrics.renderEventLinesOneChart = function(accessToken, options) {
    options.successCallback = function(result) {
        if (result.constructor != Array) {
            result = [result];
        }

        var xAxis = options.containerDOM.highcharts().xAxis[0];

        for (i = 0; i < result.length; i++) {
            var plotLine = {
                color: '#fff',
                width: 1,
                value: result[i].CreatedFrom,
                id: result[i].ID,
                dashStyle: 'longdashdot',
                label: {
                    text: result[i].Description,
                    style: {
                        color: '#fff'
                    }
                }
            };
            xAxis.addPlotBand(plotLine);
        }
    };

    ResourcedMaster.metrics.getEventLines(accessToken, options);
};

ResourcedMaster.highcharts = {};
ResourcedMaster.highcharts.defaultHeight = 300;

// ---------------------------------------
// Highchart Settings
// ---------------------------------------
// Highcharts.createElement('link', {
//     href: '//fonts.googleapis.com/css?family=Unica+One',
//     rel: 'stylesheet',
//     type: 'text/css'
// }, null, document.getElementsByTagName('head')[0]);

Highcharts.theme = {
    colors: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
    chart: {
        backgroundColor: {
            linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
            stops: [
                [0, '#2a2a2b'],
                [1, '#3e3e40']
            ]
        },
        style: {
            fontFamily: "'Lato', sans-serif"
        },
        plotBorderColor: '#606063',
        type: 'spline',
        animation: Highcharts.svg, // don't animate in old IE
        height: ResourcedMaster.highcharts.defaultHeight
    },
    title: {
        style: {
            color: '#E0E0E3',
            fontSize: '20px'
        }
    },
    subtitle: {
        style: {
            color: '#E0E0E3'
        }
    },
    xAxis: {
        gridLineColor: '#707073',
        labels: {
            style: {
                color: '#E0E0E3'
            }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        title: {
            style: {
                color: '#A0A0A3'
            }
        },
        type: 'datetime',
        dateTimeLabelFormats: { // don't display the dummy year
            month: '%e. %b',
            year: '%b'
        }
    },
    yAxis: {
        gridLineColor: '#707073',
        labels: {
            style: {
                color: '#E0E0E3'
            }
        },
        lineColor: '#707073',
        minorGridLineColor: '#505053',
        tickColor: '#707073',
        tickWidth: 1,
        title: {
            style: {
                color: '#A0A0A3'
            },
            text: ''
        }
    },
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
            color: '#F0F0F0'
        },
        shared: true,
        crosshairs: true
    },
    exporting: {
        enabled: false
    },
    plotOptions: {
        series: {
            dataLabels: {
                color: '#B0B0B3'
            },
            marker: {
                lineColor: '#333'
            }
        },
        boxplot: {
            fillColor: '#505053'
        },
        candlestick: {
            lineColor: 'white'
        },
        errorbar: {
            color: 'white'
        },
        spline: {
            marker: {
                enabled: true
            }
        }
    },
    legend: {
        itemStyle: {
            color: '#E0E0E3'
        },
        itemHoverStyle: {
            color: '#FFF'
        },
        itemHiddenStyle: {
            color: '#606063'
        }
    },
    credits: {
        style: {
            color: '#666'
        }
    },
    labels: {
        style: {
            color: '#707073'
        }
    },

    drilldown: {
        activeAxisLabelStyle: {
            color: '#F0F0F3'
        },
        activeDataLabelStyle: {
            color: '#F0F0F3'
        }
    },

    navigation: {
        buttonOptions: {
            symbolStroke: '#DDDDDD',
            theme: {
                fill: '#505053'
            }
        }
    },

    // scroll charts
    rangeSelector: {
        buttonTheme: {
            fill: '#505053',
            stroke: '#000000',
            style: {
                color: '#CCC'
            },
            states: {
                hover: {
                    fill: '#707073',
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                },
                select: {
                    fill: '#000003',
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                }
            }
        },
        inputBoxBorderColor: '#505053',
        inputStyle: {
            backgroundColor: '#333',
            color: 'silver'
        },
        labelStyle: {
            color: 'silver'
        }
    },

   navigator: {
        handles: {
            backgroundColor: '#666',
            borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
            color: '#7798BF',
            lineColor: '#A6C7ED'
        },
        xAxis: {
            gridLineColor: '#505053'
        }
    },

    scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043'
    },

    // special colors for some of the
    legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
    background2: '#505053',
    dataLabelsColor: '#B0B0B3',
    textColor: '#C0C0C0',
    contrastTextColor: '#F0F0F3',
    maskColor: 'rgba(255,255,255,0.3)'
};

Highcharts.setOptions(Highcharts.theme);