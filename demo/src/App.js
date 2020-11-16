import React from 'react';
// import drugstore from './demo/subscribe-demo' // 订阅发布模式示范
// import './demo/eat-then'
import MyPromise from './demo/demo1'
import './App.css';
// const data = {
//   type: 'N95',
//   price: 30,
//   stock: 1000
// }
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'App'
    }
  }

  componentDidMount() {
    this.init()
  }

  init = () => {
    const promise1 = new MyPromise((resolve) => {
      request('https://www.baidu.com', function (error, response) {
        if (!error && response.statusCode === 200) {
          resolve('request1 success');
        }
      });
    });
    
    promise1.then(function(value) {
      console.log(value);
    });
  }

  say = name => {
    console.log(name)
  }

  handleClick = () => {
    // drugstore.publish('hasMask', data) 触发事件发布
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.handleClick}>click me</button>
      </div>
    )
  }
}

export default App;

