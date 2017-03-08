var crypto = require('crypto');
// client secret (API密钥)
//var secret = 'c0d37e0a5931b7029ee7a9f13e647a28970b84d4e509bddeb8d80d9f31e4c366';
//var secret = 'client-secret-for-xxxx-dev'
var secret = 'b965e6ea4b4a242fc3161dcc8e795b87ba1963b11a58d7c3c5643353782de30a'

var time = Date.now();
var params = {
  //xx: 111,
  //zz: 222,
  //aa: 232,
  //dd: 'some-string'
}
// 把timestamp作为参数之一加入sign的计算中去
params.timestamp = time;

// 如果是get请求，则参数是 ?xx=111&zz=222&aa=232&dd=some-string 这样的
// 整体来说post和get方式做法一样

// 对字段名做字典排序
var strs = [], paramsString = '', readyToSign = '', signature = '';
for (var key of Object.keys(params).sort()) {
  strs.push(key + '=' + params[key])
}
// 把排好序的字段和值用 & 符号连接，比如 aa=111&bb=222&cc=333
paramsString = strs.join('&');

// 在拼接好参数后边再拼接上API密钥，注意需要加上 &sign=
readyToSign = paramsString + '&sign=' + secret;

// 对生成的readyToSign子串做md5操作，结果即sign签名值
signature = crypto.createHash('md5').update(readyToSign).digest('hex');
console.log('sign: ', signature);

// 最终请求的url
var url = paramsString + '&sign=' + signature;
console.log('url: ', url);

// 输出结果
// url:  aa=232&dd=some-string&timestamp=1488527789495&xx=111&zz=222&sign=0104046412972c4ce650535569a4a486
