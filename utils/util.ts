import zlib from "zlib";
export const unzip = (value: string): string => {
  const buffer = Buffer.from(value, "base64"); // base64 => Bufferに変換
  const result = zlib.unzipSync(buffer); // 復号化
  const str = decodeURIComponent(result.toString()); // デコード
  return str;
};

export const ordinal = (n: number | undefined) => {
  if (!n) {
    return undefined;
  }
  const s1 = +("" + n).slice(-1);
  const s2 = +("" + n).slice(-2);
  if (s2 >= 11 && s2 <= 13) {
    return n + "th";
  } else if (s1 === 1) {
    return n + "st";
  } else if (s1 === 2) {
    return n + "nd";
  } else if (s1 === 3) {
    return n + "rd";
  } else {
    return n + "th";
  }
};