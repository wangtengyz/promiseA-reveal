// 自己实现一个发布订阅模式
export default class PubSub {
  constructor() {
    // 一个对象存放所有的消息订阅
    // 每个消息对应一个数组，数组结构如下
    // {
    //   'event1': [cb1, cn2]
    // }
    this.events = {}
  }

  // 订阅
  /**
   * @name subscribe
   * @param {strng, function} 参数名 描述
   */
  listen(event, callback) {
    if (this.events[event]) {
      // 如果有人订阅过了，这个键已经存在，就往里面加就好了
      this.events[event].push(callback)
      return
    }
    // 没人订阅过，就建一个数组，回调放进去
    this.events[event] = [callback]
  }

  // 取消订阅
  remove(event, callback) {
    // 删除某个订阅，保留其他订阅
    const subscribedEvents = this.events[event]
    if (subscribedEvents && subscribedEvents.length) {
      this.events[event] = this.events[event].filter(cb => cb !== callback)
    }
  }

  // 取出所有订阅者的回调执行
  publish(event, ...args) {
    const subscribedEvents = this.events[event]
    if(!subscribedEvents) {
      throw new Error(`请先注册${event}消息`)
    }
    subscribedEvents.forEach(callback => {
      callback.call(this, ...args)
    })
  }
}
