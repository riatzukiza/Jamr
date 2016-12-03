# Jamr

This is a little markov chain text generator I wrote a while ago.

To get it to run on the sample inputs:
```sh
node ./run.js -i ./big-input.txt -o ./big-output.txt -n 5 -s 100
```

where n is the amount of context to give the robot, and s is how many words to generate once the model has been built.
the larger the value of n, the more data should be provided, otherwise it will generate nearly exact quotes from the corpus.

the script can also take multi file inputs, for example

```sh
node ./run.js -i ./big-input.txt,./bible.txt -o ./big-output.txt -n 5 -s 100
```

Now you can save and load language models!

here is how you load models:

here is how you save them:
```
node run.js -w ./model.json -i ./text-file.txt -o ./where-ever.txt -n 5 -s 5000
```


```
node run.js -l ./model.json -s 5000 -n 4
```


there is already an example model name called "./model.json", which is a quad gram from godel.txt
