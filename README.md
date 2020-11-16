# 详解Promise/Promise/A+

## 我们什么时候要用promise

### 异步场景（isLogin => userInfo or login）

调用判断用户是否登录， 根据返回值再做获取用户信息还是跳去登录界面

### 并发场景

比如多个图表同时展示，每个图表走不同到接口，需要等所有数据返回后，同时渲染处理。

### 异步接口
为啥要强调是异步接口，因为有些请求可以设置同步的
```
XMLHttpRequest.open()
初始化 HTTP 请求参数
语法
open(method, url, async, username, password)
```

async 参数指示请求使用应该异步地执行。如果这个参数是 false，请求是同步的，后续对 send() 的调用将阻塞，直到响应完全接收。
如果这个参数是 true 或省略，请求是异步的，且通常需要一个 onreadystatechange 事件句柄。

举例-同步方式
```
var xmlhttp=newXMLHttpRequestObj ();
xmlhttp.open('post','xxx.asp?s=dc',false);
xmlhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
xmlhttp.send(true);
alert('do something.....')
```
举例-异步方式
```
var sendStr='?a=1&b=2'; //url 的参数
var xmlhttp=newXMLHttpRequestObj ();
xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4){    
        if(xmlhttp.status==200){
           alert(xmlhttp.responseText);
            //other.......
        }
    }
}
xmlhttp.open('post','xxx.asp',true);
xmlhttp.setRequestHeader('Content-type','application/x-www-form-urlencoded');
xmlhttp.send(sendStr);
```

## 链式调用的场景？

### Object.keys(obj).map().join().split()

对象的方法都返回的一个实例类型，该实例类型都有一些方法可以调用

### jq的链式调用

```
$('input[type="button"]')
    .eq(0).click(function() {
        alert('点击我!');
}).end().eq(1)
.click(function() {
    $('input[type="button"]:eq(0)').trigger('click');
}).end().eq(2)
.toggle(function() {
    $('.aa').hide('slow');
}, function() {
    $('.aa').show('slow');
});
```

比如如上代码，先选择type类型为button的所有DOM，然后再选择第一个…

我们自然想到每次其实就是返回选择后的结果，在js里面有什么东西可以指代这个吗？
如果你想到this就对了。

jq的方法都是挂在原型的，那么如果我们每次在内部方法返回this，也就是返回实例对象，那么我们就可以继续调用原型上的方法了，这样的就节省代码量，提高代码的效率，代码看起来更优雅。

但是也会出现一个问题：所有对象的方法返回的都是对象本身，也就是说没有返回值，所以这种方法不一定在任何环境下都适合。


### promise.then().then().catch()

promise的链式调用如：

```
function start() {  
    return new Promise((resolve, reject) => {  
      resolve('start');  
    });  
  }  

  start()  
    .then(data => {  
      console.log('result of start: ', data);  
      return Promise.resolve(1); // p1  
    })  
    .then(data => {  
      console.log('result of p1: ', data);  
      return Promise.reject(2); // p2  
    })  
    .then(data => {  
      console.log('result of p2: ', data);  
      return Promise.resolve(3); // p3  
    })  
    .catch(ex => {  
      console.log('ex: ', ex);  
      return Promise.resolve(4); // p4  
    })  
    .then(data => {  
      console.log('result of p4: ', data);  
    });  

```

Promise的then其实都是实现了 thenable 接口，每个 then 都返回一个新的promise，除了第一个是start的实例其他的已经不是一个promise了。


## promise哪里是异步？

```
new premise((resolve, reject) => {
  console.log(11)
  resolve('promise.resolve('这里面的才是异步')')
  console.log(222)
})
```

## unhandledrejection

当一个 error 没有被处理会发生什么？例如，我们忘了在链的尾端附加 .catch，像这样：

```
new Promise(function() {
  noSuchFunction(); // 这里出现 error（没有这个函数）
})
  .then(() => {
    // 一个或多个成功的 promise 处理程序（handler）
  }); // 尾端没有 .catch！
```
当发生一个常规的错误（error）并且未被 try..catch 捕获时会发生什么？脚本死了，并在控制台（console）中留下了一个信息。对于在 promise 中未被处理的 rejection，也会发生类似的事儿。

JavaScript 引擎会跟踪此类 rejection，在这种情况下会生成一个全局的 error。如果你运行上面这个代码，你可以在控制台（console）中看到。

