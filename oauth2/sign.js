
//var dict = {c: 'missile-123x', b:1, a:2, z:333, m: 345};
//xx=111&zz=222&aa=232&dd=missile&sign=adfasdfasdfasdf
var time = Date.now();
var dict = {
  xx: 111,
  zz: 222,
  aa: 232,
  dd: 'missile',
  timestamp: time
}

console.log(dict)
var strs = [], str = '';
for (var key of Object.keys(dict).sort()) {
  //console.log(key, dict[key]);
  //str += key + '=' + dict[key];
  strs.push(key + '=' + dict[key])
}
str = strs.join('&');
console.log('strs: ', strs)
console.log('str: ', str)

var crypto = require('crypto');
var secret = 'c0d37e0a5931b7029ee7a9f13e647a28970b84d4e509bddeb8d80d9f31e4c366';
var params = 'name=xx&key=missile&time=234234&xxx=234sf';
var ssr = crypto.createHmac('sha1', secret).update(params).digest().toString('base64');
console.log('ssr:', ssr)
console.log('###time:', time)
console.log('md5:', crypto.createHash('md5').update(str + '&sign=' + 'client-secret-for-xxxx-dev').digest('hex'));
