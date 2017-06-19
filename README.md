# json format
格式化json，如果格式不正确，输出相关错误以及错误位置

# step 1
对json字符序列化。读取token

# step 2
生成AST

```json
{
    "a": "1"
}
```
转化成:
```json
{
    "type": "JSON",
    "body": [{
        "key": "a",
        "value": "1"
    }]
}
```