在浏览器中，我们可以使用 unhandledrejection 事件来捕获这类 error：

```
window.addEventListener('unhandledrejection', function(event) {
  // 这个事件对象有两个特殊的属性：
  alert(event.promise); // [object Promise] - 生成该全局 error 的 promise
  alert(event.reason); // Error: Whoops! - 未处理的 error 对象
});

new Promise(function() {
  throw new Error("Whoops!");
}); // 没有用来处理 error 的 catch
```

这个事件是 HTML 标准 的一部分。

如果出现了一个 error，并且在这儿没有 .catch，那么 unhandledrejection 处理程序（handler）就会被触发，并获取具有 error 相关信息的 event 对象，所以我们就能做一些后续处理了。

## Promise解决了什么问题
1. 回调地狱: 某个异步操作需要等待之前的异步操作完成, 无论是回调还是事件都会陷入不断的嵌套
2. 异步之间的联系: 某个异步操作需要等待多个异步操作的结果, 对这种联系的处理, 会让代码复杂度增加

Promise也有一些缺点。
* 首先，无法取消Promise，一旦新建它就会立即执行，无法中途取消。
* 其次，如果不设置回调函数(catch)，Promise内部抛出的错误，不会反应到外部。
* 第三，当处于pending状态时，无法得知目前进展到哪一个阶段（刚刚开始还是即将完成）。

## Promise/A+基本概念
当别人问起来什么是Promise/A+规范，可能会觉得有点懵，你可能用过Promise，但很可能不了解什么是Promise规范。

其实Promise 规范有很多，如Promise/A，Promise/B，Promise/D 以及 Promise/A 的升级版 Promise/A+。ES6中采用了 Promise/A+ 规范。

### 术语解析
```
1. promise：是一个拥有 then 方法的对象或函数，其行为符合本规范

2. thenable：是一个定义了 then 方法的对象或函数。这个主要是用来兼容一些老的Promise实现，只要一个Promise实现是thenable，也就是拥有then方法的，就可以跟Promises/A+兼容。

3. value：指reslove出来的值，可以是任何合法的JS值(包括 undefined , thenable 和 promise等)

4. exception：异常，在Promise里面用throw抛出来的值

5. reason：拒绝原因，是reject里面传的参数，表示reject的原因

```

Promise标准解读，主要记住两点
```
* (1) 一个promise的当前状态只能是pending、fulfilled和rejected三种之一。状态改变只能是pending到fulfilled或者pending到rejected。状态改变不可逆。

* (2) then实现链式调用，promise的then方法接收两个可选参数，表示该promise状态改变时的回调(promise.then(onFulfilled, onRejected))。then方法返回一个promise，then 方法可以被同一个 promise 调用多次。
```

## 简单实现Promise/A+（构造函数）
我们自己要写一个Promise，肯定需要知道有哪些工作需要做，我们先从Promise的使用来窥探下需要做啥:
```
1. 新建Promise需要使用new关键字，那他肯定是作为面向对象的方式调用的，Promise是一个类。

2. 我们new Promise(fn)的时候需要传一个函数进去，说明Promise的参数是一个函数。

3. 构造函数传进去的fn会收到resolve和reject两个函数，用来表示Promise成功和失败，说明构造函数里面还需要resolve和reject这两个函数，这两个函数的作用是改变Promise的状态。

4. 根据规范，promise有pending，fulfilled，rejected三个状态，初始状态为pending，调用resolve会将其改为fulfilled，调用reject会改为rejected。

5. promise实例对象建好后可以调用then方法，而且是可以链式调用then方法，说明then是一个实例方法。链式调用的实现这篇有详细解释，我这里不再赘述。简单的说就是then方法也必须返回一个带then方法的对象，可以是this或者新的promise实例。

```

