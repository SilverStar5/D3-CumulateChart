var svg, chart1, chart;

function cumulateChart(config) {
    // set the dimensions and margins of the graph
    var margin = { top: 150, right: 150, bottom: 0, left: 60 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    var x, y, focus, from, to;
    svg = d3.select(config.elemID)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.json(config.data, function(error, source) {
        if (error) throw error;

        from = new Date(config.month + "-01");
        from.setMonth(from.getMonth() - 7);
        from = Date.parse(from);
        to = Date.parse(config.month + "-01");

        var data = new Array();
        var zeroData = new Array();
        source.forEach(function(d) {
            let date = Date.parse(d.date + "-01");
            if (date >= from && date <= to) {
                data.push({
                    date: date,
                    value1: +d.value1,
                    value2: +d.value2
                });
            }
        });

        x = d3.scaleTime()
            .domain([from, to])
            .range([0, width]);

        y = d3.scaleLinear()
            .domain([0, d3.max(source, function(d) { return Math.max(+d.value2); })])
            .range([height, 0]);

        chart = svg.append("path")
            .datum(data)
            .attr("class", "typgraph-areae")
            .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(0) })
            )

        chart.datum(data)
            .transition()
            .duration(1000)
            .attr("class", "graph-area")
            .attr("d", d3.area()
                .x(function(d) { return x(d.date) })
                .y0(y(0))
                .y1(function(d) { return y(d.value2) })
            )

        makeTooltip(data);

        setTimeout(function(t) {
            showCircle(data);
            showTotalInfo(data);
        }, 1000);
    });

    function makeTooltip(data) {
        focus = svg.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("line")
            .attr("class", "hover-line")
            .attr("y1", 0)
            .attr("y2", height);

        focus.append("text").attr("class", "tooltip-label1").attr("x", -20).attr("y", -100);
        focus.append("text").attr("class", "tooltip-value1").attr("x", -20).attr("y", -70);
        focus.append("text").attr("class", "tooltip-value2").attr("x", 40).attr("y", -72);
        focus.append("text").attr("class", "tooltip-label2").attr("x", -20).attr("y", -50);
        focus.append("text").attr("class", "tooltip-value3").attr("x", -20).attr("y", -25);

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", width)
            .attr("height", height)
            .on("mouseover", function() {
                focus.style("display", null);
            })
            .on("mousemove", mousemove);

        function mousemove() {
            showTooltip(data, x.invert(d3.mouse(this)[0]));
        }
    }

    function showCircle(data) {
        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'node-circle')
            .attr('cx', function(d) {
                return x(d.date);
            })
            .attr('cy', function(d) {
                return y(d.value2);
            })
            .attr('r', 5);
    }

    function showTotalInfo(data) {
        let viewDate = new Date(to),
            d = data[bisectDate(data, viewDate, 1)],
            h = y.invert(d.value2);

        svg.append("text").attr("class", "totalo-label").attr("x", width + 10).attr("y", h).text("Cumulative Total");
        svg.append("text").attr("class", "total-value").attr("x", width + 10).attr("y", h - 20).text(d.value2 + "%");
    }

    function showTooltip(data, viewDate) {
        focus.style("display", null);

        let x0 = viewDate,
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value2) + ")");
        focus.select(".tooltip-label1").text("Numin Jade Fund Capital");
        focus.select(".tooltip-value1").text(d.value1 + "%");
        focus.select(".tooltip-value2").text(d3.timeFormat("%b %Y")(d.date));
        focus.select(".tooltip-label2").text("Cumulative Total");
        focus.select(".tooltip-value3").text(d.value2);

    }
}