/*
Quantumult X - 京东开屏/启动广告响应清理
更新时间：2026-06-02
用途：清理京东 App 开屏、启动图、广告配置响应。
*/

const url = ($request && $request.url) || '';
const body = ($response && $response.body) || '';

function emptyFor(v) {
  if (Array.isArray(v)) return [];
  if (v && typeof v === 'object') return {};
  if (typeof v === 'boolean') return false;
  if (typeof v === 'number') return 0;
  return null;
}

function looksAdNode(x) {
  if (!x || typeof x !== 'object') return false;
  const s = JSON.stringify(x).slice(0, 6000);
  return /(splash|start(?:up)?|launch|开屏|广告|advert|adverts?|jdad|material|creative|expo|impr|clickUrl|jumpUrl|landingUrl|imgUrl|imageUrl|duration|displayTime|countdown)/i.test(s);
}

function clean(x) {
  if (Array.isArray(x)) return x.map(clean).filter(v => !looksAdNode(v));
  if (x && typeof x === 'object') {
    for (const k of Object.keys(x)) {
      const lk = String(k).toLowerCase();
      if (/^(ad|ads|advert|adverts|advertise|advertisement|splash|splashad|splashads|startup|startimage|launch|boot|promotion|promotions|material|materials|creative|creatives|floorads)$/.test(lk)) {
        x[k] = emptyFor(x[k]);
      } else if (/^(hasad|hasads|showad|showads|needad|displayad|enablead|showadvert|hasadvert|isshow)$/.test(lk)) {
        x[k] = false;
      } else {
        x[k] = clean(x[k]);
      }
    }
  }
  return x;
}

try {
  let data = JSON.parse(body || '{}');
  data = clean(data);
  if (/splash|startup|start|launch|advert|ad/i.test(url)) {
    data.ad = null;
    data.ads = [];
    data.advert = null;
    data.adverts = [];
    data.splash = null;
    data.splashAds = [];
    data.materials = [];
    data.show = false;
    data.hasAd = false;
    data.code = data.code || '0';
  }
  $done({ body: JSON.stringify(data) });
} catch (e) {
  $done({ body: '{}' });
}