### 构造函数
```
// 先定义三个常量表示状态
var PENDING = 'pending';
var FULFILLED = 'fulfilled';
var REJECTED = 'rejected';

function MyPromise(fn) {
  this.status = PENDING;    // 初始状态为pending
  this.value = null;        // 初始化value
  this.reason = null;       // 初始化reason

  // 构造函数里面添加两个数组存储成功和失败的回调
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  // 存一下this,以便resolve和reject里面访问
  var that = this;
  // resolve方法参数是value
  function resolve(value) {
    if (that.status === PENDING) {
      that.status = FULFILLED;
      that.value = value;

      // resolve里面将所有成功的回调拿出来执行
      that.onFulfilledCallbacks.forEach(callback => {
        callback(that.value);
      });
    }
  }

  // reject方法参数是reasonƒ√ß
  function reject(reason) {
    if (that.status === PENDING) {
      that.status = REJECTED;
      that.reason = reason;

      // resolve里面将所有失败的回调拿出来执行
      that.onRejectedCallbacks.forEach(callback => {
        callback(that.reason);
      });
    }
  }

  try {
    fn(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  // 这是为了防止死循环
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'));
  }

  if (x instanceof MyPromise) {
    // 如果 x 为 Promise ，则使 promise 接受 x 的状态
    // 也就是继续执行x，如果执行的时候拿到一个y，还要继续解析y
    // 这个if跟下面判断then然后拿到执行其实重复了，可有可无
    x.then(function (y) {
      resolvePromise(promise, y, resolve, reject);
    }, reject);
  }
  // 如果 x 为对象或者函数
  else if (typeof x === 'object' || typeof x === 'function') {
    // 这个坑是跑测试的时候发现的，如果x是null，应该直接resolve
    if (x === null) {
      return resolve(x);
    }

    try {
      // 把 x.then 赋值给 then 
      var then = x.then;
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(error);
    }

    // 如果 then 是函数
    if (typeof then === 'function') {
      var called = false;
      // 将 x 作为函数的作用域 this 调用之
      // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
      // 名字重名了，我直接用匿名函数了
      try {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          function (y) {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量called
            if (called) return;
            called = true;
            resolvePromise(promise, y, resolve, reject);
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          function (r) {
            if (called) return;
            called = true;
            reject(r);
          });
      } catch (error) {
        // 如果调用 then 方法抛出了异常 e：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
        if (called) return;

        // 否则以 e 为据因拒绝 promise
        reject(error);
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x);
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x);
  }
}

MyPromise.prototype.then = function (onFulfilled, onRejected) {
  // 如果onFulfilled不是函数，给一个默认函数，返回value
  // 后面返回新promise的时候也做了onFulfilled的参数检查，这里可以删除，暂时保留是为了跟规范一一对应，看得更直观
  var realOnFulfilled = onFulfilled;
  if (typeof realOnFulfilled !== 'function') {
    realOnFulfilled = function (value) {
      return value;
    }
  }

  // 如果onRejected不是函数，给一个默认函数，返回reason的Error
  // 后面返回新promise的时候也做了onRejected的参数检查，这里可以删除，暂时保留是为了跟规范一一对应，看得更直观
  var realOnRejected = onRejected;
  if (typeof realOnRejected !== 'function') {
    realOnRejected = function (reason) {
      throw reason;
    }
  }

  var that = this;   // 保存一下this

  if (this.status === FULFILLED) {
    var promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (typeof onFulfilled !== 'function') {
            resolve(that.value);
          } else {
            var x = realOnFulfilled(that.value);
            resolvePromise(promise2, x, resolve, reject);
          }
        } catch (error) {
          reject(error);
        }
      }, 0);
    });

    return promise2;
  }

  if (this.status === REJECTED) {
    var promise2 = new MyPromise(function (resolve, reject) {
      setTimeout(function () {
        try {
          if (typeof onRejected !== 'function') {
            reject(that.reason);
          } else {
            var x = realOnRejected(that.reason);
            resolvePromise(promise2, x, resolve, reject);
          }
        } catch (error) {
          reject(error);
        }
      }, 0);
    });

    return promise2;
  }

  // 如果还是PENDING状态，将回调保存下来
  if (this.status === PENDING) {
    var promise2 = new MyPromise(function (resolve, reject) {
      that.onFulfilledCallbacks.push(function () {
        setTimeout(function () {
          try {
            if (typeof onFulfilled !== 'function') {
              resolve(that.value);
            } else {
              var x = realOnFulfilled(that.value);
              resolvePromise(promise2, x, resolve, reject);
            }
          } catch (error) {
            reject(error);
          }
        }, 0);
      });
      that.onRejectedCallbacks.push(function () {
        setTimeout(function () {
          try {
            if (typeof onRejected !== 'function') {
              reject(that.reason);
            } else {
              var x = realOnRejected(that.reason);
              resolvePromise(promise2, x, resolve, reject);
            }
          } catch (error) {
            reject(error);
          }
        }, 0)
      });
    });

    return promise2;
  }
}

MyPromise.deferred = function () {
  var result = {};
  result.promise = new MyPromise(function (resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}

MyPromise.resolve = function (parameter) {
  if (parameter instanceof MyPromise) {
    return parameter;
  }

  return new MyPromise(function (resolve) {
    resolve(parameter);
  });
}

MyPromise.reject = function (reason) {
  return new MyPromise(function (resolve, reject) {
    reject(reason);
  });
}

MyPromise.all = function (promiseList) {
  var resPromise = new MyPromise(function (resolve, reject) {
    var count = 0;
    var result = [];
    var length = promiseList.length;

    if (length === 0) {
      return resolve(result);
    }

    promiseList.forEach(function (promise, index) {
      MyPromise.resolve(promise).then(function (value) {
        count++;
        result[index] = value;
        if (count === length) {
          resolve(result);
        }
      }, function (reason) {
        reject(reason);
      });
    });
  });

  return resPromise;
}

MyPromise.race = function (promiseList) {
  var resPromise = new MyPromise(function (resolve, reject) {
    var length = promiseList.length;

    if (length === 0) {
      return resolve();
    } else {
      for (var i = 0; i < length; i++) {
        MyPromise.resolve(promiseList[i]).then(function (value) {
          return resolve(value);
        }, function (reason) {
          return reject(reason);
        });
      }
    }
  });

  return resPromise;
}

MyPromise.prototype.catch = function (onRejected) {
  this.then(null, onRejected);
}

MyPromise.prototype.finally = function (fn) {
  return this.then(function (value) {
    return MyPromise.resolve(fn()).then(function () {
      return value;
    });
  }, function (error) {
    return MyPromise.resolve(fn()).then(function () {
      throw error
    });
  });
}

MyPromise.allSettled = function (promiseList) {
  return new MyPromise(function (resolve) {
    var length = promiseList.length;
    var result = [];
    var count = 0;

    if (length === 0) {
      return resolve(result);
    } else {
      for (var i = 0; i < length; i++) {

        (function (i) {
          var currentPromise = MyPromise.resolve(promiseList[i]);

          currentPromise.then(function (value) {
            count++;
            result[i] = {
              status: 'fulfilled',
              value: value
            }
            if (count === length) {
              return resolve(result);
            }
          }, function (reason) {
            count++;
            result[i] = {
              status: 'rejected',
              reason: reason
            }
            if (count === length) {
              return resolve(result);
            }
          });
        })(i)
      }
    }
  });
}

module.exports = MyPromise;
```

