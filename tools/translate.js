const {pinyin} = require("pinyin");

function chineseToI18nKey(chineseStr) {
  const words = pinyin(chineseStr, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false
  }).flat();

  return words.map((word, index) => {
    if (index === 0) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join("");
}

const chineseText = "你好世界久啊乐凯大街付了款";
const i18nKey = chineseToI18nKey(chineseText);

console.log(i18nKey);  // Output: niHaoShiJie
