MapReduce framework for Node.JS

Add nodes
```
rotor add user@host1
rotor add user@host2
rotor add user@host3

```

Calculate words in text
```
cat ./examples/example1/book.txt | ./rotor run ./examples/example1
```

Calculate PI
```
for((i=1;i<=1000;i++)); do echo "$i"; done | ./rotor run ./examples/example2

```

Search word in text
```
cat ./examples/example3/book.txt | ./rotor run ./exampl/example3 the
```