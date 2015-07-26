var React = require('react');
var Circle = require('./Circle.react');
var BubbleChartStore = require('../stores/BubbleChartStore');
var d3 = require('d3');
var Utils = require('../utils/WebAPIUtils');
var D3Utils = require('../utils/D3Utils');
var XAxis = require('./XAxis.react');
var YAxis = require('./YAxis.react');
var Legend = require('./Legend.react');
var D3ServerAction = require('../actions/D3ServerAction');


var CHANGE_EVENT="change";

var BubbleChart = React.createClass({
  getInitialState: function(){

    // get data from server.
    //D3ServerAction.readyToReceive(this.props.id);
    
    return{
      bars: [],//BubbleChartStore.getAll(this.props.id),
      width: this.props.width,
      height: this.props.height,
      sorted: 0,
      start_date: "12/18/2013 00:00",
      end_date: "12/19/2013 00:00"
    };
  },
  getDefaultProps: function(){
    return {
      width: '500',
      height: '200',
    };
  },
  // componentWillMount: function(){

  // },
  updateDimensions: function(){
    setTimeout(function(){
      var el = React.findDOMNode(this);
      var d3node = d3.select(el);
      //console.log("AND HERE ", d3node.node().parentNode.offsetWidth);
      this.setState({width: d3node.node().parentNode.offsetWidth});
    }.bind(this),500);  
  },
  setupChart: function(){
    var el = React.findDOMNode(this);
    var d3node = d3.select(el);
    var parentNode = d3node.node().parentNode;

    this.state.tooltip = D3Utils.setupTooltip(parentNode);
    this.state.width = parentNode.offsetWidth;
    d3node.select('g')
      .attr("transform", "translate(" + 20 + "," + 20 + ")");
  },
  componentWillMount: function(){
    console.log("HERE "+ this.props.id)
    D3ServerAction.readyToReceiveBubble(this.props.id, this.state.start_date, this.state.end_date);
    //Utils.getServerData(this.props.id);
  },
  componentDidMount: function(){
    BubbleChartStore.addChangeListener(this._onChange);
    /**
    When creating callbacks in JavaScript, you usually need to explicitly 
    bind a method to its instance such that the value of this is correct. 
    With React, every method is automatically bound to its component instance. 
    React caches the bound method such that it's extremely CPU and memory efficient. 
    It's also less typing!

    That's why you don't need to do , this.updateDimensions.bind(this)
    */
    window.addEventListener("resize", this.updateDimensions);
    // need this to re-render after we change the width
    this.setupChart();
    this._onChange();
  },
  setup_scales: function(domains){

    var x = d3.scale.linear()
       .range([0, this.state.width - 50])
       .domain([0, domains.domains.y[1]]);


    var y = d3.scale.linear()
      .range([20, this.state.height - 40])
      .domain(domains.domains.x);

    return {x: x,y: y};
  },
  componentDidUpdate: function(){
    if(this.state.bars){
      this.setupChart();
    }
  },
  _onClick: function(){
    //sorting.
    this.setState({
      sorted: Math.abs(this.state.sorted  - 1),
    })
  },
  render: function () {
    var svgStyle = {
      width: this.state.width,
      height: this.state.height,
    };
    if(this.state.bars && this.state.bars.length > 0){

        var setup = D3Utils.calculatePosition(this.state.width, this.state.height, this.state.bars, "doc_count", "key");
        var colors = D3Utils.calculateColor([0, 500, 1000], ["red", "yellow", "green"]);
        // setup.domains.x[1] is the maximum x;
        var radius = D3Utils.calculateRadius([0, setup.domains.x[1]], [1, 20]);
        var scales = this.setup_scales(setup);
        
        var Circles = this.state.bars.map(function(bar, i) {
            return (<Circle key={bar.key} data={bar} domains={setup} scales={scales} radius={radius} color={colors} tooltip={this.state.tooltip} sorted={this.state.sorted}/>);
        }, this);

        var LegendItems = colors.domain().map(function(color, index){
          return  (<Legend data={color} colors={colors} width={this.state.width} index={index}/>)
        }, this);
        //console.log("ERROR?FF")
        return (
          <div style={{width:'100%'}}>
            <button onClick={this._onClick}>SORT</button>
            <svg style={svgStyle}>            
              <g className="graph">
                {{Circles}}
                <XAxis height={this.state.height} x={scales.x} sorted={this.state.sorted}/>
                <YAxis width={this.state.width} y={scales.y} sorted={this.state.sorted}/>
                <g class="legend">
                  {{LegendItems}}
                </g>
              </g>
            </svg>
          </div>
        );
    } else {
      return (<div></div>);
    }
  },
  _onChange: function(){
    this.setState({
       bars: BubbleChartStore.getAll(this.props.id)
     });
  }
});

module.exports = BubbleChart;