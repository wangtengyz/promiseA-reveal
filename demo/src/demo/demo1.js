// 构造函数-自己写一个promose
// 先定义三个常量标示状态
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

function MyPromise(fn) {
  this.status = PENDING; // 初始状态为pending
  this.value = null;  // 初始化value
  this.reason = null; // 初始化reason

  // 根据规范，resolve方法是将状态改为fulfilled，reject是将状态改为rejected。
  // 存一下this,以便resolve和reject里面访问
  const that = this

  // 构造函数里面添加两个数组存储成功和失败的回调
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  // resolve方法参数是value
  function resolve(value) {
    if(that.status === PENDING) {
      that.status = FULFILLED;
      that.value = value;
      // resolve里面将所有成功的回调拿出来执行
      that.onFulfilledCallbacks.forEach(callback => {
        callback(that.value);
      });
    }
  }

  // reject方法参数是reason
  function reject(reason) {
    if(that.status === PENDING) {
      that.status = REJECTED;
      that.reason = reason;
      // reject里面将所有失败的回调拿出来执行
      that.onRejectedCallbacks.forEach(callback => {
        callback(that.reason);
      });
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

// then方法
// then方法可以链式调用，所以他是实例方法，而且规范中的API是promise.then(onFulfilled, onRejected)，我们先把架子搭出来：
// MyPromise.prototype.then = function (onFulfilled, onRejected) {}

// 那then方法里面应该干什么呢，其实规范也告诉我们了，
// 先检查onFulfilled和onRejected是不是函数，如果不是函数就忽略他们，
// 所谓“忽略”并不是什么都不干，对于onFulfilled来说“忽略”就是将value原封不动的返回，
// 对于onRejected来说就是返回reason，onRejected因为是错误分支，我们返回reason应该throw一个Error:
MyPromise.prototype.then = function (onFulfilled, onRejected) {
  // 先检查onFulfilled和onRejected是不是函数，如果不是函数就忽略他们
  let realOnFulfilled = onFulfilled
  if(typeof realOnFulfilled !== 'function') {
    realOnFulfilled = function (value) {
    return value;
    }
  }

  // 如果onRejected不是函数，给一个默认函数，返回reason的Error
  let realOnRejected = onRejected;
  if(typeof realOnRejected !== 'function') {
    realOnRejected = function (reason) {
      throw reason;
      // throw new Error(reason)
    }
  }

  // 参数检查完后就该干点真正的事情了，想想我们使用Promise的时候，如果promise操作成功了就会调用then里面的onFulfilled，如果他失败了，就会调用onRejected。对应我们的代码就应该检查下promise的status，如果是FULFILLED，就调用onFulfilled，如果是REJECTED，就调用onRejected:
  if(this.status === FULFILLED) {
    onFulfilled(this.value)
  }

  if(this.status === REJECTED) {
    onRejected(this.reason);
  }

  // 再想一下，我们新建一个promise的时候可能是直接这样用的:

  // new Promise(fn).then(onFulfilled, onRejected);

  // 上面代码then是在实例对象一创建好就调用了，这时候fn里面的异步操作可能还没结束呢，也就是说他的status还是PENDING，这怎么办呢，这时候我们肯定不能立即调onFulfilled或者onRejected的，因为fn到底成功还是失败还不知道呢。那什么时候知道fn成功还是失败呢？答案是fn里面主动调resolve或者reject的时候。所以如果这时候status状态还是PENDING，我们应该将onFulfilled和onRejected两个回调存起来，等到fn有了结论，resolve或者reject的时候再来调用对应的代码。因为后面then还有链式调用，会有多个onFulfilled和onRejected，我这里用两个数组将他们存起来，等resolve或者reject的时候将数组里面的全部方法拿出来执行一遍：

  // 如果还是PENDING状态，将回调保存下来
  if(this.status === PENDING) {
    this.onFulfilledCallbacks.push(realOnFulfilled);
    this.onRejectedCallbacks.push(realOnRejected);
  }

  //上面这种暂时将回调保存下来，等条件满足的时候再拿出来运行让我想起了一种模式：订阅发布模式。我们往回调数组里面push回调函数，其实就相当于往事件中心注册事件了，resolve就相当于发布了一个成功事件，所有注册了的事件，即onFulfilledCallbacks里面的所有方法都会拿出来执行，同理reject就相当于发布了一个失败事件

}

module.exports = MyPromise;
