// 为了方便理解，我们先看一个生活中使用发布-订阅模式的例子。 

// 新冠肺炎疫情期间，小明去药店买口罩，然而到店之后却被店员告知口罩已经售罄。这时，小明给店员留了一个电话，告诉店员等口罩到货后打电话通知他一下， 这样小明就可以在口罩到货后的第一时间去药店买口罩了。小明买口罩的过程就是对发布-订阅模式的一次实践：小明将电话留给店员，让店员在口罩到货后通知他，便是一次“订阅”；店员在口罩到货后，打电话告诉小明，便是一次“发布”。

// 不过，在上面的例子中发布-订阅模式并不是唯一的解决方案，其优势也并没有体现出来。比如，小明不想把自己的电话留给药店，而是把药店的电话记了下来，每天给药店打电话去问。从目前的情况看，这种方式也是可以工作的。但往往我们需要面临更复杂的情况：当前疫情严重，不止小明一人需要口罩，小红、小白、小黑等许许多多的人也都需要口罩，他们也都想在口罩到货的第一时间得到消息，于是他们每个人每天都需要给药店打电话询问。这样药店每天都会收到几百个电话，店员们每天都被一个简单却重复的问题搞得很疲惫，而小明也每天都担心电话打晚了会被别人先得到消息“抢”走口罩。

// 当有许多人都想获得“口罩到货”这一相同消息时，发布-订阅模式的优势就显示出来了。只要所有想知道这个消息的用户都在药店留一个电话，当口罩到货后，店员再给“订阅”这一事件的所有用户都打电话告知一下就可以了。这样用户就不用每天都给药店打电话询问，药店也不需要每天都花大量的时间接听电话了。
import PubSub from './subscribe'
const drugstore = new PubSub()
// 口罩到货后，小明要做的事情
function xiaoMing (data) {
  console.log('口罩到货了，我要赶紧去买一些')
}
 
// 小明监听口罩到货事件
drugstore.listen('hasMask', xiaoMing)
 
 
// 口罩到货后，小红要做的事情
function xiaoHong (data) {
  if (new Date() < new Date('6/30/2021')) {
    console.log('疫情应该结束了，不买口罩了')
  } else {
    console.log('赶紧去买口罩，不然就买不着了')
  }
}
 
// 小红监听口罩到货事件
drugstore.listen('hasMask', xiaoHong)
 
 
// 口罩到货后，小白要做的事情
function xiaoBai (data) {
  if (data.price > 100) {
    console.log('这口罩咋这么贵？不买了！')
  } else if (data.price > 50) {
    console.log('这口罩偏贵，先买10个用着，过段时间看能不能降价')
  } else {
    console.log('这批口罩价格还可以，买50个屯着')
  }
}
 
// 小白监听口罩到货事件
drugstore.listen('hasMask', xiaoBai)

// 假设到货口罩的相关信息如下
const data = {
  type: 'N95',
  price: 30,
  stock: 1000
}
 
// 发布口罩到货的消息，并把口罩的相关信息作为参数传递给订阅该事件回调函数
// 收到信息后具体怎么处理，完全由回调函数自己定义，“药店”并不关心
// drugstore.publish('hasMask', data)

export default drugstore
// // 小白在其他药店买到了更便宜的口罩，不需要再订阅这家药店的消息
// drugstore.remove('hasMask', xiaoBai)

// // 如果小明只想买普通医用口罩，可以只订阅普通医用口罩的到货通知
// drugStore.remove('hasMask', xiaoMing) // 取消对原事件的订阅
// drugStore.listen('ordinary', xiaoMing)
 
// // 如果小红只想买N95口罩，可以只订阅N95口罩到货的通知
// drugStore.remove('hasMask', xiaoHong) // 取消对原事件的订阅
// drugstore.listen('N95', xiaoHong)
 
// // 如果小黑什么种类的口罩都可以，则订阅hasMask事件
// drugstore.listen('hasMask', function xiaoHei (data) {
//   console.log('有口罩到货了，我并不关心是什么类型的')
// })
 
 
// // 普通口罩到货时
// drugstore.publish('ordinary', data) // 小明收到消息
// drugstore.publish('hasMask', data)  // 小黑收到消息
 
// // N95口罩到货时
// drugstore.publish('N95', data)      // 小红收到消息
// drugstore.publish('hasMask', data)  // 小黑收到消息