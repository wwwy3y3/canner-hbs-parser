# canner-hbs-parser
# API
## findMustache (source, skipBlock)
return an array with all mustache nodes
### parameters
*	source{String}: string you want to find mustaches
*	skipBlock{Boolean}: wether you want to skip inblock mustache node or not

## warpWith (source, startStr, endStr)
wrap source string with startStr and endStr

## encloseHtmlTag (source, tag, attributes)
enclose all mustache(not including inblock ones) with html tag

## cnWrapHtml(source, data)
wrap the body with cn tag, not head
add compile with data
return html

# todo
- [ ] add more tests
- [ ] 圖片要加上attribute可以辨識讓他上傳