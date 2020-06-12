import React from 'react';
import Popup from "reactjs-popup";
import './App.scss';


// Do a "ping" using HTTP (tests that server is alive)
function httpPing(address,callback,pingTimeout=500)
{
    function bad(){
      callback(false);
    }
    var http = new XMLHttpRequest();
    http.open('HEAD',address);
    http.onreadystatechange = function() {
        if (this.readyState == this.DONE) {
            callback(this.status != 404);
        }
    };
    http.send();
    var timer = setTimeout(bad,pingTimeout);
}

// Do a "ping" using using a trick found in image objects
function ping(address,callback,pingTimeout=500) {
    function good(){
      callback(true);
    }
    function bad(){
      callback(false);
    }
    var img = new Image();
    img.onload = good;
    img.onerror = good;
    if(address.indexOf('://')<0){
      img.src="http://" + address+'/?nocache="'+new Date().getTime();
    }else{
      img.src=address;
    }
    var timer = setTimeout(bad,pingTimeout);
}


class Service extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return (<div className="service">
      <a href={this.props.address} target="_blank"  rel="noopener noreferrer">
      <img src={this.props.icon} alt="{this.props.name}" height="32" />
      </a>
      </div>)
  }
}


class Device extends React.Component{
   constructor(props){
    super(props)
    this.props.isAlive=false;
    this.services=[];
    if ('services' in props){
      for(var i=0;i<props.services.length;i++){
        this.services.push(new Service(props.services[i]));
      }
    }
    this.startTimer();
  }

  doPing(){
    var self=this;
    function f(success){
      //console.log('ping response for '+self.props.address+' = '+success);
      self.props.isAlive=success;
    }
    ping(this.props.address,f);
  }

  startTimer(){
    var self=this;
    function f(){
      self.doPing();
    }
    setInterval(f,10000);
  }

  render(){
    const enabledClass=this.props.isAlive?'device tooltip':'device tooltip disabled';
    return (<div className={enabledClass}>
      <span className="tooltiptext"><span className="tooltipHeading">{this.props.label}</span><br />{this.props.address}<br />{this.props.macAddress}</span>
      <img src={this.props.icon} alt="" width="100" />
      <div className="caption">
        {this.props.label}
      </div>
      <div className="services">
        {this.services.map((service)=>service.render())}
      </div>
    </div>)
  }
}

  function handleClick(e) {    e.preventDefault();    console.log('The link was clicked.');  }

class AddDevice extends React.Component {
  render(){
    return (
      <div className="addDevice" onClick={handleClick}>+<br/></div>
    )
  }
}

class Devices extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }

  componentDidMount() {
    fetch("/devices.json")
      .then(res => res.json())
      .then(
        (res) => {
          var items=[];
          for(var i=0;i<res.length;i++){
            items.push(new Device(res[i]));
          }
          this.setState({
            isLoaded: true,
            items: items
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

    render(){
      return (<div>
        {this.state.items.map((device)=>device.render())}
        <AddDevice/>
        </div>
      )
    }
}

class EditDevice extends React.Component {
  render() {
    return (
    <div>
        <div className="dialogHeader">Edit Device</div>
        <button><img src="/laptop.png" alt="" height="50" />...</button><br />
        Name: <input type="text" name="name" value="my device" /><br />
        Address: <input type="text" name="address" value="127.0.0.1" /><br />
        MAC Address: <input type="text" name="macAddress" value="" /><br />
        Services: <div className="addServices"></div>
        <div className="buttonBar"><button>Save</button><button>Cancel</button></div>
    </div>
    );
  }
}

class ImageSelector extends React.Component {
  componentDidMount() {
    fetch("/services/")
      .then(res => res.json())
      .then(
        (res) => {
          console.log("xxx");
            console.log(res);
          this.setState({
            imagesArray: res
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    /*const images = this.state.imagesArray.map((object) => {
      return <img src={object.src} width="50px" />;
    });*/

    return (
      <div>
          <div className="dialogHeader">Select Icon</div>
      </div>
    );
  }

}

class Dialog extends React.Component {
//<ImageSelector />
  render() {
    if(false){
      return (
        <div className="dialog">
          <EditDevice />
        </div>
      );
    }
    return (<div/>);
  }
}

function App() {
  var showDialog=false;
  return (
    <div className="App">
    <Dialog visible="{showDialog}" />
    <svg>
      <defs>
        <filter id="everythingFilter">
          <feTurbulence type="turbulence" baseFrequency="0.05"
              numOctaves="2" result="turbulence"/>
          <feDisplacementMap in2="turbulence" in="SourceGraphic"
              scale="10" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      </svg>
      <header className={showDialog?"App-header distorted":"App-header"}>
      <Devices/>
      </header>
    </div>
  );
}

export default App;
