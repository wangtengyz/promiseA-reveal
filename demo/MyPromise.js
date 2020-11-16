// 构造函数-自己写一个promose
// 先定义三个常量标示状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function MyPromise(fn) {
  this.status = PENDING // 初始状态为pending
  this.value = null // 初始化value
  this.reason = null // 初始化reason

  // 根据规范，resolve方法是将状态改为fulfilled，reject是将状态改为rejected。
  // 存一下this,以便resolve和reject里面访问
  const that = this

  // 构造函数里面添加两个数组存储成功和失败的回调
  this.onFulfilledCallbacks = []
  this.onRejectedCallbacks = []

  // resolve方法参数是value
  function resolve(value) {
    if (that.status === PENDING) {
      that.status = FULFILLED
      that.value = value
      // resolve里面将所有成功的回调拿出来执行
      that.onFulfilledCallbacks.forEach(callback => {
        callback(that.value)
      })
    }
  }

  // reject方法参数是reason
  function reject(reason) {
    if (that.status === PENDING) {
      that.status = REJECTED
      that.reason = reason
      // reject里面将所有失败的回调拿出来执行
      that.onRejectedCallbacks.forEach(callback => {
        callback(that.reason)
      })
    }
  }

  // 调用构造函数参数
  // 最后将resolve和reject作为参数调用传进来的参数，记得加上try，如果捕获到错误就reject。
  try {
    fn(resolve, reject)
  } catch (error) {
    reject(error)
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise
  // 这是为了防止死循环
  if (promise === x) {
    return reject(new TypeError('The promise and the return value are the same'))
  }

  if (x instanceof MyPromise) {
    // 如果 x 为 Promise ，则使 promise 接受 x 的状态
    // 也就是继续执行x，如果执行的时候拿到一个y，还要继续解析y
    // 这个if跟下面判断then然后拿到执行其实重复了，可有可无
    x.then(function (y) {
      resolvePromise(promise, y, resolve, reject)
    }, reject)
  }
  // 如果 x 为对象或者函数
  else if (typeof x === 'object' || typeof x === 'function') {
    // 如果x是null，应该直接resolve
    if (x === null) {
      return resolve(x)
    }

    // 这是规范要求的，下面引用规范原文："这步我们先是存储了一个指向 x.then 的引用，然后测试并调用该引用，以避免多次访问 x.then 属性。这种预防措施确保了该属性的一致性，因为其值可能在检索调用时被改变。"
    try {
      // 把 x.then 赋值给 then
      var then = x.then
    } catch (error) {
      // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
      return reject(error)
    }

    // 如果 then 是函数
    if (typeof then === 'function') {
      var called = false
      // 将 x 作为函数的作用域 this 调用之
      // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
      // 名字重名了，用匿名函数了
      try {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          function (y) {
            // 如果 resolvePromise 和 rejectPromise 均被调用，
            // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            // 实现这条需要前面加一个变量called
            if (called) return
            called = true
            resolvePromise(promise, y, resolve, reject)
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          function (r) {
            if (called) return
            called = true
            reject(r)
          }
        )
      } catch (error) {
        // 如果调用 then 方法抛出了异常 e：
        // 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
        if (called) return

        // 否则以 e 为据因拒绝 promise
        reject(error)
      }
    } else {
      // 如果 then 不是函数，以 x 为参数执行 promise
      resolve(x)
    }
  } else {
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
    resolve(x)
  }
}

// then方法
// then方法可以链式调用，所以他是实例方法，而且规范中的API是promise.then(onFulfilled, onRejected)，我们先把架子搭出来：
// MyPromise.prototype.then = function (onFulfilled, onRejected) {}

