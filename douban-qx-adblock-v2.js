/*
Quantumult X - 豆瓣开屏广告响应清理 v2
更新时间：2026-05-04
用途：把豆瓣 app_ads/splash 接口响应改成空广告，处理 splash_bid / splash_preload / splash_statistics。
*/

let url = $request && $request.url ? $request.url : '';
let body = $response && $response.body ? $response.body : '';

const empty = {
  code: 0,
  status: 0,
  msg: '',
  message: '',
  splash_ads: [],
  splash_ad: null,
  ads: [],
  ad: null,
  adverts: [],
  items: [],
  data: [],
  result: [],
  count: 0,
  has_ads: false,
  has_ad: false,
  show: false,
  display: false,
  preload: false
};

function cleanAny(x) {
  if (Array.isArray(x)) return [];
  if (!x || typeof x !== 'object') return x;
  for (const k of Object.keys(x)) {
    if (/(^|_)(ad|ads|advert|advertise|advertisement|splash|startup|launch|boot|commercial|promotion|promote|bid|bids|creative|material|preload)(_|$)/i.test(k) || /^(ad|ads|splash|bid|bids)$/i.test(k)) {
      x[k] = Array.isArray(x[k]) ? [] : (typeof x[k] === 'boolean' ? false : (typeof x[k] === 'number' ? 0 : null));
    } else if (/^(has_ads|has_ad|show_ad|show_ads|need_ad|enable_ad|display_ad|preload)$/i.test(k)) {
      x[k] = false;
    } else {
      x[k] = cleanAny(x[k]);
    }
  }
  return x;
}

try {
  if (/\/v\d+\/app_ads\/(splash_bid|splash_preload|splash_statistics|splash)/i.test(url) || /[?&]ad/i.test(url)) {
    $done({ body: JSON.stringify(empty) });
  } else {
    let data = JSON.parse(body || '{}');
    $done({ body: JSON.stringify(cleanAny(data)) });
  }
} catch (e) {
  $done({ body: JSON.stringify(empty) });
}
