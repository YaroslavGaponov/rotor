MapReduce framework for Node.JS

Add nodes
```
rotor add user@host1
rotor add user@host2
rotor add user@host3

```

Calculate words in text
```
cat ./bundle/example1/book.txt | ./rotor run ./bundle/example1
```

Calculate PI
```
for((i=1;i<=1000;i++)); do echo "$i"; done | ./rotor run ./bundle/example2

``` 