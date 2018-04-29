/**
 * 
 * @authors purelite (zhuweilei@weidian.com)
 * @date    2018-04-29 14:05:17
 * @version $Id$
 */

function _decodeSourceMap(sourceMap) {
  let mappings = sourceMap.mappings;
  // 每个数组对应转换后(混淆后)的行号, 在mappings用分号隔开
  let uglyLineArr = mappings.split(";");
  uglyLineArr = uglyLineArr.map((line) => {
    // 每一行的每个关键字，用逗号隔开
    let keywordArr = line.split(",");
    return keywordArr;
  })
  uglyLineArr = uglyLineArr.map((keywordArr) => {
    return keywordArr.map((keyword) => {
      return decode(keyword);
    })
  })

  // 把数组里每个关键字的相对位置转化成绝对位置
  fixedMap = getAbsoultePosition(uglyLineArr);

  return fixedMap;
}

function getAbsoultePosition(uglyLineArr) {
  let sourceFileIndex = 0, // second field
    sourceCodeLine = 0, // third field
    sourceCodeColumn = 0, // fourth field
    nameIndex = 0; // fifth field

  let fixedMap = uglyLineArr.map((keywordArr) => {
    let generatedCodeColumn = 0;

    return keywordArr.map((keyword) => {
      let absoluteKeyword = []
      generatedCodeColumn += keyword[0]
      absoluteKeyword.push(generatedCodeColumn);

      sourceFileIndex += keyword[1];
      sourceCodeLine += keyword[2];
      sourceCodeColumn += keyword[3];

      absoluteKeyword.push(sourceFileIndex, sourceCodeLine, sourceCodeColumn)

      if (keyword[4] !== undefined) {
        nameIndex += keyword[4];
        absoluteKeyword.push(nameIndex);
      }

      return absoluteKeyword;
    })
  })

  return fixedMap;

}

function _fixPosDetail(line, col, map, names, sources) {
  let colIndexInMap = col - 1;

  let lineMap = map[line - 1];
  let keywordMap;
  lineMap.some((keyword) => {
    if (keyword[0] === col - 1) {
      keywordMap = keyword;
      return true;
    }
    return false;
  })

  let sourceCodeLine = keywordMap[2] + 1;
  let sourceCodeColumn = keywordMap[3] + 1;
  let sourceFile = sources[keywordMap[1]];

  let sourceName = "";
  if (keywordMap[4] !== undefined) {
    sourceName = names[keywordMap[4]]
  }

  return {
    sourceCodeLine,
    sourceCodeColumn,
    sourceFile,
    sourceName,
  }
}

module.exports = {
  decodeSourceMap:_decodeSourceMap,
  fixPosDetail:_fixPosDetail
}