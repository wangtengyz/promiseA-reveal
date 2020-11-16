// 链式调用示范
function cook() {
  console.log('开始做饭。')
  var p = new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('做饭完毕！')
      resolve('鸡蛋炒饭')
    }, 1000)
  })
  return p
}

function eat(data) {
  console.log('开始吃饭：' + data)
  var p = new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('吃饭完毕!')
      resolve('一块碗和一双筷子') // resolve()的值会传递给then中function的data参数，供下一个方法使用。
    }, 2000)
  })
  //这里的return的作用是把第一个回调函数的返回结果作为参数,传递给第二个回调函数
  return p
}
function wash(data) {
  console.log('开始洗碗：' + data)
  var p = new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('洗碗完毕!')
      resolve('干净的碗筷')
    }, 2000)
  })
  return p
}
//补充代码
// cook()
//   .then(resolve => {
//     return eat(resolve) //第一个回调函数完成以后，会将返回结果作为参数，传入第二个回调函数。所以这里要用return返回函数去传参。
//   })
//   .then(resolve => {
//     return wash(resolve)
//   })
//   .then(resolve => {
//     //在Promise实例生成以后，可以用then方法分别指定resolved状态和rejected状态的回调函数。

//     //then方法执行的是resolve这个回调，并且这个函数都接受Promise对象传出的值作为参数。而这里“鸡蛋炒饭”就是作为参数传递的
//     console.log(resolve) //resolve中的值是传递到then方法中的参数,只有在then中通过console.log输出传入的参数,才可以在控制台查看到消息
//   })
//也可以像下面这样写,因为这三个函数本身设置的有return才可以这样直接写
//下一个then的回调函数,会等上一个then中的回调函数执行完毕,返回promise状态,就执行.
//首先eat,wash本身就是一个函数,所以可以直接作为then中的回到函数.
//然后eat,wash函数内部也返回了promise,所以这样写没有问题.
// cook().then(eat).then(wash).then(resolve => { console.log(resolve) })

// cook()
//   .then(resolve => {
//     console.log(resolve, '111')
//     return 2
//   })
//   .then(resolve => {
//     console.log(resolve, '222')
//     return new Promise(function (resolve, reject) {
//       resolve(3)
//     })
//   })
//   .then(resolve => {
//     console.log(resolve, '333')
//   })

// return this
cook()
  .then(resolve => {
    console.log(resolve, '111')
    return new Promise(function (resolve, reject) {
      resolve(new Promise(function (resolve, reject) {
        resolve(3)
      }))
    })
  })
  .then(resolve => {
    console.log(resolve, '222')
    return new Promise(function (resolve, reject) {
      resolve(4, new Promise(function (resolve, reject) {
        resolve(5)
      }))
    })
  })
  .then(resolve => {
    console.log(resolve, '333')
  })
