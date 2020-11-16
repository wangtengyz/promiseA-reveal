# 详解Promise/Promise/A+

## 什么是Promise？
Promise 是异步编程的一种解决方案：从语法上讲，promise是一个对象，从它可以获取异步操作的消息；从本意上讲，它是承诺，承诺它过一段时间会给你一个结果。promise有三种状态： pending(等待态)，fulfiled(成功态)，rejected(失败态)；状态一旦改变，就不会再变。创造promise实例后，它会立即执行。

ES6 规定，Promise对象是一个构造函数，用来生成Promise实例。
下面代码创造了一个Promise实例。
```
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

Promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数。

```
promise.then(function(value) {
  // success
}, function(error) {
  // failure
});
```

下面是一个Promise对象的简单例子。
```
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'done');
  });
}

timeout(100).then((value) => {
  console.log(value);
});

```

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

### Promise状态
Promise总共有三个状态:
```
1. pending: 一个promise在resolve或者reject前就处于这个状态。

2. fulfilled: 一个promise被resolve后就处于fulfilled状态，这个状态不能再改变，而且必须拥有一个不可变的值(value)。

3. rejected: 一个promise被reject后就处于rejected状态，这个状态也不能再改变，而且必须拥有一个不可变的拒绝原因(reason)。

```

注意这里的不可变指的是===，也就是说，如果value或者reason是对象，只要保证引用不变就行，规范没有强制要求里面的属性也不变。Promise状态其实很简单，画张图就是:

![](https://img.ikstatic.cn/MTYwNTE2ODU2MDQ4MSM2OTUjanBn.jpg)

### then方法

一个promise必须拥有一个then方法来访问他的值或者拒绝原因。then方法有两个参数：

```
promise.then(onFulfilled, onRejected)
```

#### 参数可选

onFulfilled 和 onRejected 都是可选参数。

* 如果 onFulfilled 不是函数，其必须被忽略
* 如果 onRejected 不是函数，其必须被忽略

onFulfilled 特性
如果 onFulfilled 是函数：

* 当 promise 执行结束后其必须被调用，其第一个参数为 promise 的终值value
* 在 promise 执行结束前其不可被调用
* 其调用次数不可超过一次

onRejected 特性
如果 onRejected 是函数：

* 当 promise 被拒绝执行后其必须被调用，其第一个参数为 promise 的据因reason
* 在 promise 被拒绝执行前其不可被调用
* 其调用次数不可超过一次

#### 多次调用
then 方法可以被同一个 promise 调用多次

* 当 promise 成功执行时，所有 onFulfilled 需按照其注册顺序依次回调
* 当 promise 被拒绝执行时，所有的 onRejected 需按照其注册顺序依次回调

#### 返回
then 方法必须返回一个 promise 对象
```
promise2 = promise1.then(onFulfilled, onRejected); 
```
* 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行 Promise 解决过程：[[Resolve]](promise2, x)
* 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e
* 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
* 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的拒因


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
