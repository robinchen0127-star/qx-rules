/*
Quantumult X - 闲鱼开屏/启动广告响应清理
更新时间：2026-06-02
用途：只清理疑似闲鱼广告/开屏接口响应，不域名级拦截 acs.m.taobao.com，避免误伤核心 API。
*/

const url = ($request && $request.url) || '';
const body = ($response && $response.body) || '';

function emptyFor(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') return {};
  if (typeof value === 'boolean') return false;
  if (typeof value === 'number') return 0;
  return null;
}

function looksAdNode(x) {
  if (!x || typeof x !== 'object') return false;
  const s = JSON.stringify(x).slice(0, 5000);
  return /(splash|startup|launch|开屏|广告|advert|adverts?|poplayer|creativeId|creative_id|materialId|material_id|clickUrl|landingUrl|deeplink|tanx|alimama|youkuad|adzone|pid=mm_)/i.test(s);
}

function clean(x, parentKey = '') {
  if (Array.isArray(x)) {
    return x.map(v => clean(v, parentKey)).filter(v => !looksAdNode(v));
  }
  if (x && typeof x === 'object') {
    for (const k of Object.keys(x)) {
      const lk = String(k).toLowerCase();
      if (/^(ad|ads|advert|adverts|advertise|advertisement|splash|splashad|splashads|startup|launch|boot|poplayer|promotion|promotions|material|materials|creative|creatives)$/.test(lk)) {
        x[k] = emptyFor(x[k]);
      } else if (/^(hasad|hasads|showad|showads|needad|displayad|enablead|showadvert|hasadvert)$/.test(lk)) {
        x[k] = false;
      } else {
        x[k] = clean(x[k], k);
      }
    }
  }
  return x;
}

try {
  let data = JSON.parse(body || '{}');
  if (/splash|startup|launch|poplayer|advert|ad/i.test(url)) {
    data = clean(data);
    // 对明确广告接口补一个空广告兜底结构，避免 App 使用缓存广告。
    if (/splash|startup|launch|poplayer/i.test(url)) {
      data.ad = null;
      data.ads = [];
      data.adverts = [];
      data.splash = null;
      data.splashAds = [];
      data.materials = [];
      data.show = false;
      data.hasAd = false;
    }
  } else {
    data = clean(data);
  }
  $done({ body: JSON.stringify(data) });
} catch (e) {
  $done({ body: '{}' });
}
