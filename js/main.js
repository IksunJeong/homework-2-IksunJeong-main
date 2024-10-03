let female_data = [];
let male_data = [];
let chosenCountry = ['Turkey', 'Togo', 'Syria', 'Spain', 'South Korea'];

// Hint: This is a great place to declare your global variables 


// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function
    
   // This will load your CSV files and store them into two arrays.
    Promise.all([
        d3.csv('data/females_data.csv'),
        d3.csv('data/males_data.csv')
    ]).then(function (values) {
        female_data = processData(values[0]);
        male_data = processData(values[1]);
        drawLolliPopChart(chosenCountry[0]);

       // Hint: This is a good spot for data wrangling
        d3.select('#countrySelect').on('change', function() {
            chosenCountry = [this.value]; 
            drawLolliPopChart(chosenCountry[0]); 
        });
    });
});

//this processes the data from the .csv files
function processData(data) {
    return data.map(row => {
        let newRow = { Year: new Date(row.Year, 0, 1) }; 
        for (let key in row) {
            if (key !== 'Year') {
                newRow[key] = +row[key];
            }
        }
        return newRow;
    });
}

// Use this function to draw the lollipop chart.
function drawLolliPopChart(chosenCountry) {
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    d3.select('#chart').selectAll('*').remove(); //used so that the chart doesnt stay when chosen another chart
    
    const svg = d3.select('#chart')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const femaleRates = female_data.map(d => ({ year: d.Year, rate: d[chosenCountry] })).filter(d => d.rate !== undefined);
    const maleRates = male_data.map(d => ({ year: d.Year, rate: d[chosenCountry] })).filter(d => d.rate !== undefined);

    const xScale = d3.scaleTime()
    .domain([d3.timeYear.offset(d3.min(femaleRates, d => d.year), -1), d3.max(femaleRates, d => d.year)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max([...femaleRates, ...maleRates], d => d.rate)])
        .range([height, 0]);

    // x and y axis
    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .transition()
        .duration(1000)
        .call(d3.axisBottom(xScale).ticks(d3.timeYear.every(5)).tickFormat(d3.timeFormat("%Y")));

    svg.append('g')
        .transition()
        .duration(1000)
        .call(d3.axisLeft(yScale).ticks(10).tickFormat(d3.format(".2f")));
        
    const maleLines = svg.selectAll('.male-line')
        .data(maleRates);

    //male
    maleLines.enter()
        .append('line')
        .attr('class', 'male-line')
        .attr('x1', d => xScale(d.year) + 5)
        .attr('x2', d => xScale(d.year) + 5)
        .attr('y1', height)
        .attr('y2', height)
        .attr('stroke', 'blue')
        .transition()
        .duration(1000)
        .attr('y1', d => yScale(d.rate));

    const maleCircles = svg.selectAll('.male-circle')
        .data(maleRates);

    maleCircles.enter()
        .append('circle')
        .attr('class', 'male-circle')
        .attr('cx', d => xScale(d.year) + 5)
        .attr('cy', height)
        .attr('r', 5)
        .attr('fill', 'blue')
        .transition()
        .duration(1000)
        .attr('cy', d => yScale(d.rate));

    //female
    const femaleLines = svg.selectAll('.female-line')
        .data(femaleRates);

    femaleLines.enter()
        .append('line')
        .attr('class', 'female-line')
        .attr('x1', d => xScale(d.year) - 5)
        .attr('x2', d => xScale(d.year) - 5)
        .attr('y1', height)
        .attr('y2', height)
        .attr('stroke', 'pink')
        .transition()
        .duration(1000)
        .attr('y1', d => yScale(d.rate));

    const femaleCircles = svg.selectAll('.female-circle')
        .data(femaleRates)

    femaleCircles.enter()
        .append('circle')
        .attr('class', 'female-circle')
        .attr('cx', d => xScale(d.year) - 5)
        .attr('cy', height)
        .attr('r', 5)
        .attr('fill', 'pink')
        .transition()
        .duration(1000)
        .attr('cy', d => yScale(d.rate));


    //label for male and female employment rate
    svg.append('rect').attr('x', width - 100).attr('y', 10).attr('width', 15).attr('height', 15).attr('fill', 'pink');
    svg.append('text').attr('x', width - 80).attr('y', 22).text('Female Employment Rate');
    svg.append('rect').attr('x', width - 100).attr('y', 30).attr('width', 15).attr('height', 15).attr('fill', 'blue');
    svg.append('text').attr('x', width - 80).attr('y', 42).text('Male Employment Rate');

    //axis label
    svg.append('text').attr('transform', `translate(${width / 2}, ${height + margin.bottom - 10})`).attr('text-anchor', 'middle').text('Year');
    svg.append('text').attr('transform', 'rotate(-90)').attr('y', -margin.left + 20).attr('x', -height / 2).attr('text-anchor', 'middle').text('Employment Rate');
}
