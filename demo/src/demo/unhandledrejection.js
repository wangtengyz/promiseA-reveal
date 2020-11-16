var promise1 = new Promise((resolve) => {
    resolve(111);
    console.log(222)
    console.log(aaa)
});

promise1.then(function(value) {
  console.log(value);
}).catch(error => console.log('error', error));


