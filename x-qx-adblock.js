/*
X / Twitter 去广告 - Quantumult X script-response-body
目标：移除时间线/搜索/详情接口中的 promoted/ad timeline entry。
*/

let body = $response.body || "";

function lower(s) {
  return String(s || "").toLowerCase();
}

function startsOrContainsPromoted(value) {
  const s = lower(value);
  return s.startsWith("promoted") || s.includes("promoted-tweet") || s.includes("promotedtweet") || s.includes("promoted_");
}

function hasOwnAdMarker(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  for (const key of Object.keys(obj)) {
    const k = lower(key);
    if (
      k === "promotedmetadata" ||
      k === "promoted_metadata" ||
      k === "promotedtweet" ||
      k === "promoted_tweet" ||
      k === "promotedcontent" ||
      k === "promoted_content" ||
      k === "admetadata" ||
      k === "ad_metadata" ||
      k === "advertiserresults" ||
      k === "promotedtrend" ||
      k === "promoted_trend"
    ) return true;
  }
  return false;
}

function isDirectAdNode(node) {
  if (!node || typeof node !== "object") return false;
  if (hasOwnAdMarker(node)) return true;

  const entryId = node.entryId || node.entry_id || node.id || node.sortIndex || "";
  if (startsOrContainsPromoted(entryId)) return true;

  const itemType = node.itemType || node.item_type || node.__typename || "";
  if (startsOrContainsPromoted(itemType)) return true;

  // X 时间线广告通常把 promotedMetadata 放在 content/itemContent 下，
  // 这里只检查当前 entry 的小范围字符串，避免误删整个上层 instructions。
  if (node.content || node.item || node.itemContent) {
    const small = JSON.stringify({ content: node.content, item: node.item, itemContent: node.itemContent }).slice(0, 20000);
    if (
      small.includes("promotedMetadata") ||
      small.includes("promoted_metadata") ||
      small.includes("promotedTweet") ||
      small.includes("promoted_tweet") ||
      small.includes("Promoted")
    ) return true;
  }
  return false;
}

function clean(value) {
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) {
      if (isDirectAdNode(item)) continue;
      out.push(clean(item));
    }
    return out;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      const k = lower(key);
      if (
        k === "promotedmetadata" ||
        k === "promoted_metadata" ||
        k === "promotedtweet" ||
        k === "promoted_tweet" ||
        k === "promotedcontent" ||
        k === "promoted_content" ||
        k === "admetadata" ||
        k === "ad_metadata" ||
        k === "advertiserresults" ||
        k === "promotedtrend" ||
        k === "promoted_trend"
      ) {
        delete value[key];
        continue;
      }
      value[key] = clean(value[key]);
    }
  }
  return value;
}

try {
  const obj = JSON.parse(body);
  body = JSON.stringify(clean(obj));
} catch (e) {
  // 非 JSON 响应直接原样返回
}

$done({ body });