## 测试Promise
我们使用Promise/A+官方的测试工具promises-aplus-tests来对我们的MyPromise进行测试，要使用这个工具我们必须实现一个静态方法deferred，官方对这个方法的定义如下:
```
   * deferred: 返回一个包含{ promise, resolve, reject }的对象
​	  * promise 是一个处于pending状态的promise
​	  * resolve(value) 用value解决上面那个promise
​	  * reject(reason) 用reason拒绝上面那个promise
```

我们实现代码如下：
```
MyPromise.deferred = function() {
  var result = {};
  result.promise = new MyPromise(function(resolve, reject){
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}
```
然后用npm将promises-aplus-tests下载下来，再配置下package.json就可以跑测试了:
```
{
  "devDependencies": {
    "promises-aplus-tests": "^2.1.2"
  },
  "scripts": {
    "test": "promises-aplus-tests MyPromise"
  }
}
```
这个测试总共872用例，我们写的Promise通过了所有用例:
![](https://img.ikstatic.cn/MTYwNTI1NjAxOTkwNCM1MjIjanBn.jpg)

## 其他Promise方法

在ES6的官方Promise还有很多API，比如：

> Promise.resolve
> Promise.reject
> Promise.all
> Promise.race
> Promise.prototype.catch
> Promise.prototype.finally
> Promise.allSettled

### Promise.resolve

将现有对象转为Promise对象，如果 Promise.resolve 方法的参数，不是具有 then 方法的对象（又称 thenable 对象），则返回一个新的 Promise 对象，且它的状态为fulfilled。
```
MyPromise.resolve = function(parameter) {
  if(parameter instanceof MyPromise) {
    return parameter;
  }

  return new MyPromise(function(resolve) {
    resolve(parameter);
  });
}
```

### Promise.reject

返回一个新的Promise实例，该实例的状态为rejected。Promise.reject方法的参数reason，会被传递给实例的回调函数。

```
MyPromise.reject = function(reason) {
  return new MyPromise(function(resolve, reject) {
    reject(reason);
  });
}
```

### Promise.all

该方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

```
const p = Promise.all([p1, p2, p3]);
```

Promise.all()方法接受一个数组作为参数，p1、p2、p3都是 Promise 实例，如果不是，就会先调用Promise.resolve方法，将参数转为 Promise 实例，再进一步处理。当p1, p2, p3全部resolve，大的promise才resolve，有任何一个reject，大的promise都reject。

```
MyPromise.all = function(promiseList) {
  var resPromise = new MyPromise(function(resolve, reject) {
    var count = 0;
    var result = [];
    var length = promiseList.length;

    if(length === 0) {
      return resolve(result);
    }

    promiseList.forEach(function(promise, index) {
      MyPromise.resolve(promise).then(function(value){
        count++;
        result[index] = value;
        if(count === length) {
          resolve(result);
        }
      }, function(reason){
        reject(reason);
      });
    });
  });

  return resPromise;
}
```

### Promise.race

用法
```
const p = Promise.race([p1, p2, p3]);
```
该方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数。
```
MyPromise.race = function(promiseList) {
  var resPromise = new MyPromise(function(resolve, reject) {
    var length = promiseList.length;

    if(length === 0) {
      return resolve();
    } else {
      for(var i = 0; i < length; i++) {
        MyPromise.resolve(promiseList[i]).then(function(value) {
          return resolve(value);
        }, function(reason) {
          return reject(reason);
        });
      }
    }
  });

  return resPromise;
}
```

### Promise.prototype.catch

Promise.prototype.catch方法是.then(null, rejection)或.then(undefined, rejection)的别名，用于指定发生错误时的回调函数。

```
MyPromise.prototype.catch = function(onRejected) {
  this.then(null, onRejected);
}
```

### Promise.prototype.finally
finally方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。
```
MyPromise.prototype.finally = function(fn) {
  return this.then(function(value){
    return MyPromise.resolve(value).then(function(){
      return value;
    });
  }, function(error){
    return MyPromise.resolve(reason).then(function() {
      throw error
    });
  });
}
```

### Promise.allSettled
该方法接受一组 Promise 实例作为参数，包装成一个新的 Promise 实例。只有等到所有这些参数实例都返回结果，不管是fulfilled还是rejected，包装实例才会结束。该方法由 ES2020 引入。该方法返回的新的 Promise 实例，一旦结束，状态总是fulfilled，不会变成rejected。状态变成fulfilled后，Promise 的监听函数接收到的参数是一个数组，每个成员对应一个传入Promise.allSettled()的 Promise 实例的执行结果。

```
MyPromise.allSettled = function(promiseList) {
  return new MyPromise(function(resolve){
    var length = promiseList.length;
    var result = [];
    var count = 0;

    if(length === 0) {
      return resolve(result);
    } else {
      for(var i = 0; i < length; i++) {

        (function(i){
          var currentPromise = MyPromise.resolve(promiseList[i]);

          currentPromise.then(function(value){
            count++;
            result[i] = {
              status: 'fulfilled',
              value: value
            }
            if(count === length) {
              return resolve(result);
            }
          }, function(reason){
            count++;
            result[i] = {
              status: 'rejected',
              reason: reason
            }
            if(count === length) {
              return resolve(result);
            }
          });
        })(i)
      }
    }
  });
}

```

## 总结
我们的Promise就简单实现了，只是我们不是原生代码，不能做成微任务，如果一定要做成微任务的话，只能用其他微任务API模拟，比如MutaionObserver或者process.nextTick。下面再回顾下几个要点:
* Promise其实是一个发布订阅模式
* then方法对于还在pending的任务，其实是将回调函数onFilfilled和onRejected塞入了两个数组
* then方法会返回一个新的Promise以便执行链式调用
* Promise构造函数里面的resolve方法会将数组onFilfilledCallbacks里面的方法全部拿出来执行，这里面是之前then方法塞进去的成功回调
* Promise构造函数里面的reject方法会将数组onRejectedCallbacks里面的方法全部拿出来执行，这里面是之前then方法塞进去的失败回调
* catch和finally这些实例方法都必须返回一个新的Promise实例以便实现链式调用