// 那then方法里面应该干什么呢，其实规范也告诉我们了，
// 先检查onFulfilled和onRejected是不是函数，如果不是函数就忽略他们，
// 所谓“忽略”并不是什么都不干，对于onFulfilled来说“忽略”就是将value原封不动的返回，
// 对于onRejected来说就是返回reason，onRejected因为是错误分支，我们返回reason应该throw一个Error:
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  const that = this // 保存一下this
  // 先检查onFulfilled和onRejected是不是函数，如果不是函数就忽略他们
  let realOnFulfilled = onFulfilled
  if (typeof realOnFulfilled !== 'function') {
    realOnFulfilled = function (value) {
      return value
    }
  }

  // 如果onRejected不是函数，给一个默认函数，返回reason的Error
  let realOnRejected = onRejected
  if (typeof realOnRejected !== 'function') {
    realOnRejected = function (reason) {
      throw reason
      // throw new Error(reason)
    }
  }

  // 参数检查完后就该干点真正的事情了，想想我们使用Promise的时候，如果promise操作成功了就会调用then里面的onFulfilled，如果他失败了，就会调用onRejected。对应我们的代码就应该检查下promise的status，如果是FULFILLED，就调用onFulfilled，如果是REJECTED，就调用onRejected:
  if (this.status === FULFILLED) {
    // onFulfilled(this.value)
    // 1. 如果 onFulfilled 或者 onRejected 抛出一个异常 e ，则 promise2 必须拒绝执行，并返回拒因 e。
    // 有了这个要求，在RESOLVED和REJECTED的时候就不能简单的运行onFulfilled和onRejected了。
    // 我们需要将他们用try...catch...包起来，如果有错就reject。
    // 2. 如果 onFulfilled 不是函数且 promise1 成功执行， promise2 必须成功执行并返回相同的值
    // 我们就根据要求加个判断，注意else里面是正常执行流程，需要resolve
    // 这是个例子，每个realOnFulfilled后面都要这样写

    // 4. 如果 onFulfilled 或者 onRejected 返回一个值 x ，则运行下面的 Promise 解决过程：[[Resolve]](promise2, x)。这条其实才是规范的第一条，因为他比较麻烦，所以我将它放到了最后。前面我们代码的实现，其实只要onRejected或者onFulfilled成功执行了，我们都要resolve promise2。多了这条，我们还需要对onRejected或者onFulfilled的返回值进行判断，如果有返回值就要进行 Promise 解决过程。我们专门写一个方法来进行Promise 解决过程。前面我们代码的实现，其实只要onRejected或者onFulfilled成功执行了，我们都要resolve promise2，这个过程我们也放到这个方法里面去吧，所以代码变为下面这样，其他地方类似：

    // 5. onFulfilled 和 onRejected 的执行时机
    // 在规范中还有一条：onFulfilled 和 onRejected 只有在执行环境堆栈仅包含平台代码时才可被调用。这一条的意思是实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。所以在我们执行onFulfilled 和 onRejected的时候都应该包到setTimeout里面去。(为了支持兼容同步promise)

    const promise2 = new MyPromise(function (resolve, reject) {
      // 这里加setTimeout
      setTimeout(function () {
        try {
          if (typeof onFulfilled !== 'function') {
            resolve(that.value)
          } else {
            var x = realOnFulfilled(that.value)
            resolvePromise(promise2, x, resolve, reject)
          }
        } catch (error) {
          reject(error)
        }
      }, 0)
    })

    return promise2
  }

  // 3. 如果 onRejected 不是函数且 promise1 拒绝执行， promise2 必须拒绝执行并返回相同的据因。这个要求其实在我们检测 onRejected 不是函数的时候已经做到了，因为我们默认给的onRejected里面会throw一个Error，所以代码肯定会走到catch里面去。但是我们为了更直观，代码还是跟规范一一对应吧。需要注意的是，如果promise1的onRejected执行成功了，promise2应该被resolve。改造代码如下:
  if (this.status === REJECTED) {
    // onRejected(this.reason);
    const promise2 = new MyPromise(function (resolve, reject) {
      // 这里加setTimeout
      setTimeout(function () {
        try {
          if (typeof onRejected !== 'function') {
            reject(that.reason)
          } else {
            var x = realOnRejected(that.reason)
            resolvePromise(promise2, x, resolve, reject)
          }
        } catch (error) {
          reject(error)
        }
      }, 0)
    })
    return promise2
  }

  // 再想一下，我们新建一个promise的时候可能是直接这样用的:

  // new Promise(fn).then(onFulfilled, onRejected);

  // 上面代码then是在实例对象一创建好就调用了，这时候fn里面的异步操作可能还没结束呢，也就是说他的status还是PENDING，这怎么办呢，这时候我们肯定不能立即调onFulfilled或者onRejected的，因为fn到底成功还是失败还不知道呢。那什么时候知道fn成功还是失败呢？答案是fn里面主动调resolve或者reject的时候。所以如果这时候status状态还是PENDING，我们应该将onFulfilled和onRejected两个回调存起来，等到fn有了结论，resolve或者reject的时候再来调用对应的代码。因为后面then还有链式调用，会有多个onFulfilled和onRejected，我这里用两个数组将他们存起来，等resolve或者reject的时候将数组里面的全部方法拿出来执行一遍：

  // 如果还是PENDING状态，将回调保存下来
  // 如果还是PENDING状态，也不能直接保存回调方法了，需要包一层来捕获错误
  if (this.status === PENDING) {
    const promise2 = new MyPromise(function (resolve, reject) {
      that.onFulfilledCallbacks.push(function () {
        // 这里加setTimeout
        setTimeout(function () {
          try {
            if (typeof onFulfilled !== 'function') {
              resolve(that.value)
            } else {
              var x = realOnFulfilled(that.value)
              resolvePromise(promise2, x, resolve, reject)
            }
          } catch (error) {
            reject(error)
          }
        }, 0)
      })
      that.onRejectedCallbacks.push(function () {
        // 这里加setTimeout
        setTimeout(function () {
          try {
            if (typeof onRejected !== 'function') {
              reject(that.reason)
            } else {
              var x = realOnRejected(that.reason)
              resolvePromise(promise2, x, resolve, reject)
            }
          } catch (error) {
            reject(error)
          }
        }, 0)
      })
    })

    return promise2
  }

  //上面这种暂时将回调保存下来，等条件满足的时候再拿出来运行让我想起了一种模式：订阅发布模式。我们往回调数组里面push回调函数，其实就相当于往事件中心注册事件了，resolve就相当于发布了一个成功事件，所有注册了的事件，即onFulfilledCallbacks里面的所有方法都会拿出来执行，同理reject就相当于发布了一个失败事件
}

// 测试我们的Promise
// 我们使用Promise/A+官方的测试工具promises-aplus-tests来对我们的MyPromise进行测试，要使用这个工具我们必须实现一个静态方法deferred，官方对这个方法的定义如下:
MyPromise.deferred = function() {
  var result = {};
  result.promise = new MyPromise(function(resolve, reject){
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}

module.exports = MyPromise
